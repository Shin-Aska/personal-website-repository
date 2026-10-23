// Albion narrative coverage. Uses only the checked-in guide data and Node built-ins.
// Run: node --test guides/tests/assistant/narrative-expansion-albion.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allRecords, albion } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { albionNarrativeFacts } from '../../js/assistant/adapters/albion.js';
import { narrativeRecordIssues } from '../../js/assistant/topics.js';

const overlay = JSON.parse(fs.readFileSync(new URL('../../data/assistant/albion.json', import.meta.url), 'utf8'));
const guideFacts = albionNarrativeFacts({ DB: albion.DB, questHints: albion.QUEST_HINTS });
const narratives = allRecords.albion.filter(record => record.relation === 'narrative');
const assistant = spoiler => createAssistant({ gameId: 'albion', records: allRecords.albion, spoiler });

test('every Albion narrative definition builds and cites its exact guide fact', () => {
    const definitions = overlay.narratives.map(definition => ({ ...definition, overlayFile: 'guides/data/assistant/albion.json' }));
    assert.deepEqual(narrativeRecordIssues(definitions, guideFacts), []);
    assert.equal(narratives.length, definitions.length, 'no narrative definition may be silently dropped');
    assert.deepEqual(narratives.map(record => record.id).sort(),
        definitions.map(definition => `albion:narrative:${definition.id}:${definition.narrative.aspect}`).sort());
    for (const record of narratives) {
        assert.equal(record.source.review, 'extracted');
        assert.equal(record.source.index.review, 'authored-index');
        assert.equal(record.source.index.file, 'guides/data/assistant/albion.json');
        assert.equal(Object.keys(record.variants).length, 1, `${record.id} has one spoiler tier`);
        const definition = definitions.find(item => record.id === `albion:narrative:${item.id}:${item.narrative.aspect}`);
        assert.ok(allRecords.albion.some(candidate => candidate.relation !== 'narrative'
            && candidate.entityId === record.entityId && candidate.kind === record.kind), `${record.id} reuses an existing subject`);
        assert.deepEqual(record.narrative, {
            aspect: definition.narrative.aspect,
            subjects: definition.narrative.subjects,
            context: definition.narrative.context,
            status: definition.narrative.status || 'recorded',
            ...(definition.narrative.predicate === undefined ? {} : { predicate: definition.narrative.predicate }),
            ...(definition.narrative.sequenceMode === undefined ? {} : { sequenceMode: definition.narrative.sequenceMode })
        });
        const expectedText = definition.from.map(key => guideFacts.get(key).text).join('\n');
        assert.equal(record.variants[record.minSpoiler].text, expectedText, record.id);
        assert.equal(record.source.claims.map(claim => claim.text).join('\n'), expectedText, record.id);
        assert.ok(record.source.locator && record.source.claims.every(claim => claim.source.file && claim.source.locator), record.id);
    }
});

for (const [question, aspect, recordId, spoiler = 'direct'] of [
    ['Summarize Maini', 'summary', 'albion:narrative:maini-summary:summary', 'balanced'],
    ['How was the path to Toronto?', 'method', 'albion:narrative:toronto-route-method:method'],
    ['What is the outcome of AI Housing?', 'outcome', 'albion:narrative:ai-housing-ending-outcome:outcome'],
    ['What is the next step in the Maini sequence?', 'sequence', 'albion:narrative:maini-walkthrough-sequence:sequence'],
    ['What is the next step in the Toronto codes?', 'sequence', 'albion:narrative:codes-walkthrough-sequence:sequence']
]) {
    test(`Albion ${aspect} question selects its matching facet: ${question}`, () => {
        const result = assistant(spoiler).answer(question, { spoiler });
        assert.equal(result.decision, 'answer', result.text);
        assert.ok(result.recordIds.includes(recordId), `${result.recordIds} should include ${recordId}`);
        assert.ok(result.sources.some(source => source.file && source.locator && source.review === 'extracted'));
        if (aspect === 'sequence') assert.match(result.text, /In the guide's steps/);
    });
}

test('legacy character identity records retain their sourced notes and IDs', () => {
    for (const person of albion.DB.characters) {
        const result = assistant('direct').answer(`Who is ${person.name}?`, { spoiler: 'direct' });
        assert.equal(result.decision, 'answer', `${person.name}: ${result.text}`);
        assert.ok(result.recordIds.includes(`albion:character:${person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:explanation`), person.name);
        assert.ok(result.text.includes(person.notes), `${person.name}: ${result.text}`);
    }
    const balanced = assistant('balanced').answer('Who is Khunag?', { spoiler: 'balanced' });
    assert.equal(balanced.decision, 'answer');
    assert.ok(!balanced.text.includes('REQUIRED'));
    const followUp = assistant('direct').answer('Who is Tom and where can I find him?', { spoiler: 'direct' });
    assert.ok(followUp.recordIds.includes('albion:character:tom-driscoll:explanation'));
    assert.ok(followUp.recordIds.includes('albion:character:tom-driscoll:location'));
});

for (const question of [
    'Why did Joe assassinate Herras?',
    'How did Khunag assassinate Herras?',
    'What happened in Maini?',
    'What happened to Maini?',
    'What happened to the Seed in Toronto?',
    'What happened to Sira in Maini?',
    'What happened to Frodo?',
    'What happened in Maini on SNES?',
    'What happened in Maini on Mars?'
]) {
    test(`Albion narrative grounding declines unsupported pairing or framing: ${question}`, () => {
        const result = assistant('direct').answer(question, { spoiler: 'direct' });
        assert.notEqual(result.decision, 'answer', result.text);
        assert.deepEqual(result.recordIds, []);
    });
}

test('a summary hidden below the spoiler ceiling has the same reply as an absent subject', () => {
    const hidden = assistant('gentle').answer('Summarize Maini', { spoiler: 'gentle' });
    const absent = assistant('gentle').answer('Summarize Mars', { spoiler: 'gentle' });
    assert.equal(hidden.decision, 'decline');
    assert.equal(absent.decision, 'decline');
    assert.equal(hidden.text, absent.text);
    assert.deepEqual(hidden.recordIds, []);
    assert.deepEqual(absent.recordIds, []);
});
