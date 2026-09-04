"""Completeness checks for every Al-Qadim world and cluebook chart."""

import json
import re
import unittest
from pathlib import Path
from typing import TypeAlias


ROOT = Path(__file__).resolve().parents[1]
JsonValue: TypeAlias = str | int | float | bool | None | list["JsonValue"] | dict[str, "JsonValue"]
JsonObject: TypeAlias = dict[str, JsonValue]


def load_catalogue() -> JsonObject:
    source = (ROOT / "js/AlQadimAtlasData.js").read_text(encoding="utf-8")
    match = re.search(r"=\s*(\{.*\});\s*$", source, re.S)
    if not match:
        raise AssertionError("AlQadimAtlasData.js does not contain a JSON catalogue")
    return json.loads(match.group(1))


def load_js_object_constant(name: str) -> JsonObject:
    source = (ROOT / "js/AlQadim.js").read_text(encoding="utf-8")
    match = re.search(
        rf"const {re.escape(name)} = Object\.freeze\((\{{.*?\}})\);",
        source,
        re.S,
    )
    if not match:
        raise AssertionError(f"{name} is missing from AlQadim.js")
    return json.loads(match.group(1))


def normalized_name(value: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", value.casefold().replace("’", "'")))


class AtlasCoverageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.annotations = json.loads(
            (ROOT / "js/AlqadimAnnotations.json").read_text(encoding="utf-8")
        )
        cls.catalogue = load_catalogue()

    def test_every_chart_location_is_hoverable_or_documented_as_unprinted(self) -> None:
        for chart_key, notes in self.annotations.items():
            with self.subTest(chart=chart_key):
                locations = {str(location["number"]) for location in notes.get("locations", [])}
                manual = {
                    str(location["number"])
                    for location in notes.get("locations", [])
                    if location.get("manualPositions")
                }
                manual.update(
                    str(number)
                    for number, positions in notes.get("manualHotspots", {}).items()
                    if positions
                )
                unprinted = {str(number) for number in notes.get("unprintedLocations", [])}
                self.assertFalse(manual & unprinted)
                self.assertEqual(locations, manual | unprinted)
                if notes.get("chartHasPrintedLabels") is False:
                    self.assertEqual(locations, unprinted)

    def test_every_chart_image_has_annotation_data(self) -> None:
        images = {path.name for path in (ROOT / "images/alqadim").glob("map_*.png")}
        self.assertEqual(images, set(self.annotations))

    def test_every_world_chart_resolves_and_can_supply_game_hints(self) -> None:
        self.assertEqual(self.catalogue["worldCount"], len(self.catalogue["worlds"]))
        self.assertEqual(31, self.catalogue["worldCount"])
        linked = set()
        for world in self.catalogue["worlds"]:
            charts = world.get("charts") or (
                [{"annotationKey": world["annotationKey"]}] if world.get("annotationKey") else []
            )
            for chart in charts:
                key = chart["annotationKey"]
                linked.add(key)
                with self.subTest(world=world["engineId"], chart=key):
                    self.assertIn(key, self.annotations)
                    notes = self.annotations[key]
                    manual = notes.get("manualHotspots", {})
                    for location in notes.get("locations", []):
                        number = str(location["number"])
                        can_hint = bool(
                            location.get("gamePositions")
                            or location.get("manualPositions")
                            or manual.get(number)
                            or number in {str(value) for value in notes.get("unprintedLocations", [])}
                        )
                        self.assertTrue(can_hint, f"{world['engineId']} cluebook #{number} has no hint evidence")

        self.assertEqual(set(self.annotations), linked)

    def test_every_world_render_and_referenced_actor_sprite_exists(self) -> None:
        referenced_sprites = set()
        for world in self.catalogue["worlds"]:
            with self.subTest(world=world["engineId"], layer="cutaway"):
                self.assertTrue((ROOT / world["image"]).is_file())
            if world.get("roofImage"):
                with self.subTest(world=world["engineId"], layer="roof"):
                    self.assertTrue((ROOT / world["roofImage"]).is_file())
            for actor in world.get("namedActors", []):
                sprite = actor.get("spriteImage")
                if not sprite:
                    continue
                referenced_sprites.add(sprite)
                with self.subTest(world=world["engineId"], actor=actor["name"]):
                    self.assertTrue((ROOT / sprite).is_file())
                    self.assertGreater(actor.get("spriteWidth", 0), 0)
                    self.assertGreater(actor.get("spriteHeight", 0), 0)

        self.assertGreater(len(referenced_sprites), 0)

    def test_zaratan_aliya_has_one_cluebook_authoritative_location(self) -> None:
        notes = self.annotations["map_zaratan.png"]
        aliya = [person for person in notes["inhabitants"] if person["name"].startswith("Aliya")]
        self.assertEqual([27], [person["location"] for person in aliya])
        location = next(location for location in notes["locations"] if location["number"] == 27)
        self.assertEqual(1, len(location["gamePositions"]))

    def test_every_walkthrough_chapter_links_to_valid_atlas_worlds(self) -> None:
        routes = load_js_object_constant("CHAPTER_ATLAS_ROUTES")
        self.assertEqual({str(value) for value in range(1, 20)}, set(routes))
        world_ids = {world["id"] for world in self.catalogue["worlds"]}
        for chapter, linked_worlds in routes.items():
            with self.subTest(chapter=chapter):
                self.assertTrue(linked_worlds)
                self.assertEqual(len(linked_worlds), len(set(linked_worlds)))
                self.assertTrue(set(linked_worlds) <= world_ids)

    def test_walkthrough_inline_atlas_targets_resolve_to_real_destinations(self) -> None:
        targets = load_js_object_constant("WALKTHROUGH_ATLAS_TARGETS")
        worlds = {world["id"]: world for world in self.catalogue["worlds"]}
        covered_chapters: set[int] = set()
        terms_by_chapter: dict[int, set[str]] = {}

        for target_id, target in targets.items():
            with self.subTest(target=target_id):
                world = worlds[target["worldId"]]
                self.assertTrue(target["terms"])
                self.assertTrue(target["chapters"])

                for chapter in target["chapters"]:
                    covered_chapters.add(chapter)
                    chapter_terms = terms_by_chapter.setdefault(chapter, set())
                    self.assertFalse(chapter_terms & set(target["terms"]))
                    chapter_terms.update(target["terms"])

                if "actorId" in target:
                    actor_ids = {actor["id"] for actor in world.get("namedActors", [])}
                    self.assertIn(target["actorId"], actor_ids)

                if "locationNumber" in target:
                    chart_keys = [
                        chart["annotationKey"]
                        for chart in world.get("charts", [])
                    ] or ([world["annotationKey"]] if world.get("annotationKey") else [])
                    location_numbers = {
                        location["number"]
                        for chart_key in chart_keys
                        for location in self.annotations[chart_key].get("locations", [])
                    }
                    self.assertIn(target["locationNumber"], location_numbers)

        self.assertEqual(set(range(1, 20)), covered_chapters)

    def test_actor_cluebook_aliases_resolve_to_real_records(self) -> None:
        aliases = load_js_object_constant("ATLAS_ACTOR_CLUEBOOK_ALIASES")
        worlds = {world["id"]: world for world in self.catalogue["worlds"]}
        self.assertEqual(9, sum(len(mapping) for mapping in aliases.values()))
        for world_id, mapping in aliases.items():
            with self.subTest(world=world_id):
                self.assertIn(world_id, worlds)
                world = worlds[world_id]
                engine_names = {
                    normalized_name(actor["name"])
                    for actor in world.get("namedActors", [])
                }
                chart_keys = [
                    chart["annotationKey"]
                    for chart in world.get("charts", [])
                ] or ([world["annotationKey"]] if world.get("annotationKey") else [])
                cluebook_names = {
                    normalized_name(person["name"])
                    for key in chart_keys
                    for person in self.annotations[key].get("inhabitants", [])
                }
                self.assertEqual(len(mapping), len(set(mapping.values())))
                for engine_name, cluebook_name in mapping.items():
                    self.assertIn(normalized_name(engine_name), engine_names)
                    self.assertIn(normalized_name(cluebook_name), cluebook_names)

    def test_actor_sidebar_navigation_uses_canonical_actor_resolution(self) -> None:
        source = (ROOT / "js/AlQadim.js").read_text(encoding="utf-8")
        self.assertIn('onclick="revealEngineActor(${actor.id})"', source)
        self.assertIn("function revealEngineActor(actorId)", source)
        self.assertIn("atlasActorResolvedPlacement(world, actor)", source)
        self.assertIn("actorFirst.length >= 4", source)


if __name__ == "__main__":
    unittest.main()
