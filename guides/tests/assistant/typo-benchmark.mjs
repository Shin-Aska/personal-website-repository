// Typo benchmark for the local guide assistants. Offline, deterministic, Node built-ins only.
//
// For every name visible at a spoiler level it generates misspellings of several kinds, asks a natural question about
// the misspelt name, and classifies the reply:
//   auto    the reply names the right subject ("Did you mean <Title>?" or it answers the right entity)
//   choice  the right subject is among the offered choices
//   wrong   the reply names or answers a different subject (the costly outcome)
//   none    nothing was recognised (generic "could not find" or a menu)
// It also runs negative checks: ordinary words and gibberish must not be "corrected", and a misspelling of a name that is
// hidden at the current spoiler level must never reveal that name.
//
//   node guides/tests/assistant/typo-benchmark.mjs            # prints the report, writes typo-benchmark-results.json
//   BENCH_OUT=/some/path.json node ...                        # write elsewhere
//   BENCH_SPLIT=train|test                                    # use only half of the names (for weight fitting)
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const out = process.env.BENCH_OUT || new URL('typo-benchmark-results.json', import.meta.url).pathname;
const split = process.env.BENCH_SPLIT || 'all';
const LEVELS = ['gentle', 'balanced', 'direct'];
// Kinds that are proper names a visitor would type (matches what "did you mean" may suggest).
const NAME_KINDS = {
    person: ['companion', 'character', 'npc'], item: ['item', 'equipment'], spell: ['spell', 'shard'],
    monster: ['enemy', 'bestiary', 'monster'], place: ['place', 'location', 'city']
};
const QUESTIONS = {
    person: [n => `who is ${n}?`, n => `where is ${n}?`],
    item: [n => `where can I find ${n}?`, n => `what does ${n} do?`],
    spell: [n => `how do I cast ${n}?`, n => `what does ${n} do?`],
    monster: [n => `how do I beat ${n}?`, n => `where is ${n}?`],
    place: [n => `where is ${n}?`, n => `how do I get to ${n}?`]
};

// Small seeded generator so every run builds the same misspellings.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = text => [...text].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);
const KEYS = 'qwertyuiop asdfghjkl zxcvbnm'.split(' ');
const neighbours = ch => { for (const row of KEYS) { const i = row.indexOf(ch); if (i >= 0) return [row[i - 1], row[i + 1]].filter(Boolean); } return []; };
const VOWELS = 'aeiou';
const PHONETIC = [['c', 'k'], ['k', 'c'], ['ph', 'f'], ['f', 'ph'], ['y', 'i'], ['i', 'y'], ['ou', 'u'], ['u', 'ou'], ['ee', 'i'], ['ea', 'e'],
    ['sh', 'ch'], ['z', 's'], ['s', 'z'], ['x', 'ks'], ['ck', 'k'], ['w', 'v'], ['v', 'w'], ['oo', 'u'], ['ai', 'ay'], ['ae', 'e'], ['th', 't'], ['j', 'g'], ['g', 'j']];

// Each operator edits one word of the name (never its first letter unless the operator says so) and returns null when it
// cannot apply. Names are lower-cased for the edit and the original capitalisation of the first letter is restored.
const OPERATORS = {
    swapAdjacent(word, r) { if (word.length < 4) return null; const i = 1 + Math.floor(r() * (word.length - 2)); if (word[i] === word[i + 1]) return null; return word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2); },
    swapFar(word, r) { if (word.length < 5) return null; const i = 1 + Math.floor(r() * (word.length - 3)); const j = i + 2 + Math.floor(r() * (word.length - i - 2)); if (j >= word.length || word[i] === word[j]) return null; const a = [...word]; [a[i], a[j]] = [a[j], a[i]]; return a.join(''); },
    deleteLetter(word, r) { if (word.length < 5) return null; const i = 1 + Math.floor(r() * (word.length - 1)); return word.slice(0, i) + word.slice(i + 1); },
    doubleLetter(word, r) { if (word.length < 4) return null; const i = 1 + Math.floor(r() * (word.length - 1)); return word.slice(0, i + 1) + word[i] + word.slice(i + 1); },
    insertLetter(word, r) { if (word.length < 4) return null; const i = 1 + Math.floor(r() * (word.length - 1)); return word.slice(0, i) + 'abcdefghijklmnopqrstuvwxyz'[Math.floor(r() * 26)] + word.slice(i); },
    swapVowel(word, r) { const at = [...word].map((ch, i) => (i > 0 && VOWELS.includes(ch) ? i : -1)).filter(i => i >= 0); if (!at.length) return null; const i = at[Math.floor(r() * at.length)]; const v = VOWELS.replace(word[i], '')[Math.floor(r() * 4)]; return word.slice(0, i) + v + word.slice(i + 1); },
    keyboard(word, r) { if (word.length < 4) return null; const i = 1 + Math.floor(r() * (word.length - 1)); const n = neighbours(word[i]); if (!n.length) return null; return word.slice(0, i) + n[Math.floor(r() * n.length)] + word.slice(i + 1); },
    phonetic(word, r) { const options = PHONETIC.filter(([from]) => word.slice(1).includes(from)); if (!options.length) return null; const [from, to] = options[Math.floor(r() * options.length)]; const at = word.indexOf(from, 1); return word.slice(0, at) + to + word.slice(at + from.length); },
    dropVowel(word, r) { const at = [...word].map((ch, i) => (i > 0 && VOWELS.includes(ch) ? i : -1)).filter(i => i >= 0); if (word.length < 5 || !at.length) return null; const i = at[Math.floor(r() * at.length)]; return word.slice(0, i) + word.slice(i + 1); },
    firstLetter(word, r) { if (word.length < 4) return null; const n = neighbours(word[0]); if (!n.length) return null; return n[Math.floor(r() * n.length)] + word.slice(1); }
};

