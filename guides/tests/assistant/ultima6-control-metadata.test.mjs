import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { lookupGraphQuestion, readGraphQuestion, graphReferenceRoles } from '../../js/assistant/knowledge-graph.js';
import { allRecords } from './load-records.mjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/ultima6.json', import.meta.url)));
const knowledge = buildKnowledge('ultima6', allRecords.ultima6, manifest);
const fact = id => knowledge.facts.find(value => value.id === id);
const entity = name => {
    const matches = [...knowledge.entities.values()].filter(value => value.name === name && value.declared);
    assert.equal(matches.length, 1, `Unique declared entity: ${name}`);
    return matches[0].id;
};
const sha256 = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Ultima VI control metadata preserves every frozen encoded document and exact source tuple', () => {
    const documents = manifest.facts.map(value => ({id:value.id, document:knowledgeDocument(value)}));
    assert.equal(sha256(documents), '6de63e96da17d50e35025ddedd5e68bc3e8ee27d4437807c3a2b7c4ac4ab24f6');
    const protectedFields = manifest.facts.map(value => ({id:value.id, document:knowledgeDocument(value),
        subject:value.subject, facet:value.facet, aliases:value.aliases, text:value.text, witness:value.witness,
        source:value.source, sourceRecordId:value.sourceRecordId}));
    assert.equal(sha256(protectedFields), 'eed18365645c80ffbad807bf333802ecbf83cf7fd2f37f9f679edfd68b009dac');
    assert.deepEqual(knowledge.issues, []);
    assert.equal(knowledge.facts.length, manifest.facts.length);
    assert.equal(knowledge.links.length, manifest.links.length);
    assert.equal(knowledge.sourceRecords.length, allRecords.ultima6.length);
});

test('The mouse hole has its own directly sourced place without relocating Sherry', () => {
    const hole = entity('Mouse hole'), sherry = entity('Sherry');
    const result = lookupGraphQuestion({...knowledge, text:'Where is the mouse hole?', subjectIds:[hole]});
    assert.equal(result.complete, true);
    assert.deepEqual(result.answerEntityIds, [entity('Sword and Keg')]);
    assert.deepEqual(result.factIds, ['sherry-jhelom']);
    assert.match(fact('sherry-jhelom').witness, /Sword and Keg in Jhelom, position Sherry at the mouse hole/);
    assert.ok(!fact('sherry-jhelom').answerRelations.includes('location'));
    assert.ok(!knowledge.links.some(link => link.from === sherry && link.to === entity('Sword and Keg')
        && ['located-at','located-in'].includes(link.relation)));
});

test('Recommended control is an instruction with the exact Sherry actor and complete source proof', () => {
    const link = knowledge.links.find(value => value.id === 'mouse-hole-control-sherry');
    assert.equal(link.from, entity('Mouse hole'));
    assert.equal(link.to, 'ultima6:atlas:marker:Sherry');
    assert.equal(link.relation, 'recommended-controlled-character');
    assert.equal(link.status, 'conditional');
    assert.deepEqual(link.evidenceFactIds, ['sherry-jhelom']);
    assert.match(fact(link.evidenceFactIds[0]).witness, /position Sherry at the mouse hole, and switch control to her\./);
    assert.equal(readGraphQuestion('Who am I controlling?'), null);
    assert.equal(readGraphQuestion('Who am I currently controlling?'), null);
});

test('Rune retrieval and regrouping retain the Sherry, mouse-hole and item scopes of one explicit step', () => {
    const retrieval = fact('sherry-rune');
    assert.equal(retrieval.entityId, entity('Sherry'));
    assert.equal(retrieval.witness, 'Enter the mouse hole as Sherry to grab the rune, then regroup with the party.');
    for (const name of ['Sherry','Mouse hole','Rune of Valor']) {
        const binding = retrieval.bindings.find(value => value.entityId === entity(name));
        assert.ok(binding, name);
        assert.ok(binding.relations.includes('method'), name);
        assert.ok(binding.relations.includes('sequence'), name);
        assert.ok(retrieval.witness.includes(binding.mention), name);
    }
    assert.ok(!retrieval.bindings.find(value => value.entityId === entity('Mouse hole')).relations.includes('acquisition'));
    assert.ok(!knowledge.links.some(link => link.evidenceFactIds.includes('sherry-rune')
        && /requires-after|prerequisite/.test(link.relation)));
});

test('Permission dialogue keeps Anya method, Ariana confirmation and the conditional rune giver distinct', () => {
    assert.equal(fact('anya-permission').entityId, entity('Anya'));
    assert.deepEqual(fact('anya-permission').bindings.map(value => value.entityId), [entity('Anya')]);
    for (const id of ['ariana-consent','ariana-rune','ariana-permission-keyword']) {
        assert.equal(fact(id).entityId, entity('Ariana'), id);
        assert.ok(fact(id).bindings.some(value => value.entityId === entity('Ariana')), id);
        assert.ok(!fact(id).bindings.some(value => value.entityId === entity('Anya')), id);
    }
    const answer = lookupGraphQuestion({...knowledge, text:'Who gives the Rune of Compassion?',
        subjectIds:[entity('Rune of Compassion')]});
    assert.equal(answer.complete, true);
    assert.deepEqual(answer.answerEntityIds, [entity('Ariana')]);
    assert.deepEqual(answer.factIds, ['ariana-rune']);
    const giver = knowledge.links.find(link => link.id === 'ariana-gives-rune');
    assert.equal(giver.status, 'conditional');
    assert.match(fact('ariana-rune').witness, /Return to Ariana, confirm permission/);
    assert.deepEqual(graphReferenceRoles({...knowledge, subjectIds:[entity('Anya')],
        factIds:['anya-permission']}), {provider:[],recipient:[]});
    assert.deepEqual(graphReferenceRoles({...knowledge, subjectIds:[entity('Anya')],
        factIds:['anya-permission','ariana-rune']}), {provider:[],recipient:[]});
    // A continuation contact is not a recipient of an item. Read the authored
    // continues-at edge through its own instruction slot instead.
    const contact=lookupGraphQuestion({...knowledge,text:'Who do I go back to?',subjectIds:[entity('Anya')]});
    assert.equal(contact.complete,true);
    assert.deepEqual(contact.answerEntityIds,[entity('Ariana')]);
    assert.deepEqual(contact.factIds,['anya-permission','ariana-rune']);
});
