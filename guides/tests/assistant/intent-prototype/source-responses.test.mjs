import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { augmentPrototypeRecords, presentSourceReply } from './source-responses.mjs';
import { createAssistant } from '../../../js/assistant/engine.js';
import { buildStarcraftRecords } from '../../../js/assistant/adapters/starcraft.js';

const source = locator => ({ file: 'guides/StarcraftBWAPI.html', locator, review: 'extracted' });
const record = (id, title, selector, extra = {}) => ({
  id, title, entityId: id, aliases: [], kind: 'setup', relation: 'acquisition', acquisitionMethods: ['download'],
  variants: { gentle: { text: 'Use the downloads page.' }, balanced: { text: 'Visit the downloads page.' }, direct: { text: `Download ${title}.` } },
  source: source(selector), ...extra,
});
const anchor = (url, text = 'Original link label') => ({ textContent: text, getAttribute: name => name === 'href' ? url : null });
const element = (text, links = []) => ({
  textContent: text, querySelectorAll: () => links, matches: () => false,
  nodeType: 1, tagName: 'DIV', childNodes: [{ nodeType: 3, nodeValue: text }],
});
const rootFor = entries => ({ querySelector: selector => entries[selector] || null });
const replyFor = item => ({ decision: 'answer', text: 'Original source-backed answer.', recordIds: [item.id], sources: [item.source], stateChanges: [] });
const packetFor = item => ({ status: 'ready', entityId: item.entityId, intent: 'acquisition', method: 'download', requestedFormat: 'link' });

test('generic extraction preserves source labels and URLs while excluding unsafe and internal hrefs', () => {
  const item = record('tool', 'Tool', '#tool');
  const root = rootFor({ '#tool': element('Download Tool.', [
    anchor('https://example.test/Release?x=1#Download', ' Keep\nthis label '),
    anchor('http://example.test/other'), anchor('#setup'), anchor('/relative'),
    anchor('javascript:alert(1)'), anchor('data:text/html,no'), anchor('https://user:secret@example.test/'),
    anchor('https://example.test/ bad'), anchor('https://example.test/Release?x=1#Download'),
  ]) });
  const [augmented] = augmentPrototypeRecords([item], root);
  assert.equal(augmented.sourceLinks.length, 2);
  assert.equal(augmented.sourceLinks[0].url, 'https://example.test/Release?x=1#Download');
  assert.equal(augmented.sourceLinks[0].text, ' Keep\nthis label ');
  assert.deepEqual(augmented.sourceLinks[0].source, item.source);
  assert.deepEqual(item.variants, augmented.variants);
  assert.equal(item.sourceLinks, undefined);
});

test('URLs stay at Direct unless the exact URL was explicitly authored at a lower tier', () => {
  const url = 'https://example.test/download';
  const item = record('tool', 'Tool', '#tool');
  const [augmented] = augmentPrototypeRecords([item], rootFor({ '#tool': element('Download Tool (requires account).', [anchor(url)]) }));
  const direct = presentSourceReply(replyFor(item), packetFor(item), [augmented], { spoiler: 'direct' });
  assert.equal(direct.text, `Download Tool: ${url}\nAccount required.`);
  assert.equal(direct.sourceLinks[0].url, url);
  for (const spoiler of ['gentle', 'balanced']) {
    const answer = replyFor(item);
    assert.strictEqual(presentSourceReply(answer, packetFor(item), [augmented], { spoiler }), answer);
  }
  const lowerAuthored = { ...item, variants: { ...item.variants, balanced: { text: `Download: ${url}` } } };
  const [lowerAugmented] = augmentPrototypeRecords([lowerAuthored], rootFor({ '#tool': element('Download Tool (requires account).', [anchor(url)]) }));
  const lower = presentSourceReply(replyFor(item), packetFor(item), [lowerAugmented], { spoiler: 'balanced' });
  assert.equal(lower.text, `Download Tool: ${url}`);
  assert.doesNotMatch(lower.text, /account/i, 'Direct-only qualifiers do not leak into a lower authored variant');
});

