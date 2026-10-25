// Source-first directed slots: no models, browser, saved state or source edits.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {allRecords, albion as source} from './load-records.mjs';
import {buildKnowledge, knowledgeDocument} from '../../js/assistant/knowledge.js';
import {lookupGraphQuestion, readGraphQuestion} from '../../js/assistant/knowledge-graph.js';

const manifest=JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/albion.json',import.meta.url)));
const k=buildKnowledge('albion',allRecords.albion,manifest);
const id=name=>[...k.entities.values()].find(entity=>entity.declared && entity.name===name)?.id;
const lookup=(text,name,options={})=>lookupGraphQuestion({...k,text,subjectIds:[id(name)],...options});
const names=result=>(result?.answerEntityIds || []).map(value=>k.entities.get(value).name);
const cases=[
    ['What is in his north cabinet?','Inspector Beegle','Canisters','beegle-room','container-contents'],
    ["What does Inspector Beegle's north cabinet contain?",'Inspector Beegle','Canisters','beegle-room','container-contents'],
    ['What can I find in his left cupboard?','Inspector Beegle','Rations','beegle-room','container-contents'],
    ['Where does Sira train spells?','Sira','Fasiir','iskai-training','training-location'],
    ['Where can Harriet learn magic?','Harriet','Drannagh','dji-cantos-training','training-location'],
    ['Where should I sell Krondir drops?','Krondir','Rabir','trade-hint-2','buyer'],
    ['Who buys Krondir drops?','Krondir','Rabir','trade-hint-2','buyer'],
    ['Who can I sell Krondir drops to?','Krondir','Rabir','trade-hint-2','buyer'],
    ['What can hold it?','AI Housing','Thorn Snare','ai-housing','control-method'],
    ['What can I use to immobilize AI Housing?','AI Housing','Thorn Snare','ai-housing','control-method']
];
for(const [text,subject,answer,fact,role] of cases)test(text,()=>{
    const result=lookup(text,subject);
    assert.equal(result?.complete,true);
    assert.deepEqual(names(result),[answer]);
    assert.deepEqual(result.factIds,[fact]);
    assert.equal(result.relation,role);
    const evidence=k.facts.find(value=>value.id===fact);
    assert.equal(evidence.text,evidence.witness);
    assert.ok(evidence.source.file && evidence.source.locator);
});

test('new metadata preserves all encoded documents and full source identities',()=>{
    assert.deepEqual(k.issues,[]);
    const fields=['id','subject','facet','aliases','text','witness','source','sourceRecordId'];
    const projected=manifest.facts.map(fact=>Object.fromEntries(fields.filter(field=>field in fact).map(field=>[field,fact[field]])));
    assert.equal(createHash('sha256').update(JSON.stringify(projected)).digest('hex'),'b512e9ca9aaee0817c570651397ab6b69703f6d4c1fe6fb42994b9122ed912a7');
    const encoded=JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/albion-embeddings.json',import.meta.url))).documents;
    assert.deepEqual(manifest.facts.map(fact=>({factId:fact.id,text:knowledgeDocument(fact)})),encoded.map(({factId,text})=>({factId,text})));
    assert.equal(k.facts.find(fact=>fact.id==='beegle-room').witness,source.QUEST_HINTS['toronto-intro']['beegle-room']);
    assert.equal(k.facts.find(fact=>fact.id==='ai-housing').witness,source.QUEST_HINTS.finale['ai-housing']);
    assert.equal(k.facts.find(fact=>fact.id==='trade-hint-2').witness,source.ALBION_TRADE_HINTS[2].text);
    assert.equal(k.facts.find(fact=>fact.id==='iskai-training').witness.includes(source.DB.magic[0].freeTraining),true);
    assert.equal(k.facts.find(fact=>fact.id==='dji-cantos-training').witness.includes(source.DB.magic[3].freeTraining),true);
});

test('all eligible full proofs are required and rejected sources cannot leak a role',()=>{
    for(const [text,subject,,fact] of cases){
        const result=lookup(text,subject,{isEligible:value=>value.id!==fact});
        assert.equal(result?.complete,false,text);
        assert.deepEqual(result.factIds,[],text);
        assert.deepEqual(result.answerEntityIds,[],text);
    }
});

