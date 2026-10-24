import assert from 'node:assert/strict';
import test from 'node:test';
import { allRecords } from './load-records.mjs';
import { createAssistant, parse } from '../../js/assistant/engine.js';

const make = records => createAssistant({ gameId: 'albion', records: records || allRecords.albion });
for (const record of allRecords.albion.filter(r => r.kind === 'spell' && r.relation === 'stats'))
    test(`spell stats follow-up prefers its native record: ${record.title}`, () => {
        const a = make();
        assert.equal(a.answer(`What does ${record.title} do?`, { spoiler: 'gentle' }).decision, 'answer');
        assert.deepEqual(a.answer('What are its stats?').recordIds, [record.id]);
        assert.notEqual(a.answer('What are its stats on Mars?').decision, 'answer');
    });

test('literal authorized names survive framing removal, while outside filler is still removed', () => {
    const p = parse('Please summarize Toronto Again again', { names: ['Toronto Again'] });
    assert.equal(p.parts[0].core, 'summarize toronto again');
    assert.equal(p.parts[0].narrative.query, 'toronto again');
    assert.equal(parse('Please summarize Maini again').parts[0].narrative.query, 'maini');
});

test('a named chapter summary carries its identity into a differently named sequence', () => {
    const a = make();
    assert.deepEqual(a.answer('Summarize Toronto Again', { spoiler: 'direct' }).recordIds,
        ['albion:narrative:toronto-return-summary:summary']);
    assert.deepEqual(a.answer('What is the next step?').recordIds,
        ['albion:narrative:codes-walkthrough-sequence:sequence']);
    a.answer('Who is Sira?');
    assert.notEqual(a.answer('What is the next step?').decision, 'answer');
});

test('facet transitions preserve source and material restrictions', () => {
    const a = make();
    a.answer('Using only this guide, summarize Toronto Again', { spoiler: 'direct' });
    const sequence = a.answer('What is the next step?');
    assert.equal(sequence.decision, 'answer');
    assert.ok(sequence.sources.every(s => s.review !== 'external-research'));
    assert.notEqual(a.answer('What is the next step on Mars?').decision, 'answer');
    assert.notEqual(a.answer('What about Maini?').decision, 'answer');
});

test('the open campaign cannot substitute its quest for the explicitly named Sandalwood Box', () => {
    const a = createAssistant({ gameId: 'ultima5', records: allRecords.ultima5 });
    const options = { spoiler: 'direct', contextId: 'general', scope: 'campaign' };
    assert.deepEqual(a.answer('What does the Sandalwood Box do?', options).recordIds, ['ultima5:item:sandalwood-box:use']);
    assert.deepEqual(a.answer('Where is it?', options).recordIds, ['ultima5:item:sandalwood-box:location']);
});

test('pronoun requests for a new relationship retain a rejected restriction until a fresh named request', () => {
    for (const [gameId, first, followUp, fresh, id] of [
        ['albion', 'Where is the Pistol on Mars?', 'What does it do?', 'What does the Pistol do?', 'albion:item:pistol:use'],
        ['ultima5', 'Where is the Crown in the SNES version?', 'What does it do?', 'What does the Crown do?', 'ultima5:item:crown:use'],
        ['ultima7', 'Where is Magebane underwater?', 'What does it do?', 'What does Magebane do?', 'ultima7:equipment:magebane:use']
    ]) {
        const a = createAssistant({ gameId, records: allRecords[gameId] });
        assert.notEqual(a.answer(first, { spoiler: 'direct' }).decision, 'answer');
        assert.notEqual(a.answer(followUp).decision, 'answer');
        assert.deepEqual(a.answer(fresh).recordIds, [id]);
    }
});

test('a newly named multipart request replaces old restrictions before its pronoun part', () => {
    const a = createAssistant({ gameId: 'ultima5', records: allRecords.ultima5 });
    a.answer('Where is the Crown on Mars?', { spoiler: 'direct' });
    const reply = a.answer('Where is the Sceptre and what does it do?');
    assert.ok(reply.parts.every(part => part.decision === 'answer'), reply.text);
    assert.deepEqual(reply.recordIds, ['ultima5:item:sceptre:location', 'ultima5:item:sceptre:use']);
    assert.notEqual(a.answer('Where is the Crown on Mars and what does it do?').parts[1].decision, 'answer');
});

