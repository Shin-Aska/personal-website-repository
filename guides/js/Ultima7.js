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
        { title: "The Trinsic Murders", content: "Investigate the ritualistic murder in the stables. Examine the crime scene for a key. Interview Spark, Gilberto, and Klog to identify the suspect (man with a hook) and his escape vessel (the Crown Jewel). Report to Mayor Finnigan and pass his copy protection quiz with these answers:<br><br><b class='text-yellow-300'>Spektran latitude:</b> 120<br><b class='text-yellow-300'>Terfin longitude:</b> 120<br><b class='text-yellow-300'>Dagger Isle latitude:</b> 0<br><b class='text-yellow-300'>Skara Brae latitude:</b> 30<br><b class='text-yellow-300'>Deep Forest latitude:</b> 60<br><b class='text-yellow-300'>Buccaneer's Den latitude:</b> 60<br><b class='text-yellow-300'>Skara Brae longitude:</b> 60<br><br>He will then give you the password 'Blackbird' to leave the city." },
        { title: "Infiltrating the Fellowship", content: "In Britain, meet Batlin and feign interest in joining the Fellowship. Deliver a sealed package to Elynor in Minoc. When you return, Batlin assigns you to fetch 'funds' from Dungeon Destard — it's a trap, so be cautious. Attend the 9 PM service and answer questions from the Book of Fellowship to progress your membership." },
        { title: "The Quest for the Time Lord", content: "Follow the gypsy's advice. Go to the Deep Forest and find the silent wisp. Get honey from the Bee Cave to bribe the emps. Negotiate with the emps to get a wisp whistle. Use the whistle to communicate with the wisp, who demands Alagner's notebook from New Magincia in exchange for information." },
        { title: "The Answers to Life and Death", content: "In New Magincia, Alagner asks you to learn the answers to life and death from Skara Brae. Use the Seance spell to travel to the haunted island. Help the spirits by defeating the liche Horance. This involves brewing a potion, forging a Soul Cage, and destroying the Well of Souls. Caine will then reveal the 'answers'. Return to Alagner to get his notebook." },
        { title: "Destroying the Guardian's Generators", content: "Give the notebook to the wisp to contact the Time Lord. He reveals the Guardian's plot and the three generators that must be destroyed. <br><b>1. Tetrahedron (Deceit):</b> Get blackrock for Penumbra, acquire the Ethereal Ring from Lord Draxinusom in Terfin, have it enchanted, and destroy the prism. <br><b>2. Sphere (Despise):</b> Get the Hourglass of Nicodemus, have it enchanted (after the Tetrahedron is down), and navigate the moongate puzzle (down, up, down, down, up) to destroy the prism. <br><b>3. Cube (Meditation Retreat):</b> Find Caddellite from meteorites in the northeast seas, have Zorn in Minoc forge helmets, and wear them to safely destroy the final generator." },
        { title: "The Isle of the Avatar and Final Battle", content: "Use the Cube prism to reveal the Fellowship's lies and identify the conspirators. In Buccaneer's Den, track down Hook and recover the key you need. Travel to the Isle of the Avatar and descend into Hythloth. Place the three generator prisms on their pedestals to disable the Black Gate's power beam. Finally, use Rudyom's Wand on the Black Gate to destroy it and save Britannia." }
    ],
    sideQuests: [
        { name: "Free Weston!", location: "Paws", giver: "Weston", reward: "20 XP", walkthrough: "Weston is jailed in Lord British's castle for stealing an apple. Plead his case to Lord British for his release." },
        { name: "Who Stole the Poison?", location: "Paws", giver: "Morfin", reward: "150 XP", walkthrough: "Investigate a family feud. The stolen poison vial is in Garritt's chest. Confront him for a confession." },
        { name: "Where Does Patterson go at Night?", location: "Britain", giver: "Judith", reward: "60 XP", walkthrough: "Follow Patterson after a Fellowship meeting to Candice's house. Confront him about his affair." },
        { name: "Miranda's Law", location: "Britain", giver: "Miranda", reward: "20 XP", walkthrough: "Take Miranda's bill to clean up Lock Lake to Lord Heather in Cove for a signature, then return it." },
        { name: "Nastassia's Father", location: "Cove", giver: "Nastassia", reward: "50 XP", walkthrough: "Ask the Emp Trellek in the Deep Forest about Julius. He will reveal Julius was a hero. Report this back to Nastassia." },
        { name: "Owen the Shipwright, Hero or Fraud?", location: "Minoc", giver: "Various", reward: "100 XP", walkthrough: "Get the original ship plans from the hermit Karl. Show them to Julia the tinker, who confirms the design is flawed. Present the evidence to Mayor Burnside." },
        { name: "The Honor Flag", location: "Jhelom", giver: "Sprellic", reward: "100 XP", walkthrough: "Either fight three duels for Sprellic, or more cleverly, have the armorer Kliftin weave a replica of the stolen flag and give it to the fighters." },
        { name: "Blorn's Accusations", location: "Vesper", giver: "Blorn", reward: "50 XP", walkthrough: "Speak to the accused gargoyle, Lap-Lem. He was the victim. Confront Blorn to get Lap-Lem's stolen amulet back and return it." },
        { name: "Where does Catherine Go?", location: "Vesper", giver: "Yvella", reward: "50 XP", walkthrough: "Follow Catherine to the gargoyle side of town. She listens to stories from an elder gargoyle. Keeping this secret is the peaceful option." },
        { name: "Balayna's Doubts", location: "Moonglow", giver: "Balayna", reward: "50 XP", walkthrough: "A quest highlighting the Fellowship's sinister nature. Reporting Balayna's doubts to Rankin leads to her death or disappearance." },
        { name: "Brion's Orrery", location: "Moonglow", giver: "Brion", reward: "Brion activates the orrery", walkthrough: "Buy a special crystal from the adventurer Addon for 20 gold and give it to Brion so he can power the observatory's orrery." },
        { name: "Who wants to destroy the Shrine?", location: "Terfin", giver: "Teregus", reward: "100 XP", walkthrough: "Investigate Sarpling's home to find a note implicating Runeb in a plot against the Altars. Confront Runeb to resolve the threat." },
        { name: "Mysterious Monk", location: "Yew", giver: "Kreg", reward: "100 XP", walkthrough: "Kreg is a criminal in hiding. Research court records to discover his identity and confront him, which will provoke an attack." },
        { name: "Who Defaced Lord British?", location: "Serpent's Hold", giver: "Lord John-Paul", reward: "100 XP", walkthrough: "A lengthy investigation reveals the knight Pendaran is the vandal. Report this to Lord John-Paul for judgment." },
        { name: "Tory's Baby", location: "Serpent's Hold", giver: "Tory", reward: "100 XP", walkthrough: "The baby, Riky, is at the Shrine of Honour (142S, 9W). Defeat the harpies and return him to his mother." },
    ]
};

