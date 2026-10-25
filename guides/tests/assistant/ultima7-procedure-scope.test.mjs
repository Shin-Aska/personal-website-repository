// Original-guide fixture checks only; no model loading, encoding or inference.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { allRecords, u7 } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { factSourceContexts } from '../../js/assistant/source-contexts.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${name}`, import.meta.url)));
const manifest = read('ultima7.json');
const knowledge = buildKnowledge('ultima7', allRecords.ultima7, manifest);
const facts = new Map(knowledge.facts.map(fact => [fact.id, fact]));
const sword = 'ultima7:knowledge-entity:black-sword';
const gem = 'ultima7:knowledge-entity:ether-gem';
const artifact = 'ultima7:knowledge-entity:artifact-of-power';
const contexts = id => factSourceContexts({ fact: facts.get(id), contexts: knowledge.sourceContexts }).map(value => value.id);
const binds = (id, entityId) => facts.get(id).bindings.find(binding => binding.entityId === entityId);

test('Ultima VII metadata compiles and every extracted witness remains literally authorized', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(knowledge.facts.length, 123);
    assert.equal(knowledge.links.length, 68);
    assert.equal(knowledge.sourceContexts.length, 5);
    const orrery=knowledge.sourceContexts.find(context=>context.id==='brion-orrery-source-context');
    assert.equal(orrery.entityId,'ultima7:quest:brion-s-orrery');
    assert.equal(orrery.sourceRecordId,'ultima7:quest:brion-s-orrery:hint');
    assert.equal(orrery.source.locator,'DB.sideQuests[10]');
    assert.equal(orrery.label,"Brion's Orrery");
    for (const fact of knowledge.facts.filter(fact => fact.source.review !== 'external-research')) {
        assert.equal(fact.text, fact.witness, fact.id);
        const record = allRecords.ultima7.find(record => record.id === fact.sourceRecordId);
        assert.ok(authorize(record, 'direct').text.includes(fact.witness), fact.id);
    }
});

test('all 123 fact documents and frozen source identity fields remain unchanged', () => {
    const catalog = read('ultima7-embeddings.json');
    assert.deepEqual(manifest.facts.map(fact => ({ factId: fact.id, text: knowledgeDocument(fact) })),
        catalog.documents.map(({ factId, text }) => ({ factId, text })));
    const fields = ['id', 'subject', 'facet', 'aliases', 'text', 'witness', 'source', 'sourceRecordId'];
    const projection = manifest.facts.map(fact => Object.fromEntries(fields.filter(field => field in fact)
        .map(field => [field, fact[field]])));
    assert.equal(createHash('sha256').update(JSON.stringify(projection)).digest('hex'),
        '83447ed627458a032d2f4a9ff4b1fdc15f6a93315ed60b84b26a2a26a65ebf74');
});

test('the literal forging recipe owns the Black Sword and keeps acquisition separate from using its power', () => {
    assert.equal(u7.DB.virtueQuests[6].content,
        "Ask Erethian about the artifact of power. Free Arcadion into the Ether Gem via the mirror. Heat and hammer the blade at the forge until it's sharp, then bind the daemon to forge the Black Sword.");
    assert.equal(u7.DB.virtueQuests[7].content,
        "Return to Dracothraxus and invoke the Black Sword's power to finish the test. Assemble the two museum lenses and the Talismans of Principle on the Dark Core per instructions, then report to Lord British for his reward.");
    for (const id of ['black-sword-forging', 'sword-forge-subject', 'black-sword-full-method']) {
        assert.equal(facts.get(id).entityId, sword, id);
        assert.deepEqual(binds(id, sword).relations, ['acquisition', 'method', 'sequence'], id);
        assert.ok(!binds(id, sword).relations.includes('use'));
    }
    for (const id of ['courage-finish-sword', 'sword-courage-use']) {
        assert.deepEqual(binds(id, sword).relations, ['use', 'method', 'outcome'], id);
        assert.ok(!facts.get(id).answerRelations.includes('acquisition'));
        assert.ok(!facts.get(id).answerRelations.includes('sequence'));
    }
});

