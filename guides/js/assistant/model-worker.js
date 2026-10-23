import { approvedFrames } from './fallback-guard.js';
import { nextFrameTokens, maskFrameScores } from './frame-tokens.js';
import { createDownloadProgress, readModelResponse } from './model-download.js';
let tokenizer, model, library, profile;
let queue = Promise.resolve();
const blobs = [];
const hash = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map(b => b.toString(16).padStart(2, '0')).join('');

async function prepare(config, profileURL) {
    profile = config;
    if (profile.schema !== 1 || profile.backend !== 'transformers-causal-lm') throw new Error('Unsupported model profile');
    let cache = null, persisted = true;
    try { cache = await caches.open('guide-assistant-model-files-v1'); } catch { persisted = false; }
    const buffers = new Map(), missing = [];
    const progress = createDownloadProgress(profile.totalBytes, data => postMessage({type:'progress', ...data}));
    progress.emit();
    for (const file of profile.assets) {
        if (!/^[a-f0-9]{64}$/.test(file.sha256)) throw new Error('Invalid model asset hash');
        const url = new URL(file.path, profileURL);
        if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL('.', profileURL).pathname)) throw new Error('Model assets must be local');
        const key = new URL('/__guide_assistant_model_cache__/' + file.sha256, self.location.origin).href;
        const response = await cache?.match(key);
        const bytes = response ? await response.arrayBuffer() : null;
        if (bytes && bytes.byteLength === file.bytes && await hash(bytes) === file.sha256) {
            buffers.set(file.sha256, bytes);
            progress.cached(file.bytes);
        } else {
            missing.push({file, url, key});
        }
    }
    progress.plan(missing.reduce((sum, {file}) => sum + file.bytes, 0));
    for (const {file, url, key} of missing) {
        progress.begin();
        const timer = setInterval(progress.emit, 500);
        let bytes;
        try {
            const response = await fetch(url, {credentials:'same-origin'});
            if (!response.ok) throw new Error('A model file could not be downloaded');
            bytes = await readModelResponse(response, file.bytes, progress.received);
        } finally { clearInterval(timer); progress.end(); }
        if (await hash(bytes) !== file.sha256) throw new Error('A model file failed its integrity check');
        try { if (cache) await cache.put(key, new Response(bytes)); } catch { persisted = false; }
        buffers.set(file.sha256, bytes);
    }
    const body = ids => new Blob(ids.map(id => {
        if (!buffers.has(id)) throw new Error('Missing configured model asset');
        return buffers.get(id);
    }));
    const blobURL = (ids, type) => {
        const url = URL.createObjectURL(new Blob([body(ids)], {type})); blobs.push(url); return url;
    };
    library = await import(blobURL(profile.runtime.module, 'text/javascript'));
    const { env, AutoTokenizer, AutoModelForCausalLM } = library;
    env.allowRemoteModels = false; env.allowLocalModels = true;
    env.useBrowserCache = false; env.useFSCache = false; env.useCustomCache = true;
    const virtual = new URL('./virtual/', profileURL).href;
    env.localModelPath = virtual;
    env.customCache = {
        async match(request) {
            const url = typeof request === 'string' ? request : request.url;
            const pathname = new URL(url, virtual).pathname;
            const entry = Object.keys(profile.model).find(name => pathname.endsWith('/current/' + name));
            return entry ? new Response(body(profile.model[entry])) : undefined;
        },
        async put() { /* Verified parts already belong to the model's dedicated cache. */ }
    };
    env.backends.onnx.wasm.numThreads = 1;
    env.backends.onnx.wasm.proxy = false;
    env.backends.onnx.wasm.wasmPaths = {
        mjs:blobURL(profile.runtime.wasmModule, 'text/javascript'),
        wasm:blobURL(profile.runtime.wasm, 'application/wasm')
    };
    postMessage({type:'preparing'});
    tokenizer = await AutoTokenizer.from_pretrained('current', {local_files_only:true});
    model = await AutoModelForCausalLM.from_pretrained('current', {dtype:profile.dtype, device:'wasm', local_files_only:true});
    buffers.clear();
    postMessage({type:'ready', persisted});
}

async function generate(data) {
    if (!model) throw new Error('Model is not ready');
    const frames = approvedFrames(data.kind);
    if (!frames.length) throw new Error('Unknown response category');
    const inputs = tokenizer.apply_chat_template(data.messages, {tokenize:true, return_dict:true, add_generation_prompt:true});
    const promptLength = Number(inputs.input_ids.dims.at(-1));
    if (promptLength > profile.maxInputTokens) throw new Error('Fallback context is too long');
    const sequences = frames.map(frame => {
        const ids = tokenizer(frame, {add_special_tokens:false}).input_ids.tolist()[0];
        if (tokenizer.decode(ids, {skip_special_tokens:true}) !== frame) throw new Error('Response frame did not round-trip');
        return ids;
    });
    const eosConfig = model.generation_config.eos_token_id;
    const eos = Number(Array.isArray(eosConfig) ? eosConfig[0] : eosConfig);
    if (!Number.isInteger(eos)) throw new Error('Invalid end-of-response token');
    class Frames extends library.LogitsProcessor {
        _call(ids, logits) {
            for (let i=0;i<ids.length;i++) maskFrameScores(logits[i].data,
                nextFrameTokens(sequences, ids[i].slice(promptLength), eos));
            return logits;
        }
    }
    const processors = new library.LogitsProcessorList(); processors.push(new Frames());
    const output = await model.generate({...inputs, do_sample:false, repetition_penalty:1.1,
        max_new_tokens:Math.max(...sequences.map(s=>s.length))+1, logits_processor:processors, eos_token_id:eos});
    const text = tokenizer.decode(output.tolist()[0].slice(promptLength), {skip_special_tokens:true}).trim();
    postMessage({type:'result', id:data.id, text});
}
self.onmessage = ({data}) => {
    queue = queue.catch(()=>{}).then(async () => {
        try {
            if (data.type === 'load') await prepare(data.profile, data.profileURL);
            else if (data.type === 'generate') await generate(data);
        } catch (error) { postMessage({type:'error', id:data.id, message:String(error.message || error)}); }
    });
};
