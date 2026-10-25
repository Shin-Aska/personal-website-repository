// A finite source-description reference, never a computed ranking or new alias.
const nonempty = value => typeof value === 'string' && Boolean(value.trim());
const normalize = value => typeof value === 'string' ? value.normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const withoutArticle = value => normalize(value).replace(/^(?:the|a|an)\s+/, '');
const personKinds = new Set(['person', 'npc', 'companion', 'character']);
const NON_PROOF = /\b(?:not|never|no|without|cannot|can't|don't|doesn't|isn't|won't|would|could|might|may|maybe|perhaps|if|unless|whether|unknown|unspecified|unclear|unconfirmed|says?|said|claims?|claimed|reportedly|supposedly|allegedly|according to)\b/;

/**
 * One atomic WHO + reach-difficulty request. Preserve the complete trait and
 * every extra suffix; parsing recognizes a question, never a true description.
 * "I mean/meant" corrects a referent. The exact optional "for later" phrase is
 * user planning intent only and establishes no timing, availability or state.
 */
export function parseDescriptiveReferenceRequest(text) {
    if (!nonempty(text)) return null;
    const question = text.trim().replace(/\?$/, '').trim();
    const match = /^(?:(i mean(?:t)?)\s+)?(.+?)\s*:\s*who is (it|he|she|that person),?\s+and\s+what makes reaching (him|her|them) difficult\b(.*)$/i.exec(question);
    if (!match || !/\b(?:strongest|most powerful)\b/i.test(match[2])) return null;
    const planning = /\s+(for later)$/i.exec(match[2]);
    const traitText = (planning ? match[2].slice(0, planning.index) : match[2]).trim();
    if (!traitText) return null;
    return Object.freeze({ kind: 'descriptive-person-reach', traitText,
        correctionText: match[1] || '', planningText: planning?.[1] || '',
        identityReference: match[3], reachReference: match[4], suffixText: match[5],
        fields: Object.freeze(['identity', 'reach-difficulty']), originalText: text });
}

/**
 * Boolean proof only. `fact` must be the caller's complete authorized witness;
 * `subjectEntityId`, labels and kind must come from its canonical person entity.
 * `isEligible(fact)` must independently enforce current source, edition and
 * other restrictions. The caller resolves a UNIQUE matching person and renders
 * the entire original fact. This helper creates no ranking, exclusivity claim,
 * generated explanation, alias, progression rule or saved-state assertion.
 *
 * The literal owned source description must directly join the entire requested
 * trait to difficulty reaching that same person and a stated location. Alias
 * co-occurrence, separate facts, uncertainty, reporting and denied traits are
 * insufficient. Unknown quantities/qualifiers remain in traitText/suffixText
 * and cannot disappear into a partial answer.
 */
export function supportsDescriptiveReferenceRequest(request,
    { fact, subjectEntityId, subjectLabels, subjectKind, isEligible } = {}) {
    if (!request || typeof isEligible !== 'function' || !nonempty(subjectEntityId)
        || !personKinds.has(subjectKind) || !Array.isArray(subjectLabels)
        || !nonempty(fact?.id) || fact.entityId !== subjectEntityId
        || fact.record?.entityId && fact.record.entityId !== subjectEntityId
        || !nonempty(fact.text) || fact.text !== fact.witness
        || fact.conflict === true || fact.record?.conflict === true
        || !Array.isArray(fact.answerRelations)
        || !['identity', 'explanation'].every(role => fact.answerRelations.includes(role))
        || fact.source?.review !== 'extracted' || !nonempty(fact.source.file) || !nonempty(fact.source.locator)
        || /[;*…\r\n]|\.\.\./.test(fact.source.locator)) return false;
    const parsed = parseDescriptiveReferenceRequest(request.originalText);
    if (!parsed || JSON.stringify(parsed) !== JSON.stringify(request) || parsed.suffixText.trim()) return false;
    if (normalize(parsed.identityReference) === 'he' && normalize(parsed.reachReference) === 'her'
        || normalize(parsed.identityReference) === 'she' && normalize(parsed.reachReference) === 'him') return false;
    const labels = [...new Set(subjectLabels.filter(nonempty).map(withoutArticle))];
    // The canonical subject itself must own the fact; an alias alone cannot
    // turn another actor's passage into this person's descriptive identity.
    if (!labels.length || !labels.includes(withoutArticle(fact.subject)) || isEligible(fact) !== true) return false;
    const trait = withoutArticle(parsed.traitText);
    if (!/^(?:strongest|most powerful) [\p{L}][\p{L} '-]*$/u.test(trait) || NON_PROOF.test(trait)) return false;
    const proof = normalize(fact.text);
    if (NON_PROOF.test(proof)) return false;
    const owners = labels.filter(label => /^[\p{L}][\p{L} .:'()&-]*$/u.test(label)).map(escape);
    if (!owners.length) return false;
    const person = `(?:he|she|they|${owners.join('|')})`;
    // The optional leading class fragment is how source-owned companion notes
    // are authored. Otherwise only this exact canonical person's explicit
    // attribution, or its singular personal pronoun, may introduce the trait.
    const classText = trait.replace(/^(?:strongest|most powerful) /, '').replace(/ in the game$/, '');
    const start = `(?:(?:${escape(classText)}\\. )?(?:the )?|(?:${owners.join('|')}|he|she) is (?:the )?|they are (?:the )?)`;
    const pattern = new RegExp(`^${start}${escape(trait)}(?: in the game)?, but ${person} (?:is|are) (?:difficult|hard) to reach, (?:located|found) (?:on|in|at) [\\p{L}][^.!?;]+[.!]?$`, 'u');
    return pattern.test(proof);
}
