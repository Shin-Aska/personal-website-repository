// Run with the bundled Node runtime. No dependencies or model/network requests.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';
import { CAMPAIGN_GAMES, CAMPAIGN_FAMILIES, validateCampaign, checkConversationReply } from './conversation-checks.mjs';

export function loadCampaigns() {
    return fs.readdirSync(new URL('./conversations/', import.meta.url)).filter(f => f.endsWith('.json')).sort()
        .map(file => JSON.parse(fs.readFileSync(new URL(`./conversations/${file}`, import.meta.url))));
}

export function runConversation(dialogue, gameId, records) {
    const assistant = createAssistant({ gameId, records }), turns = [];
    let spoiler = dialogue.spoiler;
    for (const [index, turn] of dialogue.turns.entries()) {
        spoiler = turn.options?.spoiler || spoiler;
        const reply = assistant.answer(turn.text, { ...dialogue.context, ...turn.options, spoiler });
        const problems = checkConversationReply(reply, { ...turn.expected, historyAbsent: turn.historyAbsent },
            { records, spoiler, authorize, history: assistant.getHistory() });
        if (assistant.inspect().claimCount) problems.push('unexpected session progress claim');
        turns.push({ id: `${dialogue.id}:${index + 1}`, question: turn.text, spoiler, expected: turn.expected.decision,
            decision: reply.decision, recordIds: reply.recordIds, text: reply.text, passed: !problems.length, problems });
    }
    return { id: dialogue.id, gameId, families: dialogue.families, passed: turns.every(t => t.passed), turns };
}

export function campaignReport(fixtures, results, recordsByGame, familyReview = null) {
    return Object.fromEntries(CAMPAIGN_GAMES.map(gameId => {
        const fixture = fixtures.find(f => f.gameId === gameId), dialogues = results.filter(r => r.gameId === gameId);
        const records = recordsByGame[gameId] || [], byId = new Map(records.map(r => [r.id, r]));
        const turns = dialogues.flatMap(d => d.turns), factual = turns.filter(t => t.passed && t.expected === 'answer');
        const ids = [...new Set(factual.flatMap(t => t.recordIds))].sort();
        const entities = [...new Set(ids.map(id => byId.get(id)?.entityId).filter(Boolean))].sort();
        const availableSubjects = [...new Set(records.map(r => r.entityId))].sort();
        const relations = [...new Set(ids.map(id => {
            const r = byId.get(id);
            return r?.narrative ? `narrative:${r.narrative.aspect}` : r?.relation;
        }).filter(Boolean))].sort();
        const families = [...new Set(dialogues.flatMap(d => d.families))].sort();
        const helpLevels = Object.fromEntries(['gentle', 'balanced', 'direct'].map(tier => [tier, {
            turns: turns.filter(t => t.spoiler === tier).length,
            distinctFactualRecords: new Set(factual.filter(t => t.spoiler === tier).flatMap(t => t.recordIds)).size,
            passed: turns.filter(t => t.spoiler === tier && t.passed).length
        }]));
        const missing = CAMPAIGN_FAMILIES.filter(f => !families.includes(f));
        return [gameId, { status: !fixture ? 'not-authored' : !dialogues.length ? 'not-executed' : turns.some(t => !t.passed) ? 'failing' : 'passing-current-corpus',
            dialoguesAuthored: fixture?.dialogues.length || 0, dialoguesRun: dialogues.length,
            turns: turns.length, passed: turns.filter(t => t.passed).length, failures: turns.filter(t => !t.passed).length,
            factualTurnsPassed: factual.length, otherTurnsPassed: turns.filter(t => t.passed && t.expected !== 'answer').length,
            distinctFactualRecords: ids.length, distinctSubjects: entities.length, relations, helpLevels,
            conversationFamilies: families, missingFamilies: missing, subjectIds: entities, factualRecordIds: ids,
            availableSubjectsAtAnyHelpLevel: availableSubjects.length,
            subjectsWithoutPassingFactualCoverage: availableSubjects.filter(id => !entities.includes(id)),
            minimumConversationsMet: dialogues.length >= 20 && dialogues.every(d => d.turns.length >= 8),
            // Dialogue tags do not prove a matrix. Accept only the independent
            // per-turn review of this exact authored fixture snapshot.
            familyHelpMatrixReviewed: Boolean(fixture && familyReview?.familyHelpMatrixReviewed
                && familyReview?.familyHelpCoverageComplete && !familyReview.referenceErrors?.length
                && familyReview.games?.[gameId]?.fixtureSha256 === createHash('sha256').update(JSON.stringify(fixture)).digest('hex')) }];
    }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const fixtures = loadCampaigns(), results = [], schemaProblems = fixtures.flatMap(validateCampaign);
    for (const fixture of fixtures) {
        if (!allRecords[fixture.gameId]) continue; // StarCraft must use its actual DOM in the browser runner.
        for (const dialogue of fixture.dialogues) results.push(runConversation(dialogue, fixture.gameId, allRecords[fixture.gameId]));
    }
    const reviewFile = new URL('./evidence/conversation-coverage-review.json', import.meta.url);
    const familyReview = fs.existsSync(reviewFile) ? JSON.parse(fs.readFileSync(reviewFile)) : null;
    const coverage = campaignReport(fixtures, results, allRecords, familyReview);
    const report = { schemaVersion: 1, scope: CAMPAIGN_GAMES, schemaProblems, coverage, results,
        limits: ['Regression campaign, not blind accuracy or exhaustive game knowledge.',
            'Factual record counts can include overlapping claims; distinct subjects and relationships are separate.',
            'Node does not execute the live-DOM StarCraft adapter. Browser evidence is required.'] };
    fs.writeFileSync(new URL('./evidence/conversation-campaign-node.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
    const failures = results.flatMap(d => d.turns.filter(t => !t.passed));
    // StarCraft runs only against the real DOM. This flag checks authoring
    // across all six games and execution for the five Node-loadable guides;
    // it never substitutes for the browser or family/help-matrix gates.
    const incomplete = CAMPAIGN_GAMES.filter(gameId => {
        const fixture = fixtures.find(f => f.gameId === gameId);
        return !fixture || fixture.dialogues.length < 20 || fixture.dialogues.some(d => d.turns.length < 8)
            || CAMPAIGN_FAMILIES.some(f => !fixture.dialogues.some(d => d.families.includes(f)))
            || (allRecords[gameId] && !coverage[gameId].minimumConversationsMet);
    });
    console.log(JSON.stringify({ dialogues: results.length, turns: results.flatMap(d => d.turns).length,
        failures: failures.length, schemaProblems, incompleteGames: incomplete,
        games: Object.fromEntries(Object.entries(coverage).map(([g, c]) => [g, c.status])) }, null, 2));
    for (const failure of failures) console.log(JSON.stringify(failure));
    if (failures.length || schemaProblems.length || (process.argv.includes('--require-complete') && incomplete.length)
        || (process.argv.includes('--require-reviewed') && Object.values(coverage).some(c => !c.familyHelpMatrixReviewed))) process.exitCode = 1;
}
