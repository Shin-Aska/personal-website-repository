// Al-Qadim: The Genie's Curse Interactive Companion Guide Logic & Data
// Pattern matched to Albion.js and Ultima7.js

const DB = {
    character: {
        class: "Corsair",
        description: "A specialized fighter archetype native to Zakhara. Corsairs combine martial prowess with sailors' agility, specialized swordplay moves, and basic magical device activation.",
        stats: [
            { name: "Strength (STR)", value: 16, description: "Governs base melee damage and weapon accuracy." },
            { name: "Dexterity (DEX)", value: 15, description: "Affects armor class rating and projectile evasion." },
            { name: "Intelligence (INT)", value: 12, description: "Affects magical device understanding and item usage." },
            { name: "Constitution (CON)", value: 14, description: "Determines hit point growth and poison resistance." },
            { name: "Charisma (CHA)", value: 15, description: "Influences reaction adjustments from NPCs and genies." }
        ]
    },
    combatMoves: [
        {
            name: "Hack",
            effect: "A heavy downward slash dealing +50% physical damage and breaking through enemy shields.",
            trainer: "Zaratan Training Compound / Academy Grounds",
            requirements: "Base level 2. Activated by holding the attack button until the scimitar gem lights up yellow.",
            class: "hack"
        },
        {
            name: "Sweep",
            effect: "A wide 180-degree sweep hitting multiple enemies standing in front of you.",
            trainer: "Capital City (Bandar al Sa'adat) - Shop with no sign",
            requirements: "Base level 4. Activated by holding attack until the scimitar gem flashes orange.",
            class: "sweep"
        },
        {
            name: "Twirling Sweep",
            effect: "A full 360-degree spin-strike clearing all surrounding enemies and providing brief invincibility frames.",
            trainer: "Capital City (Bandar al Sa'adat) - Shop with no sign",
            requirements: "Base level 6. Activated by holding attack until the scimitar gem shines bright red.",
            class: "twirling"
        }
    ],
    moonstoneShards: [
        { name: "Lightning", charges: 25, effect: "Shoots bouncing electrical bolts dealing massive chain damage.", notes: "Extremely limited. Best saved for bosses/large mobs." },
        { name: "Cone of Cold", charges: 12, effect: "Emits a wide freeze spray in a single direction, stopping enemies.", notes: "Excellent crowd control tool." },
        { name: "Water Blast", charges: 15, effect: "Launches high-velocity water projectiles.", notes: "Deals double damage to Fire Elementals and Efreet minions." },
        { name: "Sunfire", charges: 10, effect: "Triggers a fireball blast upon impact, leaving burning terrain.", notes: "Use from range to avoid self-inflicted fire damage." },
        { name: "Sun Scorch", charges: 15, effect: "Ignites a targeted enemy and deals damage over time.", notes: "Highly effective against plant-like creatures." },
        { name: "Fire Arrow", charges: 7, effect: "Launches rapid fire projectiles.", notes: "Common shard, useful for standard combat." },
        { name: "Magic Missile", charges: 12, effect: "Fires homing energy missiles that never miss.", notes: "Abundant and reliable for flying targets." }
    ],
    potions: [
        { name: "Healing Potion", effect: "Restores a small portion of hit points.", source: "Supernatural Emporium (50G)" },
        { name: "Extra Healing Potion", effect: "Fully restores hit points. Crucial consumable.", source: "Supernatural Emporium (120G)" },
        { name: "Giant Strength Potion", effect: "Increases STR to 22, substantially raising physical hit damage temporarily.", source: "Supernatural Emporium (150G)" },
        { name: "Invulnerability Potion", effect: "Reduces all incoming damage to 1 and boosts armor class temporarily.", source: "Supernatural Emporium (200G)" },
        { name: "Oil of Fire Invulnerability", effect: "Grants 100% immunity to fire damage and fire elementals.", source: "Supernatural Emporium (100G)" },
        { name: "Oil of Air Invulnerability", effect: "Grants immunity to air blasts and elemental storm strikes.", source: "Supernatural Emporium (100G)" },
        { name: "Oil of Earth Invulnerability", effect: "Grants immunity to falling rock debris and seismic shocks.", source: "Supernatural Emporium (100G)" },
        { name: "Oil of Water Invulnerability", effect: "Grants immunity to drowning and water blast damage.", source: "Supernatural Emporium (100G)" }
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
        { name: "Zombie & Skeleton", location: "Deadman's Reef, Dungeons", danger: "Medium", strategy: "Slow moving. Keep distance, utilize Hack moves to break shields." },
        { name: "Acid Slime", location: "Sorcerer's Tower (Acid Dungeon)", danger: "Medium", strategy: "Leaves toxic pools. Do not stand in green residue. Strike from range." },
        { name: "Fire Elemental", location: "Isle of Senat, Dungeons", danger: "High", strategy: "Immune to fire. Apply Water Blast shards or Oil of Fire Invulnerability." },
        { name: "Hag", location: "Isle of Shibaz Outskirts", danger: "High", strategy: "Casts magic missile streams. Evade behind columns, strike during cooldown." },
        { name: "Scaly-Horned Ogre", location: "Library of Shibaz, Dungeons", danger: "High", strategy: "Huge health pool. Evade heavy clubs. Charge Hack move." },
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
                { id: "ch6_4", text: "Visit the Trainer (Shop with no sign) to learn Sweep & Twirling Sweep." },
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

// State Management
const QUEST_STORAGE_KEY = 'alqadim.questState.v1';
const ART_MODE_KEY = 'alqadim.artMode.v1';

let questState = {};
let currentArtMode = 'remastered'; // default
let currentAtlasMap = 'map_zaratan.png';
let annotationsDB = {};
let aiHistory = [];
let questPrompts = {};

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

    nav.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-button')) {
            const targetId = e.target.dataset.target;

            // Update buttons
            nav.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Update sections
            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });

            // If switching to Atlas, sync layout
            if (targetId === 'atlas') {
                renderAtlas();
            }
        }
    });
}

