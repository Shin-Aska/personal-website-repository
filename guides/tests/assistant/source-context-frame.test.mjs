import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {buildKnowledge,createKnowledgeRouter} from '../../js/assistant/knowledge.js';
import {sourceQuestionParts} from '../../js/assistant/language.js';

const read = path => JSON.parse(fs.readFileSync(new URL(path,import.meta.url)));
const records = {...allRecords,starcraft:read('./evidence/conversation-starcraft-source-records.json')};
const build = game => buildKnowledge(game,records[game],read(`../../data/assistant/knowledge/${game}.json`));
function fixture(game) {
    const source = createAssistant({gameId:game,records:records[game],fallback:null});
    const assistant = createConversationAssistant({gameId:game,records:records[game],knowledge:build(game),assistant:source,
        classify:async()=>[],encode:async()=>{throw new Error('Encoder unavailable');}});
    return {assistant,source};
}
const noEffects = reply => {assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);};

test('A desire preamble remains scope while each actual question retains its own subject', () => {
    const frame=sourceQuestionParts('I want the Grapple. Where is Lord Michael, and where does he retire?');
    assert.equal(frame.context,'i want the grapple');
    assert.deepEqual(frame.questions.map(q=>q.question),['where is lord michael','where does he retire']);
    assert.ok(frame.questions.every(q=>frame.parsed.parts.includes(q.part)));
    assert.equal(sourceQuestionParts('I want to know its age; where is it?'),null);
    assert.equal(sourceQuestionParts('I have the Grapple; where is Lord Michael?'),null);
});

test('One contextual requirements question returns the recorded required companion without claiming entry', async () => {
    const {assistant,source}=fixture('albion');
    const reply=await assistant.answerAsync("I'm planning the Kenget Kamulos trip. Who has to be in the party for me to get inside?");
    assert.equal(reply.decision,'answer',reply.text);
    assert.match(reply.text,/Khunag/);
    assert.match(reply.text,/cannot enter Kenget Kamulos without Khunag in the party/);
    assert.equal(reply.knowledge.parts.length,1);
    noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('Single and compound contexts retain lower-case unknown names, material and numeric qualifiers', async () => {
    for(const text of [
        "I'm planning the kenget kamulos trip on mars. Who has to be in the party?",
        'I want the radioactive Grapple. Where is Lord Michael, and where does he retire?',
        'I want the working Grapple. Where is Lord Michael?',
        'I want the setup Grapple. Where is Lord Michael?',
        'I want the different Grapple. Where is Lord Michael?',
        'I want the trip Grapple. Where is Lord Michael?',
        'I want the opening Grapple. Where is Lord Michael?',
        'I want 30 Grapples. Where is Lord Michael?',
        'I want the quantum turnip. Where is Lord Michael?',
        'For BWAPI in patch 9.99, what is it?',
        'For BWAPI, what is it? Use only the guide.'
    ]) {
        const game=text.includes('BWAPI')?'starcraft':text.includes('kamulos')?'albion':'ultima5';
        const {assistant,source}=fixture(game);const reply=await assistant.answerAsync(text);
        assert.notEqual(reply.decision,'answer',text);noEffects(reply);
        assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('Contextual pronouns retain unresolved material and exact-time restrictions until a fresh named request', async () => {
    for (const seed of ['Where is Lord Michael on mars?','Where is Lord Michael at exactly 13:00?']) {
        const {assistant}=fixture('ultima5');
        const rejected=await assistant.answerAsync(seed);
        assert.notEqual(rejected.decision,'answer',seed);
        const follow=await assistant.answerAsync('On a different setup point, where is he?');
        assert.notEqual(follow.decision,'answer',seed);noEffects(follow);
        const fresh=await assistant.answerAsync('Where is Lord Michael?');
        assert.equal(fresh.decision,'answer',fresh.text);assistant.destroy();
    }
});

test('Lord Michael governs schedule questions while the requested Grapple remains source scope', async () => {
    const {assistant,source}=fixture('ultima5');
    const reply=await assistant.answerAsync('I want the Grapple. Where can I find Lord Michael during the day, and where does he retire?');
    assert.equal(reply.decision,'answer',reply.text);
    assert.match(reply.text,/Empath Abbey/);assert.match(reply.text,/courtyard by day/);assert.match(reply.text,/northwest bedroom/);
    assert.equal(reply.knowledge.parts.length,2);noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('Reviewed item ownership distinguishes security storage and active inventory from acquisition', () => {
    const pistol=createKnowledgeRouter(build('albion')).plan('Where do I hide the Pistol before security?');
    assert.equal(pistol?.decision,'answer');assert.match(pistol.text,/wall cabinet on the service level/);
    assert.ok(pistol.knowledge.factIds.includes('hide-weapon'));noEffects(pistol);
    const hook=createKnowledgeRouter(build('ultima5')).plan('Where should I keep the Grapple?');
    assert.equal(hook?.decision,'answer');assert.match(hook.text,/active party’s inventory/);noEffects(hook);
});

test('An unresolved reference in the preamble cannot select another quest with the same object type', async () => {
    const {assistant}=fixture('ultima6');
    await assistant.answerAsync('How do I get Sherry to join?');
    await assistant.answerAsync('Who is quantum turnip?');
    const reply=await assistant.answerAsync('Once she is there, how do we get the rune back to the group?');
    assert.notEqual(reply.decision,'answer');assert.deepEqual(reply.sources,[]);noEffects(reply);assistant.destroy();
});

test('A metalinguistic preamble preserves the named pair and does not become a consultation goal', async () => {
    const {assistant,source}=fixture('ultima5');
    // This fixture has no encoder. The frozen native suite separately covers
    // the broader "each for" wording with actual packaged model inference.
    const reply=await assistant.answerAsync('I mixed up mantras and Words of Power. What are they for?');
    assert.equal(reply.decision,'answer',reply.text);
    assert.match(reply.text,/Mantras are used at the Shrines of Virtue/);assert.match(reply.text,/Words of Power unlock the dungeons/);
    noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('A documented route destination supports the following item and security questions without establishing entry', async () => {
    const {assistant,source}=fixture('albion');
    const access=await assistant.answerAsync('How do I enter the COM room?');
    assert.equal(access.decision,'answer',access.text);assert.match(access.text,/1042/);
    const item=await assistant.answerAsync("Once I'm in there, how do I get the Pistol and Canisters?");
    assert.equal(item.decision,'answer',item.text);assert.match(item.text,/damaged console/);
    const storage=await assistant.answerAsync('Where do I hide them before security?');
    assert.equal(storage.decision,'answer',storage.text);assert.match(storage.text,/wall cabinet on the service level/);
    for(const reply of [access,item,storage])noEffects(reply);
    assert.equal(source.inspect().claimCount,0);
    assert.notEqual((await assistant.answerAsync('Are my Pistol and Canisters hidden in that cabinet right now?')).decision,'answer');
    assistant.destroy();
});
