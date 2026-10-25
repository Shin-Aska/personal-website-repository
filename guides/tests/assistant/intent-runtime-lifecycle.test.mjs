import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createIntentRuntime } from '../../js/assistant/intent-runtime.js';
import { predictIntentHead, validateIntentHead } from '../../js/assistant/intent-head.js';
import { predictClassifier } from './intent-prototype/classifier.mjs';

const config = { schema: 1, backend: 'minilm-linear-intent', totalBytes: 123, additionalBytes: 100,
    thresholds: { minScore: 0.3, minMargin: 0.05, abstainAll: false } };
const tick = () => new Promise(resolve => setImmediate(resolve));
function fixture() {
    let enabled = false, profileReads = 0;
    const subscribers = new Set(), workers = [];
    const consent = { state: { status: 'off' }, subscribe(fn) { subscribers.add(fn);return () => subscribers.delete(fn); } };
    // This protocol double tests lifecycle only. Actual WASM inference is
    // independently exercised by the production browser acceptance harness.
    const runtime = createIntentRuntime({ authorized: () => enabled, consentRuntime: consent,
        fetchProfile: async () => { profileReads++;return config; }, workerFactory: () => {
            const worker = { sent: [], terminated: false, postMessage(message) { this.sent.push(message); },
                terminate() { this.terminated = true; }, emit(data) { this.onmessage?.({ data }); } };
            workers.push(worker);return worker;
        } });
    return { runtime, workers, get profileReads() { return profileReads; }, enable() { enabled = true;consent.state = { status: 'ready' }; },
        disable() { enabled = false;consent.state = { status: 'off' };for (const fn of subscribers) fn(consent.state); } };
}
async function ready(f) {
    f.enable();const preparing = f.runtime.prepare();await tick();
    f.workers.at(-1).emit({ type: 'ready', persisted: true, metadata: { modelId: 'test', thresholds: config.thresholds } });
    await preparing;return f.workers.at(-1);
}

test('consent gates workers and asset preparation while explicit metadata reads remain available', async () => {
    const f = fixture();
    await assert.rejects(f.runtime.prepare(), { name: 'AbortError' });
    await assert.rejects(f.runtime.classify('Who is Iolo?'), { name: 'AbortError' });
    assert.equal(f.profileReads, 0);assert.equal(f.workers.length, 0);
    assert.deepEqual(await f.runtime.profile(), config);
    assert.equal(f.profileReads, 1);assert.equal(f.workers.length, 0);
    const worker = await ready(f);
    assert.equal(worker.sent.length, 1);assert.equal(worker.sent[0].type, 'load');
    assert.deepEqual(f.runtime.thresholds, config.thresholds);
    f.runtime.destroy();
});

test('a newly created runtime reads cached profile metadata offline without preparing a model', async () => {
    const originalFetch = globalThis.fetch, originalCaches = globalThis.caches;
    const entries = new Map();let workers = 0;
    const cache = { async put(key, response) { entries.set(String(key), await response.text()); },
        async match(key) { const body = entries.get(String(key));return body === undefined ? undefined : new Response(body); } };
    globalThis.caches = { async open(name) { assert.equal(name, 'guide-assistant-intent-profile-v1');return cache; } };
    const consent = { state: { status: 'off' }, subscribe() { return () => {}; } };
    const options = { consentRuntime: consent, profileURL: 'https://guide.test/intent/profile.json',
        workerFactory() { workers++;throw new Error('Metadata must not prepare a worker'); } };
    let online, offline;
    try {
        globalThis.fetch = async () => new Response(JSON.stringify(config));
        online = createIntentRuntime(options);assert.deepEqual(await online.profile(), config);online.destroy();
        assert.equal(entries.size, 1);
        globalThis.fetch = async () => { throw new Error('Browser is offline'); };
        offline = createIntentRuntime(options);assert.deepEqual(await offline.profile(), config);
        await assert.rejects(offline.prepare(), { name: 'AbortError' });
        assert.equal(workers, 0);offline.destroy();
        entries.set(options.profileURL, JSON.stringify({ schema: 1, backend: 'wrong', additionalBytes: 100 }));
        const invalid = createIntentRuntime(options);
        await assert.rejects(invalid.profile(), /Invalid intent settings/);invalid.destroy();
    } finally {
        online?.destroy();offline?.destroy();globalThis.fetch = originalFetch;
        if (originalCaches === undefined) delete globalThis.caches;else globalThis.caches = originalCaches;
    }
});

