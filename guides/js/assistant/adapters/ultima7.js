import { createAssistant } from '../engine.js';
import { authorize } from '../policy.js';
import { buildNarrativeRecords, buildResearchRecords, buildStoryRecords, buildTopicRecords } from '../topics.js';

const slug = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const plain = value => String(value || '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
export const ultima7QuestId = key => `ultima7:quest:${slug(key)}`;
const source = locator => ({ file: 'guides/js/Ultima7.js', locator, review: 'extracted' });
const overlaySource = key => ({ file: 'guides/data/assistant/ultima7.json', locator: `quests[${JSON.stringify(key)}]`, review: 'authored-from-extracted-guide' });

// Atlas marker types: how each kind is named and the earliest tier it shows.
const MARKER_KINDS = {
    npc: ['npc', 'balanced'], monster: ['monster', 'balanced'], creature: ['monster', 'balanced'], enemy: ['monster', 'balanced'],
    clue: ['clue', 'direct'], treasure: ['treasure', 'direct'], interest: ['interest', 'direct'],
    site: ['place', 'gentle'], region: ['place', 'gentle'], city: ['place', 'gentle'], dungeon: ['place', 'gentle'], shrine: ['shrine', 'gentle'],
    castle: ['place', 'gentle'], moongate: ['place', 'gentle'], reagents: ['place', 'gentle']
};
export function buildUltima7Records(data, overlay, questRoutes = {}, markers = []) {
    const records = [];
    const add = (entityId, title, relation, text, locator, minSpoiler = 'gentle', aliases = []) => {
        records.push({ id: `${entityId}:${relation}`, entityId, title, aliases, kind: entityId.split(':')[1], relation, scope: 'ultima7', minSpoiler, variants: { [minSpoiler]: { text: plain(text) } }, source: source(locator), requires: null });
    };
    for (const group of ['mainQuest', 'virtueQuests', 'sideQuests']) {
        (data[group] || []).forEach((quest, index) => {
            const key = quest.title || quest.name;
            const authored = overlay.quests[key];
            if (!authored) return;
            const entityId = ultima7QuestId(key);
            const locator = `DB.${group}[${index}]`;
            const safeTitle = `${group === 'mainQuest' ? 'Main quest' : group === 'virtueQuests' ? 'Forge of Virtue quest' : 'Side quest'} ${index + 1}`;
            let direct = plain(quest.content || quest.walkthrough);
            // Conflicting sources are not reconciled by guessing, and bug claims
            // without edition evidence never become diagnoses or hard rules.
            if (authored.conflict) direct = `${authored.balanced}\nSource limitation: ${authored.conflict}`;
            records.push({ id: `${entityId}:hint`, entityId, title: safeTitle, aliases: [], kind: 'quest', relation: 'hint', answers: ['explanation', 'use'], scope: entityId, variants: { gentle: { text: authored.gentle, title: safeTitle, aliases: [], source: overlaySource(key) }, balanced: { text: authored.balanced, title: safeTitle, aliases: [], source: overlaySource(key) }, direct: { text: direct, title: key, aliases: [key, ...(authored.aliases || [])], source: source(locator), actions: questRoutes[slug(key)] ? [{ id: `quest-map:${slug(key)}`, label: 'Open quest map (full detail)', minSpoiler: 'direct' }] : [] } }, source: { ...source(locator), index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'quest text answers what-is and how-do-I questions', review: 'authored-index' } }, requires: null });
        });
    }
    const opening = data.mainQuest?.[0];
    const gatePassword = opening?.content?.match(/password '([^']+)'/i)?.[1];
    if (gatePassword) add('ultima7:fact:trinsic-password', "Finnigan's gate password", 'explanation',
        `The guide gives the Trinsic exit password as ${gatePassword}. Report the investigation to Mayor Finnigan and pass his quiz to receive it.`,
        'DB.mainQuest[0].content', 'direct', ['Finnigan', ...(overlay.passwordAliases || ['Trinsic password', 'Trinsic gate password'])]);
    if (gatePassword) Object.assign(records.at(-1), { answers: ['hint', 'use', 'acquisition'], source: { ...records.at(-1).source, index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'gate password answers how to leave Trinsic', review: 'authored-index' } } });
    (data.companions || []).forEach((companion, i) => {
        const entityId = `ultima7:companion:${slug(companion.name)}`;
        add(entityId, companion.name, 'location', `The guide lists ${companion.name} at ${companion.location}. This is a guide location, not a report of their current position.`, `DB.companions[${i}].location`);
        add(entityId, companion.name, 'explanation', `${companion.name}: ${companion.role}. Focus: ${companion.focus}. ${companion.notes} Party Builder choices are a plan, not evidence that this companion is currently in your party.`, `DB.companions[${i}]`);
        // Focus and notes ("Will not join if…") are the guide's recruitment advice.
        Object.assign(records.at(-1), { answers: ['advice', 'use'], source: { ...records.at(-1).source, index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'companion notes answer recruitment advice and what-does-he-do questions', review: 'authored-index' } } });
        add(entityId, companion.name, 'stats', `${companion.name}: Strength ${companion.str}, Dexterity ${companion.dex}, Intelligence ${companion.int}, Combat ${companion.com}.${companion.tags?.length ? ` Tags: ${companion.tags.join(', ')}.` : ''}`, `DB.companions[${i}].str/dex/int/com`);
    });
    (data.equipment || []).forEach((item, i) => {
        const entityId = `ultima7:equipment:${slug(item.name)}`;
        const aliases = overlay.aliases[`equipment:${slug(item.name)}`] || [];
        add(entityId, item.name, 'location', `${item.name}: ${item.location}.`, `DB.equipment[${i}].location`, 'direct', aliases);
        // The guide's location is where the item is found or sold, so it also answers "how do I get it"; only "Sold at" names a purchase.
        const found = records.at(-1);
        found.answers = ['acquisition'];
        if (/^sold at\b/i.test(item.location)) found.acquisitionMethods = ['buy'];
        found.source = { ...found.source, index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'equipment location answers how to get it', review: 'authored-index' } };
        add(entityId, item.name, 'use', `${item.name}: ${item.effect}. Type: ${item.type}.`, `DB.equipment[${i}]`, 'balanced', aliases);
    });
    (data.bestiary || []).forEach((creature, i) => {
        const entityId = `ultima7:bestiary:${slug(creature.name)}`;
        add(entityId, creature.name, 'combat', `${creature.name}: ${creature.tactic} The guide recommends ${creature.counter.toLowerCase()}.${creature.threat ? ` Threat: ${creature.threat}.` : ''}`, `DB.bestiary[${i}]`, 'balanced', overlay.aliases[`bestiary:${slug(creature.name)}`] || []);
        // The bestiary entry is the guide's description of the creature, so it also answers "what is it".
        Object.assign(records.at(-1), { answers: ['explanation'], source: { ...records.at(-1).source, index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'bestiary entry answers what-is questions', review: 'authored-index' } } });
    });
    (data.spells || []).forEach((spell, i) => {
        const entityId = `ultima7:spell:${slug(spell.name)}`;
        add(entityId, spell.name, 'use', spell.description, `DB.spells[${i}].description`, spell.category === 'Quest' ? 'direct' : 'gentle', overlay.aliases[`spell:${slug(spell.name)}`] || []);
    });
    // Reagent prices, with the same "best buy" the page's price finder shows.
    const vendors = data.reagents?.vendors || [];
    const priceLines = [];
    Object.entries(data.reagents?.data || {}).forEach(([name, prices]) => {
        const available = prices.map((price, index) => ({ price, vendor: vendors[index] })).filter(entry => entry.price !== null && entry.vendor);
        if (!available.length) return;
        const lowest = Math.min(...available.map(entry => entry.price));
        const best = available.filter(entry => entry.price === lowest).map(entry => entry.vendor).join(' or ');
        const text = `${name}: cheapest place (best buy) ${best} at ${lowest} gold each. All listed prices: ${available.map(entry => `${entry.vendor} ${entry.price}`).join('; ')}.`;
        priceLines.push(text);
        const entityId = `ultima7:reagent:${slug(name)}`;
        records.push({ id: `${entityId}:acquisition`, entityId, title: name, aliases: [name, `${name}s`], kind: 'reagent', relation: 'acquisition',
            answers: ['location', 'explanation'], acquisitionMethods: ['buy'], scope: 'ultima7', minSpoiler: 'gentle', requires: null,
            variants: { gentle: { text } },
            source: { ...source(`DB.reagents.data[${JSON.stringify(name)}]`), index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'reagent price finder', review: 'authored-index' } } });
    });
    // "Cheapest garlic" and "garlic prices" name no verb; as a question-and-answer entry they answer without a menu.
    Object.entries(data.reagents?.data || {}).forEach(([name]) => {
        const priced = records.find(record => record.id === `ultima7:reagent:${slug(name)}:acquisition`);
        if (!priced) return;
        const entityId = `ultima7:topic:price-${slug(name)}`;
        records.push({ ...priced, id: `${entityId}:acquisition`, entityId, kind: 'qa', title: `${name} prices`,
            aliases: [`cheapest ${name}`, `${name} prices`, `${name} price`, `price of ${name}`, `prices of ${name}`, `${name} cost`, `best price for ${name}`, `best place for ${name}`, `cheapest place for ${name}`, `${name} vendors`, `${name} vendor`],
            answers: ['location', 'explanation'], acquisitionMethods: ['buy'] });
    });
    if (priceLines.length) records.push({ id: 'ultima7:topic:reagents:acquisition', entityId: 'ultima7:topic:reagents', title: 'Reagent vendors',
        aliases: ['reagent', 'reagents', 'reagent vendors', 'reagent shops', 'reagent prices', 'spell reagents'], kind: 'topic', relation: 'acquisition',
        answers: ['location'], acquisitionMethods: ['buy'], scope: 'ultima7', minSpoiler: 'gentle', requires: null,
        variants: { gentle: { text: priceLines.join('\n') } },
        source: { ...source('DB.reagents'), index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'reagent price finder', review: 'authored-index' } } });
    // One entry per reagent vendor, asked for by town ("reagents in Terfin").
    (data.reagents?.vendors || []).forEach((vendor, column) => {
        const lines = Object.entries(data.reagents.data).filter(([, prices]) => prices[column] !== null && prices[column] !== undefined).map(([name, prices]) => `${name} ${prices[column]}`);
        const town = vendor.match(/\(([^)]+)\)/)?.[1];
        if (!lines.length || !town) return;
        const person = vendor.replace(/\s*\(.*$/, '');
        const entityId = `ultima7:vendor:${slug(vendor)}`;
        records.push({ id: `${entityId}:acquisition`, entityId, title: `Reagents in ${town}`, kind: 'qa', relation: 'acquisition',
            aliases: [`reagents in ${town}`, `reagents sold in ${town}`, `reagents at ${town}`, `reagents available in ${town}`, `reagents are sold in ${town}`, `reagents are in ${town}`, `reagents are available in ${town}`, `reagents does ${person} sell`, `reagents ${person} sells`, `${town} reagents`, `reagent shop in ${town}`, `reagent vendor in ${town}`, `${person} reagents`, `${person}'s reagents`],
            answers: ['location', 'explanation', 'use'], acquisitionMethods: ['buy'], scope: 'ultima7', minSpoiler: 'gentle', requires: null,
            variants: { gentle: { text: `${vendor} sells these reagents (price in gold each): ${lines.join('; ')}.` } },
            source: { ...source('DB.reagents'), index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'reagent price finder by vendor', review: 'authored-index' } } });
    });
    // Side-quest givers and rewards name the quest, so they are Direct only.
    (data.sideQuests || []).forEach((quest, i) => {
        const entityId = ultima7QuestId(quest.name);
        if (!records.some(record => record.entityId === entityId)) return;
        const names = [];
        // Only the quest's hint carries its name, so a plain "what is X about" ranks the hint above the reward line.
        if (quest.giver || quest.location) add(entityId, `Giver (side quest ${i + 1})`, 'location',
            `${quest.name} quest: given by ${quest.giver || 'an unnamed character'}${quest.location ? ` in ${quest.location}` : ''}.`, `DB.sideQuests[${i}].giver/location`, 'direct', names);
        if (quest.reward) add(entityId, `Reward (side quest ${i + 1})`, 'explanation', `${quest.name} reward: ${quest.reward}.`, `DB.sideQuests[${i}].reward`, 'direct', names);
    });
    // A research entry marked storyOnly is only a fact for story records (who, in the cited source, did what); it makes no standalone
    // explanation record, so it cannot change which subject a name resolves to.
    records.push(...buildResearchRecords('ultima7', (overlay.research || []).filter(entry => !entry.storyOnly), 'guides/data/assistant/ultima7.json'));
    // Atlas markers: townspeople, monsters, places, clues. Repeated names
    // (Trainer, Healer, Cyclops) are grouped; names that already belong to a
    // companion, item, creature or quest keep their existing records.
    // A name that already belongs to a companion, item, creature or quest is kept. A free-standing fact that merely
    // mentions a person (Finnigan's gate password) is not that person, so it must not swallow their atlas location.
    // Research attached to an atlas NPC supplements its identity without swallowing its marker.
    const known = new Set(records.filter(record => record.kind !== 'fact' && !record.entityId.startsWith('ultima7:npc:')).flatMap(record => [record.title, ...(record.aliases || [])]).map(name => String(name).toLowerCase()));
    const bareDetail = marker => plain(marker.description).replace(new RegExp(`^${marker.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '').replace(/[.\s]+$/, '').toLowerCase();
    const npcDetails = new Map(markers.filter(marker => marker.type === 'npc' && marker.name).map(marker => [marker.name.toLowerCase(), bareDetail(marker)]));
    const groups = new Map();
    markers.forEach((marker, index) => {
        const kind = MARKER_KINDS[marker.type];
        if (!kind || !marker.name || known.has(marker.name.toLowerCase())) return;
        const key = `${kind[0]}:${marker.name}`;
        const group = groups.get(key) || { name: marker.name, kind: kind[0], level: kind[1], type: marker.type, details: [], indexes: [] };
        const detail = plain(marker.description).replace(new RegExp(`^${marker.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '').replace(/[.\s]+$/, '');
        // A description that opens with a different person's name is that person's, not this marker's (Burnside's marker describes Finnigan).
        const borrowed = marker.type === 'npc' && [...npcDetails].some(([other, otherDetail]) => other !== marker.name.toLowerCase() && otherDetail && detail.toLowerCase() === `${other} ${otherDetail}`);
        if (detail && !borrowed && !group.details.includes(detail) && detail.toLowerCase() !== marker.type) group.details.push(detail);
        group.indexes.push(index);
        groups.set(key, group);
    });
    // Alias claims keep every typed phrase pointing at one subject.
    const claimed = new Set([...known, ...[...groups.values()].map(group => group.name.toLowerCase())]);
    const claim = (aliases, owner = []) => [...new Set(aliases.map(alias => alias.trim()).filter(Boolean))].filter(alias => {
        const lower = alias.toLowerCase();
        if (claimed.has(lower) || owner.some(name => name.toLowerCase() === lower)) return false;
        claimed.add(lower); return true;
    });
    const towns = [...new Set([...markers.filter(marker => marker.type === 'city').map(marker => marker.name), ...(overlay.towns || [])])].sort((a, b) => b.length - a.length);
    const townOf = text => towns.find(town => new RegExp(`^${town.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w'])`, 'i').test(text));
    const roleOf = detail => {
        const match = detail.match(/^(.+?)\s+(?:-|in|at|of)\s+(.+)$/i);
        const town = match && townOf(match[2]);
        return town && match[2].toLowerCase() === town.toLowerCase() ? { role: match[1], town } : null;
    };
    // Services (Healer, Trainer, Blacksmith…) per town, joined with the NPC the atlas lists for that role in that town.
    const services = new Map();
    markers.forEach((marker, index) => {
        if (marker.type !== 'site' || !marker.name) return;
        const detail = plain(marker.description).replace(new RegExp(`^${marker.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '');
        const town = townOf(detail);
        if (!town || !(overlay.serviceTypes || []).includes(marker.name)) return;
        const key = `${marker.name}|${town}`;
        const entry = services.get(key) || { type: marker.name, town, indexes: [] };
        entry.indexes.push(index); services.set(key, entry);
    });
    const npcRoles = new Map();
    for (const group of groups.values()) if (group.kind === 'npc' && group.details.length === 1) {
        const found = roleOf(group.details[0]);
        if (found) npcRoles.set(`${found.role.toLowerCase()}|${found.town.toLowerCase()}`, [...(npcRoles.get(`${found.role.toLowerCase()}|${found.town.toLowerCase()}`) || []), { group, found }]);
    }
    const spellings = (overlay.serviceSpellings || {});
    for (const entry of services.values()) {
        const entityId = `ultima7:place:${slug(entry.type)}-${slug(entry.town)}`;
        const names = [entry.type, ...(spellings[entry.type] || [])].flatMap(name => name.split('/'));
        const people = [...names, ...(overlay.serviceRoles?.[entry.type] || [])].flatMap(name => npcRoles.get(`${name.toLowerCase()}|${entry.town.toLowerCase()}`) || []);
        const title = `${entry.type} (${entry.town})`;
        const aliases = claim(names.flatMap(name => [`${name}s in ${entry.town}`, `${name} in ${entry.town}`, `${name} of ${entry.town}`, `${name} at ${entry.town}`, `${entry.town} ${name}`, `${name} ${entry.town}`, `${entry.town}'s ${name}`]), [title]);
        const count = entry.indexes.length > 1 ? `${entry.indexes.length} markers` : 'one marker';
        const place = `${entry.type} in ${entry.town}: marked on the guide's atlas (${count}).`;
        const whoText = people.map(({ group, found }) => `${group.name} is listed on the atlas as “${found.role} - ${found.town}”`).join('; ');
        const source = locator => ({ file: 'guides/js/Ultima7Markers.js', locator, review: 'extracted',
            index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'atlas service grouping by town', review: 'authored-index' } });
        const actions = [{ id: `atlas-search:${entry.type} ${entry.town}`, label: 'Show on the atlas' }];
        const variants = { gentle: { text: place, actions } };
        if (people.length) variants.balanced = { text: `${place} ${whoText}.`, actions };
        records.push({ id: `${entityId}:location`, entityId, title, aliases: [title, ...aliases], kind: 'qa', relation: 'location',
            answers: ['explanation', 'acquisition'], scope: 'ultima7', minSpoiler: 'gentle', requires: null, variants,
            source: source(`ULTIMA7_MARKERS[${entry.indexes.slice(0, 6).join(',')}]`) });
    }
    // Roles that name a town or a group ("Mayor of Britain", "King of the gargoyles") are typed as the person's title.
    const roleCount = new Map();
    for (const group of groups.values()) if (group.kind === 'npc' && group.details.length === 1) {
        const lower = group.details[0].toLowerCase(); roleCount.set(lower, (roleCount.get(lower) || 0) + 1);
    }
    for (const group of groups.values()) if (group.kind === 'npc') {
        const extra = [...(overlay.npcAliases?.[group.name] || [])];
        if (group.name.includes('-')) extra.push(group.name.replace(/-/g, ' '));
        const bare = group.name.replace(/^(?:lord|lady|sir|brother)\s+/i, '');
        if (bare !== group.name) extra.push(bare);
        if (group.details.length === 1) {
            const detail = group.details[0];
            // A role line held by one person and made of two to four words ("Fellowship treasurer") also finds that person.
            if (!/\s(?:of|in|at|-)\s/.test(detail) && roleCount.get(detail.toLowerCase()) === 1 && detail.split(/\s+/).length >= 2 && detail.split(/\s+/).length <= 4) extra.push(detail);
            if (/\s(?:of|in|at|-)\s/.test(detail) && roleCount.get(detail.toLowerCase()) === 1) {
                const found = roleOf(detail);
                extra.push(detail.replace(/\s-\s/, ' in '));
                if (found) extra.push(`${found.role} of ${found.town}`, `${found.town} ${found.role}`);
            }
        }
        group.extraAliases = claim(extra, [group.name]);
    }
    for (const group of groups.values()) {
        let entityId = `ultima7:${group.kind}:${slug(group.name)}`;
        // The atlas marker of a quest's own place (Test of Truth) belongs to that quest, so one name has one subject.
        const questEntity = group.type === 'interest' && records.some(record => record.entityId === ultima7QuestId(group.name)) ? ultima7QuestId(group.name) : null;
        // A place that shares a quest's name (Castle of Fire) keeps answering only where it is; the quest answers what it is.
        const ownsQuestName = !questEntity && records.some(record => record.entityId === ultima7QuestId(group.name));
        if (questEntity) entityId = questEntity;
        else if (records.some(record => record.entityId === entityId && record.kind !== 'research')) continue;
        const count = group.indexes.length > 1 ? `${group.indexes.length} markers` : 'one marker';
        const text = group.details.length ? `${group.name}: ${group.details.join('; ')}.` : `${group.name}: ${group.type} on the guide's atlas (${count}).`;
        const plural = /s$/i.test(group.name) ? [] : [`${group.name}s`];
        const cluePlace = group.name.match(/^clue - (.+)$/i)?.[1];
        if (cluePlace) plural.push(`clues in ${cluePlace}`, `clue in ${cluePlace}`, `${cluePlace} clues`, `${cluePlace} clue`);
        const shrine = group.name.match(/^Shrine of (?:the )?(\w+)$/i)?.[1];
        const virtue = shrine && !/^codex$/i.test(shrine) ? [`${shrine} shrine`, ...(overlay.shrineSpellings?.[shrine] ? [`Shrine of ${overlay.shrineSpellings[shrine]}`, `${overlay.shrineSpellings[shrine]} shrine`] : [])] : [];
        const groupAliases = (overlay.groupAliases?.[`${group.kind}:${group.name}`] || []);
        records.push({ id: `${entityId}:${questEntity ? 'atlas' : 'location'}`, entityId, title: group.name, aliases: [group.name, ...plural, ...(group.extraAliases || []), ...virtue, ...groupAliases], kind: questEntity ? 'quest' : group.kind, relation: 'location',
            // A castle icon may represent a person (Lord British). Keep its
            // atlas identity/action while using the reviewed conversational type.
            ...(overlay.atlasSubjectKinds?.[group.name] ? { subjectKind: overlay.atlasSubjectKinds[group.name] } : {}),
            // Only an actual description answers "what is it"; a marker's name/type is location metadata.
            answers: shrine ? ['explanation', 'use'] : ownsQuestName || !group.details.length ? [] : ['explanation'], scope: 'ultima7', minSpoiler: group.level, requires: null,
            variants: { [group.level]: { text, actions: [{ id: `atlas:${group.name}`, label: 'Show on the atlas' }] } },
            source: { file: 'guides/js/Ultima7Markers.js', locator: `ULTIMA7_MARKERS[${group.indexes.slice(0, 6).join(',')}${group.indexes.length > 6 ? ',…' : ''}]`, review: 'extracted',
                index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'atlas marker grouping', review: 'authored-index' } } });
    }
    // Organizations and offices the atlas names ("Leader of the Fellowship", "Member of the Great Council", "Mayor of …"):
    // one entry per organization listing the people the atlas ties to it, with their atlas lines verbatim. Nothing is added to what
    // the atlas says, so "who leads the Fellowship?" is answered by the lines that mention leaders and no more.
    const atlasNpcs = new Map();
    markers.forEach((marker, index) => {
        if (marker.type !== 'npc' || !marker.name) return;
        const detail = plain(marker.description).replace(new RegExp(`^${marker.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '').replace(/[.\s]+$/, '');
        const entry = atlasNpcs.get(marker.name) || { name: marker.name, details: [], indexes: [] };
        if (detail && !entry.details.includes(detail)) entry.details.push(detail);
        entry.indexes.push(index); atlasNpcs.set(marker.name, entry);
    });
    for (const org of overlay.organizations || []) {
        const pattern = new RegExp(org.pattern, 'i');
        const people = [...atlasNpcs.values()].filter(person => person.details.length && pattern.test(person.details.join('; ')));
        if (people.length < 2) continue;
        const entityId = `ultima7:org:${org.id}`;
        records.push({ id: `${entityId}:explanation`, entityId, title: org.title, aliases: claim([org.title, ...org.aliases]), kind: 'qa', relation: 'explanation',
            answers: [], scope: 'ultima7', minSpoiler: 'balanced', requires: null,
            variants: { balanced: { text: `${org.title}:\n${people.map(person => `${person.name}: ${person.details.join('; ')}.`).join('\n')}` } },
            source: { file: 'guides/js/Ultima7Markers.js', locator: `ULTIMA7_MARKERS[${people.flatMap(person => person.indexes).slice(0, 8).join(',')}${people.length > 8 ? ',…' : ''}]`, review: 'extracted',
                index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'organization index over atlas NPC lines', review: 'authored-index' } } });
    }
    // "Where do I train strength?" and "who trains dexterity?" name an attribute, which the question parser reads as a statistics request.
    const trainers = records.find(record => record.id === 'ultima7:place:trainer:location');
    if (trainers && overlay.statTrainerAliases?.length) records.push({ ...trainers, id: 'ultima7:topic:train-stats:location', entityId: 'ultima7:topic:train-stats', kind: 'qa',
        title: 'Where to train', aliases: overlay.statTrainerAliases, answers: ['explanation', 'stats', 'use', 'acquisition'] });
    // Each virtue shrine's mantra is also asked for on its own ("mantra of valor"): one question-and-answer entry per shrine.
    for (const group of groups.values()) {
        const virtue = group.type === 'shrine' ? group.name.match(/^Shrine of (\w+)$/i)?.[1] : null;
        if (!virtue || !/Mantra: /.test(group.details.join('; '))) continue;
        const names = [virtue, overlay.shrineSpellings?.[virtue]].filter(Boolean);
        const entityId = `ultima7:topic:mantra-${slug(virtue)}`;
        records.push({ id: `${entityId}:explanation`, entityId, title: `Mantra of ${virtue}`, aliases: names.flatMap(name => [`mantra of ${name}`, `mantra for ${name}`, `${name} mantra`, `the mantra of ${name}`]),
            kind: 'qa', relation: 'explanation', answers: ['use', 'location'], scope: 'ultima7', minSpoiler: 'gentle', requires: null,
            variants: { gentle: { text: `${group.name}: ${group.details.join('; ')}.` } },
            source: { file: 'guides/js/Ultima7Markers.js', locator: `ULTIMA7_MARKERS[${group.indexes.join(',')}]`, review: 'extracted',
                index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'shrine mantra question-and-answer entries', review: 'authored-index' } } });
    }
    // Towns the guide names only inside marker labels (Buccaneer's Den) get an honest place record instead of nothing.
    for (const town of overlay.towns || []) {
        if (markers.some(marker => marker.name === town && marker.type !== 'npc')) continue;
        const labelled = [...services.values()].filter(entry => entry.town === town).map(entry => entry.type);
        const extra = [...new Set(markers.filter(marker => marker.type === 'site' && marker.name && townOf(plain(marker.description).replace(new RegExp(`^${marker.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '')) === town).map(marker => marker.name))];
        if (!extra.length) continue;
        const entityId = `ultima7:place:${slug(town)}`;
        records.push({ id: `${entityId}:location`, entityId, title: town, aliases: [town, `the ${town}`], kind: 'place', relation: 'location', answers: ['explanation'],
            scope: 'ultima7', minSpoiler: 'gentle', requires: null,
            variants: { gentle: { text: `${town}: no marker of its own on the guide's atlas; these markers are labeled with its name: ${extra.join(', ')}.` } },
            source: { file: 'guides/js/Ultima7Markers.js', locator: 'ULTIMA7_MARKERS (labels naming the town)', review: 'extracted',
                index: { file: 'guides/js/assistant/adapters/ultima7.js', locator: 'town named only in marker labels', review: 'authored-index' } } });
    }
    // Authored topics index the guide's own words: quest sentences from the data, statements printed on the page,
    // and lists built from the data. An answer is the indexed text verbatim; a topic whose text cannot be found is dropped.
    const facts = new Map();
    const dataFile = 'guides/js/Ultima7.js';
    for (const [key, def] of Object.entries(overlay.facts || {})) {
        if (def.page) {
            facts.set(key, { text: def.page.text, source: { file: overlay.pageFile || 'guides/Ultima7.html', locator: def.page.locator } });
        } else if (def.quest) {
            const [group, index] = def.quest;
            const entry = data[group]?.[index];
            const body = entry ? plain(entry.content || entry.walkthrough) : '';
            const start = body.indexOf(def.from);
            const end = start < 0 ? -1 : body.indexOf(def.to, start);
            // Quest excerpts are Direct-level guide text; the tag lets story records enforce that bound.
            if (end >= 0) facts.set(key, { text: body.slice(start, end + def.to.length), minSpoiler: 'direct', source: { file: dataFile, locator: `DB.${group}[${index}].${entry.content ? 'content' : 'walkthrough'}` } });
        } else if (def.companion) {
            const index = (data.companions || []).findIndex(companion => companion.name === def.companion);
            if (index >= 0) facts.set(key, { text: `${data.companions[index].name}: ${data.companions[index].notes}`, source: { file: dataFile, locator: `DB.companions[${index}].notes` } });
        }
    }
    const generated = [];
    const listFact = (key, text, locator, topic) => { facts.set(key, { text, source: { file: dataFile, locator } }); generated.push({ ...topic, from: [key] }); };
    const sideQuests = data.sideQuests || [];
    if (sideQuests.length) {
        listFact('list:side-quests', `List of side quests (${sideQuests.length}): ${sideQuests.map(quest => `${quest.name}${quest.location ? ` (${quest.location})` : ''}`).join('; ')}.`, 'DB.sideQuests',
            { id: 'side-quests', title: 'Side quests', aliases: ['side quests', 'sidequests', 'side quest list', 'all side quests', 'list of side quests', 'optional quests'], minSpoiler: 'direct' });
        for (const location of [...new Set(sideQuests.map(quest => quest.location).filter(Boolean))]) {
            const here = sideQuests.filter(quest => quest.location === location);
            listFact(`list:side-quests:${location}`, `List of side quests in ${location}: ${here.map(quest => `${quest.name}${quest.giver ? ` (given by ${quest.giver})` : ''}`).join('; ')}.`, 'DB.sideQuests',
                { id: `side-quests-${slug(location)}`, title: `Side quests in ${location}`, aliases: [`side quests in ${location}`, `side quests at ${location}`, `quests in ${location}`, `quests at ${location}`, `${location} side quests`, `${location} quests`, `quest in ${location}`, `quest at ${location}`, `quests are in ${location}`, `side quests are in ${location}`, `quests are there in ${location}`, `side quests are there in ${location}`, `quests available in ${location}`], minSpoiler: 'direct' });
        }
    }
    const mainQuests = data.mainQuest || [];
    if (mainQuests.length) listFact('list:main-quest', `List of main quest steps (${mainQuests.length}): ${mainQuests.map((quest, index) => `${index + 1}. ${quest.title || quest.name}`).join('; ')}.`, 'DB.mainQuest',
        { id: 'main-quest', title: 'Main quest steps', aliases: ['main quest', 'main quest steps', 'main quest list', 'main story quests', 'story quests', 'main storyline'], minSpoiler: 'direct' });
    const virtueQuests = data.virtueQuests || [];
    if (virtueQuests.length) listFact('list:virtue-quests', `List of Forge of Virtue quests (${virtueQuests.length}): ${virtueQuests.map((quest, index) => `${index + 1}. ${quest.title || quest.name}`).join('; ')}.`, 'DB.virtueQuests',
        { id: 'virtue-quests', title: 'Forge of Virtue quests', aliases: ['virtue quests', 'forge quests', 'isle of fire quests', 'isle of fire steps', 'forge of virtue steps', 'forge of virtue walkthrough'], minSpoiler: 'direct' });
    for (const type of [...new Set((data.equipment || []).map(item => item.type))]) {
        const word = type.toLowerCase();
        const items = (data.equipment || []).filter(item => item.type === type || (word !== 'armour' && new RegExp(`\\b${word}\\b`, 'i').test(item.effect)));
        listFact(`list:equipment:${type}`, `List of equipment of type ${type}: ${items.map(item => `${item.name} (${item.effect}${item.type === type ? '' : `; type ${item.type}`})`).join('; ')}.`, 'DB.equipment',
            { id: `equipment-${slug(type)}`, title: `${type} equipment`, aliases: overlay.equipmentTypeAliases?.[type] || [], minSpoiler: 'balanced', answers: ['explanation', 'use', 'location'] });
    }
    const shrineLines = [...groups.values()].filter(group => group.type === 'shrine' && /^Shrine of /i.test(group.name) && group.details.length);
    if (shrineLines.length) listFact('list:shrines', `List of virtue shrines and mantras:\n${shrineLines.map(group => `${group.name}: ${group.details.join('; ')}.`).join('\n')}`, 'ULTIMA7_MARKERS (shrines)',
        { id: 'shrines', title: 'Virtue shrines and mantras', aliases: ['mantras', 'shrine mantras', 'virtue shrines', 'the shrines', 'all shrines', 'list of mantras', 'virtue mantras'], answers: ['explanation', 'use', 'location'] });
    for (const [key, fact] of facts) if (key.startsWith('list:shrines')) fact.source.file = 'guides/js/Ultima7Markers.js';
    const specs = [...(overlay.topics || []), ...generated.map(topic => ({ relation: 'explanation', answers: ['explanation', 'hint', 'location'], ...topic }))]
        // A topic that is the only record of its subject is a question-and-answer entry: naming it alone answers it.
        .map(topic => ({ scope: 'ultima7', ...(topic.entityId ? {} : { kind: 'qa' }), ...topic, overlayFile: 'guides/data/assistant/ultima7.json' }));
    records.push(...buildTopicRecords('ultima7', specs, facts));
    // Story roles (suspect, victim, leader, member) attach to the existing subject and quote their source lines verbatim. The atlas
    // line of each named person is a fact of its own ("atlas:<name>"); the guide's quest sentences come from the overlay facts.
    for (const person of atlasNpcs.values()) if (person.details.length)
        facts.set(`atlas:${person.name}`, { text: `${person.name}: ${person.details.join('; ')}.`, minSpoiler: 'balanced',
            source: { file: 'guides/js/Ultima7Markers.js', locator: `ULTIMA7_MARKERS[${person.indexes.slice(0, 4).join(',')}]` } });
    // Reviewed research can supply explicit narrative facets as well as profiles.
    for (const entry of (overlay.research || []).filter(entry => entry.text && entry.sources?.length))
        facts.set(`research:${entry.id}`, { text: entry.text, minSpoiler: entry.minSpoiler || 'gentle',
            source: { file: entry.sources[0].url, locator: entry.sources.map(source => source.label).join('; '), review: 'external-research', references: entry.sources.map(source => ({ ...source })) } });
    for (const fact of facts.values()) fact.source.review ||= 'extracted';
    records.push(...buildStoryRecords('ultima7', (overlay.stories || []).map(definition => ({ ...definition, overlayFile: 'guides/data/assistant/ultima7.json' })), facts));
    // Narrative facets (identity, event, cause, method, outcome, sequence, relationship, purpose, summary): each joins one to four source facts.
    records.push(...buildNarrativeRecords('ultima7', (overlay.narratives || []).map(definition => ({ ...definition, overlayFile: 'guides/data/assistant/ultima7.json' })), facts));
    for (const record of records) {
        if (record.kind === 'equipment') {
            record.possessionFact = `${record.entityId}:possessed`;
            record.acquisitionFact = `${record.entityId}:acquired`;
        } else if (record.kind === 'companion') {
            record.partyFact = `${record.entityId}:in-party`;
        }
    }
    return records;
}

export async function createUltima7Assistant({ data, questRoutes = {}, markers = [] }) {
    const response = await fetch(new URL('../../../data/assistant/ultima7.json', import.meta.url));
    if (!response.ok) throw new Error('The local Ultima VII knowledge file could not be loaded.');
    const overlay = await response.json();
    const records = buildUltima7Records(data, overlay, questRoutes, markers);
    const assistant = createAssistant({ gameId: 'ultima7', records, getProgress: () => [], editions: ['forge of virtue'] });
    assistant.describeContext = (key, spoiler) => {
        const record = records.find(record => record.id === `${ultima7QuestId(key)}:hint`);
        return record ? authorize(record, spoiler) : null;
    };
    return assistant;
}
