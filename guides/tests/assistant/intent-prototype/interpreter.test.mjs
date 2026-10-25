// Fake predictions below test dialogue structure only. They are deliberately
// NOT evidence of a trained classifier's semantic accuracy or calibration.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createInterpreter } from './interpreter.mjs';
import { allRecords } from '../load-records.mjs';

const fixture = (entityId, title, kind = 'npc', extra = {}) => ({ id: `${entityId}:fact`, entityId,
    title, kind, aliases: [], relation: 'explanation', minSpoiler: 'gentle',
    variants: { gentle: { text: `Source passage for ${title}.` } },
    source: { file: 'fixture.html', locator: title, review: 'extracted' }, ...extra });
const records = [fixture('batlin', 'Batlin'), fixture('iolo', 'Iolo'), fixture('nightshade', 'Nightshade', 'reagent'),
    fixture('siobhan', 'Siobhan'), fixture('secret', 'Hidden Keeper', 'npc', { minSpoiler: 'direct',
        variants: { direct: { text: 'Secret location.' } } }),
    fixture('a', 'Shared Name'), fixture('b', 'Shared Name')];
const prediction = label => [{ label, score: 0.9 }, { label: 'unknown', score: 0.1 }];
const make = (label = 'identity', extra = {}) => createInterpreter({ gameId: 'ultima7', records, classify: async () => prediction(label), ...extra });

test('supported games are explicit and scores are configurable raw gates', async () => {
    assert.throws(() => createInterpreter({ gameId: 'ultima6', records, classify() {} }), /only ultima7 and starcraft/);
    const a = make('identity', { classify: async () => [{ label: 'identity', score: 4 }, { label: 'use', score: 1 }], thresholds: { minScore: 2, minMargin: 2 } });
    assert.equal((await a.interpret('Who is Batlin?')).status, 'ready');
    assert.deepEqual((await a.interpret('Who is Batlin?')).confidence, { score: 4, margin: 3 });
});

test('visible source titles and aliases determine identity; spacing is direct', async () => {
    const a = make('location');
    const packet = await a.interpret('Where is Night shade?');
    assert.equal(packet.status, 'ready');
    assert.equal(packet.entityTitle, 'Nightshade');
    assert.equal(packet.canonicalQuestion, 'Where is Nightshade?');
    assert.equal(a.getState().pending, null);
    const identity = make();
    assert.equal((await identity.interpret('Who is Batlin?')).canonicalQuestion, 'Who is Batlin?');
    assert.equal((await identity.interpret('What is Nightshade?')).canonicalQuestion, 'What is Nightshade?');
});

test('production records supply names and spoiler-authorized variants', async () => {
    const a = make('identity', { records: allRecords.ultima7 });
    const packet = await a.interpret('Who is Batlin?');
    assert.equal(packet.status, 'ready');
    assert.ok(allRecords.ultima7.some(record => record.entityId === packet.entityId));
    const secret = make('location');
    assert.equal((await secret.interpret('Where is Hidden Keeper?', { spoiler: 'direct' })).status, 'ready');
    const lowered = await secret.interpret('Where is he?', { spoiler: 'gentle' });
    assert.notEqual(lowered.status, 'ready');
    assert.equal(secret.getState().subject, null);
});

test('each supported gameplay label has a bounded canonical shape', async () => {
    for (const [intent, question, expected] of [
        ['use', 'What does Nightshade do?', 'What does Nightshade do?'],
        ['acquisition', 'How can I get Nightshade?', 'How do I get Nightshade?'],
        ['stats', 'What are Batlin stats?', 'What are Batlin stats?'],
        ['combat', 'How can I fight Batlin?', 'How do I fight Batlin?'],
        ['prerequisites', 'What do I need before Batlin?', 'What do I need before Batlin?'],
        ['hint', 'How do I complete Batlin?', 'How do I complete Batlin?']
    ]) {
        const packet = await make(intent).interpret(question);
        assert.equal(packet.status, 'ready', question);
        assert.equal(packet.canonicalQuestion, expected);
    }
});

