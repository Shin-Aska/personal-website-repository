#!/usr/bin/env node
// Replays fixed dialogue oracles with the packaged intent head and real cached
// MiniLM vectors. Never substitutes a raw query for a context-expanded query.
// Generate missing inputs with build-knowledge-embeddings.py --queries-only
// --query-texts <the missing-query-texts.json printed by this runner>.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const games = ['ultima6', 'ultima7', 'starcraft', 'ultima5', 'albion', 'alqadim'];
const results = 'guides/tests/assistant/intent-prototype/results';
const defaults = `${results}/knowledge-raw-query-embeddings.json`;
const options = { games: [], vectors: defaults, tag: `${new Date().toISOString().replace(/[^0-9]/g, '')}-${crypto.randomBytes(3).toString('hex')}` };
for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i];
    if (key === '--help') {
        console.log('Usage: node guides/tests/assistant/knowledge-corpus-replay.mjs [--game GAME] [--vectors FILE] [--tag UNIQUE_TAG]\nRepeat --game to select games. A matching FILE-metadata.json sidecar is required. Outputs never replace an existing run.');
        process.exit(0);
    }
    if (!['--game', '--vectors', '--tag'].includes(key) || !process.argv[i + 1]) throw new Error(`Invalid argument: ${key}`);
    const value = process.argv[++i];
    if (key === '--game') {
        if (!games.includes(value)) throw new Error(`Unknown game: ${value}`);
        options.games.push(value);
    } else options[key.slice(2)] = value;
}
if (!/^[a-zA-Z0-9_-]+$/.test(options.tag)) throw new Error('Tag must contain only letters, digits, hyphens, and underscores');
options.games = [...new Set(options.games.length ? options.games : games)];
const absolute = file => path.resolve(root, file);
const read = file => JSON.parse(fs.readFileSync(absolute(file), 'utf8'));
const vectorFile = absolute(options.vectors);
const metadataFile = vectorFile.replace(/\.json$/, '') + '-metadata.json';
const profileFile = 'guides/local-assistant/intent/profile.json';
const headFile = 'guides/local-assistant/intent/head.json';
const runDirectory = absolute(`${results}/knowledge-corpus-replay-${options.tag}`);
fs.mkdirSync(path.dirname(runDirectory), { recursive: true });
// Exclusive directory reservation prevents even a failed report being replaced.
fs.mkdirSync(runDirectory);
const outputFile = path.join(runDirectory, 'report.json');
const missingFile = path.join(runDirectory, 'missing-query-texts.json');
const requestedFile = path.join(runDirectory, 'requested-query-texts.json');
const relative = file => path.relative(root, file).split(path.sep).join('/');
function filesUnder(directory, filter = () => true) {
    return fs.readdirSync(absolute(directory), { withFileTypes: true }).flatMap(entry => {
        const file = path.posix.join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(file, filter) : filter(file) ? [file] : [];
    });
}
const hashFiles = [...new Set([
    ...filesUnder('guides/js', file => /\.(?:js|mjs)$/.test(file)),
    ...fs.readdirSync(absolute('guides')).filter(file => file.endsWith('.html')).map(file => `guides/${file}`),
    ...filesUnder('guides/data/assistant', file => file.endsWith('.json')),
    ...options.games.map(game => `guides/tests/assistant/knowledge/${game}-cases.json`),
    'guides/tests/assistant/load-records.mjs',
    'guides/tests/assistant/knowledge-corpus-replay.mjs',
    'guides/tests/assistant/evidence/conversation-starcraft-source-records.json',
    profileFile, headFile, vectorFile, metadataFile
])].sort();
const hashes = () => Object.fromEntries(hashFiles.map(file => [relative(absolute(file)),
    crypto.createHash('sha256').update(fs.readFileSync(absolute(file))).digest('hex')]));
const report = { schemaVersion: 1, kind: 'full-corpus-cached-minilm-dialogue-replay', tag: options.tag,
    startedAt: new Date().toISOString(), node: process.version, argv: process.argv.slice(2),
    selectedGames: options.games, vectors: relative(vectorFile), vectorMetadata: relative(metadataFile),
    outputFile: relative(outputFile), missingQueryTextsFile: relative(missingFile),
    inference: 'Packaged predictIntentHead on exact-text cached MiniLM vectors; no synthetic classification or vector substitution.',
    oracleSemantics: {
        factIds: 'One-of actual reply.knowledge.factIds; engine answers without knowledge metadata do not satisfy required fact IDs.',
        allFactIds: 'All required actual reply.knowledge.factIds.',
        source: 'Exact reply.sources file and locator; allSources requires every listed source.',
        sourceRecordIds: 'One-of provenance witnesses in reply.recordIds or knowledge.evidence.sourceRecordId; allSourceRecordIds requires every listed witness.',
        alternativeAnswers: 'Independent complete branches; only omitted contains inherits the base contains, and base notContains always applies.',
        missingInputs: 'The affected turn and remaining turns in that dialogue are incomplete, even if the runtime catches a missing-vector error and returns a source reply.'
    },
    status: 'running', games: {}, totals: { total: 0, passed: 0, failed: 0, incomplete: 0 } };
