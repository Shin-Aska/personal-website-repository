# Frozen requested-field head: end-to-end staging evaluation

The frozen 29-field MiniLM head did **not** improve the current source router. Keep it isolated. A fresh replay of all 851 original development turns passed 750 with the current rules, 712 with head-first routing, and 747 with fallback-only routing. All three passed the same 175 negative boundaries. No production integration or native UI promotion followed these results.

This is a staging transform, not unchanged production acceptance: every report records `productionFactoryAndUI:false` and `stagingtransform:true`. The baseline knowledge module itself is unchanged, while its replay receives reporting instrumentation. The two proposals replace one requested-facet expression through a Node ESM loader. Original and actual transformed runtime hashes are recorded separately. The production files, source data, static vectors, manifests, model, original corpus and oracles were not edited by this experiment.

## Frozen comparison

The declaration was saved before execution in ignored `guides/tests/assistant/intent-prototype/results/request-fields-e2e-20261025/declaration.json`. Three policies use the same current 674 facts, 325 directed links, packaged MiniLM intent head and query-vector cache:

- **Baseline:** current production requested-field rules.
- **P1, gated head first:** preserve the existing elliptical `lastFacet` path; otherwise use an accepted non-`reference` head label as the requested facet. Abstention, `reference`, or absent semantic embedding keeps the rules.
- **P2, fallback only:** preserve the elliptical path; otherwise use an accepted non-`reference` head label only when the existing rules return null or `reference`.

The head is the original `request-fields-20261025-fit.json`, SHA-256 `72328fc25c98cb25fab84bb29902d69afb93cd7fbe410103b5c329aef313801e`. Its validation-selected thresholds remain minimum score 0, minimum margin `0.03003737521391825`, and `abstainAll:false`. The pure prototype `predictClassifier` implementation is unchanged. No fitting, threshold selection, label mapping, sample changes, policy changes or guard relaxation occurred after outcomes.

The head proposes only the requested field. Subject resolution, graph lookup, capability and provenance requirements, unknown-subject rejection, material/edition/number constraints, assertion checks, objective limits and player-state boundaries remain in their original positions. Earlier returns still bypass the proposal. The existing downstream evidence logic determines whether a proposed field has a supported answer.

## Complete-claim results

| Policy | All turns passed | Supported answers passed | Negative boundaries passed | Gains / regressions vs baseline | Missing / incomplete |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baseline | 750 / 851 | 575 / 676 | 175 / 175 | — | 0 / 0 |
| P1 | 712 / 851 | 537 / 676 | 175 / 175 | 8 / 46 | 0 / 0 |
| P2 | 747 / 851 | 572 / 676 | 175 / 175 | 0 / 3 | 0 / 0 |

| Game | Baseline | P1 | P2 |
| --- | ---: | ---: | ---: |
| Ultima VI | 125 / 133 | 118 / 133 | 125 / 133 |
| Ultima VII | 140 / 159 | 133 / 159 | 140 / 159 |
| StarCraft | 118 / 143 | 112 / 143 | 116 / 143 |
| Ultima V | 129 / 146 | 123 / 146 | 129 / 146 |
| Albion | 95 / 116 | 90 / 116 | 95 / 116 |
| Al-Qadim | 143 / 154 | 136 / 154 | 142 / 154 |

These scores apply the original `knowledge-corpus-replay.mjs` checks: one-of fact IDs, every `allFactIds` entry, exact source tuples, provenance witnesses, and independent complete alternative branches. Omitted branch `contains` inherits the base; base forbidden phrases always apply. A missing exact embedding would taint the affected turn and remaining dialogue. No missing inputs occurred. All reports have `sourceStable:true` and empty changed-source lists. The fresh 674-fact baseline happens to equal an earlier 669-fact total; it was rerun and is not inherited evidence.

The small fallback change still loses three previously complete answers. “Which executable do I run?” changes null to `version` and loses the BWAILauncher executable answer. “What open-source bot examples does the guide list?” changes null to `documentation` and loses the Steamhammer/UAlbertaBot list. “Which Library levels does the guide cover?” changes null to `documentation` and loses the sourced L1–L3 answer. All three head predictions clear the frozen acceptance margin.

P1 has broader field-boundary errors. “How do I get Anya permission?” changes `acquisition` to `recruitment` and declines; “How do I approach Stonegate?” changes `method` to `route` and selects the vault-door fact instead of the peaceful approach. P1 also gains eight cases, including the Dracothraxus reward, but loses 46. Some later regressions follow changed conversation focus. Per-turn differences and actual fact IDs remain in the summary; these examples did not trigger policy or data adjustments.

