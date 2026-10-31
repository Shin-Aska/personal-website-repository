"""Local-only fallback probe; reuse approved fixture and native-worker observer.

The production files and frozen cases are served unchanged except that guide
HTML receives the same consent/generative fixture used by the Python acceptance
harness. Native MiniLM stays real. Browser automation is provided by CUA.
This probe is not a replacement for the full Python acceptance harness.
"""
import ast
import hashlib
import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
profile = json.loads((ROOT / 'guides/local-assistant/profile.json').read_text())
fixture = (HERE / 'browser-consent-fixture.js').read_text().replace('__MODEL_ID__', json.dumps(profile['id']))
tree = ast.parse((HERE / 'knowledge-browser.py').read_text())
observer = next(ast.literal_eval(node.value) for node in tree.body if isinstance(node, ast.Assign)
                and any(isinstance(target, ast.Name) and target.id == 'WORKER_OBSERVER' for target in node.targets))
observer = observer.replace('row.dimensions=d.vector?.length;', 'row.dimensions=d.vector?.length;row.vector=Array.from(d.vector||[]);')
observer = observer.replace('this.knowledgeEvidence.events.push(row);',
                            "this.knowledgeEvidence.events.push(row);document.getElementById('native-acceptance').textContent=JSON.stringify(window.knowledgeIntentWorkers);")
observer = observer.replace('window.knowledgeIntentWorkers.push(this.knowledgeEvidence);', """window.knowledgeIntentWorkers.push(this.knowledgeEvidence);
const nativePost=this.postMessage.bind(this);this.postMessage=(data,...rest)=>{
this.knowledgeEvidence.events.push({direction:'send',type:data.type,id:data.id,text:data.text});return nativePost(data,...rest);};""")
script = "const probe=document.createElement('script');probe.id='native-acceptance';probe.type='application/json';document.head.append(probe);\n" + fixture + '\n' + observer
script += r"""
window.probeRows=[];window.probeWrites=[];window.probeErrors=[];
for(const method of ['setItem','removeItem','clear']){const native=Storage.prototype[method];Storage.prototype[method]=function(...args){if(this===localStorage)window.probeWrites.push({method,key:method==='clear'?null:String(args[0])});return Reflect.apply(native,this,args);};}
addEventListener('error',event=>window.probeErrors.push(event.message));
document.addEventListener('DOMContentLoaded',()=>{
 let conversation=0;const seen=new Set();
 document.addEventListener('click',event=>{if(event.target.closest('button')?.textContent.trim()==='Clear chat')conversation++;},true);
 const capture=()=>{
  const nodes=[...document.querySelectorAll('.guide-assistant-message')].filter(e=>e.getClientRects().length);
  const ai=nodes.at(-1),user=nodes.at(-2);
  if(!ai?.classList.contains('ai')||!ai.dataset.decision||ai.dataset.decision==='pending'||!user?.querySelector('.ga-msg-text'))return;
  const visibleSurface=(JSON.parse(document.getElementById('probe-surfaces').textContent)||[]).find(s=>{const e=document.querySelector(s.log);return e&&e.getClientRects().length;});
  const row={conversation,surface:visibleSurface?.id||null,text:user.querySelector('.ga-msg-text').textContent,decision:ai.dataset.decision,rendered:ai.querySelector('.ga-msg-text')?.innerText,citations:[...ai.querySelectorAll('.ga-msg-source')].map(e=>e.innerText),links:[...ai.querySelectorAll('a[href]')].map(e=>e.href)};
  const id=JSON.stringify(row);if(!seen.has(id)){seen.add(id);window.probeRows.push(row);}
 };
 new MutationObserver(capture).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-decision']});
 const button=document.createElement('button');button.textContent='Export local native probe';button.style='position:fixed;right:0;top:0;z-index:99999;font-size:12px';
 button.addEventListener('click',async()=>{
  capture();const after=await(await fetch('/__probe_hashes__')).json();
  const report={kind:'focused-cua-native-production-ui-probe',url:location.href,checkedAt:new Date().toISOString(),sourceHashesBefore:JSON.parse(document.getElementById('probe-hashes').textContent),sourceHashesAfter:after,turns:window.probeRows,workers:window.knowledgeIntentWorkers,storageWrites:window.probeWrites,pageErrors:window.probeErrors,limitation:'CUA focused probe with existing consent/generative fixture and native MiniLM; not the full Python acceptance harness.'};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));a.download='native-cua-'+location.pathname.split('/').at(-1).replace('.html','')+'-'+Date.now()+'.json';a.click();URL.revokeObjectURL(a.href);
 });document.body.append(button);
});
"""

