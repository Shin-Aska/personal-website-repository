import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {parseNamedSourceFieldRequest as parse,supportsNamedSourceFieldRequest as supports} from '../../js/assistant/named-source-fields.js';

test('An exact internal identifier requires the named literal field rather than its narrative effect',()=>{
    const question='What exact internal flag stores the door state?';
    const source={file:'guide.js',locator:'fields[0]',review:'extracted'};
    const text='The flag door_open stores the door state.';
    const fact={id:'field',entityId:'door',text,witness:text,source,sourceRecordId:'original',answerRelations:['identity']};
    const context={fact,subjectEntityId:'door',sourceRecord:{id:'original',source,text},isEligible:()=>true};
    assert.equal(supports(parse(question),context),true);
    for(const value of ['The door opens when a party member falls.',
        'The flag door_open stores the gate state.',
        'The flag door_open might store the door state.',
        'Do not assume the flag door_open stores the door state.'])
        assert.equal(supports(parse(question),{...context,fact:{...fact,text:value,witness:value},sourceRecord:{...context.sourceRecord,text:value}}),false);
    assert.equal(supports(parse('What exact internal flag stores its door state?'),context),false);
    assert.equal(supports(parse(question),{...context,isEligible:()=>false}),false);
});

for(const asynchronous of [false,true])test(`Housing control cannot answer an undocumented ending identifier (${asynchronous?'async':'sync'})`,async()=>{
    const records=allRecords.albion;
    const manifest=JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/albion.json',import.meta.url)));
    const knowledge=buildKnowledge('albion',records,manifest),engine=createAssistant({gameId:'albion',records,fallback:null});
    const assistant=createConversationAssistant({gameId:'albion',records,knowledge,assistant:engine,
        classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    const ask=q=>asynchronous?assistant.answerAsync(q):Promise.resolve(assistant.answer(q));
    try{
        if(asynchronous){await ask('What is AI Housing?');await ask('How do I fight it?');}
        assert.match((await ask(asynchronous?'What can hold it?':'What can hold AI Housing?')).text,/Thorn Snare can hold it/);
        for(const q of ['What exact hidden flag stores its ending trigger?',
            'What exact internal variable records its ending trigger?',
            'What exact save bit tracks its ending trigger on Mars?']){
            const answer=await ask(q);assert.notEqual(answer.decision,'answer',answer.text);
            assert.deepEqual(answer.actions,[]);assert.deepEqual(answer.stateChanges,[]);
        }
        assert.equal(engine.inspect().claimCount,0);
    }finally{assistant.destroy();}
});
