"""Seven real production guide surfaces: full answers with no help-level UI.

Uses the existing approved consent/Worker fixture and real production UI/engine.
It installs/downloads nothing and does not claim native model inference. Serves
this checkout on a self-owned loopback port, blocks external/non-GET requests,
and closes its own server. Run after the shared UI and guide edits are stable.
"""
import argparse
import hashlib
import json
import shutil
import subprocess
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse

from browser_consent_fixture import CONSENT_FIXTURE

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SURFACES = {
    'albion': ('Albion.html', '#walkthrough-ai-input', '#walkthrough-ai-send', '#walkthrough-ai-body'),
    'ultima5': ('Ultima5.html', '#seer-query', '#ask-seer', '#seer-response'),
    'ultima6': ('Ultima6.html', '#seer-query', '#ask-seer', '#seer-chat-messages'),
    'ultima7': ('Ultima7.html', '.sage-input', '.sage-send', '.sage-messages'),
    'alqadim': ('AlQadim.html', '#walkthrough-ai-input-tab', '#walkthrough-ai-send-tab', '#walkthrough-ai-body-tab'),
    'alqadim-walkthrough': ('AlQadim.html', '#walkthrough-ai-input', '#walkthrough-ai-send', '#walkthrough-ai-body'),
    'starcraft': ('StarcraftBWAPI.html', '#sc-ai-input', '#sc-ai-send', '#sc-ai-chat'),
}
# Questions/snippets/record identities are reused unchanged from the reviewed
# narrative fixtures; none is derived from the reply rendered during this run.
QUESTIONS = {
    'albion': 'What is the method for the path to Toronto?',
    'ultima5': 'What is the method for the Sandalwood Box?',
    'ultima6': "What is the next step in the Merchants' Circuit?",
    'ultima7': 'Why was Inamo killed?',
    'alqadim': 'What is the method for getting the Family Sword of Honor?',
    'starcraft': 'Summarize SCHNAIL',
}
STORAGE = 'JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))'
STORAGE_OBSERVER = r"""(() => {
    window.fullAnswerStorageWrites=[];
    for(const method of ['setItem','removeItem','clear']){
        const original=Storage.prototype[method];
        Storage.prototype[method]=function(...args){
            if(this===window.localStorage)window.fullAnswerStorageWrites.push({method,key:method==='clear'?null:String(args[0])});
            return Reflect.apply(original,this,args);
        };
    }
})();"""
NO_HELP = r'''() => {
    const explicit=[...document.querySelectorAll('.sage-spoiler,#seer-spoiler-select,#sc-assistant-spoiler,.ga-level,.ga-level-note,.ga-level-title,.ga-msg-level,[name="spoiler"],[name="help-level"]')];
    const selects=[...document.querySelectorAll('select')].filter(e=>[...e.options].some(o=>['gentle','balanced','direct','light'].includes(o.value)));
    const controls=[...document.querySelectorAll('.guide-assistant-controls [role="radio"],.guide-assistant-controls [role="radiogroup"],.guide-assistant-controls [data-level]')];
    return [...new Set([...explicit,...selects,...controls])].map(e=>({tag:e.tagName,id:e.id,className:e.className,hidden:e.hidden,ariaHidden:e.getAttribute('aria-hidden')}));
}'''
GEOMETRY = r'''selector => {
    const e=document.querySelector(selector),r=e.getBoundingClientRect();
    let l=Math.max(0,r.left),t=Math.max(0,r.top),b=Math.min(innerHeight,r.bottom),rr=Math.min(innerWidth,r.right);
    for(let p=e.parentElement;p&&p!==document.body&&p!==document.documentElement;p=p.parentElement){
        const s=getComputedStyle(p),q=p.getBoundingClientRect();
        if(['auto','scroll','hidden','clip'].includes(s.overflowY)){t=Math.max(t,q.top+p.clientTop);b=Math.min(b,q.top+p.clientTop+p.clientHeight);}
        if(['auto','scroll','hidden','clip'].includes(s.overflowX)){l=Math.max(l,q.left+p.clientLeft);rr=Math.min(rr,q.left+p.clientLeft+p.clientWidth);}
    }
    const point={x:(l+rr)/2,y:(t+b)/2},hit=rr>l&&b>t?document.elementFromPoint(point.x,point.y):null;
    return {width:r.width,height:r.height,visibleWidth:Math.max(0,rr-l),visibleHeight:Math.max(0,b-t),hit:hit===e||e.contains(hit),point};
}'''
SCROLL = r'''selector => {
    const e=document.querySelector(selector),r=e.getBoundingClientRect(),cards=[...e.querySelectorAll('.guide-assistant-message')];
    const rect=x=>{const q=x.getBoundingClientRect();return {top:q.top,bottom:q.bottom,height:q.height,clientHeight:x.clientHeight,scrollHeight:x.scrollHeight};};
    return {top:r.top+e.clientTop,bottom:r.top+e.clientTop+e.clientHeight,scrollTop:e.scrollTop,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,count:cards.length,first:cards[0]&&rect(cards[0]),last:cards.at(-1)&&rect(cards.at(-1)),cards:cards.map(rect)};
}'''


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_oracles(node):
    fixtures = json.loads((HERE/'narrative-all-games-cases.json').read_text())
    oracles = {game: next(dict(c) for c in fixtures if c['gameId'] == game and c['question'] == q)
               for game, q in QUESTIONS.items()}
    script = """import fs from 'node:fs';
import {allRecords} from './guides/tests/assistant/load-records.mjs';
import {authorize} from './guides/js/assistant/policy.js';
const starcraft=JSON.parse(fs.readFileSync('./guides/tests/assistant/evidence/conversation-starcraft-source-records.json','utf8'));
const records=[...Object.values(allRecords).flat(),...starcraft];
process.stdout.write(JSON.stringify(records.map(record=>({record,gentleAuthorized:!!authorize(record,'gentle'),directAuthorized:!!authorize(record,'direct')}))));"""
    records = json.loads(subprocess.check_output([node, '--input-type=module', '-e', script], cwd=ROOT, text=True))
    by_id = {x['record']['id']: x for x in records}
    for case in oracles.values():
        source = by_id[case['recordId']]
        assert case['spoiler'] == 'direct' and source['directAuthorized'] and not source['gentleAuthorized'], case
        case['sourceOracle'] = source
    return oracles


