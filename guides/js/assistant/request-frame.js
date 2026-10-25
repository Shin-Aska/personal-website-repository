import { playerStateQuestion as legacyPlayerStateQuestion } from './language.js';

// Syntax only: this module has no game names, entity aliases, source records,
// embeddings, facts or player state. A frame proposes fields; it proves none.
const clean = value => typeof value === 'string' ? value.normalize('NFKC').replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ').trim() : '';
const lower = value => clean(value).toLowerCase();
const end = value => clean(value).replace(/[?!.]+$/, '').trim();
const bare = value => clean(value).replace(/^(?:the|a|an)\s+/i, '');
const WH = '(?:from when|what|which|where|who|whose|whom|why|when|how|is|are|does|do|can|could|should|would|will|has|have)';
const IMPERATIVE = '(?:give|tell|show|describe|explain|quote|list|name|lay out|point me to)';
const START = new RegExp(`^(?:${WH}|${IMPERATIVE})\\b`, 'i');
const AUX = '(?:does|do|did|can|could|should|would|will|is|are|was|were|has|have)';
const ACTORS = /^(?:(?:the|this|that|reviewed|documented|original|local)\s+)*(?:guide|page|table|source|record|description|instructions|notes|readme|reward field)$/i;
const documentActor = text => ACTORS.test(text) || (!possessiveOwner(text) && /\b(?:guide|manual|page|table|source|record|description|instructions|notes|readme)$/i.test(clean(text)));
const STATE = /\b(?:my|our|already|currently|current|right now|at the moment|in front of me|for me to recruit|i am carrying|i'm carrying|i own|i currently have)\b/i;
const REPORT = /^(?:i|we)\s+(?:already|just|finally|currently)\s+(?!(?:need|want|would like)\b)|^(?:i|we)\s+(?:(?:already|just|finally|now|currently|still)\s+)*(?:(?:have|had)\s+(?!to\b)|got\b|own\b|obtained\b|acquired\b|completed\b|finished\b|recruited\b|defeated\b|lost\b)|^(?:i'm|i am|we're|we are)\s+(?:at|in)\s+/i;
const FIELD_RULES = [
    ['location', 'coordinates', /\bcoordinates?\b/gi],
    ['location', 'working-directory', /\bworking (?:folder|directory)\b/gi],
    ['location', 'data-directory', /\bdata (?:folders?|directories)\b/gi],
    ['location', 'ide-directory', /\bIDE (?:folder|directory)\b/gi],
    ['location', 'recruitment', /\brecruitment (?:meeting )?(?:place|location)\b/gi],
    ['location', null, /\blocations?|sites?|whereabouts|meeting place|folders?|directories|position\b/gi],
    ['identity', 'role', /\b(?:(?:fighting|combat) )?roles?\b/gi],
    ['identity', 'focus', /\b(?:main )?focus\b/gi],
    ['identity', 'execution-mode', /\bexecution(?: (?:mode|method))?\b/gi],
    ['identity', 'type', /\b(?:weapon )?types?|sort of projectile\b/gi],
    ['identity', 'members', /\broster|companions?|members?|names\b/gi],
    ['identity', 'replacement', /\breplacements?\b/gi],
    ['stats', null, /\bstats?|statistics|attributes?\b/gi],
    ['stats', 'strength', /\bstrength|str\b/gi], ['stats', 'dexterity', /\bdexterity|dex\b/gi],
    ['stats', 'intelligence', /\bintelligence|int\b/gi], ['stats', 'combat', /\bcombat\b/gi],
    ['stats', 'luck', /\bluck\b/gi], ['stats', 'health', /\bhealth|hit points?|hp\b/gi],
    ['stats', 'damage', /\b(?:basic )?damage\b/gi], ['stats', 'range', /\brange\b/gi],
    ['stats', 'radius', /\b(?:blast )?radius\b/gi], ['stats', 'duration', /\bduration|delay\b/gi],
    ['stats', 'weight', /\bweight\b/gi], ['stats', 'angle', /\bangles?\b/gi],
    ['stats', 'duration', /\bseconds?|minutes?|hours?|cycles?|turns?\b/gi],
    ['stats', 'date', /\bdate\b/gi],
    ['stats', 'tempo', /\btempo\b/gi], ['stats', 'durability', /\bdurability\b/gi],
    ['stats', 'price', /\bprice|cost\b/gi],
    ['stats', 'selling-percentage', /\bselling (?:and buying )?percentages?|sell(?:ing)? rates?\b/gi],
    ['stats', 'buying-percentage', /\b(?:selling and )?buying percentages?|buy(?:ing)? rates?\b/gi],
    ['stats', 'selling-percentage', /\btrade percentages?\b/gi], ['stats', 'buying-percentage', /\btrade percentages?\b/gi],
    ['use', 'travel', /\btravel benefits?\b/gi],
    ['use', 'effect', /\b(?:protective )?effects?|benefits?|capabilit(?:y|ies)\b/gi],
    ['use', 'bonus', /\bbonus(?:es)?\b/gi], ['use', 'penalty', /\bpenalt(?:y|ies)\b/gi],
    ['use', 'purpose', /\bpurpose|function|job\b/gi],
    ['use', 'automation', /\bsetup work|automation\b/gi], ['use', 'updates', /\bautomatic updates?\b/gi],
    ['method', 'placement-check', /\bplacement check\b/gi],
    ['method', 'placement', /\bplacement|side\b/gi],
    ['method', 'build', /\bsource build|build procedure\b/gi],
    ['method', 'keyword', /\b(?:song )?topics?|keywords?|(?:dungeon )?words?|passwords?\b/gi],
    ['method', 'riddle-answer', /\briddle(?:'s)? answer|answer\b/gi],
    ['method', 'diagnostics', /\b(?:compatibility|version-compatibility) checks?|diagnostics?\b/gi],
    ['method', 'step', /\bsteps?|instructions?|procedure|tactic|hazards?\b/gi],
    ['prerequisites', 'materials', /\bmaterials?|ingredients?|components?|reagents?|burner items?\b/gi],
    ['prerequisites', 'condition', /\bconditions?|requirements?|prerequisites?\b/gi],
    ['outcome', 'reward', /\brewards?\b/gi], ['outcome', null, /\boutcome|result|consequence\b/gi],
    ['sequence', 'tune', /\b(?:number|numeric|tune) sequence|tune\b/gi],
    ['sequence', 'alternatives', /\balternatives?|approaches|options|routes\b/gi],
    ['composition', 'metal', /\bmetals?\b/gi], ['composition', 'material', /\bcomposition|mineral|stone floor\b/gi],
    ['documentation', null, /\bdocumentation|documents?|manual\b/gi],
    ['support', 'license', /\blicen[cs]e\b/gi], ['support', 'policy', /\b(?:derivative-bot )?policy\b/gi],
    ['support', null, /\bsupport|community|questions|issues\b/gi],
    ['version', null, /\bversions?|releases?|toolchain\b/gi],
    ['limitations', 'restart', /\brestart (?:limits?|limitations?)\b/gi],
    ['limitations', 'maintenance', /\bmaintenance(?: status| history)?\b/gi],
    ['support', 'toolchain-policy', /\btoolchain guidance|toolchain policy\b/gi],
    ['limitations', null, /\blimitations?|limits?|restrictions?|danger|warning|qualified\b/gi],
    ['cause', null, /\bcause|reason|motive\b/gi]
];

function field(key, selectors, requestedText, extra = {}) {
    return { key, selectors: selectors ? [selectors] : [], requestedText, ...extra };
}
function nominalFields(head, requestedText) {
    const found = [];
    for (const [key, selector, pattern] of FIELD_RULES) {
        const bounded = new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern.source})(?![\\p{L}\\p{N}])`, 'giu');
        for (const match of head.matchAll(bounded)) found.push({ start: match.index, end: match.index + match[0].length,
            value: field(key, selector, requestedText, { fieldText: match[0], qualifierTexts: [] }) });
    }
    const metadataSpans=[];
    for(const match of head.matchAll(/\b(?:line|field|row|column|entry|listing|value|description)(?=\s*(?:,|\band\b|\bor\b|$))/gi)){
        const prior=[...head.slice(0,match.index).matchAll(/,|\b(?:and|or)\b/gi)].at(-1);
        const start=prior?prior.index+prior[0].length:0;
        if(found.some(hit=>hit.start>=start&&hit.end<=match.index))metadataSpans.push({start:match.index,end:match.index+match[0].length,text:match[0]});
    }
    // More specific nominal phrases win over contained generic words.
    if (!found.length) return [];
    const selected = found.filter(hit => !found.some(other => other !== hit && other.start <= hit.start && other.end >= hit.end
        && other.end - other.start > hit.end - hit.start)).sort((a,b) => a.start-b.start);
    let cursor = 0;
    for (const part of head.split(/,\s*|\s+(?:and|or)\s+/i)) {
        const start = head.indexOf(part, cursor), finish = start + part.length; cursor = finish;
        if (part.trim() && !selected.some(hit => hit.start < finish && hit.end > start))
            selected.push({start, end:finish, value:field('unknown',lower(part),requestedText,{fieldText:part,qualifierTexts:[]})});
    }
    return selected.sort((a,b)=>a.start-b.start).map(hit=>{
        const prefix=head.slice(0,hit.start),boundary=[...prefix.matchAll(/,|\b(?:and|or)\b/gi)].at(-1);
        const start=boundary?boundary.index+boundary[0].length:0;
        const next=/,|\b(?:and|or)\b/i.exec(head.slice(hit.end));
        const finish=next?hit.end+next.index:head.length;
        const countText=/\b(?:both|one|two|three|four|five|six|seven|eight|nine|ten|all|\d+)\b/i.exec(prefix.slice(start))?.[0];
        const countValues={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,both:2};
        const practical=hit.value.key==='use'&&/\bbenefits?\b/i.test(hit.value.fieldText || '')&&/\bpractical\b/i.test(head.slice(start,finish));
        let modifiers=[...head.slice(start,finish)].map((char,index)=>[...found,...metadataSpans].some(other=>start+index>=other.start&&start+index<other.end)?' ':char).join('')
            .replace(/\b(?:and|or|the|a|an)\b/gi,' ').replace(/[, ]+/g,' ').trim();
        if(practical)modifiers=modifiers.replace(/\bpractical\b/gi,' ').trim();
        if(countText)modifiers=modifiers.replace(new RegExp(`\\b${countText}\\b`,'i'),'').trim();
        return {...hit.value,qualifierTexts:modifiers?[modifiers]:[],fieldHead:head,...(practical?{presentationTexts:['practical']}:{}),
            ...(metadataSpans.some(span=>span.start>=start&&span.end<=finish)?{metadataTexts:metadataSpans.filter(span=>span.start>=start&&span.end<=finish).map(span=>span.text)}:{}),
            ...(countText?{requestedCountText:countText,requestedCount:{text:countText,
                value:lower(countText)==='all'?null:countValues[lower(countText)]??Number(countText),
                scope:'requested-list'}}:{})};
    });
}
function governedArguments(action) {
    let match=/^(?:perform|give|deliver|hand|take|bring)\s+(.+?)\s+(?:for|to)$/i.exec(action);
    if(match)return {texts:[match[1]],objectTexts:[match[1]],objectRole:'content'};
    match=/^turns?\s+(.+?)\s+into\s+(.+)$/i.exec(action);
    if(match)return {texts:[match[1],match[2]],outputText:match[2],objectTexts:[match[2]],objectRole:'output'};
    match=/^(?:make|makes|craft|crafts|forge|forges|build|builds|sew|sews|weave|weaves)\s+(.+?)\s+from\s+(.+)$/i.exec(action);
    if(match)return {texts:[match[2],match[1]],outputText:match[1],objectTexts:[match[1]],objectRole:'output'};
    match=/^(?:teach|teaches|instruct|instructs|supply|supplies|sell|sells|provide|provides|give|gives|offer|offers|made|created?|creates|wrote|writes?|develop(?:s|ed)?|author(?:s|ed)?|design(?:s|ed)?|make|makes|craft|crafts|build|builds|forge|forges|repair|repairs|receive|receives|get|gets|accept|accepts|take|takes|collect|collects|use|mention|say|shout|bring|need|require|gather|install|download|get|obtain|acquire)\s+(.+)$/i.exec(action);
    return {texts:match?[match[1]]:[],objectTexts:match?[match[1]]:[]};
}
function sourceOwner(candidate) {
    if(!candidate)return {subjectText:null,provenanceTexts:[]};
    const own=possessiveOwner(candidate);
    const metadata=/^(?:(?:character|feature|source) )?(?:notes|profile|record|table row|table)$/i;
    if(own)return metadata.test(own.head)?{subjectText:own.subjectText,provenanceTexts:[own.head]}:{subjectText:candidate,provenanceTexts:[]};
    const suffix=/^(.+?)\s+((?:(?:character|feature|source) )?(?:notes|profile|record|table row))$/i.exec(candidate);
    return suffix?{subjectText:suffix[1],provenanceTexts:[suffix[2]]}:{subjectText:candidate,provenanceTexts:[]};
}
function propertyOwner(candidate, fields) {
    if(!candidate)return {subjectText:candidate};
    const reflexive=/^(.+?)\s+(itself|himself|herself|themselves)$/i.exec(candidate);
    if(reflexive&&reference(reflexive[1]))return {subjectText:reflexive[1],metadataTexts:[reflexive[2]]};
    // A property can govern a nominalized action. Preserve that entire action
    // separately; no operation, purpose or comparison becomes source evidence.
    let wrapped=/^(finishing|completing)\s+(.+)$/i.exec(candidate);
    if(wrapped&&fields.every(value=>value.key==='outcome')
        &&reference(wrapped[2])&&/\b(?:quest|errand|project)$/i.test(wrapped[2]))
        return {subjectText:wrapped[2],purposeTexts:[candidate],governorText:wrapped[1]};
    wrapped=/^(reaching|entering|accessing)\s+(.+)$/i.exec(candidate);
    if(wrapped&&fields.every(value=>value.key==='sequence'&&value.selectors.includes('alternatives')))
        return {subjectText:wrapped[2],purposeTexts:[candidate],governorText:wrapped[1]};
    wrapped=/^(treating|using)\s+(.+?)\s+(as\s+.+)$/i.exec(candidate);
    if(wrapped&&fields.every(value=>value.key==='limitations'))
        return {subjectText:wrapped[2],purposeTexts:[candidate],governorText:wrapped[1],qualifierTexts:[wrapped[3]]};
    return {subjectText:candidate};
}
function governedField(action, clause) {
    const q = lower(action);
    if (/^(?:teach(?:es)?|instruct(?:s)?)\b/.test(q)) return field('teacher', null, clause, { actionText: action });
    if (/^(?:made|creat(?:e|es|ed)|wrote|write(?:s)?|develop(?:s|ed)?|author(?:s|ed)?|design(?:s|ed)?|make(?:s)?|craft(?:s)?|build(?:s)?|forge(?:s)?|sew(?:s)?|spin(?:s)?|weave(?:s)?|repair(?:s)?|handle(?:s)? the repair|turn(?:s)? .+ into)\b/.test(q)) return field('creator', /repair/.test(q)?'repair':null, clause, { actionText: action });
    if (/^(?:supply|supplies|sell|sells|provides?|gives?|offers?)\b/.test(q)) return field('provider', /sell/.test(q)?'seller':null, clause, { actionText: action });
    if (/^(?:receives?|get|gets|accepts?|takes?|collects?)\b/.test(q)) return field('recipient', null, clause, { actionText: action });
    return null;
}
function actionField(action, clause) {
    const q = lower(action);
    if (/^(?:fight|battle|attack|defeat|combat|counter)\b/.test(q)) return field('combat',null,clause,{actionText:action});
    if (/^download\b/.test(q)) return field('acquisition','download',clause,{actionText:action});
    if (/^(?:install|set up|configure)\b/.test(q)) return field('method',null,clause,{actionText:action});
    if (/^(?:pay|cost|charge|spend)\b/.test(q)) return field('stats','price',clause,{actionText:action});
    if (/^(?:bring|collect|need|require|gather)\b/.test(q)) return field('prerequisites', 'materials', clause, {actionText:action});
    if (/^(?:say|ask|shout|mention|chant)\b/.test(q)) return field('method', /shout/.test(q)?'summon':'keyword',clause,{actionText:action});
    if (/^(?:open|unlock|do with|use|do|provide|benefit)\b/.test(q)) return field('use','effect',clause,{actionText:action});
    if (/^(?:get|obtain|acquire|buy|recover|recruit)\b/.test(q)) return field('acquisition',null,clause,{actionText:action});
    const selector = /^(?:summon|call)/.test(q)?'summon':/^(?:cross|traverse)/.test(q)?'cross':/^(?:launch|run|execute)/.test(q)?'launch':
        /^(?:place|position|align|set)/.test(q)?'placement':/^(?:repair)/.test(q)?'repair':/^(?:craft|forge|make|build)/.test(q)?'craft':
            /^(?:prepare|cut)/.test(q)?'material-preparation':null;
    if(selector)return field('method',selector,clause,{actionText:action});
    if(/^(?:get out of|start|begin|finish|complete|return to|follow|escape|leave|exit|hide|store|deliver|assemble|solve)\b/.test(q))return field('method','step',clause,{actionText:action});
    return null;
}
function reference(text) {
    return /^(?:(?:his|her|its|their|that|this|the)\s+)?(?:one|item|weapon|hammer|sword|spell|client|project|quest|errand|shrine|table|guide|page|it|he|she|him|her|they|them|there)$|^(?:his|her|its|their)$/i.test(clean(text));
}
function ownerIn(rest, qualifiers) {
    const r = end(rest);
    if(/^(?:listed|recorded|described|specified|documented|required|needed)$/i.test(r))return null;
    let m;
    // A source actor assigns/records a field to a target; it is not the target.
    if ((m=/^(.+?)\s+(?:assign|assigns|give|gives|list|lists|recommend|recommends|record|records|describe|describes)\s+(?:.+?\s+)?(?:to|for|of|against)\s+(.+)$/i.exec(r)) && documentActor(m[1])) return m[2];
    if((m=/^(.+?)\s+(?:place|places|give|gives|list|lists|describe|describes|record|records)\s+(.+)$/i.exec(r))&&documentActor(m[1]))return m[2];
    if ((m=/^(?:listed|recorded|described|given|specified|documented|available|required|needed)\s+(?:for|of|on|about|in)\s+(.+)$/i.exec(r))) return m[1];
    if ((m=/^(.+?)\s+(?:have|has|provide|provides|give|gives|do|does|require|requires|need|needs|accept|accepts|impose|imposes|open|opens|list|lists|say|says|contain|contains|perform|performs|grant|grants|add|adds|remain|remains|last|lasts|hide|hides|pay|pays)\b(.*)$/i.exec(r))) {
        if(m[2].trim())qualifiers.push(m[2].trim());
        return documentActor(m[1])?null:m[1];
    }
    if((m=/^(.+?)\s+(?:made|listed|described|specified|recovered|located|found|waiting|installed|equipped|recorded|prepared)\b(.*)$/i.exec(r))){
        if(m[2].trim())qualifiers.push(m[2].trim());return m[1];
    }
    return r || null;
}
function possessiveOwner(text) {
    let m=/^(.+?)(?:'s|s')\s+(.+)$/i.exec(text);
    if(m)return {subjectText:m[1]+(/s'\s/.test(text)&&!/'s\s/.test(text)?'s':''),head:m[2]};
    m=/^(his|her|its|their)\s+(.+)$/i.exec(text);
    return m?{subjectText:m[1],head:m[2]}:null;
}

function readClause(raw) {
    const clause=end(raw); if(!clause)return null;
    let q=clause.replace(/^(?:and|also|then|instead)[,:]?\s+/i,''),m,subjectText=null,fields=[],qualifiers=[],distinguishing=false,identityCandidateText=null,requiresExactIdentity=false;
    const sourceActorMatch=new RegExp(`\\b${AUX}\\s+(.+?)\\s+(?:assign|assigns|give|gives|list|lists|recommend|recommends|record|records|describe|describes|place|places|put|puts|tell|tells|say|says)\\b`,'i').exec(q);
    const sourceActorText=sourceActorMatch&&(documentActor(sourceActorMatch[1])||/\b(?:character notes|profile|table row)$/i.test(sourceActorMatch[1]))?sourceActorMatch[1]:null;
    const localCondition=[...q.matchAll(/\s+((?:if|unless|once|when|after|before)\s+.+)$/gi)]
        .find(match=>!(lower(q.slice(0,match.index))==='from'&&/^when\b/i.test(match[1])));
    const localConditionTexts=localCondition?[localCondition[1]]:[];
    if(localCondition)q=q.slice(0,localCondition.index).trim();
    const decorate=result=>({...result,...(identityCandidateText?{identityCandidateText,requiresExactIdentity}:{}),stateText:q,fields:result.fields.map(value=>({...value,
        ...(sourceActorText?{sourceActorText}:{}),
        ...(localConditionTexts.length?{localConditionTexts:[...(value.localConditionTexts || []),...localConditionTexts],
            qualifierTexts:[...(value.qualifierTexts || []),...localConditionTexts],
            unknownQualifierTexts:[...(value.unknownQualifierTexts || []),...localConditionTexts]}:{})}))});
    // Alternative operators ask the source to choose; the parser never does.
    // Every full option remains independently scoped, including modifiers.
    const executionChoice=/^(?:is|are)\s+(.+?)\s+through\s+(.+?)\s+or\s+(.+)$/i.exec(q);
    if(executionChoice){
        const requested=nominalFields(executionChoice[1],clause);
        if(requested.length&&requested.every(value=>value.key==='identity'&&value.selectors.includes('execution-mode')))
            return decorate({subjectText:null,fields:readClause(`give ${executionChoice[1]}`).fields.map(value=>({...value,requestedText:clause,alternativeTexts:[executionChoice[2],executionChoice[3]],contrastText:'or'})),qualifiers});
    }
    const recipientChoice=/^(?:is|are)\s+(.+?)\s+(?:(?:described|listed|documented|recorded|available|provided|enabled)\s+)?for\s+(.+?)\s+alone,?\s+or\s+(?:for\s+)?(.+?)\s+too$/i.exec(q);
    if(recipientChoice){
        const requested=nominalFields(recipientChoice[1],clause);
        if(requested.length&&requested.every(value=>value.key!=='unknown'))
            return decorate({subjectText:null,fields:readClause(`give ${recipientChoice[1]}`).fields.map(value=>({...value,requestedText:clause,alternativeTexts:[recipientChoice[2],recipientChoice[3]],contrastText:'alone-or-too'})),qualifiers});
    }
    const modalPassive=/^how\s+(?:should|must|can|could|would)\s+(.+?)\s+be\s+(treated|described|listed|recorded|stated|documented|specified|given|qualified)\b(.*)$/i.exec(q);
    if(modalPassive){
        const nested=readClause(`how is ${modalPassive[1]} ${lower(modalPassive[2])==='treated'?'described':modalPassive[2]}${modalPassive[3]}`);
        if(nested)return decorate({...nested,fields:nested.fields.map(value=>({...value,requestedText:clause,governorText:modalPassive[2]}))});
        return null;
    }
    if(/^where(?:\s*,?\s*(?:to|for)\b|$)/i.test(q))return decorate({subjectText:null,fields:[field('location',null,clause,{qualifierTexts:[q.slice(5).trim()].filter(Boolean)})],qualifiers});
    if ((m=/^(?:point me to|show me)\s+(?:the )?(?:location|whereabouts)(?: listed)?\s+(?:for|of)\s+(.+)$/i.exec(q)))
        return decorate({subjectText:m[1],fields:[field('location',null,clause)],qualifiers});
    if((m=/^(?:what|who)(?:\s+(?:is|are|was|were)|'s)\s+(.+)$/i.exec(q))){
        const rhs=m[1],own=possessiveOwner(rhs),of=/^(.+?)\s+(?:of|for)\s+(.+)$/i.exec(rhs);
        const governs=head=>/\b(?:checksum|coefficient|identifier|flag|code|number|age|material|composition|metal|colou?r|height|width|depth|weight|name|role|focus|type|status|property|statistic|price|cost|rate|percentage|value)\b/i.test(head)||nominalFields(head,clause).length;
        const propertyHead=of&&governs(of[1]),possessiveHead=own&&governs(own.head);
        if(propertyHead||possessiveHead){const head=propertyHead?of[1]:own.head;subjectText=propertyHead?of[2]:own.subjectText;
            fields=nominalFields(head,clause);if(!fields.length)fields=[field('unknown',lower(head),clause,{fieldText:head,fieldHead:head})];
        }else{
            identityCandidateText=rhs;fields=nominalFields(rhs,clause);
            if(!fields.length){subjectText=rhs;requiresExactIdentity=!reference(rhs);fields=[field('identity',null,clause,{identityCandidateText:rhs,requiresExactIdentity})];}
            else for(const value of fields)value.identityCandidateText=rhs;
        }
    } else if ((m=/^(?:give|tell|show|describe|explain|quote|list|name|lay out)(?: me)?\s+(.+)$/i.exec(q))) {
        const complement=m[1];
        const focus=/^(?:what\s+)?(?:sets?|makes?)\s+(.+?)\s+(?:apart|distinct|different|special)$/i.exec(complement);
        if(!focus&&/^(?:what|which|where|who|whom|how|why|when)\b/i.test(complement)){
            // Indirect WH word order inside an imperative uses no do-support:
            // 'tell me what fields the station has'. Rewrite only that exact
            // structural operator; the full original request remains below.
            const indirect=/^(what|which)\s+(.+?)\s+((?:the|a|an|his|her|its|their|this|that)\s+.+?)\s+(has|have|provides|gives|requires|needs)$/i.exec(complement);
            const verb=indirect&&({has:'have',have:'have',provides:'provide',gives:'give',requires:'require',needs:'need'}[lower(indirect[4])]);
            const nested=readClause(indirect?`${indirect[1]} ${indirect[2]} does ${indirect[3]} ${verb}`:complement);
            if(nested)return decorate({...nested,fields:nested.fields.map(value=>({...value,requestedText:clause}))});
        }
        let head=focus?focus[1]:complement.replace(/^what\s+/i,'');distinguishing=!!focus;
        let locallyGovernedReplacement=false;
        const own=possessiveOwner(head);
        if(own){subjectText=own.subjectText;head=own.head;}
        else if((m=/^(.+?)\s+(for|of|about)\s+(.+)$/i.exec(head))){
            head=m[1];subjectText=m[3];
            const conjuncts=head.split(/,\s*|\s+(?:and|or)\s+/i),last=nominalFields(conjuncts.at(-1),clause);
            locallyGovernedReplacement=lower(m[2])==='for'&&conjuncts.length>1&&last.length>0&&last.every(value=>value.key==='identity'&&value.selectors.includes('replacement'));
        }
        fields=nominalFields(head,clause);
        if(locallyGovernedReplacement){
            const lastCount=nominalFields(head.split(/,\s*|\s+(?:and|or)\s+/i).at(-1),clause).length;
            for(const value of fields.slice(0,-lastCount))value.subjectMode='topic';
        }
        if(!fields.length)fields=[field('unknown',lower(head),clause)];
    } else if ((m=/^where\s+(.+)$/i.exec(q))) {
        const r=m[1]; let target,recognized=false,requiredLocation=null,transportLocation=null;
        if((target=/^(?:does|do|did)\s+(.+?)\s+(tell|tells)\s+(me|us)\s+to\s+(take|bring|return|deliver)\s+(.+)$/i.exec(r))){
            if(!documentActor(target[1])&&!/^(?:they|it|the notes|those notes|these notes)$/i.test(target[1])&&!/\b(?:character notes|profile|table row)$/i.test(target[1]))return null;
            const fullObject=target[5],tail=/\s+((?:to|into|for|with|without|via|through|in|on|at)\s+.+)$/i.exec(fullObject);
            subjectText=tail?fullObject.slice(0,tail.index):fullObject;recognized=true;
            transportLocation=field('location',null,clause,{sourceActorText:target[1],objectTexts:[subjectText],objectRole:'object',
                governorText:`${target[2]} ${target[3]} to ${target[4]}`,actionText:`${target[4]} ${fullObject}`});
            if(tail){qualifiers.push(tail[1]);transportLocation.argumentTexts=[tail[1]];}
        }
        else if(/^(?:does|do|did)\s+.+?\s+(?:tell|tells)\s+(?:me|us)\s+to\b/i.test(r))return null;
        else if((target=/^(?:does|do|did)\s+(.+?)\s+(mark|marks|list|lists|record|records|describe|describes)\s+(.+?)\s+as\s+(required|necessary|essential)\b(.*)$/i.exec(r))){
            if(!documentActor(target[1])&&!/^(?:they|it|the notes|those notes|these notes)$/i.test(target[1])&&!/\b(?:character notes|profile|table row)$/i.test(target[1]))return null;
            subjectText=target[3];recognized=true;
            requiredLocation=field('location','required',clause,{sourceActorText:target[1],governorText:`${target[2]} as ${target[4]}`});
            if(target[5].trim())qualifiers.push(target[5].trim());
        }
        else if(/^(?:does|do|did)\s+.+?\s+(?:mark|marks|list|lists|record|records|describe|describes)\s+.+?\s+as\b/i.test(r))return null;
        else if((target=/^(?:does|do|did)\s+(.+?)\s+(?:place|places|put|puts|locate|locates|mark|marks|tell)\s+(.+)$/i.exec(r))&&documentActor(target[1])){subjectText=target[2];recognized=true;}
        else if((target=/^(?:do|can|should|must)\s+(?:i|we)\s+(?:go|look|search|meet|find|recruit|take|bring|visit|stand|download)(?:\s+(?:for|to))?\s+(.+)$/i.exec(r))){subjectText=target[1];recognized=true;}
        else if((target=/^(?:is|are|was|were|does|do|should|can)\s+(.+)$/i.exec(r))){subjectText=ownerIn(target[1],qualifiers);recognized=true;}
        if(/^(?:do|can|should|must)\s+(?:i|we)\s+(?:stand|go|look|search|meet|find|recruit|take|bring|visit)\s*$/i.test(r)){subjectText=null;recognized=true;}
        if(!recognized)return null;
        fields=transportLocation?[transportLocation]:requiredLocation?[requiredLocation]:[field('location',/\brecruit/.test(lower(r))?'recruitment':null,clause)];
        if(/\bcoordinates\b/i.test(r))fields.push(field('location','coordinates',clause));
        if((target=/^(?:does|do|did)\s+(.+?)\s+invite\s+questions$/i.exec(r))){subjectText=target[1];fields=[field('support',null,clause,{governorText:'invite questions'})];}
        if(/^(?:do|can|should|must)\s+(?:i|we)\s+download\b/i.test(r))fields=[field('acquisition','download',clause,{actionText:r.replace(/^(?:do|can|should|must)\s+(?:i|we)\s+/i,'')})];
        const ownedLocation=subjectText&&possessiveOwner(subjectText);
        if(ownedLocation){const requested=nominalFields(ownedLocation.head,clause);
            if(requested.length&&requested.every(value=>value.key==='location')){subjectText=ownedLocation.subjectText;qualifiers.push(...requested.flatMap(value=>value.qualifierTexts || []));}}
        // A possessive concrete referent requires a directed ownership or
        // family-role resolver. Mentioning that role in a person's location
        // record is not proof that it locates the other person/object.
        if(/^(?:his|her|its|their)\s+\S/i.test(subjectText || ''))return null;
    } else if ((m=/^(?:who|whom|which (?:person|adventurer|technician|office|worker|maker|teacher|merchant|villager))\s+(.+)$/i.exec(q))) {
        let action=m[1];
        if((m=/^(?:do|should|can|must)\s+(?:i|we)\s+(.+)$/i.exec(action)))action=m[1];
        if(/\b(?:perform|give|deliver|hand|take|bring)\b.+\b(?:for|to)$/i.test(action))fields=[field('recipient',null,clause,{actionText:action})];
        else {const governed=governedField(action,clause);if(!governed)return null;fields=[governed];}
        const object=/^(?:made|creat(?:e|es|ed)|wrote|write(?:s)?|develop(?:s|ed)?|author(?:s|ed)?|design(?:s|ed)?|teach(?:es)?|suppl(?:y|ies)|sell(?:s)?|make(?:s)?|craft(?:s)?|provide(?:s)?|give(?:s)?|repair(?:s)?|receive(?:s)?|get(?:s)?|handle(?:s)?)\s+(.+)$/i.exec(action);
        if(object)subjectText=object[1];
        const argumentsRead=governedArguments(action);
        for(const value of fields){
            if(argumentsRead.texts.length)value.argumentTexts=argumentsRead.texts;
            if(argumentsRead.objectTexts.length)value.objectTexts=argumentsRead.objectTexts;
            value.objectRole=argumentsRead.objectRole || (value.key==='teacher'?'content':value.key==='creator'?'output':value.key==='recipient'?'content':'object');
            value.governorText=action.split(/\s+/)[0];
        }
        if(argumentsRead.outputText)subjectText=argumentsRead.outputText;
        if(/^(?:is|are)\s+/i.test(action)){fields=[field('identity',null,clause)];subjectText=action.replace(/^(?:is|are)\s+/i,'');}
    } else if ((m=/^why\s+(?:does|do|did|should|would|can)?\s*(.+)$/i.exec(q))) {
        subjectText=ownerIn(m[1].replace(/^(?:i|we)\s+/i,''),qualifiers);fields=[field('cause',null,clause,{actionText:m[1]})];
    } else if ((m=/^(?:when|from when)\s+(.*)$/i.exec(q))) {
        const predicate=m[1].replace(new RegExp(`^${AUX}\\s+`,'i'),'');
        const personal=/^(?:i|we)\s+(.+)$/i.exec(predicate),args=personal?governedArguments(personal[1]):{texts:[]};
        subjectText=personal?args.outputText || args.texts[0] || null:ownerIn(predicate,qualifiers);
        fields=[field('sequence',null,clause,{actionText:personal?personal[1]:m[1],...(args.texts.length?{argumentTexts:args.texts}:{})})];
    } else if ((m=/^how\s+(many|much|long|far|wide)\s+(.+)$/i.exec(q))) {
        const amount=m[1].toLowerCase(),r=m[2];
        fields=nominalFields(r.split(new RegExp(`\\s+${AUX}\\s+`,'i'))[0],clause);
        if(!fields.length)fields=[field('stats',amount==='long'?'duration':amount==='far'||amount==='wide'?'range':'quantity',clause)];
        const tail=new RegExp(`^.+?\\s+${AUX}\\s+(.+)$`,'i').exec(r);
        if(tail)subjectText=ownerIn(tail[1].replace(/^(?:i|we)\s+/i,''),qualifiers);
    } else if ((m=/^how\s+(?:do|can|should|must|would)\s+(?:i|we)\s+(.+)$/i.exec(q))) {
        const fullAction=m[1];
        const purpose=/\s+(to\s+(?:pick up|pick (?:it|them) up|collect|retrieve|reach|obtain|acquire|recover|find|enter|leave|escape|activate|repair|build|make|use)\b.*)$/i.exec(fullAction);
        const action=purpose?fullAction.slice(0,purpose.index):fullAction,operation=actionField(action,clause);if(!operation)return null;fields=[operation];
        if(purpose){operation.purposeTexts=[purpose[1]];operation.qualifierTexts=[purpose[1]];operation.actionText=fullAction;}
        subjectText=action.replace(/^(?:get to|get out of|set up|install|configure|download|get|fight|battle|attack|defeat|combat|counter|cross|traverse|reach|travel to|escape(?: from)?|return to|start|begin|finish|complete|prepare for|summon|launch|run|repair|craft|forge|make|build|assemble|use|collect|obtain|acquire|recruit|find|open|unlock|hide|store|deliver|follow)\s+/i,'');
        if(/^(?:cross|traverse)\s+/i.test(action)){operation.objectTexts=[subjectText];operation.objectRole='object';operation.governorText=action.split(/\s+/)[0];}
    } else if ((m=/^how\s+(?:is|are|was|were)\s+(.+)$/i.exec(q))) {
        const r=m[1];
        const metadata=/^(.+?)\s+(described|listed|recorded|stated|documented|specified|given|qualified)\b(.*)$/i.exec(r);
        let head=metadata?metadata[1]:r,hasFieldOwner=false;
        const own=possessiveOwner(head);
        if(own){subjectText=own.subjectText;head=own.head;hasFieldOwner=true;}
        else {
            const ofOwner=/^(.+?)\s+(?:of|for)\s+(.+)$/i.exec(head);
            if(ofOwner){head=ofOwner[1];subjectText=ofOwner[2];hasFieldOwner=true;}
            else subjectText=metadata?head:ownerIn(r,qualifiers);
        }
        if(metadata?.[3].trim())qualifiers.push(metadata[3].trim());
        fields=nominalFields(head,clause);
        if(metadata&&!fields.length&&hasFieldOwner)fields=[field('unknown',lower(head),clause,{fieldText:head,fieldHead:head})];
        else if(metadata?.[2].toLowerCase()==='qualified')fields=[field('limitations',null,clause,{fieldHead:head,qualifierTexts:fields.flatMap(value=>value.qualifierTexts || [])})];
        if(!fields.length)fields=metadata?[field('identity',null,clause)]:[field('method',/prepared/i.test(r)?'material-preparation':'step',clause)];
    } else if ((m=/^(?:what|which)\s+(.+)$/i.exec(q))) {
        const r=m[1];let head,tail;
        const split=new RegExp(`^(.+?)\\s+(${AUX})\\s+(.+)$`,'i').exec(r);
        const initialAux=new RegExp(`^(${AUX})\\s+(.+)$`,'i').exec(r);
        const answerGovernor=/^(.+?)\s+(gets?|takes?|leads?)\s+(me|us)\s+past\s+(.+)$/i.exec(r);
        const answerFields=answerGovernor?nominalFields(answerGovernor[1],clause):[];
        const instrument=/^(opens?|unlocks?)\s+(.+)$/i.exec(r);
        const placement=/^side\s+(?:gets?|takes?|receives?)\s+(.+)$/i.exec(r);
        const relational=/^(.+?)\s+(?:come(?:s)? with|accompany|accompanies|belong(?:s)? to|apply to|applies to)\s+(.+)$/i.exec(r);
        if(answerGovernor&&answerFields.length&&answerFields.every(value=>value.key==='method'&&value.selectors.includes('riddle-answer'))){
            fields=answerFields.map(value=>({...value,objectTexts:[answerGovernor[4]],objectRole:'object',governorText:`${answerGovernor[2]} ${answerGovernor[3]} past`,actionText:r}));
        }
        else if(instrument){subjectText=instrument[2];fields=[field('method','open',clause,{objectTexts:[instrument[2]],objectRole:'object',governorText:instrument[1],actionText:r})];}
        else if(placement){subjectText=placement[1];fields=[field('method','placement',clause,{objectTexts:[placement[1]],objectRole:'object',governorText:r.split(/\s+/)[1],actionText:r})];}
        else if(relational){head=relational[1];subjectText=relational[2];fields=nominalFields(head,clause);}
        else if(initialAux){
            const rest=initialAux[2],personal=/^(?:i|we)\s+(.+)$/i.exec(rest);
            if(personal){const action=personal[1];
                if(/^(?:say|ask|tell|mention)\b/i.test(action))return null;
                const operation=actionField(action,clause);if(!operation)return null;fields=[operation];
                subjectText=/\b(?:with|for|about)\s+(.+)$/i.exec(action)?.[1] || null;
            }else{
                const act=/^(.+?)\s+(do|provide|give|cost|need|require|open|unlock|say|ask|demand|produce|contain|shout|mention|chant|accept|make)\b(.*)$/i.exec(rest);
                if(act){subjectText=act[1];fields=[actionField(act[2]+act[3],clause)];
                    if(/\bneeded|required|necessary\b/i.test(act[3]))fields=[field('prerequisites',/\bto (?:build|compile|package|run|install)\b/i.test(act[3])?'condition':'materials',clause,{actionText:act[3]})];
                    if(act[2].toLowerCase()==='produce')fields=[field('outcome','artifact',clause,{actionText:act[3]})];
                    if(/\bmake .+ take (?:some )?time\b/i.test(rest))fields=[field('cause',null,clause,{actionText:act[3]})];
                    if(act[2].toLowerCase()==='accept')fields=[field('prerequisites','materials',clause,{actionText:act[3]})];
                }else{fields=nominalFields(rest,clause);subjectText=/\bof\s+(.+)$/i.exec(rest)?.[1] || null;}
            }
        }else if(split){head=split[1];tail=split[3];fields=nominalFields(head,clause);subjectText=ownerIn(tail,qualifiers);
            const modalOpening=/^(.+?)\s+(supposed|intended|meant)\s+to\s+(open|unlock)\b(.*)$/i.exec(tail);
            const openableHead=/\b(?:passages?|doors?|gates?|locks?|barriers?|chests?|objects?|things?)$/i.test(head);
            if(modalOpening&&openableHead){
                subjectText=modalOpening[1];qualifiers=[];
                const actionTail=modalOpening[4].trim();
                fields=[field('use','effect',clause,{fieldText:head,fieldHead:head,governorText:`${modalOpening[2]} to ${modalOpening[3]}`,
                    actionText:`${modalOpening[3]}${modalOpening[4]}`,qualifierTexts:[head,...(actionTail?[actionTail]:[])],
                    ...(actionTail&&!/^(?:to|for|with|without|in|on|at|through|via)\b/i.test(actionTail)?{objectTexts:[actionTail],objectRole:'object'}:{})})];
            }
            const personal=/^(?:i|we)\s+(.+)$/i.exec(tail);
            if(personal){subjectText=null;const args=governedArguments(personal[1]);for(const value of fields){value.actionText=personal[1];if(args.texts.length)value.argumentTexts=args.texts;}}
            if(/\battributes?\b/i.test(head)&&/\b(?:add|grant|give)\b/i.test(tail))fields=[field('use','bonus',clause)];
            if(/\bmade (?:of|from)\b/i.test(tail))fields=[field('composition',/\bmetal\b/i.test(head)?'metal':'material',clause)];
            if(!fields.length && /^(?:i|we)\s+/i.test(tail)){const action=tail.replace(/^(?:i|we)\s+/i,'');const operation=actionField(action,clause);if(!operation)return null;fields=[operation];subjectText=/\b(?:with|for|about)\s+(.+)$/i.exec(action)?.[1] || null;}
            if(!fields.length && /\b(?:open|unlock)\b/i.test(tail))fields=[field('use','effect',clause,{actionText:tail})];
        }else{head=r;fields=nominalFields(head,clause);const own=possessiveOwner(head);if(own)subjectText=own.subjectText;}
        if(!fields.length)fields=[field('unknown',lower(head || r),clause)];
    } else if ((m=/^(?:is|are|does|do|can|could|should|would|will|has|have)\s+(.+)$/i.exec(q))) {
        const r=m[1];fields=nominalFields(r,clause);subjectText=ownerIn(r,qualifiers);
        if(/\bmade (?:from|of)\b/i.test(r)||/\b(?:metal|material|composition)\b/i.test(r))fields=[field('composition','material',clause)];
        if(/\breplace\b|\bsubstitute\b/i.test(r))fields=[field('prerequisites','materials',clause,{actionText:r})];
        if(!fields.length)fields=[field('unknown',lower(r),clause)];
    } else {
        // A short noun-field follow-up inherits no facet; it asks the named
        // field afresh. Finite statements cannot enter this path.
        let head=q;const own=possessiveOwner(q);if(own){subjectText=own.subjectText;head=own.head;}
        const target=/^(.+?)\s+(?:of|for)\s+(.+)$/i.exec(head);
        if(target){head=target[1];subjectText=target[2];}
        fields=nominalFields(head,clause);
        if(!fields.length||/\b(?:is|are|was|were|has|have|did|does|do|will|can|should)\b/i.test(head)
            || !lower(bare(head)).startsWith(lower(fields[0].fieldText || '')))return null;
    }
    if(!fields.length||fields.some(value=>!value))return null;
    const ownerRead=sourceOwner(subjectText),propertyRead=propertyOwner(ownerRead.subjectText,fields);subjectText=propertyRead.subjectText;
    for(const value of fields){
        for(const key of ['metadataTexts','purposeTexts','qualifierTexts'])if(propertyRead[key])value[key]=[...(value[key] || []),...propertyRead[key]];
        if(propertyRead.governorText)value.governorText=propertyRead.governorText;
    }
    // Nominal request modifiers have typed semantics. Baseline and exactness
    // do not become asserted values; totals never authorize inferred sums.
    for(const value of fields){
        if(['method','acquisition','location'].includes(value.key)&&typeof value.actionText==='string'){
            const action=lower(value.actionText);
            const phase=[['approach',/^(?:reach|get to|travel to)\b/],['escape',/^(?:escape|leave|exit|get out of)\b/],
                ['return',/^(?:return to|get back to)\b/],['start',/^(?:start|begin)\b/],['follow',/^follow\b/],
                ['completion',/^(?:finish|complete)\b/],['acquisition',/^(?:get|obtain|acquire|recruit)\b/],
                ['preparation',/^(?:prepare for|get ready for)\b/]].find(([,pattern])=>pattern.test(action));
            if(phase)value.phase=phase[0];
        }
        if(!value.argumentTexts&&typeof value.actionText==='string'){const args=governedArguments(value.actionText);if(args.texts.length)value.argumentTexts=args.texts;}
        if(value.argumentTexts){
            value.fullArgumentTexts=[...value.argumentTexts];
            const ownerArgs=value.argumentTexts.filter(argument=>lower(bare(argument))===lower(bare(subjectText || '')));
            if(ownerArgs.length)value.ownerArgumentTexts=ownerArgs;
            value.argumentTexts=value.argumentTexts.filter(argument=>!ownerArgs.includes(argument));
        }
        const all=[...(value.qualifierTexts || []),...qualifiers];
        const provenanceTexts=[...ownerRead.provenanceTexts],unknownQualifierTexts=[];let baselineText=null,exact=false,total=false;
        for(const fragment of all){
            let rest=fragment;
            rest=rest.replace(/\b(?:starting|initial|base|baseline)\b/gi,word=>{baselineText=[baselineText,word].filter(Boolean).join(' ');return ' ';});
            rest=rest.replace(/\bexact(?:ly)?\b/gi,()=>{exact=true;return ' ';});
            rest=rest.replace(/\b(?:total|combined|sum|overall)\b/gi,()=>{total=true;return ' ';});
            rest=rest.replace(/\b(?:source|documented|listed|recorded|stated|main|guide-backed|in that table|in the table|according to the guide)\b/gi,word=>{provenanceTexts.push(word);return ' ';});
            rest=clean(rest);if(rest)unknownQualifierTexts.push(rest);
        }
        value.qualifiers={...(distinguishing?{distinguishing:true}:{}),...(baselineText?{baselineText}:{}),...(exact?{exact:true}:{}),...(total?{total:true}:{}),provenanceTexts};
        value.unknownQualifierTexts=[...new Set([...unknownQualifierTexts,...(value.argumentTexts || [])])];
    }
    // Capture a possessive field owner, but preserve all modifiers in the full
    // requested clause and qualifiers. No name is resolved here.
    if(!subjectText){const owner=possessiveOwner(q.replace(/^(?:what|which|how|give me|quote)\s+/i,''));if(owner)subjectText=owner.subjectText;}
    for(const value of fields){if(subjectText&&value.subjectMode!=='topic')value.subjectText=clean(subjectText);value.qualifierTexts=[...(value.qualifierTexts || []),...qualifiers];}
    return decorate({subjectText:subjectText?clean(subjectText):null,fields,qualifiers});
}

/**
 * Read structural source fields before owner resolution or ranking. All full
 * clauses, prefixes, constraints and unrecognized suffixes survive. Field
 * cardinality/names are requests, never asserted values or player state.
 * `complete` means every syntactic question was classified, not that its
 * subject, selectors or qualifiers are supported by any source.
 */
export function parseSourceRequestFrame(text) {
    if(typeof text!=='string'||!text.trim()||text.length>4096)return null;
    let body=clean(text),correction=false;const contextTexts=[],constraints={},constraintTexts=[],unresolvedTexts=[];
    body=body.replace(/^(?:(?:please|kindly|okay|ok|and|also|then)[,:]?\s+)+/i,'');
    if(/^(?:actually|correction|instead|no[, ]|i mean|i meant|switch to|change to|move on to|now\b)/i.test(body))correction=true;
    body=body.replace(/^(?:actually|correction|instead)[,:—-]?\s*/i,'');
    // Preambles are kept whole, including unknown source/edition/condition
    // names. No preamble is an observed event or a proved source restriction.
    let prefix;
    while((prefix=/^([^:;?]+?)(?:[:,—]|\.\s+(?=(?:where|what|which|who|how|why|when)\b))\s*(.+)$/i.exec(body))){
        const candidate=prefix[1].trim();
        if(START.test(candidate)&&!/^(?:i mean|i meant)\b/i.test(candidate))break;
        if(!/^(?:for|in|at|on|with|without|beyond|after|before|once|if|unless|when|according to|using only|from|regarding|about|as for|switch to|change to|move on to|now|i mean|i meant|i am asking about|i'm asking about|i need|i want)\b/i.test(candidate) && !(correction&&/\bi meant is\b/i.test(candidate)))break;
        contextTexts.push(candidate);constraintTexts.push(candidate);
        if(/^(?:if|unless|once|after|before|when)\b/i.test(candidate))constraints.conditionText=[constraints.conditionText,candidate].filter(Boolean).join('; ');
        if(/\b(?:edition|version)\b/i.test(candidate))constraints.editionText=[constraints.editionText,candidate].filter(Boolean).join('; ');
        if(/^(?:according to|using only|from)\b/i.test(candidate))constraints.sourceText=[constraints.sourceText,candidate].filter(Boolean).join('; ');
        body=prefix[2].trim();
    }
    const edition=[...body.matchAll(/\b(?:in|for|on)\s+(?:(?:the|a|an)\s+)?[^,;?]+?\s+(?:edition|version)\b/gi)].map(match=>match[0]);
    if(edition.length){constraints.editionText=[constraints.editionText,...edition].filter(Boolean).join('; ');constraintTexts.push(...edition);}
    const source=[...body.matchAll(/\baccording to\s+[^,;?]+|\busing only\s+[^,;?]+/gi)].map(match=>match[0]);
    if(source.length){constraints.sourceText=[constraints.sourceText,...source].filter(Boolean).join('; ');constraintTexts.push(...source);}
    const intentTexts=[];
    const neutralIntent=/\s+(when (?:i|we) (?:go |start |begin )?(?:looking|searching|look|search|try to find)\b[^?;]*)[?!.]*$/i.exec(body);
    if(neutralIntent){intentTexts.push(neutralIntent[1]);body=body.slice(0,neutralIntent.index).trim();}
    const comparison=/\b(?:highest|lowest|best|worst|better|worse|more than|less than|at least|at most)\b[^?;]*/i.exec(body);
    if(comparison){constraints.comparisonText=comparison[0];constraintTexts.push(comparison[0]);}
    const pieces=body.split(new RegExp(`\\s*(?:[?;]+|[.]\\s+(?=${WH}\\b)|,?\\s+(?:and|also|plus|but|then)\\s+(?=(?:${WH}|${IMPERATIVE})\\b)|,\\s*(?=${WH}\\b))\\s*`,'i')).map(end).filter(Boolean);
    if(!pieces.length)return null;
    const parsed=pieces.map((piece,index)=>{
        const inherited=index>0&&/^which\s+(?:gets?|takes?|receives?)\s+/i.test(piece)&&/^which side\s+(?:gets?|takes?|receives?)\s+/i.test(pieces[index-1]);
        const value=readClause(inherited?piece.replace(/^which\s+/i,'which side '):piece);
        if(inherited&&value)for(const slot of value.fields){slot.requestedText=piece;slot.inheritedFieldText='side';}
        return value;
    });if(parsed.every(value=>!value))return null;
    const fields=[];for(let i=0;i<parsed.length;i++){if(!parsed[i])unresolvedTexts.push(pieces[i]);else fields.push(...parsed[i].fields);}
    let subjectText=parsed.find(value=>value?.subjectText&&!reference(value.subjectText))?.subjectText || parsed.find(value=>value?.subjectText)?.subjectText || null;
    if(!subjectText&&contextTexts.length){
        const explicit=contextTexts.find(value=>/^(?:for|about|regarding|as for|switch to|change to|move on to|now|i need|i want|i mean|i meant|i am asking about|i'm asking about)\b/i.test(value));
        if(explicit)subjectText=explicit.replace(/^(?:for|about|regarding|as for|switch to|change to|move on to|now|i need|i want|i mean|i meant|i am asking about|i'm asking about)\s+/i,'').trim();
    }
    const identityCandidates=[...new Set(parsed.map(value=>value?.identityCandidateText).filter(Boolean))];
    const subjectCandidates=[...new Set([subjectText,...identityCandidates,...parsed.map(value=>value?.subjectText),...contextTexts].filter(Boolean))];
    const stateCore=parsed.map((value,index)=>value?.stateText || pieces[index]).join('; ');
    const stateQuestion=STATE.test(stateCore)||legacyPlayerStateQuestion(stateCore)
        || /\b(?:when|how) (?:did|have|had) (?:i|we)\b/i.test(stateCore);
    const report=REPORT.test(body)||contextTexts.some(value=>REPORT.test(value));
    for(const value of fields)if(value.key==='unknown')unresolvedTexts.push(value.fieldText || value.requestedText);
    const unique=[];for(const value of fields){const signature=JSON.stringify([value.key,value.selectors,value.subjectText || null,value.requestedText]);if(!unique.some(other=>other.signature===signature))unique.push({signature,value});}
    return {kind:'source-fields',originalText:text,subjectText,subjectCandidates,contextTexts,intentTexts,correction,
        ...(identityCandidates.length===1?{identityCandidateText:identityCandidates[0]}:{}),
        ...(parsed.length===1&&parsed[0]?.requiresExactIdentity?{requiresExactIdentity:true}:{}),
        fields:unique.map(value=>value.value),constraints,constraintTexts,
        complete:!unresolvedTexts.length&&fields.every(value=>value.key!=='unknown'),unresolvedTexts:[...new Set(unresolvedTexts)],
        staticEligible:!stateQuestion&&!report,playerStateQuestion:stateQuestion,report};
}
