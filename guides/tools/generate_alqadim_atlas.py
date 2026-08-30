#!/usr/bin/env python3
"""Build the Al-Qadim atlas from the original read-only game data.

The Cyberlore world archives contain a 16-bit map grid, HLIB sprite banks, and
row/column-ordered world-object records.  Drawable type-2 and type-4 records
select their current TILE image in field 10; the following cached bounds hold
the exact visual origin.  Field 7 is collision/interaction state rather than
the render-frame selector.
HLIB type 5 uses a block-based LZ stream whose history can reach into the
bytes immediately before the library, so decoding is performed with the
original world file as its prefix.  No game files are modified.

The generated PNGs are indexed-colour images using each world's own palette.
The companion JavaScript catalogue records dimensions and provenance for the
guide's Leaflet image-map viewer.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import struct
import zlib
from dataclasses import dataclass
from pathlib import Path


TILE_SIZE = 16

WORLD_LABELS = {
    "ACID": "Acid Dungeon",
    "ACIDA": "Acid Dungeon — inner chamber",
    "ALKATRZ": "Alkatraz",
    "DEDHOLD": "Ships' Hold",
    "FEUD": "Caliph's Palace — feud state",
    "FINALA": "Unknown Plane — approach",
    "FINALB": "Unknown Plane — finale",
    "HERMITA": "Isle of Shibaz — first region",
    "HERMITB": "Isle of Shibaz — second region",
    "HERMITC": "Isle of Shibaz — third region",
    "HOLD": "Rotting Ships' Hold",
    "LORDSA": "Sorcerer's Tower — first region",
    "LORDSB": "Sorcerer's Tower — second region",
    "LORDSC": "Sorcerer's Tower — third region",
    "LORDSD": "Sorcerer's Tower — fourth region",
    "LORDSE": "Sorcerer's Tower — final chamber",
    "MAGROOM": "Isle of Hajar — magic room",
    "NEWDUNG": "Caliph's New Dungeon",
    "OASIS": "Bandar al-Sadat",
    "OGRIMA": "Isle of Jaza'ir Jiza",
    "OLDDUNG": "Old Dungeon",
    "OPENER": "Testing Grounds",
    "PAL0": "Palace Facade",
    "REEF": "Reef of the Dead",
    "ROAD": "Western Desert",
    "ROADB": "Isle of Aballat",
    "SENAT": "Isle of Senat",
    "SHIPA": "The Ship",
    "SHIPB": "The Ship — later state",
    "TOWN": "Zaratan",
    "VOICE": "Al-Naqqil",
}

ANNOTATION_KEYS = {
    "ACID": "map_acid_dungeon.png",
    "ALKATRZ": "map_dungeon_alkatraz.png",
    "DEDHOLD": "map_ships_hold.png",
    "FINALA": "map_unknown_plane.png",
    "HERMITA": "map_isle_shibaz_l1.png",
    "HERMITB": "map_isle_shibaz_l2.png",
    "HERMITC": "map_isle_shibaz_l3.png",
    "HOLD": "map_rotting_ships_hold.png",
    "LORDSA": "map_sorcerers_tower_l1.png",
    "LORDSB": "map_sorcerers_tower_l2.png",
    "MAGROOM": "map_isle_hajar.png",
    "NEWDUNG": "map_caliphs_new_dungeon.png",
    "OASIS": "map_bandar_al_sadat.png",
    "OGRIMA": "map_isle_jaza_ir_jiza.png",
    "OLDDUNG": "map_old_dungeon.png",
    "OPENER": "map_testing_grounds.png",
    "PAL0": "map_palace_facade.png",
    "REEF": "map_reef_of_dead.png",
    "ROAD": "map_western_desert.png",
    "ROADB": "map_isle_aballat.png",
    "SENAT": "map_isle_senat.png",
    "SHIPA": "map_the_ship.png",
    "TOWN": "map_zaratan.png",
    "VOICE": "map_al_naqqil.png",
}


@dataclass(frozen=True)
class WorldMap:
    engine_id: str
    title: str
    width: int
    height: int
    tile_bits: int
    tile_count: int
    pixels: bytes
    roofed_pixels: bytes | None
    palette: bytes
    source_size: int
    source_sha256: str
    annotation_key: str | None
    scenery_count: int
    foreground_count: int
    actor_count: int
    named_actors: tuple[dict[str, object], ...]


@dataclass(frozen=True)
class Sprite:
    rows: int
    anchor_x: int
    anchor_y: int
    width_quarters: int
    flags: int
    payload: bytes

    @property
    def width(self) -> int:
        return self.width_quarters * 4

    @property
    def height(self) -> int:
        return self.rows

    @property
    def kind(self) -> int:
        return self.flags & 0x0F


def u16(data: bytes, offset: int) -> int:
    return struct.unpack_from("<H", data, offset)[0]


def u32(data: bytes, offset: int) -> int:
    return struct.unpack_from("<I", data, offset)[0]


def archive_entries(data: bytes) -> list[tuple[int, int]]:
    count = u32(data, 0)
    entries = [struct.unpack_from("<II", data, 4 + index * 8) for index in range(count)]
    if not entries or any(offset + size > len(data) for offset, size in entries):
        raise ValueError("invalid outer LIB directory")
    return entries


def copy_match(output: bytearray, prefix: bytes, distance: int, length: int) -> None:
    """Copy an overlapping LZ match, including the engine's prefix history."""
    for _ in range(length):
        source = len(prefix) + len(output) - distance
        if source < 0:
            raise ValueError(f"invalid HLIB match distance {distance}")
        output.append(prefix[source] if source < len(prefix) else output[source - len(prefix)])


