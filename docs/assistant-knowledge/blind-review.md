# Independent conversational acceptance review

The fresh suite is `guides/tests/assistant/knowledge-blind-cases.json`: **24 conversations, 96 turns, 74 supported answers and 22 boundaries**, with four conversations and sixteen turns per game. Questions, useful answer claims, exact source locators, source witnesses and phrase assertions were fixed before any runtime query. The existing per-game conversation corpus and replay/reply artifacts were not read during authorship. This is a fresh wording and conversation test, not a proof that every possible game question is answerable.

The frozen corpus SHA-256 is `4dbdf52d7976e370195ed2fa8e6db6528d470266a9e129880a4533ddbc6f2ebb`. Source hashes at freeze are included in the corpus. The one metadata correction during source-only validation mapped four story-only Ultima VII research entries to their actual narrative source record IDs; neither questions nor required claims changed, and no query output had been inspected.

## Source inventory and oracle review

Read sources: all six focused knowledge manifests; the six production adapters' source and relationship handling; the six existing per-game audits' source boundaries; actual selected authorized guide records through the Node declaration loader; StarCraft's HTML setup DOM; and Ultima VII's existing research/narrative overlay. No new external research was performed. Existing outside-research claims retain their checked dates, exact evidence URL/label and external provenance; this review does not claim to have freshly fetched those pages.

All sixty positive non-StarCraft turns have their exact witness inside a Direct-authorized actual adapter record. The focused fact's locator may refine that original record to a particular step; those finer locators are deliberately retained. Seven StarCraft guide witnesses match the exact selected HTML text after the adapter's whitespace cleaning. Seven StarCraft outside-research expectations use the existing manifest's reviewed claim, witness and primary references. All 74 positive phrase sets occur in their fixed source witness. The 22 unsupported cases state an independent reason and required behavior; they are not negative because a retrieval attempt happened to fail.

| Game | Conversations and fixed useful claims |
| --- | --- |
| Ultima V | Grapple giver → Michael's day location → keyword; mantras versus dungeon Words → Humility bonus and meditation; Faulinei identity → summoning → timed shard use; Cape plan pickup → application → speed. |
| Ultima VI | Ariana's required consent → Anya's actual interaction → return recipient; Sherry recruitment → destination/control → pickup; cloth → bag/basket makers → final assembly; Gargish book recipient → tablet lead → next lead. |
| Ultima VII | Lord British identity → Guardian identity → motive → Time Lord opposition; Time Lord role → request → unknown actor and invalidated follow-up; Love test definition → reward → Courage gem holder; Weston crime → release procedure → Black Gate wand use. |
| Al-Qadim | Wide/full-circle attack mechanics → Zubakon location; Lightning Bolt risk → aim/fire → charge consumption; named bottle acquisition → use → exact South chessboard route; old dungeon key → escort objective → unsupported voice restoration → journal evidence. |
| Albion | Khunag identity → entry condition → Kamulos tactic; Pistol acquisition → ammunition → hiding method; Sira identity → named spell cost/effect → trainer; Monster Eye vendor → unsupported mechanism → Dreamshield effect and vendor. |
| StarCraft | BWAPI identity → API target version → UAlbertaBot identity/creator; SCHNAIL Java → included game → network condition; Remastered map compatibility → archive folder → menu → Game Type; PurpleWave identity → separate Java requirement → Steamhammer lineage. |

The suite uses short pronouns and relation changes in context, alongside explicit shifts to named related entities. It tests unknown-topic invalidation, current party/inventory/completion or machine-state uncertainty, unsupported edition/version details, unsupported numerical thresholds, missing procedures, and source-only/current-ranking requests. Meaningful positives dominate: methods require concrete actions or interactions; the Tarik voice objective is specifically **not** accepted as a restoration method. No expected states are seeded into runtime.

## Actual verification scope

Source and oracle consistency checks above completed before any query execution. Browser runtime acceptance is recorded separately below. UI citations can verify exact rendered file/locator and fixed required answer text; they cannot prove internal retrieved fact IDs. Claim wording, uncertainty and related-entity transitions still require semantic review of rendered answers. A run during source changes is diagnostic and cannot be accepted as a stable-source result.

### Stable native browser run: `native-01`

Executed the frozen corpus through the six principal production chat surfaces using `knowledge-blind-browser.py`. The harness owns and closes an ephemeral loopback server and a fresh headless Chrome context. It imports existing browser helpers and the existing SmolLM consent fixture; it does not invoke the existing corpus loader. MiniLM classification and query encoding were native and observed on every turn: sixteen classifications and sixteen valid 384-dimensional embeddings per game. The generative worker was explicitly fixture-backed, so this is not native SmolLM inference acceptance.

