// Conversation focus must outrank the page's initial selection without
// changing the meaning, provenance or spoiler ceiling of a requested fact.
// Run: node --test guides/tests/assistant/narrative-context.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { buildNarrativeRecords, buildStoryRecords } from '../../js/assistant/topics.js';

const gameId = 'narrative-context';
const guide = 'fictional/conversation-guide.txt';
const overlay = 'fictional/conversation-index.json';
const entity = name => `${gameId}:${name}`;
const direct = { spoiler: 'direct' };
const titles = { harbor: 'Harbor Case', hill: 'Hill Case', secret: 'Secret Case', garden: 'Garden Case', errand: 'Hill Errand' };
const texts = {
    harbor: 'In the Harbor Case, Mara murdered Vela.',
    hill: 'In the Hill Case, Oren murdered Leto.',
    secret: 'In the Secret Case, Zoran murdered Umber.',
    harborEvent: 'In the Harbor Case, Mara opened the Bronze Gate.',
    hillEvent: 'In the Hill Case, Oren opened the Northern Gate.',
    harborCause: 'In the Harbor Case, Mara opened the Bronze Gate because Vela needed shelter.',
    hillCause: 'In the Hill Case, Oren opened the Northern Gate because Leto requested passage.',
    harborSuspect: 'In the Harbor Case, Sera was the suspect and escaped using a skiff.',
    hillSuspect: 'In the Hill Case, Nima was the suspect and escaped using a tunnel.',
    purpose: 'Sera wants the traveler to recover a package for the Hill Errand.',
};
const facts = new Map(Object.entries(texts).map(([key, text]) => [key, {
    text, minSpoiler: key === 'secret' ? 'direct' : 'balanced',
    source: { file: guide, locator: `facts[${key}]`, review: 'extracted' },
}]));

function profile(key, minSpoiler = 'gentle') {
    return { id: `${entity(key)}:profile`, entityId: entity(key), title: titles[key], aliases: [],
        kind: 'quest', relation: 'explanation', minSpoiler, requires: null,
        variants: { [minSpoiler]: { text: `${titles[key]} is an investigation in the guide.` } },
        source: { file: guide, locator: `profiles[${key}]`, review: 'extracted' } };
}
function story(id, key, role, people, context, from, minSpoiler = 'balanced') {
    return { id, entityId: entity(key), title: titles[key], aliases: [], kind: 'quest',
        minSpoiler, overlayFile: overlay, from: [from], story: { role, people, context } };
}
const storyDefinitions = [
    story('harbor-killer', 'harbor', 'perpetrator', ['Mara'], ['Vela'], 'harbor'),
    story('harbor-victim', 'harbor', 'victim', ['Vela'], ['Mara'], 'harbor'),
    story('hill-killer', 'hill', 'perpetrator', ['Oren'], ['Leto'], 'hill'),
    story('hill-victim', 'hill', 'victim', ['Leto'], ['Oren'], 'hill'),
    story('secret-killer', 'secret', 'perpetrator', ['Zoran'], ['Umber'], 'secret', 'direct'),
    story('secret-victim', 'secret', 'victim', ['Umber'], ['Zoran'], 'secret', 'direct'),
    story('harbor-suspect', 'harbor', 'suspect', ['Sera'], ['Harbor Case'], 'harborSuspect'),
    story('hill-suspect', 'hill', 'suspect', ['Nima'], ['Hill Case'], 'hillSuspect'),
];
function narrative(id, key, aspect, subjects, context, predicate, from) {
    return { id, entityId: entity(key), title: titles[key], aliases: [], kind: 'quest',
        minSpoiler: 'balanced', overlayFile: overlay, from: [from], narrative: {
            aspect, subjects, context, ...(predicate ? { predicate } : {}),
        } };
}
const narrativeDefinitions = [
    narrative('harbor-event', 'harbor', 'event', ['Harbor Case'], ['Mara', 'Bronze Gate'], 'opened', 'harborEvent'),
    narrative('hill-event', 'hill', 'event', ['Hill Case'], ['Oren', 'Northern Gate'], 'opened', 'hillEvent'),
    narrative('harbor-cause', 'harbor', 'cause', ['Harbor Case'], ['Mara', 'Bronze Gate'], 'opened', 'harborCause'),
    narrative('hill-cause', 'hill', 'cause', ['Hill Case'], ['Oren', 'Northern Gate'], 'opened', 'hillCause'),
    narrative('harbor-escape', 'harbor', 'method', ['Sera'], ['Harbor Case'], 'escaped', 'harborSuspect'),
    narrative('hill-escape', 'hill', 'method', ['Nima'], ['Hill Case'], 'escaped', 'hillSuspect'),
    narrative('errand-purpose', 'errand', 'purpose', ['Sera'], ['Hill Errand'], null, 'purpose'),
];
const profiles = ['harbor', 'hill', 'garden', 'errand'].map(key => profile(key));
const secretProfile = profile('secret', 'direct');
const storyRecords = buildStoryRecords(gameId, storyDefinitions, facts);
const narrativeRecords = buildNarrativeRecords(gameId, narrativeDefinitions, facts);
assert.equal(storyRecords.length, storyDefinitions.length);
assert.equal(narrativeRecords.length, narrativeDefinitions.length);
const records = [...profiles, secretProfile, ...storyRecords, ...narrativeRecords];
const make = (input = records) => createAssistant({ gameId, records: input });
const storyId = (key, role) => `${gameId}:story:${key}:${role}`;
const narrativeId = (key, aspect) => `${gameId}:narrative:${key}:${aspect}`;

