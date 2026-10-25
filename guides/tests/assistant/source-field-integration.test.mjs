import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

function fixture(game){
    const records=game==='starcraft'?JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url))):allRecords[game];
    const knowledge=buildKnowledge(game,records,JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url))));
    assert.deepEqual(knowledge.issues,[]);
    const engine=createAssistant({gameId:game,records,fallback:null});
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:engine,classify:async()=>[],
        encode:async()=>{throw Error('This source-routing contract does not use inference');}});
    return {assistant,engine,knowledge};
}
async function ask(assistant,text){
    const reply=await assistant.answerAsync(text);
    assert.equal(reply.decision,'answer',reply.text);
    assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);
    return reply;
}

test('A precise pickup instruction retains priority over a general item location',async()=>{
    const {assistant,engine}=fixture('alqadim');
    try{
        await ask(assistant,'How do I get the Ship Orb?');
        const reply=await ask(assistant,'Where is the Ship Orb?');
        assert.match(reply.text,/helm cabin/);assert.equal(engine.inspect().claimCount,0);
    }finally{assistant.destroy();}
});
test('An unspecified extraction route cannot inherit a different portable installation',async()=>{
    const {assistant}=fixture('starcraft');
    try{
        await ask(assistant,'How do I install BWAILauncher?');
        const reply=await ask(assistant,'Where do I extract it?');
        assert.match(reply.text,/installation directory/);
    }finally{assistant.destroy();}
});
test('Typed original fields combine a companion role, focus and every requested attribute',async()=>{
    const {assistant}=fixture('ultima7');
    try{
        const profile=await ask(assistant,'What role and focus does Tseramed have?');
        assert.match(profile.text,/Fighter \(Ranger\)/);assert.match(profile.text,/Focus: Wilderness archer/);
        const attributes=await ask(assistant,'What are his strength, dexterity, intelligence and combat?');
        for(const phrase of ['Strength','Dexterity','Intelligence','Combat'])assert.ok(attributes.text.includes(phrase),attributes.text);
    }finally{assistant.destroy();}
});
test('A task survives supplier, maker, teacher, song and recipient changes without mixing their roles',async()=>{
    const {assistant,engine}=fixture('ultima6');
    try{
        const craft=await ask(assistant,'I need panpipes for the Sacrifice task. Who supplies the wood, how is it prepared, and who makes the instrument?');
        for(const phrase of ['Ben','board','Julia','PANPIPES'])assert.ok(craft.text.includes(phrase),craft.text);
        const song=await ask(assistant,'And who teaches the tune, what song topic should I use, and what is its number sequence?');
        for(const phrase of ['Gwenno','STONES','6789878767653'])assert.ok(song.text.includes(phrase),song.text);
        const performance=await ask(assistant,'Who do I perform it for, and where, to earn the rune?');
        for(const phrase of ['Selganor','Artisan Guild','receive the rune','STONES'])assert.ok(performance.text.includes(phrase),performance.text);
        assert.ok(performance.knowledge.factIds.includes('gwenno-song'));
        assert.ok(performance.knowledge.factIds.includes('selganor-rune'));
        assert.notEqual((await assistant.answerAsync('Who teaches Gwenno?')).decision,'answer');
        await assistant.answerAsync('Who is quantum turnip?');
        assert.notEqual((await assistant.answerAsync('Who do I perform it for?')).decision,'answer');
        assert.equal(engine.inspect().claimCount,0);
    }finally{assistant.destroy();}
});
test('A repair actor requires the repair instruction as well as the delivery witness',async()=>{
    const {assistant,knowledge}=fixture('ultima6');
    try{
        const text='For the broken red gargoyle lens, where is it recovered and who handles the repair?';
        const reply=await ask(assistant,text);
        assert.match(reply.text,/Hall of Knowledge/);assert.match(reply.text,/Lor-wis-lem: say LENS for repairs/);
        assert.ok(reply.knowledge.factIds.includes('red-lens'));
        assert.ok(reply.knowledge.factIds.includes('lor-lens-keyword'));
        assert.ok(reply.sources.some(source=>source.locator.endsWith('keywords[0].helper')));
        assistant.resetTopic();
        const keyword=knowledge.facts.find(fact=>fact.id==='lor-lens-keyword');
        keyword.conflict=true;keyword.record.conflict=true;
        const incomplete=await assistant.answerAsync(text);
        assert.notEqual(incomplete.decision,'answer',incomplete.text);
    }finally{assistant.destroy();}
});
