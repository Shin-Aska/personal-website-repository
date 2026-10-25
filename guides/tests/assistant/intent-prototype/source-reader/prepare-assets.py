#!/usr/bin/env python3
"""Offline by default. --download is reserved for explicit human approval."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent


def valid(path, entry):
    if not path.is_file() or path.is_symlink() or path.stat().st_size != entry['bytes']:
        return False
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(65536), b''):
            h.update(chunk)
    return h.hexdigest() == entry['sha256']


class HTTPSOnly(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        url = urllib.parse.urlparse(newurl)
        host = url.hostname or ''
        if url.scheme != 'https' or url.username or url.password or not (
                host == 'huggingface.co' or host.endswith('.huggingface.co')
                or host == 'hf.co' or host.endswith('.hf.co')):
            raise ValueError('Rejected asset redirect outside the Hugging Face HTTPS hosts')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--download', action='store_true', help='Requires prior human approval; fetch the six pinned files')
    group.add_argument('--verify-only', action='store_true', help='Offline; fail if any asset is missing or invalid')
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'manifest.json').read_text())
    assert manifest['modelId'] == 'onnx-community/mobilebert-uncased-squad-v2-ONNX'
    assert manifest['revision'] == 'a8d7291835b8b6481505577f2aa98db0d3a4f601'
    allowed = {'config.json', 'tokenizer.json', 'tokenizer_config.json',
               'special_tokens_map.json', 'vocab.txt', 'onnx/model_quantized.onnx'}
    assert len(manifest['files']) == len(allowed)
    assert {f['name'] for f in manifest['files']} == allowed
    assert sum(f['bytes'] for f in manifest['files']) == manifest['totalBytes'] == 27848554
    for entry in manifest['files']:
        assert re.fullmatch(r'[0-9a-f]{64}', entry['sha256']) and entry['bytes'] > 0
    runtime_profile = ROOT.parents[3] / 'local-assistant/profile.json'
    shared = json.loads(runtime_profile.read_text())
    runtime_ids = {digest for parts in shared['runtime'].values() for digest in parts}
    runtime_entries = [f for f in shared['assets'] if f['sha256'] in runtime_ids]
    if {f['sha256'] for f in runtime_entries} != runtime_ids or not all(
            valid(runtime_profile.parent / f['path'], f) for f in runtime_entries):
        raise ValueError('Existing packaged runtime is missing or invalid; no replacement will be downloaded')
    assets = ROOT / 'assets'
    if assets.is_symlink():
        raise ValueError('Asset directory must not be a symlink')
    missing = [f for f in manifest['files'] if not valid(assets / f['name'], f)]
    if not args.download:
        print(json.dumps({'mode': 'verify-only' if args.verify_only else 'dry-run',
                          'networkRequests': 0, 'totalBytes': manifest['totalBytes'],
                          'sharedRuntimeVerified': True, 'additionalRuntimeBytes': 0,
                          'ready': not missing, 'missingOrInvalid': [f['name'] for f in missing]}, indent=2))
        return int(bool(missing) and args.verify_only)
    # No auth tokens, credential files, package managers or model libraries are used.
    opener = urllib.request.build_opener(HTTPSOnly())
    for entry in missing:
        destination = assets / entry['name']
        destination.parent.mkdir(parents=True, exist_ok=True)
        if any(parent.is_symlink() for parent in [destination.parent, assets]):
            raise ValueError('Asset parents must not be symlinks')
        url = (f"https://huggingface.co/{manifest['modelId']}/resolve/"
               f"{manifest['revision']}/{entry['name']}")
        fd, temporary = tempfile.mkstemp(prefix='.pending-', dir=destination.parent)
        try:
            with os.fdopen(fd, 'wb') as out, opener.open(url, timeout=60) as response:
                length = response.headers.get('Content-Length')
                if length is not None and int(length) != entry['bytes']:
                    raise ValueError('Unexpected asset Content-Length')
                received = 0
                while True:
                    chunk = response.read(min(65536, entry['bytes'] + 1 - received))
                    if not chunk:
                        break
                    received += len(chunk)
                    if received > entry['bytes']:
                        raise ValueError('Asset exceeded the pinned byte limit')
                    out.write(chunk)
                out.flush()
                os.fsync(out.fileno())
            if not valid(Path(temporary), entry):
                raise ValueError('Asset integrity verification failed')
            os.replace(temporary, destination)
            print(f"Verified {entry['name']}: {entry['bytes']} bytes")
        finally:
            Path(temporary).unlink(missing_ok=True)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
