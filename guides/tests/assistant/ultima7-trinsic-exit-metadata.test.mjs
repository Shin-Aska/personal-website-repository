// Static authorized-guide checks only: no model, encoder or browser required.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { allRecords } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { factSourceContexts } from '../../js/assistant/source-contexts.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${name}`, import.meta.url)));
const manifest = read('ultima7.json');
const knowledge = buildKnowledge('ultima7', allRecords.ultima7, manifest);
const exit = knowledge.facts.find(fact => fact.id === 'finnigan-exit');
const binding = id => exit.bindings.find(value => value.entityId === id);

test('Trinsic exit roles compile without changing any fact document or protected identity field', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(knowledge.facts.length, 123);
    const catalog = read('ultima7-embeddings.json');
    assert.deepEqual(manifest.facts.map(fact => ({ factId: fact.id, text: knowledgeDocument(fact) })),
        catalog.documents.map(({ factId, text }) => ({ factId, text })));
    const fields = ['id', 'subject', 'facet', 'aliases', 'text', 'witness', 'source', 'sourceRecordId'];
    const projection = manifest.facts.map(fact => Object.fromEntries(fields.filter(field => field in fact)
        .map(field => [field, fact[field]])));
    assert.equal(createHash('sha256').update(JSON.stringify(projection)).digest('hex'),
        '83447ed627458a032d2f4a9ff4b1fdc15f6a93315ed60b84b26a2a26a65ebf74');
});

test('the exit passage retains its quest owner and binds the named Mayor and password to their literal roles', () => {
    assert.equal(exit.entityId, 'ultima7:quest:the-trinsic-murders');
    assert.deepEqual(exit.answerRelations, ['acquisition', 'method', 'prerequisites', 'outcome']);
    assert.deepEqual(binding('ultima7:npc:finnigan'), {
        entityId: 'ultima7:npc:finnigan', mention: 'Mayor Finnigan',
        relations: ['method', 'prerequisites', 'outcome']
    });
    assert.deepEqual(binding('ultima7:knowledge-entity:blackbird'), {
        entityId: 'ultima7:knowledge-entity:blackbird', mention: 'Blackbird',
        relations: ['acquisition', 'method', 'prerequisites', 'outcome']
    });
    assert.ok(knowledge.entities.get('ultima7:npc:finnigan').aliases.includes('Mayor Finnigan'));
    assert.ok(!binding('ultima7:npc:finnigan').relations.includes('acquisition'));
});

test('the complete report, quiz answers and future password outcome remain one literal authorized witness', () => {
    const record = allRecords.ultima7.find(record => record.id === exit.sourceRecordId);
    assert.ok(authorize(record, 'direct').text.includes(exit.witness));
    assert.ok(exit.text.startsWith('Report to Mayor Finnigan and pass his copy protection quiz with these answers:'));
    assert.ok(exit.text.endsWith("He will then give you the password 'Blackbird' to leave the city."));
    assert.deepEqual(exit.text.split('\n\n')[1].split('\n'), [
        'Spektran latitude: 120', 'Terfin longitude: 120', 'Dagger Isle latitude: 0',
        'Skara Brae latitude: 30', 'Deep Forest latitude: 60',
        "Buccaneer's Den latitude: 60", 'Skara Brae longitude: 60'
    ]);
    assert.deepEqual(factSourceContexts({ fact: exit, contexts: knowledge.sourceContexts }).map(context => context.id),
        ['trinsic-source-context']);
});

test('the password grant keeps the report and quiz condition and establishes no player completion', () => {
    const grant = knowledge.links.find(link => link.id === 'finnigan-grants-password');
    assert.deepEqual([grant.from, grant.to, grant.relation, grant.status],
        ['ultima7:npc:finnigan', 'ultima7:knowledge-entity:blackbird', 'grants-exit-password', 'conditional']);
    assert.deepEqual(grant.evidenceFactIds, ['finnigan-exit']);
    for (const qualifier of grant.qualifiers.slice(0, 2)) assert.ok(exit.witness.includes(qualifier));
    assert.match(grant.qualifiers.at(-1), /does not establish current player state/);
});

test('the literal report instruction supplies one direct contact edge', () => {
    const report = knowledge.links.find(link => link.id === 'trinsic-report-finnigan');
    assert.deepEqual([report.from, report.to, report.relation, report.status],
        ['ultima7:quest:the-trinsic-murders', 'ultima7:npc:finnigan', 'report-to', 'conditional']);
    assert.deepEqual(report.evidenceFactIds, ['finnigan-exit']);
    assert.ok(report.qualifiers.length && report.qualifiers.every(qualifier => exit.witness.includes(qualifier)));
});
