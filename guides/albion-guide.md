# Albion Interactive Guide Framework

> **Purpose**: This document serves as a structured framework for an LLM to generate an interactive HTML guide for the 1995 RPG *Albion* by Blue Byte, similar to the Ultima VI and Ultima VII interactive guides.

---

## 1. Game Overview

### Setting & Premise
- **Year**: 2227 AD
- **Premise**: The spaceship *Toronto* is sent to investigate the planet "Nugget" for mining resources. Pilot Tom Driscoll discovers the planet is actually *Albion*—a living world inhabited by intelligent beings.
- **Conflict**: The DDT corporation plans to strip-mine Albion, threatening its civilizations. Tom must prevent the destruction.
- **Tone**: Sci-fi meets fantasy; environmental themes; cultural exploration

### Core Mechanics
- **Hybrid Perspective**: 2D top-down (towns/dungeons) and 3D first-person (certain dungeons)
- **Combat**: Turn-based tactical grid with positioning (front/back rows)
- **Magic Systems**: Four distinct schools (Iskai, Druid/Celtic, Kenget Kamulos, Dji-Cantos)
- **Party**: Up to 6 members from 9 recruitable characters
- **Unique Feature**: Iskai characters can wield weapons on their tail (third hand)

---

## 2. Application Structure

### Navigation Tabs

| Tab Name | Purpose | Key Features |
|----------|---------|--------------|
| **The Crew's Path** | Character creation & party building | Character comparator, stat charts, party composition tips |
| **Mission Log** | Main walkthrough | Collapsible accordion by chapter, spoiler-controlled hints |
| **Albion Almanac** | Reference data | Sub-tabs: Characters, Equipment, Magic, Monsters |
| **World Atlas** | Interactive maps | Location markers, dungeon guides, Goddess Flower locations |
| **Trade Ledger** | Economy guide | Shop prices, best sell locations, money-making tips |
| **Consult the Seer** | AI-powered assistant | LLM chat with game knowledge, spoiler control, tone options |

---

## 3. Content Breakdown by Section

### 3.1 The Crew's Path (Character Section)

