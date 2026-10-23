# Default prefetch, offline status and download progress: published

23 October 2026. **Published with the owner's explicit instruction.** The earlier
135-file publication is separate. This update published **79 selected files**:
the 13-file runtime/metadata set below plus 66 HTML loader-URL corrections.
Classic remains unchanged. The owner also authorized committing the completed
work and reserved GitLab/GitHub pushes for themselves.

Default now prepares a few likely HTML destinations and their core CSS/scripts,
including visible Blog cards and deliberate hover/focus. Guides do not prefetch.
Both sites use a quieter offline status pill; default follows its existing light
and dark themes. Saving text is delayed 400 ms to avoid flicker on cached visits.
See [offline-reading.md](offline-reading.md) for limits and freshness behavior.

The guide model's loading dialog now shows downloaded MB / required MB and an
estimated transfer speed, updating within each file. Valid cached bytes are
shown separately and reduce the required download. Fully cached loads show saved
file loading without a fabricated speed. This applies through the shared loader
to all six guides. The model files/profile and inference behavior are unchanged.

## Exact runtime upload list

| Local source | Remote destination |
| --- | --- |
| `default/offline.js` | `/personal-website/offline.js` |
| `default/service-worker.js` | `/personal-website/service-worker.js` |
| `default/css/offline.css` (new) | `/personal-website/css/offline.css` |
| Production-specific default manifest | `/personal-website/offline-manifest.json` |
| Production-specific default marker | `/personal-website/offline-version.json` |
| `guides/offline.js` | `/guides/offline.js` |
| `guides/css/offline.css` (new) | `/guides/css/offline.css` |
| `guides/js/assistant/bootstrap.js` | `/guides/js/assistant/bootstrap.js` |
| `guides/js/assistant/model-runtime.js` | `/guides/js/assistant/model-runtime.js` |
| `guides/js/assistant/model-worker.js` | `/guides/js/assistant/model-worker.js` |
| `guides/js/assistant/model-download.js` (new) | `/guides/js/assistant/model-download.js` |
| Production-specific guide manifest | `/guides/offline-manifest.json` |
| Production-specific guide marker | `/guides/offline-version.json` |

The first phase published exactly **13 files, 364,288 bytes** from:
`/tmp/orilla-progress-release-20261023T132101Z/upload/`.
Its sibling `release.json` lists every destination, size and SHA-256, and records
the verified live baseline. Its `baseline/` folder preserves the two live
manifest/marker pairs. Only `upload/` contains upload candidates; do not upload
the whole package. Temporary files may disappear after a restart.

This supersedes the earlier nine-file prefetch/status package at
`/tmp/orilla-prefetch-release-20261023T130417Z`; do not upload both packages.

The package changes only three default asset entries and six guide asset entries
in the live manifests. Other production entries are preserved byte-for-byte in
meaning, including older CRLF assets that differ from local LF sources. Local
`offline-manifest.json` / `offline-version.json` describe the checkout for tests;
**do not substitute them for the production-specific pairs** in a partial upload.

The second phase published **66 HTML pages**: all 59 default root pages and seven
guide root pages (`index`, `Albion`, `Ultima5`, `Ultima6`, `Ultima7`, `AlQadim`,
`StarcraftBWAPI`). Each differs from its preceding publication only by
`offline.js?v=2` → `offline.js?v=3`. The article template has the same local change
for future pages and is not uploaded. The exact 66 destinations, hashes and
private rollback backups are under the package's `loader-v3/` directory.

This addition was necessary because live testing found the old `?v=2` bootstrap
still served as a Cloudflare HIT with `max-age=31536000`. A worker cannot replace
the script before its first uncontrolled execution. A new entry URL fixes fresh
visits and browser caches, while the worker continues hash-versioning other
assets. Both public `?v=3` loaders match source bytes; all 66 canonical page URLs
reference them. FTP readback verifies all **79** destination file hashes.

