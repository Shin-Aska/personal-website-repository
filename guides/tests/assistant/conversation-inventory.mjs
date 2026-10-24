// Inventory authored inputs, not an accuracy estimate or a test run.
import fs from 'node:fs';
import { CAMPAIGN_GAMES } from './conversation-checks.mjs';
const root = new URL('./', import.meta.url);
const files = ['pilot-cases.json', 'ultima-seers-cases.json', 'genie-sage-cases.json', 'adversarial-cases.json',
    'english-cases.json', 'knowledge-cases.json', 'owner-cases.json',
    ...fs.readdirSync(root).filter(f => /^sim-[a-z0-9]+-cases\.json$/.test(f)), 'trivia-ultima7-cases.json'];
const inventory = Object.fromEntries(CAMPAIGN_GAMES.map(game => [game, {
    questionCases: 0, dialogueCases: 0, dialogueTurns: 0, dialoguesAtLeastEightTurns: 0,
    maxDialogueTurns: 0, files: [], questionTexts: new Set()
}]));
for (const file of files) {
    const f = JSON.parse(fs.readFileSync(new URL(file, root)));
    for (const game of CAMPAIGN_GAMES) {
        const questions = (f.questions || []).filter(q => (q.gameId || f.gameId) === game);
        const dialogues = (f.dialogues || []).filter(d => (d.gameId || f.gameId) === game);
        const c = inventory[game];
        c.questionCases += questions.length;
        c.dialogueCases += dialogues.length;
        c.dialogueTurns += dialogues.reduce((n, d) => n + d.turns.length, 0);
        c.dialoguesAtLeastEightTurns += dialogues.filter(d => d.turns.length >= 8).length;
        c.maxDialogueTurns = Math.max(c.maxDialogueTurns, ...dialogues.map(d => d.turns.length));
        if (questions.length || dialogues.length) c.files.push(file);
        for (const q of questions) c.questionTexts.add((q.text || '').toLowerCase().replace(/\s+/g, ' ').trim());
    }
}
for (const c of Object.values(inventory)) {
    c.distinctQuestionWording = c.questionTexts.size;
    delete c.questionTexts;
}
const report = { scope: 'Original/English input registries plus Ultima VII trivia, before the sustained campaign.',
    limits: ['Counts overlap and do not measure distinct facts.', 'Standalone .test.mjs assertions are not counted.',
        'StarCraft has long technical dialogues already; RPG follow-ups are predominantly short.',
        'This inventory does not execute tests or assert that existing expectations are correct.'], inventory };
fs.writeFileSync(new URL('./evidence/conversation-inventory.json', root), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(inventory).map(([game, c]) => [game, {
    questions: c.questionCases, dialogues: c.dialogueCases, turns: c.dialogueTurns,
    sustained: c.dialoguesAtLeastEightTurns, longest: c.maxDialogueTurns }])), null, 2));
