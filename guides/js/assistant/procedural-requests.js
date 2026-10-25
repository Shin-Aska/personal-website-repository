// A phase-presence guard, not a subject finder or a general language parser.
// Callers retain responsibility for source, edition, state, material, subject,
// object ownership, modifiers and all parts of a compound question.
const normalize = value => typeof value === 'string' ? value.normalize('NFKC')
    .toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const ROLES = new Set(['method', 'acquisition', 'use', 'destination', 'route']);
const KINDS = new Set(['preparation', 'crafting', 'return', 'delivery', 'transport', 'concealment', 'release']);
const QUESTION = /^how\s+(?:do|can|should|must)\s+(?:i|we)\s+(?:(?:actually|really)\s+)?/i;

function nonCraftingIdiom(action) {
    const text = normalize(action);
    if (/^make\s+(?:sure|certain|(?:my|our|your)\s+way|use\s+of)\b/.test(text)
        || /^(?:make|create)\s+(?:(?:a|an|the)\s+)?(?:way|means|opportunity)\s+to\b/.test(text)
        || /^make\s+(?:money|a\s+profit|a\s+living)(?:$|\s+(?:by|from|with|through|off|via)\b)/.test(text)) return true;
    // A finite causative grammar: "make X work/run ..." asks how to cause
    // operation, rather than how to manufacture X. Preserve all noun/modifier
    // text for genuine make questions; do not strip a trailing verb to match.
    const causative = /^make\s+(.+?)\s+(?:work|run|function|launch|start|stop|perform|behave|respond|load|compile|install|execute)(?:\s+(?:properly|correctly|again|better|faster|slower|well|normally|at\s+all|on|in|with|without|after|before|when|if|for|as)\b.*)?$/.exec(text);
    return !!causative && !/\b(?:of|for|with|in|on|at|a|an|the)$/.test(causative[1]);
}

/**
 * Recognize a bounded family of explicit procedural questions. `originalText`
 * is the exact input. `subjectText` retains the complete object and suffix,
 * removing only the recognized action; it is NOT a canonical entity name. Unknown modifiers,
 * subordinate clauses and compound requests remain in it for the caller to
 * validate. Null means this helper has no grammar for the question, not that
 * the question should be globally rejected.
 */
export function parseProceduralRequest(question) {
    if (typeof question !== 'string') return null;
    const q = question.trim().replace(/[?!.]+$/, '').trim();
    // A participle must end the question or introduce an explicit suffix;
    // "the forged sword" alone is a noun phrase, not a passive procedure.
    // Keep every suffix, including extra clauses, for independent scope checks.
    const passive = /^how\s+(?:is|are|was|were)\s+(.+?)\s+(?:forged|crafted|made|created|constructed)(?=$|\s+(?:in|at|from|with|without|after|before|using|by|for|into|on|and|or|if|when|once|until)\b)(\s+.*)?$/i.exec(q);
    if (passive) return { kind: 'crafting', subjectText: `${passive[1]}${passive[2] || ''}`, originalText: question };
    const head = QUESTION.exec(q);
    if (!head) return null;
    const rest = q.slice(head[0].length);
    if (nonCraftingIdiom(rest)) return null;
    let kind, match;
    if ((match = /^(?:prepare\s+for|get\s+(?:(?:actually|really)\s+)?ready\s+for)\s+(.+)$/i.exec(rest))) kind = 'preparation';
    else if ((match = /^(?:craft|forge|make|create|construct)\s+(.+)$/i.exec(rest))) kind = 'crafting';
    else if ((match = /^use\s+(.+\bforge\b.*)$/i.exec(rest))) kind = 'crafting';
    else if ((match = /^(?:return\s+(?!to\b|from\b|here\b|there\b|back\b)|take\s+back\s+)(.+)$/i.exec(rest))) kind = 'return';
    else if ((match = /^deliver\s+(.+)$/i.exec(rest))) kind = 'delivery';
    else if ((match = /^(?:get|carry|take|bring)\s+(.+\s+past\s+.+)$/i.exec(rest))) kind = 'transport';
    else if ((match = /^(?:hide|stash|store)\s+(.+\s+(?:in|inside)\s+.+)$/i.exec(rest))) kind = 'concealment';
    else if ((match = /^get\s+(.+?)\s+(?:released|freed)$/i.exec(rest))) kind = 'release';
    else if ((match = /^(?:free|release)\s+(.+)$/i.exec(rest))) kind = 'release';
    if (!kind || !match[1].trim()) return null;
    return { kind, subjectText: match[1], originalText: question };
}

