// Structural source/lifecycle contracts. Fake predictions are explicitly not
// learned-model accuracy evidence; native browser acceptance is separate.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createAssistant } from '../../js/assistant/engine.js';
import { createConversationAssistant } from '../../js/assistant/dialogue.js';
import { allRecords } from './load-records.mjs';

const ranked = label => [{ label, score: 0.8 }, { label: 'unknown', score: 0.1 }];
const fact = (id, title, relation = 'explanation', extra = {}) => ({ id: `${id}:${relation}`, entityId: id, title,
    kind: 'item', aliases: [], relation, requires: null, minSpoiler: 'gentle', variants: { gentle: { text: `${title} ${relation}.` } },
    source: { file: 'fixture.html', locator: `#${id}`, review: 'extracted' }, ...extra });
function make({ records = allRecords.ultima7, gameId = 'ultima7', classify = async () => ranked('identity'), catalog = null } = {}) {
    const base = createAssistant({ gameId, records, getProgress: () => [], fallback: null });
    const assistant = createConversationAssistant({ assistant: base, records, gameId, classify, catalog,
        // The production profile selects these raw ranking gates on its fixed
        // validation split. Fake scores here exercise structure only.
        thresholds: { minScore: 0, minMargin: 0 } });
    return { base, assistant };
}
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }
async function promptly(promise) {
    let timer;
    try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('cancellation did not settle promptly')), 150); })]); }
    finally { clearTimeout(timer); }
}

test('reset cancels lazy preparation immediately and forwards an AbortSignal even if a provider ignores it', async () => {
    let signal;
    const { assistant } = make({ classify: (_text, context) => { signal = context.signal; return new Promise(() => {}); } });
    const pending = assistant.answerAsync('Who is Iolo?');
    assistant.resetTopic();
    assert.equal((await promptly(pending)).decision, 'stale');
    assert.equal(signal.aborted, true);
    assert.deepEqual(assistant.getHistory(), []);
});

test('a new topic cancels an in-flight source response without appending obsolete facts', async () => {
    const records = [fact('veyra', 'Veyra')], work = deferred(), entered = deferred();
    const base = createAssistant({ gameId: 'ultima7', records, fallback: null });
    const answer = base.answer.bind(base);
    base.answerAsync = async (text, opts) => { const reply = answer(text, opts); entered.resolve(); await work.promise; return reply; };
    const assistant = createConversationAssistant({ assistant: base, records, classify: async () => ranked('identity') });
    const pending = assistant.answerAsync('What is Veyra?');
    await entered.promise;
    assistant.resetTopic();
    assert.equal((await promptly(pending)).decision, 'stale');
    assert.deepEqual(assistant.getHistory(), []);
    work.resolve(); await work.promise; await Promise.resolve();
    assert.deepEqual(assistant.getHistory(), []);
});

test('source-title specificity disambiguates alias-only objectives and preserves exact narrative facets', async () => {
    const { assistant } = make({ gameId: 'ultima5', records: allRecords.ultima5,
        classify: async text => ranked(/method/.test(text) ? 'use' : /^where/i.test(text) ? 'location' : 'identity') });
    assert.deepEqual((await assistant.answerAsync('Who is Lord British?')).recordIds, ['ultima5:research:lord-british-identity:explanation']);
    assert.deepEqual((await assistant.answerAsync('Where is the Sandalwood Box kept?')).recordIds, ['ultima5:item:sandalwood-box:location']);
    const method = await assistant.answerAsync('What is the method for the Sandalwood Box?');
    assert.deepEqual(method.recordIds, ['ultima5:narrative:sandalwood-method:method']);
    assert.equal(method.dialoguePacket.canonicalQuestion, undefined, 'an exact sourced narrative request stays unchanged');
});

test('ordinary emphasis and recorded-stat fragments do not poison subsequent subject state', async () => {
    const { assistant } = make({ gameId: 'albion', records: allRecords.albion,
        classify: async text => ranked(/location|where/i.test(text) ? 'location' : /attributes|stats|score/i.test(text) ? 'stats' : 'identity') });
    await assistant.answerAsync('Who exactly is Rainer Hofstedt?');
    assert.deepEqual((await assistant.answerAsync('his listed location?')).recordIds, ['albion:character:rainer-hofstedt:location']);
    const stats = await assistant.answerAsync('starting attributes');
    assert.deepEqual(stats.recordIds, ['albion:character:rainer-hofstedt:stats']);
    assert.equal(stats.dialoguePacket.qualifier, 'starting');
    assert.match(stats.text, /Recorded guide stats/);
    assert.deepEqual((await assistant.answerAsync('his numeric attributes')).recordIds, ['albion:character:rainer-hofstedt:stats']);
    await assistant.answerAsync('Who is Rainer Hofstedt on Mars?');
    const blocked = await assistant.answerAsync('stats?');
    assert.equal(blocked.decision, 'clarify');
    assert.equal(blocked.dialoguePacket.blockReplay, true);
    assert.deepEqual(blocked.recordIds, []);
});

