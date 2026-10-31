import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge,createKnowledgeRouter} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {parseSourceRequestFrame as parse} from '../../js/assistant/request-frame.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const build=()=>buildKnowledge('albion',allRecords.albion,read('../../data/assistant/knowledge/albion.json'));
function fixture(){const knowledge=build();assert.deepEqual(knowledge.issues,[]);
 const assistant=createConversationAssistant({gameId:'albion',records:knowledge.records,knowledge,
  assistant:createAssistant({gameId:'albion',records:knowledge.sourceRecords,fallback:null}),
  classify:async()=>[],encode:async()=>{throw Error('Encoder explicitly unavailable');}});
 return {knowledge,assistant,ask:async q=>{const r=await assistant.answerAsync(q);assert.deepEqual(r.actions,[]);assert.deepEqual(r.stateChanges,[]);return r;}};}
const first='How do I get Porenoil?',follow='What does it prevent?';
const packet={entityId:'albion:objective:umajo:porenoil',restrictions:{guideOnly:false,editions:[]}};

test('A delegated complete original reply can establish its exact source alias without proving acquisition or a vendor',()=>{
 const knowledge=build(),source=createAssistant({gameId:'albion',records:knowledge.sourceRecords,fallback:null}),router=createKnowledgeRouter(knowledge);router.reset();
 const reply=source.answer(first,{spoiler:'direct'});assert.equal(reply.decision,'answer');
 router.observe(reply,packet,first);
 assert.equal(router.inspect().focus,packet.entityId);assert.equal(router.inspect().lastFact,'porenoil');
 const answer=router.planFrame(follow,{}, {afterSource:true,preferExisting:false});
 assert.equal(answer?.decision,'answer');
 assert.equal(answer.text,knowledge.facts.find(f=>f.id==='porenoil').text);
 assert.equal(knowledge.facts.find(f=>f.id==='porenoil').answerRelations.includes('acquisition'),false);
});

test('Source alias establishment rejects partial, uncited, generated, unrelated and wrong-owner evidence',()=>{
 for(const modify of [
  r=>({...r,text:'Ask about Porenoil.'}),r=>({...r,sources:[]}),r=>({...r,fallbackOrigin:'model'}),
  r=>({...r,recordIds:['albion:character:harriet:explanation']})
 ]){
  const knowledge=build(),source=createAssistant({gameId:'albion',records:knowledge.sourceRecords,fallback:null}),router=createKnowledgeRouter(knowledge);router.reset();
  router.observe(modify(source.answer(first,{spoiler:'direct'})),packet,first);
  assert.equal(router.inspect().lastFact,null);
 }
 for(const [owner,q] of [[packet.entityId,'How do I get QuantumOil?'],[packet.entityId,'How do I get fake Porenoil?'],['albion:character:harriet',first]]){
  const knowledge=build(),source=createAssistant({gameId:'albion',records:knowledge.sourceRecords,fallback:null}),router=createKnowledgeRouter(knowledge);router.reset();
  router.observe(source.answer(first,{spoiler:'direct'}),{...packet,entityId:owner},q);
  assert.equal(router.inspect().lastFact,null);
 }
});

test('Practical importance requests an explicit purpose, preserving referent and every limitation',()=>{
 const frame=parse('Why is she important?');assert.equal(frame.subjectText,'she');
 assert.equal(frame.fields[0].key,'use');assert.deepEqual(frame.fields[0].selectors,['purpose']);
 assert.equal(frame.fields[0].requiresExplicitField,true);
 const restricted=parse('Why is Harriet important for opening locked doors?');
 assert.ok(restricted.fields[0].unknownQualifierTexts.includes('for opening locked doors'));
 assert.equal(parse('Why is Harriet evil?').fields[0].key,'cause');
});

test('The complete original Harriet dialogue supplies the practical purpose without asserting current party state',async()=>{
 const f=fixture();try{
  const turns=read('./knowledge/albion-cases.json').dialogues.find(d=>d.id==='harriet-travel').turns;
  for(const [i,t] of turns.entries()){
   const r=await f.ask(t.text);
   if(i===3){assert.notEqual(r.decision,'answer');continue;}
   assert.equal(r.decision,'answer',r.text);for(const word of t.expected.contains)assert.ok(r.text.includes(word),r.text);
   const fact=f.knowledge.facts.find(f=>f.id===t.expected.factIds[0]);
   assert.ok(r.text.includes(fact.text));assert.ok(r.sources.some(s=>s.file===fact.source.file&&s.locator===fact.source.locator));
  }
 }finally{f.assistant.destroy();}
});

test('Unproved practical purposes, unrelated people, editions and ungrounded references stay unsupported',async()=>{
 for(const q of ['Why is she important?','Why is Harriet important for opening locked doors?',
  'Why is Rainer important?','Why is Harriet important in the 2026 remaster edition?',
  'Why is Harriet evil?','Who sells Porenoil?']){
  const f=fixture();try{assert.notEqual((await f.ask(q)).decision,'answer',q);}finally{f.assistant.destroy();}
 }
});

test('Navigate is a procedure verb, never a source name or evidence for its unknown suffix',()=>{
 const frame=parse('How do I navigate the pirate maze?');assert.equal(frame.subjectText,'the pirate maze');
 assert.equal(frame.fields[0].key,'method');assert.deepEqual(frame.fields[0].selectors,['step']);
 assert.equal(frame.fields[0].phase,undefined);
 assert.ok(parse('How do I navigate the radioactive maze without the map?').subjectText.includes('without the map'));
});
