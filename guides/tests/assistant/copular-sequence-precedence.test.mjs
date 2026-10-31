import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSourceRequestFrame as parse} from '../../js/assistant/request-frame.js';

test('An explicit possessive or specific sequence field wins over the generic compound procedure suffix',()=>{
 const owned=parse('What is its number sequence?');
 assert.equal(owned.subjectText,'its');assert.equal(owned.fields[0].key,'sequence');
 assert.deepEqual(owned.fields[0].selectors,['tune']);assert.equal(owned.fields[0].fieldText,'number sequence');
 const implicit=parse('What is the number sequence?');
 assert.deepEqual(implicit.fields[0].selectors,['tune']);
 const qualified=parse('What is its number sequence in winter?');
 assert.equal(qualified.subjectText,'its');assert.ok(qualified.fields[0].unknownQualifierTexts.includes('in winter'));
});

test('The generic named procedure remains available when no established property phrase governs it',()=>{
 const frame=parse('What is the Herras assassination sequence?');
 assert.equal(frame.subjectText,'the Herras assassination');assert.equal(frame.fields[0].key,'sequence');
 assert.deepEqual(frame.fields[0].selectors,[]);assert.equal(frame.fields[0].requiresExplicitField,true);
 const procedure=parse('What is the calibration procedure?');
 assert.equal(procedure.subjectText,'the calibration');assert.equal(procedure.fields[0].key,'method');
 assert.deepEqual(procedure.fields[0].selectors,['step']);
});
