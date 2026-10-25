# Actor source location context review — 2026-10-25

Reviewed the existing Al-Qadim adapter records against the current `DB.bestiary`
declaration in `guides/js/AlQadim.js`. This is a helper contract and source review;
it does not claim a new browser acceptance result.

The same exact canonical actor `alqadim:bestiary:giant-boar` has two independent
source records. The combat witness at `DB.bestiary[3].strategy/danger` is the full
text “Giant Boar: Charges in straight lines. Dodge sideways, then strike from
behind. Danger: Medium.” The direct location witness at
`DB.bestiary[3].location` is the full text “Giant Boar: Oasis Outskirts.” The
combat text supplies the strategy; the separate location text supplies literal
oasis context. Neither source establishes a leave-before condition, containment
edge, route, current quest state or objective completion.

`sourceActorLocationContext` now exports the same argument and return shape as
the existing item helper: `{fact, sourceRecords, contextTerms, entities,
isEligible}` returns `{records, supportedTerms}`. The item helper is unchanged.
The new helper admits only actor combat facts whose complete `text` equals both
their `witness` and the complete authorized base combat record identified by
`sourceRecordId`. An objective cannot acquire combat authority through a
location. Canonical entity IDs must match exactly; aliases, title similarities
and graph neighbors cannot join records.

Both witnesses must use extracted sources with nonempty, single file/locator
attribution. Their files must agree and their locators must differ. The location
must be independently authorized at direct level; the complete combat record
may have a balanced or gentle source variant authorized by the direct ceiling.
The callback must explicitly return `true` separately for the combat fact and
the authorized location, retaining the caller's source and edition restrictions.
The helper counts all same-actor location candidates before filtering for
eligibility. Duplicate IDs, hidden locations, conflicting witnesses and
competing locations remain unavailable or ambiguous.

Every caller-supplied topical term must occur literally in the union of the full
combat and location text, and at least one term must require the location. Terms
are not inferred from aliases, locators, containment, spelling stems or omitted
modifiers. The helper returns only the complete location record plus unchanged
supported terms. The shared reader must continue to apply its existing primary
predicate, identity, negative, measurement, material and player-state guards;
this helper is exclusively a topical-context proof and returns no answer text,
method, instruction, action, progression or graph relation.

Validation: the new `actor-source-location-context.test.mjs` and the existing
`source-location-context.test.mjs` pass together, 16 tests total. Coverage includes
the actual two Giant Boar witnesses, the person and monster kind families,
wrong canonical actors, unknown modifiers, wrong predicates, self-consistent
combat excerpts, unsupported source files/locators, conflict, hidden variants,
duplicate/competing locations, strict independent eligibility and edition
rejection, no generated instruction fields, and input immutability. No source
declarations, manifests, embeddings, model files or existing test oracles were
changed by this helper work.
