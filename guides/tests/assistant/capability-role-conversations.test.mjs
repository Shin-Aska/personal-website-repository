import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

function fixture(game){
    const records=game==='starcraft'?JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url))):allRecords[game];
    const manifest=JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url)));
    const knowledge=buildKnowledge(game,records,manifest);assert.deepEqual(knowledge.issues,[]);
    const source=createAssistant({gameId:game,records,fallback:null});
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:source,classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    const ask=async q=>{const r=await assistant.answerAsync(q);assert.deepEqual(r.actions,[],q);assert.deepEqual(r.stateChanges,[],q);assert.equal(source.inspect().claimCount,0,q);return r;};
    return {assistant,ask,source};
}
async function answer(ask,q,contains){const r=await ask(q);assert.equal(r.decision,'answer',`${q}: ${r.text}`);
    for(const value of contains)assert.ok(r.text.toLowerCase().includes(value.toLowerCase()),r.text);assert.ok(r.sources.length);return r;}

test('A literal software comparison carries its tool into offline and detection follow-ups',async()=>{
    const {assistant,ask}=fixture('starcraft');
    const comparison=await answer(ask,'How does BWAILauncher compare with SCHNAIL for AI realism and strategic depth?',
        ['Less realistic AI','Limited strategic depth compared to SCHNAIL','More realistic AI']);
    assert.equal(comparison.consultation,undefined);
    await answer(ask,'Can I use BWAILauncher entirely offline?',['No internet connection required']);
    await answer(ask,'If it cannot detect Starcraft.exe automatically, how do I point it at the game?',
        ['settings','Starcraft.exe','restart']);
    assert.notEqual((await ask('Is it installed on my machine already?')).decision,'answer');assistant.destroy();
});

test('Native map compatibility uses its complete explicit edition note',async()=>{
    const {assistant,ask}=fixture('starcraft');
    const r=await answer(ask,'Can I use the integrated SCM map directly in Remastered?',
        ['works natively with StarCraft Remastered','without needing version downgrades']);
    assert.deepEqual(r.knowledge.factIds,['starcraft:knowledge:map-identity']);assistant.destroy();
});

