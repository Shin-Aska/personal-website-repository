import assert from 'node:assert/strict';
import test from 'node:test';
import { allRecords, albion, aq, u6 } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';
import { importAlbionProgress } from '../../js/assistant/adapters/albion.js';
import { importAlQadimProgress } from '../../js/assistant/adapters/alqadim.js';
import { ultima6Slug } from '../../js/assistant/adapters/ultima6.js';

const make = (gameId, getProgress = () => [], records = allRecords[gameId]) => createAssistant({ gameId, records, getProgress });
const options = { contextId: 'toronto-intro', spoiler: 'gentle' };
const group = albion.QUEST_LOG.find(g => g.id === options.contextId);
const steps = allRecords.albion.find(r => r.scope === options.contextId && r.checklist).checklist;
const progressFor = ids => ids.map(id => ({ id, value: true }));

for (const text of ['what now?', "I'm stuck", 'hint', 'i just started, what to do here?']) {
    test(`exact subjectless request: ${text}`, () => {
        const reply = make('albion').answer(text, options);
        assert.equal(reply.decision, 'answer');
        assert.deepEqual(reply.recordIds, [steps[0].recordId]);
        assert.match(reply.text, /First unticked step here \(0 of 5 done\)/);
        assert.equal(reply.choices.length, 4);
        assert.match(reply.text, /Checklist order is not a prerequisite/);
        assert.doesNotMatch(JSON.stringify(reply), /wall cabinet|1042|Beegle|next required/);
    });
}
for (const spoiler of ['gentle', 'balanced', 'direct']) {
    test(`out-of-order checkmarks, authorized quotation and remaining chips at ${spoiler}`, () => {
        const state = { [group.id]: { [group.items[0].id]: true, [group.items[3].id]: true } };
        const before = JSON.stringify(state);
        const a = make('albion', () => importAlbionProgress(albion.QUEST_LOG, state));
        const reply = a.answer('what now?', { ...options, spoiler });
        const wanted = authorize(allRecords.albion.find(r => r.id === steps[1].recordId), spoiler);
        assert.deepEqual(reply.recordIds, [wanted.id]);
        assert.ok(reply.text.includes(wanted.text));
        assert.match(reply.text, /2 of 5 done/);
        assert.deepEqual(reply.choices.map(c => c.id), [steps[2], steps[4]].map(s => allRecords.albion.find(r => r.id === s.recordId).entityId));
        assert.equal(JSON.stringify(state), before);
        assert.deepEqual(reply.stateChanges, []);
    });
}
test('all ticked is a checklist acknowledgement, not a game-completion claim', () => {
    const a = make('albion', () => progressFor(steps.map(s => s.completionFact)));
    const r = a.answer('hint', options);
    assert.equal(r.decision, 'clarify');
    assert.match(r.text, /All checklist steps here are ticked \(5 of 5 done\)/);
    assert.match(r.text, /historical reports/);
    assert.deepEqual(r.recordIds, []);
    assert.deepEqual(r.choices, []);
    assert.doesNotMatch(r.text, /finished the chapter|next required/);
});
test('only strict true checkbox reports count, and unrelated reports do not count', () => {
    const a = make('albion', () => [{ id: steps[0].completionFact, value: false }, { id: steps[1].completionFact, value: 1 }, { id: 'unrelated', value: true }]);
    const r = a.answer('hint', options);
    assert.match(r.text, /0 of 5 done/);
    assert.deepEqual(r.recordIds, [steps[0].recordId]);
});
test('session completion claims do not masquerade as ticked boxes', () => {
    const a = make('albion');
    a.answer('hint', options);
    assert.equal(a.answer('I already did that', options).decision, 'correction');
    assert.match(a.answer('what now?', options).text, /0 of 5 done/);
    assert.deepEqual(a.answer('hint', options).recordIds, [steps[0].recordId]);
});
test('fresh checkbox snapshot is read on every request', () => {
    let saved = [];
    const a = make('albion', () => saved);
    assert.deepEqual(a.answer('hint', options).recordIds, [steps[0].recordId]);
    saved = progressFor([steps[0].completionFact]);
    assert.deepEqual(a.answer('hint', options).recordIds, [steps[1].recordId]);
});
for (const text of ['what now on Mars?', 'hint without a weapon', 'hint in Albion Online', 'hint for 3 steps']) {
    test(`restrictions cannot become a checklist answer: ${text}`, () => {
        const r = make('albion').answer(text, options);
        assert.notEqual(r.decision, 'answer');
        assert.doesNotMatch(r.text, /First unticked|0 of 5/);
    });
}
for (const text of ['what now?', "I'm stuck", 'hint']) {
    test(`no section: ${text}`, () => {
        const r = make('albion').answer(text);
        assert.equal(r.text, 'Open a chapter, quest step or objective, or name a subject, so I can offer a hint.');
        assert.deepEqual(r.sources, []);
        assert.deepEqual(r.choices, []);
    });
}
test('named hint does not select a different checklist step', () => {
    const r = make('albion').answer('hint for Pistol', { ...options, spoiler: 'direct' });
    assert.deepEqual(r.recordIds, ['albion:item:pistol:hint']);
    assert.doesNotMatch(r.text, /First unticked/);
});
test('remaining chip answers the selected step; lowering help rejects the old chip', () => {
    const a = make('albion');
    const r = a.answer('what now?', { ...options, spoiler: 'direct' });
    const chip = r.choices[0];
    const picked = a.answer(chip.label, { ...options, spoiler: 'direct', choiceId: chip.id, expectedRevision: chip.revision });
    assert.deepEqual(picked.recordIds, [steps[1].recordId]);
    const fresh = a.answer('hint', { ...options, spoiler: 'direct' });
    a.setPolicy('gentle');
    assert.equal(a.answer(fresh.choices[0].label, { ...options, choiceId: fresh.choices[0].id, expectedRevision: fresh.revision }).decision, 'stale');
    assert.doesNotMatch(JSON.stringify(a.getHistory()), /1042|wall cabinet|Beegle/);
});
test('a prior conversation topic cannot replace the open checklist for what now', () => {
    const a = make('albion');
    a.answer('What is the Dreamshield?', options);
    assert.deepEqual(a.answer('what now?', options).recordIds, [steps[0].recordId]);
});
test('Ultima VI overview follows section-checkbox order and offers every remaining section', () => {
    const contextId = 'quest:act-i-liberating-the-shrines:overview';
    const manifest = allRecords.ultima6.find(r => r.scope === contextId && r.checklist).checklist;
    assert.equal(manifest.length, u6.gameData.quests[0].sections.length);
    const a = make('ultima6');
    const empty = a.answer('hint', { contextId });
    assert.equal(empty.choices.length, manifest.length - 1);
    assert.deepEqual(empty.recordIds, [manifest[0].recordId]);
    const progressed = make('ultima6', () => progressFor([manifest[0].completionFact, manifest[2].completionFact]));
    const r = progressed.answer('what now?', { contextId, spoiler: 'balanced' });
    assert.match(r.text, /2 of 8 done/);
    assert.deepEqual(r.recordIds, [manifest[1].recordId]);
});
test('Ultima VI open section has one checkbox, not one per walkthrough sentence', () => {
    const contextId = 'quest:act-i-liberating-the-shrines:sacrifice-minoc';
    const hint = allRecords.ultima6.find(r => r.scope === contextId && r.checklist);
    const a = make('ultima6', () => progressFor([hint.completionFact]));
    assert.match(a.answer("I'm stuck", { contextId }).text, /All checklist steps here are ticked \(1 of 1 done\)/);
});
test('Ultima VI side-quest checkbox is respected', () => {
    const contextId = `side-quest:${ultima6Slug(u6.gameData.sideQuests[0].title)}`;
    const hint = allRecords.ultima6.find(r => r.scope === contextId && r.checklist);
    assert.deepEqual(make('ultima6').answer('hint', { contextId }).recordIds, [hint.id]);
    assert.match(make('ultima6', () => progressFor([hint.completionFact])).answer('hint', { contextId }).text, /1 of 1 done/);
});
test('Al-Qadim checklist includes optional objectives in the page order', () => {
    const chapter = aq.DB.chapters[0];
    const contextId = `alqadim:chapter:${chapter.id}`;
    const objectives = [...chapter.required, ...chapter.optional];
    const state = Object.fromEntries(objectives.slice(0, -1).map(o => [o.id, true]));
    const r = make('alqadim', () => importAlQadimProgress(aq.DB, state)).answer('hint', { contextId, entityIds: [contextId], spoiler: 'direct' });
    assert.deepEqual(r.recordIds, [`alqadim:objective:${objectives.at(-1).id}:hint`]);
    assert.match(r.text, new RegExp(`${objectives.length - 1} of ${objectives.length} done`));
    assert.ok(r.text.includes(objectives.at(-1).text));
});
for (const spoiler of ['gentle', 'balanced']) {
    test(`Al-Qadim ${spoiler} keeps the authorized chapter hint, labelled honestly`, () => {
        const contextId = 'alqadim:chapter:4';
        const r = make('alqadim').answer('hint', { contextId, spoiler });
        assert.match(r.text, /A step-specific hint is not available at this help level. Section hint:/);
        assert.deepEqual(r.recordIds, [`${contextId}:hint`]);
        assert.ok(r.text.includes(authorize(allRecords.alqadim.find(r => r.id === `${contextId}:hint`), spoiler).text));
        assert.doesNotMatch(JSON.stringify(r), /Deadman's Reef|First unticked/);
        if (spoiler === 'gentle') assert.doesNotMatch(JSON.stringify(r), /Ship Orb/);
    });
}
test('explicit checklist array order survives shuffled records and reverse relevance', () => {
    const reversed = [...allRecords.albion].reverse();
    assert.deepEqual(make('albion', undefined, reversed).answer('hint', options).recordIds, [steps[0].recordId]);
});
test('hidden and absent first-step records produce identical replies, with no skipped step', () => {
    const chapter = allRecords.alqadim.find(r => r.id === 'alqadim:chapter:4:hint');
    const first = chapter.checklist[0].recordId;
    const absent = allRecords.alqadim.filter(r => r.id !== first);
    const opts = { contextId: chapter.scope, spoiler: 'gentle' };
    const hiddenReply = make('alqadim').answer('hint', opts);
    const absentReply = make('alqadim', undefined, absent).answer('hint', opts);
    assert.deepEqual(hiddenReply, absentReply);
});
test('withheld Al-Qadim objective never causes a jump to a later step', () => {
    const overlay = allRecords.alqadim.find(r => r.checklist?.some(step => !allRecords.alqadim.some(r => r.id === step.recordId)));
    assert.ok(overlay, 'real conflicting objective remains withheld');
    const index = overlay.checklist.findIndex(step => !allRecords.alqadim.some(r => r.id === step.recordId));
    const r = make('alqadim', () => progressFor(overlay.checklist.slice(0, index).map(s => s.completionFact)))
        .answer('hint', { contextId: overlay.scope, spoiler: 'direct' });
    assert.match(r.text, /A step-specific hint is not available/);
    assert.deepEqual(r.recordIds, [overlay.id]);
    assert.doesNotMatch(r.text, /First unticked/);
});
test('a conflicting first step is declined, not skipped', () => {
    const records = allRecords.albion.map(r => r.id === steps[0].recordId ? { ...r, conflict: true } : r);
    const r = make('albion', undefined, records).answer('hint', options);
    assert.equal(r.decision, 'decline');
    assert.match(r.text, /sources conflict/);
    assert.deepEqual(r.choices, []);
});
test('authorized section map actions survive a narrower step quotation', () => {
    const id = 'alqadim:chapter:1:hint';
    const records = allRecords.alqadim.map(r => r.id === id ? { ...r, variants: { ...r.variants,
        direct: { ...r.variants.direct, actions: [{ id: 'chapter-map:test', label: 'Open chapter map', minSpoiler: 'direct' }] }
    } } : r);
    const a = make('alqadim', undefined, records);
    const direct = a.answer('hint', { contextId: 'alqadim:chapter:1', spoiler: 'direct' });
    assert.equal(direct.actions[0].id, 'chapter-map:test');
    assert.equal(direct.sources.length, 2);
    assert.deepEqual(a.answer('hint', { contextId: 'alqadim:chapter:1', spoiler: 'gentle' }).actions, []);
    assert.doesNotMatch(JSON.stringify(a.getHistory()), /chapter-map:test/);
});
for (const broken of [() => { throw new Error('unreadable'); }, () => ({ invalid: true })]) {
    test('unavailable progress cannot be presented as zero ticked', () => {
        const r = make('albion', broken).answer('hint', options);
        assert.equal(r.decision, 'clarify');
        assert.match(r.text, /could not read the checklist/);
        assert.doesNotMatch(r.text, /0 of/);
    });
}
