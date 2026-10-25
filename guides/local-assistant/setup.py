"""Set up both approved local chat models with one command; installs nothing.

Complete tracked packages are reused without downloads or writes. Only
--download permits fetching missing pinned inputs. --verify-only is read-only.
The tracked, verified MiniLM head is reused unless --rebuild-head is explicit.
"""
import argparse
import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import shutil
import tempfile
import types
import urllib.request

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
LABELS = ['identity', 'location', 'acquisition', 'use', 'stats', 'combat',
          'prerequisites', 'hint', 'why', 'comparison', 'overview', 'unknown']


def load_helper(name, filename):
    # Avoid even .pyc writes during --verify-only.
    module = types.ModuleType(name)
    module.__file__ = str(filename)
    exec(compile(Path(filename).read_bytes(), str(filename), 'exec'), module.__dict__)
    return module


def helpers():
    return (load_helper('base_chat_package', HERE/'prepare-assets.py'),
            load_helper('minilm_sources', ROOT/'guides/tests/assistant/intent-prototype/prepare-assets.py'),
            load_helper('intent_chat_package', HERE/'intent/prepare.py'))


def read_json(path):
    return json.loads(Path(path).read_text(), parse_constant=lambda value: (_ for _ in ()).throw(ValueError('Nonfinite JSON: '+value)))


def sha256(body):
    return hashlib.sha256(body).hexdigest()


def valid_source(path, entry):
    if not Path(path).is_file() or Path(path).stat().st_size != entry['bytes']:
        return False
    digest = hashlib.sha256() if 'sha256' in entry else hashlib.sha1(b'blob '+str(entry['bytes']).encode()+b'\0')
    with Path(path).open('rb') as stream:
        while chunk := stream.read(1024*1024):
            digest.update(chunk)
    return digest.hexdigest() == entry.get('sha256', entry.get('gitBlobSHA1'))


def ensure_source(path, entry, download=False, opener=urllib.request.urlopen):
    """Reuse a verified source or atomically fetch its bounded, pinned bytes."""
    path = Path(path)
    if valid_source(path, entry):
        return False
    if not download:
        raise FileNotFoundError(f'Missing or corrupt approved source: {path}. Use --download to fetch its pinned bytes.')
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(path.name+'.part')
    try:
        request = urllib.request.Request(entry['url'], headers={'User-Agent': 'Mozilla/5.0'})
        with opener(request, timeout=120) as response, partial.open('wb') as stream:
            size = 0
            while chunk := response.read(1024*1024):
                size += len(chunk)
                if size > entry['bytes']:
                    raise ValueError('Pinned download exceeded its approved byte count: '+str(path))
                stream.write(chunk)
        if not valid_source(partial, entry):
            raise ValueError('Pinned download integrity mismatch: '+str(path))
        partial.replace(path)
    finally:
        partial.unlink(missing_ok=True)
    return True


def checked_parts(directory, assets, shared=False):
    parts = {}
    for asset in assets:
        digest = asset['sha256']
        if len(digest) != 64 or any(c not in '0123456789abcdef' for c in digest):
            raise ValueError('Invalid part digest')
        if isinstance(asset['bytes'], bool) or not isinstance(asset['bytes'], int) or not 0 < asset['bytes'] <= 16*1024*1024:
            raise ValueError('Packaged parts must contain 1–16 MiB of bytes')
        relative = Path(asset['path'])
        expected = ('..', 'files', digest+'.bin') if shared else ('files', digest+'.bin')
        if relative.parts != expected or digest in parts:
            raise ValueError('Invalid or duplicate part path: '+str(relative))
        target = Path(directory)/relative
        if not valid_source(target, asset):
            raise ValueError('Missing or corrupt packaged part: '+str(target))
        parts[digest] = (asset, target)
    return parts


def verify_mapping(parts, ids, expected):
    if not isinstance(ids, list) or not ids or any(item not in parts for item in ids):
        raise ValueError('Missing packaged file reference')
    if sum(parts[item][0]['bytes'] for item in ids) != expected['bytes']:
        raise ValueError('Reconstructed file has the wrong size')
    digest = hashlib.sha256() if 'sha256' in expected else hashlib.sha1(b'blob '+str(expected['bytes']).encode()+b'\0')
    for item in ids:
        with parts[item][1].open('rb') as stream:
            while chunk := stream.read(1024*1024):
                digest.update(chunk)
    if digest.hexdigest() != expected.get('sha256', expected.get('gitBlobSHA1')):
        raise ValueError('Reconstructed file differs from the approved pinned source')


