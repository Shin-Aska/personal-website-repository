// Narrow source-engine handoff for an exact, already indexed narrative
// question. This module does not parse aliases, predict intent, compose text,
// or replace the existing narrative interpreter. Callers still ask the source
// engine with the original words and must validate its complete reply here.
import { authorize } from './policy.js';
import { materialTerms, parse, playerStateQuestion } from './language.js';
import { tokens } from './retrieval.js';

const NARRATIVE_ASPECTS = new Set(['method', 'sequence', 'cause', 'summary']);
const QUANTITY = /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|another|both|either|neither|all|every|each|exactly|at least|at most|more than|less than|\d+(?:[.-]\d+)*)\b/i;
const EDITION_WORD = /\b(?:edition|version|remaster|release|classic|original)\b/i;
const NARRATIVE_LABELS = { method: 'Method', sequence: 'What followed', cause: 'Reason', summary: 'Summary' };
// The broad gameplay scaffold intentionally ignores verbs such as "killed".
// A causal handoff must also prove that predicate, rather than accepting any
// reason attached to the same named topic. Only grammatical glue is ignored.
const CAUSE_GLUE = new Set(('the a an is are was were be been being do does did has have had '
    + 'to of for in on at by with from as').split(' '));
// These are the source engine's fixed attribution wrappers, never generated
// prose. Validate the entire rendered answer so an intact quoted witness
// cannot authorize an additional claim before or after it.
const SOURCE_WRAPPERS = ['', 'The guide records: ', 'From the guide, traveler: ',
    'The chart records: ', 'Guide entry: ', 'Here is what the guide records: ',
    'Commander, the guide records: ', 'The guide offers this insight: ', 'The guide leaves this clue: '];

function completeNarrativeText(selection, wrapper) {
    const { record, claims } = selection;
    const disputed = record.narrative.status === 'disputed';
    const lead = disputed ? 'The sources give different accounts; no single explanation is established here.\n'
        : record.narrative.status === 'hedged' ? 'The source gives a tentative account:\n' : '';
    // Ordinary narratives are rendered once from the complete indexed text;
    // only disputed accounts receive separate claim attribution in the engine.
    const renderedClaims = disputed ? claims : [{ text: record.text, source: record.source }];
    const blocks = renderedClaims.map(claim => {
        const label = disputed ? `${(claim.source.references || []).map(ref => ref.label).join('; ')}:\n` : '';
        const attribution = claim.source.review === 'external-research'
            ? 'Not in this guide — from outside research: ' : wrapper;
        return label + attribution + claim.text;
    });
    if (record.narrative.sequenceMode === 'steps') blocks.unshift("In the guide's steps:");
    return `${record.title} — ${NARRATIVE_LABELS[selection.request.aspect]}:\n` + lead + blocks.join('\n\n');
}

function containsPhrase(text, phrase) {
    const haystack = tokens(text), needle = tokens(phrase);
    if (!needle.length || needle.length > haystack.length) return false;
    for (let start = 0; start <= haystack.length - needle.length; start++)
        if (needle.every((word, offset) => haystack[start + offset] === word)) return true;
    return false;
}

function sameReferences(expected = [], actual = []) {
    return expected.every(reference => actual.some(candidate => candidate.label === reference.label
        && candidate.url === reference.url && (reference.checkedAt === undefined || candidate.checkedAt === reference.checkedAt)));
}

function sameSource(expected, actual, indexSource) {
    return Boolean(expected && actual && expected.file === actual.file && expected.locator === actual.locator
        && expected.review === actual.review
        && sameReferences(expected.references || [], actual.references || [])
        && (!indexSource || (actual.index?.file === indexSource.file
            && actual.index?.locator === indexSource.locator && actual.index?.review === indexSource.review)));
}

function sameCompositeSource(record, claims, actual) {
    return sameSource(record.source, actual, record.source?.index)
        && sameReferences(actual.references || [], record.source.references || [])
        && Array.isArray(actual.claims) && actual.claims.length === claims.length
        && claims.every((claim, i) => actual.claims[i]?.text === claim.text
            && sameSource(claim.source, actual.claims[i]?.source)
            && sameReferences(actual.claims[i]?.source?.references || [], claim.source.references || []));
}

function requiredClaims(record) {
    const claims = record.source?.claims;
    return Array.isArray(claims) && claims.length ? claims : [{ text: record.text, source: record.source }];
}

function eligibility(callback, authorized, sourceRecord, claim = null) {
    if (typeof callback !== 'function') return false;
    try { return callback(authorized, sourceRecord, claim) === true; }
    catch { return false; }
}

/**
 * Select exactly one unconditional, directly authorized indexed narrative
 * from the original parse shape. `isEligible(authorizedRecord, sourceRecord,
 * claimOrNull)` is an independent caller-owned source/policy check and must
 * positively approve the record and each claim.
 */
