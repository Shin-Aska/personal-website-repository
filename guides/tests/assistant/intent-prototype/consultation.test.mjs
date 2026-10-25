// Structural controller/source-boundary tests. Supplied intent packets are not
// evidence of learned model accuracy; browser evaluation owns model evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createConsultation } from './consultation.mjs';
import { allRecords } from '../load-records.mjs';

const catalog = JSON.parse(fs.readFileSync(new URL('./consultation-catalog.json', import.meta.url)));
const starcraft = JSON.parse(fs.readFileSync(new URL('../evidence/conversation-starcraft-source-records.json', import.meta.url)));
const packet = { intent: 'comparison', modelIntent: 'comparison', restrictions: {} };
const make = (gameId = 'starcraft', extra = {}) => createConsultation({ gameId, records: gameId === 'starcraft' ? starcraft : allRecords.ultima7, catalog, ...extra });

test('Remastered preference conditionally selects native map and quotes its limits and separate-client alternative', () => {
    const c = make();
    const result = c.plan('I am playing StarCraft Remastered. Which one is the best, do you think?', packet, { spoiler: 'direct' });
    assert.equal(result.reply.decision, 'answer');
    assert.equal(result.focusEntityId, 'starcraft:remastered-map');
    assert.equal(result.criterionId, 'nativeRemastered');
    assert.match(result.reply.text, /For staying in StarCraft Remastered/);
    assert.match(result.reply.text, /Use Map Settings/);
    assert.match(result.reply.text, /limited to its own maps/);
    assert.match(result.reply.text, /If you instead prioritize more realistic AI, consider SCHNAIL/);
    assert.match(result.reply.text, /own version of Brood War/);
    assert.deepEqual(result.reply.stateChanges, []);
    assert.ok(result.reply.recordIds.length > 0);
    assert.ok(result.reply.sources.some(source => source.review === 'authored-from-guide' && source.basedOn));
    assert.ok(result.reply.recordIds.every(id => starcraft.some(record => record.id === id)));
    assert.doesNotMatch(result.reply.text, /universally best|current software compatibility|you already use/);
});

test('edition statements establish session preferences; informational lookup mentions do not', () => {
    const c = make();
    assert.equal(c.plan('What is StarCraft Remastered?', { modelIntent: 'identity' }), null);
    assert.equal(c.inspect().editionId, null);
    assert.equal(c.plan('Which should I use?', packet).reply.decision, 'clarify');
    assert.equal(c.plan('I am playing StarCraft Remastered.', { modelIntent: 'unknown' }), null);
    assert.equal(c.inspect().editionId, 'remastered');
    assert.equal(c.plan('Which should I use?', packet).focusEntityId, 'starcraft:remastered-map');
    assert.equal(c.plan('What is Brood War 1.16.1?', { modelIntent: 'identity' }), null);
    assert.equal(c.inspect().editionId, 'remastered');
    c.plan('I am playing Brood War 1.16.1.', { modelIntent: 'unknown' });
    assert.equal(c.inspect().editionId, '1.16.1');
    assert.equal(c.plan('Which option is best for offline?', packet, { spoiler: 'direct' }).focusEntityId, 'starcraft:bwai');
});

test('plain lookup and download follow-ups remain outside consultation', () => {
    const c = make();
    c.plan('I am playing Remastered. Which one is best?', packet);
    for (const text of ['download link', 'Where is SCHNAIL?', 'How do I install SCHNAIL?', 'What is the healing spell?'])
        assert.equal(c.plan(text, { intent: 'location', modelIntent: 'location' }), null, text);
});

test('no criterion or player context produces focused goal clarification', () => {
    const result = make().plan('Which one is best?', packet);
    assert.equal(result.reply.decision, 'clarify');
    assert.equal(result.reason, 'goal-required');
    assert.deepEqual(result.reply.recordIds, []);
    assert.equal(result.focusEntityId, undefined);
});

test('unknown editions, unsupported conditions, negations, quantities and hypotheticals cannot produce factual rankings', () => {
    for (const text of [
        'I am playing StarCraft II. Which one is best?',
        'I am playing Cosmic Edition. Which one is best?',
        'I am playing Remastered II. Which one is best?',
        'I am playing Remastered. Which option has the lowest price today?',
        'I am playing Remastered. Which option is best online?',
        'I am playing Remastered. Which option is not best?',
        'If I am playing Remastered, which one is best?',
        'I am playing Remastered. Which three options are best?'
    ]) {
        const result = make().plan(text, packet);
        assert.equal(result.reply.decision, 'clarify', text);
        assert.equal(result.focusEntityId, undefined);
        assert.deepEqual(result.reply.recordIds, []);
        assert.deepEqual(result.reply.sources, []);
        assert.deepEqual(result.reply.stateChanges, []);
    }
});

test('unsupported preferences remain unresolved across generic follow-ups until a fresh supported goal is stated', () => {
    const c = make();
    c.plan('I am playing Remastered.', { modelIntent: 'unknown' });
    assert.equal(c.plan('Which option has the lowest price today?', packet).reply.decision, 'clarify');
    assert.equal(c.plan('Which one should I use?', packet).reason, 'unresolved-condition');
    assert.equal(c.plan('Which one is best for native Remastered?', packet).focusEntityId, 'starcraft:remastered-map');
});

