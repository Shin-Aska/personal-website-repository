import { factSourceContexts } from './source-contexts.js';

// A finite reading of authored directed predicates. These are lookup directions,
// not generated inverse edges, and nothing here traverses a second edge.
const predicate = value => String(value || '').toLowerCase().replace(/_/g, '-');
const directions = (outgoing, incoming = []) => ({
    outgoing: new Set(outgoing), incoming: new Set(incoming)
});
const RELATIONS = {
    holder:directions(['held-by','carried-by','obtained-from','acquired-from'],
        ['holds','carries','defeat-to-obtain']),
    'binding-agent':directions(['binds-daemon','binds-agent']),
    'binding-vessel':directions(['binding-vessel','freed-into-via-mirror','freed-into','bound-into']),
    'controlled-character':directions(['recommended-controlled-character']),
    interview:directions(['interview-subject']),
    'bribe-item':directions([],['used-to-bribe']),
    'requested-item':directions(['demands-for-information','asks-for','requests']),
    'resource-source':directions([],['provides','yields']),
    converter:directions(['converted-by','transformed-by']),
    'raw-material':directions(['raw-material','cut-from']),
    'escort-subject':directions(['escort-subject'],['escorted-to']),
    'rescue-subject':directions(['rescue-subject']),
    'performance-recipient':directions(['performed-for']),
    mantra:directions(['accepts-mantra']),
    informant:directions(['ask-about']),
    'required-for':directions(['required-for','needed-for','required-to-enter','required-to-reach'],['requires','needs','requirement']),
    'permission-method':directions(['requires-permission-from']),
    'permission-authority':directions(['requires-permission-from']),
    provider: directions([
        'given-by', 'giver', 'provided-by', 'obtained-from', 'acquired-from', 'acquire-from', 'obtain-from',
        'received-from', 'reward-from', 'sold-by', 'bought-from', 'purchased-from', 'lent-by', 'borrowed-from',
        'buy-for-20-gold'
    ], ['gives', 'provide', 'provides', 'lends', 'sells', 'grants', 'defeat-to-obtain', 'grants-exit-password']),
    maker: directions(['made-by', 'maker', 'crafted-by', 'forged-by', 'woven-by', 'sewn-by', 'spun-by'],
        ['makes', 'crafts', 'forges', 'weaves', 'sews', 'spins']),
    teacher: directions(['taught-by', 'teacher', 'trained-by'], ['teaches', 'trains']),
    'training-location': directions(['taught-by', 'trained-by']),
    buyer: directions(['drops-sold-to', 'sold-to']),
    'control-method': directions(['controlled-by', 'held-by-spell']),
    'container-contents': directions(['container-contents']),
    repairer: directions(['repaired-by'], ['repairs']),
    recipient: directions(['return-to', 'deliver-to', 'given-to']),
    'next-contact':directions(['continues-at','report-to']),
    prerequisites: directions([
        'requires', 'needs', 'requirement', 'prerequisite', 'assembly-requires', 'exchange-requires',
        'charge-requires', 'recruitment-requires', 'requires-after', 'requires-permission-from',
        'requires-oath-with', 'requires-other-half', 'requires-account', 'requires-runtime',
        'requires-initial-internet-login', 'requires-separate-game', 'requires-installed-game',
        'requires-game-type', 'requires-tool-specific-runtime'
    ], ['required-for', 'needed-for', 'required-to-enter', 'required-to-reach', 'required-to-speak-with']),
    location: directions(['located-at', 'located-in', 'location', 'found-at', 'found-in', 'found-behind']),
    destination: directions(['directs-to', 'sends-to', 'quest-destination', 'continues-at', 'leads-to']),
    'riddle-answer': directions(['riddle-answer', 'has-answer', 'answered-by']),
    password: directions(['accepts-password', 'has-password', 'password', 'literal-code', 'grants-exit-password'])
};
const PEOPLE = new Set(['npc', 'person', 'character', 'companion']);
const ORGANIZATIONS = new Set(['organization', 'organisation', 'guild', 'company']);
// These kinds explicitly denote animate agents. They can supply an item, but
// defeat-to-obtain still means defeat, never a voluntary gift.
const AGENTS = new Set([...PEOPLE, ...ORGANIZATIONS, 'creature', 'monster', 'group']);
const normalized = value => String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}'\s-]/gu, ' ').replace(/\s+/g, ' ').trim();