test('model prediction cannot erase original restrictions or event semantics', async () => {
    const cases = [
        ['Where is Batlin not?', 'location'], ['Where is Batlin without Iolo?', 'location'],
        ['Using only this guide, who is Batlin?', 'identity'], ['Who is Batlin in Serpent Isle?', 'identity'],
        ['Where are two Batlin?', 'location'], ['Is Batlin better than Iolo?', 'identity'],
        ['Why is Batlin evil?', 'identity'], ['Who killed Batlin?', 'identity'],
        ['Where was Batlin found?', 'location'], ['What did Batlin found?', 'identity'],
        ['I have recruited Batlin', 'acquisition'], ['If I recruited Batlin, where is he?', 'location'],
        ['Where is Batlin on Mars?', 'location'], ['Where is Batlin? What does he do?', 'location'],
        ['Who can use Nightshade?', 'use'], ['What does Nightshade cost?', 'use'],
        ['What does Batlin do after Iolo dies?', 'use'], ['What are Batlin rewards?', 'identity']
    ];
    for (const [question, intent] of cases) {
        const packet = await make(intent).interpret(question);
        assert.notEqual(packet.status, 'ready', question);
        assert.equal(packet.originalText, question);
        assert.equal(packet.canonicalQuestion, undefined, question);
    }
});

test('ambiguous subjects and unknown new names never borrow the old subject', async () => {
    const a = make('location');
    await a.interpret('Where is Batlin?');
    assert.equal((await a.interpret('Where is he?')).entityId, 'batlin');
    assert.equal((await a.interpret('Where is Shared Name?')).status, 'clarify');
    assert.notEqual((await a.interpret('Where is he?')).status, 'ready');
    await a.interpret('Where is Batlin?');
    assert.notEqual((await a.interpret('Where is Zargon?')).status, 'ready');
    assert.notEqual((await a.interpret('Where is he?')).status, 'ready');
    await a.interpret('Where is Batlin?');
    assert.notEqual((await a.interpret('Where is he near Zargon?')).status, 'ready');
    assert.equal(a.getState().subject, null);
});

test('one subject confirmation retains the requested intent, even if yes would classify differently', async () => {
    const a = make('location', { classify: async text => prediction(text === 'yes' ? 'identity' : 'location') });
    const typo = await a.interpret('Where is Siobahn?');
    assert.equal(typo.status, 'clarify');
    assert.equal(typo.transition, 'pending-subject');
    const confirmed = await a.interpret('yes');
    assert.equal(confirmed.intent, 'location');
    assert.equal(confirmed.canonicalQuestion, 'Where is Siobhan?');
    assert.equal(confirmed.requestedText, 'Where is Siobahn?');
    assert.equal(a.getState().pending, null);
    assert.notEqual((await a.interpret('yes')).status, 'ready');
});

test('compact proper-name typo derives visible candidates and accepts an explicit confirmation sentence', async () => {
    const a = make('identity', { records: allRecords.ultima7 });
    const first = await a.interpret('Could you identify timelrod for me?');
    assert.equal(first.transition, 'pending-subject');
    assert.equal(first.candidates[0].title, 'Time Lord');
    const second = await a.interpret('Yes, the time lord is the one I mean.');
    assert.equal(second.status, 'ready');
    assert.equal(second.intent, 'identity');
    assert.equal(second.canonicalQuestion, 'Who is Time Lord?');
});

