// Albion Interactive Guide - Data & Logic
// Based on albion-guide.md framework

const DB = {
    characters: [
        {
            name: "Tom Driscoll",
            race: "Human",
            role: "Pilot / Fighter",
            origin: "Toronto (Spaceship)",
            joinLocation: "Start of game",
            canLeave: false,
            stats: {
                strength: { base: 42, max: 70 },
                intelligence: { base: 50, max: 90 },
                dexterity: { base: 40, max: 90 },
                speed: { base: 20, max: 50 },
                stamina: { base: 32, max: 65 },
                magicTalent: { base: 0, max: 0 }
            },
            combatCaps: { close: 70, long: 70, crit: 99 },
            magicSchool: null,
            canUseGuns: true,
            strengths: ["Versatile fighter", "Can use firearms", "Always available"],
            weaknesses: ["No magic ability", "Average stats"],
            notes: "Main protagonist. Permanent party member."
        },
        {
            name: "Rainer Hofstedt",
            race: "Human",
            role: "Xenobiologist",
            origin: "Toronto (Spaceship)",
            joinLocation: "Toronto, beginning",
            canLeave: true,
            leavesAt: "Dji-Cantos (replaced by Harriet)",
            stats: {
                strength: { base: 28, max: 70 },
                intelligence: { base: 76, max: 90 },
                dexterity: { base: 80, max: 90 },
                speed: { base: 11, max: 50 },
                stamina: { base: 35, max: 65 },
                magicTalent: { base: 0, max: 0 }
            },
            combatCaps: { close: 40, long: 40, crit: 99 },
            magicSchool: null,
            canUseGuns: true,
            strengths: ["High dexterity", "Can use pistol"],
            weaknesses: ["Very low combat caps", "Leaves party permanently", "No magic"],
            notes: "Government scientist. Weak combatant. Leaves mid-game."
        },
        {
            name: "Drirr",
            race: "Iskai",
            role: "Stiriik (Hunter/Warrior)",
            origin: "Jirinaar",
            joinLocation: "Jirinaar, after festival murder",
            canLeave: true,
            stats: {
                strength: { base: 30, max: 45 },
                intelligence: { base: 40, max: 90 },
                dexterity: { base: 60, max: 70 },
                speed: { base: 56, max: 99 },
                stamina: { base: 30, max: 50 },
                magicTalent: { base: 0, max: 85 }
            },
            combatCaps: { close: 99, long: 99, crit: 99 },
            magicSchool: null,
            specialAbility: "Tail weapon slot (third hand)",
            strengths: ["Best fighter early game", "99 combat caps", "Tail weapon slot", "High speed", "Night vision"],
            weaknesses: ["Lower max strength", "Cannot use human armor", "No magic"],
            notes: "Iskai warrior with exceptional combat abilities."
        },
        {
            name: "Sira",
            race: "Iskai",
            role: "Dji-Kas Mage",
            origin: "Jirinaar",
            joinLocation: "Jirinaar, after confronting Bradir",
            canLeave: true,
            linkedTo: "Melthas",
            stats: {
                strength: { base: 39, max: 45 },
                intelligence: { base: 55, max: 90 },
                dexterity: { base: 58, max: 70 },
                speed: { base: 59, max: 99 },
                stamina: { base: 35, max: 50 },
                magicTalent: { base: 85, max: 85 }
            },
            combatCaps: { close: 70, long: 70, crit: 99 },
            magicSchool: "Iskai (Dji-Kas)",
            keySpells: ["Frost Avalanche", "Thorn Snare", "Fungification"],
            strengths: ["Powerful crowd control", "Frost/Snare immobilizes enemies", "High speed"],
            weaknesses: ["Light armor only", "Spells require Trifalai Seeds", "Linked to Melthas"],
            notes: "Iskai mage specializing in frost and snare magic. Always leaves with Melthas."
        },
        {
            name: "Melthas",
            race: "Human",
            role: "Druid Mage",
            origin: "Gratogel (Celtic island)",
            joinLocation: "Gratogel, Druid's hut",
            canLeave: true,
            linkedTo: "Sira",
            stats: {
                strength: { base: 39, max: 90 },
                intelligence: { base: 60, max: 80 },
                dexterity: { base: 22, max: 70 },
                speed: { base: 43, max: 50 },
                stamina: { base: 43, max: 90 },
                magicTalent: { base: 80, max: 99 }
            },
            combatCaps: { close: 70, long: 70, crit: 99 },
            magicSchool: "Celtic/Mahinos (Druid)",
            keySpells: ["Demon Exodus", "Banish Demons", "Magic Shield", "Healing"],
            strengths: ["Demon Exodus destroys demon-type monsters", "Good healing", "High stamina cap"],
            weaknesses: ["Gains multi-attack very late", "Only trainable in Jirinaar", "Linked to Sira"],
            notes: "Druid who can communicate through Iskai trii. Demon-banishing specialist."
        },
        {
            name: "Siobhan",
            race: "Human",
            role: "Warrior",
            origin: "Beloveno (Maini)",
            joinLocation: "Beloveno, her house",
            canLeave: true,
            mutuallyExclusiveWith: "Khunag (initial choice)",
            stats: {
                strength: { base: 60, max: 90 },
                intelligence: { base: 45, max: 80 },
                dexterity: { base: 50, max: 70 },
                speed: { base: 45, max: 50 },
                stamina: { base: 50, max: 75 },
                magicTalent: { base: 0, max: 35 }
            },
            combatCaps: { close: 99, long: 99, crit: 99 },
            magicSchool: null,
            specialAbility: "+4 base damage (like Iskai tail)",
            strengths: ["Highest damage potential", "99 combat caps", "Can wield heavy 2H weapons effectively"],
            weaknesses: ["Limited magic potential", "Initially exclusive choice with Khunag"],
            notes: "The most powerful warrior in the game. Natural +4 base damage."
        },
        {
            name: "Khunag",
            race: "Human",
            role: "Kenget Kamulos Mage",
            origin: "Beloveno (Maini)",
            joinLocation: "Beloveno, Kariah's house",
            canLeave: true,
            permanentLeaveCondition: "If asked to leave after Kenget Kamulos chapter",
            mutuallyExclusiveWith: "Siobhan (initial choice)",
            stats: {
                strength: { base: 35, max: 60 },
                intelligence: { base: 60, max: 90 },
                dexterity: { base: 20, max: 40 },
                speed: { base: 20, max: 70 },
                stamina: { base: 30, max: 55 },
                magicTalent: { base: 99, max: 99 }
            },
            combatCaps: { close: 40, long: 40, crit: 99 },
            magicSchool: "Kenget Kamulos",
            keySpells: ["Thunderstorm", "Steal Life", "Steal Magic", "Fire Rain"],
            requiredFor: "Kenget Kamulos chapter (cannot enter without him)",
            strengths: ["Highest magic talent (99)", "Powerful offensive spells", "Steal Magic sustains SP"],
            weaknesses: ["Weak in physical combat", "Leaves permanently if dismissed after his chapter"],
            notes: "Renegade mage seeking revenge on his order. REQUIRED for Kenget Kamulos."
        },
        {
            name: "Harriet",
            race: "Human",
            role: "Dji-Cantos Mage",
            origin: "Dji-Cantos Island",
            joinLocation: "Dji-Cantos, replaces Rainer",
            canLeave: false,
            stats: {
                strength: { base: 35, max: 50 },
                intelligence: { base: 55, max: 99 },
                dexterity: { base: 33, max: 60 },
                speed: { base: 42, max: 50 },
                stamina: { base: 30, max: 55 },
                magicTalent: { base: 75, max: 99 }
            },
            combatCaps: { close: 40, long: 40, crit: 99 },
            magicSchool: "Dji-Cantos (Enlightened Ones)",
            keySpells: ["Goddess's Wrath", "Lifebringer", "Recuperation", "Regeneration"],
            specialAbility: "Teleportation via Goddess's caves",
            strengths: ["Goddess's Wrath destroys all enemies", "Best healing spells", "Required for fast travel"],
            weaknesses: ["Very weak in combat", "High SP consumption", "Cannot leave party"],
            notes: "Required for teleportation between islands."
        },
        {
            name: "Joe Bernard",
            race: "Human",
            role: "Technician",
            origin: "Toronto (Spaceship)",
            joinLocation: "Dji-Cantos, late game (optional)",
            canLeave: true,
            stats: {
                strength: { base: 45, max: 70 },
                intelligence: { base: 50, max: 90 },
                dexterity: { base: 80, max: 90 },
                speed: { base: 40, max: 50 },
                stamina: { base: 60, max: 65 },
                magicTalent: { base: 0, max: 0 }
            },
            combatCaps: { close: 70, long: 70, crit: 99 },
            magicSchool: null,
            canUseGuns: true,
            specialAbility: "Repairs electronics without damage, reduces final dungeon battles",
            requiredFor: "Easier Toronto finale (avoids 106 robot battles)",
            strengths: ["High dexterity", "Can use firearms", "Essential for easy endgame"],
            weaknesses: ["Joins very late", "No magic", "Needs leveling to catch up"],
            notes: "Technician who makes the final Toronto section much easier."
        }
    ],

    chapters: [
        {
            id: "toronto-intro",
            title: "Toronto — The Beginning",
            subtitle: "The Spaceship",
            summary: "Explore the ship, find the hidden pistol, and launch to Albion.",
            keyItems: ["Pistol", "Canisters", "Stimdrinks"],
            keyCode: "1042 (COM room access)",
            tips: [
                "Hide weapon in wall cabinet before passing security",
                "Search Inspector Beegle's room for supplies",
                "Talk to Anne 6 times for free rations"
            ]
        },
        {
            id: "nakiridaani",
            title: "Nakiridaani — Land of the Iskai",
            subtitle: "The Hunter's Clan",
            newMembers: ["Drirr", "Sira"],
            summary: "Explore Iskai city, investigate murder, explore Former's Building for stat bonuses.",
            statBonuses: [
                { stat: "Speed +10", location: "Former's Building - Rainbow bushes" },
                { stat: "Stamina +10", location: "Former's Building - South passage" },
                { stat: "Strength +10", location: "Former's Building - Break south wall" }
            ],
            tips: [
                "Get Blue Healing Potions from Rejira repeatedly for infinite money",
                "Wait for stat bonuses until Sira joins",
                "Train at 2.5G per point - cheapest in game"
            ]
        },
        {
            id: "gratogel",
            title: "Gratogel — Celtic Civilization",
            subtitle: "The Druids",
            newMembers: ["Melthas"],
            summary: "Find amulet for King Tharnos, explore forbidden druid library.",
            keyItems: ["Strength Amulet", "Power Amulet", "Monster Eye", "Dream Shield"],
            tips: [
                "Kill bandits in mountain pass for money",
                "Buy Monster Eye (450G) - essential item",
                "Trade Music Crystal for Crystal Throwing Axe"
            ]
        },
        {
            id: "maini",
            title: "Maini — Iskai & Human Conflict",
            subtitle: "Preventing Assassination",
            newMembers: ["Siobhan OR Khunag"],
            summary: "Prevent Herras's assassination, confront Kontos at the shrine.",
            timedEvent: true,
            questSequence: [
                "Talk to Herras in council",
                "Visit Kariah, ask about 'Yes' and 'Information'",
                "Find Melthas's friend in Kounos",
                "Buy Edjiir's information in Srimalinar",
                "Return to Herras, ask about 'Assassination'",
                "Then find Melthas's friend to trigger event"
            ],
            reward: "Herras's Key (treasury access: 4 Jewels + 521.4G)"
        },
        {
            id: "dji-cantos",
            title: "Dji Cantos — The Secret Society",
            subtitle: "Goddess's Island",
            newMembers: ["Harriet"],
            summary: "Join the Enlightened Ones, find all 8 Goddess's Flowers for permanent stat boosts.",
            goddessFlowers: [
                { stat: "Magic Resistance", location: "Southeast from building, near alcove" },
                { stat: "Luck", location: "Northwest, near large bridge junction" },
                { stat: "Magic Talent", location: "South path, near pavilion by fish" },
                { stat: "Strength", location: "Far south, by waterfall" },
                { stat: "Intelligence", location: "Near strength flowers, by tree" },
                { stat: "Dexterity", location: "East path, between two trees" },
                { stat: "Stamina", location: "South stairs, jutting land piece" },
                { stat: "Speed", location: "Southeast from stamina, near bard" }
            ],
            flowerBonus: "+3 per stat per use, recharges over time"
        },
        {
            id: "umajo",
            title: "Umajo — City of Metalmakers",
            subtitle: "The Desert City",
            summary: "Navigate desert, find path to Toronto, explore prison sidequest.",
            keyItems: ["Porenoil (desert survival)"],
            tips: [
                "Best selling prices in game (130%)",
                "Pay Ohl a Jewel or follow directions to cave entrance"
            ]
        },
        {
            id: "toronto-return",
            title: "Toronto Again — The Bitter Truth",
            subtitle: "Return to the Ship",
            summary: "Discover the truth about DDT's plans, return to Dji-Cantos with evidence.",
            codes: ["1001 (from notebook)", "1712 (service level)", "4312 (reversed Code-Notes)"],
            reward: "1500G + video footage"
        },
        {
            id: "kenget-kamulos",
            title: "Kenget Kamulos — High Knowledge",
            subtitle: "The Mage Order",
            requiredMember: "Khunag",
            summary: "Infiltrate the order, defeat Kamulos, obtain the High Knowledge.",
            boss: { name: "Kamulos", hp: 650, weakness: "Thorn Snare (immune to Frost)", reward: "High Knowledge + 3000 XP" },
            tips: [
                "Surrender triggers endless battles - farm Bolt-Throwers (516.6G each at Umajo)"
            ]
        },
        {
            id: "equipment-makers",
            title: "Equipment Makers — Metal Magic",
            subtitle: "The Secret Society",
            summary: "Learn the secret word 'Umajo Danu', obtain Metalmagic Scroll.",
            secretWord: "Umajo Danu",
            keyItems: ["Metalmagic Scroll", "Stone of Visions", "Serpent Staff"],
            tips: [
                "Blue floor plate summons 16 Animal 3s (5760 XP total)"
            ]
        },
        {
            id: "finale",
            title: "The Seed — Final Chapter",
            subtitle: "Destroying Toronto",
            optionalMember: "Joe (highly recommended)",
            summary: "Plant The Seed in the reactor, end the threat to Albion.",
            finalBoss: {
                name: "AI Housing",
                hp: 4500,
                immunities: ["All weapons", "Frost spells", "Death spells"],
                strategy: "Use Thorn Snare to immobilize. Spells do 1 damage. Let it kill a character to trigger ending.",
                note: "Not meant to be killed - ending triggers when party member falls"
            },
            tips: [
                "With Joe: Repairs circuits, avoids 106 Service Robot battles",
                "Without Joe: Must fight through waves of robots"
            ]
        }
    ],

    equipment: [
        { name: "Gaze of Kamulos", type: "2H Weapon", damage: 26, effect: "Spell charges (6)", location: "Kenget Kamulos", notes: "Best 2H for Siobhan" },
        { name: "Shadowsword", type: "Weapon", damage: 25, effect: "Cursed: -30 LP, -50 Stamina", location: "Treasure Cave (Maini)", notes: "Good for Drirr despite curse" },
        { name: "Danu's Light", type: "Weapon", damage: 14, effect: "+10 LP, +20 Speed, +5 Prot", location: "Shop (Beloveno)", notes: "Lifebringer spell charges" },
        { name: "Iskai Lance", type: "2H Weapon", damage: 18, effect: "-6 CLO (Drirr only)", location: "Shops", notes: "Best Iskai weapon" },
        { name: "Bolt-Rifle", type: "Ranged", damage: 18, effect: "+20 LON, uses Bolts", location: "Umajo shop", notes: "" },
        { name: "Pistol", type: "Ranged", damage: 30, effect: "+60 LON, uses Canisters", location: "Toronto COM room", notes: "Cannot be sold, essential" },
        { name: "Dreamshield", type: "Shield", damage: null, effect: "12 Prot, Sleep Spores (20)", location: "Rifrako's (Aballon)", notes: "Best value shield" },
        { name: "Serpent Staff", type: "Shield", damage: null, effect: "10 Prot, +10 LP, +25 SP", location: "Equipment Makers (Umajo)", notes: "Can equip WITH 2H weapons" },
        { name: "Heavy Chainmail", type: "Armor", damage: null, effect: "11 Prot, -6 CLO, -5 LON", location: "Shops", notes: "Human only" },
        { name: "Lugh's Hand Helmet", type: "Helmet", damage: null, effect: "20 Prot, +35 Luck", location: "Kenget Kamulos", notes: "" },
        { name: "Power Amulet", type: "Accessory", damage: null, effect: "+25 LP, +50 Str", location: "Druid's Library / Kounos", notes: "" },
        { name: "Speed Amulet", type: "Accessory", damage: null, effect: "+30 Speed", location: "Shops", notes: "Essential for Sira" },
        { name: "Thief's Amulet", type: "Accessory", damage: null, effect: "+30 Dex, +30 Lockpick", location: "Kenget Kamulos", notes: "" }
    ],

    bestiary: [
        { name: "Animal 3 (Demon)", type: "Demon", exp: 357, hp: 125, danger: "Critical hit capable", strategy: "Fastest monster in game. Use Frost Avalanche/Thorn Snare/Demon Exodus immediately." },
        { name: "Krondir", type: "Beast", exp: 180, hp: "32-75", drops: "Meat, Trii (9.1G at Rabir)", strategy: "Good early-game farming target." },
        { name: "Service Robot", type: "Machine", exp: 174, hp: "High", danger: "106 battles without Joe", strategy: "Use Goddess's Wrath or critical hits. Bring Joe to avoid most battles." },
        { name: "AI Housing", type: "Final Boss", exp: null, hp: 4500, danger: "Immune to most attacks", strategy: "Use Thorn Snare. Let it defeat a party member to trigger ending. NOT meant to be killed." },
        { name: "Kamulos", type: "Boss", exp: 3000, hp: 650, danger: "Immune to Frost", strategy: "Weak to Thorn Snare. Use physical attacks and non-Frost magic." }
    ],

    magic: [
        {
            school: "Iskai (Dji-Kas)",
            practitioner: "Sira",
            color: "iskai",
            reagent: "Trifalai Seed (1.2G each)",
            freeTraining: "Fasiir in Dji-Kas guild (Jirinaar)",
            specialties: ["Frost/immobilization", "Snares", "Light healing"],
            keySpells: [
                { name: "Frost Avalanche", level: 9, sp: 30, effect: "Freezes all enemies" },
                { name: "Thorn Snare", level: 12, sp: 16, effect: "Immobilizes target completely" },
                { name: "Fungification", level: 15, sp: 24, effect: "Damage, can disintegrate weakened enemies" }
            ]
        },
        {
            school: "Celtic/Mahinos (Druid)",
            practitioner: "Melthas",
            color: "druid",
            reagent: "None",
            freeTraining: "Buy scrolls from Roves in Arjano library",
            specialties: ["Demon banishment", "Buffs", "Healing"],
            keySpells: [
                { name: "Demon Exodus", level: 20, sp: 70, effect: "Destroys ALL demon-type enemies" },
                { name: "Magic Shield", level: 8, sp: 25, effect: "Increases M-R and Protection" },
                { name: "Berserk", level: 7, sp: 12, effect: "Trade 20% LP for combat stat boost" }
            ],
            notes: "Demon types: Animal, Plague, Fear, Storm (1/2/3)"
        },
        {
            school: "Kenget Kamulos",
            practitioner: "Khunag",
            color: "kenget",
            reagent: "None",
            freeTraining: "Pickup scrolls in Kenget Kamulos dungeon",
            specialties: ["Lightning damage", "Life/Magic stealing", "Traps"],
            keySpells: [
                { name: "Thunderstorm", level: null, sp: 35, effect: "Damage all enemies" },
                { name: "Steal Magic", level: null, sp: 15, effect: "Drain SP from enemy - sustain casting" },
                { name: "Steal Life", level: null, sp: 15, effect: "Drain LP from enemy" }
            ]
        },
        {
            school: "Dji-Cantos (Enlightened Ones)",
            practitioner: "Harriet",
            color: "djicantos",
            reagent: "None",
            freeTraining: "Drannagh in Dji-Cantos building",
            specialties: ["Mass healing", "Party recovery", "Ultimate destruction"],
            keySpells: [
                { name: "Goddess's Wrath", level: 22, sp: 160, effect: "Destroys enemies (proficiency = count)" },
                { name: "Lifebringer", level: 13, sp: 60, effect: "Heals entire party" },
                { name: "Recuperation", level: 4, sp: 10, effect: "Rest without sleeping or food" }
            ]
        }
    ],

    locations: [
        {
            name: "Toronto",
            type: "toronto",
            description: "The DDT Corporation spaceship sent to survey 'Nugget' for mining.",
            chapters: ["toronto-intro", "toronto-return", "finale"],
            poi: ["COM Room (Pistol)", "Inspector Beegle's Room", "Reactor Core"]
        },
        {
            name: "Nakiridaani (Iskai Island)",
            type: "nakiridaani",
            description: "Home of the Iskai Hunter Clan. Your first destination on Albion.",
            locations: [
                { name: "Jirinaar", type: "Capital", poi: ["Dji-Kas Guild", "Dji-Fadh Guild", "Rabir (Weapon Smith)", "Battle Trainer"] },
                { name: "Former's Building", type: "Dungeon", poi: ["Speed +10", "Stamina +10", "Strength +10"] }
            ]
        },
        {
            name: "Gratogel (Celtic Island)",
            type: "gratogel",
            description: "Island of the Celtic druids and King Tharnos.",
            locations: [
                { name: "Klouta", type: "Village", poi: ["King Tharnos"] },
                { name: "Vanello", type: "Town", poi: ["Winion (best local prices)", "Tamno"] },
                { name: "Arjano", type: "Druid Complex", poi: ["Library", "Forbidden Area"] },
                { name: "Aballon", type: "Village", poi: ["Rifrako (Monster Eye, Dream Shield)"] }
            ]
        },
        {
            name: "Maini (Human/Iskai Island)",
            type: "maini",
            description: "Large island with both Human and Iskai settlements. Political intrigue.",
            locations: [
                { name: "Beloveno", type: "City", poi: ["Council House", "Siobhan's House", "Khunag's House"] },
                { name: "Kounos", type: "Dungeon Village", poi: ["Melthas's friend"] },
                { name: "Srimalinar", type: "Town", poi: ["Edjiir (information broker)"] },
                { name: "Treasure Cave", type: "Dungeon", poi: ["Shadowsword", "Below Kounos cliffs"] }
            ]
        },
        {
            name: "Dji-Cantos Island",
            type: "djicantos",
            description: "Sacred island of the Goddess. Home of the Enlightened Ones.",
            locations: [
                { name: "Dji-Cantos Building", type: "Headquarters", poi: ["Enlightened Ones HQ", "Harriet"] },
                { name: "Goddess's Flowers", type: "POI", poi: ["8 flowers", "+3 to each stat", "Recharge over time"] }
            ]
        },
        {
            name: "Umajo Desert",
            type: "umajo",
            description: "Harsh desert region. City of the Metalmakers.",
            locations: [
                { name: "Umajo", type: "City", poi: ["Best prices (130%)", "Equipment Makers Guild", "Prison"] },
                { name: "Equipment Makers Cellar", type: "Dungeon", poi: ["Serpent Staff", "Metalmagic Scroll"] }
            ]
        },
        {
            name: "Kenget Kamulos",
            type: "kenget",
            description: "Fortress of the fire mage order. Requires Khunag to enter.",
            locations: [
                { name: "Kenget Kamulos Fortress", type: "Dungeon", poi: ["Gaze of Kamulos", "Lugh's Hand Helmet", "Kamulos Boss"] }
            ]
        }
    ],

    trade: [
        { location: "Rabir (Jirinaar)", sell: "110%", buy: "132%", notes: "Best on Iskai island" },
        { location: "Winion (Vanello)", sell: "125%", buy: "150%", notes: "Best on Gratogel" },
        { location: "Umajo Shops", sell: "130%", buy: "156%", notes: "BEST IN GAME" },
        { location: "Kounos Woman", sell: "38%", buy: "—", notes: "NEVER sell here" },
        { location: "Riolea (Beloveno)", sell: "75%", buy: "100%", notes: "Mediocre" }
    ]
};

