// A fixed trivia acceptance corpus, authored from guide data and cited dialogue.
// It checks the meaning and provenance of answers, not merely that chat replied.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allRecords, u7Markers } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const fixture = JSON.parse(fs.readFileSync(new URL('./trivia-ultima7-cases.json', import.meta.url)));
const records = allRecords.ultima7;
const byId = new Map(records.map(record => [record.id, record]));
const make = () => createAssistant({ gameId: 'ultima7', records, editions: ['forge of virtue'] });

function check(reply, expected, spoiler) {
    assert.deepEqual(reply.stateChanges, []);
    if (expected.decision === 'no-answer') {
        assert.notEqual(reply.decision, 'answer', reply.text);
        return;
    }
    assert.equal(reply.decision, 'answer', reply.text);
    for (const text of expected.contains || [])
        assert.ok(reply.text.toLowerCase().includes(text.toLowerCase()), `${text}: ${reply.text}`);
    for (const text of expected.absent || [])
        assert.ok(!reply.text.toLowerCase().includes(text.toLowerCase()), `${text}: ${reply.text}`);
    assert.ok(reply.recordIds.length && reply.sources.length, 'a factual answer needs its records and sources');
    for (const id of reply.recordIds) assert.ok(authorize(byId.get(id), spoiler), id);
    for (const id of expected.entityIds || [])
        assert.ok(reply.recordIds.some(recordId => byId.get(recordId)?.entityId === id), `${id}: ${reply.text}`);
    if (expected.source === 'research') {
        assert.match(reply.text, /outside research/);
        assert.ok(reply.sources.every(source => source.review === 'external-research' && source.references.length));
    } else if (expected.source === 'guide') {
        assert.doesNotMatch(reply.text, /outside research:/);
        assert.ok(reply.sources.every(source => source.review !== 'external-research'));
    }
}

for (const item of fixture.questions) test(`${item.id} ${item.category}: ${item.text}`, () => {
    check(make().answer(item.text, { spoiler: item.spoiler }), item.expected, item.spoiler);
});

for (const dialogue of fixture.dialogues) test(`Ultima VII trivia dialogue: ${dialogue.id}`, () => {
    const bot = make();
    for (const turn of dialogue.turns)
        check(bot.answer(turn.text, { spoiler: dialogue.spoiler, ...dialogue.context }), turn.expected, dialogue.spoiler);
    assert.equal(bot.inspect().claimCount, 0);
});

for (const spoiler of ['gentle', 'balanced', 'direct']) test(`Lord British is a person at ${spoiler}, with the original atlas action`, () => {
    const bot = make();
    const description = bot.answer('Who is Lord British?', { spoiler });
    check(description, { decision: 'answer', contains: ['rules Britannia', 'king'], source: 'research' }, spoiler);
    check(bot.answer('Who is he?'), { decision: 'answer', contains: ['rules Britannia'], source: 'research' }, spoiler);
    const location = bot.answer('Where is he?');
    assert.deepEqual(location.recordIds, ['ultima7:place:lord-british:location']);
    assert.ok(location.actions.some(action => action.id === 'atlas:Lord British'));
    // The conversational correction must not rewrite the atlas or its coordinates.
    assert.equal(u7Markers.find(marker => marker.name === 'Lord British').type, 'castle');
});

test('a Black Gate identity answer describes the portal without giving its destruction steps', () => {
    const reply = make().answer('What is the Black Gate?', { spoiler: 'balanced' });
    check(reply, { decision: 'answer', contains: ['black moongate', 'Guardian'], source: 'research' }, 'balanced');
    assert.doesNotMatch(reply.text, /Rudyom|pedestal|prism|destroy/);
});

test('an unanswered personal hint cannot fall back to the quest open behind chat', () => {
    const bot = make();
    const context = { spoiler: 'balanced', entityIds: ['ultima7:quest:the-trinsic-murders'] };
    bot.answer('Who is Lord British?', context);
    const reply = bot.answer('What is he hiding?', context);
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.sources, []);
    assert.doesNotMatch(reply.text, /crime scene|witness|Trinsic/);
});
