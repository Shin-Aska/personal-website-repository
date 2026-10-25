"""Prepare the owner-approved MiniLM download and reuse the pinned local runtime.

No package installation. Only --download permits network access. The generated
assets/ directory is ignored by Git and is never part of the live guide profile.
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
GUIDES = HERE.parents[2]
MODEL_ID = 'Xenova/all-MiniLM-L6-v2'
REVISION = '751bff37182d3f1213fa05d7196b954e230abad9'
FILES = [
    ('config.json', 650, 'git-blob-sha1', '72147e4ff4426ebedbfa2146c4a0999def51a313'),
    ('tokenizer.json', 711661, 'git-blob-sha1', 'c17ed520ed8438736732a54957a69306b8822215'),
    ('tokenizer_config.json', 366, 'git-blob-sha1', '37fca74771bc76a8e01178ce3a6055a0995f8093'),
    ('special_tokens_map.json', 125, 'git-blob-sha1', 'a8b3208c2884c4efb86e49300fdd3dc877220cdf'),
    ('vocab.txt', 231508, 'git-blob-sha1', 'fb140275c155a9c7c5a3b3e0e77a9e839594a938'),
    ('onnx/model_quantized.onnx', 22972370, 'sha256', 'afdb6f1a0e45b715d0bb9b11772f032c399babd23bfc31fed1c170afc848bdb1'),
]

def sha256(body):
    return hashlib.sha256(body).hexdigest()

def check(body, size, kind, expected):
    if len(body) != size:
        raise ValueError('Unexpected asset length')
    actual = sha256(body) if kind == 'sha256' else hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest()
    if actual != expected:
        raise ValueError('Unexpected asset digest')

def prepare_assets(assets=HERE/'assets', shared_directory=GUIDES/'local-assistant',
                   model_id=MODEL_ID, revision=REVISION, files=FILES):
    """Verify local raw MiniLM inputs and write only the prototype metadata."""
    assets, shared_directory = Path(assets), Path(shared_directory)
    profile = {'schema': 1, 'id': 'minilm-l6-v2-q8-751bff3-intent-prototype', 'modelId': model_id,
        'revision': revision, 'license': 'apache-2.0', 'dtype': 'q8', 'dimensions': 384,
        'maxTokens': 128, 'runtimeProfile': '../../../../local-assistant/profile.json', 'files': []}
    for name, size, kind, expected in files:
        body = (assets/'model'/name).read_bytes()
        check(body, size, kind, expected)
        profile['files'].append({'name': name, 'path': 'model/'+name, 'bytes': size, 'sha256': sha256(body),
            'pinnedIntegrity': {'kind': kind, 'digest': expected}})
    shared = json.loads((shared_directory/'profile.json').read_text())
    used = {h for group in shared['runtime'].values() for h in group}
    for entry in shared['assets']:
        if entry['sha256'] in used:
            check((shared_directory/entry['path']).read_bytes(), entry['bytes'], 'sha256', entry['sha256'])
    profile['modelBytes'] = sum(f['bytes'] for f in profile['files'])
    profile['sharedRuntimeBytes'] = sum(a['bytes'] for a in shared['assets'] if a['sha256'] in used)
    assets.mkdir(parents=True, exist_ok=True)
    (assets/'profile.json').write_text(json.dumps(profile, indent=2)+'\n')
    return profile


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true')
    parser.add_argument('--node', default=shutil.which('node'))
    parser.add_argument('--skip-source-export', action='store_true', help='Prepare the encoder only; no Node/U7 snapshot required')
    args = parser.parse_args(argv)
    assets = HERE/'assets'
    for name, size, kind, expected in FILES:
        target = assets/'model'/name
        if target.exists():
            check(target.read_bytes(), size, kind, expected)
            continue
        if not args.download:
            raise FileNotFoundError('Approved MiniLM assets are missing; use guides/local-assistant/setup.py --download')
        url = f'https://huggingface.co/{MODEL_ID}/resolve/{REVISION}/{name}'
        request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=60) as response:
            body = response.read(size+1)
        check(body, size, kind, expected)
        target.parent.mkdir(parents=True, exist_ok=True)
        partial = target.with_name(target.name+'.part')
        try:
            partial.write_bytes(body)
            partial.replace(target)
        finally:
            partial.unlink(missing_ok=True)
    profile = prepare_assets(assets)
    if not args.skip_source_export:
        if not args.node:
            raise RuntimeError('Pass --node with an existing Node executable, or use --skip-source-export; do not install Node')
        subprocess.run([args.node, str(HERE/'export-ultima7-records.mjs')], check=True)
    print(json.dumps({'modelBytes': profile['modelBytes'], 'sharedRuntimeBytes': profile['sharedRuntimeBytes'],
        'model': MODEL_ID, 'revision': REVISION, 'runtime': 'Existing pinned Transformers.js 3.8.1; no installation'}), flush=True)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