const missing = new Set(), requested = new Set();
let currentRequests = [], currentMissing = [], snapshotsTaken = false;
function vectorFor(text, purpose) {
    if (typeof text !== 'string') throw new Error(`Non-string ${purpose} input`);
    requested.add(text); currentRequests.push({ purpose, text });
    if (!Object.hasOwn(vectors, text)) {
        missing.add(text); currentMissing.push({ purpose, text });
        throw new Error(`Missing exact cached MiniLM input for ${purpose}: ${JSON.stringify(text)}`);
    }
    return vectors[text];
}
function checkBranch(reply, branch, base) {
    const errors = [], text = String(reply.text || '').toLowerCase();
    for (const value of branch.contains ?? base.contains ?? []) if (!text.includes(value.toLowerCase())) errors.push(`Missing substring: ${value}`);
    for (const value of new Set([...(base.notContains || []), ...(branch.notContains || [])])) if (text.includes(value.toLowerCase())) errors.push(`Forbidden substring: ${value}`);
    const ids = reply.knowledge?.factIds || [];
    if (branch.factIds?.length && !branch.factIds.some(id => ids.includes(id))) errors.push(`Missing one-of factIds: ${branch.factIds.join(', ')}`);
    for (const id of branch.allFactIds || []) if (!ids.includes(id)) errors.push(`Missing required factId: ${id}`);
    const sources = reply.sources || [];
    const sourceMatches = expected => sources.some(source => source.file === expected.file && source.locator === expected.locator);
    if (branch.source && !sourceMatches(branch.source)) errors.push(`Missing exact source: ${branch.source.file} :: ${branch.source.locator}`);
    for (const source of branch.allSources || []) if (!sourceMatches(source)) errors.push(`Missing required exact source: ${source.file} :: ${source.locator}`);
    const provenance = [...(reply.recordIds || []), ...(reply.knowledge?.evidence || []).map(evidence => evidence.sourceRecordId)];
    // sourceRecordIds names possible witnesses (one-of); allSourceRecordIds is
    // the explicit all-required form, like allFactIds and allSources.
    if (branch.sourceRecordIds?.length && !branch.sourceRecordIds.some(id => provenance.includes(id))) errors.push(`Missing one-of sourceRecordIds provenance: ${branch.sourceRecordIds.join(', ')}`);
    for (const id of branch.allSourceRecordIds || []) if (!provenance.includes(id)) errors.push(`Missing required sourceRecordId provenance: ${id}`);
    return errors;
}
function check(reply, expected) {
    const errors = [];
    if (!['answer', 'not-answer'].includes(expected.decision)) errors.push(`Unsupported expected decision: ${expected.decision}`);
    else if (expected.decision === 'answer' ? reply.decision !== 'answer' : reply.decision === 'answer') errors.push(`Expected ${expected.decision}; observed ${reply.decision}`);
    const branches = [expected, ...(expected.alternativeAnswers || [])];
    const branchProblems = branches.map(branch => checkBranch(reply, branch, expected));
    const acceptedAnswerBranch = branchProblems.findIndex(problems => !problems.length);
    if (acceptedAnswerBranch < 0) errors.push(...branchProblems.reduce((best, problems) => problems.length < best.length ? problems : best));
    return { problems: errors, acceptedAnswerBranch: acceptedAnswerBranch < 0 ? null : acceptedAnswerBranch, branchProblems };
}
let vectors;
try {
    report.sourceHashesBefore = hashes(); snapshotsTaken = true;
    const profile = read(profileFile), metadata = read(metadataFile), head = read(headFile).head;
    vectors = read(vectorFile);
    for (const key of ['modelId', 'revision', 'dimensions', 'dtype', 'maxTokens']) {
        if (metadata[key] !== profile[key]) throw new Error(`Query vector metadata mismatch: ${key}`);
    }
    if (metadata.count !== Object.keys(vectors).length) throw new Error('Query vector metadata count mismatch');
    for (const [text, vector] of Object.entries(vectors)) {
        if (!Array.isArray(vector) || vector.length !== profile.dimensions || vector.some(value => !Number.isFinite(value))) throw new Error(`Invalid cached vector for ${JSON.stringify(text)}`);
        if (Math.abs(Math.hypot(...vector) - 1) > 1e-3) throw new Error(`Non-unit cached vector for ${JSON.stringify(text)}`);
    }
    report.encoder = metadata; report.profileId = profile.id;
    const { allRecords } = await import('./load-records.mjs');
    const { buildKnowledge, attachKnowledgeEmbeddings } = await import('../../js/assistant/knowledge.js');
    const { createAssistant } = await import('../../js/assistant/engine.js');
    const { createConversationAssistant } = await import('../../js/assistant/dialogue.js');
    const { predictIntentHead, validateIntentHead } = await import('../../js/assistant/intent-head.js');
    validateIntentHead(head);
    for (const game of options.games) {
        const base = game === 'starcraft' ? read('guides/tests/assistant/evidence/conversation-starcraft-source-records.json') : allRecords[game];
        if (!Array.isArray(base) || !base.length) throw new Error(`Missing trusted source records: ${game}`);
        const knowledge = attachKnowledgeEmbeddings(buildKnowledge(game, base, read(`guides/data/assistant/knowledge/${game}.json`)),
            read(`guides/data/assistant/knowledge/${game}-embeddings.json`), profile);
        const cases = read(`guides/tests/assistant/knowledge/${game}-cases.json`);
        const gameReport = report.games[game] = { total: 0, passed: 0, failed: 0, incomplete: 0, dialogues: [] };
        for (const dialogue of cases.dialogues) {
            const dialogueReport = { id: dialogue.id, total: 0, passed: 0, failed: 0, incomplete: 0, turns: [] };
            gameReport.dialogues.push(dialogueReport);
            const source = createAssistant({ gameId: game, records: knowledge.sourceRecords, fallback: null });
            const assistant = createConversationAssistant({ assistant: source, records: knowledge.records, gameId: game, knowledge,
                thresholds: profile.thresholds, classify: async text => predictIntentHead(head, vectorFor(text, 'classify')),
                encode: async text => vectorFor(text, 'encode') });
            let contextIncomplete = false;
            try {
                for (const [index, turn] of dialogue.turns.entries()) {
                    currentRequests = []; currentMissing = [];
                    let reply, error;
                    const knowledgeTrace = [];
                    try { reply = await assistant.answerAsync(turn.text, { contextId: 'knowledge-corpus-replay', trace: event => knowledgeTrace.push(event) }); }
                    catch (caught) { error = { message: caught.message, stack: caught.stack }; }
                    contextIncomplete ||= currentMissing.length > 0;
                    const assertions = reply ? check(reply, turn.expected) : { problems: ['No reply'], branchProblems: [], acceptedAnswerBranch: null };
                    const status = contextIncomplete ? 'incomplete' : error || assertions.problems.length ? 'failed' : 'passed';
                    const row = { index: index + 1, text: turn.text, expected: turn.expected, status,
                        decision: reply?.decision, factIds: reply?.knowledge?.factIds || [], sources: reply?.sources || [],
                        ...assertions, requestedInputs: currentRequests, missingInputs: currentMissing, contextIncomplete };
                    if (status !== 'passed') Object.assign(row, { reply, packet: reply?.dialoguePacket, knowledgeTrace,
                        inspection: assistant.inspect(), ...(error ? { error } : {}) });
                    dialogueReport.turns.push(row);
                    for (const count of [dialogueReport, gameReport, report.totals]) { count.total++; count[status]++; }
                }
            } finally { assistant.destroy(); }
        }
        console.log(`${game}: ${gameReport.passed}/${gameReport.total} passed; ${gameReport.failed} failed; ${gameReport.incomplete} incomplete`);
    }
} catch (error) {
    report.fatalError = { message: error.message, stack: error.stack };
} finally {
    report.finishedAt = new Date().toISOString();
    if (snapshotsTaken) {
        report.sourceHashesAfter = hashes();
        report.changedSources = Object.keys(report.sourceHashesBefore).filter(file => report.sourceHashesBefore[file] !== report.sourceHashesAfter[file]);
        report.sourceStable = report.changedSources.length === 0;
    } else report.sourceStable = false;
    report.missingQueryCount = missing.size; report.requestedQueryCount = requested.size;
    report.status = report.fatalError ? 'error' : !report.sourceStable ? 'source-changed' : missing.size ? 'incomplete' : report.totals.failed ? 'failed' : 'passed';
    fs.writeFileSync(missingFile, JSON.stringify([...missing].sort(), null, 2) + '\n', { flag: 'wx' });
    fs.writeFileSync(requestedFile, JSON.stringify([...requested].sort(), null, 2) + '\n', { flag: 'wx' });
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify({ status: report.status, ...report.totals, sourceStable: report.sourceStable,
        missingQueryCount: missing.size, report: outputFile, missingQueryTexts: missingFile, ...(report.fatalError ? { error: report.fatalError.message } : {}) }));
    process.exitCode = report.status === 'passed' ? 0 : report.status === 'incomplete' || report.status === 'source-changed' ? 2 : 1;
}
