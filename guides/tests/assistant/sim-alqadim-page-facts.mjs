// Al-Qadim overlay integrity: every page fact is a verbatim passage of
// guides/AlQadim.html, every overlay topic became a record, and topic answers
// are the indexed facts joined verbatim. Node built-ins only.
//   node guides/tests/assistant/sim-alqadim-page-facts.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { allRecords, aq } from './load-records.mjs';

const here = file => new URL(file, import.meta.url);
const overlay = JSON.parse(fs.readFileSync(here('../../data/assistant/alqadim.json')));
const page = fs.readFileSync(here('../../AlQadim.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')
    .replace(/&rarr;/g, '→').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1');

for (const fact of overlay.pageFacts) for (const part of fact.verifyParts || [fact.text])
    assert.ok(page.includes(part), `page fact ${fact.id} is not on the page: ${part}`);

const objectives = new Map(aq.DB.chapters.flatMap(chapter => [...chapter.required, ...chapter.optional]).map(o => [o.id, o.text]));
const facts = new Map([...objectives].map(([id, text]) => [`obj:${id}`, text]).concat(overlay.pageFacts.map(f => [`pf:${f.id}`, f.text])));
for (const topic of overlay.topics) {
    const record = allRecords.alqadim.find(r => r.id === `alqadim:topic:${topic.id}:${topic.relation}`);
    assert.ok(record, `topic ${topic.id} produced no record (a fact key is missing or excluded)`);
    assert.equal(record.variants[topic.minSpoiler].text, topic.from.map(key => facts.get(key)).join('\n'), topic.id);
    assert.equal(record.source.index.review, 'authored-index', topic.id);
}
for (const id of overlay.excludedObjectives)
    for (const topic of overlay.topics) assert.ok(!topic.from.includes(`obj:${id}`), `${topic.id} indexes the withheld objective ${id}`);
console.log(`ok: ${overlay.pageFacts.length} page facts, ${overlay.topics.length} topics`);
