import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords,u7} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url)));
test('the ordered crystal dialogue retains the frozen parent and cites its exact whole walkthrough child',async()=>{
    const manifest=read('../../data/assistant/knowledge/ultima7.json');
    const original=manifest.facts.find(f=>f.id==='orrery-crystal');
    assert.equal(original.source.locator,'DB.sideQuests[10]');
    assert.equal(original.witness,u7.DB.sideQuests[10].walkthrough);
    const knowledge=buildKnowledge('ultima7',allRecords.ultima7,manifest);
    assert.deepEqual(knowledge.issues,[]);
    const assistant=createConversationAssistant({gameId:'ultima7',records:knowledge.records,knowledge,
        assistant:createAssistant({gameId:'ultima7',records:knowledge.sourceRecords,fallback:null}),
        classify:async()=>[],encode:async()=>{throw Error('Encoder explicitly unavailable');}});
    try{
        const dialogue=read('./knowledge-source-first-96-20261025.json').dialogues.find(d=>d.id==='fresh-u7-brion-crystal-transaction');
        for(const [index,turn] of dialogue.turns.entries()){
            const reply=await assistant.answerAsync(turn.text);
            assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);
            if(index<2){
                assert.equal(reply.decision,'answer');assert.ok(reply.text.includes(original.witness));
                for(const locator of ['DB.sideQuests[10]','DB.sideQuests[10].walkthrough'])
                    assert.ok(reply.sources.some(s=>s.file==='guides/js/Ultima7.js'&&s.locator===locator),locator);
            }else if(index===2){
                assert.equal(reply.decision,'answer');
                assert.deepEqual(reply.sources.map(s=>s.locator),['DB.sideQuests[10].reward']);
            }else assert.notEqual(reply.decision,'answer');
        }
    }finally{assistant.destroy();}
});
