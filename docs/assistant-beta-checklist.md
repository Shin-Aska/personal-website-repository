# Guide assistant beta checkpoint and next-agent checklist

Publication update: the owner later requested committing the remaining tests and uploading the beta. Signed archive `3c78aa0` preserves all120 historical reports; the beta runtime is published under `/guides`. Read [the25 October release record](assistant-release-20261025.md). The broader goal stays paused; original checkpoint records retain their historical scope/status.

Owner decision, 25 October 2026: wind down to an acceptable beta, preserve the broader goal for a later AI agent, and commit the relevant work. This is a local beta candidate. A Git commit does not upload, push or publish it.

## Scope and stopping rule

Freeze the current shared chat implementation across Ultima V, Ultima VI, Ultima VII, StarCraft/BWAPI, Al-Qadim and Albion. Full answers are the default, without a hint-level selector. The beta includes shared intent and topic handling, reviewed structured knowledge, source citations, and the roomier scrolling chat UI. It uses the already approved pinned models.

Finish verification, record known limitations, preserve reproducible tests and evidence, and commit. Stop feature expansion at this checkpoint. Supported questions that the current router declines are known beta defects, not a reason to restart an unlimited trivia campaign. A wrong source claim, a broken chat surface, lost saved progress, an unexpected remote request or a corrupt required asset is a release blocker.

The broader goal is **deferred and incomplete**, not declared achieved:

> Develop structured knowledge across all six games, with game-focused agents, so the bot can handle extensive, useful conversations.

The next agent should continue from the frozen beta and the backlog below, rather than repeat model experiments or discard failing cases.

## Beta acceptance checklist

- [x] Shared production conversation factory and knowledge integration serve all six games; Al-Qadim has two covered panels.
- [x] Full answers are always selected; no Nudge/Hint/Full answer selector or help-level badge is presented.
- [x] Final recursive Node suite passes2,125/2,125; Python source/embedding checks pass11/11.
- [x] Final native established corpus is920/1,005, with all216 unsupported-question controls held and every whole reply unchanged from checkpoint13.
- [x] The other observed220 turns retain208 passes, all53 unsupported controls, and complete whole-row equality with checkpoint13.
- [x] Final source-first96 remains72 strict passes, all24 unsupported controls held; independent whole-claim review finds51/72 useful supported answers, including2 still awkwardly presented under clarification.
- [x] The final red-lens reply displays and cites both required original passages. The first incomplete reply and its review remain preserved.
- [x] All674 fact documents and vectors, frozen model/profile/head files and original conversation oracles are unchanged from the preceding checkpoint. No model upgrades, downloads, fitting or installations occurred in this pass.
- [x] All841 offline file hashes/sizes and the version match; the final native runs report no external requests, saved-game writes or page errors.
- [x] Final UI smoke passes63/63 observations:42 base layout checks across seven surfaces/six viewports,14 desktop/phone expansion checks and7 parent-panel close/reopen checks. No page errors, external requests or saved-progress changes. The separate semantic smoke is preserved at5/13; its failures are documented below.
- [x] Existing packaged assets pass `setup.py --verify-only`: no writes or downloads. Setup unit checks pass12/12.
- [x] Review staged files for secrets, unrelated changes, ignored downloads/caches and required runtime dependencies; commit the beta checkpoint. The clean staged export passes2,125/2,125 checks without ignored files. High-confidence secret review is recorded in the beta evidence. The local commit is identified by `feat: freeze six-game guide assistant beta`; publishing remains separate.
- [ ] Owner beta trial: use real gameplay conversations and report the exact question, previous messages, game, edition and visible source. This is intentionally left for the tester.

The native conversation harness uses real pinned MiniLM classification and query encoding, with the existing generative-worker fixture. It does **not** establish native generative-model performance, low-end-device speed, every possible game question, or public deployment status.

## Current evidence

Start with `guides/tests/assistant/evidence/beta-checkpoint-20261025.json` for the bounded beta decision and tracked evidence. Detailed implementation and measured results are in `docs/assistant-knowledge/argument-bindings-20261025.md` and `guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-14.json`. Earlier reports describe their own historical states and must not override this checkpoint.

| Measurement | Frozen result | Interpretation |
| --- | --- | --- |
| Recursive contracts |2,125/2,125| Implementation checks; not answer coverage |
| Full native conversations |920/1,005|85 strict failures; manual review identifies24 genuine response gaps,49 useful-answer oracle differences and12 justified declines |
| Additional observed conversations |208/220|No changed whole replies from checkpoint13 |
| Harder source-first supported questions |51/72 useful|49 direct,2 under clarification;21 unanswered despite available source proof |
| Unsupported controls in the96-turn set |24/24 held|No unsupported property substituted with an available unrelated fact |
| Exact cached replay |798/851|No missing/incomplete inputs; requires an ignored local query cache to rerun |
| Current UI geometry/lifecycle smoke |63/63|Seven surfaces, including narrow and short viewports, scroll/composer, expansion and close/reopen |
| Separate full-answer semantic smoke |5/13|Not a passed acceptance suite: one equivalent source-locator mismatch, six answer limitations and one downstream coverage failure |

The sets overlap and have already been used for development. Do not add their counts or call them unseen generalization measurements. There are known gaps in all six games; do not claim a fully knowledgeable game expert.

