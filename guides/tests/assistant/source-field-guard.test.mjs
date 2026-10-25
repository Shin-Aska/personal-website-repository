import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {authorize} from '../../js/assistant/policy.js';
import {guardSourceFieldReply as guard} from '../../js/assistant/source-field-guard.js';

const source={file:'guides/example-source.js',locator:'items[0].composition',review:'extracted'};
const raw=(extra={})=>({id:'source:item:clasp',entityId:'item:clasp',title:'Clasp',aliases:['the clasp'],kind:'item',relation:'explanation',
    minSpoiler:'gentle',requires:null,variants:{direct:{text:'The clasp is made of bronze. Its polished finish is decorative.'}},source,...extra});
const entry=(record,extra={})=>({key:'composition',selectors:['material','metal'],subjectEntityIds:[record.entityId],recordId:record.id,
    witness:'bronze',source:record.source,explicit:true,...extra});
const frame=(field={key:'composition',selectors:['metal']},extra={})=>({complete:true,staticEligible:true,subjectText:'Clasp',fields:[field],unresolvedTexts:[],...extra});
const reply=(record,extra={})=>{const value=authorize(record,'direct');return {decision:'answer',text:value.text,recordIds:[value.id],sources:[value.source],actions:[],stateChanges:[],choices:[],...extra};};
const context=(record=raw(),extra={})=>({frame:frame(),reply:reply(record),records:[record],sourceFields:[entry(record)],...extra});

test('A source-proven material field requires a typed literal witness and the whole returned authorized record',()=>{
    const proof=guard(context());assert.equal(proof.complete,true);assert.deepEqual(proof.fields[0].selectors,['metal']);
    assert.equal(proof.fields[0].records[0].mode,'typed-source-field');assert.equal(proof.fields[0].records[0].witness,raw().variants.direct.text);
    assert.equal(Object.isFrozen(proof),true);
    const record=raw();for(const extra of [
        {sourceFields:[]},{sourceFields:[entry(record,{key:'use'})]},
        {frame:frame({key:'composition',selectors:[]}),records:[{...record,relation:'composition'}],sourceFields:[]},
        {sourceFields:[entry(record,{selectors:['material']})]},
        {sourceFields:[entry(record,{explicit:false})]},
        {sourceFields:[entry(record,{witness:'steel'})]},
        {sourceFields:[entry(record,{subjectEntityIds:['other-item']})]},
        {sourceFields:[entry(record,{source:{...source,locator:'unrelated'}})]},
        {reply:reply(record,{text:'The clasp is made of bronze.'})},
        {reply:reply(record,{sources:[]})},
        {reply:reply(record,{recordIds:['other-record']})}
    ])assert.equal(guard(context(record,extra)),false,JSON.stringify(extra));
});

test('Use/effect and classifier labels never authorize unknown composition or another typed field',()=>{
    const record=raw({relation:'use',variants:{direct:{text:'The sceptre reveals invisible doors.'}},title:'Sceptre',aliases:[],entityId:'item:sceptre'});
    const base={frame:frame({key:'composition',selectors:['metal']},{subjectText:'Sceptre'}),reply:reply(record),records:[record]};
    assert.equal(guard({...base,modelIntent:'use',intent:'use'}),false);
    assert.equal(guard({...base,sourceFields:[{...entry(record),key:'use',selectors:['effect'],witness:record.variants.direct.text}]}),false);
    assert.equal(guard({...base,frame:frame({key:'unknown',selectors:['frame-metal']},{subjectText:'Sceptre'})}),false);
    assert.equal(guard({...base,frame:frame({key:'identity',selectors:['type']},{subjectText:'Sceptre'})}),false);
    assert.equal(guard({...base,frame:frame({key:'use',selectors:['effect']},{subjectText:'Sceptre'})}).complete,true);
});

test('Ordinary raw use, location and identity relations remain supported across all six actual guide pools',()=>{
    const starcraft=JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url)));
    for(const [game,records]of Object.entries({...allRecords,starcraft}))for(const [key,relation]of [['use','use'],['location','location'],['identity','explanation']]){
        const record=records.find(record=>record.relation===relation && !record.conflict && record.identity!==false && record.requires===null
            && record.source?.review!=='external-research' && authorize(record,'direct'));
        assert.ok(record,`${game}: ${relation}`);
        const input={frame:frame({key,selectors:[]},{subjectText:record.title}),reply:reply(record),records:[record]};
        assert.equal(guard(input).complete,true,`${game}: ${relation}`);
        assert.equal(guard({...input,frame:frame({key:'composition',selectors:['metal']},{subjectText:record.title})}),false,game);
    }
});

