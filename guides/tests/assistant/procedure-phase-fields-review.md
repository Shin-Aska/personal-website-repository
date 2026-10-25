# Procedure phase field review — 2026-10-25

The complete original source witnesses for the selected gaps in the `ultima5-ultima6` and `ultima7-alqadim` full corpus reviews (`20261025-02`) were compared with the existing facts and authorized backing source records. The change adds a shared finite request parser and literal phase proof helper. It does not change runtime integration, guide source, existing fact text, question aliases, model assets, encoded documents, or frozen test oracles.

## Source findings and metadata

Ten existing facts now carry `procedureFields: [{phase, field, evidence}]`. `evidence` is exactly the entire unchanged fact witness. The new fields index source roles and phases; they do not generate an answer.

| Fact | Explicit phase and field | Complete source instruction |
| --- | --- | --- |
| U5 `amulet-waterfall` | approach / route | Ride the Carpet into the waterfall east of Skara Brae. Its existing route support supplies junctions and burial pickup. |
| U5 `amulet-escape` | escape / method | VAS REL POR **or** controlled party death **if no return spell remains**. The condition and alternative remain in the complete witness. |
| U5 `spirituality-midnight` | approach / route | Active gate over a buried moonstone; pocket watch; exactly midnight; Ethereal Void; no Skara Brae departure requirement. |
| U5 `spirituality-return` | return / route | Midnight **again**, return, then OM meditation for quest completion. |
| U5 `raid-supplies` | preparation / supplies | Lockpicks, food, healing, poison cure and enough hit points. |
| U5 `crown-capture` | preparation / capture-safety | Permanent save and the permanent companion-erasure consequence. |
| U6 `side-2-step-0` | start / method | Ask Chuckles, then search the chest in Nystul's room. The exact reviewed source is `gameData.sideQuests[2].steps[0]`. |
| U6 `side-2-step-1` | follow / route | Follow scrolls through the plant, beehive, harpsichord, jail beds and cauldron. |
| U7 `ether-gem-dragon` | acquisition / method | Defeat Dracothraxus for the Ether Gem. |
| U7 `courage-finish-sword` | completion / method | Return to Dracothraxus and invoke the Black Sword's power to finish the test. |

The Amulet is an instrument in `doom-entrance`; that passage is not an approach to acquire the Amulet. The Spirituality moongate route supplies no spell instrument. The initial Courage passage explicitly says the test continues later; it cannot substitute for the later completion instruction. The supplies and capture-safety facts retain their existing method capabilities. Their bounded preparation fields can be selected before generic prerequisites taxonomy rejects them; no new item prerequisite claim is added.

## Integration contract

Import `parseProcedurePhaseRequest`, `supportsProcedurePhaseRequest` and `procedurePhaseScopeLabels` from `procedure-phase-fields.js`.

```js
const request = parseProcedurePhaseRequest(completeQuestion);
const proven = supportsProcedurePhaseRequest(request, {
    fact,
    subjectEntityId: selectedEntity,
    scopeTexts: completeAcceptedScopeNames,
    sourceRecord: authorizedOriginalBackingRecord,
    grounded: hasSourceGroundedConversationFrame,
    isEligible: eligible
});
```

The parser returns `{kind:'procedure-phase', phase, field, scopeText, originalText}` or `null`. It recognizes complete finite forms for approach, escape, return, start, following a route, completion, acquisition and preparation. It retains unknown source, edition, quantity, material, instrument, condition and compound-request suffixes inside `scopeText`. A separate spell field prevents a route destination from satisfying a spell-instrument question.

The proof helper requires a canonical fact owner matching `subjectEntityId`, `text === witness`, the original source record ID, the complete witness inside that authorized source record, matching source file authority, no conflict, an explicit `isEligible(fact) === true`, matching reviewed phase metadata, matching answer capabilities, and a literal instruction for that phase. Metadata evidence cannot be extracted from the middle of a reported or hypothetical sentence. A start index must have an explicit start instruction or a reviewed literal instruction at exact `.steps[0]`. The helper does not take a source objective, nearby step, atlas selection, inventory, or save state as phase proof.

