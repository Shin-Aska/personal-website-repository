// One worker per page; verified files are cached across all guides on this origin.
export const MODEL_PROFILE_URL = new URL('../../local-assistant/profile.json', import.meta.url).href;
async function readProfile(url) {
    let cache;
    try { cache=await caches.open('guide-assistant-model-profile-v1'); } catch { /* Memory-only browsing is supported. */ }
    try {
        const response=await fetch(url,{cache:'no-cache'});
        if(!response.ok)throw new Error('Model settings could not be loaded');
        const config=await response.clone().json();
        if(config.schema!==1||typeof config.id!=='string')throw new Error('Invalid model settings');
        try { await cache?.put(url,response); } catch { /* Metadata caching is optional. */ }
        return config;
    } catch(error) {
        const cached=await cache?.match(url);
        if(cached)return cached.json();
        throw error;
    }
}
export function createModelRuntime({workerFactory = () => new Worker(new URL('./model-worker.js', import.meta.url), {type:'module'}),
    profileURL = MODEL_PROFILE_URL, fetchProfile = () => readProfile(profileURL)} = {}) {
    let worker, profilePromise, starting, readyResolve, readyReject, sequence=0, generation=0;
    const emptyProgress = () => ({loaded:0, total:0, cached:0, downloaded:0, downloadTotal:null, speedBps:null});
    let state = {status:'off', ...emptyProgress()};
    const listeners = new Set(), requests = new Map();
    const update = changes => { state = {...state,...changes}; for (const f of listeners) f(state); };
    const profile = () => profilePromise ||= fetchProfile().catch(error => {profilePromise=null;throw error;});
    function stop() {
        generation++; worker?.terminate(); worker = null;
        readyReject?.(new Error('Chat was disabled')); readyReject = readyResolve = null; starting = null;
        for (const r of requests.values()) { clearTimeout(r.timer); r.reject(new Error('Chat was disabled')); }
        requests.clear(); update({status:'off', ...emptyProgress()});
    }
    async function start() {
        if (state.status === 'ready') return;
        if (starting) return starting;
        const token = generation;
        starting = new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;});
        // Attach before preparation so a quick disable never produces an unhandled rejection.
        starting.catch(()=>{});
        update({status:'loading', ...emptyProgress()});
        profile().then(config => {
            if (token !== generation) return;
            update({total:config.totalBytes}); worker = workerFactory();
            worker.onmessage = ({data}) => {
                if (token !== generation) return;
                if (data.type === 'progress') update({loaded:data.loaded,total:data.total,cached:data.cached,
                    downloaded:data.downloaded,downloadTotal:data.downloadTotal,speedBps:data.speedBps});
                if (data.type === 'preparing') update({status:'preparing',speedBps:null});
                if (data.type === 'ready') { update({status:'ready',persisted:data.persisted}); readyResolve?.(); readyResolve=readyReject=null; }
                if (data.type === 'result' || (data.type === 'error' && data.id)) {
                    const r=requests.get(data.id); if (!r) return;
                    clearTimeout(r.timer); requests.delete(data.id);
                    data.type === 'result' ? r.resolve(data.text) : r.reject(new Error(data.message));
                }
                if (data.type === 'error' && !data.id) fail(new Error(data.message));
            };
            worker.onerror = () => fail(new Error('The local model could not run in this browser'));
            worker.postMessage({type:'load',profile:config,profileURL});
        }).catch(error=>{if(token===generation)fail(error);});
        return starting;
    }
    function fail(error) {
        stop(); update({status:'error',message:error.message});
    }
    function generate(packet) {
        if (state.status !== 'ready') return Promise.reject(new Error('Local chat is not ready'));
        return new Promise((resolve,reject)=>{
            const id=++sequence;
            const timer=setTimeout(()=>{ requests.delete(id); reject(new Error('Local reply took too long')); },20000);
            requests.set(id,{resolve,reject,timer});
            worker.postMessage({type:'generate',id,kind:packet.guard.kind,messages:packet.messages});
        });
    }
    return {profile,start,stop,generate,subscribe(f){listeners.add(f);return()=>listeners.delete(f);},get state(){return state;},get epoch(){return generation;}};
}
export const modelRuntime = createModelRuntime();