#### Character Data Schema
```json
{
  "characters": [
    {
      "name": "Tom Driscoll",
      "race": "Human",
      "role": "Pilot / Fighter",
      "origin": "Toronto (Spaceship)",
      "joinLocation": "Start of game",
      "canLeave": false,
      "portrait": "tom.png",
      "description": "Main protagonist. Pilot investigating Albion. Permanent party member.",
      "baseStats": {
        "strength": { "base": 42, "max": 70 },
        "intelligence": { "base": 50, "max": 90 },
        "dexterity": { "base": 40, "max": 90 },
        "speed": { "base": 20, "max": 50 },
        "stamina": { "base": 32, "max": 65 },
        "luck": { "base": 10, "max": 25 },
        "magicResistance": { "base": 0, "max": 20 },
        "magicTalent": { "base": 0, "max": 0 }
      },
      "combatSkills": {
        "closeRanged": { "base": 0, "max": 70 },
        "longRanged": { "base": 0, "max": 70 },
        "criticalHit": { "base": 0, "max": 99 }
      },
      "multiAttackLevels": { "2x": 20, "3x": 30, "4x": 40 },
      "magicSchool": null,
      "canUseGuns": true,
      "equipmentTypes": ["Human armor", "Human weapons", "Pistol"],
      "strengths": ["Versatile fighter", "Can use firearms", "Always available"],
      "weaknesses": ["No magic ability", "Average stats"]
    },
    {
      "name": "Rainer Hofstedt",
      "race": "Human",
      "role": "Xenobiologist",
      "origin": "Toronto (Spaceship)",
      "joinLocation": "Toronto, beginning",
      "canLeave": true,
      "leavesAt": "Dji-Cantos (replaced by Harriet)",
      "portrait": "rainer.png",
      "description": "Government scientist. Weak combatant but intelligent. Leaves mid-game.",
      "baseStats": {
        "strength": { "base": 28, "max": 70 },
        "intelligence": { "base": 76, "max": 90 },
        "dexterity": { "base": 80, "max": 90 },
        "speed": { "base": 11, "max": 50 },
        "stamina": { "base": 35, "max": 65 },
        "luck": { "base": 15, "max": 25 },
        "magicResistance": { "base": 10, "max": 20 },
        "magicTalent": { "base": 0, "max": 0 }
      },
      "combatSkills": {
        "closeRanged": { "base": 0, "max": 40 },
        "longRanged": { "base": 0, "max": 40 },
        "criticalHit": { "base": 0, "max": 99 }
      },
      "magicSchool": null,
      "canUseGuns": true,
      "strengths": ["High dexterity", "Can use pistol"],
      "weaknesses": ["Very low combat caps", "Leaves party permanently", "No magic"]
    },
    {
      "name": "Drirr",
      "race": "Iskai",
      "role": "Stiriik (Hunter/Warrior)",
      "origin": "Jirinaar",
      "joinLocation": "Jirinaar, after festival murder",
      "canLeave": true,
      "portrait": "drirr.png",
      "description": "Iskai warrior with exceptional combat abilities. Can wield weapon on tail.",
      "baseStats": {
        "strength": { "base": 30, "max": 45 },
        "intelligence": { "base": 40, "max": 90 },
        "dexterity": { "base": 60, "max": 70 },
        "speed": { "base": 56, "max": 99 },
        "stamina": { "base": 30, "max": 50 },
        "luck": { "base": 20, "max": 33 },
        "magicResistance": { "base": 5, "max": 30 },
        "magicTalent": { "base": 0, "max": 85 }
      },
      "combatSkills": {
        "closeRanged": { "base": 0, "max": 99 },
        "longRanged": { "base": 0, "max": 99 },
        "criticalHit": { "base": 0, "max": 99 }
      },
      "multiAttackLevels": { "2x": 10, "3x": 15, "4x": 20 },
      "magicSchool": null,
      "canUseGuns": false,
      "specialAbility": "Tail weapon slot (third hand)",
      "equipmentTypes": ["Iskai armor", "Iskai weapons", "Tail weapons"],
      "strengths": ["Best fighter early game", "99 combat caps", "Tail weapon slot", "High speed", "Night vision"],
      "weaknesses": ["Lower max strength", "Cannot use human armor", "No magic"]
    },
    {
      "name": "Sira",
      "race": "Iskai",
      "role": "Dji-Kas Mage",
      "origin": "Jirinaar",
      "joinLocation": "Jirinaar, after confronting Bradir",
      "canLeave": true,
      "linkedTo": "Melthas",
      "portrait": "sira.png",
      "description": "Iskai mage specializing in frost and snare magic. Always leaves with Melthas.",
      "baseStats": {
        "strength": { "base": 39, "max": 45 },
        "intelligence": { "base": 55, "max": 90 },
        "dexterity": { "base": 58, "max": 70 },
        "speed": { "base": 59, "max": 99 },
        "stamina": { "base": 35, "max": 50 },
        "luck": { "base": 8, "max": 33 },
        "magicResistance": { "base": 20, "max": 30 },
        "magicTalent": { "base": 85, "max": 85 }
      },
      "combatSkills": {
        "closeRanged": { "base": 0, "max": 70 },
        "longRanged": { "base": 0, "max": 70 },
        "criticalHit": { "base": 0, "max": 99 }
      },
      "multiAttackLevels": { "2x": 16, "3x": 24, "4x": 32 },
      "magicSchool": "Iskai (Dji-Kas)",
      "keySpells": ["Frost Avalanche", "Thorn Snare", "Fungification"],
      "spellReagent": "Trifalai Seeds",
      "strengths": ["Powerful crowd control", "Frost/Snare immobilizes enemies", "High speed"],
      "weaknesses": ["Light armor only", "Spells require Trifalai Seeds", "Linked to Melthas"]
    },
    {
      "name": "Melthas",
      "race": "Human",
      "role": "Druid Mage",
      "origin": "Gratogel (Celtic island)",
      "joinLocation": "Gratogel, Druid's hut",
      "canLeave": true,
      "linkedTo": "Sira",
      "portrait": "melthas.png",
      "description": "Druid who can communicate through Iskai trii. Demon-banishing specialist.",
      "baseStats": {
        "strength": { "base": 39, "max": 90 },
        "intelligence": { "base": 60, "max": 80 },
        "dexterity": { "base": 22, "max": 70 },
        "speed": { "base": 43, "max": 50 },
        "stamina": { "base": 43, "max": 90 },
        "luck": { "base": 5, "max": 25 },
        "magicResistance": { "base": 5, "max": 40 },
        "magicTalent": { "base": 80, "max": 99 }
      },
      "combatSkills": {
        "closeRanged": { "base": 0, "max": 70 },
        "longRanged": { "base": 0, "max": 70 },
        "criticalHit": { "base": 0, "max": 99 }
      },
      "multiAttackLevels": { "2x": 40, "3x": null, "4x": null },
      "magicSchool": "Celtic/Mahinos (Druid)",
      "keySpells": ["Demon Exodus", "Banish Demons", "Magic Shield", "Healing"],
      "strengths": ["Demon Exodus destroys demon-type monsters", "Good healing", "High stamina cap"],
      "weaknesses": ["Gains multi-attack very late", "Only trainable in Jirinaar", "Linked to Sira"]
    },
    {
      "name": "Siobhan",
      "race": "Human",
      "role": "Warrior",
      "origin": "Beloveno (Maini)",
      "joinLocation": "Beloveno, her house",
      "canLeave": true,
      "mutuallyExclusiveWith": "Khunag (initial choice)",
      "portrait": "siobhan.png",
      "description": "The most powerful warrior in the game. Natural +4 base damage.",
      "baseStats": {
        "strength": { "base": 60, "max": 90 },
        "intelligence": { "base": 45, "max": 80 },
        "dexterity": { "base": 50, "max": 70 },
        "speed": { "base": 45, "max": 50 },
        "stamina": { "base": 50, "max": 75 },
        "luck": { "base": 10, "max": 25 },
        "magicResistance": { "base": 5, "max": 20 },
        "magicTalent": { "base": 0, "max": 35 }
      },
      "combatSkills": {
        "closeRanged": { "base": 0, "max": 99 },
        "longRanged": { "base": 0, "max": 99 },
        "criticalHit": { "base": 0, "max": 99 }
      },
      "magicSchool": null,
      "specialAbility": "+4 base damage (like Iskai tail)",
      "strengths": ["Highest damage potential", "99 combat caps", "Can wield heavy 2H weapons effectively"],
      "weaknesses": ["Limited magic potential", "Initially exclusive choice with Khunag"]
    },
    {
      "name": "Khunag",
      "race": "Human",
      "role": "Kenget Kamulos Mage",
      "origin": "Beloveno (Maini)",
      "joinLocation": "Beloveno, Kariah's house",
      "canLeave": true,
      "permanentLeaveCondition": "If asked to leave after Kenget Kamulos chapter",
      "mutuallyExclusiveWith": "Siobhan (initial choice)",
      "portrait": "khunag.png",
      "description": "Renegade mage seeking revenge on his order. Required for Kenget Kamulos.",
      "baseStats": {
        "strength": { "base": 35, "max": 60 },
        "intelligence": { "base": 60, "max": 90 },
        "dexterity": { "base": 20, "max": 40 },
        "speed": { "base": 20, "max": 70 },
        "stamina": { "base": 30, "max": 55 },
        "luck": { "base": 5, "max": 25 },
        "magicResistance": { "base": 12, "max": 40 },
        "magicTalent": { "base": 99, "max": 99 }
      },
      "combatSkills": {
        "closeRanged": { "base": 0, "max": 40 },
        "longRanged": { "base": 0, "max": 40 },
        "criticalHit": { "base": 0, "max": 99 }
      },
      "multiAttackLevels": { "2x": 18, "3x": 27, "4x": 36 },
      "magicSchool": "Kenget Kamulos",
      "keySpells": ["Thunderstorm", "Steal Life", "Steal Magic", "Fire Rain"],
      "requiredFor": "Kenget Kamulos chapter (cannot enter without him)",
      "strengths": ["Highest magic talent (99)", "Powerful offensive spells", "Steal Magic sustains SP"],
      "weaknesses": ["Weak in physical combat", "Leaves permanently if dismissed after his chapter"]
    },
    {
      "name": "Harriet",
      "race": "Human",
      "role": "Dji-Cantos Mage",
      "origin": "Dji-Cantos Island",
      "joinLocation": "Dji-Cantos, replaces Rainer",
      "canLeave": false,
      "portrait": "harriet.png",
      "description": "Required for teleportation between islands via Goddess's caves.",
      "baseStats": {
        "strength": { "base": 35, "max": 50 },
        "intelligence": { "base": 55, "max": 99 },
        "dexterity": { "base": 33, "max": 60 },
        "speed": { "base": 42, "max": 50 },
        "stamina": { "base": 30, "max": 55 },
        "luck": { "base": 20, "max": 25 },
        "magicResistance": { "base": 28, "max": 55 },
        "magicTalent": { "base": 75, "max": 99 }
      },
      "combatSkills": {
        "closeRanged": { "base": 0, "max": 40 },
        "longRanged": { "base": 0, "max": 40 },
        "criticalHit": { "base": 0, "max": 99 }
      },
      "multiAttackLevels": { "2x": 25, "3x": 36, "4x": 48 },
      "magicSchool": "Dji-Cantos (Enlightened Ones)",
      "keySpells": ["Goddess's Wrath", "Lifebringer", "Recuperation", "Regeneration"],
      "specialAbility": "Teleportation via Goddess's caves",
      "strengths": ["Goddess's Wrath destroys all enemies", "Best healing spells", "Required for fast travel"],
      "weaknesses": ["Very weak in combat", "High SP consumption", "Cannot leave party"]
    },
    {
      "name": "Joe Bernard",
      "race": "Human",
      "role": "Technician",
      "origin": "Toronto (Spaceship)",
      "joinLocation": "Dji-Cantos, late game (optional)",
      "canLeave": true,
      "portrait": "joe.png",
      "description": "Technician who makes the final Toronto section much easier.",
      "baseStats": {
        "strength": { "base": 45, "max": 70 },
        "intelligence": { "base": 50, "max": 90 },
        "dexterity": { "base": 80, "max": 90 },
        "speed": { "base": 40, "max": 50 },
        "stamina": { "base": 60, "max": 65 },
        "luck": { "base": 8, "max": 25 },
        "magicResistance": { "base": 0, "max": 20 },
        "magicTalent": { "base": 0, "max": 0 }
      },
      "magicSchool": null,
      "canUseGuns": true,
      "specialAbility": "Repairs electronics without damage, reduces final dungeon battles",
      "requiredFor": "Easier Toronto finale (avoids 106 robot battles)",
      "strengths": ["High dexterity", "Can use firearms", "Essential for easy endgame"],
      "weaknesses": ["Joins very late", "No magic", "Needs leveling to catch up"]
    }
  ]
}
```

