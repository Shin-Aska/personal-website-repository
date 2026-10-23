// Authorised variants are copied before indexing: no hidden text or aliases escape.
import { validNarrativeMetadata, validNarrativeSource, validStoryMetadata } from './topics.js';

export const LEVELS = ['gentle', 'balanced', 'direct'];
export function level(value) {
    return value === 'light' ? 'gentle' : LEVELS.includes(value) ? value : 'gentle';
}
export function allowed(minimum, ceiling) {
    return LEVELS.indexOf(level(minimum)) <= LEVELS.indexOf(level(ceiling));
}
export function authorize(record, ceiling) {
    if (!allowed(record.minSpoiler || 'gentle', ceiling)) return null;
    const levels = LEVELS.slice(0, LEVELS.indexOf(level(ceiling)) + 1).reverse();
    const chosen = levels.find(key => record.variants?.[key]);
    if (!chosen) return null;
    const variant = record.variants[chosen];
    const value = typeof variant === 'string' ? { text: variant } : variant;
    if (!value.text) return null;
    const source = value.source || record.variantSources?.[chosen] || record.source;
    const indexedNarrative = record.relation === 'narrative';
    if ((record.relation === 'story' || indexedNarrative) && (!LEVELS.includes(record.minSpoiler)
        || Object.keys(record.variants).length !== 1 || chosen !== record.minSpoiler
        || typeof (value.title || record.title) !== 'string' || !(value.title || record.title).trim()
        || !Array.isArray(value.aliases || record.aliases || [])
        || (value.aliases || record.aliases || []).some(alias => typeof alias !== 'string' || !alias.trim())
        || source?.index?.review !== 'authored-index'
        || [source.index.file, source.index.locator, source.file, source.locator].some(field => typeof field !== 'string' || !field.trim())
        || !['extracted', 'external-research'].includes(source.review)
        || (source.review === 'external-research' && (!Array.isArray(source.references) || !source.references.length
            || source.references.some(reference => typeof reference?.label !== 'string' || !reference.label.trim()
                || !/^https?:\/\//i.test(reference?.url || ''))))
        || (indexedNarrative ? !validNarrativeMetadata(record.narrative, value.text)
            || !validNarrativeSource(record.narrative, value.text, source) : !validStoryMetadata(record.story, value.text)))) return null;
    // Every copied claim is already at this record's authorized ceiling. Keep
    // only the source fields used for attribution, with independent arrays so
    // rendering or conversation state cannot mutate the underlying records.
    const copyReferences = references => references.map(reference => ({ label: reference.label, url: reference.url,
        ...(typeof reference.checkedAt === 'string' ? { checkedAt: reference.checkedAt } : {}) }));
    const copiedSource = indexedNarrative ? { file: source.file, locator: source.locator, review: source.review,
        index: { file: source.index.file, locator: source.index.locator, review: source.index.review },
        ...(source.references ? { references: copyReferences(source.references) } : {}),
        claims: source.claims.map(claim => ({ text: claim.text, source: { file: claim.source.file,
            locator: claim.source.locator, review: claim.source.review,
            ...(claim.source.references ? { references: copyReferences(claim.source.references) } : {}) } })) } : source;
    return {
        id: record.id, entityId: record.entityId || record.id,
        title: value.title || record.title,
        aliases: [...(value.aliases || record.aliases || [])],
        kind: record.kind, relation: record.relation, scope: record.scope,
        // Adapter-declared extra relationships this fact answers (e.g. an
        // equipment statistics entry that is also its effect description).
        answers: [...(record.answers || [])],
        acquisitionMethods: value.acquisitionMethods || record.acquisitionMethods || [],
        text: value.text, level: chosen, source: copiedSource,
        ...(record.relation === 'story' ? { story: { role: record.story.role,
            people: [...record.story.people], context: [...record.story.context],
            ...(record.story.qualifier === undefined ? {} : { qualifier: record.story.qualifier }) } } : {}),
        ...(indexedNarrative ? { narrative: { aspect: record.narrative.aspect,
            subjects: [...record.narrative.subjects], context: [...record.narrative.context],
            status: record.narrative.status || 'recorded',
            ...(record.narrative.predicate === undefined ? {} : { predicate: record.narrative.predicate }),
            ...(record.narrative.sequenceMode === undefined ? {} : { sequenceMode: record.narrative.sequenceMode }) } } : {}),
        requires: record.requires ?? null,
        completionFact: record.completionFact,
        ...(Array.isArray(record.checklist) ? { checklist: record.checklist.map(step => ({
            recordId: step.recordId, completionFact: step.completionFact
        })) } : {}),
        acquisitionFact: record.acquisitionFact,
        possessionFact: record.possessionFact, partyFact: record.partyFact,
        locationFact: record.locationFact, optional: !!record.optional,
        editions: record.editions || [], conflict: record.conflict || false,
        // The guide's overall comparison of its options, used when a question names no option.
        general: !!record.general,
        // Actions are authored identifiers; never URLs or executable JSON.
        actions: (value.actions || []).filter(a => a && typeof a.id === 'string'
            && allowed(a.minSpoiler || chosen, ceiling)),
        diagnostics: (value.diagnostics || []),
    };
}
