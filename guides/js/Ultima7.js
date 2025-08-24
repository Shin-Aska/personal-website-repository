const DB = {
    companions: [
        { name: "Iolo", role: "Fighter (Bard)", str: 18, dex: 19, int: 20, com: 19, location: "Trinsic", notes: "Joins automatically at the start." },
        { name: "Shamino", role: "Fighter (Ranger)", str: 18, dex: 21, int: 19, com: 16, location: "Britain, Blue Boar Tavern", notes: "Excellent archer due to high Dexterity." },
        { name: "Dupre", role: "Fighter (Paladin)", str: 21, dex: 20, int: 18, com: 18, location: "Jhelom, The Bunk and Stool", notes: "The best front-line tank with the highest starting Strength." },
        { name: "Spark", role: "Fighter", str: 14, dex: 22, int: 18, com: 10, location: "Trinsic, Christopher's House", notes: "Gains training points at double rate. Huge damage potential." },
        { name: "Sentri", role: "Trainer (Fighter)", str: 18, dex: 20, int: 18, com: 16, location: "Britain, Training Hall", notes: "Will not join if party size is > 5. Offers free DEX training." },
        { name: "Tseramed", role: "Fighter (Ranger)", str: 16, dex: 17, int: 18, com: 12, location: "Yew, near Bee Cave", notes: "" },
        { name: "Jaana", role: "Healer (Druid)", str: 13, dex: 16, int: 18, com: 8, location: "Cove, Healer's Shop", notes: "Can periodically heal the party for free. Only companion with innate magic." },
        { name: "Katrina", role: "Fighter (Shepherd)", str: 11, dex: 15, int: 18, com: 8, location: "New Magincia", notes: "Will not join if party size is > 5. Generally a poor choice due to low stats." },
        { name: "Julia", role: "Fighter (Tinker)", str: 12, dex: 14, int: 18, com: 8, location: "Minoc, Tinker Shop", notes: "Will not join if party size is > 5. Will not rejoin if dismissed." },
    ],
    equipment: [
        { name: "Magic Armour (Full Suit)", type: "Armour", effect: "High Protection", location: "128S/3W (Chest SW of Trinsic)" },
        { name: "Juggernaut Hammer", type: "2H Weapon", effect: "High Damage, Ranged", location: "157S/53E (Serpent's Hold Armoury)" },
        { name: "Hoe of Destruction", type: "2H Weapon", effect: "Very High Damage", location: "22S/25E (Mack's Shed, near Britain)" },
        { name: "Glass Sword", type: "1H Weapon", effect: "Extremely High Damage (1 use)", location: "161S/191E (Dragon Treasure, Isle of Avatar)" },
        { name: "Death Scythe", type: "2H Weapon", effect: "High Damage", location: "53S/64W (Crypt, Skara Brae)" },
        { name: "Magebane", type: "1H Weapon", effect: "Drains Mana on Hit", location: "16N/38E (Stonegate Ruins, in swamp)" },
        { name: "Triple Crossbow", type: "Ranged", effect: "Fires 3 Bolts", location: "Sold at Iolo's Bows" },
        { name: "Magic Bow", type: "Ranged", effect: "High Damage", location: "46N/7E (Camp in Deep Forest)" },
        { name: "Sword of Defense", type: "1H Weapon", effect: "Adds to Armor Value", location: "157S/53E (Serpent's Hold Armoury)" },
    ],
    bestiary: [
        { name: "Slimes", tactic: "Use a low-damage weapon. They duplicate when struck, allowing for controlled farming of XP." },
        { name: "Stone Harpy", tactic: "Completely immune to all magic and enchanted weapons. Must be defeated with non-magical attacks. A Glass Sword is highly effective." },
        { name: "Liches", tactic: "Extremely dangerous spellcasters. Use the Magebane sword to drain their mana, rendering them helpless." },
        { name: "Dragons", tactic: "Formidable beasts with high health. A single Glass Sword can often defeat them in one hit." },
    ],
    reagents: {
        vendors: ["Rudyom (Cove)", "Nystul (Britain)", "Nicodemus (Yew)", "Mariah (Moonglow)", "Wis-Sur (Vesper)", "Sarpling (Terfin)"],
        data: {
            "Black Pearl": [5, 10, null, 8, 34, null],
            "Blood Moss": [3, 6, 3, null, 16, 2],
            "Garlic": [null, null, 2, 1, null, 1],
            "Ginseng": [2, 4, null, 2, null, 1],
            "Mandrake Root": [5, 10, 5, 7, 32, null],
            "Nightshade": [null, null, 5, 6, null, null],
            "Spider Silk": [null, null, 3, null, 20, null],
            "Sulfurous Ash": [4, 8, null, null, 25, 3],
        }
    },
    mainQuest: [
        { title: "The Trinsic Murders", content: "Investigate the ritualistic murder in the stables. Examine the crime scene for a key. Interview Spark, Gilberto, and Gargan to identify the suspect (man with a hook) and his escape vessel (the Crown Jewel). Report to Mayor Finnigan and pass his copy protection quiz with these answers:<br><br><b class='text-yellow-300'>Spektran latitude:</b> 120<br><b class='text-yellow-300'>Buccaneer's Den longitude:</b> 60<br><b class='text-yellow-300'>Terfin longitude:</b> 120<br><b class='text-yellow-300'>Dagger Isle latitude:</b> 0<br><b class='text-yellow-300'>Skara Brae latitude:</b> 30<br><b class='text-yellow-300'>Deep Forest latitude:</b> 60<br><b class='text-yellow-300'>Buccaneer's Den latitude:</b> 60<br><b class='text-yellow-300'>Skara Brae longitude:</b> 60<br><br>He will then give you the password 'Blackbird' to leave the city." },
        { title: "Infiltrating the Fellowship", content: "In Britain, meet Batlin and feign interest in joining the Fellowship. Deliver a package to Elynor in Minoc. Return to Batlin and complete his test in Dungeon Destard (just find the empty chest). Attend the evening service and answer the questions from the Book of Fellowship to gain membership." },
        { title: "The Quest for the Time Lord", content: "Follow the gypsy's advice. Go to the Deep Forest and find the silent wisp. Get honey from the Bee Cave to bribe the emps. Negotiate with the emps to get a wisp whistle. Use the whistle to communicate with the wisp, who demands Alagner's notebook from New Magincia in exchange for information." },
        { title: "The Answers to Life and Death", content: "In New Magincia, Alagner asks you to learn the answers to life and death from Skara Brae. Use the Seance spell to travel to the haunted island. Help the spirits by defeating the liche Horance. This involves brewing a potion, forging a Soul Cage, and destroying the Well of Souls. Caine will then reveal the 'answers'. Return to Alagner to get his notebook." },
        { title: "Destroying the Guardian's Generators", content: "Give the notebook to the wisp to contact the Time Lord. He reveals the Guardian's plot and the three generators that must be destroyed. <br><b>1. Tetrahedron (Deceit):</b> Get blackrock for Penumbra, acquire the Ethereal Ring from Spektran, have it enchanted, and destroy the prism. <br><b>2. Sphere (Despise):</b> Get the Hourglass of Nicodemus, have it enchanted (after the Tetrahedron is down), and navigate the red/blue moongate puzzle (red, blue, blue, red) to destroy the prism. <br><b>3. Cube (Meditation Retreat):</b> Get Caddellite ore from Ambrosia, have Zorn forge helmets, and wear them to safely destroy the final generator." },
        { title: "The Isle of the Avatar and Final Battle", content: "Use the prism from the Cube generator to interrogate Fellowship members and uncover the murderers. Go to Buccaneer's Den, find Hook, and get the Black Gate key. Travel to the Isle of the Avatar, enter Dungeon Hythloth, and defeat Batlin and his disciples. Place the three prisms on the pedestals to disable the gate's power beam. Finally, use Rudyom's Wand on the Black Gate to destroy it and save Britannia." }
    ],
    sideQuests: [
        { name: "Free Weston!", location: "Paws", giver: "Weston", reward: "20 XP", walkthrough: "Weston is jailed in Lord British's castle for stealing an apple. Plead his case to Lord British for his release." },
        { name: "Who Stole the Poison?", location: "Paws", giver: "Morfin", reward: "150 XP", walkthrough: "Investigate a family feud. The stolen poison vial is in Garritt's chest. Confront him for a confession." },
        { name: "Where Does Patterson go at Night?", location: "Britain", giver: "Judith", reward: "60 XP", walkthrough: "Follow Patterson after a Fellowship meeting to Candice's house. Confront him about his affair." },
        { name: "Miranda's Law", location: "Britain", giver: "Miranda", reward: "20 XP", walkthrough: "Take Miranda's bill to clean up Locke Lake to Mayor Heather in Cove for a signature, then return it." },
        { name: "Nastassia's Father", location: "Cove", giver: "Nastassia", reward: "50 XP", walkthrough: "Ask the Emp Trellek in the Deep Forest about Julius. He will reveal Julius was a hero. Report this back to Nastassia." },
        { name: "Owen the Shipwright, Hero or Fraud?", location: "Minoc", giver: "Various", reward: "100 XP", walkthrough: "Get the original ship plans from the hermit Karl. Show them to Julia the tinker, who confirms the design is flawed. Present the evidence to Mayor Burnside." },
        { name: "The Honor Flag", location: "Jhelom", giver: "Sprellic", reward: "100 XP / Sword Storm Amulet", walkthrough: "Either fight three duels for Sprellic or, more cleverly, have the armorer Kliftin make a replica of the stolen flag and give it to the fighters." },
        { name: "Blorn's Accusations", location: "Vesper", giver: "Blorn", reward: "50 XP", walkthrough: "Speak to the accused gargoyle, Lap-Lem. He was the victim. Confront Blorn to get Lap-Lem's stolen amulet back and return it." },
        { name: "Where does Catherine Go?", location: "Vesper", giver: "Yvella", reward: "50 XP", walkthrough: "Follow Catherine to the gargoyle side of town. She listens to stories from an elder gargoyle. Keeping this secret is the peaceful option." },
        { name: "Balayna's Doubts", location: "Moonglow", giver: "Balayna", reward: "50 XP", walkthrough: "A quest highlighting the Fellowship's sinister nature. Reporting Balayna's doubts to Rankin leads to her death or disappearance." },
        { name: "Brion's Orrery", location: "Moonglow", giver: "Brion", reward: "Orrery (Item)", walkthrough: "Buy a special crystal from the mage Addom for 20 gold and give it to Brion to complete his portable orrery." },
        { name: "Who wants to destroy the Shrine?", location: "Terfin", giver: "Teregus", reward: "100 XP / Flame Armour", walkthrough: "Investigate Sarpling's home to find a scroll implicating a Fellowship member in a plot. Confronting them reveals the plot and leads to a fight." },
        { name: "Mysterious Monk", location: "Yew", giver: "Kreg", reward: "100 XP", walkthrough: "Kreg is a criminal in hiding. Research court records to discover his identity and confront him, which will provoke an attack." },
        { name: "Who Defaced Lord British?", location: "Serpent's Hold", giver: "Lord John-Paul", reward: "100 XP / Magical Armor", walkthrough: "A lengthy investigation reveals the knight Pendaran is the vandal. Report this to Lord John-Paul." },
        { name: "Tory's Baby", location: "Serpent's Hold", giver: "Tory", reward: "100 XP", walkthrough: "The baby, Riky, is at the Shrine of Honor (151S, 9W). Defeat the harpies and return him to his mother." },
        { name: "Three Pirates and a Locket", location: "New Magincia", giver: "Henry", reward: "150 XP", walkthrough: "Unravel a complex plot involving a stolen locket and a kidnapping scheme. Retrieve the locket and expose the pirate Robin." },
        { name: "The Pirate Friends", location: "Buccaneer's Den", giver: "Mole", reward: "20 XP (Repeatable)", walkthrough: "Act as an intermediary between the feuding pirates Mole and Blacktooth to reconcile them. Can be repeated for infinite XP." },
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.getElementById('main-nav');
    const sections = document.querySelectorAll('.content-section');
    const aiModal = document.getElementById('ai-modal');
    const closeAiModalBtn = document.getElementById('close-ai-modal');
    const aiLoader = document.getElementById('ai-loader');
    const aiResponseText = document.getElementById('ai-response-text');
    const aiModalTitle = document.getElementById('ai-modal-title');

    let companionChart = null;
    let reagentChart = null;

    // --- Gemini API Integration ---
    async function callGemini(prompt, maxRetries = 3) {
        const apiKey = ""; // Provided by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
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
                
                if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
                    return result.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("Invalid response structure from Gemini API");
                }
            } catch (error) {
                console.warn(`API call attempt ${i + 1} failed. Retrying in ${delay}ms...`, error);
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    return "My apologies, adventurer. My connection to the ethereal plane is weak. Please try again shortly.";
                }
            }
        }
    }

    function showAiModal() {
        aiResponseText.textContent = '';
        aiLoader.style.display = 'flex';
        aiModal.classList.remove('hidden');
    }

    function hideAiModal() {
        aiModal.classList.add('hidden');
    }

    function displayAiResponse(text, title = '✨ AI Assistant') {
        aiModalTitle.textContent = title;
        aiResponseText.textContent = text;
        aiLoader.style.display = 'none';
    }

    closeAiModalBtn.addEventListener('click', hideAiModal);
    aiModal.addEventListener('click', (e) => {
        if (e.target === aiModal) {
            hideAiModal();
        }
    });

    // --- Core App Logic ---
    function switchTab(targetId) {
        mainNav.querySelectorAll('.nav-button').forEach(button => {
            button.classList.toggle('active', button.dataset.target === targetId);
        });
        sections.forEach(section => {
            section.classList.toggle('active', section.id === targetId);
            section.classList.toggle('hidden', section.id !== targetId);
        });
    }

    mainNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-button')) {
            switchTab(e.target.dataset.target);
        }
    });

    function initPartyBuilder() {
        const grid = document.getElementById('companion-grid');
        const details = document.getElementById('companion-details');
        document.getElementById('get-party-strategy-btn').addEventListener('click', handleGetPartyStrategy);

        grid.innerHTML = '';
        DB.companions.forEach((c, index) => {
            const card = document.createElement('div');
            card.className = 'companion-card border-2 border-transparent p-2 rounded-lg text-center cursor-pointer transform transition-all duration-300 hover:bg-[#4a5568]';
            card.dataset.id = index;
            card.innerHTML = `<h4>${c.name}</h4><p class="text-xs text-secondary">${c.role}</p>`;
            grid.appendChild(card);
        });

        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.companion-card');
            if (card) {
                grid.querySelectorAll('.companion-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                displayCompanionDetails(parseInt(card.dataset.id));
            }
        });

        async function handleGenerateBackstory(id) {
            const c = DB.companions[id];
            showAiModal();
            const prompt = `You are a creative writer for the classic RPG Ultima VII. Write a short, flavorful journal entry from the perspective of the character ${c.name}, the ${c.role}. Keep it under 100 words and capture their personality based on what is known about them in the game.`;
            const backstory = await callGemini(prompt);
            displayAiResponse(backstory, `✨ ${c.name}'s Journal`);
        }

        async function handleGetPartyStrategy() {
            showAiModal();
            const prompt = `You are an expert player of Ultima VII: The Black Gate. For a classic party consisting of the Avatar (as a mage), Iolo, Shamino, and Dupre, provide a concise strategic guide. Include: 1. A primary combat role for each. 2. A top training priority for each character. 3. A key piece of equipment they should acquire early. Keep the entire response under 150 words and format it clearly.`;
            const strategy = await callGemini(prompt);
            displayAiResponse(strategy, `✨ Classic Party Strategy`);
        }

        function displayCompanionDetails(id) {
            const c = DB.companions[id];
            details.innerHTML = `
                <div class="flex flex-col md:flex-row gap-6">
                    <div class="flex-grow">
                        <h3 class="text-3xl font-bold">${c.name}</h3>
                        <p class="text-lg text-secondary">${c.role}</p>
                        <p class="mt-4"><span class="font-semibold">Location:</span> ${c.location}</p>
                        <p class="mt-2 bg-[#1a202c] p-3 rounded-md"><span class="font-semibold">Notes:</span> ${c.notes || 'No special notes.'}</p>
                        <button id="generate-backstory-btn" class="ai-button mt-4 w-full font-bold py-2 px-4 rounded-lg">✨ Generate Backstory</button>
                    </div>
                    <div class="w-full md:w-1/2 flex-shrink-0">
                         <div class="chart-container !h-[250px] !max-h-[250px]">
                            <canvas id="companion-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('generate-backstory-btn').addEventListener('click', () => handleGenerateBackstory(id));
            
            const ctx = document.getElementById('companion-chart').getContext('2d');
            if (companionChart) companionChart.destroy();
            const chartOptions = {
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    y: { 
                        beginAtZero: true, max: 30, 
                        grid: { color: '#4a5568' }, 
                        ticks: { color: '#a0aec0' } 
                    },
                    x: {
                        grid: { color: '#4a5568' },
                        ticks: { color: '#a0aec0' }
                    }
                },
                plugins: { legend: { display: false } }
            };
            companionChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['STR', 'DEX', 'INT', 'COM'],
                    datasets: [{
                        label: c.name + ' Stats',
                        data: [c.str, c.dex, c.int, c.com],
                        backgroundColor: ['#c53030', '#2f855a', '#2b6cb0', '#805ad5'],
                        borderColor: '#a0aec0',
                        borderWidth: 1
                    }]
                },
                options: chartOptions
            });
        }
        displayCompanionDetails(0);
        grid.querySelector('.companion-card').classList.add('selected');
    }

    async function handleGetItemLore(itemName) {
        showAiModal();
        const prompt = `You are a loremaster in the world of Britannia from the game Ultima VII. Write a short, evocative piece of lore (under 75 words) for the legendary item known as the '${itemName}'. Describe its origin or a famous deed associated with it.`;
        const lore = await callGemini(prompt);
        displayAiResponse(lore, `✨ The Lore of ${itemName}`);
    }

    function initArmory() {
        const tableBody = document.getElementById('equipment-table');
        tableBody.innerHTML = '';
        DB.equipment.forEach(item => {
            const row = tableBody.insertRow();
            row.className = 'border-b border-color';
            row.innerHTML = `
                <td class="px-4 py-3 font-semibold">${item.name}</td>
                <td class="px-4 py-3">${item.type}</td>
                <td class="px-4 py-3">${item.effect}</td>
                <td class="px-4 py-3">${item.location}</td>
                <td class="px-4 py-3 text-center">
                    <button data-item-name="${item.name}" class="get-item-lore-btn ai-button font-bold py-1 px-2 rounded-lg text-xs">✨</button>
                </td>
            `;
        });

        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('get-item-lore-btn')) {
                handleGetItemLore(e.target.dataset.itemName);
            }
        });

        const bestiaryGrid = document.getElementById('bestiary-grid');
        bestiaryGrid.innerHTML = '';
        DB.bestiary.forEach(monster => {
            const card = document.createElement('div');
            card.className = 'bg-[#1a202c] p-4 rounded-lg';
            card.innerHTML = `<h4 class="font-bold text-lg accent-text">${monster.name}</h4><p class="text-sm mt-1">${monster.tactic}</p>`;
            bestiaryGrid.appendChild(card);
        });
    }

    function initMagic() {
        const selector = document.getElementById('reagent-selector');
        selector.innerHTML = '';
        Object.keys(DB.reagents.data).forEach(reagent => {
            selector.add(new Option(reagent, reagent));
        });

        const ctx = document.getElementById('reagent-chart').getContext('2d');
        
        function updateReagentChart(reagent) {
             const chartOptions = {
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: { color: '#4a5568' }, 
                        ticks: { color: '#a0aec0' } 
                    },
                    x: {
                        grid: { color: '#4a5568' },
                        ticks: { color: '#a0aec0' }
                    }
                },
                plugins: { 
                    legend: { display: false }, 
                    title: { display: true, text: `${reagent} Prices`, color: '#f6e05e' } 
                }
            };
            const chartData = {
                labels: DB.reagents.vendors,
                datasets: [{
                    label: 'Price in Gold',
                    data: DB.reagents.data[reagent],
                    backgroundColor: '#2b6cb0',
                    borderColor: '#a0aec0',
                    borderWidth: 1
                }]
            };
            
            if (reagentChart) {
                reagentChart.data = chartData;
                reagentChart.options.plugins.title.text = `${reagent} Prices`;
                reagentChart.update();
            } else {
                reagentChart = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
            }
        }
        
        selector.addEventListener('change', (e) => updateReagentChart(e.target.value));
        updateReagentChart(selector.value);
    }
    
    async function handleGetQuestHint(quest) {
        showAiModal();
        const prompt = `I am playing the classic RPG Ultima VII. For the quest named '${quest.title || quest.name}', which is described as: '${quest.content || quest.walkthrough}', provide a single, non-spoilery hint for what I should do next. Frame it as advice from a seasoned adventurer. Keep it concise.`;
        const hint = await callGemini(prompt);
        displayAiResponse(hint, `✨ Hint for ${quest.title || quest.name}`);
    }

    function initQuests() {
        const questTabs = document.querySelectorAll('.quest-tab-button');
        const questContents = document.querySelectorAll('.quest-content');
        questTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                questTabs.forEach(t => {
                    t.classList.remove('active', 'border-[#c53030]');
                    t.classList.add('border-transparent', 'text-gray-500');
                    t.style.color = '#a0aec0';
                });
                tab.classList.add('active', 'border-[#c53030]');
                tab.classList.remove('border-transparent', 'text-gray-500');
                tab.style.color = '#f6e05e';
                const targetId = tab.dataset.questTab + '-quest-content';
                questContents.forEach(content => {
                    content.classList.toggle('active', content.id === targetId);
                    content.classList.toggle('hidden', content.id !== targetId);
                });
            });
        });

        const mainQuestAccordion = document.getElementById('main-quest-accordion');
        DB.mainQuest.forEach((quest, index) => {
            const item = document.createElement('div');
            item.className = 'section-bg rounded-lg shadow';
            item.innerHTML = `
                <div class="quest-item p-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold">${index + 1}. ${quest.title}</h3>
                        <span class="text-2xl transform transition-transform duration-300">&#9662;</span>
                    </div>
                </div>
                <div class="accordion-content px-4 pb-4 text-sm">
                    <p>${quest.content}</p>
                    <button data-quest-index="${index}" class="get-main-quest-hint ai-button mt-3 w-full font-bold py-1 px-3 rounded-lg text-xs">✨ Get AI Hint</button>
                </div>
            `;
            mainQuestAccordion.appendChild(item);
        });
        
        mainQuestAccordion.addEventListener('click', (e) => {
            if (e.target.classList.contains('get-main-quest-hint')) {
                const index = e.target.dataset.questIndex;
                handleGetQuestHint(DB.mainQuest[index]);
                return;
            }
            const item = e.target.closest('.quest-item');
            if (item) {
                const content = item.nextElementSibling;
                const icon = item.querySelector('span');
                const isOpen = content.style.maxHeight;
                document.querySelectorAll('.accordion-content').forEach(c => c.style.maxHeight = null);
                document.querySelectorAll('.quest-item span').forEach(i => i.style.transform = 'rotate(0deg)');
                if (!isOpen) {
                    content.style.maxHeight = content.scrollHeight + "px";
                    icon.style.transform = 'rotate(180deg)';
                }
            }
        });

        const sideQuestList = document.getElementById('side-quest-list');
        const locationFilter = document.getElementById('side-quest-location-filter');
        const locations = [...new Set(DB.sideQuests.map(q => q.location))];
        locations.sort().forEach(loc => locationFilter.add(new Option(loc, loc)));

        function renderSideQuests(location = 'all') {
            sideQuestList.innerHTML = '';
            const filteredQuests = (location === 'all') ? DB.sideQuests : DB.sideQuests.filter(q => q.location === location);
            
            filteredQuests.forEach((quest, index) => {
                const card = document.createElement('div');
                card.className = 'section-bg p-4 rounded-lg shadow';
                card.innerHTML = `
                    <h4 class="text-lg font-bold">${quest.name} <span class="text-sm font-normal text-secondary">(${quest.location})</span></h4>
                    <p class="text-sm mt-1"><span class="font-semibold">Giver:</span> ${quest.giver}</p>
                    <p class="text-sm"><span class="font-semibold">Reward:</span> ${quest.reward}</p>
                    <p class="text-sm mt-2 bg-[#1a202c] p-2 rounded">${quest.walkthrough}</p>
                    <button data-quest-name="${quest.name}" class="get-side-quest-hint ai-button mt-3 w-full font-bold py-1 px-3 rounded-lg text-xs">✨ Get AI Hint</button>
                `;
                sideQuestList.appendChild(card);
            });
        }
        
        sideQuestList.addEventListener('click', e => {
            if(e.target.classList.contains('get-side-quest-hint')) {
                const questName = e.target.dataset.questName;
                const quest = DB.sideQuests.find(q => q.name === questName);
                if (quest) handleGetQuestHint(quest);
            }
        });
        
        locationFilter.addEventListener('change', (e) => renderSideQuests(e.target.value));
        renderSideQuests();
    }

    initPartyBuilder();
    initArmory();
    initMagic();
    initQuests();
    
    switchTab('party');
});
