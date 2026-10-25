const output = document.querySelector('#output');
if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    document.querySelector('#prepare').disabled = true;
    throw new Error('Loopback host required');
}
const worker = new Worker(new URL('./reader-worker.mjs', import.meta.url), {type: 'module'});
let serial = 0;
const pending = new Map();
worker.onmessage = ({data}) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    data.type === 'error' ? request.reject(new Error(data.message)) : request.resolve(data.result);
};
const request = data => new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, {resolve, reject});
    worker.postMessage({...data, id});
});
document.querySelector('#prepare').onclick = async () => {
    try {
        output.textContent = JSON.stringify(await request({type: 'prepare'}), null, 2);
        document.querySelector('#smoke').disabled = false;
    } catch (error) { output.textContent = error.message; }
};
document.querySelector('#smoke').onclick = async () => {
    try {
        // Thresholds here are mechanical smoke values, never calibrated acceptance settings.
        output.textContent = JSON.stringify(await request({type: 'rank',
            question: 'What color is the demonstration key?',
            contexts: [{id: 'synthetic-key', text: 'The demonstration key is blue.'},
                {id: 'synthetic-stone', text: 'The demonstration stone is round.'}],
            calibration: {minNullMargin: 0, minWinnerMargin: 0}}), null, 2);
    } catch (error) { output.textContent = error.message; }
};
// A browser benchmark may use this API without touching production chat or source files.
globalThis.sourceReaderLab = {request};
