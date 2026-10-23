// Finite sequences only; this does not implement general language constraints.
export function nextFrameTokens(sequences, prefix, eos) {
    const next = new Set();
    for (const sequence of sequences) {
        if (sequence.length < prefix.length || !prefix.every((id, i) => Number(id) === Number(sequence[i]))) continue;
        next.add(prefix.length === sequence.length ? eos : Number(sequence[prefix.length]));
    }
    if (!next.size) throw new Error('Generated tokens left the approved frame sequences');
    return [...next];
}

export function maskFrameScores(scores, allowed) {
    const keep = allowed.map(id => [id, scores[id]]);
    if (keep.some(([id, score]) => !Number.isInteger(id) || id < 0 || id >= scores.length || Number.isNaN(score)))
        throw new Error('Invalid approved-frame token score');
    if (!keep.some(([, score]) => Number.isFinite(score))) throw new Error('No finite approved-frame token score');
    scores.fill(-Infinity);
    for (const [id, score] of keep) scores[id] = score;
    return scores;
}
