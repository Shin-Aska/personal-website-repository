import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {authorize} from '../../js/assistant/policy.js';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {parseQuestionSourceAttribution as parse,supportsQuestionSourceAttribution as supports} from '../../js/assistant/question-source-attribution.js';

const manifest=JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/ultima6.json',import.meta.url)));
const k=buildKnowledge('ultima6',allRecords.ultima6,manifest),fact=k.facts.find(f=>f.id==='headless-production-method');
const sourceRecord=authorize(allRecords.ultima6.find(r=>r.id===fact.sourceRecordId),'direct');
const question='What produced the headless creatures, according to the passage questions?';

test('Question-source attribution preserves the whole request and requires its actual indexed QA series',()=>{
    const r=parse(question);assert.deepEqual(r,{questionText:'what produced the headless creatures',seriesText:'passage',originalText:question});
    assert.equal(supports(r,{fact,sourceRecord}),true);
    for(const text of ['What produced the headless creatures, according to the passage2 questions?',
        'What produced the headless creatures, according to the otherpassage questions?'])assert.equal(supports(parse(text),{fact,sourceRecord}),false,text);
    for(const text of ['What produced the headless creatures according to the original manual?',
        'What produced the headless creatures according to the passage questions on Mars?',
        'What produced the headless creatures according to two passage questions?'])assert.equal(parse(text),null,text);
});

test('A series label cannot authorize another kind, witness, owner or composite source locator',()=>{
    const r=parse(question);
    for(const context of [{fact:{...fact,witness:'different'},sourceRecord},
        {fact,sourceRecord:{...sourceRecord,kind:'topic'}},{fact,sourceRecord:{...sourceRecord,id:'other'}},
        {fact,sourceRecord:{...sourceRecord,text:'No answer here.'}},{fact:{...fact,conflict:true},sourceRecord},
        ...['gameData.notpassage[2]','gameData.passage[2].answer','gameData.passage[2];gameData.other[1]'].map(locator=>({fact:{...fact,source:{...fact.source,locator}},sourceRecord:{...sourceRecord,source:{...sourceRecord.source,locator}}}))])
        assert.equal(supports(r,context),false);
});
