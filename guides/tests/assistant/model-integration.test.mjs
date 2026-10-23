import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {createAssistant} from '../../js/assistant/engine.js';
import {readChoice,saveChoice,CONSENT_KEY} from '../../js/assistant/consent.js';
import {createModelRuntime} from '../../js/assistant/model-runtime.js';
const sc=JSON.parse(fs.readFileSync(new URL('./fallback-pilot/evidence/starcraft-records.json',import.meta.url)));
const cases={albion:['What does the Dreamshield do?','Why does it work that way?','Sleep Spores'],ultima5:['Who is Saduj?','Why is he a spy?','spy for Blackthorn'],ultima6:['Who is Arianna?','Why is she cute?','short hair'],ultima7:['Who is Spark?','Why does he learn so quickly?','double rate'],alqadim:['What does the Ship Orb do?','How does it actually power the ship?','corsair ship'],starcraft:['What is SCHNAIL?','Why is it called that?','Automatic updates']};
const ready=(generate=async p=>p.guard.frames[0])=>({state:{status:'ready'},epoch:1,generate});
for(const [game,[seed,q,quote]]of Object.entries(cases))test(`${game}: actual records, supported engine first and guarded fallback second`,async()=>{
 let calls=0;const r=ready(async p=>{calls++;return p.guard.frames[1];});
 const a=createAssistant({gameId:game,records:game==='starcraft'?sc:allRecords[game],fallback:r});
 assert.equal((await a.answerAsync(seed,{spoiler:'direct'})).decision,'answer');assert.equal(calls,0);
 const reply=await a.answerAsync(q,{spoiler:'direct'});
 assert.equal(calls,1);assert.equal(reply.fallbackOrigin,'model-framing');assert.ok(reply.text.includes(quote));
 assert.ok(reply.sources.length);assert.deepEqual(reply.stateChanges,[]);assert.equal(a.inspect().claimCount,0);
});
function seer(fallback=ready()) {return createAssistant({gameId:'ultima6',records:allRecords.ultima6,fallback});}
test('invalid model prose is entirely replaced, even after an approved frame',async()=>{
 const a=seer(ready(async p=>p.guard.frames[0]+' She has blue eyes and wears a cotton dress.'));
 a.answer('Who is Arianna?',{spoiler:'direct'});
 const r=await a.answerAsync('Why is she cute?',{spoiler:'direct'});
 assert.equal(r.fallbackOrigin,'program-fallback');assert.match(r.text,/sourced explanation/);assert.doesNotMatch(r.text,/blue eyes|cotton dress/);
});
test('model runtime errors return the approved default, never an invented answer',async()=>{
 const a=seer(ready(async()=>{throw Error('device error');}));a.answer('Who is Ariana?',{spoiler:'direct'});
 assert.equal((await a.answerAsync('Why is she cute?',{spoiler:'direct'})).fallbackOrigin,'program-fallback');
});
test('a second follow-up retains program-selected context without model-written facts becoming evidence',async()=>{
 const a=seer();a.answer('Who is Ariana?',{spoiler:'direct'});
 await a.answerAsync('Why is she cute?',{spoiler:'direct'});
 const r=await a.answerAsync('What colour are her eyes?',{spoiler:'direct'});
 assert.equal(r.fallbackOrigin,'model-framing');assert.match(r.text,/sourced answer to that detail/);assert.equal(a.inspect().claimCount,0);
});
for(const action of ['lower','reset','topic','disable'])test(`${action} during generation cannot insert stale source text`,async()=>{
 let resolve;const f=ready(()=>new Promise(r=>{resolve=r;}));const a=seer(f);a.answer('Who is Ariana?',{spoiler:'direct'});
 const pending=a.answerAsync('Why is she cute?',{spoiler:'direct'});
 assert.equal(a.getHistory().at(-1).decision,'pending');
 if(action==='lower')a.setPolicy('gentle');if(action==='reset')a.resetTopic();if(action==='topic')a.activate('elsewhere');if(action==='disable'){f.state.status='off';f.epoch++;}
 resolve("I don't have a sourced explanation for that here.");const r=await pending;
 assert.equal(r.decision,'stale');assert.ok(a.getHistory().every(m=>!m.text.includes('Related guide text')));
 if(action==='lower')assert.ok(a.getHistory().every(m=>!m.text.includes('Ariana')));
});
test('returning to an old context cannot revive its old subject',async()=>{
 const a=seer();a.answer('Who is Ariana?',{spoiler:'direct',contextId:'one'});a.activate('two');a.activate('one');
 assert.equal((await a.answerAsync('Why is she cute?',{spoiler:'direct',contextId:'one'})).fallbackOrigin,undefined);
});
test('unknown newer subjects do not revive the old Ariana context',async()=>{
 const a=seer();a.answer('Who is Ariana?',{spoiler:'direct'});await a.answerAsync('Who is Zorvax Phantom?',{spoiler:'direct'});
 assert.equal((await a.answerAsync('Why is she cute?',{spoiler:'direct'})).fallbackOrigin,undefined);
});
test('hidden and absent records have the same asynchronous reply',async()=>{
 const a=seer(),b=createAssistant({gameId:'ultima6',records:[],fallback:ready()});
 assert.deepEqual(await a.answerAsync('Why is Ariana cute?',{spoiler:'gentle'}),await b.answerAsync('Why is Ariana cute?',{spoiler:'gentle'}));
});
test('no model calls without ready/consented runtime',async()=>{
 let calls=0;const a=seer({state:{status:'off'},epoch:0,generate(){calls++;throw Error();}});
 a.answer('Who is Ariana?',{spoiler:'direct'});await a.answerAsync('Why is she cute?',{spoiler:'direct'});assert.equal(calls,0);
});
test('guide-only, inherited restrictions, editions and multipart questions retain the core reply',async()=>{
 for(const [seed,q]of [['Who is Ariana on Mars?','Why?'],['Who is Ariana?','Using only the guide, why is she cute?'],['Who is Ariana?','Why is she cute in the SNES version?'],['Who is Ariana?','Why is she cute? Where is Iolo?']]){
  let calls=0;const a=seer(ready(async p=>{calls++;return p.guard.frames[0];}));a.answer(seed,{spoiler:'direct'});
  await a.answerAsync(q,{spoiler:'direct'});assert.equal(calls,0,q);
 }
});
test('consent persists only its own key and re-asks for a new model only when enabled',()=>{
 const values=new Map([['ultima6-progress','untouched']]);const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 assert.equal(readChoice(storage,'one'),null);assert.ok(saveChoice(storage,'enabled','one'));assert.equal(readChoice(storage,'one'),'enabled');assert.equal(readChoice(storage,'two'),null);
 saveChoice(storage,'off','one');assert.equal(readChoice(storage,'two'),'off');saveChoice(storage,null,'one');assert.ok(!values.has(CONSENT_KEY));assert.equal(values.get('ultima6-progress'),'untouched');
});
test('malformed or blocked preference storage fails without enabling anything',()=>{
 assert.equal(readChoice({getItem:()=>'{bad'},'one'),null);assert.equal(readChoice(null,'one'),null);assert.equal(saveChoice(null,'enabled','one'),false);
});
class FixtureWorker {
 constructor(){this.stopped=false;this.messages=[];}
 postMessage(data){this.messages.push(data);if(data.type==='load')queueMicrotask(()=>this.onmessage?.({data:{type:'ready',persisted:true}}));}
 terminate(){this.stopped=true;}
}
test('runtime starts once, correlates replies and terminates/rejects outstanding work on disable',async()=>{
 let worker,created=0;const r=createModelRuntime({fetchProfile:async()=>({id:'one',totalBytes:1}),workerFactory:()=>{created++;return worker=new FixtureWorker();}});
 await Promise.all([r.start(),r.start()]);assert.equal(created,1);assert.equal(r.state.status,'ready');
 const pending=r.generate({guard:{kind:'reason'},messages:[]});const job=worker.messages.at(-1);
 worker.onmessage({data:{type:'result',id:job.id,text:'approved'}});assert.equal(await pending,'approved');
 const another=r.generate({guard:{kind:'detail'},messages:[]});const rejection=assert.rejects(another,/disabled/);r.stop();await rejection;assert.ok(worker.stopped);assert.equal(r.state.status,'off');
});
test('a pending initial download cannot start a worker after consent is revoked',async()=>{
 let resolve,created=0;const r=createModelRuntime({fetchProfile:()=>new Promise(f=>{resolve=f;}),workerFactory:()=>{created++;return new FixtureWorker();}});
 const starting=r.start();const rejection=assert.rejects(starting,/disabled/);r.stop();resolve({id:'one',totalBytes:1});await rejection;await new Promise(f=>setTimeout(f,0));assert.equal(created,0);
});
test('failed profile read can be retried',async()=>{
 let count=0;const r=createModelRuntime({fetchProfile:async()=>{if(!count++)throw Error('missing');return{id:'one',totalBytes:1};},workerFactory:()=>new FixtureWorker()});
 await assert.rejects(r.start());assert.equal(r.state.status,'error');await r.start();assert.equal(r.state.status,'ready');r.stop();
});
test('unsupported historical-event presuppositions and their short follow-ups keep core declines',async()=>{
 for(const [game,q]of [['ultima7','Why was Inamo killed?'],['alqadim','Why did Zubin betray the family?']]){
  let calls=0;const a=createAssistant({gameId:game,records:allRecords[game],fallback:ready(async p=>{calls++;return p.guard.frames[0];})});
  const r=await a.answerAsync(q,{spoiler:'direct'});assert.equal(r.fallbackOrigin,undefined);assert.equal(calls,0);
  const follow=await a.answerAsync('Why?',{spoiler:'direct'});assert.equal(follow.fallbackOrigin,undefined);assert.equal(calls,0);
 }
});
