# Factual property reader review

Scope: new shared `factual-property-requests.js`; no data, model, head, profile,
setup, package, or existing core-file changes. No installation or download.

The reader returns a typed descriptor and boolean capability proof. It produces
no answer, yes/no claim, ranking, inferred requirement, synthesized comparison,
player-state claim, or action. Callers render complete original source facts.
Every fact must have full `text === witness`, no conflict, and explicit reviewed
roles; source authorization and canonical subject binding remain caller duties.

## Reviewed source positives

- `alqadim/swing-wide-swing` and `swing-quick-swing`: reciprocal authored
  `support.comparison` indexes, combat/use/method capabilities, literal attack
  coverage and controls, and explicit comparative source wording. Both complete
  profiles may be juxtaposed for an unqualified difference question.
- `ultima5/mantra-word-distinction`: one use/explanation paragraph explicitly
  binds Mantras to Shrines and Words of Power to dungeon unlocking with `while`.
- `starcraft/purplewave-java`: one prerequisites/version witness explicitly
  requires a 32-bit JDK 8 for PurpleWave and explicitly forbids substituting
  SCHNAIL's Java 21 recommendation. This is not inferred by comparing unrelated
  runtime facts. Its external-research restriction remains the caller's duty.
- `alqadim/swing-full-circle-swing`: one combat/use witness explicitly describes
  a complete 360-degree cut catching monsters behind the actor. A 360-degree
  value by itself is insufficient.

## Integration contract

Parse the full source question before the ordinary request-facet/comparison
heuristics and before consultation routing. Preserve `subjectText`,
`referenceText`, and `propertyText`; exact subject resolution may remove a
leading article but cannot drop a qualifier, count, edition, material, second
clause, or unknown noun. Deictic subjects require an independently grounded
active source subject. Reference subjects remain explicit and separate.

A suitable knowledge-router hook is alongside `methodAssertion`, after normal
source eligibility/restriction helpers exist and before broad comparison
selection. Select candidate facts by canonical ownership or reviewed subject
bindings, apply the existing source/edition/restriction gates, and pass only
those exact facts to `supportsFactualPropertyRequest`. On success call the
existing `respond` with the complete proof facts; retain primary focus. On an
unsupported typed request decline/clarify with no citations, and suppress
consultation so the comparison model label cannot turn a factual assertion into
a recommendation. Requests with inherited unknown restrictions must still fail.

For U5's distinction paragraph, the two requested names are literal subjects
inside one declared composite entity: resolve the complete pair, not two
unrelated incidental name hits. For PurpleWave, canonical owner labels must
include the actual named tool (`PurpleWave`), not just its runtime child label.

## Validation

`node --test guides/tests/assistant/factual-property-requests.test.mjs`
passes all seven groups. Each actual positive is paired with missing/wrong
reviewed roles, missing comparison witnesses, wrong property or subject,
negation/uncertainty/contradiction, unknown quantity/material/edition/platform,
and unsupported additional complements. Tests also reject forged descriptors,
partial witnesses, conflicted facts, cross-fact stitching, and ungrounded
pronouns. No changes are made to source facts or descriptors.
