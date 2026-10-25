# Wider cached corpus: source-understanding gap audit

Audit date: 2026-10-25. This is a read-only review of the 94 positive strict
failures in
`guides/tests/assistant/intent-prototype/results/knowledge-corpus-replay-capability-roles-20261025-04/report.json`.
That report records 757/851 strict passes, zero incomplete turns and zero
missing exact inputs. It predates the new software procedure-field integration.
It must remain preserved as an earlier observation, not rewritten as a current
result.

## Evidence and limits

All 94 failed questions, their preceding dialogue turns, expected claims,
reported decisions, selected fact IDs, citations and diagnostics were examined.
Their expected focused facts were read in the six current knowledge manifests.
The relevant authored claims were also checked in the base JS/HTML, including:

- Ultima VI: `guides/js/Ultima6.js`, lines 192–217, 375–380 and 435–436.
- Ultima VII: `guides/js/Ultima7.js`, lines 6–9, 53–68 and 77–81;
  `guides/Ultima7.html`, line 299. Arcadion's focused identity points to
  `guides/js/Ultima7Markers.js`, `ULTIMA7_MARKERS[491]`.
- Ultima V: `guides/js/Ultima5.js`, lines 311–312, 342, 370, 393, 430–436,
  453, 484 and 487–501.
- Albion: `guides/js/Albion.js`, lines 164–188, 383, 457–495, 530–534,
  787 and 801–847.
- Al-Qadim: `guides/js/AlQadim.js`, lines 100, 162–163, 224–226, 291 and
  368; `guides/AlQadim.html`, lines 210 and 227–229.
- StarCraft: `guides/StarcraftBWAPI.html`, the comparison cards, Java
  prerequisites, BWAILauncher setup/portable blocks, map mode, SCHNAIL network
  note and community links. The external-research records were inspected as
  existing reviewed local claims with their reference metadata, not fetched or
  independently revalidated against current upstream software.

**The cached report does not contain rendered answer text.** Its per-turn fields
include `decision`, `factIds`, `sources` and `problems`, but no reply body. A
selected fact is not proof that its complete text was shown or that the reply
was correct. Conversely, an absent focused fact ID does not prove the answer
was missing: the original source engine can answer without focused IDs.

The complete replies in `knowledge-blind-browser-native-46.json` (96 turns),
`knowledge-blind-browser-fresh-20261025-35.json` (76 turns) and
`knowledge-blind-browser-independent-all-20261025-26.json` (48 turns) were
searched by game and exact question against these 94 failures. There are **zero
exact-question matches**, hence zero exact-question-and-context matches. Their
successful paraphrases must not be substituted for these failed conversations.
No complete cached reply is qualitatively adjudicated as correct in this audit.

| Game | Strict failures | Observed abstention | Missing expected phrase indicator | Metadata only |
| --- | ---: | ---: | ---: | ---: |
| Ultima VI | 5 | 2 | 3 | 0 |
| Ultima VII | 20 | 10 | 2 | 8 |
| StarCraft | 24 | 14 | 9 | 1 |
| Ultima V | 14 | 8 | 6 | 0 |
| Albion | 21 | 14 | 2 | 5 |
| Al-Qadim | 10 | 8 | 2 | 0 |
| Total | 94 | 56 | 24 | 14 |

These columns describe the available evidence, not factual-accuracy classes.
“Abstention” means the reported decision was clarify/decline when the oracle
expected answer. Six of these are Al-Qadim objective-only cases requiring policy
review rather than a fabricated procedure. “Missing expected phrase” means the
checker reported a literal substring absent; synonymous or narrower valid
answers remain possible. “Metadata only” means all reported expected content
substring checks passed and the remaining failures concern IDs or provenance.
It does not independently establish semantic correctness.

## Priority mechanisms

1. **Bind the requested capability and procedure phase before choosing a
   passage.** Across all six games, present sources distinguish acquisition,
   effect, preparation, route entry, continuation, completion and escape.
   Chuckles start/follow are reversed in the cached selected proofs; Amulet
   acquisition selects an Amulet-to-Doom use; Courage completion selects the
   earlier dragon/reward phase; launcher purpose selects the launch executable;
   Efreet Potion effect selects a drinking/travel step. These are concrete
   source-selection risk indicators, not a reason to add question aliases.
   The selected proof should demonstrate the requested role and phase with all
   source restrictions, while a complete reply must still be inspected.
