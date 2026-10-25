import test from 'node:test';
import assert from 'node:assert/strict';
import {planSourceFields,sourceFieldCardinality,resolveSourceFrameIdentity} from '../../js/assistant/source-field-router.js';
import {parseSourceRequestFrame} from '../../js/assistant/request-frame.js';

const source={file:'guide.js',locator:'people[0]',review:'extracted'};
function fixture(){
    const record={id:'raw',entityId:'officer',title:'Survey Officer',aliases:['Officer'],kind:'person',relation:'explanation',
        text:'Survey Officer: Engineer. Focus: Navigation. Strength 16, Dexterity 17.',source,editions:[]};
    const fact={id:'profile',entityId:'officer',subject:'Survey Officer',aliases:[],text:record.text,witness:record.text,
        recordId:'focused',sourceRecordId:'raw',source,record:{...record,id:'focused'},resources:[]};
    const knowledge={entities:new Map([['officer',{id:'officer',name:'Survey Officer',aliases:['Officer'],kind:'person'}],
        ['rival',{id:'rival',name:'Rival Officer',aliases:[],kind:'person'}]]),facts:[fact],sourceRecords:[record],sourceContexts:[]};
    const field=(key,selectors,extra={})=>({factId:'profile',recordId:'focused',sourceRecordId:'raw',subjectEntityIds:['officer'],
        key,selectors,witness:record.text,source,explicit:true,...extra});
    const index={issues:[],entries:[field('identity',['role','focus']),field('stats',['strength','dexterity'])]};
    const frame={kind:'source-fields',originalText:'Describe Survey Officer role, focus and strength.',subjectText:'Survey Officer',
        complete:true,staticEligible:true,fields:[{key:'identity',selectors:['role','focus']},{key:'stats',selectors:['strength']}],constraints:{},contextTexts:[]};
    return {knowledge,index,frame,field,fact,record};
}

