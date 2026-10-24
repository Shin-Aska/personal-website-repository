# Completed campaign: extensive conversations across all guides

Requested by the owner on 23 October 2026. This replaces increasing the Ultima
VII trivia count as the immediate objective. Existing local fixes and tests remain
the starting point. The bounded campaign was completed on 24 October 2026. This document retains its
original scope, acceptance criteria and historical progress; remaining factual
knowledge boundaries are recorded separately.

## Scope

Exercise all six supported guides: Albion, Ultima V, Ultima VI, Ultima VII,
Al-Qadim, and StarCraft/BWAPI. Use the subject matter each guide actually supports;
StarCraft's technical guide needs setup and troubleshooting conversations rather
than invented campaign lore.

Build realistic conversations that move between these families:

1. People, organizations and world lore, or technical concepts where applicable.
2. Places, travel and finding a subject.
3. Quests, objectives and the context of the section open behind chat.
4. Items, spells, combat, mechanics and technical procedures.
5. Explicitly supported relationships, causes, goals and explanations.
6. Pronouns, short follow-ups, corrections and ambiguous references.
7. Topic changes, returning to an earlier subject, resets and long conversations.
8. Name spacing, capitalization, small spelling differences and genuine ambiguity.
9. Spoiler ceilings, changing help level, guide-only requests and source attribution.
10. Unknown facts, false premises, unsupported editions, conflicting sources and
    restrictions that must survive a follow-up.

The first campaign should include at least 20 meaningfully different conversations
per guide, normally 8–15 visitor turns each. Extend it when a coverage gap or a
failure warrants another branch. This is a minimum for sustained conversation
testing, not a claim to exhaust a game or a target to fill with paraphrases.

## Evidence and coverage

- Inventory existing tests and authorized knowledge first. Reuse relevant evidence
  and identify what is actually missing.
- Track coverage by game, family, subject, requested relationship, help level and
  conversation transition. Report distinct factual coverage separately from
  paraphrases, refusals and structural checks.
- Author expected decisions, semantic claims, excluded claims, subject IDs and
  source expectations independently of the assistant's output. A reply arriving,
  quoting related prose or politely declining does not count as answering a fact.
- Retain exact failing conversations as regression cases. Diagnose whether each
  failure comes from interpretation, topic state, retrieval, missing knowledge or
  conflicting knowledge before choosing a fix.
- Keep an explicit gap list. Map markers without descriptions do not establish
  identities or lore. Add factual content only from reviewed guide material or
  verified, labeled and cited research. Preserve pending owner decisions listed
  in `assistant-handoff.md`.

## Completion criteria

- Each guide meets the conversation minimum and exercises every applicable family
  at the applicable help levels. Any inapplicable cell has a written reason.
- Every exposed implementation defect is fixed and covered, or is recorded as a
  concrete limitation requiring an owner decision. Missing factual knowledge is
  reported separately, with its user-visible behavior and source status.
- New conversations pass their semantic and provenance assertions, alongside the
  existing required regressions. Shared-engine changes receive cross-game checks.
- All six actual guide interfaces receive multi-turn browser verification,
  including context changes, spoiler reductions, source display, offline behavior
  and unchanged saved progress. Distinguish fixture-worker tests from checks using
  the already approved pinned local model.
- Record coverage, failures, fixes, remaining gaps and the limits of the evidence.
  Do not describe this campaign as exhaustive game knowledge or untouched holdout
  accuracy after its failures have informed fixes.

Changes stay local. Do not install dependencies or new models, commit, push or
publish without the owner's authorization. No visitor question may be sent to a
remote service. Update the handoff and design records as work progresses.

## Progress: first campaign pass, 23 October 2026

The preceding goal turn made progress by creating this scope and the active goal.
The first execution turn added the shared campaign runners, inventoried existing
input registries, and exercised Albion and Ultima V. The full goal remains active.