These packages are publication evidence, not a baseline for replaying a future
upload. For later changes, start from the latest verified live manifests, update
only entries for actual uploaded bytes and recheck source/remote hashes. Upload
assets first, manifests after their assets, then version markers last. Further
publication needs the owner's instruction. No remote directory was mirrored or
cleared and no unrelated remote files were removed.

## Development files, excluded from upload

- `tools/tests/test_default_prefetch.py` (15 new browser regressions).
- `tools/tests/test_offline_reading.py` (actual guide worker fixture and the
  intentional default/guide split assertion, documented in its comment).
- `guides/tests/assistant/model-download.test.mjs` and
  `model-download-browser.py`, their JSON report, and the assistant module README.
- This document, `docs/offline-reading.md`, `docs/assistant-handoff.md`, and
  `docs/game-assistant.md`.

Only the 66 named root HTML pages joined the runtime set. No other HTML, model
parts, assistant engine/data, guide reading service worker, tests, screenshots,
Python tools, documentation, Classic (`/site6`) or unrelated directories were
uploaded. The new root `.gitattributes` preserves hashed model parts exactly in
Git; it and the earlier completed work belong in the authorized commit.

## Acceptance evidence

Cache/manifest/publisher tests pass **49/49**. Real-page checks cover default
light/dark mode, live theme changes, Blog → Mobile Gaming 2026 card navigation,
and non-overlapping status/settings on all six guides at 320 px. Evidence is
under `/tmp/default-prefetch-checks/`; screenshots stay outside the repository.
Chrome was tested; no claim of production speed or cross-browser acceptance.

Before the loader-URL correction, the source audit found **125 of 135
previously published files are unchanged**, seven cache files and three model
loader modules changed locally, and two status stylesheets plus one download
helper are new. The factual engine, model parts/profile, guide reading worker,
guide pages and main page content were unchanged in those rounds. Including the
66 URL-only page corrections, **59 of the original 135 source files are now
unchanged**, 76 changed, and three runtime files are new. Page content is preserved.

The earlier prefetch/status acceptance is preserved at
`/tmp/default-prefetch-checks/acceptance.json`. The download progress regression
run is recorded separately in `/tmp/guide-download-checks/`; this package includes
both changes. This earlier acceptance was local; publication followed the
owner's later explicit instruction.

Final download-progress acceptance passes original **203/203**, English
**1058/1058**, standalone/pilot **967/967**, both page-fact checks, all **18 guide
browser suites**, and cache/manifest/publisher **49/49**. The new streaming fixture
suite passes **14/14**; real-model acceptance passes **105/105**. Runtime remained
frozen; all 13 package files/hash references verify and `git diff --check` passes.
The owned regression servers were closed and regenerated repository screenshots
removed. Final record: `/tmp/guide-download-checks/acceptance.json`.

After the loader correction, the full Node/page-fact and **18 browser suites**
pass again; cache/manifest/publisher acceptance is now **50/50**. The new case
rejects a simulated stale `?v=2` entry response on first visits to both scopes.
The shared-copy fixture's hook expectation intentionally changes to `?v=3`, with
a comment recording why. A first run used a default-only theme fixture in the
guide scope and failed on its missing stylesheet; the final case uses the shared
fixture and preserves all assertions. Logs are in
`/tmp/guide-download-checks/loader-v3` and `cache-loader-v3-final.log`.

Final live acceptance: **36** real-model checks across all six guides, **7**
strict main-site smoke checks, **17** main-site/guide-hub offline checks and **7**
prefetch/theme checks pass. Download counts/rate were observed on the real model
transfer; all six generated sourced replies without changing progress. The live
Blog → Mobile Gaming 2026 preparation, navigation and offline reload work, and
both default themes use the new pill. No final page errors or tested
question-bearing inference requests were found.

The older combined smoke's main-site portion initially switched offline on the
first HTML cache write, before saving finished. Its original assertions pass in
an independent run after `Available offline` and core dependencies are ready.
The initial raw failure is retained; the final combined record explicitly notes
that it contains separate guide/main runs. The source-only initial Cloudflare
failure is retained too. Final proof is `deployment-acceptance.json` in the
private package; no claim that the initial attempts passed.
