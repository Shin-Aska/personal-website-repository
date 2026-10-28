/* Identical in default/ and guides/. All state is isolated by origin and scope. */
"use strict";
const SCOPE = new URL(self.registration.scope);
const CACHE_PREFIX = "orilla-offline:" + SCOPE.pathname + ":";
const CACHE_NAME = CACHE_PREFIX + "v2";
const META_NAME = CACHE_PREFIX + "meta-v2";
const MAX_ITEM = 8 * 1024 * 1024;
const MAX_TOTAL = 64 * 1024 * 1024;
const MAX_ENTRIES = 600;
const MAX_PAGES = 8;
const HASH = /^[a-f0-9]{64}$/;
let writes = Promise.resolve();
let releaseCheck;
let sequence = 0;
const transfers = new Map();
const manifests = new Map();
const pageRequests = new Map();
let accounting;

function kind(url) {
    if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return null;
    const path = url.pathname.slice(SCOPE.pathname.length);
    if (!path || /^[^/]+\.html$/i.test(path)) return "page";
    if (/^(offline\.js|site\.webmanifest)$/.test(path)) return "core";
    if (!/^(css|script|js|fonts|images|languages|jdatatables|data)\//.test(path)) return null;
    if (/\.(png|jpe?g|gif|webp|svg|ico|avif)$/i.test(path)) return "image";
    return /\.(css|js|mjs|json|woff2?|ttf|otf)$/i.test(path) ? "core" : null;
}
function serial(task) {
    const result = writes.catch(() => {}).then(task);
    writes = result;
    return result;
}
function internal(name) { return new URL("__offline__/" + name, SCOPE).href; }
async function metaGet(name) {
    try { return await (await (await caches.open(META_NAME)).match(internal(name))).json(); }
    catch (_) { return null; }
}
async function metaPut(name, value) {
    await (await caches.open(META_NAME)).put(internal(name), new Response(JSON.stringify(value)));
}
function headersFor(response) {
    const headers = new Headers(response.headers);
    // Fetch has already decoded HTTP compression; synthetic bodies are decoded bytes.
    headers.delete("Content-Encoding");
    headers.delete("Content-Length");
    return headers;
}
function responseWith(body, response, headers = headersFor(response)) {
    return new Response([204, 205, 304].includes(response.status) ? null : body,
        { status: response.status, statusText: response.statusText, headers });
}
async function digest(bytes) {
    return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
        .map(value => value.toString(16).padStart(2, "0")).join("");
}
async function matchesAsset(bytes, expected, url) {
    // Keep compatibility with existing byte-exact manifests. Text deployments
    // may change LF to CRLF (or mix both); compare canonical LF bytes as well.
    // Never decode/re-encode binary files or ignore other content differences.
    if (await digest(bytes) === expected) return true;
    if (!/\.(css|js|mjs|json|svg|webmanifest)$/i.test(new URL(url).pathname)) return false;
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const canonical = source.filter((value, index) => value !== 13 || source[index + 1] !== 10);
    return canonical.length !== source.length && await digest(canonical) === expected;
}

// The deadline includes the body, not just response headers. Oversized resources
// keep streaming online, but are never buffered or advertised as saved offline.
async function download(request, version, timeout = 1800, limit = MAX_ITEM, fromHTTP = false) {
    const url = new URL(request.url);
    if (!fromHTTP) url.searchParams.set(version ? "_swv" : "_swcheck",
        version || Date.now().toString(36) + "-" + (++sequence));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const headers = new Headers(request.headers);
        headers.delete("If-None-Match"); headers.delete("If-Modified-Since");
        const response = await fetch(url.href, { headers, credentials: request.credentials,
            mode: "same-origin", cache: fromHTTP ? "force-cache" : "no-store", redirect: "follow",
            integrity: request.integrity, signal: controller.signal });
        const cacheable = response.status === 200 && !response.redirected
            && !/\b(no-store|private)\b/i.test(response.headers.get("Cache-Control") || "");
        const reader = response.body?.getReader();
        const chunks = [];
        let size = 0;
        while (reader) {
            const chunk = await reader.read();
            if (chunk.done) break;
            chunks.push(chunk.value); size += chunk.value.length;
            if (size > limit) {
                // Do not hold an arbitrarily large image/download in memory.
                const stream = new ReadableStream({
                    async pull(target) {
                        if (chunks.length) { target.enqueue(chunks.shift()); return; }
                        try {
                            const next = await reader.read();
                            if (next.done) target.close(); else target.enqueue(next.value);
                        } catch (error) { target.error(error); }
                    },
                    cancel(reason) { return reader.cancel(reason); }
                });
                return { response: responseWith(stream, response), bytes: null, cacheable: false };
            }
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        return { response: responseWith(bytes, response), bytes, cacheable };
    } finally { clearTimeout(timer); }
}

async function loadManifest(version) {
    if (!HASH.test(version || "")) throw new Error("Invalid asset version");
    if (manifests.has(version)) return manifests.get(version);
    const metadata = await caches.open(META_NAME).catch(() => null);
    const key = new URL("offline-manifest.json?_swv=" + version, SCOPE).href;
    let response = metadata && await metadata.match(key);
    if (!response) {
        const result = await download(new Request(new URL("offline-manifest.json", SCOPE)), version, 1800, 1024 * 1024);
        if (result.response.status !== 200 || !result.bytes || await digest(result.bytes) !== version)
            throw new Error("Incomplete asset manifest deployment");
        response = result.response;
        if (metadata) await metadata.put(key, response.clone()).catch(() => {});
    }
    const manifest = await response.json();
    if (manifest.schema !== 1 || !manifest.files || typeof manifest.files !== "object")
        throw new Error("Invalid asset manifest");
    for (const [path, asset] of Object.entries(manifest.files)) {
        const url = new URL(path, SCOPE);
        if ((!kind(url) && path !== "service-worker.js") || url.search || url.hash
                || url.pathname.slice(SCOPE.pathname.length) !== path
                || !HASH.test(asset?.hash || "") || !Number.isSafeInteger(asset.size) || asset.size < 0)
            throw new Error("Invalid asset entry");
    }
    manifest.version = version;
    manifests.set(version, manifest);
    if (manifests.size > 12) manifests.delete(manifests.keys().next().value);
    return manifest;
}
async function currentRelease() {
    if (releaseCheck) return releaseCheck;
    releaseCheck = (async () => {
        try {
            const result = await download(new Request(new URL("offline-version.json", SCOPE)), null, 1500, 4096);
            if (result.response.status !== 200 || !result.bytes) throw new Error("No release marker");
            const { version } = JSON.parse(new TextDecoder().decode(result.bytes));
            const manifest = await loadManifest(version);
            await metaPut("release", { version }).catch(() => {});
            return manifest;
        } catch (_) {
            const last = await metaGet("release");
            if (last) { try { return { ...await loadManifest(last.version), stale: true }; } catch (_) {} }
            // A missing manifest must not freeze updates or break ordinary reading.
            return { version: "unversioned", files: {} };
        }
    })().finally(() => { releaseCheck = null; });
    return releaseCheck;
}
async function clientConfig(id) { return id && await metaGet("client/" + id); }
async function clientManifest(id) {
    const config = await clientConfig(id);
    if (config?.version && config.version !== "unversioned") {
        try { return await loadManifest(config.version); } catch (_) {}
    }
    return currentRelease();
}
function assetInfo(url, manifest) { return manifest.files[url.pathname.slice(SCOPE.pathname.length)]; }
function cacheKey(request, manifest) {
    const url = new URL(request.url);
    const asset = kind(url) !== "page" && assetInfo(url, manifest);
    if (asset) url.searchParams.set("_swv", asset.hash);
    url.hash = "";
    return url.href;
}
async function cacheNames() {
    return (await caches.keys()).filter(name => name.startsWith(CACHE_PREFIX) && name !== META_NAME);
}
async function readSaved(key, expected) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(key);
        if (response) return response;
        // Old caches are a fallback until a migration has actually succeeded.
        const original = new URL(key); original.searchParams.delete("_swv");
        for (const name of await cacheNames()) {
            const previous = await caches.open(name);
            const old = (name !== CACHE_NAME && await previous.match(key)) || await previous.match(original.href);
            if (!old) continue;
            if (/\b(no-store|private)\b/i.test(old.headers.get("Cache-Control") || "")) continue;
            if (!expected || await matchesAsset(await old.clone().arrayBuffer(), expected, key)) return old;
        }
    } catch (_) {}
    return null;
}
async function trim(cache) {
    let visits = await metaGet("visits") || {};
    const before = new Set(Object.keys(visits));
    const pages = Object.keys(visits).sort((a, b) => visits[b].used - visits[a].used);
    for (const page of pages.slice(MAX_PAGES)) {
        await cache.delete(page); delete visits[page];
    }
    let pinned = new Set(Object.entries(visits).flatMap(([page, visit]) => [page, ...visit.keys]));
    const records = [];
    for (const request of await cache.keys()) {
        const response = await cache.match(request);
        if (response) records.push({ key: request.url,
            size: Number(response.headers.get("X-Orilla-Size") || 0),
            used: Number(response.headers.get("X-Orilla-Used") || 0) });
    }
    let total = records.reduce((sum, record) => sum + record.size, 0);
    let count = records.length;
    records.sort((a, b) => a.used - b.used);
    async function evictUnpinned() {
        for (const record of records) {
            if (record.deleted || pinned.has(record.key) || total <= MAX_TOTAL && count <= MAX_ENTRIES) continue;
            await cache.delete(record.key); record.deleted = true;
            total -= record.size; count--;
        }
    }
    await evictUnpinned();
    // If full, evict the oldest saved page as a group, protecting newer pages.
    for (const page of pages.reverse()) {
        if (total <= MAX_TOTAL && count <= MAX_ENTRIES) break;
        if (!visits[page]) continue;
        delete visits[page];
        pinned = new Set(Object.entries(visits).flatMap(([p, visit]) => [p, ...visit.keys]));
        await evictUnpinned();
    }
    await metaPut("visits", visits);
    accounting = { total, count };
    const removed = new Set([...before].filter(page => !visits[page]));
    if (removed.size) {
        for (const client of await self.clients.matchAll({ type: "window" })) {
            if (removed.has(client.url.split("#")[0]))
                client.postMessage({ type: "OFFLINE_STATUS", complete: false });
        }
    }
}
async function store(key, result, version) {
    if (!result.cacheable || !result.bytes || result.bytes.length > MAX_ITEM) return false;
    return serial(async () => {
        try {
            const cache = await caches.open(CACHE_NAME);
            if (!accounting) await trim(cache);
            const previous = await cache.match(key);
            const headers = headersFor(result.response);
            headers.set("X-Orilla-Size", String(result.bytes.length));
            headers.set("X-Orilla-Used", String(Date.now()));
            if (version) headers.set("X-Orilla-Release", version);
            await cache.put(key, responseWith(result.bytes, result.response, headers));
            accounting.total += result.bytes.length - Number(previous?.headers.get("X-Orilla-Size") || 0);
            if (!previous) accounting.count++;
            if (accounting.total > MAX_TOTAL || accounting.count > MAX_ENTRIES) await trim(cache);
            return !!(await cache.match(key));
        } catch (_) { return false; }
    });
}
function touch(key, response, defer) {
    if (Date.now() - Number(response.headers.get("X-Orilla-Used") || 0) < 60000) return;
    const copy = response.clone();
    defer(serial(async () => {
        const cache = await caches.open(CACHE_NAME);
        if (!(await cache.match(key))) return;
        const headers = headersFor(copy); headers.set("X-Orilla-Used", String(Date.now()));
        await cache.put(key, responseWith(copy.body, copy, headers));
    }).catch(() => {}));
}
async function invalidate(request) {
    const original = new URL(request.url); original.hash = "";
    await serial(async () => {
        for (const name of await cacheNames()) {
            const cache = await caches.open(name);
            for (const key of await cache.keys()) {
                const url = new URL(key.url); url.searchParams.delete("_swv");
                if (url.href === original.href) await cache.delete(key);
            }
        }
    }).catch(() => {});
    accounting = null;
}

