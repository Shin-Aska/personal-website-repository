// Match independently reviewed predicate arguments. A source container is a
// search scope; only these literal/direct-link bindings resolve its objects.
import {matchesSoftwareFieldArgument} from './software-capabilities.js';
const text=value=>String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const words=value=>text(value).match(/[\p{L}\p{N}]+/gu) || [];
const bare=value=>text(value).replace(/^(?:the|a|an|this|that|his|her|its|their) /,'');
const key=value=>words(value).join('');
const list=value=>Array.isArray(value)?value:[];
const unique=values=>[...new Set(values)];
const glue=new Set('a an the this that these those his her its their of for in at on to from with and or is are'.split(' '));
const references=/^(?:it|its|this|that|one|he|him|his|she|her|they|them|their)$/;
export function sourceFieldNeedsReference(value){
    return references.test(bare(value)) || /^(?:item|weapon|instrument|tune|song|word|mantra|shard|lens|rune|door|plans|client|project|wood|material)$/.test(bare(value));
}
const roles={object:['object'],input:['input','object'],output:['output','object'],content:['content','object'],
    instrument:['instrument'],destination:['destination'],recipient:['recipient'],agent:['agent']};
const kindWords={song:['song','tune','music'],spell:['spell'],password:['word','password'],
    person:['person','man','woman'],npc:['person'],character:['person'],companion:['companion','person']};
