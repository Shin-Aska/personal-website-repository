// A named question series is source scope, not a new answer or an alias.
const normalize=value=>typeof value==='string'?value.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim():'';

export function parseQuestionSourceAttribution(text){
    if(typeof text!=='string')return null;
    const q=normalize(text).replace(/\?$/,'').trim();
    const match=/^((?:what|who|how|where|which)\b.+?),? according to (?:the )?([a-z][a-z0-9_]*) questions$/.exec(q);
    return match?Object.freeze({questionText:match[1].replace(/,$/,''),seriesText:match[2],originalText:text}):null;
}

export function supportsQuestionSourceAttribution(request,{fact,sourceRecord}={}){
    if(!request || JSON.stringify(parseQuestionSourceAttribution(request.originalText))!==JSON.stringify(request)
        || typeof fact?.text!=='string' || !fact.text.trim() || fact.text!==fact.witness || fact.conflict
        || sourceRecord?.kind!=='qa' || sourceRecord.conflict || fact.sourceRecordId!==sourceRecord.id
        || !sourceRecord.text?.includes(fact.witness) || fact.source?.review!=='extracted'
        || sourceRecord.source?.review!=='extracted' || fact.source.file!==sourceRecord.source.file
        || fact.source.locator!==sourceRecord.source.locator)return false;
    // Require the exact final indexed source property. Prefix matches, another
    // property, composite locators and arbitrary labels provide no authority.
    return new RegExp('(?:^|\\.)'+request.seriesText+'\\[\\d+\\]$').test(fact.source.locator)
        && !/[;*…\r\n]|\.\./.test(fact.source.locator);
}
