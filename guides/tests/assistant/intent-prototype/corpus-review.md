# Intent prototype corpus review

Scope: an offline language-classification experiment for Ultima VII and the local StarCraft AI setup guide. No answer text is trained or generated. These cases do not replace, alter, or weaken the production conversation or source-evidence tests.

## Frozen inputs

Frozen before any classifier training or evaluation run on 2026-10-24, following a pre-run support-facet audit. Treat the files below as immutable for the first reported run. If a later correction is justified, preserve these hashes and report a distinct corpus version and results; do not relabel failures to raise a score.

| File | SHA-256 |
| --- | --- |
| `cases/training.json` | `473f263180478f6bb509594a0fa25e4db375393776d9f45f2204045314a1d648` |
| `cases/validation.json` | `0a88fd1626fb273deb40e3b7f209a950b2e2944f2b1657d552d0c8f7bb2228b7` |
| `cases/evaluation.json` | `e7612087c82234a809011485110d9ee750a0c7a38f3027951b176df7a7c4df7f` |

## Authorship and separation

- Training: 120 manually authored examples, 10 for each of the 12 labels.
- Validation: 36 separately authored examples, 3 per label. These can select regularization and abstention thresholds but must not enter fitting.
- Evaluation: 48 separately authored single-turn cases, 24 per game, plus six conversations (three per game; 47 total turns, seven or eight per conversation). No evaluation text enters training or threshold selection.
- Examples were written as varied sentences, not expanded from a phrase template. A program serialized the manually written lists; it did not synthesize phrase combinations.
- Exact case-insensitive text uniqueness was checked across all three new splits and against all turns in the existing Ultima VII and StarCraft conversation fixtures. There are no exact repeats.
- Named subjects held out from both training and validation include Lord British, Time Lord/timelord, Guardian, Iolo, Shamino, Dupre, Spark, Sentri, Dracothraxus, Juggernaut Hammer, Seance, Rudyom's Wand, SCHNAIL, BWAPI, BWAILauncher/BWAI launcher, Remastered SCM Map, and UAlbertaBot/U Alberta Bot. Common domain vocabulary such as game, map, launcher, training, and bot necessarily spans splits. The prototype still has entity names from the existing guide index; entity resolution is not a held-out knowledge test.

This is fresh held-out wording relative to classifier fitting, not blind or organic user data. It was authored after the production parser design and with knowledge of the intended labels, existing fixtures, and known failure modes. The sample is small, class-balanced in training/validation, and deliberately difficult in evaluation; aggregate accuracy is not an estimate of real user traffic performance. Dialogue expectations test integration behavior in addition to language classification.

## Label policy

Labels describe the requested information even when the guide cannot supply it. Missing support must remain a separate source/edition/spoiler decision. In particular, a request for an invented exact win percentage is still `stats`; a false-premise murder question is still `why`. Entity titles are evaluation annotations, never inputs for seeding entity resolution or pending subject state.

| Label | Meaning |
| --- | --- |
| identity | Who a person is or what an entity is; creator identification is included. |
| location | A place, directory, website, or section containing a subject or resource. |
| acquisition | Obtaining an item, recruiting a companion, or getting/downloading software. |
| use | Operating, casting, installing, launching, or configuring something. |
| stats | Numerical attributes, costs, limits, measurements, or performance figures. |
| combat | Battle tactics, counters, weapon choice for fighting, or defeating an enemy. |
| prerequisites | Dependencies, required version, eligibility, or conditions before starting. |
| hint | A clue, next-step assistance, or troubleshooting advice. |
| why | Reason, cause, motive, or purpose. |
| comparison | Differences, relative merits, tradeoffs, or pros and cons. |
| overview | A summary, list, outline, or introductory tour. |
| unknown | Out-of-domain tasks, social remarks, contextless confirmations, or control commands with no information intent. |

Boundary examples: obtaining a download is `acquisition`; finding the site hosting it is `location`; installing the downloaded program is `use`. Required versions are `prerequisites`. Asking why a program fails is `why`; asking what to check to resolve failure is `hint`. An entity definition is `identity`; a broad recap is `overview`. A negated old subject followed by a new explicit subject resolves to the latter.

Dialogue labels name the intent after legitimate context resolution. A confirmation of a pending overview or identity request inherits that pending intent. The raw confirmation sentence alone can otherwise be `unknown`. Pronouns can carry an information intent while still lacking a resolvable subject. `expectAbstain` on single-turn cases marks an ambiguous/unresolved subject, an out-of-domain task, or a clearly unsupported platform/edition; it is not a prediction that the intent classifier must label them `unknown`.

