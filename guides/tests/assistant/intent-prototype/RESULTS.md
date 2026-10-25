# First intent prototype results — 24 October 2026

The MiniLM classifier is fast enough to investigate further. This first
prototype is **not accepted for production routing**: intent classification is
better than the mapped raw-parser baseline on these authored examples, but
subject continuity, uncertainty rejection and safe answer replay remain weak.

The test history was committed first as `873b9f9`; executable tests and the final
prior campaign were already in `5ec79d4`. The prototype is a separate local lab
for Ultima VII and StarCraft. Its model assets remain ignored, and no FTP upload
or Git push was performed for the prototype.

| Measurement | Result |
| --- | --- |
| Frozen MiniLM encoder / quantization | L6-v2 / q8, 384 dimensions |
| New model + tokenizer files | 23,916,680 bytes |
| Reused existing browser runtime | 22,528,676 bytes |
| Fitting / validation examples | 120 / 36 |
| Independent intent labels | 41/48 correct (85.4%) |
| Mapped raw-parser intent agreement | 28/48; not full assistant accuracy |
| Conversation intent labels | 38/47 match |
| Conversation entity expectations | 27/47 match |
| Independent canonical replay eligibility | 1/48; 39 protected, 7 clarify, 1 abstain |
| Four uncached short-question inference samples | 4.6, 5.1, 5.5, 4.9 ms |
| Median of those four samples | 5.0 ms |
| Local model preparation | about 679 ms; excludes internet download |
| Synthetic numeric / structural unit checks | 22/22 |
| Real-browser reset/help/game race assertions | 11/11 |

The classification head and evaluation data hashes are identical to the initial
run. Between runs, structural fixes made protected requests retain a clearly
grounded subject, honored reject-all thresholds, and prevented late inference
from restoring reset history or a fuller spoiler setting. Entity expectations
improved from 8/47 to 27/47, but the evaluation is now a regression set for those
fixes. Neither the fitting examples nor model hyperparameters were changed to
improve this score.

All browser requests were static local GETs, progress storage was unchanged,
source files remained stable, and there were no page errors, console errors or
external requests. Real UI sends succeeded for both selected games. A deliberately
empty validation response verified that failed preparation publishes no partial
head; restoring the real frozen validation data allowed retry to succeed.

The uncertainty result is a material limitation: the small validation set
selected score and margin cutoffs of zero at a 90% validation-accuracy target.
It consequently rejected none of the 48 independent questions, including seven
misclassifications. Those scores are not calibrated confidence. Errors include
recruitment versus general help, installation versus downloading, overview
versus location, and an unknown subject. A correctly classified unknown-name
question would still require entity resolution to abstain.

Canonical replay was intentionally kept conservative. Most unfamiliar phrasing
continues through the original-message engine, so this run does not establish
improved factual answers. The next experiment should evaluate a structured
intent/entity interface to the source engine, preserving original restrictions,
alongside more varied validation/unknown examples and a fresh evaluation set.
Further model training must keep source truth and spoiler authorization outside
the learned classifier.

These are measurements on existing desktop Chrome 156, CPU WASM, one thread.
They establish neither mobile performance nor blind organic-user accuracy.
The independent corpus review is in `corpus-review.md`. The sanitized machine
record, hashes, errors and boundaries are in
[`evidence/reviewed-summary.json`](evidence/reviewed-summary.json).
Full local evidence and screenshots are in ignored `results/reviewed.*`; the
initial run remains in `results/initial.json`.
