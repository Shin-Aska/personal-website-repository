# Shared MiniLM intent encoder

This package reuses the six MiniLM files already approved and downloaded for the isolated prototype. It adds no external model download or package installation. The frozen `Xenova/all-MiniLM-L6-v2` encoder produces 384-dimensional normalized sentence embeddings on one CPU WASM thread. A deterministic regularized linear head predicts twelve intent labels. It generates no factual prose, selects no sources, and changes no guide or checklist progress.

`profile.json` maps verified, hash-addressed parts of at most 16 MiB. Its `runtimeAssets` reuse the existing Transformers.js 3.8.1 files and the existing `guide-assistant-model-files-v1` cache. New intent assets total 24,053,489 bytes; the existing 22,528,676-byte browser runtime is shared. Each cached or fetched part is checked for exact size and SHA-256 before use. Asset requests stay on the site, reject redirects, and contain no question text.

The exported head uses the unchanged prototype `training-v2.json` (180 examples) and `validation-v2.json` (72 examples). Only training examples fit weights; only validation examples select thresholds. The validation result is 68/72 and selects `minScore: 0`, `minMargin: 0`, `abstainAll: false`. Scores remain uncalibrated. This authored validation result does not establish accuracy across six guides or replace factual source authorization.

Use `python3 guides/local-assistant/setup.py --download` for the combined development setup, or `python3 guides/local-assistant/setup.py --verify-only` to check both shipped packages and bundle metadata offline. Complete tracked packages need no original raw prototype assets. Existing head reuse is the default: fitting-source, classifier-source, encoder, part and threshold checks run without refitting. Explicit `--rebuild-head` uses an existing local Playwright/Chrome environment; it blocks external browser requests and imports the unchanged prototype classifier. The older `intent/prepare.py` delegates to this same entry point, and `--reuse-head` remains a compatibility alias. No encoder fine-tuning occurs. `head.json` retains fitting provenance; its identical verified bytes are also stored as a content-addressed part for production.

`guides/js/assistant/intent-runtime.js` exports `INTENT_PROFILE_URL`, `createIntentRuntime`, and the page singleton `intentRuntime`:

- `profile()` reads metadata for the consent disclosure without creating a worker or loading model assets. It uses a dedicated metadata cache with network-first/offline-fallback behavior, so a newly created chat can reuse a previously verified profile while offline.
- `prepare()` / `start()` load the encoder lazily after the existing chat runtime and consent surface are ready.
- `classify(text, {signal, expectedEpoch})` returns sorted `{label, score}` rows; questions cross only the local Worker boundary.
- `reset()` / `cancelPending()` invalidate pending requests and increment `epoch`, retaining a prepared encoder. An in-flight CPU operation may finish internally; its cancelled result cannot reach the caller.
- `stop()` destroys the worker and rejects pending requests. Existing chat disable automatically calls it through the consent runtime subscription.
- `subscribe()`, `state`, `epoch`, and `thresholds` expose preparation and lifecycle state. `destroy()` also removes the consent subscription.

The adapter integration must keep factual decisions in the source engine, use the packaged validation gates, and clear its own conversation state on consent disable. Per-topic `AbortSignal` cancellation avoids interrupting other views that share this worker. `verification.json` records actual Chrome/WASM inference, local-only requests, cancellation, epoch reset, and disable behavior; lifecycle tests independently cover protocol races and exact head replay. `checksums.json` records this package's source and asset hashes.
