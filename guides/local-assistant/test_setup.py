"""Small pinned byte fixtures test setup plumbing, not model inference/accuracy."""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import shutil
import tempfile
import unittest

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('assistant_setup', HERE/'setup.py')
setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup)


class SetupTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.package = self.root/'guides/local-assistant'
        self.pilot = self.root/'guides/tests/assistant/fallback-pilot'
        self.prototype = self.root/'guides/tests/assistant/intent-prototype'
        self.pilot.mkdir(parents=True)
        (self.prototype/'cases').mkdir(parents=True)
        (self.package/'intent').mkdir(parents=True)
        self.bodies = {}
        files = []
        for name, body in [
            ('model/smollm2/config.json', b'{"fixture":"base"}'),
            ('model/smollm2/onnx/model_quantized.onnx', b'pinned base model fixture'),
            ('vendor/transformers.min.js', b'pinned runtime module fixture'),
            ('vendor/ort-wasm-simd-threaded.jsep.mjs', b'pinned wasm module fixture'),
            ('vendor/ort-wasm-simd-threaded.jsep.wasm', b'pinned wasm binary fixture'),
        ]:
            entry = {'path': name, 'url': 'https://pinned.test/'+name, 'bytes': len(body), 'sha256': setup.sha256(body)}
            files.append(entry);self.bodies[entry['url']] = body
        self.plan = {'revision': 'fixture-base-revision', 'model': 'fixture/SmolLM2', 'runtime': 'fixture/runtime', 'files': files,
                     'approval': {'source': 'Synthetic pinned-byte test fixture; no actual network'}}
        setup.write_json(self.pilot/'assets-plan.json', self.plan)
        mini_files = []
        for name, body, kind in [('config.json', b'{"fixture":"mini"}', 'git-blob-sha1'), ('onnx/model_quantized.onnx', b'pinned mini model fixture', 'sha256')]:
            digest = setup.sha256(body) if kind == 'sha256' else hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest()
            mini_files.append((name, len(body), kind, digest))
            self.bodies['https://huggingface.co/fixture/MiniLM/resolve/fixture-mini-revision/'+name] = body
        self.mini = {'modelId': 'fixture/MiniLM', 'revision': 'fixture-mini-revision', 'files': mini_files}
        for filename, count in [('training-v2.json', 2), ('validation-v2.json', 1)]:
            setup.write_json(self.prototype/'cases'/filename, {'samples': [{'id': str(i)} for i in range(count)]})
        (self.prototype/'classifier.mjs').write_text('fixture classifier source')
        artifact = {'schemaVersion': 1, 'head': {'schemaVersion': 1, 'dimensions': 384, 'labels': setup.LABELS,
            'weights': [[0.0]*384 for _ in setup.LABELS], 'bias': [0.0]*len(setup.LABELS)},
            'thresholds': {'minScore': 0, 'minMargin': 0, 'abstainAll': False, 'selection': {'source': 'validation', 'samples': 1}},
            'provenance': {'modelId': self.mini['modelId'], 'revision': self.mini['revision'], 'encoderFineTuned': False,
                'trainingSamples': 2, 'validationSamples': 1,
                'trainingSha256': setup.sha256((self.prototype/'cases/training-v2.json').read_bytes()),
                'validationSha256': setup.sha256((self.prototype/'cases/validation-v2.json').read_bytes()),
                'classifierSourceSha256': setup.sha256((self.prototype/'classifier.mjs').read_bytes())}}
        setup.write_json(self.package/'intent/head.json', artifact)
        self.calls = []

    def tearDown(self):
        self.temporary.cleanup()

    def opener(self, request, timeout):
        self.calls.append(request.full_url)
        return io.BytesIO(self.bodies[request.full_url])

    def run_setup(self, **options):
        return setup.run_setup(self.root, specification=self.mini, opener=self.opener, **options)

    def fingerprints(self):
        return {str(p.relative_to(self.package)): setup.sha256(p.read_bytes()) for p in self.package.rglob('*') if p.is_file()}

    def test_fresh_pinned_download_then_offline_reuse_without_raw_inputs_or_node(self):
        result = self.run_setup(download=True, chrome='/not-installed/chrome')
        self.assertEqual(result['status'], 'prepared')
        self.assertEqual(result['downloads'], 7)
        self.assertEqual(len(self.calls), 7)
        before = self.fingerprints()
        shutil.rmtree(self.prototype/'assets')
        for entry in self.plan['files']:
            (self.pilot/entry['path']).unlink()
        self.calls.clear()
        self.assertEqual(self.run_setup()['status'], 'verified')
        self.assertEqual(self.run_setup(verify_only=True)['writes'], False)
        self.assertEqual(self.calls, [])
        self.assertEqual(before, self.fingerprints())
        self.assertFalse((self.prototype/'assets/ultima7-records.json').exists())

    def test_verify_only_rejects_corrupt_part_without_writes_or_fetching(self):
        self.run_setup(download=True)
        profile = setup.read_json(self.package/'intent/profile.json')
        target = self.package/'intent'/profile['assets'][0]['path']
        target.write_bytes(b'corrupt')
        before = self.fingerprints();self.calls.clear()
        with self.assertRaisesRegex(ValueError, 'verification failed'):
            self.run_setup(verify_only=True)
        self.assertEqual(before, self.fingerprints());self.assertEqual(self.calls, [])

    def test_corrupt_cached_part_can_be_rebuilt_from_verified_raw_sources_without_network(self):
        self.run_setup(download=True)
        profile = setup.read_json(self.package/'profile.json')
        profile['id'] = 'preserved-custom-bundle';profile['label'] = 'Preserved label'
        setup.write_json(self.package/'profile.json', profile)
        target = self.package/profile['assets'][0]['path'];target.write_bytes(b'corrupt')
        self.calls.clear()
        result = self.run_setup()
        self.assertEqual(result['downloads'], 0);self.assertEqual(self.calls, [])
        repaired = setup.read_json(self.package/'profile.json')
        self.assertEqual(repaired['id'], profile['id']);self.assertEqual(repaired['label'], profile['label'])
        self.assertEqual(self.run_setup(verify_only=True)['status'], 'verified')

    def test_interrupted_second_model_fetch_publishes_no_half_configured_bundle(self):
        original = self.opener
        def interrupted(request, timeout):
            if 'huggingface.co' in request.full_url:
                raise RuntimeError('simulated lost connection')
            return original(request, timeout)
        with self.assertRaisesRegex(RuntimeError, 'lost connection'):
            setup.run_setup(self.root, download=True, specification=self.mini, opener=interrupted)
        self.assertFalse((self.package/'profile.json').exists())
        self.assertFalse((self.package/'intent/profile.json').exists())
        self.assertEqual(list(self.package.glob('.setup-*')), [])
        self.assertEqual(list(self.root.rglob('*.part')), [])
        self.calls.clear()
        self.assertEqual(self.run_setup(download=True)['downloads'], 2, 'verified first-model inputs should be reused')

    def test_bad_or_oversize_download_never_replaces_cached_file(self):
        target = self.root/'raw.bin';target.write_bytes(b'old corrupt cache')
        entry = {'url': 'https://pinned.test/raw', 'bytes': 3, 'sha256': setup.sha256(b'abc')}
        for body in [b'ab', b'abcd', b'xyz']:
            with self.assertRaises(ValueError):
                setup.ensure_source(target, entry, True, lambda *a, **k: io.BytesIO(body))
            self.assertEqual(target.read_bytes(), b'old corrupt cache')
            self.assertFalse(target.with_name('raw.bin.part').exists())

    def test_missing_head_and_rebuild_prerequisites_fail_before_downloads(self):
        (self.package/'intent/head.json').unlink()
        with self.assertRaisesRegex(ValueError, 'verified tracked head'):
            self.run_setup(download=True)
        self.assertEqual(self.calls, [])
        with self.assertRaisesRegex(RuntimeError, 'existing Chrome'):
            self.run_setup(download=True, rebuild_head=True, chrome='/missing/chrome')
        self.assertEqual(self.calls, [])

    def test_bundle_metadata_is_verified_and_repaired_without_changing_parts_or_head(self):
        self.run_setup(download=True)
        before = self.fingerprints()
        profile = setup.read_json(self.package/'profile.json');profile['intent']['additionalBytes'] += 1
        setup.write_json(self.package/'profile.json', profile)
        with self.assertRaisesRegex(ValueError, 'exact intent bundle'):
            self.run_setup(verify_only=True)
        self.calls.clear();self.run_setup()
        self.assertEqual(self.calls, [])
        self.assertEqual(before, self.fingerprints())

    def test_verify_only_cannot_enable_mutations(self):
        with self.assertRaisesRegex(ValueError, 'cannot download'):
            self.run_setup(verify_only=True, download=True)
        self.assertEqual(self.calls, [])

    def test_changed_fitting_source_or_finite_head_edit_is_not_silently_repackaged(self):
        self.run_setup(download=True)
        classifier = self.prototype/'classifier.mjs';original = classifier.read_text()
        classifier.write_text('changed classifier source');self.calls.clear()
        with self.assertRaisesRegex(ValueError, 'Classifier source differs'):
            self.run_setup(verify_only=True)
        classifier.write_text(original)
        head_path = self.package/'intent/head.json';artifact = setup.read_json(head_path)
        artifact['head']['weights'][0][0] = 0.5
        setup.write_json(head_path, artifact)
        with self.assertRaisesRegex(ValueError, 'recorded package checksum'):
            self.run_setup()
        self.assertEqual(self.calls, [])

    def test_import_safe_helper_loading_writes_no_bytecode(self):
        helper = self.root/'safe_helper.py';helper.write_text('VALUE = 42\n')
        self.assertEqual(setup.load_helper('fixture_safe_helper', helper).VALUE, 42)
        self.assertFalse((self.root/'__pycache__').exists())

    def test_unapproved_extra_model_mapping_is_rejected(self):
        self.run_setup(download=True)
        profile = setup.read_json(self.package/'profile.json')
        profile['model']['unapproved-file.json'] = profile['model']['config.json']
        setup.write_json(self.package/'profile.json', profile)
        with self.assertRaisesRegex(ValueError, 'mappings or size'):
            self.run_setup(verify_only=True)

    def test_profile_cannot_misstate_verified_head_provenance(self):
        self.run_setup(download=True)
        profile = setup.read_json(self.package/'intent/profile.json')
        profile['provenance']['trainingSamples'] = 999
        setup.write_json(self.package/'intent/profile.json', profile)
        with self.assertRaisesRegex(ValueError, 'provenance differs'):
            self.run_setup(verify_only=True)


if __name__ == '__main__':
    unittest.main()