ENCODER_PAGE = r'''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local MiniLM query encoder</title>
<style>body{font:16px system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem}textarea{width:100%;min-height:18rem;font:14px ui-monospace,monospace}button{margin:.6rem .5rem .6rem 0;padding:.5rem 1rem}pre{white-space:pre-wrap;overflow-wrap:anywhere}.error{color:#a00}</style></head><body>
<h1>Local MiniLM query encoder</h1><p>Paste a JSON array of raw query strings. Each string is encoded independently with the pinned local MiniLM model.</p>
<p id="encoder-model-state" role="status">Loading pinned local model…</p><label for="encoder-inputs">Raw JSON string list</label><textarea id="encoder-inputs" spellcheck="false" placeholder='["First query", "Second query"]'></textarea>
<div><button id="encoder-run" disabled>Run encoding</button><button id="encoder-download" disabled>Download query-vector cache</button></div>
<p id="encoder-progress" role="status"></p><p id="encoder-error" class="error" role="alert"></p>
<script type="module">
const state=document.getElementById('encoder-model-state'),input=document.getElementById('encoder-inputs'),run=document.getElementById('encoder-run'),download=document.getElementById('encoder-download'),progress=document.getElementById('encoder-progress'),error=document.getElementById('encoder-error');
const MAX_ITEMS=500,MAX_LENGTH=2000,REQUEST_TIMEOUT=120000;let worker,metadata=null,vectors=null,busy=false,nextId=0,pending=null;
function fail(message){error.textContent=message;progress.textContent='';}
function endRequest(){if(pending?.timer)clearTimeout(pending.timer);pending=null;busy=false;run.disabled=!metadata;}
function loadWorker(){worker=new Worker('/guides/js/assistant/intent-worker.js',{type:'module'});worker.onmessage=event=>{const d=event.data;if(d.type==='progress'||d.type==='preparing'){state.textContent=(d.phase||d.type)+(d.percent===undefined?'':` ${d.percent}%`);return;}if(d.type==='ready'){metadata=d.metadata;state.textContent=`Model ready: ${metadata.modelId} (${metadata.dimensions} dimensions; local inference)`;run.disabled=false;return;}if(d.type==='error'){if(pending){const reject=pending.reject;fail(d.message||'Encoding failed');endRequest();reject(Error(d.message||'Encoding failed'));}else{state.textContent='Model load failed';fail(d.message||'Unable to load pinned local model');}return;}if(d.type==='embedding'&&pending&&d.id===pending.id){if(d.vector?.length!==384||!d.vector.every(Number.isFinite)){const reject=pending.reject;fail('Worker returned an invalid 384-dimensional vector');endRequest();reject(Error('Invalid embedding vector'));return;}const resolve=pending.resolve;clearTimeout(pending.timer);pending=null;resolve(Array.from(d.vector));}};worker.onerror=e=>{state.textContent='Worker error';fail(e.message||'Local worker failed');if(pending){const reject=pending.reject;endRequest();reject(Error(e.message||'Local worker failed'));}};
fetch('/guides/local-assistant/intent/profile.json').then(r=>{if(!r.ok)throw Error(`Profile request failed (${r.status})`);return r.json();}).then(profile=>worker.postMessage({type:'load',profile,profileURL:new URL('/guides/local-assistant/intent/profile.json',location.href).href})).catch(e=>{state.textContent='Model load failed';fail(e.message);});}
function encode(text){return new Promise((resolve,reject)=>{const id=++nextId;pending={id,resolve,reject,timer:setTimeout(()=>{fail(`Encoding timed out for item ${id}`);worker.terminate();worker=null;metadata=null;run.disabled=true;pending=null;busy=false;reject(Error('Worker request timeout'));},REQUEST_TIMEOUT)};worker.postMessage({type:'encode',id,text});});}
run.addEventListener('click',async()=>{if(busy||!metadata)return;error.textContent='';vectors=null;download.disabled=true;let items;try{items=JSON.parse(input.value);if(!Array.isArray(items)||!items.length||items.length>MAX_ITEMS||items.some(x=>typeof x!=='string'||!x.trim()||x.length>MAX_LENGTH))throw Error(`Enter 1–${MAX_ITEMS} non-empty strings; each must be at most ${MAX_LENGTH} characters.`);}catch(e){fail(e instanceof SyntaxError?'Input must be valid JSON.':e.message);return;}
busy=true;run.disabled=true;const unique=[...new Set(items)];const encoded=Object.create(null);try{for(let i=0;i<unique.length;i++){progress.textContent=`Encoding unique query ${i+1} of ${unique.length}…`;encoded[unique[i]]=await encode(unique[i]);}vectors=Object.fromEntries(items.map(s=>[s,encoded[s]]));progress.textContent=`Encoded ${items.length} inputs (${unique.length} unique).`;download.disabled=false;}catch(e){fail(e.message||'Encoding failed');}finally{busy=false;run.disabled=!metadata;}});
download.addEventListener('click',()=>{if(!vectors||!metadata)return;const payload={metadata:{...metadata,profileURL:'/guides/local-assistant/intent/profile.json',generatedAt:new Date().toISOString(),inputCount:Object.keys(vectors).length,realModelInference:true},vectors};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload)],{type:'application/json'}));a.download='query-vector-cache-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
loadWorker();
</script></body></html>'''

