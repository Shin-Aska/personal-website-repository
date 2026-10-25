import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

function fixture(game,mutate=()=>{}){
    const records=game==='starcraft'?JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url))):allRecords[game];
    const manifest=JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url)));mutate(manifest);
    const knowledge=buildKnowledge(game,records,manifest);assert.deepEqual(knowledge.issues,[]);
    const source=createAssistant({gameId:game,records,fallback:null}),assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:source,
        classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    const ask=async q=>{const r=await assistant.answerAsync(q);assert.deepEqual(r.actions,[],q);assert.deepEqual(r.stateChanges,[],q);
        assert.equal(source.inspect().claimCount,0,q);return r;};
    return {assistant,ask,source};
}
async function answered(ask,q,contains){const r=await ask(q);assert.equal(r.decision,'answer',`${q}: ${r.text}`);
    for(const word of contains)assert.ok(r.text.includes(word),r.text);assert.ok(r.sources.length);return r;}

test('Permission method, conditional next contact and shrine word retain their separate source roles',async()=>{
    const {assistant,ask}=fixture('ultima6');
    const r=await answered(ask,'How do I get permission to borrow the Compassion rune in Britain?',['Anya','Blue Boar','YES','Return to Ariana']);
    assert.deepEqual(r.knowledge.factIds,['ariana-consent','anya-permission','ariana-rune']);
    await answered(ask,'Who do I return to after getting her blessing?',['Return to Ariana','confirm permission']);
    const authority=await answered(ask,'Who gives me permission to borrow the rune?',['Anya','Blue Boar','YES']);
    assert.match(authority.text,/^Anya:/);
    await answered(ask,'And what word do I chant when cleansing that shrine?',['chant MU','using the rune']);
    assert.notEqual((await ask('Did Ariana already give me the rune in my saved game?')).decision,'answer');assistant.destroy();
});

test('Permission proof needs the complete authority procedure, not only a requirement mention',async()=>{
    const {assistant,ask}=fixture('ultima6',m=>{m.links.find(l=>l.id==='compassion-rune-permission-anya').evidenceFactIds=['ariana-consent'];});
    assert.notEqual((await ask('How do I get permission to borrow the Compassion rune?')).decision,'answer');assistant.destroy();
});

