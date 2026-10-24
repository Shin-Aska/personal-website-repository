// Shared semantic checks. Expectations are authored from sources, never replies.
export const CAMPAIGN_GAMES = ['albion', 'ultima5', 'ultima6', 'ultima7', 'alqadim', 'starcraft'];
export const CAMPAIGN_FAMILIES = ['lore', 'travel', 'objectives', 'mechanics', 'relationships',
    'continuity', 'topics', 'names', 'boundaries', 'unsupported'];

export function validateCampaign(fixture) {
    const problems = [], ids = new Set();
    if (fixture.schemaVersion !== 1 || !CAMPAIGN_GAMES.includes(fixture.gameId)) problems.push('unknown campaign schema/game');
    if (!fixture.review || !fixture.basis?.length) problems.push('missing independent source review');
    for (const dialogue of fixture.dialogues || []) {
        if (ids.has(dialogue.id)) problems.push(`duplicate dialogue ${dialogue.id}`);
        ids.add(dialogue.id);
        if (!['gentle', 'balanced', 'direct'].includes(dialogue.spoiler)) problems.push(`${dialogue.id}: missing help level`);
        if (!dialogue.families?.length || dialogue.families.some(f => !CAMPAIGN_FAMILIES.includes(f)))
            problems.push(`${dialogue.id}: unknown conversation family`);
        if (dialogue.turns?.length < 8) problems.push(`${dialogue.id}: fewer than eight visitor turns`);
        for (const [index, turn] of (dialogue.turns || []).entries()) {
            const e = turn.expected, at = `${dialogue.id}:${index + 1}`;
            if (!turn.text || !e || !['answer', 'no-answer', 'reset', 'clarify'].includes(e.decision)) problems.push(`${at}: missing expectation`);
            if (e?.decision === 'answer' && (!e.contains?.length || !e.entityIds?.length || !['guide', 'research', 'mixed'].includes(e.source)))
                problems.push(`${at}: factual answer needs claims, identities and provenance`);
            for (const key of ['recordIds', 'sourceLocators', 'sourceUrls']) if (e?.[key]
                && (!Array.isArray(e[key]) || !e[key].length || e[key].some(value => typeof value !== 'string' || !value)))
                problems.push(`${at}: invalid ${key} expectations`);
        }
    }
    return problems;
}

export function checkConversationReply(reply, expected, { records, spoiler, authorize, history = [] }) {
    const problems = [], body = reply.text.toLowerCase();
    if (reply.stateChanges.length) problems.push('chat changed progress');
    if (expected.decision === 'no-answer') {
        if (!['clarify', 'decline', 'conflict'].includes(reply.decision)) problems.push(`expected no answer, got ${reply.decision}`);
    } else if (reply.decision !== expected.decision) problems.push(`expected ${expected.decision}, got ${reply.decision}`);
    for (const phrase of expected.contains || []) if (!body.includes(phrase.toLowerCase())) problems.push(`missing ${phrase}`);
    for (const phrase of expected.absent || []) if (body.includes(phrase.toLowerCase())) problems.push(`forbidden ${phrase}`);
    if (expected.conflict && (!/sources.*(?:disagree|conflict)|conflicting/.test(body)
        || !reply.sources.length || !reply.sources.every(s => s.review === 'conflicting')))
        problems.push('a known conflict needs its warning and source, not a generic unknown reply');
    if (expected.decision === 'answer') {
        if (!reply.recordIds.length || !reply.sources.length) problems.push('missing factual records/sources');
        for (const id of reply.recordIds) if (!records.some(r => r.id === id && authorize(r, spoiler))) problems.push(`unauthorized record ${id}`);
        for (const entity of expected.entityIds) if (!reply.recordIds.some(id => records.some(r => r.id === id && r.entityId === entity)))
            problems.push(`missing subject ${entity}`);
        if (expected.recordIds && (expected.recordIds.length !== reply.recordIds.length
            || expected.recordIds.some(id => !reply.recordIds.includes(id)))) problems.push('incorrect factual record selection');
        for (const locator of expected.sourceLocators || []) if (!reply.sources.some(s => s.locator === locator))
            problems.push(`missing source locator ${locator}`);
        for (const url of expected.sourceUrls || []) if (!reply.sources.some(s => s.file === url || s.references?.some(r => r.url === url)))
            problems.push(`missing source URL ${url}`);
        const selected = records.filter(r => reply.recordIds.includes(r.id)).map(r => authorize(r, spoiler)).filter(Boolean);
        const declaredSources = selected.flatMap(r => [r.source,
            ...(r.narrative?.status === 'disputed' ? (r.source.claims || []).map(claim => ({ ...claim.source,
                index: r.source.index, claims: claim.source.claims || [{ text: claim.text, source: claim.source }] })) : [])]);
        for (const source of reply.sources) if (!declaredSources.some(declared => JSON.stringify(declared) === JSON.stringify(source)))
            problems.push('reply source does not belong to its authorized factual records');
        if (expected.source === 'guide' && (body.includes('outside research:') || reply.sources.some(s => s.review === 'external-research')))
            problems.push('incorrect guide provenance');
        if (expected.source === 'research' && (!body.includes('outside research:') ||
            !reply.sources.every(s => s.review === 'external-research' && s.references?.length))) problems.push('missing research attribution/citation');
        if (expected.source === 'mixed' && (!reply.sources.some(s => s.review === 'external-research' && s.references?.length)
            || !reply.sources.some(s => s.review !== 'external-research') || !body.includes('outside research')))
            problems.push('mixed answer needs separately attributed guide and research sources');
    }
    for (const phrase of expected.historyAbsent || [])
        if (JSON.stringify(history).toLowerCase().includes(phrase.toLowerCase())) problems.push(`hidden history leaked ${phrase}`);
    return problems;
}
