// Finite factual-property grammar and literal capability checks. This module
// never resolves a subject, ranks options, infers a comparison, or writes prose.
const normalize = value => typeof value === 'string' ? value.normalize('NFKC')
    .toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const withoutArticle = value => normalize(value).replace(/^(?:the|a|an)\s+/, '');
const REFERENCE = /^(?:it|they|this|that|(?:this|that) (?:attack|swing|move|tool|runtime))$/;
const NON_FACTUAL = /\b(?:best|better|worst|worse|should|recommend me|recommend to me|would you recommend|guarantee\w*|certainly|definitely|my save|current save|already|have i|did i|will i|if|unless|assuming)\b/;
const NON_PROOF = /\b(?:not|never|no|without|cannot|can't|don't|doesn't|isn't|won't|would|could|might|may|maybe|perhaps|if|unless|whether|unknown|unspecified|unclear|unconfirmed|says?|said|claims?|claimed)\b/;

/**
 * Preserve every subject and complement, including unknown editions, amounts,
 * materials and extra clauses. Parsing recognizes a request, never its truth.
 * Callers must ground the complete phrases, not just a known name inside them.
 */
export function parseFactualPropertyRequest(text) {
    if (typeof text !== 'string' || NON_FACTUAL.test(normalize(text))) return null;
    const question = text.trim().replace(/\?$/, '').trim();
    const category=/^(?:do|does)\s+(.+?)\s+mean\s+(.+)$/i.exec(question);
    if(category)return Object.freeze({kind:'category-assertion',subjectText:category[1],propertyText:category[2],originalText:text});
    let match = /^what makes\s+(.+?)\s+different from\s+(.+)$/i.exec(question);
    if (match) return Object.freeze({ kind: 'profile-comparison', subjectText: match[1], referenceText: match[2], originalText: text });
    match = /^are\s+(.+?)\s+and\s+(.+?)\s+used for\s+(.+)$/i.exec(question);
    if (match) return Object.freeze({ kind: 'use-comparison', subjectText: match[1], referenceText: match[2], propertyText: match[3], originalText: text });
    match = /^does\s+(.+?)\s+use\s+(?:the\s+)?same\s+(.+?)\s+as\s+(.+)$/i.exec(question);
    if (match) return Object.freeze({ kind: 'shared-property', subjectText: match[1], propertyText: match[2], referenceText: match[3], originalText: text });
    match = /^does\s+(.+?)\s+(catch|hit)\s+(.+)$/i.exec(question);
    return match ? Object.freeze({ kind: 'attack-property', subjectText: match[1], action: match[2].toLowerCase(), propertyText: match[3], originalText: text }) : null;
}

const validLabels = values => Array.isArray(values) ? [...new Set(values.map(withoutArticle).filter(label => label
    && /^[\p{L}\p{N}][\p{L}\p{N} .:'()&-]*$/u.test(label)
    && !REFERENCE.test(label)))].sort((a, b) => b.length - a.length) : [];
const matchesSubject = (text, labels, grounded) => labels.includes(withoutArticle(text))
    || grounded === true && REFERENCE.test(normalize(text));
const literalFact = fact => typeof fact?.text === 'string' && Boolean(fact.text.trim()) && fact.text === fact.witness
    && !fact.conflict && Array.isArray(fact.answerRelations);
const hasRoles = (fact, roles) => roles.every(role => fact.answerRelations.includes(role));
const ownedBy = (fact, labels) => [fact.subject, ...(fact.aliases || [])].some(name => labels.includes(withoutArticle(name)));
const factId = fact => String(fact.id || '').replace(/^.*:knowledge:/, '');
const comparisonLink = (from, to) => Array.isArray(from.support?.comparison)
    && from.support.comparison.some(id => id === to.id || id === factId(to));

function profilePair(facts, subjects, references) {
    if (facts.length !== 2 || !facts.every(fact => hasRoles(fact, ['combat', 'use', 'method'])
        && !NON_PROOF.test(normalize(fact.text)))) return false;
    const primary = facts.find(fact => ownedBy(fact, subjects));
    const secondary = facts.find(fact => fact !== primary && ownedBy(fact, references));
    if (!primary || !secondary || primary.entityId && primary.entityId === secondary.entityId
        || !comparisonLink(primary, secondary) || !comparisonLink(secondary, primary)) return false;
    // Both full reviewed attack profiles are returned. The authored comparison
    // links and literal comparative wording permit juxtaposition, not a newly
    // computed damage/range/ranking claim.
    const profile = fact => /\b(?:strike|cut|swing|attack)\b/.test(normalize(fact.text))
        && /\b(?:click|release)\b/.test(normalize(fact.text))
        && /\b(?:direction|front|left|right|behind|360-degree)\b/.test(normalize(fact.text));
    return profile(primary) && profile(secondary)
        && facts.some(fact => /\b(?:stronger|most powerful)\b/.test(normalize(fact.text)));
}

function explicitUses(fact, subjects, references) {
    if (!hasRoles(fact, ['use', 'explanation']) || NON_PROOF.test(normalize(fact.text))) return false;
    // A literal contrast clause binds both requested names to their uses. Mere
    // co-occurrence, two disconnected facts, and metadata cannot establish it.
    return subjects.some(subject => references.some(reference => subject !== reference
        && new RegExp(`(?:^|[.!?]\\s+)${escape(subject)}\\s+(?:are|is) used (?:at|for|to|in) [^.!?;]+,? while ${escape(reference)}\\s+(?:unlock(?:s)?|(?:are|is) used (?:at|for|to|in)) [^.!?;]+[.!?]?$`).test(normalize(fact.text))));
}

function explicitRuntimeContrast(fact, propertyText, subjects, references) {
    if (!hasRoles(fact, ['prerequisites', 'version']) || !ownedBy(fact, subjects)) return false;
    const property = withoutArticle(propertyText);
    if (!/^java \d+(?: lts)? recommendation$/.test(property)) return false;
    return subjects.some(subject => references.some(reference => subject !== reference && (() => {
        const source = normalize(fact.text);
        const pattern = new RegExp(`^(?:outside research: )?${escape(subject)}'s reviewed readme requires (?:a )?(?:(\\d+)-bit )?(?:jdk|java) (\\d+)(?: lts)? at runtime because [^.!?;]+\\. do not substitute (?:the guide's )?${escape(reference)} ${escape(property)}\\.$`);
        const match = pattern.exec(source);
        if (!match) return false;
        const requirement = source.split('. do not substitute ')[0];
        return !NON_PROOF.test(requirement) && match[2] !== /\d+/.exec(property)?.[0];
    })()));
}

function explicitRearCoverage(fact, request) {
    if (!hasRoles(fact, ['combat', 'use']) || !['catch', 'hit'].includes(request.action)
        || !/^(?:enemies|monsters) behind (?:me|us)(?: too| also)?$/.test(normalize(request.propertyText))
        || NON_PROOF.test(normalize(fact.text))) return false;
    return /(?:^|[.!?]\s+)[^.!?;]*\ba complete 360-degree (?:cut|swing|attack) that (?:also )?(?:catches|hits) (?:enemies|monsters) behind (?:the )?[\p{L}][\p{L} '-]*\./u.test(normalize(fact.text));
}

/**
 * Boolean proof only; callers display complete original fact text. Facts must
 * already be source-authorized, edition/source eligible, and bound to the
 * caller's canonical subjects. subjectLabels/referenceLabels must come from
 * those separate known entities. Only a grounded active subject permits a
 * deictic subject. Unknown modifiers remain constraints and fail closed here.
 * The caller still checks all inherited restrictions and compound questions.
 */
export function supportsFactualPropertyRequest(request, { facts, subjectLabels, referenceLabels, grounded } = {}) {
    if (!request || !Array.isArray(facts) || !facts.length || !facts.every(literalFact)) return false;
    const parsed = parseFactualPropertyRequest(request.originalText);
    if (!parsed || JSON.stringify(parsed) !== JSON.stringify(request)) return false;
    const subjects = validLabels(subjectLabels), references = validLabels(referenceLabels);
    if (!subjects.length || !matchesSubject(request.subjectText, subjects, grounded)) return false;
    if(request.kind==='category-assertion'){
        if(facts.length!==1 || !hasRoles(facts[0],['identity','explanation']) || !ownedBy(facts[0],subjects))return false;
        const category=value=>withoutArticle(value).replace(/^ready-made\b/,'prepackaged').replace(/ opponent client$/,' opponent')
            .replace(/^free, open-source /,'').replace(/[.!]$/,'');
        const types=[...normalize(facts[0].text).matchAll(/\b(?:is|not) (?:a|an) (.+?)(?= for |, not |[.!;]|$)/g)].map(match=>category(match[1]));
        return types.includes(category(request.propertyText));
    }
    if (request.kind === 'attack-property') return facts.length === 1 && ownedBy(facts[0], subjects) && explicitRearCoverage(facts[0], request);
    if (!references.length || !matchesSubject(request.referenceText, references, false)) return false;
    if (request.kind === 'profile-comparison') return profilePair(facts, subjects, references);
    if (facts.length !== 1) return false;
    if (request.kind === 'use-comparison') return normalize(request.propertyText) === 'the same thing'
        && explicitUses(facts[0], subjects, references);
    return request.kind === 'shared-property' && explicitRuntimeContrast(facts[0], request.propertyText, subjects, references);
}
