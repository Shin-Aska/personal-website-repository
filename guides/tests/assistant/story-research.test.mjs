// Fictional story-source precedence and missing-relationship regression tests.
// Uses only Node built-ins; does not edit game data, shared fixtures, or reports.
// Run: node --test guides/tests/assistant/story-research.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { buildStoryRecords, storyRecordIssues } from '../../js/assistant/topics.js';

const gameId = 'story-research-fixture';
const guideFile = 'fictional/research-story-guide.txt';
const overlayFile = 'fictional/research-story-overlay.json';
const researchUrl = 'https://example.test/fictional-ferry-murder';
const direct = { spoiler: 'direct' };
const entity = key => `${gameId}:${key}`;
const storyId = definition => `${gameId}:story:${definition.id}:${definition.story.role}`;

function fact(text, key, outside = false) {
    return {
        text, minSpoiler: 'direct',
        source: outside ? {
            file: researchUrl, locator: `Fictional source paragraph ${key}`,
            review: 'external-research',
            references: [{ url: researchUrl, label: 'Fictional ferry murder source', checkedAt: '2026-10-21' }],
        } : { file: guideFile, locator: `facts[${key}]`, review: 'extracted' },
    };
}

function definition(id, role, people, context = [], extra = {}) {
    return {
        id, entityId: entity('ferry'), title: 'Ferry Murder', aliases: ['Ferry case'],
        kind: 'quest', minSpoiler: 'direct', overlayFile, from: [id],
        story: { role, people, context }, ...extra,
    };
}

const suspect = definition('guide-suspect', 'suspect', ['Sera'], ['Ferry case'], {
    story: { role: 'suspect', people: ['Sera'], context: ['Ferry case'], qualifier: 'suspected of the murder' },
});
const researchKiller = definition('research-killer', 'perpetrator', ['Orrin'], ['Ari', 'Ferry case']);
const guideKiller = definition('guide-killer', 'perpetrator', ['Orrin'], ['Ari', 'Ferry case']);
const researchVictim = definition('research-victim', 'victim', ['Ari'], ['Orrin', 'Ferry case']);
const guideVictim = definition('guide-victim', 'victim', ['Ari'], ['Orrin', 'Ferry case']);
const otherResearchKiller = definition('other-research-killer', 'perpetrator', ['Vale'], ['Ari', 'Ferry case']);
const facts = new Map([
    ['guide-suspect', fact('In the Ferry case, Sera was suspected of the murder, but the guide does not identify the killer.', 'guide-suspect')],
    ['research-killer', fact('In the Ferry case, Orrin murdered Ari.', 'research-killer', true)],
    ['guide-killer', fact('In the Ferry case, Orrin murdered Ari.', 'guide-killer')],
    ['research-victim', fact('In the Ferry case, Ari was murdered by Orrin.', 'research-victim', true)],
    ['guide-victim', fact('In the Ferry case, Ari was murdered by Orrin.', 'guide-victim')],
    ['other-research-killer', fact('In the Ferry case, Vale murdered Ari.', 'other-research-killer', true)],
]);

function profile(name, text = `${name} is a ferry clerk.`, level = 'gentle') {
    return {
        id: `${entity(name.toLowerCase())}:explanation`, entityId: entity(name.toLowerCase()),
        title: name, aliases: [], kind: 'npc', relation: 'explanation', requires: null,
        minSpoiler: level, variants: { [level]: { text } },
        source: { file: guideFile, locator: `profiles[${name}]`, review: 'extracted' },
    };
}

function make(definitions, extra = []) {
    assert.deepEqual(storyRecordIssues(definitions, facts), [], 'fixture story records must be grounded');
    return createAssistant({ gameId, records: [...buildStoryRecords(gameId, definitions, facts), ...extra] });
}

