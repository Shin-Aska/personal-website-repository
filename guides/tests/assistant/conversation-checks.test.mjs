import assert from 'node:assert/strict';
import test from 'node:test';
import {allRecords} from './load-records.mjs';
import {createAssistant} from '../../js/assistant/engine.js';
import {authorize} from '../../js/assistant/policy.js';
import {checkConversationReply} from './conversation-checks.mjs';

const records=allRecords.ultima7;
const expected={decision:'answer',contains:['training points at double rate'],entityIds:['ultima7:companion:spark'],source:'guide',recordIds:['ultima7:companion:spark:explanation']};
const check=(r,e=expected)=>checkConversationReply(r,e,{records,spoiler:'direct',authorize});
const spark=()=>createAssistant({gameId:'ultima7',records}).answer('Who is Spark?',{spoiler:'direct'});
test('campaign checks require the factual record and its own authorized source',()=>{
 const reply=spark();assert.deepEqual(check(reply),[]);
 assert.ok(check({...reply,sources:[{file:'invented',locator:'invented',review:'extracted'}]}).some(s=>s.includes('does not belong')));
 assert.ok(check(reply,{...expected,recordIds:['ultima7:companion:iolo:explanation']}).includes('incorrect factual record selection'));
});
test('campaign checks preserve individually attributed declared disputed accounts',()=>{
 const reply=createAssistant({gameId:'ultima7',records}).answer('Why was Inamo killed?',{spoiler:'direct'});
 assert.deepEqual(check(reply,{decision:'answer',contains:['different accounts'],entityIds:['ultima7:npc:inamo'],source:'research'}),[]);
 const changed=structuredClone(reply);changed.sources[0].claims[0].text='Invented causal claim';
 assert.ok(check(changed,{decision:'answer',contains:[],entityIds:['ultima7:npc:inamo'],source:'research'}).some(s=>s.includes('does not belong')));
});
test('campaign checks cannot accept a single provenance class as mixed evidence',()=>{
 assert.ok(check(spark(),{...expected,source:'mixed'}).some(s=>s.includes('mixed answer')));
});
