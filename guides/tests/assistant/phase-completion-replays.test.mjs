import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge,attachKnowledgeEmbeddings} from '../../js/assistant/knowledge.js';
import {predictIntentHead} from '../../js/assistant/intent-head.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const vectors=read('./fixtures/phase-completion-query-vectors.json').vectors;
const profile=read('../../local-assistant/intent/profile.json'),head=read('../../local-assistant/intent/head.json').head;
function fixture(game,{cached=true}={}){
 const data=read(`../../data/assistant/knowledge/${game}.json`),kb=attachKnowledgeEmbeddings(buildKnowledge(game,allRecords[game],data),read(`../../data/assistant/knowledge/${game}-embeddings.json`),profile),missing=new Set();
 const get=t=>{if(!vectors[t]){missing.add(t);throw Error('Missing cached vector')};return vectors[t]};
 const assistant=createConversationAssistant({gameId:game,records:kb.records,knowledge:kb,assistant:createAssistant({gameId:game,records:kb.sourceRecords,fallback:null}),thresholds:profile.thresholds,classify:cached?async t=>predictIntentHead(head,get(t)):async()=>[],encode:cached?async t=>get(t):async()=>{throw Error('Unavailable encoder')}});
 return {assistant,missing};
}
async function replay(game,id){
 const {assistant,missing}=fixture(game), turns=read(`./knowledge/${game}-cases.json`).dialogues.find(d=>d.id===id).turns,results=[];
 for(const turn of turns){let reply=await assistant.answerAsync(turn.text);results.push(reply);assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[])}
 assistant.destroy();assert.deepEqual([...missing],[]);return results;
}
const cite=(a,locator)=>assert.ok(a.sources.some(s=>s.locator===locator),JSON.stringify(a.sources));
test('complete Cape plans effect follows the full ordered acquisition conversation',async()=>{
 const a=await replay('ultima5','cape-plans-locations');assert.equal(a[3].decision,'answer');assert.match(a[3].text,/doubles its speed relative to enemies/);assert.match(a[3].text,/frigate/);cite(a[3],'ultima5GrandQuestChapters objective=opening-hms-cape.outcome');
});
test('navigating the Maze keeps the complete route, traps, and powder-keg caveat',async()=>{
 const a=await replay('ultima6','pirate-cave');assert.equal(a[2].decision,'answer');assert.match(a[2].text,/right wall.*disarming traps.*conserving powder kegs/);cite(a[2],'gameData.quests[1].sections[3].steps[2]');
});
test('other navigate questions retain the authored route and the unsupported Library boundary',async()=>{
 const deceit=await replay('ultima6','swamp-deceit');assert.equal(deceit[3].decision,'answer');
 assert.match(deceit[3].text,/Reveal.*western route.*solo mode/);cite(deceit[3],'gameData.sideQuests[4].steps[1]');
 const library=await replay('alqadim','library-and-destination-boundary');assert.notEqual(library[0].decision,'answer');
 assert.doesNotMatch(library[0].text,/take the northeast staircase|left, right, left/i);
});
test('acquiring the Wisp whistle keeps the honey preparation and the full dialogue',async()=>{
 const a=await replay('ultima7','wisp-honey-whistle');assert.equal(a[2].decision,'answer');assert.match(a[2].text,/Bee Cave.*bribe the emps/);assert.match(a[2].text,/wisp whistle/);assert.match(a[2].text,/Alagner.s notebook/);cite(a[2],'DB.mainQuest[2].content');
 assert.ok(a[2].text.indexOf('Bee Cave')<a[2].text.indexOf('Negotiate with the emps'));
 assert.equal((a[2].text.match(/Negotiate with the emps/g)||[]).length,1);
 for(const id of ['honey-emps','whistle-provided','emp-whistle'])assert.ok(a[2].knowledge.factIds.includes(id),id);
 cite(a[2],'DB.mainQuest[2].content; DB.mainQuest[2].content');
});
test('added proof closure does not relax editions, conditions, or saved-state checks',async()=>{
 for(const [game,questions] of [
  ['ultima5',['Do HMS Cape plans double my ship speed in the NES edition?', 'Have I already upgraded my frigate?']],
  ['ultima6',['How do I navigate Maze of Death without avoiding traps?', 'How do I navigate the Quantum Maze?']],
  ['ultima7',['How do I get wisp whistle without honey?', 'Do I already have the wisp whistle?', 'How do I get the crystal whistle?']]
 ]){
  const {assistant}=fixture(game,{cached:false});
  for(const question of questions)assert.notEqual((await assistant.answerAsync(question)).decision,'answer',question);
  assistant.destroy();
 }
});
