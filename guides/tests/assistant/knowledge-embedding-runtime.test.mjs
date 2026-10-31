import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createIntentRuntime } from '../../js/assistant/intent-runtime.js';
import { predictIntentHead } from '../../js/assistant/intent-head.js';

const config = { schema: 1, backend: 'minilm-linear-intent', totalBytes: 123, additionalBytes: 100,
    thresholds: { minScore: 0.3, minMargin: 0.05, abstainAll: false } };
const tick = () => new Promise(resolve => setImmediate(resolve));
const unit = () => [1, ...Array(383).fill(0)];
function fixture(options = {}) {
    let enabled = false, profileReads = 0;
    const subscribers = new Set(), workers = [];
    const consent = { state: { status: 'off' }, subscribe(fn) { subscribers.add(fn);return () => subscribers.delete(fn); } };
    const runtime = createIntentRuntime({ consentRuntime: consent, authorized: () => enabled,
        fetchProfile: async () => { profileReads++;return config; }, workerFactory: () => {
            const worker = { sent: [], terminated: false, postMessage(message) { this.sent.push(message); },
                terminate() { this.terminated = true; }, emit(data) { this.onmessage?.({ data }); } };
            workers.push(worker);return worker;
        }, ...options });
    return { runtime, workers, get profileReads() { return profileReads; }, enable() { enabled = true;consent.state = { status: 'ready' }; },
        disable() { enabled = false;consent.state = { status: 'off' };for (const fn of subscribers) fn(consent.state); } };
}
async function ready(f) {
    f.enable();const pending = f.runtime.prepare();await tick();
    const worker = f.workers.at(-1);worker.emit({ type: 'ready', metadata: { dimensions: 384 } });await pending;
    return worker;
}
const request = worker => worker.sent.filter(message => ['encode', 'classify'].includes(message.type)).at(-1);

test('embedding API stays off without consent and validates request input without preparing assets', async () => {
    const f = fixture();
    await assert.rejects(f.runtime.encode('Who is Iolo?'), { name: 'AbortError' });
    for (const text of ['', ' ', 'x'.repeat(2001), null, ['question']]) await assert.rejects(f.runtime.encode(text), TypeError);
    f.enable();
    await assert.rejects(f.runtime.encode('Iolo', { signal: {} }), TypeError);
    await assert.rejects(f.runtime.encode('Iolo', { signal: AbortSignal.abort() }), { name: 'AbortError' });
    assert.equal(f.workers.length, 0);assert.equal(f.profileReads, 0);assert.equal(f.runtime.state.status, 'off');f.runtime.destroy();
});

test('classify and encode share preparation and preserve their different result contracts', async () => {
    const f = fixture();f.enable();
    const predictions = [{ label: 'identity', score: 0.8 }, { label: 'unknown', score: 0.2 }];
    const classification = f.runtime.classify('Who is Iolo?'), embedding = f.runtime.encode('Who is Iolo?');
    await tick();assert.equal(f.workers.length, 1);assert.equal(f.profileReads, 1);
    const worker = f.workers[0];assert.deepEqual(worker.sent.map(message => message.type), ['load']);
    worker.emit({ type: 'ready', metadata: { dimensions: 384 } });await tick();
    const classifyRequest = worker.sent.find(message => message.type === 'classify'), encodeRequest = request(worker);
    worker.emit({ type: 'embedding', id: encodeRequest.id, vector: unit() });
    worker.emit({ type: 'result', id: classifyRequest.id, predictions });
    assert.deepEqual(await embedding, unit());assert.deepEqual(await classification, predictions);f.runtime.destroy();
});

test('malformed embeddings and responses for the wrong operation fail immediately', async () => {
    const f = fixture(), worker = await ready(f);
    const invalid = [[], Array(384).fill(0), Array(384).fill(1), [NaN, ...Array(383).fill(0)], [Infinity, ...Array(383).fill(0)],
        ['1', ...Array(383).fill(0)], new Float32Array(unit())];
    for (const vector of invalid) {
        const pending = f.runtime.encode('Iolo'), rejected = assert.rejects(pending, /invalid result/);await tick();
        worker.emit({ type: 'embedding', id: request(worker).id, vector });await rejected;
    }
    const embedding = f.runtime.encode('Iolo'), rejectedEmbedding = assert.rejects(embedding, /invalid result/);await tick();
    worker.emit({ type: 'result', id: request(worker).id, predictions: [] });await rejectedEmbedding;
    const classification = f.runtime.classify('Iolo'), rejectedClassification = assert.rejects(classification, /invalid result/);await tick();
    worker.emit({ type: 'embedding', id: request(worker).id, vector: unit() });await rejectedClassification;
    assert.equal(f.runtime.state.status, 'ready');f.runtime.destroy();
});

