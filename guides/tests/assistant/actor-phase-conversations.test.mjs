import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {lookupGraphQuestion} from '../../js/assistant/knowledge-graph.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

function fixture(game,mutate=()=>{}){
    const records=allRecords[game],manifest=JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url)));
    mutate(manifest);const knowledge=buildKnowledge(game,records,manifest);assert.deepEqual(knowledge.issues,[]);
    const source=createAssistant({gameId:game,records,fallback:null});
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:source,
        classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    const ask=async q=>{const r=await assistant.answerAsync(q);assert.deepEqual(r.actions,[]);assert.deepEqual(r.stateChanges,[]);
        assert.equal(source.inspect().claimCount,0);return r;};
    return {assistant,ask,knowledge};
}
const answer=async(ask,q,facts)=>{const r=await ask(q);assert.equal(r.decision,'answer',`${q}: ${r.text}`);
    assert.deepEqual(r.knowledge.factIds,facts);assert.ok(r.sources.length);return r;};

test('Pickup, ammunition storage and concealed transport retain separate literal procedures',async()=>{
    const {assistant,ask}=fixture('albion');
    const pickup=await answer(ask,'How do I get the Pistol?',['pistol']);assert.match(pickup.text,/examine the damaged console/);
    for(const q of ['How do I get it past security?','How can I carry them past security?',
        'How do I hide the Pistol in the wall cabinet on the service level?']){
        const r=await answer(ask,q,['hide-weapon']);assert.match(r.text,/After looting the COM room/);assert.match(r.text,/wall cabinet on the service level before passing security/);
        assert.doesNotMatch(r.text,/examine the damaged console/);
    }
    assert.notEqual((await ask('Is my Pistol safely hidden there already?')).decision,'answer');assistant.destroy();
});

test('A general use binding and a destination mention cannot establish a transported object',async()=>{
    for(const mode of ['use-only','incidental-object']){
        const {assistant,ask}=fixture('albion',m=>{
            const f=m.facts.find(f=>f.id==='hide-weapon');
            if(mode==='use-only')f.answerBindings.find(b=>b.mention==='Pistol').relations=['use'];
            else f.answerBindings=[];
            if(!f.answerBindings.length)delete f.answerBindings;
        });
        assert.notEqual((await ask('How do I get the Pistol past security?')).decision,'answer',mode);assistant.destroy();
    }
});

