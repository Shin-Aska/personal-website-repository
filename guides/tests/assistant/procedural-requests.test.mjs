import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseProceduralRequest, supportsProceduralRequest } from '../../js/assistant/procedural-requests.js';

const u6 = JSON.parse(await readFile(new URL('../../data/assistant/knowledge/ultima6.json', import.meta.url), 'utf8'));
const u7 = JSON.parse(await readFile(new URL('../../data/assistant/knowledge/ultima7.json', import.meta.url), 'utf8'));
const albion = JSON.parse(await readFile(new URL('../../data/assistant/knowledge/albion.json', import.meta.url), 'utf8'));
const find = (data, id) => {
    const fact = data.facts.find(fact => fact.id === id);
    assert.ok(fact, `Expected actual source fact ${id}`);
    return fact;
};
const preparation = parseProceduralRequest('How do I prepare for Swamp Cave?');
const crafting = parseProceduralRequest('How do I use the Black Sword forge?');
const returning = parseProceduralRequest('How do I return the Honor rune?');
const delivery = parseProceduralRequest('How do I deliver The Wizard of Oz?');
const fact = text => ({ text, witness: text, answerRelations: ['method'] });

test('Explicit procedure grammar classifies phases without choosing a subject', () => {
    assert.deepEqual(preparation, { kind: 'preparation', subjectText: 'Swamp Cave', originalText: 'How do I prepare for Swamp Cave?' });
    assert.deepEqual(crafting, { kind: 'crafting', subjectText: 'the Black Sword forge', originalText: 'How do I use the Black Sword forge?' });
    assert.deepEqual(returning, { kind: 'return', subjectText: 'the Honor rune', originalText: 'How do I return the Honor rune?' });
    for (const [question, kind] of [
        ['How should we get ready for the cave?', 'preparation'],
        ['How can I forge the Black Sword?', 'crafting'],
        ['How must I construct a bridge?', 'crafting'],
        ['How do I take back the rune?', 'return'],
        ['How should I deliver the rune back to the pedestal?', 'delivery']
    ]) assert.equal(parseProceduralRequest(question)?.kind, kind, question);
});

test('The complete input and all suffix modifiers survive parsing', () => {
    for (const [question, subjectText] of [
        ['  How do I prepare for Swamp Cave without boots in the XYZ edition?  ', 'Swamp Cave without boots in the XYZ edition'],
        ['How do I forge the Black Sword after I lose the gem?', 'the Black Sword after I lose the gem'],
        ['How do I use the Black Sword forge with a frobnicator?', 'the Black Sword forge with a frobnicator'],
        ['How do I return the Honor rune and get the Moonstone?', 'the Honor rune and get the Moonstone'],
        ['How do I prepare for the cave if I already sold my boots?', 'the cave if I already sold my boots'],
        ['How do I return the rune to the unknown blue altar?', 'the rune to the unknown blue altar']
    ]) {
        const descriptor = parseProceduralRequest(question);
        assert.equal(descriptor.originalText, question);
        assert.equal(descriptor.subjectText, subjectText);
    }
});

test('Actual Swamp Cave source preparation is distinct from travel and loot', () => {
    assert.equal(supportsProceduralRequest(preparation, find(u6, 'side-3-step-0')), true);
    assert.equal(supportsProceduralRequest(preparation, find(u6, 'side-3-step-1')), false);
    assert.equal(supportsProceduralRequest(preparation, find(u6, 'side-3-step-2')), false);
});

test('Actual before-sailing supplies differ from a later book delivery for reward', () => {
    const dungeonPreparation = parseProceduralRequest('How do I prepare for Dungeon Deceit?');
    assert.equal(supportsProceduralRequest(dungeonPreparation, find(u6, 'side-4-step-0')), true);
    assert.equal(supportsProceduralRequest(dungeonPreparation, find(u6, 'side-1-step-1')), false);
});

