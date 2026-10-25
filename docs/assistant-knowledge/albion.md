# Albion structured knowledge audit

Reviewed 2026-10-25 against the authored declarations in `guides/js/Albion.js`, the Albion adapter and existing assistant overlay. This is a source audit, not an independent playthrough or a claim that every author statement is correct in every release. No installation, external research, model change, deployment, or shared-runtime change was performed.

The manifest contains **132 witnessed facts, 107 declared entities, and 30 typed links**. Every fact has an exact witness equal to its text and present in the named existing source record when authorized at Direct. Individual locators point to the authored declaration that supplies the claim. Some adapter records combine a spell effect, SP cost and school reagent; their locator names both declarations.

## Source inventory and coverage

| Source area | Audited source inventory | Selected facets |
|---|---:|---|
| Campaign / quests | 10 chapters; 33 checklist objectives | All 33 detailed quest hints: codes, action order, item acquisition, optional actions, hard entry gate and ending trigger |
| Party | 9 characters | All 9 note lines; 4 detailed strength/weakness profiles; 8 separately witnessed recruitment places; recruitment and departures also covered in quest hints |
| Equipment | 11 rows | All 11 complete adapter equipment profiles (type, effect, damage when supplied) and all 11 locations; curse penalties, ammunition, restrictions, protections and stat bonuses |
| Magic | 4 schools; 12 key spells | All 12 spell effects with SP/reagents; all 12 spell-specific learning records; all 4 training topics with explicit companion-versus-trainer bindings |
| Bestiary | 5 entries | All 5 strategies; Animal 3 critical-hit danger additionally separated |
| Regions and places | 7 regions; 15 sublocations | Six detailed sublocations and Kenget Kamulos description; NPC location bindings; Merdger and Herras atlas map witnesses; named chapter/quest routes cover other regions |
| Trade | 5 shop rows; 3 optional hints | All rates and all optional hints; explicit buyers and repeatable potion method |
| Campaign movements | 4 authored acts | All four summaries, scoped as campaign movement rather than precise travel instructions |
| Item exchange | One explicit chapter tip | Music Crystal traded for Crystal Throwing Axe |

Facet counts: method 32, use 23, location 27, party 9, combat 10, training 4, trade 8, movement 4, acquisition 13, prerequisites 1, explanation 1. Names are entity identifiers and query labels; aliases do not establish identity or synonyms.

## Explicit relationships

The links capture Khunag required for entry; Sira leaving with Melthas; Harriet replacing Rainer; Rifrako selling Monster Eye and Dreamshield; the Pistol found in the COM room; Porenoil preventing dehydration; the secret word and Kossotto supplying the Metalmagic Scroll; Herras's conditional reward; Thorn Snare controlling Kamulos and AI Housing; Joe bypassing robot encounters; the Music Crystal exchange; Rejira supplying potions; Krondir drops sold to Rabir; and the three named spell-training NPCs. The additional links bind the actual Kenget Kamulos place to its party gate, the six Iskai/Dji-Cantos spells to their explicitly documented teachers, and Rifrako, Melthas’s friend, Edjiir and the Metalmagic Scroll to their witnessed places. Conditional links retain their trigger in qualifiers. No checkbox position establishes a prerequisite.

## Source caveats and rejected inferences

- The current adapter flags the assassination sequence as conflicting. The knowledge retains its exact authored timed sequence without claiming it is the only possible event order or resolving the conflict by guesswork.
- The adapter flags the blue plate XP claim as conflicting: a chapter/overlay claim says 5760 XP, while the bestiary lists Animal 3 at 357 XP each. Sixteen times 357 is 5712. This manifest carries the plate's action instructions and combat danger; it does not assert a reconciled XP total.
- Monster Eye is called a key utility item and sold by Rifrako. These local source facts do not establish a particular teleportation, identification, or detection mechanism.
- Flower recharge is described only as occurring over time. No duration is supplied.
- The party notes say Joe makes the Toronto finale easier; this does not make him a mandatory entry requirement. Khunag's current party presence is a real entry gate.
- Recruitment, possession, learned spells, current party membership and completed quests are not interchangeable. Guide text alone cannot prove the player's current state.
- “Free training” is a source field label, but the Druid row explicitly says to buy scrolls from Roves. The manifest quotes that purchase instruction rather than calling it free.
- The source has no verified 2026 remaster rules, developer-interview rationale, or current-save inventory counts. Such requests receive negative fixtures.
- Source inventory was audited in full, but raw character stat tables, every atlas NPC movement, all eight individual flower positions, and every map transition are not duplicated in this facet layer. Existing reference records continue to own those details; this manifest prioritizes useful authored actions and relationships.

