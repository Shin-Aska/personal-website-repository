import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { allRecords } from './load-records.mjs';

const make = (gameId = 'ultima7', records = allRecords[gameId]) => createAssistant({ gameId, records });
const balanced = { spoiler: 'balanced' };
const direct = { spoiler: 'direct' };
const profileId = 'ultima7:research:time-lord-identity:explanation';
const markerId = 'ultima7:npc:time-lord:location';

function profile(reply) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, [profileId]);
    assert.match(reply.text, /keep time flowing smoothly through space/);
    assert.match(reply.text, /outside research/);
    assert.doesNotMatch(reply.text, /Did you mean|don't know anything|npc on the guide|one marker/);
    assert.ok(reply.sources[0].references.some(source => source.url.endsWith('/libNPC148.htm')));
    assert.deepEqual(reply.stateChanges, []);
}

for (const spoiler of ['balanced', 'direct']) test(`the reported Time Lord conversation stays connected at ${spoiler}`, () => {
    const bot = make();
    profile(bot.answer('What is a timelord?', { spoiler, tone: 'sage' }));
    profile(bot.answer('yes a time lord'));
    profile(bot.answer('what is it?'));
    const location = bot.answer('where is he?');
    assert.deepEqual(location.recordIds, [markerId]);
    assert.ok(location.actions.some(action => action.id === 'atlas:Time Lord'));
});

for (const name of ['timelord', 'TimeLord', 'TIME LORD', 'time  lord', 'time lo rd', 'tim elord'])
    test(`spacing and case changes resolve silently: ${name}`, () => profile(make().answer(`What is a ${name}?`, balanced)));

