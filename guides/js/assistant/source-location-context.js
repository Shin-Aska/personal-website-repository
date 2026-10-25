import { authorize } from './policy.js';

const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const words = value => String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").match(/[\p{L}\p{N}]+/gu) || [];
const itemKinds = new Set(['item', 'equipment', 'shop-item', 'reagent', 'treasure']);
const empty = () => ({ records: [], supportedTerms: [] });
const localSource = value => value && value.conflict !== true && value.record?.conflict !== true
    && value.source?.review === 'extracted'
    && nonempty(value.source.file) && nonempty(value.source.locator)
    && !/[;*…\r\n]|\.\.\./.test(value.source.locator);
const itemKind = value => itemKinds.has(value?.subjectKind || value?.kind);

/**
 * Retain literal TOPICAL context for an eligible item location/acquisition fact.
 * `fact` is a compiled, complete source fact (text === witness), with a canonical
 * entityId and explicit answerRelations. `entities`, when supplied, is its
 * canonical entity Map; otherwise fact/record must explicitly declare item kind.
 * `sourceRecords` contains complete base records, or direct authorized copies.
 * `isEligible(value, role)` must return true for the fact (role='fact') AND the
 * authorized location record (role='location'), applying the caller's current
 * source/edition restrictions. It must not depend on this helper for eligibility.
 *
 * The caller supplies ONLY topical `contextTerms` (individual literal words),
 * and keeps quantity, current-state, source, edition and requested-predicate
 * restrictions in its normal guards. No term is dropped to make a match work.
 * All terms must occur in fact.text or one unique, separately sourced, same-item
 * location record's complete text; at least one term must need that location.
 * IDs match exactly; titles, aliases, prefix matches and graph neighbors confer
 * no authority. Multiple same-item location records are ambiguous, even if their
 * texts are identical. Unknown or unsupported modifiers fail the whole result.
 *
 * Returns {records, supportedTerms}, with the complete authorized location record
 * and the caller's unchanged literal terms, or two empty arrays. It creates no
 * answer text, containment relation, travel instruction, progression or ordering.
 */
export function sourceLocationContext({ fact, sourceRecords = [], contextTerms = [], entities, isEligible } = {}) {
    if (!fact || !nonempty(fact.entityId) || !nonempty(fact.text) || fact.text !== fact.witness
        || !localSource(fact) || typeof isEligible !== 'function'
        || !Array.isArray(fact.answerRelations)
        || !fact.answerRelations.some(role => role === 'location' || role === 'acquisition')
        || !Array.isArray(sourceRecords) || !Array.isArray(contextTerms) || !contextTerms.length
        || contextTerms.some(term => !nonempty(term) || words(term).length !== 1
            || !/^\p{L}+$/u.test(term.normalize('NFKC')))
        || fact.record?.entityId && fact.record.entityId !== fact.entityId) return empty();
    const entity = entities?.get?.(fact.entityId);
    if (entities !== undefined ? !entity || !itemKind(entity) : !itemKind(fact) && !itemKind(fact.record)) return empty();
    if (isEligible(fact, 'fact') !== true) return empty();

    // Count before filtering for eligibility: an ineligible competing location
    // must not silently turn an ambiguous source set into a unique witness.
    const matches = sourceRecords.filter(record => record?.entityId === fact.entityId && record.relation === 'location');
    if (matches.length !== 1) return empty();
    const original = matches[0];
    if (!nonempty(original.id) || sourceRecords.filter(record => record?.id === original.id).length !== 1
        || [fact.id, fact.recordId, fact.sourceRecordId].includes(original.id)
        || !itemKind(original) || !localSource(original)) return empty();
    const record = original.variants ? authorize(original, 'direct') : original;
    if (!record || record.level !== 'direct' || !nonempty(record.text) || !localSource(record)
        || record.entityId !== fact.entityId || record.relation !== 'location'
        || record.source.file !== fact.source.file || record.source.locator === fact.source.locator
        || isEligible(record, 'location') !== true) return empty();

    const candidateTerms = new Set(words(fact.text)), locationTerms = new Set(words(record.text));
    const terms = contextTerms.map(term => words(term)[0]);
    if (!terms.every(term => candidateTerms.has(term) || locationTerms.has(term))
        || !terms.some(term => !candidateTerms.has(term) && locationTerms.has(term))) return empty();
    return { records: [record], supportedTerms: [...contextTerms] };
}

