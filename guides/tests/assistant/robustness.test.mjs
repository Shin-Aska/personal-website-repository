// Regressions for the 22 Oct 2026 robustness round: guide-only wording,
// spoiler level of combined replies, verbs that must not borrow a nearby
// fact, conversation scope notes and new question forms. Each fix has a
// negative case. Run: node --test guides/tests/assistant/robustness.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistant } from '../../js/assistant/engine.js';
import { allRecords } from './load-records.mjs';

const direct = { spoiler: 'direct' };
const make = gameId => createAssistant({ gameId, records: allRecords[gameId], editions: gameId === 'ultima7' ? ['forge of virtue'] : [] });
const ask = (gameId, question, options = direct) => make(gameId).answer(question, options);
const OUTSIDE = /Not in this guide — from outside research/;

function answered(reply, recordId) {
    assert.equal(reply.decision, 'answer', reply.text);
    if (recordId) assert.ok(reply.recordIds.includes(recordId), `${recordId} not in ${reply.recordIds}: ${reply.text}`);
    assert.deepEqual(reply.stateChanges, []);
    return reply;
}
function notAnswered(reply) {
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.deepEqual(reply.recordIds, []);
    assert.deepEqual(reply.sources, []);
    return reply;
}

// Guide-only requests, in every position, exclude outside research.
for (const question of ['Using only the guide, who killed Christopher?', 'From the guide, who killed Christopher?',
    'Going by the guide alone, who killed Christopher?', 'Who killed Christopher? Use the guide only.',
    'Using only the guide, why was Christopher murdered?'])
    test(`guide-only wording excludes research: ${question}`, () => {
        const reply = notAnswered(ask('ultima7', question));
        assert.doesNotMatch(reply.text, OUTSIDE);
        assert.doesNotMatch(reply.text, /Hook|Forskis|Not answered/);
    });

for (const question of ['In the guide, who is the murderer?', 'Per the guide, who killed who?', 'Guide only: who killed who?',
    'Who killed who? Guide only please.'])
    test(`guide-only wording keeps the guide's own suspect clue: ${question}`, () => {
        const reply = answered(ask('ultima7', question), 'ultima7:story:trinsic-suspect:suspect');
        assert.match(reply.text, /not a confirmed murderer/);
        assert.doesNotMatch(reply.text, OUTSIDE);
        assert.ok(reply.sources.every(source => source.review !== 'external-research'));
    });

test('without a guide-only request the labelled research still answers', () => {
    const reply = answered(ask('ultima7', 'Who killed who?'), 'ultima7:story:trinsic-killers:perpetrator');
    assert.match(reply.text, OUTSIDE);
});

test('guide-only wording does not restrict an ordinary guide answer', () => {
    answered(ask('ultima7', 'Using only the guide, where is Iolo?'), 'ultima7:companion:iolo:location');
});

// A combined reply with a declined part is hidden when the setting is lowered,
// so a name visible only at the higher setting cannot remain in history.
test('a combined reply with a declined part carries the current spoiler level', () => {
    const hidden = make('ultima7'), absent = make('ultima7');
    const first = hidden.answer('Where is Iolo? Who killed Lap-Lem?', { spoiler: 'balanced' });
    assert.match(first.text, /Lap-Lem/);
    assert.equal(first.level, 'balanced');
    absent.answer('Where is Iolo? Who killed Zorblat?', { spoiler: 'balanced' });
    for (const bot of [hidden, absent]) bot.setPolicy('gentle');
    assert.doesNotMatch(JSON.stringify(hidden.getHistory()), /Lap-Lem|found the entry/);
    assert.deepEqual(hidden.getHistory().map(m => [m.role, m.decision]), absent.getHistory().map(m => [m.role, m.decision]));
});

test('a combined reply whose parts all answer keeps the level of its answers', () => {
    const reply = ask('ultima7', 'Where is Iolo? Where is Spark?');
    assert.equal(reply.decision, 'answer');
    assert.equal(reply.level, 'gentle');
});

