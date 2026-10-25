# Shared source request frame — 2026-10-25

`request-frame.js` reads structural question syntax before source ranking and owner resolution. It imports only the existing `playerStateQuestion` safety reader from `language.js`. It contains no game names, entity aliases, fact IDs, source records, corpus question strings, model inference, or source-specific answer rules.

The old `sourceQuestionParts` parser remains unchanged. Its clause split requires individually supported parts and limits independent subquestions; those assumptions are not used to require separate owners for coordinated fields. A four-stat question produces four fields with one full syntactic owner. Role/focus, type/effect, location/coordinates, price/recipient, directed teacher/maker/provider questions, imperatives and short nominal follow-ups use the same shared field grammar.

## API

```js
parseSourceRequestFrame(text) // null, or:
{
  kind: 'source-fields', originalText,
  subjectText,             // complete uncanonicalized phrase, or null
  subjectCandidates: [],   // complete candidates, never resolved IDs
  identityCandidateText, requiresExactIdentity, // optional exact-name gate
  contextTexts: [], intentTexts: [], correction,
  fields: [{
    key, selectors: [], requestedText,
    subjectText,           // optional; no independently resolved owner required
    fieldText, fieldHead, actionText, phase, // optional syntax
    argumentTexts: [], localConditionTexts: [], // optional, kept per field
    ownerArgumentTexts: [], fullArgumentTexts: [], // optional owner/remaining-argument partition
    qualifierTexts: [], unknownQualifierTexts: [],
    qualifiers: { baselineText, exact, total, provenanceTexts: [] },
    requestedCountText,    // optional cardinality request, never a source value
    requestedCount: {text, value, scope: 'requested-list'} // optional
  }],
  constraints: { sourceText, editionText, conditionText, comparisonText },
  constraintTexts: [], complete, unresolvedTexts: [],
  staticEligible, playerStateQuestion, report
}
```

Optional properties are absent when the relevant syntax is not present. `originalText` is unchanged; syntactic strings normalize spacing, Unicode and curly apostrophes. `complete` means every grammatical request was classified, not that its owner, fields, actions or qualifiers are source-supported. A recognized adjective does not become evidence. Unknown requested nominal conjuncts use key `unknown`, remain in `unresolvedTexts`, and make `complete` false.

Keys are deliberately compact. Location, identity, stats, use, method, prerequisites, acquisition, provider, creator, teacher, recipient, outcome, sequence, composition, documentation, support, version, limitations and cause are the shared categories. Selectors retain distinctions such as coordinates, role/focus/type, individual attributes, price, selling/buying percentage, effect/bonus/penalty/purpose, keywords, crossing, placement, materials, reward, alternatives and metal. A material/metal request can never silently turn into a use request. Unsupported named statistics remain distinct selectors rather than being replaced with another available statistic.

Starting/initial/base text is explicit baseline metadata. Exactness and total/combined/sum wording are separate qualifiers; the parser neither produces a value nor authorizes arithmetic. Provenance wording such as source/documented/listed/stated/main and in-that-table is distinguished from unknown restrictions. Unknown owner adjectives stay in the full owner phrase. Unknown field-head modifiers and predicate suffixes remain in `unknownQualifierTexts`, `qualifierTexts` and `requestedText`. Requested cardinality such as three directories is separate from an asserted numeric quantity.

Context, source, edition and condition prefixes remain explicit. Conditional possession or completion is source-read syntax, never a save-state observation. Generic current-state, ownership or already-completed queries have `staticEligible: false`; combined actual reports are separately marked `report`. The caller must refuse to turn such a frame into a static source assertion. A neutral search-intent tail such as when-I-go-looking stays in `intentTexts` without contaminating the named owner or being treated as a source condition. Comparatives such as highest/lowest remain explicit constraints so roster identity cannot license an unsupported attribute ranking.

Only explicit procedural operators can set a phase (approach, escape, return, start, follow, completion, acquisition or preparation). A nearby task title, a starting-stat adjective or a saved objective cannot supply one. There is no conversation state in this module; a fresh field never replays the preceding field.

