# Ultima role and quest scope audit — 2026-10-25

This is a static source audit and implementation proposal. It changes no production data, parser, test, oracle, model, profile, setup, or guide. No browser, assistant runtime, inference, training, download, install, FTP, commit, or push was used. Existing dirty files were preserved. Claims below describe what the local guides say; gameplay was not independently verified.

## Main findings

The requested conversations are substantially present in the source. Their failure pattern calls for a shared actor/action/object/quest contract, rather than more question aliases. Several facts already distinguish answer subjects through `answerBindings`, and some directed edges already capture roles, but the conversation state primarily carries a single focus plus broad person/item/place salience. That loses which action, quest, and ownership relation a follow-up refers to.

The two observed reports reproduce wrong-source answers as well as refusals. `knowledge-blind-browser-independent-ultima-20261025-01.json` records 9/24 passes and `knowledge-blind-browser-independent-all-20261025-01.json` records 20/48; the shared relevant turns behave identically. These are saved observations, not fresh validation of the current working tree. Both reports state `nativeGenerativeInference: false` and `generativeWorkerFixture: true`; they cannot establish native generative quality. Their `factIdObservation` correctly warns that UI citations do not prove internal retrieved fact IDs.

| Scope | Observed failure | Source-present contract gap |
| --- | --- | --- |
| Lord Michael/Grapple | Initial actor plus item question asks which subject; next pronoun cannot resolve; inventory follow-up returns Magic Carpet terrain text | Requested actor should be distinct from motivating item; inventory retention differs from item location |
| Sherry/Valor | Compound destination/control question declines; next rune retrieval returns Honor's pedestal | Action participants and active quest must survive compound turns and generic item words |
| Trinsic | Interview and leave/password compounds decline | Interview targets, clue outputs, report recipient, exit purpose, and password are separate slots |
| Wisp/emps | Bribe and demand questions decline | Bribe recipient, bribe material, whistle provider, communication target, and demanded object are separate roles |

The Trinsic crime-scene answer is a different defect: it returns the correct useful text but cites `DB.mainQuest[0]` instead of the frozen oracle's exact `DB.mainQuest[0].content`. Do not count this as missing source knowledge or repair it by changing the frozen oracle.

## Verified fact and edge inventory

Indices below are zero-based indices in `guides/data/assistant/knowledge/<game>.json` at audit time. Fact IDs are the stable references. `answerRelations` denotes reviewed capabilities, not a claim that the original guide uses those terms. A missing binding does not itself prove a runtime error; it identifies a missing explicit participant contract.

### Ultima V: Lord Michael and the Grapple

Original source: `guides/js/Ultima5.js:320`, `ultima5GrandQuestChapters objective=opening-grapple`. Its steps at lines 328–330 say:

1. `steps[0]`: “Find Lord Michael at Empath Abbey: he is in the courtyard by day and retires to the northwest bedroom.”
2. `steps[1]`: “Speak with Lord Michael and ask specifically about GRAPPLE.”
3. `steps[2]`: “Take the Grappling Hook he provides and keep it in the active party’s inventory.”

| Fact ID / index | Entity and capability | Existing binding or gap |
| --- | --- | --- |
| `michael-location` / 5 | `ultima5:knowledge:lord-michael`; `location, sequence` | No bindings; subject itself is the actor. Full witness preserves daytime courtyard and bedroom schedule. |
| `michael-keyword` / 6 | Lord Michael; `method` | Exact dialogue keyword present. |
| `grapple-keyword` / 7 | `ultima5:knowledge:grapple`; `method` | Same step, indexed for item; facet says acquisition but capability is method. |
| `grapple-inventory` / 8 | Grapple; `acquisition, method` | Facet is use; neither `use` nor a specific inventory-placement capability is declared. The pronoun “he” is resolved only by the containing sequence. |
| `grapple-named-giver` / 121 | Grapple; `acquisition, method` | Combines steps 1–2 with newline and binds Lord Michael to method. Locator is the whole objective, not each original step. |
| `side-grapple` / 84 | `ultima5:knowledge:secure-the-grapple`; `method, use` | Binds Grapple to use/method and Lord Michael to method. Optional Bidney clue is recorded; it is not a prerequisite. |