test('Actual Black Sword source forging is distinct from invoking the finished sword', () => {
    const forge = find(u7, 'black-sword-forging');
    assert.equal(supportsProceduralRequest(crafting, forge), true);
    assert.equal(supportsProceduralRequest(parseProceduralRequest('How do I forge the Black Sword?'), forge), true);
    const finished = u7.facts.find(fact => fact.text === "Return to Dracothraxus and invoke the Black Sword's power to finish the test.");
    assert.ok(finished);
    assert.equal(supportsProceduralRequest(crafting, finished), false);
    assert.equal(supportsProceduralRequest(returning, finished), false, 'Travel back is not transitive item return');
});

test('Actual Honor rune return is distinct from the promise made when taking it', () => {
    assert.equal(supportsProceduralRequest(returning, find(u6, 'honor-return')), true);
    assert.equal(supportsProceduralRequest(returning, find(u6, 'honor-pedestal')), false);
});

test('Actual book hand-ins prove delivery without proving return or preparation', () => {
    for (const [id, name] of [['side-1-step-0', 'The Wizard of Oz'],
        ['side-1-step-1', "Snilwit's Big Book of Boardgame Strategy"], ['side-1-step-2', 'The Lost Book of Mantras']]) {
        const descriptor = parseProceduralRequest(`How do I deliver ${name}?`);
        const source = find(u6, id);
        assert.equal(descriptor.kind, 'delivery');
        assert.equal(supportsProceduralRequest(descriptor, source), true, id);
        assert.equal(supportsProceduralRequest(returning, source), false, id);
        assert.equal(supportsProceduralRequest(preparation, source), false, id);
    }
    const question = 'How do I deliver The Lost Book of Mantras to an unknown blue wisp without gold?';
    assert.deepEqual(parseProceduralRequest(question), { kind: 'delivery',
        subjectText: 'The Lost Book of Mantras to an unknown blue wisp without gold', originalText: question });
});

test('Preparation requires affirmative supply or equipment instructions', () => {
    for (const text of ['Equip every companion with boots.', 'Prepare Telekinesis.', 'Bring boots and a rope before entering.',
        'Bring boots for the journey.', 'Bring the required boots.',
        'Pack food.', 'Stock the party with reagents.', 'Mix the required spell before entering.']) {
        assert.equal(supportsProceduralRequest(preparation, fact(text)), true, text);
    }
    for (const text of ['The boots are useful equipment.', 'Travel to the cave after buying boots.',
        'You need boots.', 'He says to equip boots.', 'If you equip boots, enter the cave.',
        'Do not equip boots.', 'Plan to bring boots.', 'Ask whether to equip boots and prepare spells.',
        'Take the loot and promise to bring boots.', 'Bring boots and a rope.',
        'Bring the reward to the king.', 'Bring the required reward to the king.',
        'Bring the reward back before entering.']) {
        assert.equal(supportsProceduralRequest(preparation, fact(text)), false, text);
    }
});

test('Item return parsing leaves intransitive navigation to the normal route path', () => {
    for (const question of ['How do I return to Britain?', 'How do I return from the cave?',
        'How do I return here?', 'How do I return there with the rune?', 'How do I return back to Britain?',
        'How do I return to?', 'How do I return?']) {
        assert.equal(parseProceduralRequest(question), null, question);
    }
    const question = 'How do I return the rune from Britain with an unknown amulet?';
    assert.deepEqual(parseProceduralRequest(question), {
        kind: 'return', subjectText: 'the rune from Britain with an unknown amulet', originalText: question
    });
    assert.equal(supportsProceduralRequest(returning, find(u6, 'honor-return')), true);
    const route = u7.facts.find(fact => fact.text === "Return to Dracothraxus and invoke the Black Sword's power to finish the test.");
    assert.ok(route);
    assert.equal(supportsProceduralRequest(returning, route), false);
});

test('An action without an object does not witness any requested procedure', () => {
    for (const [descriptor, texts] of [
        [preparation, ['Equip.', 'Prepare.', 'Bring.', 'Pack.', 'Stock.', 'Mix.']],
        [crafting, ['Forge.', 'Craft.', 'Make.', 'Create.', 'Construct.', 'Bind.']],
        [returning, ['Return.', 'Take back.', 'Deliver.']],
        [delivery, ['Give.', 'Bring.', 'Offer.', 'Hand.', 'Hand over.', 'Hand over to the king.', 'Deliver.']]
    ]) for (const text of texts) assert.equal(supportsProceduralRequest(descriptor, fact(text)), false, text);
});

