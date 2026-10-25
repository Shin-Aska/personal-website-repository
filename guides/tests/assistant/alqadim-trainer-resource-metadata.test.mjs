// Source-only trainer/resource review. No model loading, encoding, network or state inference.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { allRecords, aq } from './load-records.mjs';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { authorize } from '../../js/assistant/policy.js';
import { factSourceContexts } from '../../js/assistant/source-contexts.js';
import { lookupGraphQuestion } from '../../js/assistant/knowledge-graph.js';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const manifest = read('../../data/assistant/knowledge/alqadim.json');
const catalog = read('../../data/assistant/knowledge/alqadim-embeddings.json');
const knowledge = buildKnowledge('alqadim', allRecords.alqadim, manifest);
const facts = new Map(knowledge.facts.map(fact => [fact.id, fact]));
const links = new Map(knowledge.links.map(link => [link.id, link]));
const entity = label => `alqadim:knowledge:${label}`;
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const protectedFields = ['id', 'subject', 'facet', 'aliases', 'text', 'witness', 'source', 'sourceRecordId', 'researchWitness', 'editions'];

test('trainer/resource metadata preserves every protected field and encoded document', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(manifest.facts.length, 113);
    assert.equal(hash(manifest.facts.map(fact => Object.fromEntries(protectedFields.map(key => [key, fact[key]])))),
        '237333218a9fa664ae788b3896f191969bbcac73a76e305c0bb2e5ab1a62bb9c');
    assert.equal(hash(manifest.facts.map(knowledgeDocument)),
        '843c043d47970b61c979e8d281832179792a4e42af625026059ea05f364b6df0');
    assert.deepEqual(manifest.facts.map(fact => ({ factId: fact.id, text: knowledgeDocument(fact) })),
        catalog.documents.map(({ factId, text }) => ({ factId, text })));
    for (const fact of knowledge.facts) assert.ok(authorize(allRecords.alqadim.find(record => record.id === fact.sourceRecordId), 'direct').text.includes(fact.witness), fact.id);
});

test('Zubakon location remains a direct actor lookup with conditional training separate', () => {
    const location = facts.get('ch6_4'), teacher = links.get('circle-teacher');
    assert.equal(aq.DB.chapters[5].optional.find(step => step.id === 'ch6_4').text, location.witness);
    assert.match(location.witness, /shop with no sign.*you are eligible for/);
    const result = lookupGraphQuestion({ ...knowledge, text: 'Where is Zubakon?', subjectIds: [location.entityId] });
    assert.equal(result.complete, true);
    assert.deepEqual(result.factIds, ['ch6_4']);
    assert.deepEqual(result.answerEntityIds, [entity('shop-with-no-sign')]);
    assert.equal(teacher.to, location.entityId);
    assert.equal(teacher.status, 'conditional');
    assert.deepEqual(teacher.qualifiers, ['After later progression']);
    assert.ok(!facts.get('swing-full-circle-swing').answerRelations.includes('location'));
    assert.ok(!facts.get('swing-full-circle-swing').bindings.some(binding => binding.entityId === entity('shop-with-no-sign')));
    assert.ok(!knowledge.links.some(link => link.from === teacher.from && link.to === entity('shop-with-no-sign')),
        'a teacher relationship must not invent a transitive training-location edge');
    assert.ok(!/\b\d+\b/.test(facts.get('page-zubakon').text), 'the source supplies no exact experience threshold');
});

test('shard limitations are carried by the explicit charge witness, never firing controls or sling', () => {
    const charges = facts.get('page-shard-charges'), controls = facts.get('page-shard-rules');
    const html = fs.readFileSync(new URL('../../AlQadim.html', import.meta.url), 'utf8');
    assert.ok(html.includes(charges.witness));
    assert.equal(charges.source.locator, 'Moonstone arsenal');
    assert.equal(charges.witness, 'Each glowing fragment carries its own remaining charges. One shot spends one charge; when a shard is empty, it breaks apart.');
    assert.deepEqual(charges.bindings, [{ entityId: entity('moonstone-shards'), relations: ['use', 'limitations', 'outcome', 'explanation'], mention: 'shard' }]);
    assert.deepEqual(controls.support.limitations, ['page-shard-charges']);
    assert.deepEqual(controls.answerRelations, ['use', 'method', 'explanation']);
    assert.ok(!controls.answerRelations.includes('limitations'), 'the controls alone are not finite-charge proof');
    assert.ok(!charges.bindings.some(binding => /sling|left-hand/.test(binding.entityId)), 'the fragment rule does not establish sling ammunition');
    assert.ok(!/\b(?:unlimited|recharg|refill|\d+ charges)\b/i.test(charges.witness), 'do not invent total charges or recharge behavior');
});

test('Oasis scope follows the exact chapter parent and does not spread into the bestiary', () => {
    const context = knowledge.sourceContexts.find(context => context.id === 'oasis-source-scope');
    assert.deepEqual([context.entityId, context.sourceRecordId, context.label, context.source.file, context.source.locator],
        [entity('western-desert-oasis'), 'alqadim:chapter:3:hint', 'Oasis', 'guides/js/AlQadim.js', 'DB.chapters[2]']);
    const parent = authorize(allRecords.alqadim.find(record => record.id === context.sourceRecordId), 'direct');
    assert.ok(parent.title.includes(context.label));
    assert.deepEqual(factSourceContexts({ fact: facts.get('ch3_5'), contexts: knowledge.sourceContexts }).map(context => context.id), ['oasis-source-scope']);
    assert.ok(!factSourceContexts({ fact: facts.get('ch4_2'), contexts: knowledge.sourceContexts }).some(context => context.id === 'oasis-source-scope'));
    const combat = authorize(allRecords.alqadim.find(record => record.id === 'alqadim:bestiary:giant-boar:combat'), 'direct');
    assert.deepEqual(factSourceContexts({ fact: { text: combat.text, source: combat.source }, contexts: knowledge.sourceContexts }), []);
});

test('boar location and combat are independently witnessed without upgrading the objective', () => {
    const objective = facts.get('ch3_5'), location = links.get('boar-oasis-outskirts');
    assert.deepEqual([location.from, location.to, location.relation], [objective.entityId, entity('oasis-outskirts'), 'located_in']);
    assert.deepEqual(location.evidenceFactIds, ['ch3_5']);
    assert.match(objective.witness, /giant boar roaming the oasis outskirts/);
    assert.deepEqual(objective.answerRelations, ['objective', 'outcome', 'location']);
    assert.ok(!objective.answerRelations.some(role => ['method', 'use', 'combat', 'acquisition'].includes(role)));
    assert.ok(!objective.bindings.some(binding => binding.entityId === entity('oasis-outskirts')), 'the boar location does not locate the outskirts themselves');
    const strategy = aq.DB.bestiary.find(creature => creature.name === 'Giant Boar');
    assert.equal(strategy.strategy, 'Charges in straight lines. Dodge sideways, then strike from behind.');
    const combat = authorize(allRecords.alqadim.find(record => record.id === 'alqadim:bestiary:giant-boar:combat'), 'direct');
    assert.equal(combat.entityId, objective.entityId);
    assert.ok(combat.text.includes(strategy.strategy));
    assert.deepEqual([combat.source.file, combat.source.locator], ['guides/js/AlQadim.js', 'DB.bestiary[3].strategy/danger']);
    assert.ok(!combat.text.includes(objective.text));
});
