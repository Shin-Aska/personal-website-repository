"""Exercise long guide conversations and scrolling at desktop/mobile sizes.

Run against a checkout served on loopback port 8766. The approved consent/worker
fixture enables the actual production UI and engine without downloading a model.
This suite checks layout, not native inference or answer semantics.
"""
import hashlib
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
from browser_consent_fixture import CONSENT_FIXTURE

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
VIEWPORTS = [(1280, 900), (767, 806), (390, 844), (767, 500), (390, 500), (844, 390)]
SURFACES = {
    'albion': ('Albion.html', "activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro')", '#walkthrough-ai-input', '#walkthrough-ai-send', '#walkthrough-ai-body'),
    'ultima5': ('Ultima5.html', "showUltima5Section('counsel')", '#seer-query', '#ask-seer', '#seer-response'),
    'ultima6': ('Ultima6.html', "openSeerForQuest('act-i-liberating-the-shrines','compassion-britain')", '#seer-query', '#ask-seer', '#seer-chat-messages'),
    'ultima7': ('Ultima7.html', None, '.sage-input', '.sage-send', '.sage-messages'),
    'alqadim': ('AlQadim.html', None, '#walkthrough-ai-input-tab', '#walkthrough-ai-send-tab', '#walkthrough-ai-body-tab'),
    'alqadim-walkthrough': ('AlQadim.html', None, '#walkthrough-ai-input', '#walkthrough-ai-send', '#walkthrough-ai-body'),
    'starcraft': ('StarcraftBWAPI.html', None, '#sc-ai-input', '#sc-ai-send', '#sc-ai-chat'),
}

GEOMETRY = r'''selector => {
    const e = document.querySelector(selector), r = e.getBoundingClientRect();
    const result = {x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,bottom:r.bottom,
        scrollTop:e.scrollTop,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight};
    let left=Math.max(0,r.left), right=Math.min(innerWidth,r.right);
    let top=Math.max(0,r.top), bottom=Math.min(innerHeight,r.bottom);
    for(let a=e.parentElement;a;a=a.parentElement){
        // Root/body scrolling is clipped by the viewport, not the body's
        // document box (which may be shorter than its visible overflow).
        if(a===document.body||a===document.documentElement)continue;
        const s=getComputedStyle(a),ar=a.getBoundingClientRect();
        if(['auto','scroll','hidden','clip'].includes(s.overflowY)){
            top=Math.max(top,ar.top+a.clientTop);bottom=Math.min(bottom,ar.top+a.clientTop+a.clientHeight);
        }
        if(['auto','scroll','hidden','clip'].includes(s.overflowX)){
            left=Math.max(left,ar.left+a.clientLeft);right=Math.min(right,ar.left+a.clientLeft+a.clientWidth);
        }
    }
    const x=(left+right)/2,y=(top+bottom)/2;
    const hit=right>left&&bottom>top?document.elementFromPoint(x,y):null;
    return {...result,visibleWidth:Math.max(0,right-left),visibleHeight:Math.max(0,bottom-top),
        hitTestable:hit===e||e.contains(hit),hitElement:hit&&{tag:hit.tagName,id:hit.id,className:hit.className},point:{x,y}};
}'''
LOG_STATE = r'''selector => {
    const log=document.querySelector(selector),r=log.getBoundingClientRect();
    const cards=[...log.querySelectorAll('.guide-assistant-message')];
    const describe=e=>{const a=e.getBoundingClientRect();return {top:a.top,bottom:a.bottom,
        height:a.height,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,
        role:e.classList.contains('user')?'user':'assistant'};};
    return {top:r.top+log.clientTop,bottom:r.top+log.clientTop+log.clientHeight,
        scrollTop:log.scrollTop,clientHeight:log.clientHeight,scrollHeight:log.scrollHeight,
        count:cards.length,cards:cards.map(describe),first:cards[0]&&describe(cards[0]),
        last:cards.at(-1)&&describe(cards.at(-1))};
}'''

