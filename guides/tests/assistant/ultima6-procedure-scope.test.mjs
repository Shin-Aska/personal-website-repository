import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { authorize } from '../../js/assistant/policy.js';
import { factSourceContexts } from '../../js/assistant/source-contexts.js';
import { allRecords, u6 } from './load-records.mjs';

const read = name => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${name}`, import.meta.url)));
const manifest = read('ultima6.json');
const knowledge = buildKnowledge('ultima6', allRecords.ultima6, manifest);
const fact = id => knowledge.facts.find(value => value.id === id);
const entity = name => {
    const matches = [...knowledge.entities.values()].filter(value => value.name === name && value.declared);
    assert.equal(matches.length, 1, `Unique declared entity: ${name}`);
    return matches[0].id;
};
const binding = (id, name) => fact(id).bindings.find(value => value.entityId === entity(name));
const contexts = id => factSourceContexts({ fact: fact(id), contexts: knowledge.sourceContexts }).map(value => value.id);
const sha256 = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const at = (section, step) => `gameData.quests[0].sections[${section}].steps[${step}]`;

// These are exact source tuples, not examples assembled from the answer index.
const sourceSteps = [
    ['manrel-key', at(1, 0), u6.gameData.quests[0].sections[1].steps[0]],
    ['beyvin-flowers', at(1, 2), u6.gameData.quests[0].sections[1].steps[2]],
    ['whitsaber-loan', at(5, 0), u6.gameData.quests[0].sections[5].steps[0]],
    ['honor-pedestal', at(5, 1), u6.gameData.quests[0].sections[5].steps[1]],
    ['honor-return', at(5, 2), u6.gameData.quests[0].sections[5].steps[2]],
    ...[0, 1, 2].map(step => [`side-3-step-${step}`, `gameData.sideQuests[3].steps[${step}]`, u6.gameData.sideQuests[3].steps[step]])
];

test('Ultima VI procedure metadata preserves the frozen documents and every protected source field', () => {
    assert.deepEqual(knowledge.issues, []);
    const documents = manifest.facts.map(value => ({ id: value.id, document: knowledgeDocument(value) }));
    assert.equal(sha256(documents), '6de63e96da17d50e35025ddedd5e68bc3e8ee27d4437807c3a2b7c4ac4ab24f6');
    assert.equal(sha256(manifest.facts.map(value => ({ id: value.id, document: knowledgeDocument(value),
        subject: value.subject, facet: value.facet, aliases: value.aliases, text: value.text, witness: value.witness,
        source: value.source, sourceRecordId: value.sourceRecordId }))),
    'eed18365645c80ffbad807bf333802ecbf83cf7fd2f37f9f679edfd68b009dac');
    assert.deepEqual(manifest.facts.map(value => ({ factId: value.id, text: knowledgeDocument(value) })),
        read('ultima6-embeddings.json').documents.map(({ factId, text }) => ({ factId, text })));
});

test('scoped acquisition, use, preparation and return claims retain their exact raw authorized source steps', () => {
    for (const [id, locator, raw] of sourceSteps) {
        const indexed = fact(id);
        assert.deepEqual(indexed.source, { file: 'guides/js/Ultima6.js', locator, review: 'extracted' });
        // The guide adapter removes inline code delimiters before authorizing text.
        const authorizedText = raw.replace(/`/g, '');
        assert.equal(indexed.witness, authorizedText, id);
        assert.equal(indexed.text, authorizedText, id);
        const parent = authorize(allRecords.ultima6.find(value => value.id === indexed.sourceRecordId), 'direct');
        assert.ok(parent, id);
        assert.equal(parent.source.file, indexed.source.file, id);
        assert.ok(parent.text.includes(authorizedText), id);
    }
});