| Guide | New conversations | Visitor turns | Passing factual turns | Distinct subjects | Distinct factual records | UI replies, including offline |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Albion | 20 | 164 | 131 | 49 | 96 | 166/166 |
| Ultima V | 20 | 162 | 129 | 62 | 99 | 164/164 |
| Ultima VI | Pending | — | — | — | — | Pending |
| Ultima VII | Pending sustained campaign | — | — | — | — | Existing trivia suite retained |
| Al-Qadim | Pending | — | — | — | — | Pending |
| StarCraft/BWAPI | Pending campaign review/expansion | — | — | — | — | Existing long technical dialogues retained |

Each authored conversation includes 8–10 visitor turns. Both new game corpora
exercise all ten conversation families and all three help levels overall, but the
family-by-help-level matrix has **not** been reviewed. The report marks that gate
false. Factual record IDs can overlap in claims; their count is not a count of
independent facts. The other 66 turns check refusals, clarification or reset.

The inventory of original/English input registries and U7 trivia found no RPG
dialogue of eight turns: Albion's longest was five, Ultima V/VI and Al-Qadim
three, and Ultima VII five. StarCraft already has eight long technical dialogues
among 17 dialogues, with a maximum of 40 turns. This inventory deliberately excludes
standalone `.test.mjs` assertions and is not a test result or accuracy estimate.

The first passes exposed and fixed native spell-stat selection, removal of a word
inside an exact chapter name, subject continuity across differently named facets,
an inherited predicate incorrectly blocking a different facet, unrecognized short
outcome requests, and implicit character names taken from recruitment instructions.
One reviewed Albion relationship now indexes Sira's explicit party link with
Melthas at Full answer, using existing guide text. Two initial Pistol assertions
were corrected against the existing Hint-level variant; the original report and
the reason remain recorded. No other failing expectations were weakened.

Verification: 326/326 campaign Node turns, 330/330 actual UI replies, standalone
1,131/1,131, original 203/203, English 1,058/1,058 and shared browser 369/369.
Campaign UI runs use the explicit consent/worker fixture: native model inference
has not been tested for this campaign. Both game pages retain byte-identical
local storage, produce no external requests or page errors, and answer the
two-turn sample offline. Cache metadata has been regenerated.
The 13,311-case typo benchmark retains 90.3% recovery, 48 wrong subjects (0.36%),
zero ordinary-word suggestions and zero hidden-name leaks; its one preexisting
gibberish suggestion remains. Evidence is `evidence/conversation-typo.json`.

### Reproduce and continue

Use the existing bundled Node runtime; install nothing:

```sh
N=/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
$N guides/tests/assistant/conversation-inventory.mjs
$N guides/tests/assistant/conversation-campaign.mjs
$N --test guides/tests/assistant/conversations.test.mjs guides/tests/assistant/conversation-regressions.test.mjs
# With the checkout served on loopback port 8766:
python3 guides/tests/assistant/conversation-campaign-browser.py
```

Fixtures live in `guides/tests/assistant/conversations/<game>.json`; expectations
include fixed semantic claims, subject IDs and guide/research provenance. The Node
runner checks authorized IDs and session claims. The browser runner checks the
rendered decision, claims, citations, spoiler-hidden history, storage and traffic.
Reports are under `guides/tests/assistant/evidence/conversation-*`; first-run
reports are retained separately. Missing games are reported explicitly, not passed.

## Progress: second campaign pass, 24 October 2026

The previous goal turn made concrete progress: the two original corpora, fixes and
browser evidence were present and revalidated before extending the campaign.
Three more corpora now exercise Ultima VI, Ultima VII and Al-Qadim.

| Guide | Conversations | Visitor turns | Passing factual turns | Distinct subjects | Distinct factual records | UI replies including offline |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Albion | 20 | 164 | 131 | 49 | 96 | 166/166 |
| Ultima V | 20 | 162 | 129 | 62 | 99 | 164/164 |
| Ultima VI | 20 | 162 | 127 | 66 | 96 | 164/164 |
| Ultima VII | 20 | 166 | 130 | 60 | 100 | 168/168 |
| Al-Qadim | 20 | 161 | 124 | 78 | 102 | 163/163 |
| StarCraft/BWAPI | Pending sustained campaign | — | — | — | — | Existing shared UI tests pass |