test('artifact of power is a sourced conversation lead and does not acquire an invented item identity', () => {
    assert.deepEqual(binds('black-sword-full-method', artifact), {
        entityId: artifact, mention: 'artifact of power', relations: ['method']
    });
    assert.deepEqual(binds('black-sword-full-method', 'ultima7:npc:erethian'), {
        entityId: 'ultima7:npc:erethian', mention: 'Erethian', relations: ['method']
    });
    assert.equal(knowledge.entities.get(artifact).kind, 'topic');
    const lead = knowledge.links.find(link => link.id === 'artifact-power-erethian-lead');
    assert.deepEqual([lead.from, lead.to, lead.relation, lead.status],
        [artifact, 'ultima7:npc:erethian', 'ask-about', 'conditional']);
    assert.deepEqual(lead.evidenceFactIds, ['black-sword-full-method']);
    assert.equal(lead.qualifiers[0], 'Ask Erethian about the artifact of power.');
    assert.ok(!knowledge.links.some(link => link.from === artifact && link.to === sword));
});

test('Ether Gem acquisition and mirror use retain their separate literal subject roles', () => {
    assert.equal(facts.get('ether-gem-dragon').text, 'defeat Dracothraxus for the Ether Gem');
    assert.deepEqual(binds('ether-gem-dragon', gem).relations, ['acquisition', 'method']);
    assert.equal(facts.get('arcadion-mirror').entityId, 'ultima7:interest:arcadion');
    assert.equal(facts.get('arcadion-mirror').text, 'Free Arcadion into the Ether Gem via the mirror.');
    for (const id of ['arcadion-mirror', 'black-sword-full-method']) {
        assert.deepEqual(binds(id, gem).relations, ['use', 'method'], id);
        assert.ok(!binds(id, gem).relations.includes('acquisition'));
    }
    assert.deepEqual(binds('ether-gem-dragon', 'ultima7:monster:dracothraxus').relations, ['objective']);
});

test('source container scopes never spread forging into the later finale or the earlier Courage trial', () => {
    for (const id of ['arcadion-mirror', 'black-sword-forging', 'sword-forge-subject', 'black-sword-full-method'])
        assert.deepEqual(contexts(id), ['black-sword-forging-source-context'], id);
    for (const id of ['courage-sleep-potions', 'ether-gem-dragon', 'test-courage-definition'])
        assert.deepEqual(contexts(id), ['courage-trial-source-context'], id);
    for (const id of ['courage-finish-sword', 'sword-courage-use', 'dark-core-assembly', 'forge-reward-caveat'])
        assert.deepEqual(contexts(id), [], id);
});

test('literal reward and assembly subjects have only their supported roles', () => {
    assert.equal(facts.get('love-talisman').text, 'Receive the Talisman of Love when done.');
    assert.deepEqual(binds('love-talisman', 'ultima7:knowledge-entity:talisman-of-love').relations,
        ['acquisition', 'outcome']);
    assert.deepEqual(binds('dark-core-assembly', 'ultima7:topic:talismans').relations, ['use', 'method']);
    const assembly = knowledge.links.find(link => link.id === 'talismans-dark-core');
    assert.deepEqual([assembly.from, assembly.to, assembly.relation],
        ['ultima7:topic:talismans', 'ultima7:knowledge-entity:dark-core', 'assemble-on']);
    assert.deepEqual(assembly.evidenceFactIds, ['dark-core-assembly']);
    assert.equal(facts.get('forge-reward-caveat').text,
        'Lord British will reward you by raising your Strength, Dexterity, and Intelligence to 30 (or even 60 in some versions).');
    assert.deepEqual(facts.get('forge-reward-caveat').answerRelations,
        ['stats', 'outcome', 'version', 'limitations']);
});