Existing edges: `links[9] grapple-giver`, Grapple → Lord Michael, `given_by`, proof `grapple-named-giver`; `links[10] michael-abbey`, Lord Michael → Empath Abbey, `located_at`, proof `michael-location`. Both are recorded. The graph normalizes underscores, so `given_by` and `located_at` match supported directions. No edge describes a particular inventory owner or schedule phase.

The U5 adapter already creates Grapple acquisition from steps 0–2 (`adapters/ultima5.js`, `items` entry `opening-grapple`, then `reference('item',...)`). This is useful source coverage, but its generic item location is the objective's `location: Empath Abbey`, which is not where to keep the hook after receipt.

Proposed contract: parse the actual WH target as Lord Michael in an utterance mentioning wanting the Grapple; retain Grapple as the transaction object. Carry a reference frame with `quest=opening-grapple`, `actor=lord-michael`, `item=grapple`, `provider=lord-michael`. Recognize “where keep/carry/store” as inventory handling, with `grapple-inventory` as its evidence, not as a place lookup. If existing capability names are retained, give that fact a reviewed `use` binding and normalize inventory-handling questions to use/method. A dedicated capability is also possible but requires parser and schema support together. Day/night schedule queries should return the full qualified source sentence; there is no exact bedtime or hour to infer.

Unsupported: whether Michael is in that courtyard in the current save; whether the player owns the hook; exact schedule times; a storage chest or named party member; or that Bidney must be consulted first.

### Ultima VI: Sherry and the Rune of Valor

Original source: `guides/js/Ultima6.js:106`, `gameData.quests[0].sections[2]`, heading “Valor — Jhelom”. Steps 0–3 explicitly provide recruitment, travel/control, mousehole retrieval/regrouping, then the Valor shrine. Original step 0 contains backtick markup around `JOIN`; adapter `clean()` removes backticks. That is a known presentation transform, not a literal raw-source witness.

| Fact ID / index | Capability | Binding and scope |
| --- | --- | --- |
| `sherry-join` / 8 | `recruitment, location, method` | Sherry subject; cheese and JOIN in Castle Britannia's kitchen; `sections[2].steps[0]`. |
| `sherry-jhelom` / 9 | `destination, method, sequence` | Sherry subject; destination Sword and Keg in Jhelom and switch control to her; `steps[1]`. Facet label is location, but location capability is deliberately absent. |
| `sherry-rune` / 10 | `acquisition, use, method, sequence` | Sherry subject; binds `ultima6:knowledge:valor-rune` to acquisition/method via literal “rune”; `steps[2]`. |
| `valor-mantra` / 11 | `use, method, acquisition, location` | Shrine of Valor; RA, Serpent's Spine, Moonstone; `steps[3]`. |
| `sherry-dismissal` / 95 | `method, limitations` | Keyword helper `sections[2].keywords[0].helper`: dismiss later at Castle Britannia to avoid karma loss. |

Relevant edges: `links[7] sherry-cheese`, Sherry → Cheese, `recruitment-requires`, conditional on cheese/JOIN; `links[8] sherry-castle`, `recruited-at`; `links[9] sherry-sword-keg`, `quest-destination`; `links[10] sword-keg-jhelom`, `located-in`; `links[11] sherry-rune`, Sherry → Rune of Valor, `retrieves`, conditional on entering while controlling Sherry. This directly supports actor-specific item resolution without inventing a graph traversal.

The unrelated `honor-pedestal` fact (index 21) belongs to `ultima6:knowledge:honor-rune`, `sections[5].steps[1]`: “Take the rune from the central pedestal and promise to return it soon.” `honor-return` (22) belongs to `sections[5].steps[2]`, with SUMM, Trinsic, and return to pedestal. Both Valor and Honor entity declarations have the broad alias `rune`. The saved Sherry turn 3 selects this Honor pedestal text despite prior Sherry context. This is a quest-scope error, not a source omission.

