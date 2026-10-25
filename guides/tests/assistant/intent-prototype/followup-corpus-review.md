# Follow-up corpus v2: pre-run review

These are additional local intent-lab inputs for Ultima VII and the StarCraft AI guide. The frozen v1 files are preserved byte-for-byte. No production code or source records were edited. No installation, download, commit, deployment, or model run was performed by the corpus author.

## Frozen datasets

Frozen on 2026-10-24 before the v2 model run. Preserve these raw-file hashes in the run report. Any later correction needs its own revision and explanation; observed failures must not silently change these expectations.

| File | SHA-256 |
| --- | --- |
| `cases/training-v2.json` | `7b6de20db5751ea0d21dcfcacbe6dba1fdf787586a8e6f1af3a5e06ad618b6c8` |
| `cases/validation-v2.json` | `e54d90a131fd9e1f36bd8467c377425bf0790bf63e392b95d0f3f7b5afc482f7` |
| `cases/followup-evaluation.json` | `877827a32d23b0cd1cf0b20a6be30b9b42ab2174a32c453f2c183b833c5938c3` |

## Contents and input contract

- `training-v2.json`: all 120 original training examples, unchanged, followed by 60 manually authored short samples (five per label); 180 total.
- `validation-v2.json`: all 36 original validation examples, unchanged, followed by 36 separate short samples (three per label); 72 total.
- `followup-evaluation.json`: ten conversations, five per game, 65 total turns. Nine are authored follow-up checks; one is explicitly a reported-regression conversation. This evaluation is separate from the frozen v1 classification comparison and must be reported separately.
- The encoder/classifier input is the actual raw utterance. Do not append the expected subject, canonical question, game title, expected intent, or prior expected answer to it. Subject grounding and conversation constraints are separate runtime operations using actual prior turns.
- `intent` names the effective requested intent after legitimate dialogue handling. `rawIntent` is supplied on the confirmation-only sentence (`unknown`) because a genuine pending subject can inherit the preceding identity intent. The pending candidate must come from the actual resolver, not `entityTitle` or `transition`.
- No expected field, including `restriction`, `supported`, evidence, or record IDs, is an input control. Actual UI inputs are `action: resetTopic` and `options.spoiler: gentle`. The default help level is direct. Textual guide-only and edition constraints must carry into fragments using actual runtime state, and explicit text allowing research or changing edition must release them. A new named subject alone does not license silently dropping a stated constraint.
- The two reset-control turns intentionally have the same display text; their `action` fields are real inputs, so they do not test natural-language reset recognition. Other new text has no duplicate within its fitting split.

The label vocabulary is unchanged. Short `download link` / `get the installer` requests are acquisition; installing/setting up is use. A named documentation page request is location. Bare `link` or `URL` has no uniquely requested resource type and is unknown/clarify, even if the previous subject has multiple links. A fragment such as `download URL?` still has acquisition intent but cannot answer without a grounded subject. `stats` stays a numeric-attribute request, not a request for a general biography. `and his job?` retains the job/occupation qualifier under identity; answering a whole biography is not automatically sufficient. Source evidence must actually state the occupation. Unknown names must not fall back to a previously known subject.

## Known regressions and separation

The StarCraft reported-regression dialogue begins with the exact user exchange `what is schnail` → `download link`, and additionally tests the observed compound `download link of schnail`. `download link` is deliberately present in fitting data. This is a known regression and cannot be counted as fresh held-out language, regardless of whether the compound itself occurs in fitting data. The remainder of that conversation tests installation, requirements, troubleshooting, and documentation after the same subject.

The Ultima VII equivalent covers a named companion followed by `where is he`, `stats`, `and his job?`, and an unsupported request for a character download. Those raw strings do not occur in v2 fitting data; the scenarios nevertheless came from the requested follow-up design and are not blind or organic samples. All authored-followup raw messages were checked case-insensitively against both v2 training and validation: no exact overlaps. Training and validation have no exact overlaps with each other. Domain terms and subjects can recur; this follow-up experiment intentionally tests short language and state handling rather than held-out entities.

The corpus is small, manually authored after the parser design and v1 results, and weighted toward known failure families. A good score is evidence about these checks, not an estimate of real user accuracy. Fitting/validation are balanced by label (15 and six samples per label); dialogues are not class-balanced. The only fitting/evaluation exact message overlap is `download link`, within the declared reported-regression category. Duplicate actual reset-control text across two conversations is intentional.

## Answer-level oracle contract

Every `supported: true` turn includes:

- `expectedRecordIds`: the canonical indexed source record for the exact requested facet. Check actual proposed answer membership; resolving the same entity is insufficient.
- `replyContains`: short case-insensitive meaningful excerpts required in the actual proposed reply. These are drawn from the indexed quote, not a model answer; the entire evidence variant need not be displayed.
- `expectedUrls`: canonical URLs required when the request asks for a download or documentation link, or the answer uses a cited research source. These were copied from local HTML hrefs or indexed research sources; no live web freshness or link availability claim is made.
- `evidence`: the exact indexed `recordId`, `variant`, full source-backed quote, and file/locator; optional URLs are inspected local source links. Evidence is review material and must never seed classifier or resolver inputs.

