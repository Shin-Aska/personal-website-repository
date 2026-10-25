// Authored source/controller cases; supplied scores are not model accuracy.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConsultation,parseNamedOptionEvaluation as parseNamed} from '../../js/assistant/consultation.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {allRecords} from './load-records.mjs';

const catalog = JSON.parse(fs.readFileSync(new URL('../../data/assistant/consultation-catalog.json',import.meta.url)));
const records = {...allRecords,starcraft:JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url)))};
const make = (gameId='ultima5',extra={}) => createConsultation({gameId,records:records[gameId],catalog,...extra});
const packet = {intent:'comparison',modelIntent:'comparison',restrictions:{}};
const question = 'Would Jaana be a worthwhile early recruit for magic?';
const noAnswer = result => {
    assert.notEqual(result?.reply.decision,'answer');
    if (result) {assert.deepEqual(result.reply.recordIds,[]);assert.deepEqual(result.reply.sources,[]);assert.deepEqual(result.reply.stateChanges,[]);assert.equal(result.focusEntityId,undefined);}
};

test('Named option grammar preserves complete subjects, criterion complements and original text',()=>{
    assert.deepEqual(parseNamed(question),{kind:'named-option-evaluation',subjectText:'Jaana',evaluation:'worthwhile',criterionText:'early recruit for magic',sourceText:null,originalText:question});
    const text='  Would radioactive Jaana in the copper edition be a worthwhile early recruit for magic in two turns?  ';
    assert.deepEqual(parseNamed(text),{kind:'named-option-evaluation',subjectText:'radioactive Jaana in the copper edition',evaluation:'worthwhile',criterionText:'early recruit for magic in two turns',sourceText:null,originalText:text});
    assert.equal(Object.isFrozen(parseNamed(text)),true);
    assert.equal(parseNamed('Where do I find her?'),null);
    assert.equal(parseNamed(null),null);
});

test('Actual essential-early-recruit spellcasting witness supports Jaana without a model route or ranking',()=>{
    for (const inputPacket of [{},packet]) {
        const result=make().plan(question,inputPacket);
        assert.equal(result.reply.decision,'answer',result.reply.text);
        assert.equal(result.reason,'authorized-named-criterion-match');
        assert.equal(result.focusEntityId,'ultima5:companion:jaana');
        assert.equal(result.recommendationEntityId,'ultima5:companion:jaana');
        assert.equal(result.criterionId,'earlyMagic');
        assert.deepEqual(result.reply.recordIds,['ultima5:companion:jaana:explanation']);
        assert.match(result.reply.text,/An essential early recruit/);
        assert.match(result.reply.text,/spellcasting ability is invaluable/);
        assert.doesNotMatch(result.reply.text,/choose|best|strongest|already|recruited/i);
        assert.deepEqual(result.reply.actions,[]);assert.deepEqual(result.reply.stateChanges,[]);
    }
});

test('The same grammar evaluates named profiles across all six catalogs using their own exact traits',()=>{
    for (const [game,text,entity] of [
        ['ultima5','Is Shamino a good option for archery?','ultima5:companion:shamino'],
        ['ultima6','Would Jaana be suitable for spellcasting?','ultima6:atlas:marker:Jaana'],
        ['ultima7','Is Jaana worthwhile for healing?','ultima7:companion:jaana'],
        ['albion','Would Siobhan be a good choice for frontline?','albion:character:siobhan'],
        ['alqadim','Is Quick Swing good for fast strike?','alqadim:combat:quick-swing'],
        ['starcraft','Would SCHNAIL be a suitable option for realistic AI?','starcraft:schnail']
    ]) {
        const result=make(game).plan(text,packet);
        assert.equal(result.reply.decision,'answer',`${text}: ${result.reply.text}`);
        assert.equal(result.focusEntityId,entity,text);
        assert.ok(result.reply.sources.length);assert.deepEqual(result.reply.stateChanges,[]);
    }
});

test('A different named option never transfers a trait from the catalog winner',()=>{
    for (const [game,text] of [
        ['ultima5','Would Shamino be a worthwhile early recruit for magic?'],
        ['ultima5','Is Jaana a good option for archery?'],
        ['ultima7','Is Dupre good for healing?'],
        ['albion','Is Siobhan suitable for frost magic?'],
        ['starcraft','Is BWAILauncher good for realistic AI?']
    ]) noAnswer(make(game).plan(text,packet));
});