def open_surface(page, surface):
    game = surface.split('-')[0]
    if game == 'albion':
        page.evaluate("activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro')")
    elif game == 'ultima5':
        page.evaluate("showUltima5Section('counsel')")
    elif game == 'ultima6':
        page.evaluate("openSeerForQuest('act-i-liberating-the-shrines','compassion-britain')")
    elif game == 'ultima7':
        page.locator('button[data-target="quests"]').click()
        page.locator('.quest-item').first.click()
        page.locator('.get-main-quest-hint').first.click()
    elif game == 'alqadim':
        page.wait_for_function('Object.keys(genieViews).length===2')
        tab = 'walkthrough' if surface.endswith('-walkthrough') else 'genie'
        page.locator(f'button[data-target="{tab}"]').click()
    elif game == 'starcraft':
        page.click('#main-nav [href="#ai-assistant"]')
    page.locator(SURFACES[surface][1]).wait_for(state='visible')


def reopen_and_change_context(page, surface):
    game = surface.split('-')[0]
    if game == 'ultima6':
        page.click('#close-seer-modal')
        page.evaluate("openSeerForQuest('act-i-liberating-the-shrines','sacrifice-minoc')")
    elif game == 'ultima7':
        page.click('#close-ai-modal')
        page.locator('.quest-item').nth(1).click()
        page.locator('.get-main-quest-hint').nth(1).click()
    elif game == 'albion':
        page.evaluate("activateAlbionSection('briefing','auto');activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('gratogel')")
    elif game == 'ultima5':
        page.evaluate("showUltima5Section('quests');showUltima5Section('counsel')")
    elif game == 'alqadim':
        target = 'walkthrough' if surface.endswith('-walkthrough') else 'genie'
        page.locator('button[data-target="briefing"]').click()
        page.locator('button[data-target="walkthrough"]').click()
        page.evaluate('toggleChapter(2)')
        page.locator(f'button[data-target="{target}"]').click()
    elif game == 'starcraft':
        page.click('#main-nav [href="#getting-started"]')
        page.click('#main-nav [href="#ai-assistant"]')
    page.locator(SURFACES[surface][1]).wait_for(state='visible')


