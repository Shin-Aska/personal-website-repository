// English paraphrase, multi-part and follow-up acceptance for the local
// assistants. Uses Node built-ins only. StarCraft cases are browser-only
// because its adapter extracts facts from the live guide DOM
// (see english-browser.py).
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { allRecords, albion, u5, u6, u7, aq, u7Markers } from './load-records.mjs';
import { authorize as authorizeRecord } from '../../js/assistant/policy.js';
import { missingTopicFacts } from '../../js/assistant/topics.js';
import { ultima5Facts } from '../../js/assistant/adapters/ultima5.js';
import { albionFacts } from '../../js/assistant/adapters/albion.js';
import { createAssistant, parse, materialTerms } from '../../js/assistant/engine.js';

const here = file => new URL(file, import.meta.url);
// sim-<game>-cases.json files (one per game, written by that game's simulation round) are picked up automatically.
const caseFiles = ['english-cases.json', 'knowledge-cases.json', 'owner-cases.json',
    ...fs.readdirSync(here('.')).filter(file => /^sim-[a-z0-9]+-cases\.json$/.test(file)).sort()];
const fixtures = caseFiles.map(file => JSON.parse(fs.readFileSync(here(file))));
const fixture = { questions: fixtures.flatMap(f => f.questions), dialogues: fixtures.flatMap(f => f.dialogues) };
const results = [], timings = [];
const make = game => createAssistant({ gameId: game, records: allRecords[game] });

