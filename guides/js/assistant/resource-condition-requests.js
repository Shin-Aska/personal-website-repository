// Bounded resource-condition proof only. Callers authorize the complete source,
// resolve one canonical item, and enforce all original-question restrictions.
const normalize = value => typeof value === 'string' ? value.normalize('NFKC')
    .toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const bare = value => normalize(value).replace(/^(?:the|a|an) /, '');
const reference = /^(?:it|them|this|that|this one|that one|same one|same ones|the same one|the same ones)$/;
const word = value => value.replace(/s$/, '');
const terms = value => normalize(value).match(/[\p{L}\p{N}]+/gu)?.map(word) || [];
const NON_PROOF = /\b(?:not|never|no|without|cannot|can't|doesn't|don't|won't|would|could|might|may|maybe|perhaps|if|unless|whether|unknown|unspecified|says?|said|asks?|asked|report(?:s|ed)?|claim(?:s|ed)?|promise(?:s|d)?|plan(?:s|ned)?|intend(?:s|ed)?)\b/;
const labelOK = value => value && !reference.test(value)
    && /^[\p{L}\p{N}][\p{L}\p{N} .:'()\u2013-]*$/u.test(value)
    && !/\b(?:and|or|only|when|if|currently|now|exactly|edition|source)\b/.test(value);

/**
 * @typedef {{kind:'resource-limit',subjectText:string,action:string,durationText:string,suffixText:string,originalText:string} |
 * {kind:'trigger-contrast',subjectText:string,action:'drain',resourceText:string,triggerText:string,alternativeText:string,originalText:string}} ResourceConditionRequest
 *
 * Preserve the complete subject and every retained suffix/contrast. Recognition
 * is not proof. Unknown subjects, quantities, actions and alternatives cannot be
 * removed merely to fit the supported source grammar.
 * @returns {ResourceConditionRequest|null}
 */
export function parseResourceConditionRequest(question) {
    if (typeof question !== 'string') return null;
    const q = question.trim().replace(/\?$/, '').trim();
    const purchase=/^does buying (.+?) give (infinite charges)(.*)$/i.exec(q);
    if(purchase)return Object.freeze({kind:'purchase-limit',subjectText:purchase[1],action:'buying',
        durationText:purchase[2],suffixText:purchase[3],originalText:question});
    const limit = /^can\s+(?:i|we)\s+(?:just\s+)?keep\s+(firing|shooting|using)\s+(.+?)\s+(forever)(.*)$/i.exec(q);
    if (limit) return Object.freeze({ kind: 'resource-limit', subjectText: limit[2], action: limit[1],
        durationText: limit[3], suffixText: limit[4], originalText: question });
    const contrast = /^does\s+(.+?)\s+drain\s+(.+?)\s+only\s+when\s+(.+?),?\s+or\s+(?:just\s+)?from\s+(.+)$/i.exec(q);
    return contrast ? Object.freeze({ kind: 'trigger-contrast', subjectText: contrast[1], action: 'drain',
        resourceText: contrast[2], triggerText: contrast[3].replace(/,$/, ''), alternativeText: contrast[4], originalText: question }) : null;
}

/**
 * Verify one literal witness for one already-resolved canonical item. Pronouns
 * require `grounded === true`, meaning source-grounded conversational focus,
 * never inventory, experience, combat state or another observed player fact.
 *
 * Bindings must explicitly carry the requested role to `subjectEntityId` when
 * the fact's own subject differs. Labels belong to that same caller-selected
 * entity; aliases can resolve its name but cannot provide source-condition proof.
 * The caller retains edition/source/material/negation/compound restrictions.
 *
 * A true trigger-contrast result authorizes quoting only the complete recorded
 * trigger. It does not prove the word "only", a negative carrying effect, a
 * yes/no conclusion, an amount drained, or any unrecorded alternative trigger.
 */
export function supportsResourceConditionRequest(descriptor, { fact, subjectEntityId, subjectLabels = [], grounded = false } = {}) {
    if (!descriptor || typeof subjectEntityId !== 'string' || !subjectEntityId
        || typeof fact?.text !== 'string' || !fact.text.trim() || fact.text !== fact.witness
        || fact.conflict || fact.source?.review === 'conflicting'
        || !Array.isArray(fact.answerRelations) || !Array.isArray(subjectLabels)) return false;
    const parsed = parseResourceConditionRequest(descriptor.originalText);
    if (!parsed || JSON.stringify(parsed) !== JSON.stringify(descriptor)) return false;
    const labels = [...new Set(subjectLabels.map(bare).filter(labelOK))];
    if (!labels.length) return false;
    const subject = bare(descriptor.subjectText);
    if (reference.test(subject) ? grounded !== true : !labels.includes(subject)) return false;
    const requiredRoles = ['resource-limit','purchase-limit'].includes(descriptor.kind) ? ['limitations'] : ['use', 'outcome', 'limitations'];
    const roles = fact.entityId === subjectEntityId ? fact.answerRelations
        : (fact.bindings || []).filter(binding => binding.entityId === subjectEntityId
            && typeof binding.mention === 'string' && fact.witness.includes(binding.mention)
            && terms(binding.mention).some(term => labels.some(label => terms(label).includes(term))))
            .flatMap(binding => binding.relations || []);
    if (!requiredRoles.some(role => fact.answerRelations.includes(role) && roles.includes(role))) return false;
    const source = normalize(fact.text);
    if (NON_PROOF.test(source)) return false;
    if (['resource-limit','purchase-limit'].includes(descriptor.kind)) {
        if (descriptor.kind==='resource-limit' && (!['firing', 'shooting'].includes(normalize(descriptor.action))
            || normalize(descriptor.durationText) !== 'forever')
            || descriptor.kind==='purchase-limit' && (descriptor.action!=='buying' || normalize(descriptor.durationText)!=='infinite charges')
            || descriptor.suffixText.trim()) return false;
        // Consumption and destruction must occur in the same complete clause.
        // A charge mention, aiming controls or destruction of another item
        // cannot supply the missing half of this condition.
        const proof = /(?:^|[.!?]\s*)one shot (?:spends|uses|consumes) one charge;\s*when (?:a|the) ([\p{L}]+) is (?:empty|depleted), it (?:breaks apart|shatters)(?:[.!?]|$)/u.exec(source);
        if (!proof || !labels.some(label => terms(label).includes(word(proof[1])))) return false;
        return /(?:^|[.!?]\s*)(?:each|every) (?:glowing )?[\p{L}]+ (?:carries|has) (?:its own )?(?:remaining )?charges[.!?]/u.test(source);
    }
    if (descriptor.kind !== 'trigger-contrast' || normalize(descriptor.action) !== 'drain'
        || normalize(descriptor.resourceText) !== 'mana' || !/^(?:i|we) hit$/.test(normalize(descriptor.triggerText))) return false;
    const carrying = /^carrying (.+)$/.exec(normalize(descriptor.alternativeText));
    if (!carrying || !reference.test(bare(carrying[1])) && !labels.includes(bare(carrying[1]))) return false;
    // This is the source's affirmative effect field, not an inferred negative
    // for carrying. Keep its adjacent trigger; "drains mana" alone fails.
    return /(?:^|[.:;!?]\s*)drains mana on hit(?:[.!?]|$)/.test(source);
}