def ask(page, surface, oracle, question=None):
    _, input_sel, send_sel, log_sel = SURFACES[surface]
    question = question or oracle['question']
    page.evaluate('selector=>{window.fullAnswerPreviousNode=document.querySelector(selector).lastElementChild}',log_sel)
    page.locator(input_sel).fill(question)
    page.locator(send_sel).click(timeout=10000)
    page.wait_for_function(r'''([log,send,q])=>{
        const e=document.querySelector(log),n=[...e.querySelectorAll('.guide-assistant-message')],last=n.at(-1);
        return !window.fullAnswerPreviousNode?.isConnected&&last?.classList.contains('ai')&&last.dataset.decision&&last.dataset.decision!=='pending'
            &&n.at(-2)?.querySelector('.ga-msg-text')?.textContent===q&&!document.querySelector(send).disabled;
    }''', arg=[log_sel,send_sel,question], timeout=20000)
    block = page.locator(log_sel+' .guide-assistant-message.ai').last
    rendered = block.locator('.ga-msg-text').inner_text()
    decision=block.get_attribute('data-decision')
    assert decision == 'answer', {'rendered':rendered,'decision':decision}
    for phrase in oracle['contains']:
        assert phrase.casefold() in rendered.casefold(), {'missing':phrase,'rendered':rendered}
    citation=block.locator('.ga-msg-source').inner_text()
    record=oracle['sourceOracle']['record']
    direct=record['variants']['direct']
    source=direct.get('source',record['source']) if isinstance(direct,dict) else record['source']
    if source.get('review')=='external-research':
        assert all(ref['url'] in citation and ref['label'] in citation for ref in source['references']), {'expectedSource':source,'citation':citation}
    else:
        assert source['file'] in citation and source['locator'] in citation, {'expectedSource':source,'citation':citation}
    return {'question':question,'rendered':rendered,'decision':decision,'citation':citation,
        'expectedRecordId':oracle['recordId'],'recordIdObservation':'Not exposed by current production UI; canonical oracle ID plus actual rendered source provenance checked.',
        'directOnlyOracle':True}



def composer(page, surface):
    out={}
    for name, selector in zip(('input','send'),SURFACES[surface][1:3]):
        page.locator(selector).evaluate("e=>e.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})")
        geom=page.evaluate(GEOMETRY,selector)
        assert geom['hit'] and geom['visibleWidth']>=geom['width']-2 and geom['visibleHeight']>=geom['height']-2, (surface,name,geom)
        out[name]=geom
    return out


