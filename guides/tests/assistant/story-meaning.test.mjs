// Meaning-level regressions: an answer must identify who acted on whom, not
// merely contain the names in an undirected source paragraph.
// Run: node --test guides/tests/assistant/story-meaning.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { buildStoryRecords, storyRecordIssues } from '../../js/assistant/topics.js';
import { allRecords } from './load-records.mjs';

const direct = { spoiler: 'direct' };
const u7 = allRecords.ultima7;
const trinsic = 'ultima7:quest:the-trinsic-murders';
const u7Killer = 'ultima7:story:trinsic-killers:perpetrator';
const u7Victim = 'ultima7:story:trinsic-murder-victims:victim';
const u7Suspect = 'ultima7:story:trinsic-suspect:suspect';
const makeU7 = (records = u7) => createAssistant({ gameId: 'ultima7', records });

function line(text, label) {
    const matches = [...text.matchAll(new RegExp(`^${label}: ([^\\n]+)$`, 'gm'))];
    assert.equal(matches.length, 1, `one unambiguous ${label} line is required:\n${text}`);
    return matches[0][1].split(',').map(name => name.trim());
}

function roles(reply, killers, victims) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(line(reply.text, 'Killers'), killers, 'the actor line must contain only the authored killers');
    assert.deepEqual(line(reply.text, 'Victims'), victims, 'the recipient line must contain only the authored victims');
    assert.deepEqual(reply.stateChanges, []);
    assert.ok(reply.sources.length, 'the readable role lines still require source evidence');
    return reply;
}

function noFact(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}

function trinsicRoles(reply) {
    roles(reply, ['Hook', 'Forskis'], ['Inamo', 'Christopher']);
    assert.deepEqual(new Set(reply.recordIds), new Set([u7Killer, u7Victim]));
    const account = u7.find(record => record.id === u7Killer).variants.direct.text;
    assert.ok(reply.text.includes(account), 'the exact cited research paragraph is retained');
    assert.match(reply.text, /Not in this guide — from outside research:/);
    assert.doesNotMatch(reply.text, /^(?:Killers:.*(?:Inamo|Christopher)|Victims:.*(?:Hook|Forskis))$/m);
    for (const source of reply.sources) {
        assert.equal(source.review, 'external-research');
        assert.equal(source.index?.review, 'authored-index');
        assert.ok(source.references.some(reference => reference.url.includes('title=Inamo&oldid=154876')));
    }
    // The source identifies joint perpetrators, not each individual's fatal blow.
    assert.doesNotMatch(reply.text, /Hook (?:alone |personally |specifically )?killed Inamo|Forskis (?:alone |personally |specifically )?killed Christopher/);
    return reply;
}

for (const question of ['Who killed who?', 'Who killed whom?', 'Who murdered who?'])
    test(`the answer communicates both directed roles: ${question}`, () => {
        trinsicRoles(makeU7().answer(question, direct));
    });

test('latest Inamo conversation outranks an unrelated selected quest on every turn', () => {
    const bot = makeU7();
    const panel = { ...direct, entityIds: ['ultima7:quest:free-weston'] };
    const identity = bot.answer('Who is Inamo?', panel);
    assert.equal(identity.decision, 'answer', identity.text);
    assert.match(identity.text, /Gargoyle immigrant/);
    trinsicRoles(bot.answer('Who killed who?', panel));
});

test('a newer unrelated person blocks an older selected murder event', () => {
    const bot = makeU7();
    const panel = { ...direct, entityIds: [trinsic] };
    trinsicRoles(bot.answer('Who killed who?', panel));
    const identity = bot.answer('Who is Finnigan?', panel);
    assert.equal(identity.decision, 'answer', identity.text);
    const reply = noFact(bot.answer('Who killed who?', panel));
    assert.doesNotMatch(reply.text, /Hook|Forskis|Inamo|Christopher/);
});

test('a named subject remains latest when its requested relationship is declined', () => {
    const bot = makeU7();
    const panel = { ...direct, entityIds: [trinsic] };
    trinsicRoles(bot.answer('Who killed who?', panel));
    // More than one visible entry can match this name. Either ambiguity or
    // a missing relationship must replace the old event, not reuse it.
    noFact(bot.answer('Who killed Finnigan?', panel));
    const reply = noFact(bot.answer('Who killed who?', panel));
    assert.doesNotMatch(reply.text, /Hook|Forskis|Inamo|Christopher/);
    trinsicRoles(bot.answer('Who killed who in the Trinsic murders?', panel));
});

test('a declined narrative about a named person also replaces the older murder event', () => {
    const bot = makeU7();
    const panel = { ...direct, entityIds: [trinsic] };
    trinsicRoles(bot.answer('Who killed who?', panel));
    noFact(bot.answer('What happened to Finnigan?', panel));
    const reply = noFact(bot.answer('Who killed who?', panel));
    assert.doesNotMatch(reply.text, /Hook|Forskis|Inamo|Christopher/);
});

