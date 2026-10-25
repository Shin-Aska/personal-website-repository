// Raw extractive-reader diagnostics, never answer text. Higher margin is stronger.
export function scoreContext({inputIds, tokenTypes, attention, start, end,
    maxAnswerTokens = 30, maxInputTokens = 384}) {
    const n = inputIds.length;
    if (!n || n > maxInputTokens || [tokenTypes, attention, start, end].some(a => a.length !== n)
        || inputIds[0] !== 101 || start.some(v => !Number.isFinite(v))
        || end.some(v => !Number.isFinite(v)) || !Number.isInteger(maxAnswerTokens)
        || maxAnswerTokens < 1 || maxAnswerTokens > 64) throw new Error('Invalid QA tensors');
    const specials = new Set([0, 100, 101, 102, 103]);
    const eligible = i => attention[i] === 1 && tokenTypes[i] === 1 && !specials.has(inputIds[i]);
    let best = null;
    for (let i = 0; i < n; i++) {
        if (!eligible(i)) continue;
        for (let j = i; j < Math.min(n, i + maxAnswerTokens); j++) {
            if (!eligible(j)) break;
            const score = start[i] + end[j];
            if (!best || score > best.score) best = {startToken: i, endToken: j, score};
        }
    }
    const nullScore = start[0] + end[0];
    return best ? {...best, nullScore, margin: best.score - nullScore} : null;
}

export function rankContexts(scored, {minNullMargin, minWinnerMargin}) {
    if (![minNullMargin, minWinnerMargin].every(Number.isFinite)
        || minNullMargin < 0 || minWinnerMargin < 0) throw new Error('Explicit nonnegative calibration required');
    const ranked = scored.filter(row => row.result).slice().sort((a, b) =>
        b.result.margin - a.result.margin || a.id.localeCompare(b.id));
    const winner = ranked[0];
    const gap = ranked.length > 1 ? winner.result.margin - ranked[1].result.margin : null;
    const accepted = Boolean(winner && winner.result.margin > minNullMargin
        && (gap === null || gap > minWinnerMargin));
    return {accepted, contextId: accepted ? winner.id : null, winnerGap: gap,
        diagnostics: ranked.map(({id, result}) => ({id, ...result}))};
}