test('Reviewed additional ordinary roles remain usable while unindexed declarations and identity-disabled records do not',()=>{
    const sumie=allRecords.alqadim.find(record=>record.id==='alqadim:topic:sumie:explanation');
    assert.ok(sumie);assert.equal(sumie.source.index.review,'authored-index');
    const input={frame:frame({key:'location',selectors:[]},{subjectText:'Sumie'}),reply:reply(sumie),records:[sumie]};
    assert.equal(guard(input).complete,true);
    assert.equal(guard({...input,records:[{...sumie,source:{...sumie.source,index:undefined}}]}),false);
    assert.equal(guard({...input,frame:frame({key:'identity',selectors:[]},{subjectText:'Sumie'})}),false);
    assert.equal(guard({...input,frame:frame({key:'composition',selectors:['metal']},{subjectText:'Sumie'})}),false);
    const declared=raw({relation:'hint',answers:['use'],source:{...source,index:{file:'metadata.json',locator:'answers',review:'authored-index'}}});
    assert.equal(guard(context(declared,{frame:frame({key:'use',selectors:['effect']}),sourceFields:[]})).complete,true);
    assert.equal(guard(context(declared,{frame:frame({key:'composition',selectors:['metal']}),sourceFields:[]})),false);
});

test('Ordinary combat fallback requires the full own-combat record and the matching grounded owner',()=>{
    const combat=allRecords.albion.find(record=>record.relation==='combat' && /AI Housing/i.test(record.title));
    assert.ok(combat);
    const input={frame:frame({key:'combat',selectors:[]},{subjectText:'it'}),reply:reply(combat),records:[combat],
        subjectEntityId:combat.entityId,subjectLabels:[combat.title,...(combat.aliases || [])],grounded:true};
    assert.equal(guard(input).complete,true);
    assert.equal(guard({...input,grounded:false}),false);
    assert.equal(guard({...input,subjectEntityId:'another-creature'}),false);
    const effect={...combat,relation:'use',answers:['combat']};
    assert.equal(guard({...input,records:[effect],reply:reply(effect)}),false);
    assert.equal(guard({...input,frame:frame({key:'combat',selectors:[],unknownQualifierTexts:['radioactive']},{subjectText:'it'})}),false);
    assert.equal(guard({...input,reply:reply(combat,{text:'Thorn Snare can hold it.'})}),false);
});

test('The actual Sceptre effect and Sunscorch metal-trigger rows cannot answer composition',()=>{
    for(const [game,title]of [['ultima5','Sceptre'],['alqadim','Sunscorch']]) {
        const record=allRecords[game].find(value=>value.title===title && value.relation==='use');
        assert.ok(record);
        const input={frame:frame({key:'composition',selectors:['metal']},{subjectText:title}),reply:reply(record),records:[record]};
        assert.equal(guard(input),false,title);
        assert.equal(guard({...input,sourceFields:[{key:'use',selectors:['effect'],recordId:record.id,
            subjectEntityIds:[record.entityId],source:record.source,witness:authorize(record,'direct').text,explicit:true}]}),false,title);
        assert.equal(guard({...input,frame:frame({key:'use',selectors:['effect']},{subjectText:title})}).complete,true,title);
    }
});

test('Every requested selector and every requested field must have its own actual returned typed coverage',()=>{
    const record=raw({variants:{direct:{text:'Strength 12. Dexterity 14. Combat 8.'}},relation:'stats'});
    const values=[{key:'stats',selectors:['strength'],witness:'Strength 12'},{key:'stats',selectors:['dexterity'],witness:'Dexterity 14'}]
        .map(value=>entry(record,{...value}));
    const input=context(record,{frame:frame({key:'stats',selectors:['strength','dexterity']}),sourceFields:values});
    assert.equal(guard(input).complete,true);
    assert.equal(guard({...input,sourceFields:values.slice(0,1)}),false);
    assert.equal(guard({...input,frame:{...input.frame,fields:[...input.frame.fields,{key:'composition',selectors:['metal']}]}}),false);
    const unrelated=raw({id:'other:record',variants:{direct:{text:'A decorative inscription.'}}});
    assert.equal(guard({...input,records:[record,unrelated],reply:{...input.reply,text:input.reply.text+' '+authorize(unrelated,'direct').text,
        recordIds:[record.id,unrelated.id],sources:[record.source,unrelated.source]}}),false);
});

