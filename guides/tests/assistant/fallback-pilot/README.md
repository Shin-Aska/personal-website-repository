# SmolLM2 conversational fallback trial

**Historical experiment.** The owner-approved live integration now lives in
[`guides/js/assistant/`](../../../js/assistant/) with its model/configuration in
[`guides/local-assistant/`](../../../local-assistant/). Change the shared model
there. This folder preserves the earlier prompts, failures and raw evidence;
it is not a second production model configuration. The original ignored model
downloads remain for reproducing these trials and rebuilding the shipped parts.

An isolated experiment requested on 23 October 2026. No live guide imports it.
The model writes a short response to a conversational follow-up using the
recent visible chat and a few authorized source passages. It is not asked to
write a full walkthrough from memory. Raw output is retained and explicitly
labelled experimental/unverified; it is not silently promoted to guide fact.
The latest `guarded` variant narrows this further: the model selects only an
approved conversational sentence, and the program attaches exact source quotes.

Model: `HuggingFaceTB/SmolLM2-135M-Instruct`, q8 ONNX, pinned in
`assets-plan.json`. Runtime: Transformers.js 3.8.1, CPU WebAssembly, one thread,
with remote model/runtime access disabled. Model + tokenizer/config + browser
runtime total approximately **161.8 MB**. No package manager or system-wide
installation is needed. Neither model nor runtime payloads have been downloaded
unless explicit owner approval is recorded in that manifest.

The download proposal is reviewable in `assets-plan.json` and `fetch-assets.py`:
only its nine pinned files, with byte counts and integrity hashes, may be fetched.
The wrapper requires both recorded permission and `--approved`; `--verify-only`
does not fetch. Downloaded `model/` and `vendor/` are ignored by Git.

## Trial boundaries

- Existing engine answers remain the baseline. Real unsupported follow-ups are
  distinguished from controls that force the model on a supported answer.
- Use only authorized records and history at the current help level. Hidden
  history is omitted, and stale source records are reauthorized before use.
- Actual passages, source references, prompt text, raw model output, token counts,
  cold preparation, first-token and complete-response timing are retained.
- Supplied context and model fluency do not establish truth. Exact quote and
  citation checks are mechanical checks only; invented paraphrases require
  explicit source-based review of the raw output.
- No guide storage writes, progress assertions, map actions, installs, model
  changes, deployment or production integration occur as part of this trial.
- Network is restricted to loopback static GETs during inference; after loading,
  replies are also checked with the browser offline. Use existing Python
  Playwright and `/usr/bin/google-chrome`.

The Ariana exchange is the first calibration case. Additional cases cover
unsupported reasons, topic changes, pronouns, missing facts, injected instructions,
wrong editions and lower-help boundaries across the guides. Calibration may guide
prompt changes; a separate evaluation set is frozen before generation. Report
both failures and successes, and do not call a rejected raw response a grounded
answer merely because a template could hide it.

## Run or inspect

The owner approved the nine pinned files on 23 October 2026. They are downloaded
and verified. The total is **161,786,625 bytes**: 139,257,949 bytes of model,
tokenizer and configuration plus 22,528,676 bytes of browser runtime. This is
download storage, not peak memory. No package was installed.

```sh
python3 guides/tests/assistant/fallback-pilot/fetch-assets.py --verify-only
/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test guides/tests/assistant/fallback-pilot/*.test.mjs
python3 guides/tests/assistant/fallback-pilot/browser-trial.py --split all --style guarded
```

`browser-trial.py` owns a loopback server on port 8767 and closes it in `finally`.
It extracts StarCraft records from the actual page, prepares 29 original cases
(39 for `topic`; 45 for `guarded`, including six additional guardrail cases), and
runs the selected split with real CPU inference. Its local model/runtime requests
are static GETs; external requests are blocked. Root-guide service workers are
blocked in this test context to keep measurements repeatable. The existing
site's worker/storage behavior is not modified.

For manual inspection, serve the repository and open
`/guides/tests/assistant/fallback-pilot/index.html`. It exposes the prompt,
source passages, raw experimental output, timing and limited mechanical checks.
It cannot update game progress. It is not linked from any live guide.

