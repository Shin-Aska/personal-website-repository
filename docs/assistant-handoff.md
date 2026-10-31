# Handoff: local guide assistants (for the next agent)

Repository: `/mnt/internal-hdd/Development/personal-website-repository`. Latest scope decision:25 October2026. **Start with `docs/assistant-beta-checklist.md` and `guides/tests/assistant/evidence/beta-checkpoint-20261025.json`.** The owner asked to wind down to a bounded beta, create a checklist for another AI agent, preserve the broader goal for later, and commit the relevant work. Feature expansion stops at this beta checkpoint. The broader structured-knowledge objective is deferred and incomplete; it has not passed broad runtime acceptance. Current measured implementation is checkpoint14. Sections below are historical evidence and do not override the beta scope, model freeze or later owner instructions. No FTP upload or Git push is authorized by the beta commit request.

## Current publication — 31 October 2026

The owner separately authorized FTP publication of the current assistant repairs. Eighteen runtime/catalog assets plus the production manifest and version marker are live under `/guides`; all twenty passed staged/final FTP checks and public HTTPS byte checks, followed by an independent twenty-path HTTPS check. Production version is `fb49c68640e66abf081c98f256aae4877def8585076c5e0d131f132555659dbe`. Its live-derived manifest retains all826 untouched entries, updates fifteen and adds three modules (844 total); checkout metadata remains separate at `b1b21e9d…`. Private backups of seventeen existing destinations remain outside Git. See [the release record](assistant-release-20261031.md), [deployment receipt](../guides/tests/assistant/evidence/deployment-20261031-01.json), and [independent public check](../guides/tests/assistant/evidence/independent-publication-https-20261031-01.json).

After publication, the owner authorized a local commit of the implementation, tests, evidence and release records, building on `51b3995`. No Git push was performed. The current checklist records final engineering verification and the still-unverified owner gameplay trial and exhaustive worker-network capture. Publication does not close those requirements. No models, profiles, original guide facts, saved progress, HTML/CSS or other site roots were changed by this deployment.

## Previous publication — 27 October 2026

The source-first metadata and router repairs are live: sixteen files under `/guides` (ten knowledge manifests/embeddings, four assistant scripts, then the reconciled production manifest and version marker), verified by FTP binary readback and public HTTPS (new live version `4ed7c470…`). See `docs/assistant-release-20261027.md` and the 27 October continuation log in `docs/assistant-beta-checklist.md`. No push.

## Previous publications — 25–26 October 2026

On 26 October, five files under `/guides` were published (source-first routing repairs, version `8a15df99…`; see `docs/assistant-release-20261026.md`). On 25 October, the frozen beta runtime `2ea2c53` (86 files, version `e0f2ef72…`) was published after the beta commit; see `docs/assistant-release-20261025.md`. Only `/guides` changed; default/Classic, credentials, tools/tests/docs and raw caches were excluded. No Git push.

## What this is

Six game-guide pages (Albion, Ultima V, Ultima VI, Ultima VII, Al-Qadim, StarCraft/BWAPI) have a chat assistant that runs entirely in the browser. The owner requested expanding the MiniLM intent and follow-up experiment into all six production guide integrations. A shared conversation wrapper now combines learned intent proposals, explicit subject memory, source-backed consultation and the existing factual engine. The earlier opt-in model still supplies constrained conversational wording for eligible descriptive follow-ups. Neither model generates game facts. There is no remote inference or network request carrying a question. Answers are stored guide text, overlay indexes over guide text, or clearly labeled, cited research notes. See the latest rollout section for verification and publication status.

## The owner's standing requirements (do not violate)

- English only. Accept natural phrasing and conversational follow-ups.
- Every factual answer must be grounded: guide text, an overlay index of guide text, or a labeled and cited research note (“Not in this guide — from outside research: …”). Never invent facts, prerequisites, comparisons, verdicts or explanations.
- Runs in the browser from an ordinary static HTTP server. No packages, models, dependency downloads or browser installs without asking first.
- Preserve local work; **do not reset**. Commits, pushes and deployment need
  explicit owner authorization. On 23 October the owner approved uploading the
  latest changes and committing the completed work, reserving both GitLab and
  GitHub pushes for themselves. Earlier no-commit boundaries below describe the
  historical runs. Publication and commit status are recorded below.
- Be candid about limits. The owner wants useful free-text interaction, not claims of unrestricted intelligence.
- Do not read the owner's Codex session logs (`~/.codex`); they asked that this not be done.
- Unrestricted neural-model factual generation remains rejected. On 23 October the owner explicitly approved integrating the constrained SmolLM2 fallback into all six guide pages, then approved first-visit consent, persistent off/enabled choices and settings. This supersedes the earlier trial-only boundary below. Reuse the approved pinned assets; obtain approval before downloading another model/runtime.
- Keep existing checklists, journals, atlases and saved-progress formats intact. Chat never writes saved progress.

## File map

| Path | Role |
| --- | --- |
| `guides/js/assistant/engine.js` | Pipeline: parse, then authorize at the spoiler ceiling, resolve the subject, relationship candidates, checks (method, edition, numbers, material terms), answer, compose multi-part replies, conversation state. Also counter/cure, comparisons, sell, stats, advice, “did you mean”. |
| `guides/js/assistant/guide-assistant.js`, `dialogue.js` | Production adapter factory and shared conversation wrapper. Intent proposals and relation fragments carry a sourced subject; original source-engine evidence, progress readers, choices and actions remain authoritative. |
| `guides/js/assistant/intent-runtime.js`, `intent-worker.js`, `intent-head.js` | Consent-gated MiniLM classifier, local verified assets, serialized CPU inference and per-turn cancellation. No factual generation. |
| `guides/js/assistant/source-responses.js`, `consultation.js`, `guides/data/assistant/consultation-catalog.json` | Reviewed source summaries/URLs and conditional guide-backed recommendations for all six games. |
| `guides/js/assistant/language.js` | `parse(text, {editions})`, `materialTerms`, `detectIntent`, `detectMethod`, `splitParts`. Ordered intent regexes, filler phrases (FRAMES/CUES), the SCAFFOLD word set, report/hypothetical detection, subject correction (“I meant X”), follow-ups. |
| `guides/js/assistant/retrieval.js` | Tokens and normalization, the entity resolver (exact aliases, then a conservative typo matcher), BM25 index, `similarity` (Jaro-Winkler), `distance` (Levenshtein). |
| `guides/js/assistant/topics.js` | `factMap`, `buildTopicRecords` (overlay topics = verbatim guide facts), `buildResearchRecords` (cited research). |
| `guides/js/assistant/policy.js` | Spoiler tiers gentle < balanced < direct; `authorize` copies only the allowed variant. |
| `guides/js/assistant/rules.js` | Three-valued requirement evaluation and session evidence (progress claims). |
| `guides/js/assistant/ui.js` | Shared view for every guide, rendering with `textContent` only: context line (“Asking about …”), New topic / Clear chat, the conversation, source locators and research citations. All chat requests and contexts use `direct`; there is no help selector or answer-level badge. |
| `guides/css/assistant.css` | Shared look, loaded by `ui.js`. Pages only set `--assistant-accent`, `--assistant-on-accent`, `--assistant-surface`, `--assistant-text` and `--assistant-muted`. |
| `guides/js/assistant/bootstrap.js`, `consent.js`, `guides/css/assistant-consent.css` | Shared first-visit consent, persistent preference, visibility gate and settings. |
| `guides/js/assistant/model-runtime.js`, `model-worker.js` | One consent-controlled CPU worker, verified local assets, shared cache and request cancellation. |
| `guides/js/assistant/model-download.js` | Streaming model transfer accounting, decimal MB counts and estimated speed text. |
| `guides/js/assistant/fallback-context.js`, `fallback-guard.js`, `frame-tokens.js` | Authorized context and finite conversational wording; no generated game facts. |
| `guides/local-assistant/profile.json`, `files/`, `prepare-assets.py` | One model/runtime configuration for all games, static parts, and a local-only packaging tool. |
| `guides/js/assistant/adapters/*.js` | Per-guide extraction from the page's own data and atlas files. |
| `guides/data/assistant/*.json` | Overlays: aliases, safe titles, gentle hints, `topics`, `research`, `qa`, `cheats`, `actors`, StarCraft DOM selectors. |
| `guides/js/{Albion,Ultima5,Ultima7,AlQadim}.js` | Bridges. Small additive edits pass extra data (trade hints, movements, atlas configs, markers). Edits to these tracked files are mixed with the owner's earlier uncommitted work; change them only additively. |
| `guides/tests/assistant/` | Tests (see below). |
| `docs/game-assistant.md` | Authoritative design, coverage tables, test counts and measured budgets. Update it with every behavior change. |

## Key design decisions and why

- **Material terms.** Any word that isn't filler, scaffold vocabulary, the subject's name or an edition must appear (by stem) in the authorized fact, or that part declines. This is the main grounding guard (“on Mars”, “for free”, “cheapest”). When you add vocabulary to SCAFFOLD, make sure it can never be a restriction. The Albion “guns” case was a bug for exactly this reason.
- **Relationship equivalences are explicit and few:**
  - Ultima VI equipment `explanation` answers `use` (adapter flag `answers`).
  - Counter/cure (`remedy`) accepts enemy combat records.
  - `stats` accepts item use records, but never for people.
  - Everything else needs an `answers` list on the record plus `source.index.review === 'authored-index'`. An invariant enforces this.
- **A subject's own name never chooses the relationship** (“How do I use Cure?”). The reread only happens when the subject doesn't support the detected relationship.
- **Spoilers:**
  - Records are authorized before indexing, matching and suggestion.
  - Lower-tier answers for every companion in a guide carry the same “notes appear at Direct” line, so none stands out (Ultima V, Albion).
  - The “not found” reply is identical whether the subject is hidden or absent (invariant).
  - The companion-name list used only to ignore the afflicted person's name in cure/advice questions is built from all tiers on purpose; it never matches or shows anything.
- **Multi-part messages.**
  - At most three parts. Without a “?”, a statement only splits before wh-words.
  - Each part keeps its own sources, and the composite takes the highest spoiler level.
  - Duplicate parts collapse, and unanswered parts quote the visitor's words.
- **Follow-ups.** “What about X?” and “Sorry, I meant X” reuse the previous relationships *and* their restrictions (frame `carry`). Pending choices keep restrictions too.
- **“Did you mean”.**
  - Candidates are proper names only, at least 0.88 Jaro-Winkler, with the same first letter, about 30% maximum edit distance, comparable length, and not a word the visible guide text uses.
  - A whole-name match answers explicitly as a guess; a partial match becomes a choice.
  - Typo-matcher corrections are announced the same way.
  - A guessed subject never feeds “I already did that”.
- **Research layer.** Guide records always win over research. Research answers get no tone wrapper (no “The guide records:”). Only claims tied to the right game on a reliable page were kept; forum-only and wrong-platform (SNES) claims were rejected.
- **Data quality filters:**
  - Albion atlas NPC profiles are unreliable (almost all “Terran/Pilot”), so only names and maps are used.
  - Al-Qadim atlas actors are mostly engine IDs, so only an allowlist in `alqadim.json` `actors` is used.
  - Ultima V's AN SANCT is withheld because its tip and spell table conflict.

## How to test (all must stay green)

Node (no install needed):

```sh
N=/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
$N guides/tests/assistant/run.mjs        # original regression: 203/203 (157 questions, 31 dialogues, 15 invariants)
$N guides/tests/assistant/english.mjs    # english + knowledge + owner + every sim-<game>-cases.json: 1058/1058 (967 questions, 64 dialogues of which 17 are browser-only, 21 invariants)
python3 guides/tests/assistant/measure-assets.py
```

`english.mjs` loads `english-cases.json`, `knowledge-cases.json`, `owner-cases.json` and every `sim-<game>-cases.json` automatically (so parallel sessions can each own a fixture file); `english-browser.py` loads the same files and runs the StarCraft dialogues against the live page (336/336 checks). `sim-ultima7-checks.mjs` and `sim-alqadim-page-facts.mjs` verify that overlay sentences quoted from the guide pages still exist on the pages: rerun them after editing `Ultima7.html` / `AlQadim.html`. Dialogues marked `browserOnly` (StarCraft, whose adapter reads the live DOM) run in `english-browser.py`. Invariants include full data coverage (`every-guide-entry-is-answerable`), topic answers equal guide facts verbatim, research labeling, identical hidden/absent replies, and no guessed names for common words.

Browser (existing Python Playwright and `/usr/bin/google-chrome`; installs nothing). Run from the repository root:

```sh
python3 -m http.server 8766 --bind 127.0.0.1   # background
python3 guides/tests/assistant/english-browser.py   # 318/318, blocks all non-loopback requests
# plus: albion-browser, starcraft-browser, ultima-seers-browser, genie-sage-variants-browser,
#       genie-sage-fixtures-browser, genie-sage-browser, genie-sage-state-browser
```

Gotchas:
- **Stopping the server:** `pkill -f "http.server 8766"` kills your own shell, because the pattern is in its command line. Instead write the PID to a file, `ps -eo pid,args | grep "[p]ython3 -m http.server 8766" | awk '{print $1}'`, and `kill` it in a separate command.
- **Generated outputs:** the runners overwrite `results.json`, `english-results.json`, `evidence/*`, `results/*` and `ultima-seers-results/*`. That's expected; keep `english-first-run.json` (historical first run).
- **Scratch probes:** a quick probe harness pattern is to import `load-records.mjs` (`allRecords`, `albion`, `u5`, `u6`, `u7`, `aq`), call `createAssistant({gameId, records})`, then `answer(text, {spoiler})`. Keep scratch scripts outside the repository.
- **Old test changes:** when a change alters an old test's expectation on purpose, add a `note` to the fixture and record it in the docs. Never silently weaken a negative case.

## Current state (all passing)