test('resetTopic restores selected-panel fallback after an unrelated conversation', () => {
    const bot = makeU7();
    const panel = { ...direct, entityIds: [trinsic] };
    assert.equal(bot.answer('Who is Finnigan?', panel).decision, 'answer');
    noFact(bot.answer('Who killed who?', panel));
    bot.resetTopic();
    trinsicRoles(bot.answer('Who killed who?', panel));
});

for (const spoiler of ['gentle', 'balanced'])
    test(`readable roles cannot reveal hidden participants at ${spoiler}`, () => {
        const absent = u7.filter(record => ![u7Killer, u7Victim].includes(record.id));
        for (const question of ['Who killed who?', 'Who killed whom in the Trinsic murders?']) {
            const hiddenReply = makeU7().answer(question, { spoiler, entityIds: [trinsic] });
            const absentReply = makeU7(absent).answer(question, { spoiler, entityIds: [trinsic] });
            assert.deepEqual(hiddenReply, absentReply);
            noFact(hiddenReply);
            assert.doesNotMatch(hiddenReply.text, /Hook|Forskis|Killers:|Victims:/);
        }
    });

test('guide-only participants preserve the anonymous suspect and never relabel a suspect as a killer', () => {
    const reply = makeU7().answer('Who killed whom according to the guide?', direct);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, [u7Suspect]);
    assert.match(reply.text, /not a confirmed murderer|not a confirmed killer/);
    assert.match(reply.text, /man with a hook/);
    assert.doesNotMatch(reply.text, /^Killers:|^Victims:|Forskis|outside research/m);
    assert.ok(reply.sources.every(source => source.review === 'extracted'));
});

for (const restriction of ['on Mars', 'in the SNES version', 'in Serpent Isle'])
    test(`participant rendering does not drop the restriction ${restriction}`, () => {
        const reply = noFact(makeU7().answer(`Who killed whom ${restriction}?`, direct));
        assert.doesNotMatch(reply.text, /Hook|Forskis|Killers:|Victims:/);
    });

test('an elliptical target change retains source restrictions', () => {
    const bot = makeU7();
    noFact(bot.answer('Who killed Inamo according to the guide?', direct));
    const reply = noFact(bot.answer('What about Christopher?'));
    assert.doesNotMatch(reply.text, /Hook|Forskis|outside research/);
});

test('an elliptical target change retains an unsupported world restriction', () => {
    const bot = makeU7();
    noFact(bot.answer('Who killed Inamo on Mars?', direct));
    const reply = noFact(bot.answer('What about Christopher?'));
    assert.doesNotMatch(reply.text, /Hook|Forskis|Killers:|Victims:/);
});

test('a subjectless participant follow-up keeps the latest guide-only restriction', () => {
    const bot = makeU7();
    const panel = { ...direct, entityIds: [trinsic] };
    assert.equal(bot.answer('Who killed whom according to the guide?', panel).decision, 'answer');
    const reply = bot.answer('Who killed who?', panel);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.match(reply.text, /not a confirmed murderer/);
    assert.deepEqual(reply.recordIds, [u7Suspect]);
    assert.doesNotMatch(reply.text, /^Killers:|^Victims:|Forskis|outside research/m);
});

test('a subjectless participant follow-up cannot erase the latest world restriction', () => {
    const bot = makeU7();
    const panel = { ...direct, entityIds: [trinsic] };
    noFact(bot.answer('Who killed Inamo on Mars?', panel));
    const reply = noFact(bot.answer('Who killed who?', panel));
    assert.doesNotMatch(reply.text, /Hook|Forskis|^Killers:|^Victims:/m);
});

test('a subjectless story follow-up retains the latest narrative source restriction', () => {
    const bot = makeU7();
    const panel = { ...direct, entityIds: [trinsic] };
    noFact(bot.answer('Why was Inamo killed according to the guide?', panel));
    // The guide does not link Inamo to its unnamed suspect. Keeping both the
    // latest subject and guide-only scope must decline, not invent that link.
    const reply = noFact(bot.answer('Who killed who?', panel));
    assert.doesNotMatch(reply.text, /^Killers:|^Victims:|Forskis|outside research/m);
});

