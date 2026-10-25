# Literal software capability reader

The original capability path recognizes four bounded software requests and returns
typed descriptors plus boolean proof. It does not produce answers, select a
subject, maintain session state, infer a ranking, infer current compatibility,
or change source facts. The existing runtime must still apply its normal
source, edition, spoiler, material, numeric, player-state and compound-request
guards before displaying any accepted proof.

The reviewed source is the existing `guides/StarcraftBWAPI.html`. The comparison
cards distinguish SCHNAIL's more realistic AI behavior from BWAILauncher's less
realistic AI behavior and explicitly limited strategic depth compared to
SCHNAIL. The setup section records BWAILauncher's conditional game-detection
procedure, including the settings/configuration button, Game or Paths,
Starcraft.exe, saving and restarting. The integrated-map note explicitly states
native StarCraft Remastered operation without version downgrades. These are
guide claims, not newly verified statements about current software releases.

| Request kind | Complete existing proof | Capability gates |
| --- | --- | --- |
| `offline-operation` | `starcraft:knowledge:bwai-offline` | prerequisites, use |
| `property-comparison` | `starcraft:knowledge:bwai-limitations` and `starcraft:knowledge:schnail-strengths` | comparison, limitations on both profiles |
| `executable-detection` | `starcraft:knowledge:bwai-detection` | configuration, method, sequence |
| `native-compatibility` | `starcraft:knowledge:map-identity` | use, version, explanation |

`parseSoftwareCapabilityRequest(text)` preserves `originalText` and complete
subject/property/comparator, executable/destination, or native-target phrases.
It returns a frozen descriptor or null. `supportsSoftwareCapabilityRequest`
requires that unchanged descriptor and a context containing `facts`,
`subjectEntityId` and `subjectLabels`. Comparisons additionally require
`referenceEntityId` and `referenceLabels`. `grounded: true` permits an already
established deictic subject; the helper never establishes that grounding.
Canonical IDs and labels must come from the caller's independently resolved
entities, not from candidate text matches or newly parsed request strings.

Every proof requires unchanged full `text === witness`, explicit roles, no
conflict and matching canonical ownership. Comparison requires both complete
authored cards, opposite literal realism clauses and an explicit named
strategic-depth comparator. Two disconnected facts or metadata saying
“comparison” cannot establish a contrast. Offline proof requires the whole
unconditional internet clause; SCHNAIL's initial login dependency cannot prove
entirely offline operation. Detection proof requires the entire exact recorded
conditional sequence, including its filename and restart. Native proof requires
the complete no-downgrade sentence; a launcher or installation paragraph cannot
substitute for it.

Callers must display every accepted fact's complete original text. In
particular, native answers retain the full no-downgrade sentence. The caller
may separately display the integrated-map restrictions from the original map
comparison card, but this helper does not infer that arbitrary maps or Melee
mode are supported. The unresolved BWAILauncher Remastered/1.16.1 conflict
remains untouched and must retain its existing runtime gate.

The focused tests read actual knowledge facts and pair positives with wrong
subjects, unknown editions/platforms, copper/numeric modifiers, wrong
executables, missing restart steps, missing roles, missing profiles,
uncertainty, contradictions, conflicting facts, altered witnesses, ungrounded
pronouns, changed descriptors and compound actions. Synthetic text mutations
are deliberately invalid proof probes, not new factual records or changed
oracles. Existing factual fields and encoded knowledge documents are unchanged;
no knowledge metadata, facts, vectors, models, profiles or assets were added.

The additional whole-source semantic-field path is documented in
`software-semantic-fields-review.md`; it shares the parse/support API while
retaining distinct field-proof and returned-evidence requirements.

Validation: the bundled Node runtime passes all twelve tests in
`guides/tests/assistant/software-capabilities.test.mjs`. This is authored
source-capability regression coverage, not an unbiased model-accuracy estimate.
