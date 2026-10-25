import test from 'node:test';
import assert from 'node:assert/strict';
import { presentKnowledgeDefinition } from '../../js/assistant/source-responses.js';

const guide = { file: 'guides/StarcraftBWAPI.html', locator: '#features', review: 'extracted' };
const definitionSource = { file: 'guides/js/assistant/source-responses.js', locator: 'reviewed definition', review: 'authored-from-guide',
    basedOn: { ...guide } };
const sourceRecord = { id: 'starcraft:schnail:features', entityId: 'starcraft:schnail', title: 'SCHNAIL', aliases: [],
    kind: 'tool', relation: 'explanation', requires: null, source: guide,
    variants: { direct: { text: 'Starcraft Human and AI League' } },
    sourceDefinition: { variants: { direct: { text: 'SCHNAIL is a client for playing Brood War AI opponents.', source: definitionSource } } } };
const reply = { decision: 'answer', text: 'Register an account at SCHNAIL (Starcraft Human and AI League)',
    recordIds: ['starcraft:knowledge:schnail-identity'], sources: [{ ...guide, locator: '#requirements' }],
    knowledge: { factIds: ['schnail-identity'], focusEntityId: 'starcraft:schnail' } };

test('A simple definition keeps the previously reviewed concise presentation and both sources', () => {
    const result = presentKnowledgeDefinition(reply, 'What is SCHNAIL?', [sourceRecord]);
    assert.equal(result.text, sourceRecord.sourceDefinition.variants.direct.text);
    assert.ok(result.sources.some(source => source.locator === '#requirements'));
    assert.ok(result.sources.some(source => source.basedOn?.file === guide.file));
    assert.deepEqual(result.knowledge.factIds, reply.knowledge.factIds);
});

test('Authorship, edition, requirements and other qualified questions retain their requested detail', () => {
    for (const question of ['Who created SCHNAIL?', 'What is SCHNAIL in StarCraft II?', 'What Java does SCHNAIL require?', 'What is the SCHNAIL download?'])
        assert.strictEqual(presentKnowledgeDefinition(reply, question, [sourceRecord]), reply, question);
});

test('A definition cannot borrow an unrelated source, hide conditions, or appear without a reviewed definition', () => {
    const otherGuide = { ...sourceRecord, sourceDefinition: { variants: { direct: { text: 'Unrelated text',
        source: { ...definitionSource, basedOn: { ...guide, file: 'guides/Ultima7.html' } } } } } };
    assert.strictEqual(presentKnowledgeDefinition(reply, 'What is SCHNAIL?', [otherGuide]), reply);
    assert.strictEqual(presentKnowledgeDefinition(reply, 'What is SCHNAIL?', [{ ...sourceRecord, requires: { fact: 'unknown-condition' } }]), reply);
    assert.strictEqual(presentKnowledgeDefinition(reply, 'What is SCHNAIL?', [{ ...sourceRecord, sourceDefinition: undefined }]), reply);
});