const gameId = 'meaning-fixture';
const sourceFile = 'synthetic/meaning-guide.txt';
const overlayFile = 'synthetic/meaning-overlay.json';
const entity = key => `${gameId}:${key}`;
const texts = {
    harbor: 'In the Harbor case, Orrin murdered Vale.',
    harborOther: 'In the Harbor case, Sera murdered Leto.',
    quarry: 'In the Quarry case, Sera murdered Leto.',
    disconnectedKiller: 'In the Broken case, Orrin murdered Vale.',
    disconnectedVictim: 'In the Broken case, Sera murdered Leto.',
    suspect: 'In the Tower case, Nima is a suspect; the killer has not been confirmed.',
};
const facts = new Map(Object.entries(texts).map(([key, text]) => [key, {
    text, minSpoiler: 'direct', source: { file: sourceFile, locator: `facts[${key}]`, review: 'extracted' },
}]));
function definition(id, subject, role, people, context, from, qualifier) {
    return {
        id, entityId: entity(subject), kind: 'quest', title: `${subject[0].toUpperCase()}${subject.slice(1)} case`,
        aliases: [subject], minSpoiler: 'direct', overlayFile, from: [from],
        story: { role, people, context, ...(qualifier ? { qualifier } : {}) },
    };
}
const defs = {
    harborKiller: definition('harbor-killer', 'harbor', 'perpetrator', ['Orrin'], ['Vale'], 'harbor'),
    harborVictim: definition('harbor-victim', 'harbor', 'victim', ['Vale'], ['Orrin'], 'harbor'),
    harborOtherKiller: definition('harbor-other-killer', 'harbor', 'perpetrator', ['Sera'], ['Leto'], 'harborOther'),
    harborOtherVictim: definition('harbor-other-victim', 'harbor', 'victim', ['Leto'], ['Sera'], 'harborOther'),
    quarryKiller: definition('quarry-killer', 'quarry', 'perpetrator', ['Sera'], ['Leto'], 'quarry'),
    quarryVictim: definition('quarry-victim', 'quarry', 'victim', ['Leto'], ['Sera'], 'quarry'),
    brokenKiller: definition('broken-killer', 'broken', 'perpetrator', ['Orrin'], ['Vale'], 'disconnectedKiller'),
    brokenVictim: definition('broken-victim', 'broken', 'victim', ['Leto'], ['Sera'], 'disconnectedVictim'),
    suspect: definition('tower-suspect', 'tower', 'suspect', ['Nima'], ['Tower case'], 'suspect', 'is a suspect'),
};
const recordId = key => `${gameId}:story:${defs[key].id}:${defs[key].story.role}`;
function profile(key, kind = 'quest') {
    const title = kind === 'npc' ? key : `${key[0].toUpperCase()}${key.slice(1)} case`;
    return {
        id: `${entity(key)}:explanation`, entityId: entity(key), kind, title, aliases: [], relation: 'explanation',
        minSpoiler: 'gentle', variants: { gentle: { text: `${title} is a recorded ${kind === 'npc' ? 'person' : 'investigation'}.` } },
        source: { file: sourceFile, locator: `profile[${key}]`, review: 'extracted' },
    };
}
function makeFixture(keys = ['harborKiller', 'harborVictim', 'quarryKiller', 'quarryVictim']) {
    const definitions = keys.map(key => defs[key]);
    assert.deepEqual(storyRecordIssues(definitions, facts), []);
    return createAssistant({ gameId, records: [
        ...buildStoryRecords(gameId, definitions, facts), profile('harbor'), profile('quarry'), profile('Nima', 'npc'),
    ] });
}
function fixtureRoles(reply, killer, victim, keys) {
    roles(reply, [killer], [victim]);
    assert.deepEqual(new Set(reply.recordIds), new Set(keys.map(recordId)));
    for (const source of reply.sources) {
        assert.equal(source.file, sourceFile);
        assert.equal(source.index?.file, overlayFile);
        assert.equal(source.index?.review, 'authored-index');
    }
    for (const key of keys) assert.ok(reply.text.includes(facts.get(defs[key].from[0]).text));
    return reply;
}

test('two events clarify before pairing and the selected event has only its own directed roles', () => {
    const bot = makeFixture();
    const prompt = noFact(bot.answer('Who killed who?', direct));
    assert.equal(prompt.decision, 'clarify');
    const harborChoice = prompt.choices.find(choice => choice.id === entity('harbor'));
    assert.ok(harborChoice, prompt.text);
    const reply = fixtureRoles(bot.answer(harborChoice.label, {
        choiceId: harborChoice.id, expectedRevision: harborChoice.revision,
    }), 'Orrin', 'Vale', ['harborKiller', 'harborVictim']);
    assert.doesNotMatch(reply.text, /Sera|Leto/);
});

test('a current event outranks an older selected event', () => {
    const bot = makeFixture();
    const panel = { ...direct, entityIds: [entity('quarry')] };
    assert.equal(bot.answer('What is the Harbor case?', panel).decision, 'answer');
    fixtureRoles(bot.answer('Who killed who?', panel), 'Orrin', 'Vale', ['harborKiller', 'harborVictim']);
});

