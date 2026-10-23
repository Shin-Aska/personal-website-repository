# Browser-only guide assistants

Originally implemented against commit `06cbf66842af400ff7d4decbcffe1a11e21560f6` on 20 October 2026. All six guide assistants interpret questions, retrieve facts, evaluate modeled requirements and maintain dialogue in native browser JavaScript. On 23 October the owner approved an opt-in local model for constrained conversational fallback wording across all six pages. The model selects approved sentences; the program still supplies every game fact as authorized guide text or labeled/cited research. There is no server inference, visitor key, account or GPU requirement. Model/runtime parts are self-hosted static files reused from the explicitly approved downloads, not system-installed packages. Enabling chat downloads approximately 162 MB once where browser caching is available; no model worker or large asset starts before consent. Questions stay in the browser.

The factual engine remains a bounded symbolic assistant, not general-purpose generative intelligence. It accepts naturally worded English questions about its explicit relationships and aliases, up to three clearly separated subquestions per message, short conversational follow-ups ("And its effect?", "Where?", "What about X?", "Sorry, I meant X"), typed or button clarifications, and explicit progress reports. It deliberately clarifies or declines unsupported topics, conditions, versions, relationships and ambiguous reports. Every factual sentence it emits is a stored guide record, an overlay record indexing guide text, or a clearly labeled and cited research note (see [Knowledge sources](#knowledge-sources)). It never composes new facts, explanations, verdicts or prerequisites. Research is done at authoring time; visitors' questions never trigger web lookups. There is no fallback to another service.

## Files and integrations

| Area | Implementation |
| --- | --- |
| Shared engine | `guides/js/assistant/engine.js`, `language.js`, `topics.js`, `retrieval.js`, `rules.js`, `policy.js`, `ui.js` |
| Consent and model | `bootstrap.js`, `consent.js`, `model-runtime.js`, `model-worker.js`, `fallback-context.js`, `fallback-guard.js`, `frame-tokens.js` under `guides/js/assistant/`; `guides/local-assistant/profile.json` and `files/` |
| Game adapters | `guides/js/assistant/adapters/{albion,ultima5,ultima6,ultima7,alqadim,starcraft}.js` |
| Small overlays / manifest | `guides/data/assistant/*.json` |
| Existing bridges | `guides/js/{Albion,Ultima5,Ultima6,Ultima7,AlQadim}.js`; inline StarCraft script |
| Existing surfaces | Six guide HTML pages, with small relevant CSS updates |
| Removed assets | Both old prompt JSON files; all six provider helper/request/retry chains |
| Retired local proxy | `guides/php/llm.php`, now an inert HTTP 410 JSON response |
| Tests and evidence | `guides/tests/assistant/` |

The guide remains HTML/CSS/vanilla JavaScript without a mandatory package-manager build. Native module imports pass real lexical data and callbacks from each classic script. The engine does not assume `window.DB`, use executable JSON, execute visitor input, or choose arbitrary URLs/functions. Al-Qadim's two Genie views now have separate explicit DOM references and a shared policy; the temporary asynchronous `document.getElementById` replacement is gone.

Long facts remain in canonical guide objects or marked StarCraft DOM sections. The overlays add aliases, safe labels, authored hint variants, provenance and selected metadata. See [the consumer/deployment inventory](assistant-inventory.md), [the 48-entry prompt migration ledger](assistant-prompt-migration.md), and [Ultima V/VI coverage and state mappings](assistant-ultima-seers.md).

## Interpretation and grounding

The pipeline captures UI context and current progress, parses the message (`language.js`), authorizes individual answer variants at the spoiler ceiling, resolves entities, ranks only supported relationships, evaluates requirements, then renders an answer or a useful clarification/decline. Every fact and alias is authorized before indexing or matching, so nothing above the ceiling can be matched, suggested or labeled.

### Reading English (`language.js`)

`parse(text, { editions })` returns the normalized text, conversational flags and at most three subquestions. Each subquestion has a requested relationship (location, acquisition, use/effect, description, combat, prerequisites, hint), an optional acquisition method (buy, recruit, download), named editions/versions, whether it refers back with a pronoun, and an optional follow-up subject. Message-level flags identify reset, “smaller hint”, a progress report, a hypothetical, a confirmation (“yes”) and a subject correction (“I meant X”). `materialTerms(text, nameTerms, editions)` returns the words that could restrict an answer. Nothing in the parser reads guide data.

Interpretation is ordered rules, not a statistical model:

- **Harmless framing** is removed: greetings, thanks, “any idea”, “do you happen to know”, “can you point me towards”, “I need to get my hands on”, modal verbs, question words and relationship vocabulary. Only listed phrases and words are removed.
- **Restrictions are never framing.** Negation (*not, never, can't, without*), quantities and number words, editions/versions, comparisons/superlatives (*best, cheapest*), time words (*before, after*) and any unrecognized word (*Mars, underwater, free*) remain material. Every material term must occur in the authorized fact text, or that part is declined. Possessives (“Glass Sword's damage”) do not block name matching.
- **Subquestions** are split at `?`, `;`, sentence breaks, or “and/also/but” followed by a new question (“Where can I buy the Dreamshield **and what** does it do?”). Conjoined subjects (“Where is Pistol and Dreamshield?”) stay one question and are clarified. More than three subquestions are refused rather than partially answered.
- **Relationship detection** prefers specific cues: a merchant selling or a price is a purchase; “get to/reach” is travel; “what does X do”, “good for”, “set it up” and “stats” are use/effect; a visitor selling or pawning is unsupported.
- **Progress reports** must be a single unhedged first-person statement (“I have the Pistol”). Questions, quotes, reported speech, uncertainty, hypotheticals and statements inside a longer message never change progress; the last of these says so explicitly.

### Composing answers

Each subquestion runs through the same grounded single-relationship path. That path checks spoiler-authorized records, acquisition method, edition, recruitment kind, the combat-target rule, numbers and material terms, then conflict and requirement handling. A combined reply labels each part with its subject and relationship. It states which parts were not answered and why. Each part keeps its record IDs and sources (including `conflicting` sources), and the combined message carries the **highest spoiler level of any emitted component**. Lowering the ceiling therefore hides the whole message. Identical facts reached by two phrasings are shown once. Example (Albion, Direct):

- “Where can I buy the Pistol and what does it do?” → part 1 declined (the guide does not establish buying the Pistol); part 2 answered from its use record.

Ultima VI stores equipment effects/statistics in its `explanation` record and has no separate use field. Its adapter marks just those records `answers: ['use']`, so “What does the Storm Cloak do?” is answered. No other relationship substitution exists: an acquisition, hint or location record never answers an effect question.

When two subjects are named and only one has the requested relationship, the other name becomes a material term that the fact must contain. “Any idea where Utomo sells swamp boots?” is answered only because the Swamp Boots record says “Sold by Utomo in Yew.”

### Conversation

Each topic context tracks grounded subjects, one pending clarification, the last answer records (`lastRecords`), and the last requested relationships (`frame`).

- **Pronouns and ellipsis.** “And its effect?”, “Where?” and “Who do I buy that from?” use the current subject when exactly one compatible subject exists. If a multi-part reply covered two subjects, “it” is ambiguous and the assistant asks which one. Relative clauses (“the shield *that* blocks…”) are not pronouns.
- **New subject, same question.** “What about X?”, “And X?” and a bare “X?” reuse the previous relationships for the new subject, including every relationship of a multi-part question. Ellipsis also inherits the earlier question's restrictions: after “Where is the pistol on Mars?”, “What about the Dreamshield?” is declined too. Restrictions are inherited only when the earlier subject was resolved, so an unrecognized name is never treated as a restriction.
- **Subject correction.** “Sorry, I meant X” changes the subject and never reports progress. It resolves a pending clarification if X is one of the choices. With trailing text (“…—who do I buy that from?”) it answers that question about X; otherwise it repeats the previous relationships for X. Pending choices keep the original restrictions, so “Where is Pistol and Dreamshield in Albion Online?” → “Dreamshield” is still declined.
- **Descriptive retrieval.** If no name matches, the assistant may suggest subjects whose authorized entry contains every material word and which have the requested relationship (BM25-ranked, at most four). Similar wording never answers by itself. The visitor must choose a subject (button, its name, or “yes” for a single suggestion), and the chosen fact then passes every normal check. Questions with restrictive words, numbers, editions or inherited restrictions get no suggestions, so confirming one cannot silently drop a restriction.
- **State safety.** Topic resets, session resets and UI topic changes clear subjects, pending choices, `lastRecords` and `frame`. Spoiler changes keep invalidating pending choices (stale-choice protection). After a multi-part reply, “I already did that” and “smaller hint” refer to nothing and ask which objective or hint is meant.

Entity names/curated aliases win before conservative typo candidates. Question vocabulary is never treated as a misspelled name. Numeric/version tokens and tokens shorter than four characters are never automatically fuzzed; lengths 4–7 allow one edit, longer tokens at most two.

The weighted inverted index uses BM25-style `k1=1.2`, `b=0.75`; alias/name evidence has greater weight than prose. Scores are not probabilities and never establish identity or the requested relationship by themselves. Buying, recruiting and downloading require explicit acquisition-method metadata; companion combat strengths cannot answer how to defeat that companion.

Examples within Albion coverage (Direct):

- “Any idea where I can find the pistol?”, “Can you point me towards the pistol?” → the Pistol's location.
- “I need to get my hands on a pistol” → its acquisition hint.
- “Where can I buy the Dreamshield and what does it do?” → both parts, separately sourced.
- then “Sorry, I meant the Monster Eye—who do I buy that from?” → Monster Eye purchase; no progress change.
- then “And what does it do?” → clarification: the guide has no use record for the Monster Eye.
- “What does the shield with sleep spores do?” → suggests Dreamshield; “yes” → its use record.
- “Where is Pistoll on Mars?”, “I need a free pistol”, “Where are the two pistols?” → decline.
- “If I had the Dreamshield…”, “I got the pistol, now what?” → no progress assertion.

## Knowledge sources

Answers come from three layers, in order of precedence:

1. **The guide's own records.** Canonical guide objects and marked StarCraft DOM sections, as before.
2. **Topic indexes over guide text** (`topics.js`, overlay `topics`). These cover guide content that previously had no route into the assistant. An overlay topic supplies a title, aliases, the relationships it answers, and keys into facts the adapter extracts from the guide. Its answer is those facts verbatim, joined in order, with every locator in its source and the overlay entry recorded as `authored-index`. A topic can also add a relationship to an existing subject; for example, the Skull Keys gain the guide's "Skull keys fast" tip.
3. **Outside research** (overlay `research`). These are one-to-three-sentence summaries written for this overlay from the cited pages, each with URL, label and check date. Answers begin “Not in this guide — from outside research:”, never get a guide tone wrapper, and show a plain-text citation line (“Outside research (not in this guide): …”) at every spoiler level. When the guide and research both answer the same subject and relationship, the guide wins. Research is not play-tested; only claims tied to the right game on a reliable page were kept.

| Guide | Guide content newly indexed | Research notes |
| --- | --- | --- |
| Albion | Chapter tips (security, Beegle, Rejira, training, money, bandits, Crystal Throwing Axe, Ohl, Bolt-Throwers, blue floor plate, final robots), trade table and trade hints (“where should I sell my loot?”), four magic schools' teachers/reagents, character notes (Direct), location points of interest, creature danger | Dji-Kas curing spells (Heal poisoning/intoxication/blindness, Albion Wiki); antidote drink names (Albion Wiki, effects not described) |
| Ultima V | 20 of 21 Tips (charm/possession, Shadowlord towns, free reagents, sextant, spyglass, moonstones, frigate, food, karma, gems, Jhelom at night, fast travel…), condition topics built from spell entries (poison, healing, death, darkness, magical fields, enemy magic), spell reagents, moongate phases, virtues (town Gentle; dungeon Balanced; mantra and word of power Direct) | Leveling by camping and Lord British's spirit (Ultima Codex); AN ZU wakes one sleeping party member (Ultima Codex quoting the Book of Lore). The charm topic also cites the Ultima Codex Charm page as corroboration. |
| Ultima VI | Shrine bonuses, 19 lore questions (Lord British, Mariah, Selganor), 8 cheats plus a cheat list (the C64 one is tied to the C64 edition) | Leveling by meditating at shrines (Ultima Codex) |
| Ultima VII | Reagent prices with the page's own “best buy”, side-quest givers/locations/rewards (Direct, because they name the quest), creature threat level | Automatic levels and training points (Ultima Codex) |
| Al-Qadim | Chapter summaries (Balanced, safe title until Direct), creature danger | None: no source reliable enough was found |
| StarCraft | The guide's pros/cons comparison of all three options, antivirus and crash troubleshooting, SCHNAIL's internet requirement, example bots, support links | What BWAPI is (BWAPI README) |

### Characters, monsters, items and quests

Every character, monster, item, spell and quest (including side quests) that the guides' data contains is now answerable by name. The test invariant `every-guide-entry-is-answerable` walks each collection and fails if any entry lacks a record:

| Guide | Records | Collections, answerable / entries |
| --- | ---: | --- |
| Albion | 379 | characters 9/9, equipment 11/11, bestiary 5/5, spells 12/12, places 22/22, chapters 10/10, acts 4/4, plus 114 atlas NPCs |
| Ultima V | 485 | companions 15/15, spells 16/16 (AN SANCT withheld), objectives 20/20, side quests 11/11, virtues 8/8, plus 122 named townspeople and 8 service lists |
| Ultima VI | 951 | companions 11/11, equipment 8/8, spells 9/9, dungeons 6/6, quest steps 19/19, side quests 6/6, shrines 8/8, lore 19/19, cheats 8/8, plus 186 atlas NPCs and 76 markers (already covered) |
| Ultima VII | 676 | companions 9/9, equipment 9/9, bestiary 4/4, spells 7/7, main and virtue quests 14/14, side quests 15/15, reagents 8/8, plus 231 townspeople, 28 monster groups, places, interests and clues |
| Al-Qadim | 282 | key items 10/10 and shop items 9/9 (conflicted items withheld), bestiary 11/11 (Nameless One withheld), moves 3/3, shards 8/8, chapters 19/19, plus 9 named characters |

What was added this round, by source:

- **Character stats** (new “stats” relationship: “What are Sira's stats?”, “How strong is Dupre?”, “Can Tom use guns?”):
  - Albion: base/max attributes, combat caps, magic school, firearms, can-leave and origin (Balanced).
  - Ultima V: class, level, STR/INT/DEX (Direct, like its other companion facts).
  - Ultima VI: class, level, attributes (Balanced).
  - Ultima VII: attributes, combat and tags (Gentle).

  Item statistics are still answered from their use/effect records; a character's stats come only from a stats record. Albion does not record firearms use for every character, so “Can Drirr use guns?” declines.
- **Quests:**
  - Albion chapter summaries with key items and stops, and the four acts (Balanced).
  - Ultima V objective locations (Direct) and outcomes (Balanced), side-quest locations (Direct) and rewards (Balanced).
  - Ultima VI side-quest regions/destinations (Direct) and rewards (Balanced).

  Objective and quest names stay behind their safe labels until the tier that already showed them. Ultima V's “recommended before” notes are advisory and were not turned into prerequisites.
- **Monsters:** Albion creature type and EXP; Ultima VII monster, creature and enemy markers, grouped by name (“Where are the cyclops?” → Cyclops Cave; Minoc Cave).
- **NPCs and minor characters:**
  - **Albion** (`AlbionAtlasData.js`): 119 named NPCs and the maps they appear on, at Balanced. The extracted race/class profiles are not used; 159 of 164 read “Terran/Pilot”.
  - **Ultima V** (`Ultima5AtlasData.js` interiors): 122 named residents with role and building, at Direct. Generic guards and one dialogue line recorded as a name were dropped. Healer, blacksmith, barkeeper, innkeeper, magic seller, shipwright, horse seller and guild master lists answer “Where can I find a healer?” at Gentle.
  - **Ultima VII** (`Ultima7Markers.js`): townspeople and monsters at Balanced; places and services (Trainer, Healer…) at Gentle; interests, clues and treasure at Direct. Repeated names are grouped.
  - **Al-Qadim** (`AlQadimAtlasData.js`): actor names are mostly engine identifiers. Only an overlay allowlist of 9 characters whose names also occur in the guide's text is used, answering which atlas worlds they appear in (Direct).

  NPC names that already belong to a character, item, topic or research entry keep their existing records.

**Companion spoiler tiers.**
- **Ultima V:**
  - Class and level are Gentle, and stats too: “Who is Saduj?” → “Saduj: Bard, level 4.”
  - Where to recruit is Balanced.
  - The guide's notes are Direct; Saduj's reveals a betrayal.
  - Every companion's lower-tier answer carries the same pointer to Direct, so none stands out.
- **Ultima VI:** class, role and attributes are Gentle; locations stay Direct.

When nothing visible matches, the reply is identical whether the subject is hidden at a higher setting or absent from the guide. It says it may be uncovered or may need a higher Spoilers setting, which never reveals hidden names. An invariant checks this, along with the uniform Ultima V companion replies.

StarCraft is a setup guide with no characters, monsters or quests, so nothing more applies there. Ultima VI's 17 “Seer context” quest summaries overlap the indexed quest steps and were not added again.

Excluded on purpose: the Ultima V AN SANCT tip, whose effect conflicts with the spell table, and SNES-only Ultima VI spell names that don't match the PC guide. Also excluded are forum-only claims such as “equip the Ankh to level faster” and “magic kills give no experience”.

New relationships that make this content reachable:

- **Counter/cure** (“How do I counter being possessed?”, “cure poison”, “revive a dead companion”, “fix antivirus blocking SCHNAIL”). It is answered by records declaring it, or by an enemy's combat record, since countering an enemy *is* its combat tactic. A companion's strengths still never answer how to counter that companion.
- **Lists.** “What spells are there?”, “Who can join my party?” and “How many chapters are there?” return the titles of the guide's own entries of one kind (companions and characters, spells, items, creatures, virtues, shrines, reagents, shards, chapters, shops) at the current spoiler ceiling, with the count. Nothing beyond the titles is added; the source line says the list is an authored index of guide entries.
- **Overview.** “Tell me everything about the Pistol” (also “all about”, “the full story”) returns one line per relationship the guide records for that subject, verbatim, at the highest spoiler level among them. It names one subject only; several matches become a choice.
- **No verdicts.** “Is it worth buying?” never gets an opinion. The reply opens “The guide gives no verdict on whether that is worth it. What it records: …” and then the stored fact.
- **Pros and cons**, answered only from a guide's own comparison. “Which is better, SCHNAIL or BWAILauncher?” shows each option's listed pros and cons with no verdict. Where no comparison exists (“Pistol or Bolt-Rifle?”), it declines.
- **Where to sell**, only where the guide documents selling: Albion's trade table. “How do I sell the Pistol?” still declines.
- **Lore questions** (“What do trolls lack?”), answered from their single question-and-answer entry.
- **Getting past / out**, reward, threat level, and “what happens in chapter N”.
- **Recruitment advice** (“Should I join him to the party?”, “Is Saduj worth recruiting?”). It is answered from the guide's own assessment of each companion, through records that declare it:

  | Guide | Assessment used |
  | --- | --- |
  | Ultima V | Companion notes (“Do not recruit”, “An essential early recruit”) |
  | Albion | Character notes (“REQUIRED for Kenget Kamulos”, “Leaves mid-game”) |
  | Ultima VI | Companion role line (“The strongest pure fighter”) |
  | Ultima VII | Companion focus and notes (“Will not join if party size is > 5”) |

  Al-Qadim has a single hero, and StarCraft has no characters, so these questions decline there. Spoiler tiers still apply. Ultima V and Albion notes are Direct, and every companion's lower-tier answer carries the same pointer to Direct. Trust and morality judgements (“Can I trust him?”) stay unsupported.

**“Did you mean…?”** When a name matches nothing, the assistant scores it against the proper names visible at the current spoiler level: characters, NPCs, items, monsters, spells and places. Topic words, objective sentences and quests are never suggested. Scoring uses Jaro-Winkler similarity. A candidate must also share the first letter, differ in at most about 30% of its letters (edit distance), have a comparable length, and match the same number of words. Words the visible guide text itself uses (“treasure”, “magic”, “armor”) are treated as real words, not misspelt names.

- **Whole-name match**, scoring at least 0.88 with a 0.04 lead: it answers explicitly as a guess, e.g. “I don't know anything about “Toshixz”. Did you mean Toshi? If so: Bard…”. The rest of the question still applies, so “Who is Toshixz on Mars?” is not answered. A guessed subject can be followed up (“Where is he?”), but never completes an objective.
- **Partial-name match** (“Mario” → De Maria) or close runners-up: these become choice buttons. “Yes” confirms a single suggestion.
- **Older typo matcher:** its silent corrections (“Shamno” → Shamino) are now announced the same way. It also requires the same first letter and ignores words the guide uses, which removed guesses like “love” → Cove.
- **All six guides:** this lives in the shared engine, so it applies everywhere. Tests cover each guide: Ultima VI “Shamnio”/“Storm Clok”, Ultima VII “Spork”, Al-Qadim “Zubakonn”/“Ship Orbb”, and StarCraft “SCHNIAL”/“BWAILuncher” against the live page. A guess is labeled with the name it actually matched, never with another record's placeholder title. A partial runner-up such as “SCHNAIL Discord” does not block a clear whole-name match.
- **Remaining guesses:** a sweep of everyday words leaves name-like guesses such as “London” → Landon, plus choice-only “Batman” → Bradman and “villain” → Emp Village.

In a multi-part message, parts that resolve to the same fact are shown once, without part headers. An unanswered part is reported as “Not answered: “<your words>””, so it is clear which bit was not answered. Leftover filler such as “tell me more” or “anything else?” is dropped instead of being reported.

**Condition statements** such as “Avatar got possessed and is now against the party”, “Iolo is attacking the party” or “I got poisoned” are read as asking for a counter or cure:

- “got/is/became” plus a condition, or “turned against / attacking the party”, never means acquisition.
- Such a statement is never a progress report.
- Without a “?”, “and is now…” continues the sentence instead of starting a second question.

Who is affected doesn't restrict the cure: the Avatar, “the party”, pronouns and companion or character names are not required to appear in the fact. Every other restriction still applies, so “Avatar got possessed on Mars” declines. The companion-name list is built from every spoiler tier on purpose. It only stops the visitor's own words from counting as restrictions in counter/cure questions, and never matches, suggests or shows a record.

A subject's own name never chooses the relationship when the subject lacks the relationship the question asked for. In “How do I use Cure?” the spell's name is not a request to cure something. “How do I <named action>?” (“How do I duplicate items?”) asks how to do it.

### What remains unsupported

The vocabulary is finite and English-only. Not supported:

- “why” questions, opinions or judgements (“Is the pistol worth getting?”, “Is Saduj trustworthy?”)
- rankings and verdicts beyond a guide's own pros/cons
- open-ended “tell me everything”
- “how strong is X”
- relationships with no record (U6 companion effects, Albion Monster Eye use)
- facts that neither the guide nor a cited source covers (most Al-Qadim conditions, Ultima VI/VII status cures)
- unlisted idioms
- more than three subquestions
- generic world knowledge, multi-goal planning, creative generation and invented bug diagnosis

Some phrasing still needs the subject and relationship named plainly. Rules mean wording outside the lists clarifies or declines rather than being guessed.

## Knowledge and prerequisites

Current total record counts (re-measured 21 October 2026, all spoiler tiers) are 379 Albion, 951 Ultima VI, 485 Ultima V, 676 Ultima VII and 282 Al-Qadim; StarCraft builds its records from the live page and had 44 visible at Gentle. Every record has a namespaced ID, source file/object locator, review status and `requires` field. “Extracted” means traceable to this checkout, not independently verified game truth. Authored variants identify their overlay source separately.

Albion's 10 chapters / 33 objectives / 33 hints are reused directly. Its adapter adds selected item, character, location, spell and combat relationships. Objective facts map to `albion:completed:<chapter-id>:<item-id>`; current possession, current party and current location use separate predicates. Legacy chapter/item IDs and source locators remain explicit. Allowlisted map actions call the existing atlas opener from its actual scope.

The pilot's Kenget Kamulos entry requirement is modeled as current Khunag membership, not past recruitment. It is corroborated by [the walkthrough's complete-guide section](https://rpggamers.com/walkthrough/albion-walkthrough) and [transcribed original game dialogue, entry 65](https://albion.wiki.gg/wiki/Map_texts_2). Source corroboration is not a new in-game execution test. The paid-guide and independent coastline alternatives toward Toronto are also corroborated in the walkthrough; no extra prerequisite is invented for them. Verification date, edition, locators and limits are saved in the Albion overlay.

The current game graph is intentionally small. Other adapters use `requires:null` where requirements are unmodeled. Checklist sequence never becomes a dependency. `all:[]` explicitly means no modeled requirements, distinct from `null`. Typed `all`/`any`/`not` expressions use three-valued logic; unknown never satisfies a negative requirement. Backward evaluation memoizes facts, detects cycles, and stops at depth 20 or 200 visited nodes. Returned checks distinguish known blockers, unknown checks and negative conditions; a satisfied OR alternative suppresses irrelevant failed alternatives. Diagnostics state observable checks and admit when the model cannot explain a failure.

Conflicts are quarantined instead of made confident facts or hard edges. Examples include Albion's inconsistent optional XP total and Maini NPC spellings; Ultima V spell/cache claims; Ultima VII quest sequences; several Al-Qadim item routes; and StarCraft's contradictory BWAILauncher compatibility statements. The migration ledger records extra old-prompt facts without executing their obsolete model/style instructions or silently promoting them to verified knowledge.

## Progress, dialogue and spoilers

All existing progress storage formats and migrations remain intact:

`albion.questLog.v1`, `ultima6-grand-quest-progress-v1`, `ultima6-side-quest-progress-v1`, `ultima5-campaign-progress-v2`, `ultima5-sidequest-progress-v1`, `ultima5-field-kit-v2`, `alqadim.questState.v1`, and `ultima7-party-plan`.

Only checked known legacy objectives produce positive historical reports. False, unchecked, missing and malformed values are unknown. Historical acquisition does not establish possession. The Ultima VII party plan never establishes actual membership. Clear corrections override stale evidence for the matching predicate during this session, with source/revision/temporal metadata and acknowledgement. Compound, hypothetical, quoted, uncertain or temporally qualified statements do not silently become assertions. Corrections invalidate dependent recommendations and pending actions. Detailed claims cap at 64; compact invalidation markers remain for known predicates after detailed eviction so a rejected checkbox cannot reappear as evidence.

There are at most eight dialogue contexts per game, twelve messages per context, six grounded entities, one pending clarification, one last action, one relationship frame (up to three relationships) and the record IDs of the last reply. Rendered history is bounded too. Topic reset clears the current conversation; session reset clears all dialogue and session claims. Nothing in assistant processing writes legacy progress. To synchronize the guide, use its existing named objective checkbox explicitly; chat never applies a silent saved-progress change.

New controls default to Gentle. Existing Ultima VI `light` maps to Gentle; Balanced and Direct remain separate from persona. A smaller hint selects a gentler authored variant of the same answer, or declines if none exists. No answer is made Gentle by truncating Direct prose. Names, aliases, snippets, choices, source presentation and action labels are filtered before indexing/rendering. Lowering the ceiling hides earlier higher-detail messages; hidden answer text is not left in accessible labels. U6 and U7 General Hints and modal headings use the same policy. Existing full walkthroughs remain deliberate full-detail guide surfaces; assistant map actions require Direct and call only allowlisted callbacks.

Tone wrappers are authored. They do not change numbers, facts, source uncertainty or rule results. User messages and retrieved text render with `textContent`; UI structure is controlled DOM. Keyboard sending, focus restoration, screen-reader announcements and narrow viewports are retained. Mobile Genie overflow and a legacy flex layout conflict in shared message rendering were corrected during visual review.

## Help levels and the shared view

The spoiler ceiling is presented to visitors as a help level: **Nudge** (`gentle`), **Hint** (`balanced`) and **Full answer** (`direct`). Only the names changed; authorization, history filtering and the shared ceiling across views are as described above. `ui.js` renders one control set for every guide (context line, help toggle, New topic, Clear chat) and the conversation; `guides/css/assistant.css` styles it, and each guide only sets its `--assistant-*` colours. The page's own select is kept hidden as the source of truth. Ultima VI shows its step hint and conversation in one view; Ultima VII shows its quest hint as a card above the conversation. Details, the Albion “i just started, what to do here?” fix and the test changes are in `docs/assistant-handoff.md` (“Help levels and one shared layout”).

### Context-aware first unticked step (23 October 2026)

Subjectless requests such as `what now?`, `I'm stuck`, `hint` and the exact owner message `i just started, what to do here?` now select the first unticked checkbox in the open supported section. The answer starts `First unticked step here (2 of 5 done):`, quotes that step's authorized Nudge / Hint / Full answer text, and states `Checklist order is not a prerequisite.` Other unfinished steps appear as choice chips in checklist order, using only authorized labels. Selecting a chip asks for that step; it does not complete it. Existing authorized chapter map buttons remain available. Explicit named questions and material restrictions retain the ordinary grounded path; a chapter selection cannot erase `on Mars`, an edition or a number.

The adapters attach an explicit ordered `checklist` array of `{recordId, completionFact}` references to context hint records, copied by `policy.authorize`. Array order comes from the actual guide checkbox collections, independently of retrieval ranking or record-array order. Albion uses each chapter's `QUEST_LOG.items`; Ultima VI's overview uses its quest sections, while an open section or side quest has one completion checkbox (its walkthrough sentences are not separate checkboxes). Al-Qadim uses required objectives followed by optional objectives, matching its page; even conflict-withheld objectives keep their position as references. Selection never jumps over an unavailable first step to claim a later visible one is first.

Counts and selection read one fresh `getProgress` checkbox-report snapshot, counting only strict `true` reports for the section's known facts. Session-only chat corrections do not tick saved checkboxes and do not affect this count or selection; their evidence behavior elsewhere is unchanged. Missing reports count as unticked for this UI selection, without establishing negative prerequisite facts. All-ticked sections acknowledge the checkmarks as historical reports, with no claim that the player finished the game goal. A failed progress callback produces an honest unavailable-progress clarification. Chat writes no storage and changes no checklist format.

**Limits and owner decisions.** Al-Qadim has individual objective text only at Full answer. At Nudge and Hint it keeps the authorized chapter hint under `A step-specific hint is not available at this help level. Section hint:`, with the checkbox count; it does not present that chapter hint as a quotation for the first step. A conflict-withheld first objective likewise retains a labelled section fallback. A hidden and an absent first-step record produce identical fallback replies. No new hint prose or game facts were authored. With no selected section or conversational subject, the owner approved `Open a chapter, quest step or objective, or name a subject, so I can offer a hint.` The owner chose to **leave Ultima V unchanged** after discussing context from an objective's Ask the Seer button. Ultima VII and StarCraft have no new checklist selection; their existing context hints remain.

**Regressions.** `contextual-checklist.test.mjs` adds 34 cases: the exact messages, none/some/all ticked, out-of-order completion, shuffled retrieval records, current checkbox changes, chat-only claims, authorized text at every level, lower-level hidden names, missing/hidden equivalence, conflicts, optional objectives, U6 section versus overview counts, more than six remaining chips, restrictions, named questions, stale chips, history filtering, map actions and unavailable progress. `contextual-checklist-browser.py` exercises the real Albion, U6 and Al-Qadim controls, saved checkbox imports, actual checkbox changes, choice clicks, offline replies, source lines, history filtering and unchanged saved values after chat.

Intentional expectation changes carry notes: `ow-albion-01`…`03` now answer the first unticked step instead of only offering choices; `ow-albion-04` expects the owner-approved no-section wording; `sq-aq-113` quotes only the first objective instead of the whole chapter (later steps remain chips). The original runner's stale-choice invariant and Albion browser opener check now expect an answer with alternative chips, preserving their stale-choice and source/privacy checks. All other prior fixture expectations are retained.

Final checks pass: **203/203 original, 1058/1058 English, 874/874 standalone**, both page-fact checkers and **all 15 browser suites** (336 English browser checks, 16 new checklist UI checks). Production module and overlay hashes were unchanged during the final run. The U6 UI fixture seeds consecutive saved completions because the existing page journal removes ticks after a gap on load; that page behavior was preserved, and nonconsecutive raw reports remain covered by the direct engine tests. Latest gzip estimates are 73.4–80.5 KiB for engine plus adapter and 84.0–94.2 KiB including overlay, still above the owner's accepted soft target. Logs and source audit are at `/tmp/codex-context-checklist`, and UI evidence is under `guides/tests/assistant/evidence/contextual-checklist-*`. No install, history/deployment action or saved-progress format change was made.

## Isolated SmolLM2 conversational fallback experiment (23 October 2026)

Historical trial record: the later consent-based integration section supersedes
its trial-only status. Earlier unrestricted outputs remain recorded failures.

The owner authorized a new trial of SmolLM2-135M-Instruct q8 as a fast writer for
short conversational follow-ups using recent chat and a few authorized source
passages. This is isolated in `guides/tests/assistant/fallback-pilot`; no live
guide imports it and the deterministic assistant is unchanged. The owner
separately approved the nine pinned model/runtime files (161.8 MB total), which
were hash-verified and are ignored by Git. No packages or system-wide components
were installed. The CPU-WASM trial uses Transformers.js 3.8.1 and a worker, with
remote models/CDNs disabled during inference, external network blocking, and no
saved-progress API.

Recent history and source records are filtered and reauthorized at the current
help level. A later failed subject cannot restore an old answer as source
context. Missing or conflicting sources are withheld; record text is never
truncated to erase restrictions. The raw model reply is explicitly labelled
experimental/unverified. Mechanical exact-quote and citation checks are recorded
but do not claim to verify arbitrary generated prose.

The first three calibration cases exposed repetition with JSON context and
invented facts with shorter plain/conversational prompts. At the owner's
suggestion a strict variant explicitly prohibited unstated appearance,
personality, location and cause details. Manual source-based review on the same
26 evaluation cases found **18 unsupported replies with the conversational
prompt, 12 with the strict prompt**; useful-safe replies were **1 and 2**,
respectively. Remaining replies were echoes, evasions or quotation/citation
failures. Neither variant emitted a source citation in those 26 replies. One
case was an already-supported engine answer used as a diagnostic control, and
the stricter prompt was written after seeing the initial results, so these are
regression observations by the implementer rather than an independent estimate.

The strict version avoided blue eyes/clothing inventions in the exact Ariana
calibration question but did not answer it usefully; it still invented an orb
engine, motives and a Mars mission elsewhere. Its measured median first text was
**1.46 s**, median completion **2.48 s**, p95 completion **4.29 s** on the tested
desktop. These exclude initial download/loading, are decoded-text rather than
physical-paint measurements, and are not mobile guarantees. All runs passed
local-only request, offline-after-load, unchanged-storage and unchanged-production
source-hash checks. Ten pilot context tests cover its packet boundaries.

The current conclusion is **not accepted for live factual fallback**. The
experiment and its approved assets remain inspectable for further discussion.
Exact prompts, every raw reply, sources, settings, timing and paired review are
in `guides/tests/assistant/fallback-pilot/RESULTS.md` and `evidence/`. This records
an experimental result, not a new production answer behavior.

Final verification: original 203/203, English 1058/1058, standalone 874/874,
pilot context 10/10 and both page-fact checks pass. Eleven of fifteen browser
suites pass against the raw current site. Four existing suites conflict with the
separate offline-cache bootstrap's rewritten/delayed/failure requests and added
`_swcheck` / `_swv` parameters; all four pass unchanged under a temporary
read-only response transform that omits only `offline.js`. No application file or
fixture was changed to bypass those failures. This is assistant isolation
evidence, not a claim that the current cache-plus-guide integration is all green.
The failures, reruns and precise transform are retained in
`/tmp/smollm2-fallback-checks`; `assistant-handoff.md` identifies the affected suites.

### Explicit current topic and fallback status (owner-approved trial)

The owner then approved a separate `topic` variant within the isolated pilot.
The program supplies an authorized current-topic label and says the main engine
could not answer; it does not falsely say no related text exists. Visible engine
history and authorized aliases determine the prototype's topic. A named subject
replaces older context; recognizable follow-ups can retain it across a decline.
Unknown/ambiguous new subjects, unrelated turns, reset and hidden history prevent
stale context from returning. Model-generated text never becomes topic state.
Only the active exchange and authorized source passages are forwarded.

Without a clear sourced connection, the program returns "I don't have an answer
for that in this guide." with no inference. Supported engine replies also bypass
the model. Each result explicitly distinguishes `model`, `unknown` and `engine`;
fixed replies are never scored as model successes. The alias/pronoun/subject
patterns and weather-word exclusion are a limited heuristic, not semantic
understanding. Connected wording without a recognized alias/pronoun can be
rejected ("Why are there three missiles?"); unfamiliar unrelated wording can
still slip through. This is not a production topic-routing contract.

All 29 earlier cases plus ten targeted cases were tested. Final routing was
23 model generations, 15 fixed unknown replies and one engine control. On the
original 26 evaluation questions, 17 invoked the model: source-based manual
review found **10 unsupported / 7 nonanswer-or-format failures / zero useful-safe**.
Eight received the fixed unknown reply and one used the engine. On those same
17 questions, the earlier strict model prompt had 7 unsupported and 10 nonanswer
or format failures. Changing routing, history selection and the prompt together
does not isolate the label's effect. These previously seen/targeted questions
are regression evidence, not blind accuracy. No generated reply cited a source.

Correct explicit topics did not prevent hallucination: Ariana's hair supposedly
makes her look like a baby, Iolo acquired Aesir lore and invented skills, and the
Ship Orb acquired engines and hull mechanics. Across all 23 actual generations,
first decoded text median was **1.67 s**, completion median **3.29 s**, p95
completion **4.69 s**; model preparation was 0.92 s on loopback. These retain the
same desktop/load/paint limitations above. The model remains **unaccepted for a
live factual fallback**. No production assistant behavior or progress format
changed, and the approved existing assets were reused without new downloads.

Initial topic evidence is retained as `topic-initial-all-*` (before correcting
capitalized-common-word and "I'm" false positives); the final complete rerun is
`topic-all-*`. Exact packets/raw text, per-case verdicts and earlier output
comparisons are in `fallback-pilot/evidence/topic-source-review.json` and
`topic-all-report.json`; `RESULTS.md` explains methods and limits. Thirty pilot
checks and the existing 874 standalone checks pass (**904/904 combined**), along
with freshly rerun original **203/203**, English **1058/1058** and both page-fact
checks. Both topic browser runs verified local-only requests, offline repeats,
unchanged storage/production hashes and no page errors. The fixed reply was
also checked before model loading. Production browser suites were not rerun
for this isolated change; the earlier cache-related failures remain recorded.

### Enforced conversational frame experiment (owner approved)

The owner clarified that the fallback should soften unsupported conversation
while preserving the factual engine's authority, then approved implementation.
The new isolated `guarded` variant assigns a reason/detail/rephrase category
when the engine cannot answer. Three authored sentences per category acknowledge
the limit or introduce the guide wording. They say no sourced answer was
produced here, without asserting that the whole guide lacks a missed answer.
Supported engine answers, including an existing sourced reason, bypass it.
Progress commands receive a fixed capability reply and never change storage.

`guarded.js` validates complete conversational sentences against a private
allowlist; it never extracts a harmless prefix from a longer invented answer.
Exact full authorized source excerpts and citations are appended by the program.
Missing/stale current context rejects an in-flight reply and all its old quotes.
The trial's primary reply never streams raw model text; raw output remains in
collapsed experimental-review details.

A freely generated guarded run supplied **zero approved frames in 26 attempts**;
the program substituted all of them. Those raw outputs remain as
`guarded-free-all-*`, not counted as model successes. The final worker adds a
finite-token constraint using the existing Transformers.js logits processor.
Only tokens that can complete an approved sentence retain their model scores;
EOS is available at a completed frame. Tokenization must round-trip exactly,
and the complete-output validator remains. No new assets/dependencies were
downloaded or installed. Earlier unguarded prompt styles retain their settings.

Both guarded runs used the same **45 packets** (39 earlier plus six new targeted
cases). Final routes were **26 model selections, 15 fixed unknown replies, two
fixed progress replies and two engine controls**. All 26 model selections
satisfied the closed contract, choosing seven distinct sentences. For Ariana,
the selected sentence was `I can show you the relevant passage, but I don't have
a sourced reason to add.` followed only by the existing exact description and
its source. No model-authored game claim is permitted.

This establishes **contract compliance by construction**, not improved language
understanding, factual accuracy or arbitrary hallucination detection. The model
is a finite phrase selector (nine authored sentences total), and a deterministic
sentence would avoid its latency. The topic router can still miss connections
or attach unfamiliar unrelated wording; source truth is not validated by the
token mask. Unrestricted factual generation remains rejected. Production
integration and runtime-failure handling have not been built or approved.

Across 26 selections, median first decoded text was **1.09 s**, complete **1.84 s**,
p95 complete **1.98 s**; model preparation 0.96 s on loopback. Prompts were
190–258 tokens, outputs 9–20 including EOS; the guarded cap is the longest frame
plus EOS, with no truncated output. Same desktop/download/paint limitations
apply. Forty-five browser cases passed reply construction, no raw primary
streaming, collapsed raw details, external-request blocking, offline-repeat,
unchanged storage/production hash and page-error checks. All **59 pilot tests**,
original **203/203**, English **1058/1058**, standalone **874/874** and both page
facts pass (**933/933** combined standalone/pilot). Production browser suites
were not repeated for this isolated change; earlier cache failures remain noted.
Full raw/displayed evidence is in `fallback-pilot/evidence/guarded-all-report.json`,
contract review and limitations in `guarded-contract-review.json`, and tested
pilot file hashes in `guarded-source-hashes.json`. No live guide changed.

## Consent-based model integration in all six guides (23 October, owner approved)

The owner explicitly approved connecting the guarded model to every game chat,
then changed automatic startup to first-visit opt-in and approved that flow.
This supersedes the earlier trial-only boundary. The integration is in the local
working tree; nothing has been committed, pushed or deployed.

**Visitor flow.** Every guide loads `assistant-consent.css` and `bootstrap.js`
from its head. Before a choice, chat, its dedicated navigation and generated
Hint/Seer/Sage openers are hidden. A native dialog explains that questions are
processed on the device and that enabling chat downloads approximately 162 MB.
Enable chat starts downloading/preparing automatically; chat stays unavailable
until the model is ready. Keep chat off hides it and leaves guide/checklist
features available. The always-accessible Assistant settings button can enable,
disable or Reset choice. Disabling an active U5 counsel surface restores its
Overview; U6 closes its modal/scroll lock; U7 closes only a Sage panel, preserving
the shared authored-journal dialog. Other non-chat tools remain intact.

**Persistence and privacy.** `guide-assistant.preference.v1` stores only schema,
choice and model identity in localStorage. It is shared across the six guides on
one origin and synchronized between open tabs. Enabled visits automatically
prepare the configured model; an off choice remains off across reloads and model
updates. A different model identity asks enabled visitors again. Reset choice
removes that preference, terminates the worker and clears in-memory chat; it
leaves downloaded parts and saved game progress intact. Blocked preference
storage fails safely and cannot enable a model implicitly. No questions,
conversations or progress are sent to an inference service or written to the
model cache. Only static same-origin files are requested.

**Model configuration and files.** `guides/local-assistant/profile.json` is the
single model/runtime profile used by every page: identity, revision, dtype,
input limit and verified file mapping. The existing owner-approved nine pinned
SmolLM2-135M q8 / Transformers.js 3.8.1 assets were repackaged locally into 18
content-addressed parts (at most 16 MiB each), totaling **161,786,625 bytes**.
No package installation or new network download was needed. Parts are under
`guides/local-assistant/files/`; include that directory and the profile when
publishing. `prepare-assets.py` checks and packages existing approved files;
its `--source`, `--id` and `--label` options prepare a future compatible profile.
A different inference backend still needs an adapter. See that folder's README.

The worker checks each part's size and SHA-256, reconstructs the original model
and runtime bytes, and uses CPU WASM with remote model/CDN access disabled.
`guide-assistant-model-files-v1` is a separate hash-keyed cache shared by the
six pages. Small profile metadata has its own offline cache. These files are
outside the guide-reading worker's 64 MB budget; the guide manifest/version was
regenerated for changed JS/CSS assets. HTML keeps the existing reader revalidation path. The original cache implementation was
not changed. Cache eviction/quota restrictions can require another download;
when caching is unavailable the prepared model can still run in memory.

**Shared answer path.** `engine.answer()` stays synchronous and unchanged in its
factual behavior. The shared view uses `answerAsync()`: normal sourced answers,
choices, actions, checklists, reports, multipart requests and protected declines
stay on the engine path. Eligible unsupported descriptive reasons/details,
mechanisms and rephrasing can use `fallback-context.js` plus `fallback-guard.js`.
Past-event presuppositions, guide-only/edition/material restrictions and explicit
conflicts retain core replies. A past-event decline's short follow-up also stays
protected. This prevents related identity/tutorial text from appearing to confirm
an unsupported event (Inamo / Zubin regressions). Existing negative expectations
were preserved, not weakened.

The model still only scores finite approved frames (three per category). The
program quotes the full authorized passage and the UI renders its sources;
locators remain hidden below Full answer. No model-written game fact is allowed.
A complete-frame validator rejects any extra prose; model generation errors or
a reply timeout use an approved default. Startup failures keep chat hidden and
provide Retry / Keep chat off. There is no network inference fallback.
Per-context fallback history clears on topic/context/session changes. Replies
pending across a help-level change, topic reset, consent revocation or another
question are discarded; hidden history is never forwarded as visible context.
Chat continues to write no saved-progress fields or storage formats.

**Verification.** All **17 browser suites** pass: the existing 15 guide suites,
new real-model `model-consent-browser.py` **105/105**, and new first-visit mobile
`model-consent-mobile-browser.py` **18/18**. The real suite uses native workers,
actual model parts and inference in all six games, with no worker fixture. It
checks no model/worker download before consent, remembered off/enabled choices,
no repeated part download between guides, sourced engine answers bypassing the
model, real guarded follow-ups, unchanged saved storage, pending-answer privacy,
disable/re-enable from active chat, cross-tab changes, model identity changes,
cancellation, corrupt-file rejection/retry and a real service-worker offline
Ultima VI reload followed by actual inference. The separate cache regression
also verifies real model loading and offline assistant use in Ultima VII. There are no page errors or
question-bearing requests. Mobile checks use 390×844 and download no model.

The older source/UI suites now explicitly seed the enabled preference and use
`browser-consent-fixture.js` for only the assistant worker. They isolate the
site-cache bootstrap and block service workers so their deliberate resource
failure/delay hooks and static-query assertions remain meaningful. Their answer
and negative expectations are unchanged. This resolves the earlier four
harness/cache conflicts; it is not a claim that those suites measured real
neural behavior or memory. Real inference and cache interoperability are covered
separately by the new suite. Legacy performance numbers cover the symbolic
engine/view with this fixture, not model RAM/loading or mobile hardware.

Original **203/203**, English **1058/1058**, standalone **898/898** (874 existing
plus 24 new integration checks), both page-fact checkers, and **59/59** retained
pilot checks pass (**957/957** combined standalone/pilot). Logs/status are at
`/tmp/assistant-integration-checks`; retained reports/screenshots are
`guides/tests/assistant/evidence/model-consent-*`. The 26 offline-manifest/reading regression tests also pass, including the
real Ultima VII assistant with explicit consent and a cached model after offline
reload. Neural RAM and non-Chrome/mobile hardware performance remain unmeasured. The model remains a constrained phrase
selector; none of the earlier free-form failures became factual-generation
successes.

## Integration cleanup (23 October, owner approved)

The owner approved cleanup and clarified that the location question concerned
model files. `guides/local-assistant/` remains the shared production model home,
with one `profile.json` for all six guides. Its README now maps the configuration,
payloads and local packager; `guides/js/assistant/README.md` maps the live code.
The retained trial README clearly points to production. Original ignored trial
downloads and all experimental failure evidence remain intact.

The local packager adds read-only `--verify-only`: verify every shipped part's
path, size and SHA-256, model/runtime references and aggregate bytes without the
pilot or any network access. Packaging refuses corrupt existing parts instead
of silently leaving them behind, and explicit integrity checks remain active
with optimized Python. Failed source/part checks do not rewrite the profile.
These are maintenance-tool changes; no live answer/consent behavior, settings
placement, progress storage or model configuration changed.

All 18 shipped parts verify (161,786,625 bytes), including optimized Python.
Nine isolated packaging checks, original **203/203**, English **1058/1058**,
both page-fact checkers and **957/957** standalone/pilot checks pass.
Live modules, CSS, six pages and profile retain their full-acceptance hashes;
the preceding 17 browser suites remain the runtime verification. Cleanup logs
are in `/tmp/assistant-cleanup-checks`; nothing installed, downloaded, committed
or deployed.

Screenshot cleanup (23 October, owner approved): the 38 generated assistant-test
PNGs were removed (8,113,991 bytes). Test scripts and all text/JSON results remain;
browser suites can regenerate visual evidence. The three screenshot output
directories now ignore PNGs in Git. Earlier screenshot references describe the
historical runs; those images are no longer retained. Live behavior is unchanged.

## Offline status redesign and default-only prefetch (23 October, local only)

The owner approved bounded prefetch on the default site and a redesigned offline
status on both default and guides, explicitly retaining default's light/dark
themes. The download complaint was withdrawn as a slow download; no guide model
or assistant change followed. The guide worker, factual answers, consent flow,
model files and saved-progress behavior remain unchanged.

Both loaders use new `css/offline.css` stylesheets for a compact outlined status
pill, maintaining exact messages and polite live-region semantics. Default uses
its existing `--text-color` / `--bg-color` theme variables and changes with the
theme while open. Guides inherit page colors and leave room for Assistant
settings at mobile widths. Reduced motion and printing are handled. A 400 ms
saving-label delay avoids flicker when a cached visit completes quickly.

Only default prepares likely same-site HTML links on deliberate hover/focus and
up to two visible Blog articles when idle. It starts after saving the current
visit, caps unique destinations at three per document and runs one job at a
time with two queued. Data Saver/2G, hidden tabs and offline state suppress new
work where signals exist. The separate speculative cache caps at two pages /
4 MiB and fetches public HTML with direct verified CSS/scripts only; no execution,
images, video or model downloads. A preparation younger than 30 seconds can serve
immediately while revalidating, if core dependencies remain and no newer release
is known. This permits up to 30 seconds of prepared HTML age. Expired/unsafe/
unversioned/invalid preparations use normal fresh navigation. Guides do not
prefetch and Classic is unchanged. Full rules: `docs/offline-reading.md`.

Cache/manifest/publisher checks pass **49/49**, including 15 new real-worker
prefetch/theme regressions. Negatives cover unsafe/private URLs, corruption,
budgets, Data Saver/2G, expiry/new release, guide isolation and unsaved media.
The old shared-copy assertion intentionally checks the common reading core and
default-only extension rather than identical files; its code comment records
the reason. Guide fixtures serve the actual guide worker. No answer fixture or
negative was weakened. Real-page checks cover both default themes, actual Blog →
Mobile Gaming 2026 card navigation and all six guide badge/settings layouts at
320 px. This is Chrome/local evidence, not a production speed guarantee.

The nine pending runtime files and production-specific partial metadata are
tracked in `docs/default-prefetch-status-upload.md`; frozen package:
`/tmp/orilla-prefetch-release-20261023T130417Z`. Only five asset entries change
in verified live manifests; preserved production CRLF hashes remain intact.
Local manifests still describe the checkout. Compared with the preceding frozen
publication, 128 of 135 runtime files are unchanged, seven cache files changed
and two CSS files are new. Evidence is under `/tmp/default-prefetch-checks`.
This round has **not been uploaded**, committed or pushed. Tests/docs/tools,
screenshots, model parts, Classic and unrelated paths are excluded from upload.

Final rerun passes original **203/203**, English **1058/1058**, combined standalone
and retained pilot **957/957**, both page-fact checkers and all **17 guide browser
suites**, including real-model inference/offline use and mobile consent. Runtime
hashes stayed frozen. The regression servers were closed, regenerated repository
screenshots removed, all nine package hashes/manifest references verified and
`git diff --check` passed. Final record:
`/tmp/default-prefetch-checks/acceptance.json`; no publication occurred.

## Model transfer progress (23 October, owner approved; local only)

All six guides now show downloaded MB / required MB and an estimated download
speed in their shared loading dialog. The new `model-download.js` streams missing
files into an expected-size buffer, formats decimal MB (1,000,000 bytes) and
accounts separately for verified cache bytes. The worker verifies saved parts
first so it knows the actual required download. Partial cache hits reduce that
total and are labeled already saved; fully cached loads show saved-file loading
without pretending a download occurred. Overall progress still includes cached
and received bytes, with an accessible name on the progress bar.

Updates occur every 500 ms during fetch/read and at stage/file boundaries. Speed
is average decoded response bytes over active fetch/read time, including waits
and stalls but excluding cache reads, hashing and writes between transfers. It
appears only after some bytes and at least 500 ms; before that the text says it
is estimating. Slow transfers use KB/s; preparation clears the rate. This is an
estimated browser transfer rate, affected by HTTP cache/encoding, not internet
capacity or completion-time prediction. Example:
`Downloaded 45.2 MB / 161.8 MB · Estimated speed: 1.8 MB/s`.

Size and SHA-256 checks still gate every file, including streamed files; corrupt,
short, long and interrupted responses cannot enable chat. Runtime metrics reset
on stop, failure/retry and new starts, and terminated worker updates are ignored.
The same consent/privacy gate, model/profile, cache keys, factual engine and game
progress formats remain. No extra downloads, inference service or package was
added. Existing answer fixtures and negatives are unchanged.

New unit suite `model-download.test.mjs` has ten tests for streaming/error paths,
counter/rate semantics, cached-only loads, display units and runtime resets.
New `model-download-browser.py` has 14 checks using the actual worker and small
streamed local fixture files with a stub runtime; it does not test neural quality.
It checks progress before a whole part completes, cache accounting, mobile fit,
accessible progress, preparation, corrupt-file failure/retry and storage.
The existing real-model suite separately retains actual inference/offline checks.

The pending partial upload now combines this work with the preceding prefetch /
status changes: **13 files, 364,288 bytes**, tracked in
`docs/default-prefetch-status-upload.md`. Its new package is
`/tmp/orilla-progress-release-20261023T132101Z`, superseding the nine-file package;
live-baseline metadata changes only the nine uploaded asset entries. No model
parts, tests, screenshots, docs, Classic or unrelated files are included.
Evidence is in `/tmp/guide-download-checks`. No upload, commit or push occurred.

Final rerun passes original **203/203**, English **1058/1058**, standalone plus
pilot **967/967**, both page-fact checkers, all **18 browser suites** (new streamed
fixture checks **14/14**, existing real-model checks **105/105**) and cache /
manifest / publisher **49/49**. Runtime hashes remained frozen. All 13 package
files and manifest references verify; `git diff --check` passes. Owned regression
servers were closed and regenerated repository screenshots removed. Final record:
`/tmp/guide-download-checks/acceptance.json`.

## Publication and first-visit cache correction (23 October)

The owner explicitly authorized publishing the latest changes and then committing
the completed work; they will push to GitLab/GitHub themselves. The 13 runtime /
production-metadata files were published after backup and verified by FTP hashes
and HTTPS. A live check found the original `offline.js?v=2` still served from
Cloudflare with a one-year cache lifetime, so a fresh uncontrolled visit could
execute the older bootstrap. All 59 default and seven guide root HTML pages now
request `offline.js?v=3`; the local article template does too. Comparing each page
with the earlier frozen publication proves that its loader URL is the only new
change. Both canonical new loaders return current bytes and all 66 public pages
reference them. Routine non-bootstrap assets retain worker hash versioning.

The final upload scope is **79 files** (13 runtime/metadata plus 66 entry pages),
all backed up and FTP-hash verified, with no directory mirroring or deletion of
unrelated remote files. Classic, model parts, tests, screenshots and docs/tools
were excluded. Exact scope/evidence:
`docs/default-prefetch-status-upload.md` and
`/tmp/orilla-progress-release-20261023T132101Z` (`loader-v3/` for the page follow-up).
Local manifests describe checkout bytes; published manifests continue preserving
untouched production CRLF assets.

After this correction, original **203/203**, English **1058/1058**, standalone /
pilot **967/967**, both page-fact checks and all **18 browser suites** pass again.
Cache/manifest/publisher acceptance is **50/50**, including a simulated stale
`?v=2` first-visit response for both scopes. The hook fixture intentionally expects
`?v=3` and documents why. An initial default-only theme fixture was corrected to
the shared fixture for the guide scope without weakening assertions. Six publisher
UI tests also pass. Logs are under `/tmp/guide-download-checks`.

Root `.gitattributes` marks the shipped `.bin` parts binary for the authorized
commit, preserving exact bytes across platforms. All 18 staged parts match the
profile hashes; original trial downloads and generated screenshots remain outside
Git. No factual engine, policy, model/profile, consent or saved-progress behavior
changed during publication. No push was made.

Final live checks pass: **36** real-model/six-guide checks, **7** strict main-site
smoke checks, **17** main/guide-hub offline checks and **7** prefetch/theme checks.
They observe actual streamed MB/rate, sourced inference in all games, unchanged
progress, both themes, prepared Blog → Mobile Gaming 2026 navigation and offline
reload. Final page errors and tested question-bearing inference requests are
zero. An older combined smoke went offline on the first HTML cache write before
saving finished; its main-site assertions pass independently after the documented
`Available offline` signal and core readiness. Initial failures remain recorded,
and the final smoke explicitly combines separate guide/main runs. Final proof:
`deployment-acceptance.json` in the private publication package.

## Creative features

Ultima VI Chronicle is a deterministic composer of at most three selected virtue vignettes, labeled **roleplaying fiction, not canonical game events**. Ultima VII authored `BACKSTORIES` journals are byte-for-byte preserved. Equipment lore remains retired. General unsourced storytelling and other open-ended creative requests are explicitly unsupported, with no hidden fallback.

## Validation and reproducibility

No remote inference endpoint was called. The historical source-only acceptance installed provider/model route guards and reported zero inference requests. Current legacy guide suites retain those guards with an explicit consent/worker fixture; this does not mean that the integrated assistant performs no local inference. The new real-model suite exercises native local workers across all six games, records static GET/HEAD traffic without question bodies, checks consent/spoilers/progress, and reloads a cached guide offline. Intentional failed file deliveries are distinguished from unexpected failures. See the integration section for the current results and fixture boundaries.

The native runner's final corpus contains **157 independent questions, 31 dialogues and 15 rule/state/policy invariants: 203/203 cases pass**. A dialogue passes only when every turn passes. Assertions include decisions, source/fact identifiers, snippets, forbidden text, actions and state changes. Supported-answer cases pass; tested inappropriate confident answers are zero. This is a regression result, not a probability of correctness for unrestricted visitor questions.

The initial corpus was 132 questions and 24 dialogues, with about 40% of questions labeled holdout before the first execution. The first recorded run passed 117/171 grouped cases; it exposed an Albion relationship-field omission and other grounding issues. Those were fixed. A separate adversarial review then added 25 questions and five dialogues, and typed-clarification checks added two further dialogues. Final question labels are 79 development and 78 holdout/adversarial. Because failures informed fixes, final held-out success is now regression evidence, not an untouched blind accuracy estimate. Initial and final reports are retained. Broader independently adjudicated coverage remains future work.

After the English-language and knowledge work, this runner still passes **203/203**. One fixture changed deliberately: `albion-056`, “Where is Pistol; how do I use it?”, expected a clarification (“one relationship at a time”). It now expects both parts answered with both record IDs; the fixture carries a note. The no-network/no-storage source invariant now also covers `language.js`.

### Knowledge expansion suites

`knowledge-cases.json` is run by the same `english.mjs`. It adds:

- 54 questions and 3 dialogues covering newly indexed guide content and cited research, with negative cases for spoiler tiers, editions, restrictions, the AN SANCT conflict, unanswerable Al-Qadim questions, research never replacing a guide answer, and comparisons without guide data
- three invariants:
  - every overlay topic resolves to existing guide facts, and its answer equals those facts verbatim
  - counter/cure is answered only by declared records or enemy combat records
  - research is labeled, cited with https URLs and check dates, and loses to guide records

**Combined Node result after the simulation round (21 October 2026; before the per-game fixture files it was 829 questions, 61 dialogues and 21 invariants, 911/911, and before the gap round 258/258): 967 questions, 64 dialogues (17 browser-only) and 21 invariants, 1052/1052** (plus Codex's 187 standalone story tests and `story-inamo-browser.py`) (`run.mjs` stays 203/203; the owner's exact messages live in `owner-cases.json`, loaded by `english.mjs` and `english-browser.py`). That includes 28 coverage cases and the coverage invariant. (After the first knowledge round it was 113 questions, 22 dialogues and 14 invariants, 149/149.) The StarCraft knowledge dialogue runs in `english-browser.py` against the live DOM adapter. That suite also checks, on all six pages, that research renders with its citation as text and without a guide tone wrapper. The new selectors were confirmed to extract text from the real page. **Browser result: 336/336 checks (the per-game fixtures add the StarCraft dialogues), zero external requests, zero page errors.** It also confirms that each page passes its atlas or stats data to the assistant. All seven older browser suites were rerun and pass.

### Owner-reported fixes and research expansion (20 October 2026)

Each has its exact message as a regression case in `guides/tests/assistant/owner-cases.json` or `knowledge-cases.json`.

- **StarCraft editions.** A condition whose only content is an edition (“if I have Starcraft Remastered”) restricts the question to that edition rather than being a hypothetical (`editionOnlyCondition`); “I have Starcraft Remastered, which one do I choose?” treats the first clause as edition context (`editionStatement`). “SCR” and “SC:R” are rewritten to “starcraft remastered”. “Which do I choose/pick/select/go with” is a comparison intent. Progress conditions (“if I have the Pistol”) remain hypotheticals and another edition (“Starcraft 2”) still declines. A comparison naming no option uses records flagged `general` (policy copies the flag; the `ai-options` fact in `starcraft.json` carries `"general": true` and an `"editions"` array read by `adapters/starcraft.js`). **Limit:** the assistant gives the guide's three-option comparison; it never picks one for the visitor.
- **Ultima VI.** `coordinates`, `position`, `see`, `visit` (and inflections) are location vocabulary, so “Where can I see the shrine of compassion” answers; “that coordinates” is a back-reference. When several same-named subjects match and none has the requested relationship, the engine declines instead of offering identical buttons. **Limit:** “Where is that coordinates at?” repeats the previous subject's coordinates.
- **Ultima VII.** The atlas NPC Finnigan had been dropped because a password fact used his name as an alias; the adapter now ignores `kind: 'fact'` records when deciding known names and that fact's aliases are `Finnigan`, `Trinsic password`, `Trinsic gate password`. Same-named subjects are told apart by the question's other words (only when typed names are identical). “murderer” matches the guide's “murder” (`agentBase`/`hasWord`), and a subject's own kind noun (“…Murders quest”) is not a restriction. U7 quests answer “what/who is”. **Limit:** the guide never names a murderer; at Direct “Who is the murderer?” offers “The Trinsic Murders” (whose text contains quiz answers), at Gentle/Balanced it says it could not find it.
- **Did-you-mean quoting.** Leads quote the full typed phrase when its words belong to the matched name (“Giant Boor”, not “Boor”); a title word outside the name stays out (“Jaanna” for “Lord Jaanna”). Function `typedPhrase`.
- New invariants: every Ultima VII atlas NPC answers “Where is X?”; agent-noun matching; edition-only versus progress conditions; clarification choices never repeat a label.
- **Albion character tiering (owner's choice).** Race and role are now answerable at Gentle and Balanced, with the same “notes appear at the Direct spoiler setting” line for every character; notes stay Direct. The old Gentle expectation in `sug-neg-02` was changed on purpose.
- **Cited outside research expansion.** Ultima VI and Ultima VII received cited research notes covering status cures (red potions curing poison, blue/orange potions awakening from sleep, and Dispel Magic / Cure spells from Ultima Codex). Al-Qadim received a cited research note covering save-game procedure (up to nine named slots via the Options menu) and difficulty settings from the official SSI manual (MOCAGH). All research notes are verified by `invariant('research-is-labeled-cited-and-subordinate')`, browser rendering checks across all six guides, and negative cases demonstrating that guide records always win over research.

### Shared-engine gap round (21 October 2026)

Reported gaps fixed in the shared engine, each with an exact-message case (`gap-01`…`gap-08` in `owner-cases.json`):

- **Common words are not typos.** A built-in list of everyday English words (`COMMON` in `retrieval.js`) never counts as a misspelt name, so “many” no longer suggests Mani nor “cover” Cove. The list is finite: an uncommon ordinary word can still collide with a name. Edit distance now treats an adjacent swap as one edit, so “siobahn” reaches Siobhan.
- **“How do I do/pass/finish a quest”.** `pass`, `tackle`, `handle`, `begin` and `approach` are relationship vocabulary, so “how do I pass the Test of Truth” is no longer declined as a restriction. “How would I go about recruiting X” is an acquisition question, not a hint.
- **Learn/teach.** Acquisition answers “where do I learn X”. Ultima V's Shrine of Spirituality topic now answers it (“Skara Brae is where you learn OM”). Al-Qadim combat moves answer it from their own training field; the fixture `sq-aq-020` was changed on purpose (it expected a decline; the teacher, Zubakon, must still stay hidden at Gentle).
- **Help and instruction-override text.** “Help”, “what can you do”, “ignore previous instructions…”, jokes, weather and similar get a plain statement of what the guide can answer, not the generic menu. These patterns are a short list, not a classifier; other off-topic text still gets the generic menu.
- **“How many chapters are there?”** is answered from the guide's own entries (“There are 10 chapters in this guide: …”). A topic the guide states itself (Ultima VII “The nine companions”) wins over the generic count.
- **Single-record subjects.** A subject the guide records for exactly one relationship is answered directly instead of asking “what do you want to know?”.
- **Not done in this round:** keeping the previous question across follow-ups when it had no relationship (“and Cove?” after “healer in Britain” still asks what you want); “HP/XP” questions still decline unless the guide's text mentions them, which is the intended grounding behavior; “how do I finish a quest” with no quest named still offers choices rather than a general answer.

### Simulation round (21 October 2026)

The owner said the assistants "still lack things across different areas". One session per game wrote realistic player messages from the game's real data (terse, chatty, typos, ALL CAPS, follow-ups, opinion, off-topic and status-problem questions), classified every reply at all three spoiler levels, fixed the game-data causes and wrote a report (`sim-report-<game>.md`, kept in the coordinator's notes folder, not in the repository). Counts are the sessions' own hand classification and are approximate. Their fixtures were written by the implementers after seeing failures, so they are regression evidence, not a blind accuracy estimate.

| Guide | Messages tried | Before → after (their own measure) | Fixtures (`sim-<game>-cases.json`) |
| --- | ---: | --- | --- |
| Albion | 242 | about 60 wrongly declined → about 12 | 74 questions, 4 dialogues |
| Ultima V | 471 | Direct answers 138 → 204 (first 334 messages) | 126 questions, 6 dialogues |
| Ultima VI | 355 | Direct answers 104 → 209 (of 299 single messages) | 125 questions, 6 dialogues |
| Ultima VII | 545 | Direct non-answers 327 → 202 | `sim-ultima7-cases.json`, plus `sim-ultima7-checks.mjs` |
| Al-Qadim | 481 | about 40% of first replies wrongly declined or menus → its 126 kept fixtures 50 → 126 pass | 126, plus `sim-alqadim-page-facts.mjs` |
| StarCraft | 416 | Balanced answers 87 → 213 | browser-only dialogues |

Spoiler checks by the sessions (thousands of Direct-only titles and aliases probed at Gentle and Balanced) found no leak that shipped; Ultima V had one during development, pinned by `sim-u5-43`. The hidden-versus-absent invariant still passes. Al-Qadim now has 17 cited research notes (record count 282), and Ultima V, VI and VII overlays quote sentences from their own pages verbatim (checked by `sim-ultima7-checks.mjs` and `sim-alqadim-page-facts.mjs`; rerun them after editing those pages).

**Shared-layer additions from this round** (fixtures in `owner-cases.json`, ids `ow2-*` and `ow3-*`):

- **List questions.** “Who can join my party?”, “What spells are there?”, “Who else can join?” answer with the titles of the guide's own entries of one kind (companions and characters, spells, items and equipment, creatures, virtues, shrines, reagents, shards, chapters, shops), labeled by the kind, with their sources. A superlative (“Which is the best weapon?”) is not a list. A guide with no such entries declines (“no list of that kind”).
- **“Tell me everything about X.”** Prints each relationship the guide records for X verbatim, one labeled line each (Location, How to get, Use, Description, Stats, Combat, …), with all sources and the highest spoiler level.
- **No-verdict note.** “Is it worth buying X?” answers with the guide's facts after “The guide gives no verdict on whether that is worth it. What it records:”. Recruitment advice (“Is Julia worth recruiting?”) is unchanged.
- **Honest menus.** A decline or menu says what the guide can tell about that subject (“It can tell you where it is or what it requires”), a subject-less menu lists only relationships the current guide has, and greetings and “what can you do” get a short explanation of what is covered. Multi-subject choices that nobody can answer decline instead of showing dead-end buttons.
- **Intent vocabulary.** “what should I do about X” → hint when X has no cure; “how do I get past <enemy>” → combat; “I keep dying to X / X keeps killing me” → combat; “how much SP/HP/XP …” and “what class/circle/level is X” → lookups; “password/combination” → explanation; “how do I get into X” → requirements, falling back to acquisition when X has none; “is X cursed?” is a yes/no question rather than a cure request; “who can use X?” is unsupported; “Is A or B better?” (up to seven words) is a comparison and declines when the guide has none. “can't leave / I'm stuck and …” are framing. A mistyped first question word (“wher”, “hw”, “wat”) is repaired. Chat filler (“lol”, “yo”, “plz”) is framing.
- **Names.** Halves of a combined title (“Heal / Great Heal”, “Cyclops & Ettin”) are aliases, except generic words and “the …” fragments. Same-named subjects are told apart by the question's other words, and no named atlas NPC may be swallowed by another record (invariant over all Ultima VII atlas NPCs).
- **Albion and others.** Albion chapter summaries answer “what do I do in chapter N”. Ultima VII quests answer “what/who is”.


**Engine fixes from the sessions' shared-layer requests (same day, fixtures `ow4-*` in `owner-cases.json`).**

- **Rankings.** “Which companion is the best tank?”, “Who is the strongest companion?”, “which swing is best” now say “The guide does not rank or compare things, so it cannot say which is best” and list that kind of entry (decision `clarify`). Move/cheat lists were added (“what sword moves are there”, “list the cheats”).
- **A place used as a qualifier.** “Who is the murderer in Trinsic?” cannot be answered from Trinsic's record, so the engine offers entries that contain the place name and every extra word (“The Trinsic Murders”) as a choice, never as an answer. This applies only to places after “in/at/near…”; “Where is the Crown on the moon?” still declines.
- **Typos.** A word next to an unknown word is not a typo (“Vortex Cube” was guessed as Cure); a single typed word that is exactly a word of a visible name is not a misspelling (“swing” vs Sling); a bare misspelt name (“serpant staff”) now gets a “Did you mean…?” choice instead of a menu; lore Q&A entries are no longer suggested.
- **Wording.** Range/duration (“how far does X go”, “water blast range”, “how long do potions last”) and “how much does a potion heal” are use questions; “farm/grind/boost/increase”, “hide/conceal/smuggle” are vocabulary; “my party”, “not working”, “it can't/won't” are framing; “I'm playing/on <edition>” gives edition context like “I have <edition>”; a doubled consonant is dropped when stemming (“running” ~ “run”); “how do I do a Wide Swing” falls back to the use record when there is no hint.
- **Editions and comparisons.** An edition word inside a subject's own name (“Remastered SCM Map”) no longer restricts the question. When an edition is declined and the guide records a source conflict about it, the decline quotes that note (“Can I use BWAILauncher with Remastered?”). The general comparison is not used for an elliptical follow-up (“and the pros and cons?”), and words it cannot honour are said aloud (“The guide does not answer ‘easiest’ specifically…”). A page-less hint request (“any hints for this?”) uses the selected section even with a pronoun. Prerequisite answers in a setup guide drop the checklist sentence, and menus list “its stats” only for real stats records.
- **Problem statements.** “my antivirus is deleting SCHNAIL”, “the game crashes when I start SCHNAIL” and “SCHNAIL keeps getting blocked by my antivirus” are read as cure questions (symptom words such as crash/blocked/deleting are vocabulary, not restrictions). When several subjects match, the one whose records cover the question's other words wins, and a subject whose title already contains the other's name (“Antivirus blocking SCHNAIL”) wins over the bare name; comparisons are unaffected. Fixtures: dialogue `ow5-dlg-sc-problem-statements`. StarCraft's alias grids were measured for pruning (see below): they cannot be cut without losing answers.
- **Fixture changed on purpose:** `sq-aq-103` (“how long do potions last”) now answers with the cited rule-book research note instead of offering a topic.

**Requests not done (still open).** Follow-ups that need a composed question (“Where is the healer in Britain?” then “what about Cove?” should mean Cove's healer); “what spell heals / makes me invisible” (finding a spell by its effect); two named subjects with stats side by side; “location and class” without a question mark; short-word typos (“shp orb”); “drop(s)” and similar relationships with no record; “Is X a traitor?” (intentionally unsupported); the Albion password-for-the-ceremony wording (needs the Albion record to declare it answers “what is”); and StarCraft's “it says BWAPI not loaded” style wording (the big problem-plus-game-name menu is fixed).


**Resolver cache, contraction folding, composed follow-ups and spell-by-effect (21 October 2026, fixtures `ow6-*`).**

- **Resolver cache.** `resolveEntities` rebuilt its entity table and re-tokenised every alias on every question. The table is now built once per record list and aliases are normalised once. Results are unchanged (all suites and the saved StarCraft corpus match their baselines exactly); StarCraft's per-question time fell from about 5.4 ms to 0.2 ms (p95 10.6 → 0.4 ms) and every guide's warm p95 is now 0.2–0.4 ms. **Trade-off:** retained heap rose by about 0.2–0.6 MiB per guide (StarCraft +0.6 MiB) for the cached tables.
- **Spelling variants fold when names are matched.** “doesn't / doesnt / does not”, “can't / cant / cannot / can not”, “won't / wont”, and the other “…n't / … not” pairs are one word for entity matching, so grids no longer need every spelling. The words the visitor typed stay as typed everywhere else, so negation and restrictions are read exactly as written. Pinned by dialogue `ow6-dlg-sc-contraction-spellings`.
- **StarCraft alias grids were not pruned.** Folding removed only 31 of 591 grid entries (the rest are genuinely different wordings), and truncating the grids by the earlier experiment lost 3, 8 and 12 of the 45 saved wordings (k=6/20, 3/10, 2/6). With the per-question cost already solved by the cache, pruning would trade coverage for a small preparation saving, so the authored grids are left as they are. Compact slot templates in the resolver would save memory only; this was not done.
- **Composed follow-ups.** “Where is the healer in Britain?” then “what about Cove?” now answers “Healer in Cove”: when the previous subject's name contains another place's name after a locative word (“Healer in Britain”), the new place is swapped in and the entry with that composed name is used. If no such entry exists the reply says so and the previous subject stays current (“and Minoc?” → no matching entry; “and Moonglow?” still works). It also composes “who is the mayor of Britain?” then “and Cove?”. It needs no new data: it uses existing aliases, and applies only after “in/at/of/near/from”.
- **Spell by effect.** “What spell heals?”, “what spell makes me invisible”, “what spell cures poison” search the spell entries and answer only when a spell's own text contains every effect word (one match answers with the spell's name and text; several give a choice; none says no entry states it). “which spell is the best” does not rank but lists the spells. Naming a spell (“what spell is An Nox”) is an ordinary question. **Limits:** wording must match the guide's text (“goes up a dungeon level” does not match “Descend/Ascend one dungeon level”); Ultima VII's spell texts do not state effects, so those questions decline honestly; in Ultima V “what spell heals” is answered from the existing Healing topic.

**Limits found and left.**

- “How do I recruit Iolo / Jaana / Julia?” declines in Ultima V, VI and VII because a guide location is not declared as a recruitment method (three older tests expect this). I tried treating location as recruitment and reverted it: it is the owner's decision.
- Not supported: verdicts and rankings (“best tank”), two named subjects answered side by side (they are clarified), “Shamino location and class” without a question mark, typo repair beyond names and question words (“shp orb”), relationships with no record (“what does X drop?”), counts for kinds without a list group (dungeons, quests), and anything outside the guide text or a cited note.
- An edition word inside a subject's own name (“Forge of Virtue”), and generic bare-name menus remain. About 40 further shared-layer requests are in the sessions' reports.
- StarCraft carries about 3,240 aliases, almost all in template grids (`standalone` facts with `phrases` × `slots`, expanded by `expandAliases` in `adapters/starcraft.js`). Measured on 21 Oct 2026 with a 50-wording corpus: capping each slot to 2 values and phrases to 12 kept 17 of 26 answered wordings and lost 9, so pruning is not a mechanical cleanup. The grids can shrink only after the engine can match a slot template (for example “{AV} {V} {NP}”) rather than exact expanded strings, which is shared-engine work.
- Companion lists show whatever the guide's data calls characters (Albion's list includes non-recruitable story characters).


### Misspelt names: benchmark and improvements (21 October 2026)

Prompted by “who is sajud” (Saduj, two non-adjacent letters swapped), which found nothing. No model was added: fuzzy matching of names is a string problem, and the work was done by measuring first.

**Benchmark** (`guides/tests/assistant/typo-benchmark.mjs`, offline, deterministic, about 4 seconds; `BENCH_SPLIT=train|test` uses half of the names, `BENCH_OUT` writes the JSON report). For every name visible at each spoiler level (companions, characters, NPCs, items, spells, monsters, places in the five Node guides) it generates misspellings of ten kinds (adjacent swap, far swap, dropped letter, doubled letter, inserted letter, vowel swap, keyboard-neighbour, sound-alike, dropped vowel, wrong first letter), asks a natural question about the misspelt name, and classifies the reply as **auto** (the right subject is named or answered), **choice** (the right subject is among the offered choices), **wrong** (a different subject) or **none**. It also checks negatives: 234 ordinary English words and 300 random strings must not be “corrected”, and about 460 misspelt hidden names must never reveal the hidden name. About 13,300 misspellings per run.

| Stage | Recovered (auto) | Wrong subject | English words corrected | Gibberish corrected |
| --- | ---: | ---: | ---: | ---: |
| Before today's typo work | 80.4% (78.3%) | 2.16% | 8 / 234 | 1 / 300 |
| + same letters in another order (“sajud”) | 84.3% (82.3%) | 2.27% | 8 / 234 | 1 / 300 |
| + whole multi-word names and sound-alike keys | 89.6% (88.1%) | 0.59% | 8 / 234 | 1 / 300 |
| + the question's expected kind | 90.1% (88.6%) | 0.37% | 3 / 234 | 1 / 300 |
| + longer everyday-word list, also in the suggestion path | 90.1% (88.8%) | 0.35% | 0 / 234 | 1 / 300 |

Hidden-name leaks are 0 / 458 throughout. Every kind except a wrong first letter is now recovered 97–99% of the time (for example far swap 46% → 99%); a wrong first letter is recovered only 10.8% of the time on purpose (the matcher requires the same first sound, so “Catrina” finds Katrina but “Waduj” does not find Saduj).

**What changed**
- **Scrambled letters.** The same letters in another order with the same first letter (“sajud”) count as one name (`scrambled`).
- **Sound-alike key** (`phoneticKey`, `closeSpelling` in `retrieval.js`): “Fyrina/Firina”, “Majic/Magic”, “Dorbekk/Dorbeck”, “Catrina/Katrina” share a key. It only compares two spellings and never expands a word.
- **Whole-name fuzzy matching.** A misspelt name of two to four words matches when exactly one word is misspelt and at least one is right (“Vas Main” → Vas Mani, “Skul Keys”, “Palace of Blacthorn”, “In Mnai Corp”). The longer match beats a single-word match such as “Main” → Mani. A common English word in the misspelt slot needs a real word of the name beside it.
- **Expected kind.** “Who is …” expects a person, “cast” a spell, “beat/defeat” a monster, “get to” a place. A name of another kind is not accepted for a word under seven letters (“who is cube?” no longer suggests the spell Cure). Entries carry a kind group (person, item, spell, monster, place) from their record kinds.
- **Everyday words.** The never-a-name list grew (garden, stone, secret, friend, castle…), and the suggestion path now uses it too (“tell me about many things” no longer suggests Mani).
- **Bare misspelt names** (“sajud”, “serpant staff”) say “I don't know anything about …. Did you mean …?” before the menu.

**Held-out check.** Thresholds were tried on the training half of the names and confirmed on the test half: the chosen settings gave 90.2% (train) and 90.1% (test); allowing larger edit distances for 6–7 letter words raised wrong-subject replies (0.3% → 0.7% on the test half) without gaining recovery, and the other tried changes did nothing, so they were not kept.

**Limits.** A wrong first letter is mostly unrecovered. A misspelling that equals another real name is read as that name (Albion's Harris/Harriet, Hanii/Janiis, Troll/Trolls). Some benchmark “wrong/none” entries are artefacts of the generator (doubled apostrophes, a typo that is itself an alias); the benchmark is a measure of change, not a promise about real visitors, and no real visitor misspellings have been collected. “Where is cover?” style questions with no expected kind can still suggest a place (“Cove”) for a word that is not in the everyday list. Typos in question words beyond the first (“wher is …”) are repaired only at the start of the message. Fixtures: `ow7-scr-*` and `ow8-*` in `owner-cases.json`.


### Ultima VII organizations and offices (21 October 2026, adapter and overlay only)

The atlas already ties NPCs to organizations in its own words (“Leader of the Fellowship - Britain”, “Fellowship treasurer”, “Member of the Great Council”, “Mayor of Cove”, “Member of the Guild”). Before, questions about them produced lists of choice buttons with bare names. Now `ultima7.json` has an `organizations` list (id, title, a pattern over the atlas NPC line, aliases) and `adapters/ultima7.js` builds one index entry per organization from the atlas markers (`ULTIMA7_MARKERS`): the people whose line matches, each with their atlas line verbatim, at Balanced like the NPC lines themselves. Nothing is added to what the atlas says.

- Entries: **The Fellowship** (8 people: Batlin, Millie, Danag, Elynor, Balayna, Rankin, Klog, Quan), **The Great Council** (Miranda, Inwisloklem), **The Guild** (Gladstone, Seara, Xanthia), **Mayors** (7 towns).
- “Who are the Fellowship members?”, “Who is the leader of the Fellowship?”, “Who runs the Fellowship?”, “Who is on the Great Council?”, “Who are the mayors?”, “Who are the guild members?” answer with that list and its source (`authored-index`). A role line held by one person also finds that person directly (“Who is the Fellowship treasurer?” → Rankin).
- Gentle shows nothing (the NPC lines are Balanced), and the replies match the “not found” reply for an absent subject. “…on Mars” declines. The assistant does not invent a leader: “Who is the leader of the Guild?” or of the Great Council declines because the atlas lists only members.
- Fixtures `org-u7-01…13` in `sim-ultima7-cases.json`.
- **Limits.** The atlas gives each person's line, not a hierarchy: “Who leads the Fellowship?” lists every Fellowship person it records, with Batlin first. It does not say which branch town Elynor, Klog, Quan or Danag run (their lines name no town, only Danag's names Buccaneer's Den). No event, victim, perpetrator or relationship records were added; those need the story-record format to be agreed first (see the handoff).


### Story records (Ultima VII data, agreed contract with Codex; 21 October 2026)

Agreed format: ordinary sourced records built by `buildStoryRecords(gameId, definitions, facts)` in `topics.js`: `relation: 'story'`, `story = { role, people[], context[], qualifier? }`, roles perpetrator, suspect, victim, leader, member. A story record attaches to the **existing subject** (an existing quest or organization entity keeps its kind), `people` may be empty (anonymous role) with the source's own wording in `qualifier`, `context` names other parties (including non-persons) only when the source connects them, and nothing is inferred in either direction. Each role record has one spoiler ceiling shared by its text and metadata; `from` keys must resolve to verbatim facts or exact sentence spans; names must occur in the authorized source text; `policy.authorize` re-validates every story record. “Murder victim” is a different question from a generic “victim” question.

Ultima VII definitions live in `ultima7.json` under `stories` (six records) and are built by `adapters/ultima7.js`, whose facts include the atlas line of every named NPC (`atlas:<name>`) and the exact quest sentences (`q-suspect`, `q-blorn-victim`):

| Record | Subject | Role | Source (verbatim) | Level |
| --- | --- | --- | --- | --- |
| `trinsic-suspect` | The Trinsic Murders | suspect (qualifier “man with a hook”; context “Crown Jewel”; no name) | “Interview Spark, Gilberto, and Klog to identify the suspect (man with a hook) and his escape vessel (the Crown Jewel).” | Direct |
| `blorn-victim` | Blorn's Accusations | victim (Lap-Lem; qualifier “accused gargoyle”; no link to Blorn) | “Speak to the accused gargoyle, Lap-Lem. He was the victim.” | Direct |
| `fellowship-leader` | The Fellowship | leader (Batlin) | atlas: “Leader of the Fellowship - Britain” | Balanced |
| `fellowship-branch-leaders` | The Fellowship | leader, qualifier “branch leader” (Elynor, Klog, Quan, Danag) | their atlas lines | Balanced |
| `great-council-members` | The Great Council | member (Miranda, Inwisloklem) | atlas: “Member of the Great Council” | Balanced |
| `guild-members` | The Guild | member (Gladstone, Seara, Xanthia) | atlas: “Member of the Guild” | Balanced |

**Deliberately not added from the guide itself:** a murderer or a murder victim (the guide names neither: Christopher and Inamo are only NPC markers, “Christopher: Blacksmith”, “Inamo: Gargoyle immigrant”); any link between the suspect and Hook (a later quest says “track down Hook” but never says he is the suspect). Cited outside research now supplies the killers and victims (next paragraph); a Fellowship “member” role (the atlas never says “member of the Fellowship”, only that these people are its leader, recruiter, treasurer and so on, so the existing list record keeps serving “Fellowship people”); leaders of the Guild or the Great Council (the atlas lists members only); mayors (an office, not one of the five roles; they stay in the organization list). Status: the six records build and validate, and the engine (Codex's work) now answers “Who is the murderer?” with the sourced Trinsic suspect clue, qualified as “a suspect, not a confirmed murderer”. Four older fixtures that expected the previous “did you mean the quest?” choice were changed on purpose and carry a note (`ow-u7-07`, `ow4-u7-01`, and the dialogues `ow-dlg-u7-murderer-finnigan` and `ow-dlg-u7-murderer-confirm`, whose old “yes” confirmation step now asks for the quest text directly), and the invariant `agent-nouns-match-the-guides-base-word` now asserts the typed suspect answer (keeping its quiltmaker negative). Bare “Who is the Fellowship?” / “the Fellowship” already answer with the organization list at Balanced and Direct without extra aliases (adding them made “Who is the Fellowship treasurer?” ambiguous, so they were not added). The intended story behaviour is described by `guides/tests/assistant/story-ultima7-pending.json`, which Codex consumes in its own runner; the test loader here does not read it.


**Cited research for the Trinsic murders (22 October 2026, from Codex's source packet; sources re-read by Claude).** Two further story records, both Direct, both attached to the existing subject `ultima7:quest:the-trinsic-murders` (kind `quest`) and both built from one research fact, `research:trinsic-murders-killers`: `trinsic-killers` (role perpetrator; people Hook and Forskis; context Inamo and Christopher; qualifier “Fellowship assassins”) and `trinsic-murder-victims` (role victim; people Inamo and Christopher; context Hook and Forskis). The fact says, in our own words, that according to the Ultima Codex Inamo was killed in the ritual murder of Christopher, which it attributes to the Fellowship assassins Hook and Forskis. Sources (checked 21 October 2026): “Inamo — The Codex of Ultima Wisdom” (`https://wiki.ultimacodex.com/index.php?title=Inamo&oldid=154876`) and, as corroboration, “Christopher — The Codex of Ultima Wisdom” (`https://wiki.ultimacodex.com/wiki/Christopher`); both pages also say the SNES port has kidnappings instead of murders, so that version is excluded. The packet proposed an exact 18-word quotation; Claude used a paraphrase instead (our research notes are own-words summaries) that still contains every required name and qualifier. The overlay entry is in `research` with `"storyOnly": true`: the adapter keeps it out of the standalone research records (so it cannot change which subject a name resolves to) and exposes it only as a story fact with `review: external-research` and its references. No motive and no statement about who struck a fatal blow is made (the two Codex pages even disagree on why Inamo died). Answers are labeled “Not in this guide — from outside research” and show the citation; the guide's own suspect clue stays a separate suspect record. Fixtures: `res-u7-01…20` in `sim-ultima7-cases.json` (killers, victims, “who murdered who”, Hook and Forskis, the generic victim choice) with negatives (Mars, the SNES version, unrelated people such as Iolo and Spark, “Is Hook the murderer?”, “Why was Inamo killed?”, and hidden-versus-absent at Gentle and Balanced), and the changed old expectations (`ow-u7-07/08/09`, `ow4-u7-01`, the two murderer dialogues, `story-u7-02/03/04/06/15/16/17` and `story-u7-dlg-01`) each carry a note. The missing-relationship reply is now the neutral “I don't have a sourced answer to that relationship question in the available records.” (it says nothing about spelling or spoiler settings and, below Direct, reveals nothing about the hidden records).

### Story-question engine (Codex, 21 October 2026; integrated and verified by Claude)

Codex changed only the reserved engine files (`engine.js`, `language.js`, `policy.js`, `topics.js`) and added four standalone test files: `story-questions.test.mjs` (41 parser cases), `story-engine.test.mjs` (40 fictional behaviour and source cases), `story-boundaries.test.mjs` (35 boundary cases) and `story-ultima7.test.mjs` (20 real-data checks that read `story-ultima7-pending.json`, which must therefore stay where it is or be coordinated). Run them with `node guides/tests/assistant/<file>.test.mjs` (Node's built-in test runner; 136 cases at first, 187 after the research round, all passing when re-run).

**Record format.** `buildStoryRecords(gameId, definitions, facts)` and `storyRecordIssues(definitions, facts)` live in `topics.js`. A definition has `id`, `entityId` (reuse the existing subject), `kind` (keep the existing kind), `title`, `aliases`, an explicit `minSpoiler`, `overlayFile`, `from` (fact keys) and `story: { role, people[], context[], qualifier? }`. Roles: perpetrator, suspect, victim, leader, member. `people` may be empty for an anonymous role, with the source's own wording in `qualifier`; `context` names other parties (including non-persons) only when the source connects them. No inverse relationship is ever inferred. Each role is one record with one variant at one spoiler ceiling, so text and metadata share it; mixed levels need separate records. Every `from` key must resolve, the answer text equals the facts joined verbatim, each fact keeps its file and locator, and `source.index` is `authored-index`. Every `people`, `context` and `qualifier` phrase must occur inside an individual indexed fact. A fact tagged with a `minSpoiler` above the definition's is rejected (atlas facts are tagged Balanced; Ultima VII quest excerpts are now tagged Direct). Guide and research facts cannot be mixed in one role record, and research-only answers attribute the evidence to cited research. `policy.authorize` fails closed on malformed story metadata, unsupported roles, alternate-tier variants or ungrounded phrases, and copies the metadata arrays only after authorization.

**Reading story questions.** `storyQuestion(text)` returns `{ role, query, crime?, personTarget? }` and `parse` attaches it as `part.story`; the legacy intent reader is kept. The query retains qualifiers, names, editions, numbers and negation. Homicide wording never selects a non-crime victim; a direct-object question (“who killed X?”) needs an indexed directed context, and a vessel or place context never becomes a victim. An anonymous perpetrator can be answered only when the exact indexed sentence supplies the directed target. Pronouns reuse one unambiguous named participant under the same direction checks, otherwise the assistant asks. The engine resolves named events and context first, then the latest conversation subject, using the selected guide entity only when conversation context is empty; a current event that lacks the requested role does not jump to another event; several events or organizations give focused choices; typed and button follow-ups keep role, direction and restrictions; lowering the ceiling invalidates choices and hides higher-tier history; a personal location follow-up cannot answer with the event's location. Organization aliases may be recovered from a sourced role context only when that context name equals the title prefix (so “Fellowship” finds “The Fellowship: people the atlas lists”). Leader questions need a typed leader record, including when all role records are hidden or absent; the member-list question-and-answer entry remains.

**Resulting Ultima VII behaviour.** (Written when only the guide's own text existed; since 22 October, Direct also has cited research, below. At that time:) “Who is the murderer?” gave the exact Trinsic suspect sentence, labeled “a suspect, not a confirmed murderer”; “Who murdered who?” said the indexed records did not establish who killed whom, then gave the qualified suspect clue. Now “Who is the murderer?”, “Who killed Inamo/Christopher?”, “Who murdered who?”, “Who did Hook/Forskis kill?” and “Who was the murder victim?” are answered from the cited research (above), while “Who is the suspect in the Trinsic murders?” still gives the guide's qualified suspect clue. “Who is Inamo?” gives the existing atlas line (“Gargoyle immigrant”) and stays thin because the guide has nothing richer. “Who is the Fellowship?” gives the sourced organization list. Leader and member questions choose the authored roles and keep branch and interim qualifiers verbatim. A generic “who is the victim?” now asks “Which event do you mean?” (Blorn's Accusations or The Trinsic Murders); inside a Trinsic conversation a victim follow-up stays on Trinsic and gives the cited-research victims. The guide's own text links none of Hook, Christopher or Inamo to a murder or victim; only the cited research does. How-to-combat questions and trust or verdict questions never become story-role answers.

**Research precedence and source restriction (Codex, 22 October 2026).** Engine changes made for the cited-research records (only `engine.js` changed among the reserved files; `topics.js` and `policy.js` validation is unchanged):
- A definitive requested role is chosen before a fallback: a perpetrator question reaches the cited research perpetrator before the guide's anonymous suspect, and guide preference applies only within the same role (a guide suspect cannot suppress a research perpetrator, nor a guide perpetrator a separately sourced research victim). Each research answer keeps the “Not in this guide — from outside research” label and its citations.
- A current visible person can focus an event only through an exact name in an authored, authorized `people` or `context` field; the requested role still comes from its own record, and an unrelated person or event does not jump to the available murder.
- The missing-relationship reply now says that no sourced answer is available for that relationship (“I found the entry for X, but I don't have a sourced answer to that relationship question in the available records.” when an exact authorized identity exists). It never advises changing spelling or raising the spoiler setting and derives no title from hidden records.
- Explicit source restrictions (“according to the guide”, “from this guide only”, “in the guide”, “using only the guide”) filter out research before matching, and the restriction is carried through choices and short follow-ups. A guide-only question about Inamo gets the honest unavailable reply; a guide-only generic Trinsic perpetrator question may still return the guide's qualified suspect clue.
- New standalone tests: `story-research.test.mjs` (29 fictional cases: role and source precedence, separate source labels, named participant context, missing inverse relationships, unsupported qualifiers, hidden/absent equivalence), `story-inamo.test.mjs` (22 real-data checks including the six-message owner transcript, explicit victim queries, the guide suspect clue, restricted editions and identical hidden/absent research) and `story-inamo-browser.py` (the real UI: citation text, the honest fallback, offline answers, lowering the spoiler ceiling, unchanged saved progress). With the earlier four files the standalone story suites are **187 cases** (41 + 40 + 35 + 20 + 29 + 22); `story-ultima7.test.mjs` now forbids only a guide-sourced perpetrator, because outside research may now name one.

**Limits.** This is still a bounded symbolic reader: wording or relationships it does not model decline or ask. Only Ultima VII has story records so far (eight records, plus the 30 narrative facets below). Codex's real-UI probe repeated the four original prompts, checked source lines and the uncertainty wording, answered offline, lowered the spoiler ceiling and confirmed that saved-progress `localStorage` was unchanged. Verification logs are outside the repository (`/tmp/codex-story.*`, not durable).

**Who killed whom: meaning and context correction (22 October 2026).** The phrase was already recognized, but its answer collapsed the killer and victim records into one identical source paragraph headed “Recorded participants”. The engine now presents adjacent `Killers:` and `Victims:` lines for each explicitly linked account, followed by the unchanged source text. A pair requires both authored roles: the killer's context names the victim and the victim's context names the killer. Merely sharing an event does not connect two roles; separate killings stay in separate blocks, missing inverse roles remain missing, and unmatched people in a partially linked record are shown as unpaired. These labels use only authorized metadata. Research blocks retain their outside-research label and citations; a suspect is never labeled a killer, and no individual fatal-blow assignment is generated.

The latest conversation subject now takes precedence over the selected page for implicit story and narrative questions. The page is the initial default and becomes the default again after a topic reset. Explicitly named questions and selected choice buttons still win. A newly recognized subject replaces the older topic even when its requested relationship is unavailable; unrelated, ambiguous or hidden subjects cannot silently return to the older page's murder. Subjectless story follow-ups also retain the latest source, edition and material restrictions, including a guide-only narrative question's restriction.

New meaning-level checks: `story-meaning.test.mjs` (27) asserts exact killer/victim memberships, separate pairings in one event, missing and partially linked roles, latest context after answers and declines, explicit scope, reset, source restrictions and hidden/absent equivalence. `narrative-context.test.mjs` (8) covers the same priority rule for narrative questions, choices, suspect references and purpose scope. `story-meaning-browser.py` verifies the actual quest UI with an unrelated Fellowship quest selected: the Inamo conversation still gets the proper roles, unsupported Finnigan questions cannot restore Trinsic, explicit events override the current subject, reset restores the page default, and citations, offline use, spoiler-history filtering and saved progress remain intact. The existing spoiler-choice test in `story-engine.test.mjs` now resets its topic before requesting a fresh event choice, because a current event intentionally remains current. No adapter, overlay or shared fixture changes were needed.

Final validation for this correction: original 203/203; English 1052/1052; standalone story/narrative 547/547; all 12 browser suites (including the new meaning probe) pass; both page-fact checks print `ok`. Typo totals and negative cases are identical to the original-engine baseline: 90.1% recovery, 0.37% wrong subjects, ordinary-word corrections 0/234, hidden-name leaks 0/458 (the existing gibberish suggestion remains 1/300). The unchanged Genie/Sage browser suite passed on rerun after one timeout waiting for the deliberately failed static module load. Source, data and test inputs were checked by hash. Logs are in `/tmp/codex-who-killed-adp5c7fy` (temporary), and the meaning UI evidence is in `guides/tests/assistant/evidence/story-meaning-browser.json` and `story-meaning-direct.png`.


### Narrative facets (Ultima VII data; contract agreed with Codex, 22 October 2026)

For broader open-ended story questions (identity, events, causes, methods, outcomes, sequence, relationships, purpose, summaries) the overlay has a sibling `narratives` array, built by `buildNarrativeRecords(gameId, definitions, facts)` in `topics.js` (checked by `narrativeRecordIssues`). A definition has `id`, an existing `entityId` and `kind` (never a second subject with the same name), `title`, `aliases`, an explicit `minSpoiler`, `from` (one to four fact keys) and `narrative: { aspect, subjects[], context[], predicate?, status?, sequenceMode? }`. Rules enforced by the builder and again by `policy.authorize`:
- The nine aspects are identity, event, cause, method, outcome, sequence, relationship, purpose and summary. `subjects` names the focus (required), `context` the explicitly connected other parties. Cause, method, outcome, sequence and relationship **require a `predicate`**: an exact source word or phrase naming the action or relationship being answered (“killed”, “escape”, “son”), so a cause of joining cannot answer a cause of killing merely because the same names occur. The engine normalizes inflection and a small explicit kill/murder equivalence, not arbitrary synonyms.
- Every name, context and predicate must occur inside one individual indexed fact (it cannot span facts). One record has one spoiler level and one provenance domain: guide excerpts are verbatim; outside research is an attributed own-words summary with labeled citations; the two are never mixed. The answer text is the `from` facts joined verbatim in the authored order (at most four), and the builder supplies `source.claims` (each fact's text, locator and citations) so separately attributed claims can be shown.
- `status` is `recorded` (default), `hedged` or `disputed`. **Hedged** needs an explicit hedge word in the text (likely, apparently, perhaps, presumably, possibly, may, might, seems, appears, believed, reportedly), kept verbatim; the engine leads with a tentative-account label. **Disputed** needs at least two facts from outside research with at least two distinct cited URLs; each fact is shown as its own attributed block under a “different accounts, no single established answer” lead-in, the engine never picks a winner, and the old `conflict` flag (which only declines) is not used. A disagreement inside one page does not qualify.
- A **sequence** facet needs an explicit temporal word in its text (after, before, then, next, later, finally…) and `sequenceMode`: `steps` (the guide's walkthrough order; the answer is led with “In the guide's steps”) or `events` (actual chronology). “What happened after / next?” selects events, an explicit “next step after…” selects steps, and neither is ever inferred from array or checklist order.
- A **summary** is only an ordered verbatim join of guide facts or an own-words research fact: no automatic story synthesis and no new connective claims. “What happened in X?” uses the event facets, not every facet stitched together. A primary identity facet enriches “who/what is” answers while the older grounded identity answer remains the fallback where no typed facet exists.

**Ultima VII data (30 narrative records in `ultima7.json` `narratives`).** *Guide text, verbatim:* Batlin's identity (Balanced); the Trinsic event sentence; the escape-vessel method (“his escape vessel (the Crown Jewel)”); a guide-only Trinsic summary (the event sentence and the suspect-and-vessel sentence, in that order); the Destard errand purpose (“it's a trap, so be cautious”); two **steps** sequences (“Caine will then reveal the 'answers'”, “…(after the Tetrahedron is down)”); the Black Gate outcome (“destroy it and save Britannia”); and relationship lines from the atlas at Balanced (Spark: Christopher's son; Ellen: wife of Klog; Jergi: brother of Frederico; Tania: wife of Frederico; Sasha: son of Frederico and Tania). *Cited outside research (Ultima Codex pages, checked 21–22 October 2026, own words, Direct):* Christopher's murder cause (the Fellowship had him murdered to silence him, given the sensitivity of the operation, after he had made motions to leave) and, as a separate **hedged** facet, why he wanted to leave (the Codex says “apparently” it had roots in a commission from Klog and offers two possibilities for what he did with it); the **disputed** motive for Inamo's death (three separately attributed accounts: the Inamo article says likely an unexpected bystander, the Christopher article says apparently killed so he could not witness the crime, the Klog article says killed to silence a witness); Inamo's method, concisely (killed with a pitchfork, one source); the Crown Jewel leaving port immediately after the killings and later found empty on the Isle of the Avatar (as an **events** sequence anchored to the ship, a second sequence anchored to the Trinsic killings, and an outcome); Hook's identity (a former pirate who became the Fellowship's grand executioner, assisted by Forskis) and his death at the Avatar's hands, each also as an authored event for “what happened to Hook / Christopher”; the Fellowship's identity (founders and inner circle) and purpose (a harmless-seeming philosophy that the Codex says is really a criminal cult serving the Guardian); two Klog facets (he hired Christopher; his alibi claim, as an events sequence), an explicit relationship for the Fellowship's founders (Batlin, Elizabeth and Abraham founded it), and a Crown Jewel event facet for “What happened to the Crown Jewel?”. Facts are stored as `storyOnly` research entries, which the adapter exposes only as facts (no standalone identity records). Where a source needed softening, a correction from Codex's source review was applied (the Christopher cause was split into an unhedged killing cause and a hedged leaving cause).

**Deliberately not added:** Elizabeth's and Abraham's hedged participation in the Trinsic murders (framework support for `hedged` is enough this round); the Fellowship's origin dispute (one page only); Batlin's later plan to betray the Guardian (the page calls it an inference); Hook's hiding place (the page contradicts itself); a cause for “Why did Hook kill Inamo?” (the source attributes the killing to the assassins jointly, so it stays unsupported); anything from the SNES port; and any facet inferred from list order or an unsourced connective. A guide “when you return” sentence is a purpose, not a sequence, because it has no word from the fixed temporal list.

**Fixtures.** `nar-u7-01…27, 29…37` in `sim-ultima7-cases.json` (answers with labels and citations; the disputed motive; the guide-only summary with no research label; relationships at Balanced) with negatives: hidden below Direct (Gentle and Balanced give the neutral “no sourced answer” and show nothing), “according to the guide”, the SNES version, Mars, unrelated people (Iolo, Spark), a wrong action (“Why did Hook join the Fellowship?”), no inverse relationship (“Who is Christopher's father?”, “Who is Ellen's husband?”, “Who is Christopher's son?” at Gentle), “How did Hook kill Inamo?” and “Why did Klog hire Christopher?”. `res-u7-16` (“Why was Inamo killed?”) changed on purpose from a decline to the disputed answer, with a note. `narrative-ultima7-pending.json` (not loaded by `english.mjs`) holds the cases the data supports but the engine did not parse when written, plus several that are unsupported on purpose and carry notes (“How did Hook escape?” because the guide's escape-vessel sentence is about an unnamed suspect; “What is the next step after Caine reveals the answers?” because that would reverse the anchor of “Caine will then reveal”; “How does the game end?” (not an indexed question); “Why did Batlin send me to Dungeon Destard?” (the trap sentence is a warning, not a cause-of-assignment record); “Did Klog have an alibi?” (a yes/no verdict, not a sequence question); “Where was the Crown Jewel found?” and “How did Hook die?” because they need their own indexed question or facet, not an automatic substitution from an outcome; the bare “What comes after the Tetrahedron is down?” because it is chronology-ambiguous: the supported form is “What is the next step after the Tetrahedron is down?”). Cases listed there as pending (escape, the Crown Jewel, Inamo's method, the next step after Caine, how the game ends, why Batlin sent the Avatar to Destard, the Klog alibi, “What happened to Christopher / Hook / after the Trinsic murders?”, the hedged leaving cause, and “Why did Hook kill Inamo?” as a negative); Codex consumes it in its own runner. Codex's `narrative-records.test.mjs` and `narrative-questions.test.mjs` cover the framework.

### Narrative expansion across all six guides (22 October 2026)

At the owner's request Codex used three Luna workers for separate game adapters/overlays, then reviewed and corrected their source meanings and ran the complete acceptance suite. Claude was not contacted or involved. The existing Ultima VII facets remain; the other five guides now supply 91 additional reviewed facets through the same `buildNarrativeRecords` contract. All new facts are extracted from existing guide objects or the live StarCraft DOM; this round added no outside research, dependencies, models or network inference.

| Guide | New facets | Supported indexed aspects |
| --- | ---: | --- |
| Albion | 14 | 10 summaries, 2 explicit guide-step sequences, 1 method, 1 outcome |
| Ultima V | 26 | 18 outcomes, 2 summaries, 2 methods, 2 guide-step sequences, 1 identity, 1 directed relationship |
| Ultima VI | 22 | 11 companion identities, 10 quest/act summaries, 1 guide-step sequence |
| Al-Qadim | 21 | 16 chapter summaries, 2 purposes, 2 methods, 1 outcome |
| StarCraft/BWAPI | 8 | 1 summary, 1 hedged cause, 1 guide-step sequence, 1 purpose, 3 methods, 1 outcome |
| Ultima VII (retained) | 30 existing | All nine narrative aspects, plus its 8 existing story roles |

These are indexed accounts, not a promise to answer every question in each aspect. Legacy sourced identity descriptions remain in use where a typed duplicate would suppress their notes or stable IDs (Albion and SCHNAIL). All 2,777 preexisting non-story/non-narrative records in the five Node-loadable guides are structurally unchanged. Existing edition conflicts, recruitment declines, atlas filters and source restrictions remain intact. StarCraft remains a technical setup guide; no campaign lore was introduced.

**Meaning corrections from review.** Imperative chapter/quest text is a summary or procedure, never evidence that an event already occurred. Ultima V outcomes remain the guide's stated results, not saved-progress claims. Outcome focus names the action/item whose result is requested: Al-Qadim's banishment is the result of Muliban's accusation, so asking for the outcome of the banishment cannot return the accusation as its consequence. The HMS Cape, Sceptre and Amulet outcomes include their exact objective titles as separate source claims so their item focus is grounded. No reciprocal or causal relationship is generated from nearby names. A narrow SCHNAIL antivirus sequence cannot answer an unspecified setup-next-step question.

**Reusable reader improvements.** `What is the method for/of …?` selects a reviewed procedural method without inventing a historical actor; existing gameplay how-to handling remains. An explicit `after` anchor can match a source's `then` clause (for example, asking Greyson), with the source-order guard still rejecting the later action or an incorrect actor as the anchor. Sequence matching requires an explicit focus or a validated temporal anchor rather than fragments of a long title. Authorized numbered names such as `Chapter 2` are consumed as subject names; additional numbers remain restrictions and must occur in the source. Remastered-specific StarCraft facets explicitly carry their sourced edition.

Examples: `Summarize Maini`; `What is the outcome for the Sceptre?`; `What is the next step after asking Greyson?`; `Summarize the Merchants' Circuit`; `What is the method for getting the Family Sword of Honor?`; `What is the outcome of the genie Muliban's accusation?`; `Why does the first launch take some time?`; `What is the method for the Remastered SCM Map?`. The SCHNAIL first-launch cause keeps the source's “might” and the tentative-account lead. Unknown motives, wrong actors/actions, reversed outcomes, unsupported editions and hidden facts still decline.

**Validation.** New per-game suites are `narrative-expansion-{albion,ultima5,ultima6,alqadim,starcraft}.test.mjs`. `narrative-all-games-cases.json` is a separate meaning fixture consumed by `narrative-all-games.test.mjs` and the actual UI probe `narrative-all-games-browser.py`; no old shared fixture expectations were weakened. The final cross-guide probe checks 62 real UI replies across all six surfaces, citations/source text, hidden facts, offline replies and byte-identical saved progress. `narrative-expansion-starcraft-browser.py` checks all eight live-DOM facets and its 17 questions. Both block non-loopback requests. The source/metadata/definition-count tests reject silently dropped facets.

Final results: original **203/203**, English **1052/1052** (967 questions), standalone story/narrative **648/648**, all **14 browser suites** exit 0, and both page-fact checkers print `ok`. The 13,311-mutation typo report is exactly identical to the prior final baseline: 90.1% recovered, 0.37% wrong subjects, ordinary-word corrections 0/234, hidden-name leaks 0/458, existing gibberish suggestion 1/300. Logs and source-hash audit: `/tmp/codex-all-guides-32bbypv5` (temporary); retained UI transcripts/screenshots: `guides/tests/assistant/evidence/narrative-all-games-*` and `narrative-expansion-starcraft-browser.json`.

Latest gzip estimates are 67.1–74.2 KiB for shared engine plus one adapter and 77.6–87.9 KiB including its overlay, still above the owner's accepted soft 50 KiB target. No commit, push, deployment, branch change, install or saved-progress migration was performed.

### Walkthrough audit and robustness round (Claude, 22 October 2026)

An independent read-only audit, then 92 questions written from outside walkthroughs (Ultima Codex for Ultima V/VII, GameRevolution for Ultima VI, Cyberly for Albion, Sorcerers.net for Al-Qadim, BWAPI setup docs for StarCraft), found no invented facts and no Gentle leaks, but two off-target answers, a guide-only leak, a history spoiler leak and 22 guide-covered questions that were not answered. The owner approved fixing them in the shared engine. No overlay, adapter or guide page changed.

| Fix | Where | Before → after |
| --- | --- | --- |
| Guide-only wording anywhere (`Using only the guide, …`, `From the guide, …`, `Per the guide, …`, `Guide only: …`, a closing `Use the guide only.`) | `language.js` `GUIDE_SOURCE`, lead-in rewrite in `parse`, `part.guideOnly`; engine story, narrative and general paths | Only `According to the guide, …` worked; the others showed outside research → research excluded everywhere |
| A combined reply with a declined part carries the current spoiler level | `engine.js` `compose` | `Where is Iolo? Who killed Lap-Lem?` at Balanced stayed visible at Gentle with “I found the entry for Lap-Lem” → hidden like any declined reply |
| `found` is a location only as a participle (`where … found`, `is/can be found`) | `language.js` location intent | `What did Batlin found?` answered Batlin's atlas line → menu |
| `What does X give me?` needs an effect/stats fact or text saying what is given | `engine.js` general path | `What does Lord British give me?` → “Lord British: The king.” → decline; `What does the Crown give me?` still answers |
| A singular/plural of a lowercase generic alias (`code`/`codes`, `mage`/`mages`) is the same word, not an announced misspelling | `retrieval.js` single-alias typo matcher | “I don't know anything about ‘code’. Did you mean …?” → plain answer; proper-name typos are still announced |
| A decline caused by the current topic names it | `engine.js` `topicNote` | “I don't have a sourced answer …” → “… I looked only at the current topic, Iolo. Name another subject or event, or reset the topic.” |
| `Why?` after `Who killed whom?` covers every person that answer named | `engine.js` narrative implicit focus | Christopher's reason alone under “The Trinsic Murders — Reason” → choice between Christopher's and Inamo's (disputed) accounts |
| A topic quoting a role's exact source sentence keeps that role in scope | `engine.js` story implicit focus | `Tell me about the Crown Jewel` then `Who is the suspect?` declined → suspect clue |
| `Who has X?` asks how to get it (hint at a lower setting) | `language.js`, `engine.js` | Menu → acquisition steps (Grapple, runes) |
| `X's Y` is about Y when Y is its own subject and Y's guide passage names X | `engine.js` | `Where do I take Batlin's package?` declined → Elynor in Minoc; `Klog's package` still declines |
| `talk`/`speak` are question wording; `Who should I talk to about X?` is a hint request | `language.js` | `How do I talk to the wisps?` declined → whistle steps |
| `destroy`/`banish` ask how to beat an enemy, or for a hint otherwise | `language.js`, `engine.js` reread | `How do I destroy a Shadowlord?` menu → combat entry; `destroy the Black Gate` keeps its hint |
| An unsupported purchase method lists what the guide does record; non-relationship narrative declines no longer say “relationship question” | `engine.js` | Clearer declines (Al-Qadim gilded dove, gatekeeper genie) |

**Tried and withdrawn because earlier negative cases protect owner decisions.** A labelled “where is it → how to get it” fallback revealed Direct-only places at lower settings (`where is the vortex cube` at Balanced would name Stonegate; `sim-u6-quest-12`) and gave weak answers (`sim-u5-36`, `sim-u5-84`); the existing decline already offers “how to get it”. Trust questions (`Is Saduj trustworthy?`, `en-u5-neg-01`, `adv-neg-01`) stay unanswered. A soft “What happens if …?” outcome reader gained nothing on the walkthrough set and conflicted with `narrative-questions.test.mjs`. No existing fixture or test expectation was changed.

**Walkthrough results** (78 Node-runnable questions, Direct): 36 correct guide answers (30 before this round), 31 fair declines where the guide is silent, 10 known gaps where the guide has the answer but the wording is not recognised (for example `What do I need to wear in the gargoyle land?`, `What potion do I drink on the chessboard?`, `Where is the Rune of Honesty?` which declines and offers how to get it), and 1 owner decision (trust). No off-target answers remain in the set. Guide-versus-walkthrough disagreements for the owner: the Ethereal Ring's source (guide: Lord Draxinusom in Terfin; walkthrough: Spektran), the Goddess's Flowers (+3 to each stat vs. +3 to one attribute of the leader) and the Wisest Snake (Western Desert vs. bought at Reptilian Desires). Albion's guide labels both 1042 (Toronto intro) and 1712 (Toronto Again) as service-level codes, so `What is the service level code?` answers with the later one.

**Tests.** `walkthrough-cases.json` + `walkthrough.test.mjs` hold the 78 questions with reviewed Gentle and Direct expectations and verdicts (`pass`, `fair-decline`, `gap`, `owner`); a `gap` should be flipped with a note when it starts answering correctly. `robustness.test.mjs` covers every fix with negatives. Run against the pre-round code, 31 of these 183 checks fail; against the current code all pass.

Final results: original **203/203**, English **1052/1052**, standalone story/narrative/robustness/walkthrough **831/831** (840/840 after the closest-text step below, with the same 14 browser suites, page-fact checkers and typo totals) (`node --test guides/tests/assistant/*test.mjs`), both page-fact checkers `ok`. All **14 browser suites** exit 0 (English browser 336/336), run from a synced copy on loopback so evidence files were not rewritten in the shared tree. Typo benchmark: 90.1% recovered (unchanged), wrong subjects 0.37% → 0.36%, ordinary-word corrections 0/234, gibberish 1/300 and hidden-name leaks 0/458 (all unchanged). Gzip: engine plus one adapter 69.3–76.5 KiB, with overlay 79.9–90.2 KiB (the three changed modules add about 2.3 KiB). No commit, push, deployment, install or saved-progress change.

### Closest guide text (Claude, 22 October 2026, owner approved)

When nothing understood a question (the “I could not find that …” reply or the “What would you like to know …” menu), the engine appends up to three guide sentences that share most of its words, under “The closest guide text I found (it may not answer your question):”. It is a `clarify` reply with no `recordIds`; the sentences' records are in `closest` and their sources are attached for the citation line. It never changes the conversation subject. `closestText` in `engine.js`:

- uses only records visible at the current setting, never outside research, story roles or narrative facets;
- is skipped for any restriction, negation or ranking word (`on Mars`, `not`, `only`, `best`), so a partial match can never stand in for a restricted answer;
- needs at least two meaningful words, a sentence matching at least 60% of them (minimum two), and at least one match on a descriptive word rather than a name (short titles and aliases count as names; a whole-sentence objective title does not). A shared name alone is never evidence, which keeps the existing negatives `sim-alb-063` (Khunag for Kenget Kamulos), `sim-alb-028` (Krondir drops), `kn-u6-neg-01` (troll trivia) and the reset dialogue `en-dlg-alb-reset-clears-frame` intact;
- does not touch declines for a recognised subject, restriction declines, story/narrative declines or choices.

Examples: `What do I need to wear in the gargoyle land?` → “Secure Diplomatic Access: Wear the Amulet of Submission to move freely and earn gargoyle trust.” (Direct only; nothing at Gentle, where that sentence is hidden); `What potion do I drink on the chessboard?` → the objective “Drink the potion, cross the South chessboard path …”. `Where is the ninth map piece?` shows Ybarra's map-piece sentences, which do not say “ninth”; the label is why that is acceptable. The hidden-versus-absent sweep (4,522 questions) gives the same 10 known wording artefacts as before and none from this reply. `walkthrough-cases.json` now records reviewed `closest` expectations (walk-43, walk-77 and two fair declines), and `robustness.test.mjs` covers positives, the Gentle boundary, hidden-versus-absent and the silent cases.

### English paraphrase and dialogue suites

`english-cases.json` holds natural paraphrases, multi-part questions, follow-ups and negative grounding cases for all six guides. `english.mjs` runs the five Node-loadable guides: **59 questions, 20 dialogues and 11 invariants, 90/90 passing**. The invariants cover:

- restrictions surviving filler removal
- bounded splitting
- “I meant” never being a report
- twelve non-assertions changing no progress
- composite spoiler level and hiding
- per-component sources and conflicts
- stale descriptive choices after a spoiler change
- state clearing on reset/topic change
- adapter-explicit effect mapping only
- checklist order not being a prerequisite
- visitor text stored verbatim

The cases were written after the parser design and before their first execution. The first run (`english-first-run.json`, then 59 questions and 17 dialogues) passed **82/87**. Its failures were real gaps, and they were fixed:

- inflected verbs such as “recruiting” counted as restrictions
- a same-message pronoun to a subject without the relationship clarified instead of declining
- a second named merchant blocked the purchase answer

Two topic-clearing dialogues had wrong expectations, because a relationship asked in a clarified turn legitimately carries to the next “X?”. They were reordered to test clearing without contradicting that. Later probes added possessives, “how much damage”, merchant “sell”, “set it up”, and restriction inheritance through ellipsis and pending choices. Three dialogues were added for those. This is acceptance evidence written by the implementer, not an independent blind accuracy estimate.

`english-browser.py` drives the real UI of all six pages. It blocks and records every non-loopback request. Per guide it checks:

- a paraphrase, a multi-part question and a follow-up through the page's own input
- that lowering the spoiler control hides the earlier composite answer
- a follow-up answered with networking disconnected
- that injected markup stays inert text
- that saved-progress `localStorage` keys are byte-identical

It also runs the StarCraft English dialogues against the page's live assistant, whose facts the adapter extracts from the real DOM (StarCraft cannot run in Node). Result: **80/80 checks, zero external requests, zero page errors**. The seven existing browser suites were rerun afterwards and all exited successfully.

Browser coverage includes all U6 opener kinds (quest, side quest, marker, layer), U5, all 29 Sage quests and 19 Genie chapters at three levels, both Genie surfaces, Chronicle, journals, actual atlas callbacks, existing checklist/field-kit controls, mobile rendering, lower/reopen history, delayed-loading changes, malformed/missing static knowledge, and model-route failure guards. The 144 Sage/Genie variant probes and 289 U6 context smoke checks are structural coverage, not additional independent questions.

Run with an existing Node runtime:

```sh
node guides/tests/assistant/run.mjs
node guides/tests/assistant/english.mjs
python3 guides/tests/assistant/measure-assets.py
```

This workspace's bundled Node was `/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` (v24.19.0). No `npm install` is required. The runner uses Node built-ins and native modules only. Its trusted source-declaration VM loader is test-only, not deployed visitor interpretation.

For browser acceptance, the existing Python Playwright package and `/usr/bin/google-chrome` were used. If unavailable elsewhere, obtain permission before installing anything. Serve the repository over loopback HTTP (native modules need correct JavaScript MIME types):

```sh
python3 -m http.server 8766 --bind 127.0.0.1
# Separate terminal:
python3 guides/tests/assistant/english-browser.py
python3 guides/tests/assistant/albion-browser.py
python3 guides/tests/assistant/ultima-seers-browser.py
python3 guides/tests/assistant/starcraft-browser.py
python3 guides/tests/assistant/genie-sage-variants-browser.py
python3 guides/tests/assistant/genie-sage-fixtures-browser.py
python3 guides/tests/assistant/genie-sage-browser.py
python3 guides/tests/assistant/genie-sage-state-browser.py
python3 guides/tests/assistant/performance-browser.py
```

`ASSISTANT_BASE_URL` overrides the loopback origin in the relevant scripts. Exact retained browser logs/screenshots are under `evidence/`, `results/`, and `ultima-seers-results/`. See also `README-genie-sage.md` beside the runners.

## Measured budgets

Measurements use existing **Google Chrome 156.0.8078.47**, Linux x86-64, **Intel Core i7-12700**, desktop 1280×900 and selected 390×844 mobile-layout checks. These are desktop measurements, not mobile hardware or cross-browser claims. These historical symbolic-engine measurements predate the optional model. The current legacy performance suite uses a worker fixture and does not measure neural-model loading/RAM; the optional 162 MB download and its memory are outside the old symbolic-engine budget.

Measurements were refreshed after the English-language work (`language.js`); earlier figures are given in parentheses. The table below was re-measured on 21 October 2026 after the resolver cache (below); the parentheses are the figures from before the typo, organization and story work later the same day. Note: the stock `performance-browser.py` Ultima VII call passes no atlas markers, so its row measures 196 reference records, not the full 686-record live page; the full-page figures need the real UI probe. It was previously re-measured after the shared-engine gap round (parentheses are the 20 October figures; the browser machine was noisier this run, so single-digit-millisecond differences are not meaningful) (single run each of `performance-browser.py` and `ultima-seers-browser.py`). The native Node suites measured p95 of about 7 ms for both `run.mjs` and `english.mjs` on that run (earlier: 4.1 and 3.8 ms; noisy). Node timings include the first-question compilation of the parser's patterns. Browser measurements and asset sizes are retained in JSON, including their measurement boundaries. Browser painted-reply measurement spans two animation frames after rendering, not physical display latency.

| Guide | Preparation including extraction | Index preparation | Warm compute p95 | Painted reply p95 | Retained heap measured |
| --- | ---: | ---: | ---: | ---: | ---: |
| Albion | 5.2 ms (4.3) | 3.8 ms | 0.4 ms (0.3) | 33.5 ms | 1,737 KiB (1,488), records/session/view |
| Ultima V | 6.9 ms (5.5) | 4.2 ms | 0.5 ms (0.2) | 33.7 ms | 1,974 KiB (1,695), records/session/view |
| Ultima VI | 30.0 ms (31.4) | 9.2 ms | 0.6 ms (0.4) | 33.6 ms | 4,334 KiB (3,904), full additional heap |
| Ultima VII | 10.9 ms (7.3) | 5.4 ms | 0.4 ms (0.3) | 33.8 ms | 2,163 KiB (1,856), records/session/view |
| Al-Qadim | 8.7 ms (5.4) | 5.9 ms | 0.5 ms (0.4) | 43.7 ms | 1,799 KiB (1,544), records/session/view |
| StarCraft | 8.3 ms (7.1) | 5.1 ms | 0.8 ms (0.3) | 33.7 ms | 2,196 KiB (1,932), records/session/view |

Ultima VI's row comes from its integrated Seer acceptance run. The other rows come from 100-decision supplemental runs using the actual adapters and shared renderer, after module/source loading; their heap figures exclude those already-loaded modules and canonical data. Differences in small timings reflect run variability.

**Heap increase (re-measured 21 Oct 2026).** Ultima VI's full additional heap is now about 3.3 MiB (one run: 3,447,417 bytes) and the other guides retain about 1.3–1.6 MiB, from the larger record sets and compiled patterns; still far below the 15 MiB budget. Earlier analysis follows. Retained heap rose by about 340 KiB per guide, and by about 0.85 MiB in Ultima VI's full measurement; repeated U6 runs gave 2.00–2.05 MB. Node heap isolation attributes this mainly to one-time compilation of the parser's intent and framing patterns: about 0.3–0.4 MB on the first question, then about 3 KiB per further question with bounded history. Compiled edition patterns are cached per guide (at most 16). The increase does not grow with conversation length and remains far below the 15 MiB budget on this host. It is still a real cost of rule-based English handling, not measurement noise.

**Per-file gzip estimates (`measure-assets.py`, final run of 21 October 2026 after the typo, organization and story-question work) are 56.4–63.4 KiB for shared engine plus one adapter: StarCraft 56.4, Al-Qadim 58.1, Albion 60.9, Ultima VI 61.1, Ultima V 62.7 and Ultima VII 63.4 KiB; first use including the overlay is 66.2–74.5 KiB gzip. The original 50 KiB budget is exceeded by every guide (it was 47.7–54.0 KiB earlier the same day, so the typo handling, the story engine and the new records added roughly 9 KiB). The owner accepted exceeding it (it is small next to the guides' videos and images); new content should still go into the overlay JSON rather than the engine.**

The largest measured real preparation was Ultima VI at 17.6 ms (12.9 ms extraction + 4.7 ms index). Its original per-marker route reconstruction exceeded the 50 ms single-task target; reusing one route snapshot removed that cost. Measured preparation tasks are below 50 ms; existing full-guide startup tasks are separate and remain visible in the raw performance log. All measured reply/initialization timings are within the proposed budgets on this host.

Supplemental per-adapter retained records/session/view measurements exclude already-loaded modules and canonical guide data and are labeled accordingly. Albion's post-cap stress loop in its acceptance run added about 15 KiB after GC with contexts/messages still bounded. These observations support the 15 MiB budget on this host, but are not a full browser matrix or a production memory guarantee.

## Deployment boundary and remaining limits

The owner explicitly approved limited FTP publication on 23 October. Local
`guides/` maps to remote `/guides`, local `default/` to `/personal-website`, and
Classic to `/site6`. Only 135 selected runtime files were uploaded: 71 guide
files and 64 main-site offline-reading files. This included the model profile
and all 18 parts, but no tests, trial downloads, screenshots, documentation or
development tools. Classic and all other remote directories were untouched.
No folder was mirrored or cleared; obsolete prompt files were left remotely.

All 79 overwritten files matched the expected baseline and were backed up
locally first; 56 files were new. The frozen binary upload package used checked
temporary-file transfers with assets before pages and release metadata last.
All 135 remote files passed complete SHA-256 readback verification. Public HTTPS
checks matched all eight cache scripts/manifests/version markers, and the guide
`/php/llm.php` route now returns 410. **Provider credential revocation and other
possible deployed endpoint copies remain unverified.** No provider was called,
no key was changed, and no repository commit or push was made. The private
manifest/rollback backups and verification reports are in
`/tmp/orilla-ftp-20261023T115313Z`; the handoff records the precise scope.

The separate guide-reading cache exists in `guides/offline.js` and
`guides/service-worker.js`. Model parts and profile metadata use separate caches.
Local acceptance verified visited Ultima VI and VII guides reloading offline
and running guarded inference from cached files. Offline availability depends
on which guide assets were saved and browser storage availability. Prepublication
offline-cache suites passed 26/26, and publisher unit checks passed 8/8.

Production checks exposed preexisting CRLF bytes that did not match local
manifest hashes. A read-only size audit covered 1,012 untouched text assets;
982 changed-size files were read back: 980 differed only in line endings,
and two had other existing differences (Leaflet CSS and the main-site web
manifest). None was overwritten. Production-specific manifests index those
actual bytes. Only four files within the original 135-file selection were
revised and verified again by FTP and HTTPS. Source manifests remain local
checkout artifacts. Future partial publications must reconcile the live
manifest baseline before updating uploaded entries; a full local rebuild would
reintroduce old-asset hash mismatches if those assets are left on the server.

Public browser acceptance passes **35 real-guide checks** across all six games
and **17 offline checks** covering the main About page, Browser Gaming article
and guide hub. Native model generation, consent, cache reuse, exact sourced
fallbacks and unchanged saved progress pass. Main pages retain working legacy
scripts offline, with zero final page errors. Existing Cloudflare performance
beacons POST metadata; the question audit records these separately and found
no tested question text or inference request in outgoing traffic. Earlier
failed checks remain recorded, not counted as passes. No page content or legacy
script was changed to pass acceptance. Final proof, prepared metadata and
private rollback files are in the package above (`deployment-acceptance.json`).
No tests or diagnostic outputs were uploaded.

Knowledge remains limited to reviewed existing content and authored overlays. Many relationships/prerequisites are unmodeled, facts may vary by edition, and conflicting source material is withheld. There is no claim to cover every game question or match an LLM's open-ended conversational breadth. In-browser neural models were piloted separately: SmolLM2 and Bonsai were rejected for answer quality, and Bonsai also for replies taking minutes. Those original unrestricted pilots were removed. The subsequent owner-approved constrained SmolLM2 integration described above is now used after visitor consent; unrestricted factual generation remains excluded. Firefox, mobile hardware and production performance/compression remain unmeasured. The deployed guide PHP route was checked only for its inactive 410 response.
