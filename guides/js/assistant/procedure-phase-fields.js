// Reviewed procedure phases are local to a literal witness. The caller still
// owns source/edition/material/state eligibility and complete subject resolution.
const normalize = value => typeof value === 'string' ? value.normalize('NFKC')
    .toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const bare = value => normalize(value).replace(/^(?:the|a|an) /, '');
const REFERENCE = /^(?:it|this|that|this route|that route|this quest|that quest|this trail|that trail)$/;
const ROLES = {
    approach: ['route', 'destination'], escape: ['method'], return: ['route', 'method'],
    start: ['method', 'sequence'], follow: ['route', 'sequence'],
    completion: ['method', 'outcome'], acquisition: ['acquisition', 'method'], preparation: ['method']
};

/**
 * Parse one complete finite question, preserving its entire scope and suffix.
 * `scopeText` is syntax, never an entity ID, a proved restriction or save state.
 * Null means this helper has no grammar, not that the whole router must decline.
 */
export function parseProcedurePhaseRequest(text) {
    if (typeof text !== 'string') return null;
    const q = normalize(text).replace(/\?$/, '').trim();
    let match, phase, field, scopeText;
    if ((match = /^(?:what|which) supplies does (.+?) (?:need|require)$/.exec(q))) {
        phase = 'preparation'; field = 'supplies'; scopeText = match[1];
    } else if ((match = /^what (?:do|will) (?:i|we) need (?:for|to prepare for) (.+)$/.exec(q))) {
        phase = 'preparation'; field = 'supplies'; scopeText = match[1];
    } else if ((match = /^what does (.+?) require for capture safety$/.exec(q))) {
        phase = 'preparation'; field = 'capture-safety'; scopeText = match[1];
    } else if ((match = /^(?:what|which) spell (?:do|can|should) (?:i|we) (?:use|cast) to (?:reach|get to) (.+)$/.exec(q))) {
        phase = 'approach'; field = 'spell'; scopeText = match[1];
    } else if ((match = /^how (?:do|can|should|must) (?:i|we) (.+)$/.exec(q))) {
        const actions = [
            ['approach', 'route', /^(?:reach|get to|travel to) (.+)$/],
            ['escape', 'method', /^(?:escape(?: from)?|leave|exit|get out of) (.+)$/],
            ['return', 'route', /^(?:return to|get back to) (.+)$/],
            ['start', 'method', /^(?:start|begin) (.+)$/],
            ['follow', 'route', /^follow (.+)$/],
            ['completion', 'method', /^(?:finish|complete) (.+)$/],
            ['acquisition', 'method', /^(?:get|obtain|acquire) (.+)$/],
            ['preparation', 'method', /^(?:prepare for|get ready for) (.+)$/]
        ];
        const action = actions.map(([p, f, pattern]) => [p, f, pattern.exec(match[1])]).find(([, , found]) => found);
        if (!action) return null;
        [phase, field] = action; scopeText = action[2][1];
    } else return null;
    if (!scopeText || /[!?;]/.test(scopeText)) return null;
    return { kind: 'procedure-phase', phase, field, scopeText, originalText: text };
}

