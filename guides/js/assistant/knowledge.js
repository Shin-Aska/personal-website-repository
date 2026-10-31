// Reviewed facets refine existing authorized source passages. Graph edges are
// authored evidence indexes, never facts inferred from names occurring together.
import { authorize } from './policy.js';
import { normalize, tokens, kindGroup, isCommonWord } from './retrieval.js';
import { parse, SCAFFOLD, playerStateQuestion, sourceQuestionParts } from './language.js';
import {buildSourceFieldIndex} from './source-field-index.js';
import {parseSourceRequestFrame} from './request-frame.js';
import {planSourceFields,sourceFieldScopeAllows,resolveSourceFrameIdentity} from './source-field-router.js';
import {guardSourceFieldReply,sourceFallbackFrame} from './source-field-guard.js';
import {sourceFieldReferents} from './source-field-arguments.js';
import { lookupGraphQuestion, graphReferenceRoles, readGraphQuestion } from './knowledge-graph.js';
import { matchRecordedCondition, resolveRecordedCondition } from './recorded-conditions.js';
import { parseRequestedMeasurement, supportsRequestedMeasurement } from './requested-measurements.js';
import {compileSourceContexts, factSourceContexts} from './source-contexts.js';
import {matchStaticPropertyCondition, resolveStaticPropertyCondition} from './static-property-conditions.js';
import {readSourcePreamble} from './source-preambles.js';
import {sourceLocationContext,sourceActorLocationContext} from './source-location-context.js';
import {parseProceduralRequest,supportsProceduralRequest} from './procedural-requests.js';
import {parseMethodAssertion,supportsMethodAssertion} from './method-assertions.js';
import {readSceneTransitionQuestion} from './scene-transition-preambles.js';
import {parseFactualPropertyRequest,supportsFactualPropertyRequest} from './factual-property-requests.js';
import {parseBundleRequest,resolveBundleReference} from './bundle-references.js';
import {parseSoftwareCapabilityRequest,supportsSoftwareCapabilityRequest,readSoftwareSemanticFields} from './software-capabilities.js';
import {parseNamedSourceFieldRequest,supportsNamedSourceFieldRequest} from './named-source-fields.js';
import {parseProcedurePhaseRequest,supportsProcedurePhaseRequest,procedurePhaseScopeLabels,continuationAfterAcquisition,reviewedAfterDependency,optionalActivitiesForObjective,alternativeToProposedCombat,versionedStatClaim,completionAfterReportedRecovery} from './procedure-phase-fields.js';
import {contradictoryIdentity,accusedVictimContrast} from './source-role-contrasts.js';
import {selectSourceNarrativeAnswer,validateSourceNarrativeReply} from './source-narrative-answer.js';
import {selectSourceConflictQuotation,sourceConflictQuotationReply,validateSourceConflictQuotationReply} from './source-conflict-quotation.js';
import {parseResourceConditionRequest,supportsResourceConditionRequest} from './resource-condition-requests.js';
import {parseSequenceFieldRequest,supportsSequenceFieldRequest} from './sequence-field-requests.js';
import {parseDescriptiveReferenceRequest,supportsDescriptiveReferenceRequest} from './descriptive-reference-requests.js';
import {parseQuestionSourceAttribution,supportsQuestionSourceAttribution} from './question-source-attribution.js';

const GAMES = new Set(['albion', 'ultima5', 'ultima6', 'ultima7', 'alqadim', 'starcraft']);
const nonempty = value => typeof value === 'string' && Boolean(value.trim());
const ANSWER_RELATIONS = new Set(['identity', 'explanation', 'location', 'destination', 'route', 'acquisition', 'recruitment',
    'use', 'method', 'prerequisites', 'stats', 'combat', 'outcome', 'cause', 'creator', 'documentation', 'support', 'download',
    'installation', 'configuration', 'version', 'comparison', 'limitations', 'objective', 'sequence', 'purpose', 'relationship']);
const key = value => tokens(value).join('');
const slug = value => tokens(value).join('-');
const copy = value => JSON.parse(JSON.stringify(value));
const urlOK = value => {
    try { const url = new URL(value); return /^https?:$/.test(url.protocol) && !url.username && !url.password; }
    catch { return false; }
};
const FACET_RELATIONS = {
    identity: 'explanation', explanation: 'explanation', definition: 'explanation', creator: 'explanation',
    location: 'location', destination: 'location', route: 'use', travel: 'use',
    acquisition: 'acquisition', recruitment: 'acquisition', download: 'acquisition', reward: 'acquisition',
    use: 'use', method: 'use', setup: 'use', installation: 'use', procedure: 'use',
    requirement: 'prerequisites', prerequisites: 'prerequisites', requirements: 'prerequisites',
    stats: 'stats', combat: 'combat', remedy: 'remedy', troubleshooting: 'remedy'
    , objective: 'hint'
};
const normalizedSource = source => source && ({ file: source.file, locator: source.locator, review: source.review });
export const knowledgeDocument = fact => `${fact.subject}. ${fact.facet}. ${(fact.aliases || []).join(', ')}. ${fact.text}`.slice(0, 2000);
export function attachKnowledgeEmbeddings(knowledge, catalog, profile) {
    if (catalog?.schemaVersion !== 1 || catalog.gameId !== knowledge.gameId || catalog.dimensions !== 384
        || catalog.modelId !== profile.modelId || catalog.revision !== profile.revision
        || !Array.isArray(catalog.documents) || catalog.documents.length !== knowledge.facts.length) throw new Error('Knowledge embeddings do not match the approved encoder.');
    const byId = new Map(catalog.documents.map(document => [document.factId, document]));
    if (byId.size !== catalog.documents.length) throw new Error('Duplicate knowledge embeddings.');
    for (const fact of knowledge.facts) {
        const document = byId.get(fact.id), vector = document?.vector;
        if (document?.text !== knowledgeDocument(fact) || !Array.isArray(vector) || vector.length !== 384
            || vector.some(value => !Number.isFinite(value)) || Math.abs(Math.hypot(...vector) - 1) > 0.001) throw new Error(`Invalid knowledge embedding: ${fact.id}`);
        fact.vector = [...vector];
    }
    return knowledge;
}

export function buildKnowledge(gameId, baseRecords, manifest) {
    if (!GAMES.has(gameId) || !Array.isArray(baseRecords)) throw new TypeError('A supported game and its source records are required.');
    const issues = [];
    if (manifest?.schemaVersion !== 1 || manifest.gameId !== gameId || !Array.isArray(manifest.facts))
        throw new TypeError(`Invalid ${gameId} knowledge manifest.`);
    const visible = baseRecords.map(record => authorize(record, 'direct')).filter(Boolean);
    const byId = new Map(visible.map(record => [record.id, record]));
    const entities = new Map();
    for (const record of visible) {
        const current = entities.get(record.entityId);
        const names = [...new Set([record.title, ...record.aliases].filter(nonempty))];
        if (!current) entities.set(record.entityId, { id: record.entityId, name: record.title,
            kind: record.subjectKind || record.kind, aliases: names, recordIds: [record.id], declared: false });
        else {
            current.aliases = [...new Set([...current.aliases, ...names])]; current.recordIds.push(record.id);
            if (record.title.length < current.name.length) current.name = record.title;
            if (!kindGroup(current.kind) && kindGroup(record.subjectKind || record.kind)) current.kind = record.subjectKind || record.kind;
        }
    }
    const declaredIds = new Map();
    const canonicalId = value => {
        if (entities.has(value)) return value;
        if (declaredIds.has(value)) return declaredIds.get(value);
        return String(value).startsWith(`${gameId}:`) ? value : `${gameId}:knowledge-entity:${slug(value)}`;
    };
    for (const entity of manifest.entities || []) {
        if (![entity?.id, entity?.name, entity?.kind].every(nonempty)) { issues.push('Invalid entity declaration.'); continue; }
        const candidates = [...entities.values()].filter(candidate => key(candidate.name) === key(entity.name));
        const id = entities.has(entity.id) ? entity.id : candidates.length === 1 ? candidates[0].id : canonicalId(entity.id);
        declaredIds.set(entity.id, id);
        const prior = entities.get(id);
        entities.set(id, { id, name: entity.name, kind: entity.kind === 'topic' && prior && kindGroup(prior.kind) ? prior.kind : entity.kind,
            aliases: [...new Set([entity.name, ...(entity.aliases || []), ...(prior?.aliases || [])])],
            recordIds: prior?.recordIds || [], declared: true });
    }
    const facts = [], factIds = new Set();
    for (const [index, fact] of manifest.facts.entries()) {
        const fail = message => issues.push(`${fact?.id || index}: ${message}`);
        if (![fact?.id, fact?.subject, fact?.facet, fact?.text, fact?.witness].every(nonempty)
            || fact.text !== fact.witness || factIds.has(fact.id)
            || !nonempty(fact.source?.file) || !nonempty(fact.source?.locator)) { fail('Invalid or duplicate fact/source witness.'); continue; }
        if (!Array.isArray(fact.answerRelations) || !fact.answerRelations.length || new Set(fact.answerRelations).size !== fact.answerRelations.length
            || fact.answerRelations.some(relation => !ANSWER_RELATIONS.has(relation))) { fail('Explicit reviewed answer capabilities are required.'); continue; }
        const research = fact.source.review === 'external-research';
        let witness;
        if (research) {
            if (!Array.isArray(fact.source.references) || !fact.source.references.length
                || fact.source.references.some(ref => !nonempty(ref.label) || !urlOK(ref.url) || !/^\d{4}-\d{2}-\d{2}$/.test(ref.checkedAt || ''))
                || !fact.researchWitness || !urlOK(fact.researchWitness.url)
                || !fact.source.references.some(ref => ref.url === fact.researchWitness.url && ref.checkedAt === fact.researchWitness.checkedAt)) { fail('Research requires dated references and a reviewed witness.'); continue; }
        } else {
            const candidates = fact.sourceRecordId ? [byId.get(fact.sourceRecordId)].filter(Boolean) : visible;
            witness = candidates.find(record => record.source?.review !== 'external-research'
                && record.text.includes(fact.witness)
                && (record.source.file === fact.source.file || record.source.basedOn?.file === fact.source.file
                    || record.source.claims?.some(claim => claim.source.file === fact.source.file)));
            if (!witness) { fail('Witness is absent from its authorized guide source.'); continue; }
        }
        if (fact.listMembers !== undefined && (!Array.isArray(fact.listMembers) || !fact.listMembers.length
            || fact.listMembers.some(name => !nonempty(name) || !fact.witness.includes(name)))) { fail('List member is absent from its source witness.'); continue; }
        let entityId = fact.entityId ? canonicalId(fact.entityId) : null;
        if (!entityId) {
            let candidates = [...entities.values()].filter(entity => entity.declared && entity.aliases.some(alias => key(alias) === key(fact.subject)));
            if (!candidates.length) candidates = [...entities.values()].filter(entity => key(entity.name) === key(fact.subject));
            entityId = candidates.length === 1 ? candidates[0].id : `${gameId}:knowledge-entity:${slug(fact.subject)}`;
        }
        if (!entities.has(entityId)) entities.set(entityId, { id: entityId, name: fact.subject,
            kind: fact.kind || 'topic', aliases: [fact.subject], recordIds: [], declared: true });
        const entity = entities.get(entityId), id = `${gameId}:knowledge:${fact.id.replace(new RegExp(`^${gameId}:knowledge:`), '')}`;
        const source = { ...copy(fact.source), index: { file: `guides/data/assistant/knowledge/${gameId}.json`,
            locator: `facts[${index}]`, review: 'authored-index' } };
        const relation = FACET_RELATIONS[fact.facet] || 'explanation';
        const record = { id, entityId, title: entity.name, aliases: [...new Set([entity.name, ...entity.aliases])],
            kind: relation === 'prerequisites' ? 'setup' : entity.kind, subjectKind: entity.kind,
            relation, scope: 'reference', minSpoiler: 'direct', requires: null,
            editions: [...new Set([...(witness?.editions || []), ...(fact.editions || [])])],
            conflict: Boolean(fact.conflict || witness?.conflict), variants: { direct: { text: fact.text } }, source };
        const resources = (fact.links || []).filter(link => nonempty(link.label) && urlOK(link.url));
        const compiled = { ...copy(fact), id: fact.id, entityId, recordId: id, record,
            sourceRecordId: witness?.id || fact.sourceRecordId || null, resources };
        facts.push(compiled); factIds.add(fact.id); entity.recordIds.push(id);
    }
    const byFactId = new Map(facts.map(fact => [fact.id, fact])), links = [];
    const namedSubjects = new Set([...entities.values()].filter(entity => kindGroup(entity.kind))
        .map(entity => key(entity.name)));
    for (const fact of facts) {
        if (fact.topicLabels !== undefined && (!Array.isArray(fact.topicLabels) || !fact.topicLabels.length
            || fact.topicLabels.some(label => !nonempty(label) || tokens(label).length < 2 || namedSubjects.has(key(label)))))
            issues.push(`${fact.id}: invalid descriptive topic labels.`);
        fact.bindings = [];
        if (fact.answerBindings === undefined) continue;
        if (!Array.isArray(fact.answerBindings) || !fact.answerBindings.length) {
            issues.push(`${fact.id}: invalid answer subject bindings.`); continue;
        }
        const bound = new Set();
        for (const binding of fact.answerBindings) {
            const target = canonicalId(binding?.entityId), entity = entities.get(target);
            const roles = binding?.relations;
            const labels = entity && tokens([entity.name, ...(entity.aliases || [])].join(' '));
            if (!entity || bound.has(target) || !Array.isArray(roles) || !roles.length
                || new Set(roles).size !== roles.length || roles.some(role => !fact.answerRelations.includes(role))
                || !nonempty(binding.mention) || !fact.witness.includes(binding.mention)
                || !tokens(binding.mention).some(term => labels.includes(term))) {
                issues.push(`${fact.id}: answer subject binding lacks a known target, supported role or literal mention.`); continue;
            }
            bound.add(target); fact.bindings.push({entityId:target, relations:[...roles], mention:binding.mention});
        }
    }
    for (const fact of facts) for (const [aspect, ids] of Object.entries(fact.support || {})) {
        if (!/^[a-z]+$/.test(aspect) || !Array.isArray(ids) || ids.length > 3
            || ids.some(id => id === fact.id || !byFactId.has(id))) issues.push(`${fact.id}: invalid supporting evidence.`);
    }
    const linkIds = new Set();
    for (const link of manifest.links || []) {
        const from = canonicalId(link.from), to = canonicalId(link.to);
        if (!nonempty(link.id) || linkIds.has(link.id) || !nonempty(link.relation) || !entities.has(from) || !entities.has(to)
            || !Array.isArray(link.evidenceFactIds) || !link.evidenceFactIds.length || link.evidenceFactIds.some(id => !byFactId.has(id))
            || !['recorded', 'conditional', 'disputed'].includes(link.status)) { issues.push(`${link.id || '(link)'}: invalid endpoint, status or evidence.`); continue; }
        links.push({ ...copy(link), from, to }); linkIds.add(link.id);
    }
    const superseded = new Set();
    for (const override of manifest.overrides || []) {
        if (!byId.has(override.recordId) || !nonempty(override.reason) || !override.evidenceFactIds?.length
            || override.evidenceFactIds.some(id => !byFactId.get(id)?.conflict || byFactId.get(id)?.source.review !== 'external-research')) {
            issues.push(`${override.recordId || '(override)'}: missing reviewed conflict evidence.`); continue;
        }
        superseded.add(override.recordId);
    }
    const count = (list, select) => Object.fromEntries([...new Set(list.map(select))].sort().map(value => [value, list.filter(item => select(item) === value).length]));
    const sourceRecords = baseRecords.map(record => superseded.has(record.id) ? { ...record, conflict: true } : record);
    const sourceContexts = compileSourceContexts({contexts:(manifest.sourceContexts || []).map(context=>({...context,entityId:canonicalId(context.entityId)})),
        entities,sourceRecords:sourceRecords.map(record=>authorize(record,'direct')).filter(Boolean)});
    issues.push(...sourceContexts.issues);
    const knowledge={ gameId, facts, entities, entityIdMap:new Map(declaredIds), links, issues, sourceContexts:sourceContexts.contexts, sourceRecords, records: [...sourceRecords, ...facts.map(fact => fact.record)],
        coverage: { sourceRecords: baseRecords.length, authorizedSourceRecords: visible.length, sourceEntities: new Set(visible.map(record => record.entityId)).size,
            focusedFacts: facts.length, graphEntities: entities.size, directedLinks: links.length,
            facets: count(facts, fact => fact.facet), predicates: count(links, link => link.relation),
            sources: count(facts, fact => fact.source.review), rejected: issues.length } };
    knowledge.sourceFields=buildSourceFieldIndex(knowledge,{canonicalize:canonicalId});
    issues.push(...knowledge.sourceFields.issues);knowledge.coverage.rejected=issues.length;
    return knowledge;
}

const FILL = new Set(("a an the i i'm i've we're we'd me my you your our it its he him his she her they them their this that these those there here " +
    'is are was were be been do does did can could would should will shall to for of in at on by from with and or as ' +
    'who what where how why when which tell explain describe please about also then now okay ok exactly ' +
    'get got getting obtain acquire find locate take bring give use need require required requirements requirement ' +
    'before after next step steps go reach travel return ask say called name named have has help want like ' +
    'guide according says say recorded stated listed game play playing answer actually really just too switching').split(' '));
