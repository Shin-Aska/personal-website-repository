// Independent fictional fixtures for the narrative record and authorization
// contracts. No game data, shared fixtures or generated reports are modified.
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNarrativeRecords, narrativeRecordIssues, validNarrativeMetadata,
    validNarrativeSource } from '../../js/assistant/topics.js';
import { authorize } from '../../js/assistant/policy.js';

const gameId = 'narrative-contract';
const overlayFile = 'fictional/narrative-overlay.json';
const guideFile = 'fictional/narrative-guide.txt';
const fact = (text, locator, extra = {}) => ({ text, minSpoiler: 'balanced',
    source: { file: guideFile, locator, review: 'extracted' }, ...extra });
const texts = {
    identity: 'Mira is the keeper of the bronze gate.',
    event: 'Mira opened the bronze gate during the festival.',
    cause: 'Mira opened the bronze gate because Nera needed shelter.',
    method: 'Mira opened the bronze gate using a silver key.',
    outcome: 'When Mira opened the bronze gate, Nera reached the shelter.',
    sequence: 'After Mira opened the bronze gate, Nera reached the shelter.',
    relationship: 'Mira is the sister of Nera.',
    purpose: 'Mira maintains the bronze gate to protect the shelter.',
    summary: 'Mira keeps the bronze gate. Nera lives inside the shelter.',
};
const facts = new Map(Object.entries(texts).map(([key, text]) => [key, fact(text, `facts[${key}]`)]));
function definition(aspect = 'cause', extra = {}) {
    return { id: `mira-${aspect}`, entityId: `${gameId}:mira`, kind: 'npc', title: 'Mira',
        aliases: ['gate keeper'], minSpoiler: 'balanced', overlayFile, from: [aspect],
        narrative: { aspect, subjects: ['Mira'], context: [],
            ...(['cause', 'method', 'outcome', 'sequence'].includes(aspect) ? { predicate: 'opened' } : {}),
            ...(aspect === 'sequence' ? { sequenceMode: 'events' } : {}),
            ...(aspect === 'relationship' ? { predicate: 'sister', context: ['Nera'] } : {}) }, ...extra };
}
const record = (aspect = 'cause') => buildNarrativeRecords(gameId, [definition(aspect)], facts)[0];
const researchFact = (text, key, url) => fact(text, `Research note ${key}`, {
    minSpoiler: 'direct', source: { file: url, locator: `Research note ${key}`, review: 'external-research',
        references: [{ label: `Fictional research ${key}`, url, checkedAt: '2026-10-22' }] },
});
const disputedFacts = new Map([
    ['account-a', researchFact('Mira opened the bronze gate because Nera needed shelter.', 'A', 'https://example.invalid/account-a')],
    ['account-b', researchFact('Mira opened the bronze gate because Sera ordered it.', 'B', 'https://example.invalid/account-b')],
]);
const disputedDefinition = definition('cause', { minSpoiler: 'direct', from: ['account-a', 'account-b'],
    narrative: { aspect: 'cause', subjects: ['Mira'], context: [], predicate: 'opened', status: 'disputed' } });
const disputedRecord = () => buildNarrativeRecords(gameId, [disputedDefinition], disputedFacts)[0];

for (const aspect of Object.keys(texts)) test(`the ${aspect} aspect preserves its explicit sourced fact`, () => {
    const def = definition(aspect);
    assert.deepEqual(narrativeRecordIssues([def], facts), []);
    const built = record(aspect);
    assert.equal(built.id, `${gameId}:narrative:mira-${aspect}:${aspect}`);
    assert.equal(built.entityId, def.entityId);
    assert.equal(built.kind, 'npc');
    assert.equal(built.relation, 'narrative');
    assert.equal(built.variants.balanced.text, texts[aspect]);
    assert.equal(built.narrative.status, 'recorded');
    assert.deepEqual(built.source.claims, [{ text: texts[aspect], source: {
        file: guideFile, locator: `facts[${aspect}]`, review: 'extracted' } }]);
    assert.equal(built.source.index.review, 'authored-index');
    assert.equal(built.source.index.locator, `narratives[id=mira-${aspect}]`);
    assert.equal(authorize(built, 'gentle'), null);
    const visible = authorize(built, 'balanced');
    assert.ok(visible);
    assert.equal(visible.text, texts[aspect]);
    assert.deepEqual(visible.narrative, built.narrative);
    assert.deepEqual(visible.source, built.source);
});