`beta-chat-layout-assessment-20261025.json` preserves every failed semantic-smoke row and its original oracle. The real limitations are Ultima V phase selection, source-present declines in Ultima VI/Ultima VII/StarCraft, and two Al-Qadim “smaller hint” clarifications. These do not demonstrate a layout failure: the separate geometry-only run covers all seven surfaces. They remain beta answer defects for the next agent, beyond the21 misses counted in the particular source-first set. Never present5/13 as a green run or silently adjust its expected answers.

The commit keeps the required fixtures, final reports, whole-source reviews and their reference chain. Superseded duplicate browser runs and intermediate dumps remain untouched locally rather than enter the beta commit. `beta-evidence-scope-20261025.json` records that selection and any older references that require the original local checkout. The latest exact replay and earlier English/original regression results have byte-identical tracked copies, so the active beta evidence does not depend on ignored result files. Two existing384-dimensional query vectors were promoted into `fixtures/starcraft-query-vectors.json` for the one regression test that previously read an ignored cache; no vectors were generated or changed.

## Deferred work for the next AI agent

Before changing code:

- [ ] Read this checklist, the latest beta/runtime checkpoints and the three `knowledge-source-first96-arguments-review-*` pair reviews plus the final closure review.
- [ ] Obtain owner authorization to resume the broad goal; beta feedback and source-backed corrections can form a smaller follow-up task.
- [ ] Preserve all fixed conversation oracles, original source text, mandatory whole supporting passages, qualifiers, edition/material/quantity checks, and transactional conversation state.
- [ ] Reuse the current model assets only. No installations, downloads, replacement models, model/head training, setup rebuilds or profile edits without new owner authorization.
- [ ] Keep saved progress read-only, respect consent, and do not read Codex session logs. Do not deploy or push without explicit authorization.

Prioritize shared logic, not one regex or alias for each failing question:

- [ ] Consume parser `subjectMode: topic` deliberately so compound nominal fields keep the task owner while an object/person is discussed.
- [ ] Preserve topic, participant, object and directed roles independently through corrections and follow-ups. Teacher, seller, recipient and repairer are different roles.
- [ ] Match procedure phase and explicit conditions: before/after, assembly/use, completion/approach, and documented alternatives.
- [ ] Resolve party replacement/class and property references from actual reviewed source proof; do not infer a class or capability from a name.
- [ ] Improve the2 complete claims currently rendered under clarification, without weakening uncertainty handling.
- [ ] Review the24 genuine full-corpus gaps separately; they are not identical to the21 source-first misses below.

The21 supported unanswered questions are preserved verbatim in the final source-first adjudication. Their task groups are:

| Game | Known source-first gaps |
| --- | --- |
| Ultima V (7) |Sceptre pit/trapdoor crossing; Shard timing after Faulinei's name; starting companions/healing; Julia recruitment after replacement intent; six-person roster and later mage replacement; shrine word/duration; corrected Humility completion bonus |
| Ultima VI (4) |Balloon plans/assembly and burner items; corrected Morchella location/trade; Bonn movement versus trade and hidden fragment; blue human lens maker/materials/dialogue |
| Ultima VII (3) |Crystal price and subsequent recipient; errand reward field; Unlock Magic versus ordinary keys |
| StarCraft (2) |AUTO_RESTART cross-game limitation; README maintenance date and toolchain qualification |
| Al-Qadim (3) |Old Dungeon first-room key; timed running hazards; cyclops escort identity/destination |
| Albion (2) |Two documented Toronto approaches; final-trip technician recommendation |

For each repair:

- [ ] Reproduce the full ordered conversation, not just its last question in isolation.
- [ ] Read the complete original source child and surrounding source object; preserve every required caveat and support fact.
- [ ] Verify the useful claim and actual citation, including deliberately unsupported siblings and wrong-role controls.
- [ ] Run the affected checks once, then the relevant frozen conversation set. Broaden only for changed shared paths or unresolved failures.
- [ ] Preserve earlier failed reports, use a new output tag, and describe changed whole replies. A higher substring score alone does not prove a better answer.

## Reproduction without installs or downloads

Use the existing Node binary or `node` on another prepared machine. From the repository root:

```bash
assistant_node=/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
# The frozen beta also passes this suite from a clean Git-index export.
mapfile -t assistant_tests < <(rg --files guides/tests/assistant -g '*.test.mjs')
"$assistant_node" --test "${assistant_tests[@]}"
python3 -m unittest discover -s guides/tests/assistant -p 'test_knowledge*.py'
python3 guides/local-assistant/setup.py --verify-only
```

Existing Python Playwright and `/usr/bin/google-chrome` are required for native browser checks. The harnesses own isolated random-loopback servers; do not use or change the owner's preview server or browser tabs. Choose a new tag every time; the tools refuse to overwrite evidence.

```bash
python3 guides/tests/assistant/knowledge-browser.py --tag next-beta-review
python3 guides/tests/assistant/knowledge-blind-browser.py \
  --tag source-first-next-beta-review \
  --cases guides/tests/assistant/knowledge-source-first-96-20261025.json
python3 guides/tests/assistant/full-answer-browser.py --tag next-beta-ui
```

The known failing conversation checks can return a nonzero exit code at this frozen beta. Compare the documented baseline and whole answers; do not rewrite expectations to make them green. Model downloads and experimental reader/head fitting are outside this handoff. Cached replay inputs, browser screenshots, local experimental model downloads and scratch files remain local; the tracked beta evidence records their results and limitations.
