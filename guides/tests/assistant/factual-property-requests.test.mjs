import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseFactualPropertyRequest as parse, supportsFactualPropertyRequest as supports } from '../../js/assistant/factual-property-requests.js';

const manifests = Object.fromEntries(await Promise.all(['alqadim', 'ultima5', 'starcraft'].map(async game => [game,
    JSON.parse(await readFile(new URL(`../../data/assistant/knowledge/${game}.json`, import.meta.url), 'utf8'))])));
const fact = (game, id) => manifests[game].facts.find(item => item.id.replace(/^.*:knowledge:/, '') === id);
const quick = fact('alqadim', 'swing-quick-swing'), wide = fact('alqadim', 'swing-wide-swing');
const full = fact('alqadim', 'swing-full-circle-swing'), uses = fact('ultima5', 'mantra-word-distinction');
const runtime = fact('starcraft', 'purplewave-java');
for (const item of [quick, wide, full, uses, runtime]) assert.ok(item, 'Actual source fact exists');
const profileQuestion = 'What makes the Wide Swing different from the basic attack?';
const usesQuestion = 'Are mantras and Words of Power used for the same thing?';
const runtimeQuestion = 'Does it use the same Java 21 recommendation as SCHNAIL?';
const coverageQuestion = 'Does that attack catch enemies behind me too?';
const profileContext = { facts: [wide, quick], subjectLabels: ['Wide Swing'], referenceLabels: ['Quick Swing', 'basic attack'] };
const usesContext = { facts: [uses], subjectLabels: ['Mantras'], referenceLabels: ['Words of Power'] };
const runtimeContext = { facts: [runtime], subjectLabels: ['PurpleWave', 'PurpleWave runtime'], referenceLabels: ['SCHNAIL'], grounded: true };
const coverageContext = { facts: [full], subjectLabels: ['Full-Circle Swing'], grounded: true };
const check = (question, context) => supports(parse(question), context);
const replace = (original, text) => ({ ...original, text, witness: text });

test('Descriptors preserve the exact original and all subject/property complements', () => {
    assert.deepEqual(parse(profileQuestion), { kind: 'profile-comparison', subjectText: 'the Wide Swing', referenceText: 'the basic attack', originalText: profileQuestion });
    assert.deepEqual(parse(usesQuestion), { kind: 'use-comparison', subjectText: 'mantras', referenceText: 'Words of Power', propertyText: 'the same thing', originalText: usesQuestion });
    assert.deepEqual(parse(runtimeQuestion), { kind: 'shared-property', subjectText: 'it', propertyText: 'Java 21 recommendation', referenceText: 'SCHNAIL', originalText: runtimeQuestion });
    assert.deepEqual(parse(coverageQuestion), { kind: 'attack-property', subjectText: 'that attack', action: 'catch', propertyText: 'enemies behind me too', originalText: coverageQuestion });
    const modified = '  Does PurpleWave in the unknown edition use the same Java 21 recommendation with two copper disks as SCHNAIL on Mars?  ';
    assert.deepEqual(parse(modified), { kind: 'shared-property', subjectText: 'PurpleWave in the unknown edition',
        propertyText: 'Java 21 recommendation with two copper disks', referenceText: 'SCHNAIL on Mars', originalText: modified });
    assert.equal(Object.isFrozen(parse(modified)), true);
    assert.equal(check(modified, runtimeContext), false);
});

test('Actual reviewed attack profiles permit literal juxtaposition only with explicit comparison links', () => {
    assert.equal(check(profileQuestion, profileContext), true);
    for (const context of [
        { ...profileContext, facts: [wide] },
        { ...profileContext, facts: [wide, full] },
        { ...profileContext, facts: [{ ...wide, support: undefined }, quick] },
        { ...profileContext, facts: [wide, { ...quick, support: undefined }] },
        { ...profileContext, facts: [{ ...wide, answerRelations: ['comparison'] }, quick] },
        { ...profileContext, facts: [replace(wide, 'A stronger cut. It does not damage enemies behind the attacker.'), quick] },
        { ...profileContext, facts: [replace(wide, 'It might be a stronger cut in front. Release the button.'), quick] },
        { ...profileContext, subjectLabels: ['Full-Circle Swing'] }
    ]) assert.equal(check(profileQuestion, context), false);
    for (const question of [
        'What makes the Wide Swing different from the basic attack with fire damage?',
        'What makes the Wide Swing in the CD edition different from the basic attack?',
        'What makes the Wide Swing different from the basic attack in two turns?',
        'What makes the Wide Swing different from the basic attack against copper enemies?'
    ]) assert.equal(check(question, profileContext), false, question);
});

test('The actual distinct-use paragraph binds both requested subjects to literal uses', () => {
    assert.equal(check(usesQuestion, usesContext), true);
    for (const context of [
        { ...usesContext, facts: [quick] },
        { ...usesContext, facts: [{ ...uses, answerRelations: ['use'] }] },
        { ...usesContext, facts: [replace(uses, 'Mantras and Words of Power are passwords. They are useful.')] },
        { ...usesContext, facts: [replace(uses, 'Mantras are used at shrines. Words of Power unlock dungeons.')] },
        { ...usesContext, facts: [replace(uses, 'Mantras are not used at shrines, while Words of Power unlock dungeons.')] },
        { ...usesContext, facts: [replace(uses, 'Perhaps Mantras are used at shrines, while Words of Power unlock dungeons.')] },
        { ...usesContext, subjectLabels: ['Runes'] }
    ]) assert.equal(check(usesQuestion, context), false);
    for (const question of [
        'Are mantras and Words of Power used for the same thing in the unknown edition?',
        'Are copper mantras and Words of Power used for the same thing?',
        'Are mantras and Words of Power used for exactly the same thing?',
        'Are mantras and two Words of Power used for the same thing?'
    ]) assert.equal(check(question, usesContext), false, question);
});