function literalFieldProof(entry, fact) {
    if (!entry || !ROLES[entry.phase] || typeof entry.evidence !== 'string' || !entry.evidence.trim()
        || !fact.text.includes(entry.evidence)) return false;
    // A reviewer cannot select an affirmative substring out of a reported,
    // conditional or negative sentence to manufacture an instruction.
    const offset = fact.text.indexOf(entry.evidence);
    if (offset && !/[.!?;]\s*$/.test(fact.text.slice(0, offset))) return false;
    const evidence = normalize(entry.evidence);
    if (/^(?:if|unless|when|maybe|perhaps|do not|never|avoid|you|he|she|they|it|the guide|someone)\b/.test(evidence)) return false;
    if (!ROLES[entry.phase].every(role => fact.answerRelations.includes(role))) return false;
    if (entry.field === 'spell') return entry.phase === 'approach'
        && /^cast .+ to (?:reach|enter|travel to|get to) .+/.test(evidence)
        && fact.answerRelations.includes('use');
    if (entry.phase === 'approach') return entry.field === 'route'
        && /^(?:ride|travel|enter|wait|go|walk|reach|follow)\b/.test(evidence)
        && !/\b(?:return|again|escape)\b/.test(evidence);
    if (entry.phase === 'escape') return entry.field === 'method'
        && /^(?:escape\b|use .+ to escape\b)/.test(evidence);
    if (entry.phase === 'return') return entry.field === 'route'
        && /^(?:return to |enter .+ to return to )/.test(evidence);
    if (entry.phase === 'start') return entry.field === 'method'
        && (/^(?:start|begin)\b/.test(evidence)
            || /\.steps\[0\]$/.test(fact.source.locator) && /^(?:ask|speak|search|visit)\b/.test(evidence));
    if (entry.phase === 'follow') return entry.field === 'route'
        && /^follow .+ through .+/.test(evidence);
    if (entry.phase === 'completion') return entry.field === 'method'
        && /^(?:return|invoke|use|perform)\b.+\bto (?:finish|complete)\b/.test(evidence);
    if (entry.phase === 'acquisition') return entry.field === 'method'
        && /^(?:(?:get|obtain|acquire|take|collect|receive) .+|defeat .+ for .+)/.test(evidence);
    if (entry.phase === 'preparation') {
        if (entry.field === 'capture-safety') return /^make (?:a |an |the )?(?:permanent|fresh|backup) save[;,.]/.test(evidence)
            && /\bcapture\b/.test(evidence) && fact.answerRelations.includes('limitations');
        return ['method', 'supplies'].includes(entry.field)
            && /^(?:bring|equip|prepare|pack|stock) (?!to\b|for\b)\S/.test(evidence);
    }
    return false;
}

export function sameAuthorizedSource(fact, sourceRecord) {
    return !!fact && typeof fact.source?.file === 'string' && !!fact.source.file.trim()
        && typeof fact.source.locator === 'string' && !!fact.source.locator.trim()
        && typeof fact.text === 'string' && !!fact.text.trim() && fact.text === fact.witness
        && !fact.conflict && fact.source?.review !== 'conflicting'
        && typeof sourceRecord?.text === 'string' && sourceRecord.id === fact.sourceRecordId
        && sourceRecord.text.includes(fact.witness) && !sourceRecord.conflict && sourceRecord.source?.review !== 'conflicting'
        && (sourceRecord.source?.file === fact.source?.file
            || sourceRecord.source?.basedOn?.file === fact.source?.file
            || sourceRecord.source?.claims?.some(claim => claim.source?.file === fact.source?.file));
}

/**
 * Return only reviewed, phase-local descriptive labels with literal source
 * anchors. These are neither entity aliases nor answer text. Three bounded
 * compositions are supported: recovery of an explicitly named source-title
 * object; an escape route for that recovery; and a named trail actor's literal
 * follow-object in the same source. Full label matching never drops modifiers.
 */
export function procedurePhaseScopeLabels({ fact, sourceRecord, phase } = {}) {
    if (!sameAuthorizedSource(fact, sourceRecord) || !Array.isArray(fact.procedureFields)
        || !Array.isArray(fact.answerRelations)) return [];
    const labels = [];
    for (const entry of fact.procedureFields) {
        if (entry.phase !== phase || !literalFieldProof(entry, fact) || !Array.isArray(entry.scopeLabels)) continue;
        for (const index of entry.scopeLabels) {
            if (!index || typeof index.label !== 'string' || !index.label.trim()
                || typeof index.sourceTitle !== 'string' || sourceRecord.title !== index.sourceTitle) continue;
            const title = normalize(index.sourceTitle), label = normalize(index.label);
            if (['recovery', 'route'].includes(index.kind)) {
                const subject = bare(index.subject);
                if (!subject || subject !== bare(fact.subject) || title !== `recover the ${subject}`) continue;
                if (index.kind === 'recovery' && entry.phase === 'preparation' && entry.field === 'capture-safety'
                    && label === `${subject} retrieval`) labels.push(index.label);
                if (index.kind === 'route' && entry.phase === 'escape' && entry.field === 'method'
                    && fact.answerRelations.includes('route') && label === `${subject} route`) labels.push(index.label);
            } else if (index.kind === 'actor-object' && entry.phase === 'follow' && entry.field === 'route') {
                const actor = normalize(index.actor), object = bare(index.object);
                if (!actor || !object || /[!?;,.]|\b(?:and|or|if|without|with|after|before|according)\b/.test(`${actor} ${object}`)
                    || label !== `${actor} ${object}` || !bare(fact.subject).startsWith(`${actor} `)
                    || !(title.startsWith(`${actor}' `) || title.startsWith(`${actor}'s `) || title.startsWith(`${actor} `))
                    || typeof index.actorEvidence !== 'string' || typeof index.objectEvidence !== 'string'
                    || !sourceRecord.text.startsWith(index.actorEvidence) || !entry.evidence.startsWith(index.objectEvidence)
                    || normalize(index.objectEvidence) !== `follow the ${object}`
                    || !normalize(index.actorEvidence).startsWith(`ask ${actor} about `)) continue;
                labels.push(index.label);
            }
        }
    }
    return [...new Set(labels)];
}