// Verbs that must not borrow a nearby fact.
test('"found" as a verb does not become a location question', () => {
    notAnswered(ask('ultima7', 'What did Batlin found?'));
    answered(ask('ultima5', 'Where can the Grapple be found?'), 'ultima5:item:grapple:location');
    answered(ask('albion', 'Where is the pistol found?'), 'albion:item:pistol:location');
});

test('"what does X give me" needs a fact that says what is given', () => {
    const reply = notAnswered(ask('ultima7', 'What does Lord British give me?'));
    assert.doesNotMatch(reply.text, /The king/);
    answered(ask('ultima5', 'What does the Crown give me?'), 'ultima5:item:crown:use');
    answered(ask('ultima5', 'give me a hint about skull keys', { spoiler: 'gentle' }));
});

test('a plural or singular of a generic alias is not announced as a misspelling', () => {
    const reply = answered(ask('albion', 'What is the service level code?'), 'albion:objective:toronto-return:codes:hint');
    assert.doesNotMatch(reply.text, /I don't know anything about/);
    assert.doesNotMatch(ask('ultima5', 'who is the best mage', { spoiler: 'gentle' }).text, /I don't know anything about/);
});

test('a misspelt proper name is still announced as a guess', () => {
    const reply = ask('albion', 'who is mellthas');
    assert.match(reply.text, /I don't know anything about “mellthas”\. Did you mean Melthas\?/);
});

// Conversation scope.
test('a decline caused by the current topic names that topic', () => {
    const bot = make('ultima7');
    answered(bot.answer('Where is Iolo?', direct));
    const reply = notAnswered(bot.answer('Who killed who?', direct));
    assert.match(reply.text, /current topic, Iolo/);
    assert.doesNotMatch(reply.text, /Hook|Forskis|Inamo|Christopher/);
});

test('"Why?" after "Who killed who?" offers every named victim instead of one', () => {
    const bot = make('ultima7');
    answered(bot.answer('Who killed who?', direct));
    const reply = notAnswered(bot.answer('Why?', direct));
    assert.equal(reply.decision, 'clarify');
    assert.deepEqual(reply.choices.map(choice => choice.id).sort(),
        ['ultima7:narrative:christopher-cause:cause', 'ultima7:narrative:inamo-motive:cause']);
});

test('a topic quoting the suspect sentence keeps the suspect question in scope', () => {
    const bot = make('ultima7');
    answered(bot.answer('Tell me about the Crown Jewel', direct), 'ultima7:topic:suspect:explanation');
    const reply = answered(bot.answer('Who is the suspect?', direct), 'ultima7:story:trinsic-suspect:suspect');
    assert.doesNotMatch(reply.text, OUTSIDE);
    const other = make('ultima7');
    answered(other.answer('Where is Iolo?', direct));
    notAnswered(other.answer('Who is the suspect?', direct));
});

// Question forms.
test('"Who has X?" asks how to get it, with the hint at a lower setting', () => {
    answered(ask('ultima5', 'Who has the grapple?'), 'ultima5:item:grapple:acquisition');
    answered(ask('ultima6', 'Who has the Rune of Compassion?', { spoiler: 'gentle' }),
        'ultima6:quest:act-i-liberating-the-shrines:compassion-britain:hint');
    notAnswered(ask('ultima5', 'Who has the Zorblat?'));
});

test('"X\'s Y" is about Y only when Y\'s own guide passage names X', () => {
    const reply = answered(ask('ultima7', "Where do I take Batlin's package?"), 'ultima7:topic:sealed-package:hint');
    assert.match(reply.text, /Elynor in Minoc/);
    notAnswered(ask('ultima7', "Where do I take Klog's package?"));
});

test('"talk to" and "speak with" are question wording, not restrictions', () => {
    answered(ask('ultima7', 'How do I talk to the wisps?'), 'ultima7:topic:wisp-whistle:hint');
    answered(ask('ultima7', 'Who should I talk to about the Trinsic murders?'), 'ultima7:quest:the-trinsic-murders:hint');
    notAnswered(ask('ultima7', 'How do I talk to the wisps on Mars?'));
});

test('"destroy" and "banish" ask how to beat an enemy, and for a hint otherwise', () => {
    answered(ask('ultima5', 'How do I destroy a Shadowlord?'), 'ultima5:topic:shadowlords:combat');
    answered(ask('ultima5', 'How do I banish Faulinei?'), 'ultima5:objective:shadow-faulinei:combat');
    answered(ask('ultima7', 'How do I destroy the Black Gate?'), 'ultima7:topic:black-gate:hint');
    notAnswered(ask('ultima5', 'How do I destroy a Shadowlord without the shard?'));
});

test('an unsupported purchase method still points to what the guide does record', () => {
    const reply = notAnswered(ask('alqadim', 'Where do I buy a gilded dove?'));
    assert.match(reply.text, /does not establish buy.*It can tell you where it is/);
});

// Closest guide text: shown only when nothing understood the question, from
// guide text visible at the setting, never as an answer and never from a
// shared name alone.
const CLOSEST = /The closest guide text I found \(it may not answer your question\):/;
function closest(reply, recordId, sentence) {
    assert.equal(reply.decision, 'clarify', reply.text);
    assert.deepEqual(reply.recordIds, [], 'closest text is not an answer');
    assert.match(reply.text, CLOSEST);
    assert.ok(reply.closest.includes(recordId), `${recordId} not in ${reply.closest}`);
    assert.ok(reply.text.includes(sentence), reply.text);
    assert.ok(reply.sources.length && reply.sources.every(source => source.review !== 'external-research'));
    assert.deepEqual(reply.stateChanges, []);
}

test('closest guide text surfaces a sentence sharing the question\'s descriptive words', () => {
    closest(ask('ultima6', 'What do I need to wear in the gargoyle land?'),
        'ultima6:quest:act-iii-realm-of-the-gargoyles:secure-diplomatic-access:hint', 'Wear the Amulet of Submission');
    closest(ask('alqadim', 'What potion do I drink on the chessboard?'), 'alqadim:objective:ch10_7:hint', 'Drink the potion, cross the South chessboard path');
});

test('closest guide text never shows text above the spoiler setting', () => {
    const reply = ask('ultima6', 'What do I need to wear in the gargoyle land?', { spoiler: 'gentle' });
    assert.doesNotMatch(reply.text, /Amulet of Submission|closest guide text/);
});

for (const [gameId, question, spoiler, forbidden] of [
    ['ultima7', 'Where is Iolo on Mars?', 'direct', /closest guide text/],
    ['ultima7', 'How do I not die?', 'direct', /closest guide text/],
    ['albion', 'What do I need to enter Kenget Kamulos?', 'gentle', /Khunag|closest guide text/],
    ['albion', 'How do I beat Krondir?', 'gentle', /Meat|Trii|closest guide text/],
    ['ultima6', 'Where do trolls live?', 'gentle', /Endurance|closest guide text/],
    ['ultima7', 'Who killed Christopher in the guide?', 'direct', /closest guide text|Hook|Forskis/],
]) test(`closest guide text stays silent for restrictions, names alone and roles: ${question}`, () => {
    const reply = ask(gameId, question, { spoiler });
    assert.notEqual(reply.decision, 'answer', reply.text);
    assert.doesNotMatch(reply.text, forbidden);
    assert.deepEqual(reply.closest || [], []);
});

test('closest guide text gives the same reply for a hidden and an absent subject', () => {
    // Gentle with every record, versus Gentle with the higher-level records removed.
    const records = allRecords.ultima6, question = 'What do I need to wear in the gargoyle land?';
    const hidden = createAssistant({ gameId: 'ultima6', records }).answer(question, { spoiler: 'gentle' });
    const absent = createAssistant({ gameId: 'ultima6', records: records.filter(record => (record.minSpoiler || 'gentle') === 'gentle') })
        .answer(question, { spoiler: 'gentle' });
    assert.equal(hidden.text, absent.text);
    assert.deepEqual(hidden.closest || [], absent.closest || []);
});

test('only why/how/relationship declines call the question a relationship question', () => {
    assert.doesNotMatch(notAnswered(ask('alqadim', 'What does the gatekeeper genie want?')).text, /relationship/);
    assert.match(notAnswered(ask('ultima7', 'Why did Hook kill Inamo?')).text, /sourced answer.*relationship/);
});
