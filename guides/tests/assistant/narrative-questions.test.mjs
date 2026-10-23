// Standalone open-question reader tests. Node built-ins only; no guide data
// or shared fixtures are modified. Run: node --test this-file.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { narrativeQuestion, parse, materialTerms, SCAFFOLD } from '../../js/assistant/language.js';

const questions = [
    ['Who is Vale?', 'identity', 'vale'],
    ['Who are the Lantern Order?', 'identity', 'the lantern order'],
    ['Who was Sera?', 'identity', 'sera'],
    ['What is the Obelisk?', 'identity', 'the obelisk'],
    ["What's the Obelisk?", 'identity', 'the obelisk'],
    ["Who's Vale?", 'identity', 'vale'],
    ['What were the ruins?', 'identity', 'the ruins'],
    ['What happened to Vale?', 'event', 'to vale'],
    ['What happened at Harbor?', 'event', 'at harbor'],
    ['What happened in the Citadel?', 'event', 'in the citadel'],
    ['What happened during the eclipse?', 'event', 'during the eclipse'],
    ['Why did Vale leave Harbor?', 'cause', 'vale leave harbor'],
    ['Why does the Obelisk glow?', 'cause', 'the obelisk glow'],
    ['Why was Vale killed?', 'cause', 'vale killed'],
    ['Why were the gates closed?', 'cause', 'the gates closed'],
    ['Why is the Order divided?', 'cause', 'the order divided'],
    ['Why are the ships missing?', 'cause', 'the ships missing'],
    ["Why didn't Vale leave?", 'cause', "didn't vale leave"],
    ['Why did Vale not leave?', 'cause', 'vale not leave'],
    ['Why?', 'cause', '', true],
    ['Why is that?', 'cause', '', true],
    ['Why was that?', 'cause', '', true],
    ['How did Vale escape?', 'method', 'vale escape'],
    ['How did Vale kill Sera?', 'method', 'vale kill sera'],
    ['How was Vale killed?', 'method', 'vale killed'],
    ['How were the gates opened?', 'method', 'the gates opened'],
    ['According to the guide, why did Vale leave?', 'cause', 'vale leave according to the guide'],
    ['According to this guide: what happened to Vale?', 'event', 'to vale according to this guide'],
    ['What happened next?', 'sequence', '', true],
    ['What came next?', 'sequence', '', true],
    ['What happened after the Harbor inquiry?', 'sequence', 'after the harbor inquiry'],
    ['What happened next after the eclipse?', 'sequence', 'after the eclipse'],
    ['What followed the Harbor inquiry?', 'sequence', 'the harbor inquiry'],
    ['What is the next step after the Harbor inquiry?', 'sequence', 'after the harbor inquiry', false, 'steps'],
    ['What was the next step after the eclipse?', 'sequence', 'after the eclipse', false, 'steps'],
    ['What is the next step?', 'sequence', '', true, 'steps'],
    ['What comes next in the guide after the Harbor inquiry?', 'sequence', 'in the guide after the harbor inquiry', false, 'steps'],
    ["What's next in this guide after the eclipse?", 'sequence', 'in this guide after the eclipse', false, 'steps'],
    ['What was the outcome of the Harbor inquiry?', 'outcome', 'the harbor inquiry'],
    ['What are the consequences of the eclipse?', 'outcome', 'the eclipse'],
    ['What was the outcome for Vale?', 'outcome', 'vale'],
    ['What is the result for the Order?', 'outcome', 'the order'],
    ['Result of the Harbor inquiry?', 'outcome', 'the harbor inquiry'],
    ['What is the relationship between Vale and Sera?', 'relationship', 'vale and sera'],
    ['What was the connection between Vale and the Order?', 'relationship', 'vale and the order'],
    ['How are Vale and Sera related?', 'relationship', 'vale and sera'],
    ['How is Vale related to Sera?', 'relationship', 'vale to sera'],
    ['How was Vale related with the Order?', 'relationship', 'vale with the order'],
    ['What does Vale want?', 'purpose', 'vale'],
    ['What did Vale want from the Order?', 'purpose', 'vale from the order'],
    ['What is the purpose of the Obelisk?', 'purpose', 'the obelisk'],
    ['What were the goals of the Order?', 'purpose', 'the order'],
    ['Summarize the Harbor inquiry.', 'summary', 'the harbor inquiry'],
    ['Summarise the Harbor inquiry.', 'summary', 'the harbor inquiry'],
    ['Recap the Harbor inquiry.', 'summary', 'the harbor inquiry'],
    ['Summary of the Harbor inquiry?', 'summary', 'the harbor inquiry'],
    ['Give me a summary of the Harbor inquiry.', 'summary', 'the harbor inquiry'],
    ['What is the summary of the Harbor inquiry?', 'summary', 'the harbor inquiry'],
];

