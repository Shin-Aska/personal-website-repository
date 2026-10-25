// A finite source-method reader. This does not resolve entities, player state,
// source restrictions, editions, or the other parts of a compound question.
const normalize = value => typeof value === 'string' ? value.normalize('NFKC')
    .toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const PERSON_REFERENCE = /^(?:him|her)$/;
const PROCEDURE_REFERENCE = /^(?:it|this|that)$/;
const NON_PROOF = /\b(?:not|never|no|without|cannot|can't|don't|doesn't|isn't|won't|would|could|might|may|maybe|perhaps|if|unless|whether|says?|said|asks?|asked|reports?|reported|claims?|claimed|promises?|promised|plans?|planned|intends?|intended)\b/;
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Read only a method-presence assertion. Both references retain their entire
 * wording, including unrecognized modifiers or clauses; `originalText` is the
 * exact input. Recognition alone is not proof, and never means the action is
 * sufficient, compulsory, completed, or the only possible method.
 */
export function parseMethodAssertion(text) {
    if (typeof text !== 'string') return null;
    const question = text.trim().replace(/\?$/, '').trim();
    const match = /^is\s+(talking|speaking)\s+to\s+(.+?)\s+(?:a\s+)?part\s+of\s+(.+)$/i.exec(question);
    if (!match || !match[2].trim() || !match[3].trim()) return null;
    return Object.freeze({ kind: 'method-presence', action: 'dialogue',
        subjectText: match[2], referenceText: match[3], originalText: text });
}

/**
 * Prove a bounded dialogue recruitment method from a complete literal fact.
 * `subjectLabels` must belong to one known person selected by the caller.
 * `grounded` records conversational source grounding, never observed progress.
 * The caller must additionally check canonical ownership/bindings, eligible
 * sources, the complete original question, and atomic compound handling.
 *
 * The supported source grammar explicitly places the same person's name
 * between "recruit" and "via dialogue". Other names in the fact, direct
 * recruitment, nearby talk instructions, or recruitment/method metadata alone
 * cannot establish the requested action. Return only proof as a boolean;
 * render the full original fact rather than generating a yes or a new step.
 */
export function supportsMethodAssertion(descriptor, { fact, subjectLabels, lastFacet, grounded } = {}) {
    if (!descriptor || grounded !== true || lastFacet !== 'recruitment'
        || !Array.isArray(subjectLabels) || !subjectLabels.length
        || typeof fact?.text !== 'string' || !fact.text.trim() || fact.text !== fact.witness
        || !Array.isArray(fact.answerRelations)
        || !['recruitment', 'method'].every(role => fact.answerRelations.includes(role))) return false;
    const current = parseMethodAssertion(descriptor.originalText);
    if (!current || JSON.stringify(current) !== JSON.stringify(descriptor)) return false;
    const labels = [...new Set(subjectLabels.map(normalize).filter(label => label
        && /^[\p{L}\p{N}][\p{L}\p{N} .:'()-]*$/u.test(label)
        && !/\b(?:him|her|it|this|that|and|or)\b/.test(label)))];
    if (!labels.length) return false;
    const subject = normalize(descriptor.subjectText), reference = normalize(descriptor.referenceText);
    if (!PERSON_REFERENCE.test(subject) && !labels.includes(subject)) return false;
    const explicitRecruitment = /^recruiting\s+(.+)$/.exec(reference)
        || /^(?:the\s+)?recruitment\s+of\s+(.+)$/.exec(reference);
    if (!PROCEDURE_REFERENCE.test(reference)
        && (!explicitRecruitment || !PERSON_REFERENCE.test(explicitRecruitment[1]) && !labels.includes(explicitRecruitment[1]))) return false;
    const source = normalize(fact.text);
    if (NON_PROOF.test(source)) return false;
    return labels.some(label => new RegExp(`(?:^|[.!?;,:]\\s*|\\bor\\s+)(?:you\\s+can\\s+)?recruit\\s+${escape(label)}\\s+via\\s+dialogue(?=$|[\\s.!?;,(])`).test(source));
}
