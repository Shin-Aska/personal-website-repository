import test from 'node:test';
import assert from 'node:assert/strict';
import { readSceneTransitionPreamble, allowQuestion } from '../../js/assistant/scene-transition-preambles.js';

test('deferred exit references preserve the full phase and never certify completion', () => {
    for (const phase of ['When', 'Once']) for (const subject of ["I'm", 'I am', "We're", 'We are']) {
        for (const reference of ['here', 'there']) {
            const input = `${phase} ${subject} done ${reference}.`;
            const result = readSceneTransitionPreamble(input);
            assert.deepEqual(result, { kind: 'deferred-exit',
                scopeText: input.slice(0, -1).toLowerCase(), subjectText: null,
                reference: 'scene', readOnlyReport: false, originalText: input });
        }
    }
    assert.equal(readSceneTransitionPreamble('When I’m done here').scopeText, "when i'm done here");
});

test('departure preserves the whole place and unknown source restrictions', () => {
    for (const actor of ['I', 'we']) for (const place of [
        'the hold', "the Rotting Ship's Hold", 'the working radioactive 30-room Palace',
        'the iron mine in the original edition according to the guide',
        'the entrance in StarCraft: Brood War from the guide only'
    ]) {
        const input = `Before ${actor} leave ${place}!`;
        assert.deepEqual(readSceneTransitionPreamble(input), {
            kind: 'departure', scopeText: place.toLowerCase(), subjectText: place.toLowerCase(),
            readOnlyReport: false, originalText: input
        });
    }
});

test('unhandled phase, ownership, inventory and extra clauses reject the whole preamble', () => {
    for (const input of [
        '', null, undefined, 30, 'Before I leave', 'Before I leave the', 'Before I leave here',
        "I'm done here", 'I am already done here', 'We are now done there',
        'After I completed the rescue', 'When I have the key', 'If I own the sword',
        'When I am done here if I have the key', 'When I am done here and ready',
        'When I am done there, how do I leave for Zaratan?', 'When I am done here?',
        'Before I leave my current save', 'Before I leave my inventory',
        'Before I leave the hold after the rescue', 'Before I leave the hold if I have the key',
        'Before I leave the hold and I have healing potions',
        'Before I leave the hold with the key that is working',
        'Before I leave the hold assuming victory', 'Before I leave the hold provided the key works',
        'Before I leave the hold. I completed the rescue', 'Before I leave the hold; take the key'
    ]) assert.equal(readSceneTransitionPreamble(input), null, String(input));
    assert.equal(readSceneTransitionPreamble(`Before I leave ${'x'.repeat(512)}`), null);
});

test('deferred scene reference pairs only with a complete static route request', () => {
    const descriptor = readSceneTransitionPreamble("When I'm done here");
    for (const question of [
        'How do I leave for Zaratan?', 'How can we exit to the Palace?',
        'How should I leave from here for Zaratan?', 'How do we exit to Zaratan from there?',
        "How do I leave from the Rotting Ship's Hold to Zaratan?",
        'How can I leave for radioactive 30-room Zaratan in the original edition according to the guide?'
    ]) assert.equal(allowQuestion(descriptor, question), true, question);
    for (const question of [
        'What is the next step?', 'How do I leave?', 'How do I leave for here?',
        'How do I leave for the?', 'Can I leave for Zaratan?', 'How did I leave for Zaratan?',
        'How do I leave for Zaratan if I own the key?',
        'How do I leave for Zaratan after I completed the rescue?',
        'How do I leave for Zaratan and what is next?',
        'How do I leave for Zaratan with a key that is working?',
        'How do I leave for Zaratan from here from the hold?',
        'How do I leave from here to Zaratan from there?',
        'How do I leave for Zaratan? Is the key working?',
        'How do I leave for Zaratan in my current save?',
        'Where can I find healing potions?'
    ]) assert.equal(allowQuestion(descriptor, question), false, question);
});

test('departure pairs with source resource lookups without claiming actual departure', () => {
    const descriptor = readSceneTransitionPreamble('Before I leave the hold');
    const before = structuredClone(descriptor);
    for (const question of [
        'Is there anything I can break open for healing potions?',
        'Is there something we can smash to find hidden healing potions?',
        'Where can I find 30 radioactive healing potions in the original edition from the guide only?',
        'Where do we get iron keys?', 'Where are the hidden healing potions?',
        'How should I deal with its giant boar?', 'How can we fight the giant boar?',
        'How do I defeat the radioactive 30-foot giant boar in the original edition?'
    ]) assert.equal(allowQuestion(descriptor, question), true, question);
    for (const question of [
        'What should I do next?', 'How do I leave for Zaratan?', 'Have I completed the hold?',
        'Is there anything I can break open for healing potions if I have the key?',
        'Is there anything I can break open for healing potions after the rescue?',
        'Is there anything I can break open for healing potions that restore 30 health?',
        'Is there anything I can break open for healing potions and gold?',
        'Is there anything I can break open for healing potions in my inventory?',
        'Where can I find healing potions? What is next?', 'Where are the',
        'Where can I find healing potions now?', null, 30
    ]) assert.equal(allowQuestion(descriptor, question), false, String(question));
    assert.deepEqual(descriptor, before, 'the syntax helpers never mutate context');
});

test('descriptors cannot broaden the preamble by dropping restrictions', () => {
    const descriptor = readSceneTransitionPreamble('Before I leave the radioactive 30-room hold');
    assert.equal(allowQuestion({ ...descriptor, scopeText: 'the hold' }, 'Where are healing potions?'), false);
    assert.equal(allowQuestion({ kind: 'departure', scopeText: 'the hold', subjectText: 'the hold' }, 'Where are healing potions?'), false);
    assert.equal(allowQuestion(null, 'Where are healing potions?'), false);
});