#### Party Building Tips Content
- **Recommended Party Compositions**:
  - **Balanced**: Tom, Drirr, Sira, Melthas, Siobhan, Harriet
  - **Magic-Heavy**: Tom, Drirr, Sira, Melthas, Khunag, Harriet
  - **Combat-Focused**: Tom, Drirr, Siobhan, Melthas, Joe, Harriet

- **Key Decisions**:
  - Siobhan vs Khunag: Initial mutual exclusion (can get both later)
  - Khunag is REQUIRED for Kenget Kamulos chapter
  - Joe makes final dungeon significantly easier

---

### 3.2 Mission Log (Walkthrough)

#### Chapter Structure
```json
{
  "chapters": [
    {
      "id": "toronto-intro",
      "title": "Toronto — The Beginning",
      "subtitle": "The Spaceship",
      "location": "Toronto (Spaceship)",
      "summary": "Explore the ship, find the hidden pistol, and launch to Albion.",
      "keyItems": ["Pistol", "Canisters", "Stimdrinks"],
      "keyCode": "1042 (COM room access)",
      "tips": [
        "Hide weapon in wall cabinet before passing security",
        "Search Inspector Beegle's room for supplies",
        "Talk to Anne 6 times for free rations"
      ]
    },
    {
      "id": "nakiridaani",
      "title": "Nakiridaani — Land of the Iskai",
      "subtitle": "The Hunter's Clan",
      "location": "Jirinaar",
      "newPartyMembers": ["Drirr", "Sira"],
      "summary": "Explore Iskai city, investigate murder, explore Former's Building for stat bonuses.",
      "keyItems": ["Hunter Clan's Key", "Fine Iskai Dagger", "Crystal Dagger"],
      "statBonuses": [
        { "stat": "Speed", "amount": 10, "location": "Former's Building - Rainbow bushes" },
        { "stat": "Stamina", "amount": 10, "location": "Former's Building - South passage" },
        { "stat": "Strength", "amount": 10, "location": "Former's Building - Break south wall" }
      ],
      "tips": [
        "Get Blue Healing Potions from Rejira repeatedly for infinite money",
        "Wait for stat bonuses until Sira joins",
        "Train at 2.5G per point - cheapest in game"
      ]
    },
    {
      "id": "gratogel",
      "title": "Gratogel — Celtic Civilization",
      "subtitle": "The Druids",
      "location": "Klouta, Vanello, Arjano",
      "newPartyMembers": ["Melthas"],
      "summary": "Find amulet for King Tharnos, explore forbidden druid library.",
      "keyItems": ["Strength Amulet", "Power Amulet", "Sun Dagger", "Monster Eye", "Dream Shield"],
      "tips": [
        "Kill bandits in mountain pass for money",
        "Buy Monster Eye (450G) - essential item",
        "Trade Music Crystal for Crystal Throwing Axe"
      ]
    },
    {
      "id": "maini",
      "title": "Maini — Iskai & Human Conflict",
      "subtitle": "Preventing Assassination",
      "location": "Beloveno, Kounos, Srimalinar",
      "newPartyMembers": ["Siobhan OR Khunag"],
      "summary": "Prevent Herras's assassination, confront Kontos at the shrine.",
      "timedEvent": true,
      "questSequence": [
        "Talk to Herras in council",
        "Visit Kariah, ask about 'Yes' and 'Information'",
        "Find Melthas's friend in Kounos",
        "Buy Edjiir's information in Srimalinar",
        "Return to Herras, ask about 'Assassination'",
        "Then find Melthas's friend to trigger event"
      ],
      "reward": "Herras's Key (treasury access: 4 Jewels + 521.4G)"
    },
    {
      "id": "dji-cantos",
      "title": "Dji Cantos — The Secret Society",
      "subtitle": "Goddess's Island",
      "location": "Dji-Cantos Island",
      "newPartyMembers": ["Harriet"],
      "summary": "Join the Enlightened Ones, find all 8 Goddess's Flowers for permanent stat boosts.",
      "goddessFlowers": [
        { "stat": "Magic Resistance", "location": "Southeast from building, near alcove" },
        { "stat": "Luck", "location": "Northwest, near large bridge junction" },
        { "stat": "Magic Talent", "location": "South path, near pavilion by fish" },
        { "stat": "Strength", "location": "Far south, by waterfall" },
        { "stat": "Intelligence", "location": "Near strength flowers, by tree" },
        { "stat": "Dexterity", "location": "East path, between two trees" },
        { "stat": "Stamina", "location": "South stairs, jutting land piece" },
        { "stat": "Speed", "location": "Southeast from stamina, near bard" }
      ],
      "flowerBonus": "+3 per stat per use, recharges over time"
    },
    {
      "id": "umajo",
      "title": "Umajo — City of Metalmakers",
      "subtitle": "The Desert City",
      "location": "Umajo",
      "summary": "Navigate desert, find path to Toronto, explore prison sidequest.",
      "keyItems": ["Porenoil (desert survival)"],
      "shopNote": "Best selling prices in game (130%)",
      "secretPath": "Pay Ohl a Jewel or follow directions to cave entrance"
    },
    {
      "id": "toronto-return",
      "title": "Toronto Again — The Bitter Truth",
      "subtitle": "Return to the Ship",
      "location": "Toronto (Spaceship)",
      "codes": ["1001 (from notebook)", "1712 (service level)", "4312 (reversed Code-Notes)"],
      "summary": "Discover the truth about DDT's plans, return to Dji-Cantos with evidence.",
      "reward": "1500G + video footage"
    },
    {
      "id": "kenget-kamulos",
      "title": "Kenget Kamulos — High Knowledge",
      "subtitle": "The Mage Order",
      "location": "Kenget Kamulos fortress",
      "requiredPartyMember": "Khunag",
      "summary": "Infiltrate the order, defeat Kamulos, obtain the High Knowledge.",
      "infiniteBattleTip": "Surrender triggers endless battles - farm Bolt-Throwers (516.6G each at Umajo)",
      "boss": { "name": "Kamulos", "hp": 650, "weakness": "Thorn Snare (immune to Frost)", "reward": "High Knowledge + 3000 XP" }
    },
    {
      "id": "equipment-makers",
      "title": "Equipment Makers — Metal Magic",
      "subtitle": "The Secret Society",
      "location": "Umajo underground",
      "summary": "Learn the secret word 'Umajo Danu', obtain Metalmagic Scroll.",
      "secretWord": "Umajo Danu",
      "infiniteXPLocation": "Blue floor plate summons 16 Animal 3s (5760 XP total)",
      "keyItems": ["Metalmagic Scroll", "Stone of Visions", "Serpent Staff"]
    },
    {
      "id": "finale",
      "title": "The Seed — Final Chapter",
      "subtitle": "Destroying Toronto",
      "location": "Toronto (final)",
      "optionalPartyMember": "Joe (highly recommended)",
      "summary": "Plant The Seed in the reactor, end the threat to Albion.",
      "withJoe": "Repairs circuits, avoids 106 Service Robot battles",
      "withoutJoe": "Must fight through waves of robots",
      "finalBoss": {
        "name": "AI Housing",
        "hp": 4500,
        "immunities": ["All weapons", "Frost spells", "Death spells"],
        "strategy": "Use Thorn Snare to immobilize. Spells do 1 damage. Let it kill a character to trigger ending.",
        "note": "Not meant to be killed - ending triggers when party member falls"
      }
    }
  ]
}
```

