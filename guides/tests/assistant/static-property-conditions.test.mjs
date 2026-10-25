import test from 'node:test';
import assert from 'node:assert/strict';
import { matchStaticPropertyCondition, resolveStaticPropertyCondition } from '../../js/assistant/static-property-conditions.js';

const choice = 'If I choose SCHNAIL, do I have to install Brood War separately first?';
const phase = 'Once I have logged into it, do I have to stay connected to internet during matches?';
const fixture = () => ({
    entities: new Map([
        ['schnail', { name: 'SCHNAIL', kind: 'client', aliases: ['SCHNAIL client'] }],
        ['launcher', { name: 'Launcher', kind: 'launcher' }]
    ]),
    focus: { entityId: 'schnail', grounded: true },
    facts: [
        { id: 'initial', entityId: 'schnail', text: 'An internet connection is only required for the initial client login.', source: { file: 'guide' } },
        { id: 'later', entityId: 'schnail', text: 'All gameplay after login happens on your local network, with no ongoing internet requirement during play.', source: { file: 'guide' } },
        { id: 'bundled', entityId: 'schnail', text: "SCHNAIL includes its own version of Starcraft: Brood War, so you don't need to install the game separately.", source: { file: 'guide' } }
    ]
});
const plan = (k, text = choice) => matchStaticPropertyCondition({ ...k, text });
// Deliberately explicit caller proof: graph proximity or a retrieval score is
// never a phase witness. Real callers must additionally guard full originalScope.
const proves = ({ descriptor, facts }) => {
    if (descriptor.property === 'separate-installation') return {
        condition: true,
        property: facts.some(fact => fact.text.includes(descriptor.requirementLabel)
            && fact.text.includes("don't need to install the game separately"))
    };
    return {
        condition: facts.some(fact => fact.text.includes('only required for the initial client login')),
        property: facts.some(fact => fact.text.includes('All gameplay after login')
            && fact.text.includes('no ongoing internet requirement during play'))
    };
};
const resolve = (k, descriptor = plan(k, phase), requiredFactIds = ['initial', 'later'], extra = {}) =>
    resolveStaticPropertyCondition({ ...k, descriptor, requiredFactIds, isEligible: () => true, proves, ...extra });

test('Choice has a static requirement, an exact subject, and the complete original scope', () => {
    const k = fixture(), descriptor = plan(k);
    assert.deepEqual(descriptor, { kind: 'choice', subjectEntityId: 'schnail', subjectLabel: 'SCHNAIL',
        subjectReference: 'SCHNAIL', condition: 'choose', phase: null, property: 'separate-installation',
        requirementLabel: 'Brood War', questionText: 'do I have to install Brood War separately first', originalScope: choice });
    assert.equal(Object.isFrozen(descriptor), true);
    assert.equal(resolve(k, descriptor, ['bundled']).complete, true);
    for (const verb of ['use', 'pick']) assert.equal(plan(k, choice.replace('choose', verb)).condition, verb);
    assert.equal(plan(k, choice.replace('SCHNAIL', 'SCHNAIL client')).subjectEntityId, 'schnail');
    assert.equal(plan(k, 'If I use Launcher, must I install Base Game separately?').requirementLabel, 'Base Game');
});

test('A phase is a recorded source scope, never an observed player login', () => {
    const k = fixture(), descriptor = plan(k, phase);
    assert.equal(descriptor.kind, 'phase');
    assert.equal(descriptor.phase, 'after-login');
    assert.equal(descriptor.condition, 'logged-in');
    assert.equal(descriptor.subjectReference, 'it');
    assert.equal(descriptor.originalScope, phase);
    assert.equal(resolve(k, descriptor).complete, true);
    assert.equal(plan({ ...k, focus: null }, phase.replace('it,', 'SCHNAIL,')).subjectEntityId, 'schnail');
    assert.equal(plan(k, 'If I choose SCHNAIL, do I need to remain connected to the internet during gameplay?').property, 'internet-during-play');
});

test('Native login contractions and absent question marks retain exact original scope', () => {
    const k = fixture();
    for (const text of [phase.replace('I have', "I've"), phase.replace('I have', 'I’ve'),
        phase.slice(0, -1), phase.replace('I have', "I've").slice(0, -1), choice.slice(0, -1)]) {
        const descriptor = plan(k, text);
        assert.ok(descriptor, text);
        assert.equal(descriptor.originalScope, text);
        assert.equal(resolve(k, descriptor, descriptor.kind === 'choice' ? ['bundled'] : ['initial', 'later']).complete, true);
    }
    for (const text of [phase.replace('I have', "I've") + ' Only use the manual.',
        phase.slice(0, -1) + ' and updates', choice.slice(0, -1) + ' before two days',
        phase + '?', choice + '?']) assert.equal(plan(k, text), null, text);
});

