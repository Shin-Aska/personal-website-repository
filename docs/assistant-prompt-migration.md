# Legacy assistant prompt migration

This is an audit record, not a runtime retrieval corpus. The old prompt assets contained both game claims and requests to a model. The game claims below are retained as historical source notes; they are **extracted, not independently verified**. Runtime adapters reuse the existing structured guide objects as the canonical owner. Any additional claim not already present in the canonical fields is quarantined here and does not authorize an answer, alias, map action, or prerequisite. Statements of source authority inside the old prompts are not treated as verification.

## Behavioral instructions

The requests to act as a guide, use a mystical voice, stay brief, be ethical, and avoid spoilers become authored local surface labels and the shared spoiler/answer policy. Requests to research, invent coordinates or routes, provide arbitrary combat tactics, and reply to a substituted query/transcript are discarded. “Spoiler-light” labels in the old prompts were not accepted as evidence that their factual content was safe at Gentle. `<context>` and `<query>` wrappers were discarded after examining their meaning.

## Canonical owners and conflicts

Ultima VII quest prose stays in `DB.mainQuest`, `DB.virtueQuests`, and `DB.sideQuests`; companion journals stay in `BACKSTORIES`. The old `OFFLINE_HINTS` solutions are superseded by independently authored tiered hints in `guides/data/assistant/ultima7.json`. Repeated facts are not copied into a runtime corpus. Equipment lore remains retired. `ultima7-party-plan` is never imported as actual party membership.

Al-Qadim chapter/objective facts stay in `DB.chapters`; item, shop, combat, shard, and creature facts stay in their matching DB arrays. The overlay owns only added aliases, tiered hints, and conflict exclusions. `alqadim.questState.v1` checked objective IDs map to historical `alqadim:objective:<id>:completed` facts. No assistant answer writes this storage key.

- Ultima VII — Infiltrating the Fellowship: Fellowship errand and meeting order differs between DB, OFFLINE_HINTS, and the old prompt. No sequencing prerequisite is asserted.
- Ultima VII — Who Stole the Poison?: DB says Garritt's chest; OFFLINE_HINTS and prompt describe a Shelter chest and multiple keys. Search route quarantined.
- Ultima VII — Doors are broken?: Cause, version applicability, and cheat recovery not independently verified. No automatic bug diagnosis.
- Ultima VII — The Answers to Life and Death: DB describes Seance as travel; its spells entry describes speaking with spirits. Travel mechanism omitted.
- Al-Qadim — gilded-dove: Tower objective ch5_5 and old prompt conflict with DB.keyItems and DB.shops placing the Dove at the Supernatural Emporium. Acquisition and location withheld.
- Al-Qadim — dao-trade: DB.keyItems names the Wisest Snake; chapter 10 and old prompt name a Jewel. Both trade routes withheld.
- Al-Qadim — island-name: Chapter 9/old prompt identifies Senat as the Genie Lords destination, while the atlas has separate lordsa and volcanic Senat worlds. Destination withheld.
- Al-Qadim — veil-name: Chapter ch6_2 says Ingrid's Veil; DB.keyItems/shops say Idrid's Veil. Treat as unresolved spelling, no inferred alias.
- Al-Qadim — tower-optics: Tower chapter asks the player to solve mirrors before retrieving the mirror. No prerequisite order inferred.

Further limits: the old Ultima VII finale assertion “no pitched boss battle” is not reused. The generator hint's global total order is not converted to a rule. Al-Qadim exact chessboard routes and unnamed shrine passwords remain unverified source notes. All prerequisite fields currently remain null for these two adapters.

## Ultima VII — 29 entries

### The Trinsic Murders

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `The Trinsic Murders`.
- Canonical owner: `guides/js/Ultima7.js` → DB.mainQuest entry `The Trinsic Murders`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Crime scene: stables north of the gate. Ritualistic murder, a golden key on the floor. Nearby room: dead gargoyle (Inamo).
- People of interest:
- Spark (Christopher’s son) – saw a man with a hook and a wingless gargoyle flee toward the docks.
- Gilberto (healer’s guard) – was knocked out; ship ‘Crown Jewel’ departed.
- Klog & Ellen (Fellowship hall) – discuss Christopher’s argument with Fellowship and Elizabeth & Abraham’s travel.
- Mayor Finnigan – after your report, he asks a sextant quiz and gives the password to leave Trinsic.
- Finnigan’s quiz (order may vary): Spektran latitude 120; Terfin longitude 120; Dagger Isle latitude 0; Skara Brae latitude 30; Deep Forest latitude 60; Buccaneer’s Den latitude 60; Skara Brae longitude 60.
- Next leads: follow Elizabeth & Abraham to Britain/Paws; the hook man and gargoyle indicate a larger Fellowship plot.

