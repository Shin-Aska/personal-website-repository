import test from 'node:test';
import assert from 'node:assert/strict';
import {matchSourceFieldArguments as match,sourceFieldReferents} from '../../js/assistant/source-field-arguments.js';
const knowledge={entities:new Map([['song',{name:'River Song',kind:'song',aliases:[]}],['vessel',{name:'Glass Jar',kind:'item',aliases:[]}],
    ['powder',{name:'Red Powder',kind:'item',aliases:[]}],['rival',{name:'Iron Jar',kind:'item',aliases:[]}]])};
const object=(role,entityId,mention)=>({role,entityId,mention});
const entry={witness:'Use a Glass Jar and Red Powder. Learn the River Song.',arguments:[
    {linkId:'jar-link',bindings:[object('output','vessel','Glass Jar'),object('input','powder','Red Powder')],requiredFactIds:[]},
    {linkId:'song-link',bindings:[object('content','song','River Song')],requiredFactIds:['source-song']}
]};
const ask=(objectRole,objectTexts,extra={})=>match({field:{objectRole,objectTexts},entry,knowledge,...extra});
test('Literal arguments and canonical kinds match only their reviewed role',()=>{
    assert.equal(ask('output',['the Glass Jar']).matched,true);
    assert.equal(ask('input',['the red powder']).matched,true);
    assert.equal(ask('content',['the tune']).matched,true);
    assert.equal(ask('output',['the red powder']).matched,false);
    assert.equal(ask('object',['the instrument']).matched,false);
    assert.equal(ask('content',['the radioactive tune']).matched,false);
});
test('Every requested object remains in the same predicate group',()=>{
    assert.equal(ask('object',['Glass Jar','River Song']).matched,false);
    const pair={...entry,arguments:[{bindings:[object('object','vessel','Glass Jar'),object('object','powder','Red Powder')]}]};
    assert.equal(match({field:{objectTexts:['Glass Jar','Red Powder']},entry:pair,knowledge}).matched,true);
});
test('A deictic object requires its actual grounded referent, not a nearby topic',()=>{
    assert.equal(ask('content',['it'],{grounded:true,referentIds:['song']}).matched,true);
    assert.equal(ask('content',['it'],{grounded:true,referentIds:['vessel']}).matched,false);
    assert.equal(ask('content',['it'],{grounded:false,referentIds:['song']}).matched,false);
});
test('Partial noun descriptions cannot choose between different canonical arguments',()=>{
    const jars={witness:'Glass Jar. Iron Jar.',arguments:[{bindings:[object('object','vessel','Glass Jar')]},
        {bindings:[object('object','rival','Iron Jar')]}]};
    const result=match({field:{objectTexts:['the jar']},entry:jars,knowledge});
    assert.equal(result.matched,false);assert.equal(result.ambiguous,true);
    const exact=match({field:{objectTexts:['the Glass Jar']},entry:jars,knowledge});
    assert.equal(exact.matched,true);assert.deepEqual(exact.entityIds,['vessel']);
});
test('Canonical discourse referents require every supporting whole proof',()=>{
    const selected={proofs:[{proof:{id:'source-jar'},entry}]};
    const partial=sourceFieldReferents([selected]);assert.deepEqual(partial.output,['vessel']);assert.equal(partial.content,undefined);
    selected.proofs[0].supporting=[{id:'source-song'}];
    assert.deepEqual(sourceFieldReferents([selected]).content,['song']);
});
test('Spatial inflection and a riddle owner stay within the explicitly requested predicate',()=>{
    const spatial={witness:"Unlock the center door and answer the sentinel's riddle with SUN.",arguments:[
        {bindings:[{role:'object',mention:'center door'}]},
        {bindings:[{role:'object',mention:"sentinel's riddle"},{role:'content',mention:'SUN'}]}]};
    const ask=(key,selectors,value)=>match({field:{key,selectors,objectTexts:[value]},entry:spatial,knowledge});
    assert.equal(ask('method',['open'],'the central door').matched,true);
    assert.equal(ask('method',['riddle-answer'],'the sentinel').matched,true);
    assert.equal(ask('method',['open'],'the sentinel').matched,false);
    assert.equal(ask('method',['riddle-answer'],'the radioactive sentinel').matched,false);
    assert.equal(ask('method',['open'],'the silver central door').matched,false);
});
