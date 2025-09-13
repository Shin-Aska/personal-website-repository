// Data for companions
const companions = [
    { name: 'Iolo', class: 'Bard', str: 20, dex: 25, int: 15, level: 3, location: 'Britannia' },
    { name: 'Shamino', class: 'Fighter', str: 25, dex: 22, int: 12, level: 4, location: 'Britannia' },
    { name: 'Dupre', class: 'Fighter', str: 28, dex: 18, int: 10, level: 4, location: 'Britannia' },
    { name: 'Jaana', class: 'Druid', str: 15, dex: 16, int: 22, level: 5, location: 'Yew' },
    { name: 'Julia', class: 'Bard', str: 18, dex: 20, int: 16, level: 3, location: 'Britain' },
    { name: 'Katrina', class: 'Fighter', str: 26, dex: 20, int: 14, level: 4, location: 'Jhelom' },
    { name: 'Sentri', class: 'Fighter', str: 24, dex: 22, int: 12, level: 5, location: 'Trinsic' },
    { name: 'Geoffrey', class: 'Fighter', str: 27, dex: 18, int: 10, level: 4, location: 'Jhelom' },
    { name: 'Mariah', class: 'Mage', str: 10, dex: 14, int: 28, level: 6, location: 'Moonglow' },
    { name: 'Iolo', class: 'Bard', str: 20, dex: 24, int: 16, level: 4, location: 'Britain' }
];

// Data for virtues
const virtues = [
    { name: 'Honesty', str: 0, dex: 0, int: 5, description: 'Increases Intelligence by 5' },
    { name: 'Compassion', str: 0, dex: 5, int: 0, description: 'Increases Dexterity by 5' },
    { name: 'Valor', str: 5, dex: 0, int: 0, description: 'Increases Strength by 5' },
    { name: 'Justice', str: 3, dex: 3, int: 3, description: 'Balanced +3 to all attributes' },
    { name: 'Sacrifice', str: 0, dex: 2, int: 2, description: 'Increases Dexterity and Intelligence by 2' },
    { name: 'Honor', str: 2, dex: 0, int: 2, description: 'Increases Strength and Intelligence by 2' },
    { name: 'Spirituality', str: 2, dex: 2, int: 0, description: 'Increases Strength and Dexterity by 2' },
    { name: 'Humility', str: 1, dex: 1, int: 1, description: 'Modest +1 to all attributes' }
];

// Data for words of passage
const wordsOfPassage = [
    { word: 'AER', location: 'Dungeon Destard', use: 'Reveals secret doors' },
    { word: 'AN', location: 'Dungeon Deceit', use: 'Opens magically locked chests' },
    { word: 'BET', location: 'Dungeon Despise', use: 'Reveals hidden items' },
    { word: 'CORP', location: 'Dungeon Wrong', use: 'Opens magically locked doors' },
    { word: 'FLA', location: 'Dungeon Hythloth', use: 'Creates light in dark areas' },
    { word: 'IN', location: 'Dungeon Covetous', use: 'Reveals invisible creatures' },
    { word: 'JUX', location: 'Dungeon Shame', use: 'Teleports short distances' },
    { word: 'LOR', location: 'Dungeon Doom', use: 'Summons ethereal beings' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    populateStaticData();
    setupEventListeners();
    setupVirtueChart();
    renderPassageList(wordsOfPassage);
    renderCompanionTable(companions);
});

// Show the selected tab
function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show the selected tab content
    document.getElementById(`${tabId}-tab`).classList.add('active');

    // Activate the clicked tab button
    event.target.classList.add('active');
}

// Show the selected almanac tab
function showAlmanacTab(tabId) {
    // Hide all almanac tab contents
    document.querySelectorAll('.almanac-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Deactivate all almanac tab buttons
    document.querySelectorAll('.almanac-tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show the selected almanac tab content
    document.getElementById(`almanac-${tabId}`).classList.add('active');

    // Activate the clicked almanac tab button
    event.target.classList.add('active');
}

// Populate static data in the DOM
function populateStaticData() {
    // Add virtues to the character creation section
    const virtuesList = document.getElementById('virtues-list');
    if (virtuesList) {
        virtues.forEach(virtue => {
            const li = document.createElement('li');
            li.className = 'mb-4 p-4 bg-white rounded-lg shadow';
            li.innerHTML = `
                <h4 class="font-bold text-lg text-amber-900">${virtue.name}</h4>
                <p class="text-gray-700">${virtue.description}</p>
                <div class="mt-2">
                    <span class="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mr-2">STR +${virtue.str}</span>
                    <span class="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mr-2">DEX +${virtue.dex}</span>
                    <span class="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">INT +${virtue.int}</span>
                </div>
            `;
            virtuesList.appendChild(li);
        });
    }
}

// Set up event listeners
function setupEventListeners() {
    // Accordion functionality for quest steps
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = header.getAttribute('aria-expanded') === 'true';

            // Toggle the content
            if (isOpen) {
                content.style.maxHeight = '0';
                header.setAttribute('aria-expanded', 'false');
                header.querySelector('svg').classList.remove('rotate-180');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                header.setAttribute('aria-expanded', 'true');
                header.querySelector('svg').classList.add('rotate-180');
            }
        });
    });

    // Generate backstory button
    const generateBtn = document.getElementById('generate-chronicle');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateChronicle);
    }

    // Ask the sage button
    const askSageBtn = document.getElementById('ask-sage');
    if (askSageBtn) {
        askSageBtn.addEventListener('click', askTheSeer);
    }
}

// Sort direction for tables
let sortDirection = {};

