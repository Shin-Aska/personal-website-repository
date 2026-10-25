# Static conditional source properties — 2026-10-25

`guides/js/assistant/static-property-conditions.js` is a pure, finite request parser
and all-or-none proof adapter. It does not read player state or assert completion
of any installation, login, purchase, quest, or inventory action.

## API

`matchStaticPropertyCondition({text, entities, focus?})` returns a frozen descriptor
or `null`. `entities` is the current knowledge entity Map. The accepted complete
forms are:

- `If I choose/use/pick <exact named subject>, do I have to/need to install <target> separately [first]?`
- The same choice prefix with `must I install ...` or the connectivity question below.
- `Once I have logged into <exact named subject or it>, do I have to/need to/must I stay/remain connected to [the] internet during matches/play/gameplay?`

The `must I` wording replaces `do I have to`; it is not preceded by `do I`.
The final question mark is optional for these otherwise complete forms. The login
prefix also accepts `Once I've logged into` (including a curly apostrophe);
contraction expansion applies only to the parser's working string.
The descriptor retains `originalScope` byte-for-byte and `questionText` in full
apart from whitespace normalization and the final question mark. Subject labels
and IDs come from exact unique current entity aliases. An installation target is
retained whole, including numbers and edition/material words; it is never reduced
to a convenient base name. Additional clauses and suffix restrictions fail closed.

Literal `it` is accepted only for the phase form when the caller supplies
`focus: {entityId, grounded:true}`. Grounded means an existing, uninvalidated,
complete source answer established the conversation subject. It does not mean
the player has logged in. No other pronoun or contextual subject is inferred.
The caller must withdraw focus after subject invalidation; the helper can check
current entity existence and name ambiguity but cannot observe conversation history.

Descriptors distinguish `kind:'choice'` with the actual choice verb from
`kind:'phase'`, `condition:'logged-in'`, `phase:'after-login'`. Properties are
`separate-installation` and `internet-during-play`. The helper supplies no answer.

`resolveStaticPropertyCondition({descriptor, entities, focus?, facts,
requiredFactIds, isEligible, proves})` reparses the whole original request against
current entities/focus. Every explicitly required fact ID must exist exactly once,
belong to the same subject via `entityId`, and pass `isEligible(fullFact,
descriptor)`. The caller's mandatory `proves({descriptor, facts})` must return
`{condition:true, property:true}`. Any failed or absent part withholds all `factIds`.

## Integration contract

Keep normal source, edition, material, numeric, spoiler, negation, and question
relation guards over **originalScope**. Never replace it with `questionText` for
eligibility. The parser recognizes a question shape; it never licenses unknown
target labels or unsupported qualifications. For example, `Brood War 2026` stays
`Brood War 2026`; a witness about plain Brood War does not prove that request.

`proves` must inspect explicit same-subject source witnesses. For the SCHNAIL
network question, the required proof must cover initial login and gameplay after
login, including the ongoing connectivity property. An initial-login-only fact,
a later-play-only fact, or evidence from another client is incomplete. When the
source records those clauses in separate facts, require both IDs and render the
full eligible original facts together. A source's negated requirement (no ongoing
internet needed) can answer a positive requirement question; a negated user
condition remains outside this finite grammar.

Choice describes a proposed subject selection; it does not justify current
ownership, installation, or progression. Phase describes the source phase being
asked about; it does not set a logged-in flag. There is no generic conditional,
counterfactual progression, acquisition/inventory, or hypothetical bypass.

The pure Node test suite exercises choices, exact aliases, paired witnesses,
missing/duplicate/ineligible proof, unknown and stale subjects, absent/ambiguous
focus, extra qualifications, reports/current state, compounds, negation, descriptor
tampering, and no mutation. No models, profiles, datasets, installs, or network
services are involved.
