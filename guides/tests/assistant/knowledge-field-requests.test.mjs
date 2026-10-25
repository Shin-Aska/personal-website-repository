import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { buildKnowledge, createKnowledgeRouter } from '../../js/assistant/knowledge.js';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const routerFor = game => createKnowledgeRouter(buildKnowledge(game,
    game === 'starcraft' ? read('./evidence/conversation-starcraft-source-records.json') : allRecords[game],
    read(`../../data/assistant/knowledge/${game}.json`)));

test('A source-and-binaries request returns the reviewed resource, with a usable link', () => {
    const reply = routerFor('starcraft').plan('Where should I look for Steamhammer source and binaries?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /maintainer page provides binary, source and past-version links/);
    assert.ok(reply.sourceLinks.some(link => link.url === 'https://satirist.org/ai/starcraft/steamhammer/'));
    assert.ok(reply.sources.every(source => source.review === 'external-research'));
    assert.deepEqual(reply.stateChanges, []);
});

test('A named Game Type field takes precedence over an incidental choose verb', () => {
    const reply = routerFor('starcraft').plan('What Game Type should I choose for the Remastered SCM map?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /Use Map Settings/);
    assert.match(reply.text, /standard Melee/);
    assert.ok(reply.sources.some(source => source.locator === '#remastered-setup ol > li:nth-child(7)'));
});

test('A drawer location answer includes the actual acquisition evidence as well as its approach', () => {
    const reply = routerFor('ultima5').plan('Where do I get the HMS Cape plans?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /drawers/);
    assert.match(reply.text, /Oaken Oar/);
    assert.ok(reply.sources.some(source => source.locator === 'ultima5SideQuests id=side-hms-cape.detail'));
});

test('A prefixed save-state question stays uncertain after an enemy was the active subject', () => {
    const router = routerFor('ultima5');
    router.plan('Who is Astaroth?');
    const reply = router.plan('So, has my party already banished him?');
    assert.notEqual(reply?.decision, 'answer');
    assert.match(reply.text, /cannot verify your current game state/);
    assert.deepEqual(reply.sources, []);
    assert.deepEqual(reply.stateChanges, []);
});

test('The added resource routing retains unsupported platform constraints', () => {
    const reply = routerFor('starcraft').plan('Where should I look for Steamhammer source and binaries for macOS?');
    assert.notEqual(reply?.decision, 'answer');
});

test('A cure description cannot answer a requested dose that the source never specifies', () => {
    const reply = routerFor('alqadim').plan('What dose of Purple Berries should I give a poisoned party member?');
    assert.equal(reply?.decision, 'decline');
    assert.match(reply.text, /do not specify a dose/);
    assert.deepEqual(reply.sources, []);
});

test('Request framing cannot turn a requested executable guarantee into setup advice', () => {
    const reply = routerFor('starcraft').plan('Can you guarantee my SCHNAIL executable is malware-free?');
    assert.notEqual(reply?.decision, 'answer');
});

test('An incidental mention of a castle owner does not locate that person', () => {
    const router = routerFor('ultima7');
    assert.equal(router.plan('Who is Lord British?')?.decision, 'answer');
    const reply = router.plan('Where is he?');
    assert.ok(!reply?.knowledge?.factIds.includes('weston-appeal'));
});

test('A named magic school can return its documented teacher without locating its practitioner there', () => {
    const reply = routerFor('albion').plan('Who trains Iskai magic?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /Fasiir.*Jirinaar/);
    assert.ok(reply.sources.some(source => source.locator === 'DB.magic[0]'));
});

test('A named active test stays the referent when a linked ritual shares its broad type', () => {
    const router = routerFor('ultima7');
    assert.equal(router.plan('What is the Test of Love?')?.decision, 'answer');
    const reply = router.plan('What reward do I get for that test?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /Talisman of Love/);
    assert.equal(reply.knowledge.focusEntityId, 'ultima7:quest:test-of-love');
});

test('A directed clue lookup returns the destination and keeps unsupported places constrained', () => {
    const router = routerFor('ultima6');
    const reply = router.plan('Where do the gypsies send me?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /Homer.*Buccaneer/);
    assert.notEqual(router.plan('Where do the gypsies send me on Mars?')?.decision, 'answer');
});

test('A defeat objective does not grant a named dragon an invented combat method', () => {
    const reply = routerFor('ultima7').plan('How do I defeat Dracothraxus?');
    assert.notEqual(reply?.decision, 'answer');
});

test('Opaque rollback restores conversational references and rejects a fabricated snapshot', () => {
    const router = routerFor('ultima5');
    router.plan('Where do I get the HMS Cape plans?');
    const before = router.inspect(), checkpoint = router.checkpoint();
    router.plan('Who gives me the Grapple?');
    assert.notEqual(router.inspect().focus, before.focus);
    assert.equal(router.restore({focus:'invented'}), false);
    assert.equal(router.restore(checkpoint), true);
    assert.deepEqual(router.inspect(), before);
    const followup = router.plan('What do I do with them after that?');
    assert.match(followup.text, /frigate.*plans/);
});

test('A conditional item property quotes its outcome without asserting ownership or advancing progress', () => {
    const router = routerFor('ultima5');
    assert.equal(router.plan('Who gives me the Grapple?')?.decision, 'answer');
    const reply = router.plan('Once I have it, what routes does it open?', {restrictions:{hypothetical:true}});
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /mountain peaks.*Underworld routes/);
    assert.deepEqual(reply.stateChanges, []);
    assert.deepEqual(reply.actions, []);
    assert.notEqual(router.plan('If I have the Quantum Turnip, what does it do?')?.decision, 'answer');
    assert.notEqual(router.plan('If I have it, what should I do next?', {restrictions:{hypothetical:true}})?.decision, 'answer');
});