def check_scroll(page,surface,long=False):
    selector=SURFACES[surface][3]
    page.locator(selector).evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
    page.locator(selector).evaluate('e=>e.scrollTop=0')
    old=page.evaluate(SCROLL,selector)
    assert old['clientHeight']>=80 and old['first']['top']<old['bottom'] and old['first']['bottom']>old['top'], old
    assert all(c['scrollHeight']<=c['clientHeight']+2 for c in old['cards']), old
    page.locator(selector).evaluate('e=>e.scrollTop=e.scrollHeight')
    new=page.evaluate(SCROLL,selector)
    assert new['last']['bottom']<=new['bottom']+2 and new['last']['bottom']>new['top'], new
    result={'oldest':old,'newest':new}
    if long:
        assert new['scrollTop']>0 and new['count']>=10, new
        geo=page.evaluate(GEOMETRY,selector)
        assert geo['hit'],geo
        page.mouse.move(geo['point']['x'],geo['point']['y'])
        page.mouse.wheel(0,-500);page.wait_for_timeout(180)
        up=page.locator(selector).evaluate('e=>e.scrollTop')
        page.mouse.wheel(0,500);page.wait_for_timeout(180)
        down=page.locator(selector).evaluate('e=>e.scrollTop')
        assert up<new['scrollTop'] and down>up, {'start':new['scrollTop'],'up':up,'down':down}
        result['wheel']={'start':new['scrollTop'],'up':up,'down':down}
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tag',default='final')
    parser.add_argument('--browser-executable',default='/usr/bin/google-chrome',
                        help='Existing Chromium/Chrome executable; no browser is installed or downloaded.')
    parser.add_argument('--node',default=shutil.which('node') or '/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node')
    args=parser.parse_args()
    from playwright.sync_api import sync_playwright
    if not args.tag.replace('-','').replace('_','').isalnum():parser.error('Invalid report tag')
    output=HERE/'evidence'/f'full-answer-browser-{args.tag}.json'
    if output.exists():parser.error('Report already exists; use a new tag to preserve results')
    shots=HERE/'intent-prototype/results/full-answer'/args.tag
    shots.mkdir(parents=True,exist_ok=True)
    oracles=load_oracles(args.node)
    watched=set((ROOT/'guides/js').rglob('*.js'))|set((ROOT/'guides/css').glob('*.css'))|set((ROOT/'guides/data/assistant').glob('*.json'))
    watched|={ROOT/'guides'/x[0] for x in SURFACES.values()}
    watched|={Path(__file__),HERE/'narrative-all-games-cases.json',HERE/'browser-consent-fixture.js',HERE/'browser_conversation_observer.py'}
    hashes=lambda:{str(p.relative_to(ROOT)):digest(p) for p in sorted(watched)}
    report={'schemaVersion':1,'scope':'Seven production surfaces; prototype lab separately verified by its owner',
        'workerFixture':True,'realNativeInference':False,'fixture':'browser_consent_fixture.py / browser-consent-fixture.js',
        'oracleBasis':'Existing reviewed narrative-all-games-cases.json, current trusted record loader, approved StarCraft source snapshot',
        'oracles':oracles,'checks':[],'failures':[],'replies':[],'storageUnchanged':{},'storageWrites':{},'pageErrors':[],'requests':[],'blockedRequests':[],
        'sourceHashesBefore':hashes(),'screenshots':[]}
    def check(name,fn):
        item={'id':name}
        try:item.update(passed=True,evidence=fn())
        except Exception as exc:
            item.update(passed=False,error=str(exc));report['failures'].append({'id':name,'error':str(exc)})
        report['checks'].append(item)
        print(name+': '+('PASS' if item['passed'] else item['error']),flush=True)
        return item['passed']
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    thread=Thread(target=server.serve_forever,daemon=True);thread.start()
    report['loopbackPort']=server.server_port
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=args.browser_executable,headless=True,args=['--no-sandbox'])
            context=browser.new_context(service_workers='block',viewport={'width':1280,'height':900})
            context.add_init_script(script=STORAGE_OBSERVER)
            context.add_init_script(script=CONSENT_FIXTURE)
            def route(r):
                req=r.request;u=urlparse(req.url)
                report['requests'].append({'url':req.url.split('?')[0],'method':req.method,'hasBody':req.post_data_buffer is not None})
                allowed=req.method=='GET' and req.post_data_buffer is None and (req.url.startswith(('data:','blob:')) or (u.hostname=='127.0.0.1' and u.port==server.server_port))
                if allowed:r.continue_()
                else:report['blockedRequests'].append(req.url.split('?')[0]);r.abort()
            context.route('**/*',route)
            for surface,spec in SURFACES.items():
                page=context.new_page();game=surface.split('-')[0];oracle=oracles[game]
                page.route('**/offline.js*',lambda r:r.fulfill(status=200,content_type='text/javascript',body='// Existing site SW bootstrap isolated for source/UI fixture.'))
                page.on('pageerror',lambda e,s=surface:report['pageErrors'].append({'surface':s,'error':str(e)}))
                try:
                    page.goto(f'http://127.0.0.1:{server.server_port}/guides/{spec[0]}',wait_until='networkidle')
                    open_surface(page,surface)
                    before_storage=page.evaluate(STORAGE)
                    def viewport_run(width,height,initial=False):
                        page.set_viewport_size({'width':width,'height':height})
                        assert not page.evaluate(NO_HELP),page.evaluate(NO_HELP)
                        replies=[ask(page,surface,oracle) for _ in range(5 if initial else 1)]
                        report['replies'].extend({'surface':surface,'viewport':[width,height],**reply} for reply in replies)
                        assert not page.evaluate(NO_HELP),page.evaluate(NO_HELP)
                        return {'viewport':[width,height],'sends':len(replies),'composer':composer(page,surface),'scroll':check_scroll(page,surface)}
                    if not check(surface+'-desktop-default-and-history',lambda:viewport_run(1280,900,True)):continue
                    check(surface+'-phone-composer-and-scroll',lambda:viewport_run(390,844))
                    if game=='ultima6':
                        def long_seer():
                            report['replies'].extend({'surface':surface,**ask(page,surface,oracle)} for _ in range(5))
                            out=check_scroll(page,surface,True)
                            out['composer']=composer(page,surface)
                            path=shots/'ultima6-phone-long.png';page.screenshot(path=str(path));report['screenshots'].append(str(path.relative_to(ROOT)))
                            return out
                        check('ultima6-long-chat-wheel-and-cards',long_seer)
                    def lifecycle():
                        after_smaller_hint=ask(page,surface,oracle,'smaller hint')
                        assert not page.evaluate(NO_HELP),page.evaluate(NO_HELP)
                        page.get_by_role('button',name='New topic',exact=True).filter(visible=True).click()
                        assert not page.evaluate(NO_HELP),page.evaluate(NO_HELP)
                        after_topic=ask(page,surface,oracle)
                        page.get_by_role('button',name='Clear chat',exact=True).filter(visible=True).click()
                        assert not page.evaluate(NO_HELP),page.evaluate(NO_HELP)
                        after_clear=ask(page,surface,oracle)
                        reopen_and_change_context(page,surface)
                        assert not page.evaluate(NO_HELP),page.evaluate(NO_HELP)
                        after_context=ask(page,surface,oracle)
                        return {'afterSmallerHint':after_smaller_hint,'afterTopic':after_topic,'afterClear':after_clear,'afterReopenContextChange':after_context}
                    check(surface+'-reset-reopen-context-retains-full-answers',lifecycle)
                    if surface=='starcraft':
                        page.set_viewport_size({'width':1280,'height':900})
                        path=shots/'starcraft-desktop.png';page.screenshot(path=str(path),full_page=True);report['screenshots'].append(str(path.relative_to(ROOT)))
                    report['storageUnchanged'][surface]=before_storage==page.evaluate(STORAGE)
                except Exception as exc:
                    report['failures'].append({'id':surface+'-surface-setup','error':str(exc)})
                finally:
                    report['storageWrites'][surface]=page.evaluate('window.fullAnswerStorageWrites||[]')
                    page.close()
            def legacy_context():
                page=context.new_page()
                page.goto(f'http://127.0.0.1:{server.server_port}/guides/tests/assistant/',wait_until='networkidle')
                result=page.evaluate('''async oracle=>{
                    const {createAssistant}=await import('/guides/js/assistant/engine.js');
                    const {createView}=await import('/guides/js/assistant/ui.js');
                    const section=document.createElement('section');document.body.replaceChildren(section);
                    section.innerHTML='<div></div><input><button>Send</button>';
                    const [messages,input,sendButton]=section.children;
                    const select=document.createElement('select');select.innerHTML='<option value="gentle">Nudge</option><option value="direct">Full answer</option>';select.value='gentle';
                    const assistant=createAssistant({gameId:'ultima5',records:[oracle.sourceOracle.record]});
                    const view=createView({assistant,messages,input,sendButton,spoilerSelect:select,getContext:()=>({contextId:'legacy',spoiler:'gentle'})});
                    input.value=oracle.question;await view.send();
                    const reply=assistant.getHistory('legacy').at(-1);
                    return {text:messages.textContent,reply,selectorAttached:select.isConnected};
                }''',oracles['ultima5'])
                assert result['reply']['decision']=='answer' and oracles['ultima5']['recordId'] in result['reply']['recordIds'],result
                assert all(x.casefold() in result['text'].casefold() for x in oracles['ultima5']['contains']),result
                assert not page.evaluate(NO_HELP),page.evaluate(NO_HELP)
                page.close();return result
            check('legacy-gentle-selector-and-context-cannot-lower-real-full-answer',legacy_context)
            report['browser']=browser.version;browser.close()
    finally:
        server.shutdown();server.server_close();thread.join(timeout=5)
        report['serverClosed']=not thread.is_alive()
        report['sourceHashesAfter']=hashes()
        report['sourceFilesUnchangedDuringRun']=report['sourceHashesBefore']==report['sourceHashesAfter']
        report['onlyStaticGets']=all(x['method']=='GET' and not x['hasBody'] for x in report['requests'])
        def boundaries():
            assert len(report['storageUnchanged'])==7 and all(report['storageUnchanged'].values()),report['storageUnchanged']
            assert not [w for writes in report['storageWrites'].values() for w in writes if w['key']!='guide-assistant.preference.v1'],report['storageWrites']
            assert not report['blockedRequests'] and not report['pageErrors'],{'blocked':report['blockedRequests'],'errors':report['pageErrors']}
            assert report['onlyStaticGets'] and report['sourceFilesUnchangedDuringRun'] and report['serverClosed'],report
            return {'storageUnchanged':report['storageUnchanged'],'onlyStaticGets':True,'externalRequests':0,'pageErrors':0,'sourceFilesUnchanged':True,'ownedServerClosed':True}
        check('seven-surface-storage-network-source-and-server-boundaries',boundaries)
        report['passed']=sum(c['passed'] for c in report['checks'])
        output.parent.mkdir(exist_ok=True);output.write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'report':str(output.relative_to(ROOT)),'passed':report['passed'],'checks':len(report['checks']),'failures':report['failures']},indent=2),flush=True)
    assert len(report['checks'])==24 and not report['failures'],report['failures']


if __name__=='__main__':main()
