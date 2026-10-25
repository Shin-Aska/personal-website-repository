import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { lookupGraphQuestion, graphReferenceRoles } from '../../js/assistant/knowledge-graph.js';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { allRecords } from './load-records.mjs';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const sources = { ...allRecords, starcraft: read('./evidence/conversation-starcraft-source-records.json') };
const knowledge = Object.fromEntries(Object.entries(sources).map(([game, records]) =>
    [game, buildKnowledge(game, records, read(`../../data/assistant/knowledge/${game}.json`))]));
const entityId = (k, name) => {
    const labeled = [...k.entities.values()].filter(entity => [entity.name, ...entity.aliases].some(alias => alias.toLowerCase() === name.toLowerCase()));
    const declared = labeled.filter(entity => entity.declared);
    const matches = declared.length ? declared : labeled;
    assert.equal(matches.length, 1, `Unique fixture subject: ${name}`);
    return matches[0].id;
};
const lookup = (game, text, subject, options = {}) => {
    const k = knowledge[game];
    return lookupGraphQuestion({ ...k, text, subjectIds: [entityId(k, subject)], ...options });
};
const names = (game, result) => result.answerEntityIds.map(id => knowledge[game].entities.get(id).name);
const proofText = (game, result) => result.factIds.map(id => knowledge[game].facts.find(fact => fact.id === id).text).join('\n');

for (const [game, text, subject, answer, relation] of [
    ['ultima5', 'Who gives me the Grapple?', 'Grapple', 'Lord Michael', 'provider'],
    ['ultima6', 'Who can make the Panpipes?', 'Panpipes', 'Julia', 'maker'],
    ['ultima6', 'Who teaches Stones?', 'Stones', 'Gwenno', 'teacher'],
    ['ultima6', 'Who repairs the Gargoyle Lens?', 'Gargoyle Lens', 'Lor-wis-lem', 'repairer'],
    ['albion', 'Which companion is required to enter Kenget Kamulos?', 'Kenget Kamulos entry', 'Khunag', 'prerequisites'],
    ['albion', 'Who can I get the Dreamshield from?', 'Dreamshield', 'Rifrako', 'provider'],
    ['alqadim', 'Who teaches Wide Swing?', 'Wide Swing', 'Zubakon', 'teacher'],
    ['alqadim', 'Where can I find Purple Berries?', 'Purple Berries', 'Western Desert Oasis', 'location'],
    ['ultima7', 'Who makes the caddellite helmets?', 'caddellite helmets', 'Zorn', 'maker']
]) {
    test(`${game}: ${text}`, () => {
        const result = lookup(game, text, subject);
        assert.equal(result?.complete, true);
        assert.deepEqual(names(game, result), [answer]);
        assert.equal(result.relation, relation);
        assert.ok(result.factIds.length);
    });
}

test('Direct provider proofs retain loan, price, defeat and active-party conditions', () => {
    const loan = lookup('ultima6', 'From whom can I borrow the Rune of Honor?', 'Rune of Honor');
    assert.deepEqual(names('ultima6', loan), ['Whitsaber']);
    assert.match(proofText('ultima6', loan), /loan|lend/i);
    const sale = lookup('ultima7', 'Who can I buy the special orrery crystal from?', 'special orrery crystal');
    assert.deepEqual(names('ultima7', sale), ['Addom']);
    assert.match(proofText('ultima7', sale), /20/);
    const defeat = lookup('ultima7', 'Who do I obtain the Ether Gem from?', 'Ether Gem');
    assert.deepEqual(names('ultima7', defeat), ['Dracothraxus']);
    assert.match(proofText('ultima7', defeat), /kill|defeat/i);
    const companion = lookup('albion', 'Who is required to enter Kenget Kamulos?', 'Kenget Kamulos entry');
    assert.match(proofText('albion', companion), /party/i);
});

test('StarCraft requirements return all direct requirements and their complete proofs', () => {
    const result = lookup('starcraft', 'What do I need for SCHNAIL?', 'SCHNAIL');
    assert.equal(result?.complete, true);
    assert.equal(result.answerEntityIds.length, 3);
    const k = knowledge.starcraft;
    const edges = k.links.filter(link => link.from === entityId(k, 'SCHNAIL') && link.relation.startsWith('requires-'));
    assert.deepEqual(new Set(result.factIds), new Set(edges.flatMap(link => link.evidenceFactIds)));
    assert.match(proofText('starcraft', result), /21|Java/i);
    assert.match(proofText('starcraft', result), /internet|login/i);
});

test('Requirement lookup preserves a full assembly passage shared by multiple edges', () => {
    const result = lookup('ultima6', 'What do I need for the Hot-Air Balloon?', 'Hot-Air Balloon');
    assert.deepEqual(new Set(names('ultima6', result)), new Set(['Rope', 'Large Pot', 'Silk Bag', 'Wicker Basket', 'Balloon Plans']));
    assert.deepEqual(new Set(result.factIds), new Set(['balloon-assembly', 'bag-basket']));
    assert.match(proofText('ultima6', result), /all parts.*inventory/i);
    assert.match(proofText('ultima6', result), /sew the silk bag.*wicker basket/i);
});

