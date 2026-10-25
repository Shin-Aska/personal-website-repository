# Ultima VI procedure scope audit — 2026-10-25

The metadata distinguishes asking Manrel for the key from using that key at Beyvin's tomb, and taking the Honor rune from returning it after cleansing the shrine. Swamp Cave preparation, route, and treasure remain separate source steps within one reviewed container. No new procedure phase schema is introduced.

## Exact guide source tuples

All rows use `guides/js/Ultima6.js`, review `extracted`. Parent records are authorized at `direct`. Inline code backticks in the raw guide strings are removed by the existing Ultima VI adapter; the complete resulting witness and answer text are unchanged.

| Fact | Locator | Authorized parent record |
| --- | --- | --- |
| `manrel-key` | `gameData.quests[0].sections[1].steps[0]` | `ultima6:quest:act-i-liberating-the-shrines:honesty-moonglow:hint` |
| `beyvin-flowers` | `gameData.quests[0].sections[1].steps[2]` | `ultima6:quest:act-i-liberating-the-shrines:honesty-moonglow:hint` |
| `whitsaber-loan` | `gameData.quests[0].sections[5].steps[0]` | `ultima6:quest:act-i-liberating-the-shrines:honor-trinsic:hint` |
| `honor-pedestal` | `gameData.quests[0].sections[5].steps[1]` | `ultima6:quest:act-i-liberating-the-shrines:honor-trinsic:hint` |
| `honor-return` | `gameData.quests[0].sections[5].steps[2]` | `ultima6:quest:act-i-liberating-the-shrines:honor-trinsic:hint` |
| `side-3-step-0` | `gameData.sideQuests[3].steps[0]` | `ultima6:side-quest:explore-the-swamp-cave:hint` |
| `side-3-step-1` | `gameData.sideQuests[3].steps[1]` | `ultima6:side-quest:explore-the-swamp-cave:hint` |
| `side-3-step-2` | `gameData.sideQuests[3].steps[2]` | `ultima6:side-quest:explore-the-swamp-cave:hint` |

## Reviewed metadata

- `manrel-key` binds KEY acquisition, method, and prerequisites separately from Manrel's location. The existing `contact-for-key` predicate is retained: the literal step says to ask for KEY, without a literal claim that Manrel gives it.
- `beyvin-flowers` belongs to the tomb rather than the person Beyvin. Its key binding supports use and method; its rune binding supports acquisition, method, and sequence. The source directly supports the tomb's `unlocked-with` key link.
- Honor pickup binds acquisition to the rune and location to the central pedestal. The later return passage binds the return destination to the pedestal; its `return-to` edge requires only `honor-return`. Whitsaber's loan is separate, and the later report to Whitsaber does not make him the rune's recipient.
- Honesty and Honor source contexts resolve the local bare word “rune” within their exact shrine quest containers. The Swamp Cave context uses the exact side quest title. Its step witnesses do not literally name Swamp Cave, so no answer binding invents that mention. Context membership itself establishes no prerequisites, action, state, or destination.

Five facts receive bindings, four entities are declared, two links and three source contexts are added. `honor-return` adds the directly supported `destination` capability. Every fact ID, subject, facet, alias list, text, witness, source tuple, and sourceRecordId remains unchanged.

## Verification and runtime boundary

`ultima6-procedure-scope.test.mjs` checks raw guide steps against their authorized parent text, the distinct bindings and direct edge proofs, exact context containers, and unchanged encoded documents. Together with `ultima6-control-metadata.test.mjs`, 10 focused tests pass and the knowledge compiler reports zero issues.

The 111 frozen encoded documents retain SHA-256 `6de63e96da17d50e35025ddedd5e68bc3e8ee27d4437807c3a2b7c4ac4ab24f6` over the existing `{id, document}` corpus representation. The protected field hash remains `eed18365645c80ffbad807bf333802ecbf83cf7fd2f37f9f679edfd68b009dac`.

These tests establish source and metadata integrity. Selecting a preparation step instead of treasure, or actual return instead of a promise to return, still requires the shared runtime's procedural predicate proof. The existing graph reader's recipient questions accept people; a place-valued return edge must be read through a destination path without converting the pedestal into a person.
