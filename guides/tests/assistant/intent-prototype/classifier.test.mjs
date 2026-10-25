import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INTENT_LABELS, trainClassifier, predictClassifier, evaluateClassifier, selectThresholds,
} from './classifier.mjs';

function normalized(values) {
  const norm = Math.hypot(...values);
  return values.map(value => value / norm);
}

// These artificial vectors test numerical learning only, not MiniLM or semantic accuracy.
function syntheticSplit(prefix, offsets) {
  const samples = [];
  const embeddings = [];
  INTENT_LABELS.forEach((label, labelIndex) => {
    offsets.forEach((offset, variant) => {
      const vector = Array(INTENT_LABELS.length).fill(0);
      vector[labelIndex] = 1;
      vector[(labelIndex + 1) % vector.length] = offset;
      samples.push({ id: `${prefix}-${label}-${variant}`, text: `synthetic ${prefix} vector`, label });
      embeddings.push(normalized(vector));
    });
  });
  return { samples, embeddings };
}

const training = syntheticSplit('train', [-0.12, 0, 0.12]);
const heldOut = syntheticSplit('test', [-0.07, 0.08]);
const head = trainClassifier(training.samples, training.embeddings);

test('learns a separable synthetic task and generalizes to different held-out vectors', () => {
  const result = evaluateClassifier(head, heldOut.samples, heldOut.embeddings);
  assert.equal(result.metrics.accuracy, 1);
  assert.equal(result.metrics.acceptedAccuracy, 1);
  assert.equal(result.metrics.coverage, 1);
  assert.ok(head.training.loss < 0.15);
  assert.equal(result.confusions.reduce((sum, row) => sum + row.count, 0), heldOut.samples.length);
  assert.ok(result.confusions.every(row => row.expected === row.predicted));
  for (const vector of heldOut.embeddings) {
    const predictions = predictClassifier(head, vector);
    assert.equal(predictions.length, INTENT_LABELS.length);
    assert.ok(Math.abs(predictions.reduce((sum, item) => sum + item.score, 0) - 1) < 1e-12);
    assert.ok(predictions.every((row, index) => index === 0 || predictions[index - 1].score >= row.score));
  }
});

test('training is deterministic and serialized heads replay exactly without fitting again', () => {
  assert.deepEqual(trainClassifier(training.samples, training.embeddings), head);
  const replayed = JSON.parse(JSON.stringify(head));
  assert.deepEqual(predictClassifier(replayed, heldOut.embeddings[0]), predictClassifier(head, heldOut.embeddings[0]));
  assert.deepEqual(evaluateClassifier(replayed, heldOut.samples, heldOut.embeddings), evaluateClassifier(head, heldOut.samples, heldOut.embeddings));
  const typed = new Float32Array(heldOut.embeddings[0]);
  assert.equal(predictClassifier(replayed, typed)[0].label, heldOut.samples[0].label);
});

test('L2 regularization reduces fitted weight magnitude on the same synthetic task', () => {
  const regularized = trainClassifier(training.samples, training.embeddings, { l2: 0.1 });
  const squaredMagnitude = model => model.weights.flat().reduce((sum, value) => sum + value * value, 0);
  assert.ok(squaredMagnitude(regularized) < squaredMagnitude(head));
  assert.equal(evaluateClassifier(regularized, heldOut.samples, heldOut.embeddings).metrics.accuracy, 1);
});

test('threshold boundaries are inclusive and abstention is distinct from the unknown intent', () => {
  const samples = [heldOut.samples[0]];
  const embeddings = [heldOut.embeddings[0]];
  const row = evaluateClassifier(head, samples, embeddings).perCase[0];
  assert.equal(evaluateClassifier(head, samples, embeddings, { minScore: row.score, minMargin: row.margin }).metrics.accepted, 1);
  assert.equal(evaluateClassifier(head, samples, embeddings, { minScore: row.score + 1e-8 }).metrics.accepted, 0);
  assert.equal(evaluateClassifier(head, samples, embeddings, { minMargin: row.margin + 1e-8 }).metrics.accepted, 0);
  const rejected = evaluateClassifier(head, samples, embeddings, { abstainAll: true });
  assert.equal(rejected.metrics.acceptedAccuracy, null);
  assert.equal(rejected.metrics.abstained, 1);
  assert.equal(rejected.perCase[0].predicted, 'identity');
  const unknownIndex = heldOut.samples.findIndex(sample => sample.label === 'unknown');
  const unknown = evaluateClassifier(head, [heldOut.samples[unknownIndex]], [heldOut.embeddings[unknownIndex]]);
  assert.equal(unknown.perCase[0].predicted, 'unknown');
  assert.equal(unknown.perCase[0].accepted, true);
});

