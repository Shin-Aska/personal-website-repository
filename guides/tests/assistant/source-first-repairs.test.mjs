import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge, attachKnowledgeEmbeddings} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {predictIntentHead} from '../../js/assistant/intent-head.js';
import {parseSourceRequestFrame} from '../../js/assistant/request-frame.js';

const read = file => JSON.parse(fs.readFileSync(new URL(file, import.meta.url)));
const vectors = read('./fixtures/source-first-repair-query-vectors.json').vectors;
const profile = read('../../local-assistant/intent/profile.json');
const head = read('../../local-assistant/intent/head.json').head;
const catalog = read('../../data/assistant/consultation-catalog.json');
const vector = text => { assert.ok(Array.isArray(vectors[text]), `Exact input must exist in the fixture: ${JSON.stringify(text)}`); return vectors[text]; };

function fixture(game, {cached = true} = {}) {
    const knowledge = attachKnowledgeEmbeddings(buildKnowledge(game, allRecords[game], read(`../../data/assistant/knowledge/${game}.json`)),
        read(`../../data/assistant/knowledge/${game}-embeddings.json`), profile);
    assert.deepEqual(knowledge.issues, []);
    const source = createAssistant({gameId: game, records: knowledge.sourceRecords, fallback: null});
    const assistant = createConversationAssistant({gameId: game, records: knowledge.records, knowledge, catalog, assistant: source,
        thresholds: profile.thresholds,
        classify: cached ? async text => predictIntentHead(head, vector(text)) : async () => [],
        encode: cached ? async text => vector(text) : async () => { throw Error('Encoder unavailable'); }});
    const ask = async q => {
        const reply = await assistant.answerAsync(q);
        assert.deepEqual(reply.actions, [], q); assert.deepEqual(reply.stateChanges, [], q);
        return reply;
    };
    return {assistant, ask};
}
const locators = reply => (reply.sources || []).map(source => source.locator);

