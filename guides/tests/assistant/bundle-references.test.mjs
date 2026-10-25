import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { parseBundleRequest, resolveBundleReference } from '../../js/assistant/bundle-references.js';

const manifest = JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/albion.json', import.meta.url)));
const knowledge = buildKnowledge('albion', allRecords.albion, manifest);
const clone = value => JSON.parse(JSON.stringify(value));
const entity = name => [...knowledge.entities.values()].find(value => value.declared && value.name === name);
const bundle = entity('Pistol + Canisters'), pistol = entity('Pistol'), canisters = entity('Canisters');
const pickup = knowledge.facts.find(value => value.id === 'pistol');
const hiding = knowledge.facts.find(value => value.id === 'hide-weapon');
const source = 'Once inside, where do I find the Pistol and its canisters?';
const resolve = (text = source, options = {}) => resolveBundleReference({ text,
    entities: knowledge.entities, links: knowledge.links, facts: knowledge.facts, isEligible: () => true, ...options });
const alteredLinks = change => knowledge.links.map(value => change(clone(value)));
const alteredFacts = change => knowledge.facts.map(value => change(clone(value)));
const deny = (text = source, options = {}) => assert.equal(resolve(text, options), null);

test('the actual source pickup resolves exactly the authored Pistol and Canisters group', () => {
    assert.deepEqual(knowledge.issues, []);
    const result = resolve();
    assert.equal(result.type, 'bundle-reference');
    assert.equal(result.entityId, bundle.id);
    assert.deepEqual(new Set(result.members), new Set([pistol.id, canisters.id]));
    assert.deepEqual(new Set(result.proofIds), new Set(['pistol', 'hide-weapon', 'pistol-effect']));
    assert.equal(result.reference, 'explicit');
    assert.equal(result.operandText, 'the Pistol and its canisters');
    assert.equal(result.prefixText, 'Once inside, ');
    assert.equal(result.suffixText, '');
    assert.equal(result.originalText, source);
    for (const text of ['Where are the Pistol and the Canisters?', 'Where can we get Pistol + Canisters?',
        'How do I get a Pistol and Canisters?', 'Where is Canisters and Pistol?']) {
        const found = resolve(text);
        assert.equal(found.entityId, bundle.id);
        assert.deepEqual(new Set(found.proofIds), new Set(['pistol', 'hide-weapon']));
    }
});

test('the parser retains full operands and relation suffixes for independent router guards', () => {
    for (const action of ['get', 'carry', 'store', 'hide', 'bring', 'take']) {
        const text = `How can I ${action} the golden Pistol and two Canisters from the remake after Joe returns?`;
        const parsed = parseBundleRequest(text);
        assert.equal(parsed.operandText, 'the golden Pistol and two Canisters');
        assert.equal(parsed.suffixText, ' from the remake after Joe returns');
        assert.equal(parsed.originalText, text);
        deny(text);
    }
    const result = resolve('How can I carry Pistol and Canisters past security in the remake?');
    assert.equal(result.suffixText, ' past security in the remake');
    for (const text of ['I have Pistol and Canisters', 'Who has Pistol and Canisters?',
        'When can I get Pistol and Canisters?', 'Where should I take Pistol and Canisters?',
        'If I am inside, where do I find Pistol and Canisters?']) assert.equal(parseBundleRequest(text), null);
});

test('no partial name, material, quantity, edition, extra clause or repeated member is discarded', () => {
    for (const operand of ['Pistol', 'Canisters', 'Pistol and Canister', 'Pistols and Canisters',
        'wooden Pistol and Canisters', 'Pistol and golden Canisters', 'two Pistol and Canisters',
        'Pistol and two Canisters', 'Pistol and extra Canisters', 'Pistol and Canisters remake',
        'Pistol and Canisters and Stimdrinks', 'Pistol and Pistol', 'Pistol and Canisters and Pistol',
        'Pistol and Canisters, then tell me the password', 'Pistol and its own Canisters',
        'Pistol and my Canisters', 'both Pistol and Canisters']) deny(`Where do I find ${operand}?`);
});

test('them requires a focused bundle and a complete literal proof actually returned last', () => {
    const options = { focusEntityId: bundle.id, returnedFacts: [pickup] };
    const result = resolve('How can I carry them past security?', options);
    assert.equal(result.entityId, bundle.id);
    assert.equal(result.reference, 'pronoun');
    assert.equal(result.operandText, 'them');
    assert.equal(result.suffixText, ' past security');
    assert.equal(resolve('How can I hide them in the wall cabinet?', { ...options, returnedFacts: [hiding] }).entityId, bundle.id);
    for (const focusEntityId of [undefined, pistol.id, canisters.id, 'unknown'])
        deny('How can I carry them past security?', { ...options, focusEntityId });
    for (const returnedFacts of [[], [{ id: pickup.id }], [{ ...pickup, text: 'Pistol' }],
        [{ ...pickup, witness: 'Pistol' }], [{ ...pickup, bindings: [] }],
        [{ ...pickup, source: { ...pickup.source, locator: 'different' } }],
        [knowledge.facts.find(value => value.id === 'pistol-effect')]])
        deny('How can I carry them past security?', { ...options, returnedFacts });
    for (const operand of ['it', 'they', 'those', 'the items', 'them and Stimdrinks', 'two of them'])
        deny(`How can I carry ${operand} past security?`, options);
});

