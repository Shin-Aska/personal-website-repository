import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSourceRequestFrame as parse} from '../../js/assistant/request-frame.js';
import {planSourceFields} from '../../js/assistant/source-field-router.js';
const source = {file: 'survey-guide.js', locator: 'stations[0].offers', review: 'extracted'};
function fixture() {
    const text = 'The optional station puzzles offer dangerous but valuable loot.';
    const record = {id: 'original', entityId: 'station', title: 'Survey Station', kind: 'topic', relation: 'outcome', text, source};
    const fact = {id: 'loot', recordId: 'loot-proof', sourceRecordId: 'original', entityId: 'station', subject: 'Survey Station',
        text, witness: text, source, aliases: ['optional station puzzles'], record, answerRelations: ['outcome']};
    const knowledge = {entities: new Map([['station', {id: 'station', name: 'Survey Station', aliases: ['optional station puzzles']}]]),
        facts: [fact], sourceRecords: [record], sourceContexts: []};
    const index = {issues: [], entries: [{factId: 'loot', key: 'outcome', selectors: ['offer'], witness: text,
        subjectEntityIds: ['station'], source, explicit: true}]};
    return {knowledge, index, fact};
}

test('Offering requests an authored offered outcome while provider questions retain their directed role', () => {
    const frame = parse('What do the optional Truth puzzles offer?');
    assert.equal(frame.subjectText, 'the optional Truth puzzles');
    assert.equal(frame.fields[0].key, 'outcome'); assert.deepEqual(frame.fields[0].selectors, ['offer']);
    const provider = parse('Who offers the crystal?');
    assert.equal(provider.fields[0].key, 'provider');
    assert.deepEqual(provider.fields[0].objectTexts, ['the crystal']);
});

test('Offered outcomes retain every recipient, material and edition suffix', () => {
    const frame = parse('What does the survey station offer to masked visitors?');
    assert.equal(frame.subjectText, 'the survey station');
    assert.ok(frame.fields[0].unknownQualifierTexts.includes('to masked visitors'));
    const property = parse('What outcome does the survey station offer from copper?');
    assert.equal(property.subjectText, 'the survey station');
    assert.ok(property.fields[0].unknownQualifierTexts.includes('from copper'));
});

test('A complete explicitly offered outcome answers, but neighboring outcomes and extra restrictions do not', () => {
    const f = fixture();
    const question = 'What do the optional station puzzles offer?';
    const answer = planSourceFields({...f, frame: parse(question)});
    assert.equal(answer.status, 'answer'); assert.deepEqual(answer.proofs, [f.fact]);
    for (const q of [
        'What do the optional station puzzles offer to masked visitors?',
        'What do the optional station puzzles offer from copper?',
        'What do the optional station puzzles offer in the 2026 remaster edition?',
        'What do the optional reactor puzzles offer?'
    ]) assert.notEqual(planSourceFields({...f, frame: parse(q)}).status, 'answer', q);
    const index = {issues: [], entries: f.index.entries.map(e => ({...e, selectors: ['reward']}))};
    assert.notEqual(planSourceFields({...f, index, frame: parse(question)}).status, 'answer');
});
