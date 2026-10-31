import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge,createKnowledgeRouter} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {selectSourceConflictQuotation,sourceConflictQuotationReply,validateSourceConflictQuotationReply} from '../../js/assistant/source-conflict-quotation.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const build=()=>buildKnowledge('albion',structuredClone(allRecords.albion),read('../../data/assistant/knowledge/albion.json'));
const questions=[['xp-plate','How do I use the blue floor plate?'],['assassination-sequence','What is the Herras assassination sequence?']];
function fixture(){const knowledge=build();return {knowledge,assistant:createConversationAssistant({gameId:'albion',records:knowledge.records,knowledge,
 assistant:createAssistant({gameId:'albion',records:knowledge.sourceRecords,fallback:null}),
 classify:async()=>[],encode:async()=>{throw Error('Encoder explicitly unavailable');}})};}

test('A qualified quotation retains complete exact original witnesses and keeps normal conflict coverage excluded',()=>{
 const knowledge=build();assert.deepEqual(knowledge.issues,[]);
 for(const [id,q] of questions){
  const selection=selectSourceConflictQuotation({text:q,knowledge}),reply=sourceConflictQuotationReply(selection);
  assert.ok(selection,q);assert.equal(reply.decision,'answer');assert.equal(reply.knowledge,undefined);
  assert.deepEqual(reply.quotedFactIds,[id]);assert.ok(reply.text.includes(selection.fact.witness));
  assert.ok(reply.text.startsWith('Source limitation: '));assert.ok(reply.text.includes(selection.meta.disclosure));
  assert.equal(selection.original.conflict,true);assert.equal(selection.fact.record.conflict,true);
  assert.ok(!knowledge.sourceFields.entries.some(e=>e.factId===id));
  assert.equal(validateSourceConflictQuotationReply(selection,reply),true);
  assert.deepEqual(reply.sources,[selection.fact.source,...selection.supports.map(r=>r.source)]);
  for(const support of selection.supports)assert.ok(reply.text.includes(support.text));
 }
});

test('Unresolved secondary names need every complete exact original disclosure witness',()=>{
 for(const mutate of [
  m=>{m.unresolvedNames[0][1]='Quantum Edjirr';m.disclosure+=' Quantum Edjirr';},
  m=>{m.unresolvedNames[0][1]='jirr';m.disclosure+=' jirr';},
  m=>{m.disclosureWitnesses.pop();},
  m=>{m.disclosureWitnesses[0].text='A shortened Edjirr label.';},
  m=>{m.disclosureWitnesses[0].source.locator='unverified';}
 ]){const knowledge=build();mutate(knowledge.facts.find(f=>f.id==='assassination-sequence').conflictQuotation);
  assert.equal(selectSourceConflictQuotation({text:questions[1][1],knowledge}),null);}
});

test('The wrapper keeps quantity, equivalence, wrong-object and edition siblings outside quotation permission',async()=>{
 for(const q of ['What is the blue floor plate XP total?','Does the blue floor plate give exactly 5760 XP?',
  'How do I use the blue floor plate for 5760 XP?','How do I use the red floor plate?',
  'Are Edjiir and Edjirr the same person?',
  'What is the Herras assassination sequence in the 2026 remaster edition?']){
  const {assistant}=fixture();try{const r=await assistant.answerAsync(q);assert.notEqual(r.decision,'answer',q);}
  finally{assistant.destroy();}
 }
});

test('XP, arithmetic, stats, name equivalence, wrong owners, qualifiers, state and unavailable editions cannot borrow the quotation',()=>{
 const knowledge=build();
 for(const text of ['What is the blue floor plate XP total?','Does the blue floor plate give exactly 5760 XP?',
  'Does the guide prove that 16 times 357 is exactly 5760?','How do I use the blue floor plate for 5760 XP?',
  'How do I use the red floor plate?','How do I use the blue floor plate without Demon Exodus?',
  'How do I use the blue floor plate in the 2026 remaster edition?',
  'What is the Herras assassination sequence without Kariah?',
  'What is the unknown assassination sequence?','Are Kounos and Kontos the same place?',
  'Are Edjiir and Edjirr the same person?','What is the Herras assassination sequence in the 2026 remaster edition?',
  'Have I finished the Herras assassination sequence?'])assert.equal(selectSourceConflictQuotation({text,knowledge}),null,text);
 for(const [,text] of questions)assert.equal(selectSourceConflictQuotation({text,knowledge,ceiling:'gentle'}),null);
});