def runtime_key(filename):
    return 'module' if filename == 'transformers.min.js' else 'wasm' if filename.endswith('.wasm') else 'wasmModule'


def verify_base_package(directory, plan, base_helper):
    profile = base_helper.verify_profile(Path(directory))
    if profile['backend'] != 'transformers-causal-lm' or profile['revision'] != plan['revision'] or profile['provenance']['model'] != plan['model']:
        raise ValueError('Base profile does not match the approved SmolLM2 plan')
    model_names = {'/'.join(Path(entry['path']).parts[2:]) for entry in plan['files'] if entry['path'].startswith('model/')}
    runtime_names = {runtime_key(Path(entry['path']).name) for entry in plan['files'] if not entry['path'].startswith('model/')}
    if set(profile['model']) != model_names or set(profile['runtime']) != runtime_names or profile['totalBytes'] != sum(entry['bytes'] for entry in plan['files']):
        raise ValueError('Base file mappings or size differ from the approved plan')
    parts = checked_parts(directory, profile['assets'])
    for entry in plan['files']:
        ids = profile['model'].get('/'.join(Path(entry['path']).parts[2:])) if entry['path'].startswith('model/') else profile['runtime'].get(runtime_key(Path(entry['path']).name))
        verify_mapping(parts, ids, entry)
    return profile


def validate_head(artifact, prototype, model_id, revision):
    head, provenance = artifact['head'], artifact['provenance']
    if artifact['schemaVersion'] != 1 or head['schemaVersion'] != 1 or head['dimensions'] != 384 or head['labels'] != LABELS:
        raise ValueError('Unsupported exported intent head')
    if provenance['modelId'] != model_id or provenance['revision'] != revision or provenance['encoderFineTuned'] is not False:
        raise ValueError('Intent head belongs to a different encoder')
    if len(head['weights']) != len(LABELS) or len(head['bias']) != len(LABELS):
        raise ValueError('Invalid intent head shape')
    for row in head['weights']:
        if len(row) != 384 or any(isinstance(x, bool) or not isinstance(x, (int, float)) or not math.isfinite(x) for x in row):
            raise ValueError('Invalid intent head weights')
    if any(isinstance(x, bool) or not isinstance(x, (int, float)) or not math.isfinite(x) for x in head['bias']):
        raise ValueError('Invalid intent head bias')
    for field, filename, count in [('trainingSha256', 'training-v2.json', 'trainingSamples'), ('validationSha256', 'validation-v2.json', 'validationSamples')]:
        target = Path(prototype)/'cases'/filename
        if sha256(target.read_bytes()) != provenance[field] or len(read_json(target)['samples']) != provenance[count]:
            raise ValueError('Frozen fitting source differs from the exported head: '+filename)
    if sha256((Path(prototype)/'classifier.mjs').read_bytes()) != provenance['classifierSourceSha256']:
        raise ValueError('Classifier source differs from the exported head; explicitly rebuild it')
    thresholds = artifact['thresholds']
    if any(isinstance(thresholds.get(key), bool) or not isinstance(thresholds.get(key), (int, float)) or not 0 <= thresholds[key] <= 1 for key in ['minScore', 'minMargin']) or not isinstance(thresholds.get('abstainAll'), bool):
        raise ValueError('Invalid intent thresholds')
    if thresholds['selection']['source'] != 'validation' or thresholds['selection']['samples'] != provenance['validationSamples']:
        raise ValueError('Intent thresholds lack validation provenance')
    return artifact


def mini_spec(helper):
    return {'modelId': helper.MODEL_ID, 'revision': helper.REVISION, 'files': helper.FILES}