test('multi-fact summaries retain exact order and each source locator', () => {
    const def = definition('summary', { from: ['identity', 'event', 'purpose', 'summary'] });
    const [built] = buildNarrativeRecords(gameId, [def], facts);
    assert.equal(built.variants.balanced.text, def.from.map(key => texts[key]).join('\n'));
    assert.deepEqual(built.source.claims.map(claim => claim.text), def.from.map(key => texts[key]));
    assert.equal(built.source.locator, def.from.map(key => `facts[${key}]`).join('; '));
    assert.ok(validNarrativeSource(built.narrative, built.variants.balanced.text, built.source));
});

test('disputed research retains each account and its own citations without choosing a winner', () => {
    assert.deepEqual(narrativeRecordIssues([disputedDefinition], disputedFacts), []);
    const built = disputedRecord();
    assert.equal(built.narrative.status, 'disputed');
    assert.equal(built.source.review, 'external-research');
    assert.deepEqual(built.source.references.map(reference => reference.url),
        ['https://example.invalid/account-a', 'https://example.invalid/account-b']);
    for (const [index, key] of ['account-a', 'account-b'].entries()) {
        const claim = built.source.claims[index];
        assert.equal(claim.text, disputedFacts.get(key).text);
        assert.equal(claim.source.references[0].url, `https://example.invalid/${key}`);
    }
    assert.equal(authorize(built, 'balanced'), null);
    assert.ok(authorize(built, 'direct'));
});

test('a recorded research fact keeps an outside-research provenance boundary', () => {
    const def = { ...disputedDefinition, from: ['account-a'],
        narrative: { ...disputedDefinition.narrative, status: 'recorded' } };
    const [built] = buildNarrativeRecords(gameId, [def], disputedFacts);
    assert.ok(built);
    assert.equal(built.source.review, 'external-research');
    assert.equal(built.source.references[0].checkedAt, '2026-10-22');
    assert.ok(authorize(built, 'direct'));
});

const invalidDefinitions = [
    ['an unsupported aspect', def => { def.narrative.aspect = 'opinion'; }],
    ['missing subjects', def => { delete def.narrative.subjects; }],
    ['an empty subject list', def => { def.narrative.subjects = []; }],
    ['an unsourced subject', def => { def.narrative.subjects = ['Invented person']; }],
    ['an unsourced context', def => { def.narrative.context = ['Invented place']; }],
    ['a missing focused predicate', def => { delete def.narrative.predicate; }],
    ['an unsourced predicate', def => { def.narrative.predicate = 'betrayed'; }],
    ['a missing explicit spoiler level', def => { delete def.minSpoiler; }],
    ['an unknown spoiler level', def => { def.minSpoiler = 'secret'; }],
    ['a missing entity attachment', def => { delete def.entityId; }],
    ['a missing subject kind', def => { delete def.kind; }],
    ['a missing overlay locator', def => { delete def.overlayFile; }],
    ['missing source keys', def => { def.from = ['absent']; }],
    ['an empty source list', def => { def.from = []; }],
    ['an oversized source list', def => { def.from = Array(5).fill('cause'); }],
    ['alternate spoiler variants', def => { def.variants = { gentle: { text: 'summary' } }; }],
    ['an unsupported evidence status', def => { def.narrative.status = 'proven'; }],
    ['invalid aliases', def => { def.aliases = ['']; }],
    ['invalid edition metadata', def => { def.editions = 'SNES'; }],
];
for (const [label, alter] of invalidDefinitions) test(`the builder rejects ${label}`, () => {
    const def = structuredClone(definition());
    alter(def);
    assert.ok(narrativeRecordIssues([def], facts).length);
    assert.deepEqual(buildNarrativeRecords(gameId, [def], facts), []);
});

for (const aspect of ['cause', 'method', 'outcome', 'sequence', 'relationship'])
    test(`${aspect} requires an explicit predicate independently of its subject`, () => {
        const metadata = { ...definition(aspect).narrative };
        delete metadata.predicate;
        assert.equal(validNarrativeMetadata(metadata, texts[aspect]), false);
    });

test('sequence requires temporal wording instead of relying on from-key order', () => {
    const def = definition('sequence', { from: ['cause', 'method'] });
    assert.ok(narrativeRecordIssues([def], facts).length);
    assert.deepEqual(buildNarrativeRecords(gameId, [def], facts), []);
});

for (const sequenceMode of ['steps', 'events']) test(`sequence preserves the authored ${sequenceMode} mode`, () => {
    const def = definition('sequence');
    def.narrative.sequenceMode = sequenceMode;
    const [built] = buildNarrativeRecords(gameId, [def], facts);
    assert.equal(built.narrative.sequenceMode, sequenceMode);
    assert.equal(authorize(built, 'balanced').narrative.sequenceMode, sequenceMode);
});

