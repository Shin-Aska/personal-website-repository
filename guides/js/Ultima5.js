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
    { id: 'shrine-spirituality', chapter: 'shrines', title: 'Shrine of Spirituality', detail: 'OM · Skara Brae', atlas: { interiorId: 'location-7', floor: '0' } },
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
        detail: 'Ask Lord Michael about GRAPPLE upstairs in the east wing. The hook opens routes across small peaks.',
        reward: 'Mountain access', recommendedBefore: 'shadow-faulinei', atlas: { interiorId: 'location-31', floor: '1' }
    },
    {
        id: 'side-jaana', category: 'Companion', title: 'Free Jaana from Yew', location: 'Yew',
        detail: 'Enter the fireplace behind the living area, descend to the hidden jail, unlock the door, and recruit Jaana.',
        reward: 'Healer companion', recommendedBefore: 'shrine-compassion', atlas: { interiorId: 'location-4', floor: '-1' }
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
        reward: 'Emergency boss weapons', recommendedBefore: 'shadow-faulinei', atlas: { marker: 'Glass Sword Cache' }
    },
    {
        id: 'side-hms-cape', category: 'Travel', title: 'Steal the HMS Cape Plans', location: 'East Britanny',
        detail: 'Jimmy the locked double doors at The Oaken Oar and search the east room’s drawers for the ship plans.',
        reward: 'Double frigate speed', recommendedBefore: 'shadow-faulinei', atlas: { interiorId: 'location-21', floor: '0' }
    },
    {
        id: 'side-magic-axe', category: 'Treasure', title: 'Claim Jhelom’s Magic Axe', location: 'Jhelom',
        detail: 'Use the tower route, push the barrels, and search the concealed stump for a returning ranged weapon.',
        reward: 'Infinite-range returning axe', recommendedBefore: 'shadow-faulinei', atlas: { interiorId: 'location-3', floor: '0' }
    },
    {
        id: 'side-reagents', category: 'Magic', title: 'Establish a Reagent Run', location: 'Spiritwood & Bloody Plains',
        detail: 'Harvest Nightshade at midnight in Spiritwood and Mandrake southeast of Minoc for high-circle travel and scouting magic.',
        reward: 'Renewable rare reagents', recommendedBefore: 'shrine-spirituality', atlas: { marker: 'Nightshade' }
    },
    {
        id: 'side-navigation', category: 'Travel', title: 'Collect the Sextant & Spyglass', location: 'Greyhaven & Farthing',
        detail: 'Ask David at Greyhaven for the sextant, then visit Seggallion at Farthing for the spyglass.',
        reward: 'Coordinates and scouting', recommendedBefore: 'shrine-compassion', atlas: { interiorId: 'location-11', floor: '0' }
    },
    {
        id: 'side-mystic-arms', category: 'Treasure', title: 'Recover the Mystic Arms', location: 'Southeast Underworld',
        detail: 'Mount a late-game expedition into the far southeast Underworld to recover Britannia’s hidden Mystic equipment.',
        reward: 'Ultimate equipment set', recommendedBefore: 'doom-rescue', atlas: { marker: 'Mystic Arms' }
    }
];

const ultima5ObjectiveGuidance = {
    'shrine-honesty': 'Begin in Moonglow: learn AHM, meditate three cycles, and seek the Codex.',
    'shrine-compassion': 'Find Greyson in Britain, affirm Lord British, and ask for the mantra MU.',
    'shrine-valor': 'Follow Trian’s lead to Thorne in Jhelom and learn RA.',
    'shrine-justice': 'Help Jeremy, join the Resistance with DAWN, and seek Chamfort for BEH.',
    'shrine-sacrifice': 'Speak with Rew in East Brittany to learn CAH, then make the shrine pilgrimage.',
    'shrine-honor': 'Ask Gruman in Trinsic for SUMM before visiting the Shrine of Honor.',
    'shrine-spirituality': 'Follow Saul’s direction to Kindor, ask about the shrine, and learn OM.',
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
            updateUltima5FieldKit();
        });
    });
    updateUltima5FieldKit();
}

