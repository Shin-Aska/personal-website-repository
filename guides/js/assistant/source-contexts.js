// Reviewed source-container scopes support retrieval and conversational
// continuity only. They do not assert location, ordering, prerequisites or state.
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const copy = value => JSON.parse(JSON.stringify(value));
const words = value => String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").match(/[\p{L}\p{N}]+/gu) || [];
const descriptive = value => words(value).some(word => word.length > 2
    && !['the', 'and', 'with', 'from', 'for', 'this', 'that', 'source', 'chapter', 'topic'].includes(word));
const phrase = (text, label) => {
    const haystack = ` ${words(text).join(' ')} `, needle = ` ${words(label).join(' ')} `;
    return haystack.includes(needle);
};

// Parse complete structural segments instead of comparing arbitrary strings.
// In particular [0] differs from [00], [01] and [1]. Exact selector spelling is
// preserved: this module does not infer equivalent indices or ID selectors.
function structuralLocator(value) {
    if (!nonempty(value) || value !== value.trim()) return null;
    const segments = [];
    const first = /^[A-Za-z_$][\w$]*/.exec(value);
    if (!first) return null;
    segments.push(first[0]);
    let rest = value.slice(first[0].length);
    // Ultima V guide records use one explicit selector immediately after the
    // collection name. Keep its exact key and value as a complete segment;
    // whitespace, quotes and arbitrary key=value text are not equivalents.
    const namedContainer = /^ (?:objective|id)=[A-Za-z_$][\w$-]*/.exec(rest);
    if (namedContainer) {
        segments.push(namedContainer[0]);
        rest = rest.slice(namedContainer[0].length);
    }
    while (rest) {
        const field = /^\.[A-Za-z_$][\w$]*/.exec(rest);
        const selector = /^\[(?:0|[1-9]\d*|[A-Za-z_$][\w$]*=(?:[A-Za-z_$][\w$-]*|"[^"\[\];\r\n]+"|'[^'\[\];\r\n]+'))\]/.exec(rest);
        const segment = field?.[0] || selector?.[0];
        if (!segment) return null;
        segments.push(segment); rest = rest.slice(segment.length);
    }
    return segments;
}

export function compileSourceContexts({ contexts = [], entities, sourceRecords = [] } = {}) {
    const compiled = [], issues = [];
    if (!Array.isArray(contexts)) return { contexts: [], issues: ['Source contexts must be an array.'] };
    if (!Array.isArray(sourceRecords)) return { contexts: [], issues: ['Authorized source records must be an array.'] };
    const counts = new Map();
    for (const context of contexts) counts.set(context?.id, (counts.get(context?.id) || 0) + 1);
    const records = new Map();
    for (const record of sourceRecords) {
        if (!records.has(record.id)) records.set(record.id, record);
        else records.set(record.id, null); // Ambiguous parents are withheld.
    }
    for (const context of contexts) {
        const id = context?.id;
        const fail = reason => issues.push(`${nonempty(id) ? id : '(source context)'}: ${reason}`);
        if (!nonempty(id) || counts.get(id) !== 1) { fail('invalid or duplicate source context ID.'); continue; }
        const entity = entities?.get?.(context.entityId), parent = records.get(context.sourceRecordId);
        if (!entity) { fail('unknown source context entity.'); continue; }
        if (!parent || parent.conflict || parent.source?.review === 'external-research'
            || parent.source?.review === 'conflicting') { fail('missing, ambiguous, external or conflicting parent source.'); continue; }
        if (!nonempty(parent.source?.file) || !structuralLocator(parent.source?.locator)) {
            fail('parent requires one exact structural container locator.'); continue;
        }
        if (!nonempty(context.label) || context.label !== context.label.trim() || !descriptive(context.label)
            || ![parent.title, parent.text].some(value => typeof value === 'string' && value.includes(context.label))
            || ![entity.name, ...(entity.aliases || [])].some(name => phrase(name, context.label) || phrase(context.label, name))) {
            fail('label requires a literal descriptive parent mention related to its entity.'); continue;
        }
        compiled.push({ id, entityId: context.entityId, sourceRecordId: context.sourceRecordId,
            label: context.label, source: copy(parent.source) });
    }
    return { contexts: compiled, issues };
}

export function factSourceContexts({ fact, contexts = [] } = {}) {
    if (!fact || fact.conflict || ['external-research', 'conflicting'].includes(fact.source?.review) || !Array.isArray(contexts)
        || !nonempty(fact.source?.file) || !nonempty(fact.source?.locator)) return [];
    // Compound locators use the guide's explicit semicolon separator. Every
    // complete claim must remain within the same parent scope.
    const parts = fact.source.locator.split(';').map(part => structuralLocator(part.trim()));
    if (!parts.length || parts.some(part => !part)) return [];
    return contexts.filter(context => {
        if (context.source?.file !== fact.source.file) return false;
        const parent = structuralLocator(context.source?.locator);
        return parent && parts.every(part => part.length >= parent.length
            && parent.every((segment, index) => part[index] === segment));
    });
}