2. **Carry a bounded field of the returned source procedure.** This covers
   selected executable, saved-settings location and after-saving instruction;
   north cabinet contents; the blue-lens provider's requirement; Cape plans'
   effect; Toronto codes' first-member origin; and the held AI Housing's control
   tactic. The context must be the complete actual returned proof, with typed
   ownership, list order and source eligibility. A failed prior acquisition
   cannot silently supply the next pronoun. The new software helper covers six
   cached StarCraft turns at the focused contract level; integrated results are
   still required.
3. **Read static restrictions, alternative routes and counterclaims from
   complete source proof.** Carpet mountain limits, hourglass ordering, optional
   Truth puzzles, Courage's later completion, Honor's alternative, shard
   depletion, BWAPI defaults, map mode/maps and version caveats all exist in
   the sources. A bounded response may quote those claims without inferring
   the player's inventory, success or current compatibility. A bare number or
   negation must not disable an otherwise fully grounded source answer, nor
   authorize unknown quantities or editions.
4. **Keep actor, training, container and component roles separate.** Sira and
   Harriet have explicit school/practitioner/trainer/location evidence; Conor
   is the Humility answer; BOSS is UAlbertaBot's build-order component; a
   subreddit is a different support-link type from GitHub Discussions. Similar
   words or a shared owner are insufficient. Ephemerides's glass-sword trade
   requirement must not become the player's current possession.
5. **Separate semantic review from strict provenance compatibility.** Fourteen
   failures are metadata-only in this report. Examples include parent versus
   child locators, duplicate focused facts with identical source text, and
   original-engine answers with no focused ID. Preserve the frozen oracle,
   record both strict status and complete-reply review, and retain exact source
   provenance. Do not spend the next implementation pass forcing an arbitrary
   focused ID when the missing evidence is the actual response text.

## Complete failure inventory

Each row below is one cached failed turn. `A` denotes observed abstention; `C`
denotes missing expected phrase indicators; `M` denotes metadata-only failure.
All rows lack complete-reply evidence. The notes identify a source-supported
mechanism or a reason the strict expectation may be too narrow; they do not
declare a cached answer factually correct based on a selected ID.

### Ultima VI — 5

| Dialogue / turn | Question | Evidence | Source finding and action |
| --- | --- | --- | --- |
| humility-riddle / 2 | Who is the humble villager? | A | HUMILITY questioning explicitly identifies Conor. Read the answer role in the active riddle, rather than requiring an explicit name in the question. |
| tablet-leads / 3 | How do I ask the gypsies about the tablet? | C | The selected `zoltan-tablet-keyword` says to say TABLET for the Homer lead. The oracle additionally requires Buccaneer's Den from the longer step. This is a possible scope/granularity mismatch: asking how to ask need not demand the later destination. Complete reply needed. |
| clue-hunt / 1 | How do I start Chuckles Trail? | C | The source starts with Chuckles and Nystul's chest; selected proof is the later scroll chain. Phase-selection risk. |
| clue-hunt / 2 | How do I follow Chuckles scrolls? | C | The source gives plant, beehive, harpsichord, beds and cauldron; selected proof is the opening chest step. Same phase mechanism, opposite direction. |
| followup-blue-lens / 3 | What does he need? | A | Ephemerides's trade explicitly requires a glass sword. Ground the actor and requirement from the preceding blue-lens proof. |

### Ultima VII — 20