function answer(reply, expected) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual([...reply.recordIds].sort(), expected.map(storyId).sort(), reply.text);
    assert.equal(reply.sources.length, expected.length);
    assert.deepEqual(reply.stateChanges, []);
    for (const source of reply.sources) {
        assert.equal(source.index?.file, overlayFile);
        assert.equal(source.index?.review, 'authored-index');
        if (source.review === 'external-research') {
            assert.equal(source.file, researchUrl);
            assert.deepEqual(source.references, [{
                url: researchUrl, label: 'Fictional ferry murder source', checkedAt: '2026-10-21',
            }]);
        } else {
            assert.equal(source.review, 'extracted');
            assert.equal(source.file, guideFile);
            assert.equal(source.references, undefined);
        }
    }
    return reply;
}

function noFact(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}

function clearMissingRelationship(reply) {
    noFact(reply);
    assert.match(reply.text, /sourced|relationship/i);
    assert.doesNotMatch(reply.text, /higher|spoiler|(?:nam|phras)ing.{0,20}different|spell|rephras|may not be covered/i);
    return reply;
}

for (const question of ['Who is the murderer in the Ferry case?', 'Who killed Ari?']) {
    test(`an indexed research perpetrator takes precedence over a guide suspect: ${question}`, () => {
        const reply = answer(make([suspect, researchKiller], [profile('Ari')]).answer(question, direct), [researchKiller]);
        assert.match(reply.text, /Not in this guide.*outside research/i);
        assert.match(reply.text, /Orrin murdered Ari/);
        assert.doesNotMatch(reply.text, /Sera|suspect clue|not a confirmed murderer|the guide records/i);
    });
}

for (const [definitions, expected] of [
    [[guideKiller, researchVictim], [guideKiller, researchVictim]],
    [[researchKiller, guideVictim], [researchKiller, guideVictim]],
]) test(`participant answers preserve both source labels with ${definitions[0].id}`, () => {
    const reply = answer(make(definitions).answer('Who murdered whom?', { ...direct, tone: 'sage' }), expected);
    assert.deepEqual(new Set(reply.sources.map(source => source.review)), new Set(['extracted', 'external-research']));
    assert.match(reply.text, /Not in this guide.*outside research/i);
    assert.match(reply.text, /The guide records:/);
    assert.doesNotMatch(reply.text, /no complete perpetrator-and-victim relationship|not a confirmed murderer/i);
    for (const def of expected) assert.ok(reply.text.includes(facts.get(def.from[0]).text), 'each source is quoted verbatim');
});

for (const definitions of [[otherResearchKiller, guideKiller], [guideKiller, otherResearchKiller]]) {
    test(`guide preference is restricted to the same authored role (${definitions[0].id} first)`, () => {
        const reply = answer(make(definitions).answer('Who killed Ari?', direct), [guideKiller]);
        assert.match(reply.text, /Orrin murdered Ari/);
        assert.doesNotMatch(reply.text, /Vale|outside research/);
    });
}

test('a guide victim does not suppress the separately sourced research perpetrator', () => {
    const reply = answer(make([guideVictim, researchKiller]).answer('Who killed Ari?', direct), [researchKiller]);
    assert.match(reply.text, /outside research/i);
});

test('a research perpetrator never creates an unauthored inverse victim role', () => {
    noFact(make([researchKiller]).answer('Whom did Orrin murder?', direct));
});

test('a visible current person selects only the event with an authored participant relationship', () => {
    const bot = make([researchKiller, researchVictim], [profile('Ari')]);
    const identity = bot.answer('Who is Ari?', direct);
    assert.equal(identity.decision, 'answer', identity.text);
    assert.deepEqual(identity.recordIds, [profile('Ari').id]);
    const reply = answer(bot.answer('Who killed whom?'), [researchKiller, researchVictim]);
    assert.match(reply.text, /Ferry Murder/);
    assert.match(reply.text, /outside research/i);
});

test('an unrelated current person cannot select an available story event', () => {
    const bot = make([researchKiller, researchVictim], [profile('Nima')]);
    const identity = bot.answer('Who is Nima?', direct);
    assert.equal(identity.decision, 'answer', identity.text);
    assert.deepEqual(identity.recordIds, [profile('Nima').id]);
    const reply = clearMissingRelationship(bot.answer('Who killed whom?'));
    assert.doesNotMatch(reply.text, /Orrin|Ari|Ferry Murder|outside research/i);
});

