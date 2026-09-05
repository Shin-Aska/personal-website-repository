// Data for companions, spells, and words
const companionData = [
    { Name: "Iolo", Class: "Bard", Level: 3, STR: 19, INT: 17, DEX: 21, Location: "Start", Notes: "A solid starting companion and a capable fighter/bard. His presence is mandatory at the start." },
    { Name: "Shamino", Class: "Fighter", Level: 2, STR: 20, INT: 16, DEX: 22, Location: "Start", Notes: "Starts wounded but recovers to be a reliable fighter. His high Dexterity makes him an excellent archer." },
    { Name: "Jaana", Class: "Mage", Level: 2, STR: 15, INT: 21, DEX: 17, Location: "Yew", Notes: "An essential early recruit. As a mage, her spellcasting ability is invaluable throughout the game." },
    { Name: "Mariah", Class: "Mage", Level: 3, STR: 12, INT: 22, DEX: 20, Location: "The Lycaeum", Notes: "One of the most powerful mages available. Recruiting her requires reaching the Lycaeum, which can be a mid-game objective." },
    { Name: "Johne", Class: "Mage", Level: 3, STR: 14, INT: 24, DEX: 20, Location: "Ararat (Underworld)", Notes: "The strongest mage in the game, but he is difficult to reach, located on a wrecked ship in the Underworld." },
    { Name: "Gwenno", Class: "Bard", Level: 3, STR: 17, INT: 17, DEX: 22, Location: "Britain", Notes: "A well-rounded bard, Iolo's wife. A good addition to the party if another bard is needed." },
    { Name: "Julia", Class: "Bard", Level: 2, STR: 21, INT: 18, DEX: 19, Location: "Empath Abbey", Notes: "A capable bard with good strength, found relatively early in the game." },
    { Name: "Toshi", Class: "Bard", Level: 1, STR: 17, INT: 16, DEX: 21, Location: "Empath Abbey", Notes: "Starts at a low level, making him less useful than other available bards." },
    { Name: "Saduj", Class: "Bard", Level: 4, STR: 21, INT: 20, DEX: 26, Location: "Lord British's Castle", Notes: "Do not recruit. He is a spy for Blackthorn and will betray the party. His name is 'Judas' backwards." },
    { Name: "Geoffrey", Class: "Fighter", Level: 3, STR: 24, INT: 16, DEX: 21, Location: "Buccaneer's Den", Notes: "An excellent fighter with high Strength. A top-tier combatant for the front lines." },
    { Name: "Dupre", Class: "Fighter", Level: 3, STR: 22, INT: 16, DEX: 18, Location: "Bordermarch", Notes: "A classic companion from previous games and a solid, dependable fighter." },
    { Name: "Katrina", Class: "Fighter", Level: 5, STR: 22, INT: 18, DEX: 21, Location: "New Magincia", Notes: "Starts at a high level, making her a powerful immediate addition to the party if found later in the game." },
    { Name: "Sentri", Class: "Fighter", Level: 2, STR: 23, INT: 19, DEX: 20, Location: "Bordermarch", Notes: "A strong fighter available in the same location as Dupre." },
    { Name: "Gorn", Class: "Fighter", Level: 2, STR: 21, INT: 15, DEX: 19, Location: "Blackthorn's Castle", Notes: "A powerful fighter, but recruiting him requires infiltrating Blackthorn's fortress." },
    { Name: "Maxwell", Class: "Fighter", Level: 1, STR: 21, INT: 14, DEX: 19, Location: "Serpent's Hold", Notes: "Starts at level 1, requiring significant investment to become effective." }
];

const spellData = [
    { Name: "`An Nox`", Circle: 1, Effect: "Cures poison", Reagents: "Ginseng, Garlic" },
    { Name: "`Mani`", Circle: 1, Effect: "Heals minor damage", Reagents: "Ginseng, Spider Silk" },
    { Name: "`Grav Por`", Circle: 1, Effect: "Minor energy bolt", Reagents: "Sulfurous Ash, Black Pearl" },
    { Name: "`In Lor`", Circle: 1, Effect: "Creates light", Reagents: "Sulfurous Ash" },
    { Name: "`In Wis`", Circle: 2, Effect: "Reveals party's coordinates", Reagents: "Nightshade" },
    { Name: "`An Sanct`", Circle: 2, Effect: "Unlocks doors (like a key)", Reagents: "Sulfurous Ash, Blood Moss" },
    { Name: "`In Por`", Circle: 3, Effect: "Short-range teleport (Blink)", Reagents: "Spider Silk, Blood Moss" },
    { Name: "`Vas Lor`", Circle: 3, Effect: "Creates a powerful, long-lasting light", Reagents: "Sulfurous Ash, Mandrake Root" },
    { Name: "`An Grav`", Circle: 4, Effect: "Dispels magical fields", Reagents: "Sulfurous Ash, Black Pearl" },
    { Name: "`Des Por` / `Uus Por`", Circle: 4, Effect: "Descend/Ascend one dungeon level", Reagents: "Spider Silk, Blood Moss" },
    { Name: "`In Zu`", Circle: 5, Effect: "Puts enemies to sleep", Reagents: "Ginseng, Spider Silk, Nightshade" },
    { Name: "`Vas Mani`", Circle: 5, Effect: "Heals a large amount of damage", Reagents: "Ginseng, Spider Silk, Mandrake Root" },
    { Name: "`In An`", Circle: 6, Effect: "Negates enemy magic", Reagents: "Sulfurous Ash, Garlic, Mandrake Root" },
    { Name: "`Sanct Lor`", Circle: 7, Effect: "Renders the party invisible", Reagents: "Blood Moss, Mandrake Root, Nightshade" },
    { Name: "`Vas Rel Por`", Circle: 8, Effect: "Gate Travel (teleport to moongates)", Reagents: "Sulfurous Ash, Black Pearl, Mandrake Root" },
    { Name: "`An Tym`", Circle: 8, Effect: "Stops time in combat", Reagents: "Garlic, Blood Moss, Mandrake Root" },
    { Name: "`In Mani Corp`", Circle: 8, Effect: "Resurrects a dead companion", Reagents: "Ash, Garlic, Ginseng, Silk, Moss, Mandrake" }
];

const wordData = [
    { Virtue: "Honesty", Town: "Moonglow", Mantra: "Ahm", Word: "Fallax", Dungeon: "Deceit" },
    { Virtue: "Compassion", Town: "Britain", Mantra: "Mu", Word: "Vilis", Dungeon: "Despise" },
    { Virtue: "Valor", Town: "Jhelom", Mantra: "Ra", Word: "Inopia", Dungeon: "Destard" },
    { Virtue: "Justice", Town: "Yew", Mantra: "Beh", Word: "Malum", Dungeon: "Wrong" },
    { Virtue: "Sacrifice", Town: "Minoc", Mantra: "Cah", Word: "Avidus", Dungeon: "Covetous" },
    { Virtue: "Honor", Town: "Trinsic", Mantra: "Summ", Word: "Infama", Dungeon: "Shame" },
    { Virtue: "Spirituality", Town: "Skara Brae", Mantra: "Om", Word: "Ignavus", Dungeon: "Hythloth" },
    { Virtue: "Humility", Town: "New Magincia", Mantra: "Lum", Word: "—", Dungeon: "—" }
];

// Shared reference data (single source of truth) for Tips and Moongate Phases
const commonTips = [
    'Final descent (Act IV/Doom): Pre\u200a-mix <code>AN TYM</code> (Stop Time; reagents C\u2011E\u2011H = Ginseng, Blood Moss, Mandrake). It\'s extremely strong for nasty rooms; also stock <code>VAS MANI</code> and <code>IN VAS GRAV CORP</code>.',
    'Removing charm/possession: Cast <code>AN XEN EX</code> (Charm; reagents D\u2011F\u2011G = Spider Silk, Black Pearl, Nightshade) to cure a charmed ally or to charm problematic foes. Alternatively, <code>IN ZU</code> (Sleep) can neutralize a charmed companion. Wearing the <strong>Crown</strong> helps prevent enemy spell effects (charm/fear).',
    'HMS Cape plans: In East Brittany (The Oaken Oar), jimmy the locked double doors to get the HMS Cape plans; they double frigate speed.',
    'Free reagents: Nightshade grows in the center of Spiritwood (east of Skara Brae); Mandrake in the Bloody Plains (SE of Minoc). With just Nightshade+Mandrake you can cast <code>IN WIS</code>, <code>QUAS AN WIS</code>, and <code>IN QUAS WIS</code>.',
    'Sextant & Spyglass: Ask David at Greyhaven (lighthouse south of Trinsic) for a free sextant (coords). Seggallion at Farthing grants a spyglass; Zachariah explains it if you\'re in the Resistance.',
    'Moonstones: You can dig up and rebury moonstones to relocate moongates. Consider clustering near Spiritwood/Bloody Plains for reagent runs, and keep one on you as an emergency escape gate.',
    'Shrine of Spirituality: Enter any moongate at exactly midnight (12:00 AM) to reach the shrine in the Ethereal Void. Skara Brae is where you learn OM; the shrine is not in the town. Step into the active gate above a buried moonstone at midnight.',
    'Get a frigate: Wait near open water (e.g., Jhelom/New Magincia) without resting; pirate ships often spawn at dawn\u2014board and capture.',
    'Safe haven: The Brittany villages aren\'t visited by Shadowlords\u2014use them to lay low when a city is afflicted.',
    'Combat edges: Set the active player (1\u20136) to funnel XP. Halberds can strike through doors/walls in rooms; Magic Axes are infinite\u2011range and return.',
    'Power spikes: Glass swords from the Serpent\'s Spine cache can be multiplied by readying one after each find; save them for dragons/balrons.',
    'Early gold/XP: Farm bridge trolls (refuse the toll); save often between fights. Covetous is lucrative later once you\'re stronger.',
    'Free meals: Ask Cory at Empath Abbey\'s kitchen for squid/shark to get free food (slow, but infinite).',
    'Easy karma: Speak to Fenelon (Minoc), donate to Ava, free prisoners in Yew/Blackthorn\u2014higher karma lowers shop prices.',
    'Gems for mapping: Buy gems from the guild in Buccaneers\' Den; or cast <code>IN QUAS WIS</code> (Nightshade+Mandrake) to mimic a peer gem.',
    'Shadowlord days: A random city can be under a Shadowlord\'s influence each day\u2014NPCs turn hostile. Save around 11:30 PM to scout tomorrow\'s affliction and plan routes.',
    'Jhelom after dark: To exit when gates are closed, use the tower route\u2014SW\u2192NW\u2192NE towers and push barrels into the NW corner to reach the outside door.',
    'Skull keys fast: Minoc is open at night. Around 11 PM, enter, search Shenstone\'s stump for 5 keys, exit/re\u2011enter to refresh and repeat.',
    'Free healer: Minoc has a free healer\u2014use while waiting on moon phases.',
    'Handy spells early: <code>IN LOR</code> is cheaper than torches. <code>AN SANCT</code> reduces incoming damage and cures downtime early on.',
    'Travel magic: <code>VAS REL POR</code> (Gate Travel) turns moongates into fast\u2011travel\u2014memorize preferred phases and use a pocket watch to time arrivals.'
];

const moongatePhaseData = [
    { phase: 1, destination: 'Moonglow' },
    { phase: 2, destination: 'Britain' },
    { phase: 3, destination: 'Jhelom' },
    { phase: 4, destination: 'Yew' },
    { phase: 5, destination: 'Minoc' },
    { phase: 6, destination: 'Trinsic' },
    { phase: 7, destination: 'Skara Brae' },
    { phase: 8, destination: 'New Magincia' }
];

const ULTIMA5_PROGRESS_STORAGE_KEY = 'ultima5-campaign-progress-v2';
const ULTIMA5_SIDEQUEST_STORAGE_KEY = 'ultima5-sidequest-progress-v1';
const ULTIMA5_SUPPLY_STORAGE_KEY = 'ultima5-field-kit-v2';

const ultima5CampaignObjectives = [
    { id: 'shrine-honesty', chapter: 'shrines', title: 'Shrine of Honesty', detail: 'AHM · Moonglow', atlas: { marker: 'Shrine of Honesty' } },
    { id: 'shrine-compassion', chapter: 'shrines', title: 'Shrine of Compassion', detail: 'MU · Britain', atlas: { marker: 'Shrine of Compassion' } },
    { id: 'shrine-valor', chapter: 'shrines', title: 'Shrine of Valor', detail: 'RA · Jhelom', atlas: { marker: 'Shrine of Valor' } },
    { id: 'shrine-justice', chapter: 'shrines', title: 'Shrine of Justice', detail: 'BEH · Yew', atlas: { marker: 'Shrine of Justice' } },
    { id: 'shrine-sacrifice', chapter: 'shrines', title: 'Shrine of Sacrifice', detail: 'CAH · Minoc', atlas: { marker: 'Shrine of Sacrifice' } },
    { id: 'shrine-honor', chapter: 'shrines', title: 'Shrine of Honor', detail: 'SUMM · Trinsic', atlas: { marker: 'Shrine of Honor' } },
    { id: 'shrine-spirituality', chapter: 'shrines', title: 'Shrine of Spirituality', detail: 'OM · Any moongate at exactly midnight (12:00 AM)' },
    { id: 'shrine-humility', chapter: 'shrines', title: 'Shrine of Humility', detail: 'LUM · New Magincia', atlas: { marker: 'Shrine of Humility' } },
    { id: 'shadow-faulinei', chapter: 'shadowlords', title: 'Banish Faulinei', detail: 'Falsehood · Lycaeum', atlas: { marker: 'Shard of Falsehood' } },
    { id: 'shadow-astaroth', chapter: 'shadowlords', title: 'Banish Astaroth', detail: 'Hatred · Empath Abbey', atlas: { marker: 'Shard of Hatred' } },
    { id: 'shadow-nosfentor', chapter: 'shadowlords', title: 'Banish Nosfentor', detail: 'Cowardice · Serpent’s Hold', atlas: { marker: 'Shard of Cowardice' } },
    { id: 'regalia-box', chapter: 'regalia', title: 'Recover the Sandalwood Box', detail: 'Castle Britannia', atlas: { interiorId: 'location-17', floor: '2' } },
    { id: 'regalia-sceptre', chapter: 'regalia', title: 'Recover the Sceptre', detail: 'Stonegate', atlas: { interiorId: 'location-29', floor: '0' } },
    { id: 'regalia-crown', chapter: 'regalia', title: 'Recover the Crown', detail: 'Blackthorn’s Castle', atlas: { interiorId: 'location-18', floor: '3' } },
    { id: 'regalia-amulet', chapter: 'regalia', title: 'Recover the Amulet', detail: 'Underworld burial ground', atlas: { marker: "Lord British's Amulet" } },
    { id: 'doom-rescue', chapter: 'doom', title: 'Rescue Lord British', detail: 'Dungeon Doom', atlas: { interiorId: 'location-40', floor: '7' } }
];

