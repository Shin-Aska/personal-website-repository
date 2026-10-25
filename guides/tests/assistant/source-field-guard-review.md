# Static source-field fallback contract and citation review

`guardSourceFieldReply` in `guides/js/assistant/source-field-guard.js` checks the
actual source-only legacy answer against a complete static request frame. It
returns `false` or complete typed coverage, including each requested key and
selector, contributing record IDs, full authorized witnesses and exact source
provenance. It does not select subjects, parse questions, generate answers,
change progress or verify arbitrary model prose.

Call it before definition/download presentation rewrites, only on static answer
paths. Supply `frame`, `reply`, `records` and the compiled `sourceFields` array
or index `{entries, issues}`. Canonical `subjectEntityId`, `subjectLabels` and
`grounded` come from independent source resolution. Context or source/edition/
condition constraints require the caller's existing `isEligible` predicate;
this type check never supplies or weakens that scope proof. Reports, state
queries, actions and progress paths remain owned by their original handlers.

Every requested field and selector needs actual coverage. Separate typed
entries may jointly cover different selectors, but all required selectors must
be covered and every selected record must contribute. A malformed, unresolved,
unknown-field, partial-sibling or out-of-policy answer is rejected. Raw records
must be independently authorized at the current tier, selected by returned ID,
fully present in the actual reply, and cited with their exact source. Typed
child witnesses must be literal parts of the complete returned record; they
cannot license clipping source conditions away.

The compact ontology keeps material/composition separate from use/effect,
identity, location and numeric fields. Ordinary raw use, location and identity
relations remain usable. Specific selectors require typed source fields, except
the ordinary `use[effect]` meaning of a raw use relation. Composition additionally
requires reviewed explicit metadata. Classifier labels confer no field proof.
The actual Sceptre effect and Sunscorch's metal-trigger damage row fail a
composition request even when their full source text is returned. A synthetic
literal bronze-composition fixture tests the positive material contract without
adding any game fact. Recognized action grammar and provenance framing do not become material
constraints. Only unknownQualifierTexts needs additional literal scope.
Metadata-only extra qualifiers absent from the displayed source cannot authorize
additional wording. Baseline/exact qualifiers require appropriate typed
structured statistics or explicit qualifier metadata; total additionally needs
a source-recorded total and never instructs this gate to add individual values.

The source-field compiler can validate a curated child whose exact locator
differs from its containing raw source record. An explicit backing
`sourceRecordId`, canonical owner, file lineage and literal witness membership
allow the containing complete record to be displayed. Coverage retains both
distinct provenance tuples; it never asserts parent/child source equality.

The observed BWAPI secondary citation defect is not a stale selector in the
current StarCraft overlay. Inspection of the original HTML confirms that the
first troubleshooting child is Antivirus Blocking SCHNAIL, whereas
`#bwapi-loading-checks` is the separate BWAPI node. The overlay and adapter
already identify its `ul` correctly. The raw Direct engine answer reproduces
two citations while selecting only `starcraft:bwapi-loading:checks`: a successful
checklist sibling and a non-answer sibling contribute to a combined source
array even though the latter's related text is not displayed.

`normalizeSourceReplyCitations` now runs at the start of `presentSourceReply`,
including when the legacy packet has status `clarify`. It retains citations for
complete displayed, selected authorized source records, explicit displayed
narrative claims, and declared displayed resources or reviewed definitions.
It drops the unrelated antivirus citation without changing answer prose or
record IDs. Genuine multiple-record sources and explicit narrative primary
references remain intact. Non-answer/report paths are unchanged. No correct
StarCraft overlay mapping was edited.

Validation: 19 focused tests pass across source-field-guard.test.mjs,
source-reply-citations.test.mjs and knowledge-definition.test.mjs. A broader run
also passed the 11 capability-role conversation tests before the final small
malformed-input/child-provenance additions; those additions were covered by the
final focused run. The guard and source-responses modules pass syntax checks.
No engine, request frame, knowledge router, dialogue, knowledge manifest,
model, asset, frozen oracle, installation or publication change was made here.

The legacy integration audit additionally compared raw-engine, field-guard and
full-conversation outcomes across all six game pools. It found a shared scope
callback issue: a valid own-relation raw record can have no source-field-index
entry, so checking scope only through matching index entries falsely rejects
ordinary use/location answers. It also found general parser contracts retaining
operation verbs or resolved owners as unknown arguments; those findings were
sent to the owning agents rather than patched here.

One guard correction from this audit preserves explicitly reviewed extra
ordinary roles: a record's authored-index `answers` declaration can support
use, location or identity, with `identity:false` still enforced. It cannot grant
composition or an unproved named selector. The actual Sumie location excerpt
is the positive regression; an unindexed extra role is its paired negative.

Requested-list counts now use `sourceFieldCardinality` only after every field,
selector and selected record has coverage. Count mismatches, absent members,
unrelated price digits and shortened output are rejected; there is no list
trimming or computed total. The combined request-frame, source-field-router,
guard, citation and definition contract subset passes all 61 tests. Actual
Sceptre/Mirror effect-to-unknown-metal-to-known-subject smoke sequences retain
complete supported answers and withhold unknown material without citations or
state changes. Remaining general diagnostic/procedure continuity gaps were
reported to root and are not claimed fixed by this module review.