function sourced(reply, expectedIds, fact) {
    assert.equal(reply.decision, 'answer', reply.text);
    assert.deepEqual([...reply.recordIds].sort(), [...expectedIds].sort());
    assert.ok(reply.text.includes(fact), 'the answer must preserve the requested event and action');
    assert.ok(reply.sources.length);
    assert.ok(reply.sources.every(source => source.file === guide && source.review === 'extracted'));
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}
function noFact(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}

test('the latest event outranks a stale page selection for killer and victim roles', () => {
    const assistant = make();
    const options = { ...direct, entityIds: [entity('hill')] };
    sourced(assistant.answer('Tell me about the Harbor Case', options), [`${entity('harbor')}:profile`], 'Harbor Case is an investigation');
    const reply = sourced(assistant.answer('Who killed whom?', options),
        [storyId('harbor-killer', 'perpetrator'), storyId('harbor-victim', 'victim')], texts.harbor);
    assert.doesNotMatch(reply.text, /Oren|Leto|Hill Case/);
});

test('a contextual explanation follows the latest narrated event rather than the page', () => {
    const assistant = make();
    const options = { ...direct, entityIds: [entity('hill')] };
    sourced(assistant.answer('What happened in the Harbor Case?', options), [narrativeId('harbor-event', 'event')], texts.harborEvent);
    const reply = sourced(assistant.answer('Why?', options), [narrativeId('harbor-cause', 'cause')], texts.harborCause);
    assert.doesNotMatch(reply.text, /Northern Gate|requested passage/);
});

test('a latest unrelated subject blocks the old page for both story and narrative questions', () => {
    for (const question of ['Who killed whom?', 'Why?']) {
        const assistant = make();
        const options = { ...direct, entityIds: [entity('hill')] };
        assert.equal(assistant.answer('Tell me about the Garden Case', options).decision, 'answer');
        const reply = noFact(assistant.answer(question, options));
        assert.doesNotMatch(reply.text, /Oren|Leto|requested passage|Northern Gate/);
    }
});

test('a hidden latest event behaves like absent roles and does not return to the old page', () => {
    const withoutSecretRoles = records.filter(record => record.relation !== 'story' || record.entityId !== entity('secret'));
    const hidden = make(), absent = make(withoutSecretRoles);
    const initial = { ...direct, entityIds: [entity('hill')] };
    for (const assistant of [hidden, absent])
        assert.equal(assistant.answer('Tell me about the Secret Case', initial).decision, 'answer');
    const options = { spoiler: 'balanced', entityIds: [entity('hill')] };
    const hiddenReply = noFact(hidden.answer('Who killed whom?', options));
    assert.deepEqual(hiddenReply, noFact(absent.answer('Who killed whom?', options)));
    assert.doesNotMatch(hiddenReply.text, /Zoran|Umber|Oren|Leto|Secret Case|Hill Case/);
});

test('an explicitly named event outranks both conversation context and the old page', () => {
    const assistant = make();
    const options = { ...direct, entityIds: [entity('harbor')] };
    assert.equal(assistant.answer('Tell me about the Garden Case', options).decision, 'answer');
    sourced(assistant.answer('Who killed whom in the Hill Case?', options),
        [storyId('hill-killer', 'perpetrator'), storyId('hill-victim', 'victim')], texts.hill);
    sourced(assistant.answer('What happened in the Harbor Case?', options), [narrativeId('harbor-event', 'event')], texts.harborEvent);
});

test('a narrative choice button preserves its chosen action despite the selected page', () => {
    const assistant = make();
    const prompt = noFact(assistant.answer('Why?', direct));
    const choice = prompt.choices.find(option => option.id === narrativeId('harbor-cause', 'cause'));
    assert.ok(choice, prompt.text);
    sourced(assistant.answer(choice.label, { ...direct, entityIds: [entity('hill')],
        choiceId: choice.id, expectedRevision: choice.revision }), [narrativeId('harbor-cause', 'cause')], texts.harborCause);
});

test('a role placeholder resolves the latest event suspect rather than the page suspect', () => {
    const assistant = make();
    const options = { ...direct, entityIds: [entity('hill')] };
    assert.equal(assistant.answer('Tell me about the Harbor Case', options).decision, 'answer');
    const reply = sourced(assistant.answer('How did the suspect escape?', options),
        [narrativeId('harbor-escape', 'method')], texts.harborSuspect);
    assert.match(reply.text, /Sera.*escaped using a skiff/);
    assert.doesNotMatch(reply.text, /Nima|tunnel/);
});

test('a stale errand selection cannot turn a broad purpose question into that errand', () => {
    const assistant = make();
    const options = { ...direct, entityIds: [entity('errand')] };
    assert.equal(assistant.answer('Tell me about the Garden Case', options).decision, 'answer');
    const reply = noFact(assistant.answer('What does Sera want?', options));
    assert.equal(reply.decision, 'clarify');
    assert.ok(reply.choices.some(choice => choice.id === narrativeId('errand-purpose', 'purpose')));
    assert.ok(!reply.text.includes(texts.purpose), 'the universal-purpose question must first select the errand scope');
});
