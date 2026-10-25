import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {authorize} from '../../js/assistant/policy.js';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {guardSourceFieldReply as guard} from '../../js/assistant/source-field-guard.js';

const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url)));
const pools={...allRecords,starcraft:read('./evidence/conversation-starcraft-source-records.json')};
function fixture(game,ids,subject,fields){
    const records=pools[game],knowledge=buildKnowledge(game,records,read(`../../data/assistant/knowledge/${game}.json`));
    assert.deepEqual(knowledge.issues,[]);
    const originals=ids.map(id=>authorize(records.find(record=>record.id===id),'direct'));
    assert.ok(originals.every(Boolean));
    const entity=knowledge.entities.get(subject);
    return {records,knowledge,sourceFields:knowledge.sourceFields,subjectEntityId:subject,
        subjectLabels:entity?[entity.name,...entity.aliases]:[],grounded:true,referentIds:[subject],isEligible:()=>true,isEligibleFact:()=>true,
        frame:{kind:'source-fields',complete:true,staticEligible:true,subjectText:entity?.name,fields,contextTexts:[],constraints:{},unresolvedTexts:[]},
        reply:{decision:'answer',text:originals.map(record=>record.text).join('\n'),recordIds:ids,sources:originals.map(record=>record.source),
            actions:[],choices:[],stateChanges:[]}};
}

test('An actual ordinary raw effect accepts its canonical object but cannot silently discard another object or role',()=>{
    const input=fixture('albion',['albion:item:dreamshield:use'],'albion:item:dreamshield',
        [{key:'use',selectors:['effect'],objectTexts:['Dreamshield'],objectRole:'object'}]);
    assert.equal(guard(input).complete,true);
    for(const field of [{...input.frame.fields[0],objectTexts:['radioactive Dreamshield']},
        {...input.frame.fields[0],objectTexts:['the quantum turnip']},
        {...input.frame.fields[0],objectRole:'input'},
        {...input.frame.fields[0],objectRole:'unknown-role'},
        {...input.frame.fields[0],objectTexts:['Dreamshield','another object']}])
        assert.equal(guard({...input,frame:{...input.frame,fields:[field]}}),false);
    assert.equal(guard({...input,frame:{...input.frame,fields:[{...input.frame.fields[0],objectTexts:['it']}]},grounded:false}),false);
});

test('Actual direct object roles require all whole supporting facts, their real displayed source records and eligibility',()=>{
    const knowledge=buildKnowledge('ultima6',pools.ultima6,read('../../data/assistant/knowledge/ultima6.json'));
    const entry=knowledge.sourceFields.entries.find(entry=>entry.factId==='red-lens' && entry.key==='creator');
    const required=entry.arguments[0].requiredFactIds.map(id=>knowledge.facts.find(fact=>fact.id===id));
    const ids=[...new Set(required.map(fact=>fact.sourceRecordId))];
    assert.equal(ids.length,2);
    const input=fixture('ultima6',ids,'ultima6:knowledge:gargoyle-lens',
        [{key:'creator',selectors:['repair'],objectTexts:['the broken red lens'],objectRole:'object'}]);
    assert.equal(guard(input).complete,true);
    const remaining=ids.slice(0,1),one=fixture('ultima6',remaining,'ultima6:knowledge:gargoyle-lens',input.frame.fields);
    assert.equal(guard(one),false,'Delivery alone cannot prove a repair actor');
    assert.equal(guard({...input,isEligibleFact:fact=>fact.id!=='lor-lens-keyword'}),false);
    assert.equal(guard({...input,reply:{...input.reply,text:required[0].witness}}),false,'No source or condition clipping');
    assert.equal(guard({...input,reply:{...input.reply,sources:input.reply.sources.slice(0,1)}}),false,'A hidden parent cannot borrow another citation');
    assert.equal(guard({...input,frame:{...input.frame,fields:[{...input.frame.fields[0],objectTexts:['a radioactive red lens']}]}}),false);
});

