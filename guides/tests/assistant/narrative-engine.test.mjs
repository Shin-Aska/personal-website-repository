// Fictional open-question acceptance tests. No game lore, shared fixtures,
// generated reports, browser assets or saved progress are written.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { buildNarrativeRecords, narrativeRecordIssues } from '../../js/assistant/topics.js';

const gameId = 'narrative-engine';
const guideFile = 'fictional/narrative-engine-guide.txt';
const overlayFile = 'fictional/narrative-engine-overlay.json';
const entity = name => `${gameId}:${name}`;
const direct = { spoiler: 'direct' };
const texts = {
    identity: 'Mira is the keeper of the Bronze Gate.',
    event: 'Mira opened the Bronze Gate during the festival.',
    cause: 'Mira opened the Bronze Gate because Nera needed shelter.',
    method: 'Mira opened the Bronze Gate using a silver key.',
    outcome: 'When Mira opened the Bronze Gate, Nera reached the shelter.',
    sequence: 'After Mira opened the Bronze Gate, Nera reached the shelter.',
    steps: "After Mira opened the Bronze Gate, the guide's next step is for Mira to visit the Watchtower.",
    relationship: 'Nera is the daughter of Mira.',
    purpose: 'Mira wants to protect the shelter by maintaining the Bronze Gate.',
    otherCause: 'Sera opened the Northern Gate because the procession needed a route.',
    otherMiraCause: 'Mira crossed the bridge because the ferry had stopped.',
    hired: 'Orrin hired Mira to repair the Bronze Gate.',
    founded: 'Mira founded the Lantern Order.',
    researchCause: 'Mira opened the Bronze Gate because Nera requested passage.',
    hedgedCause: 'Mira perhaps opened the Bronze Gate because Nera needed shelter.',
    disputedOne: 'Mira opened the Bronze Gate because Nera needed shelter.',
    disputedTwo: 'Mira opened the Bronze Gate because Sera ordered it.',
};
const facts = new Map(Object.entries(texts).map(([key, text]) => [key, {
    text, minSpoiler: 'direct', source: { file: guideFile, locator: `facts[${key}]`, review: 'extracted' },
}]));
for (const [key, url] of [
    ['researchCause', 'https://example.invalid/mira-research'],
    ['disputedOne', 'https://example.invalid/account-one'],
    ['disputedTwo', 'https://example.invalid/account-two'],
]) facts.set(key, { text: texts[key], minSpoiler: 'direct', source: {
    file: url, locator: `Research note ${key}`, review: 'external-research',
    references: [{ label: `Fictional account ${key}`, url, checkedAt: '2026-10-22' }],
} });