## Integration requirements and limits

The parent must resolve a shared canonical topic using complete subject/context candidates and verified source/entity metadata. Per-field subject strings are syntactic candidates and directed objects, not independent owner requirements or authority to change the conversation topic. Name-bearing content also remains in each complete requested clause. Retain the topic owner separately from a returned person, item or tool.

Require complete coverage of every field and selector through authorized whole witnesses, while independently checking every explicit source, edition, condition, material, comparison, quantity, phase and unknown qualifier. Refuse a static source answer when `staticEligible` is false. Do not treat `complete`, a known noun, a recognized action or a field selector as proof. Preserve atomic rollback if coverage fails. An incomplete frame must not enable an available neighboring use/effect answer through legacy fallback.

This remains a bounded structural English grammar, not unrestricted language understanding. Ambiguous operators, unknown fields or unrecognized conjunctions may remain unresolved. A syntactically typed frame may still have an unresolved owner or unsupported semantic restriction. No source-specific widening was added to improve a particular frozen answer.

## Verification

The 46 synthetic tests cover independent weather-station, appliance, staff, vendor, engineering and service examples as well as generic artifacts. Tests check shared owners for named statistics, distinct directed roles, coordinate fields, exact original text, unknown adjective/source/edition/material/quantity/action suffixes, corrections, conditional versus observed state, report guards, composition, unknown conjuncts, baseline/exact/total semantics, neutral search intent, explicit phases and noun-only follow-ups.

All 96 frozen fresh query strings were parsed into the separate syntax-only diagnostic `evidence/request-frame-fresh96-diagnostic-20261025.json`: 75 typed, 10 unresolved, 9 state-guarded and 2 deliberately deferred/unparsed. No source planner, response generator, model, embedding, browser or oracle scorer was executed. These counts are grammar diagnostics, not useful-answer accuracy or acceptance. Every full frame is retained for inspection.

Files added: `guides/js/assistant/request-frame.js`, `guides/tests/assistant/request-frame.test.mjs`, this review and the diagnostic JSON. No knowledge/dialogue/data integration, source facts, old oracle, model, profile, head, setup or asset was edited by this task.


## Passive and imperative owner separation

Passive nominal requests now separate a possessive or of-owner from the requested noun fields before scanning the field head. Terminal metadata operators (described, listed, recorded, stated, documented, specified and given) are syntax rather than unknown object qualifiers. Any suffix after the operator remains a qualifier. Thus an owner's role and focus are two fields, while an unknown possessive property such as serialization checksum stays key `unknown` and cannot collapse into the owner's identity.

Imperative WH complements use the same clause reader. Exact indirect WH possession operators use structural do-support without changing the preserved original request. A distinguishing-field wrapper keeps `qualifiers.distinguishing: true`; its sets/makes and apart/distinct/different/special scaffolding is separated from the owner and field head. Unknown adjectives inside either phrase are retained. Qualification questions remain limitations requests, including their explicit source or other suffixes. These are generic syntactic transformations with no entity names or source-specific clauses.


## Governed arguments, local conditions and cardinality

Directed role actions retain complete noun arguments in `argumentTexts`. Turning an input into an output preserves both, and the complete output can be an owner candidate. Making an output from an input preserves the same directed arguments. Each remaining non-owner argument also remains verbatim in `unknownQualifierTexts` for callers that already validate that property. Owner-equivalent arguments now remain separately in `ownerArgumentTexts` and `fullArgumentTexts`; their complete subject phrase still carries every unknown owner modifier. Modifier normalization never runs inside those noun arguments: for example, a physical base board does not lose the word base as if it were a baseline-stat request. Unsupported input materials therefore cannot disappear merely because the creator and output are known.

Only a leading conditional preamble establishes frame-wide `constraints.conditionText`. Trailing if/when/after/before conditions stay with their own field in `localConditionTexts`, qualifiers and the complete requested clause; they do not constrain unrelated sibling fields. Leading WH when/from-when questions are timing requests, never assumed conditions. Conditional possession remains read-only syntax, while a historical question such as when-did-I-use an object remains state-guarded.

