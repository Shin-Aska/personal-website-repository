import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

function fixture(game){
    const records=allRecords[game];
    const knowledge=buildKnowledge(game,records,JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url))));
    assert.deepEqual(knowledge.issues,[]);
    const source=createAssistant({gameId:game,records,fallback:null});
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:source,
        classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    const ask=async q=>{
        const r=await assistant.answerAsync(q);
        assert.deepEqual(r.actions,[],q);assert.deepEqual(r.stateChanges,[],q);
        assert.equal(source.inspect().claimCount,0,q);
        return r;
    };
    return {assistant,source,ask};
}
const academy=["I'm at Sinbar's academy and ready for the trial. How do I actually start it?",
    'That moving disintegrator field is catching me. What does the guide recommend for avoiding it?'];
const ship=["I'm searching the wrecked ship for the Ship Orb. Which part should I search?",'What is it actually for?'];
// This fixture deliberately disables the encoder. Native paraphrase coverage
// remains in the separate frozen browser conversation suite.
const trinsic=['How do I investigate the Trinsic crime scene?',
    'Who should I question?'];
async function seed(ask,questions){for(const q of questions)assert.equal((await ask(q)).decision,'answer',q);}

test('Trinsic authorization after the investigation quotes the complete quiz and password source',async()=>{
    const {assistant,ask}=fixture('ultima7');await seed(ask,trinsic);
    const r=await ask('How do I get permission to leave the city after the investigation, and what password do I receive?');
    assert.equal(r.decision,'answer',r.text);assert.deepEqual(r.knowledge.factIds,['finnigan-exit']);
    for(const text of ['Mayor Finnigan','copy protection quiz','Spektran latitude: 120','Skara Brae longitude: 60',"'Blackbird'"])
        assert.ok(r.text.includes(text),r.text);
    assert.ok(r.sources.length);assert.notEqual((await ask('Is that password already recorded in my current save?')).decision,'answer');assistant.destroy();
});

test('A direct report-to edge identifies the literal mayor without inventing prerequisites',async()=>{
    const {assistant,ask}=fixture('ultima7');await seed(ask,trinsic);
    const r=await ask('Who do I report to?');assert.equal(r.decision,'answer',r.text);assert.match(r.text,/Mayor Finnigan/);
    assert.ok(r.knowledge.factIds.includes('finnigan-exit'));assistant.destroy();
});