---

### 3.3 Albion Almanac (Reference Data)

#### Equipment Data Schema
```json
{
  "weapons": {
    "closeRanged": [
      {
        "name": "Gaze of Kamulos",
        "type": "2-Handed",
        "damage": 26,
        "weight": 500,
        "price": 2500,
        "users": ["Tom", "Melthas", "Siobhan", "Khunag", "Harriet", "Joe"],
        "modifiers": null,
        "spell": { "name": "Kamulos's Gaze", "charges": 6, "maxRecharge": 5 },
        "location": "Kenget Kamulos",
        "notes": "Best 2H weapon for Siobhan"
      },
      {
        "name": "Shadowsword",
        "damage": 25,
        "weight": 1500,
        "price": 250,
        "cursed": true,
        "modifiers": { "LP": -30, "Stamina": -50, "Lockpicking": -30 },
        "spell": { "name": "Steal Life", "charges": 30, "maxRecharge": 20 },
        "location": "Treasure Cave (Maini)",
        "notes": "High damage compensates for curse - good for Drirr"
      },
      {
        "name": "Danu's Light",
        "damage": 14,
        "weight": 2500,
        "price": 1875,
        "modifiers": { "LP": 10, "Speed": 20, "CLO": 15, "Protection": 5 },
        "spell": { "name": "Lifebringer", "charges": 10, "maxRecharge": 10 },
        "location": "Shop (Beloveno)"
      },
      {
        "name": "Iskai Lance",
        "type": "2-Handed",
        "damage": 18,
        "weight": 2500,
        "price": 625,
        "users": ["Drirr only"],
        "modifiers": { "CLO": -6 },
        "notes": "Best Iskai weapon"
      }
    ],
    "longRanged": [
      {
        "name": "Bolt-Rifle",
        "damage": 18,
        "weight": 3500,
        "price": 2333,
        "ammoType": "Bolt",
        "modifiers": { "LON": 20 },
        "location": "Umajo shop"
      },
      {
        "name": "Crystal Throwing Axe",
        "damage": 12,
        "weight": 1200,
        "price": 1250,
        "location": "Trade Music Crystal near Druid's hut"
      },
      {
        "name": "Pistol",
        "damage": 30,
        "ammoType": "Canister",
        "users": ["Tom", "Rainer", "Joe"],
        "modifiers": { "LON": 60 },
        "location": "Toronto COM room",
        "notes": "Cannot be sold, essential for endgame"
      }
    ]
  },
  "armor": [
    {
      "name": "Heavy Chainmail",
      "protection": 11,
      "weight": 12500,
      "price": 567,
      "modifiers": { "CLO": -6, "LON": -5 },
      "users": "Human only"
    },
    {
      "name": "Iskai Armor",
      "protection": 8,
      "weight": 3800,
      "price": 433,
      "modifiers": { "CLO": -4 },
      "users": "Iskai only (Drirr)"
    }
  ],
  "shields": [
    {
      "name": "Dreamshield",
      "protection": 12,
      "weight": 2500,
      "price": 625,
      "spell": { "name": "Sleep Spores", "charges": 20 },
      "location": "Rifrako's shop (Aballon)",
      "notes": "Best value shield"
    },
    {
      "name": "Serpent Staff",
      "protection": 10,
      "weight": 500,
      "price": 150,
      "modifiers": { "LP": 10, "SP": 25 },
      "spell": { "name": "Regeneration", "charges": 10 },
      "specialNote": "Can equip WITH 2-handed weapons",
      "users": ["Sira", "Melthas", "Harriet", "Khunag"],
      "location": "Equipment Makers cellar (Umajo)"
    }
  ],
  "helmets": [
    {
      "name": "Lugh's Hand Helmet",
      "protection": 20,
      "weight": 2500,
      "price": 1167,
      "modifiers": { "Luck": 35 },
      "location": "Kenget Kamulos"
    }
  ],
  "accessories": [
    {
      "name": "Power Amulet",
      "protection": 1,
      "modifiers": { "LP": 25, "Strength": 50 },
      "price": 450,
      "locations": ["Druid's Forbidden Library", "Kounos dungeon"]
    },
    {
      "name": "Speed Amulet",
      "modifiers": { "Speed": 30 },
      "price": 258,
      "notes": "Essential for Sira - act before enemies"
    },
    {
      "name": "Thief's Amulet",
      "modifiers": { "Dexterity": 30, "Lockpicking": 30 },
      "price": 208,
      "location": "Kenget Kamulos (novice room)"
    }
  ]
}
```

