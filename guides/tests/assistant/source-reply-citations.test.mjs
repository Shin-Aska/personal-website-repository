import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAssistant} from '../../js/assistant/engine.js';
import {authorize} from '../../js/assistant/policy.js';
import {buildNarrativeRecords} from '../../js/assistant/topics.js';
import {normalizeSourceReplyCitations as normalize, presentSourceReply} from '../../js/assistant/source-responses.js';

const source=(locator,file='guides/sample.html',review='extracted')=>({file,locator,review});
const record=(id,text,extra={})=>({id,entityId:id,title:id,aliases:[],kind:'item',relation:'use',requires:null,
    variants:{direct:{text}},source:source(`#${id}`),...extra});
const reply=(records,extra={})=>({decision:'answer',text:records.map(record=>authorize(record,'direct').text).join('\n'),
    recordIds:records.map(record=>record.id),sources:records.map(record=>record.source),actions:[],stateChanges:[],...extra});

test('The actual BWAPI loading answer retains its correct checklist source and removes the antivirus citation from an unaccepted sibling',()=>{
    const records=JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url)));
    const overlay=JSON.parse(fs.readFileSync(new URL('../../data/assistant/starcraft.json',import.meta.url)));
    const html=fs.readFileSync(new URL('../../StarcraftBWAPI.html',import.meta.url),'utf8');
    const loading=overlay.entities.find(entity=>entity.id==='bwapi-loading').facts.find(fact=>fact.id==='checks');
    assert.equal(loading.selector,'#bwapi-loading-checks ul');
    assert.match(html,/<div id="bwapi-loading-checks">\s*<h4[^>]*>BWAPI Not Loading<\/h4>/);
    assert.match(html.slice(html.indexOf('<div id="bwapi-loading-checks">')),/Make sure you're using a compatible version of BWAPI with your Starcraft\s+version/);
    const troubleshooting=html.slice(html.indexOf('<section id="troubleshooting"'));
    const list=troubleshooting.slice(troubleshooting.indexOf('<div class="space-y-4">'));
    assert.ok(list.indexOf('Antivirus Blocking SCHNAIL')<list.indexOf('id="bwapi-loading-checks"'));
    const assistant=createAssistant({gameId:'starcraft',records,fallback:null});
    const question='If BWAPI is not loading, what version-compatibility check does the guide list?';
    const original=assistant.answer(question,{spoiler:'direct',fullAnswersOnly:true});
    const stale='#troubleshooting .space-y-4 > div:nth-child(1)';
    assert.ok(original.sources.some(value=>value.locator===stale),'The raw combined-engine citation defect is reproduced.');
    const normalized=presentSourceReply(original,{status:'clarify'},records,{spoiler:'direct'});
    assert.equal(normalized.text,original.text);
    assert.deepEqual(normalized.recordIds,['starcraft:bwapi-loading:checks']);
    assert.deepEqual(normalized.sources.map(value=>value.locator),['#bwapi-loading-checks ul']);
    assert.ok(original.sources.some(value=>value.locator===stale),'Input is not mutated.');
});

test('Genuine multiple selected records retain their displayed distinct source citations',()=>{
    const first=record('first','The sword adds protection.'),second=record('second','The sword is in the armoury.');
    const original=reply([first,second],{sources:[first.source,second.source,source('#unused')]});
    assert.deepEqual(normalize(original,[first,second]).sources,[first.source,second.source]);
    const partial={...original,text:authorize(first,'direct').text};
    assert.deepEqual(normalize(partial,[first,second]).sources,[first.source]);
});

test('Explicit displayed narrative claims preserve their own exact citations and external references',()=>{
    const first={text:'The keeper says the door was closed.',source:{...source('account-a','https://example.test/a','external-research'),references:[{label:'Account A',url:'https://example.test/a',checkedAt:'2026-10-24'}]}};
    const second={text:'The keeper says the door was open.',source:{...source('account-b','https://example.test/b','external-research'),references:[{label:'Account B',url:'https://example.test/b',checkedAt:'2026-10-24'}]}};
    const records=buildNarrativeRecords('example',[{id:'door',entityId:'keeper',title:'Keeper',kind:'npc',overlayFile:'guides/data/example.json',
        minSpoiler:'direct',from:['a','b'],narrative:{aspect:'event',subjects:['keeper'],context:['door'],status:'disputed'}}],new Map([['a',first],['b',second]]));
    assert.equal(records.length,1);assert.ok(authorize(records[0],'direct'));
    const original={...reply(records),sources:[first.source,second.source,source('#other')]};
    assert.deepEqual(normalize(original,records).sources,[first.source,second.source]);
    assert.deepEqual(normalize({...original,text:first.text},records).sources,[first.source]);
});

test('Authored resource provenance and reviewed concise-definition provenance survive only when displayed',()=>{
    const url='https://example.test/download',base=record('tool',`Download Tool from ${url}.`);
    const withLink={...base,sourceLinks:[{url,text:'Tool download',levels:['direct'],source:base.source}]};
    const linked=reply([withLink]);assert.deepEqual(normalize(linked,[withLink]).sources,[base.source]);
    const definitionSource={...source('DEFINITIONS[0]','guides/js/source-definitions.js','authored-from-guide'),basedOn:base.source};
    const defined={...base,sourceDefinition:{variants:{direct:{text:'Tool is a documented client.',source:definitionSource}}}};
    const concise={...reply([base]),text:'Tool is a documented client.',sources:[base.source,definitionSource]};
    assert.deepEqual(normalize(concise,[defined]).sources,concise.sources);
    assert.deepEqual(normalize({...concise,text:'An unrelated assertion.'},[defined]).sources,[]);
});

test('Reports and non-answer paths are untouched; hidden source variants cannot justify current citations',()=>{
    const item=record('hidden','Hidden source text.',{minSpoiler:'direct'}),original=reply([item]);
    const declined={...original,decision:'decline'};assert.strictEqual(normalize(declined,[item]),declined);
    const report={...original,decision:'reported',stateChanges:[{id:'done'}]};assert.strictEqual(normalize(report,[item]),report);
    assert.deepEqual(normalize(original,[item],{spoiler:'gentle'}).sources,[],'A hidden selected record cannot justify a current citation.');
    assert.deepEqual(normalize({...original,recordIds:['missing-record']},[item]).sources,[]);
});