test('Software capability proof cannot erase requested properties, editions, source scope or conditions',async()=>{
    for(const q of ['How does radioactive BWAILauncher compare with SCHNAIL for AI realism and strategic depth?',
        'How does BWAILauncher compare with SCHNAIL for price and strategic depth?',
        'How does BWAILauncher compare with SCHNAIL for AI realism and strategic depth on Mars?',
        'Can I use SCHNAIL entirely offline?',
        'Can I use BWAILauncher with two copper disks entirely offline?',
        'Can I use the integrated SCM map directly in Remastered on Mars?',
        'Can I use the integrated SCM map directly in the SNES edition?',
        'If BWAILauncher cannot detect Quantum.exe automatically, how do I point it at the game?',
        'If BWAILauncher cannot detect Starcraft.exe automatically, how do I point it at the game in the original manual?',
        'If it cannot detect Starcraft.exe automatically, how do I point it at the game?']){
        const {assistant,ask}=fixture('starcraft');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('Unsupported capitalized conditional suffixes cannot escape as partial source-engine answers',async()=>{
    for(const suffix of ['on Mars','on Pandora','in the SNES edition','in StarCraft II','with Uranium','and verify CurrentSave']){
        for(const mode of ['sync','async']){
            const {assistant,ask,source}=fixture('starcraft');let calls=0;
            const original=source.answer;source.answer=(...args)=>{calls++;return original(...args);};
            const q=`If BWAILauncher cannot detect Starcraft.exe automatically, how do I point it at the game ${suffix}?`;
            const r=mode==='async'?await ask(q):assistant.answer(q);
            assert.notEqual(r.decision,'answer',`${mode}: ${q}`);assert.deepEqual(r.sources,[],q);assert.equal(calls,0,q);
            assert.notEqual((await ask('Can I use it entirely offline?')).decision,'answer',q);assistant.destroy();
        }
    }
});

test('A grounded resource reference quotes the complete consumption and depletion condition',async()=>{
    const {assistant,ask}=fixture('alqadim');
    await answer(ask,'How do I use Moonstone Shards?',['charge']);
    const r=await answer(ask,'Can I just keep firing the same one forever?',['One shot spends one charge','breaks apart']);
    assert.deepEqual(r.knowledge.factIds,['page-shard-charges']);assistant.destroy();
});

test('The recorded hit trigger answers with its source instead of inventing a carrying exception',async()=>{
    for(const [seed,contains] of [['What does Magebane do?','Drains Mana on Hit'],['Where is Magebane found?','Stonegate']]){
        const {assistant,ask}=fixture('ultima7');await answer(ask,seed,[contains]);
        const r=await answer(ask,'Does it drain mana only when I hit, or just from carrying it?',['Drains Mana on Hit']);
        assert.doesNotMatch(r.text,/carrying (?:it )?(?:does not|never)|only drains/i);assistant.destroy();
    }
});

test('Resource conditions preserve unknown qualifiers, alternative triggers and ungrounded references',async()=>{
    for(const [game,q] of [['alqadim','Can I just keep firing the same one forever?'],
        ['alqadim','Can I keep firing radioactive Moonstone Shards forever?'],
        ['alqadim','Can I keep firing Moonstone Shards forever in the SNES edition?'],
        ['ultima7','Does Magebane drain gold only when I hit, or just from carrying it?'],
        ['ultima7','Does Magebane drain mana only when I cast, or just from carrying it?'],
        ['ultima7','Does Magebane drain mana only when I hit, or just from buying it?'],
        ['ultima7','Does it drain mana only when I hit, or just from carrying it?']]){
        const {assistant,ask}=fixture(game);assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('A typed holder and two binding participants retain their individual direct roles',async()=>{
    const {assistant,ask}=fixture('ultima7');
    const holder=await answer(ask,'Which dragon has the Ether Gem in the Courage test?',['Dracothraxus','Ether Gem','dragon']);
    assert.ok(holder.knowledge.factIds.includes('courage-sleep-potions'));
    await answer(ask,'How do I create the Black Sword in the Forge of Virtue?',['Black Sword']);
    const binding=await answer(ask,'Which daemon, and what gem do I put him into?',['Arcadion','Ether Gem','mirror']);
    assert.equal(binding.knowledge.parts.length,2);assistant.destroy();
});

test('A required actor answers the direct entry gate without verifying party membership',async()=>{
    const {assistant,ask}=fixture('albion');await answer(ask,'How do I recruit Khunag?',['Beloveno']);
    const r=await answer(ask,'Do I really need him to get inside Kenget Kamulos?',['cannot enter Kenget Kamulos without Khunag']);
    assert.deepEqual(r.knowledge.factIds,['khunag-required']);
    assert.notEqual((await ask('Is Khunag in my party already?')).decision,'answer');assistant.destroy();
});

test('A trainer location retains its literal learning eligibility condition',async()=>{
    const {assistant,ask}=fixture('alqadim');
    await answer(ask,'Where do I find Zubakon for lessons?',['shop with no sign','eligible']);assistant.destroy();
    for(const q of ['Where do I find radioactive Zubakon for lessons?','Where do I find Zubakon for 30 lessons?',
        'Where do I find Zubakon for lessons in the SNES edition?']){
        const f=fixture('alqadim');assert.notEqual((await f.ask(q)).decision,'answer',q);f.assistant.destroy();
    }
});

test('Participant questions cannot substitute another holder, scene, dependency or fresh reference',async()=>{
    for(const [game,q] of [['ultima7','Which silver dragon has the Ether Gem in the Courage test?'],
        ['ultima7','Which dragon has the radioactive Ether Gem in the Courage test?'],
        ['ultima7','Which dragon has the Ether Gem in the Courage trial?'],
        ['ultima7','Which daemon?'],['ultima7','What gem do I put him into?'],
        ['albion','Do I need Siobhan to get inside Kenget Kamulos?'],
        ['albion','Do I need him to get inside Kenget Kamulos?']]){
        const {assistant,ask}=fixture(game);assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});
