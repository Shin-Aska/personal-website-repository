// Finite literal procedure-field proof. Source authorization, canonical scope,
// edition, material and player-state restrictions remain caller obligations.
const normalize = value => typeof value === 'string' ? value.normalize('NFKC')
    .toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const bare = value => normalize(value).replace(/^(?:the|a|an) /, '');
const UNITS = { cycle: ['cycle', 'cycles'], turn: ['turn', 'turns'], hour: ['hour', 'hours'],
    minute: ['minute', 'minutes'], second: ['second', 'seconds'], day: ['day', 'days'] };
const UNIT_MAP = new Map(Object.entries(UNITS).flatMap(([unit, names]) => names.map(name => [name, unit])));
const UNIT_PATTERN = [...UNIT_MAP.keys()].join('|');
const NUMBER = '(?:\\d+(?:\\.\\d+)?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[ -](?:one|two|three|four|five|six|seven|eight|nine))?)';
const NON_PROOF = /\b(?:not|never|no|without|cannot|can't|don't|doesn't|won't|would|could|might|may|maybe|perhaps|if|unless|whether|unknown|unspecified|uncertain|says?|said|asks?|asked|reports?|reported|claims?|claimed|promises?|promised|plans?|planned|intends?|intended)\b/;
const REFERENCE = /^(?:it|this|that|this ritual|that ritual|this procedure|that procedure)$/;
const SIMPLE_ACTIONS = new Set(['meditate', 'wait', 'rest', 'train']);
const OBJECT_ACTION = /^(?:use|hold|turn|repeat)\s+\S/;
const literalValue = value => !!value && /[\p{L}\p{N}]/u.test(value)
    && !/[!?;]|\b(?:and|or|for|of|to|with|from|the|a|an)$/.test(value);

/**
 * @typedef {{kind:'action-quantity',unit:string,actionText:string,exact:boolean} |
 * {kind:'following-destination',purposeText:string}} SequenceField
 * @typedef {{kind:'sequence-fields',scopeText:string,fields:SequenceField[],originalText:string} |
 * {kind:'completion-reward',completionText:string,suffixText:string,originalText:string}} SequenceFieldRequest
 *
 * Read a complete bounded question. Keep all object, action, source, edition,
 * phase and suffix text. Descriptors are syntax only, never answers or state.
 * @returns {SequenceFieldRequest|null}
 */
export function parseSequenceFieldRequest(text) {
    if (typeof text !== 'string') return null;
    const q = normalize(text).replace(/\?$/, '').trim();
    const reward = /^what does completing (.+?) (?:unlock|grant|give|yield)(.*)$/.exec(q);
    if (reward) return { kind: 'completion-reward', completionText: reward[1], suffixText: reward[2], originalText: text };
    const scoped = /^for (.+?),\s*(.+)$/.exec(q);
    if (!scoped) return null;
    const quantity = new RegExp(`^how many(?: (exactly))? (${UNIT_PATTERN}) do (?:i|we) (.+)$`).exec(scoped[2]);
    if (!quantity) return null;
    const parts = quantity[3].split(/,? and where do (?:i|we) go for /);
    if (parts.length > 2) return null;
    const fields = [{ kind: 'action-quantity', unit: UNIT_MAP.get(quantity[2]),
        actionText: parts[0], exact: !!quantity[1] }];
    if (parts.length === 2) {
        const following = /^(.+) afterward$/.exec(parts[1]);
        if (!following) return null;
        fields.push({ kind: 'following-destination', purposeText: following[1] });
    }
    return { kind: 'sequence-fields', scopeText: scoped[1], fields, originalText: text };
}

function orderedSteps(source) {
    const markers = [...source.matchAll(/(?:^|\s)(\d+)[)]\s+/g)];
    if (markers.length < 2 || markers[0].index !== 0
        || markers.some((marker, index) => Number(marker[1]) !== index + 1)) return [];
    return markers.map((marker, index) => source.slice(marker.index + marker[0].length,
        markers[index + 1]?.index ?? source.length).trim().replace(/\.$/, ''));
}

function supportedAction(requested, recorded) {
    if (SIMPLE_ACTIONS.has(requested)) return recorded === requested || recorded.startsWith(`${requested} `);
    // An object-bearing action must retain the complete literal source object.
    return (OBJECT_ACTION.test(requested) || /^(?:meditate|wait|rest|train)\s+\S/.test(requested))
        && requested === recorded;
}

/**
 * Prove every requested field inside one full literal fact with explicit roles.
 * `subjectEntityId` is the caller-selected canonical owner. `scopeTexts` may
 * contain only that fact's reviewed labels and its owner's canonical names.
 * References additionally require source-grounded conversation (`grounded`).
 * Scope labels only ground the question; no label can supply a numeric amount,
 * action, order, purpose or reward. Completion objects must match source text
 * literally, including counts/modifiers. Unknown suffixes fail closed.
 *
 * Return a boolean only. A true result authorizes rendering the complete fact,
 * never a synthesized answer, proof of completion, or inferred player state.
 */
export function supportsSequenceFieldRequest(request, { fact, subjectEntityId, scopeTexts = [], grounded = false } = {}) {
    if (!request || typeof subjectEntityId !== 'string' || !subjectEntityId
        || fact?.entityId !== subjectEntityId || typeof fact.text !== 'string' || !fact.text.trim()
        || fact.text !== fact.witness || fact.conflict || fact.source?.review === 'conflicting'
        || !Array.isArray(fact.answerRelations) || !Array.isArray(scopeTexts)) return false;
    const current = parseSequenceFieldRequest(request.originalText);
    if (!current || JSON.stringify(current) !== JSON.stringify(request)) return false;
    const source = normalize(fact.text);
    if (NON_PROOF.test(source)) return false;
    if (request.kind === 'completion-reward') {
        if (request.suffixText.trim() || !fact.answerRelations.includes('outcome')) return false;
        const reward = /^completing (.+?) (?:grants|unlocks|gives|yields) (.+?)\.?$/.exec(source);
        return !!reward && reward[1] === normalize(request.completionText)
            && literalValue(reward[2]);
    }
    if (request.kind !== 'sequence-fields'
        || !['method', 'sequence'].every(role => fact.answerRelations.includes(role))) return false;
    const scope = bare(request.scopeText);
    if (REFERENCE.test(scope) ? grounded !== true : !scopeTexts.map(bare).includes(scope)) return false;
    const steps = orderedSteps(source);
    const quantity = request.fields[0];
    if (!steps.length || quantity?.kind !== 'action-quantity' || !UNITS[quantity.unit]) return false;
    const measured = new RegExp(`^(.+?) for (${NUMBER}) (?:${UNITS[quantity.unit].join('|')})$`);
    const candidates = steps.flatMap((step, index) => {
        const match = measured.exec(step);
        return match && supportedAction(normalize(quantity.actionText), match[1]) ? [index] : [];
    });
    if (candidates.length !== 1) return false;
    if (request.fields.length === 1) return true;
    if (request.fields.length !== 2 || request.fields[1].kind !== 'following-destination') return false;
    // Only the immediately following literal step supplies "afterward". A
    // destination or purpose elsewhere in this witness cannot fill that field.
    const destination = /^(?:visit|go to|travel to|return to) (.+?) to (?:receive|get|seek|obtain) (.+)$/.exec(steps[candidates[0] + 1] || '');
    return !!destination && literalValue(destination[1])
        && destination[2] === normalize(request.fields[1].purposeText);
}
