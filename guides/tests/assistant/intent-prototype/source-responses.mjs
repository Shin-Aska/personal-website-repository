// Prototype-only source facets. The production adapters and guide claims stay unchanged.
import { buildStarcraftRecords } from '../../../js/assistant/adapters/starcraft.js';
import { authorize, level } from '../../../js/assistant/policy.js';

const GUIDE_FILE = 'guides/StarcraftBWAPI.html';
const FACET_FILE = 'guides/tests/assistant/intent-prototype/source-responses.mjs';
const TIERS = ['gentle', 'balanced', 'direct'];

// This reviewed catalog is data indexed by source record, not a dialogue rule.
// Add another identity summary only with its own reviewed selectors and variants.
const PROTOTYPE_DEFINITIONS = [{
  recordId: 'starcraft:schnail:features',
  entityId: 'starcraft:schnail',
  evidence: [
    { selector: '#schnail-requirements li:nth-child(1)', contains: /Starcraft Human and AI League/i },
    { selector: '#schnail-setup', contains: /Launch the SCHNAIL client/i },
    { selector: '#schnail-setup', contains: /Start playing against the AI/i },
    { selector: '#schnail-setup .text-blue-700', contains: /Starcraft: Brood War/i },
  ],
  variants: {
    gentle: 'SCHNAIL is a client for playing Brood War AI opponents.',
    balanced: 'SCHNAIL (Starcraft Human and AI League) is a client for playing Brood War AI opponents.',
    direct: 'SCHNAIL (Starcraft Human and AI League) is a client for playing Brood War AI opponents.',
  },
}];

function safeSourceUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value) || /[\u0000-\u0020\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

const normalizedText = value => String(value || '').replace(/\s+/g, ' ').trim();
const variantText = variant => typeof variant === 'string' ? variant : variant?.text || '';

/** Extract only hrefs actually inside each record's exact, reviewed source selector. */
export function augmentPrototypeRecords(records, root) {
  return records.map(record => {
    if (record.source?.file !== GUIDE_FILE || record.source.review !== 'extracted' || record.conflict) return record;
    const selector = record.source.selector || record.source.locator;
    if (typeof selector !== 'string' || !selector || selector.includes(';')) return record;
    const element = root.querySelector(selector);
    if (!element) return record;
    const sourceLinks = [];
    const seen = new Set();
    const anchors = [
      ...(element.matches?.('a[href]') ? [element] : []),
      ...element.querySelectorAll('a[href]'),
    ];
    for (const anchor of anchors) {
      const url = anchor.getAttribute('href');
      if (!safeSourceUrl(url) || seen.has(url)) continue;
      seen.add(url);
      sourceLinks.push({
        text: anchor.textContent || '', url,
        source: { ...record.source, locator: selector },
        contextText: element.textContent || '',
        // DOM hrefs originate at Direct. A lower tier needs an explicitly
        // authored exact URL, rather than merely referring to a downloads page.
        levels: TIERS.filter(tier => tier === 'direct' || variantText(record.variants?.[tier]).includes(url)),
      });
    }
    const definitionIndex = PROTOTYPE_DEFINITIONS.findIndex(definition => definition.recordId === record.id && definition.entityId === record.entityId);
    const definition = PROTOTYPE_DEFINITIONS[definitionIndex];
    const verifiedDefinition = definition && definition.evidence.every(evidence => {
      const source = root.querySelector(evidence.selector);
      return source && evidence.contains.test(normalizedText(source.textContent));
    });
    const prototypeDefinition = verifiedDefinition ? {
      variants: Object.fromEntries(TIERS.map(tier => [tier, {
        text: definition.variants[tier],
        source: {
          file: FACET_FILE, locator: `PROTOTYPE_DEFINITIONS[${definitionIndex}].variants.${tier}`,
          review: 'authored-from-guide',
          basedOn: {
            file: GUIDE_FILE, locator: [...new Set(definition.evidence.map(evidence => evidence.selector))].join('; '),
            review: 'extracted',
          },
        },
      }])),
    } : undefined;
    return { ...record, ...(sourceLinks.length ? { sourceLinks } : {}), ...(prototypeDefinition ? { prototypeDefinition } : {}) };
  });
}

async function readJSON(path) {
  const response = await fetch(new URL(path, import.meta.url), { redirect: 'error' });
  if (!response.ok) throw new Error(`Missing prototype source file: ${path}`);
  return response.json();
}

/** Load inert guide sources for the lab; nothing is mounted or executed from the HTML. */
export async function loadPrototypeRecords(gameId) {
  if (gameId === 'ultima7') return (await readJSON('./assets/ultima7-records.json')).records;
  if (gameId !== 'starcraft') throw new Error('Prototype supports only Ultima VII and StarCraft');
  const response = await fetch(new URL('../../../StarcraftBWAPI.html', import.meta.url), { redirect: 'error' });
  if (!response.ok) throw new Error('The StarCraft guide could not be read');
  const root = new DOMParser().parseFromString(await response.text(), 'text/html');
  return augmentPrototypeRecords(buildStarcraftRecords(root, await readJSON('../../../data/assistant/starcraft.json')), root);
}

function uniqueSources(sources) {
  return [...new Map(sources.map(source => [JSON.stringify(source), source])).values()];
}

/**
 * Present only facts selected by a successful engine reply, reauthorized at the
 * current help ceiling. A model prediction alone can never create an answer.
 */
export function presentSourceReply(reply, packet, records, { spoiler = 'gentle' } = {}) {
  if (reply?.decision !== 'answer' || packet?.status !== 'ready' || !packet.entityId
    || !Array.isArray(reply.recordIds) || !reply.recordIds.length) return reply;
  const selectedIds = new Set(reply.recordIds);
  const selected = records.flatMap(record => {
    if (!selectedIds.has(record.id) || record.entityId !== packet.entityId || record.conflict) return [];
    const visible = authorize(record, level(spoiler));
    if (!visible || visible.source?.review === 'conflicting' || visible.source?.review === 'external-research') return [];
    const relationship = packet.intent === 'identity' ? 'explanation' : packet.intent;
    if (visible.relation !== relationship && !visible.answers.includes(relationship)) return [];
    if (packet.method && !visible.acquisitionMethods.includes(packet.method)) return [];
    return [{ record, visible }];
  });
  if (!selected.length) return reply;
  const sourceLinks = selected.flatMap(({ record, visible }) => (record.sourceLinks || [])
    .filter(link => safeSourceUrl(link.url) && Array.isArray(link.levels) && link.levels.includes(visible.level)
      && link.source?.file === record.source?.file && link.source?.locator === (record.source?.selector || record.source?.locator)
      && link.source?.review === 'extracted')
    .map(link => ({ text: link.text, url: link.url, source: link.source, recordId: record.id })));
  const withLinks = sourceLinks.length ? { ...reply, sourceLinks } : reply;
  // A compound/multi-record answer keeps its original wording and qualifiers.
  if (selected.length !== 1 || reply.recordIds.length !== 1) return withLinks;
  const [{ record, visible }] = selected;
  // Conditional or diagnostic answer prose is already reviewed by the engine.
  // Attach resources, but do not replace qualifiers with a shorter sentence.
  if (reply.answerPrefix || reply.answerSuffix || visible.requires !== null || visible.diagnostics.length) return withLinks;
  if (packet.intent === 'identity') {
    const definition = record.prototypeDefinition?.variants?.[visible.level];
    if (definition?.text && definition.source?.review === 'authored-from-guide') return {
      ...withLinks, text: definition.text,
      sources: uniqueSources([...(reply.sources || []), definition.source]),
      sourcePresentation: { kind: 'reviewed-identity', recordId: record.id, level: visible.level },
    };
  }
  if (packet.intent === 'acquisition' && packet.method === 'download' && packet.requestedFormat === 'link'
    && record.relation === 'acquisition' && visible.acquisitionMethods.includes('download') && sourceLinks.length === 1) {
    const link = sourceLinks[0];
    const rawLink = record.sourceLinks.find(candidate => candidate.url === link.url);
    const context = normalizedText(visible.level === 'direct' ? rawLink.contextText : visible.text);
    const accountRequired = /\brequires (?:an? )?account\b|\baccount (?:is )?required\b/i.test(context);
    return {
      ...withLinks,
      text: `Download ${visible.title}: ${link.url}${accountRequired ? '\nAccount required.' : ''}${visible.editions.length ? `\n${reply.text}` : ''}`,
      sources: uniqueSources([...(reply.sources || []), link.source]),
      sourcePresentation: { kind: 'download-link', recordId: record.id, level: visible.level },
    };
  }
  return withLinks;
}
