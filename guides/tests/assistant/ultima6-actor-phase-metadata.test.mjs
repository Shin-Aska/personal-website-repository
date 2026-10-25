import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { buildKnowledge, knowledgeDocument } from '../../js/assistant/knowledge.js';
import { authorize } from '../../js/assistant/policy.js';
import { factSourceContexts } from '../../js/assistant/source-contexts.js';
import { lookupGraphQuestion, graphReferenceRoles } from '../../js/assistant/knowledge-graph.js';
import { allRecords, u6 } from './load-records.mjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../../data/assistant/knowledge/ultima6.json', import.meta.url)));
const knowledge = buildKnowledge('ultima6', allRecords.ultima6, manifest);
const fact = id => knowledge.facts.find(value => value.id === id);
const edge = id => knowledge.links.find(value => value.id === id);
const entity = name => {
    const found = [...knowledge.entities.values()].filter(value => value.declared && value.name === name);
    assert.equal(found.length, 1, `Unique declared entity: ${name}`);
    return found[0].id;
};
const binding = (id, name) => fact(id).bindings.find(value => value.entityId === entity(name));
const sha256 = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('actor metadata retains the frozen encoded documents and all protected source fields', () => {
    assert.deepEqual(knowledge.issues, []);
    assert.equal(manifest.facts.length, 111);
    assert.equal(sha256(manifest.facts.map(value => ({ id: value.id, document: knowledgeDocument(value) }))),
        '6de63e96da17d50e35025ddedd5e68bc3e8ee27d4437807c3a2b7c4ac4ab24f6');
    assert.equal(sha256(manifest.facts.map(value => ({ id: value.id, document: knowledgeDocument(value),
        subject: value.subject, facet: value.facet, aliases: value.aliases, text: value.text, witness: value.witness,
        source: value.source, sourceRecordId: value.sourceRecordId }))),
    'eed18365645c80ffbad807bf333802ecbf83cf7fd2f37f9f679edfd68b009dac');
});

