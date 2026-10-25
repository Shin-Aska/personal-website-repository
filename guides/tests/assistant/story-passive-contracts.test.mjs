// Role, voice and event-memory contracts. Classifier fixtures are adversarial
// structural inputs; they are not evidence of native model accuracy.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, storyQuestion, detectIntent } from '../../js/assistant/language.js';
import { createAssistant } from '../../js/assistant/engine.js';
import { createConversationAssistant } from '../../js/assistant/dialogue.js';
import { buildStoryRecords } from '../../js/assistant/topics.js';
import { allRecords } from './load-records.mjs';

const event = 'ultima7:quest:the-trinsic-murders';
const victim = 'ultima7:story:trinsic-murder-victims:victim';
const killer = 'ultima7:story:trinsic-killers:perpetrator';
const suspect = 'ultima7:story:trinsic-suspect:suspect';
const direct = { spoiler: 'direct', fullAnswersOnly: true };
const panel = { ...direct, contextId: event, entityIds: [event] };
const quote = allRecords.ultima7.find(record => record.id === victim).variants.direct.text;
function make(wrapped, records = allRecords.ultima7, gameId = 'ultima7') {
    const base = createAssistant({ gameId, records, getProgress: () => [], fallback: null });
    const assistant = wrapped ? createConversationAssistant({ assistant: base, gameId, records,
        // A mistaken learned comparison label must not change a typed role or
        // send an event-context statement into the recommendation controller.
        classify: async () => [{ label: 'comparison', score: 0.7 }, { label: 'acquisition', score: 0.2 }],
        thresholds: { minScore: 0, minMargin: 0 } }) : base;
    return { base, assistant };
}
function noFact(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    assert.deepEqual(reply.stateChanges, []);
}
function role(reply, expected, label, names) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, [expected]);
    const line = reply.text.match(new RegExp(`^${label}: ([^\\n]+)$`, 'm'));
    assert.ok(line, reply.text);
    assert.deepEqual(line[1].split(', '), names);
    assert.ok(reply.text.includes(quote), 'keep the complete reviewed paragraph, not just selected names');
    assert.match(reply.text, /Not in this guide — from outside research:/);
    assert.ok(reply.text.indexOf('outside research:') < reply.text.indexOf(`${label}:`), 'the role lead keeps its source attribution');
    assert.ok(reply.sources.every(source => source.review === 'external-research' && source.index?.review === 'authored-index'));
    assert.deepEqual(reply.stateChanges, []);
}

test('be/get/perfect passive questions select the victim role before acquisition or remedy cues', () => {
    for (const text of ['Who got murdered?', 'Who got killed', 'Who gets murdered?', 'Who gets killed?', 'Who does get killed?',
        'Who was killed?', 'Who were murdered?', 'Who has been murdered?', 'Who had been killed?']) {
        assert.deepEqual(storyQuestion(text), { role: 'victim', query: '', crime: true }, text);
        assert.equal(detectIntent(text), 'story', text);
        assert.equal(parse(text).parts[0].intent, 'story', text);
        assert.equal(parse(text).parts[0].report, false);
    }
    for (const text of ['Who did not get killed?', "Who wasn't murdered?", 'Who has never been killed?']) {
        assert.equal(storyQuestion(text).role, 'victim');
        assert.match(storyQuestion(text).query, /not|never/);
    }
    assert.equal(storyQuestion('Who got Vale killed?'), null, 'causative get is not a passive recipient');
    assert.equal(storyQuestion('How do I kill Vale?'), null, 'gameplay remains gameplay');
    assert.equal(detectIntent('How do I get the sword?'), 'acquisition');
    assert.equal(parse('I got the sword').correction, true, 'a possession report is not a victim question');
});

test('voice preserves the actor/recipient distinction and every added restriction', () => {
    for (const [text, expected] of [
        ['Who was murdered by Hook?', 'victim'], ['Who did Hook murder?', 'victim'],
        ['Who murdered Christopher?', 'perpetrator'], ['Who was Christopher murdered by?', 'perpetrator'],
        ['Who did Christopher get murdered by?', 'perpetrator'], ['Who got killed by whom?', 'participants']
    ]) assert.equal(storyQuestion(text).role, expected, text);
    const framed = storyQuestion('Who got murdered in Harbor on Mars in Serpent Isle with 2 knives?');
    for (const word of ['harbor', 'mars', 'serpent', 'isle', '2', 'knives']) assert.ok(framed.query.includes(word), word);
});

for (const wrapped of [false, true]) test(`${wrapped ? 'shared dialogue' : 'source engine'} cold selected quest answers passive victims, never perpetrators`, async () => {
    for (const text of ['who got murdered?', 'who got killed', 'who was murdered?', 'who were killed?']) {
        const { base, assistant } = make(wrapped);
        const reply = await assistant.answerAsync(text, panel);
        role(reply, victim, 'Victims', ['Inamo', 'Christopher']);
        assert.doesNotMatch(reply.text, /^Victims:.*(?:Hook|Forskis)$/m);
        assert.equal(base.inspect().claimCount, 0);
        if (wrapped) {
            assert.equal(reply.dialoguePacket.story.role, 'victim');
            assert.equal(reply.routeOrigin, 'source-story');
            assert.equal(reply.modelIntent, 'comparison');
            assert.equal(reply.dialoguePacket.canonicalQuestion, undefined);
        }
    }
});

