# SmolLM2 conversational fallback trial — 23 October 2026

**Result: fast enough to experiment with on this desktop, but not accepted as a
live factual fallback.** Supplying recent chat and relevant excerpts, including
the owner's explicit ban on unstated appearance details, did not make this
135M-parameter model reliably follow the guide evidence. Production assistants
were not changed.

**Latest follow-up:** the owner-approved enforced-frame experiment below passes
its limited output contract. The model can select conversational wording from
an authored set; game facts remain program-quoted. This does not rehabilitate
free-form factual generation or approve production integration.

## What was tested

SmolLM2-135M-Instruct, pinned q8 ONNX, Transformers.js 3.8.1, one-thread CPU
WebAssembly in existing Chrome on this Linux host. Assets total 161.8 MB; this
was an owner-approved isolated download, with no system/package installation.
Replies were capped at one or two short sentences by instruction, with an actual
60-token generation limit in the paired conversational/strict comparison.

The model received up to four recent visible messages and three authorized
guide excerpts. Actual prompts were 202–344 input tokens for the strict run,
comfortably below the 1,536-token trial limit. The prompt was created with the
model's own chat template. Model outputs were independent generations, not
silently appended to production conversation history.

There were three calibration cases and 26 fixed evaluation cases across all six
guides. One evaluation case was a diagnostic control where the existing engine
already answered; the other 25 were declined or clarified by the engine. Seeds
and source text came from the current guide adapters, including StarCraft's live
DOM. Questions, expected behavior, baseline engine replies, actual prompts,
source provenance and raw generations are retained.

Three calibration formats were tried: JSON context, plain-text context and actual
chat turns. The JSON prompt caused repetition/context copying. The shorter
formats responded more naturally but invented facts. The owner then explicitly
approved a fourth, stricter prompt that prohibited unstated eye colour, clothing,
personality, places and reasons, and required acknowledging missing information.
All 29 cases were run with that instruction. The evaluation questions were
already seen when designing that variant; this is not independent blind testing.

## Source-based manual review

These are the implementing assistant's reviewed counts against the supplied
passages, not an independent accuracy or hallucination-rate estimate. Definitions
and a note for every paired reply are in `evidence/source-review.json`.

| Outcome on the same 26 evaluation questions | Conversational prompt | Stricter prompt |
| --- | ---: | ---: |
| Useful response without unsupported claims | 1 | 2 |
| Echo, evasion, irrelevant clarification or missing required quotation/citation | 7 | 12 |
| Unsupported claim, invented cause, contradiction or false source-coverage assertion | 18 | 12 |

The strict prompt reduced unsupported content in this set, but much of that
change became nonanswers. Neither variant emitted a `[G1]`-style source citation
in any of the 26 evaluation outputs. A semantically supported paraphrase still
fails the owner's exact-quotation/citation requirement. A refusal or a statement
that no relevant information is supplied does not need an invented citation.

Examples from the actual raw generations:

- **Ariana / “Why is she cute?”** The plain prompt invented blue eyes; the
  conversational prompt invented a cotton dress. The strict prompt avoided
  those additions but answered “Why is she cute? The answer to this question will
  be related to the information provided in the guide notes.” This is an
  unhelpful nonanswer, not a successful grounded explanation.
- **Dreamshield / rephrasing.** The conversational prompt invented cyberattack
  sensors and digital barriers. The strict prompt merely acknowledged the
  supposed summary instead of giving one.
- **Ship Orb / mechanism.** With only the orb's navigation/restoration function
  supplied, the conversational prompt invented electric motors and diesel
  engines; the strict prompt said it was powered by its own engines.
- **Unsupported Mars seller.** The conversational prompt recommended buying the
  shield on Mars. The strict prompt produced a made-up “Mars Air” spacecraft
  mission with a crew of six.
- **Lowered help / missing source.** The strict prompt correctly acknowledged
  that the notes supplied no information on Ariana's requested trait. It also
  acknowledged missing action context after a topic reset. Those were its two
  useful-safe evaluation responses.

The raw outputs remain labelled **experimental and unverified** in the local
trial viewer. They were not put into the live guides and were not replaced with
safe templates to inflate the model's measured success.

## Timing

Measured inside the model worker, including tokenization and prefill for each
request. “First text” is the first nonblank decoded text callback, not a physical
display/paint measurement. p95 uses the sorted sample at `floor(n * .95)`.
Generation timings exclude initial download and model loading.

| Metric, 26 evaluation replies | Conversational prompt | Stricter prompt |
| --- | ---: | ---: |
| First text, median | 0.87 s | 1.46 s |
| First text, p95 | 1.17 s | 1.88 s |
| Complete reply, median | 1.98 s | 2.48 s |
| Complete reply, p95 | 3.16 s | 4.29 s |
| Replies reaching the 60-token cap | 6 | 5 |

Reported model preparation was 0.86–0.89 s on loopback, after the worker module
was available. This excludes real visitor download time, is not a cold WAN-load
claim, and establishes no speed guarantee for phones or other browsers/hardware.
Longer strict instructions increased prefill time in this run.

