// Pure, non-generative replay of the exported regularized linear head.
export const INTENT_LABELS = Object.freeze(['identity', 'location', 'acquisition', 'use', 'stats', 'combat',
    'prerequisites', 'hint', 'why', 'comparison', 'overview', 'unknown']);
export function validateIntentHead(head) {
    if (!head || head.schemaVersion !== 1 || head.dimensions !== 384 || !Array.isArray(head.labels)
        || head.labels.length !== INTENT_LABELS.length || INTENT_LABELS.some((label, i) => head.labels[i] !== label)
        || !Array.isArray(head.weights) || head.weights.length !== head.labels.length
        || !Array.isArray(head.bias) || head.bias.length !== head.labels.length) throw new Error('Invalid packaged intent head');
    for (let i = 0; i < head.labels.length; i++) {
        if (!Array.isArray(head.weights[i]) || head.weights[i].length !== head.dimensions || !Number.isFinite(head.bias[i])) throw new Error('Invalid intent head dimensions');
        for (const value of head.weights[i]) if (!Number.isFinite(value)) throw new Error('Nonfinite intent head weights');
    }
}
export function predictIntentHead(head, vector) {
    if (!Array.isArray(vector) || vector.length !== head.dimensions) throw new Error('Invalid intent embedding dimensions');
    let norm = 0;
    for (const value of vector) { if (!Number.isFinite(value)) throw new Error('Nonfinite intent embedding');norm += value * value; }
    if (Math.abs(Math.sqrt(norm) - 1) > 1e-3) throw new Error('Intent embedding must have unit norm');
    const logits = head.weights.map((row, i) => {
        let value = head.bias[i];
        for (let j = 0; j < head.dimensions; j++) value += row[j] * vector[j];
        if (!Number.isFinite(value)) throw new Error('Nonfinite intent scores');
        return value;
    });
    const maximum = Math.max(...logits), scores = logits.map(value => Math.exp(value - maximum));
    const sum = scores.reduce((total, value) => total + value, 0);
    if (!Number.isFinite(sum) || sum <= 0) throw new Error('Invalid intent softmax');
    // Scores are uncalibrated. Only validation-selected abstention gates may
    // decide whether a caller should attempt a bounded source interpretation.
    return scores.map((score, i) => ({ label: head.labels[i], score: score / sum }))
        .sort((a, b) => b.score - a.score || head.labels.indexOf(a.label) - head.labels.indexOf(b.label));
}
