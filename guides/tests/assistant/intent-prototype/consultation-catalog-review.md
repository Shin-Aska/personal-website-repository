# Consultation catalog source review

This is declarative source data for the isolated two-game consultation prototype. It does not train the intent model, edit production sources, assert saved progress, or install software. The same planner consumes both games' editions, criteria, and profiles; game facts and conditional mappings belong in the catalog.

## Reviewed schema

`consultation-catalog.json` uses `schemaVersion: 1` and a `games` object keyed by `starcraft` and `ultima7`.

- `editions`: recognized context IDs, display labels, and language aliases. Recognition of an edition is not evidence that a profile supports it.
- `criteria`: IDs, goal labels, and aliases. `edition` can select a criterion from actual known edition context; `alternatives` lists other goals that can be offered explicitly as conditional alternatives. These labels/aliases express user goals, not additional factual claims.
- `profiles`: `entityId`, `title`, base `witnesses`, positive `traits`, exact-quote `summaries` and `limitations`, and edition `constraints`.
- Every witness names an existing indexed `recordId`, an exact `variant`, its exact full `quote`, and the physical source `file`/`locator`. Every factual summary/limitation is itself an exact quoted variant and has a witness. Every trait and constraint has witnesses too.
- `requires-edition` limits a profile when an actual known session edition differs. `unconfirmed-edition` excludes recommendations in listed contexts. Exclusion is a safety condition, not a positive compatibility assertion. Conflicting witnesses cannot become answer prose merely because they were included in an exclusion constraint.

The planner must verify witness text against current records and authorize it at the current help ceiling before producing any factual prose. A catalog entry alone is not authorization. Expected evaluation state, assumed prerequisites, and prior suggested profiles are not user facts. UI actions and help changes remain real input controls, outside this catalog.

## StarCraft conditional choices

`nativeRemastered` means staying in StarCraft Remastered using the guide's particular integrated map. A session that explicitly says it is playing Remastered can select this criterion. Its matching profile is `starcraft:remastered-map`; `realisticAI` is a separately conditional alternative, not a claim that SCHNAIL runs inside the user's existing Remastered installation.

| Profile and goal | Exact indexed evidence | Physical source reviewed | Boundaries |
| --- | --- | --- | --- |
| `starcraft:remastered-map`, `nativeRemastered` | `starcraft:ai-options:comparison` gentle; `starcraft:remastered-map:no-downgrade` gentle; `:setup` gentle; `:pros-cons` gentle | `guides/StarcraftBWAPI.html` → `#getting-started .grid`; `#remastered-setup .text-blue-700`; `#remastered-setup ol`; comparison card 3 | This specific route works natively without downgrading. It uses Custom Game and **Use Map Settings**, with only the provided integrated maps. It is not a claim about arbitrary Battle.net maps or general BWAPI support on all Remastered installations. |
| `starcraft:schnail`, `realisticAI` | `starcraft:ai-options:comparison` gentle; `starcraft:schnail:pros-cons` gentle; `:own-game` gentle; base `:features` gentle | `guides/StarcraftBWAPI.html` → comparison card 1; `#schnail-setup ul`; `#schnail-setup .text-blue-700` | The guide rates it as more realistic. It is a client-based option containing its own Brood War game version. Its initial login needs internet; it is not an offline-first substitute, and no same-installation Remastered compatibility is asserted. |
| `starcraft:bwai`, `offline` | `starcraft:bwai:features` balanced; `:pros-cons` gentle; `:setup` gentle; exclusion witness `:compatibility` balanced | `guides/StarcraftBWAPI.html` → `#bwai-setup > ul:last-child`; comparison card 2; `#bwai-setup ol`; `#bwai-requirements ol; #bwai-setup .text-yellow-700` | A positive recommendation is constrained to the guide's separate Brood War **1.16.1** setup. The earlier prerequisite list also mentions Remastered, but the setup warning requires 1.16.1. The conflict witness excludes confirmed Remastered support and must never be used as positive authorization. |

The three-option comparison record comes from the actual comparison grid. Its shorthand “most realistic,” “offline,” and “easiest” is attributed guide evidence, not a measured performance benchmark. No universal “best AI,” tournament win rate, cost, operating-system support, or compatibility guarantee is added. In particular, playing Remastered does not itself imply a preference for maximum realism or permission to switch game installations.

