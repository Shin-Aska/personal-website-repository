# Guide assistant partial release — 26 October 2026

The owner requested FTP publication of the source-first routing repairs (runtime commit `541a1ec`; checkout manifest fix `47c8b44`). The owner ran the upload script; Claude prepared the package and verified the result. No Git push was performed.

## What was published

Five files under `/guides`, in this order: `js/assistant/knowledge.js`, `js/assistant/request-frame.js`, `js/assistant/source-field-router.js`, `offline-manifest.json`, then `offline-version.json` last. These are the only runtime files that changed since the published beta runtime (`2ea2c53`). No pages, model assets or data changed, and `/personal-website` and `/site6` were untouched. Tests, docs, tools, caches, credentials and backups were excluded.

Production metadata started from the live manifest (841 entries, version `e0f2ef72a6344f1a3a74e4c5ca421719543f152a3b27d5b06547d7be1c9ad6a9`). Only the three script entries changed; the other 838, including older server line-ending differences, were preserved. New live version: `8a15df99770a91f23af039b398c3055881f51a4121489ad65fce7d3aebc4237e`. The checkout manifest in Git describes checkout bytes and intentionally differs.

## Verification

- Before the swap, each remote file was backed up locally and required to equal the verified public baseline. Each upload went to a temporary name, was SHA-256 checked by binary readback, swapped in, and checked again.
- After publication, all five public HTTPS responses match the package bytes exactly (SHA-256), and the public version marker reads `8a15df99…`. No `.upload-tmp` or `.bak-20261026` leftovers are served.
- Behaviour was verified locally before release (see the 26 October rows of [the beta checklist](assistant-beta-checklist.md)): source-first 87/96, full corpus and observed-220 whole-row identical to the beta, full-answer UI smoke unchanged at 5/13. No new live browser smoke was run against the public site for this release.

The rollback copies (exact previous live bytes) and the upload script remain private and local. Already-open guides need a reload to pick up the new scripts.
