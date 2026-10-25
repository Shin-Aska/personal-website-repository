import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {planSourceFields} from '../../js/assistant/source-field-router.js';

const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url)));
const manifest=read('../../data/assistant/knowledge/starcraft.json');
const knowledge=buildKnowledge('starcraft',read('./evidence/conversation-starcraft-source-records.json'),manifest);
assert.deepEqual(knowledge.issues,[]);
const fact=id=>knowledge.facts.find(f=>f.id===`starcraft:knowledge:${id}`);
const cases=[
    ['bwapi-loading-files',[['method',['placement-check']]]],
    ['purplewave-build',[['method',['build']],['prerequisites',['condition']],['outcome',['artifact']]]],
    ['purplewave-working-folder',[['location',['working-directory']],['location',['data-directory']],['location',['ide-directory']],['limitations',['installation-match']]]],
    ['purplewave-support',[['support',[]],['support',['license','policy']]]],
    ['schnail-game-files',[['use',['automation']]]],
    ['schnail-updates',[['use',['updates']]]],
    ['ualberta-client',[['identity',['execution-mode']],['limitations',['restart']]]],
    ['ualberta-maintenance',[['limitations',['maintenance']],['support',['toolchain-policy']]]]
];
function request(owner,fields){return {kind:'source-fields',complete:true,staticEligible:true,
    subjectText:knowledge.entities.get(owner).name,originalText:'Describe the requested recorded software fields.',
    fields:fields.map(([key,selectors])=>({key,selectors,requestedText:'Describe the requested recorded software fields.'})),
    contextTexts:[],constraints:{},unresolvedTexts:[]};}

test('Explicit software fields cover full build, folder, automation, diagnostic and historical witnesses',()=>{
    for(const [id,fields]of cases){
        const original=fact(id),frame=request(original.entityId,fields);
        const plan=planSourceFields({frame,knowledge,index:knowledge.sourceFields});
        assert.equal(plan.status,'answer',id);
        assert.ok(plan.proofs.includes(original),id);
        assert.ok(plan.proofs.every(proof=>proof.text===proof.witness),id);
        assert.deepEqual(plan.proofs.map(proof=>proof.id),[original.id],id+' keeps complete same-witness coherence');
        const unknown={...frame,fields:[...frame.fields,{key:'composition',selectors:['metal']}]};
        assert.notEqual(planSourceFields({frame:unknown,knowledge,index:knowledge.sourceFields}).status,'answer',id+' composition');
        const extra={...frame,fields:frame.fields.map(field=>({...field,selectors:[...field.selectors,'checksum']}))};
        assert.notEqual(planSourceFields({frame:extra,knowledge,index:knowledge.sourceFields}).status,'answer',id+' unknown selector');
        assert.notEqual(planSourceFields({frame:{...frame,constraints:{sourceText:'the unreviewed 2030 manual'}},knowledge,index:knowledge.sourceFields}).status,'answer',id+' unknown source');
    }
});

test('File placement cannot borrow a console proof and data directory cardinality uses exactly the authored members',()=>{
    const files=fact('bwapi-loading-files'),consoleProof=fact('bwapi-loading-console');
    const entries=knowledge.sourceFields.entries.filter(entry=>entry.factId===consoleProof.id);
    assert.notEqual(planSourceFields({frame:request(files.entityId,[['method',['placement-check']]]),knowledge,index:{entries,issues:[]}}).status,'answer');
    const folder=fact('purplewave-working-folder'),frame=request(folder.entityId,[['location',['data-directory']]]);
    const counted=value=>({...frame,fields:frame.fields.map(field=>({...field,requestedCount:{value,text:String(value),scope:'requested-list'}}))});
    assert.equal(planSourceFields({frame:counted(3),knowledge,index:knowledge.sourceFields}).status,'answer');
    assert.notEqual(planSourceFields({frame:counted(2),knowledge,index:knowledge.sourceFields}).status,'answer');
    const firstLaunch=fact('schnail-first-launch');
    assert.equal(knowledge.sourceFields.entries.some(entry=>entry.factId===firstLaunch.id && entry.key==='use' && entry.selectors.includes('automation')),false,
        'A first-launch delay cause is not an explicit automated setup operation');
});

test('Grouped software arguments are exact field-local literals and retain complete qualifications',()=>{
    for(const [id]of cases){
        const original=fact(id),entries=knowledge.sourceFields.entries.filter(entry=>entry.factId===original.id && entry.arguments);
        assert.ok(entries.length,id);
        for(const entry of entries)for(const group of entry.arguments)for(const binding of group.bindings){
            assert.ok(entry.witness.includes(binding.mention),id);
            assert.ok(original.witness.includes(binding.mention),id);
            assert.deepEqual(group.requiredFactIds,[],'Literal arguments do not invent a graph dependency');
        }
    }
    for(const [id,qualification]of [['purplewave-build','not a prebuilt-download promise'],
        ['purplewave-working-folder','must match the local installation'],
        ['ualberta-client','only for the first game after starting that EXE'],
        ['ualberta-maintenance','rather than assuming current toolchain support']]){
        const original=fact(id);assert.ok(original.witness.includes(qualification));
        assert.ok(knowledge.sourceFields.entries.filter(entry=>entry.factId===original.id && entry.explicit).every(entry=>entry.witness===original.witness),id);
    }
});
