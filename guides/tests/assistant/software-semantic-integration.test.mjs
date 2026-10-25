import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

const report=JSON.parse(fs.readFileSync(new URL('./evidence/knowledge-browser-full-corpus-sequence-scope-20261025-03.json',import.meta.url)));
const manifest=JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/starcraft.json',import.meta.url)));
const starcraftRecords=JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url)));
const fact=suffix=>manifest.facts.find(value=>value.id===`starcraft:knowledge:${suffix}`);
function fixture(game='starcraft') {
    const records=game==='starcraft'?starcraftRecords:allRecords[game];
    const source=createAssistant({gameId:game,records,fallback:null});
    const knowledge=buildKnowledge(game,records,game==='starcraft'?manifest:JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url))));
    assert.deepEqual(knowledge.issues,[]);
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:source,classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    return {assistant,source,ask:async text=>{
        const reply=await assistant.answerAsync(text);
        assert.deepEqual(reply.actions,[],text);assert.deepEqual(reply.stateChanges,[],text);
        assert.equal(source.inspect().claimCount,0,text);return reply;
    }};
}
function wholeProof(reply,suffix,text) {
    assert.equal(reply.decision,'answer',`${text}: ${reply.text}`);
    assert.ok(reply.text.includes(fact(suffix).witness.replace(/^Outside research: /,'')),`${text}: complete original witness`);
    assert.ok(reply.sources.length,text);
}

for(const [dialogueId,lastTurn,suffix] of [
    ['starcraft-knowledge-offline-comparison',2,'schnail-network'],
    ['starcraft-knowledge-map-limits',3,'bwapi-1161'],
    ['starcraft-knowledge-cross-tool-folders',4,'steamhammer-config']
]) test(`The exact full03 ${dialogueId} sequence returns its complete final proof`,async()=>{
    const f=fixture();try {
        const rows=report.turns.filter(row=>row.surface==='starcraft'&&row.dialogueId===dialogueId&&row.turn<=lastTurn);
        assert.equal(rows.length,lastTurn);
        for(const row of rows) {
            const reply=await f.ask(row.text);
            if(row.turn===lastTurn)wholeProof(reply,suffix,row.text);
            if(dialogueId==='starcraft-knowledge-offline-comparison'&&row.turn===1)wholeProof(reply,'bwai-offline',row.text);
        }
    } finally { f.assistant.destroy(); }
});

test('A named new software owner releases the previous map scope while explicit current source and edition stay binding',async()=>{
    const seed='According to the guide, does the Remastered map need an external launcher?';
    const f=fixture();try {
        wholeProof(await f.ask(seed),'map-launcher',seed);
        const question='Where does Steamhammer’s binary configuration go?';
        wholeProof(await f.ask(question),'steamhammer-config',question);
    } finally { f.assistant.destroy(); }
    for(const question of [
        'According to the guide, where does Steamhammer’s binary configuration go?',
        'According to the original copper manual, where does Steamhammer’s binary configuration go?',
        'In Remastered, where does Steamhammer’s binary configuration go?',
        'Where does Steamhammer’s binary configuration go in StarCraft Remastered?',
        'For StarCraft Remastered, where does Steamhammer’s binary configuration go?'
    ]) {
        const f=fixture();try {
            wholeProof(await f.ask(seed),'map-launcher',seed);
            const reply=await f.ask(question);assert.notEqual(reply.decision,'answer',question);
            assert.deepEqual(reply.recordIds,[],question);assert.deepEqual(reply.sources,[],question);
        } finally { f.assistant.destroy(); }
    }
});

test('The developer documentation target is a compared argument and never certifies binary compatibility',async()=>{
    for(const seeded of [false,true]) {
        const f=fixture();try {
            if(seeded)wholeProof(await f.ask('Does the Remastered map need an external launcher?'),'map-launcher','map seed');
            wholeProof(await f.ask('Does BWAPI’s own developer quick start target Remastered?'),'bwapi-1161','developer target');
            assert.notEqual((await f.ask('Can you certify native Remastered support for all BWAPI 4.4.0 DLLs?')).decision,'answer');
        } finally { f.assistant.destroy(); }
    }
});

test('Unknown source, edition, material, conditional, compound and save claims cannot escape through legacy answers',async()=>{
    const bases=['Does BWAPI’s own developer quick start target Remastered?','Where does Steamhammer’s binary configuration go?','What is BWAILauncher used for?'];
    const questions=bases.flatMap(text=>[
        ' in the SNES edition',' according to the original copper manual',' with copper hardware',
        ' after I deleted my current save',' assuming I installed it',' and verify my current save'
    ].map(suffix=>text.replace(/\?$/,`${suffix}?`))).concat([
        'Where does Steamhammer’s binary configuration go, and have I installed it already?',
        'Does BWAPI’s own developer quick start target Remastered, and did I update mine?',
        'Has my Steamhammer JSON configuration been installed already?'
    ]);
    for(const seeded of [false,true])for(const question of questions) {
        const f=fixture();try {
            if(seeded)wholeProof(await f.ask('Does the Remastered map need an external launcher?'),'map-launcher','map seed');
            const reply=await f.ask(question);
            assert.notEqual(reply.decision,'answer',question);
            for(const suffix of ['bwai-identity','bwapi-1161','steamhammer-config'])
                assert.ok(!reply.text.includes(fact(suffix).witness.replace(/^Outside research: /,'')),`${question}: no partial positive field answer`);
            if(question==='What is BWAILauncher used for in the SNES edition?') {
                // Existing source-engine policy can cite its known conflict
                // while explicitly declining an unsupported requested edition.
                assert.match(reply.text,/does not support the edition or version/);
                assert.ok(reply.sources.every(source=>source.review==='conflicting'));
            } else {
                assert.deepEqual(reply.recordIds,[],question);assert.deepEqual(reply.sources,[],question);
            }
        } finally { f.assistant.destroy(); }
    }
});

test('Generic item and spell purpose questions retain ordinary source routes across the other games',async()=>{
    for(const [game,question,contains]of [
        ['ultima5','What does An Grav do?','Dispels magical fields'],
        ['ultima6','What does the Amulet of Submission do?','move freely'],
        ['ultima7','What does Magebane do?','Drains Mana on Hit'],
        ['ultima7','What is the emp honey used for?','bribe the emps'],
        ['alqadim','What does Quick Swing do?','scimitar strike'],
        ['albion','What does the Iskai Lance do?','Drirr only']
    ]) {
        const f=fixture(game);try {
            const reply=await f.ask(question);assert.equal(reply.decision,'answer',question);assert.ok(reply.text.includes(contains),question);
        } finally { f.assistant.destroy(); }
    }
});
