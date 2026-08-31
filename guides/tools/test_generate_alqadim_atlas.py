"""Focused, asset-free regressions for the Al-Qadim atlas decoder."""

import struct
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate_alqadim_atlas as atlas


def object_blob(*records: tuple[int, bytes]) -> bytes:
    directory_end = 4 + len(records) * 8
    directory = bytearray(struct.pack("<HH", 0, directory_end))
    payload = bytearray()
    for record_type, record in records:
        directory += struct.pack("<IHH", directory_end + len(payload), len(record), record_type)
        payload += record
    return bytes(directory + payload)


def drawable_record(world_y: int, world_x: int, layer: int, sprite_id: int, top: int, left: int) -> bytes:
    values = [0] * 11
    values[3:6] = (world_y, world_x, layer)
    values[10] = sprite_id
    cached = [1, 4, 0, 0, top & 0xFFFF, left & 0xFFFF, 0, 0]
    return struct.pack("<11H8H", *(values + cached))


class AtlasFormatTests(unittest.TestCase):
    def test_world_names_and_cluebook_charts_follow_game_evidence(self) -> None:
        expected = {
            "ACIDA": ("Sorcerer's Tower", "map_sorcerers_tower_l1.png"),
            "DEDHOLD": ("Rotting Ship's Hold", "map_rotting_ships_hold.png"),
            "FEUD": ("Island of Al'Katraz", "map_island_alkatraz.png"),
            "FINALA": ("Al-Naqqil", "map_al_naqqil.png"),
            "FINALB": ("Unknown Plane", "map_unknown_plane.png"),
            "HOLD": ("Ship's Hold", "map_ships_hold.png"),
            "OASIS": ("Western Desert", "map_western_desert.png"),
            "OGRIMA": ("Isle of Hajar", "map_isle_hajar.png"),
            "PAL0": ("Caliph's Palace", "map_caliphs_palace.png"),
            "ROAD": ("Bandar al-Sa'adat", "map_bandar_al_sadat.png"),
            "ROADB": ("Palace Facade", "map_palace_facade.png"),
            "VOICE": ("Isle of Aballat", "map_isle_aballat.png"),
        }
        for engine_id, (title, annotation_key) in expected.items():
            with self.subTest(engine_id=engine_id):
                self.assertEqual(atlas.WORLD_LABELS[engine_id], title)
                self.assertEqual(atlas.ANNOTATION_KEYS[engine_id], annotation_key)

        self.assertEqual(atlas.ANNOTATION_KEYS["SHIPA"], "map_the_ship.png")
        self.assertEqual(atlas.ANNOTATION_KEYS["SHIPB"], "map_the_ship.png")
        self.assertIn("player's vessel only", atlas.ANNOTATION_NOTES["SHIPB"])
        self.assertEqual(
            [chart["label"] for chart in atlas.CHART_OVERRIDES["ACIDA"]],
            ["Level 1", "Level 2"],
        )
        self.assertEqual(atlas.CHART_OVERRIDES["SHIPB"][0]["label"], "Player vessel")

    def test_planar_pixels_are_interleaved_by_vga_plane(self) -> None:
        self.assertEqual(
            atlas.decode_planar_pixels(bytes((1, 5, 2, 6, 3, 7, 4, 8)), 2, 1),
            bytes((1, 2, 3, 4, 5, 6, 7, 8)),
        )

    def test_signed_cached_coordinate(self) -> None:
        self.assertEqual(atlas.s16(0xFFF9), -7)
        self.assertEqual(atlas.s16(23), 23)

    def test_opaque_type2_scenery_is_not_discarded(self) -> None:
        # Closed doors in TOWN are kind-0 (opaque) type-2 objects.  An older
        # heuristic discarded every such object and left only the grey floor
        # aperture beneath each door.
        sprite = atlas.Sprite(1, 0, 0, 1, 0, bytes((7, 7, 7, 7)))
        blob = object_blob((2, drawable_record(3, 2, 2, 0, 3, 2)))
        entries = [(0, 0)] * 8 + [(0, len(blob))]
        raster = bytearray(8 * 8)

        banks = [[], [sprite], []]
        with patch.object(atlas, "decode_sprite_bank", side_effect=banks):
            scenery, foreground, actors, names, staged, staged_names, roof = atlas.composite_world_objects(
                blob, entries, raster, 8, 8
            )

        self.assertEqual(
            (scenery, foreground, actors, names, staged, staged_names, roof),
            (1, 0, 0, (), 0, (), None),
        )
        self.assertEqual(raster[3 * 8 + 2 : 3 * 8 + 6], bytes((7, 7, 7, 7)))

    def test_depth_anchor_not_cached_top_controls_scenery_order(self) -> None:
        early = atlas.Sprite(1, 0, 0, 1, 0, bytes((3, 3, 3, 3)))
        late = atlas.Sprite(1, 0, 0, 1, 0, bytes((9, 9, 9, 9)))
        # The later depth anchor deliberately has the smaller cached top. Both
        # paint the same pixels, so sorting by cached top would produce 3.
        blob = object_blob(
            (2, drawable_record(10, 2, 2, 0, 4, 2)),
            (2, drawable_record(20, 2, 2, 1, 4, 2)),
        )
        raster = bytearray(8 * 8)
        with patch.object(atlas, "decode_sprite_bank", side_effect=[[], [early, late], []]):
            atlas.composite_world_objects(blob, [(0, 0)] * 8 + [(0, len(blob))], raster, 8, 8)
        self.assertEqual(raster[4 * 8 + 2 : 4 * 8 + 6], bytes((9, 9, 9, 9)))

    def test_foreground_is_kept_out_of_cutaway_raster(self) -> None:
        roof = atlas.Sprite(1, 0, 0, 1, 0, bytes((6, 6, 6, 6)))
        blob = object_blob((2, drawable_record(5, 1, 3, 0, 2, 1)))
        raster = bytearray(8 * 8)
        with patch.object(atlas, "decode_sprite_bank", side_effect=[[], [], [roof]]):
            _, foreground, _, _, _, _, roofed = atlas.composite_world_objects(
                blob, [(0, 0)] * 8 + [(0, len(blob))], raster, 8, 8
            )
        self.assertEqual(foreground, 1)
        self.assertEqual(raster[2 * 8 + 1 : 2 * 8 + 5], bytes(4))
        self.assertEqual(roofed[2 * 8 + 1 : 2 * 8 + 5], bytes((6, 6, 6, 6)))

    def test_scripted_southern_cast_is_metadata_not_map_content(self) -> None:
        def actor(y: int, x: int, name: str) -> bytes:
            record = bytearray(144)
            struct.pack_into("<11H", record, 0, 0, 0, 0, y, x, 1, 0, 0, 0, 0, 0)
            record[112 : 112 + len(name)] = name.encode("ascii")
            return bytes(record)

        sprite = atlas.Sprite(1, 0, 0, 1, 0, bytes((7, 7, 7, 7)))
        blob = object_blob(
            (1, actor(63, 5, "Sailor1")),
            (1, actor(62, 10, "Sailor2")),
            (1, actor(61, 15, "Caliph")),
            (2, drawable_record(60, 20, 2, 0, 60, 20)),
        )
        raster = bytearray(64 * 64)
        with patch.object(atlas, "decode_sprite_bank", side_effect=[[sprite], [sprite], []]):
            scenery, _, actors, names, staged, staged_names, _ = atlas.composite_world_objects(
                blob, [(0, 0)] * 8 + [(0, len(blob))], raster, 64, 64
            )

        self.assertEqual((scenery, actors, names, staged), (0, 3, (), 1))
        self.assertEqual([actor["name"] for actor in staged_names], ["Caliph", "Sailor2", "Sailor1"])
        self.assertTrue(all(actor["positionKind"] == "engine-staging" for actor in staged_names))
        self.assertTrue(all(actor["spriteWidth"] == 4 for actor in staged_names))
        self.assertTrue(all(actor["spriteHeight"] == 1 for actor in staged_names))
        self.assertEqual(raster, bytes(64 * 64))


if __name__ == "__main__":
    unittest.main()
