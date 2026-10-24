import assert from 'node:assert/strict';
import test from 'node:test';
import {allRecords} from './load-records.mjs';
import {createAssistant} from '../../js/assistant/engine.js';
const make=()=>createAssistant({gameId:'ultima5',records:allRecords.ultima5});
const direct={spoiler:'direct'};

test('an early rejected qualifier establishes the new Crown subject and retains its restriction',()=>{
 const a=make();
 assert.deepEqual(a.answer('What does the Sceptre do?',direct).recordIds,['ultima5:item:sceptre:use']);
 assert.notEqual(a.answer('Where is the Crown without a key?').decision,'answer');
 assert.notEqual(a.answer('What does it do?').decision,'answer');
 assert.deepEqual(a.answer('What does the Crown do?').recordIds,['ultima5:item:crown:use']);
 assert.equal(a.inspect().claimCount,0);
});
test('a rejected qualifier cannot leak an older effect through a multipart pronoun',()=>{
 const a=make();a.answer('What does the Sceptre do?',direct);
 const r=a.answer('Where is the Crown without a key and what does it do?');
 assert.notEqual(r.decision,'answer');assert.deepEqual(r.recordIds,[]);
 assert.ok(r.parts.every(p=>p.decision!=='answer'));
 assert.doesNotMatch(r.text,/dispel every magical field|Protection from enemy magic/);
});
test('an unsupported hypothetical clears stale subject context without applying player progress',()=>{
 const a=make();a.answer('What does the Sceptre do?',direct);
 assert.notEqual(a.answer('Where is the Crown only if I have no keys?').decision,'answer');
 assert.notEqual(a.answer('What does it do?').decision,'answer');
 assert.equal(a.inspect().claimCount,0);
 assert.deepEqual(a.answer('What does the Sceptre do?').recordIds,['ultima5:item:sceptre:use']);
});
test('an unrecognized restricted subject cannot keep the older Sceptre referent',()=>{
 const a=make();a.answer('What does the Sceptre do?',direct);
 assert.notEqual(a.answer('Where is the Phantom Artifact without a key?').decision,'answer');
 assert.notEqual(a.answer('What does it do?').decision,'answer');
});
test('overview requests still reject unsupported conditions before listing facts',()=>{
 const a=make();a.answer('What does the Sceptre do?',direct);
 assert.notEqual(a.answer('Tell me everything about the Crown without a key').decision,'answer');
 assert.notEqual(a.answer('What does it do?').decision,'answer');
});
test('a plain ownership hypothetical keeps the current subject without reporting possession',()=>{
 const a=createAssistant({gameId:'albion',records:allRecords.albion});
 a.answer('Where is Pistol?',direct);
 assert.equal(a.answer('If I have Pistol, what next?').decision,'clarify');
 assert.deepEqual(a.answer('How do I use it?').recordIds,['albion:item:pistol:use']);
 assert.equal(a.inspect().claimCount,0);
 assert.equal(a.answer('If I have Pistol on Mars, what next?').decision,'clarify');
 assert.notEqual(a.answer('How do I use it?').decision,'answer');
});
