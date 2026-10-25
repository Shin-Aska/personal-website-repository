// Source fields describe what a complete reviewed fact can answer. They never
// generate facts, resolve a query, follow graph edges, or clip answer prose.
import {authorize} from './policy.js';
import {factSourceContexts} from './source-contexts.js';

export const SOURCE_FIELD_KEYS=Object.freeze(['location','identity','stats','use','method','prerequisites','acquisition',
    'provider','creator','teacher','recipient','outcome','sequence','composition','documentation','support','version','limitations','cause','combat']);
const keys=new Set(SOURCE_FIELD_KEYS);
const primary={location:'location',identity:'identity',definition:'identity',stats:'stats',use:'use',method:'method',
    prerequisites:'prerequisites',requirement:'prerequisites',acquisition:'acquisition',outcome:'outcome',reward:'outcome',
    sequence:'sequence',documentation:'documentation',support:'support',version:'version',limitations:'limitations',cause:'cause',combat:'combat'};
const nonempty=value=>typeof value==='string' && value.trim().length>0;
const copy=value=>JSON.parse(JSON.stringify(value));
const provenance=source=>source && ({file:source.file,locator:source.locator,review:source.review});
const sameSource=(a,b)=>['file','locator','review'].every(key=>a?.[key]===b?.[key]) && nonempty(a?.file) && nonempty(a?.locator);
const literalName=(text,label)=>{
    const words=value=>String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").match(/[\p{L}\p{N}]+/gu)?.join(' ') || '';
    return !!words(label) && (` ${words(text)} `).includes(` ${words(label)} `);
};
const selector=value=>nonempty(value) && value===value.trim() && /^[a-z0-9]+(?:[ -][a-z0-9]+)*$/.test(value)
    && !/^(?:who|what|where|when|which|why|how)\b/.test(value);
const validMembers=(members,witness)=>Array.isArray(members) && members.length>0
    && members.every(member=>nonempty(member) && member===member.trim() && witness.includes(member))
    && new Set(members.map(member=>member.normalize('NFKC').toLowerCase())).size===members.length;
export const SOURCE_FIELD_ARGUMENT_ROLES=Object.freeze(['agent','object','input','output','content','recipient','instrument','destination']);
const argumentRoles=new Set(SOURCE_FIELD_ARGUMENT_ROLES);
const normalizePredicate=value=>String(value || '').toLowerCase().replaceAll('_','-');
const argumentName=value=>String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const linkRoles=new Map();
function directions(predicates,from,to){for(const predicate of predicates)linkRoles.set(predicate,{from:new Set(from),to:new Set(to)});}
directions(['sells','gives','provides','provide','lends','grants','makes','crafts','forges','weaves','sews','spins','repairs'],['agent'],['object','output']);
directions(['sold-by','given-by','provided-by','obtained-from','acquired-from','bought-from','buy-for-20-gold','made-by','crafted-by','woven-by','spun-by','repaired-by'],['object','output'],['agent']);
directions(['teaches','trains'],['agent'],['content','object']);
directions(['taught-by','trained-by'],['content','object'],['agent']);
directions(['performed-for'],['content','object'],['recipient']);
directions(['deliver-to','return-to','given-to'],['object','input'],['recipient']);
directions(['escorted-to'],['object'],['destination']);
directions(['made-from','crafted-from','raw-material','cut-from'],['object','output'],['input','instrument']);
directions(['converted-by','transformed-by'],['input','object'],['agent']);
directions(['exchange-requires','charge-requires','assembly-requires','requires','unlocked-with'],['object','output'],['input','instrument']);
directions(['trades-for','asks-for','requests'],['agent','recipient'],['input','object']);
directions(['answered-by','riddle-answer','has-answer','accepts-mantra'],['object'],['content']);
directions(['located-at','located-in','located-west-of','found-at','found-in'],['object','agent'],['destination']);