const actorKinds = new Set(['person', 'companion', 'character', 'npc', 'enemy', 'monster', 'creature', 'bestiary']);
const actorKind = value => actorKinds.has(value?.subjectKind || value?.kind);

/**
 * Retain literal TOPICAL context for a complete actor combat witness using one
 * independently sourced location of that exact canonical actor. The API and
 * return shape mirror sourceLocationContext; the item helper is unchanged.
 *
 * The combat fact must also match its complete, authorized base combat record
 * in sourceRecords, including source file and locator. An objective, excerpt,
 * alias, neighboring entity or location field cannot acquire combat authority.
 * Only a unique same-actor direct location can supply missing literal topic
 * words, and both witnesses must independently pass the caller's eligibility.
 * Count locations before eligibility so hidden/conflicting competitors cannot
 * manufacture uniqueness. Text, titles and graph links never establish actor
 * identity: entityIds must match exactly throughout.
 *
 * As with the item helper, callers supply only topical contextTerms and retain
 * normal predicate, identity, negation, measurement, source, edition and player
 * state guards. This returns the full location record for citation and no new
 * instruction, containment/path relation, quest progression or answer text.
 */
export function sourceActorLocationContext({ fact, sourceRecords = [], contextTerms = [], entities, isEligible } = {}) {
    if (!fact || !nonempty(fact.entityId) || !nonempty(fact.text) || fact.text !== fact.witness
        || !nonempty(fact.sourceRecordId) || fact.facet !== 'combat'
        || !localSource(fact) || typeof isEligible !== 'function'
        || !Array.isArray(fact.answerRelations) || !fact.answerRelations.includes('combat')
        || !Array.isArray(sourceRecords) || !Array.isArray(contextTerms) || !contextTerms.length
        || contextTerms.some(term => !nonempty(term) || words(term).length !== 1
            || !/^\p{L}+$/u.test(term.normalize('NFKC')))
        || fact.record?.entityId && fact.record.entityId !== fact.entityId
        || fact.record?.relation && fact.record.relation !== 'combat') return empty();
    const entity = entities?.get?.(fact.entityId);
    if (entities !== undefined ? !entity || !actorKind(entity) : !actorKind(fact) && !actorKind(fact.record)) return empty();

    // Unlike a focused excerpt, this context join requires the whole original
    // combat witness. A self-consistent shortened text/witness pair is not full.
    const combatMatches = sourceRecords.filter(record => record?.id === fact.sourceRecordId);
    if (combatMatches.length !== 1) return empty();
    const originalCombat = combatMatches[0];
    if (originalCombat.entityId !== fact.entityId || originalCombat.relation !== 'combat'
        || !actorKind(originalCombat) || !localSource(originalCombat)) return empty();
    const combat = originalCombat.variants ? authorize(originalCombat, 'direct') : originalCombat;
    if (!combat || !['gentle', 'balanced', 'direct'].includes(combat.level) || !localSource(combat)
        || combat.entityId !== fact.entityId || combat.relation !== 'combat' || combat.text !== fact.text
        || combat.source.file !== fact.source.file || combat.source.locator !== fact.source.locator
        || isEligible(fact, 'fact') !== true) return empty();

    const matches = sourceRecords.filter(record => record?.entityId === fact.entityId && record.relation === 'location');
    if (matches.length !== 1) return empty();
    const original = matches[0];
    if (!nonempty(original.id) || sourceRecords.filter(record => record?.id === original.id).length !== 1
        || [fact.id, fact.recordId, fact.sourceRecordId].includes(original.id)
        || !actorKind(original) || !localSource(original)) return empty();
    const record = original.variants ? authorize(original, 'direct') : original;
    if (!record || record.level !== 'direct' || !nonempty(record.text) || !localSource(record)
        || record.entityId !== fact.entityId || record.relation !== 'location'
        || record.witness !== undefined && record.text !== record.witness
        || record.source.file !== fact.source.file || record.source.locator === fact.source.locator
        || isEligible(record, 'location') !== true) return empty();

    const combatTerms = new Set(words(fact.text)), locationTerms = new Set(words(record.text));
    const terms = contextTerms.map(term => words(term)[0]);
    if (!terms.every(term => combatTerms.has(term) || locationTerms.has(term))
        || !terms.some(term => !combatTerms.has(term) && locationTerms.has(term))) return empty();
    return { records: [record], supportedTerms: [...contextTerms] };
}