The StarCraft II ID is recognized for exclusion, not as supported scope. The scope witnesses identify Remastered or Brood War; no profile provides evidence for a StarCraft II implementation. BWAILauncher cannot be positively recommended when only an unspecified or conflicting Remastered edition is known. If edition information is missing for an offline request, the recommendation must state the guide's 1.16.1 condition or ask for the edition before setup.

## Ultima VII party-role choices

These are conditional role matches from the existing guide roster, not an exhaustive party optimizer. Another archer or tank may exist; the catalog does not assert that its three profiles are the only options.

| Goal and profile | Exact indexed evidence | Physical source reviewed | Scope |
| --- | --- | --- | --- |
| `healing` → `ultima7:companion:jaana` | `ultima7:companion:jaana:explanation` gentle | `guides/js/Ultima7.js` → `DB.companions[6]` | The guide calls her Healer (Druid), gives Healing and magic as focus, and says she periodically heals the party for free and has innate magic. It does not supply a recruitment method or current party membership. |
| `frontline` → `ultima7:companion:dupre` | `ultima7:companion:dupre:explanation` gentle | `guides/js/Ultima7.js` → `DB.companions[2]` | The guide's own description calls him a front-line anchor and its best front-line tank with highest starting Strength. This is a tank-role claim from the guide, not “best companion for every player.” |
| `ranged` → `ultima7:companion:iolo` | `ultima7:companion:iolo:explanation` gentle and `:stats` gentle | `guides/js/Ultima7.js` → `DB.companions[0]` and `.str/dex/int/com` | Fighter (Bard), Balanced archer, and the explicit ranged tag justify a ranged-role match. No invented damage ranking or optimal build is added. |

Each companion explanation also explicitly states that Party Builder choices are a plan, not proof of actual party membership. The planner must preserve this distinction and never assert saved party membership, checklist completion, or a recruited state from a recommendation. Unknown role goals, such as a budget, platform, or unindexed damage benchmark, require clarification/source abstention instead of nearest-profile invention.

## Verification and limitations

The catalog was authored against local source records and then checked against the physical guide HTML and roster declarations. Every witness quote and source locator was mechanically compared with the referenced indexed record/variant; every trait has a known criterion and a witness; every summary/limitation text is an exact witnessed variant. No outside facts or generated answer text were used as evidence.

Indexed sources read: `guides/tests/assistant/evidence/conversation-starcraft-source-records.json` and the existing exported `guides/tests/assistant/intent-prototype/assets/ultima7-records.json`. Physical files read: `guides/StarcraftBWAPI.html` and `guides/js/Ultima7.js`. This catalog is manually reviewed source data, not blind evaluation data. The companion selection is intentionally small; recommendations outside the declared goals need more reviewed data.

This review does not claim that controller behavior, authorization, constraint persistence, or rendering has passed runtime tests. Those must be tested by the implementation and independent consultation evaluation.

Ultima VII declares no additional editions in this catalog. The controller must reject production-parsed named editions that have no catalog alias before selecting a profile; this includes Serpent Isle. The three roster profiles therefore cannot be used to imply Serpent Isle coverage. This is a controller input-scope guard, not a fabricated positive compatibility witness.

Final reviewed catalog raw SHA-256: `866a4a54cd660f496d3f993fe47372499806232a0d5717e86ec12c4ddf6a398b`. Static verification covered six profiles and 38 exact indexed witnesses. Lower-tier witness prose can be used at a higher help ceiling only after independently authorizing that explicit witnessed variant; a different highest-visible variant is not permission to invent or substitute text. The controller author confirmed this verifier contract and the unsupported-edition guard before integration.

Before any model or consultation comparison run, source-capability aliases `no external launcher`, `without an external launcher`, `without external launcher`, `native option`, `native map`, and `no launcher` were added to `nativeRemastered`. They are short goal vocabulary, not full-question patches. The native trait also gained the exact `starcraft:remastered-map:features` gentle witness, which explicitly states an integrated map without an external launcher. The profile still requires actual Remastered edition context. The earlier reviewed draft hash was `ff7ce1bf67946d8a4a6161453c812a9d5ca96a0da2da02c61045d10f070beb91`; the final hash above includes this pre-run source-capability vocabulary addition.
