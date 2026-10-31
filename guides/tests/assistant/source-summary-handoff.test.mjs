// Source-proof and ledger tests; inference is explicitly unavailable. Native
// MiniLM/production browser acceptance is measured independently.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {selectSourceNarrativeAnswer,validateSourceNarrativeReply} from '../../js/assistant/source-narrative-answer.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const records=read('./evidence/conversation-starcraft-source-records.json');
const oracle=read('./cua-semantic-smoke-13.json').oracles.starcraft;
const eligible=()=>true;
const select=(text=oracle.question,options={})=>selectSourceNarrativeAnswer({text,records,ceiling:'direct',isEligible:eligible,...options});
function fixture(){const knowledge=buildKnowledge('starcraft',structuredClone(records),read('../../data/assistant/knowledge/starcraft.json'));
 assert.deepEqual(knowledge.issues,[]);let classifyCalls=0;
 const assistant=createConversationAssistant({gameId:'starcraft',records:knowledge.records,knowledge,
  assistant:createAssistant({gameId:'starcraft',records:knowledge.sourceRecords,fallback:null}),
  classify:async()=>{classifyCalls++;return [];},encode:async()=>{throw Error('Encoder explicitly unavailable');}});
 return {assistant,calls:()=>classifyCalls};}
const assertSummary=reply=>{
 assert.equal(reply.decision,'answer',reply.text);assert.deepEqual(reply.recordIds,[oracle.recordId]);
 for(const value of oracle.expected.contains)assert.ok(reply.text.includes(value),reply.text);
 for(const claim of oracle.sourceWitness.source.claims){assert.ok(reply.text.includes(claim.text));
  assert.ok(reply.sources.some(s=>s.file===claim.source.file&&(s.locator===claim.source.locator
   ||s.claims?.some(c=>c.text===claim.text&&c.source.file===claim.source.file&&c.source.locator===claim.source.locator))));}
 assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);
};

test('An indexed summary selects and validates both complete original source passages',()=>{
 const selection=select();assert.ok(selection);assert.equal(selection.record.id,oracle.recordId);
 assert.equal(selection.request.aspect,'summary');assert.equal(selection.claims.length,2);
 const source=createAssistant({gameId:'starcraft',records,fallback:null});
 const reply=source.answer(oracle.question,{fullAnswersOnly:true,tone:'commander'});assertSummary(reply);
 assert.equal(validateSourceNarrativeReply(selection,reply,{isEligible:eligible}),true);
});

test('The real source wrapper retains the full summary and both citations through the original smaller-hint turn',async()=>{
 const f=fixture();try{
  const first=await f.assistant.answerAsync(oracle.question);assertSummary(first);
  assert.equal(f.calls(),0,'Exact indexed source handoff must not need a guessed model label');
  const second=await f.assistant.answerAsync('smaller hint');assertSummary(second);
  assert.equal(second.text,first.text);assert.deepEqual(second.sources,first.sources);
 }finally{f.assistant.destroy();}
});

test('Fresh unknown subjects and unsupported summary restrictions cannot borrow the indexed record',async()=>{
 for(const q of ['Summarize QuantumSCHNAIL','Summarize SCHNAIL killed','Summarize SCHNAIL without internet',
  'Summarize SCHNAIL on Mars','Summarize SCHNAIL in the 2026 remaster edition',
  'Summarize two SCHNAIL clients']){
  assert.equal(select(q),null,q);const f=fixture();try{assert.notEqual((await f.assistant.answerAsync(q)).decision,'answer',q);}
  finally{f.assistant.destroy();}
 }
 for(const q of ['Why was SCHNAIL killed?','What is the method for SCHNAIL?'])assert.equal(select(q),null,q);
 assert.equal(select(oracle.question,{ceiling:'balanced'}),null);
 assert.equal(select(oracle.question,{isEligible:()=>false}),null);
});

test('A summary cannot hide modeled conditions, edition constraints or a competing matching record',()=>{
 for(const modify of [r=>{r.requires={fact:'invented-condition'};},r=>{r.editions=['classic'];}]){
  const changed=structuredClone(records);modify(changed.find(r=>r.id===oracle.recordId));
  assert.equal(select(oracle.question,{records:changed}),null);
 }
 const duplicate=structuredClone(records.find(r=>r.id===oracle.recordId));duplicate.id+='-duplicate';
 assert.equal(select(oracle.question,{records:[...records,duplicate]}),null);
});

test('Causal handoff requires the authored predicate or reviewed alias, not just the named topic',()=>{
 for(const q of ['Why does the first launch take some time?', 'Why is SCHNAIL slow the first time?']){
  const selection=select(q);assert.equal(selection?.record.id,'starcraft:narrative:schnail-first-launch-cause:cause',q);
  const reply=createAssistant({gameId:'starcraft',records,fallback:null}).answer(q,{fullAnswersOnly:true});
  assert.equal(validateSourceNarrativeReply(selection,reply,{isEligible:eligible}),true,q);
 }
 for(const q of ['Why was SCHNAIL killed?', 'Why does the first launch kill game files?',
  'Why does the first launch not take some time?'])assert.equal(select(q),null,q);
});

test('The whole summary template rejects a missing second passage, missing citation, extra claim or forged header',()=>{
 const selection=select();assert.ok(selection);const source=createAssistant({gameId:'starcraft',records,fallback:null});
 const reply=source.answer(oracle.question,{fullAnswersOnly:true});
 const note=selection.claims[1].text;
 for(const changed of [
  {...reply,text:reply.text.replace(note,'')},{...reply,sources:[]},
  {...reply,sources:reply.sources.map(s=>({...s,claims:s.claims.slice(0,1)}))},
  {...reply,sources:reply.sources.map(s=>({...s,claims:[...s.claims].reverse()}))},
  {...reply,sources:reply.sources.map(s=>({...s,claims:s.claims.map((c,i)=>i?{...c,text:'Invented claim'}:c)}))},
  {...reply,text:reply.text+' SCHNAIL learns from every player.'},
  {...reply,text:reply.text.replace(' — Summary:',' — Guaranteed result:')},
  {...reply,sources:[...reply.sources,{file:'unreviewed.js',locator:'invented',review:'extracted'}]},
  {...reply,fallbackOrigin:'model'}
 ])assert.equal(validateSourceNarrativeReply(selection,changed,{isEligible:eligible}),false);
});