const inflect=value=>value.replace(/ies$/,'y').replace(/s$/,'');
const spatial=value=>text(value).replace(/\bcentral (?=(?:door|room|hall|column|row|platform)\b)/g,'center ');
export function provedEntityRoleFacts(entityId,knowledge){
    if(!entityId || !Array.isArray(knowledge?.sourceFields?.entries) || !Array.isArray(knowledge?.facts))return [];
    return knowledge.sourceFields.entries.filter(entry=>entry.explicit && entry.key==='identity'
        && list(entry.selectors).includes('role') && list(entry.subjectEntityIds).includes(entityId) && entry.factId)
        .map(entry=>knowledge.facts.find(fact=>fact.id===entry.factId))
        .filter(fact=>fact && !fact.conflict && fact.source?.review!=='conflicting');
}
export function provedEntityRoleWords(entityId,knowledge){
    return new Set(provedEntityRoleFacts(entityId,knowledge)
        .flatMap(fact=>words(String(fact.witness || '').split(/[.,;]|(?:\s+who\b)/i)[0]).map(inflect)));
}
function bindingMatches(value,binding,{field,entry,knowledge,referentIds,grounded}){
    const requested=bare(spatial(value));
    if(references.test(requested))return Boolean(grounded && binding.entityId && referentIds.includes(binding.entityId));
    const entity=knowledge.entities.get(binding.entityId);
    const exactIds=[...knowledge.entities].filter(([,candidate])=>[candidate.name,...list(candidate.aliases)]
        .some(name=>key(name)===key(requested))).map(([id])=>id);
    if(binding.entityId && exactIds.length && !exactIds.includes(binding.entityId))return false;
    const names=[binding.mention,entity?.name,...list(entity?.aliases)].filter(Boolean).map(spatial);
    if(field.key==='method' && list(field.selectors).includes('riddle-answer') && binding.role==='object'){
        const owned=/^(.+?)'s riddle$/.exec(text(binding.mention));
        if(owned && key(owned[1])===key(requested))return true;
    }
    if(names.some(name=>key(name)===key(requested)))return true;
    const tokens=words(requested).filter(word=>!glue.has(word)).map(inflect);
    if(!tokens.length)return false;
    // A generic type is usable only from a declared canonical kind. No item
    // becomes wood, an instrument, or a person merely by being nearby.
    const roleOwnerId=binding.entityId || (list(entry?.subjectEntityIds).length===1
        && words(knowledge.entities.get(entry.subjectEntityIds[0])?.name).includes(words(binding.mention)[0])?entry.subjectEntityIds[0]:undefined);
    if(tokens.length===1 && (list(kindWords[entity?.kind]).includes(tokens[0])
        || provedEntityRoleWords(roleOwnerId,knowledge).has(tokens[0])))return true;
    const labelWords=new Set(names.flatMap(words).map(inflect));
    const headWords=new Set(names.map(name=>words(name).at(-1)).filter(Boolean).map(inflect));
    const localWords=new Set(words(entry.witness).map(inflect));
    const fact=knowledge.facts?.find(fact=>fact.id===entry.factId);
    const scopeWords=new Set(words([entry.witness,fact?.subject,...list(fact?.aliases),...list(fact?.topicLabels),
        ...list(entry.subjectEntityIds).flatMap(id=>{const owner=knowledge.entities.get(id);return owner?[owner.name,...list(owner.aliases)]:[];})].filter(Boolean).join(' ')).map(inflect));
    // Require a real object head before accepting its locally recorded
    // qualifiers (e.g. the first-room key, not another co-mentioned place).
    if(headWords.has(tokens.at(-1)) && tokens.every(word=>localWords.has(word) || labelWords.has(word)))return true;
    const kindHead=list(kindWords[entity?.kind]).includes(tokens.at(-1));
    if((headWords.has(tokens.at(-1)) || kindHead) && tokens.every(word=>scopeWords.has(word) || labelWords.has(word)
        || list(kindWords[entity?.kind]).includes(word)))return true;
    return Boolean(fact && matchesSoftwareFieldArgument({value,binding,field,entry,fact,
        subjectLabels:list(entry.subjectEntityIds).flatMap(id=>{const entity=knowledge.entities.get(id);return entity?[entity.name,...list(entity.aliases)]:[];})}));
}
export function matchSourceFieldArguments({field,entry,knowledge,referentIds=[],grounded=false}={}){
    const requested=list(field?.objectTexts).filter(value=>typeof value==='string' && value.trim());
    if(!requested.length)return {requested:false,matched:false,groups:[],entityIds:[],requiredFactIds:[]};
    const allowed=new Set(roles[field.objectRole || 'object'] || []);
    if(!allowed.size || !knowledge?.entities?.get)return {requested:true,matched:false,groups:[],entityIds:[],requiredFactIds:[]};
    const matches=[];
    for(const group of list(entry?.arguments)){
        const bindings=list(group.bindings).filter(binding=>allowed.has(binding.role));
        if(!requested.every(value=>bindings.some(binding=>bindingMatches(value,binding,{field,entry,knowledge,referentIds,grounded}))))continue;
        const used=bindings.filter(binding=>requested.some(value=>bindingMatches(value,binding,{field,entry,knowledge,referentIds,grounded})));
        matches.push({group,used});
    }
    // Different canonical referents cannot be chosen by lexical rank. Multiple
    // literal values in the same proved group remain a coordinated answer.
    const signatures=unique(matches.map(match=>JSON.stringify(unique(match.used.map(binding=>binding.entityId || key(binding.mention))).sort())));
    if(signatures.length>1)return {requested:true,matched:false,ambiguous:true,groups:[],entityIds:[],requiredFactIds:[]};
    return {requested:true,matched:matches.length>0,groups:matches.map(match=>match.group),
        entityIds:unique(matches.flatMap(match=>match.used.map(binding=>binding.entityId).filter(Boolean))),
        requiredFactIds:unique(matches.flatMap(match=>list(match.group.requiredFactIds)))};
}
export function sourceFieldReferents(fields=[]){
    const byRole={};
    const proved=new Set(fields.flatMap(selected=>list(selected.proofs).flatMap(proof=>
        [proof.proof?.id,...list(proof.supporting).map(fact=>fact.id)]).filter(Boolean)));
    for(const selected of fields)for(const proof of list(selected.proofs))for(const group of list(proof.entry?.arguments))
        for(const binding of list(group.bindings))if(binding.entityId && list(group.requiredFactIds).every(id=>proved.has(id))){
            byRole[binding.role] ||= [];if(!byRole[binding.role].includes(binding.entityId))byRole[binding.role].push(binding.entityId);
        }
    return byRole;
}
