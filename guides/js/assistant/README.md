# Shared guide assistant

All six guides use this browser code. The model files live separately in
[`guides/local-assistant/`](../../local-assistant/); its `profile.json` is the
single active model configuration. Keep the model there rather than making
per-game copies or loading the historical trial.

| Area | Files |
| --- | --- |
| First-visit permission and settings | `bootstrap.js`, `consent.js` |
| Local model loading and worker | `model-runtime.js`, `model-worker.js` |
| Streaming download counts and estimated speed | `model-download.js` |
| Authorized fallback context and wording | `fallback-context.js`, `fallback-guard.js`, `frame-tokens.js` |
| Factual answers and conversation | `engine.js`, `language.js`, `retrieval.js`, `topics.js`, `rules.js`, `policy.js` |
| Shared controls and conversation rendering | `ui.js` |
| Guide data extraction | `adapters/` |

The engine owns factual answers. The optional model selects an approved
conversational sentence; the program supplies exact authorized quotes and
sources. Chat does not write saved game progress.

Read [the handoff](../../../docs/assistant-handoff.md) and
[design notes](../../../docs/game-assistant.md) before changing behavior.
Tests and retained evidence live in `guides/tests/assistant/`. The isolated
`fallback-pilot/` there is historical evidence, not a live dependency.