#### Magic System Data
```json
{
  "magicSchools": [
    {
      "name": "Iskai (Dji-Kas)",
      "practitioners": ["Sira"],
      "reagent": "Trifalai Seed (1.2G each)",
      "freeTraining": "Fasiir in Dji-Kas guild (Jirinaar)",
      "specialties": ["Frost/immobilization", "Snares", "Light healing"],
      "keySpells": [
        { "name": "Frost Avalanche", "level": 9, "sp": 30, "effect": "Freezes all enemies" },
        { "name": "Thorn Snare", "level": 12, "sp": 16, "effect": "Immobilizes target completely" },
        { "name": "Fungification", "level": 15, "sp": 24, "effect": "Damage, can disintegrate weakened enemies" }
      ]
    },
    {
      "name": "Celtic/Mahinos (Druid)",
      "practitioners": ["Melthas"],
      "reagent": "None",
      "freeTraining": "Buy scrolls from Roves in Arjano library",
      "specialties": ["Demon banishment", "Buffs", "Healing"],
      "keySpells": [
        { "name": "Demon Exodus", "level": 20, "sp": 70, "effect": "Destroys ALL demon-type enemies" },
        { "name": "Magic Shield", "level": 8, "sp": 25, "effect": "Increases M-R and Protection" },
        { "name": "Berserk", "level": 7, "sp": 12, "effect": "Trade 20% LP for combat stat boost" }
      ],
      "notes": "Demon types include: Animal, Plague, Fear, Storm (1/2/3)"
    },
    {
      "name": "Kenget Kamulos",
      "practitioners": ["Khunag"],
      "reagent": "None",
      "freeTraining": "Pickup scrolls in Kenget Kamulos dungeon",
      "specialties": ["Lightning damage", "Life/Magic stealing", "Traps"],
      "keySpells": [
        { "name": "Thunderstorm", "level": null, "sp": 35, "effect": "Damage all enemies" },
        { "name": "Steal Magic", "level": null, "sp": 15, "effect": "Drain SP from enemy - sustain casting" },
        { "name": "Steal Life", "level": null, "sp": 15, "effect": "Drain LP from enemy" }
      ]
    },
    {
      "name": "Dji-Cantos (Enlightened Ones)",
      "practitioners": ["Harriet"],
      "reagent": "None",
      "freeTraining": "Drannagh in Dji-Cantos building",
      "specialties": ["Mass healing", "Party recovery", "Ultimate destruction"],
      "keySpells": [
        { "name": "Goddess's Wrath", "level": 22, "sp": 160, "effect": "Destroys enemies (proficiency = count)" },
        { "name": "Lifebringer", "level": 13, "sp": 60, "effect": "Heals entire party" },
        { "name": "Recuperation", "level": 4, "sp": 10, "effect": "Rest without sleeping or food" }
      ]
    }
  ]
}
```

