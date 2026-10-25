import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseMethodAssertion, supportsMethodAssertion } from '../../js/assistant/method-assertions.js';

const albion = JSON.parse(await readFile(new URL('../../data/assistant/knowledge/albion.json', import.meta.url), 'utf8'));
const actual = albion.facts.find(fact => fact.id === 'choose-siobhan-or-khunag');
assert.ok(actual, 'Expected the actual Albion recruitment source');
const question = 'Is talking to him part of it?';
const context = { fact: actual, subjectLabels: ['Khunag'], lastFacet: 'recruitment', grounded: true };
const supports = (text = question, extra = {}) => supportsMethodAssertion(parseMethodAssertion(text), { ...context, ...extra });
const source = text => ({ text, witness: text, answerRelations: ['recruitment', 'method'] });

test('A method descriptor retains the complete original and both reference phrases', () => {
    assert.deepEqual(parseMethodAssertion(question), { kind: 'method-presence', action: 'dialogue',
        subjectText: 'him', referenceText: 'it', originalText: question });
    const text = '  Is talking to Khunag in the XYZ edition part of recruiting him without gold?  ';
    assert.deepEqual(parseMethodAssertion(text), { kind: 'method-presence', action: 'dialogue',
        subjectText: 'Khunag in the XYZ edition', referenceText: 'recruiting him without gold', originalText: text });
    assert.equal(Object.isFrozen(parseMethodAssertion(question)), true);
    assert.equal(supports(text), false);
});

test('The actual Albion clause binds dialogue to Khunag recruitment only', () => {
    assert.equal(supports(), true);
    for (const text of ['Is talking to Khunag part of recruiting him?',
        'Is speaking to Khunag a part of recruiting him?',
        'Is talking to him part of recruiting Khunag?',
        'Is talking to Khunag part of the recruitment of Khunag?']) {
        assert.equal(supports(text), true, text);
    }
    assert.equal(supports(question.replace('him', 'her'), { subjectLabels: ['Siobhan'] }), false);
    assert.equal(supports('Is talking to Siobhan part of recruiting her?', { subjectLabels: ['Siobhan'] }), false);
    assert.equal(supports('Is talking to Siobhan part of recruiting him?'), false);
    assert.equal(supports('Is talking to Unknown part of recruiting him?'), false);
});

test('Pronouns require a grounded recruitment context and a known person', () => {
    for (const extra of [{ grounded: false }, { grounded: undefined }, { lastFacet: null },
        { lastFacet: 'acquisition' }, { lastFacet: 'method' }, { lastFacet: 'location' },
        { subjectLabels: [] }, { subjectLabels: undefined }, { subjectLabels: ['him'] }]) {
        assert.equal(supports(question, extra), false, JSON.stringify(extra));
    }
    assert.equal(supportsMethodAssertion(parseMethodAssertion(question)), false);
    assert.equal(supports('Is talking to it part of it?'), false);
    assert.equal(supports('Is talking to him part of the inventory?'), false);
});

test('Literal source clauses and explicit method/recruitment roles are both required', () => {
    for (const fact of [null, { ...actual, witness: undefined }, { ...actual, witness: 'Recruit Khunag.' },
        { ...actual, answerRelations: ['method'] }, { ...actual, answerRelations: ['recruitment'] },
        { ...actual, answerRelations: undefined, facet: 'method' },
        source('Talk to Khunag. Recruit Siobhan directly.'),
        source('Khunag knows Siobhan, whom you recruit via dialogue.'),
        source('Recruit Siobhan via dialogue, or recruit Khunag directly.'),
        source('Do not recruit Khunag via dialogue.'),
        source('If you recruit Khunag via dialogue, return here.'),
        source('He says: recruit Khunag via dialogue.'),
        source('Perhaps you can recruit Khunag via dialogue.')]) {
        assert.equal(supports(question, { fact }), false, fact?.text);
    }
    assert.equal(supports(question, { fact: source('Recruit Khunag via dialogue.') }), true);
    assert.equal(supports(question, { fact: source('You can recruit Khunag via dialogue.') }), true);
});

test('Assertions do not prove sufficiency, exclusivity, necessity, or player completion', () => {
    for (const text of [null, {}, '', 'Have I talked to him?', 'Did I talk to Khunag?',
        'Is talking to him enough?', 'Is talking to him the only way to recruit him?',
        'Is talking to him all I need?', 'Is talking to him guaranteed to recruit him?',
        'Is talking to him required?', 'Is bribing him part of it?', 'Is killing him part of it?']) {
        assert.equal(parseMethodAssertion(text), null, String(text));
    }
    for (const text of ['Is talking to him only part of it?',
        'Is talking to him part of it and all I need?',
        'Is talking to him part of recruiting him only?',
        'Is talking to him part of it after I already talked to him?',
        'Is talking to him twice part of it?',
        'Is talking to him part of it? Only use the manual.']) assert.equal(supports(text), false, text);
});

test('Descriptors and source objects are not changed and forged descriptor fields fail closed', () => {
    const descriptor = parseMethodAssertion(question), fact = Object.freeze({ ...actual });
    assert.equal(supportsMethodAssertion(descriptor, { ...context, fact }), true);
    assert.equal(supportsMethodAssertion({ ...descriptor, subjectText: 'Siobhan' }, context), false);
    assert.equal(supportsMethodAssertion({ ...descriptor, action: 'bribing' }, context), false);
    assert.equal(fact.text, actual.text);
    assert.deepEqual(descriptor, parseMethodAssertion(question));
});
