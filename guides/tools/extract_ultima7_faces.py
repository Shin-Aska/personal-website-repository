#!/usr/bin/env python3
"""Extract Ultima VII conversation portraits from FACES.VGA.

The script reads the original Flex archive and RLE shape format directly. It is
kept in the repository so the web assets can be regenerated from a local,
legally owned Black Gate installation without downloading third-party artwork.
"""

from __future__ import annotations

import argparse
import struct
from pathlib import Path

from PIL import Image, ImageDraw


FLEX_TABLE_OFFSET = 0x80
COMPANION_FACES = {
    1: "iolo",
    2: "spark",
    3: "shamino",
    4: "dupre",
    5: "jaana",
    7: "sentri",
    8: "julia",
    9: "katrina",
    10: "tseramed",
}
PARTY_FACES = {0: "avatar", **COMPANION_FACES}


def read_u16(data: bytes, offset: int) -> int:
    return struct.unpack_from("<H", data, offset)[0]


def read_i16(data: bytes, offset: int) -> int:
    return struct.unpack_from("<h", data, offset)[0]


def read_u32(data: bytes, offset: int) -> int:
    return struct.unpack_from("<I", data, offset)[0]


def flex_entries(data: bytes) -> list[bytes]:
    count = read_u32(data, 0x54)
    entries: list[bytes] = []
    for index in range(count):
        table_offset = FLEX_TABLE_OFFSET + index * 8
        offset = read_u32(data, table_offset)
        size = read_u32(data, table_offset + 4)
        entries.append(data[offset : offset + size] if offset and size else b"")
    return entries


def decode_frame(shape: bytes, frame_number: int = 0) -> tuple[Image.Image, tuple[int, int]]:
    shape_size = read_u32(shape, 0)
    header_size = read_u32(shape, 4)
    if shape_size not in (len(shape), len(shape) - 1):
        raise ValueError("Flat 8x8 shapes are not supported by this portrait extractor")

    frame_count = (header_size - 4) // 4
    if not 0 <= frame_number < frame_count:
        raise IndexError(f"Frame {frame_number} outside 0..{frame_count - 1}")

    frame_offset = header_size if frame_number == 0 else read_u32(shape, frame_number * 4 + 4)
    right = read_u16(shape, frame_offset)
    left = read_u16(shape, frame_offset + 2)
    above = read_u16(shape, frame_offset + 4)
    below = read_u16(shape, frame_offset + 6)
    width = left + right + 1
    height = above + below + 1

    pixels = bytearray([255] * (width * height))
    cursor = frame_offset + 8
    while True:
        scan = read_u16(shape, cursor)
        cursor += 2
        if scan == 0:
            break
        encoded = bool(scan & 1)
        scan_length = scan >> 1
        x = read_i16(shape, cursor)
        y = read_i16(shape, cursor + 2)
        cursor += 4
        destination = (above + y) * width + (left + x)

        if encoded:
            remaining = scan_length
            while remaining:
                block = shape[cursor]
                cursor += 1
                repeated = bool(block & 1)
                block_length = block >> 1
                if repeated:
                    value = shape[cursor]
                    cursor += 1
                    pixels[destination : destination + block_length] = bytes([value]) * block_length
                else:
                    pixels[destination : destination + block_length] = shape[cursor : cursor + block_length]
                    cursor += block_length
                destination += block_length
                remaining -= block_length
        else:
            pixels[destination : destination + scan_length] = shape[cursor : cursor + scan_length]
            cursor += scan_length

    return Image.frombytes("P", (width, height), bytes(pixels)), (left, above)


def load_palette(path: Path) -> list[int]:
    data = path.read_bytes()
    if len(data) != 768:
        data = flex_entries(data)[0]
    if len(data) != 768:
        raise ValueError(f"Expected a 768-byte palette, found {len(data)} bytes")
    return [min(channel * 4, 255) for channel in data]


def rgba_portrait(shape: bytes, palette: list[int], frame_number: int = 0) -> Image.Image:
    indexed, _origin = decode_frame(shape, frame_number)
    raw_pixels = indexed.tobytes()
    indexed.putpalette(palette)
    alpha = Image.frombytes("L", indexed.size, bytes(0 if value == 255 else 255 for value in raw_pixels))
    portrait = indexed.convert("RGBA")
    portrait.putalpha(alpha)
    return portrait


def create_contact_sheet(entries: list[bytes], palette: list[int], output: Path) -> None:
    tile_width, tile_height = 112, 128
    columns = 8
    rows = (len(entries) + columns - 1) // columns
    sheet = Image.new("RGBA", (columns * tile_width, rows * tile_height), (20, 24, 31, 255))
    draw = ImageDraw.Draw(sheet)
    for index, entry in enumerate(entries):
        if not entry:
            continue
        try:
            portrait = rgba_portrait(entry, palette)
        except (ValueError, IndexError, struct.error):
            continue
        portrait.thumbnail((96, 96), Image.Resampling.NEAREST)
        x = (index % columns) * tile_width + (tile_width - portrait.width) // 2
        y = (index // columns) * tile_height + 6
        sheet.alpha_composite(portrait, (x, y))
        draw.text(((index % columns) * tile_width + 6, (index // columns) * tile_height + 106), str(index), fill="white")
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("faces", type=Path, help="Path to Black Gate STATIC/FACES.VGA")
    parser.add_argument("palette", type=Path, help="Path to STATIC/PALETTES.FLX or a raw .PAL")
    parser.add_argument("output", type=Path, help="Output directory, or PNG path with --contact-sheet")
    parser.add_argument("indices", nargs="*", type=int, help="Face indices to export (all when omitted)")
    parser.add_argument("--contact-sheet", action="store_true", help="Render all face indices into one labelled PNG")
    parser.add_argument("--companions", action="store_true", help="Export the nine recruitable companions with readable names")
    parser.add_argument("--party", action="store_true", help="Export the Avatar and recruitable companions with readable names")
    args = parser.parse_args()

    entries = flex_entries(args.faces.read_bytes())
    palette = load_palette(args.palette)
    if args.contact_sheet:
        create_contact_sheet(entries, palette, args.output)
        return

    args.output.mkdir(parents=True, exist_ok=True)
    named_faces = PARTY_FACES if args.party else (COMPANION_FACES if args.companions else None)
    indices = list(named_faces) if named_faces else (args.indices or list(range(len(entries))))
    for index in indices:
        if not 0 <= index < len(entries) or not entries[index]:
            continue
        portrait = rgba_portrait(entries[index], palette)
        filename = f"{named_faces[index]}.png" if named_faces else f"face-{index:03d}.png"
        portrait.save(args.output / filename)


if __name__ == "__main__":
    main()