/**
 * Prove the requested phase/field in one complete authorized literal fact.
 * `procedureFields` is reviewed role/phase indexing, never a new source claim.
 * Evidence must be a literal clause at a sentence boundary, and a finite
 * imperative must prove that field. Metadata, aliases and neighboring steps
 * cannot alone supply the instruction. Render the FULL fact after true.
 *
 * `scopeTexts` contains only complete names/descriptions already accepted by
 * the caller for this selected owner, including every requested qualifier.
 * Validated phase-local `procedurePhaseScopeLabels` are also accepted.
 * Never populate it from an unvalidated request. Unknown restrictions must
 * fail the caller's complete scope check, even when phase evidence exists.
 * Pronouns additionally require a source-grounded conversation frame.
 * `sourceRecord` must be an authorized original record; `isEligible` should
 * apply the caller's source/edition/material/state restrictions to this fact.
 * This does not prove completion or possession and does not observe save data.
 */
export function supportsProcedurePhaseRequest(request, {
    fact, subjectEntityId, scopeTexts = [], sourceRecord, grounded = false, isEligible
} = {}) {
    if (!request || request.kind !== 'procedure-phase' || !ROLES[request.phase]
        || !fact || !subjectEntityId || fact.entityId !== subjectEntityId
        || !sameAuthorizedSource(fact, sourceRecord)
        || !Array.isArray(fact.answerRelations) || !Array.isArray(fact.procedureFields)
        || !Array.isArray(scopeTexts)
        || typeof isEligible !== 'function' || isEligible(fact) !== true) return false;
    const current = parseProcedurePhaseRequest(request.originalText);
    if (!current || JSON.stringify(current) !== JSON.stringify(request)) return false;
    const scope = bare(request.scopeText);
    const reviewedScopes = procedurePhaseScopeLabels({ fact, sourceRecord, phase: request.phase });
    if (REFERENCE.test(scope) ? grounded !== true : ![...scopeTexts, ...reviewedScopes].map(bare).includes(scope)) return false;
    return fact.procedureFields.some(entry => entry.phase === request.phase
        && (entry.field === request.field || request.phase === 'preparation' && request.field === 'method'
            && ['supplies', 'capture-safety'].includes(entry.field)) && literalFieldProof(entry, fact));
}