test('catalog-declared negative goal aliases are not converted into unmodeled negative facts', () => {
    const c = make();
    c.plan('I am playing Remastered.', { modelIntent: 'unknown' });
    const result = c.plan('Which one is best without an external launcher?', { ...packet, restrictions: { negation: true } });
    assert.equal(result.focusEntityId, 'starcraft:remastered-map');
    const blocked = c.plan('Which one is best without an external launcher?', { ...packet, blockReplay: true, restrictions: { negation: true, material: ['unmodeled'] } });
    assert.equal(blocked.reply.decision, 'clarify');
});

test('both games share source-verified trait selection; party recommendations do not recruit or report progress', () => {
    for (const [goal, entityId] of [['healing', 'ultima7:companion:jaana'], ['frontline', 'ultima7:companion:dupre'], ['ranged', 'ultima7:companion:iolo']]) {
        const result = make('ultima7').plan(`Which companion is best for ${goal}?`, packet);
        assert.equal(result.reply.decision, 'answer', goal);
        assert.equal(result.focusEntityId, entityId);
        assert.deepEqual(result.reply.stateChanges, []);
        assert.deepEqual(result.reply.actions, []);
        assert.match(result.reply.text, /Party Builder choices are a plan, not evidence/);
    }
    for (const text of ['Which companion is best for healing in Serpent Isle?', 'Which companion is best for morality?', 'Which companion is best for healing? Recruit them automatically.']) {
        const result = make('ultima7').plan(text, packet);
        assert.equal(result.reply.decision, 'clarify');
        assert.equal(result.focusEntityId, undefined);
        assert.deepEqual(result.reply.stateChanges, []);
    }
});

test('source-only restriction survives consultation and excludes external-research witnesses', () => {
    const records = structuredClone(allRecords.ultima7);
    const target = records.find(record => record.id === 'ultima7:companion:jaana:explanation');
    target.source.review = 'external-research';
    const c = make('ultima7', { records });
    const result = c.plan('Using only this guide, which companion is best for healing?', packet);
    assert.equal(result.reply.decision, 'clarify');
    assert.equal(c.inspect().guideOnly, true);
    assert.equal(c.plan('Which companion is best for healing?', packet).reply.decision, 'clarify');
});

test('catalog quotes are case insensitive, but missing text, conflict records, hidden witnesses and fake prose are rejected', () => {
    const raw = { id: 'fixture:trait', entityId: 'fixture:one', title: 'Veyra', aliases: [], kind: 'item', relation: 'explanation', minSpoiler: 'gentle',
        variants: { gentle: { text: 'Veyra supports a defensive role.' }, direct: { text: 'A different high-help passage.' } },
        source: { file: 'fixture.html', locator: '#veyra', review: 'extracted' } };
    const witness = { recordId: raw.id, variant: 'gentle', quote: 'VEYRA SUPPORTS A DEFENSIVE ROLE.' };
    const small = { games: { ultima7: { editions: [], criteria: [{ id: 'defense', label: 'defense', aliases: ['defense'] }], profiles: [{ entityId: raw.entityId, title: raw.title,
        witnesses: [witness], traits: [{ criterion: 'defense', value: true, witnesses: [witness] }], summaries: [{ text: witness.quote, witnesses: [witness] }], limitations: [], constraints: [] }] } } };
    const makeSmall = (record = raw, rules = small) => createConsultation({ gameId: 'ultima7', records: [record], catalog: rules });
    assert.equal(makeSmall().plan('Which option is best for defense?', packet, { spoiler: 'direct' }).focusEntityId, raw.entityId);
    for (const mutate of [record => { record.conflict = true; }, record => { record.variants.gentle.text = 'Different passage.'; }, record => { record.minSpoiler = 'direct'; }]) {
        const record = structuredClone(raw); mutate(record);
        assert.equal(makeSmall(record).plan('Which option is best for defense?', packet, { spoiler: 'gentle' }).reply.decision, 'clarify');
    }
    const fake = structuredClone(small); fake.games.ultima7.profiles[0].summaries[0].text = 'Veyra is universally best.';
    assert.equal(makeSmall(raw, fake).plan('Which option is best for defense?', packet).reply.decision, 'clarify');
});

test('help/reset isolate session preferences; inspect is detached and fallback origin is honest', () => {
    const c = make();
    const result = c.plan('I am playing Remastered. Which one is best?', { modelIntent: 'unknown' });
    assert.equal(result.routeOrigin, 'explicit-consultation');
    assert.equal(result.modelIntent, 'unknown');
    const state = c.inspect(); state.criterionIds.push('invented');
    assert.ok(!c.inspect().criterionIds.includes('invented'));
    c.plan('help', { modelIntent: 'unknown' });
    assert.equal(c.inspect().editionId, null);
    assert.equal(c.inspect().active, false);
    assert.equal(c.plan('Which one is best?', packet).reply.decision, 'clarify');
    c.reset(); assert.deepEqual(c.inspect().criterionIds, []);
});
