# Reviewed source-field arguments

`sourceFields.arguments` is an optional array of separate groups:

```json
{
  "linkId": "gwenno-stones",
  "bindings": [
    {"role": "agent", "entityId": "existing-canonical-id", "mention": "Gwenno"},
    {"role": "content", "entityId": "existing-song-id", "mention": "STONES"}
  ]
}
```

Roles are finite: `agent`, `object`, `input`, `output`, `content`, `recipient`, `instrument`, and `destination`. Each mention must be an exact span in both its field witness and complete fact. Entity IDs must already exist and are canonicalized through the compiler's existing callback. Literal values can omit an entity ID. No entity, alias, field owner or graph edge is generated.

Linked groups require a reviewed direct link whose evidence includes this fact. Its finite predicate mapping validates roles against the actual from/to endpoints, including inverse `taught_by`, purchase `buy-for-20-gold`, and `escorted_to` directions. The compiled group retains `linkId`, `from`, `to`, `relation`, `evidenceFactIds`, and `bindings`. Groups remain separate: Arbeth/thread and Charlotte/cloth cannot be merged into arbitrary maker/product pairs.

A nonliteral interpretation such as “tune” referring to STONES additionally requires all link evidence facts to have complete authorized original witnesses within one shared explicit source context. Its compiled group returns every `requiredFactIds` and the matching `sourceContextIds`. The consumer must append all required whole proofs after its ordinary eligibility, source, phase and qualifier checks. A literal named participant cannot be rebound to another canonical entity. The context supplies retrieval scope; it does not create a participant role.

Ultima V metadata annotates nine existing facts with 25 argument fields and 27 groups. Ultima VI annotates ten existing facts with 41 argument fields and 60 groups. The new Twin Lenses context is the actual original section parent. The red-lens repair field requires both the delivery fact and explicit Lor-wis-lem repair-keyword fact; withholding either proof or the context withholds the repair role. The Sceptre method gains `open` only because its full original witness explicitly unlocks the center door with a Skull Key. Lens placement retains the complete left/right flame-to-Codex phrases in two separate object/destination groups.

Panpipes remains Julia's crafted output. The source's music procedure does not explicitly label Panpipes an instrument, so this pass does not supply that additional type. Malifora's teacher role remains separate from Malik's lead, and whole witness conditions are retained. No quantity, unknown adjective, source constraint or phase is removed by argument matching.

The [proof artifact](evidence/source-field-arguments-proof-20261025-02.json) includes exact live original children, full original parent objects, full authorized backing records, explicit groups, direct link definitions and required whole support facts. SHA-256: `b6521d09516e4e5a97bb8eb13c2ae67d7ac6105e4b17b71492b43ab283a06d0c`. Ultima V/VI protected fact projections match the pre-change proof07 hashes; all 674 encoded documents remain frozen. No conversation oracle changed.

Validation: 73 targeted tests pass, including 38 index tests, knowledge contracts and source-context tests. Controls reject malformed/unknown roles, missing literal spans, unknown entities, duplicate bindings/groups, reversed endpoints, unrelated/disputed links, named-person rebinding, absent/conflicting support facts and missing source context. Positive static compilation is not a claim that the 18 fresh unanswered conversations are now solved; main-planner integration and separate conversation measurement remain necessary.

Public recompilation now defaults to the exact `knowledge.entityIdMap` declaration-to-canonical map. An explicit `canonicalize` callback remains authoritative; no name or alias search is introduced. The added synthetic default-versus-explicit equivalence and undeclared-ID controls bring the index suite to 39 passing tests, with 62 index and knowledge-contract tests passing together. The updated seller-owner assertion verifies the literal special-crystal binding and exact original quest context; Addom remains the agent rather than an owner, and selling still supplies no manufacturer role.
