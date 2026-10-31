// Diagnostic regression contract for full-answer source routing. These tests
// use existing extracted records and authored knowledge indexes only; no model
// classifier, query encoder, browser, or source/oracle mutation is involved.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { createConversationAssistant } from '../../js/assistant/dialogue.js';
import { buildKnowledge } from '../../js/assistant/knowledge.js';

const cases = [
    { gameId: 'ultima5', question: 'What is the method for the Sandalwood Box?',
        recordId: 'ultima5:narrative:sandalwood-method:method',
        witness: 'Stand at the harpsichord and play Stones as 6-7-8-9-8-7-8-7-6-7-6-5-3. The secret wall opens; enter and take the Sandalwood Box.' },
    { gameId: 'ultima6', question: "What is the next step in the Merchants' Circuit?",
        recordId: 'ultima6:narrative:merchants-sequence:sequence',
        witness: 'Carry grain from Linda in Britain to Grison in Paws, then bring his flour back to Cullen in Britain.' },
    { gameId: 'ultima7', question: 'Why was Inamo killed?',
        recordId: 'ultima7:narrative:inamo-motive:cause',
        witness: 'The sources give different accounts; no single explanation is established here.' },
    { gameId: 'alqadim', question: 'What is the method for getting the Family Sword of Honor?',
        recordId: 'alqadim:narrative:ch2_1:method',
        witness: 'Meet Aliya at the gates and speak with Zubin to get the Family Sword of Honor.' },
];

function makePair(gameId) {
    const records = allRecords[gameId];
    const manifest = JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${gameId}.json`, import.meta.url), 'utf8'));
    const knowledge = buildKnowledge(gameId, records, manifest);
    assert.deepEqual(knowledge.issues, [], `${gameId} authored knowledge index must remain valid`);
    return {
        baseline: createAssistant({ gameId, records }),
        wrapped: createConversationAssistant({ assistant: createAssistant({ gameId, records }), records, gameId, knowledge }),
    };
}

for (const item of cases) {
    test(`${item.gameId}: indexed narrative stays answerable through conversation wrapper`, () => {
        const { baseline, wrapped } = makePair(item.gameId);
        const original = baseline.answer(item.question, { fullAnswersOnly: true });
        assert.equal(original.decision, 'answer');
        assert.ok(original.recordIds.includes(item.recordId));
        assert.ok(original.text.includes(item.witness));
        assert.ok(original.sources?.length, 'baseline reply must retain its extracted source witness');

        const actual = wrapped.answer(item.question);
        assert.equal(actual.decision, 'answer', actual.text);
        assert.ok(actual.recordIds.includes(item.recordId));
        assert.ok(actual.text.includes(item.witness));
        assert.ok(actual.sources?.length, 'wrapped answer must keep the exact source provenance');
    });
}

test('AlQadim smaller-hint control reuses the complete prior direct answer', () => {
    const { baseline, wrapped } = makePair('alqadim');
    const original = baseline.answer(cases[3].question, { fullAnswersOnly: true });
    const replayed = baseline.answer('smaller hint', { fullAnswersOnly: true });
    assert.equal(replayed.decision, 'answer');
    assert.equal(replayed.text, original.text);
    assert.deepEqual(replayed.recordIds, original.recordIds);

    const first = wrapped.answer(cases[3].question);
    const smaller = wrapped.answer('smaller hint');
    assert.equal(first.decision, 'answer', first.text);
    assert.equal(smaller.decision, 'answer', smaller.text);
    assert.equal(smaller.text, first.text);
    assert.deepEqual(smaller.recordIds, first.recordIds);
});
