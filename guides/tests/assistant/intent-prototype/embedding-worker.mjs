// Isolated local encoder. No generative answers or remote model fallback.
let library, tokenizer, model, profile;
let queue = Promise.resolve();
const digest = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))]
    .map(v=>v.toString(16).padStart(2,'0')).join('');
const sameOrigin = url => {
    if (url.origin !== self.location.origin) throw new Error('Only local model assets are allowed');
    return url;
};
async function json(url) {
    const response = await fetch(sameOrigin(url),{redirect:'error'});
    if (!response.ok) throw new Error('Local prototype assets are missing; run prepare-assets.py');
    return response.json();
}
async function checked(url, entry) {
    const response = await fetch(sameOrigin(url),{redirect:'error'});
    if (!response.ok) throw new Error('A local prototype asset could not be read');
    const body = await response.arrayBuffer();
    if (body.byteLength!==entry.bytes || await digest(body)!==entry.sha256)
        throw new Error('Local prototype asset integrity check failed');
    return body;
}
async function prepare() {
    if (!['localhost','127.0.0.1','[::1]'].includes(self.location.hostname))
        throw new Error('This experimental model is restricted to a loopback lab');
    const started = performance.now();
    const profileURL = new URL('./assets/profile.json',import.meta.url);
    profile = await json(profileURL);
    if (profile.schema!==1 || profile.dimensions!==384 || profile.dtype!=='q8')
        throw new Error('Unsupported prototype model profile');
    const sharedURL = new URL(profile.runtimeProfile,profileURL);
    const shared = await json(sharedURL);
    const wanted = new Set(Object.values(shared.runtime).flat());
    const buffers = new Map();
    for (const entry of shared.assets.filter(entry=>wanted.has(entry.sha256)))
        buffers.set(entry.sha256,await checked(new URL(entry.path,sharedURL),entry));
    const blob = (ids,type) => URL.createObjectURL(new Blob(ids.map(id=>{
        const bytes=buffers.get(id);
        if (!bytes) throw new Error('A pinned runtime part is missing');
        return bytes;
    }),{type}));
    library = await import(blob(shared.runtime.module,'text/javascript'));
    const {env,AutoTokenizer,AutoModel} = library;
    const files = new Map();
    for (const entry of profile.files)
        files.set(entry.name,await checked(new URL(entry.path,profileURL),entry));
    env.allowRemoteModels=false; env.allowLocalModels=true;
    env.useBrowserCache=false; env.useFSCache=false; env.useCustomCache=true;
    const virtual = new URL('./assets/virtual/',import.meta.url);
    env.localModelPath=virtual.href;
    env.customCache={
        async match(request) {
            const url=new URL(typeof request==='string'?request:request.url,virtual);
            const prefix=new URL('./current/',virtual).pathname;
            const name=url.pathname.startsWith(prefix)?url.pathname.slice(prefix.length):'';
            return files.has(name)?new Response(files.get(name)):undefined;
        },
        async put() { /* Only verified local files are used. */ }
    };
    env.backends.onnx.wasm.numThreads=1;
    env.backends.onnx.wasm.proxy=false;
    env.backends.onnx.wasm.wasmPaths={mjs:blob(shared.runtime.wasmModule,'text/javascript'),
        wasm:blob(shared.runtime.wasm,'application/wasm')};
    tokenizer=await AutoTokenizer.from_pretrained('current',{local_files_only:true});
    model=await AutoModel.from_pretrained('current',{dtype:'q8',device:'wasm',local_files_only:true});
    files.clear();buffers.clear();
    return {modelId:profile.modelId,revision:profile.revision,modelBytes:profile.modelBytes,
        sharedRuntimeBytes:profile.sharedRuntimeBytes,dimensions:384,prepareMs:performance.now()-started,
        realModelInference:true,encoderFineTuned:false,remoteModelsAllowed:false,wasmThreads:1};
}
async function embed(texts) {
    if (!model) throw new Error('Prepare the local encoder first');
    if (!Array.isArray(texts)||texts.length>16||!texts.length||texts.some(t=>typeof t!=='string'||!t.trim()||t.length>2000))
        throw new Error('Embedding input must contain 1–16 nonempty short texts');
    const started=performance.now();
    const inputs=await tokenizer(texts,{padding:true,truncation:true,max_length:profile.maxTokens});
    const output=await model(inputs);
    const vectors=library.mean_pooling(output.last_hidden_state,inputs.attention_mask).normalize(2,-1).tolist();
    return {vectors,ms:performance.now()-started};
}
self.onmessage=({data})=>{
    queue=queue.catch(()=>{}).then(async()=>{
        try {
            const result=data.type==='prepare'?await prepare():data.type==='embed'?await embed(data.texts):null;
            if (!result) throw new Error('Unknown prototype request');
            postMessage({id:data.id,type:'result',result});
        } catch(error) {postMessage({id:data.id,type:'error',message:String(error.message||error)});}
    });
};
