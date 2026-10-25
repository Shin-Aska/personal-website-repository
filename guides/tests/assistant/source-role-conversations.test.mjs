import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {buildKnowledge} from '../../js/assistant/knowledge.js';

const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const sources={...allRecords,starcraft:read('./evidence/conversation-starcraft-source-records.json')};
function fixture(game){
    const records=sources[game],knowledge=buildKnowledge(game,records,read(`../../data/assistant/knowledge/${game}.json`));
    assert.deepEqual(knowledge.issues,[]);
    const source=createAssistant({gameId:game,records,fallback:null});
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:source,
        classify:async()=>[],encode:async()=>{throw new Error('Encoder unavailable');}});
    return {assistant,source};
}
const noEffects=reply=>{assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);};

test('Static software choice and login-phase requirements quote both the condition and property without player-state claims',async()=>{
    const {assistant,source}=fixture('starcraft');
    const choice=await assistant.answerAsync('If I choose SCHNAIL, do I have to install Brood War separately first?');
    assert.equal(choice.decision,'answer',choice.text);assert.match(choice.text,/includes its own version/);assert.match(choice.text,/don't need to install the game separately/);
    const phase=await assistant.answerAsync("Once I've logged into it, do I have to stay connected to the internet during matches?");
    assert.equal(phase.decision,'answer',phase.text);assert.match(phase.text,/initial client login/);assert.match(phase.text,/All gameplay after login.*local network/);
    for(const reply of [choice,phase])noEffects(reply);assert.equal(source.inspect().claimCount,0);
    assert.notEqual((await assistant.answerAsync('Have I already logged into SCHNAIL?')).decision,'answer');assistant.destroy();
});

test('A conditional property cannot shorten an unknown game, edition, quantity or current-state request',async()=>{
    for(const text of [
        'If I choose SCHNAIL, do I have to install War separately first?',
        'If I choose SCHNAIL, do I have to install Brood War 2026 separately first?',
        'If I choose SCHNAIL, do I have to install Brood War for Linux separately first?',
        'Once I have logged into SCHNAIL, do I have to stay connected to the internet during 30-hour matches?',
        'If I have finished the investigation, what should I do next?',
        'If I choose quantum turnip, do I have to install Brood War separately first?'
    ]){const{assistant,source}=fixture('starcraft');const reply=await assistant.answerAsync(text);assert.notEqual(reply.decision,'answer',text);noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();}
});

test('A login pronoun needs grounded conversational focus and cannot survive an unknown subject',async()=>{
    const {assistant}=fixture('starcraft');
    const question="Once I've logged into it, do I have to stay connected to the internet during matches?";
    assert.notEqual((await assistant.answerAsync(question)).decision,'answer');
    await assistant.answerAsync('What is SCHNAIL?');await assistant.answerAsync('What is quantum turnip?');
    assert.notEqual((await assistant.answerAsync(question)).decision,'answer');assistant.destroy();
});

test('The mouse-hole instruction identifies Sherry while the following rune remains Valor',async()=>{
    const {assistant,source}=fixture('ultima6');
    const join=await assistant.answerAsync('How do I get Sherry to join?');assert.equal(join.decision,'answer',join.text);
    const place=await assistant.answerAsync('Where do I take her for the mouse hole?');assert.equal(place.decision,'answer',place.text);assert.match(place.text,/Sword and Keg/);
    const control=await assistant.answerAsync('Who should I be controlling?');assert.equal(control.decision,'answer',control.text);assert.match(control.text,/Sherry/);
    const rune=await assistant.answerAsync('Once she is there, how do we get the rune back to the group?');assert.equal(rune.decision,'answer',rune.text);assert.match(rune.text,/Sherry/);assert.match(rune.text,/regroup/);assert.doesNotMatch(rune.text,/central pedestal|Whitsaber/);
    for(const reply of[join,place,control,rune])noEffects(reply);assert.equal(source.inspect().claimCount,0);
    assert.notEqual((await assistant.answerAsync('Who am I controlling?')).decision,'answer');assistant.destroy();
});

test('Moving a person keeps the actor subject while an item pronoun keeps its proved source context',async()=>{
    const {assistant,source}=fixture('ultima6');
    const join=await assistant.answerAsync('How can I get Sherry to come with me?');assert.equal(join.decision,'answer',join.text);
    const route=await assistant.answerAsync('Where do I take her for the rune?');assert.equal(route.decision,'answer',route.text);
    assert.match(route.text,/Sword and Keg in Jhelom/);assert.match(route.text,/switch control/);
    const item=await assistant.answerAsync('How does she actually collect it?');assert.equal(item.decision,'answer',item.text);
    assert.match(item.text,/mouse hole as Sherry/);assert.match(item.text,/regroup/);assert.doesNotMatch(item.text,/central pedestal|Whitsaber/);
    for(const reply of[join,route,item])noEffects(reply);assert.equal(source.inspect().claimCount,0);
    await assistant.answerAsync('Who is quantum turnip?');
    assert.notEqual((await assistant.answerAsync('How does she collect it?')).decision,'answer');assistant.destroy();
});

test('Interview subjects remain attached to the current investigation rather than the last NPC',async()=>{
    const {assistant,source}=fixture('ultima7');
    const scene=await assistant.answerAsync('How do I investigate the Trinsic murders?');assert.equal(scene.decision,'answer',scene.text);
    const reply=await assistant.answerAsync('Who should I question?');assert.equal(reply.decision,'answer',reply.text);
    for(const name of['Spark','Gilberto','Klog'])assert.ok(reply.text.includes(name));
    assert.match(reply.text,/man with a hook/);assert.match(reply.text,/Crown Jewel/);noEffects(reply);assert.equal(source.inspect().claimCount,0);
    await assistant.answerAsync('How old is Lord British?');
    assert.notEqual((await assistant.answerAsync('Who should I question?')).decision,'answer');assistant.destroy();
});

test('A bribe answer establishes the item, and communication-phase requests retain their complete source proof',async()=>{
    const {assistant,source}=fixture('ultima7');
    const scene=await assistant.answerAsync('Where is the wisp?');assert.equal(scene.decision,'answer',scene.text);
    const bribe=await assistant.answerAsync('What are the emps expecting as a bribe?');assert.equal(bribe.decision,'answer',bribe.text);assert.match(bribe.text,/honey.*Bee Cave/);
    const item=await assistant.answerAsync('Where can I get it?');assert.equal(item.decision,'answer',item.text);assert.match(item.text,/Bee Cave/);
    const both=await assistant.answerAsync('How do I get their whistle, and what does the wisp ask for once I can speak to it?');
    assert.equal(both.decision,'answer',both.text);assert.match(both.text,/Negotiate with the emps/);assert.match(both.text,/Alagner's notebook/);assert.match(both.text,/New Magincia/);
    for(const reply of[scene,bribe,item,both])noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('A communication phase cannot erase an additional condition or its unknown subject',async()=>{
    for(const text of [
        'If I own the quantum turnip, what does the wisp ask for once I can speak to it?',
        'Once I have finished the quest, what does the wisp ask for once I can speak to it?',
        'If I have 30 whistles, what does the wisp ask for once I can speak to it?',
        'Assuming I already have the notebook, what does the wisp ask for once I can speak to it?'
    ]){
        const {assistant,source}=fixture('ultima7');const reply=await assistant.answerAsync(text);
        assert.notEqual(reply.decision,'answer',text);noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('A parent answer preserves the child for her-mother references and keeps dialogue wording separate from next contact',async()=>{
    const {assistant,source}=fixture('ultima6');
    const first=await assistant.answerAsync('Where do I meet Ariana about the rune, and whose approval does she need?');assert.equal(first.decision,'answer',first.text);
    const permission=await assistant.answerAsync('Okay, where do I find her mother and what do I say to get that approval?');
    assert.equal(permission.decision,'answer',permission.text);for(const term of['Blue Boar Tavern','RUNE','PERMISSION','YES'])assert.ok(permission.text.includes(term));
    const next=await assistant.answerAsync('Who do I go back to?');assert.equal(next.decision,'answer',next.text);assert.match(next.text,/Ariana/);assert.match(next.text,/confirm permission/);
    for(const reply of[first,permission,next])noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('A documented map category with named qualifiers survives a passive destination question',async()=>{
    const {assistant,source}=fixture('starcraft');
    const folder=await assistant.answerAsync("I'm following the integrated BWAPI map option for Remastered. Where does the downloaded ZIP need to be extracted?");
    assert.equal(folder.decision,'answer',folder.text);assert.match(folder.text,/maps folder/);assert.match(folder.text,/typically/);
    const menu=await assistant.answerAsync('And which menu do I use to open it?');assert.equal(menu.decision,'answer',menu.text);assert.match(menu.text,/Single Player.*Custom Game/);
    for(const reply of[folder,menu])noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    const bad=fixture('starcraft');
    assert.notEqual((await bad.assistant.answerAsync("I'm following the working integrated BWAPI map option for Remastered. Where does the downloaded ZIP need to be extracted?")).decision,'answer');bad.assistant.destroy();
});

test('Question-template aliases cannot replace the active map with a generic options comparison',async()=>{
    const {assistant,source}=fixture('starcraft');
    const folder=await assistant.answerAsync("I'm following the integrated BWAPI map option for Remastered. Where does the downloaded ZIP need to be extracted?");assert.equal(folder.decision,'answer',folder.text);
    const menu=await assistant.answerAsync('And which menu do I use to open it?');assert.equal(menu.decision,'answer',menu.text);
    const mode=await assistant.answerAsync('What Game Type should I choose?');assert.equal(mode.decision,'answer',mode.text);
    assert.match(mode.text,/MUST select "Use Map Settings"/);assert.match(mode.text,/standard Melee/);
    assert.ok(mode.knowledge.factIds.includes('starcraft:knowledge:map-game-type'));
    const both=await assistant.answerAsync('For that map, which game type do I choose, and why does Melee fail?');
    assert.equal(both.decision,'answer',both.text);assert.match(both.text,/Use Map Settings/);assert.match(both.text,/standard Melee/);
    noEffects(mode);noEffects(both);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('A conditional handover asks for the sourced inventory rule without establishing item ownership',async()=>{
    const {assistant,source}=fixture('ultima5');
    const schedule=await assistant.answerAsync('I want the Grapple. Where can I find Lord Michael during the day, and where does he retire?');
    assert.equal(schedule.decision,'answer',schedule.text);
    const topic=await assistant.answerAsync('And what should I actually ask him about?');
    assert.equal(topic.decision,'answer',topic.text);assert.match(topic.text,/GRAPPLE/);
    const reply=await assistant.answerAsync('Once he hands it over, where should I keep the hook?');
    assert.equal(reply.decision,'answer',reply.text);assert.match(reply.text,/active party’s inventory/);noEffects(reply);assert.equal(source.inspect().claimCount,0);
    assert.notEqual((await assistant.answerAsync('Have I already got the Grapple?')).decision,'answer');assistant.destroy();
});

test('Each Shadowlord keeps its own shard in generic use follow-ups',async()=>{
    for(const [name,shard,flame] of [['Faulinei','Falsehood','Truth'],['Astaroth','Hatred','Love'],['Nosfentor','Cowardice','Courage']]){
        const {assistant,source}=fixture('ultima5');
        await assistant.answerAsync(`Which Shadowlord is ${name}?`);
        const summon=await assistant.answerAsync('How do I call him out?');assert.equal(summon.decision,'answer',summon.text);assert.ok(summon.text.includes(`Flame of ${flame}`));
        const use=await assistant.answerAsync('When do I use the shard?');assert.equal(use.decision,'answer',use.text);
        assert.ok(use.text.includes(`Shard of ${shard}`),use.text);assert.ok(use.text.includes(name));assert.match(use.text,/one turn/);
        for(const other of ['Falsehood','Hatred','Cowardice'].filter(s=>s!==shard))assert.ok(!use.text.includes(`Shard of ${other}`),use.text);
        noEffects(use);assert.equal(source.inspect().claimCount,0);
        await assistant.answerAsync('Who is quantum turnip?');assert.notEqual((await assistant.answerAsync('When do I use the shard?')).decision,'answer');assistant.destroy();
    }
});
