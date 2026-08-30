"""Focused, asset-free regressions for the Al-Qadim atlas decoder."""

import struct
import unittest
from unittest.mock import patch

import generate_alqadim_atlas as atlas


def object_blob(record_type: int, record: bytes) -> bytes:
    directory_end = 12
    return struct.pack("<HHIHH", 0, directory_end, directory_end, len(record), record_type) + record


class AtlasFormatTests(unittest.TestCase):
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
        values = [0] * 11
        values[3:6] = (3, 2, 2)
        cached = [1, 4, 0, 0, 3, 2, 0, 0]
        record = struct.pack("<11H8H", *(values + cached))
        blob = object_blob(2, record)
        entries = [(0, 0)] * 8 + [(0, len(blob))]
        raster = bytearray(8 * 8)

        banks = [[], [sprite], []]
        with patch.object(atlas, "decode_sprite_bank", side_effect=banks):
            scenery, foreground, actors, names, roof = atlas.composite_world_objects(
                blob, entries, raster, 8, 8
            )

        self.assertEqual((scenery, foreground, actors, names, roof), (1, 0, 0, (), None))
        self.assertEqual(raster[3 * 8 + 2 : 3 * 8 + 6], bytes((7, 7, 7, 7)))


if __name__ == "__main__":
    unittest.main()