function check(expect, actual) {
    const decisions = [expect.decision].flat();
    assert.ok(decisions.includes(actual.decision), `decision ${actual.decision}, expected ${decisions.join('|')}: ${actual.text}`);
    const text = actual.text.toLowerCase();
    for (const value of expect.contains || []) assert.ok(text.includes(value.toLowerCase()), `missing "${value}": ${actual.text}`);
    for (const value of expect.absent || []) assert.ok(!text.includes(value.toLowerCase()), `forbidden "${value}": ${actual.text}`);
    for (const id of expect.recordIds || []) assert.ok(actual.recordIds.includes(id), `missing record ${id}: ${JSON.stringify(actual.recordIds)}`);
    if (expect.parts) assert.deepEqual((actual.parts || []).map(p => p.decision), expect.parts, `parts: ${actual.text}`);
    if (expect.sourceRequired) assert.ok(actual.sources.length && actual.sources.every(s => s.file && s.review), 'source missing');
    if (expect.noChoices) assert.ok(!(actual.choices || []).length, `unexpected choices: ${JSON.stringify(actual.choices)}`);
    for (const label of expect.choicesInclude || []) assert.ok((actual.choices || []).some(choice => choice.label === label),
        `missing choice "${label}": ${JSON.stringify((actual.choices || []).map(choice => choice.label))}`);
    if (expect.stateChangeCount !== undefined) assert.equal(actual.stateChanges.length, expect.stateChangeCount, 'unexpected state change');
}
function turn(a, c) {
    const t = performance.now();
    const reply = a.answer(c.text, c.options || {});
    timings.push(performance.now() - t);
    check(c.expected, reply);
    return reply;
}
for (const c of fixture.questions.filter(q => !q.browserOnly)) {
    try { const reply = turn(make(c.gameId), c); results.push({ id: c.id, kind: 'question', split: c.split || 'paraphrase', pass: true, decision: reply.decision }); }
    catch (e) { results.push({ id: c.id, kind: 'question', split: c.split || 'paraphrase', pass: false, error: e.message }); }
}
for (const c of fixture.dialogues.filter(d => !d.browserOnly)) {
    try { const a = make(c.gameId); c.turns.forEach(t => turn(a, t)); results.push({ id: c.id, kind: 'dialogue', pass: true }); }
    catch (e) { results.push({ id: c.id, kind: 'dialogue', pass: false, error: e.message }); }
}
function invariant(id, fn) {
    try { fn(); results.push({ id, kind: 'invariant', pass: true }); }
    catch (e) { results.push({ id, kind: 'invariant', pass: false, error: e.message }); }
}
invariant('restrictions-survive-filler-removal', () => {
    const keep = [
        ['Any idea where I can find the pistol on Mars?', ['mars']],
        ['Could you help me get my hands on a pistol for free, please?', ['free']],
        ['Where is the pistol, not the shield?', ['not', 'shield']],
        ["Where can't I find the pistol?", ["can't"]],
        ['Where is the pistol without the key?', ['without', 'key']],
        ['Where is the pistol before chapter two?', ['before', 'chapter', 'two']],
        ['Where do I never find the pistol?', ['never']],
        ['Where is the pistol after the ending?', ['after', 'ending']],
        ['Where is the cheapest pistol?', ['cheapest']]
    ];
    for (const [text, terms] of keep) {
        const found = materialTerms(text, ['pistol']);
        for (const term of terms) assert.ok(found.includes(term), `${text}: lost ${term} (${found})`);
    }
    for (const text of ['Hey, any idea where I can find the pistol, please?', 'Can you point me towards the pistol?',
        'I need to get my hands on a pistol', 'Do you happen to know where the pistol is?'])
        assert.deepEqual(materialTerms(text, ['pistol']), [], text);
    assert.deepEqual(parse('Where is the pistol in version 2.0?').parts[0].editions, ['2.0']);
    assert.ok(parse('Where are 3 pistols?').q.includes('3'));
    assert.deepEqual(parse('Where is the pistol in Albion Online?', { editions: ['1995', 'pc'] }).parts[0].editions, ['albion online']);
});
invariant('subquestions-are-bounded-and-explicit', () => {
    assert.equal(parse('Where is Pistol and Dreamshield?').parts.length, 1);
    assert.equal(parse('Where can I buy the Dreamshield and what does it do?').parts.length, 2);
    assert.equal(parse('Where is it, what is it, how do I use it, and how do I get it?').tooMany, true);
    assert.equal(parse('How do I fight with Sira?').parts.length, 1);
});
invariant('i-meant-changes-subject-never-progress', () => {
    for (const text of ['Sorry, I meant the Pistol', 'No, I meant Dreamshield', 'I meant the Monster Eye—who sells it?', 'Oops, I mean the gun']) {
        const p = parse(text);
        assert.equal(p.correction, false, text);
        assert.ok(p.subject, text);
    }
    assert.equal(parse('I mean, where is it?').subject, null);
});
invariant('non-assertions-never-change-progress', () => {
    for (const text of ['If I had the pistol, where next?', 'I think I have the Dreamshield', '"I have the Pistol"',
        'My friend said I have the Pistol', 'I have the Pistol and the Dreamshield', 'I have the Pistol. Where is the Dreamshield?',
        'Suppose Khunag is in my party', 'I got the pistol, now what?', 'Sorry, I meant the pistol', 'What if I lost the pistol?',
        'Do I have the pistol?', 'I have the pistol?']) {
        const a = make('albion');
        a.answer('Where is the pistol?', { spoiler: 'direct' });
        const reply = a.answer(text, { spoiler: 'direct' });
        assert.equal(reply.stateChanges.length, 0, text);
        assert.equal(a.evidence.claims.size, 0, text);
    }
});
invariant('composite-carries-highest-spoiler-level', () => {
    const a = make('albion');
    const mixed = a.answer('How do I use Thorn Snare and where is the pistol?', { spoiler: 'balanced' });
    assert.equal(mixed.decision, 'answer');
    assert.deepEqual(mixed.parts.map(p => p.level), ['gentle', 'balanced']);
    assert.equal(mixed.level, 'balanced');
    assert.ok(mixed.text.includes('COM room'));
    a.setPolicy('gentle');
    const history = JSON.stringify(a.getHistory());
    assert.ok(!history.includes('COM room') && !history.includes('Immobilizes'), 'lowered history leaks composite text');
    const gentle = a.answer('How do I use Thorn Snare and where is the pistol?', { spoiler: 'gentle' });
    assert.equal(gentle.level, 'gentle');
    assert.ok(!gentle.text.includes('COM room'));
});
invariant('composite-keeps-each-source-and-conflict', () => {
    const a = make('albion');
    const reply = a.answer('Where can I buy the Dreamshield and what does it do?', { spoiler: 'direct' });
    assert.equal(reply.sources.length, 2);
    assert.ok(reply.sources.every(s => s.file && s.locator && s.review));
    const conflict = make('alqadim').answer('Where is the Gilded Dove and what does it do?', { spoiler: 'direct' });
    assert.ok(conflict.sources.length === 2 && conflict.sources.every(s => s.review === 'conflicting'));
});
invariant('descriptive-choice-is-stale-after-spoiler-change', () => {
    const a = make('albion');
    const reply = a.answer('What does the shield with sleep spores do?', { spoiler: 'direct' });
    assert.equal(reply.decision, 'clarify');
    assert.equal(reply.recordIds.length, 0, 'similar wording alone must not answer');
    assert.ok(reply.choices.length);
    a.setPolicy('gentle');
    const choice = reply.choices[0];
    assert.equal(a.answer(choice.label, { choiceId: choice.id, expectedRevision: choice.revision }).decision, 'stale');
    assert.equal(a.answer('yes', { spoiler: 'gentle' }).decision, 'clarify');
});
invariant('conversation-fields-cleared-on-reset-and-topic-change', () => {
    const a = make('albion');
    a.answer('Who is Tom and where can I find him?', { spoiler: 'direct', contextId: 'one' });
    let one = a.inspect().contexts.find(c => c.id === 'one');
    assert.ok(one.frame.length === 2 && one.lastRecords === 2);
    a.answer('Where is the pistol?', { spoiler: 'direct', contextId: 'two' });
    one = a.inspect().contexts.find(c => c.id === 'one');
    assert.ok(one.frame.length === 0 && one.lastRecords === 0 && one.entities === 0, JSON.stringify(one));
    a.answer('reset topic', { spoiler: 'direct', contextId: 'two' });
    const two = a.inspect().contexts.find(c => c.id === 'two');
    assert.ok(two.frame.length === 0 && two.lastRecords === 0 && two.entities === 0, JSON.stringify(two));
});
invariant('effect-mapping-is-adapter-explicit', () => {
    // Only Ultima VI equipment statistics, or an authored topic index whose
    // overlay lists the relationships it answers, may answer another relation.
    for (const [game, records] of Object.entries(allRecords)) for (const r of records.filter(r => r.answers?.length)) {
        const u6 = game === 'ultima6' && r.kind === 'item' && r.relation === 'explanation' && r.answers.join() === 'use';
        assert.ok(u6 || r.source?.index?.review === 'authored-index', r.id);
    }
    // No substitution elsewhere: an acquisition or hint fact never answers "what does it do?".
    assert.equal(make('albion').answer('What does the Monster Eye do?', { spoiler: 'direct' }).decision, 'decline');
    assert.equal(make('ultima5').answer('What does the Grapple do?', { spoiler: 'direct' }).decision, 'decline');
});
invariant('checklist-order-is-not-a-prerequisite', () => {
    const reply = make('ultima5').answer('What do I need before getting the Crown?', { spoiler: 'direct' });
    assert.notEqual(reply.decision, 'answer');
    const aq = make('alqadim').answer('What are the requirements for chapter 4?', { spoiler: 'direct' });
    assert.notEqual(aq.decision, 'answer');
});
invariant('visitor-text-is-stored-not-interpreted', () => {
    const a = make('albion');
    const payload = '<img src=x onerror=alert(1)> where is the pistol?';
    a.answer(payload, { spoiler: 'direct' });
    assert.equal(a.getHistory()[0].text, payload);
});
invariant('every-overlay-topic-resolves-to-guide-facts', () => {
    const overlay = game => JSON.parse(fs.readFileSync(here(`../../data/assistant/${game}.json`)));
    const facts = { ultima5: ultima5Facts({ chapters: u5.ultima5GrandQuestChapters, spells: u5.spellData, tips: u5.commonTips, words: u5.wordData, moongates: u5.moongatePhaseData, pageFacts: overlay('ultima5').pageFacts }),
        albion: albionFacts({ DB: albion.DB, tradeHints: albion.ALBION_TRADE_HINTS }) };
    for (const [game, map] of Object.entries(facts)) {
        assert.deepEqual(missingTopicFacts(overlay(game).topics, map), [], game);
        const built = allRecords[game].filter(r => r.source?.index?.locator?.startsWith('topics['));
        assert.equal(built.length, overlay(game).topics.length, game);
        // Topic answers are the indexed guide facts verbatim, nothing more.
        for (const topic of overlay(game).topics) {
            const record = built.find(r => r.id.startsWith(`${game}:topic:${topic.id}:`));
            assert.equal(record.variants[topic.minSpoiler || 'gentle'].text, topic.from.map(key => map.get(key).text).join('\n'), topic.id);
        }
    }
});
invariant('remedy-answers-only-declared-or-enemy-combat', () => {
    for (const records of Object.values(allRecords)) for (const r of records) {
        if (r.relation === 'remedy' || r.answers?.includes('remedy')) assert.ok(r.source?.index?.review === 'authored-index' || r.relation === 'remedy', r.id);
    }
    // A companion's combat strengths are not a way to counter that companion.
    assert.notEqual(make('albion').answer('How do I counter Sira?', { spoiler: 'direct' }).decision, 'answer');
});
invariant('research-is-labeled-cited-and-subordinate', () => {
    for (const records of Object.values(allRecords)) for (const r of records.filter(r => r.kind === 'research')) {
        assert.equal(r.source.review, 'external-research', r.id);
        assert.ok(r.source.references.every(ref => /^https:\/\//.test(ref.url) && ref.checkedAt && ref.label), r.id);
    }
    const reply = make('ultima5').answer('How do I level up?', { spoiler: 'gentle' });
    assert.ok(reply.text.startsWith('Not in this guide — from outside research: ') && reply.sources[0].review === 'external-research');
    // The guide's own fact wins over research about the same subject and relationship.
    const guide = { id: 'g:x:use', entityId: 'g:x', title: 'Widget', aliases: [], relation: 'use', requires: null,
        source: { file: 'guide', review: 'extracted' }, variants: { gentle: { text: 'Guide says turn it.' } } };
    const research = { ...guide, id: 'g:research:x:use', kind: 'research', source: { file: 'https://example.org', review: 'external-research', references: [] },
        variants: { gentle: { text: 'Research says push it.' } } };
    assert.equal(createAssistant({ gameId: 'g', records: [research, guide] }).answer('How do I use the Widget?').text, 'Guide says turn it.');
});
// Every character, monster, item, spell and quest entry in the guides' data
// must be reachable by its name at Direct. Exceptions are listed with reasons.
const coverage = {};
invariant('every-guide-entry-is-answerable', () => {
    const names = game => {
        const set = new Map();
        for (const r of allRecords[game]) {
            const a = authorizeRecord(r, 'direct');
            if (!a) continue;
            for (const n of [a.title, ...a.aliases]) {
                const key = String(n).toLowerCase();
                set.set(key, [...(set.get(key) || []), a.relation]);
            }
        }
        return set;
    };
    const strip = v => String(v).replace(/<[^>]*>/g, '').replace(/`/g, '').trim();
    const aqBlocked = JSON.parse(fs.readFileSync(here('../../data/assistant/alqadim.json'))).blockedItems;
    const sets = {
        albion: { characters: albion.DB.characters.map(c => c.name), equipment: albion.DB.equipment.map(e => e.name), bestiary: albion.DB.bestiary.map(b => b.name),
            spells: albion.DB.magic.flatMap(m => m.keySpells.map(k => k.name)), places: albion.DB.locations.flatMap(l => [l.name, ...(l.locations || []).map(x => x.name)]),
            chapters: albion.DB.chapters.map(c => c.title), acts: albion.ALBION_CAMPAIGN_MOVEMENTS.map(m => `Act ${m.number}: ${m.title}`) },
        ultima5: { companions: u5.companionData.map(c => c.Name), spells: u5.spellData.map(sp => strip(sp.Name)).filter(n => n.toUpperCase() !== 'AN SANCT'),
            objectives: u5.ultima5GrandQuestChapters.flatMap(c => c.objectives.map(o => o.title)), sideQuests: u5.ultima5SideQuests.map(q => q.title),
            virtues: u5.wordData.map(w => w.Virtue) },
        ultima6: { companions: u6.gameData.companions.map(c => c.name), equipment: u6.gameData.equipment.map(e => e.name), spells: u6.gameData.spells.map(sp => sp.name),
            dungeons: u6.gameData.dungeons.map(d => d.name), quests: u6.gameData.quests.flatMap(q => q.sections.map(sec => sec.heading)),
            sideQuests: u6.gameData.sideQuests.map(q => q.title), shrines: u6.gameData.shrines.map(sh => `Shrine of ${sh.virtue}`),
            lore: u6.gameData.passage.map(p => p.question), cheats: u6.gameData.cheats.map(c => c.title) },
        ultima7: { companions: u7.DB.companions.map(c => c.name), equipment: u7.DB.equipment.map(e => e.name), bestiary: u7.DB.bestiary.map(b => b.name),
            spells: u7.DB.spells.map(sp => sp.name), quests: [...u7.DB.mainQuest, ...u7.DB.virtueQuests].map(q => q.title), sideQuests: u7.DB.sideQuests.map(q => q.name),
            reagents: Object.keys(u7.DB.reagents.data) },
        alqadim: { keyItems: aq.DB.keyItems.map(i => i.name).filter(n => !aqBlocked.includes(n)),
            // Nameless One (Mage): strategy conflicts with Idrid's Veil and is withheld.
            bestiary: aq.DB.bestiary.map(b => b.name).filter(n => n !== 'Nameless One (Mage)'), moves: aq.DB.combatMoves.map(m => m.name),
            shards: aq.DB.moonstoneShards.map(m => m.name), shopItems: aq.DB.shops.flatMap(sh => sh.inventory.map(i => i.item)).filter(n => !aqBlocked.includes(n)),
            chapters: aq.DB.chapters.map(c => c.title) }
    };
    const missing = [];
    for (const [game, collections] of Object.entries(sets)) {
        const index = names(game);
        coverage[game] = {};
        for (const [collection, entries] of Object.entries(collections)) {
            const absent = entries.filter(n => !index.has(String(n).toLowerCase()));
            coverage[game][collection] = { entries: entries.length, answerable: entries.length - absent.length };
            missing.push(...absent.map(n => `${game}.${collection}: ${n}`));
        }
        coverage[game].npcs = allRecords[game].filter(r => r.kind === 'npc').length;
        coverage[game].totalRecords = allRecords[game].length;
    }
    assert.deepEqual(missing, []);
});
invariant('hidden-and-absent-subjects-get-identical-replies', () => {
    // Shadowsword exists only at Direct; Moonblade does not exist at all.
    const hidden = make('albion').answer('Where is the Shadowsword?', { spoiler: 'gentle' });
    const absent = make('albion').answer('Where is the Moonblade?', { spoiler: 'gentle' });
    assert.equal(hidden.decision, absent.decision);
    assert.equal(hidden.text, absent.text);
    // Every Ultima V companion answers alike at Gentle; none reveals its notes.
    const notes = u5.companionData.map(c => c.Notes);
    for (const companion of u5.companionData) {
        const reply = make('ultima5').answer(`Who is ${companion.Name}?`, { spoiler: 'gentle' });
        assert.equal(reply.text, `${companion.Name}: ${companion.Class}, level ${companion.Level}. The guide's notes on this companion appear when the help level is Full answer.`);
        assert.ok(!notes.some(note => reply.text.includes(note)));
    }
});
invariant('common-words-are-not-guessed-as-names', () => {
    const words = ['love', 'magic', 'armor', 'treasure', 'weather', 'king', 'castle', 'sword', 'moon', 'shop', 'boss', 'god', 'Jesus', 'Darth Vader'];
    for (const game of Object.keys(allRecords)) for (const word of words) for (const form of [`Who is ${word}?`, `What is ${word}?`, `Where is the ${word}?`]) {
        const reply = make(game).answer(form, { spoiler: 'direct' });
        assert.ok(!/Did you mean/.test(reply.text), `${game}: ${form} -> ${reply.text}`);
    }
});
const percentile = (values, p) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * p))];
const browserOnly = fixture.dialogues.filter(d => d.browserOnly).length + fixture.questions.filter(q => q.browserOnly).length;
invariant('named-atlas-npcs-are-never-swallowed-by-other-records', () => {
    // A topic or fact that merely reuses a person's name (Finnigan's gate password) must not hide that person's location.
    const names = [...new Set(u7Markers.filter(marker => marker.type === 'npc').map(marker => marker.name))];
    assert.ok(names.length > 200, 'atlas NPC names not loaded');
    const missing = names.filter(name => {
        const reply = make('ultima7').answer(`Where is ${name}?`, { spoiler: 'direct' });
        return reply.decision !== 'answer' || /Did you mean/.test(reply.text);
    });
    assert.deepEqual(missing, []);
});
invariant('agent-nouns-match-the-guides-base-word', () => {
    const a = make('ultima7');
    // "murderer" reaches the guide's "murder" and its sourced suspect clue, typed as a suspect (the guide names no murderer).
    const reply = a.answer('Who is the murderer?', { spoiler: 'direct' });
    assert.equal(reply.decision, 'answer');
    // Direct also has cited outside research naming the killers (Ultima Codex), attributed as research, never as the guide.
    assert.ok(reply.recordIds.includes('ultima7:story:trinsic-killers:perpetrator'), JSON.stringify(reply.recordIds));
    assert.match(reply.text, /Not in this guide — from outside research/);
    assert.match(reply.text, /Hook and Forskis/);
    assert.doesNotMatch(reply.text, /Hook is/);
    // The guide's own suspect clue stays a separate, qualified record.
    assert.match(a.answer('Who is the suspect in the Trinsic murders?', { spoiler: 'direct' }).text, /man with a hook/);
    // A word whose base the guide never uses offers nothing.
    assert.equal((a.answer('Who is the quiltmaker?', { spoiler: 'direct' }).choices || []).length, 0);
});
invariant('edition-only-conditions-restrict-the-question-but-progress-conditions-do-not', () => {
    const known = ['remastered', '1.16.1'];
    for (const text of ['Which do I choose if I have Starcraft Remastered?', 'If I have SCR, which option should I pick?', 'If I own the remastered version, which one is best?']) {
        const p = parse(text, { editions: known });
        assert.equal(p.hypothetical, false, text);
        assert.ok(p.parts.some(part => part.editions.includes('remastered')), text);
    }
    for (const text of ['Which do I choose if I have the Pistol?', 'If I have Remastered and the Pistol, which do I choose?'])
        assert.equal(parse(text, { editions: known }).hypothetical, true, text);
    assert.equal(parse('I have Starcraft Remastered, which one do I choose?', { editions: known }).parts.length, 1);
});
invariant('clarification-choices-never-repeat-a-label', () => {
    for (const [game, names] of [['ultima6', ['shrine of compassion', 'britain', 'cove']], ['ultima7', ['finnigan', 'britain']], ['albion', ['pistol']]])
        for (const name of names) for (const spoiler of ['gentle', 'balanced', 'direct']) for (const form of ['Where can I see the', 'Who is', 'Where is'].map(x => `${x} ${name}?`)) {
            const labels = (make(game).answer(form, { spoiler }).choices || []).map(choice => choice.label);
            assert.equal(new Set(labels).size, labels.length, `${game} ${spoiler} ${form}: ${labels}`);
        }
});
const report = { timestamp: new Date().toISOString(), runtime: process.version,
    questions: fixture.questions.filter(q => !q.browserOnly).length, dialogues: fixture.dialogues.filter(d => !d.browserOnly).length,
    browserOnlyDialogues: browserOnly, assertions: results.length, passed: results.filter(r => r.pass).length,
    failed: results.filter(r => !r.pass).length, coverage, performance: { warmComputeP95Ms: percentile(timings, 0.95) }, results };
fs.writeFileSync(here(process.env.ENGLISH_RESULTS || 'english-results.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, results: results.filter(r => !r.pass) }, null, 2));
process.exitCode = report.failed ? 1 : 0;
