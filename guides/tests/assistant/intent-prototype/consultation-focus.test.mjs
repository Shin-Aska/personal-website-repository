import test from 'node:test';
import assert from 'node:assert/strict';
import {createInterpreter} from './interpreter.mjs';

const record=(entityId,title,extra={})=>({id:entityId+':fact',entityId,title,aliases:[],kind:'item',relation:'acquisition',
    minSpoiler:'gentle',variants:{gentle:{text:'A reviewed source passage.'}},
    source:{file:'fixture.html',locator:entityId,review:'extracted'},...extra});
const records=[record('known','Known Tool'),record('hidden','Hidden Tool',{minSpoiler:'direct',variants:{direct:{text:'Hidden fact.'}}}),
    record('research','Research Tool',{source:{file:'research.json',locator:'research',review:'external-research'}})];
const make=()=>createInterpreter({gameId:'starcraft',records,classify:async()=>[{label:'acquisition',score:0.9},{label:'unknown',score:0.1}]});

test('a reviewed recommendation can focus a visible subject without asserting progress',async()=>{
    const interpreter=make();
    assert.equal(interpreter.focusSubject('known',{spoiler:'direct'}),true);
    const packet=await interpreter.interpret('download link',{spoiler:'direct'});
    assert.equal(packet.entityId,'known');assert.equal(packet.status,'ready');
    assert.equal(packet.canonicalQuestion,'Where can I download Known Tool?');
    assert.equal(packet.method,'download');assert.equal(interpreter.getState().pending,null);
});

test('planner focus cannot carry unknown, hidden or guide-only research subjects',async()=>{
    const interpreter=make();
    for(const [id,opts] of [['missing',{spoiler:'direct'}],['hidden',{spoiler:'gentle'}],['research',{spoiler:'direct',guideOnly:true}]]){
        interpreter.focusSubject('known',{spoiler:'direct'});
        assert.equal(interpreter.focusSubject(id,opts),false);
        assert.equal(interpreter.getState().subject,null);
    }
});

test('source-only focus keeps source restrictions on a later fragment',async()=>{
    const interpreter=make();
    interpreter.focusSubject('known',{spoiler:'direct',guideOnly:true});
    const packet=await interpreter.interpret('download link',{spoiler:'direct'});
    assert.equal(packet.restrictions.guideOnly,true);assert.equal(packet.blockReplay,true);
    assert.equal(packet.canonicalQuestion,undefined);
});