for (const sequenceMode of [undefined, 'chronological', '']) test(`sequence rejects the unsupported mode ${String(sequenceMode)}`, () => {
    const def = definition('sequence');
    def.narrative.sequenceMode = sequenceMode;
    assert.ok(narrativeRecordIssues([def], facts).length);
    assert.deepEqual(buildNarrativeRecords(gameId, [def], facts), []);
    const raw = record('sequence');
    raw.narrative.sequenceMode = sequenceMode;
    assert.equal(authorize(raw, 'balanced'), null);
});

test('a non-sequence cannot carry a sequence mode', () => {
    const def = definition('cause');
    def.narrative.sequenceMode = 'steps';
    assert.deepEqual(buildNarrativeRecords(gameId, [def], facts), []);
});

for (const hedge of ['likely', 'apparently', 'perhaps', 'presumably', 'possibly', 'may', 'might', 'seems', 'appears', 'believed', 'reportedly'])
    test(`hedged assertions preserve an explicit ${hedge} qualification`, () => {
        const localFacts = new Map(facts);
        localFacts.set('cause', fact(`Mira ${hedge} opened the bronze gate because Nera needed shelter.`, 'hedged-cause'));
        const def = definition('cause');
        def.narrative.status = 'hedged';
        assert.deepEqual(narrativeRecordIssues([def], localFacts), []);
        const [built] = buildNarrativeRecords(gameId, [def], localFacts);
        assert.equal(authorize(built, 'balanced').narrative.status, 'hedged');
        assert.equal(built.variants.balanced.text, localFacts.get('cause').text);
    });

test('hedged status alone cannot invent uncertainty absent from its text', () => {
    const def = definition('cause');
    def.narrative.status = 'hedged';
    assert.deepEqual(buildNarrativeRecords(gameId, [def], facts), []);
    const raw = record();
    raw.narrative.status = 'hedged';
    assert.equal(authorize(raw, 'balanced'), null);
});

test('a metadata phrase cannot be fabricated by joining separate source facts', () => {
    const localFacts = new Map([
        ['one', fact('Mira opened the bronze', 'one')],
        ['two', fact('gate because Nera needed shelter.', 'two')],
    ]);
    const def = definition('cause', { from: ['one', 'two'], narrative: {
        aspect: 'cause', subjects: ['Mira'], context: ['bronze gate'], predicate: 'opened' } });
    assert.ok(narrativeRecordIssues([def], localFacts).some(issue => issue.includes('span source facts')));
    assert.deepEqual(buildNarrativeRecords(gameId, [def], localFacts), []);
});

test('guide facts with stricter spoilers cannot be indexed at a lower ceiling', () => {
    const localFacts = new Map(facts);
    localFacts.set('cause', { ...facts.get('cause'), minSpoiler: 'direct' });
    assert.ok(narrativeRecordIssues([definition()], localFacts).some(issue => issue.includes('spoiler')));
    assert.deepEqual(buildNarrativeRecords(gameId, [definition()], localFacts), []);
});

for (const alteration of ['missing file', 'missing locator', 'unknown review', 'missing research citation', 'unlabeled research citation'])
    test(`the builder rejects a fact with ${alteration}`, () => {
        const localFacts = new Map(facts);
        const changed = structuredClone(facts.get('cause'));
        if (alteration === 'missing file') delete changed.source.file;
        if (alteration === 'missing locator') delete changed.source.locator;
        if (alteration === 'unknown review') changed.source.review = 'rumor';
        if (alteration === 'missing research citation') changed.source.review = 'external-research';
        if (alteration === 'unlabeled research citation') Object.assign(changed.source,
            { review: 'external-research', references: [{ url: 'https://example.invalid/claim' }] });
        localFacts.set('cause', changed);
        assert.ok(narrativeRecordIssues([definition()], localFacts).length);
        assert.deepEqual(buildNarrativeRecords(gameId, [definition()], localFacts), []);
    });

test('guide and external research cannot be mixed into one narrative record', () => {
    const localFacts = new Map([...facts, ...disputedFacts]);
    const def = definition('cause', { minSpoiler: 'direct', from: ['cause', 'account-a'] });
    assert.ok(narrativeRecordIssues([def], localFacts).some(issue => issue.includes('cannot be mixed')));
    assert.deepEqual(buildNarrativeRecords(gameId, [def], localFacts), []);
});

for (const alteration of ['one claim', 'one cited URL', 'uncited guide claims'])
    test(`disputed narratives cannot claim corroboration from ${alteration}`, () => {
        const def = structuredClone(disputedDefinition);
        const localFacts = structuredClone(disputedFacts);
        if (alteration === 'one claim') def.from = ['account-a'];
        if (alteration === 'one cited URL') localFacts.set('account-b', structuredClone(localFacts.get('account-a')));
        if (alteration === 'uncited guide claims') for (const part of localFacts.values()) {
            part.source = { file: guideFile, locator: 'guide', review: 'extracted' };
        }
        assert.ok(narrativeRecordIssues([def], localFacts).some(issue => issue.includes('disputed')));
        assert.deepEqual(buildNarrativeRecords(gameId, [def], localFacts), []);
    });

