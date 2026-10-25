import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createAssistant } from '../../js/assistant/engine.js';
import { createConversationAssistant } from '../../js/assistant/dialogue.js';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { sourceQuestionParts, MAX_PARTS } from '../../js/assistant/language.js';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const records = read('./evidence/conversation-starcraft-source-records.json');
const knowledge = buildKnowledge('starcraft', records, read('../../data/assistant/knowledge/starcraft.json'));
const tick = () => new Promise(resolve => setImmediate(resolve));
function fixture(encode) {
    const source = createAssistant({ gameId: 'starcraft', records, fallback: null });
    const assistant = createConversationAssistant({ gameId: 'starcraft', records, knowledge, assistant: source,
        // An unavailable classifier and encoder cannot fabricate retrieval scores.
        classify: async () => [], encode });
    return { source, assistant };
}
const noEffects = reply => {
    assert.deepEqual(reply.actions, []);
    assert.deepEqual(reply.choices, []);
    assert.deepEqual(reply.stateChanges, []);
};

test('source decomposition carries context and counts questions independently of the preamble', () => {
    const parts = sourceQuestionParts('For BWAPI, what is it, where can I download it, and where is its documentation?');
    assert.equal(parts.questions.length, MAX_PARTS);
    assert.equal(parts.tooMany, false);
    assert.ok(parts.questions.every(part => part.text.startsWith('for bwapi; ')));
    assert.deepEqual(sourceQuestionParts('Whose song should I learn, and whose rune is awarded?').questions
        .map(part => part.question), ['whose song should i learn', 'whose rune is awarded']);
    for (const text of [
        'I have BWAPI; where do I go and what do I do?',
        'If I have BWAPI, where do I go and what do I do?',
        'Has my party already won and where do I go?',
        'What now and where do I start?'
    ]) assert.equal(sourceQuestionParts(text), null, text);
});

test('complete compound lookup preserves every source witness, resource link and part proof', async () => {
    const queries = [];
    const { assistant, source } = fixture(async text => { queries.push(text); throw new Error('Encoder unavailable offline'); });
    const reply = await assistant.answerAsync('What is BWAPI, where can I download it, and where is its documentation?');
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.knowledge.parts.map(part => part.question), [
        'what is bwapi', 'where can i download it', 'where is its documentation'
    ]);
    assert.deepEqual(reply.knowledge.factIds, [
        'starcraft:knowledge:bwapi-identity', 'starcraft:knowledge:bwapi-releases', 'starcraft:knowledge:bwapi-docs'
    ]);
    for (const id of reply.knowledge.factIds) {
        const fact = knowledge.facts.find(candidate => candidate.id === id);
        assert.ok(reply.text.includes(fact.text.replace(/^Outside research:\s*/i, '')), id);
        assert.ok(reply.recordIds.includes(fact.recordId));
        assert.ok(reply.sources.some(source => source.locator === fact.source.locator));
        assert.ok(reply.knowledge.evidence.some(proof => proof.factId === id && proof.sourceRecordId === fact.sourceRecordId));
        for (const resource of fact.resources) assert.ok(reply.sourceLinks.some(link => link.url === resource.url));
    }
    assert.equal(queries.length, MAX_PARTS);
    assert.equal(queries[0], 'what is bwapi');
    assert.match(queries[1], /^where can i download it\nSubject: BWAPI$/);
    assert.match(queries[2], /^where is its documentation\nSubject: BWAPI$/);
    noEffects(reply);
    assert.equal(source.inspect().claimCount, 0);
    assistant.destroy();
});

test('an unanswered second clause cannot turn the successful first lookup into a full answer', async () => {
    const { assistant } = fixture();
    const reply = await assistant.answerAsync('What is BWAPI and who feeds it bananas?');
    assert.equal(reply.decision, 'decline');
    assert.match(reply.text, /Unanswered: “who feeds it bananas”/);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    assert.equal(reply.knowledge, undefined);
    assert.equal(assistant.inspect().conversation.knowledge.focus, null);
    noEffects(reply);
    assistant.destroy();
});

test('shared source, edition, unknown named context and material restrictions survive decomposition', async () => {
    for (const text of [
        'According to the guide, what is BWAPI and where can I download it?',
        'What is BWAPI and where can I download it? Use only the guide.',
        'In patch 9.99; what is BWAPI and where can I download it?',
        'For Quantum Turnip, what is BWAPI and where can I download it?',
        'For Mars, what is BWAPI and where can I download it?',
        'What is BWAPI and where can I download it on Mars?'
    ]) {
        const { assistant, source } = fixture();
        const reply = await assistant.answerAsync(text);
        assert.notEqual(reply.decision, 'answer', text);
        assert.deepEqual(reply.recordIds, [], text);
        assert.deepEqual(reply.sources, [], text);
        assert.equal(source.inspect().claimCount, 0);
        noEffects(reply);
        assistant.destroy();
    }
    const { assistant } = fixture();
    const reply = await assistant.answerAsync('For BWAPI, what is it and where can I download it?');
    assert.equal(reply.decision, 'answer', reply.text);
    assert.equal(reply.knowledge.parts.length, 2);
    assistant.destroy();
});

test('too many factual questions are explicitly bounded without dropping the last request', async () => {
    let encodings = 0;
    const { assistant } = fixture(async () => { encodings++; throw new Error('Offline'); });
    const reply = await assistant.answerAsync('What is BWAPI, where can I download it, where is its documentation, and who created it?');
    assert.equal(reply.decision, 'clarify');
    assert.match(reply.text, /at most 3 source questions/);
    assert.equal(encodings, 0);
    assert.deepEqual(reply.recordIds, []);
    noEffects(reply);
    assistant.destroy();
});

for (const transition of ['abort', 'context change', 'new question']) test(`${transition} cancels a partially grounded compound and ignores late encoding`, async () => {
    let release;
    const waiting = new Promise(resolve => { release = resolve; });
    const { assistant, source } = fixture(async text => {
        if (/^where can i download it/.test(text)) return waiting;
        throw new Error('Encoder unavailable offline');
    });
    const controller = new AbortController();
    const pending = assistant.answerAsync('What is BWAPI and where can I download it?', { signal: controller.signal });
    await tick();
    assert.equal(assistant.inspect().conversation.knowledge.focus, 'starcraft:bwapi');
    if (transition === 'abort') controller.abort();
    else if (transition === 'context change') assistant.activate('another-context');
    else {
        const newer = await assistant.answerAsync('What is Steamhammer?');
        assert.equal(newer.decision, 'answer', newer.text);
    }
    const expected = transition === 'new question' ? 'starcraft:steamhammer' : null;
    assert.equal((await pending).decision, 'stale');
    assert.equal(assistant.inspect().conversation.knowledge.focus, expected);
    release(); await tick();
    assert.equal(assistant.inspect().conversation.knowledge.focus, expected);
    assert.equal(source.inspect().claimCount, 0);
    assert.ok(assistant.getHistory().every(reply => reply.role !== 'assistant' || reply.decision !== 'pending'));
    assistant.destroy();
});