| Dialogue / turn | Question | Evidence | Source finding and action |
| --- | --- | --- | --- |
| trinsic-evidence-password / 1 | How do I investigate the Trinsic crime scene? | M | Only exact locator differs: expected `DB.mainQuest[0]`, reported `.content`; same selected focused fact and required stables/key substrings. Provenance granularity candidate, not an established missing answer. |
| trinsic-evidence-password / 3 | How do I get the Trinsic exit password? | M | Required password/Finnigan/quiz substrings and focused fact pass; only expected source-record ID fails. Inspect full reply before semantic adjudication. |
| wisp-honey-whistle / 3 | How do I get wisp whistle? | C | Selected `whistle-provided` literally records negotiating with emps for the whistle. Missing Alagner/notebook belongs to using the whistle and the later information exchange. Likely over-scoped expectation candidate; do not make that later dependency a whistle acquisition prerequisite. |
| alagner-skara / 1 | What is Alagner request? | A | Direct source request: learn life/death answers from Skara Brae, Alagner in New Magincia. Actor-request field exists. |
| sphere-hourglass-prerequisite / 4 | Can I enchant the hourglass before the Tetrahedron is destroyed? | A | Explicit source parenthesis requires after the Tetrahedron is down. Static ordering proof can answer without asserting user progress. |
| truth-true-locket / 4 | Are all optional puzzles required to get the true locket? | A | Source places true locket before labyrinth and labels other puzzles optional. Requires complete two-part proof; no universal inference from one optional label alone. |
| truth-true-locket / 5 | What do the optional Truth puzzles offer? | A | Literal outcome is dangerous but valuable loot. Reward field is present. |
| love-two-rituals / 3 | How do I get the Talisman of Love? | M | `talisman-love-method` and expected `test-love-definition` have identical ritual/twice/reward text. Required content/source checks pass; focused-ID mismatch only. |
| courage-ether-gem / 2 | How do I get Dracothraxus reward? | M | Reported dragon/reward and later-finish proofs pass required Dracothraxus/Ether Gem text, but differ from expected shorter fact and provenance. Do not infer full-answer correctness from either proof set. |
| courage-ether-gem / 3 | How do I finish Courage test? | C | Earlier source expressly says test continues later; finale says return and invoke Black Sword. Select terminal phase, not the first reward. |
| courage-ether-gem / 4 | Does obtaining the Ether Gem automatically finish Courage? | A | Earlier “continues later” and finale jointly reject premature completion. Quote both without reporting user success. |
| arcadion-black-sword / 4 | Is Arcadion a benevolent human blacksmith? | A | Identity source says bound daemon. False-premise identity request should preserve source wording rather than invent temperament or occupation. |
| dark-core-stat-caveat / 1 | How do I use Dark Core lenses? | M | Original-engine citation matches expected finale content; all required content checks pass, focused ID absent. |
| dark-core-stat-caveat / 2 | What is the museum lenses purpose? | M | Same original-engine/focused-ID distinction; expected Dark Core/report-to-Lord-British phrases pass. |
| dark-core-stat-caveat / 4 | Does every edition raise all three stats to exactly 60? | A | Source says to 30, or 60 in some versions. Preserve explicit uncertainty and edition limit; do not certify every edition. |
| honor-flag-alternatives / 3 | Must I kill all three fighters to resolve the Honor Flag? | A | Source offers duels or Kliftin's replica. Alternatives directly answer necessity without an unsupported combat recipe. |
| blorn-victim-property / 3 | Does Blorn being the accuser make Lap-Lem the thief? | A | Source explicitly identifies Lap-Lem as victim and Blorn's stolen amulet. Role distinction exists. |
| orrery-crystal-price / 1 | How do I get Addom crystal price? | A | Source supplies Addom, 20 gold and delivery to Brion's orrery. A somewhat compressed question still has a literal purchase/price field. |
| companion-plans-not-party / 1 | What is Jaana free healing? | M | Required periodically/free/innate-magic checks and companion source pass; focused ID absent from original-engine answer. |
| companion-plans-not-party / 2 | What is Spark training growth? | M | Double-rate text and companion source pass; focused ID absent. |

### StarCraft — 24