def verify_intent_package(directory, shared_profile, prototype, spec):
    directory = Path(directory)
    profile = read_json(directory/'profile.json')
    if profile['schema'] != 1 or profile['backend'] != 'minilm-linear-intent' or profile['modelId'] != spec['modelId'] or profile['revision'] != spec['revision'] or profile['dimensions'] != 384:
        raise ValueError('Intent package differs from the approved MiniLM profile')
    own = checked_parts(directory, profile['assets'])
    runtime = checked_parts(directory, profile['runtimeAssets'], shared=True)
    if set(own) & set(runtime):
        raise ValueError('Duplicate own/shared intent asset')
    base_assets = {entry['sha256']: entry for entry in shared_profile['assets']}
    wanted_runtime = {item for ids in shared_profile['runtime'].values() for item in ids}
    if set(runtime) != wanted_runtime or profile['runtime'] != shared_profile['runtime'] or any(item not in base_assets or data[0]['bytes'] != base_assets[item]['bytes'] for item, data in runtime.items()):
        raise ValueError('Intent package does not reuse the declared shared runtime')
    references = {item for ids in profile['model'].values() for item in ids} | set(profile['head'])
    if references != set(own) or profile['additionalBytes'] != sum(item['bytes'] for item in profile['assets']) or profile['totalBytes'] != profile['additionalBytes']+sum(item['bytes'] for item in profile['runtimeAssets']):
        raise ValueError('Intent references or download sizes are inconsistent')
    if set(profile['model']) != {entry[0] for entry in spec['files']}:
        raise ValueError('Intent model file list differs from approved pins')
    for name, size, kind, expected in spec['files']:
        verify_mapping(own, profile['model'][name], {'bytes': size, 'sha256' if kind == 'sha256' else 'gitBlobSHA1': expected})
    body = b''.join(own[item][1].read_bytes() for item in profile['head'])
    artifact = validate_head(json.loads(body, parse_constant=lambda x: (_ for _ in ()).throw(ValueError('Nonfinite head'))), prototype, spec['modelId'], spec['revision'])
    if profile['thresholds'] != artifact['thresholds']:
        raise ValueError('Intent profile thresholds differ from its verified head')
    if any(profile['provenance'].get(key) != value for key, value in artifact['provenance'].items()):
        raise ValueError('Intent profile provenance differs from its verified head')
    if (directory/'head.json').exists() and (directory/'head.json').read_bytes() != body:
        raise ValueError('Tracked intent head differs from its packaged bytes')
    return profile


def verify_all(directory, prototype, plan, spec, base_helper, bundle=True):
    base = verify_base_package(directory, plan, base_helper)
    intent = verify_intent_package(Path(directory)/'intent', base, prototype, spec)
    if bundle and base.get('intent') != {'id': intent['id'], 'profile': 'intent/profile.json', 'additionalBytes': intent['additionalBytes']}:
        raise ValueError('Main profile does not disclose the exact intent bundle')
    return base, intent


def write_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False)+'\n')


def copy_parts(source, destination, profile):
    destination = Path(destination)
    for entry in profile['assets']:
        target = destination/entry['path'];target.parent.mkdir(parents=True, exist_ok=True)
        try:
            os.link(Path(source)/entry['path'], target)
        except OSError:
            shutil.copyfile(Path(source)/entry['path'], target)
    write_json(destination/'profile.json', profile)
    if (Path(source)/'head.json').exists():
        shutil.copyfile(Path(source)/'head.json', destination/'head.json')


def publish_file(source, target):
    source, target = Path(source), Path(target)
    if target.is_file() and source.read_bytes() == target.read_bytes():
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(target.name+'.setup-part')
    try:
        shutil.copyfile(source, temporary)
        temporary.replace(target)
    finally:
        temporary.unlink(missing_ok=True)


