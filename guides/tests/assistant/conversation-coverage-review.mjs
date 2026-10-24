// A deliberately conservative, manually mapped review. Never infer a turn's
// family from its dialogue tags or an assistant reply. Run with bundled Node.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { allRecords } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { loadCampaigns, runConversation } from './conversation-campaign.mjs';
import { CAMPAIGN_FAMILIES, CAMPAIGN_GAMES } from './conversation-checks.mjs';

const levels = ['gentle', 'balanced', 'direct'];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const cell = (status, refs = [], note = '') => ({ status, refs, note });
const p = (...refs) => cell('positive-witness', refs);
const s = (...refs) => cell('structural-witness', refs);
const w = (note, ...refs) => cell('partial-witness', refs, note);
const n = note => cell('ceiling-only', [], note);
const a = (gentle, balanced, direct) => ({ gentle, balanced, direct });
const alb = 'albion-security-hints-and-subject-recovery';
const u5 = 'ultima5-pilgrimage-hints-and-name-recovery';
const u6 = 'ultima6-valor-hints-location-ceiling-and-correction';
const u7 = 'ultima7-time-lord-quest-hints-and-identity-switch';
const aq = 'alqadim-oasis-hints-and-location-recovery';
const albExplain = 'albion-maini-explanation-and-unavailable-causes';
const u6Cause = 'ultima6-invasion-cause-and-unsupported-motives';
const aqExplain = 'alqadim-experience-explanation-and-guide-only-boundary';