// ==================== QUEST LOG DATA ====================

const QUEST_LOG = [
    {
        id: 'toronto-intro',
        title: 'Toronto — The Beginning',
        items: [
            { id: 'hide-weapon', text: 'Hide your weapon in the wall cabinet before security.' },
            { id: 'com-code', text: 'Use code 1042 to access the COM room.' },
            { id: 'pistol', text: 'Get the Pistol from the COM room (cannot be sold; critical later).' },
            { id: 'anne-rations', text: 'Talk to Anne 6 times for free rations.' },
            { id: 'beegle-room', text: "Search Inspector Beegle’s room for supplies." }
        ]
    },
    {
        id: 'nakiridaani',
        title: 'Nakiridaani — Land of the Iskai',
        items: [
            { id: 'recruit-drirr', text: 'Recruit Drirr in Jirinaar.' },
            { id: 'recruit-sira', text: 'Recruit Sira after confronting Bradir.' },
            { id: 'rejira-exploit', text: 'Optional: Rejira exploit — farm Blue Healing Potions for money.' },
            { id: 'formers-stats', text: 'Former’s Building stat bonuses: Speed +10, Stamina +10, Strength +10.' },
            { id: 'train-cheap', text: 'Optional: Train in Jirinaar (2.5G per point; cheapest in the game).' }
        ]
    },
    {
        id: 'gratogel',
        title: 'Gratogel — Celtic Civilization',
        items: [
            { id: 'recruit-melthas', text: 'Recruit Melthas at the Druid’s hut.' },
            { id: 'monster-eye', text: 'Buy the Monster Eye (450G) — essential.' },
            { id: 'dreamshield', text: 'Consider Dreamshield from Aballon (very strong value).' },
            { id: 'bandits', text: 'Optional: Farm bandits in the mountain pass for money.' }
        ]
    },
    {
        id: 'maini',
        title: 'Maini — Preventing Assassination',
        items: [
            { id: 'choose-siobhan-or-khunag', text: 'Choose Siobhan or Khunag (initially mutually exclusive).' },
            { id: 'assassination-sequence', text: 'Complete the assassination prevention sequence (timed event).' },
            { id: 'herras-key', text: 'Get Herras’s Key (treasury access).' }
        ]
    },
    {
        id: 'dji-cantos',
        title: 'Dji-Cantos — The Secret Society',
        items: [
            { id: 'harriet', text: 'Recruit Harriet (replaces Rainer).' },
            { id: 'flowers', text: 'Find all 8 Goddess’s Flowers (permanent +3 stat boosts; recharge over time).' }
        ]
    },
    {
        id: 'umajo',
        title: 'Umajo — City of Metalmakers',
        items: [
            { id: 'umajo-sell', text: 'Use Umajo shops (130% sell — best in the game).' },
            { id: 'porenoil', text: 'Get Porenoil for desert survival.' },
            { id: 'find-path', text: 'Find the path forward (Ohl can guide for a Jewel).' }
        ]
    },
    {
        id: 'toronto-return',
        title: 'Toronto Again — The Bitter Truth',
        items: [
            { id: 'codes', text: 'Use ship codes: 1001, 1712, 4312.' },
            { id: 'evidence', text: 'Collect evidence and return to Dji-Cantos.' }
        ]
    },
    {
        id: 'kenget-kamulos',
        title: 'Kenget Kamulos — High Knowledge',
        items: [
            { id: 'khunag-required', text: 'Bring Khunag (required to enter Kenget Kamulos).' },
            { id: 'defeat-kamulos', text: 'Defeat Kamulos and obtain the High Knowledge.' },
            { id: 'bolt-throwers', text: 'Optional: Surrender-loop to farm Bolt-Throwers for money.' }
        ]
    },
    {
        id: 'equipment-makers',
        title: 'Equipment Makers — Metal Magic',
        items: [
            { id: 'umajo-danu', text: 'Learn the secret word: “Umajo Danu”.' },
            { id: 'metalmagic', text: 'Obtain the Metalmagic Scroll.' },
            { id: 'xp-plate', text: 'Optional: Blue floor plate summons 16 Animal 3s (5760 XP).' }
        ]
    },
    {
        id: 'finale',
        title: 'The Seed — Final Chapter',
        items: [
            { id: 'bring-joe', text: 'Strongly recommended: Bring Joe to avoid most Service Robot battles.' },
            { id: 'plant-seed', text: 'Plant The Seed in the reactor.' },
            { id: 'ai-housing', text: 'AI Housing is not meant to be killed — let it defeat a party member to trigger ending.' }
        ]
    }
];

