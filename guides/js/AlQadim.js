// Al-Qadim: The Genie's Curse Interactive Companion Guide Logic & Data
// Pattern matched to Albion.js and Ultima7.js

const DB = {
    combatMoves: [
        {
            sequence: "01",
            name: "Quick Swing",
            coverage: "Front",
            effect: "A fast scimitar strike in the direction the Corsair faces—or toward the sword cursor when using the mouse.",
            training: "Available at second level",
            control: "Click the action button",
            class: "quick"
        },
        {
            sequence: "02",
            name: "Wide Swing",
            coverage: "Front + both sides",
            effect: "A stronger cut that damages monsters in front of the Corsair and to his left and right.",
            training: "Learn from Zubakon after becoming eligible",
            control: "Release when the second action circle lights orange",
            class: "wide"
        },
        {
            sequence: "03",
            name: "Full-Circle Swing",
            coverage: "All sides",
            effect: "The most powerful swing: a complete 360-degree cut that also catches monsters behind the Corsair.",
            training: "Learn from Zubakon after later progression",
            control: "Release when the third action circle lights orange",
            class: "circle"
        }
    ],
    moonstoneShards: [
        { name: "Cone of Cold", range: "10 yd", damage: "12–30", effect: "A cone of extreme cold that freezes everything it touches." },
        { name: "Flame Arrow", range: "20 yd", damage: "1–6 + 4–24 fire", effect: "A fiery bolt whose larger damage applies to creatures affected by flame." },
        { name: "Lightning Bolt", range: "100 yd", damage: "6–36 per target", effect: "Strikes every target in its path and can ricochet from walls—even back toward the caster." },
        { name: "Magic Missile", range: "120 yd", damage: "6–15 total", effect: "Three missiles seek the nearest visible enemy in the direction faced." },
        { name: "Sundazzle", range: "—", damage: "No damage", effect: "Dancing colored spheres temporarily blind the target." },
        { name: "Sunfire", range: "70 yd", damage: "6–36", effect: "An explosive ball of solar flame; the Corsair is never damaged by his own blast." },
        { name: "Sunscorch", range: "60 yd", damage: "4–24 + 2–8 metal", effect: "An unerring heat beam that curves around obstacles and punishes targets touching substantial metal." },
        { name: "Water Blast", range: "60 yd", damage: "2–12", effect: "A fast-moving shot of water that seeks its target like a magic missile." }
    ],
    shops: [
        {
            name: "Supernatural Emporium",
            location: "Capital City (Bandar al Sa'adat)",
            inventory: [
                { item: "Gilded Dove", cost: "Quest Only", description: "Required for the Mage's Tower mermaid quest." },
                { item: "Healing Potion", cost: "50 Gold", description: "Restores minor health." },
                { item: "Extra Healing Potion", cost: "120 Gold", description: "Fully restores health." },
                { item: "Giant Strength Potion", cost: "150 Gold", description: "Raises Strength to 22." },
                { item: "Invulnerability Potion", cost: "200 Gold", description: "Temporary defense buff." },
                { item: "Oils of Invulnerability (Fire/Air/Earth/Water)", cost: "100 Gold each", description: "Elemental immunities." }
            ]
        },
        {
            name: "Ingrid's Shop of Wonders",
            location: "Capital City (Bandar al Sa'adat)",
            inventory: [
                { item: "Idrid's Veil", cost: "300 Gold / Gems Equivalent", description: "Required to survive toxic chambers and bypass castle guards." },
                { item: "Polished Sapphire", cost: "150 Gold", description: "High-value trade gem." }
            ]
        },
        {
            name: "Office of Trade",
            location: "Capital City (Bandar al Sa'adat)",
            inventory: [
                { item: "Gold to Gem Exchange", cost: "11 Gold -> 1 Gem", description: "Convert currency to compact gems." },
                { item: "Gem to Gold Exchange", cost: "1 Gem -> 10 Gold", description: "Convert gems to spendable gold coin." },
                { item: "Key of Bone", cost: "Baker Referral", description: "Required to enter old dungeon passage." }
            ]
        }
    ],
    bestiary: [
        { name: "Hyena", location: "Oasis, Desert Plains", danger: "Low", strategy: "Standard melee attacks. Easily defeated." },
        { name: "Thorn Bush", location: "Western Desert Oasis", danger: "Low", strategy: "Fires thorns. Use Fire Arrow shards or hit between volleys." },
        { name: "Air Elemental", location: "Desert, Outer Planes", danger: "Medium", strategy: "Avoid storm spins. Attack immediately after they finish spinning." },
        { name: "Giant Boar", location: "Oasis Outskirts", danger: "Medium", strategy: "Charges in straight lines. Dodge sideways, then strike from behind." },
        { name: "Hornets", location: "Western Desert Oasis", danger: "Low", strategy: "Ranged sling attacks or Magic Missile shards deal with them quickly." },
        { name: "Zombie & Skeleton", location: "Deadman's Reef, Dungeons", danger: "Medium", strategy: "Slow moving. Keep distance and ready the strongest available sword swing before closing." },
        { name: "Acid Slime", location: "Sorcerer's Tower (Acid Dungeon)", danger: "Medium", strategy: "Leaves toxic pools. Do not stand in green residue. Strike from range." },
        { name: "Fire Elemental", location: "Isle of Senat, Dungeons", danger: "High", strategy: "Immune to fire. Apply Water Blast shards or Oil of Fire Invulnerability." },
        { name: "Hag", location: "Isle of Shibaz Outskirts", danger: "High", strategy: "Casts magic missile streams. Evade behind columns, strike during cooldown." },
        { name: "Scaly-Horned Ogre", location: "Library of Shibaz, Dungeons", danger: "High", strategy: "Huge health pool. Evade heavy clubs and ready a strong sword swing before closing." },
        { name: "Cyclops & Ettin", location: "Dungeons, Al'Katraz", danger: "High", strategy: "Devastating melee damage. Run in, hit once, back out. Use Giant Strength." },
        { name: "Nameless One (Mage)", location: "Al-Naqqil, Outer Planes", danger: "Fatal", strategy: "Spams magical missiles and elementals. Must use Idrid's Veil or reflect spells." }
    ],
    keyItems: [
        { name: "Family Sword of Honor", location: "Zaratan (Zubin)", description: "Magical scimitar that cannot harm allies or innocents. The primary weapon." },
        { name: "Purple Berries", location: "Western Desert Oasis", description: "Medicinal berries needed to cure Babazar's daughter." },
        { name: "Mermaid's Message", location: "Reef of the Dead", description: "Unlocks the mermaid's assistance in the Mage's Tower." },
        { name: "Gilded Dove", location: "Supernatural Emporium", description: "Trading item for the Mage's Tower mermaid puzzle." },
        { name: "Enchanted Mirror", location: "Mage's Tower", description: "Reflects magical light beams to solve optics puzzles." },
        { name: "Ship Orb", location: "Deadman's Reef (Wrecked Ship)", description: "Powers and restores the corsair ship for navigation." },
        { name: "Hottest Coals", location: "Isle of Senat", description: "Quest item required by the Efreet Lord." },
        { name: "Wisest Snake", location: "Western Desert", description: "Required by the Dao Lord to trade for the Storyteller." },
        { name: "Idrid's Veil", location: "Ingrid's Shop of Wonders", description: "Provides poison chamber immunity." },
        { name: "Bottle of Eternal Emptiness", location: "Isle of Senat", description: "Traps the Efreet agent, clearing the chessboard path." },
        { name: "Efreet Potion", location: "Marid Lord", description: "Grants immunity to the chessboard death flames." },
        { name: "Key of Bone", location: "Baker (Market)", description: "Opens the secret passage in the castle kitchen cellars." },
        { name: "Vizier's Journal", location: "Castle Private Chambers", description: "Contains incriminating evidence detailing the Vizier's betrayal." }
    ],
    chapters: [
        {
            id: 1,
            title: "Graduating From the Academy",
            summary: "Confront the obstacle course set by your master Sinbar. Dodge fire, spears, and sliding blades to earn your graduation.",
            map: "map_testing_grounds.png",
            required: [
                { id: "ch1_1", text: "Speak with Master Sinbar to initiate the trial." },
                { id: "ch1_2", text: "Avoid the moving disintegrator field (stay close to walls)." },
                { id: "ch1_3", text: "Bypass stationary and rising spear gauntlets." },
                { id: "ch1_4", text: "Navigate pressure plates and fire jets." },
                { id: "ch1_5", text: "Open the final chest to claim starting equipment." },
                { id: "ch1_6", text: "Step into the northern teleporter to exit to Zaratan." }
            ],
            optional: [
                { id: "ch1_7", text: "Smash all vases along the way for bonus gold coins.", hint: "Vases contain extra money; break them only when the disintegrator field is far behind." }
            ]
        },
        {
            id: 2,
            title: "The Home City of Zaratan",
            summary: "Return home to your family, resolve a local bazaar dispute, and secure a peace treaty with the rival Wassab clan.",
            map: "map_zaratan.png",
            required: [
                { id: "ch2_1", text: "Meet Aliya at the gates and speak with Zubin to get the Family Sword of Honor." },
                { id: "ch2_2", text: "Visit Mother (Jessamin) and Aunt (get family gift)." },
                { id: "ch2_3", text: "Accept Babazar's quest to find purple desert berries for his sick daughter." },
                { id: "ch2_4", text: "Bring Aliya before Haroon abi Wassab to negotiate the treaty." },
                { id: "ch2_5", text: "Swear the oath with Aliya before Haroon to sign the Qadi's peace treaty." },
                { id: "ch2_6", text: "Witness the genie Muliban's accusation, resulting in your family's banishment." }
            ],
            optional: [
                { id: "ch2_7", text: "Speak to the merchant in the market for extra lore on desert oasis." }
            ]
        },
        {
            id: 3,
            title: "The Monster-Infested Oasis",
            summary: "Enter the western desert oasis to harvest purple berries and meet a mermaid in distress.",
            map: "map_western_desert.png",
            required: [
                { id: "ch3_1", text: "Travel to the Western Desert Oasis." },
                { id: "ch3_2", text: "Fend off hyenas and thorn bushes." },
                { id: "ch3_3", text: "Collect the Purple Berries from the oasis bushes." },
                { id: "ch3_4", text: "Converse with the mermaid at the pool and accept her quest." }
            ],
            optional: [
                { id: "ch3_5", text: "Defeat the giant boar roaming the oasis outskirts for XP.", hint: "The boar charges in straight lines. Step aside, then strike its flank." }
            ]
        },
        {
            id: 4,
            title: "Deadman's Reef & The Ship",
            summary: "Infiltrate the undead-infested Reef of the Dead, rescue the mermaid's sister, and claim the Ship Orb.",
            map: "map_reef_of_dead.png",
            required: [
                { id: "ch4_1", text: "Sail or travel to Deadman's Reef." },
                { id: "ch4_2", text: "Rescue the mermaid's sister locked in the stone cell." },
                { id: "ch4_3", text: "Defeat the dark mage guarding the dock entrance." },
                { id: "ch4_4", text: "Enter the Rotting Ship's Hold and clear all zombies." },
                { id: "ch4_5", text: "Retrieve the Ship Orb from the helm cabin." },
                { id: "ch4_6", text: "Restore your ship to enable navigation across the sea." }
            ],
            optional: [
                { id: "ch4_7", text: "Smash barrels in the ship's hold to find hidden healing potions." }
            ]
        },
        {
            id: 5,
            title: "The Mage's Tower",
            summary: "Infiltrate the Sorcerer's Tower, survive the puzzle chambers, and conquer the toxic Acid Dungeon.",
            map: "map_acid_dungeon.png",
            required: [
                { id: "ch5_1", text: "Enter the Sorcerer's Tower Level 1." },
                { id: "ch5_2", text: "Solve the mirror optics and light reflection puzzle." },
                { id: "ch5_3", text: "Enter the subterranean Acid Dungeon." },
                { id: "ch5_4", text: "Defeat the Acid Slime King to neutralize the toxic pool." },
                { id: "ch5_5", text: "Retrieve the Enchanted Mirror and the Gilded Dove." },
                { id: "ch5_6", text: "Free the captured tower mage to receive his blessing." }
            ],
            optional: [
                { id: "ch5_7", text: "Solve the optional pressure-plate tile puzzle on Level 2 for items." }
            ]
        },
        {
            id: 6,
            title: "The Capital City",
            summary: "Explore the bustling trading hub of Bandar al Sa'adat. Purchase crucial equipment and learn advanced sword techniques.",
            map: "map_bandar_al_sadat.png",
            required: [
                { id: "ch6_1", text: "Visit the Supernatural Emporium to stock up on consumables." },
                { id: "ch6_2", text: "Buy Ingrid's Veil from the Shop of Wonders." },
                { id: "ch6_3", text: "Visit the Closed Inn (Traveler's Rest) and converse with patrons." }
            ],
            optional: [
                { id: "ch6_4", text: "Visit Zubakon at the shop with no sign to learn any new sword swings you are eligible for." },
                { id: "ch6_5", text: "Gamble at the Sand Point table using optimal binary search strategy." }
            ]
        },
        {
            id: 7,
            title: "The Caliph's Castle (First Visit)",
            summary: "Petition the Caliph to see your family. Retain your honor and submit to the Vizier's telepathic mind scan.",
            map: "map_caliphs_palace.png",
            required: [
                { id: "ch7_1", text: "Request an audience with the Caliph via the Vizier." },
                { id: "ch7_2", text: "Submit to the Vizier's mind scan." },
                { id: "ch7_3", text: "Answer the questions with absolute honesty." }
            ],
            optional: [
                { id: "ch7_4", text: "Gather hidden gold pouches behind the palace garden bushes." }
            ]
        },
        {
            id: 8,
            title: "The Island of Shibaz & Library",
            summary: "Travel to the rugged Island of Shibaz. Deal with the local hags and retrieve the Flying Carpet.",
            map: "map_isle_shibaz_l1.png",
            required: [
                { id: "ch8_1", text: "Land on the Island of Shibaz." },
                { id: "ch8_2", text: "Locate the Hermit's hut and accept his guidance." },
                { id: "ch8_3", text: "Retrieve the Flying Carpet from the harpy nest." },
                { id: "ch8_4", text: "Solve the hags' riddle to open the path to the Library." }
            ],
            optional: []
        },
        {
            id: 9,
            title: "The Library",
            summary: "Navigate the library maze to discover the location of the legendary Genie Lords.",
            map: "map_isle_shibaz_l2.png",
            required: [
                { id: "ch9_1", text: "Enter the Library stacks." },
                { id: "ch9_2", text: "Navigate through levels L1 to L3." },
                { id: "ch9_3", text: "Search book stacks to identify the 'Isle of Senat'." }
            ],
            optional: []
        },
        {
            id: 10,
            title: "The Genie Lords' Isle & Isle of Senat",
            summary: "Embark on a diplomatic gauntlet. Capture the Efreet agent, solve the chessboard navigation, and obtain the Efreet Potion.",
            map: "map_isle_jaza_ir_jiza.png",
            required: [
                { id: "ch10_1", text: "Retrieve the Bottle of Eternal Emptiness from the center of volcanic Isle of Senat." },
                { id: "ch10_2", text: "Trap the Efreet agent in the bottle." },
                { id: "ch10_3", text: "Navigate the Chessboard: Marid (North), Djinns (East), Daos (West)." },
                { id: "ch10_4", text: "Convince the Djinns to yield the Pale Blue Jewel of Fire." },
                { id: "ch10_5", text: "Trade the Jewel to the Dao Lord to release the Storyteller." },
                { id: "ch10_6", text: "Return the Storyteller to the Marid Lord to receive the Efreet Potion." },
                { id: "ch10_7", text: "Drink the potion, cross the South chessboard path, and learn the truth from the Efreet Lord." }
            ],
            optional: []
        },
        {
            id: 11,
            title: "Capital City & Castle (Second Visit)",
            summary: "Infiltrate the palace kitchen, bypass guards, and obtain the legendary Key of Bone.",
            map: "map_palace_facade.png",
            required: [
                { id: "ch11_1", text: "Return to Bandar al Sa'adat palace." },
                { id: "ch11_2", text: "Meet Sumie in the kitchen (wearing orange near fireplace)." },
                { id: "ch11_3", text: "Visit the Office of Trade to receive the baker referral." },
                { id: "ch11_4", text: "Speak to the Baker in the market to claim the Key of Bone." },
                { id: "ch11_5", text: "Return to Sumie to unlock the kitchen cellar door." }
            ],
            optional: []
        },
        {
            id: 12,
            title: "The Castle's Old Dungeon",
            summary: "Survive the trap-filled Old Dungeon, navigate toxic gas vents, and escort the cyclops Pangar-Bek to safety.",
            map: "map_old_dungeon.png",
            required: [
                { id: "ch12_1", text: "Enter the Old Dungeon passage." },
                { id: "ch12_2", text: "Retrieve the hidden key behind a boulder in the first room." },
                { id: "ch12_3", text: "Time your run past the poison and flame vents." },
                { id: "ch12_4", text: "Locate and escort the cyclops Pangar-Bek to the dungeon exit." }
            ],
            optional: []
        },
        {
            id: 13,
            title: "The Castle's New Dungeon (Second Visit)",
            summary: "Execute absolute stealth. Evade patrolling guards and reach Zubin's cell to learn about the Nameless Ones.",
            map: "map_caliphs_new_dungeon.png",
            required: [
                { id: "ch13_1", text: "Enter the New Dungeon (Stealth Section - Do not get caught)." },
                { id: "ch13_2", text: "Bypass the security pressure plates." },
                { id: "ch13_3", text: "Locate Zubin's cell and listen to his revelation." }
            ],
            optional: []
        },
        {
            id: 14,
            title: "The Castle's Private Chambers (Third Visit)",
            summary: "Sneak into the Vizier's private quarters and retrieve his journal detailing the curse conspiracy.",
            map: "map_caliphs_palace.png",
            required: [
                { id: "ch14_1", text: "Infiltrate the Vizier's private apartments." },
                { id: "ch14_2", text: "Evert the harem guards using stealth." },
                { id: "ch14_3", text: "Search the Vizier's desk to retrieve his conspiracy journal." }
            ],
            optional: []
        },
        {
            id: 15,
            title: "The Island of Al'Katraz",
            summary: "Explore the factions on Al'Katraz surface. Defeat elemental guardians to recover the three password keys.",
            map: "map_island_alkatraz.png",
            required: [
                { id: "ch15_1", text: "Sail to Al'Katraz island." },
                { id: "ch15_2", text: "Interact with the two warring mercenary groups." },
                { id: "ch15_3", text: "Solve the three elemental shrines to reveal the password." }
            ],
            optional: []
        },
        {
            id: 16,
            title: "The Prison of Al'Katraz",
            summary: "Infiltrate the prison dungeons, defeat the mercenary captain, and rescue your brother Tarik.",
            map: "map_dungeon_alkatraz.png",
            required: [
                { id: "ch16_1", text: "Enter Al'Katraz Prison Dungeon using the password." },
                { id: "ch16_2", text: "Defeat the Ettin guards." },
                { id: "ch16_3", text: "Defeat the Mercenary Captain to obtain the prison keys." },
                { id: "ch16_4", text: "Rescue Tarik and escort him back to the ship." }
            ],
            optional: []
        },
        {
            id: 17,
            title: "Aballat Isle",
            summary: "Sail to Aballat Isle. Negotiate with sand genies to trap your brother's voice and restore his speech.",
            map: "map_isle_aballat.png",
            required: [
                { id: "ch17_1", text: "Travel to Aballat Isle." },
                { id: "ch17_2", text: "Converse with the sand genies." },
                { id: "ch17_3", text: "Locate the voice-trapping bottles." },
                { id: "ch17_4", text: "Restore Tarik's voice." }
            ],
            optional: []
        },
        {
            id: 18,
            title: "Al-Naqqil, Home of the Nameless Ones",
            summary: "Infiltrate the island of the Nameless Masters. Collect the three magic neck pieces and unlock the teleporters.",
            map: "map_al_naqqil.png",
            required: [
                { id: "ch18_1", text: "Infiltrate Al-Naqqil." },
                { id: "ch18_2", text: "Evade the teleporter traps." },
                { id: "ch18_3", text: "Defeat the three Nameless mages to claim their magic necklaces." },
                { id: "ch18_4", text: "Open the gateway to the Outer Planes." }
            ],
            optional: []
        },
        {
            id: 19,
            title: "The Outer Planes (Finale)",
            summary: "Cross the void of the Outer Planes. Defeat the corrupted genie Kara, crush the Vizier, and lift the curse.",
            map: "map_unknown_plane.png",
            required: [
                { id: "ch19_1", text: "Cross the floating platform grids." },
                { id: "ch19_2", text: "Defeat the rogue genie Kara." },
                { id: "ch19_3", text: "Destroy the magical shield orbs." },
                { id: "ch19_4", text: "Defeat the Vizier and cleanse the Genie's Curse." }
            ],
            optional: []
        }
    ]
};

