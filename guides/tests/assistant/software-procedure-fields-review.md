# Source procedure fields and continuity

This extends the literal software capability helper without changing its four
existing descriptor shapes. It adds bounded descriptors for a complete portable
configuration procedure, a procedure's selected file or recorded location, and
the next instruction after an explicitly named static step. The existing
executable-detection kind also accepts a source-conditional shorthand with
`variant: 'condition'`; the complete executable name is retained.

The source reviewed is `guides/StarcraftBWAPI.html`, lines 444–491. Its detection
procedure records the settings/configuration button, the Game or Paths section,
selection of Starcraft.exe, and saving followed by restarting the launcher. Its
portable procedure records extraction to the portable Starcraft directory,
selection of Starcraft.exe in that same directory, and settings stored in the
same folder. These remain authored guide claims; no software was downloaded or
run to validate current compatibility.

| Descriptor | Existing proof | Required roles |
| --- | --- | --- |
| `executable-detection`, conditional shorthand | `starcraft:knowledge:bwai-detection` | configuration, method, sequence |
| `portable-configuration` | `starcraft:knowledge:bwai-portable` | installation, configuration, destination, method, location |
| `procedure-field`, selected file | complete detection or portable procedure | full procedure's roles |
| `procedure-field`, settings or named executable location | complete portable procedure | full portable procedure's roles |
| `procedure-continuation` | complete detection procedure, static phase `saving the settings` | full detection procedure's roles |

The patterns are shared bounded source templates parameterized by separately
resolved canonical tool labels, complete game wording and executable filenames.
They do not contain a question-to-answer alias table, hard-coded entity IDs or
fact IDs. Unknown tool, edition, source, quantity, material, filename, location
and after-step complements remain present and must match the proof; they are
never dropped to obtain an answer. `should` is permitted only inside the finite
recorded-step question forms, not general recommendations.

Bare field questions must not attach themselves to an arbitrary active entity.
The caller must pass `returnedFacts`, containing complete eligible facts that
were actually displayed on the previous turn. A candidate procedure requires a
literal matching returned fact with the same canonical owner, source record
and source file. A previously displayed containing installation procedure may
ground its complete detection child as a whole clause sequence. A shared tool,
an executable label, an unrelated method, or a partial quoted step cannot.
Deictic subjects additionally require the caller's established `grounded`
flag. A named subject is independently matched against its canonical labels
and still requires that returned procedure proof.

The helper emits only immutable request descriptors and boolean proof. It does
not select subjects, generate answer text, maintain state or assert that the
user saved settings or restarted. A static request about instructions after
`saving the settings` can return the entire source conditional sequence;
requests reporting `I saved` are unsupported. The runtime must preserve its
source, edition, spoiler, material, number, conflict, compound-request and
player-state gates and render the complete accepted fact. The known launcher
version conflict remains subject to the existing runtime prerequisite guard.

Runtime integration must supply only eligible actual prior proof, resolve the
canonical tool from its established source context, and permit source
conditional/static-step syntax through language guards only where complete
helper proof exists. Missing, stale, ambiguous, disputed or ineligible context
must fail closed. A different game's generic file question must not gain a
software answer from grammar alone. This helper does not change the language
parser or knowledge runtime and does not itself supply those integration gates.

Focused verification uses the existing source-present facts and synthetic
invalid-proof mutations. It pairs positives with a different tool/file/step,
unknown edition, copper and numeric modifiers, ungrounded context, absent or
partial returned proof, missing source/roles, disputed proof, changed witnesses,
altered descriptors and player-state wording. The bundled Node runtime passes
all 12 tests in `guides/tests/assistant/software-capabilities.test.mjs`.
This is bounded regression coverage, not an unbiased accuracy measurement.
No knowledge data, frozen oracles, models, profiles, assets or setup files were
changed; no installation, training or downloads were performed.
