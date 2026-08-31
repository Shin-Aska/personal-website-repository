"""Optional full-installation regressions for every shipped Al-Qadim world.

Set ``ALQADIM_GAME_DIR`` to an extracted installation.  CI without the private
game data skips this module; local reverse-engineering runs exercise all world
archives without writing generated images into the repository.
"""

from __future__ import annotations

import hashlib
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate_alqadim_atlas as atlas


GAME_DIR = Path(os.environ.get("ALQADIM_GAME_DIR", ""))


def world_files() -> list[Path]:
    worlds = GAME_DIR / "WORLDS"
    if not worlds.is_dir():
        return []
    return sorted(
        (path for path in worlds.iterdir() if path.suffix.upper() == ".LIB"),
        key=lambda path: path.stem.upper(),
    )


@unittest.skipUnless(os.environ.get("ALQADIM_GAME_DIR"), "set ALQADIM_GAME_DIR for asset integration")
class FullInstallationTests(unittest.TestCase):
    def test_all_shipped_worlds_decode_deterministically(self) -> None:
        paths = world_files()
        expected = set(atlas.WORLD_LABELS)
        actual = {path.stem.upper() for path in paths}
        self.assertEqual(actual, expected)
        self.assertEqual(len(paths), 31)

        details: dict[str, tuple[bool, int, int]] = {}

        def fingerprints() -> list[tuple[object, ...]]:
            result = []
            for path in paths:
                world = atlas.read_world(path)
                details[world.engine_id] = (
                    world.roofed_pixels is not None,
                    len(world.staged_actors),
                    world.staged_object_count,
                )
                result.append(
                    (
                        world.engine_id,
                        world.width,
                        world.height,
                        world.scenery_count,
                        world.foreground_count,
                        world.actor_count,
                        world.staged_object_count,
                        hashlib.sha256(world.pixels).hexdigest(),
                        hashlib.sha256(world.roofed_pixels or b"").hexdigest(),
                    )
                )
            return result

        # Hash and discard each decoded raster before opening the next world;
        # retaining both complete 31-world sets needlessly consumes hundreds
        # of megabytes in asset-validation jobs.
        self.assertEqual(fingerprints(), fingerprints())

        self.assertEqual(details["TOWN"], (True, 5, 2))
        self.assertTrue(details["HOLD"][0])
        self.assertFalse(details["OLDDUNG"][0])
        self.assertTrue(
            all(actors == 0 and objects == 0 for name, (_, actors, objects) in details.items() if name != "TOWN")
        )


if __name__ == "__main__":
    unittest.main()