test('A validated curated child can prove its declared containing raw record while preserving distinct exact provenance',()=>{
    const record=raw(),childSource={...source,locator:'items[0].composition.metal'};
    const child=entry(record,{factId:'curated:clasp-metal',sourceRecordId:record.id,recordId:'curated:clasp-metal:record',source:childSource});
    const input=context(record,{sourceFields:{entries:[child],issues:[]}});
    const proof=guard(input);assert.equal(proof.complete,true);
    assert.deepEqual(proof.sources,[record.source]);
    assert.deepEqual(proof.fields[0].records[0].fieldSources,[childSource]);
    assert.notDeepEqual(proof.sources,proof.fields[0].records[0].fieldSources);
    assert.equal(guard({...input,sourceFields:{entries:[child],issues:['Invalid source metadata']}}),false);
    assert.equal(guard({...input,sourceFields:[{...child,sourceRecordId:'different-source-record'}]}),false);
    assert.equal(guard({...input,sourceFields:[{...child,source:{...childSource,file:'guides/unrelated.js'}}]}),false);
});

test('Canonical owner, grounded references and unknown extra qualifiers cannot be borrowed',()=>{
    const record=raw(),input=context(record);
    assert.equal(guard({...input,frame:frame(undefined,{subjectText:'Radioactive Clasp'}),subjectEntityId:record.entityId,subjectLabels:['Clasp']}),false);
    const referential={...input,frame:frame(undefined,{subjectText:'it'}),subjectEntityId:record.entityId,subjectLabels:['Clasp']};
    assert.equal(guard(referential),false);assert.equal(guard({...referential,grounded:true}).complete,true);
    assert.equal(guard({...referential,grounded:true,subjectEntityId:'other-item'}),false);
    const field={key:'composition',selectors:['metal'],qualifierTexts:['under copper light'],unknownQualifierTexts:['under copper light']};
    assert.equal(guard({...input,frame:frame(field)}),false);
    assert.equal(guard({...input,frame:frame(field),sourceFields:[entry(record,{qualifierTexts:['under copper light']})]}),false);
    const qualified=raw({variants:{direct:{text:record.variants.direct.text+' This description applies under copper light.'}}});
    assert.equal(guard(context(qualified,{frame:frame(field),sourceFields:[entry(qualified,{qualifierTexts:['under copper light']})]})).complete,true);
    assert.equal(guard({...input,frame:frame({key:'composition',selectors:['metal'],actionText:'made of',qualifierTexts:['made of']})}).complete,true);
});

test('Recognized grammar and provenance are not material; baseline, exact and total require appropriate typed source proof',()=>{
    const record=raw({kind:'companion',relation:'stats',variants:{direct:{text:'Strength 12. Dexterity 14.'}}});
    const field={key:'stats',selectors:['strength','dexterity'],actionText:'listed starting values',qualifierTexts:['starting','guide table'],
        unknownQualifierTexts:[],qualifiers:{baselineText:'starting',exact:true,provenanceTexts:['guide table']}};
    const typed=entry(record,{key:'stats',selectors:['strength','dexterity'],witness:record.variants.direct.text,origin:'structured-source-record'});
    const input=context(record,{frame:frame(field),sourceFields:[typed]});
    assert.equal(guard(input).complete,true);
    assert.equal(guard({...input,sourceFields:[{...typed,origin:undefined}]}),false);
    assert.equal(guard({...input,records:[{...record,kind:'topic'}]}),false);
    assert.equal(guard({...input,frame:frame({...field,qualifiers:{...field.qualifiers,total:true}})}),false);
    const total=raw({relation:'stats',variants:{direct:{text:'Total damage: 14.'}}});
    const totalField={key:'stats',selectors:['damage'],qualifiers:{total:true,exact:true,provenanceTexts:[]}};
    const totalEntry=entry(total,{key:'stats',selectors:['damage'],witness:total.variants.direct.text,qualifiers:{total:true,exact:true}});
    assert.equal(guard(context(total,{frame:frame(totalField),sourceFields:[totalEntry]})).complete,true);
    assert.equal(guard(context(record,{frame:frame(totalField),sourceFields:[{...totalEntry,recordId:record.id,source:record.source,
        subjectEntityIds:[record.entityId],witness:record.variants.direct.text}]})),false,'No total can be inferred by adding individual attributes.');
});

