#!/usr/bin/env python3
"""Generate a game-accurate Albion atlas from an installed GOG copy.

The generator uses only Python's standard library. It reads the original
MODE2/2352 CD image directly, decodes ISO-9660 and XLD containers, renders the
first animation frame of every 2D map, builds top-down plans for first-person
maps, follows map-exit event chains, and writes indexed-colour PNGs plus the
JavaScript catalogue consumed by the guide.

The source installation is never modified.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct
import zlib
from dataclasses import dataclass
from pathlib import Path


RAW_SECTOR_SIZE = 2352
MODE2_FORM1_DATA_OFFSET = 24
ISO_SECTOR_SIZE = 2048
TILE_PIXELS = 16
XLD_MAGIC = b"XLD0I\0"
MAP_FLAG_EXTRA_NPCS = 0x4000
MAP_FLAG_V2_NPC_DATA = 0x2000
NPC_FLAG_SIMPLE_MESSAGE = 0x10
TILE_FLAG_NO_DRAW = 1 << 21
EVENT_RECORD_SIZE = 12
EVENT_TYPE_MAP_EXIT = 1
EVENT_TYPE_QUERY = 0x0C

# Names reconstructed by the UAlbion project from the shipped game data.
MAP_NAMES = {
    100: "Test Map Iskai", 101: "Test Map Toronto", 102: "Test Map Toronto 2",
    103: "Test Map Srimalinar", 104: "Test Map Drinno", 105: "Test Map Semi Broken",
    106: "Test Map Argim", 107: "Test Map Argim 2", 108: "Test Map Celtic",
    109: "Test Map Khamulon", 110: "Jirinaar", 111: "Hunter Clan",
    112: "Hunter Clan Downstairs", 113: "Jirinaar Town Hall", 114: "Dji-Kas Guild",
    115: "Dji-Kas Basement", 116: "Dji-Fadh Guild", 117: "Dji-Kas Basement 2",
    118: "Snird Armoury", 119: "Spice Trader", 120: "Wania's Shop",
    121: "House of the Winds", 122: "Old Former Building", 123: "Hunter Clan Cellar",
    124: "Empty Celt Hut", 125: "Empty Celt Hut Wide", 126: "Empty Celt Hut Tall",
    127: "Sarena's Hut", 128: "Peleito's Hut", 129: "Garris", 130: "Bragona",
    131: "Tharnos", 132: "Winion", 133: "Oibelos", 134: "Tamno", 135: "Dranbar",
    136: "Benno's Provisions", 137: "Aretha", 138: "Rifrako", 139: "Ferina",
    140: "Arjano Hut", 141: "Arjano", 142: "Arjano Library", 143: "Drinno",
    144: "Drinno 1", 145: "Drinno 2", 146: "Drinno 3", 147: "Drinno 4",
    148: "Drinno 5",
    149: "Bero's Room", 150: "Toronto Part 1", 151: "Toronto Part 2",
    152: "Toronto Part 2-2", 153: "Toronto Part 3", 154: "Kenget Kamulos 1",
    155: "Kenget Kamulos 2", 156: "Kenget Kamulos 3", 157: "Kenget Kamulos 4",
    158: "Kenget Kamulos 5", 159: "Kenget Kamulos 6", 160: "Kenget Kamulos 7",
    161: "Kenget Kamulos Hall", 162: "Kenget Kamulos 8", 163: "Test Map Kenget",
    164: "Old Former Building (After Fight)", 165: "Flight to Albion",
    166: "Landing on Albion", 167: "Jirinaar Combat Trainer", 168: "Jirinaar Cave",
    169: "Gratogel Cave", 170: "Maini South Cave", 171: "Maini North Cave",
    172: "Umajo Cave", 173: "Dji-Cantos Cave", 174: "Endgame",
    190: "Broken Map", 195: "Load Test Map", 196: "Development Map 196",
    197: "Test Map 197", 198: "Test Map 198", 199: "Albion Shortcut Map",
    200: "Nakiridaani", 201: "Gratogel North", 202: "Gratogel South",
    203: "Maini 1", 204: "Maini 2", 205: "Maini 3", 206: "Maini 4", 207: "Maini 5",
    210: "Test Map Outdoors", 211: "Test Map Graphics", 212: "Iskai Holy Site",
    213: "Kontos", 214: "Test Map Graphics 2", 215: "Umajo 1", 216: "Umajo 2",
    217: "Umajo 3", 218: "Development Map 218", 219: "Umajo 4",
    230: "Device Maker Guild", 231: "Gem Cutter Guild", 232: "Weapon Smith Guild",
    233: "Miners Guild", 234: "Prison", 235: "Umajo Kenta", 236: "Kyla Provisions",
    237: "Umajo Mixed Goods", 238: "Umajo Prison", 239: "Erzmine Guest House", 240: "Sojekos",
    241: "Kyla's House", 243: "Device Maker Dungeon", 247: "Device Maker Chamber",
    242: "Mountain Pass", 244: "Device Maker Dungeon 3D 1",
    245: "Device Maker Dungeon 3D 2", 246: "Device Maker Dungeon 3D 3",
    248: "Mine Entrance", 249: "Development Map 249", 250: "Map 250",
    251: "Map 251", 252: "Kounos Cave 1", 253: "Kounos Cave 2",
    254: "Kounos Cave 3", 255: "Kounos Cave 4", 256: "Kounos Cave 5",
    260: "Beloveno Hostel",
    261: "Siobhan's House", 262: "Siobhan's Cellar", 263: "Southern Residence",
    264: "Kariah", 265: "Beloveno Town Hall", 266: "Northwestern Residence",
    267: "Dolo Provisions", 268: "Bagga Equipment", 269: "Posch Weapons",
    270: "Riolea Mixed Goods", 271: "Ramina Healer", 273: "Kounos Trader",
    274: "Darios", 275: "Kounos Guest House", 276: "Kontos Labyrinth 1",
    277: "Kontos Labyrinth 2", 278: "Nadje Weapons",
    279: "Srimalinar Mage Guild", 280: "Arrim", 281: "Edjirr",
    282: "Holy Site Basement", 283: "Beloveno", 284: "Srimalinar",
    290: "Test Map Desert", 291: "Test Map Dji-Cantos", 292: "Map 292",
    293: "Test Items", 294: "Test Map Kenget Kamulos", 295: "Test Mahino House",
    297: "Development Map 297", 298: "Development Map 298", 299: "Test House",
    300: "Toronto — Beginning", 301: "Toronto — Reactor", 302: "Toronto — Arrival",
    303: "Toronto — Discovery", 304: "Toronto — Discovery with Joe",
    305: "Toronto — Reactor with AI", 310: "Kenget Prison", 311: "Kenget Fortress",
    312: "Kenget Slave Quarters", 313: "Kenget Boss", 320: "Isle of Peace",
    322: "Cantos House", 388: "Development Map 388", 389: "Development Map 389",
    390: "Development Map 390", 398: "Development Map 398", 399: "Development Map 399",
}

TILESET_NAMES = {
    1: "Nakiridaani outdoors", 2: "Maini outdoors", 3: "Iskai indoors",
    4: "Umajo desert", 5: "Stone", 6: "Stone halls", 7: "Celtic interiors",
    8: "Toronto", 9: "Umajo interiors", 10: "Dji-Cantos", 11: "Endgame",
}

GROUP_ORDER = {
    "Outdoor regions": 0,
    "Enterable cities": 1,
    "Jirinaar and Gratogel": 2,
    "Umajo, Beloveno and Srimalinar": 3,
    "Toronto and Kenget Kamulos": 4,
    "Endgame and Dji-Cantos": 5,
    "World locations": 6,
    "First-person floor plans": 7,
    "Development maps": 8,
}

NPC_GENDERS = {0: "Male", 1: "Female", 2: "Neuter"}
NPC_RACES = {
    0: "Terran", 1: "Iskai", 2: "Celt", 3: "Kenget Kamulos",
    4: "Dji-Cantos", 5: "Mahino", 6: "Decadent", 7: "Umajo",
    14: "Monster",
}
NPC_CLASSES = {
    0: "Pilot", 1: "Scientist", 2: "Iskai warrior", 3: "Dji-Kas mage",
    4: "Druid", 5: "Enlightened One", 6: "Technician",
    8: "Oqulo Kamulos", 9: "Warrior", 31: "Monster",
}


@dataclass(frozen=True)
class IsoEntry:
    path: str
    extent: int
    size: int
    is_directory: bool


@dataclass(frozen=True)
class TileInfo:
    flags: int
    image_number: int
    frame_count: int


@dataclass(frozen=True)
class Map2D:
    map_id: int
    flags: int
    song_id: int
    width: int
    height: int
    tileset_id: int
    combat_background_id: int
    palette_id: int
    frame_rate: int
    layout: bytes
    npc_count: int
    npcs: tuple["MapNpcRecord", ...]
    zones: tuple["MapZone", ...]
    events: tuple[bytes, ...]


@dataclass(frozen=True)
class Map3D:
    map_id: int
    flags: int
    song_id: int
    width: int
    height: int
    labyrinth_id: int
    combat_background_id: int
    palette_id: int
    ambient_song_id: int
    contents: bytes
    floors: bytes
    ceilings: bytes
    npc_count: int
    npcs: tuple["MapNpcRecord", ...]
    zones: tuple["MapZone", ...]
    events: tuple[bytes, ...]


@dataclass(frozen=True)
class MapZone:
    x: int
    y: int
    trigger: int
    event_index: int
    global_zone: bool = False


@dataclass(frozen=True)
class MapNpcRecord:
    slot: int
    sheet_id: int
    sprite_id: int
    flags: int
    triggers: int
    event_index: int
    movement: int
    npc_type: int
    position: tuple[int, int] | None
    route_positions: tuple[tuple[int, int], ...]


@dataclass(frozen=True)
class NpcProfile:
    sheet_id: int
    name: str
    gender: str
    race: str
    player_class: str
    level: int
    portrait_id: int
    sprite_id: int


@dataclass(frozen=True)
class SpriteReference:
    sprite_id: int
    frame_count: int
    width: int
    height: int


@dataclass(frozen=True)
class LabyrinthStyle:
    labyrinth_id: int
    floor_sprites: tuple[int, ...]
    object_groups: tuple[tuple[int, ...], ...]
    objects: tuple[SpriteReference, ...]
    walls: tuple[SpriteReference, ...]


@dataclass(frozen=True)
class GameArchives:
    tile_metadata: list[bytes]
    tile_graphics: list[bytes]
    palettes: list[bytes]
    map_archives: list[tuple[int, bytes]]
    common_palette: bytes
    labyrinths: dict[int, LabyrinthStyle]
    floor_graphics: dict[int, bytes]
    wall_graphics: dict[int, bytes]
    object_graphics: dict[int, bytes]
    npc_profiles: dict[int, NpcProfile]


class Mode2IsoImage:
    """Small read-only ISO-9660 reader for GOG's raw MODE2/2352 image."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._stream = path.open("rb")
        descriptor = self._read_sector(16)
        if descriptor[0:7] != b"\x01CD001\x01":
            raise ValueError(f"{path} is not a supported ISO-9660 MODE2/2352 image")
        root_length = descriptor[156]
        root = descriptor[156 : 156 + root_length]
        root_extent = struct.unpack_from("<I", root, 2)[0]
        root_size = struct.unpack_from("<I", root, 10)[0]
        self.entries: dict[str, IsoEntry] = {}
        self._walk_directory(root_extent, root_size, "")

    def close(self) -> None:
        self._stream.close()

    def __enter__(self) -> "Mode2IsoImage":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def _read_sector(self, sector: int) -> bytes:
        offset = sector * RAW_SECTOR_SIZE + MODE2_FORM1_DATA_OFFSET
        self._stream.seek(offset)
        result = self._stream.read(ISO_SECTOR_SIZE)
        if len(result) != ISO_SECTOR_SIZE:
            raise ValueError(f"CD image ended while reading sector {sector}")
        return result

    def _read_extent(self, extent: int, size: int) -> bytes:
        result = bytearray()
        sector_count = (size + ISO_SECTOR_SIZE - 1) // ISO_SECTOR_SIZE
        for sector in range(extent, extent + sector_count):
            result.extend(self._read_sector(sector))
        return bytes(result[:size])

    @staticmethod
    def _directory_records(data: bytes) -> list[tuple[str, int, int, bool]]:
        records: list[tuple[str, int, int, bool]] = []
        offset = 0
        while offset < len(data):
            length = data[offset]
            if length == 0:
                offset = (offset // ISO_SECTOR_SIZE + 1) * ISO_SECTOR_SIZE
                continue
            record = data[offset : offset + length]
            offset += length
            name_length = record[32]
            raw_name = record[33 : 33 + name_length]
            if raw_name in (b"\x00", b"\x01"):
                continue
            name = raw_name.decode("ascii").split(";", 1)[0].rstrip(".")
            extent = struct.unpack_from("<I", record, 2)[0]
            size = struct.unpack_from("<I", record, 10)[0]
            is_directory = bool(record[25] & 0x02)
            records.append((name, extent, size, is_directory))
        return records

    def _walk_directory(self, extent: int, size: int, prefix: str) -> None:
        for name, child_extent, child_size, is_directory in self._directory_records(
            self._read_extent(extent, size)
        ):
            path = f"{prefix}/{name}".strip("/").upper()
            self.entries[path] = IsoEntry(path, child_extent, child_size, is_directory)
            if is_directory:
                self._walk_directory(child_extent, child_size, path)

    def read(self, path: str) -> bytes:
        key = path.replace("\\", "/").strip("/").upper()
        entry = self.entries.get(key)
        if entry is None or entry.is_directory:
            raise FileNotFoundError(f"File not found in Albion CD image: {path}")
        return self._read_extent(entry.extent, entry.size)


def decode_xld(data: bytes, label: str) -> list[bytes]:
    if len(data) < 8 or data[:6] != XLD_MAGIC:
        raise ValueError(f"{label} does not begin with the XLD0I signature")
    count = struct.unpack_from("<H", data, 6)[0]
    header_size = 8 + count * 4
    if len(data) < header_size:
        raise ValueError(f"{label} has a truncated XLD header")
    lengths = struct.unpack_from(f"<{count}i", data, 8)
    if any(length < 0 for length in lengths):
        raise ValueError(f"{label} contains a negative subfile length")
    result: list[bytes] = []
    offset = header_size
    for length in lengths:
        end = offset + length
        if end > len(data):
            raise ValueError(f"{label} ends inside an XLD subfile")
        result.append(data[offset:end])
        offset = end
    if offset != len(data):
        raise ValueError(f"{label} has {len(data) - offset} unexplained trailing bytes")
    return result


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def decode_albion_string(data: bytes) -> str:
    return data.split(b"\0", 1)[0].decode("cp850", errors="replace").strip()


def parse_npc_profile(sheet_id: int, data: bytes) -> NpcProfile | None:
    """Read the common named fields from a 742-byte NPC character sheet."""
    if len(data) < 0x132:
        return None
    german_name = decode_albion_string(data[0x112:0x122])
    english_name = decode_albion_string(data[0x122:0x132])
    name = english_name or german_name
    if not name:
        return None
    return NpcProfile(
        sheet_id=sheet_id,
        name=name,
        gender=NPC_GENDERS.get(data[1], f"Gender {data[1]}"),
        race=NPC_RACES.get(data[2], f"Race {data[2]}"),
        player_class=NPC_CLASSES.get(data[3], f"Class {data[3]}"),
        level=data[5],
        portrait_id=data[0xA],
        sprite_id=data[9],
    )


def parse_map_tail(
    map_id: int,
    data: bytes,
    offset: int,
    height: int,
) -> tuple[tuple[MapZone, ...], tuple[bytes, ...], int]:
    """Read event zones and fixed-size event nodes after a map's tile grid."""
    zones: list[MapZone] = []

    def read_u16(label: str) -> int:
        nonlocal offset
        if offset + 2 > len(data):
            raise ValueError(f"Map {map_id} ended while reading {label}")
        value = struct.unpack_from("<H", data, offset)[0]
        offset += 2
        return value

    def read_zones(count: int, y: int, global_zone: bool) -> None:
        nonlocal offset
        for _ in range(count):
            if offset + 6 > len(data):
                raise ValueError(f"Map {map_id} ended inside its event-zone table")
            x, _unknown, trigger, event_index = struct.unpack_from("<BBHH", data, offset)
            offset += 6
            zones.append(MapZone(x, y, trigger, event_index, global_zone))

    global_count = read_u16("global zone count")
    read_zones(global_count, 0, True)
    for y in range(1, height + 1):
        read_zones(read_u16(f"zone count for row {y}"), y, False)

    # A few tiny developer maps end immediately after an empty zone table.
    if offset == len(data):
        return tuple(zones), (), offset

    event_count = read_u16("event count")
    event_bytes = event_count * EVENT_RECORD_SIZE
    if offset + event_bytes > len(data):
        raise ValueError(
            f"Map {map_id} has {event_count} events but only "
            f"{len(data) - offset} event bytes remain"
        )
    events = tuple(
        data[offset + index * EVENT_RECORD_SIZE : offset + (index + 1) * EVENT_RECORD_SIZE]
        for index in range(event_count)
    )
    offset += event_bytes
    return tuple(zones), events, offset


def parse_map_npcs(
    map_id: int,
    data: bytes,
    map_flags: int,
    npc_count: int,
    waypoint_offset: int,
    width: int,
    height: int,
) -> tuple[MapNpcRecord, ...]:
    """Decode active NPC records and their first/scheduled map positions."""
    records: list[MapNpcRecord] = []
    offset = waypoint_offset
    for slot in range(npc_count):
        record_offset = 10 + slot * 10
        sheet_id, _sound, event_index, sprite_id, flags, triggers = struct.unpack_from(
            "<BBHHHH", data, record_offset
        )
        if not sheet_id:
            continue

        if map_flags & MAP_FLAG_V2_NPC_DATA:
            npc_type = (
                (1 if flags & 0x1 else 0)
                | (2 if flags & 0x2 else 0)
                | (4 if flags & 0x4 else 0)
            )
            movement = (flags >> 8) & 0xF
        else:
            npc_type = flags & 0x3
            movement = (flags >> 2) & 0x3

        waypoint_count = 0x480 if movement in (0, 4) else 1
        waypoint_bytes = waypoint_count * 2
        if offset + waypoint_bytes > len(data):
            raise ValueError(
                f"Map {map_id} ended inside NPC slot {slot}'s waypoint data"
            )

        unique_positions: list[tuple[int, int]] = []
        seen: set[tuple[int, int]] = set()
        for index in range(waypoint_count):
            x, y = struct.unpack_from("<BB", data, offset + index * 2)
            position = (x, y)
            if (
                1 <= x <= width
                and 1 <= y <= height
                and position not in seen
            ):
                unique_positions.append(position)
                seen.add(position)
        offset += waypoint_bytes
        records.append(MapNpcRecord(
            slot=slot,
            sheet_id=sheet_id,
            sprite_id=sprite_id,
            flags=flags,
            triggers=triggers,
            event_index=event_index,
            movement=movement,
            npc_type=npc_type,
            position=unique_positions[0] if unique_positions else None,
            route_positions=tuple(unique_positions),
        ))
    return tuple(records)


def parse_map_2d(map_id: int, data: bytes) -> Map2D | None:
    if not data:
        return None
    if len(data) < 10:
        raise ValueError(f"Map {map_id} is shorter than its header")
    flags, map_type, song, width, height, tileset, combat_bg, palette, frame_rate = (
        struct.unpack_from("<H8B", data)
    )
    if map_type != 2:
        return None
    npc_count = 96 if flags & MAP_FLAG_EXTRA_NPCS else 32
    layout_offset = 10 + npc_count * 10
    layout_size = 3 * width * height
    layout = data[layout_offset : layout_offset + layout_size]
    if len(layout) != layout_size:
        raise ValueError(
            f"Map {map_id} layout is {len(layout)} bytes; expected {layout_size}"
        )
    zones, events, waypoint_offset = parse_map_tail(
        map_id, data, layout_offset + layout_size, height
    )
    npcs = parse_map_npcs(
        map_id, data, flags, npc_count, waypoint_offset, width, height
    )
    return Map2D(
        map_id, flags, song, width, height, tileset, combat_bg, palette,
        frame_rate, layout, npc_count, npcs, zones, events
    )


def parse_map_3d(map_id: int, data: bytes) -> Map3D | None:
    if not data:
        return None
    if len(data) < 10:
        raise ValueError(f"Map {map_id} is shorter than its header")
    flags, map_type, song, width, height, labyrinth, combat_bg, palette, ambient = (
        struct.unpack_from("<H8B", data)
    )
    if map_type != 1:
        return None
    npc_count = 96 if flags & MAP_FLAG_EXTRA_NPCS else 32
    layout_offset = 10 + npc_count * 10
    layout_size = 3 * width * height
    layout = data[layout_offset : layout_offset + layout_size]
    if len(layout) != layout_size:
        raise ValueError(
            f"Map {map_id} 3D layout is {len(layout)} bytes; expected {layout_size}"
        )
    contents = layout[0::3]
    floors = layout[1::3]
    ceilings = layout[2::3]
    zones, events, waypoint_offset = parse_map_tail(
        map_id, data, layout_offset + layout_size, height
    )
    npcs = parse_map_npcs(
        map_id, data, flags, npc_count, waypoint_offset, width, height
    )
    return Map3D(
        map_id, flags, song, width, height, labyrinth, combat_bg, palette,
        ambient, contents, floors, ceilings, npc_count, npcs, zones, events
    )


def parse_map(map_id: int, data: bytes) -> Map2D | Map3D | None:
    if not data:
        return None
    map_type = data[2] if len(data) >= 3 else 0
    if map_type == 2:
        return parse_map_2d(map_id, data)
    if map_type == 1:
        return parse_map_3d(map_id, data)
    raise ValueError(f"Map {map_id} has unsupported map type {map_type}")


def parse_labyrinth(labyrinth_id: int, data: bytes) -> LabyrinthStyle:
    if len(data) < 40:
        raise ValueError(f"Labyrinth {labyrinth_id} is shorter than its header")
    offset = 38
    object_group_count = struct.unpack_from("<H", data, offset)[0]
    offset += 2
    object_groups: list[tuple[int, ...]] = []
    for _ in range(object_group_count):
        if offset + 66 > len(data):
            raise ValueError(f"Labyrinth {labyrinth_id} ends inside an object group")
        members: list[int] = []
        for sub_index in range(8):
            incremented = struct.unpack_from("<H", data, offset + 2 + sub_index * 8 + 6)[0]
            if incremented:
                members.append(incremented - 1)
        object_groups.append(tuple(members))
        offset += 66

    if offset + 2 > len(data):
        raise ValueError(f"Labyrinth {labyrinth_id} has no floor table")
    floor_count = struct.unpack_from("<H", data, offset)[0]
    offset += 2
    floor_sprites: list[int] = []
    for _ in range(floor_count):
        if offset + 10 > len(data):
            raise ValueError(f"Labyrinth {labyrinth_id} ends inside its floor table")
        floor_sprites.append(struct.unpack_from("<H", data, offset + 6)[0])
        offset += 10

    object_count = struct.unpack_from("<H", data, offset)[0]
    offset += 2
    objects: list[SpriteReference] = []
    for _ in range(object_count):
        if offset + 16 > len(data):
            raise ValueError(f"Labyrinth {labyrinth_id} ends inside its object table")
        sprite_id = struct.unpack_from("<H", data, offset + 4)[0]
        frame_count = max(1, data[offset + 6])
        width, height = struct.unpack_from("<HH", data, offset + 8)
        objects.append(SpriteReference(sprite_id, frame_count, width, height))
        offset += 16

    wall_count = struct.unpack_from("<H", data, offset)[0]
    offset += 2
    walls: list[SpriteReference] = []
    for _ in range(wall_count):
        if offset + 16 > len(data):
            raise ValueError(f"Labyrinth {labyrinth_id} ends inside its wall table")
        sprite_id = struct.unpack_from("<H", data, offset + 4)[0]
        frame_count = max(1, data[offset + 6])
        width, height = struct.unpack_from("<HH", data, offset + 10)
        overlay_count = struct.unpack_from("<H", data, offset + 14)[0]
        walls.append(SpriteReference(sprite_id, frame_count, width, height))
        offset += 16 + overlay_count * 12

    if offset != len(data):
        raise ValueError(
            f"Labyrinth {labyrinth_id} has {len(data) - offset} unexplained bytes"
        )
    return LabyrinthStyle(
        labyrinth_id,
        tuple(floor_sprites),
        tuple(object_groups),
        tuple(objects),
        tuple(walls),
    )


def parse_tile_info(data: bytes, tileset_id: int) -> list[TileInfo | None]:
    if len(data) % 8:
        raise ValueError(f"Tileset metadata {tileset_id} is not a multiple of 8 bytes")
    result: list[TileInfo | None] = [None]
    for offset in range(0, len(data), 8):
        flags, image_number, frame_count, _unknown = struct.unpack_from("<IHBB", data, offset)
        result.append(TileInfo(flags, image_number, frame_count))
    return result


def decode_map_cell(b1: int, b2: int, b3: int) -> tuple[int | None, int | None]:
    overlay_packed = (b1 << 4) | (b2 >> 4)
    underlay_packed = ((b2 & 0x0F) << 8) | b3
    underlay = underlay_packed - 1 if underlay_packed else None
    overlay = overlay_packed - 1 if overlay_packed else None
    return underlay, overlay


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    return (
        struct.pack(">I", len(payload)) + kind + payload
        + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
    )


def write_indexed_png(
    output_path: Path,
    width: int,
    height: int,
    palette: bytes,
    rows: list[bytes],
) -> None:
    if len(palette) != 256 * 3:
        raise ValueError(f"PNG palette contains {len(palette)} bytes; expected 768")
    if len(rows) != height or any(len(row) != width for row in rows):
        raise ValueError("PNG scanline dimensions do not match the image header")
    compressor = zlib.compressobj(level=9)
    compressed = bytearray()
    for row in rows:
        compressed.extend(compressor.compress(b"\0" + row))
    compressed.extend(compressor.flush())
    output_path.parent.mkdir(parents=True, exist_ok=True)
    header = struct.pack(">IIBBBBB", width, height, 8, 3, 0, 0, 0)
    with output_path.open("wb") as stream:
        stream.write(b"\x89PNG\r\n\x1a\n")
        stream.write(png_chunk(b"IHDR", header))
        stream.write(png_chunk(b"PLTE", palette))
        stream.write(png_chunk(b"IDAT", bytes(compressed)))
        stream.write(png_chunk(b"IEND", b""))


class MapRenderer:
    def __init__(
        self,
        tile_metadata: list[list[TileInfo | None]],
        tile_graphics: list[bytes],
        palettes: list[bytes],
        common_palette: bytes,
    ) -> None:
        self.tile_metadata = tile_metadata
        self.tile_graphics = tile_graphics
        self.palettes = palettes
        self.common_palette = common_palette

    def palette_for(self, palette_id: int) -> bytes:
        if palette_id <= 0 or palette_id > len(self.palettes):
            raise ValueError(f"Palette {palette_id} is outside the shipped palette archive")
        variable = self.palettes[palette_id - 1]
        if len(variable) != 192 * 3:
            raise ValueError(f"Palette {palette_id} has {len(variable)} bytes; expected 576")
        if len(self.common_palette) != 64 * 3:
            raise ValueError("Albion common palette must contain 64 RGB entries")
        return variable + self.common_palette

    def tile_pixels(self, tileset_id: int, tile_id: int | None) -> bytes | None:
        if tile_id is None or tile_id <= 0:
            return None
        if tileset_id <= 0 or tileset_id > len(self.tile_metadata):
            return None
        metadata = self.tile_metadata[tileset_id - 1]
        if tile_id >= len(metadata):
            return None
        tile = metadata[tile_id]
        if tile is None or tile.image_number == 0xFFFF or tile.flags & TILE_FLAG_NO_DRAW:
            return None
        graphics = self.tile_graphics[tileset_id - 1]
        start = tile.image_number * TILE_PIXELS * TILE_PIXELS
        end = start + TILE_PIXELS * TILE_PIXELS
        if end > len(graphics):
            raise ValueError(
                f"Tileset {tileset_id}, tile {tile_id} references image "
                f"{tile.image_number}, outside {len(graphics) // 256} frames"
            )
        return graphics[start:end]

    def render(self, map_data: Map2D, output_path: Path) -> None:
        cells: list[tuple[int | None, int | None]] = []
        for offset in range(0, len(map_data.layout), 3):
            cells.append(decode_map_cell(*map_data.layout[offset : offset + 3]))

        blank = bytes(TILE_PIXELS * TILE_PIXELS)
        composite_cache: dict[tuple[int | None, int | None], bytes] = {}

        def composite(pair: tuple[int | None, int | None]) -> bytes:
            cached = composite_cache.get(pair)
            if cached is not None:
                return cached
            underlay = self.tile_pixels(map_data.tileset_id, pair[0]) or blank
            overlay = self.tile_pixels(map_data.tileset_id, pair[1])
            if overlay is None:
                result = underlay
            else:
                result = bytes(top if top else bottom for bottom, top in zip(underlay, overlay))
            composite_cache[pair] = result
            return result

        output_rows: list[bytes] = []
        for map_y in range(map_data.height):
            row_cells = cells[map_y * map_data.width : (map_y + 1) * map_data.width]
            rendered = [composite(cell) for cell in row_cells]
            for pixel_y in range(TILE_PIXELS):
                start = pixel_y * TILE_PIXELS
                output_rows.append(b"".join(tile[start : start + TILE_PIXELS] for tile in rendered))

        write_indexed_png(
            output_path,
            map_data.width * TILE_PIXELS,
            map_data.height * TILE_PIXELS,
            self.palette_for(map_data.palette_id),
            output_rows,
        )


class Map3DRenderer:
    """Hybrid top-down plan using Albion's original 3D textures and sprites."""

    def __init__(
        self,
        labyrinths: dict[int, LabyrinthStyle],
        floor_graphics: dict[int, bytes],
        wall_graphics: dict[int, bytes],
        object_graphics: dict[int, bytes],
        palettes: list[bytes],
        common_palette: bytes,
    ) -> None:
        self.labyrinths = labyrinths
        self.floor_graphics = floor_graphics
        self.wall_graphics = wall_graphics
        self.object_graphics = object_graphics
        self.palettes = palettes
        self.common_palette = common_palette
        self._floor_cache: dict[tuple[int, int], bytes | None] = {}
        self._wall_cache: dict[tuple[int, int], bytes | None] = {}
        self._object_cache: dict[tuple[int, int], tuple[int, int, bytes] | None] = {}

    def palette_for(self, palette_id: int) -> bytes:
        if palette_id <= 0 or palette_id > len(self.palettes):
            raise ValueError(f"Palette {palette_id} is outside the shipped palette archive")
        return self.palettes[palette_id - 1] + self.common_palette

    @staticmethod
    def nearest_palette_index(palette: bytes, colour: tuple[int, int, int]) -> int:
        best_index = 0
        best_distance = 1 << 30
        for index in range(256):
            red, green, blue = palette[index * 3 : index * 3 + 3]
            distance = (
                (red - colour[0]) ** 2
                + (green - colour[1]) ** 2
                + (blue - colour[2]) ** 2
            )
            if distance < best_distance:
                best_index = index
                best_distance = distance
        return best_index

    @staticmethod
    def sample_texture(
        pixels: bytes,
        width: int,
        height: int,
        output_width: int,
        output_height: int,
        *,
        transposed: bool = False,
    ) -> bytes | None:
        frame_size = width * height
        if width <= 0 or height <= 0 or len(pixels) < frame_size:
            return None
        result = bytearray(output_width * output_height)
        for output_y in range(output_height):
            for output_x in range(output_width):
                if transposed:
                    source_x = min(width - 1, output_y * width // output_height)
                    source_y = min(height - 1, output_x * height // output_width)
                else:
                    source_x = min(width - 1, output_x * width // output_width)
                    source_y = min(height - 1, output_y * height // output_height)
                result[output_y * output_width + output_x] = (
                    pixels[source_y * width + source_x]
                )
        return bytes(result)

    def floor_tile(
        self,
        labyrinth: LabyrinthStyle,
        floor_index: int,
    ) -> bytes | None:
        key = (labyrinth.labyrinth_id, floor_index)
        if key in self._floor_cache:
            return self._floor_cache[key]
        if floor_index <= 0 or floor_index > len(labyrinth.floor_sprites):
            result = None
        else:
            sprite_id = labyrinth.floor_sprites[floor_index - 1]
            pixels = self.floor_graphics.get(sprite_id, b"")
            result = self.sample_texture(
                pixels, 64, 64, TILE_PIXELS, TILE_PIXELS
            )
        self._floor_cache[key] = result
        return result

    def wall_tile(
        self,
        labyrinth: LabyrinthStyle,
        wall_index: int,
    ) -> bytes | None:
        key = (labyrinth.labyrinth_id, wall_index)
        if key in self._wall_cache:
            return self._wall_cache[key]
        if wall_index < 0 or wall_index >= len(labyrinth.walls):
            result = None
        else:
            reference = labyrinth.walls[wall_index]
            pixels = self.wall_graphics.get(reference.sprite_id, b"")
            result = self.sample_texture(
                pixels,
                reference.width,
                reference.height,
                TILE_PIXELS - 4,
                TILE_PIXELS - 4,
                transposed=True,
            )
        self._wall_cache[key] = result
        return result

    def object_thumbnail(
        self,
        labyrinth: LabyrinthStyle,
        group_index: int,
    ) -> tuple[int, int, bytes] | None:
        key = (labyrinth.labyrinth_id, group_index)
        if key in self._object_cache:
            return self._object_cache[key]
        if group_index < 0 or group_index >= len(labyrinth.object_groups):
            self._object_cache[key] = None
            return None

        references = [
            labyrinth.objects[index]
            for index in labyrinth.object_groups[group_index]
            if 0 <= index < len(labyrinth.objects)
            and labyrinth.objects[index].sprite_id in self.object_graphics
        ]
        if not references:
            self._object_cache[key] = None
            return None
        reference = max(references, key=lambda item: item.width * item.height)
        pixels = self.object_graphics[reference.sprite_id]
        frame_size = reference.width * reference.height
        if reference.width <= 0 or reference.height <= 0 or len(pixels) < frame_size:
            self._object_cache[key] = None
            return None

        frame = pixels[:frame_size]
        occupied = [
            (index % reference.width, index // reference.width)
            for index, value in enumerate(frame)
            if value
        ]
        if not occupied:
            self._object_cache[key] = None
            return None
        min_x = min(item[0] for item in occupied)
        max_x = max(item[0] for item in occupied)
        min_y = min(item[1] for item in occupied)
        max_y = max(item[1] for item in occupied)
        crop_width = max_x - min_x + 1
        crop_height = max_y - min_y + 1
        scale = min(10 / crop_width, 10 / crop_height)
        output_width = max(2, min(10, round(crop_width * scale)))
        output_height = max(2, min(10, round(crop_height * scale)))
        result = bytearray(output_width * output_height)
        for output_y in range(output_height):
            source_y = min(
                max_y,
                min_y + output_y * crop_height // output_height,
            )
            for output_x in range(output_width):
                source_x = min(
                    max_x,
                    min_x + output_x * crop_width // output_width,
                )
                result[output_y * output_width + output_x] = (
                    frame[source_y * reference.width + source_x]
                )
        thumbnail = (output_width, output_height, bytes(result))
        self._object_cache[key] = thumbnail
        return thumbnail

    def render(self, map_data: Map3D, output_path: Path) -> None:
        palette = self.palette_for(map_data.palette_id)
        void_index = self.nearest_palette_index(palette, (5, 9, 15))
        grid_index = self.nearest_palette_index(palette, (20, 30, 40))
        outline_index = self.nearest_palette_index(palette, (8, 12, 18))
        fallback_wall = self.nearest_palette_index(palette, (92, 108, 116))
        fallback_object = self.nearest_palette_index(palette, (220, 164, 46))
        labyrinth = self.labyrinths.get(map_data.labyrinth_id)
        rows = [
            bytearray([void_index]) * (map_data.width * TILE_PIXELS)
            for _ in range(map_data.height * TILE_PIXELS)
        ]
        for map_y in range(map_data.height):
            for map_x in range(map_data.width):
                cell = map_y * map_data.width + map_x
                content = map_data.contents[cell]
                floor = map_data.floors[cell]
                left = map_x * TILE_PIXELS
                top = map_y * TILE_PIXELS

                floor_pixels = self.floor_tile(labyrinth, floor) if labyrinth else None
                if floor_pixels:
                    for pixel_y in range(TILE_PIXELS):
                        start = pixel_y * TILE_PIXELS
                        rows[top + pixel_y][left : left + TILE_PIXELS] = (
                            floor_pixels[start : start + TILE_PIXELS]
                        )
                rows[top + TILE_PIXELS - 1][left : left + TILE_PIXELS] = (
                    bytes([grid_index]) * TILE_PIXELS
                )
                for pixel_y in range(TILE_PIXELS):
                    rows[top + pixel_y][left + TILE_PIXELS - 1] = grid_index

                if content >= 100:
                    wall_pixels = (
                        self.wall_tile(labyrinth, content - 100)
                        if labyrinth else None
                    )
                    for pixel_y in range(1, TILE_PIXELS - 1):
                        rows[top + pixel_y][left + 1 : left + TILE_PIXELS - 1] = (
                            bytes([outline_index]) * (TILE_PIXELS - 2)
                        )
                    if wall_pixels:
                        for pixel_y in range(TILE_PIXELS - 4):
                            start = pixel_y * (TILE_PIXELS - 4)
                            rows[top + pixel_y + 2][left + 2 : left + TILE_PIXELS - 2] = (
                                wall_pixels[start : start + TILE_PIXELS - 4]
                            )
                    else:
                        for pixel_y in range(2, TILE_PIXELS - 2):
                            rows[top + pixel_y][left + 2 : left + TILE_PIXELS - 2] = (
                                bytes([fallback_wall]) * (TILE_PIXELS - 4)
                            )
                elif content and labyrinth:
                    thumbnail = self.object_thumbnail(labyrinth, content - 1)
                    if thumbnail:
                        object_width, object_height, object_pixels = thumbnail
                        object_left = left + (TILE_PIXELS - object_width) // 2
                        object_top = top + (TILE_PIXELS - object_height) // 2
                        for pixel_y in range(object_height):
                            for pixel_x in range(object_width):
                                value = object_pixels[pixel_y * object_width + pixel_x]
                                if value:
                                    rows[object_top + pixel_y][object_left + pixel_x] = value
                    else:
                        for pixel_y in range(6, 10):
                            rows[top + pixel_y][left + 6 : left + 10] = (
                                bytes([fallback_object]) * 4
                            )

        write_indexed_png(
            output_path,
            map_data.width * TILE_PIXELS,
            map_data.height * TILE_PIXELS,
            palette,
            [bytes(row) for row in rows],
        )


def map_is_outdoors(map_data: Map2D | Map3D) -> bool:
    return isinstance(map_data, Map2D) and map_data.tileset_id in (1, 2, 4)


def event_destinations(
    map_data: Map2D | Map3D,
    start_index: int,
) -> list[dict[str, int]]:
    pending = [start_index]
    visited: set[int] = set()
    destinations: dict[tuple[int, int, int, int], dict[str, int]] = {}
    while pending:
        index = pending.pop()
        if index == 0xFFFF or index in visited or index >= len(map_data.events):
            continue
        visited.add(index)
        record = map_data.events[index]
        event_type = record[0]
        if event_type == EVENT_TYPE_MAP_EXIT:
            x, y, direction, exit_type, _unknown, target_map_id = struct.unpack_from(
                "<5BH", record, 1
            )
            target_map_id = target_map_id or map_data.map_id
            key = (target_map_id, x, y, direction)
            destinations[key] = {
                "mapId": target_map_id,
                "x": x,
                "y": y,
                "direction": direction,
                "exitType": exit_type,
                "eventIndex": index,
            }
        pending.append(struct.unpack_from("<H", record, 10)[0])
        if event_type == EVENT_TYPE_QUERY:
            pending.append(struct.unpack_from("<H", record, 8)[0])
    return list(destinations.values())


def entrance_markers(
    map_data: Map2D | Map3D,
    all_maps: dict[int, Map2D | Map3D],
) -> list[dict[str, object]]:
    zones_by_event: dict[int, list[MapZone]] = {}
    for zone in map_data.zones:
        if zone.global_zone or zone.event_index == 0xFFFF:
            continue
        zones_by_event.setdefault(zone.event_index, []).append(zone)

    markers: list[dict[str, object]] = []
    for event_index, zones in zones_by_event.items():
        destinations = event_destinations(map_data, event_index)
        if not destinations:
            continue
        non_self_destinations = [
            item for item in destinations if int(item["mapId"]) != map_data.map_id
        ]
        if non_self_destinations:
            destinations = non_self_destinations
        for destination in destinations:
            target = all_maps.get(int(destination["mapId"]))
            destination["name"] = MAP_NAMES.get(
                int(destination["mapId"]), f"Map {destination['mapId']}"
            )
            destination["available"] = target is not None

        target_maps = [all_maps.get(int(item["mapId"])) for item in destinations]
        valid_targets = [item for item in target_maps if item is not None]
        all_self = all(int(item["mapId"]) == map_data.map_id for item in destinations)
        city_target = map_is_outdoors(map_data) and any(
            isinstance(item, Map3D)
            and item.map_id in (110, 283, 284)
            for item in valid_targets
        )
        if all_self:
            marker_type = "passage"
        elif city_target:
            marker_type = "city"
        elif any(map_is_outdoors(item) for item in valid_targets) and not map_is_outdoors(map_data):
            marker_type = "exit"
        else:
            marker_type = "entrance"

        source_tiles = [{"x": zone.x, "y": zone.y} for zone in zones]
        position = {
            "x": round(sum(zone.x for zone in zones) / len(zones), 2),
            "y": round(sum(zone.y for zone in zones) / len(zones), 2),
        }
        if len(destinations) == 1:
            target_name = str(destinations[0]["name"])
            if marker_type == "exit":
                name = f"Leave for {target_name}"
            elif marker_type == "passage":
                name = "Internal passage"
            else:
                name = f"Enter {target_name}"
        else:
            name = "Conditional passage"

        markers.append({
            "id": f"{map_data.map_id}:{event_index}",
            "name": name,
            "type": marker_type,
            "position": position,
            "sourceTiles": source_tiles,
            "trigger": zones[0].trigger,
            "eventIndex": event_index,
            "destinations": destinations,
        })
    return markers


def npc_markers(
    map_data: Map2D | Map3D,
    profiles: dict[int, NpcProfile],
) -> list[dict[str, object]]:
    """Build named NPC pins from character sheets and map waypoint records."""
    movement_names = {
        0: "Daily route",
        1: "Wanders nearby",
        2: "Stationary",
        3: "Approaches the party",
        4: "Daily route",
    }
    markers: list[dict[str, object]] = []
    for npc in map_data.npcs:
        if (
            npc.npc_type != 1
            or npc.flags & NPC_FLAG_SIMPLE_MESSAGE
            or npc.position is None
        ):
            continue
        profile = profiles.get(npc.sheet_id)
        if profile is None or not profile.name:
            continue
        x, y = npc.position
        route_count = len(npc.route_positions)
        markers.append({
            "id": f"npc:{map_data.map_id}:{npc.slot}",
            "slot": npc.slot,
            "sheetId": npc.sheet_id,
            "name": profile.name,
            "type": "npc",
            "position": {"x": x, "y": y},
            "sourceTiles": [{"x": x, "y": y}],
            "movement": movement_names.get(npc.movement, f"Movement {npc.movement}"),
            "scheduledPositions": route_count,
            "profile": {
                "race": profile.race,
                "gender": profile.gender,
                "class": profile.player_class,
                "level": profile.level,
                "portraitId": profile.portrait_id,
                "spriteId": profile.sprite_id,
            },
        })
    return markers


def map_group(
    map_id: int,
    map_data: Map2D | Map3D,
    name: str,
) -> tuple[str, bool]:
    development = bool(re.match(r"(?:Test|Development|Broken)", name))
    if development:
        return "Development maps", True
    if map_is_outdoors(map_data):
        return "Outdoor regions", False
    if isinstance(map_data, Map3D) and map_id in (110, 283, 284):
        return "Enterable cities", False
    if isinstance(map_data, Map3D):
        return "First-person floor plans", False
    if map_id < 150:
        return "Jirinaar and Gratogel", False
    if map_id < 200:
        return "Toronto and Kenget Kamulos", False
    if map_id < 230:
        return "World locations", False
    if map_id < 290:
        return "Umajo, Beloveno and Srimalinar", False
    if map_id < 310:
        return "Toronto", False
    return "Endgame and Dji-Cantos", False


def write_atlas_config(
    output_path: Path,
    maps: list[dict[str, object]],
    source_hash: str,
) -> None:
    config = {
        "formatVersion": 2,
        "tileSize": TILE_PIXELS,
        "coordinateOrigin": 1,
        "defaultMapId": 200,
        "coverage": {
            "rendered2d": sum(item["mapType"] == "2d" for item in maps),
            "rendered3d": sum(item["mapType"] == "3d-plan" for item in maps),
            "productionMaps": sum(not bool(item["development"]) for item in maps),
            "developmentMaps": sum(bool(item["development"]) for item in maps),
            "entrances": sum(len(item.get("markers", [])) for item in maps),
            "npcs": sum(len(item.get("npcs", [])) for item in maps),
        },
        "source": {
            "game": "Albion",
            "edition": "English GOG release",
            "mainExeSha256": source_hash,
            "method": (
                "Generated directly from MAPDATA, LABDATA, ICONDAT, ICONGFX, "
                "3DFLOOR, 3DWALLS, 3DOBJEC, NPCCHAR and PALETTE archives; "
                "doorway links follow the original event chains and NPC pins "
                "use original character sheets and waypoint records"
            ),
        },
        "maps": maps,
    }
    payload = json.dumps(config, indent=2, ensure_ascii=False)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        "// Generated from the installed Albion game by tools/generate_albion_atlas.py.\n"
        f"window.ALBION_ATLAS_CONFIG = {payload};\n",
        encoding="utf-8",
    )


def read_game_archives(source: Path) -> GameArchives:
    image_path = source / "game.gog"
    if not image_path.is_file():
        raise FileNotFoundError(f"Albion CD image not found: {image_path}")
    with Mode2IsoImage(image_path) as image:
        prefix = "ALBION/XLDLIBS"
        tile_metadata = decode_xld(image.read(f"{prefix}/ICONDAT0.XLD"), "ICONDAT0.XLD")
        tile_graphics = decode_xld(image.read(f"{prefix}/ICONGFX0.XLD"), "ICONGFX0.XLD")
        palettes = decode_xld(image.read(f"{prefix}/PALETTE0.XLD"), "PALETTE0.XLD")
        common_palette = image.read(f"{prefix}/PALETTE.000")
        map_archives = []
        for hundred in (1, 2, 3):
            name = f"MAPDATA{hundred}.XLD"
            archive = decode_xld(image.read(f"{prefix}/{name}"), name)
            map_archives.extend((hundred * 100 + index, data) for index, data in enumerate(archive))

        def asset_series(filename: str, first_id: int) -> dict[int, bytes]:
            archive = decode_xld(image.read(f"{prefix}/{filename}"), filename)
            return {
                first_id + index: data
                for index, data in enumerate(archive)
                if data
            }

        raw_labyrinths = {}
        raw_labyrinths.update(asset_series("LABDATA0.XLD", 1))
        raw_labyrinths.update(asset_series("LABDATA1.XLD", 100))
        raw_labyrinths.update(asset_series("LABDATA2.XLD", 200))
        labyrinths = {
            labyrinth_id: parse_labyrinth(labyrinth_id, data)
            for labyrinth_id, data in raw_labyrinths.items()
        }

        floor_graphics = {}
        floor_graphics.update(asset_series("3DFLOOR0.XLD", 1))
        floor_graphics.update(asset_series("3DFLOOR1.XLD", 100))
        floor_graphics.update(asset_series("3DFLOOR2.XLD", 200))

        wall_graphics = {}
        wall_graphics.update(asset_series("3DWALLS0.XLD", 1))
        wall_graphics.update(asset_series("3DWALLS1.XLD", 100))

        object_graphics = {}
        object_graphics.update(asset_series("3DOBJEC0.XLD", 1))
        object_graphics.update(asset_series("3DOBJEC1.XLD", 100))
        object_graphics.update(asset_series("3DOBJEC2.XLD", 200))
        object_graphics.update(asset_series("3DOBJEC3.XLD", 300))

        npc_profiles = {}
        for filename, first_id in (
            ("NPCCHAR0.XLD", 1),
            ("NPCCHAR1.XLD", 100),
            ("NPCCHAR2.XLD", 200),
        ):
            path = f"{prefix}/INITIAL/{filename}"
            archive = decode_xld(image.read(path), filename)
            for index, data in enumerate(archive):
                profile = parse_npc_profile(first_id + index, data)
                if profile:
                    npc_profiles[profile.sheet_id] = profile

    return GameArchives(
        tile_metadata,
        tile_graphics,
        palettes,
        map_archives,
        common_palette,
        labyrinths,
        floor_graphics,
        wall_graphics,
        object_graphics,
        npc_profiles,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Installed Albion directory containing MAIN.EXE and game.gog")
    parser.add_argument("output", type=Path, help="Guide directory containing images/ and js/")
    parser.add_argument(
        "--production-only", action="store_true",
        help="Omit test, broken and otherwise development-only maps",
    )
    parser.add_argument(
        "--map", dest="map_ids", action="append", type=int,
        help="Render only this map id (repeatable; useful for verification)",
    )
    args = parser.parse_args()

    source = args.source.resolve()
    output = args.output.resolve()
    main_exe = source / "MAIN.EXE"
    if not main_exe.is_file():
        raise FileNotFoundError(f"Albion executable not found: {main_exe}")
    source_hash = hashlib.sha256(main_exe.read_bytes()).hexdigest()
    if not source_hash.startswith("476227b0"):
        print(f"Warning: unrecognized MAIN.EXE SHA-256 {source_hash}; attempting extraction anyway")

    archives = read_game_archives(source)
    tile_metadata = [
        parse_tile_info(data, index + 1)
        for index, data in enumerate(archives.tile_metadata)
    ]
    renderer_2d = MapRenderer(
        tile_metadata,
        archives.tile_graphics,
        archives.palettes,
        archives.common_palette,
    )
    renderer_3d = Map3DRenderer(
        archives.labyrinths,
        archives.floor_graphics,
        archives.wall_graphics,
        archives.object_graphics,
        archives.palettes,
        archives.common_palette,
    )

    requested = set(args.map_ids or [])
    atlas_maps: list[dict[str, object]] = []
    skipped_development = 0
    parsed_maps = {
        map_id: map_data
        for map_id, data in archives.map_archives
        if (map_data := parse_map(map_id, data)) is not None
    }
    for map_id, map_data in parsed_maps.items():
        if requested and map_id not in requested:
            continue
        name = MAP_NAMES.get(map_id, f"Map {map_id}")
        group, development = map_group(map_id, map_data, name)
        if development and args.production_only and not requested:
            skipped_development += 1
            continue
        slug = f"{map_id}-{slugify(name)}"
        relative_url = f"images/albion-atlas/{slug}.png"
        output_path = output / relative_url
        if isinstance(map_data, Map2D):
            renderer_2d.render(map_data, output_path)
            map_type = "2d"
            asset_id = map_data.tileset_id
            asset_name = TILESET_NAMES.get(
                map_data.tileset_id, f"Tileset {map_data.tileset_id}"
            )
        else:
            renderer_3d.render(map_data, output_path)
            map_type = "3d-plan"
            asset_id = map_data.labyrinth_id
            asset_name = f"Labyrinth {map_data.labyrinth_id}"

        markers = entrance_markers(map_data, parsed_maps)
        npcs = npc_markers(map_data, archives.npc_profiles)
        atlas_maps.append({
            "id": map_id,
            "name": name,
            "group": group,
            "development": development,
            "mapType": map_type,
            "imageUrl": relative_url,
            "widthTiles": map_data.width,
            "heightTiles": map_data.height,
            "widthPixels": map_data.width * TILE_PIXELS,
            "heightPixels": map_data.height * TILE_PIXELS,
            "assetId": asset_id,
            "tilesetId": asset_id,
            "tileset": asset_name,
            "paletteId": map_data.palette_id,
            "npcSlots": map_data.npc_count,
            "eventCount": len(map_data.events),
            "entranceCount": len(markers),
            "npcCount": len(npcs),
            "markers": markers,
            "npcs": npcs,
        })
        print(
            f"Rendered {map_id:03d} {name} "
            f"({map_type}, {map_data.width}x{map_data.height} tiles)"
        )

    atlas_maps.sort(
        key=lambda item: (
            GROUP_ORDER.get(str(item["group"]), len(GROUP_ORDER)),
            int(item["id"]),
        )
    )
    if not atlas_maps:
        raise ValueError("No maps matched the requested selection")
    write_atlas_config(output / "js/AlbionAtlasData.js", atlas_maps, source_hash)
    total_pixels = sum(int(item["widthPixels"]) * int(item["heightPixels"]) for item in atlas_maps)
    print("Generated Albion atlas assets:")
    print(f"  {output / 'images/albion-atlas'} ({len(atlas_maps)} maps, {total_pixels:,} pixels)")
    print(f"  {output / 'js/AlbionAtlasData.js'}")
    print(f"  skipped {skipped_development} development maps")


if __name__ == "__main__":
    main()
