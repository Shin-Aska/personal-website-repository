// Fictional behavior tests for story direction and conversation boundaries.
// Node built-ins only. No production data, shared reports, or saved progress.
// Run: node --test guides/tests/assistant/story-boundaries.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { buildStoryRecords, storyRecordIssues } from '../../js/assistant/topics.js';

const gameId = 'story-boundaries';
const guideFile = 'fictional/story-boundaries-guide.txt';
const overlayFile = 'fictional/story-boundaries-overlay.json';
const direct = { spoiler: 'direct' };
const entity = key => `${gameId}:${key}`;
const storyId = definition => `${gameId}:story:${definition.id}:${definition.story.role}`;
const fact = (text, key) => ({ text, source: { file: guideFile, locator: `facts[${key}]` } });

function role(id, subject, title, roleName, people, context, extra = {}) {
    return {
        id, entityId: entity(subject), title, kind: 'quest', aliases: [],
        minSpoiler: 'direct', overlayFile, from: [id],
        story: { role: roleName, people, context }, ...extra,
    };
}

function profile(subject, title, text, kind = 'npc', aliases = []) {
    return {
        id: `${entity(subject)}:explanation`, entityId: entity(subject), title, kind, aliases,
        relation: 'explanation', requires: null, minSpoiler: 'gentle',
        variants: { gentle: { text } },
        source: { file: guideFile, locator: `profiles[${subject}]`, review: 'extracted' },
    };
}

function make(definitions, facts, extraRecords = []) {
    assert.deepEqual(storyRecordIssues(definitions, facts), [], 'test facts must satisfy the agreed story invariant');
    return createAssistant({ gameId, records: [...buildStoryRecords(gameId, definitions, facts), ...extraRecords] });
}

function noFact(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.stateChanges, [], 'story questions never write progress');
    return reply;
}

function sourcedAnswer(reply, expectedIds) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual([...reply.recordIds].sort(), [...expectedIds].sort(), reply.text);
    assert.ok(reply.sources.length, 'answers need source mappings');
    for (const source of reply.sources) {
        assert.equal(source.file, guideFile);
        assert.equal(source.review, 'extracted');
        assert.ok(source.locator);
        if (expectedIds.some(id => id.includes(':story:'))) {
            assert.equal(source.index?.file, overlayFile);
            assert.equal(source.index?.review, 'authored-index');
        }
    }
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}

const harborSuspect = role('harbor-suspect', 'harbor', 'Harbor Murders', 'suspect', [], ['Evening Star'], {
    story: { role: 'suspect', people: [], context: ['Evening Star'], qualifier: 'woman in a silver cloak' },
});
const harborFacts = new Map([['harbor-suspect', fact(
    'The suspect (woman in a silver cloak) left aboard the Evening Star.', 'harbor-suspect')]]);
const harborProfiles = [
    profile('harbor-town', 'Harbor', 'Harbor is a port.', 'place'),
    profile('evening-star', 'Evening Star', 'The Evening Star is a sailing vessel.', 'place'),
];

test('an organization role supplies only its sourced organization title as an identity alias', () => {
    const leader = role('lantern-leader', 'lantern', 'The Lantern Order: people the atlas lists', 'leader', ['Sera'], ['Lantern Order']);
    const facts = new Map([['lantern-leader', fact('Sera leads the Lantern Order in Harbor.', 'lantern-leader')]]);
    const organization = profile('lantern', leader.title, 'Sera: leader of the Lantern Order.', 'qa');
    const bot = make([leader], facts, [organization]);
    sourcedAnswer(bot.answer('Who is the Lantern Order?', direct), [organization.id]);
    noFact(bot.answer('Who is Harbor?'));
});