const ultima5SideQuests = [
    {
        id: 'side-magic-carpet', category: 'Travel', title: 'Secure the Magic Carpet', location: 'Castle Britannia',
        detail: 'Bring a Skull Key from Shenstone’s stump in Minoc (or AN SANCT), climb to Lord British’s private rooftop room, unlock the magic door, and take the carpet. It crosses shallow water, swamp, brush, and hills; mountains still need the Grapple, and rough sea is dangerous.',
        reward: 'Fast terrain-crossing travel', recommendedBefore: 'regalia-sceptre', atlas: { interiorId: 'location-17', floor: '2' }
    },
    {
        id: 'side-grapple', category: 'Equipment', title: 'Secure the Grapple', location: 'Empath Abbey',
        detail: 'Ask Lord Michael about GRAPPLE. If you want the in-world clue first, ask Bidney in Buccaneer’s Den about climbing; he points you back to the Abbey. The hook opens routes across small peaks.',
        reward: 'Mountain access', recommendedBefore: 'shadow-faulinei', atlas: { interiorId: 'location-31', floor: '1' }
    },
    {
        id: 'side-jaana', category: 'Companion', title: 'Free Jaana from Yew', location: 'Yew',
        detail: 'Enter the fireplace behind the living area, descend to the hidden jail, unlock the door, and recruit Jaana.',
        reward: 'Healer companion', recommendedBefore: 'shrine-compassion', atlas: { interiorId: 'location-4', floor: '0' }
    },
    {
        id: 'side-resistance-party', category: 'Companions', title: 'Build a Resistance Party', location: 'Across Britannia',
        detail: 'Recruit Julia at Empath Abbey, Mariah at the Lycaeum, and Gwenno in Britain; use the Party Builder to choose your six.',
        reward: 'Flexible party roles', recommendedBefore: 'shrine-compassion', atlas: { interiorId: 'location-31', floor: '1' }
    },
    {
        id: 'side-skull-keys', category: 'Supplies', title: 'Stockpile Skull Keys', location: 'Minoc',
        detail: 'Search Shenstone’s stump at night for five keys. Leave and return on another day to replenish the cache.',
        reward: 'Opens sealed quest rooms', recommendedBefore: 'regalia-box', atlas: { interiorId: 'location-5', floor: '0' }
    },
    {
        id: 'side-glass-swords', category: 'Treasure', title: 'Raid the Glass Sword Cache', location: 'Serpent’s Spine',
        detail: 'Find the hidden valley south of Yew. Ready each sword after finding it to multiply the cache for the party.',
        reward: 'Emergency boss weapons', recommendedBefore: 'shadow-faulinei', usefulnessRank: 2, atlas: { marker: 'Glass Sword Cache' }
    },
    {
        id: 'side-hms-cape', category: 'Travel', title: 'Steal the HMS Cape Plans', location: 'East Britanny',
        detail: 'Jimmy the locked double doors at The Oaken Oar and search the east room’s drawers for the ship plans.',
        reward: 'Double frigate speed', recommendedBefore: 'shadow-faulinei', atlas: { interiorId: 'location-21', floor: '0' }
    },
    {
        id: 'side-magic-axe', category: 'Treasure', title: 'Claim Jhelom’s Magic Axe', location: 'Jhelom',
        detail: 'Use the tower route, push the barrels, and search the concealed stump for a free returning ranged weapon before spending roughly 1,000 gold on additional axes.',
        reward: 'Infinite-range returning axe', recommendedBefore: 'shadow-faulinei', usefulnessRank: 1, atlas: { interiorId: 'location-3', floor: '0' }
    },
    {
        id: 'side-reagents', category: 'Magic', title: 'Establish a Reagent Run', location: 'Spiritwood & Bloody Plains',
        detail: 'Harvest Nightshade at midnight in Spiritwood and Mandrake southeast of Minoc for high-circle travel and scouting magic.',
        reward: 'Renewable rare reagents', recommendedBefore: 'shrine-spirituality', usefulnessRank: 2, atlas: { marker: 'Nightshade' }
    },
    {
        id: 'side-navigation', category: 'Travel', title: 'Collect the Sextant & Spyglass', location: 'Greyhaven & Farthing',
        detail: 'Ask David at Greyhaven for the sextant, then visit Seggallion at Farthing for the spyglass.',
        detailAtlasLinks: [
            { label: 'David', target: 'david' },
            { label: 'Greyhaven', target: 'greyhaven' },
            { label: 'Seggallion', target: 'seggallion' },
            { label: 'Farthing', target: 'farthing' }
        ],
        reward: 'Coordinates and scouting', recommendedBefore: 'shrine-compassion', usefulnessRank: 1, atlas: { interiorId: 'location-11', floor: '0' }
    },
    {
        id: 'side-mystic-arms', category: 'Treasure', title: 'Recover the Mystic Arms', location: 'Southeast Underworld',
        detail: 'During the Hythloth run for the Shard of Cowardice, continue into the far southeast Underworld and recover Britannia’s hidden Mystic equipment before leaving.',
        reward: 'Ultimate equipment set', recommendedBefore: 'regalia-sceptre', usefulnessRank: 1, atlas: { marker: 'Mystic Arms' }
    }
];

const ultima5SideQuestGroupRationales = {
    shrines: 'Navigation and renewable spell supplies make the long shrine circuit faster and safer.',
    shadowlords: 'Reliable ranged damage and emergency finishers reduce the risk of the Underworld shard runs.',
    regalia: 'Fold this into the Hythloth expedition so the strongest equipment is ready for Stonegate and Blackthorn’s fortress.',
    doom: 'Claim the strongest optional equipment immediately before the final one-way descent.'
};

const ultima5InlineAtlasTargets = {
    david: { terms: ['David'], label: 'David at Greyhaven', interiorId: 'location-11', floor: '0', hour: 12, npcId: 'npc-11-3' },
    greyhaven: { terms: ['Greyhaven'], label: 'Greyhaven', interiorId: 'location-11', floor: '0' },
    seggallion: { terms: ['Seggallion'], label: 'Lord Seggallion at Farthing', interiorId: 'location-27', floor: '0', hour: 12, npcId: 'npc-27-1' },
    farthing: { terms: ['Farthing'], label: 'Farthing', interiorId: 'location-27', floor: '0' },
    jaana: { terms: ['Jaana'], label: 'Jaana’s hidden jail route in Yew', interiorId: 'location-4', floor: '0' },
    julia: { terms: ['Julia'], label: 'Julia at Empath Abbey', interiorId: 'location-31', floor: '1', hour: 12, npcId: 'npc-31-16' },
    gwenno: { terms: ['Gwenno'], label: 'Gwenno in Britain', interiorId: 'location-2', floor: '0', hour: 12, npcId: 'npc-2-8' },
    mariah: { terms: ['Mariah'], label: 'Mariah at the Lycaeum', interiorId: 'location-30', floor: '1', hour: 12, npcId: 'npc-30-19' },
    johne: { terms: ['Johne'], label: 'Johne aboard the Ararat', interiorId: 'location-25', floor: '0' },
    lordMichael: { terms: ['Lord Michael'], label: 'Lord Michael at Empath Abbey', interiorId: 'location-31', floor: '1', hour: 12, npcId: 'npc-31-10' },
    bidney: { terms: ['Bidney'], label: 'Bidney in Buccaneer’s Den', interiorId: 'location-24', floor: '0', hour: 12, npcId: 'npc-24-8' },
    buccaneersDen: { terms: ['Buccaneer’s Den', "Buccaneer's Den"], label: 'Buccaneer’s Den', interiorId: 'location-24', floor: '0' },
    shenstoneStump: { terms: ['Shenstone’s stump', "Shenstone's stump", 'Skull Keys', 'Skull Key'], label: 'Shenstone’s Skull Key stump in Minoc', interiorId: 'location-5', floor: '0' },
    saduj: { terms: ['Saduj'], label: 'Saduj in Castle Britannia', interiorId: 'location-17', floor: '-1', hour: 12, npcId: 'npc-17-26' },
    malifora: { terms: ['Malifora'], label: 'Malifora in Moonglow', interiorId: 'location-1', floor: '0', hour: 12, npcId: 'npc-1-4' },
    greyson: { terms: ['Greyson'], label: 'Greyson in Britain', interiorId: 'location-2', floor: '0', hour: 12, npcId: 'npc-2-14' },
    trian: { terms: ['Trian'], label: 'Trian in Jhelom', interiorId: 'location-3', floor: '0', hour: 12, npcId: 'npc-3-8' },
    thorne: { terms: ['Thorne'], label: 'Thorne in Jhelom', interiorId: 'location-3', floor: '0', hour: 12, npcId: 'npc-3-10' },
    jeremy: { terms: ['Jeremy'], label: 'Jeremy in Yew', interiorId: 'location-4', floor: '0', hour: 12, npcId: 'npc-4-8' },
    chamfort: { terms: ['Chamfort'], label: 'Chamfort in Yew', interiorId: 'location-4', floor: '0', hour: 12, npcId: 'npc-4-14' },
    rew: { terms: ['Rew'], label: 'Rew in Minoc', interiorId: 'location-5', floor: '0', hour: 12, npcId: 'npc-5-6' },
    gruman: { terms: ['Gruman'], label: 'Gruman in Trinsic', interiorId: 'location-6', floor: '1', hour: 12, npcId: 'npc-6-9' },
    saul: { terms: ['Saul'], label: 'Saul in Skara Brae', interiorId: 'location-7', floor: '0', hour: 12, npcId: 'npc-7-7' },
    kindor: { terms: ['Kindor'], label: 'Kindor in Skara Brae', interiorId: 'location-7', floor: '0', hour: 12, npcId: 'npc-7-6' },
    shirita: { terms: ['Shirita'], label: 'Shirita in New Magincia', interiorId: 'location-8', floor: '0', hour: 12, npcId: 'npc-8-10' },
    wartow: { terms: ['Wartow'], label: 'Wartow in New Magincia', interiorId: 'location-8', floor: '0', hour: 12, npcId: 'npc-8-8' },
    malik: { terms: ['Malik'], label: 'Malik in Moonglow', interiorId: 'location-1', floor: '0', hour: 12, npcId: 'npc-1-5' },
    felespar: { terms: ['Felespar'], label: 'Felespar in Yew', interiorId: 'location-4', floor: '0', hour: 12, npcId: 'npc-4-10' },
    fiona: { terms: ['Fiona'], label: 'Fiona in Minoc', interiorId: 'location-5', floor: '0', hour: 12, npcId: 'npc-5-3' },
    kaiko: { terms: ['Kaiko'], label: 'Kaiko in New Magincia', interiorId: 'location-8', floor: '0', hour: 12, npcId: 'npc-8-6' },
    hassad: { terms: ['Hassad'], label: 'Hassad in Blackthorn’s dungeon', interiorId: 'location-18', floor: '-1', hour: 12, npcId: 'npc-18-31' },
    yew: { terms: ['Yew'], label: 'Yew', interiorId: 'location-4', floor: '0' },
    empathAbbey: { terms: ['Empath Abbey'], label: 'Empath Abbey', interiorId: 'location-31', floor: '0' },
    britain: { terms: ['Britain'], label: 'Britain', interiorId: 'location-2', floor: '0' },
    lycaeum: { terms: ['Lycaeum'], label: 'The Lycaeum', interiorId: 'location-30', floor: '0' },
    minoc: { terms: ['Minoc'], label: 'Minoc', interiorId: 'location-5', floor: '0' },
    eastBritanny: { terms: ['East Britanny', 'East Brittany'], label: 'East Britanny', interiorId: 'location-21', floor: '0' },
    castleBritannia: { terms: ['Castle Britannia', 'Lord British’s private rooftop room', 'Lord British’s private study'], label: 'Castle Britannia’s upper private suite', interiorId: 'location-17', floor: '2' },
    moonglow: { terms: ['Moonglow'], label: 'Moonglow', interiorId: 'location-1', floor: '0' },
    jhelom: { terms: ['Jhelom'], label: 'Jhelom', interiorId: 'location-3', floor: '0' },
    trinsic: { terms: ['Trinsic'], label: 'Trinsic', interiorId: 'location-6', floor: '0' },
    skaraBrae: { terms: ['Skara Brae'], label: 'Skara Brae', interiorId: 'location-7', floor: '0' },
    newMagincia: { terms: ['New Magincia'], label: 'New Magincia', interiorId: 'location-8', floor: '0' },
    oakenOar: { terms: ['The Oaken Oar', 'Oaken Oar'], label: 'The Oaken Oar in East Britanny', interiorId: 'location-21', floor: '0' },
    deceit: { terms: ['Deceit'], label: 'Dungeon Deceit', interiorId: 'location-33', floor: '0' },
    wrong: { terms: ['Wrong'], label: 'Dungeon Wrong', interiorId: 'location-36', floor: '0' },
    covetous: { terms: ['Covetous'], label: 'Dungeon Covetous', interiorId: 'location-37', floor: '0' },
    hythloth: { terms: ['Hythloth'], label: 'Dungeon Hythloth', interiorId: 'location-39', floor: '0' },
    serpentHold: { terms: ['Serpent’s Hold', "Serpent's Hold"], label: 'Serpent’s Hold', interiorId: 'location-32', floor: '0' },
    stonegate: { terms: ['Stonegate'], label: 'Stonegate', interiorId: 'location-29', floor: '0' },
    blackthornCastle: { terms: ['Blackthorn’s Castle', 'Blackthorn’s fortress'], label: 'Blackthorn’s Castle rooftop', interiorId: 'location-18', floor: '3' },
    blackthornDungeon: { terms: ['Blackthorn’s dungeon'], label: 'Blackthorn’s dungeon', interiorId: 'location-18', floor: '-1' },
    doom: { terms: ['Dungeon Doom', 'Doom'], label: 'Dungeon Doom’s final level', interiorId: 'location-40', floor: '7' },
    grapple: { terms: ['Grappling Hook', 'Grapple'], label: 'The Grapple at Empath Abbey', interiorId: 'location-31', floor: '1' },
    magicCarpet: { terms: ['Magic Carpet', 'magic carpet', 'Carpet'], label: 'The Magic Carpet in Castle Britannia', interiorId: 'location-17', floor: '2' },
    sandalwoodBox: { terms: ['Sandalwood Box', 'the Box'], label: 'The Sandalwood Box in Castle Britannia', interiorId: 'location-17', floor: '2' },
    hmsCapePlans: { terms: ['HMS Cape plans', 'ship plans'], label: 'The HMS Cape plans at the Oaken Oar', interiorId: 'location-21', floor: '0' },
    sceptre: { terms: ['Sceptre'], label: 'The Sceptre in Stonegate', interiorId: 'location-29', floor: '0' },
    crown: { terms: ['Crown'], label: 'The Crown in Blackthorn’s Castle', interiorId: 'location-18', floor: '3' },
    shrineHonesty: { terms: ['Shrine of Honesty'], label: 'Shrine of Honesty', marker: 'Shrine of Honesty' },
    shrineCompassion: { terms: ['Shrine of Compassion'], label: 'Shrine of Compassion', marker: 'Shrine of Compassion' },
    shrineValor: { terms: ['Shrine of Valor'], label: 'Shrine of Valor', marker: 'Shrine of Valor' },
    shrineJustice: { terms: ['Shrine of Justice'], label: 'Shrine of Justice', marker: 'Shrine of Justice' },
    shrineSacrifice: { terms: ['Shrine of Sacrifice'], label: 'Shrine of Sacrifice', marker: 'Shrine of Sacrifice' },
    shrineHonor: { terms: ['Shrine of Honor'], label: 'Shrine of Honor', marker: 'Shrine of Honor' },
    shrineHumility: { terms: ['Shrine of Humility'], label: 'Shrine of Humility', marker: 'Shrine of Humility' },
    codex: { terms: ['the Codex', 'Codex'], label: 'Shrine of the Codex', marker: 'Shrine of the Codex' },
    flameTruth: { terms: ['Flame of Truth'], label: 'Flame of Truth at the Lycaeum', interiorId: 'location-30', floor: '0' },
    flameLove: { terms: ['Flame of Love'], label: 'Flame of Love at Empath Abbey', interiorId: 'location-31', floor: '0' },
    flameCourage: { terms: ['Flame of Courage'], label: 'Flame of Courage at Serpent’s Hold', interiorId: 'location-32', floor: '0' },
    shardFalsehood: { terms: ['Shard of Falsehood'], label: 'Shard of Falsehood', marker: 'Shard of Falsehood' },
    shardHatred: { terms: ['Shard of Hatred'], label: 'Shard of Hatred', marker: 'Shard of Hatred' },
    shardCowardice: { terms: ['Shard of Cowardice'], label: 'Shard of Cowardice', marker: 'Shard of Cowardice' },
    amuletBurial: { terms: ['Underworld burial ground', 'burial ground of Lord British’s expedition', 'Amulet'], label: 'Lord British’s Amulet', marker: "Lord British's Amulet" },
    waterfall: { terms: ['waterfall east of Skara Brae'], label: 'Waterfall to the Underworld', marker: 'Waterfall to the Underworld' },
    nightshade: { terms: ['Nightshade', 'Spiritwood'], label: 'Nightshade in Spiritwood', marker: 'Nightshade' },
    mandrake: { terms: ['Mandrake Root', 'Mandrake', 'Bloody Plains'], label: 'Mandrake Root in the Bloody Plains', marker: 'Mandrake Root' },
    glassSwordCache: { terms: ['Glass Sword Cache', 'Serpent’s Spine'], label: 'Glass Sword Cache in Serpent’s Spine', marker: 'Glass Sword Cache' },
    mysticArms: { terms: ['Mystic Arms', 'Mystic equipment'], label: 'Mystic Arms in the southeast Underworld', marker: 'Mystic Arms' }
};

