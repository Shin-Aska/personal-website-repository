import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords, u5 } from './load-records.mjs';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { parseDescriptiveReferenceRequest as parse, supportsDescriptiveReferenceRequest as supports }
    from '../../js/assistant/descriptive-reference-requests.js';

const manifest = JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/ultima5.json', import.meta.url)));
const knowledge = buildKnowledge('ultima5', allRecords.ultima5, manifest);
const fact = knowledge.facts.find(value => value.id === 'companion-johne');
const entity = knowledge.entities.get(fact.entityId);
const context = { fact, subjectEntityId: entity.id, subjectLabels: [entity.name, ...entity.aliases],
    subjectKind: entity.kind, isEligible: () => true };
const question = 'I meant the strongest mage for later: who is it, and what makes reaching him difficult?';
const check = (text = question, changes = {}) => supports(parse(text), { ...context, ...changes });
const replace = text => ({ ...fact, text, witness: text });

test('one descriptor atomically retains WHO, reach difficulty, correction and planning intent', () => {
    assert.deepEqual(parse(question), { kind: 'descriptive-person-reach', traitText: 'the strongest mage',
        correctionText: 'I meant', planningText: 'for later', identityReference: 'it', reachReference: 'him',
        suffixText: '', fields: ['identity', 'reach-difficulty'], originalText: question });
    assert.equal(Object.isFrozen(parse(question)), true);
    assert.equal(Object.isFrozen(parse(question).fields), true);
    assert.equal(check(), true);
    assert.equal(check('I mean the strongest mage: who is he, and what makes reaching him difficult?'), true);
    assert.equal(check('the strongest mage: who is that person and what makes reaching them difficult?'), true);
    for (const text of ['Who is the strongest mage?', 'Who is Johne?', 'What makes reaching him difficult?',
        'I already recruited the strongest mage: who is it, and what makes reaching him difficult?'])
        assert.equal(check(text), false, text);
});

test('the actual full owned Johne witness supplies the explicit description and reach location', () => {
    const original = u5.companionData.find(value => value.Name === 'Johne');
    assert.equal(fact.text, `${original.Class}. ${original.Notes}`);
    assert.equal(fact.text, 'Mage. The strongest mage in the game, but he is difficult to reach, located on a wrecked ship in the Underworld.');
    assert.equal(fact.text, fact.witness);
    assert.equal(fact.source.file, 'guides/js/Ultima5.js');
    assert.equal(fact.source.locator, 'companionData[4]');
    assert.equal(entity.kind, 'companion');
    assert.equal(check(), true);
    for (const field of ['available', 'timing', 'completed', 'stateChanges', 'ranking', 'answerText', 'aliases'])
        assert.equal(Object.hasOwn(parse(question), field), false);
});

test('the whole unknown trait, time, source, material, edition and suffix remain unsupported', () => {
    for (const trait of ['the strongest radioactive mage', 'the strongest copper mage', 'the 2 strongest mages',
        'the strongest mage in the unknown edition', 'the strongest mage from another guide',
        'the strongest mage tomorrow', 'the strongest mage for later tonight', 'the most powerful mage']) {
        const text = `I meant ${trait}: who is it, and what makes reaching him difficult?`;
        assert.equal(parse(text)?.traitText, trait);
        assert.equal(check(text), false, text);
    }
    for (const suffix of [' in the CD edition', ' after I recruit him', ' with 2 copper coins',
        ' according to another guide', ' and where should I go next', ' right now', ' while radioactive']) {
        const text = question.slice(0, -1) + suffix + '?';
        assert.equal(parse(text)?.suffixText, suffix);
        assert.equal(check(text), false, text);
    }
});

test('the description grammar is general and literal; it never equates two different superlatives', () => {
    const text = 'I meant the most powerful knight for later: who is she, and what makes reaching her difficult?';
    const synthetic = { ...replace('Knight. The most powerful knight in the game, but she is hard to reach, found in a ruined keep.'),
        entityId: 'example:person:ada', subject: 'Ada', record: undefined };
    const options = { fact: synthetic, subjectEntityId: synthetic.entityId, subjectLabels: ['Ada'], subjectKind: 'person' };
    assert.equal(check(text, options), true);
    assert.equal(check(text.replace('most powerful', 'strongest'), options), false);
    assert.equal(check(text.replace('reaching her', 'reaching him'), options), false);
    assert.equal(check(question, { fact: replace('Johne is the strongest mage in the game, but he is difficult to reach, located on a wrecked ship in the Underworld.') }), true);
});

