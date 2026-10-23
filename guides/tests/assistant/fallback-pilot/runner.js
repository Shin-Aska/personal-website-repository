import { inspectOutput } from './context.js';
import { finalizeGuarded } from './guarded.js';

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
const el = id => document.getElementById(id);
const cases = await fetch('./cases.json').then(r => { if (!r.ok) throw new Error('Generate cases.json first'); return r.json(); });
let loaded = false, busy = false, waiting = null;
const trace = { loadMs: null, responses: [] };

worker.onmessage = ({ data }) => {
    if (data.type === 'loaded') {
        loaded = true; trace.loadMs = data.loadMs;
        el('status').textContent = `Local model ready (${Math.round(data.loadMs)} ms preparation).`;
        el('run').disabled = false;
        if (waiting?.type === 'load') { waiting.resolve(data); waiting = null; }
    } else if (data.type === 'chunk') {
        el('raw').textContent += data.text;
    } else if (data.type === 'result' || data.type === 'error') {
        busy = false;
        el('run').disabled = !loaded;
        if (data.type === 'error') {
            el('status').textContent = data.message;
            waiting?.reject(new Error(data.message)); waiting = null; return;
        }
        const trial = cases.find(c => c.id === data.id);
        const result = { ...data, responseKind: 'model', mechanical: inspectOutput(data.text, trial.packet) };
        if (trial.packet.style === 'guarded') {
            const current = cases.find(c => c.id === el('cases').value)?.packet;
            result.guarded = finalizeGuarded(data.text, trial.packet, current);
            el('reply').textContent = result.guarded.text;
        } else el('reply').textContent = 'This earlier trial style has no output guard. Raw output is in the details below.';
        trace.responses.push(result);
        el('raw').textContent = result.text;
        el('metrics').textContent = JSON.stringify({ inputTokens: result.inputTokens, generatedTokens: result.generatedTokens,
            firstTextMs: result.firstTextMs, completeMs: result.completeMs, hitTokenLimit: result.hitTokenLimit,
            ...(result.guarded ? { guarded: result.guarded } : {}),
            ...result.mechanical }, null, 2);
        el('status').textContent = result.guarded ? (result.guarded.acceptedModelWording
            ? 'Approved conversational wording; guide facts quoted by the program.'
            : 'Model wording rejected; program fallback shown.') : 'Finished. Raw output requires source-based review.';
        waiting?.resolve(result); waiting = null;
    }
};
worker.onerror = event => { waiting?.reject(new Error(event.message)); waiting = null; busy = false; };

const selectCase = id => {
    const c = cases.find(c => c.id === id);
    if (!c) throw new Error('Unknown trial case');
    el('cases').value = id;
    el('question').textContent = c.question;
    el('context').textContent = JSON.stringify(c, null, 2);
    el('run').disabled = busy || (!loaded && (!c.packet.route || c.packet.route === 'model'));
    return c;
};
const load = () => loaded ? Promise.resolve({ loadMs: trace.loadMs }) : new Promise((resolve, reject) => {
    if (waiting) return reject(new Error('A model operation is already pending'));
    waiting = { type: 'load', resolve, reject }; el('status').textContent = 'Loading the local model…';
    worker.postMessage({ type: 'load' });
});
async function run(id) {
    if (busy || waiting) throw new Error('A model operation is already pending');
    const c = selectCase(id);
    if (c.packet.route && c.packet.route !== 'model') {
        const result = { id, type: 'result', responseKind: c.packet.route, text: c.packet.reply,
            firstTextMs: null, completeMs: null, generatedTokens: 0, inputTokens: 0,
            hitTokenLimit: false, effectivePrompt: null };
        trace.responses.push(result);
        if (c.packet.style === 'guarded') result.guarded = finalizeGuarded(null, c.packet, c.packet);
        el('reply').textContent = result.guarded?.text || 'This earlier trial style has no output guard. Raw output is in the details below.';
        el('raw').textContent = result.text;
        el('metrics').textContent = JSON.stringify(result, null, 2);
        el('status').textContent = c.packet.route === 'engine' ? 'Existing engine answer. Model was not invoked.'
            : 'No clear sourced topic. Fixed reply; model was not invoked.';
        return result;
    }
    await load();
    el('reply').textContent = 'Preparing a reply…';
    el('raw').textContent = ''; el('metrics').textContent = ''; el('status').textContent = 'Generating…';
    busy = true; el('run').disabled = true;
    return new Promise((resolve, reject) => {
        waiting = { type: 'run', resolve, reject };
        worker.postMessage({ type: 'generate', id, messages: c.packet.messages,
            ...(c.packet.style === 'guarded' ? { guardKind: c.packet.guard?.kind } : {}) });
    });
}
for (const c of cases) { const option = document.createElement('option'); option.value = c.id; option.textContent = `${c.id} — ${c.question}`; el('cases').append(option); }
el('cases').onchange = () => selectCase(el('cases').value);
el('load').onclick = () => load().catch(error => { el('status').textContent = error.message; });
el('run').onclick = () => run(el('cases').value).catch(error => { el('status').textContent = error.message; });
selectCase(cases[0].id);
el('status').textContent = `${cases.length} trial cases ready. Model files load only when requested.`;
window.fallbackPilot = { cases, trace, load, run,
    checkGuard: ({ raw, packet }) => finalizeGuarded(raw, packet, packet) };