// Render the companion table
function renderCompanionTable(data) {
    const tbody = document.getElementById('companion-table-body');
    if (!tbody) return;

    tbody.innerHTML = data.map(companion => `
        <tr class="hover:bg-amber-50">
            <td class="p-3 border-b border-amber-100">${companion.name}</td>
            <td class="p-3 border-b border-amber-100">${companion.class}</td>
            <td class="p-3 border-b border-amber-100 text-center">${companion.level}</td>
            <td class="p-3 border-b border-amber-100 text-center">${companion.str}</td>
            <td class="p-3 border-b border-amber-100 text-center">${companion.dex}</td>
            <td class="p-3 border-b border-amber-100 text-center">${companion.int}</td>
            <td class="p-3 border-b border-amber-100">${companion.location}</td>
        </tr>
    `).join('');
}

// Sort table by column
function sortTable(key) {
    const direction = sortDirection[key] || 1;
    companions.sort((a, b) => {
        if (a[key] < b[key]) return -1 * direction;
        if (a[key] > b[key]) return 1 * direction;
        return 0;
    });
    sortDirection[key] = -1 * direction;
    renderCompanionTable(companions);
}

// Call the Gemini API
async function callGemini(prompt, maxRetries = 3) {
    const apiUrl = '/php/llm.php'; // local PHP proxy
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

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                return result.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Invalid response structure from Gemini API");
            }
        } catch (error) {
            console.warn(`API call attempt ${i + 1} failed. Retrying in ${delay}ms...`, error);
            if (i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
            } else {
                return "My apologies, adventurer. My connection to the ethereal plane is weak. Please try again shortly.";
            }
        }
    }
}

// Generate character backstory
function generateChronicle() {
    const virtueSelect = document.getElementById('virtue-select');
    const outputDiv = document.getElementById('chronicle-output');

    if (!virtueSelect || !outputDiv) return;

    const selectedVirtue = virtueSelect.value;
    const prompt = `Create a 2-3 paragraph backstory for an Avatar in Ultima VI who embodies the virtue of ${selectedVirtue}. ` +
        `Include their origin, personality traits, and how they came to be chosen as the Avatar. ` +
        `Write in a medieval fantasy style.`;

    callGeminiAPI(prompt, outputDiv);
}

// Ask the seer for advice
function askTheSeer() {
    const questionInput = document.getElementById('sage-question');
    const outputDiv = document.getElementById('sage-answer');

    if (!questionInput || !outputDiv) return;

    const question = questionInput.value.trim();
    if (!question) {
        outputDiv.innerHTML = '<div class="text-red-600">Please enter a question first.</div>';
        return;
    }

    const prompt = `You are a far-seeing seer in Ultima VI: The False Prophet. Ground your guidance in this quest context (use it to inform your answer; do not just restate it):\n\n- Act I — Liberate the Shrines: find each Rune and mantra, cleanse the eight shrines, and collect the Moonstones.\n- Act II — Prophecy & Pirates: take the Gargish book to Mariah; assemble Captain Hawkins’s nine map pieces (Shame, Wrong/Covetous, Ant Mound, shipwreck at ~71S 15E, Serpent’s Hold trade for a Magic Shield, Dagger Isle hermit, gypsies north of Paws, Trinsic mayor “Gordon”, plus Homer) to reach the Pirate Cave and recover the silver tablet; return the Storm Cloak to Homer.\n- Act III — Gargoyle Realm: through Hythloth meet Captain Johne, recruit Beh Lem, wear the Amulet of Submission before Lord Draxinusom; build the balloon to reach the Shrine of Singularity, learn UN, OR, US and chant UNORUS.\n- Final Ritual: recover the Vortex Cube at Stonegate; repair the Gargoyle lens and obtain the Britannian lens (glass sword → Ephemerides); at the Codex, set each lens halfway between its flame and the Codex, load all eight Moonstones into the Cube, then use it.\n\nAnswer in 2–3 short paragraphs, in-character and practical, giving clear hints and options (avoid unnecessary spoilers). Player’s question: "${question}"`;

    callGeminiAPI(prompt, outputDiv);
}

// Set up the virtue chart
function setupVirtueChart() {
    const ctx = document.getElementById('virtue-chart');
    if (!ctx) return;

    const labels = virtues.map(v => v.name);
    const strengthData = virtues.map(v => v.str);
    const dexterityData = virtues.map(v => v.dex);
    const intelligenceData = virtues.map(v => v.int);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Strength',
                    data: strengthData,
                    backgroundColor: 'rgba(197, 138, 14, 0.7)',
                    borderColor: 'rgba(197, 138, 14, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Dexterity',
                    data: dexterityData,
                    backgroundColor: 'rgba(146, 64, 14, 0.7)',
                    borderColor: 'rgba(146, 64, 14, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Intelligence',
                    data: intelligenceData,
                    backgroundColor: 'rgba(113, 63, 18, 0.7)',
                    borderColor: 'rgba(113, 63, 18, 1)',
                    borderWidth: 1
                }
            ]
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
                title: {
                    display: true,
                    text: 'Virtue Attribute Bonuses',
                    font: {
                        size: 16,
                        family: '"IM Fell English", serif'
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: '"Marcellus", serif'
                        }
                    }
                }
            }
        }
    });
}

// Render the words of passage list
function renderPassageList(data) {
    const container = document.getElementById('passage-list');
    if (!container) return;

    container.innerHTML = data.map(item => `
        <div class="mb-4 p-4 bg-white rounded-lg shadow">
            <div class="font-bold text-lg text-amber-900">${item.word}</div>
            <div class="text-sm text-gray-600">Found in: ${item.location}</div>
            <div class="mt-2 text-gray-800">${item.use}</div>
        </div>
    `).join('');
}