test('refusal, other entities, methods, hidden records, and unrelated IDs cannot supply download answers', () => {
  const a = record('a', 'Tool A', '#a');
  const b = record('b', 'Tool B', '#b');
  const augmented = augmentPrototypeRecords([a, b], rootFor({
    '#a': element('Download A.', [anchor('https://a.test/download')]),
    '#b': element('Download B.', [anchor('https://b.test/download')]),
  }));
  for (const decision of ['decline', 'clarify', 'duplicate']) {
    const answer = { ...replyFor(a), decision };
    assert.strictEqual(presentSourceReply(answer, packetFor(a), augmented, { spoiler: 'direct' }), answer);
  }
  const wrongEntity = replyFor(b);
  assert.strictEqual(presentSourceReply(wrongEntity, packetFor(a), augmented, { spoiler: 'direct' }), wrongEntity);
  for (const packet of [{ ...packetFor(a), method: 'buy' }, { ...packetFor(a), intent: 'use' }, { ...packetFor(a), requestedFormat: null }]) {
    const answer = presentSourceReply(replyFor(a), packet, augmented, { spoiler: 'direct' });
    assert.equal(answer.text, 'Original source-backed answer.');
    assert.doesNotMatch(JSON.stringify(answer), /b\.test/);
    assert.equal(answer.sourcePresentation, undefined);
    if (packet.method === 'buy' || packet.intent === 'use') assert.equal(answer.sourceLinks, undefined);
  }
  const hidden = { ...augmented[0], minSpoiler: 'direct' };
  const answer = replyFor(a);
  assert.strictEqual(presentSourceReply(answer, packetFor(a), [hidden], { spoiler: 'gentle' }), answer);
  const unknown = { ...replyFor(a), recordIds: ['invented'] };
  assert.strictEqual(presentSourceReply(unknown, packetFor(a), augmented, { spoiler: 'direct' }), unknown);
});

test('multiple possible download URLs retain the source answer rather than guessing a primary link', () => {
  const item = record('tool', 'Tool', '#tool');
  const [augmented] = augmentPrototypeRecords([item], rootFor({ '#tool': element('Download information.', [anchor('https://example.test/a'), anchor('https://example.test/b')]) }));
  const result = presentSourceReply(replyFor(item), packetFor(item), [augmented], { spoiler: 'direct' });
  assert.equal(result.text, 'Original source-backed answer.');
  assert.equal(result.sourceLinks.length, 2);
  assert.equal(result.sourcePresentation, undefined);
});

test('conditional qualifiers and edition limits survive resource presentation', () => {
  const item = record('tool', 'Tool', '#tool', { editions: ['1.16.1'] });
  const [augmented] = augmentPrototypeRecords([item], rootFor({ '#tool': element('Download Tool.', [anchor('https://example.test/download')]) }));
  const editionReply = { ...replyFor(item), text: 'Use the guide target installation, version 1.16.1.' };
  const editionResult = presentSourceReply(editionReply, packetFor(item), [augmented], { spoiler: 'direct' });
  assert.ok(editionResult.text.includes(editionReply.text));
  for (const extra of [{ answerSuffix: 'Other requirements may be unmodeled.' }, { answerPrefix: 'Only after the prerequisite: ' }]) {
    const conditional = { ...editionReply, ...extra };
    const result = presentSourceReply(conditional, packetFor(item), [augmented], { spoiler: 'direct' });
    assert.equal(result.text, conditional.text);
    assert.equal(result.sourcePresentation, undefined);
    assert.equal(result.sourceLinks[0].url, 'https://example.test/download');
  }
});

