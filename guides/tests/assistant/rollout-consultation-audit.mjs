// Reproduce the source/behavior audit without a model, network, or player state.
// Expected entities and negative decisions below are declared review cases;
// they are never derived from the planner's actual result.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { allRecords } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { createConsultation } from '../../js/assistant/consultation.js';
import { matchesChatBundle } from '../../js/assistant/consent.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const json = name => JSON.parse(read(name));
const catalogPath = 'guides/data/assistant/consultation-catalog.json';
const snapshotPath = 'guides/tests/assistant/evidence/conversation-starcraft-source-records.json';
const catalog = json(catalogPath), records = { ...allRecords, starcraft: json(snapshotPath) };
const normalizeQuote = text => text.replace(/\s+/g, ' ').trim();

const positiveCases = [
    ['starcraft', 'nativeRemastered', 'Which option is best for native Remastered?', 'starcraft:remastered-map'],
    ['starcraft', 'realisticAI', 'Which option is best for realistic AI?', 'starcraft:schnail'],
    ['starcraft', 'offline', 'In Brood War 1.16.1, which option is best for offline?', 'starcraft:bwai'],
    ['ultima7', 'healing', 'Which option is best for healing?', 'ultima7:companion:jaana'],
    ['ultima7', 'frontline', 'Which option is best for frontline?', 'ultima7:companion:dupre'],
    ['ultima7', 'ranged', 'Which option is best for ranged?', 'ultima7:companion:iolo'],
    ['albion', 'frontline', 'Which option is best for frontline?', 'albion:character:siobhan'],
    ['albion', 'frost', 'Which option is best for frost magic?', 'albion:character:sira'],
    ['albion', 'teleportation', 'Which option is best for teleportation?', 'albion:character:harriet'],
    ['ultima5', 'ranged', 'Which option is best for ranged?', 'ultima5:companion:shamino'],
    ['ultima5', 'frontline', 'Which option is best for frontline?', 'ultima5:companion:geoffrey'],
    ['ultima5', 'earlyMagic', 'Which option is best for early spellcasting?', 'ultima5:companion:jaana'],
    ['ultima6', 'ranged', 'Which option is best for ranged?', 'ultima6:atlas:marker:Iolo'],
    ['ultima6', 'frontline', 'Which option is best for frontline?', 'ultima6:atlas:marker:Dupre'],
    ['ultima6', 'spellcasting', 'Which option is best for spellcasting?', 'ultima6:atlas:marker:Jaana'],
    ['alqadim', 'quickStrike', 'Which option is best for fast strike?', 'alqadim:combat:quick-swing'],
    ['alqadim', 'frontCoverage', 'Which option is best for front coverage?', 'alqadim:combat:wide-swing'],
    ['alqadim', 'rearCoverage', 'Which option is best for rear coverage?', 'alqadim:combat:full-circle-swing'],
];
const negativeCases = [
    ['ultima7', 'Which companion is best for healing other than Jaana?'],
    ['ultima7', 'Which companion is best for healing instead of Jaana?'],
    ['ultima7', 'Which companion is best for healing apart from Jaana?'],
    ['ultima7', 'Which companion is best for healing if Jaana has left?'],
    ['albion', 'Which warrior should I use with Khunag in the party?'],
    ['alqadim', 'Which move is best for rear coverage before I learn it?'],
    ['ultima5', 'Which companion is the best archer with the highest Dexterity?'],
    ['ultima6', 'Which companion should I use for magic support without Jaana?'],
];

const inputs = [catalogPath, snapshotPath,
    'guides/tests/assistant/load-records.mjs', 'guides/tests/assistant/rollout-consultation-audit.mjs',
    ...['consultation', 'policy', 'language', 'retrieval', 'topics', 'consent', 'bootstrap'].map(name => `guides/js/assistant/${name}.js`),
    ...['albion', 'ultima5', 'ultima6', 'ultima7', 'alqadim', 'starcraft'].flatMap(name => [
        `guides/js/assistant/adapters/${name}.js`, `guides/data/assistant/${name}.json`]),
    ...['Albion', 'Ultima5', 'Ultima6', 'Ultima7', 'AlQadim', 'AlbionAtlasData', 'Ultima5AtlasData', 'Ultima6Atlas', 'Ultima7Markers', 'AlQadimAtlasData'].map(name => `guides/js/${name}.js`),
    'guides/StarcraftBWAPI.html', 'guides/local-assistant/profile.json', 'guides/local-assistant/intent/profile.json'];
