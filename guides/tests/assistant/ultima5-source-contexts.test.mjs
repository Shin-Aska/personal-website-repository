import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { compileSourceContexts, factSourceContexts } from '../../js/assistant/source-contexts.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${name}`, import.meta.url)));
const manifest = read('ultima5.json');
const knowledge = buildKnowledge('ultima5', allRecords.ultima5, manifest);
const byFact = new Map(knowledge.facts.map(fact => [fact.id, fact]));
const ids = fact => factSourceContexts({ fact, contexts: knowledge.sourceContexts }).map(context => context.id);
const grapple = 'ultima5:source-context:opening-grapple';
const cape = 'ultima5:source-context:opening-hms-cape';

test('Ultima V contexts compile from actual directly authorized parents and canonical existing item entities', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(knowledge.sourceContexts.length, 6);
    for (const [id, entityId, parentId, label, title, locator] of [
        [grapple, 'ultima5:item:grapple', 'ultima5:objective:opening-grapple:hint', 'Grapple', 'Secure the Grapple',
            'ultima5GrandQuestChapters objective=opening-grapple'],
        [cape, 'ultima5:item:hms-cape-plans', 'ultima5:objective:opening-hms-cape:hint', 'HMS Cape plans',
            'Steal the HMS Cape plans', 'ultima5GrandQuestChapters objective=opening-hms-cape']
    ]) {
        const parent = authorize(allRecords.ultima5.find(record => record.id === parentId), 'direct');
        const context = knowledge.sourceContexts.find(value => value.id === id);
        assert.equal(parent.title, title);
        assert.ok(parent.title.includes(label));
        assert.equal(knowledge.entities.get(entityId).name, label);
        assert.deepEqual(context, { id, entityId, sourceRecordId: parentId, label,
            source: { file: 'guides/js/Ultima5.js', locator, review: 'extracted' } });
        assert.deepEqual(compileSourceContexts({ contexts: [manifest.sourceContexts.find(value => value.id === id)],
            entities: knowledge.entities, sourceRecords: [parent] }), { contexts: [context], issues: [] });
        assert.deepEqual(Object.keys(context).sort(), ['entityId', 'id', 'label', 'source', 'sourceRecordId']);
    }
});

test('actual Grapple and HMS Cape facts share only their exact objective container', () => {
    const expected = new Map([
        [grapple, ['michael-location', 'michael-keyword', 'grapple-keyword', 'grapple-inventory',
            'grapple-named-giver', 'grapple-traversal-outcome']],
        [cape, ['cape-entrance', 'cape-locks', 'cape-drawers', 'cape-upgrade', 'cape-speed']]
    ]);
    for (const [context, facts] of expected) {
        assert.deepEqual(knowledge.facts.filter(fact => ids(fact).includes(context)).map(fact => fact.id), facts);
        for (const id of facts) assert.deepEqual(ids(byFact.get(id)), [context], id);
    }
    assert.deepEqual(ids(byFact.get('party-start')), ['source-fields-party-context']);
    for (const id of ['side-grapple', 'side-hms-cape']) assert.deepEqual(ids(byFact.get(id)), [], id);
    const inventory = byFact.get('grapple-inventory');
    assert.deepEqual(ids({ ...inventory, source: { ...inventory.source, file: 'guides/js/other.js' } }), []);
    for (const locator of [
        'ultima5GrandQuestChapters objective=opening-grapple-extra.steps[2]',
        'ultima5GrandQuestChapters objective=opening-grapple.steps[02]',
        'ultima5GrandQuestChapters objective=opening-grapple.steps[2]; ultima5GrandQuestChapters objective=opening-hms-cape.steps[2]',
        'ultima5GrandQuestChapters objective=opening-grapple.steps[2]; ultima5SideQuests id=side-grapple.detail'
    ]) assert.deepEqual(ids({ ...inventory, source: { ...inventory.source, locator } }), [], locator);
    assert.deepEqual(ids({ ...inventory, source: { ...inventory.source,
        locator: 'ultima5GrandQuestChapters objective=opening-grapple.steps[1]; ultima5GrandQuestChapters objective=opening-grapple.steps[2]' } }), [grapple]);
});

test('real side-quest id selector remains a separate structural source container', () => {
    const parent = authorize(allRecords.ultima5.find(record => record.id === 'ultima5:side:side-hms-cape:hint'), 'direct');
    const result = compileSourceContexts({ contexts: [{ id: 'test-side-cape', entityId: 'ultima5:item:hms-cape-plans',
        sourceRecordId: parent.id, label: 'HMS Cape' }], entities: knowledge.entities, sourceRecords: [parent] });
    assert.deepEqual(result.issues, []);
    assert.equal(parent.title, 'Steal the HMS Cape Plans');
    assert.equal(parent.source.locator, 'ultima5SideQuests id=side-hms-cape');
    assert.deepEqual(factSourceContexts({ fact: byFact.get('side-hms-cape'), contexts: result.contexts }).map(context => context.id), ['test-side-cape']);
    for (const id of ['side-grapple', 'cape-drawers'])
        assert.deepEqual(factSourceContexts({ fact: byFact.get(id), contexts: result.contexts }), [], id);
});

test('context metadata preserves all source facts, graph links and 125 frozen encoded documents', () => {
    const withoutContexts = buildKnowledge('ultima5', allRecords.ultima5, { ...manifest, sourceContexts: [] });
    assert.deepEqual(knowledge.facts, withoutContexts.facts);
    assert.deepEqual(knowledge.links, withoutContexts.links);
    assert.deepEqual(knowledge.sourceRecords, withoutContexts.sourceRecords);
    const frozen = read('ultima5-embeddings.json');
    assert.equal(manifest.facts.length, 125);
    assert.deepEqual(manifest.facts.map(fact => ({ factId: fact.id, text: knowledgeDocument(fact) })),
        frozen.documents.map(({ factId, text }) => ({ factId, text })));
});