// Walkthrough-to-atlas route registry. Keep this JSON-shaped so coverage tests
// can verify that every chapter links only to decoded world ids.
const CHAPTER_ATLAS_ROUTES = Object.freeze({
    "1": ["opener"],
    "2": ["town"],
    "3": ["oasis"],
    "4": ["reef", "dedhold", "shipa"],
    "5": ["acida", "acid"],
    "6": ["road"],
    "7": ["roadb", "pal0"],
    "8": ["hermita"],
    "9": ["hermitb", "hermitc"],
    "10": ["senat", "lordsa", "lordsb", "lordsc", "lordsd", "lordse"],
    "11": ["road", "roadb", "pal0"],
    "12": ["olddung"],
    "13": ["newdung"],
    "14": ["pal0"],
    "15": ["feud"],
    "16": ["alkatrz"],
    "17": ["voice"],
    "18": ["finala"],
    "19": ["finalb"]
});

const WALKTHROUGH_ATLAS_TARGETS = Object.freeze({
    "sinbar": { "label": "Master Sinbar", "terms": ["Master Sinbar", "Sinbar"], "chapters": [1], "worldId": "opener", "locationNumber": 3 },
    "zaratan": { "label": "Zaratan", "terms": ["Zaratan"], "chapters": [1, 2], "worldId": "town" },
    "aliya": { "label": "Aliya", "terms": ["Aliya"], "chapters": [2], "worldId": "town", "actorId": 496 },
    "zubin-zaratan": { "label": "Zubin", "terms": ["Zubin"], "chapters": [2], "worldId": "town", "actorId": 165 },
    "jessamin": { "label": "Jessamin", "terms": ["Jessamin"], "chapters": [2], "worldId": "town", "actorId": 125 },
    "babazar": { "label": "Babazar", "terms": ["Babazar"], "chapters": [2], "worldId": "town", "locationNumber": 6 },
    "purple-berries": { "label": "Purple Berries", "terms": ["Purple Berries", "purple desert berries"], "chapters": [2, 3], "worldId": "oasis", "locationNumber": 2 },
    "haroon": { "label": "Haroon abi Wassab", "terms": ["Haroon abi Wassab", "Haroon"], "chapters": [2], "worldId": "town", "actorId": 423 },
    "qadi": { "label": "the Qadi", "terms": ["Qadi"], "chapters": [2], "worldId": "town", "locationNumber": 18 },
    "muliban": { "label": "Muliban", "terms": ["Muliban"], "chapters": [2], "worldId": "town", "actorId": 97 },
    "western-desert-oasis": { "label": "Western Desert Oasis", "terms": ["Western Desert Oasis"], "chapters": [3], "worldId": "oasis", "locationNumber": 1 },
    "oasis-mermaid": { "label": "the Pahari at the oasis", "terms": ["mermaid"], "chapters": [3], "worldId": "oasis", "locationNumber": 1 },
    "deadmans-reef": { "label": "Deadman's Reef", "terms": ["Deadman's Reef", "Reef of the Dead"], "chapters": [4], "worldId": "reef" },
    "rotting-ships-hold": { "label": "Rotting Ship's Hold", "terms": ["Rotting Ship's Hold", "ship's hold"], "chapters": [4], "worldId": "dedhold" },
    "ship-orb": { "label": "the Ship Orb", "terms": ["Ship Orb"], "chapters": [4], "worldId": "shipa" },
    "sorcerers-tower": { "label": "Sorcerer's Tower", "terms": ["Sorcerer's Tower"], "chapters": [5], "worldId": "acida" },
    "acid-dungeon": { "label": "Acid Dungeon", "terms": ["Acid Dungeon"], "chapters": [5], "worldId": "acid" },
    "bandar-al-saadat": { "label": "Bandar al-Sa'adat", "terms": ["Bandar al Sa'adat"], "chapters": [6], "worldId": "road" },
    "supernatural-emporium": { "label": "Supernatural Emporium", "terms": ["Supernatural Emporium"], "chapters": [6], "worldId": "road", "locationNumber": 7 },
    "ingrids-shop": { "label": "Ingrid's Shop of Wonders", "terms": ["Ingrid's Veil", "Shop of Wonders"], "chapters": [6], "worldId": "road", "locationNumber": 17 },
    "travelers-rest": { "label": "Traveler's Rest", "terms": ["Traveler's Rest", "Closed Inn"], "chapters": [6], "worldId": "road", "locationNumber": 9 },
    "zubakon": { "label": "Zubakon", "terms": ["Zubakon"], "chapters": [6], "worldId": "road", "actorId": 98 },
    "sand-point": { "label": "Sand's Point Gambling Club", "terms": ["Sand Point"], "chapters": [6], "worldId": "road", "locationNumber": 14 },
    "caliph": { "label": "the Caliph", "terms": ["Caliph"], "chapters": [7], "worldId": "pal0", "actorId": 263 },
    "vizier-palace": { "label": "the Vizier", "terms": ["Vizier"], "chapters": [7, 14], "worldId": "pal0", "actorId": 232 },
    "island-of-shibaz": { "label": "Island of Shibaz", "terms": ["Island of Shibaz"], "chapters": [8], "worldId": "hermita" },
    "shibaz-hermit": { "label": "Rashidin the Hermit", "terms": ["Hermit's hut", "Hermit"], "chapters": [8], "worldId": "hermita", "locationNumber": 16 },
    "flying-carpet": { "label": "the Flying Carpet", "terms": ["Flying Carpet"], "chapters": [8], "worldId": "hermita", "locationNumber": 16 },
    "shibaz-library": { "label": "the Library of Shibaz", "terms": ["Library"], "chapters": [8, 9], "worldId": "hermitb" },
    "isle-of-senat": { "label": "Isle of Senat", "terms": ["Isle of Senat"], "chapters": [9, 10], "worldId": "senat" },
    "genie-lords": { "label": "the Genie Lords' Isle", "terms": ["Genie Lords"], "chapters": [9, 10], "worldId": "lordsa" },
    "bottle-of-emptiness": { "label": "Bottle of Eternal Emptiness", "terms": ["Bottle of Eternal Emptiness"], "chapters": [10], "worldId": "senat", "locationNumber": 4 },
    "efreet-agent": { "label": "the Efreet agent", "terms": ["Efreet agent"], "chapters": [10], "worldId": "lordsa", "locationNumber": 3 },
    "genie-chessboard": { "label": "the giant chessboard", "terms": ["Chessboard"], "chapters": [10], "worldId": "lordsa", "locationNumber": 6 },
    "marid-lord": { "label": "the Marid Lord", "terms": ["Marid Lord", "Marid"], "chapters": [10], "worldId": "lordsd" },
    "djinn-lords": { "label": "the Djinn Lords", "terms": ["Djinn Lords", "Djinns"], "chapters": [10], "worldId": "lordse" },
    "dao-lord": { "label": "the Dao Lord", "terms": ["Dao Lord", "Daos"], "chapters": [10], "worldId": "lordsb" },
    "storyteller": { "label": "Shahar Izad the Storyteller", "terms": ["Storyteller"], "chapters": [10], "worldId": "lordsa", "actorId": 475 },
    "efreet-lord": { "label": "the Efreet Lord", "terms": ["Efreet Lord"], "chapters": [10], "worldId": "lordsc" },
    "bandar-palace": { "label": "Bandar al-Sa'adat palace", "terms": ["Bandar al Sa'adat palace"], "chapters": [11], "worldId": "pal0" },
    "sumie": { "label": "Sumia the head chef", "terms": ["Sumie"], "chapters": [11], "worldId": "pal0", "locationNumber": 8 },
    "office-of-trade": { "label": "Office of Trade", "terms": ["Office of Trade"], "chapters": [11], "worldId": "road", "locationNumber": 3 },
    "omar-baker": { "label": "Omar the Baker", "terms": ["Baker"], "chapters": [11], "worldId": "road", "locationNumber": 19 },
    "key-of-bone": { "label": "Key of Bone", "terms": ["Key of Bone"], "chapters": [11], "worldId": "road", "locationNumber": 19 },
    "old-dungeon": { "label": "the Old Dungeon", "terms": ["Old Dungeon"], "chapters": [12], "worldId": "olddung" },
    "pangar-bek": { "label": "Pangar-Bek", "terms": ["Pangar-Bek"], "chapters": [12], "worldId": "olddung", "locationNumber": 9 },
    "new-dungeon": { "label": "the Caliph's New Dungeon", "terms": ["New Dungeon"], "chapters": [13], "worldId": "newdung" },
    "zubin-dungeon": { "label": "Zubin's cell", "terms": ["Zubin"], "chapters": [13], "worldId": "newdung", "actorId": 70 },
    "nameless-masters": { "label": "Al-Naqqil, home of the Nameless Masters", "terms": ["Nameless Ones", "Nameless Masters", "Nameless mages"], "chapters": [13, 18], "worldId": "finala" },
    "vizier-quarters": { "label": "the Vizier's private quarters", "terms": ["Vizier's private quarters", "Vizier's private apartments"], "chapters": [14], "worldId": "pal0", "locationNumber": 14 },
    "vizier-desk": { "label": "the Vizier's work room", "terms": ["Vizier's desk"], "chapters": [14], "worldId": "pal0", "locationNumber": 13 },
    "alkatraz-island": { "label": "the Island of Al'Katraz", "terms": ["Island of Al'Katraz", "Al'Katraz surface", "Al'Katraz island"], "chapters": [15], "worldId": "feud" },
    "elemental-shrines": { "label": "the Al'Katraz shrines", "terms": ["elemental shrines"], "chapters": [15], "worldId": "feud", "locationNumber": 14 },
    "alkatraz-prison": { "label": "the Dungeon of Al'Katraz", "terms": ["Al'Katraz Prison Dungeon", "prison dungeons"], "chapters": [16], "worldId": "alkatrz" },
    "ettin-guard": { "label": "the Albino Ettin", "terms": ["Ettin guards"], "chapters": [16], "worldId": "alkatrz", "locationNumber": 26 },
    "mercenary-captain": { "label": "Iskar, the mercenary captain", "terms": ["Mercenary Captain"], "chapters": [16], "worldId": "alkatrz", "actorId": 265 },
    "tarik-prison": { "label": "Tarik's cell", "terms": ["Tarik"], "chapters": [16], "worldId": "alkatrz", "actorId": 383 },
    "aballat-isle": { "label": "Aballat Isle", "terms": ["Aballat Isle"], "chapters": [17], "worldId": "voice" },
    "voice-bottles": { "label": "the voice-trapping bottles", "terms": ["voice-trapping bottles"], "chapters": [17], "worldId": "voice" },
    "tarik-voice": { "label": "Tarik's trapped voice", "terms": ["Tarik's voice"], "chapters": [17], "worldId": "voice", "locationNumber": 10 },
    "al-naqqil": { "label": "Al-Naqqil", "terms": ["Al-Naqqil"], "chapters": [18], "worldId": "finala" },
    "outer-planes": { "label": "the Outer Planes", "terms": ["Outer Planes"], "chapters": [18, 19], "worldId": "finalb" },
    "princess-kara": { "label": "Princess Kara", "terms": ["Kara"], "chapters": [19], "worldId": "finalb", "locationNumber": 12 },
    "final-vizier": { "label": "the final confrontation", "terms": ["Vizier"], "chapters": [19], "worldId": "finalb", "locationNumber": 14 }
});

