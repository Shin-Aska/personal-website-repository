export function normalize(text) {
    return String(text || '').normalize('NFKC').toLowerCase()
        .replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
}
export function tokens(text) {
    return normalize(text).match(/[\p{L}\p{N}]+(?:['.-][\p{L}\p{N}]+)*/gu) || [];
}
const STOP = new Set('a an the i me my you your it that this is are was were of to for in at on with do does did can could would please tell about and or'.split(' '));
export function terms(text) { return [...new Set(tokens(text).filter(t => !STOP.has(t)))]; }
// Everyday English words that are never a misspelt name, whatever the guide's own vocabulary.
const COMMON = new Set(('garden gardens stone stones secret secrets friend friends mother father sister brother family children child woman women ' +
    'castle village town city tower forest river mountain island ocean desert market church temple bridge street road house home room door window ' +
    'water fire earth wind night light dark shadow power master wizard knight guard king queen lord lady prince princess ' +
    'letter number second minute hour week month year summer winter spring autumn morning evening ' +
    'strong weak quick slow loud quiet happy angry sorry ready ' +
    'bring carry hold keep leave start stop begin finish follow watch listen speak talk walk run jump climb fight build break ' +
    'many much more most some such same other another every each both either neither few little less least ' +
    'cover covers covered swing swings swungover under above below after before again ever never always often sometimes ' +
    'something anything everything nothing someone anyone everyone people person thing things place places time times ' +
    'good great best better worse worst bad nice well long short high tall small large big huge tiny old young new ' +
    'first last next early late near close far away back down over around across along through between among against ' +
    'make makes made making take takes took taken taking give gives gave given giving come comes came coming ' +
    'look looks looked looking want wants wanted need needs needed like likes liked love loves loved hate ' +
    'find finds found finding keep keeps kept keeping leave leaves left leaving start starts started begin begins ' +
    'stop stops stopped turn turns turned move moves moved play plays played work works worked live lives lived ' +
    'think thinks thought know knows knew known feel feels felt seem seems seemed tell tells told ask asks asked ' +
    'call calls called help helps helped show shows shown hold holds held bring brings brought carry carries ' +
    'game games guide guides story world level levels quest quests party battle fight fights ' +
    'right wrong true false real whole half full empty open close shut hard easy simple ' +
    'water fire earth wind light dark night day days year years week weeks month ' +
    'house home town city land road path door wall room ' +
    'hand hands head face eyes heart mind body life death dead alive ' +
    'cost costs price paid pays give ' +
    'enough also even just only still yet already really very quite rather ' +
    'would could should might must shall will ' +
    'which while where when what whom whose these those there their they them then than that this ' +
    'about because without within until since though although ' +
    'cannot please thanks sorry hello ' +
    'sling slings').split(/\s+/).filter(Boolean));
export const isCommonWord = word => COMMON.has(word);
// Optimal string alignment: an adjacent swap ("siobahn" for "siobhan") costs one edit.
export function distance(a, b, cap) {
    if (Math.abs(a.length - b.length) > cap) return cap + 1;
    let prev = null, row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const next = [i];
        for (let j = 1; j <= b.length; j++) {
            next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + (a[i - 1] !== b[j - 1]));
            if (prev && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) next[j] = Math.min(next[j], prev[j - 2] + 1);
        }
        prev = row; row = next;
    }
    return row[b.length];
}
// The same letters in another order ("sajud" for Saduj), with the same first letter: a scrambled name, not a different word.
export function scrambled(a, b) {
    return a.length === b.length && a.length >= 4 && a !== b && a[0] === b[0] && [...a].sort().join('') === [...b].sort().join('');
}
// A rough sound-alike key for names: "Fyrina" and "Firina", "Majic" and "Magic", "Dorbekk" and "Dorbeck", "Catrina" and
// "Katrina" share a key. It only ever compares two spellings; it never expands a word into others.
export function phoneticKey(word) {
    return word.toLowerCase().replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/sch/g, 'sk').replace(/q/g, 'k').replace(/x/g, 'ks').replace(/z/g, 's')
        .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/g(?=[eiy])/g, 'j').replace(/y/g, 'i').replace(/^kn/, 'n').replace(/^wr/, 'r')
        .replace(/ee|ea|ie/g, 'i').replace(/oo|ou/g, 'u').replace(/ai|ay/g, 'e').replace(/(.)\1+/g, '$1');
}
// Two spellings close enough to be the same name: a small edit distance, the same letters in another order, or the same
// sound. The first sound must agree; short words need a smaller difference.
export function closeSpelling(x, y) {
    if (x === y) return true;
    const cap = Math.min(x.length, y.length) <= 7 ? 1 : 2;
    const kx = phoneticKey(x), ky = phoneticKey(y);
    if (x[0] !== y[0] && kx[0] !== ky[0]) return false;
    if (distance(x, y, cap) <= cap || scrambled(x, y) || kx === ky) return true;
    return Math.min(kx.length, ky.length) >= 6 && distance(kx, ky, 1) <= 1;
}
// "Sword's" names the Sword; possessives never block a name match.
export const possessive = token => token.replace(/'s?$/, '');
function contains(query, phrase) {
    return (` ${tokens(query).map(possessive).join(' ')} `).includes(` ${tokens(phrase).map(possessive).join(' ')} `);
}
// The word right before or after a candidate typo is a word nobody uses ("Vortex" in "Vortex Cube"): the pair is a name, not a typo.
function unknownNeighbour(query, word, known) {
    const all = tokens(query).map(possessive), at = all.indexOf(word);
    return [all[at - 1], all[at + 1]].some(neighbour => neighbour && neighbour.length >= 4 && !/\d/.test(neighbour) && !isCommonWord(neighbour) && !known.has(neighbour));
}
// Spelling variants of the same word never need to be listed separately: "doesn't", "doesnt" and "does not" are one
// token when names are matched, as are "can't", "cant", "cannot" and "can not". Only entity matching folds them;
// the question's own words stay as typed, so negation and restrictions elsewhere are read exactly as written.
const FOLDED = new Map([["recognise", 'recognize'], ["cannot", 'cant']]);
for (const word of ['does', 'do', 'did', 'could', 'would', 'should', 'is', 'are', 'was', 'were', 'have', 'has', 'had'])
    for (const spelling of [`${word}n't`, `${word}nt`]) FOLDED.set(spelling, `${word}nt`);
for (const spelling of ["can't", 'cant']) FOLDED.set(spelling, 'cant');
for (const spelling of ["won't", 'wont']) FOLDED.set(spelling, 'wont');
const NOT_PAIRS = new Map([['can', 'cant'], ['will', 'wont'], ...['does', 'do', 'did', 'could', 'would', 'should', 'is', 'are', 'was', 'were', 'have', 'has', 'had'].map(w => [w, `${w}nt`])]);
// Folded tokens, each remembering the original tokens it stands for.
function foldTokens(list) {
    const out = [];
    for (let i = 0; i < list.length; i++) {
        const word = possessive(list[i]);
        if (list[i + 1] === 'not' && NOT_PAIRS.has(word)) { out.push({ f: NOT_PAIRS.get(word), from: [list[i], list[i + 1]] }); i++; continue; }
        out.push({ f: FOLDED.get(word) || word, from: [list[i]] });
    }
    return out;
}
// The entity table depends only on the records, so it is built once per record list: aliases are normalised
// and tokenised a single time instead of on every question.
const tableCache = new WeakMap();
// What sort of thing an entry is, for matching the question's expected kind ("who is …" expects a person).
const GROUPS = { person: ['companion', 'character', 'npc'], item: ['item', 'equipment', 'shop-item', 'reagent', 'treasure'], spell: ['spell', 'shard'],
    monster: ['enemy', 'bestiary', 'monster', 'creature'], place: ['place', 'location', 'city', 'site', 'region', 'dungeon', 'castle', 'shrine', 'moongate', 'town'] };
const GROUP_OF = new Map(Object.entries(GROUPS).flatMap(([group, kinds]) => kinds.map(kind => [kind, group])));
export const kindGroup = kind => GROUP_OF.get(kind) || null;
// Entries that are topics, questions or objectives, not proper names a visitor misspells.
const NOT_NAMES = new Set(['topic', 'research', 'service', 'objective', 'quest', 'chapter', 'act', 'clue', 'interest', 'qa', 'cheat', 'fact', 'access', 'route', 'virtue']);
const foldedNorm = folded => ` ${folded.map(x => x.f).join(' ')} `;
const aliasNorm = alias => ` ${tokens(alias).map(possessive).join(' ')} `;
function entityTable(records, ignore) {
    const cached = tableCache.get(records);
    if (cached && cached.ignore === ignore) return cached;
    const entities = new Map(), info = new Map();
    const note = alias => {
        if (info.has(alias)) return;
        const parts = tokens(alias), folded = foldTokens(parts);
        info.set(alias, { norm: foldedNorm(folded), tokens: parts, length: folded.length });
    };
    for (const r of records) {
        const e = entities.get(r.entityId) || { id: r.entityId, aliases: new Set(), scopes: new Set() };
        for (const alias of [r.title, ...r.aliases]) if (alias) {
            e.aliases.add(alias);
            // "Heal / Great Heal", "Cyclops & Ettin": each half names the subject too.
            if (/\s[\/&]\s|\w\/\w/.test(alias)) for (const part of alias.split(/\s*[\/&]\s*/)) if (part.length >= 4 && part !== alias && !/^(?:the|a|an|of)\s/i.test(part) && !ignore.has(part.trim().toLowerCase())) e.aliases.add(part.trim());
        }
        if (r.scope) e.scopes.add(r.scope);
        if (!NOT_NAMES.has(r.subjectKind || r.kind)) e.nameLike = true;
        const group = kindGroup(r.subjectKind || r.kind);
        if (group) (e.groups ||= new Set()).add(group);
        entities.set(e.id, e);
    }
    // Aliases that fold to the same words are one alias.
    for (const e of entities.values()) {
        const seen = new Set();
        for (const alias of [...e.aliases]) { note(alias); const n = info.get(alias).norm; if (seen.has(n)) e.aliases.delete(alias); else seen.add(n); }
    }
    // Spacing variants use identical letters, never edit-distance guesses.
    // Keep all owners so a compact spelling cannot silently choose between names.
    const spacing = new Map();
    for (const e of entities.values()) if (e.nameLike) for (const alias of e.aliases) {
        const a = info.get(alias);
        if (a.length > 4) continue;
        const compact = a.tokens.map(possessive).join('');
        if (compact.length < 4) continue;
        if (!spacing.has(compact)) spacing.set(compact, []);
        spacing.get(compact).push({ ...e, alias, length: a.length });
    }
    const table = { ignore, entities, info, spacing };
    tableCache.set(records, table);
    return table;
}
// Identity is resolved separately; scores can never establish identity by themselves.
export function resolveEntities(query, records, scope, { ignore = new Set(), vocabulary = new Set(), known = null, expect = null } = {}) {
    const { entities, info, spacing } = entityTable(records, ignore);
    const queryTokens = tokens(query), queryFolded = foldTokens(queryTokens), queryNorm = foldedNorm(queryFolded);
    let hits = [];
    for (const e of entities.values()) for (const alias of e.aliases) {
        const a = info.get(alias), at = queryNorm.indexOf(a.norm);
        if (at < 0) continue;
        // The words the visitor actually typed for this name (they differ from the alias only by a folded spelling).
        const before = queryNorm.slice(0, at).split(' ').length - 1;
        const typed = queryFolded.slice(before, before + a.length).flatMap(x => x.from);
        const same = typed.length === a.tokens.length && typed.every((t, i) => possessive(t) === possessive(a.tokens[i]));
        hits.push({ ...e, alias, queryTerms: same ? a.tokens : typed, length: a.length, match: 'exact' });
    }
    const literalHits = [...hits];
    for (let i = 0; i < queryTokens.length; i++) {
        let compact = '';
        for (let size = 1; size <= 4 && i + size <= queryTokens.length; size++) {
            compact += possessive(queryTokens[i + size - 1]);
            const typed = queryTokens.slice(i, i + size);
            // An existing literal name wins over another name with different spacing.
            if (literalHits.some(hit => hit.queryTerms.map(possessive).join(' ') === typed.map(possessive).join(' '))) continue;
            for (const candidate of spacing.get(compact) || []) {
                if (info.get(candidate.alias).tokens.map(possessive).join(' ') === typed.map(possessive).join(' ')) continue;
                hits.push({ ...candidate, queryTerms: typed, match: 'exact', spacing: true });
            }
        }
    }
    // A misspelt name of two to four words ("Vas Main" for Vas Mani): every word must match, exactly or by close
    // spelling, with exactly one word misspelt and at least one word typed correctly.
    const phraseHits = [];
    const plain = queryTokens.map(possessive);
    for (const e of entities.values()) {
        if (!e.nameLike) continue;
        for (const alias of e.aliases) {
            const a = info.get(alias), n = a.tokens.length;
            if (n < 2 || n > 4 || n > plain.length) continue;
            const want = a.tokens.map(possessive);
            for (let i = 0; i + n <= plain.length; i++) {
                let fuzzy = 0, exact = 0, solid = 0, typoWord = null, common = false;
                for (let j = 0; j < n; j++) {
                    const q = plain[i + j], t = want[j];
                    if (q === t) { if (t.length >= 2) exact++; if (t.length >= 3) solid++; continue; }
                    if (q.length >= 4 && t.length >= 4 && !/\d/.test(q + t) && closeSpelling(q, t)) { fuzzy++; typoWord = q; common = COMMON.has(q); } else { fuzzy = 9; break; }
                }
                // A common English word ("many") in the misspelt slot needs a real word of the name beside it.
                if (fuzzy === 1 && exact >= 1 && (!common || solid >= 1)) phraseHits.push({ ...e, alias, queryTerms: queryTokens.slice(i, i + n), typoWord, length: n, match: 'typo' });
            }
        }
    }
    const longestExact = hits.length ? Math.max(...hits.map(h => h.length)) : 0;
    const longestPhrase = phraseHits.length ? Math.max(...phraseHits.map(h => h.length)) : 0;
    if (longestPhrase > longestExact) hits = phraseHits.filter(h => h.length === longestPhrase);
    if (hits.length) {
        // "Kamulos" in "Kenget Kamulos" is not an additional subject.
        const longest = Math.max(...hits.map(h => h.length));
        hits = hits.filter(h => h.length === longest || !hits.some(other =>
            other.length > h.length && (contains(other.alias, h.alias)
                || (h.spacing && contains(other.queryTerms.join(' '), h.queryTerms.join(' '))))));
    } else {
        // Question vocabulary ("where", "find") is never a misspelt name.
        // A word the guide itself uses ("love", "magic") is not a misspelt name.
        const words = terms(query).filter(w => w.length >= 4 && !/\d/.test(w) && !ignore.has(w) && !vocabulary.has(w) && !COMMON.has(w));
        for (const e of entities.values()) {
            for (const alias of e.aliases) {
                const parts = info.get(alias).tokens;
                if (parts.length !== 1 || parts[0].length < 4 || /\d/.test(parts[0])) continue;
                const matchedWord = words.find(w => closeSpelling(w, parts[0]));
                // "Who is cube?" expects a person: a spell named Cure is not taken for it unless the word is long and near-exact.
                if (matchedWord && expect && e.groups && !e.groups.has(expect) && matchedWord.length < 7) continue;
                // "code" for the generic alias "codes" is the same word, not a
                // misspelt name, so it is never announced as a guess.
                const inflected = alias === alias.toLowerCase()
                    && [matchedWord + 's', matchedWord + 'es', matchedWord?.replace(/e?s$/, '')].includes(parts[0]);
                // "Vortex Cube" is not a misspelling of Cure while "Vortex" is a word the guide never uses.
                if (matchedWord && !(known && unknownNeighbour(query, matchedWord, known)))
                    hits.push({ ...e, alias, queryTerms: [matchedWord], match: inflected ? 'exact' : 'typo' });
            }
        }
    }
    // Several aliases of one subject can occur ("possessed … against the
    // party"); all of their words are the subject's name.
    const byId = new Map();
    for (const h of hits) {
        const seen = byId.get(h.id);
        if (!seen) byId.set(h.id, h);
        else if (h.match === 'exact') seen.queryTerms = [...new Set([...seen.queryTerms, ...h.queryTerms])];
    }
    const unique = [...byId.values()];
    const scoped = unique.filter(h => h.scopes.has(scope));
    return scoped.length === 1 && unique.length > 1 ? scoped : unique.slice(0, 8);
}
export class Index {
    constructor(records) {
        this.records = records;
        this.postings = new Map();
        this.lengths = [];
        records.forEach((r, i) => {
            const counts = new Map();
            for (const [text, weight] of [[r.text, 1], [r.title, 3], [r.aliases.join(' '), 4]]) {
                for (const t of tokens(text).filter(t => !STOP.has(t)))
                    counts.set(t, (counts.get(t) || 0) + weight);
            }
            this.lengths[i] = [...counts.values()].reduce((a, b) => a + b, 0);
            for (const [t, tf] of counts) {
                if (!this.postings.has(t)) this.postings.set(t, []);
                this.postings.get(t).push([i, tf]);
            }
        });
        this.avg = this.lengths.reduce((a, b) => a + b, 0) / (records.length || 1) || 1;
    }
    search(query, eligible) {
        const scores = new Map(), n = this.records.length;
        for (const t of terms(query)) {
            const posting = this.postings.get(t) || [];
            const idf = Math.log(1 + (n - posting.length + 0.5) / (posting.length + 0.5));
            for (const [i, tf] of posting) {
                const score = idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * this.lengths[i] / this.avg));
                scores.set(i, (scores.get(i) || 0) + score);
            }
        }
        return this.records.map((record, i) => ({ record, score: scores.get(i) || 0 }))
            .filter(({ record }) => eligible(record)).sort((a, b) => b.score - a.score);
    }
}
// Jaro-Winkler similarity in [0, 1]; suited to short names and misspellings.
export function similarity(a, b) {
    if (a === b) return 1;
    const window = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
    const aHit = new Array(a.length).fill(false), bHit = new Array(b.length).fill(false);
    let matches = 0;
    for (let i = 0; i < a.length; i++) {
        for (let j = Math.max(0, i - window); j < Math.min(b.length, i + window + 1); j++) {
            if (bHit[j] || a[i] !== b[j]) continue;
            aHit[i] = bHit[j] = true; matches++; break;
        }
    }
    if (!matches) return 0;
    let transpositions = 0, k = 0;
    for (let i = 0; i < a.length; i++) {
        if (!aHit[i]) continue;
        while (!bHit[k]) k++;
        if (a[i] !== b[k++]) transpositions++;
    }
    const jaro = (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;
    let prefix = 0;
    while (prefix < 4 && a[prefix] && a[prefix] === b[prefix]) prefix++;
    return jaro + prefix * 0.1 * (1 - jaro);
}