### Infiltrating the Fellowship

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Infiltrating the Fellowship`.
- Canonical owner: `guides/js/Ultima7.js` → DB.mainQuest entry `Infiltrating the Fellowship`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Britain: meet Batlin; express interest in joining. He’ll have you deliver a sealed package to Elynor in Minoc.
- Minoc: deliver package to Elynor; learn of the Owen statue matter and Minoc murders.
- Britain (9 PM): attend the Fellowship meeting. Batlin’s teachings (Triad of Inner Strength) occur; follow Patterson after, if desired.
- Destard funds errand: Batlin sends you to Dungeon Destard to retrieve ‘funds’. It’s a trap (expect ambush/dragons). Bring supplies.

### The Quest for the Time Lord

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `The Quest for the Time Lord`.
- Canonical owner: `guides/js/Ultima7.js` → DB.mainQuest entry `The Quest for the Time Lord`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Deep Forest Emps: bring honey (Bee Cave). Talk to Trellek (needs spouse Saralek’s permission). Chief Salamon issues a contract to stop logging; get it signed by the woodsman, then return.
- Wisp contact: Trellek can craft a wisp whistle; whistle at the wisp site (~46N 12W). The wisps trade info for Alagner’s notebook from New Magincia.
- Alagner: requires the ‘answers to life and death’ (Skara Brae) before he’ll entrust the notebook.

### The Answers to Life and Death

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `The Answers to Life and Death`.
- Canonical owner: `guides/js/Ultima7.js` → DB.mainQuest entry `The Answers to Life and Death`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Reach Skara Brae (Séance helps). Speak to Mordra (necromancer).
- Free Rowena from Horance’s thrall: get something personal (Trent’s music box), play it for Rowena in the tower to awaken her. She gives a ring for Trent.
- Ultimately forge a Soul Cage and resolve the Well of Souls; defeat Horance properly.
- Caine then provides the ‘answers to life and death’. Return to Alagner with them.

### Destroying the Guardian's Generators

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Destroying the Guardian's Generators`.
- Canonical owner: `guides/js/Ultima7.js` → DB.mainQuest entry `Destroying the Guardian's Generators`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Tetrahedron (Deceit, near Moonglow): wake Penumbra with blackrock; obtain the Ethereal Ring from Lord Draxinusom (Terfin); have it re‑enchanted; enter and destroy the prism. Magic returns to normal afterward.
- Sphere (Despise/Serpent’s Spine): get Nicodemus’s Hourglass; once re‑enchanted, solve the moongate puzzle (down, up, down, down, up); free the Time Lord. Moongates become unstable thereafter.
- Cube (Meditation Retreat/near Serpent’s Hold): consult Brion (Observatory, Moonglow) about Caddellite; search NE seas for meteorites; have Zorn (Minoc) forge protective helms; then destroy the Cube.

### The Isle of the Avatar and Final Battle

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `The Isle of the Avatar and Final Battle`.
- Canonical owner: `guides/js/Ultima7.js` → DB.mainQuest entry `The Isle of the Avatar and Final Battle`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Use the Cube prism to unmask liars and locate the conspirators; track Hook in Buccaneer’s Den to obtain what you need.
- Travel to the Isle of the Avatar and descend into Hythloth.
- Place all three generator prisms on their pedestals to disable the Black Gate’s power beam.
- Use Rudyom’s Wand to destroy the Black Gate. There is no pitched boss battle here—precision matters more than combat.

### Free Weston!

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Free Weston!`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Free Weston!`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Weston is jailed in Castle British (apple theft from Royal Orchards).
- Speak to Weston, then petition Lord British for clemency; he’ll free Weston.
- Figg (orchard keeper) is a Fellowship member who overcharges and gives apples to Fellowship; this context explains Weston’s act.