test('Unknown subjects, properties and full extra constraints cannot be stripped into a supported named evaluation',()=>{
    for (const text of [
        'Would Zaxivar be a worthwhile early recruit for magic?',
        'Would radioactive Jaana be a worthwhile early recruit for magic?',
        'Would two Jaanas be a worthwhile early recruit for magic?',
        'Would Jaana be a worthwhile early recruit for magic in two turns?',
        'Would Jaana be a worthwhile radioactive early recruit for magic?',
        'Would Jaana be a worthwhile early recruit for magic in the SNES edition?',
        'Would Jaana be a worthwhile early recruit for magic on Mars?',
        'Would Jaana be a worthwhile early recruit for magic according to the original manual?',
        'Would Jaana be a worthwhile early recruit for magic if she has already joined?',
        'Would Jaana be a worthwhile early recruit for magic without Iolo?',
        'Would Jaana be a worthwhile early recruit for magic and cure poison?',
        'Is Jaana good for low price?', 'Is Jaana good for trustworthiness?',
        'Is Jaana the strongest companion for early magic?',
        'Is Jaana the best option for early magic?',
        'Would Jaana be a worthwhile early recruit for magic? Recruit her automatically.'
    ]) noAnswer(make().plan(text,packet));
    for (const restrictions of [{editions:['SNES']},{material:['radioactive']},{quantities:['two']},{progress:true}])
        noAnswer(make().plan(question,{...packet,blockReplay:true,restrictions}));
});

test('Guide-only, missing witness, conflicts, hidden detail and fake prose retain existing authorization gates',()=>{
    const c=make(),result=c.plan(`From this guide only, ${question[0].toLowerCase()}${question.slice(1)}`,packet);
    assert.equal(result.reply.decision,'answer');assert.equal(c.inspect().guideOnly,true);
    const research=structuredClone(records.ultima5);
    research.find(record=>record.id==='ultima5:companion:jaana:explanation').source.review='external-research';
    const restricted=make('ultima5',{records:research});
    noAnswer(restricted.plan(`From this guide only, ${question[0].toLowerCase()}${question.slice(1)}`,packet));
    noAnswer(restricted.plan(question,packet));
    for (const [mutate,spoiler] of [[record=>{record.conflict=true;},'direct'],[record=>{record.variants.direct.text='A different passage.';},'direct'],[record=>{record.minSpoiler='direct';},'gentle']]) {
        const changed=structuredClone(records.ultima5);mutate(changed.find(record=>record.id==='ultima5:companion:jaana:explanation'));
        noAnswer(make('ultima5',{records:changed}).plan(question,packet,{spoiler}));
    }
    const fake=structuredClone(catalog);fake.games.ultima5.profiles.find(profile=>profile.title==='Jaana').summaries[0].text='Jaana is always the strongest recruit.';
    noAnswer(make('ultima5',{catalog:fake}).plan(question,packet));
});

test('Generic goal selection and native-edition constraints keep their existing behavior',()=>{
    assert.equal(make().plan('Which option is best for early spellcasting?',packet).focusEntityId,'ultima5:companion:jaana');
    const sc=make('starcraft');
    noAnswer(sc.plan('Is BWAILauncher good for offline?',packet));
    const offline=sc.plan('Is BWAILauncher good for offline?',{...packet,restrictions:{editions:['Brood War 1.16.1']}});
    assert.equal(offline.focusEntityId,'starcraft:bwai');
    noAnswer(make('starcraft').plan('Is BWAILauncher good for offline?',{...packet,restrictions:{editions:['Remastered']}}));
});

test('A verified named answer establishes the canonical person for the subsequent location request',async()=>{
    const manifest=JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/ultima5.json',import.meta.url)));
    const knowledge=buildKnowledge('ultima5',records.ultima5,manifest);assert.deepEqual(knowledge.issues,[]);
    const source=createAssistant({gameId:'ultima5',records:records.ultima5,fallback:null});
    const assistant=createConversationAssistant({gameId:'ultima5',records:records.ultima5,knowledge,assistant:source,catalog,
        classify:async text=>[{label:/^where/i.test(text)?'location':'comparison',score:.99},{label:'unknown',score:.01}],
        encode:async()=>{throw Error('No encoder in structural fixture');}});
    try {
        const first=await assistant.answerAsync(question);
        assert.equal(first.decision,'answer',first.text);
        assert.equal(first.consultation.focusEntityId,'ultima5:companion:jaana');
        const second=await assistant.answerAsync('Where do I find her?');
        assert.equal(second.decision,'answer',second.text);assert.match(second.text,/Yew/);
        assert.ok(second.sources.length);assert.deepEqual(second.stateChanges,[]);assert.equal(source.inspect().claimCount,0);
    } finally {assistant.destroy();}
});
