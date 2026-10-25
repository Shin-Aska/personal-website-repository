// Explicit descriptive fields are selected before semantic passage ranking.
// Labels identify a field; the complete literal source must prove its value.
const normal = value => typeof value === 'string' ? value.normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim() : '';
const bare = value => normal(value).replace(/^(?:the|a|an) /,'');
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const sentences = text => normal(text).split(/[.!?;\n]/).map(value=>value.trim()).filter(Boolean);
const uncertain = /\b(?:may|might|could|would|perhaps|maybe|if|unless|unknown|unspecified|uncertain)\b/;
const phrase = (text,value) => new RegExp(`(?:^|\\s)${escape(value)}(?:$|\\s|[.,;:])`).test(text);

function completeSourceLine(fact,record){
    // An authorized substring alone can omit a preceding denial, condition,
    // speaker or trailing qualifier. These fields must be whole source lines.
    const source=String(record.text),witness=String(fact.witness);
    let index=source.indexOf(witness);
    while(index!==-1){
        const before=source.slice(0,index),after=source.slice(index+witness.length);
        if((!before || /\n[ \t]*$/.test(before)) && (!after || /^[ \t]*\n/.test(after)))return true;
        index=source.indexOf(witness,index+1);
    }
    return false;
}

function methodProof(scope,source){
    const terms=bare(scope).replace(/\b(?:timing|tactics|technique|method)$/,'').trim().split(/\s+/);
    if(!terms.length)return false;
    const parts=sentences(source);
    const charge=parts.some(part=>/^charge (?:before|after|until|when|once|for)\b/.test(part));
    const movement=parts.some(part=>/^(?:keep moving|move (?:away|back|around|toward|towards)|dodge\b|step (?:away|back|aside))/.test(part));
    const swingTiming=parts.some((part,index)=>/^charge (?:before|after|until|when|once|for)\b/.test(part)
        && /^do not wait until .+ to ready (?:the |your )?(?:sword|swing|strike)$/.test(parts[index+1] || ''));
    const movingDefense=parts.some((part,index)=>/^keep moving$/.test(part)
        && /^(?:slower )?(?:creatures|enemies|foes) can be dodged$/.test(parts[index+1] || '')
        && /^(?:your )?moving feet make you harder to hit$/.test(parts[index+2] || ''));
    const combat=movingDefense || swingTiming || parts.some(part=>/^(?:dodge|strike|hit) (?:the |a |an )?(?:creature|enemy|foe)\b/.test(part));
    const timing=/\b(?:before|after|until|when|once|for \d+ (?:seconds?|turns?))\b/.test(source);
    const grounding={sword:swingTiming,charge,
        combat,movement,moving:movement};
    if(!terms.every(term=>term in grounding?grounding[term]:phrase(source,term)))return false;
    if(/\btiming$/.test(scope) && !timing)return false;
    // These implicit-object readings have a finite vocabulary. A modifier
    // elsewhere in the witness cannot qualify the sword or its movement.
    if(terms.some(term=>['charge','movement','moving'].includes(term)) && terms.some(term=>!(term in grounding)))return false;
    if(terms.includes('charge'))return charge;
    if(terms.includes('movement') || terms.includes('moving'))return movement;
    // Other literal method labels must put their complete requested object in
    // the actual imperative clause, rather than another sentence's co-mention.
    return parts.some(part=>/^(?:use|hold|release|click|press|dodge|step|strike|put|move)\b/.test(part)
        && !uncertain.test(part) && terms.every(term=>phrase(part,term)));
}

function bonusProof(scope,source,record){
    const owner=bare(scope).replace(/ (?:attribute bonus|stat bonus|attribute reward)$/,'');
    if(!owner)return false;
    const shrine=owner.startsWith('shrine of ')?owner:`shrine of ${owner}`;
    const names=[...source.matchAll(/\bshrine of ([a-z-]+)\b/g)].map(match=>`shrine of ${match[1]}`);
    const value='(?:grants? no (?:attribute|stat) bonus|(?:grants?|adds?|gives?) (?:\\d+|one|two|three)(?: points? of)? (?:attribute|stat|strength|dexterity|intelligence)(?: bonus)?)';
    const direct=new RegExp(`^(?:the )?(?:${escape(owner)}|${escape(shrine)}) ${value}$`);
    if(sentences(source).some(part=>!uncertain.test(part) && direct.test(part)))return true;
    // "This shrine" may bind only to the same sentence's named shrine, with
    // no intervening other shrine. Do not borrow another shrine's bonus.
    const antecedent=new RegExp(`^(?:return to|visit) (?:the )?${escape(shrine)}\\b[^.;!?]*; this shrine ${value}\\.?$`);
    if(!uncertain.test(source) && names.length>0 && names.every(name=>name===shrine) && antecedent.test(source))return true;
    // A title can ground a standalone source field only when the complete raw
    // record contains that single named shrine and no competing shrine name.
    if(!new RegExp(`^(?:restore |return to |visit )?(?:the )?${escape(shrine)}$`).test(bare(record.title)))return false;
    const named=[...normal(record.text).matchAll(/\bshrine of ([a-z-]+)\b/g)].map(match=>`shrine of ${match[1]}`);
    return named.length>0 && named.every(name=>name===shrine)
        && sentences(source).some(part=>!uncertain.test(part) && new RegExp(`^this shrine ${value}$`).test(part));
}