test('concurrent requests share preparation, replay predictions, and cancel independently', async () => {
    const f = fixture();f.enable();
    const controller = new AbortController();
    const a = f.runtime.classify('Who is Iolo?');
    const b = f.runtime.classify('Where is he?', { signal: controller.signal });
    const bCancelled = assert.rejects(b, { name: 'AbortError' });
    await tick();assert.equal(f.workers.length, 1);
    const worker = f.workers[0];
    worker.emit({ type: 'ready', metadata: { modelId: 'test' } });await tick();
    const questions = worker.sent.filter(message => message.type === 'classify');
    assert.equal(questions.length, 2);
    controller.abort();await bCancelled;
    const predictions = [{ label: 'identity', score: 0.8 }, { label: 'unknown', score: 0.2 }];
    worker.emit({ type: 'result', id: questions[1].id, predictions: [{ label: 'location', score: 1 }] });
    worker.emit({ type: 'result', id: questions[0].id, predictions });
    assert.deepEqual(await a, predictions);
    assert.equal(worker.terminated, false);f.runtime.destroy();
});

test('epoch reset rejects pending work and stale epochs while retaining the ready encoder', async () => {
    const f = fixture(), worker = await ready(f), oldEpoch = f.runtime.epoch;
    const pending = f.runtime.classify('Where is Iolo?');const rejected = assert.rejects(pending, { name: 'AbortError' });
    await tick();f.runtime.reset();await rejected;
    assert.equal(f.runtime.epoch, oldEpoch + 1);assert.equal(f.runtime.state.status, 'ready');assert.equal(worker.terminated, false);
    await assert.rejects(f.runtime.classify('Where is Iolo?', { expectedEpoch: oldEpoch }), { name: 'AbortError' });
    const next = f.runtime.classify('Where is Iolo?', { expectedEpoch: f.runtime.epoch });await tick();
    const id = worker.sent.filter(message => message.type === 'classify').at(-1).id;
    worker.emit({ type: 'result', id, predictions: [{ label: 'location', score: 1 }] });
    assert.equal((await next)[0].label, 'location');f.runtime.destroy();
});

test('disabling consent terminates a ready worker and prevents delayed preparation resurrection', async () => {
    const f = fixture(), worker = await ready(f);
    const pending = f.runtime.classify('Who is Iolo?');const rejected = assert.rejects(pending, { name: 'AbortError' });
    await tick();f.disable();await rejected;
    assert.equal(worker.terminated, true);assert.equal(f.runtime.state.status, 'off');
    worker.emit({ type: 'ready', metadata: { modelId: 'stale' } });assert.equal(f.runtime.state.status, 'off');
    f.runtime.destroy();
    const delayed = fixture();delayed.enable();
    const preparing = delayed.runtime.prepare();const stopped = assert.rejects(preparing, { name: 'AbortError' });
    delayed.disable();await stopped;await tick();
    assert.equal(delayed.workers.length, 0);delayed.runtime.destroy();
});

test('packaged assets verify and exported production scoring exactly replays the numerical head', () => {
    const base = new URL('../../local-assistant/intent/', import.meta.url);
    const profile = JSON.parse(fs.readFileSync(new URL('profile.json', base), 'utf8'));
    const artifact = JSON.parse(fs.readFileSync(new URL('head.json', base), 'utf8'));
    for (const file of [...profile.assets, ...profile.runtimeAssets]) {
        const body = fs.readFileSync(new URL(file.path, new URL('profile.json', base)));
        assert.equal(body.length, file.bytes);assert.equal(crypto.createHash('sha256').update(body).digest('hex'), file.sha256);
    }
    validateIntentHead(artifact.head);assert.deepEqual(artifact.thresholds, profile.thresholds);
    // Synthetic embeddings test replay math, not semantic accuracy.
    for (const axis of [0, 11, 171, 383]) {
        const vector = Array(384).fill(0);vector[axis] = 1;
        assert.deepEqual(predictIntentHead(artifact.head, vector), predictClassifier(artifact.head, vector));
    }
    assert.throws(() => predictIntentHead(artifact.head, Array(384).fill(0)), /unit norm/);
    assert.throws(() => validateIntentHead({ ...artifact.head, bias: artifact.head.bias.map(() => NaN) }), /dimensions/);
});
