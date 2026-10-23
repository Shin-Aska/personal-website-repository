import {modelRuntime} from './model-runtime.js';
import {CONSENT_KEY,readChoice,saveChoice} from './consent.js';
import {modelLoadingText} from './model-download.js';
const root=document.documentElement;
const storage=()=>{try{return window.localStorage;}catch{return null;}};
let config, choice=null, saved=true;
const el=(tag,text,parent)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent?.append(n);return n;};
const button=el('button','Assistant settings',document.body); button.type='button';button.id='guide-assistant-settings';
const dialog=el('dialog',undefined,document.body);dialog.id='guide-assistant-consent';
dialog.setAttribute('aria-labelledby','guide-assistant-consent-title');
const title=el('h2','Enable local guide chat?',dialog);title.id='guide-assistant-consent-title';
el('p',"This assistant runs on your device, inside your browser. Your questions aren't sent to an AI service.",dialog);
const size=el('p','Reading model settings…',dialog);
const status=el('p','Chat is off until you choose to enable it.',dialog);status.setAttribute('role','status');status.id='guide-assistant-model-status';
const progress=el('progress',undefined,dialog);progress.max=1;progress.value=0;progress.hidden=true;
progress.setAttribute('aria-label','Local chat files loaded');
const row=el('div',undefined,dialog);row.className='ga-consent-buttons';
const enable=el('button','Enable chat',row);enable.type='button';enable.disabled=true;
const off=el('button','Keep chat off',row);off.type='button';
const reset=el('button','Reset choice',row);reset.type='button';
const close=el('button','Close',row);close.type='button';
const show=()=>{if(!dialog.open)dialog.showModal();};
button.addEventListener('click',show);close.addEventListener('click',()=>dialog.close());
function privacyState(state) {
    root.dataset.guideChat=state;
    // Inert also covers keyboard focus and scripted clicks; CSS alone is not the gate.
    for (const n of document.querySelectorAll('[data-guide-chat-surface]')) n.inert=state!=='ready';
    document.dispatchEvent(new CustomEvent('guide-assistant-state',{detail:{status:state}}));
}
function paint(state) {
    const ready=state.status==='ready'&&choice==='enabled';
    privacyState(ready?'ready':choice==='enabled'?state.status:'off');
    button.textContent='Assistant settings';
    progress.hidden=!['loading','preparing'].includes(state.status)||choice!=='enabled';
    progress.value=state.total?state.loaded/state.total:0;
    enable.disabled=!config||['loading','preparing'].includes(state.status);
    enable.textContent=state.status==='error'?'Retry model loading':ready?'Chat enabled':'Enable chat';
    off.textContent=choice==='off'?'Chat kept off':'Keep chat off';
    status.textContent=choice!=='enabled'?'Chat is off. The guide and checklists remain available.'
        :state.status==='ready'?'Chat is ready. Questions stay in this browser.'+(state.persisted===false?' Downloaded files could not be saved for later visits.':'')
        :state.status==='loading'?modelLoadingText(state)
        :state.status==='preparing'?'Preparing local chat on this device…'
        :state.status==='error'?'The model could not load. Retry, or keep chat off and use the written guide.'
        :'Starting local chat…';
    if(!saved)status.textContent+=' This browser could not save your choice; you may be asked again next visit.';
    if(ready&&dialog.open)dialog.close();
}
modelRuntime.subscribe(paint);
function choose(value, persist=true) {
    choice=value;
    if(persist)saved=saveChoice(storage(),value,config?.id);
    if(value==='enabled'&&config)modelRuntime.start().catch(()=>{});
    else modelRuntime.stop();
    paint(modelRuntime.state);
    if(value!=='enabled'){
        const seer=document.getElementById('seer-modal');
        if(seer&&!seer.classList.contains('hidden')){document.getElementById('close-seer-modal')?.click();seer.classList.add('hidden');document.body.classList.remove('u6-seer-modal-open');}
        if(document.querySelector('#ai-modal .sage-panel'))document.getElementById('close-ai-modal')?.click();
        if(document.getElementById('counsel')?.classList.contains('active'))window.showUltima5Section?.('overview');
        if(document.getElementById('genie')?.classList.contains('active'))document.querySelector('#main-nav [data-target="briefing"]')?.click();
        if(document.querySelector('#ai-assistant:not(.hidden)'))document.querySelector('#main-nav a[href="#overview"]')?.click();
    }
    if(value==='off')dialog.close();
}
enable.addEventListener('click',()=>choose('enabled'));
off.addEventListener('click',()=>choose('off'));
reset.addEventListener('click',()=>{choose(null);show();});
window.addEventListener('storage',event=>{if(event.key===CONSENT_KEY||event.key===null){choose(readChoice(storage(),config?.id),false);if(choice===null)show();}});
// Explicitly tag static and subsequently generated chat surfaces, without hiding
// the shared U7 modal used by authored journals and other guide features.
const selector='.walkthrough-ai, #counsel, a[href="#counsel"], #genie, [data-target="genie"], #ai-assistant, a[href="#ai-assistant"], #seer-modal, .u6-seer-context-link, [data-seer-quest], [data-seer-side], [data-seer-marker], [data-seer-atlas], .get-main-quest-hint, .get-virtue-quest-hint, .get-side-quest-hint, .sage-panel';
function tag() {
    for(const n of document.querySelectorAll(selector))if(!n.hasAttribute('data-guide-chat-surface')){
        n.setAttribute('data-guide-chat-surface','');n.inert=root.dataset.guideChat!=='ready';
    }
}
new MutationObserver(tag).observe(document.body,{childList:true,subtree:true});tag();
paint(modelRuntime.state);
modelRuntime.profile().then(value=>{
    config=value;size.textContent=`Enabling chat downloads approximately ${Math.ceil(config.totalBytes/1e6)} MB of model files. Your browser can reuse them on later visits. This choice applies to all six guides on this site.`;
    choose(readChoice(storage(),config.id),false);if(choice===null)show();
}).catch(()=>{size.textContent='Model settings could not be read. Reload to try again; the guide remains available.';show();});