test('a spoiler reduction cannot recover hidden sequence text from a prior summary', () => {
    const a = make();
    a.answer('Summarize Toronto Again', { spoiler: 'direct' });
    const reply = a.answer('What is the next step?', { spoiler: 'gentle' });
    assert.notEqual(reply.decision, 'answer');
    assert.doesNotMatch(reply.text, /1001|1712|4312/);
});

test('an outcome can lead to steps with a different authored predicate, then back to its outcome', () => {
    const a = createAssistant({ gameId: 'ultima5', records: allRecords.ultima5 });
    assert.deepEqual(a.answer('What is the outcome of the Compassion shrine?', { spoiler: 'direct' }).recordIds,
        ['ultima5:narrative:shrine-compassion:outcome']);
    assert.deepEqual(a.answer('What is the next step?').recordIds,
        ['ultima5:narrative:compassion-sequence:sequence']);
    assert.deepEqual(a.answer('What is its outcome?').recordIds,
        ['ultima5:narrative:shrine-compassion:outcome']);
    assert.notEqual(a.answer('What is the outcome on Mars?').decision, 'answer');
});

test('a short outcome request needs an established subject and retains source restrictions', () => {
    assert.equal(parse('What is the outcome?').parts[0].narrative.contextual, true);
    const a = createAssistant({ gameId: 'ultima5', records: allRecords.ultima5 });
    assert.notEqual(a.answer('What is the outcome?', { spoiler: 'direct' }).decision, 'answer');
    a.answer('Using only this guide, summarize the Doom rescue');
    const outcome = a.answer('What is the outcome?');
    assert.deepEqual(outcome.recordIds, ['ultima5:narrative:doom-rescue:outcome']);
    assert.ok(outcome.sources.every(s => s.review !== 'external-research'));
    a.answer('Who is Iolo?');
    assert.notEqual(a.answer('What is the outcome?').decision, 'answer');
});

test('Sira and Melthas have their explicitly documented party link, without inferring a cause or family tie', () => {
    const a = make();
    a.answer('Who is Sira?', { spoiler: 'direct' });
    a.answer('Who is Melthas?');
    assert.deepEqual(a.answer('How are they related?').recordIds,
        ['albion:narrative:sira-melthas-party-link:relationship']);
    assert.notEqual(a.answer('Why did Sira leave Melthas?').decision, 'answer');
    assert.notEqual(a.answer("Who is Melthas's daughter?").decision, 'answer');
    const lower = a.answer('What is the relationship between Sira and Melthas?', { spoiler: 'balanced' });
    assert.notEqual(lower.decision, 'answer');
});

test('Cure and Kill are spell names in effect follow-ups, while condition questions remain remedies', () => {
    const a = createAssistant({ gameId: 'ultima6', records: allRecords.ultima6 });
    assert.deepEqual(a.answer('What does Cure do?', { spoiler: 'gentle' }).recordIds,
        ['ultima6:spell:cure:use:reference']);
    assert.deepEqual(a.inspect().contexts[0].frame, ['use']);
    assert.deepEqual(a.answer('What about Unlock Magic?').recordIds, ['ultima6:spell:unlock-magic:use:reference']);
    assert.deepEqual(a.answer('What about Kill?').recordIds, ['ultima6:spell:kill:use:reference']);
    const remedy = a.answer('How do I cure poisoning using only this guide?');
    assert.deepEqual(remedy.recordIds, ['ultima6:spell:cure:use:reference']);
    assert.ok(remedy.sources.every(s => s.review !== 'external-research'));
    assert.deepEqual(a.inspect().contexts[0].frame, ['remedy']);
    assert.notEqual(a.answer('What about paralysis?').decision, 'answer');
    assert.notEqual(a.answer('How do I cure poisoning for free?').decision, 'answer');
    assert.notEqual(a.answer('What about Kill?').decision, 'answer');
});

