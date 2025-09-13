const gameData = {
            shrines: [
                { virtue: "Valor", bonus: "+3 Strength" },
                { virtue: "Compassion", bonus: "+3 Dexterity" },
                { virtue: "Honesty", bonus: "+3 Intelligence" },
                { virtue: "Spirituality", bonus: "+1 Str, +1 Dex, +1 Int" },
                { virtue: "Sacrifice", bonus: "+1 Strength, +1 Dexterity" },
                { virtue: "Honor", bonus: "+1 Strength, +1 Intelligence" },
                { virtue: "Justice", bonus: "+1 Dexterity, +1 Intelligence" },
                { virtue: "Humility", bonus: "No bonus" },
            ],
            quests: [
                { 
                    title: "Act I: Liberating the Shrines",
                    content: `
                        <p class="mb-4">Your first mandate from Lord British is to reclaim the eight Shrines of Virtue from the Gargoyles. This requires finding each city's corresponding Rune and cleansing its shrine.</p>
                        <h4 class="font-semibold text-lg mb-2">The Quest for the Runes:</h4>
                        <ul class="list-disc list-inside space-y-2 mb-4">
                            <li><b>Honesty (Moonglow):</b> Obtain the key to Beyvin's tomb from Manrel (south of the Blue Bottle Inn), then unlock the tomb in the catacombs.</li>
                            <li><b>Compassion (Britain):</b> Get permission from Ariana's mother, the barmaid at the Blue Boar, to receive the rune from Ariana.</li>
                            <li><b>Valor (Jhelom):</b> Recruit Sherry the mouse with cheese from Castle British to retrieve the rune through a mouse hole in the Jhelom tavern.</li>
                            <li><b>Justice (Yew):</b> Learn from the prisoner Boskin that the rune is hidden under a plant in Yew's tavern.</li>
                            <li><b>Sacrifice (Minoc):</b> Craft panpipes from a yew log and recite "Stones" (6789878767653) for Selganor to receive the rune.</li>
                            <li><b>Honor (Trinsic):</b> Borrow the rune from its pedestal and return it after use.</li>
                            <li><b>Spirituality (Skara Brae):</b> Find the rune in Marney's hope chest.</li>
                            <li><b>Humility (New Magincia):</b> Solve the mayor's riddle; the answer is Conor the fisherman.</li>
                        </ul>
                        <h4 class="font-semibold text-lg mb-2">Cleansing the Shrines:</h4>
                        <p>With a rune, go to its shrine. Use the rune, speak the mantra (e.g., AHM for Honesty), and take the Moonstone.</p>
                    `
                },
                {
                    title: "Act II: The Prophecy and the Pirates",
                    content: `
                        <p class="mb-4">To understand the Gargoyles, you must translate a book. This leads you into the criminal underworld to find Captain Hawkins' lost treasure.</p>
                        <h4 class="font-semibold text-lg mb-2">The Silver Tablet:</h4>
                        <ul class="list-disc list-inside space-y-2 mb-4">
                            <li>Take the Gargish tome to Mariah at the Lycaeum. She needs the other half of a silver tablet.</li>
                            <li>Find the gypsies near Trinsic, who point you to Homer in Buccaneer's Den.</li>
                            <li>Join the Thieves' Guild in Buccaneer's Den by wearing a guild belt (steal one from Phoenix in the castle sewers—Invisibility helps).</li>
                        </ul>
                        <h4 class="font-semibold text-lg mb-2">Assembling the Map:</h4>
                        <p class="mb-2">Homer reveals the map to the treasure is in nine pieces, scattered across Britannia. Track them down in these places:</p>
                        <ul class="list-disc list-inside space-y-1 mb-4">
                            <li>Dungeon Shame: Old Ybarra will trade a piece for food.</li>
                            <li>Dungeon Wrong/Covetous: Solve a lever puzzle, then find a piece on the third level.</li>
                            <li>The Ant Mound: On the bottom floor, on a corpse deep near the queen.</li>
                            <li>Shipwreck: On the reefs at approximately 71S, 15E.</li>
                            <li>Serpent's Hold: Morchella east of the Hold will trade for a Magic Shield.</li>
                            <li>Dagger Isle: In a hermit's cellar—move the harpsichord.</li>
                            <li>Gypsies north of Paws: Buy a piece from Arturos (or pickpocket).</li>
                            <li>Trinsic: Confront the mayor with his alias "Gordon" to obtain a piece.</li>
                            <li>Homer has one piece; return once you have eight and he will provide the last and the digging instructions.</li>
                        </ul>
                        <h4 class="font-semibold text-lg mb-2">The Pirate's Cave:</h4>
                        <p>Once the map is assembled, sail to the small island southeast of Buccaneer's Den. Follow the misleading signs (go opposite the first "This Way," then follow the next), pass the Maze of Death, and reach the cache. Claim the silver tablet, the Storm Cloak, and the Magic Fan. Return the Storm Cloak to Homer to keep your virtue untarnished.</p>
                    `
                },
                {
                    title: "Act III: The Realm of the Gargoyles",
                    content: `
                        <p class="mb-4">The translated book reveals the Gargoyles are refugees, and the Avatar is their prophesied doom. You must now travel to their realm to forge peace.</p>
                        <h4 class="font-semibold text-lg mb-2">The Path to Peace:</h4>
                        <ul class="list-disc list-inside space-y-2 mb-4">
                            <li>Travel through the dungeon Hythloth on the Isle of the Avatar (recommended). On the lowest level, find Captain Johne to learn the Gargish language. (The Orb of the Moons can also reach the gargoyle realm once you understand its use.)</li>
                            <li>Upon exiting into the gargoyle world, recruit the gargoyle Beh Lem near the Hythloth entrance. He is essential for diplomacy.</li>
                            <li>Meet <b>Lord Draxinusom</b> and agree to wear the Amulet of Submission to prove your peaceful intent.</li>
                        </ul>
                        <h4 class="font-semibold text-lg mb-2">The Sacred Quest:</h4>
                        <p>Build a hot-air balloon (plans beneath Sutek's Castle; basket in Minoc; silk and sewing in Paws; cloth in New Magincia). Use it to float over the mountains to the <b>Shrine of Singularity</b>. Then visit the catacombs of <i>Control</i>, <i>Passion</i>, and <i>Diligence</i> and speak with each altar to learn their mantras (UN, OR, US). Return to the Shrine of Singularity and chant <b>UNORUS</b> to be placed on the sacred quest and gain access to the Codex.</p>
                    `
                },
                {
                    title: "The Final Ritual",
                    content: `
                        <p class="mb-4">To end the conflict, you must perform a ritual to return the Codex to the Ethereal Void, making its wisdom accessible to both humans and gargoyles.</p>
                        <h4 class="font-semibold text-lg mb-2">Gathering the Artifacts:</h4>
                        <ul class="list-disc list-inside space-y-2 mb-4">
                            <li><b>The Vortex Cube:</b> Beneath Stonegate. Catch a fish for the cyclops patriarch to earn a key, then navigate the secret passages to the cube.</li>
                            <li><b>The Gargoyle Lens:</b> Take the broken lens from the Hall of Knowledge to the gargoyle lens maker (northeast of the Seer's home) for repairs.</li>
                            <li><b>The Britannian Lens:</b> Give a glass sword to the astronomer Ephemerides in Moonglow, who will craft the human lens.</li>
                        </ul>
                        <h4 class="font-semibold text-lg mb-2">Returning the Codex:</h4>
                        <p>At the Shrine of the Codex, place the <i>Britannian</i> lens halfway between the left flame and the Codex, and the <i>Gargoyle</i> lens halfway between the right flame and the Codex (you will see rays of light if placed correctly). Set the Vortex Cube before the Codex, drop all eight Moonstones into the cube, then <b>use</b> the cube to complete the ritual.</p>
                    `
                }
            ],
            companions: [
                { name: "Iolo", class: "Bard", location: "Permanent", str: 20, dex: 26, int: 17, level: 3, role: "Core ranged damage dealer." },
                { name: "Shamino", class: "Ranger", location: "Permanent", str: 18, dex: 21, int: 19, level: 3, role: "Versatile fighter/mage hybrid." },
                { name: "Dupre", class: "Fighter", location: "Permanent", str: 26, dex: 20, int: 17, level: 3, role: "Primary frontline tank." },
                { name: "Jaana", class: "Druid", location: "Yew", str: 16, dex: 21, int: 19, level: 4, role: "Excellent dedicated spellcaster." },
                { name: "Julia", class: "Tinker", location: "Minoc", str: 21, dex: 18, int: 17, level: 2, role: "Solid secondary fighter." },
                { name: "Gwenno", class: "Bard", location: "Minoc", str: 18, dex: 21, int: 17, level: 2, role: "A good alternative to Iolo." },
                { name: "Katrina", class: "Farmer", location: "New Magincia", str: 19, dex: 16, int: 16, level: 5, role: "Strong starting level." },
                { name: "Seggallion", class: "Fighter", location: "Serpent's Hold", str: 28, dex: 21, int: 20, level: 5, role: "The strongest pure fighter." },
                { name: "Sentri", class: "Fighter", location: "Serpent's Hold", str: 26, dex: 21, int: 16, level: 3, role: "A reliable alternative to Dupre." },
                { name: "Beh Lem", class: "Gargoyle", location: "Gargoyle Realm", str: 23, dex: 24, int: 26, level: 2, role: "Essential for the final act." },
                { name: "Sherry", class: "Mouse", location: "Castle Britannia", str: 1, dex: 27, int: 12, level: 1, role: "Quest-specific utility." },
            ],
            equipment: [
                { name: "Enilno", type: "2H Sword", stat: "130 Dmg", acq: "Found on level 3 of Hythloth." },
                { name: "Mystic Sword", type: "1H Sword", stat: "24-30 Dmg", acq: "Found in the Avatar's chamber at the Lycaeum." },
                { name: "Magic Armour", type: "Chest", stat: "+10 Armor", acq: "Sold in Trinsic; found in Destard." },
                { name: "Triple Crossbow", type: "Missile", stat: "30 Dmg", acq: "Crafted by Gwenneth at Iolo's Bows." },
                { name: "Storm Cloak", type: "Cloak", stat: "Disables Magic", acq: "Found in the Pirate Cave and Swamp Cave." },
                { name: "Glass Sword", type: "1H Sword", stat: "255 Dmg (1 use)", acq: "Crafted in Minoc; found in dungeons." },
                { name: "Magic Helm", type: "Helmet", stat: "+5 Armor", acq: "Sold in Trinsic; found in Pirate Cave." },
                { name: "Swamp Boots", type: "Boots", stat: "+2 Armor (Negates Poison)", acq: "Sold by Utomo in Yew." },
            ],
            spells: [
                { name: "Heal / Great Heal", circle: "1 / 4", effect: "Restores HP to a single target." },
                { name: "Cure", circle: "1", effect: "Cures poison on a single target." },
                { name: "Unlock Magic", circle: "2", effect: "Opens magically locked doors/chests." },
                { name: "Dispel Field", circle: "3", effect: "Removes magical fields." },
                { name: "Telekinesis", circle: "2", effect: "Manipulates distant objects." },
                { name: "Great Light", circle: "3", effect: "Illuminates dark dungeons." },
                { name: "Invisibility All", circle: "7", effect: "Renders the entire party invisible." },
                { name: "Kill", circle: "7", effect: "Instantly kills a single non-immune enemy." },
                { name: "Death Wind", circle: "8", effect: "Kills multiple enemies in a large area." },
            ],
            dungeons: [
                 { name: "Dungeon Destard (Dragon's Den)", location: "Northwest of Trinsic", objective: "Retrieve a dragon's egg from the fourth level for Sandy's quest. Invisibility is highly recommended." },
                { name: "Dungeon Shame", location: "West of Britannia", objective: "Find the pirate Old Ybarra on the fourth level and trade food for his map piece." },
                { name: "Dungeon Wrong/Covetous", location: "Interconnected", objective: "Find a map piece on the third level after solving a complex lever puzzle on the second." },
                { name: "The Ant Mound", location: "Drylands, south of Shrine of Sacrifice", objective: "Find the body of Ol' Hawknose and his map piece on the bottom floor." },
                { name: "Sutek's Castle", location: "East of Serpent's Hold", objective: "Use a Powder Keg to enter. Find the Balloon Plans in the fourth basement level." },
                { name: "Dungeon Hythloth", location: "Isle of the Avatar", objective: "The main path to the Gargoyle realm. Find Captain Johne on the lowest level to learn Gargish." },
            ],
            passage: [
                { question: "What doth Trolls Lack?", answer: "Endurance", keywords: "trolls, lack", source: "Lord British" },
                { question: "What part of the tangle vine doth put one to sleep?", answer: "Pods", keywords: "tangle, vine, sleep", source: "Lord British" },
                { question: "How wert the headlesses produced?", answer: "Wizard", keywords: "headlesses, produced", source: "Lord British" },
                { question: "What valued item canst one find near the spawning grounds of Hydras?", answer: "Nightshade", keywords: "hydras, nightshade", source: "Lord British" },
                { question: "How canst one fend off Rotworms?", answer: "Torch", keywords: "rotworms, fend, torch", source: "Lord British" },
                { question: "How doth Sea Serpents attack?", answer: "Fireballs", keywords: "sea, serpents, attack", source: "Lord British" },
                { question: "What creature art Wisps oft mistaken for?", answer: "Firefly", keywords: "wisps, mistaken", source: "Lord British" },
                { question: "How doth Giant Squids crush their prey?", answer: "Beak", keywords: "squids, crush, prey", source: "Lord British" },
                { question: "Where hath images of the Silver Serpent been seen?", answer: "Tomb walls", keywords: "silver, serpent, tomb", source: "Lord British" },
                { question: "What art Reapers remnants of?", answer: "Enchanted Forest", keywords: "reapers, remnants", source: "Lord British" },
                { question: "What does the magic syllable 'Zu' mean?", answer: "Sleep", keywords: "zu, mean", source: "Mariah" },
                { question: "What does the magic syllable 'Quas' mean?", answer: "Illusion", keywords: "quas, mean", source: "Mariah" },
                { question: "What does the magic syllable 'Hur' mean?", answer: "Wind", keywords: "hur, mean", source: "Mariah" },
                { question: "What does the magic syllable 'Jux' mean?", answer: "Danger/Trap/Harm", keywords: "jux, mean", source: "Mariah" },
                { question: "What does the magic syllable 'Ort' mean?", answer: "Magic", keywords: "ort, mean", source: "Mariah" },
                { question: "What kind of fork should Mandrake Roots be prepared with?", answer: "Silver", keywords: "mandrake, fork", source: "Selganor" },
                { question: "What part of the Nightshade mushroom is used in spellcasting?", answer: "Cap", keywords: "nightshade, mushroom, part", source: "Selganor" },
                { question: "Where does Sulfurous Ash come from?", answer: "Volcanic Eruptions", keywords: "sulfurous, ash, from", source: "Selganor" },
                { question: "What are the Black Pearls used for?", answer: "Kinetic propellant", keywords: "black, pearls, used", source: "Selganor" },
            ]
        };

        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
        }

        function showAlmanacTab(tabId) {
            document.querySelectorAll('.almanac-tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.almanac-tab-button').forEach(button => {
                button.classList.remove('active', 'text-amber-700', 'border-amber-700');
                button.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'border-transparent');
            });
            document.getElementById(tabId).classList.add('active');
            const activeButton = document.querySelector(`.almanac-tab-button[onclick="showAlmanacTab('${tabId}')"]`);
            activeButton.classList.add('active', 'text-amber-700', 'border-amber-700');
            activeButton.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'border-transparent');
            // Then hide all contents not in the active tab
            document.querySelectorAll('.almanac-tab-content').forEach(tab => {
                if (tab.id !== tabId) {
                    tab.classList.add('hidden');
                }
            });
            // Then show the active tab
            document.getElementById(tabId).classList.remove('hidden');
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            populateStaticData();
            setupEventListeners();
            setupVirtueChart();
            renderPassageList(gameData.passage);
            document.getElementById('passage-search').addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredPassage = gameData.passage.filter(p => 
                    p.question.toLowerCase().includes(searchTerm) || 
                    p.answer.toLowerCase().includes(searchTerm) ||
                    p.source.toLowerCase().includes(searchTerm)
                );
                renderPassageList(filteredPassage);
            });
        });
        
        function populateStaticData() {
            const shrineList = document.getElementById('shrine-list');
            gameData.shrines.forEach(shrine => {
                const li = document.createElement('li');
                li.className = "p-3 bg-white/50 rounded-md border border-amber-200";
                li.innerHTML = `<span class="font-semibold text-amber-900">${shrine.virtue}:</span> <span class="text-amber-800">${shrine.bonus}</span>`;
                shrineList.appendChild(li);
            });

            const questAccordion = document.getElementById('quest-accordion');
            gameData.quests.forEach((quest) => {
                const div = document.createElement('div');
                div.className = "border border-amber-200 rounded-lg bg-white/50";
                div.innerHTML = `
                    <button class="accordion-toggle w-full text-left p-4 font-semibold text-xl text-amber-900 flex justify-between items-center">
                        ${quest.title}
                        <span class="transform transition-transform duration-300 text-amber-700">&#9662;</span>
                    </button>
                    <div class="accordion-content px-4 pb-4 text-amber-900/80">${quest.content}</div>`;
                questAccordion.appendChild(div);
            });

        const equipmentList = document.getElementById('equipment-list');
        gameData.equipment.forEach(item => {
            const div = document.createElement('div');
            div.className = "p-4 bg-white/50 rounded-md border border-amber-200";
            div.innerHTML = `<h4 class="font-bold text-lg text-amber-900">${item.name}</h4><p class="text-sm text-amber-800">${item.type} - <span class="font-semibold">${item.stat}</span></p><p class="text-xs text-amber-700/80 mt-1">${item.acq}</p>`;
            equipmentList.appendChild(div);
        });

        const spellsList = document.getElementById('spells-list');
        gameData.spells.forEach(spell => {
            const div = document.createElement('div');
            div.className = "p-4 bg-white/50 rounded-md border border-amber-200";
            div.innerHTML = `<h4 class="font-bold text-lg text-amber-900">${spell.name}</h4><p class="text-sm text-amber-800">Circle ${spell.circle}</p><p class="text-xs text-amber-700/80 mt-1">${spell.effect}</p>`;
            spellsList.appendChild(div);
        });
        
        const dungeonList = document.getElementById('dungeon-list');
        gameData.dungeons.forEach(dungeon => {
            const div = document.createElement('div');
            div.className = "p-4 bg-white/50 rounded-md border border-amber-200";
            div.innerHTML = `<h4 class="font-bold text-lg text-amber-900">${dungeon.name}</h4><p class="text-sm text-amber-800 italic">${dungeon.location}</p><p class="text-amber-900/90 mt-2">${dungeon.objective}</p>`;
            dungeonList.appendChild(div);
        });
        
        const virtueSelection = document.getElementById('virtue-selection');
        gameData.shrines.map(s => s.virtue).filter(v => v !== "Humility").forEach(virtue => {
            const label = document.createElement('label');
            label.className = "flex items-center space-x-2 cursor-pointer";
            label.innerHTML = `<input type="checkbox" name="virtue" value="${virtue}" class="form-checkbox h-5 w-5 rounded text-amber-600 focus:ring-amber-500 border-amber-300"><span>${virtue}</span>`;
            virtueSelection.appendChild(label);
        });

        renderCompanionTable(gameData.companions);
    }

    function setupEventListeners() {
        document.querySelectorAll('.accordion-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const content = button.nextElementSibling;
                const icon = button.querySelector('span');
                const isOpening = !content.style.maxHeight;
                
                button.closest('#quest-accordion').querySelectorAll('.accordion-content').forEach(item => {
                    item.style.maxHeight = null;
                    item.previousElementSibling.querySelector('span').style.transform = 'rotate(0deg)';
                });

                if (isOpening) {
                    content.style.maxHeight = content.scrollHeight + "px";
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        });

        document.getElementById('generate-chronicle').addEventListener('click', generateChronicle);
        document.getElementById('ask-seer').addEventListener('click', askTheSeer);
    }

    let sortDirection = {};
    function renderCompanionTable(data) {
        const tableHead = document.getElementById('companion-table-head');
        const tableBody = document.getElementById('companion-table-body');
        tableHead.innerHTML = `<tr class="bg-amber-100/50"><th class="p-3 cursor-pointer" onclick="sortTable('name')">Name</th><th class="p-3 cursor-pointer" onclick="sortTable('class')">Class</th><th class="p-3 cursor-pointer" onclick="sortTable('str')">STR</th><th class="p-3 cursor-pointer" onclick="sortTable('dex')">DEX</th><th class="p-3 cursor-pointer" onclick="sortTable('int')">INT</th><th class="p-3 cursor-pointer" onclick="sortTable('level')">Level</th></tr>`;
        tableBody.innerHTML = '';
        data.forEach(c => {
            const row = document.createElement('tr');
            row.className = 'border-b border-amber-200/50 hover:bg-amber-100/30';
            row.innerHTML = `<td class="p-3 font-semibold">${c.name}</td><td class="p-3">${c.class}</td><td class="p-3 text-center">${c.str}</td><td class="p-3 text-center">${c.dex}</td><td class="p-3 text-center">${c.int}</td><td class="p-3 text-center">${c.level}</td>`;
            tableBody.appendChild(row);
        });
    }

    function sortTable(key) {
        const isAsc = sortDirection[key] === 'asc';
        sortDirection = { [key]: isAsc ? 'desc' : 'asc' };
        const sortedData = [...gameData.companions].sort((a, b) => {
            if (a[key] < b[key]) return isAsc ? -1 : 1;
            if (a[key] > b[key]) return isAsc ? 1 : -1;
            return 0;
        });
        renderCompanionTable(sortedData);
    }

    async function callGeminiAPI(prompt, outputElement) {
        outputElement.innerHTML = '<div class="flex justify-center"><div class="loader"></div></div>';
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiUrl = '/php/llm.php';

        try {
            let response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                outputElement.innerHTML = `<div class="gemini-response">${text}</div>`;
            } else {
                throw new Error("Invalid response structure from API.");
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            outputElement.innerHTML = `<div class="gemini-response text-red-800">The ethereal winds are turbulent. The seer's voice cannot be heard at this time. Please try again later.</div>`;
        }
    }

    function generateChronicle() {
        const selectedVirtues = Array.from(document.querySelectorAll('input[name="virtue"]:checked')).map(cb => cb.value);
        if (selectedVirtues.length === 0) {
            alert("Please select at least one virtue to generate your chronicle.");
            return;
        }
        const prompt = `Write a short, epic backstory for a heroic Avatar in the fantasy world of Britannia from the game Ultima VI. The story should be about 150 words and written in the style of a classic fantasy novel. The Avatar's character is defined by these core virtues: ${selectedVirtues.join(', ')}. Explain how their past experiences led them to embody these specific virtues.`;
        const outputElement = document.getElementById('chronicle-output');
        callGeminiAPI(prompt, outputElement);
    }

    function askTheSeer() {
        const query = document.getElementById('seer-query').value;
        if (!query.trim()) {
            alert("You must first pose a question to the seer.");
            return;
        }
        const prompt = `You are a far-seeing seer in Ultima VI: The False Prophet. Ground your guidance in this quest context (use it to inform your answer; do not just restate it):

- Act I — Liberate the Shrines: find each Rune and mantra, cleanse the eight shrines, and collect the Moonstones.
- Act II — Prophecy & Pirates: take the Gargish book to Mariah; assemble Captain Hawkins’s nine map pieces (Shame, Wrong/Covetous, Ant Mound, shipwreck at ~71S 15E, Serpent’s Hold trade for a Magic Shield, Dagger Isle hermit, gypsies north of Paws, Trinsic mayor “Gordon”, plus Homer) to reach the Pirate Cave and recover the silver tablet; return the Storm Cloak to Homer.
- Act III — Gargoyle Realm: through Hythloth meet Captain Johne, recruit Beh Lem, wear the Amulet of Submission before Lord Draxinusom; build the balloon to reach the Shrine of Singularity, learn UN, OR, US and chant UNORUS.
- Final Ritual: recover the Vortex Cube at Stonegate; repair the Gargoyle lens and obtain the Britannian lens (glass sword → Ephemerides); at the Codex, set each lens halfway between its flame and the Codex, load all eight Moonstones into the Cube, then use it.

Answer in 2–3 short paragraphs, in-character and practical, giving clear hints and options (avoid unnecessary spoilers). Player’s question: "${query}"`;
        const outputElement = document.getElementById('seer-response');
        callGeminiAPI(prompt, outputElement);
    }

    function setupVirtueChart() {
        const ctx = document.getElementById('virtueChart').getContext('2d');
        const virtueData = { 'Valor': { str: 9, dex: 0, int: 0 }, 'Compassion': { str: 0, dex: 9, int: 0 }, 'Honesty': { str: 0, dex: 0, int: 9 }, 'Spirituality': { str: 3, dex: 3, int: 3 }, 'Sacrifice': { str: 3, dex: 3, int: 0 }, 'Honor': { str: 3, dex: 0, int: 3 }, 'Justice': { str: 0, dex: 3, int: 3 }, };
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(virtueData),
                datasets: [
                    { label: 'Strength Bonus', data: Object.values(virtueData).map(v => v.str), backgroundColor: 'rgba(180, 83, 9, 0.6)', borderColor: 'rgba(180, 83, 9, 1)', borderWidth: 1 },
                    { label: 'Dexterity Bonus', data: Object.values(virtueData).map(v => v.dex), backgroundColor: 'rgba(202, 138, 4, 0.6)', borderColor: 'rgba(202, 138, 4, 1)', borderWidth: 1 },
                    { label: 'Intelligence Bonus', data: Object.values(virtueData).map(v => v.int), backgroundColor: 'rgba(120, 53, 15, 0.6)', borderColor: 'rgba(120, 53, 15, 1)', borderWidth: 1 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { x: { stacked: true, ticks: { color: '#382D24' }, grid: { display: false } }, y: { stacked: true, beginAtZero: true, ticks: { color: '#382D24' }, grid: { color: '#D2B48C' } } },
                plugins: {
                    title: { display: true, text: 'Maximum Potential Stat Bonuses from Virtues', color: '#382D24', font: { size: 16, family: "'IM Fell English', serif" } },
                    tooltip: { mode: 'index', intersect: false }
                }
            }
        });
    }

    function renderPassageList(data) {
        const passageList = document.getElementById('passage-list');
        passageList.innerHTML = '';
        if (data.length === 0) {
            passageList.innerHTML = `<p class="text-amber-800/70">No matching entries found.</p>`;
            return;
        }
        data.forEach(p => {
            const div = document.createElement('div');
            div.className = "p-4 bg-white/50 rounded-md border border-amber-200";
            div.innerHTML = `
                <p class="text-sm text-amber-700/80">Asked by: ${p.source}</p>
                <p class="font-semibold text-amber-900 mt-1">Q: ${p.question}</p>
                <p class="text-lg font-bold text-amber-800 mt-1">A: ${p.answer}</p>
            `;
            passageList.appendChild(div);
        });
    }