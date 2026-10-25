import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

function fixture(game){
    const records=allRecords[game],knowledge=buildKnowledge(game,records,JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url))));
    assert.deepEqual(knowledge.issues,[]);
    const source=createAssistant({gameId:game,records,fallback:null});
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:source,classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    return {assistant,source};
}
const noEffects=r=>{assert.deepEqual(r.actions,[]);assert.deepEqual(r.stateChanges,[]);};

test('Preparation gives equipment and spells rather than the later cave treasure',async()=>{
    for(const q of ['How do I prepare for Swamp Cave?','How should we get ready for Swamp Cave?','How do I get really ready for Swamp Cave?']){
        const {assistant,source}=fixture('ultima6'),reply=await assistant.answerAsync(q);
        assert.equal(reply.decision,'answer',reply.text);assert.match(reply.text,/every companion with swamp boots/);assert.match(reply.text,/Telekinesis or Vanish and Reappear/);
        assert.doesNotMatch(reply.text,/dead mage|fourth level|Storm Cloak/);assert.deepEqual(reply.knowledge.factIds,['side-3-step-0']);
        noEffects(reply);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('The blade forge procedure is separate from invoking the finished sword',async()=>{
    const {assistant,source}=fixture('ultima7');
    for(const q of ['How do I use the Black Sword forge?','How can I forge the Black Sword?','How can I actually forge the Black Sword?','How do I make the Black Sword?']){
        const r=await assistant.answerAsync(q);assert.equal(r.decision,'answer',r.text);
        for(const text of ['Heat and hammer','sharp','bind the daemon'])assert.ok(r.text.includes(text),r.text);
        assert.doesNotMatch(r.text,/invoke the Black Sword's power to finish/);noEffects(r);
    }
    assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('Asking for Manrel key cannot match a key-use alias by dropping its action word',async()=>{
    for(const q of ['How do I get Manrel key?',"How do I get Manrel's key?"]){
        const {assistant,source}=fixture('ultima6'),r=await assistant.answerAsync(q);
        assert.equal(r.decision,'answer',r.text);assert.match(r.text,/south of the Blue Bottle Inn/);assert.match(r.text,/ask for the KEY/);assert.match(r.text,/vow to place flowers/);
        assert.deepEqual(r.knowledge.factIds,['manrel-key']);assert.doesNotMatch(r.text,/Unlock Beyvin/);noEffects(r);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('Returning the Honor rune requires the return instruction rather than an earlier promise',async()=>{
    const {assistant,source}=fixture('ultima6');
    const get=await assistant.answerAsync('How do I get the Honor rune?');assert.equal(get.decision,'answer',get.text);
    const r=await assistant.answerAsync('How do I return the Honor rune?');assert.equal(r.decision,'answer',r.text);
    assert.match(r.text,/mantra SUMM/);assert.match(r.text,/recover the Moonstone/);assert.match(r.text,/return the rune to the pedestal/);
    assert.doesNotMatch(r.text,/promise to return/);assert.deepEqual(r.knowledge.factIds,['honor-return']);noEffects(r);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('Unknown procedural modifiers and additional conditions are not erased by phase recognition',async()=>{
    for(const [game,q] of [
        ['ultima6','How do I prepare for radioactive Swamp Cave?'],
        ['ultima6','How do I prepare for Swamp Cave on Mars?'],
        ['ultima6','How do I return the Honor rune to a blue altar?'],
        ['ultima6','How do I prepare for Swamp Cave in the SNES edition?'],
        ['ultima7','How do I forge the radioactive Black Sword?'],
        ['ultima7','How do I use the Black Sword forge with 30 gems?'],
        ['ultima7','If I already sold the Ether Gem, how do I forge the Black Sword?'],
        ['ultima7','How do I use the Black Sword forge according to the original manual?'],
        ['ultima6','Have I already returned the Honor rune?']
    ]){
        const {assistant,source}=fixture(game),r=await assistant.answerAsync(q);
        assert.notEqual(r.decision,'answer',q);noEffects(r);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('An unresolved material in a procedure remains unresolved in its pronoun follow-up',async()=>{
    const {assistant}=fixture('ultima7');
    const first=await assistant.answerAsync('How do I forge the radioactive Black Sword?');assert.notEqual(first.decision,'answer');
    const follow=await assistant.answerAsync('How do I forge it?');assert.notEqual(follow.decision,'answer',follow.text);
    const fresh=await assistant.answerAsync('How do I forge the Black Sword?');assert.equal(fresh.decision,'answer',fresh.text);assistant.destroy();
});

test('A phase stated for another object cannot transfer through a broad method binding',async()=>{
    for(const [game,q] of [
        ['ultima7','How do I forge the Ether Gem?'],['ultima7','How do I actually forge the Ether Gem?'],['ultima7','How do I forge Arcadion?'],
        ['ultima7','How do I make Arcadion?'],['ultima6','How do I return the Moonstone?']
    ]){
        const {assistant,source}=fixture(game),r=await assistant.answerAsync(q);
        assert.notEqual(r.decision,'answer',q);noEffects(r);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});

test('A procedural pronoun cannot manufacture a subject or clear an unsupported edition',async()=>{
    const fresh=fixture('ultima7');assert.notEqual((await fresh.assistant.answerAsync('How do I forge it?')).decision,'answer');fresh.assistant.destroy();
    const {assistant,source}=fixture('ultima7');
    const edition=await assistant.answerAsync('How do I forge the Black Sword in the SNES edition?');assert.notEqual(edition.decision,'answer');
    const pronoun=await assistant.answerAsync('How do I forge it?');assert.notEqual(pronoun.decision,'answer',pronoun.text);
    assert.notEqual((await assistant.answerAsync('How do I forge the Black Sword?')).decision,'answer','Edition remains session scope until explicitly changed or reset');
    noEffects(edition);noEffects(pronoun);assert.equal(source.inspect().claimCount,0);assistant.destroy();
});

test('Delivery keeps each book and recipient separate from return and preparation',async()=>{
    for(const [q,required] of [
        ['How do I deliver Wizard of Oz?',['Lord British','twenty gems']],
        ['How do I deliver the Boardgame Strategy book?',['Dr. Cat','150 gold']],
        ['How do I deliver Lost Book of Mantras?',['wisps','information','substance']]
    ]){
        const {assistant,source}=fixture('ultima6'),r=await assistant.answerAsync(q);
        assert.equal(r.decision,'answer',r.text);for(const word of required)assert.ok(r.text.includes(word),r.text);
        noEffects(r);assert.equal(source.inspect().claimCount,0);assistant.destroy();
    }
});
