import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

const manifest=JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/ultima7.json',import.meta.url)));
function fixture(gameId='ultima7'){
 const data=gameId==='ultima7'?manifest:JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${gameId}.json`,import.meta.url)));
 const knowledge=buildKnowledge(gameId,allRecords[gameId],data);
 return createConversationAssistant({gameId,records:knowledge.records,knowledge,
  assistant:createAssistant({gameId,records:knowledge.sourceRecords,fallback:null}),classify:async()=>[],
  encode:async()=>{throw Error('Encoder unavailable');}});
}
test('an acquisition followed by a reviewed later completion returns both phases without claiming player state',async()=>{
 const bot=fixture();
 for(const question of ['What are the Courage dragon tactics?', 'How do I get Dracothraxus reward?', 'How do I finish Courage test?'])
  assert.equal((await bot.answerAsync(question)).decision,'answer',question);
 const answer=await bot.answerAsync('Does obtaining the Ether Gem automatically finish Courage?');
 assert.equal(answer.decision,'answer');
 assert.match(answer.text,/this test continues later/);
 assert.match(answer.text,/Black Sword's power to finish the test/);
 assert.deepEqual(answer.sources.map(s=>s.locator).sort(),['DB.virtueQuests[5]','DB.virtueQuests[7]']);
 assert.deepEqual(answer.stateChanges,[]);assert.deepEqual(answer.actions,[]);
 for(const question of ['Does obtaining the quantum gem automatically finish Courage?',
  'Does obtaining the Ether Gem automatically finish Truth?',
  'Does obtaining the Ether Gem automatically finish Courage without the sword?',
  'Have I obtained the Ether Gem and finished Courage?']){
  const other=fixture();const result=await other.answerAsync(question);
  assert.notEqual(result.decision,'answer',question);other.destroy();
 }
 bot.destroy();
});

test('a reviewed after-dependency answers a before question without asserting progress',async()=>{
 const bot=fixture();
 for(const question of ['What is the enchant hourglass prerequisite?', 'How do I follow the Despise moongate route?', 'What is the Sphere moongate route?'])
  assert.equal((await bot.answerAsync(question)).decision,'answer',question);
 const answer=await bot.answerAsync('Can I enchant the hourglass before the Tetrahedron is destroyed?');
 assert.equal(answer.decision,'answer');assert.match(answer.text,/after the Tetrahedron is down/);
 assert.ok(answer.sources.some(s=>s.locator==='DB.mainQuest[4].content'));
 assert.deepEqual(answer.stateChanges,[]);assert.deepEqual(answer.actions,[]);
 for(const question of ['Can I enchant the hourglass before the Sphere is destroyed?',
  'Can I enchant the ring before the Tetrahedron is destroyed?',
  'Can I enchant the hourglass before the Tetrahedron is destroyed without magic?',
  'Have I enchanted the hourglass after the Tetrahedron was destroyed?']){
  const other=fixture();const result=await other.answerAsync(question);
  assert.notEqual(result.decision,'answer',question);other.destroy();
 }
 bot.destroy();
});

test('optional activities retain their own outcome and linked objective evidence',async()=>{
 const bot=fixture();
 for(const question of ['How do I find the true locket?', 'What is the hood secret wall route?'])
  assert.equal((await bot.answerAsync(question)).decision,'answer',question);
 assert.notEqual((await bot.answerAsync('What are the Truth optional puzzles?')).decision,'answer');
 const answer=await bot.answerAsync('Are all optional puzzles required to get the true locket?');
 assert.equal(answer.decision,'answer');assert.match(answer.text,/before the labyrinth/);assert.match(answer.text,/Optional puzzles/);
 assert.ok(answer.sources.every(s=>s.locator==='DB.virtueQuests[3]'));
 assert.deepEqual(answer.stateChanges,[]);assert.deepEqual(answer.actions,[]);
 const offer=await bot.answerAsync('What do the optional Truth puzzles offer?');
 assert.equal(offer.decision,'answer');assert.match(offer.text,/dangerous but valuable loot/);
 assert.ok(offer.sources.some(s=>s.locator==='DB.virtueQuests[3]'));
 for(const question of ['Are all optional puzzles required to get the false locket?',
  'Are all optional keys required to get the true locket?',
  'Are all optional puzzles required to get the true locket without magic?']){
  const other=fixture();assert.notEqual((await other.answerAsync(question)).decision,'answer',question);other.destroy();
 }
 bot.destroy();
});

test('phase relationship proofs require reviewed links and complete authorized witnesses',async()=>{
 const {authorize}=await import('../../js/assistant/policy.js');
 const {continuationAfterAcquisition,reviewedAfterDependency,optionalActivitiesForObjective}=await import('../../js/assistant/procedure-phase-fields.js');
 const knowledge=buildKnowledge('ultima7',allRecords.ultima7,manifest);
 const records=knowledge.sourceRecords.map(record=>record.variants?authorize(record,'direct'):record);
 const base={facts:knowledge.facts,entities:knowledge.entities,links:knowledge.links,sourceRecords:records,isEligible:()=>true};
 const courage='Does obtaining the Ether Gem automatically finish Courage?';
 const hourglass='Can I enchant the hourglass before the Tetrahedron is destroyed?';
 const truth='Are all optional puzzles required to get the true locket?';
 assert.ok(continuationAfterAcquisition(courage,base));assert.ok(reviewedAfterDependency(hourglass,base));assert.ok(optionalActivitiesForObjective(truth,base));
 assert.equal(continuationAfterAcquisition(courage,{...base,isEligible:()=>false}),null);
 assert.equal(reviewedAfterDependency(hourglass,{...base,links:knowledge.links.map(link=>link.id==='hourglass-after-tetra'?{...link,status:'disputed'}:link)}),null);
 assert.equal(optionalActivitiesForObjective(truth,{...base,facts:knowledge.facts.map(f=>f.id==='truth-optional-loot'?{...f,support:{}}:f)}),null);
 assert.equal(continuationAfterAcquisition(courage,{...base,sourceRecords:records.filter(r=>r.id!=='ultima7:quest:finale:hint')}),null);
});

test('a documented alternative is available when a proposed violent step is asked as mandatory',async()=>{
 const bot=fixture();
 for(const question of ['How do I get the Kliftin replica?', 'What is the Sprellic duels alternative?'])
  assert.equal((await bot.answerAsync(question)).decision,'answer',question);
 const answer=await bot.answerAsync('Must I kill all three fighters to resolve the Honor Flag?');
 assert.equal(answer.decision,'answer');assert.match(answer.text,/Either fight three duels/);
 assert.match(answer.text,/Kliftin.*replica.*give it to the fighters/);
 assert.match(answer.text,/does not say whether killing is necessary/);
 assert.ok(answer.sources.some(s=>s.locator==='DB.sideQuests[6]'));
 assert.notEqual((await bot.answerAsync('Why does Kliftin hate Sprellic?')).decision,'answer');
 for(const question of ['Must I kill all four fighters to resolve the Honor Flag?',
  'Must I kill all three merchants to resolve the Honor Flag?',
  'Must I kill all three fighters to resolve the Quantum Flag?',
  'Must I kill all three fighters to resolve the Honor Flag without a replica?']){
  const other=fixture();assert.notEqual((await other.answerAsync(question)).decision,'answer',question);other.destroy();
 }
 bot.destroy();
});

test('edition-wide stat claim retains the preceding source caveat',async()=>{
 const bot=fixture();
 for(const question of ['How do I use Dark Core lenses?', 'What is the museum lenses purpose?', 'What is the Forge stat reward?'])
  assert.equal((await bot.answerAsync(question)).decision,'answer',question);
 const answer=await bot.answerAsync('Does every edition raise all three stats to exactly 60?');
 assert.equal(answer.decision,'answer');assert.match(answer.text,/to 30.*60 in some versions/);
 assert.ok(answer.sources.some(s=>s.locator==='#virtue-quest-content: The Reward'));
 assert.deepEqual(answer.stateChanges,[]);assert.deepEqual(answer.actions,[]);
 const other=fixture();assert.notEqual((await other.answerAsync('Does every edition raise all three stats to exactly 60?')).decision,'answer');other.destroy();
 const {versionedStatClaim}=await import('../../js/assistant/procedure-phase-fields.js');
 const {authorize}=await import('../../js/assistant/policy.js');
 const k=buildKnowledge('ultima7',allRecords.ultima7,manifest);
 const options={facts:k.facts,priorFactIds:['forge-reward-caveat'],sourceRecords:k.sourceRecords.map(r=>r.variants?authorize(r,'direct'):r),isEligible:()=>true};
 for(const question of ['Does every edition raise all four stats to exactly 60?',
  'Does every edition raise all three stats to exactly 70?',
  'Does every edition raise all three stats to exactly 60 without a quest?'])
  assert.equal(versionedStatClaim(question,options),null,question);
 assert.equal(versionedStatClaim('Does every edition raise all three stats to exactly 60?',{...options,priorFactIds:[]}),null);
 bot.destroy();
});

test('reported recovery does not establish completion; the guide steps remain available',async()=>{
 const bot=fixture('ultima5');
 for(const question of ['How do I summon Astaroth at the flame?', 'Who teaches MALUM?', 'Who teaches AVIDUS?'])
  assert.equal((await bot.answerAsync(question)).decision,'answer',question);
 const answer=await bot.answerAsync('Is Astaroth defeated merely because I recovered the Shard?');
 assert.equal(answer.decision,'answer');assert.match(answer.text,/shout ASTAROTH/);
 assert.match(answer.text,/Wait one turn.*when Astaroth stands on the flame/);
 assert.match(answer.text,/cannot verify.*game state/i);
 assert.ok(answer.sources.some(s=>s.locator.endsWith('steps[3]')));
 assert.deepEqual(answer.stateChanges,[]);assert.deepEqual(answer.actions,[]);
 const {completionAfterReportedRecovery}=await import('../../js/assistant/procedure-phase-fields.js');
 const {authorize}=await import('../../js/assistant/policy.js');
 const k=buildKnowledge('ultima5',allRecords.ultima5,JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/ultima5.json',import.meta.url))));
 const options={facts:k.facts,entities:k.entities,sourceRecords:k.sourceRecords.map(r=>r.variants?authorize(r,'direct'):r),isEligible:()=>true};
 for(const question of ['Is Nosfentor defeated merely because I recovered the Shard?',
  'Is Astaroth defeated merely because I recovered the Crown?',
  'Is Astaroth defeated merely because I recovered the Shard without magic?'])
  assert.equal(completionAfterReportedRecovery(question,options),null,question);
 assert.equal(completionAfterReportedRecovery('Is Astaroth defeated merely because I recovered the Shard?',
  {...options,sourceRecords:options.sourceRecords.filter(r=>r.id!=='ultima5:objective:shadow-astaroth:explanation')}),null);
 bot.destroy();
});

test('a contradictory identity question preserves the direct identity and uncertainty',async()=>{
 const bot=fixture();
 for(const question of ['What is the Arcadion mirror method?', 'How do I use the Black Sword forge?', 'How do I sharpen Black Sword?'])
  assert.equal((await bot.answerAsync(question)).decision,'answer',question);
 const answer=await bot.answerAsync('Is Arcadion a benevolent human blacksmith?');
 assert.equal(answer.decision,'answer');assert.match(answer.text,/Arcadion.*bound daemon/);
 assert.match(answer.text,/does not establish/i);assert.ok(answer.sources.some(s=>s.locator==='ULTIMA7_MARKERS[491]'));
 assert.doesNotMatch(answer.text,/Arcadion is a benevolent human blacksmith/i);
 assert.deepEqual(answer.actions,[]);assert.deepEqual(answer.stateChanges,[]);
 const {contradictoryIdentity}=await import('../../js/assistant/source-role-contrasts.js');
 const {authorize}=await import('../../js/assistant/policy.js');
 const k=buildKnowledge('ultima7',allRecords.ultima7,manifest);
 const options={facts:k.facts,entities:k.entities,sourceRecords:k.sourceRecords.map(r=>r.variants?authorize(r,'direct'):r),isEligible:()=>true};
 for(const q of ['Is Quantum Turnip a human blacksmith?', 'Is Arcadion a benevolent blacksmith?',
  'Is Arcadion a human blacksmith in the NES edition?', 'Is Arcadion a human blacksmith without magic?'])
  assert.equal(contradictoryIdentity(q,options),null,q);
 assert.equal(contradictoryIdentity('Is Arcadion a human blacksmith?',{...options,isEligible:()=>false}),null);
 bot.destroy();
});

test('the accused and victim remain distinct from the accuser and alleged thief',async()=>{
 const bot=fixture();
 for(const question of ['How do I recover Lap-Lem amulet?', 'What is the Blorn theft investigation?'])
  await bot.answerAsync(question); // Unavailable encoder can change earlier answers; preserve the full ordering.
 const answer=await bot.answerAsync('Does Blorn being the accuser make Lap-Lem the thief?');
 assert.equal(answer.decision,'answer');assert.match(answer.text,/Lap-Lem.*He was the victim.*stolen amulet/);
 assert.ok(answer.sources.some(s=>s.locator==='DB.sideQuests[7]'));
 assert.notEqual((await bot.answerAsync('Is Blorn Lap-Lem brother?')).decision,'answer');
 assert.deepEqual(answer.actions,[]);assert.deepEqual(answer.stateChanges,[]);
 const {accusedVictimContrast}=await import('../../js/assistant/source-role-contrasts.js');
 const {authorize}=await import('../../js/assistant/policy.js');
 const k=buildKnowledge('ultima7',allRecords.ultima7,manifest);
 const options={facts:k.facts,sourceRecords:k.sourceRecords.map(r=>r.variants?authorize(r,'direct'):r),isEligible:()=>true};
 for(const q of ['Does Lap-Lem being the accuser make Blorn the thief?',
  'Does Blorn being the accuser make Quantum the thief?',
  'Does Blorn being the accuser make Lap-Lem the thief without evidence?'])
  assert.equal(accusedVictimContrast(q,options),null,q);
 assert.equal(accusedVictimContrast('Does Blorn being the accuser make Lap-Lem the thief?',{...options,isEligible:()=>false}),null);
 bot.destroy();
});
