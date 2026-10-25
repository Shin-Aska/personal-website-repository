import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords,u6,u7,aq} from './load-records.mjs';
import {buildKnowledge,knowledgeDocument} from '../../js/assistant/knowledge.js';
import {buildSourceFieldIndex,SOURCE_FIELD_KEYS} from '../../js/assistant/source-field-index.js';
import {factSourceContexts} from '../../js/assistant/source-contexts.js';

const games=['ultima5','ultima6','ultima7','albion','alqadim','starcraft'];
const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url)));
const knowledge=Object.fromEntries(games.map(game=>[game,buildKnowledge(game,game==='starcraft'?read('./evidence/conversation-starcraft-source-records.json'):allRecords[game],read(`../../data/assistant/knowledge/${game}.json`))]));
const indexes=Object.fromEntries(games.map(game=>[game,buildSourceFieldIndex(knowledge[game])]));
for(const game of games)test(`${game}: fields retain full authorized facts and frozen encoded documents`,()=>{
    const k=knowledge[game],index=indexes[game];assert.deepEqual(k.issues,[]);assert.deepEqual(index.issues,[]);assert.ok(index.entries.length);
    const catalog=read(`../../data/assistant/knowledge/${game}-embeddings.json`);
    assert.deepEqual(k.facts.map(fact=>({factId:fact.id,text:knowledgeDocument(fact)})),catalog.documents.map(({factId,text})=>({factId,text})));
    for(const entry of index.entries){
        assert.ok(SOURCE_FIELD_KEYS.includes(entry.key));assert.ok(entry.subjectEntityIds.every(id=>k.entities.has(id)));
        if(entry.factId){const fact=k.facts.find(fact=>fact.id===entry.factId);assert.ok(fact.witness.includes(entry.witness));assert.equal(fact.text,fact.witness);assert.equal(entry.sourceRecordId,fact.sourceRecordId);}
        else{assert.equal(entry.witness,entry.record.text);assert.equal(entry.recordId,entry.sourceRecordId);assert.deepEqual(entry.source,{file:entry.record.source.file,locator:entry.record.source.locator,review:entry.record.source.review});}
    }
});
const field=(game,id,key)=>indexes[game].entries.filter(entry=>entry.factId===id && entry.key===key);
test('reviewed repair actor, seller and projectile type stay on their exact original owners and full proofs',()=>{
    const repair=field('ultima6','lor-lens-keyword','creator').find(entry=>entry.selectors.includes('repair'));
    assert.ok(repair?.explicit);assert.deepEqual(repair.subjectEntityIds,['ultima6:knowledge:lor-wis-lem']);
    assert.equal(repair.source.locator,'gameData.quests[3].sections[1].keywords[0].helper');
    assert.ok(u6.gameData.quests[3].sections[1].keywords[0].helper.includes('<strong>Lor-wis-lem:</strong> say <code>LENS</code> for repairs.'));
    assert.equal(repair.witness,'Lor-wis-lem: say LENS for repairs.');
    const linkedRepair=field('ultima6','red-lens','creator')[0];
    assert.deepEqual(linkedRepair.arguments[0].requiredFactIds,['red-lens','lor-lens-keyword'],'repair now requires both whole direct-link proofs, not delivery alone');
    assert.ok(!repair.selectors.includes('craft') && !repair.selectors.includes('seller'));
    const seller=field('ultima7','orrery-crystal','provider').find(entry=>entry.selectors.includes('seller'));
    const crystal=knowledge.ultima7.facts.find(fact=>fact.id==='orrery-crystal');
    assert.ok(seller?.explicit);
    const canonical=value=>knowledge.ultima7.entityIdMap.get(value) || value;
    assert.deepEqual(seller.subjectEntityIds,['ultima7:knowledge-entity:special-orrery-crystal','ultima7:quest:brion-s-orrery'].map(canonical));
    const object=seller.arguments[0].bindings.find(binding=>binding.role==='object'),agent=seller.arguments[0].bindings.find(binding=>binding.role==='agent');
    assert.equal(object.entityId,canonical('ultima7:knowledge-entity:special-orrery-crystal'));assert.equal(object.mention,'special crystal');
    assert.ok(crystal.bindings.some(binding=>binding.entityId===object.entityId && binding.mention==='special crystal'));
    assert.equal(agent.entityId,canonical('ultima7:npc:addom'));assert.equal(agent.mention,'Addom');
    assert.ok(!seller.subjectEntityIds.includes(agent.entityId),'the seller is an agent, not a field owner');
    assert.ok(factSourceContexts({fact:crystal,contexts:knowledge.ultima7.sourceContexts}).some(context=>context.entityId===canonical('ultima7:quest:brion-s-orrery') && context.source.locator==='DB.sideQuests[10]'));
    assert.equal(seller.source.locator,'DB.sideQuests[10]');assert.equal(seller.witness,u7.DB.sideQuests[10].walkthrough);
    assert.ok(seller.witness.startsWith('Buy a special crystal from the adventurer Addom for 20 gold'));
    assert.equal(field('ultima7','orrery-crystal','creator').length,0,'a seller is not a manufacturer');
    const type=field('alqadim','shard-water-blast','identity').find(entry=>entry.selectors.includes('type'));
    assert.ok(type?.explicit);assert.deepEqual(type.subjectEntityIds,[knowledge.alqadim.facts.find(fact=>fact.id==='shard-water-blast').entityId]);
    assert.equal(type.source.locator,'DB.moonstoneShards[7]');assert.ok(type.witness.startsWith(aq.DB.moonstoneShards[7].effect));
    assert.equal(type.witness,knowledge.alqadim.facts.find(fact=>fact.id==='shard-water-blast').witness);
    assert.ok(!type.selectors.includes('composition') && !type.selectors.includes('projectile-speed'));
    assert.equal(field('alqadim','shard-water-blast','composition').length,0);
});
test('narrative roles are explicit source annotations, not inverse or transitive edges',()=>{
    for(const [game,id,keys] of [['ultima5','sceptre-well',['method','prerequisites']],['ultima5','faulinei-word',['teacher']],
        ['ultima6','panpipes-makers',['provider','creator','method','prerequisites']],['ultima6','silk-thread-cloth',['creator','stats']],
        ['ultima6','red-lens',['recipient','method']],['ultima6','blue-lens',['creator','method']],['albion','trade-rabir-jirinaar',['stats']]]){
        for(const key of keys)assert.ok(field(game,id,key).some(entry=>entry.explicit),`${game}/${id}/${key}`);
    }
    assert.equal(field('ultima6','red-lens','provider').length,0,'delivery to a repairer does not supply an acquisition provider');
    assert.equal(field('albion','porenoil','provider').length,0,'asking about an item does not prove its giver');
    assert.equal(field('ultima5','sceptre-effect','composition').length,0);
});
test('original structured records retain Tseramed role, focus and all four typed statistics without adding a fact',()=>{
    const entries=indexes.ultima7.entries.filter(entry=>entry.recordId?.startsWith('ultima7:companion:tseramed:'));
    assert.ok(entries.every(entry=>entry.factId===null));
    assert.deepEqual(entries.find(entry=>entry.key==='identity').selectors,['role','focus']);
    assert.deepEqual(entries.find(entry=>entry.key==='stats').selectors,['strength','dexterity','intelligence','combat']);
    assert.ok(entries.some(entry=>entry.key==='location' && entry.witness.includes('Yew, near Bee Cave')));
    assert.ok(!knowledge.ultima7.facts.some(fact=>fact.id.includes('tseramed')));
});
test('raw equipment coordinate, effect and type records stay on their exact original source',()=>{
    const entries=indexes.ultima7.entries.filter(entry=>entry.recordId?.startsWith('ultima7:equipment:sword-of-defense:'));
    assert.ok(entries.find(entry=>entry.key==='location').selectors.includes('coordinates'));
    assert.ok(entries.some(entry=>entry.key==='identity' && entry.selectors.includes('type')));
    assert.ok(entries.some(entry=>entry.key==='use' && entry.selectors.includes('effect')));
});
test('source-context ownership is explicit, original-parent grounded and not a graph traversal',()=>{
    const party=field('ultima5','party-start','identity').find(entry=>entry.explicit);
    assert.ok(party.subjectEntityIds.includes('ultima5:knowledge:recommended-party'));
    const recipe=field('ultima6','silk-thread-cloth','creator').find(entry=>entry.explicit);
    assert.ok(recipe.subjectEntityIds.some(id=>knowledge.ultima6.entities.get(id).name==='Hot-Air Balloon'));
    assert.ok(field('ultima6','gwenno-song','teacher').some(entry=>entry.subjectEntityIds.includes('ultima6:quest:act-i-liberating-the-shrines:sacrifice-minoc')));
});
const source={file:'guide.js',locator:'DB.items[0].effect',review:'extracted'};
function synthetic(){
    const text='A Shield grants protection when held. Keep the condition in the full answer.';
    return {entities:new Map([['shield',{name:'Shield',aliases:[],declared:true}],['actor',{name:'Actor',aliases:[],declared:true}],['other',{name:'Other',aliases:[],declared:true}]]),sourceContexts:[],
        facts:[{id:'effect',entityId:'shield',facet:'use',answerRelations:['use'],text,witness:text,sourceRecordId:'raw',source,
            sourceFields:[{key:'use',selectors:['effect'],witness:'grants protection'}]}],
        sourceRecords:[{id:'raw',entityId:'shield',title:'Shield',level:'direct',text,source}],links:[]};
}
test('a selector witness may be a span, but its fact remains the entire conditional proof',()=>{
    const k=synthetic(),before=JSON.stringify(k.facts);const index=buildSourceFieldIndex(k);
    assert.deepEqual(index.issues,[]);const entry=index.entries.find(entry=>entry.explicit);assert.equal(entry.witness,'grants protection');
    assert.equal(k.facts.find(fact=>fact.id===entry.factId).text,'A Shield grants protection when held. Keep the condition in the full answer.');assert.equal(JSON.stringify(k.facts),before);
});
test('basic inference grants no named selector, composition or participant relation',()=>{
    const k=synthetic();delete k.facts[0].sourceFields;const result=buildSourceFieldIndex(k);assert.deepEqual(result.issues,[]);
    assert.deepEqual(result.entries.filter(entry=>entry.factId==='effect').map(({key,selectors})=>({key,selectors})),[{key:'use',selectors:[]}]);
});
test('unproved witnesses, unknown owners, malformed fields and fabricated provenance are rejected atomically',()=>{
    for(const modify of [
        k=>{k.facts[0].sourceFields[0].witness='not in the source';},
        k=>{k.facts[0].sourceFields[0].key='metal';},
        k=>{k.facts[0].sourceFields[0].selectors=['What is the answer'];},
        k=>{k.facts[0].sourceFields[0].subjectEntityIds=['unknown'];},
        k=>{k.facts[0].sourceFields[0].subjectEntityIds=['other'];},
        k=>{k.facts[0].sourceFields[0].source={...source,locator:'DB.items[99].metal'};},
        k=>{k.facts[0].sourceFields.push({...k.facts[0].sourceFields[0]});},
        k=>{k.facts[0].text+=' extra';},
        k=>{k.sourceRecords[0].text='A different witness';},
        k=>{delete k.sourceRecords[0].level;}
    ]){const k=synthetic();modify(k);const result=buildSourceFieldIndex(k);assert.ok(result.issues.length);assert.equal(result.entries.filter(entry=>entry.factId==='effect').length,0);}
});
test('literal bindings and caller canonicalization authorize only the declared target',()=>{
    const k=synthetic();k.facts[0].text=k.facts[0].witness=k.sourceRecords[0].text='Actor gives the Shield.';
    k.facts[0].bindings=[{entityId:'actor',mention:'Actor',relations:['use']}];k.facts[0].sourceFields=[{key:'use',selectors:['effect'],witness:'Actor gives the Shield.',subjectEntityIds:['old-actor']}];
    assert.deepEqual(buildSourceFieldIndex(k,{canonicalize:id=>id==='old-actor'?'actor':id}).issues,[]);
    k.facts[0].bindings[0].mention='Other';assert.ok(buildSourceFieldIndex(k,{canonicalize:id=>id==='old-actor'?'actor':id}).issues.length);
});
test('conflicting originals and author conflicts do not confer field coverage',()=>{
    for(const location of ['fact','record']){const k=synthetic();(location==='fact'?k.facts[0]:k.sourceRecords[0]).conflict=true;const result=buildSourceFieldIndex(k);assert.deepEqual(result.issues,[]);assert.equal(result.entries.length,0);}
});

