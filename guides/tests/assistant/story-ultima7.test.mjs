// Claude owns the supplied Ultima VII story fixtures. This independent runner
// checks their real extracted facts without editing the shared acceptance
// runners, overlay, adapter, or fixture file.
// Run: node --test guides/tests/assistant/story-ultima7.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const fixtures = JSON.parse(fs.readFileSync(new URL('story-ultima7-pending.json', import.meta.url), 'utf8'));
const make = () => createAssistant({ gameId: 'ultima7', records: allRecords.ultima7 });

function check(actual, expected, spoiler = 'gentle') {
    assert.ok([expected.decision].flat().includes(actual.decision), actual.text);
    for (const phrase of expected.contains || []) assert.ok(actual.text.toLowerCase().includes(phrase.toLowerCase()), `missing ${phrase}: ${actual.text}`);
    for (const phrase of expected.absent || []) assert.ok(!actual.text.toLowerCase().includes(phrase.toLowerCase()), `unexpected ${phrase}: ${actual.text}`);
    for (const id of expected.recordIds || []) assert.ok(actual.recordIds.includes(id), `missing ${id}`);
    if (expected.noChoices) assert.deepEqual(actual.choices, []);
    assert.deepEqual(actual.stateChanges, [], 'story questions never write progress');
    if (actual.decision === 'answer') {
        assert.ok(actual.sources.length && actual.sources.every(source => source.file && source.locator && source.review));
        assert.ok(actual.recordIds.length);
        for (const id of actual.recordIds) {
            const raw = allRecords.ultima7.find(record => record.id === id);
            assert.ok(raw && authorize(raw, spoiler), 'every answer uses a record authorized at the requested ceiling');
        }
    }
}

for (const fixture of fixtures.questions || []) test(`Ultima VII ${fixture.id}: ${fixture.text}`, () => {
    check(make().answer(fixture.text, fixture.options), fixture.expected, fixture.options?.spoiler);
});

for (const fixture of fixtures.dialogues || []) test(`Ultima VII dialogue ${fixture.id}`, () => {
    const assistant = make();
    for (const turn of fixture.turns) check(assistant.answer(turn.text, turn.options), turn.expected, turn.options?.spoiler || assistant.policy);
});

test('Ultima VII story fields contain only verbatim source-grounded values', () => {
    const records = allRecords.ultima7.filter(record => record.relation === 'story');
    assert.ok(records.length, 'the adapter must connect the agreed story definitions');
    for (const record of records) {
        assert.equal(record.source.index.review, 'authored-index');
        assert.equal(record.source.index.file, 'guides/data/assistant/ultima7.json');
        assert.equal(Object.keys(record.variants).length, 1);
        const approved = authorize(record, record.minSpoiler);
        assert.ok(approved?.story, record.id);
        // Confirmed killers are now intentionally supplied by cited outside
        // research. The guide itself still identifies only an unnamed suspect.
        if (approved.source.review !== 'external-research')
            assert.ok(['suspect', 'victim', 'leader', 'member'].includes(approved.story.role), 'the guide does not identify a perpetrator');
        if (approved.story.role === 'suspect') {
            assert.deepEqual(approved.story.people, [], 'the unnamed suspect must never be linked to Hook');
            assert.match(approved.story.qualifier, /man with a hook/i);
        }
        for (const level of ['gentle', 'balanced']) if (record.minSpoiler === 'direct') assert.equal(authorize(record, level), null);
    }
});