`scopeTexts` must contain only complete names/descriptions that the parent has independently accepted for the selected owner. Do not put the request's own unvalidated scope in this list. Exact scope matching fails unknown restrictions; pronouns require a source-grounded frame in addition to owner and phase proof. The parent retains all complete question, edition, source, material and state restrictions. A true result authorizes the complete literal fact, never a synthesized answer or state mutation.

Handle supported explicit phase fields before generic facet ranking and generic prerequisites capability filtering. When one or more matching reviewed phase fields exist for the selected owner, restrict selection to fully proven same-phase facts. A recognized approach/spell request must fail closed when only approach/route evidence exists. Unsupported suffixes must not fall through to a same-topic answer. Do not globally reject all parsed phases merely because an owner has metadata for some other phase: ordinary Crown acquisition still uses existing acquisition facts, and ordinary Amulet pickup still uses `amulet-burial`.

Preserve existing reviewed supporting fact rules. For the Amulet initial route, `amulet-waterfall.support.route` lists `amulet-junctions` and `amulet-burial`; include those complete literal facts only after each passes the parent's authorization and full scope restrictions. Escape has no inbound-route support. Source contexts may narrow available facts but may not manufacture a phase or spread an instrument role into a destination role.

The helper deliberately does not implement the separate bounded sufficiency question “Does obtaining the Ether Gem automatically finish Courage?” That needs both the full “continues later” witness and the later Black Sword completion witness without asserting possession or completion. It also does not implement the separate atlas-selection/departure question or alter the source response pipeline.

## Verification

`procedure-phase-fields.test.mjs` checks native original declarations, all ten literal metadata witnesses and authorized backing records, protected source projections, exact existing embedding document text, alternate wording, role/phase separation, unknown scope/source/quantity/edition/material/condition/compound negatives, source/owner/eligibility/conflict failures, descriptor tampering, grounded pronouns, a separate generic spell-instrument source, and mislabeled phase negatives.

The focused helper suite passes 16 tests. Running it with the existing Ultima VI and VII procedure-scope suites passes 28 tests. No model loading, training, encoding, downloads, installs, browser actions, commits or pushes were used. Frozen source projections and the list of metadata additions are recorded in `evidence/procedure-phase-fields-20261025.json`.


## Phase-local scope descriptions

Three phase entries additionally index `scopeLabels` with literal source anchors. These descriptive labels do not change any entity or embedding alias:

- `crown-capture`: “Crown retrieval” is a recovery description anchored to the exact authorized original title “Recover the Crown” and the full capture-safety instruction.
- `amulet-escape`: “Amulet route” is the escape route within the exact “Recover the Amulet” source container. The existing explicit `route` role and the literal escape instruction are both required.
- `side-2-step-1`: “Chuckles scrolls” combines the source-owned trail actor with the literal follow-object. The exact original title is “Chuckles' Trail of Clues”; the same complete authorized source begins “Ask Chuckles about his clue”, and the phase witness begins “Follow the scrolls”. This indexes the trail's scroll-following scope. It does not claim Chuckles possesses, sells or gives inventory scrolls.

Call `procedurePhaseScopeLabels({fact,sourceRecord,phase})` to read these labels. It returns only strings whose full source record and phase evidence validate. Append this helper output to the parent's dispatch `phaseLabels`; never append raw metadata. `supportsProcedurePhaseRequest` independently accepts the same validated labels. The labels are local to their reviewed phase and do not broaden acquisition, initial approach, another actor, another object, or another source. Finite compositions must match the whole label, so adding “without a spell”, “in two turns”, an edition, another source, a new material, a temporal restriction or a second action continues to fail exact scope proof.
