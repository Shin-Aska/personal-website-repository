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