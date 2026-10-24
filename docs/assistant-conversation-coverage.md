# Conversation family and help-level review

Local review, 24 October 2026. The campaign remains active. The five RPG corpora
now pass **936/936 Node turns in 112 conversations**. Their 721 answer turns and
215 structural turns are different kinds of evidence; neither is a count of
independent game facts. StarCraft has 20 conversations / 161 turns, passing in its
live-DOM engine replay and **163/163** actual-UI replies including offline turns;
the Node campaign does not execute that adapter.

The reproducible review is
[`conversation-coverage-review.mjs`](../guides/tests/assistant/conversation-coverage-review.mjs).
Its [structured evidence](../guides/tests/assistant/evidence/conversation-coverage-review.json)
maps all ten families to the **effective help level of each cited turn**, retaining
the question, expectation, source locator, source text, evidence type and fixture
hash. The StarCraft family mapping was supplied by the live-DOM reviewer and its
turn/help references were checked here. Its [durable current source snapshot](../guides/tests/assistant/evidence/conversation-starcraft-source-records.json)
supplies the exact per-tier source trace; its [coverage report](../guides/tests/assistant/evidence/conversation-starcraft-coverage.json)
retains 116 factual turns, 38 selected record IDs and 25 of 28 subjects with
factual answers. No family tag on a dialogue is treated as proof that every turn
exercises that family or that every help-level combination passes.

`familyHelpMatrixReviewed` is now **true for this bounded review**. All 180 cells
have a manually checked witness or a narrow written source/policy ceiling; the
last missing explanation/cause branches were added and executed. This establishes
the family/help review, not exhaustive knowledge or final end-to-end acceptance.
Upstream source accuracy, context-change browser evidence and native-model evidence
retain their separate dispositions. A source-backed narrow answer does not
establish a biography, every causal explanation or arbitrary related fact.

## Corpus and assertion strength

| Guide | Dialogues / turns | Answer / structural turns | Exact record / locator oracles | Exact URL oracles |
| --- | ---: | ---: | ---: | ---: |
| Albion | 22 / 188 | 147 / 41 | 16 / 16 | 0 |
| Ultima V | 23 / 190 | 150 / 40 | 9 / 9 | 0 |
| Ultima VI | 22 / 184 | 139 / 45 | 12 / 12 | 0 |
| Ultima VII | 21 / 177 | 137 / 40 | 7 / 7 | 4 |
| Al-Qadim | 24 / 197 | 148 / 49 | 14 / 14 | 5 |
| StarCraft | 20 / 161 | 116 / 45 | 0 / 0 | 0 |

These are authored expectation counts from the review snapshot, not independent
accuracy estimates. The eight new RPG review branches have **89/89 passing turns**,
including 58 positive turns with fixed record IDs and source locators. Existing
assertions usually specify subject IDs, semantic fragments and guide/research
provenance class. The strengthened checker additionally verifies that the
returned source belongs to the authorized selected record; disputed narratives
may display their declared individual claim sources. Exact record, locator and
URL expectations are supported, but are still optional in the older corpora.

An oracle that only requires `Wizard`, `king`, `Britannia`, or `disagree` can pass
an incomplete answer. A subject ID plus a related phrase cannot always distinguish
identity from outcome, or a source warning from a substantive effect. Assertions
such as `no-answer` with no excluded claims also accept several distinct decision
types. These are useful regression checks but should not be called exact semantic
oracles. The existing identity fixes demonstrate why the distinction matters.

The JSON includes possible local source records for older positive witnesses.
Those are explicitly labeled **candidates**, not retroactively asserted exact
oracles. Their provenance was not inferred from the assistant's selected output.
External research URLs retain their existing review dates; this review checked
the local declarations and did not independently re-fetch those publications.

## Missing cells filled in this review

Each branch changes the visitor's task, help level or referent. Spacing variants
exercise the same factual claim and add no independent knowledge coverage.

