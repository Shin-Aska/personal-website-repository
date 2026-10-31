import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url)));
const records=read('./evidence/conversation-starcraft-source-records.json');
const manifest=read('../../data/assistant/knowledge/starcraft.json');
function fixture(){
    const knowledge=buildKnowledge('starcraft',records,manifest);
    assert.deepEqual(knowledge.issues,[]);
    return createConversationAssistant({gameId:'starcraft',records:knowledge.records,knowledge,
        assistant:createAssistant({gameId:'starcraft',records:knowledge.sourceRecords,fallback:null}),
        classify:async()=>[],encode:async()=>{throw Error('Encoder explicitly unavailable');}});
}

test('the ordered guide-learning dialogue quotes guide attribution rather than outside-research authorship',async()=>{
    const assistant=fixture();
    try{
        const dialogue=read('./knowledge-fresh-cases-20261025.json').dialogues.find(d=>d.id==='sc-bot-learning-resources');
        for(const [index,turn] of dialogue.turns.entries()){
            const reply=await assistant.answerAsync(turn.text);
            assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);
            if(index===1){
                assert.equal(reply.decision,'answer');
                assert.ok(reply.text.includes('UAlbertaBot; A Starcraft AI development framework by Dave Churchill and Steve Gelly; View on GitHub'));
                assert.doesNotMatch(reply.text,/Not in this guide|outside research/i);
                assert.ok(reply.sources.some(s=>s.file===turn.expected.source.file&&s.locator===turn.expected.source.locator));
                assert.ok(reply.sources.every(s=>s.review!=='external-research'));
            }
            if(index===3)assert.notEqual(reply.decision,'answer');
        }
    }finally{assistant.destroy();}
});

test('unknown authorship qualifiers and unrelated source claims cannot become guide attribution',async()=>{
    for(const q of ['Who does the guide credit with radioactive UAlbertaBot?',
        'Who does the guide credit with UAlbertaBot in the 2026 remaster edition?',
        'Who does the guide credit with UAlbertaBot after Steve Gelly left?',
        'Who does the guide credit with the Quantum Bot?']){
        const assistant=fixture();
        try{assert.notEqual((await assistant.answerAsync(q)).decision,'answer',q);}
        finally{assistant.destroy();}
    }
});