test('external pending candidates are reauthorized and must be explicitly disambiguated', async () => {
    const a = make('location');
    await a.interpret('Where is Batlin?');
    assert.equal(a.setPending({ intent: 'location', entities: [{ entityId: 'siobhan', title: 'invented title' }, { entityId: 'batlin' }], originalText: 'Where is Siobahn?' }), true);
    assert.equal((await a.interpret('yes')).status, 'clarify');
    assert.equal(a.getState().pending, null);
    a.setPending({ intent: 'location', entities: [{ entityId: 'siobhan' }], originalText: 'Where is Siobahn?' });
    assert.equal((await a.interpret('Siobhan')).canonicalQuestion, 'Where is Siobhan?');
    a.setPending({ intent: 'location', entities: [{ entityId: 'siobhan' }], originalText: 'Where is Siobahn on Mars?' });
    const restricted = await a.interpret('yes');
    assert.equal(restricted.status, 'protected');
    assert.equal(restricted.canonicalQuestion, undefined);
    assert.equal(restricted.requestedText, 'Where is Siobahn on Mars?');
});

test('context, reset, help and help lowering clear subject and pending state', async () => {
    for (const command of ['reset', 'help', 'a gentler hint']) {
        const a = make('location');
        await a.interpret('Where is Batlin?');
        assert.equal((await a.interpret(command)).status, 'abstain');
        assert.equal(a.getState().subject, null);
        assert.notEqual((await a.interpret('Where is he?')).status, 'ready');
    }
    const a = make('location');
    await a.interpret('Where is Batlin?', { contextId: 'first' });
    assert.notEqual((await a.interpret('Where is he?', { contextId: 'second' })).status, 'ready');
    await a.interpret('Where is Batlin?'); a.resetTopic();
    assert.equal(a.getState().subject, null);
    await a.interpret('Where is Siobahn?'); a.resetSession();
    assert.equal(a.getState().pending, null);
});

test('unknown labels, low separation, malformed and missing predictions clarify', async () => {
    for (const values of [[], [{ label: 'identity', score: 0.9 }], prediction('mystery'), [{ label: 'identity', score: 0.4 }, { label: 'use', score: 0.2 }], [{ label: 'identity', score: 0.7 }, { label: 'use', score: 0.69 }], [{ label: 'identity', score: NaN }]]) {
        const a = make('identity', { classify: async () => values });
        const packet = await a.interpret('Who is Batlin?');
        assert.equal(packet.status, 'clarify');
        assert.equal(packet.canonicalQuestion, undefined);
    }
});

test('abstainAll prevents every rewrite even with high scores or an externally supplied pending choice', async () => {
    const a = make('location', { thresholds: { abstainAll: true } });
    const explicit = await a.interpret('Where is Batlin?');
    assert.equal(explicit.status, 'clarify');
    assert.equal(explicit.canonicalQuestion, undefined);
    assert.deepEqual(explicit.confidence, { score: 0.9, margin: 0.8 });
    assert.match(explicit.reason, /rejected all/);
    // Linking remains independent of permission to canonicalize.
    assert.equal(explicit.entityId, 'batlin');
    assert.equal(a.getState().subject.entityId, 'batlin');
    a.setPending({ intent: 'location', entities: [{ entityId: 'siobhan' }], originalText: 'Where is Siobahn?' });
    const confirmation = await a.interpret('yes');
    assert.equal(confirmation.status, 'clarify');
    assert.equal(confirmation.canonicalQuestion, undefined);
    assert.match(confirmation.reason, /rejected all/);
});

test('protected relations and material retain explicit synthetic subjects without granting answer permission', async () => {
    const a = make('why', { records: [fixture('fenlor', 'Fenlor'), fixture('merova', 'Merova')],
        classify: async text => prediction(/^where/i.test(text) ? 'location' : /better/i.test(text) ? 'comparison' : 'why') });
    for (const text of ['Why did Fenlor disappear?', 'Why does he matter?', 'Is he better?']) {
        const packet = await a.interpret(text);
        assert.equal(packet.status, 'protected', text);
        assert.equal(packet.originalText, text);
        assert.equal(packet.entityId, 'fenlor');
        assert.equal(packet.canonicalQuestion, undefined);
        assert.equal(a.getState().subject.entityId, 'fenlor');
    }
    assert.equal((await a.interpret('Where is he?')).canonicalQuestion, 'Where is Fenlor?');
    const qualified = await a.interpret('Where is Merova on Mars?');
    assert.equal(qualified.status, 'protected');
    assert.equal(qualified.entityId, 'merova');
    assert.equal((await a.interpret('Where is she?')).entityId, 'merova');
});

