import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { buildKnowledge } from '../../js/assistant/knowledge.js';
import { lookupGraphQuestion, readGraphQuestion } from '../../js/assistant/knowledge-graph.js';

const read = game => JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`, import.meta.url)));
const u7 = buildKnowledge('ultima7', allRecords.ultima7, read('ultima7'));
const albion = buildKnowledge('albion', allRecords.albion, read('albion'));
const sword = 'ultima7:knowledge-entity:black-sword', gem = 'ultima7:knowledge-entity:ether-gem';
const daemon = 'ultima7:interest:arcadion', dragon = 'ultima7:monster:dracothraxus';
const holderQuestion = 'Which dragon has the Ether Gem in the Courage test?';
const lookup = (knowledge, text, subjectIds, options = {}) => lookupGraphQuestion({...knowledge, text, subjectIds, ...options});
const proof = (knowledge, result) => result.factIds.map(id => knowledge.facts.find(fact => fact.id === id).text).join('\n');

test('typed holder descriptor keeps item, creature kind and full editorial scene separate', () => {
    assert.deepEqual(readGraphQuestion(holderQuestion), {relation:'holder', animate:true, itemSubject:true,
        requestedKind:'dragon', subjectLabel:'ether gem', sceneLabel:'courage test'});
    const result = lookup(u7, holderQuestion, ['ultima7:quest:test-of-courage', gem]);
    assert.equal(result.complete, true);
    assert.deepEqual(result.answerEntityIds, [dragon]);
    assert.deepEqual(result.subjectIds, [gem]);
    assert.deepEqual(result.factIds, ['ether-gem-dragon', 'courage-sleep-potions']);
    assert.match(proof(u7, result), /sleep potions on dragons.*defeat Dracothraxus for the Ether Gem/);
});

test('holder cannot shorten unknown item, kind modifier, amount, scene or source constraints', () => {
    for (const text of [
        'Which dragon has the silver Ether Gem in the Courage test?',
        'Which dragon has 2 Ether Gems in the Courage test?',
        'Which silver dragon has the Ether Gem in the Courage test?',
        'Which dragon has the Ether Gem in the Courage trial?',
        'Which dragon has the Ether Gem in the Courage test from the external wiki?',
        'Which dragon has the Ether Gem in the Courage test for version 99?'
    ]) {
        const result = lookup(u7, text, [gem]);
        assert.notEqual(result?.complete, true, text);
        assert.deepEqual(result?.answerEntityIds || [], [], text);
    }
    assert.notEqual(lookup(u7, holderQuestion, [sword])?.complete, true);
    assert.notEqual(lookup({...u7, sourceContexts:[]}, holderQuestion, [gem])?.complete, true);
});

test('a generic monster kind, denied type or dragon in a separate sentence is insufficient type evidence', () => {
    for (const text of ['Defeat Dracothraxus for the Ether Gem.',
        'Dracothraxus is not a dragon. Defeat Dracothraxus for the Ether Gem.',
        'A dragon is elsewhere. Defeat Dracothraxus for the Ether Gem.']) {
        const facts = u7.facts.map(fact => ['courage-sleep-potions','ether-gem-dragon'].includes(fact.id)
            ? {...fact, text, witness:text} : fact);
        const result = lookup({...u7, facts}, holderQuestion, [gem]);
        assert.equal(result.complete, false);
        assert.deepEqual(result.answerEntityIds, []);
    }
});

test('bare typed actor lookup follows the active artifact direct binding edge', () => {
    const result = lookup(u7, 'Which daemon?', [sword]);
    assert.equal(result.complete, true);
    assert.deepEqual(result.answerEntityIds, [daemon]);
    assert.deepEqual(result.subjectIds, [sword]);
    assert.deepEqual(result.factIds, ['black-sword-full-method']);
    assert.match(proof(u7, result), /Free Arcadion into the Ether Gem via the mirror.*bind the daemon to forge the Black Sword/);
    assert.equal(lookup(u7, 'Which daemon?', []), null);
    assert.equal(lookup(u7, 'Which daemon?', [gem]), null);
    const facts = u7.facts.map(fact => ['black-sword-full-method','arcadion-daemon-identity'].includes(fact.id)
        ? {...fact, text:'Arcadion is an actor.', witness:'Arcadion is an actor.'} : fact);
    assert.equal(lookup({...u7, facts}, 'Which daemon?', [sword]).complete, false);
});

test('the reviewed same-fact binding antecedent remains fully edition eligible', () => {
    const visited = [];
    const result = lookup(u7, 'Which daemon?', [sword], {isEligible:fact=>{
        visited.push(fact.id);
        return fact.record.editions.includes('Forge of Virtue');
    }});
    assert.equal(result.complete, true);
    assert.deepEqual(result.answerEntityIds, [daemon]);
    assert.deepEqual(result.factIds, ['black-sword-full-method']);
    assert.deepEqual(visited, ['black-sword-full-method']);
    assert.equal(u7.facts.find(fact=>fact.id==='arcadion-daemon-identity').record.editions.length, 0);
    assert.equal(lookup(u7, 'Which daemon?', [sword], {
        isEligible:fact=>fact.record.editions.includes('Unknown edition')}).complete, false);
});

test('binding antecedents need a unique named freed actor before the typed action for this exact artifact', () => {
    const full = u7.facts.find(fact=>fact.id==='black-sword-full-method');
    for (const [label, text, witness] of [
        ['another actor', full.text.replace('Free Arcadion', 'Free Erethian')],
        ['two freed actors', full.text.replace('Free Arcadion', 'Free Arcadion and Erethian')],
        ['two freeing actions', full.text.replace('Heat and hammer', 'Free Erethian into the Ether Gem via the mirror. Heat and hammer')],
        ['another artifact', full.text.replace('to forge the Black Sword', 'to forge the Glass Sword')],
        ['reversed action order', "Bind the daemon to forge the Black Sword. Free Arcadion into the Ether Gem via the mirror."],
        ['negated freeing', full.text.replace('Free Arcadion', 'Do not free Arcadion')],
        ['negated binding', full.text.replace('then bind', 'then do not bind')],
        ['uncertain binding', full.text.replace('then bind', 'then perhaps bind')],
        ['truncated binding', full.text.split(' Heat and hammer')[0]],
        ['truncated freeing', full.text.split('. ').slice(2).join('. ')],
        ['truncated witness', full.text, 'Free Arcadion into the Ether Gem via the mirror.'],
        ['co-mentioned typed actor', 'Ask Arcadion about the daemon. Free Erethian into the Ether Gem via the mirror. Bind the daemon to forge the Black Sword.']
    ]) {
        const facts = u7.facts.map(fact=>fact.id===full.id ? {...fact,text,witness:witness ?? text} : fact);
        const result = lookup({...u7,facts}, 'Which daemon?', [sword]);
        assert.equal(result.complete, false, label);
        assert.deepEqual(result.answerEntityIds, [], label);
        assert.deepEqual(result.factIds, [], label);
    }
    assert.equal(lookup(u7, 'Which silver daemon?', [sword]).complete, false);
    const links = u7.links.map(link=>link.id==='black-sword-binding' ? {...link,from:daemon,to:sword} : link);
    assert.equal(lookup({...u7,links}, 'Which daemon?', [sword]), null);
});

test('vessel lookup retains the named actor, gem and complete mirror mechanism', () => {
    const text = 'What gem do I put him into?';
    assert.deepEqual(readGraphQuestion(text), {relation:'binding-vessel', item:true, requestedKind:'gem', requestedParticipantLabel:'him'});
    for (const [subject, ids] of [[sword, ['black-sword-full-method']], [daemon, ['arcadion-mirror']]]) {
        const result = lookup(u7, text, [subject], {referenceEntityIds:[daemon]});
        assert.equal(result.complete, true);
        assert.deepEqual(result.answerEntityIds, [gem]);
        assert.deepEqual(result.factIds, ids);
        assert.match(proof(u7, result), /Free Arcadion into the Ether Gem via the mirror/);
        assert.ok(!result.answerEntityIds.includes('ultima7:knowledge-entity:mirror'));
    }
    assert.equal(lookup(u7, text, [daemon]).complete, true, 'an active animate subject can ground its own pronoun');
    assert.equal(lookup(u7, text, [sword]).complete, false, 'an artifact cannot choose a global actor for him');
    assert.equal(lookup(u7, 'What gem do I put Arcadion into?', [sword]).complete, true);
    for (const [question, options] of [
        ['What silver gem do I put him into?', {referenceEntityIds:[daemon]}],
        [text, {referenceEntityIds:[dragon]}],
        [text, {referenceEntityIds:[daemon,dragon]}],
        ['What gem do I put the unknown daemon into?', {}]
    ]) assert.notEqual(lookup(u7, question, [sword], options)?.complete, true, question);
});

test('new participant roles reject incomplete, disputed or ineligible evidence atomically', () => {
    for (const linkId of ['dracothraxus-gem','black-sword-binding','black-sword-binding-vessel']) {
        const text = linkId==='dracothraxus-gem' ? holderQuestion
            : linkId==='black-sword-binding' ? 'Which daemon?' : 'What gem do I put him into?';
        const subjects = linkId==='dracothraxus-gem' ? [gem] : [sword];
        for (const patch of [{status:'disputed'},{evidenceFactIds:[]},{evidenceFactIds:['missing-proof']}]) {
            const links = u7.links.map(link => link.id===linkId ? {...link,...patch} : link);
            const result = lookup({...u7,links}, text, subjects, {referenceEntityIds:[daemon]});
            assert.equal(result.complete, false);
            assert.deepEqual(result.factIds, []);
            assert.deepEqual(result.answerEntityIds, []);
        }
        const result = lookup(u7, text, subjects, {referenceEntityIds:[daemon], isEligible:()=>false});
        assert.equal(result.complete, false);
        assert.deepEqual(result.factIds, []);
    }
});

test('boolean prerequisite assertion names its exact dependency and destination', () => {
    const text = 'Do I really need him to get inside Kenget Kamulos?';
    assert.deepEqual(readGraphQuestion(text), {relation:'prerequisites', assertion:true,
        subjectLabel:'kenget kamulos', requestedDependencyLabel:'him'});
    // Use the declared canonical IDs instead of relying on a guessed source kind.
    const id = name => [...albion.entities].find(([,entity])=>entity.name===name)?.[0];
    const scene = id('Kenget Kamulos'), khunag = id('Khunag');
    assert.ok(scene && khunag);
    const result = lookup(albion, text, [scene], {referenceEntityIds:[khunag]});
    assert.equal(result.complete, true);
    assert.deepEqual(result.answerEntityIds, [khunag]);
    assert.match(proof(albion, result), /Requires Khunag to enter|cannot enter Kenget Kamulos without Khunag/);
    assert.equal(lookup(albion, text, [scene]).complete, false);
    assert.equal(lookup(albion, 'Do I really need Khunag to get inside Kenget Kamulos?', [scene]).complete, true);
    for (const question of [
        'Do I really need Siobhan to get inside Kenget Kamulos?',
        'Do I really need him to get inside silver Kenget Kamulos?',
        'Do I really need him to get inside Kenget Kamulos from an external wiki?',
        'Do I really need him with 3 ropes to get inside Kenget Kamulos?'
    ]) assert.notEqual(lookup(albion, question, [scene], {referenceEntityIds:[khunag]})?.complete, true, question);
});

const gateFixture = () => ({
    text:'Do I really need him to get inside the Fortress?', subjectIds:['destination'], referenceEntityIds:['actor'],
    entities:new Map([['destination',{name:'Fortress',kind:'place'}],['actor',{name:'Guide',kind:'person'}],['key',{name:'Key',kind:'item'}]]),
    links:[{from:'destination',to:'actor',relation:'requires',evidenceFactIds:['gate'],status:'recorded'}],
    facts:[{id:'gate',entityId:'destination',text:'Hard gate: you cannot enter Fortress without Guide in the party.'}]
});

test('a dependency assertion needs its own literal entry gate and a direct correctly directed edge', () => {
    assert.equal(lookupGraphQuestion(gateFixture()).complete, true);
    for (const patch of [
        {links:[]},
        {links:[{from:'destination',to:'key',relation:'requires',evidenceFactIds:['gate'],status:'recorded'}]},
        {links:[{from:'actor',to:'destination',relation:'requires',evidenceFactIds:['gate'],status:'recorded'}]},
        {links:[{from:'actor',to:'destination',relation:'required-for',evidenceFactIds:['gate'],status:'disputed'}]},
        {facts:[{id:'gate',entityId:'destination',text:'Bring Guide to Fortress.'}]},
        {facts:[{id:'gate',entityId:'destination',text:'Guide is mentioned near Fortress. Requires Key to enter.'}]},
        {facts:[{id:'gate',entityId:'destination',text:'Guide is not required to enter Fortress.'}]},
        {facts:[{id:'gate',entityId:'destination',text:'Guide might be required to enter Fortress.'}]},
        {facts:[{id:'gate',entityId:'actor',text:'Requires Guide to enter.'}]},
        {referenceEntityIds:['actor','missing-actor']},
        {referenceEntityIds:['key']}
    ]) {
        const result = lookupGraphQuestion({...gateFixture(),...patch});
        assert.notEqual(result?.complete, true);
        assert.deepEqual(result?.answerEntityIds || [], []);
    }
    const incoming = gateFixture();
    incoming.links[0] = {...incoming.links[0],from:'actor',to:'destination',relation:'required-to-enter'};
    assert.equal(lookupGraphQuestion(incoming).complete, true);
    assert.equal(lookupGraphQuestion({...gateFixture(),isEligible:()=>false}).complete, false);
});

test('player-state, negated and hypothetical questions never enter the finite participant reader', () => {
    for (const text of ['Which dragon currently has the Ether Gem?', 'Which dragon has the Ether Gem now?',
        'Which daemon is already bound?', 'What gem did I put him into?',
        'Do I already need him to get inside the Fortress?', 'Do I not need him to get inside the Fortress?',
        "Don't I need him to get inside the Fortress?", 'Do I really need him to get inside the Fortress if I skipped the quest?']) {
        assert.equal(readGraphQuestion(text), null, text);
    }
});
