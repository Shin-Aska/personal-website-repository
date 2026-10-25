# Independent source-first conversation oracle: other three games

Frozen at 2026-10-24T18:46:53.713347Z.

Artifact: `guides/tests/assistant/knowledge-independent-other-20261025.json`

SHA-256: `60c58336240b09371d1fc0fb2546606748087ce14f3290951eb615c498a0c2aa`

Six four-turn dialogues cover Al-Qadim, Albion, and the StarCraft guide: 24 turns total, comprising 18 source-answerable turns and six unsupported-boundary turns. Each dialogue has natural follow-ups or a topic switch. Every positive includes a specific source locator, concise claim fragments, an explicit useful-answer requirement, and the original guide witness. There are no alternative source branches.

Authorship used only the three approved knowledge manifests and their original `AlQadim.js`, `Albion.js`, and `StarcraftBWAPI.html` sources. No prior test corpus, outputs, assistant runtime internals, browser, or model execution was inspected. No installs, downloads, model changes, production edits, or external research were performed. HTML witnesses represent rendered source text, with whitespace normalized and HTML character references decoded. The Ship Orb witness is the original description string without the manifest's added subject prefix. Chapter record locators cite their authored text records.

Static inspection can confirm source support and structure; it does not establish runtime answerability, live software compatibility, player save state, or gameplay correctness. Boundary turns ask for absent exact timing, current inventory/cabinet/party state, universal current patch compatibility, or the user's installed Java build. Guide statements remain unverified by gameplay. Source file hashes are embedded in the oracle to detect drift.

The oracle is frozen before any runtime evaluation. Do not edit it in response to test outcomes; record observations separately.

## One source-only correction before evaluation

At 2026-10-24T18:47:30.164985Z, the coordinator authorized one pre-evaluation re-freeze. The Remastered map-folder witness copied from the approved manifest had doubled literal backslashes; the original HTML renders single backslashes. Only that witness and the freeze timestamp were corrected. Required useful claims, claim fragments, questions, source locators, and expected decisions were unchanged. The map-folder required fragment is only `maps folder`, so it does not depend on path escaping.

Previous oracle SHA-256: `7fe8f1bf4858dd86ded1e05131820bcd3a8509ccfe910c1fe912500b342ae4c2`

Re-frozen oracle SHA-256: `60c58336240b09371d1fc0fb2546606748087ce14f3290951eb615c498a0c2aa`

This correction followed static source inspection only. No runtime or model evaluation, prior test cases, or prior test outputs were inspected. HTML witnesses use decoded character references and whitespace-normalized rendered text, preserving text adjacency across inline tags.
