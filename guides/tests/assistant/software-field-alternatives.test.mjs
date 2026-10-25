import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {supportsSoftwareFieldAlternatives as supports} from '../../js/assistant/software-capabilities.js';

const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url)));
const knowledge=buildKnowledge('starcraft',read('./evidence/conversation-starcraft-source-records.json'),read('../../data/assistant/knowledge/starcraft.json'));
assert.deepEqual(knowledge.issues,[]);
function fixture(suffix,field){
    const fact=knowledge.facts.find(fact=>fact.id===`starcraft:knowledge:${suffix}`),owner=knowledge.entities.get(fact.entityId);
    const entry=knowledge.sourceFields.entries.find(entry=>entry.factId===fact.id && entry.key===field.key && entry.selectors.includes(field.selectors[0]));
    assert.ok(entry);
    return {field,fact,entry,subjectLabels:[owner.name,...owner.aliases]};
}
const mode=()=>fixture('ualberta-client',{key:'identity',selectors:['execution-mode'],contrastText:'or',alternativeTexts:['a client program','a module library']});
const updates=()=>fixture('schnail-updates',{key:'use',selectors:['updates'],contrastText:'alone-or-too',alternativeTexts:['the client','the game']});

test('Execution alternatives require a typed complete client-executable versus module-library contrast',()=>{
    const value=mode();assert.equal(supports(value),true);
    assert.equal(supports({...value,field:{...value.field,alternativeTexts:['a module DLL','a client executable']}}),true);
    assert.equal(supports({...value,entry:undefined}),true,'Authored full-field metadata proves the same literal relation');
    for(const alternatives of [['a client program','a quantum module library'],['a client program','a module library','a script'],
        ['a client program','not a module library'],['a client program','another client program'],['a Linux client program','a module library']])
        assert.equal(supports({...value,field:{...value.field,alternativeTexts:alternatives}}),false,JSON.stringify(alternatives));
    assert.equal(supports({...value,field:{...value.field,contrastText:'not-but'}}),false);
    assert.ok(value.fact.text.includes('only for the first game after starting that EXE'));
});

test('Alone-or-too update questions require actual asserted both-target scope in one literal argument group',()=>{
    const value=updates();assert.equal(supports(value),true);
    assert.equal(supports({...value,field:{...value.field,alternativeTexts:['game','client']}}),true);
    for(const alternatives of [['client','server'],['client','game','launcher'],['client alone','game'],['client','every game']])
        assert.equal(supports({...value,field:{...value.field,alternativeTexts:alternatives}}),false,JSON.stringify(alternatives));
    assert.equal(supports({...value,field:{...value.field,contrastText:'or'}}),false);
    const split={...value.entry,arguments:[{bindings:[{role:'recipient',mention:'client'}]},{bindings:[{role:'recipient',mention:'game'}]}]};
    assert.equal(supports({...value,entry:split}),false,'Separate groups cannot manufacture a both-target assertion');
});

test('Alternative helpers reject wrong fields, owners, provenance, polarity, co-occurrence and clipped complete witnesses',()=>{
    for(const value of [mode(),updates()]){
        for(const extra of [{subjectLabels:['Another software project']},{entry:{...value.entry,explicit:false}},
            {entry:{...value.entry,source:{...value.entry.source,locator:'unrelated'}}},
            {entry:{...value.entry,factId:'unrelated-proof'}},{fact:{...value.fact,conflict:true}},
            {fact:{...value.fact,source:{...value.fact.source,review:'conflicting'}}},
            {fact:{...value.fact,source:undefined}},
            {fact:{...value.fact,text:value.fact.text.slice(0,-1),witness:value.fact.witness.slice(0,-1)}},
            {field:{...value.field,selectors:[...value.field.selectors,'checksum']}},
            {field:{...value.field,unknownQualifierTexts:['radioactive']}},
            {field:{...value.field,key:'composition',selectors:['metal']}}])
            assert.equal(supports({...value,...extra}),false);
    }
    for(const [value,text]of [[mode(),"Outside research: UAlbertaBot's README never uses a client EXE instead of a module DLL."],
        [mode(),"Outside research: UAlbertaBot's README lists a client EXE and a module DLL."],
        [updates(),'No automatic updates for both client and game.'],
        [updates(),'Client and game are mentioned; automatic updates are unspecified.']]){
        const fact={...value.fact,text,witness:text},entry={...value.entry,witness:text};
        assert.equal(supports({...value,fact,entry}),false,text);
    }
});

test('Artifact semantics depend on field roles rather than a game or project name',()=>{
    const original=mode(),text="Outside research: SamplePlanner's README uses a client EXE instead of a module DLL and warns that a restart is needed.";
    const fact={...original.fact,subject:'SamplePlanner executable mode',aliases:[],text,witness:text};
    assert.equal(supports({...original,fact,entry:{...original.entry,witness:text},subjectLabels:['SamplePlanner']}),true);
});
