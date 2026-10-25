import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allRecords } from './load-records.mjs';
import { authorize } from '../../js/assistant/policy.js';
import { buildKnowledge, attachKnowledgeEmbeddings, createKnowledgeRouter } from '../../js/assistant/knowledge.js';

const read = relative => JSON.parse(fs.readFileSync(new URL(relative, import.meta.url)));
const sources = { ...allRecords, starcraft: read('./evidence/conversation-starcraft-source-records.json') };
const manifests = Object.fromEntries(Object.keys(sources).map(game => [game, read(`../../data/assistant/knowledge/${game}.json`)]));
const build = (game, manifest = manifests[game]) => buildKnowledge(game, sources[game], manifest);
const clone = value => JSON.parse(JSON.stringify(value));

for (const game of Object.keys(sources)) {
    test(`${game}: every reviewed fact and directed edge has an authorized source witness`, () => {
        const k = build(game);
        assert.deepEqual(k.issues, []);
        assert.equal(k.facts.length, manifests[game].facts.length);
        assert.equal(k.links.length, manifests[game].links.length);
        assert.equal(k.sourceRecords.length, sources[game].length);
        assert.equal(new Set(k.records.map(record => record.id)).size, k.records.length);
        const facts = new Map(k.facts.map(fact => [fact.id, fact]));
        for (const fact of k.facts) {
            assert.equal(authorize(fact.record, 'gentle'), null, 'Direct facts cannot enter lower-tier indexes');
            assert.equal(authorize(fact.record, 'direct').text, fact.witness);
            if (fact.source.review === 'external-research') {
                assert.ok(fact.source.references.some(ref => ref.url === fact.researchWitness.url && ref.checkedAt === fact.researchWitness.checkedAt));
            } else {
                const witness = sources[game].find(record => record.id === fact.sourceRecordId);
                assert.ok(authorize(witness, 'direct').text.includes(fact.text), fact.id);
            }
        }
        for (const link of k.links) {
            assert.ok(k.entities.has(link.from) && k.entities.has(link.to));
            assert.ok(link.evidenceFactIds.length && link.evidenceFactIds.every(id => facts.has(id)));
        }
    });
}

test('A fabricated excerpt, duplicate ID or missing graph proof is rejected rather than indexed', () => {
    const manifest = clone(manifests.ultima6);
    const id = manifest.facts[0].id;
    manifest.facts[0].text = manifest.facts[0].witness = 'Ariana secretly lives on Mars.';
    manifest.facts.push(clone(manifest.facts[1]));
    manifest.links.push({ id: 'invented', from: manifest.entities[0].id, to: manifest.entities[1].id,
        relation: 'parent-of', evidenceFactIds: ['nonexistent'], status: 'recorded' });
    const k = build('ultima6', manifest);
    assert.ok(k.issues.some(issue => issue.includes('Witness is absent')));
    assert.ok(k.issues.some(issue => issue.includes('duplicate')));
    assert.ok(k.issues.some(issue => issue.includes('invented')));
    assert.ok(!k.facts.some(fact => fact.id === id));
});

test('Answer bindings require a known target, a literal witness mention and an existing capability', () => {
    for (const mutate of [
        binding => { binding.entityId = 'ultima6:knowledge:unrecorded'; },
        binding => { binding.mention = 'Quantum Turnip'; },
        binding => { binding.relations = ['creator']; },
        binding => { binding.relations = []; }
    ]) {
        const manifest = clone(manifests.ultima6);
        const fact = manifest.facts.find(fact => fact.id === 'phoenix-pickpocket');
        mutate(fact.answerBindings[0]);
        assert.ok(build('ultima6', manifest).issues.some(issue => issue.includes('answer subject binding')));
    }
});

