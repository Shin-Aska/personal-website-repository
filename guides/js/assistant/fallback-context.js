import {allowed, authorize, level} from './policy.js';
import {resolveEntities, normalize, isCommonWord} from './retrieval.js';
export const UNKNOWN_REPLY = "I don't have an answer for that in this guide.";

// A deliberately conservative experimental router, not general coreference.
// Names come only from authorized records; a typo is trusted only after the
// engine actually answered it. Generated model text never becomes topic state.
function topicFromIds(ids, visible) {
    const selected = visible.filter(r => ids?.includes(r.id));
    const entities = new Set(selected.map(r => r.entityId));
    return entities.size === 1 ? { entityId: selected[0].entityId,
        label: selected[0].title, recordIds: selected.map(r => r.id) } : null;
}

function topicRequest(question, previous, visible) {
    if (/\b(?:weather|rain|raining|snow|snowing|sunny|cloudy|temperature)\b/i.test(question))
        return { topic: null, reason: 'connection-unclear' };
    const hits = resolveEntities(question, visible).filter(h => h.match === 'exact');
    if (hits.length > 1) return { topic: null, reason: 'ambiguous-subject' };
    const named = hits.length === 1 ? hits[0] : null;
    const family = named ? visible.filter(r => r.entityId === named.id) : [];
    const proposed = named ? (previous?.entityId === named.id ? previous
        : topicFromIds(family.filter(r => r.relation === 'explanation').slice(0, 1).map(r => r.id), visible)
            || topicFromIds(family.slice(0, 1).map(r => r.id), visible)) : previous;
    if (!proposed) return { topic: null, reason: 'no-visible-topic' };

    const source = visible.filter(r => proposed.recordIds.includes(r.id));
    const knownWords = normalize(source.map(r => [r.title, ...r.aliases, r.text].join(' ')).join(' ')).split(' ');
    // A fresh proper name or edition/place qualifier cannot silently inherit
    // the old subject just because the sentence also contains "it" or "her".
    const capitals = [...String(question).matchAll(/\b[A-Z][A-Za-z'-]*\b/g)];
    const unknownName = capitals.some(m => m.index > 0 && !/^I(?:'(?:m|d|ll|ve))?$/.test(m[0]) && !isCommonWord(normalize(m[0]))
        && !knownWords.includes(normalize(m[0])));
    const q = normalize(question);
    const subjectSlot = q.match(/^(?:(?:(?:why|how|where|when|what) )?(?:is|are|was|were|does|do|did|can|could|will|would|should|has|have)|who is|what about) ([a-z]+)/)?.[1];
    const referent = /^(?:he|she|it|they|him|her|his|its|their|that|this|those|these|there|the|you|i|we)$/;
    const newSubject = subjectSlot && !referent.test(subjectSlot)
        && !family.some(r => [r.title, ...r.aliases].some(a => normalize(a).split(' ').includes(subjectSlot)));
    if (unknownName || newSubject) return { topic: null, reason: 'unresolved-new-subject-or-qualifier' };
    const followUp = /\b(?:he|she|it|they|him|her|his|its|their|that|this|those|these)\b/.test(q)
        || /^(?:why|how so|what do you mean)$/.test(q);
    return named || followUp ? { topic: proposed, reason: named ? 'named-subject' : 'last-topic-follow-up' }
        : { topic: null, reason: 'connection-unclear' };
}

export function buildTopicPacket({ gameId, records, history, question, spoiler, baseline }) {
    const ceiling = level(spoiler);
    const empty = { ceiling, question, style: 'topic', currentTopic: null, conversation: [], excerpts: [], messages: [] };
    if (baseline?.decision === 'answer') return { ...empty, route: 'engine', topicReason: 'engine-already-answered', reply: baseline.text };
    const visible = records.map(r => authorize(r, ceiling)).filter(r => r && !r.conflict && r.source?.review);
    let previous = null, exchange = [], pending = null;
    for (const m of history) {
        if (m.decision === 'hidden' || !allowed(m.level || 'gentle', ceiling)) {
            previous = null; exchange = []; pending = null; continue;
        }
        if (m.role === 'user') { pending = m; continue; }
        if (m.role !== 'assistant') continue;
        const answered = m.decision === 'answer' ? topicFromIds(m.recordIds, visible)
            : topicFromIds(m.fallbackRecordIds, visible);
        const request = pending ? topicRequest(pending.text, previous, visible) : { topic: null };
        previous = answered || request.topic;
        exchange = previous && pending ? [pending, m] : [];
        pending = null;
    }
    const { topic, reason } = topicRequest(question, previous, visible);
    if (!topic) return { ...empty, route: 'unknown', topicReason: reason, reply: UNKNOWN_REPLY };
    // Keep only the active exchange, and drop even that when a new named subject
    // replaces it. No unrelated older conversation enters the model prompt.
    const conversation = previous?.entityId === topic.entityId ? exchange : [];
    const excerpts = [];
    let chars = 0;
    for (const id of topic.recordIds) {
        const r = visible.find(r => r.id === id);
        if (!r || excerpts.length >= 3 || chars + r.text.length > 2400) continue;
        excerpts.push({id: `G${excerpts.length+1}`, recordId:r.id, title:r.title, text:r.text,
            origin:r.source.review === 'external-research' ? 'Outside research (not in this guide)' : 'Existing guide', source:r.source});
        chars += r.text.length;
    }
    if (!excerpts.length) return {...empty, route:'unknown', topicReason:'no-authorized-excerpt', reply:UNKNOWN_REPLY};
    return {ceiling, question, conversation, excerpts, style:'topic', route:'model', currentTopic:topic.label, topicReason:reason, messages:[]};
}