test('An explicit destination request follows the recorded lead instead of locating its sender', () => {
    const result = lookup('ultima6', 'Where do the gypsies send me?', 'Gypsies', {requestedRelation:'destination'});
    assert.equal(result?.relation, 'destination');
    assert.equal(result.complete, true);
    assert.deepEqual(names('ultima6', result), ['Homer']);
    assert.match(proofText('ultima6', result), /Homer.*Buccaneer/);
});

test('Only explicitly indexed literal answers or passwords are returned', () => {
    const riddle = lookup('ultima5', 'What is the answer to the Stonegate demon riddle?', 'Stonegate demon riddle');
    assert.deepEqual(names('ultima5', riddle), ['WELL']);
    const answer = lookup('ultima6', "What's the exact answer to Antonio's riddle?", 'Antonio');
    assert.deepEqual(names('ultima6', answer), ['Conor']);
    assert.deepEqual(new Set(answer.factIds), new Set(['antonio-riddle', 'humility-rune']));
    const password = lookup('ultima5', 'What password does Chamfort accept?', 'Chamfort');
    assert.deepEqual(names('ultima5', password), ['DAWN']);
    const exit = lookup('ultima7', 'What password does Finnigan give?', 'Finnigan');
    assert.deepEqual(names('ultima7', exit), ['Blackbird']);
    assert.equal(lookup('alqadim', 'What is the exact password for Al Katraz?', "Al'Katraz Prison Dungeon"), null);
});

test('An inanimate teaching scroll is not a named person and no giver-to-teacher chain is inferred', () => {
    assert.equal(lookup('ultima6', 'Who teaches Gargish?', 'Gargish'), null);
    assert.equal(lookup('ultima6', 'Who teaches Captain Johne?', 'Captain Johne'), null);
});

test('An unrelated give-to predicate cannot turn the crystal recipient into its giver', () => {
    const result = lookup('ultima7', 'Who gives the special orrery crystal?', 'special orrery crystal');
    assert.deepEqual(names('ultima7', result), ['Addom']);
    assert.ok(!result.answerEntityIds.includes(entityId(knowledge.ultima7, 'Brion')));
});

const synthetic = () => ({
    entities: new Map([
        ['object', { name: 'Object', kind: 'item' }], ['agent', { name: 'Agent', kind: 'npc' }],
        ['other', { name: 'Other', kind: 'character' }], ['place', { name: 'Place', kind: 'place' }],
        ['material', { name: 'Material', kind: 'item' }], ['guild', { name: 'Guild', kind: 'guild' }]
    ]),
    facts: Array.from({ length: 6 }, (_, index) => ({ id: `proof-${index}`, text: `Condition ${index}.` })),
    links: [], subjectIds: ['object'], text: 'Who makes the object?'
});
const edge = (from, to, relation, evidenceFactIds = ['proof-0'], status = 'recorded') =>
    ({ from, to, relation, evidenceFactIds, status });

test('A missing destination cannot be substituted with a location or abstract consequence', () => {
    const k = synthetic();
    k.entities.set('consequence', {name:'A consequence',kind:'outcome'});
    k.text = 'Where does the object send me?'; k.requestedRelation = 'destination';
    k.links = [edge('object','place','located-at'), edge('object','consequence','leads-to')];
    assert.equal(lookupGraphQuestion(k), null);
});

test('Reference roles keep provider and recipient separate and require every returned proof', () => {
    const k = synthetic();
    k.subjectIds = ['object']; k.factIds = ['proof-0'];
    k.links = [edge('object','agent','sold-by'), edge('object','other','deliver-to',['proof-0','proof-1'])];
    assert.deepEqual(graphReferenceRoles(k), {provider:['agent'],recipient:[]});
    k.factIds.push('proof-1');
    assert.deepEqual(graphReferenceRoles(k), {provider:['agent'],recipient:['other']});
    k.links[1].status = 'disputed';
    assert.deepEqual(graphReferenceRoles(k), {provider:['agent'],recipient:[]});
});

test('Multiple recorded recipients remain multiple and cannot create a transitive role', () => {
    const k = synthetic();
    k.subjectIds = ['object']; k.factIds = ['proof-0'];
    k.links = [edge('object','agent','deliver-to'), edge('object','other','deliver-to'), edge('other','place','located-at')];
    assert.deepEqual(graphReferenceRoles(k), {provider:[],recipient:['agent','other']});
});

test('Maker inverse lookup obeys the exact directed predicate and retains every proof', () => {
    const k = synthetic();
    k.links = [edge('agent', 'object', 'crafts', k.facts.map(fact => fact.id)),
        edge('object', 'material', 'crafted-from'), edge('object', 'other', 'not-crafted-by')];
    const result = lookupGraphQuestion(k);
    assert.deepEqual(result.answerEntityIds, ['agent']);
    assert.deepEqual(result.factIds, k.facts.map(fact => fact.id));
    assert.deepEqual(result.subjectIds, ['object']);
    assert.equal(result.complete, true);
});

