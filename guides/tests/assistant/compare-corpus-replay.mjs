#!/usr/bin/env node
// Compares two knowledge-corpus-replay reports row by row. Passed rows store no
// reply, so equality is status, decision, factIds and sources for every row,
// plus the whole failed reply text where either side failed.
// Usage: node compare-corpus-replay.mjs BASELINE.json CANDIDATE.json
import fs from 'node:fs';

const [baselineFile, candidateFile] = process.argv.slice(2);
if (!baselineFile || !candidateFile) throw new Error('Usage: compare-corpus-replay.mjs BASELINE.json CANDIDATE.json');
const rows = file => {
    const report = JSON.parse(fs.readFileSync(file, 'utf8')), map = new Map();
    for (const [game, value] of Object.entries(report.games))
        for (const dialogue of value.dialogues)
            for (const turn of dialogue.turns) map.set(`${game}/${dialogue.id}/${turn.index}`, turn);
    return map;
};
const signature = turn => JSON.stringify([turn.status, turn.decision, turn.factIds,
    (turn.sources || []).map(source => [source.file, source.locator]), turn.reply?.text ?? null]);
const baseline = rows(baselineFile), candidate = rows(candidateFile);
let same = 0;
const changed = [];
for (const [key, turn] of baseline) {
    const other = candidate.get(key);
    if (other && signature(other) === signature(turn)) { same++; continue; }
    changed.push({key, text: turn.text, before: {status: turn.status, decision: turn.decision, reply: turn.reply?.text},
        after: other ? {status: other.status, decision: other.decision, reply: other.reply?.text} : null});
}
for (const key of candidate.keys()) if (!baseline.has(key)) changed.push({key, before: null});
console.log(JSON.stringify({identical: same, total: baseline.size, changed}, null, 2));
