# Fresh Ultima VII and StarCraft source review

Frozen corpus: `knowledge-fresh-ultima7-starcraft-20261025.json`.

SHA-256: `55b12198502d24c4e2274dbb10be05b17678af22881a129ee0189380a78221de`.

The eight dialogues contain 32 turns: four dialogues per game, each with three
source-answerable turns and one unsupported boundary. Prompts were newly
written from complete original local sources before any execution of this
suite. Static validation confirms 12 answers and four boundaries per game,
complete required-useful-claim/source/witness fields, unchanged freeze-source
hashes and no exact prompt duplicates in existing top-level knowledge dialogue
corpora. No fresh assistant output, new native semantic-fields report or root
combined-run output was read. No assistant was executed against this suite.

Ultima VII sources were read in `guides/js/Ultima7.js`: Tseramed's complete
companion object; both equipment objects and their location/effect/type fields;
Brion's Orrery walkthrough and reward; and the complete descriptions of Mark &
Recall, Unlock Magic and Armageddon. Questions preserve all requested statistics,
coordinates, ranged/protective effects, seller/price/recipient/reward bindings,
spell objects and qualified consequences. The Sword of Defense compound needs
both location and effect records, listed in `allSources`. `proofFields` records
precise original children where one canonical response citation groups fields.

StarCraft sources were read in `guides/StarcraftBWAPI.html` and the complete
existing research witnesses in `guides/data/assistant/knowledge/starcraft.json`.
Coverage includes BWAPI loading diagnostics; PurpleWave source packaging,
runtime/IDE folders, questions and license; SCHNAIL first-launch/download/update
scopes; and historical UAlbertaBot EXE/restart/maintenance restrictions. This
extends beyond the newly implemented defaults, map-capability, Java-comparison
and JSON-destination readers. Research expectations remain claims of the
locally reviewed records checked 2026-10-24; no upstream software status or
current endpoint was reverified. External-research tuples retain exact local
`facts[n]` locators and their original primary-source references.

Boundaries ask for current NPC/item/install state, unrecorded material or exact
radius/duration/registry values, or a promised future release date. These lack
source proof; they cannot be inferred from the adjacent supported turns.

This suite is source-first and unexecuted, but its author previously worked on
software field readers and saw older corpus failures. It is fresh wording and
broader source coverage, not an independent blind audit or evidence of measured
accuracy. Expected claims and sources must remain frozen after first execution;
any citation-only or parent/child-locator mismatch requires separate full-answer
review rather than oracle rewriting.