test('original spell-table schemas expose effects in two source formats without curated document changes',()=>{
    for(const [game,id,value] of [['ultima5','ultima5:spell:an-nox:use','Cures poison'],['ultima6','ultima6:spell:cure:use:reference','Cures poison on a single target']]){
        const entries=indexes[game].entries.filter(entry=>entry.recordId===id);
        assert.ok(entries.some(entry=>entry.key==='use' && entry.selectors.includes('effect') && entry.witness.includes(value)));
        assert.ok(entries.every(entry=>entry.factId===null && entry.record.text===entry.witness));
    }
});
function rawFixture(locator,text,{kind='item',relation='use',claims=[]}={}){
    return {entities:new Map([['owner',{name:'Owner',kind,aliases:[]}]]),facts:[],sourceContexts:[],sourceRecords:[{
        id:'raw',entityId:'owner',title:'Owner',kind,relation,level:'direct',text,
        source:{file:'original-guide.js',locator,review:'extracted',...(claims.length?{claims}:{})}
    }]};
}
test('property descriptors are generic, structurally bounded and case insensitive',()=>{
    for(const locator of ['Catalog.Artefacts[0].Effect','Catalog.Artefacts[0].EFFECT','Rules.Spells[17].description']){
        const index=buildSourceFieldIndex(rawFixture(locator,'Restores protection.'));
        assert.ok(index.entries.some(entry=>entry.key==='use' && entry.selectors.includes('effect')),locator);
        assert.deepEqual(index.entries[0].fieldSource,{file:'original-guide.js',locator,review:'extracted'});
    }
    assert.ok(buildSourceFieldIndex(rawFixture('Catalog[0].Effect','Cures poison.',{relation:'explanation'})).entries.some(entry=>entry.selectors.includes('effect')));
    const stats=buildSourceFieldIndex(rawFixture('Roster[2].STR','18',{kind:'companion',relation:'explanation'}));
    assert.deepEqual(stats.entries[0].selectors,['strength']);
    const location=buildSourceFieldIndex(rawFixture('Roster[2].Location','157S/53E',{kind:'companion',relation:'location'}));
    assert.deepEqual(location.entries[0].selectors,['coordinates']);
});
test('Notes and Use, unrelated numeric rows and multi-spell summaries do not become effect or attribute proof',()=>{
    for(const fixture of [
        rawFixture('Catalog[0].Notes','Effect: poison. Strength 20. Use this object.',{kind:'companion',relation:'explanation'}),
        rawFixture('Catalog[0].Use','Effect: poison. Strength 20.'),
        rawFixture('Catalog[0].Notes','Strength 20. Dexterity 17.',{relation:'stats'}),
        rawFixture('Catalog[0]','There are 20 objects and 17 rooms.',{relation:'stats'}),
        rawFixture('spellData name=First; spellData name=Second','Circle 1 spell. Cures poison.',{kind:'topic'}),
        rawFixture('Catalog[0].effectiveness','Restores HP.')
    ]){
        const entries=buildSourceFieldIndex(fixture).entries;
        assert.equal(entries.some(entry=>entry.selectors.includes('effect')),false);
        assert.equal(entries.some(entry=>entry.key==='stats'),false);
    }
});
test('typed source claims require literal membership and original file identity',()=>{
    const text='The complete record. Restores HP. Strength 18.';
    const claims=[
        {text:'Restores HP.',source:{file:'original-guide.js',locator:'Catalog[0].Effect',review:'extracted'}},
        {text:'Strength 18.',source:{file:'original-guide.js',locator:'Catalog[0].Strength',review:'extracted'}},
        {text:'Absent from the record.',source:{file:'original-guide.js',locator:'Catalog[0].Description',review:'extracted'}},
        {text:'Restores HP.',source:{file:'original-guide.js',locator:'Catalog[99].Effect',review:'extracted'}},
        {text:'Restores HP.',source:{file:'different-guide.js',locator:'Catalog[0].Description',review:'extracted'}}
    ];
    const entries=buildSourceFieldIndex(rawFixture('Catalog[0]',text,{kind:'item',relation:'explanation',claims})).entries;
    assert.deepEqual(entries.map(entry=>[entry.key,entry.selectors]),[['use',['effect','purpose']],['stats',['strength']]]);
    assert.ok(entries.every(entry=>entry.witness===text && entry.record.text===text));
    assert.deepEqual(entries.map(entry=>entry.fieldSource.locator),['Catalog[0].Effect','Catalog[0].Strength']);
});
test('basic facets include only same-relation literal reviewed binding owners',()=>{
    const k=synthetic();delete k.facts[0].sourceFields;
    k.facts[0].text=k.facts[0].witness=k.sourceRecords[0].text='Actor carries the Shield.';
    k.facts[0].bindings=[{entityId:'actor',mention:'Actor',relations:['use']}];
    let entry=buildSourceFieldIndex(k).entries.find(entry=>entry.factId==='effect');
    assert.deepEqual(entry.subjectEntityIds,['shield','actor']);assert.deepEqual(entry.bindingOwners,['actor']);
    k.facts[0].bindings[0].relations=['location'];entry=buildSourceFieldIndex(k).entries.find(entry=>entry.factId==='effect');
    assert.deepEqual(entry.subjectEntityIds,['shield']);
    const rifrako=indexes.albion.entries.find(entry=>entry.factId==='place-aballon' && entry.key==='location');
    assert.ok(rifrako.bindingOwners.some(id=>knowledge.albion.entities.get(id).name==='Rifrako'));
});

