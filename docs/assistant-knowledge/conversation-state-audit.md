# Conversation state and routing audit — 25 October 2026

This is a read-only audit of observed development conversations, not a held-out result or a production change. The five sampled conversations cover Ultima VI, Ultima VII, Albion and StarCraft: 20 turns, 15 supported positive requests and five source/state boundaries. The saved native-16/fresh-04 UI reports contain displayed replies but no internal packet. An ignored exact-vector replay records packets, knowledge traces and before/after inspection for every sampled turn. Its final run has **zero missing inputs** and reproduces the displayed failure behavior. No progress, source, manifest, oracle or production JavaScript was edited. No install, download, public service or port 8769 was used.

The audit does **not** establish that a unified conversation state alone fixes the failures. It finds three state owners, a lossy interface between them, and independent relation/eligibility failures even when the router has the correct subject. Of the ten supported requests missed in this sample, three primarily concern referents, five concern request/relation/candidate eligibility, and two concern exact lexical assertion matching. No sampled miss is caused primarily by inherited source/edition/material constraints. Seven misses end in engine fallback or a clarification that supersedes its reply; one is stopped by `blockReplay`; two return the wrong neighboring reviewed fact directly.

## Evidence and reproduction

Saved observations:

- `guides/tests/assistant/evidence/knowledge-blind-browser-native-16.json`: `ultima6-blind-book-translation`, `ultima7-blind-tests-and-limits`.
- `guides/tests/assistant/evidence/knowledge-blind-browser-fresh-20261025-04.json`: `u7-observatory-crystal`, `ab-linked-companions`, `sc-client-first-launch`.
- `guides/tests/assistant/intent-prototype/results/knowledge-corpus-replay-source-index-20261025-04/report.json`: 750/851 fixed checks; 175/175 expected boundary non-answers, with zero affirmative answers on those boundary turns. This saved baseline predates the limited conditional item-property change and is not rerun evidence for proposed changes.

Current-code diagnostic artifacts, all ignored, are in `guides/tests/assistant/intent-prototype/results/state-audit-20261025/`:

- `replay.mjs`, `replay.json`, `summary.json`: full production conversation wrapper with packaged `predictIntentHead`, profile thresholds, exact raw/context-expanded MiniLM vectors, source engine with no generative fallback, knowledge trace and before/after state.
- `encode-missing.py`, `vectors.json`, `encoder-evidence.json`: existing pinned local MiniLM/Chrome assets; isolated ephemeral loopback server; external requests blocked; worker and server closed. The evidence confirms actual model inference and remote models disabled. No shared query cache was modified.
- `counterfactual.mjs`, `counterfactual.json`: isolated in-memory module variants. They alter one gate or one state value at a time, never the checked-in module. These are diagnostic interventions, **not eligible production fixes**.

The first incomplete diagnostic used absent vectors and was explicitly marked incomplete. Its replies are not the basis of these findings. Native encoding supplied the exact missing raw questions, then the exact `Subject: Mariah` expansion; final `replay.json` has no missing vectors. Counterfactual focus changes additionally required their own exact native `Subject: Test of Love` and `Subject: Brion` vectors. No raw vector substituted for an expanded vector.

There is source evolution between the saved UI report and current code: the current 674-fact index now includes `brion-orrery-reward` from `DB.sideQuests[10].reward`. Brion's observed failure persists with that focused fact present. Its former ingestion gap therefore does not explain the current miss. The audit preserves this distinction.

## What the three state owners actually do

`createConversationAssistant.answerAsync` first calls the interpreter, then decomposed source questions if applicable, then the knowledge router, consultation, replay guards, and finally the source engine. A knowledge answer precedes the engine even when the interpreter says `clarify`, so a low model score or ambiguity is not automatically the immediate cause of a missed answer.

The interpreter owns one `subject`, a `frame` with material/number/source/edition/negative restrictions, and a pending subject choice. Its `focusSubject` always clears its old state and then requires an authorized source record with the supplied entity ID. The knowledge router owns `focus`, `lastFact`, `lastFacet`, `invalidated`, a typed `salient` map and only source/edition carry in `restriction`. The engine owns its own entity/frame/action/pending slots.

After a knowledge/consultation answer, `clearSourceSlots` switches the engine to `dialogue-boundary:<game>` and back. `engine.activate` clears topic state on each switch. Thus engine subject slots intentionally do not receive knowledge turns. This is safe against stale actions, but means original-text fallback cannot rely on the source engine having consumed those turns. The wrapper attempts interpreter grounding; it does not seed an equivalent complete engine frame.

The handoff itself can fail silently. After the Gargish Book answer, knowledge focus is `ultima6:knowledge:gargish-book`, a reviewed graph entity with no source record of that identity. `focusSubject` cannot establish it and the interpreter subject remains null. The same occurs for the special crystal. On the next tablet question the router still has a salient person (canonical Mariah atlas ID), so the failure is not simply that every subsystem forgot Mariah.

