// Shared dialogue state. The injected classifier predicts relationships only;
// the source engine remains responsible for facts, progress, choices and actions.
import { authorize, level, LEVELS } from './policy.js';
import { normalize, resolveEntities, tokens, kindGroup, closeSpelling, isCommonWord } from './retrieval.js';
import { parse, materialTerms, detectMethod, GUIDE_SOURCE, MAX_PARTS, sourceQuestionParts, playerStateQuestion } from './language.js';
import { augmentSourceRecords, presentSourceReply, sourceFacetReply, presentKnowledgeDefinition } from './source-responses.js';
import { createConsultation } from './consultation.js';
import { createKnowledgeRouter } from './knowledge.js';
import {parseFactualPropertyRequest} from './factual-property-requests.js';
import {parseSoftwareCapabilityRequest} from './software-capabilities.js';
import {parseResourceConditionRequest} from './resource-condition-requests.js';
import {parseSequenceFieldRequest} from './sequence-field-requests.js';
import {parseDescriptiveReferenceRequest} from './descriptive-reference-requests.js';
import {parseQuestionSourceAttribution} from './question-source-attribution.js';
import {parseNamedSourceFieldRequest} from './named-source-fields.js';

const wholeSourceRequest=text=>{
    const software=parseSoftwareCapabilityRequest(text);
    return (software?.kind==='software-field' && software.fieldText==='purpose'?null:software) || parseResourceConditionRequest(text)
    || parseSequenceFieldRequest(text) || parseDescriptiveReferenceRequest(text) || parseQuestionSourceAttribution(text) || parseNamedSourceFieldRequest(text);
};

const GAME_NAMES = {
    albion: '(?:albion)', ultima5: '(?:ultima v|ultima 5)', ultima6: '(?:ultima vi|ultima 6)',
    ultima7: '(?:ultima vii|ultima 7)', alqadim: "(?:al-qadim|al qadim|the genie's curse)",
    starcraft: '(?:starcraft brood war|starcraft)'
};
function untilAborted(work, signal) {
    if (!signal) return Promise.resolve(work);
    return new Promise((resolve, reject) => {
        const aborted = () => { signal.removeEventListener('abort', aborted); reject(new DOMException('Question canceled.', 'AbortError')); };
        if (signal.aborted) { aborted(); return; }
        signal.addEventListener('abort', aborted, { once: true });
        Promise.resolve(work).then(value => { signal.removeEventListener('abort', aborted); resolve(value); }, error => { signal.removeEventListener('abort', aborted); reject(error); });
    });
}