test('Crafting needs an actual operation rather than a forge name or generic use', () => {
    for (const text of ['Craft the blade from iron.', 'Forge the sword.', 'Create the sword from iron.',
        'Make the helmet from ore.', 'Construct the bridge.', 'Bind the daemon into the blade.',
        'Use the forge and hammer to craft a sword.']) {
        assert.equal(supportsProceduralRequest(crafting, fact(text)), true, text);
    }
    for (const text of ['Use the Black Sword forge.', 'Visit the forge.', 'The forge creates swords.',
        'The blade can be forged here.', 'Make sure to invoke the finished sword.',
        'Make your way to the forge.', 'Create a distraction and invoke the sword.',
        'Promise to forge the sword.', 'Do not forge the sword.', 'Bind the prisoner.']) {
        assert.equal(supportsProceduralRequest(crafting, fact(text)), false, text);
    }
});

test('Return requires an actual direct instruction and excludes intention and reporting', () => {
    for (const text of ['Return the rune to the pedestal.', 'Take back the rune.', 'Take the rune back to the shrine.',
        'Deliver the rune back to the pedestal.',
        'Cleanse the shrine, recover the Moonstone, then return the rune to the pedestal.']) {
        assert.equal(supportsProceduralRequest(returning, fact(text)), true, text);
    }
    for (const text of ['Promise to return it soon.', 'Take the rune and promise to return it soon.',
        'Take the rune and plan to return it.', 'He requests that you return the rune.',
        'Ask how to return the rune.', 'Do not return the rune.', 'If you return the rune, the shrine is restored.',
        'The rune should be returned to the pedestal.', 'Return to the shrine.',
        'Take the rune from the pedestal.', 'The return destination is the pedestal.',
        'Deliver the rune to the pedestal.', 'Give the book to the king.', 'Offer the book to the wisps.']) {
        assert.equal(supportsProceduralRequest(returning, fact(text)), false, text);
    }
});

test('Delivery requires an affirmative item-to-recipient instruction in one literal fact', () => {
    for (const text of ['Give the book to the king.', 'Bring the book to the king.', 'Offer the book to the wisps.',
        'Hand the book to the king.', 'Hand over the book to the king.', 'Hand the book over to the king.',
        'Deliver the book to the king.', 'Find the book and give it to the king.']) {
        assert.equal(supportsProceduralRequest(delivery, fact(text)), true, text);
    }
    for (const text of ['Promise to give the book to the king.', 'Ask how to give the book to the king.',
        'Do not offer the book to the wisps.', 'Find the book and promise to give it to the king.',
        'Give the book.', 'Find the book.', 'Bring boots before entering.', 'The book belongs to the king.',
        'Offer to give the king a book.', 'Hand over to the king.', 'Return to the king.']) {
        assert.equal(supportsProceduralRequest(delivery, fact(text)), false, text);
    }
    const source = find(u6, 'side-1-step-0');
    assert.equal(supportsProceduralRequest(delivery, { ...source, witness: 'Give it to Lord British.' }), false);
    assert.equal(supportsProceduralRequest(delivery, { ...source, answerRelations: ['location', 'outcome'] }), false);
});

test('Only the complete fact text and explicit supported roles supply phase proof', () => {
    const actual = Object.freeze({ ...find(u6, 'side-3-step-0') });
    const descriptor = Object.freeze({ ...preparation });
    assert.equal(supportsProceduralRequest(descriptor, actual), true);
    for (const answerRelations of [['method'], ['acquisition'], ['use'], ['destination'], ['route']]) {
        assert.equal(supportsProceduralRequest(descriptor, { ...actual, answerRelations }), true);
    }
    for (const unsupported of [
        { ...actual, text: 'Equip every companion with swamp boots.' },
        { ...actual, witness: undefined }, { ...actual, answerRelations: [] },
        { ...actual, answerRelations: ['location', 'sequence', 'prerequisites'] },
        { ...actual, answerRelations: undefined, facet: 'method' },
        { ...fact('Search the dead mage.'), title: 'Prepare for the cave', aliases: ['Equip boots'] },
        actual.text, null
    ]) assert.equal(supportsProceduralRequest(descriptor, unsupported), false);
    assert.equal(supportsProceduralRequest(null, actual), false);
    assert.equal(supportsProceduralRequest({ kind: 'unknown' }, actual), false);
    assert.deepEqual(descriptor, preparation);
});