test('Phase and requested property require the entire same-subject source proof', () => {
    const k = fixture(), descriptor = plan(k, phase);
    assert.equal(resolve(k, descriptor, ['initial']).complete, false);
    assert.equal(resolve(k, descriptor, ['later']).complete, false);
    assert.equal(resolve(k, descriptor, ['initial', 'later']).complete, true);
    assert.equal(resolve(k, descriptor, ['initial', 'missing']).complete, false);
    k.facts[1].entityId = 'launcher';
    assert.equal(resolve(k, descriptor).complete, false);
    k.facts[1].entityId = 'schnail';
    k.facts[1].text = 'All gameplay before login requires an internet connection.';
    assert.equal(resolve(k, descriptor).complete, false);
});

test('Every full source fact must pass the caller guards and no subset can answer', () => {
    const k = fixture(), descriptor = plan(k, phase), visited = [];
    const result = resolve(k, descriptor, ['initial', 'later'], { isEligible: (fact, request) => {
        visited.push(fact);
        assert.equal(request.originalScope, phase);
        return fact.id !== 'initial';
    } });
    assert.deepEqual(visited, k.facts.slice(0, 2));
    assert.deepEqual(result, { complete: false, factIds: [], requiredFactIds: ['initial', 'later'] });
    assert.equal(resolve(k, descriptor, ['initial', 'later'], { proves: undefined }).complete, false);
    assert.equal(resolve(k, descriptor, ['initial', 'later'], { isEligible: undefined }).complete, false);
    assert.equal(resolve(k, descriptor, ['initial', 'initial']).complete, false);
    assert.equal(resolve(k, descriptor, [], {}).complete, false);
    k.facts.push({ ...k.facts[0] });
    assert.equal(resolve(k, descriptor).complete, false);
});

test('Unknown, stale, ambiguous and ungrounded subjects fail closed without pronoun guesses', () => {
    const k = fixture();
    for (const subject of ['Unknown', 'SCHNAIL 2026', 'SCHNAIL and Launcher', 'it', 'that', 'they'])
        assert.equal(plan(k, choice.replace('SCHNAIL', subject)), null, subject);
    for (const focus of [null, {}, { entityId: 'schnail' }, { entityId: 'absent', grounded: true },
        { entityId: 'schnail', grounded: false }, { entityId: 'schnail', grounded: true, ambiguous: true }])
        assert.equal(plan({ ...k, focus }, phase), null);
    const descriptor = plan(k, phase);
    assert.equal(resolve({ ...k, focus: null }, descriptor).complete, false);
    k.entities.get('launcher').aliases = ['SCHNAIL'];
    assert.equal(plan(k), null);
    assert.equal(plan(k, phase), null);
    assert.equal(resolve(k, descriptor).complete, false);
});

test('Edition, material, numeric and source suffixes are rejected or retained whole', () => {
    const k = fixture();
    for (const text of [choice.replace('SCHNAIL,', 'SCHNAIL in the 2026 edition,'),
        choice.replace('separately first?', 'separately first in Remastered?'),
        choice.replace('Brood War', 'Brood War with the crystal'),
        choice.replace('Brood War', 'Brood War from the original manual'),
        choice.replace('first?', 'first? Only use the manual.'),
        phase.replace('matches?', 'matches in the 2026 edition?'),
        phase.replace('it,', 'it after two days,')]) assert.equal(plan(k, text), null, text);
    for (const label of ['Brood War 2026', 'Remastered Brood War', 'Gold Brood War']) {
        const text = choice.replace('Brood War', label), descriptor = plan(k, text);
        assert.equal(descriptor.requirementLabel, label);
        assert.equal(descriptor.originalScope, text);
        assert.equal(resolve(k, descriptor, ['bundled']).complete, false);
    }
});

test('No progression, player-state report, negation, compound question or hypothetical bypass', () => {
    const k = fixture();
    for (const text of [
        'If I finish SCHNAIL, what next?', 'If I install SCHNAIL, do I have to install Brood War separately first?',
        'If I own SCHNAIL, do I have to install Brood War separately first?',
        'If I log into SCHNAIL, what should I do next?', 'I have logged into it. Do I need internet during matches?',
        'Once I have already logged into it, do I have to stay connected to internet during matches?',
        'Suppose ' + choice, choice.replace('do I have to', 'would I have to'),
        choice.replace('choose', 'do not choose'), choice.replace('install', 'not install'),
        choice.replace('first?', 'first and create an account?'), choice + ' Can I play offline?',
        phase.replace('matches?', 'matches and updates?'), phase.replace('logged into', 'not logged into'),
        phase.replace('during matches?', 'now during matches?'), phase.replace('it,', 'my client,')
    ]) assert.equal(plan(k, text), null, text);
});

test('Parsing and proof resolution do not mutate state, facts, entities or focus', () => {
    const k = fixture(), before = structuredClone(k);
    Object.freeze(k.focus); k.facts.forEach(Object.freeze); Object.freeze(k.facts);
    const descriptor = plan(k, phase);
    const first = resolve(k, descriptor), second = resolve(k, descriptor);
    assert.deepEqual(first, second);
    assert.deepEqual(k, before);
    assert.equal(resolve(k, { ...descriptor, phase: 'after-installation' }).complete, false);
    assert.deepEqual(k, before);
});