const ENGLISH = ['many', 'cover', 'version', 'cube', 'swing', 'nothing', 'village', 'castle', 'garden', 'master', 'power', 'water', 'stone', 'night', 'under', 'where', 'there', 'about', 'which', 'could', 'other', 'every', 'little', 'people', 'strong', 'bridge', 'forest', 'market', 'church', 'tower', 'guide', 'party', 'quest', 'items', 'magic', 'sword', 'shield', 'dragon', 'sister', 'mother', 'father', 'friend', 'enemy', 'secret', 'letter', 'number', 'second', 'before', 'after'];

const proseCache = new Map();
function visibleProse(game, level) {
    const key = `${game}|${level}`;
    if (!proseCache.has(key)) proseCache.set(key, allRecords[game].map(record => authorize(record, level)).filter(Boolean).map(r => `${r.title} ${r.text}`).join(' ').toLowerCase());
    return proseCache.get(key);
}
function visibleNames(game, level) {
    const seen = new Map();
    for (const record of allRecords[game]) {
        const r = authorize(record, level);
        if (!r || !r.title || r.title !== record.title && r.title.length < 3) continue;
        const group = Object.entries(NAME_KINDS).find(([, kinds]) => kinds.includes(r.kind))?.[0];
        if (!group) continue;
        const title = r.title.trim();
        if (/\d|[/&(),:;?!.]/.test(title) || title.split(/\s+/).length > 3 || title.length < 4) continue;
        if (!r.aliases.includes(r.title)) continue; // safe placeholder titles are not names
        if (!seen.has(r.entityId)) seen.set(r.entityId, { id: r.entityId, title, group });
    }
    return [...seen.values()];
}

const capital = (original, typo) => (original[0] === original[0].toUpperCase() ? typo[0].toUpperCase() + typo.slice(1) : typo);
function misspell(name, operator, r) {
    const words = name.split(' ');
    const order = words.map((w, i) => i).sort((a, b) => words[b].length - words[a].length);
    for (const i of order) {
        if (words[i].length < 4) continue;
        const edited = OPERATORS[operator](words[i].toLowerCase(), r);
        if (edited && edited !== words[i].toLowerCase()) { const copy = [...words]; copy[i] = capital(words[i], edited); return copy.join(' '); }
    }
    return null;
}

function classify(reply, target, entityOf) {
    const text = reply.text || '';
    const lead = [...text.matchAll(/Did you mean ([^?]+)\?/g)].map(m => m[1].trim());
    const ids = new Set([...(reply.recordIds || []).map(id => entityOf.get(id)).filter(Boolean), ...(reply.choices || []).map(c => c.id)]);
    const named = lead.length && lead.some(l => l.split(/ or |, /).some(part => part.trim().toLowerCase() === target.title.toLowerCase()));
    if (ids.has(target.id) && reply.decision === 'answer') return 'auto';
    if (named) return 'auto';
    if ((reply.choices || []).some(c => c.id === target.id)) return 'choice';
    if (lead.length || (reply.decision === 'answer' && ids.size)) return 'wrong';
    if ((reply.choices || []).length && !ids.has(target.id)) return 'wrong';
    return 'none';
}

const report = { split, games: {}, totals: {}, negatives: { englishWords: { asked: 0, suggested: [] }, gibberish: { asked: 0, suggested: [] }, leaks: { asked: 0, leaked: [] } }, examples: {} };
const add = (bucket, key, field) => { bucket[key] = bucket[key] || { n: 0, auto: 0, choice: 0, wrong: 0, none: 0 }; bucket[key].n++; bucket[key][field]++; };
const keepName = id => split === 'all' || (hash(id) % 2 === 0) === (split === 'train');