export function selectSourceNarrativeAnswer({ text, records, ceiling = 'direct', editions = [], isEligible } = {}) {
    if (typeof text !== 'string' || !Array.isArray(records) || typeof isEligible !== 'function') return null;
    const parsed = parse(text, { editions });
    if (parsed.tooMany || parsed.parts.length !== 1 || parsed.correction || parsed.hypothetical
        || playerStateQuestion(text)) return null;
    const part = parsed.parts[0], request = part?.narrative;
    if (!request || !NARRATIVE_ASPECTS.has(request.aspect) || request.contextual || request.pair
        || part.report || part.story || part.editionContext || part.editions?.length || parsed.editions?.length) return null;
    if (EDITION_WORD.test(part.q) || QUANTITY.test(request.query || '')) return null;

    const candidates = [];
    for (const sourceRecord of records) {
        if (sourceRecord?.relation !== 'narrative' || sourceRecord.conflict
            || sourceRecord.source?.review === 'conflicting' || sourceRecord.requires != null
            || (sourceRecord.editions || []).length) continue;
        const record = authorize(sourceRecord, ceiling);
        if (!record || record.relation !== 'narrative' || record.conflict || record.requires != null
            || (record.editions || []).length || record.diagnostics?.length || !record.narrative
            || record.narrative.aspect !== request.aspect
            || request.aspect === 'sequence' && record.narrative.sequenceMode !== (request.sequenceMode || 'events')) continue;
        // A guide-only request cannot borrow external research. Other explicit
        // source wording is still checked by the independent callback.
        if (part.guideOnly && record.source.review === 'external-research') continue;
        const labels = [...new Set([...(record.narrative.subjects || []), record.title, ...(record.aliases || [])]
            .filter(value => typeof value === 'string' && value.trim()))];
        const matchedLabels = labels.filter(label => containsPhrase(request.query || '', label));
        if (!matchedLabels.length) continue;
        // The narrative parser has already removed the question-role grammar.
        // Any remaining material term or quantity is an extra condition,
        // source, edition, or scope request and must stay on the ordinary path.
        const predicate = request.aspect === 'cause'
            ? [record.narrative.predicate || '', ...(record.narrative.context || [])] : [];
        if (materialTerms(request.query || '', [...matchedLabels, ...predicate]).length || QUANTITY.test(text)) continue;
        if (request.aspect === 'cause' || request.aspect === 'summary') {
            const covered = new Set([...matchedLabels, ...predicate].flatMap(label => tokens(label)));
            if (tokens(request.query || '').some(word => !CAUSE_GLUE.has(word) && !covered.has(word))) continue;
        }
        if (!eligibility(isEligible, record, sourceRecord)) continue;
        const claims = requiredClaims(record);
        if (!claims.length || claims.some(claim => !claim?.text || !claim?.source
            || !eligibility(isEligible, record, sourceRecord, claim))) continue;
        candidates.push({ record, sourceRecord, request: { ...request }, claims });
    }
    return candidates.length === 1 ? candidates[0] : null;
}

/** Validate a complete source-engine narrative reply; no partial witness pass. */
export function validateSourceNarrativeReply(selection, reply, { isEligible } = {}) {
    if (!selection?.record || !selection?.sourceRecord || !Array.isArray(selection.claims)
        || !selection.claims.length || typeof isEligible !== 'function' || !reply || reply.decision !== 'answer') return false;
    const record = selection.record, sourceRecord = selection.sourceRecord;
    if (record.relation !== 'narrative' || record.conflict || record.requires != null || (record.editions || []).length
        || reply.actions?.length || reply.stateChanges?.length || reply.choices?.length
        || reply.knowledge?.limited || reply.knowledge?.unsupported || reply.fallbackOrigin
        || reply.fallbackRecordIds?.length || reply.generated === true || reply.modelGenerated === true) return false;
    const ids = [...new Set(reply.recordIds || [])];
    if (ids.length !== 1 || ids[0] !== record.id || typeof reply.text !== 'string' || !reply.text.trim()) return false;
    if (!selection.request || !NARRATIVE_LABELS[selection.request.aspect]
        || record.diagnostics?.length
        || !SOURCE_WRAPPERS.some(wrapper => reply.text === completeNarrativeText(selection, wrapper))) return false;
    const indexSource = record.source?.index;
    const composite = source => record.narrative.status !== 'disputed'
        && sameCompositeSource(record, selection.claims, source);
    if ((reply.sources || []).some(source => !composite(source) && !selection.claims.some(claim => sameSource(claim.source, source, indexSource)
        && sameReferences(source.references || [], claim.source.references || [])))) return false;
    const references = [...(record.source?.references || []), ...selection.claims.flatMap(claim => claim.source.references || [])];
    if ((reply.sourceLinks || []).some(link => !references.some(reference => link?.text === reference.label
        && link?.url === reference.url))) return false;
    for (const claim of selection.claims) {
        if (!reply.text.includes(claim.text) || !eligibility(isEligible, record, sourceRecord, claim)) return false;
        const refs = claim.source.references || [];
        const matched = (reply.sources || []).some(source => composite(source)
            || sameSource(claim.source, source, indexSource) && sameReferences(refs, source.references || []));
        if (!matched) return false;
        for (const reference of refs) if (record.narrative.status === 'disputed')
            if (!reply.text.includes(reference.label)) return false;
    }
    for (const reference of record.source?.references || []) {
        const cited = (reply.sources || []).some(source => sameReferences([reference], source.references || []))
            || (reply.sourceLinks || []).some(link => link?.text === reference.label && link?.url === reference.url);
        if (!cited) return false;
    }
    if (record.narrative.status === 'disputed'
        && !reply.text.includes('The sources give different accounts; no single explanation is established here.')) return false;
    if (record.narrative.status === 'hedged' && !reply.text.includes('The source gives a tentative account:')) return false;
    return true;
}

