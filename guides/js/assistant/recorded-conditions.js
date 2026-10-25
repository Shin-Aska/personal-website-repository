// A finite reader for one authored party rule. This never reads or writes
// player state, infers an inverse, or follows a second relationship.
const normalized = value => String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const predicate = value => normalized(value).replace(/_/g, '-');
const PEOPLE = new Set(['npc', 'person', 'character', 'companion']);
const STATE_OR_REPORT = /\b(?:i|me|my|we|our|you|your|he|she|it|they|him|her|them|currently|current|now|today|already|saved|save|reported|report|suppose|supposing|imagine|hypothetically|would|dismiss|dismissed|dismissal)\b/;

function namedActor(label, entities) {
    if (STATE_OR_REPORT.test(label) || /\b(?:and|or|if)\b/.test(label)) return null;
    const matches = [...entities.entries()].filter(([, entity]) =>
        [entity.name, ...(entity.aliases || [])].some(alias => normalized(alias) === label));
    // A shared alias is ambiguous even when only one matching entity is a person.
    return matches.length === 1 && PEOPLE.has(predicate(matches[0][1].kind)) ? matches[0][0] : null;
}

function directEdges(descriptor, links) {
    return links.filter(link => link.from === descriptor.subjectEntityId
        && link.to === descriptor.conditionEntityId && predicate(link.relation) === 'leaves-with');
}

/**
 * Match only complete, explicit named-actor questions about a direct leaves-with
 * edge. Deliberately retain no free text: extra source/edition/time/material
 * qualifiers must go through the caller's normal guards, never be stripped here.
 * Edge existence establishes the request, not whether its proof is usable.
 */
export function matchRecordedCondition({ text, entities, links } = {}) {
    if (!entities?.entries || !Array.isArray(links)) return null;
    const q = normalized(text).replace(/\?$/, '').trim();
    if (STATE_OR_REPORT.test(q)) return null;
    let match = /^what happens to (.+?) if (.+?) leaves$/.exec(q);
    let subject, condition;
    if (match) [, subject, condition] = match;
    else if ((match = /^if (.+?) leaves,? what happens to (.+)$/.exec(q))) [, condition, subject] = match;
    else if ((match = /^does (.+?) leave if (.+?) leaves$/.exec(q))) [, subject, condition] = match;
    else return null;
    const subjectEntityId = namedActor(subject, entities), conditionEntityId = namedActor(condition, entities);
    if (!subjectEntityId || !conditionEntityId || subjectEntityId === conditionEntityId) return null;
    const descriptor = { subjectEntityId, conditionEntityId, relation: 'leaves-with' };
    const edges = directEdges(descriptor, links);
    if (!edges.length || edges.some(edge => typeof edge.id !== 'string' || !edge.id.trim())
        || new Set(edges.map(edge => edge.id)).size !== edges.length) return null;
    return { ...descriptor, edgeIds: edges.map(edge => edge.id) };
}

/**
 * Resolve the whole direct proof or withhold completion. The caller must supply
 * isEligible(fact) with its source, edition, material, number and spoiler guards.
 * Render full original facts only when complete=true; factIds never license an
 * answer from an eligible subset. No answer text or party completion is created.
 */
export function resolveRecordedCondition({ descriptor, entities, links, facts, isEligible } = {}) {
    const result = { complete: false, factIds: [], requiredFactIds: [], edgeIds: [],
        subjectEntityId: descriptor?.subjectEntityId || null,
        conditionEntityId: descriptor?.conditionEntityId || null, relation: 'leaves-with' };
    if (descriptor?.relation !== 'leaves-with' || !entities?.get || !Array.isArray(links) || !Array.isArray(facts)
        || !PEOPLE.has(predicate(entities.get(descriptor.subjectEntityId)?.kind))
        || !PEOPLE.has(predicate(entities.get(descriptor.conditionEntityId)?.kind))
        || descriptor.subjectEntityId === descriptor.conditionEntityId) return result;
    const edges = directEdges(descriptor, links);
    result.edgeIds = edges.map(edge => edge.id);
    result.requiredFactIds = [...new Set(edges.flatMap(edge => Array.isArray(edge.evidenceFactIds) ? edge.evidenceFactIds : []))];
    // Revalidate the descriptor against all matching edges, including disputed
    // ones, so neither stale descriptors nor selected subsets hide missing proof.
    if (!edges.length || !Array.isArray(descriptor.edgeIds) || descriptor.edgeIds.length !== edges.length
        || new Set(result.edgeIds).size !== edges.length || new Set(descriptor.edgeIds).size !== edges.length
        || !result.edgeIds.every(id => typeof id === 'string' && id.trim() && descriptor.edgeIds.includes(id))
        || typeof isEligible !== 'function') return result;
    const byId = new Map(facts.map(fact => [fact.id, fact]));
    const duplicateIds = new Set(facts.filter((fact, index) => facts.findIndex(other => other.id === fact.id) !== index).map(fact => fact.id));
    if (edges.some(edge => !['recorded', 'conditional'].includes(edge.status)
        || !Array.isArray(edge.evidenceFactIds) || !edge.evidenceFactIds.length
        || edge.evidenceFactIds.some(id => !byId.has(id) || duplicateIds.has(id)))) return result;
    // Call eligibility with entire source facts; never substitute a text match,
    // entity cooccurrence, embedding score or a neighboring edge as evidence.
    if (!result.requiredFactIds.map(id => isEligible(byId.get(id))).every(Boolean)) return result;
    return { ...result, complete: true, factIds: [...result.requiredFactIds] };
}