SURFACES = {
    'ultima5': [{'id':'ultima5','log':'#seer-response'}],
    'ultima6': [{'id':'ultima6','log':'#seer-chat-messages'}],
    'ultima7': [{'id':'ultima7','log':'.sage-messages'}],
    'albion': [{'id':'albion','log':'#walkthrough-ai-body'}],
    'alqadim': [{'id':'alqadim','log':'#walkthrough-ai-body-tab'},
                {'id':'alqadim-walkthrough','log':'#walkthrough-ai-body'}],
    'starcraft': [{'id':'starcraft','log':'#sc-ai-chat'}],
}
LAYOUT_SELECTORS = {
    'albion': {'input':'#walkthrough-ai-input','send':'#walkthrough-ai-send','log':'#walkthrough-ai-body'},
    'ultima5': {'input':'#seer-query','send':'#ask-seer','log':'#seer-response'},
    'ultima6': {'input':'#seer-query','send':'#ask-seer','log':'#seer-chat-messages'},
    'ultima7': {'input':'.sage-input','send':'.sage-send','log':'.sage-messages'},
    'alqadim': {'input':'#walkthrough-ai-input-tab','send':'#walkthrough-ai-send-tab','log':'#walkthrough-ai-body-tab'},
    'alqadim-walkthrough': {'input':'#walkthrough-ai-input','send':'#walkthrough-ai-send','log':'#walkthrough-ai-body'},
    'starcraft': {'input':'#sc-ai-input','send':'#sc-ai-send','log':'#sc-ai-chat'},
}
LAYOUT_VIEWPORTS = [[1280,900],[767,806],[390,844],[767,500],[390,500],[844,390]]
OBSERVED_DATASETS = {
    'observed-native': HERE/'knowledge-blind-cases.json',
    'observed-fresh': HERE/'knowledge-fresh-cases-20261025.json',
    'observed-independent': HERE/'knowledge-independent-all-20261025.json',
}

def json_script(identifier, value):
    encoded = json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', r'\u003c')
    return f'<script type="application/json" id="{identifier}">{encoded}</script>'

def game_for_path(path):
    return {'Ultima5':'ultima5','Ultima6':'ultima6','Ultima7':'ultima7','AlQadim':'alqadim',
            'Albion':'albion','StarcraftBWAPI':'starcraft'}.get(Path(path).stem)

