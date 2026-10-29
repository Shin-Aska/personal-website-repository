# Guide assistant partial release — 29 October 2026

The owner requested publication of the current assistant repairs, followed by a local commit. Four runtime knowledge assets were published under `/guides`, followed by production offline metadata:

- `data/assistant/knowledge/albion.json` and `albion-embeddings.json`
- `data/assistant/knowledge/ultima6.json` and `ultima6-embeddings.json`
- `offline-manifest.json`, then `offline-version.json`

The saved FileZilla website connection was reused. The production manifest was derived from the live manifest: it retains all 841 entries, with only the four uploaded asset entries changed. Its SHA-256 version is `b8fec2f264e4a45c034a1eb74dd94e23bc49af55d98434b70f920a0731fd9252`. The checkout manifest describes checkout bytes and is kept separate.

Before upload, all six destinations were backed up privately and FTP bytes were checked against public HTTPS. Each asset was uploaded to a temporary path, checked by binary FTP readback, promoted, and checked again. After publication, all six final FTP and cache-bypassed public HTTPS responses matched the package bytes exactly. Private rollback copies remain in `/tmp/orilla-assistant-release-20261029/backup`. This is not an atomic multi-file deployment.

The local pre-release evidence is recorded in [the beta checklist](assistant-beta-checklist.md): **924/1,005** strict full-corpus turns, **94/96** source-first turns (two complete Brion answers cite the protected parent rather than the expected child), and **2,147/2,147** recursive Node checks. A separate Compassion follow-up also improved. These overlapping and previously used test sets do not establish unrestricted accuracy. No models or fact vectors were changed. Tests, documentation, tools, caches, and backups were excluded from FTP. No Git push was performed.

Already-open guides may need a reload to obtain the new assets. Public verification establishes byte delivery, not a fresh live conversation or universal cache freshness.
