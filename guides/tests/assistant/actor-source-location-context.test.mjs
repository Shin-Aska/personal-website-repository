import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords, aq } from './load-records.mjs';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { authorize } from '../../js/assistant/policy.js';
import { sourceActorLocationContext } from '../../js/assistant/source-location-context.js';

const manifest = JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/alqadim.json', import.meta.url)));
const knowledge = buildKnowledge('alqadim', allRecords.alqadim, manifest);
const combat = allRecords.alqadim.find(record => record.id === 'alqadim:bestiary:giant-boar:combat');
const location = allRecords.alqadim.find(record => record.id === 'alqadim:bestiary:giant-boar:location');
const authorized = authorize(combat, 'direct');
const fact = { id: combat.id, entityId: combat.entityId, subject: authorized.title, facet: 'combat',
    answerRelations: ['combat'], text: authorized.text, witness: authorized.text, source: authorized.source,
    record: authorized, recordId: combat.id, sourceRecordId: combat.id };
const terms = ['oasis', 'giant', 'boar'];
const clone = value => JSON.parse(JSON.stringify(value));
const resolve = (options = {}) => sourceActorLocationContext({ fact, sourceRecords: allRecords.alqadim,
    contextTerms: terms, entities: knowledge.entities, isEligible: () => true, ...options });
const denied = options => assert.deepEqual(resolve(options), { records: [], supportedTerms: [] });
const records = (replacementLocation = location, replacementCombat = combat) => [replacementCombat, replacementLocation];

test('the actual full Giant Boar combat and independently sourced location support literal oasis context', () => {
    const original = aq.DB.bestiary.find(creature => creature.name === 'Giant Boar');
    assert.equal(fact.entityId, 'alqadim:bestiary:giant-boar');
    assert.equal(fact.text, `Giant Boar: ${original.strategy} Danger: ${original.danger}.`);
    assert.equal(fact.source.locator, 'DB.bestiary[3].strategy/danger');
    const result = resolve();
    assert.deepEqual(result.supportedTerms, terms);
    assert.deepEqual(result.records, [authorize(location, 'direct')]);
    assert.equal(result.records[0].text, `Giant Boar: ${original.location}.`);
    assert.equal(result.records[0].source.locator, 'DB.bestiary[3].location');
    assert.deepEqual(Object.keys(result).sort(), ['records', 'supportedTerms']);
    assert.equal(fact.text, fact.witness);
    assert.equal(fact.text, 'Giant Boar: Charges in straight lines. Dodge sideways, then strike from behind. Danger: Medium.');
    assert.equal(result.records[0].text, 'Giant Boar: Oasis Outskirts.');
    assert.deepEqual(resolve({ sourceRecords: records(authorize(location, 'direct'), authorized) }), result);
});

test('person and monster actor families share the exact-identity contract without title or alias joins', () => {
    for (const kind of ['person', 'npc', 'companion', 'character', 'enemy', 'monster', 'creature', 'bestiary']) {
        const sourceRecords = records({ ...location, kind }, { ...combat, kind });
        assert.equal(resolve({ sourceRecords, entities: new Map([[fact.entityId, { kind }]]) }).records.length, 1);
        assert.equal(resolve({ sourceRecords, entities: undefined, fact: { ...fact, kind } }).records.length, 1);
    }
    for (const entityId of ['alqadim:bestiary:giant-boar-extra', 'alqadim:bestiary:boar', 'alqadim:knowledge:giant-boar'])
        denied({ sourceRecords: records({ ...location, entityId }) });
    denied({ sourceRecords: records({ ...location, entityId: undefined }) });
    denied({ fact: { ...fact, record: { ...authorized, entityId: 'other' } } });
    denied({ entities: new Map() });
    for (const kind of ['item', 'place', 'topic', 'objective'])
        denied({ entities: new Map([[fact.entityId, { kind }]]) });
    denied({ entities: undefined, fact: { ...fact, record: undefined } });
    denied({ sourceRecords: records(location, { ...combat, entityId: 'another-actor' }) });
});

test('all topical terms must occur literally, with at least one requiring the separate location', () => {
    for (const extra of ['hidden', 'northern', 'desert', 'inside', 'before', 'after', 'completed', 'outskirt'])
        denied({ contextTerms: [...terms, extra] });
    denied({ contextTerms: ['dodge', 'sideways'] });
    denied({ contextTerms: [] });
    denied({ contextTerms: ['oasis outskirts'] });
    denied({ contextTerms: [...terms, '2'] });
    assert.deepEqual(resolve({ contextTerms: ['Oasis', 'Giant', 'Boar'] }).supportedTerms, ['Oasis', 'Giant', 'Boar']);
    const renamed = { ...location, title: 'Northern Oasis', aliases: ['Northern Oasis'],
        source: { ...location.source, locator: 'DB.northernOasis.location' } };
    denied({ sourceRecords: records(renamed), contextTerms: [...terms, 'northern'] });
});