Proposed contract: preserve `quest=valor-jhelom` from the original section and record `controlledActor=sherry`, `destination=sword-keg`, `retrievedItem=valor-rune`. “Who should I control?” asks for the action's controlled actor; it is neither a provider nor an identity biography. The same `sherry-jhelom` witness answers destination and control clauses. A generic “the rune” remains constrained to the active quest and Sherry's explicit `retrieves` edge; it must not fall back to all globally aliased runes. After a failed compound, retain only previously proved reference context, never a newly assumed player event. An explicit “Rune of Honor” changes the requested item/quest; absent that, the pedestal fact is ineligible for this reference.

Do not infer that the player has recruited Sherry, is now in Jhelom, has entered the hole, or has obtained the rune. “Once she is there” is a procedural condition, not reported completion. The text supports taking the rune and regrouping; it does not specify an inventory transfer command. SNES equivalence is not established. Separate source text at `gameData.seerContext[4].details` describes finding Sherry near the throne room; keep that distinct from the kitchen recruitment procedure rather than silently converting the kitchen into an exclusive permanent location.

### Ultima VII: Trinsic interviews and leaving

Original source: `guides/js/Ultima7.js:53`, `DB.mainQuest[0].content`.

| Fact ID / index | Existing coverage | Missing explicit roles |
| --- | --- | --- |
| `trinsic-crime-scene` / 0 | Stables murder, examine scene for key; `acquisition, location, method`; locator currently whole `DB.mainQuest[0]` | Explicit quest frame and precise `.content` source span. |
| `trinsic-suspect-clue` / 1 | “Interview Spark, Gilberto, and Klog to identify the suspect (man with a hook) and his escape vessel (the Crown Jewel).”; `identity, explanation, method`; exact `.content` locator | No `answerBindings` and no interview-target/clue-output edges. Spark is separately declared as companion; Gilberto/Klog are not declared in this focused manifest. Atlas-loaded entities may still exist; absence here is not proof of global absence. |
| `finnigan-exit` / 2 | Blackbird and report to Mayor Finnigan/pass quiz; `identity, acquisition, method, prerequisites`; binding to Blackbird for all four | The witness is adapter-authored paraphrase, not verbatim original `.content`. It omits “copy protection” and the explicit leave-city purpose. |

`links[0] finnigan-grants-password` is Finnigan → Blackbird, `grants-exit-password`, evidence `finnigan-exit`, with “after report and quiz” qualifier. Graph provider lookup supports this incoming predicate; password lookup supports its outgoing direction. It does not by itself encode interviews or the city's exit condition.

The original source says “Report to Mayor Finnigan and pass his copy protection quiz with these answers:” and, after intervening HTML quiz entries, “He will then give you the password 'Blackbird' to leave the city.” The adapter constructs `finnigan-exit` at `adapters/ultima7.js:38–43`. Its paraphrase is source-supported, but the `extracted` witness label and original `.content` locator do not disclose that transform. The fixed oracle's requirement for “copy protection quiz” is source-present and cannot be satisfied by that reduced paraphrase alone.

Proposed contract: create one reviewed investigation frame anchored to `the-trinsic-murders`, with an authored interview-target list `[Spark, Gilberto, Klog]`, suspect-description output “man with a hook”, vessel output Crown Jewel, report recipient Finnigan, quiz condition, password Blackbird, and exit purpose Trinsic. Use complete-set evidence for “who should I question?”; do not pretend each interviewee independently supplies every clue. Typed list members can be authored against exact literal spans. A compound interview/clue answer can cite and return the one intact source sentence. A leave/password compound needs the full report/quiz/exit relation, with exact original spans or clearly labeled reviewed composition over two spans. Keep “permission to leave” procedural and separate from actual saved permission.

