#!/usr/bin/env python3
"""Generate Ultima V atlas assets from an original DOS installation.

This script intentionally uses only the Python standard library. It reads the
original data in place and writes derived PNG/JavaScript assets to the guide;
it never copies or modifies the source game files.
"""

from __future__ import annotations

import argparse
import json
import re
import struct
import zlib
from pathlib import Path


MAP_SIZE = 256
CHUNKS_PER_SIDE = 16
CHUNK_SIZE = 16
TILE_SIZE = 16
WATER_TILE = 0x01

EGA_PALETTE = (
    (0x00, 0x00, 0x00),
    (0x00, 0x00, 0xAA),
    (0x00, 0xAA, 0x00),
    (0x00, 0xAA, 0xAA),
    (0xAA, 0x00, 0x00),
    (0xAA, 0x00, 0xAA),
    (0xAA, 0x55, 0x00),
    (0xAA, 0xAA, 0xAA),
    (0x55, 0x55, 0x55),
    (0x55, 0x55, 0xFF),
    (0x55, 0xFF, 0x55),
    (0x55, 0xFF, 0xFF),
    (0xFF, 0x55, 0x55),
    (0xFF, 0x55, 0xFF),
    (0xFF, 0xFF, 0x55),
    (0xFF, 0xFF, 0xFF),
)

LOCATION_NAMES = (
    "Moonglow",
    "Britain",
    "Jhelom",
    "Yew",
    "Minoc",
    "Trinsic",
    "Skara Brae",
    "New Magincia",
    "Fogsbane",
    "Stormcrow",
    "Greyhaven",
    "Waveguide",
    "Iolo's Hut",
    "Sutek's Hut",
    "Sin'Vraal's Hut",
    "Grendel's Hut",
    "Lord British's Castle",
    "Palace of Blackthorn",
    "West Britanny",
    "North Britanny",
    "East Britanny",
    "Paws",
    "Cove",
    "Buccaneer's Den",
    "Ararat",
    "Bordermarch",
    "Farthing",
    "Windemere",
    "Stonegate",
    "Lycaeum",
    "Empath Abbey",
    "Serpent's Hold",
    "Deceit",
    "Despise",
    "Destard",
    "Wrong",
    "Covetous",
    "Shame",
    "Hythloth",
    "Doom",
)

VIRTUES = (
    ("Honesty", "AHM"),
    ("Compassion", "MU"),
    ("Valor", "RA"),
    ("Justice", "BEH"),
    ("Sacrifice", "CAH"),
    ("Honor", "SUMM"),
    ("Spirituality", "OM"),
    ("Humility", "LUM"),
)

MOONGATE_DESTINATIONS = (
    "Moonglow",
    "Britain",
    "Jhelom",
    "Yew",
    "Minoc",
    "Trinsic",
    "Skara Brae",
    "New Magincia",
)

SMALL_MAP_FILES = {
    "CASTLE.DAT": (
        (17, (-1, 0, 1, 2, 3)),
        (18, (-1, 0, 1, 2, 3)),
        (19, (0,)), (20, (0,)), (21, (0,)), (22, (0,)),
        (23, (0,)), (24, (0,)),
    ),
    "TOWNE.DAT": tuple((index, (0, 1)) for index in range(1, 9)),
    "DWELLING.DAT": (
        (9, (0, 1, 2)), (10, (0, 1, 2)), (11, (0, 1, 2)),
        (12, (0, 1, 2)), (13, (0,)), (14, (0,)), (15, (0,)),
        (16, (0,)),
    ),
    "KEEP.DAT": (
        (25, (0, 1)), (26, (0, 1)), (27, (0,)), (28, (0,)),
        (29, (0,)), (30, (0, 1, 2)), (31, (0, 1, 2)),
        (32, (-1, 0, 1)),
    ),
}

DUNGEON_TILE_SPRITES = {
    0x0: 0, 0x1: 200, 0x2: 201, 0x3: 200, 0x4: 257,
    0x5: 216, 0x6: 4, 0x7: 257, 0x8: 490, 0xA: 250,
    0xB: 79, 0xC: 77, 0xD: 151, 0xE: 184, 0xF: 0,
}

NPC_SPECIALISTS = {
    0x81: "Blacksmith",
    0x82: "Barkeeper",
    0x83: "Horse seller",
    0x84: "Shipwright",
    0x85: "Magic seller",
    0x86: "Guild master",
    0x87: "Healer",
    0x88: "Innkeeper",
    0xFD: "Wishing well",
    0xFE: "Guard",
}