test('protected wording cannot borrow an old synthetic subject for an unknown subject or ambiguous pair', async () => {
    const a = make('why', { records: [fixture('fenlor', 'Fenlor'), fixture('merova', 'Merova')],
        classify: async text => prediction(/^where/i.test(text) ? 'location' : 'why') });
    for (const text of ['Why did Zaxivar disappear?', 'Why did Zaxivar follow him?', 'Why did Fenlor and Merova disappear?', 'Why did Merova follow him?']) {
        await a.interpret('Where is Fenlor?');
        const packet = await a.interpret(text);
        assert.notEqual(packet.status, 'ready');
        assert.equal(packet.entityId, null, text);
        assert.equal(a.getState().subject, null, text);
        assert.notEqual((await a.interpret('Where is he?')).status, 'ready');
    }
});

test('async results cannot restore a reset subject or overwrite a newer interpretation', async () => {
    const resolvers = [];
    const a = make('location', { classify: () => new Promise(resolve => resolvers.push(resolve)) });
    const old = a.interpret('Where is Batlin?');
    a.resetTopic(); resolvers.shift()(prediction('location'));
    assert.equal((await old).transition, 'stale');
    assert.equal(a.getState().subject, null);
    const first = a.interpret('Where is Batlin?');
    const second = a.interpret('Where is Iolo?');
    resolvers[1](prediction('location')); assert.equal((await second).entityId, 'iolo');
    resolvers[0](prediction('location')); assert.equal((await first).transition, 'stale');
    assert.equal(a.getState().subject.entityId, 'iolo');
});

test('real Ultima VII identity supports shared location, stats, and qualified job follow-ups', async () => {
    const seen = [];
    const a = make('identity', { records: allRecords.ultima7, classify: async (text, context) => {
        seen.push(context);
        return prediction(text === 'stats?' ? 'stats' : /^where/i.test(text) ? 'location' : 'identity');
    } });
    assert.equal((await a.interpret('Who is Lord British?')).canonicalQuestion, 'Who is Lord British?');
    assert.equal((await a.interpret('where is he?')).canonicalQuestion, 'Where is Lord British?');
    assert.equal((await a.interpret('stats?')).canonicalQuestion, 'What are Lord British stats?');
    const job = await a.interpret('and his job?');
    assert.equal(job.status, 'ready');
    assert.equal(job.qualifier, 'job');
    assert.equal(job.canonicalQuestion, "What is Lord British's job?");
    assert.equal(seen.at(-1).subject.title, 'Lord British');
    assert.equal(seen.at(-1).previousIntent, 'stats');
});

test('real StarCraft snapshot uses shared acquisition fragments and preserves method and link format', async () => {
    // Existing checked-in live-DOM extraction, not invented model evidence.
    const starcraft = JSON.parse(fs.readFileSync(new URL('../evidence/conversation-starcraft-source-records.json', import.meta.url)));
    const a = createInterpreter({ gameId: 'starcraft', records: starcraft,
        classify: async text => prediction(/^what is/i.test(text) ? 'identity' : 'acquisition') });
    assert.equal((await a.interpret('what is schnail')).canonicalQuestion, 'What is SCHNAIL?');
    for (const text of ['download link', 'download link of schnail', 'link?']) {
        const packet = await a.interpret(text);
        assert.equal(packet.status, 'ready', text);
        assert.equal(packet.entityId, 'starcraft:schnail');
        assert.equal(packet.method, 'download');
        assert.equal(packet.requestedFormat, 'link');
        assert.equal(packet.canonicalQuestion, 'Where can I download SCHNAIL?');
    }
});

