import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildStarcraftRecords } from '../../js/assistant/adapters/starcraft.js';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const overlay = JSON.parse(fs.readFileSync(new URL('../../data/assistant/starcraft.json', import.meta.url), 'utf8'));

// Fixture-only DOM nodes let Node exercise the adapter without claiming that
// these strings came from a live HTML page. The real DOM is checked by the
// companion Playwright test.
const fixtureText = new Map([
    ['#getting-started .grid > div:first-child', 'SCHNAIL; Pros: More realistic AI behavior; Better micro and macro management; Seamless integration with the game; Active community and regular updates; Cons: Requires internet connection for initial login; AI plays over local network after login; View Setup Guide'],
    ['#schnail-setup .text-blue-700', "Note: SCHNAIL includes its own version of Starcraft: Brood War, so you don't need to install the game separately."],
    ['#getting-started > .bg-blue-50 .text-blue-700', 'Note: The first launch might take some time as it downloads necessary game files.'],
    ['#troubleshooting .space-y-4 > div:first-child', 'Antivirus Blocking SCHNAIL; If your antivirus is blocking SCHNAIL: Check your antivirus quarantine for the SCHNAIL executable; Add an exception for the SCHNAIL installation directory; If needed, temporarily disable your antivirus during installation then add it on the exception list'],
    ['#bwai-setup h4:nth-of-type(3) + ul > li:first-child', 'BWAILauncher replaces the standard AI, so you can use it in single-player mode'],
    ['#bwai-setup ol > li:nth-child(5)', 'If BWAILauncher doesn\'t detect your Starcraft installation automatically: Click on the settings/configuration button in the launcher; Navigate to the "Game" or "Paths" section; Browse to and select your Starcraft.exe file; Save the settings and restart the launcher'],
    ['#remastered-setup ol', 'Ensure StarCraft Remastered is installed and updated.; Download the BWAPI integrated SCM map archive from Proton Drive or Direct Download.; Extract the downloaded ZIP file to your StarCraft maps folder (typically Documents\\StarCraft\\Maps).; Launch StarCraft Remastered.; Navigate to Single Player → Custom Game.; Select the extracted BWAPI map.; Crucial Step: Under Game Type, you MUST select "Use Map Settings". The AI will not function properly in a standard Melee game.; Start the game and enjoy playing against the advanced AI!'],
    ['#remastered-setup ol > li:nth-child(7)', 'Crucial Step: Under Game Type, you MUST select "Use Map Settings". The AI will not function properly in a standard Melee game.'],
    ['#bwapi-loading-checks', "BWAPI Not Loading; If BWAPI isn't loading with the game: Make sure you're using a compatible version of BWAPI with your Starcraft version; Check that all BWAPI files are in the correct directories; Look for error messages in the game's console output; Consult the BWAPI documentation for version-specific instructions"]
]);
const textNode = text => ({ nodeType: 3, nodeValue: text });
const fixtureRoot = { querySelector(selector) {
    const text = fixtureText.get(selector);
    return text === undefined ? null : { nodeType: 1, tagName: 'DIV', childNodes: [textNode(text)] };
} };
const all = buildStarcraftRecords(fixtureRoot, overlay);
const facets = all.filter(record => record.relation === 'narrative');
const assistant = () => createAssistant({ gameId: 'starcraft', records: facets });

test('all authored StarCraft facets build and retain their exact source claims', () => {
    const expected = [
        'schnail-summary:summary', 'schnail-first-launch-cause:cause',
        'schnail-antivirus-sequence:sequence', 'bwai-purpose:purpose', 'bwai-detection-method:method',
        'remastered-map-method:method', 'remastered-map-outcome:outcome', 'bwapi-loading-method:method'
    ];
    assert.equal(facets.length, expected.length);
    for (const id of expected) {
        const record = facets.find(item => item.id.endsWith(`:${id}`));
        assert.ok(record, `missing built facet ${id}`);
        assert.equal(record.minSpoiler, 'direct');
        assert.equal(record.source.review, 'extracted');
        assert.equal(record.source.index.review, 'authored-index');
        assert.ok(record.source.claims.length >= 1 && record.source.claims.length <= 4);
        assert.equal(record.variants.direct.text, record.source.claims.map(claim => claim.text).join('\n'));
        assert.equal(authorize(record, 'balanced'), null);
        assert.ok(authorize(record, 'direct'));
        for (const phrase of [...record.narrative.subjects, ...record.narrative.context,
            ...(record.narrative.predicate ? [record.narrative.predicate] : [])])
            assert.ok(record.source.claims.some(claim => claim.text.toLowerCase().includes(phrase.toLowerCase())), `${record.id}: ${phrase}`);
        if (id === 'schnail-summary:summary') {
            assert.equal(record.source.claims.length, 2);
            assert.match(record.source.claims[0].text, /more realistic AI behavior/i);
            assert.match(record.source.claims[1].text, /includes its own version/i);
        }
    }
    assert.deepEqual(new Set(facets.map(record => record.narrative.aspect)),
        new Set(['summary', 'cause', 'sequence', 'purpose', 'method', 'outcome']));
});

test('supported questions select the matching authored aspect', () => {
    const bot = assistant();
    for (const [question, id] of [
        ['Summarize SCHNAIL', 'schnail-summary:summary'],
        ['Why does the first launch take some time?', 'schnail-first-launch-cause:cause'],
        ['How was the BWAPI map selected?', 'remastered-map-method:method'],
        ['What is the method for BWAILauncher?', 'bwai-detection-method:method'],
        ['What is the method for the BWAPI map?', 'remastered-map-method:method'],
        ['What is the purpose of BWAILauncher?', 'bwai-purpose:purpose'],
        ['What is the next step for SCHNAIL antivirus?', 'schnail-antivirus-sequence:sequence'],
        ['What is the outcome of using a standard Melee game?', 'remastered-map-outcome:outcome']
    ]) {
        const result = bot.answer(question, { spoiler: 'direct' });
        assert.equal(result.decision, 'answer', `${question}: ${result.text}`);
        assert.ok(result.recordIds.some(recordId => recordId.endsWith(id)), `${question}: ${result.recordIds}`);
    }
    const cause = facets.find(record => record.id.endsWith('schnail-first-launch-cause:cause'));
    assert.equal(cause.narrative.status, 'hedged');
    assert.match(cause.source.claims[0].text, /might take some time/i);
    assert.notEqual(bot.answer('Why does the first launch delete game files?', { spoiler: 'direct' }).decision, 'answer');
    assert.notEqual(bot.answer('What is the method for BWAILauncher without selecting Starcraft.exe?', { spoiler: 'direct' }).decision, 'answer');
});

test('wrong actors and unsupported world details do not produce narrative answers', () => {
    const bot = assistant();
    for (const question of [
        'What did Artanis do to BWAILauncher?',
        'What is the purpose of BWAILauncher on Mars?'
    ]) assert.notEqual(bot.answer(question, { spoiler: 'direct' }).decision, 'answer', question);
});