// Only affirmative imperative clauses supply procedure evidence. In particular,
// a future intention, reported request, hypothetical or negative sentence does
// not become an instruction merely because an action word occurs inside it.
const NON_INSTRUCTION = /\b(?:not|never|no|without|cannot|can't|don't|doesn't|shouldn't|mustn't|won't|wouldn't|couldn't|unknown|unclear|unspecified|maybe|perhaps|if|unless|whether|promis(?:e[ds]?|ing)|intend(?:s|ed|ing)?|plan(?:s|ned|ning)?|hop(?:e[ds]?|ing)|wish(?:es|ed|ing)?|request(?:s|ed|ing)?)\b/;
const IMPERATIVE_START = /^(?:plead|free|release|hide|stash|store|equip|prepare|bring|pack|stock|mix|craft|forge|make|create|construct|heat|hammer|bind|use|take|return|deliver|cleanse|recover|collect|gather|obtain|place|put|give|find|offer|hand|travel|go|enter|leave|follow|search|explore|visit|open|read|cast|wear|buy|purchase)\b/;
const PREPARATION = /^(?:(?:equip|prepare|pack|stock)\s+(?!to\b|for\b)\S|mix\s+(?!up\b|with\b)\S)/;
const BRING = /^bring\s+(?!to\b|for\b)\S/;
const PREPARATORY_BRING_CONTEXT = /\b(?:required|necessary|needed)\b|\bbefore\s+(?:(?:you|we)\s+)?(?:enter(?:ing)?|explor(?:e|ing)|travel(?:ling|ing)?|leav(?:e|ing)|depart(?:ing)?|descend(?:ing)?|sail(?:ing)?|setting\s+out)\b|\bfor\s+(?:(?:the|a|your|our)\s+)?(?:journey|trip|expedition|exploration|descent)\b/;
const CRAFTING = /^(?:(?:craft|forge|create|construct)\s+(?!is\b|was\b|a\s+(?:distraction|diversion)\b)\S|make\s+(?!sure\b|your\s+way\b|a\s+(?:distraction|diversion)\b|use\b)\S|bind\s+.+\s+(?:to\s+(?:craft|forge|make|create|construct)|into)\s+\S|use\s+.+\bforge\b.+\bto\s+(?:craft|forge|make|create|construct)\s+\S)/;
const RETURN = /^(?:return\s+(?!to\b|from\b|here\b|there\b|back\b)\S|take\s+(?:back\s+\S|.+\s+back\b)|deliver\s+.+\s+back\b)/;
const DELIVERY = /^(?:give|bring|offer|hand|deliver)\s+(?!to\b|over\s+to\b)\S.*\s+to\s+\S/;

function instructionClauses(text) {
    return normalize(text).split(/[.!?;]+/).map(sentence => sentence.trim())
        .filter(sentence => sentence && !NON_INSTRUCTION.test(sentence))
        // A finite temporal preamble from the source does not change the
        // following imperative into a declarative or reported instruction.
        .map(sentence => sentence.replace(/^after\s+(?:looting|collecting|finding|obtaining|entering|leaving)\s+[^,]+,\s*/, ''))
        .filter(sentence => IMPERATIVE_START.test(sentence))
        .flatMap(sentence => [sentence, ...sentence.split(/,\s*(?:then\s+)?|\s+(?:and|then)\s+/)]
            .map(clause => clause.trim()));
}

// This is relation proof only: the router must still ground the complete
// object (including pronouns) against the same fact's reviewed method binding.
// A destination mentioned elsewhere, a pickup instruction, or a general "use"
// binding cannot prove concealed transport. No aliases supply these relations.
function supportsStorageRelation(descriptor, clause) {
    const storage = /^(?:hide|stash|store)\s+(.+?)\s+(in|inside)\s+(.+)$/.exec(clause);
    if (!storage) return false;
    if (descriptor.kind === 'transport') {
        const requested = /\s+past\s+(.+)$/.exec(normalize(descriptor.subjectText));
        const security = /\s+before\s+(?:passing|going\s+past|getting\s+past)\s+(.+)$/.exec(storage[3]);
        return !!requested && !!security && requested[1] === security[1];
    }
    const requested = /\s+(in|inside)\s+(.+)$/.exec(normalize(descriptor.subjectText));
    const destination = storage[3].replace(/\s+before\s+(?:passing|going\s+past|getting\s+past)\s+.+$/, '');
    return !!requested && requested[1] === storage[2] && requested[2] === destination;
}

/**
 * Require one complete literal fact (text === witness), an explicit supported
 * answer role and an affirmative instruction for the requested phase. Aliases,
 * titles, facet labels and other facts cannot supply the action. This guard
 * does not prove the subject or any retained question modifier, prerequisites,
 * ordering, or completion state. Those remain independent caller checks.
 *
 * Grammar is intentionally conservative: reported speech, declarative recipes,
 * passive instructions and intransitive travel returns are not phase proof.
 * Bare "bring" instructions are ambiguous between preparation and delivery:
 * they need an explicit prerequisite/journey/before-entry cue. A bring-to/back
 * instruction is excluded conservatively even when it also names such a cue.
 * Delivery is separate from return: giving/bringing/offering/handing an item to
 * a recipient proves delivery, without establishing that it is being returned.
 * Transport/concealment additionally require an explicit method role and a
 * literal hide/stash/store instruction with the requested security relation or
 * exact destination. Their object grounding remains the caller's obligation.
 */
export function supportsProceduralRequest(descriptor, fact) {
    if (!descriptor || !KINDS.has(descriptor.kind) || !fact
        || typeof fact.text !== 'string' || !fact.text.trim() || fact.text !== fact.witness
        || !Array.isArray(fact.answerRelations) || !fact.answerRelations.some(role => ROLES.has(role))) return false;
    if (['transport', 'concealment'].includes(descriptor.kind))
        return fact.answerRelations.includes('method') && instructionClauses(fact.text).some(clause => supportsStorageRelation(descriptor, clause));
    if(descriptor.kind==='release')return fact.answerRelations.includes('method') && instructionClauses(fact.text)
        .some(clause=>/^plead .+ case .+ for (?:his |her |their |the )?release$/.test(clause)
            || /^(?:free|release) .+ (?:via|by|using|with) .+$/.test(clause));
    const phase = { preparation: PREPARATION, crafting: CRAFTING, return: RETURN, delivery: DELIVERY }[descriptor.kind];
    return instructionClauses(fact.text).some(clause => phase.test(clause)
        || descriptor.kind === 'preparation' && BRING.test(clause)
            && !/\b(?:to|back)\b/.test(clause) && PREPARATORY_BRING_CONTEXT.test(clause));
}