const stems = new Map(Object.entries({
    recruited: 'recruit', recruiting: 'recruit', recruitment: 'recruit', hire: 'recruit', join: 'recruit', joins: 'recruit',
    obtain: 'acquire', get: 'acquire', retrieve: 'acquire', receive: 'acquire', acquire: 'acquire', acquisition: 'acquire',
    requires: 'requirement', required: 'requirement', requirements: 'requirement', prerequisites: 'requirement', need: 'requirement', needs: 'requirement',
    permission: 'permission', consent: 'permission', buy: 'purchase', buying: 'purchase', sold: 'purchase', sells: 'purchase',
    killed: 'kill', murdered: 'murder', gives: 'give', giver: 'give', makes: 'make', maker: 'make', teaches: 'teach',
    using: 'use', used: 'use', activate: 'use', activation: 'use', install: 'setup', installation: 'setup', configure: 'setup',
    download: 'download', downloads: 'download', downloading: 'download', url: 'link', links: 'link', website: 'link',
    located: 'location', whereabouts: 'location', coordinates: 'location', location: 'location',
    route: 'route', reach: 'route', travel: 'route', walk: 'route', directions: 'route',
    effects: 'effect', purpose: 'effect', function: 'effect', does: 'do', stats: 'stat', statistics: 'stat', attributes: 'stat'
    , fight: 'combat', fighting: 'combat', tactics: 'combat', lead: 'route', leads: 'route', leading: 'route',
    wrote: 'creator', written: 'creator', authored: 'creator', created: 'creator', developed: 'creator',
    giving: 'give', provided: 'provide', providing: 'provide', quarantined: 'quarantine',
    saving: 'save', saved: 'save', detects: 'detect', detection: 'detect', detecting: 'detect',
    documentation: 'documentation', docs: 'documentation', documented: 'documentation',
    directories: 'directory', folders: 'folder', binaries: 'binary', versions: 'version', finishing: 'finish',
    helping: 'help', copies: 'copy', stash: 'hide', stashing: 'hide', powered: 'power', powering: 'power', approval:'permission', collect:'acquire', extracted:'extract', avoiding:'avoid'
}));
const word = value => {
    const base = value.replace(/'s$/, '').replace(/^([\p{L}]+)-type$/u, '$1');
    return stems.get(base) || base.replace(/s$/, '');
};
const words = value => [...new Set(tokens(value).map(word))];
const QUESTION_WORDS = new Set(('happen happens happening outcome report reporting complete finish start end enter leave ' +
    'stand means mean abbreviation role strength strengths limitation limitations limit limits benefit benefits downside downsides ' +
    'documentation docs wiki support community server subreddit page linked link listed list recommendation recommend recommends ' +
    'release version architecture folder directory setting settings configured configuration setup installation install ' +
    'cost price prices expensive cheap train training taught teach spell scroll spellbook stat stats statistic statistic' +
    ' method preparation prepare placement tool problem story investigation consequence confrontation automatic important ' +
    'afterwards instead next first one say says give provides provide repeated repeatedly compare compared comparison ' +
    'different difference choose choice option options work works source binary binaries game client bot api program ' +
    'use used available need needs requirement required request requests controls control input command instructions ' +
    'deliver prepare preparation navigate start finish follow cross assemble place placement arrange approach show expose ' +
    'reporting report request rune book entrance handle inspect recover log login open select save saving menu type ' +
    'put extract downloaded downloading look check checks do would should could can might sometimes during ongoing still file ' +
    'separate directly own initial first launch online offline just same another read developer development ' +
    'reviewed established specify specifies detect detectible matching additional resource resources').split(/\s+/).map(word));
const QUESTION_SCAFFOLD = new Set([...SCAFFOLD].map(word));
const NAME_FILL=new Set(['a','an','the','of','for','in','at','on','by','from','with','and','or','to',
    'who','whose','what','where','when','why','how','which']);
const hasPhrase = (text, phrase) => {
    const query = tokens(text).map(value => value.replace(/'s$/, '')).join(' ');
    const label = tokens(phrase).map(value => value.replace(/'s$/, '')).join(' ');
    // Reordered names may omit articles/prepositions. Action words remain
    // part of an authored label: "key use" cannot match "get the key" by
    // dropping "use" as ordinary question scaffolding.
    const significant = tokens(phrase).filter(value => !NAME_FILL.has(value));
    // A reordered multiword label may appear as a passive participle: "the
    // cyclops to be escorted" contains the label "cyclops escort". A gerund
    // ("after visiting") is a separate event and does not match.
    const words = tokens(text), inflected = value => words.includes(value)
        || value.length >= 4 && words.some(word => [`${value}ed`, `${value}d`].includes(word));
    return Boolean(label) && (` ${query} `).includes(` ${label} `)
        || (label.length >= 6 && words.some(value => value === label.replace(/ /g, '')))
        || (significant.length >= 2 && significant.every(inflected));
};
const GROUPS = {
    identity: ['identity', 'explanation', 'definition', 'overview', 'features'],
    purpose: ['purpose', 'identity', 'explanation', 'definition', 'use', 'effect'],
    installation: ['installation', 'setup', 'procedure'],
    creator: ['creator', 'authorship', 'attribution', 'lineage'],
    location: ['location', 'destination'],
    route: ['route', 'travel', 'destination', 'location', 'method'],
    acquisition: ['acquisition', 'recruitment', 'purchase', 'reward', 'download'],
    recruitment: ['recruitment'], download: ['download', 'link', 'resource', 'website'],
    prerequisites: ['requirement', 'prerequisites', 'requirements', 'permission', 'materials'],
    use: ['use', 'method', 'setup', 'installation', 'procedure', 'effect'],
    method: ['method', 'setup', 'installation', 'procedure', 'use', 'route', 'acquisition', 'recruitment'],
    stats: ['stats', 'statistics'], combat: ['combat', 'tactics', 'weakness'],
    outcome: ['outcome', 'reward', 'consequence'],
    remedy: ['remedy', 'troubleshooting'], comparison: ['comparison', 'compatibility', 'features', 'limitations'],
    compatibility: ['compatibility'],
    relationship: ['relationship'], sequence: ['sequence', 'route', 'method']
};
const combatUtility = q => /^why (?:would|should|could|do|can) (?:i|we) (?:bring|take|use|keep)\b/.test(q)
    && /\b(?:fight|combat|battle)\b/.test(q);
const causalQuestion = q => /^what (?:caused|produced|creates?)\s+\S/.test(q)
    || /^what (?:part|component)\b.+\b(?:causes?|produces?)\b/.test(q)
    || /^what (?:is|was) (?:the )?(?:cause|origin) of\b/.test(q)
    || /^where (?:does|do|did)\b.+\bcome from$/.test(q);
const perCastResource = q => /^(?:what|which) (?:resources?|reagents?|ingredients?|components?) (?:does|do) (?:each|a|one|the) cast (?:use|consume|need|require)$/.test(q);
// Strip only complete discourse wrappers, never words inside the topic's
// complement: a "working Grapple" is not an ordinary Grapple.
function contextScope(text) {
    const q = normalize(text);
    const preamble=readSourcePreamble(q);
    if(preamble)return ['deferred-exit','entry'].includes(preamble.kind)?'':preamble.scopeText;
    if (/^on (?:a )?different (?:setup )?point$/.test(q)) return '';
    if (/^switching from (?:access|setup|use|location|requirements) to (?:the )?(?:fight|combat|setup|use|location|requirements)(?: itself)?$/.test(q)) return '';
    if (/^once (?:i'm|i am) (?:in|at) there$/.test(q)) return '';
    if (/^once (?:he|she|they) (?:is|are) there$/.test(q)) return '';
    if (/^once (?:he|she|they) (?:hands?|gives?) (?:it|them) over$/.test(q))return '';
    if (/^if i (?:choose|use|pick)\b/.test(q)) return q.replace(/^if i (?:choose|use|pick)\s+/,'');
    return q.replace(/^(?:i'm|i am) planning (?:the )?(.+?) trip$/, '$1')
        .replace(/^(?:i'm|i am) following (?:the )?(.+?) option for (.+)$/, '$1 for $2')
        .replace(/^(?:i'm|i am) following (?:the )?(.+?)(?: option)?$/, '$1')
        .replace(/^i want\s+/, '')
        .replace(/^(?:i'm|i am) (?:searching|looking|investigating|exploring)(?: for)?\s+/, '')
        .replace(/^(?:i'm|i am) new to\s+/, '')
        .replace(/^i (?:mixed up|confused) (.+)$/, '$1')
        .replace(/^i (?:spoke|talked) to (.+?) (?:aboard|on|in) (.+?) (?:but|and) i still need (?:access to|to enter) (.+)$/, '$1 $2 $3')
        .replace(/^(.+?) (?:will not|won't|does not|doesn't) (?:hand over|give) (.+)$/, '$1 $2');
}
function providerAcquisition(q) {
    const match=q.match(/^how (?:do|can|should|must) (?:i|we) (?:get|obtain|acquire|receive|borrow|buy) (.+?) (rune|map piece|signature|permission|consent|approval|key|rations|blessing)$/);
    return match && !/^(?:the|a|an|this|that|it|them)$/.test(match[1]) ? {ownerText:match[1],field:match[2]} : null;
}
function signatureSignerProof(fact, owner) {
    return [owner.name,...owner.aliases].some(label=>{
        const name=normalize(label).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        return new RegExp(`\\b(?:to|ask|visit) ${name}(?: in [^,;.!?]+)? for (?:a |the )?signature\\b`,'i').test(normalize(fact.text));
    });
}
function requestFacet(q, packet, subjectGroup = null) {
    if(/^how (?:do|can|should) (?:i|we) deal with\b/.test(q))return subjectGroup==='monster'?'combat':'method';
    if(parseProceduralRequest(q))return 'method';
    if(/^how (?:do|can|should|must) (?:i|we) (?:get|obtain|gain|secure)\b.*\b(?:permission|consent|approval)\b/.test(q)
        || /^how (?:do|can|should|must) (?:i|we) get .+ to (?:agree|cooperate|help|talk|speak|work|function|run)\b/.test(q))return 'method';
    const provider=providerAcquisition(q);
    if(provider && (subjectGroup==='person' || provider.field==='signature'))return 'method';
    if(['item','spell'].includes(subjectGroup) && /^what (?:is|are) .+ (?:required|needed) for$/.test(q))return 'purpose';
    if(/^how (?:do|can|should|must) (?:i|we) (?:get|obtain|gain|secure) (?:permission|consent|approval) (?:to|for)\b/.test(q))return 'method';
    if (/^which (?:shadowlord|companion|character|person|npc) is\b/.test(q)) return 'identity';
    if(/^what does (?:the )?guide (?:recommend|advise|suggest|say) for avoiding (?:it|them)$/.test(q))return 'method';
    if(/^what (?:is|are) (?:it|they|this|that) (?:(?:actually|really) )?for$/.test(q))return 'purpose';
    if (/^who\b/.test(q) && /\b(?:made|wrote|created|developed|authored)\b/.test(q)) return 'creator';
    if (/\bversion check\b/.test(q)) return 'remedy';
    if (causalQuestion(q)) return 'cause';
    if (perCastResource(q)) return 'use';
    if(/^where (?:does|do) .+? need to be (?:extracted|placed|installed|put)$|^where (?:should|must|can) .+? be (?:extracted|placed|installed|put)$/.test(q))return 'destination';
    if(/^(?:what|which) (?:part|area|room|place) (?:do|should|can) (?:i|we) (?:search|look in|inspect)$/.test(q))return 'location';
    if (/^(?:what|which) (?:clue|information)\b/.test(q))return 'method';
    if (/^what (?:do|should|can|must) (?:i|we) (?:(?:actually|really) )?(?:say|ask)\b/.test(q)) return 'method';
    // The requested field precedes its subject in "what reward does X give?"
    // and "which menu do I open?". Read that field before incidental verbs
    // such as get, want or open, which describe how the question is phrased.
    const property = q.match(/^(?:what|which)\s+(.+?)\s+(?:does|do|did|can|could|should|would|will|is|are|has|have)\b/)?.[1];
    if (property) {
        if (/\b(?:version|release|architecture|toolchain)\b/.test(property)) return 'version';
        if (/\b(?:reward|outcome|result|consequence)\b/.test(property)) return 'outcome';
        if (/\broutes?\b/.test(property) && /\b(?:open|opens|unlock|unlocks)\b/.test(q)) return 'outcome';
        if (/\b(?:preparation|procedure|instructions?|method|keywords?|code|menu)\b/.test(property)) return 'method';
        if (/\b(?:settings?|configuration|game type|registry)\b/.test(property)) return 'configuration';
        if (/\b(?:cost|price|amount|number|damage|duration)\b/.test(property)) return 'stats';
        if (/\b(?:requirements?|prerequisites?|materials?)\b/.test(property)) return 'prerequisites';
        if (/\b(?:reagents?|ingredients?|components?|effects?)\b/.test(property)) return 'use';
    }
    if (/\b(?:what should|what must)\b.*\b(?:settings?|game type)\b.*\bbe$/.test(q)) return 'configuration';
    if (/\b(?:related to|relationship|descend(?:ed|s)? from|lineage|fit into (?:this|the) conflict)\b/.test(q)) return 'relationship';
    if (/\b(?:come with (?:me|us)|come along|accompany|follow (?:me|us))\b/.test(q)) return 'recruitment';
    if (combatUtility(q) || /^how (?:does|do|can)\b.+\b(?:help|helps|contribute|contributes)\b.+\bagainst\b/.test(q)) return 'combat';
    if (subjectGroup === 'person' && /^what (?:does|did|will) .+\b(?:tell|say|reveal)\b/.test(q)) return 'reference';
    if (subjectGroup === 'person' && /\b(?:wants?|trying to achieve|goal|aim|mission|request)\b/.test(q)) return 'purpose';
    if (subjectGroup === 'person' && /^what (?:does|do) .+ (?:actually )?do$/.test(q)) return 'identity';
    if (/\b(?:release number|version number|which version|what version)\b/.test(q)) return 'version';
    if (/\b(?:how many|how much)\b.*\b(?:minutes?|seconds?|hours?|karma|elo)\b/.test(q)) return 'stats';
    if (/\bhow much (?:faster|slower|better|worse)\b/.test(q)) return 'outcome';
    if (/\bstand(?:s)? for\b|\b(?:abbreviation|acronym)\b/.test(q)) return 'identity';
    if (/\bobjective\b/.test(q) && /^(?:what|which)\b/.test(q)) return 'objective';
    if (/\b(?:documentation|docs|wiki|documented)\b/.test(q)) return 'documentation';
    if (/\b(?:compatibility|compatible|support.*remastered)\b/.test(q)) return 'compatibility';
    if (/\b(?:support|community|discord|subreddit)\b/.test(q)) return 'support';
    if (/^where\b.*\b(?:ask .+ questions?|report .+ (?:issues?|bugs?))\b/.test(q)) return 'support';
    if (/\b(?:version|versions|toolchain)\b/.test(q) || /^(?:what|which)\b.*\brelease\b/.test(q)) return 'version';
    if (/\b(?:java|jdk|jre)\b.*\b(?:runtime|version|release|recommendation)\b/.test(q)) return 'version';
    if (/\bexact\b.*\b(?:number|count|amount|quantity)\b/.test(q)) return 'stats';
    if (/^where\b.*\b(?:put|extract|place)\b|^where\b.*\b(?:files?|configuration) go\b/.test(q)) return 'destination';
    if (/\b(?:folder|directory|directories|working directory)\b/.test(q)) return 'location';
    if (/\b(?:download|link|url|website|repository|repo|source code|source and binaries|binaries and source)\b/.test(q)) return 'download';
    if (/\b(?:require|requires|requirement|requirements|prerequisite|prerequisites|need|needs|permission|consent|materials|waiting for)\b/.test(q) && !/^how\b/.test(q)) return 'prerequisites';
    if (/^where\b.*\b(?:log in|login|sign in|sign up|register)\b/.test(q)) return 'method';
    if (/\b(?:set up|install|installation|configuration|configure|source build|build from source|compile|compiling)\b/.test(q)) return 'installation';
    if (/\b(?:restrictions?|limits?|limitations?|downsides?)\b/.test(q)) return 'limitations';
    if (/\b(?:forever|unlimited|run out)\b/.test(q) && /\b(?:fire|firing|use|charges?|shots?)\b/.test(q)) return 'limitations';
    if (/\b(?:watch out for|be careful|cautions?|risks?)\b/.test(q)) return 'limitations';
    if (/\bcombat\b/.test(q) && /\b(?:strengths?|stats|capabilities|abilities)\b/.test(q)) return 'combat';
    if (/^(?:what|which) (?:weapon|spell|item|attack)\b/.test(q) && /\b(?:against|fight|defeat|kill|combat)\b/.test(q)) return 'combat';
    if (/\b(?:pros|cons|strengths?|benefits?|compare|comparison|different from|difference between)\b/.test(q)) return 'comparison';
    if (/\b(?:creator|author|created|developed|written|authored)\b|^who (?:made|wrote)\b/.test(q)) return 'creator';
    if (/\bmantra\b/.test(q)) return 'method';
    if (/\bregistry\b/.test(q)) return 'configuration';
    if (/\b(?:formula|karma|elo|minutes?|seconds?|duration|timer)\b/.test(q)) return 'stats';
    if (/^how many\b.*\b(?:need|require|required)\b/.test(q)) return 'prerequisites';
    if (/\b(?:method|procedure|instructions)\b/.test(q)) return 'method';
    if (/^when\b.*\b(?:use|apply|activate)\b/.test(q)) return 'use';
    if (/^who\b.*\b(?:handles?|escort|rescue)\b/.test(q)) return 'method';
    if (/^who\b.*\bsets?\b.*\bup\b/.test(q)) return 'installation';
    if (/\b(?:what|which) .* (?:cost|price)|\b(?:cost|price|prices|how much)\b/.test(q)) return 'stats';
    if (/\b(?:recruit|hire|join)\b/.test(q) && !/^who\b/.test(q)) return 'recruitment';
    if (/^where (?:do|can|should) i (?:take|bring)\b|^where (?:does|do)\b.*\b(?:lead|go|exit|send|sends|direct|directs)\b/.test(q)) return 'destination';
    if (/\b(?:route|directions|reach|travel|how.*get to)\b/.test(q)) return 'route';
    if (/\b(?:get|take|bring|carry|smuggle)\b.+\b(?:past|through|across)\b/.test(q)) return 'method';
    if (/^where\b/.test(q) && !/\b(?:get|obtain|acquire|retrieve|download)\b/.test(q) || /\b(?:location|whereabouts|coordinates)\b/.test(q)) return 'location';
    if (/\b(?:stats|statistics|attributes)\b/.test(q)) return 'stats';
    if (/\b(?:happens|happen|outcome|reward|consequence|leaves?|dismiss|ends?)\b/.test(q)) return 'outcome';
    if (/\b(?:get|obtain|acquire|retrieve|receive|buy|purchase)\b/.test(q)) return 'acquisition';
    if (/\b(?:used for|purpose|function)\b|^what (?:does|do) .+ do$/.test(q)) return 'purpose';
    if (/\b(?:use|used|activate|work|effect|install|setup|configure)\b/.test(q) || /^what (?:does|do)\b/.test(q)) return 'use';
    if (/\b(?:fight|defeat|combat|tactics|weakness|dangerous|threat)\b/.test(q)) return 'combat';
    if (/^why\b/.test(q)) return 'cause';
    if (/^how\b/.test(q)) return 'method';
    if (/^(?:who|what)(?: is| are|'s)|^(?:tell me about|describe|explain|define)\b/.test(q)) return 'identity';
    // A yes/no property question is not a prerequisite merely because the
    // classifier proposes that intent. Its material words must still match
    // the source in the assertion checks below.
    if (/^(?:does|do|is|are|can|could|will|would|has|have)\b/.test(q)) return 'reference';
    return GROUPS[packet?.intent] ? packet.intent : null;
}

const REQUEST_CAPABILITIES = {
    identity: ['identity', 'explanation'], purpose: ['purpose', 'identity', 'explanation', 'use'], relationship: ['relationship'],
    installation: ['installation', 'configuration'], configuration: ['configuration'], download: ['download'], documentation: ['documentation'], support: ['support'],
    compatibility: ['comparison', 'limitations', 'version', 'prerequisites'], version: ['version'],
    location: ['location'], destination: ['destination', 'route'], route: ['route'],
    acquisition: ['acquisition', 'download', 'recruitment'], recruitment: ['recruitment'],
    prerequisites: ['prerequisites'], stats: ['stats'], combat: ['combat'],
    use: ['use'], method: ['method'], outcome: ['outcome'], cause: ['cause'], creator: ['creator'],
    comparison: ['comparison'], limitations: ['limitations'], objective: ['objective'], sequence: ['sequence'],
    remedy: ['method', 'configuration', 'combat']
};
const editionKey = value => normalize(value).replace(/^starcraft /, '');
const factEligible = (fact, {guideOnly = false, editions = []} = {}) => fact
    && (!fact.record.conflict || fact.source.review === 'conflicting' || fact.facet === 'creator')
    && (!guideOnly || fact.source.review !== 'external-research')
    && (!editions.length || editions.every(edition => fact.record.editions.some(value => editionKey(value) === editionKey(edition))
        || fact.conflict && fact.source.review === 'conflicting' && (fact.qualifiers || []).some(value => editionKey(value) === editionKey(edition))));

// These are predicate paraphrases justified by the candidate's actual text,
// not a general permission to discard missing assertion terms. Numbers,
// editions, named scopes, negation and unrelated properties remain checked.
function equivalentRequestTerms(question, fact, context = question) {
    const q = normalize(question), proof = normalize(fact.text), equivalent = new Set();
    if(/^how (?:do|can|should) (?:i|we) deal with\b/.test(q) && fact.answerRelations.includes('combat')
        && /\b(?:dodge|strike|attack|parry|block|flee|avoid)\b/.test(proof))equivalent.add('deal');
    if(/\bchoose\b/.test(q) && fact.answerRelations.includes('configuration') && /\b(?:select|choose)\b/.test(proof))equivalent.add('choose');
    if(/\bfail\b/.test(q) && fact.answerRelations.includes('cause') && /\b(?:will|does|do) not (?:function|work)\b/.test(proof))equivalent.add('fail');
    if(/^how (?:do|can|should) (?:i|we) (?:leave|exit)\b/.test(q) && fact.answerRelations.includes('route')
        && /\b(?:leave|exit)\b/.test(proof))for(const term of ['leave','exit'])equivalent.add(term);
    if(/\bpermission to leave\b/.test(q) && fact.answerRelations.includes('method')
        && /\b(?:report|speak|ask)\b/.test(proof) && /\bpass\b.*\bquiz\b/.test(proof)
        && /\bpassword\b.*\bto leave (?:the )?city\b/.test(proof))equivalent.add('permission');
    const procedure=parseProceduralRequest(q);
    if(procedure && supportsProceduralRequest(procedure,fact))
        for(const term of {preparation:['prepare','preparation','ready'],crafting:['forge','forged','craft','crafted','make','made','create','created','construct','constructed'],return:['return','back'],delivery:['deliver','delivery','bring','give','offer'],transport:['get','carry','take','bring','past'],concealment:['hide','stash','store'],release:['get','release','released','free','freed']}[procedure.kind] || [])equivalent.add(term);
    if(/\bwaiting for\b/.test(q) && fact.answerRelations.includes('prerequisites')
        && /\b(?:needs?|requires?|permission)\b/.test(proof))equivalent.add('waiting');
    if(/^how (?:do|can|should|must) (?:i|we) (?:get|persuade) .+? to (?:agree|consent)$/.test(q)
        && fact.answerRelations.includes('method') && /\b(?:permission|consent)\b/.test(proof))
        for(const term of ['agree','consent','persuade'])equivalent.add(term);
    if(/^(?:what|which) (?:part|area|room|place) (?:do|should|can) (?:i|we) (?:search|look in|inspect)[?!.]*$/.test(q)
        && fact.answerRelations.includes('location'))
        for(const term of ['part','area','room','place'])equivalent.add(term);
    if(/^what does (?:the )?guide (?:recommend|advise|suggest|say) for avoiding (?:it|them)/.test(q)
        && fact.answerRelations.includes('method') && /\bavoid\b/.test(proof))
        for(const term of ['recommend','advise','suggest','say'])equivalent.add(term);
    if(/\bback to (?:the )?group\b/.test(q) && /\bregroup with the party\b/.test(proof))equivalent.add('group');
    if (/\bcop(?:y|ies)\b/.test(q) && /\b(?:install|installation|(?:a|another|separate) copy of)\b/.test(q)
        && fact.answerRelations.includes('prerequisites') && /\binstall\b/.test(proof)
        && /\b(?:own|separate|separately)\b/.test(proof)) equivalent.add('copy');
    if (perCastResource(q.replace(/[?!.]+$/, '')) && fact.record.subjectKind === 'spell'
        && fact.answerRelations.includes('use') && /\b(?:cost|reagent|ingredient|component)\b/.test(proof))
        for (const term of ['resource','reagent','ingredient','component','each','cast','consume']) equivalent.add(term);
    if (causalQuestion(q.replace(/[?!.]+$/, '')) && fact.answerRelations.includes('cause')) equivalent.add('cause');
    const network = /\b(?:internet|network)\b/.test(q) && /\b(?:internet|network)\b/.test(proof);
    const afterLogin = /\bafter (?:the )?(?:(?:first|initial|client) )?login\b/.test(normalize(context));
    const playInterval = /\b(?:throughout|during) (?:a |the |each |every )?(?:match|gameplay|game)\b/.test(q);
    const postLoginProof = /\ball gameplay after login\b/.test(proof) && /\binitial (?:client )?login\b/.test(proof);
    if (network && postLoginProof && (afterLogin || playInterval)) {
        // The witness explicitly separates initial login from all subsequent
        // play. Its whole paragraph is quoted, including that distinction.
        for (const term of ['still','during']) equivalent.add(term);
        if (playInterval) for (const term of ['throughout','match','gameplay','game']) equivalent.add(term);
        if (/\b(?:going|goes|running|runs|working|works) (?:over|via|through) (?:the )?(?:internet|network)\b/.test(q))
            for (const term of ['going','goe','running','run','working','work','over','via','through']) equivalent.add(term);
    }
    return equivalent;
}

// A proved relationship still has to answer the requested scope. Apply the
// same constraints to direct graph proofs and ranked passage candidates.
function scopeConstraints(q, qWords, editions, sourceById, restrictions = {}, explicitText = q, topicNames = () => [], isQuotedDescription = () => false) {
    const filler = new Set([...FILL, 'whose'].map(word));
    const editionWords = new Set(editions.flatMap(words));
    const scopedWords = [...q.matchAll(/\b(?:in|on|at|near|inside|within|from|for|with|against|than)\s+([\p{L}\p{N}'’.-]+(?:\s+[\p{L}\p{N}'’.-]+){0,3})/gu)]
        .flatMap(match => words(match[1])).filter(term => !filler.has(term) && !QUESTION_WORDS.has(term) && !QUESTION_SCAFFOLD.has(term)
            && !['all', 'every', 'any', 'only', 'same', 'before', 'after'].includes(term));
    const numerical = qWords.filter(term => /\d/.test(term) && !editionWords.has(term));
    // A follow-up packet may retain a qualifier omitted from its new wording.
    // Terms already present in the question use the field-specific checks
    // below; inherited material and quantities still need literal proof.
    const explicitWords = words(explicitText);
    const inheritedMaterial = (restrictions.material || []).flatMap(words).filter(term => !explicitWords.includes(term));
    const inheritedQuantities = (restrictions.quantities || []).flatMap(words).filter(term => !explicitWords.includes(term));
    const timeUnits = [...q.matchAll(/\b(minutes?|seconds?|hours?|days?|turns?)\b/g)]
        // In the bounded converter grammar, "turns" is an action verb.
        // A second occurrence (e.g. "in30 turns") remains a time restriction.
        .filter(match=>!(/\bwho $/.test(q.slice(0,match.index))
            && readGraphQuestion(q.slice(match.index-4))?.relation==='converter'))
        .map(match => word(match[1]));
    const exactNumber = /\bexact\b.*\b(?:number|count|amount|quantity)\b|\b(?:number|count|amount|quantity)\b.*\bexact\b/.test(q);
    const currentClaim = /\b(?:latest|currently available|current (?:[a-z]+ )?(?:ranking|version|release|rating|maintainer|status)|up.to.date|guaranteed|guarantee|universally|strongest|safest|today)\b/.test(q);
    const sourceKind = /\binterview\b/.test(q) ? 'interview' : /\b(?:official|original)\b.*\bmanual\b/.test(q) ? 'manual' : null;
    const propertyPhrase = q.match(/^(?:what|which|whose)\s+(?:(?:is|are)\s+)?(.+?)\s+(?:does|do|did|is|are|has|have|must|should|can|will|of|for)\b/)?.[1]
        || q.match(/\b(?:give|show|provide)\s+(?:me\s+)?(?:(?:a|an|the)\s+)?(.+?)\s+(?:for|of|about)\b/)?.[1];
    const propertyWords = propertyPhrase && /\b(?:exact|verified|registry|formula|duration|timer|license|licence|release number|macos|linux|interview)\b/.test(q)
        ? words(propertyPhrase).filter(term => !filler.has(term) && !['exact', 'verified', 'number', 'many', 'much', 'the'].includes(term)) : [];
    const freeTraining = /\bfree (?:(?:spell|magic|combat|weapon) )?training\b|\btraining for free\b/.test(q);
    const check = fact => {
        const origin = sourceById.get(fact.sourceRecordId);
        const contentWords = words(fact.text);
        const proofWords = words([fact.subject, ...(fact.aliases || []), fact.text, origin?.title || '',...topicNames(fact)].join(' '));
        return !scopedWords.some(term => !proofWords.includes(term) && !editionWords.has(term))
            && inheritedMaterial.every(term => proofWords.includes(term))
            && inheritedQuantities.every(term => contentWords.includes(term) || (fact.qualifiers || []).some(value => words(value).includes(term)))
            && (!freeTraining || /\bfree (?:[\p{L}]+[ -]){0,2}(?:training|lessons?)\b|\bwithout (?:a )?(?:[\p{L}]+[ -]){0,2}training fee\b/iu.test(fact.text))
            && !numerical.some(term => !contentWords.includes(term) && !(fact.qualifiers || []).some(value => words(value).includes(term)))
            && !propertyWords.some(term => !proofWords.includes(term) && !words(fact.facet).includes(term))
            && !timeUnits.some(unit => !contentWords.includes(unit))
            && (!exactNumber || /\b(?:\d+(?:\.\d+)?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i.test(fact.text))
            && (!sourceKind || [fact.source.file, fact.source.locator, ...(fact.source.references || []).flatMap(reference => [reference.label, reference.url])].join(' ').toLowerCase().includes(sourceKind))
            && (!currentClaim || isQuotedDescription(fact) || /\b(?:latest|current release|guarantee)\b/i.test(fact.text));
    };
    check.restrictions = {material:[...new Set([...scopedWords,...timeUnits,...inheritedMaterial])],
        quantities:[...new Set([...numerical,...inheritedQuantities])]};
    return check;
}

export function createKnowledgeRouter(knowledge) {
    const { facts, entities, links } = knowledge;
    const sourceContexts = knowledge.sourceContexts || [];
    const byFactId = new Map(facts.map(fact => [fact.id, fact]));
    const sourceById = new Map(knowledge.sourceRecords.map(record => [record.id, authorize(record, 'direct')]));
    const vocabulary = new Set(facts.flatMap(fact => words([fact.subject, ...fact.aliases, fact.text].join(' '))));
    const compactNames = new Set([...entities.values()].flatMap(entity => [entity.name, ...entity.aliases].map(key)));
    const nameVocabulary = new Set([...entities.values()].flatMap(entity => [entity.name, ...entity.aliases].flatMap(words)));
    let focus = null, lastFact = null, restriction = null, lastFacet = null, invalidated = false;
    let lastProofIds = [];
    let sceneIds = [];
    let relativeContext = null;
    let fieldReferents = {};
    const salient = new Map();
    const checkpoints = new WeakMap();
    function checkpoint() {
        const handle = Object.freeze({});
        checkpoints.set(handle, {focus, lastFact, restriction: restriction && copy(restriction), lastFacet,
            invalidated, salient:[...salient],sceneIds:[...sceneIds],lastProofIds:[...lastProofIds],relativeContext:relativeContext&&copy(relativeContext),fieldReferents:copy(fieldReferents)});
        return handle;
    }
    function restore(handle) {
        const prior = handle && checkpoints.get(handle);
        if (!prior) return false;
        ({focus, lastFact, lastFacet, invalidated} = prior);
        sceneIds = [...prior.sceneIds];
        lastProofIds=[...prior.lastProofIds];
        relativeContext=prior.relativeContext&&copy(prior.relativeContext);
        fieldReferents=copy(prior.fieldReferents || {});
        restriction = prior.restriction && copy(prior.restriction);
        salient.clear();
        for (const [kind, id] of prior.salient) salient.set(kind, id);
        return true;
    }
    const group = id => kindGroup(entities.get(id)?.kind) || (/npc|person|companion|character/.test(entities.get(id)?.kind || '') ? 'person' : 'other');
    const personSubject = q => /^(?:(?:what|where|how|why|when|which) )?(?:does|do|can|will|is|are|has|have|was|were) (?:he|she)\b/.test(q);
    const sceneItem = () => {
        const items=sourceContexts.filter(context=>sceneIds.includes(context.id) && group(context.entityId)==='item');
        return items.length===1?items[0].entityId:null;
    };
    const objectReference = q => personSubject(q) && /\b(?:it|its|them|their)\b/.test(q) ? salient.get('item') || sceneItem() : undefined;
    function reset() { focus = lastFact = restriction = lastFacet = null; salient.clear(); sceneIds=[]; lastProofIds=[];relativeContext=null;fieldReferents={}; invalidated = true; }
    function remember(id) { if (entities.has(id)) { focus = id; salient.set(group(id), id); invalidated = false; } }
    function contextSubject(text, person = null) {
        const candidates=[...entities.values()].filter(entity=>entity.declared && (person===null || (group(entity.id)==='person')===person));
        const matches=candidates.map(entity=>({entity,labels:[entity.name,...entity.aliases].filter(label=>hasPhrase(text,label))})).filter(match=>match.labels.length);
        const covering=matches.filter(match=>match.labels.some(label=>matches.every(other=>other.labels.some(otherLabel=>hasPhrase(label,otherLabel)))));
        if(matches.length===1)return matches[0].entity;
        if(covering.length===1)return covering[0].entity;
        // A declared kind and named qualifiers may identify an object even
        // when an optional format word such as SCM is omitted. This proposes
        // a subject only; every remaining context modifier still needs proof.
        if(words(text).includes('map') && matches.length){
            const typed=candidates.filter(entity=>entity.kind==='map' && matches.every(match=>match.labels.some(label=>
                words(label).filter(term=>!FILL.has(term)).every(term=>words([entity.name,...entity.aliases].join(' ')).includes(term)))));
            if(typed.length===1)return typed[0];
        }
        return matches.length>1 ? false : null;
    }
    function carryId(text, packet) {
        if (focus === salient.get('role-item') && /\bhelp(?:ing)? (?:him|her|them)\b/.test(text)
            && salient.has('recipient')) return salient.get('recipient') || null;
        if (/\b(?:he|him|his|she|her)\b/.test(text)) return focus && ['person','monster'].includes(group(focus))
            ? focus : salient.get('person') || (!invalidated && packet?.entityId);
        if (/\b(?:they|them|their)\b/.test(text)) return focus || (!invalidated && packet?.entityId);
        if (/\bthere\b/.test(text)) return salient.get('place') || (!invalidated && packet?.entityId);
        return focus && group(focus) !== 'person' ? focus : salient.get('item') || sceneItem() || focus || (!invalidated && packet?.entityId);
    }
    function typedReference(text, eligible) {
        // In an instruction to move a person, a following generic object is
        // the purpose of the trip. It cannot replace the person being moved.
        if(/^(?:where|how) (?:do|can|should|must) (?:i|we) (?:take|bring|send|guide|lead|position|control) (?:him|her)\b/.test(text))return null;
        const noun = text.match(/\b(?:the|this|that|those|his|her|their) (shard|bottle|rune|lens|weapon|scroll|sword|plans|attack|test|quest|whistle|hook|framework)\b/)?.[1];
        if (!noun || invalidated) return null;
        if ([...entities.values()].some(entity => entity.declared && [entity.name, ...entity.aliases]
            .some(label => tokens(label).filter(term => !FILL.has(term)).length > 1 && hasPhrase(text,label)))) return null;
        const recent = new Set([focus, ...salient.values(), byFactId.get(lastFact)?.entityId,
            ...sourceContexts.filter(context=>sceneIds.includes(context.id)).map(context=>context.entityId)].filter(Boolean));
        for(const fact of facts)if(eligible(fact) && factSourceContexts({fact,contexts:sourceContexts}).some(context=>sceneIds.includes(context.id)))
            for(const id of [fact.entityId,...fact.bindings.map(binding=>binding.entityId)]){
                const entity=entities.get(id);
                if(entity && words([entity.name,...entity.aliases].join(' ')).includes(word(noun)))recent.add(id);
            }
        for (const link of links) if (link.status !== 'disputed' && link.evidenceFactIds.includes(lastFact)
            && link.evidenceFactIds.every(id => eligible(byFactId.get(id)))) {
            recent.add(link.from); recent.add(link.to);
        }
        if(noun==='framework')for(const link of links)if([focus,byFactId.get(lastFact)?.entityId].includes(link.from) && ['recorded','conditional'].includes(link.status)
            && ['uses-api','uses-framework','requires-framework','built-on'].includes(link.relation)
            && link.evidenceFactIds.length && link.evidenceFactIds.every(id=>eligible(byFactId.get(id))))recent.add(link.to);
        const literal = [...recent].filter(id => {
            const entity = entities.get(id);
            return words([entity.name, ...entity.aliases].join(' ')).includes(word(noun));
        });
        // An active named Test is stronger evidence than an incident ritual
        // that merely shares its broad quest kind. Two other named matches
        // remain ambiguous rather than becoming an arbitrary choice.
        if (literal.includes(focus)) return focus;
        if (literal.length) return literal.length === 1 ? literal[0] : null;
        const matches = [...recent].filter(id => {
            const entity = entities.get(id);
            return ['test','quest'].includes(noun) && /quest|objective/.test(entity.kind)
                || noun === 'attack' && /combat|move|technique/.test(entity.kind)
                || noun==='framework' && facts.some(fact=>fact.entityId===id && eligible(fact) && fact.answerRelations.includes('identity')
                    && /\bis (?:a|an) [^.]{0,90}\bframework\b/i.test(fact.text));
        });
        return matches.length === 1 ? matches[0] : null;
    }
    function assemblySubject(id, text, eligible) {
        if (!id || !/\bassembl\w*\b/.test(text)) return id;
        const parents = [...new Set(links.filter(link => link.to === id && link.relation === 'assembly-requires'
            && link.status !== 'disputed' && link.evidenceFactIds.every(factId => eligible(byFactId.get(factId))))
            .map(link => link.from))];
        return parents.length === 1 ? parents[0] : id;
    }
    function relativeId(text, packet, eligible) {
        const relative = text.match(/\b(?:get|find|visit|ask|reach|contact)\s+(?:his|her|their)\s+(mother|father|sister|brother)\b/);
        if (!relative) return null;
        const owner = relativeContext?.answer===focus && relativeContext.kind===relative[1] && relativeContext.proof===lastFact
            ? relativeContext.subject : carryId(text, packet);
        const ids = [...new Set(links.filter(link => link.from === owner && link.relation === `has-${relative[1]}`
            && link.status !== 'disputed' && link.evidenceFactIds.every(id => eligible(byFactId.get(id)))).map(link => link.to))];
        return ids.length === 1 ? ids[0] : null;
    }
    function embeddingText(text, packet) {
        const q = normalize(text), parsed = parse(text);
        const scope = {guideOnly: Boolean(packet?.restrictions?.guideOnly || restriction?.guideOnly || parsed.parts.some(part => part.guideOnly)),
            editions:[...new Set([...(parsed.editions || []),...(packet?.restrictions?.editions || []),...(restriction?.editions || [])])]};
        const eligible = fact => factEligible(fact, scope);
        const id = assemblySubject(relativeId(q, packet, eligible) || typedReference(q, eligible)
            || (/\b(?:it|its|he|him|his|she|her|they|them|there|(?:this|that) (?:client|bot|item|spell|ai))\b/.test(q) ? carryId(q, packet) : null), q, eligible);
        if (/^(?:and|also)\b/.test(q) && lastFacet) {
            const subject = String(text).replace(/^(?:and|also)\s+/i, '').replace(/[?!.]+$/, '');
            const lead = { acquisition: 'How do I acquire', use: 'How do I use', location: 'Where is',
                prerequisites: 'What are the requirements for', stats: 'What are the stats of', method: 'How do I complete' }[lastFacet];
            if (lead) return `${lead} ${subject}?`;
        }
        const object = objectReference(q);
        return (id && entities.has(id) ? `${text}\nSubject: ${entities.get(id).name}` : String(text))
            + (object && object !== id ? `\nObject: ${entities.get(object).name}` : '');
    }
    function reply(selected, { target = null, subject = null, prefix = '', object = undefined, placeTarget = null, dedupeContained = false } = {}) {
        fieldReferents=sourceFieldReferents(selected.map(proof=>({proofs:knowledge.sourceFields.entries
            .filter(entry=>entry.factId===proof.id).map(entry=>({entry,proof}))})));
        const sources = selected.map(fact => fact.record.source);
        const resources = [...new Map(selected.flatMap(fact => fact.resources).map(link => [link.url, link])).values()];
        const displayFacts=dedupeContained?selected.filter(fact=>!selected.some(other=>other!==fact
            && other.sourceRecordId===fact.sourceRecordId && other.source.file===fact.source.file
            && other.source.locator===fact.source.locator && other.source.review===fact.source.review
            && other.text.length>fact.text.length && other.text.includes(fact.text))):selected;
        const text = prefix + displayFacts.map(fact => (fact.source.review === 'external-research' ? 'Not in this guide — from outside research: ' : '')
            + (fact.listMembers ? `${fact.subject}: ${fact.listMembers.join(', ')}.` : fact.text.replace(/^Outside research:\s*/i, ''))).join('\n')
            + (resources.length ? '\n' + resources.map(link => `${link.label}: ${link.url}`).join('\n') : '');
        remember(subject || selected[0].entityId); if (target) remember(target);
        const item = subject || selected[0].entityId;
        if (group(item) === 'item') {
            const roles = graphReferenceRoles({subjectIds:[item], factIds:selected.map(fact => fact.id), entities, links});
            for (const role of ['provider','recipient']) {
                salient.delete(role);
                if (roles[role].length === 1) salient.set(role,roles[role][0]);
                else if (roles[role].length > 1) salient.set(role,null);
            }
            salient.set('role-item',item);
        }
        const proved = links.filter(link => ['recorded','conditional'].includes(link.status) && link.evidenceFactIds.length
            && link.evidenceFactIds.every(id => selected.some(fact => fact.id === id)));
        const family=target && subject && proved.find(link=>link.from===subject && link.to===target && /^has-(?:mother|father|sister|brother)$/.test(link.relation));
        relativeContext=family?{subject,answer:target,kind:family.relation.slice(4),proof:selected[0].id}:null;
        for (const kind of ['person', 'item', 'place']) {
            const related = [...new Set(proved.flatMap(link => [link.from, link.to]).filter(id => group(id) === kind))];
            if (related.length === 1) salient.set(kind, related[0]);
        }
        if(placeTarget && group(placeTarget)==='place')salient.set('place',placeTarget);
        const sceneSets=selected.map(fact=>new Set(factSourceContexts({fact,contexts:sourceContexts}).map(context=>context.id)));
        sceneIds=sceneSets.length ? [...sceneSets[0]].filter(id=>sceneSets.every(set=>set.has(id))) : [];
        // A requested "rune" may be unambiguous among this actor's direct,
        // reviewed item links even when that word names many items globally.
        if (object === null) salient.delete('item');
        else if (object) salient.set('item', object);
        lastFact = selected[0].id;
        lastProofIds=selected.map(fact=>fact.id);
        return { decision: 'answer', text, title: entities.get(selected[0].entityId)?.name,
            recordIds: [...new Set(selected.flatMap(fact => [fact.recordId, fact.sourceRecordId].filter(Boolean)))], sources,
            sourceLinks: [...new Map(selected.flatMap(fact => [...fact.resources,
                ...(fact.source.review === 'external-research' ? fact.source.references.map(ref => ({label:ref.label,url:ref.url})) : [])]
                .map(link => [link.url, {text:link.label, url:link.url, source:fact.record.source, recordId:fact.recordId}]))).values()],
            actions: [], choices: [], stateChanges: [], level: 'direct',
            knowledge: { factIds: selected.map(fact => fact.id), focusEntityId: target || subject || selected[0].entityId,
                context: restriction ? copy(restriction) : null,
                evidence: selected.map(fact => ({ factId: fact.id, sourceRecordId: fact.sourceRecordId, source: normalizedSource(fact.source) })) } };
    }
    function planFrame(text,packet={},opts={}){
        // A fully proved typed request takes precedence over narrower readers.
        // If any field or qualification lacks proof, existing bounded readers
        // still have their own complete-predicate validation below.
        const frame=resolveSourceFrameIdentity(parseSourceRequestFrame(text),knowledge);
        if(!frame || frame.staticEligible===false || !frame.complete)return null;
        const parsed=parse(text),currentScope={guideOnly:parsed.parts.some(part=>part.guideOnly),editions:parsed.editions || []};
        const plan=planSourceFields({frame,knowledge,index:knowledge.sourceFields,focusEntityId:focus,
            grounded:!invalidated && Boolean(lastFact),contextIds:sceneIds,referents:fieldReferents,inherited:restriction || {},embedding:opts.embedding,
            previousProofIds:!invalidated?lastProofIds:[],
            isEligible:(proof,{owner})=>factEligible(proof,{guideOnly:currentScope.guideOnly || owner===focus && restriction?.guideOnly,
                editions:[...new Set([...currentScope.editions,...(owner===focus?restriction?.editions || []:[])])]})});
        if(typeof opts.trace==='function')opts.trace({stage:'source-fields',frame,plan});
        if(plan.status==='unsupported')return {decision:'decline',text:'The available sources do not record that requested field for this subject.',
            recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',
            knowledge:{factIds:[],focusEntityId:focus || plan.ownerEntityId,unsupported:true,context:restriction && copy(restriction)}};
        if(plan.status!=='answer')return null;
        if(opts.onlyDecline)return null;
        const ordinary=frame.fields.length===1 && (
            ['identity','location','combat','acquisition'].includes(frame.fields[0].key) && !frame.fields[0].selectors?.length
            || frame.fields[0].key==='use' && frame.fields[0].selectors?.length===1 && frame.fields[0].selectors[0]==='effect');
        if(ordinary && !opts.afterSource)return null;
        if(opts.preferExisting!==false){
            // Existing directed/phase readers can prove a more precise answer
            // than a broad field (helm cabin versus island, drinking versus
            // potion effect). Probe transactionally before replacing it.
            const prior=checkpoint();let existing;
            try{existing=planLegacy(text,packet,{...opts,trace:undefined});}
            finally{restore(prior);}
            if(existing?.decision==='answer' && completeFieldSupport(frame,existing))return null;
        }
        restriction={guideOnly:currentScope.guideOnly || plan.ownerEntityId===focus && Boolean(restriction?.guideOnly),
            editions:[...currentScope.editions],...(frame.constraints.sourceText?{sourceText:frame.constraints.sourceText}:{})};
        lastFacet=frame.fields[0].key==='location' && frame.fields[0].selectors?.includes('recruitment')?'recruitment':frame.fields[0].key;
        // The container retains the task, while the actual returned subject
        // remains a participant/item. Existing sceneIds carry the exact common
        // source container independently of person and object references.
        const askedPeople=plan.fields.flatMap(selected=>{
            const role=['provider','creator','teacher'].includes(selected.field.key)?'agent':selected.field.key==='recipient'?'recipient':null;
            return role?selected.proofs.flatMap(value=>(value.entry.arguments || []).flatMap(group=>group.bindings
                .filter(binding=>binding.role===role).map(binding=>binding.entityId).filter(Boolean))):[];
        });
        const uniquePeople=[...new Set(askedPeople)].filter(id=>['person','monster'].includes(group(id)));
        const subject=uniquePeople.length===1?uniquePeople[0]:plan.topicContextId?plan.proofs[0].entityId:plan.ownerEntityId;
        const answer=reply(plan.proofs,{subject});
        fieldReferents=copy(plan.referents || {});
        answer.knowledge.fieldCoverage={complete:true,fields:frame.fields.map(field=>({key:field.key,selectors:field.selectors})),
            proofRecordIds:plan.proofs.map(proof=>proof.recordId),referents:copy(fieldReferents),...(plan.topicContextId?{topicContextId:plan.topicContextId}:{})};
        return answer;
    }
    function guardReply(text,response,packet={}){
        if(response?.decision!=='answer' || response.stateChanges?.length || response.actions?.length)return response;
        if(sourceNarrative(text,response))return response;
        let frame=resolveSourceFrameIdentity(parseSourceRequestFrame(text),knowledge);
        if(!frame || frame.staticEligible===false || frame.report || frame.playerStateQuestion)return response;
        const returned=(response.recordIds || []).map(id=>knowledge.sourceRecords.find(record=>record.id===id)).filter(Boolean);
        const returnedOwners=[...new Set(returned.map(record=>record.entityId))];
        const rawOwner=returnedOwners.length===1?returnedOwners[0]:null;
        const originalReference=frame.fields.length===1 && /^(?:it|its|he|him|his|she|her|they|them|their|this|that)$/i
            .test(frame.fields[0].subjectText || frame.subjectText || '');
        // The source interpreter can retain an explicitly selected subject
        // across its clarification. Require its complete canonical question
        // and the actual returned owner, rather than a classifier label.
        const delegatedReference=originalReference && packet.status==='ready' && packet.entityId===rawOwner
            && typeof packet.canonicalQuestion==='string' && !packet.blockReplay;
        if(delegatedReference){
            const canonical=resolveSourceFrameIdentity(parseSourceRequestFrame(packet.canonicalQuestion),knowledge);
            if(canonical?.complete && canonical.fields.length===frame.fields.length
                && canonical.fields.every((field,index)=>field.key===frame.fields[index].key
                    && JSON.stringify(field.selectors)===JSON.stringify(frame.fields[index].selectors)
                    && entityLabelsFor(rawOwner).some(label=>key(label)===key(field.subjectText || canonical.subjectText || ''))))
                frame={...frame,subjectText:entities.get(rawOwner)?.name,
                    fields:frame.fields.map(field=>({...field,subjectText:entities.get(rawOwner)?.name}))};
        }
        if(returned.length===1){
            const visible=authorize(returned[0],'direct');
            if(visible)frame=sourceFallbackFrame({frame,record:visible,subjectLabels:entityLabelsFor(rawOwner)});
        }
        const parsed=parse(text),scope={guideOnly:parsed.parts.some(part=>part.guideOnly),editions:parsed.editions || []};
        let sourceFields=knowledge.sourceFields;
        const ordinary=frame.complete && frame.fields.length===1 && frame.fields[0];
        if(ordinary && ['combat','acquisition'].includes(ordinary.key) && !ordinary.selectors.length){
            const reviewed=facts.filter(fact=>returned.some(record=>record.id===fact.sourceRecordId)
                && fact.answerRelations.includes(ordinary.key) && response.text.includes(fact.witness) && factEligible(fact,scope));
            sourceFields={...sourceFields,entries:[...sourceFields.entries,...reviewed.map(fact=>({key:ordinary.key,selectors:[],
                subjectEntityIds:[fact.entityId],factId:fact.id,sourceRecordId:fact.sourceRecordId,source:fact.source,witness:fact.witness,explicit:true}))]};
        }
        // A finite downgrade question compares the named edition with a
        // recorded native target; it is not an unknown property or saved-state
        // assertion. Reuse the existing complete native-compatibility proof.
        const downgrade=/^(?:will|do) (?:i|we) (?:have|need) to downgrade (.+?) for (.+?)\??$/i.exec(String(text).trim());
        if(downgrade && returned.length===1 && rawOwner){
            const target=downgrade[1],subject=downgrade[2];
            const proof=facts.find(fact=>{
                if(fact.sourceRecordId!==returned[0].id || !response.text.includes(fact.witness) || !factEligible(fact,scope))return false;
                const labels=entityLabelsFor(fact.entityId),named=labels.some(label=>key(label)===key(subject));
                const referenced=/^(?:this|that|the) (?:route|method|map)$/i.test(subject)
                    && !invalidated && Boolean(lastFact) && focus===fact.entityId;
                const request=(named || referenced) && parseSoftwareCapabilityRequest(`Can I use ${entities.get(fact.entityId)?.name} natively in ${target}?`);
                return request && supportsSoftwareCapabilityRequest(request,{facts:[fact],subjectEntityId:fact.entityId,subjectLabels:labels});
            });
            if(proof){
                frame={...frame,complete:true,unresolvedTexts:[],subjectText:entities.get(proof.entityId).name,
                    fields:[{key:'version',selectors:[],subjectText:entities.get(proof.entityId).name,requestedText:text,unknownQualifierTexts:[]}]};
                sourceFields={...sourceFields,entries:[...sourceFields.entries,{key:'version',selectors:[],
                    subjectEntityIds:[proof.entityId],factId:proof.id,sourceRecordId:proof.sourceRecordId,source:proof.source,witness:proof.witness,explicit:true}]};
            }
        }
        const plan=planSourceFields({frame,knowledge,index:knowledge.sourceFields,focusEntityId:focus,grounded:!invalidated && Boolean(lastFact),
            inherited:restriction || {},isEligible:proof=>factEligible(proof,scope)});
        // A source topic may expose an exact authored alias also used by a
        // narrower curated item. On an unhandled plan, retain the source's
        // independently resolved named owner instead of forcing that item ID
        // onto an otherwise valid complete original topic response.
        const named=frame.subjectText && key(frame.subjectText.replace(/^(?:the|a|an) /i,''));
        const rawOwners=plan.status!=='answer' && named ? [...new Set((response.recordIds || []).flatMap(id=>{
            const raw=knowledge.sourceRecords.find(record=>record.id===id),record=raw && authorize(raw,'direct');
            return record && [record.title,...(record.aliases || []),...entityLabelsFor(record.entityId)].some(label=>key(label)===named)?[record.entityId]:[];
        }))]:[];
        const owner=rawOwners.length===1?rawOwners[0]:plan.ownerEntityId || focus;
        const check=guardSourceFieldReply({frame,reply:response,records:knowledge.sourceRecords,sourceFields,knowledge,
            referentIds:[...new Set(['object','content','output','input'].flatMap(role=>fieldReferents[role] || []))],
            isEligibleFact:fact=>factEligible(fact,scope),
            subjectEntityId:owner,subjectLabels:entityLabelsFor(owner),grounded:!invalidated && Boolean(lastFact),
            isEligible:record=>{
                const proof={id:record.id,sourceRecordId:record.id,entityId:record.entityId,subject:record.title,aliases:record.aliases || [],
                    text:record.text,witness:record.text,source:record.source,facet:record.relation,record:{...record,editions:record.editions || []}};
                const entry={key:record.relation,selectors:[],subjectEntityIds:[record.entityId],witness:record.text,phase:null,source:record.source};
                return factEligible(proof,scope) && sourceFieldScopeAllows({frame,proof,entry,knowledge,inherited:owner===focus?restriction || {}:{}});
            }});
        if(check)return response;
        return {decision:'decline',text:'The available sources do not cover every requested field of that subject.',
            recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',
            knowledge:{factIds:[],focusEntityId:frame.fields.length>1?focus:owner,unsupported:true,context:restriction && copy(restriction)}};
    }
    function entityLabelsFor(id){const entity=entities.get(id);return entity?[entity.name,...entity.aliases]:[];}
    function completeFieldSupport(frame,response){
        if(!frame)return true;
        if(!response?.knowledge?.factIds)return !frame.fields.some(field=>field.requiresExplicitField);
        const selected=new Set(response.knowledge.factIds);
        return frame.fields.every(field=>{
            const entries=knowledge.sourceFields.entries.filter(entry=>selected.has(entry.factId) && entry.key===field.key
                && (!field.selectors?.length || field.selectors.some(selector=>entry.selectors.includes(selector)))
                && (!field.requiresExplicitField || entry.explicit));
            if(field.requiresExplicitField && (!entries.length || (field.selectors || []).some(selector=>
                !entries.some(entry=>entry.selectors.includes(selector)))))return false;
            return entries.every(entry=>(entry.arguments || []).every(group=>(group.requiredFactIds || []).every(id=>{
                const proof=byFactId.get(id);
                return selected.has(id) && proof && !proof.conflict && !proof.record.conflict && proof.source.review!=='conflicting';
            })));
        });
    }
    function plan(text,packet={},opts={}){
        const contrastScope={guideOnly:Boolean(restriction?.guideOnly),editions:restriction?.editions || []};
        const contrastOptions={facts,entities,sourceRecords:[...sourceById.values()],isEligible:fact=>factEligible(fact,contrastScope)};
        const identityContrast=contradictoryIdentity(text,contrastOptions);
        if(identityContrast)return reply([identityContrast],{subject:identityContrast.entityId,
            prefix:'The guide identifies the subject as follows; it does not establish the other descriptions: '});
        const victimContrast=accusedVictimContrast(text,contrastOptions);
        if(victimContrast)return reply([victimContrast],{subject:victimContrast.entityId,
            prefix:'The passage identifies the accused person as the victim; it does not establish the proposed inference: '});
        const reported=completionAfterReportedRecovery(text,{facts,entities,sourceRecords:[...sourceById.values()],
            isEligible:fact=>factEligible(fact,{guideOnly:Boolean(restriction?.guideOnly),editions:restriction?.editions || []})});
        if(reported){
            lastFacet='method';
            return reply(reported,{subject:reported[0].entityId,prefix:'I cannot verify your game state. The guide gives these completion steps: '});
        }
        const boundary=planFrame(text,packet,{...opts,onlyDecline:true});if(boundary)return boundary;
        const before=checkpoint(),existing=planLegacy(text,packet,opts);
        const frame=resolveSourceFrameIdentity(parseSourceRequestFrame(text),knowledge);
        if(existing?.decision==='answer' && completeFieldSupport(frame,existing))return existing;
        const after=checkpoint();restore(before);
        const framed=planFrame(text,packet,{...opts,preferExisting:false});
        if(framed)return framed;
        if(existing?.decision==='answer')return null;
        restore(after);return existing;
    }
    function planLegacy(text, packet = {}, opts = {}) {
        // Optional local diagnostics for the source-first replay harness. The
        // production UI provides no callback and retains no candidate log.
        const trace = (stage, details) => { if (typeof opts.trace === 'function') opts.trace({stage, ...details}); };
        const sourceFrame = sourceQuestionParts(text);
        const fullParsed = sourceFrame?.parsed || parse(text);
        const stateQuestion = playerStateQuestion(text);
        const recordedCondition = matchRecordedCondition({text, entities, links});
        const groundedFocus={entityId:focus,grounded:!invalidated && Boolean(lastFact)};
        const staticCondition=matchStaticPropertyCondition({text,entities,focus:groundedFocus});
        const questions = sourceFrame ? sourceFrame.questions.map(question => question.part)
            : fullParsed.parts.filter(part => /^(?:who|whose|what|where|how|why|which|can|does|do|is|are|will|must|has|have|could|would|should|tell|describe|explain)\b/.test(part.core));
        const primaryText = questions.length === 1 && fullParsed.parts.length > 1 ? questions[0].core : text;
        const q = normalize(primaryText === text && fullParsed.parts.length === 1 ? fullParsed.parts[0].core : primaryText).replace(/[?!.]+$/, '')
            .replace(/^(?:then|and|also)\s+(?=(?:who|what|where|how|why|which|can|does|do|is|are)\b)/, ''),
            parsed = parse(primaryText), restrictions = {...(packet.restrictions || {})};
        const measurement = parseRequestedMeasurement(q);
        const effectTarget=q.match(/^what (?:does|do) .+? do to (.+)$/)?.[1]?.replace(/^(?:the|a|an) /,'');
        const procedure=parseProceduralRequest(q);
        const authorizationRequest=/^how (?:do|can|should|must) (?:i|we) (?:get|obtain|gain|secure) (?:permission|consent|approval) (?:to|for)\b/.test(q);
        const authorizationPhase=authorizationRequest && q.match(/\bafter (.+)$/)?.[1];
        const methodAssertion=parseMethodAssertion(q);
        const factualProperty=parseFactualPropertyRequest(q);
        const softwareCandidate=parseSoftwareCapabilityRequest(text) || parseSoftwareCapabilityRequest(q);
        const softwareOwner=fact=>entities.get(fact.entityId);
        const softwareRequest=softwareCandidate?.kind==='software-field' && softwareCandidate.fieldText==='purpose'
            ? facts.some(fact=>{
                const owner=softwareOwner(fact),names=owner?[owner.name,...owner.aliases]:[];
                const subject=normalize(softwareCandidate.subjectText).replace(/^(?:the|a|an) /,'');
                return owner && ['software','tool','client','launcher','api','bot','framework','program'].includes(owner.kind)
                    && (names.some(label=>key(label)===key(subject)) || /^(?:it|this|that)$/.test(subject) && !invalidated && lastFact && focus===owner.id)
                    && readSoftwareSemanticFields(fact,{subjectLabels:names}).includes('purpose');
            })?softwareCandidate:null:softwareCandidate;
        const resourceRequest=parseResourceConditionRequest(text) || parseResourceConditionRequest(q);
        const sequenceRequest=parseSequenceFieldRequest(text) || parseSequenceFieldRequest(q);
        const descriptiveRequest=parseDescriptiveReferenceRequest(text) || parseDescriptiveReferenceRequest(q);
        const namedFieldRequest=parseNamedSourceFieldRequest(text) || parseNamedSourceFieldRequest(q);
        const questionAttribution=parseQuestionSourceAttribution(q);
        const phaseCandidate=parseProcedurePhaseRequest(q);
        const phaseLabels=fact=>{
            const owner=entities.get(fact.entityId);
            const names=[owner?.name,...(owner?.aliases || [])].filter(Boolean);
            // The same reviewed title can be phrased as "Courage test" or
            // "Test of Courage". Preserve the complete name and its modifiers.
            const inverted=names.flatMap(name=>{
                const match=/^(test|shrine) of (.+)$/i.exec(name);
                return match?[`${match[2]} ${match[1]}`]:[];
            });
            return [fact.subject,...(fact.topicLabels || []),...(fact.aliases || []),...names,...inverted,
                ...procedurePhaseScopeLabels({fact,sourceRecord:sourceById.get(fact.sourceRecordId),phase:phaseCandidate?.phase})].filter(Boolean);
        };
        const phaseRequest=phaseCandidate && facts.some(fact=>fact.procedureFields?.some(field=>field.phase===phaseCandidate.phase)
            && (phaseLabels(fact).some(label=>key(label)===key(phaseCandidate.scopeText.replace(/^(?:the|a|an) /,'')))
                || /^(?:it|this|that|this route|that route|this quest|that quest|this trail|that trail)$/.test(phaseCandidate.scopeText)
                    && !invalidated && lastFact && focus===fact.entityId))?phaseCandidate:null;
        const semanticSoftware=softwareRequest?.kind==='software-field';
        const wholeFieldRequest=Boolean(sequenceRequest || descriptiveRequest || namedFieldRequest || phaseRequest || semanticSoftware);
        const sourceDetection=softwareRequest?.kind==='executable-detection';
        if(/^before (?:i|we) leave\b/.test(fullParsed.parts[0]?.core || '') && (!sourceFrame || !sourceFrame.singleContext))
            return {decision:'decline',text:'I cannot ground that complete departure scope in the guide.',recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',
                knowledge:{factIds:[],focusEntityId:null,unsupported:true}};
        const namingContext=sourceFrame?.preambles.find(item=>item.descriptor?.kind==='naming')?.descriptor;
        const staticNaming=Boolean(namingContext);
        const staticEntry=Boolean(sourceFrame?.preambles.some(item=>item.descriptor?.kind==='entry'));
        const sceneTransition=sourceFrame?.sceneTransitions.find(item=>item.descriptor.kind==='deferred-exit')?.descriptor;
        const sceneQuestion=sceneTransition && readSceneTransitionQuestion(sceneTransition,q);
        let deferredScene=sceneQuestion && !invalidated && lastFact && sceneIds.length===1
            ? sourceContexts.find(context=>context.id===sceneIds[0]) : null;
        // An exit answer may name a destination outside its source scene.
        // "There" then refers to that proved destination; it cannot silently
        // reuse the old scene's exit. This is topic reference, not travel state.
        if(deferredScene && /\bthere$/.test(sceneTransition.scopeText) && lastFacet==='route'){
            const destinations=[...new Set(links.filter(link=>['recorded','conditional'].includes(link.status)
                && ['leads_to','directs_to','quest-destination'].includes(link.relation)
                && link.evidenceFactIds.length && link.evidenceFactIds.every(id=>id===lastFact)
                && group(link.to)==='place').map(link=>link.to))];
            if(destinations.length===1 && destinations[0]!==deferredScene.entityId){
                const contexts=sourceContexts.filter(context=>context.entityId===destinations[0]);
                deferredScene=contexts.length===1?contexts[0]:null;
            }
        }
        if(sceneTransition && !deferredScene)return {decision:'clarify',text:'Name the area you want to leave so I can check its exit instructions.',
            recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',knowledge:{factIds:[],focusEntityId:null,unsupported:true}};
        const dialogueInstruction=/^what (?:do|should|can|must) (?:i|we) (?:(?:actually|really) )?(?:say|ask)\b/.test(q);
        const graphRequestShape=readGraphQuestion(q);
        // The complete turn must still be a source-question frame. An extra
        // if/once premise cannot disappear when the subordinate speak phase
        // is checked against its direct source proof below.
        const staticGraphPhase=graphRequestShape?.phase==='can-speak' && Boolean(sourceFrame);
        const conditionParts = fullParsed.parts.filter(part => part !== questions[0]);
        let propertyFacet = requestFacet(q, packet);
        const conditionalProperty = fullParsed.hypothetical && questions.length === 1 && conditionParts.length > 0
            && ['identity','purpose','use','outcome','stats'].includes(propertyFacet)
            && !/\b(?:next|now|already|before|should|must)\b/.test(q)
            && conditionParts.every(part => {
                if (!/^(?:once|if|when|after) (?:i|we) (?:have|get|obtain|acquire)\b/.test(part.core)) return false;
                const object = part.core.replace(/^(?:once|if|when|after) (?:i|we) (?:have|get|obtain|acquire)\s*/, '')
                    .replace(/^(?:the|a|an)\s+/, '');
                return /^(?:it|them|that|this|one)$/.test(object) && !invalidated && Boolean(focus)
                    || [...entities.values()].some(entity => entity.declared && [entity.name, ...entity.aliases]
                        .some(label => key(label) === key(object)));
            });
        if (primaryText !== text) {
            const unknownContextName = [...String(packet.scopeText || text).matchAll(/\b[A-Z][A-Za-z0-9'-]*\b/g)].map(match => match[0])
                .some(name => !vocabulary.has(word(normalize(name))) && !compactNames.has(key(name))
                    && !FILL.has(normalize(name)) && !QUESTION_WORDS.has(word(normalize(name))) && !isCommonWord(normalize(name))
                    && !(normalize(name)==='once' && (staticCondition?.phase || sourceFrame?.contextParts.some(part=>/^once\b/.test(part.core)))));
            if (unknownContextName) return null;
            // A topical preamble can contain a reference even when the actual
            // question names only a generic object. Losing "she/there" here
            // must not turn an unresolved mouse-hole question into any rune's
            // acquisition passage. Only prior proved or locally named actors
            // and places can ground those references.
            const context = sourceFrame?.context || '';
            const references = [
                [/\b(?:he|him|his|she|her)\b/,'person'],
                [/\b(?:it|its)\b/,'item'],
                [/\bthere\b/,'place']
            ].filter(([pattern])=>pattern.test(context));
            const local = [...entities.values()].filter(entity=>entity.declared && hasPhrase(context,entity.name));
            const unresolved = references.some(([,kind])=>{
                if(kind==='place' && deferredScene)return false;
                if(kind==='item' && sourceDetection && !invalidated && lastFact && focus)return false;
                const named = local.filter(entity=>group(entity.id)===kind);
                if(named.length===1)return false;
                if(named.length>1)return true;
                const scene=sourceContexts.filter(context=>sceneIds.includes(context.id) && group(context.entityId)===kind);
                const prior = focus && group(focus)===kind ? focus : salient.get(kind) || (scene.length===1?scene[0].entityId:null);
                return invalidated || !entities.has(prior);
            });
            if (unresolved && !stateQuestion) return {decision:'clarify',text:'Name the person, item or place in that condition so I can keep the answer attached to the right subject.',
                recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',
                knowledge:{factIds:[],focusEntityId:null,unsupported:true}};
        }
        const changed = /^(?:new topic|different topic|reset|start over|clear chat)\b/.test(q);
        if (changed) { reset(); return null; }
        const negativeQuestion = /^(?:can|does|do|is|are|will)\b/.test(q) && /\b(?:without|not|no)\b/.test(q);
        const positiveContextQuestion = primaryText !== text && !/\b(?:not|never|without)\b/.test(q)
            && (/\b(?:need|needs|require|requires|waiting for|permission|prerequisites)\b/.test(q)
                || fullParsed.parts.some(part => part !== questions[0] && part.intent === 'remedy' && !part.report));
        if (fullParsed.correction && !sourceFrame?.readOnlyContext || fullParsed.hypothetical && !conditionalProperty && !recordedCondition && !staticCondition && !staticGraphPhase && !staticNaming && !staticEntry && !sourceDetection || fullParsed.parts.some(part => part.report && !sourceFrame?.preambles.some(item=>item.part===part && item.descriptor?.readOnlyReport) || part.editionContext)
            || parsed.parts.length !== 1 && !sourceDetection && !wholeFieldRequest || parsed.parts.some(part => part.story)
            || (!negativeQuestion && !sourceDetection && /\b(?:without|not|never|unless|assuming|suppose|imagine)\b/.test(q))) return null;
        if (packet.transition === 'subject-hidden' || packet.transition === 'stale'
            || restrictions.hypothetical && !conditionalProperty && !recordedCondition && !staticCondition && !staticGraphPhase && !staticNaming && !staticEntry && !sourceDetection || restrictions.progress && !stateQuestion && !sourceFrame?.readOnlyContext
            || restrictions.negation && !negativeQuestion && !positiveContextQuestion && !sourceDetection) return null;
        const explicitSoftwareOwner=semanticSoftware && [...entities.values()].filter(entity=>[entity.name,...entity.aliases]
            .some(label=>key(label)===key(normalize(softwareRequest.subjectText).replace(/^(?:the|a|an) /,''))));
        const switchesSoftwareOwner=explicitSoftwareOwner?.length===1 && explicitSoftwareOwner[0].id!==focus
            || semanticSoftware && softwareRequest.categoryText && !/^(?:it|this|that)$/.test(normalize(softwareRequest.subjectText));
        const priorRestrictions=switchesSoftwareOwner?null:restriction;
        let guideOnly = Boolean(restrictions.guideOnly || fullParsed.parts.some(part => part.guideOnly) || priorRestrictions?.guideOnly);
        // A documentation-target question compares an edition with the source's
        // stated target; it does not assert that the tool supports that edition.
        const comparedEdition=semanticSoftware && softwareRequest.fieldText==='developer-target'
            && /^(?:starcraft )?remastered$/i.test(softwareRequest.targetText || '')?editionKey(softwareRequest.targetText):null;
        const editions = [...new Set([...(fullParsed.editions || []), ...(restrictions.editions || []), ...(priorRestrictions?.editions || [])])]
            .filter(edition=>!comparedEdition || editionKey(edition)!==comparedEdition);
        const eligible = fact => factEligible(fact, {guideOnly, editions});
        let available = facts.filter(eligible);
        const phaseRecords=[...sourceById.values()];
        const continuation=continuationAfterAcquisition(text,{facts:available,entities,sourceRecords:phaseRecords,isEligible:eligible});
        if(continuation){
            restriction={guideOnly,editions};lastFacet='method';
            return reply(continuation,{subject:continuation[0].entityId});
        }
        const dependency=reviewedAfterDependency(text,{facts:available,entities,links,sourceRecords:phaseRecords,isEligible:eligible});
        if(dependency){
            restriction={guideOnly,editions};lastFacet='prerequisites';
            return reply(dependency,{subject:dependency[0].entityId});
        }
        const optional=optionalActivitiesForObjective(text,{facts:available,sourceRecords:phaseRecords,isEligible:eligible});
        if(optional){
            restriction={guideOnly,editions};lastFacet='prerequisites';
            return reply(optional,{subject:optional[0].entityId});
        }
        const alternative=alternativeToProposedCombat(text,{facts:available,sourceRecords:phaseRecords,isEligible:eligible});
        if(alternative){
            restriction={guideOnly,editions};lastFacet='method';
            return reply([alternative],{subject:alternative.entityId,
                prefix:'This passage describes these alternatives; it does not say whether killing is necessary. '});
        }
        const versioned=versionedStatClaim(text,{facts:available,priorFactIds:!invalidated?lastProofIds:[],
            sourceRecords:phaseRecords,isEligible:eligible});
        if(versioned){
            restriction={guideOnly,editions};lastFacet='stats';
            return reply([versioned],{subject:versioned.entityId,
                prefix:'The guide does not establish that every edition gives that exact value. '});
        }
        const attributedFactIds=new Set(questionAttribution?available.filter(fact=>supportsQuestionSourceAttribution(questionAttribution,
            {fact,sourceRecord:sourceById.get(fact.sourceRecordId)})).map(fact=>fact.id):[]);
        const labels = fact => [fact.subject, ...(fact.aliases || []), entities.get(fact.entityId)?.name].filter(nonempty);
        // "Once inside" is a conditional source scope, not an entry report.
        // Use a direct place relation actually quoted for the active subject;
        // multiple places remain ambiguous and no containment chain is walked.
        const entryTargets=staticEntry && !invalidated && lastProofIds.length?[...new Set(links.filter(link=>['recorded','conditional'].includes(link.status)
            && ['leads-to','leads_to','opens-access-to','opens_access_to','found-at','found_at','found-in','found_in','located-at','located_at','located-in','located_in'].includes(link.relation)
            && group(link.to)==='place' && link.evidenceFactIds.length && link.evidenceFactIds.every(id=>lastProofIds.includes(id) && eligible(byFactId.get(id)))
            && (link.from===focus || lastFacet==='route' && link.evidenceFactIds.some(id=>byFactId.get(id).entityId===link.from))
            && link.evidenceFactIds.every(id=>!/\b(?:never|cannot|can't|do not|don't) enter\b/i.test(byFactId.get(id).text))).map(link=>link.to))]:[];
        const entryPlace=entryTargets.length===1?entryTargets[0]:null;
        if(staticEntry && !entryPlace)return {decision:'clarify',text:'Name the place you mean by “inside” so I can check its source instructions.',
            recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',knowledge:{factIds:[],focusEntityId:null,unsupported:true}};
        const bundleRequest=parseBundleRequest(q),bundleReference=resolveBundleReference({text:q,entities,links,facts,isEligible:eligible,
            focusEntityId:!invalidated?focus:null,returnedFacts:!invalidated?lastProofIds.map(id=>byFactId.get(id)).filter(Boolean):[]});
        const bundleOperand=bundleRequest?.operandText || '';
        const bundleMembers=new Set(links.filter(link=>link.relation==='has-component' && entities.get(link.from)?.kind==='bundle').map(link=>link.to));
        const bundleIntent=Boolean(bundleRequest && (entities.get(focus)?.kind==='bundle' && /\bthem\b/.test(bundleOperand)
            || /(?:\band\b|\+)/.test(bundleOperand) && [...bundleMembers].some(id=>[entities.get(id)?.name,...(entities.get(id)?.aliases || [])].filter(Boolean).some(label=>hasPhrase(bundleOperand,label)))));
        if(bundleIntent && !bundleReference)return {decision:'decline',text:'I cannot resolve every named component or that plural reference to one fully sourced group.',
            recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',knowledge:{factIds:[],focusEntityId:null,unsupported:true}};
        let named = available.flatMap(fact => {
            const matches = labels(fact).filter(label => hasPhrase(q, label));
            return matches.length ? [{ fact, matches, specificity: Math.max(...matches.map(label => tokens(label).filter(value => !FILL.has(value)).length)) }] : [];
        });
        const graphNames = [...entities.values()].filter(entity => entity.declared).flatMap(entity => {
            const matches = [entity.name, ...entity.aliases].filter(label => hasPhrase(q, label));
            const starts = matches.map(label => {
                const exact = q.indexOf(normalize(label));
                if (exact >= 0) return exact;
                const compact = q.indexOf(tokens(label).join(''));
                if (compact >= 0) return compact;
                // Reordered names still occupy their full phrase: "Spirituality
                // rune" must beat the shorter shared label "Spirituality".
                const significant = tokens(label).filter(value => !FILL.has(value));
                const positions = significant.map(value => q.search(new RegExp(`\\b${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'u')));
                return positions.length >= 2 && positions.every(index => index >= 0) ? Math.min(...positions) : -1;
            }).filter(index => index >= 0);
            return matches.length ? [{ id: entity.id, start: starts.length ? Math.min(...starts) : Infinity,
                specificity: Math.max(...matches.map(label => tokens(label).filter(value => !FILL.has(value)).length)) }] : [];
        });
        const propertyEntity=phrase=>{
            if(!phrase)return null;
            const value=normalize(phrase).replace(/^(?:the|a|an) /,'');
            if(/^(?:it|them|this|that|(?:this|that) (?:attack|swing|move|tool|runtime)|(?:the )?same ones?)$/.test(value))
                return !invalidated && lastFact && focus?{entity:entities.get(focus),labels:[entities.get(focus)?.name,...(entities.get(focus)?.aliases || [])].filter(Boolean),grounded:true}:null;
            if(value==='they')return namingContext && !/^(?:it|they|this|that)$/.test(normalize(namingContext.subjectText))?propertyEntity(namingContext.subjectText):null;
            let matches=[...entities.values()].filter(entity=>[entity.name,...entity.aliases].some(label=>key(label)===key(value)));
            const exact=matches.filter(entity=>key(entity.name)===key(value));if(exact.length)matches=exact;
            const composed=!matches.length && /\bmap$/.test(value)?[...entities.values()].filter(entity=>entity.kind==='map'
                && [entity.name,...entity.aliases].some(label=>hasPhrase(label,value))):[];
            if(composed.length===1)matches=composed;
            if(!matches.length && value==='basic attack')matches=[...new Set(available.filter(fact=>fact.answerRelations.includes('combat')
                && /\bbasic (?:strike|attack)\b/i.test(fact.text)).map(fact=>fact.entityId))].map(id=>entities.get(id));
            if(matches.length!==1)return null;
            return {entity:matches[0],labels:[matches[0].name,...matches[0].aliases,...(composed.length===1 || value==='basic attack'?[value]:[])],grounded:Boolean(namingContext)};
        };
        const propertySubject=factualProperty && propertyEntity(factualProperty.subjectText),propertyReference=factualProperty && propertyEntity(factualProperty.referenceText);
        const capabilityRequest=softwareRequest || resourceRequest || sequenceRequest || descriptiveRequest || namedFieldRequest || phaseRequest;
        let capabilitySubject=capabilityRequest && propertyEntity(capabilityRequest.subjectText);
        if(resourceRequest && /^(?:it|them|this|that|(?:this|that) one|(?:the )?same ones?)$/.test(normalize(resourceRequest.subjectText))
            && !invalidated && lastProofIds.length){
            const returned=lastProofIds.map(id=>byFactId.get(id)).filter(eligible);
            const ids=[...new Set(returned.flatMap(fact=>[fact.entityId,...fact.bindings.map(binding=>binding.entityId)]))];
            const options=ids.filter(id=>['item','spell'].includes(group(id))).map(id=>({entity:entities.get(id),labels:[entities.get(id).name,...entities.get(id).aliases],grounded:true}))
                .filter(option=>returned.some(fact=>supportsResourceConditionRequest(resourceRequest,{fact,subjectEntityId:option.entity.id,subjectLabels:option.labels,grounded:true})));
            if(options.length===1)capabilitySubject=options[0];
            else if(options.length>1)capabilitySubject=null;
        }
        const capabilityReference=softwareRequest?.kind==='property-comparison' && propertyEntity(softwareRequest.referenceText);
        const trainingLocation=/^where (?:do|can|should) (?:i|we) (?:find|locate) (.+?) for (?:lessons|training)$/.exec(q);
        const trainingSubject=trainingLocation && propertyEntity(trainingLocation[1]);
        const wholeFieldSets=wholeFieldRequest?available.flatMap(fact=>{
            const owner=entities.get(fact.entityId);if(!owner)return [];
            const context={fact,subjectEntityId:owner.id,subjectLabels:[owner.name,...owner.aliases],subjectKind:owner.kind,isEligible:eligible,
                sourceRecord:sourceById.get(fact.sourceRecordId),
                scopeTexts:phaseRequest?phaseLabels(fact):[fact.subject,...(fact.topicLabels || []),owner.name,...owner.aliases],grounded:!invalidated && Boolean(lastFact) && focus===owner.id};
            if(semanticSoftware){
                const returnedFacts=!invalidated?lastProofIds.map(id=>byFactId.get(id)).filter(eligible):[];
                const explicitReference=softwareRequest.referenceText && propertyEntity(softwareRequest.referenceText);
                const references=explicitReference?[explicitReference.entity]:[...new Set(returnedFacts.filter(prior=>readSoftwareSemanticFields(prior,
                    {subjectLabels:[entities.get(prior.entityId)?.name,...(entities.get(prior.entityId)?.aliases || [])]}).includes(softwareRequest.contextFieldText))
                    .map(prior=>prior.entityId))].map(id=>entities.get(id)).filter(entity=>entity.id!==owner.id);
                const reference=references.length===1?references[0]:null;
                return supportsSoftwareCapabilityRequest(softwareRequest,{...context,facts:[fact],returnedFacts,
                    referenceEntityId:reference?.id,referenceLabels:reference?[reference.name,...reference.aliases]:[]})?[[fact]]:[];
            }
            return (sequenceRequest?supportsSequenceFieldRequest(sequenceRequest,context):namedFieldRequest?supportsNamedSourceFieldRequest(namedFieldRequest,context)
                :phaseRequest?supportsProcedurePhaseRequest(phaseRequest,context):supportsDescriptiveReferenceRequest(descriptiveRequest,context))?[[fact]]:[];
        }):[];
        if(wholeFieldRequest){
            const ids=[...new Set(wholeFieldSets.map(proof=>proof[0].entityId))];
            capabilitySubject=ids.length===1?{entity:entities.get(ids[0]),labels:[entities.get(ids[0]).name,...entities.get(ids[0]).aliases],grounded:false}:null;
        }
        const capabilitySets=wholeFieldRequest?wholeFieldSets:capabilitySubject?available.flatMap(fact=>{
            const context={subjectEntityId:capabilitySubject.entity.id,subjectLabels:capabilitySubject.labels,grounded:capabilitySubject.grounded,
                returnedFacts:!invalidated?lastProofIds.map(id=>byFactId.get(id)).filter(eligible):[]};
            if(resourceRequest)return supportsResourceConditionRequest(resourceRequest,{...context,fact})?[[fact]]:[];
            if(softwareRequest.kind==='property-comparison')return capabilityReference?available.flatMap(reference=>
                supportsSoftwareCapabilityRequest(softwareRequest,{...context,facts:[fact,reference],referenceEntityId:capabilityReference.entity.id,referenceLabels:capabilityReference.labels})?[[fact,reference]]:[]):[];
            return supportsSoftwareCapabilityRequest(softwareRequest,{...context,facts:[fact]})?[[fact]]:[];
        }):[];
        const uniqueCapabilitySets=[...new Map(capabilitySets.map(proof=>[proof.map(fact=>semanticSoftware
            ?JSON.stringify([fact.entityId,fact.source.file,fact.source.locator,fact.text]):fact.id).sort().join('|'),proof])).values()];
        // Prefer an independently complete reviewed excerpt to a containing
        // excerpt from the same source record; never trim a witness ourselves.
        const capabilityProofSets=uniqueCapabilitySets.filter(proof=>!uniqueCapabilitySets.some(other=>other!==proof && other.length===proof.length
            && proof.every(fact=>other.some(candidate=>candidate.entityId===fact.entityId && candidate.sourceRecordId===fact.sourceRecordId
                && fact.text.includes(candidate.text))) && proof.some(fact=>other.some(candidate=>candidate.entityId===fact.entityId
                && candidate.sourceRecordId===fact.sourceRecordId && fact.text.length>candidate.text.length && fact.text.includes(candidate.text)))));
        const capabilityProofIds=new Set(capabilityProofSets.length===1?capabilityProofSets[0].map(fact=>fact.id):[]);
        const useComparisons=factualProperty?.kind==='use-comparison'?available.flatMap(fact=>{
            const clauses=fact.text.match(/(?:^|[.!?]\s+)([^.!?]+?) (?:are|is) used (?:at|for|to|in) [^.!?]+? while ([^.!?]+?) (?:unlocks?|(?:are|is) used (?:at|for|to|in)) /i);
            return clauses && supportsFactualPropertyRequest(factualProperty,{facts:[fact],subjectLabels:[clauses[1]],referenceLabels:[clauses[2]]})
                ?[{fact,subjectLabels:[clauses[1]],referenceLabels:[clauses[2]]}]:[];
        }):[];
        let roleContext=null;
        if(graphRequestShape?.contextRole){
            if(graphRequestShape.scopeLabel){
                const scoped=sourceContexts.filter(context=>[context.label,entities.get(context.entityId)?.name,...(entities.get(context.entityId)?.aliases || [])]
                    .filter(Boolean).some(label=>key(label)===key(graphRequestShape.scopeLabel.replace(/^(?:the|a|an) /,''))));
                if(scoped.length===1)roleContext=scoped[0];
            } else if(!invalidated && lastFact && sceneIds.length===1
                && !(graphRequestShape.destinationLabel && graphNames.some(hit=>[entities.get(hit.id)?.name,...(entities.get(hit.id)?.aliases || [])]
                    .filter(Boolean).some(label=>key(label)===key(graphRequestShape.destinationLabel)))))
                roleContext=sourceContexts.find(context=>context.id===sceneIds[0]);
        }
        let selectedEntity = null, locallyResolved = false, contextScoped = false;
        if (primaryText !== text) {
            const context = fullParsed.parts.filter(part => part !== questions[0]).map(part => readSourcePreamble(part.core)?.subjectText || part.core).join(' ');
            const local = contextSubject(context);
            // "For X, do I need Y?" asks about X's requirements. Y remains a
            // required material scope; it does not replace the subject X.
            if (local && (/\b(?:need|require|requires|requirements|prerequisites)\b/.test(q) || !graphNames.length)) {
                selectedEntity = local.id; locallyResolved = contextScoped = true;
                named = [];
            }
        }
        const pronoun = /\b(?:he|him|his|she|her|it|its|they|them|there|(?:this|that) (?:client|bot|item|spell|ai))\b/.test(q.replace(/^is there\b/,'is'));
        if (!selectedEntity && !named.length && pronoun) selectedEntity = carryId(q, packet);
        const pronominalObject=Boolean(procedure && /^(?:it|them|this|that|there|here)\b/.test(normalize(procedure.subjectText)))
            || /^(?:how|where) (?:do|can|should) (?:i|we) (?:(?:actually|really) )?(?:use|get|start|finish|open|find|acquire|download|install|extract|store|keep) (?:it|them)\b/.test(q);
        const pronominalSubject = pronoun && (pronominalObject || /^who (?:made|wrote|created|developed|authored) (?:this|that) (?:bot|tool|client|program|framework)\b/.test(q)
            || /^(?:(?:(?:what|where|how|why|when|which) )?(?:does|do|did|can|will|is|are|has|have|was|were) (?:it|its|he|his|she|her|they|their)|(?:what|which) .+ (?:does|do|did|can|will|has|have|was|were) (?:it|its|he|his|she|her|they|their)|where (?:is|are) (?:its|his|her|their))\b/.test(q));
        if (pronominalSubject) {
            selectedEntity = carryId(q, packet);
            if (selectedEntity) named = [];
        }
        if (primaryText !== text && pronominalSubject) {
            const context = fullParsed.parts.filter(part => part !== questions[0]).map(part => readSourcePreamble(part.core)?.subjectText || part.core).join(' ');
            const person = !pronominalObject && /\b(?:he|him|his|she|her)\b/.test(q);
            const mentions = [...entities.values()].filter(entity => entity.declared
                && (person ? group(entity.id) === 'person' : group(entity.id) !== 'person') && hasPhrase(context, entity.name));
            // A full authored topic may encompass shorter nested names. Two
            // unrelated people/items remain ambiguous, regardless of length.
            const local = contextSubject(context,person);
            if (local) { selectedEntity = local.id; named = []; locallyResolved = true; }
            else if (local===false || mentions.length > 1) { reset(); return null; }
        }
        const relative = relativeId(q, packet, eligible);
        if (relative) { selectedEntity = relative; named = []; locallyResolved = true; }
        const typed = typedReference(q, eligible);
        if (typed) { selectedEntity = typed; named = []; locallyResolved = true; }
        if (!pronominalSubject && !typed && !contextScoped && graphNames.length) {
            const auxiliary = q.match(/\b(?:does|do|is|are|can|will)\s+(?!(?:i|we|you)\b)(?:(?:the|a|an)\s+)?/);
            const operation = /^(?:how|where)\b/.test(q) && q.match(/\b(?:get|obtain|acquire|buy|purchase|use|learn|train|recruit|hire|install|download|activate|find|locate|repair|forge|craft|deliver|place|take|bring|summon|reach|enter|complete|finish|solve|inspect)\s+/);
            const subjectStart = operation ? operation.index + operation[0].length : auxiliary ? auxiliary.index + auxiliary[0].length : 0;
            const inSubject = graphNames.filter(hit => hit.start >= subjectStart).sort((a, b) => a.start - b.start || b.specificity - a.specificity);
            const closest = inSubject[0] || [...graphNames].sort((a, b) => a.start - b.start || b.specificity - a.specificity)[0];
            const peers = graphNames.filter(hit => hit.start === closest.start && hit.specificity === closest.specificity);
            if (peers.length === 1) selectedEntity = closest.id;
            const specific = named.filter(item => item.specificity > closest.specificity);
            const scopedTopics = new Set(specific.filter(item => item.specificity === Math.max(...specific.map(value => value.specificity))).map(item => item.fact.entityId));
            if (scopedTopics.size === 1) selectedEntity = [...scopedTopics][0];
        }
        selectedEntity = assemblySubject(selectedEntity, q, eligible);
        if(bundleReference){selectedEntity=bundleReference.entityId;named=[];locallyResolved=true;}
        if(factualProperty){
            if(propertySubject?.entity){selectedEntity=propertySubject.entity.id;named=[];locallyResolved=true;}
            else if(useComparisons.length===1){selectedEntity=useComparisons[0].fact.entityId;named=[];locallyResolved=true;}
        }
        if(capabilitySubject){selectedEntity=capabilitySubject.entity.id;named=[];locallyResolved=true;}
        if(graphRequestShape?.relation==='holder'){
            const holderSubject=propertyEntity(graphRequestShape.subjectLabel);
            if(holderSubject && group(holderSubject.entity.id)==='item'){selectedEntity=holderSubject.entity.id;named=[];locallyResolved=true;}
        }
        if(graphRequestShape?.relation==='training-location'){
            const practitioner=propertyEntity(graphRequestShape.subjectLabel);
            if(practitioner && group(practitioner.entity.id)==='person'){
                selectedEntity=practitioner.entity.id;named=[];locallyResolved=true;
            }
        }
        if(group(selectedEntity)==='person' && requestFacet(q,packet,'person')==='acquisition'){
            const objects=graphNames.filter(hit=>group(hit.id)==='item').filter(hit=>{
                const provider=lookupGraphQuestion({text:'Who gives it?',subjectIds:[hit.id],entities,links,facts,isEligible:eligible});
                return provider?.complete && provider.answerEntityIds.includes(selectedEntity);
            });
            const ids=[...new Set(objects.map(hit=>hit.id))];
            if(ids.length===1){selectedEntity=ids[0];named=[];locallyResolved=true;}
        }
        if(procedure && ['transport','concealment'].includes(procedure.kind)){
            const noun=normalize(procedure.subjectText).split(/\s+(?:past|in|inside)\s+/)[0].replace(/^(?:the|a|an) /,'');
            const explicit=[...entities.values()].filter(entity=>entity.declared && group(entity.id)==='item'
                && [entity.name,...entity.aliases].some(label=>key(label)===key(noun)));
            if(explicit.length===1){selectedEntity=explicit[0].id;named=[];locallyResolved=true;}
        }
        if (recordedCondition) { selectedEntity = recordedCondition.subjectEntityId; named = []; locallyResolved = true; }
        if(staticCondition){selectedEntity=staticCondition.subjectEntityId;named=[];locallyResolved=contextScoped=true;}
        if(deferredScene){selectedEntity=deferredScene.entityId;named=[];locallyResolved=true;}
        if(roleContext){selectedEntity=roleContext.entityId;named=[];locallyResolved=true;}
        if(dialogueInstruction && !graphNames.length && !selectedEntity && focus && !invalidated && ['person','monster'].includes(group(focus))){selectedEntity=focus;named=[];locallyResolved=true;}
        if(graphRequestShape?.relation==='controlled-character' && !graphNames.length){
            const tasks=[...new Set(links.filter(link=>link.relation==='recommended-controlled-character'
                && link.evidenceFactIds.includes(lastFact) && link.evidenceFactIds.every(id=>eligible(byFactId.get(id)))).map(link=>link.from))];
            if(tasks.length===1){selectedEntity=tasks[0];named=[];locallyResolved=true;}
        }
        if(graphRequestShape?.relation==='next-contact' && !graphNames.length && focus && !invalidated){selectedEntity=focus;named=[];locallyResolved=true;}
        if(['binding-agent','binding-vessel'].includes(graphRequestShape?.relation) && !graphNames.length && focus && lastFact && !invalidated){
            selectedEntity=focus;named=[];locallyResolved=true;
        }
        if(!graphNames.length && !pronominalSubject && sceneIds.length===1
            && (['interview'].includes(graphRequestShape?.relation)
                || /^(?:what|which) (?:clue|information|password)\b|^how (?:do|can|should) i (?:get permission to leave|leave|exit)\b/.test(q))){
            selectedEntity=sourceContexts.find(context=>context.id===sceneIds[0])?.entityId || selectedEntity;
            named=[];locallyResolved=true;
        }
        // A source restriction belongs to the subject of the previous request.
        // A newly named subject gets its own scope; a pronominal follow-up keeps
        // the existing restriction. Explicit source requests always still bind.
        if (selectedEntity && selectedEntity !== focus && !pronominalSubject && !deferredScene && restriction?.guideOnly
            && !fullParsed.parts.some(part => part.guideOnly) && !restrictions.guideOnly) {
            guideOnly = false;
            available = facts.filter(eligible);
            named = available.flatMap(fact => {
                const matches = labels(fact).filter(label => hasPhrase(q, label));
                return matches.length ? [{ fact, matches, specificity: Math.max(...matches.map(label => tokens(label).filter(value => !FILL.has(value)).length)) }] : [];
            });
        }
        if (!named.length && !selectedEntity && packet.status === 'ready' && !invalidated) selectedEntity = packet.entityId;
        if (!named.length && !selectedEntity && /^(?:download link|download|location|use|stats|requirements|prerequisites|what next)$/.test(q)) selectedEntity = focus;
        if (perCastResource(q)) {
            if (focus && !invalidated && group(focus) === 'spell') { selectedEntity = focus; named = []; }
            else return {decision:'clarify',text:'Which spell do you mean?',recordIds:[],sources:[],sourceLinks:[],
                actions:[],choices:[],stateChanges:[],level:'direct',knowledge:{factIds:[],focusEntityId:null,unsupported:true}};
        }
        const filler = new Set([...FILL, 'whose'].map(word));
        const queryWords = words(q).filter(value => !filler.has(value) && !(negativeQuestion && ['without', 'not', 'no'].includes(value)));
        const implicitScope = !contextScoped && (Boolean(deferredScene) || pronominalSubject || !graphNames.length && (pronoun || locallyResolved || typed
            || /\b(?:the|this|that|those) (?:rune|shard|hook|spell|item|weapon|plans|test|quest)\b/.test(q)));
        if (implicitScope && restriction) for (const field of ['material','quantities'])
            restrictions[field] = [...new Set([...(restrictions[field] || []),...(restriction[field] || [])])];
        if (!named.length && !selectedEntity && focus && !invalidated && queryWords.every(value => QUESTION_WORDS.has(value) || QUESTION_SCAFFOLD.has(value))) selectedEntity = focus;
        if (!named.length && !selectedEntity && queryWords.length) {
            // Objects inside a broader quest can be found in the passage body;
            // an unrelated proper name must still be preserved, never dropped.
            named = available.flatMap(fact => {
                const body = words(fact.text), significant = queryWords.filter(value => !['trade', 'deliver', 'prepare', 'navigate', 'start', 'finish', 'follow', 'cross', 'assemble', 'place', 'arrange', 'approach', 'show', 'expose', 'reporting', 'report', 'rune', 'book', 'entrance'].includes(value));
                return significant.length && significant.every(value => body.includes(value))
                    ? [{ fact, matches: [], specificity: 0 }] : [];
            });
        }
        const semantic = Array.isArray(opts.embedding) && opts.embedding.length === 384 && opts.embedding.every(Number.isFinite);
        propertyFacet=requestFacet(q,packet,group(selectedEntity));
        trace('subject', { selectedEntity, focus, lastFact, invalidated, guideOnly, editions,
            named: named.map(item => ({id:item.fact.id, specificity:item.specificity, matches:item.matches})),
            graphNames: graphNames.map(item => ({id:item.id, start:item.start, specificity:item.specificity})) });
        if (invalidated && pronoun && !named.length && !locallyResolved && !stateQuestion) return null;
        if (!stateQuestion && !locallyResolved && !selectedEntity && (pronominalSubject || pronoun && !named.length))
            return {decision:'clarify',text:'Which subject do you mean? Name it so I can answer from the right source.',
                recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',
                knowledge:{factIds:[],focusEntityId:null,unsupported:true,context:{guideOnly,editions:[...editions]}}};
        if (!named.length && !selectedEntity && semantic) {
            // Semantic search proposes a passage, never the answer's contents.
            // Unknown names, unsupported relationships and qualifiers are still
            // checked below against the selected passage and reviewed edges.
            named = available.map(fact => ({ fact, matches: [], specificity: 0 }));
        }
        if (stateQuestion) return {decision:'decline',text:'I cannot verify your current game state from this guide.',
            recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',
            knowledge:{factIds:[],focusEntityId:selectedEntity || null,unsupported:true,stateUnknown:true,
                context:{guideOnly,editions:[...editions]}}};
        if (!named.length && !selectedEntity) return measurement || procedure || factualProperty || capabilityRequest || questionAttribution
            ? {decision:'decline',text:measurement?'Name the subject so I can check whether its source gives that measurement.':'Name the subject so I can check those instructions.',
                recordIds:[],sources:[],sourceLinks:[],actions:[],choices:[],stateChanges:[],level:'direct',
                knowledge:{factIds:[],focusEntityId:null,unsupported:true,context:{guideOnly,editions:[...editions]}}}
            : null;
        const relatedItems = selectedEntity && ['person','monster'].includes(group(selectedEntity))
            ? [...new Set(links.filter(link => [link.from,link.to].includes(selectedEntity) && link.status !== 'disputed'
                && link.evidenceFactIds.every(id => eligible(byFactId.get(id))))
                .flatMap(link => [link.from,link.to]).filter(id => group(id) === 'item'))]
                .filter(id => [entities.get(id).name, ...entities.get(id).aliases].some(label => hasPhrase(text,label))) : [];
        const queryObject = relatedItems.length === 1 ? relatedItems[0] : relatedItems.length > 1 ? null : undefined;
        const locationProofs=new Map();
        const respond = (selected, options = {}) => {
            const complete=[...new Map(selected.flatMap(fact=>[fact,...(locationProofs.get(fact.id) || [])]).map(fact=>[fact.recordId,fact])).values()];
            return reply(complete, {...options, object:queryObject});
        };
        let unresolvedScope = {guideOnly,editions:[...editions]};
        const unsupported = message => ({ decision: 'decline', text: message, recordIds: [], sources: [], actions: [], choices: [], stateChanges: [], level: 'direct',
            knowledge: { factIds: [], focusEntityId: selectedEntity || null, objectEntityId:queryObject,
                unsupported: true, context:copy(unresolvedScope) } });
        if (!graphNames.length && focus === salient.get('role-item') && salient.has('recipient')
            && salient.get('recipient') === null && /\bhelp(?:ing)? (?:him|her|them)\b/.test(q))
            return unsupported('Which recipient do you mean? Name the person so I can keep the source and reward attached to the right subject.');
        const object = objectReference(q);
        if (object === null) return unsupported('Name the item you mean by “it” so I can find the right instruction.');
        const checkedQuestion=staticGraphPhase?q.replace(/ once (?:i|we) can speak to (?:it|them)$/,'')
            : factualProperty?.kind==='profile-comparison'?q.replace(/\bdifferent from\b/,'different versus')
                : factualProperty?.kind==='use-comparison'?q.replace(/\bused for the same thing$/,'used the same thing'):q;
        const scopeText = sourceFrame?.context ? [...sourceFrame.contextParts.map(part=>contextScope(part.q)),checkedQuestion].filter(Boolean).join('; ') : staticGraphPhase || factualProperty?checkedQuestion:primaryText !== text ? normalize(text) : q;
        const permissionAreas=fact=>['permission-method','permission-authority'].includes(graphRequestShape?.relation)?factSourceContexts({fact,contexts:sourceContexts}).flatMap(context=>{
            const owner=entities.get(sourceById.get(context.sourceRecordId)?.entityId),place=owner?.name.match(/\s[—–-]\s(.+)$/)?.[1];
            return place && [...entities.values()].some(entity=>group(entity.id)==='place' && key(entity.name)===key(place))?[place]:[];
        }):[];
        // Only a complete typed proof may establish the wording of its own
        // current request. Inherited restrictions, source/edition filters,
        // quantities and every independent context clause still bind normally.
        const topicalNames=fact=>[...(capabilityProofIds.has(fact.id)?[capabilityRequest.originalText]:[]),
            ...(attributedFactIds.has(fact.id)?[questionAttribution.seriesText+' questions']:[]),
            ...(propertyFacet==='combat'?locationContextTerms(fact):[]),
            ...(graphRequestShape?.assertion && /\b(?:cannot|can't) enter\b.*\bwithout\b/i.test(fact.text)?['inside']:[]),
            ...(trainingSubject && fact.entityId===trainingSubject.entity.id && fact.answerRelations.includes('location')
                && /\b(?:learn|train)\b/i.test(fact.text)?['lessons','training']:[]),
            ...permissionAreas(fact),...(graphRequestShape?.contextRole || graphRequestShape?.sceneLabel || sourceFrame?.preambles.some(item=>['topic','naming'].includes(item.descriptor?.kind)
                || /^for (?:the )?[^,;.?!]+$/.test(item.part.core))
            ? factSourceContexts({fact,contexts:sourceContexts}).flatMap(context=>[context.label,entities.get(context.entityId)?.name,
                ...(entities.get(context.entityId)?.aliases || [])].filter(Boolean)) : [])];
        const scoped = scopeConstraints(scopeText,
            primaryText !== text ? words(text).filter(value => !filler.has(value)) : queryWords, editions, sourceById, restrictions, text,topicalNames,
            fact=>Boolean(descriptiveRequest && capabilityProofIds.has(fact.id)));
        // Topic framing is not another requested predicate, but its subject and
        // modifiers must still belong to the proof. Preserve lower-case unknown
        // names and modifiers as well as numbers and edition/source directives.
        const contextTerms = (sourceFrame?.context ? sourceFrame.contextParts.flatMap(part=>words(contextScope(part.q))) : [])
            .filter(term => (!filler.has(term) || ['next','now','before','after'].includes(term)) && !editions.flatMap(words).includes(term));
        const literalContextTerms=sourceFrame?.context?[...new Set(sourceFrame.contextParts.flatMap(part=>tokens(contextScope(part.q))))]
            .filter(term=>contextTerms.includes(word(term))):[];
        const locationContextTerms=fact=>{
            if(!['location','combat'].includes(propertyFacet) || !contextTerms.length)return [];
            const contextualizer=propertyFacet==='combat'?sourceActorLocationContext:sourceLocationContext;
            const context=contextualizer({fact,sourceRecords:knowledge.sourceRecords,contextTerms:literalContextTerms,entities,
                isEligible:(value,role)=>role==='fact'?Boolean(eligible(value)):Boolean(factEligible({record:value,source:value.source,facet:'location'},{guideOnly,editions}))});
            if(!context.records.length)return [];
            locationProofs.set(fact.id,context.records.map(record=>({id:record.id,entityId:record.entityId,subject:record.title,
                aliases:record.aliases || [],facet:'location',answerRelations:['location'],bindings:[],text:record.text,witness:record.text,
                source:record.source,record,recordId:record.id,sourceRecordId:record.id,resources:[]})));
            return words(context.supportedTerms.join(' '));
        };
        const handover=sourceFrame?.contextParts.some(part=>/^once (?:he|she|they) (?:hands?|gives?) (?:it|them) over$/.test(part.core));
        const chapterTerms = new Set([...(sourceFrame?.context || '').matchAll(/\b(?:aboard|in|at|within)\s+([^,;]+?)(?=\s+(?:but|and)\b|[,;]|$)/g)]
            .flatMap(match=>words(match[1])).filter(term=>!filler.has(term)));
        unresolvedScope = {...unresolvedScope,...scoped.restrictions,
            material:[...new Set([...scoped.restrictions.material,...contextTerms])]};
        const authorizationPhaseScope=fact=>{
            if(!authorizationPhase)return true;
            const terms=words(authorizationPhase).filter(term=>!NAME_FILL.has(term));
            if(!terms.length || terms.some(term=>/\d/.test(term)))return false;
            const nominal={investigation:'investigate',recruitment:'recruit',preparation:'prepare',discussion:'discuss'};
            // Only an explicit action phase can name the source task. A noun
            // such as "password" or "escape" occurring elsewhere in a quest
            // is not evidence for an "after that phase" interpretation.
            const head=terms.at(-1),action=nominal[head] || (Object.values(nominal).includes(head)?head:null);
            if(!action)return false;
            return factSourceContexts({fact,contexts:sourceContexts}).some(context=>{
                if(!sceneIds.includes(context.id) && !hasPhrase(text,context.label))return false;
                const parent=sourceById.get(context.sourceRecordId),entity=entities.get(context.entityId);
                const topicWords=words([context.label,entity?.name,...(entity?.aliases || [])].filter(Boolean).join(' '));
                return parent && terms.slice(0,-1).every(term=>topicWords.includes(term))
                    && words([parent.title,parent.text].join(' ')).some(term=>(nominal[term] || term)===action);
            });
        };
        const conforms = fact => scoped(fact) && authorizationPhaseScope(fact) && (!handover || /\b(?:provides?|gives?)\b/i.test(fact.text))
            && (!effectTarget || hasPhrase(fact.text,effectTarget))
            && (!entryPlace || links.some(link=>link.from===selectedEntity && link.to===entryPlace
                && ['found-at','found-in','located-at','located-in','found_at','found_in','located_at','located_in'].includes(link.relation)
                && ['recorded','conditional'].includes(link.status) && link.evidenceFactIds.length===1 && link.evidenceFactIds[0]===fact.id))
            && (!bundleReference || !bundleReference.suffixText || words(bundleReference.suffixText).filter(term=>!QUESTION_WORDS.has(term) && !QUESTION_SCAFFOLD.has(term) && !filler.has(term)
                && !editions.flatMap(words).includes(term)).every(term=>words([fact.text,fact.subject,...fact.aliases].join(' ')).includes(term)))
            && (!graphRequestShape?.locationLabel || [fact.text,...permissionAreas(fact)].some(value=>hasPhrase(value,graphRequestShape.locationLabel.replace(/^(?:the|a|an) /,''))))
            && contextTerms.every(term => words([fact.subject,...fact.aliases,fact.text,sourceById.get(fact.sourceRecordId)?.title || '',
                entities.get(fact.entityId)?.name || '',...(entities.get(fact.entityId)?.aliases || [])].join(' ')).includes(term)
                || factSourceContexts({fact,contexts:sourceContexts}).some(context=>words(context.label).includes(term))
                || words(topicalNames(fact).join(' ')).includes(term)
                || term==='inside' && sourceFrame?.preambles.some(item=>item.descriptor?.kind==='topic')
                    && sceneIds.length===1 && factSourceContexts({fact,contexts:sourceContexts}).some(context=>context.id===sceneIds[0])
                || locationContextTerms(fact).includes(term)
                // A chapter key may establish a site's topical scope. It
                // cannot supply an arbitrary object modifier, answer text,
                // requested location assertion, condition or player state.
                || chapterTerms.has(term) && words(String(sourceById.get(fact.sourceRecordId)?.scope || '').replace(/[-_:]/g,' ')).includes(term)
                || term==='first' && /\bfirst login\b/.test(sourceFrame.context) && /\binitial (?:client )?login\b/i.test(fact.text))
            && (!measurement || supportsRequestedMeasurement(measurement,fact.text))
            && (!object || fact.entityId === object
            || fact.bindings.some(binding => binding.entityId === object)
            || [entities.get(object).name, ...entities.get(object).aliases]
                .filter(label => !['rune','lens','belt','book','shard','spell','scroll','item','weapon','tool','bot','client','map'].includes(normalize(label)))
                .some(label => hasPhrase([fact.subject, ...fact.aliases, fact.text].join(' '), label)));
        let sceneDestination=null;
        if(deferredScene){
            const destination=[...entities.values()].filter(entity=>entity.declared && group(entity.id)==='place' && [entity.name,...entity.aliases]
                .some(label=>key(label)===key(sceneQuestion.destinationText.replace(/^(?:the|a|an) /,''))));
            const origin=sceneQuestion.originText;
            const labels=[deferredScene.label,entities.get(deferredScene.entityId)?.name,...(entities.get(deferredScene.entityId)?.aliases || [])].filter(Boolean);
            if(destination.length!==1 || origin && !/^(?:here|there)$/.test(origin)
                && !labels.some(label=>key(label)===key(origin.replace(/^(?:the|a|an) /,''))))return unsupported('I cannot ground that exit destination or starting area in this conversation.');
            sceneDestination=destination[0];
        }
        if(methodAssertion){
            const person=entities.get(selectedEntity),grounded=!invalidated && Boolean(lastFact) && selectedEntity===focus && group(selectedEntity)==='person';
            const proof=available.filter(fact=>(fact.entityId===selectedEntity || fact.bindings.some(binding=>binding.entityId===selectedEntity
                    && ['recruitment','method'].every(role=>binding.relations.includes(role))))
                && conforms(fact) && supportsMethodAssertion(methodAssertion,{fact,subjectLabels:person?[person.name,...person.aliases]:[],lastFacet,grounded}));
            if(proof.length!==1)return unsupported('I do not have a grounded source for that recruitment method.');
            restriction={guideOnly,editions};lastFacet='recruitment';return respond(proof,{subject:selectedEntity});
        }
        if(capabilityRequest){
            const proved=capabilityProofSets.filter(proof=>proof.every(conforms));
            trace('capability',{kind:capabilityRequest.kind,subject:capabilitySubject?.entity.id,reference:capabilityReference?.entity?.id,
                proofSets:capabilityProofSets.map(proof=>proof.map(fact=>fact.id)),proved:proved.map(proof=>proof.map(fact=>fact.id))});
            if(proved.length!==1){const failure=unsupported('The available sources do not establish that complete capability or resource condition under those restrictions.');
                if(!capabilitySubject)failure.knowledge.focusEntityId=null;return failure;}
            restriction={guideOnly,editions};lastFacet=phaseRequest?phaseRequest.field==='supplies' || phaseRequest.field==='capture-safety'?'prerequisites':phaseRequest.field
                :namedFieldRequest?namedFieldRequest.field==='price'?'stats':namedFieldRequest.field:descriptiveRequest?'identity':sequenceRequest?.kind==='completion-reward'?'outcome':sequenceRequest?'sequence':resourceRequest?'limitations'
                    :semanticSoftware?softwareRequest.fieldText==='purpose'?'purpose':softwareRequest.fieldText==='packaged-opponent'?'identity':softwareRequest.fieldText==='java-runtime' || softwareRequest.fieldText==='same-java-runtime'?'version':softwareRequest.fieldText==='default-changes'?'limitations':softwareRequest.fieldText
                    :softwareRequest.kind==='property-comparison'?'comparison':['executable-detection','portable-configuration','procedure-field','procedure-continuation'].includes(softwareRequest.kind)?'method':'use';
            return respond(proved[0],{subject:capabilitySubject.entity.id,prefix:descriptiveRequest?`${capabilitySubject.entity.name}:\n`:''});
        }
        if(questionAttribution && !attributedFactIds.size){
            unresolvedScope.material=[...new Set([...(unresolvedScope.material || []),...words(questionAttribution.seriesText+' questions')])];
            return unsupported('That named question series does not supply this source answer.');
        }
        if(factualProperty){
            const labelSet=(entry,proof)=>entry?[...new Set([...entry.labels,...proof.filter(fact=>fact.entityId===entry.entity.id).map(fact=>fact.subject)])]:[];
            let sets=[];
            if(factualProperty.kind==='use-comparison')sets=useComparisons.filter(item=>conforms(item.fact)).map(item=>({facts:[item.fact],subjectLabels:item.subjectLabels,referenceLabels:item.referenceLabels}));
            else if(propertySubject){
                const direct=available.filter(fact=>fact.entityId===propertySubject.entity.id && conforms(fact));
                if(factualProperty.kind==='profile-comparison' && propertyReference){
                    const references=available.filter(fact=>fact.entityId===propertyReference.entity.id && conforms(fact));
                    sets=direct.flatMap(fact=>references.map(reference=>({facts:[fact,reference]})));
                }else sets=direct.map(fact=>({facts:[fact]}));
                sets=sets.map(set=>({...set,subjectLabels:labelSet(propertySubject,set.facts),referenceLabels:labelSet(propertyReference,set.facts),grounded:propertySubject.grounded}));
            }
            const proved=[...new Map(sets.filter(set=>supportsFactualPropertyRequest(factualProperty,set)).map(set=>[set.facts.map(fact=>fact.id).sort().join('|'),set])).values()];
            trace('factual-property',{kind:factualProperty.kind,subject:propertySubject?.entity.id,reference:propertyReference?.entity.id,
                useComparisons:useComparisons.map(item=>item.fact.id),sets:sets.map(set=>set.facts.map(fact=>fact.id)),proved:proved.map(set=>set.facts.map(fact=>fact.id))});
            if(proved.length!==1){const failure=unsupported('The available sources do not establish that complete factual comparison or property under those restrictions.');
                if(!propertySubject && !useComparisons.length)failure.knowledge.focusEntityId=null;return failure;}
            restriction={guideOnly,editions};lastFacet=factualProperty.kind==='category-assertion'?'identity':factualProperty.kind==='attack-property'?'combat':'comparison';
            return respond(proved[0].facts,{subject:selectedEntity});
        }
        if (measurement && !available.some(fact => conforms(fact)
            && (!selectedEntity || fact.entityId === selectedEntity || fact.bindings.some(binding => binding.entityId === selectedEntity))))
            return unsupported('The available sources do not give that age or measured quantity for the subject.');
        if(staticCondition){
            const proves=({descriptor,facts:proofs})=>{
                const text=proofs.map(fact=>fact.text).join(' '), source=normalize(text).replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ');
                if(descriptor.property==='separate-installation'){
                    const target=normalize(descriptor.requirementLabel).replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ');
                    const bundled=text.match(/\bincludes? (?:its )?own version of (.+?), so\b/i)?.[1];
                    const titles=bundled?[bundled,...(bundled.includes(':')?[bundled.split(':').at(-1)]:[])].map(title=>normalize(title).replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ')):[];
                    return {condition:descriptor.kind==='choice',property:Boolean(target && titles.includes(target)
                        && /\bincludes? (?:its )?own version\b/.test(source) && /\bdon t need to install\b/.test(source) && /\bseparately\b/.test(source))};
                }
                const network=/\binternet connection is only required for the initial (?:client )?login\b/.test(source)
                    && /\ball gameplay after login\b/.test(source) && /\blocal network\b/.test(source) && /\bno ongoing internet requirement during play\b/.test(source);
                return {condition:descriptor.kind==='choice' || descriptor.phase==='after-login' && network,property:network};
            };
            const candidates=available.filter(fact=>fact.entityId===staticCondition.subjectEntityId
                && fact.answerRelations.some(role=>['prerequisites','use','installation'].includes(role))
                && proves({descriptor:staticCondition,facts:[fact]}).property);
            if(candidates.length!==1)return unsupported('The available sources do not establish that conditional property for the subject.');
            const proof=resolveStaticPropertyCondition({descriptor:staticCondition,entities,focus:groundedFocus,facts,
                requiredFactIds:candidates.map(fact=>fact.id),isEligible:fact=>eligible(fact)&&conforms(fact),proves});
            if(!proof.complete)return unsupported('The available sources do not establish that conditional property under those restrictions.');
            restriction={guideOnly,editions};lastFacet='prerequisites';
            return respond(proof.factIds.map(id=>byFactId.get(id)),{subject:staticCondition.subjectEntityId});
        }
        if (recordedCondition) {
            const proof = resolveRecordedCondition({descriptor:recordedCondition, entities, links, facts,
                isEligible:fact => eligible(fact) && conforms(fact)});
            if (!proof.complete) return unsupported('The available sources do not establish that conditional rule under those restrictions.');
            restriction = {guideOnly, editions}; lastFacet = 'outcome';
            return respond(proof.factIds.map(id => byFactId.get(id)), {subject:recordedCondition.subjectEntityId});
        }
        if (/\b(?:dose|dosage)\b/.test(q) && !available.some(fact => conforms(fact)
            && (fact.entityId === selectedEntity || fact.bindings.some(binding => binding.entityId === selectedEntity))
            && /\b(?:dose|dosage)\b/i.test(fact.text) && /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(fact.text)))
            return unsupported('The available sources do not specify a dose for that request.');
        const unknownName = [...String(primaryText).matchAll(/\b[A-Z][A-Za-z0-9'’-]*\b/g)]
            .map(match => match[0]).some(name => {
                const term = word(normalize(name));
                return !editions.flatMap(words).includes(term) && !vocabulary.has(term) && !nameVocabulary.has(term) && !compactNames.has(key(name))
                    && !FILL.has(normalize(name)) && !QUESTION_WORDS.has(term) && !QUESTION_SCAFFOLD.has(term) && !isCommonWord(term);
            });
        if (unknownName) {
            const unknown = unsupported('I could not identify that subject in the available sources.');
            return { ...unknown, knowledge: { ...unknown.knowledge, focusEntityId: null } };
        }
        if (/\b(?:latest|current (?:[a-z]+ )?(?:ranking|version|release|rating|maintainer|status)|up.to.date|today)\b/.test(q)
            && !available.some(fact => conforms(fact) && /\b(?:latest|current|today)\b/i.test(fact.text)))
            return unsupported('The available sources do not establish that current information.');
        if (/\b(?:mother|father|daughter|son|sister|brother|married|wife|husband|parents?)\b/.test(q)
            && !links.some(link => /mother|father|daughter|son|sister|brother|married|wife|husband|parent/.test(link.relation)
                && [link.from, link.to].includes(selectedEntity))
            && !named.some(({fact}) => /\b(?:mother|father|daughter|son|sister|brother|married|wife|husband|parents?)\b/i.test(fact.text)))
            return unsupported('I do not have a sourced family relationship for that question.');
        if (/\b(?:answer|solution)\b.*\briddle\b|\b(?:exact|literal)\b.*\b(?:password|riddle|code)\b/.test(q)
            && !available.some(fact => /riddle-answer|password|literal-code/.test(fact.facet) && hasPhrase(q, fact.subject))) {
            const targetIds = selectedEntity ? [selectedEntity] : graphNames.filter(hit => hit.specificity === Math.max(...graphNames.map(value => value.specificity))).map(hit => hit.id);
            const answers = links.filter(link => targetIds.includes(link.from) && /^(?:riddle[-_]answer|has[-_]answer|answered[-_]by|accepts[-_]password)$/.test(link.relation)
                && link.status !== 'disputed' && link.evidenceFactIds.every(id => eligible(byFactId.get(id)) && conforms(byFactId.get(id))));
            const targets = [...new Set(answers.map(link => link.to))];
            if (targets.length === 1) {
                restriction = { guideOnly, editions };
                const proof = [...new Set(answers.flatMap(link => link.evidenceFactIds))].map(id => byFactId.get(id));
                return respond(proof, { target: targets[0], prefix: `${entities.get(targets[0]).name}:\n` });
            }
            return unsupported('The guide mentions this puzzle, but does not record its exact answer here.');
        }
        if (/\b(?:what is|what's) .+ name\b|\bname of (?:the )?.+\b/.test(q)
            && !named.some(({ fact }) => ['identity', 'definition'].includes(fact.facet)))
            return unsupported('The guide does not record that name.');
        const descriptive = /^(?:what (?:is|are)|what's|explain|describe|tell me about)\b/.test(q)
            && q.replace(/^(?:what (?:is|are)|what's|explain|describe|tell me about)\s+/, '').replace(/^(?:the|a|an)\s+/, '');
        const topicFacts = descriptive && available.filter(fact => fact.topicLabels?.some(label => key(label) === key(descriptive)) && conforms(fact));
        if (topicFacts?.length) {
            // These are explicitly reviewed facet labels, such as "training
            // points per level", not aliases defining a person or item.
            const distinct = new Set(topicFacts.map(fact => fact.text));
            if (distinct.size > 1 && new Set(topicFacts.map(fact => fact.entityId)).size > 1) return null;
            const selected = [...new Map(topicFacts.map(fact => [fact.text, fact])).values()];
            if (selected.length > 8 || selected.some(fact => fact.answerRelations.every(role => role === 'objective'))
                && /\b(?:method|procedure|instructions|solution)\b/.test(q)) return null;
            const support = [...new Set(selected.flatMap(fact => fact.support?.reference || []))].map(id => byFactId.get(id));
            if (support.some(fact => !eligible(fact))) return null;
            restriction = {guideOnly, editions}; lastFacet = 'reference';
            const complete = [...new Map([...selected, ...support].map(fact => [fact.id, fact])).values()];
            trace('topic', {factIds:complete.map(fact => fact.id)});
            return respond(complete, {subject:selected[0].entityId});
        }
        const graphIds = graphNames.filter(item => item.specificity === Math.max(...graphNames.map(value => value.specificity))).map(item => item.id);
        const ids = selectedEntity ? [selectedEntity] : graphIds.length ? graphIds
            : named.filter(item => item.matches.length && item.specificity > 0
                && item.specificity === Math.max(...named.map(value => value.specificity))).map(item => item.fact.entityId);
        const graphRequest = readGraphQuestion(q, requestFacet(q, packet, group(selectedEntity)));
        let roleIds=ids;
        if(graphRequest?.contextRole && roleContext){
            // Source-container membership narrows the candidate direct roles;
            // it supplies no extra edge, physical containment or completion.
            const sceneProof=new Set(available.filter(fact=>conforms(fact)
                && factSourceContexts({fact,contexts:sourceContexts}).some(context=>context.id===roleContext.id)).map(fact=>fact.id));
            roleIds=[...new Set(links.filter(link=>link.evidenceFactIds.length && link.evidenceFactIds.every(id=>sceneProof.has(id)))
                .flatMap(link=>[link.from,link.to]))];
        }
        const participantReference=graphRequest?.requestedParticipantLabel || graphRequest?.requestedDependencyLabel;
        let referenceEntityIds=[];
        if(participantReference && /^(?:him|her|he|she|it|them|they)$/.test(participantReference) && !invalidated && lastFact){
            if(['person','monster'].includes(group(focus)))referenceEntityIds=[focus];
            else referenceEntityIds=[...new Set(links.filter(link=>link.from===focus && ['binds-daemon','binds-agent'].includes(link.relation.replaceAll('_','-'))
                && ['recorded','conditional'].includes(link.status) && link.evidenceFactIds.length
                && link.evidenceFactIds.every(id=>lastProofIds.includes(id) && eligible(byFactId.get(id))))
                .map(link=>link.to))];
        }
        const graphAnswer = lookupGraphQuestion({ text: q, requestedRelation: requestFacet(q, packet, group(selectedEntity)),
            subjectIds: roleIds, entities, links, facts,sourceContexts,referenceEntityIds,
            isEligible: fact => {
                const accepted=eligible(fact) && conforms(fact);
                trace('graph-proof',{id:fact.id,accepted,scopeText,contextTerms,object,scoped:scoped(fact)});
                return accepted;
            } });
        if (graphAnswer && !graphAnswer.complete) return unsupported('I do not have complete sourced evidence for that relationship under those conditions.');
        if (graphAnswer?.factIds.length) {
            trace('graph', graphAnswer);
            const proof = graphAnswer.factIds.map(id => byFactId.get(id));
            const targets = graphAnswer.answerEntityIds;
            restriction = { guideOnly, editions };
            if(graphRequest?.relation==='permission-method')lastFacet='permission-method';
            else if(graphRequest?.phase==='permission-return')lastFacet='permission-return';
            // A location answer keeps the object as the topic. "There" may
            // refer to its place, but "it/them" still refers to the object.
            const personAnswer = /^(?:who|whose|whom|from whom)\b/.test(q);
            return respond(proof, { target: (personAnswer || graphRequest?.animate || graphRequest?.item || graphRequest?.sourceObject || graphRequest?.relation==='permission-method') && targets.length === 1 ? targets[0] : null,
                placeTarget:['location','destination'].includes(graphAnswer.relation) && targets.length===1?targets[0]:null,
                subject: selectedEntity, prefix: /^(?:who|whose|whom|from whom)\b/.test(q)
                    ? `${targets.map(id => entities.get(id).name).join(', ')}:\n` : '' });
        }
        if(staticGraphPhase)return unsupported('I do not have complete sourced evidence for that interaction phase and requested item.');
        if(graphRequest?.assertion || graphRequest?.contextRole || ['holder','binding-agent','binding-vessel','controlled-character','interview','requested-item','bribe-item','next-contact','recipient','resource-source','converter','informant','required-for','permission-method','permission-authority','training-location','buyer','control-method','container-contents'].includes(graphRequest?.relation))
            return unsupported('I do not have a complete sourced answer for that requested role.');
        if (graphRequest?.relation === 'teacher') return unsupported('I do not have a sourced teacher for that subject under those conditions.');
        if (/^(?:who|whose|whom|from whom)\b/.test(q)
            && /\b(?:give|gives|gave|giver|provides|provided|provider|teaches|taught|teacher|trains|trained|makes|made|maker|crafts|crafted|repairs|repaired)\b/.test(q)
            && !named.some(({fact}) => fact.answerRelations.includes('creator'))
            && !available.some(fact => fact.entityId === selectedEntity && fact.answerRelations.includes('creator')))
            return unsupported('I do not have a sourced person for that relationship.');
        const elliptical = /^(?:and|also)\b/.test(q) && named.length && lastFacet;
        let facet = deferredScene?'route':elliptical ? lastFacet : requestFacet(q, packet, group(selectedEntity)) || (semantic ? 'reference' : null);
        if (!facet) return null;
        const personAcquisition=facet==='acquisition' && group(selectedEntity)==='person';
        if(personAcquisition){
            if(!available.some(fact=>fact.entityId===selectedEntity && fact.answerRelations.includes('recruitment')
                || fact.bindings.some(binding=>binding.entityId===selectedEntity && binding.relations.includes('recruitment'))))
                return unsupported('Name the item you want from that person, or ask where to find them. Their item rewards do not establish acquisition of the person.');
            facet='recruitment';
        }
        if(facet==='acquisition' && !selectedEntity && !graphIds.length && named.every(item=>!item.matches.length)
            && /^how (?:do|can|should|must) (?:i|we) (?:get|obtain|acquire|buy|borrow|receive)\b/.test(q))
            return unsupported('I cannot attach that acquisition request to a sourced subject. A mention in another item\'s procedure does not establish how to obtain it.');
        const providerPhase=facet==='method' && providerAcquisition(q);
        if(providerPhase){
            const matches=[...entities.values()].filter(entity=>group(entity.id)==='person').flatMap(entity=>[entity.name,...entity.aliases].flatMap(label=>{
                const name=normalize(label),escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
                const match=normalize(providerPhase.ownerText).match(new RegExp(`^(?:the )?${escaped}(?:'s)?(?: (.+))?$`));
                return match?[{entity,modifiers:words(match[1] || ''),length:name.length}]:[];
            })).sort((a,b)=>b.length-a.length);
            const best=matches.filter(match=>match.length===matches[0]?.length),owners=[...new Set(best.map(match=>match.entity.id))];
            if(owners.length!==1)return unsupported('Name the person who supplies that item or permission so I can keep the requested role grounded.');
            providerPhase.owner=best[0].entity;providerPhase.modifiers=best[0].modifiers;
        }
        const allowedFacets = GROUPS[facet] || [facet], qWords = queryWords;
        const costAndEffect = /\bcosts?\s*(?:,? and|plus|&)\s*(?:do|effects?)\b/.test(q);
        const editionWords = new Set(editions.flatMap(words));
        const assertion = /^(?:does|do|did|is|are|was|were|has|have|can|could|will|would|must|should)\b/.test(q)
            || /^(?:does|do|did|is|are|was|were|has|have|can|could|will|would|must|should)\b/.test(normalize(primaryText));
        // A named item may be explained by an action attached to its giver or
        // quest. Search the evidence of its reviewed direct links as well as
        // records titled with the item's name. This expands candidates only;
        // it does not infer another relationship or traverse an unproved chain.
        const anchors = selectedEntity ? new Set([selectedEntity]) : new Set(graphIds);
        const sceneFactIds=new Set(deferredScene?available.filter(fact=>factSourceContexts({fact,contexts:sourceContexts}).some(context=>context.id===deferredScene.id)).map(fact=>fact.id):[]);
        const incidentFactIds = new Set(links.filter(link => link.status !== 'disputed' && (anchors.has(link.from) || anchors.has(link.to)))
            .flatMap(link => link.evidenceFactIds));
        const boundFactIds = new Set(available.filter(fact => fact.bindings.some(binding => anchors.has(binding.entityId))).map(fact => fact.id));
        const rolesFor = fact => {
            const scoped = fact.bindings.filter(binding => anchors.has(binding.entityId));
            return scoped.length ? [...new Set(scoped.flatMap(binding => binding.relations))] : fact.answerRelations;
        };
        const initial = named.length ? named : available.filter(fact => fact.entityId === selectedEntity || incidentFactIds.has(fact.id) || sceneFactIds.has(fact.id)).map(fact => ({ fact, matches: [], specificity: 0 }));
        const directEvidence = available.filter(fact => incidentFactIds.has(fact.id) || boundFactIds.has(fact.id) || sceneFactIds.has(fact.id)).map(fact => ({ fact, matches: [], specificity: 0 }));
        // A generic label such as BOOK must not suppress a more specific
        // passage mentioning the requested book. With no grounded subject,
        // search all eligible passages and require their material terms below.
        const semanticEvidence = semantic && !anchors.size
            ? available.map(fact => ({fact, matches:[], specificity:0})) : [];
        let requestedCapabilities = REQUEST_CAPABILITIES[facet];
        const unprovedAcquisition=facet==='acquisition' && selectedEntity
            && available.some(fact=>fact.bindings.some(binding=>binding.entityId===selectedEntity && binding.relations.includes('method')))
            && !available.some(fact=>fact.entityId===selectedEntity && fact.answerRelations.includes('acquisition')
                || fact.bindings.some(binding=>binding.entityId===selectedEntity && binding.relations.includes('acquisition')));
        const explicitTargetEvidence = available.some(fact => fact.bindings.some(binding => anchors.has(binding.entityId)
            && (!requestedCapabilities || binding.relations.some(role => requestedCapabilities.includes(role)))));
        trace('request', {facet, requestedCapabilities, anchors:[...anchors], incidentFactIds:[...incidentFactIds],
            boundFactIds:[...boundFactIds], initial:initial.map(item => item.fact.id)});
        let candidates = [...new Map([...semanticEvidence, ...directEvidence, ...initial].map(item => [item.fact.id, item])).values()]
            .filter(({fact})=>!questionAttribution || attributedFactIds.has(fact.id))
            .filter(({fact}) => !selectedEntity || fact.entityId === selectedEntity || incidentFactIds.has(fact.id) || boundFactIds.has(fact.id) || sceneFactIds.has(fact.id))
            .filter(({fact}) => !explicitTargetEvidence || !selectedEntity || fact.entityId === selectedEntity || boundFactIds.has(fact.id) || sceneFactIds.has(fact.id))
            .filter(({ fact }) => !requestedCapabilities || rolesFor(fact).some(relation => requestedCapabilities.includes(relation))
                || fact.support?.[facet]?.length
                || rolesFor(fact).includes('objective') && ['method', 'use', 'route', 'combat', 'acquisition'].includes(facet)
                || providerPhase && fact.entityId===providerPhase.owner.id && fact.answerRelations.includes('acquisition')
                || /^why\b/.test(q) && fact.answerRelations.includes('prerequisites'));
        if(deferredScene)candidates=candidates.filter(({fact})=>sceneFactIds.has(fact.id) && /\b(?:exit|leave)\b/i.test(fact.text)
            && [sceneDestination.name,...sceneDestination.aliases].some(label=>hasPhrase(fact.text,label))
            && !/\b(?:never|cannot|can't|do not|don't) (?:\w+ )?(?:exit|leave)\b/i.test(fact.text));
        if(procedure || providerPhase){
            // Keep unexplained object modifiers when this request abstains.
            // A later "forge it" must not silently lose "radioactive" from
            // the subject. Only a fresh named request can replace that scope.
            const proofWords=new Set(candidates.flatMap(({fact})=>words([fact.subject,...fact.aliases,fact.text,
                entities.get(fact.entityId)?.name || '',...(entities.get(fact.entityId)?.aliases || [])].join(' '))));
            const operations=new Set(['prepare','preparation','ready','forge','forged','craft','crafted','make','made','create','created','construct','constructed','return','deliver','back',
                ...(procedure?.kind==='release'?['get','release','released','free','freed']:[]),
                ...(['transport','concealment'].includes(procedure?.kind)?['get','carry','take','bring','past','hide','stash','store']:[]),
                ...(providerPhase?['acquire']:[])]);
            const unproved=qWords.filter(term=>!QUESTION_WORDS.has(term) && !QUESTION_SCAFFOLD.has(term)
                && !operations.has(term) && !proofWords.has(term));
            unresolvedScope.material=[...new Set([...unresolvedScope.material,...unproved])];
        }
        if (costAndEffect) candidates = candidates.filter(({fact}) => ['stats','use'].every(role => rolesFor(fact).includes(role)));
        if(dialogueInstruction)candidates=candidates.filter(({fact})=>/\b(?:mention|say|ask|answer|tell|keyword)\b/i.test(fact.text));
        if(facet==='acquisition' && /^how\b/.test(q)){
            // When both fields exist, a place name cannot replace the
            // documented pickup procedure merely by matching more aliases.
            const procedures=candidates.filter(({fact})=>rolesFor(fact).includes('method'));
            if(procedures.length)candidates=procedures;
        }
        if(facet==='use' && effectTarget && candidates.some(({fact})=>['effect','outcome'].includes(fact.facet)
            && fact.answerRelations.includes('outcome') && conforms(fact)))
            candidates=candidates.filter(({fact})=>['effect','outcome'].includes(fact.facet) && fact.answerRelations.includes('outcome'));
        if(providerPhase)candidates=candidates.filter(({fact})=>(rolesFor(fact).includes('method') || fact.entityId===providerPhase.owner.id && fact.answerRelations.includes('acquisition'))
            && providerPhase.modifiers.every(term=>[...fact.text.matchAll(/(?:[\p{L}]+\s+){0,3}(?:signature|rune|piece|portion|shard|fragment|permission|consent|approval|key|rations|blessing)\b/giu)]
                .some(match=>words(match[0]).includes(term)))
            && (providerPhase.field==='signature' ? signatureSignerProof(fact,providerPhase.owner)
                : ['permission','consent','approval'].includes(providerPhase.field) ? fact.entityId===providerPhase.owner.id && /\b(?:permission|consent|approval)\b/i.test(fact.text)
                : fact.entityId===providerPhase.owner.id && fact.answerRelations.includes('acquisition')
                    && (providerPhase.field==='map piece' ? /\b(?:piece|portion|shard|fragment)\b/i.test(fact.text) && /\bmap\b/i.test([fact.text,...fact.aliases].join(' '))
                        : words(fact.text).includes(word(providerPhase.field)))));
        let requirementDirectionMissing=false;
        if(facet==='prerequisites' && group(selectedEntity)==='person')candidates=candidates.filter(({fact})=>{
            const owned=fact.entityId===selectedEntity || fact.bindings.some(binding=>binding.entityId===selectedEntity && binding.relations.includes('prerequisites'));
            const reversed=/\b(?:required|needed)(?: (?:later|earlier|also|only|still|here|there|again)){0,2} (?:for|to enter|to reach)\b/i.test(fact.text)
                && !/\b(?:requires?|needs?|must have|prerequisites?:)\b/i.test(fact.text);
            if(!owned || reversed){requirementDirectionMissing=true;return false;}
            return true;
        });
        if(procedure)candidates=candidates.filter(({fact})=>supportsProceduralRequest(procedure,fact)
            && selectedEntity && (['transport','concealment'].includes(procedure.kind)
                ? (()=>{
                    const object=fact.text.match(/\b(?:hide|stash|store)\s+(.+?)\s+(?:in|inside)\b/i)?.[1];
                    return Boolean(object && (fact.entityId===selectedEntity
                        && [entities.get(selectedEntity).name,...entities.get(selectedEntity).aliases].some(label=>hasPhrase(object,label))
                        || fact.bindings.some(binding=>binding.entityId===selectedEntity && binding.relations.includes('method') && hasPhrase(object,binding.mention))));
                })()
                : fact.entityId===selectedEntity || links.some(link=>['recorded','conditional'].includes(link.status)
                && link.evidenceFactIds.length===1 && link.evidenceFactIds[0]===fact.id
                && (procedure.kind==='crafting' && link.to===selectedEntity && /^(?:makes|crafts|forges|creates|constructs|turns-into|transforms-into)$/.test(link.relation.replaceAll('_','-'))
                    || ['return','delivery'].includes(procedure.kind) && link.from===selectedEntity
                        && (procedure.kind==='return'?/^return-to$/:/^(?:return-to|deliver-to|given-to)$/).test(link.relation.replaceAll('_','-'))))));
        // A place mentioned in somebody else's quest locates that quest's
        // actor. An incidental person connected to it needs their own reviewed
        // location binding; the edge does not transfer the location role.
        if (facet === 'location' && ['person','monster'].includes(group(selectedEntity)))
            candidates = candidates.filter(({fact}) => fact.entityId === selectedEntity
                || fact.bindings.some(binding => binding.entityId === selectedEntity && binding.relations.includes('location')));
        if(facet==='combat' && group(selectedEntity)==='monster'
            && available.some(fact=>fact.entityId===selectedEntity && fact.answerRelations.includes('objective')
                || fact.bindings.some(binding=>binding.entityId===selectedEntity && binding.relations.includes('objective')))
            && !candidates.some(({fact})=>rolesFor(fact).includes('combat') || fact.support?.combat?.length))
            return unsupported('The guide records an objective for that named creature, but no supported combat method.');
        // A documentation or community request has an explicit reviewed type.
        // A semantically similar installation paragraph cannot substitute for
        // that type merely because it repeats more of the software's name.
        if (['documentation', 'support'].includes(facet) && candidates.some(({ fact }) => fact.facet === facet))
            candidates = candidates.filter(({ fact }) => fact.facet === facet);
        // Naming a character in an action passage is not a definition of that
        // character. Let the original source engine handle unindexed lore.
        if (facet === 'purpose') candidates = candidates.filter(item => allowedFacets.includes(item.fact.facet)
            || item.specificity >= 2 && group(item.fact.entityId) !== 'person'
                && [item.fact.subject, ...(item.fact.aliases || [])].some(label => hasPhrase(q, label)));
        if (facet === 'purpose' && group(selectedEntity) === 'person')
            candidates = candidates.filter(item => rolesFor(item.fact).includes('purpose'));
        if (facet === 'identity') candidates = candidates.filter(item => rolesFor(item.fact).includes('identity')
            || group(selectedEntity || item.fact.entityId) !== 'person' && rolesFor(item.fact).includes('explanation')
            || item.fact.support?.identity?.length);
        if (facet === 'identity') candidates = candidates.filter(item => item.matches.length
            || item.fact.entityId === selectedEntity || boundFactIds.has(item.fact.id));
        // Similarity can select among complete field witnesses. It cannot
        // promote an objective above an eligible answer to the actual field.
        if(facet==='combat' && requestedCapabilities && candidates.some(({fact})=>rolesFor(fact).some(role=>requestedCapabilities.includes(role)) && conforms(fact)))
            candidates=candidates.filter(({fact})=>rolesFor(fact).some(role=>requestedCapabilities.includes(role)));
        // Subject identity is a constraint, not a bag of words competing with
        // other entities. A named scope (Mars, a second person, a version) must
        // remain grounded even when ordinary request wording is paraphrased.
        const unknownSubject = !anchors.size && !named.some(item => item.matches.length) && qWords.filter(term => !vocabulary.has(term)
            && !QUESTION_WORDS.has(term) && !QUESTION_SCAFFOLD.has(term) && !isCommonWord(term) && !/\d/.test(term));
        if (unknownSubject?.length && !qWords.some(term => vocabulary.has(term) && !QUESTION_WORDS.has(term) && !QUESTION_SCAFFOLD.has(term))) return null;
        const scored = candidates.map(item => {
            const { fact } = item, titleWords = words([fact.subject, ...(fact.aliases || []), entities.get(fact.entityId)?.name || ''].join(' ')), contentWords = words(fact.text);
            const equivalent = equivalentRequestTerms(q, fact, text);
            if(attributedFactIds.has(fact.id))for(const term of words(questionAttribution.seriesText+' questions'))equivalent.add(term);
            if(/^who (?:made|wrote|created|developed|authored) .+ according to (?:its|their) own (?:documentation|docs)$/.test(q)
                && fact.answerRelations.includes('creator') && /\bREADME\b.*\bofficial wiki\b/i.test(fact.text)
                && fact.source.references?.some(reference=>/README|wiki/i.test(reference.label)))
                for(const term of ['documentation','own','according'])equivalent.add(term);
            if(typed===selectedEntity && /\bthe framework\b/.test(q) && fact.answerRelations.includes('documentation'))equivalent.add('framework');
            if(fact.answerRelations.includes('documentation') && fact.resources.length && /^where (?:can|do|should) (?:i|we) read\b/.test(q))equivalent.add('read');
            if(authorizationPhase && authorizationPhaseScope(fact))for(const term of words(authorizationPhase))equivalent.add(term);
            const constraintMismatch = !conforms(fact);
            const overlap = qWords.filter(term => titleWords.includes(term) || contentWords.includes(term));
            const resourceFormat = ['documentation', 'download', 'support'].includes(facet) && fact.resources.length > 0;
            const missing = qWords.filter(term => !titleWords.includes(term) && !contentWords.includes(term)
                && !equivalent.has(term)
                && !(resourceFormat && ['page', 'link', 'url', 'website', 'resource'].includes(term))
                && !(term === 'mantra' && /\b(?:chant|mantra)\b/i.test(fact.text))
                && !words(fact.facet).includes(term) && !editionWords.has(term) && !(!assertion && QUESTION_SCAFFOLD.has(term)) && !(semantic && !assertion && QUESTION_WORDS.has(term)) && !['acquire', 'requirement', 'recruit', 'route', 'location', 'link', 'effect', 'stat', 'setup',
                    'deliver', 'prepare', 'preparation', 'navigate', 'start', 'finish', 'follow', 'cross', 'assemble', 'place', 'placement',
                    'arrange', 'approach', 'show', 'expose', 'reporting', 'report', 'request', 'rune', 'book', 'entrance', 'handle', 'inspect', 'recover'].includes(term));
            const exactFacet = fact.facet === facet || (facet === 'prerequisites' && fact.facet === 'requirement');
            const materialMissing = missing.filter(term => !QUESTION_WORDS.has(term) && !QUESTION_SCAFFOLD.has(term));
            const specificity = item.specificity;
            const similarity = semantic && fact.vector ? fact.vector.reduce((sum, value, index) => sum + value * opts.embedding[index], 0) : 0;
            const score = specificity + overlap.length + (exactFacet ? 2 : allowedFacets.includes(fact.facet) ? 1 : 0) + similarity * 100
                + (selectedEntity === fact.entityId ? 8 : 0)
                + (/^what (?:does|do) .+ do to .+$/.test(q) && ['effect','outcome'].includes(fact.facet) && fact.answerRelations.includes('outcome')?4:0)
                + qWords.filter(term => titleWords.includes(term)).length - missing.length * (semantic ? 1.5 : 10)
                + (facet === 'route' && fact.facet === 'location' && /^where (?:do|can|should) i (?:take|bring)/.test(q) ? 8 : 0);
            return { ...item, score, missing, materialMissing, similarity, constraintMismatch };
        });
        let ranked = scored.filter(item => !item.constraintMismatch && (semantic && !assertion || !item.missing.length) && (!negativeQuestion || /\b(?:not|no|only|without|cannot)\b/i.test(item.fact.text))
                && (anchors.size || !item.materialMissing.length)
                && (!item.fact.sourceRecordId?.includes(':qa:') || !item.materialMissing.length)
                && (!(dialogueInstruction || procedure || deferredScene || providerPhase) || !item.materialMissing.length)
                && (!semantic || item.specificity > 0 || selectedEntity || item.similarity >= 0.38));
        if (facet === 'prerequisites' && ranked.some(item => ['requirement','prerequisites','requirements'].includes(item.fact.facet)))
            ranked = ranked.filter(item => ['requirement','prerequisites','requirements'].includes(item.fact.facet));
        if (facet === 'installation' && ranked.some(item => item.fact.facet === 'installation'))
            ranked = ranked.filter(item => item.fact.facet === 'installation');
        ranked.sort((a, b) => b.score - a.score || a.fact.text.length - b.fact.text.length);
        trace('ranking', {scores:scored.map(item => ({id:item.fact.id, entityId:item.fact.entityId, score:item.score,
            similarity:item.similarity, missing:item.missing, materialMissing:item.materialMissing, constraintMismatch:item.constraintMismatch})), ranked:ranked.map(item => item.fact.id)});
        const actorCombat = facet === 'combat' && group(selectedEntity) === 'person'
            && (!/^why\b/.test(q) || combatUtility(q));
        if (!ranked.length && (actorCombat || costAndEffect && ['item','spell'].includes(group(selectedEntity)))) {
            // The original adapter may already expose the requested field(s)
            // even when no focused facet contains them. Read the same fully
            // authorized record rather than substitute a training passage or
            // invent another fact/index vector.
            const sourceRoles = actorCombat ? ['combat'] : ['use','stats'];
            const supports = (record, role) => record.relation === role
                || Array.isArray(record.answers) && record.answers.includes(role) && record.source.index?.review === 'authored-index';
            const direct = [...sourceById.values()].filter(record => record && record.entityId === selectedEntity
                    && sourceRoles.every(role => supports(record,role)))
                .map(record => ({id:record.id, entityId:record.entityId, subject:record.title, aliases:record.aliases || [],
                    facet:record.relation, answerRelations:sourceRoles, bindings:[], text:record.text, witness:record.text,
                    record, recordId:record.id, sourceRecordId:record.id, source:record.source, resources:[]}))
                .filter(fact => eligible(fact) && conforms(fact))
                .filter(fact => qWords.every(term => words([fact.subject, ...fact.aliases, fact.text].join(' ')).includes(term)
                    || QUESTION_WORDS.has(term) || QUESTION_SCAFFOLD.has(term)
                    || equivalentRequestTerms(q,fact,text).has(term)));
            if (direct.length === 1) {
                restriction = {guideOnly, editions}; lastFacet = facet;
                const sourced = respond(direct, {subject:selectedEntity});
                return {...sourced, knowledge:{...sourced.knowledge, factIds:[], sourceFallback:true}};
            }
        }
        if (!ranked.length) return measurement || dialogueInstruction || procedure || deferredScene || authorizationRequest || unprovedAcquisition || providerPhase || personAcquisition || requirementDirectionMissing
            ? unsupported('The available sources do not establish that requested field under those restrictions.') : null;
        const best = ranked[0], tied = ranked.filter(item => item.score === best.score && item.fact.text !== best.fact.text);
        if (tied.length && new Set([best, ...tied].map(item => item.fact.entityId)).size > 1) return null;
        restriction = { guideOnly, editions };
        // A why-question can quote a recorded requirement, but cannot turn an
        // arbitrary action description into a cause or motive.
        if (/^why\b/.test(q) && !(facet === 'combat' && combatUtility(q) && rolesFor(best.fact).includes('combat'))
            && !best.fact.answerRelations.includes('cause') && !['cause', 'explanation'].includes(best.fact.facet)
            && !/\b(?:because|prevents?|ensures?|ensuring|limiting)\b|\bso (?:that |they |you |it |he |she )|\bwill not (?:function|work)\b/i.test(best.fact.text)) {
            const limited = respond([best.fact], { prefix: 'The guide records this requirement or action, but does not explain its reason: ' });
            return { ...limited, decision: 'decline', knowledge: { ...limited.knowledge, limited: true } };
        }
        lastFacet = facet;
        if ((best.fact.facet === 'objective' || rolesFor(best.fact).every(role => role === 'objective'))
            && ['method', 'use', 'route', 'combat', 'acquisition'].includes(facet)
            && !requestedCapabilities?.some(role=>rolesFor(best.fact).includes(role))) {
            const limited = respond([best.fact], { prefix: 'The guide records the objective, but does not describe the requested procedure: ' });
            return { ...limited, decision: 'decline', knowledge: { ...limited.knowledge, limited: true } };
        }
        const support = (best.fact.support?.[facet] || []).map(id => byFactId.get(id));
        const preceding = (best.fact.support?.[`before${facet}`] || []).map(id => byFactId.get(id));
        if ([...preceding,...support].some(fact => !fact || !eligible(fact))) return null;
        const sourcePaths=value=>(value || '').split(';').map(path=>path.trim()).filter(Boolean);
        if(preceding.some(fact=>fact.source.file!==best.fact.source.file || fact.text!==fact.witness
            || !sourcePaths(fact.source.locator).some(path=>sourcePaths(best.fact.source.locator).includes(path))))return null;
        const subject = selectedEntity || (graphIds.length === 1 ? graphIds[0] : null);
        // A later complete witness can contain the selected short excerpt.
        // Keep its full passage once, and retain every separately cited source.
        return respond([...preceding,best.fact,...support], { subject, placeTarget:sceneDestination?.id,
            dedupeContained:preceding.length>0 });
    }
    function observe(reply, packet, text) {
        if (reply?.knowledge) {
            // A missing relationship on a known subject does not erase that
            // subject. An unknown subject still invalidates stale follow-ups.
            if (reply.knowledge.unsupported) {
                relativeContext=null;
                if (!entities.has(reply.knowledge.focusEntityId)) reset();
                else {
                    if(reply.knowledge.focusEntityId!==focus){sceneIds=[];lastProofIds=[];lastFact=lastFacet=null;fieldReferents={};}
                    remember(reply.knowledge.focusEntityId);
                    if (reply.knowledge.objectEntityId === null) salient.delete('item');
                    else if (entities.has(reply.knowledge.objectEntityId)) salient.set('item',reply.knowledge.objectEntityId);
                    if (reply.knowledge.context) restriction = copy(reply.knowledge.context);
                }
            }
            return;
        }
        if (reply?.decision !== 'answer') {
            if (packet?.transition === 'ambiguous-subject' || packet?.blockReplay || /\b(?:who|whose|what|where|how|why|when|which)\b/.test(normalize(text))) reset();
            return;
        }
        relativeContext=null;
        const pureSource=!reply.stateChanges?.length && !reply.actions?.length && !reply.choices?.length
            && !reply.fallbackOrigin && !reply.fallbackRecordIds?.length;
        const cited=source=>{
            const expected=String(source?.locator || '').split(';').map(part=>part.trim()).filter(Boolean);
            return expected.length>0 && (reply.sources || []).some(actual=>actual?.file===source?.file && actual?.review===source?.review
                && expected.every(part=>String(actual.locator || '').split(';').map(value=>value.trim()).includes(part)));
        };
        const original=pureSource?(reply.recordIds || []).map(id=>sourceById.get(id)).filter(record=>record?.entityId===packet?.entityId
            && reply.text.includes(record.text) && cited(record.source) && factEligible({record,source:record.source,facet:record.relation},
                {guideOnly:Boolean(packet?.restrictions?.guideOnly),editions:packet?.restrictions?.editions || []})):[];
        // A complete cited source reply can establish a discussion subject by
        // its authorized alias, even when its full action title was not asked.
        // This proves the referent only, never the player's acquisition/state.
        const sourceFrame=parseSourceRequestFrame(text);
        const sourceSubjects=sourceFrame?.complete && sourceFrame.staticEligible
            ?[sourceFrame.subjectText,...sourceFrame.fields.map(field=>field.subjectText)].filter(Boolean):[];
        const aliasKey=value=>key(String(value).replace(/^(?:the|a|an)\s+/i,''));
        const sourceAlias=original.some(record=>[record.title,...(record.aliases || [])].some(label=>
            sourceSubjects.some(subject=>aliasKey(subject)===aliasKey(label))));
        if (packet?.entityId && entities.has(packet.entityId) && (!invalidated || hasPhrase(text, entities.get(packet.entityId).name) || sourceAlias)){
            if(packet.entityId!==focus){lastProofIds=[];lastFact=lastFacet=null;sceneIds=[];}
            remember(packet.entityId);
            // A delegated source answer can ground later references only in
            // complete reviewed witnesses actually present in that answer.
            const proved=pureSource?facts.filter(fact=>reply.recordIds?.includes(fact.sourceRecordId) && reply.text.includes(fact.witness)
                && cited(fact.source)
                && factEligible(fact,{guideOnly:Boolean(packet.restrictions?.guideOnly),editions:packet.restrictions?.editions || []}))
                :[];
            if(proved.length || original.length){
                lastProofIds=proved.map(fact=>fact.id);lastFact=proved[0]?.id || original[0].id;lastFacet=proved[0]?.facet || original[0].relation;
                // The source answer fulfilled its requested property or
                // recommendation criterion. Keep its source/edition scope;
                // unsupported scopes are retained by the separate decline path.
                restriction={guideOnly:Boolean(packet.restrictions?.guideOnly),editions:[...(packet.restrictions?.editions || [])]};
            }
        }
    }
    function sourceNarrative(text,response){
        const parsed=parse(text),scope={guideOnly:parsed.parts.some(part=>part.guideOnly),editions:parsed.editions || []};
        const eligible=(record,sourceRecord,claim)=>!record.conflict && !sourceRecord.conflict
            && factEligible({record,source:claim?.source || record.source,facet:record.relation},scope);
        const selection=selectSourceNarrativeAnswer({text,records:knowledge.sourceRecords,ceiling:'direct',isEligible:eligible});
        return response===undefined?selection:Boolean(selection && validateSourceNarrativeReply(selection,response,{isEligible:eligible}));
    }
    function sourceConflictQuotation(text,options={}){
        const selection=selectSourceConflictQuotation({text,knowledge,ceiling:options.spoiler || 'direct',inherited:{
            guideOnly:Boolean(options.guideOnly || restriction?.guideOnly),
            editions:[...(options.editions || []),...(restriction?.editions || [])]}});
        const response=sourceConflictQuotationReply(selection);
        return validateSourceConflictQuotationReply(selection,response)?response:null;
    }
    return { plan, planFrame, guardReply, sourceNarrative, sourceConflictQuotation, observe, reset, embeddingText, checkpoint, restore,
        inspect: () => ({ focus, lastFact, restriction: restriction && copy(restriction), coverage: copy(knowledge.coverage) }) };
}