## Actual inference inputs and timing limits

The proposal consumes the exact existing `opts.embedding` array already supplied to the knowledge router. A reporting-only map witnesses the exact native MiniLM input string that produced each cached vector. It does not re-encode normalized text, strip qualifiers, fabricate a vector, or inject expected fields, states or facts. Existing contextual expansion is retained: for example `How do I use it?\nSubject: Gargish Vocabulary Scroll`.

P1 performs 693 predictions, accepts 370, produces 366 accepted non-reference proposals, and changes 145 rule facets. P2 performs 697 predictions, accepts 372, produces 368 non-reference proposals, and changes 15 rule facets. There are 92 context-expanded prediction inputs in P1 and 97 in P2. Every prediction has an exact input witness. Baseline requests 943 unique cache inputs, P1 936, and P2 943; all use the existing verified 981-text cache. No missing-vector generation was necessary. Query vectors originated in the existing pinned native MiniLM pipeline; these replays are cached inference, not a native browser accuracy or encoding-speed measurement.

Measured pure-head prediction time includes head/vector validation and ranking: P1 median 0.062 ms, p95 0.119 ms, maximum 2.489 ms; P2 median 0.061 ms, p95 0.128 ms, maximum 4.072 ms. The two policy processes ran concurrently. These local Node diagnostics exclude encoder execution, model startup, UI work and full-turn latency, and establish no deployment latency guarantee. No new latency budget was selected after observing results.

Neither policy satisfies the improvement gate, so the optional 96-turn fresh and 76-turn observed native staging UI comparisons were not run. There is no new browser, storage, request-boundary or native generative-inference acceptance claim. No server/browser was created by these Node replays, and no installation, model download, external request, commit, push or release was performed.

## Retained evidence and reproduction

All run outputs are retained, including failures, under ignored `guides/tests/assistant/intent-prototype/results/request-fields-e2e-20261025/`:

- `declaration.json`, `loader.mjs` and the actual `knowledge-<policy>-current674-01.mjs` / `replay-<policy>-current674-01.mjs` staged source artifacts.
- `run-baseline-current674-01/report.json`, `run-P1-current674-01/report.json`, and `run-P2-current674-01/report.json`, with exact requested/missing input lists alongside each.
- `summary-current674-01.json`, including every gained/regressed turn, complete oracle semantics, manifest hashes/counts and per-game totals.
- `input-and-integrity-audit-current674-01.json`, with exact expansion examples and unchanged post-run runtime/replay/head/classifier hashes.

Original knowledge SHA-256: `65e966cffd1fdf0fc01e96ac83c1ece1e002695e6c06b79924426bf6e862fc62`. Actual P1 transformed knowledge SHA-256: `2cd669e7d3e7702c99067dc551e78989a2ce9c2b916ea68ddb53a1c5c3a0db80`. Actual P2 transformed knowledge SHA-256: `fa0f00c4da987ad9b59629b93ed2e82d6cd31ce9e06ece5460f7eaf2f1ebb263`. Baseline uses the original knowledge hash. Each report also records original/transformed replay hashes, loader hash, classifier hash, frozen head hash, full source snapshots and policy identity.

Report SHA-256 values, respectively baseline, P1 and P2:

```text
011e288905e1528307da9bc61e4ea761627b89b12f9dd676b0f9bf85c71a9862
f63eb4dd943d1c1cf36b09f7ebf24af17d36bd4e9908d98e2b3bbe910a33be30
ef5516d4c1470f2282b8c52555f570d07bb754e1c69cdda925e12e759b2290f3
```

To repeat with existing assets, select `baseline`, `P1`, or `P2` and a new unique tag. Never reuse a tag or replace a report. On this machine the bundled Node executable is `/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`:

```bash
FIELD_E2E_POLICY=P2 FIELD_E2E_TAG=unique-new-tag \
  /home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --loader ./guides/tests/assistant/intent-prototype/results/request-fields-e2e-20261025/loader.mjs \
  guides/tests/assistant/knowledge-corpus-replay.mjs --tag unique-new-tag
```

The current rules remain preferable on this fixed development corpus. The head's independent classification result (80/89 accepted labels correct) did not establish end-to-end answer quality, and the 851 development turns are not an independent generalization test. Any future proposal requires a separately declared evaluation; these results do not authorize release.
