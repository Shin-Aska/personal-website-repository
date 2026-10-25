import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allRecords} from './load-records.mjs';
import {buildKnowledge, createKnowledgeRouter} from '../../js/assistant/knowledge.js';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const routerFor = game => createKnowledgeRouter(buildKnowledge(game,
    game === 'starcraft' ? read('./evidence/conversation-starcraft-source-records.json') : allRecords[game],
    read(`../../data/assistant/knowledge/${game}.json`)));

test('A software copy paraphrase keeps the actual separate-installation requirement', () => {
    const reply = routerFor('starcraft').plan('For SCHNAIL, do I need to install a separate copy of Brood War?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /includes its own version/);
    assert.match(reply.text, /don't need to install the game separately/);
    assert.deepEqual(reply.stateChanges, []);
});

test('An installation paraphrase cannot establish a price, edition or local installed state', () => {
    for (const text of [
        'Does SCHNAIL need a free separate copy of Brood War for Linux?',
        'Does SCHNAIL need to install a separate copy of Brood War for the NES edition?',
        'Have I already installed a separate copy of Brood War for SCHNAIL?'
    ]) assert.notEqual(routerFor('starcraft').plan(text)?.decision, 'answer', text);
});

test('Post-login network wording requires a witness that distinguishes login from subsequent play', () => {
    const router = routerFor('starcraft');
    assert.equal(router.plan('What is SCHNAIL?')?.decision, 'answer');
    const reply = router.plan('After the first login, is play still going over the internet?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /initial client login/);
    assert.match(reply.text, /All gameplay after login.*local network/);
    assert.match(reply.text, /no ongoing internet requirement during play/);
});

test('A whole-match network question quotes both login and gameplay conditions', () => {
    const router = routerFor('starcraft');
    router.plan('What is SCHNAIL?');
    const reply = router.plan('Will I need internet throughout a match?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /only required for the initial client login/);
    assert.match(reply.text, /no ongoing internet requirement during play/);
});

test('A network paraphrase cannot remove a new transport, numeric, edition or guarantee restriction', () => {
    for (const text of [
        'After the first login, is SCHNAIL play still going over the satellite internet?',
        'Will SCHNAIL need internet throughout a 30-hour match?',
        'After first login, does SCHNAIL guarantee zero latency over the internet?',
        'After first login, is SCHNAIL play still going over the internet in the SNES edition?'
    ]) assert.notEqual(routerFor('starcraft').plan(text)?.decision, 'answer', text);
});

test('An explicit combat utility request selects stated combat strengths, not a character motive', () => {
    const router = routerFor('albion');
    const help = router.plan('How does Melthas help against demons?');
    assert.equal(help?.decision, 'answer');
    assert.match(help.text, /Demon Exodus/);
    assert.match(help.text, /demon-type/);
    const utility = router.plan('Why would I bring Sira into a fight?');
    assert.equal(utility?.decision, 'answer');
    assert.match(utility.text, /crowd control/);
    assert.match(utility.text, /Frost\/Snare/);
    assert.notEqual(router.plan('Why does Sira need Trifalai Seeds?')?.decision, 'answer');
    assert.notEqual(router.plan('Why does Melthas fight demons?')?.decision, 'answer');
});

test('A recorded companion rule establishes the conversational actor without asserting a party change', () => {
    const router = routerFor('albion');
    const rule = router.plan('What happens to Sira if Melthas leaves?', {restrictions:{hypothetical:true}});
    assert.equal(rule?.decision, 'answer');
    assert.match(rule.text, /Always leaves with Melthas/);
    assert.deepEqual(rule.stateChanges, []);
    assert.deepEqual(rule.actions, []);
    assert.match(router.plan('Why would I bring her into a fight?').text, /crowd control/);
    assert.notEqual(router.plan('Has Sira already left my party?')?.decision, 'answer');
    assert.notEqual(router.plan('What happens to Sira if Quantum Turnip leaves?')?.decision, 'answer');
    assert.notEqual(router.plan('What happens to Sira if Melthas leaves?', {restrictions:{editions:['SNES']}})?.decision, 'answer');
});

test('A combined spell cost/effect request cannot be answered with the learning cost alone', () => {
    const reply = routerFor('albion').plan('What does Frost Avalanche cost and do?');
    assert.equal(reply?.decision, 'answer');
    assert.match(reply.text, /Freezes all enemies/);
    assert.match(reply.text, /30 SP/);
    assert.match(reply.text, /Trifalai Seed/);
    assert.ok(reply.sources.some(source => source.locator.includes('keySpells[0]')));
});

test('Inherited material and quantity constraints bind recorded rules and original-source fallbacks', () => {
    for (const restrictions of [{material:['Mars']}, {quantities:['30'],material:['day']}]) {
        assert.notEqual(routerFor('albion').plan('What happens to Sira if Melthas leaves?', {restrictions})?.decision, 'answer');
        assert.notEqual(routerFor('albion').plan('What does Frost Avalanche cost and do?', {restrictions})?.decision, 'answer');
    }
    assert.equal(routerFor('albion').plan('What happens to Sira if Melthas leaves?',
        {restrictions:{material:['Melthas']}})?.decision, 'answer');
});

test('A per-cast resource follow-up retains the established spell and requires an actual resource field', () => {
    const router = routerFor('albion');
    assert.equal(router.plan('What does Frost Avalanche do?')?.decision, 'answer');
    const resource = router.plan('What resource does each cast use?');
    assert.equal(resource?.decision, 'answer');
    assert.match(resource.text, /30 SP/);
    assert.match(resource.text, /Trifalai Seed/);
    const teacher = router.plan('Who offers the free training for it?');
    assert.equal(teacher?.decision, 'answer');
    assert.match(teacher.text, /Fasiir.*Jirinaar/);
    router.reset();
    assert.notEqual(router.plan('What resource does each cast use?')?.decision, 'answer');
});

test('An ungrounded pronoun requires a subject before any source lookup can answer', () => {
    for (const text of ['What does it do?', 'Who is he?', 'Where does she live?', 'What reward do they give?']) {
        const reply = routerFor('ultima7').plan(text);
        assert.equal(reply?.decision, 'clarify', text);
        assert.deepEqual(reply.sources, []);
    }
});

test('A passage answer belongs to its requested causal field rather than defining its subject', () => {
    const router = routerFor('ultima6');
    assert.match(router.plan('What produced the headless creatures?').text, /Wizard/);
    assert.match(router.plan('What part of a tangle vine causes sleep?').text, /Pods/);
    assert.match(router.plan('Where does Sulfurous Ash come from?').text, /Volcanic Eruptions/);
    assert.notEqual(router.plan('What is a tangle vine?')?.decision, 'answer');
    assert.notEqual(router.plan('What part of a tangle vine causes instant sleep?')?.decision, 'answer');
    assert.notEqual(router.plan('Where does Sulfurous Ash come from on Mars?')?.decision, 'answer');
});

test('An item recipient remains distinct from its seller when asking about the reward for helping him', () => {
    const router = routerFor('ultima7');
    const item = router.plan('How do I get the special orrery crystal?');
    assert.equal(item?.decision, 'answer');
    assert.match(item.text, /Addom.*20 gold.*Brion/);
    const checkpoint = router.checkpoint();
    router.plan('Who is Lord British?');
    assert.ok(!router.plan('What reward do I get for helping him?')?.text.includes('Brion'));
    assert.equal(router.restore(checkpoint), true);
    const reward = router.plan('What reward do I get for helping him?');
    assert.equal(reward?.decision, 'answer');
    assert.match(reward.text, /Brion activates the orrery/);
    assert.deepEqual(reward.stateChanges, []);
    router.reset();
    assert.notEqual(router.plan('What reward do I get for helping him?')?.decision, 'answer');
});

test('Age and measured-amount questions cannot be answered with an actor action or an unmeasured item', () => {
    const age = routerFor('ultima6').plan('Exactly how old is Anya?');
    assert.equal(age?.decision, 'decline');
    assert.deepEqual(age.sources, []);
    const router = routerFor('ultima7');
    router.plan('Where should I start looking for the silent wisp?');
    const amount = router.plan('Exactly how many ounces of honey do I have to hand over?');
    assert.equal(amount?.decision, 'decline');
    assert.deepEqual(amount.sources, []);
    assert.deepEqual(amount.stateChanges, []);
    assert.notEqual(router.plan('How many litres of honey do the emps require?')?.decision, 'answer');
});
