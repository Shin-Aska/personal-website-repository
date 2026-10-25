# Passive story-role regression review

The independent `story-passive-cases.json` corpus was frozen before implementation replies were examined. Raw SHA-256: `eec658e8ed853070e6af8f48b5cec224a10a1cff2d09e8cc44fc6f09e2d12428`. It contains 19 independent cases and six conversations with 30 turns: 49 inputs total. The old rollout/prototype corpora, model/head, game data, and production runtime were not edited by this test author.

## Fixed factual basis

These are exact existing records exported by the trusted `load-records.mjs`, not generated answers or new research:

| Source record | Recorded role and people | Source boundary |
| --- | --- | --- |
| `ultima7:story:trinsic-murder-victims:victim` | Victims: **Inamo, Christopher**; context: Hook, Forskis | Direct-only cited external research. |
| `ultima7:story:trinsic-killers:perpetrator` | Perpetrators: **Hook, Forskis**; context: Inamo, Christopher | Direct-only cited external research. |
| `ultima7:story:trinsic-suspect:suspect` | Suspect clue: **man with a hook**, escape vessel Crown Jewel | Direct-only existing guide; a clue is not a confirmed murderer identification. |
| `ultima7:story:blorn-victim:victim` | Victim: **Lap-Lem**, described as the accused gargoyle | Existing guide's accusation/theft story; it does not establish that Lap-Lem was murdered. |
| `albion:narrative:maini-summary:summary` | Objective: **Prevent Herras's assassination**, confront Kontos at the shrine | An objective to prevent a killing is not evidence that a killing occurred or that Kontos was the murderer. |

The two Trinsic role records share the same quoted research passage: Inamo was killed in Christopher's ritual murder, attributed to Hook and Forskis. Therefore merely finding all four names in an answer cannot detect role inversion. The tests additionally require the requested Victim/Perpetrator semantic heading, and explicit correctly populated Killers/Victims lines for “who killed whom”. Negative checks forbid reversed role labels. Role names and people are drawn from indexed metadata; answer text was never used to derive them.

The research record cites the existing reviewed Ultima Codex Inamo revision and Christopher corroboration URLs. No live external request or new outside fact is needed. The guide-only victim questions must decline because those identities are research-backed; the separate guide-only suspect question may return its explicitly qualified clue. A generic victim record in Blorn's Accusations cannot satisfy a murder-specific question. Other named/unknown events, Serpent Isle, negated relationships, false accusations, and reversing Christopher/Inamo into active killers must not reuse the Trinsic facts.

## Actual input contract

Cold questions run after Clear chat while the actual selected UI quest is The Trinsic Murders. Other-context cases use the real Ask the Sage buttons for Infiltrating the Fellowship or Blorn's Accusations. These are deliberate visible UI inputs, not expected entity IDs injected into the model. Warm conversations send their actual text continuously, including victim↔perpetrator changes.

One conversation starts on the unrelated Infiltrating page and sends the user's factual context statement **“I am in the Trinsic murders”**. Its response is logged without inventing a required acknowledgment sentence; the following real passive questions establish whether actual text updated the event context. The test never sets that expected event directly. The Albion comparison uses the real Maini chapter selection and a source-backed summary before asking unsupported casualty questions.

Expected roles, record IDs, source quotations, and labels are used only to check the rendered reply. The model is not called with expected roles, semantic labels, or facts. Clear chat, actual quest selection, and question text are the runtime inputs.

## Browser method

`story-passive-browser.py` uses the actual packaged MiniLM intent worker, transparently observed through the browser's native Worker constructor/postMessage. Only the already approved generative Worker fixture is used; this is not native generative-model evidence. Production UI and the source engine remain real. Its case runner reuses existing accepted helper code without changing it.

Each run owns a static loopback server on port 0, permits only local static GETs without bodies, blocks outside requests and service workers, checks explicit storage mutations and before/after snapshots, records browser errors and actual native intent results, hashes watched source files before/after, and closes only its own server. Screenshots are ignored artifacts under `intent-prototype/results/story-passive/<tag>/`; JSON evidence goes under `evidence/story-passive-browser-<tag>.json`. Existing reports are never overwritten.

## Original-code reproduction

The interpreter owner held an original-code baseline window before editing. A real native-MiniLM/UI run used the exact reported inputs with stable `language.js`, `engine.js`, and `dialogue.js` hashes:

- Cold **“who got murdered?”**: clarification saying it could not find that in the guide.
- Cold **“who got killed”**: the same failed lookup.
- Warm **“who got murdered?”**: failed lookup.
- Then **“who is the murderer?”**: correct Perpetrator answer naming Hook and Forskis with research attribution.
- Then **“who got killed”**: incorrectly routed to an unsupported remedy answer.

Evidence: `evidence/story-passive-browser-baseline.json`; screenshot: ignored `intent-prototype/results/story-passive/baseline.png`. The native worker evidence and source hashes are preserved. No external request, source edit, or saved-game change was used to reproduce the problem. After that run completed, the interpreter owner was explicitly released to implement the semantic fix.

This is a targeted regression set authored after the bug report, not blind organic-user accuracy. Original source facts and frozen oracles must stay unchanged when a runtime case fails. Any independently justified oracle correction must be separately documented with its old hash and source basis.

## Final native-MiniLM/UI result

`python3 guides/tests/assistant/story-passive-browser.py --tag first` passed **49/49** frozen regression inputs: **28/28 supported story-role answers**, **20/20 unsupported/source/event guards**, and **1/1 natural context-statement flow**. The exact reported cold and warm passive forms now return the victim role, while the murderer questions return the perpetrator role. Active/fronted-object and passive-by-agent questions preserve the actor/patient distinction. The full original quotes and research attribution remain visible, with explicit Victims/Killers leads showing which people answer the requested role.

Evidence: `evidence/story-passive-browser-first.json`, raw SHA-256 `1c572409a56cb27694824e949de8c26ac6a720c2e9941d6bf047acc4c31ffb5c`. The corpus hash remained `eec658e8ed853070e6af8f48b5cec224a10a1cff2d09e8cc44fc6f09e2d12428`; no oracle or source-fact correction was needed. Native MiniLM preparation/classification/results occurred on both tested games. No external requests, page errors, or saved-game writes occurred; all intercepted requests were static GETs; watched source hashes were unchanged during the run; and the owned server closed. The original failing baseline remains preserved.

The screenshot `intent-prototype/results/story-passive/first/warm-role-switches.png` was visually reviewed: Inamo/Christopher are labeled as victims, Hook/Forskis as killers, and both replies retain their complete cited research quotation. The roomier Sage layout remains usable. This is targeted source/semantic integration evidence with the explicitly declared generative Worker fixture, not blind language-model accuracy or native generative inference.

## Final unknown-identity barrier repair and replay

A later independent Node contract found a mixed-family boundary outside the original 49 inputs: after a sourced Trinsic answer, an ordinary **unknown identity** request followed by a bare victim request could revive the older event. The interpreter owner repaired the redundant frame clearing that discarded the existing unconfirmed-subject barrier. No model/head, game fact, or original frozen oracle changed. The original first-pass 49 report remains historical evidence for its tested version.

After the repair, the **same unchanged 49** inputs passed again via `--tag story-passive-final`. Report: `evidence/story-passive-browser-story-passive-final.json`, SHA-256 `003e1ee768400346e340d528c1258ba2d138726dbddfcdfb58aec323ad496316`. The original corpus SHA remains `eec658e8ed853070e6af8f48b5cec224a10a1cff2d09e8cc44fc6f09e2d12428`. All native-inference, source stability, network, storage and server boundaries passed.

A separate supplemental corpus, `story-passive-unknown-identity-cases.json` (SHA-256 `52fb30c5a1bec954a291da57eac305c29468f0b14adcf7e49a7f973d2f51f2be`), freezes eight inputs without editing or enlarging the original 49. It warms the Trinsic event, asks “Who is Zaxivar Unrecorded?”, then a bare passive victim question. Both unknown/unconfirmed stages must return no factual answer, no citation, and none of the old victim/perpetrator names. The actual user text “I am in the Trinsic murders” then restores the event. A second unknown-identity/noun-victim pair verifies the barrier again, followed by an explicitly named Trinsic question that restores the known event. There is no expected event/label injected into runtime. The supporting victim quotation and role names are copied unchanged from the original indexed source witness.

`python3 guides/tests/assistant/story-passive-unknown-identity-browser.py --tag final` passed **8/8** supplementary checks with actual native MiniLM and the same explicit generative Worker fixture. Report: `evidence/story-passive-unknown-identity-final.json`, SHA-256 `4b5f0e2ca08bf02a1a20040b7de2c068b6bf95a46b92d41d942f618d922d731f`. Both recovery paths worked; all four unknown/bare stages had no sourced facts or citations. All privacy, storage, stable-source, and owned-server-close checks passed. Report this as **49 original checks plus 8 separate supplemental checks**, not a silently revised original corpus.