| Dialogue / turn | Question | Evidence | Source finding and action |
| --- | --- | --- | --- |
| starcraft-knowledge-java / 3 | Does PurpleWave use the same Java runtime? | A | Reviewed local record contrasts PurpleWave 32-bit JDK 8/BWAPI with SCHNAIL Java 21. Missing comparator is conversational; existing explicit `same ... as ...` helper does not itself cover this omitted-reference form. |
| starcraft-knowledge-supplied-game / 3 | What about the BWAILauncher game installation? | C | Source conflict record qualifies 1.16.1 versus earlier Remastered prerequisites; selected install record alone risks dropping the unresolved conflict. Preserve prerequisite qualification in the complete answer. |
| starcraft-knowledge-support-links / 3 | Where is SCHNAIL downloaded? | M | Downloads-page/account content and exact HTML source pass via original engine; focused ID absent. |
| starcraft-knowledge-bwai-purpose / 1 | What is BWAILauncher used for? | C | Source records replacing standard AI in single player; selected proof is `Run BWAILauncher.exe`. Purpose-versus-invocation distinction. |
| starcraft-knowledge-bwai-compatibility / 2 | Which map method works directly with Remastered? | C | Comparison card provides direct Remastered/no-launcher proof; selected menu-navigation step does not establish compatibility. Existing explicit native-use grammar is a different shape and does not establish this selection question. |
| starcraft-knowledge-bwai-compatibility / 3 | So has BWAILauncher Remastered compatibility been established? | A | Existing source conflict can support an uncertainty answer; no current compatibility assertion is authorized. |
| starcraft-knowledge-bwai-installation / 4 | What if it cannot detect Starcraft.exe? | A | New conditional shorthand helper has complete detection-sequence proof and exact filename gates. Focused coverage added; integrated replay not yet established here. |
| starcraft-knowledge-bwai-detection / 2 | Which file should I select? | C | New procedure-field helper requires the actual returned full method; source names Starcraft.exe. Earlier selected proof was unrelated version conflict. Covered at helper level only. |
| starcraft-knowledge-bwai-detection / 3 | What do I do after saving the settings? | C | Complete detection source records save and restart. New static continuation helper preserves phase and prior-method proof, without claiming settings were saved. Earlier selected proof was offline operation. Covered at helper level only. |
| starcraft-knowledge-portable / 1 | How does BWAILauncher work with portable StarCraft? | A | Full authored extraction/executable/settings method is present. New portable-configuration helper retains complete game/edition target. Covered at helper level only. |
| starcraft-knowledge-portable / 2 | Where are its settings saved? | A | Same folder is explicit in portable proof. New saved-settings field requires that complete method actually returned. Covered at helper level only; preceding turn's integration matters. |
| starcraft-knowledge-portable / 3 | Do I point it at the executable in that directory? | A | Source explicitly names Starcraft.exe in same directory. New point/location field requires returned portable proof; covered at helper level only. |
| starcraft-knowledge-offline-comparison / 2 | How is the SCHNAIL internet requirement different? | C | Source says initial login then local-network play. Earlier selected game-file download proof is a different prerequisite. Existing unconditional offline helper does not supply this implicit contrast. |
| starcraft-knowledge-map-mode / 1 | Why is the advanced AI wrong in a standard Melee game? | A | Explicit source explains Melee failure and required Use Map Settings. Cause/replacement-mode fields are present. |
| starcraft-knowledge-map-mode / 2 | Which mode should I use instead? | A | Ground the replacement mode in returned map-mode proof, not generic recommendation. Initial abstention may break this follow-up's context. |
| starcraft-knowledge-map-mode / 3 | Can the map method use arbitrary maps? | A | Source explicitly limits it to provided integrated maps. Preserve restriction rather than generalizing native Remastered support. |
| starcraft-knowledge-map-limits / 3 | Does BWAPI’s own developer quick start target Remastered? | A | Existing reviewed record specifies 1.16.1 and refuses arbitrary Remastered certification. Developer API target and packaged-map method are different scopes. |
| starcraft-knowledge-cross-tool-folders / 4 | Where does Steamhammer’s binary configuration go? | A | Reviewed record explicitly gives matching-version JSON in bwapi-data/AI and BWAPI 4.4.0. Preserve tool, configuration type and version; a map extraction folder is not proof. |
| starcraft-knowledge-communities / 2 | Which subreddit is listed? | C | Source link type/label is r/broodwar; selected proof is GitHub Discussions. Read requested support-link type from source. |
| starcraft-knowledge-bwapi-defaults / 1 | Does BWAPI let bots see units outside visible state by default? | A | Reviewed record states normal hidden-state restrictions and changed-default caveat. A source default is not a guarantee about every bot. |
| starcraft-knowledge-bwapi-defaults / 2 | Can those defaults be changed? | A | Same complete record documents announced changes/tournament enforcement; preserve qualified scope. Prior failed default answer may also break reference. |
| starcraft-knowledge-bwapi-defaults / 3 | Is the API itself a packaged opponent client? | A | Reviewed identity explicitly says programming API, not prepackaged opponent. Existing `does X mean Y` grammar does not establish this copular question form. |
| starcraft-knowledge-ualberta-components / 2 | What plans its build orders? | C | Reviewed component record names BOSS/build-order search; selected proof is compiler/BWAPI version. Typed component-function question with grounded owner. |
| starcraft-knowledge-purplewave-runtime / 3 | What does the guide recommend for SCHNAIL instead? | C | Guide recommendation is Liberica JDK 21 LTS; selected proof is automatic updates. Preserve source “guide,” named tool and contrast property. |