function initArtSwitcher() {
    const classicBtn = document.getElementById('art-classic');
    const remasteredBtn = document.getElementById('art-remastered');

    const savedMode = localStorage.getItem(ART_MODE_KEY);
    if (savedMode === 'classic' || savedMode === 'remastered') {
        currentArtMode = savedMode;
    }

    function applyArtMode(mode) {
        currentArtMode = mode;
        localStorage.setItem(ART_MODE_KEY, mode);

        if (mode === 'classic') {
            classicBtn.classList.add('active');
            remasteredBtn.classList.remove('active');
        } else {
            remasteredBtn.classList.add('active');
            classicBtn.classList.remove('active');
        }

        // Swap illustrations on the page
        document.querySelectorAll('[data-art-classic]').forEach(el => {
            const classicSrc = el.dataset.artClassic;
            const remasteredSrc = el.dataset.artRemastered;
            el.src = (mode === 'classic') ? classicSrc : remasteredSrc;
        });
    }

    classicBtn.addEventListener('click', () => applyArtMode('classic'));
    remasteredBtn.addEventListener('click', () => applyArtMode('remastered'));

    applyArtMode(currentArtMode);
}

function renderCharacter() {
    const statsGrid = document.getElementById('character-stats-grid');
    if (statsGrid) {
        statsGrid.innerHTML = DB.character.stats.map(s => `
            <div class="p-4 rounded bg-[#101426] border border-gray-800">
                <h4 class="font-bold text-sm text-[var(--aq-accent-gold)]">${s.name}</h4>
                <div class="text-2xl font-extrabold mt-1 text-[var(--aq-text)]">${s.value}</div>
                <p class="text-xs text-[var(--aq-text-muted)] mt-1">${s.description}</p>
            </div>
        `).join('');
    }

    const movesGrid = document.getElementById('combat-moves-grid');
    if (movesGrid) {
        movesGrid.innerHTML = DB.combatMoves.map(m => `
            <div class="move-card ${m.class} aq-card p-5">
                <h4 class="text-xl font-bold text-[var(--aq-accent-sand)]">${m.name}</h4>
                <p class="text-sm mt-2 text-[var(--aq-text)]">${m.effect}</p>
                <div class="mt-4 space-y-1 text-xs text-[var(--aq-text-muted)] border-t border-gray-800/60 pt-3">
                    <div><span class="font-semibold text-gray-400">Where to learn:</span> ${m.trainer}</div>
                    <div><span class="font-semibold text-gray-400">Controls:</span> ${m.requirements}</div>
                </div>
            </div>
        `).join('');
    }

    const shardsTable = document.getElementById('shards-table');
    if (shardsTable) {
        shardsTable.innerHTML = DB.moonstoneShards.map(s => `
            <tr class="hover:bg-gray-800/30">
                <td class="font-bold text-[var(--aq-accent-teal)]">${s.name}</td>
                <td>${s.charges}</td>
                <td>${s.effect}</td>
                <td class="text-xs text-[var(--aq-text-muted)]">${s.notes}</td>
            </tr>
        `).join('');
    }

    const potionsTable = document.getElementById('potions-table');
    if (potionsTable) {
        potionsTable.innerHTML = DB.potions.map(p => `
            <tr class="hover:bg-gray-800/30">
                <td class="font-bold text-[var(--aq-accent-gold)]">${p.name}</td>
                <td>${p.effect}</td>
                <td class="text-xs text-[var(--aq-text-muted)]">${p.source}</td>
            </tr>
        `).join('');
    }
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
                    <p class="text-sm text-[var(--aq-text-muted)] mb-4 italic">${ch.summary}</p>
                    
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
                            <div>- <strong>North path (Marid Lord)</strong>: Go down 5, east 3, up 1.</div>
                            <div>- <strong>East path (Djinn Lords)</strong>: Go west 5, up 3, east 1.</div>
                            <div>- <strong>West path (Dao Lord)</strong>: Go east 5, down 3, west 1.</div>
                            <div>- <strong>South path (Efreet Lord)</strong>: Go north 5, east 3, south 1. <em>(Needs Efreet Potion)</em></div>
                        </div>
                    ` : ''}

                    <div class="space-y-3">
                        <h4 class="text-xs uppercase font-bold text-gray-400 tracking-wider">Required Objectives</h4>
                        <div class="space-y-2">
                            ${ch.required.map(r => `
                                <label class="flex items-start gap-3 cursor-pointer select-none">
                                    <input type="checkbox" class="hidden" ${questState[r.id] ? 'checked' : ''} onchange="handleCheck('${r.id}')">
                                    <span class="checkbox-custom mt-0.5"></span>
                                    <span class="text-sm text-[var(--aq-text)]">${r.text}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    ${hasOptional ? `
                        <div class="mt-4 pt-4 border-t border-gray-800/40 space-y-3">
                            <h4 class="text-xs uppercase font-bold text-gray-400 tracking-wider">Optional Objectives</h4>
                            <div class="space-y-2">
                                ${ch.optional.map(o => `
                                    <div class="flex flex-col gap-1">
                                        <label class="flex items-start gap-3 cursor-pointer select-none">
                                            <input type="checkbox" class="hidden" ${questState[o.id] ? 'checked' : ''} onchange="handleCheck('${o.id}')">
                                            <span class="checkbox-custom mt-0.5"></span>
                                            <span class="text-sm text-[var(--aq-text)]">${o.text}</span>
                                        </label>
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

// Atlas Map Viewer & Coordinates
async function renderAtlas() {
    const listPanel = document.getElementById('map-select-list');
    const imageContainer = document.getElementById('map-view-image-container');
    const detailsPanel = document.getElementById('map-details-panel');

    if (!listPanel || !imageContainer || !detailsPanel) return;

    // Load annotations database if not loaded
    if (Object.keys(annotationsDB).length === 0) {
        try {
            const res = await fetch('js/AlqadimAnnotations.json');
            if (res.ok) {
                annotationsDB = await res.json();
            }
        } catch (e) {
            console.error('Error fetching annotations:', e);
        }
    }

    const maps = Object.keys(annotationsDB);
    if (maps.length === 0) {
        listPanel.innerHTML = '<p class="text-xs text-red-400">Failed to load coordinates annotations.</p>';
        return;
    }

    // List of map selections
    listPanel.innerHTML = maps.map(m => {
        // Format filename as readable name
        const cleanName = m.replace('map_', '').replace('.png', '').replaceAll('_', ' ');
        return `
            <div class="annotation-item p-3 border-b border-gray-800 text-sm font-semibold capitalize ${m === currentAtlasMap ? 'active' : ''}" onclick="selectAtlasMap('${m}')">
                🗺️ ${cleanName}
            </div>
        `;
    }).join('');

    // Load selected map data
    const mapData = annotationsDB[currentAtlasMap];
    if (mapData) {
        imageContainer.innerHTML = `
            <img class="map-view-image mx-auto max-h-[500px] object-contain" src="images/alqadim/${currentAtlasMap}" alt="${currentAtlasMap}">
        `;

        // Render Inhabitants & Landmark descriptions
        const inhabitantsHtml = (mapData.inhabitants && mapData.inhabitants.length > 0) ? mapData.inhabitants.map(i => `
            <div class="p-3 bg-[#11162b] border border-gray-800 rounded">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-[var(--aq-accent-gold)]">${i.name}</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-300">Loc: ${i.location !== null ? i.location : 'Any'}</span>
                </div>
                <p class="text-xs text-[var(--aq-text-muted)]">${i.description}</p>
            </div>
        `).join('') : '<p class="text-xs text-gray-500 italic">No inhabitant database listings for this location.</p>';

        const locationsHtml = (mapData.locations && mapData.locations.length > 0) ? mapData.locations.map(l => `
            <div class="p-3 bg-[#11162b] border border-gray-800 rounded">
                <div class="flex gap-2 items-start">
                    <span class="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--aq-accent-sand)] text-xs text-black font-bold mt-0.5">${l.number}</span>
                    <p class="text-xs text-[var(--aq-text)]">${l.description}</p>
                </div>
            </div>
        `).join('') : '<p class="text-xs text-gray-500 italic">No landmark annotations listed.</p>';

        detailsPanel.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Cluebook Source</h4>
                    <p class="text-xs text-[var(--aq-text-muted)]">${mapData.source_pages}</p>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-[var(--aq-accent-gold)] border-b border-gray-800 pb-2 mb-2">👥 Notable Inhabitants</h4>
                    <div class="space-y-2 max-h-[200px] overflow-y-auto pr-1 scroll-panel">
                        ${inhabitantsHtml}
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-[var(--aq-accent-sand)] border-b border-gray-800 pb-2 mb-2">📍 Key Landmarks</h4>
                    <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 scroll-panel">
                        ${locationsHtml}
                    </div>
                </div>
            </div>
        `;
    }
}

function selectAtlasMap(mapFile) {
    currentAtlasMap = mapFile;
    renderAtlas();
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
window.selectAtlasMap = selectAtlasMap;
window.calculateGamblingGuess = calculateGamblingGuess;
window.resetGamblingBounds = resetGamblingBounds;
window.sendAiMessage = sendAiMessage;
window.clearAiChat = clearAiChat;
window.updateGamblingBounds = updateGamblingBounds;

// Init Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadQuestState();
    initTabs();
    initArtSwitcher();
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