Unsupported: a named perpetrator inferred solely from the hook clue; which witness uniquely supplies which part; exact dialogue choices for interviews; current investigation completion or saved password. The list in this source is not a claim that no other NPC can be questioned.

### Ultima VII: emps, honey, whistle, and wisp

Original source: `guides/js/Ultima7.js:55`, `DB.mainQuest[2].content`, “The Quest for the Time Lord”.

| Fact ID / index | Explicit witness and capability | Existing bindings |
| --- | --- | --- |
| `wisp-deep-forest` / 5 | Find silent wisp in Deep Forest; `location, destination` | Wisp only. |
| `honey-emps` / 6 | “Get honey from the Bee Cave to bribe the emps.”; `use, location, method, acquisition` | Honey only, all four roles. |
| `emp-whistle` / 7 | Negotiate with emps for whistle; communicate with wisp; notebook demand; `acquisition, use, method` | Whistle acquisition/method, notebook use. No emps or wisp binding. |
| `whistle-provided` / 91 | Exact first sentence of `emp-whistle`; `acquisition, method` | Whistle only. |
| `whistle-communicate` / 92 | Exact second sentence: whistle communication, wisp demands Alagner's notebook from New Magincia for information; `use, method` | Whistle use/method, notebook use; no demanding-agent role. |

Relevant edges: `links[2] honey-bribes-emps`, Honey → emps, `used-to-bribe`, proof `honey-emps`; `links[3] honey-from-bee-cave`, Honey → Bee Cave, `found-at`, same proof; `links[4] emps-provide-whistle`, emps → whistle, `provide`, proof `whistle-provided`; `links[5] whistle-communicates-wisp`, whistle → wisp, `communicates-with`, proof `whistle-communicate`; `links[6] wisp-demands-notebook`, wisp → notebook, `demands-for-information`, proof `emp-whistle`. All are recorded with source-instruction qualifiers, not completed exchanges.

The generic graph has a provider direction for `provide`, so it can directly answer who supplies the whistle. It has no bribe-material or demanded-object WH slot for `used-to-bribe` or `demands-for-information`; do not add these predicates to generic provider/recipient directions because that changes their meaning. Likewise `graphReferenceRoles()` currently carries provider/recipient only. A bribe recipient is not the notebook demander, and a communication target is not the whistle's provider.

Proposed contract: retain two transactions under the Time Lord quest: (1) emps, honey bribe, whistle obtained through negotiation; (2) wisp communication through whistle, notebook demanded, information offered. Recognize “what do they expect as a bribe?” as the bribe-material slot and “what does it ask for?” as demanded-object, anchored to the actor in that clause. Whose whistle/their whistle can resolve to the provider relation only with the explicitly proved emps frame. “It” in “speak to it” is the communication target wisp, not automatically the last item. Every binding must distinguish the agent from the object and preserve quest/transaction identity. Keep the original wording “negotiate”; no exact negotiation sequence or quantity is supplied.

The Ultima-only saved report answers a request for exact honey ounces with the general honey sentence. Current `requested-measurements.js` already recognizes ounce/ounces/oz and requires a numeric amount adjacent to the unit. Therefore that historical failure is not evidence this current guard is absent. The contract remains: a quantity request must either find a scoped numeric quantity in an eligible witness or explicitly state that the source supplies none; the general bribe sentence cannot count as its factual answer. Never infer an ounce amount or convert a jar into ounces.

## Shared implementation contracts to review

