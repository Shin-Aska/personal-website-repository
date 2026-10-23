// Model transfer accounting uses decoded response bytes, never cached bytes.
export function createDownloadProgress(total, publish, now = () => performance.now()) {
    let cached = 0, downloaded = 0, downloadTotal = null, elapsed = 0, started = null;
    function snapshot() {
        const milliseconds = elapsed + (started === null ? 0 : Math.max(0, now() - started));
        return {loaded:cached + downloaded, total, cached, downloaded, downloadTotal,
            speedBps:downloaded > 0 && milliseconds >= 500 ? downloaded * 1000 / milliseconds : null};
    }
    const emit = () => publish(snapshot());
    return {
        emit,
        cached(bytes) { cached += bytes; emit(); },
        plan(bytes) { downloadTotal = bytes; emit(); },
        begin() { started = now(); emit(); },
        received(bytes) { downloaded += bytes; },
        end() {
            if (started !== null) elapsed += Math.max(0, now() - started);
            started = null; emit();
        },
        snapshot
    };
}

export async function readModelResponse(response, expectedBytes, received) {
    if (!response.body?.getReader) {
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength !== expectedBytes) throw new Error('A model file failed its integrity check');
        received(bytes.byteLength);
        return bytes;
    }
    const reader = response.body.getReader();
    const bytes = new Uint8Array(expectedBytes);
    let offset = 0;
    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            if (offset + value.byteLength > expectedBytes) throw new Error('A model file failed its integrity check');
            bytes.set(value, offset); offset += value.byteLength;
            received(value.byteLength);
        }
        if (offset !== expectedBytes) throw new Error('A model file failed its integrity check');
        return bytes.buffer;
    } catch (error) {
        try { await reader.cancel(); } catch { /* Retain the original transfer error. */ }
        throw error;
    } finally { reader.releaseLock(); }
}

const mb = bytes => (bytes / 1e6).toFixed(1);
export function modelLoadingText(state) {
    if (!state.total) return 'Reading local chat file settings…';
    if (state.downloadTotal === null || state.downloadTotal === undefined)
        return `Checking saved model files: ${mb(state.cached || 0)} MB / ${mb(state.total)} MB…`;
    if (!state.downloadTotal) return `Loading saved model files: ${mb(state.total)} MB / ${mb(state.total)} MB…`;
    const speed = Number.isFinite(state.speedBps) && state.speedBps >= 0
        ? `Estimated speed: ${state.speedBps >= 1e5 ? mb(state.speedBps) + ' MB/s' : Math.round(state.speedBps / 1000) + ' KB/s'}`
        : 'Estimating download speed…';
    return `Downloaded ${mb(state.downloaded || 0)} MB / ${mb(state.downloadTotal)} MB · ${speed}`
        + (state.cached ? ` · ${mb(state.cached)} MB already saved` : '');
}