test('research attribution, missing selector evidence, and protected packets remain unchanged', () => {
  const item = record('tool', 'Tool', '#tool');
  const [augmented] = augmentPrototypeRecords([item], rootFor({ '#tool': element('Download.', [anchor('https://example.test/download')]) }));
  const research = { ...augmented, variants: { direct: { text: 'Outside research.', source: { review: 'external-research', file: 'research', locator: 'one' } } } };
  const answer = { ...replyFor(item), text: 'Not in this guide — from outside research: Outside research.' };
  assert.strictEqual(presentSourceReply(answer, packetFor(item), [research], { spoiler: 'direct' }), answer);
  assert.strictEqual(presentSourceReply(answer, { ...packetFor(item), status: 'protected' }, [augmented], { spoiler: 'direct' }), answer);
  assert.strictEqual(augmentPrototypeRecords([item], rootFor({}))[0], item);
});

test('current StarCraft overlay records use separate download sources and a reviewed identity facet', () => {
  const overlay = JSON.parse(fs.readFileSync(new URL('../../../data/assistant/starcraft.json', import.meta.url), 'utf8'));
  // Small source excerpts exercise the production adapter plus the generic
  // presenter. Actual CSS selectors and hrefs are checked against browser DOM.
  const root = rootFor({
    '#schnail-requirements li:nth-child(1)': element('Register at SCHNAIL (Starcraft Human and AI League).'),
    '#schnail-requirements li:nth-child(2)': element('Download the latest SCHNAIL release (requires account).', [anchor('https://www.schnail.com/#/downloads', 'their downloads page'), anchor('#setup', 'SCHNAIL Setup Guide')]),
    '#schnail-setup ul': element('Automatic updates for both client and game; Integrated matchmaking system.'),
    '#schnail-setup': element('Launch the SCHNAIL client and log in; Start playing against the AI.'),
    '#schnail-setup .text-blue-700': element('SCHNAIL includes its own version of Starcraft: Brood War.'),
    '#bwai-setup ol > li:nth-child(2)': element('Download BWAILauncher from GitHub.', [anchor('https://github.com/poiuyqwert/BWAILauncher/tree/main', 'GitHub')]),
  });
  const records = augmentPrototypeRecords(buildStarcraftRecords(root, overlay), root);
  const assistant = createAssistant({ gameId: 'starcraft', records });
  for (const [question, entityId, url] of [
    ['How do I download SCHNAIL?', 'starcraft:schnail', 'https://www.schnail.com/#/downloads'],
    ['How do I download BWAILauncher?', 'starcraft:bwai', 'https://github.com/poiuyqwert/BWAILauncher/tree/main'],
  ]) {
    const original = assistant.answer(question, { spoiler: 'direct' });
    assert.equal(original.decision, 'answer', original.text);
    const presented = presentSourceReply(original, { status: 'ready', entityId, intent: 'acquisition', method: 'download', requestedFormat: 'link' }, records, { spoiler: 'direct' });
    assert.match(presented.text, /^Download /);
    assert.ok(presented.text.includes(url));
    assert.equal(presented.sourceLinks.length, 1);
    assert.deepEqual(presented.recordIds, original.recordIds);
    assert.ok(presented.sources.length >= original.sources.length);
  }
  const original = assistant.answer('What is SCHNAIL?', { spoiler: 'direct' });
  assert.equal(original.decision, 'answer', original.text);
  const presented = presentSourceReply(original, { status: 'ready', entityId: 'starcraft:schnail', intent: 'identity' }, records, { spoiler: 'direct' });
  assert.equal(presented.text, 'SCHNAIL (Starcraft Human and AI League) is a client for playing Brood War AI opponents.');
  assert.equal(presented.sourcePresentation.kind, 'reviewed-identity');
  assert.ok(presented.sources.some(entry => entry.review === 'authored-from-guide' && entry.basedOn?.file === 'guides/StarcraftBWAPI.html'));
  const gentleOriginal = assistant.answer('What is SCHNAIL?', { spoiler: 'gentle' });
  const gentle = presentSourceReply(gentleOriginal, { status: 'ready', entityId: 'starcraft:schnail', intent: 'identity' }, records, { spoiler: 'gentle' });
  assert.equal(gentle.text, 'SCHNAIL is a client for playing Brood War AI opponents.');
  assert.equal(gentle.sourceLinks, undefined);
});