#### Monster Bestiary
```json
{
  "monsterTypes": {
    "demons": {
      "note": "Vulnerable to Banish/Demon Exodus spells",
      "families": ["Animal", "Plague", "Fear", "Storm"],
      "tiers": [1, 2, 3]
    }
  },
  "monsters": [
    {
      "name": "Animal 3",
      "type": "Demon",
      "exp": 357,
      "lp": 125,
      "attacks": 2,
      "drops": null,
      "strategy": "Fastest monster in game. Use Frost Avalanche/Thorn Snare/Demon Exodus immediately.",
      "danger": "Critical hit capable"
    },
    {
      "name": "Krondir",
      "type": "Beast",
      "tiers": [
        { "tier": 1, "exp": 180, "lp": 32, "attacks": 1 },
        { "tier": 2, "exp": null, "lp": 75, "attacks": 2 }
      ],
      "drops": ["Meat", "Krondir Trii (9.1G at Rabir)"],
      "notes": "Good early-game farming"
    },
    {
      "name": "Service Robot",
      "exp": 174,
      "location": "Toronto (final)",
      "strategy": "High LP makes them tedious. Use Goddess's Wrath or critical hits.",
      "notes": "106 battles without Joe"
    },
    {
      "name": "AI Housing",
      "exp": null,
      "lp": 4500,
      "immunities": ["All weapons", "Frost spells", "Death spells"],
      "vulnerability": "Thorn Snare (immobilize)",
      "strategy": "Not meant to be killed. Let it defeat a party member to trigger ending.",
      "notes": "Final boss - dealing 4500 damage with 1-damage spells is impractical"
    }
  ]
}
```