- Coverage: every character, monster, item, spell and quest/side quest in the guides' data is answerable by name. There are also 114 Albion and 122 Ultima V NPC records, 231 Ultima VII townspeople records (including 28 monster groups) and 29 Al-Qadim NPC records (the guide names 9 characters). Total records: Albion 379, Ultima V 485, Ultima VI 951, Ultima VII 676, Al-Qadim 282.
- Features: list (“what spells are there?”, with counts), overview (“everything about X”), and no-verdict replies (“is it worth it?” states the guide gives none, then the fact).
- Relationships: location, acquisition (buy/recruit/download/learn), use, stats, description, combat, counter/cure, prerequisites, hint, pros/cons (only from a guide's own comparison), where to sell (Albion trade only), and recruitment advice (Ultima V, Albion, Ultima VI and Ultima VII companions).
- Gzip size of engine plus one adapter is 56.4–63.4 KiB (final run of 21 Oct). **The 50 KiB budget (51,200 bytes) is exceeded by every guide.** **The owner accepted this (21 Oct 2026): it is a soft target, small next to the guides' videos and images.** Still prefer overlay JSON over engine code for new content.

## Typo benchmark

`node guides/tests/assistant/typo-benchmark.mjs` measures how well misspelt names are recovered (about 90% overall, 97–99% except a wrong first letter, 0.35% wrong subject, 0 ordinary words corrected, 0 hidden-name leaks). Run it before and after any change to `retrieval.js` (`closeSpelling`, `phoneticKey`, the multi-word fuzzy match) or to the suggestion code in `engine.js`, and keep the numbers from getting worse. Details and the stage-by-stage results are in `docs/game-assistant.md` (“Misspelt names: benchmark and improvements”).

## Story questions (Codex engine work, integrated)

Done and verified (21 Oct 2026): the story-record format, `buildStoryRecords`, the story-question reader and the engine behaviour are in the shared files; Codex stopped editing them and Claude re-ran every suite. Codex's standalone test files are `story-questions.test.mjs`, `story-engine.test.mjs`, `story-boundaries.test.mjs`, `story-ultima7.test.mjs`, `story-research.test.mjs` and `story-inamo.test.mjs` (run each with `node`; 187 cases) plus the browser script `story-inamo-browser.py` (real UI; needs a loopback server); the last one reads `story-ultima7-pending.json`, so do not move it. The format, behaviour and limits are in `docs/game-assistant.md` (“Story-question engine”). Ultima VII has eight story records in `ultima7.json` `stories` and 30 narrative records in `narratives`. All six guides now have narrative facets (see the expansion below). Two Ultima VII story roles are built from cited outside research ( `research` entry `trinsic-murders-killers` with `"storyOnly": true`, which the adapter keeps out of the standalone research records); new story facts need the same rules (existing subject, verbatim sources, one spoiler level per role, no inferred inverse). If two agents edit the shared engine files again, split ownership by file as was done here.

## Latest meaning and context correction (22 October 2026)

Codex handled this round independently at the owner's request; no messages or work were passed to Claude. Only `engine.js` changed in production. No adapter, overlay or shared fixture changes were needed.

`Who killed who?` now shows adjacent `Killers:` and `Victims:` lines per explicitly linked account, retaining the exact source text and research label/citations. Pairing requires both authorized roles to name their counterpart in context; it never infers an inverse, joins disconnected roles or assigns individual fatal blows. Separate killings remain separate blocks. A partially matched role retains its unmatched people as explicitly unpaired, and suspects never acquire killer labels.

The latest conversation subject overrides the selected page for implicit story/narrative requests; reset restores the page default. Explicit named questions and choice buttons still override implicit context. A recognized name becomes current even if its requested relationship is declined; an unrelated, ambiguous or hidden latest subject cannot restore the old murder. Source and material restrictions survive subjectless follow-ups.

New regressions are `story-meaning.test.mjs` (27), `narrative-context.test.mjs` (8) and `story-meaning-browser.py`. The browser exercises an unrelated quest panel, exact role meanings, latest topics after supported and unsupported questions, explicit events, reset, guide-only restrictions, offline answers, spoiler-history filtering and unchanged saved progress. The preexisting spoiler-choice test now resets its conversation before requesting a fresh event choice, intentionally matching the new context rule. Full standalone story/narrative total: 547. See `docs/game-assistant.md` (“Who killed whom: meaning and context correction”) for details.

Final checks pass: original 203/203, English 1052/1052, story/narrative 547/547, all 12 browser suites, both page-fact checkers, unchanged typo totals/negatives and no hidden-name leaks. The existing Genie/Sage suite passed unchanged on rerun after one timeout in its intentional static-load failure test. Local logs and the source-hash audit are at `/tmp/codex-who-killed-adp5c7fy`; UI evidence is under `guides/tests/assistant/evidence/story-meaning-*`.

## Narrative expansion to all games (22 October 2026)

Codex handled this with three Luna workers and independent source/meaning review; Claude was not contacted. All five remaining adapters/overlays now use the existing narrative framework: Albion 14, Ultima V 26, Ultima VI 22, Al-Qadim 21, StarCraft/BWAPI 8 (91 new facets). Ultima VII's 30 narrative facets and eight story roles remain unchanged. Node record totals are Albion 393, Ultima V 511, Ultima VI 973, Ultima VII 718 and Al-Qadim 303. The 2,777 preexisting non-story/non-narrative records are structurally unchanged.

Guide instructions are indexed as summaries/methods/explicit steps, not completed historical events. Outcome focus must name the cause/action/item, never its consequence. StarCraft covers technical setup, not campaign story. Legacy complete identity descriptions are retained where duplicate facets would suppress notes or stable IDs. No new outside research was added; unsupported motives/actors/actions/editions still decline.

Shared changes this round: `language.js` accepts `What is the method for/of …?`; `engine.js` uses the heading Method, validates after/then temporal anchors without requiring the literal word “after” in the source, rejects context-only reversed outcome matches and sequence-title fragments, and consumes a number inside an authorized exact subject name (Chapter 2) without discarding additional numeric restrictions. Latest conversation priority and source/spoiler restrictions remain covered. Remastered-specific StarCraft definitions carry their edition explicitly.

New tests: `narrative-expansion-{albion,ultima5,ultima6,alqadim,starcraft}.test.mjs`, `narrative-all-games.test.mjs`, shared new meaning fixture `narrative-all-games-cases.json`, `narrative-all-games-browser.py` (62 UI replies in six guides) and `narrative-expansion-starcraft-browser.py` (17 questions, live DOM). Run `node --test guides/tests/assistant/*test.mjs` for all 648 standalone checks. Both new browser scripts use the root loopback server and require no installs. They verify source meanings, offline replies, spoilers and unchanged progress; all 14 browser suites pass. The original and English suites remain 203/203 and 1052/1052; page-fact checkers print ok. Typo benchmark is byte-for-byte identical to the prior report (90.1% recovery, 0.37% wrong subject, no ordinary-word corrections or hidden-name leaks).

Full aspect table, limits and examples are in `game-assistant.md` under Narrative expansion across all six guides. Final logs/audit are at `/tmp/codex-all-guides-32bbypv5` (temporary); UI evidence is under `guides/tests/assistant/evidence/narrative-all-games-*`. Latest gzip estimates: engine+adapter 67.1–74.2 KiB; with overlay 77.6–87.9 KiB. No repository-history, deployment, installation or saved-progress actions were taken. Production files are frozen after this round; no worker is editing them.

## Walkthrough audit and robustness round (Claude, 22 October 2026)

At the owner's request Claude audited the assistant read-only, asked 92 questions written from outside walkthroughs, then (owner approved) fixed the shared engine. Only `engine.js`, `language.js` and `retrieval.js` changed; no overlay, adapter, guide page or existing fixture changed. Fixes: guide-only wording in any position (`Using only the guide, …`, `Per the guide, …`, `Guide only: …`, `… Use the guide only.`) now excludes research everywhere; a combined reply with a declined part carries the current spoiler level (closes a Gentle-history leak); `found` is a location only as a participle; `What does X give me?` needs a fact that says what is given; `code`/`codes`-style inflections of lowercase generic aliases are no longer announced as misspellings; topic-scoped declines name the topic; `Why?` after `Who killed whom?` offers every named victim's account; `Who has X?`, `X's Y`, `talk to`/`speak with` and `destroy`/`banish` wording; clearer method and non-relationship declines. Withdrawn because negative cases protect earlier owner decisions: a “where → how to get it” fallback (it revealed Direct-only places), trust answers (`Is Saduj trustworthy?`) and a soft `What happens if …?` reader.

New tests: `robustness.test.mjs` and `walkthrough.test.mjs` with `walkthrough-cases.json` (78 questions, verdicts `pass`/`fair-decline`/`gap`/`owner`; flip a `gap` with a note when it starts answering). `node --test guides/tests/assistant/*test.mjs` is now **840/840** (including the closest-text tests); original 203/203, English 1052/1052, all 14 browser suites and both page-fact checkers pass. Details, before/after table and remaining gaps: `docs/game-assistant.md` “Walkthrough audit and robustness round”. Note: the four `genie-sage-*-browser.py` scripts hard-code port 8766 and ignore `ASSISTANT_BASE_URL`.

## Help levels and one shared layout (Claude, 23 October 2026)

At the owner's request (“gentle, balanced and direct are confusing”; the Ultima VII and VI panels were cramped and the Albion reply was confusing), the visible controls and the Albion reply were reworked. The stored values are unchanged (`gentle`/`balanced`/`direct`), so saved settings, policy and every fixture keep working.

- **Names.** The three levels are shown as **Nudge / Hint / Full answer** (`HELP_LEVELS` in `ui.js`), with a one-line description under the toggle. Replies that named a level now say “help level”, e.g. “notes … appear when the help level is Full answer”, “at the selected help level”, “Earlier message hidden at this help level.”
- **One layout.** `createView` draws the same controls in all six guides: an optional “Asking about <chapter/topic>” line (pages pass `label` from `getContext`), a radio-group toggle with arrow-key support, New topic and Clear chat, then the conversation (speaker label, the level that produced each answer, sources, choice and map buttons as chips). The page's spoiler `<select>` stays in the document as the single source of truth, visually hidden (`.ga-replaced`), because page code and the browser suites read it; the toggle sets it and dispatches `change`. `controlsBefore` lets a page place the controls above its own hint card.
- **Per guide.** Ultima VII: the General Hints accordion is now a “Hint for this quest” card under the toggle, capped at 28vh, and the conversation gets the remaining height. Ultima VI: the General hints / Ask the Seer tabs are merged into one view (toggle, “Hint for this step” card, conversation, follow-up box); the Voice choice is unchanged. Ultima V: the conversation sits above the question box. Albion and Al-Qadim: the duplicate “Clear”/“Clear History” buttons were removed (the shared Clear chat does the same) and the open chapter is shown. StarCraft: the Detail select became the toggle; Topic and Tone are unchanged.
- **Albion reply.** `language.js` drops a newcomer lead-in (“I just started”, “I'm new here”) when a question follows and reads it as “what now” on its own. “What to do here?”, “Where do I start?”, “How do I begin?” become “what now”, so the open chapter answers. “What do I do first” is deliberately not rewritten (Ultima VI has its own answer for it; `sim-u6-start-02` caught that). In `engine.js` several unrecognised parts share one “Not answered: “a” or “b”.” line, and choices drawn from the open section ask “Which step would you like a hint for?”.
- **Tests.** New cases `ow-albion-01`…`06` in `owner-cases.json` (with negatives: no chapter open, “what to do with the pistol”, “what do I do first”), and a `choicesInclude` expectation in `english.mjs`. Changed on purpose: exact level wording in `knowledge-cases.json`, `english.mjs`, `english-browser.py`, `starcraft-browser.py`, and the `story-inamo` negatives (now `higher help level`, same meaning); the Ultima VI tab clicks were removed from three browser suites; `story-meaning-browser.py` clicks “New topic”.
- **Follow-up:** context-aware “what now?” is implemented below (Ultima V left unchanged by the owner's choice). Per-answer “Tell me more” remains a discussion item; it is not implemented.

## Context-aware first unticked step (Codex, 23 October 2026)

Shared engine selection now answers subjectless `what now?`, `I'm stuck`, `hint` and the exact owner newcomer message from the first unticked checkbox in the open supported section. Prefix: `First unticked step here (2 of 5 done):`; quotation: the chosen record's authorized variant; suffix: `Checklist order is not a prerequisite.` Other unfinished steps are chips in actual checkbox order, with authorized labels. All remaining chips are retained, including U6's seven alternatives; conversation entities stay bounded. Chapter map actions remain at their authorized level. Explicit subjects and restrictions retain the normal answer path.

**Ordering and progress.** Albion, U6 and Al-Qadim adapters attach explicit ordered `checklist: [{recordId, completionFact}]` references, copied by policy. Albion uses chapter item order. U6's overview uses section order; an open quest section or side quest has one checkbox, not a checkbox per walkthrough sentence. Al-Qadim uses required then optional order and retains references for withheld conflicting objectives, preventing selection from silently skipping them. Counts/selection read one fresh checkbox-report snapshot, not session corrections; chat claims keep their existing evidence behavior elsewhere but cannot masquerade as ticks. Strict `true` counts, unrelated reports do not. All ticked gets an historical-checkmark acknowledgement, not a game-completion verdict. A failed progress reader clarifies. No storage writes or format changes.

**Honest limits.** Al-Qadim has step-specific text only at Full answer. Nudge / Hint use the existing authorized chapter variant, labelled `A step-specific hint is not available at this help level. Section hint:`, with the checkbox count. A conflict-withheld first step also uses a labelled section fallback. Hidden and absent first-step records get the same reply, never a later step claimed as first. No new game facts or authored hint prose were added. Ultima VII and StarCraft keep their existing context hint paths.

**Owner decisions this round.** Asked about U5 context from the objective's Ask the Seer button: **leave U5 unchanged for now**. The clearer no-section reply was approved: `Open a chapter, quest step or objective, or name a subject, so I can offer a hint.` It applies to plain subjectless hint requests with no usable section or conversational subject. U5's existing campaign-scope behavior is unchanged.

**Tests and intentional changes.** New `contextual-checklist.test.mjs` has 34 checks, including exact messages, none/some/all ticked, reversed completion order, shuffled records, fresh checkboxes, chat-only reports, lower help/privacy, optional/withheld steps, U6 count granularity, restrictions, named questions, all chips, stale choices, history and retained map actions. New `contextual-checklist-browser.py` tests the actual three page surfaces, real checkbox interaction, chips, offline replies, sources, history and unchanged saved progress. Updated expectations with notes: owner cases `ow-albion-01`…`04`, `sq-aq-113`, the original stale-choice invariant and the Albion browser opener. Their previous generic-choice/chapter-wide expectations intentionally become a first-step answer with alternatives. No unrelated fixture was weakened. The browser map test caught and fixed lost chapter-map actions when narrowing a chapter answer to one step.

Full browser list (the previous 14 plus the new checklist suite): `english-browser.py`, `albion-browser.py`, `ultima-seers-browser.py`, `starcraft-browser.py`, `genie-sage-variants-browser.py`, `genie-sage-fixtures-browser.py`, `genie-sage-browser.py`, `genie-sage-state-browser.py`, `performance-browser.py`, `story-inamo-browser.py`, `story-meaning-browser.py`, `narrative-ultima7-browser.py`, `narrative-all-games-browser.py`, `narrative-expansion-starcraft-browser.py`, `contextual-checklist-browser.py`. Serve live files on loopback port 8766 and do not edit while suites run.

**Final verification:** original **203/203**, English **1058/1058**, standalone **874/874** (840 existing + 34 checklist checks), both page-fact checkers `ok`, all **15 browser suites** exit 0 (English browser **336/336**, new checklist browser **16/16**). Production source/overlay hashes stayed identical throughout the final run. The new UI harness was corrected to open Albion's accordion before clicking its checkbox and seed consecutive U6 completions: the existing U6 page journal normalizes away ticks beyond a gap on load, which is unchanged. The engine's direct progress tests still cover nonconsecutive reports without inferring prerequisites. Logs/status/hash audit: `/tmp/codex-context-checklist`; retained new UI check report and mobile screenshot: `guides/tests/assistant/evidence/contextual-checklist-*`. Gzip estimates: shared engine plus one adapter **73.4–80.5 KiB**, with overlay **84.0–94.2 KiB**, within the owner's previously accepted soft-budget exception. All loopback servers were stopped by their own PIDs. Nothing was installed, committed, pushed, deployed or reset.

## SmolLM2 conversational fallback trial (23 October 2026)

Historical trial record: the later consent-based integration section supersedes
its trial-only status; unrestricted factual generation remains rejected.

The owner requested a fast model to write a short conversational fallback from
recent chat and authorized source excerpts. This explicitly superseded the old
no-new-model-experiment decision for this isolated trial only. The old files were
gone; the owner separately approved downloading nine pinned replacements
(161,786,625 bytes total, about 161.8 MB) into
`guides/tests/assistant/fallback-pilot`. Model: SmolLM2-135M-Instruct q8, pinned HF
revision `12fd25f77366fa6b3b4b768ec3050bf629380bac`; runtime: Transformers.js
3.8.1, CPU WASM, one thread. Model/runtime payloads are ignored by Git, all hashes
verified, and nothing was installed system-wide. The current model files can be
reused for this approved trial without another download. Do not download another
variant/runtime without asking.

**Finding:** the trial is fast on this desktop but still unsuitable as an
unrestricted factual fallback. Three calibration cases tested JSON, plain text
and actual chat turns. The owner then approved a separate strict instruction:
never add unstated eye colour, clothing, personality, places or causes; explicitly
acknowledge missing details. On the same 26 fixed evaluation cases, manual
source-based review found conversational prompt 1 useful-safe / 7 nonanswer or
format failures / 18 unsupported, versus strict prompt 2 / 12 / 12. The strict
prompt was designed after the first outputs were known; these are implementer
regression judgments, not blind accuracy or a guaranteed hallucination rate.
One evaluation case was an already-supported engine answer used as a diagnostic
control. No `[G1]` citations were emitted by either prompt in those 26 replies.

In the owner's exact Ariana exchange, the shorter prompts invented blue eyes or
a cotton dress. The stricter version avoided those traits but merely said the
answer would relate to the notes. It still invented engines for the Ship Orb,
Spark's learning motives and a Mars spacecraft story in other cases. Median
strict first text: 1.46 s; complete: 2.48 s; p95 complete: 4.29 s. These exclude the
161.8 MB download and model initialization, are measured decoded-text callbacks,
and are not mobile/physical-paint promises.

**Boundary:** no production guide/engine/overlay was edited or imports the
pilot. Raw outputs stay labelled experimental/unverified; no safe-template
replacement was counted as model success. Model operations have no progress or
map API. Each inference run used local static GETs only, blocked external access,
worked offline after loading, left storage byte-identical and verified unchanged
production assistant/overlay hashes. Ten pilot unit checks protect context
selection and spoiler/source boundaries. Full method, exact sources/prompts,
timings, per-case review and raw replies are retained in the pilot's `RESULTS.md`
and `evidence/`. `browser-trial.py` owns/closes its server on port 8767.

**Final verification:** original **203/203**, English **1058/1058**, standalone
**874/874**, pilot context **10/10**, both page-fact checkers `ok`. The raw current
site passes **11/15 browser suites**. Four suites (`albion-browser`,
`ultima-seers-browser`, `starcraft-browser`, `genie-sage-browser`) now conflict
with the separate offline-cache work: worker rewrites bypass their intentionally
failed/delayed static-resource hooks and add `_swcheck` / `_swv` query parameters.
All four pass unchanged when a temporary, read-only test server omits only the
`offline.js` bootstrap from HTML responses. No cache/bootstrap/guide file or old
test expectation was edited for that diagnostic isolation. This confirms the
assistant checks in their original static-server conditions; it does **not**
claim the raw current cache-plus-guide integration is all green. Logs, raw
failures, isolated reruns and the exact response transform are retained at
`/tmp/smollm2-fallback-checks`. All owned test servers were stopped. Further cache
integration changes belong to the separate cache work and require its review.

### Explicit-topic fallback follow-up (23 October, owner approved)

The owner approved testing a separate `topic` variant in the same isolated pilot:
tell the model it is the fallback, say the engine **could not answer** (related
notes may still exist), and supply an explicit authorized current-topic label.
No live guide/engine/overlay changed and no further downloads were needed.

The prototype derives its topic from visible engine history/authorized records,
never from model-generated replies. A named subject replaces the older one;
recognizable follow-ups can retain a topic across an engine decline. Unknown or
ambiguous newer subjects, unrelated turns, reset and hidden history prevent
restoring stale context. Only the active exchange and authorized excerpts enter
the prompt. No clear sourced connection gets the fixed reply **"I don't have an
answer for that in this guide."**, without inference; supported engine answers
also bypass it. This is a limited alias/pronoun/subject-pattern heuristic with a
weather-word exclusion, not general coreference. It can reject connected wording
("Why are there three missiles?") and miss novel unrelated wording.

Final run: 39 cases (29 original plus ten new targeted cases), split into **23
model generations / 15 fixed unknown replies / one existing-engine control**.
On the original 26 evaluation questions, **17 model / 8 unknown / one engine**;
manual review found **10 unsupported, 7 nonanswer/format failures, zero useful-safe
model answers**. On those same 17 questions the earlier strict variant had 7
unsupported and 10 nonanswer/format failures. Routing, selected history and
instructions change together; these are implementer regression observations,
not blind accuracy or a causal test of the topic label. Fixed replies are never
counted as model successes. No model reply emitted a source citation.

With the correct explicit Ariana topic the model still invented that her hair
makes her look like a baby; with Iolo it invented Aesir lore and musical skills;
with the Ship Orb it invented engines and hull mechanics. Across the 23 actual
generations median first text was 1.67 s, completion 3.29 s, p95 completion 4.69 s
on the tested desktop, excluding load/download. **Still not accepted for live
factual fallback.**

The first topic run is retained as `topic-initial-all-*`; two capitalization/
contraction routing mistakes were fixed and covered before the final rerun.
Final prompts/raw results are `evidence/topic-all-report.json`, per-case manual
review/comparisons `topic-source-review.json`, under `fallback-pilot`. Earlier
prompt evidence is intact. Thirty pilot checks pass; combined with the unchanged
874 standalone checks, **904/904**. Original **203/203**, English **1058/1058** and
both page-fact checks were rerun and pass. Both topic browser runs passed
local-only, offline-repeat, unchanged-storage and unchanged-production-source
checks with no page errors. The fixed reply also works before loading the model.
The fifteen production browser suites were not rerun for this isolated change;
the previously recorded cache-related failures above remain unresolved by this
work. Latest local regression logs are `/tmp/smollm2-topic-checks`.

### Enforced conversational frames (23 October, owner approved)

After clarifying that the model is a last-resort conversational aid, the owner
approved implementation. `guarded` is a new isolated pilot variant; no live
guide or production module imports it. The program chooses reason/detail/
rephrase status after the engine cannot answer, and supplies three authored
conversational sentences for that category. Wording says no sourced answer was
produced here; it does not claim the entire guide lacks information the engine
may have missed. Known engine answers remain on their existing path.

`guarded.js` accepts only a complete approved sentence, then appends full exact
authorized excerpts and sources itself. A valid prefix plus any extra invented
claim is rejected in full. A current matching packet is required; lowering help,
reset or changing topic discards the in-flight reply and its quotes. Progress
commands get a fixed capability reply, no inference or writes. The viewer shows
the assembled reply separately; raw experimental output stays in collapsed
details and never streams into the primary reply.

The first guarded run allowed free generation then applied this validator:
**0/26** model attempts supplied an approved complete frame, so all used program
fallbacks. Evidence is retained as `guarded-free-all-*`. The final worker also
uses the existing runtime's logits processor to mask all tokens that cannot
continue an approved sentence. `frame-tokens.js` supplies the finite-prefix
logic; EOS is allowed only after a whole frame. The final complete-frame check
still applies. No package/model/runtime download was added.

On the same 45 packets (39 earlier plus six targeted guardrail cases), final
routes were **26 model frame selections / 15 fixed unknown / two fixed progress /
two existing-engine controls**. All 26 selections matched the closed contract,
using seven distinct authored sentences. This is **finite phrase selection,
not free-form writing or an accuracy estimate**. All game facts are program
quotes. A deterministic frame would avoid the model's latency; topic matching
remains heuristic and source truth is not established by decoding constraints.
The unconstrained model remains unsuitable for factual generation. Production
integration/failure handling are not built or approved.

The actual Ariana response starts: `I can show you the relevant passage, but I
don't have a sourced reason to add.` It quotes only `Ariana: a cute little girl
with short hair.` with the source. Median first decoded text **1.09 s**, complete
**1.84 s**, p95 complete **1.98 s** across 26 selections on this desktop, excluding
download/preparation (0.96 s loopback). Outputs were 9–20 tokens including EOS;
the guarded cap is longest approved frame plus EOS. Earlier styles keep their
60-token setting. These remain worker/decoded-text timings, not mobile/paint.

All 45 browser cases passed primary-reply construction/no-raw-stream checks,
collapsed raw details, local-only requests, offline repeat for every route,
unchanged storage/production hashes, and no page errors. Pilot tests **59/59**
(30 context, 23 reply guard, six token-mask); original **203/203**, English
**1058/1058**, standalone **874/874**, both page facts pass, **933/933** standalone
plus pilot combined. Production browser suites were not rerun for this isolated
change; the earlier four cache-related failures remain recorded. Logs are in
`/tmp/smollm2-guarded-checks`. Exact packets/raw and displayed text are in
`fallback-pilot/evidence/guarded-all-report.json`; per-case contract review in
`guarded-contract-review.json`, pilot source hashes in `guarded-source-hashes.json`.
An inspection preview was intentionally left on `http://127.0.0.1:8767/guides/tests/assistant/fallback-pilot/`;
its owned server PID is `/tmp/smollm2-guarded-checks/preview-server.pid`. Stop that
PID when the owner is finished. The browser trial's separate servers were closed.

## Consent-based model integration in all six guides (23 October, owner approved)

The owner explicitly approved connecting the guarded model to every game chat,
then changed automatic startup to first-visit opt-in and approved that flow.
This supersedes the earlier trial-only boundary. The integration is in the local
working tree; nothing has been committed, pushed or deployed.

**Visitor flow.** Every guide loads `assistant-consent.css` and `bootstrap.js`
from its head. Before a choice, chat, its dedicated navigation and generated
Hint/Seer/Sage openers are hidden. A native dialog explains that questions are
processed on the device and that enabling chat downloads approximately 162 MB.
Enable chat starts downloading/preparing automatically; chat stays unavailable
until the model is ready. Keep chat off hides it and leaves guide/checklist
features available. The always-accessible Assistant settings button can enable,
disable or Reset choice. Disabling an active U5 counsel surface restores its
Overview; U6 closes its modal/scroll lock; U7 closes only a Sage panel, preserving
the shared authored-journal dialog. Other non-chat tools remain intact.

**Persistence and privacy.** `guide-assistant.preference.v1` stores only schema,
choice and model identity in localStorage. It is shared across the six guides on
one origin and synchronized between open tabs. Enabled visits automatically
prepare the configured model; an off choice remains off across reloads and model
updates. A different model identity asks enabled visitors again. Reset choice
removes that preference, terminates the worker and clears in-memory chat; it
leaves downloaded parts and saved game progress intact. Blocked preference
storage fails safely and cannot enable a model implicitly. No questions,
conversations or progress are sent to an inference service or written to the
model cache. Only static same-origin files are requested.

**Model configuration and files.** `guides/local-assistant/profile.json` is the
single model/runtime profile used by every page: identity, revision, dtype,
input limit and verified file mapping. The existing owner-approved nine pinned
SmolLM2-135M q8 / Transformers.js 3.8.1 assets were repackaged locally into 18
content-addressed parts (at most 16 MiB each), totaling **161,786,625 bytes**.
No package installation or new network download was needed. Parts are under
`guides/local-assistant/files/`; include that directory and the profile when
publishing. `prepare-assets.py` checks and packages existing approved files;
its `--source`, `--id` and `--label` options prepare a future compatible profile.
A different inference backend still needs an adapter. See that folder's README.

The worker checks each part's size and SHA-256, reconstructs the original model
and runtime bytes, and uses CPU WASM with remote model/CDN access disabled.
`guide-assistant-model-files-v1` is a separate hash-keyed cache shared by the
six pages. Small profile metadata has its own offline cache. These files are
outside the guide-reading worker's 64 MB budget; the guide manifest/version was
regenerated for changed JS/CSS assets. HTML keeps the existing reader revalidation path. The original cache implementation was
not changed. Cache eviction/quota restrictions can require another download;
when caching is unavailable the prepared model can still run in memory.

**Shared answer path.** `engine.answer()` stays synchronous and unchanged in its
factual behavior. The shared view uses `answerAsync()`: normal sourced answers,
choices, actions, checklists, reports, multipart requests and protected declines
stay on the engine path. Eligible unsupported descriptive reasons/details,
mechanisms and rephrasing can use `fallback-context.js` plus `fallback-guard.js`.
Past-event presuppositions, guide-only/edition/material restrictions and explicit
conflicts retain core replies. A past-event decline's short follow-up also stays
protected. This prevents related identity/tutorial text from appearing to confirm
an unsupported event (Inamo / Zubin regressions). Existing negative expectations
were preserved, not weakened.

The model still only scores finite approved frames (three per category). The
program quotes the full authorized passage and the UI renders its sources;
locators remain hidden below Full answer. No model-written game fact is allowed.
A complete-frame validator rejects any extra prose; model generation errors or
a reply timeout use an approved default. Startup failures keep chat hidden and
provide Retry / Keep chat off. There is no network inference fallback.
Per-context fallback history clears on topic/context/session changes. Replies
pending across a help-level change, topic reset, consent revocation or another
question are discarded; hidden history is never forwarded as visible context.
Chat continues to write no saved-progress fields or storage formats.

**Verification.** All **17 browser suites** pass: the existing 15 guide suites,
new real-model `model-consent-browser.py` **105/105**, and new first-visit mobile
`model-consent-mobile-browser.py` **18/18**. The real suite uses native workers,
actual model parts and inference in all six games, with no worker fixture. It
checks no model/worker download before consent, remembered off/enabled choices,
no repeated part download between guides, sourced engine answers bypassing the
model, real guarded follow-ups, unchanged saved storage, pending-answer privacy,
disable/re-enable from active chat, cross-tab changes, model identity changes,
cancellation, corrupt-file rejection/retry and a real service-worker offline
Ultima VI reload followed by actual inference. The separate cache regression
also verifies real model loading and offline assistant use in Ultima VII. There are no page errors or
question-bearing requests. Mobile checks use 390×844 and download no model.

The older source/UI suites now explicitly seed the enabled preference and use
`browser-consent-fixture.js` for only the assistant worker. They isolate the
site-cache bootstrap and block service workers so their deliberate resource
failure/delay hooks and static-query assertions remain meaningful. Their answer
and negative expectations are unchanged. This resolves the earlier four
harness/cache conflicts; it is not a claim that those suites measured real
neural behavior or memory. Real inference and cache interoperability are covered
separately by the new suite. Legacy performance numbers cover the symbolic
engine/view with this fixture, not model RAM/loading or mobile hardware.

Original **203/203**, English **1058/1058**, standalone **898/898** (874 existing
plus 24 new integration checks), both page-fact checkers, and **59/59** retained
pilot checks pass (**957/957** combined standalone/pilot). Logs/status are at
`/tmp/assistant-integration-checks`; retained reports/screenshots are
`guides/tests/assistant/evidence/model-consent-*`. The 26 offline-manifest/reading regression tests also pass, including the
real Ultima VII assistant with explicit consent and a cached model after offline
reload. Neural RAM and non-Chrome/mobile hardware performance remain unmeasured. The model remains a constrained phrase
selector; none of the earlier free-form failures became factual-generation
successes.

The inspection server remains available at `http://127.0.0.1:8767/guides/Ultima6.html` (all six guides are served there). Its PID remains in `/tmp/smollm2-guarded-checks/preview-server.pid`; only this review server is intentionally left running. The regression server on 8766 and owned real-model test servers were stopped.

## Integration cleanup (23 October, owner approved)

The owner approved cleanup and clarified that the location question concerned
model files. Keep `guides/local-assistant/` as their shared production home;
all six guides already read its single `profile.json`. A new README under
`guides/js/assistant/` maps the live modules to that folder. The pilot README
now explicitly identifies the experiment as historical and points to the live
integration. Original ignored downloads, prompts and failure evidence remain
intact for reproducibility; no model files were moved or deleted.

`python3 guides/local-assistant/prepare-assets.py --verify-only` checks the
shipped files without consulting the pilot: part names, sizes, SHA-256 hashes,
model/runtime references and total bytes. It makes no downloads or writes.
Packaging now rejects a corrupt preexisting part and uses explicit source
integrity checks that remain active with optimized Python. The profile is not
rewritten on those failures. No live assistant behavior, settings placement,
checklists or saved formats changed.

Verification: all 18 shipped parts pass (161,786,625 bytes), including a check
under optimized Python. Nine isolated packaging checks pass, covering normal
packaging/verification, read-only verification, corrupt/missing parts, mismatched
references/totals, invalid verification options and source-integrity failure.
Original **203/203**, English **1058/1058**, both page-fact checkers, and
standalone plus retained pilot checks **957/957** pass. Live JS/CSS, all six
pages and the model profile match the hashes from the preceding full browser
acceptance; that 17-suite result remains the runtime evidence. Cleanup logs are
in `/tmp/assistant-cleanup-checks`. No installs, downloads, commits or deployment.

Screenshot cleanup (23 October, owner approved): removed all 38 generated PNG
screenshots from assistant test output folders (8,113,991 bytes). Test scripts,
JSON reports, transcripts and source-review evidence remain. Browser suites can
recreate screenshots; the test folder's `.gitignore` now excludes PNGs in the
three screenshot output directories. Earlier screenshot references above record
historical runs, not files currently retained. No live code or model changed.

## Limited FTP publication (23 October, owner approved)

The owner explicitly requested FTP publication, specified `/personal-website`
for local `default/`, `/site6` for Classic and `/guides` for the guides, then
approved both limited guide/main-site sets while leaving Classic untouched.
The saved FileZilla website connection was reused without installing anything
or exposing saved credentials.

Only **135 selected runtime files** were published: **71** under `/guides`
(assistant migration, six guide pages/hub, required styles/scripts/data, the
shared model profile and 18 parts, offline reading and the inert PHP endpoint),
and **64** under `/personal-website` (60 existing pages/header files with the
offline-reading hooks, plus four cache files). No tests, original trial model
downloads, screenshots, documentation, Python tools, Classic files or other
remote directories were uploaded. No remote directory was mirrored or cleared;
the deleted local prompt files were not deleted remotely.

The exact package was frozen before publication. All 79 existing destination
files matched their expected repository baseline and were backed up locally
before replacement; 56 destination files were new. Binary transfers used
temporary files, checked sizes and renamed individual completed files. Static
dependencies preceded pages; manifests and version markers went last. All
**135 remote files passed full SHA-256 readback verification**. Public HTTPS
checks also confirmed the eight cache scripts/manifests/version markers and
the inactive `https://guides.richardorilla.website/php/llm.php` response (410).
Provider credential revocation and any other deployed endpoint copies remain
unverified; no provider call was made.

The frozen manifest, private rollback backups and verification records are in
`/tmp/orilla-ftp-20261023T115313Z` (owner-only directory). Transfer/check logs
are `/tmp/orilla-ftp-{preflight,upload,verification}.log`. Prepublication
offline-cache suites passed 26/26; publisher unit checks passed 8/8. Repository
work remains uncommitted and unpushed.

**Production metadata correction.** Live offline checks caught older server
assets with CRLF bytes while the checkout manifest expected LF. The size audit
of 1,012 preexisting text assets found 982 changed-size files; byte comparisons
found 980 differences only in line endings and two other existing differences
(Leaflet CSS and the main-site web manifest). Those server files were preserved.
Only the four already selected cache manifest/version files were republished
with production-specific hashes/sizes and verified again by FTP and HTTPS.
The 135-file scope did not expand. Local manifests still describe the checkout,
so local offline acceptance remains valid.

**Future partial uploads:** reconcile against the latest live manifest and the
bytes being preserved/uploaded. Do not blindly publish a full local rebuild
while leaving old CRLF assets on the server. The generic publisher's local
manifest baseline must be reconciled first. Prepared production metadata and
its four final hashes are in `metadata-reconciliation.json` in the package above.

Final public checks pass: **35** real-guide checks across all six games
(consent before any model parts, native model loading/generation, exact sourced
fallbacks, unchanged progress, shared cache and no question-bearing requests),
and **17** offline checks for the main About page, Browser Gaming article and
guide hub, including cached core dependencies, offline reloads and zero page
errors. A broad initial network check flagged existing Cloudflare performance
POSTs; the final audit records targets/field names and checks actual question
text, with no inference request or tested question leak. Initial main-site
failures and an article navigation error remain recorded; final checks after
metadata reconciliation have zero errors. No main page content or legacy
script was changed to pass them.

Final proof is `deployment-acceptance.json`; raw live checks are
`live-smoke.json` and `offline-acceptance.json` in the private package. Logs are
`/tmp/orilla-live-smoke-final.log` and `/tmp/orilla-offline-acceptance-final.log`.
Rollback backups remain local and were not uploaded.

## Default prefetch and offline status (23 October, owner approved; local only)

After the limited publication, the owner requested faster default-site browsing
from Blog to articles, then requested a redesigned offline badge on default and
guides and explicitly reminded us of default's light/dark modes. The reported
guide model download was slow rather than broken; the owner cancelled that
investigation. The model, assistant, progress formats and guide worker are
unchanged in this round. No new deployment was requested or performed.

Default's loader now starts bounded speculation after saving the current visit:
deliberate hover/focus on same-site HTML links and up to two visible Blog cards
when idle. At most three unique destinations per document, one running job and
two queued jobs; Data Saver/2G, hidden tabs and offline state suppress work where
signals are available. The default worker prepares only public HTML plus verified
direct CSS/scripts, without executing it or fetching images/video/model parts.
Its separate 4 MiB/two-page cache does not evict reading copies. Fast navigation
requires a preparation younger than 30 seconds, available core dependencies and
no observed newer release; it revalidates in the background while pinning the
active page to its asset release. This allows up to 30 seconds of prepared HTML
age. Other navigation retains the existing fresh path. Guides do not prefetch.

Both loaders now draw a compact pill using new `css/offline.css` files. Default
uses its actual theme variables, including live light/dark changes. Guides use
page colors and leave room for Assistant settings at narrow widths. The existing
status text/live-region semantics remain; a 400 ms delay prevents a quick cached
visit from flashing the saving message. Reduced motion and print are respected.

`tools/tests/test_default_prefetch.py` adds 15 real-worker browser regressions,
including stale/expired copies, unsafe/private responses, checksum/budget failure,
Data Saver/2G, media exclusion, cached-status flicker, both themes and a stalled
origin. The existing shared-copy test intentionally checks the unchanged reading
core plus default-only extension instead of identical worker/loader files; its
comment records this expectation change. The guide fixture now serves its actual
worker. No assistant answer fixtures changed or negatives were weakened.

Cache/manifest/publisher acceptance passes **49/49** (26 existing cache/manifest,
15 new, eight FTP publisher). Actual page checks confirm the rendered Blog →
Mobile Gaming 2026 card route uses its preparation, both default themes update,
and all six 320 px guide layouts avoid badge/settings overlap. Chrome was tested;
local timings are not production or cross-browser guarantees. Source audit:
128 of the prior 135 published files are unchanged; seven cache files changed
locally and two status stylesheets are new. All guide engine/model/page sources
and the guide worker match the preceding publication.

Exactly **nine runtime files** are pending, tracked in
`docs/default-prefetch-status-upload.md`. The frozen package is
`/tmp/orilla-prefetch-release-20261023T130417Z`, 343,838 bytes. Its manifests start
from verified current production bytes and update only the five changed/new
asset entries, preserving older CRLF assets. Do not upload local-source manifests
instead, or upload the package's baseline/reports. Recheck source hashes and live
baseline before any later authorized upload. Classic, tests/docs/screenshots,
model parts and unrelated files are excluded. Logs/visual evidence are in
`/tmp/default-prefetch-checks`; no screenshots are retained in the repository.

Final rerun: original **203/203**, English **1058/1058**, combined standalone /
retained pilot **957/957**, both page-fact checkers, and all **17 guide browser
suites** pass, including real-model and mobile consent acceptance. Runtime hashes
remained frozen throughout. The owned regression servers were closed and all
regenerated repository screenshots removed after testing. Package hashes and
manifest references verify for all nine files; `git diff --check` passes. Final
record: `/tmp/default-prefetch-checks/acceptance.json`. No upload occurred.

## Guide model download progress (23 October, owner approved; local only)

The owner requested downloaded MB / required MB plus estimated speed while the
guide model loads. All six pages use the shared consent dialog; no per-guide
changes are needed. New `model-download.js` handles bounded response streaming,
transfer accounting and display text. `model-worker.js` first verifies cached
parts to establish the remaining download total, then counts incoming decoded
bytes during each missing file. Updates arrive every 500 ms and at file/stage
boundaries, so a large part no longer appears motionless until it finishes.

Example: `Downloaded 45.2 MB / 161.8 MB · Estimated speed: 1.8 MB/s`. Decimal
MB means 1,000,000 bytes; slow rates use KB/s. Partial cache hits are shown as
already saved and subtracted from the required download. Fully cached starts
show saved-file loading, without a rate. Until 500 ms of fetching and some bytes
exist, the label says it is estimating. Speed is the average decoded bytes per
second while awaiting/reading missing-file responses; server/body stalls count,
cache verification, integrity checks and cache writes between files do not.
Browser/HTTP-cache reuse and content encoding can affect this estimate: it is
not a measured internet link speed or an ETA. Preparation clears the rate.

`model-runtime.js` forwards metrics and resets them on disable, error/retry and
new starts. A terminated worker cannot restore old counts. `bootstrap.js` formats
the status and names the overall progress bar. Streaming does not authorize any
file: expected size and SHA-256 must still pass before storing/using it, and chat
stays unavailable until preparation succeeds. No model parts/profile, factual
answers, consent/storage formats, progress checkboxes or reading worker changed.

Ten new unit regressions cover per-chunk counts, truncated/oversized/interrupted
streams, non-streaming fallback, cache accounting, stalls, speed timing, display
units and runtime cancellation/retry. New `model-download-browser.py` exercises
the native worker with small local streamed fixture assets, not neural inference:
14 checks cover updating counts/rate before completion, partial/full/invalid
cache, 320 px layout, accessibility, preparation, corrupt-file rejection/retry
and no extra storage. Real inference remains covered separately by the existing
real-model suite. No older answer expectation changed.

The combined pending upload now has **13 files**, replacing the earlier nine-file
package. See `docs/default-prefetch-status-upload.md` and
`/tmp/orilla-progress-release-20261023T132101Z/release.json` (364,288 bytes).
Both default prefetch/status and guide download progress are included. Model
parts, tests/docs, screenshots and Classic remain excluded. Production manifests
preserve the live baseline and change only nine uploaded asset entries; do not
upload a full local-source manifest. Logs are in `/tmp/guide-download-checks`.
Nothing has been uploaded or committed in this round.

Final verification passes original **203/203**, English **1058/1058**, combined
standalone/pilot **967/967** (ten new), both page-fact checkers and all **18 guide
browser suites**, including the new **14/14** streaming checks and existing real
model **105/105**. Cache/manifest/publisher tests remain **49/49**. Runtime hashes
stayed frozen; the 13 package files/hash references verify; `git diff --check`
passes. Owned test servers were closed and regenerated repository screenshots
removed. Final record: `/tmp/guide-download-checks/acceptance.json`.

## Follow-up publication and commit authorization (23 October)

The owner explicitly requested uploading the latest changes and then committing
the completed files, reserving GitLab/GitHub pushes for themselves. This overrides
the earlier no-commit boundary for this work; no push is authorized.

The 13-file prefetch/status/model-progress package was backed up, published with
assets before manifests/markers and verified by full FTP SHA-256 readback plus
HTTPS. Live first-visit testing then found that Cloudflare still returned the old
`offline.js?v=2` as a HIT with `Cache-Control: max-age=31536000`. New files under
hash queries were correct, but an uncontrolled first visit could execute the old
bootstrap. Both sites therefore change their HTML entry URL to `offline.js?v=3`,
and the local article template matches. Only this URL changes in the additional
59 default and seven guide pages; source comparison against the frozen preceding
publication verifies that restriction.

All **79 selected runtime files** (13 plus 66 pages) are backed up and FTP-hash
verified. Both canonical new loader URLs return the new bytes, and HTTPS checks
confirm all 66 canonical pages reference them. Classic `/site6`, model parts,
tests, screenshots, docs/tools and unrelated files were not uploaded; no remote
directory was mirrored/cleared. The package and rollback evidence are in
`/tmp/orilla-progress-release-20261023T132101Z`, with the page correction in
`loader-v3/`. Runtime paths and publication details are recorded in
`docs/default-prefetch-status-upload.md`. Production manifests retain untouched
live CRLF hashes; local manifests retain checkout hashes.

The post-correction local rerun passes original **203/203**, English **1058/1058**,
standalone/pilot **967/967**, both page-fact checkers and all **18 browser suites**.
Cache/manifest/publisher now passes **50/50**, including a stale-entry-URL negative
for both scopes. The old hook expectation intentionally becomes `?v=3` and carries
a code comment. The first new test used a default-only theme fixture in guides,
then was corrected to the shared fixture; no assertion was removed. Six publisher
UI tests and 20 whitespace-cleaned narrative tests also pass. Generated screenshots
were removed after the final run.

For the authorized commit, root `.gitattributes` marks model `.bin` parts binary
so cross-platform line-ending conversion cannot corrupt their hashes. All 18
staged parts match profile size/SHA-256. Only redundant final blank lines in
three new text files were trimmed; no model bytes changed. `git diff --cached
--check` passes. The original ignored trial downloads remain ignored. Publication
scripts and private backups remain outside Git. Pushes are left to the owner.

Final public acceptance passes **36** real six-guide/model checks (including
streamed MB/rate), **7** strict main-site smoke checks, **17** main/guide-hub
offline checks and **7** default prefetch/theme checks. The prepared Blog →
Mobile Gaming 2026 route opens and reloads offline, both themes use the new pill,
all six games generate sourced replies and progress stays unchanged. No final
page errors or tested question-bearing inference requests were found.
An old combined smoke switched main-site offline on the first HTML cache write;
the same assertions pass separately after `Available offline` and core resources
are ready. Its initial raw failure is retained and the final smoke record states
that guide/main portions were separate runs. The initial CDN failure is also
retained. Final aggregate: `deployment-acceptance.json` in the private package.

## Time Lord conversation and silent name spacing (23 October, local only)

Spacing-only differences now resolve silently in the shared resolver, including
joined and split proper names. Literal names win; ambiguous spacing/typo matches
keep all candidate subjects regardless of which relationship is answerable.
Named confirmations (`yes a time lord`) retain the original question and its
restrictions. Guide-only restrictions persist through those confirmations and
pronoun follow-ups, including the asynchronous fallback gate.

Empty Ultima VII atlas labels are no longer identity answers. A cited Time Lord
identity note uses his Black Gate dialogue, attaches to `ultima7:npc:time-lord`,
and stays at Balanced. The existing atlas location/action remains available.
Burnside/Covetous positive metadata-answer fixtures intentionally became explicit
declines with notes; their atlas locations remain supported.

New tests: `name-spacing.test.mjs` (25), plus the exact reported conversation and
guide-only follow-ups in `english-browser.py`. Checks: standalone 933/933,
original 203/203, English 1058/1058, browser 351/351; no external browser requests,
page errors or saved-progress changes. Typo benchmark: 13,311 cases, recovery
90.1% -> 90.3%, rounded wrong-subject rate unchanged at 0.36%, zero ordinary-word
suggestions/hidden-name leaks, one unchanged gibberish suggestion. No install,
commit or publication was performed.

## Core lore and recent-topic follow-ups (23 October, local only)

The owner's Time Lord -> Guardian example now resolves each character directly.
Three new cited profiles (Guardian, Avatar, Britannia) and three authored facets
(Guardian goal, Time Lord request, Time Lord/Guardian opposition) bring Ultima VII
to 725 records / 33 narrative facets. Sources are the original Black Gate dialogue
transcripts and manual, with normal research labels and spoiler ceilings.

`buildResearchRecords` accepts a separate `subjectKind`; authorization preserves
it, entity matching uses it, and person-pronoun handling recognizes it without
changing `kind:research` or evidence precedence. The shared narrative invariant
still requires an existing profile, now matching its effective subject type.

The shared engine remembers at most two recent established subject IDs, allowing
`How are they related?` and equivalent relationship/connection follow-ups only
when an authored relationship supports them. Mentions in prose do not establish
topics. A two-subject answer makes singular pronouns ambiguous; reset, context
changes and spoiler reductions clear/filter the pair. Source/material/numeric/
edition restrictions survive, including early edition declines.

Descriptive search candidates remain unconfirmed until selected. Pronouns and
implicit questions reoffer those choices instead of silently adopting a suggested
subject; guide-only searches exclude research candidates. This also blocks the
model from turning such proposals into asserted topics.

Validation: new `lore-context.test.mjs` 22/22; standalone 955/955, original 203/203,
English 1058/1058, browser 369/369, page-fact/spoiler check passed. Browser checks
include the reported chain, goals, plural relationships, ambiguous pronouns and
unconfirmed searches, with no external requests/page errors/progress changes.
Typo benchmark remains 90.3% recovery, 48/13,311 wrong subjects (0.36%), zero
ordinary-word suggestions/hidden-name leaks; its one prior gibberish suggestion
remains. No installs, commits or publication. Cache metadata must accompany any
later publication of these local changes.

## Ultima VII trivia and Lord British (23 October, local only)

The owner asked to use the Ultima VII UI and ask `Who is Lord British?`, then add
many trivia tests. The original UI replied only `The king.` and failed `Who is
he?` because his atlas marker is a castle. An overlay `atlasSubjectKinds` entry now
marks him conversationally as NPC while preserving his historical place ID,
marker/action and coordinates. Three dialogue-sourced facets cover identity,
rule of Britannia and friendship with the Avatar; guide-only identity still uses
the guide's original king line. A new Black Gate identity facet describes the
portal without revealing its destruction steps. Total: 729 U7 records / 37 facets.

New `trivia-ultima7-cases.json`: 100 hand-authored questions (78 factual, 22 safety,
edition and spoiler cases), 10 dialogues / 40 turns. `trivia-ultima7.test.mjs`
adds 115 tests; `trivia-ultima7-browser.py` replays every case through the UI plus
two offline checks, retaining `evidence/trivia-ultima7-browser.json` (142 replies).
The UI exposes each assistant message's actual decision in `data-decision` so a
refusal or related quote cannot masquerade as a factual answer in browser tests.

The corpus exposed fixes for spacing-only names in narrative matching, the
`the Guardian` alias in purpose questions, and ampersands/slashes inside spell
names such as `Heal & Cure`. The browser found `What is he hiding?` after Lord
British answered from the Trinsic quest behind chat; pronoun hint/prerequisite
requests now keep the established conversational subject. The corresponding
Node regression supplies that selected page context explicitly.

Validation: standalone 1070/1070, original 203/203, English 1058/1058, shared browser
369/369, trivia browser 142/142, U7 page-fact/spoiler check passed. No external
browser requests, page errors or saved-progress changes. Typo recovery/wrong
subjects remain 90.3% / 48 of 13,311 (0.36%), with zero ordinary-word suggestions
or hidden-name leaks and the same one prior gibberish suggestion. A manual IAB
replay with the real pinned local model also verified Lord British -> `Who is he?`.
The latest local cache metadata includes these changes. No packages installed,
commits, pushes or publication performed.

## Active all-games conversation goal (23 October 2026)

The owner replaced simply growing the 100-question Ultima VII trivia suite with
an explicit goal of extensive conversations across all six guides. The active
goal and acceptance criteria are recorded in
[`assistant-conversation-goal.md`](assistant-conversation-goal.md). Start with an
inventory of existing coverage, then test sustained conversations across the ten
behavior families. The initial minimum is 20 distinct conversations per guide,
normally 8–15 visitor turns, with additional branches driven by gaps. Track
subjects, relationships, help levels and transitions separately from raw counts;
do not count refusals or paraphrases as additional factual coverage. The existing
Ultima VII work remains local and must be preserved.

The first execution pass added `conversations/albion.json` (20 chats / 164 visitor
turns) and `conversations/ultima5.json` (20 / 162). Campaign Node 326/326 and UI
330/330 pass, including four offline follow-ups. It fixed native spell-stat
selection, exact names containing framing words, continuity between differently
named narrative facets, predicate carry between outcomes/steps, short outcome
requests, and a person's implicit name being taken from a recruitment instruction.
Albion's reviewed Sira/Melthas party link is now a Direct narrative facet from
existing character notes; Albion builds 394 records / 15 facets. Existing lower
spoiler ceilings and unsupported family/motive questions remain covered.

First-pass standalone 1131/1131, original 203/203, English 1058/1058 and shared browser 369/369
pass. Campaign browser runs use the explicit consent/worker fixture, preserve
storage and make no external requests. Native-model campaign checks, the four
remaining games and the family/help-level matrix are still pending; the goal is
active. The dedicated goal document contains commands, coverage counts, evidence,
initial failures and next steps. The inventory distinguishes the RPG suites'
short chats from StarCraft's existing long technical conversations. Cache metadata
was regenerated. The refreshed asset report includes consent/model-runtime code:
engine/adapter gzip remains over the owner's accepted soft 50 KiB target, while
the active first-use totals remain below 250 KiB. No installs or publication.

### Second campaign pass (24 October, current)

Ultima VI (20 chats / 162 turns), Ultima VII (20 / 166) and Al-Qadim (20 / 161)
now join the campaign: 100 chats / 815 turns across five games. Node 815/815 and
real UI 825/825 pass, including ten offline turns; all storage is unchanged and
there are no external requests/page errors. Native-model campaign checks and the
family/help matrix remain pending. StarCraft's new campaign is not authored yet.

Shared fixes cover Cure/Kill as spell names versus action verbs, complete authored
questions versus bare subject follow-ups, relationship-aware selection among
same-named quest/shrine entries, page scope hiding a valid reference, exact indexed
prefix composition for mantra follow-ups, and explicit pairs keeping singular
pronouns ambiguous. Complete reviewed full-question aliases now answer even when
the generic parser has no intent word. `sq-aq-095` and `sim-u6-spell-08` intentionally
now require direct factual answers with their exact source records; notes explain
why. New fixture oracle corrections are also documented with the unchanged sources
and first-run evidence. Al-Qadim adds two aliases to its existing save-game note.

Current validation: standalone 1201/1201, focused regressions 26/26, original
203/203, English 1058/1058, shared browser 369/369, both page-fact checkers, unchanged
13,311-case typo metrics. Cache metadata is regenerated and checked. No installs,
commits, pushes or publication. The loopback server is still live on port 8766
(revalidate before use; process 2315643 at this handoff).

**Next priority:** a separate fresh-topic audit exposed identity answers returning
outcomes/task lists/procedures: Ultima V `Who is Lord British?` and `What is a
Shadowlord?`, and Al-Qadim `Who is the Caliph / Vizier / Aliya / Tarik?`. These are
open meaning defects, not accepted limitations. Read `assistant-conversation-gaps.md`
and `evidence/conversation-lore-gap-probes.json`; fix and regress them before any
completion claim. Then finish StarCraft, the coverage matrix and native-model
campaign verification. Passing the five current corpora does not finish the goal.

## Open items / suggested next steps

1. ~~Re-measure performance and heap~~ done 21 Oct 2026 after the simulation round (see the docs table; the browser is now Chrome 156).
2. ~~More research~~ done for Ultima VI/VII/Al-Qadim (Al-Qadim now has 17 cited notes). **A further cited-research round is not started.** Al-Qadim's report lists unindexed sources (rule book and cluebook PDFs) that need an owner decision on citing local PDFs.
3. ~~Albion tiering~~ done at the owner's choice; `sug-neg-02` and `sq-aq-020` changed on purpose and carry a `note`.
4. **Owner decisions pending (do not decide for them):**
   - **Companion recruitment.** “How do I recruit Iolo / Jaana / Julia?” declines in Ultima V, VI and VII because a guide location is not declared as a recruitment method. Older tests (`ultima5-27`, `ultima6-08`, `ultima7-04`) expect the decline. Making the location answer it is a one-line adapter change per game plus those three fixtures.
   - **Albion levels.** The Albion session moved equipment, creatures and places from Direct to Balanced (Gentle unchanged); easy to reverse.
   - **Data errors in the guides.** Ultima VII atlas marker “Burnside” carries Finnigan's description; Al-Qadim's shop-item text disagrees with the official rule book for two potions; Ultima VII spells “Alagner/Alagnar” and “Horance/Horace” spellings. From the 22 Oct walkthrough check: the Ultima VII Ethereal Ring's source (guide: Lord Draxinusom in Terfin; walkthrough: Spektran), Albion's Goddess's Flowers (+3 to each stat vs. one attribute of the leader), Al-Qadim's Wisest Snake (Western Desert vs. bought at Reptilian Desires), and Albion labelling both 1042 and 1712 as service-level codes.
   - **Trust questions and “where is X” without a location entry.** Both decline by earlier decision; a labelled fallback was tried on 22 Oct and withdrawn because it exposed Direct-only places at lower settings.
   - **“Closest guide text” replies.** Done 22 Oct (owner approved): when nothing understood a question, up to three visible guide sentences are appended under a “may not answer your question” label, never as an answer. Rules and limits are in `docs/game-assistant.md` (“Closest guide text”). It deliberately stays silent for restrictions, one-word questions and name-only matches, so several walkthrough gaps remain.
   - **StarCraft.** Whether Direct answers need a short lead-in, and whether edition-neutral advice should answer when an edition is named.
   - **Page text in overlays.** Ultima V/VI/VII overlays copy some sentences from their own pages (checked by the `sim-*` scripts); the owner may prefer the pages to expose them as data.
5. **Shared-layer requests still open** (a subset was fixed in the “Engine fixes from the sessions' shared-layer requests” part of `docs/game-assistant.md`; the remainder, about 20, in `sim-report-<game>.md` in the coordinator's notes folder `~/.config/Claude/side-session-notes/local_ced3b667-c98b-4d16-bfd6-126de29fdd08/`): short-word typo repair (“shp orb”); edition word inside a subject's own name (“Forge of Virtue”); two named subjects with stats answered side by side; “location and class” without a question mark; a generic topic alias beating a specific one; StarCraft alias grids (about 3,240 aliases in template grids; mechanical pruning loses answers, so it needs engine slot matching first — shared-engine work, not a Haiku task); counts and lists for dungeons, quests and sword moves; a clearer reply for “drop(s)”.
6. **Known odd guesses** (explicit and acceptable so far): “London” → Landon (Ultima V); choice-only “Batman” → Bradman and “villain” → Emp Village (Ultima VII).
7. **Limited production publication is complete:** see the FTP record above. The guide route now returns 410; provider credential revocation and other possible endpoint copies remain unverified. Further deployments require explicit owner authorization.
8. **Process note.** Several sessions edited the shared engine/language files and docs concurrently this round, so check `git status` and rerun every suite before building on them. The browser suite caught a regression the Node suites could not, so always run `english-browser.py` after engine changes.

## Working style the owner responded well to

Reproduce the reported message exactly, show the root cause plainly, fix it at the shared-engine level, add the exact message as a regression case (with negatives), run all suites, update the docs, and report outcomes candidly, including limits and design choices that are theirs to overrule.

## Latest integrated campaign, 24 October 2026

Read `docs/assistant-conversation-goal.md`, the independent
`docs/assistant-conversation-coverage.md` and
`docs/assistant-conversation-gaps.md` for the current all-games audit. The owner
explicitly authorized subagents to speed this work; StarCraft, coverage review
and native verification were delegated independently while shared-engine fixes
were integrated here. The local corpus contains 132 conversations /1,097 visitor
turns (837 factual, 260 structural). Per-game counts and source/subject coverage
are in the goal document. No installs, new model downloads, commits, pushes or
publication were performed for this campaign. Preserve all local changes.

Identity requests no longer accept procedures merely because a matching person's
name occurs there. Reviewed game-specific Lord British/Shadowlord identities and
four Al-Qadim role phrases are indexed separately; unsupported biographies
honestly decline and offer context/location. Exact literal subjects keep their
own facts when the selected page's quest uses the same name as an alias.
StarCraft now has a complete sustained technical campaign and bounded source
indexes for the questions it exposed. The shared restriction, pronoun, multipart,
name-spacing and early-decline paths have targeted cross-game regressions.

The 180-cell family/help review is complete with explicit narrow location ceilings,
not whole-game/family exemptions. Original gaps in low-level objective and
explanation testing were filled with reviewed hints, invasion cause, experience/HP
mechanism, and Albion concept/chapter explanations. Missing biographies/motives,
recruitment policy and known guide conflicts remain the explicit boundaries in
the gaps document. Source-backed utterance counts are not independent facts or
blind accuracy. Further knowledge expansion needs source review, rather than
more paraphrases or inferred prerequisites.

Actual UI campaign and native-worker evidence are separate artifacts. Native
`conversation-native-completed.json` records the full 132-dialogue campaign and
real chapter/quest/topic transitions against a stable runtime snapshot. The final
narrow same-subject ownership-hypothetical correction is preserved as
`conversation-native-hypothetical-followup.patch`; `conversation-native-current.json`
checks the current runtime across all six with explicit same/new/qualified-subject
regressions. Use final acceptance evidence and its hashes; interrupted/earlier
oracle-failure native reports are retained solely as history. The model selects
approved conversational wording; every factual quotation still comes from
program-selected authorized source records. Do not report 1,097 neural factual
inferences.

Reproduction uses the already available Node runtime and Playwright/Chrome;
install nothing. Regenerate cache metadata after runtime/data changes. The
loopback server on 8766 was started for this work and is not a deployed service.

Final acceptance: standalone 1,245/1,245, original 203/203, English 1,058/1,058,
shared browser 370/370, current campaign UI 1,109/1,109; full native baseline
1,188/1,188 and current native probe/guard run 113/113. The final acceptance JSON
reconciles source hashes and preserves the native snapshot boundary explicitly.
The original ownership-hypothetical regression passes: the exact unqualified
current subject remains available without applying a possession report; new or
qualified hypothetical subjects cannot recover older facts.

The owned loopback server on port 8766 was stopped after final acceptance; restart
it explicitly for browser reproduction. No deployed service was changed.

## Chat scrolling follow-up, 24 October 2026

A reported Ultima VI Full answer dialog clipped its composer after longer chats.
Its panel had a viewport cap, while the counsel body independently estimated its
height without accounting for the header and Voice controls. At 1280×900 the
body extended to y=920 while the clipped panel ended at y=834. The panel is now a
flex column, with a shrinkable, scrollable body using the actual remaining space
and dynamic viewport caps. Its input and Send button remain reachable.

The cross-guide review also found Al-Qadim's walkthrough sidebar squeezing its
conversation to 12px or zero on short screens. A minimum card/log height keeps a
usable conversation area while the surrounding page scrolls. The dedicated
Genie tab and the other four games needed no production layout changes.

`guides/tests/assistant/chat-layout-browser.py` passes 42/42 combinations: seven
chat surfaces (both Al-Qadim views) at six desktop, phone and short landscape
sizes. It uses Full answer, eight initial UI turns per surface, then another real
send at every size: 98 actual sends. Checks cover message reachability, card
clipping, input/Send hit testing, Ultima VI wheel scrolling and modal bounds,
unchanged storage, static requests and stable source hashes. There are no external
requests or page errors. The shared English browser suite also passes 370/370.
These layout checks use the consent/worker fixture, not native inference.

The failing baseline geometry and final proof are in `evidence/chat-layout-*`.
The two stylesheet cache hashes were regenerated and verified. No conversation
engine, factual sources, saved-progress formats, installs or published files were
changed by this follow-up. All changes remain local.

## Conversation and layout publication, 24 October 2026

The owner subsequently requested FTP upload followed by a relevant local commit.
Publication is complete: 18 changed guide runtime assets plus two reconciled
cache metadata files, all under `/guides`. Full FTP binary SHA-256 readback and
public HTTPS verification pass for all 20. All 778 untouched production manifest
entries are preserved; the local checkout manifest intentionally remains distinct.
The live chat layout run passes 42/42 combinations and 98 sends using real service
workers, controlled reloads and the approved consent/worker fixture. Progress is
unchanged, with no page errors or tested question text in requests. Standalone
regressions pass 1,245/1,245 again.

Read [`assistant-release-20261024.md`](assistant-release-20261024.md) and its
linked sanitized evidence for the exact release scope, hashes and cache freshness
boundary. The established mappings remain `guides/` → `/guides`, `default/` →
`/personal-website`, `classic/` → `/site6`. No default/Classic changes or model
binaries were uploaded. Credentials, rollback backups and raw deployment logs
remain outside Git. Only canonical final evidence is versioned; intermediate
first/round/probe/failure reports referenced in older notes remain local. No Git
push is part of this request.

## Intent-classifier prototype, 24 October 2026

The owner subsequently requested committing the remaining test evidence first,
then an intent prototype for Ultima VII and StarCraft. The 27 earlier reports
and their history index are committed as `873b9f9`; executable tests and canonical
prior acceptance were already included in `5ec79d4`. That commit's secret scan
passed, including checking for the saved FTP password without emitting it.

The owner explicitly approved a roughly 24 MB MiniLM download. The isolated
`guides/tests/assistant/intent-prototype/` lab uses pinned verified
`Xenova/all-MiniLM-L6-v2` q8 assets and the existing Transformers.js 3.8.1 runtime;
no packages were installed. Only a linear intent head is trained; no encoder
fine-tuning or generative fact answering is performed. The two current guide
record sets supply its subjects, and source/spoiler authorization stays in code.
Model binaries and raw results are ignored. Production files and active model
settings are unchanged; the prototype was not uploaded or pushed.

Read the prototype `README.md`, `corpus-review.md`, `RESULTS.md` and sanitized
`evidence/reviewed-summary.json`. Actual MiniLM classification matches 41/48
independent labels, with about 5 ms median on four uncached desktop samples.
Conversation intent/entity matches are 38/47 and 27/47. Only 1/48 independent
questions pass conservative rewrite eligibility; uncertainty thresholds reject
none despite seven label errors. This is not accepted for production routing or
an end-to-end accuracy claim. Synthetic/structural checks pass 22/22, real-browser
control races 11/11, preparation retry succeeds, source/storage remain unchanged,
and no external requests or page/console errors occur. No model/corpus fitting
was tuned after seeing the frozen evaluation; later dialogue/async fixes make
that evaluation a regression set for those structural changes.

### Shared short follow-ups, later on 24 October

The owner requested SCHNAIL identity → download link and clarified that the
behavior must also work in Ultima VII. Read the prototype's `FOLLOWUPS.md` and
`evidence/followup-summary.json`. The actual reported URL request already had a
correct learned intent; its rejection came from downstream restriction handling
and stripped source hrefs. Shared fragments/pronouns now carry their grounded
subject, method and requested format. The proposed source engine has no separate
older referent: each request is scoped from the interpreter. Exact source URLs
and a reviewed short SCHNAIL definition remain program-selected and authorized.

The local v2 head has 180/72 training/validation examples. Five real UI sends
verify SCHNAIL → download and Iolo → location → stats. Structural/source tests
pass 39/39 and real-browser control/isolation assertions 16/16. Keep the broader
limits visible: only 25/65 complete authored follow-up checks pass; learned
intent matches 50/65, resolved intents 51/65, and v1 label regression is 40/48.
Remaining failures and zero rejection thresholds are not accepted for production.
The new raw reports/screenshots/model files remain ignored, the prototype changes
remain uncommitted, and no production code, cache metadata, FTP files or Git
remotes were changed in this follow-up.

### Source-backed consultation, later on 24 October

The owner then requested advice for playing StarCraft Remastered: which option
is best. The model already recognized comparison, but the old path dumped the
entire comparison and appended `Not answered: do you think`. The prototype now
has a shared, declarative source-verified consultation controller. It conditionally
prefers the integrated map for native Remastered play, states Use Map Settings
and limited maps, and distinguishes SCHNAIL's separate client. The same policy
handles three guide-backed Ultima VII party roles. It does not rank unsupported
criteria, certify uncertain compatibility, or claim universally best software.

Read the prototype `CONSULTATION.md` and `evidence/consultation-summary.json`.
The stable-source real browser run passes 23/23 authored consultation checks,
existing control/isolation assertions 16/16, and unit contracts 53/53. Context →
recommendation → download returns only the map's two source URLs. The classifier
head is unchanged. Source/storage/network boundaries pass; no production, FTP,
active model/profile or Git remote changed. General conversation limitations
remain: the older 65-turn follow-up suite still passes only25 complete behaviors.


### Full answers only, later on 24 October

The owner confirmed full answers and removal of the selector across all games.
Shared UI and both prototype/production public requests now force direct answers;
there are no help controls, hidden selects, level badges or stale suggestions to
raise a help level. A typed smaller-hint command retains complete source detail,
including narrative steps and uncertainty. U6/U7 quest launchers say Ask the
Seer/Sage and their context cards use direct text. Saved progress, consent,
source/conflict guards and independently authored walkthrough hints are intact.

Current proof: `full-answer-browser-full-answer-complete.json` (24/24),
`chat-layout-always-full-complete-20261024.json` (42/42 layouts, 98 sends),
1,252/1,252 standalone tests, and the prototype's `evidence/always-full-summary.json`
(53 units, 17 real-model control checks, 23 authored consultation checks). The
prototype still passes only 25/65 broader follow-up behaviors and stays isolated.
Old UI tier-switching tests/reports are superseded; internal source-tier tests
remain valid. See the latest `docs/game-assistant.md` section for exact boundaries.
All 796 offline asset hashes match the regenerated local metadata. These changes
remain local and uncommitted; no additional FTP upload or push was performed.


### All-game intent integration and roomier chats, later on 24 October

The owner requested expanding the smarter prototype into all six guides and
redesigning cramped chats. All production adapters now use `guide-assistant.js`
with the shared dialogue wrapper, actual MiniLM intent worker, source formatting
and conditional consultation (18 reviewed profiles across all six games). Source
engine evidence/progress, choices/actions, unknown-name and qualifier guards are
retained. Per-turn abort prevents old work from blocking a new topic. Source and
model work remain separate; no factual prose is generated by the classifier.

U7 is now a wide conversation-first modal with a collapsed quest briefing and
pinned multiline composer. U6 also collapses its briefing and has a larger modal.
Every surface offers Expand chat / Return to guide using a native dialog; moving
and restoring the same nodes preserves input/history/focus. Phone Send remains
unobscured. The prototype page now provides links to all six local guides.

Read the latest `docs/game-assistant.md` section and
`guides/tests/assistant/evidence/rollout-final-acceptance.json`: 1,281 standalone
checks, 126 actual-MiniLM conversation checks (81 supported / 38 unsupported /
7 controls), 14 desktop/phone layouts, 14 expanded-chat flows, 24 full-answer UI
checks, 42 longer layout combinations and 98 sends all pass. Prior failing
integration reports and the source-oracle audit are preserved. The model weights
and fitting data are unchanged; this is bounded acceptance, not blind accuracy.

The existing approved MiniLM assets were packaged into `guides/local-assistant/intent/`;
no new downloads or installs occurred. The main profile now identifies the
combined bundle and discloses ~186 MB total, including the older wording model.
Old cached-bundle consent cannot authorize the new files. Metadata caching keeps
previously visited chat usable offline. All 804 cache-manifest asset hashes match.
The new code, package, consent profile and metadata remain local/uncommitted;
no FTP upload or push was performed for this request.


### Unified model setup and Trinsic passive-role repair, later on 24 October

Canonical development command is now `python3 guides/local-assistant/setup.py --download`.
It handles both pinned models and shared runtime, reuses the verified head, stages
packages before final bundle metadata, and supports offline `--verify-only` with
no raw prototype cache or Node prerequisite. Twelve Python tests and actual CLI
reuse/verification modes pass without downloads or model-byte changes. Read the
main/intent model READMEs for rebuild options and legacy helper boundaries.

Shared grammar and dialogue now preserve passive victim/perpetrator roles and
current event context: “who got murdered/killed?” names Inamo and Christopher;
“who is the murderer?” separately names Hook and Forskis. Authorized role name
lines keep outside-research attribution and the full indexed quote. Natural exact
event statements establish topic only, not player progress. Unknown/ambiguous
newer subjects block stale selected-page answers until an explicit topic recovery.

`model-setup-story-final-acceptance.json` consolidates 1,292 standalone tests,
49 unchanged source-reviewed UI inputs, eight extra unknown-identity UI guards,
the existing 126 all-game checks, 12 setup tests and current cache verification.
The final native-MiniLM batch uses the established wording-worker fixture; a fresh
actual in-app page also verifies the reported exchange with real workers. Facts,
head/training data, saved-game formats and UI layout were unchanged. No commits,
pushes or FTP publication; refresh the local guide to load the new script release.
# Structured knowledge rollout — active, 2026-10-24

The current goal is substantial source-backed knowledge and connected conversations across all six games, with separate game experts. Do not mark it complete from data counts or a small browser probe. Runtime acceptance is still in progress.

All six game experts completed manifests, explicit evidence links, fixed dialogue cases and source audits under `guides/data/assistant/knowledge/`, `guides/tests/assistant/knowledge/` and `docs/assistant-knowledge/`. Independent semantic reviewers checked the original 834 questions against their sources without reading chatbot outputs, corrected invalid method/motive oracles, added complete evidence and preserved source-gap questions. Current scope: 614 focused facts, 271 directed links, 851 turns. `knowledge-data-coverage-20261024.json` records data coverage, not runtime accuracy.

`knowledge.js` compiles facets only against authorized source witnesses or separately labeled primary research, supports reviewed one-level multi-fact compositions, maintains typed graph salience and invalidates unknown subjects. `guide-assistant.js` loads this for all six factories. The original source engine retains progress/actions/choices; focused records do not become arbitrary new state predicates. MiniLM reuses existing approved weights for both classification and local passage retrieval. The worker has a bounded memory-only query-vector cache and a cancellable `encode` API.

Static fact vectors are generated by `build-knowledge-embeddings.py`; they must match every fact document and the pinned encoder. `--verify-only` needs no inference. The optional query-vector map under ignored prototype results is a development replay aid. `knowledge-corpus-replay.mjs` refuses to accept missing exact inputs, changed sources or failed fixed oracles. Fill its missing-query list with the generator's `--queries-only --query-texts` mode. Reports are immutable per tag. The native UI harness is `knowledge-browser.py`; it supports game/dialogue selection and independent source alternatives. UI citations cannot prove internal fact IDs, so both evidence types are required.

Verification so far: earlier source/runtime contracts passed 1304/1304; the new source/support contracts passed 17/17; model setup passed 12/12 and actual bundle verification reported zero downloads/writes. Native UI probe `knowledge-browser-native-02.json` passed 58/61 across all seven surfaces, with all isolation boundaries passing. Targeted StarCraft definition → Java → client-download native sequence passed 5/5. Later runtime fixes still require final replay and browser verification. Full-corpus diagnostics preserve genuine failures; they are not final acceptance. The goal remains active, and no new commit, push or FTP deployment has been performed for this rollout.



## Structured knowledge checkpoint and approved reader experiment — 24 October 2026

The all-six-game goal remains active. The six dedicated source manifests contain 614 reviewed focused facts and 271 directed links, supplementing the existing source engine. All production guide adapters load the shared knowledge router. `answerRelations` are reviewed capabilities, separate from facet names and retrieval aliases. Sources, editions, objective-versus-procedure distinctions, exact numbers and player-state boundaries still constrain answers. See `docs/assistant-knowledge/README.md` and each game audit for schema and source details.

Latest shared changes use `knowledge-graph.js` for finite direct predicate lookup with typed endpoints, all required evidence and shared scope constraints. Location replies keep the object as the topic for it/them; person questions may focus the named provider. Reordered compound names are distinguished from shorter shared labels. Unknown names cannot inherit a known place/person. Actual identity capabilities are distinct from incidental person mentions. Explicit software version, requirement, combat-strength and character-release questions precede unsuitable classifier proposals. U5's HMS Cape location composes an explicitly reviewed route excerpt with its room/drawers excerpt. Seven named U5 teachers/givers were corrected from generic topic kind to NPC using the guide/atlas; uncertain names were not merged.

Current evidence is **not acceptance**: `knowledge-corpus-replay-semantic-slots-02` passes 702/851 with 149 failures, zero incomplete inputs, stable sources and all 175 negative cases passing. The native production UI run `knowledge-blind-browser-native-05.json` passes 52/96, with all 22 negative cases and every isolation boundary passing. That corpus has already informed diagnosis; author a new independent source-first holdout before claiming generalization. The latest Node contract run passes 1,359/1,359; model setup's 12 tests and offline-manifest tool's four tests pass. Contract counts do not erase the remaining conversation failures. Reviewable checkpoint: `guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261024.json`.

The user explicitly approved downloading exactly the pinned MobileBERT source-reader model/tokenizers, 27,848,554 bytes, for a local experiment. All six files are downloaded, verified, ignored under `guides/tests/assistant/intent-prototype/source-reader/assets/`, and disconnected from production. No packages were installed. Native WASM loading/inference works and the two smoke cases pass. However, an ungated five-candidate passage diagnostic across 850/851 old replay turns selected the expected top fact only 400/675 times when forced, versus cosine's 568/675. Tight abstention thresholds removed most useful answers. One exact context-expanded query was missing from the old cache; it was reported, not substituted. No complete-chat improvement is claimed. **Do not integrate this reader based on these results.** Detailed limits, provenance and reports are in `docs/assistant-knowledge/source-reader-experiment.md` and `guides/tests/assistant/evidence/source-reader-native-experiment-20261024.json`. It is deliberately absent from the production model setup script and bundle.

Continue improving source coverage, typed relationship indexing and conversation subject handling using the current models. Preserve prior failures and the source-first test oracles. Do not mark the goal complete from source counts, contract tests or a small probe. No commit, push or FTP upload occurred in this checkpoint; earlier publication authority is historical. The user's preview server on port 8769 remains running and their tabs/chat were not reset. Temporary test servers and browsers closed themselves. Regenerate the guide offline manifest after any further public asset changes.

## Owner constraint — 25 October 2026

The owner is going to sleep and explicitly ruled out updating models or getting a new one. **Do not download, replace, retrain, upgrade or promote a model/head.** Earlier one-time download approvals do not authorize further model changes. Continue only ordinary chat/source-data work with the existing approved production models. Model experiments completed before this instruction remain unintegrated evidence; do not restart them or ask for another model while the instruction stands. Read-only inference with the existing assets may verify chat changes. No FTP upload, commit, push or scheduled automation is authorized by this constraint.

The structured-knowledge goal is still active. It must not be marked complete merely because the source index or contract suites pass: observed broad conversations still miss supported answers. The latest source index is 674 facts / 325 directed links across all six games, with matching static fact catalogs and zero compiler issues (`knowledge-data-coverage-20261025-02.json`). Five focused omissions found by independent source review were added; most remaining misses have their source already indexed. The 29-field head was rejected after end-to-end regression (750 baseline versus 712/747 experimental policies); it was not promoted. MobileBERT and the existing SmolLM closed-choice selector were also unpromoted. Preserve all failed artifacts and original frozen oracles.

The current deterministic work distinguishes directed clue destinations from a sender's location and gives an active explicitly named test precedence over an incident ritual sharing a broad quest type. A matching entity's reviewed name also participates in lexical candidate scoring. The Fellowship-member fallback now refreshes its explanation intent instead of retaining a stale story intent; the 1,058-case English suite is green again. Limited hypothetical item-property questions quote a sourced effect/outcome without asserting ownership or advancing progress. General hypothetical progress and current saved-game claims remain guarded.

### Verified checkpoint after the model-change prohibition

`guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025.json` is the reproducible current checkpoint: 674 facts/325 links, zero compilation issues; 1,396/1,396 Node contracts; 1,058/1,058 English checks; 203/203 original regressions. The fixed learned-intent replay remains 750/851 with 175/175 negative boundaries and no missing exact query vectors. Native production UI runs are 78/96 (`native-17`) and 36/76 (`fresh-20261025-06`), with all22/all19 negative boundaries and all source/network/storage/native-encoder boundaries passing. The first independent76-turn run was33/76; later runs are observed regressions, never new holdouts. The separate full-claim adjudication covers the earlier35/76 run and found17 complete supported positives outof57. Do not inflate that result with citations or contract counts.

All818 offline assets and the version digest match; experiment assets remain excluded. The production SmolLM profile, MiniLM profile and original12-label head hashes are unchanged. No FTP upload, commit or push occurred. `conversation-state-audit.md` records exact native traces for20 sampled turns; model replacement is neither authorized nor an answer to those concrete lookup defects. Next work must remain within deterministic source/role/context handling and retain source, edition, number, material and saved-state boundaries.

### Later source-rule and independent-conversation checkpoint

`guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-02.json` supersedes the runtime numbers above. See `docs/assistant-knowledge/source-rules-20261025.md` for the bounded deterministic implementation and remaining gaps. Source counts remain 674/325 with zero issues; all encoded fact documents still match. Mariah/tablet ownership and Addom/Brion role bindings changed metadata only. New shared `recorded-conditions.js` and `requested-measurements.js` preserve explicit proof and measurement fields. No model, profile, head, setup or weight change is authorized or occurred.

Current verification: 1544/1544 recursive Node contract/policy tests (broader scope than the earlier root-only total), English 1058/1058, original 203/203, replay 751/851 with all 175 negatives and zero missing inputs. Native observed 96 = 81/96 and observed 76 = 43/76, with all 22/all 19 negatives and browser isolation checks passing. Compound-locator verifier correction accounts for one separately audited verifier-only pass; do not count it as a new answer. All 820 offline assets, including both new shared modules, and the version digest match.

Two source-first author agents froze another 48 turns, without consulting runtime answers or previous cases. Individual first executions are retained as `knowledge-blind-browser-independent-{ultima,other}-20261025-01.json`; strict 18/48 included 10/12 negative successes. Complete-claim adjudication (`knowledge-independent-adjudication-20261025.json`) found 10 complete useful positives out of 36, including two strict citation/format differences, and 3 wrong-subject/field positives. Age and ounces failures were fixed with a shared measurement guard; the unchanged concatenated cases now score 20/48 with all 12 negatives. Positive rendered replies remain unchanged, so the 10/36 useful-answer limit still applies. Do not report 20 complete positive answers or call these cases unseen again.

Next work: resolve subject/context loss from natural preambles and compounds, explicit answer-role selection, conditional software requirements and field-specific follow-ups. Preserve source/edition/number/material/state boundaries and rollback. No further model work, FTP upload, commit, push or new automation. Goal remains active and incomplete; source counts and contracts are insufficient acceptance evidence.

### Later context and source-role checkpoint

`guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-03.json` supersedes the previous runtime checkpoint. Implementation and limits are in `docs/assistant-knowledge/source-context-frame-20261025.md`. All 674 facts still match their static encoded documents; there are now 326 directed links and zero compiler issues. The new link is COM access → COM room, proved by the complete existing access witness. Pistol storage and Grapple inventory have reviewed field bindings/capabilities. No model, profile, head, setup or weight update occurred. One additional exact test query was encoded using the existing pinned local encoder into ignored test-cache files; it generated zero fact files and blocked external requests.

The shared source frame handles bounded topical single-question preambles and explicit subject precedence. Context words are removed only as complete grammatical wrappers; object modifiers remain evidence requirements. Unsupported material/quantity scope survives implicit pronouns, including a new named object, while a fresh named request can recover. Edition remains intentional game/session scope. An unresolved preamble reference cannot select a different quest's generic rune. The final Toronto access → Pistol/Canisters → wall cabinet sequence is verified without asserting entry or ownership. The generic “who has to be in the party” graph slot selects Khunag from the recorded requirement. Reports, hypothetical progression, current-save uncertainty and compound cancellation/rollback remain guarded.

Verification: 1,553/1,553 recursive Node tests, English 1,058/1,058, original 203/203. Replay remains 751/851 with all 175 negatives and zero missing inputs. Final native observed reports are `native-26` (81/96), `fresh-20261025-15` (43/76) and `independent-all-20261025-06` (25/48), with all 22/19/12 negative boundaries and isolation checks. The latest 48-turn complete-claim review is `knowledge-independent-adjudication-20261025-02.json`: 14/36 complete useful positive answers, 22 still incomplete; the three previous wrong-field positives are now correct or withheld. Do not report 25 useful positives, unseen evaluation, or zero errors outside that reviewed set. Exact locator differences remain failures. All 820 offline assets/version match; frozen corpora and failed intermediate reports are preserved.

Next source work should address the remaining scene/quest, actor/object and conditional-property gaps rather than add aliases for every failed question. Grapple's conditional handover/inventory follow-up, Sherry's control/mouse-hole sequence, Trinsic interview/password clauses, wisp/emp transaction roles, academy/ship contextual steps and SCHNAIL conditional installation/network intervals remain incomplete. Goal stays active. Model freeze and no-publication constraints remain unchanged; user server/tabs were not reset.

### Later source-role continuity checkpoint

`guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-04.json` is current. Implementation, source corrections and remaining gaps are in `docs/assistant-knowledge/source-role-continuity-20261025.md`. The index contains 674 facts, 334 directed links and eight exact authorized source-container contexts with zero compiler issues. Actor movement, control, parent references, continuation contacts, interviews, bribe/requested-item roles and bounded static software requirements now have separate source paths. Editorial context supplies no physical containment, progression or current save state. A reviewed communication-phase guard bypass involving an additional conditional preamble is fixed and tested.

All models, head, profiles, tokenizer, setup and weights remain unchanged; no downloads or installations. The existing pinned encoder reused 673 fact-document vectors and refreshed only the Finnigan source document, which now quotes the original complete copy-protection quiz/password witness rather than an adapter summary. Three exact inputs were added to ignored replay caches, using the same encoder. Trinsic citations now identify the actual `.content` field. Frozen source/phrase oracles remain untouched: the 851-turn replay retains two older provenance expectations as failures, while a Lord Michael dialogue request newly passes. Its final score is 750/851, all175 negatives, zero missing inputs and stable sources.

Final verification: 1,597/1,597 recursive Node tests, English1,058/1,058, original203/203 with tracked results restored byte for byte; three embedding-reuse, four citation-verifier and four offline-manifest Python tests. Native production reports are `native-28` (81/96), `fresh-20261025-17` (43/76) and `independent-all-20261025-08` (38/48), with all22/19/12 negatives and isolation checks passing. An intermediate Sherry actor/item regression in `native-27` is retained and repaired; the final original96 returns to81/96. All822 offline assets and version hashes match. Watched production sources still match the final browser reports.

Independent complete-claim review `knowledge-independent-adjudication-20261025-03.json` finds27/36 useful positive claims, including one explicitly qualified operational equivalent: the literal Ariana PERMISSION/YES helper conveys returning to her, but still fails the frozen exact-step source/phrase check. Excluding that qualified alternative gives26/36. Nine source-answerable positives remain incomplete; no wrong-subject/field positives were found in this limited review. The newer48 is an observed regression set, not an unseen holdout. One newly strict-passing Trinsic crime-scene citation was already a useful answer before this checkpoint, so it is not an additional useful claim.

Next work: bounded reference-only positional/readiness preambles for the Academy; source-grounded disintegrator and exit follow-ups; same-item Ship Orb location composition using both the helm-cabin instruction and independently authored Wrecked Ship location; HMS Cape locked-door preamble; Khunag's compound recruitment; and the Trinsic permission/password compound. Keep all source, edition, quantity, modifier, unknown-reference, cancellation and save-state guards. The goal is active and incomplete; broader corpora retain meaningful failures. No FTP, commit, push, automation or user-tab change occurred. Do not start model work.

### Later read-only preamble and shard continuity checkpoint

`guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-05.json` is current. Implementation and limitations are in `docs/assistant-knowledge/source-preambles-20261025.md`. The source index remains674 facts/334 links, with11 validated editorial contexts and zero compiler issues. All674 encoded fact documents remain unchanged. Models, head, profiles, tokenizer, setup and weights remain frozen; no model downloads or installations. One exact missing test input was encoded with the existing pinned local model into ignored replay caches (986 total), with zero fact-document encodings.

Positional/readiness reports can now frame factual source questions without being recorded as progress. The original report parse is preserved. Difficulty wrappers and subject-only topic fragments retain their material scope; explicit requested fields remain questions. A failed `how` request cannot revive an older scene. `next` and `now` in a topic require proof. Synchronous positional failures do not dispatch the preamble to the source engine. The Ship Orb location reply quotes both its exact helm-cabin instruction and separately authored same-item Wrecked Ship location, preserving both citations. The following purpose question retains the item. HMS Cape entrance → doors → drawer search now works. All-or-none source replies retain cancellation, rollback and save-state guards.

A broader audit found an actual wrong-subject answer in the older96: after Faulinei, a shard-use question selected Hatred/Astaroth. Three exact Shadowlord source contexts now keep the matching shard; Hatred and Cowardice route facts no longer claim a shard-use capability merely because their routes use other spells/equipment. All three rituals are checked without an encoder/classifier, including unknown-subject invalidation. An intermediate overbroad purpose pattern caused an Ariana regression in `native-29`; that report is retained. The final purpose pattern is bounded, the permission paraphrases require explicit source proof, and Ariana's full blocker → Anya → return sequence is restored byte for byte versus `native-28`.

Verification:1,623/1,623 recursive Node tests; English1,058/1,058; original203/203 with tracked results restored byte for byte. Cached replay752/851, all175 negatives, no missing inputs and stable sources; two improved answers now give the Hatred/Cowardice timing rather than acquisition routes. Final native reports: `native-30`82/96, `fresh-20261025-19`43/76, `independent-all-20261025-10`43/48. All22/19/12 negative boundaries and all browser isolation checks pass. Watched production source hashes still match. All824 offline assets and the version digest match; experimental/test assets remain excluded.

`knowledge-independent-adjudication-20261025-04.json` independently reviews five new complete positive claims: Cape doors, Academy start, disintegrator wall advice, Ship Orb helm location and ship-restoration purpose. The total is32/36 useful positive claims including the previously qualified Ariana helper operational equivalent (31/36 excluding it), with four source-answerable positives still incomplete. Strict43/48 includes12 negative boundaries and retains the Ariana exact-source/phrase failure. No previously useful answer regressed; the Academy exit remains withheld with changed non-answer wording. These are observed regression cases, not unseen evaluation or broad zero-error evidence.

Next work must keep the full six-game scope. Four positives remain in the reviewed48: Trinsic permission/password compound, deferred Academy exit to Zaratan, hold barrels/potions and Khunag recruitment/dialogue. Broader corpora retain14 native96 failures,33 fresh76 failures and99 strict cached851 failures. Prioritize actual wrong-phase answers (Swamp Cave preparation selecting later loot, Black Sword forging selecting its finishing use, Manrel acquisition assuming possession), then directed conversion/escort/return roles and source-present factual comparisons/compounds. At least14 cached failures are useful answers with strict metadata differences; six Al-Qadim objective-only limitations remain appropriate. Preserve those distinctions and every frozen oracle. Both previous and current goal turns made progress; the goal remains active and incomplete. No publication, commit, automation or user-tab change occurred.


### Later procedural action/object checkpoint

`guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-06.json` is current. See `docs/assistant-knowledge/procedural-proof-20261025.md`, `ultima6-procedure-scope.md` and `guides/tests/assistant/ultima7-procedure-scope-review.md` for source evidence and limits. Counts:674 facts,338 directed links,16 exact editorial contexts, zero compiler issues. All674 encoded documents and protected source fields remain unchanged; catalog metadata hashes only were refreshed. No model or query-vector work occurred; cache count remains986. Models, profiles, head, setup, tokenizer and weights remain frozen.

Four actual wrong answers are repaired in the unchanged851 corpus: Manrel key acquisition now asks Manrel for KEY and the flowers vow; Honor return quotes SUMM/Moonstone/return-to-pedestal rather than an earlier promise; Swamp Cave preparation equips every companion with boots and spells rather than returning treasure; Black Sword forge heats/hammers/binds rather than invoking the finished weapon. Metadata separates key/tomb/rune/pedestal/cave and U7 forging, Arcadion release, Ether Gem use, artifact lead, Talismans and later Courage use.

The finite procedural reader checks literal preparation/crafting/return/delivery instructions. Delivery is separate from return; a promise does not prove return. Causative software/income idioms and intransitive navigation remain outside its grammar. Actually/really framing does not bypass it. Candidate phase proof must belong to its canonical target or an exact directly authored single-fact target edge; a broad method/use binding cannot transfer sword creation to Ether Gem/Arcadion or rune return to Moonstone. Procedural pronouns require grounding, unsupported edition scope persists, and failed material modifiers survive pronouns. Name matching retains action words and ignores WH template words in reordered matching: key-use aliases cannot answer acquisition, and what-to-choose cannot override the active map.

Verification:1,661/1,661 Node contracts. Final cached replay `procedural-proof-20261025-04` passes756/851 versus752, all175 negatives, zero missing inputs and stable sources, with no prior strict pass lost. Final native reports `native-33`, `fresh-20261025-22`, `independent-all-20261025-13` retain82/96,43/76 and43/48; all22/19/12 negatives and isolation checks pass. Intermediate delivery/income and map-context regressions are retained and repaired. Legacy English1,058/1,058 and original203/203 are reused: engine/language code did not change this turn. All825 offline assets/version hashes match, test/experiment assets stay excluded and watched production hashes match final reports.

Review05 verifies all36 positive replies/citations in the observed48 unchanged from review04:32/36 useful claims including the qualified Ariana helper (31/36 without it), four still incomplete. One installed-Java-build question now clarifies rather than declining; its boundary holds, but current-machine unknown-state wording still needs refinement. Counts are not broad acceptance.

Continue the full goal. Four reviewed48 gaps remain: Trinsic permission/password, deferred Academy exit, hold barrels/potions, Khunag recruitment/dialogue. Broader native96 retains14 failures, fresh76 retains33 and cached851 retains95 strict failures including known metadata/citation differences. Next priorities: direct conversion/escort/actor roles, factual properties/comparisons before recommendation fallback, contextual compounds, and additional procedural forms/passive or delegated instructions. Preserve objective-only limitations and every frozen oracle. Both goal turns made progress; goal remains active and incomplete. No installations/downloads, FTP, commit, push, automation or user-tab change occurred.


### Source transition checkpoint (models remain frozen)

`guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-07.json` is current; implementation and limits are in `docs/assistant-knowledge/source-transitions-20261025.md`. Counts:674 facts,339 directed links,16 editorial contexts, compiler0. Protected U7 source/document fields remain unchanged. The user's sleep constraint remains binding: no model updates/replacements/new models/training/profile/head/setup changes/downloads/installations. All674 document vectors and986 cached query vectors are reused; metadata-hash refresh only. No FTP/commit/push/automation/user-tab changes.

The four prior incomplete source-answerable conversations are repaired generically: Trinsic authorization/report/quiz/password compound; grounded deferred Academy exit; Hold breakable barrels for potions; Khunag recruitment plus literal dialogue assertion. New bounded phase/departure/method readers preserve unknown modifiers, quantities, source/edition restrictions, atomic compounds and no state effects. A destination referenced as there cannot silently reuse the previous scene. Review caught arbitrary AFTER nouns (escape/password) borrowing unrelated parent words; the action/nominal phase check now rejects them. See new transition/resource graph tests and U7 literal report-to metadata test.

Final validation:1,701/1,701 contracts (`/tmp/knowledge-contracts-20261025-27.log`),11 Python checks, rerun English1,058/1,058 and original203/203 with tracked original results restored. All827 offline assets/version match, including both new shared modules; tests/experiments excluded. Cached replay `source-transitions-20261025-01`756/851 unchanged, all175 boundaries, zero missing exact queries, no previous strict pass lost. Browser `native-34`82/96, `fresh-20261025-23`43/76, `independent-all-20261025-14`47/48 (previous43/48); all22/19/12 boundaries and source/network/storage/isolation checks pass. All91 watched runtime hashes still current. Full-claim review06 verifies all48 turns: exactly four changed complete positives, other44 replies/citations identical;36/36 useful positives including qualified Ariana alternative,35/36 without it. Strict47/48 keeps that unchanged exact-source/phrase failure. Observed sets remain observed, every frozen oracle hash unchanged.

Goal active/incomplete; both consecutive goal turns made progress, no blocker. The larger native96 still has14 failures, fresh76 has33, cached851 has95 including known provenance differences. Continue directed conversion/escort/actor roles, factual properties/comparisons before consultation and more procedural/compound forms. Refine current-machine unknown-state wording. Do not mistake contract counts or this observed48 for full six-game acceptance.


### Actor/object/phase checkpoint — models still frozen

`guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-08.json` is current. Implementation/limits: `docs/assistant-knowledge/actor-phases-20261025.md`; data coverage09; changed-useful-claim review `knowledge-actor-phase-adjudication-20261025.json`; full48 review07. Counts674 facts,348 directed links,18 editorial contexts, compiler0. All674 encoded source documents remain byte-equivalent; metadata catalog hashes only refreshed. Query cache986 unchanged, no inference-generated vectors. Production profiles/head/model/setup/assets remain frozen; no downloads/installations/FTP/commit/push/automation/user-tab changes.

Source roles and shared guards now cover converter/input/output, raw material, song teacher/performance recipient, escort/rescue subjects, artifact informant, passive crafting, transport/concealment and release. Pistol pickup is separate from hiding it past security. Bare person acquisition cannot return item rewards; recruitment still works. Provider procedures preserve genuine permission, rune, map-piece, signature, key, ration and blessing paths while requiring the actual actor, signer and field modifiers. Miranda/Cove/Lock Lake/forged signatures cannot borrow Heather's signature. What a person requires differs from where they are required. Resultative get-him-released preserves Weston's appeal and Arcadion's mirror mechanism; objective-only captive release remains withheld. Exact new source contexts cover Sacrifice and Old Dungeon; explicit alternate Reef naming switches scope correctly. U7 virtue-quest edition tags use the literal Forge of Virtue tab/heading. No question-shaped data aliases or model training.

Final verification:1,735/1,735 recursive assistant Node contracts (`/tmp/knowledge-contracts-20261025-34.log`),11 Python citation/offline/vector reuse checks, git diff check clean. Last verified English1,058/1,058 and original203/203 reused because engine/language/preamble paths are unchanged this turn; their source hashes compared. All827 offline assets and version match. Cached `actor-phases-20261025-06`757/851 versus756, all175 boundaries, zero missing exact inputs and no prior strict pass lost. Final native40 is85/96 (previous82), fresh-20261025-29 is48/76 (previous43), independent-all-20261025-20 retains47/48. All22/19/12 boundaries and all source/network/storage/isolation checks pass, and all91 watched runtime source hashes still match. Every frozen oracle hash unchanged. All intermediate failures retained; acquisition/permission, actor ownership, requirement direction, network conditions, release and direct item-purpose regressions repaired before checkpoint.

Full48 replies/citations/strict verdicts identical to prior reviewed baseline:36/36 useful positives including qualified Ariana helper (35/36 without it), all12 boundaries. All11 changed native96/observed76 replies reviewed:9 complete source-supported claims,2 still incomplete (chant and plural carry). New complete Gwenno/Selganor compound retains exact-parent-citation strict failure while quoting both authorized child steps; no citation equivalence/oracle edit. No lost prior strict pass in any final suite. These are observed sets, not unseen evaluation or exhaustive acceptance.

Goal active/incomplete. Previous and current turns made concrete progress; no blocker. Remaining broader gaps: Compassion permission/return/chant continuity, Once-inside Pistol+Canisters/plural transport, literal comparison/property assertions before consultation, BWAPI identity/version/documentation follow-ups, trainer/use/combat details and additional procedural forms. Native96 retains11 strict failures, observed76 retains28, cached851 retains94 including provenance differences. Keep full six-game scope, source/object/edition/material/state guards, objective-only limits and all frozen oracles. No model or deployment work is authorized.


### Factual property and continuity checkpoint — models frozen

Current checkpoint is `guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-09.json`; implementation/limits are in `docs/assistant-knowledge/property-continuity-20261025.md`. Coverage10:674 facts,353 directed links,18 editorial contexts, compiler0. Albion adds explicit Canisters and Pistol + Canisters group metadata; StarCraft adds literal topic labels and capabilities. Every protected fact document/vector remains unchanged; manifest hash refresh only. Existing query cache986 unchanged. The user's sleep constraint prohibits model/profile/head/setup/assets changes, new models, training, downloads and installations. No FTP/commit/push/automation/user-tab actions occurred.

Shared source comparisons precede consultation and require full literal capabilities: reciprocal attack profiles, a single two-term use contrast, tool-specific runtime contrast, or complete-circle rear coverage. Naming wrappers retain the canonical term. Permission authority, conditional return recipient and shrine word remain separate roles. The Compassion procedure now carries Anya → Ariana → MU correctly, and asking who gives permission still identifies Anya after returning to Ariana. A bundle requires the exact complete components and all authored proofs; grounded plural transport retains the whole group. Once-inside scope uses a unique direct place relation actually returned for the active subject, with no player-entry claim. Tool authorship retains its tool owner for one direct framework-documentation dependency. Failed compounds preserve complete prior proof memory; single unknown positional subjects invalidate stale topics.

Review caught and repaired environmental-damage grammar hijacking, newly named ammunition receiving current-inventory answers, stale positional topics after atomic declines, and infinitive have-to requirements being mistaken for possession counts. Full recursive contracts1,779/1,779 (`/tmp/knowledge-contracts-20261025-37.log`), rerun English1,058/1,058, original203/203 with tracked results restored, and Python11 pass. All829 offline hashes/version match; tests/experiments excluded. Cached `property-continuity-20261025-03` retains757/851, all175 boundaries, zero missing exact inputs, identical strict statuses to prior checkpoint. Final native42 passes90/96 (previous85), fresh31 passes55/76 (previous48), independent22 retains47/48. All22/19/12 boundaries and every source/storage/network/isolation check pass; all93 watched source hashes remain current. Frozen oracle/model hashes unchanged.

Changed-turn review `knowledge-property-continuity-adjudication-20261025.json` examines every14 changed complete reply/citation/resource/witness:13 complete supported positive claims,12 gaining strict passes;1 complete Compassion permission answer retains the exact-parent citation failure while citing supporting child steps;1 safe Johne state boundary. No changed incomplete/wrong-subject answer. Other158 turns unchanged and outside that qualitative review. Full48 review08 compares every complete response/citation with prior review07 and finds all identical:36/36 useful positives including qualified Ariana helper,35/36 without it, all12 boundaries. Strict47/48 retains the alternative's failure. Observed sets remain observed and do not establish exhaustive acceptance.

Goal active/incomplete, consecutive turns show progress and no blocker. Remaining strict failures: native96 six, observed76 twenty-one, cached851 ninety-four including provenance/wording differences. Continue named holders, trainers, charge limits and combat-property roles; U5 travel/recruitment/shrine rituals; U7 daemon/gem and mana-on-hit; StarCraft factual comparison, offline and setup conversations. Preserve all literal proof, complete bundle, atomic compound, source/edition/material/quantity/state guards and objective-only limits. Do not update models or publish.


### Capability and participant checkpoint — models remain frozen

Current checkpoint: `guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-10.json`. Implementation/limits: `docs/assistant-knowledge/capability-roles-20261025.md`. Coverage11:674 facts,357 directed links,19 editorial contexts, compiler0. U7 adds direct vessel/instrument roles and literal Courage proof scope; Al-Qadim adds source-only Oasis context and boar location. Protected fact fields/documents remain unchanged. All674 static source vectors and986 ignored cached queries are reused, with manifest-hash refresh only. No model/profile/head/setup/assets changes, downloads, installations, training, FTP, commit, push, automation or user-tab changes.

Shared literal software capability readers now cover explicit comparison, unconditional offline operation, exact conditional executable detection, and native edition compatibility. A validated complete proof can establish its current request's vocabulary, while independent context and inherited restrictions remain guarded. An already reviewed contained excerpt can beat a containing same-record excerpt; no witness is trimmed at runtime. Resource limits require consumption and depletion evidence. A grounded repeated item reference comes only from complete returned proof and explicit binding. Mana trigger answers quote the recorded on-hit effect without inventing an exclusive condition, negative carrying effect or exact drain amount.

Direct graph readers separate typed holder, binding actor, vessel and requested entry dependency. Literal type, scene and complete directed proofs are required. The full forging procedure resolves its unique named free-actor slot to the later typed binding action for the same artifact; marker identity remains separate corroboration and edition eligibility is unchanged. Khunag entry dependency requires his actual direct Kenget gate, not another requirement or current party status. Trainer locations preserve eligibility. Named option evaluations use that named option's own verified consultation trait across all six catalogs; Jaana's early-magic advice now retains her for the location follow-up.

Delegated source answers establish canonical references only from whole authorized records actually returned, with no state changes/actions. Curated proof IDs require actual complete witnesses and source IDs. A source record can establish its own source anchor without becoming a fabricated focused fact. Successful properties/criteria no longer become unmet material constraints on a follow-up; source/edition scope persists and unsupported scopes retain their guarded path.

Independent review caught uppercase unknown conditional suffixes escaping to partial legacy-engine answers. Recognized capability requests now fail closed in both APIs; paired Mars/Pandora/SNES/StarCraftII/Uranium/CurrentSave probes verify no delegated partial answer. Real-sequence testing caught delegated Magebane-location grounding and a Jaana fulfilled-criterion regression; both are repaired, with all intermediate evidence retained. Static link-count/context contracts were updated for the reviewed new schema entries; every frozen conversation oracle hash is unchanged.

Final checks:1,833/1,833 recursive Node contracts (`/tmp/knowledge-contracts-20261025-41.log`),11 Python checks, clean diff check. Source engine and eight parsing dependencies are hash-identical to prior English1,058/original203 baselines, reused with explicit qualification. Cached `capability-roles-20261025-04` retains757/851, identical strict statuses, all175 negative boundaries and zero missing exact inputs. Final native46=95/96 (previous90), fresh35=61/76 (previous55), independent26=47/48. All22/19/12 boundaries and all source/storage/network/isolation checks pass; all95 watched files per report (97-file union) still match. All831 offline asset hashes/version match; tests/experiments excluded. Production model/oracle hashes unchanged.

Final changed-useful-claim review `knowledge-capability-role-adjudication-20261025-02.json` reviews all13 changed full responses against full witnesses:12 complete useful positives (11 new strict passes,1 Jaana exact-source failure),1 safe boundary, zero unavailable/incomplete asserted positives. The Magebane response is the recorded hit trigger, with no broader carrying/exclusivity assertion. Other207 turns remain outside that delta qualitative review. Full48 review09 compares every complete response/citation/expected useful claim with prior review08 and finds all identical:36 useful positives including qualified Ariana alternative,35 excluding it,12 boundaries; strict47/48 retains its alternative failure. No unseen or exhaustive understanding claim.

Goal active/incomplete; previous/current turns both progress, no blocker. Native96's only remaining strict miss is training citation provenance, with Fasiir/useful answer present. Observed76 retains15 strict failures: six source-present unanswered conversations (U5 travel-topic framing, strongest-mage descriptor, shrine cycles/guidance compound, eight-shrine reward; U6 passage-question attribution; Oasis boar combat field) plus nine citation/wording differences. Continue those real conversation gaps, then audit broader851 failures and all-game coverage. The boar objective still cannot become a combat procedure; use the exact same canonical base bestiary combat record with independently sourced place scope. Keep all constraints, literal proof, atomicity and objective-only limits. Do not resume model or publication work.


### Sequence and source-scope checkpoint11 — models remain frozen

Current: `guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-11.json`. Implementation and limits: `docs/assistant-knowledge/sequence-scope-20261025.md`. Coverage12: 674 facts, 357 directed links, 19 editorial contexts, zero compiler issues. New source helpers handle literal ordered action quantity/next destination, completion rewards, corrected descriptive-person compounds, exact QA-series attribution, same-canonical-actor combat/location context and software fields from complete returned procedures. Topic markers preserve the full named target. Failed compounds roll back prior complete focus; unsupported source scopes persist through pronouns. Full original proofs and all source/edition/material/quantity/state guards remain required.

All six prior source-present misses in observed76 now supply complete useful claims: Cape speed, named Johne plus reach difficulty, shrine cycles/Codex guidance, eight-shrine VERAMOCOR reward, passage Wizard answer and Oasis boar tactics/location. Changed-claim review `knowledge-sequence-scope-adjudication-20261025.json` retains every before/after reply and full source record: six useful positives, five strict gains, one boar parent-versus-child citation-only failure; other214 whole rows unchanged. Full48 review10 confirms all48 whole rows identical to prior review09, retaining36 useful positives including qualified Ariana alternative,35 excluding it,12 boundaries and strict47/48.

Final verification: 1,878/1,878 recursive Node contracts (`/tmp/knowledge-contracts-20261025-47.log`); rerun English1,058/1,058 and original203/203, with tracked original results restored; Python11 pass; clean diff check. Cached `sequence-scope-20261025-06`763/851, up six, all175 negative controls, zero missing exact inputs and no prior strict pass lost. Final native49=95/96, fresh38=66/76, independent29=47/48; all22/19/12 negative controls and isolation/source checks pass. All834 offline hashes/version and674 static documents verify. All106 watched source hashes across the four final native reports remain current. The986 cached queries, model/profile/head/setup/assets and frozen oracles remain unchanged. No encoding, training, downloads, installs, FTP, commit, push, automation or user-tab changes.

New full native run `knowledge-browser-full-corpus-sequence-scope-20261025-03.json` covers1,005 turns (851 unique game turns plus154 duplicate Al-Qadim walkthrough-panel turns), strict889/1,005, all216 negative controls and all native isolation checks. `knowledge-full-corpus-adjudication-20261025.json` consolidates three complete-reply/source reviews; all116 strict failures reviewed:46 source-present unanswered,15 wrong/incomplete fields,2 partial/qualification gaps,41 useful-claim citation/wording/disclaimer/oracle-scope differences,12 justified objective-only declines. Real response gaps:63 panel rows,60 unique game rows. Three useful-claim rows still have contradictory decline/clarify wording. Nine recovered passes separately reviewed; other880 strict passes outside full qualitative acceptance. These are observed regression corpora, not unseen evaluation.

Intermediate full02 preserved a wrong Hold-loot answer on both Al-Qadim panels despite the same889 strict score. Manual whole-claim review caught it; complete-field priority is now limited to combat, paired negative test added, and full03 restores the correct objective-only decline. All1,005 final whole turn rows match full01. Earlier artifacts and oracles remain unchanged; do not discard this regression evidence.

Goal active/incomplete; previous/current turns both progress, no blocker. Next prioritize the60 unique genuine gaps from the full review: directed actor/provider/recipient and instrument/destination roles; procedure phases (start/follow/finish/enter/escape); static property/default/caveat/omitted-comparator follow-ups; teacher/container/component/list/link types; purpose versus launch/installation and source conflict qualification. Preserve objective-only source limits and atomic compound behavior. Broader source-first conversations remain required. Do not resume model or publication work.


### Semantic-field checkpoint12 — known-case gains, fresh generalization failure

Current: `guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-12.json`; implementation/limits: `docs/assistant-knowledge/semantic-fields-20261025.md`; coverage13:674facts,359directedlinks,19contexts,compiler0. Shared phase/field readers and10literal phase-indexed facts distinguish preparation/approach/escape/start/follow/acquisition/completion. Three phase-local descriptions use original-title+clause proof. Directed readers handle training-location, buyer, scoped container contents and control method; Albion adds2containeredges/1entity and reviewed bindings/capabilities. Exact named request/price/bonus/combat fields require complete directed literal source proof, hardened against14independent unrelated/co-mentioned/negated controls. Software fields cover defaults, purpose, comparisons, type, configuration/version/destination/mode/support categories with actual returned proof and canonical owners; generic item/spell purpose remains intact. Exact hidden identifiers cannot be answered by a narrative effect.

Final known-case checks:1,958/1,958 recursive Node contracts (`/tmp/knowledge-contracts-20261025-49.log`),Python11,674staticdoc/vector verification, all836offlinehashes/version. Prior English1058 andoriginal203fullreruns reused only after8engine/parserdependency hashes match checkpoint11. Cached `semantic-fields-20261025-03`797/851,up34,zeroincomplete/missing,all175boundaries,no prior strict loss. Two newly requested exact context strings inferred using unchanged pinned encoder into ignored replaycache:988total;0sourcevectorsencoded and0model/profile/head/setup/assets changes,downloads,installs,training. Initial two incomplete replayreports retained. NoFTP/commit/push/automation/user-tab actions.

Native51=95/96,fresh40=66/76,independent31=47/48:allwhole220rows identical to checkpoint11,all22/19/12boundaries. Full `knowledge-browser-full-corpus-semantic-fields-20261025-02.json`919/1005(previous889),all216negativecontrols,no prior strict loss,allisolation/sourcechecks. All109watchedsourcefiles across finalreports remain current. Fullchanged review `knowledge-semantic-fields-adjudication-20261025.json`:41changed whole replies/citations reviewed,40complete supported positives and1heldboundary;30strictgains,10newcompletepositivesretaincitationfailures. Other964rows exactlyunchanged,notnewlyqualitativelycorrect. Repairs38priorgenuinepanelgaps=35uniquegames. Current full-failure review `knowledge-full-corpus-adjudication-20261025-02.json` covers all86failures:25genuinegaps,49usefulclaimcitation/wording/oracle differences,12correctobjective-onlydeclines. RemainingCourage-testcompletion wording stillfails despitehelper; do not claim it repaired natively. Intermediate full01=918/1005 leaked Housing ending-effect as answer to hiddenflag; generic identifier-field guard repaired it, allreports retained.

CRITICAL counterevidence: source-first fresh96 firstnative run `knowledge-blind-browser-source-first-96-20261025-01.json` strict37/96. Threepairauthored corpora and combined `knowledge-source-first-96-20261025.json` frozen unchanged (combinedSHA5cd6b923fca976dd9ae8d9023e4fe637e37aea3591ac3ecdfc0f63e9f8ae6a5b). All96whole replies/24dialogues cross-reviewed against exactoriginalsources by differentpairauthor. `knowledge-source-first96-adjudication-20261025.json`:17/72completeusefulpositives (14directanswers,3fullclaimsunderclarification),52source-presentunanswered,2wrongfields,1partial,23/24boundaries. Failedboundary asks Sceptre metal, receives truthful use-effect asanswer (no fabricatedmetal). OneBWAPIcompatibility response extra secondarycitation resolves to AntivirusBlockingSCHNAIL; primaryloadingchecksvalid. Both defects remain unresolved. Allsourceproofs exist; nooracleissues. Currentknown919score cannot substitute for this weak generalization result.

Goalactive/incomplete; prior/currentgoalturns progress,noblocker. Nextimplement shared request frame: canonicalowner, requestedfields/directrole/phase, references andexplicitconstraints BEFOREranking. Separate field/list cardinality from assertednumericvalues. Whole-witness multi-field coverage must precede per-part owner resolution, preservecompleteproof/qualifiers andatomicrollback. Apply same fieldcoverage to legacyfallback so unknownmaterial/property never returns available use-effect. Separatetopicowner fromlastanswerentity; corrections/newnamedownersclearappropriatescope. Validateactualsource-childcoordinates, notjustfile-levelwitnessmembership. Do not patch each newwording with alias/regex or keep inflatingdata as primaryrepair. Preserveallold/newfrozenoracles andmodel/publicationconstraints. Fresh96 is now observed regression evidence, not an unseen/statisticalevaluation.


## Request-field checkpoint13 — current verified state, goal still incomplete

Read `docs/assistant-knowledge/request-fields-20261025.md` and `guides/tests/assistant/evidence/knowledge-runtime-checkpoint-20261025-13.json` first. This supersedes checkpoint12 runtime state, preserving its reports. Shared syntax/typed field retrieval, exact-name identity resolution, whole compound coverage, source-container versus participant references, ordinary fallback proof/citation reconciliation and transactional precision priority now serve all six games. Data remains 674 fact documents/359 links;22 contexts,1,143 field entries (258 structured raw),179 annotated facts/433 authored fields;compiler0. All674 encoded documents/vectors reused; no model changes/downloads/installations/training. One exact test-only query inference extends ignored cache989. No FTP/commit/push.

Final verification: Node2073/2073;Python11;English1058/original203 rerun. Cached798/851 with0missing/incomplete,175negatives/no prior strictloss. Native full920/1005 versus919 with0strict/usefulclaimloss: onlyFaulineisummon changed vscheckpoint12. All216negatives held. Observed220 runs95/96+66/76+47/48;53negatives/no previous strictloss;one clearer heldnegative whole-row change. Fresh96 native54/96 versus37;all24negatives held. All96whole rows/citations identical across finaltwo frozen field runs; manual32/72 completeusefulclaims versus17,including2underclarification;39source-presentunanswered/1wrongfield remain. BWAPI unrelated secondarycitation fixed. All840offline asset hashes/versionmatch;allnative source/network/storage/serverchecks pass.

Preserve intermediate failure evidence: fieldnative01 full903/1005 (17losses) repaired by existing-precision priority and bounded rawguard reconciliation; replay01 had1missingquery/3incomplete,finalreplay02 complete. Do not present strictscore or data counts as broad goalcompletion. No production processes remain live. The status-only user reply was no-progress; this goal turn made concrete implementation and verified progress, with no blocker. Continue task/object/participant and phase bindings for genuine gaps, not per-question aliases or regexes. Do not resume model or publication work.

### In-progress argument bindings after checkpoint13

Read `docs/assistant-knowledge/argument-bindings-20261025.md`. First frozen argument reports: fresh72/96 (24negatives; no old strictloss); full920/1005 and observed208/220 ALLwhole rows exactlycheckpoint13;cached798/851 complete/no missing. Node58=2124/2124. Models+all674 document/vector payloads unchanged (catalogmanifestheader refresh only). Manualpairreviews exist for U5/U6 andU7/SC; rootAQ/Albion review/aggregate pending. Critically, manualreview caught red-lens repair missing its required keyword support despite strictpass. Root JUST fixed required proof closure in router+legacy priority and added positive/revokedsupport actualconversation test; local5/5 passes `/tmp/argument-closure-repair-03.log`. This last runtime repair has not been natively rerun; do not call checkpoint14 complete or currentfullbrowser accepted yet. No live native jobs remain. Next freeze/rerun allappropriate suites+offline hashes, review final deltas, thencheckpoint14. `subjectMode: topic` caller support and ~21 supported unanswered conversations remain. User's prime-time question received beta-after-focused-pass recommendation; no deployment/model authorization/change. Goalactive/incomplete; currentturn concreteprogress, no blocker.


## Argument-binding checkpoint14 and owner-directed beta wind-down

The final frozen build passes2,125 recursive Node checks and11 Python checks. Full native920/1,005 and observed208/220 have complete whole-row equality with checkpoint13; all216/53 unsupported controls hold. Fresh96 remains72 strict passes and24/24 unsupported controls. The final support-closure repair now displays/cites both original red-lens passages; all95 other whole replies are identical to the manually reviewed first run. Aggregate source review:51/72 useful supported answers (49 direct+2 under clarification),21 unanswered,0 partial/wrong fields in this particular fresh set. The separate full corpus retains24 genuine gaps. All841 offline entries/version and114 watched native source files verify. Coverage15:674 facts/359 links/24 contexts/1,154 typed fields/0 compiler issues; all674 document/vector payloads and frozen model/head/profile/oracles unchanged. No new inference, model changes/downloads/installations or publication in this argument pass.

The earlier in-progress paragraph is superseded by `knowledge-runtime-checkpoint-20261025-14.json`. The owner then explicitly narrowed immediate acceptance to a beta checkpoint, portable next-agent checklist and local commit. Read `docs/assistant-beta-checklist.md` for stopping criteria, all21 source-first misses and reproduction commands. Preserve the broader objective as deferred, rather than mark it achieved or continue unlimited feature work. A local commit does not authorize FTP/push. The beta record includes any current UI-smoke failures and known limits; passing contract counts alone are not beta or all-game correctness.
