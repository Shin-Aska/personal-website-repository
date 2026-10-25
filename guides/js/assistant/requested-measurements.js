// A field-presence guard, not a fact finder. Callers must first establish the
// subject, source, edition and material, and pass each authorized witness alone.
const normalize = value => typeof value === 'string' ? value.normalize('NFKC')
    .toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';

const UNIT_NAMES = {
    ounce: ['ounce', 'ounces', 'oz'], gram: ['gram', 'grams', 'g'],
    kilogram: ['kilogram', 'kilograms', 'kg'], litre: ['litre', 'litres', 'liter', 'liters', 'l'],
    mile: ['mile', 'miles'], metre: ['metre', 'metres', 'meter', 'meters', 'm'],
    foot: ['foot', 'feet', 'ft'], hour: ['hour', 'hours', 'hr', 'hrs'],
    day: ['day', 'days'], minute: ['minute', 'minutes', 'min', 'mins'],
    second: ['second', 'seconds', 'sec', 'secs'], turn: ['turn', 'turns'],
    cycle: ['cycle', 'cycles'], sp: ['sp']
};
const UNIT_LOOKUP = new Map(Object.entries(UNIT_NAMES).flatMap(([unit, names]) => names.map(name => [name, unit])));
const UNIT_PATTERN = [...UNIT_LOOKUP.keys()].sort((a, b) => b.length - a.length).join('|');
const ONE = '(?:one|two|three|four|five|six|seven|eight|nine)';
const SMALL = `(?:zero|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[ -]${ONE})?|${ONE})`;
const HUNDREDS = `(?:${ONE}[ -]hundred(?:[ -](?:and[ -])?${SMALL})?|${SMALL})`;
const NUMBER = `(?:\\d+(?:,\\d{3})*(?:\\.\\d+)?|${HUNDREDS}(?:[ -]thousand(?:[ -](?:and[ -])?${HUNDREDS})?)?)`;
const AGE_PATTERNS = [
    `\\b(${NUMBER})[ -]years?[ -]old\\b`,
    `\\baged[ -](${NUMBER})\\b`,
    `\\bage(?:\\s*:\\s*|\\s+(?:(?:is|of)\\s+)?)(${NUMBER})\\b`
];
const CLAUSE_BREAK = /[!?;]|\.(?!\d)/;
const NEGATED_OR_UNKNOWN = /\b(?:not|never|no|without|unknown|unspecified|uncertain|unconfirmed|unclear|cannot|[a-z]+n't)\b/;
const BOUND_PREFIX = /(?:\b(?:about|around|approximately|roughly|nearly|almost|circa|estimated(?: at)?|at least|at most|up to|more than|less than|fewer than|over|under|between)|[<>≤≥~≈])\s*$/;
const RANGE_PREFIX = new RegExp(`\\b${NUMBER}(?:[ -](?:${UNIT_PATTERN}))?\\s*(?:[-–—]|to|through|and|or)\\s*$`);
const RANGE_SUFFIX = new RegExp(`^\\s*(?:[-–—]|to|through|or)\\s*${NUMBER}\\b`);
const BOUND_SUFFIX = /^\s*(?:approximately|roughly|or (?:more|less)|minimum|maximum|at (?:least|most))\b/;

function positiveAmount(pattern, witness, exact) {
    return [...witness.matchAll(new RegExp(pattern, 'g'))].some(match => {
        const amountStart = match.index + match[0].indexOf(match[1]);
        const before = witness.slice(0, amountStart).split(CLAUSE_BREAK).at(-1);
        const after = witness.slice(match.index + match[0].length).split(CLAUSE_BREAK)[0];
        const clause = before + witness.slice(amountStart, match.index + match[0].length) + after;
        if (NEGATED_OR_UNKNOWN.test(clause)) return false;
        // "Hand over two ounces" is an instruction, not an upper bound.
        const boundContext = before.replace(/\bhand(?:s|ed|ing)? over\s*$/, '')
            .replace(/\b(?:aged[ -]|age(?:\s*:\s*|\s+(?:(?:is|of)\s+)?))$/, '');
        return !exact || !(BOUND_PREFIX.test(boundContext) || RANGE_PREFIX.test(before)
            || RANGE_SUFFIX.test(after) || BOUND_SUFFIX.test(after));
    });
}

/** Read only explicit age questions or quantity questions naming a finite unit. */
export function parseRequestedMeasurement(text) {
    const normalized = normalize(text);
    const exact = /\bexactly\b/.test(normalized);
    const q = normalized.replace(/\?$/, '').trim().replace(/^exactly\s+/, '');
    let age = /^how old(?: exactly)? is (.+?)(?: exactly)?$/.exec(q)
        || /^what is (.+?)(?:'s)? age(?: exactly)?$/.exec(q);
    if (age) return { kind: 'age', subject: age[1].replace(/'s$/, ''), exact };
    const quantity = new RegExp(`^how (?:many|much)(?: exactly)? (${UNIT_PATTERN})\\b`).exec(q);
    return quantity ? { kind: 'quantity', unit: UNIT_LOOKUP.get(quantity[1]), exact } : null;
}

/**
 * Require an adjacent numeric amount and the requested field in one witness.
 * Digits elsewhere, inferred ages, and converted units provide no support.
 * Exact requests also reject local bounds/ranges; negated or unknown clauses
 * always fail closed, including ambiguous mixed positive/negative clauses.
 * A null/unrecognized request is unsupported; callers decide when to apply it.
 */
export function supportsRequestedMeasurement(request, witnessText) {
    const witness = normalize(witnessText);
    if (!witness || !request) return false;
    if (request.kind === 'age') return AGE_PATTERNS.some(pattern => positiveAmount(pattern, witness, request.exact));
    const names = request.kind === 'quantity' && UNIT_NAMES[request.unit];
    return !!names && positiveAmount(`\\b(${NUMBER})[ -](?:${names.join('|')})\\b`, witness, request.exact);
}