test('abort and topic changes cancel embeddings immediately and ignore late vectors', async () => {
    const f = fixture(), worker = await ready(f), controller = new AbortController();
    const pending = f.runtime.encode('Iolo', { signal: controller.signal }), rejected = assert.rejects(pending, { name: 'AbortError' });
    await tick();const id = request(worker).id;controller.abort();await rejected;
    assert.deepEqual(worker.sent.at(-1), { type: 'cancel', id });
    worker.emit({ type: 'embedding', id, vector: unit() });
    const oldEpoch = f.runtime.epoch;
    const next = f.runtime.encode('Dupre'), nextRejected = assert.rejects(next, { name: 'AbortError' });
    const classification = f.runtime.classify('Dupre'), classificationRejected = assert.rejects(classification, { name: 'AbortError' });
    await tick();f.runtime.cancelPending();await Promise.all([nextRejected, classificationRejected]);
    await assert.rejects(f.runtime.encode('Dupre', { expectedEpoch: oldEpoch }), { name: 'AbortError' });
    assert.equal(worker.terminated, false);assert.equal(f.runtime.state.status, 'ready');f.runtime.destroy();
});

test('preparation cancellation never dispatches a stale embedding and disable prevents resurrection', async () => {
    const f = fixture();f.enable();const controller = new AbortController();
    const pending = f.runtime.encode('Iolo', { signal: controller.signal }), rejected = assert.rejects(pending, { name: 'AbortError' });
    controller.abort();await rejected;await tick();const worker = f.workers[0];
    worker.emit({ type: 'ready', metadata: { dimensions: 384 } });await tick();assert.equal(request(worker), undefined);
    const active = f.runtime.encode('Dupre'), activeRejected = assert.rejects(active, { name: 'AbortError' });
    await tick();const id = request(worker).id;f.disable();await activeRejected;
    assert.equal(worker.terminated, true);assert.equal(f.runtime.state.status, 'off');
    worker.emit({ type: 'embedding', id, vector: unit() });worker.emit({ type: 'ready', metadata: {} });
    assert.equal(f.runtime.state.status, 'off');await assert.rejects(f.runtime.encode('Dupre'), { name: 'AbortError' });
    const replacement = await ready(f);assert.notEqual(replacement, worker);f.runtime.destroy();
});

test('embedding inference shares bounded request capacity, errors, and timeout cancellation', async () => {
    const f = fixture({ requestTimeout: 25 }), worker = await ready(f);
    const pending = f.runtime.encode('Iolo'), timedOut = assert.rejects(pending, /inference took too long/);await tick();
    const id = request(worker).id;await timedOut;assert.deepEqual(worker.sent.at(-1), { type: 'cancel', id });
    const failing = f.runtime.encode('Iolo'), failed = assert.rejects(failing, /inference failed/);await tick();
    worker.emit({ type: 'error', id: request(worker).id, message: 'inference failed' });await failed;
    const waiting = Array.from({ length: 32 }, (_, i) => i % 2 ? f.runtime.encode(`q${i}`) : f.runtime.classify(`q${i}`));
    const cancelled = waiting.map(promise => assert.rejects(promise, { name: 'AbortError' }));
    await assert.rejects(f.runtime.encode('overflow'), /Too many pending/);f.runtime.reset();await Promise.all(cancelled);f.runtime.destroy();
});

test('preparation timeout and worker failure reject pending embeddings and terminate the worker', async () => {
    const preparing = fixture({ prepareTimeout: 25 });preparing.enable();
    const delayed = preparing.runtime.encode('Iolo'), timedOut = assert.rejects(delayed, { name: 'AbortError' });
    await timedOut;assert.equal(preparing.workers[0].terminated, true);assert.equal(preparing.runtime.state.status, 'error');assert.match(preparing.runtime.state.message, /preparation took too long/);
    preparing.runtime.destroy();
    const f = fixture(), worker = await ready(f);
    const pending = f.runtime.encode('Iolo'), failed = assert.rejects(pending, { name: 'AbortError' });await tick();
    worker.onerror();await failed;assert.equal(worker.terminated, true);assert.equal(f.runtime.state.status, 'error');f.runtime.destroy();
});

