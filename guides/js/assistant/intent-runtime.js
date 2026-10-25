// Shared, non-generative intent encoder. Model files load only after chat consent.
import { modelRuntime } from './model-runtime.js';

export const INTENT_PROFILE_URL = new URL('../../local-assistant/intent/profile.json', import.meta.url).href;
const aborted = message => Object.assign(new Error(message), { name: 'AbortError' });
const emptyProgress = () => ({ loaded: 0, total: 0, cached: 0, downloaded: 0, downloadTotal: null, speedBps: null });
function validEmbedding(vector) {
    if (!Array.isArray(vector) || vector.length !== 384 || !vector.every(Number.isFinite)) return false;
    return Math.abs(Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) - 1) <= 1e-3;
}
async function readProfile(url) {
    const target = new URL(url, import.meta.url);
    if (typeof location !== 'undefined' && target.origin !== location.origin) throw new Error('Intent settings must be local');
    const validate = profile => {
        if (profile.schema !== 1 || profile.backend !== 'minilm-linear-intent' || !Number.isFinite(profile.additionalBytes))
            throw new Error('Invalid intent settings');
        return profile;
    };
    let cache;
    try { cache = await caches.open('guide-assistant-intent-profile-v1'); } catch { /* Metadata may remain memory-only. */ }
    try {
        const response = await fetch(target, { cache: 'no-cache', credentials: 'same-origin', redirect: 'error' });
        if (!response.ok) throw new Error('Intent settings could not be loaded');
        const profile = validate(await response.clone().json());
        try { await cache?.put(target.href, response); } catch { /* Metadata persistence is optional. */ }
        return profile;
    } catch (error) {
        const cached = await cache?.match(target.href);
        if (cached) return validate(await cached.json());
        throw error;
    }
}

