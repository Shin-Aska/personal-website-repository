# Fresh Albion and Al-Qadim source conversations

Frozen suite: `knowledge-fresh-albion-alqadim-20261025.json`

SHA-256: `c1fa29bec0266eaa26a419dd0cbbc6133618e07524b0e197c60f88c13acbfaf9`

Eight dialogues have four turns each: three answerable positives followed by one unsupported boundary. Each game contributes 12 positives and four boundaries, for 24 positives and eight boundaries overall.

These questions were independently written from the existing local JS source and reviewed knowledge manifests before executing this suite. The author previously worked on runtime code and older corpus/source reviews; this is not a claim of statistically unseen evaluation. The new full-browser semantic-fields report and its replies were not inspected. No assistant, router, browser, classifier or encoder execution was performed for these new cases. Structural count/hash checks and an exact-text duplicate check against the selected frozen independent/blind/fresh/development oracle files found no exact prompt duplicates.

| Dialogue | Source-backed positive claims | Boundary |
| --- | --- | --- |
| Albion weapon tradeoffs | Shadowsword location; its two curse penalties; Danu's Light's three bonuses | Current equipment state |
| Albion warrior and mage | Siobhan's natural damage bonus; her recruitment meeting place; Khunag's motive and recorded Kenget Kamulos requirement | Current save recruitability |
| Albion regional trading | Rabir sell/buy directions; Winion selling rate; Umajo sell/buy directions | Inventory-dependent sale total |
| Albion Toronto return | Both documented approach alternatives; post-reactor evidence destination; recommended technician benefit | Completed repair in a save |
| Al-Qadim elemental and shards | Fire Elemental immunity and alternatives; Water Blast projectile/range; Flame Arrow's conditional damage components | One-shot outcome for an unobserved target |
| Al-Qadim kitchen and key | Sumie's identifying location; referral office; Key of Bone passage | Unrecorded literal password |
| Al-Qadim Old Dungeon | Hidden key position; named vent hazards; Pangar-Bek escort subject/destination | Unrecorded vent timer |
| Al-Qadim journal to mirror | Journal search location; evidence content; mirror optics function | Unrecorded frame material |

Every positive includes an exact source locator, literal source witness, required useful claim, one-of source-record provenance and fact ID. Simple equipment/character/item fields use their exact children. Trade percentages and shard values use the exact table row containing the requested fields. The Fire Elemental's existing `DB.bestiary[7].strategy/danger` locator identifies the two explicit child fields in its full indexed record; its required claims and literal witness concern the strategy child. No generic `DB`/whole-chapter parent is used to replace a child citation. None of the chosen questions requires combining independent source records, so an all-sources requirement is unnecessary.

Raw child strings are retained as witnesses for weapon effects/locations, character notes/recruitment, item descriptions and Fire Elemental strategy. Existing full indexed row witnesses are retained for trade, shard and hint records. Source hashes for both JS files and both manifests are embedded in the suite. Full reply/source adjudication is still required after first execution: strict substring/source matches alone do not establish complete useful answers.

Only the new JSON suite and this review were authored. No production, fact, source, existing oracle, model, asset, installation, download, FTP or publication work was performed for this task.