// Execute the production worker queue with a numerical protocol double for the
// already approved encoder. This tests caching/cancellation, not semantic quality.
function workerFixture() {
    const messages = [], calls = [], assetRequests = [];
    const artifact = JSON.parse(fs.readFileSync(new URL('../../local-assistant/intent/head.json', import.meta.url)));
    const source = fs.readFileSync(new URL('../../js/assistant/intent-worker.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '');
    const controls = { vector: unit(), tokenizeWait: null, modelWait: null };
    const context = vm.createContext({ self: { location: { origin: 'https://guide.test' } },
        postMessage: message => messages.push(structuredClone(message)), predictIntentHead,
        tokenize: async () => { calls.push('tokenize');await controls.tokenizeWait;return { attention_mask: {} }; },
        modelInference: async () => { calls.push('model');await controls.modelWait;return { last_hidden_state: {} }; },
        pooled: () => ({ normalize: () => ({ tolist: () => [controls.vector] }) }),
        fakeHead: artifact.head, fetch: async url => { assetRequests.push(url);throw new Error('Unexpected asset fetch'); } });
    vm.runInContext(source, context);
    vm.runInContext('library = { mean_pooling: pooled }; tokenizer = tokenize; model = modelInference; head = fakeHead; settings = {maxTokens: 128};', context);
    return { messages, calls, controls, assetRequests,
        send: data => { context.self.onmessage({ data });return vm.runInContext('queue', context); } };
}

test('worker reuses embeddings between classification and retrieval, retaining unchanged classifier predictions', async () => {
    const w = workerFixture();
    await w.send({ type: 'classify', id: 1, text: 'Who is Iolo?' });
    await w.send({ type: 'encode', id: 2, text: 'Who is Iolo?' });
    assert.deepEqual(w.calls, ['tokenize', 'model']);
    const head = JSON.parse(fs.readFileSync(new URL('../../local-assistant/intent/head.json', import.meta.url))).head;
    assert.deepEqual(w.messages[0], { type: 'result', id: 1, predictions: predictIntentHead(head, unit()) });
    assert.deepEqual(w.messages[1], { type: 'embedding', id: 2, vector: unit() });assert.deepEqual(w.assetRequests, []);
});

test('worker bounds query cache to 32 recent entries and does not persist or fetch question content', async () => {
    const w = workerFixture();
    for (let i = 1; i <= 33; i++) await w.send({ type: 'encode', id: i, text: `private question ${i}` });
    await w.send({ type: 'encode', id: 34, text: 'private question 2' });assert.equal(w.calls.length, 66);
    await w.send({ type: 'encode', id: 35, text: 'private question 1' });assert.equal(w.calls.length, 68);
    assert.deepEqual(w.assetRequests, []);
});

test('worker cancellation skips queued and active work and does not cache cancelled inference', async () => {
    const w = workerFixture();let release;
    w.controls.tokenizeWait = new Promise(resolve => { release = resolve; });
    const active = w.send({ type: 'encode', id: 1, text: 'Iolo' });await tick();
    w.send({ type: 'encode', id: 2, text: 'Dupre' });
    w.send({ type: 'cancel', id: 1 });w.send({ type: 'cancel', id: 2 });release();await active;await tick();
    assert.deepEqual(w.messages, []);assert.deepEqual(w.calls, ['tokenize']);
    await w.send({ type: 'encode', id: 3, text: 'Iolo' });assert.deepEqual(w.calls, ['tokenize', 'tokenize', 'model']);
    assert.equal(w.messages[0].id, 3);
});

test('worker drops an embedding cancelled during model execution before caching or responding', async () => {
    const w = workerFixture();let release;
    w.controls.modelWait = new Promise(resolve => { release = resolve; });
    const active = w.send({ type: 'encode', id: 1, text: 'Iolo' });await tick();
    assert.deepEqual(w.calls, ['tokenize', 'model']);w.send({ type: 'cancel', id: 1 });release();await active;
    assert.deepEqual(w.messages, []);
    await w.send({ type: 'encode', id: 2, text: 'Iolo' });assert.equal(w.calls.length, 4);assert.equal(w.messages[0].id, 2);
});

test('worker rejects invalid text and model vectors before returning or caching embeddings', async () => {
    const w = workerFixture();
    for (const [index, text] of ['', ' ', 'x'.repeat(2001), null].entries()) await w.send({ type: 'encode', id: index + 1, text });
    assert.equal(w.calls.length, 0);assert.ok(w.messages.every(message => message.type === 'error'));
    for (const [index, vector] of [[], Array(384).fill(0), [NaN, ...Array(383).fill(0)]].entries()) {
        w.controls.vector = vector;await w.send({ type: 'encode', id: index + 5, text: 'same question' });
        assert.match(w.messages.at(-1).message, /Invalid local intent embedding/);
    }
    w.controls.vector = unit();await w.send({ type: 'encode', id: 8, text: 'same question' });
    assert.equal(w.calls.length, 8);assert.deepEqual(w.messages.at(-1).vector, unit());
});
