import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { lookupGraphQuestion, graphReferenceRoles } from '../../js/assistant/knowledge-graph.js';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { allRecords } from './load-records.mjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/alqadim.json', import.meta.url)));
const knowledge = buildKnowledge('alqadim', allRecords.alqadim, manifest);
const barrelEdge = knowledge.links.find(link => link.id === 'barrels-potions');
assert.ok(barrelEdge, 'The authored barrel-to-potion source edge exists');
const question = 'Is there anything I can break open for healing potions?';
const sourceText = "Smash barrels in the ship's hold to find hidden healing potions.";
const actualLookup = (options = {}) => lookupGraphQuestion({
    ...knowledge, text: question, subjectIds: [barrelEdge.to], ...options
});
const emptyAnswer = result => {
    assert.equal(result?.complete, false);
    assert.deepEqual(result.answerEntityIds, []);
    assert.deepEqual(result.factIds, []);
};

test('The authored incoming provides edge returns only the barrels with the complete source passage', () => {
    const result = actualLookup();
    assert.equal(result?.relation, 'resource-source');
    assert.equal(result.complete, true);
    assert.deepEqual(result.answerEntityIds, [barrelEdge.from]);
    assert.deepEqual(result.subjectIds, [barrelEdge.to]);
    assert.equal(knowledge.entities.get(barrelEdge.from).name, "Rotting Ship's Hold barrels");
    assert.deepEqual(result.factIds, ['ch4_7']);
    assert.deepEqual(result.factIds.map(id => knowledge.facts.find(fact => fact.id === id).text), [sourceText]);
    assert.deepEqual(graphReferenceRoles({ ...knowledge, subjectIds: result.subjectIds, factIds: result.factIds }),
        { provider: [], recipient: [] });
});

test('The actual barrel source still requires caller eligibility and an available source fact', () => {
    const visited = [];
    emptyAnswer(actualLookup({ isEligible: fact => {
        visited.push(fact); return fact.id !== 'ch4_7';
    } }));
    assert.equal(visited.length, 1);
    assert.equal(visited[0].text, sourceText);
    emptyAnswer(actualLookup({ facts: knowledge.facts.filter(fact => fact.id !== 'ch4_7') }));
    emptyAnswer(actualLookup({ links: knowledge.links.map(link => link === barrelEdge ? { ...link, status: 'disputed' } : link) }));
});

const edge = (from, to, relation = 'provides', evidenceFactIds = ['break'], status = 'recorded') =>
    ({ from, to, relation, evidenceFactIds, status });
const fixture = () => ({
    text: question, subjectIds: ['potions'],
    entities: new Map([
        ['potions', { name: 'Healing potions', kind: 'item', aliases: ['potions of healing'] }],
        ['barrels', { name: 'Barrels', kind: 'container' }],
        ['crates', { name: 'Crates', kind: 'object' }],
        ['merchant', { name: 'Merchant', kind: 'npc' }],
        ['hold', { name: "Ship's hold", kind: 'place' }]
    ]),
    facts: [
        { id: 'break', entityId: 'barrels', text: sourceText },
        { id: 'condition', entityId: 'barrels', text: 'Restore the ship before entering the hold.' },
        { id: 'crates-break', entityId: 'crates', text: 'Break the crates to find healing potions.' },
        { id: 'merchant-break', entityId: 'merchant', text: 'Smash barrels to find healing potions, says the merchant.' }
    ],
    links: [edge('barrels', 'potions')]
});

test('A resource source retains every proof, including access conditions, for recorded and conditional edges', () => {
    for (const status of ['recorded', 'conditional']) {
        const k = fixture();
        k.links = [edge('barrels', 'potions', 'provides', ['break', 'condition'], status)];
        const result = lookupGraphQuestion(k);
        assert.equal(result?.complete, true);
        assert.deepEqual(result.answerEntityIds, ['barrels']);
        assert.deepEqual(result.factIds, ['break', 'condition']);
        assert.deepEqual(result.factIds.map(id => k.facts.find(fact => fact.id === id).text),
            [sourceText, 'Restore the ship before entering the hold.']);
    }
});

