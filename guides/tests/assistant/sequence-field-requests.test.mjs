import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { allRecords } from './load-records.mjs';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { parseSequenceFieldRequest as parse, supportsSequenceFieldRequest as supports } from '../../js/assistant/sequence-field-requests.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${name}`, import.meta.url)));
const manifest = read('ultima5.json');
const knowledge = buildKnowledge('ultima5', allRecords.ultima5, manifest);
const ritual = knowledge.facts.find(fact => fact.id === 'shrine-loop');
const reward = knowledge.facts.find(fact => fact.id === 'doom-word');
const options = fact => ({ fact, subjectEntityId: fact.entityId,
    scopeTexts: [fact.subject, ...(fact.topicLabels || [])] });
const question = 'For the shrine ritual, how many cycles do I meditate, and where do I go for guidance afterward?';
const completion = 'What does completing all eight shrine quests unlock?';
const changedText = (fact, text) => ({ ...fact, text, witness: text });

test('finite typed descriptors preserve the full scope, action, unit, purpose and suffix', () => {
    assert.deepEqual(parse(question), { kind: 'sequence-fields', scopeText: 'the shrine ritual', fields: [
        { kind: 'action-quantity', unit: 'cycle', actionText: 'meditate', exact: false },
        { kind: 'following-destination', purposeText: 'guidance' }
    ], originalText: question });
    assert.deepEqual(parse(completion), { kind: 'completion-reward', completionText: 'all eight shrine quests',
        suffixText: '', originalText: completion });
    const q = 'For the iron shrine ritual in the mobile edition, how many exactly hours do I use the copper lens according to the manual?';
    assert.deepEqual(parse(q), { kind: 'sequence-fields', scopeText: 'the iron shrine ritual in the mobile edition',
        fields: [{ kind: 'action-quantity', unit: 'hour', actionText: 'use the copper lens according to the manual', exact: true }], originalText: q });
    const suffix = parse('What does completing all eight shrine quests unlock in my current save?');
    assert.equal(suffix.completionText, 'all eight shrine quests');
    assert.equal(suffix.suffixText, ' in my current save');
    for (const q of ['', null, 'Meditate for three cycles.', 'How many cycles?', 'Where do I go afterward?',
        'For the shrine ritual, how many jars do I meditate?', 'For the shrine ritual, how many cycles do I meditate, and where do I go for guidance before?'])
        assert.equal(parse(q), null, String(q));
});

test('actual complete canonical U5 facts prove all fields using literal source steps and reward', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(supports(parse(question), options(ritual)), true);
    assert.equal(supports(parse('For the Shrine pilgrimage, how many cycles do I meditate?'), options(ritual)), true);
    assert.equal(supports(parse(completion), options(reward)), true);
    assert.equal(supports(parse(question), options(reward)), false);
    assert.equal(supports(parse(completion), options(ritual)), false);
    assert.equal(supports(parse(question), { ...options(ritual), subjectEntityId: reward.entityId }), false);
    assert.equal(supports(parse(question), { ...options(ritual), scopeTexts: ['Other ritual'] }), false);
    assert.equal(supports(parse(question), { ...options(ritual), scopeTexts: [] }), false);
});

test('a literal ordered quantity and the immediate following purpose are both required', () => {
    for (const text of [
        '1) Learn the mantra. 2) Meditate at the shrine. 3) Visit the Codex on the Isle of the Avatar to receive guidance.',
        '1) Learn three cycles. 2) Meditate at the shrine. 3) Visit the Codex on the Isle of the Avatar to receive guidance.',
        '1) Learn the mantra. 2) Meditate for three hours. 3) Visit the Codex on the Isle of the Avatar to receive guidance.',
        '1) Learn the mantra. 2) Train for three cycles. 3) Visit the Codex on the Isle of the Avatar to receive guidance.',
        '1) Learn the mantra. 2) Meditate for some cycles. 3) Visit the Codex on the Isle of the Avatar to receive guidance.',
        '1) Learn the mantra. 2) Meditate for at least three cycles. 3) Visit the Codex on the Isle of the Avatar to receive guidance.',
        '1) Learn the mantra. 2) Meditate for 2–3 cycles. 3) Visit the Codex on the Isle of the Avatar to receive guidance.',
        '1) Learn the mantra. 2) Meditate for three cycles. 3) Return to the shrine. 4) Visit the Codex to receive guidance.',
        '1) Visit the Codex to receive guidance. 2) Meditate for three cycles. 3) Return to the shrine.',
        '1) Learn the mantra. 2) Meditate for three cycles. 3) Visit the Codex to obtain treasure.',
        '1) Learn the mantra. 2) Meditate for three cycles. 3) Visit . to receive guidance.',
        '1) Learn the mantra. 2) Meditate for three cycles.',
        'Meditate at the shrine for three cycles. Visit the Codex to receive guidance.',
        '1) Learn the mantra. 3) Meditate for three cycles. 4) Visit the Codex to receive guidance.',
        '1) Learn the mantra. 2) Do not meditate for three cycles. 3) Visit the Codex to receive guidance.',
        '1) Learn the mantra. 2) Meditate for three cycles. 3) Maybe visit the Codex to receive guidance.'
    ]) assert.equal(supports(parse(question), options(changedText(ritual, text))), false, text);
    assert.equal(supports(parse(question), options({ ...ritual, witness: ritual.text.slice(0, -1) })), false);
    assert.equal(supports(parse(question), options({ ...ritual, answerRelations: ['method', 'outcome'] })), false);
    assert.equal(supports(parse(question), options({ ...ritual, answerRelations: ['sequence'] })), false);
    assert.equal(supports(parse(question), options({ ...ritual, conflict: true })), false);
});

