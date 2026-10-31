import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {parseSourceRequestFrame as parse} from '../../js/assistant/request-frame.js';

// Proof-path regressions with inference explicitly unavailable. Native model
// acceptance remains separate; no synthetic or substituted vectors are used.
const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
function fixture(game, edit = () => {}) {
    const manifest = read(`../../data/assistant/knowledge/${game}.json`); edit(manifest);
    const knowledge = buildKnowledge(game, allRecords[game], manifest);
    assert.deepEqual(knowledge.issues, []);
    const assistant = createConversationAssistant({gameId: game, records: knowledge.records, knowledge,
        assistant: createAssistant({gameId: game, records: knowledge.sourceRecords, fallback: null}),
        classify: async () => [], encode: async () => { throw Error('Encoder explicitly unavailable'); }});
    return {knowledge, assistant, ask: async q => {
        const reply = await assistant.answerAsync(q);
        assert.deepEqual(reply.actions, [], q); assert.deepEqual(reply.stateChanges, [], q);
        return reply;
    }};
}
const locators = reply => (reply.sources || []).map(s => s.locator);
async function ordered(game, id) {
    const f = fixture(game);
    try {
        const dialogue = read(`./knowledge/${game}-cases.json`).dialogues.find(d => d.id === id);
        for (const turn of dialogue.turns) {
            const reply = await f.ask(turn.text);
            if (turn.expected.decision !== 'answer') assert.notEqual(reply.decision, 'answer', reply.text);
            else {
                assert.equal(reply.decision, 'answer', `${turn.text}: ${reply.text}`);
                for (const value of turn.expected.contains) assert.ok(reply.text.includes(value), reply.text);
                assert.ok(locators(reply).includes(turn.expected.source.locator), locators(reply).join('; '));
            }
        }
    } finally { f.assistant.destroy(); }
}

test('Modal dismissal preserves owner and recorded condition, never observed party state', () => {
    const frame = parse('Can I dismiss Khunag after his chapter?');
    assert.equal(frame.subjectText, 'Khunag'); assert.equal(frame.staticEligible, true);
    assert.equal(frame.fields[0].key, 'limitations');
    assert.deepEqual(frame.fields[0].selectors, ['dismissal']);
    assert.deepEqual(frame.fields[0].localConditionTexts, ['after his chapter']);
    const unknown = parse('Can I dismiss Khunag without losing equipment?');
    assert.ok(unknown.subjectText.includes('without losing equipment'));
});

test('Crossing capability and prevention preserve full literal scope', () => {
    const cross = parse('Can it cross mountains without a hook?');
    assert.equal(cross.subjectText, 'it'); assert.equal(cross.fields[0].key, 'use');
    assert.deepEqual(cross.fields[0].selectors, ['travel']);
    assert.ok(cross.fields[0].unknownQualifierTexts.includes('mountains without a hook'));
    const prevent = parse('What does it prevent in winter?');
    assert.equal(prevent.subjectText, 'it'); assert.equal(prevent.fields[0].key, 'use');
    assert.deepEqual(prevent.fields[0].selectors, ['prevention']);
    assert.equal(prevent.fields[0].requiresExplicitField, true);
    assert.ok(prevent.fields[0].unknownQualifierTexts.includes('in winter'));
});

test('The original Beloveno dialogue answers dismissal from the complete strengths/limits witness', async () => {
    await ordered('albion', 'beloveno-choice');
});

test('The original carpet conversation keeps the Grapple limitation, sea-damage recipient and state refusal', async () => {
    await ordered('ultima5', 'carpet-pronoun');
});

test('The original Porenoil dialogue answers prevention without inventing a vendor, then changes route', async () => {
    await ordered('albion', 'porenoil-route');
});

test('Wrong owners, terrain, timing, suffixes, editions and ungrounded pronouns remain unproved', async () => {
    for (const [game, first, controls] of [
        ['albion', 'What are Khunag limits?', [
            'Can I dismiss Khunag before his chapter?',
            'Can I dismiss Khunag after every chapter?',
            'Can I dismiss Khunag without losing equipment?',
            'Can I dismiss Tom after his chapter?',
            'Can I dismiss Khunag in the 2026 remaster edition?',
            'Is Khunag already in my party?'
        ]],
        ['ultima5', 'How do I use the Magic Carpet?', [
            'Can it cross lava?', 'Can it cross mountains without the Grapple?',
            'Can the Sandalwood Box cross mountains?',
            'Can it cross mountains in the 2026 remaster edition?'
        ]],
        ['albion', 'How do I get Porenoil?', [
            'What does it prevent in winter?',
            'What does it prevent without applying it?',
            'What does it prevent in the 2026 remaster edition?',
            'Who sells Porenoil?'
        ]]
    ]) {
        for (const q of controls) {
            const f = fixture(game);
            try { await f.ask(first); assert.notEqual((await f.ask(q)).decision, 'answer', q); }
            finally { f.assistant.destroy(); }
        }
    }
    for (const [game, q] of [['ultima5', 'Can it cross mountains?'], ['albion', 'What does it prevent?'], ['albion', 'Can I dismiss him after his chapter?']]) {
        const f = fixture(game);
        try { assert.notEqual((await f.ask(q)).decision, 'answer', q); }
        finally { f.assistant.destroy(); }
    }
});

test('The authored modal fields are necessary; neighboring source facts cannot confer them', async () => {
    for (const [game, factId, first, q, selector] of [
        ['albion', 'khunag-combat', 'What are Khunag limits?', 'Can I dismiss Khunag after his chapter?', 'dismissal'],
        ['ultima5', 'carpet-terrain', 'How do I use the Magic Carpet?', 'Can it cross mountains?', 'travel']
    ]) {
        const f = fixture(game, manifest => {
            const fact = manifest.facts.find(f => f.id === factId);
            fact.sourceFields = (fact.sourceFields || []).filter(field => !field.selectors.includes(selector));
            if (!fact.sourceFields.length) delete fact.sourceFields;
        });
        try { await f.ask(first); assert.notEqual((await f.ask(q)).decision, 'answer', q); }
        finally { f.assistant.destroy(); }
    }
});

test('An ordinary effect cannot become prevention without an explicitly reviewed prevention field', async () => {
    const ordinary = fixture('albion');
    try {
        assert.equal((await ordinary.ask('What does Dreamshield do?')).decision, 'answer');
        assert.notEqual((await ordinary.ask('What does it prevent?')).decision, 'answer');
    } finally { ordinary.assistant.destroy(); }
    const removed = fixture('albion', manifest => {
        for (const field of manifest.facts.find(f => f.id === 'porenoil').sourceFields)
            field.selectors = field.selectors.filter(selector => selector !== 'prevention');
    });
    try {
        await removed.ask('How do I get Porenoil?');
        assert.notEqual((await removed.ask('What does it prevent?')).decision, 'answer');
    } finally { removed.assistant.destroy(); }
});