test('Quotation permission fails closed when disputed terms enter the witness or conflict status/metadata is removed',()=>{
 for(const change of [
  k=>{k.facts.find(f=>f.id==='xp-plate').witness+=' 5760';},
  k=>{delete k.facts.find(f=>f.id==='xp-plate').conflictQuotation;},
  k=>{k.facts.find(f=>f.id==='xp-plate').record.conflict=false;},
  k=>{k.sourceRecords.find(r=>r.id==='albion:objective:equipment-makers:xp-plate:hint').conflict=false;}
 ]){const knowledge=build();change(knowledge);assert.equal(selectSourceConflictQuotation({text:questions[0][1],knowledge}),null);}
});

test('A quote cannot shorten an original passage or hide a modeled condition or diagnostic',()=>{
 for(const change of [
  r=>{r.variants.direct={text:r.variants.direct.text || r.variants.direct};r.variants.direct.text+=' Additional mandatory caveat.';},
  r=>{r.requires={fact:'unverified'};},
  r=>{const v=r.variants.direct;r.variants.direct={...(typeof v==='string'?{text:v}:v),diagnostics:['Confirm the prerequisite before proceeding.']};}
 ]){
  const knowledge=build(),fact=knowledge.facts.find(f=>f.id==='xp-plate');
  change(knowledge.sourceRecords.find(r=>r.id===fact.sourceRecordId));
  assert.equal(selectSourceConflictQuotation({text:questions[0][1],knowledge}),null);
 }
});

test('The fixed presentation validator rejects extra prose, missing disclosure, extra citations and factual proof metadata',()=>{
 const knowledge=build(),selection=selectSourceConflictQuotation({text:questions[0][1],knowledge});assert.ok(selection);
 const reply=sourceConflictQuotationReply(selection);
 for(const modified of [{...reply,text:reply.text+' Therefore 5760 XP is correct.'},{...reply,text:selection.fact.witness},
  {...reply,sources:[...reply.sources,{file:'other.js',locator:'anything',review:'extracted'}]},
  {...reply,knowledge:{factIds:['xp-plate']}},{...reply,extraProse:'No conflict exists.'}])
  assert.equal(validateSourceConflictQuotationReply(selection,modified),false);
});

test('The original ordered dialogues quote limitations without seeding pronoun or named-relation factual followups',async()=>{
 for(const [id,q] of questions){const {knowledge,assistant}=fixture();try{
  const r=await assistant.answerAsync(q);assert.equal(r.decision,'answer',r.text);assert.deepEqual(r.quotedFactIds,[id]);
  assert.equal(r.knowledge,undefined);assert.equal(assistant.inspect().conversation.knowledge.lastFact,null);
  assert.equal(assistant.inspect().conversation.interpreter.subject,null);
  for(const follow of ['What does it do?','And Dreamshield?'])assert.notEqual((await assistant.answerAsync(follow)).decision,'answer',follow);
  assert.equal(knowledge.facts.find(f=>f.id===id).record.conflict,true);
 }finally{assistant.destroy();}}
 for(const dialogueId of ['blue-plate-demonstration','assassination-reward']){const {assistant}=fixture();try{
  const d=read('./knowledge/albion-cases.json').dialogues.find(d=>d.id===dialogueId);
  for(const t of d.turns){const r=await assistant.answerAsync(t.text);
   if(t.expected.decision==='answer'){assert.equal(r.decision,'answer',r.text);for(const value of t.expected.contains)assert.ok(r.text.includes(value),r.text);}
   else assert.notEqual(r.decision,'answer');
   assert.deepEqual(r.actions,[]);assert.deepEqual(r.stateChanges,[]);
  }
 }finally{assistant.destroy();}}
});