Personal auxiliary scaffolding such as I-use or I-mention is not an owner. Actual governed objects remain arguments. Exact source-record phrases such as a person's table row or character notes yield their possessive owner; unknown source-record adjectives remain unstripped. Numeric noun-list requests now attach `requestedCount` only to their own coordinated field. Three data directories does not give the preceding working-folder field a count of three, and six names does not assign a count to the following replacement. Counts have scope requested-list; total/exact remains a separate qualifier and does not authorize inferred values or sums.


## Copulas, operation owners and safe deferral

Generic what/who-is questions expose `identityCandidateText` containing the complete copular noun phrase. An identity-only reading carries `requiresExactIdentity: true` on the frame and field. A candidate containing a field word (for example, an ordinary document title containing Combat) remains a complete candidate rather than being truncated to that word. Bare known field readings remain available as fields, while the caller can prefer a verified exact canonical entity name. The caller must not replace a whole candidate with an incidental named substring. Explicit possessive/of-field governors instead retain the owner and requested property; undocumented checksums and composition requests remain typed as unsupported/unknown fields and cannot collapse into owner identity. Unknown owner adjectives and constraints remain in the full phrase.

Install/configure, get/acquire and download are procedural operators rather than owner text. Generic installation emits method with empty selectors; download emits acquisition with the download selector. This does not manufacture installation/download source authority where none is indexed. Ordinary fight/battle/attack/defeat/counter operators emit combat with empty selectors, preserving the existing combat relation rather than misclassifying it as a generic method.

A recognized owner noun argument is not required to repeat literally in a witness. Its full phrase remains in subject scope and `ownerArgumentTexts`; `fullArgumentTexts` retains all parsed noun arguments, while `argumentTexts` and unknown argument qualifiers contain only remaining non-owner arguments. Thus a canonical alias can identify an item without being falsely treated as an added restriction, while an iron board used as a transformation input remains an explicit unproved argument. No unknown adjective is removed from the owner phrase.