test('The Old Dungeon key, vents and escort keep their own complete source children across the dialogue', async () => {
    const {assistant, ask} = fixture('alqadim');
    let reply = await ask('Where does the Old Dungeon hide its first-room key?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /hidden key behind a boulder in the first room/);
    assert.deepEqual(locators(reply), ['DB.chapters[11].required[id=ch12_2]']);
    reply = await ask('What hazards does the running advice there tell me to time?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Time your run past the poison and flame vents/);
    assert.deepEqual(locators(reply), ['DB.chapters[11].required[id=ch12_3]']);
    reply = await ask('Who is the cyclops to be escorted, and where should I take him?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /escort the cyclops Pangar-Bek to the dungeon exit/);
    assert.ok(locators(reply).includes('DB.chapters[11].required[id=ch12_4]'));
    reply = await ask('Give me the exact delay in seconds between those vent bursts.');
    assert.notEqual(reply.decision, 'answer', reply.text);
    assistant.destroy();
});

test('Containment reads only an inanimate its; a document actor yields only its trailing place reference', () => {
    const owned = parseSourceRequestFrame('Where does the Old Dungeon hide its first-room key?');
    assert.equal(owned.subjectText, 'first-room key in the Old Dungeon');
    for (const q of ['Where does the Old Dungeon hide his first-room key?', 'Where does Bonn hide her fragment?'])
        assert.ok(!/\bin\b/.test(parseSourceRequestFrame(q)?.subjectText || ''), q);
    const advice = parseSourceRequestFrame('What hazards does the running advice there tell me to time?');
    assert.equal(advice.subjectText, 'there');
    assert.equal(advice.fields[0].sourceActorText, 'the running advice there');
    assert.equal(parseSourceRequestFrame('What hazards does the running advice tell me to time?').subjectText, null);
});

test('A trailing order adverb leaves the carried crystal reference intact through price, recipient and reward', async () => {
    const {assistant, ask} = fixture('ultima7');
    let reply = await ask("In Brion's orrery quest, which adventurer sells the special crystal?");
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Addom/);
    reply = await ask('What should I pay for the crystal, and who gets it afterward?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /20 gold/); assert.match(reply.text, /give it to Brion/);
    reply = await ask('What outcome does the reward field list for finishing that errand?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Brion activates the orrery/);
    assert.deepEqual(locators(reply), ['DB.sideQuests[10].reward']);
    assert.notEqual((await ask('Does the guide say that crystal is quartz?')).decision, 'answer');
    assistant.destroy();
    const frame = parseSourceRequestFrame('Who gets it afterward?');
    assert.deepEqual(frame.fields[0].objectTexts, ['it']); assert.equal(frame.fields[0].orderText, 'afterward');
});

test('An approached place binds a route record as its destination, but an unknown place does not', async () => {
    const {assistant, ask} = fixture('albion');
    const reply = await ask('Lay out the two documented approaches for reaching Toronto.');
    assert.equal(reply.decision, 'answer');
    for (const value of ['Ohl', 'Jewel', 'stones to coastline then south', 'cave entrance']) assert.ok(reply.text.includes(value), reply.text);
    assert.deepEqual(locators(reply), ['QUEST_HINTS["umajo"]["find-path"]']);
    assistant.destroy();
    const unknown = fixture('albion');
    assert.notEqual((await unknown.ask('Lay out the two documented approaches for reaching the radioactive amber citadel.')).decision, 'answer');
    unknown.assistant.destroy();
    const routes = parseSourceRequestFrame('Lay out the two documented approaches for reaching Toronto.');
    assert.equal(routes.subjectText, 'Toronto');
    assert.deepEqual(routes.fields[0].objectTexts, ['Toronto']); assert.equal(routes.fields[0].objectRole, 'destination');
});

test('Bare that/its references and the typed maintenance date answer UAlbertaBot follow-ups', async () => {
    const records = read('./evidence/conversation-starcraft-source-records.json');
    const knowledge = attachKnowledgeEmbeddings(buildKnowledge('starcraft', records, read('../../data/assistant/knowledge/starcraft.json')),
        read('../../data/assistant/knowledge/starcraft-embeddings.json'), profile);
    const make = () => createConversationAssistant({gameId: 'starcraft', records: knowledge.records, knowledge,
        assistant: createAssistant({gameId: 'starcraft', records: knowledge.sourceRecords, fallback: null}), thresholds: profile.thresholds,
        classify: async text => predictIntentHead(head, vector(text)), encode: async text => vector(text)});
    const first = 'In the reviewed UAlbertaBot instructions, is execution through a client program or a module library?';
    let assistant = make();
    assert.equal((await assistant.answerAsync(first)).decision, 'answer');
    let reply = await assistant.answerAsync('What limitation does that impose on AUTO_RESTART across games?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /only for the first game after starting that EXE/); assert.match(reply.text, /limiting AUTO_RESTART/);
    reply = await assistant.answerAsync('From when does the README say active maintenance stopped, and how should its toolchain guidance be treated?');
    assert.equal(reply.decision, 'answer');
    for (const value of ['not been actively maintained since early 2021', 'documented historical instructions', 'rather than assuming current toolchain support'])
        assert.ok(reply.text.includes(value), reply.text);
    assistant.destroy();
    assistant = make();
    assert.notEqual((await assistant.answerAsync('What limitation does that impose on AUTO_RESTART across games?')).decision, 'answer');
    assistant.destroy();
    assistant = make();
    await assistant.answerAsync(first);
    assert.notEqual((await assistant.answerAsync('From when does the README say active development stopped?')).decision, 'answer');
    assistant.destroy();
    assert.deepEqual(parseSourceRequestFrame('From when does the README say active maintenance stopped?').fields.map(value => [value.key, value.selectors]),
        [['limitations', ['maintenance']]]);
});

test('Possessive topics and reference kind nouns keep Honor meditation and the corrected Humility shrine apart', async () => {
    const {assistant, ask} = fixture('ultima5');
    await ask('Who supplies the Honor mantra, and what condition should I meet before asking?');
    let reply = await ask('For that shrine’s meditation, which word do I use and how long should I meditate?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /SUMM for three cycles/);
    assert.deepEqual(locators(reply), ['ultima5GrandQuestChapters objective=shrine-honor.steps[1]']);
    reply = await ask('Correction—I am asking about Humility’s completion bonus now: what attributes does that shrine add?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /no attribute bonus/);
    assert.deepEqual(locators(reply), ['ultima5GrandQuestChapters objective=shrine-humility.steps[3]']);
    assert.notEqual((await ask('Is the floor of the Humility shrine granite or basalt?')).decision, 'answer');
    assistant.destroy();
    const other = fixture('ultima5');
    await other.ask('Who supplies the Honor mantra, and what condition should I meet before asking?');
    assert.notEqual((await other.ask('Correction—I am asking about Radiance’s completion bonus now: what attributes does that shrine add?')).decision, 'answer');
    other.assistant.destroy();
});

test('A corrected trade owner after "I meant is" replaces the previous trade without carrying its input', async () => {
    const opening = 'Where do I meet Ybarra for his map piece, and what does he accept in exchange?';
    const {assistant, ask} = fixture('ultima6');
    await ask(opening);
    const reply = await ask('Actually, the next trade I meant is Morchella’s. Where is she, and what should I bring for her shard?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /east of Serpent's Hold/); assert.match(reply.text, /MAGIC SHIELD/);
    assert.doesNotMatch(reply.text, /\bfood\b/i);
    assert.deepEqual(locators(reply), ['gameData.quests[1].sections[2].steps[4]']);
    assistant.destroy();
    const other = fixture('ultima6');
    await other.ask(opening);
    assert.notEqual((await other.ask('Actually, the next trade I meant is Radiance’s. Where is she, and what should I bring for her shard?')).decision, 'answer');
    other.assistant.destroy();
});

test('A topic-mode burner field keeps the balloon task while the plans are the use input', async () => {
    const turns = ['Where should I look for the balloon plans, including the coordinates?',
        'For the balloon cloth, how much spidersilk is needed, and who turns it into thread and cloth?'];
    const {assistant, ask} = fixture('ultima6');
    for (const q of turns) assert.equal((await ask(q)).decision, 'answer', q);
    const reply = await ask('Once every component is in my inventory, what do I do with the plans, and what burner items must I collect?');
    assert.equal(reply.decision, 'answer');
    for (const value of ['rope', 'large pot', 'burner', 'USE the plans', 'once all parts are in your inventory']) assert.ok(reply.text.includes(value), reply.text);
    assert.deepEqual(locators(reply), ['gameData.quests[2].sections[2].steps[3]']);
    assistant.destroy();
    const other = fixture('ultima6');
    for (const q of turns) await other.ask(q);
    assert.notEqual((await other.ask('Once every component is in my inventory, what do I do with the plans, and what crystal items must I collect?')).decision, 'answer');
    other.assistant.destroy();
    const frame = parseSourceRequestFrame('Once every component is in my inventory, what do I do with the plans, and what burner items must I collect?');
    assert.deepEqual(frame.fields.map(value => [value.key, value.selectors, value.objectTexts, value.objectRole, value.subjectMode]),
        [['use', [], ['the plans'], 'input', undefined], ['prerequisites', ['materials'], ['burner'], 'object', 'topic']]);
});

test('An after/beyond anchor is proved only by the immediately previous step of the same source list', async () => {
    const run = async (game, turns) => {
        const {assistant, ask} = fixture(game);
        const replies = [];
        for (const q of turns) replies.push(await ask(q));
        assistant.destroy();
        return replies;
    };
    const faulinei = ['For the Faulinei expedition, who teaches the dungeon word after Malik points me onward, and what is the word?',
        'I mean summoning him at the Lycaeum next: where do I stand, and what do I shout?'];
    let replies = await run('ultima5', [...faulinei, 'After shouting his name, when should I use the Shard of Falsehood?']);
    assert.equal(replies[2].decision, 'answer'); assert.match(replies[2].text, /Wait one turn, then use the Shard of Falsehood when Faulinei stands on the flame/);
    assert.deepEqual(locators(replies[2]), ['ultima5GrandQuestChapters objective=shadow-faulinei.steps[3]']);
    replies = await run('ultima5', [...faulinei, 'Before shouting his name, when should I use the Shard of Falsehood?']);
    assert.notEqual(replies[2].decision, 'answer');
    replies = await run('ultima5', [faulinei[0], 'After shouting his name, when should I use the Shard of Falsehood?']);
    assert.notEqual(replies[1].decision, 'answer');
    const sceptre = ['Why should I clear out the Shadowlords before collecting the Sceptre?',
        'At Stonegate, what opens the central door, and what answer gets me past the demon?'];
    replies = await run('ultima5', [...sceptre, 'Beyond that door, how should I cross the pits and trapdoors to pick it up?']);
    assert.equal(replies[2].decision, 'answer');
    for (const value of ['Magic Carpet', 'fire pits and trapdoors', 'take the Sceptre']) assert.ok(replies[2].text.includes(value), replies[2].text);
    assert.deepEqual(locators(replies[2]), ['ultima5GrandQuestChapters objective=regalia-sceptre.steps[2]']);
    for (const q of ['Beyond that window, how should I cross the pits and trapdoors to pick it up?',
        'Beyond that door, how should I cross the pits and trapdoors to sell it?'])
        assert.notEqual((await run('ultima5', [...sceptre, q]))[2].decision, 'answer', q);
});

test('A wanted replacement names its person for recruitment, but only one with a recruitment record', async () => {
    const {assistant, ask} = fixture('ultima5');
    const reply = await ask('I want Julia as the next replacement. Where do I recruit her?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Empath Abbey and recruit Julia upstairs/);
    assert.deepEqual(locators(reply), ['ultima5GrandQuestChapters objective=opening-party.steps[2]']);
    assistant.destroy();
    const other = fixture('ultima5');
    assert.notEqual((await other.ask('I want Lord British as the next replacement. Where do I recruit him?')).decision, 'answer');
    other.assistant.destroy();
});

test('A reference noun among alternatives answers the SCHNAIL updates choice directly, but never without a grounded focus', async () => {
    const records = read('./evidence/conversation-starcraft-source-records.json');
    const knowledge = attachKnowledgeEmbeddings(buildKnowledge('starcraft', records, read('../../data/assistant/knowledge/starcraft.json')),
        read('../../data/assistant/knowledge/starcraft-embeddings.json'), profile);
    const make = () => createConversationAssistant({gameId: 'starcraft', records: knowledge.records, knowledge,
        assistant: createAssistant({gameId: 'starcraft', records: knowledge.sourceRecords, fallback: null}), thresholds: profile.thresholds,
        classify: async text => predictIntentHead(head, vector(text)), encode: async text => vector(text)});
    const first = 'For SCHNAIL, what does the guide say can make the first launch take some time?';
    const updates = 'Are automatic updates described for the client alone, or for the game too?';
    let assistant = make();
    for (const q of [first, 'What setup work does the client itself perform on the game files?'])
        assert.equal((await assistant.answerAsync(q)).decision, 'answer', q);
    const reply = await assistant.answerAsync(updates);
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Automatic updates for both client and game/);
    assert.deepEqual(locators(reply), ['#schnail-setup ul > li:nth-child(2)']);
    assistant.destroy();
    assistant = make();
    assert.notEqual((await assistant.answerAsync(updates)).decision, 'answer');
    assistant.destroy();
    assistant = make();
    await assistant.answerAsync(first);
    assert.notEqual((await assistant.answerAsync('Are automatic updates described for the radio alone, or for the map too?')).decision, 'answer');
    assistant.destroy();
});

test('A place reference without a grounded context does not answer from a guessed chapter', async () => {
    const {assistant, ask} = fixture('alqadim', {cached: false});
    const reply = await ask('What hazards does the running advice there tell me to time?');
    assert.notEqual(reply.decision, 'answer', reply.text);
    assistant.destroy();
});

test('Starting party companions, healing recipient and the later mage replacement require proved role and phase facts', async () => {
    const {assistant, ask} = fixture('ultima5');
    let reply = await ask('Which companions should I keep at the beginning, and who needs healing before roadside combat?');
    assert.equal(reply.decision, 'answer');
    assert.match(reply.text, /Iolo and Shamino/); assert.match(reply.text, /heal Shamino/);
    assert.deepEqual(locators(reply), ['ultima5GrandQuestChapters objective=opening-party.steps[0]']);
    reply = await ask('I want Julia as the next replacement. Where do I recruit her?');
    assert.equal(reply.decision, 'answer');
    assert.deepEqual(locators(reply), ['ultima5GrandQuestChapters objective=opening-party.steps[2]']);
    reply = await ask('For the planned full roster, give me the six names and the later mage replacement for Julia.');
    assert.equal(reply.decision, 'answer');
    assert.match(reply.text, /Avatar, Iolo, Jaana, Julia, Gwenno, and Mariah/);
    assert.match(reply.text, /Johne can replace Julia/);
    assert.deepEqual(locators(reply), ['ultima5GrandQuestChapters objective=opening-party.steps[4]']);
    assert.notEqual((await ask('Which member of that recommended six has the highest Luck score?')).decision, 'answer');
    assistant.destroy();
    const control = fixture('ultima5', {cached: false});
    assert.notEqual((await control.ask('For the planned full roster, give me the six names and the later bard replacement for Julia.')).decision, 'answer');
    assert.notEqual((await control.ask('Which companions should I keep at the beginning, and who needs healing after roadside combat?')).decision, 'answer');
    control.assistant.destroy();
});

test('Bonn object-moving alternative and hidden fragment require the introduced person and proved action/output', async () => {
    const {assistant, ask} = fixture('ultima6');
    assert.equal((await ask('Where do I meet Ybarra for his map piece, and what does he accept in exchange?')).decision, 'answer');
    assert.equal((await ask('Actually, the next trade I meant is Morchella’s. Where is she, and what should I bring for her shard?')).decision, 'answer');
    const reply = await ask('With Bonn, am I trading something or moving an object? Where does his fragment hide?');
    assert.equal(reply.decision, 'answer');
    assert.match(reply.text, /Bonn's harpsichord on Dagger Isle/);
    assert.match(reply.text, /cellar ladder and fragment/);
    assert.deepEqual(locators(reply), ['gameData.quests[1].sections[2].steps[5]']);
    assert.notEqual((await ask('What is the weight in kilograms of Bonn’s harpsichord?')).decision, 'answer');
    assistant.destroy();
    const control = fixture('ultima6', {cached: false});
    assert.notEqual((await control.ask('With Bonn, am I singing a song or swimming a river? Where does his fragment hide?')).decision, 'answer');
    assert.notEqual((await control.ask('With Bonn, am I trading something or moving an object? Where does his crown hide?')).decision, 'answer');
    assert.notEqual((await control.ask('Where does his fragment hide?')).decision, 'answer');
    control.assistant.destroy();
});

test('Switching to the blue human lens resolves the Britannian lens without licensing a red human lens', async () => {
    const {assistant, ask} = fixture('ultima6');
    assert.equal((await ask('For the broken red gargoyle lens, where is it recovered and who handles the repair?')).decision, 'answer');
    const reply = await ask('Switch to the blue human lens: who makes that one, what do I bring, and which topics do I mention?');
    assert.equal(reply.decision, 'answer');
    for (const value of ['glass sword', 'Ephemerides in Moonglow', 'LENS and SWORD', 'blue Britannian lens'])
        assert.ok(reply.text.includes(value), reply.text);
    assert.deepEqual(locators(reply), ['gameData.quests[3].sections[1].steps[1]']);
    assistant.destroy();
    const control = fixture('ultima6', {cached: false});
    assert.notEqual((await control.ask('Switch to the red human lens: who makes that one, what do I bring, and which topics do I mention?')).decision, 'answer');
    control.assistant.destroy();
});

test('Vizier journal contents and Unlock Magic obstacles answer directly from reviewed fields while rejecting unproved qualifiers', async () => {
    const alqadim = fixture('alqadim');
    assert.equal((await alqadim.ask("Where should I search for the Vizier's conspiracy journal?")).decision, 'answer');
    const journal = await alqadim.ask('What evidence is that journal described as containing?');
    assert.equal(journal.decision, 'answer');
    assert.match(journal.text, /Vizier's betrayal/);
    assert.deepEqual(locators(journal), ['DB.keyItems[12].description']);
    alqadim.assistant.destroy();
    const alqadimControl = fixture('alqadim', {cached: false});
    await alqadimControl.ask("Where should I search for the Vizier's conspiracy journal?");
    assert.notEqual((await alqadimControl.ask('What secret map is that journal described as containing?')).decision, 'answer');
    alqadimControl.assistant.destroy();

    const u7 = fixture('ultima7');
    assert.equal((await u7.ask('What practical travel benefit does Mark & Recall provide?')).decision, 'answer');
    const unlock = await u7.ask('Which obstacles can Unlock Magic open that ordinary keys cannot handle?');
    assert.equal(unlock.decision, 'answer');
    assert.match(unlock.text, /magically sealed doors and containers/);
    assert.deepEqual(locators(unlock), ['DB.spells[3].description']);
    u7.assistant.destroy();
    const u7Control = fixture('ultima7', {cached: false});
    assert.notEqual((await u7Control.ask('Which obstacles can Unlock Magic open that skeleton keys cannot handle?')).decision, 'answer');
    assert.notEqual((await u7Control.ask('Which creatures can Unlock Magic open that ordinary keys cannot handle?')).decision, 'answer');
    u7Control.assistant.destroy();
});

test('Toronto return route and final-trip technician recommendation ground Joe Bernard without licensing unproved roles', async () => {
    const {assistant, ask} = fixture('albion');
    assert.equal((await ask('Lay out the two documented approaches for reaching Toronto.')).decision, 'answer');
    assert.equal((await ask('After the reactor scene, where does the guide tell me to take the footage?')).decision, 'answer');
    const reply = await ask('For the final trip, which technician does the guide recommend to reduce robot trouble?');
    assert.equal(reply.decision, 'answer');
    for (const value of ['Joe', 'Service Robot', 'electronics']) assert.ok(reply.text.includes(value), reply.text);
    assert.deepEqual(locators(reply), ['QUEST_HINTS["finale"]["bring-joe"]']);
    assert.notEqual((await ask('Has Joe already repaired the circuits in my playthrough?')).decision, 'answer');
    assistant.destroy();
    const control = fixture('albion', {cached: false});
    assert.notEqual((await control.ask('For the final trip, which pilot does the guide recommend to reduce robot trouble?')).decision, 'answer');
    assert.notEqual((await control.ask('For the final trip, which technician does the guide recommend to pilot the shuttle?')).decision, 'answer');
    control.assistant.destroy();
});

test('The Humility riddle identifies the villager from the reviewed Conor passage', async () => {
    const {assistant, ask} = fixture('ultima6');
    let reply = await ask('How do I answer Antonio riddle?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /CONOR/);
    reply = await ask('Who is the humble villager?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Conor/);
    assert.deepEqual(locators(reply), ['gameData.quests[0].sections[7].steps[1]']);
    reply = await ask('How do I get the Humility rune?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Antonio/);
    reply = await ask('How do I use the Humility mantra?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /LUM/);
    assistant.destroy();

    const control = fixture('ultima6', {cached: false});
    for (const question of ['Who is the arrogant villager?', 'Who is the humble king?'])
        assert.notEqual((await control.ask(question)).decision, 'answer', question);
    control.assistant.destroy();
});

test('Toronto return codes in order use the reviewed sequence without guessing other codes', async () => {
    const {assistant, ask} = fixture('albion');
    let reply = await ask('What are Toronto return codes in order?');
    assert.equal(reply.decision, 'answer');
    assert.match(reply.text, /1001.*1712.*4312/);
    assert.deepEqual(locators(reply), ['QUEST_HINTS["toronto-return"]["codes"]']);
    await ask('Where does the first one come from?');
    reply = await ask('And the reversed code-notes?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /4312/);
    reply = await ask('What do I do with the Toronto evidence?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Dji-Cantos/);
    assistant.destroy();

    const control = fixture('albion', {cached: false});
    for (const question of ['What are Toronto security codes in order?', 'What are Toronto return codes in reverse order?'])
        assert.notEqual((await control.ask(question)).decision, 'answer', question);
    control.assistant.destroy();
});

test('Compassion rune collection includes the return step and the keyword proof', async () => {
    const {assistant, ask} = fixture('ultima6');
    let reply = await ask('Where do I meet Ariana about the rune, and whose approval does she need?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Anya/);
    reply = await ask('Okay, where do I find her mother and what do I say to get that approval?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Blue Boar/);
    reply = await ask('How do I collect it once permission is sorted out?');
    assert.equal(reply.decision, 'answer');
    for (const phrase of ['Return to Ariana', 'confirm permission', 'Rune of Compassion', 'PERMISSION'])
        assert.ok(reply.text.includes(phrase), reply.text);
    assert.ok(locators(reply).includes('gameData.quests[0].sections[0].steps[2]'));
    assert.ok(locators(reply).includes('gameData.quests[0].sections[0].keywords[0].helper'));
    assert.notEqual((await ask('Exactly how old is Anya?')).decision, 'answer');
    assistant.destroy();
});

test('Ephemerides material follow-up stays bound to the lens source and named recipient', async () => {
    const {assistant, ask} = fixture('ultima6');
    let reply = await ask('How do I get the Britannian lens?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Ephemerides/);
    reply = await ask('Where is he?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Moonglow/);
    reply = await ask('What does he need?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /glass sword/);
    assert.deepEqual(locators(reply), ['gameData.quests[3].sections[1].steps[1]']);
    assert.notEqual((await ask('Who is his daughter?')).decision, 'answer');
    assistant.destroy();

    const control = fixture('ultima6', {cached: false});
    assert.notEqual((await control.ask('What does he need?')).decision, 'answer');
    const unrelated = await control.ask('What does Lord British need?');
    assert.ok(!/glass sword/i.test(unrelated.text), unrelated.text);
    control.assistant.destroy();
});

test('Drirr recruitment includes the reviewed method without asserting current party state', async () => {
    const {assistant, ask} = fixture('albion');
    let reply = await ask('How do I recruit Drirr?');
    assert.equal(reply.decision, 'answer');
    assert.match(reply.text, /festival murder/); assert.match(reply.text, /joins automatically/);
    assert.ok(locators(reply).includes('QUEST_HINTS["nakiridaani"]["recruit-drirr"]'));
    reply = await ask('What are his combat strengths?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /99 combat caps/);
    reply = await ask('Where do I get Iskai Lance?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Snird/);
    reply = await ask('What does the Iskai Lance do?');
    assert.equal(reply.decision, 'answer'); assert.match(reply.text, /Damage: 18/);
    assistant.destroy();

    const control = fixture('albion', {cached: false});
    assert.notEqual((await control.ask('Is Drirr in my party right now?')).decision, 'answer');
    control.assistant.destroy();
});
