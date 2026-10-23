export const UNKNOWN = 'unknown';
export const and = values => values.includes(false) ? false : values.every(v => v === true) ? true : UNKNOWN;
export const or = values => values.includes(true) ? true : values.every(v => v === false) ? false : UNKNOWN;
export const not = value => value === UNKNOWN ? UNKNOWN : !value;

// Missing, false, and unchecked legacy values are not evidence of non-completion.
export class Evidence {
    constructor(getProgress = () => []) {
        this.getProgress = getProgress;
        this.claims = new Map();
        this.invalidated = new Set();
        this.revision = 0;
    }
    read(id) {
        if (this.claims.has(id)) return this.claims.get(id);
        if (this.invalidated.has(id)) return { id, value: UNKNOWN, source: 'session invalidation' };
        let imported;
        try { imported = (this.getProgress() || []).find(c => c.id === id && c.value === true); }
        catch { return { id, value: UNKNOWN, source: 'unavailable saved progress' }; }
        return imported ? { ...imported, temporal: imported.temporal || 'historical', revision: 0 }
            : { id, value: UNKNOWN, source: 'not reported' };
    }
    correct(id, value, temporal) {
        this.revision++;
        this.invalidated.add(id);
        this.claims.delete(id);
        const claim = { id, value, temporal, source: 'explicit session report', revision: this.revision };
        this.claims.set(id, claim);
        while (this.claims.size > 64) this.claims.delete(this.claims.keys().next().value);
        return claim;
    }
    reset() { this.claims.clear(); this.invalidated.clear(); this.revision++; }
}
export function evaluate(expression, evidence, rules = new Map(), limits = {}) {
    let visited = 0;
    const visiting = new Set(), memo = new Map();
    const result = (value, checks = [], sources = [], issues = []) => ({ value, checks, sources, issues });
    function combine(branches, operator) {
        const value = operator(branches.map(branch => branch.value));
        // One satisfied OR branch is enough. A failed alternative must not
        // become a blocker after another alternative has already succeeded.
        const relevant = operator === or && value === true
            ? [branches.find(branch => branch.value === true)]
            : branches;
        return result(value,
            value === true ? [] : relevant.flatMap(branch => branch.checks),
            relevant.flatMap(branch => branch.sources),
            relevant.flatMap(branch => branch.issues));
    }
    function walk(expr, depth = 0, required = true) {
        if (++visited > (limits.nodes || 200) || depth > (limits.depth || 20)) {
            return result(UNKNOWN, [], [], ['traversal limit']);
        }
        if (!expr) return result(UNKNOWN, [], [], ['unmodeled requirements']);
        if (typeof expr.fact === 'string') {
            const id = expr.fact;
            const key = `${required ? '+' : '-'}${id}`;
            if (memo.has(key)) return memo.get(key);
            const claim = evidence.read(id);
            if (claim.value !== UNKNOWN) {
                const satisfied = claim.value === required;
                const found = result(satisfied, satisfied ? [] : [{
                    fact: id, required, actual: claim.value, state: 'blocker'
                }], [claim]);
                memo.set(key, found);
                return found;
            }
            if (visiting.has(id)) return result(UNKNOWN, [{
                fact: id, required, actual: UNKNOWN, state: 'unknown'
            }], [], ['cyclic requirements']);
            if (rules.has(id)) {
                visiting.add(id);
                const found = walk(rules.get(id), depth + 1, required);
                visiting.delete(id);
                memo.set(key, found);
                return found;
            }
            return result(UNKNOWN, [{
                fact: id, required, actual: UNKNOWN, state: 'unknown'
            }]);
        }
        if (Array.isArray(expr.all))
            return combine(expr.all.map(e => walk(e, depth + 1, required)), required ? and : or);
        if (Array.isArray(expr.any))
            return combine(expr.any.map(e => walk(e, depth + 1, required)), required ? or : and);
        // Carry the requested truth value through NOT so a known-true fact
        // correctly blocks a negative requirement, while missing stays unknown.
        if (expr.not) return walk(expr.not, depth + 1, !required);
        return result(UNKNOWN, [], [], ['invalid requirement']);
    }
    const found = walk(expression);
    const checks = [...new Map(found.checks.map(check => [
        `${check.required ? '+' : '-'}${check.fact}`, check
    ])).values()];
    return {
        value: found.value,
        blockers: [...new Set(checks.filter(c => c.state === 'blocker').map(c => c.fact))],
        unknowns: [...new Set(checks.filter(c => c.state === 'unknown').map(c => c.fact))],
        checks,
        sources: [...new Map(found.sources.map(source => [source.id, source])).values()],
        issues: [...new Set(found.issues)],
        visited
    };
}