def decode_hlib(world: bytes, library_offset: int, library_size: int) -> bytes:
    encoded = world[library_offset : library_offset + library_size]
    if encoded[:4] != b"HLIB":
        raise ValueError("missing HLIB signature")
    if encoded[10] == 0:
        return encoded
    if encoded[10] != 5:
        raise ValueError(f"unsupported HLIB conversion type {encoded[10]}")

    decoded_size = u32(encoded, 4)
    stream = encoded[18:]
    prefix = world[: library_offset + 16]
    output = bytearray()
    cursor = 0

    # The original decoder emits independently terminated blocks of at most
    # 8192 bytes.  FF ends a block, not necessarily the complete library.
    while len(output) < decoded_size - 16:
        while True:
            command = stream[cursor]
            cursor += 1

            if command < 0x80:
                control = stream[cursor]
                cursor += 1
                literal_count = (control & 0x18) >> 3
                output.extend(stream[cursor : cursor + literal_count])
                cursor += literal_count
                match_length = (control & 0x07) + 3
                distance = (((control & 0xE0) << 2) | command) + 1
                copy_match(output, prefix, distance, match_length)
            elif not command & 0x40:
                control = stream[cursor]
                extension = stream[cursor + 1]
                cursor += 2
                literal_count = extension & 0x03
                output.extend(stream[cursor : cursor + literal_count])
                cursor += literal_count
                match_length = (control & 0x1F) + 3
                # The middle distance bits live in control's upper three bits.
                # Shifting the masked byte is important: duplicating control
                # before masking (as an early reverse-engineering draft did)
                # displaced one bit and produced believable terrain geometry
                # with corrupted sprite headers and repeated pixel fragments.
                middle = (control & 0xE0) << 1
                high = ((extension >> 1) & 0x7E) << 8
                distance = (middle | high | (command & 0x3F)) + 1
                copy_match(output, prefix, distance, match_length)
            elif not command & 0x30:
                literal_count = ((command & 0x0F) + 1) * 4
                output.extend(stream[cursor : cursor + literal_count])
                cursor += literal_count
            elif command != 0xFF:
                literal_count = command & 0x0F
                output.extend(stream[cursor : cursor + literal_count])
                cursor += literal_count
            else:
                break

    if len(output) != decoded_size - 16:
        raise ValueError(f"decoded HLIB length {len(output)} != {decoded_size - 16}")
    # Rebuild the in-memory form used by the game's HLIB accessors.
    header = bytearray(encoded[:16])
    header[10] = 0
    return bytes(header) + bytes(output)


