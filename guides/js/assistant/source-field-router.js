// Resolve a source question against typed fields. No answer text is generated:
// a complete plan contains only whole, authorized original witnesses.
import {authorize} from './policy.js';
import {factSourceContexts} from './source-contexts.js';
import {kindGroup} from './retrieval.js';
import {matchSourceFieldArguments,sourceFieldReferents,sourceFieldNeedsReference,provedEntityRoleWords} from './source-field-arguments.js';
import {supportsSoftwareFieldAlternatives} from './software-capabilities.js';

const text = value => typeof value==='string'?value.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim():'';
const tokens = value => text(value).match(/[\p{L}\p{N}]+/gu) || [];
const compact = value => tokens(value).join('');
const bare = value => text(value).replace(/^(?:the|a|an) /,'').replace(/'s$/,'');
const unique = values => [...new Set(values)];
const list = value => Array.isArray(value)?value:[];
const phrase = (haystack,needle) => needle && (` ${tokens(haystack).join(' ')} `).includes(` ${tokens(needle).join(' ')} `);
const REFERENCE=/^(?:this|that|its)$|^(?:(?:this|that|the|his|her|its|their) )?(?:it|he|him|his|she|her|they|them|their|one|item|weapon|sword|hammer|spell|client|project|shrine|quest|task|errand|route|table|guide|journal|instrument|plans|tune|song|piece|shard|lens|door|wood|material|components|parts|there)$/;
const GENERIC=new Set(['rune','lens','key','shard','book','item','spell','weapon','quest','task','door','client','bot','map','wood','material','instrument','components','parts','one','guide','table']);
const CONTEXT_GLUE=new Set(('a an the i we me my our your its his her their it he him she they them this that those these of for in at on to from by with and or as across '+
    'is are was were be been have has do does can should would will must once when after before then now next '+
    'about regarding source guide page reviewed documented recorded listed stated instructions notes table '+
    'asking ask mean meant correction actually switch change move want need planned planning full').split(' '));
const verbForms={running:'run',reaching:'reach',finishing:'finish',completing:'complete',collecting:'collect',summoning:'summon',shouting:'shout',
    asking:'ask',saying:'say',mentioning:'mention',using:'use',performing:'perform',giving:'give',moving:'move',trading:'trade',completion:'complete'};
const stem=value=>verbForms[value] || value.replace(/ies$/,'y').replace(/s$/,'');
const sourceTuple = source => JSON.stringify([source?.file,source?.locator,source?.review]);
const sameNominalLabel=(value,label)=>{
    const a=tokens(bare(value)),b=tokens(bare(label));
    if(a.length<2 || a.length!==b.length || a.at(-1)!==b.at(-1)
        || /^(?:who|what|where|when|why|how|which|skip|use|get|find|give|take|buy|sell|collect|return)\b/i.test(label))return false;
    return [...a].sort().join(' ') === [...b].sort().join(' ');
};

function entityLabels(entity){
    if(!entity)return [];
    const labels=unique([entity.name,...list(entity.aliases)].filter(value=>typeof value==='string' && value.trim()
        && !/^(?:who|what|where|when|why|how|which|can|does|do|is|are)\b/i.test(value)));
    // Title grammar is still the same name, not a relationship inference.
    for(const name of [...labels]){
        const of=/^(test|shrine) of (.+)$/i.exec(name);
        if(of)labels.push(`${of[2]} ${of[1]}`);
    }
    return unique(labels);
}
function namedIn(value,entities,owners){
    const result=[];
    for(const id of owners){
        const entity=entities.get(id);if(!entity)continue;
        const matches=entityLabels(entity).filter(label=>!GENERIC.has(bare(label)) && phrase(value,label));
        if(matches.length)result.push({id,specificity:Math.max(...matches.map(label=>tokens(label).length))});
    }
    return result;
}
function exactOwners(value,entities,owners){
    const candidate=bare(value).replace(/^(?:for|with|about|regarding|as for|switch to|change to|move on to|now|i need|i want|i mean|i meant|i am asking about|if|when) /,'')
        .replace(/\b(?:is|are) (?=not\b)/,'')
        .replace(/ (?:expedition|trip|task|quest)$/,'')
        // 'I want Julia as the next replacement' names Julia; the role stays
        // a request the owner's own proof must still support.
        .replace(/ as (?:the |a |an )?(?:next |new |later )?(?:replacement|recruit|companion|member)$/,'');
    return [...owners].filter(id=>entityLabels(entities.get(id)).some(label=>compact(label)===compact(candidate)));
}
/** Resolve a copular noun against complete known names before field words. */
export function resolveSourceFrameIdentity(frame,knowledge){
    if(!frame?.identityCandidateText || !knowledge?.entities?.keys)return frame;
    const candidate=frame.identityCandidateText;
    const ids=exactOwners(candidate,knowledge.entities,new Set(knowledge.entities.keys()));
    if(!ids.length)return frame.requiresExactIdentity?{...frame,complete:false,
        unresolvedTexts:unique([...list(frame.unresolvedTexts),candidate])}:frame;
    const replaced=frame.fields.filter(field=>field.identityCandidateText===candidate);
    if(!replaced.length)return frame;
    const removed=new Set(replaced.flatMap(field=>[field.fieldText,field.requestedText]).filter(Boolean));
    const first=replaced[0];let inserted=false;
    const fields=frame.fields.flatMap(field=>{
        if(!replaced.includes(field))return [field];
        if(inserted)return [];inserted=true;
        return [{key:'identity',selectors:[],requestedText:first.requestedText,subjectText:candidate,
            qualifiers:first.qualifiers || {},unknownQualifierTexts:[]}];
    });
    const unresolvedTexts=list(frame.unresolvedTexts).filter(value=>!removed.has(value));
    return {...frame,subjectText:candidate,requiresExactIdentity:false,identityResolved:true,fields,unresolvedTexts,
        complete:!unresolvedTexts.length && fields.every(field=>field.key!=='unknown')};
}
export function sourceFieldCardinality({field,frame,entries=[],proofs=[]}={}){
    const count=field?.requestedCount;
    if(!count)return true;
    if(count.scope!=='requested-list' || !Number.isInteger(count.value) || count.value<1)return false;
    const group=list(frame?.fields).filter(other=>other.requestedText===field.requestedText
        && other.requestedCount?.text===count.text && other.requestedCount?.value===count.value);
    if(group.length===count.value && group.every(other=>list(other.selectors).length===1)
        && unique(group.map(other=>JSON.stringify([other.key,other.selectors[0]]))).length===count.value)return true;
    const members=[...entries.map(entry=>entry.members),...proofs.map(proof=>proof.listMembers)].filter(Array.isArray);
    if(members.some(values=>values.length===count.value && new Set(values.map(text)).size===values.length
        && values.every(value=>proofs.some(proof=>typeof value==='string' && proof.text.includes(value)))))return true;
    if(field.key==='stats' && !list(field.selectors).length){
        const selectors=unique(entries.filter(entry=>entry.key==='stats').flatMap(entry=>list(entry.selectors)));
        return selectors.length===count.value && selectors.length>0;
    }
    return false;
}
export function sourceFieldProof(entry,knowledge){
    if(entry?.factId)return knowledge.facts.find(fact=>fact.id===entry.factId) || null;
    const raw=entry?.record || knowledge.sourceRecords.find(record=>record.id===entry?.recordId);
    const record=raw?.variants?authorize(raw,'direct'):raw;
    if(!record?.text || !record.source)return null;
    return {id:record.id,recordId:record.id,sourceRecordId:record.id,entityId:record.entityId,
        subject:record.title,aliases:list(record.aliases),facet:entry.key,answerRelations:[entry.key],bindings:[],
        text:record.text,witness:record.text,source:record.source,resources:list(record.links),
        record:{...record,editions:list(record.editions)}};
}

function sourceAllowed(value,proof){
    const q=text(value).replace(/^(?:according to|using only|from) /,'').replace(/^(?:the|a|an) /,'');
    if(!q)return true;
    if(/^(?:existing |local |written )?guide$/.test(q))return !['external-research','conflicting'].includes(proof.source.review);
    const wanted=tokens(q).filter(word=>!['the','a','an','reviewed','documented','own','official'].includes(word));
    return list(proof.source.references).some(reference=>{
        const available=new Set(tokens(reference.label));
        return wanted.length && wanted.every(word=>available.has(word));
    });
}
function editionAllowed(value,proof){
    if(!value)return true;
    const requested=text(value).replace(/^(?:in|for|on) /,'').replace(/^(?:the|a|an) /,'').replace(/ (?:edition|version)$/,'');
    return list(proof.record?.editions).some(edition=>compact(edition)===compact(requested));
}
function availableWords(proof,entry,knowledge){
    const ownerNames=list(entry.subjectEntityIds).flatMap(id=>entityLabels(knowledge.entities.get(id)));
    const siblingSelectors=list(knowledge.sourceFields?.entries).filter(other=>other.factId && other.factId===proof.id
        && other.explicit).flatMap(other=>list(other.selectors));
    const record=knowledge.sourceRecords.find(record=>record.id===proof.sourceRecordId);
    const parent=record?.variants?authorize(record,'direct'):record;
    const contexts=factSourceContexts({fact:proof,contexts:knowledge.sourceContexts})
        .flatMap(context=>[context.label,knowledge.entities.get(context.entityId)?.name]);
    const outputRoles=list(entry.arguments).flatMap(group=>list(group.bindings)
        .filter(binding=>binding.role==='output' && binding.entityId)
        .flatMap(binding=>[...provedEntityRoleWords(binding.entityId,knowledge)]));
    return new Set(tokens([proof.text,proof.subject,...list(proof.aliases),...list(proof.topicLabels),parent?.title,
        ...ownerNames,...contexts,...outputRoles,entry.phase,...list(entry.selectors),...siblingSelectors].filter(Boolean).join(' ')).map(stem));
}
function contextWords(value,knowledge){
    // A possessive marks ownership, not an extra source word ("that shrine's").
    let context=text(value).replace(/,? instead$/,'').replace(/'s\b/g,'')
        .replace(/^(?:i am|i'm) asking about /,'');
    const wrapper=/^(?:for|about|regarding|as for|in|during) (.+?) (?:expedition|trip|task|quest)$/.exec(context);
    if(wrapper && exactOwners(wrapper[1],knowledge.entities,new Set(knowledge.entities.keys())).length)context=wrapper[1];
    // A task noun is a wrapper only after an independently named topic.
    // Keep the requested object and every other modifier in a mixed frame.
    const goal=/\bfor (.+?) (?:expedition|trip|task|quest)$/.exec(context);
    if(goal && exactOwners(goal[1],knowledge.entities,new Set(knowledge.entities.keys())).length)
        context=context.replace(/ (?:expedition|trip|task|quest)$/,'');
    return tokens(context).filter(word=>!CONTEXT_GLUE.has(word));
}
function explicitCondition(value,proof,entry,knowledge){
    if(!value)return true;
    const condition=text(value),witness=text(proof.text);
    if(/^unless\b/.test(condition) && !/\bunless\b/.test(witness))return false;
    if(/^once (?:every |all (?:the )?)(?:component|part)s? (?:is|are) in (?:my|our|the) inventory$/.test(condition))
        return /\b(?:once|when|after|if) all (?:the )?(?:parts|components) are in (?:your |the )?inventory\b/.test(witness);
    const pointer=/\bpoints?\b.*\bonward\b/.test(condition) && /\bpoints?\b/.test(witness);
    if(entry.key==='prerequisites' && entry.explicit && /^before (?:asking|speaking|talking)$/.test(condition))return true;
    const terms=tokens(condition).filter(word=>word!=='if' && !(pointer && word==='onward') && !CONTEXT_GLUE.has(word));
    const available=availableWords(proof,entry,knowledge);
    // Temporal source frames must have recorded phase evidence, not just a
    // matching place name elsewhere in the paragraph.
    const temporal=/^(after|before|once|when)\b/.exec(condition)?.[1];
    if(temporal && !entry.phase){
        const recorded={before:/\bbefore\b/,after:/\b(?:after|then|return)\b/,once:/\b(?:once|when|after|if)\b/,
            when:/\b(?:when|if|once)\b/}[temporal];
        if(!recorded.test(witness))return false;
    }
    return terms.every(word=>available.has(stem(word)));
}

// An anchor on the previous answer's step ('after shouting his name',
// 'beyond that door') is proved only by that immediately previous proof, and
// only when this proof is the next step of the same source list.
function anchoredOnPrevious(value,proof,previous){
    const anchor=/^(?:after|beyond|past|through|once past) (.+)$/.exec(text(value));
    const step=/^(.*)\[(\d+)\]$/.exec(proof.source?.locator || '');
    if(!anchor || !step)return false;
    const prior=list(previous).find(fact=>fact.source?.file===proof.source.file
        && fact.source?.locator===`${step[1]}[${Number(step[2])-1}]`);
    if(!prior)return false;
    // 'his name' refers back to the word the previous step has the player say.
    const words=tokens(anchor[1].replace(/\b(?:his|her|its|their) name\b/,'').replace(/'s\b/g,''))
        .filter(word=>!CONTEXT_GLUE.has(word));
    const priorWords=new Set(tokens(prior.text).map(stem));
    return words.length>0 && words.every(word=>priorWords.has(stem(word)));
}

/** Source/edition/context qualification is independent of field coverage. */
export function sourceFieldScopeAllows({frame,proof,entry,knowledge,inherited={},previous=[]}){
    if(!proof?.source || !entry || !knowledge?.entities || !frame)return false;
    const constraints=frame.constraints || {};
    if(constraints.comparisonText)return false;
    if(Object.entries(constraints).some(([key,value])=>!['sourceText','editionText','conditionText','comparisonText'].includes(key)
        && (typeof value==='string'?value.trim():Array.isArray(value)?value.length:value)))return false;
    if(!sourceAllowed(constraints.sourceText || inherited.sourceText,proof)
        || !editionAllowed(constraints.editionText || inherited.editionText,proof)
        || inherited.guideOnly && ['external-research','conflicting'].includes(proof.source.review))return false;
    if(list(inherited.editions).some(edition=>!editionAllowed(edition,proof)))return false;
    if(!explicitCondition(constraints.conditionText,proof,entry,knowledge)
        && !anchoredOnPrevious(constraints.conditionText,proof,previous))return false;
    const available=availableWords(proof,entry,knowledge);
    if([...list(inherited.material),...list(inherited.quantities)].some(value=>tokens(value).some(word=>!available.has(stem(word)))))return false;
    for(const context of list(frame.contextTexts)){
        if(context===constraints.sourceText || context===constraints.editionText || context===constraints.conditionText)continue;
        const remaining=contextWords(context,knowledge);
        if(remaining.some(word=>!available.has(stem(word))) && !anchoredOnPrevious(context,proof,previous))return false;
    }
    return true;
}
function subjectScopeAllows(value,owner,entry,proof,knowledge){
    if(!value || REFERENCE.test(bare(value)))return true;
    const exact=exactOwners(value,knowledge.entities,new Set(entry.subjectEntityIds));
    if(exact.includes(owner))return true;
    const available=availableWords(proof,entry,knowledge);
    const content=tokens(text(value).replace(/'s\b/g,'')).filter(word=>!CONTEXT_GLUE.has(word));
    return content.length>0 && content.every(word=>available.has(stem(word)));
}
function supportsMethodActionAlternatives(field,entry,proof,knowledge){
    if(field.key!=='method' || field.contrastText!=='or' || !entry.explicit || list(field.alternativeTexts).length!==2)return false;
    const words=availableWords(proof,entry,knowledge);
    const hasObject=list(entry.arguments).some(group=>list(group.bindings).some(binding=>binding.role==='object'));
    const matches=list(field.alternativeTexts).filter(option=>{
        const terms=tokens(option).filter(word=>!CONTEXT_GLUE.has(word));
        return terms.length>0 && words.has(stem(terms[0]))
            && terms.slice(1).every(word=>words.has(stem(word)) || hasObject && ['object','something'].includes(stem(word)));
    });
    return matches.length===1;
}
function fieldAllows(field,entry,proof,knowledge){
    if(field.key!==entry.key)return false;
    if(list(field.alternativeTexts).length && !supportsSoftwareFieldAlternatives({field,fact:proof,entry,
        subjectLabels:list(entry.subjectEntityIds).flatMap(id=>entityLabels(knowledge.entities.get(id)))})
        && !supportsMethodActionAlternatives(field,entry,proof,knowledge))return false;
    if(field.sourceActorText){
        const actorWords=tokens(field.sourceActorText.replace(/'s\b/gi,'')).filter(word=>!CONTEXT_GLUE.has(word)
            && !['readme','documentation','document','character','profile','row','field','advice','there','say','says'].includes(word));
        const sourceWords=new Set(tokens([proof.subject,...list(proof.aliases),proof.source.locator,
            ...list(proof.source.references).map(reference=>reference.label),entry.witness].join(' ')).map(stem));
        const actorStem=word=>word==='running'?'run':stem(word);
        if(actorWords.some(word=>!sourceWords.has(actorStem(word))))return false;
        if(/\breadme\b/i.test(field.sourceActorText)
            && !/\breadme\b/i.test(proof.researchWitness?.locator || '')
            && !list(proof.source.references).some(reference=>/\breadme\b/i.test(reference.label)))return false;
    }
    // A leaf property or one procedure phase is not a complete definition or
    // installation. Only an authored general slot can cover that broad ask.
    if(!list(field.selectors).length && ['identity','method'].includes(field.key)
        && (list(entry.selectors).length || entry.phase))return false;
    if(field.key==='composition' && entry.explicit!==true)return false;
    if(field.phase && entry.phase && compact(field.phase)!==compact(entry.phase))return false;
    if(field.phase && !entry.phase)return false;
    const qualifiers=field.qualifiers || {};
    if(qualifiers.total && !/\btotal\b/i.test(entry.witness))return false;
    if(qualifiers.exact && /\b(?:about|around|approximately|roughly|up to|at least|at most|might|may|unknown|unspecified)\b/i.test(entry.witness))return false;
    if(qualifiers.baselineText && field.key!=='stats' && !entry.explicit)return false;
    const fieldWords=availableWords(proof,entry,knowledge);
    const conditions=list(field.localConditionTexts);
    if(conditions.some(condition=>!explicitCondition(condition,proof,entry,knowledge)))return false;
    const unknown=list(field.unknownQualifierTexts).filter(value=>!conditions.includes(value));
    if(entry.rowScope){
        const city=text(entry.rowScope.locationText),intro=text(proof.text.split('\n')[0].split(/\.\s/)[0]);
        const locationWords=new Set(tokens(phrase(intro,city)?`${city} ${intro}`:city).map(stem));
        for(const qualifier of unknown){
            const location=/^(?:in|at|from) (.+)$/i.exec(qualifier);
            if(location && tokens(location[1]).filter(word=>!CONTEXT_GLUE.has(word)).some(word=>!locationWords.has(stem(word))))return false;
        }
    }
    if(unknown.some(value=>tokens(value).filter(word=>!CONTEXT_GLUE.has(word)).some(word=>!fieldWords.has(stem(word)))))return false;
    // Governed input/output objects remain literal arguments. They cannot be
    // licensed merely by a neighboring alias, output name or unrelated field.
    const argumentWords=new Set(tokens(entry.witness).map(stem));
    if(list(field.argumentTexts).some(value=>!REFERENCE.test(bare(value)) && tokens(value).filter(word=>!CONTEXT_GLUE.has(word))
        .some(word=>!argumentWords.has(stem(word)))))return false;
    // Generic procedures need an authored complete slot. A method-looking
    // objective or one arbitrary nearby step cannot cover the whole request.
    if(['provider','creator','teacher','recipient','method','sequence','prerequisites'].includes(field.key) && !entry.explicit)return false;
    return !proof.conflict && proof.source.review!=='conflicting';
}
export {fieldAllows as sourceFieldFieldAllows};

/**
 * A plan covers all requested fields, possibly by several complete witnesses
 * for the same canonical topic. It cannot authorize a subset, generate prose,
 * mutate conversation/game state or turn source similarity into field proof.
 */
export function planSourceFields({frame,knowledge,index,focusEntityId=null,grounded=false,contextIds=[],referents={},inherited={},isEligible=()=>true,embedding=null,previousProofIds=[]}={}){
    const unhandled={status:'unhandled'};
    if(!frame || frame.kind!=='source-fields' || frame.staticEligible===false || frame.report || frame.playerStateQuestion
        || !frame.complete || list(frame.unresolvedTexts).length || !list(frame.fields).length
        || !knowledge?.entities?.get || !Array.isArray(index?.entries) || list(index.issues).length)return unhandled;
    const entries=index.entries,owners=new Set(entries.flatMap(entry=>list(entry.subjectEntityIds)));
    const previous=list(previousProofIds).map(id=>list(knowledge.facts).find(fact=>fact.id===id)).filter(Boolean);
    if(frame.fields.some(field=>field.ordinal!==undefined)){
        const ordered=entries.filter(entry=>entry.explicit && entry.key==='sequence' && Array.isArray(entry.members)
            && entry.members.length && new Set(entry.members).size===entry.members.length
            && previous.some(proof=>proof.id===entry.factId && !proof.conflict && !proof.record?.conflict
                && isEligible(proof,{frame}) && entry.members.every(member=>proof.text.includes(member))
                && entry.members.every((member,index)=>!index || proof.text.indexOf(member)>proof.text.indexOf(entry.members[index-1]))));
        const lists=[...new Map(ordered.map(entry=>[JSON.stringify([entry.factId,entry.members,sourceTuple(entry.source)]),entry])).values()];
        if(!grounded || lists.length!==1)return {status:'unsupported',reason:'An ordinal requires one complete grounded ordered source list.'};
        const [entry]=lists;
        const fields=[];
        for(const field of frame.fields){
            if(field.ordinal===undefined){fields.push(field);continue;}
            if(!Number.isSafeInteger(field.ordinal) || field.ordinal<1 || field.ordinal>entry.members.length)
                return {status:'unsupported',reason:'The ordinal is outside the recorded ordered list.'};
            fields.push({...field,subjectMode:'topic',subjectText:null,objectTexts:[entry.members[field.ordinal-1]],
                ordinalSourceFactId:entry.factId});
        }
        frame={...frame,fields};
    }
    const referentIds=unique([...list(referents.object),...list(referents.content),...list(referents.output),
        ...list(referents.input),...(['item','spell'].includes(kindGroup(knowledge.entities.get(focusEntityId)?.kind))?[focusEntityId]:[])]);
    // A topic-mode field asks about the task itself; it never borrows the
    // subject another clause of the same question named.
    const fieldSubject=field=>field.subjectMode==='topic'?null:field.subjectText || frame.subjectText;
    const matchArguments=(field,entry,localReferents=referentIds,localGrounded=grounded)=>{
        const value=fieldSubject(field) || '';
        const effective=!list(field.objectTexts).length && value
            ?{...field,objectTexts:[value],objectRole:'object'}:field;
        if(list(effective.objectTexts).some(sourceFieldNeedsReference)){
            const proof=sourceFieldProof(entry,knowledge);
            const contextBound=proof && factSourceContexts({fact:proof,contexts:knowledge.sourceContexts})
                .some(context=>contextIds.includes(context.id) || named.includes(context.entityId)
                    || phrase(frame.originalText,context.label));
            const participantIds=unique([...entry.subjectEntityIds,...list(entry.arguments).flatMap(group=>
                list(group.bindings).map(binding=>binding.entityId).filter(Boolean))]);
            const namedBound=named.some(id=>participantIds.includes(id));
            const carriedBound=localGrounded && participantIds.some(id=>localReferents.includes(id) || id===focusEntityId);
            if(!namedBound && !carriedBound && !(localGrounded && contextBound))
                return {requested:true,matched:false,groups:[],entityIds:[],requiredFactIds:[]};
        }
        return matchSourceFieldArguments({field:effective,entry,knowledge,referentIds:localReferents,grounded:localGrounded});
    };
    // A correction 'the next trade I meant is Morchella's' names its topic
    // after 'I meant is'; the corrected noun phrase before it is not an owner.
    const topicContexts=list(frame.contextTexts).map(value=>frame.correction
        && /^(?:the|that|this) .+? i meant is (.+)$/i.exec(text(value))?.[1].replace(/^/,'i meant ') || value)
        .filter(value=>/^(?:for|with|about|regarding|as for|switch to|change to|move on to|now|i need|i want|i mean|i meant|i am asking about|if|when)\b/i.test(value));
    let exact=unique(topicContexts.flatMap(value=>exactOwners(value,knowledge.entities,owners)));
    if(!exact.length && frame.subjectText && !REFERENCE.test(bare(frame.subjectText)))exact=exactOwners(frame.subjectText,knowledge.entities,owners);
    // 'I am asking about Humility's bonus: what does that shrine add?' names
    // its owner by the topic's possessor and the reference's own kind noun.
    const kindNoun=/^(?:this|that) ([\p{L}]+)$/u.exec(text(frame.subjectText))?.[1];
    if(!exact.length && kindNoun)exact=unique(topicContexts.flatMap(value=>{
        const possessor=/^(?:for|about|regarding|as for|i am asking about|i'm asking about|i mean|i meant) (.+?)'s /.exec(text(value))?.[1];
        return possessor?exactOwners(`${possessor} ${kindNoun}`,knowledge.entities,owners):[];
    }));
    const mentions=namedIn(frame.originalText,knowledge.entities,owners);
    const named=unique(mentions.map(hit=>hit.id));
    // 'for the client alone, or for the game too' refers back through a
    // reference noun among its alternatives, like a pronoun would.
    const alternativeReference=frame.fields.some(field=>list(field.alternativeTexts).some(value=>REFERENCE.test(bare(value))));
    const reference=REFERENCE.test(bare(frame.subjectText)) || !named.length && (alternativeReference
        || /\b(?:it|its|he|him|his|she|her|they|them|their|that|this|there)\b/i.test(frame.originalText));
    let candidates=exact.length?exact:named.length?named:reference && grounded && owners.has(focusEntityId)?[focusEntityId]:[];
    if(!candidates.length && !exact.length && !named.length){
        const nominalOwners=unique(frame.fields.flatMap(field=>entries.filter(entry=>entry.explicit && entry.factId && entry.key===field.key)
            .flatMap(entry=>{
                const proof=sourceFieldProof(entry,knowledge),subject=fieldSubject(field);
                if(!proof || proof.conflict || proof.record?.conflict || !subject
                    || ![proof.subject,...list(proof.aliases),...list(proof.topicLabels)].some(label=>sameNominalLabel(subject,label)))return [];
                return entry.subjectEntityIds;
            })));
        if(nominalOwners.length===1)candidates=nominalOwners;
    }
    // A delegated source answer can own a task record while its complete,
    // reviewed proof names the item being discussed. Keep those identities
    // separate and carry only one proved owner from this same source focus.
    if(!candidates.length && !exact.length && !named.length && reference && grounded){
        const carried=unique(previous.filter(proof=>list(knowledge.sourceRecords).some(record=>record.id===proof.sourceRecordId
            && record.entityId===focusEntityId)).map(proof=>proof.entityId).filter(id=>owners.has(id)));
        if(carried.length===1)candidates=carried;
    }
    const argumentOwners=unique(frame.fields.flatMap(field=>entries.filter(entry=>entry.key===field.key && matchArguments(field,entry).matched)
        .flatMap(entry=>matchArguments(field,entry).entityIds.length?matchArguments(field,entry).entityIds:entry.subjectEntityIds)));
    candidates=unique([...candidates,...argumentOwners]);
    const contexts=list(knowledge.sourceContexts).filter(context=>{
        const namedContext=named.includes(context.entityId) || phrase(frame.originalText,context.label);
        // A location mentioned inside the task is a restriction, not a topic
        // switch. An independently resolved newly named subject replaces it.
        return namedContext || grounded && !exact.length && contextIds.includes(context.id);
    });
    if(!candidates.length && !contexts.length)return unhandled;
    // An exact newly named owner takes precedence over old conversational
    // focus. A place/person merely mentioned in its question does not replace it.
    const plans=[];
    const failed=[];
    const contextOwners=new Set(list(knowledge.sourceContexts).map(context=>context.entityId));
    const scopes=[...candidates.filter(owner=>!contextOwners.has(owner)).map(owner=>({owner,context:null})),
        ...contexts.map(context=>({owner:context.entityId,context}))];
    for(const {owner,context} of scopes){
        const entity=knowledge.entities.get(owner);if(!entity)continue;
        const ownerScope=exact.length && !exact.includes(focusEntityId)?{}:inherited;
        const fields=[];let complete=true;
        const usedProofs=new Set();
        const localReferents=new Set(referentIds);
        const introducedPerson=exact.includes(owner) && ['person','monster'].includes(kindGroup(entity.kind))
            && topicContexts.some(value=>exactOwners(value,knowledge.entities,new Set([owner])).length);
        const personalFocus=introducedPerson?owner:focusEntityId;
        for(const originalField of frame.fields){
            let field=originalField;
            if(field.requiresGroundedTopic && (!grounded || owner!==focusEntityId
                && !(context && contextIds.includes(context.id)))){
                complete=false;fields.push({field,complete:false});continue;
            }
            if(/^(?:they|it)$/i.test(field.sourceActorText || '')){
                const actors=unique(fields.filter(prior=>prior.complete && prior.field.sourceActorText
                    && !/^(?:they|it)$/i.test(prior.field.sourceActorText)).map(prior=>prior.field.sourceActorText));
                if(actors.length!==1){complete=false;fields.push({field,complete:false});continue;}
                field={...field,sourceActorText:actors[0],originalSourceActorText:field.sourceActorText};
            }
            const selectors=list(field.selectors).map(text);
            const selected=[];
            for(const entry of entries){
                if(field.ordinalSourceFactId && entry.factId!==field.ordinalSourceFactId)continue;
                if(field.requiresExplicitField && !entry.explicit)continue;
                const argumentMatch=matchArguments(field,entry,[...localReferents],grounded || fields.some(field=>field.complete));
                if(list(field.objectTexts).length && list(entry.arguments).length && !argumentMatch.matched
                    && !field.objectTexts.every(value=>REFERENCE.test(bare(value))))continue;
                const argumentOwner=argumentMatch.matched && (argumentMatch.entityIds.includes(owner)
                    || !argumentMatch.entityIds.length && entry.subjectEntityIds.includes(owner));
                if(!context && !list(entry.subjectEntityIds).includes(owner) && !argumentOwner)continue;
                if(context && !entry.explicit)continue;
                const proof=sourceFieldProof(entry,knowledge);
                if(context && (!proof || !factSourceContexts({fact:proof,contexts:[context]}).some(scope=>scope.id===context.id)))continue;
                const requestedOwner=fieldSubject(field);
                if(/^(?:he|him|his|she|her)$/i.test(requestedOwner || '')
                    && (!(grounded || introducedPerson) || !['person','monster'].includes(kindGroup(knowledge.entities.get(personalFocus)?.kind))
                        || !entry.subjectEntityIds.includes(personalFocus)))continue;
                if(context && requestedOwner){
                    const namedOwners=exactOwners(requestedOwner,knowledge.entities,new Set(knowledge.entities.keys()));
                    // A named owner literally bound in the entry's arguments
                    // (the plans as the use instruction's input) also counts.
                    if(namedOwners.length && !namedOwners.some(id=>entry.subjectEntityIds.includes(id))
                        && !(argumentMatch.matched && (namedOwners.includes(context.entityId)
                            || argumentMatch.entityIds.some(id=>namedOwners.includes(id)))))continue;
                    if(/^(?:he|him|his|she|her|they|them|their)$/i.test(requestedOwner)
                        && (!grounded || !entry.subjectEntityIds.includes(focusEntityId)))continue;
                    if(/^(?:it|its|this|that)$/i.test(requestedOwner)
                        && (!grounded || !entry.subjectEntityIds.includes(focusEntityId)) && !argumentMatch.matched)continue;
                    // Container membership is a search scope, never an object
                    // relationship. A named sub-object still needs its own
                    // literal witness/selector, outside neighboring prose.
                    // 'there' names the grounded context itself, never a sub-object.
                    if(!namedOwners.length && !/^(?:it|its|this|that|he|him|his|she|her|they|them|their|there|here)$/i.test(requestedOwner)){
                        const local=new Set(tokens([entry.witness,...list(entry.selectors),proof.subject,...list(proof.aliases)].join(' ')).map(stem));
                        if(tokens(requestedOwner).filter(word=>!CONTEXT_GLUE.has(word)).some(word=>!local.has(stem(word))) && !argumentMatch.matched)continue;
                    }
                }
                if(context && !requestedOwner && /\b(?:it|its|him|her|them)\b/i.test(field.requestedText || '')
                    && (!grounded || !entry.subjectEntityIds.includes(focusEntityId)) && !argumentMatch.matched)continue;
                // 'to pick it up' acquires the carried referent; an entry whose
                // reviewed output is that same grounded entity proves it.
                const acquiresReferent=value=>/^to (?:pick (?:it|them) up|pick up (?:it|them)|collect (?:it|them)|retrieve (?:it|them)|get (?:it|them)|take (?:it|them)|obtain (?:it|them))$/i.test(text(value));
                const checkedField=grounded && focusEntityId && list(field.purposeTexts).length && list(field.purposeTexts).every(acquiresReferent)
                    && list(entry.arguments).some(group=>list(group.bindings).some(binding=>binding.role==='output' && binding.entityId===focusEntityId))
                    ?{...field,unknownQualifierTexts:list(field.unknownQualifierTexts).filter(value=>!field.purposeTexts.includes(value))}:field;
                const subject=fieldSubject(field);
                const documentSubject=field.sourceActorText && compact(subject)===compact(field.sourceActorText);
                if(!proof || !isEligible(proof,{owner,frame}) || !fieldAllows(checkedField,entry,proof,knowledge)
                    || !documentSubject && !subjectScopeAllows(subject,owner,entry,proof,knowledge) && !argumentMatch.matched
                    || !sourceFieldScopeAllows({frame,proof,entry,knowledge,inherited:ownerScope,previous:grounded?previous:[]}))continue;
                // A composite field's capability itself can depend on another
                // whole proof, even when the question omits its object name.
                const required=unique([...argumentMatch.requiredFactIds,...list(entry.arguments)
                    .flatMap(group=>list(group.requiredFactIds))]);
                const supporting=required.map(id=>knowledge.facts.find(fact=>fact.id===id));
                if(supporting.some(fact=>!fact || fact.conflict || fact.record?.conflict || fact.source.review==='conflicting'
                    || !isEligible(fact,{owner,frame})
                    || !sourceFieldScopeAllows({frame:{...frame,contextTexts:[]},proof:fact,entry,knowledge,inherited:ownerScope})))continue;
                if(selectors.length && !selectors.some(selector=>list(entry.selectors).map(text).includes(selector)))continue;
                const similarity=Array.isArray(embedding)&&Array.isArray(proof.vector)?proof.vector.reduce((n,v,i)=>n+v*embedding[i],0):0;
                const valueWords=new Set(tokens([entry.witness,proof.subject,...list(proof.aliases)].join(' ')));
                const relevance=unique(tokens(field.requestedText).filter(word=>!CONTEXT_GLUE.has(word))).filter(word=>valueWords.has(word)).length;
                const score=(entry.explicit?20:0)+selectors.filter(selector=>entry.selectors.includes(selector)).length*5
                    + (entry.factId?3:0)
                    + relevance+(compact(entity.name)===compact(frame.subjectText)?10:0)+similarity;
                selected.push({entry,proof,score,supporting});
            }
            const available=unique(selected.flatMap(value=>list(value.entry.selectors).map(text)));
            if(!selected.length || !selectors.every(selector=>available.includes(selector))){complete=false;fields.push({field,complete:false});continue;}
            if(context && ['provider','creator','teacher','recipient'].includes(field.key)
                && unique(selected.map(value=>value.proof.text)).length>1){complete=false;fields.push({field,complete:false,ambiguous:true});continue;}
            selected.sort((a,b)=>b.score-a.score || Number(usedProofs.has(b.proof.id))-Number(usedProofs.has(a.proof.id))
                || a.proof.text.length-b.proof.text.length || a.proof.id.localeCompare(b.proof.id));
            const chosen=[];const covered=new Set();
            for(const item of selected){
                if(!chosen.length || selectors.some(selector=>!covered.has(selector) && item.entry.selectors.includes(selector))){
                    chosen.push(item);for(const selector of item.entry.selectors)covered.add(text(selector));
                }
            }
            if(!sourceFieldCardinality({field,frame,entries:chosen.map(item=>item.entry),proofs:chosen.map(item=>item.proof)})){
                complete=false;fields.push({field,complete:false});continue;
            }
            fields.push({field,complete:true,proofs:chosen});
            for(const item of chosen)usedProofs.add(item.proof.id);
            const learned=sourceFieldReferents(fields);
            for(const role of ['object','content','input','output'])for(const id of list(learned[role]))localReferents.add(id);
        }
        if(!complete){failed.push({owner,fields});continue;}
        const proofMap=new Map();for(const f of fields)for(const value of f.proofs){
            for(const proof of [value.proof,...list(value.supporting)]){
                const k=JSON.stringify([sourceTuple(proof.source),proof.text]);
                if(!proofMap.has(k))proofMap.set(k,proof);
            }
        }
        const proofs=[...proofMap.values()];
        const score=fields.reduce((n,f)=>n+f.proofs.reduce((m,p)=>m+p.score,0),0)
            + (exact.includes(owner)?100:0)+Math.max(0,...mentions.filter(hit=>hit.id===owner).map(hit=>hit.specificity))*10
            + (owner===focusEntityId && !frame.correction?5:0) - (context?1:0);
        plans.push({ownerEntityId:owner,proofs,fields,score,referents:sourceFieldReferents(fields),...(context?{topicContextId:context.id}: {})});
    }
    if(!plans.length)return {status:frame.fields.some(field=>field.key==='composition')?'unsupported':'unhandled',
        ownerEntityId:candidates.length===1?candidates[0]:null,failedFields:failed};
    plans.sort((a,b)=>b.score-a.score || a.ownerEntityId.localeCompare(b.ownerEntityId));
    if(plans.length>1 && plans[0].score===plans[1].score && plans[0].proofs.map(p=>p.id).join('|')!==plans[1].proofs.map(p=>p.id).join('|'))
        return {status:'ambiguous',ownerEntityIds:plans.filter(p=>p.score===plans[0].score).map(p=>p.ownerEntityId)};
    return {status:'answer',...plans[0],sourceOnly:true};
}