for (const spoiler of ['gentle', 'balanced']) {
    for (const visibleProfile of [false, true]) {
        test(`hidden research and absent research have identical ${spoiler} replies with profile=${visibleProfile}`, () => {
            const extras = visibleProfile ? [profile('Ari')] : [];
            const hidden = clearMissingRelationship(make([researchKiller], extras).answer('Who killed Ari?', { spoiler }));
            const absent = clearMissingRelationship(make([], extras).answer('Who killed Ari?', { spoiler }));
            for (const key of ['decision', 'text', 'recordIds', 'sources', 'choices']) assert.deepEqual(hidden[key], absent[key], key);
            assert.doesNotMatch(JSON.stringify(hidden), /Orrin|research-killer|fictional-ferry-murder|outside research/i);
        });
    }
}

test('a visible character with no sourced killer gets a relationship-specific fallback', () => {
    const reply = clearMissingRelationship(make([], [profile('Ari')]).answer('Who killed Ari?', direct));
    assert.doesNotMatch(reply.text, /ferry clerk/i, 'a non-answer must not substitute an unrelated character description');
});

test('an unknown target cannot make a hidden character name leak into a fallback', () => {
    const hiddenPerson = profile('Zorath', 'Zorath is a ferry clerk.', 'direct');
    const reply = clearMissingRelationship(make([researchKiller], [hiddenPerson]).answer('Who killed the clerk?', { spoiler: 'gentle' }));
    assert.doesNotMatch(JSON.stringify(reply), /\b(?:Zorath|Orrin|Ari)\b|Ferry Murder|research-killer/i);
});

for (const qualifier of ['on Mars', 'before the coronation', 'for free', 'with 2 victims', 'only']) {
    test(`research cannot discard an unsupported story restriction: ${qualifier}`, () => {
        noFact(make([researchKiller]).answer(`Who killed Ari ${qualifier}?`, direct));
    });
}

test('research story definitions still reject a missing labeled citation', () => {
    const unreviewed = new Map(facts);
    unreviewed.set('research-killer', {
        ...facts.get('research-killer'), source: { file: researchUrl, locator: 'paragraph 1', review: 'external-research' },
    });
    assert.ok(storyRecordIssues([researchKiller], unreviewed).some(issue => /labeled citations/.test(issue)));
    assert.deepEqual(buildStoryRecords(gameId, [researchKiller], unreviewed), []);
});

test('guide and research facts cannot be merged into one role record', () => {
    const mixed = { ...researchKiller, from: ['guide-killer', 'research-killer'] };
    assert.ok(storyRecordIssues([mixed], facts).some(issue => /guide and research facts cannot be mixed/.test(issue)));
    assert.deepEqual(buildStoryRecords(gameId, [mixed], facts), []);
});

for (const phrase of ['according to the guide', 'from this guide only', 'in the guide', 'using only the guide']) {
    test(`an explicit guide source restriction excludes research: ${phrase}`, () => {
        clearMissingRelationship(make([suspect, researchKiller], [profile('Ari')])
            .answer(`Who killed Ari ${phrase}?`, direct));
        const reply = answer(make([guideKiller, researchVictim]).answer(`Who killed Ari ${phrase}?`, direct), [guideKiller]);
        assert.doesNotMatch(reply.text, /outside research/);
    });
}

test('an explicit guide source restriction retains the original suspect clue', () => {
    const reply = answer(make([suspect, researchKiller])
        .answer('Who is the murderer in the Ferry case according to the guide?', direct), [suspect]);
    assert.match(reply.text, /not a confirmed murderer/);
    assert.doesNotMatch(reply.text, /outside research/);
});

test('a guide-only restriction survives an elliptical subject change', () => {
    const bot = make([researchKiller], [profile('Ari'), profile('Nima')]);
    clearMissingRelationship(bot.answer('Who killed Nima according to the guide?', direct));
    clearMissingRelationship(bot.answer('What about Ari?'));
});