Prompt styles are `structured`, `plain`, `chat`, `strict`, `topic` and `guarded`. The initial
structured calibration used an 80-token greedy cap without a repetition penalty.
The shorter plain/chat styles and owner-requested strict style use 60 tokens,
greedy decoding and repetition penalty 1.1. The strict and chat runs share that
same generation configuration; only their system instructions differ. The strict
instruction explicitly forbids unstated eye colour, clothing, personality,
places and causes, and directs a missing-evidence response. No additional model,
fine-tuning, sampling search or hidden answer template was used.

The owner then approved the `topic` experiment: explicitly identify the model as
a fallback, state that the main engine could not answer, and supply an authorized
current-topic label. This variant includes conservative program routing. A
single named subject replaces the previous topic; recognizable follow-ups may
retain it. Unknown/ambiguous/unconnected requests receive a fixed
"I don't have an answer for that in this guide." without inference. An existing
engine answer also bypasses inference. The report records `responseKind` as
`model`, `unknown` or `engine`; fixed replies are never model successes.

Topic state comes only from visible engine history and authorized records, never
from generated model text. New subjects drop older chat. Hidden exchanges, reset
and unresolved new subjects prevent restoring stale context. The pilot uses a
limited alias/pronoun/subject-pattern heuristic and a weather-word exclusion;
it is not general English coreference. It can reject a connected request (for
example, "Why are there three missiles?") or miss unfamiliar unrelated wording.
This is an isolated experiment, not an accepted production routing contract.

Original definitions and raw earlier reports remain unchanged. Additional cases
are in `topic-case-definitions.json`. `topic-initial-all-*` retains the first topic
run before correcting two routing false positives involving ordinary capitals
and "I'm". The final `topic-all-*` evidence includes every route, actual prompt,
raw generation and offline repeat. `topic-source-review.json` reviews them
separately, with comparisons to earlier outputs on the same questions.

## Enforced conversational guardrails

The owner approved implementing the missing-information guardrail while keeping
the model as a last-resort conversational aid. `guarded.js` assigns a reason,
detail or rephrasing frame after an engine nonanswer. Each category has three
authored sentences. Wording says no sourced answer was produced here; it does
not claim that the entire guide lacks an answer the engine might have missed.
Known supported engine answers are preserved. Progress commands receive a fixed
capability reply with no inference or storage changes.

The first guarded run still allowed free generation, then checked complete
wording. All 26 attempts failed that contract and were replaced by program
replies; raw evidence remains as `guarded-free-all-*`. The final worker also
masks every next token that cannot continue an approved sentence. It uses the
existing runtime's logits processor, not new dependencies or weights. A final
complete-frame check remains: an approved sentence plus even one invented claim
is rejected in full. Approved source text and citations are appended by the
program, never copied or paraphrased by the model. Stale/missing current context
discards an in-flight reply and its quotes.

This is a **finite phrase selector**, not a free-form writer or a general factual
verifier. It chooses among nine authored frames (three per category). Selection
varied across seven frames in the final run. All 26 generations met the closed
contract; that is expected from the token constraint and is not model accuracy.
A deterministic sentence would avoid the model's latency altogether. The topic
heuristic's existing limitations still apply.

The viewer shows the assembled reply in `#reply`; unverified raw output remains
inside collapsed details, and is never streamed into the primary reply. Final
evidence is `guarded-all-*`, with per-case displayed replies and contract review
in `guarded-contract-review.json`. All 45 cases exercised local/offline/storage/
production-hash and rendering checks. Pilot tests now total 59 (30 context,
23 reply guard, six finite-token tests). No live guide imports this experiment.

See [RESULTS.md](RESULTS.md) and `evidence/source-review.json` for the source-based
manual assessment. Reports retain the actual effective prompt and raw text, not
just a successful replacement message. The stricter prompt was tested on the same
fixed evaluation questions after their first results were known, so its results
are regression comparisons rather than a fresh blind estimate.
