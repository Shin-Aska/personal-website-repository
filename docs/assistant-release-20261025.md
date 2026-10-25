# Guide assistant beta publication —25 October2026

The owner requested committing the remaining tests, then uploading the beta to FTP. Signed test-history commit: `3c78aa0`; frozen runtime commit: `2ea2c53`. All120 historical test reports were archived unchanged. The broader conversation goal remains paused for the next agent.

The release is live at [the guides](https://guides.richardorilla.website/). Exactly86 runtime/metadata files were uploaded under `/guides`, including55 new files. The mappings remain `guides/` → `/guides`, `default/` → `/personal-website`, `classic/` → `/site6`; the latter two roots were untouched. Tests, docs, Python tools, experiments, local caches, credentials and backups were excluded from FTP. No remote directory was mirrored or cleared, and no Git push was performed.

New dependencies and the eight existing pinned intent-model parts preceded updated scripts/profiles and pages; the reconciled offline manifest and its version marker went last. Model identities, weights and fact vectors remain unchanged. The release reused existing approved assets, with no external model downloads, fitting or installations. The previously deployed wording-model payloads were reused. Four shared runtime parts passed full FTP hash checks.

Every replacement had a private local rollback copy. Temporary uploads were completed and hash-verified before promotion; existing files used a backed-up rename swap. All86 final files passed binary FTP SHA-256 readback. This is not an atomic multi-file deployment.

Production metadata preserves all774 untouched live entries, including older server line endings. It contains841 entries; version `e0f2ef72a6344f1a3a74e4c5ca421719543f152a3b27d5b06547d7be1c9ad6a9`. The checkout manifest still describes checkout bytes and intentionally differs. Future partial releases must reconcile the current live baseline again.

## Public and browser verification

All80 non-HTML release files match their public HTTPS bytes exactly. Cloudflare adds its analytics script to the six HTML responses; removing only that one external beacon tag and following newline reproduces each complete original page byte-for-byte. The initial strict HTML hash failure is preserved, rather than declared an exact raw match.

Seven chat surfaces across the six games returned42 complete expected sourced replies using the real pinned MiniLM intent worker. There were42 native classification result events, no worker errors,28 desktop/phone layout and expansion checks, unchanged progress, no page errors and no requests containing the tested questions. Service workers were real, with a controlled reload before testing. The earlier wording model used the disclosed consent/worker fixture; no native generative inference or low-end performance claim is made.

The raw browser harness records5/7 passing surfaces because it also required a separate query-embedding event for every question. Ultima VI and StarCraft correctly completed typed source answers before that optional retrieval step; both still performed six native classifications. All their answer/source and layout assertions passed. The adjudication preserves those two overstrict diagnostic failures and validates the actual classification evidence. No production, model or answer-oracle change was made, and no passing surface was rerun.

These are repeated known smoke questions, not a new broad acceptance campaign. The documented beta answer gaps remain:51/72 useful answers in the harder source-first set,21 supported unanswered questions,24 genuine established-corpus gaps and the separate local semantic smoke5/13. See [the beta checklist](assistant-beta-checklist.md) for the deferred work.

Canonical records: [release receipt](../guides/tests/assistant/evidence/deployment-20261025.json), [raw live smoke](../guides/tests/assistant/evidence/deployment-live-browser-20261025.json), [live adjudication](../guides/tests/assistant/evidence/deployment-live-adjudication-20261025.json). Credentials, upload scripts, raw public HTML diagnostics and rollback copies remain private/local.

Already-open guides need navigation or reload to use the new module graph. Verification covers controlled reloads; it does not promise immediate freshness for every existing bare browser/CDN cache entry.
