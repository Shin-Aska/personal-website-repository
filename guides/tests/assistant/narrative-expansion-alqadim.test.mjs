// Al-Qadim narrative overlay: authored guide facets, exact citations and routing.
// Run with the repository's bundled Node runtime: node --test this file.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allRecords, aq } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';
import { narrativeRecordIssues } from '../../js/assistant/topics.js';

const overlay = JSON.parse(fs.readFileSync(new URL('../../data/assistant/alqadim.json', import.meta.url), 'utf8'));
const definitions = overlay.narratives;
const records = allRecords.alqadim.filter(record => record.narrative);
const make = () => createAssistant({ gameId: 'alqadim', records: allRecords.alqadim });
const objectiveFacts = new Map();
for (const [index, chapter] of aq.DB.chapters.entries()) {
    if (chapter.summary) objectiveFacts.set(`chapter-summary:${chapter.id}`, {
        text: chapter.summary, source: { file: 'guides/js/AlQadim.js', locator: `DB.chapters[${index}].summary`, review: 'extracted' }
    });
    for (const objective of [...chapter.required, ...chapter.optional]) {
        if (overlay.excludedObjectives.includes(objective.id)) continue;
        objectiveFacts.set(`obj:${objective.id}`, { text: objective.text, source: { file: 'guides/js/AlQadim.js',
            locator: `DB.chapters[${index}].${chapter.required.includes(objective) ? 'required' : 'optional'}[id=${objective.id}]`, review: 'extracted' } });
    }
}

test('every authored Al-Qadim definition builds once, with its stable ID and existing subject identity', () => {
    assert.equal(records.length, definitions.length);
    assert.deepEqual(records.map(record => record.id), definitions.map(definition =>
        `alqadim:narrative:${definition.id}:${definition.narrative.aspect}`));
    assert.equal(new Set(definitions.map(definition => definition.id)).size, definitions.length);
    for (const definition of definitions) assert.ok(allRecords.alqadim.some(record => record.entityId === definition.entityId
        && record.kind === definition.kind && record.relation !== 'narrative'), `${definition.id} reuses its existing identity`);
});

test('source phrases, spoiler levels and authored fact order validate without dropped facets', () => {
    const indexed = new Map([...objectiveFacts].map(([key, fact]) => [key, fact]));
    assert.deepEqual(narrativeRecordIssues(definitions.map(definition => ({ ...definition,
        overlayFile: 'guides/data/assistant/alqadim.json' })), indexed), []);
    for (const [index, definition] of definitions.entries()) {
        const record = records[index];
        const facts = definition.from.map(key => objectiveFacts.get(key));
        assert.ok(facts.length && facts.every(Boolean), definition.id);
        assert.equal(record.variants[definition.minSpoiler].text, facts.map(fact => fact.text).join('\n'));
        assert.equal(record.minSpoiler, definition.minSpoiler);
        assert.equal(record.source.review, 'extracted');
        assert.equal(record.source.index.file, 'guides/data/assistant/alqadim.json');
        assert.equal(record.source.index.locator, `narratives[id=${definition.id}]`);
        assert.equal(record.source.locator, facts.map(fact => fact.source.locator).join('; '));
        assert.deepEqual(record.source.claims.map(claim => claim.text), facts.map(fact => fact.text));
        assert.ok(facts.every(fact => fact.source.file === 'guides/js/AlQadim.js'));
        assert.ok(authorize(record, definition.minSpoiler));
        for (const level of ['gentle', 'balanced']) if (definition.minSpoiler === 'direct') assert.equal(authorize(record, level), null);
    }
});

test('chapter plans remain summaries; only explicit goal and procedural facets use other aspects', () => {
    assert.equal(records.filter(record => record.narrative.aspect === 'summary').length, 16);
    assert.equal(records.filter(record => record.narrative.aspect === 'purpose').length, 2);
    assert.equal(records.filter(record => record.narrative.aspect === 'method').length, 2);
    assert.equal(records.filter(record => record.narrative.aspect === 'outcome').length, 1);
    assert.equal(records.filter(record => record.narrative.aspect === 'event').length, 0,
        'imperative walkthrough text is not a record of a past event');
    assert.equal(records.filter(record => record.narrative.aspect === 'sequence').length, 0,
        'chapter checklist order does not establish chronology');
    assert.ok(records.every(record => record.source.review === 'extracted'), 'no new research facts were authored');
});

for (const [question, aspect, id, phrase] of [
    ['Summarize the prison dungeons.', 'summary', 'chapter-16-summary', 'rescue your brother Tarik'],
    ['What is the summary of the Library maze?', 'summary', 'chapter-9-summary', 'discover the location of the legendary Genie Lords'],
    ['Summarize the Outer Planes.', 'summary', 'chapter-19-summary', 'lift the curse'],
    ['What is the purpose of the final chest for starting equipment?', 'purpose', 'ch1_5', 'claim starting equipment'],
    ['What is the purpose of defeating the Acid Slime King to neutralize the toxic pool?', 'purpose', 'ch5_4', 'neutralize the toxic pool'],
    ['What is the method for getting the Family Sword of Honor?', 'method', 'ch2_1', 'speak with Zubin'],
    ['What is the method for trapping the Efreet agent in the bottle?', 'method', 'ch10_2', 'Trap the Efreet agent in the bottle'],
    ['What is the outcome of the genie Muliban’s accusation?', 'outcome', 'ch2_6', 'resulting in your family’s banishment'],
]) test(`natural question selects the ${aspect} facet: ${question}`, () => {
    const reply = make().answer(question, { spoiler: 'direct' });
    assert.equal(reply.decision, 'answer', reply.text);
    assert.ok(reply.recordIds.includes(`alqadim:narrative:${id}:${aspect}`), reply.recordIds.join(', '));
    assert.ok(reply.text.toLowerCase().includes(phrase.toLowerCase()), reply.text);
});

test('wrong actor, unsupported event and wrong-world questions do not receive a narrative answer', () => {
    for (const question of ['What is the outcome of your family’s banishment?', 'Why did Zubin betray the family?', 'What happened to Tarik in the Outer Planes?',
        'What happened in the Outer Planes in the SNES version?', 'How did the party rescue Tarik?']) {
        const reply = make().answer(question, { spoiler: 'direct' });
        assert.notEqual(reply.decision, 'answer', `${question}: ${reply.text}`);
    }
});

test('a hidden chapter summary gives the same response as an absent chapter subject', () => {
    const hidden = make().answer('Summarize the prison dungeons.', { spoiler: 'gentle' });
    const absent = make().answer('Summarize the phantom dungeons.', { spoiler: 'gentle' });
    assert.equal(hidden.decision, absent.decision);
    assert.equal(hidden.text, absent.text);
});

test('existing chapter/objective records remain intact', () => {
    assert.ok(allRecords.alqadim.some(record => record.id === 'alqadim:chapter:16:hint'));
    assert.ok(allRecords.alqadim.some(record => record.id === 'alqadim:objective:ch16_4:hint'));
});
