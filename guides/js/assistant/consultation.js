// Bounded source-backed decision controller. It selects authored criterion
// traits; it does not generate facts, infer software compatibility, or update
// guide/checklist progress. Catalog prose is displayed only as verified quotes.
import { authorize, level, LEVELS } from './policy.js';
import { normalize, tokens } from './retrieval.js';
import { parse, materialTerms, GUIDE_SOURCE } from './language.js';

const escape = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phraseRE = phrase => new RegExp(`(?<![\\p{L}\\p{N}])${escape(normalize(phrase))}(?![\\p{L}\\p{N}])`, 'gu');
const mentions = (text, phrase) => Boolean(phrase && phraseRE(phrase).test(normalize(text)));
const normalizedQuote = text => normalize(text).replace(/\s+/g, ' ');
const GAME_TITLES = { albion: ['albion'], ultima5: ['ultima v', 'ultima 5'], ultima6: ['ultima vi', 'ultima 6'],
    ultima7: ['ultima vii', 'ultima 7', 'the black gate'], alqadim: ['al-qadim', 'al qadim', "the genie's curse"], starcraft: ['starcraft'] };
const GENERIC = new Set('best better choose choosing choice choices option options recommend recommendation recommended recommending comparison compare opinion think suggest suggestion goal goals prefer preference priority prioritize playing play staying stay inside within native current currently versus vs for me personally suitable suited good one two either way route routes solution solutions setup setups need wanting looking help should which do you between pick picking option available based using guide party member companion character team frontline please objective support'.split(' '));
const comparisonMarker = text => /\b(?:which (?:one|option|route|setup|solution|companion|party member)|(?:what|who) (?:is|would be) (?:the )?best|best (?:option|choice|companion)|recommend|recommendation|help me (?:choose|pick)|choose between|compare|comparison|versus| vs )\b/.test(normalize(text));

// Parse complete option/criterion phrases; names, extra conditions, editions,
// sources and numbers are never inferred or discarded. A grammar match is not
// evidence that the named profile has the requested trait.
export function parseNamedOptionEvaluation(text) {
    if (typeof text !== 'string') return null;
    const sourceLead = new RegExp(`^(${GUIDE_SOURCE.source})\\s*[:,]\\s*`, 'iu');
    let question = text.trim().replace(/\?$/, '').trim();
    const source = sourceLead.exec(question);
    if (source) question = question.slice(source[0].length);
    let match = /^(?:would|could)\s+(.+?)\s+be\s+(?:a|an)\s+(worthwhile|good|suitable)\s+(.+)$/i.exec(question);
    if (!match) match = /^is\s+(.+?)\s+(?:a|an)\s+(worthwhile|good|suitable)\s+(.+)$/i.exec(question);
    if (match) {
        const criterionText = match[3].replace(/^(?:option|choice|companion|recruit)\s+for\s+/i, '');
        return Object.freeze({kind:'named-option-evaluation',subjectText:match[1],evaluation:match[2].toLowerCase(),criterionText,
            sourceText:source?.[1] || null,originalText:text});
    }
    match = /^(?:(?:would|could)\s+(.+?)\s+be|is\s+(.+?))\s+(worthwhile|good|suitable)\s+for\s+(.+)$/i.exec(question);
    if (match) return Object.freeze({kind:'named-option-evaluation',subjectText:match[1] || match[2],evaluation:match[3].toLowerCase(),criterionText:match[4],
        sourceText:source?.[1] || null,originalText:text});
    match = /^(?:(?:would|could)\s+(.+?)\s+be|is\s+(.+?))\s+(?:the\s+)?(best|strongest)(?:\s+(?:option|choice|companion|recruit))?\s+for\s+(.+)$/i.exec(question);
    return match ? Object.freeze({kind:'named-option-evaluation',subjectText:match[1] || match[2],evaluation:match[3].toLowerCase(),criterionText:match[4],
        sourceText:source?.[1] || null,originalText:text}) : null;
}
const entireLabel = value => normalize(value).replace(/^(?:the|a|an)\s+/, '');

