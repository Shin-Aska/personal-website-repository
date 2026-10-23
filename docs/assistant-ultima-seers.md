# Ultima V and VI local counsel migration

Both Seers now use the shared browser engine. Lazy-load delivery is guarded by the original query, input revision, and UI revision; a closed/reopened modal, replaced input, or navigation round-trip cancels the pending send. UI transitions clear stale reference and action slots while preserving bounded history. The classic scripts pass their actual lexical data and progress readers into separate native-module adapters. There is no model, inference service, question-bearing request, remote fallback, dependency installation, or build requirement. Existing atlas navigation and guide checkboxes retain their original handlers and storage formats.

## Canonical content and coverage

`guides/js/assistant/adapters/ultima6.js` extracts 598 short relationship records from existing `gameData` and `BRITANNIA_MAP_CONFIG`. Its 289 selectable contexts comprise 19 Grand Quest sections, four act overviews, six side quests, 254 unique named atlas markers/NPCs, and six atlas layers. Eight repeated landmark/NPC names resolve to the first atlas record, matching `findBritanniaDestination`. Companion and dungeon records share their matching marker identity instead of producing spurious ambiguity.

`guides/js/assistant/adapters/ultima5.js` extracts 169 records from `ultima5GrandQuestChapters`, `ultima5SideQuests`, `companionData`, `spellData`, and the atlas markers. Coverage includes 20 campaign objectives, 11 side quests, selected item acquisition/location/use facts, companion locations and descriptions, spell effects, and atlas coordinates. Free-text questions require the matching relationship: a companion location does not answer how to recruit that companion. Unsupported relationships, editions, or names are clarified or declined.

The small JSON overlays contain separately authored Gentle hints and safe labels; complete walkthrough prose remains owned by the existing guide objects. Balanced uses existing summaries, Direct uses existing steps. Source metadata records the original file/object locator and `extracted` review status. Authored Gentle hints have overlay provenance; these are not independently verified game facts. No checklist order has been converted into a prerequisite; these adapters deliberately use `requires:null`. Generic prerequisites, arbitrary route optimization, bug diagnosis, and unsupported creative requests remain outside this migration's knowledge coverage.

### Former prompt migration

| Former source | Canonical replacement or disposition |
| --- | --- |
| U6 `requestGeminiText` / `callGeminiAPI` | Removed completely, including POST payload and response parsing. |
| U6 `askTheSeer` campaign synopsis | Existing quest/section objects own these facts; no duplicate synopsis is indexed. |
| U6 tone/spoiler prompt instructions | Shared policy, authored persona wrappers, and a visible Gentle/Balanced/Direct control. |
| U6 active quest/side/marker/layer prompt context | Stable context identities with authored policy variants and source locators. |
| U6 raw General Hints and context summaries | Replaced by the same policy ceiling as chat; header, summary, coordinates and reopened history are filtered. |
| U6 Chronicle creative prompt | Replaced by eight authored virtue passages; at most three are composed, explicitly labeled roleplaying fiction. Same selection yields the same result. |
| U5 `callGeminiAPI` / `askTheSeer` instruction prompt | Removed completely. Existing structured Grand Quest, side quest, spell, companion and atlas records own covered facts. |
| U5 broad manual command list and miscellaneous old prompt tips | Not imported as an unreviewed general-purpose answer dump. The bounded Seer declines these unsupported relationships; the ordinary guide reference remains available. |
| U5 AN SANCT and cache refresh claims | Excluded from confident assistant advice because the existing guide contradicts itself. |

AN SANCT is described as unlocking in one source and damage reduction in another. Skull Key cache text disagrees between immediate re-entry and a later day; the Seer retains the initial cache acquisition while omitting refresh claims. AN TYM's reagent lists also disagree; spell recipes are excluded, while supported effects and circles remain. No hard rule is derived from any of these conflicting claims.

## Identity and progress mapping

