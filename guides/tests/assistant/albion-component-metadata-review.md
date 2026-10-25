# Albion Pistol and Canisters metadata review — 2026-10-25

The authorized `QUEST_HINTS["toronto-intro"]["pistol"]` instruction says to examine the damaged console in the COM room to get the **Pistol + Canisters**. The full witness also identifies the extra Stimdrinks in the east drawer. The separate `hide-weapon` instruction says: “After looting the COM room, hide the Pistol + Canisters in the wall cabinet on the service level before passing security.” Both complete source passages remain unchanged. `DB.equipment[5].effect` independently states that the Pistol uses Canisters.

The metadata adds two distinct entities: the item **Canisters** and the literal **Pistol + Canisters** bundle. The Pistol remains its existing item entity. Both added subjects bind to the pickup passage for acquisition, location and method, and to the security passage for method, location and use. The storage instruction does not gain acquisition capability. The ammunition effect binds Canisters only for use and prerequisites. No unrelated item acquires a security-method binding.

Two directed `has-component` links from the bundle retain the Pistol and Canisters as separate components. Each has the pickup and security passages as its proof. A directed `uses` link runs from Pistol to Canisters with only `pistol-effect` as its proof. Separate `found-at` links from Canisters and the bundle point to the COM room using the console pickup passage alone. The later wall-cabinet storage instruction cannot become their pickup-location proof. These links describe documented objects and instructions; they do not establish present possession, collection, storage, entry, or passing security.

Runtime reference resolution should retain both component IDs for a compound mention and for a plural continuation that has that specific established antecedent. A plural pronoun alone does not justify mapping to the Pistol. A bundle requires the exact documented direct components and every eligible proof; component edges do not authorize transitive containment, ownership, arbitrary item grouping, or treating any use of Canisters as the Pistol. The same-object concealment answer must use the complete `hide-weapon` witness, including the service-level wall cabinet and timing before security. This review makes no claim that metadata alone resolves dialogue behavior; generic continuation and candidate-scope behavior remain runtime responsibilities.

Static verification passes all 58 tests in `albion-component-metadata.test.mjs`, `knowledge-contracts.test.mjs`, and `knowledge-graph.test.mjs`. Compilation reports zero issues. Counts are 132 facts, 113 declared manifest entities, and 38 links (previously 132, 111, and 33). Every frozen `knowledgeDocument` still matches the existing embedding catalog.

Protected fact projection SHA-256 (`id`, `subject`, `facet`, `aliases`, `text`, `witness`, `source`, `sourceRecordId`): `b512e9ca9aaee0817c570651397ab6b69703f6d4c1fe6fb42994b9122ed912a7`.

Frozen document projection SHA-256 (`factId`, `knowledgeDocument` text): `7299517b59d634558c2fb82c7df58ff5559448ffc8d19f020f856f41905fce5f`.

Unmodified source `guides/js/Albion.js` SHA-256: `4adba84eca7af2436731b7053e3167a909f57f85edc611c6287411af84e4b1ca`.

Unmodified `albion-embeddings.json` SHA-256: `77b5f59921e378c768f51bd66daff3c4a21cd4608c61b67c2702bdd004b44f9d`.

No models, encoders, downloads, installations, publication, source edits, oracle edits, or embedding edits were used.