import {parseSourceRequestFrame} from '../../js/assistant/request-frame.js';
import {planSourceFields} from '../../js/assistant/source-field-router.js';
test('the pure planner covers old spell effects with complete raw originals and rejects unrelated properties',()=>{
    for(const [game,query,fragment] of [['ultima5','What does An Nox do?','Cures poison'],['ultima6','What does Cure do?','Cures poison on a single target']]){
        const knowledgeForGame=knowledge[game],index=indexes[game];
        const plan=planSourceFields({frame:parseSourceRequestFrame(query),knowledge:knowledgeForGame,index});
        assert.equal(plan.status,'answer',JSON.stringify(plan));
        assert.ok(plan.proofs.some(proof=>proof.text.includes(fragment)));
        assert.ok(plan.proofs.every(proof=>proof.text===proof.witness && proof.source.file));
    }
    for(const query of ['Which metal is An Nox made from?',"What is An Nox's Strength?","What is An Nox's range?",'How many seconds does An Nox last?']){
        const plan=planSourceFields({frame:parseSourceRequestFrame(query),knowledge:knowledge.ultima5,index:indexes.ultima5});
        assert.notEqual(plan.status,'answer',query);
    }
});

test('authored list members retain actual roster, directory and alternative cardinality without arithmetic',()=>{
    const party=field('ultima5','party-six','identity').find(entry=>entry.selectors.includes('members'));
    assert.deepEqual(party.members,['Avatar','Iolo','Jaana','Julia','Gwenno','Mariah']);
    assert.ok(party.witness.includes('Shamino') && party.witness.includes('Johne'));
    assert.ok(!party.members.includes('Shamino') && !party.members.includes('Johne'));
    const directories=indexes.starcraft.entries.find(entry=>entry.factId?.endsWith('purplewave-working-folder') && entry.selectors.includes('data-directory'));
    assert.deepEqual(directories.members,['bwapi-data/AI','bwapi-data/read','bwapi-data/write']);
    assert.ok(!indexes.starcraft.entries.find(entry=>entry.factId===directories.factId && entry.selectors.includes('working-directory')).members);
    const alternatives=field('albion','find-path','sequence')[0];assert.equal(alternatives.members.length,2);
    assert.ok(alternatives.members.every(member=>alternatives.witness.includes(member)));
    const examples=indexes.starcraft.entries.find(entry=>entry.factId?.endsWith('example-bots') && entry.selectors.includes('members'));
    assert.deepEqual(examples.members,['Steamhammer','UAlbertaBot']);
});
test('member validation is literal, unique and field-local; unrelated numbers never become a count',()=>{
    for(const members of [[],['Actor','Actor'],['Actor','ACTOR'],['Missing'],[' Actor'],[20]]){
        const k=synthetic();k.facts[0].sourceFields[0].members=members;
        const index=buildSourceFieldIndex(k);assert.ok(index.issues.length);assert.equal(index.entries.filter(entry=>entry.factId==='effect').length,0);
    }
    const k=synthetic();k.facts[0].text=k.facts[0].witness=k.sourceRecords[0].text='Actor carries Shield. Other costs 20 gold.';
    k.facts[0].sourceFields=[{key:'identity',selectors:['members'],witness:'Actor carries Shield.',members:['Actor','Other']}];
    assert.ok(buildSourceFieldIndex(k).issues.length,'a full-fact co-mention cannot enter another field span list');
    delete k.facts[0].sourceFields;
    assert.ok(buildSourceFieldIndex(k).entries.every(entry=>entry.members===undefined),'20 gold is not a list cardinality');
});

