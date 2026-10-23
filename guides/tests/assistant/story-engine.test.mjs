// Fictional story-engine acceptance tests. Node built-ins only; no game lore,
// shared fixtures, reports, browser assets, or saved progress are written.
// Run: node --test guides/tests/assistant/story-engine.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { buildStoryRecords, storyRecordIssues } from '../../js/assistant/topics.js';
import { authorize } from '../../js/assistant/policy.js';

const gameId = 'story-fixture';
const overlayFile = 'synthetic/story-overlay.json';
const sourceFile = 'synthetic/story-guide.txt';
const texts = {
    harbor: 'In the Harbor case, Orrin murdered Vale.',
    harborSuspect: 'In the Harbor case, Sera was suspected of the murder, but was never confirmed as its perpetrator.',
    quarry: 'In the Quarry case, Vale murdered Leto.',
    leader: 'Sera leads the Lantern Order.',
    member: 'Orrin is a member of the Lantern Order.',
    accusation: 'In the Market accusation, Nima was the victim of a false theft accusation.',
    tower: 'In the Tower murder case, Sera is a suspect, and the killer has not been confirmed.',
    river: 'In the River murder case, an unnamed attacker killed Vela.',
    clue: 'The Garden case mentions a murder, a dagger, Orrin, and Vale; it does not identify a perpetrator or a victim.',
    secret: 'In the Cinder murder case, Zorath murdered Umber.',
};
const facts = new Map(Object.entries(texts).map(([id, text]) => [id, {
    text, source: { file: sourceFile, locator: `facts[${id}]` },
}]));
const subjects = {
    harbor: ['Harbor Murders', ['Harbor case', 'Harbor']],
    quarry: ['Quarry Murders', ['Quarry case', 'Quarry']],
    lantern: ['Lantern Order', []],
    accusation: ['Market accusation', ['Market']],
    tower: ['Tower murder case', ['Tower case', 'Tower']],
    river: ['River murder case', ['River case', 'River']],
    secret: ['Cinder murder case', ['Cinder']],
};
const entity = id => `${gameId}:${id}`;
function definition(id, subject, role, people, context, from, extra = {}) {
    const [title, aliases] = subjects[subject];
    return {
        id, entityId: entity(subject), title, aliases,
        kind: subject === 'lantern' ? 'organization' : 'quest',
        minSpoiler: 'direct', overlayFile, from: [from],
        story: { role, people, context }, ...extra,
    };
}
const definitions = {
    harborKiller: definition('harbor-killer', 'harbor', 'perpetrator', ['Orrin'], ['Harbor case', 'Vale'], 'harbor'),
    harborVictim: definition('harbor-victim', 'harbor', 'victim', ['Vale'], ['Harbor case', 'Orrin'], 'harbor'),
    harborSuspect: definition('harbor-suspect', 'harbor', 'suspect', ['Sera'], ['Harbor case'], 'harborSuspect', {
        story: { role: 'suspect', people: ['Sera'], context: ['Harbor case'], qualifier: 'was suspected of the murder' },
    }),
    quarryKiller: definition('quarry-killer', 'quarry', 'perpetrator', ['Vale'], ['Quarry case', 'Leto'], 'quarry'),
    quarryVictim: definition('quarry-victim', 'quarry', 'victim', ['Leto'], ['Quarry case', 'Vale'], 'quarry'),
    leader: definition('lantern-leader', 'lantern', 'leader', ['Sera'], ['Lantern Order'], 'leader'),
    member: definition('lantern-member', 'lantern', 'member', ['Orrin'], ['Lantern Order'], 'member'),
    accusation: definition('market-victim', 'accusation', 'victim', ['Nima'], ['Market accusation'], 'accusation'),
    tower: definition('tower-suspect', 'tower', 'suspect', ['Sera'], ['Tower murder case'], 'tower', {
        story: { role: 'suspect', people: ['Sera'], context: ['Tower murder case'], qualifier: 'is a suspect' },
    }),
    river: definition('river-killer', 'river', 'perpetrator', [], ['River murder case', 'Vela'], 'river'),
    secret: definition('cinder-killer', 'secret', 'perpetrator', ['Zorath'], ['Cinder murder case', 'Umber'], 'secret'),
};
const coreDefinitions = ['harborKiller', 'harborVictim', 'harborSuspect', 'quarryKiller', 'quarryVictim', 'leader', 'member', 'accusation']
    .map(key => definitions[key]);
