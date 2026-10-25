# Reusable source-request context frame — 25 October 2026

This is a focused design review of the current parser/router boundary. It proposes a small shared request-frame helper; the only written artifact is this report. It does not change production code, tests, data, models, or runtime behavior. No installs, downloads, training, promotions, commits, FTP, browser/model runs, or synthetic semantic-vector tests were performed. Six parser-only probes ran with the existing bundled Node at `/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`, using `--input-type=module` and the checked-in `parse`/`sourceQuestionParts` exports. PATH had no Node executable; no installation was needed.

## Recommendation

Add one pure `sourceRequestFrame(text, options)` helper beside `splitParts` in `language.js`. Use its question/context partition in both `sourceQuestionParts` and `knowledge.plan`, including the single-question path. Keep the original scope separate from the bounded question text. Classify a leading request topic as context rather than a second requested answer; resolve entities and prove answers only in the knowledge router.

The change must preserve the existing report, hypothetical-progress, stale-reference, source, edition, material, quantity, and unknown-name boundaries. A topical preamble can supply a subject candidate; it cannot supply a fact, establish progress, or authorize an action. This is a boundary repair, not a claim that all four observed examples are solved by parsing alone.

## Current seams

* `language.js:562` (`splitParts`) retains a sentence before a question, except tightly defined newcomer/discourse forms. `makePart` gives such a sentence an ordinary detected intent even when it is only a request topic.
* `language.js:656` (`sourceQuestionParts`) rejects all `parsed.hypothetical` turns and any intent-bearing preamble not starting with one of its context prepositions. The observed “I want the Grapple” preamble detects acquisition intent and blocks compound decomposition; “I'm searching the wrecked ship…” has no detected intent and already passes this boundary. The function separately scans uncapped parts to preserve the three-question limit.
* `knowledge.js:568` (`plan`) independently extracts question cores. It chooses a primary question only when exactly one remains. With two question cores plus a preamble it uses the entire message as the query and can reach the one-part guard. With one question it can lose the subject from the query and must recover it through another context-selection block.
* `knowledge.js:591` checks capitalized unknown names against `packet.scopeText || text` only on one extraction branch. It therefore depends on incidental extraction shape and capitalization. The later primary-text check is another separate boundary. Do not remove either guard as a shortcut.
* `knowledge.js:634` chooses context entities independently of explicit question entities, while `knowledge.js:653` redoes local pronoun resolution. Explicit named questions and preamble topics have no common representation of their different roles.
* `dialogue.js:359–368` detects multiple visible entities across the whole message as an ambiguous subject, even when one occurs in a topical preamble and the other is explicitly the subject of a question.
* `dialogue.js:689` calls compound planning only for multiple decomposed questions. A single question with a natural preamble does not get the same boundary handling. Its compound `sourceQuestions` implementation already has useful checkpoint/rollback, whole-turn source/edition guards, and evidence/completeness checks; retain those.
* `knowledge.js:753` applies `scopeConstraints` to the whole current text after primary-question extraction. This protects scope but can also mistake topic scaffolding or a different requested relation for a required fact predicate. A new frame must distinguish those roles without losing their words.

These are static control-flow observations and parser-only probes, not instrumented end-to-end root-cause traces.

### Actual parser-only probe results

| Input | Current `sourceQuestionParts` output |
| --- | --- |
| Kenget Kamulos planning preamble + party/access question | Context retained; one question; question intent `prerequisites`; no report/hypothetical flag. |
| Grapple want preamble + two Lord Michael questions | `null`; preamble intent is `acquisition`. |
| Wrecked ship / Ship Orb search preamble + which part | Context retained; one question; question intent `explanation`; no report/hypothetical flag. |
| Different setup point + first launch why question | Context retained; one question; preamble intent `use`, question intent `null`, pronoun true. |
| “I got the Grapple. Where can I find Lord Michael during the day?” | `null`; the first part retains `report: true`. |
| “Once I have the Grapple, what is it used for?” | `null`; whole parse retains `hypothetical: true`. |

For three of the four observed failures the context is already preserved by the decomposition helper; the missing single-question consumer and later source/predicate/reference selection are the more immediate boundaries. Replacing the helper alone cannot fix them.

## Minimal API

The helper owns segmentation and syntactic roles, not knowledge entities or answer eligibility:

```js
sourceRequestFrame(text, { editions = [], names = [] } = {}) => ({
  scopeText: String(text),       // exact visitor text; never reconstructed
  parsed,                       // current parse output and all current flags
  context: [                    // leading spans only
    { text, core, role: 'topic' | 'edition' | 'other', topicText }
  ],
  questions: [ { text, core, part, index } ],
  questionCount,                 // count before MAX_PARTS truncation
  tooMany,
  complete,                     // every non-discourse clause accounted for
  reason                        // e.g. unclassified-clause, no-question
})
```

`topicText` is optional and is the retained object of a bounded topic wrapper, not an entity ID. Examples of reusable grammar are “I want X”, “I'm planning X”, and “I'm searching X”. Their complements remain verbatim: “X without Y”, unknown names, numbers and qualifiers cannot be removed. The helper must not interpret every first-person sentence as a topic. Reports, conditions, uncertainty, quotation, a second requested task, or unclassified trailing prose stay outside this limited topic class. All such clauses remain present in `context`/`parsed`; `complete` is false when their request role cannot be safely accounted for.

Use the existing uncapped `splitParts(parsed.q, editions, names)` scan so the helper does not lose fourth and later questions. Preserve `parsed.raw` and `scopeText`; a future span-offset implementation can be added if needed, but is not required for this first change. The helper may retain normalized clause text as today; it must not claim those normalized strings are lossless original slices.

Do not return `eligible: true` from this syntactic helper. Whether a report/condition permits a particular source answer remains the current router guard/recorded-rule decision. `sourceQuestionParts` can initially adapt this frame back to its current return shape and retain its current report/hypothetical rejection; existing router exceptions keep their present bounds. A subsequent explicitly tested change can reuse a classified condition without globally admitting hypothetical progress.

## Consumption and binding

1. Build the frame once from the original authorized request. Pass it to router planning through an internal packet field; the public text remains available for diagnostics/presentation. Constructing the frame must not mutate interpreter/router state.
2. Derive per-question lookup text from the question core, with separate topical candidate text. Do not concatenate all sibling questions into each lookup. Use the same representation for one question and multiple questions.
3. Resolve an explicit question subject first. A named Lord Michael question cannot become a Grapple acquisition question merely because the preamble wants the Grapple. Preamble entities may remain query objects/context when supported by source links, but their presence alone is not subject ambiguity.
4. For an unnamed question, use a unique declared topic covering nested names, preserving current covering-name behavior. If multiple unrelated candidates remain, clarify. Never pick the longest of unrelated names.
5. For a later within-turn pronoun, prefer the preceding question's uniquely source-grounded subject of the appropriate kind, then a compatible unique local topic, then a valid confirmed prior-turn subject. Do not update global focus before the whole compound answer succeeds. A preceding question that fails grounding cannot become an antecedent.
6. Preserve explicit topic changes and invalidation: an unknown new topic, incompatible named topic, pending ambiguity, stale packet or switched guide cannot fall back to an older subject. “A different setup point” alone does not name a different entity; whether “its” can bind still depends on the existing confirmed subject and restrictions.
7. Keep all action/progress effects empty. Carrying a desired trip, item, or search target into a lookup does not mean the player has reached it, obtained it, or completed it.

The smallest implementation need not replace the entire interpreter state machine. Its packet-level multiple-hit ambiguity can remain conservative for general actions while source planning uses the syntactically separated request. If source planning fails, do not replay the reduced question as an unrestricted fallback.

## Scope contract

Retaining `scopeText` is necessary but insufficient: the router must actually consume it for every branch. Use separate inputs for `query`, `topic`, and `constraints`, with the original scope available for validation. Reusing only `scopeText` as a bag of fact terms would reintroduce the preamble problem.

* Source and edition instructions bind the whole turn, including a closing guide-only instruction. They cannot be weakened by question extraction.
* Keep negation, numeric restrictions, source-kind requirements, locations, time, materials and unknown candidate names from all applicable context. Only the exact recognized topic wrapper is non-factual scaffolding; its object/complement is retained. Do not broaden global `SCAFFOLD` to erase words such as “first”, “during the day”, “wrecked”, “inside”, or “without”.
* Keep constraints on an individual question attached to it. A sibling question's requested predicate is not automatically a condition on every answer. Preserve global directives once; if a qualifier's scope cannot be determined, clarify rather than drop it.
* Check unknown named candidates across the original topical and question scope, not only the selected question core. Current capitalized-token heuristics are conservative but incomplete, especially for lowercased unknown multiword names. This helper must not silently claim that weakness is fixed; add an explicit rejection test before relying on changed unknown-name detection.
* Preserve `progress`/`hypothetical` flags. The existing recorded-condition and conditional-item-property paths remain the only currently authorized exceptions. An answer about a recorded static rule has no player-state effect.
* Keep inherited restrictions when resolving a bare pronoun. A new relation can replace a prior requested predicate only under the existing carry policy; it cannot erase unsupported editions, quantities, materials, negative conditions or source restrictions.
* Validate evidence for every requested clause and retain compound rollback on any missing/unsupported part, cancellation or context change. Roll back temporary reference/facet changes as well as selected facts. Do not return a partial combined answer as full success.