test('Unknown authorization phases and quantities cannot borrow an investigation witness',async()=>{
    for(const suffix of ['the radioactive investigation','30 investigations','the battle','the new investigation','the Trinsic escape','the Trinsic password']){
        const {assistant,ask}=fixture('ultima7');await seed(ask,trinsic);
        const q=`How do I get permission to leave the city after ${suffix}?`;
        assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('A deferred academy departure follows the current source scene to its explicit destination',async()=>{
    for(const phase of ["When I'm done here","Once we are done here","When I'm done there"]){
        const {assistant,ask}=fixture('alqadim');await seed(ask,academy);
        const r=await ask(`${phase}, how do I leave for Zaratan?`);
        assert.equal(r.decision,'answer',r.text);assert.match(r.text,/northern teleporter/);assert.match(r.text,/Zaratan/);
        assert.deepEqual(r.knowledge.factIds,['ch1_6']);assert.ok(r.sources.length);
        assert.notEqual((await ask('Have I already finished the trial?')).decision,'answer');assistant.destroy();
    }
});

test('An exit destination cannot become a second exit from the previous scene',async()=>{
    const {assistant,ask}=fixture('alqadim');await seed(ask,academy);
    assert.equal((await ask("When I'm done here, how do I leave for Zaratan?")).decision,'answer');
    const r=await ask("When I'm done there, how do I leave for Zaratan?");
    assert.notEqual(r.decision,'answer',r.text);assistant.destroy();
});

test('Scene references require a grounded area and retain the complete destination and origin',async()=>{
    for(const q of ["When I'm done here, how do I leave for Zaratan?", "When I'm done there, how do I leave for Zaratan?"]){
        const {assistant,ask}=fixture('alqadim');assert.notEqual((await ask(q)).decision,'answer');assistant.destroy();
    }
    for(const q of [
        "When I'm done here, how do I leave for radioactive Zaratan?",
        "When I'm done here, how do I leave for 30 Zaratans?",
        "When I'm done here, how do I leave for Zaratan from the radioactive Academy?",
        "When I'm done here, how do I leave for Zaratan according to the original manual?",
        "When I'm done here, how do I leave for Zaratan in the SNES edition?",
        "When I'm done here, how do I leave for Zaratan if I have the key?"
    ]){
        const {assistant,ask}=fixture('alqadim');await seed(ask,academy);
        assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('An unknown scene cannot resurrect a previously grounded trial',async()=>{
    const {assistant,ask}=fixture('alqadim');await seed(ask,academy);
    assert.notEqual((await ask('How do I solve quantum turnip?')).decision,'answer');
    assert.notEqual((await ask("When I'm done here, how do I leave for Zaratan?")).decision,'answer');assistant.destroy();
});

test('A hold resource question names the breakable source and retains the smash instruction',async()=>{
    const {assistant,ask}=fixture('alqadim');await seed(ask,ship);
    const r=await ask('Before I leave the hold, is there anything I can break open for healing potions?');
    assert.equal(r.decision,'answer',r.text);assert.match(r.text,/Smash barrels/);assert.match(r.text,/ship's hold/);assert.match(r.text,/healing potions/);
    assert.deepEqual(r.knowledge.factIds,['ch4_7']);assert.ok(r.sources.length);
    const where=await ask('Where is it?');assert.equal(where.decision,'answer',where.text);assert.match(where.text,/ship's hold/);
    assert.notEqual((await ask('Are the healing potions already in my inventory?')).decision,'answer');assistant.destroy();
});

test('Departure does not erase an unknown place, resource quantity, edition or source',async()=>{
    for(const q of [
        'Before I leave the radioactive hold, is there anything I can break open for healing potions?',
        'Before I leave the hold, is there anything I can break open for 30 healing potions?',
        'Before I leave the hold, is there anything I can break open for radioactive healing potions?',
        'Before I leave the hold, is there anything I can break open for healing potions in the SNES edition?',
        'Before I leave the hold, is there anything I can break open for healing potions according to the original manual?'
    ]){
        const {assistant,ask}=fixture('alqadim');await seed(ask,ship);assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('Recruitment location and dialogue method remain attached to the required person',async()=>{
    const {assistant,ask}=fixture('albion');
    await seed(ask,["I'm planning the Kenget Kamulos trip. Who has to be in the party for me to get inside?"]);
    const r=await ask('Where can I recruit him, and is talking to him part of it?');
    assert.equal(r.decision,'answer',r.text);assert.match(r.text,/Beloveno/);assert.match(r.text,/Kariah/);assert.match(r.text,/recruit Khunag via dialogue/);
    assert.ok(r.sources.length);assert.notEqual((await ask('Is Khunag already in my current party?')).decision,'answer');assistant.destroy();
});

test('A method assertion cannot infer necessity, sufficiency or a dialogue method for a co-mentioned person',async()=>{
    for(const [setup,q] of [
        [[], 'Is talking to him part of it?'],
        [['Where can I recruit Siobhan?'], 'Is talking to her part of it?'],
        [['Where can I recruit Khunag?'], 'Is talking to him enough?'],
        [['Where can I recruit Khunag?'], 'Is talking to him the only way?'],
        [['Where can I recruit Khunag?'], 'Is talking to him required?']
    ]){
        const {assistant,ask}=fixture('albion');for(const s of setup)await ask(s);
        assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('A failed second question cannot partially commit a source-only compound turn',async()=>{
    const {assistant,ask}=fixture('alqadim');await seed(ask,academy);
    const r=await ask("When I'm done here, how do I leave for Zaratan, and have I already finished the trial?");
    assert.notEqual(r.decision,'answer');assistant.destroy();
});