/** Prove that an explicitly recorded acquisition precedes a later completion. */
export function continuationAfterAcquisition(text, { facts = [], entities, sourceRecords = [], isEligible } = {}) {
    const question = /^does obtaining (.+?) automatically (?:finish|complete) (.+)\?$/.exec(normalize(text));
    if (!question || !entities?.get || typeof isEligible !== 'function') return null;
    const item = bare(question[1]), task = bare(question[2]);
    const proofs = [];
    for (const first of facts) {
        const owner = entities.get(first.entityId);
        if (!owner || !isEligible(first) || !sameAuthorizedSource(first, sourceRecords.find(record=>record.id===first.sourceRecordId))) continue;
        const names = [owner.name, ...(owner.aliases || [])].filter(Boolean);
        const taskNames = names.flatMap(name=>{
            const title = /^(?:test|shrine) of (.+)$/i.exec(name);
            return title ? [name, title[1]] : [name];
        }).map(bare);
        if (!taskNames.includes(task)) continue;
        const matches = (first.bindings || []).filter(binding=>binding.relations?.includes('acquisition')
            && bare(binding.mention)===item && first.text.includes(binding.mention));
        if (matches.length!==1 || !entities.get(matches[0].entityId)) continue;
        const escaped = matches[0].mention.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        if (!new RegExp(`\\b(?:defeat|obtain|acquire|collect|get|take)\\b[^.!?]*\\bfor (?:the )?${escaped}\\b[^.!?]*\\b(?:this|the) test continues later\\b`,'i').test(first.text)) continue;
        for (const id of first.support?.outcome || []) {
            const later = facts.find(fact=>fact.id===id);
            if (!later || later.entityId!==first.entityId) continue;
            const request = parseProcedurePhaseRequest(`How do I finish ${owner.name}?`);
            if (supportsProcedurePhaseRequest(request, {fact:later,subjectEntityId:owner.id,scopeTexts:names,
                sourceRecord:sourceRecords.find(record=>record.id===later.sourceRecordId),isEligible})) proofs.push([first,later]);
        }
    }
    // A source may expose both a whole record and its contained indexed fact.
    // Only collapse identical source/completion pairs with nested witnesses.
    if (!proofs.length) return null;
    proofs.sort((a,b)=>a[0].text.length-b[0].text.length);
    const [first,later]=proofs[0];
    return proofs.every(([other,end])=>end.id===later.id && other.source.file===first.source.file
        && other.source.locator===first.source.locator && other.text.includes(first.text)) ? [first,later] : null;
}

/** Resolve a before-question only through an explicit reviewed after-edge. */
export function reviewedAfterDependency(text, { facts = [], entities, links = [], sourceRecords = [], isEligible } = {}) {
    const q=/^can (?:i|we) (enchant) (.+?) before (.+?) is (destroyed)\?$/.exec(normalize(text));
    if (!q || !entities?.get || typeof isEligible!=='function') return null;
    const actionNames={enchant:'enchantment',destroyed:'destruction'};
    const from=`${bare(q[2])} ${actionNames[q[1]]}`, to=`${bare(q[3])} ${actionNames[q[4]]}`;
    const matches=[];
    for(const edge of links){
        if(edge.status!=='recorded' || edge.relation!=='requires-after' || !edge.evidenceFactIds?.length)continue;
        const left=entities.get(edge.from),right=entities.get(edge.to);
        if(!left || !right || ![left.name,...(left.aliases || [])].map(bare).includes(from)
            || ![right.name,...(right.aliases || [])].map(bare).includes(to))continue;
        const evidence=edge.evidenceFactIds.map(id=>facts.find(fact=>fact.id===id));
        if(evidence.some(fact=>!fact || !isEligible(fact) || !sameAuthorizedSource(fact,sourceRecords.find(record=>record.id===fact.sourceRecordId))
            || !/\bafter\b/i.test(fact.text)))continue;
        matches.push(evidence);
    }
    return matches.length===1 ? matches[0] : null;
}

/** Return a reviewed optional activity and its linked objective passage. */
export function optionalActivitiesForObjective(text, {facts = [], sourceRecords = [], isEligible} = {}) {
    const q=/^are all optional ([\p{L}]+) required to (?:get|obtain|reach) (.+)\?$/u.exec(normalize(text));
    if(!q || typeof isEligible!=='function')return null;
    const objective=bare(q[2]), matches=[];
    for(const optional of facts){
        const source=sourceRecords.find(record=>record.id===optional.sourceRecordId);
        if(!isEligible(optional) || !sameAuthorizedSource(optional,source)
            || !normalize(optional.text).startsWith(`optional ${q[1]} `))continue;
        for(const id of optional.support?.prerequisites || []){
            const goal=facts.find(fact=>fact.id===id);
            if(!goal || goal.sourceRecordId!==optional.sourceRecordId
                || !isEligible(goal) || !sameAuthorizedSource(goal,source))continue;
            if(!(goal.bindings || []).some(binding=>bare(binding.mention)===objective && goal.text.includes(binding.mention)))continue;
            matches.push([goal,optional]);
        }
    }
    return matches.length===1?matches[0]:null;
}