const QUEST_STORAGE_KEY = 'albion.questLog.v1';

function loadQuestState() {
    try {
        const raw = localStorage.getItem(QUEST_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function saveQuestState(state) {
    localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(state));
}

function setQuestItemDone(groupId, itemId, done) {
    const state = loadQuestState();
    state[groupId] = state[groupId] || {};
    state[groupId][itemId] = !!done;
    saveQuestState(state);
}

function resetQuestLog() {
    localStorage.removeItem(QUEST_STORAGE_KEY);
    renderQuestLog();
}

function computeQuestProgress(state) {
    let total = 0;
    let done = 0;
    QUEST_LOG.forEach(group => {
        group.items.forEach(item => {
            total += 1;
            if (state?.[group.id]?.[item.id]) done += 1;
        });
    });
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

function renderQuestLog() {
    const container = document.getElementById('quest-log');
    const summary = document.getElementById('quest-log-summary');
    if (!container || !summary) return;

    const state = loadQuestState();
    const progress = computeQuestProgress(state);

    summary.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h3 class="text-xl font-bold text-white">Progress</h3>
                <p class="text-sm text-gray-400">Completed <span class="text-gray-200 font-semibold">${progress.done}</span> / ${progress.total} tasks (${progress.percent}%).</p>
            </div>
            <div class="flex items-center gap-3">
                <button class="seer-send-btn" onclick="resetQuestLog()" style="background: linear-gradient(135deg, var(--albion-accent-red), #b91c1c);">
                    Reset
                </button>
            </div>
        </div>
    `;

    container.innerHTML = QUEST_LOG.map((group, groupIndex) => {
        const groupDone = group.items.filter(i => state?.[group.id]?.[i.id]).length;
        const groupTotal = group.items.length;
        const accordionId = `quest-accordion-${groupIndex}`;
        const arrowId = `quest-arrow-${groupIndex}`;

        return `
            <div class="accordion-item">
                <button class="accordion-header" onclick="toggleQuestGroup('${accordionId}', '${arrowId}')">
                    <div>
                        <span class="font-bold text-lg">${group.title}</span>
                        <span class="text-sm text-gray-500 ml-2">${groupDone}/${groupTotal}</span>
                    </div>
                    <span class="accordion-arrow" id="${arrowId}">▼</span>
                </button>
                <div class="accordion-content" id="${accordionId}">
                    <div class="p-4 space-y-2">
                        ${group.items.map(item => {
                            const isDone = !!state?.[group.id]?.[item.id];
                            return `
                                <div class="quest-log-item ${isDone ? 'quest-log-item--done' : ''}">
                                    <input type="checkbox" ${isDone ? 'checked' : ''}
                                        onchange="toggleQuestItem('${group.id}', '${item.id}', this.checked)" />
                                    <div class="quest-log-text text-sm text-gray-200">${item.text}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleQuestGroup(contentId, arrowId) {
    const content = document.getElementById(contentId);
    const arrow = document.getElementById(arrowId);
    if (!content) return;
    content.classList.toggle('open');
    if (arrow) arrow.classList.toggle('open');
}

function toggleQuestItem(groupId, itemId, checked) {
    setQuestItemDone(groupId, itemId, checked);
    renderQuestLog();
}

// Expose for inline handlers
window.resetQuestLog = resetQuestLog;
window.toggleQuestItem = toggleQuestItem;
window.toggleQuestGroup = toggleQuestGroup;

// ==================== ATLAS (LEAFLET IMAGE MAP) ====================

const ATLAS_CONFIG = {
    imageUrl: 'images/albion/albion-nakiridaani-konti-pc-map.webp',
    markers: (window.ALBION_MARKERS_DATA && window.ALBION_MARKERS_DATA.markers) ? window.ALBION_MARKERS_DATA.markers : [],
    xRange: [0, 100],
    yRange: [0, 100]
};

const ATLAS_MARKER_STYLE = {
    city: { color: '#38bdf8', label: 'City' },
    town: { color: '#60a5fa', label: 'Town' },
    dungeon: { color: '#f87171', label: 'Dungeon' },
    site: { color: '#34d399', label: 'Site' },
    quest: { color: '#fbbf24', label: 'Quest / POI' },
    spaceship: { color: '#a78bfa', label: 'Toronto' },
    default: { color: '#94a3b8', label: 'Point of Interest' }
};

let albionAtlasMap = null;
let albionAtlasLegend = null;
let albionAtlasLayers = null;

function resolveAtlasStyle(marker) {
    if (!marker || !marker.type) return ATLAS_MARKER_STYLE.default;
    return ATLAS_MARKER_STYLE[marker.type] || ATLAS_MARKER_STYLE.default;
}

function atlasToLatLng(position, boundsConfig) {
    const { width, height, minX, maxX, minY, maxY } = boundsConfig;
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const xPercent = (position.x - minX) / spanX;
    const yPercent = (position.y - minY) / spanY;
    return { lat: yPercent * height, lng: xPercent * width };
}

function buildAtlasIcon(marker) {
    const style = resolveAtlasStyle(marker);
    const initial = marker.name ? marker.name.charAt(0).toUpperCase() : '?';
    return L.divIcon({
        className: 'albion-atlas-marker',
        html: `
            <span style="
                display:inline-flex;
                align-items:center;
                justify-content:center;
                width:1.75rem;
                height:1.75rem;
                border-radius:9999px;
                background:${style.color};
                color:#0b1220;
                font-size:0.85rem;
                font-weight:800;
                border:2px solid rgba(0,0,0,0.35);
                box-shadow: 0 3px 12px rgba(0,0,0,0.35);
            ">${initial}</span>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -22]
    });
}

function buildAtlasPopup(marker) {
    const style = resolveAtlasStyle(marker);
    const description = marker.description ? `<p class="text-sm leading-snug text-gray-200">${marker.description}</p>` : '';
    return `
        <article class="space-y-1">
            <h4 class="font-semibold text-base text-white">${marker.name || 'Point of interest'}</h4>
            ${description}
            <p class="text-xs text-gray-400">Category: ${style.label}</p>
        </article>
    `;
}

function renderAtlasLegend(map) {
    if (albionAtlasLegend) {
        albionAtlasLegend.remove();
        albionAtlasLegend = null;
    }

    const presentTypes = Array.from(new Set((ATLAS_CONFIG.markers || []).map(m => m?.type).filter(Boolean)));
    const order = ['spaceship', 'city', 'town', 'dungeon', 'site', 'quest'];
    const types = order.filter(t => presentTypes.includes(t)).concat(presentTypes.filter(t => !order.includes(t)));
    const entries = types
        .map(k => ({ key: k, ...(ATLAS_MARKER_STYLE[k] || ATLAS_MARKER_STYLE.default) }))
        .filter(e => e.label);

    albionAtlasLegend = L.control({ position: 'topright' });
    albionAtlasLegend.onAdd = () => {
        const container = L.DomUtil.create('div', 'albion-atlas-legend');
        container.innerHTML = `<div class="albion-atlas-legend__title">Legend</div>`;
        entries.forEach(e => {
            const row = L.DomUtil.create('div', 'albion-atlas-legend__item', container);
            row.innerHTML = `
                <span style="display:inline-block;width:0.85rem;height:0.85rem;border-radius:50%;background:${e.color};border:1px solid rgba(0,0,0,0.35);"></span>
                <span>${e.label}</span>
            `;
        });
        return container;
    };
    albionAtlasLegend.addTo(map);
}

function renderAtlasFilters(map) {
    const el = document.getElementById('atlas-filters');
    if (!el || !albionAtlasLayers) return;

    const presentTypes = Array.from(new Set((ATLAS_CONFIG.markers || []).map(m => m?.type).filter(Boolean)));
    const order = ['city', 'town', 'dungeon', 'site', 'quest', 'spaceship'];
    const types = order.filter(t => presentTypes.includes(t)).concat(presentTypes.filter(t => !order.includes(t)));

    el.innerHTML = types.map(t => {
        const style = ATLAS_MARKER_STYLE[t] || ATLAS_MARKER_STYLE.default;
        return `
            <label class="atlas-filter">
                <input type="checkbox" data-type="${t}" checked>
                <span style="display:inline-block;width:0.7rem;height:0.7rem;border-radius:50%;background:${style.color};border:1px solid rgba(0,0,0,0.35);"></span>
                <span>${style.label}</span>
            </label>
        `;
    }).join('');

    el.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const type = cb.getAttribute('data-type');
            const layer = albionAtlasLayers?.[type];
            if (!layer) return;
            if (cb.checked) layer.addTo(map);
            else map.removeLayer(layer);
        });
    });
}