const SUPPORTED = new Set(['identity', 'location', 'use', 'acquisition', 'stats', 'combat', 'prerequisites', 'hint', 'why', 'comparison', 'overview']);
const aliasIntent = label => label === 'explanation' ? 'identity' : label;
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const templates = {
    location: title => `Where is ${title}?`,
    use: title => `What does ${title} do?`,
    acquisition: title => `How do I get ${title}?`,
    stats: title => `What are ${title} stats?`,
    combat: title => `How do I fight ${title}?`,
    prerequisites: title => `What are the requirements for ${title}?`,
    hint: title => `How do I complete ${title}?`
};
// These are rewrite eligibility checks, not an alternative intent classifier.
// A model-selected intent must fit an explicitly lossless simple request shape.
// Broader paraphrases remain available to the unchanged original-text engine.
const shapes = {
    identity: /^(?:(?:who|what)(?: is| are|'s)|tell me about|describe|explain) (?:the |a |an )?SUBJECT$|^(?:(?:identify|define) (?:the |a |an )?SUBJECT(?: for me)?|SUBJECT)$|^who (?:created|made|developed|authored) (?:the )?SUBJECT$/,
    location: /^(?:where(?: is| are|'s)?|where (?:can|do) i find|where can i locate|(?:i am |i'm )?(?:looking|searching) for|find|locate|point me (?:towards?|to|in the direction of)) (?:the )?SUBJECT(?: kept| listed| located)?$|^(?:the )?SUBJECT(?: location| whereabouts)$/,
    use: /^(?:what (?:does|do|can) (?:the )?SUBJECT do|how (?:does|do) (?:the )?SUBJECT work|how (?:is|can) (?:the )?SUBJECT (?:be )?used|how (?:do|can) i (?:use|install|configure|set up) (?:the )?SUBJECT|what (?:is|are) (?:the )?SUBJECT (?:for|used for|good for)|(?:use|effect|effects|purpose) (?:of |for )?(?:the )?SUBJECT|(?:the )?SUBJECT(?:'s)? (?:use|effect|effects|purpose))$/,
    acquisition: /^(?:(?:(?:how|where) (?:do|can) i|how to) (?:get|obtain|acquire|download|buy|purchase|recruit|hire)|(?:get|obtain|acquire|download|buy|purchase|recruit|hire)) (?:the |a |an )?SUBJECT$|^(?:(?:download|buy|purchase|recruit|hire) )?(?:link|url|address) (?:for|of|to) (?:the )?SUBJECT$|^how (?:can|is) SUBJECT (?:be )?(?:obtained|acquired|gotten)$|^(?:get|obtain|acquire) SUBJECT how$/,
    stats: /^(?:what (?:is|are) (?:the )?(?:stats|statistics|attributes) (?:of|for) (?:the )?SUBJECT|what (?:is|are) (?:the )?SUBJECT(?:'s)? (?:stats|statistics|attributes)|(?:the )?SUBJECT(?:'s)? (?:stats|statistics|attributes)|(?:stats|statistics|attributes) (?:of |for )?(?:the )?SUBJECT)$/,
    combat: /^(?:(?:how (?:do|can) i|how to) (?:fight|defeat|beat|kill)|(?:fight|defeat|beat)) (?:the )?SUBJECT$|^(?:the )?SUBJECT(?:'s)? (?:weakness|weaknesses)$/,
    prerequisites: /^(?:what do i need before|what (?:is|are) (?:the )?(?:prerequisites|requirements) (?:for|of)|(?:prerequisites|requirements) (?:for|of)) (?:the )?SUBJECT$/,
    hint: /^(?:(?:how (?:do|can) i|how to) (?:complete|finish|solve)|(?:a )?hint (?:for|about)|help (?:with|on)) (?:the )?SUBJECT$/
};

// Relation fragments are eligible to bind a current subject only after the
// learned classifier supplies the relationship. These grammars validate that
// binding loses no new subject, modifier, or restriction; they never pick a label.
const FRAGMENT_WORDS = Object.fromEntries(Object.entries({
    identity: 'identity description job occupation profession role',
    location: 'location whereabouts coordinate coordinates address',
    use: 'use uses usage effect effects purpose function installation install installing setup instructions procedure',
    acquisition: 'acquisition download downloading buy buying purchase recruit hire link url address website',
    stats: 'stats stat statistics attributes numbers scores score values value line numeric numerical strength dexterity intelligence combat base starting initial',
    combat: 'weakness weaknesses tactics strategy combat',
    prerequisites: 'prerequisite prerequisites requirement requirements',
    hint: 'hint hints clue clues step steps next walkthrough guidance'
}).map(([intent, words]) => [intent, new Set(words.split(' '))]));
const FRAGMENT_FILL = new Set('the a an his her its their listed recorded stated available please of for in this that these those spell spells item items person character companion sword weapon map'.split(' '));
function fragmentMatches(text, intent) {
    const vocabulary = FRAGMENT_WORDS[intent], words = tokens(text);
    if (intent === 'prerequisites' && words.at(-1) === 'first') words.pop();
    return vocabulary && words.length > 0 && words.length <= 8 && words.some(word => vocabulary.has(word))
        && words.every(word => vocabulary.has(word) || FRAGMENT_FILL.has(word));
}
function fragmentSubjectAllowed(text, record, list) {
    const group = kindGroup(record.subjectKind || record.kind);
    if (/\bspell\b/.test(text) && group !== 'spell') return false;
    if (/\b(?:person|character|companion)\b/.test(text) && group !== 'person') return false;
    if (/\bitem\b/.test(text) && group !== 'item') return false;
    if (/\b(?:sword|weapon)\b/.test(text) && !list.some(candidate => candidate.entityId === record.entityId
        && /\b(?:sword|weapon|scimitar|blade|axe|bow|dagger|sling)\b/i.test(`${candidate.title} ${candidate.text}`))) return false;
    return true;
}
const EXACT_RELATIONS = { identity: 'identity', location: 'location', whereabouts: 'location', use: 'use', effects: 'use',
    installation: 'use', setup: 'use', download: 'acquisition', acquisition: 'acquisition', stats: 'stats', attributes: 'stats',
    weaknesses: 'combat', prerequisites: 'prerequisites', requirements: 'prerequisites', hint: 'hint' };
const bareFragment = core => normalize(core).replace(/^(?:and|also|then)\s+/, '').replace(/[?!.]+$/, '');
const sourceNeutralCore = core => bareFragment(core).replace(new RegExp(GUIDE_SOURCE.source, 'gu'), ' ').replace(/^[, :]+|[, :]+$/g, '').replace(/\s+/g, ' ').trim();
const subjectSelection = text => String(text).match(/^\s*(?:switch|change)(?: (?:the )?(?:subject|topic))? to\s+(.+?)\s*[:;]\s*(\S[\s\S]*)$/i);
function topicRequest(text, gameId) {
    const game = GAME_NAMES[gameId];
    return String(text).match(new RegExp(`^\\s*(?:(?:new|different|another) (?:topic|subject)|change (?:topics?|subjects?)|switch (?:topics?|subjects?))(?: in ${game})?\\s*[:,-]\\s*(\\S[\\s\\S]*)$`, 'i'))?.[1] || null;
}
function requestFraming(text, gameId) {
    let q = normalize(text).replace(/[?!.]+$/, '');
    const currentGame = GAME_NAMES[gameId];
    q = q.replace(new RegExp(`\\s+in (?:(?:this|the current) (?:game|adventure)|${currentGame})$`), '');
    q = q.replace(/^(?:now|then|okay|ok|so)[,:]?\s+(?=define|identify|explain|describe|tell|show|what|who|where|how)/, '')
        .replace(/^(who|what|where) exactly (is|are)\b/, '$1 $2');
    q = q.replace(/^(?:(?:can|could|would) you (?:please )?)?(?:explain|tell me) (who|what) (.+) is$/, '$1 is $2')
        .replace(/^(?:i want|i would like|i'd like) to identify /, 'identify ')
        .replace(/^(where (?:is|are) .+) (?:listed|recorded|stated)$/, '$1');
    return q;
}
const cloneRestrictions = value => Object.fromEntries(Object.entries(value).map(([key, item]) => [key, Array.isArray(item) ? [...item] : item]));
function mergeRestrictions(current, inherited) {
    if (!inherited) return current;
    return Object.fromEntries(Object.keys(current).map(key => [key, Array.isArray(current[key])
        ? [...new Set([...current[key], ...(inherited[key] || [])])] : Boolean(current[key] || inherited[key])]));
}
function carriedConstraints(restrictions, text) {
    const copy = cloneRestrictions(restrictions);
    // A new relation may replace an unsupported causal predicate or comparison;
    // source, edition, negative and numeric constraints still bind the subject.
    copy.causal = copy.comparison = copy.progress = copy.hypothetical = copy.compound = false;
    if (restrictions.causal || restrictions.comparison) {
        if (!/\b(?:in|on|at|near|with|without|before|after|for)\b/.test(normalize(text))) copy.material = [];
    }
    return copy;
}

function restrictionsFor(text, parsed, hit) {
    const q = normalize(text), parts = parsed.parts;
    const nameTerms = hit?.queryTerms || [];
    const masked = maskSubject(q, nameTerms).replace(new RegExp(GUIDE_SOURCE.source, 'gu'), ' ');
    return {
        guideOnly: parts.some(part => part.guideOnly),
        editions: [...new Set([...parsed.editions, ...parts.flatMap(part => part.editions)])],
        negation: /\b(?:not|never|no|without|cannot|cant|wont|dont|doesnt|isnt|arent|wasnt|werent|havent|hasnt|hadnt|didnt|couldnt|wouldnt|shouldnt)\b|\b\w+n't\b/.test(masked),
        quantities: tokens(masked).filter(word => /\d/.test(word) || /^(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|many|much|few|several|all|every|both|either|neither|only)$/.test(word)),
        comparison: /\b(?:compar\w*|versus|vs|better|best|worse|worst|more|less|fewer|most|least|than|instead)\b/.test(masked),
        causal: /\b(?:why|because|caused?|causes|causing|reason|happened|happens|killed|murdered|betrayed|founded)\b/.test(masked),
        progress: parsed.correction || parts.some(part => part.report),
        hypothetical: parsed.hypothetical || /\b(?:if|unless|assuming|suppose|supposing|imagine)\b/.test(masked),
        compound: parsed.tooMany || parts.length > 1,
        // Production vocabulary preserves material restrictions such as Mars.
        material: materialTerms(text, nameTerms, parsed.editions)
    };
}

function maskSubject(text, terms) {
    if (!terms.length) return text;
    // Retrieval reports the visitor's own tokens, including spacing variants.
    const phrase = terms.map(escape).join('\\s+');
    return text.replace(new RegExp(`(?<![\\p{L}\\p{N}])${phrase}(?:'s)?(?![\\p{L}\\p{N}])`, 'gu'), 'SUBJECT');
}
const isRestricted = r => r.guideOnly || r.editions.length || r.negation || r.quantities.length || r.comparison || r.causal
    || r.progress || r.hypothetical || r.compound || r.material.length;

function matchEntities(text, list) {
    let hits = resolveEntities(text, list);
    // A title names its subject more specifically than another entity's alias
    // for the same exact span. Keep genuine pairs and exact-title homonyms.
    const titleHits = hits.filter(hit => hit.match === 'exact' && list.some(record => record.entityId === hit.id
        && normalize(record.title) === normalize(hit.alias)));
    if (titleHits.length) hits = hits.filter(hit => titleHits.includes(hit) || !titleHits.some(owner =>
        normalize(owner.queryTerms.join(' ')) === normalize(hit.queryTerms.join(' '))));
    if (hits.length) return hits;
    // Retrieval handles exact spacing and ordinary typos. The only extension
    // here confirms, never silently corrects, a typo in a compact multiword
    // proper name ("timelrod" for "Time Lord"). All candidates are visible.
    const possible = tokens(text).filter(word => word.length >= 6 && !/\d/.test(word) && !isCommonWord(word));
    const candidates = new Map();
    for (const record of list) {
        if (!kindGroup(record.subjectKind || record.kind)) continue;
        for (const alias of [record.title, ...record.aliases]) {
            const parts = tokens(alias);
            if (parts.length < 2 || parts.length > 4) continue;
            const compact = parts.join('');
            const word = possible.find(value => value !== compact && closeSpelling(value, compact));
            if (word) candidates.set(record.entityId, { id: record.entityId, alias, queryTerms: [word], match: 'typo' });
        }
    }
    return [...candidates.values()].slice(0, 8);
}

export function createInterpreter({ gameId, records, classify, thresholds = {} }) {
    if (!GAME_NAMES[gameId]) throw new Error('Unsupported guide game.');
    if (!Array.isArray(records) || typeof classify !== 'function') throw new TypeError('records and classify are required.');
    // Thresholds are empirical acceptance gates on supplied scores, not claimed
    // calibrated probabilities. The browser evaluation must measure their use.
    const gates = { minScore: 0.55, minMargin: 0.12, ...thresholds };
    let revision = 0, subject = null, frame = null, pending = null, contextId = null, ceiling = 'direct';
    const clear = () => { subject = null; frame = null; pending = null; revision++; };
    const visible = () => records.map(record => authorize(record, ceiling)).filter(Boolean);
    const names = list => [...new Set(list.flatMap(record => [record.title, ...record.aliases]))];
    const snapshot = () => ({ gameId, contextId, spoiler: ceiling, revision, subject: subject && { ...subject },
        frame: frame && { ...frame, restrictions: cloneRestrictions(frame.restrictions) },
        pending: pending && { ...pending, ...(pending.confidence ? { confidence: { ...pending.confidence } } : {}), entities: pending.entities.map(entity => ({ ...entity })) } });
    // An entity can have an action-titled quest record as well as its own name
    // ("Recruit Drirr in Jirinaar" and "Drirr"). Use a visible source name,
    // not whichever relationship happened to be extracted first.
    const entity = (id, list) => list.filter(record => record.entityId === id)
        .sort((a, b) => tokens(a.title).length - tokens(b.title).length || a.title.length - b.title.length)[0];
    const pendingEntity = record => ({ entityId: record.entityId, title: record.title });

    function setPending(value) {
        clear();
        const list = visible();
        const entities = [...new Map((value?.entities || []).flatMap(candidate => {
            const record = entity(candidate.entityId, list);
            return record ? [[record.entityId, pendingEntity(record)]] : [];
        })).values()];
        if (!entities.length || !SUPPORTED.has(aliasIntent(value?.intent)) || typeof value.originalText !== 'string') return false;
        pending = { intent: aliasIntent(value.intent), entities, originalText: value.originalText, contextId: contextId ?? 'default', spoiler: ceiling };
        frame = { entityId: null, intent: pending.intent, unconfirmed: true,
            restrictions: restrictionsFor(value.originalText, parse(value.originalText)), method: null, requestedFormat: null };
        return true;
    }

    // A source-verified planner can establish one salient recommendation for
    // a subsequent follow-up. This does not assert that the player chose it or
    // update game progress, and cannot ground a hidden or invented entity.
    function focusSubject(entityId, opts = {}) {
        clear();
        contextId = String(opts.contextId ?? 'default');
        ceiling = level(opts.spoiler ?? ceiling);
        const record = visible().find(candidate => candidate.entityId === entityId
            && (!opts.guideOnly || candidate.source?.review !== 'external-research'));
        if (!record) return false;
        subject = pendingEntity(record);
        const parsed = parse('', { names: [] });
        const restrictions = restrictionsFor('', parsed);
        restrictions.guideOnly = Boolean(opts.guideOnly);
        const constrained = opts.restrictions ? mergeRestrictions(restrictions, opts.restrictions) : restrictions;
        frame = { entityId, intent: null, restrictions: constrained, method: null, requestedFormat: null };
        return true;
    }

    async function interpret(value, opts = {}) {
        const originalText = String(value ?? '');
        const nextContext = String(opts.contextId ?? 'default'), nextCeiling = level(opts.spoiler ?? 'direct');
        let transition = 'none';
        if (contextId !== null && contextId !== nextContext) { clear(); transition = 'context-change'; }
        if (LEVELS.indexOf(nextCeiling) < LEVELS.indexOf(ceiling)) { clear(); transition = 'spoiler-lowered'; }
        contextId = nextContext; ceiling = nextCeiling;
        const selection = subjectSelection(originalText);
        const topicText = selection?.[2] || topicRequest(originalText, gameId);
        if (topicText) { clear(); transition = 'topic-change'; }
        const rawRequest = topicText || originalText;
        const requestText = requestFraming(rawRequest, gameId);
        const list = visible();
        let unresolvedSelection = false;
        if (selection) {
            const selected = matchEntities(selection[1], list).filter(hit => hit.match === 'exact');
            if (selected.length === 1 && !materialTerms(selection[1], selected[0].queryTerms).length) focusSubject(selected[0].id, { contextId, spoiler: ceiling });
            else unresolvedSelection = true;
        }
        if (subject && !entity(subject.entityId, list)) { clear(); transition = 'subject-hidden'; }
        const parsed = parse(requestText, { names: names(list) });
        let intent = null, modelIntent = null, routeOrigin = 'model', score = null, margin = null;
        const packet = (status, reason, extra = {}) => ({ originalText, intent, entityId: null, entityTitle: null,
            modelIntent, routeOrigin, transition, status, confidence: { score, margin }, restrictions: restrictionsFor(requestText, parsed),
            ...(topicText ? { requestText: rawRequest } : {}), reason, ...extra });
        if (opts.signal?.aborted) return packet('abstain', 'Canceled request discarded.', { transition: 'stale' });
        if (parsed.intent === 'reset' || parsed.intent === 'smaller' || /^(?:help|help me|what can you do|how do i use this)[?!.]*$/i.test(originalText.trim())) {
            routeOrigin = 'control';
            clear(); transition = parsed.intent === 'smaller' ? 'help-lowered' : parsed.intent === 'reset' ? 'reset' : 'help';
            return packet('abstain', 'Conversation control clears the semantic subject.');
        }
        const ticket = ++revision;
        const previous = subject;
        const previousFrame = frame;
        const waiting = pending;
        // A pending choice is consumed exactly once; an unrelated turn does not
        // allow a later "yes" to revive its requested relationship.
        pending = null;
        let confirmation = null;
        if (waiting && waiting.contextId === contextId && waiting.spoiler === ceiling) {
            if ((parsed.affirm || /^(?:yes|yeah|yep)[, ]+(?:that is|that's) the one$/.test(requestText)) && waiting.entities.length === 1) confirmation = waiting.entities[0];
            else {
                const choiceQuery = parsed.subject?.q || originalText;
                const choices = resolveEntities(choiceQuery, list).filter(hit => hit.match === 'exact' && waiting.entities.some(candidate => candidate.entityId === hit.id));
                const choiceShape = choices.length === 1 ? maskSubject(normalize(choiceQuery).replace(/[?!.]+$/, ''), choices[0].queryTerms).replace(/,/g, '').replace(/\s+/g, ' ') : '';
                const bare = /^(?:(?:yes|yeah|yep|correct|right) )?(?:the |a |an )?SUBJECT(?: is the one(?: i mean)?| is (?:the )?(?:one|person|subject) i mean)?$/.test(choiceShape);
                if (bare) confirmation = waiting.entities.find(candidate => candidate.entityId === choices[0].id);
            }
        }
        let predictions;
        if (confirmation) {
            intent = waiting.intent; transition = 'subject-confirmed';
            routeOrigin = 'pending-confirmation'; modelIntent = waiting.modelIntent ?? waiting.intent;
            score = waiting.confidence?.score ?? null; margin = waiting.confidence?.margin ?? null;
        } else {
            try { predictions = await untilAborted(classify(rawRequest, { gameId, subject: previous && { ...previous },
                previousIntent: previousFrame?.intent || null, signal: opts.signal }), opts.signal); }
            catch {
                if (ticket !== revision || opts.signal?.aborted) return packet('abstain', 'Stale classifier result discarded.', { transition: 'stale' });
                clear(); return packet('abstain', 'Classifier unavailable; use the original-text baseline.');
            }
            if (ticket !== revision || opts.signal?.aborted) return packet('abstain', 'Stale classifier result discarded.', { transition: 'stale' });
            const ranked = Array.isArray(predictions) ? predictions.filter(p => typeof p?.label === 'string' && Number.isFinite(p.score)).sort((a, b) => b.score - a.score) : [];
            modelIntent = ranked[0]?.label || null;
            intent = aliasIntent(modelIntent) || null;
            score = ranked[0]?.score ?? null;
            margin = ranked.length > 1 ? ranked[0].score - ranked[1].score : null;
            const rawCore = sourceNeutralCore(parsed.parts[0]?.core || '');
            const exactHits = matchEntities(requestText, list).filter(hit => hit.match === 'exact');
            const shape = (exactHits.length === 1 ? maskSubject(rawCore, exactHits[0].queryTerms) : rawCore)
                .replace(/\b(?:it|its|he|him|his|she|her|they|them|their)\b/g, 'SUBJECT');
            const bounded = parsed.parts.length === 1 && tokens(rawCore).length <= 12 && shape !== 'SUBJECT'
                ? Object.entries(shapes).filter(([, pattern]) => pattern.test(shape)).map(([label]) => label) : [];
            const namedSlot = exactHits.length === 1 ? maskSubject(rawCore, exactHits[0].queryTerms).replace(/\bSUBJECT\b/g, 'this') : '';
            const formatOnly = namedSlot && tokens(namedSlot).every(word => FRAGMENT_FILL.has(word) || ['link', 'links', 'url', 'urls', 'address'].includes(word));
            const relationSlots = Object.keys(FRAGMENT_WORDS).filter(label => fragmentMatches(rawCore, label)
                || (namedSlot && !formatOnly && fragmentMatches(namedSlot, label)));
            const candidates = [...new Set([...bounded, ...relationSlots])];
            const exactRelation = EXACT_RELATIONS[rawCore] || (candidates.length === 1 ? candidates[0] : null);
            if (exactRelation && exactRelation !== intent && !gates.abstainAll) {
                intent = exactRelation; routeOrigin = 'exact-relation';
            }
        }
        const acceptedIntent = !gates.abstainAll && SUPPORTED.has(intent) && score !== null && margin !== null
            && score >= gates.minScore && margin >= gates.minMargin;
        // A confirmed intent was already gated on its original turn. External
        // pending frames have no model score, but never override abstainAll.
        const mayInterpret = !gates.abstainAll && (confirmation || acceptedIntent || routeOrigin === 'exact-relation');
        if (unresolvedSelection) return packet('clarify', 'Name the new subject exactly before asking a follow-up.', { blockReplay: true, replayReason: 'The new subject is not confirmed; I cannot attach this follow-up to an earlier subject.' });
        const sourceText = confirmation ? waiting.originalText : rawRequest;
        const analysisText = confirmation ? requestFraming(sourceText, gameId) : requestText;
        const sourceParsed = confirmation ? parse(analysisText, { names: names(list) }) : parsed;
        const core = sourceNeutralCore(sourceParsed.parts[0]?.core || '');
        const sourceStory = sourceParsed.parts.length === 1 && sourceParsed.parts[0].story;
        if (sourceStory) {
            // Role direction is authored English grammar, not a model guess.
            // Keep the complete question for the indexed source-role engine;
            // neither "got" nor a generic identity label can rewrite it.
            intent = 'story'; routeOrigin = 'source-story';
            const query = sourceStory.query.replace(new RegExp(GUIDE_SOURCE.source, 'gu'), ' ').trim();
            const named = matchEntities(query, list).filter(candidate => candidate.match === 'exact');
            const implicit = !materialTerms(query, [], sourceParsed.editions).length && !tokens(query).some(word => /\d/.test(word));
            const selected = named.length === 1 ? entity(named[0].id, list) : implicit && previous ? entity(previous.entityId, list) : null;
            let restrictions = restrictionsFor(query, sourceParsed, named.length === 1 ? named[0] : null);
            if (implicit) restrictions = mergeRestrictions(restrictions, previousFrame?.restrictions);
            if (selected) {
                subject = pendingEntity(selected);
                frame = { entityId: selected.entityId, intent: 'story', restrictions: carriedConstraints(restrictions, query), method: null, requestedFormat: null };
            } else {
                subject = null;
                frame = isRestricted(restrictions) || (implicit && previousFrame?.unconfirmed)
                    ? { entityId: null, intent: 'story', restrictions: carriedConstraints(restrictions, query),
                        ...(implicit && previousFrame?.unconfirmed ? { unconfirmed: true } : {}), method: null, requestedFormat: null } : null;
            }
            const inheritedBlocked = implicit && previousFrame && (previousFrame.unconfirmed || isRestricted({ ...previousFrame.restrictions, guideOnly: false }));
            const guidePrefix = restrictions.guideOnly && !sourceParsed.parts[0].guideOnly ? `According to the guide, ${sourceText}` : sourceText;
            return packet('protected', 'The source engine must preserve the requested story role and event.', {
                story: { ...sourceStory }, restrictions, ...(selected ? { entityId: selected.entityId, entityTitle: selected.title } : {}),
                requestText: guidePrefix,
                ...(inheritedBlocked ? { blockReplay: true, replayReason: 'Restate the event with its unresolved source, edition or material restriction.' } : {})
            });
        }
        const fragment = bareFragment(core);
        const safeFragment = sourceParsed.parts.length === 1 && fragmentMatches(fragment, intent);
        const hits = safeFragment && previous ? [] : matchEntities(analysisText, list);
        let hit = confirmation ? hits.find(candidate => candidate.id === confirmation.entityId) : hits.length === 1 ? hits[0] : null;
        const record = confirmation ? entity(confirmation.entityId, list) : hit && entity(hit.id, list);
        let selected = record;
        if (!confirmation && previousFrame?.unconfirmed && !hits.some(candidate => candidate.match === 'exact')) {
            subject = null; frame = previousFrame;
            return packet('clarify', 'The new subject is not confirmed. Name it explicitly before asking a follow-up.', {
                blockReplay: true, replayReason: 'The intended subject is still unconfirmed; I cannot return to the older selected topic.' });
        }
        if (!confirmation && hits.length === 1 && previous && hit.id !== previous.entityId
            && sourceParsed.parts.length === 1 && sourceParsed.parts[0].pronoun) {
            subject = null; frame = null; transition = 'ambiguous-subject';
            return packet('clarify', 'The message mentions a new visible subject and a previous pronoun subject; name one subject explicitly.');
        }
        if (!confirmation && hits.length > 1) {
            subject = null; frame = null; transition = 'ambiguous-subject';
            if (mayInterpret) pending = { intent, modelIntent, entities: hits.map(candidate => pendingEntity(entity(candidate.id, list))), originalText: rawRequest, contextId, spoiler: ceiling, confidence: { score, margin } };
            frame = { entityId: null, intent, unconfirmed: true, restrictions: restrictionsFor(analysisText, sourceParsed), method: null, requestedFormat: null };
            return packet('clarify', 'Several visible subjects match; name one.', { candidates: hits.map(candidate => pendingEntity(entity(candidate.id, list))) });
        }
        if (!confirmation && hit?.match === 'typo') {
            subject = null; frame = null;
            if (!mayInterpret) return packet('clarify', gates.abstainAll ? 'Threshold selection rejected all model intents.' : 'Intent needs clarification before a subject guess can be confirmed.');
            pending = { intent, modelIntent, entities: [pendingEntity(record)], originalText: rawRequest, contextId, spoiler: ceiling, confidence: { score, margin } };
            frame = { entityId: null, intent, unconfirmed: true, restrictions: restrictionsFor(analysisText, sourceParsed), method: null, requestedFormat: null };
            transition = 'pending-subject';
            return packet('clarify', 'Confirm the visible subject before interpreting its relationship.', { candidates: pending.entities.map(candidate => ({ ...candidate })) });
        }
        if (!selected && sourceParsed.parts.length === 1 && sourceParsed.parts[0].pronoun && previous) {
            // Entity linking is separate from rewriting. A clearly pronominal
            // subject can survive an unsupported predicate ("Why does he
            // matter?"). Unknown subject names cannot occupy that slot.
            const pronounShape = normalize(core).replace(/\b(?:it|its|he|him|his|she|her|they|them|their|there)\b/g, 'SUBJECT');
            const barePronounSubject = /^(?:(?:why|how|where|when|what|who|which)\s+)?(?:(?:is|are|was|were|does|do|did|can|could|would|should|will|has|have|had)\s+)?(?:he|she|it|they|him|her|them)\b/.test(normalize(sourceParsed.parts[0].core))
                && !/\b(?:near|with|to|from|than|against|before|after|in|on|at)\s+\S/.test(normalize(sourceParsed.parts[0].core));
            if (Object.values(shapes).some(pattern => pattern.test(pronounShape)) || barePronounSubject) {
                selected = entity(previous.entityId, list); hit = { queryTerms: tokens(sourceText).filter(word => /^(?:it|its|he|him|his|she|her|they|them|their|there)$/.test(word)) };
                transition = 'subject-carried';
            }
        }
        if (!selected && !hits.length && previous && safeFragment) {
            selected = entity(previous.entityId, list);
            transition = 'subject-carried';
        }
        if (selected && transition === 'subject-carried' && safeFragment && !fragmentSubjectAllowed(fragment, selected, list)) {
            subject = null; frame = null;
            return packet('clarify', 'Name the intended subject; that kind does not match the current subject.', { blockReplay: true,
                replayReason: 'The referenced kind does not match the grounded subject. Name the intended subject explicitly.' });
        }
        const shape = maskSubject(normalize(core), hit?.queryTerms || []);
        const creatorShape = intent === 'identity' && /^who (?:created|made|developed|authored) (?:the )?SUBJECT$/.test(shape);
        const qualifier = creatorShape ? 'creator' : intent === 'identity' ? (shape.match(/\b(job|occupation|profession|role)\b/)?.[1] || null)
            : intent === 'use' && /\b(?:installation|install|installing|setup|set up)\b/.test(shape) ? 'installation'
            : intent === 'use' && /\bconfigure\b/.test(shape) ? 'configuration'
            : intent === 'use' && safeFragment && /\b(?:instructions|procedure)\b/.test(shape) ? 'instructions'
            : intent === 'stats' ? shape.match(/\b(base|starting|initial)\b/)?.[1] || null : null;
        const qualifierShape = qualifier && /^(?:(?:what is|what's) (?:the )?SUBJECT(?:'s)? (?:job|occupation|profession|role)|(?:(?:his|her|its|their|the) |SUBJECT )?(?:job|occupation|profession|role))$/.test(shape);
        const formatShape = ['location', 'acquisition'].includes(intent) && /^(?:SUBJECT(?:'s)? (?:link|links|url|urls|address)|(?:link|url|address) (?:for|of|to) SUBJECT)$/.test(shape);
        const simpleShape = shapes[intent]?.test(shape) || safeFragment || qualifierShape || formatShape || creatorShape;
        let restrictions = restrictionsFor(analysisText, sourceParsed, hit);
        const requestWords = maskSubject(normalize(analysisText), hit?.queryTerms || []);
        const detectedMethod = intent === 'acquisition' ? detectMethod(requestWords) : null;
        const method = ['download', 'buy', 'recruit'].includes(detectedMethod) ? detectedMethod
            : intent === 'acquisition' && transition === 'subject-carried' ? previousFrame?.method || null : null;
        const requestedFormat = /\b(?:link|url)\b/.test(requestWords) || (intent === 'acquisition' && /\b(?:address|website)\b/.test(requestWords) && method === 'download') ? 'link'
            : transition === 'subject-carried' && intent === 'acquisition' ? previousFrame?.requestedFormat || null : null;
        if ((intent === 'acquisition' || formatShape) && simpleShape && requestedFormat === 'link') restrictions.material = restrictions.material.filter(term => !['link', 'links', 'url', 'urls', 'address'].includes(term));
        if (qualifierShape || (safeFragment && qualifier)) restrictions.material = restrictions.material.filter(term => term !== qualifier);
        if (creatorShape) restrictions.material = restrictions.material.filter(term => !['created', 'made', 'developed', 'authored'].includes(term));
        if (safeFragment) restrictions.material = restrictions.material.filter(term => !FRAGMENT_WORDS[intent].has(term) && !FRAGMENT_FILL.has(term));
        if (safeFragment && intent === 'prerequisites') restrictions.material = restrictions.material.filter(term => term !== 'first');
        if (detectedMethod && !['download', 'buy', 'recruit'].includes(detectedMethod)) restrictions.material.push(detectedMethod);
        // Normalize only vocabulary whose full safe shape was checked above.
        if (intent === 'prerequisites' && simpleShape) restrictions.material = restrictions.material.filter(term => term !== 'before');
        if (intent === 'location' && simpleShape) restrictions.material = restrictions.material.filter(term => term !== 'kept');
        if (intent === 'identity' && simpleShape) restrictions.material = restrictions.material.filter(term => !['identify', 'define'].includes(term));
        const currentConstraints = carriedConstraints(restrictions, analysisText);
        // Bind the whole current frame, never just the name, for pronouns and
        // ellipsis. Explicitly named questions establish a fresh request frame.
        if (transition === 'subject-carried') restrictions = mergeRestrictions(restrictions, previousFrame?.restrictions);
        // Grounding describes only which visible subject the message names.
        // It grants no fact permission and does not depend on the model label,
        // score gates, supported relation, or permission to canonicalize.
        const grounding = selected ? { entityId: selected.entityId, entityTitle: selected.title } : {};
        const inheritedBlocked = transition === 'subject-carried' && previousFrame && isRestricted({ ...previousFrame.restrictions, guideOnly: false });
        const request = { ...grounding, ...(method ? { method } : {}), ...(requestedFormat ? { requestedFormat } : {}), ...(qualifier ? { qualifier } : {}),
            ...(inheritedBlocked ? { blockReplay: true, replayReason: 'This follow-up inherits a source, edition, negative, numeric, or material constraint. Restate the subject and constraint together; the bare fragment must not be replayed as an unrestricted request.' } : {}) };
        if (selected) {
            subject = pendingEntity(selected);
            frame = { entityId: selected.entityId, intent,
                restrictions: transition === 'subject-carried' ? mergeRestrictions(currentConstraints, previousFrame?.restrictions) : currentConstraints,
                method, requestedFormat };
            if (transition === 'none') transition = previous?.entityId === selected.entityId ? 'subject-retained' : 'subject-set';
        } else {
            subject = null;
            const identityQuery = sourceParsed.parts.length === 1 && sourceParsed.parts[0].narrative?.aspect === 'identity'
                && sourceParsed.parts[0].narrative.query;
            frame = identityQuery && materialTerms(identityQuery).length ? { entityId: null, intent, unconfirmed: true,
                restrictions: carriedConstraints(restrictions, analysisText), method: null, requestedFormat: null } : null;
            if (transition === 'none') transition = 'subject-missing';
        }
        if (!mayInterpret) return packet('clarify', gates.abstainAll ? 'Threshold selection rejected all model intents.' : 'Intent needs clarification: unknown label or insufficient score separation.', { restrictions, ...request });
        if (!selected) {
            subject = null; transition = 'subject-missing';
            return packet('clarify', 'Name one visible subject; no old subject was recovered.', { restrictions, ...request });
        }
        if (isRestricted({ ...restrictions, guideOnly: false }) || ['why', 'comparison', 'overview'].includes(intent)) {
            return packet('protected', 'Original wording must reach the baseline unchanged; rewriting would lose a restriction or unsupported relation.', { restrictions, ...request, ...(confirmation ? { originalText: sourceText, confirmationText: originalText, requestedText: sourceText } : {}) });
        }
        if (!simpleShape) {
            return packet('protected', 'This wording is outside the simple lossless rewrite shapes.', { restrictions, ...request, ...(confirmation ? { originalText: sourceText, confirmationText: originalText, requestedText: sourceText } : {}) });
        }
        const person = list.some(record => record.entityId === selected.entityId && kindGroup(record.subjectKind || record.kind) === 'person');
        const canonical = intent === 'identity'
            ? qualifier === 'creator' ? `Who created ${selected.title}?` : qualifier ? `What is ${selected.title}'s ${qualifier}?` : `${person ? 'Who' : 'What'} is ${selected.title}?`
            : intent === 'use' && qualifier ? ({ installation: `How do I install ${selected.title}?`, configuration: `How do I configure ${selected.title}?`, instructions: `How do I use ${selected.title}?` })[qualifier]
            : intent === 'acquisition' && method ? ({ download: `Where can I download ${selected.title}?`, buy: `How do I buy ${selected.title}?`, recruit: `How do I recruit ${selected.title}?` })[method]
            : templates[intent](selected.title);
        const canonicalQuestion = restrictions.guideOnly ? `According to the guide, ${canonical[0].toLowerCase()}${canonical.slice(1)}` : canonical;
        return packet('ready', 'Visible subject and simple request safely grounded; the engine still decides answer eligibility.', {
            ...request, restrictions, canonicalQuestion,
            ...(confirmation ? { requestedText: sourceText } : {})
        });
    }

    return { interpret, resetTopic: clear, resetSession() { clear(); contextId = null; ceiling = 'direct'; }, setPending, focusSubject, getState: snapshot };
}

/**
 * Compose dialogue interpretation around an existing source engine. The engine
 * still owns progress, predicates, fallback context, and choice/action identity.
 * A separate display ledger keeps the user's original words and reviewed source
 * presentation without mutating private engine messages or fabricating records.
 */
export function createConversationAssistant({ assistant, records, gameId = assistant?.gameId, classify,
    thresholds = {}, catalog = null, root = null, knowledge = null, encode = null } = {}) {
    if (!assistant || typeof assistant.answer !== 'function' || !Array.isArray(records)) throw new TypeError('A source assistant and records are required.');
    const sourceRecords = augmentSourceRecords(records, root);
    const interpreter = createInterpreter({ gameId, records: knowledge?.sourceRecords || sourceRecords, classify: typeof classify === 'function' ? classify : async () => [], thresholds });
    const consultation = createConsultation({ gameId, records: sourceRecords, catalog });
    const knowledgeRouter = knowledge ? createKnowledgeRouter(knowledge) : null;
    const histories = new Map(), subscribers = new Set();
    let active = 'default', revision = 0, generation = 0, engineCalls = 0, destroyed = false, lastPacket = null, contextSeedPending = true, activeTurn = null;
    function cancelTurn() {
        if (!activeTurn) return;
        activeTurn.rollback?.(); activeTurn.controller.abort(); activeTurn.cleanup?.();
        Object.assign(activeTurn.pending, { decision: 'stale', text: 'Question canceled. Ask again in the current context.', recordIds: [], sources: [], choices: [], actions: [] });
        activeTurn = null;
    }
    const sourceCall = fn => { engineCalls++; try { return fn(); } finally { engineCalls--; } };
    const notify = () => { if (!destroyed) for (const fn of subscribers) fn(); };
    const sourceUnsubscribe = assistant.subscribe?.(() => {
        if (!engineCalls) { cancelTurn(); revision++; generation++; }
        notify();
    }) || (() => {});
    const directOptions = opts => ({ ...opts, contextId: String(opts?.contextId || active), spoiler: 'direct', fullAnswersOnly: true });
    function history(id = active) {
        id = String(id || active);
        if (!histories.has(id)) {
            // Wrapping is normally done before the first question. Existing
            // messages remain readable, with stale executable controls removed.
            histories.set(id, (assistant.getHistory?.(id) || []).map(message => ({ ...message, choices: [], actions: [] })));
        }
        const messages = histories.get(id); histories.delete(id); histories.set(id, messages);
        while (histories.size > 8) histories.delete(histories.keys().next().value);
        return messages;
    }
    function switchContext(id, callSource = true) {
        id = String(id || active);
        if (id !== active) {
            cancelTurn(); active = id; generation++; revision++; contextSeedPending = true;
            interpreter.resetTopic(); consultation.reset(); knowledgeRouter?.reset(); lastPacket = null;
        }
        if (callSource) sourceCall(() => assistant.activate?.(id));
    }
    const result = (decision, text, extra = {}) => ({ decision, text, recordIds: [], sources: [], actions: [], choices: [], stateChanges: [],
        level: 'direct', revision, ...extra });
    const atomicDecline = (text,decision='decline') => {
        if(activeTurn){activeTurn.preserveKnowledge=true;activeTurn.priorKnowledge=knowledgeRouter?.inspect();}
        return result(decision,text);
    };
    function unprovedCapability(turn,text,packet=null){
        clearSourceSlots();interpreter.resetTopic();knowledgeRouter?.reset();
        return finish(turn,result('decline','I could not ground that complete request in the available sources.'),
            packet?{...packet,routeOrigin:'reviewed-knowledge'}:{originalText:String(text),status:'abstain',routeOrigin:'reviewed-knowledge',modelIntent:null});
    }
    function planSource(turn,text,packet,options){
        if(!knowledgeRouter)return null;
        const sequence=parseSequenceFieldRequest(text),description=parseDescriptiveReferenceRequest(text);
        const atomic=Boolean(description || sequence?.fields?.length>1);
        if(!atomic)return knowledgeRouter.plan(text,packet,options);
        const checkpoint=knowledgeRouter.checkpoint();
        const rollback=()=>{knowledgeRouter.restore(checkpoint);if(turn.rollback===rollback)delete turn.rollback;};
        turn.rollback=rollback;
        let reply;
        try{reply=knowledgeRouter.plan(text,packet,options);}catch(error){rollback();throw error;}
        if(reply?.decision==='answer' && !reply.knowledge?.limited && !reply.knowledge?.unsupported)return reply;
        rollback();return atomicDecline(reply?.text || 'I could not ground every part of that request in the available sources.');
    }
    function restoreAtomicSubject(turn,options){
        interpreter.resetTopic();
        if(turn.priorKnowledge?.focus)interpreter.focusSubject(turn.priorKnowledge.focus,{...options,restrictions:turn.priorKnowledge.restriction});
    }
    const stale = () => result('stale', 'The topic or conversation changed. Ask again in the current context.');
    function decorate(reply, packet = null, ticket = revision) {
        return { ...reply, revision: ticket, choices: (reply.choices || []).map(choice => ({ ...choice, revision: ticket })),
            ...(packet ? { dialoguePacket: packet, modelIntent: packet.modelIntent, routeOrigin: packet.routeOrigin } : {}) };
    }
    function begin(text, signal) {
        cancelTurn();
        const ticket = ++revision, epoch = ++generation, id = active, messages = history(id);
        const user = { role: 'user', text: String(text).slice(0, 2000), level: 'direct' };
        const pending = { role: 'assistant', ...result('pending', 'Looking at the guide…', { revision: ticket }) };
        messages.push(user, pending); if (messages.length > 12) messages.splice(0, messages.length - 12);
        const controller = new AbortController();
        const externalAbort = () => {
            if (activeTurn?.controller === controller) { cancelTurn(); notify(); }
            else controller.abort();
        };
        if (signal?.aborted) controller.abort(); else signal?.addEventListener('abort', externalAbort, { once: true });
        const turn = { ticket, epoch, id, pending, controller, cleanup: () => signal?.removeEventListener('abort', externalAbort) };
        activeTurn = turn; notify(); return turn;
    }
    const current = turn => !destroyed && !turn.controller.signal.aborted && turn.epoch === generation && turn.id === active && turn.ticket === revision;
    function finish(turn, reply, packet) {
        if (!current(turn)) return stale();
        delete turn.rollback;
        const completed = decorate(reply, packet, turn.ticket);
        if(!turn.preserveKnowledge)knowledgeRouter?.observe(completed, packet, history(turn.id).at(-2)?.text || '');
        Object.assign(turn.pending, completed); turn.cleanup(); if (activeTurn === turn) activeTurn = null;
        notify(); return completed;
    }
    function clearSourceSlots() {
        // A locally handled turn was not consumed by the engine. Invalidate
        // old subject/pending/action slots without clearing progress or history.
        sourceCall(() => { assistant.activate?.(`dialogue-boundary:${gameId}`); assistant.activate?.(active); });
    }
    function groundEngineReply(reply, text, opts, priorPacket = null) {
        if (reply?.conversationContext && !reply.stateChanges?.length) {
            interpreter.resetTopic();
            const scope = reply.conversationContext;
            if (scope.entityId) interpreter.focusSubject(scope.entityId, { contextId: active, spoiler: 'direct',
                guideOnly: scope.restrictions?.guideOnly, restrictions: scope.restrictions });
            return;
        }
        if (reply?.decision !== 'answer' || !reply.recordIds?.length) return;
        const ids = new Set(reply.recordIds.map(id => sourceRecords.find(record => record.id === id)?.entityId).filter(Boolean));
        if (ids.size !== 1) return;
        const entityId = [...ids][0], visible = sourceRecords.map(record => authorize(record, 'direct')).filter(Boolean);
        const parsed = parse(text), hit = matchEntities(text, visible).find(candidate => candidate.id === entityId);
        // An engine choice establishes identity; an unrelated quoted entity in
        // a multi-subject answer does not become conversational context.
        const storyReply = parsed.parts.some(part => part.story) && reply.recordIds.every(id => sourceRecords.find(record => record.id === id)?.story);
        if (!hit && !opts.choiceId && !storyReply) return;
        const pendingText = opts.choiceId && (priorPacket?.requestedText || priorPacket?.originalText);
        const pendingHit = pendingText && matchEntities(pendingText, visible).find(candidate => candidate.id === entityId);
        const restrictions = storyReply && priorPacket?.story ? priorPacket.restrictions
            : pendingText && pendingHit ? restrictionsFor(pendingText, parse(pendingText), pendingHit)
            : opts.choiceId && priorPacket?.restrictions ? priorPacket.restrictions : restrictionsFor(text, parsed, hit);
        interpreter.focusSubject(entityId, { contextId: active, spoiler: 'direct', guideOnly: restrictions.guideOnly, restrictions });
    }
    async function sourceQuestions(turn, text, packet, options, decomposition) {
        if (decomposition.tooMany) return atomicDecline(`Ask at most ${MAX_PARTS} source questions together so I can check every requested part.`,'clarify');
        const checkpoint = knowledgeRouter.checkpoint();
        const rollback = () => { knowledgeRouter.restore(checkpoint); if (turn.rollback === rollback) delete turn.rollback; };
        turn.rollback = rollback;
        const replies = [];
        for (const question of decomposition.questions) {
            if (!current(turn)) return null;
            const parsed = parse(question.text);
            const restrictions = restrictionsFor(question.text, parsed);
            // Positional/readiness framing is used only by this all-or-none
            // source path. The original report parse is preserved, and no
            // source-engine progress action is dispatched for the preamble.
            if(decomposition.readOnlyContext)restrictions.progress=false;
            // Source and edition directives bind the entire message. Whole-turn
            // state/negative guards also survive decomposition; sibling factual
            // predicates are not rewritten into this part's question.
            restrictions.guideOnly ||= Boolean(packet.restrictions?.guideOnly || decomposition.parsed.parts.some(part => part.guideOnly));
            restrictions.editions = [...new Set([...restrictions.editions, ...decomposition.parsed.editions,
                ...(packet.restrictions?.editions || [])])];
            for (const guard of ['hypothetical', 'progress', 'negation'])
                if((guard!=='hypothetical' || !decomposition.readOnlyConditions)
                    && (guard!=='progress' || !decomposition.readOnlyContext))restrictions[guard] ||= Boolean(packet.restrictions?.[guard]);
            const partPacket = { ...packet, originalText: question.text, scopeText: String(text), restrictions };
            let embedding;
            if (typeof encode === 'function') {
                try { embedding = await untilAborted(encode(knowledgeRouter.embeddingText(question.text, partPacket), { signal: options.signal }), options.signal); }
                catch { /* Exact source matching remains available offline. */ }
                if (!current(turn)) return null;
            }
            const reply = knowledgeRouter.plan(question.text, partPacket, { ...options, embedding });
            if (reply?.decision !== 'answer' || !reply.recordIds?.length || !reply.sources?.length
                || !reply.knowledge?.evidence?.length || reply.knowledge.limited || reply.knowledge.unsupported
                || reply.actions?.length || reply.choices?.length || reply.stateChanges?.length) {
                rollback();
                const message=`I could not ground every part of that question in the available sources. Unanswered: “${question.question}”. Ask that part with its subject and restrictions.`;
                // A failed compound restores its prior topic atomically. A
                // single unknown positional subject still invalidates stale
                // follow-ups just as an ordinary unknown subject does.
                return decomposition.questions.length>1?atomicDecline(message):result('decline',message);
            }
            replies.push(presentKnowledgeDefinition(reply, question.text, sourceRecords));
        }
        if (!current(turn)) return null;
        const unique = values => [...new Map(values.map(value => [JSON.stringify(value), value])).values()];
        const last = replies.at(-1);
        return { ...last, text: [...new Set(replies.map(reply => reply.text))].join('\n\n'),
            recordIds: [...new Set(replies.flatMap(reply => reply.recordIds))], sources: unique(replies.flatMap(reply => reply.sources)),
            sourceLinks: unique(replies.flatMap(reply => reply.sourceLinks || [])), actions: [], choices: [], stateChanges: [],
            knowledge: { ...last.knowledge, factIds: [...new Set(replies.flatMap(reply => reply.knowledge.factIds))],
                evidence: unique(replies.flatMap(reply => reply.knowledge.evidence)),
                parts: replies.map((reply, index) => ({ question: decomposition.questions[index].question,
                    recordIds: [...reply.recordIds], ...reply.knowledge })) } };
    }
    function validExpected(opts) { return opts?.expectedRevision === undefined || opts.expectedRevision === revision; }
    function clearForCommand(text) {
        const parsed = parse(text);
        if (parsed.intent === 'reset' || topicRequest(text, gameId) || subjectSelection(text)) {
            if (/session/.test(parsed.q)) { histories.clear(); sourceCall(() => assistant.resetSession()); }
            else { histories.delete(active); sourceCall(() => assistant.resetTopic(active)); }
            interpreter.resetTopic(); consultation.reset(); knowledgeRouter?.reset(); lastPacket = null;
            contextSeedPending = false;
        }
    }
    function seedSelectedContext(opts) {
        if (!contextSeedPending) return;
        contextSeedPending = false;
        if (Array.isArray(opts.entityIds) && opts.entityIds.length === 1) interpreter.focusSubject(opts.entityIds[0], { contextId: active, spoiler: 'direct' });
    }
    const api = {
        answer(text, opts = {}) {
            if (destroyed || opts.signal?.aborted || !validExpected(opts)) return stale();
            switchContext(opts.contextId); clearForCommand(text); seedSelectedContext(opts);
            const prior = lastPacket, turn = begin(text, opts.signal), options = directOptions(opts);
            const known = !opts.choiceId && planSource(turn,text,{},options);
            if (known) {
                clearSourceSlots();
                if(turn.preserveKnowledge)restoreAtomicSubject(turn,options);
                else if (known.knowledge?.focusEntityId) interpreter.focusSubject(known.knowledge.focusEntityId, { ...options,
                    guideOnly: known.knowledge.context?.guideOnly, restrictions: known.knowledge.context });
                else interpreter.resetTopic();
                return finish(turn, presentKnowledgeDefinition(known, text, sourceRecords), { originalText: String(text), status: 'ready', routeOrigin: 'reviewed-knowledge', modelIntent: null });
            }
            if(!opts.choiceId && knowledgeRouter && wholeSourceRequest(text))
                return unprovedCapability(turn,text);
            const sourceFrame=sourceQuestionParts(text);
            if(sourceFrame?.readOnlyContext || sourceFrame?.sceneTransitions.length){
                clearSourceSlots();interpreter.resetTopic();
                return finish(turn,result('decline','I could not ground that contextual question in the available sources.'),
                    {originalText:String(text),status:'abstain',routeOrigin:'reviewed-knowledge',modelIntent:null});
            }
            if (opts.expectedRevision !== undefined) options.expectedRevision = assistant.revision;
            const rawReply = sourceCall(() => assistant.answer(text, options));
            const reply=knowledgeRouter?.guardReply(text,rawReply) || rawReply;
            if(reply.decision!=='answer' && !reply.actions?.length && !reply.stateChanges?.length){
                const fallback=knowledgeRouter?.planFrame(text,{}, {...options,afterSource:true,preferExisting:false});
                if(fallback){
                    clearSourceSlots();
                    if(fallback.knowledge?.focusEntityId)interpreter.focusSubject(fallback.knowledge.focusEntityId,{...options,
                        guideOnly:fallback.knowledge.context?.guideOnly,restrictions:fallback.knowledge.context});
                    return finish(turn,presentKnowledgeDefinition(fallback,text,sourceRecords),{originalText:String(text),status:'ready',routeOrigin:'reviewed-knowledge',modelIntent:null});
                }
            }
            if (reply.suggestedFrom) {
                const choices = [...new Map((reply.recordIds || []).flatMap(id => {
                    const record = sourceRecords.find(candidate => candidate.id === id), visible = record && authorize(record, 'direct');
                    return visible ? [[visible.entityId, { entityId: visible.entityId, title: visible.title }]] : [];
                })).values()];
                clearSourceSlots();
                if (choices.length) interpreter.setPending({ intent: aliasIntent(parse(text).intent), entities: choices, originalText: String(text) });
                return finish(turn, result('clarify', choices.length === 1 ? `Did you mean ${choices[0].title}? Please confirm the subject.`
                    : 'Name the intended subject exactly before I answer.'), { originalText: String(text), status: 'clarify',
                    transition: 'pending-subject', routeOrigin: 'source-engine', modelIntent: null, candidates: choices });
            }
            if (reply.decision === 'answer' || reply.conversationContext) groundEngineReply(reply, text, options, prior);
            else if (!opts.choiceId) interpreter.resetTopic();
            return finish(turn, reply, null);
        },
        async answerAsync(text, opts = {}) {
            if (destroyed || opts.signal?.aborted || !validExpected(opts)) return stale();
            if (opts.choiceId) return api.answer(text, opts);
            switchContext(opts.contextId); clearForCommand(text); seedSelectedContext(opts);
            const turn = begin(text, opts.signal), options = { ...directOptions(opts), signal: null };
            options.signal = turn.controller.signal;
            let packet;
            try { packet = await interpreter.interpret(text, options); }
            catch { packet = { originalText: String(text), status: 'abstain', reason: 'Intent interpretation unavailable.', routeOrigin: 'source-engine', modelIntent: null }; }
            if (!current(turn)) return stale();
            lastPacket = packet;
            const sourceRequest = parse(packet.requestText || text);
            if(knowledgeRouter && !sourceRequest.parts.some(part=>part.report || part.story)
                && sourceRequest.parts.filter(part=>/^(?:who|whose|what|where|how|why|when|which|can|could|does|do|is|are|should|would|will|must|has|have)\b/.test(part.core)).length>1
                && playerStateQuestion(packet.requestText || text)){
                const declined=atomicDecline('I cannot verify the current-state part of that question from guide sources. Ask the source question separately.');
                clearSourceSlots();interpreter.resetTopic();
                if(turn.priorKnowledge?.focus)interpreter.focusSubject(turn.priorKnowledge.focus,{...options,restrictions:turn.priorKnowledge.restriction});
                return finish(turn,declined,{...packet,routeOrigin:'reviewed-knowledge'});
            }
            const typedSourceRelation = Boolean(wholeSourceRequest(text)) || sourceRequest.correction || sourceRequest.parts.some(part => part.report || part.story || parseFactualPropertyRequest(part.core)
                || (part.narrative && part.narrative.aspect !== 'identity'));
            if (packet.transition === 'stale') return finish(turn, stale(), packet);
            const framed=knowledgeRouter?.planFrame(text,packet,options);
            if(framed){
                clearSourceSlots();
                if(framed.knowledge?.focusEntityId)interpreter.focusSubject(framed.knowledge.focusEntityId,{...options,
                    guideOnly:framed.knowledge.context?.guideOnly,restrictions:framed.knowledge.context});
                else interpreter.resetTopic();
                return finish(turn,presentKnowledgeDefinition(framed,text,sourceRecords),{...packet,routeOrigin:'reviewed-knowledge'});
            }
            const decomposition = knowledgeRouter && sourceQuestionParts(packet.requestText || text);
            if (decomposition && !parseSequenceFieldRequest(text) && !parseDescriptiveReferenceRequest(text)
                && (decomposition.context && decomposition.singleContext || decomposition.questions.length > 1 || decomposition.tooMany)) {
                const compound = await sourceQuestions(turn, text, packet, options, decomposition);
                if (!current(turn)) return stale();
                clearSourceSlots();
                if(turn.preserveKnowledge){
                    interpreter.resetTopic();
                    if(turn.priorKnowledge?.focus)interpreter.focusSubject(turn.priorKnowledge.focus,{...options,restrictions:turn.priorKnowledge.restriction});
                }else if (compound?.knowledge?.focusEntityId) interpreter.focusSubject(compound.knowledge.focusEntityId, { ...options,
                    guideOnly: compound.knowledge.context?.guideOnly ?? packet.restrictions?.guideOnly,
                    restrictions: compound.knowledge.context });
                else interpreter.resetTopic();
                return finish(turn, compound, { ...packet, routeOrigin: 'reviewed-knowledge', sourceQuestions: decomposition.questions.map(question => question.question) });
            }
            let embedding;
            if (knowledgeRouter && typeof encode === 'function') {
                try { embedding = await untilAborted(encode(knowledgeRouter.embeddingText(text, packet), { signal: options.signal }), options.signal); }
                catch { /* The source engine and exact reviewed facets remain available offline on encoder failure. */ }
                if (!current(turn)) return stale();
            }
            const known = planSource(turn,text,packet,{...options,embedding});
            if (known) {
                clearSourceSlots();
                if(turn.preserveKnowledge)restoreAtomicSubject(turn,options);
                else if (known.knowledge?.focusEntityId) interpreter.focusSubject(known.knowledge.focusEntityId, { ...options,
                    guideOnly: known.knowledge.context?.guideOnly ?? packet.restrictions?.guideOnly,
                    restrictions: known.knowledge.context });
                else interpreter.resetTopic();
                return finish(turn, presentKnowledgeDefinition(known, text, sourceRecords), { ...packet, routeOrigin: 'reviewed-knowledge' });
            }
            if(knowledgeRouter && wholeSourceRequest(text))
                return unprovedCapability(turn,text,packet);
            const hasProvedSourceFrame = (() => {
                if (!knowledgeRouter) return false;
                const snap = knowledgeRouter.checkpoint();
                try { return knowledgeRouter.planFrame(text, packet, { ...options, embedding, afterSource: true, preferExisting: false })?.decision === 'answer'; }
                finally { knowledgeRouter.restore(snap); }
            })();
            const planned = (typedSourceRelation || hasProvedSourceFrame) ? null : consultation.plan(text, packet, { spoiler: 'direct' });
            if (planned) {
                clearSourceSlots();
                if (planned.focusEntityId) interpreter.focusSubject(planned.focusEntityId, { ...options, guideOnly: Boolean(planned.context?.guideOnly) });
                return finish(turn, { ...planned.reply, consultation: { context: planned.context, criterionId: planned.criterionId,
                    focusEntityId: planned.focusEntityId, reason: planned.reason, routeOrigin: planned.routeOrigin } }, packet);
            }
            if (packet.blockReplay) {
                clearSourceSlots();
                return finish(turn, result('clarify', packet.replayReason || 'Restate the subject and its restriction together so I can preserve the full question.'), packet);
            }
            if (packet.status === 'clarify' && packet.candidates?.length && packet.transition === 'pending-subject') {
                clearSourceSlots();
                const titles = [...new Set(packet.candidates.map(candidate => candidate.title))];
                return finish(turn, result('clarify', titles.length === 1
                    ? `Did you mean ${titles[0]}? Please confirm the subject.`
                    : `Which subject do you mean: ${titles.join(' or ')}?`), packet);
            }
            const query = packet.status === 'ready' && packet.canonicalQuestion ? packet.canonicalQuestion : packet.requestedText || packet.requestText || String(text);
            // One engine session handles all delegated turns. Its callbacks,
            // historical evidence, pending choices and model fallback survive.
            let reply;
            if (opts.expectedRevision !== undefined) options.expectedRevision = assistant.revision;
            engineCalls++;
            const sourceWork = Promise.resolve().then(() => current(turn)
                ? assistant.answerAsync ? assistant.answerAsync(query, options) : assistant.answer(query, options) : stale()).finally(() => { engineCalls--; });
            try { reply = await untilAborted(sourceWork, options.signal); }
            catch { reply = result('clarify', 'The local guide could not read that entry. Try naming the subject again.'); }
            if (!current(turn)) return stale();
            reply=knowledgeRouter?.guardReply(text,reply,packet) || reply;
            if(reply.decision!=='answer' && !reply.actions?.length && !reply.stateChanges?.length){
                const fallback=knowledgeRouter?.planFrame(text,packet,{...options,embedding,afterSource:true,preferExisting:false});
                if(fallback){
                    clearSourceSlots();
                    if(fallback.knowledge?.focusEntityId)interpreter.focusSubject(fallback.knowledge.focusEntityId,{...options,
                        guideOnly:fallback.knowledge.context?.guideOnly,restrictions:fallback.knowledge.context});
                    return finish(turn,presentKnowledgeDefinition(fallback,text,sourceRecords),{...packet,routeOrigin:'reviewed-knowledge'});
                }
            }
            if (packet.status === 'clarify' && packet.candidates?.length) {
                if (reply.decision === 'clarify' && reply.choices?.length) return finish(turn, reply, packet);
                clearSourceSlots();
                const titles = [...new Set(packet.candidates.map(candidate => candidate.title))];
                return finish(turn, result('clarify', titles.length === 1 ? `Did you mean ${titles[0]}? Please confirm the subject.`
                    : `Which subject do you mean: ${titles.join(' or ')}?`), packet);
            }
            if (reply.suggestedFrom) {
                const choices = [...new Map((reply.recordIds || []).flatMap(id => {
                    const record = sourceRecords.find(candidate => candidate.id === id), visible = record && authorize(record, 'direct');
                    return visible ? [[visible.entityId, { entityId: visible.entityId, title: visible.title }]] : [];
                })).values()];
                clearSourceSlots();
                if (choices.length) interpreter.setPending({ intent: packet.intent === 'unknown' || !packet.intent ? aliasIntent(parse(text).intent) : packet.intent,
                    entities: choices, originalText: String(text) });
                return finish(turn, result('clarify', choices.length === 1 ? `Did you mean ${choices[0].title}? Please confirm the subject.`
                    : 'Name the intended subject exactly before I answer.'), { ...packet, status: 'clarify', transition: 'pending-subject', candidates: choices });
            }
            const facet = reply.decision !== 'answer' && !reply.conflicts?.length ? sourceFacetReply(packet, sourceRecords, { spoiler: 'direct' }) : null;
            const candidate=facet || reply;
            const presented = presentSourceReply(knowledgeRouter?.guardReply(text,candidate,packet) || candidate, packet, sourceRecords, { spoiler: 'direct' });
            if (packet.status !== 'ready') groundEngineReply(reply, query, options, packet);
            return finish(turn, presented, packet);
        },
        activate(id) { switchContext(id); notify(); },
        resetTopic(id = active) {
            id = String(id || active); cancelTurn(); histories.delete(id); generation++; revision++;
            if (id === active) { interpreter.resetTopic(); consultation.reset(); knowledgeRouter?.reset(); lastPacket = null; contextSeedPending = false; }
            sourceCall(() => assistant.resetTopic(id)); notify();
        },
        resetSession() {
            cancelTurn(); histories.clear(); generation++; revision++; interpreter.resetSession(); consultation.reset(); knowledgeRouter?.reset(); lastPacket = null; contextSeedPending = false;
            sourceCall(() => assistant.resetSession()); notify();
        },
        setPolicy() { sourceCall(() => assistant.setPolicy('direct')); },
        getHistory(id = active) { return history(id).map(message => ({ ...message,
            choices: message.revision === revision ? (message.choices || []).map(choice => ({ ...choice })) : [],
            actions: message.revision === revision ? (message.actions || []).map(action => ({ ...action })) : [] })); },
        subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
        inspect() { return { ...assistant.inspect?.(), revision, conversation: { interpreter: interpreter.getState(), consultation: consultation.inspect(), knowledge: knowledgeRouter?.inspect(), lastPacket } }; },
        destroy() { cancelTurn(); destroyed = true; generation++; sourceUnsubscribe(); subscribers.clear(); },
        get revision() { return revision; },
        get policy() { return 'direct'; }
    };
    sourceCall(() => assistant.setPolicy('direct'));
    // Custom adapter methods/properties assigned after creation stay attached to
    // the original assistant (e.g. describeContext and preparation timings).
    return new Proxy(assistant, {
        get(target, key) {
            if (Reflect.has(api, key)) return Reflect.get(api, key, api);
            const value = Reflect.get(target, key, target); return typeof value === 'function' ? value.bind(target) : value;
        },
        set(target, key, value) { return Reflect.set(target, key, value, target); }
    });
}
