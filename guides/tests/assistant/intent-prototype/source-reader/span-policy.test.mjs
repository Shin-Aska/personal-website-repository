import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreContext, rankContexts} from './span-policy.mjs';
const tensors = () => ({inputIds: [101, 22, 102, 31, 32, 102, 0],
    tokenTypes: [0, 0, 0, 1, 1, 1, 0], attention: [1, 1, 1, 1, 1, 1, 0],
    start: [2, 999, 999, 5, 1, 999, 999], end: [2, 999, 999, 1, 5, 999, 999]});
test('question, separators, CLS and padding cannot become answer spans', () => {
    const result = scoreContext(tensors());
    assert.equal(result.startToken, 3);
    assert.equal(result.endToken, 4);
    assert.equal(result.margin, 6);
});
test('CLS preference and close competing contexts both cause abstention', () => {
    const data = tensors();
    data.start[0] = data.end[0] = 10;
    const result = scoreContext(data);
    assert.equal(rankContexts([{id: 'one', result}], {minNullMargin: 0, minWinnerMargin: 0}).accepted, false);
    const confident = scoreContext(tensors());
    assert.equal(rankContexts([{id: 'a', result: confident}, {id: 'b', result: confident}],
        {minNullMargin: 0, minWinnerMargin: 0}).accepted, false);
});
test('missing calibration and oversized inputs fail closed', () => {
    assert.throws(() => rankContexts([], {}), /calibration/);
    assert.throws(() => scoreContext({...tensors(), maxInputTokens: 2}), /Invalid/);
});