function ensureAtlasMap() {
    const container = document.getElementById('albion-atlas-map');
    const status = document.getElementById('atlas-status');

    if (!container || typeof L === 'undefined') return;

    if (albionAtlasMap) {
        setTimeout(() => albionAtlasMap.invalidateSize(), 100);
        return;
    }

    // Probe map image so we can create correct bounds.
    const img = new Image();
    img.onload = () => {
        const width = img.naturalWidth || 2048;
        const height = img.naturalHeight || 2048;

        // Leaflet expects an empty container.
        container.innerHTML = '';

        if (status) {
            status.innerHTML = `<span class="text-green-400 font-semibold">Map loaded.</span> Markers are approximations until coordinates are tuned.`;
        }

        const bounds = [[0, 0], [height, width]];

        const map = L.map(container, {
            crs: L.CRS.Simple,
            minZoom: -2,
            maxZoom: 2,
            attributionControl: false
        });

        L.imageOverlay(ATLAS_CONFIG.imageUrl, bounds).addTo(map);
        map.fitBounds(bounds);
        albionAtlasMap = map;

        albionAtlasLayers = {};

        const boundsConfig = {
            width,
            height,
            minX: ATLAS_CONFIG.xRange[0],
            maxX: ATLAS_CONFIG.xRange[1],
            minY: ATLAS_CONFIG.yRange[0],
            maxY: ATLAS_CONFIG.yRange[1]
        };

        (ATLAS_CONFIG.markers || []).forEach(m => {
            if (!m || !m.position) return;
            const type = m.type || 'default';
            if (!albionAtlasLayers[type]) {
                albionAtlasLayers[type] = L.layerGroup().addTo(map);
            }
            const ll = atlasToLatLng(m.position, boundsConfig);
            const marker = L.marker([ll.lat, ll.lng], { title: m.name, icon: buildAtlasIcon(m) }).addTo(albionAtlasLayers[type]);
            marker.bindPopup(buildAtlasPopup(m));
        });

        map.on('click', (e) => {
            const x = (e.latlng.lng / width) * (boundsConfig.maxX - boundsConfig.minX) + boundsConfig.minX;
            const y = (e.latlng.lat / height) * (boundsConfig.maxY - boundsConfig.minY) + boundsConfig.minY;
            if (status) {
                status.innerHTML = `<span class="text-green-400 font-semibold">Map loaded.</span> Clicked: <span class="font-mono text-gray-200">x=${x.toFixed(1)}, y=${y.toFixed(1)}</span>`;
            }
        });

        renderAtlasLegend(map);
        renderAtlasFilters(map);
    };

    img.onerror = () => {
        if (status) {
            status.innerHTML = `<span class="text-yellow-400 font-semibold">Map missing.</span> Expected <span class="font-mono text-gray-200">guides/images/albion/albion-nakiridaani-konti-pc-map.webp</span>.`;
        }
        container.innerHTML = `
            <div class="albion-atlas-missing">
                <div>
                    <div class="text-lg mb-2"><strong>Albion region map not found.</strong></div>
                    <div class="text-sm text-gray-400">Expected file: <span class="font-mono">guides/images/albion/albion-nakiridaani-konti-pc-map.webp</span></div>
                </div>
            </div>
        `;
    };

    img.src = ATLAS_CONFIG.imageUrl;
}

