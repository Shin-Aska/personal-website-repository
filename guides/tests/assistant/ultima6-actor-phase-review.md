# Ultima VI actor and phase metadata review — 2026-10-25

Reviewed the current `gameData.quests[0].sections[0]` (Compassion) and `[4]`
(Sacrifice) declarations in `guides/js/Ultima6.js` against the failures recorded
in `evidence/knowledge-blind-browser-fresh-20261025-23.json`. This is a source
authorization and metadata review, not a fresh browser acceptance result or an
independent game playthrough.

The manifest retains 111 facts. It now declares 146 entities, 109 directed links
and six source contexts. Changes add two entities (Shrine of Compassion and MU),
seven directed edges, one exact section context, and literal subject bindings.
Every fact's id, subject, facet, aliases, text, witness, source and sourceRecordId
is unchanged. The encoded-document SHA-256 is
`6de63e96da17d50e35025ddedd5e68bc3e8ee27d4437807c3a2b7c4ac4ab24f6`.
The protected-field SHA-256 used by the existing Ultima VI tests is
`eed18365645c80ffbad807bf333802ecbf83cf7fd2f37f9f679edfd68b009dac`.
Embeddings, models, manifests for offline use and browser oracle files were not
edited by this metadata change.

The existing Ben → Yew Log `sells`, Julia → Panpipes `crafts`, and Gwenno → Stones
`teaches` edges already prove those actors. The new Board → Julia `converted-by`
edge indexes the input-side conversion role. Its full `panpipes-makers` evidence
retains the log purchase, cutting and request to Julia; it does not claim Ben
makes the instrument. Board → Yew Log `cut-from` and Panpipes → Yew Log
`raw-material` index the source's explicit material chain. Ben → Yew
`located-west-of` preserves the directional qualifier, rather than locating him
inside Yew. No “wooden board” or “raw wood” question alias was introduced.

Stones → Selganor `performed-for` has both `gwenno-song` and `selganor-rune`
evidence. The first source names STONES and its numeric tune; the immediately
following source calls it “the tune” and names the performance recipient and
conditional rune reward. Both facts must remain eligible and be rendered in
full. A performance recipient is distinct from an item recipient and from the
teacher. The source context uses the existing Sacrifice quest as its anchor and the literal Sacrifice title as its label. It is the exact Sacrifice section and
supports continuity only; it creates no prerequisite or player-state claim.

Rune of Compassion → Anya `requires-permission-from` has complete proof from
`ariana-consent`, `anya-permission`, and `ariana-rune`. This preserves the Anya
conversation at the Blue Boar Tavern and Ariana's later confirmation. The
existing conditional Ariana → rune `gives` and Anya → Ariana `continues-at`
edges remain separate. The shrine's MU binding and `accepts-mantra` edge are
supported only by `compassion-mantra`, after the permission and acquisition
dialogue; they do not make MU a permission keyword or grant current possession.

Shared-reader work needed for the fresh failure shapes:

- Read `converted-by` / `transformed-by` as the converter role. For “turns input
  into output”, ground both complete object labels in the same full proof;
  do not answer a different transformation because its input is shared.
- Read `cut-from` / `raw-material` as directed material roles; resolve a generic
  raw-material continuation from the active, authorized item scope. The raw
  material proof already supplies Ben and the west-of-Yew instruction.
- Read `performed-for` as performance recipient, keeping it separate from
  `teaches` and from item `return-to`/`deliver-to` roles. Preserve its two-fact proof.
- Read permission-how requests through the exact `requires-permission-from`
  proof. A “return after blessing” continuation uses `continues-at`; it is not
  a delivery of the rune to its giver.
- Read chant/mantra questions through `accepts-mantra` and the active shrine
  within the exact Compassion source scope. Preserve the rune-use condition.
- If `located-west-of` becomes a location lookup, retain its directional
  semantics and full witness. The target Yew alone is incomplete.

Validation: the new `ultima6-actor-phase-metadata.test.mjs` plus the existing
control-metadata and procedure-scope suites pass all 16 tests using the bundled
absolute Node runtime. These tests compare the raw guide declarations with the
authorized source records and prove direction, distinct actors, exact source
scope and frozen field hashes. They do not alter answer expectations.
