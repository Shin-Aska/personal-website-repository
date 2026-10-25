"""Package already-downloaded assets for static hosting. Does not use the network.
Edit profile.json to select another prepared Transformers causal-LM profile.
"""
import argparse, hashlib, json
from pathlib import Path

root = Path(__file__).resolve().parent


def verify_profile(directory):
    """Check the shipped parts without the original trial downloads or network."""
    profile = json.loads((directory/'profile.json').read_text())
    assets = profile['assets']
    parts = {}
    for asset in assets:
        relative = Path(asset['path'])
        if relative.parts != ('files', asset['sha256']+'.bin'):
            raise ValueError(f'Invalid part path: {relative}')
        content = (directory/relative).read_bytes()
        if len(content) != asset['bytes']:
            raise ValueError(f'Part size mismatch: {relative}')
        if hashlib.sha256(content).hexdigest() != asset['sha256']:
            raise ValueError(f'Part hash mismatch: {relative}')
        if asset['sha256'] in parts:
            raise ValueError(f'Duplicate part: {relative}')
        parts[asset['sha256']] = asset
    references = [digest for chunks in [*profile['model'].values(), *profile['runtime'].values()]
                  for digest in chunks]
    if set(references) != set(parts):
        raise ValueError('Model/runtime references do not match the shipped parts')
    total = sum(asset['bytes'] for asset in assets)
    if total != profile['totalBytes']:
        raise ValueError('Profile total does not match the shipped parts')
    return profile


def package_assets(source, directory=root, identity=None, label=None, include_intent=True):
    """Package verified local raw sources; callers may stage before publishing."""
    source, directory = Path(source), Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    plan = json.loads((source/'assets-plan.json').read_text())
    assets, model, runtime = [], {}, {}
    for entry in plan['files']:
        content = (source/entry['path']).read_bytes()
        if len(content) != entry['bytes']:
            raise ValueError(f'Source size mismatch: {entry["path"]}')
        if 'sha256' in entry:
            valid = hashlib.sha256(content).hexdigest() == entry['sha256']
        else:
            valid = hashlib.sha1(b'blob '+str(len(content)).encode()+b'\0'+content).hexdigest() == entry['gitBlobSHA1']
        if not valid:
            raise ValueError(f'Source hash mismatch: {entry["path"]}')
        chunks = []
        for number, offset in enumerate(range(0,len(content),16*1024*1024)):
            data = content[offset:offset+16*1024*1024]
            digest = hashlib.sha256(data).hexdigest()
            path = 'files/'+digest+'.bin'
            target = directory/path; target.parent.mkdir(exist_ok=True)
            if target.exists() and target.read_bytes() != data:
                raise ValueError(f'Existing part differs from verified source: {path}')
            if not target.exists(): target.write_bytes(data)
            item = {'path':path, 'bytes':len(data), 'sha256':digest}
            assets.append(item); chunks.append(digest)
        if entry['path'].startswith('model/'):
            model['/'.join(Path(entry['path']).parts[2:])] = chunks
        else:
            name = entry['path'].split('/')[-1]
            runtime['module' if name=='transformers.min.js' else 'wasm' if name.endswith('.wasm') else 'wasmModule'] = chunks
    profile = {'schema':1,'id':identity or 'smollm2-135m-q8-12fd25f-frames-v1','label':label or 'SmolLM2 135M',
     'backend':'transformers-causal-lm','revision':plan['revision'],'dtype':plan.get('dtype','q8'),'maxInputTokens':1536,
     'totalBytes':sum(a['bytes'] for a in assets),'assets':assets,'model':model,'runtime':runtime,
     'provenance':{'model':plan['model'],'runtime':plan['runtime'],'pinnedSources':plan['files']}}
    intent_path = directory/'intent/profile.json'
    if include_intent and intent_path.is_file():
        intent = json.loads(intent_path.read_text())
        profile['intent'] = {'id': intent['id'], 'profile': 'intent/profile.json',
                             'additionalBytes': intent['additionalBytes']}
        if not identity:
            profile['id'] += '+minilm-intent-v1'
    (directory/'profile.json').write_text(json.dumps(profile,indent=2)+'\n')
    return profile


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=root.parent/'tests/assistant/fallback-pilot')
    parser.add_argument('--id', help='Stable profile identity; change it for each model/runtime release')
    parser.add_argument('--label', help='Readable model name')
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args(argv)
    if args.verify_only and (args.id or args.label):
        parser.error('--verify-only cannot change identity or label')
    try:
        profile = verify_profile(root) if args.verify_only else package_assets(args.source, identity=args.id, label=args.label)
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, f'Model preparation failed: {error}\n')
    print(f'{"Verified" if args.verify_only else "Prepared"} {len(profile["assets"])} parts, {profile["totalBytes"]:,} bytes. No downloads.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
