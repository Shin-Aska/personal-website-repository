import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';

const record = {
    id: 'test:crystal-key:use', entityId: 'test:crystal-key', title: 'Crystal Key', aliases: [],
    kind: 'item', relation: 'use', scope: 'test', minSpoiler: 'gentle', requires: null,
    variants: {
        gentle: { text: 'Look for a locked passage.' },
        balanced: { text: 'The Crystal Key opens a gate.' },
        direct: { text: 'The Crystal Key opens the west gate. Use code 1234.' }
    },
    source: { file: 'fixture', locator: 'crystal-key', review: 'extracted' }
};
const make = () => createAssistant({ gameId: 'test', records: [record], fallback: null });
const full = { spoiler: 'direct', fullAnswersOnly: true };
function complete(reply) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.equal(reply.level, 'direct');
    assert.ok(reply.text.includes(record.variants.direct.text));
    assert.deepEqual(reply.recordIds, [record.id]);
    assert.deepEqual(reply.sources, [record.source]);
    assert.deepEqual(reply.stateChanges, []);
}

test('full-answer chat ignores a legacy lower context preference', () => {
    const assistant = make();
    complete(assistant.answer('What does the Crystal Key do?', { ...full, spoiler: 'gentle' }));
    assert.equal(assistant.policy, 'direct');
});

test('a typed smaller-hint command retains the complete answer in chat', () => {
    const assistant = make();
    complete(assistant.answer('What does the Crystal Key do?', full));
    complete(assistant.answer('smaller hint', full));
    assert.notEqual(assistant.answer('smaller hint about an unknown sword', full).decision, 'answer');
});

test('async full-answer requests retain the same source and complete variant', async () => {
    const assistant = make();
    complete(await assistant.answerAsync('What does the Crystal Key do?', { ...full, spoiler: 'balanced' }));
    complete(await assistant.answerAsync('gentler hint please', full));
});

test('the internal tier-authorization API still supports explicit source-contract checks', () => {
    const assistant = make();
    const direct = assistant.answer('What does the Crystal Key do?', { spoiler: 'direct' });
    complete(direct);
    const smaller = assistant.answer('smaller hint', { spoiler: 'direct' });
    assert.equal(smaller.level, 'balanced');
    assert.ok(smaller.text.includes(record.variants.balanced.text));
    assert.ok(!smaller.text.includes('1234'));
});

test('missing answers no longer recommend a removed help selector', () => {
    const reply = make().answer('Who is Zaxivar?', full);
    assert.notEqual(reply.decision, 'answer');
    assert.doesNotMatch(reply.text, /help level|select Gentle|Hint or Full answer/);
});

for (const [gameId, question, framing] of [
    ['ultima6', "What is the next step in the Merchants' Circuit?", "In the guide's steps:"],
    ['ultima7', 'Why was Inamo killed?', 'The sources give different accounts; no single explanation is established here.']
]) test(`${gameId}: full-answer repeats retain source-specific narrative framing`, async () => {
    const { allRecords } = await import('./load-records.mjs');
    const assistant = createAssistant({ gameId, records: allRecords[gameId], fallback: null });
    const first = assistant.answer(question, full);
    assert.equal(first.decision, 'answer', first.text);
    assert.ok(first.text.includes(framing));
    const repeat = assistant.answer('smaller hint', full);
    assert.equal(repeat.decision, 'answer', repeat.text);
    assert.equal(repeat.text, first.text);
    assert.deepEqual(repeat.recordIds, first.recordIds);
    assert.deepEqual(repeat.sources, first.sources);
    assert.deepEqual(repeat.stateChanges, []);
});