const bypasses = [
    ['missing authored index', raw => { delete raw.source.index; }],
    ['unreviewed authored index', raw => { raw.source.index.review = 'unreviewed'; }],
    ['empty authored index locator', raw => { raw.source.index.locator = ''; }],
    ['an alternate spoiler variant', raw => { raw.variants.gentle = { text: 'Mira is a keeper.' }; }],
    ['a hidden low-tier text replacement', raw => { raw.minSpoiler = 'gentle'; }],
    ['a missing per-claim source', raw => { delete raw.source.claims[0].source; }],
    ['missing claims', raw => { delete raw.source.claims; }],
    ['a mismatched claim', raw => { raw.source.claims[0].text += ' An invented detail.'; }],
    ['uncited text appended to the variant', raw => { raw.variants.balanced.text += ' An invented detail.'; }],
    ['a false combined source file', raw => { raw.source.file = 'invented-source.txt'; }],
    ['a false combined source locator', raw => { raw.source.locator = 'invented locator'; }],
    ['an unknown claim provenance', raw => { raw.source.claims[0].source.review = 'rumor'; }],
    ['an unsourced metadata name', raw => { raw.narrative.subjects = ['Invented person']; }],
    ['an unsupported aspect', raw => { raw.narrative.aspect = 'opinion'; }],
    ['a missing required predicate', raw => { delete raw.narrative.predicate; }],
    ['invalid aliases', raw => { raw.aliases = ['']; }],
    ['research citations mislabeled as guide facts', raw => { raw.source.references = [{ label: 'outside', url: 'https://example.invalid/outside' }]; }],
];
for (const [label, alter] of bypasses) test(`authorization independently rejects ${label}`, () => {
    const raw = structuredClone(record());
    alter(raw);
    assert.equal(authorize(raw, 'direct'), null);
});

test('authorization rejects a sequence invented outside the builder', () => {
    const raw = structuredClone(record());
    raw.narrative.aspect = 'sequence';
    assert.equal(authorize(raw, 'direct'), null);
});

for (const alteration of ['lost citation', 'substituted citation', 'duplicate top citation', 'one URL', 'one claim', 'mixed source domains'])
    test(`authorization independently rejects disputed research with ${alteration}`, () => {
        const raw = structuredClone(disputedRecord());
        if (alteration === 'lost citation') delete raw.source.claims[0].source.references;
        if (alteration === 'substituted citation') raw.source.references[0].url = 'https://example.invalid/invented';
        if (alteration === 'duplicate top citation') raw.source.references[1] = { ...raw.source.references[0] };
        if (alteration === 'one URL') {
            raw.source.claims[1].source.references = structuredClone(raw.source.claims[0].source.references);
            raw.source.references = structuredClone(raw.source.claims[0].source.references);
        }
        if (alteration === 'one claim') {
            raw.source.claims = [raw.source.claims[0]];
            raw.source.file = raw.source.claims[0].source.file;
            raw.source.locator = raw.source.claims[0].source.locator;
            raw.source.references = structuredClone(raw.source.claims[0].source.references);
            raw.variants.direct.text = raw.source.claims[0].text;
        }
        if (alteration === 'mixed source domains') raw.source.claims[1].source.review = 'extracted';
        assert.equal(authorize(raw, 'direct'), null);
    });

test('authorization does not share narrative arrays, claims or citation objects with raw records', () => {
    const raw = structuredClone(disputedRecord());
    const visible = authorize(raw, 'direct');
    visible.narrative.subjects.push('Invented person');
    visible.narrative.context.push('Invented location');
    visible.source.claims[0].text = 'Invented assertion.';
    visible.source.claims[0].source.references[0].label = 'Changed citation';
    visible.source.references[0].url = 'https://example.invalid/changed';
    visible.source.index.file = 'changed-overlay.json';
    assert.deepEqual(raw, disputedRecord());
});

test('metadata cannot infer a new predicate from a supplied name', () => {
    assert.equal(validNarrativeMetadata({ aspect: 'cause', subjects: ['Mira'], context: [], predicate: 'joined' }, texts.cause), false);
    assert.equal(validNarrativeMetadata({ aspect: 'relationship', subjects: ['Nera'], context: ['Mira'], predicate: 'enemy' }, texts.relationship), false);
});
