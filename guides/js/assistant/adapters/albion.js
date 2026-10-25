import { createGuideAssistant } from '../guide-assistant.js';
import { buildNarrativeRecords, buildResearchRecords, buildTopicRecords, factMap } from '../topics.js';

const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const source = locator => ({ file: 'guides/js/Albion.js', locator, review: 'extracted' });
export function importAlbionProgress(questLog, state) {
    return questLog.flatMap(group => group.items.filter(item => state?.[group.id]?.[item.id] === true)
        .map(item => ({ id: `albion:completed:${group.id}:${item.id}`, value: true, temporal: 'historical',
            source: { file: 'localStorage:albion.questLog.v1', locator: `${group.id}.${item.id}`, review: 'player-report' } })));
}
const placeText = (name, description, poi) => `${name}: ${description}${poi?.length ? ` Points of interest: ${poi.join('; ')}.` : ''}`;
// Guide facts that overlay topics may index, keyed by stable names.
export function albionFacts({ DB, tradeHints = [] }) {
    return factMap([
        ...DB.chapters.flatMap(chapter => (chapter.tips || []).map((tip, i) =>
            [`tip:${chapter.id}:${i}`, `${tip}.`, source(`DB.chapters[id=${chapter.id}].tips[${i}]`)])),
        ...(DB.trade || []).map((t, i) => [`trade:${i}`, `${t.location}: Sell ${t.sell}, Buy ${t.buy}. ${t.notes}.`, source(`DB.trade[${i}]`)]),
        ...tradeHints.map((hint, i) => [`tradehint:${i}`, `${hint.title}: ${hint.text}`, source(`ALBION_TRADE_HINTS[${i}]`)]),
        ...(DB.magic || []).map((m, i) => [`magic:${i}`,
            `${m.school}: practitioner ${m.practitioner}; reagent ${m.reagent}; training: ${m.freeTraining}. ${m.routeHint}`, source(`DB.magic[${i}]`)]),
        ...(DB.equipment || []).map((e, i) => [`equip:${slug(e.name)}`, `${e.name}: ${e.location}.`, source(`DB.equipment[${i}].location`)]),
        ...(DB.locations || []).flatMap((location, li) => [
            [`place:${slug(location.name)}`, placeText(location.name, location.description, location.poi), source(`DB.locations[${li}]`)],
            ...(location.locations || []).map((place, pi) => [`place:${slug(place.name)}`,
                `${place.name} (${place.type}) on ${location.name}. ${place.poi?.length ? `Points of interest: ${place.poi.join('; ')}.` : ''}`,
                source(`DB.locations[${li}].locations[${pi}]`)])
        ])
    ]);
}
export function albionNarrativeFacts({ DB, questHints }) {
    return factMap([
        ...DB.characters.map((character, index) => [`narrative:character:${slug(character.name)}`,
            `${character.name}: ${character.notes}`, source(`DB.characters[${index}].name/notes`), { minSpoiler: 'direct' }]),
        ...DB.chapters.map((chapter, index) => [`narrative:chapter:${chapter.id}`, chapter.summary,
            source(`DB.chapters[${index}].summary`), { minSpoiler: 'balanced' }]),
        ['narrative:maini-sequence', questHints.maini['assassination-sequence'], source('QUEST_HINTS.maini.assassination-sequence'), { minSpoiler: 'direct' }],
        ['narrative:codes-sequence', questHints['toronto-return'].codes, source('QUEST_HINTS.toronto-return.codes'), { minSpoiler: 'direct' }],
        ['narrative:ending', questHints.finale['ai-housing'], source('QUEST_HINTS.finale.ai-housing'), { minSpoiler: 'direct' }],
        ['narrative:toronto-route', questHints.umajo['find-path'], source('QUEST_HINTS.umajo.find-path'), { minSpoiler: 'direct' }]
    ]);
}
const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const STAT_NAMES = { strength: 'Strength', intelligence: 'Intelligence', dexterity: 'Dexterity', speed: 'Speed', stamina: 'Stamina', magicTalent: 'Magic talent' };
const yesNo = value => value === true ? 'yes' : value === false ? 'no' : null;
export function buildAlbionRecords({ DB, questLog, questHints, overlay, tradeHints = [], movements = [], atlas = null }) {
    const records = [];
    const idForItem = name => `albion:item:${slug(name)}`;
    const knownItems = { pistol: 'Pistol', dreamshield: 'Dreamshield', 'monster-eye': 'Monster Eye' };
    const fact = (name, kind) => `albion:${kind}:${slug(name)}`;
    function add(entityId, title, relation, text, locator, options = {}) {
        records.push({ id: `${entityId}:${relation}`, entityId, title,
            aliases: overlay.aliases[title] || [], kind: entityId.split(':')[1], relation,
            scope: options.scope || 'reference', requires: null, editions: ['1995', 'pc'],
            minSpoiler: 'direct', variants: { direct: { text } }, source: source(locator), ...options });
        return records.at(-1);
    }
    // A fact visible from `tier` upward; the text is the same at every tier unless `lower` supplies a vaguer one.
    const from = (tier, text, lower = {}) => ({ minSpoiler: tier, variants: { ...lower, [tier]: { text } } });
    const AUTHORED = locator => ({ file: 'guides/js/assistant/adapters/albion.js', locator, review: 'authored-index' });
    const alsoAnswers = (record, answers, locator) => Object.assign(record, { answers: [...(record.answers || []), ...answers],
        source: { ...record.source, index: AUTHORED(locator) } });
    questLog.forEach((group, gi) => group.items.forEach((item, ii) => {
        const names = knownItems[item.id];
        const entityId = names ? idForItem(names) : item.id === 'com-code' ? 'albion:access:com'
            : item.id.startsWith('recruit-') ? `albion:character:${item.id.slice(8)}`
            : `albion:objective:${group.id}:${item.id}`;
        const title = names || overlay.safeLabels[item.id] || `Chapter ${gi + 1} objective ${ii + 1}`;
        const variants = overlay.objectives[item.id];
        const record = add(entityId, title, 'hint', questHints[group.id]?.[item.id] || item.text,
            `QUEST_HINTS[${JSON.stringify(group.id)}][${JSON.stringify(item.id)}]`, {
                scope: group.id, completionFact: `albion:completed:${group.id}:${item.id}`,
                optional: /^(Optional:|Strongly recommended:|Consider )/.test(item.text),
                minSpoiler: 'gentle'
            });
        const extra = overlay.objectiveAliases?.[item.id] || {};
        record.variants.gentle = { text: variants[0], title, aliases: [title, ...(extra.gentle || [])],
            source: { file: 'guides/data/assistant/albion.json', locator: `objectives.${item.id}[0]`, review: 'authored-from-guide' } };
        record.variants.balanced = { text: variants[1], title, aliases: [title, ...(extra.gentle || []), ...(extra.balanced || [])],
            source: { file: 'guides/data/assistant/albion.json', locator: `objectives.${item.id}[1]`, review: 'authored-from-guide' } };
        record.variants.direct.title = names || item.text.replace(/\.$/, '');
        record.variants.direct.aliases = [title, ...(overlay.aliases[names] || []), ...(extra.direct || [])];
        if (overlay.objectiveAnswers?.[item.id]) alsoAnswers(record, overlay.objectiveAnswers[item.id], `overlay objectiveAnswers.${item.id}`);
        if (names) record.possessionFact = fact(names, 'possesses');
        if (item.id === 'xp-plate') record.conflict = true;
        if (item.id === 'assassination-sequence') record.conflict = true;
    }));
    // References follow the actual checkbox order, independently of retrieval
    // ranking. They select a quotation, never establish prerequisites.
    questLog.forEach(group => {
        const hints = records.filter(r => r.relation === 'hint' && r.scope === group.id && r.completionFact);
        const checklist = hints.map(r => ({ recordId: r.id, completionFact: r.completionFact }));
        hints.forEach(r => { r.checklist = checklist; });
    });
    // Equipment names, effects and shop or dungeon locations are Balanced; the quest hints for the three
    // key items keep their own vaguer Gentle wording.
    DB.equipment.forEach((item, index) => {
        const entityId = idForItem(item.name);
        const options = { scope: item.chapterId, possessionFact: fact(item.name, 'possesses') };
        const effect = `${item.type}. ${item.effect}${item.damage ? `. Damage: ${item.damage}.` : '.'}`;
        const where = `${item.name}: ${item.location}.`;
        const location = add(entityId, item.name, 'location', where, `DB.equipment[${index}].location`,
            { ...options, ...from('balanced', where) });
        if (item.name === 'Pistol') {
            location.minSpoiler = 'gentle';
            location.variants.gentle = { text: 'Look in the ship’s service area for damaged equipment.' };
            location.variants.balanced = { text: 'Inspect the damaged console in the COM room.' };
            location.variants.direct = { text: where };
        }
        if (item.name === 'Dreamshield') {
            location.minSpoiler = 'gentle';
            location.variants.gentle = { text: overlay.objectives.dreamshield[0] };
            location.variants.balanced = { text: where };
        }
        // "Where do I get the Bolt-Rifle?" is answered by the place the guide lists for it.
        // Items with a quest-hint acquisition entry (Pistol, Dreamshield) keep that as their how-to-get-it answer.
        if (!['Pistol', 'Dreamshield'].includes(item.name)) alsoAnswers(location, ['acquisition'], 'equipment location answers where-to-get-it');
        add(entityId, item.name, 'use', effect, `DB.equipment[${index}].effect`, { ...options, ...from('balanced', effect) });
        add(entityId, item.name, 'explanation', `${item.name}: ${effect}`, `DB.equipment[${index}]`,
            { ...options, ...from('balanced', `${item.name}: ${effect}`) });
    });
    // The Monster Eye has no equipment row; the guide's Aballon entry lists it under Rifrako.
    const eyePlace = DB.locations.flatMap(l => l.locations || []).find(place => (place.poi || []).some(poi => /monster eye/i.test(poi)));
    if (eyePlace) {
        const poi = eyePlace.poi.find(entry => /monster eye/i.test(entry));
        const eyeLocation = add(idForItem('Monster Eye'), 'Monster Eye', 'location', `Monster Eye: ${eyePlace.name} — ${poi}.`,
            `DB.locations[*].locations[name=${eyePlace.name}].poi`, { scope: 'gratogel', possessionFact: fact('Monster Eye', 'possesses'),
                ...from('balanced', `Monster Eye: ${eyePlace.name} — ${poi}.`, { gentle: { text: overlay.objectives['monster-eye'][0] } }) });
        eyeLocation.minSpoiler = 'gentle';
    }
    for (const [name, groupId, itemId] of [['Pistol', 'toronto-intro', 'pistol'], ['Dreamshield', 'gratogel', 'dreamshield'], ['Monster Eye', 'gratogel', 'monster-eye']]) {
        const acquisition = add(idForItem(name), name, 'acquisition', questHints[groupId][itemId], `QUEST_HINTS.${groupId}.${itemId}`,
            { scope: groupId, possessionFact: fact(name, 'possesses'),
                acquisitionMethods: name === 'Pistol' ? [] : ['buy'],
                completionFact: `albion:completed:${groupId}:${itemId}` });
        // The same authored Gentle and Balanced hints that the objective shows, so "How do I get X?" is not a dead end.
        acquisition.minSpoiler = 'gentle';
        acquisition.variants.gentle = { text: overlay.objectives[itemId][0],
            source: { file: 'guides/data/assistant/albion.json', locator: `objectives.${itemId}[0]`, review: 'authored-from-guide' } };
        acquisition.variants.balanced = { text: overlay.objectives[itemId][1],
            source: { file: 'guides/data/assistant/albion.json', locator: `objectives.${itemId}[1]`, review: 'authored-from-guide' } };
    }
    DB.characters.forEach((person, index) => {
        const entityId = `albion:character:${slug(person.name)}`;
        const options = { partyFact: fact(person.name, 'party'), acquisitionMethods: ['recruit'] };
        add(entityId, person.name, 'acquisition', `Recruitment: ${person.joinLocation}.`, `DB.characters[${index}].joinLocation`, options);
        add(entityId, person.name, 'location', `Recruitment location: ${person.joinLocation}. This does not establish current party membership.`,
            `DB.characters[${index}].joinLocation`, options);
        // Owner-chosen Ultima V-style tiering: race and role are Gentle and Balanced;
        // the notes mention departures and requirements, so they are Direct only.
        // Every character's lower-tier answer carries the same note line.
        const lowerTier = { text: `${person.race}. ${person.role}. The guide's notes on this character appear when the help level is Full answer.` };
        add(entityId, person.name, 'explanation', `${person.race}. ${person.role}.`, `DB.characters[${index}].role/notes`,
            { ...options, minSpoiler: 'gentle', variants: { gentle: { ...lowerTier }, balanced: { ...lowerTier },
                direct: { text: `${person.race}. ${person.role}. ${person.notes || ''}`.trim() } } });
        // The guide's character notes ("REQUIRED for Kenget Kamulos", "Leaves
        // mid-game") are the recruitment advice it gives.
        Object.assign(records.at(-1), { answers: ['advice'], source: { ...records.at(-1).source, index: { file: 'guides/js/assistant/adapters/albion.js', locator: 'character notes answer recruitment advice', review: 'authored-index' } } });
        // "Can Khunag leave the party?": the guide's can-leave flag, with its notes at Direct.
        if (yesNo(person.canLeave)) add(entityId, person.name, 'hint', `${person.name}: Can leave the party: ${yesNo(person.canLeave)}.`,
            `DB.characters[${index}].canLeave`, { ...options, id: `${entityId}:party`, minSpoiler: 'balanced', variants: {
                balanced: { text: `${person.name}: Can leave the party: ${yesNo(person.canLeave)}.` },
                direct: { text: `${person.name}: Can leave the party: ${yesNo(person.canLeave)}. ${person.notes || ''}`.trim() } } });
        add(entityId, person.name, 'combat', `Strengths: ${person.strengths.join('; ')}. Limits: ${person.weaknesses.join('; ')}.`,
            `DB.characters[${index}].strengths/weaknesses`, options);
        const stats = Object.entries(person.stats || {}).map(([key, value]) => `${STAT_NAMES[key] || key} ${value.base}/${value.max}`);
        const caps = person.combatCaps ? `Combat caps: close ${person.combatCaps.close}, long ${person.combatCaps.long}, critical ${person.combatCaps.crit}.` : '';
        const facts = [stats.length ? `${person.name} stats (base/max): ${stats.join(', ')}.` : '', caps,
            `Magic school: ${person.magicSchool || 'none'}.`,
            yesNo(person.canUseGuns) ? `Can use firearms (guns): ${yesNo(person.canUseGuns)}.` : '',
            yesNo(person.canLeave) ? `Can leave the party: ${yesNo(person.canLeave)}.` : '',
            person.origin ? `Origin: ${person.origin}.` : ''].filter(Boolean).join(' ');
        add(entityId, person.name, 'stats', facts, `DB.characters[${index}].stats/combatCaps/magicSchool`,
            { ...options, minSpoiler: 'balanced', variants: { balanced: { text: facts } } });
    });
    // Creatures and their strategy notes are Balanced (the walkthrough's own chapter summaries are too).
    DB.bestiary.forEach((beast, index) => {
        const entityId = `albion:enemy:${slug(beast.name)}`;
        const combat = `${beast.strategy}${beast.hp ? ` HP: ${beast.hp}.` : ''}${beast.danger ? ` Danger: ${beast.danger}.` : ''}${beast.type ? ` Type: ${beast.type}.` : ''}${beast.exp ? ` EXP: ${beast.exp}.` : ''}`;
        add(entityId, beast.name, 'combat', combat, `DB.bestiary[${index}]`, { scope: beast.chapterId, ...from('balanced', combat) });
        const numbers = [beast.hp ? `HP: ${beast.hp}.` : '', beast.exp ? `EXP: ${beast.exp}.` : ''].filter(Boolean).join(' ');
        if (numbers) add(entityId, beast.name, 'stats', `${beast.name} stats: ${numbers}`, `DB.bestiary[${index}].hp/exp`,
            { scope: beast.chapterId, ...from('balanced', `${beast.name} stats: ${numbers}`) });
        const about = [beast.type ? `Type: ${beast.type}.` : '', beast.danger ? `Danger: ${beast.danger}.` : ''].filter(Boolean).join(' ');
        if (about) add(entityId, beast.name, 'explanation', `${beast.name}: ${about}`, `DB.bestiary[${index}].type/danger`,
            { scope: beast.chapterId, ...from('balanced', `${beast.name}: ${about}`) });
    });
    // Each key spell: what it does (Gentle, as before), what it costs and who teaches it.
    DB.magic.forEach((school, si) => school.keySpells.forEach((spell, index) => {
        const entityId = `albion:spell:${slug(spell.name)}`;
        const effect = `${spell.effect}. Cost: ${spell.sp} SP. Reagent: ${school.reagent}.`;
        add(entityId, spell.name, 'use', effect, `DB.magic[${si}].keySpells[${index}]`, { minSpoiler: 'gentle', variants: { gentle: { text: effect } } });
        const level = spell.level ? ` Spell level ${spell.level}.` : '';
        const learn = `Learn ${spell.name} in ${school.school} magic (practitioner ${school.practitioner}).${level} Cost: ${spell.sp} SP. Training: ${school.freeTraining}. ${school.routeHint}`;
        alsoAnswers(add(entityId, spell.name, 'acquisition', learn, `DB.magic[${si}].keySpells[${index}]; DB.magic[${si}].freeTraining/routeHint`,
            { minSpoiler: 'gentle', variants: { gentle: { text: learn } } }), ['location', 'hint'], 'spell teacher answers where-to-learn-it');
        add(entityId, spell.name, 'stats', `${spell.name}:${level} Cost: ${spell.sp} SP.`, `DB.magic[${si}].keySpells[${index}].level/sp`,
            { minSpoiler: 'gentle', variants: { gentle: { text: `${spell.name}:${level} Cost: ${spell.sp} SP.` } } });
        add(entityId, spell.name, 'explanation', `${spell.name}: ${spell.effect}. ${school.school} magic.`, `DB.magic[${si}].keySpells[${index}]`,
            { minSpoiler: 'gentle', variants: { gentle: { text: `${spell.name}: ${spell.effect}. ${school.school} magic.` } } });
    }));
    // Places, with the points of interest the guide lists for them (Balanced, like the chapter summaries).
    DB.locations.forEach((location, li) => {
        const about = `${location.description}${location.poi?.length ? ` Points of interest: ${location.poi.join('; ')}.` : ''}`;
        add(`albion:location:${slug(location.name)}`, location.name, 'explanation', about, `DB.locations[${li}]`, from('balanced', about));
        (location.locations || []).forEach((place, pi) => {
            const entityId = `albion:location:${slug(place.name)}`;
            const where = `${place.name} is on ${location.name}.`;
            add(entityId, place.name, 'location', where, `DB.locations[${li}].locations[${pi}]`, { locationFact: fact(place.name, 'at'), ...from('balanced', where) });
            const inside = `${place.name} (${place.type}) on ${location.name}.${place.poi?.length ? ` Points of interest: ${place.poi.join('; ')}.` : ''}`;
            const detail = add(entityId, place.name, 'explanation', inside, `DB.locations[${li}].locations[${pi}]`, from('balanced', inside));
            // "What stats does the Former's Building give?": the guide lists the bonuses as points of interest.
            if ((place.poi || []).some(entry => /\+\d/.test(entry))) alsoAnswers(detail, ['stats', 'use'], 'place bonuses answer stat questions');
        });
    });
    const com = add('albion:access:com', 'COM access', 'explanation', questHints['toronto-intro']['com-code'],
        'QUEST_HINTS.toronto-intro.com-code', { scope: 'toronto-intro', minSpoiler: 'gentle' });
    com.variants.gentle = { text: overlay.objectives['com-code'][0] };
    com.variants.balanced = { text: overlay.objectives['com-code'][1] };
    alsoAnswers(com, ['use'], 'COM access text answers what-to-do-with-the-code questions');
    add('albion:location:kenget-kamulos', 'Kenget Kamulos', 'prerequisites',
        questHints['kenget-kamulos']['khunag-required'], 'QUEST_HINTS.kenget-kamulos.khunag-required; DB.chapters.requiredMember', {
            scope: 'kenget-kamulos', minSpoiler: 'balanced', requires: overlay.verification['kenget-entry'].requires,
            source: { ...source('QUEST_HINTS.kenget-kamulos.khunag-required; DB.chapters.requiredMember'),
                review: overlay.verification['kenget-entry'].review,
                references: overlay.verification['kenget-entry'].references,
                checkedAt: overlay.verification['kenget-entry'].checkedAt },
            variants: { balanced: { text: overlay.objectives['khunag-required'][1],
                source: { file: 'guides/data/assistant/albion.json', locator: 'objectives.khunag-required[1]', review: 'authored-from-guide' } },
                direct: { text: questHints['kenget-kamulos']['khunag-required'],
                diagnostics: [{ symptom: 'If entry still fails with Khunag present:', check: 'Confirm he is currently in the active party, not merely recruited earlier.',
                    recovery: 'The modeled requirement does not explain other failures; no bug workaround is established here.' }] } }
        });
    add('albion:npc:anne', 'Anne', 'acquisition', questHints['toronto-intro']['anne-rations'],
        'QUEST_HINTS.toronto-intro.anne-rations', { scope: 'toronto-intro' });
    add('albion:npc:beegle', 'Inspector Beegle', 'location',
        'The northern crew cabin on Toronto. Search the left cupboard and north cabinet for supplies.',
        'DB.chapters[0].atlasStops[2]', {
            scope: 'toronto-intro', variants: { direct: {
                text: 'The northern crew cabin on Toronto. Search the left cupboard and north cabinet for supplies.',
                actions: [{ id: 'albion:map:beegle', label: 'Show the cabin on the atlas', minSpoiler: 'direct' }]
            } }
        });
    add('albion:route:toronto', 'Toronto route', 'location', questHints.umajo['find-path'],
        'QUEST_HINTS.umajo.find-path', { scope: 'umajo' });
    // Chapters and the four acts: what happens, key items and stops. Balanced,
    // like the walkthrough summaries they come from.
    DB.chapters.forEach((chapter, index) => {
        const name = chapter.title.split(' — ')[0];
        const items = chapter.keyItems?.length ? ` Key items: ${chapter.keyItems.join(', ')}.` : '';
        const stops = chapter.atlasStops?.length ? ` Stops: ${chapter.atlasStops.map(stop => `${stop.label} (${stop.note})`).join('; ')}.` : '';
        const text = `${chapter.title} (${chapter.subtitle}): ${chapter.summary}${items}${stops}`;
        add(`albion:chapter:${chapter.id}`, chapter.title, 'explanation', text, `DB.chapters[${index}]`,
            { scope: chapter.id, aliases: [chapter.title, `${name} chapter`, `chapter ${index + 1}`, ORDINALS[index] && `${ORDINALS[index]} chapter`, index === DB.chapters.length - 1 && 'last chapter'].filter(Boolean), minSpoiler: 'balanced', variants: { balanced: { text } } });
        // "What do I do in chapter 3?" is answered by the chapter's own summary of what happens and where to go.
        Object.assign(records.at(-1), { answers: ['hint'], source: { ...records.at(-1).source, index: { file: 'guides/js/assistant/adapters/albion.js', locator: 'chapter summary answers what-to-do questions', review: 'authored-index' } } });
    });
    const roman = { I: 1, II: 2, III: 3, IV: 4 };
    movements.forEach((movement, index) => {
        const chapters = movement.chapters.map(id => DB.chapters.find(chapter => chapter.id === id)?.title).filter(Boolean);
        const text = `Act ${movement.number}, ${movement.title}: ${movement.summary} Chapters: ${chapters.join('; ')}.`;
        add(`albion:act:${roman[movement.number] || index + 1}`, `Act ${movement.number}: ${movement.title}`, 'explanation', text,
            `ALBION_CAMPAIGN_MOVEMENTS[${index}]`, { aliases: [`act ${movement.number}`, `act ${roman[movement.number] || index + 1}`, movement.title],
                minSpoiler: 'balanced', variants: { balanced: { text } } });
    });
    records.push(...buildTopicRecords('albion', (overlay.topics || []).map(topic => ({ ...topic, overlayFile: 'guides/data/assistant/albion.json' })),
        albionFacts({ DB, tradeHints })));
    const narrativeFacts = albionNarrativeFacts({ DB, questHints });
    const narrativeDefinitions = (overlay.narratives || []).map(definition => ({ ...definition, overlayFile: 'guides/data/assistant/albion.json' }));
    records.push(...buildNarrativeRecords('albion', narrativeDefinitions, narrativeFacts));
    records.push(...buildResearchRecords('albion', overlay.research, 'guides/data/assistant/albion.json'));
    // Built last so names already used by characters, topics or research are
    // not duplicated. Named NPCs from the atlas extracted from the game files: which maps they
    // appear on and how they move. Their extracted race/class profiles are
    // unreliable (almost all read "Terran/Pilot") and are not used.
    if (atlas?.maps) {
        const known = new Set(records.flatMap(record => [record.title, ...(record.aliases || [])]).map(name => String(name).toLowerCase()));
        const npcs = new Map();
        atlas.maps.filter(map => !map.development).forEach(map => (map.npcs || []).forEach(npc => {
            if (!npc.name || known.has(npc.name.toLowerCase())) return;
            const entry = npcs.get(npc.name) || { maps: new Set(), movement: new Set(), ids: [] };
            entry.maps.add(map.name); if (npc.movement) entry.movement.add(npc.movement.toLowerCase()); entry.ids.push(npc.id);
            npcs.set(npc.name, entry);
        }));
        for (const [name, entry] of npcs) {
            const text = `${name} appears on: ${[...entry.maps].join(', ')}${entry.movement.size ? ` (${[...entry.movement].join(', ')})` : ''}.`;
            records.push({ id: `albion:npc:${slug(name)}:location`, entityId: `albion:npc:${slug(name)}`, title: name, aliases: [name],
                kind: 'npc', relation: 'location', scope: 'reference', requires: null, editions: ['1995', 'pc'], minSpoiler: 'balanced',
                variants: { balanced: { text } },
                source: { file: 'guides/js/AlbionAtlasData.js', locator: `ALBION_ATLAS_CONFIG.maps[*].npcs[id=${entry.ids.slice(0, 3).join(',')}${entry.ids.length > 3 ? ',…' : ''}]`, review: 'extracted' } });
        }
    }
    return records;
}
export async function createAlbionAssistant({ DB, questLog, questHints, tradeHints = [], movements = [], atlas = null, getQuestState }) {
    const response = await fetch(new URL('../../../data/assistant/albion.json', import.meta.url));
    if (!response.ok) throw new Error('Local Albion knowledge could not be loaded.');
    const overlay = await response.json();
    return createGuideAssistant({ gameId: 'albion', records: buildAlbionRecords({ DB, questLog, questHints, tradeHints, movements, atlas, overlay }),
        getProgress: () => importAlbionProgress(questLog, getQuestState()) });
}
