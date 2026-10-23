"""Fetch only the pinned pilot assets after the owner's explicit download approval."""
import argparse
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent

def verify(path, entry):
    if not path.is_file() or path.stat().st_size != entry['bytes']:
        return False
    data = path.read_bytes()
    if 'sha256' in entry:
        return hashlib.sha256(data).hexdigest() == entry['sha256']
    return hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest() == entry['gitBlobSHA1']

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--approved', action='store_true')
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args()
    plan = json.loads((ROOT / 'assets-plan.json').read_text())
    if not args.verify_only and not (args.approved and plan.get('approval')):
        parser.error('No download: explicit owner approval must be recorded in assets-plan.json first.')
    missing = []
    for entry in plan['files']:
        path = ROOT / entry['path']
        if path.resolve().is_relative_to(ROOT) is False:
            raise ValueError('Asset path escapes pilot directory')
        if verify(path, entry):
            continue
        if args.verify_only:
            missing.append(entry['path'])
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        partial = path.with_name(path.name + '.part')
        try:
            with urllib.request.urlopen(entry['url'], timeout=120) as response, partial.open('wb') as output:
                size = 0
                while chunk := response.read(1024 * 1024):
                    size += len(chunk)
                    if size > entry['bytes']:
                        raise ValueError('Remote asset exceeds approved size')
                    output.write(chunk)
            if not verify(partial, entry):
                raise ValueError(f'Asset integrity mismatch: {entry["path"]}')
            partial.replace(path)
            print('Verified', entry['path'], entry['bytes'], flush=True)
        finally:
            partial.unlink(missing_ok=True)
    if missing:
        print('Missing or invalid assets:', ', '.join(missing))
        return 1
    print('All pinned model and runtime assets verified.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
