import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {authorize} from '../../js/assistant/policy.js';
import {parseNamedSourceFieldRequest as parse,supportsNamedSourceFieldRequest as supports} from '../../js/assistant/named-source-fields.js';

const fixtures=[['alqadim','page-charge','How do I use Sword charge timing?'],
    ['alqadim','page-moving','How do I use Combat movement?'],
    ['ultima5','humility-no-bonus','What is the Humility attribute bonus?'],
    ['ultima7','alagner-answers-request','What is Alagner request?'],
    ['ultima7','orrery-crystal','How do I get Addom crystal price?']];
function context(game,id){
    const manifest=JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url)));
    const k=buildKnowledge(game,allRecords[game],manifest);assert.deepEqual(k.issues,[]);
    const fact=k.facts.find(f=>f.id===id);return {fact,subjectEntityId:fact.entityId,
        sourceRecord:authorize(k.sourceRecords.find(r=>r.id===fact.sourceRecordId),'direct'),isEligible:()=>true};
}
for(const [game,id,q] of fixtures)test(`Explicit complete field: ${game}/${id}`,()=>{
    const c=context(game,id);assert.equal(supports(parse(q),c),true);
    assert.equal(supports(parse(q),{...c,isEligible:()=>false}),false);
    assert.equal(supports(parse(q),{...c,fact:{...c.fact,text:c.fact.text+' extra'}}),false);
    assert.equal(supports(parse(q),{...c,sourceRecord:{...c.sourceRecord,text:'A bare objective'}}),false);
    for(const modified of [q.replace(/\?$/,' on Mars?'),q.replace(/\?$/,' in the SNES edition?'),q.replace(/\?$/,' according to the original manual?')])
        assert.equal(supports(parse(modified),c),false);
    assert.equal(supports(parse(q.replace(/(use|get|is) /,'$1 radioactive ')),c),false);
    assert.equal(supports({...parse(q),scopeText:parse(q).scopeText+' invented'},c),false);
});
test('Matching labels do not turn an objective into a method or an unknown price into a value',()=>{
    const c=context('alqadim','page-charge'),request=parse('How do I use Sword charge timing?');
    assert.equal(supports(request,{...c,fact:{...c.fact,answerRelations:['objective']}}),false);
    const p=context('ultima7','orrery-crystal');assert.equal(supports(parse('How do I get Addom crystal price?'),
        {...p,fact:{...p.fact,text:'Buy a crystal.',witness:'Buy a crystal.'},sourceRecord:{...p.sourceRecord,text:'Buy a crystal.'}}),false);
    assert.equal(parse('How do I use the Black Sword?'),null,'ordinary item use retains the existing field path');
});