## Fixed dialogue validation

`guides/tests/assistant/knowledge/albion-cases.json` contains **29 independent four-turn dialogues (116 turns)**: 100 answer turns with fixed source citations and 16 negative turns. The answer strings and fact IDs were authored from source, never obtained from the retrieval output. Examples exercise genuine fragments and pronouns (“And the Pistol?”, “What does it use?”, “Where do I find it?”, “What does it prevent?”, “And the reversed code-notes?”), shifts to related NPCs, equipment, spells and locations, and unsupported mechanics, unavailable external source claims, edition and progress negatives.

Static validation checks fact and entity uniqueness, exact witness equality, source-record Direct authorization, source substring containment, existing fact references and link endpoints, and expected answer substrings against the fixed cited facts. Shared runtime retrieval evaluation is owned by the integrating task; static success does not imply that every conversational case already passes retrieval.

## Independent semantic oracle correction — 2026-10-24

A source-only review covered all 116 turns and 108 manifest facts without consulting chatbot outputs. Two individual questions now declare independently witnessed `alternativeAnswers` while retaining their canonical source and phrases: “And Dreamshield?” can cite `DB.equipment[6].location` for Rifrako/Aballon; the valuable-loot selling question can cite `DB.trade[2]` for Umajo's 130% sell rate. These alternatives establish only the requested claim. Identical place strings belonging to different items are not global equivalents: Gaze of Kamulos, Lugh's Hand Helmet and Thief's Amulet remain distinct subjects even though their location texts all say Kenget Kamulos. Counts remain 108 facts, 90 entities, 19 links, 29 dialogues and 116 turns.

## Source-reviewed answer relations — 2026-10-24

All 108 focused facts now declare `answerRelations`, independently curated from their fixed witnesses and source scopes. This metadata describes which kind of claim each fact can answer; it does not change the fact's ID, text, witness, facet, source proof, aliases or encoded embedding document. No replay outputs or conversational fixtures were used to select these roles.

The declarations separate effect, acquisition and place claims. Equipment effects grant use/stats roles while separate equipment locations grant location. A nearby NPC's location does not automatically locate the item being discussed. Porenoil's excerpt proves dehydration prevention, but asking Merger about it does not establish that he gives or sells it. The Seed excerpt supplies a carry destination and final objective, not planting controls. The four campaign movements are summaries/objectives, not turn-by-turn routes. Joe's bypass advice remains a tactic and utility claim, not a mandatory finale prerequisite. Training-location roles are scoped to the named character's training provider, not a claim about that character's present whereabouts. Numerical prices and spell/resource costs retain stats roles; explicit resource restrictions retain prerequisites. No source-only cause claim was added where the witness merely recommends, requires or names something.

Relation counts (one fact can support several distinct claims): `acquisition` 18, `combat` 18, `comparison` 11, `destination` 2, `explanation` 23, `identity` 15, `limitations` 8, `location` 34, `method` 27, `objective` 5, `outcome` 13, `prerequisites` 24, `recruitment` 5, `route` 2, `sequence` 5, `stats` 37, `use` 30.

Source-gap constraints remain visible rather than being repaired with guesses. Validation checked all declarations against the allowed relation vocabulary, required nonempty unique roles, and verified that every pre-existing fact field and encoded document remained unchanged. This metadata-only change requires manifest-hash refresh for static embeddings; it does not require new vectors. Runtime filtering and ranking acceptance belong to the integrating task.


## Semantic indexing revision — 2026-10-25

This revision adds 24 source-backed facts: eight recruitment-place excerpts, twelve per-spell learning excerpts, the Equipment Makers Cellar description, two atlas map-location excerpts, and the Kenget Kamulos description. All are quoted from existing Direct-authorized adapter records. The atlas facts use only names/maps/movement, never the unreliable extracted race/class profiles.

The four training facts now quote each complete authorized `DB.magic[n]` record, including its literal practitioner and trainer, rather than a short `freeTraining` fragment. They describe spell-training topics. Bindings grant the companion only learning/action roles (`acquisition`, `method`) and grant a named trainer only `location`. The companion’s actual recruitment place is separately quoted with the source’s warning that it does not establish current party membership. Per-spell records record spell levels as stats; they do **not** turn those numbers into learner-level requirements. Roves sells scrolls; he has not been relabeled a free spell teacher.