// Raw engine labels are sometimes role names or abbreviated script labels.
// These aliases are limited to identities corroborated by the cluebook text.
const ATLAS_ACTOR_CLUEBOOK_ALIASES = Object.freeze({
    "alkatrz": {
        "Alk_ettin": "Albino Ettin",
        "Merc_leader": "Iskar",
        "Alk_mage": "Kevric",
        "your_brother": "Tarik Al-Hazrad"
    },
    "feud": {
        "Ganleader": "Ra’is Saris",
        "Razleader": "Ra’is Taraq"
    },
    "hold": {
        "Your_brother": "Tarik Al-Hazrad"
    },
    "newdung": {
        "Alhazrad": "Zubin al-Hazrad"
    },
    "town": {
        "Family Genie": "Muliban"
    }
});

const ATLAS_CLUEBOOK_ALIGNMENT_RADIUS = 64;

// State Management
const QUEST_STORAGE_KEY = 'alqadim.questState.v1';

let questState = {};
let currentAtlasWorld = 'town';
let currentAtlasView = 'game';
let currentAtlasTab = 'people';
let currentAtlasChartKey = null;
let annotationsDB = {};
let atlasMap = null;
let atlasImageLayer = null;
let atlasGridLayer = null;
let atlasActorLayer = null;
let atlasLocationLayer = null;
let atlasDisplaySize = { width: 0, height: 0 };
let atlasLoadToken = 0;
let atlasControlsBound = false;
let atlasHashRead = false;
let atlasHoverCardPinned = false;
let atlasRenderPromise = Promise.resolve();
let pendingWalkthroughAtlasTarget = null;
let aiHistory = [];
let questPrompts = {};

const ATLAS_CHART_SIZES = {
    'map_testing_grounds.png': [1024, 1024],
    'map_zaratan.png': [1024, 1024],
    'map_western_desert.png': [1024, 1024],
    'map_reef_of_dead.png': [1024, 1024],
    'map_rotting_ships_hold.png': [1024, 1024],
    'map_the_ship.png': [1024, 1024],
    'map_sorcerers_tower_l1.png': [1024, 1024],
    'map_acid_dungeon.png': [1024, 1024],
    'map_sorcerers_tower_l2.png': [1024, 1024],
    'map_bandar_al_sadat.png': [1024, 1024],
    'map_palace_facade.png': [1024, 1024],
    'map_caliphs_palace.png': [1024, 1024],
    'map_caliphs_new_dungeon.png': [1024, 1024],
    'map_isle_shibaz_l1.png': [1024, 1024],
    'map_isle_shibaz_l2.png': [1024, 1024],
    'map_isle_shibaz_l3.png': [1024, 1024],
    'map_isle_jaza_ir_jiza.png': [1024, 1024],
    'map_isle_senat.png': [1024, 1024],
    'map_old_dungeon.png': [781, 655],
    'map_isle_hajar.png': [654, 451],
    'map_island_alkatraz.png': [913, 595],
    'map_dungeon_alkatraz.png': [912, 764],
    'map_ships_hold.png': [306, 491],
    'map_isle_aballat.png': [789, 615],
    'map_al_naqqil.png': [725, 588],
    'map_unknown_plane.png': [911, 569]
};

function saveQuestState() {
    localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(questState));
}

function loadQuestState() {
    const raw = localStorage.getItem(QUEST_STORAGE_KEY);
    if (raw) {
        try {
            questState = JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse quest state:', e);
            questState = {};
        }
    } else {
        questState = {};
    }
}

function toggleChecklist(id) {
    questState[id] = !questState[id];
    saveQuestState();
    updateProgressBar();
}