window.ensureAtlasMap = ensureAtlasMap;

// ==================== RENDER FUNCTIONS ====================

const CREW_PORTRAITS = {
    'Tom Driscoll': 'images/albion/portraits/tom.png',
    'Rainer Hofstedt': 'images/albion/portraits/rainer.png',
    'Drirr': 'images/albion/portraits/drirr.png',
    'Sira': 'images/albion/portraits/sira.png',
    'Melthas': 'images/albion/portraits/melthas.png',
    'Siobhan': 'images/albion/portraits/siobhan.png',
    'Khunag': 'images/albion/portraits/khunag.png',
    'Joe Bernard': 'images/albion/portraits/joe.png'
};

function getCrewPortraitSrc(character) {
    if (!character || !character.name) return null;
    return CREW_PORTRAITS[character.name] || null;
}

function renderCharacters() {
    const grid = document.getElementById('character-grid');
    if (!grid) return;

    grid.innerHTML = DB.characters.map((c, i) => `
        <div class="character-card ${c.race.toLowerCase()}" onclick="selectCharacter(${i})" data-index="${i}">
            <div class="character-card-row">
                <div class="character-card-portrait">
                    ${getCrewPortraitSrc(c)
                        ? `<img src="${getCrewPortraitSrc(c)}" alt="${c.name} portrait" loading="lazy">`
                        : `<div class="character-card-portrait-fallback" aria-hidden="true"></div>`}
                </div>
                <div class="min-w-0">
                    <h4 class="font-bold text-sm mb-1 truncate" style="color: ${c.race === 'Iskai' ? 'var(--race-iskai)' : 'var(--albion-text)'}">${c.name}</h4>
                    <p class="text-xs text-gray-500 truncate">${c.role}</p>
                </div>
            </div>
            ${c.magicSchool ? `<span class="magic-tag ${getMagicClass(c.magicSchool)} mt-2">${c.magicSchool.split(' ')[0]}</span>` : ''}
        </div>
    `).join('');

    selectCharacter(0);
}