const ultima5ObjectiveGuidance = {
    'shrine-honesty': 'Begin in Moonglow: learn AHM, meditate three cycles, and seek the Codex.',
    'shrine-compassion': 'Find Greyson in Britain, affirm Lord British, and ask for the mantra MU.',
    'shrine-valor': 'Follow Trian’s lead to Thorne in Jhelom and learn RA.',
    'shrine-justice': 'Help Jeremy, join the Resistance with DAWN, and seek Chamfort for BEH.',
    'shrine-sacrifice': 'Speak with Rew in East Brittany to learn CAH, then make the shrine pilgrimage.',
    'shrine-honor': 'Ask Gruman in Trinsic for SUMM before visiting the Shrine of Honor.',
    'shrine-spirituality': 'Learn OM from Kindor in Skara Brae, then enter any moongate at exactly midnight (12:00 AM) to reach the shrine in the Ethereal Void.',
    'shrine-humility': 'Pass Wartow’s questions in New Magincia to earn the mantra LUM.',
    'shadow-faulinei': 'Recover the Shard of Falsehood below Deceit, then carry it to the Lycaeum flame.',
    'shadow-astaroth': 'Seek the Shard of Hatred through Wrong or Covetous and banish Astaroth at Empath Abbey.',
    'shadow-nosfentor': 'Descend through Hythloth for the Shard of Cowardice, then return to Serpent’s Hold.',
    'regalia-sceptre': 'Bring Carpet, Grapple, and Skull Keys to Stonegate; the demon’s answer is WELL.',
    'regalia-crown': 'Infiltrate Blackthorn’s Castle, reach the rooftop, and escape by Magic Carpet.',
    'regalia-amulet': 'Take the waterfall east of Skara Brae into the Underworld and find the burial ground.',
    'regalia-box': 'Play Stones on Lord British’s harpsichord to reveal the private study.',
    'doom-rescue': 'Carry every royal artifact, speak VERAMOCOR, and make the final descent into Doom.'
};

const ultima5ShrineFieldNotes = {
    'shrine-honesty': [{ label: 'Merchant timing', text: 'Completing Honesty grants the Avatar +1 Intelligence, which lowers later shop prices.' }],
    'shrine-justice': [{ label: 'Merchant timing', text: 'Justice is aligned with Truth, so its completed Codex quest also raises Intelligence and improves later prices.' }],
    'shrine-spirituality': [{ label: 'Merchant timing', text: 'Spirituality raises all three attributes, including Intelligence; postpone expensive axes, armour, and reagents until afterward when practical.' }]
};

const ultima5GrandQuestChapters = [
    {
        id: 'readiness',
        number: '01',
        eyebrow: 'Opening strategy',
        title: 'Forge a Mobile Resistance',
        summary: 'Recruit the right party and take the tools that make every later pilgrimage safer and faster.',
        objectives: [
            {
                id: 'opening-party',
                title: 'Assemble the recommended field party',
                location: 'Yew, Empath Abbey, Britain, and the Lycaeum',
                summary: 'Prioritize spellcasters and capable ranged fighters before committing to the shrine circuit.',
                outcome: 'A resilient six-person party with healing, utility magic, and ranged pressure.',
                progress: [
                    { store: 'side', id: 'side-jaana' },
                    { store: 'side', id: 'side-resistance-party' }
                ],
                atlas: { interiorId: 'location-4', floor: '0' },
                steps: [
                    'Keep Iolo and Shamino while the party is small; heal Shamino before taking road fights.',
                    'In Yew, enter the fireplace behind the living area, descend into the hidden jail, unlock Jaana’s cell, and ask the mage to join.',
                    'Follow the road to Empath Abbey and recruit Julia upstairs. She is the strongest practical early replacement when the party begins to fill.',
                    'Recruit Gwenno in Britain, then add Mariah at the Lycaeum once a moongate, skiff, frigate, or the Magic Carpet makes the island reachable.',
                    'Aim for Avatar, Iolo, Jaana, Julia, Gwenno, and Mariah. If you need space, leave Shamino at an inn; later, Johne can replace Julia for an even more magic-heavy endgame party.'
                ],
                hints: [
                    { label: 'Sell before lodging', text: 'Move useful equipment off Shamino before leaving him at the Britain inn, then sell surplus weapons and armour instead of carrying dead weight.' },
                    { label: 'Starter stake', text: 'The hidden Yew jail route contains a Silver Sword behind the rat room. Keep it as an early upgrade or sell it to seed the ship fund.' }
                ]
            },
            {
                id: 'opening-grapple',
                title: 'Secure the Grapple',
                location: 'Empath Abbey',
                summary: 'Take the mountain-crossing tool while recruiting Julia so the trip pays twice.',
                outcome: 'Small mountain peaks and several Underworld routes become traversable.',
                progress: [{ store: 'side', id: 'side-grapple' }],
                atlas: { interiorId: 'location-31', floor: '1' },
                steps: [
                    'Find Lord Michael at Empath Abbey: he is in the courtyard by day and retires to the northwest bedroom.',
                    'Speak with Lord Michael and ask specifically about GRAPPLE.',
                    'Take the Grappling Hook he provides and keep it in the active party’s inventory.',
                    'Recruit Julia before leaving so you do not need a second opening-game trip to the Abbey.'
                ],
                hints: [
                    { label: 'Natural clue chain', text: 'If you prefer to discover the keyword in-world, ask Bidney in Buccaneer’s Den about climbing before speaking with Lord Michael.' }
                ]
            },
            {
                id: 'opening-hms-cape',
                title: 'Steal the HMS Cape plans',
                location: 'The Oaken Oar, East Britanny',
                summary: 'Upgrade any frigate before sea travel becomes a major part of the campaign.',
                outcome: 'Using the plans on a frigate doubles its speed relative to enemies.',
                progress: [{ store: 'side', id: 'side-hms-cape' }],
                atlas: { interiorId: 'location-21', floor: '0' },
                steps: [
                    'Enter East Britanny and go north to the Oaken Oar shipwright’s building; use the west entrance.',
                    'Move to the eastern room and jimmy both ordinary locked doors with lockpicks.',
                    'Search the drawers in the room until you recover the HMS Cape plans.',
                    'When you obtain a frigate, use the plans on the ship once to apply the faster sail upgrade.'
                ],
                hints: [
                    { label: 'Best-value frigate', text: 'Do not grind for a purchase unless you want to. Patrol the coast near Minoc, let a pirate frigate close, defeat its crew, and claim the ship for free.' },
                    { label: 'If buying', text: 'Check Jhelom first: a frigate is listed around 600 gold there, versus roughly 650 in East Britanny, 700 in Buccaneer’s Den, and 753 in Minoc.' },
                    { label: 'Intelligence discount', text: 'Merchant prices fall as the Avatar’s Intelligence rises. A high-INT start pays less; after the pilgrimage, Honesty, Justice, and Spirituality rewards make later purchases cheaper.' },
                    { label: 'Build the fund safely', text: 'Refuse bridge-troll tolls and win the fights, sell surplus companion and monster loot, and search every chest or bloodstain. Save after profitable victories.' },
                    { label: 'Protect the purse', text: 'Use Minoc’s free healer and cure, avoid its guards because they can take half your gold, and never shop in a town while a Shadowlord is distorting prices.' }
                ]
            },
            {
                id: 'opening-raid-kit',
                title: 'Stock the Castle Britannia raid kit',
                location: 'Minoc and any well-supplied town',
                summary: 'Prepare for locked doors, fireplace damage, guards, and a clean retreat before entering the upper castle.',
                outcome: 'Enough access and recovery supplies to take both treasures in one visit.',
                progress: [{ store: 'side', id: 'side-skull-keys' }],
                atlas: { interiorId: 'location-5', floor: '0' },
                steps: [
                    'Visit Minoc at night and search Shenstone’s stump in the northwest for five Skull Keys; leave and return on a later day if you want more.',
                    'Reserve at least one Skull Key for Lord British’s magically locked chamber and carry a spare in case your route changes.',
                    'Bring several lockpicks, food, direct healing, poison cure, and enough hit points to survive any fireplace passage or guard mistake.',
                    'Make a fresh save outside Castle Britannia. Do not recruit Saduj if he appears; he is Blackthorn’s agent and can betray the party.'
                ],
                hints: [
                    { label: 'Free recovery', text: 'Minoc’s healer cures and heals without charge. Use that service while restocking Skull Keys instead of spending the frigate fund elsewhere.' },
                    { label: 'Buy last', text: 'Enemies can leave food, torches, keys, gold, weapons, and armour. Search their chests and remains before paying for anything except missing raid essentials.' }
                ]
            },
            {
                id: 'opening-castle-raid',
                title: 'Raid Lord British’s third-floor chambers',
                location: 'Castle Britannia, upper private suite',
                summary: 'Take the Magic Carpet and Sandalwood Box together before the long pilgrimage begins.',
                outcome: 'Britannia’s best travel tool and the proof required to rescue Lord British.',
                progress: [
                    { store: 'side', id: 'side-magic-carpet' },
                    { store: 'main', id: 'regalia-box' }
                ],
                atlas: { interiorId: 'location-17', floor: '2' },
                steps: [
                    'Enter Castle Britannia and use a perimeter tower stair to climb to the third-floor and rooftop level.',
                    'Circle the upper perimeter until the guard moves away. If you receive a warning or the guard starts following, retreat down a stair, wait, and try again.',
                    'Approach the central private suite and spend a Skull Key on Lord British’s magically locked door.',
                    'Take the Magic Carpet lying just inside the chamber. It crosses land, water, swamps, brush, and hills, but rough sea still damages the party and mountains still require the Grapple.',
                    'Stand at the harpsichord and play Stones as 6-7-8-9-8-7-8-7-6-7-6-5-3. The secret wall opens; enter and take the Sandalwood Box.',
                    'Leave by the same upper route. Keep the Carpet with the active party and retain the Box until Lord British uses it in Dungeon Doom.'
                ]
            }
        ]
    },
    {
        id: 'shrines',
        number: '02',
        eyebrow: 'The pilgrimage',
        title: 'Restore the Eight Shrines',
        summary: 'With fast travel secured, complete each virtue loop and earn the Word of Power for Doom.',
        objectives: [
            ['shrine-honesty', 'Honesty', 'Moonglow', 'AHM', 'Ask Malifora for the mantra.'],
            ['shrine-compassion', 'Compassion', 'Britain', 'MU', 'Ask Greyson, affirm that British is the rightful ruler, then ask for Compassion.'],
            ['shrine-valor', 'Valor', 'Jhelom', 'RA', 'Follow Trian’s lead to Thorne.'],
            ['shrine-justice', 'Justice', 'Yew', 'BEH', 'Help Jeremy, use the Resistance password DAWN with Chamfort, and follow the lead.'],
            ['shrine-sacrifice', 'Sacrifice', 'Minoc / East Britanny', 'CAH', 'Ask Rew in East Britanny.'],
            ['shrine-honor', 'Honor', 'Trinsic', 'SUMM', 'Ask Gruman when your karma is high enough.'],
            ['shrine-spirituality', 'Spirituality', 'Ethereal Void · Any moongate at midnight', 'OM', 'In Skara Brae, ask Saul, then Kindor about SHRINE and answer yes.'],
            ['shrine-humility', 'Humility', 'New Magincia', 'LUM', 'Ask Shirita, then answer Wartow: BRITISH, N, N, N, Y.']
        ].map(([id, virtue, location, mantra, lead]) => ({
            id,
            title: `Restore the Shrine of ${virtue}`,
            location,
            summary: virtue === 'Spirituality'
                ? 'Enter any moongate at exactly midnight (12:00 AM). The shrine is in the Ethereal Void; Skara Brae is only the town where you learn OM.'
                : `${lead} The mantra is ${mantra}.`,
            outcome: virtue === 'Humility'
                ? 'Humility restored and the full pilgrimage completed.'
                : `${virtue} restored and its attribute lesson completed.`,
            progress: [{ store: 'main', id }],
            atlas: ultima5CampaignObjectives.find(objective => objective.id === id)?.atlas,
            hints: ultima5ShrineFieldNotes[id] || [],
            steps: [
                `${lead} Record the mantra ${mantra}.`,
                ...(virtue === 'Spirituality' ? ['Wait beside any active moongate above a buried moonstone. Check your pocket watch and step into the gate at exactly midnight (12:00 AM) to reach the Ethereal Void. You do not need to depart from Skara Brae.'] : []),
                `Visit the Shrine of ${virtue}, speak the virtue name, and meditate with ${mantra} for three cycles.`,
                'Travel to the Codex only after the shrine sends you there and receive its counsel.',
                virtue === 'Spirituality'
                    ? 'Enter any moongate at exactly midnight again to return to the Shrine of Spirituality, then meditate with OM to complete the quest and gain attributes.'
                    : virtue === 'Humility'
                    ? 'Return to the Shrine of Humility and meditate again to complete the quest; this shrine grants no attribute bonus.'
                    : `Return to the Shrine of ${virtue} and meditate again to complete the quest and gain attributes.`
            ]
        }))
    },
    {
        id: 'shadowlords',
        number: '03',
        eyebrow: 'Break the tyranny',
        title: 'Shatter the Three Shadows',
        summary: 'Recover each shard in the Underworld and destroy its Shadowlord at the opposing sacred flame.',
        objectives: [
            {
                id: 'shadow-faulinei', title: 'Banish Faulinei, Shadowlord of Falsehood', location: 'Deceit to the Lycaeum',
                summary: 'Use FALLAX at Deceit, recover the Shard of Falsehood, and carry it to the Flame of Truth.',
                outcome: 'Faulinei is permanently destroyed; Falsehood can no longer corrupt Britannia.', progress: [{ store: 'main', id: 'shadow-faulinei' }],
                atlas: { marker: 'Shard of Falsehood' },
                steps: ['Learn FALLAX from Malifora after Malik points you to her.', 'Descend through Deceit and travel west through the Underworld to the Shard of Falsehood; bring the Carpet and Grapple.', 'At the Lycaeum, stand one tile south of the Flame of Truth and shout FAULINEI.', 'Wait one turn, then use the Shard of Falsehood when Faulinei stands on the flame.']
            },
            {
                id: 'shadow-astaroth', title: 'Banish Astaroth, Shadowlord of Hatred', location: 'Wrong or Covetous to Empath Abbey',
                summary: 'Reach the Shard of Hatred with MALUM or AVIDUS, then carry it to the Flame of Love.',
                outcome: 'Astaroth is permanently destroyed; Hatred can no longer corrupt Britannia.', progress: [{ store: 'main', id: 'shadow-astaroth' }],
                atlas: { marker: 'Shard of Hatred' },
                steps: ['Learn MALUM from Felespar in Yew with DAWN, or AVIDUS from Fiona in Minoc.', 'Descend through Wrong or Covetous into the southwest Underworld labyrinth and recover the Shard of Hatred.', 'At Empath Abbey, stand one tile south of the Flame of Love and shout ASTAROTH.', 'Wait one turn, then use the Shard of Hatred when Astaroth stands on the flame.']
            },
            {
                id: 'shadow-nosfentor', title: 'Banish Nosfentor, Shadowlord of Cowardice', location: 'Hythloth to Serpent’s Hold',
                summary: 'Use IGNAVUS at Hythloth, take the Shard of Cowardice, and carry it to the Flame of Courage.',
                outcome: 'Nosfentor is permanently destroyed; Cowardice can no longer corrupt Britannia.', progress: [{ store: 'main', id: 'shadow-nosfentor' }],
                atlas: { marker: 'Shard of Cowardice' },
                steps: ['Ask Kaiko in New Magincia about Hassad, then use Kaiko as a reference with Hassad in Blackthorn’s dungeon to learn IGNAVUS.', 'Descend through Hythloth; use IN POR for mountain rooms and the Magic Carpet over swamp to reach the northeast clearing.', 'At Serpent’s Hold, stand one tile south of the Flame of Courage and shout NOSFENTOR.', 'Wait one turn, then use the Shard of Cowardice when Nosfentor stands on the flame.']
            }
        ]
    },
    {
        id: 'regalia',
        number: '04',
        eyebrow: 'Arm for the abyss',
        title: 'Recover the Royal Regalia',
        summary: 'The Box is already safe; take the three artifacts that make Stonegate, Blackthorn’s fortress, and Doom survivable.',
        objectives: [
            {
                id: 'regalia-sceptre', title: 'Recover the Sceptre', location: 'Stonegate', summary: 'Use the Grapple, Carpet, and Skull Keys to cross Stonegate’s lethal approach.', outcome: 'A reusable way to dispel every magical field.', progress: [{ store: 'main', id: 'regalia-sceptre' }], atlas: { interiorId: 'location-29', floor: '0' },
                steps: ['Banish the Shadowlords first so they cannot reclaim the Sceptre later.', 'Reach Stonegate with the Grapple, unlock the center door with a Skull Key, and answer the demon’s riddle with WELL.', 'Ride the Magic Carpet over the fire pits and trapdoors, take the Sceptre, and leave before the tower becomes crowded.']
            },
            {
                id: 'regalia-crown', title: 'Recover the Crown', location: 'Blackthorn’s Castle rooftop', summary: 'Infiltrate the upper fortress, unlock the center room, and escape over the roof.', outcome: 'Protection from enemy magic when the Crown is worn.', progress: [{ store: 'main', id: 'regalia-crown' }], atlas: { interiorId: 'location-18', floor: '3' },
                steps: ['Make a permanent save; capture in Blackthorn’s Castle can permanently erase a companion.', 'Ride the Carpet from the entrance, outrun the guards, and climb through levels two and three to the rooftop.', 'Use a Skull Key on the center room, take the Crown, board the Carpet, and fly off the roof to escape.']
            },
            {
                id: 'regalia-amulet', title: 'Recover the Amulet', location: 'Southeast Underworld burial ground', summary: 'Use the waterfall east of Skara Brae for the quickest approach.', outcome: 'The darkness hiding Dungeon Doom can be pierced.', progress: [{ store: 'main', id: 'regalia-amulet' }], atlas: { marker: "Lord British's Amulet" },
                steps: ['Ride the Magic Carpet into the waterfall east of Skara Brae.', 'At the river junctions travel Down, Left, then Down; circle the lake and continue southeast through swamp and the mountain pass.', 'Take the Amulet from the burial ground of Lord British’s expedition.', 'Escape with VAS REL POR, or accept a controlled party death if no return spell remains.']
            }
        ]
    },
    {
        id: 'doom',
        number: '05',
        eyebrow: 'The final descent',
        title: 'Rescue Lord British from Doom',
        summary: 'Carry every royal artifact into the central Underworld and survive the one-way descent.',
        objectives: [
            {
                id: 'doom-rescue', title: 'Enter Doom and free the king', location: 'Dungeon Doom', summary: 'Commit only when every Shadowlord is gone and the full royal set is in the party.', outcome: 'Lord British returns and the tyranny collapses.', progress: [{ store: 'main', id: 'doom-rescue' }], atlas: { interiorId: 'location-40', floor: '7' },
                steps: ['Reach Avatar level 8 if possible; stock healing, resurrection magic, food, reagents, gems, and a permanent save.', 'Carry the Sceptre, Crown, Amulet, and Sandalwood Box. Use the Amulet to reveal Doom in the central Underworld and speak VERAMOCOR.', 'Use the Sceptre to dispel ethereal walls and wear the Crown through magic-heavy rooms.', 'Find the hidden pit on the final level, step through Lord British’s mirror, and give him the Sandalwood Box.', 'Use the Orb of the Moons he releases to escape the collapsing dungeon.']
            }
        ]
    }
];

