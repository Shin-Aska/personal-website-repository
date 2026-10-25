import { createAssistant } from './engine.js';
import { createConversationAssistant } from './dialogue.js';
import { augmentSourceRecords } from './source-responses.js';
import { intentRuntime } from './intent-runtime.js';
import { buildKnowledge, attachKnowledgeEmbeddings } from './knowledge.js';

let catalogPromise;
function consultationCatalog() {
    return catalogPromise ||= fetch(new URL('../../data/assistant/consultation-catalog.json', import.meta.url), { redirect: 'error' })
        .then(response => {
            if (!response.ok) throw new Error('The local conversation sources could not be loaded.');
            return response.json();
        }).catch(error => { catalogPromise = null; throw error; });
}
const knowledgePromises = new Map();
function knowledgeCatalog(gameId) {
    if (!['albion', 'ultima5', 'ultima6', 'ultima7', 'alqadim', 'starcraft'].includes(gameId)) throw new Error('Unsupported guide knowledge.');
    if (!knowledgePromises.has(gameId)) knowledgePromises.set(gameId,
        Promise.all(['', '-embeddings'].map(suffix => fetch(new URL(`../../data/assistant/knowledge/${gameId}${suffix}.json`, import.meta.url), { redirect: 'error' })
            .then(response => { if (!response.ok) throw new Error('The local knowledge sources could not be loaded.'); return response.json(); })))
            .catch(error => { knowledgePromises.delete(gameId); throw error; }));
    return knowledgePromises.get(gameId);
}

// The six adapters supply their own records and saved-progress reader. Model
// labels propose an intent; the same source engine still authorizes each fact.
export async function createGuideAssistant(options, { root = typeof document === 'undefined' ? null : document } = {}) {
    const sources = augmentSourceRecords(options.records, root);
    const [catalog, profile, [manifest, embeddings]] = await Promise.all([consultationCatalog(), intentRuntime.profile(), knowledgeCatalog(options.gameId)]);
    const knowledge = attachKnowledgeEmbeddings(buildKnowledge(options.gameId, sources, manifest), embeddings, profile);
    if (knowledge.issues.length) throw new Error(`The ${options.gameId} knowledge sources need review: ${knowledge.issues.join('; ')}`);
    const records = knowledge.records;
    const assistant = createAssistant({ ...options, records: knowledge.sourceRecords });
    return createConversationAssistant({ assistant, records, gameId: options.gameId,
        classify: (text, context) => intentRuntime.classify(text, context),
        encode: (text, context) => intentRuntime.encode(text, context), catalog, thresholds: profile.thresholds, knowledge });
}
