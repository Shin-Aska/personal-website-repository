# Local extractive source-reader experiment

Status: **user approved the local experiment download on 2026-10-24**. All six pinned assets were downloaded and their sizes and SHA256 hashes verified, totaling 27,848,554 bytes. No packages were installed. All experiment code lives in `guides/tests/assistant/intent-prototype/source-reader/`; it is disconnected from production chat, source manifests, corpus files, service worker and model profiles. Its `assets/` and `results/` directories are ignored. This document does not claim that another model improves game knowledge or answer accuracy.

## Question and boundaries

The current MiniLM cosine plus grammar approach passes 688/851 development turns and 48/96 fresh strict turns in the current investigation. Those are starting observations supplied by the investigation, not results of this experiment. Lexical matching and embeddings still trade useful paraphrase recall against wrong subject/relationship matches. Test whether a small extractive question-answering model can better rank already authorized source facts or abstain when a requested relationship is absent.

The reader receives a question and separate short source-fact contexts. It emits context IDs, token-span indices, raw best-span/CLS scores and timings. It never emits generated facts or renders a predicted span as an answer. Existing exact fact text, provenance, source locators and reviewed support compositions continue to own answers. Strict game/entity/source/edition/state/relationship/role gates remain mandatory both before candidate selection and after ranking; a favorable score cannot relax them. A source-only request must stay within its authorized source. No model inference may create a directed edge, combine unrelated witnesses, mark progress, infer procedure from an objective, or invent missing outside research.

SQuAD2.0 training includes unanswerable questions; that makes CLS comparison worth measuring. It does **not** establish calibrated abstention on these guides. Raw score differences between contexts are a ranking heuristic to validate, not calibrated probabilities or evidence of truth.

## Pinned candidate and provenance