`beegle-room` now describes room supplies, with a separate room entity, rather than treating cabinet contents as the inspector’s identity. `place-kounos` locates **Melthas’s friend**, not Melthas; `place-srimalinar` locates Edjiir; `place-aballon` retains its Rifrako binding. Item, person and place kinds have been corrected where the source names a concrete object. The actual Kenget Kamulos place is distinct from Kamulos the enemy and from the entry-requirement topic.

Descriptive facet labels and action aliases cover acquisition, equipment modifiers, hiding the Pistol, stat-boost passages, recruitment choices, potion farming, sale rates, Toronto code sequence/provenance, evidence delivery and the finale. Roles are expanded only for witnessed claims: equipment locations also answer where to obtain the item; the codes record their sequence and source notes; evidence has a return/use instruction; Joe’s recommendation states the benefit of avoiding robot encounters. The Service Robot source provides a **Joe-dependent bypass tactic**, not a snare/attack recipe. The Kenget gate remains **Khunag in the party**, not historical recruitment, a required learned spell or Joe’s presence.

One-level support explicitly combines Monster Eye’s seller with the Aballon source, the secret word with the Kossotto exchange, and the Scroll acquisition with its separately recorded Equipment Makers Cellar location. No transitive engine inference or current-state claim is added. Named buyer bindings preserve the actual scope of Rabir, Winion, Riolea, Jeros, Zeibe and Mykonou rates; percentages are sell/buy multipliers, not absolute item prices.

Compile-only validation using `buildKnowledge('albion', allRecords.albion, manifest)` accepted all **132 facts and 30 links with zero issues**, including exact witness equality, authorized source containment, role vocabulary, literal binding mentions, source IDs, entity endpoints and support references. There are 34 explicit target bindings and 85 facts with descriptive facet labels. No model inference, embedding generation, browser acceptance run, oracle edit, installation, commit or deployment was performed for this revision. Changed documents and manifest metadata require the integrating task’s vector/catalog refresh and stable runtime checks.

The previous 116-turn corpus remains development evidence. Three existing training expectations name the former field-only locator: “Where does Sira train spells?” (`DB.magic[0].freeTraining`), “Where does Melthas get spell scrolls?” (`DB.magic[1].freeTraining`) and “Where does Harriet train spells?” (`DB.magic[3].freeTraining`). Their same-ID facts now cite the complete, independently authorized `DB.magic[0]`, `[1]` and `[3]` records to support correct literal bindings. These source-equivalent locator changes need independent adjudication; the fixed expectations were left untouched. New recruitment and learning facts may supply other source-equivalent evidence, so success must not be claimed from the old fact-ID assertions alone.

Remaining source and runtime limits:

- Porenoil’s witness proves dehydration prevention and names a contact, but does not say that contact gives or sells it. The acquisition wording remains a source gap, not an added acquisition role.
- Monster Eye’s checklist label includes 450G, while its authorized answer witness does not. That number is not promoted into a price answer. The Pistol’s “cannot be sold” checklist label likewise is not a quoted sale rule in this layer.
- The authored assassination and plate-XP conflicts are preserved. No retrieval label can resolve those source conflicts.
- Toronto evidence gives an after-reactor return instruction, not a detailed recording/collection procedure; the Seed gives a destination/objective, not planting controls; flower recharge has no duration.
- Runtime routing must distinguish **learning a companion’s spells** from recruiting the companion, and **where to sell a monster’s drops** from the monster’s location. The new bindings deliberately avoid granting those unrelated location roles.
- Compound cost/effect requests, some pronoun/control questions, dismissal wording and action/property classification remain shared-runtime concerns. This compile-only handoff makes no new retrieval or native-browser pass claim.

### School-subject coverage — 2026-10-25

Declared the four existing source magic-school entities explicitly and bound each full training witness to its school for acquisition/method requests. This lets a named school remain the question subject instead of competing with its practitioner. Two direct `trained-by` links are supported: Iskai/Dji-Kas to Fasiir and Dji-Cantos to Drannagh, with the full practitioner/training-stop conditions retained. Roves's scroll sales and Kenget's picked-up scrolls do not become teacher edges. No school location is transferred to Sira or another practitioner. Counts are 132 facts, 111 declared entities and 32 links; encoded fact documents are unchanged.