const ULTIMA5_ATLAS_MARKER_STYLES = {
    city: { label: 'Cities & villages', color: '#fbbf24', symbol: 'T' },
    castle: { label: 'Castles', color: '#fb7185', symbol: 'C' },
    keep: { label: 'Keeps', color: '#fb923c', symbol: 'K' },
    site: { label: 'Dwellings & sites', color: '#a3e635', symbol: '•' },
    dungeon: { label: 'Dungeons', color: '#c084fc', symbol: 'D' },
    shrine: { label: 'Shrines', color: '#fef08a', symbol: 'S' },
    moongate: { label: 'Moongates', color: '#67e8f9', symbol: 'M' },
    quest: { label: 'Quest objectives', color: '#f472b6', symbol: 'Q' },
    passage: { label: 'World passages', color: '#38bdf8', symbol: '↕' },
    reagent: { label: 'Reagents', color: '#4ade80', symbol: 'R' },
    treasure: { label: 'Hidden treasure', color: '#fde047', symbol: '✦' },
    default: { label: 'Points of interest', color: '#e7e5e4', symbol: '•' }
};

const ultima5AtlasState = {
    map: null,
    overlay: null,
    markerLayer: null,
    entries: [],
    currentLayer: 'surface',
    viewMode: 'world',
    currentInterior: null,
    currentFloor: null,
    currentHour: 12,
    npcMarkers: new Map(),
    activeEntry: null,
    controlsBound: false,
    searchResults: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Initialize the companion chart
    initializeCompanionChart();
    
    // Populate companion table
    populateCompanionTable();

    // Build the interactive resistance roster
    populateCompanionRoster();
    
    // Populate spell table
    populateSpellTable();
    
    // Populate word table
    populateWordTable();
    
    // Populate reference tabs from shared data
    populateTipsList();
    populateMoongateTable();

    // Set up event listeners
    setupEventListeners();

    // Restore locally saved field-kit and campaign progress
    initializeUltima5FieldKit();
    initializeUltima5CampaignProgress();

    initializeUltima5AtlasShell();
});

// Initialize the companion chart
function initializeCompanionChart() {
    const ctx = document.getElementById('companionChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: companionData.map(c => c.Name),
            datasets: [{
                label: 'STR',
                data: companionData.map(c => c.STR),
                backgroundColor: 'rgba(220, 38, 38, 0.7)',
                borderColor: 'rgba(220, 38, 38, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 30
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = companionData[context.dataIndex];
                            return `STR: ${data.STR}, INT: ${data.INT}, DEX: ${data.DEX}`;
                        }
                    }
                }
            }
        }
    });

    // Store chart instance for updates
    window.companionChart = chart;
}

// Populate companion table
function populateCompanionTable() {
    const tbody = document.getElementById('companion-table-body');
    tbody.innerHTML = '';
    
    companionData.forEach(companion => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-amber-50';
        row.innerHTML = `
            <td class="p-3 border-b border-amber-100">${companion.Name}</td>
            <td class="p-3 border-b border-amber-100">${companion.Class}</td>
            <td class="p-3 border-b border-amber-100 text-center">${companion.Level}</td>
            <td class="p-3 border-b border-amber-100 text-center">${companion.STR}</td>
            <td class="p-3 border-b border-amber-100 text-center">${companion.INT}</td>
            <td class="p-3 border-b border-amber-100 text-center">${companion.DEX}</td>
            <td class="p-3 border-b border-amber-100">${companion.Location}</td>
        `;
        tbody.appendChild(row);
    });
}

function populateCompanionRoster() {
    const roster = document.getElementById('companion-roster');
    if (!roster) return;
    roster.innerHTML = '';

    companionData.forEach((companion, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'u5-roster-button';
        button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        button.innerHTML = `
            <strong>${escapeUltima5AtlasHtml(companion.Name)}</strong>
            <small>${escapeUltima5AtlasHtml(companion.Class)} · ${escapeUltima5AtlasHtml(companion.Location)}</small>
        `;
        button.addEventListener('click', () => selectUltima5Companion(index));
        roster.appendChild(button);
    });

    renderUltima5CompanionProfile(companionData[0]);
}

function selectUltima5Companion(index) {
    const companion = companionData[index];
    if (!companion) return;
    document.querySelectorAll('.u5-roster-button').forEach((button, buttonIndex) => {
        button.setAttribute('aria-selected', buttonIndex === index ? 'true' : 'false');
    });
    renderUltima5CompanionProfile(companion);
}

function renderUltima5CompanionProfile(companion) {
    const profile = document.getElementById('companion-profile');
    if (!profile || !companion) return;
    const statLine = (label, value) => `
        <div class="u5-stat-line">
            <span>${label}</span>
            <span class="u5-stat-line__track"><span style="width:${Math.min(value / 30 * 100, 100)}%"></span></span>
            <span>${value}</span>
        </div>
    `;
    profile.innerHTML = `
        <p class="u5-kicker">Tactical assessment</p>
        <h3>${escapeUltima5AtlasHtml(companion.Name)}</h3>
        <p class="u5-companion-profile__meta">${escapeUltima5AtlasHtml(companion.Class)} · Level ${companion.Level} · ${escapeUltima5AtlasHtml(companion.Location)}</p>
        <div class="u5-companion-profile__stats" aria-label="${escapeUltima5AtlasHtml(companion.Name)} attributes">
            ${statLine('STR', companion.STR)}
            ${statLine('INT', companion.INT)}
            ${statLine('DEX', companion.DEX)}
        </div>
        <p class="u5-companion-profile__note">${escapeUltima5AtlasHtml(companion.Notes)}</p>
    `;
}

// Populate spell table
function populateSpellTable() {
    const tbody = document.getElementById('spell-table-body');
    tbody.innerHTML = '';
    
    spellData.forEach(spell => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-amber-50';
        row.innerHTML = `
            <td class="p-3 border-b border-amber-100 font-mono">${spell.Name}</td>
            <td class="p-3 border-b border-amber-100 text-center">${spell.Circle}</td>
            <td class="p-3 border-b border-amber-100">${spell.Effect}</td>
            <td class="p-3 border-b border-amber-100">${spell.Reagents}</td>
        `;
        tbody.appendChild(row);
    });
}

// Populate word table
function populateWordTable() {
    const tbody = document.getElementById('word-table-body');
    tbody.innerHTML = '';
    
    wordData.forEach(word => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-amber-50';
        row.innerHTML = `
            <td class="p-3 border-b border-amber-100">${word.Virtue}</td>
            <td class="p-3 border-b border-amber-100 font-mono">${word.Mantra}</td>
            <td class="p-3 border-b border-amber-100">${word.Dungeon}</td>
            <td class="p-3 border-b border-amber-100 font-mono">${word.Word}</td>
        `;
        tbody.appendChild(row);
    });
}

// Populate Tips list from shared data
function populateTipsList() {
    const ul = document.getElementById('tips-list');
    if (!ul) return;
    ul.innerHTML = '';
    commonTips.forEach(item => {
        const li = document.createElement('li');
        // allow inline HTML like <code>, <em>
        li.innerHTML = item;
        ul.appendChild(li);
    });
}

// Populate Moongate Phases table from shared data
function populateMoongateTable() {
    const tbody = document.getElementById('moongate-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    moongatePhaseData.forEach(entry => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-3 border-b border-amber-100">${entry.phase}</td>
            <td class="p-3 border-b border-amber-100">${entry.destination}</td>
        `;
        tbody.appendChild(tr);
    });
}

function readUltima5StoredSet(storageKey) {
    try {
        const stored = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
        return new Set(Array.isArray(stored) ? stored : []);
    } catch (error) {
        return new Set();
    }
}

function writeUltima5StoredSet(storageKey, values) {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify([...values]));
    } catch (error) {
        // The guide remains fully usable if browser storage is unavailable.
    }
}

function initializeUltima5FieldKit() {
    const inputs = [...document.querySelectorAll('[data-u5-supply]')];
    if (!inputs.length) return;
    const saved = readUltima5StoredSet(ULTIMA5_SUPPLY_STORAGE_KEY);
    inputs.forEach(input => {
        input.checked = saved.has(input.dataset.u5Supply);
        input.addEventListener('change', () => {
            const current = readUltima5StoredSet(ULTIMA5_SUPPLY_STORAGE_KEY);
            if (input.checked) current.add(input.dataset.u5Supply);
            else current.delete(input.dataset.u5Supply);
            writeUltima5StoredSet(ULTIMA5_SUPPLY_STORAGE_KEY, current);
            inputs
                .filter(candidate => candidate.dataset.u5Supply === input.dataset.u5Supply)
                .forEach(candidate => { candidate.checked = input.checked; });
            updateUltima5FieldKit();
        });
    });
    updateUltima5FieldKit();
}

function updateUltima5FieldKit() {
    const loadouts = [...document.querySelectorAll('[data-u5-loadout]')];
    let readyLoadouts = 0;
    loadouts.forEach(loadout => {
        const inputs = [...loadout.querySelectorAll('[data-u5-loadout-item]')];
        const complete = inputs.filter(input => input.checked).length;
        const ready = inputs.length > 0 && complete === inputs.length;
        const status = loadout.querySelector('[data-u5-loadout-status]');
        loadout.classList.toggle('is-ready', ready);
        if (status) status.textContent = ready ? `Ready · ${complete}/${inputs.length}` : `${complete}/${inputs.length} secured`;
        if (ready) readyLoadouts += 1;
    });
    const percent = loadouts.length ? Math.round(readyLoadouts / loadouts.length * 100) : 0;
    const value = document.getElementById('u5-readiness-value');
    const bar = document.getElementById('u5-readiness-bar');
    if (value) value.textContent = `${readyLoadouts} of ${loadouts.length}`;
    if (bar) bar.style.width = `${percent}%`;
}

function ultima5GrandObjectiveComplete(objective, progressByStore) {
    return objective.progress.every(item => progressByStore[item.store].has(item.id));
}

function ultima5GrandProgressSets() {
    return {
        main: readUltima5StoredSet(ULTIMA5_PROGRESS_STORAGE_KEY),
        side: readUltima5StoredSet(ULTIMA5_SIDEQUEST_STORAGE_KEY)
    };
}

function setUltima5GrandObjectiveProgress(objective, complete) {
    const progressByStore = ultima5GrandProgressSets();
    objective.progress.forEach(item => {
        if (complete) progressByStore[item.store].add(item.id);
        else progressByStore[item.store].delete(item.id);
    });
    writeUltima5StoredSet(ULTIMA5_PROGRESS_STORAGE_KEY, progressByStore.main);
    writeUltima5StoredSet(ULTIMA5_SIDEQUEST_STORAGE_KEY, progressByStore.side);
}

function ultima5GrandObjectiveMarkup(objective, chapterIndex, objectiveIndex) {
    const detailsId = `u5-grand-details-${objective.id}`;
    const hintsLabelId = `u5-grand-hints-${objective.id}`;
    const objectiveNumber = `${String(chapterIndex + 1).padStart(2, '0')}.${objectiveIndex + 1}`;
    const linkedTargets = new Set();
    const location = renderUltima5AtlasLinkedText(objective.location, undefined, linkedTargets);
    const summary = renderUltima5AtlasLinkedText(objective.summary, undefined, linkedTargets);
    const steps = objective.steps.map(step => `<li>${renderUltima5AtlasLinkedText(step, undefined, linkedTargets)}</li>`).join('');
    const hints = objective.hints?.length ? `
        <aside class="u5-grand-objective__hints" aria-labelledby="${hintsLabelId}">
            <p id="${hintsLabelId}" class="u5-kicker"><i data-lucide="lightbulb" aria-hidden="true"></i> Field notes</p>
            <ul>
                ${objective.hints.map(hint => `<li><strong>${escapeUltima5AtlasHtml(hint.label)}:</strong> ${renderUltima5AtlasLinkedText(hint.text, undefined, linkedTargets)}</li>`).join('')}
            </ul>
        </aside>
    ` : '';
    const outcome = renderUltima5AtlasLinkedText(objective.outcome, undefined, linkedTargets);
    return `
        <article class="u5-grand-objective" data-u5-grand-objective="${objective.id}">
            <div class="u5-grand-objective__number" aria-hidden="true">${objectiveNumber}</div>
            <div class="u5-grand-objective__content">
                <div class="u5-grand-objective__heading">
                    <div>
                        <p class="u5-grand-objective__location"><i data-lucide="map-pin" aria-hidden="true"></i> ${location}</p>
                        <h4>${escapeUltima5AtlasHtml(objective.title)}</h4>
                    </div>
                    <button type="button" class="u5-grand-objective__complete" data-u5-grand-complete="${objective.id}" aria-pressed="false">
                        <i data-lucide="circle" aria-hidden="true"></i><span>Mark complete</span>
                    </button>
                </div>
                <p class="u5-grand-objective__summary">${summary}</p>
                <div class="u5-grand-objective__actions">
                    <button type="button" data-u5-grand-details-toggle="${objective.id}" aria-expanded="false" aria-controls="${detailsId}">
                        Next steps <i data-lucide="chevron-down" aria-hidden="true"></i>
                    </button>
                    ${objective.atlas ? `<button type="button" data-u5-grand-map="${objective.id}"><i data-lucide="map-pinned" aria-hidden="true"></i> Atlas</button>` : ''}
                </div>
                <div id="${detailsId}" class="u5-grand-objective__details" hidden>
                    <p class="u5-kicker">Exact route</p>
                    <ol>${steps}</ol>
                    ${hints}
                    <p class="u5-grand-objective__outcome"><strong>When this is done:</strong> ${outcome}</p>
                </div>
            </div>
        </article>
    `;
}

function initializeUltima5CampaignProgress() {
    const journal = document.getElementById('u5-grand-quest-journal');
    if (!journal) return;
    journal.innerHTML = ultima5GrandQuestChapters.map((chapter, chapterIndex) => {
        const bodyId = `u5-grand-chapter-${chapter.id}`;
        const objectives = chapter.objectives.map((objective, objectiveIndex) => ultima5GrandObjectiveMarkup(objective, chapterIndex, objectiveIndex)).join('');
        return `
            <li class="u5-grand-chapter" data-u5-grand-chapter="${chapter.id}">
                <button type="button" class="u5-grand-chapter__toggle" data-u5-grand-toggle="${chapter.id}" aria-expanded="${chapterIndex === 0 ? 'true' : 'false'}" aria-controls="${bodyId}">
                    <span class="u5-grand-chapter__number">${chapter.number}</span>
                    <span class="u5-grand-chapter__title">
                        <small>${escapeUltima5AtlasHtml(chapter.eyebrow)}</small>
                        <strong>${escapeUltima5AtlasHtml(chapter.title)}</strong>
                        <span>${escapeUltima5AtlasHtml(chapter.summary)}</span>
                    </span>
                    <span class="u5-grand-chapter__progress"><strong data-u5-grand-count="${chapter.id}">0/${chapter.objectives.length}</strong><small>complete</small></span>
                    <i data-lucide="chevron-down" class="u5-grand-chapter__chevron" aria-hidden="true"></i>
                </button>
                <div id="${bodyId}" class="u5-grand-chapter__body" ${chapterIndex === 0 ? '' : 'hidden'}>${objectives}</div>
            </li>
        `;
    }).join('');

    initializeUltima5CampaignInlineAtlas();

    journal.addEventListener('click', event => {
        const chapterToggle = event.target.closest('[data-u5-grand-toggle]');
        if (chapterToggle) {
            const body = document.getElementById(chapterToggle.getAttribute('aria-controls'));
            const expanded = chapterToggle.getAttribute('aria-expanded') === 'true';
            chapterToggle.setAttribute('aria-expanded', String(!expanded));
            chapterToggle.closest('.u5-grand-chapter')?.classList.toggle('is-expanded', !expanded);
            if (body) body.hidden = expanded;
            return;
        }

        const detailsToggle = event.target.closest('[data-u5-grand-details-toggle]');
        if (detailsToggle) {
            const details = document.getElementById(detailsToggle.getAttribute('aria-controls'));
            const expanded = detailsToggle.getAttribute('aria-expanded') === 'true';
            detailsToggle.setAttribute('aria-expanded', String(!expanded));
            detailsToggle.closest('.u5-grand-objective')?.classList.toggle('is-expanded', !expanded);
            if (details) details.hidden = expanded;
            detailsToggle.firstChild.textContent = expanded ? 'Next steps ' : 'Hide steps ';
            return;
        }

        const completeButton = event.target.closest('[data-u5-grand-complete]');
        if (completeButton) {
            const objective = ultima5GrandQuestChapters.flatMap(chapter => chapter.objectives)
                .find(item => item.id === completeButton.dataset.u5GrandComplete);
            if (!objective) return;
            const complete = ultima5GrandObjectiveComplete(objective, ultima5GrandProgressSets());
            setUltima5GrandObjectiveProgress(objective, !complete);
            updateUltima5CampaignProgress();
            return;
        }

        const mapButton = event.target.closest('[data-u5-grand-map]');
        if (mapButton) {
            const objective = ultima5GrandQuestChapters.flatMap(chapter => chapter.objectives)
                .find(item => item.id === mapButton.dataset.u5GrandMap);
            if (objective) openUltima5ObjectiveOnAtlas(objective);
        }
    });

    document.getElementById('u5-current-objective-action')?.addEventListener('click', event => {
        openUltima5GrandObjective(event.currentTarget.dataset.objective);
    });
    document.getElementById('u5-current-objective-map')?.addEventListener('click', event => {
        const objective = ultima5GrandQuestChapters.flatMap(chapter => chapter.objectives)
            .find(item => item.id === event.currentTarget.dataset.objective);
        if (objective) openUltima5ObjectiveOnAtlas(objective);
    });

    initializeUltima5SideQuests();
    updateUltima5CampaignProgress();
    if (window.lucide) lucide.createIcons();
}

function initializeUltima5LegacyCampaignProgress() {
    const container = document.getElementById('u5-main-quest-checkpoints');
    if (!container) return;
    const saved = normalizeUltima5MainQuestProgress(readUltima5StoredSet(ULTIMA5_PROGRESS_STORAGE_KEY));
    writeUltima5StoredSet(ULTIMA5_PROGRESS_STORAGE_KEY, saved);
    container.innerHTML = '';

    ultima5CampaignObjectives.forEach((objective, index) => {
        const row = document.createElement('div');
        row.className = 'u5-checkpoint-row u5-main-step';
        row.dataset.u5MainStep = objective.id;
        row.innerHTML = `<span class="u5-main-step__number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>`;
        const label = document.createElement('label');
        label.className = 'u5-checkpoint';
        label.innerHTML = `
            <input type="checkbox" data-u5-objective="${objective.id}" ${saved.has(objective.id) ? 'checked' : ''}>
            <span><strong>${escapeUltima5AtlasHtml(objective.title)}</strong><small>${escapeUltima5AtlasHtml(objective.detail)}</small></span>
            <span class="u5-main-step__state" data-u5-main-state>Locked</span>
        `;
        const mapButton = document.createElement('button');
        mapButton.type = 'button';
        mapButton.className = 'u5-checkpoint__map';
        mapButton.dataset.u5ObjectiveMap = objective.id;
        mapButton.setAttribute('aria-label', `Show ${objective.title} on the atlas`);
        mapButton.title = 'Show on atlas';
        mapButton.innerHTML = '<i data-lucide="map-pinned" aria-hidden="true"></i>';
        row.append(label, mapButton);
        container.appendChild(row);
    });

    container.addEventListener('change', event => {
        const input = event.target.closest('[data-u5-objective]');
        if (!input) return;
        const current = readUltima5StoredSet(ULTIMA5_PROGRESS_STORAGE_KEY);
        const objectiveIndex = ultima5CampaignObjectives.findIndex(objective => objective.id === input.dataset.u5Objective);
        if (objectiveIndex < 0) return;
        if (input.checked) {
            const nextIndex = ultima5CampaignObjectives.findIndex(objective => !current.has(objective.id));
            if (objectiveIndex === nextIndex) current.add(input.dataset.u5Objective);
        } else {
            ultima5CampaignObjectives.slice(objectiveIndex).forEach(objective => current.delete(objective.id));
        }
        writeUltima5StoredSet(ULTIMA5_PROGRESS_STORAGE_KEY, current);
            updateUltima5LegacyCampaignProgress();
    });
    container.addEventListener('click', event => {
        const button = event.target.closest('[data-u5-objective-map]');
        if (!button) return;
        const objective = ultima5CampaignObjectives.find(item => item.id === button.dataset.u5ObjectiveMap);
        if (objective) openUltima5ObjectiveOnAtlas(objective);
    });

    const objectiveAction = document.getElementById('u5-current-objective-action');
    if (objectiveAction) {
        objectiveAction.addEventListener('click', () => {
            openUltima5QuestTab(objectiveAction.dataset.tab || 'doom');
        });
    }
    const objectiveMap = document.getElementById('u5-current-objective-map');
    if (objectiveMap) {
        objectiveMap.addEventListener('click', () => {
            const objective = ultima5CampaignObjectives.find(item => item.id === objectiveMap.dataset.objective);
            if (objective) openUltima5ObjectiveOnAtlas(objective);
        });
    }

    const campaignViewButtons = [...document.querySelectorAll('[data-u5-campaign-view]')];
    campaignViewButtons.forEach((button, index) => {
        button.addEventListener('click', () => setUltima5CampaignView(button.dataset.u5CampaignView));
        button.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            const nextIndex = event.key === 'Home'
                ? 0
                : event.key === 'End'
                    ? campaignViewButtons.length - 1
                    : (index + (event.key === 'ArrowRight' ? 1 : -1) + campaignViewButtons.length) % campaignViewButtons.length;
            event.preventDefault();
            campaignViewButtons[nextIndex].focus();
            setUltima5CampaignView(campaignViewButtons[nextIndex].dataset.u5CampaignView);
        });
    });

    document.querySelectorAll('[data-u5-side-quest-link]').forEach(button => {
        button.addEventListener('click', () => {
            setUltima5CampaignView('side');
            const card = document.querySelector(`[data-u5-side-quest-card="${button.dataset.u5SideQuestLink}"]`);
            if (!card) return;
            const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
            card.scrollIntoView({ behavior, block: 'center' });
            card.querySelector('[data-u5-side-quest]')?.focus();
        });
    });

    initializeUltima5SideQuests();
    if (window.lucide) lucide.createIcons();
    updateUltima5LegacyCampaignProgress();
}