test('an organization name with an article cannot obscure a specific office holder', () => {
    const leader = role('lantern-leader', 'lantern', 'The Lantern Order: people the atlas lists', 'leader', ['Sera'], ['the Lantern Order']);
    const facts = new Map([['lantern-leader', fact('Sera leads the Lantern Order.', 'lantern-leader')]]);
    const organization = profile('lantern', leader.title, 'Sera: leader of the Lantern Order.', 'qa');
    const treasurer = profile('orrin', 'Orrin', 'Orrin is the Lantern Order treasurer.', 'npc', ['Lantern Order treasurer']);
    const bot = make([leader], facts, [organization, treasurer]);
    sourcedAnswer(bot.answer('Who is the Lantern Order treasurer?', direct), [treasurer.id]);
});

for (const question of ['Who leads the Lantern Order?', 'Who runs the Lantern Order?', 'Who is the leader of the Lantern Order?']) {
    test(`a membership profile cannot answer a leadership question: ${question}`, () => {
        const member = role('lantern-member', 'lantern', 'The Lantern Order: people the atlas lists', 'member', ['Sera'], ['Lantern Order']);
        const facts = new Map([['lantern-member', fact('Sera is a member of the Lantern Order.', 'lantern-member')]]);
        const organization = profile('lantern', member.title, 'Sera: member of the Lantern Order.', 'qa');
        noFact(make([member], facts, [organization]).answer(question, direct));
    });
}

for (const hiddenRole of [false, true]) test(`an untyped membership profile cannot imply leadership when role metadata is ${hiddenRole ? 'hidden' : 'absent'}`, () => {
    const organization = profile('lantern', 'Lantern Order', 'Sera is a member of the Lantern Order.', 'qa');
    const member = role('hidden-member', 'lantern', 'Lantern Order', 'member', ['Sera'], ['Lantern Order']);
    const facts = new Map([['hidden-member', fact(organization.variants.gentle.text, 'hidden-member')]]);
    const bot = make(hiddenRole ? [member] : [], facts, [organization]);
    noFact(bot.answer('Who leads the Lantern Order?', { spoiler: 'gentle' }));
});

for (const question of [
    'Who murdered the Evening Star?', 'Who was the Evening Star killed by?',
    'Who killed Harbor?', 'Who was Harbor murdered by?',
]) test(`a vessel or location context is not a victim: ${question}`, () => {
    noFact(make([harborSuspect], harborFacts, harborProfiles).answer(question, direct));
});

test('an event qualifier can still select the recorded suspect clue', () => {
    const answer = sourcedAnswer(make([harborSuspect], harborFacts, harborProfiles)
        .answer('Who is the murderer in Harbor?', direct), [storyId(harborSuspect)]);
    assert.match(answer.text, /suspect/i);
    assert.match(answer.text, /not (?:a )?confirmed (?:murderer|killer)/i);
});

for (const selection of ['conversation', 'selected entity', 'selected record']) {
    test(`an event without authored roles keeps focus through ${selection}`, () => {
        const garden = profile('garden', 'Garden Murder', 'The Garden Murder remains an unresolved investigation.', 'quest');
        const bot = make([harborSuspect], harborFacts, [garden]);
        const options = { ...direct };
        if (selection === 'conversation') sourcedAnswer(bot.answer('Tell me about the Garden Murder', direct), [garden.id]);
        else options.entityIds = [selection === 'selected entity' ? garden.entityId : garden.id];
        const reply = noFact(bot.answer('Who is the murderer?', options));
        assert.doesNotMatch(reply.text, /silver cloak|Harbor Murders/);
    });
}

const victim = role('foundry-victim', 'foundry', 'Foundry Murder', 'victim', ['Ari'], []);
const perpetrator = role('foundry-perpetrator', 'foundry', 'Foundry Murder', 'perpetrator', ['Vale'], []);
const foundryFacts = new Map([
    ['foundry-victim', fact('Ari was the victim in the Foundry Murder.', 'foundry-victim')],
    ['foundry-perpetrator', fact('Vale was the perpetrator in the Foundry Murder.', 'foundry-perpetrator')],
]);

