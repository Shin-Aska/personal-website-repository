// Ultima VII simulation round: structural checks for the overlay facts (run with `node guides/tests/assistant/sim-ultima7-checks.mjs`).
// 1. Every statement quoted from the guide page occurs verbatim in guides/Ultima7.html.
// 2. Every quest sentence and every topic resolves to guide text; a topic answer equals its facts joined verbatim.
// 3. A subject that exists only above the selected spoiler level gets the same reply as a subject that does not exist.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { u7, u7Markers, allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const here = file => new URL(file, import.meta.url);
const overlay = JSON.parse(fs.readFileSync(here('../../data/assistant/ultima7.json')));
const html = fs.readFileSync(here('../../Ultima7.html'), 'utf8');
const pageText = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ');
const plain = value => String(value || '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').trim();
const failures = [];
const check = (id, fn) => { try { fn(); } catch (error) { failures.push(`${id}: ${error.message}`); } };

// 1 + 2: facts
const records = allRecords.ultima7;
for (const [key, def] of Object.entries(overlay.facts)) check(`fact ${key}`, () => {
    if (def.page) {
        for (const part of def.page.parts || [def.page.text]) assert.ok(pageText.includes(part), `page text not found: ${part}`);
    } else if (def.quest) {
        const [group, index] = def.quest;
        const body = plain(u7.DB[group][index].content || u7.DB[group][index].walkthrough);
        const start = body.indexOf(def.from);
        assert.ok(start >= 0 && body.indexOf(def.to, start) >= 0, `quest text not found: ${def.from}`);
    }
});
for (const topic of overlay.topics) check(`topic ${topic.id}`, () => {
    const record = records.find(r => r.id.startsWith(`ultima7:topic:${topic.id}:`));
    assert.ok(record, 'topic record missing (a fact could not be resolved)');
    assert.equal(record.source.index.review, 'authored-index');
    assert.ok(record.variants[topic.minSpoiler || 'gentle'].text.length > 10);
});

// 3: hidden versus absent
const make = () => createAssistant({ gameId: 'ultima7', records });
const visibleAt = level => new Set(records.map(r => authorize(r, level)).filter(Boolean).flatMap(r => [r.title, ...r.aliases].map(a => a.toLowerCase())));
for (const ceiling of ['gentle', 'balanced']) {
    const open = visibleAt(ceiling);
    const hidden = [...new Set(records.map(r => authorize(r, 'direct')).filter(r => r && !authorize(records.find(x => x.id === r.id), ceiling))
        .flatMap(r => r.aliases.map(a => a.toLowerCase())))].filter(alias => !open.has(alias) && alias.length > 3);
    for (const template of ['Where is %s?', 'Who is %s?']) {
        let checked = 0;
        for (const alias of hidden.filter(a => a.split(' ').length <= 3).slice(0, 400)) {
            const asked = make().answer(template.replace('%s', alias), { spoiler: ceiling });
            // Whatever a hidden subject's name shares with visible guide text (a town, a word) is visible; the hidden text itself never is.
            const texts = records.map(r => authorize(r, 'direct')).filter(r => r && r.text.length > 30);
            check(`${ceiling} ${alias}`, () => assert.ok(!texts.some(r => !authorize(records.find(x => x.id === r.id), ceiling) && asked.text.includes(r.text.slice(0, 30))), asked.text));
            checked++;
        }
        assert.ok(checked > 50, 'hidden aliases not exercised');
    }
}
for (const [hidden, absent] of [['Hook', 'Zxqvbn'], ['the soul cage', 'the quantum cage'], ['the Crown Jewel', 'the Quantum Jewel'], ['the wisp whistle', 'the quantum whistle'], ['Rudyom\'s Wand', 'Zxqvbn\'s Wand']])
    for (const template of ['Where is %s?', 'Who is %s?', 'How do I get %s?']) {
        const a = make().answer(template.replace('%s', hidden), { spoiler: 'gentle' });
        const b = make().answer(template.replace('%s', absent), { spoiler: 'gentle' });
        check(`identical ${hidden}`, () => { assert.equal(a.decision, b.decision); assert.equal(a.text, b.text); });
    }
if (failures.length) { console.log(failures.slice(0, 30).join('\n')); console.log(`${failures.length} failures`); process.exit(1); }
console.log(`ok: ${Object.keys(overlay.facts).length} facts, ${overlay.topics.length} topics checked; hidden aliases reveal nothing`);
