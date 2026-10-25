// Derived from ../classifier.mjs; only vocabulary changed for isolated request-field research.
// Upstream SHA256 9e073c5227ea40a34d0c5e9914b73d3d1e83e7b4b9f55c2a1fb6c0a0be894162
/**
 * Dependency-free experimental linear head over frozen sentence embeddings.
 * Softmax scores are uncalibrated ranking scores, not probabilities of correctness.
 * Keep train, validation (threshold selection), and final test examples separate.
 */
export const INTENT_LABELS = Object.freeze(["identity", "purpose", "relationship", "installation", "configuration", "download", "documentation", "support", "compatibility", "version", "location", "destination", "route", "acquisition", "recruitment", "prerequisites", "stats", "combat", "use", "method", "outcome", "cause", "creator", "comparison", "limitations", "objective", "sequence", "remedy", "reference"]);

const MAX_SAMPLES = 20_000;
const MAX_DIMENSIONS = 4_096;
const MAX_TRAINING_WORK = 500_000_000;
const UNIT_NORM_TOLERANCE = 1e-3;

function fail(message) {
  throw new TypeError(`Intent classifier: ${message}`);
}

function finiteNumber(value, name, minimum, maximum) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    fail(`${name} must be a finite number between ${minimum} and ${maximum}`);
  }
  return value;
}

function integer(value, name, minimum, maximum) {
  finiteNumber(value, name, minimum, maximum);
  if (!Number.isInteger(value)) fail(`${name} must be an integer`);
  return value;
}

function validateOptions(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) fail('options must be an object');
}

function isVector(value) {
  return Array.isArray(value) || (ArrayBuffer.isView(value) && !(value instanceof DataView));
}

function validateEmbedding(embedding, dimensions, context) {
  if (!isVector(embedding) || embedding.length !== dimensions) {
    fail(`${context} must contain exactly ${dimensions} dimensions`);
  }
  let squaredNorm = 0;
  for (const value of embedding) {
    if (!Number.isFinite(value)) fail(`${context} contains a nonfinite value`);
    squaredNorm += value * value;
  }
  if (!Number.isFinite(squaredNorm) || Math.abs(Math.sqrt(squaredNorm) - 1) > UNIT_NORM_TOLERANCE) {
    fail(`${context} must have unit norm (tolerance ${UNIT_NORM_TOLERANCE})`);
  }
}

function validateDataset(samples, embeddings, allowEmpty = false) {
  if (!Array.isArray(samples) || (!allowEmpty && samples.length === 0) || samples.length > MAX_SAMPLES) {
    fail(`samples must be an array with ${allowEmpty ? 0 : 1} to ${MAX_SAMPLES} entries`);
  }
  if (!Array.isArray(embeddings) || embeddings.length !== samples.length) {
    fail('samples and embeddings must have the same number of entries');
  }
  const ids = new Set();
  for (const [index, sample] of samples.entries()) {
    if (!sample || typeof sample.id !== 'string' || !sample.id || typeof sample.text !== 'string') {
      fail(`sample ${index} needs a nonempty string id and string text`);
    }
    if (ids.has(sample.id)) fail(`duplicate sample id ${sample.id}`);
    ids.add(sample.id);
    if (!INTENT_LABELS.includes(sample.label)) fail(`sample ${sample.id} has unsupported label ${sample.label}`);
  }
  if (samples.length === 0) return 0;
  if (!isVector(embeddings[0])) fail('embedding 0 must be an array or numeric typed array');
  const dimensions = integer(embeddings[0].length, 'dimensions', 1, MAX_DIMENSIONS);
  for (let index = 0; index < embeddings.length; index += 1) {
    validateEmbedding(embeddings[index], dimensions, `embedding ${index}`);
  }
  return dimensions;
}

function validateHead(head) {
  if (!head || head.schemaVersion !== 1 || !Array.isArray(head.labels)
    || head.labels.length !== INTENT_LABELS.length
    || INTENT_LABELS.some((label, index) => label !== head.labels[index])) {
    fail('head must use schemaVersion 1 and the fixed intent label vocabulary in order');
  }
  integer(head.dimensions, 'head dimensions', 1, MAX_DIMENSIONS);
  if (!Array.isArray(head.weights) || head.weights.length !== head.labels.length
    || !Array.isArray(head.bias) || head.bias.length !== head.labels.length) {
    fail('head weights and bias must match the label count');
  }
  for (let label = 0; label < head.labels.length; label += 1) {
    const row = head.weights[label];
    if (!Array.isArray(row) || row.length !== head.dimensions) {
      fail(`head weight row ${label} has invalid dimensions or nonfinite values`);
    }
    for (const value of row) {
      if (!Number.isFinite(value)) fail(`head weight row ${label} has invalid dimensions or nonfinite values`);
    }
    if (!Number.isFinite(head.bias[label])) fail('head bias contains nonfinite values');
  }
}

