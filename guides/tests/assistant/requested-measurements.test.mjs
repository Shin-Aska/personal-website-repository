import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRequestedMeasurement, supportsRequestedMeasurement } from '../../js/assistant/requested-measurements.js';

const age = parseRequestedMeasurement('Exactly how old is Anya?');
const honey = parseRequestedMeasurement('Exactly how many ounces of honey do I have to hand over?');

test('Finite question grammar identifies age and measured quantities', () => {
    assert.deepEqual(age, { kind: 'age', subject: 'anya', exact: true });
    assert.deepEqual(honey, { kind: 'quantity', unit: 'ounce', exact: true });
    for (const q of ["What is Anya's age?", 'What is Anya age?', 'How old exactly is Anya?', 'How old is Anya exactly?']) {
        assert.deepEqual(parseRequestedMeasurement(q), { ...age, exact: q.includes('exactly') }, q);
    }
    assert.deepEqual(parseRequestedMeasurement('How much SP does the spell cost?'), { kind: 'quantity', unit: 'sp', exact: false });
    assert.deepEqual(parseRequestedMeasurement('How many feet is the drop?'), { kind: 'quantity', unit: 'foot', exact: false });
});

test('Age requires explicit numeric age wording in the witness', () => {
    for (const source of ['Anya is 18 years old.', 'Anya is an eighteen-year-old child.',
        'Anya, aged eighteen, waits here.', 'Age: 18.', 'Her age is eighteen.', 'She reached the age of eighteen.']) {
        assert.equal(supportsRequestedMeasurement(age, source), true, source);
    }
    for (const source of ['Ask Anya for permission.', 'Anya: age unknown; room 18.',
        'There are 18 people. Anya gives permission.', 'Anya was born in 1990.', 'Anya is young.',
        'The Age of Enlightenment began long ago; 18 scrolls remain.', 'She is a number of years old.']) {
        assert.equal(supportsRequestedMeasurement(age, source), false, source);
    }
});

test('Exact requests reject approximations, bounds and ranges beside actual exact counterparts', () => {
    for (const source of ['Give about 2 ounces.', 'Give at least two ounces.', 'Give 2–3 ounces.',
        'Give two to three ounces.', 'Give between two and three ounces.', 'Give 2 ounces to 3 ounces.',
        'Give 2 ounces or more.', 'Give 2 ounces minimum.', 'Give approximately 2.5 ounces.',
        'Give two through three ounces.']) {
        assert.equal(supportsRequestedMeasurement(honey, source), false, source);
    }
    for (const source of ['Hand over two ounces.', 'Hand over exactly 2 ounces.', 'Give 2.5 ounces.',
        'Give twenty-five ounces.', 'Give one hundred and two ounces.']) {
        assert.equal(supportsRequestedMeasurement(honey, source), true, source);
    }
    const hours = parseRequestedMeasurement('Exactly how many hours does it last?');
    assert.equal(supportsRequestedMeasurement(hours, 'It lasts under 2 hours.'), false);
    assert.equal(supportsRequestedMeasurement(hours, 'It lasts 2 hours.'), true);
    for (const source of ['She is about 20 years old.', 'She is aged about 20.', 'She is aged 20–30.',
        'She is around age 20.', 'She is approximately aged 20.', 'She is estimated at 20 years old.']) {
        assert.equal(supportsRequestedMeasurement(age, source), false, source);
    }
    assert.equal(supportsRequestedMeasurement(age, 'She is aged 20.'), true);
    assert.equal(supportsRequestedMeasurement(parseRequestedMeasurement('How many ounces are needed?'),
        'About 2 ounces are needed.'), true);
});

test('Negated and unknown amounts are not positive measured proof', () => {
    for (const source of ['He does not require 2 ounces.', "He doesn't require two ounces.",
        'Two ounces are not required.', 'Unknown whether two ounces are required.']) {
        assert.equal(supportsRequestedMeasurement(honey, source), false, source);
        assert.equal(supportsRequestedMeasurement({ ...honey, exact: false }, source), false, source);
    }
    assert.equal(supportsRequestedMeasurement(honey, 'He requires two ounces.'), true);
    assert.equal(supportsRequestedMeasurement(honey, 'The route is unknown. He requires two ounces.'), true);
    assert.equal(supportsRequestedMeasurement(age, 'She is not eighteen years old.'), false);
});

test('A measured request requires the actual amount and the same unit', () => {
    for (const source of ['He asks for "3 ounces" of honey.', 'Give him three ounces of honey.',
        'Give him twenty-five ounces.', 'Give him one hundred and twenty-five ounces.',
        'The bribe is a 1-ounce jar.', 'Honey: 3.5 oz.', 'Bring zero ounces.']) {
        assert.equal(supportsRequestedMeasurement(honey, source), true, source);
    }
    for (const source of ['Bribe him with honey.', 'Honey: amount unknown.', 'Give him three grams of honey.',
        'Give him 3 jars of honey; each weighs an unknown number of ounces.',
        'Entry 3: hand over honey. The ounces are unspecified.', 'Bring some ounces.', 'Bring a few ounces.']) {
        assert.equal(supportsRequestedMeasurement(honey, source), false, source);
    }
});

test('Canonical unit aliases retain singulars, plurals and numeric words without conversion', () => {
    for (const [question, good, bad] of [
        ['How many grams are needed?', 'One gram.', 'One kilogram.'],
        ['How much kg is needed?', 'Two kilograms.', 'Two grams.'],
        ['How many litres are needed?', 'Three liters.', 'Three gallons.'],
        ['How many metres away?', 'Four meters.', 'Four miles.'],
        ['How many feet away?', 'One foot.', 'One metre.'],
        ['How many hours does it take?', 'Two hrs.', 'Two days.'],
        ['How many minutes does it take?', 'Three min.', 'Three seconds.'],
        ['How many turns does it last?', 'One turn.', 'One cycle.'],
        ['How many cycles does it last?', 'Two cycles.', 'Two turns.'],
        ['How much SP does it cost?', 'Twelve SP.', 'Twelve coins.']
    ]) {
        const request = parseRequestedMeasurement(question);
        assert.equal(supportsRequestedMeasurement(request, good), true, good);
        assert.equal(supportsRequestedMeasurement(request, bad), false, bad);
    }
});

test('Ordinary identities, statements and untyped counts are not measurement requests', () => {
    for (const q of ['What is Age of Enlightenment?', 'Who is Age?', 'Anya is 18 years old.',
        'Tell me how old Anya is.', 'How do I cast Age?', 'How many jars of honey?', 'What does Anya want?', '']) {
        assert.equal(parseRequestedMeasurement(q), null, q);
    }
});

test('Witnesses stay separate, unsupported inputs fail closed and inputs are not mutated', () => {
    const request = Object.freeze({ ...honey });
    const source = Object.freeze({ text: 'Three jars of honey.', detail: 'The ounces are unknown.' });
    assert.equal(supportsRequestedMeasurement(request, source), false);
    assert.equal(supportsRequestedMeasurement(request, source.text), false);
    assert.equal(supportsRequestedMeasurement(request, source.detail), false);
    assert.equal(supportsRequestedMeasurement(null, 'Three ounces.'), false);
    assert.equal(supportsRequestedMeasurement({ kind: 'quantity', unit: 'gallon' }, 'Three gallons.'), false);
    assert.deepEqual(request, honey);
    assert.deepEqual(source, { text: 'Three jars of honey.', detail: 'The ounces are unknown.' });
});
