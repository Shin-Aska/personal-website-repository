import fs from 'node:fs';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { allRecords, albion } from './load-records.mjs';
import { createAssistant, parse } from '../../js/assistant/engine.js';
import { Evidence, evaluate, UNKNOWN } from '../../js/assistant/rules.js';
import { authorize } from '../../js/assistant/policy.js';
import { importAlbionProgress } from '../../js/assistant/adapters/albion.js';
const fixtures=['pilot-cases.json','ultima-seers-cases.json','genie-sage-cases.json','adversarial-cases.json'].filter(f=>fs.existsSync(new URL(f,import.meta.url))).map(f=>JSON.parse(fs.readFileSync(new URL(f,import.meta.url))));
const questions=fixtures.flatMap(f=>f.questions), dialogues=fixtures.flatMap(f=>f.dialogues);
const results=[], timings=[], preparations=[];
const make=game=>{const t=performance.now();const a=createAssistant({gameId:game,records:allRecords[game]});preparations.push(performance.now()-t);return a;};
function check(expect,actual) {
 const decisions=Array.isArray(expect.decision)?expect.decision:[expect.decision];
 assert.ok(decisions.includes(actual.decision),`decision ${actual.decision}, expected ${decisions.join('|')}: ${actual.text}`);
 for(const value of expect.contains||[])assert.ok(actual.text.toLowerCase().includes(value.toLowerCase()),`missing ${value}: ${actual.text}`);
 for(const value of [...(expect.absent||[]),...(expect.excludes||[])])assert.ok(!actual.text.toLowerCase().includes(value.toLowerCase()),`forbidden ${value}`);
 if(expect.recordIds)for(const id of expect.recordIds)assert.ok(actual.recordIds.includes(id),`missing record ${id}`);
 if(expect.sourceRequired)assert.ok(actual.sources.length && actual.sources.every(s=>s.file&&s.review),'source missing');
 if(expect.stateChangeCount!==undefined)assert.equal(actual.stateChanges.length,expect.stateChangeCount,'unexpected state change');
}
function turn(a,c) {const t=performance.now();const reply=a.answer(c.text,c.options);timings.push(performance.now()-t);check(c.expected,reply);return reply;}
for(const c of questions) {try {const reply=turn(make(c.gameId),c);results.push({id:c.id,kind:'question',split:c.split,pass:true,decision:reply.decision});}catch(e){results.push({id:c.id,kind:'question',split:c.split,pass:false,error:e.message});}}
for(const c of dialogues) {try{const a=make(c.gameId);for(const t of c.turns)turn(a,t);results.push({id:c.id,kind:'dialogue',split:c.split,pass:true});}catch(e){results.push({id:c.id,kind:'dialogue',split:c.split,pass:false,error:e.message});}}
function invariant(id,fn){try{fn();results.push({id,kind:'invariant',pass:true});}catch(e){results.push({id,kind:'invariant',pass:false,error:e.message});}}
invariant('three-valued-negative',()=>{const e=new Evidence();assert.equal(evaluate({not:{fact:'x'}},e).value,UNKNOWN);e.correct('x',true,'possession');assert.equal(evaluate({not:{fact:'x'}},e).value,false);assert.equal(evaluate({not:{fact:'x'}},e).checks[0].required,false);});
invariant('or-alternative-no-blocker',()=>{const e=new Evidence();e.correct('a',false,'possession');e.correct('b',true,'possession');const r=evaluate({any:[{fact:'a'},{fact:'b'}]},e);assert.equal(r.value,true);assert.deepEqual(r.blockers,[]);});
invariant('and-false-plus-unknown',()=>{const e=new Evidence();e.correct('a',false,'possession');const r=evaluate({all:[{fact:'a'},{fact:'b'}]},e);assert.equal(r.value,false);assert.deepEqual(r.unknowns,['b']);});
invariant('unmodeled-vs-empty',()=>{const e=new Evidence();assert.equal(evaluate(null,e).value,UNKNOWN);assert.equal(evaluate({all:[]},e).value,true);assert.equal(evaluate({any:[]},e).value,false);});
invariant('cycle-and-traversal-budget',()=>{const rules=new Map([['a',{fact:'b'}],['b',{fact:'a'}]]);assert.ok(evaluate({fact:'a'},new Evidence(),rules).issues.includes('cyclic requirements'));let r={fact:'missing'};for(let i=0;i<25;i++)r={not:r};assert.ok(evaluate(r,new Evidence()).issues.includes('traversal limit'));});
invariant('checked-historical-only',()=>{const values={'toronto-intro':{pistol:true,'com-code':false}};const claims=importAlbionProgress(albion.QUEST_LOG,values);assert.equal(claims.length,1);assert.equal(claims[0].temporal,'historical');const e=new Evidence(()=>claims);assert.equal(e.read('albion:possesses:pistol').value,UNKNOWN);});
invariant('correction-eviction-retains-invalidation',()=>{const e=new Evidence(()=>[{id:'old',value:true,temporal:'historical'}]);e.correct('old',false,'historical');for(let i=0;i<70;i++)e.correct('c'+i,true,'historical');assert.equal(e.claims.size,64);assert.equal(e.read('old').value,UNKNOWN);});
invariant('bounded-dialogue',()=>{const a=make('albion');for(let i=0;i<20;i++)for(let j=0;j<15;j++)a.answer('What is the COM code?',{contextId:'c'+i,spoiler:'direct'});assert.equal(a.inspect().contextCount,8);assert.ok(a.inspect().contexts.every(c=>c.messages<=12&&c.entities<=6));});
invariant('spoiler-index-no-hidden-facets',()=>{const r={id:'x',entityId:'x',title:'Safe',aliases:[],relation:'hint',source:{file:'test',review:'authored'},variants:{gentle:{text:'Look nearby.'},direct:{title:'Secret Murderer',aliases:['VILLAIN'],text:'The code is 1042.'}}};const safe=authorize(r,'gentle');assert.ok(!JSON.stringify(safe).includes('1042'));assert.ok(!JSON.stringify(safe).includes('VILLAIN'));const a=createAssistant({gameId:'test',records:[r]});assert.notEqual(a.answer('Who is VILLAIN?').decision,'answer');});
invariant('lowered-history-refiltered',()=>{const a=make('albion');a.answer('What is COM code?',{spoiler:'direct'});a.setPolicy('gentle');assert.ok(!JSON.stringify(a.getHistory()).includes('1042'));});
// Intentional 23 Oct: first unticked answers retain selectable alternatives; stale choices still reject.
invariant('stale-choice-rejected',()=>{const a=make('albion');const r=a.answer('What next?',{contextId:'toronto-intro',spoiler:'direct'});assert.equal(r.decision,'answer');assert.ok(r.choices.length);a.setPolicy('gentle');assert.equal(a.answer(r.choices[0].label,{choiceId:r.choices[0].id,expectedRevision:r.revision,contextId:'toronto-intro'}).decision,'stale');});
invariant('one-clarification-resolution',()=>{const a=make('albion');const r=a.answer('What next?',{contextId:'toronto-intro',spoiler:'direct'});const c=r.choices[0];assert.equal(a.answer(c.label,{choiceId:c.id,expectedRevision:c.revision,contextId:'toronto-intro',spoiler:'direct'}).decision,'answer');});
invariant('no-storage-network-engine',()=>{for(const name of ['engine','language','retrieval','rules','policy','ui']){const text=fs.readFileSync(new URL(`../../js/assistant/${name}.js`,import.meta.url),'utf8');assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|eval)\s*\(|localStorage\s*\.\s*setItem/.test(text),name);}});
invariant('all-record-provenance-and-ids',()=>{for(const [game,records]of Object.entries(allRecords)){assert.equal(new Set(records.map(r=>r.id)).size,records.length,game);assert.ok(records.every(r=>r.id.startsWith(game+':')&&r.source?.file&&r.source?.review&&Object.hasOwn(r,'requires')),game);}});
invariant('uncertainty-never-reports',()=>{for(const text of ['If I have Pistol','I think I have Pistol','Maybe I have Pistol','"I have Pistol"','Someone said I have Pistol','Do I have Pistol?'])assert.equal(parse(text).correction,false,text);});
const percentile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))];
const report={timestamp:new Date().toISOString(),runtime:process.version,recordCounts:Object.fromEntries(Object.entries(allRecords).map(([k,v])=>[k,v.length])),questions:questions.length,dialogues:dialogues.length,assertions:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,performance:{warmComputeP95Ms:percentile(timings,.95),indexPreparationP95Ms:percentile(preparations,.95)},results};
const out=new URL('results.json',import.meta.url);fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,results:results.filter(r=>!r.pass)},null,2));
process.exitCode=report.failed?1:0;
