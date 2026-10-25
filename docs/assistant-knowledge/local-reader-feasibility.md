# Existing SmolLM source-selection feasibility — 2026-10-25

The already present approved SmolLM2 model can technically perform bounded source-ID generation through the packaged causal-language-model API. This small native experiment did **not** establish useful selection: it returned `A` for every request, scoring **0/8** on the frozen exploratory cases. It must not be promoted into production or used to authorize answers. Slot extraction and broad conversational accuracy were not measured.

## Concrete API findings

`guides/js/assistant/model-worker.js` loads `AutoTokenizer` and `AutoModelForCausalLM` from the existing verified Transformers runtime. It uses one-thread WASM, disables remote models and masks logits through `LogitsProcessorList`, `nextFrameTokens` and `maskFrameScores`. The native `model.generate` API accepts caller-supplied chat-template inputs and an explicit constrained decoder. No additional model or runtime files are required for this operation.

The production worker itself only permits strings returned by `approvedFrames(data.kind)`, and `model-runtime.js` only sends a response kind and messages. That public worker contract cannot emit arbitrary source IDs or field objects. The isolated experiment copied its loader and generation logic into the ignored result directory, replaced only the approved-frame list with the fixed `A`, `B`, `C`, `D`, `NONE` choices, and added timing diagnostics. No production worker, runtime, corpus, oracle or classifier file was edited.

This is closed-choice greedy generation, not a calibrated classifier probability or a sequence-likelihood comparison. The reason for its observed collapse to `A` is unproven. The observation does not prove that all possible prompts or scoring methods fail, but it supplies no quality basis for integration. No prompt or case tuning followed these outcomes.

## Frozen source cases and protocol

Before inference, `cases.json` froze four exact witnesses from `guides/data/assistant/knowledge/albion.json`, their fact IDs and original source locators. All four witness strings are also directly present in the cited original `guides/js/Albion.js`: `hide-weapon`, `pistol`, `anne-rations`, and `com-code`. They were presented as `A` through `D`, respectively. These are approved source declarations, not a claim of independent gameplay verification.

Eight cases were authored before loading the model: four supported requests for acquisition, compound code-and-person fields in one witness, a food paraphrase and an explicitly negated hiding distractor; four requests requiring abstention for a silver/silenced weapon qualifier, unprovided current inventory state, a contradictory “never hide” claim and an unsupported food price/discount. The fixed system prompt required complete support and `NONE` for absent details, contradictions or unsupplied player state. A correct source selection would still require downstream deterministic witness and authorization checks; no generated answer facts were requested or displayed.

This is a narrow exploratory feasibility probe, not an acceptance suite, retrieval benchmark, independent holdout or evidence of all-six-game accuracy. The four candidate passages were supplied explicitly; production candidate recall was not measured. No request context or expected fact was injected into a saved game.

## Native results

| Measure | Observed |
| --- | --- |
| Model preparation | 2,471 ms |
| Selection latency | median 1,256.9 ms; range 1,224.3–1,363.2 ms |
| Prompt size | 235–241 tokens |
| Supported selections | 0/4 correct |
| Required abstentions | 0/4 correct; all four selected a source ID |
| Output | `A` on all eight requests |
| External/blocked requests | 0 / 0 |
| Page errors | 0 |
| Watched input/source hashes | Unchanged |
| Ephemeral local/session storage | Both empty after inference |
| Owned browser and loopback server | Closed |

Native generation completed successfully with finite elapsed timings and no model errors. Chrome and WASM ran the actual SmolLM assets. These are not synthetic classifier outputs. The isolated browser used a fresh context, blocked service workers and accepted only bodyless GET requests to its own ephemeral loopback port (plus local blob/data URLs). The loader used the existing origin-scoped verified model cache inside that disposable browser. No installation, asset download, remote inference, user preview-tab access or game-state mutation occurred. Total worker/WASM memory was not measured.

## Exact provenance and reproducibility

- Model: `HuggingFaceTB/SmolLM2-135M-Instruct`, revision `12fd25f77366fa6b3b4b768ec3050bf629380bac`, q8.
- Runtime: the existing `@huggingface/transformers@3.8.1` profile runtime; one WASM thread.
- Existing profile: `guides/local-assistant/profile.json`, SHA256 `7fcde9d4b3d8842dc2345159687e845e023ce9049c92deab6d99d494e6ba813d`.
- All 18 existing profile assets passed their exact configured byte lengths and SHA256 values before inference. Their individual hashes, the original worker hash, experiment script hashes and all joined model-file hashes are preserved in `report.json`.
- Joined q8 ONNX model: 137,147,981 bytes, SHA256 `ecc1a19eece6494e2963cf74f78ace35916e8d0b803168ddd41db00979f18e39`.
- Transformers module SHA256: `aa5002b70e789798da263f5f99c62bd3e8fcd0c119258a493c40c180648365fa`.
- WASM loader SHA256: `08fb86ec433c78bfb032c5d84a68b8e8e5a8d81268fa39e24314179a5767a5b9`; joined WASM binary SHA256: `c46655e8a94afc45338d4cb2b840475f88e5012d524509916e505079c00bfa39`.
- Frozen cases SHA256: `c175a7b3618de772ac14e829faddb659c4259eb47bbe81f2438626eed6abe78d`.
- Report SHA256: `f4978016509700198e02eda29106bf5c66e70de40cbaf163fe8133825372aa47`.

All experiment files are local and ignored under `guides/tests/assistant/intent-prototype/results/local-reader-20261025/`: `cases.json`, `worker.mjs`, `index.html`, `run.py`, `report.json`. The harness uses already installed Python Playwright and `/usr/bin/google-chrome`; it needs no dependency installation. The recorded run is complete and retained. Repeating the harness would overwrite its report, so preserve the existing directory and copy the isolated experiment to a new uniquely named ignored directory before any future run.

**Decision:** the available native API supports a constrained selector experiment without new assets, but the measured selector is unsuccessful. Continue source relationships and deterministic authorization work with the existing models; retain this failure as evidence. No automatic feature promotion or new-asset request follows this probe.
