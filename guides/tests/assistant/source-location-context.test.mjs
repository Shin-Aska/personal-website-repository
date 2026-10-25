import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { authorize } from '../../js/assistant/policy.js';
import { sourceLocationContext } from '../../js/assistant/source-location-context.js';

const manifest = JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/alqadim.json', import.meta.url)));
const knowledge = buildKnowledge('alqadim', allRecords.alqadim, manifest);
const fact = knowledge.facts.find(value => value.id === 'ch4_5');
const location = allRecords.alqadim.find(value => value.id === 'alqadim:item:ship-orb:location');
const clone = value => JSON.parse(JSON.stringify(value));
const terms = ['wrecked', 'ship', 'orb'];
const resolve = (options = {}) => sourceLocationContext({ fact, sourceRecords: allRecords.alqadim,
    contextTerms: terms, entities: knowledge.entities, isEligible: () => true, ...options });
const denied = options => assert.deepEqual(resolve(options), { records: [], supportedTerms: [] });

test('the actual Ship Orb acquisition retains its independently authored literal location as topical evidence', () => {
    assert.equal(fact.entityId, 'alqadim:item:ship-orb');
    assert.equal(fact.text, 'Retrieve the Ship Orb from the helm cabin.');
    assert.equal(fact.source.locator, 'DB.chapters[3].required[id=ch4_5]');
    const result = resolve();
    assert.deepEqual(result.supportedTerms, terms);
    assert.equal(result.records.length, 1);
    assert.equal(result.records[0].text, "Ship Orb: Deadman's Reef (Wrecked Ship).");
    assert.equal(result.records[0].source.locator, 'DB.keyItems[5].location');
    assert.deepEqual(result.records[0], authorize(location, 'direct'));
    assert.deepEqual(Object.keys(result).sort(), ['records', 'supportedTerms']);
    assert.equal(fact.text, fact.witness);
});

test('unknown context modifiers cannot piggyback on the real wrecked-ship witness', () => {
    for (const extra of ['haunted', 'northern', 'golden', 'captain', 'wreck', 'ships'])
        denied({ contextTerms: [...terms, extra] });
    denied({ contextTerms: ['helm', 'cabin'] }); // No location context is needed.
    denied({ contextTerms: [] });
    denied({ contextTerms: ['wrecked ship'] });
    denied({ contextTerms: [...terms, '2'] });
});

test('only the same exact canonical item can provide a location', () => {
    for (const entityId of ['alqadim:item:ship-orb-extra', 'alqadim:item:ship', 'alqadim:item:other-orb'])
        denied({ sourceRecords: [{ ...location, entityId }] });
    denied({ sourceRecords: [{ ...location, entityId: undefined }] });
    denied({ fact: { ...fact, record: { ...fact.record, entityId: 'other' } } });
    denied({ entities: new Map() });
    denied({ entities: new Map([[fact.entityId, { kind: 'place' }]]) });
    denied({ entities: undefined, fact: { ...fact, record: undefined } });
    assert.equal(resolve({ entities: undefined, fact: { ...fact, kind: 'item' } }).records.length, 1);
});

test('location scope cannot authorize another predicate or an incomplete candidate', () => {
    for (const answerRelations of [[], ['use'], ['explanation'], ['route']])
        denied({ fact: { ...fact, answerRelations } });
    denied({ fact: { ...fact, witness: 'Retrieve the Ship Orb.' } });
    denied({ fact: { ...fact, text: '' } });
    denied({ fact: { ...fact, sourceRecordId: location.id } });
    denied({ fact: { ...fact, source: location.source } });
    for (const relation of ['acquisition', 'use', 'route']) denied({ sourceRecords: [{ ...location, relation }] });
});

test('literal text alone supports context; titles, aliases and locators cannot add terms', () => {
    const fake = { ...location, title: 'Haunted Wreck', aliases: ['haunted wreck'],
        variants: { direct: { text: 'Ship Orb: Deadman’s Reef.' } },
        source: { ...location.source, locator: 'DB.hauntedWreck.location' } };
    denied({ sourceRecords: [fake] });
    denied({ contextTerms: ['wrecked', 'Ship', 'Orb', 'haunted'],
        fact: { ...fact, aliases: [...fact.aliases, 'haunted'] } });
    assert.deepEqual(resolve({ contextTerms: ['Wrecked', 'Ship', 'Orb'] }).supportedTerms, ['Wrecked', 'Ship', 'Orb']);
});

test('external, conflicting, incomplete and non-direct sources are withheld', () => {
    for (const source of [{ ...location.source, review: 'external-research' },
        { ...location.source, review: 'conflicting' }, { ...location.source, review: 'authored-index' },
        { ...location.source, file: '' }, { ...location.source, locator: '' },
        { ...location.source, locator: 'DB.keyItems[*].location' },
        { ...location.source, locator: 'DB.keyItems[5].location; DB.keyItems[6].location' }])
        denied({ sourceRecords: [{ ...location, source }] });
    denied({ sourceRecords: [{ ...location, conflict: true }] });
    denied({ fact: { ...fact, conflict: true } });
    denied({ fact: { ...fact, source: { ...fact.source, review: 'external-research' } } });
    denied({ fact: { ...fact, record: { ...fact.record, conflict: true } } });
    denied({ sourceRecords: [{ ...location, variants: { balanced: location.variants.direct } }] });
    denied({ sourceRecords: [{ ...location, variants: {} }] });
    denied({ sourceRecords: [{ ...location, source: { ...location.source, file: 'other.js' } }] });
    const authorized = authorize(location, 'direct');
    assert.equal(resolve({ sourceRecords: [authorized] }).records.length, 1);
    denied({ sourceRecords: [{ ...authorized, level: 'balanced' }] });
});

test('duplicate identities and competing locations remain ambiguous even with identical text', () => {
    denied({ sourceRecords: [location, clone(location)] });
    denied({ sourceRecords: [location, { ...clone(location), id: 'other-location' }] });
    denied({ sourceRecords: [location, { ...clone(location), id: 'other-location', conflict: true }] });
    denied({ sourceRecords: [location, { ...clone(location), entityId: 'unrelated' }] });
});

test('caller eligibility is mandatory and applies separately to both witnesses', () => {
    denied({ isEligible: undefined });
    denied({ isEligible: () => false });
    denied({ isEligible: (_value, role) => role === 'fact' });
    denied({ isEligible: (_value, role) => role === 'location' });
    denied({ isEligible: () => 'truthy' });
    const seen = [];
    const result = resolve({ isEligible: (value, role) => { seen.push([value, role]); return true; } });
    assert.equal(result.records.length, 1);
    assert.equal(seen[0][0], fact);
    assert.deepEqual(seen.map(([, role]) => role), ['fact', 'location']);
    assert.equal(seen[1][0].text, authorize(location, 'direct').text);
});