Totals: 100 conversations / 815 visitor turns, 641 passing factual turns and 174
other turns. The 493 distinct record IDs overlap in claims and variants; they are
not independent facts. The family/help matrix remains unreviewed. The campaign's
825 real UI replies pass, including ten offline turns, with unchanged storage,
no external requests/page errors and static GET requests only. These runs use the
consent/worker fixture, not native inference.

The new cases exposed and fixed effect questions inheriting the action inside a
spell name (`Cure`, `Kill`), complete authored manual questions inheriting an old
question, same-named shrine/quest follow-ups, and page scope hiding the reference
needed by a shrine conversation. Literal indexed names can now compose a bounded
follow-up (`Mantra of Humility` -> `what about Spirituality?`) even without a
standalone virtue profile. This requires an exact, unique indexed name and keeps
restrictions. Explicit two-person relationship answers keep singular pronouns
ambiguous. Complete reviewed question aliases also route save/move questions;
Al-Qadim adds two save-question aliases over its existing cited rule-book note.

The new first-run reports preserve all failures. Two Ultima VI poison assertions
were corrected after reviewing the native Cure spell, which already answers
remedy questions; guide evidence now wins. Ultima VII's guessed identity IDs and
two wording assertions, and Al-Qadim's Giant Boar location wording, were corrected
against declared identities/unchanged sources. No missing expected facts were
removed. Two older clarification fixtures (`sq-aq-095`, `sim-u6-spell-08`) now
require direct answers and exact source records because their complete reviewed
question aliases are supported; both carry explicit intentional-change notes.

Validation: standalone 1201/1201, focused conversation regressions 26/26, original
203/203, English 1058/1058, shared UI 369/369, campaign Node 815/815 and UI 825/825.
Both page-fact checkers pass. The typo benchmark remains 90.3% recovered with
48/13,311 wrong subjects (0.36%), no ordinary-word suggestions or hidden-name
leaks, and its existing one gibberish suggestion. The new report is
`evidence/conversation-typo-round2.json`. Runtime/overlay cache hashes match the
regenerated manifest. No installs, commits, pushes or publication.

A separate **fresh-topic lore probe found open meaning defects despite those
passing corpora**: Ultima V's Lord British identity returns a rescue outcome,
Shadowlord identity returns a task list, and several Al-Qadim identities return
procedures. These are not accepted behavior. Exact questions, source evidence,
knowledge gaps and remaining decisions are in
[`assistant-conversation-gaps.md`](assistant-conversation-gaps.md). Do not mark the
goal complete until these defects are fixed and regressed as well.

Next: fix the exposed identity/relationship mismatches, author and replay the
live-DOM StarCraft campaign, review the family/help matrix and strengthen weak
cells, then verify the campaign with the already approved pinned model. Review
subjects without factual coverage and the gap list before the completion audit.
The loopback server remains available on port 8766 for continued browser tests;
revalidate it before use. The full all-games goal remains active.

## Progress: integrated all-games campaign, 24 October 2026

The owner authorized parallel agents for StarCraft implementation, independent
coverage review and native-model verification. The shared fixes and integration
were kept in this chat. No dependencies or new models were installed.

| Guide | Conversations | Visitor turns | Factual turns | Structural turns | Distinct subjects | Distinct factual records | UI replies including offline |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Albion | 22 | 188 | 147 | 41 | 51 | 100 | 190/190 |
| Ultima V | 23 | 190 | 150 | 40 | 63 | 102 | 192/192 |
| Ultima VI | 22 | 184 | 139 | 45 | 66 | 100 | 186/186 |
| Ultima VII | 21 | 177 | 137 | 40 | 61 | 101 | 179/179 |
| Al-Qadim | 24 | 197 | 148 | 49 | 81 | 107 | 199/199 |
| StarCraft/BWAPI | 20 | 161 | 116 | 45 | 25 | 38 | 163/163 |

Total: **132 conversations / 1,097 visitor turns**, comprising 837 factual and
260 structural turns. The 548 factual record IDs and 347 subjects overlap claims;
they are not independent facts. Five RPGs pass 936 Node turns; StarCraft passes
161 against its reviewed live-DOM snapshot and the actual interface. The final
all-games fixture browser campaign passes 1,109/1,109 replies including twelve
offline turns. Storage is unchanged, with no external requests or page errors.