test('source-grounded references cannot invent an active ritual or current player progress', () => {
    const q = parse('For that ritual, how many cycles do I meditate, and where do I go for guidance afterward?');
    assert.equal(supports(q, options(ritual)), false);
    assert.equal(supports(q, { ...options(ritual), grounded: true }), true);
    for (const scope of ['my current shrine ritual', 'the completed shrine ritual', 'the shrine ritual after winning',
        'the unknown shrine ritual', 'the two shrine rituals', 'the shrine ritual in the mobile edition',
        'the iron shrine ritual', 'the shrine ritual according to the manual']) {
        assert.equal(supports(parse(question.replace('the shrine ritual', scope)), options(ritual)), false, scope);
    }
    for (const q of [
        question.replace('meditate,', 'meditate with the iron mantra,'),
        question.replace('meditate,', 'already meditate,'),
        question.replace('meditate,', 'meditate after completing the quest,'),
        question.replace('cycles', 'hours'),
        question.replace('guidance afterward', 'guidance about the copper lens afterward'),
        question.replace('guidance afterward', 'guidance in the mobile edition afterward'),
        question.replace('guidance afterward', 'guidance according to the manual afterward'),
        question.replace('guidance afterward', 'guidance afterward and how do I fight the king')
    ]) assert.equal(supports(parse(q), options(ritual)), false, q);
});

test('completion reward requires exact whole object, quantities and affirmative role-backed assertion', () => {
    for (const q of [
        'What does completing eight shrine quests unlock?',
        'What does completing all seven shrine quests unlock?',
        'What does completing all 8 shrine quests unlock?',
        'What does completing all eight iron shrine quests unlock?',
        'What does completing all eight shrine quests in the mobile edition unlock?',
        'What does completing all eight shrine quests according to the manual unlock?',
        'What does completing it unlock?',
        'What does completing all eight shrine quests unlock in my current save?',
        'What does completing all eight shrine quests unlock and how do I spend the reward?'
    ]) assert.equal(supports(parse(q), options(reward)), false, q);
    for (const text of [
        'All eight shrine quests. The Word of Power for Doom: VERAMOCOR.',
        'Completing all eight shrine quests may grant the Word of Power for Doom: VERAMOCOR.',
        'Completing all eight shrine quests does not grant the Word of Power for Doom: VERAMOCOR.',
        'Completing all seven shrine quests grants the Word of Power for Doom: VERAMOCOR.',
        'Completing all eight shrine quests grants',
        'Completing all eight shrine quests grants .',
        'Completing all eight shrine quests grants the',
        'The guide says completing all eight shrine quests grants the Word of Power for Doom: VERAMOCOR.'
    ]) assert.equal(supports(parse(completion), options(changedText(reward, text))), false, text);
    assert.equal(supports(parse(completion), options({ ...reward, answerRelations: ['acquisition'] })), false);
});

test('general syntax works for unrelated source-owned procedures and preserves full action objects', () => {
    const fact = { entityId: 'example:topic:lens-calibration', subject: 'Lens calibration',
        answerRelations: ['method', 'sequence'], source: { file: 'example.html', locator: 'section#lens', review: 'extracted' },
        text: '1) Clean the lens. 2) Hold the copper lens for 12 minutes. 3) Travel to the tower to obtain instructions.' };
    fact.witness = fact.text;
    const q = parse('For lens calibration, how many minutes do I hold the copper lens, and where do I go for instructions afterward?');
    assert.equal(supports(q, options(fact)), true);
    assert.equal(supports(parse(q.originalText.replace('copper lens', 'lens')), options(fact)), false);
    assert.equal(supports(parse(q.originalText.replace('copper lens', 'copper lens in the museum')), options(fact)), false);
    assert.equal(supports(parse(q.originalText.replace('minutes', 'hours')), options(fact)), false);
    assert.equal(supports({ ...q, fields: q.fields.slice(0, 1) }, options(fact)), false);
    const rewardText = 'Completing all six tower tasks yields a silver key.';
    const rewardFact = changedText({ ...fact, answerRelations: ['outcome'] }, rewardText);
    assert.equal(supports(parse('What does completing all six tower tasks yield?'), options(rewardFact)), true);
});

test('only descriptive shrine metadata changes; protected source fields and encoded documents remain frozen', () => {
    const fact = manifest.facts.find(fact => fact.id === 'shrine-loop');
    assert.ok(fact.topicLabels.includes('Shrine ritual'));
    assert.deepEqual(fact.answerRelations, ['method', 'sequence', 'outcome']);
    const fields = ['id', 'subject', 'facet', 'aliases', 'text', 'witness', 'source', 'sourceRecordId', 'researchWitness', 'editions'];
    const protectedFacts = manifest.facts.map(fact => Object.fromEntries(fields.filter(key => key in fact).map(key => [key, fact[key]])));
    assert.equal(createHash('sha256').update(JSON.stringify(protectedFacts)).digest('hex'),
        'a41a08a5c026853273ba388a6a8ee87579f21b3ff3e3884c5d332a9bb7ae773e');
    assert.deepEqual(manifest.facts.map(fact => ({ factId: fact.id, text: knowledgeDocument(fact) })),
        read('ultima5-embeddings.json').documents.map(({ factId, text }) => ({ factId, text })));
});
