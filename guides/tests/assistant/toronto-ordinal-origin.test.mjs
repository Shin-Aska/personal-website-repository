import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge, attachKnowledgeEmbeddings} from '../../js/assistant/knowledge.js';
import {predictIntentHead} from '../../js/assistant/intent-head.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
function fixture(edit = () => {}, cached = false) {
    const manifest = read('../../data/assistant/knowledge/albion.json'); edit(manifest);
    const profile=read('../../local-assistant/intent/profile.json');
    let knowledge = buildKnowledge('albion', allRecords.albion, manifest);
    const inputs=read('./fixtures/toronto-ordinal-query-vectors.json');
    for(const key of ['modelId','revision','dimensions','dtype','maxTokens'])assert.equal(inputs.metadata[key],profile[key]);
    const missing=new Set();
    const vector=text=>{if(!inputs.vectors[text]){missing.add(text);throw Error('Missing exact input: '+text);}return inputs.vectors[text];};
    if(cached)knowledge=attachKnowledgeEmbeddings(knowledge,read('../../data/assistant/knowledge/albion-embeddings.json'),profile);
    assert.deepEqual(knowledge.issues, []);
    const assistant = createConversationAssistant({gameId: 'albion', records: knowledge.records, knowledge,
        assistant: createAssistant({gameId: 'albion', records: knowledge.sourceRecords, fallback: null}),
        thresholds:profile.thresholds,
        classify: cached ? async text=>predictIntentHead(read('../../local-assistant/intent/head.json').head,vector(text)) : async () => [],
        encode: cached ? async text=>vector(text) : async () => { throw Error('Encoder explicitly unavailable'); }});
    return {knowledge, assistant, missing, ask: async q => {
        const reply = await assistant.answerAsync(q);
        assert.deepEqual(reply.actions, []); assert.deepEqual(reply.stateChanges, []);
        return reply;
    }};
}
const listQuestion = 'What are Toronto return codes in order?';
const originQuestion = 'Where does the first one come from?';

test('The complete original ordered Toronto conversation binds first-code origin to the reviewed list', async () => {
    const f = fixture(() => {}, true);
    try {
        const d = read('./knowledge/albion-cases.json').dialogues.find(d => d.id === 'toronto-return-codes');
        for (const turn of d.turns) {
            const reply = await f.ask(turn.text);
            assert.equal(reply.decision, 'answer', `${turn.text}: ${reply.text}`);
            for (const value of turn.expected.contains) assert.ok(reply.text.includes(value), reply.text);
            assert.ok(reply.sources.some(s => s.locator === turn.expected.source.locator));
            if (turn.text === originQuestion)
                assert.ok(reply.text.includes(f.knowledge.facts.find(f => f.id === 'codes').text), 'Whole code witness must remain intact');
        }
        assert.deepEqual([...f.missing],[], 'The complete ordered regression requires every exact native model input');
    } finally { f.assistant.destroy(); }
});

test('Origin ordinals reject ungrounded, out-of-range, modified and source-qualified siblings', async () => {
    for (const q of [
        'Where does the fourth one come from?',
        'Where does the zeroth one come from?',
        'Where does the first red one come from?',
        'Where does the first one come from in winter?',
        'Where does the first one come from in the 2026 remaster edition?'
    ]) {
        const f = fixture();
        try { await f.ask(listQuestion); assert.notEqual((await f.ask(q)).decision, 'answer', q); }
        finally { f.assistant.destroy(); }
    }
    for (const prior of [null, 'Where is Rifrako?']) {
        const f = fixture();
        try { if (prior) await f.ask(prior); assert.notEqual((await f.ask(originQuestion)).decision, 'answer', `Prior: ${prior}`); }
        finally { f.assistant.destroy(); }
    }
});

test('Missing or reordered reviewed members cannot be reconstructed from arbitrary text or entities', async () => {
    for (const members of [null, ['1712', '1001', '4312']]) {
        const f = fixture(manifest => {
            const field = manifest.facts.find(f => f.id === 'codes').sourceFields.find(f => f.key === 'sequence');
            if (members) field.members = members;
            else delete field.members;
        });
        try { await f.ask(listQuestion); assert.notEqual((await f.ask(originQuestion)).decision, 'answer'); }
        finally { f.assistant.destroy(); }
    }
});