function compileArguments(authored,{fact,entities,records,facts,links,contexts,canonicalize}){
    if(authored.arguments===undefined)return {arguments:undefined,issues:[]};
    const issues=[],groups=[],seen=new Set();
    if(!Array.isArray(authored.arguments) || !authored.arguments.length)return {issues:['field arguments must be nonempty grouped bindings.']};
    const completeLocalProof=value=>{
        const original=records.get(value?.sourceRecordId);
        return value && nonempty(value.id) && nonempty(value.witness) && value.text===value.witness && !value.conflict
            && value.source?.review!=='conflicting' && original && !original.conflict && original.source?.review!=='conflicting'
            && original.text?.includes(value.witness)
            && [original.source?.file,original.source?.basedOn?.file,...(original.source?.claims || []).map(claim=>claim.source?.file)].includes(value.source?.file);
    };
    for(const group of authored.arguments){
        if(!group || !Array.isArray(group.bindings) || !group.bindings.length
            || Object.keys(group).some(key=>!['linkId','bindings'].includes(key))){issues.push('argument group requires only a direct link and nonempty bindings.');continue;}
        const link=group.linkId===undefined?null:links.find(link=>link.id===group.linkId);
        const direction=link && linkRoles.get(normalizePredicate(link.relation));
        if(group.linkId!==undefined && (!nonempty(group.linkId) || !link || !direction || link.status==='disputed'
            || !link.evidenceFactIds?.includes(fact.id))){issues.push('argument link must be reviewed direct evidence for this fact with a known direction.');continue;}
        const bindings=[],bindingSeen=new Set();let nonliteral=false,invalid=false;
        for(const binding of group.bindings){
            if(!binding || !argumentRoles.has(binding.role) || !nonempty(binding.mention) || binding.mention!==binding.mention.trim()
                || !authored.witness.includes(binding.mention) || !fact.witness.includes(binding.mention)
                || Object.keys(binding).some(key=>!['role','entityId','mention'].includes(key))){issues.push('argument role and exact literal field-local mention are required.');invalid=true;continue;}
            const entityId=binding.entityId===undefined?undefined:canonicalize(binding.entityId);
            if(binding.entityId!==undefined && (!nonempty(binding.entityId) || !entities.has(entityId))){issues.push('argument entity must already exist.');invalid=true;continue;}
            if(link && entityId!==undefined){
                if(!(entityId===link.from && direction.from.has(binding.role) || entityId===link.to && direction.to.has(binding.role))){issues.push('argument entity and role must preserve the direct link direction.');invalid=true;continue;}
            }
            if(entityId!==undefined && !literalName(binding.mention,entities.get(entityId).name)){
                if([...entities].some(([id,entity])=>id!==entityId && argumentName(entity.name)===argumentName(binding.mention))){
                    issues.push('a literal named participant cannot be rebound to a different canonical argument.');invalid=true;continue;
                }
                nonliteral=true;
            }
            const signature=JSON.stringify([binding.role,entityId || null,binding.mention]);
            if(bindingSeen.has(signature)){issues.push('duplicate argument binding.');invalid=true;continue;}bindingSeen.add(signature);
            bindings.push({role:binding.role,...(entityId===undefined?{}:{entityId}),mention:binding.mention});
        }
        let requiredFactIds=[],sourceContextIds=[];
        if(nonliteral){
            const supports=link?.evidenceFactIds?.map(id=>facts.find(value=>value.id===id)) || [];
            const common=factSourceContexts({fact,contexts}).filter(context=>supports.every(support=>completeLocalProof(support)
                && factSourceContexts({fact:support,contexts}).some(candidate=>candidate.id===context.id)));
            if(!link || !supports.length || !common.length){issues.push('nonliteral canonical arguments require every direct-link proof in one explicit source context.');invalid=true;}
            else{requiredFactIds=[...link.evidenceFactIds];sourceContextIds=common.map(context=>context.id);}
        }
        if(invalid)continue;
        const compiled={...(link?{linkId:link.id,from:link.from,to:link.to,relation:link.relation,evidenceFactIds:[...link.evidenceFactIds]}:{}),
            bindings,requiredFactIds,sourceContextIds};
        const signature=JSON.stringify(compiled);
        if(seen.has(signature)){issues.push('duplicate argument group.');continue;}seen.add(signature);groups.push(compiled);
    }
    return {arguments:groups,issues};
}
const structuralPath=value=>typeof value==='string' && /^(?:[A-Za-z_$][\w$]*)(?: [A-Za-z_$][\w$]*=[A-Za-z_$][\w$-]*)?(?:\.[A-Za-z_$][\w$]*|\[(?:0|[1-9]\d*|[A-Za-z_$][\w$]*=(?:[A-Za-z_$][\w$-]*|"[^"\[\];\r\n]+"|'[^'\[\];\r\n]+'))\])*(?:\/[A-Za-z_$][\w$]*)*$/.test(value);
const terminal=value=>structuralPath(value)?value.split('.').at(-1).toLowerCase():'';
const typedLabels={strength:'strength',str:'strength',dexterity:'dexterity',dex:'dexterity',intelligence:'intelligence',int:'intelligence',
    combat:'combat',com:'combat',level:'level',circle:'level',damage:'damage',range:'range',duration:'duration',radius:'radius',
    health:'health',hp:'health',luck:'luck',stamina:'stamina',speed:'speed',weight:'weight',tempo:'tempo'};
const labelsIn=value=>[...new Set(Object.entries(typedLabels).filter(([label])=>new RegExp(`\\b${label}\\s*:?\\s*-?\\d+(?:\\b|\\s*[/–-])`,'i').test(value)).map(([,key])=>key))];
function sameStructuredOwner(parent,child){
    if(!structuralPath(parent) || !structuralPath(child))return false;
    const row=path=>/^(.*\[[^\]]+\])/.exec(path)?.[1];
    const parentRow=row(parent),childRow=row(child);
    if(parentRow || childRow)return parentRow===childRow;
    const property=terminal(parent);
    const container=['effect','description','use','notes','stats','role','class','focus','type','location','joinlocation','origin','coordinates',...Object.keys(typedLabels)].includes(property)
        ?parent.slice(0,parent.lastIndexOf('.')):parent;
    return child.startsWith(`${container}.`);
}

function structuredFields(record){
    const descriptors=[];
    const sources=[{text:record.text,source:record.source},...(record.source.claims || []).filter(claim=>nonempty(claim.text)
        && record.text.includes(claim.text) && claim.source?.file===record.source.file
        && sameStructuredOwner(record.source.locator,claim.source.locator)
        && !['external-research','conflicting'].includes(claim.source?.review))];
    for(const proof of sources){
        const path=String(proof.source?.locator || ''),property=terminal(path),parts=property.split('/');
        const row=structuralPath(path) && /\[[^\]]+\]$/.test(path);
        if(record.relation==='location' && ['location','joinlocation','origin','coordinates'].includes(property)){
            const selectors=property==='joinlocation'?['recruitment']:property==='origin'?['origin']:[];
            if(property==='coordinates' || /\b\d+\s*[NS]\s*[/, ]\s*\d+\s*[EW]\b|\b\d+\s*[NS]\s+\d+\s*[EW]\b/i.test(proof.text))selectors.push('coordinates');
            descriptors.push(['location',selectors,proof.source]);
        }
        // Effect/description are actual source property names. A Use/Notes
        // field, or prose merely mentioning an effect, cannot substitute.
        if(property==='effect' || property==='description' && (record.relation==='use' || proof!==sources[0]))
            descriptors.push(['use',['effect','purpose'],proof.source]);
        if(property==='use' && record.relation==='use')descriptors.push(['use',[],proof.source]);
        if(['role','class','focus','type'].includes(property))descriptors.push(['identity',[property==='class'?'role':property],proof.source]);
        if(property==='notes' && record.relation==='explanation' && ['companion','character','person','npc'].includes(record.kind))
            descriptors.push(['identity',['notes'],proof.source]);
        if(parts.every(name=>name in typedLabels) || record.relation==='stats' && (row || property==='stats')){
            const selectors=labelsIn(proof.text);
            if(!selectors.length && parts.every(name=>name in typedLabels))selectors.push(...parts.map(name=>typedLabels[name]));
            if(selectors.length)descriptors.push(['stats',[...new Set(selectors)],proof.source]);
        }
        // These are source-schema row descriptors, independent of game, name
        // or query: original spell rows carry Effect/effect plus a circle and
        // optional reagents. Multi-row topic summaries are deliberately not
        // individual spell fields, even when their text contains the words.
        const spellRow=(row && /(?:^|\.)(?:spells|spellData)\[\d+\]$/i.test(path)
            || /^(?:[A-Za-z_$][\w$]*\.)*spellData (?:name|id)=[^;\n]+$/i.test(path))
            && record.kind==='spell' && record.relation==='use';
        if(spellRow && /^(?:Circle [\d /]+ spell\.|[^.!?]+, a circle [\d /]+ spell:)/i.test(proof.text)){
            descriptors.push(['use',['effect','purpose'],proof.source]);
            if(/\b(?:Circle|circle) \d/.test(proof.text))descriptors.push(['stats',['level'],proof.source]);
        }
    }
    return descriptors;
}

function tradeRowFields(record,canonicalName){
    const tradePath=path=>structuralPath(path) && /(?:^|\.)trades?\[[^\]]+\]$/i.test(path);
    const parentPaths=record.source.locator.split(';').map(value=>value.trim());
    const normal=value=>String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
    const rate='(?:\\d+(?:\\.\\d+)?\\s*%|—|-)';
    const rowPattern=new RegExp(`^([^:\\n]+): Sell (${rate}), Buy (${rate})\\.(?: .+)?$`,'i');
    const rows=text=>String(text || '').split(/\r?\n/).flatMap(witness=>{
        const match=rowPattern.exec(witness);if(!match)return [];
        const qualified=/^(.+?) \(([^()]+)\)$/.exec(match[1]);
        return [{ownerText:qualified?.[1] || match[1],rowLabel:match[1],locationText:qualified?.[2] || null,
            sellingText:match[2],buyingText:match[3],witness}];
    });
    const owned=row=>normal(canonicalName)===normal(row.ownerText) || normal(canonicalName)===normal(row.rowLabel);
    const claims=(record.source.claims || []).flatMap(claim=>{
        if(!nonempty(claim.text) || !record.text.includes(claim.text) || claim.source?.file!==record.source.file
            || ['external-research','conflicting'].includes(claim.source?.review) || !tradePath(claim.source?.locator)
            || !parentPaths.some(path=>path===claim.source.locator || sameStructuredOwner(path,claim.source.locator)))return [];
        const values=rows(claim.text);return values.length===1 && owned(values[0])?[{row:values[0],source:claim.source}]:[];
    });
    let proof=claims.length===1?claims[0]:null;
    if(!claims.length){
        const paths=parentPaths.filter(tradePath),values=rows(record.text);
        if(paths.length===1 && values.length===1 && owned(values[0]))proof={row:values[0],source:{...record.source,locator:paths[0]}};
    }
    if(!proof)return [];
    const selectors=[];
    if(/%$/.test(proof.row.sellingText))selectors.push('selling-percentage');
    if(/%$/.test(proof.row.buyingText))selectors.push('buying-percentage');
    return selectors.length?[['stats',selectors,proof.source,{rowScope:proof.row}]]:[];
}