for (const wrapped of [false, true]) test(`${wrapped ? 'shared dialogue' : 'source engine'} warm role switches keep the event and an unsupported explanation does not fabricate one`, async () => {
    const { base, assistant } = make(wrapped);
    role(await assistant.answerAsync('who got murdered?', panel), victim, 'Victims', ['Inamo', 'Christopher']);
    role(await assistant.answerAsync('who is the murderer?', panel), killer, 'Killers', ['Hook', 'Forskis']);
    role(await assistant.answerAsync('who got killed?', panel), victim, 'Victims', ['Inamo', 'Christopher']);
    noFact(await assistant.answerAsync('Why did they die?', panel));
    role(await assistant.answerAsync('who were the victims?', panel), victim, 'Victims', ['Inamo', 'Christopher']);
    const paired = await assistant.answerAsync('who got killed by whom?', panel);
    assert.equal(paired.decision, 'answer');
    assert.deepEqual(new Set(paired.recordIds), new Set([killer, victim]));
    assert.match(paired.text, /^Killers: Hook, Forskis\nVictims: Inamo, Christopher$/m);
    noFact(await assistant.answerAsync('who killed him?', panel), 'two named victims cannot become one personal referent');
    assert.equal(base.inspect().claimCount, 0);
});

for (const wrapped of [false, true]) test(`${wrapped ? 'shared dialogue' : 'source engine'} an exact event statement changes conversational scope without reporting progress`, async () => {
    const other = allRecords.ultima7.find(record => /infiltrating/i.test(record.title))?.entityId;
    assert.ok(other);
    const opts = { ...panel, contextId: 'other-selected-quest', entityIds: [other] };
    const { base, assistant } = make(wrapped);
    const ack = await assistant.answerAsync('I am in the Trinsic murders', opts);
    noFact(ack);
    assert.equal(ack.conversationContext.entityId, event);
    assert.match(ack.text, /conversation topic/);
    role(await assistant.answerAsync('who got murdered?', opts), victim, 'Victims', ['Inamo', 'Christopher']);
    role(await assistant.answerAsync('who is the murderer?', opts), killer, 'Killers', ['Hook', 'Forskis']);
    assert.equal(base.inspect().claimCount, 0);
});

test('context qualifiers and guide-only boundaries survive passive/noun paraphrases', async () => {
    for (const statement of ['I am in the Trinsic murders in Serpent Isle', 'I am in the Trinsic murders on Mars', 'Guide only: I am in the Trinsic murders']) {
        const { base, assistant } = make(true);
        noFact(await assistant.answerAsync(statement, panel));
        noFact(await assistant.answerAsync('who got killed?', panel));
        noFact(await assistant.answerAsync('who were the victims?', panel));
        assert.equal(base.inspect().claimCount, 0);
    }
    const { assistant } = make(true);
    noFact(await assistant.answerAsync('Guide only: who got murdered in the Trinsic Murders?', panel));
    noFact(await assistant.answerAsync('who got killed?', panel));
    const clue = await assistant.answerAsync('Guide only: who is the suspect in the Trinsic Murders?', panel);
    assert.deepEqual(clue.recordIds, [suspect]);
    assert.match(clue.text, /man with a hook/);
    assert.doesNotMatch(clue.text, /^Killers:|^Victims:|outside research/m);
});

test('unknown people/events and an accusation cannot revive the older selected homicide event', async () => {
    for (const text of ['Who killed Finnigan?', 'Who got killed in the Moonstone Harbor massacre?', 'Who is Zaxivar Unrecorded?']) {
        const { assistant } = make(true);
        role(await assistant.answerAsync('Who is the murderer?', panel), killer, 'Killers', ['Hook', 'Forskis']);
        noFact(await assistant.answerAsync(text, panel));
        noFact(await assistant.answerAsync('who got murdered?', panel));
        noFact(await assistant.answerAsync('who is the murderer?', panel));
        role(await assistant.answerAsync('Who were the victims in the Trinsic Murders?', panel), victim, 'Victims', ['Inamo', 'Christopher']);
    }
    const { assistant } = make(true);
    await assistant.answerAsync("Who was the victim in Blorn's Accusations?", panel);
    noFact(await assistant.answerAsync('who got murdered?', panel));
    noFact(await assistant.answerAsync('who killed Lap-Lem?', panel));
});

test('prevented, attempted, alleged, or negated deaths do not become confirmed passive victims', async () => {
    for (const text of ['In Harbor, Vale survived the attempted murder.', 'In Harbor, the planned murder of Vale was prevented.',
        'In Harbor, Vale was not killed.', 'In Harbor, Vale was reportedly killed.', 'In Harbor, Vale was allegedly murdered.']) {
        const definitions = [{ id: 'harbor-victim', entityId: 'fixture:harbor', title: 'Harbor Murder', aliases: ['Harbor'], kind: 'quest',
            minSpoiler: 'direct', overlayFile: 'fixture/roles.json', from: ['claim'], story: { role: 'victim', people: ['Vale'], context: ['Harbor'] } }];
        const facts = new Map([['claim', { text, source: { file: 'fixture/story.txt', locator: 'claim', review: 'extracted' } }]]);
        const records = buildStoryRecords('ultima7', definitions, facts);
        assert.equal(records.length, 1);
        const { assistant } = make(false, records);
        noFact(await assistant.answerAsync('who got murdered?', direct));
    }
    const { assistant } = make(true, allRecords.albion, 'albion');
    const maini = allRecords.albion.find(record => record.id === 'albion:narrative:maini-summary:summary').entityId;
    const options = { ...direct, contextId: 'maini', entityIds: [maini] };
    assert.equal((await assistant.answerAsync('Summarize Maini', options)).decision, 'answer');
    noFact(await assistant.answerAsync('who got killed?', options));
    noFact(await assistant.answerAsync('who killed Herras?', options));
});