function definition(aspect, extra = {}) {
    return { id: aspect, entityId: entity('mira'), kind: 'npc', title: 'Mira', aliases: ['the gate keeper'],
        overlayFile, minSpoiler: 'direct', from: [aspect], narrative: {
            aspect, subjects: ['Mira'], context: ['Bronze Gate'],
            ...(['cause', 'method', 'outcome', 'sequence'].includes(aspect) ? { predicate: 'opened' } : {}),
            ...(aspect === 'sequence' ? { sequenceMode: 'events' } : {}),
        }, ...extra };
}
const definitions = {
    identity: definition('identity'),
    event: definition('event', { narrative: { aspect: 'event', subjects: ['Mira'], context: ['Bronze Gate'], predicate: 'opened' } }),
    cause: definition('cause'), method: definition('method'), outcome: definition('outcome'),
    sequence: definition('sequence'),
    steps: definition('sequence', { id: 'guide-steps', from: ['steps'],
        narrative: { aspect: 'sequence', subjects: ['Mira'], context: ['Bronze Gate'], predicate: 'opened', sequenceMode: 'steps' } }),
    relationship: definition('relationship', { entityId: entity('nera'), title: 'Nera', aliases: [],
        narrative: { aspect: 'relationship', subjects: ['Nera'], context: ['Mira'], predicate: 'daughter' } }),
    purpose: definition('purpose'),
    summary: definition('summary', { from: ['identity', 'event'],
        narrative: { aspect: 'summary', subjects: ['Mira'], context: ['Bronze Gate'] } }),
    otherCause: definition('cause', { id: 'sera-cause', entityId: entity('sera'), title: 'Sera', aliases: [], from: ['otherCause'],
        narrative: { aspect: 'cause', subjects: ['Sera'], context: ['Northern Gate'], predicate: 'opened' } }),
    otherMiraCause: definition('cause', { id: 'mira-bridge-cause', from: ['otherMiraCause'],
        narrative: { aspect: 'cause', subjects: ['Mira'], context: ['bridge'], predicate: 'crossed' } }),
    hired: definition('relationship', { id: 'hired-mira', entityId: entity('orrin'), title: 'Orrin', aliases: [], from: ['hired'],
        narrative: { aspect: 'relationship', subjects: ['Orrin'], context: ['Mira'], predicate: 'hired' } }),
    founded: definition('relationship', { id: 'founded-order', from: ['founded'],
        narrative: { aspect: 'relationship', subjects: ['Mira'], context: ['Lantern Order'], predicate: 'founded' } }),
    researchCause: definition('cause', { id: 'research-cause', from: ['researchCause'] }),
    hedgedCause: definition('cause', { id: 'hedged-cause', from: ['hedgedCause'],
        narrative: { aspect: 'cause', subjects: ['Mira'], context: ['Bronze Gate'], predicate: 'opened', status: 'hedged' } }),
    disputedCause: definition('cause', { id: 'disputed-cause', from: ['disputedOne', 'disputedTwo'],
        narrative: { aspect: 'cause', subjects: ['Mira'], context: ['Bronze Gate'], predicate: 'opened', status: 'disputed' } }),
};
const core = ['identity', 'event', 'cause', 'method', 'outcome', 'sequence', 'steps', 'relationship', 'purpose', 'summary'];
function profile(name, kind = 'npc') {
    const title = name[0].toUpperCase() + name.slice(1);
    return { id: `${entity(name)}:explanation`, entityId: entity(name), kind, title, aliases: [], relation: 'explanation',
        requires: null, variants: { balanced: { text: `${title} is recorded in the local guide.` } },
        source: { file: guideFile, locator: `profiles[${name}]`, review: 'extracted' } };
}
const profiles = [profile('mira'), profile('nera'), profile('sera')];
const make = (keys = core, extra = []) => createAssistant({ gameId,
    records: [...profiles, ...buildNarrativeRecords(gameId, keys.map(key => definitions[key]), facts), ...extra],
});
const idFor = key => `${gameId}:narrative:${definitions[key].id}:${definitions[key].narrative.aspect}`;
function sourced(reply, keys) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual([...reply.recordIds].sort(), keys.map(idFor).sort(), reply.text);
    assert.ok(reply.sources.length, 'each factual reply needs its provenance');
    for (const source of reply.sources) {
        assert.equal(source.index?.review, 'authored-index');
        assert.equal(source.index?.file, overlayFile);
        assert.ok(source.claims?.length);
        for (const claim of source.claims) {
            assert.ok(reply.text.includes(claim.text), 'the reply preserves the authored fact exactly');
            assert.ok(claim.source.file);
            assert.ok(claim.source.locator);
        }
    }
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}
function unsupported(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}

test('fictional records are explicit and validated before engine use', () => {
    assert.deepEqual(narrativeRecordIssues(Object.values(definitions), facts), []);
    assert.equal(buildNarrativeRecords(gameId, Object.values(definitions), facts).length, Object.keys(definitions).length);
});

test('a current location does not establish where a subject was found', () => {
    const location = text => ({ id: entity('vessel-location'), entityId: entity('vessel'), kind: 'item',
        title: 'Silver Vessel', aliases: [], relation: 'location', requires: null,
        variants: { direct: { text } }, source: { file: guideFile, locator: 'vessel.location', review: 'extracted' } });
    const current = make([], [location('The Silver Vessel is at the dock.')]);
    assert.equal(current.answer('Where is the Silver Vessel?', direct).decision, 'answer');
    unsupported(current.answer('Where was the Silver Vessel found?', direct));
    const discovery = make([], [location('The Silver Vessel was found at the ruined dock.')]);
    assert.equal(discovery.answer('Where was the Silver Vessel found?', direct).decision, 'answer');
});

