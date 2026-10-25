import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { buildKnowledge, attachKnowledgeEmbeddings, createKnowledgeRouter } from '../../js/assistant/knowledge.js';
import { createAssistant } from '../../js/assistant/engine.js';
import { createConversationAssistant } from '../../js/assistant/dialogue.js';

const read = relative => JSON.parse(fs.readFileSync(new URL(relative, import.meta.url)));
const sources = { ...allRecords, starcraft: read('./evidence/conversation-starcraft-source-records.json') };
const build = game => buildKnowledge(game, sources[game], read(`../../data/assistant/knowledge/${game}.json`));

test('Method requests preserve a cited objective gap when no encoder is available', () => {
    const reply = createKnowledgeRouter(build('alqadim')).plan('How do I pass the New Dungeon pressure plates?');
    assert.equal(reply?.decision, 'decline');
    assert.equal(reply.knowledge.limited, true);
    assert.deepEqual(reply.knowledge.factIds, ['ch13_2']);
    assert.match(reply.text, /does not describe the requested procedure/);
    assert.equal(reply.sources[0].locator, 'DB.chapters[12].required[id=ch13_2]');
});

test('A possession question is not blocked by the gerund in its request framing', () => {
    const reply = createKnowledgeRouter(build('ultima6')).plan('Whose permission does Ariana need before giving me the rune?');
    assert.equal(reply?.decision, 'answer');
    assert.deepEqual(reply.knowledge.factIds, ['ariana-consent']);
    assert.match(reply.text, /mother Anya/);
    assert.equal(reply.knowledge.focusEntityId, 'ultima6:atlas:marker:Anya');
});

test('Graph evidence respects explicit locations and never supplies an unproved person', () => {
    const u5 = createKnowledgeRouter(build('ultima5'));
    const giver = u5.plan('Who gives me the Grapple?');
    assert.equal(giver?.decision, 'answer');
    assert.match(giver.text, /Lord Michael/);
    assert.notEqual(u5.plan('Who gives me the Grapple on Mars?')?.decision, 'answer');
    const u6 = createKnowledgeRouter(build('ultima6'));
    const teacher = u6.plan('Who teaches Gargish?');
    assert.ok(!teacher?.text.startsWith('Captain Johne:'), 'An inanimate teaching source must not turn its giver into a teacher');
});

test('Location answers keep the item available for an acquisition follow-up', () => {
    const router = createKnowledgeRouter(build('alqadim'));
    const place = router.plan('Where can I find Purple Berries?');
    assert.equal(place?.decision, 'answer');
    assert.match(place.text, /Western Desert Oasis/);
    const followup = router.plan('How do I get them?');
    assert.equal(followup?.decision, 'answer');
    assert.deepEqual(followup.knowledge.factIds, ['ch3_3']);
    assert.match(followup.text, /Collect.*oasis bushes/);
});

test('Reordered compound subjects stay distinct from a shared shorter name', () => {
    const router = createKnowledgeRouter(build('ultima6'));
    const rune = router.plan('Where is the Spirituality rune?');
    assert.equal(rune?.decision, 'answer');
    assert.deepEqual(rune.knowledge.factIds, ['spirituality-rune']);
    assert.match(rune.text, /hope chest/);
    const shrine = router.plan('Where is the Shrine of Spirituality?');
    assert.equal(shrine?.decision, 'answer');
    assert.deepEqual(shrine.knowledge.factIds, ['spirituality-orb']);
});

test('Explicit relationship words distinguish software releases, requirements and character release', () => {
    for (const [game, question, id] of [
        ['starcraft', 'Which Java release does SCHNAIL recommend?', 'starcraft:knowledge:schnail-java'],
        ['starcraft', 'Does SCHNAIL need a separate Brood War installation?', 'starcraft:knowledge:schnail-own-game'],
        ['ultima7', 'How do I release Weston?', 'weston-appeal'],
        ['albion', 'What are Drirr combat strengths?', 'drirr-combat']
    ]) {
        const reply = createKnowledgeRouter(build(game)).plan(question);
        assert.equal(reply?.decision, 'answer', question);
        assert.ok(reply.knowledge.factIds.includes(id), question);
    }
});

test('An unknown named subject near a known place cannot inherit an old person', () => {
    const router = createKnowledgeRouter(build('albion'));
    const previous = router.plan('Who can I get the Dreamshield from?');
    assert.equal(previous?.decision, 'answer');
    // An available semantic proposal must not erase the unknown name. This
    // fixture vector exercises that guard, not native model accuracy.
    const unknown = router.plan('Where is Glorvax in Jirinaar?', {}, { embedding: Array.from({length: 384}, (_, i) => i === 0 ? 1 : 0) });
    assert.notEqual(unknown?.decision, 'answer');
    assert.deepEqual(unknown?.knowledge.factIds, []);
    router.observe(unknown, {}, 'Where is Glorvax in Jirinaar?');
    assert.notEqual(router.plan('Where is he?')?.decision, 'answer');
});

test('Identity requests retain sourced lore instead of unrelated actions mentioning the person', () => {
    const knowledge = build('ultima7');
    for (const [question, sourceId] of [
        ['What is the Guardian?', 'ultima7:research:guardian-identity:explanation'],
        ['Who is Lord British?', 'ultima7:narrative:lord-british-identity:identity'],
        ['What is a timelord?', 'ultima7:research:time-lord-identity:explanation']
    ]) {
        const assistant = createConversationAssistant({ gameId: 'ultima7', knowledge, records: knowledge.records,
            assistant: createAssistant({ gameId: 'ultima7', records: knowledge.sourceRecords, fallback: null }) });
        // Check both a cold request and a request following an unrelated reward.
        for (const followup of [false, true]) {
            if (followup) assistant.answer('What is the Forge of Virtue stat reward?');
            const reply = assistant.answer(question);
            assert.equal(reply.decision, 'answer', question);
            assert.ok(reply.recordIds.includes(sourceId), question);
            assert.ok(!reply.recordIds.includes('ultima7:knowledge:forge-reward-caveat'), question);
        }
        assistant.destroy();
    }
});

test('Typed documentation and explicit edition conflicts use their reviewed facet with real cached MiniLM vectors', () => {
    const knowledge = attachKnowledgeEmbeddings(build('starcraft'), read('../../data/assistant/knowledge/starcraft-embeddings.json'), read('../../local-assistant/intent/profile.json'));
    const vectors = read('./fixtures/starcraft-query-vectors.json').vectors;
    for (const [question, id] of [
        ['Where is UAlbertaBot configuration documented?', 'starcraft:knowledge:ualberta-docs'],
        ['Does BWAILauncher support StarCraft Remastered?', 'starcraft:knowledge:bwai-conflict']
    ]) {
        assert.ok(Array.isArray(vectors[question]), 'Exact input must exist in the real encoder cache');
        const reply = createKnowledgeRouter(knowledge).plan(question, {}, { embedding: vectors[question] });
        assert.equal(reply?.decision, 'answer', question);
        assert.ok(reply.knowledge.factIds.includes(id), question);
        if (id.endsWith('conflict')) assert.match(reply.text, /cannot confirm/);
    }
});
