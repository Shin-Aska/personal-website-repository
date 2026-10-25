export function createEncoder() {
    let worker=null,sequence=0,metadata=null;
    const pending=new Map(),cache=new Map(),measurements=[];
    function stop() {
        worker?.terminate();worker=null;metadata=null;cache.clear();
        for (const {reject,timer} of pending.values()) {clearTimeout(timer);reject(new Error('Encoder stopped'));}
        pending.clear();
    }
    function request(type,rest={},timeout=60000) {
        if (!worker) return Promise.reject(new Error('Encoder is not running'));
        const id=++sequence;
        return new Promise((resolve,reject)=>{
            const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Encoder request timed out'));},timeout);
            pending.set(id,{resolve,reject,timer});worker.postMessage({id,type,...rest});
        });
    }
    return {
        async start() {
            if (metadata) return metadata;
            if (worker) throw new Error('Encoder preparation is already running');
            worker=new Worker(new URL('./embedding-worker.mjs',import.meta.url),{type:'module'});
            worker.onmessage=({data})=>{
                const item=pending.get(data.id);if(!item)return;
                pending.delete(data.id);clearTimeout(item.timer);
                data.type==='result'?item.resolve(data.result):item.reject(new Error(data.message));
            };
            worker.onerror=()=>stop();
            try {metadata=await request('prepare',{},120000);return metadata;}
            catch(error) {stop();throw error;}
        },
        async embed(texts,{cacheResults=true,onProgress=()=>{}}={}) {
            if (!metadata) throw new Error('Encoder is not prepared');
            const missing=[...new Set(texts.filter(text=>!cacheResults||!cache.has(text)))];
            const received=new Map();
            for(let offset=0;offset<missing.length;offset+=8) {
                const batch=missing.slice(offset,offset+8),result=await request('embed',{texts:batch});
                measurements.push({count:batch.length,ms:result.ms});
                batch.forEach((text,i)=>{received.set(text,result.vectors[i]);if(cacheResults)cache.set(text,result.vectors[i]);});
                onProgress(Math.min(offset+batch.length,missing.length),missing.length);
            }
            // The lab corpus is bounded; retain at most 1,024 embeddings.
            const output=texts.map(text=>received.get(text)||cache.get(text));
            while(cache.size>1024)cache.delete(cache.keys().next().value);
            return output;
        },
        stop,
        get metadata(){return metadata;},
        get measurements(){return measurements.map(m=>({...m}));}
    };
}