test('a lone unrelated claim cannot confer a property even when its words occur in the parent text',()=>{
    for(const claim of [
        {text:'Restores HP.',source:{file:'original-guide.js',locator:'Catalog[99].Effect',review:'extracted'}},
        {text:'Restores HP.',source:{file:'different-guide.js',locator:'Catalog[0].Effect',review:'extracted'}},
        {text:'Absent source text.',source:{file:'original-guide.js',locator:'Catalog[0].Effect',review:'extracted'}}
    ])assert.equal(buildSourceFieldIndex(rawFixture('Catalog[0]','Restores HP.',{relation:'explanation',claims:[claim]})).entries.length,0);
});

test('exact named source selectors preserve real location fields without accepting padded or compound paths',()=>{
    for(const locator of ['records objective=opening-route.Location','records[id=opening-route].Location']){
        assert.ok(buildSourceFieldIndex(rawFixture(locator,'Inside the northern room.',{relation:'location'})).entries.some(entry=>entry.key==='location'));
    }
    for(const locator of ['records objective=opening-route..Location','records[00].Location','records[0]; other[9].Location']){
        assert.equal(buildSourceFieldIndex(rawFixture(locator,'Inside the northern room.',{relation:'location'})).entries.length,0);
    }
});

test('combat coverage requires its corresponding reviewed facet and relation, never a nearby effect',()=>{
    const k=synthetic();delete k.facts[0].sourceFields;
    k.facts[0].facet='combat';k.facts[0].answerRelations=['combat'];
    let entry=buildSourceFieldIndex(k).entries.find(entry=>entry.factId==='effect' && entry.key==='combat');
    assert.ok(entry);assert.deepEqual(entry.selectors,[]);assert.equal(entry.witness,k.facts[0].witness);
    k.facts[0].answerRelations=['use'];
    assert.equal(buildSourceFieldIndex(k).entries.some(entry=>entry.key==='combat'),false);
    k.facts[0].facet='use';k.facts[0].answerRelations=['use','combat'];
    assert.equal(buildSourceFieldIndex(k).entries.some(entry=>entry.key==='combat'),false);
});