The independent [family/help review](assistant-conversation-coverage.md) maps 180
cells to individual turns: 137 positive witnesses, 40 structural witnesses and
three narrow documented location ceilings. All cells have a disposition; no
entire family is exempted. Eight additional review branches pass 89/89 turns.
New Ultima VI invasion-cause, Al-Qadim experience/HP and Albion concept/chapter
explanations use existing declared sources. Missing emotions, biographies and
causes remain separate knowledge gaps. This review is bounded regression
coverage, not an exhaustive or untouched holdout evaluation.

Identity corrections now distinguish people from their quest interactions.
Ultima V's Lord British profile has a cited game-specific original-manual source;
its Shadowlord definition uses reviewed guide descriptions and named powers.
Al-Qadim's stated family/species phrases supply four short identities. Subjects
with only procedural text decline identity questions while retaining the explicit
context/location requests. Reviewed source tests protect those distinctions.

StarCraft now routes the guide's separate-install, downgrade, purpose,
first-launch cause, portable setup, Melee mode, community help and example-bot
questions. Its BWAILauncher compatibility conflict retains both source locations
and conflicting provenance. Scope cannot replace an explicitly named item's
facts with its quest alias. Contained shorter spacing matches no longer add a
spurious parent choice. Rejected platform/version/detail constraints persist
through new pronoun relationships, while fresh named requests start a new frame.
Multipart pronouns take the preceding part's subject and restrictions. Early
restriction refusals establish the rejected subject instead of leaking an older
item's effect; unsupported hypotheticals remain progress-neutral.

The strengthened browser runner transparently observes the production assistant
registered by the shared view. It checks the reply actually rendered against
semantic expectations, authorized record/subject/source identities and optional
exact record, locator and citation oracles. It also validates separately
attributed declared disputed accounts. No production test hook was added.

Final acceptance passes: standalone 1,245/1,245, original 203/203, English
1,058/1,058, shared browser 370/370, RPG Node 936/936, StarCraft snapshot 161/161,
and current all-games UI 1,109/1,109. Both page-fact checkers pass. The current
cache digests match all 28 watched assistant runtime/overlay entries. The typo
benchmark remains 90.3% recovered, 48/13,311 wrong subjects (0.36%), zero ordinary
word suggestions, zero hidden-name leaks, and its one preexisting gibberish
suggestion. No installs, commits, pushes or publication.

Native evidence is deliberately split by source snapshot. The complete native
campaign passes 1,097/1,097 authored turns (1,188/1,188 total checked turns), with
real context changes and unchanged storage across all six. The final small
ownership-hypothetical patch preserves an unqualified current subject without
asserting possession, while qualified or different hypotheticals clear stale
context. Its exact patch is retained. Current-code verification passes 113/113
native probe/guard turns and 54/54 structural checks across all six, including
22 targeted ownership/restriction turns. Each native run produces 34 real model
results: 16 displayed constrained framing replies and 18 correctly discarded
in-flight results. Facts remain program-selected source quotations; this is not
1,097 neural factual inferences. The full native corpus predates that last narrow
patch; complete current UI/Node/regression runs and the targeted current native
checks cover the resulting code. Earlier interrupted or failed probe-oracle
reports remain historical evidence and are not counted as passes.

The final evidence reconciliation is
`guides/tests/assistant/evidence/conversation-final-acceptance.json`. It validates
fixture identities, all six interfaces, the reviewed matrix, actual worker results,
source snapshots and the documented two-input native baseline delta (engine
patch plus test helper). The all-games conversation goal is achieved within this
reviewed scope. Missing lore, source accuracy questions and owner decisions in
`assistant-conversation-gaps.md` remain explicit limitations, not unfinished
implementation defects or claims of exhaustive game knowledge.

The owned loopback test server was stopped after final acceptance. Start a new
loopback server on port 8766 to reproduce browser checks; no service was deployed.

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