// References were selected by reading questions, prior referents, expectations,
// help changes and native/overlay declarations. Positive witnesses do not claim
// every subdimension of a family; see notes and the companion Markdown review.
const reviewedMapping = {
  albion: {
    lore: a(p('albion-opening-crew:1'), p('albion-island-geography:1'), p('albion-mage-partners:1')),
    travel: a(p(`${alb}:3`, `${alb}:4`), p('albion-shield-name-repair:2'), p('albion-rainer-and-harriet:2')),
    objectives: a(p(`${alb}:1`), p(`${alb}:6`), p('albion-maini-intrigue:1', 'albion-maini-intrigue:2')),
    mechanics: a(p('albion-iskai-magic:1'), p('albion-pistol-shopping:2'), p('albion-final-encounters:1')),
    relationships: a(cell('positive-witness', [`${albExplain}:9`], 'Gentle explicitly explains the Iskai school: practitioner Sira, reagent and teacher. It does not supply the Direct-only Sira/Melthas party link or Harriet replacement cause.'), cell('positive-witness', [`${albExplain}:1`, `${albExplain}:5`], 'The source explicitly states chapter goals. This is an explanation of Maini, not a causal account of Harriet replacing Rainer; the exact goal-in-Maini purpose phrasing remains unindexed.'), p('albion-mage-partners:9', `${alb}:10`)),
    continuity: a(p('albion-opening-crew:2', `${alb}:3`), p('albion-shield-name-repair:5'), p('albion-mage-partners:10')),
    topics: a(s('albion-cure-research:4', 'albion-cure-research:5'), p('albion-reset-and-long-chat:3', 'albion-reset-and-long-chat:8'), p('albion-return-toronto:7', 'albion-return-toronto:8')),
    names: a(p(`${alb}:13`), p('albion-shield-name-repair:1', 'albion-shield-name-repair:3', 'albion-shield-name-repair:6'), p(`${alb}:11`)),
    boundaries: a(s('albion-cure-research:2', 'albion-cure-research:3', 'albion-help-level-changes:3'), s('albion-persistent-restrictions:1', 'albion-persistent-restrictions:2'), s('albion-return-toronto:5', 'albion-return-toronto:6')),
    unsupported: a(s('albion-druid-magic:7'), s('albion-persistent-restrictions:7', 'albion-persistent-restrictions:8'), s('albion-mage-partners:8', `${alb}:12`)),
  },
  ultima5: {
    lore: a(p('ultima5-starting-friends:1'), p('ultima5-mage-circuit:1'), p('ultima5-family-relationship:1')),
    travel: a(p('ultima5-navigation-tools:1'), p('ultima5-mage-circuit:2'), p('ultima5-royal-regalia:2')),
    objectives: a(p(`${u5}:1`), p(`${u5}:5`, `${u5}:6`), p('ultima5-castle-and-doom:1')),
    mechanics: a(p('ultima5-poison-and-sleep:2'), p('ultima5-navigation-tools:3'), p('ultima5-castle-and-doom:4')),
    relationships: a(cell('positive-witness', ['ultima5-virtue-discovery:1'], 'The native virtue row explicitly associates Honesty with Moonglow. This is a narrow sourced association/explanation, not a philosophical definition; the Gwenno/Iolo family link remains Direct-only.'), p(`${u5}:6`), p('ultima5-family-relationship:3')),
    continuity: a(p('ultima5-starting-friends:2'), p('ultima5-mage-circuit:3'), p('ultima5-shadowlords:3')),
    topics: a(s('ultima5-poison-and-sleep:5', 'ultima5-poison-and-sleep:6', 'ultima5-poison-and-sleep:7'), p('ultima5-names-and-reset:6', 'ultima5-names-and-reset:8'), p('ultima5-castle-and-doom:5', 'ultima5-castle-and-doom:8')),
    names: a(p(`${u5}:3`, 'ultima5-healing-and-death:6'), p('ultima5-names-and-reset:1', 'ultima5-names-and-reset:8', `${u5}:7`), p(`${u5}:10`)),
    boundaries: a(s('ultima5-traitor-spoilers:4', 'ultima5-poison-and-sleep:5'), s('ultima5-names-and-reset:3', 'ultima5-names-and-reset:4'), s(`${u5}:11`)),
    unsupported: a(s('ultima5-light-and-invisibility:7'), s('ultima5-names-and-reset:3', 'ultima5-names-and-reset:4'), s('ultima5-family-relationship:7', `${u5}:11`)),
  },
  ultima6: {
    lore: a(p('ultima6-starting-companions:1'), p('ultima6-mouse-and-gargoyle:1'), p('ultima6-yew-to-minoc:1')),
    travel: a(cell('ceiling-only', [`${u6}:3`, `${u6}:4`], 'No exact-location/acquisition record is authorized at Gentle; a refusal is the valid location behavior. Gentle quest guidance is separately exercised.'), cell('ceiling-only', [`${u6}:7`], 'No exact-location record is authorized at Balanced. The refusal is policy coverage, not factual travel coverage.'), p('ultima6-dungeon-itinerary:1', `${u6}:8`)),
    objectives: a(p(`${u6}:1`), p('ultima6-merchant-route:1', `${u6}:5`), p('ultima6-rune-hunt:1', `${u6}:9`)),
    mechanics: a(p('ultima6-early-spells:2'), p('ultima6-mouse-and-gargoyle:2'), p('ultima6-boots-and-crossbow:1')),
    relationships: a(cell('positive-witness', [`${u6Cause}:1`], 'Native briefing explicitly states the cause of invasion. Fear/emotion, Gargish definition and a Lord British order remain unsupported; this is not a biography or every possible cause.'), p(`${u6Cause}:3`, `${u6Cause}:5`), p(`${u6Cause}:7`, `${u6Cause}:8`)),
    continuity: a(p('ultima6-starting-companions:2'), p('ultima6-mouse-and-gargoyle:2'), p('ultima6-yew-to-minoc:3')),
    topics: a(s('ultima6-status-and-sources:3', 'ultima6-status-and-sources:4', 'ultima6-status-and-sources:5'), p('ultima6-names-reset-and-restrictions:8', 'ultima6-names-reset-and-restrictions:10'), p(`${u6}:10`, `${u6}:11`, `${u6}:12`)),
    names: a(p('ultima6-advanced-spells:5', `${u6}:2`), p('ultima6-names-reset-and-restrictions:1', 'ultima6-names-reset-and-restrictions:3'), p('ultima6-boots-and-crossbow:6', `${u6}:8`)),
    boundaries: a(s('ultima6-mantras-and-lowering:7', 'ultima6-status-and-sources:2'), s('ultima6-merchant-route:2'), s('ultima6-dungeon-itinerary:7')),
    unsupported: a(s('ultima6-advanced-spells:6', 'ultima6-advanced-spells:7'), s('ultima6-names-reset-and-restrictions:5', 'ultima6-names-reset-and-restrictions:6'), s('ultima6-rune-hunt:8')),
  },
  ultima7: {
    lore: a(p('ultima7-royal-friendship:1'), p('ultima7-townsfolk:1'), p('ultima7-hook-and-escape:1')),
    travel: a(p('ultima7-companions-and-services:2'), p('ultima7-spark-and-christopher:2'), p('ultima7-artifact-hunt:1')),
    objectives: a(p(`${u7}:1`), p(`${u7}:3`), p('ultima7-trinsic-investigation:1', `${u7}:6`)),
    mechanics: a(p('ultima7-practical-spells:1'), p('ultima7-weapon-effects:1'), p('ultima7-investigation-magic:1')),
    relationships: a(p('ultima7-royal-friendship:4', 'ultima7-royal-friendship:6'), p('ultima7-time-lord-and-guardian:5', 'ultima7-gypsy-families:2'), p('ultima7-fellowship-origins:1', 'ultima7-klog-and-blacksmith:5')),
    continuity: a(p('ultima7-royal-friendship:2'), p('ultima7-royal-court:3'), p('ultima7-hook-and-escape:3')),
    topics: a(p('ultima7-investigation-magic:7'), p('ultima7-guide-only-lore:6', 'ultima7-guide-only-lore:7'), p(`${u7}:8`, `${u7}:9`, `${u7}:10`, `${u7}:11`)),
    names: a(p('ultima7-royal-friendship:7', 'ultima7-practical-spells:7'), p('ultima7-time-lord-and-guardian:1', 'ultima7-time-lord-and-guardian:2'), p(`${u7}:7`, `${u7}:11`)),
    boundaries: a(s('ultima7-time-lord-and-guardian:9', 'ultima7-investigation-magic:5'), s('ultima7-guide-only-lore:4', 'ultima7-guide-only-lore:5'), s(`${u7}:8`, `${u7}:9`)),
    unsupported: a(s('ultima7-practical-spells:8'), s('ultima7-restrictions-and-recovery:4', 'ultima7-restrictions-and-recovery:5'), s('ultima7-fellowship-origins:6', 'ultima7-hook-and-escape:6')),
  },
  alqadim: {
    lore: a(p('alqadim-manual-monsters:1'), p('alqadim-homecoming-and-banishment:1'), p('alqadim-family-identity-boundaries:1', 'alqadim-family-identity-boundaries:4')),
    travel: a(cell('ceiling-only', [`${aq}:3`, `${aq}:4`, `${aq}:5`], 'No Gentle exact-location record is authorized. The new branch checks refusal, retained location intent and complete-question recovery.'), p('alqadim-potion-shopping:6'), p('alqadim-town-guidance:2')),
    objectives: a(p(`${aq}:1`), p('alqadim-homecoming-and-banishment:1', `${aq}:6`), p('alqadim-family-sword-and-berries:2', `${aq}:9`)),
    mechanics: a(p('alqadim-shards-and-ricochets:3'), p('alqadim-desert-beasts:1'), p('alqadim-efreet-diplomacy:1')),
    relationships: a(cell('positive-witness', ['alqadim-manual-basics:4', `${aqExplain}:7`], 'Existing and new manual explanations explicitly link puzzles/goals/kills to experience and each new level to increased HP. Plot motives and lower-level family identities remain separate.'), cell('positive-witness', [`${aqExplain}:1`, `${aqExplain}:3`], 'Explicit XP and maximum-HP mechanisms are explanations, not inferred motivations or quest procedures.'), p('alqadim-homecoming-and-banishment:6', 'alqadim-family-identity-boundaries:4', `${aqExplain}:8`)),
    continuity: a(p('alqadim-shards-and-ricochets:4'), p('alqadim-potion-shopping:2'), p('alqadim-family-identity-boundaries:2')),
    topics: a(s('alqadim-research-boundaries:3', 'alqadim-research-boundaries:4', 'alqadim-research-boundaries:5'), p(`${aq}:6`, `${aq}:7`), p('alqadim-conflicts-and-false-premises:6', 'alqadim-conflicts-and-false-premises:8')),
    names: a(p('alqadim-shards-and-ricochets:6', 'alqadim-spoilers-and-recovery:4'), p(`${aq}:7`), p(`${aq}:10`)),
    boundaries: a(s('alqadim-research-boundaries:2', 'alqadim-research-boundaries:3', 'alqadim-family-identity-boundaries:8'), s('alqadim-desert-beasts:5'), s('alqadim-conflicts-and-false-premises:1', 'alqadim-conflicts-and-false-premises:2')),
    unsupported: a(s('alqadim-manual-basics:8'), s('alqadim-undead-and-slime:7'), s('alqadim-conflicts-and-false-premises:3', 'alqadim-conflicts-and-false-premises:4', `${aq}:11`)),
  },
  starcraft: {
    lore: a(p('starcraft-remastered-without-launcher:2'), p('starcraft-example-bot-attribution:1'), p('starcraft-resources-navigation:4')),
    travel: a(p('starcraft-schnail-first-setup:5'), p('starcraft-bwai-detection:1'), p('starcraft-map-installation:3')),
    objectives: a(p('starcraft-schnail-first-setup:3'), p('starcraft-bwapi-loading-checks:1'), p('starcraft-map-installation:4')),
    mechanics: a(p('starcraft-schnail-first-setup:3'), p('starcraft-bwapi-loading-checks:1'), p('starcraft-map-installation:4')),
    relationships: a(cell('positive-witness', ['starcraft-names-reset-and-help-levels:3'], 'Author attribution is a guide claim, not independently verified history.'), cell('positive-witness', ['starcraft-example-bot-attribution:2'], 'Guide attribution only; Steamhammer authorship accuracy remains a concrete source issue.'), p('starcraft-first-launch-cause:1')),
    continuity: a(p('starcraft-schnail-first-setup:2'), p('starcraft-bwai-detection:2'), p('starcraft-portable-files-and-settings:2')),
    topics: a(p('starcraft-crashes-and-support:3', 'starcraft-crashes-and-support:5'), p('starcraft-compare-the-options:2', 'starcraft-compare-the-options:5'), p('starcraft-resources-navigation:4', 'starcraft-resources-navigation:7')),
    names: a(p('starcraft-names-reset-and-help-levels:3', 'starcraft-names-reset-and-help-levels:5'), p('starcraft-bwai-detection:7'), p('starcraft-portable-files-and-settings:2')),
    boundaries: a(s('starcraft-names-reset-and-help-levels:2'), s('starcraft-research-versus-guide-only:2', 'starcraft-research-versus-guide-only:3'), s('starcraft-compatibility-conflict:1', 'starcraft-compatibility-conflict:3')),
    unsupported: a(s('starcraft-schnail-first-setup:7', 'starcraft-schnail-first-setup:8'), s('starcraft-java-prerequisite:7', 'starcraft-java-prerequisite:8'), s('starcraft-restrictions-and-false-premises:1', 'starcraft-restrictions-and-false-premises:2')),
  },
};

