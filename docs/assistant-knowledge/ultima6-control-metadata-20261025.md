# Ultima VI control and permission metadata — 2026-10-25

This source-only change refines actor, place and item ownership for the existing Sherry and Ariana/Anya instructions. The original guide, adapter, runtime, frozen conversation fixtures, source text, aliases, embeddings and model assets were not edited by this change. Manifest hash refresh belongs to the integration owner.

## Exact source boundaries

`gameData.quests[0].sections[2].steps[1]` says: “Travel to the Sword and Keg in Jhelom, position Sherry at the mouse hole, and switch control to her.” The existing `sherry-jhelom` fact remains owned by Sherry, with its existing `destination`, `method` and `sequence` capabilities. It gains literal bindings for Sherry, Sword and Keg, and mouse hole. It does not gain `location`; an instruction to take Sherry somewhere does not establish her residence or the player's current position.

The declared place `ultima6:knowledge:mouse-hole` has name `Mouse hole` and alias `Valor mouse hole`. The new direct `mouse-hole-sword-keg` edge records `located-in` from this place to Sword and Keg, with `sherry-jhelom` as its complete proof. The existing tavern-to-Jhelom edge is retained separately. A reader must not traverse these edges to manufacture an additional proof.

The direct `mouse-hole-control-sherry` edge uses predicate `recommended-controlled-character`, from the mouse hole to Sherry, with `sherry-jhelom` as its complete proof and `conditional` status. It is a guide instruction for who should be controlled. It does not answer who the visitor is controlling, who is in their party, or whether they have reached the hole. The declared Sherry endpoint canonicalizes to `ultima6:atlas:marker:Sherry` in `buildKnowledge`. A graph reader may expose a `controlled-character` request for recommendation wording while retaining the existing rejection of current-player-state questions.

`gameData.quests[0].sections[2].steps[2]` explicitly says: “Enter the mouse hole as Sherry to grab the rune, then regroup with the party.” The existing `sherry-rune` fact gains Sherry and mouse-hole bindings; its Rune of Valor binding gains the fact's existing `sequence` capability. The rune has acquisition/method/sequence roles; the hole has use/method/sequence roles. This preserves the explicit retrieval-and-regroup instruction in a single witness. No cross-step prerequisite, return destination, delivery recipient, control key, or item-transfer mechanic was inferred.

`anya-permission` remains owned and bound only to Anya: visit her at the Blue Boar Tavern, mention RUNE or PERMISSION, and answer YES. The Ariana requirement, rune receipt and PERMISSION/YES helper gain explicit Ariana bindings. The helper also binds its literal `rune` mention to the Rune of Compassion. These changes do not attach Ariana's method or reward to Anya. Ariana's existing conditional `gives` edge remains the rune-provider proof; the separate Anya-to-Ariana continuation requires both complete instruction witnesses. None establishes that permission has been obtained.

## Static validation

Before the change, all 992 authorized Ultima VI source records compiled to 111 accepted facts, 139 declarations, 443 compiled entities and 98 accepted links, with zero issues. After the change, the same records compile to 111 facts, 140 declarations, 444 compiled entities and 100 accepted links, with zero issues. Answer bindings increase from 69 to 78. No fact capabilities were added or removed.

All 111 `knowledgeDocument` values are byte-identical before and after the change. The SHA-256 over `JSON.stringify(facts.map(f => ({id:f.id, document:knowledgeDocument(f)})))` is unchanged:

```text
6de63e96da17d50e35025ddedd5e68bc3e8ee27d4437807c3a2b7c4ac4ab24f6
```

The protected tuple `{id, document, subject, facet, aliases, text, witness, source, sourceRecordId}` is also byte-identical for every fact. Its aggregate SHA-256 is:

```text
eed18365645c80ffbad807bf333802ecbf83cf7fd2f37f9f679edfd68b009dac
```

The static suite `guides/tests/assistant/ultima6-control-metadata.test.mjs` passes 5/5 tests under the existing bundled Node runtime. It checks exact document/source invariants, successful compilation, direct mouse-hole location, canonical controlled-character ownership, rejection of current-control state questions, the explicit rune/regroup roles, and separate permission/giver/continuation roles. This is source and metadata validation; it does not claim production conversation acceptance or regenerate any vectors.