function getMagicClass(school) {
    if (school.includes('Iskai') || school.includes('Dji-Kas')) return 'iskai';
    if (school.includes('Druid') || school.includes('Celtic')) return 'druid';
    if (school.includes('Kenget')) return 'kenget';
    if (school.includes('Dji-Cantos') || school.includes('Enlightened')) return 'djicantos';
    return '';
}

function selectCharacter(index) {
    const char = DB.characters[index];
    const cards = document.querySelectorAll('.character-card');
    cards.forEach((c, i) => c.classList.toggle('selected', i === index));

    const details = document.getElementById('character-details');
    const maxStat = 99;

    details.innerHTML = `
        <div class="flex flex-col gap-6">
            <div class="flex justify-between items-start">
                <div>
                    ${getCrewPortraitSrc(char)
                        ? `<img class="character-detail-portrait" src="${getCrewPortraitSrc(char)}" alt="${char.name} portrait" loading="lazy">`
                        : ''}
                    <h3 class="text-3xl font-bold mb-1" style="color: ${char.race === 'Iskai' ? 'var(--race-iskai)' : 'var(--albion-accent-blue)'}">${char.name}</h3>
                    <p class="text-lg text-gray-400">${char.race} • ${char.role}</p>
                    ${char.magicSchool ? `<span class="magic-tag ${getMagicClass(char.magicSchool)} mt-2">${char.magicSchool}</span>` : ''}
                </div>
                <div class="text-right text-sm text-gray-500">
                    <p>Joins: ${char.joinLocation}</p>
                    ${char.canLeave === false ? '<p class="text-green-400">Permanent</p>' : ''}
                    ${char.leavesAt ? `<p class="text-yellow-400">Leaves: ${char.leavesAt}</p>` : ''}
                </div>
            </div>

            <p class="text-gray-300">${char.notes}</p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                ${renderStatBar('Strength', char.stats.strength, maxStat, 'strength')}
                ${renderStatBar('Intelligence', char.stats.intelligence, maxStat, 'intelligence')}
                ${renderStatBar('Dexterity', char.stats.dexterity, maxStat, 'dexterity')}
                ${renderStatBar('Speed', char.stats.speed, maxStat, 'speed')}
                ${renderStatBar('Stamina', char.stats.stamina, maxStat, 'stamina')}
                ${renderStatBar('Magic Talent', char.stats.magicTalent, maxStat, 'magic')}
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div class="p-4 rounded-lg bg-black/20">
                    <h4 class="font-bold text-green-400 mb-2">✓ Strengths</h4>
                    <ul class="text-sm text-gray-300 space-y-1">
                        ${char.strengths.map(s => `<li>• ${s}</li>`).join('')}
                    </ul>
                </div>
                <div class="p-4 rounded-lg bg-black/20">
                    <h4 class="font-bold text-red-400 mb-2">✗ Weaknesses</h4>
                    <ul class="text-sm text-gray-300 space-y-1">
                        ${char.weaknesses.map(w => `<li>• ${w}</li>`).join('')}
                    </ul>
                </div>
            </div>

            ${char.keySpells ? `
            <div class="p-4 rounded-lg bg-black/20">
                <h4 class="font-bold text-purple-400 mb-2">Key Spells</h4>
                <p class="text-sm text-gray-300">${char.keySpells.join(', ')}</p>
            </div>` : ''}

            ${char.specialAbility ? `
            <div class="tip-box">
                <div class="tip-box-title">Special Ability</div>
                <p class="text-sm text-gray-300">${char.specialAbility}</p>
            </div>` : ''}

            ${char.requiredFor ? `
            <div class="warning-box">
                <p class="text-sm"><strong class="text-red-400">⚠️ Required:</strong> ${char.requiredFor}</p>
            </div>` : ''}
        </div>
    `;
}

function renderStatBar(label, stat, max, type) {
    const basePercent = (stat.base / max) * 100;
    const maxPercent = (stat.max / max) * 100;
    return `
        <div>
            <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-400">${label}</span>
                <span class="text-gray-300">${stat.base} → ${stat.max}</span>
            </div>
            <div class="stat-bar-container relative">
                <div class="stat-bar ${type}" style="width: ${maxPercent}%; opacity: 0.3;"></div>
                <div class="stat-bar ${type} absolute top-0 left-0" style="width: ${basePercent}%;"></div>
            </div>
        </div>
    `;
}

const WALKTHROUGH_SCREEN_STORAGE_KEY = 'albion.walkthroughScreens.v1';

const WALKTHROUGH_SCREENS = [
    { id: 'ui-dialogue-window', src: 'images/albion/screens/ui-dialogue-window.png', label: 'Dialogue window' },
    { id: 'ui-dialogue-council', src: 'images/albion/screens/ui-dialogue-council.png', label: 'Council dialogue' },
    { id: 'ui-dialogue-king-tharnos', src: 'images/albion/screens/ui-dialogue-king-tharnos.png', label: 'King Tharnos dialogue' },
    { id: 'gameplay-topdown-interior', src: 'images/albion/screens/gameplay-topdown-interior.png', label: 'Top-down interior' },
    { id: 'gameplay-topdown-fields', src: 'images/albion/screens/gameplay-topdown-fields.png', label: 'Top-down fields' },
    { id: 'gameplay-topdown-forest-bridge', src: 'images/albion/screens/gameplay-topdown-forest-bridge.png', label: 'Forest bridge' },
    { id: 'combat-tactical-grid', src: 'images/albion/screens/combat-tactical-grid.png', label: 'Tactical combat grid' },
    { id: 'cutscene-seaside-city', src: 'images/albion/screens/cutscene-seaside-city.png', label: 'Seaside city cutscene' },
    { id: 'cutscene-coastline-huts', src: 'images/albion/screens/cutscene-coastline-huts.png', label: 'Coastline huts cutscene' },
    { id: 'dungeon-3d-organic-hall', src: 'images/albion/screens/dungeon-3d-organic-hall.png', label: '3D dungeon hall' },
    { id: 'dungeon-3d-forcefield-collapse', src: 'images/albion/screens/dungeon-3d-forcefield-collapse.png', label: 'Forcefield collapse' },
    { id: 'dungeon-3d-rainbow-bush', src: 'images/albion/screens/dungeon-3d-rainbow-bush.png', label: 'Rainbow bush' }
];

const WALKTHROUGH_SCREENS_BY_ID = WALKTHROUGH_SCREENS.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
}, {});