test('Unknown transport objects, security targets, modifiers, quantities, editions and sources stay unresolved',async()=>{
    for(const q of ['How do I get the radioactive Pistol past security?','How do I get 30 Pistols past security?',
        'How do I get the Pistol past radioactive security?','How do I hide the Pistol in the blue wall cabinet?',
        'How do I get the Pistol past security in the SNES edition?',
        'How do I get the Pistol past security according to the original manual?',
        'How do I get the COM room past security?','How do I get the Canisters crate past security?',
        'If I already sold the Pistol, how do I get it past security?']){
        const {assistant,ask}=fixture('albion');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
    const {assistant,ask}=fixture('albion');assert.notEqual((await ask('How do I get it past security?')).decision,'answer');assistant.destroy();
});

test('An unresolved transport material survives a bare follow-up',async()=>{
    const {assistant,ask}=fixture('albion');
    assert.notEqual((await ask('How do I get the radioactive Pistol past security?')).decision,'answer');
    assert.notEqual((await ask('How do I get it past security?')).decision,'answer');assistant.destroy();
});

test('Passive crafting in a documented expansion returns the recipe and the artifact conversation lead',async()=>{
    const {assistant,ask}=fixture('ultima7');
    const r=await answer(ask,'How is the Black Sword forged in Forge of Virtue?',['black-sword-forging']);
    assert.match(r.text,/Heat and hammer/);assert.match(r.text,/bind the daemon/);assert.doesNotMatch(r.text,/invoke the Black Sword's power/);
    const lead=await answer(ask,'Who do I ask about the artifact of power?',['black-sword-full-method']);assert.match(lead.text,/Ask Erethian about the artifact of power/);
    assistant.destroy();
});

test('Passive wording cannot transfer sword crafting or an expansion scope to other subjects',async()=>{
    for(const q of ['How is the Ether Gem forged?','How is Arcadion crafted?','How is the radioactive Black Sword forged?',
        'How is the Black Sword forged with 30 gems?','How is the Black Sword forged in the SNES edition?',
        'How is the Black Sword forged according to the original manual?','Who do I ask about the radioactive artifact of power?']){
        const {assistant,ask}=fixture('ultima7');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('Causative release follows the prisoner and literal mechanism rather than acquiring that person',async()=>{
    const {assistant,ask}=fixture('ultima7');
    const r=await ask('How can I get Weston released?');assert.equal(r.decision,'answer',r.text);assert.match(r.text,/Plead his case to Lord British for his release/);
    const follow=await ask('How can I get him released?');assert.equal(follow.decision,'answer',follow.text);assert.match(follow.text,/Plead his case/);
    const daemon=await ask('How do I free Arcadion?');assert.equal(daemon.decision,'answer',daemon.text);assert.match(daemon.text,/Ether Gem via the mirror/);
    assistant.destroy();
    for(const q of ['How can I get Lord British released?','How can I get radioactive Weston released?',
        'How can I get Weston released with 30 gold?','How do I free the captured tower mage?']){
        const f=fixture(q.includes('tower')?'alqadim':'ultima7');assert.notEqual((await f.ask(q)).decision,'answer',q);f.assistant.destroy();
    }
});

test('An item needed-for question keeps the direct purpose record',async()=>{
    const {assistant,ask}=fixture('alqadim');const r=await answer(ask,'What are the Purple Berries needed for?',['item-purple-berries-use']);
    assert.match(r.text,/cure Babazar's daughter/);assistant.destroy();
});

test('A conversation lead and a method mention cannot supply item acquisition',async()=>{
    for(const q of ['How do I get the artifact of power?','How do I get Erethian?','How do I get the mirror?',
        'For Forge of Virtue, how do I get the artifact of power?']){
        const {assistant,ask}=fixture('ultima7');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('A provider procedure asks for the named object or consent without acquiring the person',async()=>{
    for(const [game,q,facts] of [
        ['ultima6','How do I get Anya permission?',['anya-permission']],
        ['ultima6','How do I get Lenora permission?',['lenora-permission']],
        ['ultima6','How do I get Selganor rune?',['selganor-rune']],
        ['ultima6','How do I get Whitsaber rune?',['whitsaber-loan']],
        ['ultima6','How do I get Ybarra map piece?',['ybarra-map']],
        ['ultima6','How do I get Morchella map piece?',['morchella-map']],
        ['ultima6','How do I get Arturos map piece?',['arturos-map']],
        ['ultima6','How do I get Whitsaber map piece?',['gordon-map']],
        ['ultima6','How do I get Homer final map piece?',['homer-map']],
        ['ultima7','How do I get Lord Heather signature?',['miranda-bill']]
        ,['ultima6','How do I get Manrel key?',['manrel-key']],['ultima6','How do I get Pridgarm key?',['pridgarm-key']],
        ['albion','How do I get Anne rations?',['anne-rations']],['alqadim','How do I receive the Captured tower mage blessing?',['ch5_6']]
    ]){
        const {assistant,ask}=fixture(game);await answer(ask,q,facts);assistant.destroy();
    }
});

test('Where a companion is required cannot answer what that companion requires',async()=>{
    for(const q of ['What does he require?','What does Khunag require?','What are the requirements to recruit Khunag?',
        'What do I need to recruit Khunag?']){
        const {assistant,ask}=fixture('albion');const start=await ask('How do I get Khunag?');assert.equal(start.decision,'answer',start.text);
        assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
    const {assistant,ask}=fixture('albion');const r=await answer(ask,'What is Khunag required for?',['khunag-required']);
    assert.match(r.text,/Kenget Kamulos/);assistant.destroy();
});

test('Provider procedures preserve unknown qualifiers and cannot substitute a method mention',async()=>{
    for(const [game,q] of [
        ['ultima6','How do I get radioactive Anya permission?'],['ultima6','How do I get 30 Selganor runes?'],
        ['ultima6','How do I get Ybarra radioactive map piece?'],['ultima7','How do I get Erethian signature?'],
        ['ultima7','How do I get Lord Heather radioactive signature?']
        ,['ultima7',"How do I get Lord Heather's forged signature?"],['ultima7',"How do I get Miranda's signature?"],
        ['ultima7',"How do I get Cove's signature?"],['ultima7',"How do I get Lock Lake's signature?"],
        ['ultima6','How do I get Ariana?'],['ultima6','How do I obtain Ariana?'],['ultima7','How do I get Lord British?']
    ]){const {assistant,ask}=fixture(game);assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();}
    const {assistant,ask}=fixture('ultima6');await ask('How do I get radioactive Anya permission?');
    assert.notEqual((await ask('How do I get her permission?')).decision,'answer');assistant.destroy();
});

test('Conversion, raw wood, song teaching and performance recipient follow the same source task',async()=>{
    const {assistant,ask}=fixture('ultima6');
    const r=await answer(ask,'For the Sacrifice rune, who turns the wooden board into panpipes?',['panpipes-makers']);
    assert.match(r.text,/Julia/);assert.match(r.text,/cut it into a board/);
    const wood=await answer(ask,'Where is the raw wood obtained?',['panpipes-makers']);assert.match(wood.text,/Ben west of Yew/);
    const song=await answer(ask,'Whose song should I learn, and who hears the performance to award the rune?',['gwenno-song','selganor-rune']);
    for(const s of ['Gwenno','STONES','Selganor','receive the rune'])assert.ok(song.text.includes(s));
    assert.notEqual((await ask('How much durability do those panpipes lose each time I play Stones?')).decision,'answer');assistant.destroy();
});

test('A direct converter proof must bind the full output and retain material and timing restrictions',async()=>{
    for(const q of ['Who turns the board into a yew log?','Who turns the board into an iron sword?',
        'Who turns the iron board into panpipes?','Who turns the radioactive board into panpipes?',
        'Who turns 30 wooden boards into panpipes?','Who turns the board into panpipes in 30 turns?',
        'For the radioactive Sacrifice rune, who turns the board into panpipes?',
        'For the Sacrifice rune on Mars, who turns the board into panpipes?',
        'Who turns the board into panpipes according to the original manual?']){
        const {assistant,ask}=fixture('ultima6');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('The wooden-input reading requires the same immediate log-to-board source instruction',()=>{
    const {assistant,knowledge:k}=fixture('ultima6');
    const run=facts=>lookupGraphQuestion({...k,facts,text:'Who turns the wooden board into panpipes?',subjectIds:['ultima6:knowledge:board']});
    assert.equal(run(k.facts).complete,true);
    for(const text of ['A yew log is nearby. Ask Julia to craft PANPIPES.',
        'Buy a yew log from Ben, take an iron key, cut it into a board, and ask Julia to craft PANPIPES.',
        'Buy an iron bar from Ben, cut it into a board, and ask Julia to craft PANPIPES.']){
        const r=run(k.facts.map(f=>f.id==='panpipes-makers'?{...f,text}:f));assert.equal(r.complete,false,text);assert.deepEqual(r.answerEntityIds,[]);
    }
    assistant.destroy();
});

test('A current dungeon source task identifies its escort target and keeps the objective wording',async()=>{
    const {assistant,ask}=fixture('alqadim');await answer(ask,'Where is the Old Dungeon hidden key?',['ch12_2']);
    const r=await answer(ask,'Who am I supposed to escort to the exit?',['ch12_4']);assert.match(r.text,/cyclops Pangar-Bek/);assert.match(r.text,/dungeon exit/);
    assert.notEqual((await ask('Have I already escorted him to the exit?')).decision,'answer');assistant.destroy();
});

test('The literal alternate Reef name resolves the rescue objective without inventing a rescue procedure',async()=>{
    const {assistant,ask}=fixture('alqadim');await answer(ask,'How do I get the Ship Orb?',['ch4_5']);
    const r=await answer(ask,'Who am I rescuing on the Reef of the Dead?',['ch4_2']);assert.match(r.text,/mermaid's sister locked in the stone cell/);
    assert.notEqual((await ask("Can the mermaid's sister join my party after I free her?")).decision,'answer');assistant.destroy();
});

test('Contextual actor and material roles cannot resolve from a stale, missing or different task',async()=>{
    for(const q of ['Who am I supposed to escort to the exit?','Who am I rescuing?']){
        const {assistant,ask}=fixture('alqadim');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
    for(const q of ['Who am I rescuing on the radioactive Reef of the Dead?','Who am I supposed to escort to the radioactive exit?',
        'Who am I rescuing on Mars?']){
        const {assistant,ask}=fixture('alqadim');await ask('How do I get the Ship Orb?');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
    const {assistant,ask}=fixture('ultima6');await ask('Who turns the board into panpipes?');
    assert.notEqual((await ask('How do I solve quantum turnip?')).decision,'answer');
    assert.notEqual((await ask('Where is the raw wood obtained?')).decision,'answer');assistant.destroy();
});

test('An explicit source area changes the objective context without asserting player travel',async()=>{
    const {assistant,ask}=fixture('alqadim');await answer(ask,'Where is the Old Dungeon hidden key?',['ch12_2']);
    await answer(ask,'Who am I rescuing on the Reef of the Dead?',['ch4_2']);assistant.destroy();
});
