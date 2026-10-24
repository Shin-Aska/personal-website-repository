# StarCraft sustained conversation campaign

The authored corpus has 20 conversations and 161 visitor turns. The final engine replay over the live-DOM snapshot passes 161/161 turns: 116 factual answers and 45 clarification, refusal, conflict or reset checks. Passing factual replies cover 38 record IDs and 25 subject IDs. These IDs overlap claims and are not a count of independent facts.

The actual guide controls pass 163/163 replies, including the first two conversation turns offline. The strengthened shared browser runner checks semantic claims, actual assistant decisions, authorized subject/record/source identities, rendered provenance and hidden-history phrases. Saved local storage remains byte-identical; there are no external requests, page errors or non-static GET requests. This is the consent/worker fixture. The separate native-model campaign is owned by the native validation agent; this report does not claim native inference.

The corpus covers technical concepts, download and executable paths, installation and troubleshooting goals, procedures, sourced purpose/cause/authorship, pronouns, topic changes, resets, name spacing, all three help levels, guide-only research boundaries, source conflicts, unsupported editions/platforms and restriction continuity. Campaign-world lore, geographical travel, quests and plot spoilers do not exist in this technical guide; those dimensions use the applicable technical equivalents.

## Source-driven fixes

- Expanded the authored index for separate SCHNAIL installation, first-launch downloads, the exact Remastered SCM map name, common BWAI spacing/detection wording, example-bot listing and U Alberta Bot spacing.
- Indexed the existing Melee/Use Map Settings fact as bounded troubleshooting guidance; arbitrary DLL causes still decline.
- Added two narrow, source-explicit BWAI QA entries for single-player AI purpose and the unresolved compatibility-source question. Purpose no longer returns installation steps, and installation still returns its own steps at every help level.
- Let support links answer where to get help. The existing guide provides both support destinations.
- Retained authored-index metadata on the short variants as well as Direct, so a complete sourced question can start a new request after another intent.
- Marked compatibility-conflict provenance consistently at all help levels, preserving both guide locations instead of resolving their disagreement.

Shared engine and retrieval fixes were made by the parent agent for restriction carry and a contained shorter spacing match. No shared engine, language, runner or document edits were made by this subagent.

Eight dedicated regression tests and the existing three StarCraft narrative tests pass (11/11). They check switching setup/purpose in both directions, safe restrictions on source-explicit questions, support/list routing, Melee guidance, dual-location conflict provenance, portable-name spacing, a grounded first-launch pronoun and reset, and the source-compatibility QA both fresh and in context.

## Evidence and remaining limits

The immutable pre-campaign live-DOM source snapshot is `conversation-starcraft-source-records-before.json`; the final production snapshot is `conversation-starcraft-source-records.json`. The latter contains 54 records, including the two new indexes over unchanged guide statements. Expectations were authored from the guide/overlay and initial raw records before execution, never generated from assistant replies.

`conversation-starcraft-records-first.json` and `conversation-starcraft-browser-first.json` retain the original failures locally. `conversation-starcraft-expectation-corrections.json` records source-based wording and guessed-ID corrections. No expected factual answer was changed to a refusal. Exact failing restriction dialogues are retained locally in `conversation-starcraft-restriction-repros.json`. Intermediate record reports and the pre-campaign snapshot remain local debugging history, excluded from the release commit. Versioned final results are `conversation-starcraft-records.json`, `conversation-starcraft-browser.json` and `conversation-starcraft-coverage.json`.

The coverage JSON lists every unexercised record. BWAI's tips standalone and the map-link standalone are not separately asked in the sustained corpus; much of their content overlaps tested records, but difficulty-setting advice is not claimed as factual campaign coverage. The compatibility standalone is exercised as a refusal, so it has no passing factual answer. The guide's Steamhammer creator credit is tested only as what the guide says; its historical accuracy and linked repository have not been independently verified by this campaign. Unsupported current releases, guaranteed durations/safety/win rates, platforms, registry instructions and arbitrary crash causes remain unknown. This is a developed regression corpus, not a blind holdout or exhaustive technical knowledge audit.

Reproduction, with the checkout served on loopback port 8766 and no installs:

```sh
/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node guides/tests/assistant/conversation-starcraft-records.mjs guides/tests/assistant/evidence/conversation-starcraft-source-records.json guides/tests/assistant/evidence/conversation-starcraft-records.json
/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test guides/tests/assistant/conversation-starcraft-indexes.test.mjs guides/tests/assistant/narrative-expansion-starcraft.test.mjs
python3 guides/tests/assistant/conversation-campaign-browser.py --game starcraft
```

The record replay is a snapshot supplement; only the browser runner checks the current production DOM and guide controls. No installation, commit, push or publication was performed.
