# Independent request-field holdout review

Frozen at 2026-10-24T17:21:22+00:00, before any inference on these cases.

- Artifact: `guides/tests/assistant/intent-prototype/request-fields/held-test.json`
- SHA-256: `1a30919fb05ea48b91e84b5450598caaaa691aa199e2db8005e469b2951f0d27`
- Ontology SHA-256: `52e339e46ba8957dcf775fa546ba188881305c6ccb5b5928eb46ab5b9c6bce01`
- 116 independently authored questions: four for each of the 29 ontology labels.
- IDs and question texts are unique; all labels match the frozen ontology.

## Independence and construction

Only the frozen ontology and task instructions informed authorship. The author did not inspect training data, validation data, prototype implementation, existing case corpora or questions, model outputs, or reports. No Internet lookup, factual answers, or source claims were used. Questions span fictional people and places, ordinary tools and tasks, and software or game-style scenarios. Phrasing includes casual fragments, indirect property requests, yes/no forms, and retained negative, numeric, architecture, and edition qualifiers. These are varied authored cases, not a sample from organic user traffic.

Each question requests one primary field. Where nearby fields could overlap, the ontology hierarchy governs: first setup belongs to installation; a failure with a requested fix belongs to remedy; required quantities belong to prerequisites; digital packages belong to download; a current position differs from a movement endpoint or directions; an item's intent differs from its operation; goal, ordering, consequence, and cause are distinct requests. Residual verification questions do not ask a more specific defined field. Compound descriptions retain a single clear requested field.

## Evaluation boundary

This artifact measures classification of authored, held-out request-field questions. It does not measure broad chat answer accuracy, factual correctness, source coverage, entity resolution, game answer quality, authorization, or player progress. The classifier is expected to preserve input qualifiers, but those qualifiers provide no evidence that a fact is supported or an action is permitted.

The dataset was frozen before inference. Training and threshold selection must use their designated training and validation inputs only. Do not tune on this holdout or revise it after seeing predictions. If later analysis identifies a genuinely ambiguous case, document that limitation separately while preserving this artifact and hash. Four cases per label offer a small diagnostic comparison, not a strong population-level performance estimate.