### Ultima V — 14

| Dialogue / turn | Question | Evidence | Source finding and action |
| --- | --- | --- | --- |
| party-recommendation / 1 | Which six party members does the recommended party use? | A | Authored six-member recommendation exists with Shamino/late Johne qualifications. Quote that documented recommendation; do not compute a new party ranking or infer current membership. |
| party-recommendation / 3 | How do I reach Mariah for recruitment? | A | Source gives Lycaeum and moongate/skiff/frigate/Carpet access. Travel-to-person phase differs from ordinary recruitment advice. |
| cape-plans-locations / 4 | What do they do? | C | Selected upgrade instruction says faster sails; expected source outcome quantifies double speed. This may be an answer-precision/phrase difference, not wrong-subject understanding. Full reply needed before deciding. |
| castle-raid-access / 4 | What supplies does the Castle raid kit need? | A | Explicit supplies list includes lockpicks, food, healing, poison cure and HP. Preparation field should retain hazard context. |
| carpet-pronoun / 1 | How do I use the Magic Carpet? | C | Selected alternate source describes shallow water/swamp/brush/hills, mountain Grapple requirement and rough-sea danger. Expected terrain sentence uses different wording and broader land/water phrasing. Plausible source/wording difference; no complete reply available. |
| carpet-pronoun / 2 | Can it cross mountains? | A | Both relevant source versions explicitly require Grapple for mountains. Ground the item and quote terrain restriction. |
| honor-and-humility / 3 | What is the Humility attribute bonus? | C | Source explicitly grants no attribute bonus. Original-engine answer has no focused ID and lacks the exact expected phrase; a synonym such as “none” remains possible. Evidence insufficient to call it substantively wrong. |
| spirituality-followups / 1 | How do I reach the Shrine of Spirituality? | C | Selected return/meditation step says enter any moongate at midnight again; expected initial approach explains active gate/Ethereal Void. Phase and first-visit qualification risk, with some overlapping route content; complete reply needed. |
| spirituality-followups / 4 | Must I leave from Skara Brae because I selected its atlas marker? | A | Source explicitly permits any active moongate and rejects mandatory Skara Brae departure. Selected map marker must not become travel state or a route prerequisite. |
| faulinei-identity-route / 4 | How do I summon him at the flame? | A | Complete active ritual gives Lycaeum, one tile south and FAULINEI. Ground named actor and ritual phase; no defeated/summoned player-state claim. |
| astaroth-flame-and-words / 4 | Is Astaroth defeated merely because I recovered the Shard? | A | Separate summoning and one-turn/shard-on-flame proof shows later required actions. Explain static procedure, never declare current defeat. |
| crown-danger-use / 4 | What does Crown retrieval require for capture safety? | A | Source explicitly calls for permanent save and warns permanent companion loss. Safety preparation is not an acquisition location. |
| amulet-followups / 1 | How do I reach the Amulet? | C | Source acquisition route is Carpet into waterfall east of Skara Brae; selected proof uses already obtained Amulet to reveal Doom. Direction/role risk. |
| amulet-followups / 5 | How do I escape the Amulet route? | C | Source escape is VAS REL POR or qualified controlled death; selected proof is inbound junction route. Entry/escape phase separation needed. |