test('an explicit named event outranks the newest conversation event and selected event', () => {
    const bot = makeFixture();
    const panel = { ...direct, entityIds: [entity('harbor')] };
    fixtureRoles(bot.answer('Who killed who in the Harbor case?', panel), 'Orrin', 'Vale', ['harborKiller', 'harborVictim']);
    fixtureRoles(bot.answer('Who killed who in the Quarry case?', panel), 'Sera', 'Leto', ['quarryKiller', 'quarryVictim']);
    fixtureRoles(bot.answer('Who killed who?', panel), 'Sera', 'Leto', ['quarryKiller', 'quarryVictim']);
});

test('matching names in disconnected roles cannot fabricate a killer-to-victim pair', () => {
    const reply = makeFixture(['brokenKiller', 'brokenVictim']).answer('Who killed who in the Broken case?', direct);
    assert.doesNotMatch(reply.text, /Orrin (?:killed|murdered) Leto|Sera (?:killed|murdered) Vale/);
    if (reply.decision === 'answer') {
        assert.match(reply.text, /no complete|do not establish|not establish|not linked|incomplete|cannot establish/i);
        // Both labels without an incompleteness qualifier would imply the false pair.
        assert.ok(reply.text.includes(texts.disconnectedKiller) && reply.text.includes(texts.disconnectedVictim));
    } else noFact(reply);
});

test('two complete relationships in one event retain their individual pairings', () => {
    const keys = ['harborKiller', 'harborVictim', 'harborOtherKiller', 'harborOtherVictim'];
    const reply = makeFixture(keys).answer('Who killed who in the Harbor case?', direct);
    assert.equal(reply.decision, 'answer', reply.text);
    const pairs = [...reply.text.matchAll(/^Killers: ([^\n]+)\nVictims: ([^\n]+)$/gm)]
        .map(match => ({ killers: match[1].split(',').map(name => name.trim()), victims: match[2].split(',').map(name => name.trim()) }));
    assert.deepEqual(pairs, [
        { killers: ['Orrin'], victims: ['Vale'] },
        { killers: ['Sera'], victims: ['Leto'] },
    ], 'actors and victims must remain linked, rather than flattened into two unrelated name lists');
    assert.deepEqual(new Set(reply.recordIds), new Set(keys.map(recordId)));
    assert.ok(reply.text.includes(texts.harbor));
    assert.ok(reply.text.includes(texts.harborOther));
    assert.doesNotMatch(reply.text, /Orrin (?:killed|murdered) Leto|Sera (?:killed|murdered) Vale/);
    assert.deepEqual(reply.stateChanges, []);
});

test('a partially matched role retains the other sourced people as unpaired', () => {
    const partialFacts = new Map([['partial', {
        text: 'In the Harbor case, Orrin and Sera are recorded killers; Orrin murdered Vale.',
        minSpoiler: 'direct', source: { file: sourceFile, locator: 'facts[partial]', review: 'extracted' },
    }]]);
    const partialDefs = [
        definition('partial-killers', 'harbor', 'perpetrator', ['Orrin', 'Sera'], ['Vale'], 'partial'),
        definition('partial-victim', 'harbor', 'victim', ['Vale'], ['Orrin'], 'partial'),
    ];
    const bot = createAssistant({ gameId, records: buildStoryRecords(gameId, partialDefs, partialFacts) });
    const reply = bot.answer('Who killed who?', direct);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.match(reply.text, /^Killers: Orrin\nVictims: Vale$/m);
    assert.match(reply.text, /^Killers: Sera\nNo sourced killer–victim pairing is established for this account\.$/m);
    assert.doesNotMatch(reply.text, /^Killers: Sera\nVictims: Vale$/m);
    assert.ok(reply.text.includes(partialFacts.get('partial').text));
    assert.equal(reply.sources.length, 2);
});

test('one authored perpetrator does not manufacture a victim role', () => {
    const bot = makeFixture(['harborKiller']);
    const reply = bot.answer('Who killed who in the Harbor case?', direct);
    if (reply.decision === 'answer') {
        assert.deepEqual(line(reply.text, 'Killers'), ['Orrin']);
        assert.doesNotMatch(reply.text, /^Victims:/m);
        assert.match(reply.text, /no complete|do not establish|incomplete/i);
        assert.deepEqual(reply.recordIds, [recordId('harborKiller')]);
    } else noFact(reply);
    noFact(bot.answer('Who did Orrin kill?', direct));
});

test('an unconfirmed suspect cannot acquire a killer label through participant rendering', () => {
    const reply = makeFixture(['suspect']).answer('Who killed who in the Tower case?', direct);
    assert.equal(reply.decision, 'answer', reply.text);
    assert.match(reply.text, /suspect|not a confirmed/i);
    assert.doesNotMatch(reply.text, /^Killers:|^Victims:/m);
    assert.deepEqual(reply.recordIds, [recordId('suspect')]);
});