def run_setup(repository=ROOT, download=False, verify_only=False, rebuild_head=False,
              chrome='/usr/bin/google-chrome', opener=urllib.request.urlopen, specification=None):
    if verify_only and (download or rebuild_head):
        raise ValueError('--verify-only cannot download or rebuild a head')
    repository = Path(repository)
    package = repository/'guides/local-assistant'
    pilot = repository/'guides/tests/assistant/fallback-pilot'
    prototype = repository/'guides/tests/assistant/intent-prototype'
    base_helper, mini_helper, intent_helper = helpers()
    plan = read_json(pilot/'assets-plan.json')
    spec = specification or mini_spec(mini_helper)
    try:
        prior_base = read_json(package/'profile.json')
    except (OSError, ValueError, TypeError):
        prior_base = None
    try:
        base, intent = verify_all(package, prototype, plan, spec, base_helper)
        if not rebuild_head:
            return {'status': 'verified', 'writes': False, 'downloads': 0, 'bundleId': base['id'],
                    'baseBytes': base['totalBytes'], 'intentBytes': intent['additionalBytes']}
    except (OSError, ValueError, KeyError, TypeError) as error:
        if verify_only:
            raise ValueError('Read-only bundle verification failed: '+str(error)) from error
    if rebuild_head:
        if not Path(chrome).is_file() or importlib.util.find_spec('playwright') is None:
            raise RuntimeError('Explicit head rebuild needs an existing Chrome and Playwright environment; install nothing automatically')
    else:
        try:
            tracked_head = package/'intent/head.json'
            validate_head(read_json(tracked_head), prototype, spec['modelId'], spec['revision'])
            if (package/'intent/profile.json').is_file():
                recorded = read_json(package/'intent/profile.json')
                body = tracked_head.read_bytes()
                hashes = [sha256(body[offset:offset+16*1024*1024]) for offset in range(0, len(body), 16*1024*1024)]
                if hashes != recorded['head']:
                    raise ValueError('Tracked head differs from its recorded package checksum')
        except (OSError, ValueError, KeyError, TypeError) as error:
            raise ValueError('A verified tracked head is required. Restore it, or request --rebuild-head explicitly: '+str(error)) from error
    downloads = 0
    try:
        base = verify_base_package(package, plan, base_helper)
    except (OSError, ValueError, KeyError, TypeError):
        base = None
    try:
        intent = verify_intent_package(package/'intent', base, prototype, spec) if base else None
    except (OSError, ValueError, KeyError, TypeError):
        intent = None
    package.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.setup-', dir=package) as temporary:
        stage = Path(temporary)
        if base:
            copy_parts(package, stage, base)
        else:
            if download and not plan.get('approval'):
                raise ValueError('The base source plan has no recorded approval for its pinned downloads')
            for entry in plan['files']:
                target = (pilot/entry['path']).resolve()
                if not target.is_relative_to(pilot.resolve()):
                    raise ValueError('Pinned source escapes its cache directory')
                downloads += ensure_source(target, entry, download, opener)
            base = base_helper.package_assets(pilot, stage, include_intent=False)
            if prior_base and prior_base.get('revision') == base['revision'] and prior_base.get('provenance', {}).get('model') == plan['model']:
                for key in ['id', 'label', 'maxInputTokens', 'intent']:
                    if key in prior_base:
                        base[key] = prior_base[key]
        if intent and not rebuild_head:
            copy_parts(package/'intent', stage/'intent', intent)
        else:
            for name, size, kind, expected in spec['files']:
                entry = {'url': f'https://huggingface.co/{spec["modelId"]}/resolve/{spec["revision"]}/{name}', 'bytes': size,
                         'sha256' if kind == 'sha256' else 'gitBlobSHA1': expected}
                target = (prototype/'assets/model'/name).resolve()
                if not target.is_relative_to((prototype/'assets/model').resolve()):
                    raise ValueError('Pinned MiniLM source escapes its cache directory')
                downloads += ensure_source(target, entry, download, opener)
            mini_helper.prepare_assets(prototype/'assets', stage, spec['modelId'], spec['revision'], spec['files'])
            intent = intent_helper.package_intent(prototype, stage, stage/'intent', package/'intent/head.json', rebuild_head, chrome)
        base = dict(base)
        if 'intent' not in base and not base['id'].endswith('+minilm-intent-v1'):
            base['id'] += '+minilm-intent-v1'
        base['intent'] = {'id': intent['id'], 'profile': 'intent/profile.json', 'additionalBytes': intent['additionalBytes']}
        write_json(stage/'profile.json', base)
        verify_all(stage, prototype, plan, spec, base_helper)
        # Immutable parts arrive before metadata; the final bundle profile is
        # published last. A failed fetch/build cannot report a configured bundle.
        for directory in [stage/'files', stage/'intent/files']:
            for source in directory.iterdir():
                publish_file(source, package/source.relative_to(stage))
        publish_file(stage/'intent/head.json', package/'intent/head.json')
        publish_file(stage/'intent/profile.json', package/'intent/profile.json')
        publish_file(stage/'profile.json', package/'profile.json')
    verify_all(package, prototype, plan, spec, base_helper)
    return {'status': 'prepared', 'writes': True, 'downloads': downloads, 'bundleId': base['id'],
            'baseBytes': base['totalBytes'], 'intentBytes': intent['additionalBytes']}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true', help='Fetch only missing/corrupt already-approved pinned inputs')
    parser.add_argument('--verify-only', action='store_true', help='Verify both packages, exported head and bundle metadata without writes or network')
    parser.add_argument('--rebuild-head', action='store_true', help='Explicitly refit the frozen-data head using an existing Chrome/Playwright runtime')
    parser.add_argument('--chrome', default='/usr/bin/google-chrome')
    args = parser.parse_args(argv)
    try:
        result = run_setup(download=args.download, verify_only=args.verify_only, rebuild_head=args.rebuild_head, chrome=args.chrome)
    except (OSError, ValueError, KeyError, TypeError, RuntimeError) as error:
        parser.exit(1, f'Local chat setup failed: {error}\n')
    print(json.dumps(result, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
