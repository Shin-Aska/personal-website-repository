import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {parseSourceRequestFrame as parse} from '../../js/assistant/request-frame.js';

// Deliberately exercise the shared source-proof path with no model inputs.
// These tests do not claim native classifier/encoder acceptance evidence.
const read = file => JSON.parse(fs.readFileSync(new URL(file, import.meta.url)));
function fixture(game, editManifest = () => {}) {
    const manifest = read(`../../data/assistant/knowledge/${game}.json`);
    editManifest(manifest);
    const knowledge = buildKnowledge(game, allRecords[game], manifest);
    assert.deepEqual(knowledge.issues, []);
    const assistant = createConversationAssistant({gameId: game, records: knowledge.records, knowledge,
        assistant: createAssistant({gameId: game, records: knowledge.sourceRecords, fallback: null}),
        classify: async () => [], encode: async () => { throw Error('Encoder explicitly unavailable'); }});
    const ask = async q => {
        const reply = await assistant.answerAsync(q);
        assert.deepEqual(reply.actions, [], q); assert.deepEqual(reply.stateChanges, [], q);
        return reply;
    };
    return {knowledge, assistant, ask};
}
const locators = reply => (reply.sources || []).map(source => source.locator);

test('Finite use belongs to the predicate, while roster count and modifiers survive', () => {
    const frame = parse('Which six party members does the recommended party use?');
    assert.equal(frame.subjectText, 'the recommended party');
    assert.equal(frame.fields[0].requestedCount.value, 6);
    assert.deepEqual(frame.fields[0].unknownQualifierTexts, ['party']);
    const qualified = parse('Which six party members does the recommended party use without magic?');
    assert.equal(qualified.subjectText, 'the recommended party');
    assert.ok(qualified.fields[0].unknownQualifierTexts.includes('without magic'));
});

test('Recruitment approach retains its phase, purpose and named destination', () => {
    const frame = parse('How do I reach Mariah for recruitment?');
    assert.equal(frame.subjectText, 'Mariah');
    assert.equal(frame.fields[0].key, 'method');
    assert.deepEqual(frame.fields[0].selectors, ['recruitment']);
    assert.equal(frame.fields[0].phase, 'approach');
    assert.deepEqual(frame.fields[0].purposeTexts, ['for recruitment']);
    assert.ok(frame.fields[0].unknownQualifierTexts.includes('for recruitment'));
});

test('The original party conversation keeps the full roster and recruitment witnesses', async () => {
    const f = fixture('ultima5');
    try {
        const dialogue = read('./knowledge/ultima5-cases.json').dialogues.find(d => d.id === 'party-recommendation');
        for (const [index, turn] of dialogue.turns.entries()) {
            const reply = await f.ask(turn.text);
            // The fourth turn's independent known-for classification needs the
            // native model; execute it in order without pretending this test has it.
            if (index === 3) continue;
            assert.equal(reply.decision, 'answer', reply.text);
            for (const value of turn.expected.contains) assert.ok(reply.text.includes(value), reply.text);
            assert.deepEqual(locators(reply), [turn.expected.source.locator]);
            const fact = f.knowledge.facts.find(fact => fact.id === turn.expected.factIds[0]);
            assert.ok(reply.text.includes(fact.text), 'Whole original witness must survive');
        }
    } finally { f.assistant.destroy(); }
});

test('Danger property syntax selects the actual danger field through the original plate dialogue', async () => {
    const frame = parse('What makes Animal 3 dangerous?');
    assert.equal(frame.subjectText, 'Animal 3');
    assert.equal(frame.fields[0].key, 'limitations');
    assert.deepEqual(frame.fields[0].selectors, ['danger']);
    const f = fixture('albion');
    try {
        const dialogue = read('./knowledge/albion-cases.json').dialogues.find(d => d.id === 'blue-plate-demonstration');
        for (const [index, turn] of dialogue.turns.entries()) {
            const reply = await f.ask(turn.text);
            if (index === 0) {
                assert.equal(reply.sourcePresentation?.kind, 'conflict-quotation');
                assert.deepEqual(reply.quotedFactIds, ['xp-plate']);
                assert.equal(reply.knowledge, undefined);
            }
            else if (index === 3) assert.notEqual(reply.decision, 'answer', reply.text);
            else {
                assert.equal(reply.decision, 'answer', reply.text);
                for (const value of turn.expected.contains) assert.ok(reply.text.includes(value), reply.text);
                assert.deepEqual(locators(reply), [turn.expected.source.locator]);
            }
        }
    } finally { f.assistant.destroy(); }
});

test('Unrecorded roster, direction, role, edition and danger restrictions remain unsupported', async () => {
    for (const q of [
        'Which seven party members does the recommended party use?',
        'Which six party members does the recommended party use without magic?',
        'Which six party members does the radioactive party use?',
        'How do I reach Mariah for assassination?',
        'How do I leave Mariah for recruitment?',
        'How do I reach the recommended party for recruitment?',
        'How do I reach Mariah for recruitment in the 2026 remaster edition?',
        'How do I reach her for recruitment?'
    ]) {
        const f = fixture('ultima5');
        try { assert.notEqual((await f.ask(q)).decision, 'answer', q); }
        finally { f.assistant.destroy(); }
    }
    for (const q of [
        'What makes Animal 3 immune?',
        'What makes radioactive Animal 3 dangerous?',
        'What makes Animal 3 dangerous in the 2026 remaster edition?',
        'What makes Animal 3 dangerous to dragons?'
    ]) {
        const f = fixture('albion');
        try { assert.notEqual((await f.ask(q)).decision, 'answer', q); }
        finally { f.assistant.destroy(); }
    }
});

test('An unphased recruitment field and an unreviewed danger capability cannot cover the new questions', async () => {
    const recruit = fixture('ultima5', manifest => {
        const fact = manifest.facts.find(fact => fact.id === 'gwenno-mariah');
        fact.sourceFields = fact.sourceFields.filter(field => field.phase !== 'approach');
    });
    try { assert.notEqual((await recruit.ask('How do I reach Mariah for recruitment?')).decision, 'answer'); }
    finally { recruit.assistant.destroy(); }
    const danger = fixture('albion', manifest => {
        delete manifest.facts.find(fact => fact.id === 'animal-3-danger').sourceFields;
    });
    try { assert.notEqual((await danger.ask('What makes Animal 3 dangerous?')).decision, 'answer'); }
    finally { danger.assistant.destroy(); }
});

test('Both deliberate Albion conflicts remain excluded through the ordered assassination dialogue', async () => {
    const f = fixture('albion');
    try {
        for (const id of ['xp-plate', 'assassination-sequence']) {
            assert.equal(f.knowledge.facts.find(fact => fact.id === id).record.conflict, true);
            assert.ok(!f.knowledge.sourceFields.entries.some(entry => entry.factId === id));
        }
        const dialogue = read('./knowledge/albion-cases.json').dialogues.find(d => d.id === 'assassination-reward');
        for (const [index, turn] of dialogue.turns.entries()) {
            const reply = await f.ask(turn.text);
            if (index === 0) {
                assert.equal(reply.sourcePresentation?.kind, 'conflict-quotation');
                assert.deepEqual(reply.quotedFactIds, ['assassination-sequence']);
                assert.equal(reply.knowledge, undefined);
            }
            else {
                assert.equal(reply.decision, 'answer', reply.text);
                for (const value of turn.expected.contains) assert.ok(reply.text.includes(value), reply.text);
                assert.deepEqual(locators(reply), [turn.expected.source.locator]);
            }
        }
    } finally { f.assistant.destroy(); }
});