test('Requested list cardinality is proved after every field, never from unrelated digits or trimmed output',()=>{
    const record=raw({relation:'use',variants:{direct:{text:'Benefits: Long reach; Heavy protection; Easy repair. Price: 20 gold.'}}});
    const typed=entry(record,{key:'use',selectors:['bonus'],witness:record.variants.direct.text,members:['Long reach','Heavy protection','Easy repair']});
    const field={key:'use',selectors:['bonus'],requestedText:'Give the three bonuses',requestedCount:{value:3,text:'three',scope:'requested-list'}};
    const input=context(record,{frame:frame(field),sourceFields:[typed]});
    assert.equal(guard(input).complete,true);
    assert.equal(guard({...input,frame:frame({...field,requestedCount:{value:2,text:'two',scope:'requested-list'}})}),false);
    assert.equal(guard({...input,sourceFields:[{...typed,members:undefined}]}),false);
    assert.equal(guard({...input,sourceFields:[{...typed,members:['Long reach','Heavy protection','Price: 20 gold']}],
        frame:frame({...field,requestedCount:{value:20,text:'20',scope:'requested-list'}})}),false);
    assert.equal(guard({...input,reply:reply(record,{text:'Benefits: Long reach; Heavy protection.'})}),false);
    const stats=raw({relation:'stats',kind:'companion',variants:{direct:{text:'Strength 12. Dexterity 14.'}}});
    const entries=['strength','dexterity'].map(selector=>entry(stats,{key:'stats',selectors:[selector],witness:stats.variants.direct.text}));
    const fields=entries.map(value=>({key:'stats',selectors:value.selectors,requestedText:'Give two attributes',requestedCount:{value:2,text:'two',scope:'requested-list'}}));
    assert.equal(guard(context(stats,{frame:frame(undefined,{fields}),sourceFields:entries})).complete,true);
    assert.equal(guard(context(stats,{frame:frame(undefined,{fields}),sourceFields:entries.slice(0,1)})),false);
});

test('Source/edition/condition scope, atomicity, authorization and state paths are never waived by field coverage',()=>{
    const record=raw(),input=context(record);
    for(const constraints of[{sourceText:'another source'},{editionText:'SNES'},{conditionText:'after two repairs'}]){
        assert.equal(guard({...input,frame:frame(undefined,{constraints})}),false);
        assert.equal(guard({...input,frame:frame(undefined,{constraints}),isEligible:()=>false}),false);
        assert.equal(guard({...input,frame:frame(undefined,{constraints}),isEligible:()=>true}).complete,true);
    }
    for(const extra of [
        {frame:frame(undefined,{complete:false})},{frame:frame(undefined,{unresolvedTexts:['unknown qualifier']})},
        {frame:frame(undefined,{report:true})},{frame:frame(undefined,{playerStateQuestion:true})},{frame:frame(undefined,{staticEligible:false})},
        {reply:reply(record,{actions:[{id:'mark-progress'}]})},{reply:reply(record,{stateChanges:[{id:'done'}]})},
        {reply:reply(record,{parts:[{decision:'answer'},{decision:'clarify'}]})},{reply:reply(record,{decision:'decline'})},
        {frame:frame({key:'composition',selectors:'metal'})},{frame:{...frame(),fields:[null]}},
        {reply:reply(record,{recordIds:[null]})},{reply:reply(record,{parts:[null]})},
        {records:[record,record]},{records:[{...record,conflict:true}]},
        {records:[{...record,minSpoiler:'direct'}],spoiler:'gentle'}
    ])assert.equal(guard({...input,...extra}),false,JSON.stringify(extra));
});