export function createConsultation({ gameId, records, catalog }) {
    if (!['albion', 'ultima5', 'ultima6', 'ultima7', 'alqadim', 'starcraft'].includes(gameId)) throw new Error('Unsupported guide game.');
    if (!Array.isArray(records)) throw new TypeError('Consultation records must be an array.');
    const game = catalog?.games?.[gameId] || { profiles: [], criteria: [], editions: [] };
    if (!Array.isArray(game.profiles) || !Array.isArray(game.criteria) || !Array.isArray(game.editions)) throw new TypeError('Invalid consultation game catalog.');
    let context = { editionId: null, criterionIds: [], active: false, unsupportedEdition: null, blockedCondition: null, guideOnly: false };
    const reset = () => { context = { editionId: null, criterionIds: [], active: false, unsupportedEdition: null, blockedCondition: null, guideOnly: false }; };
    const inspect = () => ({ gameId, ...context, criterionIds: [...context.criterionIds] });
    const editionFor = text => game.editions.filter(edition => (edition.aliases || []).some(alias => mentions(text, alias)));
    function plan(text, packet = {}, opts = {}) {
        if (!game.profiles.length || !game.criteria.length) return null;
        const originalText = String(text ?? ''), q = normalize(originalText), ceiling = level(opts.spoiler ?? 'direct');
        const parsed = parse(originalText);
        const namedEvaluation = parseNamedOptionEvaluation(originalText);
        if (['reset', 'smaller'].includes(parsed.intent) || /^(?:help|help me|what can you do)[?!.]*$/.test(q)) { reset(); return null; }
        if (/^new topic\b/.test(q)) reset();
        const modelComparison = packet.intent === 'comparison' || (!packet.intent && packet.modelIntent === 'comparison');
        const explicitComparison = comparisonMarker(q);
        const routeOrigin = modelComparison ? 'model-consultation' : 'explicit-consultation';
        const explicitCriteria = game.criteria.filter(criterion => namedEvaluation
            ? [criterion.label,...(criterion.aliases || [])].some(alias => entireLabel(alias) === entireLabel(namedEvaluation.criterionText))
            : (criterion.aliases || []).some(alias => mentions(q, alias)));
        const namedProfiles = namedEvaluation ? game.profiles.filter(profile => [profile.title,...(profile.aliases || [])]
            .some(name => entireLabel(name) === entireLabel(namedEvaluation.subjectText))) : [];
        const editions = editionFor(q);
        const inheritedEditions = (packet.restrictions?.editions || []).flatMap(value => editionFor(value));
        const recognized = [...new Map([...editions, ...inheritedEditions].map(edition => [edition.id, edition])).values()];
        // A specific alias wins over a contained general edition alias, e.g.
        // Brood War 1.16.1 also contains the words "Brood War".
        const longest = recognized.filter(edition => !recognized.some(other => other.id !== edition.id
            && (other.aliases || []).some(long => (edition.aliases || []).some(short => normalize(long).includes(normalize(short)) && normalize(long) !== normalize(short)))));
        const sourceEditions = [...new Set([...parsed.editions, ...(packet.restrictions?.editions || [])])];
        const unknownEdition = sourceEditions.find(value => !editionFor(value).length);
        const playing = q.match(/\b(?:i am|i'm|i currently am|i am currently) (?:playing|using|on)\s+([^!?;]+)/);
        let playingRemainder = playing?.[1].split(/\.(?=\s|$)|,|\s+and\s+(?=which|what|want|prefer|need)/)[0] || '';
        const contextNames = [...game.editions.flatMap(edition => edition.aliases || []), ...game.profiles.flatMap(profile => [profile.title, ...(profile.aliases || [])]),
            ...GAME_TITLES[gameId]];
        for (const name of contextNames.sort((a, b) => b.length - a.length)) playingRemainder = playingRemainder.replace(phraseRE(name), ' ');
        const unknownPlaying = playing && tokens(playingRemainder).some(word => !['the', 'game', 'edition', 'version'].includes(word));
        const preferenceUpdate = /^(?:actually\b|instead\b|i (?:want|prefer|need)\b|my (?:goal|priority)\b|what about\b|how about\b)/.test(q)
            || explicitCriteria.some(criterion => (criterion.aliases || []).some(alias => normalize(alias) === q.replace(/[?!.]+$/, '')));
        const isRequest = Boolean(namedEvaluation) || modelComparison || explicitComparison || (context.active && explicitCriteria.length > 0 && preferenceUpdate);
        const clarify = (message, reason) => ({ reply: { decision: 'clarify', text: message, recordIds: [], sources: [], actions: [], stateChanges: [], level: ceiling },
            context: inspect(), routeOrigin, modelIntent: packet.modelIntent ?? packet.intent ?? null, reason });
        // An informational mention of an edition is not a player preference.
        // Only an explicit session statement or consultation constraint binds it.
        if (!isRequest && !playing) return null;
        if (unknownEdition || unknownPlaying || longest.length > 1) {
            context.unsupportedEdition = unknownEdition || playing?.[1] || 'ambiguous edition'; context.editionId = null; context.criterionIds = [];
            return isRequest ? clarify('Name the guide edition and one goal to compare. I cannot rank options for that unsupported or ambiguous edition.', 'unsupported-edition') : null;
        }
        if (longest.length === 1) { context.editionId = longest[0].id; context.unsupportedEdition = null; }
        if (!isRequest) return null;
        context.active = true;
        if (context.unsupportedEdition) return clarify('Name a supported guide edition and one goal before choosing an option.', 'unsupported-edition');
        const guideOnly = context.guideOnly || parsed.parts.some(part => part.guideOnly) || Boolean(packet.restrictions?.guideOnly);
        context.guideOnly = guideOnly;
        if (namedEvaluation && (namedProfiles.length !== 1 || explicitCriteria.length !== 1 || ['best','strongest'].includes(namedEvaluation.evaluation))) {
            context.blockedCondition = 'unsupported-condition'; context.criterionIds = [];
            return clarify('Name one known option and one complete guide-backed goal. The guide does not establish that requested evaluation.', 'unsupported-named-evaluation');
        }
        // Remove only declared source/edition/goal phrases before checking for
        // unsupported residual requirements. A quote or negated goal cannot
        // silently become a positive preference.
        let remainder = namedEvaluation ? normalize(`${namedEvaluation.subjectText} ${namedEvaluation.criterionText}`)
            : q.replace(new RegExp(GUIDE_SOURCE.source, 'gu'), ' ');
        const declared = [...game.criteria.flatMap(criterion => criterion.aliases || []), ...game.editions.flatMap(edition => edition.aliases || []),
            ...game.profiles.flatMap(profile => [profile.title, ...(profile.aliases || [])]), ...GAME_TITLES[gameId]];
        for (const phrase of declared.sort((a, b) => b.length - a.length)) remainder = remainder.replace(phraseRE(phrase), ' ');
        const negative = /\b(?:not|never|no|without|cannot|cant|wont|dont|doesnt|isnt|arent)\b|\b\w+n't\b/.test(remainder);
        const hypothetical = parsed.hypothetical || /\b(?:if|unless|assuming|suppose|supposing|imagine)\b/.test(remainder);
        const numbers = tokens(remainder.replace(/\bwhich one\b/g, '')).some(word => /\d/.test(word) || /^(?:zero|two|three|four|five|six|seven|eight|nine|ten|many|few|several|all|every|both|exactly)$/.test(word));
        const unsupported = /\b(?:price|prices|cost|costs|cheapest|cheap|budget|free|paid|pay|online|multiplayer|internet|compatible|compatibility|morality|moral|trustworthy|evil|strongest)\b/.test(remainder);
        const residual = materialTerms(remainder).filter(word => !GENERIC.has(word));
        const inherited = packet.restrictions || {};
        const declaredWords = new Set(declared.flatMap(phrase => tokens(phrase)));
        const unresolvedInherited = packet.blockReplay && (inherited.negation || inherited.hypothetical || inherited.progress
            || (inherited.quantities || []).some(word => !['only', 'one'].includes(word) && !declaredWords.has(word))
            || (inherited.material || []).some(word => !GENERIC.has(word) && !declaredWords.has(word)));
        if (negative || hypothetical || numbers || unsupported || residual.length || unresolvedInherited || parsed.correction || parsed.parts.some(part => part.report)) {
            context.blockedCondition = 'unsupported-condition'; context.criterionIds = [];
            return clarify('Choose one guide-backed goal. That additional condition is not modeled well enough to rank the options safely.', 'unsupported-condition');
        }
        if (context.blockedCondition && !explicitCriteria.length) return clarify('Please restate one supported goal. The earlier unsupported condition is still unresolved.', 'unresolved-condition');
        if (explicitCriteria.length) context.blockedCondition = null;
        const criteria = explicitCriteria.length ? explicitCriteria : game.criteria.filter(criterion => criterion.edition && criterion.edition === context.editionId);
        if (criteria.length !== 1) {
            return clarify(`Which goal matters most: ${game.criteria.map(criterion => criterion.label).join(', ')}?`, criteria.length ? 'multiple-goals' : 'goal-required');
        }
        const criterion = criteria[0]; context.criterionIds = [criterion.id];
        const rawById = new Map(records.map(record => [record.id, record]));
        const authorized = new Map(records.map(record => authorize(record, ceiling)).filter(Boolean).map(record => [record.id, record]));
        function verify(witness) {
            if (!authorized.has(witness?.recordId)) return null;
            const requestedLevel = witness.variant || ceiling;
            if (!LEVELS.includes(requestedLevel) || LEVELS.indexOf(requestedLevel) > LEVELS.indexOf(ceiling)) return null;
            const record = authorize(rawById.get(witness.recordId), requestedLevel);
            if (!record || record.conflict || (guideOnly && record.source?.review === 'external-research') || typeof witness.quote !== 'string' || !witness.quote.trim()
                || (witness.variant && witness.variant !== record.level) || !normalizedQuote(record.text).includes(normalizedQuote(witness.quote))
                || (witness.source && ![record.source, record.source?.basedOn].some(source => source
                    && witness.source.file === source.file && witness.source.locator === source.locator))) return null;
            return record;
        }
        const verified = witnesses => Array.isArray(witnesses) && witnesses.length > 0 && witnesses.every(witness => verify(witness));
        function eligible(profile, goal) {
            const trait = (profile.traits || []).find(item => item.criterion === goal.id && item.value === true);
            const visibleNames = [...authorized.values()].filter(record => record.entityId === profile.entityId).flatMap(record => [record.title, ...record.aliases]);
            if (!visibleNames.some(name => normalize(name) === normalize(profile.title)) || !trait || !verified(profile.witnesses) || !verified(trait.witnesses)) return null;
            for (const constraint of profile.constraints || []) {
                if (!['requires-edition', 'unconfirmed-edition'].includes(constraint.type) || !Array.isArray(constraint.editions)) return null;
                if (constraint.type === 'unconfirmed-edition' && constraint.editions.includes(context.editionId)) return null;
                if (constraint.type === 'requires-edition' && (!constraint.editions.includes(context.editionId) || !verified(constraint.witnesses))) return null;
            }
            const prose = [...(profile.summaries || []), ...(profile.limitations || [])];
            if (!prose.length || prose.some(item => !verified(item.witnesses) || !item.witnesses.some(witness => normalizedQuote(item.text) === normalizedQuote(witness.quote)))) return null;
            return { profile, trait, prose };
        }
        const candidates = (namedEvaluation ? namedProfiles : game.profiles).map(profile => eligible(profile, criterion)).filter(Boolean);
        if (candidates.length !== 1) return clarify('The authorized guide evidence does not establish one option for that goal and edition. Choose another goal or name an option to inspect.', candidates.length ? 'ambiguous-evidence' : 'evidence-unavailable');
        const selected = candidates[0], selections = [selected];
        const paragraphs = [namedEvaluation
            ? `For ${criterion.label}, the guide supports ${selected.profile.title}.`
            : `For ${criterion.label}, I would choose ${selected.profile.title}, based on this guide.`, ...selected.prose.map(item => item.text)];
        for (const alternativeId of namedEvaluation ? [] : criterion.alternatives || []) {
            const alternativeGoal = game.criteria.find(item => item.id === alternativeId);
            if (!alternativeGoal) continue;
            const options = game.profiles.filter(profile => profile.entityId !== selected.profile.entityId).map(profile => eligible(profile, alternativeGoal)).filter(Boolean);
            if (options.length === 1) {
                selections.push(options[0]);
                paragraphs.push(`If you instead prioritize ${alternativeGoal.label}, consider ${options[0].profile.title}.`, ...options[0].prose.map(item => item.text));
            }
        }
        const evidence = new Map();
        for (const selection of selections) for (const witness of [...selection.profile.witnesses, ...selection.trait.witnesses, ...selection.prose.flatMap(item => item.witnesses)]) {
            const record = verify(witness); if (record) evidence.set(record.id, record);
        }
        const facts = [...evidence.values()];
        return { reply: { decision: 'answer', text: [...new Set(paragraphs)].join('\n\n'), recordIds: facts.map(record => record.id), sources: facts.map(record => record.source),
            title: selected.profile.title, actions: [], stateChanges: [], level: facts.reduce((highest, record) => LEVELS.indexOf(record.level) > LEVELS.indexOf(highest) ? record.level : highest, 'gentle') },
            focusEntityId: selected.profile.entityId, recommendationEntityId: selected.profile.entityId, criterionId: criterion.id, context: inspect(), routeOrigin,
            modelIntent: packet.modelIntent ?? packet.intent ?? null, reason: namedEvaluation ? 'authorized-named-criterion-match' : 'unique-authorized-criterion-match' };
    }
    return { plan, reset, inspect };
}
