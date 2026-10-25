# Ultima VII procedure metadata review — 2026-10-25

This review uses the existing authorized guide declarations and source records. It does not run a model, produce embeddings, download assets, or claim a play-tested recipe.

## Exact source evidence

| Source | Literal evidence | Indexed role |
| --- | --- | --- |
| `guides/js/Ultima7.js`, `DB.virtueQuests[5]` | “defeat Dracothraxus for the Ether Gem” | Ether Gem acquisition/method; Dracothraxus objective |
| `guides/js/Ultima7.js`, `DB.virtueQuests[6]` | “Ask Erethian about the artifact of power.” | Artifact conversation method and conditional `ask-about` edge to Erethian |
| Same declaration | “Free Arcadion into the Ether Gem via the mirror.” | Arcadion release method; Ether Gem use/method |
| Same declaration | “Heat and hammer the blade at the forge until it's sharp, then bind the daemon to forge the Black Sword.” | Black Sword acquisition/method/sequence |
| `guides/js/Ultima7.js`, `DB.virtueQuests[7]` | “Return to Dracothraxus and invoke the Black Sword's power to finish the test.” | Black Sword use/method/outcome; Courage completion |
| Same declaration | “Assemble the two museum lenses and the Talismans of Principle on the Dark Core per instructions, then report to Lord British for his reward.” | Distinct lenses and Talismans use/method bindings and `assemble-on` edges |
| `guides/js/Ultima7.js`, `DB.virtueQuests[4]` | “Receive the Talisman of Love when done.” | Talisman acquisition/outcome; no recipe added to this short witness |
| `guides/Ultima7.html`, `#virtue-quest-content: The Reward` | “Lord British will reward you by raising your Strength, Dexterity, and Intelligence to 30 (or even 60 in some versions).” | Stats/outcome/version/limitations; caveat preserved |

## Metadata changes

Five existing facts have metadata changes: `black-sword-forging`, `arcadion-mirror`, `black-sword-full-method`, `dark-core-assembly`, and `love-talisman`.

The forging slice now explicitly belongs to Black Sword. The mirror slice now belongs to Arcadion. The full forging fact binds the literal artifact lead and Erethian as method subjects, and Ether Gem as use/method. The Dark Core fact binds its explicitly named Talismans. The short Talisman receipt witness can answer acquisition as well as outcome.

One entity is added: the literal “artifact of power” as a topic. No identity equates that phrase to Black Sword or Ether Gem. Two edges index the conversation lead and Talismans assembly. Existing Black Sword daemon and Courage power edges remain unchanged.

Two exact source contexts are added: the `DB.virtueQuests[6]` forging passage and the `DB.virtueQuests[5]` Courage passage. Finale facts in `[7]` belong to neither scope. Context membership adds no prerequisites, ordering, location, or player state.

## Retained limits and roles still absent

The source supplies no detailed forge controls, heating count, hammering count, sharpening threshold, mirror interaction controls, or expanded binding recipe. The generic words “mirror,” “blade,” and “forge” remain literal procedural details; no new named inventory item, location, or device identity is invented for them. The “artifact of power” lead does not itself establish what that artifact is.

The source describes a broad Forge of Virtue overview and reward, but no single literal declaration is used to infer an expansion-wide prerequisite or completion graph. The existing overview source records remain available; there is no new focused fact document or broad source scope. Courage preparation and later return remain distinct from forging.

## Verification

`ultima7-procedure-scope.test.mjs` passes seven source-only tests. The manifest compiles with zero issues: 123 facts, 120 declared entities, 64 links, and four source contexts. All 117 extracted witnesses remain present in their authorized source records; six pre-existing external-research facts are unchanged.

All 123 `knowledgeDocument` strings exactly match the existing embedding catalog. The frozen projection of every fact's ID, subject, facet, aliases, text, witness, source tuple, and sourceRecordId is unchanged (SHA-256 `83447ed627458a032d2f4a9ff4b1fdc15f6a93315ed60b84b26a2a26a65ebf74`). No vector refresh is required.