const fixtures = loadCampaigns();
const starcraftSnapshot = new URL('./evidence/conversation-starcraft-source-records.json', import.meta.url);
const sourceRecords = { ...allRecords, ...(fs.existsSync(starcraftSnapshot) ? { starcraft: JSON.parse(fs.readFileSync(starcraftSnapshot)) } : {}) };
const branches = new Set([alb, u5, u6, u7, aq, albExplain, u6Cause, aqExplain]);
const errors = [];
const review = { schemaVersion: 1, reviewDate: '2026-10-24', manualFamilyHelpMappingPerformed: true,
  familyHelpCoverageComplete: true, familyHelpMatrixReviewed: true, endToEndAcceptanceComplete: false,
  completionMeaning: 'Applicable family/help cells have a manually source-checked positive/structural witness or a narrow written source/policy ceiling. This is not exhaustive knowledge or final browser/native acceptance.',
  reviewScope: 'Manually chosen per-turn witnesses for five RPG corpora; local declared sources checked. StarCraft mapping supplied by the live-DOM reviewer and fixture help/decision references independently checked here. External citations retained, not independently re-fetched.',
  authoringCorrections: [
    { game: 'ultima5', turn: `${u5}:1`, originalQuestion: 'How do I restore the Shrine of Honesty?', question: 'Give me a hint for the Shrine of Honesty', reason: 'Gentle exposes a hint, not the how-to use/acquisition relation; explicitly asking for the supported hint preserves its original semantic claims.' },
    { game: 'ultima6', turn: `${u6}:1`, originalQuestion: 'How do I get the rune for the Shrine of Valor?', question: 'Give me a hint for the Shrine of Valor', reason: 'Gentle acquisition properly declines; explicitly asking for the declared hint is positive objective coverage. No refusal was reclassified as factual success.' },
    { game: 'ultima5', turns: [`${u5}:10`, `${u5}:12`], reason: 'An identity request uses companion:gwenno:explanation, not the relationship narrative. Both native texts contain the wife claim; the exact oracle now asserts the intended identity relation.' },
    { game: 'ultima6', turns: [`${u6}:5`, `${u6}:9`], reason: 'How-to acquisition selects the declared :use relation, not :hint. Both derive from gameData.quests[0].sections[2]; claims and ceilings are unchanged.' },
  ],
  distinctions: ['positive-witness proves one declared claim, not an entire family',
    'continuity/topics/names reuse claims and are not additional independent facts',
    'structural-witness proves a decision/boundary/reset, not factual knowledge',
    'ceiling-only applies only to the specified unavailable detail; no whole-family exemption',
    'partial-witness requires the written follow-up; it is not a passing completion gate'], games: {} };