## Dialogue annotation contract

- `entityTitle`: expected subject, or omitted for unresolved subject/control turns. Comparison cases may name the comparison topic or the first named subject; the title is not a full ordered entity list.
- `supported`: whether the present guide/research evidence and stated restrictions permit an answer, not whether the classifier recognizes the intent. Unsupported turns must not invent facts.
- `transition`: `new-topic`, `retain`, `pending`, `confirm-pending`, `reset`, or `unresolved`. A pending typo must be derived from the real resolver. Its expected title is an oracle only; it cannot be used to inject a pending candidate.
- `restriction`: `guide-only`, `spoiler:gentle`, `edition:1.16.1`, `edition:remastered`, `edition:serpent-isle`, or `platform:switch` on dialogue turns. Independent cases also use `spoiler:balanced`, `spoiler:direct`, and `edition:starcraft2`. Restrictions are expectation annotations only; the runner must not derive controls or state from them. The runner defaults to direct help; the gentle turn explicitly sets `options.spoiler` as a real input control. Guide-only requests and resets here are natural-language input, not hidden actions. A request to keep a restriction active (for example, “still guide only”) must be understood from the actual text.

The six conversations cover joined/spaced Time Lord identity and a misspelling confirmation, Guardian as a new topic, Lord British identity, pronouns, explicit reset, unknown subjects, negation, wrong editions/platforms, guide-only/spoiler limits, and the distinct SCHNAIL/BWAPI/BWAILauncher installation subjects. A separate map conversation checks Remastered mode and compatibility ambiguity.

## Evidence and negative boundaries

Authorship consulted these existing local records (not model answers):

- `guides/tests/assistant/conversations/ultima7.json`
- `guides/tests/assistant/conversations/starcraft.json`
- `guides/tests/assistant/evidence/conversation-starcraft-source-records.json`
- `guides/data/assistant/ultima7.json`
- `guides/data/assistant/starcraft.json`
- `guides/js/Ultima7.js`

The source records distinguish SCHNAIL's own game files and login dependency, BWAPI's research-only definition, BWAILauncher's separate game setup and unresolved Remastered compatibility discrepancy, and the integrated Remastered map's Use Map Settings requirement. Ultima VII identity research has spoiler/source limits; party-size recruitment conditions are documented for Sentri, but quest prerequisite graphs and Serpent Isle coverage are not modeled. Unsupported false premises, exact performance figures, arbitrary new bot names, and console/StarCraft II setup are deliberate boundaries. These are evidence-gate tests, not invitations to infer missing facts.

## Verification and remaining limits

JSON parsing, expected schemas, label balance, per-game counts, dialogue lengths, and exact text separation passed before freezing. No model run, production parser execution, installation, network download, commit, or deployment was performed by the corpus author. Independent review remains appropriate, particularly for semantic boundary cases (`identity`/`overview`, `use`/`hint`, `location`/`acquisition`) and whether a real resolver can produce the misspelled pending subject. Failure of that behavior must be reported without softening the frozen expectations.

## Pre-run audit revision

The initially serialized evaluation SHA-256 was `3f43342ca8a5f9bd052bcf0c8b8ae6e86010e55e4128375ab26392043433e0e0`. Before any model run, source-facet review changed `u7-time-confirm-and-change` turn 3 (`What is his reason for asking for help?`) from supported to unsupported: a documented request to be freed and oppose the Guardian does not state the reason for requesting help. The same audit added the explicit `options.spoiler: gentle` input on turn 6. No text or requested-intent labels changed, no observed model failure motivated the revision, and both hashes are retained here. The table above contains the final frozen input hashes.

## Per-dialogue source-facet audit

Turn numbers below are one-based. Locators identify local records actually read; none of these annotations authorizes answering from a different facet merely because the entity matches.