Possessive locative noun heads (such as a person's recruitment meeting place) retain the personal owner/reference and the requested location selector. Nominal accompaniment predicates separate requested penalties/effects from come-with/belong-to grammar without discarding unknown target adjectives. A WHERE construction that the grammar does not actually parse now returns null/unresolved instead of a complete generic location field. In particular, a locative room-search scope cannot be silently replaced by a general item location; the complete original request is left to the older contextual source reader.

Final local validation: 46 synthetic tests pass. The syntax-only diagnostic was refreshed without planner/model/encoder/browser execution. Runtime integration, index/data files, existing oracles and frozen model assets were not edited in this follow-up. The parser is frozen for parent integration after this update.


Copular property-governor precedence was also checked for nested noun phrases: the weight of a person's vessel retains that entire possessive vessel as the field owner. An apostrophe inside a known full title is not by itself a field governor; only an explicit property noun after it establishes a possessive field request. Pure personal references can use a source-grounded identity frame rather than an exact literal name; `requiresExactIdentity` is false on that field. No named entity lookup is performed by the parser.


## Final governor-completeness boundary

Unrecognized WHO action predicates now return null/unparsed instead of defaulting to provider. A hearing, rescue, escort or other richer relation therefore retains its complete original predicate and all scope modifiers for the existing directed graph reader. The parser makes no claim that these distinct relations are equivalent to supplying an item. Generic creation/authorship governors (made/created/wrote/developed/authored/designed) explicitly request creator rather than provider.

Bare what-do-I say/ask/tell/mention questions defer intact to the existing dialogue reader; explicit noun-field keyword questions remain typed. This preserves the distinction between conversation wording, an approval condition and a later contact. A concrete personal-possessive location referent also defers to the directed ownership/family-role reader. Mentioning mother in a child's location record does not locate the mother. Personal locative field heads, such as her recruitment meeting place, still keep the reference plus the requested location selector.

An unknown action no longer creates a generic method slot by default. Only the already recognized operation grammar emits a field; unsupported predicates remain wholly unparsed rather than being partially claimed complete. Any unrecognized part of a mixed question remains unresolved. This leaves existing bounded readers responsible for the full retained predicate, including unknown modifiers and source restrictions, without loosening any frozen oracle.

The final grammar-only diagnostic counts include deliberate deferrals. They remain unrelated to runtime answer accuracy. No planner, model or native browser run was performed by this parser task.

## Checkpoint 13 structural governor follow-up

The parser now records the grammatical relation separately from a syntactic subject candidate. Directed teacher, creator, provider and recipient fields expose `objectTexts` (complete unresolved noun phrases), `objectRole` (`content`, `output`, `object` as justified by the governor), and `governorText`. Transformation inputs remain in the older `argumentTexts` and unknown-qualifier scope; no material is inferred or removed. These grammatical objects must be bound to reviewed literal source arguments by the caller. They are not names, aliases or permission to replace the active canonical topic.

Inverse opening questions request `method` / `open` and preserve the entire door/target in `objectTexts`. An available item-use effect cannot prove that inverse relation. Crossing operations separate a terminal purpose from the crossing target and retain the whole purpose in both `purposeTexts` and unknown qualifiers. A bridge-crossing source therefore does not automatically cover collecting an arbitrary object beyond it. Unknown purpose nouns, quantities and adjectives remain verbatim. Contextual locatives and leading/trailing conditional scopes retain their prior separate treatment.

Display words (`line`, `field`, `row`, `column`, `entry`, `listing`, `value`, `description`) become `metadataTexts` only after a recognized property in the same coordinated noun segment. They cannot license an unknown ledger property. A radioactive damage line still has a radioactive unknown qualifier. The presentation word practical is separated into `presentationTexts` only for a benefit head; travel remains a required `use` / `travel` selector rather than disappearing as presentation wording.

A named source actor is preserved independently in `sourceActorText` when a document assigns, records, recommends or describes a property. Its full name and all modifiers remain in scope even when the property target becomes `subjectText`. Possessive character notes/table rows still normalize to their actual possessive owner; unknown metadata adjectives remain untouched. The caller must validate the actor/source scope independently and must not silently ignore a named or revised manual. A modal passive such as how-should-its-guidance-be-treated uses the same possessive property grammar, retains the passive governor, and preserves every suffix.

Bounded which-side ellipsis repeats only the syntactically supplied field head. Each lens/object remains separate and complete; the second field records `inheritedFieldText: 'side'`, while `requestedText` remains the actual original fragment. Unknown elliptical actions stay unresolved. Software-related generic field heads distinguish `placement-check` from physical `placement`, `execution-mode`, `working-directory` / `data-directory` / `ide-directory`, build conditions, artifact outcomes, restart/maintenance limitations and toolchain policy. These selectors require literal corresponding source metadata; they do not imply a platform, folder, phase, program or output.

Current synthetic validation: 54 tests pass. The selected request-frame, router, guard, index, integration, fallback-preservation, actor-phase and source-role contracts passed 154/154 before the last modal-passive-only addition. The final selected-contract run is recorded separately below. All tests use existing local Node and existing fixtures; no model, encoder, native browser, install or download was invoked. Remaining alternatives/unsupported relation grammar continues to defer rather than manufacturing a generic supported field.

### Final additive API and verification

Explicit finite alternatives now expose `alternativeTexts: [fullA, fullB]` and `contrastText: 'or' | 'alone-or-too'`. The parser preserves all modifiers within both options and does not select a branch, assert polarity or generate an answer. Execution-through alternatives retain `identity` / `execution-mode`; a recognized property-for-A-alone-or-B-too retains its requested field. Unknown property heads remain unresolved. The caller must prove the entire source contrast, including both alternatives and the operator, rather than matching just one familiar artifact or recipient. The existing general exact-identity boundary is unchanged for descriptive WHO candidates that require a richer role relation.

Final additive field properties are `objectTexts`, `objectRole`, `purposeTexts`, `sourceActorText`, `metadataTexts`, `presentationTexts`, `governorText`, `inheritedFieldText`, `alternativeTexts` and `contrastText`. These augment, rather than replace, the original complete clause, argument partition, qualifiers, constraints, context, state guard and exact identity candidate. None is source evidence.

Final validation passed 55 synthetic tests and 158 selected contracts in `/tmp/request-frame-structural-contracts-20261025-03.log`. The syntax-only frozen-96 diagnostic now has 80 typed, 5 unresolved, 9 state-guarded and 2 deliberately unparsed frames. Those counts are not useful-answer accuracy. Corpus SHA256 remains `5cd6b923fca976dd9ae8d9023e4fe637e37aea3591ac3ecdfc0f63e9f8ae6a5b`. Parser SHA256 is `67f8a01e29e09fd705864fd8804a9e2a6fd0ee03bd16bc3f710215be4f4abd22`; test SHA256 is `0e4b4c7dd023f897ae9fdb43a091ba9e3a21f296fd5625db6c9faedb16cbb551`. The four owned files are frozen after this update.

### Final property-owner wrapper follow-up

Reflexive metadata now separates from an owner only when the remaining phrase is already a complete recognized personal/deictic reference. The client itself yields the client plus `metadataTexts: ['itself']`; an unfamiliar radioactive client or a named person's full phrase remains untouched. This does not normalize arbitrary entity names.

A reward governed by finishing/completing a recognized task reference yields that task reference while keeping the full completion action in `purposeTexts` and its verb in `governorText`. A sequence-alternatives property governed by reaching/entering/accessing a destination similarly preserves the full purpose and complete destination, including unknown modifiers. These wrappers do not set a phase or assert completion. Other field types and uncertain task phrases keep their original subject.

A limitations property governed by treating/using X as Y yields complete X as the owner candidate, keeps the whole nominalized action in `purposeTexts`, and keeps `as Y` as an unknown qualifier. Unknown materials, categories and modifiers inside either X or Y therefore remain required source scopes. Other gerunds and other property types are unchanged. No field, name, source fact, spelling alias or source-supported answer is inferred from the wrapper.

The follow-up synthetic suite passes 58/58. The syntax-only frozen96 counts remain 80 typed, 5 unresolved, 9 state-guarded and 2 unparsed; corpus SHA remains unchanged. Updated parser SHA256: `af3c9bd5de1a15d8d81762f1ab281cf1d529a40607bd015351e8cfd028bad864`; test SHA256: `6e32ac79896e9a621a1cec6c5fcbe2a51cff5e6120759697dfc085e850ae46c5`. The selected final contract result is recorded below.

### Required-location source governor

A bounded where-source-mark/list/record/describe-target-as-required/necessary/essential construction now emits `location` / `required`, complete target `subjectText`, complete `sourceActorText`, and the explicit `governorText`. No ordinary WHERE request gains a required selector. Unknown source actors and unsupported mark-as statuses defer intact. Trailing caveats, quantities and conditions remain unknown qualifiers or the existing local-condition scope. A source pronoun such as they is not resolved in this parser: the caller must require its grounded preceding source actor in the same request, or decline the typed plan. Possessive character notes can remain a separate source actor while their personal owner remains the field subject. No agent role is inferred from a grammatical object.

Final parser-only suite: 59/59 pass. Final selected shared run: 160/162 pass in `/tmp/request-frame-structural-contracts-20261025-05.log`; the two failures are existing concurrent index/data checks outside the parser scope: four missing declared argument entities on Albion khunag-notes, and changed seller subject IDs versus the index test's previous exact Brion-crystal expectation. Parser, router, guard, integration, fallback, actor and role checks pass. Those two index failures were reported to the parent and left untouched; no oracle was loosened.

Final parser SHA256 is `8debda98dc965488e94de43c3b2b6c64be6a163f09b1ba66ee7aad0d3a061d6c`; test SHA256 is `d63af43c382b748274f7be91c5604ebebf2863d4e9da26e8f48ef814ad5aa815`. The syntax diagnostic retains unchanged corpus SHA and counts (80 typed, 5 unresolved, 9 state-guarded, 2 unparsed). The four owned files are frozen after this update; no production integration, source/index data, old oracle or model file was edited.

### Answer governors and local replacement attachment

A nominal answer field followed by gets/takes/leads me/us past X now retains that finite governor in `governorText` and complete X in `objectTexts` / `objectRole: 'object'`. This applies only when the entire requested nominal field is already method/riddle-answer; it does not turn a weapon, generic password or unknown operation into an answer relation. Adjectives in the answer head remain unknown qualifiers. Every modifier, material and suffix inside X remains in the full object scope. The caller must prove an explicit riddle/answer relation and its owned obstacle, not merely any answer text or incidental mention of X.

For an imperative with coordinated properties whose final conjunct is the explicit replacement-for-X relation, earlier fields now carry `subjectMode: 'topic'` and no local `subjectText`. Only the replacement field keeps complete X as its local subject. The caller must use an explicitly grounded outer topic for topic-mode fields, even if the frame's other subject candidate is X. Strength-and-dexterity-for-X, a lone replacement-for-X and other owner prepositions keep their existing shared-owner grammar. The full original clause, counts and unknown modifiers remain unchanged.

The parser-only suite passes 61/61. Syntax-only diagnostic counts remain unchanged (80 typed, 5 unresolved, 9 state-guarded, 2 unparsed) and the frozen corpus hash is unchanged. Current parser SHA256 is `d758b3444936ba2e3ba9ebe937dd372194e116467e4e4f52d2279d1e5a288289`; test SHA256 is `dc06da856ed5c6e387a5f38e7639c838a5c61139ce9e4b6016d479a308ccd67e`.

Latest selected-contract diagnostic: `/tmp/request-frame-structural-contracts-20261025-06.log` has 154/165 passing during concurrent parent integration. The earlier index issues are resolved. Ten guard/fallback checks now throw because `fieldProof` reads `context.knowledge.facts` when `context.knowledge` is undefined; one existing stale-focus negative answers after an unknown identity followed by a shard-timing query. These integration failures were reported with exact paths to the parent; they are outside this parser's owned changes and no integration/oracle fix was made here. The parser's 61 synthetic tests all pass and its final hash above is frozen.

### Indirect transport and modal opening governors

An explicit WHERE source tells-me/us-to-take/bring/return/deliver-X clause now separates the complete source actor from X. X is both a syntactic subject candidate and an `objectTexts` noun phrase with grammatical `objectRole: 'object'`; `governorText` retains the indirect transport operator and `actionText` retains the full transport action. Trailing destinations, purposes, instruments and unknown caveats remain verbatim in argument and unknown-qualifier scope. Unknown source actors or unrecognized tell-to actions defer intact. This grammar does not infer a destination, route, recipient or source authority.

A modal opening property now separates an owner from supposed/intended/meant-to-open/unlock wording only for an explicit openable target head. The complete requested target category remains an unknown qualifier, rather than assuming any passage, chest or door is interchangeable. Every explicit action object or prepositional tail also remains a required scope; a named silver door or a without-key restriction cannot disappear. Other modal operations and uncertain property heads remain unchanged. The completion-reference wrapper applies to every outcome field, including outcome with no reward selector, while retaining the full completion purpose and source actor.

The parser-only suite passes 63/63. Syntax diagnostic counts remain 80 typed, 5 unresolved, 9 state-guarded, 2 unparsed, with unchanged frozen-corpus SHA. Final production parser SHA256: `08356a3e740e6d38f0eba00c55397add82fd25ddbc0ce32c05690a003b2f2eb4`; test SHA256: `d89e7f8a48aac5e5a38494ab1f5949d85020b8c91b38066f8b3e42dad36f00e1`. No model, data, oracle or integration file was edited. These four owned files are frozen for the parent's full native validation.

Final selected shared-contract run passed 167/167 in `/tmp/request-frame-structural-contracts-20261025-07.log`, including the previously reported guard/index/focus checks after the parent and owning agents' concurrent repairs. No live test handle remains.
