import test from 'node:test';
import assert from 'node:assert/strict';
import { compileSourceContexts, factSourceContexts } from '../../js/assistant/source-contexts.js';

const entities = new Map([['trial', { id: 'trial', name: 'Academy trial', aliases: [] }]]);
const parent = { id: 'chapter-one', kind: 'chapter', title: 'Graduating From the Academy',
    text: 'Speak with the master.', source: { file: 'guide.js', locator: 'DB.chapters[0]', review: 'extracted' } };
const context = { id: 'academy-scope', entityId: 'trial', sourceRecordId: 'chapter-one', label: 'Academy' };
const compile = (contexts = [context], sourceRecords = [parent]) => compileSourceContexts({ contexts, entities, sourceRecords });
const fact = (locator, source = {}) => ({ source: { file: 'guide.js', locator, review: 'extracted', ...source } });

test('a reviewed parent compiles an independent attribution copy without adding graph or state fields', () => {
    const result = compile();
    assert.deepEqual(result.issues, []);
    assert.deepEqual(result.contexts, [{ ...context, source: parent.source }]);
    assert.notStrictEqual(result.contexts[0].source, parent.source);
    assert.deepEqual(Object.keys(result.contexts[0]).sort(), ['entityId', 'id', 'label', 'source', 'sourceRecordId']);
    result.contexts[0].source.locator = 'changed';
    assert.equal(parent.source.locator, 'DB.chapters[0]');
});

test('only complete exact structural descendants share a source container', () => {
    const contexts = compile().contexts;
    for (const locator of ['DB.chapters[0]', 'DB.chapters[0].summary', 'DB.chapters[0].required[id=ch1_1]',
        'DB.chapters[0].required[0].text', 'DB.chapters[0].required[id="trial"].text'])
        assert.deepEqual(factSourceContexts({ fact: fact(locator), contexts }).map(value => value.id), ['academy-scope'], locator);
    for (const locator of ['DB.chapters[00].required[0]', 'DB.chapters[01].required[0]', 'DB.chapters[1].required[0]',
        'DB.chapters[0]suffix', 'DB.chapters[0x0].summary', 'DB.chapters[0].', 'DB.chapters[0].required[',
        'DB.chapters[0].required[0] trailing', 'Other.DB.chapters[0]', 'DB.chapters[id=0].summary'])
        assert.deepEqual(factSourceContexts({ fact: fact(locator), contexts }), [], locator);
    assert.deepEqual(factSourceContexts({ fact: fact('DB.chapters[0].summary', { file: 'other.js' }), contexts }), []);
});

test('all compound locator clauses must stay in the same container', () => {
    const contexts = compile().contexts;
    assert.equal(factSourceContexts({ fact: fact('DB.chapters[0].summary; DB.chapters[0].required[id=ch1_1]'), contexts }).length, 1);
    for (const locator of ['DB.chapters[0].summary; DB.chapters[1].summary',
        'DB.chapters[0].summary; malformed', 'DB.chapters[0].summary;',
        'DB.chapters[0].summary, DB.chapters[0].required[0]', 'DB.chapters[0].summary/description'])
        assert.deepEqual(factSourceContexts({ fact: fact(locator), contexts }), [], locator);
});

test('bad labels, unknown entities, absent parents and duplicate mappings are withheld', () => {
    for (const value of [{ ...context, id: '' }, { ...context, entityId: 'missing' },
        { ...context, sourceRecordId: 'missing' }, { ...context, label: '' }, { ...context, label: 'the' },
        { ...context, label: 'Academ' }, { ...context, label: 'academy' }, { ...context, label: ' Academy ' },
        { ...context, label: 'master' }]) {
        const result = compile([value]);
        assert.equal(result.contexts.length, 0, JSON.stringify(value));
        assert.equal(result.issues.length, 1);
    }
    const duplicate = compile([context, { ...context }]);
    assert.deepEqual(duplicate.contexts, []);
    assert.equal(duplicate.issues.length, 2);
    assert.deepEqual(compile([context], [parent, { ...parent }]).contexts, []);
});

