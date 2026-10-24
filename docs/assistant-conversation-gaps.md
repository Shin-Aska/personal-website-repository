# Open conversation gaps, 24 October 2026

The bounded sustained campaign is complete. Passing source-backed conversations do
not establish that the assistant answers fresh questions with the right meaning.
The exploratory evidence is
`guides/tests/assistant/evidence/conversation-lore-gap-probes.json`. These 16
fresh-topic probes are **not** passing acceptance cases or an accuracy estimate.

## Identity meaning defects found and corrected

The observations below are the preserved pre-fix failures. Identity requests now
reject records explicitly indexed only as quest interactions. Ultima V has a
game-specific Lord British profile from its original Book of Lore manual, with a
visible outside-research citation. Its Shadowlord identity uses the guide's
stated influence and the three names/powers, rather than banishment instructions.
Al-Qadim extracts the guide's stated roles for Tarik, Jessamin, Kara and
Pangar-Bek. The remaining procedural-only subjects honestly decline an identity
request and offer the supported guide context or location.

Exact regressions and sustained branches distinguish identity, quest context,
rescue outcomes, pronouns, guide-only restrictions and spoiler levels. Older
fixtures that accepted procedures as identities now record the intentional
meaning correction; expectations require the correct source facet or a decline.
The Ultima V counsel's campaign scope also preserves a named person's identity
and an item's own use/location instead of substituting a quest alias.

| Guide | Exact question | Observed reply | Required correction |
| --- | --- | --- | --- |
| Ultima V | Who is Lord British? | Lord British returns and the tyranny collapses. | A rescue outcome cannot be his identity. Route to a sourced person profile, or state that identity is unavailable. |
| Ultima V | What is a Shadowlord? | Three banishment objective titles. | A task list cannot define the concept. Keep the supported list for list questions; use a reviewed definition or an honest identity boundary. |
| Al-Qadim | Who is the Caliph? | Request an audience with the Caliph via the Vizier. | Separate quest interactions from identity. |
| Al-Qadim | Who is the Vizier? | Audience, mind scan, infiltration and defeat instructions. | Separate identity from procedures and preserve their existing quest routes. |
| Al-Qadim | Who is Aliya? | Sword and peace-treaty instructions. | Add a reviewed identity only if the sources state it; otherwise offer the supported quest context as such. |
| Al-Qadim | Who is Tarik? | Rescue Tarik; restore his voice. | Existing Chapter 16 explicitly calls Tarik your brother, so a reviewed identity can use that fact at its existing spoiler ceiling. |

These were exposed meaning defects, not approved limitations. The remaining
absence of a biography is a knowledge boundary, separate from the corrected
interpretation. No Ultima VII biography was transplanted into Ultima V. The rule
that a location does not establish identity remains in force.

## Knowledge and explanation coverage

The probes also confirm these unavailable definitions/explanations: Albion's DDT,
the Goddess, and why Harriet replaces Rainer; Ultima V's Underworld; Ultima VI's
Gargish and why gargoyles fear the Avatar; Ultima VII's Codex, gargoyles and why
Lord British rules Britannia. They currently clarify or decline; some offer
explicitly labeled related guide text. Investigate existing guide text first.
A statement that a replacement happens does not establish its cause, and a
premise about the Avatar as destroyer does not automatically establish an emotion.

Ultima VI's Draxinusom question returns a sourced brief physical description
(a large, winged gargoyle of regal bearing). That is a narrow profile, not evidence
of a full biography. Broader character/world coverage needs reviewed sources.

The campaign also deliberately preserves boundaries for missing spell reagents,
unrecorded purchase methods/prices, unsupported editions, false premises and
unmodeled family ties. Such refusals are not factual coverage and are not all
knowledge gaps worth filling.

## Existing owner decisions remain open

- Ultima V/VI/VII companion recruitment: locations are not declared acquisition
  methods; preserve the current declines until the owner changes that decision.
- Known source conflicts: Al-Qadim's Gilded Dove, Wisest Snake, Idrid's Veil and
  Nameless One strategy remain withheld with a visible conflict explanation.
  The guide's potion descriptions and rule-book summaries also differ; this
  campaign checks documented shop prices and the guide's standalone
  Invulnerability Potion defense description. It does not accept the disputed
  Extra Healing or Giant Strength effects. That standalone potion is not defined
  by the cited manual's elemental-oil description.
- Other guide data discrepancies and publication boundaries remain recorded in
  `assistant-handoff.md`. Do not resolve them by picking whichever source makes
  a test pass.

## Verification and remaining scope

The final campaign covers 132 conversations / 1,097 visitor turns across all six
interfaces. Its current browser replay, regressions, reviewed family/help matrix,
native full-corpus baseline and current-code targeted model checks pass. Exact
counts and source-snapshot limits are recorded in
[`assistant-conversation-goal.md`](assistant-conversation-goal.md) and
`guides/tests/assistant/evidence/conversation-final-acceptance.json`.

The missing biographies/definitions/causes above, Steamhammer attribution accuracy,
and the standing recruitment/source-conflict decisions remain documented knowledge
or owner-policy boundaries. They do not authorize invented facts. Future breadth
work should start from reviewed sources and the coverage review's subject priorities.
The completed regression campaign is not exhaustive game knowledge or a blind
holdout accuracy result. All changes remain local.
