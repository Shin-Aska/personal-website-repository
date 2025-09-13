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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Initialize the companion chart
    initializeCompanionChart();
    
    // Populate companion table
    populateCompanionTable();
    
    // Populate spell table
    populateSpellTable();
    
    // Populate word table
    populateWordTable();
    
    // Set up event listeners
    setupEventListeners();
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

// Set up event listeners
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show target section
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');

            // Keep mobile menu persistent; do not auto-hide after click
        });
    });
    
    // Quest tab buttons
    document.querySelectorAll('.quest-tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.quest-tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show target tab content
            document.querySelectorAll('.quest-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Reference tab buttons
    document.querySelectorAll('.ref-tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.ref-tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
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
                const name = row.querySelector('td:first-child').textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
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
            const isNumeric = th.getAttribute('data-sort') === 'numeric';
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

    const prompt = `You are a seer in Ultima V: Warriors of Destiny. Provide precise, practical guidance grounded in Ultima V mechanics and quest flow. Use the following context as background knowledge; use it to inform your answer without restating it verbatim.

- Shrines & VERAMOCOR: Meditate at all eight shrines with the correct mantras; each pilgrimage includes a vision at the Shrine of the Codex in the Underworld. Completing all eight reveals the word VERAMOCOR for Dungeon Doom.
- Shadowlords: Learn their names (Faulinei, Astaroth, Nosfentor). Recover shards in the Underworld (via Deceit, Wrong/Covetous, Hythloth). Banish each at the corresponding stronghold (Lycaeum, Empath Abbey, Serpent's Hold) by luring them onto the flame and using the shard.
- Crown Jewels: Sceptre (Stonegate; ethereal walls), Crown (Blackthorn’s Palace; Black Badge helps), Amulet (Underworld below Destard or via Spiritwood waterfall), Sandalwood Box (Castle Britannia harpsichord: 6-7-8-9-8-7-8-7-6-7-6-5-3).
- Key Tools: Grapple from Lord Michael (Empath Abbey); Skull keys from Shenstone’s stump in Minoc; Magic Axes from Yew (and world pickups); Blink needed in the Underworld (esp. Hythloth area); Magic Carpet for swamps/shallow water/low hills.
- Doom: Use the Amulet to pierce the darkness, Sceptre to remove ethereal walls, keep the Crown ready. Speak VERAMOCOR to enter and rescue Lord British.

Answer in 2–3 short paragraphs, in-character and actionable, with clear hints and options (avoid unnecessary spoilers). Player’s question: "${query}"`;

    callGeminiAPI(prompt, outputElement);
}
