// Metadata review only; the separately frozen browser corpus verifies inference.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const manifest = read('../../data/assistant/knowledge/starcraft.json');
const records = read('./evidence/conversation-starcraft-source-records.json');
const knowledge = buildKnowledge('starcraft', records, manifest);
const fact = name => knowledge.facts.find(value => value.id === `starcraft:knowledge:${name}`);

test('StarCraft role metadata preserves all 70 encoded documents and protected source fields', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(manifest.facts.length, 70);
    const catalog = read('../../data/assistant/knowledge/starcraft-embeddings.json');
    assert.deepEqual(manifest.facts.map(value => ({factId:value.id,text:knowledgeDocument(value)})),
        catalog.documents.map(({factId,text}) => ({factId,text})));
    const fields = ['id','subject','facet','aliases','text','witness','source','sourceRecordId','docstrings','researchWitness'];
    const projection = manifest.facts.map(value => Object.fromEntries(fields.filter(key => key in value)
        .map(key => [key,value[key]])));
    assert.equal(createHash('sha256').update(JSON.stringify(projection)).digest('hex'),
        '354aba20f9c0ad7815e4128251402d5d5a505b1d73ef9f8cddff8d8956d7a52e');
});

test('BWAPI framework identity and its quick-start version retain the framework subject', () => {
    const identity = fact('bwapi-identity'), version = fact('bwapi-1161');
    assert.equal(knowledge.entities.get(identity.entityId).kind, 'framework');
    assert.equal(version.entityId, identity.entityId);
    assert.ok(identity.answerRelations.includes('identity'));
    assert.ok(identity.answerRelations.includes('comparison'));
    assert.match(identity.witness, /C\+\+ framework.*programming API, not a prepackaged opponent client/);
    assert.ok(version.answerRelations.includes('version'));
    assert.match(version.witness, /README quick start specifies Brood War 1\.16\.1/);
    assert.match(version.witness, /does not certify arbitrary BWAPI binaries for Remastered/);
    assert.ok(!version.answerRelations.includes('installation'));
});

test('Own-document authorship carries its explicit attribution limitation and dated primary references', () => {
    const author = fact('ualberta-creator');
    assert.equal(author.entityId, fact('ualberta-identity').entityId);
    assert.equal(author.facet, 'creator');
    assert.ok(author.answerRelations.includes('creator'));
    assert.equal(author.conflict, true);
    assert.match(author.witness, /README and official wiki identify David Churchill/);
    assert.match(author.witness, /guide additionally credits Steve Gelly.*do not establish/);
    assert.equal(author.source.review, 'external-research');
    assert.deepEqual(author.source.references.map(value => value.url), [
        'https://github.com/davechurchill/ualbertabot', 'https://github.com/davechurchill/ualbertabot/wiki'
    ]);
    assert.ok(author.source.references.every(value => value.checkedAt === '2026-10-24'));
    assert.ok(!author.answerRelations.includes('documentation'), 'authorship is not a documentation destination');
});

test('Documentation topics keep their project subject without granting installation procedures', () => {
    const docs = fact('ualberta-docs');
    assert.equal(docs.entityId, fact('ualberta-identity').entityId);
    assert.deepEqual(docs.answerRelations, ['documentation']);
    assert.match(docs.witness, /wiki links installation, architecture, configuration/);
    assert.deepEqual(docs.resources.map(value => value.url), ['https://github.com/davechurchill/ualbertabot/wiki']);
    assert.equal(fact('bwapi-docs').entityId, fact('bwapi-identity').entityId);
});

test('The runtime comparison retains PurpleWave requirements and does not bind them to SCHNAIL', () => {
    const runtime = fact('purplewave-java');
    assert.equal(runtime.entityId, fact('purplewave-identity').entityId);
    for (const relation of ['prerequisites','version','cause','comparison'])
        assert.ok(runtime.answerRelations.includes(relation));
    assert.match(runtime.witness, /32-bit JDK 8.*32-bit BWAPI/);
    assert.match(runtime.witness, /Do not substitute.*SCHNAIL Java 21 recommendation/);
    assert.deepEqual(runtime.bindings.map(value => value.entityId), ['starcraft:purplewave-java-runtime']);
    assert.equal(runtime.source.references[0].url, 'https://github.com/dgant/PurpleWave');
    assert.ok(!runtime.answerRelations.includes('installation'));
});