## Technical checks and retained evidence

Every completed run blocked external requests, used only local static GETs,
produced the same deterministic reply with networking disconnected, left saved
storage byte-identical, and kept production assistant/overlay hashes unchanged.
No page errors were recorded. The context builder's ten unit tests cover source
selection, current versus stale topics, low-help history/source filtering, missing
and conflicting sources, bounded history, reserved chat delimiters, the stricter
instruction and the limits of mechanical quotation checks.

`evidence/structured-calibration-report.json`, `plain-calibration-report.json`
and `chat-calibration-report.json` retain the exploratory runs.
`evidence/chat-evaluation-report.json` and `strict-all-report.json` retain the
paired evaluation and exact effective prompts. Per-answer JSONL files are flushed
as replies complete. `cases.json`, `case-definitions.json` and the report hashes
make the question/source packet inspectable. Screenshots retain the labelled
trial interface. Quotation/citation diagnostics always state that human
source-based review remains necessary; they are not a factual verifier.

Regression checks pass: 203/203 original, 1058/1058 English, 874/874 standalone,
10/10 pilot context checks and both page-fact checkers. The raw current website
passes 11/15 browser suites. The remaining four suites conflict with the separate
new offline-cache bootstrap, which changes static request interception and query
parameters. Those same four suites pass without changes under a read-only local
HTTP response transform omitting only the `offline.js` script from guide HTML.
No application file or old test expectation was edited. This isolates the
assistant tests; it does not establish that the current cache-plus-guide
integration is all green. Raw failures, isolated rerun logs and the exact
transform are at `/tmp/smollm2-fallback-checks`, with details in
`docs/assistant-handoff.md`.

The trial remains isolated for inspection or another owner-approved experiment;
it is not enabled in production.

## Explicit topic and fallback role (owner-approved follow-up, 23 October)

The owner approved another isolated variant: the program supplies the current
topic and tells the model that the main engine could not answer. The strict
evidence instructions remain. Topic labels and excerpts are reauthorized at the
current help level. A single explicitly named subject replaces older context;
recognized pronoun/elliptical follow-ups can retain it across an engine decline.
Older unrelated chat is omitted. Hidden exchanges, reset and unresolved new
subjects clear the candidate topic; generated model text never updates it.

When no clear sourced connection remains, the program returns "I don't have an
answer for that in this guide." without invoking the model. Existing engine
answers also bypass inference. This limited alias/pronoun/subject-pattern router
has an explicit weather-word exclusion and is not general language understanding.
It can reject connected questions: "Why are there three missiles?" lacks the
alias or pronoun connection required by this prototype. It may also miss novel
unrelated wording. No production behavior changed.

All 29 original cases and ten new topic-routing cases were run. The new cases
cover direct named switches, unknown names with a pronoun (including lowercase),
a newer failed subject, a recognized subject whose relationship was declined,
unrelated weather, two named subjects, unstated eyes, chained declines and an
unrelated intervening turn. These are targeted implementer regression cases,
not blind evaluation. The first run exposed routing false positives on ordinary
capitalized words and "I'm"; that raw run is preserved as `topic-initial-all-*`.
Those mistakes were fixed and tested before rerunning all 39 cases.

| Route on the original 26 evaluation questions | Count |
| --- | ---: |
| Model invoked | 17 |
| Fixed unknown reply, no inference | 8 |
| Existing engine answer, no inference | 1 |

Manual review of the **17 actual model replies** found **10 unsupported** and
**7 nonanswers/format failures**, with **zero useful-safe replies** under the
same definitions as before. None emitted a source citation. On exactly these
17 questions, the earlier strict variant had 7 unsupported and 10
nonanswer/format failures. This experiment changes routing, history selection
and instructions together; it does not isolate the effect of the topic label
or establish a general accuracy rate. Fixed unknown replies are not counted as
model successes. Across all 39 cases there were 23 model generations (14
unsupported, 9 nonanswers), 15 fixed unknown replies and one engine control.

Actual examples:

- With **Current topic: Ariana** and only her description, the model answered
  "Why is Arianna cute? Her short hair makes her look like a baby, which is
  adorable!" The cause and baby comparison are invented.
- With **Current topic: Iolo**, it invented "Iolani", Aesir lore, humor, bravery
  and musical skills across the two new named-switch cases. The supplied topic
  and source were correct; the generated facts were not.
- With **Current topic: Ship Orb**, it still invented engines, thrust and hull
  weight distribution. The passage only says the orb powers/restores the ship.
- For unstated eye colour it echoed the question. This avoids an invented
  colour but does not acknowledge the missing information.

Across the 23 actual generations, median first decoded text was **1.67 s**,
median completion **3.29 s**, p95 completion **4.69 s**, with five replies hitting
the 60-token cap. Prompts were 279–406 tokens. For the 17 original evaluation
generations specifically: first text median 1.79 s, completion median 3.29 s,
p95 completion 4.88 s. Model preparation was 0.92 s on loopback. Measurement
boundaries and desktop-only limitations above still apply; route replies have
null model timing and zero generated tokens.

