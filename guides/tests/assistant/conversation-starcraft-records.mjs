// Replay StarCraft expectations against a previously extracted live-DOM snapshot.
// This supplements actual UI replay; it does not replace the production DOM adapter.
// Usage: node conversation-starcraft-records.mjs /tmp/records.json [report-path]
import fs from 'node:fs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';
import { validateCampaign, checkConversationReply } from './conversation-checks.mjs';
const [snapshot, output] = process.argv.slice(2);
if (!snapshot) throw new Error('Provide the extracted live-DOM record snapshot path.');
const records = JSON.parse(fs.readFileSync(snapshot, 'utf8'));
const fixture = JSON.parse(fs.readFileSync(new URL('./conversations/starcraft.json', import.meta.url)));
const schemaProblems = validateCampaign(fixture), results = [];
for (const dialogue of fixture.dialogues) {
    const assistant = createAssistant({ gameId: fixture.gameId, records });
    let spoiler = dialogue.spoiler;
    for (const [index, turn] of dialogue.turns.entries()) {
        spoiler = turn.options?.spoiler || spoiler;
        const reply = assistant.answer(turn.text, { ...dialogue.context, ...turn.options, spoiler });
        const problems = checkConversationReply(reply, { ...turn.expected, historyAbsent: turn.historyAbsent },
            { records, spoiler, authorize, history: assistant.getHistory() });
        if (assistant.inspect().claimCount) problems.push('unexpected session progress claim');
        results.push({ id: `${dialogue.id}:${index + 1}`, question: turn.text, spoiler, expected: turn.expected,
            decision: reply.decision, recordIds: reply.recordIds, sources: reply.sources, text: reply.text,
            passed: !problems.length, problems });
    }
}
const factual = results.filter(r => r.passed && r.expected.decision === 'answer');
const ids = [...new Set(factual.flatMap(r => r.recordIds))].sort();
const subjects = [...new Set(ids.map(id => records.find(r => r.id === id)?.entityId))].sort();
const failures = results.filter(r => !r.passed);
const report = { schemaVersion: 1, gameId: 'starcraft', sourceSnapshot: snapshot,
    method: 'Engine replay over snapshot extracted from live production DOM before authoring; see actual browser replay separately.',
    dialogues: fixture.dialogues.length, turns: results.length, passed: results.length - failures.length,
    factualTurnsPassed: factual.length, factualRecordIds: ids, distinctSubjects: subjects.length, subjectIds: subjects,
    schemaProblems, results, failures };
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ dialogues: report.dialogues, turns: report.turns, passed: report.passed,
    factualTurnsPassed: factual.length, distinctFactualRecords: ids.length, distinctSubjects: subjects.length, schemaProblems,
    failures: failures.map(f => ({ id: f.id, question: f.question, problems: f.problems, text: f.text })) }, null, 2));
if (failures.length || schemaProblems.length) process.exitCode = 1;
