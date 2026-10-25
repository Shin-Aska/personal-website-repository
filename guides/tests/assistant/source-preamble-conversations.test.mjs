import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {parse,sourceQuestionParts} from '../../js/assistant/language.js';

function fixture(game){
    const records=allRecords[game],manifest=JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url)));
    const knowledge=buildKnowledge(game,records,manifest);assert.deepEqual(knowledge.issues,[]);
    const source=createAssistant({gameId:game,records,fallback:null});
    return {source,assistant:createConversationAssistant({gameId:game,records,knowledge,assistant:source,
        classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}})};
}
const noEffects=reply=>{assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);};

test('A source-only positional and readiness preamble answers the task without recording either statement',async()=>{
    const {assistant,source}=fixture('alqadim');
    const question="I'm at Sinbar's academy and ready for the trial. How do I actually start it?";
    assert.equal(parse(question).parts[0].report,true);
    assert.equal(sourceQuestionParts(question).readOnlyContext,true);
    const start=await assistant.answerAsync(question);assert.equal(start.decision,'answer',start.text);
    assert.equal(start.text,'Speak with Master Sinbar to initiate the trial.');noEffects(start);
    const avoid=await assistant.answerAsync('That moving disintegrator field is catching me. What does the guide recommend for avoiding it?');
    assert.equal(avoid.decision,'answer',avoid.text);assert.match(avoid.text,/stay close to walls/);noEffects(avoid);
    for(const q of ['Am I ready for the trial?','Have I already initiated the trial?']){
        const reply=await assistant.answerAsync(q);assert.notEqual(reply.decision,'answer',q);noEffects(reply);
    }
    assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('Read-only position and difficulty frames preserve unknown subjects, modifiers, quantities and editions',async()=>{
    for(const q of [
        "I'm at quantum turnip's academy and ready for the trial. How do I actually start it?",
        "I'm at Sinbar's radioactive academy and ready for the trial. How do I actually start it?",
        "I'm at Sinbar's academy on Mars and ready for the trial. How do I actually start it?",
        "I'm at Sinbar's academy and ready for 30 trials. How do I actually start it?",
        "I'm at Sinbar's academy and ready for the next trial. How do I actually start it?",
        "I'm at Sinbar's academy and ready for the trial now. How do I actually start it?",
        "I'm at Sinbar's academy and ready for the trial in the SNES edition. How do I actually start it?",
        'That radioactive moving disintegrator field is catching me. What does the guide recommend for avoiding it?',
        'That moving disintegrator field is catching me. What does the original manual recommend for avoiding it?'
    ]){
        const {assistant,source}=fixture('alqadim');const reply=await assistant.answerAsync(q);
        assert.notEqual(reply.decision,'answer',q);noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('Failed how questions and positional contexts cannot revive an older source topic',async()=>{
    for(const question of ['How about quantum turnip?','How do I solve quantum turnip?',"I'm at quantum turnip's palace. How do I enter it?"]){
        const {assistant,source}=fixture('ultima5');
        await assistant.answerAsync('For the HMS Cape plans, how do I approach the shipwright building?');
        assert.notEqual((await assistant.answerAsync(question)).decision,'answer');
        const reply=await assistant.answerAsync('What about the locked doors inside—how do I get through them?');
        assert.notEqual(reply.decision,'answer',question);noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('Sync positional failures stay on the source-only path, including multipart requests',()=>{
    const {assistant,source}=fixture('alqadim');let calls=0;
    const original=source.answer;source.answer=(...args)=>{calls++;return original(...args);};
    for(const q of ["I'm at Sinbar's academy and ready for the trial. How do I actually start it?",
        "I'm at quantum turnip's academy. How do I start the trial?",
        "I'm at Sinbar's academy. How do I start the trial, and how old is Sinbar?"]){
        const reply=assistant.answer(q);noEffects(reply);
    }
    assert.equal(calls,0);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('An explicit requested field in a follow-up remains a question rather than a subject preamble',()=>{
    const frame=sourceQuestionParts('What about its damage? Where do I find it?');
    assert.equal(frame.context,'');assert.equal(frame.questions.length,2);
});

test('Progress, possession and state requests cannot become positional source framing',()=>{
    for(const q of [
        'I have completed the trial. How do I start it?',
        'I have the Ship Orb. Where is it?',
        "I'm at the academy and I have completed the trial. How do I start it?",
        "I'm at the academy. Have I completed the trial?",
        "I'm at the academy and ready for the trial. Am I ready?"
    ])assert.equal(sourceQuestionParts(q),null,q);
});

test('The Ship Orb helm instruction cites its independent same-item location without inventing a combined sentence',async()=>{
    const {assistant,source}=fixture('alqadim');
    const reply=await assistant.answerAsync("I'm searching the wrecked ship for the Ship Orb. Which part should I search?");
    assert.equal(reply.decision,'answer',reply.text);
    assert.equal(reply.text,"Retrieve the Ship Orb from the helm cabin.\nShip Orb: Deadman's Reef (Wrecked Ship).");
    assert.deepEqual(new Set(reply.sources.map(s=>s.locator)),new Set(['DB.chapters[3].required[id=ch4_5]','DB.keyItems[5].location']));
    const use=await assistant.answerAsync('What is it actually for?');assert.equal(use.decision,'answer',use.text);
    assert.match(use.text,/Powers and restores the corsair ship for navigation/);
    noEffects(reply);noEffects(use);assert.equal(source.inspect().claimCount,0);
    const state=await assistant.answerAsync('Is the Ship Orb already in my inventory?');assert.notEqual(state.decision,'answer');noEffects(state);assistant.destroy();
});

test('A prerequisite phrased as waiting for remains separate from an item purpose question',async()=>{
    const {assistant,source}=fixture('ultima6');
    const need=await assistant.answerAsync('Ariana will not hand over the Compassion rune. What is she waiting for?');
    assert.equal(need.decision,'answer',need.text);assert.match(need.text,/mother Anya's permission/);
    const permission=await assistant.answerAsync('How do I get her mother to agree?');assert.equal(permission.decision,'answer',permission.text);assert.match(permission.text,/Blue Boar/);
    const back=await assistant.answerAsync('Then who do I go back to?');assert.equal(back.decision,'answer',back.text);assert.match(back.text,/Return to Ariana/);
    for(const reply of [need,permission,back])noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('Same-item contextual location does not relax other requested fields or unsupported qualifiers',async()=>{
    for(const q of [
        "I'm searching the radioactive wrecked ship for the Ship Orb. Which part should I search?",
        "I'm searching the wrecked ship on Mars for the Ship Orb. Which part should I search?",
        "I'm searching the wrecked ship for the Ship Orb. Which part causes damage?",
        "I'm searching the wrecked ship for the Ship Orb. How many helm cabins are there?",
        "I'm searching the wrecked ship for the Ship Orb. What is the helm cabin made of?"
    ]){
        const {assistant,source}=fixture('alqadim');const reply=await assistant.answerAsync(q);
        assert.notEqual(reply.decision,'answer',q);noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('A topic fragment retains the current objective and every door modifier',async()=>{
    const {assistant,source}=fixture('ultima5');
    await assistant.answerAsync('For the HMS Cape plans, how do I approach the shipwright building?');
    const doors=await assistant.answerAsync('What about the locked doors inside—how do I get through them?');
    assert.equal(doors.decision,'answer',doors.text);assert.match(doors.text,/eastern room/);assert.match(doors.text,/both ordinary locked doors with lockpicks/);
    const plans=await assistant.answerAsync('Where in that room should I search for the plans?');assert.equal(plans.decision,'answer',plans.text);assert.match(plans.text,/Search the drawers/);
    for(const reply of [doors,plans])noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    for(const seed of [null,'Who is quantum turnip?']){
        const next=fixture('ultima5');if(seed)await next.assistant.answerAsync(seed);
        assert.notEqual((await next.assistant.answerAsync('What about the locked doors inside—how do I get through them?')).decision,'answer');next.assistant.destroy();
    }
    const bad=fixture('ultima5');await bad.assistant.answerAsync('For the HMS Cape plans, how do I approach the shipwright building?');
    assert.notEqual((await bad.assistant.answerAsync('What about the radioactive locked doors inside—how do I get through them?')).decision,'answer');bad.assistant.destroy();
});