class LsbBitReader:
    def __init__(self, data: bytes) -> None:
        self.data = data
        self.bits_read = 0

    def read(self, width: int) -> int:
        byte_index = self.bits_read >> 3
        if byte_index >= len(self.data):
            raise ValueError("LZW stream ended before the end marker")
        word = 0
        for offset in range(3):
            index = byte_index + offset
            if index < len(self.data):
                word |= self.data[index] << (offset * 8)
        code = (word >> (self.bits_read & 7)) & ((1 << width) - 1)
        self.bits_read += width
        return code


def decompress_lzw(file_data: bytes) -> bytes:
    if len(file_data) < 6:
        raise ValueError("LZW file is too short")
    expected_length = struct.unpack_from("<I", file_data)[0]
    reader = LsbBitReader(file_data[4:])
    output = bytearray()
    prefix = [0] * 4096
    root = [0] * 4096
    width = 9
    next_free = 0x102
    dictionary_size = 0x200
    previous = -1

    def build_string(code: int) -> list[int]:
        stack: list[int] = []
        while code > 0xFF:
            stack.append(root[code])
            code = prefix[code]
        stack.append(code & 0xFF)
        return stack

    while True:
        current = reader.read(width)
        if current == 0x101:
            break
        if current == 0x100:
            width = 9
            next_free = 0x102
            dictionary_size = 0x200
            first = reader.read(width)
            output.append(first & 0xFF)
            previous = first
            continue

        if previous < 0:
            raise ValueError("LZW stream did not start with a dictionary reset")

        if current < next_free:
            stack = build_string(current)
            first_character = stack[-1]
            output.extend(reversed(stack))
        else:
            if current != next_free:
                raise ValueError("Invalid forward LZW dictionary reference")
            stack = build_string(previous)
            first_character = stack[-1]
            output.extend(reversed(stack))
            output.append(first_character)

        if next_free >= len(prefix):
            raise ValueError("LZW dictionary exceeded 12 bits")
        prefix[next_free] = previous
        root[next_free] = first_character
        next_free += 1
        if next_free >= dictionary_size and width < 12:
            width += 1
            dictionary_size *= 2
        previous = current

        if len(output) > expected_length:
            raise ValueError("LZW output exceeded the declared length")

    if len(output) != expected_length:
        raise ValueError(
            f"LZW output length {len(output)} did not match {expected_length}"
        )
    return bytes(output)


def decode_tiles(tile_file: bytes) -> list[tuple[bytes, ...]]:
    unpacked = decompress_lzw(tile_file)
    expected = 512 * 128
    if len(unpacked) != expected:
        raise ValueError(f"TILES.16 expanded to {len(unpacked)} bytes, expected {expected}")

    tiles: list[tuple[bytes, ...]] = []
    for tile_index in range(512):
        tile_start = tile_index * 128
        rows: list[bytes] = []
        for y in range(TILE_SIZE):
            rgb = bytearray()
            row_start = tile_start + y * 8
            for packed in unpacked[row_start : row_start + 8]:
                rgb.extend(EGA_PALETTE[(packed >> 4) & 0x0F])
                rgb.extend(EGA_PALETTE[packed & 0x0F])
            rows.append(bytes(rgb))
        tiles.append(tuple(rows))
    return tiles