test('an unrelated plural item never supplies a bundle antecedent', () => {
    const facts = alteredFacts(value => value.id === pickup.id ? { ...value,
        text: 'Find the Pistol and other items.', witness: 'Find the Pistol and other items.' } : value);
    deny('How can I carry them past security?', { facts, focusEntityId: bundle.id,
        returnedFacts: [facts.find(value => value.id === pickup.id)] });
    deny('How can I carry them past security?', { focusEntityId: pistol.id, returnedFacts: [pickup] });
});

test('all declared component edges, including withheld or disputed ones, must be complete', () => {
    const component = value => value.from === bundle.id && value.relation === 'has-component';
    for (const links of [knowledge.links.filter(value => !component(value) || value.to !== canisters.id),
        [...knowledge.links, { id: 'extra-component', from: bundle.id, to: entity('Stimdrink')?.id || 'extra',
            relation: 'has-component', status: 'disputed', evidenceFactIds: ['pistol'] }],
        [...knowledge.links, { ...knowledge.links.find(component), id: 'duplicate-member' }]]) deny(source, { links });
    for (const modification of [{ status: 'disputed' }, { status: 'conditional' }, { conflict: true },
        { evidenceFactIds: [] }, { evidenceFactIds: ['absent'] }, { evidenceFactIds: ['pistol', 'pistol'] }])
        deny(source, { links: alteredLinks(value => component(value) ? { ...value, ...modification } : value) });
    deny(source, { facts: [...knowledge.facts, pickup] });
    const entities = new Map(knowledge.entities);
    entities.set(canisters.id, { ...canisters, declared: false });
    deny(source, { entities });
});

test('complete fact identity, literal group bindings and caller eligibility are mandatory', () => {
    deny(source, { isEligible: undefined });
    deny(source, { isEligible: () => false });
    deny(source, { isEligible: () => 'yes' });
    for (const id of ['pistol', 'hide-weapon', 'pistol-effect']) deny(source, { isEligible: fact => fact.id !== id });
    for (const change of [value => ({ ...value, witness: 'truncated' }), value => ({ ...value, conflict: true }),
        value => ({ ...value, source: { ...value.source, review: 'external-research' } }),
        value => ({ ...value, bindings: value.bindings.filter(binding => binding.entityId !== bundle.id) }),
        value => ({ ...value, bindings: value.bindings.map(binding => binding.entityId === bundle.id
            ? { ...binding, mention: 'Pistol' } : binding) })]) {
        deny(source, { facts: alteredFacts(value => value.id === pickup.id ? change(value) : value) });
    }
    const seen = [];
    assert.equal(resolve(source, { isEligible: fact => { seen.push(fact); return true; } }).entityId, bundle.id);
    assert.ok(seen.every(fact => knowledge.facts.includes(fact)));
});

test('its requires the exact directed independently proved uses relationship', () => {
    for (const links of [knowledge.links.filter(value => value.id !== 'pistol-uses-canisters'),
        alteredLinks(value => value.id === 'pistol-uses-canisters' ? { ...value, from: value.to, to: value.from } : value),
        alteredLinks(value => value.id === 'pistol-uses-canisters' ? { ...value, status: 'disputed' } : value)]) {
        deny(source, { links });
        assert.equal(resolve('Where do I find Pistol and Canisters?', { links }).entityId, bundle.id);
    }
    deny('Where do I find its Canisters and Pistol?');
    deny('Where do I find Canisters and its Pistol?');
});

test('exact aliases may identify members, while ambiguous aliases and matching bundle sets fail closed', () => {
    const entities = new Map(knowledge.entities);
    entities.set(pistol.id, { ...pistol, aliases: [...pistol.aliases, 'Sidearm'] });
    assert.equal(resolve('Where do I find Sidearm and Canisters?', { entities }).entityId, bundle.id);
    entities.set('other', { id: 'other', declared: true, kind: 'item', name: 'Sidearm', aliases: [] });
    deny('Where do I find Sidearm and Canisters?', { entities });
    const second = { ...bundle, id: 'another-bundle' };
    entities.set(second.id, second);
    // A second literal group with the same complete set is intentionally ambiguous.
    const links = [...knowledge.links, ...knowledge.links.filter(value => value.from === bundle.id && value.relation === 'has-component')
        .map(value => ({ ...value, id: `${value.id}-second`, from: second.id }))];
    const facts = alteredFacts(value => ['pistol', 'hide-weapon'].includes(value.id)
        ? { ...value, bindings: [...value.bindings, { ...value.bindings.find(binding => binding.entityId === bundle.id), entityId: second.id }] } : value);
    deny('Where do I find Pistol and Canisters?', { entities, links, facts });
});