function normalizeUltima5MainQuestProgress(progress) {
    let highestCompletedIndex = -1;
    ultima5CampaignObjectives.forEach((objective, index) => {
        if (progress.has(objective.id)) highestCompletedIndex = index;
    });
    return new Set(ultima5CampaignObjectives.slice(0, highestCompletedIndex + 1).map(objective => objective.id));
}

function initializeUltima5SideQuests() {
    const container = document.getElementById('u5-side-quest-list');
    if (!container) return;
    const saved = readUltima5StoredSet(ULTIMA5_SIDEQUEST_STORAGE_KEY);
    const strategicQuestIds = new Set(['side-magic-carpet', 'side-grapple', 'side-jaana', 'side-resistance-party', 'side-skull-keys', 'side-hms-cape']);
    const optionalQuests = ultima5SideQuests.filter(quest => !strategicQuestIds.has(quest.id));
    const groupedQuests = new Map();
    container.innerHTML = '';

    optionalQuests.forEach(quest => {
        const recommendedChapter = ultima5GrandQuestChapters.find(chapter => chapter.objectives.some(objective => objective.progress.some(item => item.store === 'main' && item.id === quest.recommendedBefore)));
        if (!groupedQuests.has(recommendedChapter.id)) groupedQuests.set(recommendedChapter.id, { chapter: recommendedChapter, quests: [] });
        groupedQuests.get(recommendedChapter.id).quests.push(quest);
    });

    const orderedGroups = Array.from(groupedQuests.values()).sort((first, second) => first.chapter.number.localeCompare(second.chapter.number));
    let sequence = 0;

    orderedGroups.forEach(({ chapter, quests }) => {
        const group = document.createElement('section');
        const groupHeadingId = `u5-side-quest-group-${chapter.id}`;
        group.className = 'u5-side-quest-group';
        group.setAttribute('aria-labelledby', groupHeadingId);
        group.innerHTML = `
            <header class="u5-side-quest-group__header">
                <div>
                    <p class="u5-kicker">Prepare before Grand Quest ${chapter.number}</p>
                    <h4 id="${groupHeadingId}">${escapeUltima5AtlasHtml(chapter.title)}</h4>
                </div>
                <p>${escapeUltima5AtlasHtml(ultima5SideQuestGroupRationales[chapter.id])}</p>
            </header>
            <div class="u5-side-quest-list"></div>
        `;
        const questList = group.querySelector('.u5-side-quest-list');

        quests.sort((first, second) => first.usefulnessRank - second.usefulnessRank).forEach(quest => {
            sequence += 1;
            const linkedTargets = new Set();
            const detail = renderUltima5AtlasLinkedText(quest.detail, quest.detailAtlasLinks, linkedTargets);
            const location = renderUltima5AtlasLinkedText(quest.location, undefined, linkedTargets);
            const card = document.createElement('article');
            card.className = 'u5-side-quest-card';
            card.dataset.u5SideQuestCard = quest.id;
            card.innerHTML = `
                <div class="u5-side-quest-card__topline">
                    <span>${String(sequence).padStart(2, '0')}</span>
                    <small>${escapeUltima5AtlasHtml(quest.category)}</small>
                </div>
                <div class="u5-side-quest-card__heading">
                    <div>
                        <h5>${escapeUltima5AtlasHtml(quest.title)}</h5>
                        <p><i data-lucide="map-pin" aria-hidden="true"></i> ${location}</p>
                    </div>
                    <label class="u5-side-quest-check" title="Mark side quest complete">
                        <input type="checkbox" data-u5-side-quest="${quest.id}" aria-label="Mark ${escapeUltima5AtlasHtml(quest.title)} complete" ${saved.has(quest.id) ? 'checked' : ''}>
                        <span><i data-lucide="check" aria-hidden="true"></i></span>
                    </label>
                </div>
                <p class="u5-side-quest-card__copy">${detail}</p>
                <footer>
                    <span><strong>Reward:</strong> ${escapeUltima5AtlasHtml(quest.reward)}</span>
                    <button type="button" data-u5-side-quest-map="${quest.id}"><i data-lucide="map-pinned" aria-hidden="true"></i> Atlas</button>
                </footer>
            `;
            questList.appendChild(card);
        });

        container.appendChild(group);
    });

    container.addEventListener('change', event => {
        const input = event.target.closest('[data-u5-side-quest]');
        if (!input) return;
        const current = readUltima5StoredSet(ULTIMA5_SIDEQUEST_STORAGE_KEY);
        if (input.checked) current.add(input.dataset.u5SideQuest);
        else current.delete(input.dataset.u5SideQuest);
        writeUltima5StoredSet(ULTIMA5_SIDEQUEST_STORAGE_KEY, current);
        updateUltima5SideQuestProgress();
    });
    container.addEventListener('click', event => {
        const button = event.target.closest('[data-u5-side-quest-map]');
        if (!button) return;
        const quest = ultima5SideQuests.find(item => item.id === button.dataset.u5SideQuestMap);
        if (quest) openUltima5ObjectiveOnAtlas(quest);
    });
    updateUltima5SideQuestProgress();
}

function updateUltima5SideQuestProgress() {
    const completed = readUltima5StoredSet(ULTIMA5_SIDEQUEST_STORAGE_KEY);
    const strategicQuestIds = new Set(['side-magic-carpet', 'side-grapple', 'side-jaana', 'side-resistance-party', 'side-skull-keys', 'side-hms-cape']);
    const optionalQuests = ultima5SideQuests.filter(quest => !strategicQuestIds.has(quest.id));
    const completeCount = optionalQuests.filter(quest => completed.has(quest.id)).length;
    const percent = optionalQuests.length ? Math.round(completeCount / optionalQuests.length * 100) : 0;
    const percentOutput = document.getElementById('u5-side-quest-percent');
    const totalOutput = document.getElementById('u5-side-quest-total-label');
    if (percentOutput) percentOutput.textContent = `${percent}%`;
    if (totalOutput) totalOutput.textContent = `${completeCount} of ${optionalQuests.length} optional jobs complete`;
    document.querySelectorAll('[data-u5-side-quest-card]').forEach(card => {
        card.classList.toggle('is-complete', completed.has(card.dataset.u5SideQuestCard));
    });
}