test('trade percentages require a typed trade row and its exact canonical merchant owner',()=>{
    const row='Owner (CityA): Sell 110%, Buy 132%. Recorded rates.';
    const k=rawFixture('Catalog.locations[0]; Catalog.Trade[0]','CityA is in RegionA.\n'+row,{kind:'npc',relation:'location'});
    const entry=buildSourceFieldIndex(k).entries.find(entry=>entry.key==='stats');
    assert.deepEqual(entry.selectors,['selling-percentage','buying-percentage']);
    assert.equal(entry.recordId,'raw');assert.equal(entry.witness,k.sourceRecords[0].text);assert.equal(entry.record.text,entry.witness);
    assert.deepEqual(entry.source,{file:'original-guide.js',locator:'Catalog.locations[0]; Catalog.Trade[0]',review:'extracted'});
    assert.equal(entry.fieldSource.locator,'Catalog.Trade[0]');assert.equal(entry.rowScope.ownerText,'Owner');
    assert.equal(entry.rowScope.locationText,'CityA');assert.equal(entry.rowScope.witness,row);
    for(const fixture of [
        rawFixture('Catalog.locations[0]',row,{kind:'npc',relation:'location'}),
        rawFixture('Catalog.Trade[0]','Other (CityB): Sell 110%, Buy 132%.',{kind:'npc',relation:'location'}),
        rawFixture('Catalog.Trade[0]','Owner in CityA has a selling percentage of 110% and buying percentage of 132%.',{kind:'npc',relation:'location'}),
        rawFixture('Catalog.Trade[0]',row+'\nOther (CityB): Sell 125%, Buy 150%.',{kind:'npc',relation:'location'}),
        rawFixture('Catalog.Trade[0]; Catalog.Trade[1]',row,{kind:'npc',relation:'location'})
    ])assert.equal(buildSourceFieldIndex(fixture).entries.some(entry=>entry.key==='stats'),false);
});
test('trade city binding is retained separately from unrelated parent prose and cannot shorten a qualified owner',()=>{
    const k=rawFixture('Catalog.locations[0]; Catalog.trade[0]','A different merchant works in CityB.\nOwner (CityA): Sell 110%, Buy 132%.',{kind:'npc',relation:'location'});
    let entry=buildSourceFieldIndex(k).entries.find(entry=>entry.key==='stats');
    assert.equal(entry.rowScope.locationText,'CityA');assert.ok(!entry.rowScope.witness.includes('CityB'));
    k.entities.get('owner').name='Owner (CityA)';
    assert.ok(buildSourceFieldIndex(k).entries.some(entry=>entry.key==='stats'));
    k.sourceRecords[0].text='Owner (CityB): Sell 110%, Buy 132%.';
    assert.equal(buildSourceFieldIndex(k).entries.some(entry=>entry.key==='stats'),false);
});
test('literal trade claims can identify their own row without borrowing another merchant rate',()=>{
    const own='Owner (CityA): Sell 110%, Buy 132%.',other='Other (CityB): Sell 125%, Buy 150%.';
    const claims=[{text:own,source:{file:'original-guide.js',locator:'Catalog.trade[0]',review:'extracted'}},
        {text:other,source:{file:'original-guide.js',locator:'Catalog.trade[1]',review:'extracted'}}];
    const entry=buildSourceFieldIndex(rawFixture('Catalog.trade[0]; Catalog.trade[1]',own+'\n'+other,{kind:'npc',relation:'location',claims})).entries.find(entry=>entry.rowScope);
    assert.equal(entry.fieldSource.locator,'Catalog.trade[0]');assert.equal(entry.rowScope.locationText,'CityA');
    assert.equal(entry.rowScope.sellingText,'110%');assert.equal(entry.rowScope.buyingText,'132%');
    const unrelated=[{text:own,source:{file:'original-guide.js',locator:'Catalog.trade[99]',review:'extracted'}}];
    const mismatched=buildSourceFieldIndex(rawFixture('Catalog.trade[0]; Catalog.trade[1]',own+'\n'+other,{kind:'npc',relation:'location',claims:unrelated}));
    assert.equal(mismatched.entries.some(entry=>entry.rowScope),false,'an absent trade child cannot authorize a literal co-mention');
});
test('actual Rabir and Winion raw merchant rows retain their distinct source, city and directions',()=>{
    for(const [name,city,sell,buy,path] of [['Rabir','Jirinaar','110%','132%','DB.trade[0]'],['Winion','Vanello','125%','150%','DB.trade[1]']]){
        const entry=indexes.albion.entries.find(entry=>entry.rowScope?.ownerText===name && entry.factId===null);
        assert.ok(entry,name);assert.equal(entry.fieldSource.locator,path);assert.equal(entry.rowScope.locationText,city);
        assert.equal(entry.rowScope.sellingText,sell);assert.equal(entry.rowScope.buyingText,buy);
        assert.equal(knowledge.albion.entities.get(entry.subjectEntityIds[0]).name,name);
    }
});

