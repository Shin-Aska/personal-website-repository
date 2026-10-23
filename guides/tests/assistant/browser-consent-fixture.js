// Legacy guide-UI regressions explicitly opt in and use a small worker fixture.
// Real model/consent/cache behavior is tested separately in model-consent-browser.py.
// Only this assistant worker is replaced; no provider or inference network is allowed.
if(location.protocol==='http:'||location.protocol==='https:')localStorage.setItem('guide-assistant.preference.v1', JSON.stringify({schema:1,choice:'enabled',modelId:__MODEL_ID__}));
const OriginalWorker=window.Worker;
window.Worker=class {
    constructor(url,options) {
        if(!String(url).includes('/assistant/model-worker.js'))return new OriginalWorker(url,options);
        this.stopped=false;
    }
    postMessage(data) {
        const text={reason:"I don't have a sourced explanation for that here.",detail:"I don't have a sourced answer to that detail here.",rephrase:"Here's the guide's wording."}[data.kind];
        setTimeout(()=>{if(!this.stopped)this.onmessage?.({data:data.type==='load'?{type:'ready',persisted:true}:{type:'result',id:data.id,text}});},0);
    }
    terminate(){this.stopped=true;}
};