def hlib_records(hlib: bytes) -> list[bytes]:
    count = u16(hlib, 8)
    offsets = [u32(hlib, 16 + index * 4) for index in range(count)]
    records = []
    for index, start in enumerate(offsets):
        end = offsets[index + 1] if index + 1 < count else len(hlib)
        if not (0 <= start <= end <= len(hlib)):
            raise ValueError("invalid HLIB item directory")
        records.append(hlib[start:end])
    return records


def decode_planar_pixels(payload: bytes, width_quarters: int, rows: int) -> bytes:
    """Convert four sequential VGA planes into ordinary row-major pixels."""
    plane_size = width_quarters * rows
    if len(payload) != plane_size * 4:
        raise ValueError("planar sprite length mismatch")
    width = width_quarters * 4
    pixels = bytearray(width * rows)
    for plane in range(4):
        plane_start = plane * plane_size
        for y in range(rows):
            source = plane_start + y * width_quarters
            destination = y * width + plane
            for x in range(width_quarters):
                pixels[destination + x * 4] = payload[source + x]
    return bytes(pixels)


def sprite_from_record(record: bytes) -> Sprite | None:
    if len(record) < 8:
        return None
    rows, anchor_x, anchor_y, width_quarters, flags = struct.unpack_from("<hhhBB", record, 0)
    sprite = Sprite(rows, anchor_x, anchor_y, width_quarters, flags, record[8:])
    if sprite.kind in (0, 5):
        if rows <= 0 or width_quarters <= 0 or len(sprite.payload) != sprite.width * sprite.height:
            return None
    elif sprite.kind == 9:
        if len(sprite.payload) % 6:
            return None
    else:
        return None
    return sprite


def decode_sprite_bank(world: bytes, entry: tuple[int, int]) -> list[Sprite | None]:
    offset, size = entry
    hlib = decode_hlib(world, offset, size)
    return [sprite_from_record(record) for record in hlib_records(hlib)]


def draw_sprite(
    raster: bytearray,
    raster_width: int,
    raster_height: int,
    bank: list[Sprite | None],
    sprite_id: int,
    world_y: int,
    world_x: int,
    *,
    origin_override: tuple[int, int] | None = None,
    depth: int = 0,
) -> bool:
    """Draw one anchored sprite, including the engine's compound type-9 lists."""
    if depth > 8 or not (0 <= sprite_id < len(bank)):
        return False
    sprite = bank[sprite_id]
    if sprite is None:
        return False

    # Object records use the engine's row/column axis order.  The first world
    # coordinate and the first TILE hotspot are vertical; the second pair are
    # horizontal.  Treating them as conventional raster (x, y) coordinates
    # transposes every placement.  The cached bounds inside actor records
    # confirm this: a 16x41 actor has 41 units on the first axis and 16 on the
    # second.
    if origin_override is None:
        origin_y = world_y - sprite.anchor_x
        origin_x = world_x - sprite.anchor_y
    else:
        origin_y, origin_x = origin_override
    if sprite.kind == 9:
        rendered = False
        for child_id, _count, delta_y, delta_x in struct.iter_unpack("<BBhh", sprite.payload):
            rendered |= draw_sprite(
                raster,
                raster_width,
                raster_height,
                bank,
                child_id,
                origin_y + delta_y,
                origin_x + delta_x,
                depth=depth + 1,
            )
        return rendered

    pixels = decode_planar_pixels(sprite.payload, sprite.width_quarters, sprite.rows)
    transparent = sprite.kind == 5
    rendered = False
    for sprite_y in range(sprite.height):
        destination_y = origin_y + sprite_y
        if not 0 <= destination_y < raster_height:
            continue
        for sprite_x in range(sprite.width):
            destination_x = origin_x + sprite_x
            if not 0 <= destination_x < raster_width:
                continue
            colour = pixels[sprite_y * sprite.width + sprite_x]
            if transparent and colour == 0xFF:
                continue
            raster[destination_y * raster_width + destination_x] = colour
            rendered = True
    return rendered


def actor_name(record: bytes) -> str | None:
    """Read the engine-authored actor label block from a type-1 record."""
    if len(record) < 136:
        return None
    parts = []
    for raw in record[112:136].split(b"\0"):
        if not raw:
            continue
        if all(32 <= byte < 127 for byte in raw):
            parts.append(raw.decode("ascii"))
    return " ".join(parts) or None