test('Any ineligible proof withholds that entire source and marks other eligible answers incomplete', () => {
    const k = fixture();
    k.links = [edge('barrels', 'potions', 'provides', ['break', 'condition']),
        edge('crates', 'potions', 'yields', ['crates-break'])];
    const visited = [];
    const result = lookupGraphQuestion({ ...k, isEligible: fact => {
        visited.push(fact.id); return fact.id !== 'condition';
    } });
    assert.equal(result.complete, false);
    assert.deepEqual(result.answerEntityIds, ['crates']);
    assert.deepEqual(result.factIds, ['crates-break']);
    assert.deepEqual(visited, ['break', 'condition', 'crates-break']);
});

test('NPC providers and locations cannot fill a breakable source slot', () => {
    const k = fixture();
    k.links.push(edge('merchant', 'potions', 'provides', ['merchant-break']),
        edge('hold', 'potions', 'provides', ['break']));
    const result = lookupGraphQuestion(k);
    assert.equal(result?.complete, true);
    assert.deepEqual(result.answerEntityIds, ['barrels']);
    assert.deepEqual(result.factIds, ['break']);
    assert.equal(lookupGraphQuestion({ ...k, links: k.links.slice(1) }), null);
});

test('A source needs a positive break action in its own primary fact, not an alias or another owner', () => {
    for (const replacement of [
        { text: 'Barrels contain healing potions.' },
        { entityId: 'merchant' },
        { entityId: 'potions' },
        { text: 'Never smash barrels to find healing potions.' },
        { text: 'Do not break barrels to find healing potions.' }
    ]) {
        const k = fixture();
        k.facts[0] = { ...k.facts[0], ...replacement };
        emptyAnswer(lookupGraphQuestion(k));
    }
});

test('Unproved, missing, disputed and unknown-status source evidence cannot answer', () => {
    for (const link of [
        edge('barrels', 'potions', 'provides', []),
        edge('barrels', 'potions', 'provides', ['missing']),
        edge('barrels', 'potions', 'provides', ['break', 'missing']),
        edge('barrels', 'potions', 'provides', ['break'], 'disputed'),
        edge('barrels', 'potions', 'provides', ['break'], 'invented')
    ]) emptyAnswer(lookupGraphQuestion({ ...fixture(), links: [link] }));
});

test('Only exact incoming source predicates answer; outgoing and provider predicates are not inverted', () => {
    for (const link of [
        edge('potions', 'barrels'),
        edge('potions', 'barrels', 'provided-by'),
        edge('barrels', 'potions', 'gives'),
        edge('barrels', 'potions', 'not-provides'),
        edge('barrels', 'potions', 'sometimes-yields')
    ]) assert.equal(lookupGraphQuestion({ ...fixture(), links: [link] }), null);
    assert.deepEqual(lookupGraphQuestion({ ...fixture(), links: [edge('barrels', 'potions', 'yields')] }).answerEntityIds,
        ['barrels']);
});

test('A second edge cannot lend its source owner or break action to a direct resource source', () => {
    const k = fixture();
    k.links = [edge('barrels', 'crates'), edge('crates', 'potions')];
    emptyAnswer(lookupGraphQuestion(k));
    assert.equal(lookupGraphQuestion({ ...k, links: [edge('barrels', 'crates'), edge('crates', 'potions', 'contains')] }), null);
});

test('An exact resource name is required even when a known potion remains among the supplied anchors', () => {
    for (const resource of ['mana potions', 'extra healing potions', 'two healing potions', 'healing potions numbered 7']) {
        emptyAnswer(lookupGraphQuestion({ ...fixture(), text: `Is there anything I can break open for ${resource}?` }));
    }
    const result = lookupGraphQuestion({ ...fixture(), text: 'Is there something we can smash to find potions of healing?' });
    assert.equal(result?.complete, true);
    assert.deepEqual(result.answerEntityIds, ['barrels']);
});

test('Narratives, player-state claims and counterfactuals do not become resource source questions', () => {
    for (const text of [
        'I can break open barrels for healing potions.',
        'Did I break open barrels for healing potions?',
        'Is there anything I can break open for healing potions if I skipped restoring the ship?',
        'Is there anything I can break open for healing potions now?'
    ]) assert.equal(lookupGraphQuestion({ ...fixture(), text }), null, text);
    assert.equal(lookupGraphQuestion({ ...fixture(), subjectIds: [] }), null);
});
