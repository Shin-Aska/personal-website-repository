import test from 'node:test';
import assert from 'node:assert/strict';
import { nextFrameTokens, maskFrameScores } from './frame-tokens.js';

test('shared and divergent frame prefixes expose only approved next tokens', () => {
    const sequences = [[10, 20, 30], [10, 20, 40], [50, 60]];
    assert.deepEqual(nextFrameTokens(sequences, [], 2), [10, 50]);
    assert.deepEqual(nextFrameTokens(sequences, [10n], 2), [20]);
    assert.deepEqual(nextFrameTokens(sequences, [10n, 20n], 2), [30, 40]);
    assert.deepEqual(nextFrameTokens(sequences, [50, 60], 2), [2]);
});
test('a complete shorter frame allows EOS while retaining a valid longer branch', () => {
    assert.deepEqual(nextFrameTokens([[10], [10, 20]], [10], 2), [2, 20]);
});
test('invalid prefixes fail rather than return an unconstrained vocabulary', () => {
    assert.throws(() => nextFrameTokens([[10, 20]], [99], 2));
    assert.throws(() => nextFrameTokens([[10, 20]], [10, 20, 30], 2));
});
test('mask preserves allowed model scores and excludes every other token', () => {
    const scores = new Float32Array([10, 3, 90, -7]);
    assert.deepEqual([...maskFrameScores(scores, [1, 3])], [-Infinity, 3, -Infinity, -7]);
});
test('missing or invalid allowed scores fail closed', () => {
    assert.throws(() => maskFrameScores(new Float32Array([1, 2]), []));
    assert.throws(() => maskFrameScores(new Float32Array([1, 2]), [9]));
    assert.throws(() => maskFrameScores(new Float32Array([NaN, -Infinity]), [0]));
    assert.throws(() => maskFrameScores(new Float32Array([NaN, -Infinity]), [1]));
});
test('exhaustive small-tree walks can finish only a complete approved sequence', () => {
    const sequences = [[5, 7, 9], [5, 8], [6, 10]], finished = [];
    const walk = prefix => {
        for (const id of nextFrameTokens(sequences, prefix, 2)) {
            if (id === 2) finished.push(prefix);
            else walk([...prefix, id]);
        }
    };
    walk([]);
    assert.deepEqual(finished, sequences);
});
