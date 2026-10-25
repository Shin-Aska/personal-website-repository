// A final field-coverage gate for source-only static answers. It does not parse
// questions, choose a subject, change progress or certify generated prose.
import {authorize, allowed, level} from './policy.js';
import {sourceFieldCardinality,sourceFieldFieldAllows} from './source-field-router.js';
import {matchSourceFieldArguments,sourceFieldNeedsReference} from './source-field-arguments.js';

const normal = value => typeof value === 'string' ? value.normalize('NFKC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim() : '';
const label = value => normal(value).toLowerCase().replace(/^(?:the|a|an) /,'');
const list = value => Array.isArray(value) ? value : [];
const words = value => Array.isArray(value) && value.every(item=>typeof item==='string' && normal(item));
const sourceKey = source => source && ['file','locator','review'].every(key=>typeof source[key]==='string' && source[key].trim())
    ? JSON.stringify([source.file,source.locator,source.review]) : null;
const sameSource = (a,b) => Boolean(sourceKey(a) && sourceKey(a)===sourceKey(b));
const hasFull = (text,value) => Boolean(normal(value) && normal(text).includes(normal(value)));
const keys = new Set(['location','identity','stats','use','method','prerequisites','acquisition','provider','creator','teacher','recipient',
    'outcome','sequence','composition','documentation','support','version','limitations','cause','combat']);
const references = new Set(['it','its','this','that','this item','that item','this weapon','that weapon','this spell','that spell',
    'this tool','that tool','he','him','his','she','her','they','them','their','there']);
const escape=value=>Array.from(value,char=>'.*+?^${}()|[]'.includes(char) || char.charCodeAt(0)===92 ? String.fromCharCode(92)+char : char).join('');

function scopeMarkers(field){
    return list(field.presentationTexts).every(value=>label(value)==='practical')
        && list(field.metadataTexts).every(value=>/^(?:line|column|row|itself|himself|herself|themselves)$/.test(label(value)));
}
function sourceActorKind(field,record,proof,context){
    const actor=normal(field.sourceActorText);
    if(!actor)return true;
    if(/^(?:the )?guide$/i.test(actor) && proof.source.review==='external-research')return false;
    if(/\bcharacter (?:notes|profile|record|table)\b/i.test(actor)){
        const kinds=[record.kind,context.knowledge.entities.get(context.subjectEntityId)?.kind,
            context.knowledge.entities.get(proof.entityId)?.kind];
        if(!kinds.some(kind=>['person','npc','character','companion'].includes(kind)))return false;
    }
    return true;
}
function sameNamedOwner(value,record,context){
    const name=label(value),names=[record.title,...list(record.aliases),...list(context.subjectLabels)].map(label);
    if(references.has(name))return context.grounded && record.entityId===context.subjectEntityId;
    return names.includes(name) && (!context.subjectEntityId || record.entityId===context.subjectEntityId);
}
function ordinaryObjects(field,record,context){
    return !list(field.objectTexts).length || (!field.objectRole || field.objectRole==='object')
        && list(field.objectTexts).every(value=>sameNamedOwner(value,record,context));
}
function purposeScope(field,record,entry,context){
    const accepted=[];
    const source=label(entry.witness),names=list(context.subjectLabels).map(label).filter(Boolean);
    const targetMatches=value=>sameNamedOwner(value,record,context)
        || names.includes(label(value)) && list(entry.subjectEntityIds).includes(context.subjectEntityId)
        || references.has(label(value)) && context.grounded && list(entry.subjectEntityIds).includes(context.subjectEntityId);
    for(const purpose of list(field.purposeTexts)){
        if(hasFull(entry.witness,purpose)){accepted.push(purpose);continue;}
        let match=/^(?:to )?(?:pick (.+) up|(?:collect|take|retrieve|obtain|acquire|get) (.+))$/i.exec(normal(purpose));
        if(match && ['method','use','acquisition'].includes(field.key) && targetMatches(match[1] || match[2])
            && names.some(name=>new RegExp(`\\b(?:take|collect|retrieve|obtain|acquire|get|pick up) (?:the |a |an )?${escape(name)}(?=[.,; ]|$)`).test(source))){
            accepted.push(purpose);continue;
        }
        match=/^(?:finishing|completing) (.+)$/i.exec(normal(purpose));
        const kind=context.knowledge.entities.get(context.subjectEntityId)?.kind;
        if(match && field.key==='outcome' && field.selectors.includes('reward') && entry.explicit
            && (/^(?:this|that|the) (?:quest|task|errand|project)$/i.test(match[1]) && /quest|objective|project/.test(kind || '')
                || targetMatches(match[1]))){accepted.push(purpose);continue;}
        match=/^(?:reaching|entering|accessing) (.+)$/i.exec(normal(purpose));
        if(match && field.key==='sequence' && field.selectors.includes('alternatives') && entry.explicit && targetMatches(match[1])){
            accepted.push(purpose);continue;
        }
        match=/^(?:treating|using) (.+?) as (.+)$/i.exec(normal(purpose));
        if(match && field.key==='limitations' && entry.explicit && targetMatches(match[1]) && hasFull(entry.witness,label(match[2]))){
            accepted.push(purpose,`as ${match[2]}`);continue;
        }
        return {matched:false,accepted:[]};
    }
    return {matched:true,accepted};
}

function fieldProof(field,entry,record,context){
    const original=context.knowledge.facts.find(fact=>fact.id===entry.factId);
    return original || {id:entry.factId || record.id,entityId:record.entityId,subject:record.title,aliases:record.aliases || [],
        text:record.text,witness:record.text,source:entry.source || record.source,sourceRecordId:record.id,record,
        answerRelations:[field.key],conflict:record.conflict};
}
function supportingRecords(ids,context){
    const selected=[];
    for(const id of ids){
        const fact=context.knowledge.facts.find(fact=>fact.id===id);
        if(!fact || fact.conflict || fact.source?.review==='conflicting' || fact.text!==fact.witness
            || !hasFull(context.reply.text,fact.witness) || context.isEligibleFact && !context.isEligibleFact(fact))return null;
        const parent=context.pool.find(({record})=>[fact.recordId,fact.sourceRecordId].includes(record.id)
            && hasFull(record.text,fact.witness) && (sameSource(record.source,fact.source)
                || fact.sourceRecordId===record.id && [record.source.file,record.source.basedOn?.file,
                    ...list(record.source.claims).map(claim=>claim.source?.file)].includes(fact.source?.file)));
        if(!parent)return null;
        selected.push(parent.record.id);
    }
    return selected;
}
function groundedObjects(field,frame,entry,context){
    if(!list(field.objectTexts).some(sourceFieldNeedsReference))return true;
    const participants=[...list(entry.subjectEntityIds),...list(entry.arguments).flatMap(group=>list(group.bindings).map(binding=>binding.entityId).filter(Boolean))];
    if(context.grounded && participants.some(id=>id===context.subjectEntityId || context.referentIds.includes(id)))return true;
    const scopes=[field.subjectText,frame.subjectText,...list(frame.contextTexts).map(value=>normal(value).replace(/^(?:for|about|regarding|as for) /i,''))].filter(Boolean);
    return participants.some(id=>{
        const entity=context.knowledge.entities.get(id),names=entity?[entity.name,...list(entity.aliases)].map(label):[];
        return scopes.some(value=>!sourceFieldNeedsReference(value) && names.includes(label(value)));
    });
}

// Reconcile finite source-description syntax only after one actual returned
// record owns the full subject. This grants no new field: ordinary relations
// and reviewed answer declarations still have to pass the whole-record gate.
export function sourceFallbackFrame({frame,record,subjectLabels=[]}={}) {
    if(!frame || !record || frame.fields?.length!==1 || frame.staticEligible===false || frame.report || frame.playerStateQuestion)return frame;
    const field=frame.fields[0],names=[record.title,...list(record.aliases),...subjectLabels].map(label).filter(Boolean);
    const exact=value=>names.includes(label(value));
    const compound=value=>{
        const wanted=label(value),parts=names.filter(name=>wanted===name || wanted.startsWith(name+' '));
        return parts.some(first=>wanted===first || names.includes(wanted.slice(first.length+1)));
    };
    const replace=(key,selectors,subject)=>({...frame,complete:true,unresolvedTexts:[],subjectText:subject,
        fields:[{...field,key,selectors,subjectText:subject,unknownQualifierTexts:[]}]});
    // A known owner preceding a recognized property head is an owner, not an
    // unknown modifier. Keep any genuinely additional qualifier unchanged.
    if(frame.complete && field.fieldText && !field.subjectText && frame.identityCandidateText){
        const head=label(frame.identityCandidateText),suffix=' '+label(field.fieldText);
        if(head.endsWith(suffix)){
            const owner=head.slice(0,-suffix.length);
            if(exact(owner) && list(field.unknownQualifierTexts).every(value=>label(value)===owner))return replace(field.key,field.selectors,owner);
        }
    }
    if(frame.complete && ['use','acquisition','location','identity'].includes(field.key)
        && !list(field.unknownQualifierTexts).length && compound(field.subjectText || frame.subjectText))
        return replace(field.key,field.selectors,record.title);
    const question=normal(frame.originalText).replace(/\?$/,'');
    const passive=/^where (?:is|are) (.+?) downloaded$/i.exec(question);
    if(frame.complete && passive && exact(passive[1]) && record.relation==='acquisition'
        && /\bdownload\b/i.test(record.text))return replace('acquisition',[],passive[1]);
    const tactics=/^what (?:do|does) (.+?) (?:tactics|strategy) say$/i.exec(question);
    if(frame.complete && tactics && exact(tactics[1]) && record.relation==='combat')return replace('combat',[],tactics[1]);
    // A literal profile description is not an attempted exact entity name.
    // Restrict this to owned person profiles and source-present suffix words;
    // recognized properties (composition, stats, etc.) never enter this path.
    if(frame.requiresExactIdentity && field.key==='identity' && !list(field.selectors).length
        && list(frame.unresolvedTexts).every(value=>label(value)===label(frame.identityCandidateText))
        && label(question.replace(/^what (?:is|are) /i,''))===label(frame.identityCandidateText)
        && record.relation==='explanation' && ['person','npc','companion','character'].includes(record.kind)){
        const owner=label(frame.identityCandidateText),available=new Set(label(record.text).match(/[\p{L}\p{N}]+/gu) || []);
        const name=names.filter(name=>owner.startsWith(name+' ')).sort((a,b)=>b.length-a.length)[0];
        const suffix=name && owner.slice(name.length+1),terms=suffix?.match(/[\p{L}\p{N}]+/gu);
        if(terms?.length && terms.every(term=>available.has(term)))return replace('identity',[],name);
    }
    return frame;
}

function visibleRecord(record,ceiling) {
    if (record?.variants) return authorize(record,ceiling);
    // A caller may supply the normalized, already-authorized raw pool. Its
    // recorded tier still has to fit this invocation's help ceiling.
    return record?.text && record?.level && allowed(record.level,ceiling) && allowed(record.minSpoiler || record.level,ceiling)
        ? record : null;
}
function sourceEntries(value) {
    return Array.isArray(value) ? value : list(value?.entries);
}
function constrained(frame) {
    if (list(frame.constraintTexts).some(normal) || list(frame.contextTexts).some(normal)) return true;
    return frame.constraints && Object.values(frame.constraints).some(value => typeof value==='string' ? normal(value) : Array.isArray(value) && value.some(normal));
}
function ownerMatches(field,frame,record,{subjectEntityId,subjectLabels,grounded}) {
    const text=field.subjectText || frame.subjectText || '';
    const labels=[record.title,...list(record.aliases),...list(subjectLabels)].map(label).filter(Boolean);
    if (!normal(text)) return Boolean(subjectEntityId && (record.entityId===subjectEntityId || list(field.subjectEntityIds).includes(subjectEntityId)));
    if (references.has(label(text))) return Boolean(grounded && subjectEntityId && record.entityId===subjectEntityId);
    return labels.includes(label(text)) && (!subjectEntityId || record.entityId===subjectEntityId);
}
function entryOwnerMatches(field,frame,record,entry,context) {
    const ids=list(entry.subjectEntityIds);
    if (!ids.length || ids.some(id=>typeof id!=='string' || !id)) return false;
    const text=field.subjectText || frame.subjectText || '';
    if (context.subjectEntityId && !ids.includes(context.subjectEntityId)) return false;
    // Metadata can connect a source objective to its canonical item/actor, but
    // the complete requested owner must still match independently given labels.
    const names=[record.title,...list(record.aliases),...list(context.subjectLabels)].map(label).filter(Boolean);
    if (!normal(text)) return Boolean(context.subjectEntityId && ids.includes(context.subjectEntityId));
    if (references.has(label(text))) return Boolean(context.grounded && context.subjectEntityId && ids.includes(context.subjectEntityId));
    return names.includes(label(text)) && (context.subjectEntityId ? ids.includes(context.subjectEntityId) : ids.includes(record.entityId));
}
function binds(entry,record) {
    const ids=[entry.recordId,entry.sourceRecordId,entry.factId].filter(value=>typeof value==='string');
    // The exact source tuple and canonical owner can also bind an indexed child
    // fact to its containing raw record; sharing a subject alone never can.
    return ids.includes(record.id) || sameSource(entry.source,record.source);
}
function sourceOwns(entry,record) {
    if (sameSource(entry.source,record.source)) return true;
    // A compiler-validated curated child keeps its own exact locator. An
    // explicit backing sourceRecordId, file lineage and full literal membership
    // can authorize displaying its containing raw record; this is not an
    // assertion that the parent's and child's source tuples are equal.
    return typeof entry.factId==='string' && entry.factId!==record.id && entry.sourceRecordId===record.id
        && sourceKey(entry.source) && [record.source?.file,record.source?.basedOn?.file,
            ...list(record.source?.claims).map(claim=>claim.source?.file)].includes(entry.source.file);
}

function qualifierProof(field,record,entry) {
    const qualifiers=field.qualifiers || {},declared=entry.qualifiers || {};
    const structured=entry.origin==='structured-source-record';
    if (normal(qualifiers.baselineText) && !(declared.baseline===true || declared.baselineText===qualifiers.baselineText
        || structured && entry.key==='stats' && ['character','companion','npc','person'].includes(record.kind))) return false;
    if (qualifiers.exact && !(declared.exact===true || structured && (entry.key==='stats'
        || entry.key==='location' && list(entry.selectors).includes('coordinates')))) return false;
    // Total is an authored source field, never an instruction to add values.
    if (qualifiers.total && !(declared.total===true && /\btotal\b/i.test(entry.witness))) return false;
    return true;
}

function typedProof(field,frame,record,entry,context) {
    if (!entry || entry.key!==field.key || !words(entry.selectors || [])
        || !qualifierProof(field,record,entry)
        || !binds(entry,record) || !sourceOwns(entry,record)
        || !normal(entry.witness) || !hasFull(record.text,entry.witness)) return false;
    if (field.key==='composition' && entry.explicit!==true) return false;
    if (field.selectors.length && !field.selectors.some(selector=>list(entry.selectors).map(label).includes(label(selector)))) return false;
    if(!scopeMarkers(field))return false;
    const argumentsMatch=groundedObjects(field,frame,entry,context)
        ?matchSourceFieldArguments({field,entry,knowledge:context.knowledge,referentIds:context.referentIds,grounded:context.grounded})
        :{requested:true,matched:false,groups:[],entityIds:[],requiredFactIds:[]};
    const ordinary=relationProof(field,frame,record,context);
    if(argumentsMatch.requested && !argumentsMatch.matched && !(ordinary && ordinaryObjects(field,record,context)))return false;
    if(!entryOwnerMatches(field,frame,record,entry,context)){
        const subject=field.subjectText || frame.subjectText;
        const independent=argumentsMatch.matched && (!normal(subject) || list(field.objectTexts).some(value=>label(value)===label(subject))
            || label(subject)===label(field.sourceActorText))
            && (!context.subjectEntityId || list(entry.subjectEntityIds).includes(context.subjectEntityId)
                || argumentsMatch.entityIds.includes(context.subjectEntityId));
        if(!independent)return false;
    }
    const purposes=purposeScope(field,record,entry,context);
    if(!purposes.matched)return false;
    const checked={...field,unknownQualifierTexts:list(field.unknownQualifierTexts).filter(value=>!purposes.accepted.some(purpose=>label(purpose)===label(value)))};
    const qualifiers=list(checked.unknownQualifierTexts);
    // Recognized action grammar is expressed by key/selectors. Extra unknown
    // object/material/condition text still requires explicit literal scope.
    if (qualifiers.some(value=>!list(entry.qualifierTexts).map(normal).includes(normal(value)) || !hasFull(record.text,value))) return false;
    const proof=fieldProof(field,entry,record,context);
    if(!sourceFieldFieldAllows(checked,entry,proof,context.knowledge) || !sourceActorKind(field,record,proof,context))return false;
    const supporting=supportingRecords(argumentsMatch.requiredFactIds,context);
    if(!supporting)return false;
    return {entry,argumentsMatch,supporting};
}
function relationProof(field,frame,record,context) {
    if (!ownerMatches(field,frame,record,context) || list(field.unknownQualifierTexts).length
        || normal(field.qualifiers?.baselineText) || field.qualifiers?.exact || field.qualifiers?.total) return false;
    // Raw source relations can license their ordinary field, but a classifier
    // label or an available effect cannot license an unknown material/type.
    if (field.selectors.length && !(field.key==='use' && field.selectors.length===1 && ['effect','purpose'].includes(field.selectors[0]))) return false;
    const own=record.relation;
    const declared=relation=>record.source?.index?.review==='authored-index' && list(record.answers).includes(relation);
    if (field.key==='composition') return false;
    if (field.key==='identity') return !field.selectors.length && record.identity!==false
        && (own==='explanation' || declared('explanation') || declared('identity'));
    if (field.key==='use') return own==='use' || declared('use');
    if (field.key==='location') return own==='location' || declared('location');
    if (field.key==='acquisition') return own==='acquisition' || declared('acquisition');
    if (field.key==='combat') return own==='combat' || declared('combat');
    return !field.selectors.length && own===field.key;
}

/**
 * Return complete typed coverage or false. Canonical subject IDs/labels and
 * grounding must come from the caller's source resolver, not the classifier.
 * sourceFields is an array (or {entries,issues}) of compiler-validated reviewed typed literal witnesses.
 * Each entry has key/selectors/witness/source/subjectEntityIds and a recordId,
 * sourceRecordId, factId or exact matching source tuple. composition requires
 * explicit:true. The entire authorized raw record must be displayed, even when
 * the field's witness is a child value; conditions may not be clipped away.
 * The caller retains source/edition/material/numeric/condition eligibility.
 * For contextual or constrained frames it must supply that isEligible check.
 * Invoke only on static answer paths; reports, actions and current state remain
 * owned by the original engine. No reply or record is mutated.
 */
export function guardSourceFieldReply({frame,reply,records,sourceFields,knowledge,referentIds=[],isEligibleFact,
    subjectEntityId,subjectLabels,grounded=false,isEligible,spoiler='direct'}={}) {
    if (!frame || frame.complete!==true || frame.staticEligible===false || frame.playerStateQuestion || frame.report
        || list(frame.unresolvedTexts).length || !Array.isArray(frame.fields) || !frame.fields.length
        || frame.fields.some(field=>!field || typeof field!=='object')
        || reply?.decision!=='answer' || !Array.isArray(reply.recordIds) || !reply.recordIds.length || !words(reply.recordIds) || !normal(reply.text)
        || list(reply.actions).length || list(reply.stateChanges).length || list(reply.choices).length
        || list(reply.parts).some(part=>part?.decision!=='answer') || !Array.isArray(records)
        || !Array.isArray(sourceFields) && list(sourceFields?.issues).length
        || constrained(frame) && typeof isEligible!=='function') return false;
    const requested=frame.fields.map(field=>({...field,selectors:field.selectors || []}));
    const scopedArrays=['objectTexts','purposeTexts','alternativeTexts','presentationTexts','metadataTexts'];
    if (requested.some(field=>!keys.has(field.key) || !words(field.selectors) || !words(field.unknownQualifierTexts || [])
        || scopedArrays.some(key=>field[key]!==undefined && !words(field[key]))
        || field.sourceActorText!==undefined && !normal(field.sourceActorText)
        || field.contrastText!==undefined && (!normal(field.contrastText) || !list(field.alternativeTexts).length)
        || field.objectRole!==undefined && (!['object','input','output','content','instrument','destination','recipient','agent'].includes(field.objectRole)
            || !list(field.objectTexts).length)
        || field.selectors.some(selector=>!normal(selector)))) return false;
    const ids=[...new Set(reply.recordIds)],pool=[];
    for (const id of ids) {
        const candidates=records.filter(record=>record?.id===id);
        if (candidates.length!==1) return false;
        const record=visibleRecord(candidates[0],level(spoiler));
        if (!record || record.conflict || record.source?.review==='conflicting' || !sourceKey(record.source)
            || !hasFull(reply.text,record.text) || !list(reply.sources).some(source=>sameSource(source,record.source))
            || isEligible && !isEligible(record,{frame,reply})) return false;
        pool.push({raw:candidates[0],record});
    }
    const indexed=sourceEntries(sourceFields),proofs=[],cardinality=[],supportIds=new Set();
    const entities=new Map();
    for(const raw of records){
        const prior=entities.get(raw.entityId),names=[raw.title,...list(raw.aliases)].filter(value=>typeof value==='string');
        entities.set(raw.entityId,{id:raw.entityId,name:prior?.name || raw.title,kind:raw.kind,
            aliases:[...new Set([...list(prior?.aliases),...names])]});
    }
    if(subjectEntityId && !entities.has(subjectEntityId))entities.set(subjectEntityId,{id:subjectEntityId,name:list(subjectLabels)[0],aliases:list(subjectLabels)});
    const sourceKnowledge=knowledge?.entities?.get && Array.isArray(knowledge.facts)?knowledge:{entities,facts:[],sourceRecords:records};
    const context={subjectEntityId,subjectLabels,grounded,knowledge:sourceKnowledge,referentIds:[...list(referentIds)],reply,pool,isEligibleFact};
    const completeActors=[];
    for (const originalField of requested) {
        let field=originalField;
        if(/^(?:they|it)$/i.test(normal(field.sourceActorText))){
            const actors=[...new Map(completeActors.map(actor=>[label(actor),actor])).values()];if(actors.length!==1)return false;
            field={...field,sourceActorText:actors[0]};
        }
        const fieldEntries=[],newReferents=new Set();
        const matched=pool.flatMap(({raw,record})=>{
            const entries=[...indexed,...sourceEntries(raw.sourceFields),...sourceEntries(record.sourceFields)];
            const typed=entries.map(entry=>typedProof(field,frame,record,entry,context)).filter(Boolean);
            fieldEntries.push(...typed.map(value=>value.entry));
            const synthetic={key:field.key,selectors:field.selectors,witness:record.text,subjectEntityIds:[record.entityId],
                source:record.source,explicit:false,phase:null};
            const purposes=purposeScope(field,record,synthetic,context);
            const checked={...field,unknownQualifierTexts:list(field.unknownQualifierTexts).filter(value=>!purposes.accepted.some(purpose=>label(purpose)===label(value)))};
            const rich=list(field.alternativeTexts).length || normal(field.sourceActorText) || list(field.purposeTexts).length;
            const ordinary=purposes.matched && scopeMarkers(field) && ordinaryObjects(field,record,context)
                && relationProof(checked,frame,record,context)
                && (!rich || sourceFieldFieldAllows(checked,synthetic,fieldProof(field,synthetic,record,context),sourceKnowledge))
                && sourceActorKind(field,record,fieldProof(field,synthetic,record,context),context);
            for(const value of typed)for(const id of value.supporting)supportIds.add(id);
            for(const value of typed)for(const group of list(value.entry.arguments)){
                if(supportingRecords(list(group.requiredFactIds),context)===null)continue;
                for(const binding of list(group.bindings))if(binding.entityId && ['object','input','output','content'].includes(binding.role))newReferents.add(binding.entityId);
            }
            if(ordinary && context.subjectEntityId)newReferents.add(context.subjectEntityId);
            return typed.length || ordinary
                ? [{recordId:record.id,source:record.source,mode:typed.length?'typed-source-field':'raw-source-relation',witness:record.text,
                    fieldWitnesses:typed.map(value=>value.entry.witness),fieldSources:typed.map(value=>value.entry.source),
                    coveredSelectors:typed.length?[...new Set(typed.flatMap(value=>list(value.entry.selectors).map(label)))]:field.selectors.map(label)}] : [];
        });
        if (!matched.length || !field.selectors.every(selector=>matched.some(item=>item.coveredSelectors.includes(label(selector))))) return false;
        cardinality.push({field,entries:fieldEntries,proofs:pool.filter(({record})=>matched.some(item=>item.recordId===record.id)).map(({record})=>record)});
        proofs.push(Object.freeze({key:field.key,selectors:Object.freeze([...field.selectors]),records:Object.freeze(matched)}));
        if(normal(field.sourceActorText))completeActors.push(field.sourceActorText);
        context.referentIds=[...new Set([...context.referentIds,...newReferents])];context.grounded=true;
    }
    // A selected unrelated record is not justified by another record's field.
    if (pool.some(({record})=>!supportIds.has(record.id) && !proofs.some(proof=>proof.records.some(item=>item.recordId===record.id)))) return false;
    if(cardinality.some(value=>!sourceFieldCardinality({...value,frame})))return false;
    return Object.freeze({complete:true,fields:Object.freeze(proofs),recordIds:Object.freeze(ids),
        sources:Object.freeze(pool.map(({record})=>record.source))});
}
