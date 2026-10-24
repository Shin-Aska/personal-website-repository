import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildStarcraftRecords } from '../../js/assistant/adapters/starcraft.js';
import { createAssistant } from '../../js/assistant/engine.js';
import { authorize } from '../../js/assistant/policy.js';

const overlay = JSON.parse(fs.readFileSync(new URL('../../data/assistant/starcraft.json', import.meta.url)));
// Fixture-only excerpts from the reviewed page. Actual selectors and all source
// text are independently exercised by the live-DOM campaign browser replay.
const excerpts = new Map([
    ['#schnail-setup .text-blue-700', "Note: SCHNAIL includes its own version of Starcraft: Brood War, so you don't need to install the game separately."],
    ['#getting-started > .bg-blue-50 .text-blue-700', 'Note: The first launch might take some time as it downloads necessary game files.'],
    ['#bwai-setup .text-yellow-700', 'BWAILauncher requires a separate Starcraft: Brood War 1.16.1 installation.'],
    ['#bwai-setup ol', 'Ensure you have Starcraft: Brood War installed and updated to version 1.16.1; Download the latest BWAILauncher release from GitHub; Extract the downloaded ZIP file to your Starcraft: Brood War installation directory; Run BWAILauncher.exe'],
    ['#bwai-setup h4:nth-of-type(3) + ul > li:first-child', 'BWAILauncher replaces the standard AI, so you can use it in single-player mode'],
    ['#bwai-setup ul', 'BWAILauncher replaces the standard AI, so you can use it in single-player mode; Try different difficulty settings'],
    ['#bwai-setup ul.mb-4', 'Extract BWAILauncher to your portable Starcraft directory; When prompted, point BWAILauncher to the Starcraft.exe in the same directory; All settings will be saved in the same folder, making it fully portable'],
    ['#remastered-setup .text-blue-700', 'Note: This method works natively with StarCraft Remastered without needing version downgrades.'],
    ['#remastered-setup ol > li:nth-child(7)', 'Crucial Step: Under Game Type, you MUST select "Use Map Settings". The AI will not function properly in a standard Melee game.'],
    ['#troubleshooting .bg-blue-50 .text-blue-700', 'Need more help? Join the SCHNAIL Discord Server or visit the BWAPI GitHub Discussions for community support.'],
    ['#resources .space-y-8 > div:nth-child(2)', 'Example Bots; Learn from these open-source bot implementations: Steamhammer; UAlbertaBot']
]);
const root = { querySelector(selector) {
    const text = excerpts.get(selector);
    return text === undefined ? null : { nodeType: 1, tagName: 'DIV', childNodes: [{ nodeType: 3, nodeValue: text }] };
} };
const records = buildStarcraftRecords(root, overlay);
const tiers = ['gentle', 'balanced', 'direct'];
const bot = () => createAssistant({ gameId: 'starcraft', records });
function answer(assistant, question, spoiler, pattern) {
    const reply = assistant.answer(question, { spoiler });
    assert.equal(reply.decision, 'answer', `${question} (${spoiler}): ${reply.text}`);
    assert.match(reply.text, pattern);
    assert.ok(reply.recordIds.length && reply.sources.length);
    return reply;
}

test('setup and purpose stay separate after switching between their questions', () => {
    for (const spoiler of tiers) {
        const assistant = bot();
        answer(assistant, 'How do I install BWAILauncher?', spoiler, /1\.16\.1/i);
        answer(assistant, 'What is BWAILauncher for?', spoiler, /standard.*(?:single-player|AI)/i);
        answer(assistant, 'How do I install BWAILauncher?', spoiler, /1\.16\.1/i);
    }
});

test('separate-install and downgrade answers retain unrelated restrictions', () => {
    for (const spoiler of tiers) {
        const assistant = bot();
        answer(assistant, 'Do I need a separate StarCraft installation for SCHNAIL?', spoiler, /includes its own/i);
        assert.notEqual(assistant.answer('Do I need a separate StarCraft installation for SCHNAIL on Mars?', { spoiler }).decision, 'answer');
        answer(assistant, 'Do I need to downgrade for the Remastered SCM map?', spoiler, /without.*version downgrades/i);
        assert.notEqual(assistant.answer('Do I need to downgrade for the Remastered SCM map on Mars?', { spoiler }).decision, 'answer');
    }
});

test('community-help and example-list questions do not inherit earlier acquisition intent', () => {
    for (const spoiler of tiers) {
        const assistant = bot();
        answer(assistant, 'Where can I get more help?', spoiler, /SCHNAIL Discord.*BWAPI GitHub Discussions/i);
        answer(assistant, 'What example bots are listed?', spoiler, /(?:two open-source|Steamhammer.*UAlbertaBot)/i);
        const record = records.find(r => r.id === 'starcraft:example-bots:list');
        assert.equal(authorize(record, spoiler).source.index.review, 'authored-index');
    }
});

test('Melee symptom and consequence select bounded Game Type guidance', () => {
    for (const spoiler of tiers) {
        const assistant = bot();
        answer(assistant, 'The Remastered map AI is not working in Melee', spoiler, /Use Map Settings/i);
        answer(assistant, 'What happens if I use standard Melee?', spoiler, /Use Map Settings/i);
        assert.notEqual(assistant.answer('Which exact DLL bug causes an idle AI even with Use Map Settings?', { spoiler }).decision, 'answer');
    }
});

test('compatibility conflict preserves warning and both guide locations at each tier', () => {
    for (const spoiler of tiers) {
        const reply = bot().answer('What version does BWAILauncher need?', { spoiler });
        assert.notEqual(reply.decision, 'answer');
        assert.match(reply.text, /sources conflict/i);
        assert.ok(reply.sources.length);
        assert.ok(reply.sources.every(source => source.review === 'conflicting'
            && (source.basedOn?.locator || source.locator).includes('#bwai-requirements')
            && (source.basedOn?.locator || source.locator).includes('#bwai-setup')));
    }
});


test('portable launcher accepts spaced name without adding a parent-subject choice', () => {
    for (const spoiler of tiers) {
        const reply = answer(bot(), 'How do I use BW AI Launcher on a portable install?', spoiler, /portable/i);
        assert.deepEqual(reply.recordIds, ['starcraft:bwai:portable']);
    }
});

test('first-launch cause keeps its grounded pronoun and reset removes that referent', () => {
    const assistant = bot();
    answer(assistant, 'Why does SCHNAIL take so long on its first launch?', 'direct', /downloads necessary game files/i);
    const followup = answer(assistant, 'Why is it slow the first time?', 'direct', /downloads necessary game files/i);
    assert.ok(followup.recordIds.includes('starcraft:narrative:schnail-first-launch-cause:cause'));
    assistant.answer('reset topic', { spoiler: 'direct' });
    assert.notEqual(assistant.answer('Why is it slow the first time?', { spoiler: 'direct' }).decision, 'answer');
});

test('source-compatibility question retains its explicit conflict fresh and in context', () => {
    for (const spoiler of tiers) {
        for (const prior of [false, true]) {
            const assistant = bot();
            if (prior) assistant.answer('What version does BWAILauncher need?', { spoiler });
            const reply = assistant.answer('Do those sources prove Remastered compatibility?', { spoiler });
            assert.notEqual(reply.decision, 'answer');
            assert.match(reply.text, /sources (?:disagree|conflict)/i);
            assert.ok(reply.sources.length && reply.sources.every(source => source.review === 'conflicting'));
        }
    }
});