test('Hyphen and underscore spellings are equivalent; extra predicate words are not', () => {
    const k = synthetic();
    k.links = [edge('object', 'agent', 'made_by'), edge('object', 'other', 'never-made-by')];
    assert.deepEqual(lookupGraphQuestion(k).answerEntityIds, ['agent']);
    k.links[0].relation = 'made-by';
    assert.deepEqual(lookupGraphQuestion(k).answerEntityIds, ['agent']);
});

test('All role answers survive; edge order and a second named endpoint cannot reverse a predicate', () => {
    const k = synthetic();
    k.subjectIds = ['agent', 'object'];
    k.links = [edge('agent', 'object', 'makes', ['proof-0', 'proof-1']),
        edge('object', 'other', 'made-by', ['proof-2', 'proof-3'])];
    const result = lookupGraphQuestion(k);
    assert.deepEqual(result.answerEntityIds, ['agent', 'other']);
    assert.deepEqual(result.factIds, ['proof-0', 'proof-1', 'proof-2', 'proof-3']);
    assert.deepEqual(result.subjectIds, ['object']);
});

test('A role with any ineligible evidence is withheld in full and marks the result incomplete', () => {
    const k = synthetic();
    k.links = [edge('agent', 'object', 'crafts', ['proof-0', 'proof-1']),
        edge('other', 'object', 'crafts', ['proof-2'])];
    const visited = [];
    const result = lookupGraphQuestion({ ...k, isEligible: fact => {
        visited.push(fact.id); return fact.id !== 'proof-1';
    } });
    assert.equal(result.complete, false);
    assert.deepEqual(result.answerEntityIds, ['other']);
    assert.deepEqual(result.factIds, ['proof-2']);
    assert.ok(visited.includes('proof-0') && visited.includes('proof-1'));
});

test('Disputed, unproved, missing-proof and unknown-status edges cannot answer', () => {
    for (const link of [edge('agent', 'object', 'crafts', ['proof-0'], 'disputed'),
        edge('agent', 'object', 'crafts', []), edge('agent', 'object', 'crafts', ['missing']),
        edge('agent', 'object', 'crafts', ['proof-0'], 'invented')]) {
        const result = lookupGraphQuestion({ ...synthetic(), links: [link] });
        assert.equal(result.complete, false);
        assert.deepEqual(result.factIds, []);
        assert.deepEqual(result.answerEntityIds, []);
    }
});

test('A provider location and an acquisition source cannot locate the object', () => {
    const k = synthetic();
    k.text = 'Where is the object?';
    k.links = [edge('object', 'agent', 'obtained-from'), edge('agent', 'place', 'located-at')];
    assert.equal(lookupGraphQuestion(k), null);
    k.links.push(edge('object', 'place', 'located_at'));
    assert.deepEqual(lookupGraphQuestion(k).answerEntityIds, ['place']);
});

test('A necessary companion lookup never supplies an inanimate required item', () => {
    const k = synthetic();
    k.text = 'Which companion is required to enter the object?';
    k.links = [edge('object', 'material', 'requires'), edge('object', 'other', 'requires')];
    assert.deepEqual(lookupGraphQuestion(k).answerEntityIds, ['other']);
});

test('Explicit organizations can make and supply objects; a physical material cannot be a maker', () => {
    const k = synthetic();
    k.links = [edge('guild', 'object', 'crafts'), edge('material', 'object', 'crafts')];
    assert.deepEqual(lookupGraphQuestion(k).answerEntityIds, ['guild']);
    k.text = 'Which guild provides the object?';
    k.links = [edge('guild', 'object', 'provides')];
    assert.deepEqual(lookupGraphQuestion(k).answerEntityIds, ['guild']);
});

test('Authored required-for direction is read directly, without reversing ordinary requires', () => {
    const k = synthetic();
    k.text = 'What do I need for the object?';
    k.links = [edge('object', 'material', 'requires'), edge('other', 'object', 'required-for'),
        edge('agent', 'object', 'requires')];
    assert.deepEqual(lookupGraphQuestion(k).answerEntityIds, ['material', 'other']);
});

test('Cooccurrence, unsupported slots, state reports and counterfactuals never become graph questions', () => {
    const k = synthetic();
    k.links = [edge('agent', 'object', 'crafts')];
    for (const text of ['The agent makes the object.', 'I made the object.', 'Did the agent make the object?',
        'Who made the object if I skipped the quest?', 'Who did I say made the object?',
        'Who already made the object?', 'Which companion is in my party?', 'Why does the agent make the object?',
        'Who owns the object?', 'Who is the parent of the object?']) {
        assert.equal(lookupGraphQuestion({ ...k, text }), null, text);
    }
    assert.equal(lookupGraphQuestion({ ...k, subjectIds: [] }), null);
    assert.equal(lookupGraphQuestion({ ...k, links: [] }), null);
});