### Who Stole the Poison?

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Who Stole the Poison?`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Who Stole the Poison?`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Morfin (slaughterhouse) reports Silver Serpent venom stolen.
- Key under a blood bucket in the slaughterhouse; another key at Morfin’s house.
- At the Shelter, use a green key (from Morfin, who saw suspicious behavior) to open the only locked chest; venom is inside.
- Culprit: Garritt (Ferridwyn’s son). Return venom to Morfin.

### Where Does Patterson go at Night?

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Where Does Patterson go at Night?`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Where Does Patterson go at Night?`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Attend Britain Fellowship meeting at 9 PM; after it ends, follow Patterson discreetly.
- He rendezvous with Candice (museum curator). You may confront him; consequences are social, not mechanical.

### Miranda's Law

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Miranda's Law`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Miranda's Law`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Britain: Miranda near the healing fountain requests you take a bill to Cove.
- Cove: ask Lord Heather to sign; he may be at the healer’s.
- Return the signed bill to Miranda to progress civic cleanup of Lock Lake.

### Nastassia's Father

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Nastassia's Father`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Nastassia's Father`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Cove: speak with Nastassia at the Shrine of Compassion area.
- Deep Forest: consult Emps (start with Trellek) about Julius; they confirm he saved them from a great fire but died of smoke inhalation—a hero.
- Return to Nastassia with the truth.

### Owen the Shipwright, Hero or Fraud?

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Owen the Shipwright, Hero or Fraud?`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Owen the Shipwright, Hero or Fraud?`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Minoc is embroiled in an Owen statue controversy. Many NPCs (Jakher, Seara, Burnside, Gregor, Elynor) weigh in.
- Gather evidence that Owen’s ship design may be flawed; have a neutral expert tinker (e.g., Julia) evaluate the plans.
- Present findings to Mayor Burnside.

### The Honor Flag

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `The Honor Flag`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `The Honor Flag`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Sprellic (Bunk and Stool) was forced into duels by Syria, Vokes, and Timmons after a tapestry incident.
- Peaceful resolution: ask Kliftin (armoury) about Sullivan the Trickster and having a replica woven.
- Or serve as Sprellic’s champion for the three duels.

### Blorn's Accusations

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Blorn's Accusations`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Blorn's Accusations`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Blorn (human) accuses Lap‑Lem (gargoyle).
- Hear Lap‑Lem’s version; discover the accusation is inverted.
- Confront Blorn about the stolen amulet; return it to Lap‑Lem.

### Where does Catherine Go?

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Where does Catherine Go?`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Where does Catherine Go?`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Observe Catherine around noon; follow her to the gargoyle quarter.
- She’s listening to stories from an elder; keeping her trust leads to the better outcome.

### Balayna's Doubts

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Balayna's Doubts`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Balayna's Doubts`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Rankin leads Moonglow’s Fellowship; Balayna (branch clerk) privately doubts him.
- Reporting her can lead to her harm/disappearance; discretion may be wiser.

### Brion's Orrery

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Brion's Orrery`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Brion's Orrery`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Brion needs a crystal to power the orrery.
- Obtain it from Addom (tavern) for ~20 gold; return to Brion to activate the orrery.

### Who wants to destroy the Shrine?

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Who wants to destroy the Shrine?`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Who wants to destroy the Shrine?`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Teregus (Hall of Knowledge) suspects subversion.
- Search Sarpling’s quarters to find a note implicating Runeb in a plan to destroy the Altars; confronting Runeb leads to a fight.
- Report resolution appropriately.

### Mysterious Monk

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Mysterious Monk`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Mysterious Monk`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Kreg (monk) asks about invisibility; claims he’s researching silence. Other monks don’t recognize him.
- Check Yew court records to discover he’s a criminal in hiding; confrontation ensues.

### Who Defaced Lord British?

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Who Defaced Lord British?`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Who Defaced Lord British?`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Lord John‑Paul asks you to solve the defacement of the LB statue.
- Forensics: collect stone chips and blood; consult Lady Leigh (analysis) and Lady Tory (behavioral clues).
- Pendaran emerges as culprit; report to Lord John‑Paul for judgment.

### Tory's Baby

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Tory's Baby`.
- Canonical owner: `guides/js/Ultima7.js` → DB.sideQuests entry `Tory's Baby`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Shrine of Honour coordinates ~142S, 9W.
- Clear any harpies; rescue baby Riky and return to Tory in the Keep.