function groupedFixture(){
    const k=synthetic(),text='Actor crafts the Shield. Other spins thread.';
    k.facts[0].text=k.facts[0].witness=k.sourceRecords[0].text=text;
    k.links=[{id:'actor-shield',from:'actor',to:'shield',relation:'crafts',status:'recorded',evidenceFactIds:['effect']}];
    k.facts[0].sourceFields=[{key:'creator',witness:text,arguments:[{linkId:'actor-shield',bindings:[{role:'agent',entityId:'actor',mention:'Actor'},{role:'output',entityId:'shield',mention:'Shield'}]}]}];
    return k;
}
test('grouped literal participants retain directed pairs without becoming field owners',()=>{
    const k=groupedFixture(),entry=buildSourceFieldIndex(k).entries.find(entry=>entry.key==='creator');
    assert.deepEqual(entry.subjectEntityIds,['shield']);
    assert.deepEqual(entry.arguments,[{linkId:'actor-shield',from:'actor',to:'shield',relation:'crafts',evidenceFactIds:['effect'],bindings:[{role:'agent',entityId:'actor',mention:'Actor'},{role:'output',entityId:'shield',mention:'Shield'}],requiredFactIds:[],sourceContextIds:[]}]);
    const recipe=field('ultima6','silk-thread-cloth','creator')[0];
    assert.deepEqual(recipe.arguments.map(group=>group.linkId),['arbeth-thread','charlotte-cloth']);
    assert.deepEqual(recipe.arguments.map(group=>group.bindings.map(binding=>binding.mention)),[['Arbeth','thread'],['Charlotte','cloth']]);
});
test('literal argument groups reject malformed roles, witnesses, entities, duplicates and reversed or unrelated links atomically',()=>{
    const changes=[
        k=>{k.facts[0].sourceFields[0].arguments=[];},
        k=>{k.facts[0].sourceFields[0].arguments[0].bindings=[];},
        k=>{k.facts[0].sourceFields[0].arguments[0].bindings[0].role='owner';},
        k=>{k.facts[0].sourceFields[0].arguments[0].bindings[0].mention='Missing';},
        k=>{k.facts[0].sourceFields[0].arguments[0].bindings[0].entityId='missing';},
        k=>{k.facts[0].sourceFields[0].arguments[0].bindings[0].role='output';},
        k=>{k.facts[0].sourceFields[0].arguments[0].bindings[0].mention='Other';},
        k=>{k.facts[0].sourceFields[0].arguments[0].linkId='missing';},
        k=>{k.links[0].evidenceFactIds=['neighbor'];},
        k=>{k.links[0].status='disputed';},
        k=>{k.links[0].relation='co-mentioned';},
        k=>{k.facts[0].sourceFields[0].arguments[0].bindings.push({...k.facts[0].sourceFields[0].arguments[0].bindings[0]});},
        k=>{k.facts[0].sourceFields[0].arguments.push(structuredClone(k.facts[0].sourceFields[0].arguments[0]));},
        k=>{k.facts[0].sourceFields[0].witness='Shield';}
    ];
    for(const change of changes){const k=groupedFixture();change(k);const index=buildSourceFieldIndex(k);assert.ok(index.issues.length);assert.equal(index.entries.filter(entry=>entry.factId==='effect').length,0);}
});
function nonliteralFixture(){
    const k=synthetic(),current='Perform the tune for Actor.',teaching='Learn STONES from Other.';
    const parent={file:'guide.js',locator:'DB.section',review:'extracted'};
    k.entities.set('stones',{name:'Stones',aliases:[],declared:true});
    k.sourceRecords[0].text=current+'\n'+teaching;k.sourceRecords[0].source=parent;
    k.facts=[{id:'performance',entityId:'actor',facet:'method',answerRelations:['method'],sourceRecordId:'raw',source:{...parent,locator:'DB.section.steps[1]'},text:current,witness:current,sourceFields:[{key:'recipient',witness:current,arguments:[{linkId:'performed',bindings:[{role:'content',entityId:'stones',mention:'tune'},{role:'recipient',entityId:'actor',mention:'Actor'}]}]}]},
        {id:'teaching',entityId:'other',facet:'method',answerRelations:['method'],sourceRecordId:'raw',source:{...parent,locator:'DB.section.steps[0]'},text:teaching,witness:teaching}];
    k.links=[{id:'performed',from:'stones',to:'actor',relation:'performed_for',status:'conditional',evidenceFactIds:['teaching','performance']}];
    k.sourceContexts=[{id:'reviewed-task',entityId:'shield',label:'Shield',sourceRecordId:'raw',source:parent}];
    return k;
}
test('nonliteral canonical tune binding requires all original direct proofs and a shared explicit source context',()=>{
    const k=nonliteralFixture(),index=buildSourceFieldIndex(k);assert.deepEqual(index.issues,[]);
    const group=index.entries.find(entry=>entry.key==='recipient').arguments[0];
    assert.deepEqual(group.requiredFactIds,['teaching','performance']);assert.deepEqual(group.sourceContextIds,['reviewed-task']);
    for(const change of [
        k=>{k.sourceContexts=[];},k=>{k.facts[1].conflict=true;},k=>{k.facts[1].text=k.facts[1].witness='A fabricated teaching claim.';},
        k=>{k.facts[1].source.locator='DB.neighbor.steps[0]';},k=>{k.links[0].evidenceFactIds.push('absent');},
        k=>{delete k.facts[0].sourceFields[0].arguments[0].linkId;}
    ]){const control=nonliteralFixture();change(control);const rejected=buildSourceFieldIndex(control);assert.ok(rejected.issues.length);assert.equal(rejected.entries.some(entry=>entry.factId==='performance'),false);}
    const actual=field('ultima6','selganor-rune','recipient')[0].arguments[0];
    assert.deepEqual(actual.requiredFactIds,['gwenno-song','selganor-rune']);
    assert.ok(actual.sourceContextIds.includes('sacrifice-source-context'));
});
test('unlinked literal values remain field-local and do not manufacture entities or aliases',()=>{
    const k=groupedFixture();k.facts[0].sourceFields[0].arguments=[{bindings:[{role:'content',mention:'Actor'},{role:'output',mention:'Shield'}]}];
    const beforeEntities=JSON.stringify([...k.entities]);const index=buildSourceFieldIndex(k);assert.deepEqual(index.issues,[]);
    const group=index.entries.find(entry=>entry.key==='creator').arguments[0];assert.equal(group.bindings[0].entityId,undefined);
    assert.deepEqual(group.requiredFactIds,[]);assert.equal(JSON.stringify([...k.entities]),beforeEntities);
});
test('repair ownership requires the explicit keyword proof and original twin-lens context',()=>{
    const red=field('ultima6','red-lens','creator')[0],group=red.arguments[0];
    assert.deepEqual(group.requiredFactIds,['red-lens','lor-lens-keyword']);assert.ok(group.sourceContextIds.includes('source-fields-twin-lenses-context'));
    assert.equal(group.relation,'repairs');assert.equal(group.bindings.find(binding=>binding.role==='agent').entityId,group.from);
    assert.equal(group.bindings.find(binding=>binding.role==='object').entityId,group.to);
    for(const change of [
        k=>{k.sourceContexts=k.sourceContexts.filter(context=>context.id!=='source-fields-twin-lenses-context');},
        k=>{k.facts=k.facts.filter(fact=>fact.id!=='lor-lens-keyword');},
        k=>{k.facts.find(fact=>fact.id==='lor-lens-keyword').conflict=true;}
    ]){const k=structuredClone(knowledge.ultima6);change(k);assert.equal(buildSourceFieldIndex(k).entries.some(entry=>entry.factId==='red-lens' && entry.key==='creator'),false,'delivery/profession alone cannot supply the missing explicit repair proof');}
    const withoutAuthoredRole=structuredClone(knowledge.ultima6);
    withoutAuthoredRole.facts.find(fact=>fact.id==='red-lens').sourceFields=withoutAuthoredRole.facts.find(fact=>fact.id==='red-lens').sourceFields.filter(field=>field.key!=='creator');
    assert.equal(buildSourceFieldIndex(withoutAuthoredRole).entries.some(entry=>entry.factId==='red-lens' && entry.key==='creator'),false,'repair is never inferred from co-occurring delivery or profession');
});