Candidate: [`onnx-community/mobilebert-uncased-squad-v2-ONNX`](https://huggingface.co/onnx-community/mobilebert-uncased-squad-v2-ONNX/tree/a8d7291835b8b6481505577f2aa98db0d3a4f601), revision **`a8d7291835b8b6481505577f2aa98db0d3a4f601`**. The [pinned official Hub API](https://huggingface.co/api/models/onnx-community/mobilebert-uncased-squad-v2-ONNX/revision/a8d7291835b8b6481505577f2aa98db0d3a4f601?blobs=true) identifies `question-answering`, `transformers.js`, file sizes and the weight LFS SHA256. The ONNX conversion [model card](https://huggingface.co/onnx-community/mobilebert-uncased-squad-v2-ONNX/blob/a8d7291835b8b6481505577f2aa98db0d3a4f601/README.md) explicitly names `csarron/mobilebert-uncased-squad-v2` and the ONNX conversion space. This is a community conversion hosted on Hugging Face, not a claim that the original authors endorsed this quantization.

The [upstream pinned card](https://huggingface.co/csarron/mobilebert-uncased-squad-v2/blob/6d49c30d06c6042041039f6fe076b011f0c2053c/README.md), revision `6d49c30d06c6042041039f6fe076b011f0c2053c`, declares **MIT** and describes fine-tuning `google/mobilebert-uncased` on SQuAD2.0. The conversion has no independent license declaration or LICENSE file in the inspected API listing. Preserve those provenance details with the experiment results.

Only API metadata and small card/config/tokenizer files were inspected remotely in memory during preparation. No request fetched or resolved an ONNX weight file. No inspected model/tokenizer asset was saved locally. The manifest records SHA256 hashes of small-file bytes and matching Git blob IDs; the weight SHA256 and size come only from official LFS metadata.

| Requested future file | Exact bytes | SHA256 |
| --- | ---: | --- |
| `onnx/model_quantized.onnx` | 26,903,231 | `a59cc2b740b9ad10299e3280bc9e7ef325a3fa98b9e39f1d9a8ebfb9d2384083` |
| `config.json` | 957 | `9f8d68d2fefd29f8cc5bc9829f82832fda0190663b0926c659ac2ae17a8d3d2b` |
| `tokenizer.json` | 711,396 | `d241a60d5e8f04cc1b2b3e9ef7a4921b27bf526d9f6050ab90f9267a1f9e5c66` |
| `tokenizer_config.json` | 1,337 | `be7b4dfaeb996d3dca316b513b23938482a4392cab6521b31ec2dd79d7c6f889` |
| `special_tokens_map.json` | 125 | `b6d346be366a7d1d48332dbc9fdf3bf8960b5d879522b7799ddba59e76237ee3` |
| `vocab.txt` | 231,508 | `07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3` |
| **Total new assets** | **27,848,554** | **27.85 MB decimal / 26.56 MiB; zero new runtime bytes** |

`vocab.txt` and the special-token map duplicate already present MiniLM content by hash, but this conservative permission total includes complete separate local copies; the script does not secretly substitute files or exceed the requested total. No FP32, FP16, q4, other model, dependency, remote client code or new runtime is requested.

## Compatibility evidence and limits

The shipped `@huggingface/transformers@3.8.1` module in `guides/local-assistant/profile.json` exports `AutoModelForQuestionAnswering`, `MobileBertForQuestionAnswering` and `MobileBertTokenizer`. The pinned config declares `model_type: mobilebert`, `MobileBertForQuestionAnswering`, 512 maximum positions, a 30,522-token vocabulary, padding ID 0 and two token types. The tokenizer declares `MobileBertTokenizer`, Bert normalization/pre-tokenization, uncased WordPiece and paired `[CLS] question [SEP] context [SEP]` processing. Its question segment is type 0; context is type 1. CLS is 101 and SEP is 102. These match the existing runtime's supported architecture/tokenizer family by static inspection.

Before the approved native run, ONNX input/output shapes, quantized operator support, loader behavior and no-answer behavior were unverified. Native loading, finite paired QA outputs and the two smoke behaviors are now verified by the reports below; total worker/WASM memory remains unmeasured. The worker fails on missing segment IDs, unexpected outputs, nonfinite logits or sequences over 384 tokens; it does not silently truncate. Long facts must be reviewed into explicit bounded windows with the same provenance before measuring them. Existing runtime chunks are verified against the existing profile, reused in memory as local blobs and never downloaded by this experiment. The worker uses WASM, one thread, no remote models and no persistent model cache.

## Prepared local entry points

From the repository root, use the existing Node binary; no installation is needed:

```sh
python3 guides/tests/assistant/intent-prototype/source-reader/prepare-assets.py
/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test guides/tests/assistant/intent-prototype/source-reader/span-policy.test.mjs
```

The preparation command defaults to offline **dry-run**, verifies existing runtime hashes, lists missing/invalid reader files and creates no asset directories. `--verify-only` remains offline and fails if any requested file is absent or invalid. `--download` is a deliberately separate flag reserved for **prior explicit human approval**. It fetches only the six revision-pinned HTTPS URLs, bounds each response by its exact byte count, checks SHA256, writes temporary files within the ignored asset tree, atomically promotes verified files, and removes failed partial files. It reads no Hugging Face credentials and runs no package manager. The approval status in the manifest is descriptive; the flag is not a substitute for permission.

After approval only:

```sh
python3 guides/tests/assistant/intent-prototype/source-reader/prepare-assets.py --download
python3 guides/tests/assistant/intent-prototype/source-reader/prepare-assets.py --verify-only
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/guides/tests/assistant/intent-prototype/source-reader/`. The page requires loopback, has a local-only CSP, and loads a module worker from the experiment directory. The load button does local integrity checks and model initialization. The synthetic smoke button tests mechanics only; its zero thresholds are explicitly uncalibrated. The page displays IDs/scores rather than answer facts. Close the worker/browser and stop the temporary server after the run. An automated browser harness should use an ephemeral port and block all non-loopback requests, allow only static GETs, block service workers, and close its own browser/server in `finally` blocks; it must not touch the user's preview tabs.

The isolated browser API is `window.sourceReaderLab.request({type:'prepare'})`, followed by `request({type:'rank', question, contexts:[{id,text}], calibration:{minNullMargin,minWinnerMargin}})`. Ranking accepts 1–8 contexts, 500 question characters, 6,000 characters per context, 384 total tokens per pair and answer spans up to 30 tokens. It masks question tokens, CLS, SEP, padding, mask and unknown tokens from spans. It compares the best valid context span against `start_logits[CLS] + end_logits[CLS]`, requires a calibrated positive margin and a calibrated winning-context gap, and abstains on a tie. Span indices are diagnostics only; callers still choose and cite original authorized fact IDs. There is no production hookup or automatic fallback.

## Benchmark protocol after approval

1. **Freeze evidence.** Hash the current source manifests, source records, six development case files, the 96-turn fresh file, existing classifier/profile and exact experiment scripts before inference. Write uniquely tagged run outputs under ignored `source-reader/results/`; never overwrite earlier failures. Record current baseline run IDs/hashes alongside the 688/851 and 48/96 observations so comparisons use the same code and sources.
2. **Prove mechanics first.** Verify all six downloads and existing runtime chunks, then run native browser inference on paired answerable and absent-answer synthetic contexts. Assert finite `start_logits`/`end_logits`, segment masking, CLS-based null scoring, local-only requests and no writes to saved game state. Capture cold/warm load time, per-context latency, token counts, approximate browser memory if supported, and errors. Do not benchmark a fixture or an embedding model while labeling it native QA inference.
3. **Measure candidate coverage separately.** For each original question and exact conversation-expanded question, derive candidates using the existing game/entity/source/edition/state/role/relationship gates. Compare the present lexical and MiniLM candidate pools, their deterministic bounded union, and an all-eligible-facts diagnostic scored in batches of eight. Never use expected fact IDs to build candidate pools. Report whether a valid answer was present before reranking; a reader cannot repair a missing source fact or excluded candidate. Keep follow-up context from actual conversation history, never injected expected state.
4. **Calibrate on development only.** Keep each fact as its own context and its exact witness/provenance. Select two nonnegative thresholds (span-minus-CLS margin and first-minus-second margin) on a fixed development split, grouping by dialogue so turns do not leak across splits. Save the split IDs, threshold grid, objective and chosen values before fresh evaluation. Evaluate lexical, cosine plus grammar and reader under identical parent gates. Compare raw and conversation-expanded queries and top-k sensitivity on development only. Read-only ranking can change; source/corpus/runtime files cannot.
5. **Run frozen strict evaluation.** Execute all six games and the 851 development turns plus the unchanged 96 fresh turns. Preserve exact fact/source/locator checks, complete alternative branches, all required evidence, state/edition conditions, unsupported relationship refusal, cross-subject rejection, cross-game switching and role distinctions. Report per-game answer precision/coverage, supported-answer success, boundary success, complete-turn pass counts and failure categories. The 96-turn suite has already been observed in this investigation; keep it out of calibration and do not describe it as newly unseen evidence. If decisions use those outcomes, author a new independent source-checked held-out suite before claiming generalization.
6. **Decide from paired evidence.** Continue only if the frozen reader experiment increases strict supported-answer success over the same baseline while preserving all source/state/boundary guards and introduces no new wrong-entity/source/edition/role answers; report every regression rather than hiding it in aggregate accuracy. Require complete all-six results, source hash stability, native inference evidence and acceptable observed local load/latency/memory. Any missing evidence or unacceptable tradeoff leaves the reader an unsuccessful or inconclusive experiment. A successful experiment can proceed to verified local integration under the existing six-game goal. FTP deployment remains outside this experiment.

Pre-download verification (historical): the three offline span-policy tests pass (question/special masking, null/tie abstention, missing-calibration/input-limit rejection). Default preparation reports all six reader files absent, zero network requests, verified existing shared runtime and 27,848,554 proposed bytes. JavaScript syntax and Python syntax are checked locally. Native reader inference and game accuracy were not run.

## Native result and decision — 2026-10-24

The user approved the local download. Offline verification confirms all six pinned files are present and valid. A real Chrome WASM run using the existing runtime loaded the reader in approximately one second and passed both mechanical smoke cases: selecting a supplied answer and abstaining when the requested answer was absent. There were no external inference requests or page errors; each owned temporary server and browser was closed.

The frozen retrieval diagnostic ran **850 of 851 development turns** across all six games, with five same-game cosine candidates per question and 4,250 native question/context inferences. One exact conversation-expanded query was missing from the earlier MiniLM cache; it is recorded rather than substituted. The candidate builder selected passages before reading expected fact IDs. It deliberately omitted production authorization gates so this measures candidate coverage and passage selection only, **not complete chat accuracy**. Each run preserved its input and source hashes.

For 675 supported questions, the expected fact was present in the five candidates in 663 cases. Forced first-place cosine selection matched the expected fact in **568/675** cases; forced first-place reader margin selection matched it in **400/675**. With the initial zero abstention thresholds, the reader accepted a correct fact in 284 cases, accepted a wrong fact in 166 and abstained in 225. It also accepted 63 of 175 unsupported or state-sensitive questions when production gates were absent. A fixed dialogue-grouped threshold search on the development partition reduced those raw acceptances but withheld most useful answers; it did not establish a useful replacement. None of these counts substitutes for exact claims, complete support, source checks or an independent conversational holdout.

Median observed inference time was 29 ms per context and p95 was approximately 50 ms. Page JavaScript heap measurements exclude worker/WASM memory, so total runtime memory remains unmeasured.

**Decision: do not integrate this reader into production chat.** Its mechanics work, but this experiment did not improve passage selection. The approved assets remain ignored local experiment files. Continue with explicit relationship indexes, subject resolution and source coverage using the existing approved models. Preserve the unsuccessful results; do not retune facts or test oracles to make the experiment appear successful.

Reviewable summary: `guides/tests/assistant/evidence/source-reader-native-experiment-20261024.json`. Detailed immutable local reports: `source-reader/results/native-smoke-01/report.json`, `source-reader/results/retrieval-diagnostic-01/report.json` and `source-reader/results/retrieval-diagnostic-01/evaluation.json`. The experiment is not published or uploaded.

## Original permission action — approved

Ask permission to **download exactly these six pinned files, totaling 27,848,554 bytes, into the ignored local source-reader experiment assets directory and run the isolated local benchmark with the already available runtime, Chrome and Playwright**. Explain that this is one new MobileBERT extractive QA model, distinct from the already approved MiniLM and SmolLM assets. This approval covers the additional asset download and local experiment. It does not initiate package installation, publication or FTP deployment. That approval has now arrived and the six pinned assets were downloaded and verified. It does not authorize other downloads.