test('complete authored manual questions replace an unrelated earlier relationship', () => {
    const a = createAssistant({ gameId: 'ultima6', records: allRecords.ultima6 });
    a.answer('Where does Sulfurous Ash come from?', { spoiler: 'gentle' });
    assert.deepEqual(a.answer('How canst one fend off Rotworms?').recordIds,
        ['ultima6:qa:how-canst-one-fend-off-rotworms:explanation']);
    assert.deepEqual(a.answer('How doth Sea Serpents attack?').recordIds,
        ['ultima6:qa:how-doth-sea-serpents-attack:explanation']);
    assert.notEqual(a.answer('How doth Sea Serpents attack on Mars?').decision, 'answer');
});

test('a same-named quest cannot block a shrine reference that alone supports the follow-up', () => {
    const a = createAssistant({ gameId: 'ultima6', records: allRecords.ultima6 });
    a.answer('What does the Shrine of Valor give me?', { spoiler: 'gentle' });
    assert.deepEqual(a.answer('What about the Shrine of Compassion?').recordIds,
        ['ultima6:atlas:place:Shrine of Compassion:explanation:reference']);
    assert.notEqual(a.answer('What about the Shrine of Honesty on Mars?').decision, 'answer');
});

test('the open Sacrifice quest cannot hide the shrine bonus during a shrine conversation', () => {
    const a = createAssistant({ gameId: 'ultima6', records: allRecords.ultima6 });
    const context = { spoiler: 'gentle', contextId: 'quest:act-i-liberating-the-shrines:sacrifice-minoc' };
    a.answer('What does the Shrine of Valor give me?', context);
    a.answer('What about the Shrine of Honesty?', context);
    assert.deepEqual(a.answer('What about the Shrine of Sacrifice?', context).recordIds,
        ['ultima6:atlas:place:Shrine of Sacrifice:explanation:reference']);
});

test('an explicit two-person relationship keeps singular pronouns ambiguous', () => {
    const a = createAssistant({ gameId: 'ultima7', records: allRecords.ultima7 });
    assert.equal(a.answer('How are Spark and Christopher related?', { spoiler: 'balanced' }).decision, 'answer');
    assert.notEqual(a.answer('Who is he?').decision, 'answer');
    assert.deepEqual(a.answer('Who is Spark?').recordIds, ['ultima7:companion:spark:explanation']);
});

test('a new exact indexed mantra name retains the question without requiring a separate virtue profile', () => {
    const a = createAssistant({ gameId: 'ultima7', records: allRecords.ultima7 });
    a.answer('What is the mantra for Humility?', { spoiler: 'gentle' });
    assert.deepEqual(a.answer('What about Spirituality?').recordIds, ['ultima7:topic:mantra-spirituality:explanation']);
    assert.notEqual(a.answer('What about Honesty on Mars?').decision, 'answer');
    a.answer('What is the mantra for Humility on Mars?');
    assert.notEqual(a.answer('What about Compassion?').decision, 'answer');
});

test('reviewed complete question aliases answer their question even without a generic intent keyword', () => {
    const a = createAssistant({ gameId: 'alqadim', records: allRecords.alqadim });
    assert.deepEqual(a.answer('How do I save the game?', { spoiler: 'gentle' }).recordIds,
        ['alqadim:research:saving-and-difficulty:hint']);
    assert.deepEqual(a.answer('How do I move?').recordIds, ['alqadim:research:controls:explanation']);
    assert.notEqual(a.answer('How do I move on Mars?').decision, 'answer');
    assert.notEqual(a.answer('Using only this guide, how do I move?').decision, 'answer');
    assert.deepEqual(a.answer('How do I pause?').recordIds, ['alqadim:topic:combat-tips:explanation']);
    assert.notEqual(a.answer('How do I pause on Mars?').decision, 'answer');
    const u6 = createAssistant({ gameId: 'ultima6', records: allRecords.ultima6 });
    assert.deepEqual(u6.answer('What removes magical fields?', { spoiler: 'gentle' }).recordIds,
        ['ultima6:spell:dispel-field:use:reference']);
    assert.notEqual(u6.answer('What removes magical fields for free?').decision, 'answer');
});