test('topic payloads are processed and bounded relation fallback exposes the original model label', async () => {
    const { assistant } = make({ classify: async text => ranked(/use/i.test(text) ? 'why' : 'identity') });
    await assistant.answerAsync('Who is Iolo?');
    const next = await assistant.answerAsync('Different subject: explain who Dupre is.');
    assert.deepEqual(next.recordIds, ['ultima7:companion:dupre:explanation']);
    const selected = await assistant.answerAsync('Switch to Shamino; identify him.');
    assert.deepEqual(selected.recordIds, ['ultima7:companion:shamino:explanation']);
    const use = await assistant.answerAsync('its use');
    assert.equal(use.modelIntent, 'why');
    assert.equal(use.routeOrigin, 'exact-relation');
    assert.equal(use.dialoguePacket.intent, 'use');
    assert.equal(assistant.getHistory().at(-2).text, 'its use');
    const unknown = await assistant.answerAsync('Switch to Zaxivar; identify him.');
    assert.equal(unknown.decision, 'clarify');
    assert.deepEqual(unknown.recordIds, []);
});

test('uncertain new names cannot become grounded from a conditional engine suggestion', async () => {
    const { assistant } = make({ classify: async text => ranked(/^where/i.test(text) ? 'location' : 'identity') });
    await assistant.answerAsync('Who is Iolo?');
    const tentative = await assistant.answerAsync('Who is Duprae?');
    assert.equal(tentative.decision, 'clarify');
    assert.deepEqual(tentative.recordIds, []);
    assert.equal((await assistant.answerAsync('where is he?')).decision, 'clarify');
    await assistant.answerAsync('Who is Dupre?');
    assert.deepEqual((await assistant.answerAsync('where is he?')).recordIds, ['ultima7:companion:dupre:location']);
});

test('engine choice identities and revisions survive the wrapper; stale buttons do not execute', async () => {
    const records = ['Blue Amulet', 'Gold Amulet'].flatMap((title, i) => ['explanation', 'location'].map(relation => fact(`amulet${i}`, title, relation, { aliases: ['Amulet'] })));
    const { assistant } = make({ records, classify: async text => ranked(/^where/i.test(text) ? 'location' : 'identity') });
    const ask = await assistant.answerAsync('What is Amulet?');
    assert.equal(ask.choices.length, 2);
    const choice = ask.choices[0];
    assert.equal(choice.revision, assistant.revision);
    const selected = assistant.answer(choice.label, { choiceId: choice.id, expectedRevision: choice.revision });
    assert.deepEqual(selected.recordIds, ['amulet0:explanation']);
    assert.deepEqual((await assistant.answerAsync('where is it?')).recordIds, ['amulet0:location']);
    assert.equal(assistant.answer(choice.label, { choiceId: choice.id, expectedRevision: choice.revision }).decision, 'stale');
});

test('consultation and local reply boundaries preserve historical evidence and custom adapter properties', async () => {
    const source = fact('veyra', 'Veyra', 'explanation', { variants: { gentle: { text: 'Veyra supports defense.' } } });
    const records = [source, fact('key', 'Key', 'acquisition', { possessionFact: 'key:owned' })];
    const witness = { recordId: source.id, variant: 'gentle', quote: 'Veyra supports defense.' };
    const catalog = { games: { ultima7: { editions: [], criteria: [{ id: 'defense', label: 'defense', aliases: ['defense'] }], profiles: [{
        entityId: 'veyra', title: 'Veyra', witnesses: [witness], traits: [{ criterion: 'defense', value: true, witnesses: [witness] }],
        summaries: [{ text: witness.quote, witnesses: [witness] }], limitations: [], constraints: [] }] } } };
    const { base, assistant } = make({ records, catalog, classify: async text => ranked(/best/.test(text) ? 'comparison' : 'identity') });
    assistant.describeContext = () => ({ title: 'Adapter context' }); assistant.preparationMs = 12;
    assert.equal(assistant.describeContext().title, 'Adapter context'); assert.equal(base.preparationMs, 12);
    await assistant.answerAsync('I have Key');
    assert.equal(base.inspect().claimCount, 1);
    const recommendation = await assistant.answerAsync('Which option is best for defense?');
    assert.equal(recommendation.consultation.focusEntityId, 'veyra');
    assert.deepEqual(recommendation.stateChanges, []);
    assert.equal(base.inspect().claimCount, 1);
    assistant.resetTopic(); assert.equal(base.inspect().claimCount, 1);
    assistant.resetSession(); assert.equal(base.inspect().claimCount, 0);
});