def composite_world_objects(
    world: bytes,
    entries: list[tuple[int, int]],
    raster: bytearray,
    raster_width: int,
    raster_height: int,
) -> tuple[int, int, int, tuple[dict[str, object], ...], bytes | None]:
    actor_bank = decode_sprite_bank(world, entries[2])
    scenery_bank = decode_sprite_bank(world, entries[4])
    foreground_bank = decode_sprite_bank(world, entries[6])
    objects_offset, objects_size = entries[8]
    objects = world[objects_offset : objects_offset + objects_size]
    if len(objects) < 4:
        return 0, 0, 0, (), None

    directory_end = u16(objects, 2)
    if directory_end < 4 or directory_end > len(objects) or (directory_end - 4) % 8:
        raise ValueError("invalid world-object directory")
    slot_count = (directory_end - 4) // 8
    drawables: list[
        tuple[int, int, int, int, list[Sprite | None], int, tuple[int, int] | None]
    ] = []
    named_actors: list[dict[str, object]] = []
    foreground_drawables: list[tuple[int, int, int, int, tuple[int, int]]] = []
    actor_records = 0
    scenery_records = 0
    foreground_records = 0

    for slot in range(slot_count):
        record_offset, record_size, record_type = struct.unpack_from("<IHH", objects, 4 + slot * 8)
        if not record_offset or record_offset + record_size > len(objects):
            continue
        record = objects[record_offset : record_offset + record_size]
        if len(record) < 22:
            continue
        values = struct.unpack_from("<11H", record, 0)
        world_y, world_x = values[3], values[4]

        if record_type == 1:
            actor_records += 1
            sprite_id = values[10] & 0x7FFF
            name = actor_name(record)
            if name:
                named_actors.append(
                    {
                        "id": slot,
                        "name": name,
                        "x": world_x,
                        "y": world_y,
                        "spriteId": sprite_id,
                        "positionKind": "authored-spawn",
                    }
                )
        elif record_type in (2, 4) and values[5] == 2:
            # Script FA:F7 is the multi-frame genie/teleport effect.  Its
            # records describe mutually exclusive animation frames; drawing
            # every dormant frame at once creates the large blue-white burst
            # seen in early atlas drafts.
            if record_type == 2 and len(record) >= 112 and u16(record, 110) == 0xFAF7:
                continue
            sprite_id = values[10] & 0x7FFF
            cached_origin = None
            if len(record) >= 38 and 0 <= sprite_id < len(scenery_bank):
                sprite = scenery_bank[sprite_id]
                # Opaque type-2 images are editor collision/region helpers
                # (including labels such as LEFTY and MEDIUM), not runtime
                # scenery.  Transparent type-2 images and all type-4 images
                # are actual visual instances.
                if record_type == 2 and sprite is not None and sprite.kind != 5:
                    continue
                cached = struct.unpack_from("<8H", record, 22)
                # The first coordinate pair is the depth anchor, while the
                # cached rectangle stores the actual top/left used to draw the
                # current frame.  This is intentionally keyed by field 10:
                # field 7 describes associated collision/interaction state.
                if sprite is not None and (cached[0], cached[1]) == (sprite.height, sprite.width):
                    cached_y = cached[4] - 0x10000 if cached[4] & 0x8000 else cached[4]
                    cached_x = cached[5] - 0x10000 if cached[5] & 0x8000 else cached[5]
                    cached_origin = (cached_y, cached_x)
            scenery_records += 1
            drawables.append((world_y, slot, world_y, world_x, scenery_bank, sprite_id, cached_origin))
        elif record_type == 2 and values[5] == 3 and len(record) >= 38:
            # Layer 3 is the engine's roof/foreground library.  Compound
            # type-9 records cover complete buildings and are removed at
            # runtime for the room occupied by the player.  Preserve them as
            # a separate whole-world render so the atlas can offer a cutaway
            # view and an exterior view without guessing the player's room.
            sprite_id = values[10] & 0x7FFF
            if 0 <= sprite_id < len(foreground_bank):
                cached = struct.unpack_from("<8H", record, 22)
                cached_y = cached[4] - 0x10000 if cached[4] & 0x8000 else cached[4]
                cached_x = cached[5] - 0x10000 if cached[5] & 0x8000 else cached[5]
                foreground_records += 1
                foreground_drawables.append((world_y, slot, sprite_id, world_x, (cached_y, cached_x)))

    # The original renderer depth-orders world objects by the vertical anchor.
    for _, _, world_y, world_x, bank, sprite_id, cached_origin in sorted(drawables):
        draw_sprite(
            raster,
            raster_width,
            raster_height,
            bank,
            sprite_id,
            world_y,
            world_x,
            origin_override=cached_origin,
        )

    roofed_raster = None
    if foreground_drawables:
        roofed = bytearray(raster)
        for world_y, _, sprite_id, world_x, cached_origin in sorted(foreground_drawables):
            draw_sprite(
                roofed,
                raster_width,
                raster_height,
                foreground_bank,
                sprite_id,
                world_y,
                world_x,
                origin_override=cached_origin,
            )
        roofed_raster = bytes(roofed)

    named_actors.sort(key=lambda actor: (int(actor["y"]), int(actor["x"]), str(actor["name"])))
    return scenery_records, foreground_records, actor_records, tuple(named_actors), roofed_raster


