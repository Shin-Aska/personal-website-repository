# Shared conversation follow-ups — 24 October 2026

The owner reported `what is schnail` → `download link`, then clarified that the
same behavior must apply to Ultima VII. The actual browser also contained
`download link of schnail`: its learned acquisition label was already correct,
but the next layer rejected `link` as an unsupported material restriction.
The source adapter's text extraction also omitted the source anchor's URL.

The shared dialogue layer now combines the requested relationship with a grounded
current subject for bounded fragments and pronouns. It preserves acquisition
method, output format and meaningful qualifiers. Explicit subject changes,
pending confirmations, unknown new names, resets, help changes and inherited
restrictions remain separate state transitions. There is no SCHNAIL-name branch
in this conversation logic.

The interpreter is the single dialogue authority for the proposed answer path.
Its source reader starts each request without an older subject and receives only
the interpreter's grounded entity IDs. This fixes Iolo → misspelled Duprae →
`Where is he?` incorrectly borrowing Iolo after a clarification. The baseline
comparison continues to use the existing stateful engine.

The source catalog retains exact HTTP(S) links from each selected guide selector.
The presenter reauthorizes actual engine-selected records, checks entity and
method, and preserves account/edition/conditional qualifiers. URLs remain at
Full answer unless explicitly authored in a lower-level source variant. A
reviewed prototype definition now introduces SCHNAIL directly using its full
name and purpose, with the underlying guide selectors cited. No model generates
URLs or game facts. Answer text and links are primary in the UI; diagnostic JSON
and the baseline comparison are collapsed.

Verified actual UI conversations, with real MiniLM inference:

- StarCraft: `what is schnail` introduces **Starcraft Human and AI League**;
  `download link` returns the clickable guide URL and **Account required**.
- Ultima VII: `Who is Iolo?` identifies the bard; `where is he?` returns Trinsic;
  `stats` returns the guide's Strength/Dexterity/Intelligence/Combat values.

The v2 linear head uses 180 training and 72 validation examples. The frozen v1
corpus remains intact. New fitting examples cover short relationship requests;
the reported `download link` case is explicitly a known regression and is not
counted as a fresh holdout. The additional ten conversations / 65 turns are
reviewed in `followup-corpus-review.md`.

Results and limits:

- Numerical/structural/source checks: **39/39**; real-browser control and subject
  isolation assertions: **16/16**; actual core UI sends: **5/5**.
- Broad follow-up behavior: **25/65** satisfy every expected entity, answer,
  source and URL check. Remaining failures are retained, including longer
  paraphrases, setup/documentation subtopics and unsupported or ambiguous stat
  qualifiers. The original narrow fragment implementation scored 14/65 with a
  stricter, partly incorrect harness; that is not a clean accuracy comparison.
- Learned intent labels: **50/65**; resolved intents: **51/65**. Route origins are
  recorded separately (63 model, one exact-relation fallback, one pending
  confirmation). These deterministic routes are not credited as model inference.
- Frozen v1 intent regression under the new head: **40/48**. The previous head
  scored 41/48. The change improves requested follow-up behavior; it does not
  establish an overall classifier-accuracy improvement.
- The validation cutoff still rejects no questions. Scores remain uncalibrated.
  The classifier and frozen evaluation data were not tuned between the first
  and integrated v2 runs; structural dialogue fixes are now regressions against
  those observed cases.
- Source files and progress storage stayed unchanged during the final browser
  run. There were no external requests, question-bearing POSTs, page errors or
  console errors. Preparation failure/retry and cancellation checks pass.

The integrated harness accepts an equivalent standalone/parent source record
only when both authorize at the chosen help level and have exactly the same
source locator and text. Existing research citation URLs count as visible
citations, not download resources. Expected pending entities are compared with
actual candidates rather than falsely requiring an already confirmed subject.
No expected state is used as an input to the dialogue controller.

The machine record is [`evidence/followup-summary.json`](evidence/followup-summary.json).
Full local results and two chat screenshots are in ignored
`results/followup-v2-integrated*`. The prototype remains local and uncommitted;
no production guide, active model profile, FTP deployment or Git remote changed.
