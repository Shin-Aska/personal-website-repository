import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { matchesChatBundle, readChoice, CONSENT_KEY } from '../../js/assistant/consent.js';

const main = JSON.parse(fs.readFileSync(new URL('../../local-assistant/profile.json', import.meta.url)));
const intent = JSON.parse(fs.readFileSync(new URL('../../local-assistant/intent/profile.json', import.meta.url)));

test('the deployed chat disclosure describes the exact additional intent package', () => {
    assert.equal(matchesChatBundle(main, intent), true);
    assert.ok(main.totalBytes + intent.additionalBytes > main.totalBytes);
});

test('an enabled choice for an old cached main profile cannot authorize added intent files', () => {
    const old = { schema: 1, id: 'old-model-bundle', totalBytes: main.totalBytes };
    const storage = { getItem(key) { assert.equal(key, CONSENT_KEY); return JSON.stringify({ schema: 1, choice: 'enabled', modelId: old.id }); } };
    assert.equal(readChoice(storage, old.id), 'enabled', 'old preference alone would still match the cached profile');
    assert.equal(matchesChatBundle(old, intent), false, 'bootstrap must reject that old bundle before starting chat');
    assert.equal(readChoice(storage, main.id), null, 'the new bundle requires a fresh choice');
});

test('a stale or incomplete intent disclosure cannot authorize different model bytes', () => {
    for (const altered of [{ ...main, intent: { ...main.intent, id: 'another-model' } },
        { ...main, intent: { ...main.intent, additionalBytes: 1 } }, { ...main, intent: null }])
        assert.equal(matchesChatBundle(altered, intent), false);
});
