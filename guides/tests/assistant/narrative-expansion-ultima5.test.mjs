// Ultima V narrative overlay: exact extraction, question routing and spoiler coverage.
// Run with the repository's bundled Node runtime: node --test this file.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allRecords, u5 } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';
import { ultima5Facts } from '../../js/assistant/adapters/ultima5.js';
import { narrativeRecordIssues } from '../../js/assistant/topics.js';

const overlay = JSON.parse(fs.readFileSync(new URL('../../data/assistant/ultima5.json', import.meta.url), 'utf8'));
const narratives = overlay.narratives;
const records = allRecords.ultima5.filter(record => record.narrative);
const assistant = () => createAssistant({ gameId: 'ultima5', records: allRecords.ultima5 });
const facts = ultima5Facts({ chapters: u5.ultima5GrandQuestChapters, spells: u5.spellData, tips: u5.commonTips,
    words: u5.wordData, moongates: u5.moongatePhaseData, companions: u5.companionData, pageFacts: overlay.pageFacts || [] });

test('every authored Ultima V narrative definition builds once, with its stable ID and an existing entity', () => {
    assert.equal(records.length, narratives.length);
    assert.deepEqual(records.map(record => record.id), narratives.map(definition => `ultima5:narrative:${definition.id}:${definition.narrative.aspect}`));
    assert.equal(new Set(narratives.map(definition => definition.id)).size, narratives.length);
    for (const definition of narratives) {
        assert.ok(allRecords.ultima5.some(record => record.entityId === definition.entityId && record.kind === definition.kind
            && record.relation !== 'narrative'), `${definition.id} reuses an existing ${definition.kind} identity`);
    }
});

test('all declared facts and narrative phrases validate; every answer quotes the exact facts in authored order', () => {
    assert.deepEqual(narrativeRecordIssues(narratives.map(definition => ({ ...definition,
        overlayFile: 'guides/data/assistant/ultima5.json' })), facts), []);
    for (const [index, definition] of narratives.entries()) {
        const record = records[index];
        const parts = definition.from.map(key => facts.get(key));
        assert.ok(parts.every(Boolean), definition.id);
        assert.equal(record.variants[definition.minSpoiler].text, parts.map(part => part.text).join('\n'));
        assert.equal(record.minSpoiler, definition.minSpoiler);
        assert.equal(record.source.review, 'extracted');
        assert.equal(record.source.index.file, 'guides/data/assistant/ultima5.json');
        assert.equal(record.source.index.locator, `narratives[id=${definition.id}]`);
        assert.equal(record.source.locator, parts.map(part => part.source.locator).join('; '));
        assert.deepEqual(record.source.claims.map(claim => claim.text), parts.map(part => part.text));
        assert.ok(parts.every(part => part.source.file === 'guides/js/Ultima5.js'));
        assert.ok(authorize(record, definition.minSpoiler));
        for (const level of ['gentle', 'balanced', 'direct']) {
            if (['gentle', 'balanced', 'direct'].indexOf(level) < ['gentle', 'balanced', 'direct'].indexOf(definition.minSpoiler))
                assert.equal(authorize(record, level), null, `${definition.id} should be hidden at ${level}`);
        }
    }
});

test('the facets include varied aspects and procedural sequences are explicitly walkthrough steps', () => {
    const counts = Object.fromEntries([...new Set(records.map(record => record.narrative.aspect))]
        .map(aspect => [aspect, records.filter(record => record.narrative.aspect === aspect).length]));
    assert.deepEqual(counts, { outcome: 18, summary: 2, relationship: 1, identity: 1, method: 2, sequence: 2 });
    assert.ok(records.filter(record => record.narrative.aspect === 'sequence')
        .every(record => record.narrative.sequenceMode === 'steps'));
    assert.ok(!records.some(record => record.narrative.status === 'disputed' || record.narrative.status === 'hedged'));
    assert.ok(!records.some(record => record.source.review === 'external-research'));
});

for (const [question, expectedAspect, expectedId, expectedText] of [
    ['What was the outcome of the Humility shrine?', 'outcome', 'shrine-humility', 'Humility restored'],
    ['What is the outcome for the Crown?', 'outcome', 'regalia-crown', 'Protection from enemy magic'],
    ['What is the outcome of the Doom rescue?', 'outcome', 'doom-rescue', 'Lord British returns'],
    ['Summarize the Doom rescue.', 'summary', 'doom-summary', 'full royal set'],
    ['How is Gwenno related to Iolo?', 'relationship', 'gwenno-identity', "Iolo's wife"],
    ['Who is Blackthorn’s spy?', 'identity', 'saduj-identity', 'spy for Blackthorn'],
]) test(`natural question selects the ${expectedAspect} facet: ${question}`, () => {
    const reply = assistant().answer(question, { spoiler: 'direct' });
    assert.equal(reply.decision, 'answer', reply.text);
    assert.ok(reply.recordIds.includes(`ultima5:narrative:${expectedId}:${expectedAspect}`), reply.recordIds.join(', '));
    assert.ok(reply.text.includes(expectedText), reply.text);
});

test('wrong-world and unsupported-actor questions do not acquire a narrative answer', () => {
    for (const question of ['What happened in Doom?', 'What happened in the castle raid?', 'What happened with the Grapple?', 'What happened in Doom on Mars?', 'How did the Avatar take the Magic Carpet?',
        'Why did Lord British betray the Avatar?']) {
        const reply = assistant().answer(question, { spoiler: 'direct' });
        assert.notEqual(reply.decision, 'answer', `${question}: ${reply.text}`);
    }
});

test('an unavailable hidden facet gives the same reply as an absent subject', () => {
    const hidden = assistant().answer('What was the outcome of the Humility shrine?', { spoiler: 'gentle' });
    const absent = assistant().answer('What was the outcome of a Phantom shrine?', { spoiler: 'gentle' });
    assert.equal(hidden.decision, absent.decision);
    assert.equal(hidden.text, absent.text);
});

test('existing non-narrative records remain present and AN SANCT stays withheld', () => {
    assert.ok(allRecords.ultima5.some(record => record.id === 'ultima5:objective:doom-rescue:hint'));
    assert.ok(allRecords.ultima5.some(record => record.id === 'ultima5:companion:gwenno:explanation'));
    assert.ok(!allRecords.ultima5.some(record => record.title === 'AN SANCT' && record.relation === 'use'));
});
