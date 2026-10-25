// Static source checks only: no model, encoder, browser or player-state writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { allRecords, albion } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${name}`, import.meta.url)));
const manifest = read('albion.json');
const knowledge = buildKnowledge('albion', allRecords.albion, manifest);
const fact = id => knowledge.facts.find(value => value.id === id);
const link = id => knowledge.links.find(value => value.id === id);
const entity = name => {
    const values = [...knowledge.entities.values()].filter(value => value.declared && value.name === name);
    assert.equal(values.length, 1, `Unique declared entity: ${name}`);
    return values[0].id;
};
const binding = (id, name) => fact(id).bindings.find(value => value.entityId === entity(name));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('component metadata preserves every fact identity, literal witness and frozen document', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(manifest.facts.length, 132);
    assert.equal(knowledge.facts.length, 132);
    assert.equal(manifest.entities.length, 114);
    assert.equal(manifest.links.length, 40);
    const fields = ['id', 'subject', 'facet', 'aliases', 'text', 'witness', 'source', 'sourceRecordId'];
    const projection = manifest.facts.map(value => Object.fromEntries(fields.filter(field => field in value)
        .map(field => [field, value[field]])));
    assert.equal(hash(projection), 'b512e9ca9aaee0817c570651397ab6b69703f6d4c1fe6fb42994b9122ed912a7');
    const documents = manifest.facts.map(value => ({ factId: value.id, text: knowledgeDocument(value) }));
    assert.equal(hash(documents), '7299517b59d634558c2fb82c7df58ff5559448ffc8d19f020f856f41905fce5f');
    assert.deepEqual(documents, read('albion-embeddings.json').documents.map(({ factId, text }) => ({ factId, text })));
});

test('pickup and concealment remain the full exact authorized source instructions', () => {
    for (const id of ['pistol', 'hide-weapon']) {
        assert.equal(fact(id).witness, albion.QUEST_HINTS['toronto-intro'][id]);
        const source = authorize(allRecords.albion.find(value => value.id === fact(id).sourceRecordId), 'direct');
        assert.ok(source.text.includes(fact(id).witness));
    }
    assert.equal(fact('pistol').text, 'In the COM room, examine the damaged console to get the Pistol + Canisters; grab the extra Stimdrinks from the east drawer.');
    assert.equal(fact('hide-weapon').text, 'After looting the COM room, hide the Pistol + Canisters in the wall cabinet on the service level before passing security.');
    assert.equal(fact('hide-weapon').entityId, entity('Toronto security'));
});

test('Canisters and the literal bundle are distinct subjects with exact pickup and hiding bindings', () => {
    assert.equal(knowledge.entities.get(entity('Canisters')).kind, 'item');
    assert.equal(knowledge.entities.get(entity('Pistol + Canisters')).kind, 'bundle');
    assert.equal(new Set(['Pistol', 'Canisters', 'Pistol + Canisters'].map(entity)).size, 3);
    for (const name of ['Canisters', 'Pistol + Canisters']) {
        assert.deepEqual(binding('pistol', name), { entityId: entity(name), mention: name,
            relations: ['acquisition', 'location', 'method'] });
        assert.deepEqual(binding('hide-weapon', name), { entityId: entity(name), mention: name,
            relations: ['method', 'location', 'use'] });
    }
    assert.deepEqual(new Set(fact('hide-weapon').bindings.map(value => value.entityId)),
        new Set(['Pistol', 'Canisters', 'Pistol + Canisters'].map(entity)));
    assert.ok(!binding('hide-weapon', 'Canisters').relations.includes('acquisition'));
});

test('directed component edges preserve both literal objects without an ownership claim', () => {
    const components = knowledge.links.filter(value => value.from === entity('Pistol + Canisters')
        && value.relation === 'has-component');
    assert.equal(components.length, 2);
    assert.deepEqual(new Set(components.map(value => value.to)), new Set(['Pistol', 'Canisters'].map(entity)));
    for (const value of components) {
        assert.deepEqual(value.evidenceFactIds, ['pistol', 'hide-weapon']);
        assert.equal(value.status, 'recorded');
        assert.ok(value.qualifiers.length);
    }
    assert.ok(!knowledge.links.some(value => [entity('Pistol'), entity('Canisters')].includes(value.from)
        && value.relation === 'has-component'));
    assert.ok(!knowledge.links.some(value => /owns|possesses|carried-by/.test(value.relation)));
});

test('ammunition use is independently proved and never substitutes the security instruction', () => {
    assert.equal(fact('pistol-effect').text, 'Ranged. +60 LON, uses Canisters. Damage: 30.');
    assert.equal(albion.DB.equipment[5].effect, '+60 LON, uses Canisters');
    const use = link('pistol-uses-canisters');
    assert.deepEqual([use.from, use.to, use.relation, use.status],
        [entity('Pistol'), entity('Canisters'), 'uses', 'recorded']);
    assert.deepEqual(use.evidenceFactIds, ['pistol-effect']);
    assert.deepEqual(binding('pistol-effect', 'Canisters').relations, ['use', 'prerequisites']);
    assert.ok(!fact('pistol-effect').bindings.some(value => value.entityId === entity('Toronto security')));
});

test('both added COM location edges point to the console pickup proof alone', () => {
    for (const id of ['canisters-com', 'pistol-canisters-com']) {
        const value = link(id);
        assert.equal(value.relation, 'found-at');
        assert.equal(value.to, entity('COM room'));
        assert.deepEqual(value.evidenceFactIds, ['pistol']);
        assert.match(fact(value.evidenceFactIds[0]).witness, /COM room, examine the damaged console/);
        assert.ok(!value.evidenceFactIds.includes('hide-weapon'));
    }
});
