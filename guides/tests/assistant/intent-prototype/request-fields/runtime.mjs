import {createEncoder} from '../encoder.mjs';
import {trainClassifier,evaluateClassifier,selectThresholds} from './classifier.mjs';
const encoder=createEncoder();
let head,thresholds,ontology,metadata;
const sha=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(x=>x.toString(16).padStart(2,'0')).join('');
async function checkedJSON(name,expected){
 const r=await fetch('./'+name,{redirect:'error'}); if(!r.ok)throw Error(`Missing ${name}`);
 const bytes=await r.arrayBuffer();if(await sha(bytes)!==expected)throw Error(`Frozen hash mismatch: ${name}`);
 return JSON.parse(new TextDecoder().decode(bytes));
}
export async function fit(){
 const started=performance.now(),frozen=await(await fetch('./frozen-inputs.json')).json();
 [ontology,head]=await Promise.all([checkedJSON('ontology.json',frozen.sha256['ontology.json']),Promise.resolve(null)]);
 const train=await checkedJSON('train.json',frozen.sha256['train.json']);
 const validation=await checkedJSON('validation.json',frozen.sha256['validation.json']);
 metadata=await encoder.start();
 const trainVectors=await encoder.embed(train.samples.map(x=>x.text));
 const validationVectors=await encoder.embed(validation.samples.map(x=>x.text));
 head=trainClassifier(train.samples,trainVectors,ontology.fitPolicy);
 const raw=evaluateClassifier(head,validation.samples,validationVectors);
 thresholds=selectThresholds(raw.perCase,ontology.thresholdPolicy);
 const evaluation=evaluateClassifier(head,validation.samples,validationVectors,thresholds);
 return {schemaVersion:1,kind:'isolated-request-field-head',frozen,ontology,model:metadata,head,thresholds,
  training:evaluateClassifier(head,train.samples,trainVectors),validation:evaluation,
  measurements:encoder.measurements,elapsedMs:performance.now()-started,
  qualification:'Ranking scores are uncalibrated. Validation selects abstention only; independent test must not change weights or thresholds.'};
}
export async function restore(saved){
 head=saved.head;thresholds=saved.thresholds;ontology=saved.ontology;
 metadata=await encoder.start();
 if(metadata.modelId!==saved.model.modelId||metadata.revision!==saved.model.revision)throw Error('Encoder does not match saved head');
 return metadata;
}
export async function evaluate(samples){
 if(!head)throw Error('Fit or restore first');
 const started=performance.now(),vectors=await encoder.embed(samples.map(s=>s.text),{cacheResults:false});
 return {raw:evaluateClassifier(head,samples,vectors),thresholded:evaluateClassifier(head,samples,vectors,thresholds),elapsedMs:performance.now()-started};
}
export function stop(){encoder.stop();}
