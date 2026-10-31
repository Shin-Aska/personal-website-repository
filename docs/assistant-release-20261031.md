# Guide assistant partial release — 31 October 2026

The owner authorized publishing the current assistant repairs through the saved FileZilla website connection. After the owner updated its saved credentials, eighteen runtime/catalog files were published under `/guides`, followed by the production offline manifest and version marker. All twenty staged files passed binary FTP readback before any existing destination was replaced. All twenty final destinations then passed binary FTP SHA-256/size checks and cache-bypassed public HTTPS byte checks. An independent Terra check fetched the twenty public paths again with a fresh nonce and also passed.

The public base is <https://guides.richardorilla.website/>; it already serves `/guides`. For example, the Ultima VII guide remains <https://guides.richardorilla.website/Ultima7.html>.

## Published files

- `data/assistant/knowledge/albion.json` and `albion-embeddings.json`
- `data/assistant/knowledge/ultima5.json` and `ultima5-embeddings.json`
- `data/assistant/knowledge/ultima6.json` and `ultima6-embeddings.json`
- `data/assistant/knowledge/ultima7.json` and `ultima7-embeddings.json`
- `js/assistant/adapters/ultima7.js`
- `js/assistant/dialogue.js`
- `js/assistant/knowledge.js`
- `js/assistant/procedure-phase-fields.js`
- `js/assistant/request-frame.js`
- `js/assistant/source-field-router.js`
- `js/assistant/source-responses.js`
- New modules: `js/assistant/source-conflict-quotation.js`, `source-narrative-answer.js`, and `source-role-contrasts.js`
- `offline-manifest.json`, then `offline-version.json` last

These repairs improve topic and participant ownership, conversational follow-ups, procedure conditions, complete source support and citations, exact narrative answers, and explicitly qualified quotations of conflicting records. The [current beta checklist](assistant-beta-checklist.md) records the behavior and remaining limits.

## Production metadata and transfer safety

The production manifest was derived from the live FTP/HTTPS baseline, version `b8fec2f264e4a45c034a1eb74dd94e23bc49af55d98434b70f920a0731fd9252`. Only the eighteen uploaded asset entries changed: fifteen existing entries were updated and three new module entries added. All **826 untouched entries** retain their exact baseline hashes, sizes and other metadata, including server line-ending differences. The manifest grows from **841 to 844 entries**. Its raw SHA-256, also the production version marker, is:

`fb49c68640e66abf081c98f256aae4877def8585076c5e0d131f132555659dbe`

The checkout manifest/version remains separate at `b1b21e9dc8abfcf19959c0742e4f1ea8bb34062743c9746e036749513a0a0d05`. Production metadata was prepared outside the checkout and was not copied over it.

All **seventeen existing destinations** were backed up privately before replacement; the three new module destinations were confirmed absent. Preflight also checked forty-eight unchanged dependency/protected-source paths. The release staged every file under a unique temporary FTP path and verified its complete bytes before the first promotion. Runtime dependencies and catalog pairs were published in dependency order; no pages changed. The manifest followed the payloads and the version marker was published last. Each promotion was verified through FTP and public HTTPS before proceeding. Temporary old destinations were removed after successful verification; private rollback copies remain outside Git. This is not an atomic multi-file deployment.

Credentials were read from the saved FileZilla connection in memory and were not included in the release package or repository. Only this guides release was uploaded. Default/Classic sites, HTML/CSS, models, runtime profiles, tests, documentation, tools, caches and backups were excluded. The four uploaded embedding files have updated catalog-checksum headers; all674 embedding documents and vectors remain unchanged.

## Verification and scope

- [Sanitized deployment receipt](../guides/tests/assistant/evidence/deployment-20261031-01.json): twenty staged FTP checks, twenty final FTP checks and twenty public HTTPS byte checks, with per-file hashes and publication order.
- [Independent public HTTPS verification](../guides/tests/assistant/evidence/independent-publication-https-20261031-01.json): twenty fresh public responses match the package; production metadata and untouched entries verified.
- [Final engineering verification](../guides/tests/assistant/evidence/whole-checklist-engineering-verification-20261031-02.json): workspace Node **2,237/2,237**, native corpus **949/1,005**, source-first **96/96**, observed **209/220**, semantic **13/13**, frozen non-answer controls **293/293**, exact CSS UI matrix **63/63**. Strict misses and their adjudications remain recorded.
- [Clean-source export verification](../guides/tests/assistant/evidence/clean-source-export-postsummary-20261031-01.json): Node **2,237/2,237**, Python knowledge **7/7** and offline **5/5**, setup/catalog checks, all **844** packaged asset hashes.

The local package was independently audited by Luna. Separate local transaction simulations covered success, staged corruption, a payload HTTPS mismatch and a final version-marker HTTPS mismatch; failure cases retained or restored the original destinations. Those simulations are not counted as live transfer verification.

Already-open guides may need a reload. Cache-bypassed public verification establishes byte delivery, not universal CDN/browser cache freshness or a fresh production assistant conversation. The owner gameplay trial and exhaustive dedicated-worker network verification remain unverified as recorded in the checklist. Publication completed before the owner subsequently authorized a local commit of the implementation, tests, evidence and release records. No Git push was performed.
