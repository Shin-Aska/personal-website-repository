import test from 'node:test';
import assert from 'node:assert/strict';
import { readSourcePreamble } from '../../js/assistant/source-preambles.js';
import { parse } from '../../js/assistant/language.js';

test('position wrappers retain the place and optional task without certifying state', () => {
    for (const wrapper of ["I'm at", 'I am in', "We're at", 'We are in']) {
        const input = `${wrapper} the Palace and ready for the rescue.`;
        assert.deepEqual(readSourcePreamble(input), {
            kind: 'position', scopeText: 'the palace and the rescue',
            subjectText: 'the rescue', readOnlyReport: true, originalText: input
        });
        assert.equal(readSourcePreamble(`${wrapper} the Palace`).subjectText, 'the palace');
    }
});

test('reading positional context never changes the ordinary parser report', () => {
    const input = "I'm at the Palace and ready for the rescue. What is the next step?";
    const before = parse(input);
    assert.equal(before.parts[0].report, true);
    assert.equal(readSourcePreamble(before.parts[0].core).readOnlyReport, true);
    assert.deepEqual(parse(input), before);
    assert.equal(readSourcePreamble(input), null, 'a complete conversation is not one preamble');
});

test('difficulty wrappers preserve their complete subject and are not state reports', () => {
    for (const article of ['that', 'the', 'this']) {
        const input = `${article} radioactive 30-eyed Zorbax inside the iron mine is catching me!`;
        assert.deepEqual(readSourcePreamble(input), {
            kind: 'difficulty', scopeText: 'radioactive 30-eyed zorbax inside the iron mine',
            subjectText: 'radioactive 30-eyed zorbax inside the iron mine',
            readOnlyReport: false, originalText: input
        });
    }
    assert.equal(readSourcePreamble('that Zorbax is catching me if I have the sword'), null);
    assert.equal(readSourcePreamble('that Zorbax is catching me and I completed the rescue'), null);
});

test('topic fragments preserve material, inside, source, edition, quantity and unknown qualifiers', () => {
    for (const subject of [
        'the working iron key inside the palace',
        '30 radioactive Zorbax eggs',
        'the Palace in the original edition according to the guide',
        'the entrance in StarCraft: Brood War from the guide only'
    ]) {
        for (const wrapper of ['what about', 'how about']) {
            const result = readSourcePreamble(`${wrapper} ${subject}?`);
            assert.equal(result.kind, 'topic');
            assert.equal(result.scopeText, subject.toLowerCase());
            assert.equal(result.subjectText, subject.toLowerCase());
            assert.equal(result.readOnlyReport, false);
        }
    }
    // The caller, not this pure reader, decides whether this is a standalone
    // question or context for the later question in the conversation.
    assert.equal(readSourcePreamble('What about the key?').kind, 'topic');
    assert.equal(readSourcePreamble('What about the key? Where is it?'), null);
});

test('position complements preserve restrictions rather than laundering them into a known name', () => {
    const result = readSourcePreamble('I’m in the working radioactive 30-room Zorbax palace in the original edition according to the guide and ready for the iron rescue');
    assert.equal(result.scopeText, 'the working radioactive 30-room zorbax palace in the original edition according to the guide and the iron rescue');
    assert.equal(result.subjectText, 'the iron rescue');
    assert.equal(readSourcePreamble("I'm in the Palace").scopeText, 'the palace');
});

test('naming context keeps the complete name and carries no condition or state claim', () => {
    for (const subject of ['BWAPI', 'the working iron key inside the palace',
        '30 radioactive Zorbax eggs in the original edition according to the guide']) {
        const input = `When people say ${subject}`;
        assert.deepEqual(readSourcePreamble(input), {
            kind: 'naming', scopeText: subject.toLowerCase(), subjectText: subject.toLowerCase(),
            readOnlyReport: false, originalText: input
        });
    }
    for (const input of [
        'When people say', 'When people say the', 'When people say BWAPI?',
        'When people say BWAPI, do they mean a ready-made opponent?',
        'When people say BWAPI is installed', 'When people say I completed the rescue',
        'When people say my inventory', 'When people say BWAPI after login',
        'When people say BWAPI and I am ready', 'When people say BWAPI; what is it?',
        'When I say BWAPI', 'When BWAPI is ready', 'After people say BWAPI'
    ]) assert.equal(readSourcePreamble(input), null, input);
});

test('inventory, completed progress, bare readiness, save claims and unhandled phases stay outside the grammar', () => {
    for (const input of [
        'I have the key', 'I completed the rescue', 'I have completed the rescue',
        'I am ready for the rescue', "I'm ready", 'ready for the rescue',
        'I am at my current save', 'I am in my inventory', 'What about my progress',
        'If I am at the palace', 'When I am at the palace', 'After the rescue',
        "I'm at the Palace after the rescue", 'What about the key if I completed the rescue',
        'What about the key before the rescue', 'The rescue is completed',
        'I am at the palace provided the key works', 'I am at the palace assuming victory',
        'What about the key in case of trouble', 'I am at the palace as long as needed'
    ]) assert.equal(readSourcePreamble(input), null, input);
});

test('incomplete wrappers and extra clauses are rejected as a whole', () => {
    for (const input of [
        '', null, undefined, 30, 'I am at', 'I am in the', 'I am at and ready for rescue',
        'I am at the palace and ready for', 'I am at the palace and ready for the',
        'I am at the palace and ready', 'I am at the palace and I have the key',
        'I am at the palace and completed the rescue', 'I am at the palace but the key is lost',
        'I am at the palace, ready for the rescue', 'I am at the palace? ',
        'I am at the palace and ready for rescue and ready for combat',
        'the is catching me', 'the lich is catching me and ready for combat',
        'what about', 'what about the key and where is it', 'how about the key; where is it',
        'what about the key. Where is it', 'what about the key and',
        'I am at the palace. I have the key'
    ]) assert.equal(readSourcePreamble(input), null, String(input));
});
