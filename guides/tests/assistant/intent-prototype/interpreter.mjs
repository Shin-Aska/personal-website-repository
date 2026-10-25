// Isolated dialogue experiment. The caller supplies model predictions; this
// module cannot answer facts, infer identity from embeddings, or update progress.
import { authorize, level, LEVELS } from '../../../js/assistant/policy.js';
import { normalize, resolveEntities, tokens, kindGroup, closeSpelling, isCommonWord } from '../../../js/assistant/retrieval.js';
import { parse, materialTerms, detectMethod } from '../../../js/assistant/language.js';

const SUPPORTED = new Set(['identity', 'location', 'use', 'acquisition', 'stats', 'combat', 'prerequisites', 'hint', 'why', 'comparison', 'overview']);
const aliasIntent = label => label === 'explanation' ? 'identity' : label;
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const templates = {
    location: title => `Where is ${title}?`,
    use: title => `What does ${title} do?`,
    acquisition: title => `How do I get ${title}?`,
    stats: title => `What are ${title} stats?`,
    combat: title => `How do I fight ${title}?`,
    prerequisites: title => `What do I need before ${title}?`,
    hint: title => `How do I complete ${title}?`
};
// These are rewrite eligibility checks, not an alternative intent classifier.
// A model-selected intent must fit an explicitly lossless simple request shape.
// Broader paraphrases remain available to the unchanged original-text engine.
const shapes = {
    identity: /^(?:(?:who|what)(?: is| are|'s)|tell me about|describe|explain) (?:the |a |an )?SUBJECT$|^(?:identify (?:the |a |an )?SUBJECT(?: for me)?|SUBJECT)$/,
    location: /^(?:where(?: is| are|'s)?|where (?:can|do) i find|where can i locate|(?:i am |i'm )?(?:looking|searching) for|find|locate|point me (?:towards?|to|in the direction of)) (?:the )?SUBJECT$|^(?:the )?SUBJECT(?: location| whereabouts)$/,
    use: /^(?:what (?:does|do|can) (?:the )?SUBJECT do|how (?:does|do) (?:the )?SUBJECT work|how (?:do|can) i (?:use|install|configure|set up) (?:the )?SUBJECT|what (?:is|are) (?:the )?SUBJECT (?:for|used for|good for)|(?:use|effect|effects|purpose) (?:of |for )?(?:the )?SUBJECT|(?:the )?SUBJECT(?:'s)? (?:use|effect|effects|purpose))$/,
    acquisition: /^(?:(?:(?:how|where) (?:do|can) i|how to) (?:get|obtain|acquire|download|buy|purchase|recruit|hire)|(?:get|obtain|acquire|download|buy|purchase|recruit|hire)) (?:the |a |an )?SUBJECT$|^(?:(?:download|buy|purchase|recruit|hire) )?(?:link|url) (?:for|of|to) (?:the )?SUBJECT$/,
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
    stats: 'stats stat statistics attributes numbers base starting initial',
    combat: 'weakness weaknesses tactics strategy combat',
    prerequisites: 'prerequisite prerequisites requirement requirements',
    hint: 'hint hints clue clues step steps next walkthrough guidance'
}).map(([intent, words]) => [intent, new Set(words.split(' '))]));
const FRAGMENT_FILL = new Set('the a an his her its their listed recorded stated available please'.split(' '));
function fragmentMatches(text, intent) {
    const vocabulary = FRAGMENT_WORDS[intent], words = tokens(text);
    return vocabulary && words.length > 0 && words.length <= 8 && words.some(word => vocabulary.has(word))
        && words.every(word => vocabulary.has(word) || FRAGMENT_FILL.has(word));
}
const EXACT_RELATIONS = { identity: 'identity', location: 'location', whereabouts: 'location', use: 'use', effects: 'use',
    installation: 'use', setup: 'use', download: 'acquisition', acquisition: 'acquisition', stats: 'stats', attributes: 'stats',
    weaknesses: 'combat', prerequisites: 'prerequisites', requirements: 'prerequisites', hint: 'hint' };
const bareFragment = core => normalize(core).replace(/^(?:and|also|then)\s+/, '').replace(/[?!.]+$/, '');
function requestFraming(text, gameId) {
    let q = normalize(text).replace(/[?!.]+$/, '');
    const currentGame = gameId === 'ultima7' ? '(?:ultima vii|ultima 7)' : '(?:starcraft brood war|starcraft)';
    q = q.replace(new RegExp(`\\s+in (?:(?:this|the current) (?:game|adventure)|${currentGame})$`), '');
    q = q.replace(/^(?:explain|tell me) (who|what) (.+) is$/, '$1 is $2')
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
    const masked = maskSubject(q, nameTerms);
    return {
        guideOnly: parts.some(part => part.guideOnly),
        editions: [...new Set([...parsed.editions, ...parts.flatMap(part => part.editions)])],
        negation: /\b(?:not|never|no|without|cannot|cant|wont|dont|doesnt|isnt|arent|wasnt|werent|havent|hasnt|hadnt|didnt|couldnt|wouldnt|shouldnt)\b|\b\w+n't\b/.test(masked),
        quantities: tokens(masked).filter(word => /\d/.test(word) || /^(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|many|much|few|several|all|every|both|either|neither|only|exactly)$/.test(word)),
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
    const hits = resolveEntities(text, list);
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
    if (!['ultima7', 'starcraft'].includes(gameId)) throw new Error('Intent prototype supports only ultima7 and starcraft.');
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
    const entity = (id, list) => list.find(record => record.entityId === id);
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
        frame = { entityId, intent: null, restrictions, method: null, requestedFormat: null };
        return true;
    }

    async function interpret(value, opts = {}) {
        const originalText = String(value ?? '');
        const nextContext = String(opts.contextId ?? 'default'), nextCeiling = level(opts.spoiler ?? 'direct');
        let transition = 'none';
        if (contextId !== null && contextId !== nextContext) { clear(); transition = 'context-change'; }
        if (LEVELS.indexOf(nextCeiling) < LEVELS.indexOf(ceiling)) { clear(); transition = 'spoiler-lowered'; }
        contextId = nextContext; ceiling = nextCeiling;
        const topicSwitch = originalText.match(/^\s*new topic\s*[:,-]\s*(\S[\s\S]*)$/i);
        if (topicSwitch) { clear(); transition = 'topic-change'; }
        const requestText = requestFraming(topicSwitch?.[1] || originalText, gameId);
        const list = visible();
        if (subject && !entity(subject.entityId, list)) { clear(); transition = 'subject-hidden'; }
        const parsed = parse(requestText, { names: names(list) });
        let intent = null, modelIntent = null, routeOrigin = 'model', score = null, margin = null;
        const packet = (status, reason, extra = {}) => ({ originalText, intent, entityId: null, entityTitle: null,
            modelIntent, routeOrigin, transition, status, confidence: { score, margin }, restrictions: restrictionsFor(requestText, parsed), reason, ...extra });
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
            try { predictions = await classify(topicSwitch?.[1] || originalText, { gameId, subject: previous && { ...previous }, previousIntent: previousFrame?.intent || null }); }
            catch {
                if (ticket !== revision) return packet('abstain', 'Stale classifier result discarded.', { transition: 'stale' });
                clear(); return packet('abstain', 'Classifier unavailable; use the original-text baseline.');
            }
            if (ticket !== revision) return packet('abstain', 'Stale classifier result discarded.', { transition: 'stale' });
            const ranked = Array.isArray(predictions) ? predictions.filter(p => typeof p?.label === 'string' && Number.isFinite(p.score)).sort((a, b) => b.score - a.score) : [];
            modelIntent = ranked[0]?.label || null;
            intent = aliasIntent(modelIntent) || null;
            score = ranked[0]?.score ?? null;
            margin = ranked.length > 1 ? ranked[0].score - ranked[1].score : null;
            const exactRelation = EXACT_RELATIONS[bareFragment(parsed.parts[0]?.core || '')];
            if (modelIntent === 'unknown' && exactRelation && !gates.abstainAll) {
                intent = exactRelation; routeOrigin = 'exact-relation';
            }
        }
        const acceptedIntent = !gates.abstainAll && SUPPORTED.has(intent) && score !== null && margin !== null
            && score >= gates.minScore && margin >= gates.minMargin;
        // A confirmed intent was already gated on its original turn. External
        // pending frames have no model score, but never override abstainAll.
        const mayInterpret = !gates.abstainAll && (confirmation || acceptedIntent || routeOrigin === 'exact-relation');
        const sourceText = confirmation ? waiting.originalText : originalText;
        const analysisText = confirmation ? requestFraming(sourceText, gameId) : requestText;
        const sourceParsed = confirmation ? parse(analysisText, { names: names(list) }) : parsed;
        const core = sourceParsed.parts[0]?.core || '';
        const fragment = bareFragment(core);
        const safeFragment = sourceParsed.parts.length === 1 && fragmentMatches(fragment, intent);
        const hits = safeFragment && previous ? [] : matchEntities(analysisText, list);
        let hit = confirmation ? hits.find(candidate => candidate.id === confirmation.entityId) : hits.length === 1 ? hits[0] : null;
        const record = confirmation ? entity(confirmation.entityId, list) : hit && entity(hit.id, list);
        let selected = record;
        if (!confirmation && hits.length === 1 && previous && hit.id !== previous.entityId
            && sourceParsed.parts.length === 1 && sourceParsed.parts[0].pronoun) {
            subject = null; frame = null; transition = 'ambiguous-subject';
            return packet('clarify', 'The message mentions a new visible subject and a previous pronoun subject; name one subject explicitly.');
        }
        if (!confirmation && hits.length > 1) {
            subject = null; frame = null; transition = 'ambiguous-subject';
            if (mayInterpret) pending = { intent, modelIntent, entities: hits.map(candidate => pendingEntity(entity(candidate.id, list))), originalText: topicSwitch?.[1] || originalText, contextId, spoiler: ceiling, confidence: { score, margin } };
            return packet('clarify', 'Several visible subjects match; name one.', { candidates: hits.map(candidate => pendingEntity(entity(candidate.id, list))) });
        }
        if (!confirmation && hit?.match === 'typo') {
            subject = null; frame = null;
            if (!mayInterpret) return packet('clarify', gates.abstainAll ? 'Threshold selection rejected all model intents.' : 'Intent needs clarification before a subject guess can be confirmed.');
            pending = { intent, modelIntent, entities: [pendingEntity(record)], originalText: topicSwitch?.[1] || originalText, contextId, spoiler: ceiling, confidence: { score, margin } };
            transition = 'pending-subject';
            return packet('clarify', 'Confirm the visible subject before interpreting its relationship.', { candidates: pending.entities.map(candidate => ({ ...candidate })) });
        }
        if (!selected && sourceParsed.parts.length === 1 && sourceParsed.parts[0].pronoun && previous) {
            // Entity linking is separate from rewriting. A clearly pronominal
            // subject can survive an unsupported predicate ("Why does he
            // matter?"). Unknown subject names cannot occupy that slot.
            const pronounShape = normalize(sourceParsed.parts[0].core).replace(/\b(?:it|its|he|him|his|she|her|they|them|their|there)\b/g, 'SUBJECT');
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
        const shape = maskSubject(normalize(core), hit?.queryTerms || []);
        const qualifier = intent === 'identity' ? (shape.match(/\b(job|occupation|profession|role)\b/)?.[1] || null)
            : intent === 'use' && /\b(?:installation|install|installing|setup|set up)\b/.test(shape) ? 'installation'
            : intent === 'use' && /\bconfigure\b/.test(shape) ? 'configuration'
            : intent === 'use' && safeFragment && /\b(?:instructions|procedure)\b/.test(shape) ? 'instructions'
            : intent === 'stats' ? shape.match(/\b(base|starting|initial)\b/)?.[1] || null : null;
        const qualifierShape = qualifier && /^(?:(?:what is|what's) (?:the )?SUBJECT(?:'s)? (?:job|occupation|profession|role)|(?:(?:his|her|its|their|the) |SUBJECT )?(?:job|occupation|profession|role))$/.test(shape);
        const simpleShape = shapes[intent]?.test(shape) || safeFragment || qualifierShape;
        let restrictions = restrictionsFor(analysisText, sourceParsed, hit);
        const requestWords = maskSubject(normalize(analysisText), hit?.queryTerms || []);
        const detectedMethod = intent === 'acquisition' ? detectMethod(requestWords) : null;
        const method = ['download', 'buy', 'recruit'].includes(detectedMethod) ? detectedMethod
            : intent === 'acquisition' && transition === 'subject-carried' ? previousFrame?.method || null : null;
        const requestedFormat = /\b(?:link|url)\b/.test(requestWords) || (intent === 'acquisition' && /\b(?:address|website)\b/.test(requestWords) && method === 'download') ? 'link'
            : transition === 'subject-carried' && intent === 'acquisition' ? previousFrame?.requestedFormat || null : null;
        if (intent === 'acquisition' && simpleShape && requestedFormat === 'link') restrictions.material = restrictions.material.filter(term => !['link', 'url'].includes(term));
        if (qualifierShape || (safeFragment && qualifier)) restrictions.material = restrictions.material.filter(term => term !== qualifier);
        if (safeFragment) restrictions.material = restrictions.material.filter(term => !FRAGMENT_WORDS[intent].has(term) && !FRAGMENT_FILL.has(term));
        if (detectedMethod && !['download', 'buy', 'recruit'].includes(detectedMethod)) restrictions.material.push(detectedMethod);
        // Normalize only vocabulary whose full safe shape was checked above.
        if (intent === 'prerequisites' && simpleShape) restrictions.material = restrictions.material.filter(term => term !== 'before');
        if (intent === 'identity' && simpleShape) restrictions.material = restrictions.material.filter(term => term !== 'identify');
        const currentConstraints = carriedConstraints(restrictions, analysisText);
        // Bind the whole current frame, never just the name, for pronouns and
        // ellipsis. Explicitly named questions establish a fresh request frame.
        if (transition === 'subject-carried') restrictions = mergeRestrictions(restrictions, previousFrame?.restrictions);
        // Grounding describes only which visible subject the message names.
        // It grants no fact permission and does not depend on the model label,
        // score gates, supported relation, or permission to canonicalize.
        const grounding = selected ? { entityId: selected.entityId, entityTitle: selected.title } : {};
        const inheritedBlocked = transition === 'subject-carried' && previousFrame && isRestricted(previousFrame.restrictions);
        const request = { ...grounding, ...(method ? { method } : {}), ...(requestedFormat ? { requestedFormat } : {}), ...(qualifier ? { qualifier } : {}),
            ...(inheritedBlocked ? { blockReplay: true, replayReason: 'This follow-up inherits a source, edition, negative, numeric, or material constraint. Restate the subject and constraint together; the bare fragment must not be replayed as an unrestricted request.' } : {}) };
        if (selected) {
            subject = pendingEntity(selected);
            frame = { entityId: selected.entityId, intent,
                restrictions: transition === 'subject-carried' ? mergeRestrictions(currentConstraints, previousFrame?.restrictions) : currentConstraints,
                method, requestedFormat };
            if (transition === 'none') transition = previous?.entityId === selected.entityId ? 'subject-retained' : 'subject-set';
        } else {
            subject = null; frame = null;
            if (transition === 'none') transition = 'subject-missing';
        }
        if (!mayInterpret) return packet('clarify', gates.abstainAll ? 'Threshold selection rejected all model intents.' : 'Intent needs clarification: unknown label or insufficient score separation.', { restrictions, ...request });
        if (!selected) {
            subject = null; frame = null; transition = 'subject-missing';
            return packet('clarify', 'Name one visible subject; no old subject was recovered.', { restrictions, ...request });
        }
        if (isRestricted(restrictions) || ['why', 'comparison', 'overview'].includes(intent)) {
            return packet('protected', 'Original wording must reach the baseline unchanged; rewriting would lose a restriction or unsupported relation.', { restrictions, ...request, ...(confirmation ? { originalText: sourceText, confirmationText: originalText, requestedText: sourceText } : {}) });
        }
        if (!simpleShape) {
            return packet('protected', 'This wording is outside the simple lossless rewrite shapes.', { restrictions, ...request, ...(confirmation ? { originalText: sourceText, confirmationText: originalText, requestedText: sourceText } : {}) });
        }
        const person = list.some(record => record.entityId === selected.entityId && kindGroup(record.subjectKind || record.kind) === 'person');
        const canonicalQuestion = intent === 'identity'
            ? qualifier ? `What is ${selected.title}'s ${qualifier}?` : `${person ? 'Who' : 'What'} is ${selected.title}?`
            : intent === 'use' && qualifier ? ({ installation: `How do I install ${selected.title}?`, configuration: `How do I configure ${selected.title}?`, instructions: `How do I use ${selected.title}?` })[qualifier]
            : intent === 'stats' && qualifier ? `What are ${selected.title} ${qualifier} stats?`
            : intent === 'acquisition' && method ? ({ download: `Where can I download ${selected.title}?`, buy: `How do I buy ${selected.title}?`, recruit: `How do I recruit ${selected.title}?` })[method]
            : templates[intent](selected.title);
        return packet('ready', 'Visible subject and simple request safely grounded; the engine still decides answer eligibility.', {
            ...request, restrictions, canonicalQuestion,
            ...(confirmation ? { requestedText: sourceText } : {})
        });
    }

    return { interpret, resetTopic: clear, resetSession() { clear(); contextId = null; ceiling = 'direct'; }, setPending, focusSubject, getState: snapshot };
}
