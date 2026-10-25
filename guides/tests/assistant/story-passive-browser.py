"""Passive story-role regressions through actual MiniLM and production guide UI.

Only the existing explicit generative Worker fixture is used. Intent inference
uses the real packaged native MiniLM worker. No expected labels/entities/roles
are supplied to runtime. Static loopback GETs only; no installs or downloads.
"""
import argparse
import hashlib
import importlib.util
import json
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[2]
spec=importlib.util.spec_from_file_location('rollout_helpers',HERE/'rollout-browser.py')
R=importlib.util.module_from_spec(spec);spec.loader.exec_module(R)
CORPUS=HERE/'story-passive-cases.json'


def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def select_context(page,game,context):
    if game=='albion':
        page.evaluate("activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('maini')")
    else:
        if page.locator('#ai-modal').is_visible():page.click('#close-ai-modal')
        page.locator('button[data-target="quests"]').click()
        if context=='blorn':
            page.locator('.quest-tab-button[data-quest-tab="side"]').click()
            page.locator("button.get-side-quest-hint[data-quest-name=\"Blorn's Accusations\"]").click()
        else:
            page.locator('.quest-tab-button[data-quest-tab="main"]').click()
            index=0 if context=='trinsic'else 1
            button=page.locator('#main-quest-accordion .get-main-quest-hint').nth(index)
            if not button.evaluate("e=>Boolean(e.parentElement.style.maxHeight)&&e.parentElement.style.maxHeight!=='0px'"):
                page.locator('#main-quest-accordion .quest-item').nth(index).click()
            button.click()
    page.locator(R.SURFACES[game][1]).wait_for(state='visible')
    page.get_by_role('button',name='Clear chat',exact=True).filter(visible=True).click()


