import {createEncoder} from './encoder.mjs';
import {trainClassifier,predictClassifier,evaluateClassifier,selectThresholds} from './classifier.mjs';
import {createInterpreter} from './interpreter.mjs';
import {createAssistant} from '../../../js/assistant/engine.js';
import {parse} from '../../../js/assistant/language.js';
import {authorize} from '../../../js/assistant/policy.js';
import {loadPrototypeRecords,presentSourceReply} from './source-responses.mjs';
import {createConsultation} from './consultation.mjs';

const $=id=>document.getElementById(id),encoder=createEncoder(),recordsCache=new Map();
let head,thresholds,modelMetadata,trainingMetadata,active,report=null,busy=false,selectionRevision=0,consultationCatalog=null;
const status=text=>{$('status').textContent=text;};
const read=async path=>{const r=await fetch(new URL(path,import.meta.url));if(!r.ok)throw new Error('Missing local lab file: '+path);return r.json();};
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))].map(v=>v.toString(16).padStart(2,'0')).join('');

async function recordsFor(gameId) {
    if(recordsCache.has(gameId))return recordsCache.get(gameId);
    const records=await loadPrototypeRecords(gameId);
    recordsCache.set(gameId,records);return records;
}
async function classify(text,selectedHead=head) {
    const [vector]=await encoder.embed([text]);
    return predictClassifier(selectedHead,vector);
}
async function session(gameId,selectedHead=head,selectedThresholds=thresholds) {
    const records=await recordsFor(gameId);
    if(!consultationCatalog)consultationCatalog=await read('./consultation-catalog.json');
    const base={gameId,records,getProgress:()=>[],fallback:null};
    const original=createAssistant(base),proposed=createAssistant(base);
    original.setPolicy('direct');proposed.setPolicy('direct');
    return {gameId,records,generation:0,original,proposed,
        interpreter:createInterpreter({gameId,records,classify:text=>classify(text,selectedHead),thresholds:selectedThresholds}),
        consultation:createConsultation({gameId,records,catalog:consultationCatalog})};
}
function originalIntent(text) {
    const p=parse(text),part=p.parts[0];
    if(part?.narrative?.aspect==='cause')return 'why';
    if(part?.intent==='explanation')return 'identity';
    if(part?.intent==='list')return 'overview';
    return part?.intent||'unknown';
}
async function prepare() {
    if(head)return modelMetadata;
    status('Preparing the pinned local MiniLM encoder…');
    const nextMetadata=await encoder.start();
    const [training,validation]=await Promise.all([read('./cases/training-v2.json'),read('./cases/validation-v2.json')]);
    const duplicate=training.samples.find(t=>validation.samples.some(v=>v.text.toLowerCase()===t.text.toLowerCase()));
    if(duplicate)throw new Error('Training and validation contain an identical text');
    status('Encoding training examples…');
    const trainVectors=await encoder.embed(training.samples.map(s=>s.text),{onProgress:(done,total)=>status(`Encoding training examples: ${done}/${total}`)});
    const started=performance.now(),nextHead=trainClassifier(training.samples,trainVectors);
    const fitMs=performance.now()-started;
    const validationVectors=await encoder.embed(validation.samples.map(s=>s.text),{onProgress:(done,total)=>status(`Encoding validation examples: ${done}/${total}`)});
    const raw=evaluateClassifier(nextHead,validation.samples,validationVectors);
    const nextThresholds=selectThresholds(raw.perCase,{targetAccuracy:0.9,minAccepted:6});
    const nextTraining={dataset:'followup-v2',trainingSamples:training.samples.length,validationSamples:validation.samples.length,
        trainingHash:await hash(training),validationHash:await hash(validation),headHash:await hash(nextHead),
        encoderFineTuned:false,headTraining:nextHead.training,fitMs,thresholds:nextThresholds,
        trainingMetrics:evaluateClassifier(nextHead,training.samples,trainVectors).metrics,
        validationMetrics:evaluateClassifier(nextHead,validation.samples,validationVectors,nextThresholds).metrics};
    let nextSession;
    for(let attempt=0;attempt<8;attempt++){
        const ticket=selectionRevision,gameId=$('game').value;
        nextSession=await session(gameId,nextHead,nextThresholds);
        if(ticket===selectionRevision&&gameId===$('game').value)break;
        nextSession=null;
    }
    if(!nextSession)throw new DOMException('Guide selection kept changing during preparation; retry.','AbortError');
    // Publish prepared state only when model, validation and guide sources all succeed.
    head=nextHead;thresholds=nextThresholds;modelMetadata=nextMetadata;trainingMetadata=nextTraining;active=nextSession;
    $('question').disabled=false;$('send').disabled=false;$('evaluate').disabled=false;$('evaluate-followups').disabled=false;$('evaluate-consultations').disabled=false;$('prepare').disabled=true;
    status(`Local encoder ready. Linear head fitted to ${training.samples.length} training examples; thresholds selected on ${validation.samples.length} validation examples.`);
    return modelMetadata;
}
function summarized(reply) {
    return {decision:reply.decision,text:reply.text,recordIds:reply.recordIds,sources:reply.sources,stateChanges:reply.stateChanges,
        ...(reply.sourceLinks?{sourceLinks:reply.sourceLinks}:{}),...(reply.sourcePresentation?{sourcePresentation:reply.sourcePresentation}:{})};
}
async function askIn(target,text,opts={spoiler:'direct'}) {
    const generation=target.generation,started=performance.now();
    const packet=await target.interpreter.interpret(text,opts);
    const interpretMs=performance.now()-started;
    if(target.generation!==generation||packet.transition==='stale')
        throw new DOMException('Discarded an interpretation after the topic or settings changed.','AbortError');
    const baseline=target.original.answer(text,opts);
    const previousConsultation=target.consultation.inspect();
    let consultation=target.consultation.plan(text,packet,opts);
    const currentConsultation=target.consultation.inspect();
    if(!consultation&&currentConsultation.editionId&&currentConsultation.editionId!==previousConsultation.editionId){
        const gameCatalog=consultationCatalog.games[target.gameId];
        const edition=gameCatalog.editions.find(item=>item.id===currentConsultation.editionId);
        consultation={reply:{decision:'clarify',text:`I'll keep ${edition.label} in mind for this chat. Which goal matters most: ${gameCatalog.criteria.map(item=>item.label).join(', ')}?`,
            recordIds:[],sources:[],stateChanges:[]},context:currentConsultation,routeOrigin:'context-statement',reason:'edition-context-recorded'};
    }
    if(consultation){
        const reply=consultation.reply;
        if(reply.recordIds.some(id=>!target.records.some(record=>record.id===id&&authorize(record,opts.spoiler)))||reply.stateChanges?.length)
            throw new Error('Consultation escaped its source/progress boundary');
        target.proposed.resetTopic();
        if(consultation.focusEntityId&&!target.interpreter.focusSubject(consultation.focusEntityId,{...opts,guideOnly:consultation.context?.guideOnly||packet.restrictions?.guideOnly}))
            throw new Error('Consultation selected an unavailable subject');
        const focus=target.interpreter.getState().subject;
        return {text,packet:{...packet,status:'consultation',routeOrigin:consultation.routeOrigin,
            entityId:consultation.focusEntityId||null,entityTitle:consultation.reply.title||null,
            consultation:{reason:consultation.reason,context:consultation.context,criterionId:consultation.criterionId,
                recommendationEntityId:consultation.recommendationEntityId||null,focusEntityId:focus?.entityId||null}},
            interpretMs,totalMs:performance.now()-started,submittedToEngine:null,engineSkipped:true,
            baseline:summarized(baseline),proposed:summarized(reply)};
    }
    // Protected/uncertain interpretations always preserve the original message.
    const proposedText=packet.status==='ready'&&packet.canonicalQuestion?packet.canonicalQuestion:text;
    const clarification=packet.candidates?.length?`Did you mean ${packet.candidates.map(candidate=>candidate.title).join(' or ')}?`
        :packet.blockReplay?'That follow-up still carries restrictions from your previous question. Please include the subject and those restrictions in a complete question.':null;
    // One dialogue authority: the interpreter supplies the current subject.
    // The proposed source reader cannot retain an older, contradictory referent.
    target.proposed.resetTopic();
    const engineReply=clarification?{decision:'clarify',text:clarification,recordIds:[],sources:[],stateChanges:[],origin:'dialogue-policy'}
        :target.proposed.answer(proposedText,{...opts,entityIds:packet.entityId?[packet.entityId]:[]});
    const proposed=presentSourceReply(engineReply,packet,target.records,opts);
    const unauthorized=proposed.recordIds.filter(id=>!target.records.some(r=>r.id===id&&authorize(r,opts.spoiler)));
    if(unauthorized.length||(packet.status==='ready'&&proposed.stateChanges?.length))throw new Error('Prototype reply escaped its source/progress boundary');
    return {text,packet,interpretMs,totalMs:performance.now()-started,submittedToEngine:clarification?null:proposedText,
        engineSkipped:Boolean(clarification),baseline:summarized(baseline),proposed:summarized(proposed)};
}
function reset(target){target.generation++;target.interpreter.resetTopic();target.consultation.reset();target.original.resetTopic();target.proposed.resetTopic();}
async function setGame(gameId) {
    if(!['ultima7','starcraft'].includes(gameId))throw new Error('Unsupported prototype guide');
    const ticket=++selectionRevision;
    if(active)reset(active);
    active=null;$('game').value=gameId;$('chat').replaceChildren();
    if(!head)return;
    const next=await session(gameId);
    if(ticket!==selectionRevision)throw new DOMException('A newer guide selection replaced this one.','AbortError');
    active=next;
}
async function ask(text) {
    if(!active)throw new Error('Prepare a guide session first');
    const target=active,generation=target.generation;
    // The chat has one answer mode. Query parameters and legacy controls cannot
    // lower it; explicit lower ceilings belong only to isolated source fixtures.
    const turn=await askIn(target,text,{spoiler:'direct',fullAnswersOnly:true});
    if(target!==active||target.generation!==generation)
        throw new DOMException('Discarded a reply after the guide or settings changed.','AbortError');
    render(turn);return turn;
}
function render(turn) {
    const card=document.createElement('article');card.className='turn';
    const title=document.createElement('strong');title.textContent='You: '+turn.text;card.append(title);
    const answer=document.createElement('section');answer.className='prototype-answer';card.append(answer);
    const body=document.createElement('p');body.style.whiteSpace='pre-line';body.textContent=turn.proposed.text;answer.append(body);
    for(const link of turn.proposed.sourceLinks||[]){
        const url=new URL(link.url);if(!['https:','http:'].includes(url.protocol))continue;
        const a=document.createElement('a');a.href=url.href;a.textContent=link.text||url.href;
        a.target='_blank';a.rel='noopener noreferrer';answer.append(a,document.createElement('br'));
    }
    let sourceParent=answer;
    if(turn.packet.status==='consultation'&&(turn.proposed.sources||[]).length>2){
        const sources=document.createElement('details'),label=document.createElement('summary');
        label.textContent=`Sources from this guide (${turn.proposed.sources.length} passages)`;sources.append(label);answer.append(sources);sourceParent=sources;
    }
    for(const source of turn.proposed.sources||[]){
        const small=document.createElement('small');small.className='source-line';
        small.textContent=source.review==='external-research'?'Outside research: ':'Source: existing guide.';
        if(source.review==='external-research')small.textContent+=(source.references||[]).map(r=>`${r.label||''} ${r.url||''}`).join('; ');
        else small.textContent+=' '+[source.file,source.locator].filter(Boolean).join(' — ');
        sourceParent.append(small,document.createElement('br'));
    }
    const details=document.createElement('details'),summary=document.createElement('summary'),debug=document.createElement('pre');
    summary.textContent='Compare interpretation and current guide';
    debug.textContent=JSON.stringify({interpretation:turn.packet,currentGuide:turn.baseline,prototype:turn.proposed},null,2);
    details.append(summary,debug);card.append(details);
    $('chat').append(card);card.scrollIntoView({block:'nearest'});
}
async function evaluate() {
    if(!head)throw new Error('Prepare the model first');
    const evaluation=await read('./cases/evaluation.json');
    const train=await read('./cases/training-v2.json'),validation=await read('./cases/validation-v2.json');
    const seen=new Set([...train.samples,...validation.samples].map(s=>s.text.toLowerCase().trim()));
    if(evaluation.cases.some(s=>seen.has(s.text.toLowerCase().trim())))throw new Error('An evaluation text occurs in fitting data');
    status('Running the frozen evaluation with real MiniLM embeddings…');
    const vectors=await encoder.embed(evaluation.cases.map(c=>c.text),{onProgress:(done,total)=>status(`Evaluating new examples: ${done}/${total}`)});
    const classification=evaluateClassifier(head,evaluation.cases,vectors,thresholds);
    const cases=[];
    for(const item of evaluation.cases){
        const target=await session(item.gameId),result=await askIn(target,item.text,{spoiler:item.options?.spoiler||'direct'});
        cases.push({id:item.id,gameId:item.gameId,expected:item,result,parserIntent:originalIntent(item.text)});
    }
    const dialogues=[];
    for(const dialogue of evaluation.dialogues){
        const target=await session(dialogue.gameId),turns=[];let spoiler='direct';
        for(const [index,turn] of dialogue.turns.entries()){
            if(turn.action==='resetTopic')reset(target);
            if(turn.options?.spoiler)spoiler=turn.options.spoiler;
            const result=await askIn(target,turn.text,{spoiler});
            turns.push({id:`${dialogue.id}:${index+1}`,expected:turn,result,
                intentMatches:result.packet.intent===turn.intent,
                entityMatches:!turn.entityTitle||result.packet.entityTitle?.toLowerCase().replace(/^the /,'')===turn.entityTitle.toLowerCase().replace(/^the /,'')});
        }
        dialogues.push({id:dialogue.id,gameId:dialogue.gameId,turns});
    }
    const latency=[];
    // Dedicated uncached single-question inference; no cached training/eval timing claim.
    for(const text of ['Who is Lord British?','What does SCHNAIL do?','How do I install BWAPI?','Where is Iolo?']){
        const started=performance.now();await encoder.embed([text],{cacheResults:false});latency.push({text,ms:performance.now()-started});
    }
    report={schema:1,checkedAt:new Date().toISOString(),scope:['ultima7','starcraft'],realModelInference:true,
        model:modelMetadata,training:trainingMetadata,evaluationHash:await hash(evaluation),classification,cases,dialogues,
        parserAgreement:{correct:cases.filter(c=>c.parserIntent===c.expected.label).length,total:cases.length,
            caveat:'Mapped raw-parser intent agreement only; aliases, source indexes and full production answer accuracy are separate.'},
        dialogueIntentMatches:dialogues.flatMap(d=>d.turns).filter(t=>t.intentMatches).length,
        dialogueEntityMatches:dialogues.flatMap(d=>d.turns).filter(t=>t.entityMatches).length,
        dialogueTurns:dialogues.flatMap(d=>d.turns).length,singleQuestionInference:latency,
        limitations:['Frozen MiniLM encoder; only a small linear classification head is trained. No SetFit encoder fine-tuning.',
            'Authored held-out language, not blind organic user conversations. Classifier scores are uncalibrated.',
            'Subject matching and conversation state are explicit code. Safe source replay remains conservative.',
            'Correct intent does not establish answer correctness or fill missing lore. No production runtime is changed.']};
    $('summary').textContent=JSON.stringify({classification:classification.metrics,parserAgreement:report.parserAgreement,
        dialogueIntentMatches:report.dialogueIntentMatches,dialogueEntityMatches:report.dialogueEntityMatches,dialogueTurns:report.dialogueTurns,
        singleQuestionInference:latency},null,2);
    $('save').disabled=false;status('Evaluation complete. Inspect errors, abstentions and source replies before judging the prototype.');
    return report;
}
async function evaluateFollowups() {
    if(!head)throw new Error('Prepare the model first');
    const corpus=await read('./cases/followup-evaluation.json'),dialogues=[];
    let total=0;
    for(const dialogue of corpus.dialogues){
        const target=await session(dialogue.gameId),turns=[];let spoiler='direct';
        for(const [index,turn] of dialogue.turns.entries()){
            if(turn.action==='resetTopic')reset(target);
            if(turn.options?.spoiler)spoiler=turn.options.spoiler;
            const result=await askIn(target,turn.text,{spoiler}),reply=result.proposed,problems=[];
            const same=(a,b)=>a?.toLowerCase().replace(/^the /,'')===b?.toLowerCase().replace(/^the /,'');
            const subjectMatches=turn.transition==='pending'
                ?result.packet.candidates?.some(candidate=>same(candidate.title,turn.entityTitle))
                :same(result.packet.entityTitle,turn.entityTitle);
            if(turn.entityTitle&&!subjectMatches)problems.push('Expected conversational subject '+turn.entityTitle);
            if(turn.supported===true&&reply.decision!=='answer')problems.push('Expected a sourced answer');
            if(turn.requireDecline&&reply.decision==='answer')problems.push('Unsupported or restricted request was answered');
            for(const text of turn.replyContains||[])if(!reply.text.toLowerCase().includes(text.toLowerCase()))problems.push('Missing answer text: '+text);
            for(const text of turn.replyAbsent||[])if(reply.text.toLowerCase().includes(text.toLowerCase()))problems.push('Unexpected answer text: '+text);
            const equivalentSource=(turn.expectedRecordIds||[]).some(expectedId=>{
                const expected=target.records.find(record=>record.id===expectedId),expectedVisible=expected&&authorize(expected,spoiler);
                if(!expectedVisible)return false;
                const expectedSource=expectedVisible.source?.basedOn||expectedVisible.source;
                return reply.recordIds.some(id=>{
                    const actual=target.records.find(record=>record.id===id),visible=actual&&authorize(actual,spoiler),source=visible?.source?.basedOn||visible?.source;
                    return visible&&source?.file===expectedSource?.file&&source?.locator===expectedSource?.locator&&visible.text===expectedVisible.text;
                });
            });
            if((turn.expectedRecordIds||[]).length&&!turn.expectedRecordIds.some(id=>reply.recordIds.includes(id))&&!equivalentSource)problems.push('Expected source record not selected');
            const renderedUrls=[...(reply.sourceLinks||[]).map(link=>link.url),...(reply.sources||[]).flatMap(source=>source.references||[]).map(ref=>ref.url)];
            for(const url of turn.expectedUrls||[])if(!renderedUrls.includes(url))problems.push('Expected source URL absent: '+url);
            if(reply.decision==='answer'&&(!reply.recordIds.length||!reply.sources.length))problems.push('Answer lacks source identifiers');
            turns.push({id:`${dialogue.id}:${index+1}`,expected:turn,result,spoiler,
                intentMatches:(result.packet.modelIntent??null)===turn.intent,resolvedIntentMatches:result.packet.intent===turn.intent,
                passed:problems.length===0,problems});
            total++;status('Checking conversation follow-ups: '+total+' turns');
        }
        dialogues.push({id:dialogue.id,gameId:dialogue.gameId,category:dialogue.category,turns});
    }
    const turns=dialogues.flatMap(d=>d.turns);
    const followups={schema:1,checkedAt:new Date().toISOString(),datasetHash:await hash(corpus),training:trainingMetadata,
        realModelInference:true,dialogues,total:turns.length,passed:turns.filter(t=>t.passed).length,
        intentMatches:turns.filter(t=>t.intentMatches).length,resolvedIntentMatches:turns.filter(t=>t.resolvedIntentMatches).length,
        routeOrigins:Object.fromEntries([...new Set(turns.map(t=>t.result.packet.routeOrigin||'unspecified'))].map(origin=>[origin,turns.filter(t=>(t.result.packet.routeOrigin||'unspecified')===origin).length])),
        failures:turns.filter(t=>!t.passed).map(t=>({id:t.id,text:t.result.text,problems:t.problems})),
        caveat:'Known reported regressions and fresh authored follow-ups are separate categories. Model label correctness and source-backed behavior are separate checks.'};
    report={...report,followups};$('save').disabled=false;
    $('summary').textContent=JSON.stringify({followupTurns:followups.total,behaviorPassed:followups.passed,modelIntentMatches:followups.intentMatches,
        resolvedIntentMatches:followups.resolvedIntentMatches,routeOrigins:followups.routeOrigins,failures:followups.failures},null,2);
    status('Follow-up checks complete; inspect failed cases as well as passes.');
    return followups;
}
async function evaluateConsultations() {
    if(!head)throw new Error('Prepare the model first');
    const corpus=await read('./cases/consultation-evaluation.json'),dialogues=[];
    for(const dialogue of corpus.dialogues){
        let target=await session(dialogue.gameId),spoiler='direct';const turns=[];
        for(const [index,turn] of dialogue.turns.entries()){
            const e=turn.expected,problems=[];
            if(turn.action){
                // Historical lower-tier cases validate source authorization in
                // private sessions. There is no corresponding chat UI control.
                if(turn.action==='setHelp'){spoiler=turn.value;reset(target);target.original.setPolicy(spoiler);target.proposed.setPolicy(spoiler);}
                else if(turn.action==='resetTopic')reset(target);
                else if(turn.action==='setGame'){reset(target);target=await session(turn.value);}
                else throw new Error('Unknown consultation control');
                const state=target.interpreter.getState(),consultation=target.consultation.inspect();
                if(e.focusCleared&&state.subject)problems.push('Control retained the old subject');
                if(e.editionCleared&&consultation.editionId)problems.push('Game change retained an edition');
                turns.push({id:`${dialogue.id}:${index+1}`,expected:e,action:turn.action,
                    controlScope:turn.action==='setHelp'?'internal-source-policy-fixture':'session',passed:!problems.length,problems,state,consultation});
                continue;
            }
            if(turn.options?.spoiler)spoiler=turn.options.spoiler;
            const result=await askIn(target,turn.text,{spoiler}),reply=result.proposed,packet=result.packet;
            const selection=packet.consultation?.recommendationEntityId||null;
            if(e.supported===true&&reply.decision!=='answer')problems.push('Expected a sourced answer');
            if(e.supported===false&&reply.decision==='answer')problems.push('Unsupported consultation produced a factual selection');
            if(e.requireClarify&&reply.decision!=='clarify')problems.push('Expected a focused clarification');
            if(e.recommendationEntityId&&selection!==e.recommendationEntityId)problems.push('Wrong recommended entity');
            if(e.allowedRecommendationEntityIds&&selection&&!e.allowedRecommendationEntityIds.includes(selection))problems.push('Unmodeled recommendation');
            if(e.noRecommendation&&selection)problems.push('Unexpected recommendation');
            if(e.focusEntityId&&packet.entityId!==e.focusEntityId)problems.push('Follow-up lost the recommended subject');
            for(const text of e.replyContains||[])if(!reply.text.toLowerCase().includes(text.toLowerCase()))problems.push('Missing text: '+text);
            for(const choices of e.replyContainsAny||[])if(!choices.some(text=>reply.text.toLowerCase().includes(text.toLowerCase())))problems.push('Missing expected tradeoff: '+choices.join(' / '));
            for(const text of e.replyAbsent||[])if(reply.text.toLowerCase().includes(text.toLowerCase()))problems.push('Unexpected text: '+text);
            if(reply.decision==='answer'){
                for(const choices of e.replyContainsAnyWhenAnswer||[])if(!choices.some(text=>reply.text.toLowerCase().includes(text.toLowerCase())))problems.push('Missing conditional alternative: '+choices.join(' / '));
                if((e.sourceRequired||e.sourceRequiredWhenAnswer)&&(!reply.recordIds.length||!reply.sources.length))problems.push('Recommendation lacks source evidence');
            }
            const urls=(reply.sourceLinks||[]).map(link=>link.url);
            for(const url of e.expectedUrls||[])if(!urls.includes(url))problems.push('Missing source URL: '+url);
            for(const url of e.absentUrls||[])if(urls.includes(url))problems.push('Crossed option download URL');
            if(e.sourceLinkCount!==undefined&&urls.length!==e.sourceLinkCount)problems.push('Wrong source link count');
            if(e.noExternalResearch&&reply.sources.some(source=>source.review==='external-research'))problems.push('Guide-only request used research');
            if(e.noStateChanges&&reply.stateChanges?.length)problems.push('Consultation changed progress or party state');
            turns.push({id:`${dialogue.id}:${index+1}`,expected:e,result,passed:!problems.length,problems});
        }
        dialogues.push({id:dialogue.id,gameId:dialogue.gameId,category:dialogue.category,turns});
    }
    const turns=dialogues.flatMap(dialogue=>dialogue.turns);
    const consultations={schema:1,checkedAt:new Date().toISOString(),datasetHash:await hash(corpus),training:trainingMetadata,
        realModelInference:true,dialogues,total:turns.length,passed:turns.filter(turn=>turn.passed).length,
        failures:turns.filter(turn=>!turn.passed).map(turn=>({id:turn.id,text:turn.result?.text,problems:turn.problems})),
        caveat:'Model labels, explicit consultation vocabulary and source-verified decision policy are separate. These tests establish bounded authored behavior, not model reasoning or a universal ranking. Lower-tier cases are internal source-authorization fixtures; public chat requests always use direct answers.'};
    report={...report,consultations};$('save').disabled=false;
    $('summary').textContent=JSON.stringify({consultationChecks:consultations.total,passed:consultations.passed,failures:consultations.failures},null,2);
    status('Consultation checks complete. Preferences and source evidence remain separate from game progress.');
    return consultations;
}
async function run(action){if(busy)return;busy=true;$('question').disabled=true;$('send').disabled=true;try{return await action();}catch(error){status(error.message);throw error;}finally{busy=false;$('question').disabled=!head;$('send').disabled=!head;}}
$('prepare').onclick=()=>run(prepare).catch(()=>{});
$('evaluate').onclick=()=>run(evaluate).catch(()=>{});
$('evaluate-followups').onclick=()=>run(evaluateFollowups).catch(()=>{});
$('evaluate-consultations').onclick=()=>run(evaluateConsultations).catch(()=>{});
$('question-form').onsubmit=event=>{event.preventDefault();if(busy||!$('question').value.trim()||!active)return;const text=$('question').value.trim();$('question').value='';run(()=>ask(text)).catch(()=>{});};
$('reset').onclick=()=>{if(active)reset(active);$('chat').replaceChildren();};
$('game').onchange=()=>setGame($('game').value).catch(error=>status(error.message));
$('save').onclick=()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='intent-prototype-evaluation.json';a.click();URL.revokeObjectURL(url);};
window.intentPrototype={prepare,evaluate,evaluateFollowups,evaluateConsultations,ask,setGame,reset:()=>active&&reset(active),inspect:()=>active&&({gameId:active.gameId,
    generation:active.generation,originalPolicy:active.original.policy,proposedPolicy:active.proposed.policy,
    originalMessages:active.original.getHistory().length,proposedMessages:active.proposed.getHistory().length,
    interpreter:active.interpreter.getState(),consultation:active.consultation.inspect()}),get report(){return report;},get head(){return head;},get thresholds(){return thresholds;}};