| New conversation | Concrete coverage and exact source evidence |
| --- | --- |
| `albion-security-hints-and-subject-recovery` (13 turns) | Gentle `:1` and Balanced `:6` request security guidance from `albion:objective:toronto-intro:hide-weapon:hint`. Native basis is `QUEST_HINTS["toronto-intro"]["hide-weapon"]`; the reduced variants are `objectives.hide-weapon[0/1]`. `:3–4` check Gentle location hints, `:9–10` check the Direct Sira/Melthas relationship ceiling, and `:13` checks joined uppercase Tom identity after reducing help. |
| `ultima5-pilgrimage-hints-and-name-recovery` (12 turns) | Gentle `:1` and Balanced `:5` check `ultima5:objective:shrine-honesty:hint`, including `gentleHints.shrine-honesty` and native `ultima5GrandQuestChapters objective=shrine-honesty`. Balanced `:6` checks the separate declared shrine outcome. `:3/:7/:10` check Gwenno spelling at all three help levels; wife/relationship information remains Direct-only. |
| `ultima6-valor-hints-location-ceiling-and-correction` (12 turns) | Gentle `:1` checks the small-companion hint, Balanced `:5` the Sherry/tavern hint, and Direct `:9` the cheese/mouse-hole procedure, from `gameData.quests[0].sections[2]`. `:3/:7` refuse Sherry's exact location below Direct; `:8` checks `marker:Sherry` coordinates at Direct. `:10–12` check reset, an unresolved pronoun and explicit identity recovery. |
| `ultima7-time-lord-quest-hints-and-identity-switch` (11 turns) | `:1/:3/:6` distinguish Gentle/Balanced/Direct quest guidance from `ultima7:quest:the-quest-for-the-time-lord:hint`, whose source is the `DB.mainQuest[2]` entry and the reviewed quest overlay variants. `:4–5/:7` switch to the distinct research identity/purpose, with exact transcript URL assertions. `:8–11` exercise guide-only inheritance, reset and research recovery. |
| `alqadim-oasis-hints-and-location-recovery` (12 turns) | `:1/:6/:9` check all three Chapter 3 hint variants, native `DB.chapters[2]` plus overlay `chapters[3]`. `:3–5` refuse an unsupported Lightning Bolt location, retain the location intent for a short follow-up, then recover on a complete Water Blast use question. `:7/:10` add Balanced/Direct spacing and capitalization recovery using `DB.moonstoneShards[2]`. |
| `ultima6-invasion-cause-and-unsupported-motives` (10 turns) | `:1/:3/:7` explicitly ask why the gargoyles attack at Gentle/Balanced/Direct. The existing `ultima6:topic:premise:explanation`, sourced to the native page briefing, explicitly says their dying world names the Avatar as its destroyer. Fear/emotion, an order from Lord British and a Gargish definition are separately refused; reset clears the attackers' referent. This is a cause, not a procedure. |
| `alqadim-experience-explanation-and-guide-only-boundary` (8 turns) | Balanced `:1–3` explains the explicit experience/HP mechanism: puzzles, goals and kills earn XP; a new level automatically increases HP; maximum HP rises only on gaining a level. `:4–6` checks inherited guide-only scope and reset; `:7/:8` verifies Gentle/Direct explanation recovery. Exact existing rule-book record IDs, locator and URL are asserted. |
| `albion-maini-explanation-and-unavailable-causes` (11 turns) | Balanced `:1/:5` asks what Maini is about and summarizes its explicitly recorded goals, from `DB.chapters[3]`. Gentle `:9` asks what Iskai magic is and checks practitioner Sira, reagent and teacher, from `DB.magic[0]`. Direct `:10` answers the Sira/Melthas relationship; Gentle `:11` withholds it and purges history. Harriet's replacement cause stays unsupported. |

The first authoring replay exposed two question/oracle intent mismatches: a
Gentle how-to request was expecting a hint. Those questions now explicitly ask
for the declared hint; their expected claims were kept. Four initial exact record
guesses were also corrected: Gwenno identity uses the native companion explanation,
and the Valor how-to route uses its declared `:use` record. The source texts and
claims are unchanged. These corrections, including original questions, remain in
the structured review. They are not blind holdout results.