function updateUltima5FieldKit() {
    const inputs = [...document.querySelectorAll('[data-u5-supply]')];
    const complete = inputs.filter(input => input.checked).length;
    const percent = inputs.length ? Math.round(complete / inputs.length * 100) : 0;
    const value = document.getElementById('u5-readiness-value');
    const bar = document.getElementById('u5-readiness-bar');
    if (value) value.textContent = `${percent}%`;
    if (bar) bar.style.width = `${percent}%`;
}

function initializeUltima5CampaignProgress() {
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
        updateUltima5CampaignProgress();
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
    updateUltima5CampaignProgress();
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
    container.innerHTML = '';

    ultima5SideQuests.forEach((quest, index) => {
        const recommendedObjectiveIndex = ultima5CampaignObjectives.findIndex(objective => objective.id === quest.recommendedBefore);
        const recommendedObjective = ultima5CampaignObjectives[recommendedObjectiveIndex];
        const recommendation = recommendedObjective ? `
            <p class="u5-side-quest-card__recommendation">
                <i data-lucide="signpost" aria-hidden="true"></i>
                <span>Recommended before <strong>Main Quest ${String(recommendedObjectiveIndex + 1).padStart(2, '0')}</strong> · ${escapeUltima5AtlasHtml(recommendedObjective.title)}</span>
            </p>
        ` : '';
        const card = document.createElement('article');
        card.className = 'u5-side-quest-card';
        card.dataset.u5SideQuestCard = quest.id;
        card.innerHTML = `
            <div class="u5-side-quest-card__topline">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <small>${escapeUltima5AtlasHtml(quest.category)}</small>
            </div>
            <div class="u5-side-quest-card__heading">
                <div>
                    <h4>${escapeUltima5AtlasHtml(quest.title)}</h4>
                    <p><i data-lucide="map-pin" aria-hidden="true"></i> ${escapeUltima5AtlasHtml(quest.location)}</p>
                </div>
                <label class="u5-side-quest-check" title="Mark side quest complete">
                    <input type="checkbox" data-u5-side-quest="${quest.id}" aria-label="Mark ${escapeUltima5AtlasHtml(quest.title)} complete" ${saved.has(quest.id) ? 'checked' : ''}>
                    <span><i data-lucide="check" aria-hidden="true"></i></span>
                </label>
            </div>
            ${recommendation}
            <p class="u5-side-quest-card__copy">${escapeUltima5AtlasHtml(quest.detail)}</p>
            <footer>
                <span><strong>Reward:</strong> ${escapeUltima5AtlasHtml(quest.reward)}</span>
                <button type="button" data-u5-side-quest-map="${quest.id}"><i data-lucide="map-pinned" aria-hidden="true"></i> Atlas</button>
            </footer>
        `;
        container.appendChild(card);
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
    const completeCount = ultima5SideQuests.filter(quest => completed.has(quest.id)).length;
    const percent = Math.round(completeCount / ultima5SideQuests.length * 100);
    const percentOutput = document.getElementById('u5-side-quest-percent');
    const totalOutput = document.getElementById('u5-side-quest-total-label');
    if (percentOutput) percentOutput.textContent = `${percent}%`;
    if (totalOutput) totalOutput.textContent = `${completeCount} of ${ultima5SideQuests.length} complete`;
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

function updateUltima5CampaignProgress() {
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
    setUltima5CampaignView('main');
    document.querySelectorAll('.quest-tab-button').forEach(button => {
        const active = button.dataset.tab === tabId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.quest-tab-content').forEach(content => {
        const active = content.id === tabId;
        content.classList.toggle('active', active);
        content.hidden = !active;
    });
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
        showUltima5Section(initialSection);
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
    if (entry.markerData.layer !== ultima5AtlasState.currentLayer) {
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
