import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, materialTerms, playerStateQuestion } from '../../js/assistant/language.js';
import { kindGroup, resolveEntities } from '../../js/assistant/retrieval.js';

const cores = text => parse(text).parts.map(part => part.core);

test('a shared subject keeps coordinated cost and effect predicates in one request', () => {
    for (const question of [
        'What does Frost Avalanche cost and do?',
        'What does Frost Avalanche cost and do ?',
        'What does Frost Avalanche cost, and do?'
    ]) {
        const parsed = parse(question);
        assert.equal(parsed.parts.length, 1, question);
        assert.match(parsed.parts[0].core, /frost avalanche cost,? and do$/);
        assert.equal(parsed.tooMany, false);
    }
});

test('explicit subsequent questions still split, including auxiliary and command clauses', () => {
    assert.deepEqual(cores('Where is Mahmoud and do they sell keys?'), [
        'where is mahmoud', 'do they sell keys'
    ]);
    assert.deepEqual(cores('Where is Frost Avalanche and what does it cost?'), [
        'where is frost avalanche', 'what does it cost'
    ]);
    assert.deepEqual(cores('Where is Mahmoud, and tell me what he sells?'), [
        'where is mahmoud', 'what he sells'
    ]);
    assert.deepEqual(cores('Where is Frost Avalanche and why?'), [
        'where is frost avalanche', 'why'
    ]);
});

test('possessive components stay in one object while explicit property follow-ups split', () => {
    assert.deepEqual(cores('Where do I find the Pistol and its canisters?'), ['where do i find the pistol and its canisters']);
    assert.deepEqual(cores('Where do I find the Pistol, and its cost?'), ['where do i find the pistol', 'its cost']);
    assert.deepEqual(cores('What does this spell do, and its reagents?'), ['what does this spell do', 'its reagents']);
});

test('a colon before a real question preserves its context without splitting ordinary titles', () => {
    assert.deepEqual(cores('Switching to spell ingredients: where does Sulfurous Ash come from?'), [
        'switching to spell ingredients', 'where does sulfurous ash come from'
    ]);
    assert.deepEqual(cores('What is StarCraft: Brood War?'), ['what is starcraft: brood war']);
    assert.deepEqual(cores('On Mars: where is the Rune?'), ['on mars', 'where is the rune']);
});

test('statement continuations stay together while WH requests and the three-part bound survive', () => {
    assert.deepEqual(cores('Sira is asleep and is still in my party'), [
        'sira is asleep and is still in my party'
    ]);
    assert.deepEqual(cores('I have the Pistol and where is the Dreamshield'), [
        'i have the pistol', 'where is the dreamshield'
    ]);
    const parsed = parse('Where is Mahmoud, what does he sell, how much is a key, and can I enter the palace?');
    assert.equal(parsed.parts.length, 3);
    assert.equal(parsed.tooMany, true);
});

test('coordinated requests preserve negation, quantity and prerequisite restrictions', () => {
    const question = 'What do 3 Frost Avalanche spells cost and do?';
    assert.deepEqual(cores(question), ['what do 3 frost avalanche spells cost and do']);
    const restricted = parse('Where can I never buy 3 keys and do they work without permission?');
    assert.equal(restricted.parts.length, 2);
    assert.match(restricted.parts[0].core, /never buy 3 keys/);
    assert.ok(materialTerms(restricted.parts[0].core, ['keys']).includes('never'));
    assert.ok(materialTerms(restricted.parts[1].core).includes('without'));
    assert.ok(materialTerms(restricted.parts[1].core).includes('permission'));
});

const entity = (id, title, kind) => ({ entityId: id, title, kind, aliases: [] });

test('literal person records carry the person type and respect typed typo matching', () => {
    const records = [entity('tarik', 'Tarik', 'person'), entity('tarek', 'Tarek', 'spell')];
    assert.equal(kindGroup('person'), 'person');
    const people = resolveEntities('Who is Taryk?', records, null, { expect: 'person' });
    assert.deepEqual(people.map(hit => hit.id), ['tarik']);
    assert.ok(people[0].groups.has('person'));
    assert.equal(people[0].match, 'typo');
    assert.deepEqual(resolveEntities('What does Taryk do?', records, null, { expect: 'spell' })
        .map(hit => hit.id), ['tarek']);
    assert.deepEqual(resolveEntities('Who is Tarik?', records, null, { expect: 'person' })
        .map(hit => [hit.id, hit.match]), [['tarik', 'exact']]);
});

test('a person type never breaks ties between ambiguous proper names', () => {
    const records = [entity('karim', 'Karim', 'person'), entity('karin', 'Karin', 'npc')];
    const matches = resolveEntities('Who is Karix?', records, null, { expect: 'person' });
    assert.deepEqual(matches.map(hit => hit.id).sort(), ['karim', 'karin']);
    assert.ok(matches.every(hit => hit.match === 'typo'));
});

test('save-state uncertainty stays distinct from a general prerequisite or ability question', () => {
    for (const question of [
        'Have I completed the palace quest?',
        'So, has my party already found the key?',
        'Please, do I still have the key?',
        'Is Tarik already in my party?',
        'Where is Tarik and is he currently with me?',
        'How many Canisters do I currently have?',
        'How much gold does my party carry?',
        'Am I poisoned?'
    ]) assert.equal(playerStateQuestion(question), true, question);
    for (const question of [
        'Do I have to find the key before entering the palace?',
        'Am I required to find the key?',
        'Am I allowed to enter the palace?',
        'Am I able to cast Frost Avalanche?',
        'Am I supposed to talk to Mahmoud?',
        'Does Frost Avalanche require mana?',
        'How many Canisters do I need for the Pistol?',
        'How many Canisters do I have to buy?',
        'Where is Mahmoud and do they sell keys?'
    ]) assert.equal(playerStateQuestion(question), false, question);
});