for (const [question, aspect, query, contextual = false, sequenceMode = aspect === 'sequence' ? 'events' : null] of questions) {
    test(`open question: ${question}`, () => {
        const expected = { aspect, query, ...(contextual ? { contextual: true } : {}), ...(sequenceMode ? { sequenceMode } : {}) };
        assert.deepEqual(narrativeQuestion(question), expected);
        const part = parse(question).parts[0];
        assert.deepEqual(part.narrative, expected);
        assert.equal(part.report, false);
    });
}

for (const [question, words] of [
    ['Who is Vale on Mars?', ['vale', 'mars']],
    ['What happened to Vale before the eclipse?', ['vale', 'before', 'eclipse']],
    ['Why did Vale leave without a key?', ['vale', 'leave', 'without', 'key']],
    ['Why did Vale not kill Sera?', ['vale', 'not', 'kill', 'sera']],
    ["Why wasn't Vale killed?", ["wasn't", 'vale', 'killed']],
    ['How did Vale escape for free?', ['vale', 'escape', 'free']],
    ['How was Vale killed without a dagger?', ['vale', 'killed', 'without', 'dagger']],
    ['According to the guide, how was Vale killed in version 2.0?', ['vale', 'killed', 'version', '2.0', 'according', 'guide']],
    ['What happened after the eclipse in version 2.0?', ['after', 'eclipse', 'version', '2.0']],
    ['What were the consequences of the eclipse on Mars?', ['eclipse', 'mars']],
    ['How are Vale and Sera related before the eclipse?', ['vale', 'sera', 'before', 'eclipse']],
    ['What does Vale not want?', ['vale', 'not']],
    ['Summarize the 2 attacks in the SNES version.', ['2', 'attacks', 'snes', 'version']],
    ['Who is Vale according to the guide only?', ['vale', 'according', 'guide', 'only']],
    ['What is the next step after the Harbor inquiry without the key?', ['after', 'harbor', 'inquiry', 'without', 'key']],
    ['What comes next in the guide after the eclipse in version 2.0?', ['guide', 'after', 'eclipse', 'version', '2.0']],
]) {
    test(`open framing preserves restrictions: ${question}`, () => {
        const frame = narrativeQuestion(question);
        assert.ok(frame);
        for (const word of words) assert.ok(frame.query.split(/\s+/).includes(word), `lost ${word}`);
    });
}

for (const question of [
    'Who killed Vale?', 'Who is the murderer?', 'Who is the victim?',
    'Who is the leader of the Order?', 'Who are the Order members?',
    'How do I kill Vale?', 'How can I escape Harbor?', 'How did I kill the dragon?',
    'How does the Obelisk work?', 'What happens if I attack Vale?',
    'How is the Obelisk used?', 'How was I killed?',
    'What should I do next?', 'What do I do after the Harbor inquiry?',
    'What happened to Vale if I completed the inquiry?',
    'I completed the Harbor inquiry.', 'I have the key.',
    'Can I trust Vale?', 'Is Vale the murderer?', 'Who sells the sword?',
    'Who recruits Mira?', 'Who buys the key?', 'Who cures poison?', 'Who gives the quest?',
    'Who can help Mira?', 'Who should help Mira?', 'Who did Mira betray?', 'Who he hired?', 'Who they follow?',
    'What happened?', 'Why did?', 'How did?', 'Summarize',
    'Who is Vale? Where is Sera?', 'Why did Vale leave; who killed Sera?',
    'What happened to Vale and where is Sera?',
    `What happened to ${'x'.repeat(513)}?`,
]) {
    test(`other acts retain their interpretation: ${question.slice(0, 90)}`, () => {
        assert.equal(narrativeQuestion(question), null);
    });
}