test('action direction comes from a single claim, rather than co-occurring parties', () => {
    const assistant = make(['cause', 'outcome']);
    sourced(assistant.answer('Why did Mira open the Bronze Gate?', direct), ['cause']);
    unsupported(assistant.answer('Why did the Bronze Gate open Mira?', direct));
    unsupported(assistant.answer('What was the outcome of the Bronze Gate opening Mira?', direct));
    const withContext = make([], buildNarrativeRecords(gameId, [{ ...definitions.cause,
        narrative: { ...definitions.cause.narrative, context: ['Bronze Gate', 'Nera'] },
    }], facts));
    unsupported(withContext.answer('Why did Mira open Nera?', direct));
});

for (const [question, key] of [
    ['Who is Mira?', 'identity'],
    ['What happened to Mira?', 'event'],
    ['What happened at the Bronze Gate?', 'event'],
    ['Why did Mira open the Bronze Gate?', 'cause'],
    ['How did Mira open the Bronze Gate?', 'method'],
    ['What was the outcome of Mira opening the Bronze Gate?', 'outcome'],
    ['What happened after Mira opened the Bronze Gate?', 'sequence'],
    ['What is the next step after Mira opened the Bronze Gate?', 'steps'],
    ['What comes next in the guide after Mira opened the Bronze Gate?', 'steps'],
    ['How are Mira and Nera related?', 'relationship'],
    ["Who is Mira's daughter?", 'relationship'],
    ['What does Mira want?', 'purpose'],
    ['Summarize Mira.', 'summary'],
]) test(`the requested aspect selects only its authored record: ${question}`, () => sourced(make().answer(question, direct), [key]));

for (const question of [
    'Why did Mira kill Nera?', 'How did Mira kill Nera?',
    'What was the outcome of Mira killing Nera?',
    'What happened to Mira on Mars?', 'Why did Mira not open the Bronze Gate?',
    'Why did Mira open the Bronze Gate without a key?',
    'What does Mira want for free?',
    'Why did Mira open the Bronze Gate in the SNES version?',
    'Why did Mira open the Bronze Gate 2 times?',
    'How are Mira and Orrin related?',
    "Who is Nera's father?", "Who is Nera's daughter?",
    "Who is Mira's daughter on Mars?",
]) test(`no broad substitution or invented relationship: ${question}`, () => unsupported(make().answer(question, direct)));

test('a missing causal record cannot be substituted by an event description', () => {
    const reply = unsupported(make(['identity', 'event']).answer('Why did Mira open the Bronze Gate?', direct));
    assert.ok(!reply.text.includes(texts.event));
    assert.ok(!/spelling|higher spoilers|counter or cure|remedy/i.test(reply.text));
});

test('method and outcome cannot be inferred from the event text', () => {
    const a = make(['event']);
    unsupported(a.answer('How did Mira open the Bronze Gate?', direct));
    unsupported(a.answer('What was the outcome of Mira opening the Bronze Gate?', direct));
});

test('guide instructions cannot answer historical chronology', () => {
    unsupported(make(['steps']).answer('What happened after Mira opened the Bronze Gate?', direct));
    sourced(make(['steps']).answer('What is the next step after Mira opened the Bronze Gate?', direct), ['steps']);
});

test('historical chronology cannot answer the next guide instruction', () => {
    unsupported(make(['sequence']).answer('What is the next step after Mira opened the Bronze Gate?', direct));
    sourced(make(['sequence']).answer('What happened after Mira opened the Bronze Gate?', direct), ['sequence']);
});

test('summary preserves every sentence and each source claim without a new connective', () => {
    const reply = sourced(make(['summary']).answer('Summarize Mira.', direct), ['summary']);
    assert.ok(reply.text.includes(`${texts.identity}\n${texts.event}`));
    assert.equal(reply.sources[0].claims.length, 2);
});