## Reviewed cells, breadth limits and applicability

Every family applies to every guide at some level. **No entire family is marked
N/A.** The following narrower restrictions do not authorize inventing lower-level
facts or treating a refusal as a positive answer.

| Cell or subdimension | Evidence and remaining limit |
| --- | --- |
| Albion explanation/relationships, Gentle/Balanced | `albion-maini-explanation-and-unavailable-causes:9` positively explains the Gentle Iskai school and its practitioner/reagent/teacher links; `:1/:5` explains the explicitly recorded Balanced chapter goals. The Direct-only Sira/Melthas party link is answered at `:10` and withheld at Gentle `:11`. Harriet's replacement cause is absent knowledge. The exact phrase `What is the goal in Maini?` currently declines because no purpose facet is indexed, while the supported natural explanation question answers the goal. This is a narrow phrasing limitation, not a missing underlying goal or untested family. |
| Ultima V explanation/family relationship, Gentle | `ultima5-virtue-discovery:1` positively checks the native Honesty–Moonglow association. This is a narrow explanation, not a philosophical definition. New pilgrimage branch `:4` refuses the wife relationship; Direct `:9` answers it. Balanced relationship/outcome coverage is positive at new `:6`; it does not establish a family biography. |
| Ultima VI exact location, Gentle/Balanced | The current adapter authorizes **zero** location records at either level, and zero Gentle acquisition records. New `:3/:7` are boundary witnesses, not factual travel answers. Positive exact location is inapplicable under this policy; Direct `:8` answers it. Gentle quest hints remain applicable and are now positively exercised. |
| Ultima VI explanation/relationship breadth | The new invasion branch `:1/:3/:7` explicitly and positively checks the native invasion cause at every level. The older `ultima6-passage-creatures:3` origin question's one-word `Wizard` oracle remains narrow; `(Lord British)` in the QA source identifies the informant, not the wizard's identity. No fear/emotion, family tie or full biography is inferred. Those are unavailable knowledge, not missing witnesses for the now-tested cause family. |
| Al-Qadim exact location, Gentle | The current adapter authorizes zero Gentle locations. New `:3–5` checks refusal plus recovery; the factual location subcell is inapplicable under that ceiling. Balanced shop locations and Direct NPC/item locations are positively covered elsewhere. |
| Al-Qadim explanation/relationship breadth, Gentle/Balanced | `alqadim-manual-basics:4–5` already positively explains level/HP mechanisms at Gentle; the new experience branch `:1/:3/:7` makes the explicit mechanism and its source assertions stronger at both low levels. These satisfy the goal's explanation category without treating a quest procedure as a motive. Direct identities separately establish Jessamin as Mother and Tarik as brother. Unsupported plot motives and low-level family identities remain written knowledge/ceiling limits. |
| StarCraft narrative subdimensions | Campaign characters, fictional geography, story quests and plot spoilers are N/A because this guide supplies technical material. The applicable replacements are tools/concepts, paths/downloads, setup/troubleshooting objectives and operational explanations. Help ceilings, short follow-ups, source conflicts and history reductions still apply. |

The detailed matrix gives positive, structural or ceiling-only evidence
for each family/help combination. For example, Ultima VII Gentle relationships
are positively established by `ultima7-royal-friendship:4` (old friends/shared Earth
origin) and `:6` (ruler of Britannia); those cells must not be mistaken for missing
coverage merely because other game biographies are absent.

## Factual gaps and subject priorities

The machine report's `subjectsWithoutPassingFactualCoverage` lists are useful
input, not a count of missing biographies: many are atlas-only markers, duplicated
subjects or variants without substantive description. Source review must precede
any expansion. Highest-value next branches are:

| Guide | Priority and source status |
| --- | --- |
| Albion | Earlier Nakiridaani/Gratogel objectives and later Dji-Cantos/Kenget chapters have native quest/hint material with little sustained campaign coverage. Add context-sensitive quest branches before more equipment paraphrases. DDT, the Goddess, and the reason Harriet replaces Rainer remain the separately documented knowledge/explanation gaps; a recorded replacement is not its cause. |
| Ultima V | More opening/side objectives and artifact acquisition are supported by native hints but barely represented in the sustained corpus. Underworld explanation remains a knowledge gap. Keep recruitment methods separate from companion locations and preserve the pending owner decision. |
| Ultima VI | Expand actual objective selection and shrine transitions; many map markers alone do not supply lore. Gargish and why gargoyles fear the Avatar remain explanation gaps. Draxinusom's brief sourced physical description must not be reported as a full biography. |
| Ultima VII | Reagent buying/prices, the bestiary, Forge of Virtue and side quests have substantial existing declarations without corresponding sustained branches. Codex/gargoyle definitions and why Lord British rules remain separate knowledge gaps. Preserve the known Ethereal Ring and other source limitations. |
| Al-Qadim | Chapter 1/6/7 objective guidance and later item/objective transitions are more useful next coverage than more shard paraphrases. Unsupported identities for the Caliph, Vizier and Aliya remain distinct from their supported interactions. Preserve the four named item/strategy conflicts. |
| StarCraft | The final live-DOM and fixture-worker UI replays pass. `bwai-tips` and the standalone `remastered-map-links` facet have no separate factual question; the archive sources are otherwise exercised. `bwai-compatibility` intentionally has conflict/refusal coverage, not a factual answer. The guide's Steamhammer attribution is a known source-accuracy issue: passing a test of what the guide claims does not verify that attribution as history. |

Potion review: `alqadim-potion-shopping:5` does assert the guide-only Invulnerability
Potion effect, `Temporary defense buff`, from `DB.shops[0].inventory` description.
The known two disagreements are **Extra Healing** (shop: fully restores health;
reviewed rule-book summary: 6–27 HP) and **Giant Strength** (shop: Strength 22;
rule-book summary: +8 damage per blow for a few minutes). The rule-book note defines
elemental invulnerability **oils**, not the standalone Invulnerability Potion, so
it does not establish a contradiction for that particular assertion. The campaign
checks those two disputed potions' prices, not their conflicting effect claims;
it also checks the separate guide-only Invulnerability effect. Keep that wording
precise when summarizing the evidence.

## UI and native-model evidence boundary

Current complete UI replay passes 1,109/1,109 replies across all six interfaces,
including twelve offline turns, authorized record/source checks, unchanged storage,
no external requests/page errors and stable runtime/fixture hashes. It uses the
explicit consent/worker fixture, which does not establish native inference.

The real pinned-worker full campaign passes all 1,097 authored turns in 132
conversations (1,188/1,188 total checked turns). Native context checks change actual
chapters, quests or topics in all six, reject stale in-flight wording after help,
topic and page-context changes, and recover by a fresh name. All storage remains
unchanged. The final narrow same-subject ownership-hypothetical patch is preserved
separately; current-code native verification passes 113/113 probe/guard turns and
54/54 structural checks, including 22 added ownership/restriction turns. Current
complete UI, Node and regression suites also pass after that patch. The full
native corpus predates only this documented patch and its test-helper additions.

Each native run records 34 actual worker results: 16 displayed constrained framing
replies and 18 discarded stale results. These are not neural factual answers;
quotations are program-selected from authorized sources. Offline native checks
use already loaded pages with service workers blocked. Earlier interrupted or
probe-oracle failures are retained separately. Final evidence and hash
reconciliation are in `evidence/conversation-final-acceptance.json`.

The review artifact's `endToEndAcceptanceComplete: false` describes that artifact's
family-review-only scope. Overall completed acceptance is recorded separately in
the final acceptance report; it does not turn this matrix into an exhaustive
knowledge or source-history accuracy claim.

Reproduce without installs:

```sh
N=/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
$N guides/tests/assistant/conversation-coverage-review.mjs
$N guides/tests/assistant/conversation-campaign.mjs
```

Review verification: eight source-authored review branches 89/89, manual
reference checks zero errors, five RPGs 936/936 Node turns, StarCraft live-DOM
snapshot 161/161 and complete current six-game UI 1,109/1,109. Changes remain local.
