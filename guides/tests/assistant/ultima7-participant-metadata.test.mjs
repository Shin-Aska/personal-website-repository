// Source-only participant checks; no model loading, encoding, network or save state.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { allRecords, u7, u7Markers } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { factSourceContexts } from '../../js/assistant/source-contexts.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${name}`, import.meta.url)));
const manifest = read('ultima7.json');
const knowledge = buildKnowledge('ultima7', allRecords.ultima7, manifest);
const facts = new Map(knowledge.facts.map(fact => [fact.id, fact]));
const links = new Map(knowledge.links.map(link => [link.id, link]));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sword = 'ultima7:knowledge-entity:black-sword';
const gem = 'ultima7:knowledge-entity:ether-gem';
const daemon = 'ultima7:interest:arcadion';
const mirror = 'ultima7:knowledge-entity:mirror';

test('participant metadata preserves every protected fact field and encoded document', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(manifest.facts.length, 123);
    const fields = ['id', 'subject', 'facet', 'aliases', 'text', 'witness', 'source', 'sourceRecordId', 'researchWitness', 'editions'];
    assert.equal(hash(manifest.facts.map(fact => Object.fromEntries(fields.filter(field => field in fact)
        .map(field => [field, fact[field]])))),
    'c9c4120a67f2ba1bf1b183fa89a1b8113d6b8810f9d71f175350f1c18715ab5a');
    assert.equal(hash(manifest.facts.map(knowledgeDocument)),
        'faf212b7cfb9500aba33bf9143c3f6eb56d3e607cc273cb07d6776474f7756e2');
    assert.deepEqual(manifest.facts.map(fact => ({factId: fact.id, text: knowledgeDocument(fact)})),
        read('ultima7-embeddings.json').documents.map(({factId, text}) => ({factId, text})));
});

test('the named Courage opponent stays distinct from its obtainable gem and source quest', () => {
    const edge = links.get('dracothraxus-gem');
    assert.deepEqual([edge.from, edge.to, edge.relation],
        ['ultima7:monster:dracothraxus', gem, 'defeat-to-obtain']);
    assert.deepEqual(edge.evidenceFactIds, ['ether-gem-dragon', 'courage-sleep-potions']);
    assert.equal(edge.sourceContextId, 'courage-trial-source-context');
    assert.equal(knowledge.entities.get(edge.from).kind, 'monster');
    assert.equal(knowledge.entities.get(edge.to).kind, 'item');
    assert.notEqual(edge.from, facts.get('courage-sleep-potions').entityId);
    assert.equal(facts.get('courage-sleep-potions').entityId, 'ultima7:quest:test-of-courage');
    assert.equal(facts.get('ether-gem-dragon').entityId, gem);
    assert.equal(facts.get('ether-gem-dragon').text, 'defeat Dracothraxus for the Ether Gem');
    assert.ok(facts.get('courage-sleep-potions').text.includes('Use sleep potions on dragons'));
    assert.ok(u7.DB.virtueQuests[5].content.includes(facts.get('courage-sleep-potions').witness));
    for (const factId of edge.evidenceFactIds) assert.ok(factSourceContexts({fact: facts.get(factId), contexts: knowledge.sourceContexts})
        .some(context => context.id === edge.sourceContextId));
    assert.ok(edge.qualifiers.some(value => value.includes('not establish a voluntary gift or current inventory')));
});

test('the complete named forging instruction and marker identify the daemon without replacing the artifact', () => {
    const full = facts.get('black-sword-full-method'), identity = facts.get('arcadion-daemon-identity');
    assert.equal(full.text, u7.DB.virtueQuests[6].content);
    assert.equal(full.entityId, sword);
    assert.equal(identity.entityId, daemon);
    assert.equal(identity.text, `Arcadion: ${u7Markers[491].description}`);
    assert.ok(identity.text.includes('The bound daemon of the Blackrock Sword'));
    const binding = links.get('black-sword-binding');
    assert.deepEqual([binding.from, binding.to, binding.relation], [sword, daemon, 'binds-daemon']);
    assert.deepEqual(binding.evidenceFactIds, ['black-sword-full-method']);
    assert.equal(binding.sourceContextId, 'black-sword-forging-source-context');
    assert.notEqual(binding.to, gem);
    assert.ok(!full.bindings.find(binding => binding.entityId === daemon).relations.includes('acquisition'));
});

test('vessel and instrument are separately directed participants of one full source method', () => {
    for (const [id, from, to, relation] of [
        ['black-sword-binding-vessel', sword, gem, 'binding-vessel'],
        ['black-sword-binding-instrument', sword, mirror, 'binding-instrument'],
        ['arcadion-mirror-instrument', daemon, mirror, 'freed-via']
    ]) {
        const edge = links.get(id);
        assert.deepEqual([edge.from, edge.to, edge.relation, edge.status], [from, to, relation, 'recorded']);
        assert.deepEqual(edge.evidenceFactIds, ['black-sword-full-method']);
        assert.equal(edge.sourceContextId, 'black-sword-forging-source-context');
        const full = facts.get(edge.evidenceFactIds[0]);
        assert.ok(full.witness.includes(edge.qualifiers[0]));
        assert.ok(factSourceContexts({fact: full, contexts: knowledge.sourceContexts})
            .some(context => context.id === edge.sourceContextId));
        assert.match(edge.qualifiers[1], /does not establish completed binding, current possession, or an independent acquisition procedure/);
    }
    const freed = links.get('mirror-arcadion-gem');
    assert.deepEqual([freed.from, freed.to, freed.relation], [daemon, gem, 'freed-into-via-mirror']);
    assert.deepEqual(freed.evidenceFactIds, ['arcadion-mirror']);
    assert.equal(freed.sourceContextId, 'black-sword-forging-source-context');
    assert.equal(facts.get('arcadion-mirror').text, 'Free Arcadion into the Ether Gem via the mirror.');
});

test('mirror bindings provide literal method scope without creating a mirror acquisition or location', () => {
    assert.deepEqual(manifest.entities.find(entity => entity.id === mirror),
        {id: mirror, name: 'mirror', kind: 'item', aliases: []});
    for (const factId of ['arcadion-mirror', 'black-sword-full-method']) {
        const fact = facts.get(factId);
        assert.deepEqual(fact.bindings.find(binding => binding.entityId === mirror),
            {entityId: mirror, mention: 'mirror', relations: ['method']});
        const record = allRecords.ultima7.find(record => record.id === fact.sourceRecordId);
        assert.ok(authorize(record, 'direct').text.includes(fact.witness));
    }
    assert.ok(!knowledge.links.some(link => link.from === mirror && ['located-at', 'given-by', 'obtained-from'].includes(link.relation)));
});

test('Magebane preserves the explicit on-hit effect without inventing a passive carrying rule', () => {
    const fact = facts.get('equipment-magebane'), edge = links.get('magebane-mana');
    assert.equal(u7.DB.equipment[5].effect, 'Drains Mana on Hit');
    assert.equal(fact.text, 'Magebane: Drains Mana on Hit. Type: 1H Weapon.');
    assert.ok(fact.topicLabels.includes(u7.DB.equipment[5].effect));
    assert.deepEqual(fact.answerRelations, ['identity', 'use', 'combat']);
    assert.deepEqual([edge.from, edge.to, edge.relation],
        ['ultima7:equipment:magebane', 'ultima7:knowledge-entity:mana', 'drains-on-hit']);
    assert.deepEqual(edge.evidenceFactIds, ['equipment-magebane']);
    assert.doesNotMatch(fact.text, /carry|carrying|passive|only/i);
});