def assert_roles(result,turn):
    role=turn.get('expectedRole');text=result.get('rendered','');problems=result.setdefault('problems',[])
    if role:
        labels={'victim':r'\bVictims?\s*:','perpetrator':r'\b(?:Perpetrators?|Killers?|Murderers?)\s*:',
            'accusation-victim':r'\bVictims?\s*:','suspect':r'\bSuspect(?: clue)?\s*:'}
        if role in labels and not re.search(labels[role],text,re.I):problems.append('Missing requested semantic story-role heading: '+role)
        if role=='participants':
            for label,names in turn['rolePeople'].items():
                pattern=r'\b(?:Killers?|Perpetrators?)\s*:\s*([^\n]+)'if label=='killers'else r'\bVictims?\s*:\s*([^\n]+)'
                line=re.search(pattern,text,re.I)
                if not line or any(name.casefold()not in line.group(1).casefold()for name in names):problems.append('Missing correct explicit '+label+' pairing: '+', '.join(names))
                wrong=turn['rolePeople']['victims'if label=='killers'else'killers']
                if line and any(name.casefold()in line.group(1).casefold()for name in wrong):problems.append('Perpetrator/victim names inverted on '+label+' line')
    result['passed']=not problems
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--tag',default='first');parser.add_argument('--reported-only',action='store_true');args=parser.parse_args()
    if not args.tag.replace('-','').replace('_','').isalnum():parser.error('Invalid tag')
    output=HERE/'evidence'/f'story-passive-browser-{args.tag}.json'
    if output.exists():parser.error('Report exists; preserve it and choose another tag')
    corpus=json.loads(CORPUS.read_text())
    scenarios=[{'id':c['id'],'gameId':c['gameId'],'pageContext':c['pageContext'],'turns':[c]}for c in corpus['cases']]+corpus['dialogues']
    if args.reported_only:scenarios=scenarios[:2]+[dict(corpus['dialogues'][0],turns=corpus['dialogues'][0]['turns'][:3])]
    watched=set((ROOT/'guides/js').rglob('*.js'))|set((ROOT/'guides/css').glob('*.css'))|set((ROOT/'guides/data/assistant').glob('*.json'))
    watched|={ROOT/'guides/Ultima7.html',ROOT/'guides/Albion.html',CORPUS,Path(__file__),HERE/'rollout-browser.py',ROOT/'guides/local-assistant/profile.json',ROOT/'guides/local-assistant/intent/profile.json'}
    hashes=lambda:{str(p.relative_to(ROOT)):digest(p)for p in sorted(watched)}
    report={'schemaVersion':1,'realMiniLM':True,'generativeWorkerFixture':True,'nativeGenerativeInference':False,'reportedOnly':args.reported_only,
        'corpusHash':digest(CORPUS),'sourceHashesBefore':hashes(),'turns':[],'failures':[],'requests':[],'blocked':[],'pageErrors':[],
        'workers':{},'storageUnchanged':{},'storageWrites':{},'screenshots':[]}
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));thread=Thread(target=server.serve_forever,daemon=True);thread.start()
    try:
        with sync_playwright()as p:
            browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
            ctx=browser.new_context(service_workers='block',viewport={'width':1280,'height':900})
            ctx.add_init_script(script=R.WORKER_OBSERVER+'\n'+R.CONSENT_FIXTURE+'\n'+R.helpers.STORAGE_OBSERVER)
            def route(r):
                q=r.request;u=urlparse(q.url);report['requests'].append({'url':q.url,'method':q.method,'hasBody':q.post_data_buffer is not None})
                if q.method=='GET'and q.post_data_buffer is None and(q.url.startswith(('blob:','data:'))or(u.hostname=='127.0.0.1'and u.port==server.server_port)):r.continue_()
                else:report['blocked'].append(q.url);r.abort()
            ctx.route('**/*',route)
            for game in dict.fromkeys(s['gameId']for s in scenarios):
                page=ctx.new_page();page.route('**/offline.js*',lambda r:r.fulfill(status=200,content_type='text/javascript',body='// Isolated story UI acceptance.'))
                page.on('pageerror',lambda e,game=game:report['pageErrors'].append({'gameId':game,'error':str(e)}))
                try:
                    page.goto(f'http://127.0.0.1:{server.server_port}/guides/{R.SURFACES[game][0]}',wait_until='networkidle')
                    page.wait_for_function("document.documentElement.dataset.guideChat==='ready'");R.helpers.open_surface(page,game)
                    report.setdefault('model',{})[game]=page.evaluate("async()=>{const{intentRuntime}=await import('/guides/js/assistant/intent-runtime.js');await intentRuntime.prepare();return intentRuntime.state}")
                    initial_storage=page.evaluate(R.helpers.STORAGE)
                    for scenario in [s for s in scenarios if s['gameId']==game]:
                        select_context(page,game,scenario['pageContext'])
                        for index,turn in enumerate(scenario['turns'],1):
                            try:result=assert_roles(R.send(page,game,turn),turn)
                            except Exception as exc:result={'passed':False,'problems':[str(exc)],'text':turn['text']}
                            result.update(gameId=game,scenarioId=scenario['id'],turn=index,expectedRole=turn.get('expectedRole'),expectedSupported=turn['supported'],contextStatement=bool(turn.get('contextStatement')))
                            report['turns'].append(result)
                            if not result['passed']:report['failures'].append({k:result[k]for k in ['gameId','scenarioId','turn','text','problems']})
                        print(scenario['id']+': '+str(sum(t['passed']for t in report['turns']if t['scenarioId']==scenario['id']))+'/'+str(len(scenario['turns'])),flush=True)
                        if scenario['id']=='reported-warm-role-switches':
                            shots=HERE/'intent-prototype/results/story-passive'/args.tag;shots.mkdir(parents=True,exist_ok=True);path=shots/'warm-role-switches.png';page.screenshot(path=str(path));report['screenshots'].append(str(path.relative_to(ROOT)))
                    report['storageUnchanged'][game]=initial_storage==page.evaluate(R.helpers.STORAGE)
                except Exception as exc:report['failures'].append({'gameId':game,'stage':'setup','error':str(exc)})
                finally:
                    report['workers'][game]=page.evaluate('window.rolloutIntentWorkers||[]');report['storageWrites'][game]=page.evaluate('window.fullAnswerStorageWrites||[]');page.close()
            report['browser']=browser.version;browser.close()
    finally:
        server.shutdown();server.server_close();thread.join(timeout=5)
        report['serverClosed']=not thread.is_alive();report['sourceHashesAfter']=hashes();report['sourceFilesUnchanged']=report['sourceHashesBefore']==report['sourceHashesAfter']
        report['nativeIntentEvidence']={g:{'ready':sum(e['type']=='ready'for w in ws for e in w['events']),'classifications':sum(e['direction']=='send'and e['type']=='classify'for w in ws for e in w['events']),'results':sum(e['direction']=='receive'and e['type']=='result'for w in ws for e in w['events'])}for g,ws in report['workers'].items()}
        writes=[w for rows in report['storageWrites'].values()for w in rows if w['key']!='guide-assistant.preference.v1']
        report['boundaries']={'actualMiniLMEveryGame':all(x['ready']and x['classifications']and x['results']for x in report['nativeIntentEvidence'].values()),'storageUnchanged':bool(report['storageUnchanged'])and all(report['storageUnchanged'].values()),'noSavedGameWrites':not writes,'noExternalRequests':not report['blocked'],'noPageErrors':not report['pageErrors'],'onlyStaticGets':all(x['method']=='GET'and not x['hasBody']for x in report['requests']),'sourceFilesUnchanged':report['sourceFilesUnchanged'],'ownedServerClosed':report['serverClosed']}
        if not all(report['boundaries'].values()):report['failures'].append({'stage':'boundaries','checks':report['boundaries']})
        report['categories']={}
        for category,pred in [('supported',lambda x:x['expectedSupported']),('unsupported',lambda x:not x['expectedSupported']and not x['contextStatement']),('contextStatement',lambda x:x['contextStatement'])]:
            rows=[x for x in report['turns']if pred(x)];report['categories'][category]={'passed':sum(x['passed']for x in rows),'total':len(rows)}
        report['passed']=sum(x['passed']for x in report['turns']);report['total']=len(report['turns']);output.write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'report':str(output.relative_to(ROOT)),'passed':report['passed'],'total':report['total'],'categories':report['categories'],'boundaries':report['boundaries'],'failures':report['failures']},indent=2),flush=True)
    expected=5 if args.reported_only else 49
    assert report['total']==expected and not report['failures'],report['failures']

if __name__=='__main__':main()