for (const [game, changed, canonical] of [
    ['ultima7', 'Where is lordbritish?', 'Where is Lord British?'],
    ['ultima6', 'What does stormcloak do?', 'What does Storm Cloak do?'],
    ['ultima5', 'Where is lordmichael?', 'Where is Lord Michael?'],
    ['alqadim', 'Where is shiporb?', 'Where is Ship Orb?'],
    ['albion', 'Where is dream shield?', 'Where is Dreamshield?'],
]) test(`${game} shares silent name spacing`, () => {
    const expected = make(game).answer(canonical, direct);
    const actual = make(game).answer(changed, direct);
    assert.equal(expected.decision, 'answer', expected.text);
    assert.equal(actual.decision, 'answer', actual.text);
    assert.deepEqual(actual.recordIds, expected.recordIds);
    assert.doesNotMatch(actual.text, /Did you mean|don't know anything/);
});

test('spacing does not erase material, numeric or edition restrictions', () => {
    for (const question of ['What is timelord on Mars?', 'Who is timelord underwater?',
        'Who are the two timelords?', 'Who is timelord in the SNES version?']) {
        const reply = make().answer(question, direct);
        assert.notEqual(reply.decision, 'answer', `${question}: ${reply.text}`);
        assert.deepEqual(reply.sources, []);
    }
});

test('guide-only identity declines while the Time Lord atlas action remains available', () => {
    const bot = make();
    const reply = bot.answer('Using only the guide, what is timelord?', balanced);
    assert.equal(reply.decision, 'decline', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    assert.match(reply.text, /sourced identity description.*location/);
    for (const followUp of ['yes a time lord', 'what is it?']) {
        const restricted = bot.answer(followUp);
        assert.equal(restricted.decision, 'decline', restricted.text);
        assert.deepEqual(restricted.sources, []);
    }
    const location = make().answer('Where is timelord?', balanced);
    assert.equal(location.decision, 'answer', location.text);
    assert.deepEqual(location.recordIds, [markerId]);
});

test('an empty atlas label never masquerades as a character description', () => {
    const records = allRecords.ultima7.filter(record => record.id !== profileId);
    const reply = make('ultima7', records).answer('What is timelord?', balanced);
    assert.equal(reply.decision, 'decline', reply.text);
    assert.deepEqual(reply.sources, []);
    assert.doesNotMatch(reply.text, /npc on the guide|one marker/);
});

test('spacing variants do not reveal a character below their spoiler level', () => {
    const without = allRecords.ultima7.filter(record => record.entityId !== 'ultima7:npc:time-lord');
    for (const question of ['Who is timelord?', 'What is time lo rd?', 'Where is timelord?']) {
        const actual = make().answer(question, { spoiler: 'gentle' });
        const expected = make('ultima7', without).answer(question, { spoiler: 'gentle' });
        assert.deepEqual(actual, expected);
        assert.doesNotMatch(actual.text, /Time Lord|flowing smoothly|libNPC148/);
    }
});

function named(title, relation = 'explanation', text = `${title} is a forest keeper.`) {
    const entityId = `test:npc:${title.replaceAll(' ', '-').toLowerCase()}`;
    return { id: `${entityId}:${relation}`, entityId, title, aliases: [title], kind: 'npc', relation,
        scope: 'test', minSpoiler: 'gentle', requires: null,
        variants: { gentle: { text } }, source: { file: 'fixture', locator: title, review: 'extracted' } };
}

test('a literal spelling wins over a different name with the same compact spelling', () => {
    const records = [named('Dark Moor'), named('Darkmoor')];
    for (const title of ['Dark Moor', 'Darkmoor']) {
        const reply = make('test', records).answer(`Who is ${title}?`);
        assert.deepEqual(reply.recordIds, [records.find(record => record.title === title).id]);
    }
});

test('two names with identical letters and different spacing require clarification', () => {
    const records = [named('Dark Moor'), named('Darkm oor')];
    const reply = make('test', records).answer('Who is darkmo or?');
    assert.equal(reply.decision, 'clarify', reply.text);
    assert.deepEqual(new Set(reply.choices.map(choice => choice.id)), new Set(records.map(record => record.entityId)));
    assert.deepEqual(reply.recordIds, []);
    assert.doesNotMatch(reply.text, /Did you mean|don't know anything/);
});

test('answer availability cannot choose between ambiguous names', () => {
    const records = [named('Dark Moor'), named('Darkm oor', 'location', 'Darkm oor: forest.')];
    const reply = make('test', records).answer('Who is darkmo or?');
    assert.equal(reply.decision, 'clarify', reply.text);
    assert.equal(reply.choices.length, 2);
    const typo = make().answer('Who is Cooms?', balanced);
    assert.equal(typo.decision, 'clarify', typo.text);
    assert.ok(typo.choices.some(choice => choice.label === 'Cosmo'));
    assert.ok(typo.choices.some(choice => choice.label === 'Coop'));
});

test('genuine misspellings keep an explicit uncertainty cue', () => {
    const reply = make('test', [named('Time Lord')]).answer('What is a time lrod?');
    assert.match(reply.text, /Did you mean Time Lord\?/);
});

test('guide-only restrictions survive an ambiguous name choice', () => {
    const research = named('Dark Moor');
    research.source = { file: 'https://example.com/transcript', locator: 'dialogue', review: 'external-research',
        references: [{ label: 'Dialogue', url: 'https://example.com/transcript' }] };
    const bot = make('test', [research, named('Darkm oor', 'location', 'Darkm oor: forest.')]);
    const reply = bot.answer('Using only the guide, who is darkmo or?');
    assert.equal(reply.decision, 'clarify', reply.text);
    const choice = reply.choices.find(choice => choice.id === research.entityId);
    assert.ok(choice);
    const selected = bot.answer(choice.label, { choiceId: choice.id, expectedRevision: choice.revision });
    assert.equal(selected.decision, 'decline', selected.text);
    assert.deepEqual(selected.sources, []);
});

test('the optional model cannot soften a guide-only follow-up with research text', async () => {
    let calls = 0;
    const bot = createAssistant({ gameId: 'ultima7', records: allRecords.ultima7,
        fallback: { state: { status: 'ready' }, epoch: 1, generate: async packet => { calls++; return packet.guard.frames[0]; } } });
    await bot.answerAsync('Using only the guide, what is timelord?', balanced);
    await bot.answerAsync('yes a time lord');
    const reply = await bot.answerAsync('Why does he do that?');
    assert.equal(calls, 0);
    assert.deepEqual(reply.sources, []);
    assert.doesNotMatch(reply.text, /flowing smoothly|outside research:/);
});

test('a named confirmation keeps the earlier question and its restrictions', () => {
    const records = [named('Time Lord'), named('Time Lord', 'location', 'Time Lord: forest.')];
    const bot = make('test', records);
    assert.equal(bot.answer('Where is time lrod on Mars?').decision, 'decline');
    const reply = bot.answer('yes a time lord');
    assert.equal(reply.decision, 'decline', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
});

test('a confirmation cannot silently drop a newly added restriction', () => {
    const bot = make();
    profile(bot.answer('What is timelord?', balanced));
    assert.notEqual(bot.answer('yes a time lord on Mars').decision, 'answer');
});
