// Independent real-data coverage for Claude's authored narrative fixtures.
// The shared fixture/data files remain owned by Claude.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const records = allRecords.ultima7;
const make = (input = records) => createAssistant({ gameId: 'ultima7', records: input });
const fixtures = JSON.parse(fs.readFileSync(new URL('narrative-ultima7-pending.json', import.meta.url)));

function check(reply, expected, spoiler) {
    assert.ok([expected.decision].flat().includes(reply.decision), reply.text);
    for (const text of expected.contains || []) assert.ok(reply.text.toLowerCase().includes(text.toLowerCase()), `${text}: ${reply.text}`);
    for (const text of expected.absent || []) assert.ok(!reply.text.toLowerCase().includes(text.toLowerCase()), `${text}: ${reply.text}`);
    for (const id of expected.recordIds || []) assert.ok(reply.recordIds.includes(id), `${id}: ${reply.text}`);
    assert.deepEqual(reply.stateChanges, []);
    if (reply.decision === 'answer') {
        assert.ok(reply.sources.length && reply.recordIds.length);
        for (const id of reply.recordIds) assert.ok(authorize(records.find(r => r.id === id), spoiler));
    }
}

for (const item of fixtures.questions || []) test(`Ultima VII narrative ${item.id}: ${item.text}`, () => {
    check(make().answer(item.text, item.options), item.expected, item.options?.spoiler || 'gentle');
});

for (const item of fixtures.dialogues || []) test(`Ultima VII narrative dialogue ${item.id}`, () => {
    const assistant = make();
    let spoiler = 'gentle';
    for (const turn of item.turns) {
        spoiler = turn.options?.spoiler || spoiler;
        check(assistant.answer(turn.text, turn.options), turn.expected, spoiler);
    }
});

test('Ultima VII facets cover all nine declared aspects with source claims', () => {
    const facets = records.filter(r => r.relation === 'narrative');
    assert.deepEqual(new Set(facets.map(r => r.narrative.aspect)), new Set([
        'identity', 'event', 'cause', 'method', 'outcome', 'sequence', 'relationship', 'purpose', 'summary',
    ]));
    for (const raw of facets) {
        const record = authorize(raw, raw.minSpoiler);
        assert.ok(record, raw.id);
        assert.equal(record.source.claims.map(claim => claim.text).join('\n'), record.text);
        for (const claim of record.source.claims) assert.ok(claim.source.file && claim.source.locator);
    }
});

for (const spoiler of ['gentle', 'balanced']) test(`hidden facets and absent facets agree at ${spoiler}`, () => {
    const visibleOnly = records.filter(r => r.relation !== 'narrative' || authorize(r, spoiler));
    for (const question of ['Why was Inamo killed?', 'How was Inamo killed?', 'What happened to Hook?',
        'What happened after the Trinsic murders?', 'What does the Fellowship want?', 'Summarize the Trinsic murders.']) {
        assert.deepEqual(make().answer(question, { spoiler }), make(visibleOnly).answer(question, { spoiler }));
    }
});

for (const question of ['Why did Klog murder Christopher?', 'Why did Christopher kill Inamo?',
    'Why did Klog leave Christopher?', 'Why did the Fellowship leave Christopher?',
    'Why did Christopher leave Klog?', 'What is the outcome of Hook killing the Avatar?',
    'What is the next step after Caine reveals the answers?', 'What happened to Hook on Mars?',
    'Why was Inamo killed in the SNES version?', 'Who is Spark’s father?'])
    test(`no invented direction, order, edition or inverse: ${question}`, () => {
        const reply = make().answer(question, { spoiler: 'direct' });
        assert.notEqual(reply.decision, 'answer', reply.text);
        assert.deepEqual(reply.sources, []);
        assert.deepEqual(reply.stateChanges, []);
    });

test('a narrowly scoped errand purpose is clarified before answering a broad personal purpose', () => {
    const assistant = make();
    const pending = assistant.answer('What does Batlin want?', { spoiler: 'direct' });
    assert.equal(pending.decision, 'clarify', pending.text);
    assert.ok(pending.choices.length);
    assert.doesNotMatch(pending.text, /it.s a trap/);
    const choice = pending.choices.find(option => option.id === 'ultima7:narrative:destard-trap:purpose');
    assert.ok(choice);
    const reply = assistant.answer(choice.label, { choiceId: choice.id, expectedRevision: choice.revision });
    assert.equal(reply.decision, 'answer', reply.text);
    assert.match(reply.text, /Dungeon Destard/);
});

test('an explicit narrative question starts a new frame after a summary in the quest UI', () => {
    const assistant = make();
    const options = { spoiler: 'direct', entityIds: ['ultima7:quest:the-trinsic-murders'] };
    assert.equal(assistant.answer('Summarize the Trinsic murders.', options).decision, 'answer');
    const reply = assistant.answer('What does Batlin want?', options);
    assert.equal(reply.decision, 'clarify', reply.text);
    assert.ok(reply.choices.some(choice => choice.id === 'ultima7:narrative:destard-trap:purpose'));
});