test('Incomplete, unsupported and ambiguous forms stay outside the finite grammar', () => {
    for (const question of ['', null, {}, 'How do I prepare for?', 'How do I forge?', 'How do I return?',
        'How do I prepare?', 'How do I use the Black Sword?', 'Where is the forge?',
        'Can I return the rune?', 'How do I prepare or return the rune?',
        'If I have boots, how do I prepare for Swamp Cave?', 'Tell me how to forge the sword.']) {
        assert.equal(parseProceduralRequest(question), null, String(question));
    }
});

test('Causative software and make idioms stay outside the crafting grammar', () => {
    for (const question of ['How do I make BWAPI work?', 'How do I make BWAPI work on Windows?',
        'How do I make it run faster?', 'How do I make the program install correctly?',
        'How do I make sure the sword is sharp?', 'How do I make certain the sword is sharp?',
        'How do I make my way to the forge?', 'How do I make use of the sword?',
        'How do I create a way to run BWAPI?', 'How do I make money with mountain pass bandits?',
        'How do I make money?', 'How do I make a profit from bandits?', 'How do I make a living by trading?']) {
        assert.equal(parseProceduralRequest(question), null, question);
    }
    for (const [question, subjectText] of [
        ['How do I make the Black Sword?', 'the Black Sword'],
        ['How do I create a sharp blade from unknown ore?', 'a sharp blade from unknown ore'],
        ['How do I make the blade with a frobnicator?', 'the blade with a frobnicator'],
        ['How do I forge the Black Sword before I make BWAPI work?', 'the Black Sword before I make BWAPI work'],
        ['How do I make a Sword of Work?', 'a Sword of Work'],
        ['How do I make Money Sword with unknown ore?', 'Money Sword with unknown ore'],
        ['How do I make money charms?', 'money charms']
    ]) assert.deepEqual(parseProceduralRequest(question), { kind: 'crafting', subjectText, originalText: question });
});

test('Passive crafting retains its complete object, modifiers, edition and extra clauses', () => {
    for (const [question, subjectText] of [
        ['How is the Black Sword forged in Forge of Virtue?', 'the Black Sword in Forge of Virtue'],
        ['How are two radioactive Black Swords crafted without the gem in XYZ edition?', 'two radioactive Black Swords without the gem in XYZ edition'],
        ['How is the forged steel blade crafted after the gem is created?', 'the forged steel blade after the gem is created'],
        ['How was it made with unknown ore?', 'it with unknown ore'],
        ['How is the Black Sword forged and the gem returned?', 'the Black Sword and the gem returned']
    ]) assert.deepEqual(parseProceduralRequest(question), { kind: 'crafting', subjectText, originalText: question });
    const passive = parseProceduralRequest('How is the Black Sword forged in Forge of Virtue?');
    assert.equal(supportsProceduralRequest(passive, find(u7, 'black-sword-forging')), true);
    for (const text of ['Invoke the finished Black Sword to complete the test.',
        'The Black Sword is forged and the test is complete.', 'The forged Black Sword is powerful.']) {
        assert.equal(supportsProceduralRequest(passive, fact(text)), false, text);
    }
    for (const question of ['How is the Black Sword used?', 'How is the forged sword?', 'How is it?',
        'How is the sword sharp?', 'How is the sword completed?']) {
        assert.equal(parseProceduralRequest(question), null, question);
    }
});