test('every actor and ritual step is authorized by the exact unmodified guide source', () => {
    for (const [id, section, step] of [
        ['ariana-consent', 0, 0], ['anya-permission', 0, 1], ['ariana-rune', 0, 2],
        ['compassion-mantra', 0, 3], ['panpipes-makers', 4, 0], ['gwenno-song', 4, 1], ['selganor-rune', 4, 2]
    ]) {
        const value = fact(id), raw = u6.gameData.quests[0].sections[section].steps[step].replace(/`/g, '');
        assert.equal(value.witness, raw, id);
        assert.equal(value.text, raw, id);
        assert.deepEqual(value.source, { file: 'guides/js/Ultima6.js',
            locator: `gameData.quests[0].sections[${section}].steps[${step}]`, review: 'extracted' });
        const parent = authorize(allRecords.ultima6.find(record => record.id === value.sourceRecordId), 'direct');
        assert.ok(parent.text.includes(raw), id);
    }
});

test('raw material, board conversion and completed instrument keep different directed roles', () => {
    const conversion = edge('board-converted-julia');
    assert.equal(conversion.from, entity('Board'));
    assert.equal(conversion.to, entity('Julia'));
    assert.equal(conversion.relation, 'converted-by');
    assert.equal(conversion.status, 'conditional');
    assert.deepEqual(conversion.evidenceFactIds, ['panpipes-makers']);
    assert.match(fact('panpipes-makers').witness, /cut it into a board, and ask Julia to craft PANPIPES/);
    assert.deepEqual(binding('panpipes-makers', 'Julia').relations, ['creator', 'method']);
    assert.deepEqual(binding('panpipes-makers', 'Ben').relations, ['method']);
    assert.equal(binding('panpipes-makers', 'Panpipes').mention, 'PANPIPES');
    assert.equal(edge('board-cut-yew-log').from, entity('Board'));
    assert.equal(edge('board-cut-yew-log').to, entity('Yew Log'));
    assert.equal(edge('board-cut-yew-log').relation, 'cut-from');
    assert.equal(edge('panpipes-raw-yew-log').from, entity('Panpipes'));
    assert.equal(edge('panpipes-raw-yew-log').to, entity('Yew Log'));
    assert.equal(edge('panpipes-raw-yew-log').relation, 'raw-material');
    assert.equal(edge('ben-west-yew').from, entity('Ben'));
    assert.equal(edge('ben-west-yew').to, entity('Yew'));
    assert.equal(edge('ben-west-yew').relation, 'located-west-of');
    assert.match(fact('panpipes-makers').witness, /^Buy a yew log from Ben west of Yew/);
    for (const [text, subject, person] of [
        ['Who makes Panpipes?', 'Panpipes', 'Julia'], ['Who sells the yew log?', 'Yew Log', 'Ben']
    ]) {
        const result = lookupGraphQuestion({ ...knowledge, text, subjectIds: [entity(subject)] });
        assert.equal(result.complete, true);
        assert.deepEqual(result.answerEntityIds, [entity(person)]);
        assert.deepEqual(result.factIds, ['panpipes-makers']);
    }
    assert.ok(!knowledge.links.some(value => value.from === entity('Ben') && value.to === entity('Panpipes')
        && ['crafts', 'gives', 'sells'].includes(value.relation)));
    assert.ok(![...knowledge.entities.values()].some(value => value.aliases.includes('wooden board')));
});

test('Gwenno teaches STONES while Selganor receives its performance under the complete two-step proof', () => {
    const teacher = lookupGraphQuestion({ ...knowledge, text: 'Who teaches Stones?', subjectIds: [entity('Stones')] });
    assert.deepEqual(teacher.answerEntityIds, [entity('Gwenno')]);
    assert.deepEqual(teacher.factIds, ['gwenno-song']);
    const performance = edge('stones-performed-selganor');
    assert.equal(performance.from, entity('Stones'));
    assert.equal(performance.to, entity('Selganor'));
    assert.equal(performance.relation, 'performed-for');
    assert.equal(performance.status, 'conditional');
    assert.deepEqual(performance.evidenceFactIds, ['gwenno-song', 'selganor-rune']);
    assert.match(fact('gwenno-song').witness, /Ask Gwenno about the song STONES to learn the numeric tune 6789878767653/);
    assert.match(fact('selganor-rune').witness, /^Perform the tune for Selganor inside the Artisan Guild to receive the rune/);
    assert.deepEqual(binding('gwenno-song', 'Gwenno').relations, ['method']);
    assert.deepEqual(binding('selganor-rune', 'Selganor').relations, ['method', 'location']);
    assert.deepEqual(graphReferenceRoles({ ...knowledge, subjectIds: [entity('Stones')],
        factIds: performance.evidenceFactIds }), { provider: [], recipient: [] });
    assert.ok(!knowledge.links.some(value => value.from === entity('Selganor') && value.to === entity('Stones')
        && value.relation === 'teaches'));
});

test('Anya permission, Ariana rune confirmation and MU shrine ritual preserve their separate phases', () => {
    const permission = edge('compassion-rune-permission-anya');
    assert.equal(permission.from, entity('Rune of Compassion'));
    assert.equal(permission.to, entity('Anya'));
    assert.equal(permission.relation, 'requires-permission-from');
    assert.equal(permission.status, 'conditional');
    assert.deepEqual(permission.evidenceFactIds, ['ariana-consent', 'anya-permission', 'ariana-rune']);
    assert.deepEqual(fact('anya-permission').bindings.map(value => value.entityId), [entity('Anya')]);
    assert.match(fact('anya-permission').witness, /Blue Boar Tavern, mention RUNE or PERMISSION, and answer YES/);
    assert.match(fact('ariana-rune').witness, /^Return to Ariana, confirm permission/);
    const giver = lookupGraphQuestion({ ...knowledge, text: 'Who gives the Rune of Compassion?',
        subjectIds: [entity('Rune of Compassion')] });
    assert.deepEqual(giver.answerEntityIds, [entity('Ariana')]);
    assert.deepEqual(giver.factIds, ['ariana-rune']);
    const mantra = edge('compassion-shrine-mantra');
    assert.equal(mantra.from, entity('Shrine of Compassion'));
    assert.equal(mantra.to, entity('MU'));
    assert.equal(mantra.relation, 'accepts-mantra');
    assert.deepEqual(mantra.evidenceFactIds, ['compassion-mantra']);
    assert.equal(binding('compassion-mantra', 'Shrine of Compassion').mention, 'southern shrine');
    assert.deepEqual(binding('compassion-mantra', 'Rune of Compassion').relations, ['use', 'method']);
    assert.deepEqual(binding('compassion-mantra', 'MU').relations, ['method']);
    for (const id of ['ariana-consent', 'anya-permission', 'ariana-rune', 'ariana-permission-keyword'])
        assert.ok(!fact(id).bindings.some(value => value.entityId === entity('MU')), id);
});

test('source scopes preserve literal section containment without creating prerequisite or state claims', () => {
    const music = knowledge.sourceContexts.find(value => value.id === 'sacrifice-source-context');
    assert.equal(music.entityId, 'ultima6:quest:act-i-liberating-the-shrines:sacrifice-minoc');
    assert.equal(music.label, 'Sacrifice');
    assert.equal(music.source.locator, 'gameData.quests[0].sections[4]');
    for (const id of ['panpipes-makers', 'gwenno-song', 'selganor-rune', 'sacrifice-mantra'])
        assert.deepEqual(factSourceContexts({ fact: fact(id), contexts: knowledge.sourceContexts }).map(value => value.id), [music.id]);
    assert.ok(!factSourceContexts({ fact: fact('compassion-mantra'), contexts: knowledge.sourceContexts })
        .some(value => value.id === music.id));
    assert.ok(!knowledge.links.some(value => value.evidenceFactIds.includes('compassion-mantra')
        && ['gives', 'requires-permission-from'].includes(value.relation)));
});