test('Descriptive topic labels cannot redefine a named person', () => {
    const manifest = clone(manifests.ultima7);
    manifest.facts.find(fact => fact.id === 'forge-reward-caveat').topicLabels = ['Lord British'];
    assert.ok(build('ultima7', manifest).issues.some(issue => issue.includes('descriptive topic')));
});

test('An explicit item binding retrieves its procedure without transferring the giver request into that procedure', () => {
    const router = createKnowledgeRouter(build('ultima6'));
    const reply = router.plan('How do I take Phoenix belt?');
    assert.equal(reply?.decision, 'answer');
    assert.deepEqual(reply.knowledge.factIds, ['phoenix-pickpocket']);
    assert.match(reply.text, /INVISIBILITY.*PICKPOCKET/);
    assert.equal(reply.knowledge.focusEntityId, 'ultima6:knowledge:phoenix-belt');
});

test('A merchant rate and a village passage can answer their explicitly indexed person properties', () => {
    const router = createKnowledgeRouter(build('albion'));
    const rates = router.plan('What are Rabir prices?');
    assert.equal(rates?.decision, 'answer');
    assert.deepEqual(rates.knowledge.factIds, ['trade-rabir-jirinaar']);
    const location = router.plan('Where is Rifrako?');
    assert.equal(location?.decision, 'answer');
    assert.deepEqual(location.knowledge.factIds, ['place-aballon']);
    assert.match(location.text, /Aballon.*Gratogel/);
});

test('Reviewed facet labels answer what/explain requests without replacing a person identity question', () => {
    const router = createKnowledgeRouter(build('ultima7'));
    for (const [question, id] of [
        ['What are training points per level?', 'training-level-points'],
        ['Explain Fighter training order.', 'training-fighter-order'],
        ['What is the Penumbra blackrock preparation?', 'tetrahedron-ring']
    ]) {
        const reply = router.plan(question);
        assert.equal(reply?.decision, 'answer', question);
        assert.ok(reply.knowledge.factIds.includes(id), question);
    }
    assert.ok(!router.plan('Who is Lord British?')?.knowledge?.factIds.includes('forge-reward-caveat'));
    const research = createKnowledgeRouter(build('starcraft'));
    assert.notEqual(research.plan('What is Steamhammer binary configuration?', {restrictions:{guideOnly:true}})?.decision, 'answer');
});

test('Research provenance cannot be replaced with an unrelated citation or undated witness', () => {
    const manifest = clone(manifests.starcraft);
    const fact = manifest.facts.find(fact => fact.source.review === 'external-research');
    fact.researchWitness.url = 'https://example.invalid/unreviewed';
    const k = build('starcraft', manifest);
    assert.ok(k.issues.some(issue => issue.includes(fact.id)));
    assert.ok(!k.facts.some(item => item.id === fact.id));
});

test('A curated list cannot introduce a member absent from the reviewed passage', () => {
    const manifest = clone(manifests.ultima6);
    manifest.facts[0].listMembers = ['Quantum Turnip'];
    assert.ok(build('ultima6', manifest).issues.some(issue => issue.includes('List member')));
});

test('The query encoder cannot substitute another model, changed text or malformed static vectors', () => {
    const profile = read('../../local-assistant/intent/profile.json');
    const catalog = read('../../data/assistant/knowledge/ultima6-embeddings.json');
    assert.doesNotThrow(() => attachKnowledgeEmbeddings(build('ultima6'), catalog, profile));
    const wrongModel = clone(catalog); wrongModel.revision = 'different';
    assert.throws(() => attachKnowledgeEmbeddings(build('ultima6'), wrongModel, profile));
    const wrongText = clone(catalog); wrongText.documents[0].text += ' invented';
    assert.throws(() => attachKnowledgeEmbeddings(build('ultima6'), wrongText, profile));
    const malformed = clone(catalog); malformed.documents[0].vector[0] = 100;
    assert.throws(() => attachKnowledgeEmbeddings(build('ultima6'), malformed, profile));
});

