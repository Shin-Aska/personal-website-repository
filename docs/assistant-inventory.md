# Guide assistant inventory and retirement boundary

Inspected checkout: `06cbf66842af400ff7d4decbcffe1a11e21560f6`, matching the supplied research commit. The working tree was clean at baseline. No repository `AGENTS.md` was present in the checkout or inspected ancestor directories; the user's supplied instructions apply. No packages, libraries, browsers or models were installed.

## Baseline consumers

All six live browser consumers posted questions to the absolute route `/php/llm.php`. These are independent page integrations, including the inline StarCraft script.

| Guide | Original chain and surfaces | Existing authoritative material | State that must be preserved |
| --- | --- | --- | --- |
| Albion | `walkthroughAiSend` → `callGeminiFunction`; walkthrough chapter assistant and atlas context | `DB`, `QUEST_LOG`, `QUEST_HINTS`; 10 chapters, 33 objectives and 33 hints in the supplied baseline | `albion.questLog.v1`, open quest groups, atlas map/NPC preference; checked objectives are historical reports |
| Ultima VI | `askTheSeer` → `requestGeminiText`; quests, side quests, markers and layers. `generateChronicle` → `callGeminiAPI` → `requestGeminiText` | `gameData`; Seer tone/spoiler settings and General Hints; Chronicle was generative | `ultima6-grand-quest-progress-v1`, `ultima6-side-quest-progress-v1`; original `light` means Gentle |
| Ultima VII | `sendQuestChatMessageForKey` → `callGemini`; quest modal chat | Structured guide data, `OFFLINE_HINTS`, 29 mixed prompt entries, authored `BACKSTORIES` journals | `ultima7-party-plan` is intended membership only. Equipment lore was already retired |
| Al-Qadim | `sendAiMessage` / `sendAiMessageTab` → `callGeminiFunction`; modal and tab Genie | Structured guide data, 19 mixed prompt entries, static atlas annotations | `alqadim.questState.v1`; original tab wrapper temporarily replaced `document.getElementById` across async work |
| Ultima V | `askTheSeer` → `callGeminiAPI`; Seer and guide context | Campaign, side quests, field kit, atlas | `ultima5-campaign-progress-v2`, `ultima5-sidequest-progress-v1`, `ultima5-field-kit-v2` |
| StarCraft BWAPI | `scAiSend` → `scCallGemini`; inline Adjutant chat | Static SCHNAIL, BWAILauncher, Remastered SCM map and troubleshooting sections | No progress storage; ephemeral chat history only |

Original helpers included exponential retries in Albion, Al-Qadim, Ultima VII and StarCraft. No retry or error fallback is allowed to survive migration. Ultima VII journals do not require inference and remain authored content. Ultima VI Chronicle must be an explicitly fictional deterministic composition.

The original proxy `guides/php/llm.php` read `GEMINI_API_KEY`, forwarded JSON through cURL to `generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`, retried failures and wrote temporary rate-limit buckets. No provider endpoint was called during inspection.

## Deployment and cache inspection

The inspection searched the entire checkout, including hidden/ignored files, inline HTML, JS/PHP request wrappers and JSON, for the proxy route, provider hosts, `generateContent`, model runtimes, inference helpers and service-worker/cache APIs. Broader searches for provider names also found static blog articles discussing AI tools; those are prose rather than executable assistant consumers.

- `guides/php/llm.php` is the only tracked proxy copy. There is no checkout-root `php/` directory or equivalent proxy copy under `default/` or `classic/`.
- There are no tracked `.htaccess`, nginx/Apache hosting configurations, deployment workflows, container web-root configuration, Netlify/Vercel routes or guide deployment manifests establishing how `/php/llm.php` maps to this file.
- `readme.md` describes independently hostable HTML/CSS/JavaScript with some PHP, but does not establish the production guide document root.
- `tools/ftp_publisher.py` is a generic uploader. `tools/pytk_publisher_tool.py::_ftp_upload_manifest` constructs article uploads using session-configured default/classic document roots. It does not establish a guide root or a proxy deployment mapping.
- `guides/site.webmanifest` contains icon and appearance metadata only. No service-worker registration or Cache API use was found. Existing ignored `default/cache/` and `classic/cache/` conventions are unrelated server-side article/comment caching.
- StarCraft already sends no-cache meta tags. These do not prove the state of production HTTP/CDN caches.
- Existing non-inference network paths (static annotation JSON, local images and scripts, article comment/image proxies and external ordinary links) are distinct from question processing. External links in guide prose do not get fetched by the assistant.

