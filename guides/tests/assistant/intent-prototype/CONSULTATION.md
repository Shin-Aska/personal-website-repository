# Conditional consultation — 24 October 2026

The owner asked how the chat should handle: “I am playing StarCraft Remastered.
Which one is the best, do you think?” The actual encoder/head already classified
this as comparison. The old prototype required a named subject and passed the
message to its source reader, which dumped all three pros/cons and added
`Not answered: do you think`.

The shared consultation controller now treats this as a choice with context.
For the stated Remastered context it conditionally chooses the integrated map
**for staying inside Remastered**, gives Use Map Settings and limited-map
tradeoffs, and distinguishes SCHNAIL's separate own-game client as an alternative
when more realistic AI is the priority. It does not certify an overall best
product or resolve the guide's BWAILauncher compatibility conflict.

Six declarative profiles supply the facts: three StarCraft options and three
Ultima VII party roles. The same controller handles healing, front-line and
ranged preferences. Every positive trait, summary and limitation has exact
indexed source witnesses. The controller authorizes the declared witness variant
at or below the current help ceiling, validates the quotation and its direct or
`basedOn` provenance, and retains the authorized source in the reply. Conflicting,
hidden, missing or tampered evidence cannot establish a positive recommendation.

The model identifies a comparison. An explicit consultation-vocabulary fallback
is reported separately. A program policy selects one uniquely supported option
for a modeled goal and formats a conditional recommendation using verified
source quotations. This is source-backed decision support, not model-generated
reasoning or facts. The active neural model, fitting data and head remain unchanged.

Explicit edition statements establish conversation preferences without asserting
saved progress. Mere lookup mentions do not establish the player's edition.
Unsupported editions/conditions remain unresolved until corrected or reset;
unknown price, morality or compatibility rankings are not guessed. Reset and
game controls clear the preference scope. Public chat always uses full answers;
lower-tier source checks remain internal evaluation fixtures. A recommendation can establish one
salient subject for the next `download link`; it never asserts the player already
selected, installed or recruited anything. The source reader then returns only
that option's authorized links.

Verification:

- **53/53** numeric, dialogue and source-policy unit checks.
- **23/23** authored consultation checks across six dialogues, including three
  controls. Covers the exact reported message, context → recommendation → map
  links, changed priorities, unsupported editions/prices, guide-only, topic/help/
  game isolation, and Ultima VII roles with no automatic recruitment.
- **16/16** existing real-browser control and stale-subject assertions.
- Real browser form submissions display the conditional Remastered answer with
  no `Not answered` fragment; the next download request yields the map's two
  existing URLs and no SCHNAIL/BWAILauncher URL.
- The final run has stable source hashes, unchanged localStorage, only local
  static GETs, no external requests and no page/console errors. An initial run
  overlapped a source edit and was rejected by the source-stability check.

These numbers are bounded feature checks. The wider conversation suite remains
**25/65**; this feature does not fix all natural-language paraphrases or calibrate
classifier confidence. See
[`evidence/consultation-summary.json`](evidence/consultation-summary.json),
`consultation-catalog-review.md`, and `consultation-cases-review.md` for evidence,
source boundaries and the frozen cases. Raw reports/screenshots remain in ignored
`results/consultation-final*`. No production code, active profile, FTP files, Git
remote or game progress was changed.