/**
 * Compile compact field keys and optional selectors on existing complete facts.
 * Explicit fields are reviewed metadata, not newly inferred semantic claims.
 * Basic inference grants only a primary facet with its same reviewed relation;
 * it grants no named value, composition, role, destination or procedure phase.
 * `canonicalize` may map a manifest declaration to its compiled canonical ID.
 * Callers must still apply edition/source/spoiler/query restrictions to every
 * selected full fact, and render fact.text intact rather than entry.witness.
 */
export function buildSourceFieldIndex(knowledge,{canonicalize=value=>knowledge?.entityIdMap?.get(value) || value}={}){
    const entries=[],issues=[];
    if(!knowledge?.entities?.get || !Array.isArray(knowledge.facts) || !Array.isArray(knowledge.sourceRecords)
        || typeof canonicalize!=='function')return {entries,issues:['Source field index requires canonical entities, facts and source records.']};
    const entities=knowledge.entities,records=new Map();
    for(const raw of knowledge.sourceRecords){
        const record=raw?.variants?authorize(raw,'direct')
            :raw?.text && ['gentle','balanced','direct'].includes(raw.level)?raw:null;
        if(!record)continue;
        records.set(record.id,records.has(record.id)?null:record);
    }
    const conflictedSources=new Set(knowledge.facts.filter(fact=>fact?.conflict && fact.sourceRecordId).map(fact=>fact.sourceRecordId));
    // Original structured records can supply fields without creating a new
    // curated fact or vector document. Source structure and explicit typed
    // labels establish these slots; unrelated digits/nouns never do.
    for(const record of records.values()){
        if(!record || record.conflict || conflictedSources.has(record.id) || ['external-research','conflicting'].includes(record.source?.review)
            || !nonempty(record.text) || !nonempty(record.source?.file) || !nonempty(record.source?.locator))continue;
        const owner=canonicalize(record.entityId);if(!entities.has(owner))continue;
        const label=entities.get(owner).name;
        const source=record.source.locator,descriptors=[...structuredFields(record),...tradeRowFields(record,label)];
        if(/^(?:[A-Za-z_$][\w$]*\.)*companions\[\d+\]$/i.test(source) && record.relation==='explanation'
            && record.text.startsWith(`${label}: `) && /^.+?: [^.]+\. Focus: [^.]+\./.test(record.text))descriptors.push(['identity',['role','focus'],record.source]);
        if(/^(?:[A-Za-z_$][\w$]*\.)*equipment\[\d+\]$/i.test(source) && record.relation==='use'
            && record.text.startsWith(`${label}: `) && /\. Type: [^.]+\./.test(record.text)){
            descriptors.push(['use',['effect'],record.source],['identity',['type'],record.source]);
        }
        const seen=new Set();
        for(const [key,selectors,fieldSource,scope] of descriptors){
            const signature=JSON.stringify([key,selectors]);if(seen.has(signature))continue;seen.add(signature);
            entries.push({factId:null,recordId:record.id,sourceRecordId:record.id,
            key,selectors,witness:record.text,subjectEntityIds:[owner],phase:null,source:copy(provenance(record.source)),
            fieldSource:copy(provenance(fieldSource)),...(scope || {}),explicit:false,origin:'structured-source-record',record:copy(record)});
        }
    }
    for(const fact of knowledge.facts){
        const fail=message=>issues.push(`${fact?.id || '(fact)'}: ${message}`);
        if(!fact || !nonempty(fact.id) || !nonempty(fact.text) || fact.text!==fact.witness || !entities.has(fact.entityId)){
            fail('source fields require a complete literal fact and canonical owner.');continue;
        }
        // A withheld/conflicting source cannot confer a field capability.
        if(fact.conflict || fact.source?.review==='conflicting')continue;
        const origin=records.get(fact.sourceRecordId),research=fact.source?.review==='external-research';
        if(origin?.conflict || origin?.source?.review==='conflicting')continue;
        const local=origin && !origin.conflict && origin.source?.review!=='conflicting'
            && typeof origin.text==='string' && origin.text.includes(fact.witness)
            && [origin.source?.file,origin.source?.basedOn?.file,...(origin.source?.claims || []).map(claim=>claim.source?.file)].includes(fact.source?.file);
        const external=research && nonempty(fact.researchWitness?.url) && nonempty(fact.researchWitness?.checkedAt)
            && fact.source?.references?.some(reference=>reference.url===fact.researchWitness.url && reference.checkedAt===fact.researchWitness.checkedAt);
        if(!local && !external){fail('field witness is absent from its authorized original source.');continue;}
        const contexts=factSourceContexts({fact,contexts:knowledge.sourceContexts || []});
        const contextOwner=id=>contexts.some(context=>context.entityId===id && context.sourceRecordId===origin?.id
            && entities.has(id) && literalName([origin.title,origin.text].join(' '),context.label));
        const literalBindings=(fact.bindings || []).filter(binding=>entities.has(binding.entityId)
            && nonempty(binding.mention) && fact.witness.includes(binding.mention)
            && [entities.get(binding.entityId).name,...(entities.get(binding.entityId).aliases || [])]
                .some(name=>literalName(name,binding.mention) || literalName(binding.mention,name)));
        const bound=new Set([fact.entityId,...literalBindings.map(binding=>binding.entityId)]);
        const knownSources=[fact.source,origin?.source,...(origin?.source?.claims || []).map(claim=>claim.source),...contexts.map(context=>context.source)].filter(Boolean);
        const staged=[];
        const field=fact.facet==='effect'?'use':primary[fact.facet];
        if(field && fact.answerRelations?.includes(field)){
            const bindingOwners=literalBindings.filter(binding=>binding.relations?.includes(field)).map(binding=>binding.entityId);
            staged.push({factId:fact.id,recordId:fact.recordId || fact.record?.id || null,
                sourceRecordId:fact.sourceRecordId || null,key:field,selectors:[],witness:fact.witness,subjectEntityIds:[...new Set([fact.entityId,...bindingOwners])],phase:null,
                source:copy(provenance(fact.source)),explicit:false,origin:'primary-facet-and-reviewed-bindings',bindingOwners});
        }
        if(field==='identity' && fact.listMembers!==undefined){
            if(!validMembers(fact.listMembers,fact.witness)){fail('authored list members must be unique literal source values.');continue;}
            staged.push({factId:fact.id,recordId:fact.recordId || fact.record?.id || null,sourceRecordId:fact.sourceRecordId || null,
                key:'identity',selectors:['members'],members:[...fact.listMembers],witness:fact.witness,subjectEntityIds:[fact.entityId],phase:null,
                source:copy(provenance(fact.source)),explicit:true,origin:'authored-list-members'});
        }
        if(fact.sourceFields===undefined){entries.push(...staged);continue;}
        if(!Array.isArray(fact.sourceFields) || !fact.sourceFields.length){fail('sourceFields must be a nonempty array.');continue;}
        const seen=new Set();let invalid=false;
        for(const authored of fact.sourceFields){
            const reject=message=>{invalid=true;fail(message);};
            if(!authored || !keys.has(authored.key) || !nonempty(authored.witness) || !fact.witness.includes(authored.witness)){
                reject('field key or literal witness span is invalid.');continue;
            }
            const selectors=authored.selectors===undefined?[]:authored.selectors;
            if(!Array.isArray(selectors) || selectors.some(value=>!selector(value)) || new Set(selectors).size!==selectors.length){
                reject('field selectors must be unique descriptive lower-case names.');continue;
            }
            const members=authored.members===undefined && authored.key==='identity' && selectors.includes('members')
                ?fact.listMembers:authored.members;
            if(members!==undefined && (!validMembers(members,authored.witness) || !validMembers(members,fact.witness))){
                reject('field members must be unique exact literals in the field and complete source witness.');continue;
            }
            if(authored.phase!==undefined && !selector(authored.phase)){reject('field phase must be a descriptive lower-case name.');continue;}
            const rawOwners=authored.subjectEntityIds===undefined?[fact.entityId]:authored.subjectEntityIds;
            if(!Array.isArray(rawOwners) || !rawOwners.length || rawOwners.some(value=>!nonempty(value))){reject('field requires canonical declared owners.');continue;}
            const owners=[...new Set(rawOwners.map(value=>canonicalize(value)))];
            if(owners.some(id=>!entities.has(id) || !bound.has(id) && !contextOwner(id))){
                reject('field owner is neither the fact owner, a literal reviewed binding, nor its explicit source-container owner.');continue;
            }
            const source=authored.source || fact.source;
            if(!knownSources.some(known=>sameSource(source,known))){reject('field source is not an exact reviewed provenance declaration.');continue;}
            const argumentsResult=compileArguments(authored,{fact,entities,records,facts:knowledge.facts,links:knowledge.links || [],
                contexts:knowledge.sourceContexts || [],canonicalize});
            if(argumentsResult.issues.length){argumentsResult.issues.forEach(reject);continue;}
            const signature=JSON.stringify([authored.key,[...selectors].sort(),[...owners].sort(),authored.phase || null]);
            if(seen.has(signature)){reject('duplicate authored field signature.');continue;}seen.add(signature);
            staged.push({factId:fact.id,recordId:fact.recordId || fact.record?.id || null,sourceRecordId:fact.sourceRecordId || null,
                key:authored.key,selectors:[...selectors],witness:authored.witness,subjectEntityIds:owners,phase:authored.phase || null,
                ...(members===undefined?{}:{members:[...members]}),source:copy(provenance(source)),explicit:true});
            if(argumentsResult.arguments!==undefined)staged.at(-1).arguments=argumentsResult.arguments;
        }
        if(!invalid){
            // An explicit slot supersedes its identical basic slot; it never
            // expands a different selector, owner, phase or relation.
            const authoredKeys=new Set(staged.filter(entry=>entry.explicit).map(entry=>JSON.stringify([entry.key,entry.selectors,entry.subjectEntityIds,entry.phase])));
            entries.push(...staged.filter(entry=>entry.explicit || !authoredKeys.has(JSON.stringify([entry.key,entry.selectors,entry.subjectEntityIds,entry.phase]))));
        }
    }
    return {entries,issues};
}