test('Actual typed source actors are independently verified and dependent actors need one complete earlier field',()=>{
    const input=fixture('ultima7',['ultima7:companion:tseramed:explanation'],'ultima7:companion:tseramed',
        [{key:'identity',selectors:['role'],sourceActorText:'the character notes'},
            {key:'identity',selectors:['focus'],sourceActorText:'they'}]);
    assert.equal(guard(input).complete,true);
    for(const actor of ['the radioactive character notes','the 2030 official manual','they'])
        assert.equal(guard({...input,frame:{...input.frame,fields:[{...input.frame.fields[0],sourceActorText:actor}]}}),false,actor);
    const effect=fixture('albion',['albion:item:dreamshield:use'],'albion:item:dreamshield',
        [{key:'use',selectors:['effect'],sourceActorText:'the character notes'}]);
    assert.equal(guard(effect),false,'An item effect cannot be attributed to character notes');
    const ordinary=fixture('albion',['albion:item:dreamshield:use'],'albion:item:dreamshield',
        [{key:'use',selectors:['effect'],metadataTexts:['line'],presentationTexts:['practical']}]);
    assert.equal(guard(ordinary).complete,true);
    assert.equal(guard({...ordinary,frame:{...ordinary.frame,fields:[{...ordinary.frame.fields[0],metadataTexts:['unreviewed manual']}]}}),false);
});

test('Actual raw update fields require complete documented alternatives, including their scope and operator',()=>{
    const knowledge=buildKnowledge('starcraft',pools.starcraft,read('../../data/assistant/knowledge/starcraft.json'));
    const fact=knowledge.facts.find(fact=>fact.id==='starcraft:knowledge:schnail-updates');
    const field={key:'use',selectors:['updates'],alternativeTexts:['the client','the game'],contrastText:'alone-or-too'};
    const input=fixture('starcraft',[fact.sourceRecordId],'starcraft:schnail',[field]);
    assert.equal(guard(input).complete,true);
    for(const alternatives of [['client','server'],['client','game','launcher'],['client','every game']])
        assert.equal(guard({...input,frame:{...input.frame,fields:[{...field,alternativeTexts:alternatives}]}}),false);
    assert.equal(guard({...input,frame:{...input.frame,fields:[{...field,contrastText:'not-but'}]}}),false);
});

test('Purposes retain their complete operands and cannot turn an available effect into an unrelated goal',()=>{
    const knowledge=buildKnowledge('ultima5',pools.ultima5,read('../../data/assistant/knowledge/ultima5.json'));
    const fact=knowledge.facts.find(fact=>fact.id==='sceptre-carpet');
    const field={key:'method',selectors:['cross'],purposeTexts:['to pick it up'],unknownQualifierTexts:['to pick it up']};
    const input=fixture('ultima5',[fact.sourceRecordId],fact.entityId,[field]);
    assert.equal(guard(input).complete,true);
    for(const purpose of ['to collect exactly two radioactive parcels','to retrieve the quantum turnip','to pick another item up'])
        assert.equal(guard({...input,frame:{...input.frame,fields:[{...field,purposeTexts:[purpose],unknownQualifierTexts:[purpose]}]}}),false);
    assert.equal(guard({...input,grounded:false}),false,'A purpose pronoun cannot invent its referent');
    const effect=fixture('albion',['albion:item:dreamshield:use'],'albion:item:dreamshield',
        [{key:'use',selectors:['effect'],purposeTexts:['to collect the quantum turnip']}]);
    assert.equal(guard(effect),false);
});

test('A generic object never discovers its own missing conversation context from one available source group',()=>{
    const knowledge=buildKnowledge('ultima5',pools.ultima5,read('../../data/assistant/knowledge/ultima5.json'));
    const fact=knowledge.facts.find(fact=>fact.id==='faulinei-timing');
    const input=fixture('ultima5',[fact.sourceRecordId],fact.entityId,
        [{key:'use',selectors:[],objectTexts:['it'],objectRole:'object'}]);
    input.frame.subjectText=null;
    const entry=knowledge.sourceFields.entries.find(entry=>entry.factId===fact.id && entry.key==='use');
    input.referentIds=[entry.arguments[0].bindings.find(binding=>binding.role==='object').entityId];
    assert.equal(guard(input).complete,true,'An actual grounded same-entry object scopes its recorded use');
    assert.equal(guard({...input,grounded:false,referentIds:[]}),false);
    assert.equal(guard({...input,subjectEntityId:'unrelated-owner',subjectLabels:['Unknown owner'],referentIds:[]}),false);
    assert.equal(guard({...input,knowledge:undefined,grounded:false,referentIds:[]}),false,'Missing modern scope data fails closed without throwing');
});
