import { createAssistant } from '../engine.js';
import { buildNarrativeRecords, buildResearchRecords, buildTopicRecords, factMap } from '../topics.js';

// All long answers are read from the page's existing objects, not a second walkthrough.
export function ultima6Slug(value) {
    return String(value || '').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[\s_-]+/g, '-');
}
const clean = value => String(value || '').replace(/<[^>]*>/g, '').replace(/`/g, '').trim();
const source = locator => ({ file: 'guides/js/Ultima6.js', locator, review: 'extracted' });
const variant = (text, title, aliases = []) => ({ text: clean(text), title, aliases });
const unique = list => [...new Set(list.filter(Boolean))];
const withoutStop = text => String(text || '').replace(/[.\s]+$/, '');
// A record whose extra relationships are declared by this adapter, not by the engine.
const spellText = spell => `${spell.name}, a circle ${spell.circle} spell: ${spell.effect}`;
const indexed = (locator, file = 'guides/js/assistant/adapters/ultima6.js') => ({ file, locator, review: 'authored-index' });

export function buildUltima6Records({ gameData, atlas = {}, overlay, questRoutes = [] }) {
    const records = [];
    const contexts = new Map();
    // The atlas also repeats some named NPCs in its landmarks. Match the same
    // first record as findBritanniaDestination in the original navigation code.
    const atlasLocations = [...(atlas.markers || []), ...(atlas.npcs || [])].filter((marker, index, all) =>
        all.findIndex(candidate => candidate.name.toLowerCase() === marker.name.toLowerCase()) === index);
    const preparedRoutes = questRoutes.map(route => ({ ...route,
        text: [route.section.heading, route.section.summary, ...(route.section.steps || [])].join(' ')
    }));
    const relatedRoutes = marker => {
        const escaped = marker.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(^|[^A-Za-z0-9_])${escaped}(?=$|[^A-Za-z0-9_])`, 'i');
        return preparedRoutes.filter(route => route.destinations.some(destination => destination.name === marker.name)
            || pattern.test(route.text));
    };
    let objectiveIndex = 0;
    // Overlay aliases: the other names players use for one entry, by its display name or quest slug.
    const aliasesOf = name => overlay.aliases?.[name] || [];
    const questAliases = slug => overlay.questAliases?.[slug] || {};
    function addContext(key, title, gentle, balanced, direct, locator, completionFact = null, more = {}) {
        const entityId = more.entityId || `ultima6:${key}`;
        const safeTitle = key.startsWith('quest:') ? (overlay.safeTitles?.[key.split(':').at(-1)] || `Grand Quest overview ${++objectiveIndex}`)
            : key.startsWith('side-quest:') ? 'Optional quest' : 'Selected map context';
        const record = {
            id: `${entityId}:hint`, entityId, title: safeTitle, aliases: [], kind: 'objective', relation: 'hint',
            scope: key, requires: null, completionFact,
            variants: {
                gentle: variant(gentle, safeTitle, unique(more.gentle || [])),
                balanced: variant(balanced || gentle, title, unique([title, ...(more.visible || [])])),
                direct: variant(direct || balanced || gentle, title, unique([title, ...(more.visible || []), ...(more.direct || [])]))
            }, source: source(locator),
            variantSources: { gentle: { file: 'guides/data/assistant/ultima6.json', locator: 'gentleHints', review: 'authored-from-guide' } }
        };
        if (completionFact) record.checklist = [{ recordId: record.id, completionFact }];
        records.push(record);
        contexts.set(key, record);
        return record;
    }
    // Quest walkthroughs also answer "How do I do it?" / "How do I get it?" from Balanced on; that is declared here, never inferred.
    // (Separate records, so a Gentle shrine quest never competes with the shrine's own bonus entry.)
    const addWalkthrough = (hint, title, summary, steps, locator) => {
        const aliases = hint.variants.balanced.aliases;
        // "Join the Thieves' Guild" is joining, not acquiring: only "how do I do it?" applies.
        const answers = aliases.some(alias => /\bjoin\b/i.test(alias)) ? [] : ['acquisition'];
        records.push({ id: `${hint.entityId}:use`, entityId: hint.entityId, title, aliases, kind: 'objective', relation: 'use', answers,
            scope: hint.scope, minSpoiler: 'balanced', requires: null,
            variants: { balanced: variant(summary, title, aliases), direct: variant(steps.join('\n') || summary, title, aliases) },
            source: { ...source(locator), index: indexed('quest walkthrough answers "how do I do/get it" questions') } });
    };
    // The Balanced summary is also what the quest "is".
    const addSummary = (hint, title, text, locator) => {
        const aliases = hint.variants.balanced.aliases;
        records.push({ id: `${hint.entityId}:explanation`, entityId: hint.entityId, title, aliases, kind: 'objective', relation: 'explanation',
            scope: hint.scope, minSpoiler: 'balanced', requires: null,
            variants: { balanced: variant(text, title, aliases), direct: variant(text, title, aliases) }, source: source(locator) });
    };
    // A shrine's quest is also the shrine's hint (named from Balanced on; at Gentle the quest already carries the shrine's safe title).
    const shrineByVirtue = new Map((gameData.shrines || []).map(shrine => [shrine.virtue.toLowerCase(), shrine]));
    const shrineEntity = shrine => {
        const name = `Shrine of ${shrine.virtue}`;
        const marker = atlasLocations.find(location => location.name.toLowerCase() === name.toLowerCase());
        // The shrine subject (names, bonus, hint, location) is its own entity; the atlas marker's context record keeps the
        // marker id the page selects, with no name of its own, so selecting a marker and asking for a hint is never ambiguous.
        return { name, entityId: marker ? `ultima6:atlas:place:${marker.name}` : `ultima6:shrine:${ultima6Slug(name)}` };
    };
    const addShrineHint = (hint, section, locator) => {
        const shrine = shrineByVirtue.get(section.heading.split(/\s+[—-]\s+/)[0].trim().toLowerCase());
        if (!shrine) return;
        const { name, entityId } = shrineEntity(shrine);
        const aliases = unique([name, ...aliasesOf(name)]);
        records.push({ id: `${entityId}:hint:quest`, entityId, title: name, aliases, kind: 'shrine', relation: 'hint', scope: 'reference', minSpoiler: 'balanced', requires: null,
            variants: { balanced: variant(section.summary, name, aliases), direct: variant((section.steps || []).join('\n') || section.summary, name, aliases) },
            source: source(locator) });
    };
    (gameData.quests || []).forEach((quest, qi) => {
        const questKey = ultima6Slug(quest.title);
        const overview = addContext(`quest:${questKey}:overview`, quest.title, overlay.overviewGentle, quest.intro, [quest.intro, quest.recap].join('\n'), `gameData.quests[${qi}]`, null,
            { visible: questAliases(questKey).more });
        addSummary(overview, quest.title, quest.intro, `gameData.quests[${qi}].intro`);
        addWalkthrough(overview, quest.title, quest.intro, [quest.intro, quest.recap].filter(Boolean), `gameData.quests[${qi}]`);
        (quest.sections || []).forEach((section, si) => {
            const sectionKey = ultima6Slug(section.heading);
            const legacyKey = `${questKey}:${sectionKey}`;
            const named = questAliases(sectionKey);
            const hint = addContext(`quest:${legacyKey}`, section.heading,
                overlay.gentleHints[sectionKey] || 'Review the people involved and the last instruction you received.',
                section.summary, (section.steps || []).join('\n'), `gameData.quests[${qi}].sections[${si}]`,
                `ultima6:completed:${legacyKey}`, { gentle: named.gentle, visible: named.more });
            addWalkthrough(hint, section.heading, section.summary, section.steps || [], `gameData.quests[${qi}].sections[${si}]`);
            addSummary(hint, section.heading, section.summary, `gameData.quests[${qi}].sections[${si}].summary`);
            if (qi === 0) addShrineHint(hint, section, `gameData.quests[${qi}].sections[${si}]`);
        });
        overview.checklist = (quest.sections || []).flatMap(section =>
            contexts.get(`quest:${questKey}:${ultima6Slug(section.heading)}`)?.checklist || []);
    });
    (gameData.sideQuests || []).forEach((quest, index) => {
        const key = ultima6Slug(quest.title);
        const more = questAliases(key).more || [];
        const hint = addContext(`side-quest:${key}`, quest.title, overlay.gentleHints[key], quest.summary,
            (quest.steps || []).join('\n'), `gameData.sideQuests[${index}]`, `ultima6:side-completed:${key}`, { visible: more });
        addWalkthrough(hint, quest.title, quest.summary, quest.steps || [], `gameData.sideQuests[${index}]`);
        // Region, destinations and reward, named only from Balanced like the hint.
        const entityId = `ultima6:side-quest:${key}`;
        const aliases = unique([quest.title, ...more]);
        const named = text => ({ text: clean(text), title: quest.title, aliases });
        const places = (quest.destinations || []).map(destination => typeof destination === 'string' ? destination : destination?.name).filter(Boolean);
        if (quest.region || places.length) records.push({ id: `${entityId}:location`, entityId, title: quest.title, aliases, kind: 'objective',
            relation: 'location', scope: `side-quest:${key}`, minSpoiler: 'direct', requires: null,
            variants: { direct: named(`${quest.title}: ${[quest.region, places.length ? `destinations ${places.join(', ')}` : ''].filter(Boolean).join('; ')}.`) },
            source: source(`gameData.sideQuests[${index}].region/destinations`) });
        // What the quest is (summary) and what it pays, in one fact so "tell me about it" and "what is the reward" agree.
        if (quest.summary || quest.reward) records.push({ id: `${entityId}:explanation`, entityId, title: quest.title, aliases, kind: 'objective',
            relation: 'explanation', scope: `side-quest:${key}`, minSpoiler: 'balanced', requires: null,
            variants: { balanced: named([quest.summary, quest.reward ? `${quest.title} reward: ${quest.reward}.` : ''].filter(Boolean).join(' ')),
                direct: named([quest.summary, quest.reward ? `${quest.title} reward: ${quest.reward}.` : ''].filter(Boolean).join(' ')) },
            source: source(`gameData.sideQuests[${index}].summary/reward`) });
    });
    // Where the guide itself places a companion or dungeon, and what a dungeon is for. The atlas marker of the same
    // name carries these too, so one location fact and one hint per subject keep every answer complete.
    const markerNamed = name => atlasLocations.some(location => location.name.toLowerCase() === name.toLowerCase());
    const guideLocation = new Map(), guideObjective = new Map();
    (gameData.companions || []).forEach((companion, index) => {
        if (companion.location !== 'Permanent' && markerNamed(companion.name))
            guideLocation.set(companion.name.toLowerCase(), { text: companion.location, locator: `gameData.companions[${index}].location` });
    });
    const dungeonTargets = dungeon => overlay.dungeonMarkers?.[dungeon.name] || [dungeon.name];
    (gameData.dungeons || []).forEach((dungeon, index) => dungeonTargets(dungeon).filter(markerNamed).forEach(name => {
        if (dungeon.location !== 'Interconnected') guideLocation.set(name.toLowerCase(), { text: dungeon.location, locator: `gameData.dungeons[${index}].location` });
        guideObjective.set(name.toLowerCase(), { text: dungeon.objective, locator: `gameData.dungeons[${index}].objective` });
    }));
    const describedShrines = new Set((gameData.shrines || []).map(shrine => `shrine of ${shrine.virtue}`.toLowerCase()));
    const describedElsewhere = new Set([...(gameData.companions || []).map(companion => companion.name),
        ...(gameData.shrines || []).map(shrine => `Shrine of ${shrine.virtue}`)].map(name => name.toLowerCase()));
    atlasLocations.forEach((marker, index) => {
        const key = `atlas:marker:${marker.name}`;
        const lower = marker.name.toLowerCase();
        const position = marker.position || {};
        const names = unique([marker.name, ...aliasesOf(marker.name)]);
        const coordinateText = Number.isFinite(position.x) && Number.isFinite(position.y)
            ? `Coordinates: X ${position.x.toString(16).toUpperCase().padStart(3, '0')}, Y ${position.y.toString(16).toUpperCase().padStart(3, '0')}, Z ${position.z ?? 0}.`
            : 'The guide has no coordinate record for this marker.';
        const connected = relatedRoutes(marker).slice(0, 6).map(route => `${route.quest.title} — ${route.section.heading}`);
        const routeText = connected.length ? `Connected quest steps: ${connected.join('; ')}.` : '';
        const objective = guideObjective.get(lower);
        const described = marker.description && marker.type === 'npc' ? `${marker.name}: ${marker.description}` : marker.description;
        // A shrine's hint is its quest (records above); the marker's own context record keeps a generic name so a named
        // question ("hint for the Valor shrine") ranks the quest hint first, while selecting the marker still works.
        const isShrine = describedShrines.has(lower);
        const entityId = isShrine ? `ultima6:atlas:place:${marker.name}` : `ultima6:${key}`;
        const record = addContext(key, marker.name, overlay.mapGentle, 'The selected marker can be inspected in the atlas. Choose Direct for its description and coordinates.',
            [objective?.text, described, coordinateText, routeText].filter(Boolean).join('\n'), `BRITANNIA_MAP_CONFIG markers/npcs ${index}`,
            null, { direct: isShrine ? [] : names.slice(1) });
        record.source = { file: 'guides/js/Ultima6Atlas.js', locator: `marker:${marker.name}`, review: 'extracted' };
        if (isShrine) Object.assign(record.variants.direct, { title: `${marker.name} (map marker)`, aliases: [] });
        if (objective) Object.assign(record, { answers: ['use', 'acquisition'], source: { ...record.source, index: indexed('dungeon objective answers "how do I do/get it" questions') } });
        if (objective) record.variantSources.direct = { file: 'guides/js/Ultima6.js, guides/js/Ultima6Atlas.js', locator: `${objective.locator}; marker:${marker.name}`, review: 'extracted' };
        // Names and coordinate keywords exist only in the authorized Direct catalog.
        record.variants.balanced.title = 'Selected map context';
        record.variants.balanced.aliases = [];
        const place = guideLocation.get(lower);
        records.push({ ...record, id: `${entityId}:location`, entityId, title: marker.name, relation: 'location', minSpoiler: 'direct',
            variants: { direct: variant(place ? `${withoutStop(place.text)}. ${coordinateText}` : coordinateText, marker.name, names) },
            variantSources: place ? { direct: { file: 'guides/js/Ultima6.js, guides/js/Ultima6Atlas.js', locator: `${place.locator}; marker:${marker.name}`, review: 'extracted' } } : record.variantSources });
        // The atlas's own description of a person or place answers "Who is X?" / "What is X?".
        if (marker.description && !describedElsewhere.has(lower)) records.push({ ...record, id: `${entityId}:explanation`, entityId, relation: 'explanation',
            minSpoiler: 'direct', variants: { direct: variant(`${marker.name}: ${marker.description.replace(/\*+$/, '')}`, marker.name, names) }, variantSources: undefined });
    });
    (atlas.levels || []).forEach(level => {
        const connected = questRoutes.filter(route => route.destinations.some(destination => (destination.position?.z ?? 0) === level.id))
            .slice(0, 6).map(route => `${route.quest.title} — ${route.section.heading}`);
        const routeText = connected.length ? `Connected quest steps: ${connected.join('; ')}.` : 'No Grand Quest destinations are currently mapped on this layer.';
        const record = addContext(`atlas:level:${level.id}`, level.name, overlay.layerGentle, overlay.layerGentle,
            `${level.name}. ${routeText} Choose a specific marker for coordinates.`, `BRITANNIA_MAP_CONFIG.levels id=${level.id}`);
        record.source = { file: 'guides/js/Ultima6Atlas.js', locator: `BRITANNIA_MAP_CONFIG.levels id=${level.id}`, review: 'extracted' };
        record.variants.balanced.title = 'Selected map layer';
        record.variants.balanced.aliases = [];
    });
    function addReference(kind, name, relation, text, locator, minSpoiler = 'direct', { aliases = [], answers = null, why = '' } = {}) {
        const marker = atlasLocations.find(location => location.name.toLowerCase() === name.toLowerCase());
        const entityId = marker ? `ultima6:atlas:marker:${marker.name}` : `ultima6:${kind}:${ultima6Slug(name)}`;
        const record = { id: `${entityId}:${relation}:reference`, entityId, title: name, aliases: unique([name, ...aliasesOf(name), ...aliases]), kind, relation, scope: 'reference',
            minSpoiler, requires: null,
            acquisitionMethods: relation === 'acquisition' && /\bsold\b/i.test(text) ? ['buy'] : [],
            ...(kind === 'item' ? { possessionFact: `ultima6:possesses:${ultima6Slug(name)}` } : {}),
            ...(kind === 'companion' ? { partyFact: `ultima6:party:${ultima6Slug(name)}` } : {}),
            variants: { [minSpoiler]: { text: clean(text) } }, source: source(locator) };
        if (answers) Object.assign(record, { answers, source: { ...record.source, index: indexed(why) } });
        records.push(record);
        return record;
    }
    (gameData.equipment || []).forEach((item, index) => {
        // "Found in…", "Sold by…" and "Crafted by…" also say where the item is.
        addReference('item', item.name, 'acquisition', item.acq, `gameData.equipment[${index}].acq`, 'direct',
            { answers: ['location'], why: 'equipment acquisition text answers "where is it?"' });
        // This guide keeps equipment effects/statistics in `stat`, with no
        // separate use field, so the same fact answers "what does it do?".
        addReference('item', item.name, 'explanation', `${item.type}; ${item.stat}.`, `gameData.equipment[${index}]`, 'gentle').answers = ['use'];
    });
    (gameData.spells || []).forEach((spell, index) => {
        // The spell's name leads the text, so "Which spell kills multiple enemies?" names it. Cure's effect text says it cures poison.
        addReference('spell', spell.name, 'use', spellText(spell), `gameData.spells[${index}]`, 'gentle',
            { answers: /\bcures? \w+/i.test(spell.effect) ? ['explanation', 'remedy'] : ['explanation'], why: 'spell table entry (circle and effect) describes the spell' });
    });
    (gameData.companions || []).forEach((companion, index) => {
        if (companion.location !== 'Permanent' && !markerNamed(companion.name)) addReference('companion', companion.name, 'location', companion.location, `gameData.companions[${index}].location`);
        // The role line is the guide's assessment ("A good alternative to Iolo").
        addReference('companion', companion.name, 'explanation', `${companion.class}. ${companion.role}`, `gameData.companions[${index}]`, 'gentle',
            { answers: ['advice'], why: 'companion role answers recruitment advice' });
        addReference('companion', companion.name, 'stats', `${companion.name}: ${companion.class}, level ${companion.level}. Strength ${companion.str}, Dexterity ${companion.dex}, Intelligence ${companion.int}.`,
            `gameData.companions[${index}]`, 'gentle');
    });
    (gameData.shrines || []).forEach((shrine, index) => {
        const { name, entityId } = shrineEntity(shrine);
        const marker = atlasLocations.find(location => location.name.toLowerCase() === name.toLowerCase());
        const bonus = `${name} bonus: ${shrine.bonus}.`;
        const aliases = unique([name, ...aliasesOf(name)]);
        // The atlas adds the virtue and mantra for the shrines it marks (Direct, like every atlas fact), so "mantra" is a name only there.
        const mantraAliases = [`${shrine.virtue} mantra`, `mantra of ${shrine.virtue}`, `mantra for ${shrine.virtue}`, `${shrine.virtue} shrine mantra`,
            `mantra of the ${name}`, `mantra for the ${name}`, `${name} mantra`, `mantra of ${name}`];
        records.push({ id: `${entityId}:explanation:reference`, entityId, title: name, aliases, kind: 'shrine', relation: 'explanation',
            answers: ['use'], scope: 'reference', minSpoiler: 'gentle', requires: null, acquisitionMethods: [],
            variants: { gentle: { text: bonus, title: name, aliases },
                ...(marker?.description ? { direct: { text: `${bonus} ${marker.description}`, title: name, aliases: [...aliases, ...mantraAliases] } } : {}) },
            variantSources: marker?.description ? { direct: { file: 'guides/js/Ultima6.js, guides/js/Ultima6Atlas.js', locator: `gameData.shrines[${index}]; marker:${marker.name}`, review: 'extracted' } } : undefined,
            source: { ...source(`gameData.shrines[${index}]`), index: indexed('shrine bonus answers "what does the shrine do?"') } });
    });
    // Lore questions (the in-game manual checks). Overlay aliases name each
    // question's subject; `answers` lists the only other relationships it answers.
    (gameData.passage || []).forEach((entry, index) => {
        const authored = overlay.qa?.[index];
        if (!authored) return;
        const entityId = `ultima6:qa:${ultima6Slug(entry.question)}`;
        records.push({ id: `${entityId}:explanation`, entityId, title: entry.question, aliases: authored.aliases, kind: 'qa',
            relation: 'explanation', answers: authored.answers || [], scope: 'reference', minSpoiler: 'gentle', requires: null,
            variants: { gentle: { text: clean(`"${entry.question}" ${entry.answer} (${entry.source}).`) } },
            source: { ...source(`gameData.passage[${index}]`), index: { file: 'guides/data/assistant/ultima6.json', locator: `qa[${index}]`, review: 'authored-index' } } });
    });
    (gameData.cheats || []).forEach((cheat, index) => {
        const authored = overlay.cheats?.[cheat.title];
        if (!authored) return;
        const entityId = `ultima6:cheat:${ultima6Slug(cheat.title)}`;
        records.push({ id: `${entityId}:use`, entityId, title: cheat.title, aliases: [cheat.title, ...authored.aliases], kind: 'cheat',
            relation: 'use', answers: ['hint', 'explanation', 'acquisition'], scope: 'reference', minSpoiler: 'gentle', requires: null,
            editions: authored.editions || [],
            variants: { gentle: { text: clean(`${cheat.title} (${cheat.platform}): ${cheat.description} ${(cheat.steps || []).join(' ')}`).replace(/\*\*/g, '') } },
            source: { ...source(`gameData.cheats[${index}]`), index: { file: 'guides/data/assistant/ultima6.json', locator: `cheats[${JSON.stringify(cheat.title)}]`, review: 'authored-index' } } });
    });
    if (gameData.cheats?.length) records.push({ id: 'ultima6:topic:cheats:explanation', entityId: 'ultima6:topic:cheats', title: 'Cheats',
        aliases: ['cheat', 'cheats', 'cheat codes', 'exploits', 'secrets', 'list the cheats', 'list cheats', 'list all cheats', 'all cheats', 'cheat list', 'list of cheats'], kind: 'qa', relation: 'explanation', answers: ['use', 'hint'],
        scope: 'reference', minSpoiler: 'gentle', requires: null,
        variants: { gentle: { text: `Cheats in this guide: ${gameData.cheats.map(cheat => `${cheat.title} (${cheat.platform})`).join('; ')}.` } },
        source: { ...source('gameData.cheats[*].title'), index: { file: 'guides/js/assistant/adapters/ultima6.js', locator: 'cheat list topic', review: 'authored-index' } } });
    (gameData.dungeons || []).forEach((dungeon, index) => {
        const targets = dungeonTargets(dungeon);
        // Dungeons that have an atlas marker are described by that marker's records above.
        targets.filter(name => !markerNamed(name)).forEach(name => {
            const extra = targets.length === 1 && name !== dungeon.name ? [dungeon.name] : [];
            if (dungeon.location !== 'Interconnected') addReference('location', name, 'location', dungeon.location, `gameData.dungeons[${index}].location`, 'direct', { aliases: extra });
            addReference('location', name, 'hint', dungeon.objective, `gameData.dungeons[${index}].objective`, 'direct', { aliases: extra });
        });
    });
    // Overlay topics index verbatim guide facts: companion roles, Words of Passage, mantras and a few lines of page text.
    const atlasSource = name => ({ file: 'guides/js/Ultima6Atlas.js', locator: `marker:${name}`, review: 'extracted' });
    const facts = factMap([
        ...(gameData.companions || []).map((companion, index) => [`companion:${companion.name}`, `${companion.name}: ${companion.class}. ${companion.role}`, source(`gameData.companions[${index}]`), { minSpoiler: 'balanced' }]),
        ...(gameData.passage || []).map((entry, index) => [`passage:${index}`, `"${entry.question}" ${entry.answer} (${entry.source}).`, source(`gameData.passage[${index}]`)]),
        ...(gameData.cheats || []).flatMap((cheat, ci) => (cheat.steps || []).map((step, si) => [`cheat:${cheat.title}:${si}`, step.replace(/\*\*/g, ''), source(`gameData.cheats[${ci}].steps[${si}]`)])),
        ...(gameData.spells || []).map((spell, index) => [`spell:${index}`, spellText(spell), source(`gameData.spells[${index}]`)]),
        ...(gameData.dungeons || []).map((dungeon, index) => [`dungeon:${index}`, `${dungeon.name} (${dungeon.location}): ${dungeon.objective}`, source(`gameData.dungeons[${index}]`)]),
        ...(gameData.sideQuests || []).map((quest, index) => [`sideQuest:${index}`, `${quest.title}: ${quest.summary}`, source(`gameData.sideQuests[${index}].summary`), { minSpoiler: 'balanced' }]),
        ...(gameData.sideQuests || []).flatMap((quest, qi) => (quest.steps || []).map((step, si) => [`sideQuestStep:${qi}:${si}`, step, source(`gameData.sideQuests[${qi}].steps[${si}]`), { minSpoiler: 'direct' }])),
        ...(gameData.quests || []).map((quest, index) => [`act:${index}`, `${quest.title}: ${quest.intro}`, source(`gameData.quests[${index}]`)]),
        ...(gameData.shrines || []).map((shrine, index) => [`bonus:${shrine.virtue}`, `Shrine of ${shrine.virtue} bonus: ${shrine.bonus}.`, source(`gameData.shrines[${index}]`)]),
        ...(gameData.shrines || []).flatMap(shrine => {
            const marker = atlasLocations.find(location => location.name.toLowerCase() === `shrine of ${shrine.virtue}`.toLowerCase());
            return marker?.description ? [[`mantra:${shrine.virtue}`, `${marker.name}: ${marker.description}`, atlasSource(marker.name)]] : [];
        }),
        ...Object.entries(overlay.guideText || {}).map(([key, entry]) => [`html:${key}`, entry.text, { file: entry.file || 'guides/Ultima6.html', locator: entry.locator, review: 'extracted' }])
    ]);
    records.push(...buildTopicRecords('ultima6', (overlay.topics || []).map(topic => ({ ...topic, overlayFile: 'guides/data/assistant/ultima6.json' })), facts));
    records.push(...buildResearchRecords('ultima6', overlay.research, 'guides/data/assistant/ultima6.json'));
    records.push(...buildNarrativeRecords('ultima6', (overlay.narratives || []).map(definition => ({ ...definition, overlayFile: 'guides/data/assistant/ultima6.json' })), facts));
    return { records, contexts };
}

export async function createUltima6Assistant(options) {
    const response = await fetch(new URL('../../../data/assistant/ultima6.json', import.meta.url));
    if (!response.ok) throw new Error('The local Ultima VI hint file could not be loaded.');
    const overlay = await response.json();
    const started = performance.now();
    const { records, contexts } = buildUltima6Records({ ...options, overlay });
    const extractionFinished = performance.now();
    const assistant = createAssistant({ gameId: 'ultima6', records, getProgress: options.getProgress });
    assistant.extractionMs = extractionFinished - started;
    assistant.indexPreparationMs = performance.now() - extractionFinished;
    assistant.preparationMs = performance.now() - started;
    assistant.describeContext = (key, level = 'gentle') => {
        const record = contexts.get(key);
        const allowed = level === 'light' ? 'gentle' : level;
        const selected = record?.variants[allowed] || record?.variants.gentle;
        return selected ? { title: selected.title, text: selected.text, entityId: record.entityId }
            : { title: 'Seer counsel', text: 'Select a quest objective or map marker for a focused hint.', entityId: null };
    };
    return assistant;
}
