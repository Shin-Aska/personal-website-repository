import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {authorize} from '../../js/assistant/policy.js';
import {buildKnowledge,createKnowledgeRouter} from '../../js/assistant/knowledge.js';

const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url)));
const pools={...allRecords,starcraft:read('./evidence/conversation-starcraft-source-records.json')};
function fixture(game,id){
    const records=pools[game],knowledge=buildKnowledge(game,records,read(`../../data/assistant/knowledge/${game}.json`));
    assert.deepEqual(knowledge.issues,[]);
    const record=authorize(records.find(record=>record.id===id),'direct');assert.ok(record);
    const reply={decision:'answer',text:record.text,recordIds:[record.id],sources:[record.source],actions:[],choices:[],stateChanges:[]};
    return {router:createKnowledgeRouter(knowledge),record,reply};
}

test('Reviewed raw capabilities preserve full actual source replies without reinterpreting unknown fields',()=>{
    for(const [game,id,question] of [
        ['albion','albion:objective:umajo:porenoil:hint','How do I get Porenoil?'],
        ['albion','albion:enemy:service-robot:combat','What do the Service Robot tactics say?'],
        ['albion','albion:objective:finale:ai-housing:hint','How do I fight AI Housing?'],
        ['ultima7','ultima7:topic:talismans:hint','How do I use Dark Core lenses?'],
        ['ultima7','ultima7:topic:talismans:hint','What is the museum lenses purpose?'],
        ['ultima7','ultima7:companion:jaana:explanation','What is Jaana free healing?'],
        ['ultima7','ultima7:companion:spark:explanation','What is Spark training growth?'],
        ['starcraft','starcraft:schnail:download','Where is SCHNAIL downloaded?']
    ]){
        const {router,record,reply}=fixture(game,id);
        assert.equal(router.guardReply(question,reply),reply,question);
        assert.equal(router.guardReply(question,{...reply,text:reply.text.slice(0,-10)}).decision,'decline',question+' clipped');
        assert.equal(router.guardReply(question,{...reply,sources:[]}).decision,'decline',question+' uncited');
        for(const extra of [`Which metal is ${record.title} made from?`,`What is ${record.title} checksum?`,question.replace(/\?$/,' and which metal is it made from?')])
            assert.equal(router.guardReply(extra,reply).decision,'decline',extra);
    }
});

test('Profile suffixes and source-field syntax preserve unknown owner and qualifier boundaries',()=>{
    const profile=fixture('ultima7','ultima7:companion:jaana:explanation');
    for(const question of ['What is radioactive Jaana free healing?','What is Jaana quantum healing?',
        'What is Jaana free healing checksum?','What is Jaana weight?','What is Jaana metal?',
        'What is Jaana free healing in the copper edition?','What is Jaana free healing and what is her unknown code?'])
        assert.equal(profile.router.guardReply(question,profile.reply).decision,'decline',question);
    const tactics=fixture('albion','albion:enemy:service-robot:combat');
    assert.equal(tactics.router.guardReply('What do the radioactive Service Robot tactics say?',tactics.reply).decision,'decline');
    const lenses=fixture('ultima7','ultima7:topic:talismans:hint');
    for(const question of ['How do I use radioactive Dark Core lenses?','What is the radioactive museum lenses purpose?',
        'What is the museum lenses metal?','How do I use Dark Core lenses with 30 crystals?'])
        assert.equal(lenses.router.guardReply(question,lenses.reply).decision,'decline',question);
    const download=fixture('starcraft','starcraft:schnail:download');
    assert.equal(download.router.guardReply('Where is quantum SCHNAIL downloaded?',download.reply).decision,'decline');
});

test('A delegated pronoun needs the source resolver complete canonical owner and still the whole source proof',()=>{
    const {router,record,reply}=fixture('albion','albion:item:dreamshield:use');
    const packet={status:'ready',entityId:record.entityId,canonicalQuestion:'What does Dreamshield do?'};
    assert.equal(router.guardReply('What does it do?',reply,packet),reply);
    for(const bad of [{},{...packet,entityId:'albion:other'}, {...packet,canonicalQuestion:'What does radioactive Dreamshield do?'},
        {...packet,canonicalQuestion:'What does an unknown subject do?'},{...packet,blockReplay:true}])
        assert.equal(router.guardReply('What does it do?',reply,bad).decision,'decline');
    assert.equal(router.guardReply('Which metal is it made from?',reply,packet).decision,'decline');
    assert.equal(router.guardReply('What does it do and which metal is it made from?',reply,packet).decision,'decline');
});

test('A downgrade wrapper reuses complete native compatibility proof with exact target and grounded route',()=>{
    const {router,reply}=fixture('starcraft','starcraft:remastered-map:no-downgrade');
    const question='Will I have to downgrade Remastered for this route?';
    assert.equal(router.guardReply(question,reply).decision,'decline');
    assert.equal(router.plan('Can I use the integrated BWAPI map natively in Remastered?').decision,'answer');
    assert.equal(router.guardReply(question,reply),reply);
    for(const unknown of ['Will I have to downgrade unknown Remastered for this route?',
        'Will I have to downgrade Remastered 2026 for this route?',
        'Will I have to downgrade Remastered for the quantum route?',
        'Will I have to downgrade Remastered for this route and install another game?',
        'Will I have to downgrade StarCraft II for this route?'])
        assert.equal(router.guardReply(unknown,reply).decision,'decline',unknown);
    assert.equal(router.guardReply(question,{...reply,text:'This method works natively.'}).decision,'decline');
    assert.equal(router.guardReply(question,{...reply,sources:[]}).decision,'decline');
});
