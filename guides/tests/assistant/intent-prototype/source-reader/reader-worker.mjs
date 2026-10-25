import {scoreContext, rankContexts} from './span-policy.mjs';
// Lab only: this worker ranks caller-supplied contexts. It grants no answer authorization.
let tokenizer, model;
let queue = Promise.resolve();
const sha256 = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map(x => x.toString(16).padStart(2, '0')).join('');
const localURL = value => {
    const url = new URL(value, import.meta.url);
    if (url.origin !== self.location.origin) throw new Error('Remote requests are disabled');
    return url;
};
async function json(url) {
    const response = await fetch(localURL(url), {redirect: 'error'});
    if (!response.ok) throw new Error('Local lab metadata is missing');
    return response.json();
}
async function checked(url, entry) {
    const response = await fetch(localURL(url), {redirect: 'error'});
    if (!response.ok) throw new Error('Run the approved asset preparation first');
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== entry.bytes || await sha256(bytes) !== entry.sha256)
        throw new Error('Local asset integrity mismatch');
    return bytes;
}
async function prepare() {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname))
        throw new Error('Source-reader experiment requires a loopback host');
    const start = performance.now();
    const manifest = await json('./manifest.json');
    if (manifest.revision !== 'a8d7291835b8b6481505577f2aa98db0d3a4f601'
        || manifest.totalBytes !== 27848554) throw new Error('Unexpected reader manifest');
    const sharedURL = new URL('../../../../local-assistant/profile.json', import.meta.url);
    const shared = await json(sharedURL);
    const runtimeIds = new Set(Object.values(shared.runtime).flat());
    const buffers = new Map();
    for (const entry of shared.assets.filter(e => runtimeIds.has(e.sha256)))
        buffers.set(entry.sha256, await checked(new URL(entry.path, sharedURL), entry));
    const urls = [];
    const blob = (ids, type) => {
        const url = URL.createObjectURL(new Blob(ids.map(id => {
            if (!buffers.has(id)) throw new Error('Missing shared runtime asset');
            return buffers.get(id);
        }), {type}));
        urls.push(url);
        return url;
    };
    const library = await import(blob(shared.runtime.module, 'text/javascript'));
    const {env, AutoTokenizer, AutoModelForQuestionAnswering} = library;
    if (!AutoModelForQuestionAnswering) throw new Error('Packaged runtime lacks a QA loader');
    const files = new Map();
    for (const entry of manifest.files)
        files.set(entry.name, await checked(new URL(`./assets/${entry.name}`, import.meta.url), entry));
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.useBrowserCache = false;
    env.useFSCache = false;
    env.useCustomCache = true;
    const virtual = new URL('./assets/virtual/', import.meta.url);
    const prefix = new URL('current/', virtual).pathname;
    env.localModelPath = virtual.href;
    env.customCache = {
        async match(request) {
            const url = new URL(typeof request === 'string' ? request : request.url, virtual);
            if (url.origin !== virtual.origin) throw new Error('Remote model cache request rejected');
            const name = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : '';
            if (!files.has(name)) throw new Error(`Unlisted model file requested: ${name}`);
            return new Response(files.get(name));
        },
        async put() {}
    };
    env.backends.onnx.wasm.numThreads = 1;
    env.backends.onnx.wasm.proxy = false;
    env.backends.onnx.wasm.wasmPaths = {
        mjs: blob(shared.runtime.wasmModule, 'text/javascript'),
        wasm: blob(shared.runtime.wasm, 'application/wasm')
    };
    tokenizer = await AutoTokenizer.from_pretrained('current', {local_files_only: true});
    model = await AutoModelForQuestionAnswering.from_pretrained('current', {
        dtype: 'q8', device: 'wasm', local_files_only: true
    });
    buffers.clear();
    files.clear();
    // Keep runtime blob URLs alive until worker termination; ORT may reference them lazily.
    return {modelId: manifest.modelId, revision: manifest.revision, modelBytes: manifest.totalBytes,
        prepareMs: performance.now() - start, remoteModelsAllowed: false, wasmThreads: 1};
}
async function rank(data) {
    if (!model) throw new Error('Prepare the reader first');
    const {question, contexts, calibration} = data;
    if (typeof question !== 'string' || !question.trim() || question.length > 500
        || !Array.isArray(contexts) || !contexts.length || contexts.length > 8
        || new Set(contexts.map(c => c.id)).size !== contexts.length
        || contexts.some(c => typeof c.id !== 'string' || !c.id || c.id.length > 200
            || typeof c.text !== 'string' || !c.text.trim() || c.text.length > 6000))
        throw new Error('Expected one short question and 1–8 bounded, uniquely identified contexts');
    const started = performance.now();
    const scored = [];
    // Each evidence fact is a separate context; concatenate no unrelated facts.
    for (const context of contexts) {
        const contextStarted = performance.now();
        const inputs = await tokenizer(question, {text_pair: context.text, truncation: false});
        const ids = inputs.input_ids.tolist()[0].map(Number);
        // No silent truncation: long evidence needs explicit reviewed chunking before this worker.
        if (ids.length > 384) throw new Error('Question/context exceeds the 384-token experiment cap');
        if (!inputs.token_type_ids) throw new Error('Pair tokenizer did not return segment IDs');
        const output = await model(inputs);
        if (!output.start_logits || !output.end_logits) throw new Error('Unexpected QA model outputs');
        const result = scoreContext({inputIds: ids,
            tokenTypes: inputs.token_type_ids.tolist()[0].map(Number),
            attention: inputs.attention_mask.tolist()[0].map(Number),
            start: output.start_logits.tolist()[0], end: output.end_logits.tolist()[0]});
        scored.push({id: context.id, result: result && {...result, tokenCount: ids.length,
            inferenceMs: performance.now() - contextStarted}});
    }
    return {...rankContexts(scored, calibration || {}), ms: performance.now() - started};
}
self.onmessage = ({data}) => {
    queue = queue.catch(() => {}).then(async () => {
        try {
            const result = data.type === 'prepare' ? await prepare()
                : data.type === 'rank' ? await rank(data) : null;
            if (!result) throw new Error('Unknown reader request');
            postMessage({id: data.id, type: 'result', result});
        } catch (error) {
            postMessage({id: data.id, type: 'error', message: String(error.message || error)});
        }
    });
};
