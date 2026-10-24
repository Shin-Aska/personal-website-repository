// Authored topics index existing guide facts; they never add prose.
//
// An overlay topic names a subject ("Charm and possession"), the words people
// use for it, which relationships it answers, and keys into a map of facts the
// adapter extracted from the guide. The answer is those facts verbatim, joined
// in order, with every locator kept in its source. A topic whose keys do not
// all resolve is dropped, and missingTopicFacts reports it for the tests.

export function factMap(entries) {
    const facts = new Map();
    for (const [key, text, source, extra = {}] of entries) {
        const value = String(text ?? '').replace(/<[^>]*>/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
        if (value) facts.set(key, { text: value, source, ...extra });
    }
    return facts;
}

export function missingTopicFacts(topics = [], facts) {
    return topics.flatMap(topic => (topic.from || []).filter(key => !facts.has(key)).map(key => `${topic.id}: ${key}`));
}

export function buildTopicRecords(gameId, topics = [], facts) {
    return topics.flatMap(topic => {
        const parts = (topic.from || []).map(key => facts.get(key));
        if (!parts.length || parts.some(part => !part)) return [];
        // A topic may add a relationship to an existing subject instead of
        // creating a second subject with the same name.
        const entityId = topic.entityId || `${gameId}:topic:${topic.id}`;
        const relation = topic.relation || 'hint';
        const level = topic.minSpoiler || 'gentle';
        const files = [...new Set(parts.map(part => part.source.file))];
        return [{
            id: `${gameId}:topic:${topic.id}:${relation}`, entityId, title: topic.title,
            aliases: [...(topic.aliases || [])], kind: topic.kind || 'topic', relation,
            answers: [...(topic.answers || [])], scope: topic.scope || 'reference',
            ...(topic.identity === false ? { identity: false } : {}),
            acquisitionMethods: [...(topic.acquisitionMethods || [])],
            minSpoiler: level, requires: null, editions: topic.editions || [],
            conflict: Boolean(topic.conflict || parts.some(part => part.conflict)),
            variants: { [level]: { text: parts.map(part => part.text).join('\n') } },
            source: {
                file: files.join(', '),
                locator: parts.map(part => part.source.locator).join('; '),
                review: 'extracted',
                index: { file: topic.overlayFile, locator: `topics[id=${topic.id}]`, review: 'authored-index' },
                ...(topic.references ? { references: topic.references } : {})
            }
        }];
    });
}

const STORY_ROLES = new Set(['perpetrator', 'suspect', 'victim', 'leader', 'member']);
const STORY_LEVELS = ['gentle', 'balanced', 'direct'];
const nonemptyString = value => typeof value === 'string' && value.trim().length > 0;
const normalizedStoryText = text => text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

function mentionsStoryPhrase(text, phrase) {
    const escaped = normalizedStoryText(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, 'u').test(normalizedStoryText(text));
}

// Used again at the authorization boundary: adapters cannot bypass grounding by
// constructing a story record without this builder. Names describe only the
// stated role; neither the builder nor the engine may infer an inverse role.
export function validStoryMetadata(story, text) {
    if (!story || !STORY_ROLES.has(story.role) || !nonemptyString(text)) return false;
    if (!['people', 'context'].every(key => Array.isArray(story[key]) && story[key].length <= 64
        && story[key].every(name => nonemptyString(name) && name.length <= 256 && mentionsStoryPhrase(text, name)))) return false;
    return story.qualifier === undefined || (nonemptyString(story.qualifier)
        && story.qualifier.length <= 512 && mentionsStoryPhrase(text, story.qualifier));
}

function storyDefinitionIssues(definition, facts) {
    const issues = [];
    if (!definition || typeof definition !== 'object') return ['invalid definition'];
    if (!nonemptyString(definition.id) || !nonemptyString(definition.title)
        || !nonemptyString(definition.overlayFile)) issues.push('id, title and overlayFile are required');
    if (definition.entityId !== undefined && !nonemptyString(definition.entityId)) issues.push('invalid entityId');
    if (!STORY_LEVELS.includes(definition.minSpoiler)) issues.push('explicit spoiler level required');
    if (definition.variants !== undefined) issues.push('story definitions cannot have alternate variants');
    if (definition.aliases !== undefined && (!Array.isArray(definition.aliases)
        || definition.aliases.length > 128 || definition.aliases.some(alias => !nonemptyString(alias)))) issues.push('invalid aliases');
    if (!Array.isArray(definition.from) || !definition.from.length || definition.from.length > 64
        || definition.from.some(key => !nonemptyString(key))) return [...issues, 'nonempty from keys required'];
    const parts = definition.from.map(key => facts?.get(key));
    definition.from.forEach((key, index) => { if (!parts[index]) issues.push(`missing fact: ${key}`); });
    if (parts.some(part => !part)) return issues;
    if (parts.some(part => !nonemptyString(part.text) || !nonemptyString(part.source?.file)
        || !nonemptyString(part.source?.locator))) issues.push('every fact needs text, source file and locator');
    if (parts.some(part => part.source?.review !== undefined
        && !['extracted', 'authored-from-guide', 'external-research'].includes(part.source.review)))
        issues.push('unrecognized source provenance');
    if (parts.some(part => part.minSpoiler !== undefined && (!STORY_LEVELS.includes(part.minSpoiler)
        || STORY_LEVELS.indexOf(part.minSpoiler) > STORY_LEVELS.indexOf(definition.minSpoiler)))) issues.push('fact exceeds role spoiler level');
    const research = parts.filter(part => part.source?.review === 'external-research');
    if (research.length && research.length !== parts.length) issues.push('guide and research facts cannot be mixed');
    if (research.some(part => !Array.isArray(part.source.references) || !part.source.references.length
        || part.source.references.some(reference => !nonemptyString(reference?.label)
            || !/^https?:\/\//i.test(reference?.url || '')))) issues.push('research facts need labeled citations');
    const text = parts.map(part => part.text).join('\n');
    if (!validStoryMetadata(definition.story, text)) issues.push('invalid or ungrounded story metadata');
    else if ([...definition.story.people, ...definition.story.context, ...(definition.story.qualifier ? [definition.story.qualifier] : [])]
        .some(phrase => !parts.some(part => nonemptyString(part.text) && mentionsStoryPhrase(part.text, phrase))))
        issues.push('a story phrase cannot span source facts');
    return issues;
}

// Diagnostics are deterministic, so fixture invariants can reject a silently
// dropped overlay definition as well as a missing source key.
export function storyRecordIssues(definitions = [], facts) {
    return definitions.flatMap(definition => storyDefinitionIssues(definition, facts)
        .map(issue => `${definition?.id || '(unnamed story)'}: ${issue}`));
}

// Each definition is one role at one spoiler ceiling, attached to the existing
// subject when entityId is supplied. Sentence facts may be extracted by the
// adapter, but their text is never rewritten here.
export function buildStoryRecords(gameId, definitions = [], facts) {
    return definitions.flatMap(definition => {
        if (storyDefinitionIssues(definition, facts).length) return [];
        const parts = definition.from.map(key => facts.get(key));
        const level = definition.minSpoiler;
        const research = parts[0].source.review === 'external-research';
        const references = research ? [...new Map(parts.flatMap(part => part.source.references)
            .map(reference => [`${reference.url}\n${reference.label}`, { ...reference }])).values()] : undefined;
        return [{
            id: `${gameId}:story:${definition.id}:${definition.story.role}`,
            entityId: definition.entityId || `${gameId}:story:${definition.id}`,
            title: definition.title, aliases: [...(definition.aliases || [])],
            kind: definition.kind || 'topic', relation: 'story', scope: 'reference',
            story: { role: definition.story.role, people: [...definition.story.people],
                context: [...definition.story.context],
                ...(definition.story.qualifier === undefined ? {} : { qualifier: definition.story.qualifier }) },
            minSpoiler: level, requires: null, editions: [...(definition.editions || [])],
            conflict: Boolean(definition.conflict || parts.some(part => part.conflict)),
            variants: { [level]: { text: parts.map(part => part.text).join('\n') } },
            source: {
                file: [...new Set(parts.map(part => part.source.file))].join(', '),
                locator: parts.map(part => part.source.locator).join('; '),
                review: research ? 'external-research' : 'extracted',
                index: { file: definition.overlayFile, locator: `stories[id=${definition.id}]`, review: 'authored-index' },
                ...(research ? { references } : {})
            }
        }];
    });
}

// Broader narrative questions use the same sourced-fact envelope as story
// roles. An aspect describes what the author checked; names that merely occur
// together never establish a cause, a chronology or a directed relationship.
const NARRATIVE_ASPECTS = new Set(['identity', 'event', 'cause', 'method', 'outcome', 'sequence', 'relationship', 'purpose', 'summary']);
const NARRATIVE_PREDICATE_ASPECTS = new Set(['cause', 'method', 'outcome', 'sequence', 'relationship']);
const NARRATIVE_TEMPORAL = /\b(?:before|after|then|next|subsequently|later|earlier|following|followed by|preceded|finally|first|second|third)\b/i;
const NARRATIVE_HEDGE = /\b(?:likely|apparently|perhaps|presumably|possibly|may|might|seems?|appears?|believed|reportedly)\b/i;
const validReferences = references => Array.isArray(references) && references.length > 0
    && references.every(reference => nonemptyString(reference?.label) && /^https?:\/\//i.test(reference?.url || ''));
const narrativePhrases = narrative => [...narrative.subjects, ...narrative.context,
    ...(narrative.predicate === undefined ? [] : [narrative.predicate])];
const referenceKey = reference => `${reference.url}\n${reference.label}`;
const copyReferences = references => references.map(reference => ({ label: reference.label, url: reference.url,
    ...(typeof reference.checkedAt === 'string' ? { checkedAt: reference.checkedAt } : {}) }));
const unionReferences = parts => [...new Map(parts.flatMap(part => part.source.references)
    .map(reference => [referenceKey(reference), reference])).values()];

export function validNarrativeMetadata(narrative, text) {
    if (!narrative || typeof narrative !== 'object' || Array.isArray(narrative)
        || !NARRATIVE_ASPECTS.has(narrative.aspect) || !nonemptyString(text)) return false;
    if (!['subjects', 'context'].every(key => Array.isArray(narrative[key]) && narrative[key].length <= 64
        && narrative[key].every(name => nonemptyString(name) && name.length <= 256 && mentionsStoryPhrase(text, name)))
        || !narrative.subjects.length) return false;
    if ((NARRATIVE_PREDICATE_ASPECTS.has(narrative.aspect) && narrative.predicate === undefined)
        || (narrative.predicate !== undefined && (!nonemptyString(narrative.predicate)
            || narrative.predicate.length > 512 || !mentionsStoryPhrase(text, narrative.predicate)))) return false;
    if (narrative.status !== undefined && !['recorded', 'hedged', 'disputed'].includes(narrative.status)) return false;
    if (narrative.status === 'hedged' && !NARRATIVE_HEDGE.test(text)) return false;
    return narrative.aspect === 'sequence'
        ? ['steps', 'events'].includes(narrative.sequenceMode) && NARRATIVE_TEMPORAL.test(text)
        : narrative.sequenceMode === undefined;
}

// Retain the exact source of each claim. The authorization boundary checks this
// too, so a hand-built record cannot replace a citation or hide an unsourced
// assertion in the combined text. Source semantics still need authored review.
export function validNarrativeSource(narrative, text, source) {
    if (!validNarrativeMetadata(narrative, text) || !source || !Array.isArray(source.claims)
        || !source.claims.length || source.claims.length > 4) return false;
    const claims = source.claims;
    if (claims.some(claim => !nonemptyString(claim?.text) || !nonemptyString(claim.source?.file)
        || !nonemptyString(claim.source?.locator) || !['extracted', 'external-research'].includes(claim.source.review))) return false;
    if (text !== claims.map(claim => claim.text).join('\n')
        || claims.some(claim => claim.source.review !== source.review)
        || source.file !== [...new Set(claims.map(claim => claim.source.file))].join(', ')
        || source.locator !== claims.map(claim => claim.source.locator).join('; ')
        || narrativePhrases(narrative).some(phrase => !claims.some(claim => mentionsStoryPhrase(claim.text, phrase)))) return false;
    const research = source.review === 'external-research';
    if (research) {
        if (!validReferences(source.references) || claims.some(claim => !validReferences(claim.source.references))) return false;
        const cited = unionReferences(claims).map(referenceKey);
        if (source.references.length !== cited.length || new Set(source.references.map(referenceKey)).size !== cited.length
            || source.references.some(reference => !cited.includes(referenceKey(reference)))) return false;
    } else if (source.references !== undefined || claims.some(claim => claim.source.references !== undefined)) return false;
    if (narrative.status === 'disputed' && (!research || claims.length < 2
        || new Set(claims.flatMap(claim => claim.source.references.map(reference => reference.url))).size < 2)) return false;
    return true;
}

function narrativeDefinitionIssues(definition, facts) {
    const issues = [];
    if (!definition || typeof definition !== 'object') return ['invalid definition'];
    if (!nonemptyString(definition.id) || !nonemptyString(definition.entityId) || !nonemptyString(definition.kind)
        || !nonemptyString(definition.title) || !nonemptyString(definition.overlayFile))
        issues.push('id, entityId, kind, title and overlayFile are required');
    if (!STORY_LEVELS.includes(definition.minSpoiler)) issues.push('explicit spoiler level required');
    if (definition.variants !== undefined) issues.push('narrative definitions cannot have alternate variants');
    if (definition.aliases !== undefined && (!Array.isArray(definition.aliases) || definition.aliases.length > 128
        || definition.aliases.some(alias => !nonemptyString(alias)))) issues.push('invalid aliases');
    if (definition.editions !== undefined && (!Array.isArray(definition.editions) || definition.editions.length > 64
        || definition.editions.some(edition => !nonemptyString(edition)))) issues.push('invalid editions');
    if (!Array.isArray(definition.from) || !definition.from.length || definition.from.length > 4
        || definition.from.some(key => !nonemptyString(key))) return [...issues, 'one to four from keys required'];
    const parts = definition.from.map(key => facts?.get(key));
    definition.from.forEach((key, index) => { if (!parts[index]) issues.push(`missing fact: ${key}`); });
    if (parts.some(part => !part)) return issues;
    if (parts.some(part => !nonemptyString(part.text) || !nonemptyString(part.source?.file)
        || !nonemptyString(part.source?.locator))) issues.push('every fact needs text, source file and locator');
    if (parts.some(part => part.source?.review !== undefined
        && !['extracted', 'authored-from-guide', 'external-research'].includes(part.source.review))) issues.push('unrecognized source provenance');
    if (parts.some(part => part.minSpoiler !== undefined && (!STORY_LEVELS.includes(part.minSpoiler)
        || STORY_LEVELS.indexOf(part.minSpoiler) > STORY_LEVELS.indexOf(definition.minSpoiler)))) issues.push('fact exceeds narrative spoiler level');
    const research = parts.filter(part => part.source?.review === 'external-research');
    if (research.length && research.length !== parts.length) issues.push('guide and research facts cannot be mixed');
    if (research.some(part => !validReferences(part.source.references))) issues.push('research facts need labeled citations');
    const text = parts.map(part => part.text).join('\n');
    if (!validNarrativeMetadata(definition.narrative, text)) issues.push('invalid or ungrounded narrative metadata');
    else if (narrativePhrases(definition.narrative).some(phrase => !parts.some(part => nonemptyString(part.text)
        && mentionsStoryPhrase(part.text, phrase)))) issues.push('a narrative phrase cannot span source facts');
    if (definition.narrative?.status === 'disputed' && (research.length !== parts.length || parts.length < 2
        || new Set(research.flatMap(part => Array.isArray(part.source.references) ? part.source.references.map(reference => reference.url) : [])).size < 2))
        issues.push('disputed narratives need separate claims with at least two cited URLs');
    return issues;
}

export function narrativeRecordIssues(definitions = [], facts) {
    return definitions.flatMap(definition => narrativeDefinitionIssues(definition, facts)
        .map(issue => `${definition?.id || '(unnamed narrative)'}: ${issue}`));
}

export function buildNarrativeRecords(gameId, definitions = [], facts) {
    return definitions.flatMap(definition => {
        if (narrativeDefinitionIssues(definition, facts).length) return [];
        const parts = definition.from.map(key => facts.get(key));
        const research = parts[0].source.review === 'external-research';
        const review = research ? 'external-research' : 'extracted';
        const level = definition.minSpoiler;
        return [{
            id: `${gameId}:narrative:${definition.id}:${definition.narrative.aspect}`,
            entityId: definition.entityId, title: definition.title, aliases: [...(definition.aliases || [])],
            kind: definition.kind, relation: 'narrative', scope: 'reference',
            narrative: { aspect: definition.narrative.aspect, subjects: [...definition.narrative.subjects],
                context: [...definition.narrative.context], status: definition.narrative.status || 'recorded',
                ...(definition.narrative.predicate === undefined ? {} : { predicate: definition.narrative.predicate }),
                ...(definition.narrative.sequenceMode === undefined ? {} : { sequenceMode: definition.narrative.sequenceMode }) },
            minSpoiler: level, requires: null, editions: [...(definition.editions || [])],
            conflict: Boolean(definition.conflict || parts.some(part => part.conflict)),
            variants: { [level]: { text: parts.map(part => part.text).join('\n') } },
            source: {
                file: [...new Set(parts.map(part => part.source.file))].join(', '),
                locator: parts.map(part => part.source.locator).join('; '), review,
                index: { file: definition.overlayFile, locator: `narratives[id=${definition.id}]`, review: 'authored-index' },
                claims: parts.map(part => ({ text: part.text, source: { file: part.source.file, locator: part.source.locator,
                    review, ...(research ? { references: copyReferences(part.source.references) } : {}) } })),
                ...(research ? { references: copyReferences(unionReferences(parts)) } : {})
            }
        }];
    });
}

// Researched facts come from outside the guide. They are authored summaries of
// cited pages, never mixed into guide text, and always labeled as research.
export function buildResearchRecords(gameId, research = [], overlayFile) {
    return research.filter(entry => entry.text && entry.sources?.length).map(entry => {
        const relation = entry.relation || 'explanation';
        const level = entry.minSpoiler || 'gentle';
        return {
            id: `${gameId}:research:${entry.id}:${relation}`, entityId: entry.entityId || `${gameId}:research:${entry.id}`,
            title: entry.title, aliases: [...(entry.aliases || [])], kind: 'research', relation,
            // What a subject is is separate from where its evidence came from.
            ...(['npc', 'character', 'place', 'organization'].includes(entry.subjectKind) ? { subjectKind: entry.subjectKind } : {}),
            answers: [...(entry.answers || [])], scope: 'reference', minSpoiler: level, requires: null,
            acquisitionMethods: [...(entry.acquisitionMethods || [])], editions: entry.editions || [], conflict: false,
            variants: { [level]: { text: entry.text } },
            source: {
                file: entry.sources[0].url, locator: entry.sources.map(s => s.label).join('; '),
                review: 'external-research', references: entry.sources,
                index: { file: overlayFile, locator: `research[id=${entry.id}]`, review: 'authored-index' }
            }
        };
    });
}