---

### 3.4 World Atlas

#### Location Markers Schema
```json
{
  "regions": [
    {
      "name": "Toronto",
      "type": "spaceship",
      "chapters": ["toronto-intro", "toronto-return", "finale"]
    },
    {
      "name": "Nakiridaani (Iskai Island)",
      "type": "region",
      "locations": [
        {
          "name": "Jirinaar",
          "type": "city",
          "description": "Capital of the Iskai Hunter Clan",
          "poi": ["Dji-Kas Guild", "Dji-Fadh Guild", "Weapon Smith (Rabir)", "Battle Trainer"]
        },
        {
          "name": "Former's Building",
          "type": "dungeon",
          "description": "Ancient structure with stat-boosting bonuses",
          "rewards": ["Speed +10", "Stamina +10", "Strength +10"]
        }
      ]
    },
    {
      "name": "Gratogel (Celtic Island)",
      "type": "region",
      "locations": [
        { "name": "Klouta", "type": "village", "poi": ["King Tharnos"] },
        { "name": "Vanello", "type": "town", "poi": ["Winion (best local prices)", "Tamno"] },
        { "name": "Arjano", "type": "druid-complex", "poi": ["Library", "Forbidden Area"] },
        { "name": "Aballon", "type": "village", "poi": ["Rifrako (Monster Eye, Dream Shield)"] }
      ]
    },
    {
      "name": "Maini (Human/Iskai Island)",
      "type": "region",
      "locations": [
        { "name": "Beloveno", "type": "city", "poi": ["Council House", "Siobhan's House", "Khunag's House"] },
        { "name": "Kounos", "type": "dungeon-village" },
        { "name": "Srimalinar", "type": "town", "poi": ["Edjiir (information broker)"] },
        { "name": "Treasure Cave", "type": "dungeon", "description": "Below Kounos cliffs near waterfall" }
      ]
    },
    {
      "name": "Dji-Cantos Island",
      "type": "region",
      "locations": [
        { "name": "Dji-Cantos Building", "type": "headquarters" },
        { "name": "Goddess's Flowers", "type": "poi", "count": 8, "effect": "+3 to each stat" }
      ]
    },
    {
      "name": "Umajo Desert",
      "type": "region",
      "locations": [
        { "name": "Umajo", "type": "city", "poi": ["Best shop prices (130%)", "Equipment Makers Guild", "Prison"] },
        { "name": "Equipment Makers Cellar", "type": "dungeon" }
      ]
    },
    {
      "name": "Kenget Kamulos",
      "type": "dungeon",
      "description": "Mage order fortress"
    }
  ]
}
```