const records = buildStoryRecords(gameId, coreDefinitions, facts);
const idFor = key => `${gameId}:story:${definitions[key].id}:${definitions[key].story.role}`;
const direct = { spoiler: 'direct' };
const make = (defs = coreDefinitions, extraRecords = []) => createAssistant({
    gameId, records: [...buildStoryRecords(gameId, defs, facts), ...extraRecords],
});
function sourcedAnswer(reply, keys) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual([...reply.recordIds].sort(), keys.map(idFor).sort(), reply.text);
    assert.ok(reply.sources.length, 'factual answers need sources');
    for (const source of reply.sources) {
        assert.equal(source.file, sourceFile);
        assert.ok(source.locator);
        assert.equal(source.review, 'extracted');
        assert.equal(source.index?.file, overlayFile);
        assert.equal(source.index?.review, 'authored-index');
    }
    assert.deepEqual(reply.stateChanges, [], 'story questions never change progress');
    return reply;
}
function noFact(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}
function profile(subject) {
    const [title, aliases] = subjects[subject];
    return {
        id: `${entity(subject)}:explanation`, entityId: entity(subject), title, aliases,
        kind: 'quest', relation: 'explanation', requires: null,
        variants: { gentle: { text: `${title} is an investigation.` } },
        source: { file: sourceFile, locator: `profiles[${subject}]`, review: 'extracted' },
    };
}

test('fixture roles reuse subjects and preserve exact facts with authored provenance', () => {
    assert.deepEqual(storyRecordIssues(coreDefinitions, facts), []);
    assert.equal(records.length, coreDefinitions.length);
    for (const record of records) {
        const def = coreDefinitions.find(candidate => record.id === `${gameId}:story:${candidate.id}:${candidate.story.role}`);
        assert.equal(record.relation, 'story');
        assert.equal(record.entityId, def.entityId);
        assert.equal(record.kind, def.kind);
        assert.equal(record.variants.direct.text, def.from.map(key => facts.get(key).text).join('\n'));
        assert.deepEqual(authorize(record, 'direct').story, def.story);
        assert.equal(authorize(record, 'gentle'), null);
    }
});

for (const [question, keys] of [
    ['Who killed Vale?', ['harborKiller']],
    ['Who was Vale killed by?', ['harborKiller']],
    ['Whom did Vale kill?', ['quarryVictim']],
    ['Who did Orrin murder?', ['harborVictim']],
    ['Who is suspected in Harbor?', ['harborSuspect']],
    ['Who is the murderer in Harbor?', ['harborKiller']],
    ['Who leads the Lantern Order?', ['leader']],
    ['Who is the Lantern Order leader?', ['leader']],
    ['Who belongs to the Lantern Order?', ['member']],
    ['Who are the Lantern Order members?', ['member']],
]) test(`authored role and direction: ${question}`, () => sourcedAnswer(make().answer(question, direct), keys));

test('a single event answers a subjectless killer or participant question', () => {
    const defs = [definitions.harborKiller, definitions.harborVictim, definitions.harborSuspect];
    sourcedAnswer(make(defs).answer('Who is the murderer?', direct), ['harborKiller']);
    sourcedAnswer(make(defs).answer('Who murdered whom?', direct), ['harborKiller', 'harborVictim']);
});

test('a missing inverse is not inferred from a killer sentence or role', () => {
    const a = make([definitions.harborKiller]);
    noFact(a.answer('Whom did Orrin kill?', direct));
    assert.equal(a.inspect().claimCount, 0);
});

test('suspect fallback remains explicitly unconfirmed', () => {
    const reply = sourcedAnswer(make([definitions.tower]).answer('Who is the murderer?', direct), ['tower']);
    assert.match(reply.text, /suspect/i);
    assert.match(reply.text, /not (?:a )?confirmed (?:murderer|killer)|(?:killer|murderer|perpetrator).{0,35}not.{0,15}confirmed/i);
    sourcedAnswer(make([definitions.tower]).answer('Who is the suspect in Tower?', direct), ['tower']);
});

test('a research-only suspect is labeled and never attributed to the guide', () => {
    const url = 'https://example.invalid/fictional-story-source';
    const researchFacts = new Map([['tower', { text: texts.tower, source: {
        file: url, locator: 'Fictional source used only in this test', review: 'external-research',
        references: [{ url, label: 'Fictional research fixture', checkedAt: '2026-10-21' }],
    } }]]);
    const records = buildStoryRecords(gameId, [definitions.tower], researchFacts);
    const reply = createAssistant({ gameId, records }).answer('Who is the murderer?', direct);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, [idFor('tower')]);
    assert.match(reply.text, /Not in this guide.*outside research/i);
    assert.match(reply.text, /cited research records a suspect/i);
    assert.doesNotMatch(reply.text, /the guide records a suspect/i);
    assert.equal(reply.sources[0].review, 'external-research');
    assert.equal(reply.sources[0].references[0].url, url);
    assert.deepEqual(reply.stateChanges, []);
});

