"""Separate actual-MiniLM/UI unknown-identity barrier regression; original49 intact."""
import argparse,hashlib,importlib.util,json
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[2]
spec=importlib.util.spec_from_file_location('story_helpers',HERE/'story-passive-browser.py');S=importlib.util.module_from_spec(spec);spec.loader.exec_module(S);R=S.R
DATA=HERE/'story-passive-unknown-identity-cases.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--tag',default='final');args=parser.parse_args()
 if not args.tag.replace('-','').replace('_','').isalnum():parser.error('Invalid tag')
 output=HERE/'evidence'/f'story-passive-unknown-identity-{args.tag}.json'
 if output.exists():parser.error('Report exists; use another tag')
 data=json.loads(DATA.read_text());watched=set((ROOT/'guides/js').rglob('*.js'))|{ROOT/'guides/Ultima7.html',DATA,Path(__file__),HERE/'story-passive-cases.json'};hashes=lambda:{str(p.relative_to(ROOT)):sha(p)for p in sorted(watched)}
 report={'realMiniLM':True,'generativeWorkerFixture':True,'nativeGenerativeInference':False,'supplementalCorpusHash':sha(DATA),'original49CorpusHash':sha(HERE/'story-passive-cases.json'),'sourceHashesBefore':hashes(),'turns':[],'failures':[],'requests':[],'blocked':[],'pageErrors':[]}
 class Quiet(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));thread=Thread(target=server.serve_forever,daemon=True);thread.start()
 try:
  with sync_playwright()as p:
   b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox']);ctx=b.new_context(service_workers='block',viewport={'width':1280,'height':900});ctx.add_init_script(script=R.WORKER_OBSERVER+'\n'+R.CONSENT_FIXTURE+'\n'+R.helpers.STORAGE_OBSERVER)
   def route(r):
    q=r.request;u=urlparse(q.url);report['requests'].append({'url':q.url,'method':q.method,'hasBody':q.post_data_buffer is not None})
    if q.method=='GET'and q.post_data_buffer is None and(q.url.startswith(('blob:','data:'))or(u.hostname=='127.0.0.1'and u.port==server.server_port)):r.continue_()
    else:report['blocked'].append(q.url);r.abort()
   ctx.route('**/*',route);page=ctx.new_page();page.on('pageerror',lambda e:report['pageErrors'].append(str(e)));page.route('**/offline.js*',lambda r:r.fulfill(status=200,content_type='text/javascript',body='// Supplemental isolated UI boundary.'))
   page.goto(f'http://127.0.0.1:{server.server_port}/guides/Ultima7.html',wait_until='networkidle');page.wait_for_function("document.documentElement.dataset.guideChat==='ready'");R.helpers.open_surface(page,'ultima7');S.select_context(page,'ultima7','trinsic');report['model']=page.evaluate("async()=>{const{intentRuntime}=await import('/guides/js/assistant/intent-runtime.js');await intentRuntime.prepare();return intentRuntime.state}");storage=page.evaluate(R.helpers.STORAGE)
   for i,t in enumerate(data['turns'],1):
    try:
     item=S.assert_roles(R.send(page,'ultima7',t),t)
     if t.get('requireNoCitation')and item.get('citations'):item['problems'].append('Unknown/unconfirmed subject returned sourced facts');item['passed']=False
    except Exception as exc:item={'text':t['text'],'passed':False,'problems':[str(exc)]}
    item.update(turn=i,setup=i<=data['setupTurns'],expectedSupported=t['supported'],contextStatement=bool(t.get('contextStatement')));report['turns'].append(item)
    if not item['passed']:report['failures'].append(item)
    print(str(i)+' '+t['text']+': '+('PASS'if item['passed']else str(item['problems'])),flush=True)
   report['workers']=page.evaluate('window.rolloutIntentWorkers');report['storageUnchanged']=storage==page.evaluate(R.helpers.STORAGE);report['storageWrites']=page.evaluate('window.fullAnswerStorageWrites');b.close()
 finally:
  server.shutdown();server.server_close();thread.join(timeout=5);report['serverClosed']=not thread.is_alive();report['sourceHashesAfter']=hashes();report['sourceFilesUnchanged']=report['sourceHashesBefore']==report['sourceHashesAfter'];events=[e for w in report.get('workers',[])for e in w['events']]
  report['boundaries']={'nativeWorkerReady':any(e['type']=='ready'for e in events),'nativeResults':sum(e['type']=='result'for e in events)>=8,'noExternalRequests':not report['blocked'],'noPageErrors':not report['pageErrors'],'onlyStaticGets':all(x['method']=='GET'and not x['hasBody']for x in report['requests']),'storageUnchanged':report.get('storageUnchanged',False),'noSavedGameWrites':all(x['key']=='guide-assistant.preference.v1'for x in report.get('storageWrites',[])),'sourceFilesUnchanged':report['sourceFilesUnchanged'],'ownedServerClosed':report['serverClosed']}
  if not all(report['boundaries'].values()):report['failures'].append({'stage':'boundaries','checks':report['boundaries']})
  report['passed']=sum(t['passed']for t in report['turns']);report['total']=len(report['turns']);output.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'report':str(output.relative_to(ROOT)),'passed':report['passed'],'total':report['total'],'boundaries':report['boundaries'],'failures':report['failures']},indent=2),flush=True)
 assert report['total']==8 and not report['failures'],report['failures']
if __name__=='__main__':main()
