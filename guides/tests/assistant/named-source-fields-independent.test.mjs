// Independent synthetic controls for named field identity and directed roles.
// These use complete literal source records; a matching field label cannot
// authorize a different actor/object's neighboring request, price or bonus.
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseNamedSourceFieldRequest as parse,supportsNamedSourceFieldRequest as supports} from '../../js/assistant/named-source-fields.js';

const source={file:'synthetic-local-guide.js',locator:'fields[0]',review:'extracted'};
function fixture(label,text,roles,title=label){
    const fact={id:'field',entityId:'owner',subject:label,facet:'method',topicLabels:[label],aliases:[label],
        text,witness:text,answerRelations:roles,sourceRecordId:'raw-field',source};
    return {fact,subjectEntityId:'owner',sourceRecord:{id:'raw-field',entityId:'owner',title,text,source},isEligible:()=>true};
}
const negative=[
    ['method unrelated action','How do I use Sword charge timing?','Sword charge timing','Use a torch.',['method','combat']],
    ['method different field','How do I use Combat movement?','Combat movement','Charge before contact. Ready the swing.',['method','combat']],
    ['method unrelated domain','How do I use Sword charge timing?','Sword charge timing','Charge the battery before takeoff.',['method','combat']],
    ['method unsupported scope word','How do I use silver Sword charge timing?','silver Sword charge timing','Charge before contact. Ready the swing.',['method','combat']],
    ['request unrelated actor','What is Alagner request?','Alagner request','Shamino asks you to fetch bread.',['objective']],
    ['request co-mentioned actor','What is Alagner request?','Alagner request','Alagner is in New Magincia. Shamino asks you to fetch bread.',['objective']],
    ['request negated role','What is Alagner request?','Alagner request','Alagner does not ask you to fetch bread.',['objective']],
    ['price unrelated item','How do I get Addom crystal price?','Addom crystal price','Buy bread from Iolo for 2 gold.',['acquisition','method']],
    ['price co-mentioned seller','How do I get Addom crystal price?','Addom crystal price','Addom sells boots. Buy a crystal from Iolo for 2 gold.',['acquisition','method']],
    ['price co-mentioned item','How do I get Addom crystal price?','Addom crystal price','The crystal is on a table. Buy bread from Addom for 2 gold.',['acquisition','method']],
    ['price negated amount','How do I get Addom crystal price?','Addom crystal price','Do not buy a crystal from Addom for 2 gold.',['acquisition','method']],
    ['bonus unrelated shrine','What is the Humility attribute bonus?','Humility attribute bonus','The Shrine of Justice grants no attribute bonus.',['stats','outcome'],'Shrine of Justice'],
    ['bonus co-mentioned shrine','What is the Humility attribute bonus?','Humility attribute bonus','Visit the Shrine of Humility. The Shrine of Justice grants no attribute bonus.',['stats','outcome'],'Two shrines'],
    ['bonus uncertain value','What is the Humility attribute bonus?','Humility attribute bonus','The Shrine of Humility might grant no attribute bonus.',['stats','outcome'],'Shrine of Humility']
];
for(const [label,q,scope,text,roles,title] of negative)test(`Named field rejects ${label}`,()=>{
    const context=fixture(scope,text,roles,title);
    assert.equal(supports(parse(q),context),false,text);
});

test('Independent controls retain explicit complete actor/item/value roles',()=>{
    for(const [q,label,text,roles,title] of [
        ['How do I use Sword charge timing?','Sword charge timing','Charge before contact. Do not wait until you are beside a creature to ready the swing.',['method','combat'],'Combat tips'],
        ['How do I use Combat movement?','Combat movement','Keep moving. Slower creatures can be dodged; your moving feet make you harder to hit.',['method','combat'],'Combat tips'],
        ['What is Alagner request?','Alagner request','In New Magincia, Alagner asks you to learn the answers to life and death from Skara Brae.',['objective'],'Alagner'],
        ['How do I get Addom crystal price?','Addom crystal price','Buy a special crystal from the adventurer Addom for 20 gold and give it to Brion so he can power the observatory\'s orrery.',['acquisition','method'],'Orrery crystal'],
        ['What is the Humility attribute bonus?','Humility attribute bonus','Return to the Shrine of Humility and meditate again to complete the quest; this shrine grants no attribute bonus.',['stats','outcome'],'Shrine of Humility']
    ]){
        const context=fixture(label,text,roles,title);
        assert.equal(supports(parse(q),context),true,q);
        assert.equal(supports(parse(q),{...context,sourceRecord:{...context.sourceRecord,text:'A different full source record.'}}),false,q);
        assert.equal(supports(parse(q),{...context,isEligible:()=>false}),false,q);
    }
});

// Exercise the caller's source/edition/compound guards with original records.
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge} from '../../js/assistant/knowledge.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';
const actual=[['alqadim','page-charge','How do I use Sword charge timing?'],
    ['alqadim','page-moving','How do I use Combat movement?'],
    ['ultima5','humility-no-bonus','What is the Humility attribute bonus?'],
    ['ultima7','alagner-answers-request','What is Alagner request?'],
    ['ultima7','orrery-crystal','How do I get Addom crystal price?']];
for(const [game,factId,q] of actual)test(`Named complete field caller preserves whole source and restrictions: ${factId}`,async()=>{
    const records=allRecords[game],manifest=JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`,import.meta.url)));
    const knowledge=buildKnowledge(game,records,manifest),engine=createAssistant({gameId:game,records,fallback:null});
    const assistant=createConversationAssistant({gameId:game,records,knowledge,assistant:engine,classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    try{
        const good=await assistant.answerAsync(q);
        assert.equal(good.decision,'answer',q+': '+good.text);
        assert.deepEqual(good.knowledge.factIds,[factId]);
        assert.equal(good.text,knowledge.facts.find(fact=>fact.id===factId).text);
        assert.ok(good.sources.length);
        for(const restricted of [
            `According to the original manual, ${q[0].toLowerCase()+q.slice(1)}`,
            q.replace('?',' on Mars?'),
            `In the SNES edition, ${q[0].toLowerCase()+q.slice(1)}`,
            q+' And who is the radioactive king?'
        ]){
            const result=await assistant.answerAsync(restricted);
            assert.notEqual(result.decision,'answer',restricted+': '+result.text);
            assert.deepEqual(result.actions,[]);
            assert.deepEqual(result.stateChanges,[]);
        }
        assert.equal(engine.inspect().claimCount,0);
    }finally{assistant.destroy();}
});