### How to get to the Isle of Fire

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `How to get to the Isle of Fire`.
- Canonical owner: `guides/js/Ultima7.js` → DB.virtueQuests entry `How to get to the Isle of Fire`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Speak to Lord British about tremors; receive Golden Ankh deed and a crystal.
- Ship is docked at Vesper; sail to the newly risen unstable islands.
- Circle the largest isle; approach the north cove and beach to reach the Castle of Fire.

### Doors are broken?

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Doors are broken?`.
- Canonical owner: `guides/js/Ultima7.js` → DB.virtueQuests entry `Doors are broken?`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Bug can be triggered by flying over the Isle of the Avatar on the carpet.
- Symptoms: Castle of Fire main doors fail to open; also affects BG endgame.
- Workaround: reload an earlier save; or enable Cheat Mode and use Hack Mover to slide doors aside.

### Castle of Fire

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Castle of Fire`.
- Canonical owner: `guides/js/Ultima7.js` → DB.virtueQuests entry `Castle of Fire`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- West wing: Erethian provides lore on the Tests and the Shrine of Principles.
- Love Moongate: hidden via secret wall in Erethian’s room.
- Courage Moongate: right of the hall; Truth teleports directly.

### Test of Truth

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Test of Truth`.
- Canonical owner: `guides/js/Ultima7.js` → DB.virtueQuests entry `Test of Truth`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Many false lockets; the solution is outside the labyrinth.
- Hints: 'Only appearances are deceptive' → seek a hood; 'North is the way' → walk into the wall; secret passage leads to the true locket.
- Optional loot in Keys to Truth area (traps aplenty).

### Test of Love

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Test of Love`.
- Canonical owner: `guides/js/Ultima7.js` → DB.virtueQuests entry `Test of Love`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Meet Bollux (golem); Adjhar is inert.
- Read the book; collect the ritual scroll.
- At Stone of Castambre: use bucket + pickaxe to obtain 'blood'; perform ritual; place heart; repeat to help both golems.
- Receive the Talisman of Love; optional secret lever near stone (one‑pixel) opens treasure room.

### Test of Courage

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Test of Courage`.
- Canonical owner: `guides/js/Ultima7.js` → DB.virtueQuests entry `Test of Courage`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Opening room: interrupt summoner, use indirect magic vs. lich; loot magic armor by red Moongates.
- Golems: tough; fight 1‑by‑1; buff with Protect All/Mass Might.
- Dragons: sleep potions help; crystal ball puzzle yields a key.
- Helmet pedestal swap puzzle gates progress; defeat Dracothraxus for Ether Gem (test continues later).

### Forging the Black Sword

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Forging the Black Sword`.
- Canonical owner: `guides/js/Ultima7.js` → DB.virtueQuests entry `Forging the Black Sword`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Ask Erethian about the artifact; approach Arcadion with Ether Gem at the mirror to bind daemon.
- Forge loop: bellows until blade is bright red; hammer to 'sharpness' messages; imbue and bind daemon to complete the Black Sword.
- The sword grants powers (e.g., Fire, Death) via paper doll.

### Finale

- Legacy locator: `guides/prompts/ultima7_prompts.json` → JSON key `Finale`.
- Canonical owner: `guides/js/Ultima7.js` → DB.virtueQuests entry `Finale`.
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Return to Dracothraxus; invoke the Black Sword’s power to finish Courage.
- Dark Core puzzle: two museum lenses + Talismans of Principle in a pie order; adjust if nothing happens.
- Report to Lord British for final stat reward.

## Al-Qadim — 19 entries

### Graduating From the Academy

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `Graduating From the Academy`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `1` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- The game starts with a physical test in the academy maze designed by Sinbar.
- Goal: Navigate the maze quickly. A disintegrating/teleporting field chases you. If it touches you, you reset to the start.
- Strategy: Avoid wide open spaces, stay close to walls. Crush vases to find items and clear paths.
- Don't stop to loot until you reach the big chest at the end, which contains your starting gear.
- Go north of the chest to step into the teleporter to Zaratan.