test('The actual runtime contrast preserves the named Java version and tool-specific requirement', () => {
    assert.equal(check(runtimeQuestion, runtimeContext), true);
    assert.equal(check('Does PurpleWave use the same Java 21 recommendation as SCHNAIL?', runtimeContext), true);
    for (const context of [
        { ...runtimeContext, grounded: false },
        { ...runtimeContext, subjectLabels: ['Steamhammer'] },
        { ...runtimeContext, facts: [{ ...runtime, answerRelations: ['version'] }] },
        { ...runtimeContext, facts: [replace(runtime, "PurpleWave's reviewed README requires a 32-bit JDK 8 at runtime because it connects to 32-bit BWAPI.")] },
        { ...runtimeContext, facts: [replace(runtime, runtime.text.replace('requires a 32-bit JDK 8', 'might require a 32-bit JDK 8'))] },
        { ...runtimeContext, facts: [replace(runtime, runtime.text.replace('requires a 32-bit JDK 8', 'requires a 32-bit JDK 21'))] },
        { ...runtimeContext, facts: [replace(runtime, runtime.text + ' PurpleWave uses Java 21.')] }
    ]) assert.equal(check(runtimeQuestion, context), false);
    for (const question of [
        'Does it use the same Java 17 recommendation as SCHNAIL?',
        'Does it use the same 64-bit Java 21 recommendation as SCHNAIL?',
        'Does it use the same Java 21 recommendation on macOS as SCHNAIL?',
        'Does it use the same Java 21 recommendation as SCHNAIL in the CD edition?',
        'Does the two copper PurpleWave runtimes use the same Java 21 recommendation as SCHNAIL?'
    ]) assert.equal(check(question, runtimeContext), false, question);
});

test('The actual complete-circle source proves rear coverage and no additional property', () => {
    assert.equal(check(coverageQuestion, coverageContext), true);
    assert.equal(check('Does Full-Circle Swing hit monsters behind us also?', coverageContext), true);
    for (const context of [
        { ...coverageContext, grounded: false },
        { ...coverageContext, facts: [wide] },
        { ...coverageContext, facts: [{ ...full, answerRelations: ['method'] }] },
        { ...coverageContext, facts: [replace(full, full.text.replace('also catches', 'never catches'))] },
        { ...coverageContext, facts: [replace(full, full.text.replace('catches monsters behind', 'catches monsters in front of'))] },
        { ...coverageContext, facts: [replace(full, full.text.replace('a complete 360-degree cut that also catches monsters behind the Corsair', 'a complete 360-degree cut'))] },
        { ...coverageContext, facts: [replace(full, full.text + ' It does not catch monsters behind him.')] }
    ]) assert.equal(check(coverageQuestion, context), false);
    for (const question of [
        'Does that attack damage enemies behind me too?',
        'Does that attack catch three enemies behind me too?',
        'Does that attack catch copper enemies behind me too?',
        'Does that attack catch enemies behind me too in the CD edition?',
        'Does that attack catch enemies behind me too and stun them?',
        'Does that attack catch enemies behind me too without spending magic?'
    ]) assert.equal(check(question, coverageContext), false, question);
});

test('Recommendations, guarantees and player-save requests remain outside this grammar', () => {
    for (const question of [null, {}, '', 'Which attack is best?', 'Which runtime should I use?',
        'Does it use the same Java 21 recommendation as SCHNAIL and would you recommend it?',
        'Does that attack catch enemies behind me too guaranteed?',
        'Does my current save use the same Java 21 recommendation as SCHNAIL?',
        'Did I catch enemies behind me?', 'What makes Wide Swing better than the basic attack?',
        'What makes Wide Swing different from the basic attack if I have only one sword?'
    ]) assert.equal(parse(question), null, String(question));
});

test('Full literal text, unchanged descriptors and isolated facts are mandatory', () => {
    const request = parse(runtimeQuestion);
    for (const context of [undefined, {}, { ...runtimeContext, facts: [] },
        { ...runtimeContext, facts: [{ ...runtime, witness: '32-bit JDK 8' }] },
        { ...runtimeContext, facts: [{ ...runtime, witness: undefined }] },
        { ...runtimeContext, facts: [{ ...runtime, conflict: true }] },
        { ...runtimeContext, facts: [{ ...runtime, answerRelations: undefined }] },
        { ...runtimeContext, facts: [runtime, uses] }
    ]) assert.equal(supports(request, context), false);
    assert.equal(supports({ ...request, propertyText: 'Java 17 recommendation' }, runtimeContext), false);
    assert.equal(supports({ ...request, kind: 'attack-property' }, runtimeContext), false);
    assert.equal(supports(null, runtimeContext), false);
    const frozen = Object.freeze({ ...runtime }), frozenRequest = Object.freeze({ ...request });
    assert.equal(supports(frozenRequest, { ...runtimeContext, facts: [frozen] }), true);
    assert.deepEqual(frozenRequest, request);
    assert.equal(frozen.text, runtime.text);
});