function setUltima5CampaignView(view) {
    const selectedView = view === 'side' ? 'side' : 'main';
    document.querySelectorAll('[data-u5-campaign-view]').forEach(button => {
        const active = button.dataset.u5CampaignView === selectedView;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
        button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll('.u5-campaign-view').forEach(panel => {
        const active = panel.id === `u5-${selectedView}-quest-view`;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
    });
}

function renderUltima5AtlasLinkedText(value, links, usedTargets = new Set()) {
    const source = String(value ?? '');
    const candidates = Array.isArray(links) && links.length
        ? links
        : Object.entries(ultima5InlineAtlasTargets).flatMap(([target, entry]) => (
            entry.terms.map(label => ({ label, target }))
        ));
    const matchingLinks = candidates
        .filter(link => source.includes(link.label) && ultima5InlineAtlasTargets[link.target] && !usedTargets.has(link.target))
        .sort((first, second) => second.label.length - first.label.length);
    if (!matchingLinks.length) return escapeUltima5AtlasHtml(source);

    const targetByLabel = new Map(matchingLinks.map(link => [link.label, link.target]));
    const pattern = new RegExp(matchingLinks.map(link => link.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    let cursor = 0;
    let markup = '';
    source.replace(pattern, (label, offset) => {
        markup += escapeUltima5AtlasHtml(source.slice(cursor, offset));
        const targetId = targetByLabel.get(label);
        const target = ultima5InlineAtlasTargets[targetId];
        const safeLabel = escapeUltima5AtlasHtml(label);
        if (usedTargets.has(targetId)) {
            markup += safeLabel;
            cursor = offset + label.length;
            return label;
        }
        const safeTargetId = escapeUltima5AtlasHtml(targetId);
        const accessibleLabel = escapeUltima5AtlasHtml(target.label);
        markup += `<button type="button" class="u5-inline-atlas-link" data-u5-inline-atlas="${safeTargetId}" aria-label="Show ${accessibleLabel} in the Atlas" title="Show ${accessibleLabel} in the Atlas">${safeLabel}<i data-lucide="map-pin" aria-hidden="true"></i></button>`;
        usedTargets.add(targetId);
        cursor = offset + label.length;
        return label;
    });
    return markup + escapeUltima5AtlasHtml(source.slice(cursor));
}

function initializeUltima5CampaignInlineAtlas() {
    const campaign = document.getElementById('quests');
    if (!campaign) return;
    const linkedTargets = new Set();
    campaign.querySelectorAll('[data-u5-atlas-text]').forEach(element => {
        element.innerHTML = renderUltima5AtlasLinkedText(element.textContent, undefined, linkedTargets);
    });
    if (campaign.dataset.u5InlineAtlasBound === 'true') return;
    campaign.dataset.u5InlineAtlasBound = 'true';
    campaign.addEventListener('click', event => {
        const button = event.target.closest('[data-u5-inline-atlas]');
        if (button) openUltima5InlineAtlasTarget(button.dataset.u5InlineAtlas);
    });
}

function updateUltima5CampaignProgress() {
    const progressByStore = ultima5GrandProgressSets();
    const objectives = ultima5GrandQuestChapters.flatMap((chapter, chapterIndex) => chapter.objectives.map(objective => ({ objective, chapter, chapterIndex })));
    const completedObjectives = objectives.filter(({ objective }) => ultima5GrandObjectiveComplete(objective, progressByStore));
    const total = objectives.length;
    const percent = total ? Math.round(completedObjectives.length / total * 100) : 0;
    const next = objectives.find(({ objective }) => !ultima5GrandObjectiveComplete(objective, progressByStore));

    const percentOutput = document.getElementById('u5-campaign-percent');
    const totalLabel = document.getElementById('u5-campaign-total-label');
    const overviewLabel = document.getElementById('u5-overview-progress-label');
    if (percentOutput) percentOutput.textContent = `${percent}%`;
    if (totalLabel) totalLabel.textContent = `${completedObjectives.length} of ${total} route objectives`;
    if (overviewLabel) overviewLabel.textContent = `${completedObjectives.length} of ${total} Grand Quest objectives complete`;

    ultima5GrandQuestChapters.forEach((chapter, chapterIndex) => {
        const chapterComplete = chapter.objectives.filter(objective => ultima5GrandObjectiveComplete(objective, progressByStore)).length;
        const panel = document.querySelector(`[data-u5-grand-chapter="${chapter.id}"]`);
        const current = next?.chapter.id === chapter.id;
        panel?.classList.toggle('is-current', current);
        panel?.classList.toggle('is-complete', chapterComplete === chapter.objectives.length);
        const count = panel?.querySelector(`[data-u5-grand-count="${chapter.id}"]`);
        if (count) count.textContent = `${chapterComplete}/${chapter.objectives.length}`;
        document.querySelectorAll(`[data-u5-chapter-count="${chapter.id}"]`).forEach(output => {
            output.textContent = `${chapterComplete}/${chapter.objectives.length}`;
            output.closest('.u5-campaign-card')?.classList.toggle('is-complete', chapterComplete === chapter.objectives.length);
        });
        if (current && chapterIndex === 0) panel?.classList.add('is-expanded');
    });

    objectives.forEach(({ objective }) => {
        const complete = ultima5GrandObjectiveComplete(objective, progressByStore);
        const card = document.querySelector(`[data-u5-grand-objective="${objective.id}"]`);
        const button = card?.querySelector('[data-u5-grand-complete]');
        card?.classList.toggle('is-complete', complete);
        card?.classList.toggle('is-current', next?.objective.id === objective.id);
        if (button) {
            button.setAttribute('aria-pressed', String(complete));
            button.innerHTML = complete
                ? '<i data-lucide="check-circle-2" aria-hidden="true"></i><span>Completed</span>'
                : '<i data-lucide="circle" aria-hidden="true"></i><span>Mark complete</span>';
        }
    });

    const chapterOutput = document.getElementById('u5-current-objective-chapter');
    const title = document.getElementById('u5-current-objective-title');
    const copy = document.getElementById('u5-current-objective-copy');
    const action = document.getElementById('u5-current-objective-action');
    const mapAction = document.getElementById('u5-current-objective-map');
    if (next) {
        if (chapterOutput) chapterOutput.textContent = `Grand Quest ${next.chapter.number} · ${next.chapter.title}`;
        if (title) title.textContent = next.objective.title;
        if (copy) copy.innerHTML = renderUltima5AtlasLinkedText(next.objective.summary);
        if (action) {
            action.dataset.objective = next.objective.id;
            action.innerHTML = 'Open next steps <i data-lucide="arrow-right" aria-hidden="true"></i>';
        }
        if (mapAction) {
            mapAction.dataset.objective = next.objective.id;
            mapAction.hidden = !next.objective.atlas;
        }
    } else {
        if (chapterOutput) chapterOutput.textContent = 'Grand Quest complete';
        if (title) title.textContent = 'Britannia is free';
        if (copy) copy.textContent = 'Every strategic and decisive objective is complete.';
        if (action) {
            action.dataset.objective = 'doom-rescue';
            action.innerHTML = 'Revisit the finale <i data-lucide="rotate-ccw" aria-hidden="true"></i>';
        }
        if (mapAction) {
            mapAction.dataset.objective = 'doom-rescue';
            mapAction.hidden = false;
        }
    }
    updateUltima5SideQuestProgress();
    if (window.lucide) lucide.createIcons();
}

function openUltima5GrandObjective(objectiveId) {
    const chapter = ultima5GrandQuestChapters.find(entry => entry.objectives.some(objective => objective.id === objectiveId));
    if (!chapter) return;
    showUltima5Section('quests');
    const chapterPanel = document.querySelector(`[data-u5-grand-chapter="${chapter.id}"]`);
    const chapterToggle = chapterPanel?.querySelector('[data-u5-grand-toggle]');
    const chapterBody = chapterToggle ? document.getElementById(chapterToggle.getAttribute('aria-controls')) : null;
    if (chapterToggle) chapterToggle.setAttribute('aria-expanded', 'true');
    if (chapterBody) chapterBody.hidden = false;
    chapterPanel?.classList.add('is-expanded');

    const objectiveCard = document.querySelector(`[data-u5-grand-objective="${objectiveId}"]`);
    const detailsToggle = objectiveCard?.querySelector('[data-u5-grand-details-toggle]');
    const details = detailsToggle ? document.getElementById(detailsToggle.getAttribute('aria-controls')) : null;
    if (detailsToggle) {
        detailsToggle.setAttribute('aria-expanded', 'true');
        detailsToggle.firstChild.textContent = 'Hide steps ';
    }
    if (details) details.hidden = false;
    objectiveCard?.classList.add('is-expanded');
    objectiveCard?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    detailsToggle?.focus({ preventScroll: true });
}

function updateUltima5LegacyCampaignProgress() {
    const completed = readUltima5StoredSet(ULTIMA5_PROGRESS_STORAGE_KEY);
    const completeCount = ultima5CampaignObjectives.filter(objective => completed.has(objective.id)).length;
    const total = ultima5CampaignObjectives.length;
    const percent = total ? Math.round(completeCount / total * 100) : 0;
    const percentOutput = document.getElementById('u5-campaign-percent');
    const totalLabel = document.getElementById('u5-campaign-total-label');
    const overviewLabel = document.getElementById('u5-overview-progress-label');
    if (percentOutput) percentOutput.textContent = `${percent}%`;
    if (totalLabel) totalLabel.textContent = `${completeCount} of ${total} main quests`;
    if (overviewLabel) overviewLabel.textContent = `${completeCount} of ${total} decisive objectives complete`;

    ['shrines', 'shadowlords', 'regalia', 'doom'].forEach(chapter => {
        const chapterObjectives = ultima5CampaignObjectives.filter(objective => objective.chapter === chapter);
        const chapterComplete = chapterObjectives.filter(objective => completed.has(objective.id)).length;
        document.querySelectorAll(`[data-u5-chapter-count="${chapter}"]`).forEach(output => {
            output.textContent = `${chapterComplete}/${chapterObjectives.length}`;
            output.closest('.u5-campaign-card')?.classList.toggle('is-complete', chapterComplete === chapterObjectives.length);
            output.closest('.u5-act-tab')?.classList.toggle('is-complete', chapterComplete === chapterObjectives.length);
        });
    });

    const nextIndex = ultima5CampaignObjectives.findIndex(objective => !completed.has(objective.id));
    const next = nextIndex >= 0 ? ultima5CampaignObjectives[nextIndex] : null;
    document.querySelectorAll('[data-u5-main-step]').forEach((row, index) => {
        const objective = ultima5CampaignObjectives[index];
        const complete = completed.has(objective.id);
        const current = index === nextIndex;
        const locked = nextIndex >= 0 && index > nextIndex;
        const input = row.querySelector('[data-u5-objective]');
        const state = row.querySelector('[data-u5-main-state]');
        row.classList.toggle('is-complete', complete);
        row.classList.toggle('is-current', current);
        row.classList.toggle('is-locked', locked);
        if (input) {
            input.checked = complete;
            input.disabled = locked;
            input.setAttribute('aria-label', `${objective.title}: ${complete ? 'complete' : current ? 'current quest' : 'locked'}`);
        }
        if (state) state.textContent = complete ? 'Complete' : current ? 'Current' : 'Locked';
    });

    const title = document.getElementById('u5-current-objective-title');
    const copy = document.getElementById('u5-current-objective-copy');
    const action = document.getElementById('u5-current-objective-action');
    const mapAction = document.getElementById('u5-current-objective-map');
    if (!title || !copy || !action) return;
    if (next) {
        title.textContent = next.title;
        copy.textContent = ultima5ObjectiveGuidance[next.id] || next.detail;
        action.dataset.tab = next.chapter;
        if (mapAction) {
            mapAction.dataset.objective = next.id;
            mapAction.hidden = !next.atlas;
        }
        action.innerHTML = 'Open this chapter <i data-lucide="arrow-right" aria-hidden="true"></i>';
    } else {
        title.textContent = 'Britannia is free';
        copy.textContent = 'Every decisive objective is complete. The resistance has become a restoration.';
        action.dataset.tab = 'doom';
        if (mapAction) {
            mapAction.dataset.objective = 'doom-rescue';
            mapAction.hidden = false;
        }
        action.innerHTML = 'Revisit the finale <i data-lucide="rotate-ccw" aria-hidden="true"></i>';
    }
    if (window.lucide) lucide.createIcons();
}

function openUltima5QuestTab(tabId, { activateSection = true } = {}) {
    if (activateSection) showUltima5Section('quests');
    const chapter = ultima5GrandQuestChapters.find(entry => entry.id === tabId) || ultima5GrandQuestChapters[0];
    const progressByStore = ultima5GrandProgressSets();
    const firstIncomplete = chapter.objectives.find(objective => !ultima5GrandObjectiveComplete(objective, progressByStore))
        || chapter.objectives[0];
    openUltima5GrandObjective(firstIncomplete.id);
}

// Set up event listeners
function setupEventListeners() {
    document.querySelectorAll('.quest-tab-button, .ref-tab-button').forEach(button => {
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
    });

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showUltima5Section(targetId);
        });
    });

    document.querySelectorAll('[data-u5-section]').forEach(control => {
        control.addEventListener('click', () => showUltima5Section(control.dataset.u5Section));
    });

    document.querySelectorAll('[data-u5-grand-target]').forEach(control => {
        control.addEventListener('click', () => openUltima5GrandObjective(control.dataset.u5GrandTarget));
    });

    document.querySelectorAll('[data-u5-quest-tab]').forEach(control => {
        control.addEventListener('click', () => openUltima5QuestTab(control.dataset.u5QuestTab));
    });
    
    // Quest tab buttons
    document.querySelectorAll('.quest-tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            openUltima5QuestTab(tabId, { activateSection: false });
        });
        button.addEventListener('keydown', function(event) {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            const buttons = [...this.closest('[role="tablist"]').querySelectorAll('.quest-tab-button')];
            const currentIndex = buttons.indexOf(this);
            const nextIndex = event.key === 'Home'
                ? 0
                : event.key === 'End'
                    ? buttons.length - 1
                    : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
            event.preventDefault();
            buttons[nextIndex].focus();
            openUltima5QuestTab(buttons[nextIndex].dataset.tab, { activateSection: false });
        });
    });
    
    // Reference tab buttons
    document.querySelectorAll('.ref-tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.ref-tab-button').forEach(btn => {
                const active = btn === this;
                btn.classList.toggle('active', active);
                btn.setAttribute('aria-selected', active ? 'true' : 'false');
            });

            // Show target tab content
            document.querySelectorAll('.ref-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Stat filter buttons
    document.querySelectorAll('.stat-filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            const stat = this.getAttribute('data-stat');
            
            // Update active button
            document.querySelectorAll('.stat-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update chart
            updateChart(stat);
        });
    });
    
    // Search functionality for companion table
    const companionSearch = document.getElementById('companion-search');
    if (companionSearch) {
        companionSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#companion-table-body tr');

            rows.forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Search functionality for spell table
    const spellSearch = document.getElementById('spell-search');
    if (spellSearch) {
        spellSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#spell-table-body tr');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                let found = false;
                
                cells.forEach(cell => {
                    if (cell.textContent.toLowerCase().includes(searchTerm)) {
                        found = true;
                    }
                });
                
                row.style.display = found ? '' : 'none';
            });
        });
    }
    
    // Search functionality for word table
    const wordSearch = document.getElementById('word-search');
    if (wordSearch) {
        wordSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#word-table-body tr');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                let found = false;
                
                cells.forEach(cell => {
                    if (cell.textContent.toLowerCase().includes(searchTerm)) {
                        found = true;
                    }
                });
                
                row.style.display = found ? '' : 'none';
            });
        });
    }
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            const nav = document.getElementById('main-nav');
            if (nav) {
                nav.classList.toggle('hidden');
                nav.classList.toggle('block');
            }
        });
    }

    // Seer AI: bind ask button if present
    const askSeerBtn = document.getElementById('ask-seer');
    if (askSeerBtn) {
        askSeerBtn.addEventListener('click', askTheSeer);
    }
}

function showUltima5Section(targetId) {
    const target = document.getElementById(targetId);
    if (!target || !target.classList.contains('content-section')) return;

    document.querySelectorAll('.nav-link').forEach(navLink => {
        const active = navLink.getAttribute('href') === `#${targetId}`;
        navLink.classList.toggle('active', active);
        if (active) navLink.setAttribute('aria-current', 'page');
        else navLink.removeAttribute('aria-current');
    });
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === targetId);
    });
    window.history.replaceState(null, '', `#${targetId}`);

    const navigation = document.getElementById('main-nav');
    if (navigation) {
        const navigationTop = (document.querySelector('.u5-backbar')?.offsetHeight || 0)
            + (document.querySelector('.u5-masthead')?.offsetHeight || 0);
        if (window.scrollY > navigationTop + 12) {
            window.scrollTo({ top: navigationTop, behavior: 'auto' });
        }
    }

    if (targetId === 'atlas') {
        ensureUltima5Atlas();
        window.setTimeout(() => {
            if (ultima5AtlasState.map) ultima5AtlasState.map.invalidateSize();
        }, 60);
    }
}

function initializeUltima5AtlasShell() {
    const config = window.ULTIMA5_ATLAS_CONFIG;
    const count = document.getElementById('ultima5-atlas-marker-count');
    if (count && config && Array.isArray(config.markers)) {
        count.textContent = String(config.markers.length).padStart(2, '0');
    }
    const interiorCount = document.getElementById('ultima5-atlas-interior-count');
    const floorCount = document.getElementById('ultima5-atlas-floor-count');
    if (interiorCount && Array.isArray(config?.interiors)) {
        interiorCount.textContent = String(config.interiors.length).padStart(2, '0');
    }
    if (floorCount && Array.isArray(config?.interiors)) {
        floorCount.textContent = String(config.interiors.reduce((total, interior) => total + (interior.floors?.length || 0), 0));
    }

    const sectionLink = document.querySelector('.u5-atlas__quest-link');
    if (sectionLink) {
        sectionLink.addEventListener('click', event => {
            event.preventDefault();
            showUltima5Section('quests');
        });
    }

    const initialSection = window.location.hash.slice(1);
    if (initialSection && document.getElementById(initialSection)?.classList.contains('content-section')) {
        const activateInitialSection = () => {
            showUltima5Section(initialSection);
            const navigationTop = (document.querySelector('.u5-backbar')?.offsetHeight || 0)
                + (document.querySelector('.u5-masthead')?.offsetHeight || 0);
            window.scrollTo({ top: navigationTop, behavior: 'auto' });
        };
        if (document.readyState === 'complete') activateInitialSection();
        else window.addEventListener('load', activateInitialSection, { once: true });
    }
}

function escapeUltima5AtlasHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getUltima5AtlasStyle(markerData) {
    return ULTIMA5_ATLAS_MARKER_STYLES[markerData?.type] || ULTIMA5_ATLAS_MARKER_STYLES.default;
}

function ultima5Coordinate(value) {
    const clamped = Math.min(Math.max(Math.floor(value), 0), 255);
    return clamped.toString(16).padStart(2, '0').toUpperCase().replace(/[0-9A-F]/g, digit => {
        return String.fromCharCode('A'.charCodeAt(0) + parseInt(digit, 16));
    });
}

function ultima5MarkerLatLng(markerData) {
    const size = Number(window.ULTIMA5_ATLAS_CONFIG?.worldSize) || 256;
    const x = markerData.position.x;
    const y = markerData.position.y;
    return L.latLng(size - y - 0.5, x + 0.5);
}