function requestProof(scope,source){
    const actor=bare(scope).replace(/ request$/,'');
    return !!actor && sentences(source).some(part=>!uncertain.test(part)
        && new RegExp(`^(?:in [^,]+, )?(?:the )?${escape(actor)} (?:asks? you to|requests? that you|wants? you to) .+$`).test(part));
}

function priceProof(scope,source){
    const complement=bare(scope).replace(/ price$/,'').split(/\s+/);
    return sentences(source).some(part=>{
        if(uncertain.test(part))return false;
        const sale=/^(?:buy|purchase) (.+?) from (.+?) for \d+ (?:gold|coins?|credits?)(?: and .+)?$/.exec(part);
        if(!sale)return false;
        // The query orders its supplier before its item. Match both complete
        // phrases to the literal roles of this one buy clause, never to other
        // sentences mentioning the supplier or a different priced object.
        for(let split=1;split<complement.length;split++){
            const supplier=complement.slice(0,split).join(' '),item=complement.slice(split).join(' ');
            const seller=bare(sale[2]).replace(/^(?:adventurer|merchant|trader|vendor|shopkeeper) /,'');
            if(seller===supplier && !/\b(?:of|like|imitation|fake|counterfeit|replica|not|except)\b/.test(sale[1])
                && (bare(sale[1])===item || bare(sale[1]).endsWith(` ${item}`)))return true;
        }
        return false;
    });
}

export function parseNamedSourceFieldRequest(text) {
    if(typeof text!=='string')return null;
    const q=text.trim().replace(/\?$/,'').trim();
    const internal=/^what exact (hidden|internal|save|script|event) (flag|variable|bit|counter) (stores|records|controls|tracks) (.+)$/i.exec(q);
    if(internal)return Object.freeze({kind:'named-source-field',field:'internal-identifier',
        scopeText:internal[4],identifierType:internal[2].toLowerCase(),action:internal[3].toLowerCase(),originalText:text});
    let match=/^how (?:do|can|should|must) (?:i|we) use (.+\b(?:timing|movement|tactics|technique|method))$/i.exec(q);
    if(match)return Object.freeze({kind:'named-source-field',field:'method',scopeText:match[1],originalText:text});
    match=/^what (?:is|are) (.+\b(?:attribute bonus|stat bonus|attribute reward|request))$/i.exec(q);
    if(match)return Object.freeze({kind:'named-source-field',field:/\brequest$/i.test(match[1])?'objective':'stats',scopeText:match[1],originalText:text});
    match=/^how (?:do|can|should|must) (?:i|we) get (.+\bprice)$/i.exec(q);
    return match?Object.freeze({kind:'named-source-field',field:'price',scopeText:match[1],originalText:text}):null;
}

export function supportsNamedSourceFieldRequest(request,{fact,subjectEntityId,sourceRecord,isEligible}={}) {
    if(!request || JSON.stringify(parseNamedSourceFieldRequest(request.originalText))!==JSON.stringify(request)
        || !fact || fact.entityId!==subjectEntityId || !fact.text || fact.text!==fact.witness
        || fact.conflict || fact.source?.review==='conflicting' || !Array.isArray(fact.answerRelations)
        || sourceRecord?.id!==fact.sourceRecordId || sourceRecord.conflict || sourceRecord.source?.review==='conflicting'
        || !sourceRecord.text?.includes(fact.witness) || !completeSourceLine(fact,sourceRecord)
        || !fact.source?.file || ![sourceRecord.source?.file,sourceRecord.source?.basedOn?.file,
            ...(sourceRecord.source?.claims || []).map(claim=>claim.source?.file)].includes(fact.source.file)
        || typeof isEligible!=='function' || !isEligible(fact))return false;
    // Narrative descriptions of an ending trigger do not identify its saved
    // variable. An internal identifier needs an explicit whole source clause.
    if(request.field==='internal-identifier'){
        const scope=bare(request.scopeText);
        if(/\b(?:its|his|her|their|my|our|this|that)\b/.test(scope))return false;
        return fact.answerRelations.includes('identity') && sentences(fact.text).some(clause=>
            new RegExp(`^(?:the )?${escape(request.identifierType)} [a-z_][a-z0-9_]* ${escape(request.action)} (?:the )?${escape(scope)}$`).test(clause));
    }
    const labels=request.field==='method'?fact.topicLabels || []:[fact.subject,...(fact.topicLabels || []),...(fact.aliases || [])];
    if(!labels.some(label=>bare(label)===bare(request.scopeText)))return false;
    const roles=fact.answerRelations,source=normal(fact.text);
    const scope=bare(request.scopeText);
    if(request.field==='method')return roles.includes('method') && (roles.includes('combat') || roles.includes('use')) && methodProof(scope,source);
    if(request.field==='stats')return roles.includes('stats') && roles.includes('outcome') && bonusProof(scope,source,sourceRecord);
    if(request.field==='objective')return roles.includes('objective') && requestProof(scope,source);
    return request.field==='price' && roles.includes('acquisition') && roles.includes('method')
        && priceProof(scope,source);
}
