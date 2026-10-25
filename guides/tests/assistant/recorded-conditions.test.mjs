import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { matchRecordedCondition, resolveRecordedCondition } from '../../js/assistant/recorded-conditions.js';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { allRecords } from './load-records.mjs';

const fixture = () => ({
    entities: new Map([
        ['sira', { name: 'Sira', aliases: ['Frost Mage'], kind: 'character' }],
        ['melthas', { name: 'Melthas', kind: 'companion' }],
        ['third', { name: 'Third', kind: 'npc' }]
    ]),
    links: [{ id: 'departure', from: 'sira', to: 'melthas', relation: 'leaves-with',
        status: 'recorded', evidenceFactIds: ['notes'] }],
    facts: [{ id: 'notes', text: 'Sira always leaves with Melthas.', source: { file: 'guide', locator: 'notes' } }]
});
const text = 'What happens to Sira if Melthas leaves?';
const plan = (k, question = text) => matchRecordedCondition({ ...k, text: question });
const resolve = (k, descriptor = plan(k), isEligible = () => true) => resolveRecordedCondition({ ...k, descriptor, isEligible });

test('Actual Albion source retains the full direct Sira/Melthas witness', () => {
    const manifest = JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/albion.json', import.meta.url)));
    const k = buildKnowledge('albion', allRecords.albion, manifest);
    const descriptor = plan(k);
    assert.equal(k.entities.get(descriptor.subjectEntityId).name, 'Sira');
    assert.equal(k.entities.get(descriptor.conditionEntityId).name, 'Melthas');
    assert.deepEqual(descriptor.edgeIds, ['sira-melthas']);
    const visited = [];
    const result = resolve(k, descriptor, fact => {
        visited.push(fact);
        return fact.source.file === 'guides/js/Albion.js' && fact.source.locator === 'DB.characters[3].notes';
    });
    assert.equal(result.complete, true);
    assert.deepEqual(result.factIds, ['sira-notes']);
    assert.equal(visited[0].text, 'Iskai mage specializing in frost and snare magic. Always leaves with Melthas.');
    assert.deepEqual(k.facts.find(fact => fact.id === 'sira-notes').text, visited[0].text);
});

test('Finite grammar preserves named actor roles, exact aliases and predicate spelling', () => {
    const k = fixture();
    for (const question of [text, 'If Melthas leaves, what happens to Sira?',
        'Does Sira leave if Melthas leaves?', 'What happens to Frost Mage if Melthas leaves?']) {
        assert.deepEqual(plan(k, question), { subjectEntityId: 'sira', conditionEntityId: 'melthas', relation: 'leaves-with', edgeIds: ['departure'] });
    }
    k.links[0].relation = 'leaves_with'; k.links[0].status = 'conditional';
    assert.equal(resolve(k).complete, true);
    assert.equal(plan(k, 'What happens to Melthas if Sira leaves?'), null);
});

test('No inverse, transitive chain, cycle or mere cooccurrence supplies an absent direct rule', () => {
    const k = fixture();
    k.links = [
        { ...k.links[0], id: 'first', to: 'third' },
        { ...k.links[0], id: 'second', from: 'third' },
        { ...k.links[0], id: 'cycle', from: 'melthas', to: 'sira' }
    ];
    assert.equal(plan(k), null);
    k.links = [{ ...k.links[0], to: 'melthas', relation: 'linked-to' }];
    assert.equal(plan(k), null);
    k.links = [];
    assert.equal(plan(k), null);
});

test('Missing, disputed and partially eligible proofs withhold the entire answer', () => {
    for (const mutation of [
        k => { k.links[0].status = 'disputed'; },
        k => { k.links[0].evidenceFactIds = []; },
        k => { k.links[0].evidenceFactIds.push('missing'); },
        k => { k.facts.push({ ...k.facts[0] }); }
    ]) {
        const k = fixture(); mutation(k);
        assert.ok(plan(k));
        assert.equal(resolve(k).complete, false);
        assert.deepEqual(resolve(k).factIds, []);
    }
    const k = fixture();
    k.links.push({ ...k.links[0], id: 'second', evidenceFactIds: ['qualifier'] });
    k.facts.push({ id: 'qualifier', text: 'Required source qualification.', source: { file: 'external' } });
    const visited = [];
    const result = resolve(k, plan(k), fact => { visited.push(fact.id); return fact.source.file === 'guide'; });
    assert.equal(result.complete, false);
    assert.deepEqual(result.factIds, []);
    assert.deepEqual(result.requiredFactIds, ['notes', 'qualifier']);
    assert.deepEqual(visited, ['notes', 'qualifier']);
    assert.equal(resolve(k).complete, true);
    k.links[1].status = 'disputed';
    assert.equal(resolve(k).complete, false);
});

test('Resolution requires the caller eligibility callback and all current direct edges', () => {
    const k = fixture(), descriptor = plan(k);
    assert.equal(resolveRecordedCondition({ ...k, descriptor }).complete, false);
    k.links.push({ ...k.links[0], id: 'additional' });
    assert.equal(resolve(k, descriptor).complete, false);
    assert.equal(resolve(k).complete, true);
    k.links[0].from = 'third';
    assert.equal(resolve(k, descriptor).complete, false);
});

test('Unknown actors, ambiguous aliases, wrong kinds and pronouns are rejected', () => {
    const k = fixture();
    for (const question of ['What happens to Zira if Melthas leaves?', 'What happens to Sira if Unknown leaves?',
        'What happens to her if Melthas leaves?', 'What happens to Sira if he leaves?',
        'What happens to Sira and Third if Melthas leaves?', 'What happens to Sira if Sira leaves?'])
        assert.equal(plan(k, question), null);
    k.entities.get('third').aliases = ['Sira'];
    assert.equal(plan(k), null);
    k.entities.get('third').aliases = [];
    k.entities.get('sira').kind = 'item';
    assert.equal(plan(k), null);
});

test('Extra edition, time, source, number and material restrictions are never stripped', () => {
    const k = fixture();
    for (const question of ['What happens to Sira if Melthas leaves in the 2026 edition?',
        'In the original manual, what happens to Sira if Melthas leaves?',
        'What happens to Sira if Melthas leaves after two days?',
        'What happens to Sira if Melthas leaves with the crystal?',
        'What happens to Sira if Melthas leaves? Only use the manual.',
        'What happens to Sira if Melthas is dismissed?', 'What happens to Sira if I dismiss Melthas?'])
        assert.equal(plan(k, question), null);
});

test('Reports, saved/current party, imagined player progress and negated actions are rejected', () => {
    const k = fixture();
    for (const question of ['Melthas left. What happens to Sira?', 'What happens to my Sira if Melthas leaves?',
        'What happens to Sira if Melthas leaves my party?', 'What happens to Sira now if Melthas leaves?',
        'What happens to Sira if Melthas leaves in my saved game?',
        'Suppose I recruited Sira, what happens to Sira if Melthas leaves?',
        'What happens to Sira if Melthas does not leave?', 'What would happen to Sira if Melthas leaves?'])
        assert.equal(plan(k, question), null);
});
