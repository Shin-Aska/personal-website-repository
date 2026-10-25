# Fresh conversation evaluation: source-only freeze

Frozen at 2026-10-24T16:45:54.862730Z.

This is an independently authored, source-first oracle for the six-game local guide assistant. It is frozen before any question execution. No assistant responses were generated or inspected. No existing evaluation case files, evaluation reports, replay results, knowledge manifests, or runtime response/algorithm code were read. The six approved base JSON overlays and their original written guide data were consulted. Adapter excerpts were consulted only to establish canonical source file/locator/review tuples and legitimate equivalent provenance paths. No external research or external browsing was needed, and nothing was installed or downloaded.

## Deliverables and scope

- Case file: `guides/tests/assistant/knowledge-fresh-cases-20261025.json`
- Case SHA-256: `67847abd677579e424d4458f710962a39e8453e9034e7696f1269b4bf4402eb3`
- 19 coherent four-turn conversations, 76 meaningful user turns.
- 57 answerable turns and 19 source-boundary turns: 75% positive coverage.
- Ultima V, Ultima VI, Ultima VII, Al-Qadim and Albion each have 12 turns. StarCraft has 16 turns to include an additional explicit comparison conversation.
- Execution assumes Full answer help level, the dialogue's explicit game scope, and conversational carryover between its turns. Reset conversation history between dialogues. No current inventory, party membership, saved-game progress, local executable version, antivirus state, or map position is supplied.

The conversations cover mountain and sea travel, recruitment advice and properties, the shrine procedure, permission and family relationships, crafting an instrument and learning its tune, creature origin and reagent origin, forging and daemon binding, powering an orrery, weapon effects against a specific enemy, sword controls and training, medicinal quest resources, ship restoration and a rescue relationship, security and hidden supplies, magic training and resource costs, linked companions, client setup and network behavior, Remastered map mode, example bots and creator attribution, documentation resources, and an offline-client comparison. Short follow-ups, a correction, and explicit topic shifts occur in ordinary player language.

## Oracle rules

Every positive expectation requires a precise useful claim, an exact original source tuple, and useful literal response phrases. A generic name, a nearby source citation, or a chronological neighboring action is insufficient. Source witnesses directly substantiate the requested predicate. An NPC being named somewhere in an unrelated action is never identity, authorship, recruitment, or quest-giver evidence.

`sourceWitness` is a literal source proof string, or an array of independent literal proof strings when a compound claim needs more than one clause. All clauses are required. These proofs belong to the same original record identified by the source tuple; for assembled school/spell text, they include the directly declared school resource or training field. Ultima V's HTML page prose is also preserved literally in the approved base `pageFacts` records; this avoids conflating HTML markup with prose proof. A witness is proof for human/source auditing, not a required exact sentence in the assistant's response.

`contains` requires every listed useful literal phrase, with ordinary case-insensitive matching. `requiredUsefulClaim` states the semantic claim a reviewer must verify; matching a citation without the claim cannot pass. The primary source tuple is the canonical authored source. `alternativeAnswers` enumerates frozen, genuinely equivalent provenance paths: each alternative has its own exact tuple, useful phrase checks, and direct proof. A complete matching alternative may satisfy the source/phrase requirement only if it also supports the same required useful claim. Sources are compared on `file`, `locator`, and `review`; optional implementation metadata is not part of that tuple. No fact IDs couple this oracle to an implementation.

The compound Sacrifice question independently requires Gwenno/STONES and Selganor/rune. Frost Avalanche independently requires its freezing effect, 30-SP cost, and the Dji-Kas Trifalai Seed resource. The shrine ritual question requires both three meditation cycles and the Codex on the Isle of the Avatar. The two explicit comparisons are mantras versus dungeon Words of Power, and BWAILauncher versus SCHNAIL realism/depth. Their claims are stated directly by the written sources rather than inferred from row order.

The negative cases are current-state questions that cannot be established from a guide, uncovered edition/other-game questions, and actual gaps such as exact mana drain, crystal lifetime, item durability, generalizing a quest medicine into a party antidote, recruitment of a rescued NPC, and current tournament ranking. `not-answer` means do not assert the unsupported requested fact. A helpful response may explain the precise limitation and offer a supported nearby procedure. It need not be silent or generic.

