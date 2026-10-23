// Meaning, provenance and integration checks shared with the real UI probe.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize, LEVELS } from '../../js/assistant/policy.js';
import { narrativeQuestion } from '../../js/assistant/language.js';

const read = file => JSON.parse(fs.readFileSync(new URL(file, import.meta.url), 'utf8'));
const cases = read('./narrative-all-games-cases.json');
for (const gameId of Object.keys(allRecords)) test(`${gameId}: every authored narrative builds with its source and existing identity`, () => {
    const definitions = read(`../../data/assistant/${gameId}.json`).narratives || [];
    const records = allRecords[gameId], facets = records.filter(r => r.narrative);
    assert.equal(facets.length, definitions.length, 'no silently dropped records');
    for (const definition of definitions) {
        const r = facets.find(r => r.id === `${gameId}:narrative:${definition.id}:${definition.narrative.aspect}`);
        assert.ok(r, definition.id);
        assert.ok(records.some(old => !old.narrative && old.entityId === r.entityId && old.kind === r.kind), r.id);
        assert.equal(r.variants[r.minSpoiler].text, r.source.claims.map(c => c.text).join('\n'));
        assert.ok(r.source.claims.length >= 1 && r.source.claims.length <= 4);
        assert.equal(r.source.index.review, 'authored-index');
        const domains = new Set(r.source.claims.map(c => c.source.review === 'external-research' ? 'research' : 'guide'));
        assert.equal(domains.size, 1, r.id);
        for (const phrase of [...r.narrative.subjects, ...r.narrative.context, r.narrative.predicate].filter(Boolean))
            assert.ok(r.source.claims.some(c => c.text.toLowerCase().includes(phrase.toLowerCase())), `${r.id}: ${phrase}`);
        for (const tier of LEVELS.slice(0, LEVELS.indexOf(r.minSpoiler))) assert.equal(authorize(r, tier), null);
    }
});

for (const c of cases.filter(c => c.gameId !== 'starcraft')) test(`${c.gameId}: ${c.question}`, () => {
    const reply = createAssistant({ gameId: c.gameId, records: allRecords[c.gameId] }).answer(c.question, { spoiler: c.spoiler });
    assert.deepEqual(reply.stateChanges, []);
    if (c.unsupported) {
        assert.notEqual(reply.decision, 'answer', reply.text);
        assert.deepEqual(reply.recordIds, []);
        assert.deepEqual(reply.sources, []);
    } else {
        assert.equal(reply.decision, 'answer', reply.text);
        assert.ok(reply.recordIds.includes(c.recordId), JSON.stringify(reply.recordIds));
        for (const phrase of c.contains) assert.ok(reply.text.toLowerCase().includes(phrase.toLowerCase()), `${phrase}: ${reply.text}`);
        assert.ok(reply.sources.length);
        for (const id of reply.recordIds) {
            const r = authorize(allRecords[c.gameId].find(r => r.id === id), c.spoiler);
            assert.ok(r);
            for (const claim of r.source.claims || [{ text: r.text }]) assert.ok(reply.text.includes(claim.text));
        }
    }
});

test('procedural method grammar preserves actions and restrictions', () => {
    assert.deepEqual(narrativeQuestion('What is the method for getting the sword without gold?'),
        { aspect: 'method', query: 'getting the sword without gold' });
});

for (const [gameId, question] of [['albion', 'Summarize Maini'], ['ultima5', 'What is the outcome for the Crown?'],
    ['ultima6', "Summarize the Merchants' Circuit"], ['alqadim', 'Summarize Chapter 2']])
    test(`${gameId}: hidden and removed narrative facts are indistinguishable`, () => {
        const records = allRecords[gameId], without = records.filter(r => !r.narrative);
        const hidden = createAssistant({ gameId, records }).answer(question, { spoiler: 'gentle' });
        const absent = createAssistant({ gameId, records: without }).answer(question, { spoiler: 'gentle' });
        assert.equal(hidden.decision, absent.decision);
        assert.equal(hidden.text, absent.text);
        assert.deepEqual(hidden.recordIds, absent.recordIds);
    });

for (const [gameId, first, expected] of [
    ['albion', 'Summarize Maini', 'albion:narrative:maini-walkthrough-sequence:sequence'],
    ['ultima6', "Summarize the Merchants' Circuit", 'ultima6:narrative:merchants-sequence:sequence'],
]) test(`${gameId}: latest conversation selects its guide steps`, () => {
    const a = createAssistant({ gameId, records: allRecords[gameId] });
    assert.equal(a.answer(first, { spoiler: 'direct' }).decision, 'answer');
    assert.ok(a.answer('What is the next step?', { spoiler: 'direct' }).recordIds.includes(expected));
    a.answer('Who is Iolo?', { spoiler: 'direct' });
    assert.ok(!a.answer('What is the next step?', { spoiler: 'direct' }).recordIds.includes(expected));
});
