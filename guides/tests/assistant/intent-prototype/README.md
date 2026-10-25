# Local intent prototype: Ultima VII and StarCraft

The current shared short-follow-up iteration is documented in
[`FOLLOWUPS.md`](FOLLOWUPS.md), including the verified SCHNAIL download and
Ultima VII location/stats exchanges, complete failure counts and source limits.
The original `RESULTS.md` describes the first v1 experiment.
[`CONSULTATION.md`](CONSULTATION.md) describes conditional recommendations from
reviewed criteria, such as choosing a native Remastered option and then asking
for its download link, plus corresponding Ultima VII party-role advice.

This isolated browser lab tests a small learned intent classifier before any
production integration. Open `index.html` through a loopback HTTP server. Select
either guide and compare the original message's source-backed reply with the
reply after the proposed interpretation. The published guides and their active
model profile do not import this experiment.

The model is the frozen `Xenova/all-MiniLM-L6-v2` encoder, pinned to revision
`751bff37182d3f1213fa05d7196b954e230abad9`, with verified q8 ONNX weights. A small
regularized linear softmax head is fitted in JavaScript from 180 labelled v2
examples. Its rejection thresholds use 72 separate validation examples. There
is no SetFit/encoder fine-tuning, generative answering, Python training package,
or package installation. Scores are uncalibrated, and an empirical validation
threshold does not guarantee correctness on new questions.

## Local preparation

The owner approved this specific model download on 24 October 2026. Reuse of the
same pinned approved assets does not require a different model or runtime.
New models or package installations need separate owner approval.

```sh
python3 guides/tests/assistant/intent-prototype/prepare-assets.py --download --node /path/to/existing/node
python3 -m http.server 8769 --bind 127.0.0.1
```

Open `http://127.0.0.1:8769/guides/tests/assistant/intent-prototype/`. Preparing
reads 23,916,680 bytes of model/tokenizer files plus 22,528,676 bytes from the
already available pinned Transformers.js 3.8.1 runtime. The download command
fetches only the six pinned model files from Hugging Face, validates their
published Git-blob SHA-1 or LFS SHA-256 and exact lengths, and writes ignored
`assets/`. Without `--download`, it verifies existing files and rebuilds the
Ultima VII record snapshot without network access.

At inference time the worker accepts loopback origins only, rejects redirects,
checks local file SHA-256/lengths, disables remote models and uses CPU WASM with
one thread. No question is sent to a remote inference service. Generated model
assets and raw browser reports/screenshots are ignored by Git; neither belongs
in a guide FTP release.

## What each layer does

- The encoder and trained head predict one of twelve requested intents.
- The interpreter resolves names only against source records visible at the
  full-answer source ceiling. It keeps bounded subject/pending-confirmation state,
  directly handles spacing variants, and confirms uncertain spellings.
- Identifying a subject is separate from permission to answer or rewrite. An
  unsupported follow-up may retain a clearly grounded subject. It cannot supply
  a new fact or infer saved progress.
- Canonical replay is deliberately restricted to simple lossless request shapes.
  Restrictions, quantities, negation, editions, guide-only wording, causal claims,
  multipart requests, comparisons and uncertain paraphrases retain the original
  message. More expressive structured engine integration is future work.
- Lookup replies pass through the existing guide engine. Consultation replies
  use its source authorization on exact catalog witnesses and an explicit,
  conditional decision policy. Chat never writes the
  guide's saved checklist/progress storage. Reset and guide changes invalidate
  pending inference before any engine replay or rendering. Public chat always
  requests full answers (`direct`), with no Help selector or `setHelp` API.
  Explicit lower-tier evaluation cases exercise internal source authorization
  only; they do not represent a visitor-selectable chat mode.

Ultima VII uses the current trusted Node fixture loader and guide adapter to
export 729 records, with source hashes. StarCraft builds its records directly
from the current guide HTML and overlay in an inert DOM. No game facts are
invented for the prototype.

## Evaluation boundaries

`cases/` separates fitting data, threshold selection and frozen evaluation.
The original v1 set has 48 independent questions plus six conversations / 47 turns;
the separate follow-up set has ten conversations / 65 turns with known regressions
marked separately. The source audit,
taxonomy and hashes are in `corpus-review.md`. Expected labels/entities never
drive state transitions or feed classifier fitting. Actual control inputs are
separate `options`/`action` fields. The evaluation language is newly authored
against these guides; this is not blind organic-user accuracy.

```sh
/path/to/existing/node --test guides/tests/assistant/intent-prototype/*.test.mjs
python3 guides/tests/assistant/intent-prototype/run-browser.py --tag current
```

The first command checks numerical training and structural dialogue behavior
with explicitly synthetic/fake predictions. The browser command runs the actual
MiniLM worker, trains the head, evaluates the frozen examples, exercises the lab
controls and records network/storage/source boundaries. It preserves errors and
abstentions rather than making success assertions about model accuracy. Results
are in ignored `results/<tag>.json`; use a new tag to preserve prior reports.

Raw-parser agreement is mapped into the prototype taxonomy for comparison. It
does not measure the full existing assistant, whose exact aliases, narrative
indexes, subject resolution and source policy can answer despite a parser-label
mismatch. Correct intent/entity labels likewise do not prove a correct factual
answer. Full answer quality requires a separate source-based review.


## Always-full public chat, 24 October 2026

The owner removed the Help selector. Public `ask` always requests direct answers
and does not expose help-level options or `setHelp`. Typed level-change requests
cannot downgrade source detail. Reset/game changes continue to invalidate pending
inference. The explicit lower-tier evaluation cases remain internal source-policy
fixtures; no visitor control selects them.

The stable-source `always-full-complete-20261024` run passes 17/17 actual-model
control checks, 23/23 authored consultations, the five core UI sends and the
conditional Remastered recommendation → map links exchange. Unit contracts pass
53/53. Sanitized proof is `evidence/always-full-summary.json`. General behavior
limits remain unchanged: 40/48 independent intent labels and 25/65 complete
follow-up checks. This experiment remains separate from the six production UIs.


## Shared guide rollout, later on 24 October 2026

The six local production guide integrations now use the shared conversation
modules in `guides/js/assistant/`. This lab remains the two-game comparison and
historical evaluation surface; its new navigation links open the real chats in
all six guides. The production encoder/head reuse this experiment's unchanged
approved assets and fitting splits. See `docs/game-assistant.md` and
`guides/tests/assistant/evidence/rollout-final-acceptance.json` for the new
all-game UI, actual-MiniLM acceptance, source limits and local-only status.