test('an anonymous authored perpetrator stays anonymous', () => {
    const reply = sourcedAnswer(make([definitions.river]).answer('Who killed Vela?', direct), ['river']);
    assert.match(reply.text, /unnamed attacker/);
    assert.doesNotMatch(reply.text, /Orrin|Sera|Vale|Leto/);
});

for (const button of [false, true]) test(`event clarification preserves the participant role through ${button ? 'button' : 'typed'} selection`, () => {
    const a = make();
    const prompt = noFact(a.answer('Who murdered who?', direct));
    assert.equal(prompt.decision, 'clarify');
    assert.deepEqual(new Set(prompt.choices.map(choice => choice.id)), new Set([entity('harbor'), entity('quarry')]));
    const choice = prompt.choices.find(candidate => candidate.id === entity('quarry'));
    const reply = button
        ? a.answer(choice.label, { choiceId: choice.id, expectedRevision: choice.revision })
        : a.answer('Quarry case');
    sourcedAnswer(reply, ['quarryKiller', 'quarryVictim']);
});

test('generic murderer clarification preserves the perpetrator role', () => {
    const a = make();
    const prompt = noFact(a.answer('Who is the murderer?', direct));
    assert.equal(prompt.decision, 'clarify');
    sourcedAnswer(a.answer('Harbor case'), ['harborKiller']);
});

test('selected entity or record resolves the subjectless question', () => {
    for (const selected of [entity('quarry'), idFor('quarryKiller')]) {
        sourcedAnswer(make().answer('Who is the murderer?', { ...direct, entityIds: [selected] }), ['quarryKiller']);
    }
});

test('conversation follows the event and isolates contexts and reset', () => {
    const a = make();
    sourcedAnswer(a.answer('Who killed Vale?', { ...direct, contextId: 'harbor-chat' }), ['harborKiller']);
    sourcedAnswer(a.answer('Who was killed?', { contextId: 'harbor-chat' }), ['harborVictim']);
    const isolated = noFact(a.answer('Who is the murderer?', { contextId: 'other-chat' }));
    assert.equal(isolated.decision, 'clarify');
    assert.equal(isolated.choices.length, 2);
    assert.equal(a.answer('reset topic', { contextId: 'harbor-chat' }).decision, 'reset');
    const reset = noFact(a.answer('Who was killed?', { contextId: 'harbor-chat' }));
    assert.equal(reset.choices.length, 2);
});

test('a guide profile can establish the current event without a role answer', () => {
    const a = make(coreDefinitions, [profile('harbor')]);
    const setup = a.answer('Tell me about Harbor case', direct);
    assert.equal(setup.decision, 'answer', setup.text);
    assert.deepEqual(setup.recordIds, [`${entity('harbor')}:explanation`]);
    assert.ok(setup.sources.every(source => source.file === sourceFile && source.review));
    assert.deepEqual(setup.stateChanges, []);
    sourcedAnswer(a.answer('Who is the murderer?'), ['harborKiller']);
});

test('bare event follow-up carries the requested direction', () => {
    const a = make();
    sourcedAnswer(a.answer('Who was killed in Harbor?', direct), ['harborVictim']);
    sourcedAnswer(a.answer('What about Quarry case?'), ['quarryVictim']);
});

test('generic victims include an accusation; homicide victims do not', () => {
    const a = make([definitions.accusation]);
    sourcedAnswer(a.answer('Who is the victim in the Market accusation?', direct), ['accusation']);
    noFact(make([definitions.accusation]).answer('Who was murdered?', direct));
    noFact(make([definitions.accusation]).answer('Who is the murder victim?', direct));
    const both = make([definitions.accusation, definitions.harborVictim]);
    sourcedAnswer(both.answer('Who was murdered?', direct), ['harborVictim']);
});

test('an organization member cannot supply its missing leader role', () => {
    noFact(make([definitions.member]).answer('Who leads the Lantern Order?', direct));
    noFact(make([definitions.leader]).answer('Who belongs to the Lantern Order?', direct));
});

for (const question of [
    'Who killed Vale on Mars?', 'Who killed Vale before the eclipse?',
    'Who killed Vale without a knife?', 'Who did Vale not kill?',
    'Who murdered 2 people in Harbor?', 'Who killed Vale in version 2.0?',
    'Who killed Vale in Serpent Isle?', 'Who leads the Lantern Order for free?',
]) test(`unsupported story restriction is retained: ${question}`, () => noFact(make().answer(question, direct)));