test('a personal location follow-up cannot answer with the event location', () => {
    const eventLocation = { ...profile('foundry', 'Foundry Murder', 'The Foundry event is at the docks.', 'quest'),
        relation: 'location' };
    const bot = make([victim, perpetrator], foundryFacts, [eventLocation]);
    sourcedAnswer(bot.answer('Who is the murderer?', direct), [storyId(perpetrator)]);
    const answer = noFact(bot.answer('Where is he?'));
    assert.doesNotMatch(answer.text, /at the docks/);
});

test('a unique named story participant can supply a sourced personal location follow-up', () => {
    const personLocation = { ...profile('vale-person', 'Vale', 'Vale is listed at the Copper Library.', 'npc'),
        relation: 'location' };
    const bot = make([victim, perpetrator], foundryFacts, [personLocation]);
    sourcedAnswer(bot.answer('Who is the murderer?', direct), [storyId(perpetrator)]);
    const answer = sourcedAnswer(bot.answer('Where is he?'), [personLocation.id]);
    assert.match(answer.text, /Copper Library/);
});

for (const pronoun of ['him', 'her', 'them']) test(`a personal pronoun cannot bypass the missing directed context: ${pronoun}`, () => {
    const bot = make([victim, perpetrator], foundryFacts);
    noFact(bot.answer('Who killed Ari?', direct));
    sourcedAnswer(bot.answer('Who is the victim in the Foundry Murder?'), [storyId(victim)]);
    noFact(bot.answer(`Who killed ${pronoun}?`));
});

test('requesting the event perpetrator after a victim answer remains supported', () => {
    const bot = make([victim, perpetrator], foundryFacts);
    sourcedAnswer(bot.answer('Who is the victim in the Foundry Murder?', direct), [storyId(victim)]);
    sourcedAnswer(bot.answer('Who is the murderer?'), [storyId(perpetrator)]);
});

test('personal-pronoun direction agrees with a literal target when explicitly indexed', () => {
    const directed = { ...perpetrator, story: { ...perpetrator.story, context: ['Ari'] } };
    const facts = new Map(foundryFacts);
    facts.set('foundry-perpetrator', fact('Vale murdered Ari in the Foundry Murder.', 'foundry-perpetrator'));
    const bot = make([victim, directed], facts);
    sourcedAnswer(bot.answer('Who killed Ari?', direct), [storyId(directed)]);
    sourcedAnswer(bot.answer('Who is the victim in the Foundry Murder?'), [storyId(victim)]);
    const answer = bot.answer('Who killed him?');
    // Asking which person is also safe; answering must use the same authored
    // direction as the literal question, never just the current event title.
    if (answer.decision === 'answer') sourcedAnswer(answer, [storyId(directed)]);
    else noFact(answer);
});

const clarificationDefinitions = [
    role('harbor-choice', 'harbor-choice', 'Harbor Murder', 'suspect', ['Orrin'], []),
    role('citadel-dawn', 'citadel-dawn', 'Citadel Dawn Murder', 'suspect', ['Sera'], [], { aliases: ['Citadel'] }),
    role('citadel-dusk', 'citadel-dusk', 'Citadel Dusk Murder', 'suspect', ['Nima'], [], { aliases: ['Citadel'] }),
    role('citadel-night', 'citadel-night', 'Citadel Night Murder', 'suspect', ['Leto'], [], { aliases: ['Citadel'] }),
];
const clarificationFacts = new Map([
    ['harbor-choice', fact('Orrin was the suspect in the Harbor Murder before the eclipse.', 'harbor-choice')],
    ['citadel-dawn', fact('Sera was the suspect in the Citadel Dawn Murder before the eclipse.', 'citadel-dawn')],
    ['citadel-dusk', fact('Nima was the suspect in the Citadel Dusk Murder before the eclipse.', 'citadel-dusk')],
    ['citadel-night', fact('Leto was the suspect in the Citadel Night Murder.', 'citadel-night')],
]);

