import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {parseSourceRequestFrame as parse} from '../../js/assistant/request-frame.js';
import {planSourceFields} from '../../js/assistant/source-field-router.js';
const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const knowledge = buildKnowledge('ultima5', allRecords.ultima5, read('../../data/assistant/knowledge/ultima5.json'));
const shrine = knowledge.facts.find(f => f.id === 'spirituality-midnight');
const question = 'Must I leave from Skara Brae because I selected its atlas marker?';
const plan = (q, opts = {}) => planSourceFields({frame: parse(q), knowledge, index: knowledge.sourceFields,
    grounded: true, focusEntityId: shrine.entityId, previousProofIds: ['spirituality-midnight'], ...opts});

test('Departure necessity preserves the literal town and complete UI-selection premise as a request', () => {
    const frame = parse(question);
    assert.equal(frame.complete, true); assert.equal(frame.staticEligible, true);
    assert.equal(frame.fields[0].key, 'limitations');
    assert.deepEqual(frame.fields[0].selectors, ['departure']);
    assert.equal(frame.fields[0].subjectMode, 'topic');
    assert.equal(frame.fields[0].requiresGroundedTopic, true);
    assert.deepEqual(frame.fields[0].objectTexts, ['Skara Brae']);
    assert.deepEqual(frame.fields[0].premiseTexts, ['because I selected its atlas marker']);
    assert.ok(frame.fields[0].requestedText.includes('because I selected its atlas marker'));
});

test('The grounded departure question quotes the whole original route with its exact denial and citation', () => {
    const answer = plan(question);
    assert.equal(answer.status, 'answer');
    assert.deepEqual(answer.proofs.map(f => f.id), ['spirituality-midnight']);
    assert.equal(answer.proofs[0].text, shrine.text);
    assert.equal(answer.proofs[0].source.locator, 'ultima5GrandQuestChapters objective=shrine-spirituality.steps[1]');
    for (const value of ['any active moongate', 'exactly midnight', 'do not need to depart from Skara Brae'])
        assert.ok(answer.proofs[0].text.includes(value));
});

test('A departure field never chooses an ungrounded or independently discussed task merely from a town', () => {
    assert.notEqual(plan(question, {grounded: false, focusEntityId: null, previousProofIds: []}).status, 'answer');
    const other = knowledge.facts.find(f => f.id === 'party-six');
    assert.notEqual(plan(question, {focusEntityId: other.entityId, previousProofIds: ['party-six']}).status, 'answer');
});

test('Other towns, unsupported marker claims and edition restrictions survive instead of borrowing the shrine route', () => {
    for (const q of [
        'Must I leave from Britain because I selected its atlas marker?',
        'Must I leave from Skara Brae because I selected its radioactive atlas marker?',
        'Must I leave from Skara Brae because I completed the quest?',
        'Must I leave from Skara Brae because I selected its atlas marker without the moonstone?',
        'Must I leave from Skara Brae in the 2026 remaster edition because I selected its atlas marker?'
    ]) assert.notEqual(plan(q).status, 'answer', q);
});

test('The same modal grammar is independent of game names and does not assert a selected state', () => {
    const frame = parse('Must we depart from Harbor City because we clicked that map marker?');
    assert.equal(frame.fields[0].requiresGroundedTopic, true);
    assert.deepEqual(frame.fields[0].objectTexts, ['Harbor City']);
    assert.deepEqual(frame.fields[0].premiseTexts, ['because we clicked that map marker']);
    assert.equal(frame.report, false); assert.equal(frame.playerStateQuestion, false);
});
