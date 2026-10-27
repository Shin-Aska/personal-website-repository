# Guide assistant partial release — 27 October 2026

The owner requested FTP publication of the source-first metadata and router repairs. Upload and readback verification completed successfully over plain FTP; all public HTTPS responses match the package. No Git push was performed.

## What was published

Sixteen files under `/guides`, in this order:

1. Ten knowledge data files (dependencies first):
   - `data/assistant/knowledge/albion.json`
   - `data/assistant/knowledge/albion-embeddings.json`
   - `data/assistant/knowledge/alqadim.json`
   - `data/assistant/knowledge/alqadim-embeddings.json`
   - `data/assistant/knowledge/ultima5.json`
   - `data/assistant/knowledge/ultima5-embeddings.json`
   - `data/assistant/knowledge/ultima6.json`
   - `data/assistant/knowledge/ultima6-embeddings.json`
   - `data/assistant/knowledge/ultima7.json`
   - `data/assistant/knowledge/ultima7-embeddings.json`
2. Four assistant scripts:
   - `js/assistant/source-field-arguments.js`
   - `js/assistant/source-field-router.js`
   - `js/assistant/request-frame.js`
   - `js/assistant/dialogue.js`
3. Production metadata:
   - `offline-manifest.json`
   - `offline-version.json` (last)

These are the only runtime files that changed. No HTML pages, model assets or Classic/Default site files changed, and `/personal-website` and `/site6` were untouched. Tests, docs, tools, caches, credentials and backups were excluded.

Production metadata started from the live manifest (841 entries, version `8a15df99770a91f23af039b398c3055881f51a4121489ad65fce7d3aebc4237e`). Only the 14 changed file entries were updated; the other 827, including older server line-ending differences, were preserved. New live version: `4ed7c47082ed358c936e3d2bfed7d2a6809a538585cf096c758bad5c766ab2b6`. The checkout manifest in Git describes checkout bytes and intentionally differs.

## Verification

- Before the swap, each remote file was backed up locally to `/tmp/orilla-ftp-backup-20261027T130000Z` and verified against the previous public baseline. Each upload went to a temporary name (`.upload-tmp-*`), was SHA-256 checked by binary readback, swapped in, and checked again.
- After publication, all sixteen public HTTPS responses match the package bytes exactly (SHA-256 and byte size), and the public version marker reads `4ed7c47082ed358c936e3d2bfed7d2a6809a538585cf096c758bad5c766ab2b6`. No temporary files or backups were left on the server.
- Behavior was verified locally before release (see the 27 October row of [the beta checklist](assistant-beta-checklist.md)): source-first `knowledge-blind-browser-source-first-next-20261027-02.json` **94/96** strict (Node repro **96/96**), full corpus `knowledge-browser-next-20261027-02.json` **920/1,005** with **1,005/1,005 rows identical**, observed-220 **208/220** with **220/220 rows identical**, cached corpus replay `next-batch-20261027-02` **798/851** with **851/851 rows identical**, Node unit tests **2,142/2,142** passes, Python tests **7/7** passes, `setup.py --verify-only` clean.

The rollback copies (exact previous live bytes) remain private and local in `/tmp/orilla-ftp-backup-20261027T130000Z`. Already-open guides need a reload to pick up the new scripts and knowledge manifests.

