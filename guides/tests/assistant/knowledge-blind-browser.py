"""Run frozen independent conversations through six production chat surfaces.

Reuses knowledge-browser helpers, but never reads its existing game corpora.
Native MiniLM classify/encode; only the existing SmolLM consent fixture. No query
vectors, expected state, custom facts or generated answers enter the runtime.
"""
import argparse
import importlib.util
import json
import math
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('blind_base', HERE / 'knowledge-browser.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
ROOT = base.ROOT
CORPUS = HERE / 'knowledge-blind-cases.json'

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tag', required=True)
    parser.add_argument('--cases', type=Path, default=CORPUS,
                        help='Frozen source-first corpus; default keeps the original 96 turns.')
    parser.add_argument('--game', action='append', choices=['ultima5','ultima6','ultima7','alqadim','albion','starcraft'])
    args = parser.parse_args()
    if not args.tag.replace('-', '').replace('_', '').isalnum():
        parser.error('Invalid tag')
    output = HERE / 'evidence' / ('knowledge-blind-browser-' + args.tag + '.json')
    if output.exists():
        parser.error('Report exists; choose a new tag to preserve failures')
    corpus_path = args.cases.resolve()
    if not corpus_path.is_relative_to(ROOT) or not corpus_path.is_file():
        parser.error('Cases must be an existing repository file')
    corpus = json.loads(corpus_path.read_text())
    games = args.game or ['ultima5','ultima6','ultima7','alqadim','albion','starcraft']
    dialogues = {g:[d for d in corpus['dialogues'] if d['gameId']==g] for g in games}
    surfaces = {g:base.SURFACES[g] for g in games}
    shots = HERE / 'intent-prototype/results/knowledge-blind' / args.tag
    shots.mkdir(parents=True, exist_ok=True)
    watched = set((ROOT / 'guides/js').rglob('*.js')) | set((ROOT / 'guides/data/assistant').rglob('*.json'))
    watched |= set((ROOT / 'guides/local-assistant/intent').glob('*.json'))
    watched |= {ROOT/'guides'/s[0] for s in surfaces.values()}
    watched |= {Path(__file__),corpus_path,HERE/'knowledge-browser.py',HERE/'full-answer-browser.py',HERE/'browser-consent-fixture.js',ROOT/'guides/local-assistant/profile.json'}
    hashes = lambda:{str(p.relative_to(ROOT)):base.digest(p) for p in sorted(watched)}
    report = {'schemaVersion':1,'suite':corpus['suite'],'realMiniLM':True,'nativeIntentClassification':True,'nativeQueryEncoding':True,'generativeWorkerFixture':True,'nativeGenerativeInference':False,'productionFactoryAndUI':True,'expectedStateInjected':False,'corpusPath':str(corpus_path.relative_to(ROOT)),'corpusHash':base.digest(corpus_path),'sourceHashesBefore':hashes(),'selectedSurfaces':list(surfaces),'turns':[],'failures':[],'requests':[],'blockedRequests':[],'pageErrors':[],'workers':{},'storageUnchanged':{},'storageWrites':{},'screenshots':[],'oracleLimitation':'Exact guide file/locator tuples or complete primary research label/URL/date tuples, plus fixed useful phrases. Internal fact IDs are not observed. Required useful claims and boundaries also need semantic review.'}
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    thread=Thread(target=server.serve_forever,daemon=True);thread.start()
    report['loopbackPort']=server.server_port
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
            context=browser.new_context(service_workers='block',viewport={'width':1280,'height':900})
            context.add_init_script(script=base.WORKER_OBSERVER+'\n'+base.CONSENT_FIXTURE+'\n'+base.helpers.STORAGE_OBSERVER)
            def route(r):
                req=r.request;u=urlparse(req.url)
                item={'url':req.url.split('?')[0],'method':req.method,'hasBody':req.post_data_buffer is not None};report['requests'].append(item)
                if req.method=='GET' and req.post_data_buffer is None and (req.url.startswith(('blob:','data:')) or (u.hostname=='127.0.0.1' and u.port==server.server_port)):r.continue_()
                else:report['blockedRequests'].append(item);r.abort()
            context.route('**/*',route)
            for surface,selectors in surfaces.items():
                print('Opening blind '+surface+' with native MiniLM',flush=True)
                page=context.new_page()
                page.route('**/offline.js*',lambda r:r.fulfill(status=200,content_type='text/javascript',body='// Isolated acceptance worker bootstrap.'))
                page.on('pageerror',lambda e,surface=surface:report['pageErrors'].append({'surface':surface,'error':str(e)}))
                try:
                    page.goto(f'http://127.0.0.1:{server.server_port}/guides/{selectors[0]}',wait_until='networkidle')
                    page.wait_for_function("document.documentElement.dataset.guideChat==='ready'",timeout=30000)
                    base.helpers.open_surface(page,surface)
                    before=page.evaluate(base.helpers.STORAGE)
                    for dialogue in dialogues[surface]:
                        page.get_by_role('button',name='Clear chat',exact=True).filter(visible=True).click()
                        for i,turn in enumerate(dialogue['turns'],1):
                            try:item=base.send(page,surface,turn)
                            except Exception as exc:item={'text':turn['text'],'expected':turn['expected'],'passed':False,'problems':[str(exc)]}
                            item.update(surface=surface,dialogueId=dialogue['id'],turn=i);report['turns'].append(item)
                            if not item['passed']:report['failures'].append({k:item[k] for k in ['surface','dialogueId','turn','text','problems']})
                        print(surface+' '+dialogue['id']+': '+str(sum(t['passed'] for t in report['turns'] if t['dialogueId']==dialogue['id']))+'/'+str(len(dialogue['turns'])),flush=True)
                    report['storageUnchanged'][surface]=before==page.evaluate(base.helpers.STORAGE)
                    shot=shots/(surface+'.png');page.screenshot(path=str(shot));report['screenshots'].append(str(shot.relative_to(ROOT)))
                except Exception as exc:report['failures'].append({'surface':surface,'stage':'setup','error':str(exc)})
                finally:
                    report['workers'][surface]=page.evaluate('window.knowledgeIntentWorkers||[]')
                    report['storageWrites'][surface]=page.evaluate('window.fullAnswerStorageWrites||[]');page.close()
            report['browser']=browser.version;context.close();browser.close()
    finally:
        server.shutdown();server.server_close();thread.join(timeout=5)
        report['serverClosed']=not thread.is_alive();report['sourceHashesAfter']=hashes()
        report['sourceStable']=report['sourceHashesBefore']==report['sourceHashesAfter']
        report['changedSourceFiles']=[k for k,v in report['sourceHashesBefore'].items() if report['sourceHashesAfter'].get(k)!=v]
        report['nativeIntentEvidence']={}
        for surface,workers in report['workers'].items():
            events=[e for w in workers for e in w['events']];emb=[e for e in events if e['type']=='embedding']
            report['nativeIntentEvidence'][surface]={'nativeModelReady':any(e.get('metadata',{}).get('realModelInference') is True for e in events),'classifications':sum(e['direction']=='send' and e['type']=='classify' for e in events),'encodings':sum(e['direction']=='send' and e['type']=='encode' for e in events),'embeddingResults':len(emb),'validEmbeddings':bool(emb) and all(e['dimensions']==384 and e['allFinite'] and math.isfinite(e['norm']) and e['norm']>0 for e in emb)}
        writes=[{'surface':s,**w} for s,rows in report['storageWrites'].items() for w in rows if w['key']!='guide-assistant.preference.v1']
        report['expectedTurns']=sum(len(d['turns']) for g in games for d in dialogues[g]);report['totalTurns']=len(report['turns']);report['passedTurns']=sum(t['passed'] for t in report['turns'])
        report['boundaries']={'allTurnsRan':report['totalTurns']==report['expectedTurns'],'nativeMiniLMEverySurface':len(report['nativeIntentEvidence'])==len(surfaces) and all(e['nativeModelReady'] and e['classifications'] and e['encodings'] and e['validEmbeddings'] for e in report['nativeIntentEvidence'].values()),'storageUnchanged':len(report['storageUnchanged'])==len(surfaces) and all(report['storageUnchanged'].values()),'noSavedGameWrites':not writes,'noExternalRequests':not report['blockedRequests'],'noPageErrors':not report['pageErrors'],'onlyStaticGets':all(r['method']=='GET' and not r['hasBody'] for r in report['requests']),'sourceStable':report['sourceStable'],'serverClosed':report['serverClosed']}
        if not all(report['boundaries'].values()):report['failures'].append({'stage':'boundaries','checks':report['boundaries'],'savedGameWrites':writes})
        output.parent.mkdir(exist_ok=True);output.write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'report':str(output.relative_to(ROOT)),'passedTurns':report['passedTurns'],'totalTurns':report['totalTurns'],'boundaries':report['boundaries'],'changedSourceFiles':report['changedSourceFiles']},indent=2),flush=True)
    return 1 if report['failures'] else 0

if __name__=='__main__':raise SystemExit(main())
