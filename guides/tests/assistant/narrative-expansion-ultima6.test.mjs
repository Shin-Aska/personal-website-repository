import assert from 'node:assert/strict';
import test from 'node:test';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const records = allRecords.ultima6;
const facets = records.filter(record => record.relation === 'narrative');
const make = () => createAssistant({ gameId: 'ultima6', records });
const byId = id => facets.find(record => record.id === `ultima6:narrative:${id}`);

test('all authored Ultima VI narrative definitions build without silent drops', () => {
    const ids = ['iolo-identity:identity', 'shamino-identity:identity', 'dupre-identity:identity', 'jaana-identity:identity', 'julia-identity:identity',
        'gwenno-identity:identity', 'katrina-identity:identity', 'seggallion-identity:identity', 'sentri-identity:identity', 'beh-lem-identity:identity', 'sherry-identity:identity',
        'merchants-summary:summary', 'lycaeum-summary:summary', 'chuckles-summary:summary', 'merchants-sequence:sequence', 'side-explore-the-swamp-cave-summary:summary', 'side-plunder-dungeon-deceit-summary:summary', 'side-despise-and-the-heroes-hole-summary:summary', 'act-1-summary:summary', 'act-2-summary:summary', 'act-3-summary:summary', 'act-4-summary:summary'];
    assert.equal(facets.length, ids.length);
    for (const id of ids) assert.ok(facets.some(record => record.id.endsWith(id)), `missing built facet ${id}`);
    assert.deepEqual(new Set(facets.map(record => record.narrative.aspect)), new Set(['identity', 'summary', 'sequence']));
});

test('facets quote their exact single source claim and remain within source tier', () => {
    for (const raw of facets) {
        assert.equal(raw.source.index.review, 'authored-index');
        assert.equal(raw.source.index.file, 'guides/data/assistant/ultima6.json');
        assert.equal(raw.source.review, 'extracted');
        assert.equal(raw.source.claims.length, 1);
        assert.equal(raw.variants[raw.minSpoiler].text, raw.source.claims[0].text);
        assert.ok(authorize(raw, raw.minSpoiler));
        for (const phrase of [...raw.narrative.subjects, ...raw.narrative.context]) assert.ok(raw.source.claims[0].text.includes(phrase));
        if (raw.minSpoiler === 'balanced') assert.equal(authorize(raw, 'gentle'), null);
        if (raw.minSpoiler === 'direct') assert.equal(authorize(raw, 'balanced'), null);
    }
});

test('identity and summary requests use matching facets', () => {
    const assistant = make();
    const cases = [
        ['Who is Iolo?', 'identity'],
        ["Summarize the Merchants' Circuit", 'summary'],
        ['Summarize the Lycaeum Library errands', 'summary']
    ];
    for (const [question, aspect] of cases) {
        const answer = assistant.answer(question, { spoiler: 'direct' });
        assert.equal(answer.decision, 'answer', `${question}: ${answer.text}`);
        assert.ok(answer.recordIds.some(id => id.includes(`:${aspect}`)), `${question}: ${answer.recordIds.join(', ')}`);
    }
});

test('walkthrough chronology is requested as a guide step', () => {
    const answer = make().answer("What is the next step in the Merchants' Circuit?", { spoiler: 'direct' });
    assert.equal(answer.decision, 'answer', answer.text);
    assert.ok(answer.recordIds.includes('ultima6:narrative:merchants-sequence:sequence'));
    assert.match(answer.text, /In the guide's steps/);
});

test('wrong actions, people, editions and world details do not get sourced facets', () => {
    const assistant = make();
    for (const question of [
        'What happened in the Lycaeum Library errands?',
        'What happened in Chuckles trail?',
        'How do I recruit Iolo?',
        'Why did Iolo kill Lord British?',
        'Summarize the Merchants\' Circuit on Mars',
        'Who is Iolo in the SNES edition?'
    ]) {
        const answer = assistant.answer(question, { spoiler: 'direct' });
        assert.notEqual(answer.decision, 'answer', `${question}: ${answer.text}`);
    }
});

test('a hidden identity has the same lower-tier reply as an absent identity', () => {
    const assistant = createAssistant({ gameId: 'ultima6', records: facets });
    const hidden = assistant.answer('Who is Iolo?', { spoiler: 'gentle' });
    const absent = assistant.answer('Who is Zorvax?', { spoiler: 'gentle' });
    assert.equal(hidden.decision, absent.decision);
    assert.equal(hidden.text, absent.text);
});

test('no reverse relationship is created from a one-way source', () => {
    assert.ok(!facets.some(record => record.narrative.aspect === 'relationship'));
});