Conversely, after Test of Love, both interpreter and knowledge focus correctly name `ultima7:quest:test-of-love`; the engine has zero subject slots. The next request still fails because the router's own typed resolution becomes ambiguous and the interpreter does not recognize that kind of demonstrative follow-up. More state copying would not repair this resolver.

`groundEngineReply` can seed the interpreter from one source entity or explicit `conversationContext`, but only after fallback answers; `knowledgeRouter.observe` does not generally import that full context. Non-answer observation resets knowledge state on ambiguity, replay blocks or a WH question. No subsystem exposes a complete, provenance-qualified shared referent snapshot. There is no proof here of an actual source-only restriction leak; the contract nevertheless has to preserve it.

## Five conversations and immediate causes

| Conversation / request | Actual packet/trace | Immediate cause |
| --- | --- | --- |
| U6: “What does she tell me about the tablet?” | Interpreter `identity`, `subject-missing`; router resolves canonical Mariah, requests `reference`; initial pool includes `mariah-book`, `mariah-tablet`, `silver-tablet-other-half`, but only `mariah-book` survives to scoring. | Candidate ownership gate: `explicitTargetEvidence` sees Mariah's explicit binding on the book fact, then excludes incident facts without that binding. The correct tablet fact is indexed, but attached to the tablet and lacks a Mariah answer binding. The router answers the previous BOOK instruction despite missing `tablet`. |
| U6: “And where do the gypsies send me?” | Router correctly selects gypsies; graph returns `relation: location`, `mariah-tablet`, Trinsic, before the request facet runs. | Independent graph question parser interprets nearly every `where` as location. Its location answer preempts the main router's existing destination recognition. Correct outgoing `directs-to`/`zoltan-homer` evidence is present. |
| U7: “What reward do I get for that test?” | Both owners had Test of Love before the turn. Packet `stats`, `subject-missing`; router resolves no subject, requests `outcome` correctly, all candidates fail unanchored material matching. | Typed reference ambiguity: `typedReference` considers focus plus incident links. The last fact is evidence of both the Test of Love and the broader “Erethian tests” topic, so “that test” matches more than one recent entity. It does not prefer the explicit current test. This is not a missing outcome capability. |
| U7: “Which dragon has the Ether Gem in the Courage test?” | Interpreter `combat`, `ambiguous-subject`; router selects generic dragons, uses `combat`; candidate scores empty. | WH answer type, requested possession relation and contextual test are conflated. A creature name turns into a combat request; an unproved generic dragon anchor cannot retrieve the exact dragon/Ether Gem relation. No broad state reset fixes that field selection. |
| U7: “What does the guide list as the reward for helping him?” | Previous crystal response leaves knowledge focus crystal and interpreter null. Router resolves no person; requested facet is correctly `outcome`; focused reward is present but rejected with `helping` material mismatch when unanchored. | Missing role-specific referent: crystal evidence mentions both seller Addom and recipient Brion, so `reply()` declines to store one salient person. It has no separate seller/recipient/quest-owner slots. Person seeding alone still fails because `helping` is treated as a restrictive source term. |
| Albion: “What happens to Sira if Melthas leaves?” | Interpreter sees two entities and emits `ambiguous-subject`; knowledge trace empty. | Blanket hypothetical policy: the knowledge router rejects `if` before checking the directly recorded `leaves-with` rule. This is a static party rule question; no current party claim is needed. The current conditional-item-property exception does not cover it. |
| Albion: “Why would I bring her into a difficult fight?” | Prior Sira/Melthas ambiguity made the interpreter frame unconfirmed. Packet `blockReplay`; router cannot resolve a person. | Cascading referent failure. Keeping an arbitrary older subject here would violate unknown/ambiguous-name invalidation. The preceding relation must establish Sira as subject first. |
| Albion: “How does Melthas help against demons?” | Correct explicit Melthas subject; main router selects `method`, capabilities `[method]`; only training/recruitment candidates survive and both fail demon constraints. | Request capability error: the answer-bearing Demon Exodus combat fact is eliminated before scoring. The source is present; no subject carry is required. |
| SC: separate Brood War copy | Correct SCHNAIL subject and prerequisites facet. `schnail-own-game` scores 86.7 with no scope mismatch, but `missing: [copy]` yields no ranked candidate. | Strict assertion word matching treats a paraphrase word as required literal source text, although the fact explicitly states that SCHNAIL includes its own installation and no separate install is needed. |
| SC: internet after login | Router correctly selects SCHNAIL and considers network proof; best network candidate fails `missing: [still, going, over]`, with no scope mismatch. Interpreter separately sees SCHNAIL/account candidates. | Same assertion gate rejects the supported network proposition. Wrapper then returns subject ambiguity after fallback, even though the main router already had SCHNAIL. Aliased subject ambiguity alone is not the root blocker. |

The five boundary turns remain non-answers: unverified original-manual quotation, unsupported exact 60-vs-30 release, crystal exhaustion duration, a specified 2026 console remaster and a local antivirus quarantine fact. These are a small observed subset, not exhaustive guard validation.

## One-variable counterfactuals

