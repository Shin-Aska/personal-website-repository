import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from '../load-records.mjs';
import { createAssistant } from '../../../js/assistant/engine.js';
import { buildPacket } from './context.js';
import { guardPacket, finalizeGuarded } from './guarded.js';

function packet(question = 'Why is she cute?', { seed = ['Who is Arianna?'], spoiler = 'direct', reset = false } = {}) {
    const a = createAssistant({ gameId: 'ultima6', records: allRecords.ultima6 });
    for (const text of seed) a.answer(text, { spoiler: 'direct' });
    if (reset) a.resetTopic();
    a.setPolicy(spoiler);
    const history = a.getHistory();
    const baseline = a.answer(question, { spoiler });
    return buildPacket({ gameId: 'ultima6', records: allRecords.ultima6, history, baseline,
        question, spoiler, style: 'guarded' });
}
const p = packet();
const safeReply = finalizeGuarded('', p, p).text;

test('exact owner exchange becomes a missing-reason acknowledgement plus full guide quote and source', () => {
    assert.equal(p.route, 'model');
    assert.equal(p.guard.kind, 'reason');
    const r = finalizeGuarded('Her short hair makes her look like a baby.', p, p);
    assert.equal(r.acceptedModelWording, false);
    assert.equal(r.origin, 'program-fallback');
    assert.match(r.text, /I don't have a sourced explanation/);
    assert.match(r.text, /“Ariana: a cute little girl with short hair\.” \[G1\]/);
    assert.match(r.text, /Source: existing guide; extracted\. guides\/js\/Ultima6Atlas\.js — marker:Ariana/);
    assert.doesNotMatch(r.text, /baby|blue eyes|cotton dress/);
});
test('the explicit named Ariana question also works without history', () => {
    const named = packet('Why is Ariana cute?', { seed: [] });
    assert.equal(named.route, 'model');
    assert.equal(named.currentTopic, 'Ariana');
    assert.equal(named.guard.kind, 'reason');
});
test('all approved reason/detail/rephrase wording is accepted while sources remain program text', () => {
    for (const question of ['Why is she cute?', 'What colour are her eyes?', 'Can you put that briefly?']) {
        const c = packet(question);
        assert.equal(c.route, 'model');
        for (const frame of c.guard.frames) {
            const r = finalizeGuarded(frame, c, c);
            assert.equal(r.origin, 'model-framing');
            assert.equal(r.acceptedModelWording, true);
            assert.ok(r.text.startsWith(frame));
            assert.deepEqual(r.sources, c.excerpts.map(e => e.source));
            for (const e of c.excerpts) assert.ok(r.text.includes(`“${e.text}” [${e.id}]`));
        }
    }
});
for (const [name, raw] of [
    ['added cause', p.guard.frames[0] + ' Her short hair makes her look like a baby.'],
    ['added appearance', p.guard.frames[0] + ' She has blue eyes.'],
    ['false citation', p.guard.frames[0] + ' "She has blue eyes." [G1]'],
    ['question echo', 'Why is she cute?'],
    ['changed negation', 'I have a sourced explanation for that here.'],
    ['hidden control character', p.guard.frames[0] + '\u200b'],
    ['markup', '<img src=x onerror=alert(1)>'],
    ['progress promise', "I've marked that complete for you."],
    ['wrong approved category', "Here's the guide's wording."]
]) {
    test(`reject the whole generation, never just trim away an unsafe part: ${name}`, () => {
        const r = finalizeGuarded(raw, p, p);
        assert.equal(r.acceptedModelWording, false);
        assert.equal(r.text, safeReply);
    });
}
test('whitespace and curly apostrophes are formatting variants, not new fact authority', () => {
    const raw = ' \n ' + p.guard.frames[0].replaceAll("'", '’').replaceAll(' ', '\n') + ' \n ';
    assert.equal(finalizeGuarded(raw, p, p).acceptedModelWording, true);
});
test('packet cannot expand the private approved wording list', () => {
    const forged = structuredClone(p);
    forged.guard.frames.push('She has blue eyes.');
    assert.equal(finalizeGuarded('She has blue eyes.', forged, forged).acceptedModelWording, false);
});
test('lowering help after generation starts discards the old topic and quotes', () => {
    const low = packet('Why is she cute?', { spoiler: 'gentle' });
    const r = finalizeGuarded(p.guard.frames[0], p, low);
    assert.equal(r.rejectionReason, 'stale-or-missing-context');
    assert.deepEqual(r.sources, []);
    assert.doesNotMatch(r.text, /Ariana|cute|hair|marker:/);
});
test('reset and named topic switch also reject an in-flight result', () => {
    for (const current of [packet('Why is she cute?', { reset: true }), packet('Why is Iolo a bard?')]) {
        const r = finalizeGuarded(p.guard.frames[0], p, current);
        assert.equal(r.rejectionReason, 'stale-or-missing-context');
        assert.deepEqual(r.sources, []);
        assert.doesNotMatch(r.text, /Ariana|Iolo|hair/);
    }
});
test('missing current context fails closed', () => {
    assert.equal(finalizeGuarded(p.guard.frames[0], p).rejectionReason, 'stale-or-missing-context');
});
test('unknown/hidden/absent subjects do not acquire a source or call the model', () => {
    for (const c of [packet('Why is she cute?', { spoiler: 'gentle' }), packet('Why is Zorvax cute?')]) {
        const r = finalizeGuarded('She has blue eyes.', c, c);
        assert.equal(c.route, 'unknown');
        assert.equal(r.text, "I don't have an answer for that in this guide.");
        assert.deepEqual(r.sources, []);
    }
    const args = { gameId: 'ultima6', question: 'Why is Ariana cute?', spoiler: 'gentle', style: 'guarded' };
    assert.deepEqual(buildPacket({ ...args, records: allRecords.ultima6 }), buildPacket({ ...args, records: [] }));
});
test('progress requests receive a fixed capability reply with no model call or false completion', () => {
    const c = packet('Mark that completed.');
    assert.equal(c.route, 'fixed');
    assert.deepEqual(c.messages, []);
    assert.deepEqual(c.excerpts, []);
    assert.equal(finalizeGuarded('Done!', c, c).text,
        "Chat cannot change saved progress. Use the guide's checklist controls.");
});
test('existing supported answers retain the engine answer and its attribution', () => {
    const c = packet('Who is Iolo?');
    assert.equal(c.route, 'engine');
    const r = finalizeGuarded('Invent something.', c, c);
    assert.equal(r.origin, 'existing-engine');
    assert.ok(r.text.startsWith(c.reply));
    assert.match(r.text, /Source: existing guide;/);
});
test('a supported reason stays on the engine path', () => {
    const records = allRecords.ultima7;
    const a = createAssistant({ gameId: 'ultima7', records });
    const question = 'Why was Christopher killed?';
    const baseline = a.answer(question, { spoiler: 'direct' });
    const c = buildPacket({ gameId: 'ultima7', records, question, spoiler: 'direct', style: 'guarded', baseline });
    assert.equal(c.route, 'engine');
    assert.equal(finalizeGuarded('', c, c).origin, 'existing-engine');
    assert.doesNotMatch(finalizeGuarded('', c, c).text, /I don't have a sourced explanation/);
});
test('research quotes keep their outside-research attribution and direct reference', () => {
    const c = guardPacket({ style: 'topic', route: 'model', ceiling: 'direct', question: 'Why?',
        currentTopic: 'Example', conversation: [], excerpts: [{ id: 'G1', recordId: 'example', title: 'Example',
            text: 'A source sentence.', origin: 'Outside research (not in this guide)',
            source: { file: 'notes', locator: 'example', review: 'external-research',
                references: [{ label: 'Official manual', url: 'https://example.com/manual' }] } }] });
    const r = finalizeGuarded(c.guard.frames[0], c, c);
    assert.match(r.text, /“A source sentence\.” \[G1\]/);
    assert.match(r.text, /Outside research \(not in this guide\):/);
    assert.match(r.text, /Official manual — https:\/\/example.com\/manual/);
});
test('earlier hallucinations are blocked on every original model-invoked topic case', () => {
    const report = JSON.parse(fs.readFileSync(new URL('./evidence/topic-all-report.json', import.meta.url), 'utf8'));
    let checked = 0;
    for (const row of report.results.filter(r => r.response.responseKind === 'model')) {
        const c = guardPacket(row.packet);
        const r = finalizeGuarded(row.response.text, c, c);
        assert.equal(r.acceptedModelWording, false, row.id);
        assert.equal(r.origin, 'program-fallback', row.id);
        if (c.route === 'model') for (const e of c.excerpts) assert.ok(r.text.includes(`“${e.text}” [${e.id}]`));
        checked++;
    }
    assert.equal(checked, 23);
});
