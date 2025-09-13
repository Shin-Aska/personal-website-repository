#!/usr/bin/env python3
"""
Generate sitemaps for the 'default' and 'classic' site variants.

- Scans only top-level .html files in each webroot (no subdirectories)
- Excludes error/test/template files (401/403/404/test/template)
- Uses file modification time as <lastmod> (UTC, RFC3339)
- Writes to '<site>/sitemap.xml'

Adjust SITES below if your base URLs change.
"""
from __future__ import annotations

import sys
from pathlib import Path
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

# Sitemap XML namespace
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace('', NS)

# Configure sites here
SITES = [
    {
        "name": "default",
        "dir": "default",
        "base_url": "https://www.richardorilla.website/",
        "output": "sitemap.xml",
    },
    {
        "name": "classic",
        "dir": "classic",
        "base_url": "https://classic.richardorilla.website/",
        "output": "sitemap.xml",
    },
]

EXCLUDE_FILENAMES = {
    "401.html",
    "403.html",
    "404.html",
    "test.html",
    "template.html",
}


def iso_utc(dt: datetime) -> str:
    """Format datetime in RFC3339 with seconds and +00:00 offset."""
    return dt.astimezone(timezone.utc).isoformat(timespec='seconds')


def normalize_loc(url: str) -> str:
    """Normalize URL for matching (strip a trailing '/')."""
    return url.rstrip('/')


def parse_dt(value: str) -> datetime | None:
    """Parse an ISO8601-ish datetime string to aware UTC datetime.

    Returns None if parsing fails.
    """
    if not value:
        return None
    txt = value.strip()
    try:
        # Handle trailing Z by converting to +00:00
        if txt.endswith('Z'):
            txt = txt[:-1] + '+00:00'
        dt = datetime.fromisoformat(txt)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def load_existing_lastmods(sitemap_path: Path) -> dict[str, datetime]:
    """Load existing lastmod values from a sitemap if present.

    Returns a map of normalized loc -> datetime.
    """
    mapping: dict[str, datetime] = {}
    if not sitemap_path.exists():
        return mapping

    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        # Iterate over url entries without relying on a specific namespace prefix
        for url_el in root.iter():
            if not url_el.tag.endswith('url'):
                continue
            loc_txt = None
            lastmod_txt = None
            for child in url_el:
                tag = child.tag.split('}', 1)[-1]
                if tag == 'loc':
                    loc_txt = (child.text or '').strip()
                elif tag == 'lastmod':
                    lastmod_txt = (child.text or '').strip()
            if loc_txt and lastmod_txt:
                dt = parse_dt(lastmod_txt)
                if dt is not None:
                    mapping[normalize_loc(loc_txt)] = dt
    except Exception:
        # On any parse error, just ignore and proceed without prior data
        return mapping

    return mapping


def collect_urls(root_dir: Path, base_url: str, existing_lastmods: dict[str, datetime]) -> list[tuple[str, str]]:
    """Collect (loc, lastmod) for top-level HTML files under root_dir.

    The lastmod chosen is the newer of the file's mtime and any existing sitemap value.
    """
    urls: list[tuple[str, str]] = []
    base = base_url.rstrip('/')

    # Gather .html files in the top-level only
    for p in sorted(root_dir.glob('*.html')):
        name_lower = p.name.lower()
        if name_lower in EXCLUDE_FILENAMES:
            continue

        if name_lower == 'index.html':
            loc = base
        else:
            loc = f"{base}/{p.name}"

        mtime = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc)
        prior = existing_lastmods.get(normalize_loc(loc))
        # Prefer the newer of prior lastmod and mtime (if prior exists)
        chosen_dt = max(mtime, prior) if prior is not None else mtime
        urls.append((loc, iso_utc(chosen_dt)))

    # Ensure index (root) appears first, rest sorted lexicographically
    urls.sort(key=lambda x: (0 if x[0] == base else 1, x[0]))
    return urls


def indent(elem: ET.Element, level: int = 0) -> None:
    """Pretty-print XML in-place."""
    i = "\n" + level * "  "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "  "
        for child in elem:
            indent(child, level + 1)
        if not child.tail or not child.tail.strip():  # type: ignore[name-defined]
            child.tail = i  # type: ignore[name-defined]
    if level and (not elem.tail or not elem.tail.strip()):
        elem.tail = i
    if level == 0 and (not elem.tail or not elem.tail.strip()):
        elem.tail = "\n"


def build_sitemap(urls: list[tuple[str, str]]) -> ET.ElementTree:
    urlset = ET.Element(ET.QName(NS, 'urlset'))
    for loc, lastmod in urls:
        u = ET.SubElement(urlset, ET.QName(NS, 'url'))
        el_loc = ET.SubElement(u, ET.QName(NS, 'loc'))
        el_loc.text = loc
        el_lastmod = ET.SubElement(u, ET.QName(NS, 'lastmod'))
        el_lastmod.text = lastmod
    indent(urlset)
    return ET.ElementTree(urlset)


def write_sitemap(tree: ET.ElementTree, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = output_path.with_suffix('.xml.tmp')
    tree.write(tmp, encoding='utf-8', xml_declaration=True)
    tmp.replace(output_path)


def main(argv: list[str]) -> int:
    repo_root = Path(__file__).resolve().parents[1]

    # Optional: allow specifying a subset of sites by name
    requested = set(argv[1:]) if len(argv) > 1 else set()

    processed_any = False
    for site in SITES:
        name = site["name"]
        if requested and name not in requested:
            continue

        root_dir = repo_root / site["dir"]
        base_url = site["base_url"]
        output_path = root_dir / site["output"]

        if not root_dir.exists():
            print(f"[WARN] Skipping '{name}' - directory not found: {root_dir}")
            continue

        # Load any existing lastmod values from prior sitemap
        existing = load_existing_lastmods(output_path)
        urls = collect_urls(root_dir, base_url, existing)
        if not urls:
            print(f"[WARN] No HTML files found for '{name}' in {root_dir}")
            continue

        tree = build_sitemap(urls)
        write_sitemap(tree, output_path)
        print(f"[OK] Wrote {output_path} with {len(urls)} URLs")
        processed_any = True

    if not processed_any:
        print("[INFO] No sitemaps generated.")
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