// Helpful, spoiler-light offline hints to ensure useful guidance without relying entirely on the AI
const OFFLINE_HINTS = {
    "The Trinsic Murders": "• Check the stables for a golden key and speak with Spark about what he saw.\n• Question Gilberto at the healer and note the ship 'Crown Jewel'.\n• Pass Mayor Finnigan’s quiz to get the password 'Blackbird' to leave Trinsic.",
    "Infiltrating the Fellowship": "• Deliver Batlin’s sealed package to Elynor in Minoc first.\n• Return at 9 PM for the service, then accept the 'funds' errand to Destard (it’s a trap).\n• Bring supplies—Destard isn’t deserted.",
    "The Quest for the Time Lord": "• Bring honey from the Bee Cave to befriend the emps.\n• Ask Trellek for help and get a wisp whistle.\n• Use the whistle near the Deep Forest wisp and prepare to fetch Alagner’s notebook.",
    "The Answers to Life and Death": "• Reach Skara Brae (Séance helps) and speak to Mordra the necromancer.\n• Free Rowena from Horance’s influence, then craft a Soul Cage and resolve the Well of Souls.\n• Caine will share what Alagner needs.",
    "Destroying the Guardian's Generators": "• Order matters: Tetrahedron (Deceit) → Sphere (Despise) → Cube (Meditation Retreat).\n• You’ll need: blackrock for Penumbra, the Ethereal Ring (from Lord Draxinusom in Terfin), Nicodemus’s Hourglass, and Caddellite helms (Zorn in Minoc).\n• Mark & Recall save lots of time.",
    "The Isle of the Avatar and Final Battle": "• Use the Cube prism to unmask conspirators, then recover the needed key in Buccaneer’s Den.\n• On the Isle, place all three prisms on their pedestals to disable the beam.\n• Use Rudyom’s Wand on the Black Gate—no big battle needed there.",

    // Side quests
    "Free Weston!": "• Visit the jail in Castle British and speak with Weston.\n• Bring his case to Lord British directly for judgment.\n• You don’t need to sneak anything—just ask for clemency.",
    "Who Stole the Poison?": "• Talk to Morfin in Paws to start.\n• Search Morfin’s house for a key, then check the Shelter’s locked chest.\n• Confront the boy who seems nervous; return the vial to Morfin.",
    "Where Does Patterson go at Night?": "• Attend the 9 PM Fellowship meeting in Britain.\n• After it ends, quietly follow Patterson.\n• Confront him at his destination and hear him out.",
    "Miranda's Law": "• Get Miranda’s bill signed by Lord Heather in Cove.\n• He’s often at the healer’s.\n• Return the signed bill to Miranda in Britain.",
    "Nastassia's Father": "• In Cove, agree to seek news for Nastassia.\n• Ask the Emps in the Deep Forest, starting with Trellek.\n• Bring the answer back to her.",
    "Owen the Shipwright, Hero or Fraud?": "• In Minoc, look for plans/evidence about Owen’s ships.\n• Show them to a skilled tinker for an expert opinion.\n• Present the findings to Mayor Burnside.",
    "The Honor Flag": "• Talk to Sprellic in Jhelom and hear his story.\n• Either duel as his champion or ask Kliftin about making a replacement.\n• Resolve it peacefully if you can.",
    "Blorn's Accusations": "• Hear Blorn out in Vesper.\n• Speak to Lap-Lem to get the other side of the story.\n• Confront Blorn about the missing amulet and return it.",
    "Where does Catherine Go?": "• Watch Yvella’s daughter around noon.\n• Follow her to the gargoyle quarter—observe quietly.\n• Keeping her trust is the kindest outcome.",
    "Balayna's Doubts": "• Balayna confides concerns about Rankin in Moonglow.\n• Consider the consequences before reporting anything.\n• Sometimes discretion is the safer path.",
    "Brion's Orrery": "• Ask Brion at the Observatory about his missing part.\n• Buy the crystal from Addon at the tavern (20 gold).\n• Deliver it back so he can power the orrery.",
    "Who wants to destroy the Shrine?": "• In Terfin, speak with Teregus.\n• Search Sarpling’s quarters for a note.\n• Confront Runeb with the evidence and be ready for a fight.",
    "Mysterious Monk": "• At Empath Abbey, a monk named Kreg asks about invisibility.\n• Check records in Yew to confirm identities.\n• Prepare for a confrontation once you expose him.",
    "Who Defaced Lord British?": "• In Serpent’s Hold, gather forensics (stone chips, blood).\n• Consult Lady Leigh and Lady Tory for leads.\n• Report your findings to Lord John‑Paul.",
    "Tory's Baby": "• Search the Shrine of Honour (around 142S, 9W).\n• Harpies may be present—clear them out.\n• Return the baby to Tory in the Keep."
};

