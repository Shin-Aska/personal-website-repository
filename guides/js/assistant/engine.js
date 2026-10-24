import { authorize, level, LEVELS } from './policy.js';
import { Index, distance, scrambled, kindGroup, isCommonWord, normalize, possessive, resolveEntities, similarity, tokens } from './retrieval.js';
import { Evidence, evaluate, UNKNOWN } from './rules.js';
import { modelRuntime } from './model-runtime.js';
import { buildTopicPacket } from './fallback-context.js';
import { guardPacket, finalizeGuarded } from './fallback-guard.js';

import { listGroup, listNoun, parse, materialTerms, detectIntent, detectMethod, MAX_PARTS, SCAFFOLD, COMPARISON_WORDS, GUIDE_SOURCE } from './language.js';
export { parse, materialTerms } from './language.js';

const PRONOUN_TOKEN = /^(?:it|its|it's|itself|that|this|he|she|him|her|his|they|them|their|there)$/;
const RESTRICTION = /\b(?:without|except|instead of|other than|not in|not at|only if|at least|at most|fewer than|more than)\b/;
// Words that restrict or rank rather than describe. A question containing
// them never gets descriptive suggestions, whose confirmation would drop them.
const RESTRICTIVE = /^(?:best|worst|better|worse|cheap\w*|expensive|strongest|weakest|most|least|first|last|only|free|not|no|never|none|without|except|fastest|slowest|earliest|latest|before|after|can't|cannot|don't|doesn't|isn't|won't|aren't)$/;
const NUMBER = /^\d+(?:[.-]\d+)*$/;
// "Did you mean…?" thresholds (Jaro-Winkler). A single suggestion needs a
// strong score and a clear lead; close runners-up become choices instead.
const SUGGEST_ONE = 0.88, SUGGEST_MARGIN = 0.04, SUGGEST_SOME = 0.85;
// Only proper names are suggested, never topic words ("death") or the long
// sentences that objectives and quests use as titles.
const UNSUGGESTED_KINDS = new Set(['topic', 'research', 'service', 'objective', 'quest', 'chapter', 'act', 'clue', 'interest', 'qa', 'cheat', 'fact', 'access', 'route', 'virtue']);
// Who is afflicted (or who joins whom) never restricts a cure or recruitment advice.
const PARTY_WORDS = new Set('avatar avatars companion companions party member members ally allies character characters friend friends teammate teammates follower followers hero mine myself us our ours we he she him her they them'.split(' '));
// "How do I <subject>?" where the subject names an action ("duplicate items").
const HOW_TO = /^(?:how (?:do|can|could|should|would|might) (?:i|we|you)|how to)$/;
// Text left after the subject's name and any edition phrase ("in Serpent Isle").
const remainder = (text, nameTerms, editions = []) => {
    const names = new Set([...nameTerms, ...editions].flatMap(term => tokens(term)).map(possessive));
    const words = tokens(text).map(possessive).filter(t => !names.has(t) && !['the', 'a', 'an'].includes(t));
    while (editions.length && ['in', 'on', 'for', 'with'].includes(words.at(-1))) words.pop();
    return words.join(' ');
};
const RELATION_LABELS = { location: 'location', acquisition: 'how to get it', use: 'use or effect',
    explanation: 'description', combat: 'combat', prerequisites: 'requirements', hint: 'hint',
    remedy: 'how to counter or cure it', comparison: 'pros and cons', sell: 'where to sell', stats: 'stats', advice: 'recruitment advice', 'spell-search': 'spell by effect', story: 'story relationship', narrative: 'sourced explanation' };
const NARRATIVE_LABELS = { identity: 'Identity', event: 'What happened', cause: 'Reason', method: 'Method',
    outcome: 'Outcome', sequence: 'What followed', relationship: 'Relationship', purpose: 'Purpose', summary: 'Summary' };
// Grammar is local to narrative matching. Action, negation, time, numbers and
// edition words never become global filler for the gameplay interpreter.
const NARRATIVE_GLUE = new Set('a an the to of at in on for from with by as into and is are was were be been being did do does has have had that this about happened happens happen happening'.split(' '));
const narrativeWord = word => /^(?:kill(?:ed|ing|ings|s)?|murder(?:ed|ing|s)?)$/.test(word) ? 'homicide'
    : ['left', 'leaving'].includes(word) ? 'leav' : stem(word).replace(/e$/, '');
const narrativeTerms = text => tokens(text).map(possessive).filter(word => !NARRATIVE_GLUE.has(word)).map(narrativeWord);
// A question naming both sides of an action must preserve that direction
// within one claim. Co-occurring names elsewhere in the account are not
// evidence of who acted on whom. Keep "by" to distinguish passive voice.
const NARRATIVE_HEDGES = new Set('likely apparently perhaps presumably possibly may might seems appears believed reportedly'.split(' '));
const narrativeActionTerms = text => tokens(text).map(possessive)
    .filter(word => word === 'by' || (!NARRATIVE_GLUE.has(word) && !NARRATIVE_HEDGES.has(word)))
    .map(narrativeWord);
const narrativeActionSupported = (query, record) => {
    const asked = narrativeActionTerms(query);
    return record.source.claims.some(claim => claim.text.split(/[.;:?!\n]/).some(clause => {
        const words = narrativeActionTerms(clause);
        return words.some((_, at) => asked.every((word, offset) => words[at + offset] === word));
    }));
};
// Why/how/relationship questions ask who acted on whom; the other facets
// ("What does the woman want?") are not relationship questions.
const NARRATIVE_MISSING = "I don't have a sourced answer to that relationship question in the available records.";
const NARRATIVE_MISSING_PLAIN = "I don't have a sourced answer to that question in the available records.";
const RELATIONAL_ASPECTS = new Set(['cause', 'method', 'relationship']);
const STORY_LABELS = { perpetrator: 'Perpetrator', suspect: 'Suspect', victim: 'Victim', leader: 'Leader', member: 'Member' };
const CRIME_WORDS = /\b(?:murder\w*|kill(?:ed|er|ers|ing|s)?|homicide)\b/i;
const GUIDE_STORY_SOURCE = GUIDE_SOURCE;
const phraseIn = (text, phrase) => (` ${tokens(text).map(possessive).join(' ')} `)
    .includes(` ${tokens(phrase).map(possessive).join(' ')} `);
const METHOD_LABELS = { buy: 'where to buy it', recruit: 'recruitment', download: 'download' };
// Deliberately the same whether or not the subject exists at a higher
// spoiler setting, so it never reveals hidden names.
const UNGROUNDED = 'I could not find that in this guide at the current help level. It may not be covered, or it may need a higher help level (Hint or Full answer); naming the subject differently can also help.';
// What the guide can tell about one subject, in the visitor's words. Built only from records visible at the ceiling.
const OFFERS = [['location', 'where it is'], ['acquisition', 'how to get it'], ['use', 'what it does'], ['explanation', 'what it is'],
    ['stats', 'its stats'], ['combat', 'how to beat it'], ['remedy', 'how to counter or cure it'], ['prerequisites', 'what it requires'],
    ['hint', 'a hint'], ['comparison', 'its pros and cons'], ['sell', 'where to sell it']];
const SHORT_LABEL = { location: 'Location', acquisition: 'How to get', use: 'Use', explanation: 'Description', stats: 'Stats', combat: 'Combat',
    remedy: 'Counter or cure', prerequisites: 'Requirements', hint: 'Hint', comparison: 'Pros and cons', sell: 'Where to sell' };
const LIST_KINDS = { companions: [['companion', 'character'], 'Companions and characters'], spells: [['spell'], 'Spells'],
    items: [['item', 'equipment'], 'Items and equipment'], creatures: [['enemy', 'bestiary', 'monster'], 'Creatures'],
    virtues: [['virtue'], 'Virtues'], shrines: [['shrine'], 'Shrines'], reagents: [['reagent'], 'Reagents'],
    shards: [['shard'], 'Shards'], chapters: [['chapter'], 'Chapters'], shops: [['shop'], 'Shops'],
    moves: [['combat'], 'Combat moves'], cheats: [['cheat'], 'Cheats'] };
const PLACE_KINDS = new Set(['place', 'location']);
const SUPERLATIVE = /\b(?:best|worst|strongest|weakest|fastest|slowest|easiest|hardest|cheapest|greatest|most (?:powerful|useful|\w+)|top)\b/;
const JUDGEMENT = /\b(?:worth(?: it| buying| getting| using| taking| having| picking| doing)?|any good|good idea|bad idea|really useful)\b/;
const WHAT = 'location, acquisition, use, stats, combat, a counter or cure, prerequisites, or a hint';
// Words that only point at the selected guide section in a generic hint request.
const CONTEXT_WORDS = new Set('chapter quest objective step section part area level mission map layer marker current selected'.split(' '));
// An adapter can declare that a fact also answers another relationship;
// relationships are never substituted otherwise.
// The one built-in equivalence: countering an enemy is its combat tactic.
const ENEMY_KINDS = new Set(['enemy', 'bestiary', 'monster']);
// Item statistics live in their use/effect records; a character's stats
// never come from anything but a stats record.
const PEOPLE_KINDS = new Set(['character', 'companion', 'npc']);
const isPerson = record => PEOPLE_KINDS.has(record.subjectKind || record.kind);
const relates = (record, intent) => record.relation === intent || record.answers?.includes(intent)
    || (intent === 'remedy' && record.relation === 'combat' && ENEMY_KINDS.has(record.kind))
    || (intent === 'stats' && !isPerson(record) && (record.relation === 'use' || record.answers?.includes('use')));
const stem = word => word.length > 4 ? word.replace(/(?:ies)$/, 'y').replace(/(?:ing|ed|es|s)$/, '').replace(/([b-df-hj-km-np-rt-z])\1$/, '$1') : word;
// An agent noun ("murderer") names the same thing as the guide's base word ("murder").
const agentBase = word => { const base = stem(word).replace(/(?:er|or)$/, ''); return base.length >= 5 && base !== stem(word) ? base : null; };
const hasWord = (set, term) => set.has(stem(term)) || (agentBase(term) !== null && set.has(agentBase(term)));
// Compared by stem so "companions" matches "companion".
const covers = (record, terms) => {
    const factTerms = new Set(tokens(record.text).map(possessive).map(stem));
    // Access records describe a code even when the authored answer names only its number and the source of the clue.
    if (record.kind === 'access') { factTerms.add('code'); factTerms.add('password'); }
    return terms.every(term => hasWord(factTerms, term));
};

// The visitor's own words for a misspelt name: the typo plus neighbouring words that belong to the same subject
// name ("Giant Boor" for Giant Boar), but never restrictions such as "Lord" in "Lord Jaana" for a plain Jaana.
function typedPhrase(text, word, nameWords) {
    const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const raw = tokens(text), original = text.match(/[\p{L}\p{N}]+(?:['.-][\p{L}\p{N}]+)*/gu) || [];
    const at = raw.indexOf(word), own = new Set(nameWords);
    if (at < 0 || raw.length !== original.length) return text.match(new RegExp(escape(word), 'i'))?.[0] || word;
    let low = at, high = at;
    while (low > 0 && own.has(raw[low - 1])) low--;
    while (high < raw.length - 1 && own.has(raw[high + 1])) high++;
    return text.match(new RegExp(original.slice(low, high + 1).map(escape).join('\\W+'), 'i'))?.[0] || word;
}
// Capability questions, and text that tries to change the assistant's rules or asks for things no guide covers.
const HELP = /^(?:help|help me|what can you do|what can i ask(?: you)?|what do you know|how do(?:es)? (?:this|you|it) work|how (?:do|can) i use (?:this|you)|who are you|what are you|what is this)$/;
const OFF_TOPIC = /\b(?:ignore|disregard|forget|override|bypass) (?:all |any |your |the |every )*(?:previous|prior|above|earlier|system|safety)? ?(?:instructions?|rules?|prompts?|guidelines?)\b|\b(?:system prompt|developer mode|jailbreak|you are now|pretend (?:to be|you are))\b|\b(?:tell me a joke|write (?:me )?(?:a|an) (?:poem|story|essay|song)|the weather|stock price|recipe for|capital of)\b/;
export function createAssistant({ gameId, records, getProgress, predicates = [], rules = [], editions = [], fallback = modelRuntime }) {
    if (!Array.isArray(records)) throw new TypeError('Assistant records must be an array.');
    const byId = new Map(records.map(r => [r.id, r]));
    if (byId.size !== records.length) throw new Error('Assistant record IDs must be unique.');
    const evidence = new Evidence(getProgress);
    const ruleMap = new Map(rules.map(r => [r.id, r.conflict ? null : r.requires]));
    const contexts = new Map(), subscribers = new Set();
    const predicateMap = new Map(predicates.map(p => [p.id, p]));
    for (const r of records) for (const [field, temporal] of
        [['completionFact', 'historical'], ['acquisitionFact', 'historical'], ['possessionFact', 'possession'], ['partyFact', 'party'], ['locationFact', 'location']]) {
        if (r[field] && !predicateMap.has(r[field]))
            predicateMap.set(r[field], { id: r[field], temporal, entityId: r.entityId || r.id });
    }
    // Editions this guide documents; any other named edition is unsupported.
    const knownEditions = [...new Set([...editions, ...records.flatMap(r => r.editions || [])].map(normalize))];
    let ceiling = 'gentle', revision = 0, active = 'default', visible, stories, narratives, index, names, nameGroups, vocabulary, rawText = '';
    function rebuild() {
        visible = records.map(r => authorize(r, ceiling)).filter(Boolean);
        // A typed organization role can supply its own source-grounded name
        // when an index title adds a label ("The Fellowship: people the atlas
        // lists"). Only context exactly naming that title prefix is an alias;
        // vessels, towns and other contextual names never become subjects.
        const bareName = text => tokens(text).filter(t => !['the', 'a', 'an'].includes(t)).join(' ');
        visible = visible.map(r => {
            if (!r.story || !['leader', 'member'].includes(r.story.role)) return r;
            const prefix = bareName(r.title.split(':')[0]);
            const aliases = r.story.context.filter(name => bareName(name) === prefix).map(bareName);
            return aliases.length ? { ...r, aliases: [...new Set([...r.aliases, ...aliases])] } : r;
        });
        stories = visible.filter(r => r.relation === 'story' && r.story);
        narratives = visible.filter(r => r.relation === 'narrative' && r.narrative);
        index = new Index(visible);
        // Words the visible guide text uses; such words are never treated as
        // misspelt names ("armor", "treasure", "magic").
        vocabulary = new Set(visible.flatMap(r => tokens(r.text)).map(possessive));
        // Names visible at this ceiling, for "did you mean" suggestions only.
        names = new Map(); nameGroups = new Map();
        for (const r of visible.filter(r => !['story', 'narrative'].includes(r.relation) && !UNSUGGESTED_KINDS.has(r.kind))) for (const name of [r.title, ...r.aliases]) {
            const value = tokens(name).join(' ');
            if (value) names.set(r.entityId, new Set([...(names.get(r.entityId) || []), value]));
            if (kindGroup(r.kind)) (nameGroups.get(r.entityId) || nameGroups.set(r.entityId, new Set()).get(r.entityId)).add(kindGroup(r.kind));
        }
    }
    rebuild();
    let holdNotifications = 0;
    function notify() { if (!holdNotifications) for (const fn of subscribers) fn(); }
    // Topic state: grounded subjects, one pending choice, the last answer and
    // the last requested relationships ("frame") for short follow-ups.
    function clearTopic(c) {
        c.fallbackMessages = [];
        c.entities = []; c.pending = null; c.lastAction = null; c.lastRecord = null;
        c.lastRecords = []; c.frame = null; c.recentSubjects = [];
    }
    function context(id = active) {
        if (!contexts.has(id)) {
            const c = { messages: [], lastLevel: null };
            clearTopic(c); contexts.set(id, c);
        }
        const c = contexts.get(id);
        contexts.delete(id); contexts.set(id, c);
        while (contexts.size > 8) contexts.delete(contexts.keys().next().value);
        return c;
    }
    function activate(id) {
        id = String(id || 'default');
        if (active !== id) {
            // A UI topic change must never inherit an old pronoun or choice.
            const old = contexts.get(active);
            if (old) clearTopic(old);
            active = id;
            const c = context(id);
            clearTopic(c);
            revision++;
        }
        return context(id);
    }
    function result(decision, text, extra = {}) {
        return { decision, text, recordIds: [], sources: [], actions: [], choices: [],
            stateChanges: [], revision, level: ceiling, ...extra };
    }
    const decline = (text = 'The local guide does not support that question. Name a supported item, character, location, or current objective.') => result('decline', text);
    // What the question's wording expects its subject to be ("who is" a person, "cast" a spell, "beat" a monster).
    const expectedGroup = (q, intent) => /\bwho(?:'s| is| are| was)?\b/.test(q) ? 'person' : /\b(?:cast|casting)\b/.test(q) ? 'spell'
        : intent === 'combat' ? 'monster' : /\b(?:get to|travel to|reach|go to|head to|route to)\b/.test(q) ? 'place' : null;
    const resolve = (text, opts, expect = null, intent = null, identity = false) => {
        const settings = { ignore: SCAFFOLD, vocabulary: nameFreeVocabulary(), known: knownWords(), expect };
        const found = resolveEntities(text, visible, opts.scope || opts.contextId, settings);
        const supports = r => relates(r, intent) && (!identity || r.identity !== false);
        // Page scope breaks identity ties, but cannot hide the same literal
        // subject's reference when only that reference answers the question.
        // Uncertain spellings still require their normal clarification.
        if (intent && found.length === 1 && found[0].match === 'exact' && !found[0].spacing) {
            const all = resolveEntities(text, visible, null, settings);
            if (all.every(m => m.match === 'exact' && !m.spacing)) {
                // An explicitly named item owns its facts even when its name
                // is also an alias on the open quest. Scope cannot turn an
                // item's use into that quest's general instructions.
                const named = all.filter(m => visible.some(r => r.entityId === m.id
                    && normalize(r.title) === normalize(m.alias) && supports(r)));
                if (named.length === 1) return named;
                if (!visible.some(r => r.entityId === found[0].id && supports(r))
                    && all.some(m => visible.some(r => r.entityId === m.id && supports(r)))) return all;
            }
        }
        return found;
    };
    const parseQuestion = (text, opts) => parse(text, { editions: knownEditions,
        names: resolve(text, opts).filter(hit => hit.match === 'exact').map(hit => hit.alias) });
    // The guide's words minus words that are themselves (parts of) names.
    let nameFree = null, nameFreeFor = null;
    const nameFreeVocabulary = () => {
        if (nameFreeFor !== visible) {
            nameFreeFor = visible;
            const nameWords = new Set(visible.flatMap(r => [r.title, ...r.aliases]).flatMap(n => tokens(n)).map(possessive));
            nameFree = new Set([...vocabulary].filter(w => !nameWords.has(w)));
        }
        return nameFree;
    };
    // The title of the record whose name was actually matched, so a subject is
    // never labelled with another record's safe placeholder title.
    const titleOf = (id, matchedName) => {
        const own = visible.filter(r => r.entityId === id);
        const named = matchedName && own.find(r => [r.title, ...r.aliases].some(n => tokens(n).join(' ') === matchedName));
        // A quest hint can share a person's entity ID while its title is an
        // instruction ("Recruit Sira after confronting Bradir"). Implicit
        // references need the authorized profile name, not that instruction.
        return (named || own.find(r => r.relation === 'explanation')
            || own.find(r => r.title && r.aliases.includes(r.title))
            || own.find(r => !['hint', 'story', 'narrative'].includes(r.relation)) || own[0])?.title;
    };
    // The page supplies an initial topic. A subject established in this
    // conversation takes precedence, even if it has no visible matching fact.
    const focusIds = (c, opts) => c.entities.length ? c.entities : opts.entityIds || [];
    const focusRecords = ids => visible.filter(r => ids.includes(r.entityId) || ids.includes(r.id));
    // An implicit question is read against the current topic. Say which one,
    // so a decline is not taken to mean the guide has nothing on the question.
    const topicNote = (c, opts) => {
        const ids = focusIds(c, opts);
        const title = ids.length === 1 ? titleOf(ids[0]) : null;
        return title ? ` I looked only at the current topic, ${title}. Name another subject or event, or reset the topic.` : '';
    };
    function rememberNamedSubject(query, opts, c) {
        const known = resolve(query, opts).filter(hit => hit.match === 'exact'
            && visible.some(r => r.entityId === hit.id && r.relation !== 'story'));
        if (known.length) {
            c.entities = [...new Set(known.map(hit => hit.id))];
            c.pending = null; c.lastRecord = null; c.lastRecords = [];
        }
        return known;
    }
    // Companion and character names, for "Iolo got charmed": the affected
    // person, not a restriction on the cure. Taken from every spoiler tier on
    // purpose: it only stops the visitor's own words counting as restrictions
    // in counter/cure questions and never matches, suggests or shows a record.
    const partyNameSet = new Set(records.filter(r => ['companion', 'character'].includes(r.kind))
        .map(r => r.title).flatMap(name => tokens(name)).map(possessive));
    const partyNames = () => partyNameSet;
    const pendingFresh = c => Boolean(c.pending && c.pending.revision === revision - 1);
    // A follow-up ("What about X?") repeats the earlier question for a new
    // subject, including its restrictions ("on Mars", editions, numbers).
    // Restrictions are carried only when the earlier subject was resolved, so
    // an unrecognised subject name is never mistaken for a restriction.
    const frameOf = parts => parts.filter(p => p.intent && p.intent !== 'unsupported')
        .map(({ intent, method, carry, story, narrative, guideOnly, identityRequest }) => ({ intent, method: method || null, carry: carry || null,
            ...(identityRequest ? { identityRequest: true } : {}),
            ...(guideOnly ? { guideOnly: true } : {}),
            ...(intent === 'story' && story ? { story: { ...story } } : {}),
            ...(intent === 'narrative' && narrative ? { narrative: { ...narrative } } : {}) })).slice(0, MAX_PARTS);
    const carryOf = (part, nameTerms, identity = new Set()) => {
        const inherited = part.inherited || {};
        const editionsHere = [...new Set([...part.editions, ...(inherited.editions || [])])];
        return {
            ...(part.guideOnly || inherited.guideOnly ? { guideOnly: true } : {}),
            extra: [...new Set([...materialTerms(part.q, nameTerms, editionsHere), ...(inherited.extra || [])])],
            editions: editionsHere,
            numbers: [...new Set([...tokens(part.q).filter(t => NUMBER.test(t) && !editionsHere.includes(t) && !identity.has(t)),
                ...(inherited.numbers || [])])]
        };
    };
    function choices(c, candidates, intent, frame = {}, text = 'Which of these do you mean?') {
        const options = [...new Map(candidates.map(r => [r.entityId, r])).values()].slice(0, 6);
        if (!options.length) return result('clarify', 'Which guide objective or named subject do you mean? Open its guide section or name it.');
        c.entities = frame.unconfirmedSubject ? [] : options.map(r => r.entityId);
        c.lastAction = null;
        c.lastRecord = null;
        c.lastRecords = [];
        c.pending = { intent, frame, ids: options.map(r => r.entityId), revision };
        return result('clarify', text, {
            choices: options.map(r => ({ id: r.entityId, label: r.title, revision }))
        });
    }
    function answerRecord(r, c, tone, prefix = '') {
        if (!r.source || !r.source.review) return decline('This entry has no reviewed source mapping yet.');
        if (r.conflict || r.source.review === 'conflicting') return result('decline',
            'The guide sources conflict on this subject. I cannot give a reliable answer or prerequisite from them.',
            { recordIds: [r.id], sources: [r.source] });
        const ruleResult = evaluate(r.requires, evidence, ruleMap);
        let suffix = '';
        if (r.relation === 'prerequisites') {
            if (r.requires === null) suffix = r.kind === 'setup' ? '' : '\nRequirements are not modeled here; checklist order is not a prerequisite.';
            else if (ruleResult.issues.length) suffix = '\nSome requirements cannot be resolved safely. Confirm them in the guide.';
            else if (ruleResult.value === UNKNOWN) suffix = '\nSome current requirements are unknown. Confirm the checks above before proceeding.';
            else if (ruleResult.value === false) suffix = '\nYour current reports do not satisfy these requirements.';
            else suffix = '\nYour reports satisfy the modeled requirements; other requirements may be unmodeled.';
        } else if (r.requires !== null && ruleResult.value !== true) {
            suffix = '\nTreat this as conditional: some modeled requirements are unmet or unknown.';
        }
        if (r.diagnostics.length) suffix += '\n' + r.diagnostics.slice(0, 2).map(d =>
            typeof d === 'string' ? d : [d.symptom, d.check, d.recovery].filter(Boolean).join(' ')).join('\n');
        const wrappers = { sage: 'The guide records: ', mystical: 'The guide records: ',
            genie: 'From the guide, traveler: ', pirate: 'The chart records: ', terminal: 'Guide entry: ',
            grumpy: 'Here is what the guide records: ', adjutant: 'Commander, the guide records: ',
            visionary: 'The guide offers this insight: ', cryptic: 'The guide leaves this clue: ', pragmatic: '',
            practical: '', direct: '', neutral: '', friendly: '' };
        c.lastRecord = r.id;
        c.lastRecords = [r.id];
        c.lastLevel = r.level;
        c.lastAction = r.completionFact ? { recordId: r.id, fact: r.completionFact } : null;
        c.entities = [r.entityId, ...c.entities.filter(id => id !== r.entityId)].slice(0, 6);
        // Outside research is never presented as the guide's own content.
        const outside = r.source.review === 'external-research' ? 'Not in this guide — from outside research: ' : '';
        // Tone wrappers say "the guide records", so research never gets one.
        return result('answer', prefix + outside + (outside ? '' : wrappers[tone] || '') + r.text + suffix, {
            recordIds: [r.id], sources: [r.source], actions: r.actions, level: r.level,
            rule: ruleResult, answerPrefix: prefix, answerSuffix: suffix, tone, title: r.title
        });
    }
    function correct(p, c, matched) {
        const q = p.q.replace(/^(?:(?:no|actually|correction|ok|okay|well|sorry|update)[,:]?\s+)+/, '').replace(/[.!]+$/, '').trim();
        let report;
        const patterns = [
            [/^i (?:have not|haven't|have never|did not|didn't) (?:complete|completed|finish|finished|do|done) (.+)$/, 'completionFact', 'historical', false],
            [/^i (?:already |now |just |finally )?(?:have (?:already )?)?(?:completed|finished|did|done) (.+)$/, 'completionFact', 'historical', true],
            [/^i (?:have not|haven't|have never) (?:got|obtained|acquired) (.+)$/, 'acquisitionFact', 'historical', false],
            [/^i (?:already |just |finally )?(?:have )?(?:got|obtained|acquired) (.+)$/, 'acquisitionFact', 'historical', true],
            [/^i (?:still |now |currently )?(?:don't have|do not have|no longer have|have no|have not|haven't|lost|have lost) (.+)$/, 'possessionFact', 'possession', false],
            [/^i (?:already |still |now |currently )?have (.+)$/, 'possessionFact', 'possession', true],
            [/^(.+) (?:isn't|is not|is no longer) (?:currently |now |still )?in my party$/, 'partyFact', 'party', false],
            [/^(.+) is (?:currently |now |still )?in my party$/, 'partyFact', 'party', true],
            [/^i(?:'m| am) (?:now |currently |still )?(?:at|in) (.+)$/, 'locationFact', 'location', true]
        ];
        for (const [pattern, field, temporal, value] of patterns) {
            const match = q.match(pattern);
            if (match) { report = { target: match[1].replace(/^the /, ''), field, temporal, value }; break; }
        }
        const clarifyReport = () => result('clarify', 'Please state one current fact or one completed objective, using its exact name. Compound or qualified reports do not change progress.');
        if (!report) return clarifyReport();
        let fact;
        const pronoun = /^(it|that|him|her|them)$/.test(report.target);
        if (pronoun && report.field === 'completionFact') {
            if (!c.lastAction) return result('clarify', 'Which exact objective did you complete? There is no single pending action.');
            fact = c.lastAction.fact;
        } else {
            // Match the entire report target. Negation, conditions and later
            // clauses must never spill into the named entity's truth value.
            const target = tokens(report.target).join(' ');
            const family = pronoun && c.entities.length === 1
                ? visible.filter(r => r.entityId === c.entities[0])
                : visible.filter(r => [r.title, ...r.aliases].some(alias => tokens(alias).join(' ') === target));
            const entityIds = [...new Set(family.map(r => r.entityId))];
            if (entityIds.length !== 1) return clarifyReport();
            const facts = [...new Set(visible.filter(r => r.entityId === entityIds[0]).map(r => r[report.field]).filter(Boolean))];
            if (facts.length !== 1) return result('clarify',
                'That kind of progress is not modeled unambiguously for this subject. You can edit its guide checkbox yourself; this report changed nothing.');
            fact = facts[0];
        }
        if (!predicateMap.has(fact)) return clarifyReport();
        if (report.temporal === 'location') for (const pred of predicateMap.values())
            if (pred.temporal === 'location' && pred.id !== fact) evidence.correct(pred.id, false, report.temporal);
        const change = evidence.correct(fact, report.value, report.temporal);
        for (const ctx of contexts.values()) { ctx.lastAction = null; ctx.pending = null; ctx.lastRecord = null; ctx.lastRecords = []; }
        return result('correction', `Understood. I will use your current report (${report.value ? 'yes' : 'no'}) for this session. Saved checkboxes are unchanged.`, { stateChanges: [change] });
    }
    // Generic "what next?" requests are grounded by the selected guide section.
    function contextual(intent, part, opts) {
        const words = materialTerms(part.q, [], part.editions).filter(t => !CONTEXT_WORDS.has(t));
        if (words.length || tokens(part.q).some(t => /^\d/.test(t))) return [];
        const requested = opts.entityIds || [];
        return visible.filter(r => r.relation === intent && (requested.includes(r.entityId) || requested.includes(r.id)
            || r.scope === (opts.scope || opts.contextId)));
    }
    function plainSectionHint(part) {
        const inherited = part.inherited;
        return !part.editions.length && !inherited?.extra?.length && !inherited?.editions?.length
            && !inherited?.numbers?.length && !tokens(part.q).some(t => NUMBER.test(t))
            && !materialTerms(part.q, [], part.editions).some(t => !CONTEXT_WORDS.has(t));
    }
    function checklistHint(candidates, c, opts) {
        const manifests = candidates.filter(r => r.checklist?.length);
        const section = manifests[0];
        if (!section || manifests.some(r => JSON.stringify(r.checklist) !== JSON.stringify(section.checklist))) return null;
        // Read one snapshot of actual checkbox reports. Session claims remain
        // useful evidence elsewhere, but do not turn an unticked box into done.
        let progress;
        try { progress = getProgress?.() || []; }
        catch { return result('clarify', 'I could not read the checklist progress. Open its guide section or name a subject for a hint.'); }
        if (!Array.isArray(progress)) return result('clarify', 'I could not read the checklist progress. Open its guide section or name a subject for a hint.');
        const checked = new Set(progress.filter(p => p?.value === true).map(p => p.id));
        const steps = section.checklist;
        const unfinished = steps.filter(step => !checked.has(step.completionFact));
        const count = `${steps.length - unfinished.length} of ${steps.length} done`;
        c.pending = null; c.lastRecord = null; c.lastRecords = []; c.lastAction = null; c.entities = [];
        if (!unfinished.length) return result('clarify',
            `All checklist steps here are ticked (${count}). Checkmarks are historical reports; name a subject if you still need a hint.`);
        // Resolve only through the authorized pool. A hidden or missing first
        // step gets the same fallback; never jump to a later visible step.
        const usable = step => visible.find(r => r.id === step.recordId && r.relation === 'hint'
            && r.completionFact === step.completionFact && (!opts.guideOnly || r.source?.review !== 'external-research'));
        const selected = usable(unfinished[0]);
        if (!selected) {
            if (section.completionFact) return result('clarify',
                'A step-specific hint is not available at this help level. Name a subject or use the guide section for a hint.');
            const reply = answerRecord(section, c, opts.tone,
                `Checklist here (${count}). A step-specific hint is not available at this help level. Section hint:\n`);
            c.lastAction = null;
            return reply;
        }
        const others = unfinished.slice(1).map(usable).filter(Boolean);
        const offered = [...new Map(others.map(r => [r.entityId, r])).values()]
            .map(r => ({ id: r.entityId, label: r.title, revision }));
        const reply = answerRecord(selected, c, opts.tone, `First unticked step here (${count}):\n`);
        c.entities = [selected.entityId];
        if (reply.decision !== 'answer') { c.pending = null; return reply; }
        // Chapter map controls belong to the open section. Keep those already
        // authorized actions when the quotation narrows to one checklist step.
        const sectionActions = section.completionFact ? [] : section.actions;
        const actions = [...new Map([...reply.actions, ...sectionActions].map(action => [action.id, action])).values()];
        if (offered.length) c.pending = { intent: 'hint', frame: { parts: [{ intent: 'hint', method: null }] },
            ids: offered.map(option => option.id), revision };
        return { ...reply, text: `${reply.text}\nChecklist order is not a prerequisite.`, choices: offered, actions,
            sources: sectionActions.length && section.id !== selected.id ? [...reply.sources, section.source] : reply.sources,
            // Choice labels share the selected ceiling, even if the quoted
            // step happens to reuse a lower-tier variant.
            level: offered.length || sectionActions.length ? ceiling : reply.level };
    }
    // Descriptive retrieval only proposes subjects whose authorised entry
    // contains every material word. Wording alone never answers: the visitor
    // must choose a subject, and the chosen fact then passes every check.
    function describe(terms, intent, guideOnly = false) {
        if (!terms.length || terms.length > 6 || terms.some(t => t.length < 3)) return [];
        const found = [];
        for (const { record, score } of index.search(terms.concat(terms.map(agentBase).filter(Boolean)).join(' '), r => !guideOnly || r.source?.review !== 'external-research')) {
            if (score <= 0 || found.length >= 4) break;
            if (found.includes(record.entityId) || record.kind === 'qa') continue;
            const words = new Set(tokens([record.title, ...record.aliases, record.text].join(' ')).map(stem));
            if (terms.every(t => hasWord(words, t)) && visible.some(r => r.entityId === record.entityId && relates(r, intent)))
                found.push(record.entityId);
        }
        return visible.filter(r => found.includes(r.entityId) && relates(r, intent) && (!guideOnly || r.source?.review !== 'external-research'))
            .sort((a, b) => found.indexOf(a.entityId) - found.indexOf(b.entityId));
    }
    // When no rule understood the question, the guide sentences visible at this
    // setting that share most of its words, shown as text to check, never as an
    // answer. Outside research, story roles and narrative facets are excluded,
    // and so is any question with a negation, ranking or other restriction,
    // because a partial match could not honour it.
    function closestText(part) {
        const q = part.q || '';
        if (RESTRICTION.test(q) || /\b(?:not|never|no|without|except|only)\b/.test(q)) return null;
        const words = [...new Set(materialTerms(q, [], part.editions || []).map(possessive))]
            .filter(w => w.length >= 3 && !NUMBER.test(w));
        // One remaining word is a name lookup, which the resolver already made.
        if (words.length < 2 || words.length > 8 || words.some(w => RESTRICTIVE.test(w))) return null;
        // A shared name is not evidence: "What do I need to enter Kenget
        // Kamulos?" must not surface another entry that merely names it. Each
        // sentence has to match a descriptive word of the question ("wear").
        // Names are short titles and aliases; a whole instruction used as an
        // objective title ("Drink the potion, cross …") is not a name.
        const nameWords = new Set(visible.flatMap(r => [r.title, ...r.aliases]).map(n => tokens(n))
            .filter(parts => parts.length <= 4).flat().map(possessive));
        const descriptive = words.filter(w => !nameWords.has(w));
        if (!descriptive.length) return null;
        const need = Math.max(2, Math.ceil(words.length * 0.6));
        const found = [], seen = new Set();
        const eligible = r => r.source?.review !== 'external-research' && !['story', 'narrative'].includes(r.relation) && r.kind !== 'research';
        for (const { record, score } of index.search(words.join(' '), eligible).slice(0, 40)) {
            if (score <= 0) break;
            for (const sentence of record.text.split(/\n|(?<=[.!?])\s+(?=[A-Z0-9“"'])/)) {
                const text = sentence.trim(), key = normalize(text);
                if (text.length < 12 || seen.has(key)) continue;
                const terms = new Set(tokens(text).map(possessive).map(stem));
                const hits = words.filter(w => hasWord(terms, w)).length;
                if (hits >= need && descriptive.some(w => hasWord(terms, w))) { seen.add(key); found.push({ record, text, hits, score }); }
            }
        }
        if (!found.length) return null;
        const best = found.sort((a, b) => b.hits - a.hits || b.score - a.score).slice(0, 3);
        return {
            text: `The closest guide text I found (it may not answer your question):\n${best.map(f =>
                normalize(f.text).startsWith(normalize(f.record.title)) ? `• ${f.text}` : `• ${f.record.title}: ${f.text}`).join('\n')}`,
            sources: [...new Map(best.map(f => [f.record.id, f.record.source])).values()],
            ids: [...new Set(best.map(f => f.record.id))]
        };
    }
    let knownCache = null, knownFor = null;
    const knownWords = () => {
        if (knownFor !== visible) { knownFor = visible; knownCache = new Set([...vocabulary, ...visibleNameWords()]); }
        return knownCache;
    };
    let nameWordCache = null, nameWordFor = null;
    const visibleNameWords = () => {
        if (nameWordFor !== visible) { nameWordFor = visible; nameWordCache = new Set(visible.flatMap(r => [r.title, ...r.aliases]).flatMap(n => tokens(n)).map(possessive)); }
        return nameWordCache;
    };
    // An unknown name close to exactly one visible name ("Toshixz" -> Toshi).
    function suggest(loose, part) {
        // The guess must account for every unknown word: "Darth Vader" is not
        // half-matched to something like "Darth".
        const words = loose.filter(t => !NUMBER.test(t) && !RESTRICTIVE.test(t));
        if (!words.length || words.length > 2 || words.some(w => w.length < 3) || words.join('').length < 4) return null;
        if (words.every(w => vocabulary.has(w))) return null;
        // Everyday English words are never a misspelt name ("tell me about many things").
        if (words.every(w => isCommonWord(w))) return null;
        if (words.length === 1 && visibleNameWords().has(words[0])) return null;
        const spans = [words];
        const best = new Map();
        for (const span of spans) {
            const text = span.join(' ');
            const expect = expectedGroup(part.q, part.intent);
            for (const [id, set] of names) for (const name of set) {
                // "Who is cube?" expects a person; a spell is not suggested for a short word.
                if (expect && nameGroups.get(id)?.size && !nameGroups.get(id).has(expect) && text.length < 7) continue;
                // Whole names, or one long word of a longer name ("Michel" -> Lord Michael).
                // Lengths must be comparable and word counts must agree, so a
                // restriction ("toshixz mars") is never absorbed into a name.
                // Same first letter, and at most ~30% of the letters differ.
                const comparable = (x, y) => scrambled(x, y) || x[0] === y[0] && Math.min(x.length, y.length) / Math.max(x.length, y.length) >= 0.6
                    && distance(x, y, 3) <= Math.max(1, Math.floor(Math.max(x.length, y.length) * 0.3));
                // Scrambled letters are a strong resemblance even when the edit distance is two.
                const likeness = (x, y) => scrambled(x, y) ? Math.max(similarity(x, y), 0.9) : similarity(x, y);
                let score = comparable(text, name) && name.split(' ').length >= span.length ? likeness(text, name) : 0, whole = score > 0;
                if (span.length === 1 && name.split(' ').length <= 3) for (const word of name.split(' '))
                    // A correctly spelt word of a longer name ("AN SANCT" vs Sanct Lor)
                    // is a different subject, not a misspelling.
                    if (word.length >= 5 && word !== text && comparable(text, word) && likeness(text, word) - 0.02 > score) {
                        score = likeness(text, word) - 0.02; whole = false;
                    }
                if (score > (best.get(id)?.score || 0)) best.set(id, { id, score, span, name, whole });
            }
        }
        const ranked = [...best.values()].filter(x => x.score >= SUGGEST_SOME).sort((a, b) => b.score - a.score).slice(0, 3);
        if (!ranked.length) return null;
        const typed = rawText.match(new RegExp(ranked[0].span.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\W+'), 'i'))?.[0] || ranked[0].span.join(' ');
        // Only a whole-name resemblance answers directly; a partial one is a choice.
        // Partial runners-up ("SCHNAIL Discord") do not block a clear whole-name match.
        const rival = ranked.slice(1).find(x => x.whole);
        const unique = ranked[0].whole && ranked[0].score >= SUGGEST_ONE && (!rival || ranked[0].score - rival.score >= SUGGEST_MARGIN);
        return { unique, ranked, typed };
    }
    // Answer one relationship about one subject. `subject` is an already
    // resolved subject (choice, "I meant X", "what about X").
    // A misspelt name that the conservative typo matcher resolved is
    // announced, so the visitor knows which subject was assumed.
    // The relationships this guide really has at the current ceiling, for menus that name no subject.
    const MENU_LABELS = [['location', 'location'], ['acquisition', 'acquisition'], ['use', 'use'], ['stats', 'stats'], ['combat', 'combat'],
        ['remedy', 'a counter or cure'], ['prerequisites', 'prerequisites'], ['hint', 'a hint']];
    const whatMenu = () => {
        const labels = MENU_LABELS.filter(([relation]) => visible.some(r => r.relation === relation || r.answers?.includes(relation))).map(([, label]) => label);
        return labels.length > 1 ? `${labels.slice(0, -1).join(', ')}, or ${labels.at(-1)}` : labels[0] || WHAT;
    };
    const helpReply = (lead = '') => result('clarify', `${lead}I answer questions from this guide's own text: where something is, how to get it, what it does, its stats, how to beat it, how to cure it, prerequisites and hints. Name a character, item, spell, monster or quest, for example “Where is …?” or “Tell me everything about …”. Ask “what spells are there?” for a list. I cannot chat freely or invent facts. Try: ${whatMenu()}.`);
    const offeredFor = (entityId, except) => {
        const own = visible.filter(r => r.entityId === entityId);
        const labels = OFFERS.filter(([relation]) => relation !== except && own.some(r => relation === 'stats' ? r.relation === 'stats' : relates(r, relation))).map(([, label]) => label);
        return labels.length ? labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(', ')} or ${labels.at(-1)}` : '';
    };
    // "What spell heals?": spells whose own entry states every effect word. Nothing is inferred from similar wording.
    function spellSearch(part, c) {
        const ignore = new Set(['spell', 'spells', 'magic', 'shard', 'shards']);
        const terms = materialTerms(part.q, [], part.editions).filter(term => !ignore.has(term));
        const pool = [...new Map(visible.filter(r => ['spell', 'shard'].includes(r.kind) && ['use', 'explanation'].includes(r.relation)).map(r => [r.entityId, r])).values()];
        if (SUPERLATIVE.test(part.q) || !terms.length) {
            const listed = listKind(part, c, listNoun(part.q) === 'shards' ? 'shards' : 'spells');
            return { ...listed, decision: 'clarify', text: `The guide does not rank spells; ask about an effect (for example “what spell heals?”). ${listed.text}` };
        }
        const found = pool.filter(r => visible.some(x => x.entityId === r.entityId && ['use', 'explanation'].includes(x.relation) && covers(x, terms)));
        if (!found.length) return decline(`No spell entry in this guide states “${terms.join(' ')}”. It lists spells by name: ask “what spells are there?”.`);
        if (found.length === 1) {
            const record = visible.find(x => x.entityId === found[0].entityId && ['use', 'explanation'].includes(x.relation) && covers(x, terms));
            return answerRecord(record, c, null, `${found[0].title}: `);
        }
        return choices(c, found.slice(0, 6), 'use', { parts: [{ intent: 'use' }] }, `${found.length} spell entries state that. Choose one for its description.`);
    }
    // "Tell me everything about X": each relationship the guide records for one subject, verbatim, one line per relationship.
    function overviewOf(entityId, c) {
        const own = visible.filter(r => r.entityId === entityId && r.kind !== 'research');
        const picked = OFFERS.map(([relation]) => [SHORT_LABEL[relation], own.find(r => r.relation === relation)]).filter(([, r]) => r);
        if (!picked.length) return decline('The local guide has nothing recorded for that subject at the selected help level.');
        const top = picked.reduce((high, [, r]) => LEVELS.indexOf(r.level) > LEVELS.indexOf(high) ? r.level : high, 'gentle');
        c.entities = [entityId]; c.lastRecord = null; c.lastRecords = picked.map(([, r]) => r.id); c.lastAction = null; c.pending = null;
        return result('answer', `Everything the guide records about ${titleOf(entityId)}:\n${picked.map(([label, r]) => `${label}: ${r.text}`).join('\n')}`, {
            recordIds: picked.map(([, r]) => r.id), sources: picked.map(([, r]) => r.source), level: top });
    }
    // "Who can join my party?": the titles of the guide's own entries of one kind, nothing more.
    function listKind(part, c, key = listGroup(part.q)) {
        const group = LIST_KINDS[key];
        const entries = group ? [...new Map(visible.filter(r => group[0].includes(r.kind) && r.title).map(r => [r.entityId, r])).values()] : [];
        if (!entries.length) return decline('The local guide has no list of that kind at the selected help level.');
        c.entities = []; c.lastRecord = null; c.lastRecords = []; c.lastAction = null; c.pending = null;
        const top = entries.reduce((high, r) => LEVELS.indexOf(r.level) > LEVELS.indexOf(high) ? r.level : high, 'gentle');
        const counted = /^how many\b/.test(part.core || part.q);
        return result('answer', counted ? `There are ${entries.length} ${group[1].toLowerCase()} in this guide: ${entries.map(r => r.title).join(', ')}.\nAsk about any of them by name.`
            : `${group[1]} in this guide (${entries.length}): ${entries.map(r => r.title).join(', ')}.\nAsk about any of them by name.`, {
            recordIds: entries.map(r => r.id), level: top,
            sources: [{ ...entries[0].source, locator: `${entries.length} entries: ${entries.slice(0, 3).map(r => r.title).join(', ')}…`,
                index: { file: 'guides/js/assistant/engine.js', locator: 'list of the guide entries of one kind', review: 'authored-index' } }] });
    }
    function respondPart(part, opts, c, shared = {}) {
        let reply = respondPartInner(part, opts, c, shared);
        // Nothing understood: offer the closest visible guide text, labelled,
        // after the usual reply. It is not an answer and records no subject.
        if (reply.decision === 'clarify' && !reply.choices.length && !shared.subject && !part.suggested
            && (reply.text === UNGROUNDED || /^What would you like to know\b/.test(reply.text))) {
            const near = closestText(part);
            if (near) reply = { ...reply, text: `${reply.text}\n\n${near.text}`, sources: near.sources, closest: near.ids, topicOnly: false };
        }
        // "Is it worth buying?" -- the guide records facts, never a verdict, so say so before them.
        if (reply.decision === 'answer' && part.generalLeft?.length)
            reply.text = `The guide does not answer “${part.generalLeft.join(' ')}” specifically. Its overall comparison of the options: ${reply.text}`;
        if (reply.decision === 'answer' && part.intent !== 'advice' && JUDGEMENT.test(part.q) && !reply.answerPrefix)
            reply.text = `The guide gives no verdict on whether that is worth it. What it records: ${reply.text}`;
        const typo = part.typo;
        delete part.typo;
        if (!typo || reply.suggestedFrom) return reply;
        const lead = `I don't know anything about “${typo.typed}”. Did you mean ${typo.title}?`;
        return { ...reply, text: reply.decision === 'answer' ? `${lead} If so: ${reply.text}` : `${lead} ${reply.text}`, suggestedFrom: typo.typed };
    }
    const narrativeScope = r => [r.entityId, r.narrative.aspect, r.narrative.subjects.map(normalize).sort().join(','),
        narrativeTerms(r.narrative.predicate || '').join(' '), r.narrative.sequenceMode || ''].join('|');
    function narrativeChoices(c, candidates, part) {
        const groups = [...new Map(candidates.map(r => [narrativeScope(r), r])).values()].slice(0, 6);
        c.entities = [...new Set(groups.map(r => r.entityId))];
        c.lastAction = null; c.lastRecord = null; c.lastRecords = [];
        c.pending = { intent: 'narrative', narrative: true, ids: groups.map(r => r.id), revision,
            frame: { parts: [{ intent: 'narrative', narrative: { ...part.narrative }, carry: part.carry }] } };
        return result('clarify', 'Which subject or event do you mean? Choose the account or action you want explained.', {
            choices: groups.map(r => ({ id: r.id,
                label: `${r.title} — ${r.narrative.subjects.join(', ')}: ${r.narrative.predicate || NARRATIVE_LABELS[r.narrative.aspect]}`,
                revision }))
        });
    }
    // One interpreter for reviewed narrative facets. It selects facts, never
    // generates a motive, inverse relationship, chronology or summary.
    function narrativeReply(part, opts, c, { subject = null } = {}) {
        if (!part.narrative || part.story) return null;
        // Older guides have reviewed full-question Q&A indexes. Their exact
        // authored questions remain usable without inventing a new facet.
        if (resolve(part.core, opts).some(hit => hit.match === 'exact' && normalize(hit.alias) === normalize(part.core)
            && visible.some(r => r.entityId === hit.id && r.kind === 'qa' && r.source.index?.review === 'authored-index')))
            return null;
        let request = { ...part.narrative }, query = request.query || '', scoped = false;
        let pairIds = null;
        if (request.pair) {
            if (subject) return result('clarify', 'Which two subjects do you mean? Name both so I can check their relationship.');
            pairIds = c.recentSubjects.filter(id => visible.some(record => record.entityId === id));
            if (pairIds.length !== 2) return result('clarify', 'Which two subjects do you mean? Name both so I can check their relationship.');
            query = pairIds.map(id => titleOf(id)).join(' and ');
            request = { ...request, query, contextual: false };
            part.inherited = c.frame?.parts?.length === 1 ? c.frame.parts[0].carry || null : null;
        } else if (request.contextual) {
            const previous = c.frame?.parts;
            if (previous?.length > 1) { part.intent = 'narrative'; return result('clarify', 'Which subject or event do you want explained?'); }
            const frame = previous?.[0], prior = frame?.narrative || frame?.story;
            if (prior) {
                query = prior.query || '';
                request = { ...request, query, guideOnly: request.guideOnly || prior.guideOnly,
                    predicateHint: prior.predicateHint || (frame.story?.crime ? 'killed' : undefined) };
                // Moving from an outcome to instructions (or vice versa)
                // asks a new facet of the subject. Its old predicate, such as
                // "restored", cannot constrain steps whose predicate is "ask".
                if (frame.narrative && ['sequence', 'outcome'].includes(request.aspect) && request.aspect !== prior.aspect)
                    request.predicateHint = undefined;
                part.inherited = frame.carry || null;
                // Facets of one established subject can have different names
                // (a chapter summary and its code sequence, for example).
                // Carry the grounded identity, not the old facet's title.
                // Story-role follow-ups still keep their named participants.
                if (frame.narrative && c.entities.length === 1
                    && visible.some(r => c.lastRecords.includes(r.id) && r.narrative && r.entityId === c.entities[0])) {
                    subject = { id: c.entities[0], queryTerms: [] };
                    query = ''; scoped = true;
                }
            } else if (c.entities.length === 1) { query = titleOf(c.entities[0]) || ''; scoped = Boolean(query); }
            else query = '';
        }
        // A spacing-only identity match is equally exact for narrative facets.
        // Replace only the matched name span, leaving every qualifier intact.
        for (const hit of resolve(query, opts).filter(hit => hit.spacing)) {
            const phrase = hit.queryTerms.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s&/]+');
            query = query.replace(new RegExp(`(^|[^\\p{L}\\p{N}])${phrase}(?=$|[^\\p{L}\\p{N}])`, 'gu'), (_, prefix) => prefix + hit.alias);
        }
        if (part.guideOnly || GUIDE_STORY_SOURCE.test(query)) request.guideOnly = true;
        query = query.replace(GUIDE_STORY_SOURCE, ' ').trim();
        const wording = part.core.replace(/^according to (?:(?:the|this|your) )?guide[, ]+/, '');
        if (/^(?:why (?:did|does|do)|how did)\b/.test(wording)) request.active = true;
        const roleName = query.match(/^(?:the )?(suspect|murderer|killer|victim|leader|member)\b/);
        if (roleName) {
            const role = ['murderer', 'killer'].includes(roleName[1]) ? 'perpetrator' : roleName[1];
            let named = stories.filter(r => r.story.role === role
                && (!request.guideOnly || r.source.review !== 'external-research'));
            const focus = focusIds(c, opts);
            if (focus.length) named = named.filter(r => focus.includes(r.entityId) || focus.includes(r.id));
            if (named.length === 1) {
                const names = named[0].story.people;
                const name = names.length === 1 ? names[0] : !names.length ? named[0].story.qualifier : null;
                if (name) query = query.replace(roleName[0], name);
            }
        }
        const personal = /\b(?:he|she|him|her|his|they|them|their)\b/.test(query);
        if (part.pronoun && tokens(query).some(t => PRONOUN_TOKEN.test(t))) {
            const subjects = [...new Set(visible.filter(r => c.lastRecords.includes(r.id) && r.narrative)
                .flatMap(r => r.narrative.subjects))];
            const refers = personal && subjects.length === 1 ? subjects
                : c.entities.length === 1 && (!personal || visible.some(r => r.entityId === c.entities[0] && isPerson(r)))
                    ? [titleOf(c.entities[0])] : [];
            if (refers.length !== 1 || !refers[0]) { part.intent = 'narrative'; return result('clarify', 'Which person, subject or event do you mean?'); }
            query = tokens(query).map(t => PRONOUN_TOKEN.test(t) ? refers[0] : t).join(' ');
        }
        part.narrative = { ...request, query, contextual: false };
        const identity = request.aspect === 'identity';
        const inherited = part.inherited || { extra: [], editions: [], numbers: [] };
        const editionsHere = [...new Set([...(part.editions || []), ...(inherited.editions || [])])];
        const extra = inherited.extra || [];
        const retainMissingRestrictions = () => {
            const named = resolve(query, opts).filter(hit => hit.match === 'exact');
            const qualifiedCurrent = c.entities.length === 1 && /^(?:on|in|at|for|without|before|after|only|not)\b/.test(query);
            if (named.length || scoped || part.pronoun || request.contextual || qualifiedCurrent)
                part.carry = carryOf({ ...part, q: query }, named.flatMap(hit => hit.queryTerms),
                    new Set(named.flatMap(hit => tokens(hit.alias))));
        };
        const unavailable = () => {
            part.intent = 'narrative';
            retainMissingRestrictions();
            const note = scoped ? topicNote(c, opts) : '';
            rememberNamedSubject(query, opts, c);
            return decline((RELATIONAL_ASPECTS.has(request.aspect) ? NARRATIVE_MISSING : NARRATIVE_MISSING_PLAIN) + note);
        };
        if (/\b(?:not|never|no|cannot|can't|didn't|doesn't|don't)\b/.test(query)
            || extra.some(t => /^(?:not|never|no)$/.test(t)) || RESTRICTION.test(part.q)) {
            if (identity) { retainMissingRestrictions(); return null; }
            return unavailable();
        }
        let pool = narratives.filter(r => r.narrative.aspect === request.aspect
            && (!request.guideOnly || r.source.review !== 'external-research')
            && (request.aspect !== 'sequence' || r.narrative.sequenceMode === (request.sequenceMode || 'events')));
        // Existing authored relative-name aliases (for example a spouse's
        // profile) remain valid. A plain person's name cannot grant this
        // fallback or infer a new family relationship.
        if (!pool.length && request.directed && resolve(part.core, opts).some(hit => hit.match === 'exact'
            && narrativeTerms(request.target || '').every(t => narrativeTerms(hit.alias).includes(t))
            && narrativeTerms(request.predicate || '').every(t => narrativeTerms(hit.alias).includes(t)))) return null;
        if (request.selectedId) {
            const selected = pool.find(r => r.id === request.selectedId);
            pool = selected ? pool.filter(r => narrativeScope(r) === narrativeScope(selected)) : [];
        }
        const people = [...new Set(visible.filter(r => isPerson(r) && !['story', 'narrative'].includes(r.relation))
            .flatMap(r => [r.title, ...r.aliases]))];
        const namedPeople = people.filter(name => phraseIn(query, name));
        // In an explicit sequence request, "after" is the temporal operator.
        // Its anchor is checked against a source clause below; the source may
        // express the same order with "then" rather than the word "after".
        const afterSequence = request.aspect === 'sequence' && /^after\b/.test(query);
        const rawTerms = narrativeTerms(query).filter(term => !afterSequence || term !== 'after');
        const inheritedNumbers = inherited.numbers || [];
        const fitting = pool.flatMap(record => {
            const meta = record.narrative;
            const focusNames = [...meta.subjects, record.title, ...record.aliases];
            const connected = [...meta.subjects, ...meta.context];
            const personName = name => normalize(name).replace(/^the /, '');
            if (namedPeople.some(name => !connected.some(other => personName(other) === personName(name))
                && !focusNames.some(other => personName(other) === personName(name)))) return [];
            // Asking why/how A killed B cannot turn a victim's causal fact
            // into evidence that the victim killed somebody else. Require
            // that direction in an authorized role or the source sentence.
            if (request.active && rawTerms.includes('homicide')) {
                const words = tokens(query), at = words.findIndex(word => narrativeWord(word) === 'homicide');
                const actors = connected.filter(name => phraseIn(words.slice(0, at).join(' '), name));
                const targets = connected.filter(name => phraseIn(words.slice(at + 1).join(' '), name));
                if (!actors.length || !targets.length || !actors.some(actor => targets.some(target =>
                    stories.some(r => r.story.role === 'perpetrator'
                        && r.story.people.some(name => normalize(name) === normalize(actor))
                        && r.story.context.some(name => normalize(name) === normalize(target)))
                    || [`${actor} killed ${target}`, `${actor} murdered ${target}`,
                        `${target} was killed by ${actor}`, `${target} was murdered by ${actor}`]
                        .some(phrase => phraseIn(record.text, phrase))))) return [];
            }
            const focusHits = focusNames.filter(name => phraseIn(query, name));
            const connectedHits = connected.filter(name => phraseIn(query, name));
            if (['cause', 'method', 'outcome'].includes(request.aspect)
                && new Set(connectedHits.map(normalize)).size >= 2
                && !narrativeActionSupported(query, record)) return [];
            const temporalAnchor = request.aspect === 'sequence' && /^after\b/.test(query) && connectedHits.length;
            const outcomeAction = request.aspect === 'outcome' && connectedHits.length && meta.predicate
                && narrativeTerms(meta.predicate).some(t => rawTerms.includes(t));
            // The consequence is not the action whose outcome was asked for.
            // A long quest title can contain both sides; matching just a word
            // from that title must not turn the consequence into its cause.
            if (request.aspect === 'outcome' && connectedHits.length
                && !meta.subjects.some(name => phraseIn(query, name))
                && ![record.title, ...record.aliases].some(name => phraseIn(query, name))
                && !outcomeAction) return [];
            const directed = request.directed && meta.context.some(name => phraseIn(request.target || '', name));
            if (request.directed && !directed) return [];
            if (request.directed && connected.some(name => phraseIn(request.target || '', name)
                && !meta.context.some(target => normalize(target) === normalize(name)))) return [];
            if (request.aspect === 'relationship' && !request.directed
                && new Set(connectedHits.map(normalize)).size < 2) return [];
            const focusWords = new Set(focusNames.flatMap(narrativeTerms));
            const fragments = !request.directed && ['event', 'outcome', 'summary'].includes(request.aspect)
                ? rawTerms.filter(t => focusWords.has(t)) : [];
            if (rawTerms.length && !focusHits.length && !fragments.length && !directed && !temporalAnchor && !outcomeAction) return [];
            if (subject && record.entityId !== subject.id
                && !visible.filter(r => r.entityId === subject.id).some(r => connected.some(name => normalize(name) === normalize(r.title)))) return [];
            const names = new Set([...focusHits, ...connectedHits].flatMap(narrativeTerms).concat(fragments));
            const remaining = [...new Set([...rawTerms.filter(t => !names.has(t)), ...extra])];
            const predicate = narrativeTerms(meta.predicate || '').filter(t => !connected.flatMap(narrativeTerms).includes(t));
            const askedPredicate = request.directed ? narrativeTerms(request.predicate || '')
                : request.predicateHint ? narrativeTerms(request.predicateHint) : remaining;
            if (meta.predicate && !(request.aspect === 'sequence' && /^after\b/.test(query))
                && askedPredicate.length && !predicate.some(t => askedPredicate.includes(t))
                && !narrativeTerms(meta.predicate).some(t => rawTerms.includes(t))) return [];
            const words = new Set(narrativeTerms(record.text));
            if (!remaining.every(t => words.has(t))) return [];
            if (request.aspect === 'sequence' && /^after\b/.test(query)) {
                // An explicit "after X" names the preceding event. A later
                // action containing the same names cannot be that anchor.
                const asked = narrativeTerms(query.replace(/^after\s+/, ''));
                const text = normalize(record.text);
                const anchors = [...text.matchAll(/\b(?:after|following|once|when)\s+([^,.;]+)/g)].map(m => m[1]);
                for (const match of text.matchAll(/\b(?:then|later|subsequently|next)\b/g)) anchors.push(text.slice(0, match.index));
                if (!anchors.some(anchor => {
                    const terms = new Set(narrativeTerms(anchor));
                    return asked.every(t => terms.has(t));
                })) return [];
            }
            // A numbered subject ("Chapter 2") is an authorized index name,
            // not a request for a numeric fact inside its summary. Additional
            // numbers still have to occur in the sourced answer.
            const nameNumbers = new Set(focusHits.flatMap(tokens).filter(t => NUMBER.test(t)));
            const numbers = [...new Set([...tokens(query).filter(t => NUMBER.test(t) && !nameNumbers.has(t)), ...inheritedNumbers])];
            if (numbers.some(t => !tokens(record.text).includes(t))) return [];
            if (editionsHere.some(edition => !(record.editions.length ? record.editions : editions)
                .some(known => normalize(known) === edition))) return [];
            const needsScope = request.aspect === 'purpose' && ['quest', 'objective', 'chapter'].includes(record.kind)
                && !request.selectedId && !meta.context.some(name => phraseIn(query, name))
                && ![record.title, ...record.aliases].some(name => phraseIn(query, name))
                && !focusIds(c, opts).some(id => id === record.id || id === record.entityId);
            return [{ record, needsScope, specificity: focusHits.length + fragments.length,
                remaining: remaining.filter(t => !predicate.includes(t)), numbers }];
        });
        if (!fitting.length) {
            if (identity) { retainMissingRestrictions(); return null; }
            return unavailable();
        }
        part.intent = 'narrative';
        part.carry = { extra: [...new Set(fitting.flatMap(f => f.remaining))], editions: editionsHere,
            numbers: [...new Set(fitting.flatMap(f => f.numbers))] };
        // A fact may have two reviewed entry points (a vessel and an event).
        // Identical sourced text is one account; use its best-named focus.
        const accounts = new Map();
        for (const found of fitting) {
            const r = found.record, key = JSON.stringify([r.text, { ...r.source, index: undefined }, r.level, r.narrative.aspect,
                r.narrative.status, r.narrative.sequenceMode]);
            if (!accounts.has(key) || accounts.get(key).specificity < found.specificity) accounts.set(key, found);
        }
        let candidates = [...accounts.values()].map(f => f.record);
        if (!rawTerms.length && !subject && !request.selectedId) {
            if (c.entities.length > 1) return result('clarify', 'Which person, subject or event do you mean?');
            const ids = focusIds(c, opts), focus = focusRecords(ids);
            // "Why?" after "Who killed whom?" covers every person that answer
            // named, so one victim's reason never stands in for the others.
            const named = new Set(visible.filter(r => c.lastRecords.includes(r.id) && r.story)
                .flatMap(r => r.story.people).map(normalize));
            if (ids.length) {
                scoped = true;
                candidates = candidates.filter(r => focus.some(f => f.entityId === r.entityId
                    || r.narrative.subjects.some(name => normalize(name) === normalize(f.title)))
                    || r.narrative.subjects.some(name => named.has(normalize(name))));
            }
        }
        if (!candidates.length) return unavailable();
        if (fitting.some(f => f.needsScope)) return narrativeChoices(c, candidates, part);
        if (new Set(candidates.map(narrativeScope)).size > 1) return narrativeChoices(c, candidates, part);
        // Disagreements are authored as one facet containing all accounts.
        // Otherwise prefer guide evidence only within this exact facet scope.
        const disputed = candidates.filter(r => r.narrative.status === 'disputed');
        candidates = disputed.length ? disputed : candidates.some(r => r.source.review !== 'external-research')
            ? candidates.filter(r => r.source.review !== 'external-research') : candidates;
        const replies = [], rendered = [];
        for (const record of candidates) {
            const lead = record.narrative.status === 'disputed'
                ? 'The sources give different accounts; no single explanation is established here.\n'
                : record.narrative.status === 'hedged' ? 'The source gives a tentative account:\n' : '';
            const claims = record.narrative.status === 'disputed' ? record.source.claims : [{ text: record.text, source: record.source }];
            const blocks = claims.map(claim => {
                const reply = answerRecord({ ...record, text: claim.text,
                    source: { ...claim.source, index: record.source.index,
                        claims: claim.source.claims || [{ text: claim.text, source: claim.source }] } }, c, opts.tone);
                replies.push(reply);
                const label = record.narrative.status === 'disputed'
                    ? `${(claim.source.references || []).map(ref => ref.label).join('; ')}:\n` : '';
                return label + reply.text;
            });
            record.narrative.sequenceMode === 'steps' && blocks.unshift("In the guide's steps:");
            rendered.push(lead + blocks.join('\n\n'));
        }
        const failure = replies.find(reply => reply.decision !== 'answer');
        if (failure) { c.lastRecords = []; c.lastRecord = null; return failure; }
        const ids = [...new Set(replies.flatMap(reply => reply.recordIds))];
        const top = LEVELS[Math.max(...replies.map(reply => LEVELS.indexOf(reply.level)))];
        const first = candidates[0];
        part.narrative.predicateHint = first.narrative.predicate || request.predicateHint;
        if (!pairIds && request.aspect === 'relationship' && !request.directed) {
            const asked = resolve(query, opts).filter(hit => hit.match === 'exact');
            if (asked.length === 2) pairIds = asked.map(hit => hit.id);
        }
        c.entities = pairIds || [first.entityId]; c.pending = null; c.lastAction = null;
        c.lastRecords = ids; c.lastRecord = ids.length === 1 ? ids[0] : null; c.lastLevel = top;
        return result('answer', `${first.title} — ${NARRATIVE_LABELS[request.aspect]}:\n`
            + [...new Set(rendered)].join('\n\n'), {
            recordIds: ids, sources: replies.flatMap(reply => reply.sources), actions: [], level: top, title: first.title
        });
    }
    // Story roles are authored relationships, never guesses from co-occurring
    // names. Only the metadata copied by authorize() participates here.
    function storyReply(part, opts, c, { subject = null } = {}) {
        if (!part.story) return null;
        const { role, crime, personTarget } = part.story;
        // Source restrictions are part of the conversation frame, including
        // short follow-ups. A research note cannot satisfy a guide-only ask.
        if (part.guideOnly || GUIDE_STORY_SOURCE.test(part.story.query || '')) part.story = { ...part.story, guideOnly: true };
        // Missing and spoiler-hidden relationships use the same wording. A
        // visible identity may be acknowledged, but it never promises that
        // rephrasing or raising the spoiler setting will supply the fact.
        const unavailable = () => {
            // A visible named subject remains current even if the requested
            // relationship is missing. This uses only authorized exact names.
            const known = rememberNamedSubject(part.story.query || '', opts, c);
            const title = known.length === 1 ? titleOf(known[0].id) : null;
            return `${title ? `I found the entry for ${title}, but I don't have` : "I don't have"} a sourced answer to that relationship question in the available records.`;
        };
        const organization = ['leader', 'member'].includes(role);
        const sameFamily = record => ['leader', 'member'].includes(record.story.role) === organization;
        if (!stories.some(sameFamily)) {
            if (role === 'member') return null;
            part.intent = 'story';
            const known = resolve(part.story.query || '', opts);
            if (known.length === 1) part.carry = carryOf({ ...part, q: part.story.query }, known[0].queryTerms);
            return result('clarify', unavailable());
        }
        let query = (part.story.query || '').replace(GUIDE_STORY_SOURCE, ' ').trim();
        const implicit = !materialTerms(query, [], part.editions).length && !tokens(query).some(t => NUMBER.test(t));
        const previous = !subject && implicit && c.frame?.parts.length === 1 ? c.frame.parts[0] : null;
        // A subjectless follow-up keeps the source and material restrictions
        // of the conversation it reuses; a stale page cannot erase them.
        if ((previous?.story || previous?.narrative)?.guideOnly) part.story = { ...part.story, guideOnly: true };
        const inherited = part.inherited || previous?.carry || { extra: [], editions: [], numbers: [] };
        const extra = inherited.extra || [], inheritedNumbers = inherited.numbers || [];
        const editionsHere = [...new Set([...(part.editions || []), ...(inherited.editions || [])])];
        // A negative relationship needs its own model; the presence of a word
        // such as "not" somewhere in a sentence cannot establish it.
        if (/\b(?:not|never|no|cannot|can't|didn't|doesn't|don't)\b/.test(query) || extra.some(t => /^(?:not|never|no)$/.test(t))) {
            part.intent = 'story';
            part.carry = { extra: ['not', ...extra], editions: editionsHere, numbers: inheritedNumbers };
            return decline('The guide does not establish that negative story relationship.');
        }
        if (tokens(query).some(t => PRONOUN_TOKEN.test(t))) {
            const personal = /\b(?:he|she|him|her|his|they|them|their)\b/.test(query);
            let referents;
            if (personal) {
                referents = [...new Set(visible.filter(r => c.lastRecords.includes(r.id) && r.story).flatMap(r => r.story.people))];
                if (!referents.length && c.entities.length === 1 && visible.some(r => r.entityId === c.entities[0] && isPerson(r)))
                    referents = [titleOf(c.entities[0])];
            } else referents = c.entities.length === 1 ? [titleOf(c.entities[0])] : [];
            if (referents.length !== 1 || !referents[0]) return result('clarify', 'Which person or event do you mean?');
            query = tokens(query).map(t => PRONOUN_TOKEN.test(t) ? referents[0] : t).join(' ');
        }
        const roles = role === 'participants' ? ['perpetrator', 'victim', 'suspect']
            : role === 'perpetrator' ? ['perpetrator', 'suspect'] : [role];
        let pool = stories.filter(r => roles.includes(r.story.role)
            && (!part.story.guideOnly || r.source.review !== 'external-research')
            && (!crime || CRIME_WORDS.test([r.title, ...r.aliases, r.text, r.story.qualifier || ''].join(' '))));
        if (subject) pool = pool.filter(r => r.entityId === subject.id);

        const queryTerms = materialTerms(query, [], editionsHere);
        const queryNumbers = tokens(query).filter(t => NUMBER.test(t) && !editionsHere.some(e => tokens(e).includes(t)));
        // A typed person is a target only when the author explicitly indexed
        // that direction in context. Its occurrence in people never reverses
        // a killer/victim, leader/member, or suspect relationship.
        const personNames = [...new Set([...stories.flatMap(r => r.story.people),
            ...visible.filter(r => isPerson(r)).flatMap(r => [r.title, ...r.aliases])])];
        const peopleNamed = personNames.filter(name => phraseIn(query, name));
        const recognized = [];
        const fitting = pool.map(record => {
            const eventNames = [record.title, ...record.aliases];
            const contextNames = record.story.context;
            const eventHits = eventNames.filter(name => phraseIn(query, name));
            if (peopleNamed.some(name => (personTarget || !eventHits.some(eventName => phraseIn(eventName, name)))
                && !contextNames.some(contextName => phraseIn(contextName, name)))) return null;
            const contextHits = contextNames.filter(name => phraseIn(query, name));
            // An otherwise unprofiled target can still be explicit in the
            // indexed sentence ("an unnamed attacker killed Vela"). This
            // checks only the requested authored role, not an inverse role.
            // General vessel/place context such as "aboard the Crown Jewel"
            // cannot satisfy the directed predicate.
            const directed = contextHits.some(name => (role === 'perpetrator'
                ? [`killed ${name}`, `murdered ${name}`, `${name} was killed by`, `${name} was murdered by`]
                : role === 'victim' ? [`${name} killed`, `${name} murdered`, `killed by ${name}`, `murdered by ${name}`] : [])
                .some(phrase => phraseIn(record.text, phrase)));
            if (personTarget && !peopleNamed.length && !directed) return null;
            const eventWords = new Set(eventNames.flatMap(name => tokens(name).map(possessive)));
            const named = [...contextHits, ...eventHits].flatMap(name => tokens(name).map(possessive));
            // A town may be a fragment of a source's event title ("in
            // Trinsic" -> "The Trinsic Murders"). It remains subject evidence,
            // never an invented location or an association with a person.
            const fragments = queryTerms.filter(term => eventWords.has(term));
            if (queryTerms.length && !contextHits.length && !eventHits.length && !fragments.length) return null;
            const nameTerms = [...named, ...fragments];
            const remaining = [...new Set([...materialTerms(query, nameTerms, editionsHere), ...extra])];
            const numbers = [...new Set([...queryNumbers.filter(n => !nameTerms.includes(n)), ...inheritedNumbers])];
            recognized.push({ remaining, numbers });
            if (!covers(record, remaining) || numbers.some(n => !tokens(record.text).includes(n))) return null;
            if (editionsHere.some(edition => !(record.editions.length ? record.editions : editions)
                .some(known => normalize(known) === edition))) return null;
            return { record, nameTerms, remaining, numbers };
        }).filter(Boolean);
        if (recognized.length) part.carry = { extra: [...new Set(recognized.flatMap(f => f.remaining))], editions: editionsHere,
            numbers: [...new Set(recognized.flatMap(f => f.numbers))] };
        if (!fitting.length) {
            if (personTarget) { part.intent = 'story'; return decline(unavailable()); }
            // Existing authored Q&A indexes remain useful for organizations
            // that have not yet acquired a typed role record.
            const legacy = resolve(part.core, opts);
            if (role === 'member' && legacy.some(hit => visible.some(r => r.entityId === hit.id && r.kind === 'qa' && r.relation === 'explanation')))
                return null;
            part.intent = 'story';
            return decline(unavailable());
        }
        part.intent = 'story';
        part.carry = { extra: [...new Set(fitting.flatMap(f => f.remaining))], editions: editionsHere,
            numbers: [...new Set(fitting.flatMap(f => f.numbers))] };
        let candidates = fitting.map(f => f.record);
        // An implicit question follows the latest conversation subject. The
        // selected page is only the default before that subject is established.
        if (!subject && !queryTerms.length && !queryNumbers.length) {
            if (c.entities.length > 1) return result('clarify', 'Which person or event do you mean?');
            const ids = focusIds(c, opts), focus = focusRecords(ids);
            // A hidden or unrelated latest subject cannot fall back to the
            // older page topic or select some other visible event.
            if (ids.length) candidates = candidates.filter(r => focus.some(f => f.entityId === r.entityId
                // A visible person's authored participation can focus their
                // event. The requested role still comes from its own record.
                || (isPerson(f) && [...r.story.people, ...r.story.context]
                    .some(name => normalize(name) === normalize(f.title)))
                // A topic that quotes the role's own source sentence ("The
                // suspect and the Crown Jewel") is the same account.
                || f.text.includes(r.text)));
            if (!candidates.length) return decline(unavailable() + topicNote(c, opts));
        }
        const distinct = [...new Set(candidates.map(r => r.entityId))];
        if (distinct.length > 1) return choices(c, candidates, 'story', {
            parts: [{ intent: 'story', method: null, story: { ...part.story }, carry: part.carry }]
        }, `Which ${['leader', 'member'].includes(role) ? 'organization' : 'event'} do you mean?`);
        // A guide's suspect clue cannot answer in place of a separately
        // sourced perpetrator. Prefer guide text within each requested role,
        // so research for a different role keeps its own attribution.
        if (role === 'perpetrator' && candidates.some(r => r.story.role === 'perpetrator'))
            candidates = candidates.filter(r => r.story.role === 'perpetrator');
        if (role === 'participants' && candidates.some(r => r.story.role === 'perpetrator'))
            candidates = candidates.filter(r => r.story.role !== 'suspect');
        candidates = candidates.filter(r => r.source.review !== 'external-research'
            || !candidates.some(other => other.story.role === r.story.role && other.source.review !== 'external-research'));
        const suspectOnly = candidates.every(r => r.story.role === 'suspect') && role !== 'suspect';
        // Pair only roles whose authored context explicitly names the other
        // role. Sharing an event is not evidence that every killer killed
        // every victim, and one role can never create its missing inverse.
        const pairs = [], paired = new Map();
        if (role === 'participants') for (const killer of candidates.filter(r => r.story.role === 'perpetrator')) {
            for (const victim of candidates.filter(r => r.story.role === 'victim' && r.entityId === killer.entityId)) {
                const killers = killer.story.people.filter(name => victim.story.context.some(other => normalize(other) === normalize(name)));
                const victims = victim.story.people.filter(name => killer.story.context.some(other => normalize(other) === normalize(name)));
                if (!killers.length || !victims.length) continue;
                pairs.push({ killers, victims, records: [killer, victim] });
                for (const [record, people] of [[killer, killers], [victim, victims]]) {
                    const covered = paired.get(record.id) || new Set();
                    people.forEach(name => covered.add(normalize(name)));
                    paired.set(record.id, covered);
                }
            }
        }
        const incomplete = role === 'participants' && !pairs.length;
        const prefix = `${candidates[0].title} — ${suspectOnly ? 'Suspect clue' : role === 'participants' ? 'Who killed whom' : STORY_LABELS[role]}:\n`;
        const attribution = candidates.every(r => r.source.review === 'external-research') ? 'The cited research records' : 'The guide records';
        const qualification = suspectOnly ? `${role === 'participants' ? 'The indexed records do not establish who killed whom. ' : ''}${attribution} a suspect, not a confirmed murderer:\n`
            : incomplete ? 'The indexed records have no complete perpetrator-and-victim relationship here. What they record:\n' : '';
        const replies = candidates.map(r => answerRecord(r, c, opts.tone));
        // A conflicting or unreviewed role must not be hidden by other facts.
        const unsupported = replies.find(reply => reply.decision !== 'answer');
        if (unsupported) { c.lastRecord = null; c.lastRecords = []; return unsupported; }
        let body = [...new Set(replies.map(reply => reply.text))].join('\n');
        if (role === 'participants' && !suspectOnly) {
            const byRecord = new Map(candidates.map((record, at) => [record.id, replies[at]]));
            const blocks = pairs.map(pair => ({ records: pair.records,
                lines: [`Killers: ${pair.killers.join(', ')}`, `Victims: ${pair.victims.join(', ')}`] }));
            for (const record of candidates) {
                const remaining = record.story.people.filter(name => !paired.get(record.id)?.has(normalize(name)));
                if (paired.has(record.id) && !remaining.length) continue;
                const label = record.story.role === 'perpetrator' ? 'Killers' : record.story.role === 'victim' ? 'Victims' : 'Suspects';
                const names = remaining.length ? remaining.join(', ') : record.story.qualifier;
                blocks.push({ records: [record], lines: names ? [`${label}: ${names}`, 'No sourced killer–victim pairing is established for this account.'] : [] });
            }
            body = [...new Set(blocks.map(block => {
                const outside = block.records.every(r => r.source.review === 'external-research');
                const mixed = !outside && block.records.some(r => r.source.review === 'external-research');
                const lead = outside ? 'Not in this guide — from outside research:\n'
                    : mixed ? 'Roles from the separately attributed guide and research accounts:\n' : '';
                const facts = [...new Set(block.records.map(record => {
                    const text = byRecord.get(record.id).text;
                    return outside ? text.replace(/^Not in this guide — from outside research: /, '') : text;
                }))];
                return lead + [...block.lines, ...facts].join('\n');
            }))].join('\n\n');
        }
        const recordIds = [...new Set(replies.flatMap(reply => reply.recordIds))];
        const top = LEVELS[Math.max(...replies.map(reply => LEVELS.indexOf(reply.level)))];
        c.entities = [candidates[0].entityId]; c.pending = null; c.lastAction = null;
        c.lastRecords = recordIds; c.lastRecord = recordIds.length === 1 ? recordIds[0] : null; c.lastLevel = top;
        return result('answer', prefix + qualification + body, {
            recordIds, sources: replies.flatMap(reply => reply.sources), actions: replies.flatMap(reply => reply.actions),
            level: top, title: candidates[0].title
        });
    }
    function respondPartInner(part, opts, c, { subject = null, skipMaterial = false, multi = false } = {}) {
        if (part.report) return result('clarify', 'A progress report inside a longer message is not applied. Send it on its own; nothing was changed.');
        part.identityRequest ||= part.intent === 'explanation' && part.narrative?.aspect === 'identity';
        // A descriptive search result is a proposal, not an established topic.
        // "Who is he?" cannot silently confirm an entry suggested for another name.
        if (!subject && c.pending?.frame?.unconfirmedSubject
            && (part.pronoun || part.narrative?.contextual || (part.story && !part.story.query))) {
            const pending = c.pending;
            return choices(c, visible.filter(record => pending.ids.includes(record.entityId)), pending.intent, pending.frame,
                'Which subject do you mean? Choose an entry or name it; the suggested entries are not a confirmed match.');
        }
        // A pronoun can ask a new relationship while keeping the same
        // qualified subject: an unsupported platform cannot disappear when
        // "install it" becomes "download it". A freshly named request starts
        // its own frame, as do resets and guide-context changes.
        if (!multi && part.pronoun && !part.inherited && c.frame?.parts?.length === 1 && !resolve(part.core, opts).length) {
            const carry = c.frame.parts[0].carry;
            // After a sourced answer, a new explicit question may change its
            // predicate ("use guns" -> "leave the party"). Failed details
            // remain unresolved; source, version and number constraints also
            // survive a new relationship after a successful answer.
            part.inherited = carry ? { ...carry, extra: c.messages.at(-1)?.decision === 'answer'
                ? carry.extra.filter(term => RESTRICTIVE.test(term)) : carry.extra } : null;
        }
        if (part.inherited?.guideOnly || (part.pronoun && c.frame?.parts?.length === 1 && c.frame.parts[0].guideOnly)) part.guideOnly = true;
        const narrative = narrativeReply(part, opts, c, { subject });
        if (narrative) return narrative;
        let intent = part.intent;
        const supports = record => relates(record, intent) && (!part.identityRequest || record.identity !== false);
        const story = storyReply(part, opts, c, { subject });
        if (story) return story;
        if (RESTRICTION.test(part.q)) {
            // Reject the condition before overview or other early answers,
            // but establish a newly named subject before the next "it".
            const named = subject ? [subject] : resolve(part.core, opts, expectedGroup(part.q, intent), intent, part.identityRequest);
            const target = named.length === 1 ? named[0] : !named.length && part.pronoun && c.entities.length === 1
                ? { id: c.entities[0], queryTerms: tokens(part.q).filter(t => PRONOUN_TOKEN.test(t)) } : null;
            if (target) {
                c.entities = [target.id]; c.pending = null; c.lastAction = null; c.lastRecord = null; c.lastRecords = [];
                part.carry = carryOf(part, target.queryTerms || []);
            } else clearTopic(c);
            return decline('The guide does not model that restriction well enough to answer it reliably. Ask about the requirement or subject separately.');
        }
        // Story replies keep their event as context. A later "Where is he?"
        // may refer to a named participant, never to that event's location.
        if (!subject && part.pronoun && /\b(?:he|she|him|her|his|they|them|their)\b/.test(part.core)
            && c.lastRecords.some(id => byId.get(id)?.relation === 'story') && !resolve(part.core, opts).length) {
            const people = [...new Set(visible.filter(r => c.lastRecords.includes(r.id) && r.story).flatMap(r => r.story.people))];
            const referents = people.length === 1 ? resolve(people[0], opts, 'person')
                .filter(hit => visible.some(r => r.entityId === hit.id && isPerson(r))) : [];
            if (referents.length !== 1) return result('clarify', 'Which person do you mean?');
            subject = { ...referents[0], queryTerms: tokens(part.core).filter(t => PRONOUN_TOKEN.test(t)) };
        }
        if (intent === 'list' && !subject) {
            // "How many companions are there?": a topic the guide itself states ("The nine companions") answers before the generic count.
            const stated = /^how many\b/.test(part.core || part.q) ? resolve(part.core, opts) : [];
            if (!stated.length) return listKind(part, c);
            intent = 'explanation'; part.intent = intent;
        }
        let matched = subject ? [subject] : resolve(part.core, opts, expectedGroup(part.q, part.intent), intent, part.identityRequest);
        // In "How do I cure poisoning?", Cure is the action, even though a
        // spell has that exact name. Prefer its explicit guide remedy when
        // its text supports the condition; otherwise resolve the condition.
        // Normal source, edition, number and material checks still follow.
        const remedyVerb = !subject && intent === 'remedy' && matched.length > 1
            && part.core.match(/^how (?:do|can|could|should) (?:i|we) (cure|heal|revive|resurrect|awaken)\s+(.+)$/);
        if (remedyVerb) {
            const verbs = matched.filter(m => normalize(m.alias) === remedyVerb[1]);
            const targets = matched.filter(m => !verbs.includes(m));
            const native = verbs.filter(m => visible.some(r => r.entityId === m.id && relates(r, intent)
                && r.source?.review !== 'external-research' && covers(r, materialTerms(part.q, m.queryTerms, part.editions))));
            if (native.length === 1) matched = native;
            else if (verbs.length && targets.length) matched = targets;
        }
        // "Batlin's package" is about the package when the package is a guide
        // subject of its own. The owner is accepted as a name, not checked as a
        // restriction, only when the package's own guide passage names them.
        const owned = !subject && matched.length === 1 && matched[0].match === 'exact'
            && part.core.match(/(?:^|\s)([\p{L}\p{N}-]+)'s\s+([\p{L}\p{N}-]+(?:\s[\p{L}\p{N}-]+){0,2})/u);
        if (owned) {
            const owner = possessive(owned[1]), words = tokens(owned[2]);
            for (let n = words.length; n >= 1; n--) {
                const object = resolve(`the ${words.slice(0, n).join(' ')}`, opts)
                    .filter(hit => hit.match === 'exact' && hit.id !== matched[0].id);
                const passages = object.length === 1 ? visible.filter(r => r.entityId === object[0].id).map(r => r.source?.locator) : [];
                if (passages.length && visible.some(r => passages.includes(r.source?.locator) && tokens(r.text).map(possessive).includes(owner))) {
                    matched = [{ ...object[0], queryTerms: [...object[0].queryTerms, owner] }];
                    break;
                }
            }
        }
        if (intent === 'spell-search' && !subject) {
            // Naming a spell ("what spell is An Nox?") is an ordinary question about that spell.
            if (!matched.length) return spellSearch(part, c);
            intent = part.intent = 'explanation';
        }
        // A subject's own name never chooses the relationship: in "How do I
        // use Cure?" the spell's name is not a request to cure something.
        // Explicit effect/use grammar also wins when the named spell has a
        // remedy record. "Shamino got charmed" still asks for a counter/cure.
        if (!subject && matched.length === 1 && matched[0].match === 'exact' && intent
            && (!visible.some(r => r.entityId === matched[0].id && relates(r, intent))
                || /^what (?:does|do)\b.+\bdo(?:\b.*)?$|^how (?:do|can|could|should) (?:i|we) (?:use|cast)\b/.test(part.core))) {
            const name = new RegExp(`(^|\\s)${matched[0].queryTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s&/]+')}(?=\\s|$)`);
            const unnamed = part.q.replace(name, ' ');
            if (unnamed !== part.q) {
                // "What should I do about the Trinsic Murders?" asks for a hint when the subject has no cure.
                const aboutHint = intent === 'remedy' && /\bwhat (?:should|do|can|must) i do about\b/.test(part.q)
                    && visible.some(r => r.entityId === matched[0].id && relates(r, 'hint'));
                // "How do I get past the dragons?" about an enemy means how to beat it.
                const pastEnemy = intent === 'hint' && /\bget(?:ting)? (?:past|by|through|around)\b/.test(part.q)
                    && visible.some(r => r.entityId === matched[0].id && r.relation === 'combat');
                // "How do I destroy the Black Gate?" about something that is not an enemy asks for its hint.
                const destroyIt = intent === 'combat' && /\b(?:destroy|banish)\b/.test(part.q)
                    && visible.some(r => r.entityId === matched[0].id && relates(r, 'hint'));
                // "How do I get into X?" asks for requirements when X has them, otherwise how to get in.
                const intoPlace = intent === 'prerequisites' && /\bget(?:ting)? (?:in|into|inside)\b/.test(part.q);
                // "How do I do a Wide Swing?" about a move or item means how to use it when it has no hint.
                const howDo = intent === 'hint' && /\bhow (?:do|can|could|should|would) (?:i|we) (?:do|perform|make|use)\b/.test(part.q)
                    && visible.some(r => r.entityId === matched[0].id && r.relation === 'use');
                const reread = aboutHint || destroyIt ? 'hint' : pastEnemy ? 'combat' : intoPlace ? 'acquisition' : howDo ? 'use' : detectIntent(unnamed) || (HOW_TO.test(remainder(part.q, matched[0].queryTerms)) ? 'use' : null);
                if (reread && reread !== intent) { intent = reread; Object.assign(part, { intent, method: detectMethod(unnamed) }); }
            }
        }
        if (intent === 'overview') {
            if (matched.length === 1) return overviewOf(matched[0].id, c);
            return matched.length ? choices(c, visible.filter(r => matched.some(m => m.id === r.entityId)), 'overview', { parts: [{ intent, method: part.method }] })
                : decline('Name one subject, such as a character or item, to get everything the guide records about it.');
        }
        if (intent === 'unsupported') {
            // Selling is answerable only where a guide documents where to sell
            // (Albion's trade table); selling a particular item never is.
            const sells = part.method === 'sell' && matched.length === 1
                && visible.some(r => r.entityId === matched[0].id && relates(r, 'sell'));
            if (!sells) return decline('That relationship is not covered by this local guide.');
            intent = 'sell';
        }
        // Lore questions ("What doth Trolls lack?") name one question-and-answer entry.
        if (!intent && matched.length === 1) {
            const own = visible.filter(r => r.entityId === matched[0].id);
            if (own.length === 1 && own[0].kind === 'qa') intent = part.intent = own[0].relation;
            else if (HOW_TO.test(remainder(part.q, matched[0].queryTerms, part.editions))) { intent = 'use'; part.intent = 'use'; }
        }
        // A subject that the guide records for exactly one relationship needs no "what do you want to know?" menu.
        if (!intent && matched.length === 1 && !part.pronoun) {
            const only = OFFERS.map(([relation]) => relation).filter(relation =>
                visible.some(r => r.entityId === matched[0].id && r.kind !== 'research' && relates(r, relation)));
            if (only.length === 1) { intent = only[0]; part.intent = intent; }
        }
        if (!intent && !matched.length && !part.pronoun && !part.suggested) {
            // A bare misspelt name ("serpant staff") is offered as "Did you mean…?" instead of a generic menu.
            const bare = materialTerms(part.q, [], part.editions);
            const guess = bare.length ? suggest(bare, part) : null;
            if (guess?.ranked.length) return choices(c, visible.filter(r => guess.ranked.some(x => x.id === r.entityId)), null,
                { parts: [] }, `I don't know anything about “${guess.typed}”. Did you mean one of these?`);
        }
        if (!intent) {
            if (part.story) return result('clarify', `Which ${['leader', 'member'].includes(part.story.role) ? 'organization' : 'event or investigation'} do you mean? Name it or open its guide section.`);
            if (!part.pronoun) {
                c.entities = matched.map(match => match.id).slice(0, 6);
                c.pending = null; c.lastAction = null; c.lastRecord = null; c.lastRecords = [];
            }
            const named = matched.length === 1 && titleOf(matched[0].id);
            const offered = named ? offeredFor(matched[0].id) : '';
            // A bare misspelt name still says what it was taken for.
            const taken = named && matched[0].match === 'typo'
                ? `I don't know anything about “${typedPhrase(rawText, matched[0].typoWord || matched[0].queryTerms[0], [...(matched[0].aliases || [])].flatMap(alias => tokens(alias)))}”. Did you mean ${named}? ` : '';
            return result('clarify', named ? `${taken}What would you like to know about ${named}: ${offered || whatMenu()}?`
                : `What would you like to know: ${whatMenu()}?`, { topicOnly: Boolean(named) });
        }
        const inherited = part.inherited || { extra: [], editions: [], numbers: [] };
        // An edition word inside the subject's own name ("Remastered SCM Map") names the subject, not the visitor's edition.
        const nameWords = new Set(matched.flatMap(m => m.queryTerms));
        const partEditions = [...new Set([...part.editions, ...inherited.editions])].filter(e => !tokens(e).every(t => nameWords.has(t)));
        const loose = materialTerms(part.q, [], partEditions);
        let candidates = null;
        if (!matched.length && ['hint', 'prerequisites'].includes(intent)
            && (!part.pronoun || (!c.entities.length && (opts.entityIds || []).length))) {
            candidates = contextual(intent, part, opts);
            if (!candidates.length) candidates = null;
        }
        // Choices drawn from the open section are its steps, not guesses at a name.
        const sectionSteps = Boolean(candidates) && intent === 'hint';
        if (sectionSteps && plainSectionHint(part)) {
            const reply = checklistHint(candidates, c, { ...opts, guideOnly: part.guideOnly });
            if (reply) return reply;
        }
        if (!matched.length && !candidates && intent === 'hint' && plainSectionHint(part) && !c.entities.length)
            return result('clarify', 'Open a chapter, quest step or objective, or name a subject, so I can offer a hint.');
        // "Which do I choose?" names no option: the guide's own overall comparison answers it, never a verdict.
        if (!matched.length && !candidates && intent === 'comparison' && !part.pronoun
            && !(c.entities.length && !/\b(?:which|choose|pick|select|recommend|better|best|should i)\b/.test(part.q)
                && visible.some(r => c.entities.includes(r.entityId) && r.relation === 'comparison'))) {
            const overall = visible.filter(r => r.relation === 'comparison' && r.general);
            if (overall.length) {
                candidates = overall;
                // Words the comparison cannot honour ("easiest", "on Linux") are said aloud, never dropped.
                part.generalLeft = materialTerms(part.q, [], partEditions).filter(term => !COMPARISON_WORDS.has(term) && term !== gameId);
            }
        }
        // Pronouns and elliptical follow-ups ("Where?") use the current subject.
        if (!matched.length && !candidates && (part.pronoun || (!loose.length && c.entities.length))) {
            const compatible = c.entities.filter(id => visible.some(r => r.entityId === id && supports(r)));
            if (compatible.length === 1) matched = [{ id: compatible[0], match: 'pronoun',
                queryTerms: tokens(part.q).filter(token => PRONOUN_TOKEN.test(token)) }];
            // Within one message the referent was just named, so a missing
            // relationship is a decline; across turns the visitor may mean
            // something else, so ask.
            else if (!compatible.length && c.entities.length === 1 && titleOf(c.entities[0])) return multi
                ? decline(`The local guide has no supported ${intent} answer for this subject at the selected help level.`)
                : result('clarify', `The current subject has no supported ${intent} answer at this help level. Name another subject.`);
            else return choices(c, visible.filter(r => compatible.includes(r.entityId)), intent,
                { parts: [{ intent, method: part.method, carry: carryOf(part, []) }] });
        }
        if (matched.length > 1) {
            // "Where does Utomo sell Swamp Boots?": when only one named subject
            // has the requested relationship, the other names stay material
            // terms that its fact must contain.
            const related = matched.filter(m => visible.some(r => r.entityId === m.id && supports(r)));
            // Subjects sharing a name ("Finnigan") are told apart by the question's other words ("password").
            const sameName = matched.every(m => m.queryTerms.join(' ') === matched[0].queryTerms.join(' '));
            // Which fact is available cannot decide which uncertain spelling the visitor meant.
            if (sameName && matched.every(m => m.match === 'typo' || m.spacing))
                return choices(c, visible.filter(r => matched.some(m => m.id === r.entityId)), intent,
                    { parts: [{ intent, method: part.method, carry: carryOf(part, matched[0].queryTerms) }] });
            const needed = related.length > 1 && (sameName || intent !== 'comparison') ? materialTerms(part.q, matched.flatMap(m => m.queryTerms), part.editions) : [];
            const fitting = needed.length ? related.filter(m => visible.some(r => r.entityId === m.id && supports(r) && covers(r, needed))) : [];
            // "Antivirus blocking SCHNAIL" already contains the name SCHNAIL: the more specific subject wins.
            const holds = (m, o) => ` ${tokens(titleOf(m.id) || '').join(' ')} `.includes(` ${o.queryTerms.join(' ')} `);
            const specific = related.length > 1 && intent !== 'comparison' ? related.filter(m => related.some(o => o !== m && holds(m, o))) : [];
            if (related.length === 1) matched = related;
            else if (fitting.length === 1) matched = fitting;
            else if (specific.length === 1) matched = specific;
            // A comparison presents each subject's own documented pros and
            // cons; it never ranks them or invents a verdict.
            else if (intent === 'comparison' && related.length === matched.length && matched.length <= MAX_PARTS)
                return compose(matched.map(() => part), matched.map(m => {
                    const reply = respondPart({ ...part, comparisonNames: matched.flatMap(other => other.queryTerms) }, opts, c, { subject: m, multi: true });
                    return { ...reply, subject: m.id };
                }), c);
            else if (intent === 'comparison' && !related.length)
                return decline('The guide does not compare these subjects. Ask about each one separately.');
        }
        // Offering a choice between subjects that none can answer is a dead end.
        if (matched.length > 1 && !matched.some(m => visible.some(r => r.entityId === m.id && supports(r))))
            return decline(`The local guide has no supported ${intent} answer for this subject at the selected help level.`);
        if (matched.length > 1) return choices(c, visible.filter(r => matched.some(m => m.id === r.entityId)), intent,
            { parts: [{ intent, method: part.method, carry: carryOf(part, matched.flatMap(m => m.queryTerms)) }] });
        const explicit = matched[0]?.id;
        const otherNames = part.comparisonNames || [];
        if (explicit && matched[0].match === 'typo') {
            const word = matched[0].typoWord || matched[0].queryTerms[0];
            part.typo = { typed: typedPhrase(rawText, word, [...(matched[0].aliases || [])].flatMap(alias => tokens(alias))),
                title: titleOf(explicit, tokens(matched[0].alias || '').join(' ')) };
        }
        // A newly named subject replaces the conversational subject, even when
        // its requested relationship is then declined.
        if (explicit && c.entities[0] !== explicit) {
            c.entities = [explicit]; c.pending = null; c.lastAction = null; c.lastRecord = null; c.lastRecords = [];
        }
        // Preserve restrictions even if a method, source or edition check
        // declines before a fact is selected; later follow-ups still inherit them.
        const identityNumbers = new Set(matched[0]?.match === 'exact' ? tokens(matched[0].alias) : []);
        if (explicit) part.carry = carryOf(part, skipMaterial ? tokens(part.q) : matched[0]?.queryTerms || [], identityNumbers);
        if (explicit) candidates = index.search(part.q, r => r.entityId === explicit && supports(r)).map(x => x.record);
        else if (!candidates) {
            const restricted = loose.some(t => RESTRICTIVE.test(t)) || partEditions.length
                || inherited.extra.length || tokens(part.q).some(t => NUMBER.test(t));
            const guess = !part.pronoun && !part.suggested ? suggest(loose, part) : null;
            if (guess?.unique) {
                // Explicitly a guess about another subject; never claimed to be about the typed name.
                const pick = guess.ranked[0];
                const title = titleOf(pick.id, pick.name);
                const reply = respondPart({ ...part, suggested: true }, opts, c,
                    { subject: { id: pick.id, alias: title, queryTerms: pick.span, match: 'suggested' } });
                c.lastAction = null;
                const lead = `I don't know anything about “${guess.typed}”. Did you mean ${title}?`;
                return { ...reply, text: reply.decision === 'answer' ? `${lead} If so: ${reply.text}` : `${lead} ${reply.text}`,
                    suggestedFrom: guess.typed, suggestedSubject: pick.id };
            }
            if (guess) return choices(c, visible.filter(r => guess.ranked.some(x => x.id === r.entityId)), intent,
                { parts: [{ intent, method: part.method, carry: carryOf(part, guess.ranked[0].span) }] },
                `I don't know anything about “${guess.typed}”. Did you mean one of these?`);
            const found = loose.length && !restricted ? describe(loose, intent, part.guideOnly) : [];
            if (found.length) return choices(c, found, intent, { unconfirmedSubject: true, parts: [{ intent, method: part.method, guideOnly: part.guideOnly }] },
                'No guide subject has that name. These entries contain all of those words; choose one only if it is what you meant.');
            c.entities = []; c.lastAction = null; c.lastRecord = null; c.lastRecords = []; c.pending = null;
            // "Which companion is the best tank?": the guide does not rank things, but it can list that kind.
            if (SUPERLATIVE.test(part.q)) {
                const key = listNoun(part.q);
                const listed = LIST_KINDS[key] ? listKind(part, c, key) : null;
                const lead = 'The guide does not rank or compare things, so it cannot say which is best.';
                return listed?.decision === 'answer' ? { ...listed, decision: 'clarify', text: `${lead} ${listed.text}` } : result('clarify', lead);
            }
            return result('clarify', UNGROUNDED);
        }
        // "Using only the guide, …": outside research cannot answer.
        if (part.guideOnly) candidates = candidates.filter(r => r.source?.review !== 'external-research');
        // "Who has the Rune of Compassion?" at a lower setting: the authored
        // hint for that subject is the gentler form of how to get it.
        if (!candidates.length && explicit && intent === 'acquisition' && /^who (?:has|holds|keeps|owns|carries)\b/.test(part.core || ''))
            candidates = index.search(part.q, r => r.entityId === explicit && relates(r, 'hint')).map(x => x.record)
                .filter(r => !part.guideOnly || r.source?.review !== 'external-research');
        if (!candidates.length) {
            if (part.identityRequest) return decline('I do not have a sourced identity description for this subject at this help level. Ask “Tell me about” the subject for its guide context, or ask for its location.');
            const offered = explicit ? offeredFor(explicit, intent) : '';
            return decline(`The local guide has no supported ${intent} answer for this subject at the selected help level.${offered ? ` It can tell you ${offered}.` : ''}`);
        }
        // The guide's own facts always win over outside research.
        if (candidates.some(r => r.source?.review !== 'external-research'))
            candidates = candidates.filter(r => r.source?.review !== 'external-research');
        const method = part.method;
        if (intent === 'acquisition' && method) {
            candidates = candidates.filter(r => r.acquisitionMethods.includes(method));
            if (!candidates.length) {
                const offered = explicit ? offeredFor(explicit) : '';
                return decline(`The guide does not establish ${method} as an acquisition method for this subject.${offered ? ` It can tell you ${offered}.` : ''}`);
            }
        }
        if (partEditions.length) {
            const before = candidates;
            candidates = candidates.filter(r => partEditions.every(e => (r.editions.length ? r.editions : editions)
                .some(edition => normalize(edition) === e)));
            if (!candidates.length) {
                // When the guide's own sources disagree about that edition, say so with the recorded note.
                const conflict = before.find(r => r.conflict) || visible.find(r => r.conflict && r.entityId === before[0]?.entityId);
                return conflict
                    ? result('decline', `This guide does not support the edition or version named in your question, and its own sources disagree about it: ${conflict.text}`, { recordIds: [conflict.id], sources: [conflict.source], level: conflict.level })
                    : decline('This guide does not support the edition or version named in your question.');
            }
        }
        if (intent === 'acquisition' && method === 'recruit') {
            candidates = candidates.filter(r => ['character', 'companion'].includes(r.kind));
            if (!candidates.length) return decline('Recruitment is not a supported relationship for this subject.');
        }
        if (intent === 'combat' && /\b(defeat|kill|beat|fight|battle)\b/.test(part.q)) {
            const subjectWords = (matched[0]?.queryTerms || []).join(' ');
            const queryWords = ` ${tokens(part.q).join(' ')} `;
            const usedAsAlly = subjectWords && ['with', 'as', 'using'].some(preposition =>
                queryWords.includes(` ${preposition} ${subjectWords} `));
            if (!usedAsAlly) {
                candidates = candidates.filter(r => ['enemy', 'bestiary', 'monster'].includes(r.kind));
                if (!candidates.length) return decline('This guide does not establish this subject as an enemy to defeat. Companion strengths do not establish an enemy strategy.');
            }
        }
        // Material numerical constraints cannot be erased by lexical relevance.
        const numbers = [...new Set([...tokens(part.q).filter(t => NUMBER.test(t)
            && !partEditions.includes(t) && !identityNumbers.has(t)), ...inherited.numbers])];
        if (numbers.length) {
            candidates = candidates.filter(r => numbers.every(n => tokens(r.text).includes(n)));
            if (!candidates.length) return decline('The guide does not support those numeric constraints for this answer.');
        }
        if (explicit) {
            // A name match cannot erase an unsupported qualifier ("on Mars",
            // "for free", "underwater"). Request framing and relationship
            // vocabulary are not evidence; every remaining term must occur in
            // the authorised fact. A choice button's label is only a name, but
            // restrictions inherited from the original question still apply.
            const own = (skipMaterial ? [] : materialTerms(part.q, [...(matched[0]?.queryTerms || []), ...otherNames], partEditions))
                .filter(term => intent !== 'comparison' || !COMPARISON_WORDS.has(term));
            // The subject's own kind noun ("the Trinsic Murders quest") restates what it is; it is never a restriction.
            const kindWords = new Set(candidates.flatMap(r => [r.kind, `${r.kind}s`]));
            let material = [...new Set([...own.filter(term => !kindWords.has(term)), ...inherited.extra])];
            if (intent === 'remedy' || intent === 'advice') material = material.filter(term => !PARTY_WORDS.has(term) && !partyNames().has(term));
            if (material.length) {
                candidates = candidates.filter(r => covers(r, material));
                if (!candidates.length) {
                    // "Who is the murderer in Trinsic?": no record of Trinsic says so, but another entry may contain
                    // the subject's name and every extra word. Offer it as a choice, never as an answer.
                    const place = PLACE_KINDS.has(visible.find(r => r.entityId === explicit)?.kind)
                        && new RegExp(`\\b(?:in|at|near|around|from|inside|within)\\s+(?:the\\s+)?${matched[0].queryTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')}\\b`).test(part.q);
                    const plain = place && !skipMaterial && !inherited.extra.length && !partEditions.length && material.every(term => !RESTRICTIVE.test(term) && !NUMBER.test(term));
                    const near = plain ? describe([...new Set([...matched[0].queryTerms, ...material])], intent, part.guideOnly).filter(r => r.entityId !== explicit) : [];
                    if (near.length) return choices(c, near, intent, { unconfirmedSubject: true, parts: [{ intent, method: part.method, guideOnly: part.guideOnly }] },
                        'No single entry records that for this subject. These entries contain all of those words; choose one only if it is what you meant.');
                    return decline('The guide does not support that additional detail or restriction for this subject.');
                }
            }
        }
        // "What does Lord British give me?" asks what someone hands over. A
        // description or location ("Lord British: The king.") does not answer
        // it; an item's recorded effect or stats, or a fact that says what is
        // given, still does.
        if (explicit && /\bwhat (?:does|do|did|will|would|can|could) (?:\S+ ){1,6}(?:give|hand|offer) (?:me|us|you)\b/.test(part.q)) {
            candidates = candidates.filter(r => relates(r, 'use') || r.relation === 'stats'
                || /\b(?:give|gives|gave|given|hands?|handed|offers?|offered|rewards?|rewarded)\b/i.test(r.text));
            if (!candidates.length) return decline('The guide does not record what that gives you.');
        }
        if (!explicit && intent === 'hint') {
            const unfinished = candidates.filter(r => !r.completionFact || evidence.read(r.completionFact).value !== true);
            candidates = unfinished;
            if (!candidates.length) return result('clarify',
                'The checked objectives are historical reports. Tell me your current goal or correct a specific objective.');
        }
        const distinct = [...new Set(candidates.map(r => r.entityId))];
        if (distinct.length > 1) return choices(c, candidates, intent, { parts: [{ intent, method, carry: carryOf(part, []) }] },
            sectionSteps ? 'Which step would you like a hint for?' : undefined);
        // Effects can supply item statistics when no dedicated stats exist.
        // A native stats record is more specific, even when a pronoun makes
        // the effect text score higher in lexical retrieval.
        const exactStats = intent === 'stats' && candidates.find(record => record.relation === 'stats');
        return answerRecord(exactStats || candidates[0], c, opts.tone);
    }
    // Combine separately grounded answers. Every component keeps its own
    // records, sources and conflict handling; the message carries the highest
    // spoiler level it emits.
    function compose(parts, replies, c) {
        // Two phrasings of the same relationship ("what does it do and how
        // much damage?") resolve to one fact; show it once.
        const seen = new Set();
        replies = replies.map(reply => {
            if (reply.decision !== 'answer') return reply;
            const repeat = reply.recordIds.every(id => seen.has(id));
            reply.recordIds.forEach(id => seen.add(id));
            return repeat ? { ...reply, decision: 'duplicate', recordIds: [], sources: [], actions: [] } : reply;
        });
        const answered = replies.filter(r => r.decision === 'answer');
        const shown = (reply, i) => !(reply.topicOnly && replies.length > 1) && reply.decision !== 'duplicate';
        // Parts that are not a recognised question share one explanation.
        const unread = parts.filter((part, i) => shown(replies[i], i) && replies[i].decision !== 'answer' && !part.intent);
        const lines = replies.map((reply, i) => {
            const part = parts[i];
            if (!shown(reply, i)) return null;
            const relation = (part.intent === 'acquisition' && METHOD_LABELS[part.method]) || RELATION_LABELS[part.intent];
            if (reply.decision === 'answer') return `${reply.title} — ${relation}:\n${reply.text}`;
            // Quote the visitor's own words so it is clear which bit was not answered.
            if (!part.intent) return part !== unread[0] ? null : `Not answered: ${unread.map(p => `“${p.q}”`).join(' or ')}. `
                + `I can answer ${whatMenu()} about a named subject, but not ${unread.length > 1 ? 'these kinds' : 'this kind'} of question.`;
            return `Not answered: “${part.q}” (${relation}). ${reply.text}`;
        }).filter(Boolean).filter((line, i, all) => all.indexOf(line) === i);
        const withChoices = replies.find(r => r.choices.length);
        // A declined part was written at the current ceiling and may name an
        // entry visible only there ("I found the entry for …"), so the whole
        // message carries that level and is hidden if the setting is lowered.
        const declined = replies.some(r => !['answer', 'duplicate'].includes(r.decision));
        const rank = Math.max(...answered.map(r => LEVELS.indexOf(r.level)),
            ...(withChoices ? [LEVELS.indexOf(withChoices.level)] : []),
            ...(declined ? [LEVELS.indexOf(ceiling)] : []), -1);
        const decision = answered.length ? 'answer' : replies.some(r => r.decision === 'clarify') ? 'clarify' : 'decline';
        // "I already did that" or "smaller hint" can only refer to one answer.
        const recordIds = answered.flatMap(r => r.recordIds);
        const single = answered.length === 1 ? byId.get(recordIds[0]) : null;
        c.lastRecords = recordIds;
        c.lastRecord = single ? single.id : null;
        c.lastAction = single?.completionFact ? { recordId: single.id, fact: single.completionFact } : null;
        if (single) c.lastLevel = answered[0].level;
        if (!withChoices) {
            const subjects = [...new Set(replies.map(r => r.subject).filter(Boolean).reverse())];
            if (subjects.length) c.entities = subjects.slice(0, 6);
        }
        // When every other part repeated the same fact, show it plainly.
        const onlyAnswer = answered.length === 1 && lines.length === 1 ? answered[0].text : null;
        return result(decision, onlyAnswer || lines.join('\n\n'), {
            recordIds: replies.flatMap(r => r.recordIds), sources: replies.flatMap(r => r.sources),
            actions: answered.flatMap(r => r.actions), choices: withChoices?.choices || [],
            level: answered.length || withChoices ? LEVELS[Math.max(rank, 0)] : ceiling,
            parts: replies.map((r, i) => ({ intent: parts[i].intent, decision: r.decision, recordIds: r.recordIds, level: r.level }))
        });
    }
    function runParts(parts, opts, c, shared = {}) {
        if (parts.length === 1) {
            const reply = respondPart(parts[0], opts, c, shared);
            const frame = frameOf(parts);
            if (frame.length) c.frame = { parts: frame };
            delete reply.topicOnly;
            return reply;
        }
        let previousPart = null, previousReply = null;
        const replies = parts.map(part => {
            // Inside one message, "it" refers to the part just processed.
            // A fresh named first part replaces the previous message's
            // restrictions before a later part asks about its effect.
            if (previousPart && part.pronoun && !part.inherited && !resolve(part.core, opts).length) {
                const carry = previousPart.carry;
                part.inherited = carry ? { ...carry, extra: previousReply.decision === 'answer'
                    ? carry.extra.filter(term => RESTRICTIVE.test(term)) : carry.extra } : null;
                part.guideOnly ||= Boolean(previousPart.guideOnly);
            }
            const reply = respondPart(part, opts, c, { ...shared, multi: true });
            previousPart = part; previousReply = reply;
            return { ...reply, subject: reply.decision === 'answer' || reply.topicOnly || part.intent ? c.entities[0] : null };
        });
        const frame = frameOf(parts);
        if (frame.length) c.frame = { parts: frame };
        return compose(parts, replies, c);
    }
    const subjectPart = (part, fp, preserveStory = false) => ({ ...part, intent: fp.intent, method: fp.method, pronoun: false, report: false,
        identityRequest: Boolean(fp.identityRequest),
        guideOnly: Boolean(part.guideOnly || fp.guideOnly),
        ...(fp.story ? { story: { ...fp.story, query: preserveStory ? fp.story.query : part.followUp || part.core || part.q || '' } } : {}),
        ...(fp.narrative ? { narrative: { ...fp.narrative, contextual: false,
            selectedId: preserveStory ? fp.narrative.selectedId : undefined,
            query: preserveStory ? fp.narrative.query : part.followUp || part.core || part.q || '' } }
            : fp.identityRequest ? { narrative: { aspect: 'identity', query: part.followUp || part.core || part.q || '' } } : {}),
        inherited: fp.carry || null, carry: null });
    // A button or typed reply to "which one?" applies the pending question.
    function choose(id, opts, c, part, button) {
        const fresh = button ? opts.expectedRevision === c.pending?.revision : pendingFresh(c);
        const selected = visible.find(record => c.pending?.narrative ? record.id === id : record.entityId === id);
        if (!c.pending || !c.pending.ids.includes(id) || !fresh || !selected)
            return result('stale', 'That choice is no longer current. Ask again in the current topic.');
        const pending = c.pending;
        c.pending = null;
        if (pending.narrative) {
            const parts = pending.frame.parts.map(fp => subjectPart(part,
                { ...fp, narrative: { ...fp.narrative, selectedId: id } }, true));
            return runParts(parts, opts, c, { subject: { id: selected.entityId, queryTerms: tokens(selected.title) } });
        }
        const subject = { id, alias: selected.title, queryTerms: tokens(selected.title),
            match: normalize(selected.title) === part.q ? 'exact' : undefined };
        const parts = pending.frame?.parts?.length ? pending.frame.parts : [{ intent: pending.intent, method: null }];
        return runParts(parts.map(fp => subjectPart(part, fp, true)), opts, c, { subject, skipMaterial: button });
    }
    // "Sorry, I meant X" changes the subject; it never reports progress.
    function changeSubject(p, opts, c) {
        const pending = pendingFresh(c) ? c.pending : null;
        let matched = resolve(p.subject.core, opts);
        if (matched.length > 1 && pending) {
            const inPending = matched.filter(m => pending.ids.includes(m.id));
            if (inPending.length === 1) matched = inPending;
        }
        const frameParts = pending?.frame?.parts?.length ? pending.frame.parts
            : pending ? [{ intent: pending.intent, method: null }] : c.frame?.parts || [];
        if (matched.length > 1) return choices(c, visible.filter(r => matched.some(m => m.id === r.entityId)),
            p.parts[0]?.intent || frameParts[0]?.intent || null, { parts: p.parts.length ? frameOf(p.parts) : frameParts });
        if (!matched.length) {
            c.entities = []; c.pending = null; c.lastAction = null; c.lastRecord = null; c.lastRecords = [];
            return result('clarify', 'I could not match that subject at the selected help level. Please name it as the guide does.');
        }
        const subject = matched[0];
        const subjectQuery = { q: p.subject.q, core: p.subject.core, editions: p.editions, pronoun: false, report: false };
        if (materialTerms(p.subject.q, subject.queryTerms, p.editions).length)
            return decline('The guide does not support that additional detail or restriction for this subject.');
        c.entities = [subject.id]; c.pending = null; c.lastAction = null; c.lastRecord = null; c.lastRecords = [];
        if (p.parts.length) return runParts(p.parts, opts, c);
        const usePending = pending && pending.ids.includes(subject.id);
        const parts = usePending || !pending ? frameParts : c.frame?.parts || [];
        if (!parts.length) return result('clarify', `What would you like to know about ${titleOf(subject.id)}: ${offeredFor(subject.id) || whatMenu()}?`);
        return runParts(parts.map(fp => subjectPart(subjectQuery, fp)), opts, c, { subject });
    }
    // "What about X?", "And X?" or a bare name reuse the last relationships.
    function followUp(part, matched, opts, c) {
        // "Mantra of Humility" -> "what about Spirituality?" may have no
        // standalone Spirituality profile. A complete, exact indexed name
        // formed with the previous prefix is still a grounded identity.
        const named = c.frame.parts.length === 1 && !c.frame.parts[0].story && !c.frame.parts[0].narrative
            ? composeIndexedFollowUp(c.entities[0], part.followUp || part.core) : null;
        if (named) return runParts(c.frame.parts.map(fp => subjectPart(part, fp)), opts, c, { subject: named });
        // Let the normal relationship checks distinguish a shrine's reference
        // from a same-named quest. If both can answer, that path still asks.
        if (matched.length > 1 && c.frame.parts.length === 1 && !c.frame.parts[0].story && !c.frame.parts[0].narrative)
            return runParts(c.frame.parts.map(fp => subjectPart(part, fp)), opts, c);
        if (matched.length > 1) return choices(c, visible.filter(r => matched.some(m => m.id === r.entityId)),
            c.frame.parts[0].intent, { parts: c.frame.parts.map(fp => ({ ...fp,
                ...(fp.story ? { story: { ...fp.story, query: part.followUp || part.core || part.q } } : {}),
                ...(fp.narrative ? { narrative: { ...fp.narrative, selectedId: undefined,
                    query: part.followUp || part.core || part.q } } : {}) })) });
        if (!matched.length) {
            c.entities = []; c.lastAction = null; c.lastRecord = null; c.lastRecords = []; c.pending = null;
            return result('clarify', UNGROUNDED);
        }
        // "Where is the healer in Britain?" then "what about Cove?" means the healer in Cove.
        const composed = composeFollowUp(c.entities[0], matched[0], opts);
        if (composed === 'missing') {
            // The previous subject stays current, so "and Moonglow?" can still compose with it.
            return decline(`The guide has no matching entry for ${titleOf(matched[0].id)} like the one you just asked about.`);
        }
        return runParts(c.frame.parts.map(fp => subjectPart(part, fp)), opts, c, { subject: composed || matched[0] });
    }
    // The previous subject's own name contains another place's name ("Healer in Britain"): swap in the new place and
    // look for an entry with that composed name. Returns a subject, 'missing' when the composed name does not exist, or null.
    let ownersCache = null, ownersFor = null;
    const owners = () => {
        if (ownersFor !== visible) {
            ownersFor = visible; ownersCache = new Map();
            for (const r of visible) for (const alias of [r.title, ...r.aliases]) {
                const key = tokens(alias).map(possessive).join(' ');
                if (key) (ownersCache.get(key) || ownersCache.set(key, new Set()).get(key)).add(r.entityId);
            }
        }
        return ownersCache;
    };
    function composeIndexedFollowUp(previousId, phrase) {
        if (!previousId || !phrase) return null;
        const typed = tokens(phrase).map(possessive), found = new Map();
        for (const alias of new Set(visible.filter(r => r.entityId === previousId).flatMap(r => [r.title, ...r.aliases]))) {
            const words = tokens(alias).map(possessive);
            const at = words.findLastIndex(word => ['in', 'at', 'of', 'near', 'from'].includes(word));
            if (at < 1 || at === words.length - 1) continue;
            const name = [...words.slice(0, at + 1), ...typed].join(' ');
            for (const id of owners().get(name) || []) found.set(id, name);
        }
        if (found.size !== 1) return null;
        const [id, alias] = [...found][0];
        return { id, alias, queryTerms: tokens(phrase), match: 'composed', scopes: new Set() };
    }
    function composeFollowUp(previousId, next, opts) {
        if (!previousId || previousId === next.id) return null;
        const kindOf = id => visible.find(r => r.entityId === id)?.kind;
        const kind = kindOf(next.id);
        if (!kind) return null;
        const swapped = tokens(next.alias || next.queryTerms.join(' ')).map(possessive);
        let tried = false;
        for (const alias of new Set(visible.filter(r => r.entityId === previousId).flatMap(r => [r.title, ...r.aliases]))) {
            const words = tokens(alias).map(possessive);
            for (let size = 3; size >= 1; size--) for (let i = 0; i + size <= words.length; i++) {
                if (size === words.length) continue;
                const span = words.slice(i, i + size).join(' ');
                const found = owners().get(span);
                if (!found || [...found].every(id => id === previousId || kindOf(id) !== kind)) continue;
                // Only "healer IN Britain": a place after a locative preposition is a qualifier worth composing; a name word is not.
                if (!['in', 'at', 'of', 'near', 'from'].includes(words[i - 1])) continue;
                tried = true;
                const candidate = [...words.slice(0, i), ...swapped, ...words.slice(i + size)].join(' ');
                const hit = owners().get(candidate);
                const target = hit && [...hit].find(id => id !== previousId && id !== next.id);
                if (target) return { id: target, alias: candidate, queryTerms: tokens(candidate), match: 'composed', scopes: new Set() };
            }
        }
        return tried ? 'missing' : null;
    }
    function single(part, opts, c) {
        // A complete, reviewed Q&A question is a fresh request, even when its
        // older English wording has no modern intent keyword. It cannot be
        // a bare name inheriting an unrelated earlier location/effect request.
        const exactQuestion = /^(?:who|what|where|when|why|how|which)\b/.test(part.core)
            && visible.filter(r => !['story', 'narrative'].includes(r.relation) && r.source.index?.review === 'authored-index'
                && [r.title, ...r.aliases].some(name => normalize(name).replace(/[?!.]+$/, '') === normalize(part.core)));
        if (exactQuestion?.length === 1) part = { ...part, intent: exactQuestion[0].relation };
        if (part.followUp && c.frame?.parts?.length && part.intent && !part.story && !part.narrative) {
            const named = resolve(part.followUp, opts);
            if (named.length && named.every(m => m.match === 'exact')
                && !detectIntent(remainder(part.followUp, named.flatMap(m => m.queryTerms)))) part = { ...part, intent: null };
        }
        if (pendingFresh(c) && c.pending.narrative && !part.narrative && !part.story) {
            const selection = visible.filter(r => c.pending.ids.includes(r.id) && [r.title, r.narrative.predicate || '',
                `${r.title} — ${r.narrative.subjects.join(', ')}: ${r.narrative.predicate || NARRATIVE_LABELS[r.narrative.aspect]}`]
                .some(label => label && normalize(label) === normalize(part.core)));
            if (selection.length === 1) return choose(selection[0].id, opts, c, part, false);
        }
        if (!part.intent && !part.narrative && !part.story) {
            const affirmed = part.core.replace(/^(?:yes|yeah|yep|yup|correct|right|exactly)[,!.]*\s+/, '');
            const matched = resolve(part.followUp || affirmed, opts, null, c.frame?.parts?.length === 1 ? c.frame.parts[0].intent : null);
            // "Yes, a Time Lord" confirms the current subject and keeps the
            // original relationship. Extra qualifiers still need their normal checks.
            if (affirmed !== part.core && matched.length === 1 && !remainder(affirmed, matched[0].queryTerms)
                && (c.entities.includes(matched[0].id) || (pendingFresh(c) && c.pending.ids.includes(matched[0].id))))
                part = { ...part, q: affirmed, core: affirmed, followUp: null };
            if (pendingFresh(c) && matched.length === 1 && c.pending.ids.includes(matched[0].id))
                return choose(matched[0].id, opts, c, part, false);
            // Only the name itself ("Dreamshield?"), not "How do I <name>?".
            const bareName = matched.length === 1 && !remainder(part.followUp || part.core, matched[0].queryTerms)
                .split(' ').filter(t => t && !['and', 'also', 'then', 'so', 'ok', 'okay', 'what', 'about', 'how'].includes(t)).length;
            if (c.frame?.parts?.length && !part.pronoun && (part.followUp || bareName)) return followUp(part, matched, opts, c);
        }
        return runParts([part], opts, c);
    }
    function respond(text, opts, c) {
        const raw = String(text ?? '');
        if (!raw.trim()) return result('clarify', 'Type a question about the current guide.');
        if (raw.length > 2000) return result('clarify', 'Please ask one short question at a time (up to 2,000 characters).');
        const p = parseQuestion(raw, opts);
        rawText = raw;
        if (!p.q) return result('clarify', 'Type a question about the current guide.');
        // A choice button carries its own identity; its label is not reinterpreted.
        if (opts.choiceId) return choose(opts.choiceId, opts, c, { q: p.q, core: p.q, editions: [], pronoun: false, report: false }, true);
        if (HELP.test(p.q.replace(/[?!.\s]+$/, ''))) return helpReply();
        if (OFF_TOPIC.test(p.q)) return result('clarify', 'That is outside what this local guide can answer, and I cannot change how I work. I only answer questions about this guide from its own text. Ask about a character, item, spell, monster or quest by name.');
        if (/\b(sync|check|uncheck|mark)\b.*\b(checklist|checkbox|complete|done)\b/.test(p.q))
            return result('clarify', 'Use the named objective’s checkbox in the guide to change saved progress. Chat reports change this session only.');
        if (p.intent === 'reset') {
            if (p.q.includes('session')) { evidence.reset(); contexts.clear(); }
            else { c.messages = []; clearTopic(c); }
            return result('reset', 'Conversation reset.');
        }
        if (p.intent === 'smaller') {
            const requested = resolve(p.q, opts);
            const r = byId.get(c.lastRecord);
            if (!r) return result('clarify', 'Which previous hint should I make gentler?');
            if (requested.length && (requested.length !== 1 || requested[0].id !== (r.entityId || r.id)))
                return result('clarify', 'That names a different subject. Ask for a hint about that subject first.');
            const smallerRemainder = tokens(p.q).filter(token => !new Set([
                'a', 'the', 'please', 'give', 'me', 'can', 'you', 'smaller', 'gentler', 'less', 'revealing', 'vaguer',
                'subtler', 'softer', 'detail', 'detailed', 'hint', 'for', 'about', 'it', 'that', 'one', 'version',
                'answer', 'make', 'could', 'just', 'bit', 'little', 'ok', 'okay', 'too', 'much',
                ...(requested[0]?.queryTerms || [])
            ]).has(token));
            if (smallerRemainder.length) return result('clarify', 'Which previous hint should I make gentler? Please name one supported subject.');
            const current = authorize(r, ceiling);
            const rank = Math.min(LEVELS.indexOf(current?.level || 'gentle'),
                LEVELS.indexOf(c.lastLevel || current?.level || 'gentle'));
            if (!rank) return result('decline', 'That is already the gentlest authored hint for this subject.');
            const gentler = authorize(r, LEVELS[rank - 1]);
            if (!gentler) return decline('No gentler authored variant is available for this answer.');
            return answerRecord(gentler, c, opts.tone);
        }
        if (p.correction) return correct(p, c);
        if (/\b(?:don't|do not|not)\s+(?:tell|show|give|reveal|explain)\b/.test(p.q))
            return result('clarify', 'Understood. Ask for the specific information you do want, or select Gentle for a smaller hint.');
        if (p.hypothetical) {
            // Merely supposing ownership of the exact current subject does
            // not assert progress or erase that subject. A different or
            // qualified hypothetical must not leave the old referent active.
            const ownership = p.parts[0]?.q.match(/^if i (?:have|had) (?:the )?(.+)$/);
            const named = ownership ? resolve(ownership[1], opts) : [];
            const samePlainSubject = named.length === 1 && c.entities.length === 1 && named[0].id === c.entities[0]
                && normalize(ownership[1]) === normalize(named[0].queryTerms.join(' '));
            if (!samePlainSubject) clearTopic(c);
            return result('clarify', 'That condition is not established as your current progress. Ask about the named prerequisite, or state a current fact explicitly; no progress was changed.');
        }
        if (p.affirm) {
            if (pendingFresh(c) && c.pending.ids.length === 1)
                return choose(c.pending.ids[0], opts, c, { q: p.q, core: p.q, editions: [], pronoun: false, report: false }, false);
            return result('clarify', 'There is no single pending suggestion to confirm. Please name the subject and what you want to know.');
        }
        if (p.tooMany) return result('clarify', `Please ask up to ${MAX_PARTS} questions at a time so each answer stays grounded.`);
        if (p.subject) return changeSubject(p, opts, c);
        if (!p.parts.length && /^(?:hello|hi|hey|hiya|greetings|good (?:morning|evening|afternoon)|yo|howdy)\b/.test(p.q)) return helpReply('Hello! ');
        if (!p.parts.length) return result('clarify', /\b(?:thanks|thank you|thx|cheers)\b/.test(p.q)
            ? 'You are welcome. Ask another question about this guide whenever you like.'
            : `What would you like to know: ${whatMenu()}?`);
        if (p.parts.length === 1) return single(p.parts[0], opts, c);
        return runParts(p.parts, opts, c);
    }
    const api = {
        gameId,
        answer(text, opts = {}) {
            if (opts.expectedRevision !== undefined && opts.expectedRevision !== revision)
                return result('stale', 'The topic or settings changed. Ask again in the current context.');
            if (opts.spoiler && level(opts.spoiler) !== ceiling) api.setPolicy(opts.spoiler);
            const c = activate(opts.contextId);
            revision++;
            const reply = respond(text, opts, c);
            // Keep only recent, established subjects; names merely mentioned in
            // answer prose and unconfirmed search candidates never enter this list.
            if (!c.pending && c.entities.length === 1 && visible.some(record => record.entityId === c.entities[0]))
                c.recentSubjects = [c.entities[0], ...c.recentSubjects.filter(id => id !== c.entities[0])].slice(0, 2);
            else if (!c.pending && c.entities.length === 2 && c.entities.every(id => reply.recordIds.some(recordId => byId.get(recordId)?.entityId === id)))
                c.recentSubjects = [...new Set([...c.entities, ...c.recentSubjects])].slice(0, 2);
            else if (!c.entities.length) c.recentSubjects = [];
            if (reply.decision !== 'answer') c.lastAction = null;
            c.messages.push({ role: 'user', text: String(text).slice(0, 2000), level: ceiling },
                { role: 'assistant', ...reply });
            c.fallbackMessages.push(...c.messages.slice(-2));
            c.fallbackMessages = c.fallbackMessages.slice(-12);
            c.messages = c.messages.slice(-12);
            notify();
            return reply;
        },
        async answerAsync(text, opts = {}) {
            if (opts.expectedRevision !== undefined && opts.expectedRevision !== revision) return api.answer(text, opts);
            if (opts.spoiler) api.setPolicy(opts.spoiler);
            const c = activate(opts.contextId);
            const history = [...c.fallbackMessages];
            const restrictedFrame=(c.frame?.parts||[]).some(p=>p.guideOnly||p.carry?.guideOnly||p.story?.guideOnly||p.narrative?.guideOnly
                ||p.carry?.extra?.length||p.carry?.editions?.length||p.carry?.numbers?.length);
            let baseline;
            holdNotifications++;
            try { baseline = api.answer(text, {...opts, ...(opts.expectedRevision === undefined ? {} : {expectedRevision:revision})}); }
            finally { holdNotifications--; }
            const parsed = parseQuestion(text, opts);
            // Do not soften an unsupported past event into a related factual
            // quotation: that can appear to accept the event's presupposition.
            const pastEvent=q=>/\bwhy (?:did|was|were|had)\b|\bwhat (?:made|caused)\b/i.test(q||'');
            const priorPastEvent=history.at(-1)?.decision!=='answer' && pastEvent(history.findLast(m=>m.role==='user')?.text);
            const conversational = /\bwhy\b|\bwhat (?:makes|made|caused)\b|\b(?:eyes|eye colou?r|cute|hair)\b|\bhow does (?:it|that|this)\b|\b(?:say|put|explain|rephrase)\b.*\b(?:briefly|plainly|simply|casually|simpler)\b/i.test(text);
            const eligible = fallback?.state.status === 'ready' && ['clarify','decline'].includes(baseline.decision)
                && !baseline.choices?.length && !baseline.actions?.length && !baseline.conflicts?.length
                && !/\b(?:conflict|contradict|disputed|withheld|trustworthy|trust|recommend)\b/i.test(baseline.text+' '+text)
                && !pastEvent(text) && !priorPastEvent
                && parsed.parts.length === 1 && !parsed.hypothetical && !parsed.report
                && !parsed.parts.some(p=>p.guideOnly || p.report || p.editions?.length)
                && !/\b(?:only|not|never|without|except|best|worst|before|after|cheapest)\b/i.test(text)
                && !restrictedFrame && conversational;
            const packet = eligible ? guardPacket(buildTopicPacket({gameId,records,history,question:text,spoiler:ceiling,baseline}),{baseline}) : null;
            if (packet?.route !== 'model') { notify(); return baseline; }
            const ticket=revision, epoch=fallback.epoch, message=c.messages.at(-1);
            Object.assign(message,{text:'Looking at the guide…',decision:'pending',level:ceiling});
            notify();
            let wording=null;
            try { wording=await fallback.generate(packet); } catch { /* The approved program frame remains available. */ }
            if (revision!==ticket || fallback.state.status!=='ready' || fallback.epoch!==epoch) {
                Object.assign(message,baseline,{level:packet.ceiling}); notify();
                return result('stale','The topic or settings changed. Ask again in the current context.');
            }
            const checked=finalizeGuarded(wording,packet,packet);
            const reply={...baseline,text:checked.text,sources:checked.sources,level:ceiling,
                // These identifiers describe program-selected quoted context,
                // never an action or a progress claim inferred from model prose.
                fallbackRecordIds:packet.excerpts.map(e=>e.recordId),fallbackOrigin:checked.origin};
            Object.assign(message,reply);
            notify();
            return reply;
        },
        setPolicy(value) {
            const next = level(value);
            if (next === ceiling) return;
            ceiling = next; revision++; rebuild();
            for (const c of contexts.values()) {
                c.pending = null; c.lastAction = null;
                c.recentSubjects = c.recentSubjects.filter(id => visible.some(record => record.entityId === id));
            }
            notify();
        },
        activate(id) { activate(id); notify(); },
        getHistory(id = active) {
            const c = contexts.get(id);
            if (!c) return [];
            return c.messages.map(m => {
                if (LEVELS.indexOf(m.level) <= LEVELS.indexOf(ceiling)) return {
                    ...m, choices: m.revision === revision ? m.choices : [], actions: m.revision === revision ? m.actions : []
                };
                return { role: m.role, text: 'Earlier message hidden at this help level.', decision: 'hidden',
                    level: ceiling, actions: [], choices: [], recordIds: [], sources: [] };
            });
        },
        resetTopic(id = active) { contexts.delete(id); revision++; notify(); },
        resetSession() { contexts.clear(); evidence.reset(); revision++; notify(); },
        subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
        inspect() { return { gameId, revision, ceiling, contextCount: contexts.size, claimCount: evidence.claims.size,
            invalidationCount: evidence.invalidated.size, visibleRecords: visible.length, active,
            contexts: [...contexts.entries()].map(([id, c]) => ({ id, messages: c.messages.length, entities: c.entities.length,
                frame: c.frame ? c.frame.parts.map(p => p.intent) : [], lastRecords: c.lastRecords.length })) }; },
        get revision() { return revision; },
        get policy() { return ceiling; },
        evidence
    };
    return api;
}