## Paired acceptance and rejection cases

These are proposed tests, not executed results. Each accepted case requires real declared facts and locators, complete requested claims and empty `actions`/`stateChanges`. Use the existing offline fixtures and exact data; do not fabricate semantic vectors.

| Accept or classify positively | Paired rejection / invariant |
| --- | --- |
| “I'm planning the Kenget Kamulos trip. Who has to be in the party for me to get inside?” has one topical preamble and one requirements question; topic candidate survives. | Substitute an unknown new destination, including a lowercased form: no use of previous Kenget Kamulos focus; no claimed access/progress. “I already entered Kenget Kamulos…” remains a report, not verified state. |
| “I want the Grapple. Where can I find Lord Michael during the day, and where does he retire?” has two questions; explicit Lord Michael governs the first, and the second can bind to him only after source grounding. | Replace the second actor with an unknown name, demand an unsupported hour, or request an unsupported edition: no combined success and no retained intermediate focus. Two unrelated possible male antecedents must clarify. |
| “I'm searching the wrecked ship for the Ship Orb. Which part should I search?” preserves the ship/search-target scope and resolves a unique grounded subject. | “...the wrecked ship on Mars...” cannot answer from the ordinary ship location. “...for the Ship Orb and another unrelated orb...” cannot silently choose one. “I've already found the Ship Orb...” remains reported progress. |
| After a confirmed setup topic: “On a different setup point, why might its very first launch take a while?” preserves “first launch” and requests the documented cause. | With stale/ambiguous focus or an unknown named replacement, clarify. A source that merely says launch is slow cannot establish why; no invented cause or timing. |
| “For X in edition E, where is it?” and a closing “Use the guide only.” preserve whole-turn directives. | Unsupported E, a manual-only requirement lacking manual proof, or guide-only facts available only in outside research must decline. |
| A real source-backed compound includes two different requested facets. | Four questions must trigger the existing limit; an unclassified trailing task must not be silently skipped. A missing second proof cancels the first staged answer/reference change. |
| An already supported finite item-property or recorded static conditional rule continues through its existing router exception. | “If I have completed X, what should I do next?” and “Have I already completed X?” retain hypothetical/current-save guards and produce no verified progress. |
| “For X without Y, what are its requirements?” keeps the negative condition. | The positive requirement proof for X alone is insufficient; no conversion into “What are X's requirements?” |
| A scope with a supported count/material preserves it per question or explicit global directive. | Change the number/material to an unsupported one, then follow with “Where is it?”; inherited scope must remain blocking. |

Add parser-level assertions for partition, exact `scopeText`, uncapped question count and guard preservation; add router/dialogue assertions for subject selection, evidence completeness and rollback. Parser snapshots alone do not prove safe source answers. Keep existing source-first fixed non-answer cases and current-save tests.

## Implementation size and limits

A first patch can be confined to a shared frame helper, replacing the two competing question scans, routing the one-question preamble case through the same frame, and consuming a safe per-question topical binding. Keep guard changes out of that patch except where existing behavior is demonstrably identical. This removes duplicated extraction logic without requiring a model, embeddings, per-example aliases, or new factual data.

The frame does not supply missing focused facts, recognize every paraphrase of a relationship, prove a cause, or solve arbitrary English. The Ship Orb example may additionally need source-compatible relation selection; the launch question may additionally need a first-launch causal facet and inherited-reference repair. Validate those independently instead of attributing all improvement to the helper. If the bounded classifier cannot account for a clause or qualifier, leave the full request intact and return the existing safe clarification/decline path.

## Review of the proposed implementation checkpoint

