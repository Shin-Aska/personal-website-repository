"""Run actual MiniLM classification in the isolated loopback browser lab.

Uses existing Playwright/Chrome and Node-prepared local files. Installs nothing,
blocks external network requests, and never changes guide progress or production
assets. Reports preserve classifier errors; there is no fabricated accuracy gate.
"""
import argparse
import hashlib
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]

def hashes():
    watched=list(HERE.glob('*.mjs'))+list(HERE.glob('*.json'))+list((HERE/'cases').glob('*.json'))
    watched+=[HERE/'index.html',HERE/'run-browser.py']
    watched+=list((ROOT/'guides/js/assistant').rglob('*.js'))
    watched+=[ROOT/'guides/StarcraftBWAPI.html',ROOT/'guides/Ultima7.html',HERE/'assets/profile.json']
    return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in watched}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tag',default='initial')
    parser.add_argument('--port',type=int,default=0,help='Loopback test port; 0 selects a free port without interrupting the preview')
    args=parser.parse_args()
    if not args.tag.replace('-','').replace('_','').isalnum():parser.error('Invalid tag')
    output=HERE/'results'/f'{args.tag}.json'
    if output.exists():parser.error('Report already exists; choose a new tag to preserve results')
    output.parent.mkdir(exist_ok=True)
    before=hashes()
    requests,blocked,errors,console,smoke=[],[],[],[],[]
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',args.port),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
            context=browser.new_context(service_workers='block',viewport={'width':1280,'height':900})
            def route(r):
                url=r.request.url
                if url.startswith(('blob:','data:')) or urlparse(url).hostname=='127.0.0.1':r.continue_()
                else:blocked.append(url.split('?')[0]);r.abort()
            context.route('**/*',route)
            context.on('request',lambda r:requests.append({'url':r.url.split('?')[0],'method':r.method,'hasBody':r.post_data_buffer is not None}))
            page=context.new_page()
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('console',lambda m:console.append({'type':m.type,'text':m.text}) if m.type=='error' else None)
            page.goto(f'http://127.0.0.1:{server.server_port}/guides/tests/assistant/intent-prototype/',wait_until='networkidle')
            assert page.locator('select').count()==1 and page.locator('select').get_attribute('id')=='game','Only the guide selector belongs in the chat controls'
            assert page.locator('input[type="radio"]').count()==0,'Answer-level radio controls must not appear'
            storage=page.evaluate('JSON.stringify({...localStorage})')
            # Synthetic preparation failure only: no fixture file is edited and
            # the real frozen validation split is restored before evaluation.
            page.route('**/cases/validation-v2.json',lambda r:r.fulfill(status=200,content_type='application/json',body='{"schema":1,"samples":[]}'))
            page.click('#prepare')
            page.wait_for_function("document.getElementById('status').textContent.includes('validationPredictions')",timeout=120000)
            retry={'injectedFailure':'Empty validation response during first preparation only',
                'headUnpublishedAfterFailure':page.evaluate('!window.intentPrototype.head')}
            assert retry['headUnpublishedAfterFailure'],'Failed preparation published a partial classifier'
            page.unroute('**/cases/validation-v2.json')
            print('Preparing real MiniLM encoder and training the linear head…',flush=True)
            page.click('#prepare')
            page.wait_for_function("!document.getElementById('question').disabled || document.getElementById('status').textContent.includes('failed')",timeout=120000)
            if page.locator('#question').is_disabled():raise RuntimeError(page.locator('#status').inner_text())
            print('Running the frozen evaluation…',flush=True)
            report=page.evaluate('async()=>await window.intentPrototype.evaluate()')
            report['followups']=page.evaluate('async()=>await window.intentPrototype.evaluateFollowups()')
            report['consultations']=page.evaluate('async()=>await window.intentPrototype.evaluateConsultations()')
            output.write_text(json.dumps({**report,'browserAcceptanceComplete':False},indent=2)+'\n')
            retry['retrySucceeded']=True
            report['preparationRetry']=retry
            report['controlGuards']=page.evaluate('''async()=>{
                const {checkLabControls}=await import('./lab-browser-checks.mjs');
                return checkLabControls(window.intentPrototype,document);
            }''')
            assert report['controlGuards']['passed'],report['controlGuards']
            ui_chats=[('ultima7',[('Who is Iolo?','Bard'),('where is he?','Trinsic'),('stats','Strength 18')]),
                ('starcraft',[('what is schnail','Human and AI League'),('download link','Account required')])]
            for game,turns in ui_chats:
                page.evaluate('(game)=>window.intentPrototype.setGame(game)',game)
                for text,expected in turns:
                    before_cards=page.locator('#chat .turn').count()
                    page.locator('#question').fill(text);page.click('#send')
                    page.wait_for_function('(count)=>document.querySelectorAll("#chat .turn").length>count',arg=before_cards)
                    answer=page.locator('#chat .turn').last.locator('.prototype-answer')
                    rendered=answer.inner_text()
                    assert expected.lower() in rendered.lower(),{'gameId':game,'text':text,'answer':rendered}
                    policies=page.evaluate('window.intentPrototype.inspect()')
                    assert policies['originalPolicy']=='direct' and policies['proposedPolicy']=='direct',policies
                    links=answer.locator('a[href]').evaluate_all('(nodes)=>nodes.map(node=>node.href)')
                    if text=='download link':assert links==['https://www.schnail.com/#/downloads'],links
                    smoke.append({'gameId':game,'text':text,'rendered':rendered,'links':links})
                page.locator('#chat').screenshot(path=str(output.with_name(args.tag+'-'+game+'.png')))
            page.evaluate("window.intentPrototype.setGame('starcraft')")
            consultation_question='I am playing StarCraft Remastered. Which one is the best, do you think?'
            page.locator('#question').fill(consultation_question);page.click('#send')
            page.wait_for_function('document.querySelectorAll("#chat .turn").length===1')
            advice=page.locator('#chat .turn').last.locator('.prototype-answer').inner_text()
            assert all(phrase in advice for phrase in ['Remastered SCM Map','Use Map Settings','SCHNAIL']),advice
            assert 'not answered' not in advice.lower(),advice
            policies=page.evaluate('window.intentPrototype.inspect()')
            assert policies['originalPolicy']=='direct' and policies['proposedPolicy']=='direct',policies
            page.locator('#chat').screenshot(path=str(output.with_name(args.tag+'-consultation.png')))
            page.locator('#question').fill('download link');page.click('#send')
            page.wait_for_function('document.querySelectorAll("#chat .turn").length===2')
            advice_links=page.locator('#chat .turn').last.locator('.prototype-answer a[href]').evaluate_all('(nodes)=>nodes.map(node=>node.href)')
            assert sorted(advice_links)==sorted(['https://drive.proton.me/urls/55AMBJ5FN4#BB7pM4E3tZeE','https://www.richardorilla.website/files/bwapiscr.zip']),advice_links
            report['consultationUiSmoke']={'question':consultation_question,'answer':advice,'followup':'download link','followupUrls':advice_links}
            page.set_viewport_size({'width':390,'height':844})
            for selector in ['#question','#send','#game']:
                page.locator(selector).scroll_into_view_if_needed()
                assert page.locator(selector).is_visible(),selector
            page.screenshot(path=str(output.with_suffix('.png')),full_page=True)
            report['browser']=browser.version
            report['chatAnswerMode']='direct'
            report['lowerTierChecks']='Internal source-authorization fixtures only; there is no user-facing answer-level control.'
            report['uiSmoke']=smoke
            report['storageUnchanged']=storage==page.evaluate('JSON.stringify({...localStorage})')
            report['requests']=requests;report['blockedExternalRequests']=blocked;report['pageErrors']=errors;report['consoleErrors']=console
            report['onlyStaticGets']=all(r['method']=='GET' and not r['hasBody'] for r in requests)
            report['sourceHashesBefore']=before;report['sourceHashesAfter']=hashes()
            report['sourceFilesUnchangedDuringRun']=before==report['sourceHashesAfter']
            report['browserAcceptanceComplete']=True
            output.write_text(json.dumps(report,indent=2)+'\n')
            assert report['storageUnchanged'] and not blocked and not errors and report['onlyStaticGets'] and report['sourceFilesUnchangedDuringRun'], 'Browser boundary check failed; inspect report'
            print(json.dumps({'report':str(output.relative_to(ROOT)),'model':report['model'],'classification':report['classification']['metrics'],
                'consultations':{'passed':report['consultations']['passed'],'total':report['consultations']['total'],'failures':report['consultations']['failures']},'followupBehavior':{'passed':report['followups']['passed'],'total':report['followups']['total'],'intentMatches':report['followups']['intentMatches'],'failures':report['followups']['failures']},'parserAgreement':report['parserAgreement'],'dialogueIntentMatches':report['dialogueIntentMatches'],
                'dialogueEntityMatches':report['dialogueEntityMatches'],'dialogueTurns':report['dialogueTurns'],
                'singleQuestionInference':report['singleQuestionInference'],'controlGuards':report['controlGuards'],
                'preparationRetry':retry,'pageErrors':errors,'consoleErrors':console},indent=2),flush=True)
            browser.close()
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':main()
