// A bounded request reader, not a player-state interpreter. Keep the original
// scope intact: the caller must run its normal source/edition/material guards.
const normalize = value => String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const UNSAFE = /\b(?:currently|now|today|already|saved|save|reported|report|apparently|suppose|supposing|imagine|hypothetically|would|could|my|our|not|never)\b|\b(?:don't|doesn't|isn't|haven't|hasn't|can't|won't)\b/;
const PRONOUN = /^(?:it|this|that|they|them|he|she|him|her|you|me)$/;

function namedSubject(reference, entities, focus) {
    if (!entities?.entries || !entities?.get) return null;
    const label = normalize(reference);
    if (label === 'it') {
        const entity = focus?.grounded === true && focus.ambiguous !== true && entities.get(focus.entityId);
        // Grounded means conversational source focus, never observed login.
        if (!entity?.name || !focus.entityId) return null;
        if (uniqueAlias(normalize(entity.name), entities) !== focus.entityId) return null;
        return { subjectEntityId: focus.entityId, subjectLabel: entity.name, subjectReference: reference };
    }
    if (PRONOUN.test(label) || UNSAFE.test(label)) return null;
    const id = uniqueAlias(label, entities), entity = entities.get(id);
    return entity?.name ? { subjectEntityId: id, subjectLabel: entity.name, subjectReference: reference } : null;
}

function uniqueAlias(label, entities) {
    const matches = [...entities.entries()].filter(([, entity]) =>
        [entity.name, ...(entity.aliases || [])].some(alias => normalize(alias) === label));
    return matches.length === 1 ? matches[0][0] : null;
}

/**
 * Read complete choice/phase questions only. A choice is not completion of an
 * event. Literal "it" requires caller-provided grounded conversational focus;
 * all other subjects must be exact, unique current entity names/aliases.
 */
export function matchStaticPropertyCondition({ text, entities, focus } = {}) {
    if (typeof text !== 'string' || UNSAFE.test(normalize(text))) return null;
    const q = text.trim().replace(/[’‘]/g, "'").replace(/\bI've\b/gi, 'I have').replace(/\s+/g, ' ');
    let match = /^if I (choose|use|pick) (.+?), (.+?)(?:\?)?$/i.exec(q);
    let kind, reference, questionText, condition, phase = null;
    if (match) {
        kind = 'choice'; condition = normalize(match[1]); reference = match[2]; questionText = match[3];
        if (PRONOUN.test(normalize(reference))) return null;
    } else {
        match = /^once I have logged into (.+?), (.+?)(?:\?)?$/i.exec(q);
        if (!match) return null;
        kind = 'phase'; reference = match[1]; questionText = match[2]; condition = 'logged-in'; phase = 'after-login';
    }
    const subject = namedSubject(reference, entities, focus);
    if (!subject) return null;
    let property, requirementLabel = null;
    const installation = /^(?:do I (?:have to|need to)|must I) install (.+?) separately(?: first)?$/i.exec(questionText);
    const connectivity = /^(?:do I (?:have to|need to)|must I) (?:stay|remain) connected to (?:the )?internet during (?:matches|play|gameplay)$/i.test(questionText);
    if (kind === 'choice' && installation) {
        requirementLabel = installation[1];
        // These introduce additional clauses, conditions, or source restrictions.
        // Never shorten them to a convenient installation target.
        if (!/^[\p{L}\p{N}][\p{L}\p{N} .:'()-]*$/u.test(requirementLabel)
            || /\b(?:and|or|if|with|without|in|from|before|after|only|except|unless|not)\b/i.test(requirementLabel)) return null;
        property = 'separate-installation';
    } else if (connectivity) property = 'internet-during-play';
    else return null;
    return Object.freeze({ kind, ...subject, condition, phase, property, requirementLabel,
        questionText, originalScope: text });
}

/**
 * All-or-none proof adapter. The caller explicitly supplies the entire required
 * fact set and proves({descriptor, facts}) -> {condition:true, property:true}.
 * For a phase this must witness BOTH the recorded phase and its property, for
 * this same subject. It must not infer that the player completed that phase.
 * No answer text or state is created. Always render original full source facts.
 */
export function resolveStaticPropertyCondition({ descriptor, entities, focus, facts, requiredFactIds,
    isEligible, proves } = {}) {
    const result = { complete: false, factIds: [], requiredFactIds: [] };
    const current = matchStaticPropertyCondition({ text: descriptor?.originalScope, entities, focus });
    if (!current || JSON.stringify(current) !== JSON.stringify(descriptor)
        || !Array.isArray(facts) || !Array.isArray(requiredFactIds) || !requiredFactIds.length
        || requiredFactIds.some(id => typeof id !== 'string' || !id.trim())
        || new Set(requiredFactIds).size !== requiredFactIds.length
        || typeof isEligible !== 'function' || typeof proves !== 'function') return result;
    result.requiredFactIds = [...requiredFactIds];
    const selected = requiredFactIds.map(id => facts.filter(fact => fact.id === id));
    if (selected.some(matches => matches.length !== 1 || matches[0].entityId !== current.subjectEntityId)) return result;
    const witnesses = selected.map(matches => matches[0]);
    if (!witnesses.map(fact => isEligible(fact, current)).every(Boolean)) return result;
    const proof = proves({ descriptor: current, facts: witnesses });
    if (proof?.condition !== true || proof?.property !== true) return result;
    return { ...result, complete: true, factIds: [...requiredFactIds] };
}