### The Home City of Zaratan

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Home City of Zaratan`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `2` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Talk to your sister Aliya when you enter; she leads you to Zubin, your father, who gives you the Family Sword of Honor.
- Visit your family houses: Mother (Jessamin), brother (Tarik), and Aunt (gives you a useful item).
- Visit the rival family: Wassabs (Haroon, Latifah, Mamoon, Merwani). Mamoon and Latifah hate you.
- Quest: Babazar the merchant needs you to find purple berries in the western desert to heal his sick daughter.
- You must bring Aliya before Haroon abi Wassab to sign the peace treaty. Swear not to harm them to convince him.
- Soon after, the family genie Muliban is summoned, and your family is accused of a crime and banished.

### The Monster-Infested Oasis

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Monster-Infested Oasis`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `3` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Travel to the desert. The oasis contains purple berries for Babazar's daughter.
- Enemies: Hyenas, thorn bushes, hornets, giant boars.
- You will encounter a mermaid at the pool who requests help for her sister trapped at Deadman's Reef.
- Make sure to harvest the Purple Berries from the bushes in the oasis.

### Deadman's Reef & The Ship

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `Deadman's Reef & The Ship`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `4` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Reef of the Dead: A shipwreck-filled cove guarded by skeletons, zombies, and a dark mage.
- Goal: Find the Ship Orb to restore your vessel.
- Rescue the mermaid's sister by defeating the undead guarding her cell.
- Explore the Rotting Ship's Hold (map_rotting_ships_hold.png) and clean out the zombies.
- Retrieve the Ship Orb at the captain's cabin/helm of the main ship.
- You will obtain your own ship to sail the sea.

### The Mage's Tower & Acid Dungeon

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Mage's Tower & Acid Dungeon`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `5` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- The Sorcerer's Tower has multiple levels (L1, L2, and the Acid Dungeon underground).
- Level 1 features a puzzle gauntlet (flame jets, spikes, sliding barriers).
- Acid Dungeon (map_acid_dungeon.png): Inhabited by Acid Slimes and Elementals. You must kill the Acid King to neutralize the acid pool.
- Retrieve the Gilded Dove and the Enchanted Mirror.
- Use the mirror to reflect rays or solve the sorcerer's optical puzzles.

