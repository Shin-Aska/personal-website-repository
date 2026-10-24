import assert from 'node:assert/strict';
import test from 'node:test';
import { allRecords } from './load-records.mjs';
import { loadCampaigns, runConversation } from './conversation-campaign.mjs';
import { validateCampaign } from './conversation-checks.mjs';

for (const fixture of loadCampaigns()) {
    test(`${fixture.gameId}: conversation corpus has independent claims, identities and sources`, () => {
        assert.deepEqual(validateCampaign(fixture), []);
    });
    if (!allRecords[fixture.gameId]) continue;
    for (const dialogue of fixture.dialogues) test(`${fixture.gameId} sustained conversation: ${dialogue.id}`, () => {
        const result = runConversation(dialogue, fixture.gameId, allRecords[fixture.gameId]);
        const failures = result.turns.filter(t => !t.passed);
        assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
    });
}