1. **Keep structured source ancestry.** Focused facts currently compile with `scope: 'reference'` (`knowledge.js:122`), losing original objective/section scope at the record level. Add reviewed `questId`/`sectionId` and, where needed, `transactionId` metadata, mapped from source ancestry rather than guessed from shared words. These are reference constraints, not player state.
2. **Parse each clause into roles.** Separate requested entity, contextual entity, action, participant slot, object, condition, and source restrictions. “I want X; where is Y?” asks about Y while X supplies context. Compound slots share one reference frame and may share one evidence sentence. Do not resolve all named participants as competing subjects.
3. **Carry typed reference frames.** Extend the current focus/salient map with proved quest and action participants. Maintain distinct `controlledActor`, `provider`, `bribeRecipient`, `communicationTarget`, `demandingAgent`, `demandedObject`, and `interviewTargets`; only instantiate slots supported by returned evidence or explicit authored metadata. Do not create current possession, completion, or location facts. If two slots fit, clarify rather than ranking an unrelated quest's generic noun.
4. **Use finite directed slot lookup.** Extend graph question types only for authored predicates with exact endpoint direction and answer kind. A bribe-material query anchored on emps can read the incoming `used-to-bribe` endpoint Honey; a demanded-object query anchored on wisp can read outgoing `demands-for-information` endpoint Notebook. This is declared interpretation of one edge, not arbitrary inverse generation or multihop inference. Render the complete evidence with conditions.
5. **Audit bindings semantically.** `buildKnowledge()` verifies a binding's entity, capability, and literal mention, but literal mention alone cannot prove the role. `rolesFor()` falls back to the fact-wide capabilities if no matching binding exists (`knowledge.js:870–873`). Require reviewed participant semantics for cross-subject answers rather than granting an incidental actor every capability on the passage. Extend schema/capability vocabulary only alongside parser and compiler support; simply adding a new relation name currently fails `ANSWER_RELATIONS` validation.
6. **Keep source provenance exact.** `buildKnowledge()` checks witness inclusion in an authorized adapter record and source-file compatibility; it does not resolve the original `source.locator` to validate its raw text. Use exact raw span(s), a declared presentation normalization (e.g. stripping JOIN backticks), or an explicitly reviewed composition that cites each span. Synthesized adapter prose should carry its adapter transform provenance while linking to original evidence. Deduplicate repeated U7 locators such as `.content; .content`. Do not change frozen original oracles to accommodate weaker citation metadata.
7. **Separate evidence errors from state boundaries.** Preserve unsupported age, quantity, edition, current save, and actual position boundaries. A procedural “once/after” condition can select a source action sequence without asserting the condition happened. A named new quest/item overrides old reference scope; unsupported new scope must not reactivate an older answer.

These contracts should be checked with varied source-driven role reversals and compound continuations, not only the saved wording. Useful acceptance families include actor-versus-goal-item, retrieval-versus-return-to-lender, provider-versus-bribe-recipient, communicating-agent-versus-tool, and complete interview-target lists. Keep the existing frozen suites immutable; new evaluations should be separate and grounded in source spans before running them.

## Audited source fingerprints

| File | SHA-256 |
| --- | --- |
| `guides/data/assistant/knowledge/ultima5.json` | `fde0c4797ad32d111ad31d9def56e9839c6802339da3cc95ef8d36c93e72dced` |
| `guides/data/assistant/knowledge/ultima6.json` | `e3d48258056b14576491045b811becd40b136b3e8a8223d867462a8ff919dd65` |
| `guides/data/assistant/knowledge/ultima7.json` | `55bc9f21c2b1d12b20aed45984e1f12cf29b0f8ead0d13141362b363e278d634` |
| `guides/js/Ultima5.js` | `e2699ed2d8aca9bf3465c7dcd262461f5fca59f1fb4cbd41361e0f5c5a96dae5` |
| `guides/js/Ultima6.js` | `a0b07db60d7c30ac19bb64b56fa26b1428a6437f437f087eb2d75109afae4898` |
| `guides/js/Ultima7.js` | `c3cd92659e5e959c6d172ba38d56ba85148729b82185768557cb595e3bfb6085` |

Read-only verification consisted of source/adapter/manifest inspection, static JSON extraction, exact source-text comparison allowing the documented adapter markup transformations, saved-report inspection, and the hashes above. No new pass/fail claim about the running assistant is made.