def read_world(path: Path) -> WorldMap:
    world = path.read_bytes()
    entries = archive_entries(world)
    if len(entries) != 9:
        raise ValueError(f"{path.name}: expected 9 world members")

    map_offset, map_size = entries[0]
    map_data = world[map_offset : map_offset + map_size]
    width, height, tile_width, tile_height, tile_count, _, tile_bits, _, row_bytes = struct.unpack_from(
        "<9H", map_data, 0
    )
    if tile_width != TILE_SIZE or tile_height != TILE_SIZE or row_bytes != width * 2:
        raise ValueError(f"{path.name}: unsupported map geometry")
    if len(map_data) != 18 + width * height * 2:
        raise ValueError(f"{path.name}: map grid length mismatch")

    tiles_offset, tiles_size = entries[1]
    hlib = decode_hlib(world, tiles_offset, tiles_size)
    library_count = u16(hlib, 8)
    records = hlib_records(hlib)
    offsets = [u32(hlib, 16 + index * 4) for index in range(library_count)]
    if library_count < tile_count + 1:
        raise ValueError(f"{path.name}: tile library is too small")

    palette_start = offsets[0] + 8
    palette = hlib[palette_start : palette_start + 768]
    if len(palette) != 768:
        raise ValueError(f"{path.name}: missing 256-colour palette")

    tile_pixels: list[bytes] = [bytes(256)]
    for tile_id in range(1, tile_count + 1):
        record = records[tile_id]
        if len(record) < 264:
            raise ValueError(f"{path.name}: short tile record {tile_id}")
        sprite = sprite_from_record(record)
        if sprite is None or sprite.width != TILE_SIZE or sprite.height != TILE_SIZE:
            raise ValueError(f"{path.name}: invalid terrain tile {tile_id}")
        tile_pixels.append(decode_planar_pixels(sprite.payload, sprite.width_quarters, sprite.rows))

    mask = (1 << tile_bits) - 1
    grid = struct.unpack_from(f"<{width * height}H", map_data, 18)
    raster = bytearray(width * TILE_SIZE * height * TILE_SIZE)
    raster_width = width * TILE_SIZE
    for map_y in range(height):
        for map_x in range(width):
            tile_id = grid[map_y * width + map_x] & mask
            tile = tile_pixels[tile_id] if tile_id < len(tile_pixels) else tile_pixels[0]
            for tile_y in range(TILE_SIZE):
                destination = (map_y * TILE_SIZE + tile_y) * raster_width + map_x * TILE_SIZE
                source = tile_y * TILE_SIZE
                raster[destination : destination + TILE_SIZE] = tile[source : source + TILE_SIZE]

    scenery_count, foreground_count, actor_count, named_actors, roofed_pixels = composite_world_objects(
        world,
        entries,
        raster,
        raster_width,
        height * TILE_SIZE,
    )

    engine_id = path.stem.upper()
    return WorldMap(
        engine_id=engine_id,
        title=WORLD_LABELS.get(engine_id, engine_id.title()),
        width=width,
        height=height,
        tile_bits=tile_bits,
        tile_count=tile_count,
        pixels=bytes(raster),
        roofed_pixels=roofed_pixels,
        palette=palette,
        source_size=len(world),
        source_sha256=hashlib.sha256(world).hexdigest(),
        annotation_key=ANNOTATION_KEYS.get(engine_id),
        scenery_count=scenery_count,
        foreground_count=foreground_count,
        actor_count=actor_count,
        named_actors=named_actors,
    )


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)