test('external, conflicting and compound parent provenance cannot define a local source scope', () => {
    for (const value of [{ ...parent, conflict: true },
        { ...parent, source: { ...parent.source, review: 'external-research' } },
        { ...parent, source: { ...parent.source, review: 'conflicting' } },
        { ...parent, source: { ...parent.source, file: '' } },
        { ...parent, source: { ...parent.source, locator: 'DB.chapters[0]; DB.chapters[1]' } },
        { ...parent, source: { ...parent.source, locator: 'DB.chapters[00]' } }]) {
        assert.deepEqual(compile([context], [value]).contexts, []);
    }
    const contexts = compile().contexts;
    assert.deepEqual(factSourceContexts({ fact: fact('DB.chapters[0]', { review: 'external-research' }), contexts }), []);
    assert.deepEqual(factSourceContexts({ fact: { ...fact('DB.chapters[0]'), conflict: true }, contexts }), []);
});

test('record IDs, aliases, text and graph neighbors do not imply source membership', () => {
    const contexts = compile().contexts;
    const outside = { ...fact('DB.chapters[1].summary'), sourceRecordId: 'chapter-one',
        text: 'Academy', aliases: ['Academy'], entityId: 'trial' };
    assert.deepEqual(factSourceContexts({ fact: outside, contexts }), []);
    assert.deepEqual(factSourceContexts({ fact: { ...outside, source: undefined }, contexts }), []);
});

test('explicit objective and id selectors match whole structural segments', () => {
    for (const locator of ['ultima5GrandQuestChapters objective=opening-grapple', 'ultima5SideQuests id=side-hms-cape']) {
        const selectedParent = { ...parent, source: { ...parent.source, locator } };
        const result = compile([context], [selectedParent]);
        assert.deepEqual(result.issues, []);
        for (const child of [locator, `${locator}.steps`, `${locator}.steps[2]`, `${locator}.steps[2].text`])
            assert.equal(factSourceContexts({ fact: fact(child), contexts: result.contexts }).length, 1, child);
        for (const child of [`${locator}-extra.steps[2]`, `${locator}Extra.steps[2]`, `${locator}0.steps[2]`,
            `${locator}.steps[02]`, `${locator}.steps[2]suffix`, `${locator} objective=other.steps[2]`])
            assert.deepEqual(factSourceContexts({ fact: fact(child), contexts: result.contexts }), [], child);
        assert.equal(factSourceContexts({ fact: fact(`${locator}.steps[0]; ${locator}.steps[2]`), contexts: result.contexts }).length, 1);
        assert.deepEqual(factSourceContexts({ fact: fact(`${locator}.steps[2]`, { file: 'other.js' }), contexts: result.contexts }), []);
        assert.deepEqual(factSourceContexts({ fact: fact(`${locator}.steps[0]; ${locator}-other.steps[2]`), contexts: result.contexts }), []);
    }
});

test('space selector grammar rejects padded, quoted, repeated and undeclared selector forms', () => {
    const locator = 'ultima5GrandQuestChapters objective=opening-grapple';
    const malformed = [
        'ultima5GrandQuestChapters  objective=opening-grapple',
        'ultima5GrandQuestChapters\tobjective=opening-grapple',
        'ultima5GrandQuestChapters objective =opening-grapple',
        'ultima5GrandQuestChapters objective= opening-grapple',
        'ultima5GrandQuestChapters objective="opening-grapple"',
        "ultima5GrandQuestChapters objective='opening-grapple'",
        'ultima5GrandQuestChapters objective=opening grapple',
        'ultima5GrandQuestChapters Objective=opening-grapple',
        'ultima5GrandQuestChapters chapter=opening-grapple',
        'ultima5GrandQuestChapters objective=',
        'ultima5GrandQuestChapters objective=2-opening-grapple',
        'ultima5GrandQuestChapters objective=opening-grapple id=other',
        'ultima5GrandQuestChapters.other objective=opening-grapple'
    ];
    const contexts = compile([context], [{ ...parent, source: { ...parent.source, locator } }]).contexts;
    for (const value of malformed) {
        assert.deepEqual(compile([context], [{ ...parent, source: { ...parent.source, locator: value } }]).contexts, [], value);
        assert.deepEqual(factSourceContexts({ fact: fact(`${value}.steps[2]`), contexts }), [], value);
    }
    for (const sibling of ['opening-hms-cape', 'opening-grappl', 'opening-grapple-extra'])
        assert.deepEqual(factSourceContexts({ fact: fact(`ultima5GrandQuestChapters objective=${sibling}.steps[2]`), contexts }), [], sibling);
});
