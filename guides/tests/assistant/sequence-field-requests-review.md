# Literal sequence field review

The new helper reads finite question descriptors and returns boolean source
proof. It never writes dialogue state or generates prose. The caller must first
select an eligible complete fact, authorize its source/edition and canonical
owner, enforce every original-question restriction, and supply only that fact's
reviewed scope labels and owner's names. Success permits rendering that complete
fact; it does not establish current player progress or completion.

`parseSequenceFieldRequest(text)` preserves the complete scope, unit, action,
purpose, completion object, unknown suffix and unchanged original question.
`supportsSequenceFieldRequest(request, { fact, subjectEntityId, scopeTexts,
grounded })` requires `text === witness`, exact canonical ownership and explicit
roles. Scope references need source-grounded conversational focus. Explicit
scope labels match wholly, allowing only a leading article difference.

An action quantity must occur beside that action as `for NUMBER UNIT` inside a
consecutively numbered literal procedure. Its following destination must occupy
the immediately following step with the requested literal purpose. Counts in
step headings, other actions, other units, disconnected destinations, ranges,
reported/negative/uncertain instructions and partial two-field proof fail.
Completion rewards require a complete affirmative `Completing OBJECT grants /
unlocks / gives / yields REWARD` assertion and exact whole object, including the
count. Labels and aliases cannot supply these source relations.

The actual Ultima V shrine witness at `guides/Ultima5.html`, `section#shrines`,
explicitly gives the four-step mantra / meditation / Codex / return procedure,
including three cycles and the Codex on the Isle of the Avatar for guidance.
Its separate closing sentence explicitly grants VERAMOCOR after completing all
eight shrine quests. Both facts already have the necessary reviewed roles.

The sole manifest edit adds `Shrine ritual` to `shrine-loop.topicLabels` as a
descriptive editorial retrieval aid for that existing procedure. It is not a
literal quote or entity alias. No source context is added: this page witness
does not have a structural parent locator supporting one. Protected fact fields
are pinned by a pre-edit SHA-256 digest, and every encoded knowledge document
must still match the existing frozen embedding catalog. No model, asset, setup,
profile, training, embedding, frozen conversation oracle or game source changes
are part of this work.

Integration: recognize the complete question before generic compound splitting.
Only candidate facts already passing the normal source/edition/state guards may
be tested. Resolve the scope to one canonical fact owner with normal reviewed
metadata; pass that fact's topic labels and canonical names as `scopeTexts`.
Require every field from one fact, then render that fact whole. Completion
requests can search eligible outcome facts for their exact literal completion
object; a true result still needs normal source authorization and canonical
fact ownership. Never add the parser's scope text to the approved labels merely
because it parsed, and never use parser acceptance as player-state evidence.