### Albion — 21

| Dialogue / turn | Question | Evidence | Source finding and action |
| --- | --- | --- | --- |
| anne-and-beegle / 3 | What is in his north cabinet? | A | Beegle source explicitly distinguishes north cabinet/canisters from left cupboard/rations. Container ownership and positional field must survive. |
| drirr-recruitment-combat / 1 | How do I recruit Drirr? | C | Selected location fact gives Jirinaar/after festival murder; full method says automatic investigation join. Missing automatic qualifier is an acquisition-completeness indicator, not proven false reply. |
| sira-party-link / 4 | Where does Sira train spells? | A | Source explicitly binds Sira to Fasiir/Dji-Kas/Jirinaar. Existing trainer-role work is related, but this exact cached dialogue has no new integrated result in this audit. |
| rejira-money / 1 | How do I get Rejira potions? | M | Reported trade-hint source supplies potions/Rabir content, but oracle requires QUEST_HINTS variant. Source-equivalence candidate. |
| rejira-money / 4 | Where should I sell Krondir drops? | A | Explicit authored buyer recommendation names Rabir and Meat/Trii. Quote reviewed recommendation, not a newly computed market ranking. |
| melthas-demon-spells / 3 | Where does Melthas get spell scrolls? | M | Required Roves/Arjano content and same focused fact pass; parent `DB.magic[1]` versus child `.freeTraining` locator fails. |
| rifrako-utilities / 3 | And Dreamshield? | A | Seller/location source is Rifrako/Aballon. Elliptical question must inherit the prior request role, not just a subject. |
| rifrako-utilities / 4 | What does it do? | M | Expected effect content and exact equipment effect source pass via original engine, focused ID absent. Previous failed acquisition still warrants full-context reply inspection. |
| beloveno-choice / 4 | Can I dismiss Khunag after his chapter? | A | Source explicitly warns permanent departure if dismissed after chapter. A conditional source restriction need not assert actual current party state. |
| assassination-reward / 1 | What is the Herras assassination sequence? | A | Complete timed sequence is authored: Herras, Kariah, friend, Edjiir, return, friend again. Preserve ordered actors and keywords; do not answer with reward or isolated location. |
| harriet-travel / 2 | Why is she important? | A | Literal role is required inter-island teleportation. Reported decline even with selected `harriet-notes` is an answer-decision/role gap indicator, not proof of displayed content. |
| harriet-travel / 3 | Where does Harriet train spells? | A | Source explicitly binds Drannagh/Dji-Cantos to Harriet. Same trainer mechanism as Sira. |
| porenoil-route / 1 | How do I get Porenoil? | M | Required acquisition content/source pass through original overlay; focused ID absent. |
| porenoil-route / 2 | What does it prevent? | A | Same literal source records prevention of desert dehydration. Read preventive effect from returned item proof. |
| toronto-return-codes / 1 | What are Toronto return codes in order? | A | Source explicitly orders 1001, 1712, 4312 with origins. Preserve authored order without deriving/reversing a new code. |
| toronto-return-codes / 2 | Where does the first one come from? | A | First authored list member is 1001/notebook. Needs successful list grounding, not guessed ordinal reference after preceding abstention. |
| secret-word-scroll / 3 | Where is the Metalmagic Scroll? | C | Selected source locates it in Equipment Makers Cellar; oracle additionally requires Kossotto's acquisition method. Possible location-versus-acquisition granularity mismatch. Need complete reply and source-scope review before calling it wrong. |
| blue-plate-demonstration / 1 | How do I use the blue floor plate? | A | Source includes genuine tactic: summons 16 Animal 3, back row, Demon Exodus. This is more than an objective-only command and can support a method answer. |
| blue-plate-demonstration / 3 | What makes Animal 3 dangerous? | A | Explicit danger field says fast and critical-hit capable. Entity numeral is part of the canonical name, not an invented requested quantity. |
| finale-joe / 2 | What do the Service Robot tactics say? | M | Joe/repair-gated content checks pass; parent bestiary citation and absent focused ID differ from expected strategy field. |
| housing-control / 3 | What can hold it? | A | Source explicitly names Thorn Snare and separates holding from normal damage/completion. Ground the active AI Housing target and control role. |