test('Several fields of one canonical owner share a complete original witness',()=>{
    const f=fixture(),answer=planSourceFields(f);
    assert.equal(answer.status,'answer');assert.equal(answer.ownerEntityId,'officer');
    assert.deepEqual(answer.proofs,[f.fact]);assert.equal(answer.fields.length,2);
    assert.equal(answer.proofs[0].text,'Survey Officer: Engineer. Focus: Navigation. Strength 16, Dexterity 17.');
});
test('Complete canonical names take precedence over ambiguous copular field words',()=>{
    const f=fixture();
    f.knowledge.entities.set('system',{id:'system',name:'Combat Magic',aliases:[]});
    for(const q of ['What is Combat Magic?','What is combatmagic?']){
        const frame=resolveSourceFrameIdentity(parseSourceRequestFrame(q),f.knowledge);
        assert.equal(frame.complete,true);assert.equal(frame.identityResolved,true);
        assert.deepEqual(frame.fields.map(field=>[field.key,field.selectors]),[['identity',[]]]);
    }
    const unknown=resolveSourceFrameIdentity(parseSourceRequestFrame('What is the silver Survey Officer?'),f.knowledge);
    assert.equal(unknown.complete,false);
    const property=resolveSourceFrameIdentity(parseSourceRequestFrame('What is the Survey Officer checksum?'),f.knowledge);
    assert.notEqual(property.identityResolved,true);
    assert.notEqual(planSourceFields({...f,frame:property}).status,'answer');
});
test('Every field and every named selector needs proof; no partial answer escapes',()=>{
    const f=fixture();
    for(const fields of [
        [{key:'identity',selectors:['role','focus','checksum']}],
        [...f.frame.fields,{key:'stats',selectors:['luck']}],
        [...f.frame.fields,{key:'composition',selectors:['metal']}]
    ]){
        const answer=planSourceFields({...f,frame:{...f.frame,fields}});assert.notEqual(answer.status,'answer');
        assert.equal(answer.proofs,undefined);
    }
});
test('An unknown composition cannot reuse an available effect',()=>{
    const f=fixture();f.index.entries=[f.field('use',['effect'])];
    const answer=planSourceFields({...f,frame:{...f.frame,fields:[{key:'composition',selectors:['metal']}]}});
    assert.equal(answer.status,'unsupported');assert.equal(answer.ownerEntityId,'officer');
});
test('Unknown subject modifiers, source, edition, comparison and scene cannot disappear',()=>{
    const f=fixture();
    for(const extra of [
        {subjectText:'silver Survey Officer'},
        {constraints:{sourceText:'the official 2030 manual'}},
        {constraints:{editionText:'the copper edition'}},
        {constraints:{comparisonText:'highest strength in every edition'}},
        {contextTexts:['At the radioactive observatory']},
        {contextTexts:['I want the trip Survey Officer']}
    ])assert.notEqual(planSourceFields({...f,frame:{...f.frame,...extra}}).status,'answer',JSON.stringify(extra));
});
test('A named task wrapper preserves its requested object and other context modifiers',()=>{
    const f=fixture();
    const context='I need Navigation for the Survey Officer task';
    assert.equal(planSourceFields({...f,frame:{...f.frame,contextTexts:[context]}}).status,'answer');
    for(const value of ['I need radioactive Navigation for the Survey Officer task',
        'I need Navigation for the radioactive task','I want the trip Survey Officer'])
        assert.notEqual(planSourceFields({...f,frame:{...f.frame,contextTexts:[value]}}).status,'answer',value);
});
test('Trade city qualifiers bind the rate row and its physical region, not unrelated co-mentions',()=>{
    const f=fixture();
    f.fact.text=f.fact.witness='Harbor on North Island. A traveler mentions South Island.\nSurvey Officer (Harbor): Sell 110%, Buy 132%.';
    const rowScope={locationText:'Harbor',witness:'Survey Officer (Harbor): Sell 110%, Buy 132%.'};
    f.index.entries=[f.field('stats',['selling-percentage'],{rowScope})];
    const ask=location=>planSourceFields({...f,frame:{...f.frame,fields:[{key:'stats',selectors:['selling-percentage'],unknownQualifierTexts:[`in ${location}`]}]}});
    assert.equal(ask('Harbor').status,'answer');assert.equal(ask('North Island').status,'answer');
    assert.notEqual(ask('South Island').status,'answer');
});
test('Named correction chooses its new owner while inherited scope cannot leak through a pronoun',()=>{
    const f=fixture();
    const named=planSourceFields({...f,focusEntityId:'rival',grounded:true,inherited:{guideOnly:true,editionText:'copper'}});
    assert.equal(named.status,'answer');
    const pronoun={...f.frame,subjectText:'his',originalText:'Describe his role and strength.'};
    assert.notEqual(planSourceFields({...f,frame:pronoun,focusEntityId:'officer',grounded:true,inherited:{editionText:'copper'}}).status,'answer');
    assert.notEqual(planSourceFields({...f,frame:pronoun,focusEntityId:'officer',grounded:false}).status,'answer');
});
test('Original structured fields retain real source IDs without fabricating a curated fact',()=>{
    const f=fixture();f.knowledge.facts=[];
    f.index.entries=f.index.entries.map(entry=>({...entry,factId:null,recordId:'raw',record:f.record,origin:'structured-source-record'}));
    const answer=planSourceFields(f);assert.equal(answer.status,'answer');assert.equal(answer.proofs[0].id,'raw');
    assert.equal(answer.proofs[0].sourceRecordId,'raw');assert.equal(answer.proofs[0].recordId,'raw');
});
test('Eligibility and explicit procedure phase are checked for the full proof',()=>{
    const f=fixture();assert.notEqual(planSourceFields({...f,isEligible:()=>false}).status,'answer');
    f.index.entries=[f.field('method',['step'],{phase:'escape'})];
    for(const phase of ['approach','return'])assert.notEqual(planSourceFields({...f,frame:{...f.frame,fields:[{key:'method',selectors:['step'],phase}]}}).status,'answer');
    assert.equal(planSourceFields({...f,frame:{...f.frame,fields:[{key:'method',selectors:['step'],phase:'escape'}]}}).status,'answer');
});
test('An individual type or startup phase cannot replace a full identity or procedure',()=>{
    const f=fixture();
    for(const [key,selectors,phase] of [['identity',['type'],null],['method',['launch'],'startup']]){
        f.index.entries=[f.field(key,selectors,{phase})];
        assert.notEqual(planSourceFields({...f,frame:{...f.frame,fields:[{key,selectors:[]}]}}).status,'answer');
    }
});
test('Reports, saved-state questions, unknown clauses and incomplete indexes do not run the static planner',()=>{
    const f=fixture();
    for(const extra of [{report:true},{playerStateQuestion:true},{staticEligible:false},{complete:false},{unresolvedTexts:['unknown second question']}])
        assert.equal(planSourceFields({...f,frame:{...f.frame,...extra}}).status,'unhandled');
    assert.equal(planSourceFields({...f,index:{...f.index,issues:['bad source']}}).status,'unhandled');
});
test('Requested list cardinality comes from proved members or covered fields, never unrelated amounts',()=>{
    const field={key:'identity',selectors:['members'],requestedText:'List two crew names.',requestedCount:{text:'two',value:2,scope:'requested-list'}};
    assert.equal(sourceFieldCardinality({field,frame:{fields:[field]},entries:[{members:['Ada','Bea']}],proofs:[{text:'Ada and Bea crew the vessel.'}]}),true);
    assert.equal(sourceFieldCardinality({field,frame:{fields:[field]},entries:[{members:['Ada']}],proofs:[{text:'Ada. The ticket costs 2 coins.'}]}),false);
    assert.equal(sourceFieldCardinality({field,frame:{fields:[field]},entries:[],proofs:[{text:'Ada and Bea crew the vessel; ticket 2 coins.'}]}),false);
    const stats=['strength','dexterity'].map(selector=>({...field,key:'stats',selectors:[selector],requestedText:'List two attributes.'}));
    assert.equal(sourceFieldCardinality({field:stats[0],frame:{fields:stats}}),true);
});
test('A reviewed task container carries typed participant fields without becoming a person reference',()=>{
    const f=fixture();
    f.fact.text=f.fact.witness='Survey Officer supplies a sextant.';
    f.record.text=f.fact.text;
    f.knowledge.entities.set('task',{id:'task',name:'Survey expedition',aliases:['Survey task'],kind:'quest'});
    f.knowledge.sourceContexts=[{id:'survey-context',entityId:'task',label:'Survey expedition',sourceRecordId:'raw',
        source:{file:'guide.js',locator:'people[0]',review:'extracted'}}];
    const question={...f.frame,originalText:'For the Survey expedition, who supplies the sextant?',
        subjectText:'the sextant',contextTexts:['For the Survey expedition'],fields:[{key:'provider',selectors:[],subjectText:'the sextant'}]};
    f.index.entries=[f.field('provider',[])];
    const answer=planSourceFields({...f,frame:question});
    assert.equal(answer.status,'answer');assert.equal(answer.topicContextId,'survey-context');
    assert.equal(answer.proofs[0].entityId,'officer');
    const follow={...question,originalText:'Who supplies the sextant?',contextTexts:[]};
    assert.equal(planSourceFields({...f,frame:follow,focusEntityId:'rival',grounded:true,contextIds:['survey-context']}).status,'answer');
    for(const extra of [{grounded:false,contextIds:['survey-context']},{grounded:true,contextIds:['different-context']}])
        assert.notEqual(planSourceFields({...f,frame:follow,focusEntityId:'rival',...extra}).status,'answer');
    const person={...follow,subjectText:'her',fields:[{key:'provider',selectors:[],subjectText:'her'}]};
    assert.notEqual(planSourceFields({...f,frame:person,focusEntityId:'task',grounded:true,contextIds:['survey-context']}).status,'answer');
    f.index.entries[0].subjectEntityIds.push('task');
    assert.notEqual(planSourceFields({...f,frame:person,focusEntityId:'task',grounded:true}).status,'answer');
    f.index.entries[0].subjectEntityIds.pop();
    const object={...follow,subjectText:'it',fields:[{key:'provider',selectors:[],subjectText:'it'}]};
    assert.notEqual(planSourceFields({...f,frame:object,focusEntityId:'rival',grounded:true,contextIds:['survey-context']}).status,'answer');
    f.index.entries[0].explicit=false;
    assert.notEqual(planSourceFields({...f,frame:question}).status,'answer');
    f.index.entries[0].explicit=true;f.fact.source={...source,locator:'people[1]'};
    assert.notEqual(planSourceFields({...f,frame:question}).status,'answer');
});