test('same fragment implementation works for arbitrary subjects in both supported games', async () => {
    for (const gameId of ['ultima7', 'starcraft']) {
        const a = createInterpreter({ gameId, records: [fixture('orb', 'Veyra Orb', 'item')],
            classify: async text => prediction(/^what is/i.test(text) ? 'identity' : 'acquisition') });
        await a.interpret('What is Veyra Orb?');
        for (const [text, method, canonical] of [['download link', 'download', 'Where can I download Veyra Orb?'], ['buy', 'buy', 'How do I buy Veyra Orb?'], ['recruit', 'recruit', 'How do I recruit Veyra Orb?']]) {
            const packet = await a.interpret(text);
            assert.equal(packet.status, 'ready');
            assert.equal(packet.method, method);
            assert.equal(packet.canonicalQuestion, canonical);
        }
    }
});

test('fragments preserve inherited source, edition, negation, numeric and material constraints and block lossy engine replay', async () => {
    for (const gameId of ['ultima7', 'starcraft']) {
        for (const first of ['Using only this guide, what is Veyra Orb?', 'What is Veyra Orb in Serpent Isle?', 'What is Veyra Orb not?', 'Where are two Veyra Orb?', 'Where is Veyra Orb on Mars?']) {
            const a = createInterpreter({ gameId, records: [fixture('orb', 'Veyra Orb', 'item')], classify: async text => prediction(text === 'download link' ? 'acquisition' : 'identity') });
            assert.equal((await a.interpret(first)).entityId, 'orb', first);
            const fragment = await a.interpret('download link');
            assert.equal(fragment.status, 'protected', first);
            assert.equal(fragment.entityId, 'orb');
            assert.equal(fragment.blockReplay, true);
            assert.equal(fragment.canonicalQuestion, undefined);
            assert.equal(fragment.originalText, 'download link');
            assert.ok(fragment.replayReason);
            const fresh = await a.interpret('What is Veyra Orb?');
            assert.equal(fresh.status, 'ready', 'a fresh explicit request starts a new constraint frame');
            assert.equal((await a.interpret('download link')).status, 'ready');
        }
    }
});

test('fragment binding does not guess a new name, erase fresh restrictions, or invent a missing subject', async () => {
    const a = make('acquisition');
    assert.equal((await a.interpret('download link')).status, 'clarify');
    for (const text of ['download link of Zaxivar', 'download link on Mars', 'download link without Iolo', 'stats for Zaxivar']) {
        await a.interpret('How do I get Nightshade?');
        const packet = await a.interpret(text);
        assert.notEqual(packet.status, 'ready', text);
        assert.equal(packet.canonicalQuestion, undefined);
        assert.notEqual(packet.entityId, 'nightshade');
        assert.notEqual((await a.interpret('download link')).status, 'ready');
    }
});

test('an unsupported causal follow-up cannot erase inherited material constraints before a later fragment', async () => {
    const a = make('location', { classify: async text => prediction(/^why/i.test(text) ? 'why' : text === 'stats?' ? 'stats' : 'location') });
    await a.interpret('Where is Batlin on Mars?');
    const why = await a.interpret('Why does he matter?');
    assert.equal(why.blockReplay, true);
    assert.ok(why.restrictions.material.includes('mars'));
    const stats = await a.interpret('stats?');
    assert.equal(stats.status, 'protected');
    assert.equal(stats.blockReplay, true);
    assert.ok(stats.restrictions.material.includes('mars'));
    assert.equal(stats.canonicalQuestion, undefined);
});

