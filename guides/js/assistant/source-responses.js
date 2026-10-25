// Reviewed source facets and exact DOM hrefs. A model prediction never creates a fact.
import { authorize, level } from './policy.js';
import { normalize, tokens } from './retrieval.js';

const GUIDE_FILE = 'guides/StarcraftBWAPI.html';
const FACET_FILE = 'guides/js/assistant/source-responses.js';
const TIERS = ['gentle', 'balanced', 'direct'];

// This reviewed catalog is data indexed by source record, not a dialogue rule.
// Add another identity summary only with its own reviewed selectors and variants.
const SOURCE_DEFINITIONS = [{
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
export function augmentSourceRecords(records, root) {
  if (!root?.querySelector) return records;
  const pageName = String(root.URL || root.ownerDocument?.URL || '').match(/\/([^/?#]+\.html)(?:[?#]|$)/)?.[1];
  return records.map(record => {
    if (!/^guides\/[^/]+\.html$/.test(record.source?.file || '') || record.source.review !== 'extracted' || record.conflict) return record;
    if (pageName && record.source.file.split('/').at(-1) !== pageName) return record;
    const selector = record.source.selector || record.source.locator;
    if (typeof selector !== 'string' || !selector || selector.includes(';')) return record;
    let element;
    try { element = root.querySelector(selector); } catch { return record; }
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
    const definitionIndex = SOURCE_DEFINITIONS.findIndex(definition => definition.recordId === record.id && definition.entityId === record.entityId);
    const definition = SOURCE_DEFINITIONS[definitionIndex];
    const verifiedDefinition = definition && definition.evidence.every(evidence => {
      let source;
      try { source = root.querySelector(evidence.selector); } catch { return false; }
      return source && evidence.contains.test(normalizedText(source.textContent));
    });
    const sourceDefinition = verifiedDefinition ? {
      variants: Object.fromEntries(TIERS.map(tier => [tier, {
        text: definition.variants[tier],
        source: {
          file: FACET_FILE, locator: `SOURCE_DEFINITIONS[${definitionIndex}].variants.${tier}`,
          review: 'authored-from-guide',
          basedOn: {
            file: GUIDE_FILE, locator: [...new Set(definition.evidence.map(evidence => evidence.selector))].join('; '),
            review: 'extracted',
          },
        },
      }])),
    } : undefined;
    return { ...record, ...(sourceLinks.length ? { sourceLinks } : {}), ...(sourceDefinition ? { sourceDefinition } : {}) };
  });
}

function uniqueSources(sources) {
  return [...new Map(sources.map(source => [JSON.stringify(source), source])).values()];
}

// Keep an already-reviewed concise definition when a focused fact selected an
// acronym/registration excerpt. It is still the DOM-verified definition made
// above, with both pieces of provenance retained, never a model paraphrase.
export function presentKnowledgeDefinition(reply, question, records) {
  if (reply?.decision !== 'answer' || !reply.knowledge?.focusEntityId) return reply;
  const q = normalize(question).replace(/[?!.]+$/, '').replace(/^(?:according to (?:this|the) guide|in (?:this|the) guide)[,:]?\s+/, '');
  for (const record of records) {
    if (record.entityId !== reply.knowledge.focusEntityId || record.conflict || record.requires !== null) continue;
    const visible = authorize(record, 'direct'), definition = record.sourceDefinition?.variants?.direct;
    if (!visible || !definition?.text || definition.source?.review !== 'authored-from-guide'
      || definition.source.basedOn?.review !== 'extracted' || definition.source.basedOn.file !== visible.source?.file) continue;
    const labels = [visible.title, ...visible.aliases].map(alias => tokens(alias).join(' '));
    const subject = q.replace(/^(?:what|who)(?: is| are|'s) (?:the |a |an )?/, '')
      .replace(/^what does (?:the )?/, '').replace(/ stand for$/, '');
    const basic = /^(?:what|who)(?: is| are|'s) /.test(q) || /^what does .+ stand for$/.test(q);
    if (!basic || !labels.includes(tokens(subject).join(' '))) continue;
    return { ...reply, text: definition.text, recordIds: [...new Set([...reply.recordIds, record.id])],
      sources: uniqueSources([...reply.sources, definition.source]),
      sourcePresentation: { kind: 'reviewed-knowledge-definition', recordId: record.id } };
  }
  return reply;
}

/**
 * Quote an explicit authorship attribution from an unconditional explanatory
 * record. "Framework by Named Authors" is source evidence; a co-occurring name
 * or an ordinary character description is not a creator relationship. No name
 * is extracted or inferred and the complete authorized passage is retained.
 */
export function sourceFacetReply(packet, records, { spoiler = 'direct' } = {}) {
  const r = packet?.restrictions || {};
  if (packet?.status !== 'ready' || !packet.entityId || packet.qualifier !== 'creator' || r.negation || r.hypothetical || r.progress || r.compound
    || r.comparison || r.causal || r.editions?.length || r.quantities?.length || r.material?.length) return null;
  const attribution = /\b(?:framework|library|software|program|tool|project|bot|client|application|game|guide|book|article)\s+(?:(?:created|developed|written|authored)\s+)?by\s+[A-Z][\p{L}\p{M}.'’\u2013-]+(?:\s|[;,.(]|$)/u;
  const matches = records.flatMap(record => {
    if (record.entityId !== packet.entityId || record.conflict) return [];
    const visible = authorize(record, level(spoiler));
    if (!visible || visible.identity === false || visible.requires !== null || visible.diagnostics.length
      || !['extracted', 'authored-from-guide'].includes(visible.source?.review)
      || !(visible.relation === 'explanation' || visible.answers.includes('explanation')) || !attribution.test(visible.text)) return [];
    return [visible];
  });
  if (matches.length !== 1) return null;
  const [visible] = matches;
  return { decision: 'answer', text: visible.text, recordIds: [visible.id], sources: [visible.source], actions: [], choices: [], stateChanges: [],
    level: visible.level, title: visible.title, sourcePresentation: { kind: 'quoted-creator', recordId: visible.id } };
}

/** Keep citations only for selected authorized source text actually displayed.
 * A failed sibling may have retrieved related text without showing it. Its
 * source must not become a second citation for an accepted sibling's answer.
 * Exact narrative claims and authored resource/definition provenance survive.
 */
export function normalizeSourceReplyCitations(reply, records, {spoiler='direct'} = {}) {
  if (reply?.decision!=='answer' || !Array.isArray(reply.recordIds) || !reply.recordIds.length
    || !Array.isArray(reply.sources) || !Array.isArray(records)) return reply;
  const sourceKey = source => source && ['file','locator','review'].every(key=>typeof source[key]==='string' && source[key].trim())
    ? JSON.stringify([source.file,source.locator,source.review]) : null;
  const same = (left,right) => Boolean(sourceKey(left) && sourceKey(left)===sourceKey(right));
  const displayed = text => Boolean(normalizedText(text) && normalizedText(reply.text).includes(normalizedText(text)));
  const permitted = [];
  const add = source => { if(sourceKey(source))permitted.push(source); };
  let selected = false;
  for (const record of records) {
    if (!reply.recordIds.includes(record.id)) continue;
    const visible=authorize(record,level(spoiler));
    if(!visible)continue;
    selected=true;
    if(displayed(visible.text)) {
      add(visible.source);add(visible.source?.basedOn);
    }
    // Narrative answers can display an explicit selected claim rather than its
    // containing multi-claim record. No co-occurring source may substitute.
    for(const claim of visible.source?.claims || [])if(displayed(claim.text))add(claim.source);
    const definition=record.sourceDefinition?.variants?.[visible.level];
    if(definition?.source?.review==='authored-from-guide' && definition.source.basedOn?.review==='extracted'
      && definition.source.basedOn.file===visible.source?.file && displayed(definition.text)) {
      add(definition.source);add(visible.source);add(definition.source.basedOn);
    }
    for(const link of record.sourceLinks || [])if(safeSourceUrl(link.url) && displayed(link.url)
      && Array.isArray(link.levels) && link.levels.includes(visible.level)
      && (same(link.source,visible.source) || same(link.source,record.source) || same(link.source,visible.source?.basedOn)))add(link.source);
  }
  if(!selected)return reply.sources.length?{...reply,sources:[]}:reply;
  const sources=reply.sources.filter(source=>permitted.some(candidate=>same(source,candidate)));
  return sources.length===reply.sources.length?reply:{...reply,sources};
}

/**
 * Present only facts selected by a successful engine reply, reauthorized at the
 * current help ceiling. A model prediction alone can never create an answer.
 */
export function presentSourceReply(reply, packet, records, { spoiler = 'direct' } = {}) {
  reply=normalizeSourceReplyCitations(reply,records,{spoiler});
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
  if (packet.intent === 'stats' && ['base', 'starting', 'initial'].includes(packet.qualifier)) return {
    ...withLinks, text: `Recorded guide stats:\n${reply.text}`,
    sourcePresentation: { kind: 'recorded-stats', qualifier: packet.qualifier },
  };
  // A compound/multi-record answer keeps its original wording and qualifiers.
  if (selected.length !== 1 || reply.recordIds.length !== 1) return withLinks;
  const [{ record, visible }] = selected;
  // Conditional or diagnostic answer prose is already reviewed by the engine.
  // Attach resources, but do not replace qualifiers with a shorter sentence.
  if (reply.answerPrefix || reply.answerSuffix || visible.requires !== null || visible.diagnostics.length) return withLinks;
  if (packet.intent === 'identity') {
    const definition = record.sourceDefinition?.variants?.[visible.level];
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
