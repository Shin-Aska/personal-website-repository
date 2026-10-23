// Standalone story-question acceptance tests. Node built-ins only; no reports,
// fixture files, browser assets, progress, or production knowledge are written.
// Run: node --test guides/tests/assistant/story-questions.test.mjs
// Uses no story records. The separate story-engine suite exercises the format
// agreed with Claude using a clearly fictional test world.
import assert from 'node:assert/strict';
import test from 'node:test';
import { storyQuestion, parse, materialTerms } from '../../js/assistant/language.js';

const questions = [
    ['who is the murderer?', 'perpetrator', ''],
    ['who is the killer?', 'perpetrator', ''],
    ['who committed the murder in Harbor?', 'perpetrator', 'in harbor'],
    ['who murdered who?', 'participants', ''],
    ['who murdered whom?', 'participants', ''],
    ['who killed whom in Harbor?', 'participants', 'in harbor'],
    ['who killed Vale?', 'perpetrator', 'vale', true],
    ['who murdered Vale?', 'perpetrator', 'vale', true],
    ['who was Vale killed by?', 'perpetrator', 'vale', true],
    ['who did Vale kill?', 'victim', 'vale', true],
    ['whom did Vale murder?', 'victim', 'vale', true],
    ['who was killed in Harbor?', 'victim', 'in harbor'],
    ['who was murdered?', 'victim', ''],
    ['who is the suspect in Harbor?', 'suspect', 'in harbor'],
    ['who is suspected in Harbor?', 'suspect', 'in harbor'],
    ['who is the victim?', 'victim', ''],
    ['who is the murder victim?', 'victim', ''],
    ['who are the murder victims in Trinsic?', 'victim', 'in trinsic'],
    ['who leads the Lantern Order?', 'leader', 'the lantern order'],
    ['who runs the Lantern Order?', 'leader', 'the lantern order'],
    ['who is the leader of the Lantern Order?', 'leader', 'the lantern order'],
    ['who belongs to the Lantern Order?', 'member', 'the lantern order'],
    ['who is a member of the Lantern Order?', 'member', 'the lantern order'],
    ['who are the Fellowship members?', 'member', 'fellowship'],
    ['who is the Fellowship leader?', 'leader', 'fellowship'],
];

for (const [question, role, query, personTarget = false] of questions) {
    test(`story question: ${question}`, () => {
        const expected = { role, query, ...(/\b(?:murder\w*|kill\w*)\b/.test(question) ? { crime: true } : {}),
            ...(personTarget ? { personTarget: true } : {}) };
        assert.deepEqual(storyQuestion(question), expected);
        const part = parse(question).parts[0];
        assert.deepEqual(part.story, expected);
        assert.equal(part.report, false, 'a story question is never a progress report');
    });
}

for (const question of [
    'How do I kill Vale?', 'How do I fight with Sera?', 'Who is Inamo?',
    'Who is the Fellowship?', 'Is Sera the murderer?', 'Can I trust Sera?',
    'Who can join my party?', 'Who sells the sword?',
]) {
    test(`ordinary question retains its interpretation: ${question}`, () => {
        assert.equal(storyQuestion(question), null);
    });
}

for (const [question, words] of [
    ['Who killed Vale on Mars?', ['vale', 'mars']],
    ['Who killed Vale before the eclipse?', ['vale', 'before', 'eclipse']],
    ['Who killed Vale without a knife?', ['vale', 'without', 'knife']],
    ['Who did Vale not kill?', ['vale', 'not']],
    ['Who murdered 2 people in Harbor?', ['2', 'people', 'harbor']],
    ['Who leads the Lantern Order for free?', ['lantern', 'order', 'free']],
    ['Who killed Vale in version 2.0?', ['vale', 'version', '2.0']],
]) {
    test(`story framing preserves restrictions: ${question}`, () => {
        const questionFrame = storyQuestion(question);
        assert.ok(questionFrame, 'the question form should be recognized');
        for (const word of words) assert.ok(questionFrame.query.split(/\s+/).includes(word), `lost ${word}`);
    });
}

test('ordinary material-term protection does not depend on story framing', () => {
    assert.ok(materialTerms('Where is the sword without a key?', ['sword']).includes('without'));
    assert.ok(materialTerms('Where is the sword on Mars?', ['sword']).includes('mars'));
});