test('compositional fragment slots accept shared neutral modifiers while preserving procedural and numeric qualifiers', async () => {
    for (const gameId of ['ultima7', 'starcraft']) {
        const a = createInterpreter({ gameId, records: [fixture('veyra', 'Veyra Orb', 'item')], classify: async text => prediction(
            /^what is/i.test(text) ? 'identity' : /installation/i.test(text) ? 'use' : /attributes|numbers/i.test(text) ? 'stats' : /where/i.test(text) ? 'location' : 'acquisition') });
        await a.interpret('What is Veyra Orb?');
        for (const [text, intent, qualifier, expected] of [
            ['installation instructions', 'use', 'installation', 'How do I install Veyra Orb?'],
            ['base attributes', 'stats', 'base', 'What are Veyra Orb base stats?'],
            ['listed whereabouts', 'location', undefined, 'Where is Veyra Orb?'],
            ['starting numbers', 'stats', 'starting', 'What are Veyra Orb starting stats?'],
            ['download address', 'acquisition', undefined, 'Where can I download Veyra Orb?']
        ]) {
            const packet = await a.interpret(text);
            assert.equal(packet.status, 'ready', text);
            assert.equal(packet.intent, intent);
            assert.equal(packet.qualifier, qualifier);
            assert.equal(packet.canonicalQuestion, expected);
            assert.equal(packet.routeOrigin, 'model');
            assert.equal(packet.modelIntent, intent);
            if (intent === 'acquisition') assert.equal(packet.requestedFormat, 'link');
        }
    }
});

test('current-adventure framing is removed without poisoning the subject frame or erasing unknown games and editions', async () => {
    const a = make('identity', { records: allRecords.ultima7, classify: async text => prediction(/^where/i.test(text) ? 'location' : /^stats/i.test(text) ? 'stats' : 'identity') });
    for (const text of ['Explain who Iolo is in this adventure', 'Tell me who Iolo is', 'I want to identify Iolo']) {
        assert.equal((await a.interpret(text)).canonicalQuestion, 'Who is Iolo?');
        assert.equal((await a.interpret('where is he listed?')).canonicalQuestion, 'Where is Iolo?');
        assert.equal((await a.interpret('stats?')).canonicalQuestion, 'What are Iolo stats?');
    }
    for (const text of ['Explain who Iolo is in Serpent Isle', 'Tell me who Iolo is in Albion', 'I want to identify Iolo on Mars']) {
        const packet = await a.interpret(text);
        assert.notEqual(packet.status, 'ready', text);
        assert.equal(packet.canonicalQuestion, undefined);
    }
});

test('new-topic commands process their remaining request, and a genuine pending candidate accepts a full confirmation', async () => {
    const a = make('identity', { records: allRecords.ultima7 });
    await a.interpret('Using only this guide, who is Iolo?');
    const changed = await a.interpret('New topic: identify Sentri');
    assert.equal(changed.status, 'ready');
    assert.equal(changed.transition, 'topic-change');
    assert.equal(changed.canonicalQuestion, 'Who is Sentri?');
    assert.equal(changed.restrictions.guideOnly, false);
    const typo = await a.interpret('Could you identify timelrod for me?');
    assert.equal(typo.transition, 'pending-subject');
    const confirmed = await a.interpret('Yes, that is the one.');
    assert.equal(confirmed.status, 'ready');
    assert.equal(confirmed.routeOrigin, 'pending-confirmation');
    assert.equal(confirmed.canonicalQuestion, 'Who is Time Lord?');
    assert.notEqual((await a.interpret('Yes, that is the one.')).status, 'ready');
});

test('exact relation fallback is explicitly separate from model correctness and never bypasses abstainAll', async () => {
    const a = make('identity', { classify: async text => prediction(/^who/i.test(text) ? 'identity' : 'unknown') });
    await a.interpret('Who is Batlin?');
    const stats = await a.interpret('stats?');
    assert.equal(stats.status, 'ready');
    assert.equal(stats.modelIntent, 'unknown');
    assert.equal(stats.intent, 'stats');
    assert.equal(stats.routeOrigin, 'exact-relation');
    const unknown = await a.interpret('red stats');
    assert.notEqual(unknown.status, 'ready');
    assert.equal(unknown.routeOrigin, 'model');
    const reject = make('identity', { classify: async () => prediction('unknown'), thresholds: { abstainAll: true } });
    assert.notEqual((await reject.interpret('stats')).status, 'ready');
    assert.equal((await reject.interpret('stats')).routeOrigin, 'model');
});
