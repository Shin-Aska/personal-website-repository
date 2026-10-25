import { createDownloadProgress, readModelResponse } from './model-download.js';
import { validateIntentHead, predictIntentHead } from './intent-head.js';
let library, tokenizer, model, head, settings;
let queue = Promise.resolve();
const queued = new Set(), cancelled = new Set(), blobs = [];
// Questions and their embeddings live only in this worker's bounded memory.
// Sharing the cache lets classification followed by retrieval run MiniLM once.
const embeddings = new Map(), embeddingLimit = 32;
const digest = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(value => value.toString(16).padStart(2, '0')).join('');
function localURL(path, profileURL) {
    const url = new URL(path, profileURL), base = new URL('../', profileURL);
    if (url.origin !== self.location.origin || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('Intent assets must be local');
    return url;
}
async function prepare(profile, profileURL) {
    embeddings.clear();
    if (profile.schema !== 1 || profile.backend !== 'minilm-linear-intent' || profile.dimensions !== 384
        || profile.dtype !== 'q8' || profile.maxTokens !== 128 || !Array.isArray(profile.assets)
        || !Array.isArray(profile.runtimeAssets)) throw new Error('Unsupported intent profile');
    settings = profile;
    let cache = null, persisted = true;
    try { cache = await caches.open('guide-assistant-model-files-v1'); } catch { persisted = false; }
    const buffers = new Map(), missing = [];
    const allAssets = [...profile.assets, ...profile.runtimeAssets];
    if (new Set(allAssets.map(file => file.sha256)).size !== allAssets.length
        || allAssets.reduce((sum, file) => sum + file.bytes, 0) !== profile.totalBytes) throw new Error('Invalid intent asset manifest');
    const progress = createDownloadProgress(profile.totalBytes, data => postMessage({ type: 'progress', ...data }));
    progress.emit();
    for (const file of allAssets) {
        if (!/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isInteger(file.bytes) || file.bytes < 1 || file.bytes > 16_777_216) throw new Error('Invalid intent asset');
        const url = localURL(file.path, profileURL);
        const key = new URL('/__guide_assistant_model_cache__/' + file.sha256, self.location.origin).href;
        const response = await cache?.match(key), bytes = response ? await response.arrayBuffer() : null;
        if (bytes && bytes.byteLength === file.bytes && await digest(bytes) === file.sha256) {
            buffers.set(file.sha256, bytes);progress.cached(file.bytes);
        } else missing.push({ file, url, key });
    }
    progress.plan(missing.reduce((sum, { file }) => sum + file.bytes, 0));
    for (const { file, url, key } of missing) {
        progress.begin();let bytes;
        const timer = setInterval(progress.emit, 500);
        try {
            const response = await fetch(url, { credentials: 'same-origin', redirect: 'error' });
            if (!response.ok) throw new Error('A local intent file could not be read');
            bytes = await readModelResponse(response, file.bytes, progress.received);
        } finally { clearInterval(timer);progress.end(); }
        if (await digest(bytes) !== file.sha256) throw new Error('Intent asset integrity check failed');
        try { if (cache) await cache.put(key, new Response(bytes)); } catch { persisted = false; }
        buffers.set(file.sha256, bytes);
    }
    const body = ids => {
        if (!Array.isArray(ids) || !ids.length) throw new Error('Missing intent asset mapping');
        return new Blob(ids.map(id => { if (!buffers.has(id)) throw new Error('Missing verified intent part');return buffers.get(id); }));
    };
    const blobURL = (ids, type) => { const url = URL.createObjectURL(new Blob([body(ids)], { type }));blobs.push(url);return url; };
    const artifact = JSON.parse(await body(profile.head).text());
    if (artifact.schemaVersion !== 1 || artifact.provenance?.modelId !== profile.modelId
        || artifact.provenance?.revision !== profile.revision || artifact.provenance?.encoderFineTuned !== false)
        throw new Error('Unsupported intent head artifact');
    validateIntentHead(artifact.head);head = artifact.head;
    if (!profile.thresholds || !Number.isFinite(profile.thresholds.minScore) || profile.thresholds.minScore < 0 || profile.thresholds.minScore > 1
        || !Number.isFinite(profile.thresholds.minMargin) || profile.thresholds.minMargin < 0 || profile.thresholds.minMargin > 1
        || typeof profile.thresholds.abstainAll !== 'boolean') throw new Error('Invalid intent abstention thresholds');
    if (['minScore', 'minMargin', 'abstainAll'].some(key => artifact.thresholds?.[key] !== profile.thresholds[key]))
        throw new Error('Intent threshold metadata does not match the verified head');
    library = await import(blobURL(profile.runtime.module, 'text/javascript'));
    const { env, AutoTokenizer, AutoModel } = library;
    env.allowRemoteModels = false;env.allowLocalModels = true;
    env.useBrowserCache = false;env.useFSCache = false;env.useCustomCache = true;
    const virtual = new URL('./virtual/', profileURL);
    env.localModelPath = virtual.href;
    env.customCache = {
        async match(request) {
            const url = new URL(typeof request === 'string' ? request : request.url, virtual);
            const prefix = new URL('./current/', virtual).pathname;
            if (url.origin !== virtual.origin || !url.pathname.startsWith(prefix)) return undefined;
            const entry = profile.model[url.pathname.slice(prefix.length)];
            return entry ? new Response(body(entry)) : undefined;
        },
        async put() { /* Verified static parts already use the shared asset cache. */ },
    };
    env.backends.onnx.wasm.numThreads = 1;env.backends.onnx.wasm.proxy = false;
    env.backends.onnx.wasm.wasmPaths = { mjs: blobURL(profile.runtime.wasmModule, 'text/javascript'), wasm: blobURL(profile.runtime.wasm, 'application/wasm') };
    postMessage({ type: 'preparing' });
    tokenizer = await AutoTokenizer.from_pretrained('current', { local_files_only: true });
    model = await AutoModel.from_pretrained('current', { dtype: 'q8', device: 'wasm', local_files_only: true });
    buffers.clear();
    postMessage({ type: 'ready', persisted, metadata: { modelId: profile.modelId, revision: profile.revision,
        dimensions: 384, encoderFineTuned: false, realModelInference: true, wasmThreads: 1,
        headSha256: profile.head[0], thresholds: profile.thresholds, additionalBytes: profile.additionalBytes } });
}
async function infer(data) {
    if (cancelled.has(data.id)) return;
    if (!model || !head) throw new Error('Prepare the local intent encoder first');
    if (typeof data.text !== 'string' || !data.text.trim() || data.text.length > 2_000) throw new Error('Invalid intent text');
    let vector = embeddings.get(data.text);
    if (!vector) {
        const inputs = await tokenizer([data.text], { padding: true, truncation: true, max_length: settings.maxTokens });
        if (cancelled.has(data.id)) return;
        const output = await model(inputs);
        if (cancelled.has(data.id)) return;
        [vector] = library.mean_pooling(output.last_hidden_state, inputs.attention_mask).normalize(2, -1).tolist();
        if (!Array.isArray(vector) || vector.length !== 384 || !vector.every(Number.isFinite)
            || Math.abs(Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) - 1) > 1e-3)
            throw new Error('Invalid local intent embedding');
    }
    embeddings.delete(data.text);embeddings.set(data.text, vector);
    if (embeddings.size > embeddingLimit) embeddings.delete(embeddings.keys().next().value);
    if (data.type === 'encode') postMessage({ type: 'embedding', id: data.id, vector });
    else postMessage({ type: 'result', id: data.id, predictions: predictIntentHead(head, vector) });
}
self.onmessage = ({ data }) => {
    if (!data || typeof data.type !== 'string') return;
    if (data.type === 'cancel') { if (queued.has(data.id)) cancelled.add(data.id);return; }
    if (data.type === 'classify' || data.type === 'encode') {
        if (!Number.isSafeInteger(data.id) || data.id < 1 || queued.has(data.id)) return;
        queued.add(data.id);
    }
    queue = queue.catch(() => {}).then(async () => {
        try {
            if (data.type === 'load') await prepare(data.profile, data.profileURL);
            else if (data.type === 'classify' || data.type === 'encode') await infer(data);
            else throw new Error('Unknown intent worker request');
        } catch (error) { postMessage({ type: 'error', id: data.id, message: String(error.message || error) }); }
        finally { queued.delete(data.id);cancelled.delete(data.id); }
    });
};
