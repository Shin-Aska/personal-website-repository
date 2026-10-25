# Isolated requested-field head prototype

This experiment proposes one requested field from a fixed 29-field vocabulary. It does not generate facts or answers, authorize a source, resolve a subject, decide player progress, or integrate with production. The fixed MiniLM encoder remains unchanged. A separately fitted regularized linear softmax head provides ranking scores; a validation-selected margin permits abstention.

## Frozen ontology and data

The executable definitions and tie-breaking hierarchy are in `guides/tests/assistant/intent-prototype/request-fields/ontology.json`. They were frozen before any embeddings or fitting. The vocabulary is identity, purpose, relationship, installation, configuration, download, documentation, support, compatibility, version, location, destination, route, acquisition, recruitment, prerequisites, stats, combat, use, method, outcome, cause, creator, comparison, limitations, objective, sequence, remedy, reference. `reference` covers residual verification/source requests. Abstention is separate; an `unknown` training label was unnecessary.

The hierarchy distinguishes intended function (`purpose`), item operation/inherent effects (`use`), general procedures (`method`), and event consequences (`outcome`). It distinguishes current position (`location`), endpoints/file placement (`destination`), and paths (`route`). A requested URL is classified by its resource: documentation, help community, or downloadable digital assets. Required resources remain prerequisites even when quantitative. A failure's cause is distinct from its requested remedy. Interoperability is compatibility, release identity is version, and comparative merits are comparison.

There are 290 fitting examples and 116 validation examples: exactly 10 and 4 per field. They contain standalone requests, terse follow-ups, WH and yes/no forms, generic software/game/process subjects, and source, edition, negation and numeric qualifiers. No actual game answer facts are trained. Qualifiers stay in the original text and must still be checked by downstream evidence logic. Independent questions require decomposition before classification; claim truth is never a training target.

Frozen SHA-256 values, also stored in `frozen-inputs.json`:

| File | SHA-256 |
| --- | --- |
| ontology.json | `52e339e46ba8957dcf775fa546ba188881305c6ccb5b5928eb46ab5b9c6bce01` |
| train.json | `541b04a72ae45820c406db2fa3b406663a6fd6e33be56f10a3933b785ae11119` |
| validation.json | `9fb493a95947603748f5939d8176550500778cf9cfe03bd7b532f66e6cd2f017` |

These inputs are hash-checked before fitting. Existing training/evaluation case JSON and replay files were not read. Existing classifier, encoder, worker and browser-runner implementation code and the request-field parser/ontology were inspected. The older runner contains UI smoke questions; those were not reused in the authored datasets. Independent held evaluation is supplied after this freeze and must not change labels, samples, weights or thresholds.

## Implementation and execution

`classifier.mjs` derives from the existing dependency-free intent classifier; its algorithm is unchanged and only the label vocabulary differs. Its header records the upstream source hash. Fitting uses 150 full-batch gradient steps, learning rate 4, L2 0.001, seed 20261025. These settings were fixed in the ontology before inference; no hyperparameter search was performed. Validation alone chooses the highest searched coverage reaching 90% empirical accepted accuracy with at least 30 acceptances, using the existing threshold selector's bounded score/margin grid. Scores are not calibrated correctness probabilities.

`runtime.mjs` imports the existing `../encoder.mjs` and integrity-checking `../embedding-worker.mjs`. The native browser run used the pinned `Xenova/all-MiniLM-L6-v2`, revision `751bff37182d3f1213fa05d7196b954e230abad9`, quantized ONNX/WASM on one thread, 384 normalized dimensions. The runtime/model bytes were already present; nothing was installed or downloaded. The worker verifies every asset's pinned digest and disables remote models.

Run from repository root with the already installed Python/Playwright/Chrome environment:

```bash
python3 guides/tests/assistant/intent-prototype/request-fields/run-browser.py --tag fit
```

The runner owns a temporary loopback HTTP server and browser, blocks external requests, permits only local GETs, checks source hashes before/after execution, and closes the browser/server in `finally` blocks. It exports weights, label definitions, provenance, measurements and validation predictions to ignored `guides/tests/assistant/intent-prototype/results/request-fields-20261025-<tag>.json`. Existing result files are never overwritten.