const hashInputs = () => Object.fromEntries(inputs.map(name => {
    const body = fs.readFileSync(path.join(root, name));
    return [name, { bytes: body.length, sha256: crypto.createHash('sha256').update(body).digest('hex') }];
}));
const sourceHashes = hashInputs();
const failures = [], witnessFailures = [], distinctWitnesses = new Set();
let witnessUses = 0, profileCount = 0;
function walkWitnesses(value, visit) {
    if (!value || typeof value !== 'object') return;
    if (value.recordId && value.quote) visit(value);
    else for (const item of Object.values(value)) walkWitnesses(item, visit);
}
for (const [gameId, game] of Object.entries(catalog.games)) for (const profile of game.profiles) {
    profileCount++;
    walkWitnesses(profile, witness => {
        witnessUses++;
        distinctWitnesses.add(JSON.stringify([gameId, witness.recordId, witness.variant, witness.quote]));
        const raw = records[gameId].find(record => record.id === witness.recordId);
        const visible = raw && authorize(raw, witness.variant);
        const quoteMatches = visible && normalizeQuote(visible.text).includes(normalizeQuote(witness.quote));
        const sourceMatches = visible && [visible.source, visible.source?.basedOn].some(source => source
            && source.file === witness.source?.file && source.locator === witness.source?.locator);
        if (!visible || visible.level !== witness.variant || !quoteMatches || !sourceMatches)
            witnessFailures.push({ gameId, profile: profile.entityId, recordId: witness.recordId, variant: witness.variant,
                recordVisible: Boolean(visible), quoteMatches: Boolean(quoteMatches), sourceMatches: Boolean(sourceMatches) });
    });
}
function exercise(gameId, text) {
    // This explicit structural route does not emulate or score MiniLM output.
    return createConsultation({ gameId, records: records[gameId], catalog }).plan(text, { modelIntent: 'comparison' }, { spoiler: 'direct' });
}
const criteriaChecks = positiveCases.map(([gameId, criterion, text, expectedEntityId]) => {
    const actual = exercise(gameId, text), problems = [];
    if (actual?.reply.decision !== 'answer') problems.push('Expected a sourced conditional recommendation');
    if (actual?.recommendationEntityId !== expectedEntityId) problems.push('Wrong recommendation entity');
    if (!actual?.reply.recordIds.length || !actual?.reply.sources.length) problems.push('Missing source identifiers');
    if (actual?.reply.stateChanges.length) problems.push('Response proposed a progress change');
    if (!actual?.reply.text.startsWith('For ') || /\b(?:universally best|always the best)\b/i.test(actual.reply.text)) problems.push('Recommendation lost its conditional framing');
    return { gameId, criterion, text, expectedEntityId, actualEntityId: actual?.recommendationEntityId || null,
        decision: actual?.reply.decision || null, recordIds: actual?.reply.recordIds || [], passed: !problems.length, problems };
});
const negativeChecks = negativeCases.map(([gameId, text]) => {
    const actual = exercise(gameId, text), problems = [];
    if (actual?.reply.decision !== 'clarify') problems.push('Expected clarification for the unmodeled exclusion, eligibility, or ranking condition');
    if (actual?.recommendationEntityId || actual?.reply.recordIds.length || actual?.reply.stateChanges.length) problems.push('Unsupported condition produced a factual selection or progress proposal');
    return { gameId, text, expectedDecision: 'clarify', decision: actual?.reply.decision || null,
        reason: actual?.reason || null, passed: !problems.length, problems };
});
const mainProfile = json('guides/local-assistant/profile.json'), intentProfile = json('guides/local-assistant/intent/profile.json');
const bundleChecks = [
    { name: 'Current bundle matches its actual added intent package', passed: matchesChatBundle(mainProfile, intentProfile) },
    { name: 'Old cached main profile without intent metadata cannot authorize added files',
        passed: !matchesChatBundle({ schema: 1, id: 'smollm2-135m-q8-12fd25f-frames-v1', totalBytes: 161786625 }, intentProfile) },
    { name: 'Changed intent byte disclosure cannot authorize different bytes',
        passed: !matchesChatBundle({ ...mainProfile, intent: { ...mainProfile.intent, additionalBytes: mainProfile.intent.additionalBytes + 1 } }, intentProfile) },
];
if (profileCount !== 18 || witnessUses !== 74 || positiveCases.length !== 18 || negativeCases.length !== 8) failures.push('Declared audit coverage changed; review the catalog and cases before updating expectations.');
if (witnessFailures.length) failures.push('Some exact source witnesses failed');
if ([...criteriaChecks, ...negativeChecks, ...bundleChecks].some(check => !check.passed)) failures.push('Some declared behavior or bundle checks failed');
if (JSON.stringify(sourceHashes) !== JSON.stringify(hashInputs())) failures.push('An input source changed during the audit');
const report = {
    schemaVersion: 1, checkedAt: new Date().toISOString(), method: 'Read-only source and structural decision audit; explicit comparison routing; no model inference.',
    command: 'node guides/tests/assistant/rollout-consultation-audit.mjs',
    coverage: { games: Object.keys(catalog.games).length, profiles: profileCount, witnessUses, distinctWitnesses: distinctWitnesses.size,
        criteria: criteriaChecks.length, negativeConditions: negativeChecks.length, bundleGuards: bundleChecks.length },
    semanticReview: [
        { gameId: 'starcraft', finding: 'Native Remastered map, realistic-AI client, and offline 1.16.1 launcher are distinct conditional goals. Map mode/map coverage and SCHNAIL own-game/login limitations stay quoted; no same-installation compatibility is inferred.' },
        { gameId: 'ultima7', finding: 'Healing, front-line tank, and balanced archer match the guide companion roles. Party Builder text explicitly distinguishes a plan from actual party membership.' },
        { gameId: 'albion', finding: 'Siobhan warrior strength, Sira frost/snare specialty, and Harriet island teleportation requirement match the source. This is role guidance, not a claim that a currently unavailable companion has joined.' },
        { gameId: 'ultima5', finding: 'Shamino archery, Geoffrey front-line combat, and Jaana early spellcasting match the source. Early spellcasting is not a strongest-late-mage or highest-stat ranking.' },
        { gameId: 'ultima6', finding: 'Iolo ranged damage, Dupre front-line tank, and Jaana dedicated spellcaster directly match source role descriptions; no party state is asserted.' },
        { gameId: 'alqadim', finding: 'Fast strike, front-and-sides coverage, and full-circle rear coverage match the move descriptions. Quotes retain second-level/learning/progression caveats and do not assert that a move is already learned.' },
    ],
    sourceHashes, witnessChecks: { passed: witnessUses - witnessFailures.length, failures: witnessFailures },
    criteriaChecks, negativeChecks, bundleChecks, passed: failures.length === 0, failures,
    limitations: ['This audit makes no model-accuracy or generalization claim.',
        'Expected cases are declared in the script, independently of runtime results. Semantic trait review is a manual reading of the cited guide facts, not proof of a universal best option.',
        'No real player session or saved progress is read or changed. Empty stateChanges checks the response contract; it does not establish actual party membership, learning, recruitment, or installation.',
        'StarCraft source verification uses the existing live-DOM snapshot and captured guide HTML hash; browser DOM extraction and real-model behavior are separate acceptance checks.'],
};
const output = path.join(root, 'guides/tests/assistant/evidence/rollout-consultation-audit.json');
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ report: path.relative(root, output), coverage: report.coverage, passed: report.passed, failures }, null, 2));
if (!report.passed) process.exitCode = 1;