results, failures, errors, external, requests, progress = [], [], [], [], [], {}
watched = [ROOT / 'guides' / file for file, *_ in SURFACES.values()]
watched += sorted((ROOT / 'guides/css').glob('*.css'))
watched += sorted((ROOT / 'guides/js/assistant').rglob('*.js'))
watched += [Path(__file__), HERE / 'browser-consent-fixture.js']
source_hashes = lambda: {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in watched}
before_hashes = source_hashes()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
    context = browser.new_context(service_workers='block', viewport={'width':1280,'height':900})
    context.add_init_script(script=CONSENT_FIXTURE)

    def route(r):
        url = r.request.url
        if url.startswith(('data:', 'blob:')) or urlparse(url).hostname in {urlparse(BASE).hostname, '127.0.0.1', 'localhost'}:
            r.continue_()
        else:
            external.append(url.split('?')[0])
            r.abort()

    context.route('**/*', route)
    context.on('request', lambda r: requests.append({'method':r.method, 'hasBody':r.post_data_buffer is not None, 'url':r.url.split('?')[0]}))
    for surface, (file, open_js, input_sel, send_sel, log_sel) in SURFACES.items():
        game = surface.split('-')[0]
        page = context.new_page()
        page.route('**/offline.js*', lambda r: r.fulfill(status=200,content_type='text/javascript',body='// Isolated layout test.'))
        page.on('pageerror', lambda e, surface=surface: errors.append({'surface':surface,'error':str(e)}))
        page.goto(f'{BASE}/guides/{file}',wait_until='networkidle')
        if game == 'ultima7':
            page.locator('button[data-target="quests"]').click()
            page.locator('.quest-item').first.click()
            page.locator('.get-main-quest-hint').first.click()
        elif game == 'alqadim':
            page.wait_for_function('Object.keys(genieViews).length===2')
            page.locator(f'button[data-target="{"walkthrough" if surface.endswith("-walkthrough") else "genie"}"]').click()
        elif game == 'starcraft':
            page.click('#main-nav [href="#ai-assistant"]')
        if open_js:
            page.evaluate(open_js)
        page.locator(input_sel).wait_for(state='visible')
        # The reported Seer failure uses Full answer, whose long step hint
        # and source citations need more room than the initial Nudge view.
        page.get_by_role('radio', name='Full answer', exact=True).filter(visible=True).click()
        storage_script = 'JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))'
        before_storage = page.evaluate(storage_script)
        fixture = json.loads((HERE / 'conversations' / f'{game}.json').read_text())
        turns = fixture['dialogues'][0]['turns']
        sent = []

        def ask(text):
            before = page.locator(log_sel).inner_text()
            page.locator(input_sel).fill(text)
            page.locator(send_sel).click(timeout=5000)
            page.wait_for_function(r'''([logSel,sendSel,before,text])=>{
                const root=document.querySelector(logSel),nodes=[...root.querySelectorAll('.guide-assistant-message')];
                const last=nodes.at(-1),previous=nodes.at(-2);
                return root.innerText!==before&&last?.classList.contains('ai')&&last.dataset.decision
                    &&last.dataset.decision!=='pending'&&previous?.querySelector('.ga-msg-text')?.textContent===text
                    &&!document.querySelector(sendSel).disabled;
            }''',arg=[log_sel,send_sel,before,text],timeout=20000)
            sent.append(text)

        try:
            for turn in turns[:8]:
                ask(turn['text'])
            assert len(sent) == 8, 'fixture must provide eight initial UI turns'
            for index, (width,height) in enumerate(VIEWPORTS):
                item = {'surface':surface,'viewport':{'width':width,'height':height},'problems':[]}
                results.append(item)
                try:
                    page.set_viewport_size({'width':width,'height':height})
                    # A real successful send at each size also exercises clickability
                    # after the layout changes, rather than only checking rectangles.
                    ask(turns[index % len(turns)]['text'])
                    item['sentTurnCount'] = len(sent)
                    for key, selector in [('input',input_sel),('send',send_sel)]:
                        page.locator(selector).evaluate("e=>e.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})")
                        geom=page.evaluate(GEOMETRY,selector)
                        item[key]=geom
                        assert geom['hitTestable'] and geom['visibleWidth']>=geom['width']-2 and geom['visibleHeight']>=geom['height']-2, f'{key} is clipped or obscured'
                    page.locator(log_sel).evaluate("e=>e.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})")
                    page.locator(log_sel).evaluate('(e)=>{e.scrollTop=0}')
                    oldest=page.evaluate(LOG_STATE,log_sel)
                    item['oldest']=oldest
                    assert oldest['clientHeight']>=80, 'conversation viewport collapsed below 80px'
                    assert oldest['count']==12, 'expected the intentional six-turn history window'
                    assert oldest['scrollTop']==0 and oldest['first']['top']<oldest['bottom'] and oldest['first']['bottom']>oldest['top'], 'oldest retained message unreachable'
                    assert all(card['scrollHeight']<=card['clientHeight']+2 for card in oldest['cards']), 'a message card is compressed'
                    page.locator(log_sel).evaluate('(e)=>{e.scrollTop=e.scrollHeight}')
                    newest=page.evaluate(LOG_STATE,log_sel)
                    item['newest']=newest
                    assert newest['scrollTop']>0, 'long conversation has no scroll range'
                    assert newest['last']['bottom']<=newest['bottom']+2 and newest['last']['bottom']>newest['top'], 'newest retained message unreachable'
                    if game=='ultima6':
                        bounds=page.evaluate(r'''()=>{
                            const p=document.querySelector('.u6-seer-modal__panel').getBoundingClientRect();
                            const v=document.querySelector('.u6-seer-modal__view').getBoundingClientRect();
                            return {panelTop:p.top,panelBottom:p.bottom,viewTop:v.top,viewBottom:v.bottom};
                        }''')
                        item['modalBounds']=bounds
                        assert bounds['viewTop']>=bounds['panelTop']-1 and bounds['viewBottom']<=bounds['panelBottom']+1, 'Seer view extends beyond clipped modal panel'
                        geom=page.evaluate(GEOMETRY,log_sel)
                        assert geom['hitTestable'], 'Seer chat cannot receive wheel input'
                        page.mouse.move(geom['point']['x'],geom['point']['y'])
                        start=page.locator(log_sel).evaluate('(e)=>e.scrollTop')
                        page.mouse.wheel(0,-500)
                        page.wait_for_timeout(180)
                        up=page.locator(log_sel).evaluate('(e)=>e.scrollTop')
                        page.mouse.wheel(0,500)
                        page.wait_for_timeout(180)
                        down=page.locator(log_sel).evaluate('(e)=>e.scrollTop')
                        item['wheel']={'start':start,'up':up,'down':down}
                        assert up<start and down>up, 'wheel cannot scroll the Seer conversation both ways'
                    item['passed']=True
                except Exception as exc:
                    item['passed']=False
                    item['problems'].append(str(exc))
                    failures.append({'surface':surface,'viewport':item['viewport'],'error':str(exc)})
                print(f'{surface} {width}x{height}: {"PASS" if item["passed"] else item["problems"]}',flush=True)
        except Exception as exc:
            failures.append({'surface':surface,'error':str(exc)})
            print(f'{surface}: {exc}',flush=True)
        progress[surface]=before_storage==page.evaluate(storage_script)
        page.close()
    browser_version=browser.version
    browser.close()

report = {'browser':browser_version,'worker':'approved consent/worker fixture; production UI and engine; no native model inference',
    'initialTurnsPerSurface':8,'additionalUiSendAtEachViewport':True,'surfaces':list(SURFACES),
    'viewportCount':len(VIEWPORTS),'checks':results,'passed':sum(x['passed'] for x in results),
    'failures':failures,'progressUnchanged':progress,'externalRequests':external,'pageErrors':errors,
    'onlyStaticGets':all(r['method']=='GET' and not r['hasBody'] for r in requests),
    'sourceHashesBefore':before_hashes,'sourceHashesAfter':source_hashes()}
report['sourceFilesUnchangedDuringRun']=report['sourceHashesBefore']==report['sourceHashesAfter']
(HERE/'evidence/chat-layout-browser.json').write_text(json.dumps(report,indent=2)+'\n')
assert len(results)==len(SURFACES)*len(VIEWPORTS) and not failures, failures
assert all(progress.values()) and not external and not errors and report['onlyStaticGets'] and report['sourceFilesUnchangedDuringRun'], report
print(f'Passed {report["passed"]} layout checks across {len(SURFACES)} chat surfaces.',flush=True)