async function pruneMetadata() {
    const metadata = await caches.open(META_NAME);
    const clients = new Set((await self.clients.matchAll({ type: "window", includeUncontrolled: true })).map(c => c.id));
    const versions = new Set([(await metaGet("release"))?.version]);
    for (const visit of Object.values(await metaGet("visits") || {})) versions.add(visit.version);
    const keys = await metadata.keys();
    for (const request of keys) {
        if (!request.url.startsWith(internal("client/"))) continue;
        const id = request.url.slice(internal("client/").length);
        if (!clients.has(id)) await metadata.delete(request);
        else versions.add((await (await metadata.match(request)).json()).version);
    }
    for (const request of keys) {
        const url = new URL(request.url);
        if (url.pathname === new URL("offline-manifest.json", SCOPE).pathname
                && !versions.has(url.searchParams.get("_swv"))) await metadata.delete(request);
    }
}
async function rememberDependency(id, key, version) {
    await serial(async () => {
        const config = await clientConfig(id);
        if (!config?.page || config.version !== version) return;
        const visits = await metaGet("visits") || {};
        const visit = visits[config.page];
        if (!visit || visit.version !== version || visit.keys.includes(key)) return;
        if (!(await (await caches.open(CACHE_NAME)).match(key))) return;
        visit.keys.push(key);
        visit.used = Date.now();
        await metaPut("visits", visits);
    }).catch(() => {});
}
function forBrowser(response) {
    if (response.status === 0) return response;
    const headers = headersFor(response);
    headers.set("Cache-Control", "no-store"); headers.delete("Expires");
    for (const name of [...headers.keys()]) if (name.startsWith("x-orilla-")) headers.delete(name);
    return responseWith(response.body, response, headers);
}
function unavailable(isPage) {
    if (!isPage) return Response.error();
    return new Response('<!doctype html><html lang="en"><meta charset="utf-8">'
        + '<meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<title>Page unavailable offline</title><main><h1>This page has not been saved yet</h1>'
        + '<p>Reconnect to open this page. Previously saved pages remain available offline.</p>'
        + '<p><a href="' + SCOPE.pathname + '">Return to the homepage</a></p></main></html>',
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
async function resource(request, manifest, defer, page = false) {
    const key = cacheKey(request, manifest);
    const asset = !page && assetInfo(new URL(request.url), manifest);
    const copy = await readSaved(key, asset?.hash);
    if (page && manifest.stale && copy) return { response: copy, offline: true };
    if (copy && asset) { touch(key, copy, defer); return { response: copy, offline: false }; }
    if (copy && self.navigator.onLine === false) return { response: copy, offline: true };
    const transferKey = key + ":" + manifest.version;
    let pending = transfers.get(transferKey);
    if (!pending) {
        const generation = ++sequence;
        if (page) {
            pageRequests.set(key, generation);
            if (pageRequests.size > 128) pageRequests.delete(pageRequests.keys().next().value);
        }
        pending = (async () => {
            const result = await download(request, asset?.hash, copy ? 1800 : 8000);
            if (asset && result.bytes && result.response.status === 200
                    && !await matchesAsset(result.bytes, asset.hash, request.url)) throw new Error("Asset deployment mismatch");
            if ([401, 403, 404, 410].includes(result.response.status)) await invalidate(request);
            if (result.response.status === 200 && !result.cacheable && result.bytes) await invalidate(request);
            if (result.response.status >= 500) return { response: copy || result.response, offline: !!copy };
            if (!page || pageRequests.get(key) === generation) {
                defer(store(key, result, page ? manifest.version : null));
            }
            return { response: result.response, offline: false };
        })().finally(() => transfers.delete(transferKey));
        transfers.set(transferKey, pending);
    }
    try {
        const result = await pending;
        return { response: result.response.clone(), offline: result.offline };
    } catch (_) { return { response: copy || unavailable(page), offline: !!copy }; }
}

self.addEventListener("install", event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        // Never destroy old reading copies because a quota/write failed. Verify
        // the entire migration before retiring an old cache; keep it otherwise.
        try {
            const current = await caches.open(CACHE_NAME);
            for (const name of await cacheNames()) {
                if (name === CACHE_NAME) continue;
                const old = await caches.open(name);
                const requests = await old.keys();
                let complete = true;
                for (const request of requests) {
                    if (!kind(new URL(request.url))) { complete = false; continue; }
                    if (await current.match(request)) continue;
                    const response = await old.match(request);
                    const bytes = new Uint8Array(await response.clone().arrayBuffer());
                    if (!(await store(request.url, { response, bytes, cacheable: true }))) complete = false;
                }
                for (const request of requests) if (!(await current.match(request))) complete = false;
                if (complete) await caches.delete(name);
            }
        } catch (_) { /* Existing fallback caches remain readable. */ }
        await self.clients.claim();
    })());
});
self.addEventListener("fetch", event => {
    const request = event.request;
    const category = kind(new URL(request.url));
    if (!category || request.method !== "GET" || request.cache === "no-store"
            || request.headers.has("Range") || request.headers.has("Authorization")) return;
    const tasks = [];
    const handling = (async () => {
        const page = category === "page" && request.mode === "navigate";
        let manifest = page ? await currentRelease() : await clientManifest(event.clientId);
        if (page && manifest.stale && !(await readSaved(request.url)))
            manifest = { version: "unversioned", files: {} };
        const result = await resource(request, manifest, promise => tasks.push(promise), page);
        if (!page && result.response.status === 200 && event.clientId) {
            const key = cacheKey(request, manifest);
            tasks.push(writes.catch(() => {}).then(() => rememberDependency(event.clientId, key, manifest.version)));
        }
        if (page && event.resultingClientId) {
            const version = result.offline ? result.response.headers.get("X-Orilla-Release") || "unversioned" : manifest.version;
            await metaPut("client/" + event.resultingClientId,
                { version, page: request.url, offline: result.offline }).catch(() => {});
        }
        return forBrowser(result.response);
    })();
    event.respondWith(handling);
    event.waitUntil(handling.catch(() => {}).then(() => Promise.allSettled(tasks)));
});
self.addEventListener("message", event => {
    if (!event.source?.url || !kind(new URL(event.source.url))) return;
    const port = event.ports[0];
    event.waitUntil((async () => {
        if (event.data?.type === "GET_CONFIG") {
            const manifest = await clientManifest(event.source.id);
            if (!(await clientConfig(event.source.id))) await metaPut("client/" + event.source.id,
                { version: manifest.version, page: event.source.url.split("#")[0], offline: false }).catch(() => {});
            // Old open tabs keep their assets, but must not register an older
            // worker after a newer release has already been observed.
            let latest = manifest;
            const release = await metaGet("release");
            if (release) { try { latest = await loadManifest(release.version); } catch (_) {} }
            port?.postMessage({ worker: latest.files["service-worker.js"]?.hash,
                offline: (await clientConfig(event.source.id))?.offline || false });
            return;
        }
        if (event.data?.type !== "SAVE_VISIT" || !Array.isArray(event.data.urls)) return;
        const manifest = await clientManifest(event.source.id);
        const config = await clientConfig(event.source.id);
        if (!config) await metaPut("client/" + event.source.id,
            { version: manifest.version, page: event.source.url.split("#")[0], offline: false }).catch(() => {});
        const urls = [...new Set([event.source.url.split("#")[0], ...event.data.urls])].filter(value => {
            try { return !!kind(new URL(value)); } catch (_) { return false; }
        }).slice(0, MAX_ENTRIES);
        const keys = [];
        let next = 0;
        const tasks = [];
        await Promise.all(Array.from({ length: 4 }, async () => {
            while (next < urls.length) {
                const request = new Request(urls[next++], { credentials: "same-origin" });
                const key = cacheKey(request, manifest);
                keys.push(key);
                const asset = assetInfo(new URL(request.url), manifest);
                if (await readSaved(key, asset?.hash)) continue;
                // The initial uncontrolled page just downloaded these assets.
                // Reuse its HTTP-cache bytes only when the release hash agrees.
                if (asset) {
                    try {
                        const initial = await download(request, null, 1800, MAX_ITEM, true);
                        if (initial.cacheable && initial.bytes && await matchesAsset(initial.bytes, asset.hash, request.url)) {
                            if (await store(key, initial)) continue;
                        }
                    } catch (_) { /* Fall through to the versioned network URL. */ }
                }
                await resource(request, manifest, promise => tasks.push(promise), kind(new URL(request.url)) === "page");
            }
        }));
        await Promise.allSettled(tasks);
        let complete = true;
        await serial(async () => {
            try {
                const visits = await metaGet("visits") || {};
                const page = event.source.url.split("#")[0];
                const savedPage = await readSaved(page);
                const savedVersion = savedPage?.headers.get("X-Orilla-Release");
                // A still-open old tab must not replace the dependency list for
                // a newer saved copy of the same document URL.
                if (savedVersion && savedVersion !== manifest.version) { complete = false; return; }
                visits[page] = { keys, used: Date.now(), version: manifest.version };
                await metaPut("visits", visits);
                await trim(await caches.open(CACHE_NAME));
                for (const key of keys) if (!(await readSaved(key, new URL(key).searchParams.get("_swv")))) complete = false;
                await pruneMetadata();
            } catch (_) { complete = false; }
        });
        port?.postMessage({ complete, offline: config?.offline || self.navigator.onLine === false });
    })().catch(() => port?.postMessage({ complete: false })));
});
