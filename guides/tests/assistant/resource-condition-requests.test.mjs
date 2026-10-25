import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { parseResourceConditionRequest as parse, supportsResourceConditionRequest as supports } from '../../js/assistant/resource-condition-requests.js';

const manifest = game => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`, import.meta.url)));
const aq = buildKnowledge('alqadim', allRecords.alqadim, manifest('alqadim'));
const u7 = buildKnowledge('ultima7', allRecords.ultima7, manifest('ultima7'));
const charges = aq.facts.find(fact => fact.id === 'page-shard-charges');
const magebane = u7.facts.find(fact => fact.id === 'equipment-magebane');
const shardOptions = { fact: charges, subjectEntityId: 'alqadim:knowledge:moonstone-shards', subjectLabels: ['Moonstone shards', 'shards', 'magic shard'], grounded: true };
const mageOptions = { fact: magebane, subjectEntityId: magebane.entityId, subjectLabels: ['Magebane'], grounded: true };
const limit = 'Can I just keep firing the same one forever?';
const contrast = 'Does it drain mana only when I hit, or just from carrying it?';
const copy = value => JSON.parse(JSON.stringify(value));

test('Buying the named shards cannot replace their complete consumption and depletion rules', () => {
    const question='Does buying shards give infinite charges?';
    assert.equal(supports(parse(question),shardOptions),true);
    assert.equal(supports(parse(question),{...shardOptions,grounded:false}),true);
    for(const text of ['Each glowing fragment carries its own remaining charges.',
        'One shot spends one charge; when a shard is empty, it breaks apart.',
        charges.text.replace('a shard is empty','a sling is empty')])
        assert.equal(supports(parse(question),{...shardOptions,fact:{...charges,text,witness:text}}),false,text);
    for(const modified of ['Does buying two shards give infinite charges?',
        'Does buying silver shards give infinite charges?',
        'Does buying shards give infinite charges in the patched edition?',
        'Does buying shards give infinite charges according to the original manual?',
        'Does buying shards give infinite charges after I finish the current save?',
        'Does buying shards give infinite charges? Also tell me the recharge location.'])
        assert.equal(supports(parse(modified),shardOptions),false,modified);
});

// These tests exercise only a finite source proof helper, never a live model,
// generated answer, player-state observation, question alias or frozen oracle.
test('resource descriptor retains subject, action, duration and original restrictions', () => {
    assert.deepEqual(parse(limit), { kind: 'resource-limit', subjectText: 'the same one', action: 'firing', durationText: 'forever', suffixText: '', originalText: limit });
    const q = 'Can I keep firing Moonstone Shards forever in Serpent Isle?';
    assert.equal(parse(q).subjectText, 'Moonstone Shards');
    assert.equal(parse(q).suffixText, ' in Serpent Isle');
    assert.equal(parse(q).originalText, q);
    assert.equal(parse('How many charges do I currently have?'), null);
    const compound = parse('Can I keep firing it forever? Also tell me where to recharge.');
    assert.equal(compound.suffixText, '? Also tell me where to recharge.');
    assert.equal(supports(compound, shardOptions), false);
});

test('same-item full charge-consumption and depletion witness supports bounded resource lookup', () => {
    assert.equal(supports(parse(limit), shardOptions), true);
    assert.equal(supports(parse('Can I keep firing Moonstone Shards forever?'), { ...shardOptions, grounded: false }), true);
    assert.equal(supports(parse('Can we keep shooting shards forever?'), shardOptions), true);
    assert.equal(supports(parse(limit), { ...shardOptions, grounded: false }), false);
    assert.equal(supports(parse(limit), { ...shardOptions, subjectEntityId: 'another-item' }), false);
    assert.equal(supports(parse(limit), { ...shardOptions, subjectLabels: ['Seeking sling'] }), false);
    assert.equal(supports(parse(limit), { ...shardOptions, fact: { ...charges, bindings: [] } }), false);
    assert.equal(supports(parse(limit), { ...shardOptions, fact: { ...charges, answerRelations: ['use'] } }), false);
    assert.equal(supports(parse('Can I keep using Moonstone Shards forever?'), shardOptions), false);
});

test('controls, charge mentions, mismatched resources, reported or truncated conditions fail', () => {
    const withText = text => ({ ...charges, text, witness: text });
    for (const text of [
        'Each glowing fragment carries its own remaining charges.',
        'One shot spends one charge.',
        'Equip a shard. Fire with Space.',
        'Each glowing fragment carries its own remaining charges. One shot spends one charge; when a sling is empty, it breaks apart.',
        'Each glowing fragment carries its own remaining charges. One shot spends one charge; when a shard is empty, it',
        'The guide claims: each glowing fragment carries its own remaining charges. One shot spends one charge; when a shard is empty, it breaks apart.',
        'Each glowing fragment carries its own remaining charges. One shot does not spend one charge; when a shard is empty, it breaks apart.'
    ]) assert.equal(supports(parse(limit), { ...shardOptions, fact: withText(text) }), false, text);
    assert.equal(supports(parse(limit), { ...shardOptions, fact: { ...charges, witness: charges.witness.slice(0, -1) } }), false);
    const shattering = charges.text.replace('breaks apart', 'shatters');
    assert.equal(supports(parse(limit), { ...shardOptions, fact: withText(shattering) }), true);
});

test('trigger contrast retains both alternatives and quotes only the recorded trigger', () => {
    assert.deepEqual(parse(contrast), { kind: 'trigger-contrast', subjectText: 'it', action: 'drain', resourceText: 'mana', triggerText: 'I hit', alternativeText: 'carrying it', originalText: contrast });
    assert.equal(supports(parse(contrast), mageOptions), true);
    assert.equal(supports(parse('Does Magebane drain mana only when I hit, or just from carrying it?'), { ...mageOptions, grounded: false }), true);
    assert.equal(supports(parse(contrast), { ...mageOptions, grounded: false }), false);
    assert.equal(supports(parse(contrast), { ...mageOptions, subjectEntityId: 'ultima7:equipment:fire-sword' }), false);
    assert.equal(supports(parse(contrast), { ...mageOptions, fact: { ...magebane, text: 'Magebane: Drains Mana.', witness: 'Magebane: Drains Mana.' } }), false);
    assert.equal(supports(parse(contrast), { ...mageOptions, fact: { ...magebane, answerRelations: ['combat'] } }), false);
    assert.equal(supports(parse(contrast), { ...mageOptions, fact: { ...magebane, witness: 'Drains Mana on Hit.' } }), false);
});

test('unknown modifiers, quantities, editions, source qualifiers and alternate triggers fail closed', () => {
    for (const q of [
        'Can I keep firing enchanted Moonstone Shards forever?',
        'Can I keep firing two Moonstone Shards forever?',
        'Can I keep firing Moonstone Shards forever in the patched edition?',
        'Can I keep firing Moonstone Shards forever according to another source?',
        'Can I keep firing my current Moonstone Shards forever?',
        'Does Magebane drain stamina only when I hit, or just from carrying it?',
        'Does Magebane drain 10 mana only when I hit, or just from carrying it?',
        'Does enchanted Magebane drain mana only when I hit, or just from carrying it?',
        'Does Magebane drain mana only when I miss, or just from carrying it?',
        'Does Magebane drain mana only when I hit with a bow, or just from carrying it?',
        'Does Magebane drain mana only when I hit, or just from equipping it?',
        'Does Magebane drain mana only when I hit, or just from carrying another sword?',
        'Does Magebane drain mana only when I hit, or just from carrying it in Serpent Isle?',
        'Does Magebane currently drain mana only when I hit, or just from carrying it?',
        'Does Magebane drain mana only when I hit according to the wiki, or just from carrying it?'
    ]) assert.equal(supports(parse(q), q.startsWith('Can') ? shardOptions : mageOptions), false, q);
    assert.equal(supports({ ...parse(contrast), resourceText: 'stamina' }, mageOptions), false);
    assert.equal(supports(parse(contrast), { ...mageOptions, fact: { ...magebane, conflict: true } }), false);
    assert.equal(supports(parse(limit), { ...shardOptions, fact: { ...charges, source: { review: 'conflicting' } } }), false);
});

test('an explicitly reviewed effect binding can scope an otherwise different fact subject', () => {
    const bound = { ...copy(magebane), entityId: 'effect-topic', bindings: [{ entityId: magebane.entityId, relations: ['use'], mention: 'Magebane' }] };
    assert.equal(supports(parse(contrast), { ...mageOptions, fact: bound }), true);
    assert.equal(supports(parse(contrast), { ...mageOptions, fact: { ...bound, bindings: [] } }), false);
    assert.equal(supports(parse(contrast), { ...mageOptions, fact: { ...bound, bindings: [{ ...bound.bindings[0], relations: ['location'] }] } }), false);
});