function loadWalkthroughScreenState() {
    try {
        const raw = localStorage.getItem(WALKTHROUGH_SCREEN_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch {
        return {};
    }
}

function saveWalkthroughScreenState(state) {
    try {
        localStorage.setItem(WALKTHROUGH_SCREEN_STORAGE_KEY, JSON.stringify(state || {}));
    } catch {
        // ignore
    }
}

function getAttachedScreensForChapter(chapterId) {
    const state = loadWalkthroughScreenState();
    const list = state[chapterId];
    return Array.isArray(list) ? list : [];
}

function renderChapterScreens(chapterId) {
    const container = document.getElementById(`chapter-screens-${chapterId}`);
    if (!container) return;

    const attached = getAttachedScreensForChapter(chapterId)
        .map(id => WALKTHROUGH_SCREENS_BY_ID[id])
        .filter(Boolean);

    if (attached.length === 0) {
        container.innerHTML = `<div class="walkthrough-screens-empty">No screens attached yet.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="walkthrough-screens-grid">
            ${attached.map(s => `
                <div class="walkthrough-screen">
                    <a href="${s.src}" target="_blank" rel="noopener">
                        <img src="${s.src}" alt="${s.label}" loading="lazy">
                    </a>
                    <div class="walkthrough-screen-meta">
                        <span class="walkthrough-screen-label">${s.label}</span>
                        <button type="button" class="walkthrough-screen-remove" onclick="detachWalkthroughScreen('${chapterId}', '${s.id}')">Remove</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function attachWalkthroughScreen(chapterId) {
    const select = document.getElementById(`chapter-screen-select-${chapterId}`);
    if (!select) return;
    const screenId = select.value;
    if (!screenId) return;

    const state = loadWalkthroughScreenState();
    const existing = Array.isArray(state[chapterId]) ? state[chapterId] : [];
    if (!existing.includes(screenId)) {
        state[chapterId] = [...existing, screenId];
        saveWalkthroughScreenState(state);
    }
    renderChapterScreens(chapterId);
}

function detachWalkthroughScreen(chapterId, screenId) {
    const state = loadWalkthroughScreenState();
    const existing = Array.isArray(state[chapterId]) ? state[chapterId] : [];
    state[chapterId] = existing.filter(id => id !== screenId);
    saveWalkthroughScreenState(state);
    renderChapterScreens(chapterId);
}

function renderChapters() {
    const container = document.getElementById('chapter-list');
    if (!container) return;

    container.innerHTML = DB.chapters.map((chap, i) => `
        <div class="accordion-item">
            <button class="accordion-header" onclick="toggleAccordion(${i})">
                <div>
                    <span class="font-bold text-lg">${chap.title}</span>
                    <span class="text-sm text-gray-500 ml-2">${chap.subtitle}</span>
                </div>
                <span class="accordion-arrow" id="arrow-${i}">▼</span>
            </button>
            <div class="accordion-content" id="accordion-${i}">
                <div class="p-5 space-y-4">
                    <p class="text-gray-300 italic">${chap.summary}</p>
                    
                    ${chap.newMembers ? `<p class="text-sm"><strong class="text-purple-400">New Party Members:</strong> ${chap.newMembers.join(', ')}</p>` : ''}
                    ${chap.requiredMember ? `<p class="text-sm text-yellow-400">⚠️ Requires: ${chap.requiredMember}</p>` : ''}
                    
                    ${chap.tips && chap.tips.length > 0 ? `
                    <div class="tip-box">
                        <div class="tip-box-title">💡 Tips</div>
                        <ul class="text-sm text-gray-300 space-y-1">
                            ${chap.tips.map(t => `<li>• ${t}</li>`).join('')}
                        </ul>
                    </div>` : ''}
                    
                    ${chap.keyCode ? `<p class="text-sm"><strong class="text-blue-400">Code:</strong> ${chap.keyCode}</p>` : ''}
                    ${chap.codes ? `<p class="text-sm"><strong class="text-blue-400">Codes:</strong> ${chap.codes.join(', ')}</p>` : ''}
                    ${chap.secretWord ? `<p class="text-sm"><strong class="text-purple-400">Secret Word:</strong> "${chap.secretWord}"</p>` : ''}
                    ${chap.reward ? `<p class="text-sm"><strong class="text-green-400">Reward:</strong> ${chap.reward}</p>` : ''}
                    
                    ${chap.boss ? `
                    <div class="warning-box">
                        <p class="text-sm"><strong class="text-red-400">Boss: ${chap.boss.name}</strong> (${chap.boss.hp} HP)</p>
                        <p class="text-xs text-gray-400 mt-1">${chap.boss.weakness}</p>
                    </div>` : ''}
                    
                    ${chap.finalBoss ? `
                    <div class="warning-box">
                        <p class="text-sm"><strong class="text-red-400">Final Boss: ${chap.finalBoss.name}</strong> (${chap.finalBoss.hp} HP)</p>
                        <p class="text-xs text-gray-400 mt-1">${chap.finalBoss.strategy}</p>
                        <p class="text-xs text-yellow-400 mt-1">${chap.finalBoss.note}</p>
                    </div>` : ''}
                    
                    ${chap.goddessFlowers ? `
                    <div class="p-4 rounded-lg bg-black/20">
                        <h5 class="font-bold text-yellow-400 mb-2">🌸 Goddess's Flowers (${chap.flowerBonus})</h5>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            ${chap.goddessFlowers.map(f => `<div><strong class="text-gray-300">${f.stat}:</strong> <span class="text-gray-500">${f.location}</span></div>`).join('')}
                        </div>
                    </div>` : ''}

                    <div class="walkthrough-screens">
                        <div class="walkthrough-screens-header">
                            <div class="walkthrough-screens-title">Screens</div>
                            <div class="walkthrough-screens-controls">
                                <select id="chapter-screen-select-${chap.id}" class="walkthrough-screens-select">
                                    <option value="">Attach a screen…</option>
                                    ${WALKTHROUGH_SCREENS.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
                                </select>
                                <button type="button" class="walkthrough-screens-attach" onclick="attachWalkthroughScreen('${chap.id}')">Attach</button>
                            </div>
                        </div>
                        <div id="chapter-screens-${chap.id}"></div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    DB.chapters.forEach(ch => {
        if (ch && ch.id) renderChapterScreens(ch.id);
    });
}

function toggleAccordion(index) {
    const content = document.getElementById(`accordion-${index}`);
    const arrow = document.getElementById(`arrow-${index}`);
    if (!content) return;

    const willOpen = !content.classList.contains('open');

    content.classList.toggle('open');
    arrow.classList.toggle('open');

    if (willOpen) {
        const chapId = DB.chapters?.[index]?.id;
        if (chapId) setWalkthroughAiActiveChapter(chapId);
    }
}

function renderEquipment() {
    const tbody = document.getElementById('equipment-table');
    if (!tbody) return;

    tbody.innerHTML = DB.equipment.map(item => `
        <tr>
            <td class="font-semibold" style="color: var(--albion-accent-blue)">${item.name}</td>
            <td class="text-gray-400">${item.type}</td>
            <td class="text-sm">${item.damage ? `${item.damage} Dmg` : ''} ${item.effect}</td>
            <td class="text-gray-500 text-sm">${item.location}</td>
        </tr>
    `).join('');
}

function renderBestiary() {
    const grid = document.getElementById('bestiary-grid');
    if (!grid) return;

    grid.innerHTML = DB.bestiary.map(beast => `
        <div class="p-4 rounded-lg bg-black/20 border border-gray-700/50">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold" style="color: var(--albion-accent-red)">${beast.name}</h4>
                <span class="text-xs text-gray-500">${beast.type}</span>
            </div>
            ${beast.hp ? `<p class="text-xs text-gray-400 mb-2">HP: ${beast.hp} ${beast.exp ? `• EXP: ${beast.exp}` : ''}</p>` : ''}
            ${beast.danger ? `<p class="text-xs text-yellow-400 mb-2">⚠️ ${beast.danger}</p>` : ''}
            <p class="text-sm text-gray-300">${beast.strategy}</p>
        </div>
    `).join('');
}

function renderMagic() {
    const container = document.getElementById('magic-schools');
    if (!container) return;

    container.innerHTML = DB.magic.map(school => `
        <div class="magic-school-card ${school.color}">
            <h3 class="text-xl font-bold mb-1" style="color: var(--magic-${school.color})">${school.school}</h3>
            <p class="text-sm text-gray-400 mb-4">Practitioner: <strong class="text-white">${school.practitioner}</strong></p>
            
            <div class="mb-4">
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Specialties</p>
                <p class="text-sm text-gray-300">${school.specialties.join(' • ')}</p>
            </div>
            
            <div class="mb-4">
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Key Spells</p>
                <div class="space-y-2">
                    ${school.keySpells.map(s => `
                        <div class="flex justify-between text-sm">
                            <span class="text-white">${s.name}</span>
                            <span class="text-gray-500">${s.sp} SP</span>
                        </div>
                        <p class="text-xs text-gray-400 -mt-1">${s.effect}</p>
                    `).join('')}
                </div>
            </div>
            
            <div class="text-xs text-gray-500 pt-3 border-t border-gray-700/50">
                <p><strong>Reagent:</strong> ${school.reagent}</p>
                <p><strong>Free Training:</strong> ${school.freeTraining}</p>
            </div>
            
            ${school.notes ? `<p class="text-xs text-yellow-400 mt-2">Note: ${school.notes}</p>` : ''}
        </div>
    `).join('');
}

function renderLocations() {
    const grid = document.getElementById('locations-grid');
    if (!grid) return;

    grid.innerHTML = DB.locations.map(loc => `
        <div class="location-card ${loc.type}">
            <h3 class="text-lg font-bold mb-2 text-white">${loc.name}</h3>
            <p class="text-sm text-gray-400 mb-4">${loc.description}</p>
            
            ${loc.locations ? `
            <div class="space-y-3">
                ${loc.locations.map(sub => `
                    <div class="p-3 rounded bg-black/20">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-semibold text-sm text-gray-200">${sub.name}</span>
                            <span class="text-xs text-gray-500">${sub.type}</span>
                        </div>
                        <p class="text-xs text-gray-500">${sub.poi.join(' • ')}</p>
                    </div>
                `).join('')}
            </div>` : ''}
            
            ${loc.poi ? `
            <div class="text-xs text-gray-500 mt-3">
                <strong>Key Locations:</strong> ${loc.poi.join(' • ')}
            </div>` : ''}
        </div>
    `).join('');
}

function renderTrade() {
    const tbody = document.getElementById('trade-table');
    if (!tbody) return;

    tbody.innerHTML = DB.trade.map(t => `
        <tr>
            <td class="font-medium text-white">${t.location}</td>
            <td class="text-green-400 font-mono">${t.sell}</td>
            <td class="text-red-400 font-mono">${t.buy}</td>
            <td class="text-sm ${t.notes.includes('BEST') ? 'text-yellow-400 font-bold' : t.notes.includes('NEVER') ? 'text-red-400' : 'text-gray-500'}">${t.notes}</td>
        </tr>
    `).join('');
}

// ==================== NAVIGATION ====================

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.dataset.target;
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target)?.classList.add('active');

            if (target === 'atlas') {
                ensureAtlasMap();
            }

            if (target === 'quests') {
                renderQuestLog();
            }

            if (target === 'missions') {
                setTimeout(() => {
                    document.getElementById('walkthrough-ai-input')?.focus();
                }, 50);
            }
        });
    });

    // Render all sections
    renderCharacters();
    renderChapters();
    renderQuestLog();
    renderEquipment();
    renderBestiary();
    renderMagic();
    renderLocations();
    renderTrade();
});

// ==================== WALKTHROUGH AI (Claude Integration) ====================

let walkthroughAiActiveChapterId = null;
let walkthroughAiHistory = [];

function resetWalkthroughAi() {
    const body = document.getElementById('walkthrough-ai-body');
    const input = document.getElementById('walkthrough-ai-input');
    if (body) {
        body.innerHTML = `<p class="text-gray-400 italic text-center py-8">AI terminal online. Ask about your current chapter.</p>`;
    }
    if (input) input.value = '';
    walkthroughAiHistory = [];
}

function setWalkthroughAiActiveChapter(chapterId) {
    walkthroughAiActiveChapterId = chapterId || null;
}

function appendWalkthroughAiMessage(role, content) {
    const body = document.getElementById('walkthrough-ai-body');
    if (!body) return;

    const wrap = document.createElement('div');
    wrap.className = `walkthrough-ai-msg ${role}`;
    wrap.innerHTML = `<div class="walkthrough-ai-msg-inner"></div>`;
    wrap.querySelector('.walkthrough-ai-msg-inner').textContent = content;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
}

function getWalkthroughAiChapterContext() {
    if (!walkthroughAiActiveChapterId) return null;
    const chapter = (DB.chapters || []).find(c => c && c.id === walkthroughAiActiveChapterId);
    if (!chapter) return null;

    const tips = Array.isArray(chapter.tips) ? chapter.tips.slice(0, 8) : [];
    return {
        id: chapter.id,
        title: chapter.title,
        subtitle: chapter.subtitle,
        summary: chapter.summary,
        tips
    };
}

async function walkthroughAiSend() {
    const input = document.getElementById('walkthrough-ai-input');
    const sendBtn = document.getElementById('walkthrough-ai-send');
    const query = input?.value?.trim();
    if (!query) return;

    input.value = '';
    appendWalkthroughAiMessage('user', query);
    walkthroughAiHistory.push({ role: 'user', content: query });

    if (sendBtn) sendBtn.disabled = true;

    const ctx = getWalkthroughAiChapterContext();
    const ctxText = ctx
        ? `CURRENT CHAPTER: ${ctx.title} — ${ctx.subtitle}\nSummary: ${ctx.summary}\nTips: ${ctx.tips.join(' | ')}`
        : `CURRENT CHAPTER: (none selected). The user may be browsing multiple chapters.`;

    try {
        if (!window.CLAUDE_API_KEY) {
            const local = getLocalShipAiResponse(query, ctx);
            appendWalkthroughAiMessage('ai', local);
            walkthroughAiHistory.push({ role: 'assistant', content: local });
            return;
        }

        const recent = walkthroughAiHistory
            .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .slice(-10)
            .map(m => ({ role: m.role, content: m.content }));

        const systemWithContext = `You are the Toronto spaceship's onboard AI assisting the crew during Albion (1995).

GOAL:
- Give practical walkthrough guidance: next steps, item locations, party advice, and combat tactics.
- If the user asks for spoilers, answer directly but keep it short.

GAME FACTS:
- Albion is a 1995 RPG by Blue Byte with 2D/3D hybrid gameplay.
- Turn-based tactical combat with row positioning.
- Four magic schools: Iskai (Dji-Kas), Druid/Celtic, Kenget Kamulos, Dji-Cantos.
- Party size up to 6 from 9 characters.

STYLE:
- Not mystical. Not prophetic. Sound like a ship terminal / mission computer.
- Use short, numbered steps when giving directions.
- If you need more context, ask 1 clarifying question.

${ctxText}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': window.CLAUDE_API_KEY || '',
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 900,
                system: systemWithContext,
                messages: recent
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text || 'No response received.';
        appendWalkthroughAiMessage('ai', text);
        walkthroughAiHistory.push({ role: 'assistant', content: text });
    } catch (error) {
        console.error('Walkthrough AI error:', error);
        const local = getLocalShipAiResponse(query, ctx);
        appendWalkthroughAiMessage('ai', `${local}\n\n(Offline response — set window.CLAUDE_API_KEY for AI-powered answers)`);
        walkthroughAiHistory.push({ role: 'assistant', content: local });
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}

function getLocalShipAiResponse(query, chapterCtx) {
    const q = String(query || '').toLowerCase();

    if (q.includes('gold') || q.includes('money')) {
        return `Market route: In Jirinaar, talk to Rejira repeatedly for Blue Healing Potions, then sell to Rabir. Later, Umajo pays 130% sell price — hold valuables until then.`;
    }

    if (q.includes('party') || q.includes('team') || q.includes('composition')) {
        return `Recommended squad (general): Tom + Drirr + Sira + Melthas + Siobhan + Harriet. Warning: Khunag is required to enter Kenget Kamulos.`;
    }

    if (q.includes('khunag') || q.includes('siobhan')) {
        return `Beloveno choice: Siobhan = best physical damage. Khunag = mandatory for Kenget Kamulos access and strong spell damage. If you want full map coverage, prioritize Khunag, then recruit Siobhan later.`;
    }

    if (q.includes('ai housing') || q.includes('final') || q.includes('ending')) {
        return `Finale note: AI Housing has 4500 HP and is not intended to be killed normally. Use control (e.g., Thorn Snare) and expect the ending trigger when a party member is defeated. Bring Joe Bernard to avoid 106 robot battles.`;
    }

    if (chapterCtx && (q.includes('next') || q.includes('what now') || q.includes('where') || q.includes('do i'))) {
        const tips = (chapterCtx.tips || []).slice(0, 4);
        return `Chapter guidance for ${chapterCtx.title}:\n1) Follow the chapter objective in the summary.\n2) Apply these quick tips: ${tips.join(' | ') || 'No tips recorded.'}`;
    }

    return `Specify what you need: next objective, item location, party build, or combat tactics. If you tell me your current chapter (or open it), I can be precise.`;
}

window.walkthroughAiSend = walkthroughAiSend;
window.resetWalkthroughAi = resetWalkthroughAi;
