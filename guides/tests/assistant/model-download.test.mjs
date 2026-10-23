import test from 'node:test';
import assert from 'node:assert/strict';
import {createDownloadProgress,readModelResponse,modelLoadingText} from '../../js/assistant/model-download.js';
import {createModelRuntime} from '../../js/assistant/model-runtime.js';

test('received bytes advance before a whole model part finishes',async()=>{
 let push;const events=[];
 const response=new Response(new ReadableStream({start(c){push=c;}}));
 const pending=readModelResponse(response,6,n=>events.push(n));
 push.enqueue(new Uint8Array([1,2]));await new Promise(r=>setTimeout(r,0));
 assert.deepEqual(events,[2]);push.enqueue(new Uint8Array([3,4,5,6]));push.close();
 assert.deepEqual([...new Uint8Array(await pending)],[1,2,3,4,5,6]);assert.deepEqual(events,[2,4]);
});
for(const [name,size]of [['truncated',4],['oversized',2]])test(name+' response fails closed',async()=>{
 let cancelled=false;
 const response=new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([1,2,3]));if(size===4)c.close();},cancel(){cancelled=true;}}));
 await assert.rejects(readModelResponse(response,size,()=>{}),/integrity/);
 if(size===2)assert.equal(cancelled,true);
});
test('response stream failures remain failures and release the reader',async()=>{
 const response=new Response(new ReadableStream({start(c){c.error(Error('interrupted'));}}));
 await assert.rejects(readModelResponse(response,4,()=>{}),/interrupted/);assert.equal(response.body.locked,false);
});
test('non-streaming fallback checks size and accounts for exact bytes',async()=>{
 const events=[];assert.equal((await readModelResponse({arrayBuffer:async()=>new ArrayBuffer(3)},3,n=>events.push(n))).byteLength,3);
 assert.deepEqual(events,[3]);await assert.rejects(readModelResponse({arrayBuffer:async()=>new ArrayBuffer(2)},3,()=>{}),/integrity/);
});
test('cache bytes advance overall progress but never count toward download speed',()=>{
 let time=0;const p=createDownloadProgress(10e6,()=>{},()=>time);
 p.cached(6e6);time=10000;p.plan(4e6);p.begin();time+=1000;p.received(1e6);
 assert.deepEqual(p.snapshot(),{loaded:7e6,total:10e6,cached:6e6,downloaded:1e6,downloadTotal:4e6,speedBps:1e6});
});
test('speed includes transfer stalls and excludes verification/cache-write time between files',()=>{
 let time=0;const p=createDownloadProgress(4e6,()=>{},()=>time);p.plan(4e6);p.begin();time=1000;p.received(1e6);
 assert.equal(p.snapshot().speedBps,1e6);time=2000;assert.equal(p.snapshot().speedBps,.5e6);p.end();
 time=12000;p.begin();time=13000;p.received(2e6);p.end();assert.equal(p.snapshot().speedBps,1e6);
});
test('speed is unknown until measurable and cached-only loads have no rate',()=>{
 let time=0;const p=createDownloadProgress(3,()=>{},()=>time);p.begin();p.received(1);time=499;assert.equal(p.snapshot().speedBps,null);
 const cached=createDownloadProgress(3,()=>{});cached.cached(3);cached.plan(0);assert.equal(cached.snapshot().speedBps,null);
 assert.doesNotMatch(modelLoadingText(cached.snapshot()),/speed|Downloaded/);
});
test('decimal MB counts, missing-file total and estimated speed are explicit',()=>{
 const state={total:161786625,cached:20e6,downloaded:1.25e6,downloadTotal:141786625,speedBps:2.5e6};
 assert.equal(modelLoadingText(state),'Downloaded 1.3 MB / 141.8 MB · Estimated speed: 2.5 MB/s · 20.0 MB already saved');
 assert.match(modelLoadingText({...state,speedBps:42000}),/42 KB\/s/);
 assert.match(modelLoadingText({...state,speedBps:null}),/Estimating download speed/);
 assert.doesNotMatch(modelLoadingText({...state,speedBps:Infinity}),/Infinity/);
 assert.match(modelLoadingText({...state,downloadTotal:null}),/Checking saved model files/);
});
test('runtime forwards download metrics and clears them on disable, retry and preparation',async()=>{
 let worker;const r=createModelRuntime({fetchProfile:async()=>({id:'test',totalBytes:10}),workerFactory:()=>worker={postMessage(){},terminate(){}}});
 const starting=r.start();await new Promise(r=>setTimeout(r,0));
 worker.onmessage({data:{type:'progress',loaded:6,total:10,cached:4,downloaded:2,downloadTotal:6,speedBps:3}});
 assert.equal(r.state.downloaded,2);assert.equal(r.state.speedBps,3);
 worker.onmessage({data:{type:'preparing'}});assert.equal(r.state.speedBps,null);
 const rejection=assert.rejects(starting,/disabled/);r.stop();await rejection;
 assert.equal(r.state.downloaded,0);assert.equal(r.state.downloadTotal,null);assert.equal(r.state.speedBps,null);
 const old=worker;const retry=r.start();await new Promise(r=>setTimeout(r,0));
 old.onmessage({data:{type:'progress',downloaded:99,speedBps:99}});assert.equal(r.state.downloaded,0);
 worker.onmessage({data:{type:'ready',persisted:true}});await retry;r.stop();
});