`replyAbsent` marks selected stale/forbidden claims. Unsupported information requests have `requireDecline: true` and a facet-specific reason; the actual proposed reply must not be a factual answer. A source-protected request whose raw engine currently answers is a conflict/failure to report, not a success just because a restriction prevented rewriting. Reset action turns instead have `expectedControl: reset` and need no factual answer. The misspelled pending turn must wait for confirmation before answering.

## Source-facet audit

Ultima VII evidence comes from the existing `assets/ultima7-records.json` snapshot exported from the current guide sources; StarCraft evidence comes from `guides/tests/assistant/evidence/conversation-starcraft-source-records.json`. Canonical link hrefs were verified in `guides/StarcraftBWAPI.html`. These are source records, never generated replies.

| Conversation | Exact facets reviewed and negative boundaries |
| --- | --- |
| `sc-reported-download-exchange` | `starcraft:schnail:features` balanced explicitly identifies Starcraft Human and AI League as a client; the expected identity can be presented concisely from that facet. `:download` and `#schnail-requirements li:nth-child(2)` establish the account-gated downloads page, whose href is `https://www.schnail.com/#/downloads`. `:setup`, `:requirements`, and `:antivirus-note` establish distinct installation, dependency, and quarantine guidance. `starcraft:documentation:links` supplies the documentation links, not another installer. |
| `sc-launcher-short-operations` | `starcraft:bwai:features`, `:download`, `:setup`, `:detection-note`, and `:portable` are distinct identity/download/install/remedy/portable facets. Portable setup is quoted from the balanced variant, which explicitly says to point to Starcraft.exe; its gentle compatibility summary alone is not setup instructions. `:requirements` and `:compatibility` record a Remastered-versus-1.16.1 source conflict; the restricted installation fragment must not assume compatibility. |
| `sc-map-short-requests` | `starcraft:remastered-map:features` gentle states integrated map without an external launcher; its direct no-downgrade note alone is not an identity definition. `:download`, `:extract-location`, `:setup`, and `:mode-check-note` answer different resource/location/operation/remedy requests. `starcraft:narrative:remastered-map-outcome:outcome`, `#remastered-setup ol > li:nth-child(7)`, explicitly says standard Melee does not work properly; no internal DLL cause is inferred. |
| `sc-guide-only-and-empty-context` | `starcraft:research:what-is-bwapi:explanation` explicitly defines the C++ framework but is external research. `starcraft:documentation:links` is guide-backed and available under guide-only, but its links do not substitute for the excluded definition. After an actual topic reset, no installer subject exists. |
| `sc-wrong-edition-fragments` | The guide is Brood War setup. It contains no SCHNAIL for StarCraft II. Neither a download nor install nor prerequisite fragment may silently change the edition. An explicit new Brood War topic can use `starcraft:schnail:features`; the subsequent first-startup question is answered only by `starcraft:narrative:schnail-first-launch-cause:cause`, which explicitly mentions downloading game files. |
| `u7-bard-followup-regression` | `ultima7:companion:iolo:explanation`, `:location`, and `:stats` explicitly give the Bard role, Trinsic, and numeric attributes in `DB.companions[0]`. A character download has no indexed acquisition facet and must not return the biography or a different game's download. |
| `u7-two-companions-fragments` | Separate `ultima7:companion:shamino:{explanation,stats,location}` and `ultima7:companion:spark:{explanation,stats,location}` records come from `DB.companions[1]` and `[3]`; pronouns and fragments must follow the actual subject change. Guide locations are not live saved positions. |
| `u7-spell-use-and-lower-help` | `ultima7:spell:mark-recall:use` gives a reusable return point. It has no indexed location/acquisition answer, so those requests must decline rather than repeat its effect. `ultima7:spell:destroy-trap:use`, `DB.spells[1].description`, mentions the Tetrahedron but is direct-only; lowering help must prevent it from appearing in the repeated use answer. |
| `u7-source-and-spoiler-fragments` | `ultima7:narrative:lord-british-identity:identity` explicitly says king. Time Lord's substantive identity/occupation is `ultima7:research:time-lord-identity:explanation`; a guide atlas marker does not supply his job under guide-only. `ultima7:research:guardian-identity:explanation` is balanced and becomes unavailable at gentle. Jaana's separate gentle `explanation`/`location` companion facets explicitly give Druid and Cove, so a new gentle subject can still answer. |
| `u7-confirm-reset-and-unknown` | A real fuzzy candidate for Duprae/Dupre must wait for confirmation; only then may `ultima7:companion:dupre:explanation` and `:stats` supply Paladin and Strength. Reset removes that subject. Captain Azuron is unindexed and its following employment fragment cannot revive Dupre. A new named Sentri uses `ultima7:companion:sentri:explanation`, which explicitly gives Trainer. |

Before freezing, checks passed for JSON parsing, original-sample prefix preservation, label counts, train/validation disjointness, authored-followup disjointness from fitting, dialogue lengths/game balance, required evidence, snippet inclusion in actual indexed quotes, and local HTML href membership for expected guide links. All frozen v1 hashes remain unchanged.