test('A source-backed item-to-person relationship retains its conditions and supports typed follow-ups', () => {
    const router = createKnowledgeRouter(build('ultima6'));
    const first = router.plan('How do I get the Britannian lens?');
    assert.equal(first?.decision, 'answer');
    assert.match(first.text, /glass sword/i);
    const person = router.plan('Where is he?');
    assert.equal(person?.decision, 'answer');
    assert.match(person.text, /Ephemerides|Moonglow/i);
    assert.deepEqual(person.stateChanges, []);
});

test('Unknown subjects invalidate graph salience even if an older source-engine subject is offered', () => {
    const k = build('ultima6'), router = createKnowledgeRouter(k);
    assert.equal(router.plan('How do I get Anya permission?')?.decision, 'answer');
    router.observe({ decision: 'decline' }, {}, 'Who is Quantum Turnip?');
    const old = k.facts.find(fact => fact.id === 'anya-permission').entityId;
    assert.equal(router.plan('Where is she?', { status: 'ready', entityId: old }), null);
});

test('Guide-only, unsupported edition, player-state and unsupported family questions cannot invent facts', () => {
    const router = createKnowledgeRouter(build('ultima6'));
    for (const text of ['Have I already got permission?', 'Is Beh Lem in my party already?', 'Where is the blue lens on Mars?', 'What does the Vortex Cube do in the SNES version?']) {
        assert.notEqual(router.plan(text)?.decision, 'answer', text);
    }
    assert.notEqual(router.plan('Who is Phoenix mother?')?.decision, 'answer');
    const sc = createKnowledgeRouter(build('starcraft'));
    assert.notEqual(sc.plan('According to this guide, who created Steamhammer?', { restrictions: { guideOnly: true } })?.decision, 'answer');
});

test('A separately reviewed attribution conflict quarantines the old generic author claim', () => {
    const k = build('starcraft');
    assert.equal(k.sourceRecords.find(record => record.id === 'starcraft:steamhammer:about').conflict, true);
    assert.equal(sources.starcraft.find(record => record.id === 'starcraft:steamhammer:about').conflict, false, 'Input records must stay immutable');
});

test('An authored use composition keeps the specific Word and its independent use explanation', () => {
    const router = createKnowledgeRouter(build('ultima5'));
    const reply = router.plan('How do I use the Word of Power for Wrong?');
    assert.equal(reply?.decision, 'answer');
    assert.ok(reply.knowledge.factIds.includes('word-wrong'));
    assert.ok(reply.knowledge.factIds.includes('mantra-word-distinction'));
    assert.match(reply.text, /MALUM/);
    assert.match(reply.text, /Words of Power unlock the dungeons/);
    assert.equal(reply.sources.length, 2);
    assert.deepEqual(reply.stateChanges, []);
});

test('Supporting evidence cannot invent a fact or recursively authorize an unsupported chain', () => {
    const manifest = clone(manifests.ultima5);
    manifest.facts[0].support = { use: ['invented-fact'] };
    assert.ok(build('ultima5', manifest).issues.some(issue => issue.includes('supporting evidence')));
});

test('A quoted requirement does not become an invented motive', () => {
    const reply = createKnowledgeRouter(build('ultima6')).plan('Why does Ariana need permission?');
    assert.equal(reply?.decision, 'decline');
    assert.match(reply.text, /does not explain its reason/);
    assert.match(reply.text, /Anya/);
    assert.ok(reply.sources.length);
});

test('A broad topic declaration cannot erase an independently typed atlas NPC', () => {
    const manifest = clone(manifests.ultima5);
    const teacher = manifest.entities.find(entity => entity.name === 'Felespar');
    assert.ok(teacher);
    teacher.kind = 'topic';
    const k = build('ultima5', manifest);
    const edge = k.links.find(link => link.id === 'astaroth-wrong-teacher');
    assert.equal(k.entities.get(edge.to).kind, 'npc');
});
