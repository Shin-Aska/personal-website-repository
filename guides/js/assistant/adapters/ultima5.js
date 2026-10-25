import { createGuideAssistant } from '../guide-assistant.js';
import { buildNarrativeRecords, buildResearchRecords, buildTopicRecords, factMap } from '../topics.js';

const slug = value => String(value || '').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[\s_-]+/g, '-');
const clean = value => String(value || '').replace(/<[^>]*>/g, '').replace(/`/g, '').trim();
const source = locator => ({ file: 'guides/js/Ultima5.js', locator, review: 'extracted' });
const variant = (text, title, aliases = []) => ({ text: clean(text), title, aliases });
// Cache refresh claims conflict within the guide; do not turn either into advice.
const withoutRefreshClaim = text => clean(text).replace(/\s*\(or AN SANCT\)/gi, '').replace(/; leave and return on a later day if you want more\./gi, '.').replace(/Leave and return on another day to replenish the cache\./gi, '').trim();

// The guide's reagent lists for AN TYM disagree (spellData versus the final-descent tip), so the spell table's recipe is not repeated.
const DISPUTED_RECIPE = /^an tym$/i;
const spellText = spell => DISPUTED_RECIPE.test(clean(spell.Name))
    ? `${clean(spell.Name)} (Circle ${spell.Circle} spell): ${spell.Effect}. The guide's reagent lists for this spell disagree.`
    : `${clean(spell.Name)} (Circle ${spell.Circle} spell): ${spell.Effect}. Reagents: ${spell.Reagents}.`;

// Guide facts that overlay topics may index, keyed by stable names.
export function ultima5Facts({ chapters, spells = [], tips = [], words = [], moongates = [], pageFacts = [], companions = [] }) {
    const objectives = chapters.flatMap(chapter => chapter.objectives);
    return factMap([
        ...tips.map((tip, i) => [`tip:${i}`, tip, source(`commonTips[${i}]`),
            // AN SANCT's effect conflicts between this tip and spellData.
            /AN SANCT/i.test(clean(tip)) ? { conflict: true } : {}]),
        ...spells.map(spell => [`spell:${clean(spell.Name)}`, spellText(spell),
            source(`spellData name=${clean(spell.Name)}`), /^an sanct$/i.test(clean(spell.Name)) ? { conflict: true } : {}]),
        ...objectives.map(objective => [`outcome:${objective.id}`, objective.outcome, source(`ultima5GrandQuestChapters objective=${objective.id}.outcome`)]),
        ...objectives.map(objective => [`summary:${objective.id}`, objective.summary, source(`ultima5GrandQuestChapters objective=${objective.id}.summary`)]),
        ...objectives.map(objective => [`title:${objective.id}`, objective.title, source(`ultima5GrandQuestChapters objective=${objective.id}.title`)]),
        ...objectives.filter(objective => /^shadow-/.test(objective.id)).map(objective =>
            [`identity:${objective.id}`, objective.title.replace(/^Banish /, ''), source(`ultima5GrandQuestChapters objective=${objective.id}.title`)]),
        ...objectives.flatMap(objective => objective.steps.map((step, i) => [`step:${objective.id}:${i}`, clean(step), source(`ultima5GrandQuestChapters objective=${objective.id}.steps[${i}]`)])),
        ...chapters.filter(chapter => chapter.summary).map(chapter => [`chapter:${chapter.id}`, chapter.summary, source(`ultima5GrandQuestChapters chapter=${chapter.id}.summary`)]),
        // Page text outside the data arrays (shrine-loop cards, Mantras panel, closing sentence) lives in the overlay's pageFacts.
        ...pageFacts.map(fact => [fact.key, fact.text, fact.source]),
        ...moongates.map((gate, i) => [`moongate:${gate.phase}`, `Moon phase ${gate.phase}: ${gate.destination}.`, source(`moongatePhaseData[${i}]`)]),
        ...words.map((word, i) => [`virtue:${word.Virtue}`, word.Virtue, source(`wordData[${i}]`)]),
        ...companions.map((companion, i) => [`companion:${companion.Name}`, `${companion.Name}: ${companion.Class}, level ${companion.Level}. Strength ${companion.STR}, Intelligence ${companion.INT}, Dexterity ${companion.DEX}. ${companion.Notes}`, source(`companionData[${i}]`)])
    ]);
}

export function buildUltima5Records({ chapters, sideQuests, companions, spells, atlas = {}, overlay, tips = [], words = [], moongates = [] }) {
    const records = [];
    const objectives = chapters.flatMap(chapter => chapter.objectives);
    const byId = new Map(objectives.map(objective => [objective.id, objective]));
    // Extra names a player uses for an objective or side quest. They are part of the Balanced/Direct title only.
    const extraNames = id => overlay.aliases?.[id] || [];
    const authoredIndex = locator => ({ file: 'guides/js/assistant/adapters/ultima5.js', locator, review: 'authored-index' });
    const hintAnswers = id => overlay.hintAnswers?.[id];
    const declareHintAnswers = (record, id) => {
        if (hintAnswers(id)) Object.assign(record, { answers: hintAnswers(id), source: { ...record.source,
            index: { file: 'guides/js/assistant/adapters/ultima5.js', locator: 'quest steps answer how-to questions about the quest subject', review: 'authored-index' } } });
    };
    // "Mystic Arms" on the map and the "Recover the Mystic Arms" quest are one subject, so they are not offered as a choice.
    const questNames = new Map([...objectives.map(entry => [`objective:${entry.id}`, entry]), ...sideQuests.map(entry => [`side:${entry.id}`, entry])]
        .flatMap(([key, entry]) => (overlay.aliases?.[entry.id] || []).map(name => [name.toLowerCase(), { key, entry }])));
    objectives.forEach((objective, index) => {
        const entityId = `ultima5:objective:${objective.id}`;
        const safeTitle = overlay.safeTitles?.[objective.id] || `Campaign objective ${index + 1}`;
        records.push({
            id: `${entityId}:hint`, entityId, title: safeTitle, aliases: [], kind: /^shrine-/.test(objective.id) ? 'shrine' : 'objective', relation: 'hint', scope: 'campaign', requires: null,
            completionFact: `ultima5:completed:${objective.id}`,
            variants: {
                gentle: variant(overlay.gentleHints[objective.id] || 'Review the last instruction and prepare before travelling onward.', safeTitle, overlay.gentleAliases?.[objective.id] || []),
                balanced: variant(objective.summary, objective.title, [objective.title, ...extraNames(objective.id)]),
                direct: variant(objective.steps.map(withoutRefreshClaim).join('\n'), objective.title, [objective.title, ...extraNames(objective.id)])
            }, source: source(`ultima5GrandQuestChapters objective=${objective.id}`),
            variantSources: { gentle: { file: 'guides/data/assistant/ultima5.json', locator: `gentleHints.${objective.id}`, review: 'authored-from-guide' } }
        });
        declareHintAnswers(records.at(-1), objective.id);
    });
    sideQuests.forEach(quest => {
        const entityId = `ultima5:side:${quest.id}`;
        records.push({ id: `${entityId}:hint`, entityId, title: 'Optional quest', aliases: [], kind: 'objective', relation: 'hint', scope: 'side', requires: null,
            completionFact: `ultima5:side-completed:${quest.id}`,
            variants: {
                gentle: variant(overlay.gentleHints[quest.id], 'Optional quest'),
                balanced: variant(`Optional pursuit: ${quest.category}. ${quest.reward}.`, quest.title, [quest.title, ...extraNames(quest.id)]),
                direct: variant(withoutRefreshClaim(quest.detail), quest.title, [quest.title, ...extraNames(quest.id)])
            }, source: source(`ultima5SideQuests id=${quest.id}`) });
        declareHintAnswers(records.at(-1), quest.id);
    });
    function reference(kind, name, relation, text, locator, { level = 'direct', gentle, aliases = [], directAliases = [], answers, why } = {}) {
        const entityId = `ultima5:${kind}:${slug(name)}`;
        const variants = { [level]: { text: clean(text), title: name, aliases: [name, ...aliases, ...(level === 'direct' ? directAliases : [])] } };
        if (gentle) variants.gentle = { text: gentle, title: name, aliases: [name, ...aliases] };
        const record = { id: `${entityId}:${relation}`, entityId, title: name, aliases: [name, ...aliases], kind, relation, scope: 'reference',
            minSpoiler: gentle ? 'gentle' : level, requires: null, variants, source: source(locator) };
        if (kind === 'item') record.possessionFact = `ultima5:possesses:${slug(name)}`;
        if (kind === 'companion') record.partyFact = `ultima5:party:${slug(name)}`;
        // A declared equivalence: the same guide text also answers another question about the same subject.
        if (answers) Object.assign(record, { answers, source: { ...record.source,
            index: { file: 'guides/js/assistant/adapters/ultima5.js', locator: why, review: 'authored-index' } } });
        records.push(record);
        return record;
    }
    const items = [
        { id: 'opening-grapple', name: 'Grapple', aliases: ['Grappling Hook', 'Grappling', 'Hook'], steps: [0, 1, 2] },
        { id: 'opening-hms-cape', name: 'HMS Cape plans', aliases: ['ship plans', 'HMS Cape', 'Cape plans'] },
        { id: 'opening-castle-raid', name: 'Magic Carpet', aliases: ['Carpet', 'Flying Carpet', 'steal the carpet', 'steal the Magic Carpet'], steps: [0, 1, 2, 3], side: 'side-magic-carpet' },
        { id: 'opening-castle-raid', name: 'Sandalwood Box', aliases: ['Sandalwood'], steps: [0, 1, 2, 4] },
        { id: 'regalia-sceptre', name: 'Sceptre', aliases: ['Scepter'] },
        { id: 'regalia-crown', name: 'Crown' },
        { id: 'regalia-amulet', name: 'Amulet', aliases: ["Lord British's Amulet"] }
    ];
    items.forEach(item => {
        const objective = byId.get(item.id);
        if (!objective) return;
        const steps = item.steps ? item.steps.map(index => objective.steps[index]).filter(Boolean) : objective.steps;
        reference('item', item.name, 'acquisition', steps.join('\n'), `ultima5GrandQuestChapters objective=${item.id}.steps`,
            { gentle: overlay.gentleHints[item.id], aliases: item.aliases, directAliases: item.directAliases, answers: ['hint'], why: 'acquisition steps answer hint requests' });
        reference('item', item.name, 'location', objective.location, `ultima5GrandQuestChapters objective=${item.id}.location`, { aliases: item.aliases });
        // Outcome only describes the artifact itself for the three individual regalia objectives.
        // It is the same text the Balanced quest description already shows, so the item shares that tier.
        if (item.id.startsWith('regalia-')) reference('item', item.name, 'use', objective.outcome, `ultima5GrandQuestChapters objective=${item.id}.outcome`,
            { level: 'balanced', answers: ['explanation'], why: 'the artifact outcome says what the artifact is' });
        // The raid's closing step says what the Box is kept for.
        if (item.name === 'Sandalwood Box' && objective.steps[5]) reference('item', item.name, 'use', objective.steps[5], `ultima5GrandQuestChapters objective=${item.id}.steps[5]`, { aliases: item.aliases });
        // A side quest's reward line says what the item is for.
        const quest = item.side && sideQuests.find(entry => entry.id === item.side);
        if (quest?.reward) reference('item', item.name, 'use', `${quest.title} (${quest.category}) reward: ${quest.reward}.`, `ultima5SideQuests id=${quest.id}.reward`,
            { level: 'balanced', aliases: item.aliases, answers: ['explanation'], why: 'side quest reward says what the item is for' });
    });
    const keys = sideQuests.find(quest => quest.id === 'side-skull-keys');
    if (keys) {
        reference('item', 'Skull Keys', 'acquisition', withoutRefreshClaim(keys.detail), 'ultima5SideQuests id=side-skull-keys.detail',
            { gentle: overlay.gentleHints[keys.id], aliases: ['Skull Key'], answers: ['hint'], why: 'acquisition steps answer hint requests' });
        reference('item', 'Skull Keys', 'location', keys.location, 'ultima5SideQuests id=side-skull-keys.location', { aliases: ['Skull Key'] });
        reference('item', 'Skull Keys', 'use', `${keys.title} (${keys.category}) reward: ${keys.reward}.`, 'ultima5SideQuests id=side-skull-keys.reward',
            { level: 'balanced', aliases: ['Skull Key'], answers: ['explanation'], why: 'side quest reward says what the item is for' });
    }
    // Each objective's location (Direct) and outcome (Balanced), under the
    // same titles as its hint: safe labels never become real names early.
    objectives.forEach(objective => {
        const entityId = `ultima5:objective:${objective.id}`;
        const names = [objective.title];
        const named = text => ({ text: clean(text), title: objective.title, aliases: names });
        const mapped = (atlas.markers || []).some(marker => questNames.get(String(marker.name).toLowerCase())?.entry === objective);
        if (objective.location && !mapped) records.push({ id: `${entityId}:location`, entityId, title: objective.title, aliases: names, kind: 'objective',
            relation: 'location', scope: 'campaign', minSpoiler: 'direct', requires: null, variants: { direct: named(objective.location) },
            source: source(`ultima5GrandQuestChapters objective=${objective.id}.location`) });
        if (objective.outcome) records.push({ id: `${entityId}:explanation`, entityId, title: objective.title, aliases: names, kind: 'objective',
            relation: 'explanation', scope: 'campaign', minSpoiler: 'balanced', requires: null,
            variants: { balanced: named(objective.outcome), direct: named(objective.outcome) },
            source: source(`ultima5GrandQuestChapters objective=${objective.id}.outcome`) });
    });
    sideQuests.forEach(quest => {
        const entityId = `ultima5:side:${quest.id}`;
        const names = [quest.title, ...extraNames(quest.id)];
        const named = text => ({ text: clean(text), title: quest.title, aliases: names });
        const mapped = (atlas.markers || []).some(marker => questNames.get(String(marker.name).toLowerCase())?.entry === quest);
        if (quest.location && !mapped) records.push({ id: `${entityId}:location`, entityId, title: quest.title, aliases: names, kind: 'objective',
            relation: 'location', scope: 'side', minSpoiler: 'direct', requires: null, variants: { direct: named(`${quest.title}: ${quest.location}.`) },
            source: source(`ultima5SideQuests id=${quest.id}.location`) });
        if (quest.reward) records.push({ id: `${entityId}:explanation`, entityId, title: quest.title, aliases: names, kind: 'objective',
            relation: 'explanation', scope: 'side', minSpoiler: 'balanced', requires: null,
            variants: { balanced: named(`${quest.title} (${quest.category}) reward: ${quest.reward}.`), direct: named(`${quest.title} (${quest.category}) reward: ${quest.reward}.`) },
            source: source(`ultima5SideQuests id=${quest.id}.reward`) });
    });
    // Companions: class, level and attributes are Gentle; where to recruit is
    // Balanced; the guide's notes (one reveals a betrayal) are Direct. Every
    // companion's lower-tier answer says the same, so none stands out.
    companions.forEach((companion, index) => {
        reference('companion', companion.Name, 'stats',
            `${companion.Name}: ${companion.Class}, level ${companion.Level}. Strength ${companion.STR}, Intelligence ${companion.INT}, Dexterity ${companion.DEX}.`,
            `companionData[${index}]`, { level: 'gentle' });
        reference('companion', companion.Name, 'location', companion.Location === 'Start' ? 'This companion is listed in the starting party.' : companion.Location,
            `companionData[${index}].Location`, { level: 'balanced' });
        reference('companion', companion.Name, 'explanation', `${companion.Class}. ${companion.Notes}`, `companionData[${index}]`, {
            gentle: `${companion.Name}: ${companion.Class}, level ${companion.Level}. The guide's notes on this companion appear when the help level is Full answer.` });
        // The guide's companion notes are recruitment advice ("Do not recruit",
        // "An essential early recruit"), so they also answer "should I recruit…?".
        Object.assign(records.at(-1), { answers: ['advice'], source: { ...records.at(-1).source,
            index: { file: 'guides/js/assistant/adapters/ultima5.js', locator: 'companion notes answer recruitment advice', review: 'authored-index' } } });
    });
    // The Shadowlords are enemies to defeat: the guide's banishing steps are their combat tactic (names are Balanced, like the quest titles).
    const shadowObjectives = objectives.filter(objective => /^shadow-/.test(objective.id));
    shadowObjectives.forEach(objective => {
        const names = [objective.title, ...extraNames(objective.id)];
        const named = text => ({ text: clean(text), title: objective.title.replace(/^Banish\s+/i, ''), aliases: names });
        records.push({ id: `ultima5:objective:${objective.id}:combat`, entityId: `ultima5:objective:${objective.id}`, title: objective.title.replace(/^Banish\s+/i, ''), aliases: names, kind: 'enemy',
            relation: 'combat', scope: 'campaign', minSpoiler: 'balanced', requires: null,
            variants: { balanced: named(objective.summary), direct: named(objective.steps.map(withoutRefreshClaim).join('\n')) },
            source: { ...source(`ultima5GrandQuestChapters objective=${objective.id}`), index: authoredIndex('the banishing steps are the guide\'s plan against this Shadowlord') } });
    });
    if (shadowObjectives.length) records.push({ id: 'ultima5:topic:shadowlords:combat', entityId: 'ultima5:topic:shadowlords', title: 'The three Shadowlords', kind: 'enemy', relation: 'combat',
        aliases: ['shadowlords', 'the shadowlords', 'three shadowlords', 'all the shadowlords', 'all three shadowlords'], scope: 'campaign', minSpoiler: 'balanced', requires: null,
        variants: { balanced: { text: shadowObjectives.map(objective => clean(objective.summary)).join('\n') } },
        source: { ...source(shadowObjectives.map(objective => `ultima5GrandQuestChapters objective=${objective.id}.summary`).join('; ')), index: authoredIndex('the three banishing summaries are the guide\'s plan against the Shadowlords') } });
    // Single steps players ask about by name (the harpsichord clue, a word of power, a flame, the demon's riddle).
    (overlay.stepTopics || []).forEach(topic => {
        const objective = byId.get(topic.objective);
        const steps = (topic.steps || []).map(index => objective?.steps[index]).filter(Boolean);
        if (!objective || !steps.length || steps.length !== topic.steps.length) return;
        const relation = topic.relation || 'explanation';
        records.push({ id: `ultima5:topic:${topic.id}:${relation}`, entityId: `ultima5:topic:${topic.id}`, title: topic.title, kind: 'topic', relation, aliases: topic.aliases,
            answers: topic.answers || ['use', 'acquisition', 'hint', 'location'], scope: 'reference', minSpoiler: 'direct', requires: null,
            variants: { direct: { text: steps.map(withoutRefreshClaim).join('\n') } },
            source: { ...source(topic.steps.map(index => `ultima5GrandQuestChapters objective=${topic.objective}.steps[${index}]`).join('; ')),
                index: authoredIndex('objective steps indexed under the name players use') } });
    });
    const grappleQuest = sideQuests.find(quest => quest.id === 'side-grapple');
    const carpetQuest = sideQuests.find(quest => quest.id === 'side-magic-carpet');
    const mountainSentence = clean(carpetQuest?.detail || '').split(/(?<=\.)\s+/).find(sentence => /mountains still need the Grapple/i.test(sentence));
    if (grappleQuest && mountainSentence) records.push({ id: 'ultima5:topic:crossing-mountains:hint', entityId: 'ultima5:topic:crossing-mountains', title: 'Crossing mountains', kind: 'topic', relation: 'hint',
        aliases: ['cross mountains', 'cross the mountains', 'climb mountains', 'climb the mountains', 'crossing mountains', 'get over mountains', 'get over the mountains', 'get across mountains', 'mountain access', 'mountain crossing'],
        answers: ['use', 'acquisition', 'location', 'explanation'], scope: 'reference', minSpoiler: 'gentle', requires: null,
        variants: {
            gentle: { text: overlay.gentleHints['side-grapple'] },
            balanced: { text: `${grappleQuest.title} (${grappleQuest.category}) reward: ${grappleQuest.reward}.` },
            direct: { text: `${clean(grappleQuest.detail)}\n${mountainSentence}` }
        },
        source: { ...source('ultima5SideQuests id=side-grapple.detail; id=side-magic-carpet.detail'), index: authoredIndex('guide text about mountains and the Grapple') } });
    // The navigation quest's reward line says what the Sextant and Spyglass tips are for.
    const navigation = sideQuests.find(quest => quest.id === 'side-navigation');
    if (navigation?.reward) for (const [id, title] of [['sextant', 'Sextant'], ['spyglass', 'Spyglass']]) records.push({ id: `ultima5:topic:${id}:use`, entityId: `ultima5:topic:${id}`,
        title, aliases: [], kind: 'topic', relation: 'use', answers: ['explanation'], scope: 'reference', minSpoiler: 'balanced', requires: null,
        variants: { balanced: { text: `${navigation.title} (${navigation.category}) reward: ${navigation.reward}.` } },
        source: { ...source('ultima5SideQuests id=side-navigation.reward'), index: { file: 'guides/js/assistant/adapters/ultima5.js', locator: 'navigation quest reward says what the Sextant and Spyglass are for', review: 'authored-index' } } });
    // Names only Direct players can use (a companion's note reveals the betrayal), and groups of companions.
    (overlay.companionAliases ? Object.entries(overlay.companionAliases) : []).forEach(([name, aliases]) => {
        const record = records.find(entry => entry.id === `ultima5:companion:${slug(name)}:explanation`);
        if (record?.variants.direct) record.variants.direct.aliases = [...record.variants.direct.aliases, ...aliases];
    });
    records.push({ id: 'ultima5:topic:companions:explanation', entityId: 'ultima5:topic:companions', title: 'Companions', kind: 'topic', aliases: ['companion', 'companions', 'party members', 'party member'],
        relation: 'explanation', answers: ['hint'], scope: 'reference', minSpoiler: 'gentle', requires: null,
        variants: { gentle: { text: `Companions: ${companions.map(companion => `${companion.Name} (${companion.Class})`).join(', ')}.` } },
        source: { file: 'guides/js/Ultima5.js', locator: 'companionData[*].Name, Class', review: 'extracted', index: authoredIndex('companion roster') } });
    const byClass = new Map();
    companions.forEach((companion, index) => byClass.set(companion.Class, [...(byClass.get(companion.Class) || []), { companion, index }]));
    for (const [cls, members] of byClass) {
        const plural = `${cls.toLowerCase()}s`;
        records.push({ id: `ultima5:topic:class-${slug(cls)}:explanation`, entityId: `ultima5:topic:class-${slug(cls)}`, title: `${cls} companions`, kind: 'topic',
            aliases: [plural, `${cls.toLowerCase()} companions`, `${cls.toLowerCase()} party members`, `which companions are ${plural}`, `who are the ${plural}`, `companion ${plural}`],
            relation: 'explanation', answers: ['hint'], scope: 'reference', minSpoiler: 'gentle', requires: null,
            variants: { gentle: { text: `${cls} companions: ${members.map(({ companion }) => companion.Name).join(', ')}.` } },
            source: { file: 'guides/js/Ultima5.js', locator: `companionData[${members.map(({ index }) => index).join(',')}].Class`, review: 'extracted', index: authoredIndex('companions grouped by class') } });
    }
    // Where the guide's own notes rate companions ("The strongest mage in the game"), the notes answer "who is the best ...?".
    (overlay.companionGroups || []).forEach(group => {
        const members = group.members.map(name => companions.findIndex(companion => companion.Name === name)).filter(index => index >= 0);
        if (members.length !== group.members.length) return;
        records.push({ id: `ultima5:topic:${group.id}:explanation`, entityId: `ultima5:topic:${group.id}`, title: group.title, kind: 'topic', aliases: group.aliases,
            relation: 'explanation', answers: group.answers || ['hint', 'advice'], scope: 'reference', minSpoiler: 'direct', requires: null,
            variants: { direct: { text: members.map(index => `${companions[index].Name}: ${companions[index].Notes}`).join('\n') } },
            source: { file: 'guides/js/Ultima5.js', locator: members.map(index => `companionData[${index}].Notes`).join('; '), review: 'extracted', index: authoredIndex('companion notes quoted for superlative questions') } });
    });
    spells.filter(spell => clean(spell.Name).toUpperCase() !== 'AN SANCT').forEach(spell => {
        const name = clean(spell.Name);
        const reagents = DISPUTED_RECIPE.test(name) ? ' The guide\'s reagent lists for this spell disagree.' : spell.Reagents ? ` Reagents: ${spell.Reagents}.` : '';
        reference('spell', name, 'use', `Circle ${spell.Circle} spell. ${spell.Effect}.${reagents}`, `spellData name=${name}`,
            { level: 'gentle', aliases: overlay.spellAliases?.[name] || [], answers: ['explanation'], why: 'spell table entry says what the spell is' });
    });
    // Virtues: the town is mild, the dungeon moderate, mantras and words of
    // power are full solutions, so each tier reveals only its own fields.
    words.forEach((word, i) => {
        const entityId = `ultima5:virtue:${slug(word.Virtue)}`;
        const known = value => value && value !== '—';
        // Names that mention a mantra or word of power only match where that field is shown, so a Gentle question about
        // the mantra is not answered with an unrelated line about the town.
        const plain = [word.Virtue, `virtue of ${word.Virtue}`, `${word.Virtue} virtue`];
        const dungeonNames = known(word.Dungeon) ? [`dungeon of ${word.Virtue}`, `${word.Virtue} dungeon`] : [];
        const mantraNames = [`mantra of ${word.Virtue}`, `${word.Virtue} mantra`, `mantra for ${word.Virtue}`, `shrine of ${word.Virtue} mantra`, `${word.Virtue} shrine mantra`,
            `mantra of the shrine of ${word.Virtue}`, `${word.Virtue}'s mantra`];
        // Words of power belong to a separate Direct-only subject, so a question about one is never answered with the mantra instructions.
        const wordNames = [`word of power for ${word.Virtue}`, `${word.Virtue} word of power`, `${word.Virtue}'s word of power`, `words of power for ${word.Virtue}`,
            ...(known(word.Dungeon) ? [`word of power for ${word.Dungeon}`, `${word.Dungeon} word of power`, `${word.Dungeon}'s word of power`, `enter ${word.Dungeon}`,
                `enter the dungeon ${word.Dungeon}`, `enter dungeon ${word.Dungeon}`, `entering ${word.Dungeon}`, `get into ${word.Dungeon}`, `open ${word.Dungeon}`, `${word.Dungeon} password`] : [])];
        const aliases = [...plain, ...dungeonNames, ...mantraNames];
        const balanced = `${word.Virtue}: the town is ${word.Town}${known(word.Dungeon) ? `; its dungeon is ${word.Dungeon}` : ''}.`;
        const base = { entityId, title: word.Virtue, aliases: plain, kind: 'virtue', scope: 'reference', requires: null, source: source(`wordData[${i}]`) };
        const index = locator => ({ file: 'guides/js/assistant/adapters/ultima5.js', locator, review: 'authored-index' });
        // "What is the mantra / dungeon / word of power for Honesty?" reads as a use question; each tier shows only its own fields.
        records.push({ ...base, id: `${entityId}:explanation`, relation: 'explanation', minSpoiler: 'gentle', answers: ['use'],
            source: { ...base.source, index: index('virtue row answers mantra, dungeon and word-of-power questions') },
            variants: {
                gentle: { text: `${word.Virtue} is associated with the town of ${word.Town}.`, title: word.Virtue, aliases: plain },
                balanced: { text: balanced, title: word.Virtue, aliases: [...plain, ...dungeonNames] },
                direct: { text: `${balanced} Mantra: ${word.Mantra.toUpperCase()}.${known(word.Word) ? ` Word of power: ${word.Word.toUpperCase()}.` : ''}`, title: word.Virtue, aliases }
            } });
        // "Which town is Honesty?": the town column of the same table row.
        records.push({ ...base, id: `${entityId}:location`, relation: 'location', minSpoiler: 'gentle',
            variants: { gentle: { text: `${word.Virtue}: the town is ${word.Town}.` } } });
        if (known(word.Word)) records.push({ id: `ultima5:wordofpower:${slug(word.Virtue)}:explanation`, entityId: `ultima5:wordofpower:${slug(word.Virtue)}`,
            title: `Word of power for ${word.Virtue}`, aliases: wordNames, kind: 'topic', relation: 'explanation', answers: ['use', 'hint', 'location'], scope: 'reference',
            minSpoiler: 'direct', requires: null, source: { ...base.source, index: index('virtue row word of power and dungeon') },
            variants: { direct: { text: `${word.Virtue}: the dungeon is ${word.Dungeon}. Word of power: ${word.Word.toUpperCase()}.`, title: `Word of power for ${word.Virtue}`, aliases: wordNames } } });
    });
    // The objective steps that teach a word of power also answer "how do I get the word of power for <dungeon>?".
    Object.entries(overlay.wordSteps || {}).forEach(([virtue, where]) => {
        const word = words.find(entry => entry.Virtue === virtue);
        const step = byId.get(where.objective)?.steps[where.step];
        if (!word || !step || !new RegExp(`\\b${word.Word}\\b`, 'i').test(step)) return;
        records.push({ id: `ultima5:wordofpower:${slug(virtue)}:acquisition`, entityId: `ultima5:wordofpower:${slug(virtue)}`, title: `Word of power for ${virtue}`,
            aliases: [], kind: 'topic', relation: 'acquisition', answers: ['hint'], scope: 'reference', minSpoiler: 'direct', requires: null,
            variants: { direct: { text: clean(step) } },
            source: { ...source(`ultima5GrandQuestChapters objective=${where.objective}.steps[${where.step}]`), index: authoredIndex('the step that teaches a word of power') } });
    });
    // The shrine objective's own summary says whom to ask for the mantra, so it also answers "how do I get the <virtue> mantra?".
    objectives.filter(objective => /^shrine-/.test(objective.id) && words.some(word => `shrine-${slug(word.Virtue)}` === objective.id)).forEach(objective => {
        const word = words.find(entry => `shrine-${slug(entry.Virtue)}` === objective.id);
        records.push({ id: `ultima5:virtue:${slug(word.Virtue)}:acquisition`, entityId: `ultima5:virtue:${slug(word.Virtue)}`, title: word.Virtue, aliases: [word.Virtue],
            kind: 'virtue', relation: 'acquisition', answers: ['hint'], scope: 'reference', minSpoiler: 'balanced', requires: null,
            variants: { balanced: { text: clean(objective.summary) } },
            source: { ...source(`ultima5GrandQuestChapters objective=${objective.id}.summary`),
                index: { file: 'guides/js/assistant/adapters/ultima5.js', locator: 'shrine summary says whom to ask for the mantra', review: 'authored-index' } } });
    });
    // Townspeople from the atlas interiors. Named residents get their role and
    // buildings (Direct, like other Ultima V locations). Service roles become
    // "where is a healer?" lists. Generic guards and a dialogue line that the
    // extraction recorded as a name are skipped.
    const SERVICES = {
        'Healer': ['healer', 'healers', 'healing service', 'get healed', 'free healer', 'can i get healed', 'where can i heal', 'where can we heal', 'where to heal', 'place to heal'],
        'Blacksmith': ['blacksmith', 'blacksmiths', 'weaponsmith', 'armourer', 'armorer', 'weapon shop', 'armour shop', 'armor shop', 'armor', 'armour', 'weapons'],
        'Barkeeper': ['barkeeper', 'barkeepers', 'tavern', 'taverns', 'pub'],
        'Innkeeper': ['innkeeper', 'innkeepers', 'inn', 'inns'],
        'Magic seller': ['magic seller', 'magic sellers', 'magic shop', 'reagent shop', 'reagent seller', 'buy reagents', 'reagent shops'],
        'Shipwright': ['shipwright', 'shipwrights', 'ship seller'],
        'Horse seller': ['horse seller', 'horse sellers', 'horse', 'horses'],
        'Guild master': ['guild master', 'guild masters', 'guild', 'guilds']
    };
    const interiors = atlas.interiors || [];
    const residents = interiors.flatMap((interior, i) => (interior.npcs || []).map(npc => ({ ...npc, interior: interior.name, index: i })));
    for (const [role, aliases] of Object.entries(SERVICES)) {
        const places = [...new Set(residents.filter(npc => npc.role === role).map(npc => npc.interior))];
        if (!places.length) continue;
        records.push({ id: `ultima5:service:${slug(role)}:location`, entityId: `ultima5:service:${slug(role)}`, title: `${role}s`, aliases, kind: 'service',
            relation: 'location', answers: ['acquisition'], acquisitionMethods: role === 'Healer' || role === 'Guild master' ? [] : ['buy'],
            scope: 'reference', minSpoiler: 'gentle', requires: null, variants: { gentle: { text: `${role}: ${places.join('; ')}.` } },
            source: { file: 'guides/js/Ultima5AtlasData.js', locator: `ULTIMA5_ATLAS_CONFIG.interiors[*].npcs[role=${role}]`, review: 'extracted',
                index: { file: 'guides/js/assistant/adapters/ultima5.js', locator: 'service roles', review: 'authored-index' } } });
    }
    const known = new Set(records.flatMap(record => [record.title, ...(record.aliases || [])]).map(name => String(name).toLowerCase()));
    const people = new Map();
    for (const npc of residents) {
        if (!npc.name || npc.name === npc.role || npc.role === 'Guard' && /^guard/i.test(npc.name) || /^thou\b|[!?]/i.test(npc.name)
            || known.has(npc.name.toLowerCase())) continue;
        const entry = people.get(npc.name) || { roles: new Set(), places: new Set(), ids: [] };
        entry.roles.add(npc.role); entry.places.add(npc.interior); entry.ids.push(npc.id);
        people.set(npc.name, entry);
    }
    // "Seggallion" for "Lord Seggallion": a title is not part of the name people type.
    const titled = name => { const bare = name.replace(/^(?:Lord|Lady|Sir|Squire|Judge|Monsieur)\s+/i, '').replace(/\s+the\s+\w+$/i, ''); return bare !== name && !known.has(bare.toLowerCase()) && !people.has(bare) ? [bare] : []; };
    for (const [name, entry] of people) records.push({ id: `ultima5:npc:${slug(name)}:location`, entityId: `ultima5:npc:${slug(name)}`, title: name,
        aliases: [name, ...titled(name)], kind: 'npc', relation: 'location', answers: ['explanation'], scope: 'reference', minSpoiler: 'direct', requires: null,
        variants: { direct: { text: `${name} (${[...entry.roles].join(', ')}): ${[...entry.places].join('; ')}.`, title: name, aliases: [name, ...titled(name)] } },
        source: { file: 'guides/js/Ultima5AtlasData.js', locator: `ULTIMA5_ATLAS_CONFIG.interiors[*].npcs[id=${entry.ids.join(',')}]`, review: 'extracted',
            index: { file: 'guides/js/assistant/adapters/ultima5.js', locator: 'resident role answers who-is', review: 'authored-index' } } });
    const facts = ultima5Facts({ chapters, spells, tips, words, moongates, companions, pageFacts: overlay.pageFacts || [] });
    records.push(...buildTopicRecords('ultima5', (overlay.topics || []).map(topic => ({ ...topic, overlayFile: 'guides/data/assistant/ultima5.json' })), facts));
    records.push(...buildNarrativeRecords('ultima5', (overlay.narratives || []).map(definition => ({ ...definition, overlayFile: 'guides/data/assistant/ultima5.json' })), facts));
    records.push(...buildResearchRecords('ultima5', overlay.research, 'guides/data/assistant/ultima5.json'));
    // This is the rescue's outcome, not a description of the king.
    for (const record of records) if (record.id === 'ultima5:objective:doom-rescue:explanation') record.identity = false;
    (atlas.markers || []).forEach((marker, index) => {
        const position = marker.position || {};
        if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return;
        const quest = questNames.get(String(marker.name).toLowerCase());
        records.push({ id: `ultima5:atlas:${index}:location`, entityId: quest ? `ultima5:${quest.key}` : `ultima5:atlas:${index}`, title: quest ? quest.entry.title : marker.name, aliases: [marker.name],
            kind: 'location', relation: 'location', scope: 'atlas', minSpoiler: 'direct', requires: null,
            variants: { direct: { text: `${marker.layer}: X ${position.x}, Y ${position.y}. ${clean(marker.description)}` } },
            source: { file: 'guides/js/Ultima5AtlasData.js', locator: `ULTIMA5_ATLAS_CONFIG.markers[${index}]`, review: 'extracted' } });
        // A marker whose description says more than "enterable location" also answers "what is it?".
        if (!/^Enterable location recorded/i.test(clean(marker.description))) Object.assign(records.at(-1), { answers: ['explanation'],
            source: { ...records.at(-1).source, index: { file: 'guides/js/assistant/adapters/ultima5.js', locator: 'atlas marker description says what the place is', review: 'authored-index' } } });
    });
    return records;
}

export async function createUltima5Assistant(options) {
    const response = await fetch(new URL('../../../data/assistant/ultima5.json', import.meta.url));
    if (!response.ok) throw new Error('The local Ultima V hint file could not be loaded.');
    const overlay = await response.json();
    const started = performance.now();
    const assistant = await createGuideAssistant({ gameId: 'ultima5', records: buildUltima5Records({ ...options, overlay }), getProgress: options.getProgress });
    assistant.preparationMs = performance.now() - started;
    return assistant;
}