The counterfactuals reuse the actual saved packets and exact native vectors and replay the same preceding knowledge turns. They expose causal gates without modifying production or asserting generalization:

| Changed variable | Result | Interpretation |
| --- | --- | --- |
| Disable graph answer preemption, leaving facet/eligibility/scoring unchanged | Gypsies returns `zoltan-homer`: TABLET, Homer, Buccaneer's Den. | Wrong independent graph relation is sufficient to explain that miss. The actual fix should unify the relation interpretation, not disable graph lookup globally. |
| Prefer current focus among typed-reference candidates | Test reward returns `test-love-definition` including Talisman of Love. | A narrow referent priority repairs this observed turn. It still needs unknown-name, actual subject-switch, conflicting typed-reference and restriction contracts before promotion. |
| Remove the `explicitTargetEvidence` ownership suppression | Tablet question returns only `silver-tablet-other-half` (“Mariah: say BOOK → needs other half”). | Candidate ownership matters, but removing the gate does **not** satisfy the full claim about half the silver tablet and Trinsic gypsies. That gate cannot simply be deleted; answer completeness and actor bindings still matter. |
| Seed Brion as the one person before reward question | Still no knowledge answer. | Resolving the pronoun alone is insufficient; material matching remains a second blocker. Do not claim a shared frame fixes the entire Brion case. |
| Relax the exact assertion word gate | Network question returns the exact `schnail-network` source paragraph. | This identifies the gate; it is not an acceptable fix. A broad relaxation would let unproved assertions through and must not be promoted. |

No counterfactual is advertised as retaining the 175 fixed negative contracts. Broad ownership or assertion relaxations deliberately lack that evidence and are rejected as production proposals.

## Smallest useful shared change

First remove duplicate relation interpretation at the graph boundary: derive a typed source request once and pass its relation to graph lookup. Graph lookup should accept an explicit relation/answer-role, and decline a relation it does not implement. A `destination` request must not silently become `location`; a possession question whose answer is a creature must not become `combat`. This preserves directed authored links, evidence completeness, eligibility and full source rendering. It addresses an observed wrong affirmative answer before attempting wider conversation behavior.

In a bounded prototype, establish a shared **reference and source-request frame**, not a general answer generator. The frame should carry:

```text
ReferenceFrame {
  gameId, contextId, revision, invalidated,
  topic: { entityId, evidenceFactIds, sourceRecordIds } | null,
  roles: { actor, item, recipient, provider, place, objective },
  pending: { candidateEntityIds, originalRequest, restrictions } | null,
  restrictions: { guideOnly, editions, material, quantities, negation },
  request: { relation, answerRole, conditions, stateMode, originalText }
}
resolveReference(text, previousFrame, visibleIndex) -> grounded | ambiguous | unknown
readSourceRequest(text, grounded, restrictions) -> typedRequest | abstain
lookupGraph(typedRequest, eligibleEvidence) -> proof | null
commitFrame(previousFrame, typedRequest, proof, turnRevision) -> nextFrame
```

Use source-established roles, not a unique person found anywhere in a paragraph: a `deliver-to` edge can establish recipient Brion while a `buy-for-20-gold` edge establishes provider Addom. A graph entity need not have a source-record identity, but every committed referent must retain authorized fact/edge witnesses. Do not manufacture a record to make `focusSubject` accept it. Typed demonstratives should prefer a compatible explicitly current topic before broad incident contexts; unrelated new proper names invalidate it.

The frame's conditions describe static rules separately from verified player state. A direct declared `leaves-with` condition can be answered as a rule, with the full source wording; it must never establish that a companion has left. The existing finite conditional item-property behavior stays intact. No general bypass of hypothetical/progress guards is justified.

The typed request must separate content restrictions from ordinary predicate wording. “Still going over the internet” cannot be fixed by deleting arbitrary missing words; source proof must establish the requested network requirement and temporal login condition. Unknown named actors, Mars, editions, numbers, negation and local-current-state claims remain material guards. If the prototype cannot prove this distinction, it must abstain and report the blocked field.

Pass the same frame to source fallback as an explicit read-only lookup context, or require a lossless canonical request. Do not let an empty engine context silently guess at pronouns. Continue clearing executable pending/action slots, and do not import game progress or write progress claims. Commit only the final current turn; cancellation, context switches and failed compound questions roll back staged reference changes.

## Required evaluation before any integration

The audit does not authorize a production edit. A prototype should replay all six games with the packaged classifier and exact native vectors; missing exact inputs must stop/mark the affected dialogue incomplete. Preserve every existing case and source oracle. Report the five sampled conversations separately as observed development cases, then collect fresh independent conversations before generalization claims.

Retain all 175 fixed non-answer contracts and every action/progress/state guard, plus explicit paired checks for unknown-name invalidation, subject switches, two ambiguous actors, guide-only→pronoun carry, unsupported edition/material/number→pronoun carry, source-only restriction after fallback, unsupported conditional player progression, context switch, cancellation and compound rollback. A role-binding change must not assign a seller's facts to a recipient. The renderer must prove every requested clause and use the appropriate source scope, not just emit one relevant citation.
