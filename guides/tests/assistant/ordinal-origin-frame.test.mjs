import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSourceRequestFrame as parse} from '../../js/assistant/request-frame.js';

test('A recorded origin keeps the ordinal as reference metadata and the one referent intact', () => {
    const frame = parse('Where does the first one come from?');
    assert.equal(frame.subjectText, 'one');
    assert.equal(frame.fields[0].key, 'location');
    assert.deepEqual(frame.fields[0].selectors, ['origin']);
    assert.equal(frame.fields[0].ordinal, 1);
    assert.equal(frame.fields[0].referenceText, 'the first one');
    assert.deepEqual(frame.fields[0].objectTexts, ['one']);
    assert.equal(frame.fields[0].requestedText, 'Where does the first one come from');
});

test('Other positive ordinals are syntax only and preserve every source and dependent restriction', () => {
    for (const [word, value] of [['second', 2], ['third', 3], ['tenth', 10], ['11th', 11]]) {
        const frame = parse(`According to the local guide, where does the ${word} one come from in winter?`);
        assert.equal(frame.fields[0].ordinal, value);
        assert.equal(frame.fields[0].referenceText, `the ${word} one`);
        assert.equal(frame.constraints.sourceText, 'According to the local guide');
        assert.ok(frame.fields[0].unknownQualifierTexts.includes('in winter'));
    }
});

test('Unspecified and modified references cannot become an inferred first item', () => {
    for (const noun of ['one', 'the red first one', 'the first red one', 'the zeroth one', 'the 0th one', 'the last one']) {
        const frame = parse(`Where does ${noun} come from?`);
        assert.equal(frame.fields[0].ordinal, undefined, noun);
        assert.equal(frame.subjectText, noun, noun);
    }
});

test('A nonordinal named origin remains a named owner instead of inventing list context', () => {
    const frame = parse('Where does the brass component come from?');
    assert.equal(frame.subjectText, 'the brass component');
    assert.equal(frame.fields[0].ordinal, undefined);
    assert.deepEqual(frame.fields[0].selectors, ['origin']);
});