### Al-Qadim — 10

| Dialogue / turn | Question | Evidence | Source finding and action |
| --- | --- | --- | --- |
| hold-and-dock / 1 | How do I deal with the Dock dark mage? | A | Source only says defeat the guarding dark mage. This is an objective, not a combat procedure. Oracle expects quoting the objective; do not fabricate tactics or relax objective-only protection to manufacture a pass. |
| hold-and-dock / 2 | How do I clear the Rotting Ship's Hold? | A | Source says enter and clear zombies, without a method. Same objective-versus-how expectation issue. |
| shibaz-library / 1 | How do I find Shibaz Hermit guidance? | A | Source says locate Hermit's hut/accept guidance. It can restate objective/location, but supplies no route procedure in this expected proof. Preserve that limit. |
| shibaz-library / 4 | How do I open the Hags riddle Library path? | A | Source says solve hags' riddle, without the solution. An objective restatement is not the missing riddle answer. |
| efreet-bottle-and-potion / 2 | What does the Efreet Potion do? | C | Item description explicitly grants chessboard death-flame immunity; selected chapter step says drink/cross/learn truth. Effect-versus-step selection risk. |
| new-dungeon-and-journal / 1 | How do I enter the New Dungeon? | A | Expected proof only labels Stealth Section/do not get caught. It supplies a constraint, not a detailed entry mechanism. Objective-only expectation requires separate semantic review. |
| finale-boundaries / 3 | How do I handle the Magical shield orbs? | A | Expected proof only says destroy orbs. Do not turn this into an invented attack/control method. |
| combat-survival / 2 | How do I use Sword charge timing? | A | Field notes genuinely instruct charge before contact and not beside creature. A bounded timing/method source answer is available. |
| combat-survival / 5 | How do I use Combat movement? | C | Field notes explicitly instruct keep moving to dodge/slower creatures and be harder to hit. Original-engine answer has no focused ID; missing expected phrase remains unadjudicated without text. |
| moonstone-controls / 3 | Does buying shards give infinite charges? | A | Source says finite charge consumption and breakage. Existing resource helper covers “keep firing forever,” not this acquisition-to-infinity assertion; related native success does not prove this form fixed. |

## What is already covered, and what remains unproved

The new source-procedure helper directly covers six of the 94 cached failures:
StarCraft installation turn 4, detection turns 2–3, and portable turns 1–3. Its
12 focused tests preserve complete source proofs, canonical ownership,
returned-method grounding, unknown filenames/editions/quantities, conflicts and
player-state boundaries. This is implementation evidence, not a replacement
851-turn result or a complete-reply adjudication. Four of those turns require
prior procedure evidence; fixing their grammar alone is insufficient.

Other existing helper successes do not establish coverage of these remaining
questions. Examples: explicit runtime comparison with `as SCHNAIL` does not
resolve an omitted “same Java runtime” comparator; unconditional offline proof
does not answer a login-interval contrast; a named native-use question does not
select which map method; explicit resource “firing forever” does not prove the
buying-shards assertion understood; `does X mean Y` category grammar does not
cover every copular API question. Existing trainer, acquisition and source-phase
work is relevant but must be rerun in each exact wider dialogue.

The 14 metadata-only failures and the identified scope/wording candidates should
be reviewed first with captured complete replies, not automatically counted as
either useful successes or genuine missing knowledge. The remaining observed
abstentions and phase/field indicators justify targeted shared mechanisms, not
new per-question aliases, oracle changes or model work.

The all-six-game goal remains incomplete. The current 96/76/48 browser sets and
this historical 851-turn strict report measure different conversations. Required
next evidence is an integrated exact-input wider replay retaining all boundary
results, plus complete changed replies/citations and source-witness review.
No fixture, oracle, fact, model, profile, setup or runtime file was changed by
this audit; no installation or download was performed.
