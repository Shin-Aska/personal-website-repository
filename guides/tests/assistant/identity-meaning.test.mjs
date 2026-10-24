import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';
const make = gameId => createAssistant({ gameId, records: allRecords[gameId] });

test('Lord British has a game-specific identity, independently of the rescue outcome', () => {
    const a = make('ultima5');
    for (const q of ['Who is Lord British?', 'Who is he?']) {
        const r = a.answer(q, { spoiler: 'gentle' });
        assert.deepEqual(r.recordIds, ['ultima5:research:lord-british-identity:explanation']);
        assert.match(r.text, /king of Britannia.*Great Council/);
        assert.ok(r.sources.every(s => s.review === 'external-research' && s.references.every(ref => ref.checkedAt === '2026-10-24')));
        assert.doesNotMatch(r.text, /tyranny collapses|Earth|old friend/);
    }
    assert.notEqual(a.answer('Using only this guide, who is Lord British?', { spoiler: 'direct' }).decision, 'answer');
    assert.deepEqual(a.answer('How do I rescue Lord British?').recordIds, ['ultima5:objective:doom-rescue:hint']);
    assert.deepEqual(a.answer('What is the outcome of the Doom rescue?').recordIds, ['ultima5:narrative:doom-rescue:outcome']);
});

test('the Ultima V counsel scope cannot hide a sourced identity behind the rescue outcome', () => {
    const a = make('ultima5');
    const options = { spoiler: 'direct', contextId: 'general', scope: 'campaign' };
    for (const question of ['Who is Lord British?', 'Who is he?']) {
        const reply = a.answer(question, options);
        assert.deepEqual(reply.recordIds, ['ultima5:research:lord-british-identity:explanation']);
        assert.match(reply.text, /king of Britannia/);
    }
    assert.deepEqual(a.answer('How do I rescue Lord British?', options).recordIds, ['ultima5:objective:doom-rescue:hint']);
});

test('Shadowlord identity describes the powers and names them without substituting a task list', () => {
    const r = make('ultima5').answer('What is a Shadowlord?', { spoiler: 'balanced' });
    assert.deepEqual(r.recordIds, ['ultima5:narrative:shadowlords-identity:identity']);
    for (const phrase of ['bend cities toward Falsehood, Hatred, and Cowardice', 'Faulinei', 'Astaroth', 'Nosfentor'])
        assert.ok(r.text.includes(phrase));
    assert.doesNotMatch(r.text, /Banish|Shard of|FALLAX/);
    const html = fs.readFileSync(new URL('../../Ultima5.html', import.meta.url), 'utf8');
    const text = r.sources[0].claims[0].text;
    assert.ok(html.includes(text), 'the new indexed page sentence must still exist verbatim');
});

for (const name of ['Caliph', 'Vizier', 'Aliya', 'Sinbar', 'Babazar'])
    test(`Al-Qadim ${name}: identity and quest context are different requests`, () => {
        const a = make('alqadim');
        const who = a.answer(`Who is ${name}?`, { spoiler: 'direct' });
        assert.notEqual(who.decision, 'answer');
        assert.deepEqual(who.recordIds, []);
        assert.match(who.text, /identity description/);
        assert.equal(a.answer(`Tell me about ${name}`).decision, 'answer');
    });

test('Tarik and Jessamin use the guide’s stated family roles and keep atlas locations', () => {
    const a = make('alqadim');
    a.answer('Who is the Caliph?', { spoiler: 'direct' });
    assert.deepEqual(a.answer('What about Tarik?').recordIds, ['alqadim:narrative:tarik-identity:identity']);
    assert.match(a.answer('Who is he?').text, /your brother Tarik/);
    assert.deepEqual(a.answer('Where is he?').recordIds, ['alqadim:npc:your-brother:location']);
    assert.deepEqual(a.answer('Who is Jessamin?').recordIds, ['alqadim:narrative:jessamin-identity:identity']);
    assert.match(a.answer('Who is she?').text, /Mother \(Jessamin\)/);
    assert.notEqual(a.answer('Who is she on Mars?').decision, 'answer');
    assert.notEqual(a.answer('What about Tarik?').decision, 'answer');
    assert.notEqual(a.answer('Who is Tarik?', { spoiler: 'gentle' }).decision, 'answer');
});

test('identity eligibility metadata survives authorization and applies to follow-ups', () => {
    const record = allRecords.alqadim.find(r => r.id === 'alqadim:topic:vizier:explanation');
    assert.equal(record.identity, false);
    assert.equal(authorize(record, 'direct').identity, false);
    const a = make('alqadim');
    a.answer('Who is the Caliph?', { spoiler: 'direct' });
    assert.notEqual(a.answer('What about the Vizier?').decision, 'answer');
    assert.equal(a.answer('Tell me about the Vizier').decision, 'answer');
});

test('explicit species and family roles survive removal of surrounding quest instructions', () => {
    for (const [question, id, phrase] of [
        ['Who is Kara?', 'kara', 'rogue genie Kara'],
        ['Who is Pangar-Bek?', 'pangar', 'cyclops Pangar-Bek'],
        ['Who is my mother?', 'jessamin', 'Mother (Jessamin)']
    ]) {
        const reply = make('alqadim').answer(question, { spoiler: 'direct' });
        assert.deepEqual(reply.recordIds, [`alqadim:narrative:${id}-identity:identity`]);
        assert.ok(reply.text.includes(phrase), reply.text);
        assert.doesNotMatch(reply.text, /Defeat|Locate and escort|Visit/);
    }
});
