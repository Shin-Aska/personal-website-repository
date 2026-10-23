// Real-data regressions for the owner's Inamo conversation. Research remains
// distinct from the guide's original, anonymous suspect clue.
// Run: node --test guides/tests/assistant/story-inamo.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const records = allRecords.ultima7;
const make = (input = records) => createAssistant({ gameId: 'ultima7', records: input });
const direct = { spoiler: 'direct' };
const killer = 'ultima7:story:trinsic-killers:perpetrator';
const victim = 'ultima7:story:trinsic-murder-victims:victim';
const suspect = 'ultima7:story:trinsic-suspect:suspect';

function researchAnswer(reply, ids) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual([...reply.recordIds].sort(), [...ids].sort());
    assert.match(reply.text, /Not in this guide — from outside research:/);
    for (const name of ['Inamo', 'Christopher', 'Hook', 'Forskis']) assert.ok(reply.text.includes(name));
    assert.doesNotMatch(reply.text, /not a confirmed murderer|do not establish who killed whom/);
    assert.ok(reply.sources.length);
    for (const source of reply.sources) {
        assert.equal(source.review, 'external-research');
        assert.ok(source.references.some(reference => reference.url.includes('title=Inamo&oldid=154876')));
        assert.ok(source.references.every(reference => reference.label && reference.checkedAt));
    }
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}

for (const question of [
    'who killed inamo?', 'who murdered inamo?', 'Who was Inamo murdered by?',
    'Who killed Christopher?', 'Who murdered Christopher?', 'Who is the murderer?',
]) test(`Direct researched perpetrators: ${question}`, () => {
    researchAnswer(make().answer(question, direct), [killer]);
});

for (const question of ['Who murdered who?', 'Who killed whom?', 'Who killed who?'])
    test(`Direct researched participants: ${question}`, () => {
        researchAnswer(make().answer(question, direct), [killer, victim]);
    });

for (const question of ['Who did Hook kill?', 'Who did Forskis murder?', 'Who were the murder victims in Trinsic?'])
    test(`Direct researched victims: ${question}`, () => {
        researchAnswer(make().answer(question, direct), [victim]);
    });

test('the original guide suspect remains a separate sourced clue', () => {
    const reply = make().answer('Who is the suspect in the Trinsic murders?', direct);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, [suspect]);
    assert.match(reply.text, /man with a hook/);
    assert.ok(reply.sources.every(source => source.review === 'extracted'));
    assert.doesNotMatch(reply.text, /Forskis|outside research/);
});

test('the complete owner conversation keeps identity and researched relationships distinct', () => {
    const assistant = make();
    researchAnswer(assistant.answer('who killed inamo?', direct), [killer]);
    const identity = assistant.answer('who is inamo?');
    assert.equal(identity.decision, 'answer', identity.text);
    assert.match(identity.text, /Gargoyle immigrant/);
    assert.ok(identity.sources.every(source => source.review === 'extracted'));
    for (const question of ['who murdered who?', 'who killed who?', 'who killed inamo?', 'who murdered inamo?'])
        researchAnswer(assistant.answer(question), question.includes('inamo') ? [killer] : [killer, victim]);
});

for (const spoiler of ['gentle', 'balanced']) test(`research is indistinguishable from absent facts at ${spoiler}`, () => {
    const absent = records.filter(record => ![killer, victim].includes(record.id));
    for (const question of ['Who killed Inamo?', 'Who murdered Christopher?', 'Who killed whom?', 'Who did Hook kill?']) {
        const hiddenReply = make().answer(question, { spoiler });
        const absentReply = make(absent).answer(question, { spoiler });
        assert.deepEqual(hiddenReply, absentReply);
        assert.notEqual(hiddenReply.decision, 'answer');
        assert.doesNotMatch(hiddenReply.text, /Forskis|assassins|higher help level|naming the subject differently/);
        assert.deepEqual(hiddenReply.stateChanges, []);
    }
    assert.equal(authorize(records.find(record => record.id === killer), spoiler), null);
    assert.equal(authorize(records.find(record => record.id === victim), spoiler), null);
});

for (const question of [
    'Who killed Shamino?', 'Who murdered Inamo on Mars?', 'Who killed Inamo in SNES?',
    'Who killed Inamo in Serpent Isle?', 'Who killed Inamo with a pitchfork?',
    'Who killed Inamo according to the guide?',
    'Why did Hook kill Inamo?',
]) test(`unsupported target, edition or detail is not supplied: ${question}`, () => {
    const reply = make().answer(question, direct);
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    assert.deepEqual(reply.stateChanges, []);
    assert.match(reply.text, /sourced answer.*relationship/);
    assert.doesNotMatch(reply.text, /Forskis|higher help level|naming the subject differently/);
});

test('a motive question now presents the explicitly indexed differing accounts', () => {
    const reply = make().answer('Why was Inamo killed?', direct);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, ['ultima7:narrative:inamo-motive:cause']);
    assert.match(reply.text, /different accounts/);
    assert.match(reply.text, /likely/);
    assert.match(reply.text, /apparently/);
    assert.equal(new Set(reply.sources.flatMap(source => source.references.map(reference => reference.url))).size, 3);
    assert.deepEqual(reply.stateChanges, []);
});
