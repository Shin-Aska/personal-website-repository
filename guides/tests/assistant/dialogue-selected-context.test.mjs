import test from 'node:test';
import assert from 'node:assert/strict';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { createConversationAssistant } from '../../js/assistant/dialogue.js';

test('an unknown newer subject cannot revive the old selected atlas person', async () => {
    const records = allRecords.ultima6;
    // Deliberately synthetic labels isolate topic state from model accuracy.
    const classify = async text => [{ label: /^where/i.test(text) ? 'location' : 'identity', score: .99 },
        { label: 'unknown', score: .01 }];
    const assistant = createConversationAssistant({ gameId: 'ultima6', records, classify,
        thresholds: { minScore: 0, minMargin: 0 },
        assistant: createAssistant({ gameId: 'ultima6', records, fallback: null }) });
    const options = { contextId: 'atlas:Iolo', entityIds: ['ultima6:atlas:marker:Iolo'], spoiler: 'direct', fullAnswersOnly: true };
    const selected = await assistant.answerAsync('Where is he?', options);
    assert.equal(selected.decision, 'answer');
    assert.deepEqual(selected.recordIds, ['ultima6:atlas:marker:Iolo:location']);
    assert.notEqual((await assistant.answerAsync('Who is Captain Nebularose?', options)).decision, 'answer');
    const unresolved = await assistant.answerAsync('Where is he?', options);
    assert.notEqual(unresolved.decision, 'answer');
    assert.deepEqual(unresolved.recordIds, []);
    assert.deepEqual(unresolved.sources, []);
    const reopened = await assistant.answerAsync('Where is he?', { ...options, contextId: 'atlas:Iolo:reopened' });
    assert.equal(reopened.decision, 'answer', reopened.text);
    assert.deepEqual(reopened.recordIds, ['ultima6:atlas:marker:Iolo:location']);
});
