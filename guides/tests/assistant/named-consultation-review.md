# Named option evaluation

The production consultation controller now recognizes a bounded named-option
evaluation, including “Would Jaana be a worthwhile early recruit for magic?”
It matches the complete named profile and complete requested criterion before
checking the existing source witnesses. The response quotes the existing
source and establishes that profile's canonical entity for follow-ups. A named
option without that trait cannot be replaced with another catalog candidate.

The only catalog change is the criterion alias `early recruit for magic` under
Ultima V's existing `earlyMagic` criterion. The original source is
`guides/js/Ultima5.js`, `companionData[2]`: Jaana is a Mage and “An essential
early recruit. As a mage, her spellcasting ability is invaluable throughout
the game.” The existing catalog profile, trait witnesses, summary, IDs and
source coordinates are unchanged. The new alias composes the already reviewed
early-recruit and spellcasting concepts; it is not a whole question alias or a
new ranking claim.

`parseNamedOptionEvaluation(text)` returns a frozen descriptor retaining the
original text, complete subject and criterion complements, evaluation word and
any recognized guide-only preamble. The finite grammar accepts worthwhile,
good and suitable evaluations. A source-only preamble uses the existing source
grammar. Complete aliases must match exactly after normalization and a leading
article; embedded known names cannot erase unknown names, numbers, materials,
editions, additional clauses or requested sources. Named best/strongest forms
are recognized for rejection instead of being turned into a general catalog
winner. The existing generic goal-selection flow is unchanged.

The named candidate pool contains only the matched canonical profile. Existing
authorization still verifies profile/trait/prose witnesses, exact source
quotes, spoiler ceilings, conflict flags, guide-only restrictions and edition
constraints. Named evaluation adds no alternatives or inferred comparisons.
Its response has no actions or state changes, and establishes no actual
recruitment, current party membership or player-save facts.

Eight authored tests cover the reported Jaana request, the subsequent actual
conversation request “Where do I find her?” (Yew), the same grammar across all
six game catalogs, wrong-profile traits, unknown people, radioactive modifiers,
quantities, unknown editions/platforms, original-manual restrictions, hidden
and conflicting evidence, source-only research exclusions, unmodeled prices
and trust, extra actions and global rankings. These are structural regression
cases using original source records and explicitly synthetic intent scores;
they are not model accuracy evidence.

Validation passed:

- 8 new named-consultation tests.
- 22 existing rollout, dialogue-contract and consultation-focus tests (30 total
  with the new tests).
- Production rollout consultation audit: all 74 witness uses, 18 criteria,
  8 negative conditions and 3 bundle guards across 6 games/18 profiles.
  The audit's report write was intercepted in memory so the existing evidence
  artifact and its expected cases remained unchanged.

No frozen factual oracle, fact witness, encoded knowledge document, model,
profile, head, setup, asset, vector, installation or deployment changed.