function buildUltima5MarkerIcon(markerData, active = false) {
    const style = getUltima5AtlasStyle(markerData);
    return L.divIcon({
        className: `ultima5-marker${active ? ' ultima5-marker--active' : ''}`,
        html: `<span class="ultima5-marker__pin" style="background:${style.color}"><span>${style.symbol}</span></span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -23]
    });
}

function ultima5InteriorLatLng(position, floor) {
    const height = Number(floor?.height) || 32;
    return L.latLng(height - position.y - 0.5, position.x + 0.5);
}

function buildUltima5InteriorIcon(kind, symbol) {
    return L.divIcon({
        className: `ultima5-interior-marker ultima5-interior-marker--${kind}`,
        html: `<span>${escapeUltima5AtlasHtml(symbol)}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -12]
    });
}

function buildUltima5Popup(markerData) {
    const style = getUltima5AtlasStyle(markerData);
    const { x, y } = markerData.position;
    const coordinate = `${ultima5Coordinate(y)} ${ultima5Coordinate(x)}`;
    return `
        <article class="u5-atlas-popup">
            <h4>${escapeUltima5AtlasHtml(markerData.name)}</h4>
            <p>${escapeUltima5AtlasHtml(markerData.description || '')}</p>
            <p class="u5-atlas-popup__meta">${escapeUltima5AtlasHtml(style.label)} · ${coordinate} · tile ${x}, ${y}</p>
            ${markerData.interiorId ? `<button type="button" class="u5-atlas-popup__enter" data-u5-enter-interior="${escapeUltima5AtlasHtml(markerData.interiorId)}">Enter ${escapeUltima5AtlasHtml(markerData.name)}</button>` : ''}
            <br><a href="#quests" class="u5-atlas-popup__quest" data-u5-open-quests>Open quest log</a>
        </article>
    `;
}

function setUltima5AtlasActiveEntry(entry) {
    if (ultima5AtlasState.activeEntry && ultima5AtlasState.activeEntry !== entry) {
        const previous = ultima5AtlasState.activeEntry;
        previous.leafletMarker.setIcon(buildUltima5MarkerIcon(previous.markerData, false));
    }
    ultima5AtlasState.activeEntry = entry || null;
    if (entry) entry.leafletMarker.setIcon(buildUltima5MarkerIcon(entry.markerData, true));
}

function ensureUltima5Atlas() {
    const container = document.getElementById('ultima5-map');
    const config = window.ULTIMA5_ATLAS_CONFIG;
    if (!container || !config || typeof L === 'undefined') return;

    if (ultima5AtlasState.map) {
        ultima5AtlasState.map.invalidateSize();
        return;
    }

    const worldSize = Number(config.worldSize) || 256;
    const bounds = L.latLngBounds([0, 0], [worldSize, worldSize]);
    const map = L.map(container, {
        crs: L.CRS.Simple,
        minZoom: -1.5,
        maxZoom: 5,
        zoomSnap: 0.25,
        wheelPxPerZoomLevel: 85,
        attributionControl: false,
        maxBoundsViscosity: 0.8
    });
    map.setMaxBounds(bounds.pad(0.02));
    ultima5AtlasState.map = map;
    ultima5AtlasState.markerLayer = L.layerGroup().addTo(map);

    ultima5AtlasState.entries = (config.markers || []).map(markerData => {
        if (!markerData?.position || typeof markerData.position.x !== 'number' || typeof markerData.position.y !== 'number') {
            return null;
        }
        const leafletMarker = L.marker(ultima5MarkerLatLng(markerData), {
            title: markerData.name,
            icon: buildUltima5MarkerIcon(markerData)
        });
        leafletMarker.bindPopup(buildUltima5Popup(markerData), {
            autoPan: true,
            autoPanPadding: L.point(28, 28),
            maxWidth: 310
        });
        leafletMarker.on('add', () => {
            const markerElement = leafletMarker.getElement();
            if (!markerElement) return;
            markerElement.setAttribute('aria-label', markerData.name);
            markerElement.setAttribute('title', markerData.name);
        });
        const entry = { markerData, leafletMarker };
        leafletMarker.on('popupopen', () => setUltima5AtlasActiveEntry(entry));
        return entry;
    }).filter(Boolean);

    map.on('mousemove', event => updateUltima5AtlasCoordinates(event.latlng));
    map.on('mouseout', () => {
        const output = document.getElementById('ultima5-map-coordinates');
        if (output) output.textContent = 'Move across the map to read U5 coordinates.';
    });
    container.addEventListener('click', event => {
        const floorButton = event.target.closest('[data-u5-go-floor]');
        if (floorButton && ultima5AtlasState.currentInterior) {
            map.closePopup();
            openUltima5Interior(ultima5AtlasState.currentInterior.id, floorButton.dataset.u5GoFloor, { resetView: true });
            return;
        }
        const enterButton = event.target.closest('[data-u5-enter-interior]');
        if (enterButton) {
            map.closePopup();
            openUltima5Interior(enterButton.dataset.u5EnterInterior, null, { resetView: true });
            return;
        }
        const questLink = event.target.closest('[data-u5-open-quests]');
        if (!questLink) return;
        event.preventDefault();
        map.closePopup();
        showUltima5Section('quests');
    });

    bindUltima5AtlasControls();
    switchUltima5AtlasLayer('surface', { resetView: true });
    window.setTimeout(() => map.invalidateSize(), 75);
}

function updateUltima5AtlasCoordinates(latlng) {
    const config = window.ULTIMA5_ATLAS_CONFIG;
    const output = document.getElementById('ultima5-map-coordinates');
    if (!config || !output) return;
    const size = ultima5AtlasState.viewMode === 'interior'
        ? Number(ultima5AtlasState.currentFloor?.width) || 32
        : Number(config.worldSize) || 256;
    const height = ultima5AtlasState.viewMode === 'interior'
        ? Number(ultima5AtlasState.currentFloor?.height) || size
        : size;
    const x = Math.min(Math.max(Math.floor(latlng.lng), 0), size - 1);
    const y = Math.min(Math.max(Math.floor(height - latlng.lat), 0), height - 1);
    output.textContent = ultima5AtlasState.viewMode === 'world'
        ? `U5 ${ultima5Coordinate(y)} ${ultima5Coordinate(x)} · tile x ${x}, y ${y}`
        : `${ultima5AtlasState.currentInterior?.name || 'Interior'} · tile x ${x}, y ${y}`;
}

function bindUltima5AtlasControls() {
    if (ultima5AtlasState.controlsBound) return;
    const layerSelect = document.getElementById('ultima5-map-layer');
    const floorSelect = document.getElementById('ultima5-map-floor');
    const npcTimeSelect = document.getElementById('ultima5-npc-time');
    const searchInput = document.getElementById('ultima5-map-search');
    const clearButton = document.getElementById('ultima5-map-search-clear');
    const searchField = searchInput?.closest('.u5-atlas__field--search');
    if (!layerSelect || !floorSelect || !npcTimeSelect || !searchInput || !clearButton || !searchField) return;

    const config = window.ULTIMA5_ATLAS_CONFIG;
    const interiorGroup = document.createElement('optgroup');
    interiorGroup.label = 'Enterable locations';
    (config?.interiors || []).forEach(interior => {
        const option = document.createElement('option');
        option.value = `interior:${interior.id}`;
        option.textContent = interior.type === 'dungeon' ? `Dungeon ${interior.name}` : interior.name;
        interiorGroup.appendChild(option);
    });
    layerSelect.appendChild(interiorGroup);
    for (let hour = 0; hour < 24; hour += 1) {
        const option = document.createElement('option');
        option.value = String(hour);
        const suffix = hour === 0 ? ' · midnight' : hour === 6 ? ' · dawn' : hour === 12 ? ' · noon' : hour === 18 ? ' · evening' : '';
        option.textContent = `${String(hour).padStart(2, '0')}:00${suffix}`;
        option.selected = hour === ultima5AtlasState.currentHour;
        npcTimeSelect.appendChild(option);
    }

    const resultsPanel = document.createElement('div');
    resultsPanel.className = 'u5-atlas__search-results';
    resultsPanel.hidden = true;
    resultsPanel.setAttribute('role', 'listbox');
    searchField.appendChild(resultsPanel);

    layerSelect.addEventListener('change', () => {
        if (layerSelect.value.startsWith('interior:')) {
            openUltima5Interior(layerSelect.value.slice('interior:'.length), null, { resetView: true });
        } else {
            switchUltima5AtlasLayer(layerSelect.value, { resetView: true });
        }
        clearUltima5AtlasSearch(false);
    });
    floorSelect.addEventListener('change', () => {
        if (ultima5AtlasState.currentInterior) {
            openUltima5Interior(ultima5AtlasState.currentInterior.id, floorSelect.value, { resetView: true });
        }
    });
    npcTimeSelect.addEventListener('change', () => {
        ultima5AtlasState.currentHour = Number(npcTimeSelect.value) || 0;
        renderUltima5InteriorMarkers();
        if (ultima5AtlasState.currentInterior) renderUltima5InteriorLegend(ultima5AtlasState.currentInterior);
    });
    document.getElementById('ultima5-atlas-back')?.addEventListener('click', () => {
        const marker = ultima5AtlasState.entries.find(entry => entry.markerData.interiorId === ultima5AtlasState.currentInterior?.id);
        switchUltima5AtlasLayer(marker?.markerData.layer || 'surface', { resetView: true });
        if (marker) focusUltima5AtlasEntry(marker);
    });
    searchInput.addEventListener('input', () => renderUltima5AtlasSearch(searchInput.value));
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter' && ultima5AtlasState.searchResults.length) {
            event.preventDefault();
            focusUltima5AtlasEntry(ultima5AtlasState.searchResults[0]);
        }
        if (event.key === 'Escape') clearUltima5AtlasSearch(true);
    });
    clearButton.addEventListener('click', () => clearUltima5AtlasSearch(true));
    document.addEventListener('click', event => {
        if (!searchField.contains(event.target)) resultsPanel.hidden = true;
    });

    ultima5AtlasState.controlsBound = true;
}

function switchUltima5AtlasLayer(layerId, { resetView = false } = {}) {
    const config = window.ULTIMA5_ATLAS_CONFIG;
    const map = ultima5AtlasState.map;
    if (!config || !map) return;
    const layerConfig = (config.layers || []).find(layer => layer.id === layerId) || config.layers?.[0];
    if (!layerConfig) return;

    const worldSize = Number(config.worldSize) || 256;
    const bounds = L.latLngBounds([0, 0], [worldSize, worldSize]);
    map.setMaxBounds(bounds.pad(0.02));
    if (ultima5AtlasState.overlay) map.removeLayer(ultima5AtlasState.overlay);
    ultima5AtlasState.overlay = L.imageOverlay(layerConfig.imageUrl, bounds, {
        alt: `Ultima V ${layerConfig.name} map`,
        interactive: false
    }).addTo(map);
    ultima5AtlasState.overlay.bringToBack();
    ultima5AtlasState.currentLayer = layerConfig.id;
    ultima5AtlasState.viewMode = 'world';
    ultima5AtlasState.currentInterior = null;
    ultima5AtlasState.currentFloor = null;

    ultima5AtlasState.markerLayer.clearLayers();
    ultima5AtlasState.entries.forEach(entry => {
        if (entry.markerData.layer === layerConfig.id) {
            entry.leafletMarker.setIcon(buildUltima5MarkerIcon(entry.markerData));
            ultima5AtlasState.markerLayer.addLayer(entry.leafletMarker);
        }
    });
    setUltima5AtlasActiveEntry(null);

    const layerSelect = document.getElementById('ultima5-map-layer');
    const floorField = document.getElementById('ultima5-floor-field');
    const npcTimeField = document.getElementById('ultima5-npc-time-field');
    const backButton = document.getElementById('ultima5-atlas-back');
    const viewTitle = document.getElementById('ultima5-atlas-view-title');
    const download = document.getElementById('ultima5-map-download');
    const summary = document.getElementById('ultima5-atlas-layer-summary');
    if (layerSelect) layerSelect.value = layerConfig.id;
    if (floorField) floorField.hidden = true;
    if (npcTimeField) npcTimeField.hidden = true;
    if (backButton) backButton.hidden = true;
    if (viewTitle) viewTitle.textContent = layerConfig.name;
    if (download) download.href = layerConfig.imageUrl;
    if (summary) {
        summary.textContent = layerConfig.id === 'surface'
            ? 'Cities, keeps, shrines, moongates, and hidden resources across Britannia.'
            : 'Dungeon connections, the three shards, Lord British’s Amulet, Ararat, and Doom.';
    }
    renderUltima5AtlasLegend(layerConfig.id);
    if (resetView) map.fitBounds(bounds, { animate: false, padding: [8, 8] });
}

function openUltima5Interior(interiorId, floorId = null, { resetView = true } = {}) {
    const config = window.ULTIMA5_ATLAS_CONFIG;
    const map = ultima5AtlasState.map;
    if (!config || !map) return;
    const interior = (config.interiors || []).find(item => item.id === interiorId);
    if (!interior || !interior.floors?.length) return;
    const floor = interior.floors.find(item => String(item.id) === String(floorId)) || interior.floors[0];
    const width = Number(floor.width) || 32;
    const height = Number(floor.height) || width;
    const bounds = L.latLngBounds([0, 0], [height, width]);

    if (ultima5AtlasState.overlay) map.removeLayer(ultima5AtlasState.overlay);
    ultima5AtlasState.markerLayer.clearLayers();
    setUltima5AtlasActiveEntry(null);
    ultima5AtlasState.overlay = L.imageOverlay(floor.imageUrl, bounds, {
        alt: `Ultima V ${interior.name}, ${floor.label} map`,
        interactive: false
    }).addTo(map);
    ultima5AtlasState.overlay.bringToBack();
    ultima5AtlasState.viewMode = 'interior';
    ultima5AtlasState.currentInterior = interior;
    ultima5AtlasState.currentFloor = floor;
    map.setMaxBounds(bounds.pad(0.08));

    const layerSelect = document.getElementById('ultima5-map-layer');
    const floorField = document.getElementById('ultima5-floor-field');
    const floorSelect = document.getElementById('ultima5-map-floor');
    const npcTimeField = document.getElementById('ultima5-npc-time-field');
    const npcTimeSelect = document.getElementById('ultima5-npc-time');
    const backButton = document.getElementById('ultima5-atlas-back');
    const viewTitle = document.getElementById('ultima5-atlas-view-title');
    const download = document.getElementById('ultima5-map-download');
    const summary = document.getElementById('ultima5-atlas-layer-summary');
    const coordinates = document.getElementById('ultima5-map-coordinates');
    if (layerSelect) layerSelect.value = `interior:${interior.id}`;
    if (floorField) floorField.hidden = interior.floors.length < 2;
    if (npcTimeField) npcTimeField.hidden = !interior.npcs?.length;
    if (npcTimeSelect) npcTimeSelect.value = String(ultima5AtlasState.currentHour);
    if (floorSelect) {
        floorSelect.innerHTML = '';
        interior.floors.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.label;
            option.selected = String(item.id) === String(floor.id);
            floorSelect.appendChild(option);
        });
    }
    if (backButton) backButton.hidden = false;
    if (viewTitle) viewTitle.textContent = `${interior.name} · ${floor.label}`;
    if (download) download.href = floor.imageUrl;
    if (summary) summary.textContent = interior.npcs?.length
        ? `${interior.description} NPC positions follow their original hourly schedules.`
        : interior.description;
    if (coordinates) coordinates.textContent = `${interior.name} · ${floor.label} · ${width}×${height} native tiles`;
    renderUltima5InteriorMarkers();
    renderUltima5InteriorLegend(interior);
    if (resetView) map.fitBounds(bounds, { animate: false, padding: [10, 10] });
}

function renderUltima5InteriorLegend(interior) {
    const legend = document.getElementById('ultima5-atlas-legend');
    if (!legend) return;
    const currentNpcCount = (interior.npcs || []).filter(npc => npc.schedule?.some(position =>
        position.hour === ultima5AtlasState.currentHour && position.floor === ultima5AtlasState.currentFloor?.level
    )).length;
    const facts = [
        ['Location type', interior.type === 'dungeon' ? 'Dungeon' : interior.type],
        ['Available floors', String(interior.floors.length)],
        ['Native grid', interior.type === 'dungeon' ? '8 × 8 tiles' : '32 × 32 tiles'],
        ['Floor links', String(ultima5AtlasState.currentFloor?.transitions?.length || 0)]
    ];
    if (interior.npcs?.length) facts.push([`NPCs at ${String(ultima5AtlasState.currentHour).padStart(2, '0')}:00`, String(currentNpcCount)]);
    legend.innerHTML = facts.map(([label, value]) => `
        <div class="u5-atlas__legend-item">
            <span class="u5-atlas__legend-label">${escapeUltima5AtlasHtml(label)}</span>
            <span class="u5-atlas__legend-count">${escapeUltima5AtlasHtml(value)}</span>
        </div>
    `).join('');
}

