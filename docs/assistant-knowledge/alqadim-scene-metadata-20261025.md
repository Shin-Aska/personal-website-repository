# Al-Qadim source-scene metadata review — 2026-10-25

This metadata-only pass covers the academy trial and wrecked-ship material in the existing trusted guide. It adds no guide prose, vectors, model files, installations, training, profile changes, question aliases or player-state claims. Runtime and frozen conversation corpora remain read-only for this pass.

## Recorded relationships

- `ch1_1` says “Speak with Master Sinbar to initiate the trial.” Sinbar remains the fact's primary subject. A separate **Academy trial** quest entity (literal alias `trial`) receives method, objective and outcome answer bindings through the exact mention `the trial`. A conditional `begins_with` link points from trial to Sinbar and retains the required action `Speak with Master Sinbar`. It describes the stated initiation action, not a claim that Sinbar is the trial, that he grants graduation, or that the player has spoken with him.
- `item-ship-orb-use` explicitly states that the Ship Orb powers and restores the corsair ship for navigation (`DB.keyItems[5].description`). Its reviewed answer roles include method and outcome as well as use; exact mentions bind that effect to the corsair ship and navigation. The directed `restores` edge points from Orb to ship. The ship-restoration objective `ch4_6` can compose this independently explicit effect using `support.method`; the objective alone does not acquire a fabricated repair procedure. No installation or activation sequence for the Orb is supplied.
- `ch4_7` literally places barrels in the ship's hold. A `located_in` edge relates those barrels to the hold; the hold gains the source's literal alias `ship's hold`. The existing healing-potion yield remains conditional on smashing the barrels. This does not say the player owns potions or has cleared the hold.
- Existing `ch4_5`/`orb-helm` already state the Ship Orb's helm-cabin acquisition/location. Existing `ch1_2` states staying close to walls for the moving disintegrator, and `ch1_6` states entering the northern teleporter to exit to Zaratan. These fixed witnesses and their capabilities are unchanged.

## Scene-context boundary and reusable contract

The academy's original chapter title is `Graduating From the Academy`, and its required/optional declarations supply the explicit source hierarchy for its steps. That hierarchy is legitimate source context, but individual field/teleporter witnesses do not literally mention the Academy trial. They therefore receive no fake literal `answerBindings` mention of the trial. Nor does chapter order establish a prerequisite or story-event edge.

Likewise, `DB.keyItems[5].location` explicitly labels the Orb's location `Deadman's Reef (Wrecked Ship)`, while the focused acquisition witness names the helm cabin. The ship-hold/barrel witnesses refer to the hold, but do not themselves establish that every nearby chapter objective happens inside the wrecked ship. No new focused fact or unsupported containment edge is manufactured to bridge these source scopes.

The reusable **source-scope context contract** is now implemented in `guides/js/assistant/source-contexts.js`. The pure compiler `compileSourceContexts({contexts, entities, sourceRecords})` returns `{contexts, issues}`; callers supply canonical entity IDs and already authorized direct records. A declaration has `{id, entityId, sourceRecordId, label}`. Its compiled copy adds the exact parent's source attribution. IDs must be unique, the entity and unique parent record must exist, and a literal descriptive parent label must relate to the entity name or alias. External/conflicting provenance and compound/malformed parent locators are withheld.

`factSourceContexts({fact, contexts})` returns only matching compiled context objects. It compares the same source file and complete structural locator segments. `DB.chapters[0]` covers its child `.required[id=ch1_1]`, but does not cover `[00]`, `[01]`, `[1]`, malformed suffixes or another file. All semicolon-separated locator clauses must remain in that one container. No record-ID naming pattern, text match, graph relationship or transitive membership is used.

The manifest declares two scopes:

| Context ID | Existing anchor | Authorized parent | Literal label | Exact source container |
| --- | --- | --- | --- | --- |
| `academy-trial-source-scope` | `alqadim:knowledge:academy-trial` | `alqadim:chapter:1:hint` | `Academy` | `DB.chapters[0]` |
| `reef-ship-source-scope` | `alqadim:chapter:4` | `alqadim:chapter:4:hint` | `Deadman's Reef` | `DB.chapters[3]` |

The second scope retains the actual broader Reef & Ship chapter anchor. There is no chapter parent literally labeled Wrecked Ship; the field-level Orb location record does not authorize inventing one. The Orb's separate key-item use witness stays outside that chapter scope.

Source-scope membership permits contextual candidate selection, while each answer still requires its own fact's answer roles and witness. It creates no literal mentions, prerequisites, item possession, current location, story chronology, actor biography or transitive physical containment. These scopes are separate from physical `located_in` links. Root integration owns runtime interpretation and scope memory.

The direct metadata supplies stable anchors for trial initiation, Orb restoration, helm-cabin acquisition and hold-barrel acquisition. The new source scopes supply reviewed academy/reef contextual candidates. Omitted subjects, contextual continuity and field selection remain integration concerns.

## Validation

Run:

```sh
/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test guides/tests/assistant/alqadim-scene-metadata.test.mjs guides/tests/assistant/source-contexts.test.mjs
```

All thirteen source-only tests pass (seven game metadata checks and six generic context checks). Production `buildKnowledge` compiles **113 facts, 140 declared entities, 297 compiled entities and 47 directed links with zero issues**. Every exact witness occurs in its authorized source record. The tests independently check the original Sinbar, Orb-effect and hold-barrel declarations, conditional links, unchanged hazard/exit capabilities, actual authorized context parents and structural membership. Negative pairs cover sibling/padded/malformed indices, different files, mixed compound locators, unknown targets, bad labels, duplicate IDs/parents, conflicting/external sources and graph/text-based membership guesses.

Every fact's ID, subject, facet, aliases, text, witness and source remain unchanged. All 113 `knowledgeDocument(fact)` strings exactly match the existing frozen embedding catalog; no document was re-encoded and no vector was replaced. Manifest digest refresh remains the parent integration's centralized operation. These structural checks do not claim native conversational acceptance or change any original oracle.