test('a location never promotes objectives, identity, negation or statistics to a combat method', () => {
    for (const facet of ['objective', 'identity', 'stats', 'limitations', 'method', 'location'])
        denied({ fact: { ...fact, facet } });
    for (const answerRelations of [[], ['objective'], ['identity'], ['stats'], ['limitations'], ['method']])
        denied({ fact: { ...fact, answerRelations } });
    denied({ fact: { ...fact, record: { ...authorized, relation: 'objective' } } });
    denied({ sourceRecords: records(location, { ...combat, relation: 'objective' }) });
    denied({ sourceRecords: records({ ...location, relation: 'route' }) });
    denied({ sourceRecords: records({ ...location, relation: 'combat' }) });
    const result = resolve();
    for (const field of ['text', 'answerRelations', 'stateChanges', 'actions', 'links', 'progress', 'instruction'])
        assert.equal(Object.hasOwn(result, field), false);
    assert.equal(result.records[0].relation, 'location');
    assert.equal(result.records[0].text.includes('Dodge'), false);
});

test('the complete actual backing combat witness is mandatory, even for self-consistent excerpts', () => {
    denied({ fact: { ...fact, witness: 'Giant Boar: Dodge sideways.' } });
    const excerpt = 'Giant Boar: Charges in straight lines.';
    denied({ fact: { ...fact, text: excerpt, witness: excerpt } });
    denied({ fact: { ...fact, sourceRecordId: undefined } });
    denied({ fact: { ...fact, sourceRecordId: location.id } });
    denied({ sourceRecords: [location] });
    denied({ sourceRecords: [combat, clone(combat), location] });
    denied({ sourceRecords: records(location, { ...combat, variants: { balanced: { text: excerpt } } }) });
    denied({ fact: { ...fact, source: { ...fact.source, locator: 'DB.bestiary[4].strategy/danger' } } });
    const fullLocation = authorize(location, 'direct');
    denied({ sourceRecords: records({ ...fullLocation, witness: 'Giant Boar.' }) });
});

test('independent source file, locator and extracted status bind both complete witnesses', () => {
    for (const source of [{ ...location.source, file: 'unsupported.js' },
        { ...location.source, file: '' }, { ...location.source, locator: '' },
        { ...location.source, locator: fact.source.locator },
        { ...location.source, locator: 'DB.bestiary[*].location' },
        { ...location.source, locator: 'DB.bestiary[3].location; DB.bestiary[4].location' },
        { ...location.source, review: 'external-research' },
        { ...location.source, review: 'conflicting' }, { ...location.source, review: 'authored-index' }])
        denied({ sourceRecords: records({ ...location, source }) });
    denied({ fact: { ...fact, source: { ...fact.source, review: 'external-research' } } });
    denied({ sourceRecords: records(location, { ...combat, source: { ...combat.source, review: 'external-research' } }) });
    denied({ sourceRecords: records({ ...location, conflict: true }) });
    denied({ sourceRecords: records(location, { ...combat, conflict: true }) });
    denied({ fact: { ...fact, conflict: true } });
    denied({ fact: { ...fact, record: { ...authorized, conflict: true } } });
});

test('hidden or competing locations cannot manufacture a unique eligible context witness', () => {
    denied({ sourceRecords: records({ ...location, variants: { balanced: location.variants.direct } }) });
    denied({ sourceRecords: records({ ...location, variants: {} }) });
    denied({ sourceRecords: records({ ...authorize(location, 'direct'), level: 'balanced' }) });
    for (const competitor of [clone(location), { ...clone(location), id: 'second-location' },
        { ...clone(location), id: 'second-location', conflict: true },
        { ...clone(location), id: 'second-location', editions: ['wrong-edition'] },
        { ...clone(location), id: 'second-location', variants: {} }])
        denied({ sourceRecords: [combat, location, competitor], isEligible: value => value.id !== 'second-location' });
    denied({ sourceRecords: [combat, location, { ...clone(location), entityId: 'another-actor' }] });
});

test('caller eligibility is mandatory, strict, and checks each witness separately for current restrictions', () => {
    denied({ isEligible: undefined });
    denied({ isEligible: () => false });
    denied({ isEligible: () => 'truthy' });
    denied({ isEligible: (_value, role) => role === 'fact' });
    denied({ isEligible: (_value, role) => role === 'location' });
    denied({ isEligible: value => value.source.file === 'guides/js/Unsupported.js' });
    denied({ isEligible: (value, role) => role === 'fact' || value.editions.includes('gold') });
    const seen = [];
    assert.equal(resolve({ isEligible: (value, role) => { seen.push([value, role]); return true; } }).records.length, 1);
    assert.deepEqual(seen.map(([, role]) => role), ['fact', 'location']);
    assert.equal(seen[0][0], fact);
    assert.deepEqual(seen[1][0], authorize(location, 'direct'));
    const snapshot = clone([fact, combat, location, terms]);
    resolve();
    assert.deepEqual(clone([fact, combat, location, terms]), snapshot);
});