function woodenInputProof(fact, input) {
    // Resolve this material adjective only when the same source explicitly
    // buys a tree log and immediately cuts it into the requested input. A
    // co-mentioned log, another sentence or a material alias is insufficient.
    const clauses=String(fact?.text || '').split(',').map(normalized);
    return /^(?:buy|obtain|take|find|get) (?:a |the )?(?:yew|oak|ash|pine|cedar) log(?: (?:from|at|in) (?!.*\b(?:and|or|but)\b).+)?$/.test(clauses[0] || '')
        && clauses[1]===`cut it into a ${input}`;
}

function question(text, requestedRelation) {
    const q = normalized(text).replace(/^(?:(?:then|and|also)\s+)?(?:please\s+)?(?:tell me\s+)?/, '');
    const dependency=/^do (?:i|we) (?:really )?(?:need|require) (.+?) to (?:get inside|go inside|enter) (.+)$/.exec(q);
    const resource=/^is there (?:anything|something) (?:i|we) can (break open|smash|break) (?:for|to find|to get) (.+)$/.exec(q);
    const permission=/^how (?:do|can|should|must) (?:i|we) (?:get|obtain|gain|secure) (?:permission|consent|approval) to (?:borrow|obtain|take|acquire|receive) (.+)$/.exec(q);
    const staticActor=/^who (?:am i supposed to escort to .+|are we supposed to escort to .+|am i rescuing(?: (?:on|in|at) .+)?|are we rescuing(?: (?:on|in|at) .+)?)$/.test(q);
    const stateText=staticActor?q.replace(/^who (?:am i|are we) /,'who '):q;
    // Only reference WH questions belong here. State, narrative reports and
    // counterfactual requests require the caller's separate policy/state paths.
    if (!resource && !permission && !dependency && !/^(?:who|whose|whom|from whom|which|what|what's|where|where's)\b/.test(q)
        || /\b(?:if|suppose|supposing|imagine|hypothetically|would|already|currently|now|so far|today)\b/.test(q)
        || /\b(?:have i|had i|did i|am i|my inventory|my party|my progress|i (?:said|told|reported|finished|completed|have|had|gave|got|received|recruited))\b/.test(stateText)) return null;
    if(dependency)return {relation:'prerequisites',assertion:true,
        subjectLabel:dependency[2].replace(/^(?:the|a|an) /,''),requestedDependencyLabel:dependency[1]};
    const container=/^what (?:is|are|can (?:i|we) find) in ((?:his|her|their)|.+?'s) (.+? (?:cabinet|cupboard|chest|crate|barrel))$/.exec(q)
        || /^what (?:does|do) ((?:his|her|their)|.+?'s) (.+? (?:cabinet|cupboard|chest|crate|barrel)) (?:contain|hold)$/.exec(q);
    if(container)return {relation:'container-contents',item:true,
        ownerLabel:container[1].replace(/'s$/,''),containerLabel:container[2].replace(/^(?:the|a|an) /,'')};
    const training=/^where (?:does|do) (.+?) (?:train (?:spells|magic)|learn (?:spells|magic))$/.exec(q)
        || /^where can (.+?) (?:train (?:spells|magic)|learn (?:spells|magic))$/.exec(q);
    if(training)return {relation:'training-location',person:true,subjectLabel:training[1].replace(/^(?:the|a|an) /,'')};
    const buyer=/^where (?:do|can|should|must) (?:i|we) sell (.+?) drops$/.exec(q)
        || /^who buys (.+?) drops$/.exec(q)
        || /^who (?:do|can|should|must) (?:i|we) sell (.+?) drops to$/.exec(q);
    if(buyer)return {relation:'buyer',person:true,subjectLabel:buyer[1].replace(/^(?:the|a|an) /,'')};
    const control=/^what can (?:hold|immobilize) (.+)$/.exec(q)
        || /^what can (?:i|we) use to (?:hold|immobilize) (.+)$/.exec(q);
    if(control)return {relation:'control-method',item:true,subjectLabel:control[1].replace(/^(?:the|a|an) /,'')};
    const holder=/^which (?:(?:named|specific) )?((?:[\p{L}\p{N}'-]+ )*(?:dragon|daemon|demon|creature|monster)s?) (?:has|holds|carries) (.+?)(?: (?:in|at|during) (.+))?$/u.exec(q);
    if(holder)return {relation:'holder',animate:true,itemSubject:true,requestedKind:holder[1],
        subjectLabel:holder[2].replace(/^(?:the|a|an) /,''),sceneLabel:holder[3]?.replace(/^(?:the|a|an) /,'') || null};
    const bindingAgent=/^which (?:(?:named|specific) )?((?:[\p{L}\p{N}'-]+ )*(?:daemon|demon|creature|monster)s?)$/u.exec(q);
    if(bindingAgent)return {relation:'binding-agent',animate:true,requestedKind:bindingAgent[1]};
    const vessel=/^(?:what|which) (?:(?:named|specific) )?((?:[\p{L}\p{N}'-]+ )*(?:gem|vessel|container)s?) (?:do|should|must) (?:i|we) (?:put|place|free|bind) (.+?) into$/u.exec(q);
    if(vessel)return {relation:'binding-vessel',item:true,requestedKind:vessel[1],requestedParticipantLabel:vessel[2]};
    if(resource)return {relation:'resource-source',sourceObject:true,subjectLabel:resource[2].replace(/^(?:the|a|an) /,''),action:resource[1]};
    if(permission){
        const scope=permission[1].match(/^(.+?) (?:in|at) (.+)$/);
        return {relation:'permission-method',person:true,itemSubject:true,subjectLabel:(scope?.[1] || permission[1]).replace(/^(?:the|a|an) /,''),locationLabel:scope?.[2] || null};
    }
    const authority=/^who (?:gives|grants|provides) (?:(?:me|us) )?(?:permission|consent|approval) to (?:borrow|obtain|take|acquire|receive) (.+)$/.exec(q)
        || /^who (?:do|should|can|must) (?:i|we) ask for (?:permission|consent|approval) to (?:borrow|obtain|take|acquire|receive) (.+)$/.exec(q);
    if(authority){const scope=authority[1].match(/^(.+?) (?:in|at) (.+)$/);
        return {relation:'permission-authority',person:true,subjectLabel:(scope?.[1] || authority[1]).replace(/^(?:the|a|an) /,''),locationLabel:scope?.[2] || null,itemSubject:true};}
    const permissionReturn=/^who (?:do|should|can|must) (?:i|we) (?:return|go back) to after (?:getting|obtaining|receiving) (.+?) (?:permission|consent|approval|blessing)$/.exec(q);
    if(permissionReturn)return {relation:'next-contact',person:true,subjectLabel:permissionReturn[1].replace(/'s$/,''),phase:'permission-return'};
    const conversion=/^who (?:turns?|converts?|transforms?) (.+?) into (.+)$/.exec(q);
    if(conversion)return {relation:'converter',person:true,subjectLabel:conversion[1].replace(/^(?:the|a|an) /,''),resultLabel:conversion[2].replace(/^(?:the|a|an) /,'')};
    const escort=/^who (?:am i supposed to|are we supposed to|(?:do|should|can|must) (?:i|we)) escort to (.+)$/.exec(q);
    if(escort)return {relation:'escort-subject',animate:true,contextRole:true,destinationLabel:escort[1].replace(/^(?:the|a|an) /,'')};
    const rescue=/^who (?:am i|are we) rescuing(?: (?:on|in|at) (.+))?$/.exec(q);
    if(rescue)return {relation:'rescue-subject',animate:true,contextRole:true,scopeLabel:rescue[1] || null};
    if(/^where (?:is|can (?:i|we) (?:find|get)|do (?:i|we) (?:find|get)) (?:the )?raw (?:wood|material)(?: (?:obtained|found))?$/.test(q))
        return {relation:'raw-material',item:true,contextRole:true,wood:/\bwood\b/.test(q)};
    if(/^whose (?:song|tune) (?:do|should|can|must) (?:i|we) learn$/.test(q))
        return {relation:'teacher',person:true,contextRole:true,subjectKind:'song'};
    if(/^who (?:hears|listens to) (?:the )?(?:performance|song|tune)(?: to award (?:the )?rune)?$/.test(q))
        return {relation:'performance-recipient',person:true,contextRole:true,subjectKind:'song'};
    if(/^what (?:word|mantra) (?:do|should|can|must) (?:i|we) chant(?: when cleansing (?:that|this|the) shrine)?$/.test(q))
        return {relation:'mantra',contextRole:true};
    const informant=/^who (?:do|should|can|must) (?:i|we) ask about (.+)$/.exec(q);
    if(informant)return {relation:'informant',person:true,subjectLabel:informant[1].replace(/^(?:the|a|an) /,'')};
    const requiredFor=/^what (?:is|are) (.+?) (?:required|needed) for$/.exec(q);
    if(requiredFor)return requestedRelation==='purpose'?null:{relation:'required-for',subjectLabel:requiredFor[1].replace(/^(?:the|a|an) /,'')};
    // The parent has already distinguished a directed destination question
    // from a location lookup. Do not answer it with where its sender lives.
    if (requestedRelation === 'destination' && /^(?:where|where's)\b/.test(q)) return { relation:'destination' };
    const who = /^(?:who|whose|whom|from whom)\b/.test(q)
        || /^which\s+(?:(?:named|specific)\s+)?(?:person|npc|character|companion|teacher|maker|repairer|giver|provider|guild|company|organization|organisation)\b/.test(q);
    const companion = /\bcompanion\b/.test(q);
    if(/^who (?:do|should|can) (?:i|we) (?:go back|return|report) to$/.test(q))return {relation:'next-contact',person:true};
    const receives=/^who (?:receives|gets) (.+)$/.exec(q)
        || /^who (?:do|should|can) (?:i|we) (?:give|deliver|return|bring|take) (.+?) to$/.exec(q);
    if(receives)return {relation:'recipient',person:true,subjectLabel:receives[1].replace(/^(?:the|a|an) /,'')};
    if(/^who (?:should|must|can) (?:i|we) (?:be controlling|control)(?: (?:here|for (?:this|that) (?:step|task)))?$/.test(q))
        return {relation:'controlled-character',person:true,companion:true};
    if(/^who (?:should|can|do) (?:i|we) (?:question|interview)$/.test(q))return {relation:'interview',person:true};
    const bribe=/^what (?:is|are) (.+?) expecting as (?:a )?bribe$/.exec(q);
    if(bribe)return {relation:'bribe-item',item:true,subjectLabel:bribe[1].replace(/^(?:the|a|an) /,'')};
    const request=/^what (?:does|do) (.+?) (?:ask|demand|request) for( once (?:i|we) can speak to (?:it|them))?$/.exec(q);
    if(request)return {relation:'requested-item',item:true,subjectLabel:request[1].replace(/^(?:the|a|an) /,''),phase:request[2]?'can-speak':null};
    if (/^(?:what|what's|which)\b/.test(q)) {
        if (/\b(?:riddle|puzzle)\b/.test(q) && /\b(?:answer|solution)\b/.test(q)) return { relation: 'riddle-answer' };
        if (/\b(?:password|passphrase|literal code|exact code)\b/.test(q)) return { relation: 'password' };
        if (/\b(?:need|needs|needed|require|requires|required|requirements|prerequisites)\b/.test(q))
            return { relation: 'prerequisites', person: who, companion };
    }
    if (who) {
        if (/\b(?:return to|go back to|bring .+ to|deliver .+ to)\b/.test(q)) return { relation:'recipient', person:true };
        if (/\b(?:teach|teaches|taught|teacher|train|trains|trained|learn)\b/.test(q)
            || /^who (?:offers?|provides?|gives?|can (?:offer|provide|give)) (?:(?:the|some) )?(?:free )?(?:(?:spell|magic|combat|weapon) )?training\b/.test(q))
            return { relation: 'teacher', person: true };
        if (/\b(?:make|makes|made|maker|craft|crafts|crafted|forge|forges|forged|weave|weaves|woven|sew|sews|sewn|spin|spins|spun)\b/.test(q))
            return { relation: 'maker', person: true };
        if (/\b(?:repair|repairs|repaired|repairer|fix|fixes|fixed)\b/.test(q)) return { relation: 'repairer', person: true };
        if (/\b(?:need|needs|needed|require|requires|required)\b/.test(q)
            || /^(?:who|which (?:person|character|companion)) has to (?:be|come)\b/.test(q))
            return { relation: 'prerequisites', person: true, companion };
        if (/\b(?:give|gives|gave|giver|provide|provides|provided|provider|sell|sells|sold|lend|lends|lent|grant|grants)\b/.test(q)
            || /\b(?:get|obtain|acquire|receive|buy|borrow)\b.*\bfrom\b/.test(q)
            || /^from whom\b.*\b(?:get|obtain|acquire|receive|buy|borrow)\b/.test(q)) return { relation: 'provider', person: true };
    }
    if (/^(?:where|where's)\b/.test(q) && !/\b(?:take|bring|deliver|install|extract|put|hide|keep|store|stash|download|search|inspect)\b/.test(q))
        return { relation: 'location' };
    return null;
}

export {question as readGraphQuestion};

function answerKind(entity, request) {
    if (!entity) return false;
    if(request.animate)return AGENTS.has(predicate(entity.kind));
    if(request.sourceObject)return ['item','object','container','scenery','barrel','chest','crate'].includes(predicate(entity.kind));
    if(request.item)return ['item','weapon','tool','artifact','rune','gem','key','scroll','spell'].includes(predicate(entity.kind));
    if (request.relation === 'destination') return AGENTS.has(predicate(entity.kind))
        || ['place','location','city','site','region','dungeon','castle','shrine','moongate','town','inn','tavern','building','shop'].includes(predicate(entity.kind));
    if (!request.person) return true;
    const kind = predicate(entity.kind);
    if (request.companion) return PEOPLE.has(kind);
    return request.relation === 'provider' ? AGENTS.has(kind) : PEOPLE.has(kind) || ORGANIZATIONS.has(kind);
}

const entityLabels = entity => [entity?.name, ...(entity?.aliases || [])].filter(Boolean).map(normalized);
const withoutArticle = value => normalized(value).replace(/^(?:the|a|an) /,'');
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const clauses = fact => String(fact?.text || '').split(/[.!?;]/).map(normalized).filter(Boolean);
const literalPhrase = (text, label) => (` ${text} `).includes(` ${label} `);
const references = new Set(['it','him','her','them','he','she','they']);

function requestedReference(label, entities, referenceEntityIds, anchors) {
    if(references.has(label)) {
        const supplied = [...new Set(referenceEntityIds || [])];
        if(supplied.some(id=>!entities.has(id)))return null;
        const fits=id=>!['him','her','he','she'].includes(label) || AGENTS.has(predicate(entities.get(id)?.kind));
        if(supplied.length===1)return fits(supplied[0]) ? supplied[0] : null;
        if(supplied.length)return null;
        // An animate active subject can ground its own object pronoun. An
        // artifact focus cannot silently pick a globally mentioned actor.
        const animate=[...anchors].filter(id=>AGENTS.has(predicate(entities.get(id)?.kind)));
        return animate.length===1 ? animate[0] : null;
    }
    const matches=[...entities].filter(([,entity])=>entityLabels(entity).some(value=>withoutArticle(value)===withoutArticle(label)));
    return matches.length===1 ? matches[0][0] : null;
}

function literalRequestedKind(fact, answer, requestedKind, entities) {
    // A kind in metadata alone is insufficient. Require the whole requested
    // phrase, including unknown modifiers, in the same literal sentence as the
    // named answer. Singular/plural inflection is the only normalization.
    const kind=withoutArticle(requestedKind).replace(/s$/,'');
    const names=entityLabels(entities.get(answer));
    return clauses(fact).some(clause=>!(/\b(?:not|never|no|without|cannot|can't|isn't|aren't|may|might|could|would|if|unless|unknown|unspecified)\b/.test(clause))
        && names.some(name=>literalPhrase(clause,name))
        && new RegExp(`(?:^| )${escapePattern(kind)}s?(?: |$)`).test(clause));
}

function literalBindingAgentAntecedent(fact, subject, answer, requestedKind, entities, link) {
    // Read one reviewed procedure's action slots, not an arbitrary nearby noun.
    // The direct artifact->actor edge must name the sole freed actor, followed
    // by the definite typed actor being bound to forge that same artifact.
    if(!['binds-daemon','binds-agent'].includes(predicate(link.relation)) || link.from!==subject || link.to!==answer
        || !['item','weapon','tool','artifact','equipment'].includes(predicate(entities.get(subject)?.kind))
        || fact?.entityId!==subject || fact.text!==fact.witness || !fact.answerRelations?.includes('method'))return false;
    const text=normalized(fact.text), parts=clauses(fact);
    if((text.match(/\bfree\b/g) || []).length!==1 || (text.match(/\bbind\b/g) || []).length!==1
        || /\b(?:not|never|no|without|cannot|can't|don't|doesn't|isn't|aren't|may|might|could|would|if|unless|unknown|unspecified)\b/.test(text))return false;
    const freed=parts.map((part,index)=>({match:/^free (.+?) into (?:the |a |an )?(.+?) via (?:the |a |an )?(.+)$/.exec(part),index}))
        .filter(part=>part.match);
    if(freed.length!==1)return false;
    const actor=withoutArticle(freed[0].match[1]);
    const named=[...entities].filter(([,entity])=>entityLabels(entity).some(label=>withoutArticle(label)===actor));
    if(named.length!==1 || named[0][0]!==answer)return false;
    const type=withoutArticle(requestedKind).replace(/s$/,'');
    return parts.some((part,index)=>index>freed[0].index && entityLabels(entities.get(subject)).some(artifact=>
        new RegExp(`(?:^| then )bind the ${escapePattern(type)} to forge (?:the )?${escapePattern(artifact)}$`).test(part)));
}

function literalBindingVessel(fact, actor, vessel, entities) {
    return clauses(fact).some(clause=>entityLabels(entities.get(actor)).some(agent=>
        entityLabels(entities.get(vessel)).some(container=>
            new RegExp(`^(?:free|put|place|bind) ${escapePattern(agent)} into (?:the |a |an )?${escapePattern(container)}(?: via .+)?$`).test(clause))));
}

function literalEntryGate(fact, subject, dependency, entities) {
    const destinations=entityLabels(entities.get(subject)), agents=entityLabels(entities.get(dependency));
    return clauses(fact).some(clause=>agents.some(agent=>destinations.some(destination=>{
        const target=escapePattern(destination), actor=escapePattern(agent);
        return new RegExp(`^(?:hard gate )?(?:you |we |i )?(?:cannot|can't) (?:enter|get inside) (?:the )?${target} without (?:the )?${actor}(?: in (?:the |your )?(?:active )?party)?$`).test(clause)
            || new RegExp(`^(?:the )?${target} requires (?:the )?${actor} to (?:enter|get inside)$`).test(clause)
            || fact.entityId===subject && new RegExp(`^requires (?:the )?${actor} to (?:enter|get inside)$`).test(clause)
            || new RegExp(`^(?:the )?${actor} (?:is required|is needed|must be present) to (?:enter|get inside) (?:the )?${target}$`).test(clause);
    })));
}

function sameSceneLabel(requested, label) {
    const query=withoutArticle(requested), source=withoutArticle(label);
    if(query===source)return true;
    const inverted=/^(.+?) of (.+)$/.exec(source);
    return Boolean(inverted && query===`${inverted[2]} ${inverted[1]}`);
}

const literalSource = fact => typeof fact?.text==='string' && fact.text===fact.witness
    && !fact.conflict && fact.source?.review!=='conflicting';
const uncertainRole = /\b(?:not|never|no|cannot|can't|don't|doesn't|isn't|aren't|may|might|could|would|if|unless|unknown|unspecified|perhaps|maybe)\b/;

function literalDirectedField(fact, subject, answer, request, entities, link) {
    if(!literalSource(fact))return false;
    const source=String(fact.text).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'");
    const subjects=entityLabels(entities.get(subject)), answers=entityLabels(entities.get(answer));
    if(request.relation==='container-contents'){
        if(link.containerLabel!==request.containerLabel || uncertainRole.test(source))return false;
        // This finite notation records contents under the named person's room.
        // It does not infer ownership from two nouns elsewhere in the passage.
        return subjects.some(owner=>answers.some(item=>new RegExp(`^${escapePattern(owner)}'s room: search (?:the )?${escapePattern(request.containerLabel)} \\(${escapePattern(item)}\\)(?: and .+)?\\.$`).test(source)
            || new RegExp(`^${escapePattern(owner)}'s room: search .+ and (?:the )?${escapePattern(request.containerLabel)} \\(${escapePattern(item)}\\)\\.$`).test(source)));
    }
    if(request.relation==='training-location'){
        // The practitioner and training location must be explicit in the same
        // school record. An unrelated teacher's residence supplies no route.
        const training=/; training: ([^.]+)\./.exec(source)?.[1];
        return !!training && !uncertainRole.test(training)
            && subjects.some(student=>source.includes(`: practitioner ${student};`))
            && answers.some(teacher=>new RegExp(`^${escapePattern(teacher)} in .+`).test(training));
    }
    if(request.relation==='buyer'){
        if(uncertainRole.test(source))return false;
        return subjects.some(owner=>answers.some(buyer=>new RegExp(`^${escapePattern(owner)}s? drop .+; the walkthrough lists ${escapePattern(buyer)} as the useful early buyer for those drops\\.$`).test(source)
            || new RegExp(`^sell (?:the )?${escapePattern(owner)} drops to ${escapePattern(buyer)}\\.$`).test(source)));
    }
    if(request.relation==='control-method'){
        return answers.some(method=>subjects.some(target=>clauses(fact).some(clause=>{
            if(uncertainRole.test(clause))return false;
            const named=new RegExp(`^(?:the )?${escapePattern(method)} can (?:hold|immobilize) (?:the )?${escapePattern(target)}(?: but .+)?$`).test(clause);
            const reference=fact.entityId===subject && source.startsWith(target)
                && new RegExp(`^(?:the )?${escapePattern(method)} can (?:hold|immobilize) it(?: but .+)?$`).test(clause);
            return named || reference;
        })));
    }
    return true;
}

/**
 * Resolve a WH slot from exact authored direct edges anchored by subjectIds.
 * isEligible receives each complete fact, never just its identifier. Callers
 * retain responsibility for source, edition, spoiler and conversation guards.
 * All returned evidence must be rendered intact so its conditions survive.
 * complete=false means a matching role has withheld evidence; callers must not
 * present the eligible subset as a complete answer. No fact text is invented.
 */
export function lookupGraphQuestion({ text, requestedRelation, subjectIds, entities, links, facts,
    sourceContexts = [], referenceEntityIds = [], isEligible = () => true } = {}) {
    const request = question(text, requestedRelation);
    if (!request || !entities?.get || !Array.isArray(links) || !Array.isArray(facts)) return null;
    const anchors = new Set(subjectIds || []);
    if(request.itemSubject)for(const id of anchors)if(!['item','weapon','tool','artifact','rune','gem','key','scroll','spell','equipment','reagent','treasure'].includes(predicate(entities.get(id)?.kind)))anchors.delete(id);
    if(request.subjectKind)for(const id of anchors)if(predicate(entities.get(id)?.kind)!==request.subjectKind)anchors.delete(id);
    if(request.scopeLabel)for(const id of anchors)if(![entities.get(id)?.name,...(entities.get(id)?.aliases || [])]
        .some(label=>normalized(label)===request.scopeLabel.replace(/^(?:the|a|an) /,'')))anchors.delete(id);
    if (!anchors.size) return null;
    if(request.ownerLabel){
        const owner=request.ownerLabel;
        for(const id of anchors)if(/^(?:his|her|their)$/.test(owner)
            ? !AGENTS.has(predicate(entities.get(id)?.kind))
            : !entityLabels(entities.get(id)).includes(owner))anchors.delete(id);
        if(!anchors.size)return {factIds:[],answerEntityIds:[],subjectIds:[],relation:request.relation,complete:false};
    }
    if(request.subjectLabel && !['it','they','them','he','she','him','her','his','their'].includes(request.subjectLabel)){
        const material=request.relation==='converter' && request.subjectLabel.match(/^wooden (.+)$/);
        if(material){request.inputMaterial='wood';request.inputLabel=material[1];}
        for(const id of anchors)if(![entities.get(id)?.name,...(entities.get(id)?.aliases || [])]
            .some(label=>normalized(label).replace(/[\s-]/g,'')===(request.inputLabel || request.subjectLabel).replace(/[\s-]/g,'')))anchors.delete(id);
        if(!anchors.size)return {factIds:[],answerEntityIds:[],subjectIds:[],relation:request.relation,complete:false};
    }
    const referenceLabel=request.requestedDependencyLabel || request.requestedParticipantLabel;
    const requestedEntity=referenceLabel && requestedReference(referenceLabel,entities,referenceEntityIds,anchors);
    if(referenceLabel && !requestedEntity)return {factIds:[],answerEntityIds:[],subjectIds:[],relation:request.relation,complete:false};
    const byId = new Map(facts.map(fact => [fact.id, fact]));
    const relation = RELATIONS[request.relation];
    const candidates = [];
    for (const link of links) {
        const name = predicate(link.relation);
        if(request.relation==='container-contents' && link.containerLabel!==request.containerLabel)continue;
        // The endpoint is determined by the predicate, never by whichever
        // endpoint happens to appear first in the user's subject set.
        if (anchors.has(link.from) && relation.outgoing.has(name) && answerKind(entities.get(link.to), request))
            candidates.push({ link, subject: link.from, answer: link.to });
        if (anchors.has(link.to) && relation.incoming.has(name) && answerKind(entities.get(link.from), request))
            candidates.push({ link, subject: link.to, answer: link.from });
    }
    if (!candidates.length) return request.assertion
        ? {factIds:[],answerEntityIds:[],subjectIds:[],relation:request.relation,complete:false} : null;
    const factIds = new Set(), answerEntityIds = new Set(), matchedSubjects = new Set();
    let complete = true;
    for (const { link, subject, answer } of candidates) {
        if(request.assertion && answer!==requestedEntity)continue;
        const proof = link.evidenceFactIds;
        if (!['recorded', 'conditional'].includes(link.status) || !Array.isArray(proof) || !proof.length
            || !proof.every(id => byId.has(id) && isEligible(byId.get(id)))
            || ['container-contents','training-location','buyer','control-method'].includes(request.relation)
                && !proof.some(id=>literalDirectedField(byId.get(id),subject,answer,request,entities,link))
            || request.sceneLabel && !sourceContexts.some(context=>context.id===link.sourceContextId
                && sameSceneLabel(request.sceneLabel,context.label)
                && proof.every(id=>factSourceContexts({fact:byId.get(id),contexts:[context]}).length===1))
            || request.requestedKind && !proof.some(id=>request.relation==='binding-agent'
                ? byId.get(id)?.entityId===answer && literalRequestedKind(byId.get(id),answer,request.requestedKind,entities)
                    || literalBindingAgentAntecedent(byId.get(id),subject,answer,request.requestedKind,entities,link)
                : literalRequestedKind(byId.get(id),answer,request.requestedKind,entities))
            || request.relation==='binding-vessel' && (!AGENTS.has(predicate(entities.get(requestedEntity)?.kind))
                || AGENTS.has(predicate(entities.get(subject)?.kind)) && subject!==requestedEntity
                || !proof.some(id=>literalBindingVessel(byId.get(id),requestedEntity,answer,entities)))
            || request.assertion && !proof.some(id=>literalEntryGate(byId.get(id),subject,answer,entities))
            || request.relation==='resource-source' && !proof.some(id=>{
                const fact=byId.get(id),text=fact?.text || '';
                return fact?.entityId===answer && /\b(?:smash|break|shatter|bash)\b/i.test(text)
                    && !/\b(?:not|never|no|cannot|can't|don't|without)\b/i.test(text);
            })
            || request.destinationLabel && !proof.some(id=>{
                const destination=normalized(byId.get(id)?.text).match(/\bescort .+ to (.+)$/)?.[1]?.replace(/^(?:the|a|an) /,'');
                return destination && (destination===request.destinationLabel || request.destinationLabel==='exit' && /\bexit$/.test(destination));
            })
            || request.wood && !proof.some(id=>/\b(?:wood|(?:yew|oak|ash|pine|cedar) log)\b/i.test(byId.get(id)?.text || ''))
            || request.inputMaterial==='wood' && !proof.some(id=>woodenInputProof(byId.get(id),request.inputLabel))
            || request.relation==='permission-method' && !proof.some(id=>{
                const fact=byId.get(id);
                return fact?.entityId===answer && fact.answerRelations?.includes('method') && /\b(?:ask|mention|say|answer|visit|speak|talk)\b/i.test(fact.text);
            })
            || request.phase==='permission-return' && (!link.qualifiers?.some(value=>/\b(?:permission|consent|approval)\b/i.test(value))
                || !proof.some(id=>/\breturn to\b.*\b(?:permission|consent|approval)\b/i.test(byId.get(id)?.text || '')))
            || request.resultLabel && !proof.some(id=>{
                // A co-mentioned output is insufficient: the same direct
                // converter proof must explicitly ask this actor to make it.
                const text=normalized(byId.get(id)?.text);
                return [entities.get(answer)?.name,...(entities.get(answer)?.aliases || [])].filter(Boolean).some(name=>
                    text.endsWith(`ask ${normalized(name)} to craft ${request.resultLabel}`)
                    || text.endsWith(`ask ${normalized(name)} to make ${request.resultLabel}`)
                    || text.endsWith(`ask ${normalized(name)} to forge ${request.resultLabel}`));
            })
            || request.phase==='can-speak' && !proof.some(id=>/\b(?:communicate|speak|talk)\b/i.test(byId.get(id)?.text || ''))) {
            complete = false;
            continue;
        }
        for (const id of proof) factIds.add(id);
        answerEntityIds.add(answer);
        matchedSubjects.add(subject);
    }
    // A boolean request is about the named dependency, not whether some other
    // prerequisite exists. An absent direct edge can never become a positive.
    if(request.assertion && !answerEntityIds.size)complete=false;
    return { factIds: [...factIds], answerEntityIds: [...answerEntityIds], subjectIds: [...matchedSubjects],
        relation: request.relation, complete };
}

// Keep reference roles distinct when one item passage names both a provider
// and a recipient. Only complete proofs actually returned in that reply may
// establish these slots. This does not assert possession or a completed gift.
export function graphReferenceRoles({ subjectIds, factIds, entities, links } = {}) {
    const result = {provider:[], recipient:[]};
    if (!entities?.get || !Array.isArray(links)) return result;
    const anchors = new Set(subjectIds || []), proof = new Set(factIds || []);
    for (const role of ['provider','recipient']) {
        const targets = new Set(), directions = RELATIONS[role];
        for (const link of links) {
            if (!['recorded','conditional'].includes(link.status) || !link.evidenceFactIds?.length
                || !link.evidenceFactIds.every(id => proof.has(id))) continue;
            const relation = predicate(link.relation);
            if (anchors.has(link.from) && directions.outgoing.has(relation)
                && answerKind(entities.get(link.to), {relation:role, person:true})) targets.add(link.to);
            if (anchors.has(link.to) && directions.incoming.has(relation)
                && answerKind(entities.get(link.from), {relation:role, person:true})) targets.add(link.from);
        }
        result[role] = [...targets];
    }
    return result;
}