// Hardcoded, non‑AI companion backstories
const BACKSTORIES = {
    "Iolo": "Strings hum beneath my fingers as I travel once more with the Avatar. Britain changes, but a good bow and a good song never fail. If danger comes, I’ll whistle before the arrow flies—and jest after. A merry heart steadies the hand.",
    "Shamino": "The Deep Forest remembers those who walk it with care. I have been a ranger, a lord, and a friend—titles fall like leaves, but duty remains. I scout the wild paths ahead so the others may sleep without fear.",
    "Dupre": "Ale can warm a night, but honor warms the soul. Steel polished, tabard straight—I’ll stand in the door and take the blow meant for another. If courage is tested, let it be mine first.",
    "Spark": "I keep my sling close and my promise closer. Christopher’s gone, but I won’t let what happened to him happen to anyone else. If I can help the Avatar, then I’ll grow up faster than the world expects.",
    "Sentri": "Discipline is a road, not a destination. I drill until the blade feels like an extra finger and the footwork a familiar song. If the Avatar asks, I’ll train the others too—dexterity first, then the hand that wields it.",
    "Tseramed": "Bees teach patience. You move slowly, breathe slowly, and the world moves with you. Tracks tell stories the tongue forgets. I follow them and watch the horizon for the party’s sake.",
    "Jaana": "Cove’s quiet taught me that healing is more than poultices and prayer. A word can knit a wound the needle cannot. I’ll tend the fallen, soothe the frightened, and if need be, call on the old druidry.",
    "Katrina": "Once a shepherd, always a guardian. Flocks, friends, or strangers—it makes no difference. New Magincia bred humility in me, but humility is not weakness. I will stand when standing is all that’s left.",
    "Julia": "Gears don’t lie. Measure twice, cut once, and keep your tools sharp—truth follows. Where others see a lock, I see tolerances; where they see a problem, I see a diagram. With the Avatar, the design is simple: fix what’s broken."
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
    // Handcrafted prompts loaded from prompts/ultima7_prompts.json
    let QUEST_PROMPTS = {};
    // Simple in-memory chat history keyed by quest title/name
    const questChatHistory = {};

    // --- Gemini API Integration ---
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
                    return "My apologies, Avatar. My connection to the ethereal plane is weak. Please try again shortly.";
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
        // Allow a small badge in the title (e.g., non‑spoiler)
        aiModalTitle.innerHTML = title;
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
        // Removed party strategy button binding per request

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

        function handleGenerateBackstory(id) {
            const c = DB.companions[id];
            const backstory = BACKSTORIES[c.name] || 'No backstory available.';
            showAiModal();
            displayAiResponse(backstory, `📑 ${c.name}'s Journal`);
        }

        // Get Party Strategy feature removed per request

        function displayCompanionDetails(id) {
            const c = DB.companions[id];
            details.innerHTML = `
                <div class="flex flex-col md:flex-row gap-6">
                    <div class="flex-grow">
                        <h3 class="text-3xl font-bold">${c.name}</h3>
                        <p class="text-lg text-secondary">${c.role}</p>
                        <p class="mt-4"><span class="font-semibold">Location:</span> ${c.location}</p>
                        <p class="mt-2 bg-[#1a202c] p-3 rounded-md"><span class="font-semibold">Notes:</span> ${c.notes || 'No special notes.'}</p>
                        <button id="generate-backstory-btn" class="ai-button mt-4 w-full font-bold py-2 px-4 rounded-lg">Backstory</button>
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

    // Equipment lore feature removed per request

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
            `;
        });

        // Removed lore button event listener per request

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
        // Open modal and show quest-specific chat inside it
        showAiModal();
        const key = quest.title || quest.name;
        await ensurePromptsLoaded();
        openQuestChatInModal(key, quest);
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
                    <button data-quest-index="${index}" class="get-main-quest-hint ai-button mt-3 w-full font-bold py-1 px-3 rounded-lg text-xs">✨ Hint</button>
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
                    <button data-quest-name="${quest.name}" class="get-side-quest-hint ai-button mt-3 w-full font-bold py-1 px-3 rounded-lg text-xs">✨ Hint</button>
                `;
                sideQuestList.appendChild(card);
            });
        }

        sideQuestList.addEventListener('click', e => {
            if (e.target.classList.contains('get-side-quest-hint')) {
                const questName = e.target.dataset.questName;
                const quest = DB.sideQuests.find(q => q.name === questName);
                if (quest) handleGetQuestHint(quest);
            }
        });

        locationFilter.addEventListener('change', (e) => renderSideQuests(e.target.value));
        renderSideQuests();

        // (Modal chat now handles prompt loading on demand)
    }

    async function loadQuestPrompts() {
        try {
            const res = await fetch('prompts/ultima7_prompts.json', { cache: 'no-store' });
            if (!res.ok) throw new Error(`Failed to load prompts: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.warn('[prompts] Load failed, falling back to dynamic context.', e);
            return {};
        }
    }

    function extractContext(template) {
        const match = template.match(/<context>[\s\S]*?<\/context>/i);
        return match ? match[0] : template;
    }

    async function ensurePromptsLoaded() {
        if (Object.keys(QUEST_PROMPTS || {}).length > 0) return;
        QUEST_PROMPTS = await loadQuestPrompts();
    }

    function openQuestChatInModal(key, quest) {
        const badge = "<span class='ml-2 align-middle text-[10px] px-2 py-0.5 rounded bg-yellow-200/20 text-yellow-100 border border-yellow-300/40'>AI powered</span>";
        aiModalTitle.innerHTML = `✨ ${key} ${badge}`;

        const offlineHint = OFFLINE_HINTS[key] || 'No offline hint available.';
        const template = QUEST_PROMPTS[key] || defaultQuestTemplate(key);

        // Tabs: General Hints | Advice
        aiResponseText.innerHTML = `
            <div class="flex flex-col max-h-[75vh] min-h-0">
                <div id="modal-tabbar" class="flex gap-2 border-b border-color mb-3">
                    <button id="modal-tab-hints" class="px-3 py-1 rounded-t bg-[#1a202c] text-sm font-semibold border border-color border-b-0 text-[#f6e05e]">General Hints</button>
                    <button id="modal-tab-advice" class="px-3 py-1 rounded-t text-sm font-semibold border border-transparent hover:border-color text-gray-400">Advice</button>
                </div>
                
                <section id="tab-hints" class="h-full overflow-auto min-h-0">
                    <div class="rounded bg-[#102a43]/40 p-3 border border-color text-[13px] whitespace-pre-wrap">${offlineHint.replace(/</g,'&lt;')}</div>
                    <div class="mt-3 rounded bg-[#0f1720]/60 p-2 border border-color text-[12px]">Tip: For more help, switch to the Advice tab and ask the Sage for guidance.</div>
                </section>
                <section id="tab-advice" class="hidden h-full flex flex-col min-h-0 overflow-hidden">
                    <div id="modal-quest-chat-messages" class="flex-1 min-h-40 overflow-y-auto bg-[#0f1720] border border-color rounded p-3 text-sm space-y-2"></div>
                    <div class="flex gap-2 mt-3">
                        <input id="modal-quest-chat-input" class="flex-1 bg-[#1a202c] border border-color rounded px-3 py-2 text-sm" placeholder="Ask the Sage for advice…" />
                        <button id="modal-quest-chat-send" class="ai-button font-bold px-4 py-2 rounded">Send</button>
                    </div>
                </section>
            </div>
        `;
        aiLoader.style.display = 'none';

        // Wire tab handlers
        const tabHintsBtn = document.getElementById('modal-tab-hints');
        const tabAdviceBtn = document.getElementById('modal-tab-advice');
        const tabHints = document.getElementById('tab-hints');
        const tabAdvice = document.getElementById('tab-advice');

        function switchModalTab(which) {
            const active = ['bg-[#1a202c]','border','border-color','border-b-0','text-[#f6e05e]'];
            const inactive = ['bg-transparent','border','border-transparent','text-gray-400'];
            const setActive = (btn) => { btn.classList.add(...active); btn.classList.remove(...inactive); };
            const setInactive = (btn) => { btn.classList.remove(...active); btn.classList.add(...inactive); };
            if (which === 'hints') {
                tabHints.classList.remove('hidden');
                tabAdvice.classList.add('hidden');
                setActive(tabHintsBtn);
                setInactive(tabAdviceBtn);
            } else {
                tabAdvice.classList.remove('hidden');
                tabHints.classList.add('hidden');
                setActive(tabAdviceBtn);
                setInactive(tabHintsBtn);
            }
        }
        tabHintsBtn.addEventListener('click', () => switchModalTab('hints'));
        tabAdviceBtn.addEventListener('click', () => switchModalTab('advice'));
        switchModalTab('hints');

        // Chat wiring
        const msgEl  = document.getElementById('modal-quest-chat-messages');
        const inputEl= document.getElementById('modal-quest-chat-input');
        const sendBtn= document.getElementById('modal-quest-chat-send');

        // Greet user in chat panel
        appendChat(msgEl, 'assistant', `How can I help you with "${key}", Avatar?`);

        function send() {
            sendQuestChatMessageForKey(key, inputEl, msgEl, sendBtn);
            // auto-switch to Advice tab when sending from Hints (in case user clicks Enter there later)
            switchModalTab('advice');
        }
        sendBtn.addEventListener('click', send);
        if (inputEl) {
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            });
        }
    }

    async function sendQuestChatMessageForKey(key, inputEl, msgEl, sendBtn) {
        const userMsg = inputEl.value.trim();
        if (!userMsg) return;
        appendChat(msgEl, 'user', userMsg);
        inputEl.value = '';

        // Disable input and show typing indicator
        if (sendBtn) { sendBtn.disabled = true; sendBtn.classList.add('opacity-50','cursor-not-allowed'); }
        inputEl.disabled = true;
        inputEl.classList.add('opacity-75');
        const thinkingEl = document.createElement('div');
        thinkingEl.id = 'modal-typing-indicator';
        thinkingEl.className = 'text-xs text-gray-400 italic';
        thinkingEl.textContent = 'Sage is thinking…';
        msgEl.appendChild(thinkingEl);
        msgEl.scrollTop = msgEl.scrollHeight;

        let template = QUEST_PROMPTS[key] || defaultQuestTemplate(key);
        const hist = questChatHistory[key] || [];
        const transcript = hist.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
        const mergedQuery = (transcript ? `Prior transcript (most recent last):\n${transcript}\n\n` : '') + `User: ${userMsg}`;
        const finalPrompt = template.replace(/<query>[\s\S]*?<\/query>/i, `<query>\n${mergedQuery}\n<\/query>`);

        // Call LLM and append
        const reply = await callGemini(finalPrompt);
        if (thinkingEl && thinkingEl.parentNode) thinkingEl.remove();
        appendChat(msgEl, 'assistant', reply);

        hist.push({ role: 'user', text: userMsg });
        hist.push({ role: 'assistant', text: reply });
        questChatHistory[key] = hist.slice(-10);

        // Re-enable input and send button
        inputEl.disabled = false;
        inputEl.classList.remove('opacity-75');
        if (sendBtn) { sendBtn.disabled = false; sendBtn.classList.remove('opacity-50','cursor-not-allowed'); }
        inputEl.focus();
    }

    function appendChat(container, role, text) {
        const bubble = document.createElement('div');
        bubble.className = role === 'user' ? 'bg-[#1a202c] p-2 rounded self-end' : 'bg-[#102a43] p-2 rounded';
        bubble.textContent = (role === 'user' ? 'You: ' : 'Sage: ') + text;
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    }

    // (Modal chat now handles prompt loading on demand)

    initPartyBuilder();
    initArmory();
    initMagic();
    initQuests();

    switchTab('party');
});
