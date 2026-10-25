import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge,attachKnowledgeEmbeddings} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

function fixture(game,{biasToObjective=false}={}){
    const records=game==='starcraft'?JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url))):allRecords[game];
    const manifest=JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url)));
    const knowledge=buildKnowledge(game,records,manifest);assert.deepEqual(knowledge.issues,[]);
    let vector;
    if(biasToObjective){
        const catalog=JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}-embeddings.json`,import.meta.url)));
        const profile=JSON.parse(fs.readFileSync(new URL('../../local-assistant/intent/profile.json',import.meta.url)));
        attachKnowledgeEmbeddings(knowledge,catalog,profile);vector=knowledge.facts.find(f=>f.id==='ch3_5').vector;
    }
    const source=createAssistant({gameId:game,records,fallback:null});
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:source,classify:async()=>[],encode:async()=>{if(vector)return vector;throw Error('Encoder unavailable');}});
    const ask=async q=>{const r=await assistant.answerAsync(q);assert.deepEqual(r.actions,[],q);assert.deepEqual(r.stateChanges,[],q);assert.equal(source.inspect().claimCount,0,q);return r;};
    return {assistant,ask};
}
async function answer(ask,q,contains){const r=await ask(q);assert.equal(r.decision,'answer',`${q}: ${r.text}`);
    for(const value of contains)assert.ok(r.text.toLowerCase().includes(value.toLowerCase()),r.text);assert.ok(r.sources.length);return r;}

test('A complete source procedure answers the cycle and next guidance fields atomically',async()=>{
    const {assistant,ask}=fixture('ultima5');
    const r=await answer(ask,'For the shrine ritual, how many cycles do I meditate, and where do I go for guidance afterward?',
        ['three cycles','Codex','Isle of the Avatar']);assert.deepEqual(r.knowledge.factIds,['shrine-loop']);
    await answer(ask,'What does completing all eight shrine quests unlock?',['VERAMOCOR','Word of Power for Doom']);
    assert.notEqual((await ask('Have I completed all eight shrine quests already?')).decision,'answer');assistant.destroy();
});

test('Sequence fields cannot borrow another action, quantity, object or source restriction',async()=>{
    for(const q of ['For the radioactive shrine ritual, how many cycles do I meditate, and where do I go for guidance afterward?',
        'For the shrine ritual, how many cycles do I fight, and where do I go for guidance afterward?',
        'For the shrine ritual, how many hours do I meditate, and where do I go for guidance afterward?',
        'For the shrine ritual in the SNES edition, how many cycles do I meditate, and where do I go for guidance afterward?',
        'What does completing all nine shrine quests unlock?',
        'What does completing all eight shrine quests unlock according to the original manual?']){
        const {assistant,ask}=fixture('ultima5');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('A corrected source description identifies one literal mage and retains the reach difficulty',async()=>{
    const {assistant,ask}=fixture('ultima5');await answer(ask,'Who is Jaana?',['Mage']);
    const r=await answer(ask,'I meant the strongest mage for later: who is it, and what makes reaching him difficult?',
        ['Johne','strongest mage','difficult to reach','wrecked ship','Underworld']);
    assert.equal(r.knowledge.focusEntityId,'ultima5:companion:johne');assert.deepEqual(r.knowledge.factIds,['companion-johne']);assistant.destroy();
});

test('A superlative description cannot calculate rankings or discard added qualifiers',async()=>{
    for(const trait of ['the strongest radioactive mage','the strongest mage in the SNES edition','two strongest mages','the most powerful archer']){
        const {assistant,ask}=fixture('ultima5');const q=`I meant ${trait} for later: who is it, and what makes reaching him difficult?`;
        assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
    const {assistant,ask}=fixture('ultima5');
    assert.notEqual((await ask('I meant the strongest mage for later: who is it, and what makes reaching him difficult on Mars?')).decision,'answer');assistant.destroy();
});

test('A failed typed compound restores the prior complete subject instead of retaining a partial correction',async()=>{
    for(const q of ['I meant the strongest mage for later: who is it, and what makes reaching him difficult? Also who is the radioactive king?',
        'For the radioactive shrine ritual, how many cycles do I meditate, and where do I go for guidance afterward?']){
        const {assistant,ask}=fixture('ultima5');await answer(ask,'Who is Jaana?',['Mage']);
        assert.notEqual((await ask(q)).decision,'answer',q);
        await answer(ask,'Where is she?',['Yew']);assistant.destroy();
    }
});

test('A bounded topic-switch wrapper preserves the named effect and target',async()=>{
    const {assistant,ask}=fixture('ultima5');
    const r=await answer(ask,'Different travel problem: what do the HMS Cape plans do to a frigate?',['doubles its speed','relative to enemies']);
    assert.deepEqual(r.knowledge.factIds,['cape-speed']);assistant.destroy();
    for(const q of ['Different radioactive travel problem: what do the HMS Cape plans do to a frigate?',
        'Different travel problem: what do the HMS Cape plans do to a frigate on Mars?']){
        const f=fixture('ultima5');assert.notEqual((await f.ask(q)).decision,'answer',q);f.assistant.destroy();
    }
});

test('A QA-series attribution selects the actual source question without changing its answer',async()=>{
    const {assistant,ask}=fixture('ultima6');
    const r=await answer(ask,'What produced the headless creatures, according to the passage questions?',['Wizard']);
    assert.deepEqual(r.knowledge.factIds,['headless-production-method']);assistant.destroy();
    for(const q of ['What produced radioactive headless creatures, according to the passage questions?',
        'What produced the headless creatures, according to the otherpassage questions?',
        'How old are the headless creatures, according to the passage questions?']){
        const f=fixture('ultima6');assert.notEqual((await f.ask(q)).decision,'answer',q);f.assistant.destroy();
    }
});

test('An unsupported question-series restriction survives a bare pronoun until a named source change',async()=>{
    const {assistant,ask}=fixture('ultima6');
    await answer(ask,'What produced the headless creatures, according to the passage questions?',['Wizard']);
    assert.notEqual((await ask('What produced the headless creatures, according to the otherpassage questions?')).decision,'answer');
    assert.notEqual((await ask('What produced them?')).decision,'answer');
    await answer(ask,'What produced the headless creatures, according to the passage questions?',['Wizard']);assistant.destroy();
});

test('Combat context joins the full same-actor strategy and actual location without upgrading an objective',async()=>{
    const {assistant,ask}=fixture('alqadim');
    const r=await answer(ask,'Before I leave the oasis, how should I deal with its giant boar?',['Dodge sideways','strike from behind','Oasis Outskirts']);
    assert.ok(r.knowledge.factIds.includes('enemy-giant-boar'));
    assert.ok(r.sources.some(s=>s.locator==='DB.bestiary[3].strategy/danger'));
    assert.ok(r.sources.some(s=>s.locator==='DB.bestiary[3].location'));assistant.destroy();
    const f=fixture('alqadim');assert.notEqual((await f.ask('Before I leave the radioactive oasis, how should I deal with its giant boar?')).decision,'answer');f.assistant.destroy();
    for(const scope of ['the oasis and the tower','the oasis or the tower','the oasis and the radioactive tower']){
        const next=fixture('alqadim');assert.notEqual((await next.ask(`Before I leave ${scope}, how should I deal with its giant boar?`)).decision,'answer',scope);next.assistant.destroy();
    }
});

test('An objective with the highest possible query similarity cannot replace complete tactics evidence',async()=>{
    const {assistant,ask}=fixture('alqadim',{biasToObjective:true});
    const r=await answer(ask,'Before I leave the oasis, how should I deal with its giant boar?',['Dodge sideways','strike from behind','Oasis Outskirts']);
    assert.ok(r.knowledge.factIds.includes('enemy-giant-boar'));assert.ok(!r.knowledge.factIds.includes('ch3_5'));assistant.destroy();
});

test('An objective-only named creature cannot regain a guessed method through the delegated source engine',async()=>{
    for(const [game,q] of [['ultima7','How do I defeat Dracothraxus?'],['alqadim','How do I defeat the Acid Slime King?']]){
        const {assistant,ask}=fixture(game);assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('An optional loot method cannot substitute for clearing the hold of zombies',async()=>{
    const {assistant,ask}=fixture('alqadim');
    const r=await ask("How do I clear the Rotting Ship's Hold?");
    assert.notEqual(r.decision,'answer',r.text);assert.doesNotMatch(r.text,/Smash barrels/);assistant.destroy();
});

test('Returned installation steps ground the selected executable and the static after-saving instruction',async()=>{
    const {assistant,ask}=fixture('starcraft');await answer(ask,'How do I install BWAILauncher?',['Starcraft']);
    await answer(ask,'What if it cannot detect Starcraft.exe?',['settings','Starcraft.exe']);
    await answer(ask,'Which file should I select?',['Starcraft.exe']);
    await answer(ask,'What do I do after saving the settings?',['restart the launcher']);assistant.destroy();
    for(const q of ['Which file should I select?','What do I do after saving the settings?']){
        const f=fixture('starcraft');assert.notEqual((await f.ask(q)).decision,'answer',q);f.assistant.destroy();
    }
});

test('A full portable procedure supports its own settings and executable fields',async()=>{
    const {assistant,ask}=fixture('starcraft');
    await answer(ask,'How does BWAILauncher work with portable StarCraft?',['portable','Starcraft.exe']);
    await answer(ask,'Where are its settings saved?',['same folder']);
    await answer(ask,'Do I point it at the executable in that directory?',['same directory']);assistant.destroy();
});
