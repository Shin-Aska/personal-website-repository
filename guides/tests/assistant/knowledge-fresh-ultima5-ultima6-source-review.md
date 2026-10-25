# Fresh Ultima V/VI source review — 2026-10-25

Frozen corpus: `knowledge-fresh-ultima5-ultima6-20261025.json`.

SHA-256: `d43db3605bf168beaadb68b64fbd2386043ea37659e0cc03123fd6300c09eb15`.

The corpus contains 32 turns: four four-turn dialogues per game, each with three positive source-backed questions and one unsupported boundary. This yields 24 positives and eight negatives. New wording was written from original source declarations and existing manifest provenance; existing independent-corpus examples were consulted for schema only. No new semantic-field runtime output or response outcome was read, and no planner, model or browser outcome was executed.

| Game | Dialogue focus | Positive source facts | Unsupported boundary |
| --- | --- | --- | --- |
| Ultima V | Sceptre access and crossing | `sceptre-shadowlords`, `sceptre-well`, `sceptre-carpet` | Construction metal |
| Ultima V | Faulinei lead, summoning and timed Shard use | `faulinei-word`, `faulinei-flame`, `faulinei-timing` | Conversion from one turn to real-world seconds |
| Ultima V | Party growth and replacement | `party-start`, `julia-upstairs`, `party-six` | Luck score ranking |
| Ultima V | Honor meditation, then explicit correction to Humility | `honor-mantra`, `honor-meditate`, `humility-no-bonus` | Shrine floor material |
| Ultima VI | Panpipes, tune teacher and performance recipient | `panpipes-makers`, `gwenno-song`, `selganor-rune` | Musical tempo in BPM |
| Ultima VI | Balloon plans, cloth workers and assembly | `balloon-plans`, `silk-thread-cloth`, `balloon-assembly` | Hemp substitution |
| Ultima VI | Map-piece trades, then correction to Bonn's moving-object method | `ybarra-map`, `morchella-map`, `bonn-map` | Harpsichord weight |
| Ultima VI | Red/blue lens makers and directed final placement | `red-lens`, `blue-lens`, `lens-placement` | Lens angles in degrees |

Every positive has an exact original child locator, literal required fragments, a complete useful-claim description, and the complete original source witness. The Ultima VI source witnesses preserve original inline code delimiters; removing those delimiters yields the exact unchanged manifest text/witness. Every manifest witness was independently found in its authorized original backing record. Each positive requires one source declaration, so no unnecessary `allSources` or `allFactIds` constraint is imposed. The source-proof JSON records all 24 source/fact mappings and source hashes at freeze.

Natural continuity includes object and person references, an intermediary-versus-teacher distinction, recruitment versus final roster roles, correction from Honor to Humility, separate crafting workers, exchange versus object movement, and the two directed lens positions. Questions about current inventory use an explicit hypothetical condition; none asks the system to infer save state.

All 32 question strings are distinct and have no exact question-string duplicate in the existing case and independent-corpus files checked during source-only validation. Corpus expectations were frozen before any response execution. Strict citation/fragment scoring should be followed by useful-claim review, retaining any strict failure and identifying alternate supported wording separately.

Files added only:

- `knowledge-fresh-ultima5-ultima6-20261025.json`
- `knowledge-fresh-ultima5-ultima6-source-review.md`
- `evidence/knowledge-fresh-ultima5-ultima6-source-proof-20261025.json`

No production source, runtime, model, existing oracle, fact text or manifest was changed during this independent validation task.