The evidence is `guides/tests/assistant/evidence/knowledge-blind-browser-native-01.json`. All 96 turns ran. **Sources were stable throughout**, and all harness boundaries passed: no external requests, no page errors, static GETs only, no saved-game writes, unchanged game storage, and server closure. Source hashes before/after and the frozen corpus hash are recorded. The previous user preview server and browser tabs were not touched. All six final chat screenshots were captured; the Ultima VII screenshot was visually inspected and showed the production chat and citations rendering normally.

| Game | Strict frozen-oracle passes / 16 | Useful positive claims / supported turns | Safe non-answer decisions |
| --- | ---: | ---: | ---: |
| Ultima V | 5 | 1 / 12 | 4 / 4 |
| Ultima VI | 6 | 2 / 12 | 4 / 4 |
| Ultima VII | 6 | 5 / 12 | 4 / 4 |
| Al-Qadim | 9 | 5 / 12 | 4 / 4 |
| Albion | 6 | 4 / 12 | 4 / 4 |
| StarCraft | 5 | 5 / 14 | 2 / 2 |
| Total | **37 / 96** | **22 / 74** | **22 / 22** |

The strict result includes fifteen positive passes and twenty-two non-answer decisions. Seven additional positive replies contained the required useful claim but failed the fixed exact citation assertion: Guardian identity, Time Lord's request, Courage's Ether Gem holder, Khunag identity, Sira identity, UAlbertaBot identity and PurpleWave identity. The runtime renders external research as checked reference labels/URLs rather than the manifest's local fact locator; three guide replies used a broader source locator. These are separated as citation/locator failures in this review, not silently counted as full source-oracle acceptance. The frozen oracles and failed report were not changed after output inspection.

**The 52 other supported turns did not supply the required useful answer.** The failures show material conversation limitations, not just citation differences:

- A lead-in mentioning Britannia makes “Who is Lord British?” ambiguous; the same happens to an Ariana/Compassion question and a Pistol/Toronto question. Subsequent pronouns then remain blocked by unconfirmed subject state.
- Humility meditation returned Spirituality's OM instructions; a Faulinei shard follow-up returned Astaroth's Shard of Hatred timing. Both are wrong-entity answers with sources, so a citation alone cannot establish correctness.
- HMS Cape acquisition returned only the building entrance. Its use follow-up repeated that entrance instead of applying plans to the frigate. This fails the concrete-action oracle.
- Asking what Mariah says about the tablet returned the later gypsy-to-Homer instruction. Asking for the gypsies' destination then failed. Narrative step adjacency did not preserve who said what.
- “Who trains Iskai magic?” returned Sira's character description; Dreamshield's effect question returned its vendor. Role and requested relationship were lost.
- A PurpleWave follow-up asking whether it shares SCHNAIL's Java recommendation returned SCHNAIL's Java 21 instruction, failing the separately sourced 32-bit JDK 8 requirement.
- Integrated-map compatibility returned the Custom Game menu, then archive/menu pronouns could not maintain the map subject. Concrete menu and Game Type facts exist, but relationship routing missed the requested compatibility claim.
- Ordinary phrasing such as “call him out,” “what is he trying to achieve,” “keep firing ... forever,” and “walk me through making” often fell into generic clarification or unsupported-condition messages despite a fixed useful fact.

The twenty-two negative decisions establish a narrower safety result than complete conversational success. They did not fabricate the forbidden unknown identity, edition detail, player state or unsupported procedure. Many did **not** explain the actual gap: the Tarik restoration-method request produced a bottles menu; the empty-shard recharge request produced a generic relation menu; current-save/current-party/current-install questions produced generic clarification; the exact-karma request offered a Gruman-versus-Karma choice. These meet the automatic non-answer check but are low-quality uncertainty handling and do not satisfy their richer `requiredBehavior` on semantic review. The unknown Lady Zephyr turn correctly stopped Time Lord identity reuse; its Guardian follow-up offered a new Guardian question rather than inventing her relationship.

This run therefore does **not** accept the six-game smart-knowledge goal. It demonstrates native production operation and source safety boundaries while exposing broad natural-language and multi-turn relation failures. No source, runtime, model, existing fixture or frozen blind oracle was edited in response to these results.
