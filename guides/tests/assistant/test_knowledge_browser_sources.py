"""Exact citation tuples: presentation must not mix labels, URLs or indexes."""
import importlib.util
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('knowledge_browser', HERE/'knowledge-browser.py')
browser = importlib.util.module_from_spec(spec)
spec.loader.exec_module(browser)

class Sources(unittest.TestCase):
    def test_guide_tuple_remains_exact(self):
        source={'file':'guides/js/example.js','locator':'steps[1]','review':'extracted'}
        self.assertTrue(browser.source_present(source,['Source: existing guide; extracted. guides/js/example.js — steps[1]']))
        self.assertFalse(browser.source_present(source,['Source: existing guide; extracted. guides/js/example.js — steps[10]']))
        self.assertFalse(browser.source_present(source,['Source: existing guide; extracted. other.js — steps[1]']))

    def test_primary_research_uses_its_visible_label_url_pair(self):
        source={'file':'https://example.invalid/source','locator':'NPC dialogue: job','review':'external-research'}
        self.assertTrue(browser.source_present(source,['Outside research (not in this guide): NPC dialogue: job — https://example.invalid/source (checked 2026-10-24).']))
        self.assertFalse(browser.source_present(source,['NPC dialogue: name — https://example.invalid/source']))
        self.assertFalse(browser.source_present(source,['NPC dialogue: job — https://example.invalid/other']))
        self.assertFalse(browser.source_present(source,['NPC dialogue: job — https://example.invalid/source-extra']))
        self.assertFalse(browser.source_present(source,['NPC dialogue: job','https://example.invalid/source']))

    def test_compound_guide_locators_require_every_exact_field_under_the_right_file(self):
        source={'file':'guides/js/example.js','locator':'magic[0].spell; magic[0].reagent','review':'extracted'}
        self.assertTrue(browser.source_present(source,['Source: existing guide; extracted. guides/js/example.js — magic[0].spell; magic[0].reagent']))
        self.assertTrue(browser.source_present(source,['Source: existing guide; extracted. guides/js/example.js — magic[0].spell; guides/js/example.js — magic[0].reagent']))
        self.assertFalse(browser.source_present(source,['Source: existing guide; extracted. guides/js/example.js — magic[0].spell']))
        self.assertFalse(browser.source_present(source,['Source: existing guide; extracted. guides/js/example.js — magic[0].spell; guides/js/other.js — magic[0].reagent']))
        self.assertFalse(browser.source_present(source,['Source: existing guide; extracted. guides/js/example.js — magic[0].spellExtra; magic[0].reagent']))

    def test_indexed_research_requires_its_own_complete_primary_reference(self):
        manifest=json.loads((browser.ROOT/'guides/data/assistant/knowledge/starcraft.json').read_text())
        fact=next(f for f in manifest['facts'] if f['id']=='starcraft:knowledge:purplewave-identity')
        source=fact['source']; ref=source['references'][0]
        citation=f"Outside research (not in this guide): {ref['label']} — {ref['url']} (checked {ref['checkedAt']})."
        self.assertTrue(browser.source_present(source,[citation]))
        self.assertFalse(browser.source_present(source,[citation.replace(ref['url'],'https://example.invalid/other')]))
        self.assertFalse(browser.source_present(source,[citation.replace(ref['checkedAt'],'2000-01-01')]))
        wrong={**source,'locator':'facts[999999]'}
        self.assertFalse(browser.source_present(wrong,[citation]))

if __name__=='__main__':unittest.main()
