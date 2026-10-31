import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge,createKnowledgeRouter} from '../../js/assistant/knowledge.js';
import {authorize} from '../../js/assistant/policy.js';
function fixture(){const knowledge=buildKnowledge('alqadim',structuredClone(allRecords.alqadim),
 JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/alqadim.json',import.meta.url))));
 const fact=knowledge.facts.find(f=>f.id==='page-shard-charges');
 // Isolate the one fact so an adjacent independently proved fact cannot mask this observer contract.
 knowledge.facts=[fact];
 const original=authorize(knowledge.sourceRecords.find(r=>r.id===fact.sourceRecordId),'direct');
 const reply={decision:'answer',text:original.text,recordIds:[original.id],sources:[original.source],actions:[],choices:[],stateChanges:[]};
 const packet={entityId:original.entityId,restrictions:{guideOnly:false,editions:[]}};
 return {knowledge,fact,original,reply,packet,router:createKnowledgeRouter(knowledge)};}
const observe=f=>{f.router.observe(f.reply,f.packet,'How do I use Moonstone Shards?');return f.router.inspect().lastFact===f.fact.id;};

test('A whole original composite citation proves its exact source-member fact without changing either locator',()=>{
 const f=fixture(),before=f.fact.source.locator;
 assert.ok(f.original.source.locator.split(';').map(s=>s.trim()).includes(before));
 assert.ok(observe(f));assert.equal(f.fact.source.locator,before);
 assert.equal(f.router.plan('Can I just keep firing the same one forever?',{},{}).decision,'answer');
});

test('Wrong member, substring, file, review, record and partial text cannot establish that fact',()=>{
 for(const modify of [
  f=>{f.reply.sources=[{...f.original.source,locator:'Other arsenal'}];},
  f=>{f.reply.sources=[{...f.original.source,locator:'Moonstone arsenal extended'}];},
  f=>{f.reply.sources=[{...f.original.source,file:'guides/Other.html'}];},
  f=>{f.reply.sources=[{...f.original.source,review:'external-research'}];},
  f=>{f.reply.recordIds=['alqadim:unrelated'];},
  f=>{f.reply.text=f.fact.witness.slice(0,-10);}
 ]){const f=fixture();modify(f);assert.ok(!observe(f));}
});

test('Every expected member must appear in one citation; two individually matching citations cannot be pooled',()=>{
 const f=fixture(),members=f.original.source.locator.split(';').map(s=>s.trim()).filter(Boolean);
 assert.ok(members.length>1);f.fact.source.locator=members.slice(0,2).join('; ');
 f.reply.sources=members.slice(0,2).map(locator=>({...f.original.source,locator}));
 assert.ok(!observe(f));
 const fresh=fixture();assert.notEqual(fresh.router.plan('Can I just keep firing the same one forever?',{}, {})?.decision,'answer');
});