def hashes():
    paths = list((ROOT/'guides/js').rglob('*.js')) + list((ROOT/'guides/data/assistant').rglob('*.json'))
    paths += list((ROOT/'guides/local-assistant/intent').glob('*.json'))
    paths += list((ROOT/'guides').glob('*.html')) + list((ROOT/'guides/css').rglob('*.css'))
    paths += [ROOT/'guides/offline-manifest.json',ROOT/'guides/offline-version.json']
    paths += [HERE/'cua-native-probe-server.py',HERE/'review-cua-native-probes.py',
              HERE/'knowledge-browser.py',HERE/'cua-semantic-smoke-13.json',
              HERE/'narrative-all-games-cases.json',HERE/'knowledge-source-first-96-20261025.json',
              HERE/'knowledge-blind-cases.json',HERE/'knowledge-fresh-cases-20261025.json',
              HERE/'knowledge-independent-all-20261025.json',HERE/'browser-consent-fixture.js',
              HERE/'evidence/conversation-starcraft-source-records.json']
    paths += list((HERE/'knowledge').glob('*-cases.json'))
    paths += list((HERE/'conversations').glob('*.json'))
    return {path.relative_to(ROOT).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest() for path in sorted(paths)}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/__probe_hashes__':
            body = json.dumps(hashes()).encode()
            content_type = 'application/json'
        elif path == '/guides/offline.js':
            body = b'// Isolated local acceptance site worker bootstrap.'
            content_type = 'text/javascript'
        elif path == '/__encoder__':
            batch_name = parse_qs(urlsplit(self.path).query).get('batch', [''])[0]
            batch = []
            if batch_name:
                if not re.fullmatch(r'encoder-inputs-[A-Za-z0-9_-]+\.json', batch_name):
                    self.send_error(400, 'Invalid local raw-query batch')
                    return
                batch = json.loads((HERE/'intent-prototype/results'/batch_name).read_text(encoding='utf-8'))
                if not isinstance(batch, list) or any(not isinstance(item, str) for item in batch):
                    self.send_error(400, 'Raw query strings required')
                    return
            body = ENCODER_PAGE.replace('<script type="module">',
                json_script('encoder-batch', batch)+'<script type="module">', 1).encode('utf-8')
            content_type = 'text/html; charset=utf-8'
        elif path.startswith('/guides/') and path.endswith('.html') and '/' not in path[len('/guides/'):]:
            original = (ROOT / path.lstrip('/')).read_text(encoding='utf-8')
            game = game_for_path(path)
            if game is None:
                return super().do_GET()
            cases = json.loads((HERE/'knowledge'/f'{game}-cases.json').read_text())
            source_first = [d for d in json.loads((HERE/'knowledge-source-first-96-20261025.json').read_text())['dialogues'] if d['gameId'] == game]
            cases['sourceFirst'] = source_first
            surfaces = SURFACES[game]
            meta = json_script('probe-hashes', hashes())
            # Retain the legacy single-game case node consumed by earlier CUA flows.
            meta += json_script('probe-cases', cases)
            meta += json_script('probe-surfaces', surfaces)
            meta += json_script('probe-source-first96', source_first)
            for suite, dataset_path in OBSERVED_DATASETS.items():
                dataset = json.loads(dataset_path.read_text(encoding='utf-8'))
                meta += json_script('probe-'+suite, [d for d in dataset['dialogues'] if d['gameId'] == game])
            semantic = json.loads((HERE/'cua-semantic-smoke-13.json').read_text(encoding='utf-8'))
            meta += json_script('probe-semantic13', [d for d in semantic['dialogues'] if d['gameId'] == game])
            layout_fixture = json.loads((HERE/'conversations'/f'{game}.json').read_text(encoding='utf-8'))
            first_dialogue = layout_fixture['dialogues'][0]
            layout = {'gameId':game,'dialogueId':first_dialogue['id'],
                      'turns':first_dialogue['turns'][:8],
                      'viewports':LAYOUT_VIEWPORTS,
                      'surfaces':[{'id':spec['id'],**LAYOUT_SELECTORS[spec['id']]} for spec in SURFACES[game]]}
            meta += json_script('probe-layout', layout)
            body = original.replace('<head>', '<head>'+meta+'<script>' + script + '</script>', 1).encode()
            content_type = 'text/html; charset=utf-8'
        else:
            return super().do_GET()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        self.send_header('Content-Security-Policy', "default-src 'self' data: blob:; script-src 'self' blob: 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob: data:; img-src 'self' data: blob:; worker-src 'self' blob:")
        super().end_headers()

    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
print(f'Local fixture probe: http://127.0.0.1:{server.server_port}', flush=True)
try:
    server.serve_forever()
finally:
    server.server_close()
