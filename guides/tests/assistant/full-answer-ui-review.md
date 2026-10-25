# Full-answer UI acceptance review

`full-answer-browser.py` checks the actual production UI and source engine on seven surfaces: Albion, Ultima V, Ultima VI, Ultima VII, Al-Qadim's Counsel tab and Walkthrough pane, and StarCraft. The separate prototype lab is owned/tested independently by the parent task; this script makes no prototype-native-inference claim.

The script uses the existing explicit consent and Worker fixture (`browser_consent_fixture.py` / `browser-consent-fixture.js`). It does not install packages or download a model. It creates a private loopback static server on port 0, permits only its own origin's GET requests without bodies, blocks outside requests and service workers, and shuts down only its own server. No other preview server is stopped.

## Source oracles

The question, expected canonical record ID, and meaningful excerpts are reused unchanged from the existing approved `narrative-all-games-cases.json` fixtures:

| Guide | Question | Canonical source record |
| --- | --- | --- |
| Albion | What is the method for the path to Toronto? | `albion:narrative:toronto-route-method:method` |
| Ultima V | What is the method for the Sandalwood Box? | `ultima5:narrative:sandalwood-method:method` |
| Ultima VI | What is the next step in the Merchants' Circuit? | `ultima6:narrative:merchants-sequence:sequence` |
| Ultima VII | Why was Inamo killed? | `ultima7:narrative:inamo-motive:cause` |
| Al-Qadim, both surfaces | What is the method for getting the Family Sword of Honor? | `alqadim:narrative:ch2_1:method` |
| StarCraft | Summarize SCHNAIL | `starcraft:narrative:schnail-summary:summary` |

Before opening the browser, the existing trusted Node declaration loader and approved StarCraft source snapshot supply the source record. The production `authorize` function must authorize that record at direct and reject it at gentle. An initial successful UI answer containing the fixed excerpts therefore proves actual source detail, rather than merely checking a default literal or removal of a selector.

For each real reply the script verifies the rendered answer decision, fixed excerpts, and actual rendered provenance. Local sources must show the exact indexed file and locator. External sources must show every exact indexed reference label and URL, rather than the source record's synthetic comma-joined aggregate fields. The current UI exposes no public record-ID observer: its previous WeakMap view registry has been removed. The harness does not inject a replacement registry or route modified module code. Canonical record IDs are honestly labeled oracle metadata, and actual visible source attribution is checked. The separate synthetic shared-view check can inspect the real reply returned by `view.send()` and asserts its actual record ID.

## Coverage

Twenty-four grouped acceptance checks cover seven desktop runs at 1280×900, seven phone runs at 390×844, seven lifecycle runs, Ultima VI long-history scrolling, a legacy context/selector fixture, and network/storage/source/server boundaries.

Each desktop run sends five real questions before checking the composer and scrollable chat. Phone runs send again and verify actual hit-testability and unclipped input/send geometry, oldest/newest retained message reachability, and uncompressed cards. Ultima VI adds five more real sends, checks bidirectional mouse-wheel scrolling in the long chat, and captures a representative phone screenshot.

DOM checks reject both visible and hidden help selects, selector labels, help radio groups/options/notes, and response-level badges. Checks repeat after real answers, `smaller hint`, New topic, Clear chat, and guide navigation or modal reopening/context changes. The `smaller hint` command must preserve the same direct-only fixed source facts/provenance; it cannot silently lower the answer or require a removed selector.

The synthetic fixture supplies a detached legacy selector with value gentle and a custom `getContext()` returning gentle, then sends a real direct-only source query through shared `createView`. This checks that legacy context inputs do not override full-answer behavior. It does not add a hidden selector to any production guide.

The report includes before/after storage snapshots, transparent localStorage mutation logs (consent preference writes are explicitly allowed; saved-game writes are not), actual request methods/body presence, page errors, source hashes, screenshot paths, and confirmation that the owned server thread closed. The two screenshots live under the already ignored `intent-prototype/results/full-answer/<tag>/` directory; JSON evidence is written under `evidence/full-answer-browser-<tag>.json`. Existing reports are never overwritten.

## Existing suites and run history

Tests whose intended behavior is to select Nudge/Hint/Full answer through the former UI controls are superseded as UI acceptance tests by the explicit always-full requirement. This does not invalidate backend policy, source authorization, unsupported-premise, edition, or spoiler-level tests; the backend APIs retain their independent contracts. `chat-layout-browser.py` was updated by the parent task to work with the new full-answer-only surface.

- `full-answer-initial` was interrupted after discovering that the old WeakMap observer no longer receives registrations. This was test instrumentation incompatibility, before factual sends, not a production default failure.
- `full-answer-source-ui` was exploratory. It identified two harness mismatches: identical repeated answers at the capped six-turn history window need DOM-replacement completion detection, and multi-source research citations render separate reference labels/URLs rather than aggregate source fields. Both were corrected without changing the fixed factual oracle.
- `full-answer-final` completed 24 checks; 22 passed. All fresh-default facts, both viewport layouts, long Seer scrolling, storage/network/source boundaries, and ordinary reset/reopen behavior tested up to the first failure passed. The new `smaller hint` check found that raw source-record repetition omitted Ultima VI's sequence framing and Ultima VII's explicit different-accounts/no-single-explanation framing. These fixed oracle expectations remain intact pending the parent implementation's repair; this report is preserved as failure evidence.

Final successful run information is appended below once the parent source repair is stable. Screenshot review already confirmed the representative StarCraft surface has no help-level control or badge and retains its useful topic/tone and chat tools; the Seer phone surface retains a usable composer and long-history scroll area.

## Final complete run

`python3 guides/tests/assistant/full-answer-browser.py --tag full-answer-complete` passed **24/24** checks with zero failures. Evidence: `guides/tests/assistant/evidence/full-answer-browser-full-answer-complete.json`. All seven real surfaces returned the fixed direct-only facts immediately and retained them after `smaller hint`, New topic, Clear chat, and reopen/context changes. The repaired narrative repeat preserves the reviewed Seer step frame and Inamo uncertainty frame without changing any oracle.

All seven storage snapshots were unchanged, and transparent storage mutation logs contained only the explicit consent preference key; there were no saved-game progress writes. There were no blocked/external requests or page errors, every intercepted request was a static GET without a body, watched source hashes were unchanged during the run, and the owned loopback server thread closed.

Final representative screenshots are `intent-prototype/results/full-answer/full-answer-complete/ultima6-phone-long.png` and `.../starcraft-desktop.png` (ignored artifacts). Visual inspection confirmed a usable Seer phone composer with the long conversation scroll area, and a complete StarCraft reply with normal topic/tone/chat tools and source citation but no help selector or response-level badge. This remains an approved Worker-fixture UI/source-engine run, not native inference or model quality evidence.
