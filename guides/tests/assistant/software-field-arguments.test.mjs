import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {matchesSoftwareFieldArgument as matches} from '../../js/assistant/software-capabilities.js';

const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url)));
const knowledge=buildKnowledge('starcraft',read('./evidence/conversation-starcraft-source-records.json'),read('../../data/assistant/knowledge/starcraft.json'));
assert.deepEqual(knowledge.issues,[]);
function fixture(id,key,selector,value,mention){
    const fact=knowledge.facts.find(fact=>fact.id===`starcraft:knowledge:${id}`),owner=knowledge.entities.get(fact.entityId);
    const entry=knowledge.sourceFields.entries.find(entry=>entry.factId===fact.id && entry.key===key && entry.selectors.includes(selector));
    const binding=entry.arguments.flatMap(group=>group.bindings).find(binding=>binding.mention===mention);
    return {value,binding,field:{key,selectors:[selector],unknownQualifierTexts:[]},entry,fact,subjectLabels:[owner.name,...owner.aliases]};
}
const command=()=>fixture('purplewave-build','outcome','artifact','the package command','mvn clean package');
const ide=()=>fixture('purplewave-working-folder','location','ide-directory','the IDE folder','IDE configuration');
const gameFiles=()=>fixture('schnail-game-files','use','automation','the game files','the game files');

test('Package-command class requires its exact compiled invocation-to-JAR-output relation',()=>{
    const value=command();assert.equal(matches(value),true);
    assert.equal(matches({...value,value:'build command'}),true);
    const build=fixture('purplewave-build','method','build','the package command','mvn clean package');
    assert.equal(matches(build),true);
    for(const text of ['the atomic package command','the installation command','mvn verify','another package command','package command version 2026'])
        assert.equal(matches({...value,value:text}),false,text);
    const disconnected={...value.entry,arguments:[{bindings:[value.binding]},{bindings:[{role:'output',mention:'target/PurpleWave-1.0.jar'}]}]};
    assert.equal(matches({...value,entry:disconnected}),false);
    const noRelationText=value.fact.text.replace('produces','mentions');
    const noRelation={...value,fact:{...value.fact,text:noRelationText,witness:noRelationText,
        record:{...value.fact.record,variants:{direct:{text:noRelationText}}}},entry:{...value.entry,witness:noRelationText}};
    assert.equal(matches(noRelation),false,'Typed co-occurrence cannot create a produces relation');
});

test('IDE-folder class requires the scoped configuration destination and entire installation-match caveat',()=>{
    const value=ide();assert.equal(matches(value),true);
    assert.equal(matches({...value,value:'IDE working directory'}),true);
    const qualification=fixture('purplewave-working-folder','limitations','installation-match','IDE directory','IDE configuration');
    assert.equal(matches(qualification),true);
    assert.equal(matches({...qualification,field:{...qualification.field,selectors:[]}}),true);
    for(const text of ['the portable IDE folder','the IDE default folder on Linux','the JAR folder','another IDE directory'])
        assert.equal(matches({...value,value:text}),false,text);
    const noCondition={...value.entry,arguments:value.entry.arguments.map(group=>({...group,bindings:group.bindings.filter(binding=>binding.role!=='content')}))};
    assert.equal(matches({...value,entry:noCondition}),false);
    const runtime=fixture('purplewave-working-folder','location','working-directory','IDE folder','JAR');
    assert.equal(matches(runtime),false,'The JAR working directory cannot replace the IDE destination');
});

test('Game-file target requires an actual client automatic-download-and-setup source group',()=>{
    const value=gameFiles();assert.equal(matches(value),true);
    for(const text of ['the game files on Linux','the Java files','the account files','30 game files'])
        assert.equal(matches({...value,value:text}),false,text);
    const noAgent={...value.entry,arguments:value.entry.arguments.map(group=>({...group,bindings:group.bindings.filter(binding=>binding.role!=='agent')}))};
    assert.equal(matches({...value,entry:noAgent}),false);
    const updates=knowledge.facts.find(fact=>fact.id==='starcraft:knowledge:schnail-updates');
    assert.equal(matches({...value,fact:updates}),false,'An update target is not a setup operation');
});

test('Class matching never weakens source, role, owner, whole-witness, qualifier or field coverage',()=>{
    for(const value of [command(),ide(),gameFiles()])for(const extra of [
        {binding:{...value.binding,role:'input'}},
        {binding:{...value.binding,mention:'unrecorded object'}},
        {entry:{...value.entry,explicit:false}},
        {entry:{...value.entry,source:{...value.entry.source,locator:'unrelated-source'}}},
        {entry:{...value.entry,witness:value.entry.witness.slice(0,-1)}},
        {fact:{...value.fact,conflict:true}},
        {fact:{...value.fact,record:undefined}},
        {fact:{...value.fact,record:{...value.fact.record,source:{...value.fact.record.source,locator:'unrelated-source'}}}},
        {fact:{...value.fact,text:value.fact.text.slice(0,-1),witness:value.fact.witness.slice(0,-1)}},
        {subjectLabels:['A different software project']},
        {field:{...value.field,unknownQualifierTexts:['quantum']}},
        {field:{key:'composition',selectors:['metal']}},
        {field:{...value.field,selectors:[...value.field.selectors,'checksum']}}
    ])assert.equal(matches({...value,...extra}),false);
});

test('A renamed synthetic tool preserves object classes without tool or game identifiers',()=>{
    for(const original of [command(),ide()]){
        const text=original.fact.text.replaceAll('PurpleWave','SamplePlanner'),fact={...original.fact,subject:original.fact.subject.replace('PurpleWave','SamplePlanner'),
            aliases:[],text,witness:text,record:{...original.fact.record,variants:{direct:{text}}}};
        const entry={...original.entry,witness:text,arguments:original.entry.arguments.map(group=>({...group,
            bindings:group.bindings.map(binding=>({...binding,mention:binding.mention.replaceAll('PurpleWave','SamplePlanner')}))}))};
        const binding=entry.arguments.flatMap(group=>group.bindings).find(binding=>binding.role===original.binding.role
            && binding.mention===original.binding.mention.replaceAll('PurpleWave','SamplePlanner'));
        assert.equal(matches({...original,fact,entry,binding,subjectLabels:['SamplePlanner']}),true);
    }
});