function renderUltima5InteriorMarkers() {
    const map = ultima5AtlasState.map;
    const layer = ultima5AtlasState.markerLayer;
    const interior = ultima5AtlasState.currentInterior;
    const floor = ultima5AtlasState.currentFloor;
    if (!map || !layer || !interior || !floor) return;
    layer.clearLayers();
    ultima5AtlasState.npcMarkers.clear();

    const transitionGroups = new Map();
    (floor.transitions || []).forEach(transition => {
        const key = `${transition.position.x},${transition.position.y}`;
        if (!transitionGroups.has(key)) transitionGroups.set(key, []);
        transitionGroups.get(key).push(transition);
    });
    transitionGroups.forEach(transitions => {
        const first = transitions[0];
        const symbol = transitions.length > 1 ? '↕' : first.direction === 'up' ? '↑' : '↓';
        const marker = L.marker(ultima5InteriorLatLng(first.position, floor), {
            title: transitions.map(item => item.label).join(' / '),
            icon: buildUltima5InteriorIcon('transition', symbol),
            zIndexOffset: 700
        });
        const buttons = transitions.map(item => `
            <button type="button" class="u5-atlas-popup__floor" data-u5-go-floor="${escapeUltima5AtlasHtml(item.targetFloor)}">
                ${item.direction === 'up' ? '↑' : '↓'} ${escapeUltima5AtlasHtml(item.label)}
            </button>
        `).join('');
        marker.bindPopup(`
            <article class="u5-atlas-popup">
                <h4>Floor passage</h4>
                <p>Tile ${first.position.x}, ${first.position.y}</p>
                <div class="u5-atlas-popup__floor-actions">${buttons}</div>
            </article>
        `, { maxWidth: 290 });
        layer.addLayer(marker);
    });

    (interior.npcs || []).forEach(npc => {
        const position = npc.schedule?.find(item =>
            item.hour === ultima5AtlasState.currentHour && item.floor === floor.level
        );
        if (!position) return;
        const initial = String(npc.name || 'N').trim().charAt(0).toUpperCase();
        const marker = L.marker(ultima5InteriorLatLng(position, floor), {
            title: npc.name,
            icon: buildUltima5InteriorIcon('npc', initial),
            zIndexOffset: 900
        });
        marker.bindPopup(`
            <article class="u5-atlas-popup">
                <p class="u5-atlas-popup__eyebrow">NPC at ${String(ultima5AtlasState.currentHour).padStart(2, '0')}:00</p>
                <h4>${escapeUltima5AtlasHtml(npc.name)}</h4>
                <p>${escapeUltima5AtlasHtml(npc.role || 'Resident')} · ${escapeUltima5AtlasHtml(floor.label)} · tile ${position.x}, ${position.y}</p>
                <p class="u5-atlas-popup__meta">Change the NPC schedule control to follow this resident through the day.</p>
            </article>
        `, { maxWidth: 300 });
        ultima5AtlasState.npcMarkers.set(npc.id, marker);
        layer.addLayer(marker);
    });
}

function renderUltima5AtlasLegend(layerId) {
    const legend = document.getElementById('ultima5-atlas-legend');
    if (!legend) return;
    const counts = new Map();
    ultima5AtlasState.entries.forEach(entry => {
        if (entry.markerData.layer !== layerId) return;
        counts.set(entry.markerData.type, (counts.get(entry.markerData.type) || 0) + 1);
    });
    legend.innerHTML = '';
    counts.forEach((count, type) => {
        const style = ULTIMA5_ATLAS_MARKER_STYLES[type] || ULTIMA5_ATLAS_MARKER_STYLES.default;
        const row = document.createElement('div');
        row.className = 'u5-atlas__legend-item';
        row.innerHTML = `
            <span class="u5-atlas__legend-label">
                <span class="u5-atlas__legend-swatch" style="background:${style.color}"></span>
                <span>${escapeUltima5AtlasHtml(style.label)}</span>
            </span>
            <span class="u5-atlas__legend-count">${count}</span>
        `;
        legend.appendChild(row);
    });
}

function renderUltima5AtlasSearch(query) {
    const input = document.getElementById('ultima5-map-search');
    const panel = input?.closest('.u5-atlas__field--search')?.querySelector('.u5-atlas__search-results');
    if (!input || !panel) return;
    const term = String(query || '').trim().toLowerCase();
    if (!term) {
        panel.hidden = true;
        ultima5AtlasState.searchResults = [];
        return;
    }

    const matches = ultima5AtlasState.entries.filter(entry => {
        const marker = entry.markerData;
        return [marker.name, marker.description, getUltima5AtlasStyle(marker).label]
            .some(value => String(value || '').toLowerCase().includes(term));
    }).slice(0, 7);
    ultima5AtlasState.searchResults = matches;
    panel.innerHTML = '';

    if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'u5-atlas__search-result';
        empty.textContent = 'No charted location matches that search.';
        panel.appendChild(empty);
    } else {
        matches.forEach(entry => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'u5-atlas__search-result';
            button.setAttribute('role', 'option');
            const layer = entry.markerData.layer === 'surface' ? 'Surface' : 'Underworld';
            button.innerHTML = `<span>${escapeUltima5AtlasHtml(entry.markerData.name)}</span><small>${layer}</small>`;
            button.addEventListener('click', () => focusUltima5AtlasEntry(entry));
            panel.appendChild(button);
        });
    }
    panel.hidden = false;
}

function focusUltima5AtlasEntry(entry) {
    if (!entry || !ultima5AtlasState.map) return;
    if (ultima5AtlasState.viewMode !== 'world' || entry.markerData.layer !== ultima5AtlasState.currentLayer) {
        switchUltima5AtlasLayer(entry.markerData.layer, { resetView: false });
    }
    setUltima5AtlasActiveEntry(entry);
    const latLng = ultima5MarkerLatLng(entry.markerData);
    ultima5AtlasState.map.setView(latLng, Math.max(ultima5AtlasState.map.getZoom(), 2.25), {
        animate: true
    });
    entry.leafletMarker.openPopup();
    const panel = document.querySelector('.u5-atlas__search-results');
    if (panel) panel.hidden = true;
}

function clearUltima5AtlasSearch(focusInput = false) {
    const input = document.getElementById('ultima5-map-search');
    const panel = document.querySelector('.u5-atlas__search-results');
    if (input) {
        input.value = '';
        if (focusInput) input.focus();
    }
    if (panel) panel.hidden = true;
    ultima5AtlasState.searchResults = [];
    if (ultima5AtlasState.map) ultima5AtlasState.map.closePopup();
    setUltima5AtlasActiveEntry(null);
}

function openUltima5ObjectiveOnAtlas(objective) {
    if (!objective?.atlas) return;
    showUltima5Section('atlas');
    ensureUltima5Atlas();
    window.setTimeout(() => {
        if (objective.atlas.interiorId) {
            openUltima5Interior(objective.atlas.interiorId, objective.atlas.floor, { resetView: true });
            const title = document.getElementById('ultima5-atlas-view-title');
            const summary = document.getElementById('ultima5-atlas-layer-summary');
            if (title) title.textContent += ` · Campaign: ${objective.title}`;
            if (summary) summary.textContent = ultima5ObjectiveGuidance[objective.id] || objective.detail;
            return;
        }
        const entry = ultima5AtlasState.entries.find(item => item.markerData.name === objective.atlas.marker);
        if (entry) focusUltima5AtlasEntry(entry);
    }, 80);
}

function openUltima5InlineAtlasTarget(targetId) {
    const target = ultima5InlineAtlasTargets[targetId];
    if (!target) return;
    showUltima5Section('atlas');
    ensureUltima5Atlas();
    if (Number.isInteger(target.hour)) ultima5AtlasState.currentHour = target.hour;
    window.setTimeout(() => {
        if (target.marker) {
            const entry = ultima5AtlasState.entries.find(item => item.markerData.name === target.marker);
            if (!entry) return;
            focusUltima5AtlasEntry(entry);
            const title = document.getElementById('ultima5-atlas-view-title');
            const summary = document.getElementById('ultima5-atlas-layer-summary');
            if (title) title.textContent += ` · Quest locator: ${target.label}`;
            if (summary) summary.textContent = `${target.label} is highlighted on the ${entry.markerData.layer === 'surface' ? 'Britannia' : 'Underworld'} map.`;
            document.getElementById('ultima5-map')?.focus({ preventScroll: true });
            return;
        }
        openUltima5Interior(target.interiorId, target.floor, { resetView: true });
        const marker = target.npcId ? ultima5AtlasState.npcMarkers.get(target.npcId) : null;
        if (marker) {
            marker.openPopup();
            ultima5AtlasState.map?.panTo(marker.getLatLng(), { animate: false });
        }
        const title = document.getElementById('ultima5-atlas-view-title');
        const summary = document.getElementById('ultima5-atlas-layer-summary');
        if (title) title.textContent += ` · Quest locator: ${target.label}`;
        if (summary) {
            summary.textContent = target.npcId
                ? `${target.label} is highlighted at ${String(target.hour).padStart(2, '0')}:00. Change the NPC time control to follow the resident’s full daily schedule.`
                : `${target.label} is open from the Campaign route.`;
        }
        document.getElementById('ultima5-map')?.focus({ preventScroll: true });
    }, 80);
}

// Update chart based on selected stat
function updateChart(stat) {
    const chart = window.companionChart;
    if (!chart) return;
    
    const statLabels = {
        'STR': 'Strength',
        'INT': 'Intelligence',
        'DEX': 'Dexterity'
    };
    
    const statColors = {
        'STR': 'rgba(220, 38, 38, 0.7)',
        'INT': 'rgba(37, 99, 235, 0.7)',
        'DEX': 'rgba(22, 163, 74, 0.7)'
    };
    
    // Update chart data
    chart.data.datasets[0].label = statLabels[stat];
    chart.data.datasets[0].data = companionData.map(c => c[stat]);
    chart.data.datasets[0].backgroundColor = statColors[stat];
    chart.data.datasets[0].borderColor = statColors[stat].replace('0.7', '1');
    
    // Update tooltip callback
    chart.options.plugins.tooltip.callbacks.label = function(context) {
        const data = companionData[context.dataIndex];
        return `${stat}: ${data[stat]}`;
    };
    
    chart.update();
}

// Table sorting functionality
function sortTable(tableId, columnIndex, isNumeric = false) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Toggle sort direction
    const isAscending = table.getAttribute('data-sort-dir') !== 'asc';
    table.setAttribute('data-sort-dir', isAscending ? 'asc' : 'desc');
    
    // Sort rows
    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        
        if (isNumeric) {
            return isAscending 
                ? parseInt(aValue) - parseInt(bValue)
                : parseInt(bValue) - parseInt(aValue);
        } else {
            return isAscending
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Initialize table sorting
function initializeTableSorting() {
    document.querySelectorAll('.table-sortable th').forEach((th, index) => {
        th.addEventListener('click', () => {
            const table = th.closest('table');
            const isNumeric = ['Level', 'STR', 'INT', 'DEX', 'numeric'].includes(th.getAttribute('data-sort'));
            sortTable(table.id, index, isNumeric);
        });
    });
}

// Call this after the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTableSorting);

// --- AI Seer (Gemini) Integration ---
async function callGeminiAPI(prompt, outputElement) {
    if (!outputElement) return;
    outputElement.innerHTML = '<div class="flex justify-center"><div class="loader"></div></div>';

    const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    const apiUrl = '/php/llm.php';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Invalid response structure from API.');
        outputElement.innerHTML = `<div class="gemini-response">${text}</div>`;
    } catch (err) {
        console.error('Gemini API error:', err);
        outputElement.innerHTML = `<div class="gemini-response text-red-700">The seer is silent for now. Please try again shortly.</div>`;
    }
}

function askTheSeer() {
    const textarea = document.getElementById('seer-query');
    const outputElement = document.getElementById('seer-response');
    if (!textarea || !outputElement) return;
    const query = textarea.value.trim();
    if (!query) {
        alert('Please enter a question for the seer.');
        return;
    }

    // Build common tips section from shared data
    const tipsSection = commonTips.map(t => `  • ${t.replaceAll('\n', ' ')}`).join('\n');

    const prompt = `You are a seer in Ultima V: Warriors of Destiny. Provide precise, practical guidance grounded in Ultima V mechanics and quest flow. Use the following context as background knowledge; use it to inform your answer without restating it verbatim.

- Shrines & VERAMOCOR: Each shrine loop is: learn mantra → meditate 3x → visit Codex (Underworld) → return and meditate to complete. Completing all eight reveals VERAMOCOR for Dungeon Doom.
- Mantras (who to ask): Honesty—Malifora (Moonglow) → AHM. Compassion—Greyson (Britain inn; say BRITISH) → MU. Valor—Trian → Thorne (Jhelom) → RA. Justice—Pay Jeremy → Chamfort (Resistance; password DAWN) → BEH. Sacrifice—Rew (East Brittany) → CAH. Honor—Gruman (Trinsic) → SUMM. Spirituality—Saul → Kindor (ask SHRINE; answer Y) → OM. Humility—Shirita → Wartow (answers: BRITISH, N, N, N, Y) → LUM.
- Words of Power (dungeons): Deceit—Malik → Malifora → FALLAX. Despise—Annon → VILIS. Destard—Zachariah (Britain) → Goeth (Jhelom; ask for "DROW") → INOPIA. Wrong—Terrence (Britain) → join Resistance (DAWN) → Felespar (Yew) → MALUM. Covetous—Rew → Fiona (Minoc; DAWN) → AVIDUS. Shame—Woolfe (Trinsic) → Sindar → INFAMA. Hythloth—Kaiko (New Magincia) → Hassad (Blackthorn’s dungeon; ref KAIKO) → IGNAVUS. Doom—after all shrine quests, speak VERAMOCOR.
- Shadowlords: Names are Faulinei (Falsehood), Astaroth (Hatred), Nosfentor (Cowardice). Shards lie via Deceit, Wrong/Covetous, and Hythloth respectively. In the castles’ sacred flame rooms (Lycaeum, Empath Abbey, Serpent’s Hold), stand one tile south, shout the name, wait a turn, then use the shard as it stands on the flame.
- Regalia: Sceptre—Stonegate (Grapple, Skull Keys, Magic Carpet). Use a skull key, answer the demon’s riddle ("WELL"), outrun Shadowlords on the carpet, grab the Sceptre (dispels fields). Crown—Blackthorn’s rooftop: outrun guards on the Magic Carpet, climb to L3, skull key the center room, take crown, fly off roof (capture risk can erase a companion). Amulet—Underworld: quick route is the waterfall east of Skara Brae (junctions D → L → D), then southeast through swamp/mountain pass to the burial ground; exit via VAS REL POR or intentional death. Sandalwood Box—Castle Britannia: play Stones on the harpsichord (6-7-8-9-8-7-8-7-6-7-6-5-3).
- Key Tools: Grapple from Lord Michael (Empath Abbey). Skull keys from Shenstone’s stump in Minoc (refill daily by re-entering). Magic Carpet—bring a Skull Key or AN SANCT to Castle Britannia, climb to Lord British’s private rooftop room, unlock the magic door, and take it; it crosses shallow water, swamp, brush, and hills, but mountains still require the Grapple and rough sea is dangerous. Magic Axe is top-tier (find one in Jhelom’s stump; buy more in Yew).
- Underworld tips: Use IN POR (Blink), especially around Hythloth’s shard area; use the Magic Carpet to cross swamps/shallow water/low hills.
- Doom: Use the Amulet to pierce the darkness, Sceptre to remove ethereal walls, keep the Crown ready. Speak VERAMOCOR to enter and rescue Lord British.

- Controls & UI (from the manual): Move with keypad 8/2/6/4 (N/S/E/W). Diagonals are for aiming in combat only. In 3D dungeons, tap Enter/Period to turn around. Core commands: A Attack (then direction), B Board, C Cast (type spell syllables), E Enter, G Get (dir), H Hole up (camp/rest), I Ignite torch, J Jimmy lock, K Klimb, L Look (dir), M Mix reagents, N New Order (swap party), O Open, P Push, Q Quit & Save, R Ready (equip), S Search (dir), T Talk, U Use, V View (bird’s‑eye, needs item), X X‑it, Y Yell (sails/say text), Z Z‑Stats (E/W pages; N/S scroll).
- Lore & conversation: Ask residents about NAME/JOB and relevant keywords; some info requires prior references (e.g., Resistance password DAWN). Talk to people more than once; attitudes can change.

 - Common player tips:\n${tipsSection}

Answer in 2–3 short paragraphs, in-character and actionable, with clear hints and options (avoid unnecessary spoilers). Player’s question: "${query}"`;

    callGeminiAPI(prompt, outputElement);
}
