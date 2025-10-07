function parsePcItemList(raw) {
    const entries = [];
    const seen = new Set();
    raw.split("\n").forEach(line => {
        line.split('|').forEach(segment => {
            const clean = segment.trim();
            if (!clean) {
                return;
            }
            const match = clean.match(/^(\d+)\s*-\s*(.+)$/);
            if (!match) {
                return;
            }
            const [_, id, name] = match;
            if (seen.has(id)) {
                return;
            }
            seen.add(id);
            entries.push({ id, name: name.trim() });
        });
    });
    return entries.sort((a, b) => Number(a.id) - Number(b.id));
}

function buildPcItemTable(items) {
    if (!Array.isArray(items) || !items.length) {
        return `<p class="text-sm text-amber-800/80">No items to display.</p>`;
    }
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
        const left = items[i];
        const right = items[i + 1];
        rows.push(`
            <tr>
                <td class="py-1 pr-3 font-mono text-sm text-amber-900/90">${left.id}</td>
                <td class="py-1 pr-4 text-sm text-amber-900/90">${left.name}</td>
                ${right ? `<td class="py-1 pr-3 font-mono text-sm text-amber-900/90">${right.id}</td><td class="py-1 text-sm text-amber-900/90">${right.name}</td>` : '<td></td><td></td>'}
            </tr>
        `);
    }
    return `
        <div class="mt-4 overflow-x-auto border border-amber-200 rounded-lg">
            <table class="w-full text-left border-collapse min-w-max">
                <thead class="bg-amber-100/70 text-amber-900 text-sm uppercase tracking-wide">
                    <tr>
                        <th class="py-2 pr-3">ID</th>
                        <th class="py-2 pr-4">Item</th>
                        <th class="py-2 pr-3">ID</th>
                        <th class="py-2">Item</th>
                    </tr>
                </thead>
                <tbody>${rows.join('')}</tbody>
            </table>
        </div>
    `;
}

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
                    intro: "Lord British tasks you with reclaiming the eight runes, freeing every shrine, and restoring virtue to Britannia.",
                    sections: [
                        {
                            heading: "Compassion — Britain",
                            summary: "Earn Ariana's trust by securing her mother's blessing before borrowing the rune.",
                            steps: [
                                "Meet Ariana at the Conservatory and ask for the `RUNE`. She needs her mother Anya's permission.",
                                "Visit Anya at the Blue Boar Tavern, mention `RUNE` or `PERMISSION`, and answer `YES` when asked.",
                                "Return to Ariana, confirm permission, and receive the Rune of Compassion.",
                                "Cleanse the southern shrine using the rune, chant `MU`, take the Moonstone, and meditate."
                            ],
                            keywords: [
                                {
                                    label: "Ariana & Anya",
                                    helper: `<strong>Ariana:</strong> say <code>RUNE</code> → needs consent.<br><strong>Anya:</strong> say <code>RUNE</code>/<code>PERMISSION</code> → reply <code>YES</code>.<br><strong>Ariana:</strong> say <code>PERMISSION</code> → answer <code>YES</code> to claim the rune.`
                                }
                            ]
                        },
                        {
                            heading: "Honesty — Moonglow",
                            summary: "Honor your promise to Manrel while retrieving Beyvin's key and rune.",
                            steps: [
                                "Find Manrel south of the Blue Bottle Inn; ask for the `KEY` and vow to place flowers on Beyvin's coffin.",
                                "Search the inn storeroom wall for the secret door into the catacombs.",
                                "Unlock Beyvin's tomb with Manrel's key, take the rune, and leave flowers before departing.",
                                "Use the rune at the Shrine of Honesty on Verity Isle, chant `AHM`, and recover the Moonstone."
                            ],
                            keywords: [
                                {
                                    label: "Manrel & Catacombs",
                                    helper: `<strong>Manrel:</strong> say <code>KEY</code> → promise to honour him.<br><strong>Catacombs:</strong> hidden door in Blue Bottle storeroom.<br><strong>Shrine:</strong> rune + mantra <code>AHM</code>.`
                                }
                            ]
                        },
                        {
                            heading: "Valor — Jhelom",
                            summary: "Recruit Sherry the mouse to slip behind the tavern walls and retrieve the rune.",
                            steps: [
                                "In Castle Britannia's kitchen, pick up cheese, offer it to Sherry, and invite her to `JOIN`.",
                                "Travel to the Sword and Keg in Jhelom, position Sherry at the mouse hole, and switch control to her.",
                                "Enter the mouse hole as Sherry to grab the rune, then regroup with the party.",
                                "Cleanse the Shrine of Valor atop the Serpent's Spine by chanting `RA` and taking the Moonstone."
                            ],
                            keywords: [
                                {
                                    label: "Sherry & Valor",
                                    helper: `<strong>Sherry:</strong> give cheese → say <code>JOIN</code>.<br><strong>Mouse hole:</strong> solo-control Sherry to retrieve the rune.<br><strong>Virtue:</strong> dismiss Sherry later at Castle Britannia to avoid karma loss.`
                                }
                            ]
                        },
                        {
                            heading: "Justice — Yew",
                            summary: "Expose Boskin's lie and recover the rune hidden in the tavern plant.",
                            steps: [
                                "Ask Mayor Lenora for `PERMISSION` to interrogate Boskin.",
                                "Collect the jail key from Pridgarm, then question Boskin about the `RUNE` and his `KIDS`.",
                                "Verify with Lenora; she reveals the story is false. Confront Boskin with `TRUTH` to learn the hiding place.",
                                "Retrieve the rune beneath the Slaughtered Lamb plant, chant `BEH` at the shrine, and return the jail key."
                            ],
                            keywords: [
                                {
                                    label: "Boskin's Lie",
                                    helper: `<strong>Lenora:</strong> say <code>PERMISSION</code>.<br><strong>Boskin:</strong> <code>RUNE</code> → <code>KIDS</code>.<br><strong>Lenora:</strong> ask <code>KIDS</code> to expose him.<br><strong>Boskin:</strong> confront with <code>TRUTH</code> to reveal the plant.`
                                }
                            ]
                        },
                        {
                            heading: "Sacrifice — Minoc",
                            summary: "Craft panpipes and perform Stones for Selganor to earn the rune.",
                            steps: [
                                "Buy a yew log from Ben west of Yew, cut it into a board, and ask Julia to craft `PANPIPES`.",
                                "Ask Gwenno about the song `STONES` to learn the numeric tune 6789878767653.",
                                "Perform the tune for Selganor inside the Artisan Guild to receive the rune.",
                                "Cleanse the desert shrine with mantra `CAH`, gather the Moonstone, and meditate."
                            ],
                            keywords: [
                                {
                                    label: "Artisan's Trial",
                                    helper: `<strong>Julia:</strong> give board → panpipes.<br><strong>Gwenno:</strong> say <code>STONES</code> for tune.<br><strong>Selganor:</strong> enter 6789878767653 when prompted.`
                                }
                            ]
                        },
                        {
                            heading: "Honor — Trinsic",
                            summary: "Borrow the rune on trust and return it after the shrine is freed.",
                            steps: [
                                "Speak with Mayor Whitsaber about the `RUNE`; he lends it to you.",
                                "Take the rune from the central pedestal and promise to return it soon.",
                                "Cleanse the shrine north of Trinsic with mantra `SUMM`, recover the Moonstone, then return the rune to the pedestal.",
                                "Report back to Whitsaber for a virtue boost."
                            ],
                            keywords: [
                                {
                                    label: "Whitsaber's Trust",
                                    helper: `<strong>Whitsaber:</strong> say <code>RUNE</code> to borrow.<br><strong>Reminder:</strong> replace rune after shrine to preserve karma.`
                                }
                            ]
                        },
                        {
                            heading: "Spirituality — Skara Brae",
                            summary: "Follow Marney's poem to her family's hidden hope chest.",
                            steps: [
                                "Talk to Marney near the docks about the `RUNE`.",
                                "Use follow-up keywords `POEM` and `BASKET` to jog her memory.",
                                "Search the hope chest in Marney's house to obtain the rune.",
                                "Cleanse the Shrine of Spirituality via moongate access, chanting `OM`."
                            ],
                            keywords: [
                                {
                                    label: "Marney's Basket",
                                    helper: `<strong>Marney:</strong> <code>RUNE</code> → <code>POEM</code> → <code>BASKET</code>.<br><strong>House:</strong> hope chest in northern bedroom.`
                                }
                            ]
                        },
                        {
                            heading: "Humility — New Magincia",
                            summary: "Question every villager to discover the most humble soul.",
                            steps: [
                                "Ask Mayor Antonio about `HUMILITY`; he poses a riddle.",
                                "Question each villager with keyword `HUMILITY` until Conor is identified.",
                                "Answer `CONOR` when returning to Antonio to gain the rune.",
                                "Cleanse the Isle of the Avatar shrine by chanting `LUM`."
                            ],
                            keywords: [
                                {
                                    label: "Antonio's Riddle",
                                    helper: `<strong>Antonio:</strong> say <code>HUMILITY</code>.<br><strong>Villagers:</strong> keep asking <code>HUMILITY</code>.<br><strong>Answer:</strong> respond <code>CONOR</code> for the rune.`
                                }
                            ]
                        }
                    ],
                    recap: "For each shrine: arrive with the rune and mantra, use the rune on the altar, chant three times, secure the Moonstone, and meditate to lock in the virtue."
                },
                {
                    title: "Act II: Prophecy & Pirates",
                    intro: "Assist Mariah with the silver tablet, join Buccaneer's Den's guild, and assemble Captain Hawkins's map pieces to reach the Pirate Cave.",
                    sections: [
                        {
                            heading: "Translate the Gargish Tome",
                            summary: "Deliver the book to Mariah and follow the gypsy lead to Homer.",
                            steps: [
                                "Present the Gargish book to Mariah at the Lycaeum using keyword `BOOK`.",
                                "She reveals her half of the silver tablet and sends you to the gypsies near Trinsic.",
                                "Ask the gypsy leader about the `TABLET`; they direct you to Homer in Buccaneer's Den."
                            ],
                            keywords: [
                                {
                                    label: "Mariah & Gypsies",
                                    helper: `<strong>Mariah:</strong> say <code>BOOK</code> → needs other half.<br><strong>Zoltan:</strong> say <code>TABLET</code> for Homer lead.`
                                }
                            ]
                        },
                        {
                            heading: "Join the Thieves' Guild",
                            summary: "Earn Budo's trust without staining your virtue.",
                            steps: [
                                "Speak with Homer about `HAWKINS`; he insists you join the guild.",
                                "Ask Budo about the `GUILD`; he requests Phoenix's belt from Castle Britannia's sewers.",
                                "Cast `INVISIBILITY` and `PICKPOCKET` Phoenix to steal the belt humanely.",
                                "Return the belt to Budo to receive the guild password for Homer."
                            ],
                            keywords: [
                                {
                                    label: "Guild Initiation",
                                    helper: `<strong>Homer:</strong> say <code>HAWKINS</code>.<br><strong>Budo:</strong> use <code>GUILD</code> → fetch belt.<br><strong>Phoenix:</strong> <code>PICKPOCKET</code> while invisible to avoid combat.`
                                }
                            ]
                        },
                        {
                            heading: "Assemble Hawkins's Map",
                            summary: "Hunt the nine fragments scattered across Britannia.",
                            steps: [
                                "Trade food to Ybarra in Dungeon Shame for his map piece.",
                                "Solve the Wrong/Covetous lever puzzle and search level three for another fragment.",
                                "Plunder the Ant Mound queen's chamber for Hawknose's body and map scrap.",
                                "Dive the shipwreck at 71S 15E, defeat the ghosts, and secure the stern piece.",
                                "Trade Morchella east of Serpent's Hold a `MAGIC SHIELD` for her shard.",
                                "Move Bonn's harpsichord on Dagger Isle to reveal a cellar ladder and fragment.",
                                "Purchase (or steal) Arturos's locket north of Paws for the enclosed piece.",
                                "Expose Mayor Whitsaber's alias `GORDON` in Trinsic to obtain his portion.",
                                "Return to Homer with eight fragments; he gives the final piece and digging instructions."
                            ],
                            keywords: [
                                {
                                    label: "Map Piece Shortcuts",
                                    helper: `<strong>Shame:</strong> trade <code>FOOD</code>.<br><strong>Wrong:</strong> flip levers in order 4-1-2-3.<br><strong>Trinsic:</strong> say <code>GORDON</code> to Whitsaber.<br><strong>Arturos:</strong> haggle down to 50 gold or pickpocket.`
                                }
                            ]
                        },
                        {
                            heading: "Plunder the Pirate Cave",
                            summary: "Navigate traps and moral choices to seize the silver tablet half.",
                            steps: [
                                "Sail to Hawkins's island southeast of Buccaneer's Den using Homer's directions.",
                                "Ignore the first \"THIS WAY\" sign (go opposite), then follow later signs accurately.",
                                "Survive the Maze of Death by hugging the right wall, disarming traps, and conserving powder kegs.",
                                "Collect the silver tablet, Storm Cloak, Magic Fan, and treasure. Return the Storm Cloak to Homer for a virtue reward."
                            ],
                            keywords: [
                                {
                                    label: "Pirate Cave Tips",
                                    helper: `<strong>Signs:</strong> take the opposite path of the first <code>THIS WAY</code>.<br><strong>Maze:</strong> use <code>WIZARD EYE</code> or <code>DISPEL FIELD</code>.<br><strong>Storm Cloak:</strong> gift it back to Homer for karma.`
                                }
                            ]
                        }
                    ],
                    recap: "Deliver the complete tablet to Mariah so she can translate the Gargish prophecy and open the path to the gargoyle realm."
                },
                {
                    title: "Act III: Realm of the Gargoyles",
                    intro: "Travel beyond Hythloth, earn the gargoyles' trust, and pursue the Sacred Quest of Singularity.",
                    sections: [
                        {
                            heading: "Reach the Gargoyle Realm",
                            summary: "Descend Hythloth and learn to speak Gargish.",
                            steps: [
                                "Enter Hythloth via the Shrine of Humility or powder-keg the sealed door on the Isle of the Avatar.",
                                "Descend to level 4, using `PROTECTION` spells and powder kegs for blocked tunnels.",
                                "Locate Captain Johne's home, discuss `GARGISH`, and accept his vocabulary scroll.",
                                "Immediately `USE` the scroll to gain fluency before exiting into the gargoyle realm."
                            ],
                            keywords: [
                                {
                                    label: "Captain Johne",
                                    helper: `<strong>Johne:</strong> say <code>GARGISH</code>/<code>LANGUAGE</code> for the scroll.<br><strong>Scroll:</strong> <code>USE</code> it at once to speak Gargish.`
                                }
                            ]
                        },
                        {
                            heading: "Secure Diplomatic Access",
                            summary: "Recruit Beh Lem and accept Draxinusom's terms.",
                            steps: [
                                "Outside Hythloth, speak with Beh Lem and ask him to `JOIN` to guarantee safe passage.",
                                "Enter the city, request an audience with Lord Draxinusom, and agree to `SURRENDER`.",
                                "Wear the Amulet of Submission to move freely and earn gargoyle trust."
                            ],
                            keywords: [
                                {
                                    label: "Beh Lem & Draxinusom",
                                    helper: `<strong>Beh Lem:</strong> say <code>JOIN</code>.<br><strong>Draxinusom:</strong> accept with <code>SURRENDER</code> to receive the amulet.`
                                }
                            ]
                        },
                        {
                            heading: "Build the Hot-Air Balloon",
                            summary: "Collect every component needed to reach the Shrine of Singularity.",
                            steps: [
                                "Recover the balloon plans from Sutek's catacombs at 65S 52E.",
                                "Gather 40 spidersilk, have Arbeth in Paws spin thread, and Charlotte in New Magincia weave cloth.",
                                "Ask Marissa in Paws to sew the silk bag, and buy a wicker basket from Michelle in Minoc.",
                                "Collect rope and a large pot for the burner, then `USE` the plans once all parts are in your inventory."
                            ],
                            keywords: [
                                {
                                    label: "Balloon Crafting",
                                    helper: `<strong>Paws:</strong> Arbeth spins silk → Marissa sews bag.<br><strong>New Magincia:</strong> Charlotte weaves cloth.<br><strong>Minoc:</strong> Michelle sells the basket.`
                                }
                            ]
                        },
                        {
                            heading: "Embrace Singularity",
                            summary: "Learn the mantras of Principle and align with gargoyle philosophy.",
                            steps: [
                                "Visit the shrines of Control, Passion, and Diligence to obtain mantras `UN`, `OR`, and `US` from Mondain, Minax, and Exodus.",
                                "Use the balloon to reach the plateaued Shrine of Singularity.",
                                "Chant `UNORUS` at the shrine to accept the Sacred Quest."
                            ],
                            keywords: [
                                {
                                    label: "Mantra Checklist",
                                    helper: `<strong>Control:</strong> mantra <code>UN</code>.<br><strong>Passion:</strong> mantra <code>OR</code>.<br><strong>Diligence:</strong> mantra <code>US</code>.`
                                }
                            ]
                        }
                    ],
                    recap: "With Beh Lem allied and the Sacred Quest accepted, you are ready to gather the artifacts needed to save both cultures."
                },
                {
                    title: "Final Ritual",
                    intro: "Recover the Vortex Cube, forge twin lenses, and present them correctly at the Codex of Ultimate Wisdom.",
                    sections: [
                        {
                            heading: "Recover the Vortex Cube",
                            summary: "Negotiate with the cyclopes of Stonegate to access their hidden vault.",
                            steps: [
                                "Travel to Stonegate (10N 37E) and greet the patriarch peacefully.",
                                "Catch a fresh fish nearby and present it when discussing `HELP` to earn the vault key.",
                                "Navigate secret passages on the lower floors to reach the cube chamber."
                            ],
                            keywords: [
                                {
                                    label: "Stonegate Diplomacy",
                                    helper: `<strong>Patriarch:</strong> say <code>HELP</code>/<code>FISH</code> with fresh catch.<br><strong>Vault:</strong> hidden door on B2 north wall.`
                                }
                            ]
                        },
                        {
                            heading: "Forge the Twin Lenses",
                            summary: "Repair the gargoyle lens and commission a human counterpart.",
                            steps: [
                                "Retrieve the broken red lens from the Hall of Knowledge and deliver it to Lor-wis-lem the lens grinder.",
                                "Take a glass sword to Ephemerides in Moonglow, discuss `LENS` and `SWORD`, and receive the blue Britannian lens."
                            ],
                            keywords: [
                                {
                                    label: "Lens Makers",
                                    helper: `<strong>Lor-wis-lem:</strong> say <code>LENS</code> for repairs.<br><strong>Ephemerides:</strong> present glass sword, say <code>SWORD</code> to trade.`
                                }
                            ]
                        },
                        {
                            heading: "Prepare the Codex Shrine",
                            summary: "Load the Vortex Cube and align the lenses for the finale.",
                            steps: [
                                "Place all eight Moonstones into the Vortex Cube before arriving at the Codex.",
                                "Set the Britannian lens between the left flame and the Codex, and the gargoyle lens between the right flame and the Codex.",
                                "Position the charged cube in front of the Codex, ensure both beams cross the cube, then `USE` it to complete the ritual."
                            ],
                            keywords: [
                                {
                                    label: "Ritual Checklist",
                                    helper: `<strong>Moonstones:</strong> load into cube ahead of time.<br><strong>Lenses:</strong> place midway between flames and Codex.<br><strong>Finale:</strong> <code>USE</code> the cube once beams align.`
                                }
                            ]
                        }
                    ],
                    recap: "When both lenses are aligned and the Vortex Cube is charged, the Codex returns to the Ethereal Void and peace is restored."
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
            ],
            seerContext: [
                {
                    id: "cheat-menu",
                    title: "Secret Cheaters Menu",
                    summary: "Unlock Ultima VI's hidden debug interface.",
                    details: `Talk to Iolo and enter <code>spam</code> three times followed by <code>humbug</code> to reveal the cheat menu. Options include Get Items, Set Flags, View NPCs, Edit Party, and Edit Player.`
                },
                {
                    id: "teleport-coordinates",
                    title: "Coordinate Teleport",
                    summary: "Developer hotkey for instant travel.",
                    details: `Hold <kbd>ALT</kbd> and press <kbd>2</kbd>-<kbd>1</kbd>-<kbd>4</kbd> to enter three hex coordinates (X, Y, Z) and warp anywhere in Britannia, its dungeons, or the gargoyle realm.`
                },
                {
                    id: "overhead-radar",
                    title: "Overhead Radar View",
                    summary: "Gem-style overview plus HUD readout.",
                    details: `Hold <kbd>ALT</kbd> and press <kbd>2</kbd>-<kbd>1</kbd>-<kbd>3</kbd> to toggle a bird's-eye view alongside karma, time, and coordinate readouts.`
                },
                {
                    id: "karma-farm",
                    title: "Endless Karma Farm",
                    summary: "Serpent's Hold cook exploit for infinite virtue.",
                    details: `Deliver a dragon egg to the cook in Serpent's Hold. A bug prevents the egg from being consumed, enabling limitless karma gains.`
                },
                {
                    id: "animate-clone",
                    title: "Animate-Clone Duplication",
                    summary: "Magic trick to duplicate rare items.",
                    details: `Drop an item, cast <code>Animate</code> on it, then <code>Clone</code>. Slay the animated copy to keep the duplicate without karma loss.`
                }
            ],
            seerShortcuts: [
                { label: "How do I open the cheat menu?", prompt: "Remind me how to activate Ultima VI's Secret Cheaters Menu and what options it offers." },
                { label: "Need teleport coordinates", prompt: "Explain the ALT-2-1-4 coordinate teleport trick, including valid ranges and caveats." },
                { label: "Show me the debug HUD", prompt: "How do I access the ALT-2-1-3 overhead radar and what info does it display?" },
                { label: "Farm karma fast", prompt: "Describe the Serpent's Hold dragon egg exploit to gain infinite karma." },
                { label: "Duplicate rare gear", prompt: "Walk me through the animate-clone duplication exploit in Ultima VI." }
            ],
            pcItemListRaw: `
1  - Leather Helm            | 62  - Vortex Cube
2  - Chain Coif              | 63  - Lockpick
3  - Iron Helm               | 64  - Key*2
4  - Spiked Helm             | 65  - Black Pearl*3
5  - Winged Helm             | 66  - Blood Moss*3
6  - Brass Helm              | 67  - Garlic*3
7  - Gargoyle Helm           | 68  - Ginseng*3
8  - Magic Helm              | 69  - Mandrake*3
9  - Wooden Shield           | 70  - Nightshade*3
10 - Curved Heater           | 71  - Spidersilk*3
11 - Winged Helm             | 72  - Ash*3
12 - Kite Shield             | 73  - Moonstone (new moon)
13 - Spiked Shield           | 74  - Ankh Amulet
14 - Black Shield            | 75  - Snake Amulet
15 - Door Shield             | 76  - Amulet of Submission
16 - Magic Shield            | 77  - Gem
17 - Cloth Armor             | 78  - Staff
18 - Leather Armor           | 79  - Lightning Wand
19 - Ring Mail               | 80  - Fire Wand
20 - Scale Mail              | 81  - Storm Cloak
21 - Chain Mail              | 82  - Ring
22 - Plate Mail              | 83  - Flask of Oil
23 - Magic Armor             | 84  - Red Gate
24 - Spiked Collar           | 85  - Moongate
25 - Guild Belt              | 86  - Gavel
26 - Gargoyle Belt           | 87  - Orb of the Moons
27 - Leather Boots           | 88  - Gold
28 - Swamp Boots             | 89  - Gold Nugget
29 - Earth (Dirt)            | 90  - Torch
30 - Floor (Wood)            | 91  - Zu Ylem
31 - Floor (Brick)           | 92  - Silver Snake Venom
32 - Floor (Tile)            | 93  - Sextant
33 - Sling                   | 94  - Spinning Wheel
34 - Club                    | 95  - Bunch of Grapes
35 - Main Gauche             | 96  - Butter
36 - Spear                   | 97  - Gargish Vocabulary
37 - Throwing Axe            | 98  - Open Chest
38 - Dagger                  | 99  - Backpack
39 - Mace                    | 100 - Scythe
40 - Morning Star            | 101 - Pitchfork
41 - Bow                     | 102 - Rake
42 - Crossbow                | 103 - Pick
43 - Sword                   | 104 - Shovel
44 - 2-handed Hammer         | 105 - Hoe
45 - 2-handed Axe            | 106 - Wooden Ladder
46 - 2-handed Sword          | 107 - Yoke
47 - Halberd                 | 108 - Oven Spatula
48 - Glass Sword             | 109 - Rolling Pin
49 - Boomerang               | 110 - Spatula
50 - Triple Crossbow         | 111 - Ladle
51 - Force Field             | 112 - Cooking Sheet
52 - Wizard's Eye            | 113 - Cleaver
53 - Web                     | 114 - Knife
54 - Magic Bow               | 115 - Wine
55 - Arrow                   | 116 - Mead
56 - Bolt                    | 117 - Ale
57 - Spellbook               | 118 - Wineglass
58 - Spell*1                 | 119 - Plate
59 - Codex                   | 120 - Mug
60 - Book of Prophecies      | 121 - Silverware
61 - Book of Circles         | 122 - Candle
123 - Mirror                 | 184 - Jar of Honey
124 - Tunic                  | 185 - Cloth
125 - Hanger                 | 186 - Open Barrel
126 - Dress                  | 187 - Jug
127 - Skillet                | 188 - Bag
128 - Loaf of Bread          | 189 - Cask
129 - Portion of Meat        | 190 - Bale of Wool
130 - Rolls                  | 191 - Basket
131 - Cake                   | 192 - Open Crate
132 - Cheese                 | 193 - Small Jug
133 - Ham                    | 194 - Milk Bottle
134 - Horse's Carcass        | 195 - Wheat
135 - Horse Chops (yum!<G>)  | 196 - Vat
136 - Skewer                 | 197 - Wine Cask
137 - Pants                  | 198 - Cutting Table
138 - Plant                  | 199 - Loom
139 - Flowers                | 200 - Hood (for forge)
140 - Wall Mount             | 201 - Fire (from forge)
141 - Decorative Sword       | 202 - Horseshoes
142 - Decorative Shield      | 203 - Pliers
143 - Picture                | 204 - Hammer
144 - Tapestry               | 205 - Water Trough
145 - Candelabra             | 206 - Brazier
146 - Person Sleeping        | 207 - Rod
147 - Cauldron               | 208 - Hook
148 - Cauldron (filled)      | 209 - Meat (Rib type)
149 - Ship Deep              | 210 - Ribs
150 - Inkwell                | 211 - Dead Animal
151 - Book                   | 212 - Fan
152 - Note                   | 213 - Mouse Hole
153 - Panpipes               | 214 - Wine Press
154 - Telescope              | 215 - Stable
155 - Crystal Ball           | 216 - Bookshelf
156 - Harpsichord            | 217 - Anvil
157 - Harp                   | 218 - Bellows
158 - Lute                   | 219 - Oven
159 - Clock                  | 220 - Flag
160 - Endtable               | 221 - Cannon
161 - Water Vase             | 222 - Cannon Balls
162 - Stove                  | 223 - Powder Keg
163 - Bed                    | 224 - Foot Rail
164 - Fireplace              | 225 - Spool of Thread
165 - Stalagmite             | 226 - Spool of Silk
166 - Sack of Grain          | 227 - Pennant
167 - Sack of Flour          | 228 - Table (square corner)
168 - Remains                | 229 - Shadow
169 - Rubber Ducky<G>        | 230 - Table (round corner)
170 - Urn of Ashes           | 231 - Shadow
171 - Fumarole               | 232 - Spittoon
172 - Spikes                 | 233 - Well
173 - Trap                   | 234 - Fountain
174 - Switch                 | 235 - Sundial
175 - Electric Field         | 236 - Bell
176 - Chest of Drawers       | 237 - Table (middle)
177 - Desk                   | 238 - Shadow
178 - Bucket                 | 239 - Table (round corner)
179 - Bucket of Water        | 240 - Shadow
180 - Bucket of Milk         | 241 - Silk Cloth
181 - Churn                  | 242 - Rune of Honesty
182 - Beehive                | 243 - Rune of Compassion
183 - Honey Jar              | 244 - Rune of Valor
184 - Jar of Honey           | 245 - Rune of Justice
185 - Cloth                  | 246 - Rune of Sacrifice
186 - Open Barrel            | 247 - Rune of Honor
187 - Jug                    | 248 - Rune of Spirituality
188 - Bag                    | 249 - Rune of Humility
189 - Cask                   | 250 - Table (square corner)
190 - Bale of Wool           | 251 - Shadow
191 - Basket                 | 252 - Chair
192 - Open Crate             | 253 - Campfire
193 - Small Jug              | 254 - Cross
194 - Milk Bottle            | 255 - Tombstone
195 - Wheat                  | 256 - Protection Ring
196 - Vat                    | 257 - Regeneration Ring
197 - Wine Cask              | 258 - Invisibility Ring
198 - Cutting Table          | 259 - Table Leg
199 - Loom                   | 260 - Shadow
200 - Hood (for forge)       | 261 - Table Leg
201 - Fire (from forge)      | 262 - Shadow
202 - Horseshoes             | 263 - Stocks
203 - Pliers                 | 264 - Fishing Pole
204 - Hammer                 | 265 - Fish
205 - Water Trough           | 266 - Grave
206 - Brazier                | 267 - Guillotine
207 - Rod                    | 268 - Lever
208 - Hook                   | 269 - Drawbridge
209 - Meat (Rib type)        | 270 - Balloon Plans
210 - Ribs                   | 271 - Doorsill
211 - Dead Animal            | 272 - Steps
212 - Fan                    | 273 - Tile
213 - Mouse Hole             | 274 - Yew Log
214 - Wine Press             | 275 - Blue Potion
215 - Stable                 | 276 - Steps
216 - Bookshelf              | 277 - Yew Board
217 - Anvil                  | 278 - Passthrough
218 - Bellows                | 279 - Table
219 - Oven                   | 280 - Passthrough
220 - Flag                   | 281 - Fence
221 - Cannon                 | 282 - Bars
222 - Cannon Balls           | 283 - Anchor
223 - Powder Keg             | 284 - Rope
224 - Foot Rail              | 285 - Pole
225 - Spool of Thread        | 286 - Walkway
226 - Spool of Silk          | 287 - Water Wheel
227 - Pennant                | 288 - Crank
228 - Table (square corner)  | 289 - Log Saw
229 - Shadow                 | 290 - Millstone
230 - Table (round corner)   | 291 - Shaft
231 - Shadow                 | 292 - Gearwork
232 - Spittoon               | 293 - Chain
233 - Well                   | 294 - Lightsource
234 - Fountain               | 295 - Heatsource
235 - Sundial                | 296 - Xylophone
236 - Bell                   | 297 - Oaken Door
237 - Table (middle)         | 298 - Windowed Door
238 - Shadow                 | 299 - Cedar Door
239 - Table (round corner)   | 300 - Steel Door
240 - Shadow                 | 301 - Doorway
241 - Silk Cloth             | 302 - Archway
242 - Rune of Honesty        | 303 - Carpet
243 - Rune of Compassion     | 304 - Cook Fire
244 - Rune of Valor          | 305 - Ladder
245 - Rune of Justice        | 306 - Trellis
246 - Rune of Sacrifice      | 307 - Volcano
247 - Rune of Honor          | 308 - Hole
248 - Rune of Spirituality   | 309 - Bones (archway)
249 - Rune of Humility       | 310 - Portcullis
250 - Table (square corner)  | 311 - Stone Table
251 - Shadow                 | 312 - Stone Lion
252 - Chair                  | 313 - Silver Horn
253 - Campfire               | 314 - Floor (stone)
254 - Cross                  | 315 - Stone
255 - Tombstone              | 316 - Lamppost
256 - Protection Ring        | 317 - Fire Field
257 - Regeneration Ring      | 318 - Poison Field
258 - Invisibility Ring      | 319 - Protection Field
259 - Table Leg              | 320 - Sleep Field
260 - Shadow                 | 321 - Statue
261 - Table Leg              | 322 - Pool
262 - Shadow                 | 323 - Monolith
263 - Stocks                 | 324 - Pillar
264 - Fishing Pole           | 325 - Bookstand
265 - Fish                   | 326 - Mine Shaft
266 - Grave                  | 327 - Throne
267 - Guillotine             | 328 - Altar
268 - Lever                  | 329 - Altar of Spirituality
269 - Drawbridge             | 330 - Mat
270 - Balloon Plans          | 331 - Government Sign
271 - Doorsill               | 332 - Sign
272 - Steps                  | 333 - Gargoyle Sign
273 - Tile                   | 334 - Secret Door
274 - Yew Log                | 335 - Egg
275 - Blue Potion            | 336 - Charge
276 - Steps                  | 337 - Effect
277 - Yew Board              | 338 - Blood
278 - Passthrough            | 339 - Dead Body
279 - Table                  | 340 - Dead Cyclops
280 - Passthrough            | 341 - Dead Gargoyle
281 - Fence                  | 342 - Giant Rat
282 - Bars                   | 343 - Insects
283 - Anchor                 | 344 - Giant Bat
284 - Rope                   | 345 - Giant Squid
285 - Pole                   | 346 - Sea Serpent
286 - Walkway                | 347 - Reaper
287 - Water Wheel            | 348 - Sheep
288 - Crank                  | 349 - Dog
289 - Log Saw                | 350 - Deer
290 - Millstone              | 351 - Wolf
291 - Shaft                  | 352 - Ghost
292 - Gearwork               | 353 - Gremlin
293 - Chain                  | 354 - Mouse
294 - Lightsource            | 355 - Gazer
295 - Heatsource             | 356 - Bird
296 - Xylophone              | 357 - Corpser
297 - Oaken Door             | 358 - Snake
298 - Windowed Door          | 359 - Rabbit
299 - Cedar Door             | 360 - Rot Worms
300 - Steel Door             | 361 - Giant Spider
301 - Doorway                | 362 - Winged Gargoyle
302 - Archway                | 363 - Gargoyle
303 - Carpet                 | 364 - Acid Slug
304 - Cook Fire              | 365 - Tangle Vine (pod)
305 - Ladder                 | 366 - Tangle Vine (vine)
306 - Trellis                | 367 - Daemon
307 - Volcano                | 368 - Skeleton
308 - Hole                   | 369 - Drake
309 - Bones (archway)        | 370 - Headless
310 - Portcullis             | 371 - Troll
311 - Stone Table            | 372 - Mongbat
312 - Stone Lion             | 373 - Wisp
313 - Silver Horn            | 374 - Hydra
314 - Floor (stone)          | 375 - Slime
315 - Stone                  | 376 - Fighter
316 - Lamppost               | 377 - Swashbuckler
317 - Fire Field             | 378 - Mage
318 - Poison Field           | 379 - Villager
319 - Protection Field       | 380 - Merchant
320 - Sleep Field            | 381 - Child
321 - Statue                 | 382 - Guard
322 - Pool                   | 383 - Jester
323 - Monolith               | 384 - Peasant
324 - Pillar                 | 385 - Farmer
325 - Bookstand              | 386 - Musician (long cape)
326 - Mine Shaft             | 387 - Woman
327 - Throne                 | 388 - Cat
328 - Altar                  | 389 - Silver Tablet
329 - Altar of Spirituality  | 390 - Silver Fragment
330 - Mat                    | 391 - Farmer
331 - Government Sign        | 392 - Musician (short cape)
332 - Sign                   | 393 - Shrine
333 - Gargoyle Sign          | 394 - Britannia Lens (blue)
334 - Secret Door            | 395 - Broken Lens (violet)
335 - Egg                    | 396 - Gargoyle Lens (violet)
336 - Charge                 | 397 - Statue of Mondain
337 - Effect                 | 398 - Statue of Minax
338 - Blood                  | 399 - Statue of Exodus
339 - Dead Body              | 400 - Map Part one
340 - Dead Cyclops           | 401 - Map Part two
341 - Dead Gargoyle          | 402 - Map Part three
342 - Giant Rat              | 403 - Map Part four
343 - Insects                | 404 - Map Part five
344 - Giant Bat              | 405 - Map Part six
345 - Giant Squid            | 406 - Map Part seven
346 - Sea Serpent            | 407 - Map Part eight
347 - Reaper                 | 408 - Map Part nine
348 - Sheep                  | 409 - Lord British
349 - Dog                    | 410 - Avatar
350 - Deer                   | 411 - Dragon
351 - Wolf                   | 412 - Ship
352 - Ghost                  | 413 - Silver Serpent
353 - Gremlin                | 414 - Skiff
354 - Mouse                  | 415 - Raft
355 - Gazer                  | 416 - Nothing (REALLY!)
356 - Bird                   | 417 - Dragon Egg
357 - Corpser                | 418 - Hatched Dragon Egg
358 - Snake                  | 419 - Pull Chain
359 - Rabbit                 | 420 - Balloon (deflated)
360 - Rot Worms              | 421 - Mammoth Silk Bag
361 - Giant Spider           | 422 - Balloon Basket
362 - Winged Gargoyle        | 423 - Balloon (inflated)
363 - Gargoyle               | 424 - Cyclops
364 - Acid Slug              | 425 - Hydra
365 - Tangle Vine (pod)      | 426 - Giant Scorpion
366 - Tangle Vine (vine)     | 427 - Giant Ant 
367 - Daemon                 | 428 - Cow 
368 - Skeleton               | 429 - Alligator
369 - Drake                  | 430 - Horse
370 - Headless               | 1097 - Moonstone (cres.wax.)
371 - Troll                  | 1105 - Storm Ring*4
372 - Mongbat                | 1299 - Red Potion
373 - Wisp                   | 2121 - Moonstone (1rst 1/4)
374 - Hydra                  | 2128 - Fire Ring*4
375 - Slime                  | 2135 - Nugget of the Moons*4
376 - Fighter                | 2323 - Yellow Potion
377 - Swashbuckler           | 3145 - Moonstone (gibb.wax.)
378 - Mage                   | 3151 - Lightning Ring*4
379 - Villager               | 3347 - Green Potion
380 - Merchant               | 4169 - Moonstone (full moon)
381 - Child                  | 4371 - Orange Potion
382 - Guard                  | 5193 - Moonstone (gibb.wan.)
383 - Jester                 | 5395 - Purple Potion
384 - Peasant                | 6217 - Moonstone (last 1/4)
385 - Farmer                 | 6419 - Black Potion
386 - Musician (long cape)   | 7241 - Moonstone (cres.wan.)
387 - Woman                  | 7443 - White Potion
388 - Cat                    |  
389 - Silver Tablet          |  
390 - Silver Fragment        |  
391 - Farmer                 |  
392 - Musician (short cape)  |  
393 - Shrine                 |  
394 - Britannia Lens (blue)  |  
395 - Broken Lens (violet)   |  
396 - Gargoyle Lens (violet) |  
397 - Statue of Mondain      |  
398 - Statue of Minax        |  
399 - Statue of Exodus       |  
400 - Map Part one           |  
401 - Map Part two           |  
402 - Map Part three         |  
403 - Map Part four          |  
404 - Map Part five          |  
405 - Map Part six           |  
406 - Map Part seven         |  
407 - Map Part eight         |  
408 - Map Part nine          |  
409 - Lord British           |  
410 - Avatar                 |  
411 - Dragon                 |  
412 - Ship                   |  
413 - Silver Serpent         |  
414 - Skiff                  |  
415 - Raft                   |  
416 - Nothing (REALLY!)      |  
417 - Dragon Egg             |  
418 - Hatched Dragon Egg     |  
419 - Pull Chain             |  
420 - Balloon (deflated)     |  
421 - Mammoth Silk Bag       |  
422 - Balloon Basket         |  
423 - Balloon (inflated)     |  
424 - Cyclops                |  
425 - Hydra                  |  
426 - Giant Scorpion         |  
427 - Giant Ant              |  
428 - Cow                    |  
429 - Alligator              |  
430 - Horse                  |  
431 - Moonstone (cres.wax.)  |  
432 - Storm Ring*4           |  
433 - Red Potion             |  
434 - Moonstone (1rst 1/4)   |  
435 - Fire Ring*4            |  
436 - Nugget of the Moons*4  |  
437 - Yellow Potion          |  
438 - Moonstone (gibb.wax.)  |  
439 - Lightning Ring*4       |  
440 - Green Potion           |  
441 - Moonstone (full moon)  |  
442 - Orange Potion          |  
443 - Moonstone (gibb.wan.)  |  
444 - Purple Potion          |  
445 - Moonstone (last 1/4)   |  
446 - Black Potion           |  
447 - Moonstone (cres.wan.)  |  
448 - White Potion           |  
`,
            cheats: [
                {
                    title: "Secret Cheaters Menu",
                    platform: "All Platforms",
                    description: "Enter the spam/humbug code with Iolo to unlock the developer menu.",
                    steps: [
                        "Talk to Iolo and type `spam` (press Enter) three times, then `humbug`.",
                        "Choose **Get Items** to spawn equipment by ID, quality, and quantity.",
                        "Use **Edit Party** and **Edit Player** to adjust stats, karma, or companions."
                    ],
                    usePcItemList: true
                },
                {
                    title: "Coordinate Teleport",
                    platform: "All Platforms",
                    description: "Warp anywhere instantly with the ALT-2-1-4 hotkey.",
                    steps: [
                        "Hold ALT and press 2, 1, 4 in sequence to open the Gargish prompt.",
                        "Enter three hexadecimal numbers: X position, Y position, Z level (0 = surface, 1–4 = dungeon, 5 = gargoyle realm).",
                        "Confirm to teleport; avoid invalid coordinates to prevent soft locks."
                    ]
                },
                {
                    title: "Overhead Radar & Coordinates",
                    platform: "All Platforms",
                    description: "Toggle a gem-style overview with the ALT-2-1-3 combination.",
                    steps: [
                        "Hold ALT and press 2, 1, 3.",
                        "Note the overlay displays karma, in-game time, and exact coordinates.",
                        "Use in tandem with coordinate teleporting for precision routing."
                    ]
                },
                {
                    title: "Infinite Karma Loop",
                    platform: "All Platforms",
                    description: "Exploit the Serpent's Hold cook to boost virtue indefinitely.",
                    steps: [
                        "Bring a dragon egg to the cook in Serpent's Hold.",
                        "Gift the egg repeatedly; it never leaves your inventory due to a bug.",
                        "Use to offset future karma losses from theft or quest shortcuts."
                    ]
                },
                {
                    title: "Animate-Clone Duplication",
                    platform: "All Platforms",
                    description: "Use magic to create extra copies of valuable gear.",
                    steps: [
                        "Drop the desired item on the ground.",
                        "Cast Animate on it, then immediately cast Clone.",
                        "Defeat the animated duplicate to pick up an extra copy with no karma hit."
                    ]
                },
                {
                    title: "Cheat Stone Network",
                    platform: "All Platforms",
                    description: "Enable cheat stones to set up instant teleports.",
                    steps: [
                        "Press CTRL+F1 (or platform equivalent) at a shrine to toggle cheat stones.",
                        "Drop stones anywhere in Britannia; interacting with them warps you back instantly.",
                        "Combine with spawned supplies from the cheat menu for rapid dungeon runs."
                    ]
                },
                {
                    title: "Pirate Gold Refill",
                    platform: "All Platforms",
                    description: "Farm treasure in Hawkins's cave without virtue loss.",
                    steps: [
                        "Clear the Pirate Cave and collect all gold and loot.",
                        "Exit the dungeon and rest for eight in-game hours.",
                        "Return to find the treasure respawned; repeat as necessary."
                    ]
                },
                {
                    title: "C64 Cheat Menu & POKEs",
                    platform: "Commodore 64",
                    description: "Platform-specific menu and memory patches for maximum stats.",
                    steps: [
                        "Talk to yourself and say `I`, `want to`, `cheat` to open the C64 menu.",
                        "Press Commodore+1 for coordinate readouts; RUN/STOP + F7 for hex teleport.",
                        "Use Action Replay or emulator POKEs (e.g., POKE 22504,255) to max HP and mana."
                    ]
                }
            ]
        };

        gameData.pcItemList = parsePcItemList(gameData.pcItemListRaw || "");

        let britanniaMapInstance = null;
        let britanniaMapBounds = null;
        let britanniaMapCenter = null;
        let britanniaMapZoom = null;

        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');

            if (tabId === 'atlas') {
                requestAnimationFrame(() => {
                    if (britanniaMapInstance) {
                        britanniaMapInstance.invalidateSize();
                        if (britanniaMapCenter !== null) {
                            britanniaMapInstance.setView(britanniaMapCenter, britanniaMapZoom, { animate: false });
                        }
                    } else {
                        setupBritanniaMap();
                    }
                });
            }
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
            setupBritanniaMap();
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
        
        function generateQuestContent(quest) {
            const introHtml = quest.intro ? `<p class="mb-4 text-amber-900/85">${quest.intro}</p>` : '';
            const sectionsHtml = (quest.sections || []).map(section => {
                const summaryHtml = section.summary ? `<p class="mb-2 text-amber-900/80">${section.summary}</p>` : '';
                const stepsHtml = (section.steps && section.steps.length)
                    ? `<ol class="list-decimal list-inside space-y-1 text-amber-900/90">${section.steps.map(step => `<li>${step}</li>`).join('')}</ol>`
                    : '';
                const keywordsHtml = (section.keywords && section.keywords.length)
                    ? `<div class="flex flex-wrap gap-2 mt-3">${section.keywords.map(keyword => `<button type="button" class="keyword-hint inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-amber-900 bg-amber-100/70 border border-amber-300 rounded hover:bg-amber-100 transition" data-helper="${encodeURIComponent(keyword.helper)}">${keyword.label}</button>`).join('')}</div>`
                    : '';
                return `<article class="quest-subsection p-4 bg-amber-50/60 rounded-lg border border-amber-200"><h4 class="font-semibold text-lg text-amber-900 mb-1">${section.heading}</h4>${summaryHtml}${stepsHtml}${keywordsHtml}</article>`;
            }).join('');
            const recapHtml = quest.recap ? `<div class="mt-6 p-4 bg-amber-100/60 border-l-4 border-amber-500 rounded text-amber-900/90">${quest.recap}</div>` : '';
            return `${introHtml}<div class="space-y-4">${sectionsHtml}</div>${recapHtml}`;
        }

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
                const questContent = generateQuestContent(quest);
                div.innerHTML = `
                    <button class="accordion-toggle w-full text-left p-4 font-semibold text-xl text-amber-900 flex justify-between items-center">
                        ${quest.title}
                        <span class="transform transition-transform duration-300 text-amber-700">&#9662;</span>
                    </button>
                    <div class="accordion-content px-4 pb-4 text-amber-900/80">${questContent}</div>`;
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

        const seerContextContainer = document.getElementById('seer-context-options');
        if (seerContextContainer) {
            gameData.seerContext.forEach(packet => {
                const div = document.createElement('div');
                div.className = "p-4 bg-white/60 border border-amber-200 rounded-md shadow-sm hover:border-amber-400 transition";
                div.innerHTML = `
                    <label class="flex flex-col gap-2 cursor-pointer">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" name="seer-context" value="${packet.id}" class="seer-context-checkbox h-4 w-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500">
                            <span class="font-semibold text-amber-900">${packet.title}</span>
                        </div>
                        <p class="text-sm text-amber-800/80">${packet.summary}</p>
                        <p class="text-xs text-amber-700/80 hidden lg:block">${packet.details}</p>
                    </label>`;
                seerContextContainer.appendChild(div);
            });
        }

        const seerShortcutsSelect = document.getElementById('seer-shortcuts');
        if (seerShortcutsSelect) {
            gameData.seerShortcuts.forEach(shortcut => {
                const option = document.createElement('option');
                option.value = shortcut.prompt;
                option.textContent = shortcut.label;
                seerShortcutsSelect.appendChild(option);
            });
            seerShortcutsSelect.addEventListener('change', (event) => {
                const prompt = event.target.value;
                if (prompt) {
                    const queryField = document.getElementById('seer-query');
                    if (queryField) {
                        queryField.value = prompt;
                    }
                }
            });
        }

        const cheatList = document.getElementById('cheat-list');
        if (cheatList) {
            const pcItemState = {
                page: 1,
                perPage: 40,
                query: ''
            };

            const renderPcItemsSection = (container) => {
                const startIndex = (pcItemState.page - 1) * pcItemState.perPage;
                const filtered = gameData.pcItemList.filter(entry => {
                    if (!pcItemState.query) {
                        return true;
                    }
                    const target = `${entry.id} ${entry.name}`.toLowerCase();
                    return target.includes(pcItemState.query.toLowerCase());
                });
                const totalPages = Math.max(1, Math.ceil(filtered.length / pcItemState.perPage));
                pcItemState.page = Math.min(pcItemState.page, totalPages);
                const pagedItems = filtered.slice(startIndex, startIndex + pcItemState.perPage);
                const tableMarkup = buildPcItemTable(pagedItems);
                const paginationControls = `
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-3">
                        <p class="text-xs text-amber-700/80">Showing ${pagedItems.length ? startIndex + 1 : 0}-${Math.min(startIndex + pcItemState.perPage, filtered.length)} of ${filtered.length}</p>
                        <div class="flex items-center gap-2">
                            <button type="button" class="pc-items-prev px-3 py-1 text-sm border border-amber-300 rounded ${pcItemState.page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-amber-100'}">Prev</button>
                            <span class="text-sm text-amber-800/90">Page ${pcItemState.page} / ${totalPages}</span>
                            <button type="button" class="pc-items-next px-3 py-1 text-sm border border-amber-300 rounded ${pcItemState.page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-amber-100'}">Next</button>
                        </div>
                    </div>
                `;
                container.innerHTML = `${tableMarkup}${paginationControls}`;

                const prevBtn = container.querySelector('.pc-items-prev');
                const nextBtn = container.querySelector('.pc-items-next');
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        if (pcItemState.page > 1) {
                            pcItemState.page -= 1;
                            renderPcItemsSection(container);
                        }
                    });
                }
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        if (pcItemState.page < totalPages) {
                            pcItemState.page += 1;
                            renderPcItemsSection(container);
                        }
                    });
                }
            };

            gameData.cheats.forEach(cheat => {
                const article = document.createElement('article');
                article.className = "p-4 bg-white/60 border border-amber-200 rounded-md shadow-sm";
                const stepsHtml = cheat.steps && cheat.steps.length
                    ? `<ol class="list-decimal list-inside space-y-1 text-sm text-amber-900/90 mt-2">${cheat.steps.map(step => `<li>${step}</li>`).join('')}</ol>`
                    : '';
                const needsPcList = cheat.usePcItemList;
                const searchControls = needsPcList ? `
                    <div class="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <input type="search" class="pc-items-search flex-1 px-3 py-2 border border-amber-300 rounded focus:ring-amber-500 focus:border-amber-500" placeholder="Search by ID or item name...">
                        <label class="flex items-center gap-2 text-sm text-amber-800/80">
                            <span>Items per page</span>
                            <select class="pc-items-size border border-amber-300 rounded px-2 py-1 focus:ring-amber-500 focus:border-amber-500">
                                <option value="20">20</option>
                                <option value="40" selected>40</option>
                                <option value="80">80</option>
                                <option value="160">160</option>
                            </select>
                        </label>
                    </div>
                ` : '';

                article.innerHTML = `
                    <header class="flex justify-between items-start gap-3">
                        <div>
                            <h3 class="text-lg font-semibold text-amber-900">${cheat.title}</h3>
                            <p class="text-xs uppercase tracking-wide text-amber-700/80">${cheat.platform}</p>
                        </div>
                    </header>
                    <p class="text-sm text-amber-800/90 mt-3">${cheat.description}</p>
                    ${stepsHtml}
                    ${searchControls}
                    <div class="pc-items-table"></div>`;

                if (needsPcList) {
                    const searchInput = article.querySelector('.pc-items-search');
                    const sizeSelect = article.querySelector('.pc-items-size');
                    const tableContainer = article.querySelector('.pc-items-table');

                    if (searchInput) {
                        searchInput.addEventListener('input', (event) => {
                            pcItemState.query = event.target.value.trim();
                            pcItemState.page = 1;
                            renderPcItemsSection(tableContainer);
                        });
                    }

                    if (sizeSelect) {
                        sizeSelect.addEventListener('change', (event) => {
                            pcItemState.perPage = Number(event.target.value) || 40;
                            pcItemState.page = 1;
                            renderPcItemsSection(tableContainer);
                        });
                    }

                    renderPcItemsSection(tableContainer);
                }

                cheatList.appendChild(article);
            });
        }

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

        setupKeywordHintButtons();
    }

    function setupKeywordHintButtons() {
        const helperPanel = document.getElementById('keyword-helper');
        const helperText = document.getElementById('keyword-helper-text');
        if (!helperPanel || !helperText) {
            return;
        }

        const hintButtons = document.querySelectorAll('.keyword-hint');
        if (!hintButtons.length) {
            helperPanel.classList.add('hidden');
            helperText.innerHTML = '';
            return;
        }

        let hideTimeout;

        const clearHighlights = () => {
            hintButtons.forEach(btn => btn.classList.remove('bg-amber-200', 'border-amber-500', 'text-amber-950'));
        };

        const showHelper = (button) => {
            clearTimeout(hideTimeout);
            clearHighlights();
            const helperHtml = decodeURIComponent(button.dataset.helper || '');
            helperText.innerHTML = helperHtml;
            const rect = button.getBoundingClientRect();
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const scrollX = window.scrollX || document.documentElement.scrollLeft;
            helperPanel.style.left = `${rect.left + rect.width / 2 + scrollX}px`;
            helperPanel.style.top = `${rect.top + scrollY - 12}px`;
            helperPanel.classList.remove('hidden');
            helperPanel.classList.add('visible');
            helperPanel.setAttribute('aria-hidden', 'false');
            button.classList.add('bg-amber-200', 'border-amber-500', 'text-amber-950');
        };

        const scheduleHide = () => {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                clearHighlights();
                helperPanel.classList.remove('visible');
                helperPanel.classList.add('hidden');
                helperPanel.setAttribute('aria-hidden', 'true');
                helperText.innerHTML = '';
            }, 150);
        };

        hintButtons.forEach(button => {
            button.addEventListener('mouseenter', () => showHelper(button));
            button.addEventListener('mouseleave', scheduleHide);
            button.addEventListener('focus', () => showHelper(button));
            button.addEventListener('blur', scheduleHide);
        });

        helperPanel.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });

        helperPanel.addEventListener('mouseleave', scheduleHide);
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

    function setupBritanniaMap() {
        const container = document.getElementById('britannia-map');
        if (!container) {
            return;
        }

        if (typeof L === 'undefined') {
            container.innerHTML = '<p class="text-sm text-amber-800/80">Interactive map failed to load because Leaflet is unavailable.</p>';
            return;
        }

        if (britanniaMapInstance) {
            britanniaMapInstance.invalidateSize();
            if (britanniaMapCenter !== null) {
                britanniaMapInstance.setView(britanniaMapCenter, britanniaMapZoom, { animate: false });
            }
            return;
        }

        const config = window.BRITANNIA_MAP_CONFIG || {};
        const imageUrl = config.imageUrl;
        const imageSize = Array.isArray(config.imageSize) ? config.imageSize : null;
        const markers = Array.isArray(config.markers) ? config.markers : [];
        const xRange = Array.isArray(config.xRange) && config.xRange.length === 2 ? config.xRange : [0, 100];
        const yRange = Array.isArray(config.yRange) && config.yRange.length === 2 ? config.yRange : [0, 100];
        const editorEnabled = Boolean(config.editorEnabled);

        if (!imageUrl || !imageSize || imageSize.length !== 2) {
            container.innerHTML = '<p class="text-sm text-amber-800/80">Interactive map configuration is incomplete.</p>';
            return;
        }

        const [width, height] = imageSize;
        const [minX, maxX] = xRange;
        const [minY, maxY] = yRange;
        const spanX = maxX - minX;
        const spanY = maxY - minY;
        if (!spanX || !spanY) {
            container.innerHTML = '<p class="text-sm text-amber-800/80">Interactive map coordinate ranges are invalid.</p>';
            return;
        }
        const bounds = [[0, 0], [height, width]];

        const buildPopupHtml = (markerData) => {
            const safeDescription = markerData.description ? `<p class="text-sm leading-snug">${markerData.description}</p>` : '';
            const position = markerData.position || {};
            return `
                <article class="space-y-1">
                    <h4 class="font-semibold text-base">${markerData.name || 'Point of interest'}</h4>
                    ${safeDescription}
                    <p class="text-xs text-amber-700/80">Approx. coordinates: ${typeof position.x === 'number' ? position.x.toFixed(2) : '?'}°E, ${typeof position.y === 'number' ? position.y.toFixed(2) : '?'}°S</p>
                </article>
            `;
        };

        const toMarkerPosition = (latlng) => {
            const pixelX = latlng.lng;
            const pixelY = latlng.lat;
            const xCoord = minX + (pixelX / width) * spanX;
            const yCoord = minY + (pixelY / height) * spanY;
            return {
                x: Number(xCoord.toFixed(2)),
                y: Number(yCoord.toFixed(2)),
            };
        };

        const toLatLng = (position) => {
            const xPercent = Math.min(Math.max((position.x - minX) / spanX, 0), 1);
            const yPercent = Math.min(Math.max((position.y - minY) / spanY, 0), 1);
            const xCoord = xPercent * width;
            const yCoord = yPercent * height;
            return { lat: yCoord, lng: xCoord };
        };

        // Clear any existing Leaflet instance that might be cached when switching tabs.
        if (container._leaflet_id) {
            britanniaMapInstance = null;
            container._leaflet_id = null;
        }

        const map = L.map(container, {
            crs: L.CRS.Simple,
            minZoom: -2.5,
            maxZoom: 4,
            zoomSnap: 0.10,
            wheelPxPerZoomLevel: 90,
            attributionControl: true
        });

        const overlay = L.imageOverlay(imageUrl, bounds, {
            alt: 'Ultima VI: The False Prophet world map',
            interactive: true
        });
        overlay.addTo(map);

        map.fitBounds(bounds);
        map.setMaxBounds(bounds);

        britanniaMapInstance = map;
        britanniaMapBounds = bounds;
        britanniaMapCenter = map.getCenter();
        britanniaMapZoom = map.getZoom();

        map.on('moveend', () => {
            britanniaMapCenter = map.getCenter();
            britanniaMapZoom = map.getZoom();
        });

        markers.forEach(marker => {
            const position = marker && marker.position;
            if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                return;
            }
            const name = marker.name || 'Point of interest';
            const description = marker.description || '';
            const latLng = toLatLng(position);
            const leafletPosition = [latLng.lat, latLng.lng];
            const popupHtml = buildPopupHtml(marker);
            const leafletMarker = L.marker(leafletPosition, {
                title: name,
                draggable: editorEnabled
            }).addTo(map);

            leafletMarker.bindPopup(popupHtml, {
                autoPan: true,
                autoPanPadding: L.point(24, 24)
            });

            if (description) {
                leafletMarker.options.markerDescription = description;
            }

            if (editorEnabled) {
                leafletMarker.on('dragend', () => {
                    const latlng = leafletMarker.getLatLng();
                    const updatedPosition = toMarkerPosition(latlng);
                    marker.position = updatedPosition;
                    const updatedHtml = buildPopupHtml(marker);
                    leafletMarker.setPopupContent(updatedHtml);
                    leafletMarker.openPopup();
                    console.info(`[Britannia Map] ${marker.name || 'Point'} updated position -> { x: ${updatedPosition.x}, y: ${updatedPosition.y} }`);
                });
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