def decode_large_map(dat: bytes, overlay: bytes | None) -> list[bytearray]:
    if overlay is not None and len(overlay) != 256:
        raise ValueError("Britannia chunk overlay must contain 256 bytes")

    world = [bytearray(MAP_SIZE) for _ in range(MAP_SIZE)]
    source_index = 0
    for chunk in range(256):
        chunk_x = (chunk % CHUNKS_PER_SIDE) * CHUNK_SIZE
        chunk_y = (chunk // CHUNKS_PER_SIDE) * CHUNK_SIZE
        water_only = overlay is not None and overlay[chunk] == 0xFF
        for local_y in range(CHUNK_SIZE):
            row = world[chunk_y + local_y]
            if water_only:
                row[chunk_x : chunk_x + CHUNK_SIZE] = bytes([WATER_TILE]) * CHUNK_SIZE
                continue
            end = source_index + CHUNK_SIZE
            if end > len(dat):
                raise ValueError("Map data ended inside a chunk")
            row[chunk_x : chunk_x + CHUNK_SIZE] = dat[source_index:end]
            source_index = end

    if source_index != len(dat):
        raise ValueError(f"Map parser consumed {source_index} of {len(dat)} bytes")
    return world


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    return (
        struct.pack(">I", len(payload))
        + kind
        + payload
        + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
    )


def write_world_png(
    output_path: Path,
    world: list[bytearray],
    tiles: list[tuple[bytes, ...]],
) -> None:
    width = MAP_SIZE * TILE_SIZE
    height = width
    compressor = zlib.compressobj(level=9)
    compressed_parts: list[bytes] = []

    for map_y in range(MAP_SIZE):
        tile_row = world[map_y]
        for pixel_y in range(TILE_SIZE):
            scanline = bytearray([0])
            for tile_index in tile_row:
                scanline.extend(tiles[tile_index][pixel_y])
            part = compressor.compress(scanline)
            if part:
                compressed_parts.append(part)
    compressed_parts.append(compressor.flush())

    output_path.parent.mkdir(parents=True, exist_ok=True)
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    with output_path.open("wb") as png:
        png.write(b"\x89PNG\r\n\x1a\n")
        png.write(png_chunk(b"IHDR", header))
        for part in compressed_parts:
            if part:
                png.write(png_chunk(b"IDAT", part))
        png.write(png_chunk(b"IEND", b""))


def write_tile_map_png(
    output_path: Path,
    tile_map: list[bytes | list[int]],
    tiles: list[tuple[bytes, ...]],
    scale: int = 1,
) -> None:
    """Render a small row-major tile map with nearest-neighbour enlargement."""
    if not tile_map or not tile_map[0]:
        raise ValueError("Cannot render an empty tile map")
    map_width = len(tile_map[0])
    map_height = len(tile_map)
    if any(len(row) != map_width for row in tile_map):
        raise ValueError("Tile map rows have inconsistent widths")

    width = map_width * TILE_SIZE * scale
    height = map_height * TILE_SIZE * scale
    compressor = zlib.compressobj(level=9)
    compressed_parts: list[bytes] = []
    for tile_row in tile_map:
        for pixel_y in range(TILE_SIZE):
            scanline = bytearray([0])
            for tile_index in tile_row:
                source = tiles[tile_index][pixel_y]
                if scale == 1:
                    scanline.extend(source)
                else:
                    for pixel in range(0, len(source), 3):
                        scanline.extend(source[pixel : pixel + 3] * scale)
            rendered = bytes(scanline)
            for _ in range(scale):
                part = compressor.compress(rendered)
                if part:
                    compressed_parts.append(part)
    compressed_parts.append(compressor.flush())

    output_path.parent.mkdir(parents=True, exist_ok=True)
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    with output_path.open("wb") as png:
        png.write(b"\x89PNG\r\n\x1a\n")
        png.write(png_chunk(b"IHDR", header))
        for part in compressed_parts:
            if part:
                png.write(png_chunk(b"IDAT", part))
        png.write(png_chunk(b"IEND", b""))


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def floor_label(level: int, dungeon: bool = False) -> str:
    if dungeon:
        return f"Level {level + 1}"
    if level < 0:
        return "Basement"
    if level == 0:
        return "Main floor"
    return f"Floor {level}"


def decode_talk_names(talk_data: bytes, data_ovl: bytes) -> dict[int, str]:
    compressed = data_ovl[0x104C : 0x104C + 0x24E]
    words = [part.decode("cp437") for part in compressed.split(b"\0") if part]
    word_lookup: dict[int, int] = {}
    adjustment = 0
    for start, stop in ((1, 7), (9, 27), (29, 49), (51, 64), (66, 66), (68, 69), (71, 71)):
        adjustment -= 1
        for value in range(start, stop + 1):
            word_lookup[value] = value + adjustment
    adjustment -= 4
    for value in range(76, 130):
        word_lookup[value] = value + adjustment

    def decode_name(script: bytes) -> str:
        output = ""
        writing_characters = False
        for value in script:
            if value == 0:
                break
            if 165 <= value <= 218 or 225 <= value <= 250 or 160 <= value <= 161:
                character = value - 0x80
                if character != ord("@"):
                    output += chr(character)
                writing_characters = True
            elif value in word_lookup and word_lookup[value] < len(words):
                if writing_characters:
                    output += " "
                output += words[word_lookup[value]] + " "
                writing_characters = False
            else:
                if writing_characters:
                    output += " "
                writing_characters = False
        return " ".join(output.split()).strip(" .")

    if len(talk_data) < 2:
        return {}
    entry_count = struct.unpack_from("<H", talk_data)[0]
    offsets: list[tuple[int, int]] = []
    for index in range(entry_count):
        npc_index, file_offset = struct.unpack_from("<HH", talk_data, 2 + index * 4)
        offsets.append((npc_index, file_offset))
    names: dict[int, str] = {}
    for index, (npc_index, file_offset) in enumerate(offsets):
        end = offsets[index + 1][1] if index + 1 < len(offsets) else len(talk_data)
        name = decode_name(talk_data[file_offset:end])
        if name and not name.startswith("..."):
            names[npc_index] = name
    return names


def npc_schedule_index(times: list[int], hour: int) -> int:
    if not any(times):
        return 0
    for index, scheduled_hour in enumerate(times):
        if scheduled_hour == hour:
            return 1 if index == 3 else index
    if hour > times[3] and hour < times[0]:
        return 1
    if hour > times[0] and hour < times[1]:
        return 0
    if hour > times[1] and hour < times[2]:
        return 1
    if hour > times[2] and hour < times[3]:
        return 2
    earliest_index = min(range(4), key=times.__getitem__)
    previous_to_earliest = 1 if earliest_index == 0 else earliest_index - 1
    latest_index = max(range(4), key=times.__getitem__)
    if hour < times[earliest_index]:
        return previous_to_earliest
    if hour > times[latest_index]:
        return 1 if latest_index == 3 else latest_index
    raise ValueError(f"Could not resolve NPC schedule for hour {hour} and times {times}")


def build_npcs_for_master(
    source: Path,
    data_ovl: bytes,
    dat_filename: str,
    locations: tuple[tuple[int, tuple[int, ...]], ...],
) -> dict[int, list[dict[str, object]]]:
    stem = dat_filename.removesuffix(".DAT")
    npc_data = require_file(source, f"{stem}.NPC")
    talk_names = decode_talk_names(require_file(source, f"{stem}.TLK"), data_ovl)
    expected_size = 8 * 576
    if len(npc_data) != expected_size:
        raise ValueError(f"{stem}.NPC contains {len(npc_data)} bytes, expected {expected_size}")

    by_location: dict[int, list[dict[str, object]]] = {}
    for location_index, (location_id, levels) in enumerate(locations):
        location_offset = location_index * 576
        residents: list[dict[str, object]] = []
        for npc_index in range(32):
            schedule_offset = location_offset + npc_index * 16
            schedule = npc_data[schedule_offset : schedule_offset + 16]
            npc_type = npc_data[location_offset + 512 + npc_index]
            dialog = npc_data[location_offset + 544 + npc_index]
            is_guard = 112 <= npc_type <= 115
            specialist = NPC_SPECIALISTS.get(dialog) or NPC_SPECIALISTS.get(npc_type)
            name = talk_names.get(dialog, "") if 0 < dialog < 0x81 else ""
            if not name and is_guard:
                name = "Guard"
            if not name and specialist:
                name = specialist
            if not name:
                continue

            x_positions = list(schedule[3:6])
            y_positions = list(schedule[6:9])
            floors = [-1 if value == 0xFF else value for value in schedule[9:12]]
            times = list(schedule[12:16])
            hourly_positions = []
            for hour in range(24):
                schedule_index = npc_schedule_index(times, hour)
                floor = floors[schedule_index]
                if floor not in levels:
                    continue
                hourly_positions.append({
                    "hour": hour,
                    "x": x_positions[schedule_index],
                    "y": y_positions[schedule_index],
                    "floor": floor,
                })
            if not hourly_positions:
                continue
            residents.append({
                "id": f"npc-{location_id}-{npc_index}",
                "name": name,
                "role": specialist or ("Guard" if is_guard else "Resident"),
                "schedule": hourly_positions,
            })
        by_location[location_id] = residents
    return by_location


def build_small_floor_transitions(
    level: int,
    level_maps: dict[int, list[bytes]],
) -> list[dict[str, object]]:
    transitions: list[dict[str, object]] = []
    lower_exists = level - 1 in level_maps
    higher_exists = level + 1 in level_maps
    for y, row in enumerate(level_maps[level]):
        for x, tile in enumerate(row):
            direction = ""
            transition_type = ""
            if tile == 200 and higher_exists:
                direction, transition_type = "up", "ladder"
            elif tile == 201 and lower_exists:
                direction, transition_type = "down", "ladder"
            elif tile == 134 and lower_exists:
                direction, transition_type = "down", "grate"
            elif 196 <= tile <= 199:
                transition_type = "stairs"
                if not lower_exists and higher_exists:
                    direction = "up"
                elif lower_exists and not higher_exists:
                    direction = "down"
                elif lower_exists and higher_exists:
                    lower_tile = level_maps[level - 1][y][x]
                    direction = "down" if 196 <= lower_tile <= 199 else "up"
            if not direction:
                continue
            target = level + 1 if direction == "up" else level - 1
            transitions.append({
                "id": f"transition-{level}-{x}-{y}-{direction}",
                "type": transition_type,
                "direction": direction,
                "targetFloor": str(target),
                "position": {"x": x, "y": y},
                "label": f"{transition_type.title()} {direction} to {floor_label(target)}",
            })
    return transitions


def build_interior_maps(
    source: Path,
    output: Path,
    tiles: list[tuple[bytes, ...]],
    data_ovl: bytes,
) -> list[dict[str, object]]:
    interiors: list[dict[str, object]] = []

    for filename, locations in SMALL_MAP_FILES.items():
        raw = require_file(source, filename)
        npcs_by_location = build_npcs_for_master(source, data_ovl, filename, locations)
        expected = 16 * 32 * 32
        if len(raw) != expected:
            raise ValueError(f"{filename} contains {len(raw)} bytes, expected {expected}")
        offset = 0
        for location_id, levels in locations:
            name = LOCATION_NAMES[location_id - 1]
            slug = slugify(name)
            floor_entries: list[dict[str, object]] = []
            level_maps: dict[int, list[bytes]] = {}
            for level in levels:
                block = raw[offset : offset + 1024]
                if len(block) != 1024:
                    raise ValueError(f"{filename} ended while decoding {name}")
                offset += 1024
                tile_map = [block[row * 32 : (row + 1) * 32] for row in range(32)]
                level_maps[level] = tile_map
            for level in levels:
                tile_map = level_maps[level]
                level_slug = "basement" if level < 0 else f"floor-{level}"
                relative_url = f"images/ultima5-atlas/{slug}-{level_slug}.png"
                write_tile_map_png(output / relative_url, tile_map, tiles)
                floor_entries.append({
                    "id": str(level), "level": level, "label": floor_label(level),
                    "imageUrl": relative_url, "width": 32, "height": 32,
                    "transitions": build_small_floor_transitions(level, level_maps),
                })
            interiors.append({
                "id": f"location-{location_id}", "locationId": location_id,
                "name": name, "type": location_type(location_id),
                "description": "Complete floor maps decoded from the original Ultima V location data.",
                "npcs": npcs_by_location.get(location_id, []),
                "floors": floor_entries,
            })
        if offset != len(raw):
            raise ValueError(f"{filename} parser consumed {offset} of {len(raw)} bytes")

    raw_dungeons = require_file(source, "DUNGEON.DAT")
    if len(raw_dungeons) != 8 * 8 * 8 * 8:
        raise ValueError("DUNGEON.DAT does not contain eight complete eight-level dungeons")
    for dungeon_index, location_id in enumerate(range(33, 41)):
        name = LOCATION_NAMES[location_id - 1]
        slug = slugify(name)
        floor_entries: list[dict[str, object]] = []
        for level in range(8):
            offset = (dungeon_index * 8 + level) * 64
            block = raw_dungeons[offset : offset + 64]
            tile_map: list[bytes | list[int]] = []
            transitions: list[dict[str, object]] = []
            for row_index in range(8):
                row = block[row_index * 8 : (row_index + 1) * 8]
                rendered_row: list[int] = []
                for x, dungeon_tile in enumerate(row):
                    tile_type = dungeon_tile >> 4
                    if tile_type == 0 and (dungeon_tile & 0x0F) == 8:
                        tile_type = 1
                    rendered_row.append(DUNGEON_TILE_SPRITES.get(tile_type, 0))
                    directions = []
                    if tile_type in (1, 3) and level > 0:
                        directions.append(("up", level - 1))
                    if tile_type in (2, 3) and level < 7:
                        directions.append(("down", level + 1))
                    for direction, target in directions:
                        transitions.append({
                            "id": f"transition-{level}-{x}-{row_index}-{direction}",
                            "type": "ladder",
                            "direction": direction,
                            "targetFloor": str(target),
                            "position": {"x": x, "y": row_index},
                            "label": f"Ladder {direction} to {floor_label(target, dungeon=True)}",
                        })
                tile_map.append(rendered_row)
            relative_url = f"images/ultima5-atlas/{slug}-level-{level + 1}.png"
            write_tile_map_png(output / relative_url, tile_map, tiles, scale=4)
            floor_entries.append({
                "id": str(level), "level": level, "label": floor_label(level, dungeon=True),
                "imageUrl": relative_url, "width": 8, "height": 8,
                "transitions": transitions,
            })
        interiors.append({
            "id": f"location-{location_id}", "locationId": location_id,
            "name": name, "type": "dungeon",
            "description": "All eight dungeon levels decoded from DUNGEON.DAT; doors, ladders, walls, traps, fields, fountains, and chests retain their original tiles.",
            "floors": floor_entries,
        })
    return interiors


def location_type(index: int) -> str:
    if 1 <= index <= 8 or 19 <= index <= 24:
        return "city"
    if 17 <= index <= 18:
        return "castle"
    if 26 <= index <= 32:
        return "keep"
    if 33 <= index <= 40:
        return "dungeon"
    return "site"


def location_layer(index: int) -> str:
    if index in (25, 40):
        return "underworld"
    return "surface"


def make_marker(
    name: str,
    marker_type: str,
    layer: str,
    x: int,
    y: int,
    description: str,
    **extra: object,
) -> dict[str, object]:
    marker: dict[str, object] = {
        "name": name,
        "type": marker_type,
        "layer": layer,
        "position": {"x": x, "y": y},
        "description": description,
    }
    marker.update(extra)
    return marker


def build_markers(data_ovl: bytes, initial_save: bytes) -> list[dict[str, object]]:
    location_x = data_ovl[0x1E9A : 0x1E9A + 40]
    location_y = data_ovl[0x1EC2 : 0x1EC2 + 40]
    if len(location_x) != 40 or len(location_y) != 40:
        raise ValueError("DATA.OVL does not contain the expected location coordinates")

    markers: list[dict[str, object]] = []
    for index, (name, x, y) in enumerate(
        zip(LOCATION_NAMES, location_x, location_y), start=1
    ):
        layer = location_layer(index)
        if index == 40:
            description = "The final dungeon at the heart of the Underworld. Word of Power: VERAMOCOR."
        elif index >= 33:
            description = f"Entrance to Dungeon {name}."
        elif index == 25:
            description = "The wreck of the HMS Cape in the Underworld; Johne can be recruited here."
        else:
            description = f"Enterable location recorded in the original Ultima V world data."
        markers.append(
            make_marker(
                name,
                location_type(index),
                layer,
                x,
                y,
                description,
                locationId=index,
                interiorId=f"location-{index}",
            )
        )

        if 33 <= index <= 39:
            markers.append(
                make_marker(
                    f"{name} — Underworld connection",
                    "dungeon",
                    "underworld",
                    x,
                    y,
                    f"The Underworld connection beneath Dungeon {name}.",
                    locationId=index,
                    interiorId=f"location-{index}",
                )
            )

    shrine_x = data_ovl[0x1F7E : 0x1F86]
    shrine_y = data_ovl[0x1F86 : 0x1F8E]
    for (virtue, mantra), x, y in zip(VIRTUES, shrine_x, shrine_y):
        if virtue == "Spirituality" and x == 0 and y == 0:
            continue
        markers.append(
            make_marker(
                f"Shrine of {virtue}",
                "shrine",
                "surface",
                x,
                y,
                f"Virtue: {virtue}. Mantra: {mantra}.",
            )
        )

    if len(initial_save) < 0x2AA:
        raise ValueError("INIT.GAM is too short to contain the moonstone table")
    moon_x = initial_save[0x28A:0x292]
    moon_y = initial_save[0x292:0x29A]
    moon_buried = initial_save[0x29A:0x2A2]
    moon_z = initial_save[0x2A2:0x2AA]
    for phase, (destination, x, y, buried, z) in enumerate(
        zip(MOONGATE_DESTINATIONS, moon_x, moon_y, moon_buried, moon_z), start=1
    ):
        if buried != 0:
            continue
        layer = "underworld" if z == 0xFF else "surface"
        markers.append(
            make_marker(
                f"{destination} Moongate",
                "moongate",
                layer,
                x,
                y,
                f"Initial moonstone position. Phase {phase} travels to {destination}.",
                phase=phase,
            )
        )

    # Quest locations documented by the guide, expressed in native U5 tile coordinates.
    quest_markers = (
        ("Shrine of the Codex", "quest", "surface", 233, 233, "The Codex of Ultimate Wisdom."),
        ("Waterfall to the Underworld", "passage", "surface", 54, 137, "A direct passage between Britannia and the Underworld."),
        ("Nightshade", "reagent", "surface", 44, 137, "Nightshade grows here at midnight."),
        ("Mandrake Root", "reagent", "surface", 182, 54, "Mandrake root grows here at midnight."),
        ("Glass Sword Cache", "treasure", "surface", 64, 80, "A hidden glass sword cache in the Serpent's Spine."),
        ("Mystic Arms", "treasure", "underworld", 233, 233, "The Mystic Arms are hidden in the far southeast Underworld."),
        ("Shard of Falsehood", "quest", "underworld", 192, 80, "The shard associated with Faulinei."),
        ("Shard of Hatred", "quest", "underworld", 130, 65, "The shard associated with Astaroth."),
        ("Shard of Cowardice", "quest", "underworld", 176, 184, "The shard associated with Nosfentor."),
        ("Lord British's Amulet", "quest", "underworld", 105, 225, "The amulet needed to navigate the Abyss and Doom."),
        ("Waterfall to Britannia", "passage", "underworld", 54, 137, "The waterfall passage back to Britannia."),
    )
    for name, marker_type, layer, x, y, description in quest_markers:
        markers.append(make_marker(name, marker_type, layer, x, y, description))

    return markers


def write_atlas_data(
    output_path: Path,
    markers: list[dict[str, object]],
    interiors: list[dict[str, object]],
) -> None:
    config = {
        "worldSize": 256,
        "layers": [
            {
                "id": "surface",
                "name": "Britannia Surface",
                "imageUrl": "images/U5GameWorld.png",
            },
            {
                "id": "underworld",
                "name": "The Underworld",
                "imageUrl": "images/U5GameUnderworld.png",
            },
        ],
        "markers": markers,
        "interiors": interiors,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(config, indent=4, ensure_ascii=False)
    output_path.write_text(
        "// Generated from the original Ultima V data by tools/generate_ultima5_atlas.py.\n"
        f"window.ULTIMA5_ATLAS_CONFIG = {payload};\n",
        encoding="utf-8",
    )


def require_file(source: Path, name: str) -> bytes:
    path = source / name
    if not path.is_file():
        raise FileNotFoundError(f"Required Ultima V file not found: {path}")
    return path.read_bytes()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Ultima V DOS installation directory")
    parser.add_argument("output", type=Path, help="Guide directory containing images/ and js/")
    args = parser.parse_args()

    source = args.source.resolve()
    output = args.output.resolve()
    data_ovl = require_file(source, "DATA.OVL")
    tiles = decode_tiles(require_file(source, "TILES.16"))
    overlay = data_ovl[0x3886:0x3986]
    britannia = decode_large_map(require_file(source, "BRIT.DAT"), overlay)
    underworld = decode_large_map(require_file(source, "UNDER.DAT"), None)

    write_world_png(output / "images/U5GameWorld.png", britannia, tiles)
    write_world_png(output / "images/U5GameUnderworld.png", underworld, tiles)
    markers = build_markers(data_ovl, require_file(source, "INIT.GAM"))
    interiors = build_interior_maps(source, output, tiles, data_ovl)
    write_atlas_data(output / "js/Ultima5AtlasData.js", markers, interiors)

    print("Generated Ultima V atlas assets:")
    print(f"  {output / 'images/U5GameWorld.png'}")
    print(f"  {output / 'images/U5GameUnderworld.png'}")
    print(f"  {output / 'images/ultima5-atlas'} ({sum(len(item['floors']) for item in interiors)} floor maps)")
    npc_count = sum(len(item.get('npcs', [])) for item in interiors)
    transition_count = sum(len(floor.get('transitions', [])) for item in interiors for floor in item['floors'])
    print(f"  {output / 'js/Ultima5AtlasData.js'} ({len(markers)} markers, {len(interiors)} interiors, {npc_count} NPCs, {transition_count} floor links)")


if __name__ == "__main__":
    main()
