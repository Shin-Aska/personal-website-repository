// Structural source-engine integration tests with explicitly synthetic intent
// scores. These do not measure MiniLM accuracy; rollout-browser.py uses the real
// approved MiniLM worker on the frozen all-game conversational corpus.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { createConversationAssistant } from '../../js/assistant/dialogue.js';

const sources={...allRecords,starcraft:JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url),'utf8'))};
// A deliberately small fake prediction interface selected by request syntax,
// independent of fixture expectations and entity names. No expected subject,
// transition, source record or answer text is passed to the wrapper.
async function syntaxScores(text){
    const q=text.toLowerCase().trim();
    const label=/^where/.test(q)?'location':q==='stats'?'stats':q==='use'?'use':q==='download link'?'acquisition':/^(?:who|what) is/.test(q)?'identity':'unknown';
    return [{label,score:.99},{label:label==='unknown'?'overview':'unknown',score:.01}];
}
function make(gameId,classify=syntaxScores){
    const base=createAssistant({gameId,records:sources[gameId]});
    return createConversationAssistant({assistant:base,records:sources[gameId],gameId,classify});
}
const send=(a,text)=>a.answerAsync(text,{contextId:'rollout-test',spoiler:'direct',fullAnswersOnly:true});
for(const [game,title,identityId,statsId,statFragment,locationId,locationFragment] of [
    ['albion','Rainer Hofstedt','albion:character:rainer-hofstedt:explanation','albion:character:rainer-hofstedt:stats','Intelligence 76/90','albion:character:rainer-hofstedt:location','Toronto, beginning'],
    ['ultima5','Iolo','ultima5:companion:iolo:explanation','ultima5:companion:iolo:stats','Strength 19','ultima5:companion:iolo:location','starting party'],
    ['ultima6','Iolo','ultima6:narrative:iolo-identity:identity','ultima6:atlas:marker:Iolo:stats:reference','Dexterity 26','ultima6:atlas:marker:Iolo:location','X 133'],
    ['ultima7','Iolo','ultima7:companion:iolo:explanation','ultima7:companion:iolo:stats','Strength 18','ultima7:companion:iolo:location','Trinsic']
]){
    test(`${game}: actual source facets survive identity → short stats → pronoun location → reset`,async()=>{
        const a=make(game);
        const identity=await send(a,`Who is ${title}?`);
        assert.equal(identity.decision,'answer',identity.text);
        assert.ok(identity.recordIds.includes(identityId),identity.recordIds.join(','));
        const stats=await send(a,'stats');assert.equal(stats.decision,'answer',stats.text);
        assert.ok(stats.recordIds.includes(statsId));assert.ok(stats.text.includes(statFragment));
        const location=await send(a,'Where is he?');assert.equal(location.decision,'answer',location.text);
        assert.ok(location.recordIds.includes(locationId));assert.ok(location.text.includes(locationFragment));
        a.resetTopic('rollout-test');
        const unresolved=await send(a,'Where is he?');assert.notEqual(unresolved.decision,'answer',unresolved.text);
        assert.ok(!unresolved.text.includes(locationFragment));
    });
}
test('Al-Qadim: source-backed item location → short use, then unknown subject invalidates it',async()=>{
    const a=make('alqadim');
    const first=await send(a,'Where is Ship Orb?');assert.equal(first.decision,'answer',first.text);
    assert.ok(first.recordIds.includes('alqadim:item:ship-orb:location'));
    const use=await send(a,'use');assert.equal(use.decision,'answer',use.text);
    assert.ok(use.recordIds.includes('alqadim:item:ship-orb:use'));assert.ok(use.text.includes('corsair ship'));
    const unknown=await send(a,'Where is Captain Heliowisp?');assert.notEqual(unknown.decision,'answer',unknown.text);
    const followup=await send(a,'Where is it?');assert.notEqual(followup.decision,'answer',followup.text);
});
test('StarCraft: source-backed client identity → download fragment; qualified unsupported edition persists',async()=>{
    const a=make('starcraft');
    const first=await send(a,'What is SCHNAIL?');assert.equal(first.decision,'answer',first.text);
    assert.ok(first.recordIds.includes('starcraft:schnail:features'));
    const download=await send(a,'download link');assert.equal(download.decision,'answer',download.text);
    assert.ok(download.recordIds.includes('starcraft:schnail:download'));assert.match(download.text,/account/i);
    const invalid=await send(a,'Where is SCHNAIL in StarCraft II?');assert.notEqual(invalid.decision,'answer',invalid.text);
    const followup=await send(a,'download link');assert.notEqual(followup.decision,'answer',followup.text);
});
test('Classifier uncertainty cannot manufacture a short-follow-up answer from a prior source',async()=>{
    let uncertain=false;
    const a=make('ultima7',text=>uncertain?Promise.resolve([{label:'location',score:.49},{label:'stats',score:.48}]):syntaxScores(text));
    assert.equal((await send(a,'Who is Iolo?')).decision,'answer');uncertain=true;
    const reply=await send(a,'listed whereabouts please');
    assert.ok(reply.dialoguePacket,'Wrapper must retain the actual rejected inference packet');
    assert.notEqual(reply.dialoguePacket.status,'ready');
    assert.equal(reply.dialoguePacket.confidence.score,.49);
    assert.equal(reply.dialoguePacket.canonicalQuestion,undefined);
    // Baseline may independently understand the phrase; either way the injected
    // ambiguous model scores cannot be reported as an accepted learned route.
    if(reply.decision==='answer')assert.ok(reply.recordIds.every(id=>sources.ultima7.some(r=>r.id===id)));
});
