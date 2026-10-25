// Source-only role checks: no model loading, encoding, network or player-state inference.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { allRecords, aq } from './load-records.mjs';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { authorize } from '../../js/assistant/policy.js';
import { compileSourceContexts, factSourceContexts } from '../../js/assistant/source-contexts.js';
import { lookupGraphQuestion } from '../../js/assistant/knowledge-graph.js';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const manifest = read('../../data/assistant/knowledge/alqadim.json');
const catalog = read('../../data/assistant/knowledge/alqadim-embeddings.json');
const knowledge = buildKnowledge('alqadim', allRecords.alqadim, manifest);
const facts = new Map(knowledge.facts.map(fact => [fact.id, fact]));
const links = new Map(knowledge.links.map(link => [link.id, link]));
const id = label => `alqadim:knowledge:${label}`;
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// Captured before this metadata-only review. These fields determine the encoded
// document and the exact authorized witness; additions must not rewrite them.
const protectedFields = ['id', 'subject', 'facet', 'aliases', 'text', 'witness', 'source', 'sourceRecordId'];
test('actor-role additions preserve all protected facts and encoded documents', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(manifest.facts.length, 113);
    assert.equal(hash(manifest.facts.map(fact => Object.fromEntries(protectedFields.map(key => [key, fact[key]])))),
        '237333218a9fa664ae788b3896f191969bbcac73a76e305c0bb2e5ab1a62bb9c');
    assert.equal(hash(manifest.facts.map(knowledgeDocument)),
        '843c043d47970b61c979e8d281832179792a4e42af625026059ea05f364b6df0');
    assert.deepEqual(manifest.facts.map(fact => ({ factId: fact.id, text: knowledgeDocument(fact) })),
        catalog.documents.map(({ factId, text }) => ({ factId, text })));
});

test('escort endpoints distinguish Pangar-Bek at the exit from Tarik at the ship', () => {
    for (const [linkId, actor, destination, factId, witness] of [
        ['pangar-exit', 'pangar-bek', 'old-dungeon-exit', 'ch12_4',
            'Locate and escort the cyclops Pangar-Bek to the dungeon exit.'],
        ['tarik-ship', 'tarik', 'ship', 'ch16_4',
            'Rescue Tarik and escort him back to the ship.']
    ]) {
        const edge = links.get(linkId), fact = facts.get(factId);
        assert.deepEqual([edge.from, edge.to, edge.relation], [fact.entityId, id(destination), 'escorted_to']);
        assert.deepEqual(edge.evidenceFactIds, [factId]);
        assert.equal(fact.text, witness);
        assert.ok(authorize(allRecords.alqadim.find(record => record.id === fact.sourceRecordId), 'direct').text.includes(witness));
        assert.ok(!fact.bindings.some(binding => binding.entityId === id(destination)),
            'the escort destination is not itself the subject being escorted');
        assert.ok(edge.qualifiers.some(qualifier => /objective.*not a report of completed rescue or current location/.test(qualifier)));
        assert.equal(knowledge.entities.get(edge.from).kind, 'person');
        assert.ok(!knowledge.links.some(link => link.from === edge.from && link.to === edge.to && link.relation === 'located_in'),
            'escort destination must not become the actor starting location');
    }
    assert.notEqual(links.get('pangar-exit').from, links.get('tarik-ship').from);
});

