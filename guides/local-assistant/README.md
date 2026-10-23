# Shared local chat model

This is the production model folder shared by all six game guides. Keep it here:
`guides/js/assistant/` contains the browser code, this folder contains the model
configuration and payloads, and `guides/tests/assistant/fallback-pilot/` retains
the historical experiments. No live guide imports the pilot.

| File | Purpose |
| --- | --- |
| `profile.json` | Active model/runtime identity, settings and verified file mapping |
| `files/*.bin` | The 18 deployable model/runtime parts |
| `prepare-assets.py` | Local packaging and read-only verification; never downloads |

All six guides read **profile.json**. It selects the model/runtime files, identity,
quantization and input limit in one place. The shipped model is the already
approved SmolLM2-135M-Instruct q8, HF revision
`12fd25f77366fa6b3b4b768ec3050bf629380bac`, with Transformers.js 3.8.1.
Original pinned sources and integrity values are retained in the profile.

Nothing is fetched from Hugging Face or a model CDN at runtime. After the visitor
chooses Enable chat, their browser downloads these same-origin static parts,
checks their SHA-256 values and caches them separately from guide reading and
saved progress. The 18 parts total **161,786,625 bytes**. Large source files are
split into at most 16 MiB pieces for ordinary static hosting/version control;
the worker reconstructs their exact original bytes. No package manager is needed.
The root `.gitattributes` marks every shipped `.bin` part as binary so Git never
changes line endings inside a hashed part, including parts containing JSON text.

The model only scores paths through three approved conversational sentences for
the relevant category. The program supplies all quoted game text and citations.
Replacing the model cannot grant permission to generate facts or change progress.

## Rebuild from existing approved downloads

To check the shipped files without the pilot downloads, installing anything or
changing files:

```sh
python3 guides/local-assistant/prepare-assets.py --verify-only
```

This checks every part's filename, size and SHA-256, all model/runtime references
and the total download size. A missing or corrupt part fails the check.

Rebuilding is a separate operation:

```sh
python3 guides/local-assistant/prepare-assets.py
```

This checks the existing pilot's pinned assets and packages them locally. It
makes no network requests and installs nothing. Keep the whole `files/` directory
and `profile.json` together when publishing the guide files; deploying only the
JavaScript will leave chat unable to load. Publication records are kept in
`docs/assistant-handoff.md` at the repository root.
Existing parts must match the verified source; the packager refuses a corrupt
existing part rather than silently publishing a profile that refers to it.

## Select a future compatible model

Obtain owner approval for any new downloads first. Prepare an equivalent source
folder with `assets-plan.json`: pinned file paths, model/runtime identity,
revision, dtype, byte counts and SHA-256 or Git-blob SHA-1 integrity values. Model
files live under `model/<name>/`; the runtime folder supplies the Transformers
ES module and its matching ONNX-WASM module/binary. The packager reads local
files only:

```sh
python3 guides/local-assistant/prepare-assets.py --source /path/to/approved-assets --id new-model-release --label "New model name"
```

Change the **id** for every model/runtime release. Enabled visitors are asked
again when it changes; visitors who kept chat off remain off. The source
folder's dtype and resulting profile select compatible ONNX quantization.
A compatible Transformers causal language model/tokenizer can use the existing
worker. A different inference backend needs a worker adapter, not just a filename
change. Rerun the real model/consent suite before selecting another model.

The chosen profile is cached as small metadata for offline reload. Model parts
use `guide-assistant-model-files-v1`, keyed by content hash, so all guides on one
origin reuse the same files. Browser storage eviction or disabled cache storage
may require another download. Turning chat off terminates its worker and clears
in-memory chat; Reset choice removes only the preference, not downloaded model
parts or game progress.

Run `model-consent-browser.py` for actual six-game loading/inference, cache,
consent, failure, cancellation and real site-worker offline reload tests.
`model-consent-mobile-browser.py` tests first-visit consent without opting in.
The older guide UI suites deliberately use an explicitly enabled preference
and a worker fixture; they are not model quality/performance evidence.