Creator attribution is deliberately phrased as who the checked-in guide credits, rather than an independently verified historical claim. StarCraft setup statements likewise test the guide's written scope, not current compatibility or release information. No current outside facts were used to fill gaps.

## Source-only verification

Validated JSON decoding, schema version, required expectation fields, unique dialogue IDs, four-turn structure, per-game minimum counts, 75% positive coverage, exact three-field source tuples, nonempty useful phrase checks, literal primary/alternative proof witnesses, absence of fact IDs and unsupported oracle extensions, and all source hashes. 82 permitted source paths and 87 proof clauses were checked. This is structural and provenance validation only; there are no execution scores, runtime behavior claims, or pass/fail results.

The case file and this review are frozen. They must not be edited after any execution. Any later scoring adjudication should be recorded separately and preserve the original strict score. If an implementation chooses a more precise citation not already listed, the frozen case still records its original source contract; output-driven additions would invalidate the holdout.

## Source hashes at freeze

- `guides/data/assistant/ultima5.json`: `bbd6a3a33133bc1aca80ac7a19cea5011e19c9f33869582355d7fd60f0f0d24e`
- `guides/data/assistant/ultima6.json`: `67b3bf1e8e935df279bec2f11cf698ba721f5d8e169f1a050fefa4ee66b5ad05`
- `guides/data/assistant/ultima7.json`: `9b5c29c25936ccfd20ca9b704df57d45c1f7142a2014b09630f8e2f2aee10871`
- `guides/data/assistant/alqadim.json`: `f0f15243ea3b27701d97b3ab369a108ef46e93ec5f780f6e1fd1bf5e69bf2b77`
- `guides/data/assistant/albion.json`: `b3b219ccb434c450189e97404b4c06a3bbc8334dc581bea55bc4a70213851404`
- `guides/data/assistant/starcraft.json`: `0dc5925ca67adfc434b5366213a5e05e11cbf869f1d0aa71e4daa6d16ae2dfc0`
- `guides/js/Ultima5.js`: `e2699ed2d8aca9bf3465c7dcd262461f5fca59f1fb4cbd41361e0f5c5a96dae5`
- `guides/js/Ultima6.js`: `a0b07db60d7c30ac19bb64b56fa26b1428a6437f437f087eb2d75109afae4898`
- `guides/js/Ultima7.js`: `c3cd92659e5e959c6d172ba38d56ba85148729b82185768557cb595e3bfb6085`
- `guides/js/AlQadim.js`: `269798843206f12b76163c65b04301be278652115fbdbd46596f13f3ae7b5e5e`
- `guides/js/Albion.js`: `4adba84eca7af2436731b7053e3167a909f57f85edc611c6287411af84e4b1ca`
- `guides/StarcraftBWAPI.html`: `f43b3fcfbffddaadf2b4bf951b16652a9d1133d726b7efe06357f9a7cb925983`
- `guides/Ultima5.html`: `c419f66b8a99902351736c024a2230899ec21cdb4ab7af971c58f547b69a2212`
- `guides/js/assistant/adapters/ultima5.js`: `3aa64babe0f83ecc713f5d9a665b8ba7a4e7dbfce557a8cff22778a6170cf95a`
- `guides/js/assistant/adapters/ultima6.js`: `d99a14171975b88fff97d7e0ff9a39ac1e07abfed425706732827d6d4fe5e480`
- `guides/js/assistant/adapters/ultima7.js`: `5140505e9fe04a864e950afab671519f31ef24ac6a9b2e91b7c3853c1cf1e7c3`
- `guides/js/assistant/adapters/alqadim.js`: `fa65928d9011011a12095cd4bbf37a56bfed3b91559ce6aa8097a991b111065c`
- `guides/js/assistant/adapters/albion.js`: `df3993cb351cf9f5e4ade03d8bcfdfc3477c00f4fb39922b9e8cc8d4e255e70b`
- `guides/js/assistant/adapters/starcraft.js`: `b4a11908b121a545fd810c4f8ae09404c210ab0607f70e9121a145a8aea6063e`
