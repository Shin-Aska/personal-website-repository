import { normalize } from './retrieval.js';

// These bounded forms describe a source question's scope. They never report a
// completed objective, an actual departure, inventory, readiness or save state.
// A descriptor is syntax, not proof: callers must ground the complete place or
// scene and every question restriction in the source before answering.
const DEFERRED_EXIT = /^(?:when|once) (?:i'm|i am|we're|we are) done (?:here|there)$/;
const DEPARTURE = /^before (?:i|we) leave (.+)$/;
const CONDITION = /\b(?:if|when|after|before|once|unless|until|while|because|although|whereas|then|provided|assuming|supposing|suppose|in case|as long as|as soon as|even though)\b/;
const STATE = /\b(?:my|our|current|this) save\b|\b(?:inventory|progress|already|currently|now)\b|\b(?:my|our) party\b/;
const FINITE = /\b(?:i|we|you|he|she|they|it)(?:'m|'re|'ve|'d|'ll|\s)\b|\b(?:is|are|was|were|am|has|have|had|did|does|can|could|should|would|will|must|completed|finished|obtained|acquired|recruited|defeated)\b/;
const ENDING = /\b(?:and|or|but|for|of|to|with|without|in|at|from|about|according|the|a|an)$/;

function phrase(text, question = false) {
    if (typeof text !== 'string') return null;
    const normalized = normalize(text);
    if (!normalized || normalized.length > 512 || (!question && /\?$/.test(normalized))) return null;
    const value = normalized.replace(question ? /[.!?]$/ : /[.!]$/, '').trim();
    if (!value || /[?!;,]|[.!](?:\s|$)/.test(value)) return null;
    return value;
}

// Keep every word of a noun phrase, including unknown adjectives, quantities,
// materials and edition/source restrictions. Never repair a partial match by
// deleting a condition or an unhandled clause.
function complement(text) {
    const value = text.trim();
    if (!value || !/[\p{L}\p{N}]/u.test(value)
        || CONDITION.test(value) || STATE.test(value) || FINITE.test(value)
        || /\b(?:and|or|but|that|which|who|whose|where|here|there)\b/.test(value)
        || ENDING.test(value) || /^(?:the|a|an|ready)$/.test(value)) return null;
    return value;
}

/** Read one complete preamble, without changing or certifying player state. */
export function readSceneTransitionPreamble(text) {
    const value = phrase(text);
    if (!value) return null;
    if (DEFERRED_EXIT.test(value)) return {
        kind: 'deferred-exit', scopeText: value, subjectText: null,
        reference: 'scene', readOnlyReport: false, originalText: text
    };
    const departure = value.match(DEPARTURE);
    if (!departure) return null;
    const place = complement(departure[1]);
    if (!place) return null;
    return { kind: 'departure', scopeText: place, subjectText: place,
        readOnlyReport: false, originalText: text };
}

function routeQuestion(value) {
    const route = value.match(/^how (?:do|can|should) (?:i|we) (?:leave|exit) (.+)$/);
    if (!route) return false;
    // A named destination is mandatory. "Here"/"there" may only reference the
    // source scene. Splitting is exhaustive; no unexamined suffix is discarded.
    const parts = route[1].match(/^(?:from (.+?) )?(?:for|to) (.+?)(?: from (.+))?$/);
    if (!parts || (parts[1] && parts[3])) return false;
    const origin = parts[1] || parts[3];
    return complement(parts[2]) && (!origin || /^(?:here|there)$/.test(origin) || complement(origin))
        ? {destinationText:parts[2],originText:origin || null} : null;
}

function resourceQuestion(value) {
    // Only the explicit resource complement is variable. Its complete spelling
    // still needs a source-backed resource predicate at the grounded location.
    const action = value.match(/^is there (?:anything|something) (?:i|we) can (?:break open|smash|break|open|search|loot) (?:for|to find|to get) (.+)$/);
    if (action) return complement(action[1])?{resourceText:action[1]}:null;
    const find = value.match(/^where (?:can|do) (?:i|we) (?:find|get) (.+)$/);
    if (find) return complement(find[1])?{resourceText:find[1]}:null;
    const locate = value.match(/^where (?:is|are) (.+)$/);
    return locate && complement(locate[1])?{resourceText:locate[1]}:null;
}

/**
 * Syntactic permission for pairing a preamble with one static source question.
 * This boolean is never evidence that the scene, route, destination or resource
 * exists. Callers retain the original question and validate all its modifiers.
 */
export function allowQuestion(descriptor, question) {
    return Boolean(readSceneTransitionQuestion(descriptor,question));
}

// Typed complements let the source router validate entire destination/origin
// names rather than discard an unsupported adjective as question scaffolding.
export function readSceneTransitionQuestion(descriptor, question) {
    if (!descriptor || typeof descriptor !== 'object') return null;
    const original = readSceneTransitionPreamble(descriptor.originalText);
    if (!original || original.kind !== descriptor.kind
        || original.scopeText !== descriptor.scopeText
        || original.subjectText !== descriptor.subjectText
        || original.reference !== descriptor.reference) return null;
    const value = phrase(question, true);
    if (!value || CONDITION.test(value) || STATE.test(value)) return null;
    const combat=/^how (?:do|can|should|must) (?:i|we) (?:deal with|fight|defeat|beat|kill) (.+)$/.exec(value);
    const result=descriptor.kind === 'deferred-exit' ? routeQuestion(value)
        : resourceQuestion(value) || (combat && complement(combat[1])?{combatSubjectText:combat[1]}:null);
    return result?{...result,kind:descriptor.kind,originalText:question}:null;
}