test('empty evaluation reports undefined rates as null, with no fictional accuracy', () => {
  const result = evaluateClassifier(head, [], []);
  assert.deepEqual(result.metrics, {
    total: 0, correct: 0, accuracy: null, accepted: 0, acceptedCorrect: 0,
    acceptedAccuracy: null, coverage: null, abstained: 0,
  });
  assert.deepEqual(result.confusions, []);
  assert.deepEqual(result.perCase, []);
});

test('validation-only threshold selection maximizes qualifying coverage and handles no qualifying rule', () => {
  const before = JSON.stringify(head);
  const validation = [
    { expected: 'identity', predicted: 'identity', score: 0.9, margin: 0.8 },
    { expected: 'location', predicted: 'location', score: 0.7, margin: 0.5 },
    { expected: 'stats', predicted: 'combat', score: 0.4, margin: 0.1 },
  ];
  const thresholds = selectThresholds(validation, { targetAccuracy: 1 });
  assert.equal(thresholds.selection.source, 'validation');
  assert.equal(thresholds.selection.accepted, 2);
  assert.equal(thresholds.selection.accuracy, 1);
  assert.equal(thresholds.selection.coverage, 2 / 3);
  const none = selectThresholds(validation, { targetAccuracy: 1, minAccepted: 3 });
  assert.equal(none.abstainAll, true);
  assert.equal(none.selection.accuracy, null);
  const wrongSaturated = selectThresholds([{ expected: 'identity', predicted: 'location', score: 1, margin: 1 }]);
  assert.equal(wrongSaturated.abstainAll, true);
  assert.equal(JSON.stringify(head), before);
});

test('rejects invalid vectors, dataset/label mismatches, unsafe options, and corrupt heads', () => {
  const one = [{ id: 'one', text: 'synthetic', label: 'identity' }];
  assert.throws(() => trainClassifier([], []), /samples/);
  assert.throws(() => trainClassifier(one, []), /same number/);
  assert.throws(() => trainClassifier([{ ...one[0], label: 'made-up' }], [[1]]), /unsupported label/);
  assert.throws(() => trainClassifier([one[0], one[0]], [[1], [1]]), /duplicate sample id/);
  assert.throws(() => trainClassifier(one, [[0]]), /unit norm/);
  assert.throws(() => trainClassifier(one, [[2]]), /unit norm/);
  assert.throws(() => trainClassifier(one, [[NaN]]), /nonfinite/);
  assert.throws(() => trainClassifier(one, [[Infinity]]), /nonfinite/);
  assert.throws(() => trainClassifier(one, Array(1)), /embedding 0/);
  assert.throws(() => trainClassifier(one, [[1]], null), /options must be an object/);
  assert.throws(() => trainClassifier(training.samples, training.embeddings.map((row, index) => index === 1 ? [1] : row)), /dimensions/);
  for (const options of [{ epochs: Infinity }, { epochs: 0 }, { learningRate: NaN }, { learningRate: -1 }, { l2: -1 }, { seed: 1.5 }]) {
    assert.throws(() => trainClassifier(one, [[1]], options), /must be/);
  }
  assert.throws(() => predictClassifier(head, [1]), /dimensions/);
  assert.throws(() => predictClassifier({ ...head, labels: ['identity'] }, heldOut.embeddings[0]), /vocabulary/);
  assert.throws(() => predictClassifier({ ...head, bias: head.bias.map(() => Infinity) }, heldOut.embeddings[0]), /nonfinite/);
  assert.throws(() => predictClassifier({ ...head, weights: Array(head.labels.length) }, heldOut.embeddings[0]), /head weight row/);
  assert.throws(() => predictClassifier({ ...head, labels: Array(head.labels.length) }, heldOut.embeddings[0]), /vocabulary/);
  assert.throws(() => evaluateClassifier(head, one, [[1]]), /head dimensions/);
  assert.throws(() => evaluateClassifier(head, [], [], { minScore: NaN }), /minScore/);
  assert.throws(() => evaluateClassifier(head, [], [], { minMargin: -1 }), /minMargin/);
  assert.throws(() => selectThresholds([]), /validationPredictions/);
  assert.throws(() => selectThresholds([{ expected: 'stats', predicted: 'combat', score: 0.1, margin: 0.2 }]), /validation margin/);
});
