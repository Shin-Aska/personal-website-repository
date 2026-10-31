import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge, createKnowledgeRouter} from '../../js/assistant/knowledge.js';

const manifest=JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/ultima7.json',import.meta.url)));
const knowledge=buildKnowledge('ultima7',allRecords.ultima7,manifest);

test('phase lookup recognizes reversed reviewed titles without dropping restrictions',()=>{
    const trace=[];
    const router=createKnowledgeRouter(knowledge);
    const answer=router.plan('How do I finish Courage test?',{}, {trace:item=>trace.push(item)});
    assert.ok(trace.some(item=>item.stage==='capability' && item.kind==='procedure-phase'
        && item.proved.some(ids=>ids.includes('courage-finish-sword'))));
    assert.equal(answer.decision,'answer');
    assert.ok(answer.knowledge.factIds.includes('courage-finish-sword'));
    assert.ok(answer.sources.some(source=>source.locator==='DB.virtueQuests[7]'));
    for(const question of ['How do I finish Courage test in two turns?', 'How do I finish Quantum test?',
        'How do I finish Courage test without the Black Sword?']) {
        const events=[];
        createKnowledgeRouter(knowledge).plan(question,{}, {trace:item=>events.push(item)});
        assert.ok(!events.some(item=>item.stage==='capability' && item.kind==='procedure-phase'
            && item.proved.some(ids=>ids.includes('courage-finish-sword'))),question);
    }
});