test('existing identities remain answerable when no typed identity exists', () => {
    const reply = make([]).answer('Who is Mira?', direct);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, [`${entity('mira')}:explanation`]);
});

test('a sourced research cause remains labeled and cited', () => {
    const reply = sourced(make(['researchCause']).answer('Why did Mira open the Bronze Gate?', direct), ['researchCause']);
    assert.ok(reply.text.includes('Not in this guide — from outside research'));
    assert.equal(reply.sources[0].references[0].url, 'https://example.invalid/mira-research');
    assert.ok(!reply.text.includes('The guide records:'));
});

test('guide preference applies within the requested aspect', () => {
    sourced(make(['cause', 'researchCause']).answer('Why did Mira open the Bronze Gate?', direct), ['cause']);
    sourced(make(['event', 'researchCause']).answer('Why did Mira open the Bronze Gate?', direct), ['researchCause']);
});

test('guide-only wording excludes the researched cause', () => {
    unsupported(make(['researchCause']).answer('Why did Mira open the Bronze Gate according to the guide?', direct));
    sourced(make(['cause', 'researchCause']).answer('Why did Mira open the Bronze Gate according to the guide?', direct), ['cause']);
});

test('a leading guide-only restriction excludes researched causes', () => {
    unsupported(make(['researchCause']).answer('According to the guide, why did Mira open the Bronze Gate?', direct));
    sourced(make(['cause', 'researchCause']).answer('According to the guide, why did Mira open the Bronze Gate?', direct), ['cause']);
});

test('a leading guide-only restriction survives contextual why substitution', () => {
    const a = make(['event', 'researchCause']);
    sourced(a.answer('What happened to Mira?', direct), ['event']);
    unsupported(a.answer('According to the guide, why?', direct));
});

test('hedged evidence retains its uncertainty', () => {
    const reply = sourced(make(['hedgedCause']).answer('Why did Mira open the Bronze Gate?', direct), ['hedgedCause']);
    assert.ok(reply.text.includes('perhaps'));
});

test('disputed research retains both accounts and the citation attached to each', () => {
    const reply = sourced(make(['disputedCause']).answer('Why did Mira open the Bronze Gate?', direct), ['disputedCause']);
    assert.ok(/disput|conflict|differ/i.test(reply.text), 'the answer explicitly qualifies conflicting accounts');
    assert.deepEqual(reply.sources.flatMap(source => source.references.map(reference => reference.url)),
        ['https://example.invalid/account-one', 'https://example.invalid/account-two']);
    assert.deepEqual(reply.sources.flatMap(source => source.claims.map(claim => claim.source.references[0].url)),
        ['https://example.invalid/account-one', 'https://example.invalid/account-two']);
    assert.deepEqual(reply.sources.flatMap(source => source.claims.map(claim => claim.text)),
        [texts.disputedOne, texts.disputedTwo]);
});

test('a conflict flag prevents a factual answer', () => {
    const [record] = buildNarrativeRecords(gameId, [{ ...definitions.cause, conflict: true }], facts);
    unsupported(make([], [record]).answer('Why did Mira open the Bronze Gate?', direct));
});

for (const spoiler of ['gentle', 'balanced']) test(`hidden and absent narrative records behave identically at ${spoiler}`, () => {
    for (const question of ['Why did Mira open the Bronze Gate?', 'What happened to Mira?', "Who is Mira's daughter?"])
        assert.deepEqual(make(core).answer(question, { spoiler }), make([]).answer(question, { spoiler }));
});

test('why follow-up uses the grounded current event without inventing a new subject', () => {
    const a = make();
    sourced(a.answer('What happened to Mira?', direct), ['event']);
    sourced(a.answer('Why?', direct), ['cause']);
});

test('historical and guide-step follow-ups keep separate sequence modes', () => {
    const a = make();
    sourced(a.answer('What happened to Mira?', direct), ['event']);
    sourced(a.answer('What happened next?', direct), ['sequence']);
    sourced(a.answer('What is the next step?', direct), ['steps']);
});