test('unknown owner, container, quantity, identity, material, edition and source text are retained',()=>{
    for(const [text,subject] of [
        ['What is in his silver north cabinet?','Inspector Beegle'],
        ['What is in his 2 north cabinet?','Inspector Beegle'],
        ["What is in Anne's north cabinet?",'Inspector Beegle'],
        ['What is in his north cabinet from the external wiki?','Inspector Beegle'],
        ['Where does Sira train advanced spells?','Sira'],
        ['Where does silver Sira train spells?','Sira'],
        ['Where does Sira train spells for version 99?','Sira'],
        ['Where should I sell golden Krondir drops?','Krondir'],
        ['Where should I sell 2 Krondir drops?','Krondir'],
        ['Where should I sell Krondir drops from the external wiki?','Krondir'],
        ['What can hold the silver AI Housing?','AI Housing'],
        ['What can hold 2 AI Housings?','AI Housing'],
        ['What can hold it according to the external wiki?','AI Housing']
    ])assert.notEqual(lookup(text,subject)?.complete,true,text);
    assert.notEqual(lookup('What is in his north cabinet?','Canisters')?.complete,true);
    assert.notEqual(lookup('Where does Sira train spells?','Harriet')?.complete,true);
    assert.equal(readGraphQuestion('What can hold it if I already have it?'),null);
    assert.equal(readGraphQuestion('What is currently in his north cabinet?'),null);
});

function rewritten(factId,text){return k.facts.map(fact=>fact.id===factId?{...fact,text,witness:text}:fact);}

test('container co-occurrence, swapped contents, negation and another owner are not literal contents',()=>{
    for(const text of [
        "Inspector Beegle's room: search the north cabinet. Canisters are nearby.",
        "Inspector Beegle's room: search the left cupboard (canisters) and the north cabinet (rations).",
        "Inspector Beegle's room: do not search the north cabinet (canisters).",
        "Anne's room: search the north cabinet (canisters).",
        "Inspector Beegle's room: search the north cabinet (maybe canisters)."
    ]){
        const result=lookup('What is in his north cabinet?','Inspector Beegle',{facts:rewritten('beegle-room',text)});
        assert.equal(result.complete,false,text); assert.deepEqual(result.answerEntityIds,[],text);
    }
});

test('a teacher residence or another practitioner cannot substitute the explicit training route',()=>{
    for(const text of [
        'Sira knows Fasiir. Fasiir lives in Jirinaar.',
        'Iskai (Dji-Kas): practitioner Harriet; reagent None; training: Fasiir in Dji-Kas guild (Jirinaar).',
        'Iskai (Dji-Kas): practitioner Sira; reagent None; training: maybe Fasiir in Dji-Kas guild (Jirinaar).',
        'Iskai (Dji-Kas): practitioner Sira; reagent None; training: Drannagh in Dji-Cantos building.'
    ])assert.equal(lookup('Where does Sira train spells?','Sira',{facts:rewritten('iskai-training',text)}).complete,false,text);
});

test('drop co-occurrence or negated/uncertain buyer cannot assert a selling destination',()=>{
    for(const text of [
        'Krondirs drop Meat and Trii. Rabir is a merchant.',
        'Krondirs drop Meat and Trii; the walkthrough does not list Rabir as a buyer.',
        'Krondirs drop Meat and Trii; the walkthrough lists Rabir as maybe the useful early buyer for those drops.',
        'Krondirs drop Meat and Trii; the walkthrough lists Anne as the useful early buyer for those drops.'
    ])assert.equal(lookup('Where should I sell Krondir drops?','Krondir',{facts:rewritten('trade-hint-2',text)}).complete,false,text);
});

test('control requires the exact named or subject-bound action, without deriving killing or player state',()=>{
    for(const text of [
        'AI Housing is a final encounter. Thorn Snare is nearby.',
        'AI Housing is immune to weapons. Thorn Snare cannot hold it.',
        'AI Housing is immune to weapons. Thorn Snare may hold it.',
        'AI Housing is immune to weapons. Thorn Snare can hold Kamulos.',
        'Kamulos is immune to weapons. Thorn Snare can hold it.'
    ])assert.equal(lookup('What can hold it?','AI Housing',{facts:rewritten('ai-housing',text)}).complete,false,text);
    const result=lookup('What can hold it?','AI Housing');
    const full=k.facts.find(fact=>fact.id===result.factIds[0]).text;
    assert.match(full,/not meant to be killed/);
    assert.match(full,/ending triggers when a party member falls/);
    assert.equal(lookup('What killed it?','AI Housing'),null);
});