test('the KEY request belongs to Manrel while the tomb passage binds key use and rune acquisition separately', () => {
    assert.equal(fact('manrel-key').entityId, entity('Manrel'));
    assert.deepEqual(binding('manrel-key', 'Beyvin key').relations, ['acquisition', 'method', 'prerequisites']);
    assert.equal(binding('manrel-key', 'Beyvin key').mention, 'KEY');
    assert.ok(!binding('manrel-key', 'Beyvin key').relations.includes('location'));
    assert.equal(fact('beyvin-flowers').entityId, entity("Beyvin's tomb"));
    assert.notEqual(fact('beyvin-flowers').entityId, entity('Beyvin'));
    assert.deepEqual(binding('beyvin-flowers', 'Beyvin key').relations, ['use', 'method']);
    assert.ok(!binding('beyvin-flowers', 'Beyvin key').relations.includes('acquisition'));
    assert.deepEqual(binding('beyvin-flowers', 'Rune of Honesty').relations, ['acquisition', 'method', 'sequence']);
    assert.equal(binding('beyvin-flowers', 'Rune of Honesty').mention, 'rune');
    assert.deepEqual(contexts('beyvin-flowers'), ['honesty-source-context']);
    const contact = knowledge.links.find(value => value.id === 'manrel-key');
    assert.equal(contact.relation, 'contact-for-key');
    assert.deepEqual(contact.evidenceFactIds, ['manrel-key']);
    assert.ok(!knowledge.links.some(value => value.from === entity('Manrel') && value.to === entity('Beyvin key')
        && value.relation === 'gives'));
});

test('taking the Honor rune and promising its return do not supply the later return destination proof', () => {
    assert.ok(binding('honor-pedestal', 'Rune of Honor').relations.includes('acquisition'));
    assert.ok(!binding('honor-pedestal', 'central pedestal').relations.includes('destination'));
    assert.ok(!binding('honor-return', 'Rune of Honor').relations.includes('acquisition'));
    assert.ok(binding('honor-return', 'central pedestal').relations.includes('destination'));
    const edge = knowledge.links.find(value => value.id === 'honor-rune-return-pedestal');
    assert.equal(edge.from, entity('Rune of Honor'));
    assert.equal(edge.to, entity('central pedestal'));
    assert.equal(edge.relation, 'return-to');
    assert.equal(edge.status, 'conditional');
    assert.deepEqual(edge.evidenceFactIds, ['honor-return']);
    assert.match(fact(edge.evidenceFactIds[0]).witness, /recover the Moonstone, then return the rune to the pedestal\./);
    assert.ok(!knowledge.links.some(value => value.from === entity('Rune of Honor')
        && value.to === entity('Whitsaber') && value.relation === 'return-to'));
    assert.deepEqual(contexts('honor-pedestal'), ['honor-source-context']);
    assert.deepEqual(contexts('honor-return'), ['honor-source-context']);
});

test('Swamp Cave preparation, travel and treasure share one exact container without becoming interchangeable actions', () => {
    const scene = knowledge.sourceContexts.find(value => value.id === 'swamp-cave-source-context');
    assert.equal(scene.entityId, entity('Swamp Cave'));
    assert.equal(scene.sourceRecordId, 'ultima6:side-quest:explore-the-swamp-cave:hint');
    assert.equal(scene.label, 'Swamp Cave');
    assert.deepEqual(scene.source, { file: 'guides/js/Ultima6.js', locator: 'gameData.sideQuests[3]', review: 'extracted' });
    const parent = authorize(allRecords.ultima6.find(value => value.id === scene.sourceRecordId), 'direct');
    assert.equal(parent.title, u6.gameData.sideQuests[3].title);
    assert.ok(parent.title.includes(scene.label));
    for (const step of [0, 1, 2]) assert.deepEqual(contexts(`side-3-step-${step}`), [scene.id]);
    assert.deepEqual(contexts('side-4-step-0'), []);
    assert.match(fact('side-3-step-0').witness, /^Equip every companion with swamp boots and prepare /);
    assert.doesNotMatch(fact('side-3-step-2').witness, /\b(?:equip|prepare)\b/i);
    assert.match(fact('side-3-step-2').witness, /fourth level.*dead mage.*Storm Cloak/);
    assert.ok(!knowledge.links.some(value => value.from === entity('Swamp Cave') && value.relation === 'requires-after'));
});