test('a current subject without a cause does not jump to an unrelated visible cause', () => {
    const a = make(['event', 'otherCause']);
    sourced(a.answer('What happened to Mira?', direct), ['event']);
    const reply = unsupported(a.answer('Why?', direct));
    assert.ok(!reply.text.includes('procession'));
});

test('one named person can supply a personal pronoun', () => {
    const a = make();
    sourced(a.answer('Who is Mira?', direct), ['identity']);
    sourced(a.answer('Why did she open the Bronze Gate?', direct), ['cause']);
});

test('several visible events ask a focused question before a causal answer', () => {
    const reply = unsupported(make(['cause', 'otherCause']).answer('Why?', direct));
    assert.equal(reply.decision, 'clarify', reply.text);
    assert.ok(!reply.text.includes('needed shelter'));
    assert.ok(!reply.text.includes('needed a route'));
});

test('typed clarification retains the requested aspect', () => {
    const a = make(['cause', 'otherCause']);
    const pending = unsupported(a.answer('Why?', direct));
    assert.ok(pending.choices.length >= 2);
    sourced(a.answer('Mira', direct), ['cause']);
});

test('button clarification retains the requested aspect', () => {
    const a = make(['cause', 'otherCause']);
    const pending = unsupported(a.answer('Why?', direct));
    const choice = pending.choices.find(option => option.id === idFor('cause'));
    assert.ok(choice);
    sourced(a.answer(choice.label, { ...direct, choiceId: choice.id, expectedRevision: choice.revision }), ['cause']);
});

test('two actions on one subject use distinct record choices', () => {
    const a = make(['cause', 'otherMiraCause']);
    const pending = unsupported(a.answer('Why?', direct));
    assert.equal(pending.choices.length, 2);
    assert.deepEqual(new Set(pending.choices.map(choice => choice.id)), new Set([idFor('cause'), idFor('otherMiraCause')]));
    const choice = pending.choices.find(option => option.id === idFor('otherMiraCause'));
    sourced(a.answer(choice.label, { ...direct, choiceId: choice.id, expectedRevision: choice.revision }), ['otherMiraCause']);
});

test('a named action can resolve a pending same-subject clarification', () => {
    const a = make(['cause', 'otherMiraCause']);
    unsupported(a.answer('Why?', direct));
    sourced(a.answer('crossed', direct), ['otherMiraCause']);
});

test('source restrictions survive a change of subject', () => {
    const a = make(['researchCause', 'otherCause']);
    sourced(a.answer('Why did Sera open the Northern Gate according to the guide?', direct), ['otherCause']);
    const reply = unsupported(a.answer('What about Mira?', direct));
    assert.ok(!reply.text.includes('requested passage'));
});

test('lowering spoilers invalidates a pending narrative choice', () => {
    const a = make(['cause', 'otherCause']);
    const pending = unsupported(a.answer('Why?', direct));
    const choice = pending.choices[0];
    assert.ok(choice);
    const reply = a.answer(choice.label, { spoiler: 'gentle', choiceId: choice.id, expectedRevision: choice.revision });
    assert.equal(reply.decision, 'stale', reply.text);
    assert.ok(!reply.text.includes('needed shelter'));
    assert.ok(!reply.text.includes('needed a route'));
});

test('narrative answers never create session progress claims', () => {
    const a = make();
    for (const question of ['What happened to Mira?', 'Why?', 'Summarize Mira.']) a.answer(question, direct);
    assert.equal(a.inspect().claimCount, 0);
});

test('a generic actor question uses only its explicitly authored predicate and target', () => {
    const a = make(['hired', 'founded']);
    sourced(a.answer('Who hired Mira?', direct), ['hired']);
    sourced(a.answer('Who founded the Lantern Order?', direct), ['founded']);
});

for (const question of [
    'Who hired Orrin?', 'Who founded Mira?', 'Who employed Mira?',
    'Who founded the Bronze Gate?', 'Who hired Mira on Mars?',
    'Who hired Mira in the SNES version?',
    'Who hired Mira and Orrin?',
]) test(`generic actor requests do not infer a different relation: ${question}`, () => {
    unsupported(make(['hired', 'founded']).answer(question, direct));
});