export function createIntentRuntime({
    workerFactory = () => new Worker(new URL('./intent-worker.js', import.meta.url), { type: 'module' }),
    consentRuntime = modelRuntime,
    authorized = () => consentRuntime.state.status === 'ready'
        && globalThis.document?.documentElement?.dataset.guideChat === 'ready',
    profileURL = INTENT_PROFILE_URL,
    fetchProfile = () => readProfile(profileURL),
    prepareTimeout = 120_000,
    requestTimeout = 20_000,
} = {}) {
    let worker = null, starting = null, readyResolve = null, readyReject = null, prepareTimer = null;
    let profilePromise = null, workerGeneration = 0, epoch = 0, sequence = 0;
    let state = Object.freeze({ status: 'off', ...emptyProgress() });
    const listeners = new Set(), requests = new Map();
    const update = changes => {
        state = Object.freeze({ ...state, ...changes });
        for (const listener of listeners) listener(state);
    };
    // Metadata is safe to read for the consent disclosure. This never creates a
    // worker, loads model assets, or includes a visitor's question in a request.
    const profile = () => profilePromise ||= Promise.resolve().then(fetchProfile).catch(error => { profilePromise = null; throw error; });
    const allowed = () => Boolean(authorized());
    function rejectRequest(id, error, notifyWorker = true) {
        const request = requests.get(id);
        if (!request) return;
        requests.delete(id);clearTimeout(request.timer);
        request.signal?.removeEventListener('abort', request.onAbort);
        if (notifyWorker && worker) worker.postMessage({ type: 'cancel', id });
        request.reject(error);
    }
    function cancelPending() {
        epoch++;
        for (const id of [...requests.keys()]) rejectRequest(id, aborted('The guide topic or request changed'));
    }
    function stop() {
        workerGeneration++;epoch++;
        worker?.terminate();worker = null;
        clearTimeout(prepareTimer);prepareTimer = null;
        readyReject?.(aborted('Local intent chat was disabled'));
        readyResolve = readyReject = null;starting = null;
        for (const id of [...requests.keys()]) rejectRequest(id, aborted('Local intent chat was disabled'), false);
        update({ status: 'off', message: undefined, metadata: undefined, thresholds: undefined, ...emptyProgress() });
    }
    function fail(error) {
        stop();update({ status: 'error', message: String(error.message || error) });
    }
    function prepare() {
        if (!allowed()) return Promise.reject(aborted('Enable local guide chat before loading intent files'));
        if (state.status === 'ready') return Promise.resolve(state.metadata);
        if (starting) return starting;
        const token = workerGeneration;
        starting = new Promise((resolve, reject) => { readyResolve = resolve;readyReject = reject; });
        starting.catch(() => {});
        update({ status: 'loading', message: undefined, ...emptyProgress() });
        prepareTimer = setTimeout(() => { if (token === workerGeneration) fail(new Error('Intent preparation took too long')); }, prepareTimeout);
        profile().then(config => {
            if (token !== workerGeneration) return;
            if (!allowed()) { stop();return; }
            update({ total: config.totalBytes });
            worker = workerFactory();
            worker.onmessage = ({ data }) => {
                if (token !== workerGeneration || !worker) return;
                if (!allowed()) { stop();return; }
                if (data.type === 'progress') update({ loaded: data.loaded, total: data.total, cached: data.cached,
                    downloaded: data.downloaded, downloadTotal: data.downloadTotal, speedBps: data.speedBps });
                else if (data.type === 'preparing') update({ status: 'preparing', speedBps: null });
                else if (data.type === 'ready') {
                    clearTimeout(prepareTimer);prepareTimer = null;
                    update({ status: 'ready', persisted: data.persisted, metadata: data.metadata, thresholds: config.thresholds });
                    readyResolve?.(data.metadata);readyResolve = readyReject = null;
                } else if (data.type === 'result' || data.type === 'embedding' || (data.type === 'error' && data.id)) {
                    const request = requests.get(data.id);
                    if (!request || request.epoch !== epoch) return;
                    requests.delete(data.id);clearTimeout(request.timer);
                    request.signal?.removeEventListener('abort', request.onAbort);
                    if (data.type === 'error') request.reject(new Error(data.message));
                    else if (request.operation === 'encode' && data.type === 'embedding' && validEmbedding(data.vector)) request.resolve(data.vector);
                    else if (request.operation === 'classify' && data.type === 'result') request.resolve(data.predictions);
                    else request.reject(new Error('The local intent encoder returned an invalid result'));
                } else if (data.type === 'error') fail(new Error(data.message));
            };
            worker.onerror = () => { if (token === workerGeneration) fail(new Error('The local intent encoder could not run')); };
            worker.onmessageerror = () => { if (token === workerGeneration) fail(new Error('The local intent encoder returned an invalid message')); };
            worker.postMessage({ type: 'load', profile: config, profileURL });
        }).catch(error => { if (token === workerGeneration) fail(error); });
        return starting;
    }
    function infer(operation, text, { signal, expectedEpoch } = {}) {
        if (typeof text !== 'string' || !text.trim() || text.length > 2_000) return Promise.reject(new TypeError('Intent text must contain 1–2000 characters'));
        if (signal && (typeof signal.addEventListener !== 'function' || typeof signal.removeEventListener !== 'function')) return Promise.reject(new TypeError('Intent cancellation needs an AbortSignal'));
        if (!allowed()) return Promise.reject(aborted('Local guide chat is not enabled'));
        if (signal?.aborted || (expectedEpoch !== undefined && expectedEpoch !== epoch)) return Promise.reject(aborted('The intent request is stale'));
        if (requests.size >= 32) return Promise.reject(new Error('Too many pending intent requests'));
        const id = ++sequence, requestEpoch = epoch;
        return new Promise((resolve, reject) => {
            const request = { resolve, reject, operation, epoch: requestEpoch, signal, timer: null,
                onAbort: () => rejectRequest(id, aborted('The intent request was cancelled')) };
            requests.set(id, request);signal?.addEventListener('abort', request.onAbort, { once: true });
            prepare().then(() => {
                if (!requests.has(id)) return;
                if (!allowed() || requestEpoch !== epoch || signal?.aborted) { rejectRequest(id, aborted('The intent request is stale'));return; }
                request.timer = setTimeout(() => rejectRequest(id, new Error('Intent inference took too long')), requestTimeout);
                // Text crosses only this local Worker boundary; fetch requests
                // below contain static asset paths and never question content.
                worker.postMessage({ type: operation, id, text });
            }).catch(error => rejectRequest(id, error));
        });
    }
    const classify = (text, options) => infer('classify', text, options);
    const encode = (text, options) => infer('encode', text, options);
    const unsubscribeConsent = consentRuntime.subscribe(current => {
        if (current.status !== 'ready' && (worker || starting || requests.size)) stop();
    });
    return { profile, prepare, start: prepare, classify, encode, stop, reset: cancelPending, cancelPending,
        subscribe(listener) { listeners.add(listener);return () => listeners.delete(listener); },
        destroy() { stop();unsubscribeConsent();listeners.clear(); },
        get state() { return state; }, get epoch() { return epoch; },
        get thresholds() { return state.thresholds || null; } };
}
export const intentRuntime = createIntentRuntime();