test('only the canonical person and owned identity plus explanation roles can answer', () => {
    for (const changes of [{ subjectEntityId: 'ultima5:companion:gwenno' }, { subjectLabels: ['Gwenno'] },
        { subjectLabels: ['the strongest mage'] }, { subjectKind: 'monster' }, { subjectKind: 'topic' },
        { fact: { ...fact, entityId: 'other-person' } },
        { fact: { ...fact, subject: 'Gwenno', aliases: ['Johne'] } },
        { fact: { ...fact, record: { ...fact.record, entityId: 'other-person' } } }])
        assert.equal(check(question, changes), false);
    for (const answerRelations of [[], ['identity'], ['explanation'], ['combat'], ['location'], ['stats']])
        assert.equal(check(question, { fact: { ...fact, answerRelations } }), false);
    for (const text of ['Gwenno is the strongest mage in the game, but she is difficult to reach, located on a wrecked ship in the Underworld.',
        'Gwenno. The strongest mage in the game, but he is difficult to reach, located on a wrecked ship in the Underworld.',
        'Johne knows the strongest mage in the game. He is difficult to reach, located on a wrecked ship in the Underworld.'])
        assert.equal(check(question, { fact: replace(text) }), false, text);
});

test('same-fact literal reach difficulty and location are both required; partial fields never pass', () => {
    for (const text of ['Mage. The strongest mage in the game.',
        'Mage. The strongest mage in the game, but he is difficult to reach.',
        'Mage. The strongest mage in the game, located on a wrecked ship in the Underworld.',
        'Mage. He is difficult to reach, located on a wrecked ship in the Underworld.',
        'Mage. The strongest mage in the game. A wrecked ship is difficult to reach in the Underworld.',
        'Mage. The strongest mage in the game, but Gwenno is difficult to reach, located on a wrecked ship in the Underworld.',
        'Mage. The strongest mage in the game, but he is difficult to reach, located on '])
        assert.equal(check(question, { fact: replace(text) }), false, text);
    assert.equal(check(question, { fact: { ...fact, witness: 'The strongest mage.' } }), false);
});

test('uncertain, denied, conditional and reported source descriptions are withheld', () => {
    for (const modifier of ['not ', 'perhaps ', 'reportedly ', 'supposedly ', 'allegedly ', 'maybe '])
        assert.equal(check(question, { fact: replace(fact.text.replace('The strongest', `The ${modifier}strongest`)) }), false);
    for (const text of [fact.text.replace('but he is', 'but he might be'),
        fact.text.replace('but he is', 'but he is not'),
        fact.text.replace('The strongest', 'If recruited, the strongest'),
        fact.text.replace('The strongest', 'Iolo says he is the strongest'),
        fact.text.replace('The strongest', 'According to Iolo, the strongest')])
        assert.equal(check(question, { fact: replace(text) }), false, text);
});

test('source and edition eligibility must independently approve the unchanged full witness', () => {
    for (const source of [{ ...fact.source, review: 'external-research' }, { ...fact.source, review: 'conflicting' },
        { ...fact.source, file: '' }, { ...fact.source, locator: '' },
        { ...fact.source, locator: 'companionData[*]' }, { ...fact.source, locator: 'companionData[4]; other[0]' }])
        assert.equal(check(question, { fact: { ...fact, source } }), false);
    for (const isEligible of [undefined, () => false, () => 'truthy',
        value => value.source.file === 'unsupported.js', value => value.record.editions.includes('unknown-edition')])
        assert.equal(check(question, { isEligible }), false);
    assert.equal(check(question, { fact: { ...fact, conflict: true } }), false);
    assert.equal(check(question, { fact: { ...fact, record: { ...fact.record, conflict: true } } }), false);
    const seen = [];
    assert.equal(check(question, { isEligible: value => { seen.push(value); return true; } }), true);
    assert.deepEqual(seen, [fact]);
    const tampered = { ...parse(question), traitText: 'the most powerful mage' };
    assert.equal(supports(tampered, context), false);
});

test('the helper does not resolve ambiguity, compute exclusivity or mutate its input', () => {
    const other = { ...fact, id: 'other-person-fact', entityId: 'example:person:other', subject: 'Other', record: undefined };
    const matches = [context, { ...context, fact: other, subjectEntityId: other.entityId, subjectLabels: ['Other'] }]
        .filter(candidate => supports(parse(question), candidate));
    assert.equal(matches.length, 2); // The parent must require exactly one.
    const snapshot = JSON.stringify([fact, entity, parse(question)]);
    check();
    assert.equal(JSON.stringify([fact, entity, parse(question)]), snapshot);
    assert.equal(typeof supports(parse(question), context), 'boolean');
});
