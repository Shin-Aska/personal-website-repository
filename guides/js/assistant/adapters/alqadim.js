import { createAssistant } from '../engine.js';
import { buildNarrativeRecords, buildResearchRecords, buildTopicRecords, factMap } from '../topics.js';

const slug = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const source = locator => ({ file: 'guides/js/AlQadim.js', locator, review: 'extracted' });
const ADAPTER = 'guides/js/assistant/adapters/alqadim.js';
// A description field also answers "what is it?"; declared here, never inferred by the engine.
const alsoAnswers = (record, answers, locator) => Object.assign(record, { answers, source: { ...record.source, index: { file: ADAPTER, locator, review: 'authored-index' } } });
export const alqadimChapterId = id => `alqadim:chapter:${id}`;

export function importAlQadimProgress(data, values) {
    values = values && typeof values === 'object' && !Array.isArray(values) ? values : {};
    return (data.chapters || []).flatMap(chapter => [...chapter.required, ...chapter.optional]
        .filter(objective => values[objective.id] === true)
        .map(objective => ({ id: `alqadim:objective:${objective.id}:completed`, value: true, temporal: 'historical', source: { file: 'localStorage:alqadim.questState.v1', locator: objective.id, review: 'player-checklist-report' } })));
}

export function buildAlQadimRecords(data, overlay, chapterRoutes = {}, atlas = null) {
    const records = [];
    const add = (entityId, title, relation, text, locator, minSpoiler = 'gentle', aliases = [], answers = null) => {
        records.push({ id: `${entityId}:${relation}`, entityId, title, aliases, ...(relation === 'acquisition' && locator.startsWith('DB.shops[') && !/Exchange/.test(title) ? { acquisitionMethods: ['buy'] } : {}), kind: entityId.split(':')[1], relation, scope: 'alqadim', minSpoiler, variants: { [minSpoiler]: { text } }, source: source(locator), requires: null });
        if (answers) alsoAnswers(records.at(-1), answers, `${relation} record also answers ${answers.join(', ')}`);
    };
    (data.chapters || []).forEach((chapter, index) => {
        const entityId = alqadimChapterId(chapter.id);
        const authored = overlay.chapters[String(chapter.id)];
        if (!authored) return;
        const objectives = [...chapter.required, ...chapter.optional];
        const safeObjectives = objectives.filter(objective => !overlay.excludedObjectives.includes(objective.id));
        const direct = safeObjectives.map(objective => `${chapter.optional.includes(objective) ? 'Optional: ' : ''}${objective.text}`).join('\n');
        const note = safeObjectives.length !== objectives.length ? '\nSome objective details are withheld because the guide sources conflict; their order is not a prerequisite rule.' : '\nChecklist order is not a modeled prerequisite.';
        const hintSource = { file: 'guides/data/assistant/alqadim.json', locator: `chapters[${chapter.id}]`, review: 'authored-from-extracted-guide' };
        records.push({ id: `${entityId}:hint`, entityId, title: `Chapter ${chapter.id}`, aliases: [`chapter ${chapter.id}`], kind: 'chapter', relation: 'hint', scope: entityId, variants: { gentle: { text: authored.gentle, title: `Chapter ${chapter.id}`, aliases: [`chapter ${chapter.id}`], source: hintSource }, balanced: { text: authored.balanced, title: `Chapter ${chapter.id}`, aliases: [`chapter ${chapter.id}`], source: hintSource }, direct: { text: direct + note, title: chapter.title, aliases: [chapter.title, `chapter ${chapter.id}`, ...(overlay.chapterAliases?.[String(chapter.id)] || [])], actions: (chapterRoutes[String(chapter.id)] || []).map((worldId, i) => ({ id: `chapter-map:${worldId}`, label: `Open chapter map ${i + 1} (full detail)`, minSpoiler: 'direct' })) } }, source: source(`DB.chapters[${index}]`), requires: null });
        // Required then optional matches the page's checkbox order. Retain
        // withheld objectives as references so selection cannot skip over one.
        records.at(-1).checklist = objectives.map(objective => ({
            recordId: `alqadim:objective:${objective.id}:hint`,
            completionFact: `alqadim:objective:${objective.id}:completed`
        }));
        // The chapter summary describes its events: Balanced, under the
        // chapter's safe title until Direct.
        if (chapter.summary) records.push({ id: `${entityId}:explanation`, entityId, title: `Chapter ${chapter.id}`, aliases: [`chapter ${chapter.id}`],
            kind: 'chapter', relation: 'explanation', scope: entityId, minSpoiler: 'balanced', requires: null,
            variants: { balanced: { text: chapter.summary, title: `Chapter ${chapter.id}`, aliases: [`chapter ${chapter.id}`] },
                direct: { text: chapter.summary, title: chapter.title, aliases: [chapter.title, `chapter ${chapter.id}`] } },
            source: source(`DB.chapters[${index}].summary`) });
        for (const objective of safeObjectives) {
            records.push({ id: `alqadim:objective:${objective.id}:hint`, entityId: `alqadim:objective:${objective.id}`, title: objective.text, aliases: [objective.id], kind: 'objective', relation: 'hint', scope: `alqadim:objective:${objective.id}`, minSpoiler: 'direct', variants: { direct: { text: objective.text } }, source: source(`DB.chapters[${index}].${chapter.required.includes(objective) ? 'required' : 'optional'}[id=${objective.id}]`), requires: null, completionFact: `alqadim:objective:${objective.id}:completed` });
        }
    });
    (data.keyItems || []).forEach((item, i) => {
        if (overlay.blockedItems.includes(item.name)) return;
        const entityId = `alqadim:item:${slug(item.name)}`;
        const aliases = overlay.aliases[`item:${slug(item.name)}`] || [];
        add(entityId, item.name, 'location', `${item.name}: ${item.location}.`, `DB.keyItems[${i}].location`, 'direct', aliases);
        add(entityId, item.name, 'use', `${item.name}: ${item.description}`, `DB.keyItems[${i}].description`, 'direct', aliases, ['explanation']);
    });
    // Explicit acquisition relationships come from named objectives, never
    // from treating a location field as a complete acquisition procedure.
    for (const [name, chapterId, objectiveId] of [
        ['Family Sword of Honor', 2, 'ch2_1'], ['Purple Berries', 3, 'ch3_3'],
        ['Ship Orb', 4, 'ch4_5'], ['Key of Bone', 11, 'ch11_4'],
        ["Vizier's Journal", 14, 'ch14_3'], ['Bottle of Eternal Emptiness', 10, 'ch10_1']
    ]) {
        const index = data.chapters.findIndex(chapter => chapter.id === chapterId);
        const objective = data.chapters[index]?.required.find(item => item.id === objectiveId);
        if (objective) add(`alqadim:item:${slug(name)}`, name, 'acquisition', objective.text,
            `DB.chapters[${index}].required[id=${objectiveId}]`, 'direct', overlay.aliases[`item:${slug(name)}`] || []);
    }
    for (const name of overlay.blockedItems) {
        for (const relation of ['location', 'acquisition', 'use']) {
            records.push({ id: `alqadim:conflict:${slug(name)}:${relation}`, entityId: `alqadim:conflict:${slug(name)}`,
                title: name, aliases: [], kind: 'item', relation, scope: 'alqadim', minSpoiler: 'direct',
                variants: { direct: { text: 'The guide sources disagree on this subject.' } }, conflict: true,
                source: { file: 'guides/data/assistant/alqadim.json', locator: 'conflicts', review: 'conflicting' }, requires: null });
        }
    }
    (data.combatMoves || []).forEach((move, i) => {
        const entityId = `alqadim:combat:${slug(move.name)}`;
        add(entityId, move.name, 'combat', `${move.effect} ${move.control}. ${move.training}.`, `DB.combatMoves[${i}]`, 'gentle', overlay.aliases[`combat:${slug(move.name)}`] || []);
        add(entityId, move.name, 'use', `${move.effect} ${move.control}.`, `DB.combatMoves[${i}]`, 'gentle', [], ['explanation']);
        // "How do I learn the wide swing?": the training field is the acquisition fact; it also says who teaches it.
        add(entityId, move.name, 'acquisition', `${move.name}: ${move.training}.`, `DB.combatMoves[${i}].training`, 'gentle', [], /Zubakon/.test(move.training) ? ['location'] : null);
    });
    (data.moonstoneShards || []).forEach((shard, i) => {
        const entityId = `alqadim:shard:${slug(shard.name)}`;
        add(entityId, shard.name, 'use', `${shard.effect} Range: ${shard.range}. Damage: ${shard.damage}.`, `DB.moonstoneShards[${i}]`, 'gentle', overlay.aliases[`shard:${slug(shard.name)}`] || [], ['explanation']);
    });
    (data.bestiary || []).forEach((creature, i) => {
        const entityId = `alqadim:bestiary:${slug(creature.name)}`;
        // Idrid's Veil effect/identity conflicts with another field; do not
        // promote the Nameless One strategy into a reliable combat answer.
        // The location is not in dispute, and a conflict record lets the
        // assistant say so instead of claiming it never heard of the creature.
        if (creature.name === 'Nameless One (Mage)') {
            add(entityId, creature.name, 'location', `${creature.name}: ${creature.location}.`, `DB.bestiary[${i}].location`, 'direct', overlay.aliases[`bestiary:${slug(creature.name)}`] || []);
            records.push({ id: `alqadim:conflict:nameless-one-mage:combat`, entityId, title: creature.name, aliases: [], kind: 'bestiary', relation: 'combat', scope: 'alqadim',
                minSpoiler: 'direct', variants: { direct: { text: 'The guide sources disagree on this subject.' } }, conflict: true,
                source: { file: 'guides/data/assistant/alqadim.json', locator: 'conflicts.veil-name', review: 'conflicting' }, requires: null });
            return;
        }
        add(entityId, creature.name, 'combat', `${creature.name}: ${creature.name === 'Thorn Bush' ? 'Hit between volleys.' : creature.strategy}${creature.danger ? ` Danger: ${creature.danger}.` : ''}`, `DB.bestiary[${i}].strategy/danger`, 'balanced', overlay.aliases[`bestiary:${slug(creature.name)}`] || [], ['explanation']);
        add(entityId, creature.name, 'location', `${creature.name}: ${creature.location}.`, `DB.bestiary[${i}].location`, 'direct', overlay.aliases[`bestiary:${slug(creature.name)}`] || []);
    });
    (data.shops || []).forEach((shop, i) => {
        add(`alqadim:shop:${slug(shop.name)}`, shop.name, 'location', `${shop.name}: ${shop.location}.`, `DB.shops[${i}].location`, 'balanced', overlay.aliases[`shop:${slug(shop.name)}`] || []);
        const stock = shop.inventory.filter(item => !overlay.blockedItems.includes(item.item) && item.item !== 'Key of Bone');
        // "What does the Emporium sell?": the shop's own inventory list, minus the withheld items.
        if (stock.length) add(`alqadim:shop:${slug(shop.name)}`, shop.name, 'acquisition', `${shop.name} stock: ${stock.map(item => `${item.item} (${item.cost})`).join('; ')}.`, `DB.shops[${i}].inventory`, 'balanced', overlay.aliases[`shop:${slug(shop.name)}`] || [], ['explanation']);
        stock.forEach(item => {
            const entityId = `alqadim:shop-item:${slug(item.item)}`;
            const itemAliases = overlay.aliases[`shop-item:${slug(item.item)}`] || [];
            add(entityId, item.item, 'acquisition', `${shop.name}, ${shop.location}: ${item.cost}.`, `DB.shops[${i}].inventory[item=${JSON.stringify(item.item)}]`, 'balanced', itemAliases);
            add(entityId, item.item, 'use', item.description, `DB.shops[${i}].inventory[item=${JSON.stringify(item.item)}].description`, 'balanced', itemAliases, ['explanation']);
        });
    });
    // Overlay topics index guide text verbatim: safe objectives, plus page
    // passages that are not in DB (the overlay lists each with its locator).
    const facts = [];
    (data.chapters || []).forEach((chapter, index) => {
        if (chapter.summary) facts.push([`chapter-summary:${chapter.id}`, chapter.summary, source(`DB.chapters[${index}].summary`)]);
        [...chapter.required, ...chapter.optional]
            .filter(objective => !overlay.excludedObjectives.includes(objective.id))
            .forEach(objective => facts.push([`obj:${objective.id}`, objective.text, source(`DB.chapters[${index}].${chapter.required.includes(objective) ? 'required' : 'optional'}[id=${objective.id}]`)]));
    });
    (overlay.pageFacts || []).forEach(fact => facts.push([`pf:${fact.id}`, fact.text, { file: 'guides/AlQadim.html', locator: fact.locator, review: 'extracted' }]));
    // Reviewed identity phrases inside quest text. Extract the stated role,
    // keeping the original spoiler ceiling and source; directions are context.
    const family = data.chapters.find(chapter => chapter.id === 2)?.required.find(o => o.id === 'ch2_2');
    const prison = data.chapters.find(chapter => chapter.id === 16);
    if (family?.text.includes('Mother (Jessamin)')) facts.push(['identity:jessamin', 'Mother (Jessamin)',
        source('DB.chapters[id=2].required[id=ch2_2].text (identity phrase)'), { minSpoiler: 'direct' }]);
    if (prison?.summary.includes('your brother Tarik')) facts.push(['identity:tarik', 'your brother Tarik',
        source('DB.chapters[id=16].summary (identity phrase)'), { minSpoiler: 'direct' }]);
    for (const [id, chapterId, objectiveId, phrase] of [
        ['kara', 19, 'ch19_2', 'the rogue genie Kara'],
        ['pangar', 12, 'ch12_4', 'the cyclops Pangar-Bek']
    ]) {
        const objective = data.chapters.find(chapter => chapter.id === chapterId)?.required.find(o => o.id === objectiveId);
        if (objective?.text.includes(phrase)) facts.push([`identity:${id}`, phrase,
            source(`DB.chapters[id=${chapterId}].required[id=${objectiveId}].text (identity phrase)`), { minSpoiler: 'direct' }]);
    }
    const factIndex = factMap(facts);
    records.push(...buildTopicRecords('alqadim', (overlay.topics || []).map(topic => ({ ...topic, overlayFile: 'guides/data/assistant/alqadim.json' })), factIndex));
    records.push(...buildNarrativeRecords('alqadim', (overlay.narratives || []).map(definition => ({ ...definition, overlayFile: 'guides/data/assistant/alqadim.json' })), factIndex));
    records.push(...buildResearchRecords('alqadim', overlay.research, 'guides/data/assistant/alqadim.json'));
    // Characters placed in the atlas worlds, limited to the overlay allowlist.
    const actorName = name => String(name).replace(/_/g, ' ').replace(/\s*[*<>]\s*$/, '').replace(/\s+[A-Z]$/, '').replace(/\d+$/, '').trim().toLowerCase();
    for (const [name, aliases] of Object.entries(overlay.actors || {})) {
        const worlds = [], locators = [];
        (atlas?.worlds || []).forEach((world, w) => (world.namedActors || []).forEach(actor => {
            if (actorName(actor.name) !== name.toLowerCase()) return;
            if (!worlds.includes(world.title)) worlds.push(world.title);
            locators.push(`worlds[${w}].namedActors[id=${actor.id}]`);
        }));
        if (!worlds.length) continue;
        const entityId = `alqadim:npc:${slug(name)}`;
        records.push({ id: `${entityId}:location`, entityId, title: name, aliases: [name, ...aliases], kind: 'npc', relation: 'location', scope: 'alqadim',
            minSpoiler: 'direct', requires: null, variants: { direct: { text: `${name} appears in: ${worlds.join('; ')}.` } },
            source: { file: 'guides/js/AlQadimAtlasData.js', locator: `ALQADIM_ATLAS_DATA.${locators.slice(0, 4).join(', ')}${locators.length > 4 ? ', …' : ''}`, review: 'extracted' } });
    }
    const acquisitionObjectives = {
        'Family Sword of Honor': 'ch2_1', 'Purple Berries': 'ch3_3',
        'Ship Orb': 'ch4_5', 'Key of Bone': 'ch11_4', "Vizier's Journal": 'ch14_3', 'Bottle of Eternal Emptiness': 'ch10_1'
    };
    for (const record of records) {
        if (['item', 'shop-item'].includes(record.kind) && !record.conflict) {
            // One canonical predicate per item even when shop and item records
            // describe different relationships. Historical acquisition never
            // implies current possession.
            const itemId = `alqadim:item:${slug(record.title)}`;
            record.possessionFact = `${itemId}:possessed`;
            record.acquisitionFact = acquisitionObjectives[record.title]
                ? `alqadim:objective:${acquisitionObjectives[record.title]}:completed`
                : `${itemId}:acquired`;
        }
    }
    return records;
}

export async function createAlQadimAssistant({ data, getQuestState, chapterRoutes = {}, atlas = null }) {
    const response = await fetch(new URL('../../../data/assistant/alqadim.json', import.meta.url));
    if (!response.ok) throw new Error('The local Al-Qadim knowledge file could not be loaded.');
    const overlay = await response.json();
    return createAssistant({ gameId: 'alqadim', records: buildAlQadimRecords(data, overlay, chapterRoutes, atlas), getProgress: () => importAlQadimProgress(data, getQuestState()) });
}