function softmax(head, embedding) {
  const logits = head.weights.map((row, label) => {
    let value = head.bias[label];
    for (let dimension = 0; dimension < head.dimensions; dimension += 1) {
      value += row[dimension] * embedding[dimension];
    }
    if (!Number.isFinite(value)) fail('nonfinite logits; inspect the head weights or reduce training learningRate');
    return value;
  });
  const maximum = Math.max(...logits);
  const exponentials = logits.map(value => Math.exp(value - maximum));
  const sum = exponentials.reduce((total, value) => total + value, 0);
  if (!Number.isFinite(sum) || sum <= 0) fail('softmax became nonfinite');
  return exponentials.map(value => value / sum);
}

function rankedPredictions(head, embedding) {
  return softmax(head, embedding)
    .map((score, index) => ({ label: head.labels[index], score }))
    .sort((a, b) => b.score - a.score || head.labels.indexOf(a.label) - head.labels.indexOf(b.label));
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

/** Fit only the supplied training split; never pass validation or test embeddings here. */
export function trainClassifier(samples, embeddings, options = {}) {
  validateOptions(options);
  const dimensions = validateDataset(samples, embeddings);
  const learningRate = finiteNumber(options.learningRate ?? 0.8, 'learningRate', 1e-6, 10);
  const l2 = finiteNumber(options.l2 ?? 0.001, 'l2', 0, 1);
  const seed = integer(options.seed ?? 42, 'seed', 0, 0xffff_ffff);
  const workPerEpoch = samples.length * dimensions * INTENT_LABELS.length;
  const maximumEpochs = Math.min(5_000, Math.floor(MAX_TRAINING_WORK / workPerEpoch));
  if (maximumEpochs < 1) fail('training data exceeds the bounded training work limit');
  const epochs = integer(options.epochs ?? Math.min(400, maximumEpochs), 'epochs', 1, maximumEpochs);
  const random = seededRandom(seed);
  const head = {
    schemaVersion: 1,
    labels: [...INTENT_LABELS],
    dimensions,
    weights: INTENT_LABELS.map(() => Array.from({ length: dimensions }, () => (random() - 0.5) * 0.002)),
    bias: INTENT_LABELS.map(() => 0),
    training: { samples: samples.length, epochs, learningRate, l2, seed, loss: 0 },
  };
  const targets = samples.map(sample => INTENT_LABELS.indexOf(sample.label));
  const gradient = head.weights.map(() => new Float64Array(dimensions));
  const biasGradient = new Float64Array(head.labels.length);
  const inverseCount = 1 / samples.length;
  for (let epoch = 0; epoch < epochs; epoch += 1) {
    gradient.forEach(row => row.fill(0));
    biasGradient.fill(0);
    for (let sample = 0; sample < samples.length; sample += 1) {
      const scores = softmax(head, embeddings[sample]);
      for (let label = 0; label < head.labels.length; label += 1) {
        const error = (scores[label] - Number(targets[sample] === label)) * inverseCount;
        biasGradient[label] += error;
        for (let dimension = 0; dimension < dimensions; dimension += 1) {
          gradient[label][dimension] += error * embeddings[sample][dimension];
        }
      }
    }
    for (let label = 0; label < head.labels.length; label += 1) {
      head.bias[label] -= learningRate * biasGradient[label];
      for (let dimension = 0; dimension < dimensions; dimension += 1) {
        head.weights[label][dimension] -= learningRate
          * (gradient[label][dimension] + l2 * head.weights[label][dimension]);
      }
    }
  }
  validateHead(head);
  // Report final average cross-entropy, excluding the regularization penalty.
  head.training.loss = samples.reduce((loss, sample, index) => (
    loss - Math.log(Math.max(Number.MIN_VALUE, softmax(head, embeddings[index])[targets[index]]))
  ), 0) * inverseCount;
  if (!Number.isFinite(head.training.loss)) fail('final training loss became nonfinite');
  return head;
}

export function predictClassifier(head, embedding) {
  validateHead(head);
  validateEmbedding(embedding, head.dimensions, 'prediction embedding');
  return rankedPredictions(head, embedding);
}

function validateThresholds(thresholds = {}) {
  if (thresholds === null || typeof thresholds !== 'object') fail('thresholds must be an object');
  if (thresholds.abstainAll !== undefined && typeof thresholds.abstainAll !== 'boolean') {
    fail('abstainAll must be a boolean');
  }
  return {
    minScore: finiteNumber(thresholds.minScore ?? 0, 'minScore', 0, 1),
    minMargin: finiteNumber(thresholds.minMargin ?? 0, 'minMargin', 0, 1),
    abstainAll: thresholds.abstainAll ?? false,
  };
}

function accepts(score, margin, thresholds) {
  return !thresholds.abstainAll && score >= thresholds.minScore && margin >= thresholds.minMargin;
}

/** Evaluate a held-out split. Confusions include all raw predictions, even abstentions. */
export function evaluateClassifier(head, samples, embeddings, thresholds = {}) {
  validateHead(head);
  const dimensions = validateDataset(samples, embeddings, true);
  if (samples.length && dimensions !== head.dimensions) fail('evaluation embeddings do not match head dimensions');
  const appliedThresholds = validateThresholds(thresholds);
  const confusionCounts = new Map();
  const perCase = samples.map((sample, index) => {
    const predictions = rankedPredictions(head, embeddings[index]);
    const predicted = predictions[0].label;
    const score = predictions[0].score;
    const margin = score - predictions[1].score;
    const key = `${sample.label}:${predicted}`;
    confusionCounts.set(key, (confusionCounts.get(key) ?? 0) + 1);
    return {
      id: sample.id, text: sample.text, expected: sample.label, predicted, score, margin,
      accepted: accepts(score, margin, appliedThresholds), correct: predicted === sample.label,
    };
  });
  const correct = perCase.filter(row => row.correct).length;
  const accepted = perCase.filter(row => row.accepted).length;
  const acceptedCorrect = perCase.filter(row => row.accepted && row.correct).length;
  return {
    thresholds: appliedThresholds,
    metrics: {
      total: samples.length, correct, accuracy: samples.length ? correct / samples.length : null,
      accepted, acceptedCorrect, acceptedAccuracy: accepted ? acceptedCorrect / accepted : null,
      coverage: samples.length ? accepted / samples.length : null, abstained: samples.length - accepted,
    },
    confusions: [...confusionCounts].map(([key, count]) => {
      const [expected, predicted] = key.split(':');
      return { expected, predicted, count };
    }),
    perCase,
  };
}

function candidateThresholds(values) {
  const unique = [...new Set([0, ...values])].sort((a, b) => a - b);
  if (unique.length <= 51) return unique;
  return [...new Set(Array.from({ length: 51 }, (_, index) => unique[Math.floor(index * (unique.length - 1) / 50)]))];
}

/**
 * Choose the largest searched validation coverage reaching targetAccuracy, breaking ties
 * by accuracy then lower cutoffs. The caller must supply validation perCase rows
 * only. This empirical rule does not calibrate confidence or guarantee test accuracy.
 */
export function selectThresholds(validationPredictions, options = {}) {
  validateOptions(options);
  if (!Array.isArray(validationPredictions) || validationPredictions.length === 0
    || validationPredictions.length > MAX_SAMPLES) {
    fail(`validationPredictions must have 1 to ${MAX_SAMPLES} entries`);
  }
  const targetAccuracy = finiteNumber(options.targetAccuracy ?? 0.9, 'targetAccuracy', 0, 1);
  const minAccepted = integer(options.minAccepted ?? 1, 'minAccepted', 1, validationPredictions.length);
  for (const [index, row] of validationPredictions.entries()) {
    if (!row || !INTENT_LABELS.includes(row.expected) || !INTENT_LABELS.includes(row.predicted)) {
      fail(`validation prediction ${index} has an unsupported expected or predicted label`);
    }
    finiteNumber(row.score, `validation score ${index}`, 0, 1);
    finiteNumber(row.margin, `validation margin ${index}`, 0, row.score);
  }
  const scoreCandidates = candidateThresholds(validationPredictions.map(row => row.score));
  const marginCandidates = candidateThresholds(validationPredictions.map(row => row.margin));
  let best = null;
  for (const minScore of scoreCandidates) {
    for (const minMargin of marginCandidates) {
      let accepted = 0;
      let correct = 0;
      for (const row of validationPredictions) {
        if (row.score >= minScore && row.margin >= minMargin) {
          accepted += 1;
          correct += Number(row.expected === row.predicted);
        }
      }
      const accuracy = accepted ? correct / accepted : 0;
      if (accepted < minAccepted || accuracy < targetAccuracy) continue;
      if (!best || accepted > best.accepted || (accepted === best.accepted && accuracy > best.accuracy)) {
        best = { minScore, minMargin, accepted, accuracy };
      }
    }
  }
  return {
    minScore: best?.minScore ?? 1,
    minMargin: best?.minMargin ?? 1,
    abstainAll: best === null,
    selection: {
      source: 'validation', samples: validationPredictions.length, targetAccuracy, minAccepted,
      accepted: best?.accepted ?? 0, accuracy: best?.accuracy ?? null,
      coverage: best ? best.accepted / validationPredictions.length : 0,
      candidateLimitPerAxis: 51,
    },
  };
}