function choose(bot, prompt, subject, button) {
    const selected = prompt.choices.find(choice => choice.id === entity(subject));
    assert.ok(selected, `missing requested event choice: ${subject}`);
    return button ? bot.answer(selected.label, { choiceId: selected.id, expectedRevision: selected.revision })
        : bot.answer(selected.label);
}

for (const button of [false, true]) {
    test(`an ambiguous event follow-up replaces the old query through ${button ? 'button' : 'typed'} selection`, () => {
        const bot = make(clarificationDefinitions, clarificationFacts);
        sourcedAnswer(bot.answer('Who is the murderer in Harbor?', direct), [storyId(clarificationDefinitions[0])]);
        const prompt = noFact(bot.answer('What about Citadel?'));
        assert.equal(prompt.decision, 'clarify');
        assert.ok(prompt.choices.length >= 2);
        sourcedAnswer(choose(bot, prompt, 'citadel-dawn', button), [storyId(clarificationDefinitions[1])]);
    });

    test(`a supported qualifier survives ambiguous event ${button ? 'button' : 'typed'} selection`, () => {
        const bot = make(clarificationDefinitions, clarificationFacts);
        sourcedAnswer(bot.answer('Who is the murderer in Harbor before the eclipse?', direct), [storyId(clarificationDefinitions[0])]);
        const prompt = noFact(bot.answer('What about Citadel?'));
        assert.equal(prompt.decision, 'clarify');
        assert.ok(prompt.choices.length >= 2);
        const answer = sourcedAnswer(choose(bot, prompt, 'citadel-dusk', button), [storyId(clarificationDefinitions[2])]);
        assert.match(answer.text, /before the eclipse/);
    });

    test(`an unsupported carried qualifier never disappears after ${button ? 'button' : 'typed'} selection`, () => {
        const bot = make(clarificationDefinitions, clarificationFacts);
        sourcedAnswer(bot.answer('Who is the murderer in Harbor before the eclipse?', direct), [storyId(clarificationDefinitions[0])]);
        const prompt = noFact(bot.answer('What about Citadel?'));
        if (prompt.choices.some(choice => choice.id === entity('citadel-night')))
            noFact(choose(bot, prompt, 'citadel-night', button));
        else assert.ok(prompt.choices.every(choice => choice.id !== entity('citadel-night')),
            'omitting an unsupported choice is also safe');
    });
}

for (const qualifier of ['on Mars', 'before the coronation', 'for free', 'with 2 victims', 'only']) {
    test(`an unmodeled story qualifier is preserved: ${qualifier}`, () => {
        noFact(make(clarificationDefinitions, clarificationFacts)
            .answer(`Who is the murderer in Harbor ${qualifier}?`, direct));
    });
}

test('an ordinary character identity replaces the earlier story frame', () => {
    const ari = profile('ari', 'Ari', 'Ari is the foundry clerk.');
    const vale = profile('vale', 'Vale', 'Vale is the harbor carpenter.');
    const bot = make([victim, perpetrator], foundryFacts, [ari, vale]);
    sourcedAnswer(bot.answer('Who is the victim in the Foundry Murder?', direct), [storyId(victim)]);
    sourcedAnswer(bot.answer('Who is Ari?'), [ari.id]);
    sourcedAnswer(bot.answer('What about Vale?'), [vale.id]);
});

test('an ordinary event identity replaces the earlier story frame', () => {
    const harbor = profile('harbor-choice', 'Harbor Murder', 'The Harbor Murder is an investigation.', 'quest');
    const citadel = profile('citadel-dawn', 'Citadel Dawn Murder', 'The Citadel Dawn Murder is an investigation.', 'quest');
    const bot = make(clarificationDefinitions, clarificationFacts, [harbor, citadel]);
    sourcedAnswer(bot.answer('Who is the murderer in Harbor?', direct), [storyId(clarificationDefinitions[0])]);
    sourcedAnswer(bot.answer('What is the Harbor Murder?'), [harbor.id]);
    sourcedAnswer(bot.answer('What about Citadel Dawn Murder?'), [citadel.id]);
});