The follow-up review inspected the new shared `sourceFrame`, single-context consumer, `contextTerms` check, unresolved-context-reference check, required-companion grammar and location-versus-storage graph guard. It used only static inspection and existing offline fixture contracts, with an empty classifier and an encoder that throws. The six checked-in context tests are useful, but two additional paired contracts exposed material scope gaps in the reviewed implementation:

1. **Context modifier erasure.** Fresh Ultima V assistants answered `michael-location` for each of “I want the working Grapple. Where is Lord Michael?”, “I want the setup Grapple. Where is Lord Michael?”, “I want the different Grapple. Where is Lord Michael?”, and “I want the trip Grapple. Where is Lord Michael?”. The paired “I want the different radioactive Grapple…” declined. The new `framing` set removes these words everywhere in the preamble, including in the requested object's complement. Strip only a recognized wrapper span, keeping the complement intact. If “on a different setup point” is accepted as discourse framing, recognize that bounded phrase in its own position instead of making its constituent words globally ignorable.
2. **Inherited material/quantity loss through contextual pronouns.** “Where is Lord Michael on mars?” declined, but the immediate follow-up “On a different setup point, where is he?” answered `michael-location`. The same follow-up answered after “Where is Lord Michael at exactly 13:00?” declined. The follow-up packet had `transition: subject-missing`, material `[different]`, and no inherited Mars/13/00 constraints. The unsupported-edition pair using `patch 9.99` continued to decline. Router focus can therefore recover the person while the new single-context path loses the interpreter's full prior scope. Merging only existing packet material/quantities in `sourceQuestions` is insufficient for this observed path because the packet has already lost them. Require the full prior restriction frame for contextual pronoun carry, or retain a safe non-answer when that frame is unavailable. Do not weaken edition carry while repairing it.

These outcomes do not assert that a working or different Grapple exists; that is precisely the unsupported modifier whose removal makes the positive answer too permissive under the intended context contract. Add both rejection pairs before claiming lower-case modifier/inherited-scope coverage.

The report/hypothetical guards remain before decomposition and remain checked in `knowledge.plan`; the reviewed change does not authorize a verified progress write. The existing checkpoint is registered on the active turn, and cancellation/context switching invokes `cancelTurn` and its rollback before aborting. No new cancellation defect was established by static inspection. A deferred second-encode compound cancellation contract should remain in the full checkpoint because a successful first subanswer temporarily changes router references before the second completes.

The graph storage exclusion avoids treating “Where do I hide/keep/store…” as an ordinary location lookup, while the existing passage scope and evidence guards still decide whether a method answer is sourced. The single-context path is now terminal on a failed source question, so consultation regressions should be assessed with a real advice request as well as a factual method request: do not broaden factual decomposition into advice eligibility merely to make the latter pass. No confirmed new factual-method/consultation regression was established in this focused review.

### Re-review after the two scope repairs

The root implementation replaced the global framing-word filter with syntactic wrapper stripping and preserved unresolved material/quantity scope on implicit references. Re-running `source-context-frame.test.mjs` with the existing Node passed all seven tests. Additional offline contracts confirmed:

* All four previously accepted unsupported modifiers (`working`, `setup`, `different`, `trip` before Grapple) now decline.
* After each Mars and exact-13:00 seed declines, all three follow-ups decline: “On a different setup point, where is he?”, “Where is he with the Grapple?”, and “On a different setup point, where is he with the Grapple?”. A fresh named “Where is Lord Michael?” then answers `michael-location` in every one of those material/quantity cases. A new named object therefore does not erase the pronominal subject's unresolved scope.
* Unsupported patch 9.99 remains blocking for the same three follow-ups.
* “I have the Grapple. Where is Lord Michael?” and the hypothetical completed-quest request clarify; “Have I already obtained the Grapple?” declines. Every probed reply, including successful named recovery, has empty `actions` and `stateChanges`, and the source engine's `claimCount` remains zero.

One conservative UX limit remained at this checkpoint: patch-9.99 seed → “Where is he with the Grapple?” → a fresh named “Where is Lord Michael?” still declined with `editions: ['9.99']`, unlike the material/quantity recovery pairs. The root clarified that this preserves the existing policy: edition is session/game scope, while these unresolved material/numeric qualifiers belong to the request. Naming another actor alone need not clear edition; an explicit new topic/reset clears it. This is not an unsupported-answer defect or a proposed blocker. A broad ad hoc probe initially asserted recovery for editions too and stopped at this policy difference; the remaining modifier/report/hypothetical contracts were then run separately and passed. No production files were edited in this review.