test('all wrapper entry points keep direct/full answers, including the legacy smaller command', async () => {
    const records = [fact('vault', 'Vault', 'hint', { kind: 'quest', variants: {
        gentle: { text: 'Look at the door.' }, balanced: { text: 'Use the key.' }, direct: { text: 'Use the key. The code is 1234.' }
    } })];
    const { base, assistant } = make({ records, classify: async () => ranked('hint') });
    assert.match((await assistant.answerAsync('How do I complete Vault?')).text, /1234/);
    assert.match((await assistant.answerAsync('smaller hint')).text, /1234/);
    assistant.setPolicy('gentle'); assert.equal(base.policy, 'direct');
    assert.equal(assistant.policy, 'direct');
});

test('guide-only location and recorded-stat ellipsis keep their source restriction without losing the subject', async () => {
    const { assistant } = make({ classify: async text => ranked(/location/.test(text) ? 'location' : /stats/.test(text) ? 'stats' : 'identity') });
    await assistant.answerAsync('Identify Shamino for me.');
    const location = await assistant.answerAsync('his location in the guide');
    assert.deepEqual(location.recordIds, ['ultima7:companion:shamino:location']);
    assert.equal(location.dialoguePacket.restrictions.guideOnly, true);
    assert.match(location.dialoguePacket.canonicalQuestion, /^According to the guide,/);
    const stats = await assistant.answerAsync('starting stats');
    assert.deepEqual(stats.recordIds, ['ultima7:companion:shamino:stats']);
    assert.equal(stats.dialoguePacket.restrictions.guideOnly, true);
    assert.ok(stats.sources.every(source => source.review !== 'external-research'));
    const u5 = make({ gameId: 'ultima5', records: allRecords.ultima5 }).assistant;
    await u5.answerAsync('Guide only: who is Lord British?');
    const hidden = await u5.answerAsync('his identity');
    assert.notEqual(hidden.decision, 'answer');
    assert.deepEqual(hidden.recordIds, []);
});

test('functional connector, passive acquisition and prerequisite order requests keep the requested relationship', async () => {
    const aq = make({ gameId: 'alqadim', records: allRecords.alqadim,
        classify: async text => ranked(/Where/.test(text) ? 'location' : /obtained/.test(text) ? 'acquisition' : 'use') }).assistant;
    await aq.answerAsync('Where is the Ship Orb?');
    assert.deepEqual((await aq.answerAsync('its purpose in use')).recordIds, ['alqadim:item:ship-orb:use']);
    assert.deepEqual((await aq.answerAsync('how can it be obtained')).recordIds, ['alqadim:item:ship-orb:acquisition']);
    const records = JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json', import.meta.url)));
    const sc = make({ gameId: 'starcraft', records, classify: async text => ranked(/prerequisites/.test(text) ? 'prerequisites' : /documentation/.test(text) ? 'location' : 'identity') }).assistant;
    await sc.answerAsync('What is SCHNAIL?');
    assert.deepEqual((await sc.answerAsync('prerequisites first')).recordIds, ['starcraft:schnail:requirements']);
    const docs = await sc.answerAsync('documentation link');
    assert.deepEqual(docs.recordIds, ['starcraft:documentation:links']);
    assert.equal(docs.dialoguePacket.intent, 'location', 'a URL output-format token must not invent acquisition for a new explicit topic');
});

test('creator facets quote an explicit unconditional authorship attribution and do not infer one from co-occurring names', async () => {
    const good = fact('aurora', 'Aurora Kit', 'explanation', { variants: { gentle: { text: 'Aurora Kit is a framework by Mira Vale.' } } });
    const run = async record => {
        const { assistant } = make({ records: [record] });
        await assistant.answerAsync('What is Aurora Kit?');
        return assistant.answerAsync('Who created it?');
    };
    const answer = await run(good);
    assert.equal(answer.text, 'Aurora Kit is a framework by Mira Vale.');
    assert.deepEqual(answer.recordIds, ['aurora:explanation']);
    assert.equal(answer.sourcePresentation.kind, 'quoted-creator');
    for (const record of [
        { ...good, variants: { gentle: { text: 'Aurora Kit is a framework. Mira Vale uses it.' } } },
        { ...good, variants: { gentle: { text: 'Aurora Kit is a character by the river.' } } },
        { ...good, requires: { fact: 'unconfirmed-condition' } },
        { ...good, conflict: true }
    ]) {
        assert.notEqual((await run(record)).decision, 'answer');
    }
});
