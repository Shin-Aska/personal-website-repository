// Exact, authored component-set references. This module creates no answer text
// or conversational state, and does not infer possession from a source reply.
const nonempty = value => typeof value === 'string' && Boolean(value.trim());
const normalize = value => typeof value === 'string' ? value.normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const labels = entity => [entity?.name, ...(entity?.aliases || [])].filter(nonempty).map(normalize);
const article = value => value.replace(/^(?:the|a|an)\s+/i, '');
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const literal = (text, mention) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(mention)}(?![\\p{L}\\p{N}])`, 'iu').test(text);

/** Read only a finite source-question operand; retain every other character.
 * Prefix/suffix are NOT authorized here. Callers must validate them separately,
 * including edition, source, destination, material and current-state guards.
 */
export function parseBundleRequest(text) {
    if (!nonempty(text)) return null;
    const q = text.trim().replace(/[?!.]+$/, '').trim();
    const scene = /^(once inside,\s*)(.+)$/i.exec(q);
    const question = scene ? scene[2] : q;
    const where = /^where\s+(?:(?:can|do)\s+(?:i|we)\s+(?:find|get)|is|are)\s+(.+)$/i.exec(question);
    const how = /^how\s+(?:can|do|should|must)\s+(?:i|we)\s+(get|carry|store|hide|bring|take)\s+(.+)$/i.exec(question);
    if (!where && !how) return null;
    const subject = where ? where[1] : how[2];
    // Recognized relation suffixes remain intact. Unknown modifiers/clauses stay
    // in the operand and therefore cannot be discarded by the exact matcher.
    const suffix = /\s+(?:past|in|inside|into|from|at|on|with|without|using|before|after|for|to)\s+.+$/i.exec(subject);
    const operandText = suffix ? subject.slice(0, suffix.index) : subject;
    if (!operandText.trim()) return null;
    return { requestKind: where ? 'location' : normalize(how[1]), operandText,
        suffixText: suffix?.[0] || '', prefixText: scene?.[1] || '', originalText: text };
}

function completeFact(fact, isEligible) {
    return nonempty(fact?.id) && nonempty(fact.text) && fact.text === fact.witness
        && fact.conflict !== true && fact.record?.conflict !== true
        && fact.source?.review === 'extracted' && nonempty(fact.source.file) && nonempty(fact.source.locator)
        && !/[;*…\r\n]|\.\.\./.test(fact.source.locator) && isEligible(fact) === true;
}

function binding(fact, entity) {
    const matches = (fact.bindings || []).filter(value => value.entityId === entity.id);
    // The compiled primary subject is itself an authored subject binding; it
    // still needs its exact canonical name literally in this group passage.
    if (!matches.length && fact.entityId === entity.id && nonempty(entity.name)
        && literal(fact.text, entity.name) && Array.isArray(fact.answerRelations) && fact.answerRelations.length)
        return { entityId: entity.id, mention: entity.name, relations: fact.answerRelations };
    return matches.length === 1 && nonempty(matches[0].mention)
        && labels(entity).includes(normalize(matches[0].mention))
        && Array.isArray(matches[0].relations) && matches[0].relations.length
        && literal(fact.text, matches[0].mention) ? matches[0] : null;
}

function groupProof(fact, bundle, members) {
    const group = binding(fact, bundle);
    return !!group && members.every(member => {
        const component = binding(fact, member);
        return component && literal(group.mention, component.mention);
    });
}

function sameReturnedFact(returned, current) {
    return returned?.id === current.id && returned.text === current.text && returned.witness === current.witness
        && returned.source?.file === current.source.file && returned.source?.locator === current.source.locator
        && returned.source?.review === current.source.review
        && JSON.stringify(returned.bindings) === JSON.stringify(current.bindings);
}

/**
 * Resolve a complete declared bundle, or null. `isEligible(completeFact)` is
 * mandatory and must independently enforce current source/edition/spoiler and
 * authorized source identity. Every component/possessive edge's full proof is
 * required, even when only one fact will answer the question. Missing, duplicate,
 * disputed or ineligible members/edges never shrink into a supported subset.
 *
 * `returnedFacts` must be ONLY the complete facts actually rendered in the last
 * response. `focusEntityId` alone cannot authorize plural "them". A returned
 * proof must still match current text, witness, bindings and source identity.
 * The caller must check the preserved prefix/suffix and requested answer role;
 * bundle resolution supplies a subject, never procedure or location authority.
 */
export function resolveBundleReference({ text, entities, links, facts, isEligible,
    focusEntityId, returnedFacts = [] } = {}) {
    const request = parseBundleRequest(text);
    if (!request || !entities?.get || !entities?.values || !Array.isArray(links)
        || !Array.isArray(facts) || typeof isEligible !== 'function' || !Array.isArray(returnedFacts)) return null;
    const byId = new Map();
    for (const fact of facts) {
        if (byId.has(fact?.id)) byId.set(fact.id, null);
        else byId.set(fact?.id, fact);
    }
    const proof = edge => edge?.status === 'recorded' && edge.conflict !== true
        && nonempty(edge.id) && links.filter(value => value?.id === edge.id).length === 1
        && Array.isArray(edge.evidenceFactIds) && edge.evidenceFactIds.length > 0
        && new Set(edge.evidenceFactIds).size === edge.evidenceFactIds.length
        && edge.evidenceFactIds.every(id => completeFact(byId.get(id), isEligible));
    const operand = normalize(request.operandText);
    const pronoun = operand === 'them';
    const parts = pronoun ? [] : request.operandText.split(/\s+(?:and|\+)\s+/i);
    if (!pronoun && parts.length < 2) return null;
    const resolutions = [];
    for (const bundle of entities.values()) {
        if (bundle?.declared !== true || bundle.kind !== 'bundle' || pronoun && bundle.id !== focusEntityId) continue;
        const edges = links.filter(edge => edge?.from === bundle.id && edge.relation === 'has-component');
        const memberIds = edges.map(edge => edge.to);
        if (edges.length < 2 || new Set(memberIds).size !== edges.length || !edges.every(proof)) continue;
        const members = memberIds.map(id => entities.get(id));
        if (members.some(member => member?.declared !== true || member.id === bundle.id)) continue;
        const proofIds = new Set(edges.flatMap(edge => edge.evidenceFactIds));
        if (![...proofIds].every(id => groupProof(byId.get(id), bundle, members))) continue;
        if (pronoun) {
            if (!returnedFacts.some(returned => proofIds.has(returned?.id)
                && sameReturnedFact(returned, byId.get(returned.id))
                && completeFact(returned, isEligible) && groupProof(returned, bundle, members))) continue;
        } else {
            const selected = [];
            let antecedent = null, valid = true;
            for (const part of parts) {
                let name = article(normalize(part));
                const possessive = /^its\s+/.test(name);
                if (possessive) name = name.replace(/^its\s+/, '');
                const matches = [...entities.values()].filter(entity => labels(entity).includes(name));
                if (matches.length !== 1 || !memberIds.includes(matches[0].id)) { valid = false; break; }
                const member = matches[0];
                if (possessive) {
                    const uses = links.filter(edge => edge?.from === antecedent && edge.to === member.id && edge.relation === 'uses');
                    if (uses.length !== 1 || !proof(uses[0]) || !uses[0].evidenceFactIds.every(id => {
                        const fact = byId.get(id);
                        const target = binding(fact, member);
                        return fact.entityId === antecedent && target && target.relations.includes('use')
                            && fact.text.split(/[.!?;,]/).map(normalize).some(clause => clause === `uses ${normalize(target.mention)}`
                                || clause === `${normalize(entities.get(antecedent).name)} uses ${normalize(target.mention)}`);
                    })) { valid = false; break; }
                    uses[0].evidenceFactIds.forEach(id => proofIds.add(id));
                } else antecedent = member.id;
                selected.push(member.id);
            }
            if (!valid || selected.length !== memberIds.length || new Set(selected).size !== selected.length
                || !memberIds.every(id => selected.includes(id))) continue;
        }
        resolutions.push({ type: 'bundle-reference', entityId: bundle.id, members: memberIds,
            proofIds: [...proofIds], reference: pronoun ? 'pronoun' : 'explicit', ...request });
    }
    return resolutions.length === 1 ? resolutions[0] : null;
}
