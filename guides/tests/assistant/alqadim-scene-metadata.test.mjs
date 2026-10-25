// Source-only metadata checks. No model preparation, encoding or inference.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords, aq } from './load-records.mjs';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { authorize } from '../../js/assistant/policy.js';
import { compileSourceContexts, factSourceContexts } from '../../js/assistant/source-contexts.js';

const read = relative => JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), 'utf8'));
const manifest = read('../../data/assistant/knowledge/alqadim.json');
const catalog = read('../../data/assistant/knowledge/alqadim-embeddings.json');
const knowledge = buildKnowledge('alqadim', allRecords.alqadim, manifest);
const facts = new Map(knowledge.facts.map(fact => [fact.id, fact]));
const entity = suffix => `alqadim:knowledge:${suffix}`;

// These expectations come from individual original guide declarations. They
// are not selected from chatbot results or from neighboring chapter steps.
test('scene metadata compiles with no rejected facts, bindings, supports or links', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(knowledge.facts.length, manifest.facts.length);
    assert.equal(knowledge.links.length, manifest.links.length);
    for (const fact of knowledge.facts) {
        assert.equal(fact.text, fact.witness, fact.id);
        const record = allRecords.alqadim.find(record => record.id === fact.sourceRecordId);
        assert.ok(authorize(record, 'direct').text.includes(fact.witness), fact.id);
    }
});

test('every existing encoded document is byte-for-byte unchanged', () => {
    assert.equal(catalog.documents.length, manifest.facts.length);
    assert.deepEqual(manifest.facts.map(fact => ({ factId: fact.id, text: knowledgeDocument(fact) })),
        catalog.documents.map(({ factId, text }) => ({ factId, text })));
});

test('the trial binds its stated initiation action without making Sinbar the trial', () => {
    assert.equal(aq.DB.chapters[0].required.find(step => step.id === 'ch1_1').text,
        'Speak with Master Sinbar to initiate the trial.');
    const fact = facts.get('ch1_1');
    assert.equal(manifest.facts.find(fact => fact.id === 'ch1_1').entityId, entity('sinbar'));
    assert.equal(knowledge.entities.get(fact.entityId).name, 'Sinbar');
    assert.deepEqual(fact.bindings, [{ entityId: entity('academy-trial'),
        relations: ['method', 'objective', 'outcome'], mention: 'the trial' }]);
    const link = knowledge.links.find(link => link.id === 'trial-begins-with-sinbar');
    assert.deepEqual([link.from, link.to, link.relation, link.status],
        [entity('academy-trial'), fact.entityId, 'begins_with', 'conditional']);
    assert.deepEqual(link.evidenceFactIds, ['ch1_1']);
    assert.deepEqual(link.qualifiers, ['Speak with Master Sinbar']);
    assert.equal(knowledge.entities.get(entity('academy-trial')).kind, 'quest');
});

test('ship restoration uses the named orb effect, not neighboring checklist order', () => {
    assert.equal(aq.DB.keyItems.find(item => item.name === 'Ship Orb').description,
        'Powers and restores the corsair ship for navigation.');
    const effect = facts.get('item-ship-orb-use');
    assert.deepEqual(effect.answerRelations, ['use', 'method', 'outcome']);
    assert.ok(effect.bindings.some(binding => binding.entityId === entity('corsair-ship')
        && binding.mention === 'corsair ship' && binding.relations.includes('method')));
    assert.ok(effect.bindings.some(binding => binding.entityId === entity('sea-navigation')
        && binding.mention === 'navigation'));
    assert.deepEqual(facts.get('ch4_6').support.method, ['item-ship-orb-use']);
    const link = knowledge.links.find(link => link.id === 'orb-restores-corsair-ship');
    assert.deepEqual([link.from, link.to, link.relation],
        [effect.entityId, entity('corsair-ship'), 'restores']);
    assert.deepEqual(link.evidenceFactIds, ['item-ship-orb-use']);
    assert.ok(knowledge.links.some(link => link.id === 'orb-helm'
        && link.to === entity('helm-cabin') && link.evidenceFactIds.includes('ch4_5')));
});

test('barrels are in the hold, and their potions still require smashing the barrels', () => {
    assert.equal(aq.DB.chapters[3].optional.find(step => step.id === 'ch4_7').text,
        "Smash barrels in the ship's hold to find hidden healing potions.");
    const location = knowledge.links.find(link => link.id === 'hold-barrels-location');
    assert.deepEqual([location.from, location.to, location.relation],
        [entity('rotting-ship-s-hold-barrels'), entity('rotting-ship-s-hold'), 'located_in']);
    assert.deepEqual(location.evidenceFactIds, ['ch4_7']);
    const yieldLink = knowledge.links.find(link => link.id === 'barrels-potions');
    assert.equal(yieldLink.status, 'conditional');
    assert.deepEqual(yieldLink.qualifiers, ['Smash the barrels']);
});

test('academy hazard and exit witnesses retain only their independently stated capabilities', () => {
    assert.equal(facts.get('ch1_2').text, 'Avoid the moving disintegrator field (stay close to walls).');
    assert.deepEqual(facts.get('ch1_2').answerRelations, ['method']);
    assert.deepEqual(facts.get('ch1_3').answerRelations, ['objective']);
    assert.deepEqual(facts.get('ch1_4').answerRelations, ['objective']);
    assert.equal(facts.get('ch1_6').text, 'Step into the northern teleporter to exit to Zaratan.');
    for (const id of ['ch1_2', 'ch1_3', 'ch1_4', 'ch1_6']) {
        assert.ok(!facts.get(id).bindings.some(binding => binding.entityId === entity('academy-trial')),
            `${id} cannot acquire a literal trial binding from chapter adjacency`);
    }
});


test('academy and reef source scopes use actual authorized chapter parents', () => {
    const { contexts, issues } = compileSourceContexts({ contexts: manifest.sourceContexts,
        entities: knowledge.entities,
        sourceRecords: allRecords.alqadim.map(record => authorize(record, 'direct')).filter(Boolean) });
    assert.deepEqual(issues, []);
    assert.deepEqual(contexts.map(({ id, entityId, sourceRecordId, label, source }) =>
        [id, entityId, sourceRecordId, label, source.locator]), [
        ['academy-trial-source-scope', entity('academy-trial'), 'alqadim:chapter:1:hint', 'Academy', 'DB.chapters[0]'],
        ['reef-ship-source-scope', 'alqadim:chapter:4', 'alqadim:chapter:4:hint', "Deadman's Reef", 'DB.chapters[3]'],
        ['old-dungeon-source-scope', 'alqadim:chapter:12', 'alqadim:chapter:12:hint', 'Old Dungeon', 'DB.chapters[11]'],
        ['oasis-source-scope', entity('western-desert-oasis'), 'alqadim:chapter:3:hint', 'Oasis', 'DB.chapters[2]']
    ]);
    for (const id of ['ch1_1', 'ch1_2', 'ch1_6', 'ch1_7'])
        assert.deepEqual(factSourceContexts({ fact: facts.get(id), contexts }).map(context => context.id),
            ['academy-trial-source-scope'], id);
    for (const id of ['ch4_2', 'ch4_3', 'ch4_4', 'ch4_5', 'ch4_6', 'ch4_7'])
        assert.deepEqual(factSourceContexts({ fact: facts.get(id), contexts }).map(context => context.id),
            ['reef-ship-source-scope'], id);
    assert.deepEqual(factSourceContexts({ fact: facts.get('item-ship-orb-use'), contexts }), [],
        'a chapter scope does not spread through the Orb relationship to a separate key-item source');
});