def write_indexed_png(path: Path, width: int, height: int, pixels: bytes, palette: bytes) -> None:
    rows = b"".join(b"\0" + pixels[y * width : (y + 1) * width] for y in range(height))
    png = bytearray(b"\x89PNG\r\n\x1a\n")
    png += png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 3, 0, 0, 0))
    png += png_chunk(b"PLTE", palette)
    png += png_chunk(b"IDAT", zlib.compress(rows, 9))
    png += png_chunk(b"IEND", b"")
    path.write_bytes(png)


def build_catalogue(worlds: list[WorldMap]) -> dict[str, object]:
    entries = []
    for world in worlds:
        entries.append(
            {
                "id": world.engine_id.lower(),
                "engineId": world.engine_id,
                "title": world.title,
                "image": f"images/alqadim-atlas/{world.engine_id.lower()}.png",
                "roofImage": (
                    f"images/alqadim-atlas/{world.engine_id.lower()}-roofed.png"
                    if world.roofed_pixels is not None
                    else None
                ),
                "width": world.width * TILE_SIZE,
                "height": world.height * TILE_SIZE,
                "mapWidth": world.width,
                "mapHeight": world.height,
                "tileSize": TILE_SIZE,
                "tileBits": world.tile_bits,
                "tileCount": world.tile_count,
                "annotationKey": world.annotation_key,
                "manualImage": f"images/alqadim/{world.annotation_key}" if world.annotation_key else None,
                "sourceFile": f"WORLDS/{world.engine_id}.LIB",
                "sourceBytes": world.source_size,
                "sourceSha256": world.source_sha256,
                "sceneryCount": world.scenery_count,
                "foregroundCount": world.foreground_count,
                "actorCount": world.actor_count,
                "namedActors": world.named_actors,
            }
        )
    return {
        "format": "Al-Qadim Cyberlore world atlas v7",
        "rendering": "Terrain, cached-origin runtime scenery, optional roof/foreground layer, NPC spawn metadata, and original 256-colour palette",
        "worldCount": len(entries),
        "worlds": entries,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Al-Qadim installation directory")
    parser.add_argument("--output", type=Path, default=Path("images/alqadim-atlas"))
    parser.add_argument("--catalogue", type=Path, default=Path("js/AlQadimAtlasData.js"))
    args = parser.parse_args()

    worlds_dir = args.source / "WORLDS"
    files = sorted(worlds_dir.glob("*.LIB"))
    if not files:
        raise SystemExit(f"No world libraries found in {worlds_dir}")

    args.output.mkdir(parents=True, exist_ok=True)
    worlds: list[WorldMap] = []
    for path in files:
        world = read_world(path)
        worlds.append(world)
        image_path = args.output / f"{world.engine_id.lower()}.png"
        write_indexed_png(
            image_path,
            world.width * TILE_SIZE,
            world.height * TILE_SIZE,
            world.pixels,
            world.palette,
        )
        if world.roofed_pixels is not None:
            write_indexed_png(
                args.output / f"{world.engine_id.lower()}-roofed.png",
                world.width * TILE_SIZE,
                world.height * TILE_SIZE,
                world.roofed_pixels,
                world.palette,
            )
        print(f"rendered {world.engine_id:8} {world.width:3}x{world.height:<3} -> {image_path}")

    catalogue = build_catalogue(worlds)
    args.catalogue.write_text(
        "// Generated by tools/generate_alqadim_atlas.py from the original game data.\n"
        "window.ALQADIM_ATLAS_DATA = " + json.dumps(catalogue, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {args.catalogue} ({len(worlds)} worlds)")


if __name__ == "__main__":
    main()
