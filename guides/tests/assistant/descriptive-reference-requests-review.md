# Descriptive person reference review — 2026-10-25

Reviewed the current Ultima V `companionData[4]` declaration in
`guides/js/Ultima5.js` and the existing `companion-johne` focused fact. Its complete
text remains “Mage. The strongest mage in the game, but he is difficult to reach,
located on a wrecked ship in the Underworld.” The existing identity and
explanation roles authorize quoting that owned description. They do not authorize
computing a party ranking, guaranteeing exclusivity, inferring recruitability at
a future time or inventing a route to Johne.

The new finite parser handles the compound shape “I meant the strongest mage for
later: who is it, and what makes reaching him difficult?” as one descriptive
person request with both identity and reach-difficulty fields. “I mean/meant” is
a subject correction; the exact optional phrase “for later” is retained as user
planning intent. Every other trait modifier and appended suffix remains intact.
The helper does not parse an isolated WHO question or split this compound into
partial answers.

`supportsDescriptiveReferenceRequest` returns only a boolean. Its caller supplies
the full fact, canonical person ID, labels, kind and an independent eligibility
callback. The fact must own the exact canonical person and subject label, expose
both identity and explanation roles, use an extracted single-source attribution,
and preserve `text === witness`. A literal full trait span must occur in one
directly attributed description joined to that same person's difficulty reaching
the stated location. The grammar accepts literal “strongest …” and “most
powerful …” source descriptions without treating them as synonyms or computing
which actor wins. Alias-only matches, neighboring people, other actors mentioned
in the text, co-occurrence, separate facts, incomplete fields, negation,
conditional wording, uncertainty and reported claims fail closed.

The shared reader must independently preserve source, edition, quantity,
material, current-state and other request constraints, require exactly one
matching candidate, and render the complete original fact. A parsed but
unsupported descriptor must produce an unsupported result rather than continue
to a partial fallback. The new helper creates no prose, ranking, aliases,
ordering, progression, state update or availability assertion.

Validation: `descriptive-reference-requests.test.mjs` passes all nine tests. It
checks the actual Johne source witness, canonical ownership and roles, general
person/class descriptions, literal superlative distinctions, atomic compound
fields, unknown traits and suffixes (including radioactive, quantity, material,
source, edition and time modifiers), absent reach difficulty/location, false or
conditional claims, rejected sources, strict caller eligibility, deliberately
ambiguous candidates and immutability. This review is not a browser acceptance
result. No guide source declarations, manifests, vectors, models, existing test
oracles or other runtime modules were edited by this scoped helper work.
