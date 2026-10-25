"""Actual MiniLM + production UI/engine acceptance for six guides, seven surfaces.

Existing approved generative Worker fixture is explicit; intent-worker.js remains
native and executes the packaged MiniLM encoder/linear head. No installs, remote
requests, downloads, or source edits. Serve a private loopback origin and close it.
"""
import argparse
import hashlib
import importlib.util
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
from browser_consent_fixture import CONSENT_FIXTURE

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
spec=importlib.util.spec_from_file_location('full_answer_helpers',HERE/'full-answer-browser.py')
helpers=importlib.util.module_from_spec(spec);spec.loader.exec_module(helpers)
SURFACES=helpers.SURFACES
CORPUS=HERE/'rollout-cases.json'
WORKER_OBSERVER=r'''(() => {
    const NativeWorker=window.Worker;
    window.rolloutIntentWorkers=[];
    window.Worker=class extends NativeWorker {
        constructor(url,options){
            super(url,options);
            if(String(url).includes('/assistant/intent-worker.js')){
                this.rolloutEvidence={url:String(url),events:[]};window.rolloutIntentWorkers.push(this.rolloutEvidence);
                this.addEventListener('message',event=>{
                    const d=event.data;
                    if(['ready','result','error'].includes(d.type))this.rolloutEvidence.events.push({direction:'receive',type:d.type,id:d.id,metadata:d.metadata,predictions:d.predictions,message:d.message});
                });
            }
        }
        postMessage(data,...rest){
            if(this.rolloutEvidence&&['load','classify','cancel'].includes(data.type))this.rolloutEvidence.events.push({direction:'send',type:data.type,id:data.id,text:data.text,modelId:data.profile?.modelId});
            return super.postMessage(data,...rest);
        }
    };
})();'''


def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def compact_source(source,citation):
    if source.get('review')=='external-research':
        refs=source.get('references') or [{'url':source['file'],'label':source['locator']}]
        return all(x['url'] in citation and x['label'] in citation for x in refs)
    origins=[source]+([source['basedOn']]if source.get('basedOn')else[])
    return any(s['file'] in citation and s['locator'] in citation for s in origins)


def send(page,surface,turn):
    _,inp,button,log=SURFACES[surface]
    if turn.get('pageAction')=='u6-marker-iolo':page.evaluate("openSeerForMarker('Iolo')")
    if turn.get('action')=='resetTopic':
        page.get_by_role('button',name='New topic',exact=True).filter(visible=True).click()
        return {'control':'resetTopic','passed':not page.evaluate(helpers.NO_HELP)}
    page.evaluate('s=>window.rolloutOldReply=document.querySelector(s).lastElementChild',log)
    page.locator(inp).fill(turn['text']);page.locator(button).click(timeout=10000)
    page.wait_for_function('''([log,button,q])=>{
        const e=document.querySelector(log),n=[...e.querySelectorAll('.guide-assistant-message')],last=n.at(-1);
        return !window.rolloutOldReply?.isConnected&&last?.classList.contains('ai')&&last.dataset.decision&&last.dataset.decision!=='pending'
            &&n.at(-2)?.querySelector('.ga-msg-text')?.textContent===q&&!document.querySelector(button).disabled;
    }''',arg=[log,button,turn['text']],timeout=30000)
    block=page.locator(log+' .guide-assistant-message.ai').last
    text=block.locator('.ga-msg-text').inner_text();decision=block.get_attribute('data-decision')
    citations=block.locator('.ga-msg-source').all_inner_texts();citation='\n'.join(citations)
    links=block.locator('a[href]').evaluate_all('(nodes)=>nodes.map(e=>e.href)')
    problems=[]
    if turn['supported']:
        if decision!='answer':problems.append('Expected factual answer, got '+str(decision))
        alternatives=turn.get('answerAlternatives')or[turn]
        branch_problems=[]
        for branch in alternatives:
            missing=['Missing fixed source excerpt: '+s for s in branch['replyContains']if s.casefold()not in text.casefold()]
            witnessed=any(compact_source(src,citation)for e in branch['evidence']for src in [e['source']]+[v['source']for v in e.get('sourceVariants',[])])
            if not witnessed:missing.append('Missing reviewed source provenance for the requested facet')
            branch_problems.append(missing)
        if all(branch_problems):problems+=min(branch_problems,key=len)
        problems += ['Missing canonical URL: '+u for u in turn.get('expectedUrls',[])if u not in links and u not in text]
    elif turn.get('requireDecline') and decision=='answer':problems.append('Unsupported request produced a factual answer')
    problems += ['Forbidden claim: '+s for s in turn.get('replyAbsent',[])if s.casefold()in text.casefold()]
    if page.evaluate(helpers.NO_HELP):problems.append('A removed help-level control/badge is present')
    return {'text':turn['text'],'decision':decision,'rendered':text,'citations':citations,'links':links,'expectedRecordIds':turn['expectedRecordIds'],
        'acceptedRecordAlternatives':[a['expectedRecordIds']for a in turn.get('answerAlternatives',[])],
        'recordIdObservation':'Oracle metadata; actual UI source citations checked. No module injection/expected-state seeding.',
        'problems':problems,'passed':not problems}


