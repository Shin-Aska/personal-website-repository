import { AutoTokenizer, AutoModelForCausalLM, TextStreamer, LogitsProcessor, LogitsProcessorList, env } from './vendor/transformers.min.js';
import { approvedFrames } from './guarded.js';
import { nextFrameTokens, maskFrameScores } from './frame-tokens.js';

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = new URL('./model/', import.meta.url).href;
env.useBrowserCache = false;
env.backends.onnx.wasm.wasmPaths = new URL('./vendor/', import.meta.url).href;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;
let tokenizer, model;

class FrameProcessor extends LogitsProcessor {
    constructor(sequences, promptLength, eos) {
        super(); this.sequences = sequences; this.promptLength = promptLength; this.eos = eos;
    }
    _call(ids, logits) {
        for (let i = 0; i < ids.length; i++) {
            const prefix = ids[i].slice(this.promptLength);
            maskFrameScores(logits[i].data, nextFrameTokens(this.sequences, prefix, this.eos));
        }
        return logits;
    }
}

async function load() {
    if (model) return;
    const started = performance.now();
    tokenizer = await AutoTokenizer.from_pretrained('smollm2', { local_files_only: true });
    model = await AutoModelForCausalLM.from_pretrained('smollm2', {
        dtype: 'q8', device: 'wasm', local_files_only: true
    });
    postMessage({ type: 'loaded', loadMs: performance.now() - started });
}

self.onmessage = async ({ data }) => {
    try {
        await load();
        if (data.type === 'load') return;
        const started = performance.now();
        const inputs = tokenizer.apply_chat_template(data.messages, { tokenize: true, return_dict: true, add_generation_prompt: true });
        const inputTokens = Number(inputs.input_ids.dims.at(-1));
        // Fail visibly rather than silently dropping source meaning or chat.
        if (inputTokens > 1536) throw new Error(`Prompt too long for this trial: ${inputTokens} tokens`);
        let processor, maxNewTokens = 60, eos = null;
        const frames = approvedFrames(data.guardKind);
        if (data.guardKind && !frames.length) throw new Error('Unknown approved-frame category');
        if (frames.length) {
            const sequences = frames.map(frame => {
                const ids = tokenizer(frame, { add_special_tokens: false }).input_ids.tolist()[0];
                if (tokenizer.decode(ids, { skip_special_tokens: true }) !== frame) throw new Error('Frame tokenization did not round-trip');
                return ids;
            });
            const configured = model.generation_config.eos_token_id;
            eos = Number(Array.isArray(configured) ? configured[0] : configured);
            if (!Number.isInteger(eos)) throw new Error('Missing EOS for finite-frame generation');
            processor = new LogitsProcessorList();
            processor.push(new FrameProcessor(sequences, inputTokens, eos));
            maxNewTokens = Math.max(...sequences.map(s => s.length)) + 1;
        }
        let firstTokenMs = null;
        const streamer = new TextStreamer(tokenizer, { skip_prompt: true, skip_special_tokens: true,
            callback_function: text => {
                if (firstTokenMs === null && text.trim()) firstTokenMs = performance.now() - started;
                postMessage({ type: 'chunk', id: data.id, text });
            } });
        const output = await model.generate({ ...inputs, max_new_tokens: maxNewTokens, do_sample: false, repetition_penalty: 1.1,
            ...(processor ? { logits_processor: processor, eos_token_id: eos } : {}), streamer });
        const ids = output.tolist()[0].slice(inputTokens);
        const text = tokenizer.decode(ids, { skip_special_tokens: true }).trim();
        postMessage({ type: 'result', id: data.id, text, inputTokens, generatedTokens: ids.length,
            firstTextMs: firstTokenMs, completeMs: performance.now() - started,
            hitTokenLimit: ids.length >= maxNewTokens && (eos === null || Number(ids.at(-1)) !== eos),
            settings: { max_new_tokens: maxNewTokens, do_sample: false, repetition_penalty: 1.1,
                ...(processor ? { decoding: 'approved-frames', frameCount: frames.length } : {}) },
            effectivePrompt: tokenizer.apply_chat_template(data.messages, { tokenize: false, add_generation_prompt: true }) });
    } catch (error) {
        postMessage({ type: 'error', id: data.id, message: String(error?.stack || error) });
    }
};