function getQuestStatusSummary() {
    let total = 0;
    let completed = 0;

    DB.chapters.forEach(ch => {
        ch.required.forEach(item => {
            total++;
            if (questState[item.id]) completed++;
        });
        ch.optional.forEach(item => {
            total++;
            if (questState[item.id]) completed++;
        });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
}

function updateProgressBar() {
    const summary = getQuestStatusSummary();
    const bar = document.getElementById('overall-progress-bar');
    const label = document.getElementById('overall-progress-label');

    if (bar && label) {
        bar.style.width = `${summary.percent}%`;
        label.textContent = `Overall Guide Progress: ${summary.completed}/${summary.total} Tasks Checked (${summary.percent}%)`;
    }
}

// Render Functions
function initTabs() {
    const nav = document.getElementById('main-nav');
    const sections = document.querySelectorAll('.content-section');

    function activateGuideSection(targetId) {
        const activeButton = nav.querySelector(`.nav-button[data-target="${targetId}"]`);
        const activeSection = document.getElementById(targetId);
        if (!activeButton || !activeSection?.classList.contains('content-section')) return;

        nav.querySelectorAll('.nav-button').forEach(button => {
            const isActive = button === activeButton;
            button.classList.toggle('active', isActive);
            if (isActive) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
        sections.forEach(section => section.classList.toggle('active', section === activeSection));

        if (targetId === 'atlas') {
            atlasRenderPromise = Promise.resolve(renderAtlas());
        } else if (window.location.hash.startsWith('#atlas=')) {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
        }
    }

    nav.addEventListener('click', (e) => {
        const button = e.target.closest('.nav-button');
        if (button && nav.contains(button)) activateGuideSection(button.dataset.target);
    });

    document.addEventListener('click', (e) => {
        const guideLink = e.target.closest('[data-guide-target]');
        if (!guideLink) return;
        activateGuideSection(guideLink.dataset.guideTarget);
        document.querySelector('.aq-header')?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
    });

    // Atlas links are durable and restore the correct guide tab on reload.
    if (window.location.hash.startsWith('#atlas=')) {
        nav.querySelector('[data-target="atlas"]')?.click();
    }
}

function renderCharacter() {
    const movesGrid = document.getElementById('combat-moves-grid');
    if (movesGrid) {
        movesGrid.innerHTML = DB.combatMoves.map(m => `
            <article class="corsair-swing-card ${m.class}">
                <div class="corsair-swing-card__top">
                    <span>${m.sequence}</span>
                    <small>${m.coverage}</small>
                </div>
                <h4>${m.name}</h4>
                <p>${m.effect}</p>
                <div class="corsair-swing-card__details">
                    <div><strong>Training</strong><span>${m.training}</span></div>
                    <div><strong>Input</strong><span>${m.control}</span></div>
                </div>
            </article>
        `).join('');
    }

    const shardsGrid = document.getElementById('shards-grid');
    if (shardsGrid) {
        shardsGrid.innerHTML = DB.moonstoneShards.map((s, index) => `
            <article class="corsair-shard-card" style="--shard-index: ${index}">
                <div class="corsair-shard-card__head"><span aria-hidden="true"></span><h4>${s.name}</h4></div>
                <dl>
                    <div><dt>Range</dt><dd>${s.range}</dd></div>
                    <div><dt>Damage</dt><dd>${s.damage}</dd></div>
                </dl>
                <p>${s.effect}</p>
            </article>
        `).join('');
    }
}

function renderWalkthroughAtlasText(value, chapterId) {
    const source = String(value ?? '');
    const candidates = Object.entries(WALKTHROUGH_ATLAS_TARGETS)
        .filter(([, target]) => target.chapters.includes(Number(chapterId)))
        .flatMap(([targetId, target]) => target.terms.map(term => ({ targetId, target, term })))
        .filter(candidate => source.toLowerCase().includes(candidate.term.toLowerCase()))
        .sort((first, second) => second.term.length - first.term.length);
    if (!candidates.length) return escapeAtlasText(source);

    const targetByTerm = new Map(candidates.map(candidate => [candidate.term.toLowerCase(), candidate]));
    const pattern = new RegExp(
        candidates.map(candidate => candidate.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
        'gi'
    );
    let cursor = 0;
    let markup = '';
    source.replace(pattern, (term, offset) => {
        const candidate = targetByTerm.get(term.toLowerCase());
        markup += escapeAtlasText(source.slice(cursor, offset));
        if (!candidate) {
            markup += escapeAtlasText(term);
            cursor = offset + term.length;
            return term;
        }
        const safeTargetId = escapeAtlasText(candidate.targetId);
        const safeTerm = escapeAtlasText(term);
        const accessibleLabel = escapeAtlasText(candidate.target.label);
        markup += `<button type="button" class="walkthrough-inline-atlas-link" data-walkthrough-atlas-target="${safeTargetId}" onclick="openWalkthroughAtlasTarget('${safeTargetId}')" aria-label="Show ${accessibleLabel} in the Atlas" title="Show ${accessibleLabel} in the Atlas">${safeTerm}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></button>`;
        cursor = offset + term.length;
        return term;
    });
    return markup + escapeAtlasText(source.slice(cursor));
}

function renderWalkthroughObjective(objective, chapterId) {
    const objectiveId = `walkthrough-objective-${escapeAtlasText(objective.id)}`;
    const objectiveLabelId = `${objectiveId}-label`;
    return `
        <div class="walkthrough-objective">
            <label class="walkthrough-objective__check" for="${objectiveId}">
                <input id="${objectiveId}" type="checkbox" class="walkthrough-objective__input" aria-labelledby="${objectiveLabelId}" ${questState[objective.id] ? 'checked' : ''} onchange="handleCheck('${escapeAtlasText(objective.id)}')">
                <span class="checkbox-custom" aria-hidden="true"></span>
            </label>
            <span id="${objectiveLabelId}" class="walkthrough-objective__text text-sm text-[var(--aq-text)]">${renderWalkthroughAtlasText(objective.text, chapterId)}</span>
        </div>
    `;
}

function renderWalkthrough() {
    const list = document.getElementById('chapter-list');
    if (!list) return;

    list.innerHTML = DB.chapters.map(ch => {
        const hasOptional = ch.optional.length > 0;
        return `
            <div class="chapter-item mb-4 rounded-lg overflow-hidden border border-gray-800/80">
                <button class="chapter-header w-full px-5 py-4 flex justify-between items-center text-left" onclick="toggleChapter(${ch.id})">
                    <div>
                        <span class="text-xs text-[var(--aq-accent-sand)] uppercase font-semibold">Chapter ${ch.id}</span>
                        <h3 class="text-lg font-bold text-[var(--aq-text)]">${ch.title}</h3>
                    </div>
                    <span class="chevron text-gray-500 transform transition-transform duration-200">&#9662;</span>
                </button>
                <div id="chapter-content-${ch.id}" class="chapter-content hidden px-5 py-4 border-t border-gray-800/50 bg-[#0f1224]/50">
                    <p class="text-sm text-[var(--aq-text-muted)] mb-4 italic">${renderWalkthroughAtlasText(ch.summary, ch.id)}</p>

                    ${renderChapterAtlasRoute(ch)}
                    
                    <!-- Special warning boxes for stealth chapters -->
                    ${[7, 13, 14].includes(ch.id) ? `
                        <div class="warning-box">
                            <div class="warning-box-title">⚠️ Mandatory Stealth Alert</div>
                            <p class="text-xs text-gray-300">Caution: Getting detected by guards in this castle/dungeon section triggers an immediate Game Over. Keep your scimitar sheathed and use cover points.</p>
                        </div>
                    ` : ''}

                    <!-- Special chess directions inside chapter 10 -->
                    ${ch.id === 10 ? `
                        <div class="gold-box text-xs space-y-1">
                            <h4 class="font-bold text-[var(--aq-accent-gold)] mb-1">♟️ Chessboard Navigator Coordinates:</h4>
                            <div>- <strong>${renderWalkthroughAtlasText('North path (Marid Lord)', ch.id)}</strong>: Go down 5, east 3, up 1.</div>
                            <div>- <strong>${renderWalkthroughAtlasText('East path (Djinn Lords)', ch.id)}</strong>: Go west 5, up 3, east 1.</div>
                            <div>- <strong>${renderWalkthroughAtlasText('West path (Dao Lord)', ch.id)}</strong>: Go east 5, down 3, west 1.</div>
                            <div>- <strong>${renderWalkthroughAtlasText('South path (Efreet Lord)', ch.id)}</strong>: Go north 5, east 3, south 1. <em>(Needs Efreet Potion)</em></div>
                        </div>
                    ` : ''}

                    <div class="space-y-3">
                        <h4 class="text-xs uppercase font-bold text-gray-400 tracking-wider">Required Objectives</h4>
                        <div class="space-y-2">
                            ${ch.required.map(objective => renderWalkthroughObjective(objective, ch.id)).join('')}
                        </div>
                    </div>

                    ${hasOptional ? `
                        <div class="mt-4 pt-4 border-t border-gray-800/40 space-y-3">
                            <h4 class="text-xs uppercase font-bold text-gray-400 tracking-wider">Optional Objectives</h4>
                            <div class="space-y-2">
                                ${ch.optional.map(o => `
                                    <div class="flex flex-col gap-1">
                                        ${renderWalkthroughObjective(o, ch.id)}
                                        ${o.hint ? `
                                            <button class="text-[10px] text-left text-[var(--aq-accent-teal)] hover:underline ml-8" onclick="alert('${o.hint}')">
                                                💡 Reveal Strategy Hint
                                            </button>
                                        ` : ''}
                                    </div>
                                `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderChapterAtlasRoute(chapter) {
    const worlds = (CHAPTER_ATLAS_ROUTES[String(chapter.id)] || [])
        .map(worldId => atlasData().worlds.find(world => world.id === worldId))
        .filter(Boolean);
    if (!worlds.length) return '';
    return `
        <aside class="chapter-atlas-route" aria-label="Atlas maps for chapter ${chapter.id}">
            <div class="chapter-atlas-route__intro">
                <span>Atlas route</span>
                <small>Open the decoded world without losing checklist progress.</small>
            </div>
            <div class="chapter-atlas-route__links">
                ${worlds.map(world => `
                    <button type="button" onclick="openWalkthroughAtlas('${escapeAtlasText(world.id)}')" aria-label="Open ${escapeAtlasText(world.title)} in the Atlas">
                        <span aria-hidden="true">⌖</span>${escapeAtlasText(world.title)}<b aria-hidden="true">→</b>
                    </button>
                `).join('')}
            </div>
        </aside>
    `;
}

async function openWalkthroughAtlas(worldId, targetId = null) {
    const world = atlasData().worlds.find(item => item.id === worldId);
    const atlasButton = document.querySelector('.nav-button[data-target="atlas"]');
    if (!world || !atlasButton) return;
    currentAtlasWorld = world.id;
    currentAtlasView = 'game';
    currentAtlasChartKey = null;
    pendingWalkthroughAtlasTarget = targetId ? WALKTHROUGH_ATLAS_TARGETS[targetId] : null;
    atlasButton.click();
    await atlasRenderPromise;
    document.getElementById('atlas')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
    });
}

function openWalkthroughAtlasTarget(targetId) {
    const target = WALKTHROUGH_ATLAS_TARGETS[targetId];
    if (!target) return;
    openWalkthroughAtlas(target.worldId, targetId);
}

function toggleChapter(id) {
    const panel = document.getElementById(`chapter-content-${id}`);
    const headers = document.querySelectorAll('.chapter-header');
    const btn = panel.previousElementSibling;

    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        btn.classList.add('active');
        btn.querySelector('.chevron').style.transform = 'rotate(180deg)';
    } else {
        panel.classList.add('hidden');
        btn.classList.remove('active');
        btn.querySelector('.chevron').style.transform = 'rotate(0deg)';
    }
}

function handleCheck(id) {
    toggleChecklist(id);
}

// Decoded Genie-engine Atlas
function atlasData() {
    return window.ALQADIM_ATLAS_DATA || { worlds: [], worldCount: 0 };
}

function atlasWorldById(worldId) {
    return atlasData().worlds.find(world => world.id === worldId) || atlasData().worlds[0];
}

function escapeAtlasText(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function readAtlasHash() {
    if (atlasHashRead) return;
    atlasHashRead = true;
    const match = window.location.hash.match(/^#atlas=([^&]+)(?:&view=(game|manual))?/);
    if (!match) return;
    const requested = decodeURIComponent(match[1]);
    if (atlasWorldById(requested)?.id === requested) currentAtlasWorld = requested;
    if (match[2]) currentAtlasView = match[2];
}

function updateAtlasHash() {
    const next = `#atlas=${encodeURIComponent(currentAtlasWorld)}&view=${currentAtlasView}`;
    if (window.location.hash !== next) history.replaceState(null, '', next);
}

function atlasCharts(world) {
    if (!world) return [];
    const configured = Array.isArray(world.charts) && world.charts.length
        ? world.charts
        : (world.annotationKey ? [{ annotationKey: world.annotationKey, image: world.manualImage }] : []);
    return configured.map((chart, index) => {
        const [fallbackWidth, fallbackHeight] = ATLAS_CHART_SIZES[chart.annotationKey] || [1024, 1024];
        return {
            annotationKey: chart.annotationKey,
            image: chart.image || `images/alqadim/${chart.annotationKey}`,
            label: chart.label || (configured.length > 1 ? `Chart ${index + 1}` : 'Cluebook chart'),
            width: Number(chart.width || fallbackWidth),
            height: Number(chart.height || fallbackHeight),
            gameBounds: chart.gameBounds || { x: 0, y: 0, width: world.width, height: world.height }
        };
    }).filter(chart => chart.annotationKey && annotationsDB[chart.annotationKey]);
}

function atlasActiveChart(world) {
    const charts = atlasCharts(world);
    return charts.find(chart => chart.annotationKey === currentAtlasChartKey) || charts[0] || null;
}

function atlasAnnotationSets(world) {
    return atlasCharts(world).map(chart => ({ chart, notes: annotationsDB[chart.annotationKey] }));
}

function atlasAnnotations(world) {
    const sets = atlasAnnotationSets(world);
    if (!sets.length) return null;
    return {
        source_pages: [...new Set(sets.map(({ notes }) => notes.source_pages).filter(Boolean))].join(', '),
        inhabitants: sets.flatMap(({ chart, notes }) =>
            (notes.inhabitants || []).map(person => ({ ...person, chartKey: chart.annotationKey, chartLabel: chart.label }))
        ),
        locations: sets.flatMap(({ chart, notes }) =>
            (notes.locations || []).map(location => ({ ...location, chartKey: chart.annotationKey, chartLabel: chart.label }))
        )
    };
}

function atlasLocationNotes(world, location) {
    const key = location?.chartKey || atlasActiveChart(world)?.annotationKey || world?.annotationKey;
    return key ? annotationsDB[key] : null;
}

function atlasSearchHaystack(world) {
    const notes = atlasAnnotations(world);
    const inhabitants = (notes?.inhabitants || []).map(person => `${person.name} ${person.description}`).join(' ');
    const locations = (notes?.locations || []).map(location => location.description).join(' ');
    const engineActors = (world.namedActors || []).map(actor => actor.name).join(' ');
    return `${world.title} ${world.engineId} ${engineActors} ${inhabitants} ${locations}`.toLowerCase();
}

function renderAtlasWorldList() {
    const listPanel = document.getElementById('map-select-list');
    const countLabel = document.getElementById('atlas-result-count');
    const search = document.getElementById('atlas-search-input');
    if (!listPanel) return;
    const query = (search?.value || '').trim().toLowerCase();
    const worlds = atlasData().worlds.filter(world => !query || atlasSearchHaystack(world).includes(query));
    if (countLabel) countLabel.textContent = worlds.length;
    listPanel.innerHTML = worlds.length ? worlds.map(world => {
        const notes = atlasAnnotations(world);
        const people = world.namedActors?.length || 0;
        return `
            <button type="button" role="option" aria-selected="${world.id === currentAtlasWorld}" class="annotation-item ${world.id === currentAtlasWorld ? 'active' : ''}" onclick="selectAtlasMap('${world.id}')">
                <span class="annotation-item-title">${escapeAtlasText(world.title)}</span>
                <span class="annotation-item-meta">
                    <span>${notes ? '<i class="annotation-source-dot"></i>' : ''}${escapeAtlasText(world.engineId)}</span>
                    <span>${world.mapWidth}×${world.mapHeight}${people ? ` · ${people} labels` : ''}</span>
                </span>
            </button>
        `;
    }).join('') : '<div class="atlas-empty m-3">No world, engine ID, inhabitant, or landmark matches that search.</div>';
}

function bindAtlasControls() {
    if (atlasControlsBound) return;
    atlasControlsBound = true;
    document.getElementById('atlas-search-input')?.addEventListener('input', renderAtlasWorldList);
    document.getElementById('atlas-view-game')?.addEventListener('click', () => setAtlasView('game'));
    document.getElementById('atlas-view-manual')?.addEventListener('click', () => setAtlasView('manual'));
    document.getElementById('atlas-chart-select')?.addEventListener('change', event => setAtlasChart(event.target.value));
    document.getElementById('atlas-fit-map')?.addEventListener('click', fitAtlasMap);
    document.getElementById('atlas-roof-toggle')?.addEventListener('change', () => loadAtlasImage(atlasWorldById(currentAtlasWorld)));
    document.getElementById('atlas-grid-toggle')?.addEventListener('change', renderAtlasGrid);
    document.getElementById('atlas-location-toggle')?.addEventListener('change', renderAtlasLocations);
    document.getElementById('atlas-actor-toggle')?.addEventListener('change', renderAtlasActors);
}

function ensureAtlasMap() {
    if (atlasMap || !window.L) return;
    atlasMap = L.map('alqadim-map', {
        crs: L.CRS.Simple,
        minZoom: -4,
        maxZoom: 3,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        attributionControl: true,
        preferCanvas: true
    });
    atlasMap.attributionControl.setPrefix(false);
    atlasMap.attributionControl.addAttribution('Decoded from original Al-Qadim game data');
    atlasMap.on('mousemove', event => {
        const readout = document.getElementById('atlas-coordinate-readout');
        if (!readout || currentAtlasView !== 'game') return;
        const x = Math.floor(event.latlng.lng / 16);
        const y = Math.floor((atlasDisplaySize.height - event.latlng.lat) / 16);
        const world = atlasWorldById(currentAtlasWorld);
        if (x >= 0 && y >= 0 && x < world.mapWidth && y < world.mapHeight) {
            readout.textContent = `Game tile X ${x} · Y ${y}  |  Pixel ${Math.floor(event.latlng.lng)}, ${Math.floor(atlasDisplaySize.height - event.latlng.lat)}`;
        }
    });
    atlasMap.on('mouseout', () => {
        const readout = document.getElementById('atlas-coordinate-readout');
        if (readout) readout.textContent = currentAtlasView === 'game'
            ? 'Move across the map to inspect tile coordinates.'
            : atlasManualReadout(atlasWorldById(currentAtlasWorld));
    });
}

function fitAtlasMap() {
    if (!atlasMap || !atlasDisplaySize.width || !atlasDisplaySize.height) return;
    atlasMap.fitBounds([[0, 0], [atlasDisplaySize.height, atlasDisplaySize.width]], { padding: [12, 12], animate: false });
}

function renderAtlasGrid() {
    if (!atlasMap) return;
    if (atlasGridLayer) {
        atlasMap.removeLayer(atlasGridLayer);
        atlasGridLayer = null;
    }
    const enabled = document.getElementById('atlas-grid-toggle')?.checked;
    if (!enabled || currentAtlasView !== 'game') return;
    const world = atlasWorldById(currentAtlasWorld);
    const lines = [];
    const style = { color: '#f4e2ba', weight: 0.45, opacity: 0.22, interactive: false };
    for (let x = 0; x <= world.mapWidth; x += 1) {
        lines.push(L.polyline([[0, x * 16], [world.height, x * 16]], style));
    }
    for (let y = 0; y <= world.mapHeight; y += 1) {
        const latitude = world.height - y * 16;
        lines.push(L.polyline([[latitude, 0], [latitude, world.width]], style));
    }
    atlasGridLayer = L.layerGroup(lines).addTo(atlasMap);
}

function atlasNameKey(value) {
    return String(value ?? '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function matchingAtlasActor(world, personName) {
    const personKey = atlasNameKey(personName);
    const personFirst = personKey.split(' ')[0];
    if (!personFirst || personFirst.length < 4) return null;
    const aliases = ATLAS_ACTOR_CLUEBOOK_ALIASES[world.id] || {};
    return (world.namedActors || []).find(actor => {
        const actorKey = atlasNameKey(actor.name);
        const actorFirst = actorKey.split(' ')[0];
        const aliasedPerson = Object.entries(aliases).find(([engineLabel]) =>
            atlasNameKey(engineLabel) === actorKey
        )?.[1];
        if (aliasedPerson && atlasNameKey(aliasedPerson) === personKey) return true;
        return actorKey === personKey
            || actorKey.startsWith(`${personKey} `)
            || personKey.startsWith(`${actorKey} `)
            || (actorFirst.length >= 4 && (
                actorFirst === personFirst
                || actorFirst.startsWith(personFirst)
                || personFirst.startsWith(actorFirst)
            ));
    }) || null;
}

function atlasGamePositions(world, location) {
    if (location?.gamePositions?.length) {
        return location.gamePositions.map(position => ({ ...position, positionKind: 'cluebook-registration' }));
    }
    const chart = atlasCharts(world).find(item => item.annotationKey === location?.chartKey)
        || atlasActiveChart(world);
    const notes = atlasLocationNotes(world, location);
    if (!chart || !notes) return [];
    const bounds = chart.gameBounds;
    return atlasManualPositions(notes, location).map(position => ({
        x: Math.round(bounds.x + (position.x / chart.width) * bounds.width),
        y: Math.round(bounds.y + (position.y / chart.height) * bounds.height),
        positionKind: 'cluebook-chart-projection'
    }));
}

function atlasLocationIntelligence(world, location) {
    const notes = atlasLocationNotes(world, location);
    const positions = atlasGamePositions(world, location);
    return (notes?.inhabitants || [])
        .filter(person => Number(person.location) === Number(location.number))
        .map(person => {
            const actor = matchingAtlasActor(world, person.name);
            const nearestDistance = actor && positions.length
                ? Math.min(...positions.map(position => Math.hypot(actor.x - position.x, actor.y - position.y)))
                : Number.POSITIVE_INFINITY;
            return {
                person,
                actor,
                coordinateAgrees: Boolean(actor && nearestDistance <= ATLAS_CLUEBOOK_ALIGNMENT_RADIUS),
                nearestDistance
            };
        });
}

function atlasActorCluebookPlacement(world, actor) {
    const locations = atlasAnnotations(world)?.locations || [];
    const candidates = locations.flatMap(location => {
        const match = atlasLocationIntelligence(world, location)
            .find(item => Number(item.actor?.id) === Number(actor.id));
        if (!match) return [];
        return atlasGamePositions(world, location).map(position => ({
            ...match,
            location,
            position,
            distance: Math.hypot(actor.x - position.x, actor.y - position.y)
        }));
    });
    return candidates.sort((left, right) => left.distance - right.distance)[0] || null;
}

function atlasActorResolvedPlacement(world, actor) {
    const cluebook = atlasActorCluebookPlacement(world, actor);
    const override = Boolean(cluebook && !cluebook.coordinateAgrees);
    return {
        actor,
        cluebook,
        override,
        displayPosition: override ? cluebook.position : { x: actor.x, y: actor.y },
        navigationPosition: cluebook?.position || { x: actor.x, y: actor.y }
    };
}

function atlasActorEvidenceContent(actor, cluebook = null, authoritative = false) {
    if (cluebook && authoritative) {
        return `<strong>${escapeAtlasText(cluebook.person.name)}</strong><span class="atlas-evidence-pill">Cluebook-authoritative position</span><p>Cluebook #${escapeAtlasText(cluebook.location.number)} places this person here. Engine actor record #${actor.id} starts at Pixel ${actor.x}, ${actor.y}; that contradictory spawn is hidden and is not used for navigation.</p>`;
    }
    if (cluebook) {
        return `<strong>${escapeAtlasText(cluebook.person.name)}</strong><span class="atlas-evidence-pill atlas-evidence-engine">Engine and cluebook agree</span><p>Cluebook #${escapeAtlasText(cluebook.location.number)} corroborates engine actor record #${actor.id}. Navigation uses the cluebook coordinate.</p>`;
    }
    return `<strong>${escapeAtlasText(actor.name)}</strong><span class="atlas-evidence-pill atlas-evidence-engine">Decoded initial spawn</span><p>Engine actor record #${actor.id} · Pixel ${actor.x}, ${actor.y} · Tile ${Math.floor(actor.x / 16)}, ${Math.floor(actor.y / 16)}</p>`;
}

function atlasActorSpriteBounds(world, actor, position) {
    const top = position.y - Number(actor.spriteHotspotY);
    const left = position.x - Number(actor.spriteHotspotX);
    const bottom = top + Number(actor.spriteHeight);
    const right = left + Number(actor.spriteWidth);
    return [[world.height - bottom, left], [world.height - top, right]];
}

function showAtlasHoverCard(content, pinned = false) {
    if (atlasHoverCardPinned && !pinned) return;
    const card = document.getElementById('atlas-hover-card');
    const body = document.getElementById('atlas-hover-card-body');
    if (!card || !body) return;
    body.innerHTML = content;
    card.hidden = false;
    atlasHoverCardPinned = pinned;
    card.classList.toggle('is-pinned', pinned);
}

function hideAtlasHoverCard(force = false) {
    if (atlasHoverCardPinned && !force) return;
    const card = document.getElementById('atlas-hover-card');
    if (card) card.hidden = true;
    atlasHoverCardPinned = false;
    card?.classList.remove('is-pinned');
}

function bindAtlasHoverCard(layer, content, label, focusLatLng = null) {
    layer.on('mouseover', () => showAtlasHoverCard(content));
    layer.on('mouseout', () => hideAtlasHoverCard());
    layer.on('add', () => {
        const element = layer.getElement();
        if (!element) return;
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        element.setAttribute('aria-label', label);
        element.setAttribute('aria-controls', 'atlas-hover-card');
        element.addEventListener('focus', () => showAtlasHoverCard(content));
        element.addEventListener('blur', () => hideAtlasHoverCard());
        element.addEventListener('pointerdown', event => {
            event.stopPropagation();
            showAtlasHoverCard(content, true);
        });
        element.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            showAtlasHoverCard(content, true);
            if (focusLatLng && atlasMap) atlasMap.panInside(focusLatLng, { padding: [24, 24] });
        });
    });
}

function createAtlasActorSprite(world, actor, position, inference = null) {
    if (!actor.spriteImage || !actor.spriteWidth || !actor.spriteHeight) return null;
    const inferred = Boolean(inference);
    const displayName = inference?.person?.name || actor.name;
    const tooltip = atlasActorEvidenceContent(actor, inference, inferred);
    const layer = L.imageOverlay(actor.spriteImage, atlasActorSpriteBounds(world, actor, position), {
        className: `atlas-actor-sprite ${inferred ? 'atlas-actor-sprite-inferred' : 'atlas-actor-sprite-authored'}`,
        interactive: true,
        opacity: inferred ? 0.94 : 1,
        alt: `${displayName} ${inferred ? 'cluebook-inferred' : 'decoded'} sprite`
    });
    const center = L.latLng(
        (world.height - position.y) + ((Number(actor.spriteHotspotY) - (Number(actor.spriteHeight) / 2)) || 0),
        position.x + (((Number(actor.spriteWidth) / 2) - Number(actor.spriteHotspotX)) || 0)
    );
    bindAtlasHoverCard(layer, tooltip, `${displayName}: open map details`, center);
    return layer;
}

function renderAtlasActors() {
    if (!atlasMap) return;
    if (atlasActorLayer) {
        atlasMap.removeLayer(atlasActorLayer);
        atlasActorLayer = null;
    }
    const enabled = document.getElementById('atlas-actor-toggle')?.checked;
    if (!enabled || currentAtlasView !== 'game') return;
    const world = atlasWorldById(currentAtlasWorld);
    const markers = (world.namedActors || [])
        .map(actor => atlasActorResolvedPlacement(world, actor))
        .filter(item => item.displayPosition.x >= 0
            && item.displayPosition.y >= 0
            && item.displayPosition.x < world.width
            && item.displayPosition.y < world.height)
        .map(item => {
            const { actor, cluebook, override, displayPosition } = item;
            const evidence = override ? cluebook : null;
            const sprite = createAtlasActorSprite(world, actor, displayPosition, evidence);
            if (sprite) return sprite;
            const marker = L.circleMarker([world.height - displayPosition.y, displayPosition.x], {
                radius: 4,
                color: '#f5c842',
                weight: 1.5,
                fillColor: '#102642',
                fillOpacity: 0.86
            });
            const displayName = cluebook?.person?.name || actor.name;
            const markerContent = atlasActorEvidenceContent(actor, evidence, override);
            bindAtlasHoverCard(marker, markerContent, `${displayName}: open map details`, marker.getLatLng());
            return marker;
        });
    atlasActorLayer = L.layerGroup(markers).addTo(atlasMap);
}

function registeredAtlasLocations(world) {
    const notes = atlasAnnotations(world);
    return (notes?.locations || []).flatMap(location =>
        atlasGamePositions(world, location).map((position, positionIndex) => ({
            ...position,
            number: location.number,
            description: location.description,
            chartKey: location.chartKey,
            chartLabel: location.chartLabel,
            intelligence: atlasLocationIntelligence(world, location),
            positionIndex
        }))
    );
}

function atlasManualPositions(notes, location) {
    return location.manualPositions || notes?.manualHotspots?.[String(location.number)] || [];
}

function registeredManualAtlasLocations(world) {
    const chart = atlasActiveChart(world);
    const notes = chart ? annotationsDB[chart.annotationKey] : null;
    return (notes?.locations || []).flatMap(location =>
        atlasManualPositions(notes, location).map((position, positionIndex) => ({
            ...position,
            number: location.number,
            description: location.description,
            chartKey: chart.annotationKey,
            chartLabel: chart.label,
            intelligence: atlasLocationIntelligence(world, { ...location, chartKey: chart.annotationKey }),
            positionIndex
        }))
    );
}

function registeredAllManualAtlasLocations(world) {
    return atlasAnnotationSets(world).flatMap(({ chart, notes }) =>
        (notes.locations || []).flatMap(location =>
            atlasManualPositions(notes, location).map((position, positionIndex) => ({
                ...position,
                number: location.number,
                description: location.description,
                chartKey: chart.annotationKey,
                chartLabel: chart.label,
                positionIndex
            }))
        )
    );
}

function atlasManualPositionsForWorld(world, location) {
    return atlasManualPositions(atlasLocationNotes(world, location), location);
}

function visibleRegisteredAtlasLocations(world) {
    return currentAtlasView === 'manual'
        ? registeredManualAtlasLocations(world)
        : registeredAtlasLocations(world);
}

function atlasPlaceTooltip(place) {
    const registration = place.positionKind === 'cluebook-chart-projection'
        ? '<span class="atlas-evidence-pill atlas-evidence-engine">Chart-projected game hint</span>'
        : '';
    const evidence = (place.intelligence || []).map(item => {
        let status = 'Cluebook association';
        let explanation = 'No readable active engine actor coordinate is available for this person.';
        if (item.coordinateAgrees) {
            status = 'Engine coordinate agrees';
            explanation = 'The decoded initial actor coordinate is at this cluebook location.';
        } else if (item.actor) {
            status = 'Cluebook-authoritative position';
            explanation = 'The cluebook places this person here, so a contradictory decoded spawn is suppressed.';
        }
        return `<div class="atlas-place-evidence ${item.coordinateAgrees ? 'is-confirmed' : 'is-inferred'}"><strong>${escapeAtlasText(item.person.name)}</strong><span>${escapeAtlasText(status)}</span><p>${escapeAtlasText(explanation)}</p></div>`;
    }).join('');
    return `<div class="atlas-place-tooltip-content"><strong class="atlas-place-tooltip-title">Cluebook #${escapeAtlasText(place.number)}</strong>${registration}<p class="atlas-place-tooltip-description">${escapeAtlasText(place.description)}</p>${evidence}</div>`;
}

function atlasLocationEvidenceSummary(world, location) {
    const intelligence = atlasLocationIntelligence(world, location);
    if (!intelligence.length) return '';
    const names = intelligence.map(item => escapeAtlasText(item.person.name)).join(', ');
    const hasDynamicPresence = intelligence.some(item => item.actor && !item.coordinateAgrees);
    const label = hasDynamicPresence ? 'Cluebook-authoritative position' : 'Cluebook-linked people';
    return `<span class="atlas-landmark-intelligence"><strong>${label}:</strong> ${names}</span>`;
}

function renderAtlasLocations() {
    if (!atlasMap) return;
    if (atlasLocationLayer) {
        atlasMap.removeLayer(atlasLocationLayer);
        atlasLocationLayer = null;
    }
    const enabled = document.getElementById('atlas-location-toggle')?.checked;
    if (!enabled) return;
    const world = atlasWorldById(currentAtlasWorld);
    const isManual = currentAtlasView === 'manual';
    const markers = visibleRegisteredAtlasLocations(world)
        .filter(place => place.x >= 0 && place.y >= 0 && place.x < atlasDisplaySize.width && place.y < atlasDisplaySize.height)
        .map(place => {
            const hasPeople = place.intelligence?.length > 0;
            const hasInference = place.intelligence?.some(item => item.actor && !item.coordinateAgrees);
            const marker = L.marker([atlasDisplaySize.height - place.y, place.x], {
                icon: L.divIcon({
                    className: `atlas-place-marker ${isManual ? 'atlas-manual-place-marker' : ''} ${place.positionKind === 'cluebook-chart-projection' ? 'atlas-place-marker-projected' : ''}`,
                    html: isManual
                        ? `<span><span class="sr-only">Cluebook location </span>${escapeAtlasText(place.number)}</span>`
                        : `<span>${escapeAtlasText(place.number)}</span>${hasPeople ? `<i class="atlas-place-evidence-dot ${hasInference ? 'is-inferred' : 'is-confirmed'}" aria-hidden="true"></i>` : ''}`,
                    iconSize: isManual ? [44, 44] : [28, 28],
                    // Keep the numbered cluebook marker beside, rather than
                    // directly over, an actor sprite sharing this position.
                    iconAnchor: isManual ? [22, 22] : (hasPeople ? [-6, 14] : [14, 14])
                }),
                keyboard: true,
                alt: `Cluebook location ${place.number}: ${place.description}`
            });
            bindAtlasHoverCard(
                marker,
                atlasPlaceTooltip(place),
                `Cluebook location ${place.number}: ${place.description}`,
                marker.getLatLng()
            );
            marker.on('click', () => {
                currentAtlasTab = 'locations';
                renderAtlasDetails(world);
            });
            return marker;
        });
    atlasLocationLayer = L.layerGroup(markers).addTo(atlasMap);
}

function loadAtlasImage(world) {
    hideAtlasHoverCard(true);
    ensureAtlasMap();
    if (!atlasMap) return;
    const token = ++atlasLoadToken;
    const activeChart = atlasActiveChart(world);
    const usingManual = Boolean(currentAtlasView === 'manual' && activeChart);
    const usingRoofs = !usingManual && document.getElementById('atlas-roof-toggle')?.checked && world.roofImage;
    const source = usingManual ? activeChart.image : (usingRoofs ? world.roofImage : world.image);
    const image = new Image();
    image.onload = () => {
        if (token !== atlasLoadToken) return;
        if (atlasImageLayer) atlasMap.removeLayer(atlasImageLayer);
        const width = usingManual ? image.naturalWidth : world.width;
        const height = usingManual ? image.naturalHeight : world.height;
        atlasDisplaySize = { width, height };
        const bounds = [[0, 0], [height, width]];
        atlasImageLayer = L.imageOverlay(source, bounds, {
            className: usingManual ? 'atlas-manual-layer' : 'atlas-game-layer',
            alt: `${world.title} ${usingManual ? 'cluebook chart' : (usingRoofs ? 'decoded game map with roofs' : 'decoded cutaway game map')}`
        }).addTo(atlasMap);
        atlasMap.setMaxBounds(L.latLngBounds(bounds).pad(0.35));
        fitAtlasMap();
        renderAtlasGrid();
        renderAtlasLocations();
        renderAtlasActors();
        if (pendingWalkthroughAtlasTarget?.worldId === world.id) {
            const target = pendingWalkthroughAtlasTarget;
            pendingWalkthroughAtlasTarget = null;
            if (target.actorId != null) revealEngineActor(target.actorId);
            else if (target.locationNumber != null) {
                const place = registeredAtlasLocations(world).find(item =>
                    Number(item.number) === Number(target.locationNumber)
                );
                revealRegisteredAtlasLocation(target.locationNumber, target.chartKey || null);
                if (place) showAtlasHoverCard(atlasPlaceTooltip(place), true);
            }
        }
        window.setTimeout(() => atlasMap.invalidateSize({ animate: false }), 0);
    };
    image.onerror = () => {
        pendingWalkthroughAtlasTarget = null;
        const readout = document.getElementById('atlas-coordinate-readout');
        if (readout) readout.textContent = `Unable to load ${source}`;
    };
    image.src = source;
}

function atlasManualReadout(world) {
    if (registeredManualAtlasLocations(world).length) {
        return 'Cluebook chart; hover or focus a numbered circle for its description.';
    }
    const chart = atlasActiveChart(world);
    const notes = chart ? annotationsDB[chart.annotationKey] : null;
    return notes?.chartHasPrintedLabels === false
        ? 'This source chart has no printed number circles; use Game render for registered cluebook hints.'
        : 'This cluebook chart has no printed number at this location.';
}

function setAtlasChart(chartKey) {
    const world = atlasWorldById(currentAtlasWorld);
    if (!atlasCharts(world).some(chart => chart.annotationKey === chartKey)) return;
    currentAtlasChartKey = chartKey;
    updateAtlasHeader(world);
    renderAtlasDetails(world);
    if (currentAtlasView === 'manual') loadAtlasImage(world);
    else renderAtlasLocations();
}

function setAtlasView(view) {
    const world = atlasWorldById(currentAtlasWorld);
    if (view === 'manual' && !atlasCharts(world).length) return;
    currentAtlasView = view;
    document.getElementById('atlas-view-game')?.classList.toggle('active', view === 'game');
    document.getElementById('atlas-view-manual')?.classList.toggle('active', view === 'manual');
    const grid = document.getElementById('atlas-grid-toggle');
    if (grid) grid.disabled = view !== 'game';
    const actors = document.getElementById('atlas-actor-toggle');
    if (actors) actors.disabled = view !== 'game';
    const locations = document.getElementById('atlas-location-toggle');
    if (locations) locations.disabled = view === 'manual'
        ? !registeredManualAtlasLocations(world).length
        : !registeredAtlasLocations(world).length;
    const roofs = document.getElementById('atlas-roof-toggle');
    if (roofs) roofs.disabled = view !== 'game' || !world.roofImage;
    const readout = document.getElementById('atlas-coordinate-readout');
    if (readout) readout.textContent = view === 'game'
        ? 'Move across the map to inspect tile coordinates.'
        : atlasManualReadout(world);
    loadAtlasImage(world);
    updateAtlasHash();
}

function setAtlasDetailTab(tab) {
    currentAtlasTab = tab;
    renderAtlasDetails(atlasWorldById(currentAtlasWorld));
}

function revealAtlasLocation() {
    const world = atlasWorldById(currentAtlasWorld);
    currentAtlasTab = 'locations';
    if (atlasCharts(world).length) setAtlasView('manual');
    renderAtlasDetails(world);
}

function revealRegisteredAtlasLocation(number, chartKey = null) {
    const world = atlasWorldById(currentAtlasWorld);
    const notes = atlasAnnotations(world);
    const location = (notes?.locations || []).find(item =>
        Number(item.number) === Number(number) && (!chartKey || item.chartKey === chartKey)
    );
    if (location?.chartKey) {
        currentAtlasChartKey = location.chartKey;
        updateAtlasHeader(world);
    }
    const manualPosition = location ? atlasManualPositionsForWorld(world, location)[0] : null;
    const gamePosition = location ? atlasGamePositions(world, location)[0] : null;
    const useManual = currentAtlasView === 'manual' && manualPosition;
    const position = useManual ? manualPosition : gamePosition || manualPosition;
    if (!position) {
        revealAtlasLocation();
        return;
    }
    currentAtlasTab = 'locations';
    const toggle = document.getElementById('atlas-location-toggle');
    if (toggle) toggle.checked = true;
    if (useManual) renderAtlasLocations();
    else if (gamePosition && currentAtlasView !== 'game') setAtlasView('game');
    else if (!gamePosition && manualPosition && currentAtlasView !== 'manual') setAtlasView('manual');
    else renderAtlasLocations();
    renderAtlasDetails(world);
    window.setTimeout(() => {
        if (!atlasMap) return;
        const height = (useManual || (!gamePosition && manualPosition)) ? atlasDisplaySize.height : world.height;
        atlasMap.setView([height - position.y, position.x], Math.max(1, atlasMap.getZoom()), { animate: false });
    }, 0);
}

function revealEngineActor(actorId) {
    const world = atlasWorldById(currentAtlasWorld);
    const actor = (world.namedActors || []).find(item => Number(item.id) === Number(actorId));
    if (!actor) return;
    const resolved = atlasActorResolvedPlacement(world, actor);
    const position = resolved.navigationPosition;
    const toggle = document.getElementById('atlas-actor-toggle');
    if (toggle) toggle.checked = true;
    if (currentAtlasView !== 'game') setAtlasView('game');
    else renderAtlasActors();
    window.setTimeout(() => {
        if (!atlasMap) return;
        atlasMap.setView([world.height - position.y, position.x], Math.max(1, atlasMap.getZoom()), { animate: false });
        showAtlasHoverCard(
            atlasActorEvidenceContent(actor, resolved.cluebook, resolved.override),
            true
        );
    }, 0);
}

function renderAtlasDetails(world) {
    const panel = document.getElementById('map-details-panel');
    if (!panel || !world) return;
    const notes = atlasAnnotations(world);
    const inhabitants = notes?.inhabitants || [];
    const locations = notes?.locations || [];
    const engineActors = world.namedActors || [];
    let body = '';

    if (currentAtlasTab === 'people') {
        const engineBody = engineActors.length ? engineActors.map(actor => {
            const resolved = atlasActorResolvedPlacement(world, actor);
            const person = resolved.cluebook?.person;
            const location = resolved.cluebook?.location;
            const displayName = person?.name || actor.name;
            const locationLabel = resolved.override
                ? `Cluebook #${location.number} · corrected`
                : (location ? `Cluebook #${location.number} · aligned` : `Pixel ${actor.x}, ${actor.y}`);
            const detail = resolved.override
                ? `Engine actor record #${actor.id} starts at Pixel ${actor.x}, ${actor.y}, but the cluebook places ${escapeAtlasText(displayName)} at location ${location.number}. Select to open the cluebook source of truth.`
                : (location
                    ? `Engine actor record #${actor.id} agrees with this cluebook location. Select to locate it on the rendered map.`
                    : `Engine actor record #${actor.id} · Tile ${Math.floor(actor.x / 16)}, ${Math.floor(actor.y / 16)}. Select to locate it on the rendered map.`);
            return `
                <button type="button" class="atlas-record atlas-record-engine ${resolved.override ? 'atlas-record-corrected' : ''}" onclick="revealEngineActor(${actor.id})">
                    <span class="atlas-record-name">${escapeAtlasText(displayName)}</span>
                    <span class="atlas-record-location ${resolved.override ? 'is-corrected' : ''}">${locationLabel}</span>
                    <p>${detail}</p>
                </button>
            `;
        }).join('') : '<div class="atlas-empty">No readable actor label was recovered for this world.</div>';
        const cluebookBody = inhabitants.length ? inhabitants.map(person => `
            <button type="button" class="atlas-record" ${person.location !== null ? `onclick="revealRegisteredAtlasLocation(${Number(person.location)}, '${escapeAtlasText(person.chartKey)}')"` : ''}>
                <span class="atlas-record-name">${escapeAtlasText(person.name)}</span>
                <span class="atlas-record-location">${person.location !== null ? `Cluebook #${person.location}${atlasCharts(world).length > 1 ? ` · ${escapeAtlasText(person.chartLabel)}` : ''}` : 'Roaming / varies'}</span>
                <p>${escapeAtlasText(person.description)}</p>
            </button>
        `).join('') : '<div class="atlas-empty">No named cluebook inhabitant is attached to this engine world.</div>';
        body = `
            <div class="atlas-detail-section-title">Engine actor labels <span>${engineActors.length}</span></div>
            <p class="atlas-detail-section-note">Raw names and initial coordinates decoded from the world library; internal or scripted labels are preserved as written.</p>
            ${engineBody}
            <div class="atlas-detail-section-title atlas-detail-section-spaced">Cluebook inhabitants <span>${inhabitants.length}</span></div>
            ${cluebookBody}
        `;
    } else if (currentAtlasTab === 'locations') {
        body = locations.length ? locations.map(location => `
            <button type="button" class="atlas-landmark" onclick="revealRegisteredAtlasLocation(${Number(location.number)}, '${escapeAtlasText(location.chartKey)}')">
                <span class="atlas-landmark-number">${escapeAtlasText(location.number)}</span>
                <p>${atlasCharts(world).length > 1 ? `<span class="atlas-landmark-registration">${escapeAtlasText(location.chartLabel)}</span>` : ''}${escapeAtlasText(location.description)}${atlasLocationEvidenceSummary(world, location)}${atlasGamePositions(world, location).length ? `<span class="atlas-landmark-registration">${atlasGamePositions(world, location).length} game hint${atlasGamePositions(world, location).length === 1 ? '' : 's'}</span>` : ''}${atlasManualPositionsForWorld(world, location).length ? `<span class="atlas-landmark-registration">Hover hotspot on ${atlasManualPositionsForWorld(world, location).length} printed chart label${atlasManualPositionsForWorld(world, location).length === 1 ? '' : 's'}</span>` : '<span class="atlas-landmark-registration">No printed chart number</span>'}</p>
            </button>
        `).join('') : '<div class="atlas-empty">No numbered cluebook landmarks are linked to this engine world.</div>';
    } else {
        body = `
            <table class="atlas-source-table">
                <tr><th>Engine member</th><td>${escapeAtlasText(world.sourceFile)}</td></tr>
                <tr><th>Terrain grid</th><td>${world.mapWidth} × ${world.mapHeight} cells</td></tr>
                <tr><th>Raster</th><td>${world.width} × ${world.height} px</td></tr>
                <tr><th>Tile bank</th><td>${world.tileCount} tiles · ${world.tileBits}-bit index</td></tr>
                <tr><th>Scenery</th><td>${world.sceneryCount.toLocaleString()} placed records</td></tr>
                <tr><th>Foreground</th><td>${world.foregroundCount.toLocaleString()} roof/layer records</td></tr>
                <tr><th>Registered places</th><td>${registeredAtlasLocations(world).length.toLocaleString()} game hints · ${registeredAllManualAtlasLocations(world).length.toLocaleString()} chart hotspots</td></tr>
                <tr><th>Actors</th><td>${world.actorCount.toLocaleString()} records · ${engineActors.length} readable labels</td></tr>
                <tr><th>Palette</th><td>Original 256-colour HLIB palette</td></tr>
                <tr><th>Source bytes</th><td>${world.sourceBytes.toLocaleString()}</td></tr>
                <tr><th>SHA-256</th><td title="${world.sourceSha256}">${world.sourceSha256.slice(0, 16)}…</td></tr>
                <tr><th>Cluebook</th><td>${notes ? `${atlasCharts(world).length} matched chart${atlasCharts(world).length === 1 ? '' : 's'} · ${escapeAtlasText(notes.source_pages)}` : 'No linked chart in the cluebook'}</td></tr>
                ${world.chartNote ? `<tr><th>Chart scope</th><td>${escapeAtlasText(world.chartNote)}</td></tr>` : ''}
            </table>
            <div class="atlas-empty mt-3">The game render is deterministic: member 0 supplies map cells; member 1 supplies terrain and palette; members 2, 4, and 6 supply actor, scenery, and foreground sprites; member 8 supplies placement records and actor labels. Scripted or conditional objects may move, hide, or change during play.</div>
        `;
    }

    panel.innerHTML = `
        <div class="atlas-detail-header">
            <h4>${escapeAtlasText(world.title)}</h4>
            <p>${engineActors.length} readable engine actor labels${notes ? `, ${inhabitants.length} cluebook inhabitants, and ${locations.length} numbered locations.` : '; no directly matched cluebook chart.'}</p>
        </div>
        <div class="atlas-detail-tabs" role="tablist" aria-label="Map records">
            <button type="button" class="${currentAtlasTab === 'people' ? 'active' : ''}" onclick="setAtlasDetailTab('people')">Actors (${engineActors.length})</button>
            <button type="button" class="${currentAtlasTab === 'locations' ? 'active' : ''}" onclick="setAtlasDetailTab('locations')">Places (${locations.length})</button>
            <button type="button" class="${currentAtlasTab === 'source' ? 'active' : ''}" onclick="setAtlasDetailTab('source')">Source</button>
        </div>
        <div class="atlas-detail-body scroll-panel">${body}</div>
    `;
}

function updateAtlasHeader(world) {
    const title = document.getElementById('atlas-map-title');
    const eyebrow = document.getElementById('atlas-map-eyebrow');
    const badges = document.getElementById('atlas-map-badges');
    const manualButton = document.getElementById('atlas-view-manual');
    const chartPicker = document.getElementById('atlas-chart-picker');
    const chartSelect = document.getElementById('atlas-chart-select');
    const charts = atlasCharts(world);
    const activeChart = atlasActiveChart(world);
    if (title) title.textContent = world.title;
    if (eyebrow) eyebrow.textContent = world.sourceFile;
    if (badges) badges.innerHTML = `
        <span class="atlas-map-badge">${world.mapWidth}×${world.mapHeight} tiles</span>
        <span class="atlas-map-badge">${world.width}×${world.height} px</span>
        <span class="atlas-map-badge">${world.tileCount} terrain tiles</span>
        <span class="atlas-map-badge">${world.sceneryCount} scenery</span>
        <span class="atlas-map-badge">${world.actorCount} actors</span>
    `;
    if (manualButton) {
        manualButton.disabled = !charts.length;
        manualButton.title = charts.length ? 'Show the matched cluebook chart' : 'The cluebook does not provide a chart for this engine world';
    }
    if (chartPicker && chartSelect) {
        chartPicker.hidden = charts.length < 2;
        chartSelect.innerHTML = charts.map(chart =>
            `<option value="${escapeAtlasText(chart.annotationKey)}" ${chart.annotationKey === activeChart?.annotationKey ? 'selected' : ''}>${escapeAtlasText(chart.label)}</option>`
        ).join('');
    }
    const roofToggle = document.getElementById('atlas-roof-toggle');
    if (roofToggle) {
        roofToggle.disabled = currentAtlasView !== 'game' || !world.roofImage;
        roofToggle.title = world.roofImage ? 'Show the engine roof/foreground layer' : 'This world has no separate roof/foreground layer';
    }
    const locationToggle = document.getElementById('atlas-location-toggle');
    const registeredCount = currentAtlasView === 'manual'
        ? registeredManualAtlasLocations(world).length
        : registeredAtlasLocations(world).length;
    if (locationToggle) {
        locationToggle.disabled = !registeredCount;
        locationToggle.title = registeredCount
            ? (currentAtlasView === 'manual' ? 'Enable hoverable cluebook chart labels' : 'Show cluebook numbers registered to game coordinates')
            : (currentAtlasView === 'manual' ? 'This chart does not have registered label hotspots yet' : 'This world has not been manually registered yet');
    }
}

async function renderAtlas() {
    if (!document.getElementById('alqadim-map') || !atlasData().worlds.length) return;
    readAtlasHash();
    bindAtlasControls();

    if (Object.keys(annotationsDB).length === 0) {
        try {
            // Registration coordinates are intentionally hand-editable; do
            // not let a stale browser cache hide a corrected cluebook marker.
            const res = await fetch('js/AlqadimAnnotations.json', { cache: 'no-store' });
            if (res.ok) annotationsDB = await res.json();
        } catch (e) {
            console.error('Error fetching annotations:', e);
        }
    }
    const npcCount = atlasData().worlds.reduce((sum, map) => sum + (map.namedActors?.length || 0), 0);
    const npcLabel = document.getElementById('atlas-npc-count');
    const worldLabel = document.getElementById('atlas-world-count');
    if (npcLabel) npcLabel.textContent = npcCount;
    if (worldLabel) worldLabel.textContent = atlasData().worldCount;

    const world = atlasWorldById(currentAtlasWorld);
    const charts = atlasCharts(world);
    if (!charts.some(chart => chart.annotationKey === currentAtlasChartKey)) {
        currentAtlasChartKey = charts[0]?.annotationKey || null;
    }
    if (!charts.length && currentAtlasView === 'manual') currentAtlasView = 'game';
    renderAtlasWorldList();
    updateAtlasHeader(world);
    renderAtlasDetails(world);
    setAtlasView(currentAtlasView);
}

function selectAtlasMap(worldId) {
    const world = atlasWorldById(worldId);
    if (!world) return;
    currentAtlasWorld = world.id;
    currentAtlasChartKey = atlasCharts(world)[0]?.annotationKey || null;
    if (currentAtlasView === 'manual' && !atlasCharts(world).length) currentAtlasView = 'game';
    renderAtlasWorldList();
    updateAtlasHeader(world);
    renderAtlasDetails(world);
    setAtlasView(currentAtlasView);
    document.querySelector(`.annotation-item[onclick="selectAtlasMap('${world.id}')"]`)?.scrollIntoView({ block: 'nearest' });
}

function renderBestiary() {
    const list = document.getElementById('bestiary-grid');
    if (list) {
        list.innerHTML = DB.bestiary.map(m => `
            <div class="bg-[#101426] border border-gray-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-lg text-[var(--aq-accent-sand)]">${m.name}</h4>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded ${
                            m.danger === 'Low' ? 'bg-green-950 text-green-300' :
                            m.danger === 'Medium' ? 'bg-yellow-950 text-yellow-300' : 'bg-red-950 text-red-300'
                        }">${m.danger} Danger</span>
                    </div>
                    <p class="text-xs text-[var(--aq-text-muted)] mt-1">Found in: ${m.location}</p>
                    <p class="text-sm mt-3 text-[var(--aq-text)] bg-black/20 p-2 rounded border border-gray-900/60">${m.strategy}</p>
                </div>
            </div>
        `).join('');
    }

    const itemsList = document.getElementById('key-items-grid');
    if (itemsList) {
        itemsList.innerHTML = DB.keyItems.map(i => `
            <div class="bg-[#101426] border border-gray-800 rounded-lg p-4">
                <h4 class="font-bold text-md text-[var(--aq-accent-gold)]">${i.name}</h4>
                <p class="text-xs text-[var(--aq-accent-sand)] mt-0.5">Found: ${i.location}</p>
                <p class="text-sm mt-2 text-[var(--aq-text-muted)]">${i.description}</p>
            </div>
        `).join('');
    }

    const shopsList = document.getElementById('shops-grid');
    if (shopsList) {
        shopsList.innerHTML = DB.shops.map(s => `
            <div class="aq-card p-5">
                <h4 class="text-xl font-bold text-[var(--aq-accent-gold)] border-b border-gray-800 pb-2 mb-4">${s.name}</h4>
                <div class="space-y-3">
                    ${s.inventory.map(item => `
                        <div class="flex justify-between text-sm gap-2">
                            <div>
                                <span class="font-semibold text-[var(--aq-text)]">${item.item}</span>
                                <p class="text-xs text-[var(--aq-text-muted)] mt-0.5">${item.description}</p>
                            </div>
                            <span class="text-xs font-bold text-[var(--aq-accent-sand)] whitespace-nowrap">${item.cost}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
}

// Guess the Number Gambling Helper Widget
function calculateGamblingGuess() {
    const minInput = document.getElementById('gambling-min');
    const maxInput = document.getElementById('gambling-max');
    const guessCount = document.getElementById('gambling-guess-count');
    const log = document.getElementById('gambling-result-log');

    if (!minInput || !maxInput || !guessCount || !log) return;

    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);
    const count = parseInt(guessCount.value);

    if (isNaN(min) || isNaN(max) || min >= max) {
        log.innerHTML = '<span class="text-red-400">Please enter valid min and max bounds.</span>';
        return;
    }

    // Binary search suggestion
    const mid = Math.floor((min + max) / 2);
    log.innerHTML = `
        <div class="space-y-2 text-xs">
            <p><strong>Step ${count + 1} Recommendation</strong>: Guess <strong>${mid}</strong></p>
            <p class="text-[var(--aq-text-muted)]">If the dealer says:</p>
            <div class="grid grid-cols-2 gap-2 mt-2">
                <button class="bg-[#1c2545]/60 hover:bg-[#1c2545] p-2 rounded border border-gray-800 text-left" onclick="updateGamblingBounds(${min}, ${mid - 1}, ${count + 1})">
                    ⬇️ "Too High"<br><span class="text-[10px] text-gray-400">Range turns to [${min}, ${mid - 1}]</span>
                </button>
                <button class="bg-[#1c2545]/60 hover:bg-[#1c2545] p-2 rounded border border-gray-800 text-left" onclick="updateGamblingBounds(${mid + 1}, ${max}, ${count + 1})">
                    ⬆️ "Too Low"<br><span class="text-[10px] text-gray-400">Range turns to [${mid + 1}, ${max}]</span>
                </button>
            </div>
        </div>
    `;
}

function updateGamblingBounds(newMin, newMax, newCount) {
    document.getElementById('gambling-min').value = newMin;
    document.getElementById('gambling-max').value = newMax;
    document.getElementById('gambling-guess-count').value = newCount;
    calculateGamblingGuess();
}

function resetGamblingBounds() {
    document.getElementById('gambling-min').value = 1;
    document.getElementById('gambling-max').value = 100;
    document.getElementById('gambling-guess-count').value = 0;
    document.getElementById('gambling-result-log').innerHTML = '<span class="text-[var(--aq-text-muted)] italic">Enter parameters above and calculate.</span>';
}

// AI Genie Counsel integration
async function callGeminiFunction(prompt, maxRetries = 3) {
    const apiUrl = '/php/llm.php';
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();

            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
            throw new Error('Invalid response structure from Gemini API');
        } catch (error) {
            console.warn(`API call attempt ${i + 1} failed. Retrying in ${delay}ms...`, error);
            if (i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
            } else {
                throw error;
            }
        }
    }
}

async function loadQuestPrompts() {
    try {
        const res = await fetch('prompts/alqadim_prompts.json');
        if (res.ok) {
            questPrompts = await res.json();
        }
    } catch (e) {
        console.warn('Failed to load prompts JSON context:', e);
    }
}

function appendAiMessage(role, text) {
    const body = document.getElementById('walkthrough-ai-body');
    if (!body) return;

    const el = document.createElement('div');
    el.className = `flex flex-col gap-1 w-full ${role === 'user' ? 'items-end' : 'items-start'}`;

    const label = document.createElement('span');
    label.className = 'text-[10px] text-gray-500 font-semibold px-2';
    label.textContent = role === 'user' ? 'You (Corsair)' : '🔮 Genie\'s Counsel';

    const bubble = document.createElement('div');
    bubble.className = `message ${role}`;

    // Use marked if available, otherwise fallback
    if (window.marked && role === 'ai') {
        bubble.innerHTML = marked.parse(text);
    } else {
        bubble.textContent = text;
    }

    el.appendChild(label);
    el.appendChild(bubble);
    body.appendChild(el);

    body.scrollTop = body.scrollHeight;
}

function showAiTyping() {
    const body = document.getElementById('walkthrough-ai-body');
    if (!body) return;

    const el = document.createElement('div');
    el.id = 'ai-typing-indicator';
    el.className = 'flex flex-col gap-1 w-full items-start';

    const label = document.createElement('span');
    label.className = 'text-[10px] text-gray-500 font-semibold px-2';
    label.textContent = '🔮 Genie\'s Counsel';

    const bubble = document.createElement('div');
    bubble.className = 'message ai typing-indicator';
    bubble.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;

    el.appendChild(label);
    el.appendChild(bubble);
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
}

function hideAiTyping() {
    const el = document.getElementById('ai-typing-indicator');
    if (el) el.remove();
}

async function sendAiMessage() {
    const input = document.getElementById('walkthrough-ai-input');
    const sendBtn = document.getElementById('walkthrough-ai-send');
    if (!input || !sendBtn) return;

    const text = input.value.trim();
    if (!text) return;

    // Append user message
    appendAiMessage('user', text);
    input.value = '';

    // Disable input
    input.disabled = true;
    sendBtn.disabled = true;
    showAiTyping();

    aiHistory.push({ role: 'user', content: text });

    // Determine current chapter context
    // Find first active accordion chapter, or fallback to chapter 1
    let chapterContext = 'Graduating From the Academy';
    const activeHeaders = document.querySelectorAll('.chapter-header.active');
    if (activeHeaders.length > 0) {
        const titleEl = activeHeaders[0].querySelector('h3');
        if (titleEl) chapterContext = titleEl.textContent;
    }

    // Load prompt context
    if (Object.keys(questPrompts).length === 0) {
        await loadQuestPrompts();
    }

    const template = questPrompts[chapterContext] || `
        <context>
        You are the Genie's Counsel, a mystical but practical AI guide helping the Corsair through the Arabian Nights game Al-Qadim: The Genie's Curse.
        Current Chapter: ${chapterContext}
        </context>
        <query>User Query</query>
    `;

    // Construct merged prompt
    const recent = aiHistory.slice(-6);
    const transcript = recent.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const finalPrompt = `${template.replace('<query>User Query</query>', '')}
    
<transcript>
${transcript}
</transcript>
    
Please respond to the user's latest query above, staying in character as a mystical genie, keeping hints clear, structured, and helpful.`;

    try {
        const reply = await callGeminiFunction(finalPrompt);
        hideAiTyping();
        appendAiMessage('ai', reply);
        aiHistory.push({ role: 'assistant', content: reply });
    } catch (e) {
        console.error('LLM API Call failed:', e);
        hideAiTyping();
        appendAiMessage('ai', "My apologies, master. The sands of time are clouded and my connection to the ethereal plane is broken. Please consult your scimitar and try again.");
    } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

function clearAiChat() {
    const body = document.getElementById('walkthrough-ai-body');
    if (body) {
        body.innerHTML = `
            <p class="text-[var(--aq-text-muted)] italic text-center py-8">Genie terminal online. Select a chapter in the walkthrough to update context, then ask the Genie for wisdom.</p>
        `;
    }
    aiHistory = [];
}

// Global binding
window.toggleChapter = toggleChapter;
window.handleCheck = handleCheck;
window.openWalkthroughAtlas = openWalkthroughAtlas;
window.openWalkthroughAtlasTarget = openWalkthroughAtlasTarget;
window.selectAtlasMap = selectAtlasMap;
window.setAtlasDetailTab = setAtlasDetailTab;
window.revealAtlasLocation = revealAtlasLocation;
window.calculateGamblingGuess = calculateGamblingGuess;
window.resetGamblingBounds = resetGamblingBounds;
window.sendAiMessage = sendAiMessage;
window.clearAiChat = clearAiChat;
window.updateGamblingBounds = updateGamblingBounds;

// Init Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadQuestState();
    initTabs();
    renderCharacter();
    renderWalkthrough();
    renderBestiary();
    updateProgressBar();

    // Bind AI send trigger
    const aiInput = document.getElementById('walkthrough-ai-input');
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAiMessage();
            }
        });
    }

    // Preload prompts
    loadQuestPrompts();
});