test('Permission scope cannot substitute a different object, magical blessing, location, number or source',async()=>{
    for(const q of ['How do I get permission to borrow Ariana?','How do I get permission to borrow the radioactive Compassion rune?',
        'How do I get permission to borrow 30 Compassion runes?','How do I get permission to borrow the Compassion rune in Britain on Mars?',
        'How do I get permission to borrow the Compassion rune at the Blue Boar Tavern?',
        'How do I get permission to borrow the Compassion rune in the SNES edition?',
        'How do I get permission to borrow the Compassion rune according to the original manual?',
        'Who do I return to after getting her blessing?']){
        const {assistant,ask}=fixture('ultima6');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('Attack comparison displays both reviewed literal profiles and a grounded rear-coverage answer',async()=>{
    const {assistant,ask}=fixture('alqadim');
    const comparison=await answered(ask,'What makes the Wide Swing different from the basic attack?',['stronger cut','left and right','second action circle','Click the action button']);
    assert.deepEqual(comparison.knowledge.factIds,['swing-wide-swing','swing-quick-swing']);assert.equal(comparison.consultation,undefined);
    await answered(ask,'How do I learn the Full-Circle Swing?',['360-degree']);
    await answered(ask,'Does that attack catch enemies behind me too?',['360-degree','behind the Corsair']);assistant.destroy();
});

test('Unsupported property subjects and constraints cannot become recommendation prompts or fresh facts',async()=>{
    for(const [game,q] of [
        ['alqadim','What makes radioactive Wide Swing different from the basic attack?'],
        ['alqadim','What makes the Wide Swing different from the basic attack in 30 turns?'],
        ['alqadim','What makes the Wide Swing different from the basic attack according to the original manual?'],
        ['alqadim','Does the Wide Swing catch enemies behind me too?'],
        ['alqadim','Does that attack catch enemies behind me too?'],
        ['ultima5','Are copper mantras and Words of Power used for the same thing?'],
        ['ultima5','Are mantras and two Words of Power used for the same thing?']
    ]){const {assistant,ask}=fixture(game);const r=await ask(q);assert.notEqual(r.decision,'answer',q);assert.equal(r.consultation,undefined,q);assistant.destroy();}
});

test('A literal distinct-use paragraph answers the complete two-subject question',async()=>{
    const {assistant,ask}=fixture('ultima5');const r=await answered(ask,'Are mantras and Words of Power used for the same thing?',
        ['Mantras are used at the Shrines of Virtue','Words of Power unlock the dungeons']);assert.equal(r.consultation,undefined);assistant.destroy();
});

test('A naming wrapper establishes one term for type and quick-start version questions',async()=>{
    const {assistant,ask}=fixture('starcraft');
    await answered(ask,'When people say BWAPI, do they mean a ready-made opponent?',['C++ framework','programming API','not a prepackaged opponent']);
    await answered(ask,'Which Brood War version does its quick start target?',['1.16.1','does not certify']);
    assert.notEqual((await ask('Can you verify BWAPI is installed on my computer?')).decision,'answer');assistant.destroy();
});

test('Naming syntax preserves unknown type modifiers, clauses, sources and save-state boundaries',async()=>{
    for(const q of ['When people say radioactive BWAPI, do they mean a ready-made opponent?',
        'When people say BWAPI, do they mean a radioactive ready-made opponent?',
        'When people say BWAPI in the SNES edition, do they mean a ready-made opponent?',
        'When people say BWAPI, do they mean a ready-made opponent according to the original manual?',
        'When people say BWAPI if I have a key, do they mean a ready-made opponent?',
        'When people say BWAPI, is it already installed in my current save?',
        'When people say they, do they mean a ready-made opponent?']){
        const {assistant,ask}=fixture('starcraft');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
});

test('Runtime comparison retains the actual tool requirement and the source warning against substitution',async()=>{
    const {assistant,ask}=fixture('starcraft');await answered(ask,'What is PurpleWave?',['Scala AI bot']);
    const r=await answered(ask,'Does it use the same Java 21 recommendation as SCHNAIL?',['32-bit JDK 8','32-bit BWAPI','Do not substitute']);
    assert.equal(r.consultation,undefined);assistant.destroy();
    for(const q of ['Does PurpleWave use the same Java 23 recommendation as SCHNAIL?',
        'Does radioactive PurpleWave use the same Java 21 recommendation as SCHNAIL?',
        'From this guide only, does PurpleWave use the same Java 21 recommendation as SCHNAIL?']){
        const f=fixture('starcraft');assert.notEqual((await f.ask(q)).decision,'answer',q);f.assistant.destroy();
    }
});

test('Authorship keeps both subject and author available for the related framework documentation',async()=>{
    const {assistant,ask}=fixture('starcraft');await answered(ask,'What is UAlbertaBot?',['competition bot']);
    await answered(ask,'Who made that bot according to its own documentation?',['David Churchill','do not establish']);
    const r=await answered(ask,'Where can I read the framework documentation?',['BWAPI Official Documentation','BWAPI Wiki']);
    assert.ok(r.sourceLinks.some(link=>link.url==='https://bwapi.github.io/'));assistant.destroy();
});

test('An exact item group survives source-only inside scope and plural transport',async()=>{
    const {assistant,ask}=fixture('albion');
    await answered(ask,'How do I access the COM room?',['1042','Joe']);
    const pickup=await answered(ask,'Once inside, where do I find the Pistol and its canisters?',['damaged console','Pistol + Canisters']);
    assert.equal(pickup.knowledge.focusEntityId,'albion:knowledge:pistol-canisters');
    const storage=await answered(ask,'How can I carry them past security?',['wall cabinet','service level','before passing security']);
    assert.deepEqual(storage.knowledge.factIds,['hide-weapon']);assert.notEqual((await ask('Is my Pistol safely hidden there already?')).decision,'answer');assistant.destroy();
});

test('Group references need every named component and cannot erase quantities, suffixes or editions',async()=>{
    for(const q of ['Where do I find the Pistol and radioactive canisters?','Where do I find 30 Pistols and Canisters?',
        'Where do I find the Pistol and Canisters and a Quantum Turnip?',
        'Where do I find the Pistol and Canisters in the COM room with radioactive quantum parts?',
        'Where do I find the Pistol and Canisters in the SNES edition?',
        'How can I carry the Pistol and Canisters past radioactive security?',
        'Once inside, where do I find the Pistol and its canisters?']){
        const {assistant,ask}=fixture('albion');assert.notEqual((await ask(q)).decision,'answer',q);assistant.destroy();
    }
    const {assistant,ask}=fixture('albion');await answered(ask,'Where do I find the Pistol and Canisters?',['Pistol + Canisters']);
    assert.notEqual((await ask('Where do I find the Pistol and radioactive Canisters?')).decision,'answer');
    assert.notEqual((await ask('How can I carry them past security?')).decision,'answer');assistant.destroy();
});

test('A changed topic cannot lend its older place proof to an omitted inside reference',async()=>{
    const {assistant,ask}=fixture('albion');await answered(ask,'How do I access the COM room?',['1042']);
    assert.notEqual((await ask('How old is Dreamshield?')).decision,'answer');
    assert.notEqual((await ask('Once inside, where do I find the Pistol and Canisters?')).decision,'answer');assistant.destroy();
});

test('An unsuccessful compound restores the complete grounded group and place memory',async()=>{
    const {assistant,ask}=fixture('albion');await answered(ask,'Where do I find the Pistol and Canisters?',['Pistol + Canisters']);
    assert.notEqual((await ask('How can I carry them past security, and are they in my current inventory?')).decision,'answer');
    await answered(ask,'How can I carry them past security?',['wall cabinet']);assistant.destroy();
});

test('A newly named ammunition entity cannot turn inventory counts into source properties',async()=>{
    const {assistant,ask}=fixture('albion');
    await answered(ask,'What does Pistol use?',['Canisters']);
    for(const q of ['How many Canisters do I currently have?','How much gold does my party carry?'])
        assert.notEqual((await ask(q)).decision,'answer',q);
    await answered(ask,'How can I carry Canisters past security?',['wall cabinet']);assistant.destroy();
});

test('An environmental damage question retains the existing source relation',async()=>{
    const {assistant,ask}=fixture('ultima5');
    await answered(ask,'How do I use the Magic Carpet?',['Magic Carpet']);
    await ask('Can it cross mountains?');
    await answered(ask,'Does rough sea damage it or the party?',['rough sea still damages the party']);assistant.destroy();
});
