import fs from 'node:fs';
import { allRecords } from '../load-records.mjs';
import { createAssistant } from '../../../js/assistant/engine.js';
import { buildPacket } from './context.js';

const starcraft = new URL('./evidence/starcraft-records.json', import.meta.url);
if (fs.existsSync(starcraft)) allRecords.starcraft = JSON.parse(fs.readFileSync(starcraft, 'utf8'));
const definitions = JSON.parse(fs.readFileSync(new URL('./case-definitions.json', import.meta.url), 'utf8'));
const style = process.env.PILOT_PROMPT_STYLE || 'chat';
if (['topic', 'guarded'].includes(style)) definitions.push(...JSON.parse(fs.readFileSync(new URL('./topic-case-definitions.json', import.meta.url), 'utf8')));
if (style === 'guarded') definitions.push(...JSON.parse(fs.readFileSync(new URL('./guarded-case-definitions.json', import.meta.url), 'utf8')));
const cases = [];
for (const spec of definitions) {
    const records = allRecords[spec.gameId];
    if (!records) continue; // StarCraft comes from the actual DOM in browser-trial.py.
    const a = createAssistant({ gameId: spec.gameId, records });
    for (const seed of spec.seed || []) {
        const r = a.answer(seed, { spoiler: 'direct' });
        if (r.decision !== 'answer') throw new Error(`Seed no longer answers in ${spec.id}: ${seed}: ${r.text}`);
    }
    // These extra routing turns intentionally include engine nonanswers.
    for (const turn of spec.turns || []) a.answer(turn, { spoiler: 'direct' });
    if (spec.reset) a.resetTopic();
    a.setPolicy(spec.spoiler || 'direct');
    const history = a.getHistory();
    const baseline = a.answer(spec.question, { spoiler: spec.spoiler || 'direct' });
    const packet = buildPacket({ ...spec, records, history, baseline, spoiler: spec.spoiler || 'direct', style });
    if (spec.expectedRoute && packet.route !== spec.expectedRoute) throw new Error(`Unexpected route for ${spec.id}: ${packet.route}`);
    cases.push({ ...spec, packet, baseline: { decision: baseline.decision, text: baseline.text,
        recordIds: baseline.recordIds, sources: baseline.sources },
        diagnosticControl: baseline.decision === 'answer' });
}
fs.writeFileSync(new URL('./cases.json', import.meta.url), JSON.stringify(cases, null, 2) + '\n');
console.log(`Prepared ${cases.length} cases (${cases.filter(c => c.split === 'calibration').length} calibration), ${new Set(cases.map(c => c.gameId)).size} games.`);