test('Old Dungeon editorial scope identifies the explicit escort objective', () => {
    const { contexts, issues } = compileSourceContexts({ contexts: manifest.sourceContexts, entities: knowledge.entities,
        sourceRecords: allRecords.alqadim.map(record => authorize(record, 'direct')).filter(Boolean) });
    assert.deepEqual(issues, []);
    const edge = links.get('old-dungeon-escort-subject');
    assert.deepEqual([edge.from, edge.to, edge.relation], ['alqadim:chapter:12', facts.get('ch12_4').entityId, 'escort_subject']);
    assert.deepEqual(edge.evidenceFactIds, ['ch12_4']);
    assert.equal(edge.sourceContextId, 'old-dungeon-source-scope');
    assert.deepEqual(contexts.filter(context => context.id === edge.sourceContextId).map(context => [context.entityId, context.sourceRecordId, context.label]),
        [['alqadim:chapter:12', 'alqadim:chapter:12:hint', 'Old Dungeon']]);
    for (const factId of ['ch12_2', 'ch12_4']) assert.ok(factSourceContexts({ fact: facts.get(factId), contexts })
        .some(context => context.id === edge.sourceContextId));
    assert.ok(!factSourceContexts({ fact: facts.get('ch16_4'), contexts }).some(context => context.id === edge.sourceContextId));
    assert.ok(edge.qualifiers.some(qualifier => /not completed rescue, current location, or a release procedure/.test(qualifier)));
});

test('reef rescue role uses the explicit source chapter and the captive sister only', () => {
    assert.equal(aq.DB.chapters[3].summary,
        "Infiltrate the undead-infested Reef of the Dead, rescue the mermaid's sister, and claim the Ship Orb.");
    assert.equal(aq.DB.chapters[3].required.find(step => step.id === 'ch4_2').text,
        "Rescue the mermaid's sister locked in the stone cell.");
    const { contexts, issues } = compileSourceContexts({ contexts: manifest.sourceContexts, entities: knowledge.entities,
        sourceRecords: allRecords.alqadim.map(record => authorize(record, 'direct')).filter(Boolean) });
    assert.deepEqual(issues, []);
    const edge = links.get('reef-rescue-subject'), fact = facts.get('ch4_2');
    assert.deepEqual([edge.from, edge.to, edge.relation], ['alqadim:chapter:4', id('mermaid-sister'), 'rescue_subject']);
    assert.deepEqual(edge.evidenceFactIds, ['ch4_2']);
    assert.equal(edge.sourceContextId, 'reef-ship-source-scope');
    assert.ok(factSourceContexts({ fact, contexts }).some(context => context.id === edge.sourceContextId
        && context.entityId === edge.from));
    assert.deepEqual(fact.answerRelations, ['objective', 'location']);
    assert.ok(!fact.bindings.some(binding => binding.entityId === id('stone-cell')),
        'the sister location does not establish the location of the stone cell itself');
    assert.ok(!knowledge.links.some(link => link.relation === 'rescue_subject' && link.to === id('oasis-mermaid')),
        'the quest-giving mermaid is distinct from the captive sister');
    assert.ok(!fact.answerRelations.some(role => ['method', 'acquisition', 'recruitment', 'combat'].includes(role)));
    assert.ok(edge.qualifiers.some(qualifier => /not a release procedure, completed rescue, or recruitment/.test(qualifier)));
});

test('Zubakon location preserves the signless shop and eligible-training condition', () => {
    const fact = facts.get('ch6_4'), edge = links.get('zubakon-signless');
    assert.equal(aq.DB.chapters[5].optional.find(step => step.id === 'ch6_4').text,
        'Visit Zubakon at the shop with no sign to learn any new sword swings you are eligible for.');
    assert.deepEqual([edge.from, edge.to, edge.relation], [fact.entityId, id('shop-with-no-sign'), 'located_in']);
    assert.deepEqual(edge.evidenceFactIds, ['ch6_4']);
    assert.ok(!fact.bindings.some(binding => binding.entityId === id('shop-with-no-sign')),
        'the trainer location does not establish the location of the shop itself');
    const result = lookupGraphQuestion({ ...knowledge, text: 'Where do I find Zubakon for lessons?',
        subjectIds: [fact.entityId] });
    assert.equal(result?.complete, true);
    assert.deepEqual(result.answerEntityIds, [id('shop-with-no-sign')]);
    assert.deepEqual(result.factIds, ['ch6_4']);
    assert.match(facts.get(result.factIds[0]).text, /you are eligible for/);
    assert.notEqual(edge.from, links.get('reef-rescue-subject').to);
});
