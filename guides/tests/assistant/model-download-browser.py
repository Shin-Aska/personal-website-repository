"""Native worker/streaming/UI progress with tiny local fixtures, not model inference.
Real-model inference and offline coverage remain in model-consent-browser.py.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from functools import partial
from urllib.parse import urlparse
import hashlib,json,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3]
PAYLOAD=b'x'*2000000
RUNTIME=b'''export const env={backends:{onnx:{wasm:{}}}};
export const AutoTokenizer={from_pretrained:async()=>{await new Promise(r=>setTimeout(r,400));return {};}};
export const AutoModelForCausalLM={from_pretrained:async()=>({})};'''
def asset(body):
 digest=hashlib.sha256(body).hexdigest()
 return {'path':'files/progress-test-'+digest+'.bin','bytes':len(body),'sha256':digest}
ASSETS=[asset(RUNTIME),asset(PAYLOAD)]
PROFILE={'schema':1,'id':'local-download-progress-fixture','backend':'transformers-causal-lm','totalBytes':sum(a['bytes'] for a in ASSETS),'assets':ASSETS,'runtime':{'module':[ASSETS[0]['sha256']],'wasmModule':[ASSETS[0]['sha256']],'wasm':[ASSETS[1]['sha256']]},'model':{},'dtype':'q8'}
class Handler(SimpleHTTPRequestHandler):
 requests=[];corrupt=False
 def log_message(self,*args):pass
 def do_GET(self):
  path=urlparse(self.path).path
  if path=='/guides/local-assistant/profile.json':
   body=json.dumps(PROFILE).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(body);return
  for item,body in zip(ASSETS,[RUNTIME,PAYLOAD]):
   if path=='/guides/local-assistant/'+item['path']:
    type(self).requests.append(path);self.send_response(200);self.send_header('Content-Type','application/octet-stream');self.end_headers()
    if type(self).corrupt and body==PAYLOAD:body=b'z'*len(body)
    try:
     for start in range(0,len(body),100000):
      self.wfile.write(body[start:start+100000]);self.wfile.flush()
      if len(body)>100000:time.sleep(.1)
    except (BrokenPipeError,ConnectionResetError):pass
    return
  super().do_GET()
checks=[]
def check(label,condition):
 assert condition,label
 checks.append({'check':label,'passed':True})
def seed(page,assets):
 page.evaluate('''async entries=>{const c=await caches.open('guide-assistant-model-files-v1');for(const [hash,body] of entries)await c.put(location.origin+'/__guide_assistant_model_cache__/'+hash,new Response(body));}''',[[ASSETS[i]['sha256'],body.decode()] for i,body in assets])
def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
 Thread(target=server.serve_forever,daemon=True).start();base='http://127.0.0.1:'+str(server.server_port)
 errors=[]
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
   def visit():
    context=browser.new_context(service_workers='block',viewport={'width':320,'height':720})
    context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base+'/guides/Ultima6.html',wait_until='networkidle');page.locator('#guide-assistant-consent[open]').wait_for()
    page.evaluate('''async()=>{const {modelRuntime}=await import('/guides/js/assistant/model-runtime.js');window.progressStates=[];modelRuntime.subscribe(s=>window.progressStates.push({...s}));}''')
    return context,page
   c,page=visit();check('Consent makes no asset request',not Handler.requests)
   seed(page,[(0,RUNTIME)])
   page.get_by_role('button',name='Enable chat',exact=True).click()
   page.wait_for_function(r'''()=>{const t=document.querySelector('#guide-assistant-model-status').textContent;return /Downloaded [0-9.]+ MB \/ 2.0 MB/.test(t)&&/Estimated speed: [0-9.]+ (MB|KB)\/s/.test(t);}''')
   text=page.locator('#guide-assistant-model-status').inner_text()
   check('Byte counts and rate update before the file finishes',page.evaluate('progressStates.some(s=>s.downloaded>0&&s.downloaded<s.downloadTotal&&s.speedBps>0)'))
   check('Cached part excluded from required download',page.evaluate('progressStates.some(s=>s.cached>0&&s.downloadTotal===2000000)'))
   box=page.locator('#guide-assistant-consent').bounding_box()
   check('Progress fits 320px dialog',box['x']>=0 and box['x']+box['width']<=320 and page.locator('#guide-assistant-consent').evaluate('(n)=>n.scrollWidth<=n.clientWidth'))
   check('Progress bar has accessible name',page.get_by_role('progressbar',name='Local chat files loaded').is_visible())
   page.wait_for_function("document.documentElement.dataset.guideChat==='ready'")
   check('Preparing clears rate rather than pretending to download',page.evaluate('progressStates.some(s=>s.status==="preparing"&&s.speedBps===null)'))
   check('Cached part never fetched',len(Handler.requests)==1 and Handler.requests[0].endswith(ASSETS[1]['path']))
   page.reload(wait_until='networkidle');page.wait_for_function("document.documentElement.dataset.guideChat==='ready'")
   check('Fully cached reload makes no model asset request',len(Handler.requests)==1)
   page.evaluate('''async()=>{const {modelRuntime}=await import('/guides/js/assistant/model-runtime.js');window.progressStates=[];modelRuntime.subscribe(s=>window.progressStates.push({...s}));}''')
   page.get_by_role('button',name='Assistant settings',exact=True).click();page.get_by_role('button',name='Reset choice',exact=True).click()
   page.get_by_role('button',name='Enable chat',exact=True).click();page.wait_for_function("document.documentElement.dataset.guideChat==='ready'")
   check('All cached load has zero downloads and no fake speed',page.evaluate('progressStates.some(s=>s.status==="loading"&&s.downloadTotal===0&&s.downloaded===0&&s.speedBps===null)'))
   check('No extra progress keys written',page.evaluate('Object.keys(localStorage).every(k=>k==="guide-assistant.preference.v1")'))
   c.close()
   # An invalid cache entry is missing, not counted as saved; bad transfer still fails closed.
   Handler.corrupt=True;c,page=visit();seed(page,[(0,RUNTIME),(1,b'z'*len(PAYLOAD))])
   page.get_by_role('button',name='Enable chat',exact=True).click();page.wait_for_function("document.documentElement.dataset.guideChat==='error'")
   check('Corrupt saved part is not counted as cached',page.evaluate('progressStates.some(s=>s.downloadTotal===2000000&&s.cached<2000000)'))
   check('Corrupt streamed file keeps chat unavailable',page.get_by_role('button',name='Retry model loading',exact=True).is_visible() and page.locator('[data-guide-chat-surface]:visible').count()==0)
   Handler.corrupt=False;page.get_by_role('button',name='Retry model loading',exact=True).click();page.wait_for_function("document.documentElement.dataset.guideChat==='ready'")
   check('Retry completes with fresh counters',page.evaluate('progressStates.filter(s=>s.status==="loading").filter(s=>s.downloaded===0&&s.speedBps===null).length>=2'))
   c.close();browser.close()
  check('No page errors',not errors)
  report={'checks':checks,'loadingText':text,'fixtureOnly':True,'assetRequests':Handler.requests,'errors':errors}
  (ROOT/'guides/tests/assistant/evidence/model-download-report.json').write_text(json.dumps(report,indent=2)+'\n')
  print(str(len(checks))+'/'+str(len(checks))+' streaming download checks passed.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
