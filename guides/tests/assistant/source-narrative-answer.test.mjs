// Isolated contract tests for the source narrative preselector/validator. No
// production hooks, model inference, browser, or fixture/oracle edits.
import test from 'node:test';
import assert from 'node:assert/strict';
import { allRecords } from './load-records.mjs';
import { createAssistant } from '../../js/assistant/engine.js';
import { selectSourceNarrativeAnswer, validateSourceNarrativeReply } from '../../js/assistant/source-narrative-answer.js';

const eligible = () => true;
const cases = [
    { gameId: 'ultima5', text: 'What is the method for the Sandalwood Box?', aspect: 'method',
        id: 'ultima5:narrative:sandalwood-method:method', witness: 'play Stones as 6-7-8-9-8-7-8-7-6-7-6-5-3' },
    { gameId: 'ultima6', text: "What is the next step in the Merchants' Circuit?", aspect: 'sequence',
        id: 'ultima6:narrative:merchants-sequence:sequence', witness: 'then bring his flour back to Cullen in Britain' },
    { gameId: 'ultima7', text: 'Why was Inamo killed?', aspect: 'cause',
        id: 'ultima7:narrative:inamo-motive:cause', witness: 'no single explanation is established here' },
    { gameId: 'alqadim', text: 'What is the method for getting the Family Sword of Honor?', aspect: 'method',
        id: 'alqadim:narrative:ch2_1:method', witness: 'speak with Zubin to get the Family Sword of Honor' },
];

function select(item, overrides = {}) {
    return selectSourceNarrativeAnswer({ text: item.text, records: allRecords[item.gameId],
        ceiling: 'direct', isEligible: eligible, ...overrides });
}

test('exact parsed narrative role and subject select one authorized whole record', () => {
    for (const item of cases) {
        const selected = select(item);
        assert.ok(selected, item.gameId);
        assert.equal(selected.record.id, item.id);
        assert.equal(selected.request.aspect, item.aspect);
        assert.ok(selected.claims.length >= 1);
    }
});

test('base source narrative answers validate with complete text and source provenance', () => {
    for (const item of cases) {
        const selected = select(item);
        const reply = createAssistant({ gameId: item.gameId, records: allRecords[item.gameId] })
            .answer(item.text, { fullAnswersOnly: true });
        assert.equal(reply.decision, 'answer', item.gameId);
        assert.ok(reply.text.includes(item.witness), item.gameId);
        assert.equal(validateSourceNarrativeReply(selected, reply, { isEligible: eligible }), true, item.gameId);
    }
});

test('disputed narrative validation retains every attributed account and checked source reference', () => {
    const item = cases[2], selected = select(item);
    assert.equal(selected.record.narrative.status, 'disputed');
    assert.equal(selected.claims.length, 3);
    const reply = createAssistant({ gameId: item.gameId, records: allRecords[item.gameId] })
        .answer(item.text, { fullAnswersOnly: true });
    assert.equal(validateSourceNarrativeReply(selected, reply, { isEligible: eligible }), true);
    for (const claim of selected.claims) {
        assert.ok(reply.text.includes(claim.text));
        assert.ok(claim.source.references?.[0]?.checkedAt);
    }
    assert.ok(reply.text.includes('The sources give different accounts; no single explanation is established here.'));
    const collapsed = { ...reply, text: reply.text.replace(selected.claims[2].text, '') };
    assert.equal(validateSourceNarrativeReply(selected, collapsed, { isEligible: eligible }), false);
    const missingAccount = { ...reply, sources: reply.sources.slice(0, -1) };
    assert.equal(validateSourceNarrativeReply(selected, missingAccount, { isEligible: eligible }), false);
    const staleReferenceDate = { ...reply, sources: reply.sources.map(source => ({ ...source,
        references: (source.references || []).map(reference => ({ ...reference, checkedAt: '2026-01-01' })) })) };
    assert.equal(validateSourceNarrativeReply(selected, staleReferenceDate, { isEligible: eligible }), false);
});

test('role, subject, modifiers, and lower spoiler ceiling cannot broaden selection', () => {
    const u5 = cases[0];
    assert.equal(select(u5, { text: 'Why was the Sandalwood Box opened?' }), null, 'wrong narrative role');
    assert.equal(select(u5, { text: 'What is the method for the Family Sword of Honor?' }), null, 'wrong subject');
    assert.equal(select(u5, { text: 'What is the method for the Sandalwood Box without a harpsichord?' }), null, 'extra condition');
    assert.equal(select(u5, { text: 'What is the method for the Sandalwood Box in the 2026 remaster?' }), null, 'edition/quantity');
    assert.equal(select(u5, { ceiling: 'balanced' }), null, 'direct-only narrative is not exposed below its ceiling');
    assert.equal(select(u5, { isEligible: () => false }), null, 'independent source eligibility veto');
});

test('reply validator rejects missing passage, missing primary source, controls, and stateful/generated replies', () => {
    const item = cases[0], selected = select(item);
    const good = createAssistant({ gameId: item.gameId, records: allRecords[item.gameId] })
        .answer(item.text, { fullAnswersOnly: true });
    assert.equal(validateSourceNarrativeReply(selected, good, { isEligible: eligible }), true);
    assert.equal(validateSourceNarrativeReply(selected, { ...good, text: good.text.replace(item.witness, '') }, { isEligible: eligible }), false);
    assert.equal(validateSourceNarrativeReply(selected, { ...good, sources: [] }, { isEligible: eligible }), false);
    assert.equal(validateSourceNarrativeReply(selected, { ...good, decision: 'decline' }, { isEligible: eligible }), false);
    assert.equal(validateSourceNarrativeReply(selected, { ...good, actions: [{ id: 'x' }] }, { isEligible: eligible }), false);
    assert.equal(validateSourceNarrativeReply(selected, { ...good, stateChanges: [{ id: 'x' }] }, { isEligible: eligible }), false);
    assert.equal(validateSourceNarrativeReply(selected, { ...good, fallbackOrigin: 'model' }, { isEligible: eligible }), false);
    assert.equal(validateSourceNarrativeReply(selected, good, { isEligible: () => false }), false);
});

test('complete witnesses do not authorize extra prose, citations, links, or lost attribution', () => {
    for (const item of cases) {
        const selected = select(item);
        const good = createAssistant({ gameId: item.gameId, records: allRecords[item.gameId] })
            .answer(item.text, { fullAnswersOnly: true, tone: 'sage' });
        assert.equal(validateSourceNarrativeReply(selected, good, { isEligible: eligible }), true, item.gameId);
        for (const text of [good.text + '\nThe Avatar murdered Inamo.', 'Definitely.\n' + good.text,
            good.text.replace(' — ', ' is the only correct answer — ')])
            assert.equal(validateSourceNarrativeReply(selected, { ...good, text }, { isEligible: eligible }), false);
        const unknownSource = { file: 'unreviewed.js', locator: 'invented', review: 'extracted' };
        assert.equal(validateSourceNarrativeReply(selected, { ...good, sources: [...good.sources, unknownSource] }, { isEligible: eligible }), false);
        assert.equal(validateSourceNarrativeReply(selected, { ...good, sourceLinks: [{ text: 'Unreviewed', url: 'https://example.test/' }] }, { isEligible: eligible }), false);
    }
});
