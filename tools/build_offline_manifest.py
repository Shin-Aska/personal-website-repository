"""Generate deterministic offline asset versions, without third-party packages.

Run before a full deployment: python3 tools/build_offline_manifest.py
The FTP publisher updates only the assets included in a partial upload.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
DIRECTORIES = {'css', 'script', 'js', 'fonts', 'images', 'languages', 'jdatatables', 'data'}
EXTENSIONS = {'.css', '.js', '.mjs', '.json', '.png', '.jpg', '.jpeg', '.gif', '.webp',
              '.svg', '.ico', '.avif', '.woff', '.woff2', '.ttf', '.otf'}
ROOT_FILES = {'offline.js', 'service-worker.js', 'site.webmanifest'}


def is_asset(relative: Path) -> bool:
    return (relative.as_posix() in ROOT_FILES or
            len(relative.parts) > 1 and relative.parts[0] in DIRECTORIES
            and relative.suffix.lower() in EXTENSIONS)


def build_manifest(site: Path, changed: list[Path] | None = None,
                   overrides: dict[str, Path] | None = None) -> tuple[Path, Path]:
    site = site.resolve()
    manifest_path, version_path = site / 'offline-manifest.json', site / 'offline-version.json'
    if changed is not None and manifest_path.exists():
        files = json.loads(manifest_path.read_text())['files']
        candidates = changed
    else:
        files = {}
        candidates = [p for p in site.rglob('*') if p.is_file() and not p.is_symlink()]
    for path in candidates:
        path = path.resolve()
        try:
            relative = path.relative_to(site)
        except ValueError:
            continue
        if not is_asset(relative):
            continue
        name = quote(relative.as_posix(), safe='/')
        if not path.is_file():
            files.pop(name, None)
            continue
        body = path.read_bytes()
        files[name] = {'hash': hashlib.sha256(body).hexdigest(), 'size': len(body)}
    # Article images can be uploaded from articles/images rather than the site's
    # local copy. Version the actual uploaded bytes at their public destination.
    for name, source in (overrides or {}).items():
        relative = Path(name)
        if relative.is_absolute() or '..' in relative.parts or not is_asset(relative):
            raise ValueError('Invalid offline asset destination')
        body = source.read_bytes()
        files[quote(relative.as_posix(), safe='/')] = {
            'hash': hashlib.sha256(body).hexdigest(), 'size': len(body)}
    body = json.dumps({'schema': 1, 'files': files}, sort_keys=True, separators=(',', ':')).encode()
    version = hashlib.sha256(body).hexdigest()
    for path, content in [(manifest_path, body),
                          (version_path, json.dumps({'version': version}, separators=(',', ':')).encode())]:
        if not path.exists() or path.read_bytes() != content:
            temporary = path.with_suffix(path.suffix + '.tmp')
            temporary.write_bytes(content)
            temporary.replace(path)
    return manifest_path, version_path


def offline_uploads(files: tuple[tuple[Path, str], ...]) -> tuple[tuple[Path, str], ...]:
    """Called after ordinary uploads succeed; publish each version marker last."""
    groups: dict[Path, tuple[str, list[Path]]] = {}
    for local, remote in files:
        local = Path(local).resolve()
        for site in [ROOT / 'default', ROOT / 'guides']:
            try:
                relative = local.relative_to(site)
            except ValueError:
                continue
            suffix = relative.as_posix()
            if not remote.endswith(suffix) or not (site / 'service-worker.js').is_file():
                continue
            base = remote[:-len(suffix)]
            if site not in groups:
                groups[site] = (base, [])
            elif groups[site][0] != base:
                raise ValueError('One site cannot publish offline metadata to different roots.')
            groups[site][1].append(local)
    result = []
    for site, (base, changed) in groups.items():
        overrides = {remote[len(base):]: Path(local) for local, remote in files
                     if remote.startswith(base) and is_asset(Path(remote[len(base):]))}
        for generated in build_manifest(site, changed, overrides):
            result.append((generated, base + generated.name))
    return tuple(result)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('sites', nargs='*', type=Path, default=[ROOT / 'default', ROOT / 'guides'])
    for site in parser.parse_args().sites:
        for path in build_manifest(site):
            print(path)
