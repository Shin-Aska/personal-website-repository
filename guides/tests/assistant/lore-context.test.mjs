import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant, parse } from '../../js/assistant/engine.js';
import { allRecords } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { buildResearchRecords } from '../../js/assistant/topics.js';

const records = allRecords.ultima7;
const make = input => createAssistant({ gameId: 'ultima7', records: input || records });
const balanced = { spoiler: 'balanced' };
const profile = name => `ultima7:research:${name}-identity:explanation`;
const purpose = name => `ultima7:narrative:${name}-purpose:purpose`;
const relationship = 'ultima7:narrative:time-lord-guardian-relationship:relationship';

function sourced(reply, id) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, [id]);
    assert.ok(reply.sources.length);
    assert.ok(reply.sources.every(source => source.review === 'external-research' && source.references.length));
    assert.match(reply.text, /outside research/);
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}

function unanswered(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}

for (const wording of ['What is a guardian?', 'Who is the Guardian?', 'Tell me about Guardian.'])
    test(`the reported lore question resolves the named subject: ${wording}`, () => {
        const bot = make();
        sourced(bot.answer('What is a timelord?', balanced), profile('time-lord'));
        const reply = sourced(bot.answer(wording), profile('guardian'));
        assert.match(reply.text, /hostile being from another dimension/);
        assert.deepEqual(reply.choices, []);
        assert.doesNotMatch(reply.text, /No guide subject|choose one only/);
    });

test('a pronoun follows the latest asked-about person, not a person mentioned in the answer', () => {
    const bot = make();
    sourced(bot.answer('What is a timelord?', balanced), profile('time-lord'));
    sourced(bot.answer('What does he want?'), purpose('time-lord'));
    sourced(bot.answer('Who is the Guardian?'), profile('guardian'));
    sourced(bot.answer('Who is he?'), profile('guardian'));
    const wants = sourced(bot.answer('What does he want?'), purpose('guardian'));
    assert.match(wants.text, /power and domination/);
    assert.doesNotMatch(wants.text, /free him/);
    sourced(bot.answer('Who is the Time Lord?'), profile('time-lord'));
    sourced(bot.answer('What does he want?'), purpose('time-lord'));
});

for (const text of ['How are they related?', 'What is their relationship?', 'What is the connection between them?'])
    test(`the two recent named subjects ground a relationship: ${text}`, () => {
        const bot = make();
        sourced(bot.answer('Who is the Time Lord?', balanced), profile('time-lord'));
        sourced(bot.answer('Who is the Guardian?'), profile('guardian'));
        const reply = sourced(bot.answer(text), relationship);
        assert.match(reply.text, /are opponents/);
        unanswered(bot.answer('Who is he?'));
    });

test('two independently answered subjects in one message can ground a plural follow-up', () => {
    const bot = make();
    const reply = bot.answer('Who is the Time Lord? Who is the Guardian?', balanced);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(new Set(reply.recordIds), new Set([profile('time-lord'), profile('guardian')]));
    sourced(bot.answer('How are they related?'), relationship);
});

test('a relationship requires two established topics, not names merely present in prose', () => {
    const bot = make();
    sourced(bot.answer('Who is the Guardian?', balanced), profile('guardian'));
    const reply = unanswered(bot.answer('How are they related?'));
    assert.match(reply.text, /Which two subjects/);
});

test('switching to a third subject replaces the old pair without inventing a new relationship', () => {
    const bot = make();
    bot.answer('Who is the Time Lord?', balanced);
    bot.answer('Who is the Guardian?');
    const iolo = bot.answer('Who is Iolo?');
    assert.equal(iolo.decision, 'answer', iolo.text);
    assert.deepEqual(iolo.recordIds, ['ultima7:companion:iolo:explanation']);
    const reply = unanswered(bot.answer('How are they related?'));
    assert.doesNotMatch(reply.text, /are opponents/);
});

test('guide-only restrictions survive the recent-subject relationship follow-up', () => {
    const bot = make();
    bot.answer('Who is the Time Lord?', balanced);
    unanswered(bot.answer('Using only the guide, who is the Guardian?'));
    const reply = unanswered(bot.answer('How are they related?'));
    assert.doesNotMatch(reply.text, /outside research:|are opponents/);
});

test('material restrictions survive plural relationship follow-ups', () => {
    for (const text of ['Who is the Guardian on Mars?', 'Who are the two Guardians?', 'Who is the Guardian in the SNES version?']) {
        const bot = make();
        bot.answer('Who is the Time Lord?', balanced);
        unanswered(bot.answer(text));
        unanswered(bot.answer('How are they related?'));
    }
});

