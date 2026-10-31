// Qualified quotations are a separate presentation permission. They never
// remove source conflicts, enter the normal field index, or establish state.
import {authorize} from './policy.js';
import {parseSourceRequestFrame} from './request-frame.js';
import {sourceFieldScopeAllows} from './source-field-router.js';
const list=value=>Array.isArray(value)?value:[];
const text=value=>typeof value==='string'?value:'';
const key=value=>text(value).normalize('NFKC').toLowerCase().replace(/^(?:the|a|an)\s+/,'').replace(/[^\p{L}\p{N}]/gu,'');
const sameSource=(a,b)=>['file','locator','review'].every(k=>a?.[k]===b?.[k]);
const nonempty=value=>typeof value==='string'&&value.trim()===value&&value.length>0;
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const allowedKeys=new Set(['use','method','sequence']);
const hasLiteral=(value,phrase)=>{
    const words=value=>list(text(value).normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)).join(' ');
    return Boolean(words(phrase)) && (` ${words(value)} `).includes(` ${words(phrase)} `);
};

function reviewedPermission(fact,original,supports){
    const meta=fact.conflictQuotation;
    if(!meta || meta.schemaVersion!==1 || !nonempty(meta.conflictId) || !nonempty(meta.disclosure)
        || !['independent-field','unresolved-names'].includes(meta.mode)
        || !list(meta.fields).length || meta.fields.some(f=>!allowedKeys.has(f.key) || !Array.isArray(f.selectors)
            || f.selectors.some(s=>!nonempty(s))))return false;
    if(meta.mode==='independent-field'){
        const disputed=list(meta.excludedDisputedTerms);
        const originalLabel=[original.title,...list(original.aliases),original.text].join(' ');
        return disputed.length>0 && disputed.every(term=>nonempty(term)&&originalLabel.includes(term)&&!fact.witness.includes(term));
    }
    const pairs=list(meta.unresolvedNames);
    return pairs.length>0 && pairs.every(pair=>Array.isArray(pair)&&pair.length===2&&pair.every(nonempty)
        && pair[0]!==pair[1]&&hasLiteral(fact.witness,pair[0])&&pair.every(name=>hasLiteral(meta.disclosure,name))
        && supports.some(record=>hasLiteral(record.text,pair[1])));
}

export function selectSourceConflictQuotation({text:question,knowledge,ceiling='direct',inherited={}}={}){
    if(ceiling!=='direct' || !knowledge?.entities?.get)return null;
    const frame=parseSourceRequestFrame(question);
    if(!frame?.complete || !frame.staticEligible || frame.report || frame.playerStateQuestion || frame.fields.length!==1
        || frame.unresolvedTexts.length || frame.constraints.conditionText || frame.constraints.comparisonText)return null;
    const requested=frame.fields[0],subject=requested.subjectText || frame.subjectText;
    if(!subject || !allowedKeys.has(requested.key) || requested.phase || requested.ordinal!==undefined
        || list(requested.unknownQualifierTexts).length || list(requested.localConditionTexts).length
        || requested.requestedCount || Object.keys(requested.qualifiers || {}).some(k=>k!=='provenanceTexts'))return null;
    const selections=[];
    for(const fact of list(knowledge.facts)){
        const raw=list(knowledge.sourceRecords).find(r=>r.id===fact.sourceRecordId);
        const original=raw&&authorize(raw,ceiling),owner=knowledge.entities.get(fact.entityId);
        const declarations=list(fact.conflictQuotation?.disclosureWitnesses);
        const supports=declarations.map(witness=>{
            const raw=list(knowledge.sourceRecords).find(record=>record.id===witness.sourceRecordId);
            const record=raw&&authorize(raw,ceiling);
            return record && !record.conflict && record.requires==null && !record.diagnostics?.length && !record.actions?.length
                && record.source.review==='extracted' && record.text===witness.text
                && sameSource(record.source,witness.source)?record:null;
        });
        if(!original || !original.conflict || original.requires!=null || original.diagnostics?.length || original.actions?.length
            || !fact.record?.conflict || fact.source?.review!=='extracted'
            || fact.text!==fact.witness || original.text!==fact.witness || !sameSource(fact.source,original.source)
            || ![owner?.name,...list(owner?.aliases)].some(label=>key(label)===key(subject))
            || supports.some(record=>!record) || !reviewedPermission(fact,original,supports))continue;
        const permission=fact.conflictQuotation.fields.find(f=>f.key===requested.key
            && equal([...f.selectors].sort(),[...list(requested.selectors)].sort()));
        if(!permission)continue;
        const entry={factId:fact.id,key:permission.key,selectors:permission.selectors,witness:fact.witness,
            subjectEntityIds:[fact.entityId],explicit:true,source:fact.source};
        if(!sourceFieldScopeAllows({frame,proof:fact,entry,knowledge,inherited}))continue;
        if(supports.some(record=>!sourceFieldScopeAllows({frame,proof:{text:record.text,source:record.source,record},
            entry:{...entry,witness:record.text},knowledge,inherited})))continue;
        selections.push({fact,original,supports,meta:fact.conflictQuotation});
    }
    return selections.length===1?selections[0]:null;
}

export function sourceConflictQuotationReply(selection){
    if(!selection)return null;
    const {fact,original,meta}=selection,supports=list(selection.supports);
    const sources=[fact.source,...supports.map(record=>record.source)].map(source=>({file:source.file,locator:source.locator,review:source.review}));
    return {decision:'answer',text:`Source limitation: ${meta.disclosure}\n\nOriginal guide quotation:\n“${fact.witness}”`
            +(supports.length?'\n\nAdditional source quotations:\n'+supports.map(record=>`“${record.text}”`).join('\n'):''),
        recordIds:[original.id,...supports.map(record=>record.id)],sources,
        quotedFactIds:[fact.id],sourcePresentation:{kind:'conflict-quotation',conflictId:meta.conflictId,mode:meta.mode},
        actions:[],choices:[],stateChanges:[],sourceLinks:[],level:'direct'};
}

export function validateSourceConflictQuotationReply(selection,reply){
    const expected=sourceConflictQuotationReply(selection);
    if(!expected || !reply || reply.knowledge || reply.entityId || reply.title || reply.fallbackOrigin)return false;
    return Object.keys(reply).every(k=>Object.hasOwn(expected,k)) && Object.keys(expected).every(k=>equal(reply[k],expected[k]));
}