| Existing source | Assistant identity / fact |
| --- | --- |
| U6 act slug + section slug | `ultima6:quest:<act-slug>:<section-slug>`; historical `ultima6:completed:<act-slug>:<section-slug>` |
| U6 side title slug | `ultima6:side-quest:<slug>`; historical `ultima6:side-completed:<slug>` |
| U6 named marker | `ultima6:atlas:marker:<exact-name>` |
| U6 map layer | `ultima6:atlas:level:<id>` |
| U5 Grand Quest objective ID | `ultima5:objective:<id>`; historical `ultima5:completed:<id>` |
| U5 side quest ID | `ultima5:side:<id>`; historical `ultima5:side-completed:<id>` |
| U5 field kit data attribute | historical `ultima5:kit-reported:<data-u5-supply>` |
| Named equipment | separate session-only `ultima5:possesses:<slug>` or `ultima6:possesses:<slug>` |
| Named companion | separate session-only `ultima5:party:<slug>` or `ultima6:party:<slug>` |

The adapters only read checked entries. Unknown, unchecked, malformed or absent values produce no positive fact. U6 reads the existing `questProgress` and `sideQuestProgress` sets, filtered against known objectives. U5 reads the existing `ultima5-campaign-progress-v2`, `ultima5-sidequest-progress-v1`, and `ultima5-field-kit-v2` readers. Grand Quest objectives with several legacy references count as a historical completion only when all those explicit references are checked. This is a completion mapping, not a prerequisite inference.

No assistant code writes these keys. Item checks do not prove current possession; a planned or previously recruited companion does not prove current party membership. Chat corrections remain in the shared session overlay. The original explicit checkbox controls remain the way to synchronize saved progress.

## Browser validation

`guides/tests/assistant/ultima-seers-browser.py` uses the already installed Playwright and `/usr/bin/google-chrome`. A static checkout server must run at `127.0.0.1:8766`; set `ASSISTANT_BASE_URL` to override it. No dependency is installed by the runner. Forbidden proxy, provider, model and generative routes are blocked before either guide is navigated; every attempted request, including blocked/failed requests, is captured in a sanitized log without bodies.

Retained evidence lives in `guides/tests/assistant/ultima-seers-results/`: acceptance checks, static request log, and screenshots. The script exercises all four U6 opener paths, General Hints, chat, lowering and reopening spoiler history, unsafe text, U5 corrections, Chronicle, offline repetitions, missing-overlay failure paths, six delayed-overlay stale-send cases, explicit UI transition invalidation, static-query auditing, existing guide progress/atlas callbacks, and before/after localStorage equality. All 44 checks pass in the retained run; the only failed requests are the four intentionally aborted overlay loads used to test error handling. The original dead U6 `styles.css` link was removed after the browser identified it; actual stylesheet links are unchanged except their cache versions.

Native-engine checks cover all 289 U6 Gentle contexts. The retained JSON fixtures add 35 question cases (32 distinct prompts) and three multi-turn dialogues (43 turns/checks), with development/holdout labels and expected decisions, snippets, forbidden details, and state changes. These are repository-derived regressions, not an independently adjudicated measure of arbitrary natural-language coverage. The broader shared harness owns the combined release metrics.

On the measured Linux host using Chrome 155.0.8059.84, the retained run reports all browser gates passed, zero inference attempts, and zero assistant saved-progress writes. `acceptance.json` records exact per-run timing and heap observations. U6's measured warm p95 is approximately 1–2 ms; two-frame painted reply p95 is approximately 34 ms for both games. U6 adds approximately 1.15 MB retained heap after explicit garbage collection compared with the loaded guide before the Seer opens. Initial U6 extraction and index preparation take 17 ms in the retained run (13 ms extraction, 4 ms indexing). U5 total heap is reported separately; it is not an incremental heap measurement. The report also records initial adapter extraction/index preparation, CPU, and existing progress/atlas callback checks. Other browsers/devices remain unmeasured here.