test('guide-only descriptive searches do not suggest an outside-research profile', () => {
    const reply = unanswered(make().answer('Using only the guide, what is a champion?', balanced));
    assert.ok(!reply.choices.some(choice => choice.id === 'ultima7:character:avatar'));
});

test('reset and context changes clear the recent topic pair', () => {
    for (const action of [bot => bot.resetTopic(), bot => bot.activate('another-panel')]) {
        const bot = make();
        bot.answer('Who is the Time Lord?', balanced);
        bot.answer('Who is the Guardian?');
        action(bot);
        assert.match(unanswered(bot.answer('How are they related?')).text, /Which two subjects/);
    }
});

test('lowering the spoiler ceiling removes hidden subjects from recent-topic memory', () => {
    const bot = make();
    bot.answer('Who is the Time Lord?', balanced);
    bot.answer('Who is the Guardian?');
    bot.setPolicy('gentle');
    const lower = unanswered(bot.answer('How are they related?'));
    assert.doesNotMatch(lower.text, /Time Lord|Guardian|opponents/);
    bot.setPolicy('balanced');
    assert.match(unanswered(bot.answer('How are they related?')).text, /Which two subjects/);
});

test('Guardian names hidden at Gentle behave exactly like absent lore entries', () => {
    const without = records.filter(record => record.entityId !== 'ultima7:npc:guardian');
    for (const text of ['What is a guardian?', 'Who is the Guardian?'])
        assert.deepEqual(make().answer(text), make(without).answer(text));
});

test('newly introduced foundational lore has a sourced explanation of its own', () => {
    for (const [name, minimum] of [['Guardian', 'balanced'], ['Avatar', 'gentle'], ['Britannia', 'gentle']]) {
        const reply = sourced(make().answer(`What is ${name}?`, { spoiler: minimum }), profile(name.toLowerCase()));
        assert.ok(reply.recordIds.every(id => authorize(records.find(record => record.id === id), minimum)));
    }
});

test('related names are not evidence of a family link, species, motive or location', () => {
    for (const text of ['Who is the Guardian’s father?', 'Is the Guardian a Time Lord?',
        'Why does the Guardian hate the Time Lord?', 'Where is the Guardian?'])
        unanswered(make().answer(text, balanced));
});

const subject = { id: 'test:time-lord', entityId: 'test:time-lord', title: 'Time Lord', aliases: [],
    kind: 'npc', relation: 'explanation', scope: 'test', minSpoiler: 'gentle', requires: null,
    variants: { gentle: { text: 'The Time Lord opposes the Guardian.' } },
    source: { file: 'fixture', locator: 'profile', review: 'extracted' } };

test('a descriptive result never silently becomes the subject of a pronoun', () => {
    const bot = make([subject]);
    bot.answer('Who is the Time Lord?');
    const proposed = unanswered(bot.answer('What is a guardian?'));
    assert.ok(proposed.choices.some(choice => choice.id === subject.entityId));
    const follow = unanswered(bot.answer('Who is he?'));
    assert.match(follow.text, /not a confirmed match/);
    assert.ok(follow.choices.some(choice => choice.id === subject.entityId));
    const choice = follow.choices.find(choice => choice.id === subject.entityId);
    assert.equal(bot.answer(choice.label, { choiceId: choice.id, expectedRevision: choice.revision }).decision, 'answer');
});

test('the optional model cannot turn a proposed topic into an established subject', async () => {
    let calls = 0;
    const bot = createAssistant({ gameId: 'test', records: [subject], fallback: {
        state: { status: 'ready' }, epoch: 1, generate: async packet => { calls++; return packet.guard.frames[0]; },
    } });
    await bot.answerAsync('What is a guardian?');
    const reply = unanswered(await bot.answerAsync('Why does he oppose the Avatar?'));
    assert.ok(reply.choices.length);
    assert.equal(calls, 0);
});

test('research subject type supports pronouns while preserving its evidence label', () => {
    const source = buildResearchRecords('test', [{ id: 'lore-person', title: 'Orin', subjectKind: 'npc',
        text: 'Orin is a scholar.', sources: [{ label: 'Source', url: 'https://example.com/lore' }] }], 'fixture.json');
    const bot = make(source);
    bot.answer('Who is Orin?');
    sourced(bot.answer('Who is he?'), 'test:research:lore-person:explanation');
    assert.equal(authorize(source[0], 'gentle').kind, 'research');
    assert.equal(authorize(source[0], 'gentle').subjectKind, 'npc');
});

test('plural relationship wording is parsed separately from an inferred causal answer', () => {
    assert.deepEqual(parse('How are they related?').parts[0].narrative,
        { aspect: 'relationship', query: '', contextual: true, pair: true });
});