**Unresolved deployment boundary:** an absolute `/php/llm.php` route may refer to a guide subdomain/root, a rewrite or a separately deployed copy. The repository does not prove which. Local source retirement is not confirmation that the live endpoint, its environment key, copies or cached old clients have been retired. No remote deployment or live endpoint probe was performed.

The deployer must identify the real vhost/document root and any rewrites, locate all deployed copies/consumers, deploy the local browser assets together, retire the actual route, remove its provider credential and invalidate any cached old assistant bundles. Any retained endpoint response must be inert; it must not read question bodies or contact a provider.

## StarCraft migration

The local Adjutant extracts direct text from marked existing HTML sections. `guides/data/assistant/starcraft.json` supplies stable relationship IDs, aliases, authored Gentle/Balanced variants and source locators. It does not duplicate the full setup guide. Fourteen records cover SCHNAIL, BWAILauncher, the Remastered SCM map and the existing BWAPI loading checks. Claims are **extracted**, not independently verified current game/software facts.

The original BWAILauncher prerequisite list says “original or remastered”, while its setup section explicitly requires a separate Brood War 1.16.1 installation. The adapter marks this discrepancy as conflicting and leaves requirements unmodeled; it must not derive a hard compatibility edge from it. Edition-specific map/launcher records identify their editions. Setup order is not a logical prerequisite.

The Adjutant preserves the page navigation and setup links, adds explicit topic/detail/tone controls and uses the shared safe renderer. The existing mismatched SCHNAIL setup anchor is reconciled to `schnail-setup`. It imports no player claims and writes no storage. Arbitrary tactical strategies, live release recommendations and generated creative text are outside this guide's authored coverage.

Original prompt migration: the inline knowledge bullets were redundant with static sections; those sections are canonical. Military styling becomes an authored tone wrapper. Markdown, transcript, model-persona and anti-hallucination prompt instructions are discarded with the provider helper and retry chain.

## Verification status

Final browser and automated measurements belong in `docs/game-assistant.md` and the retained assistant test artifacts. Static inspection alone does not establish the network release gate. The browser harness must block the discovered route/provider **before** interaction and count attempted requests, then repeat loaded dialogues disconnected.

After all six browser call chains were removed, a repeated checkout-wide route/provider/helper search found only the original proxy itself. The local `guides/php/llm.php` was then replaced with a short HTTP 410 JSON tombstone. It does not read input, inspect credentials, make network requests, retry or write cache/rate-limit files. No PHP runtime was available locally, so its syntax/HTTP behavior was inspected statically rather than executed. This local change does not resolve the production deployment boundary described above.

Focused StarCraft browser acceptance used existing Google Chrome 155.0.8059.84 in headless mode at 1280×900 on the Linux workspace. Eleven questions included two after network disconnection, edition rejection, the compatibility conflict, unsafe text, smaller hints, lowering spoiler settings and session reset. Seven additional first-load/error trials delayed the overlay while changing input, topic, reset state, navigation or spoiler level, then verified that each stale send produced no answer; aborted and malformed overlays produced safe local errors. Across these trials, 138 observed requests were static GETs; zero attempted inference requests and zero page errors occurred, and local storage was unchanged. A two-view fixture also verified that raising/lowering the shared policy synchronizes both selectors, hides prior detailed answers and survives refresh. The retained script and sanitized request log are under `guides/tests/assistant/`.
