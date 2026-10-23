import { createAssistant } from '../engine.js';
import { createView } from '../ui.js';
import { buildNarrativeRecords, buildResearchRecords } from '../topics.js';

const BREAKS = new Set(['LI', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL']);
// The guide's own words, with list items and paragraphs separated so a Direct
// answer reads as separate points instead of one run-on line.
function sourceText(root, selector) {
    const element = root.querySelector(selector);
    if (!element) return '';
    const pieces = [];
    const walk = node => {
        if (node.nodeType === 3) pieces.push(node.nodeValue);
        else if (node.nodeType === 1) {
            const breaks = BREAKS.has(node.tagName);
            if (breaks) pieces.push('\u0001');
            node.childNodes.forEach(walk);
            if (breaks) pieces.push('\u0001');
        }
    };
    walk(element);
    const segments = pieces.join('').split('\u0001').map(part => part.replace(/\s+/g, ' ').trim()).filter(Boolean);
    let text = '';
    for (const segment of segments) {
        // "Pros:" and a bare list number stay with the text that follows them.
        text += !text ? segment : /(?::|^\d+\.)$/.test(text.split('; ').at(-1)) ? ` ${segment}` : `; ${segment}`;
    }
    return text;
}
// Authored alias grids: every {SLOT} in a phrase expands to each listed value,
// so one symptom ("antivirus is blocking SCHNAIL") is recognised in its common wordings.
function expandAliases(spec = {}) {
    const slots = spec.slots || {};
    const out = new Set(spec.aliases || []);
    for (const phrase of spec.phrases || []) {
        let forms = [phrase];
        for (const [slot, values] of Object.entries(slots))
            if (phrase.includes(`{${slot}}`)) forms = forms.flatMap(form => values.map(value => form.replaceAll(`{${slot}}`, value)));
        forms.forEach(form => out.add(form));
    }
    return [...out];
}

// Facts stay in the existing document. The overlay supplies relationships,
// stable IDs and separately authored short variants, never a second guide.
export function buildStarcraftRecords(root, overlay) {
    const records = buildStarcraftGuideRecords(root, overlay);
    const facts = new Map((overlay.narrativeFacts || []).flatMap(fact => {
        const text = sourceText(root, fact.selector);
        return text ? [[fact.key, { text, minSpoiler: 'direct', source: { file: 'guides/StarcraftBWAPI.html', locator: fact.selector, review: 'extracted' } }]] : [];
    }));
    const narratives = buildNarrativeRecords('starcraft', (overlay.narratives || []).map(definition => ({
        ...definition, overlayFile: 'guides/data/assistant/starcraft.json'
    })), facts);
    return [...records, ...narratives, ...buildResearchRecords('starcraft', overlay.research, 'guides/data/assistant/starcraft.json')];
}
function buildStarcraftGuideRecords(root, overlay) {
    return overlay.entities.flatMap((entity, entityIndex) => entity.facts.flatMap((fact, factIndex) => {
        const extracted = sourceText(root, fact.selector);
        if (!extracted) return [];
        const direct = fact.conflict ? fact.balanced : extracted;
        const authoredSource = field => ({
            file: 'guides/data/assistant/starcraft.json',
            locator: `entities[${entityIndex}].facts[${factIndex}].${field}`,
            review: 'authored-from-guide',
            basedOn: {
                file: 'guides/StarcraftBWAPI.html',
                locator: fact.selector,
                review: 'extracted'
            }
        });
        // A problem statement ("BWAILauncher doesn't detect my game") has no question word, so a fact
        // marked standalone is its own single-record entry that answers by itself.
        const alone = fact.standalone;
        const record = {
            id: `starcraft:${entity.id}:${fact.id}`,
            entityId: alone ? `starcraft:${entity.id}-${fact.id}` : `starcraft:${entity.id}`,
            title: alone ? alone.title : entity.title,
            aliases: alone ? [alone.title, ...expandAliases(alone)] : [...entity.aliases, ...(fact.aliases || [])],
            kind: alone || entity.kind === 'qa' ? 'qa' : 'setup',
            relation: fact.relation,
            answers: [...(fact.answers || [])],
            acquisitionMethods: fact.relation === 'acquisition' ? ['download'] : [...(fact.methods || [])],
            scope: `starcraft:${entity.id}`,
            editions: fact.editions || (fact.edition ? [fact.edition] : []),
            general: Boolean(fact.general),
            conflict: Boolean(fact.conflict),
            requires: null,
            variants: {
                gentle: { text: fact.gentle, source: authoredSource('gentle') },
                balanced: { text: fact.balanced, source: authoredSource('balanced') },
                direct: { text: direct, ...(fact.conflict ? { source: authoredSource('balanced') } : {}) }
            },
            source: {
                file: 'guides/StarcraftBWAPI.html',
                locator: fact.selector,
                review: 'extracted',
                ...(fact.answers?.length ? { index: { file: 'guides/data/assistant/starcraft.json', locator: `entities[${entityIndex}].facts[${factIndex}].answers`, review: 'authored-index' } } : {}),
                ...(fact.conflict ? { note: 'Conflicts with #bwai-requirements; no hard compatibility rule.' } : {})
            }
        };
        // The same fact also stays under its parent subject, so "what if it can't find my game?" after a
        // BWAILauncher answer, and "tell me everything about SCHNAIL", still find it.
        if (!alone?.keepInParent) return [record];
        const parentAnswers = alone.parentAnswers || [];
        const { index, ...parentSource } = record.source;
        return [record, {
            ...record, id: `${record.id}-note`, entityId: `starcraft:${entity.id}`, title: entity.title,
            aliases: [...entity.aliases], kind: 'setup', answers: [...parentAnswers],
            source: parentAnswers.length ? record.source : parentSource
        }];
    }));
}

export async function mountStarcraftAssistant(root = document) {
    const response = await fetch(new URL('../../../data/assistant/starcraft.json', import.meta.url));
    if (!response.ok) throw new Error('The local guide data could not be loaded.');
    const overlay = await response.json();
    const assistant = createAssistant({
        gameId: 'starcraft',
        records: buildStarcraftRecords(root, overlay),
        getProgress: () => []
    });
    const select = root.getElementById('sc-assistant-topic');
    const messages = root.getElementById('sc-ai-chat');
    messages.replaceChildren();
    const view = createView({
        assistant,
        messages,
        input: root.getElementById('sc-ai-input'),
        sendButton: root.getElementById('sc-ai-send'),
        getContext: () => ({
            contextId: `starcraft:${select.value || 'general'}`,
            entityIds: select.value ? [`starcraft:${select.value}`] : [],
            tone: root.getElementById('sc-assistant-tone').value,
            label: select.value ? select.selectedOptions[0]?.textContent : undefined
        }),
        spoilerSelect: root.getElementById('sc-assistant-spoiler'),
        toneSelect: root.getElementById('sc-assistant-tone')
    });
    select.addEventListener('change', () => {
        assistant.resetTopic();
        view.refresh();
    });
    root.querySelectorAll('#main-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            assistant.resetTopic();
            view.refresh();
        });
    });
    return { assistant, view };
}
