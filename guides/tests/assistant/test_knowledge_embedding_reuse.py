import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('knowledge_embedding_builder', Path(__file__).with_name('build-knowledge-embeddings.py'))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class SourceEncodingReuse(unittest.TestCase):
    def setUp(self):
        self.profile = {'modelId': 'existing-model', 'revision': 'pinned-revision', 'dimensions': 384}
        self.vector = [1] + [0] * 383
        self.catalog = {'schemaVersion': 1, 'gameId': 'test-game', **self.profile,
                        'documents': [{'factId': 'a', 'text': 'original source', 'vector': self.vector},
                                      {'factId': 'removed', 'text': 'retired source', 'vector': self.vector}]}

    def test_only_exact_id_and_text_reuse_survive_reordering_additions_and_removals(self):
        current = [{'factId': 'new', 'text': 'new source'}, {'factId': 'a', 'text': 'original source'}]
        self.assertEqual(builder.reusable_documents(self.catalog, 'test-game', self.profile, current), {'a': self.vector})
        current[1]['text'] = 'corrected original source'
        self.assertEqual(builder.reusable_documents(self.catalog, 'test-game', self.profile, current), {})

    def test_foreign_encoder_or_game_cannot_supply_cached_vectors(self):
        for field, value in [('gameId', 'other-game'), ('modelId', 'new-model'), ('revision', 'other-revision'), ('dimensions', 768)]:
            catalog = copy.deepcopy(self.catalog)
            catalog[field] = value
            with self.assertRaises(AssertionError):
                builder.reusable_documents(catalog, 'test-game', self.profile, [])

    def test_ambiguous_or_invalid_vectors_fail_even_if_their_fact_would_be_removed(self):
        for mutate in [lambda c: c['documents'].append(c['documents'][0]),
                       lambda c: c['documents'][1].update(vector=[0] * 384),
                       lambda c: c['documents'][1].update(vector=[float('nan')] + [0] * 383)]:
            catalog = copy.deepcopy(self.catalog)
            mutate(catalog)
            with self.assertRaises(AssertionError):
                builder.reusable_documents(catalog, 'test-game', self.profile, [])


if __name__ == '__main__':
    unittest.main()