test('request framing applies before open-question parsing', () => {
    assert.deepEqual(parse('Please, can you tell me why did Vale leave?').parts[0].narrative,
        { aspect: 'cause', query: 'vale leave' });
});

test('compound messages retain one typed frame per part', () => {
    assert.deepEqual(parse('What happened to Vale? Why did Sera leave?').parts.map(part => part.narrative), [
        { aspect: 'event', query: 'to vale' }, { aspect: 'cause', query: 'sera leave' }
    ]);
});

test('edition fields remain available beside the query', () => {
    const part = parse('What happened to Vale in the SNES version?').parts[0];
    assert.ok(part.editions.includes('snes'));
    assert.ok(part.narrative.query.includes('snes version'));
});

test('narrative vocabulary is not global filler', () => {
    for (const word of ['happened', 'after', 'relationship', 'outcome', 'consequences', 'summary'])
        assert.equal(SCAFFOLD.has(word), false, `${word} must remain material outside its own question form`);
    assert.ok(materialTerms('Where is Vale after the eclipse?', ['vale']).includes('after'));
    assert.ok(materialTerms('Where is Vale without a key?', ['vale']).includes('without'));
});

for (const [question, target, predicate, query = `${target} ${predicate}`] of [
    ["Who is Christopher's son?", 'christopher', 'son'],
    ['Who is the father of Spark?', 'spark', 'father'],
    ["Who's Vale's friend?", 'vale', 'friend'],
    ["Who was Sera's mother?", 'sera', 'mother'],
    ["Who is Lord British's daughter?", 'lord british', 'daughter'],
    ["Who is Vale's sister on Mars?", 'vale', 'sister', 'vale sister on mars'],
    ['Who is the husband of Sera before the eclipse?', 'sera before the eclipse', 'husband'],
    ["Who is Christopher’s son?", 'christopher', 'son'],
    ['Who founded the Lantern Order?', 'the lantern order', 'founded'],
    ['Who hired Vale?', 'vale', 'hired'],
    ['Who hired Vale before the eclipse?', 'vale before the eclipse', 'hired'],
    ['Who hired Vale in the SNES version?', 'vale in the snes version', 'hired'],
]) {
    test(`directed relationship: ${question}`, () => {
        const expected = { aspect: 'relationship', query, target, predicate, directed: true };
        assert.deepEqual(narrativeQuestion(question), expected);
        assert.deepEqual(parse(question).parts[0].narrative, expected);
    });
}

test('relative roles are requested explicitly, never reversed by parsing', () => {
    assert.equal(narrativeQuestion("Who is Vale's son?").predicate, 'son');
    assert.equal(narrativeQuestion("Who is Sera's father?").predicate, 'father');
    assert.equal(narrativeQuestion('How are Vale and Sera related?').directed, undefined);
});

test('a guide step is not an event chronology', () => {
    assert.equal(narrativeQuestion('What happened after the eclipse?').sequenceMode, 'events');
    assert.equal(narrativeQuestion('What is the next step after the eclipse?').sequenceMode, 'steps');
    assert.equal(narrativeQuestion('What comes next in the guide after the eclipse?').sequenceMode, 'steps');
    const gameplay = parse('What should I do next?').parts[0];
    assert.equal(gameplay.narrative, null);
    assert.equal(gameplay.intent, 'hint');
});

test('a source-restricted contextual question retains its restriction through query substitution', () => {
    assert.deepEqual(narrativeQuestion('According to the guide, why?'),
        { aspect: 'cause', query: 'according to the guide', contextual: true, guideOnly: true });
});

test('a leading guide restriction also preserves existing story-role interpretation', () => {
    const part = parse('According to the guide, who killed Vale?').parts[0];
    assert.deepEqual(part.story, { role: 'perpetrator', query: 'vale according to the guide', crime: true, personTarget: true });
    assert.equal(part.narrative, null);
});

test('generic directed predicates retain source restrictions', () => {
    assert.deepEqual(narrativeQuestion('According to the guide, who hired Vale?'), {
        aspect: 'relationship', query: 'vale hired according to the guide', target: 'vale', predicate: 'hired', directed: true,
    });
});
