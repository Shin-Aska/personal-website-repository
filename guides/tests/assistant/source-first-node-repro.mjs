#!/usr/bin/env node
// Development replay of whole source-first dialogues in Node, without the
// browser. Exact-text cached MiniLM vectors (the ignored local query cache) feed
// the packaged intent head when present; an uncached text gets no intents and
// an unavailable encoder, and is counted as missing. It is a fast reproduction
// aid, not acceptance evidence: confirm every change with
// knowledge-blind-browser.py before reporting results.
// Usage: node source-first-node-repro.mjs [--cases FILE] [--dialogue ID]... [--all] [--missing-out FILE] [--requested-out FILE]
// --missing-out writes uncached texts as JSON for build-knowledge-embeddings.py
// --queries-only --query-texts FILE; rerun until none are missing, because
// context-expanded queries only appear once earlier turns are classified.
// --requested-out writes every exact text the run encoded (for test fixtures).
// Without --all, only dialogues containing a turn whose strict check fails are printed.
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge, attachKnowledgeEmbeddings} from '../../js/assistant/knowledge.js';
import {predictIntentHead} from '../../js/assistant/intent-head.js';
import {createAssistant} from '../../js/assistant/engine.js';
import {createConversationAssistant} from '../../js/assistant/dialogue.js';

const args = process.argv.slice(2);
let casesFile = new URL('./knowledge-source-first-96-20261025.json', import.meta.url);
const only = [];
let all = false;
let missingOut = null, requestedOut = null;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cases') casesFile = new URL(args[++i], `file://${process.cwd()}/`);
    else if (args[i] === '--dialogue') only.push(args[++i]);
    else if (args[i] === '--all') all = true;
    else if (args[i] === '--missing-out') missingOut = args[++i];
    else if (args[i] === '--requested-out') requestedOut = args[++i];
    else throw new Error(`Unknown argument: ${args[i]}`);
}
const dialogues = JSON.parse(fs.readFileSync(casesFile)).dialogues.filter(d => !only.length || only.includes(d.id));

const read = file => JSON.parse(fs.readFileSync(new URL(file, import.meta.url)));
const vectorUrl = new URL('./intent-prototype/results/knowledge-raw-query-embeddings.json', import.meta.url);
const vectors = fs.existsSync(vectorUrl) ? JSON.parse(fs.readFileSync(vectorUrl)) : {};
const profile = read('../../local-assistant/intent/profile.json');
const head = read('../../local-assistant/intent/head.json').head;
const missing = new Set(), requested = new Set();
const cached = text => { requested.add(text); if (Object.hasOwn(vectors, text)) return vectors[text]; missing.add(text); return null; };

function fixture(game) {
    const records = game === 'starcraft'
        ? JSON.parse(fs.readFileSync(new URL('./evidence/conversation-starcraft-source-records.json', import.meta.url)))
        : allRecords[game];
    const manifest = JSON.parse(fs.readFileSync(new URL(`../../data/assistant/knowledge/${game}.json`, import.meta.url)));
    const knowledge = attachKnowledgeEmbeddings(buildKnowledge(game, records, manifest),
        read(`../../data/assistant/knowledge/${game}-embeddings.json`), profile);
    const source = createAssistant({gameId: game, records: knowledge.sourceRecords, fallback: null});
    return createConversationAssistant({gameId: game, records: knowledge.records, knowledge, assistant: source,
        thresholds: profile.thresholds,
        classify: async text => { const vector = cached(text); return vector ? predictIntentHead(head, vector) : []; },
        encode: async text => { const vector = cached(text); if (!vector) throw Error('Encoder unavailable'); return vector; }});
}

function strict(turn, reply) {
    const expected = turn.expected;
    if (expected.decision !== 'answer') return reply.decision !== 'answer';
    if (reply.decision !== 'answer') return false;
    const text = reply.text.toLowerCase();
    return (expected.contains || []).every(value => text.includes(value.toLowerCase()));
}

let passed = 0, total = 0;
for (const dialogue of dialogues) {
    const assistant = fixture(dialogue.gameId);
    const lines = [];
    let failed = false;
    for (const [index, turn] of dialogue.turns.entries()) {
        const before = missing.size;
        const reply = await assistant.answerAsync(turn.text);
        if (missing.size > before) lines.push(`  (uncached MiniLM input on turn ${index + 1}; intents unavailable)`);
        const ok = strict(turn, reply);
        total++; if (ok) passed++; else failed = true;
        lines.push(`  ${ok ? 'PASS' : 'FAIL'} ${index + 1} [${turn.expected.decision}] ${turn.text}`,
            `       -> ${reply.decision}: ${reply.text.replace(/\s+/g, ' ').slice(0, 400)}`);
    }
    assistant.destroy();
    if (all || failed) console.log(`== ${dialogue.gameId}/${dialogue.id}\n${lines.join('\n')}`);
}
if (requestedOut) fs.writeFileSync(requestedOut, JSON.stringify([...requested].sort(), null, 2) + '\n');
if (missingOut) fs.writeFileSync(missingOut, JSON.stringify([...missing].sort(), null, 2) + '\n');
console.log(`\nNode replay strict: ${passed}/${total}; uncached MiniLM inputs: ${missing.size}`);