---

### 3.5 Trade Ledger (Economy)

#### Shop Price Multipliers
| Location | Sell Price | Buy Price | Notes |
|----------|------------|-----------|-------|
| Rabir (Jirinaar) | 110% | 132% | Best on Iskai island |
| Winion (Vanello) | 125% | 150% | Best on Gratogel |
| Umajo Shops | **130%** | 156% | **Best in game** |
| Kounos Woman | 38% | - | Never sell here |
| Riolea (Beloveno) | 75% | 100% | Mediocre |

#### Money-Making Strategies
1. **Rejira Exploit** (Jirinaar): Talk to healer repeatedly for free Blue Healing Potions (18.3G at Rabir)
2. **Bandit Farming** (Gratogel): Kill bandits in mountain pass for sellable loot
3. **Kenget Kamulos Farming**: Surrender to trigger infinite battles, farm Bolt-Throwers (516.6G each)
4. **Krondir Hunting**: Trii sells for 9.1G at Rabir

---

### 3.6 Consult the Seer (AI Assistant)

#### System Context for LLM
```
You are a wise seer who has witnessed the events on Albion. You provide guidance to travelers from the Toronto spaceship who seek to save this world from destruction.

GAME KNOWLEDGE:
- Albion is a 1995 RPG by Blue Byte with 2D/3D hybrid gameplay
- Turn-based tactical combat with row positioning
- Four magic schools: Iskai, Druid, Kenget Kamulos, Dji-Cantos
- Party of up to 6 from 9 characters
- Iskai can use tail as third weapon slot

KEY SPOILER WARNINGS:
- Rainer leaves party mid-game (replaced by Harriet)
- Khunag required for Kenget Kamulos chapter
- Joe makes finale significantly easier
- Final boss (AI Housing) is not meant to be killed

RESPONSE STYLE OPTIONS:
- Pragmatic: Direct, strategic advice
- Visionary: Poetic, prophetic tone
- Cryptic: Riddles and hints

SPOILER LEVELS:
- Gentle nudges: Vague hints only
- Balanced: General direction without specifics
- Full disclosure: Complete solutions
```

#### Shortcut Prompts
- "How do I make money early game?"
- "What's the best party composition?"
- "How do I beat [boss name]?"
- "Where are the Goddess's Flowers?"
- "Should I choose Siobhan or Khunag?"
- "How do I prevent Herras's assassination?"

---

## 4. Interactive Features Specification

### 4.1 Character Comparator
- **Radar chart** comparing selected characters across stats
- **Side-by-side stat tables**
- **Party slot builder** (6 slots, shows warnings for incompatibilities)

### 4.2 Equipment Database
- **Sortable/filterable tables** by damage, protection, weight, price
- **"Who can use this?"** quick filter
- **Spell-equipped items** highlighted

### 4.3 Walkthrough Accordion
- **Collapsible chapters** with spoiler warnings
- **"Show hint" buttons** for puzzle solutions
- **Checklist mode** for tracking progress

### 4.4 Interactive Map
- **Region selector** for each island/area
- **Markers** for shops, dungeons, NPCs, Goddess Flowers
- **Click-to-expand** location details

### 4.5 Economy Calculator
- **Price comparison tool**: Enter item, see best buy/sell locations
- **Inventory value estimator**

---

## 5. Visual Design Notes

### Theme Suggestion
- **Palette**: Blend of sci-fi (cool blues, metallic grays) and fantasy (warm earth tones, mystical purples)
- **Header**: Starfield transitioning to Albion landscape
- **Fonts**: Mix of futuristic (Toronto sections) and organic/mystical (Albion sections)
- **Icons**: Combine tech symbols with magical runes

### Key Visual Elements
- Iskai characters should have distinct alien appearance indicators
- Magic school colors: Iskai (blue/frost), Druid (green), Kenget (red/fire), Dji-Cantos (gold/divine)
- Toronto sections: Clinical, spaceship aesthetic
- Albion sections: Lush, colorful, mystical

---

## 6. File Structure Recommendation

```
guides/
├── Albion.html                 # Main interactive guide
├── css/
│   └── Albion.css              # Custom styles
├── js/
│   ├── Albion.js               # Main application logic
│   ├── AlbionData.js           # Character, item, location data
│   └── AlbionMarkers.js        # Map marker data
└── images/
    └── albion/
        ├── header.png          # Header background
        ├── characters/         # Character portraits
        ├── maps/               # Regional maps
        └── icons/              # UI icons
```

---

## 7. Attribution

Original walkthrough content by **Lung Kwan A.K.A Draglung** (Version 0.90, 2004-2005)
Additional contributions by **Anrie Van Dyk**

*This framework document prepared for interactive guide generation.*