for (const game of Object.keys(allRecords)) {
    const entityOf = new Map(allRecords[game].map(r => [r.id, r.entityId]));
    const assistant = createAssistant({ gameId: game, records: allRecords[game] });
    const byLevel = Object.fromEntries(LEVELS.map(level => [level, visibleNames(game, level)]));
    const direct = byLevel.direct;
    report.games[game] = { names: Object.fromEntries(LEVELS.map(l => [l, byLevel[l].length])), byOperator: {}, byLevel: {}, byGroup: {} };
    for (const level of LEVELS) {
        const visible = new Set(byLevel[level].map(n => n.id));
        const visibleTitles = new Set(byLevel[level].map(n => n.title.toLowerCase()));
        for (const target of byLevel[level].filter(n => keepName(n.id))) {
            for (const operator of Object.keys(OPERATORS)) {
                const r = rng(hash(`${game}|${target.id}|${operator}`));
                const typo = misspell(target.title, operator, r);
                if (!typo || typo.toLowerCase() === target.title.toLowerCase() || visibleTitles.has(typo.toLowerCase())) continue;
                const text = QUESTIONS[target.group][hash(target.id + operator) % 2](typo);
                assistant.resetSession();
                const reply = assistant.answer(text, { spoiler: level });
                const outcome = classify(reply, target, entityOf);
                add(report.games[game].byOperator, operator, outcome);
                add(report.games[game].byLevel, level, outcome);
                add(report.games[game].byGroup, target.group, outcome);
                add(report.totals, operator, outcome);
                if (outcome === 'none' || outcome === 'wrong') {
                    const list = (report.examples[operator + ':' + outcome] ||= []);
                    if (list.length < 8) list.push({ game, level, asked: text, target: target.title, reply: reply.text.slice(0, 110) });
                }
            }
        }
        // Spoiler leak check: names hidden at this level, misspelt, must never appear in the reply.
        const hidden = direct.filter(n => !visible.has(n.id) && !visibleTitles.has(n.title.toLowerCase()) && keepName(n.id));
        for (const target of hidden.slice(0, 120)) {
            const r = rng(hash(`${game}|leak|${target.id}`));
            const typo = misspell(target.title, ['swapAdjacent', 'deleteLetter', 'doubleLetter'][hash(target.id) % 3], r);
            if (!typo) continue;
            assistant.resetSession();
            const reply = assistant.answer(QUESTIONS[target.group][0](typo), { spoiler: level });
            report.negatives.leaks.asked++;
            const shown = [reply.text, ...(reply.choices || []).map(c => c.label)].join(' ').toLowerCase();
            // A name that already appears in visible prose (a hint that mentions the shopkeeper) is not hidden text.
            if (shown.includes(target.title.toLowerCase()) && !visibleProse(game, level).includes(target.title.toLowerCase()))
                report.negatives.leaks.leaked.push({ game, level, asked: typo, hidden: target.title, reply: reply.text.slice(0, 120) });
        }
    }
    // Negative checks at Direct: real words and gibberish must never be "corrected" into a name.
    const exact = new Set(direct.flatMap(n => n.title.toLowerCase().split(' ')));
    for (const word of ENGLISH.filter(w => !exact.has(w))) {
        assistant.resetSession();
        const reply = assistant.answer(`who is ${word}?`, { spoiler: 'direct' });
        report.negatives.englishWords.asked++;
        if (/Did you mean/.test(reply.text)) report.negatives.englishWords.suggested.push({ game, word, reply: reply.text.slice(0, 100) });
    }
    const r = rng(hash(game + 'gibberish'));
    for (let i = 0; i < 60; i++) {
        const length = 4 + Math.floor(r() * 6);
        const word = [...Array(length)].map(() => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(r() * 26)]).join('');
        assistant.resetSession();
        const reply = assistant.answer(`where is ${word}?`, { spoiler: 'direct' });
        report.negatives.gibberish.asked++;
        if (/Did you mean/.test(reply.text)) report.negatives.gibberish.suggested.push({ game, word, reply: reply.text.slice(0, 100) });
    }
}

const rate = (b, f) => (b.n ? (100 * (b[f] || 0) / b.n).toFixed(1) : '-');
const summary = { n: 0, auto: 0, choice: 0, wrong: 0, none: 0 };
for (const b of Object.values(report.totals)) for (const k of Object.keys(summary)) summary[k] += b[k];
report.summary = { ...summary, recovered: summary.auto + summary.choice, recoveredPct: Number((100 * (summary.auto + summary.choice) / summary.n).toFixed(1)),
    autoPct: Number((100 * summary.auto / summary.n).toFixed(1)), wrongPct: Number((100 * summary.wrong / summary.n).toFixed(2)) };
fs.writeFileSync(out, JSON.stringify(report, null, 1) + '\n');
console.log(`split=${split}  misspellings=${summary.n}  recovered=${report.summary.recoveredPct}% (auto ${report.summary.autoPct}%)  wrong=${report.summary.wrongPct}%  none=${rate(summary, 'none')}%`);
console.log('operator'.padEnd(16), 'n'.padStart(6), 'auto%'.padStart(7), 'choice%'.padStart(8), 'wrong%'.padStart(7), 'none%'.padStart(7));
for (const [op, b] of Object.entries(report.totals)) console.log(op.padEnd(16), String(b.n).padStart(6), rate(b, 'auto').padStart(7), rate(b, 'choice').padStart(8), rate(b, 'wrong').padStart(7), rate(b, 'none').padStart(7));
console.log(`negatives: english words suggested ${report.negatives.englishWords.suggested.length}/${report.negatives.englishWords.asked}; gibberish suggested ${report.negatives.gibberish.suggested.length}/${report.negatives.gibberish.asked}; hidden-name leaks ${report.negatives.leaks.leaked.length}/${report.negatives.leaks.asked}`);
