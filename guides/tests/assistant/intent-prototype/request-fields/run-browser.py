"""Train/evaluate only this isolated classifier with existing pinned local MiniLM assets."""
import argparse, hashlib, json, time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
def main():
 ap=argparse.ArgumentParser(description=__doc__)
 ap.add_argument('--tag',default='fit')
 ap.add_argument('--head',type=Path,help='Restore frozen head; no fitting/threshold selection')
 ap.add_argument('--test',type=Path,help='Independent test JSON; consumed only after fitting/restoring')
 args=ap.parse_args()
 if not args.tag.replace('-','').replace('_','').isalnum():ap.error('Invalid tag')
 output=HERE.parent/'results'/('request-fields-20261025-'+args.tag+'.json')
 if output.exists():ap.error('Output exists; choose another tag')
 output.parent.mkdir(exist_ok=True)
 watched=list(HERE.glob('*'))+[HERE.parent/'encoder.mjs',HERE.parent/'embedding-worker.mjs',HERE.parent/'assets/profile.json']
 def hashes():return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in watched if p.is_file()}
 before=hashes();requests=[];blocked=[];errors=[]
 class Quiet(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
   try:
    context=browser.new_context(service_workers='block')
    def route(r):
     u=urlparse(r.request.url)
     if u.scheme in ('blob','data') or (u.hostname=='127.0.0.1' and u.port==server.server_port and r.request.method=='GET'):r.continue_()
     else:blocked.append(r.request.url);r.abort()
    context.route('**/*',route)
    context.on('request',lambda r:requests.append({'url':r.url.split('?')[0],'method':r.method}))
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/guides/tests/assistant/intent-prototype/request-fields/',wait_until='networkidle')
    page.evaluate("async()=>{window.lab=await import('./runtime.mjs')}")
    print('Running verified native MiniLM encoder with no external network...',flush=True)
    if args.head:
     saved=json.loads(args.head.read_text())
     model=page.evaluate('async saved=>await window.lab.restore(saved)',saved)
     report={'schemaVersion':1,'restoredFrom':str(args.head),'model':model,'headSha256':hashlib.sha256(args.head.read_bytes()).hexdigest(),'thresholds':saved['thresholds'],'ontology':saved['ontology']}
    else:
     report=page.evaluate('async()=>await window.lab.fit()')
     output.write_text(json.dumps(report,indent=2)+'\n')
     print(json.dumps({'fitSaved':str(output),'validation':report['validation']['metrics'],'thresholds':report['thresholds']}),flush=True)
    if args.test:
     test=json.loads(args.test.read_text());samples=test['samples'] if isinstance(test,dict) else test
     report['independentTest']={'path':str(args.test),'sha256':hashlib.sha256(args.test.read_bytes()).hexdigest(),'result':page.evaluate('async samples=>await window.lab.evaluate(samples)',samples)}
    page.evaluate('()=>window.lab.stop()')
    report.update(browser=browser.version,sourceHashesBefore=before,sourceHashesAfter=hashes(),requests=requests,blockedExternalRequests=blocked,pageErrors=errors,finishedUtc=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()))
    report['sourceFilesUnchanged']=before==report['sourceHashesAfter']
    report['boundaryPassed']=not blocked and not errors and report['sourceFilesUnchanged'] and all(r['method']=='GET' for r in requests)
    output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'report':str(output),'boundaryPassed':report['boundaryPassed'],'independentTest':report.get('independentTest',{}).get('result',{}).get('thresholded',{}).get('metrics')}),flush=True)
    if not report['boundaryPassed']:raise RuntimeError('Boundary checks failed')
   finally:browser.close()
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