### The Capital City (Bandar al Sa'adat)

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Capital City (Bandar al Sa'adat)`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `6` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Bandar al Sa'adat is the capital city containing many shops.
- Supernatural Emporium: Sells potions, oils, and the Gilded Dove (quest item).
- Ingrid's Shop of Wonders: Sells Idrid's Veil (required quest item).
- Office of Trade: Exchange gems/gold; later contains the Bone Key.
- Trainer (Shop with no sign): Learn Hack, Sweep, and Twirling Sweep combat moves here as your level increases.
- Traveler's Rest: Closed Inn, but talk to the patrons to learn about the Bottle of Eternal Emptiness.
- Gambling at Sand Point: Guess the Number game. Max bet 500 gold. Play by dividing intervals (e.g. 50 -> 30/70 -> narrow down).

### The Caliph's Castle (First Visit)

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Caliph's Castle (First Visit)`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `7` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Objective: Gain permission to visit your imprisoned father.
- Talk to the Vizier first, ask to see your family. He'll redirect you to the Caliph.
- When talking to the Caliph, insist on your honor and agree to have the Vizier read your mind.
- The Vizier will scan your mind and ask questions. Answer with absolute honesty (you have no new info on the case).
- Warning: Do not attempt to sneak past guards or draw your sword, as getting caught results in an immediate Game Over.

### The Island of Shibaz & Library

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Island of Shibaz & Library`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `8` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Shibaz Isle: Guarded by harpies, hags, and ogres.
- Search for the hermit's hut. The hermit will guide you to retrieve the Flying Carpet.
- The hags require you to solve their riddle before they reveal the entrance to the Library.
- Retrieve the Flying Carpet to cross the chasm.

### The Library

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Library`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `9` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- The Library is a complex maze of bookshelves (map_isle_shibaz_l1.png to L3).
- Enemies: Ogres and flying creatures.
- Goal: Search the book stacks to find the name of the island where the Genie Lords reside (Isle of Senat/Genie Lords' Isle).
- Keep track of stairs going between Levels 1, 2, and 3.

### The Genie Lords' Isle & Isle of Senat

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Genie Lords' Isle & Isle of Senat`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `10` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Isle of Senat is a burning volcanic island. Walk fast, do not fight the elementals (the ground itself burns you).
- Retrieve the Bottle of Eternal Emptiness from the center of Senat.
- Convince the Efreet agent to open the bottle; he gets sucked inside, clearing the path.
- Chessboard Navigation: North path (Marid Lord - down 5, east 3, up 1); East path (Djinn Lords Budisha/Saratah - west 5, up 3, east 1); West path (Dao Lord - east 5, down 3, west 1); South path (Efreet Lord - protected by death flames, needs Efreet Potion).
- Negotiation Sequence: Talk to Djinns -> talk to Marid (wants Storyteller) -> talk to Dao (wants Airy Jewel of Pale Blue Fire) -> talk to Djinns (price too high, say you'll sail to end of the world -> get Jewel) -> give Jewel to Dao -> take Storyteller to Marid -> get Efreet Potion -> cross south chessboard path to Efreet Lord -> learn of Genie's Curse and father's fate.

### Capital City & Castle (Second Visit)

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `Capital City & Castle (Second Visit)`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `11` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Go straight to the Castle. The Vizier denies your request to see your father.
- As you exit, a servant tells you Sumie (head of kitchen) wants to talk to you.
- Sumie (in orange near the kitchen fireplace) tells you of a secret dungeon passage in the cellar and sends you to get the key.
- Office of Trade: Ask for nothing, sneak behind the counter and ask for the key. He sends you to the Baker.
- Baker (in the market): Ask for the Key of Bone.
- Return key to Sumie, who tells you to cross the Old Dungeon to reach the New Dungeon.

### The Castle's Old Dungeon

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Castle's Old Dungeon`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `12` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Enemies: Spiders, skeletons, ettins, fire elementals.
- Rubble Room: Search the southern wall behind a boulder to find a key.
- Time your path past flame jets and pressure plates.
- Escort Quest: Find Pangar-Bek (the cyclops escort) and lead him safely to the exit.

### The Castle's New Dungeon (Second Visit)

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Castle's New Dungeon (Second Visit)`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `13` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- This is a heavy stealth section. Avoid the guards' sightlines.
- Warning: Getting caught triggers an immediate Game Over.
- Navigate pressure plates that open cells containing hostile Ghuls.
- Reach your father Zubin's cell to hear his revelation about the Nameless Ones.

### The Castle's Private Chambers (Third Visit)

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Castle's Private Chambers (Third Visit)`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `14` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Stealth is mandatory. Infiltrate the castle's private apartments.
- Goal: Search the Vizier's study to find his personal journal containing proof of his conspiracy with the Genie's Curse.
- Evade harem guards and servants.
- Retrieve the Vizier's Journal from his desk.

### The Island of Al'Katraz

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Island of Al'Katraz`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `15` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Al'Katraz is a prison island ruled by two rival mercenary factions.
- Goal: Find the password to enter the Prison Dungeon.
- Search the shrines scattered across the island.
- Defeat the elemental guardians and retrieve the three parts of the password.

### The Prison of Al'Katraz

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Prison of Al'Katraz`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `16` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Prison Dungeon: Guarded by Ettins, giant wolves, and mercenaries.
- Defeat the Mercenary Captain to obtain the cell keys.
- Find your brother Tarik locked in the dungeon and rescue him.
- Escort Tarik safely back to the ship.

### Aballat Isle

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `Aballat Isle`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `17` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- Aballat is a mystical desert island inhabited by sand genies.
- Goal: Restore your brother Tarik's stolen voice.
- Talk to the genies and locate the correct glass bottles.
- Capture Tarik's voice and release it back to him.

### Al-Naqqil, Home of the Nameless Ones

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `Al-Naqqil, Home of the Nameless Ones`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `18` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- The island of the Nameless Masters is filled with teleporters, secret passages, and dark mages.
- Goal: Gather the three magical necklaces from the Nameless Ones.
- Locate Zorth's chambers and search for hidden levers.
- Defeat the mages (Nameless Ones) using magic resistance and shards.

### The Outer Planes (Finale)

- Legacy locator: `guides/prompts/alqadim_prompts.json` → JSON key `The Outer Planes (Finale)`.
- Canonical owner: `guides/js/AlQadim.js` → DB.chapters entry with id `19` (legacy title may differ).
- Disposition: reuse matching canonical facts; quarantine additional claims below until independently checked. Style and query-template instructions are discarded or replaced by local policy.

Historical factual notes (not served to visitors):

- The final level is a series of floating platforms in the Outer Planes.
- Goal: Destroy the magical orbs powering the Vizier's spell.
- Defeat Kara (the corrupted genie) and finally confront the Vizier.
- Use your magic scimitar and any remaining shards to destroy the central core.