To evaluate an independently authored test without retraining or choosing new thresholds:

```bash
python3 guides/tests/assistant/intent-prototype/request-fields/run-browser.py \
  --head guides/tests/assistant/intent-prototype/results/request-fields-20261025-fit.json \
  --test /absolute/path/to/independent-test.json --tag independent
```

The test is an array of `{id,text,label}` samples or an object with a `samples` array. It is consumed only after the frozen head is fitted/restored. The result records its hash and both raw and thresholded outcomes. No examples are silently discarded.

## First native run

Result: `guides/tests/assistant/intent-prototype/results/request-fields-20261025-fit.json`, SHA-256 `72328fc25c98cb25fab84bb29902d69afb93cd7fbe410103b5c329aef313801e`.

| Split/action | Correct | Total accepted/evaluated | Accuracy | Coverage |
| --- | ---: | ---: | ---: | ---: |
| Fitting diagnostic, raw | 287 | 290 | 98.97% | 100% |
| Validation, raw | 90 | 116 | 77.59% | 100% |
| Validation, thresholded | 77 | 85 | 90.59% | 73.28% |

The validation-selected cutoff is minimum margin `0.03003737521391825`, minimum score `0`; 31/116 validation requests abstain. The accepted validation set still contains eight errors. Training accuracy is a fitting diagnostic, and validation accepted accuracy is optimistic because that same split selected the threshold. Neither establishes independent quality or superiority to the rule parser.

The full validation confusions are preserved. Repeated errors include identity→relationship (2), method→sequence (2), and outcome→sequence (2). All four validation purpose examples were misclassified across creator, limitations, relationship and objective. These are meaningful semantic boundaries that this small head has not reliably separated. We did not merge labels, rewrite examples or tune fitting settings after seeing them. Some questions have legitimately overlapping field readings; independent adjudication should report those separately rather than silently relabeling them to favor a model.

The first run's boundary checks passed: genuine model inference, no external requests, no page errors, only static local GETs, and unchanged prototype/encoder inputs during the run. Encoder preparation took about 0.84 seconds and the complete fitting/validation browser routine about 4.08 seconds on this machine. These are local diagnostic timings, not production performance guarantees.

## Independent held test

A separate author received only the frozen ontology and authored 116 held requests, exactly four per field, without reading fitting/validation data, implementation code or evaluation reports. The held file is `guides/tests/assistant/intent-prototype/request-fields/held-test.json`, SHA-256 `1a30919fb05ea48b91e84b5450598caaaa691aa199e2db8005e469b2951f0d27`. The saved fit head was restored and evaluated once; no fitting, threshold selection, sample changes or label changes occurred.

Result: `guides/tests/assistant/intent-prototype/results/request-fields-20261025-independent.json`, SHA-256 `b48aa7eb8924b0bce8dc1153a56e2b6534bd9566e7c64271b5e3193203c27783`.

| Held action | Correct | Total accepted/evaluated | Accuracy | Coverage |
| --- | ---: | ---: | ---: | ---: |
| Raw ranking | 88 | 116 | 75.86% | 100% |
| Frozen validation threshold | 80 | 89 | 89.89% | 76.72% |

There are 27 abstentions and nine accepted mistakes. The 90% validation target did not strictly transfer to held data. Accepted error pairs are purpose→cause, relationship→purpose, configuration→stats, stats→route, use→acquisition, method→sequence, outcome→acquisition, comparison→route, and reference→location (one each). Full per-case results and raw confusions remain in the ignored result. Three of four held purpose examples and three of four held reference examples have incorrect raw predictions. Subject/task semantics can dominate the requested field even when the text clearly requests a different field.

Held encoding took about 0.91 seconds, excluding browser/model startup. The run again passed local-only native model, static GET, no external request/page-error and unchanged-source checks. Its recorded fit-head hash matches the original result hash above, and the held hash matches the independently frozen input.

A direct rule-parser comparison on the same independently adjudicated requests is required to claim improvement over the current rules. The feasibility claim is limited: the pinned encoder can drive a bounded 29-field proposal head and abstention pipeline locally, with material confusions. Broad intelligence, factual reliability and production readiness are not established.