test('Transport and concealment parsing leaves object grounding and all constraints intact', () => {
    for (const [question, kind, subjectText] of [
        ['How do I get it past security?', 'transport', 'it past security'],
        ['How can I carry them past security?', 'transport', 'them past security'],
        ['How do I bring two radioactive Pistols past armed security in XYZ edition?', 'transport', 'two radioactive Pistols past armed security in XYZ edition'],
        ['How do I take the Pistol past security without the Canisters?', 'transport', 'the Pistol past security without the Canisters'],
        ['How do I hide it in the wall cabinet on the service level?', 'concealment', 'it in the wall cabinet on the service level'],
        ['How can I store the Pistol in an unknown locked cabinet and return the gem?', 'concealment', 'the Pistol in an unknown locked cabinet and return the gem']
    ]) assert.deepEqual(parseProceduralRequest(question), { kind, subjectText, originalText: question });
    for (const question of ['How do I get the Pistol?', 'How do I carry it?', 'How do I hide it?',
        'How do I carry past security?', 'How do I hide in the cabinet?']) {
        assert.equal(parseProceduralRequest(question), null, question);
    }
});

test('Actual Albion concealment proves security transport and pickup never does', () => {
    const transport = parseProceduralRequest('How do I get it past security?');
    const storage = find(albion, 'hide-weapon');
    const pickup = albion.facts.find(item => item.text === 'In the COM room, examine the damaged console to get the Pistol + Canisters; grab the extra Stimdrinks from the east drawer.');
    assert.ok(pickup);
    assert.equal(supportsProceduralRequest(transport, storage), true);
    assert.equal(supportsProceduralRequest(transport, pickup), false);
    assert.equal(supportsProceduralRequest(parseProceduralRequest('How can I carry them past security?'), storage), true);
    assert.equal(supportsProceduralRequest(parseProceduralRequest('How do I hide it in the wall cabinet on the service level?'), storage), true);
    for (const question of ['How do I get it past armed security?', 'How do I get it past security in XYZ edition?',
        'How do I get it past security without the Canisters?', 'How do I get it past security and return the gem?',
        'How do I hide it in the locked wall cabinet on the service level?',
        'How do I hide it in the wall cabinet on an unknown level?']) {
        assert.equal(supportsProceduralRequest(parseProceduralRequest(question), storage), false, question);
    }
});

test('Storage phase proof requires a literal affirmative action and exact security relation', () => {
    const transport = parseProceduralRequest('How do I get the Pistol past security?');
    for (const text of ['Hide the Pistol in the wall cabinet before passing security.',
        'Stash the Pistol in the wall cabinet before going past security.',
        'Store the Pistol inside the wall cabinet before getting past security.',
        'After looting the COM room, hide the Pistol in the wall cabinet before passing security.']) {
        assert.equal(supportsProceduralRequest(transport, fact(text)), true, text);
    }
    for (const text of ['Get the Pistol from the COM room before passing security.',
        'Take the Pistol before passing security.', 'Use the Pistol before passing security.',
        'Hide the Pistol before passing security.', 'Hide the Pistol in the wall cabinet.',
        'Hide the Pistol in the wall cabinet near security.', 'Hide the Pistol in security.',
        'Hide the Pistol in the wall cabinet before passing the guard.',
        'Do not hide the Pistol in the wall cabinet before passing security.',
        'If you hide the Pistol in the wall cabinet before passing security, continue.',
        'He asks you to hide the Pistol in the wall cabinet before passing security.',
        'The Pistol is stored in the wall cabinet before passing security.']) {
        assert.equal(supportsProceduralRequest(transport, fact(text)), false, text);
    }
    const text = 'Get the Pistol from the COM room.';
    assert.equal(supportsProceduralRequest(transport, { ...fact(text), aliases: ['Hide the Pistol in the wall cabinet before passing security.'] }), false);
    const storage = find(albion, 'hide-weapon');
    for (const answerRelations of [['acquisition'], ['use'], ['route'], ['destination']]) {
        assert.equal(supportsProceduralRequest(transport, { ...storage, answerRelations }), false);
    }
    assert.equal(supportsProceduralRequest(transport, { ...storage, witness: 'Hide the Pistol.' }), false);
});