def layout(page,surface,width,height):
    page.set_viewport_size({'width':width,'height':height})
    assert not page.evaluate(helpers.NO_HELP),page.evaluate(helpers.NO_HELP)
    out={'viewport':[width,height],'composer':helpers.composer(page,surface),'scroll':helpers.check_scroll(page,surface)}
    if surface=='ultima7'and width==1280:
        box=page.locator('#ai-modal > div').first.bounding_box();chat=page.locator(SURFACES[surface][3]).bounding_box()
        assert box['width']>=900 and chat['width']>=800,{'modal':box,'chat':chat}
        assert chat['height']>=220,chat
        out['roomierSage']={'modal':box,'chat':chat}
    return out


def old_bundle_boundary(browser,base):
    # Fixed stale metadata mirrors the independently authored consent unit guard.
    # It deliberately has no intent-package disclosure, while its saved enabled
    # choice still matches its own old ID. No model worker fixture is used here.
    old={'schema':1,'id':'old-model-bundle','totalBytes':161786625}
    ctx=browser.new_context(service_workers='block',viewport={'width':1280,'height':900})
    requests=[];blocked=[];errors=[]
    ctx.add_init_script(script="""(()=>{
        window.rolloutAllWorkers=[];const NativeWorker=window.Worker;
        window.Worker=class extends NativeWorker{constructor(url,options){window.rolloutAllWorkers.push(String(url));super(url,options);}};
        localStorage.setItem('guide-assistant.preference.v1',JSON.stringify({schema:1,choice:'enabled',modelId:'old-model-bundle'}));
    })();""")
    def route(r):
        req=r.request;u=urlparse(req.url);requests.append({'url':req.url,'method':req.method,'hasBody':req.post_data_buffer is not None})
        if u.path=='/guides/local-assistant/profile.json':r.fulfill(status=200,content_type='application/json',body=json.dumps(old));return
        if u.path.endswith('/offline.js'):r.fulfill(status=200,content_type='text/javascript',body='// Isolated stale-bundle boundary.');return
        if req.method!='GET'or req.post_data_buffer is not None or u.hostname!=urlparse(base).hostname or u.port!=urlparse(base).port or u.path.endswith(('.bin','.wasm','.onnx')):
            blocked.append(req.url);r.abort();return
        r.continue_()
    ctx.route('**/*',route);page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(base+'/guides/StarcraftBWAPI.html',wait_until='networkidle')
        dialog=page.locator('#guide-assistant-consent')
        page.wait_for_function("document.querySelector('#guide-assistant-consent')?.open&&document.querySelector('#guide-assistant-consent').textContent.includes('Model settings could not be read')")
        assert page.evaluate("document.documentElement.dataset.guideChat!=='ready'")
        assert dialog.get_by_role('button',name='Enable chat',exact=True).is_disabled()
        dialog.get_by_role('button',name='Close',exact=True).click()
        page.locator('#main-nav [href="#getting-started"]').click()
        assert page.locator('#getting-started').is_visible(),'The ordinary static guide must remain usable'
        workers=page.evaluate('window.rolloutAllWorkers')
        assert not workers,workers
        assets=[x for x in requests if urlparse(x['url']).path.endswith(('.bin','.wasm','.onnx'))]
        assert not assets and not blocked and not errors,{'assets':assets,'blocked':blocked,'errors':errors}
        return {'passed':True,'oldMetadata':old,'savedChoiceId':'old-model-bundle','chatOff':True,'settingsErrorShown':True,'enableDisabled':True,'guideNavigationUsable':True,'workers':workers,'modelAssets':assets,'requests':requests,'pageErrors':errors}
    finally:ctx.close()


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--tag',default='first');args=parser.parse_args()
    if not args.tag.replace('-','').replace('_','').isalnum():parser.error('Invalid tag')
    output=HERE/'evidence'/f'rollout-browser-{args.tag}.json'
    if output.exists():parser.error('Report exists; choose a new tag')
    shots=HERE/'intent-prototype/results/rollout'/args.tag;shots.mkdir(parents=True,exist_ok=True)
    corpus=json.loads(CORPUS.read_text())
    watched=set((ROOT/'guides/js').rglob('*.js'))|set((ROOT/'guides/css').glob('*.css'))|set((ROOT/'guides/data/assistant').glob('*.json'))
    watched|={ROOT/'guides'/x[0]for x in SURFACES.values()};watched|={CORPUS,Path(__file__),HERE/'full-answer-browser.py',HERE/'browser-consent-fixture.js',ROOT/'guides/local-assistant/profile.json'}
    watched|=set((ROOT/'guides/local-assistant/intent').glob('*.json'))
    hashes=lambda:{str(p.relative_to(ROOT)):digest(p)for p in sorted(watched)}
    report={'schemaVersion':1,'realMiniLM':True,'generativeWorkerFixture':True,'nativeGenerativeInference':False,
        'corpusHash':digest(CORPUS),'sourceHashesBefore':hashes(),'turns':[],'layout':[],'expandedChat':[],'failures':[],
        'requests':[],'blockedRequests':[],'pageErrors':[],'workers':{},'storageUnchanged':{},'storageWrites':{},'screenshots':[]}
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));thread=Thread(target=server.serve_forever,daemon=True);thread.start()
    report['loopbackPort']=server.server_port
    try:
        with sync_playwright()as p:
            browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
            context=browser.new_context(service_workers='block',viewport={'width':1280,'height':900})
            # One script preserves constructor ordering: the approved fixture
            # wraps this transparent native observer, never the intent model.
            context.add_init_script(script=WORKER_OBSERVER+'\n'+CONSENT_FIXTURE+'\n'+helpers.STORAGE_OBSERVER)
            def route(r):
                req=r.request;u=urlparse(req.url);item={'url':req.url.split('?')[0],'method':req.method,'hasBody':req.post_data_buffer is not None};report['requests'].append(item)
                if req.method=='GET'and req.post_data_buffer is None and(req.url.startswith(('blob:','data:'))or(u.hostname=='127.0.0.1'and u.port==server.server_port)):r.continue_()
                else:report['blockedRequests'].append(item);r.abort()
            context.route('**/*',route)
            for surface,s in SURFACES.items():
                print('Opening '+surface+' with actual MiniLM…',flush=True)
                page=context.new_page();game=surface.split('-')[0]
                page.route('**/offline.js*',lambda r:r.fulfill(status=200,content_type='text/javascript',body='// Static UI acceptance isolates site-worker bootstrap.'))
                page.on('pageerror',lambda e,surface=surface:report['pageErrors'].append({'surface':surface,'error':str(e)}))
                try:
                    page.goto(f'http://127.0.0.1:{server.server_port}/guides/{s[0]}',wait_until='networkidle')
                    page.wait_for_function("document.documentElement.dataset.guideChat==='ready'",timeout=30000)
                    helpers.open_surface(page,surface)
                    metadata=page.evaluate('''async()=>{
                        const {intentRuntime}=await import('/guides/js/assistant/intent-runtime.js');
                        const metadata=await intentRuntime.prepare();return {metadata,state:intentRuntime.state};
                    }''')
                    before_storage=page.evaluate(helpers.STORAGE)
                    report.setdefault('model',{})[surface]=metadata
                    for dialog in [d for d in corpus['dialogues']if d['gameId']==game]:
                        page.get_by_role('button',name='Clear chat',exact=True).filter(visible=True).click()
                        for index,turn in enumerate(dialog['turns'],1):
                            try:item=send(page,surface,turn)
                            except Exception as exc:item={'passed':False,'problems':[str(exc)],'text':turn['text']}
                            item.update(surface=surface,dialogueId=dialog['id'],turn=index,expectedSupported=turn['supported'],expectedIntent=turn['intent'],inputControl=bool(turn.get('action')))
                            report['turns'].append(item)
                            if not item['passed']:report['failures'].append({'surface':surface,'dialogueId':dialog['id'],'turn':index,'text':turn['text'],'problems':item.get('problems')})
                        print(surface+' '+dialog['id']+': dialogue complete',flush=True)
                    for width,height in [(1280,900),(390,844)]:
                        try:
                            page.get_by_role('button',name='Clear chat',exact=True).filter(visible=True).click()
                            seed=next(t for d in corpus['dialogues']if d['gameId']==game for t in d['turns']if t['supported']and not t.get('consultation'))
                            result=send(page,surface,seed)
                            assert result['passed'],result
                            item=layout(page,surface,width,height);item.update(surface=surface,passed=True)
                            report['layout'].append(item)
                            if surface=='ultima7':
                                path=shots/f'ultima7-{width}.png';page.screenshot(path=str(path));report['screenshots'].append(str(path.relative_to(ROOT)))
                            expand=page.get_by_role('button',name='Expand chat',exact=True).filter(visible=True)
                            expand.click();dialog=page.locator('dialog[open]').filter(visible=True)
                            assert dialog.count()==1,'Expected exactly one actual expanded native dialog'
                            assert dialog.locator('input,textarea').filter(visible=True).count()>=1,'Expanded composer missing'
                            assert page.locator(s[3]).is_visible(),'Actual conversation must remain visible in expanded chat'
                            expanded_replies=[send(page,surface,seed) for _ in range(5)]
                            assert all(r['passed']for r in expanded_replies),expanded_replies
                            expanded=helpers.composer(page,surface);bounds=dialog.bounding_box()
                            assert bounds['width']>=min(width-40,1000) and bounds['height']>=height*.75,bounds
                            expanded_scroll=helpers.check_scroll(page,surface,long=True)
                            page.keyboard.press('Escape');assert not page.locator('dialog[open]').count(),'Escape did not close expanded chat'
                            returned=send(page,surface,seed);assert returned['passed'],returned
                            report['expandedChat'].append({'surface':surface,'viewport':[width,height],'bounds':bounds,'composer':expanded,'scroll':expanded_scroll,'sourceReplies':expanded_replies,'afterReturn':returned,'passed':True})
                        except Exception as exc:report['failures'].append({'surface':surface,'viewport':[width,height],'stage':'layout/expanded','error':str(exc)})
                    report['storageUnchanged'][surface]=before_storage==page.evaluate(helpers.STORAGE)
                except Exception as exc:report['failures'].append({'surface':surface,'stage':'setup','error':str(exc)})
                finally:
                    report['workers'][surface]=page.evaluate('window.rolloutIntentWorkers||[]')
                    report['storageWrites'][surface]=page.evaluate('window.fullAnswerStorageWrites||[]')
                    page.close()
                print(surface+': '+str(sum(x['passed']for x in report['turns']if x['surface']==surface))+' source turns passed',flush=True)
            try:report['oldBundleBoundary']=old_bundle_boundary(browser,f'http://127.0.0.1:{server.server_port}')
            except Exception as exc:
                report['oldBundleBoundary']={'passed':False,'error':str(exc)};report['failures'].append({'stage':'old-cached-bundle-boundary','error':str(exc)})
            report['browser']=browser.version;browser.close()
    finally:
        server.shutdown();server.server_close();thread.join(timeout=5)
        report['serverClosed']=not thread.is_alive();report['sourceHashesAfter']=hashes()
        report['sourceFilesUnchangedDuringRun']=report['sourceHashesBefore']==report['sourceHashesAfter']
        report['onlyStaticGets']=all(x['method']=='GET'and not x['hasBody']for x in report['requests'])
        report['nativeIntentEvidence']={surface:{'workers':len(ws),'ready':sum(e['type']=='ready'for w in ws for e in w['events']),
            'classifications':sum(e['direction']=='send'and e['type']=='classify'for w in ws for e in w['events']),
            'results':sum(e['direction']=='receive'and e['type']=='result'for w in ws for e in w['events'])}for surface,ws in report['workers'].items()}
        writes=[{'surface':s,**w}for s,rows in report['storageWrites'].items()for w in rows if w['key']!='guide-assistant.preference.v1']
        boundary={'allSurfacesRan':len(report['workers'])==7,'realIntentEverySurface':all(x['ready']>=1 and x['classifications']>=1 and x['results']>=1 for x in report['nativeIntentEvidence'].values()),
            'storageUnchanged':len(report['storageUnchanged'])==7 and all(report['storageUnchanged'].values()),'noSavedGameWrites':not writes,
            'noExternalRequests':not report['blockedRequests'],'noPageErrors':not report['pageErrors'],'onlyStaticGets':report['onlyStaticGets'],
            'sourceFilesUnchanged':report['sourceFilesUnchangedDuringRun'],'serverClosed':report['serverClosed']}
        report['boundaries']=boundary
        if not all(boundary.values()):report['failures'].append({'stage':'boundaries','checks':boundary,'savedGameWrites':writes})
        report['passedTurns']=sum(x['passed']for x in report['turns']);report['totalTurns']=len(report['turns'])
        report['turnCategories']={}
        for category,predicate in [('supportedFactual',lambda x:x['expectedSupported']),('unsupported',lambda x:not x['expectedSupported']and not x['inputControl']),('control',lambda x:x['inputControl'])]:
            rows=[x for x in report['turns']if predicate(x)];report['turnCategories'][category]={'passed':sum(x['passed']for x in rows),'total':len(rows)}
        output.parent.mkdir(exist_ok=True);output.write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'report':str(output.relative_to(ROOT)),'passedTurns':report['passedTurns'],'totalTurns':report['totalTurns'],'turnCategories':report['turnCategories'],'layoutChecks':len(report['layout']),'expandedChecks':len(report['expandedChat']),'boundaries':boundary,'failures':report['failures']},indent=2),flush=True)
    assert report['totalTurns']==126 and len(report['layout'])==14 and len(report['expandedChat'])==14 and not report['failures'],report['failures']

if __name__=='__main__':main()