test('co-occurring names in a clue establish no directed relationship', () => {
    const clue = {
        id: `${gameId}:garden:hint`, entityId: entity('garden'), title: 'Garden case', aliases: ['Garden'],
        kind: 'quest', relation: 'hint', requires: null,
        variants: { gentle: { text: texts.clue } },
        source: { file: sourceFile, locator: 'facts[clue]', review: 'extracted' },
    };
    noFact(make(coreDefinitions, [clue]).answer('Who killed Vale in the Garden case?', direct));
    noFact(make([], [clue]).answer('Who was murdered in the Garden case?', direct));
});

test('conflicting source facts cannot become a factual story answer', () => {
    const conflicting = { ...definitions.harborKiller, conflict: true };
    const reply = noFact(make([conflicting, definitions.harborVictim]).answer('Who murdered whom in Harbor?', direct));
    assert.equal(reply.decision, 'decline');
    assert.ok(reply.recordIds.includes(idFor('harborKiller')));
});

test('the builder drops missing, ungrounded, and unsourced roles', () => {
    const missingSource = new Map(facts);
    missingSource.set('harbor', { text: texts.harbor, source: { file: sourceFile } });
    assert.deepEqual(buildStoryRecords(gameId, [definitions.harborKiller], missingSource), []);
    assert.ok(storyRecordIssues([definitions.harborKiller], missingSource).length);
    const ungrounded = { ...definitions.harborKiller, story: { role: 'perpetrator', people: ['Invented villain'], context: ['Harbor case'] } };
    for (const def of [ungrounded, { ...definitions.harborKiller, from: ['absent'] },
        { ...definitions.harborKiller, minSpoiler: undefined }, { ...definitions.harborKiller, overlayFile: undefined }]) {
        assert.deepEqual(buildStoryRecords(gameId, [def], facts), []);
        assert.ok(storyRecordIssues([def], facts).length);
    }
});

test('authorization rejects malformed provenance and ungrounded direct records', () => {
    const raw = records.find(record => record.id === idFor('harborKiller'));
    const ungrounded = { ...raw, story: { ...raw.story, people: ['Invented villain'] } };
    const unsourced = { ...raw, source: { ...raw.source, locator: '' } };
    const unreviewed = { ...raw, source: { ...raw.source, index: { ...raw.source.index, review: 'unreviewed' } } };
    for (const record of [ungrounded, unsourced, unreviewed]) {
        assert.equal(authorize(record, 'direct'), null);
        noFact(createAssistant({ gameId, records: [record] }).answer('Who is the murderer?', direct));
    }
});

test('authorized role metadata is copied rather than shared with the raw record', () => {
    const raw = structuredClone(records[0]);
    const visible = authorize(raw, 'direct');
    visible.story.people.push('Invented villain');
    visible.story.context.push('Invented case');
    assert.deepEqual(raw.story.people, ['Orrin']);
    assert.deepEqual(raw.story.context, ['Harbor case', 'Vale']);
});

test('a hidden story and an absent story are indistinguishable at Gentle', () => {
    const a = make([definitions.secret]);
    const hidden = noFact(a.answer('Who is the murderer in Cinder?'));
    const absent = noFact(make([]).answer('Who is the murderer in Nowhere?'));
    for (const key of ['decision', 'text', 'recordIds', 'sources', 'choices']) assert.deepEqual(hidden[key], absent[key], key);
    assert.doesNotMatch(JSON.stringify(hidden), /Zorath|Umber|cinder-killer/i);
    sourcedAnswer(a.answer('Who is the murderer in Cinder?', direct), ['secret']);
});

test('lowering spoilers hides earlier role facts and invalidates old choices', () => {
    const a = make([definitions.harborKiller, definitions.secret]);
    sourcedAnswer(a.answer('Who is the murderer in Cinder?', direct), ['secret']);
    // Latest conversation context now wins. Reset to request a fresh choice
    // before verifying that lowering spoilers invalidates that choice.
    a.resetTopic();
    const prompt = noFact(a.answer('Who is the murderer?', { entityIds: [entity('harbor'), entity('secret')] }));
    assert.equal(prompt.decision, 'clarify');
    const choice = prompt.choices.find(candidate => candidate.id === entity('secret'));
    assert.ok(choice);
    a.setPolicy('gentle');
    assert.doesNotMatch(JSON.stringify(a.getHistory()), /Zorath|Umber|cinder-killer/i);
    assert.equal(a.answer(choice.label, { choiceId: choice.id, expectedRevision: choice.revision }).decision, 'stale');
    const reply = noFact(a.answer('Who is the murderer?'));
    assert.doesNotMatch(JSON.stringify(reply), /Zorath|Umber|Cinder|cinder-killer/i);
});
