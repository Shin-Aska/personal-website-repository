# Observed conversation failure review — 25 October 2026

The original latest result remains **35/76 strict passes**, compared with 33/76 in the first report. The frozen corpus SHA-256 is `67847abd677579e424d4458f710962a39e8453e9034e7696f1269b4bf4402eb3`. This is a separate source adjudication of observed cases, not a replacement score or evidence of holdout generalization. Neither the oracle nor its pass/fail totals was edited.

The companion evidence file, `guides/tests/assistant/evidence/knowledge-fresh-adjudication-20261025.json`, records all 76 turns with decisions, strict results, full-claim and citation checks, source file/locator proofs, focused-index witnesses and root-cause judgments. Raw declarations, approved overlays, adapters and focused manifests were inspected read-only. No assistant/model/browser/native reruns, installs, downloads, commits or production edits were performed.

| Latest observed category | Turns |
| --- | ---: |
| Full answer with supporting citation | 15 |
| Full answer with a legitimate broader exact source locator | 2 |
| Expected source-boundary non-answer | 19 |
| Useful partial; required answer incomplete or still presented as clarification | 4 |
| Missed answer supported by source | 33 |
| Wrong relation or neighboring objective supplied | 2 |
| Qualified attribution with source-scope mismatch | 1 |

There are **17 complete source-supported positive answers out of 57 answerable turns**, plus 19 boundary-safe responses. These are distinct findings, not a new green 36/76 score. Boundary-safe means the response does not invent the requested unsupported fact; several generic clarifications still provide poor guidance. No latest response asserted a demonstrably invented affirmative game fact. That does not excuse the many unanswered supported questions.

The strict positive Grapple acquisition answer gives Lord Michael, GRAPPLE and the hook but omits the required Empath Abbey location. It is useful partial under the full semantic contract even though strict phrase/source checks pass. The two strict failures that contain complete answers are Full-Circle Swing training (Zubakon after later progression) and Thorn Snare (level 12, 16 SP). Their broader locators directly contain the relevant fields: `DB.combatMoves[2]` and `DB.magic[0].keySpells[1]; DB.magic[0].freeTraining/routeHint`. The adapters assemble those actual declared fields. This is a source-locator precision difference, not alias-based inference or permission to change the original oracle.

VERAMOCOR and Erethian appear as correct closest-text quotations under `clarify`, explicitly described as possibly not answering the question. They remain useful partial rather than full answers. The Compassion permission answer supplies only the return to Ariana, omitting Anya, Blue Boar Tavern, the permission keywords and YES. The HMS Cape answer supplies where to enter the shipwright building instead of double frigate speed. The boar answer supplies an XP objective instead of sidestepping the charge and attacking from behind. A meaningful citation alone is insufficient.

## Actual data coverage versus routing failures

All **57 positive source witnesses exist in the current checked-in guide declarations or normalized HTML prose**. Shrine prose is also preserved in the approved `ultima5.json` page facts. A raw-witness check alone does not prove the claim has entered the focused index or that the response used it.

Five failed turns expose focused-data gaps, while the raw source already contains the needed facts:

- The Grapple focused side-quest text covers small peaks, but omits the raw objective outcome about several Underworld routes. The observed immediate failure is also an overbroad current-state guard on the hypothetical “Once I have it”.
- The three Ultima VI passage answers — Wizard, Pods and Volcanic Eruptions — exist in `gameData.passage[2]`, `[1]` and `[17]`, and the adapter exports passage records, but no corresponding focused manifest facts exist.
- The Brion solution is focused, but the explicit `DB.sideQuests[10].reward` value “Brion activates the orrery” is omitted from those focused entries. Related solution text should not silently become a source-backed statement of the listed reward.

Magebane's exact location also lacks a focused fact, yet the latest response answers it correctly through `DB.equipment[5].location`. Thus focused absence does not necessarily cause failure, and a complete ingestion fix should preserve access to existing adapter data.

Most misses have the required source proof already focused. Examples include Jaana's early spellcasting recommendation and Yew recruitment, Johne's strength and difficult Underworld location, three-cycle/Codex shrine ritual, Anya/Ariana permission, Julia crafting panpipes, Gwenno/STONES and Selganor's performance, full Black Sword forging/Arcadion/Ether Gem instructions, on-hit Magebane effect, swing coverage, boar combat, mermaid-sister rescue, Pistol/Canister hiding, Frost Avalanche's effect/SP/reagent, Fasiir training, Sira/Melthas coupling, SCHNAIL supplied installation/network scope, BWAPI documentation and BWAILauncher's comparison/offline/setup facts. Their observed failures concern subject carryover, supported relation selection, compound questions, or inherited restriction handling. Root causes are evidence-backed behavioral judgments rather than instrumented call traces.

The Albion school precision distinction is legitimate only when the actual field proves the claim. `DB.magic[0]` declares Sira, Trifalai Seed, Fasiir training and the Jirinaar free-training route hint; a finer `freeTraining/routeHint` locator can prove the same training claim. The first report's complete training response cites the assembled spell/school fields; the latest instead declines. This is a lost useful answer, irrespective of both reports' strict failures on that turn. Latest Frost Avalanche likewise loses its effect/resource text; a complete compound answer must include freezing all enemies, 30 SP and Trifalai Seed, and actually resolve the resource clause.

## UAlbertaBot attribution

The exact question is “Who does the guide credit with UAlbertaBot?” The HTML credits **Dave Churchill and Steve Gelly**. The focused example-bot witness preserves that text. The approved research record `facts[54]` separately states that the README/wiki identify David Churchill and do not establish the extra Steve Gelly attribution. David's entity explicitly declares the alias Dave Churchill; that alias is verified rather than assumed.

The latest answer leads with “Not in this guide — from outside research”, gives David Churchill and then notes the guide additionally credits Steve Gelly. Its caveat is truthful within the recorded approved review, so this is not an invented-author finding. However, its displayed research-only citation does not directly cite the guide-credit claim, and its leading framing answers a different source question. It is recorded as qualified attribution/source-scope mismatch, without silently treating the guide's disputed attribution as independently true or inventing a green pass. A direct answer could report both names as the guide's credit and separately retain the research caveat with its own provenance.

## First-to-latest observation

Strict improvements are lich combat, refusing unsupported Purple Berry dosage and Remastered Use Map Settings. Frost Avalanche effect/resource becomes a strict regression. Other changed text still fails its original strict contract. The resulting 33→35 improvement is narrow; it does not establish general conversational understanding. The next work should add the five missing focused claims, then address source-present relation/compound handling and subject carryover, retaining the 19 state and scope boundaries. A fresh independent corpus is needed before claiming generalization.