test('finite endpoint directions preserve inverse purchase and underscore escort roles',()=>{
    for(const [relation,bindings] of [['buy-for-20-gold',[{role:'object',entityId:'actor',mention:'Actor'},{role:'agent',entityId:'shield',mention:'Shield'}]],['escorted_to',[{role:'object',entityId:'actor',mention:'Actor'},{role:'destination',entityId:'shield',mention:'Shield'}]]]){
        const k=groupedFixture();k.links[0].relation=relation;k.facts[0].sourceFields[0].arguments[0].bindings=bindings;
        assert.deepEqual(buildSourceFieldIndex(k).issues,[],relation);
        k.facts[0].sourceFields[0].arguments[0].bindings[1].entityId='actor';k.facts[0].sourceFields[0].arguments[0].bindings[1].mention='Actor';
        assert.ok(buildSourceFieldIndex(k).issues.length,'the opposite endpoint must not acquire the role');
    }
    const door=field('ultima5','sceptre-well','method')[0];assert.ok(door.selectors.includes('open'));
    assert.deepEqual(door.arguments[0].bindings.map(binding=>[binding.role,binding.mention]),[['object','center door'],['instrument','Skull Key']]);
});

test('lens placement keeps each object and its complete destination in a separate literal source group',()=>{
    const entry=field('ultima6','lens-placement','method').find(entry=>entry.arguments);
    assert.deepEqual(entry.arguments.map(group=>group.bindings.map(binding=>binding.mention)),[
        ['Britannian lens','between the left flame and the Codex'],['gargoyle lens','between the right flame and the Codex']]);
    assert.ok(entry.arguments.every(group=>group.requiredFactIds.length===0 && group.bindings[0].role==='object' && group.bindings[1].role==='destination'));
    assert.equal(entry.witness,knowledge.ultima6.facts.find(fact=>fact.id==='lens-placement').witness);
});

test('public recompilation defaults to the exact declared ID map while preserving an explicit mapper',()=>{
    const k=groupedFixture();k.entityIdMap=new Map([['declared-shield','shield'],['declared-actor','actor']]);
    k.facts[0].sourceFields[0].subjectEntityIds=['declared-shield'];
    k.facts[0].sourceFields[0].arguments[0].bindings[0].entityId='declared-actor';
    k.facts[0].sourceFields[0].arguments[0].bindings[1].entityId='declared-shield';
    const explicit=buildSourceFieldIndex(k,{canonicalize:value=>k.entityIdMap.get(value) || value}),implicit=buildSourceFieldIndex(k);
    assert.deepEqual(explicit.issues,[]);assert.deepEqual(implicit,explicit);
    assert.ok(!k.entities.has('declared-shield') && !k.entities.has('declared-actor'));
    assert.ok(buildSourceFieldIndex(k,{canonicalize:value=>value}).issues.length,'a supplied identity mapper remains authoritative');
    k.facts[0].sourceFields[0].arguments[0].bindings[0].entityId='undeclared-actor';
    assert.ok(buildSourceFieldIndex(k).issues.length,'the default map does not infer undeclared aliases');
});
