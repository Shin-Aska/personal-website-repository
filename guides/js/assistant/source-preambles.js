import { normalize } from './retrieval.js';
import {readSceneTransitionPreamble} from './scene-transition-preambles.js';

// Read one complete, bounded English preamble for a source-only conversation.
// This is syntax, never evidence of a location, readiness, inventory or save
// state. The caller must validate the preserved scope against its sources and
// decide whether a topic fragment precedes a real question. Nothing is mutated.
//
// scopeText and subjectText are normalized complements, with every modifier
// retained. originalText is the unchanged input; readOnlyReport marks position
// syntax whose existing report interpretation must remain intact elsewhere.

const POSITION = /^(?:i'm|i am|we're|we are) (?:at|in) (.+)$/;
const DIFFICULTY = /^(?:that|the|this) (.+) is catching me$/;
const TOPIC = /^(?:what|how) about (.+)$/;
const NAMING = /^when people say (.+)$/;

// A complement may contain names, numbers, materials, editions and source
// restrictions, but not a second sentence, an unhandled phase/condition, or a
// finite clause. Deliberately do not strip words such as working or radioactive.
const CLAUSE = /\b(?:if|when|after|before|once|unless|until|while|because|although|whereas|then|provided|assuming|supposing|suppose|in case|as long as|as soon as|even though)\b|\b(?:i|we|you|he|she|they|it)(?:'m|'re|'ve|'d|'ll|\s)\b|\b(?:is|are|was|were|am|has|have|had|did|does|can|could|should|would|will|must|completed|finished|obtained|acquired|recruited|defeated)\b/;
const SAVE = /\b(?:my|our|current|this) save\b|\b(?:my|our) (?:inventory|party|progress)\b/;
const ENDING = /\b(?:and|or|but|for|of|to|with|without|in|at|from|about|the|a|an)$/;

function complement(text) {
    const value = text.trim();
    if (!value || !/[\p{L}\p{N}]/u.test(value)
        || /[?!;,]|[.!](?:\s|$)/.test(value)
        || /^(?:and|or|but|ready(?: for)?|the|a|an)$/.test(value)
        || /\b(?:and|or|but) (?:ready|not|never|already|now|still|currently|just|finally|got|own|lost|beat|complete|finish)\b/.test(value)
        || CLAUSE.test(value) || SAVE.test(value) || ENDING.test(value)) return null;
    return value;
}

/** Return a syntax descriptor for one supported preamble, or null. */
export function readSourcePreamble(text) {
    if (typeof text !== 'string') return null;
    const transition=readSceneTransitionPreamble(text);
    if(transition)return transition;
    const normalized = normalize(text);
    if (!normalized || normalized.length > 512) return null;
    // Question punctuation belongs only to the explicit topic-fragment form.
    const topic = TOPIC.test(normalized);
    if (!topic && /\?$/.test(normalized)) return null;
    const phrase = normalized.replace(topic ? /[.!?]$/ : /[.!]$/, '').trim();
    if(/^(?:a )?(?:new|different|another) (?:(?:travel|combat|magic|training|setup|equipment) )?(?:problem|question|topic|subject)$/.test(phrase))
        return {kind:'topic-switch',scopeText:'',subjectText:null,readOnlyReport:false,originalText:text};
    if(phrase==='once inside')return {kind:'entry',scopeText:'inside',subjectText:null,reference:'entry-destination',readOnlyReport:false,originalText:text};
    const position = phrase.match(POSITION);
    if (position) {
        const parts = position[1].split(' and ready for ');
        if (parts.length > 2) return null;
        const place = complement(parts[0]);
        const task = parts.length === 2 ? complement(parts[1]) : null;
        if (!place || (parts.length === 2 && !task)) return null;
        return { kind: 'position', scopeText: task ? `${place} and ${task}` : place,
            subjectText: task || place, readOnlyReport: true, originalText: text };
    }
    const difficulty = phrase.match(DIFFICULTY);
    if (difficulty) {
        const subject = complement(difficulty[1]);
        if (!subject) return null;
        return { kind: 'difficulty', scopeText: subject, subjectText: subject,
            readOnlyReport: false, originalText: text };
    }
    const fragment = phrase.match(TOPIC);
    if (fragment) {
        const subject = complement(fragment[1]);
        if (!subject) return null;
        return { kind: 'topic', scopeText: subject, subjectText: subject,
            readOnlyReport: false, originalText: text };
    }
    // This complete discourse wrapper introduces a name to be questioned. Its
    // "when" is not a player-state condition; the complement is still subject
    // to the same clause, progress and modifier bounds as every other topic.
    const naming = phrase.match(NAMING);
    if (naming) {
        const subject = complement(naming[1]);
        if (!subject) return null;
        return { kind: 'naming', scopeText: subject, subjectText: subject,
            readOnlyReport: false, originalText: text };
    }
    return null;
}