| Dialogue | Supported facets and exact local locators | Unsupported boundaries |
| --- | --- | --- |
| `u7-time-confirm-and-change` | Turn 2 identity: `guides/data/assistant/ultima7.json` → `research[id=time-lord-identity].text` (time-flow role, opposition to Guardian). Turn 4 identity: `research[id=guardian-identity].text` (hostile extradimensional being). Turn 5 goal: `research[id=lore-guardian-purpose].text`, linked by `narratives[id=guardian-purpose]` (power and domination, Britannia). Turn 7 Lord British identity: `research[id=lore-lord-british-identity].text` and `narratives[id=lord-british-identity]` (king, Earth, Avatar friendship). | Turn 1 requires actual fuzzy/pending resolution, not a factual answer yet. Turn 3 asks a reason absent from `research[id=lore-time-lord-purpose]`; that record states requested actions only. Turn 6 Guardian identity requires balanced spoilers and is disallowed at gentle. Turn 8 restricts Lord British identity to the guide, excluding its cited research facet. |
| `u7-archers-reset-and-unknown` | Turns 1–2: `guides/js/Ultima7.js` → `DB.companions[name=Iolo]`, role and location fields. Turns 3–4: `DB.companions[name=Shamino]`, numeric attributes including Dexterity. Turn 8: `DB.companions[name=Dupre].location`. | Turn 5 is a natural-language reset control with no requested fact. Turn 6 has no subject after reset. Captain Plumeria in turn 7 is not a documented indexed subject. |
| `u7-negation-and-party-boundaries` | Turns 1–2: `guides/js/Ultima7.js` → `DB.companions[name=Spark]`, role and attributes. Turns 3–4: `DB.companions[name=Sentri]`, location and notes (party size >5 prevents joining), also `guides/data/assistant/ultima7.json` → `facts[c-sentri]`. Turn 6: `research[id=lore-lord-british-identity].text`. | Turn 5 supplies an assassination premise absent from these records. Turn 7 asks for Serpent Isle coverage, excluded by `guides/data/assistant/ultima7.json` → `limitations[0]`. |
| `sc-client-library-launcher-separation` | Turn 1 definition: `guides/data/assistant/starcraft.json` → `research[id=what-is-bwapi].text`. Turn 2 installation: `entities[id=schnail].facts[id=setup]`, also source-record `starcraft:schnail:setup`. Turn 3 own game: `.facts[id=own-game]`, source-record `starcraft:schnail:own-game`. Turn 4 first-startup cause: `narratives[id=schnail-first-launch-cause]` → `narrativeFacts[key=sc-narrative:schnail-first-launch]`, source-record `starcraft:narrative:schnail-first-launch-cause:cause` (`#getting-started > .bg-blue-50 .text-blue-700`). Turn 5 installation: `entities[id=bwai].facts[id=setup]`, source-record `starcraft:bwai:setup`, explicitly scoped to 1.16.1. Turn 6 obtaining download: `.facts[id=download]`, source-record `starcraft:bwai:download`. Turn 7 detection: `.facts[id=detection]` and `narratives[id=bwai-detection-method]`, source-record `starcraft:narrative:bwai-detection-method:method` (`#bwai-setup ol > li:nth-child(5)`). Turn 8 client identity: `entities[id=schnail].facts[id=features]` and `narratives[id=schnail-summary]`. | No unsupported factual turn expected; all subject changes must still resolve from text rather than these annotations. |
| `sc-map-edition-and-reset` | Turn 1 setup: `guides/data/assistant/starcraft.json` → `entities[id=remastered-map].facts[id=setup]` and `narratives[id=remastered-map-method]`, source-record `starcraft:narrative:remastered-map-method:method` (`#remastered-setup ol`). Turn 2 wrong mode: `.facts[id=mode-check]` and `narratives[id=remastered-map-outcome]`, source-record `starcraft:narrative:remastered-map-outcome:outcome` (`#remastered-setup ol > li:nth-child(7)`), which explicitly says standard Melee will not function properly. Turn 3 dependencies: `.facts[id=requirements]`. Turn 8 support links: `entities[id=support].facts[id=links]` and `.facts[id=community]`. | Turn 4 Remastered compatibility cannot be asserted: `entities[id=bwai].facts[id=compatibility]` and `.facts[id=requirements]` record a discrepancy with the 1.16.1 setup. Turn 5 Switch setup is outside the guide. Turn 6 is natural-language reset, and turn 7 has no subject after it. |
| `sc-confirm-restrictions-and-bots` | Turns 1–3 project summary and creators: `guides/data/assistant/starcraft.json` → `entities[id=ualbertabot].facts[id=about]`, source-record `starcraft:ualbertabot:about`; the text explicitly credits Dave Churchill and Steve Gelly. Turn 6 BWAPI definition: `research[id=what-is-bwapi].text`. | Turns 4–5 exclude that BWAPI definition by requesting guide-only; a guide documentation link cannot substitute for a definition or summary. Turn 7 QuantumWarBot is not a documented indexed subject. Turn 8 retains that unresolved subject and requests unsupported live statistics. |

StarCraft source-record IDs in this table refer to `guides/tests/assistant/evidence/conversation-starcraft-source-records.json`. Existing records are evidence for expected support, not response text generated by this prototype. A classifier or resolver result does not change these support expectations.
