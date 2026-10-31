import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant,createInterpreter} from '../../js/assistant/dialogue.js';
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url)));
function fixture(options={}){const knowledge=buildKnowledge('albion',allRecords.albion,read('../../data/assistant/knowledge/albion.json'));
    return createConversationAssistant({gameId:'albion',records:knowledge.records,knowledge,
        assistant:createAssistant({gameId:'albion',records:knowledge.sourceRecords,fallback:null}),
        classify:async()=>[],encode:async()=>{throw Error('Encoder explicitly unavailable');},...options});}
test('And plus a complete new name carries the last source-proved relationship through the original dialogue',async()=>{
    const assistant=fixture();
    try{for(const turn of read('./knowledge/albion-cases.json').dialogues.find(d=>d.id==='rifrako-utilities').turns){
        const reply=await assistant.answerAsync(turn.text);
        assert.equal(reply.decision,'answer',reply.text);
        for(const value of turn.expected.contains)assert.ok(reply.text.includes(value),reply.text);
        const sources=[turn.expected,...(turn.expected.alternativeAnswers || [])].map(branch=>branch.source).filter(Boolean);
        assert.ok(sources.some(source=>reply.sources.some(actual=>actual.file===source.file&&actual.locator===source.locator)));
        assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);
    }}finally{assistant.destroy();}
});

test('source-relation ellipsis does not survive reset, context change, decline, pending typo or abstainAll',async()=>{
    for(const next of ['reset','context','decline','pending','abstainAll']){
        const assistant=fixture(next==='abstainAll'?{thresholds:{abstainAll:true}}:{});
        try{
            assert.equal((await assistant.answerAsync('Where is Rifrako?')).decision,'answer');
            if(next==='reset')assistant.resetTopic();
            if(next==='decline')assert.notEqual((await assistant.answerAsync('Where is Rifrako on Mars?')).decision,'answer');
            if(next==='pending')await assistant.answerAsync('Where is Rifrak?');
            const reply=await assistant.answerAsync('And Dreamshield?',next==='context'?{contextId:'another'}:{});
            assert.notEqual(reply.decision,'answer',next);
        }finally{assistant.destroy();}
    }
});

test('a directed provider question cannot seed a different generic relationship for a new item',async()=>{
    const assistant=fixture();
    try{
        await assistant.answerAsync('Who sells Monster Eye?');
        assert.equal(assistant.inspect().conversation.interpreter.frame?.verifiedRelation,undefined);
        assert.notEqual((await assistant.answerAsync('And Dreamshield?')).decision,'answer');
    }finally{assistant.destroy();}
});

test('only a complete new exact name inherits the source-proved field; no prior proof supplies none',async()=>{
    const fresh=fixture();
    try{assert.notEqual((await fresh.answerAsync('And Dreamshield?')).decision,'answer');}
    finally{fresh.destroy();}
    for(const name of ['Dreamshild','Dreamshield near Rifrako','Dreamshield without coins']){
        const assistant=fixture();
        try{await assistant.answerAsync('Where is Rifrako?');
            assert.notEqual((await assistant.answerAsync(`And ${name}?`)).decision,'answer',name);
        }finally{assistant.destroy();}
    }
});

test('a high model label can interpret a relationship but cannot prove its use by a later named ellipsis',async()=>{
    // Structural confidence stub, not native model acceptance evidence.
    const interpreter=createInterpreter({gameId:'albion',records:allRecords.albion,
        classify:async()=>[{label:'location',score:0.9},{label:'unknown',score:0.1}]});
    assert.equal((await interpreter.interpret('Where is Rifrako?')).status,'ready');
    assert.equal(interpreter.getState().frame.verifiedRelation,undefined);
    const next=await interpreter.interpret('And Dreamshield?');
    assert.equal(next.blockReplay,true);
    assert.equal(next.canonicalQuestion,undefined);
});
test('an unsupported new subject or modifier cannot inherit the previous proved location',async()=>{
    for(const text of ['And radioactive Dreamshield?','And Dreamshield in the 2026 edition?','And Quantumshield?']){
        const assistant=fixture();
        try{await assistant.answerAsync('Where is Rifrako?');const reply=await assistant.answerAsync(text);
            assert.notEqual(reply.decision,'answer',text);
        }finally{assistant.destroy();}
    }
});