/** Quote a documented alternative without asserting that fighting means killing. */
export function alternativeToProposedCombat(text, {facts = [], sourceRecords = [], isEligible} = {}) {
    const q=/^must (?:i|we) kill all (one|two|three|four|five|six) ([\p{L}]+) to (?:resolve|complete|finish) (.+)\?$/u.exec(normalize(text));
    if(!q || typeof isEligible!=='function')return null;
    const task=bare(q[3]), matches=[];
    for(const fact of facts){
        const source=sourceRecords.find(record=>record.id===fact.sourceRecordId);
        if(!isEligible(fact) || !sameAuthorizedSource(fact,source) || bare(source.title)!==task)continue;
        const witness=normalize(fact.text);
        if(!witness.startsWith(`either fight ${q[1]} `) || !/\bor\b/.test(witness) || /\bkill(?:s|ed|ing)?\b/i.test(source.text)
            || !new RegExp(`\\b${q[2]}\\b`,'u').test(witness))continue;
        matches.push(fact);
    }
    matches.sort((a,b)=>a.text.length-b.text.length);
    const first=matches[0];
    return first && matches.every(fact=>fact.source.file===first.source.file && fact.source.locator===first.source.locator
        && fact.text.includes(first.text)) ? first : null;
}

/** Preserve a previously cited, explicitly version-qualified stat reward. */
export function versionedStatClaim(text, {facts = [], priorFactIds = [], sourceRecords = [], isEligible} = {}) {
    const q=/^does every edition raise all (two|three|four|five) stats to exactly (\d+)\?$/.exec(normalize(text));
    if(!q || typeof isEligible!=='function')return null;
    const counts={two:2,three:3,four:4,five:5},matches=[];
    for(const fact of facts){
        if(!priorFactIds.includes(fact.id) || !fact.answerRelations?.includes('stats') || !fact.answerRelations?.includes('version')
            || !isEligible(fact) || !sameAuthorizedSource(fact,sourceRecords.find(record=>record.id===fact.sourceRecordId)))continue;
        const witness=normalize(fact.text);
        const pattern=/\braising (?:your|the) ([\p{L}, ]+) to (\d+) \(or even (\d+) in some versions\)/u.exec(witness);
        if(!pattern || pattern[3]!==q[2] || pattern[2]===pattern[3])continue;
        const names=pattern[1].split(/,\s*|\s+and\s+/).map(value=>value.trim()).filter(Boolean);
        if(names.length!==counts[q[1]] || new Set(names).size!==names.length)continue;
        matches.push(fact);
    }
    return matches.length===1?matches[0]:null;
}

/** Explain recorded completion steps without treating a reported event as state. */
export function completionAfterReportedRecovery(text, {facts = [], entities, sourceRecords = [], isEligible} = {}) {
    const q=/^is (.+?) defeated merely because (?:i|we) recovered (?:the )?([\p{L}]+)\?$/u.exec(normalize(text));
    if(!q || !entities?.get || typeof isEligible!=='function')return null;
    const candidates=[];
    for(const last of facts){
        const owner=entities.get(last.entityId),source=sourceRecords.find(record=>record.id===last.sourceRecordId);
        if(!owner || ![owner.name,...(owner.aliases || [])].map(bare).includes(bare(q[1]))
            || !isEligible(last) || !sameAuthorizedSource(last,source))continue;
        const object=(last.bindings || []).filter(binding=>normalize(binding.mention).split(' ')[0]===q[2]
            && last.text.includes(binding.mention));
        if(object.length!==1 || !normalize(source.text).includes(`recover the ${normalize(object[0].mention)}`))continue;
        const outcome=sourceRecords.filter(record=>record.entityId===source.entityId && record.relation==='explanation'
            && record.source?.file===source.source.file && record.source?.locator===`${source.source.locator}.outcome`
            && !record.conflict && record.source?.review!=='conflicting'
            && normalize(record.text).startsWith(`${q[1]} is permanently destroyed`));
        if(outcome.length!==1)continue;
        const step=/^(.*)\.steps\[(\d+)\]$/.exec(last.source.locator || '');
        if(!step)continue;
        for(const id of last.support?.sequence || []){
            const first=facts.find(fact=>fact.id===id);
            if(!first || first.entityId!==last.entityId || first.sourceRecordId!==last.sourceRecordId
                || first.source.locator!==`${step[1]}.steps[${Number(step[2])-1}]`
                || !isEligible(first) || !sameAuthorizedSource(first,source))continue;
            const start=source.text.indexOf(first.text), end=source.text.indexOf(last.text);
            if(start>=0 && end>start)candidates.push([first,last]);
        }
    }
    return candidates.length===1?candidates[0]:null;
}
