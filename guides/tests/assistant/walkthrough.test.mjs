// Questions written from outside walkthroughs, with reviewed expectations at
// Gentle and Direct. Run: node --test guides/tests/assistant/walkthrough.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { allRecords } from './load-records.mjs';

const { cases } = JSON.parse(fs.readFileSync(new URL('./walkthrough-cases.json', import.meta.url), 'utf8'));
const editions = { ultima7: ['forge of virtue'] };
const make = gameId => createAssistant({ gameId, records: allRecords[gameId], editions: editions[gameId] || [] });

for (const c of cases) for (const spoiler of ['gentle', 'direct'])
    test(`${c.id} ${c.gameId} [${spoiler}, ${c.verdict}]: ${c.question}`, () => {
        const reply = make(c.gameId).answer(c.question, { spoiler });
        const expected = c.expect[spoiler];
        assert.deepEqual(reply.stateChanges, []);
        if (expected === 'no-answer' || expected.closest) {
            assert.notEqual(reply.decision, 'answer', reply.text);
            assert.deepEqual(reply.recordIds, []);
            // Labelled closest guide text is offered only where it was reviewed.
            assert.deepEqual(reply.closest || [], expected.closest || [], reply.text);
            if (expected.closest) assert.match(reply.text, /closest guide text I found \(it may not answer your question\)/);
        } else {
            assert.equal(reply.decision, 'answer', reply.text);
            assert.deepEqual(reply.recordIds, expected.answer, reply.text);
            assert.ok(reply.sources.length, 'an answer keeps its source');
        }
    });

test('walkthrough fixture verdicts are consistent with their expectations', () => {
    for (const c of cases) {
        assert.ok(['pass', 'fair-decline', 'gap', 'owner'].includes(c.verdict), c.id);
        if (c.verdict === 'pass') assert.notEqual(c.expect.direct, 'no-answer', `${c.id} passes only with a Direct answer`);
        else assert.ok(c.expect.direct === 'no-answer' || c.expect.direct.closest, `${c.id} is not a pass, so it must not answer`);
    }
});