Both topic runs passed local-only/offline/storage/production-source checks. The
final browser run additionally exercised a fixed reply before model loading and
repeated each present response kind offline. There were no external requests or
page errors. All **30 pilot unit checks** pass, alongside original **203/203**,
English **1058/1058**, standalone **874/874** and both page-fact checks. The core
standalone and pilot checks were run together: **904/904**. The fifteen live-guide
browser suites were not rerun for this isolated change; their earlier cache
integration failures above remain recorded, not claimed fixed.

Exact final prompts/results are in `evidence/topic-all-report.json`; manual
per-case review and the earlier output comparisons are in
`evidence/topic-source-review.json`. Earlier prompt reports remain intact. The
topic approach improves explicit context handling in the tested routing cases,
but **does not make this model acceptable as a live factual fallback**.

## Enforced missing-information replies (owner-approved implementation)

The owner clarified that this is a last-resort conversational aid and approved
implementing the guardrail. The new `guarded` variant retains the topic router
and existing engine answers. It selects a reason/detail/rephrase category by
program rules and gives the model three authored conversational sentences to
choose from. For example, the actual Ariana reply is:

> I can show you the relevant passage, but I don't have a sourced reason to add.
>
> Related guide text (may not answer your question):
> “Ariana: a cute little girl with short hair.” [G1]
>
> [G1] Source: existing guide; extracted. guides/js/Ultima6Atlas.js — marker:Ariana

That wording acknowledges the engine's limit without asserting that the whole
guide contains no answer. The complete exact authorized excerpt and citation
are assembled by the program. The model cannot write game facts or a new reason.
Progress requests receive a fixed capability reply without inference or writes.

First, the program validated freely generated wording against complete approved
sentences. All 26 model attempts were rejected; raw text remains in
`guarded-free-all-*`. This demonstrated working rejection, not useful model
wording. The final version also restricts generation to approved token sequences
using the already-downloaded runtime's logits processor. At each position, only
tokens that can finish one of the three approved sentences are available. The
model scores those branches; it has no open vocabulary for facts. Sentence
tokenization is checked to round-trip exactly. EOS is available only at a complete
sentence. A final complete-frame validator remains, rejects appended claims,
and rejects stale/missing context before showing any quote.

Both guarded runs used the **same 45 question/context packets**: the earlier 39
and six new cases for the explicit named Ariana question (with/without history),
blue eyes, requested invention, progress and an already-supported reason.

| Final route | Count |
| --- | ---: |
| Model selects approved conversational wording | 26 |
| Fixed unknown-topic reply | 15 |
| Fixed progress-capability reply | 2 |
| Existing supported engine answer | 2 |

All **26/26 constrained generations** matched an approved complete sentence;
the model selected seven distinct sentences across the three categories. All
displayed game text came from authorized exact quotes with program citations.
This is **contract compliance by construction**, not an accuracy score, improved
understanding or a general hallucination detector. The finite sentence menu is
narrow; a deterministic sentence would be faster and require no model. The
existing topic heuristic can still reject valid connections or accept an
unfamiliar unrelated request. Source accuracy and topic relevance are not proved
by the decoding restriction. Free-form factual generation remains unaccepted.

Across the 26 constrained selections on this desktop, first decoded text median
was **1.09 s**, completion median **1.84 s**, p95 completion **1.98 s**. Model
preparation was **0.96 s** on loopback; initial download is excluded. Prompts were
190–258 tokens; outputs were 9–20 tokens including EOS, with no truncated frame.
The generation cap is longest approved frame plus EOS for that category, rather
than the older 60-token cap. All other greedy/repetition settings and assets
were retained. These are decoded-text/worker timings, not mobile/paint promises.

The browser checked all 45 displayed replies against the frame/quote constructor,
verified no raw model chunks entered the primary reply, and kept raw output in
collapsed review details. It checked the unknown route before model loading,
repeated model/unknown/fixed/engine replies offline, recorded no external requests
or page errors, and verified unchanged saved storage and production hashes.
Runtime errors still fail this experiment visibly; production failure handling
and integration have not been built or approved.

All **59 pilot checks** pass: 30 context, 23 guarded-reply, six finite-token tests.
They include the exact Ariana exchanges, unsupported traits/causes, negation,
appended claims/false citations/markup, all 23 previous raw topic outputs,
private allowlist integrity, lower-help/reset/topic changes during generation,
research labels, supported reasons and progress capability. Core checks were
rerun: original **203/203**, English **1058/1058**, existing standalone **874/874**
(**933/933** together with the pilot), and both page-fact checks. The earlier
production-browser/cache integration failures remain recorded; those fifteen
suites were not rerun for these isolated pilot files.

Final actual prompts, tokens, raw selected sentences and displayed replies are
in `evidence/guarded-all-report.json`. `guarded-contract-review.json` contains
every displayed reply, routing, same-packet comparison and limitations;
`guarded-source-hashes.json` captures the tested pilot source files. The live
guides, saved-progress formats and previously retained evidence are unchanged.