for (const game of CAMPAIGN_GAMES) {
  const f = fixtures.find(f => f.gameId === game);
  if (!f) { review.games[game] = { status: 'not-authored', matrix: null }; continue; }
  const turns = new Map();
  for (const d of f.dialogues) {
    let tier = d.spoiler;
    for (const [i, t] of d.turns.entries()) {
      tier = t.options?.spoiler || tier;
      turns.set(`${d.id}:${i + 1}`, { ...t, effectiveHelp: tier });
    }
  }
  const mapped = reviewedMapping[game];
  const matrix = mapped ? Object.fromEntries(CAMPAIGN_FAMILIES.map(family => [family,
    Object.fromEntries(levels.map(tier => {
      const c = mapped[family][tier];
      const evidence = c.refs.map(ref => {
        const t = turns.get(ref);
        if (!t || t.effectiveHelp !== tier) errors.push(`${game}/${family}/${tier}: invalid reference ${ref}`);
        const e = t?.expected || {};
        const explicit = e.recordIds || [];
        const candidates = (sourceRecords[game] || []).filter(r => explicit.length ? explicit.includes(r.id) : e.entityIds?.includes(r.entityId))
          .map(r => authorize(r, tier)).filter(Boolean).filter(r => explicit.length || e.contains?.some(s => r.text.toLowerCase().includes(s.toLowerCase())))
          .map(r => ({ id: r.id, entityId: r.entityId, relation: r.narrative ? `narrative:${r.narrative.aspect}` : r.relation,
            text: r.text, source: r.source, matchedExpectedClaims: (e.contains || []).filter(s => r.text.toLowerCase().includes(s.toLowerCase())) }));
        return { id: ref, question: t?.text, expected: e, effectiveHelp: t?.effectiveHelp,
          evidenceType: e.decision === 'answer' ? ['continuity', 'topics', 'names'].includes(family) ? 'transition-with-sourced-answer' : 'sourced-answer' : 'structural-only',
          localSourceCandidates: candidates,
          candidateLimit: explicit.length ? 'Authored exact record oracle; local text and source checked.' : 'Possible declared source backing the assertion, not an independently fixed exact-record oracle.' };
      });
      return [tier, { ...c, evidence }];
    }))])) : null;
  const authored = [...turns.values()];
  const branchResults = allRecords[game] ? f.dialogues.filter(d => branches.has(d.id)).map(d => runConversation(d, game, allRecords[game])) : [];
  review.games[game] = { status: game === 'starcraft' ? 'delegated-family-review-complete-with-written-limits' : mapped ? 'family-review-complete-with-written-limits' : 'awaiting-live-DOM-review', fixtureSha256: hash(JSON.stringify(f)),
    ...(game === 'starcraft' && sourceRecords.starcraft ? { liveDOMSourceSnapshot: 'guides/tests/assistant/evidence/conversation-starcraft-source-records.json', sourceSnapshotSha256: hash(JSON.stringify(sourceRecords.starcraft)) } : {}),
    conversations: f.dialogues.length, turns: authored.length, minTurns: Math.min(...f.dialogues.map(d => d.turns.length)),
    maxTurns: Math.max(...f.dialogues.map(d => d.turns.length)), authoredAnswerTurns: authored.filter(t => t.expected.decision === 'answer').length,
    authoredStructuralTurns: authored.filter(t => t.expected.decision !== 'answer').length,
    exactRecordOracles: authored.filter(t => t.expected.recordIds?.length).length,
    exactSourceLocatorOracles: authored.filter(t => t.expected.sourceLocators?.length).length,
    exactSourceUrlOracles: authored.filter(t => t.expected.sourceUrls?.length).length,
    helpChanges: authored.filter(t => t.options?.spoiler).length,
    authoredContextChanges: authored.filter(t => t.options && Object.keys(t.options).some(k => k !== 'spoiler')).length,
    positiveLocationsAuthorized: sourceRecords[game] ? Object.fromEntries(levels.map(tier => [tier, sourceRecords[game].filter(r => r.relation === 'location' && authorize(r, tier)).length])) : null,
    matrix, addedBranchResults: branchResults };
}
review.referenceErrors = errors;
review.positiveCellsWithoutSourceWitness = Object.entries(review.games).flatMap(([game, g]) =>
  Object.entries(g.matrix || {}).flatMap(([family, tiers]) => Object.entries(tiers).flatMap(([tier, c]) =>
    c.status === 'positive-witness' && !c.evidence.some(e => e.expected.decision === 'answer' && e.localSourceCandidates.length)
      ? [`${game}/${family}/${tier}`] : [])));
review.familyHelpCoverageComplete = review.familyHelpMatrixReviewed = !errors.length
  && !review.positiveCellsWithoutSourceWitness.length
  && Object.values(review.games).every(g => g.matrix && g.addedBranchResults.every(d => d.passed));
const out = new URL('./evidence/conversation-coverage-review.json', import.meta.url);
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.writeFileSync(out, JSON.stringify(review, null, 2) + '\n');
  console.log(JSON.stringify({ games: Object.fromEntries(Object.entries(review.games).map(([g, v]) => [g,
    { conversations: v.conversations, turns: v.turns, status: v.status,
      addedBranchFailures: v.addedBranchResults?.flatMap(d => d.turns.filter(t => !t.passed)).length }])),
    referenceErrors: errors, positiveCellsWithoutSourceWitness: review.positiveCellsWithoutSourceWitness,
    familyHelpMatrixReviewed: review.familyHelpMatrixReviewed }, null, 2));
  if (!review.familyHelpMatrixReviewed) process.exitCode = 1;
}
