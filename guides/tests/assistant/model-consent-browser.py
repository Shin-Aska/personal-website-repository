"""Real six-guide consent/model acceptance; no worker fixture or external downloads.
Includes real site-worker offline reload. Uses existing Chrome and Playwright.
"""
import json, os, time
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent/'evidence'; OUT.mkdir(exist_ok=True)
PROFILE=json.loads((ROOT/'guides/local-assistant/profile.json').read_text())
KEY='guide-assistant.preference.v1'
BASE='http://127.0.0.1:8768'
GAMES={
'albion':('Albion.html',"activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro')",'#walkthrough-ai-input','#walkthrough-ai-send','#walkthrough-ai-body','.guide-assistant-controls select','What does the Dreamshield do?','Why does it work that way?'),
'ultima5':('Ultima5.html',"showUltima5Section('counsel')",'#seer-query','#ask-seer','#seer-response','.guide-assistant-controls select','Who is Saduj?','Why is he a spy?'),
'ultima6':('Ultima6.html',"openSeerForQuest('act-i-liberating-the-shrines','sacrifice-minoc')",'#seer-query','#ask-seer','#seer-chat-messages','#seer-spoiler-select','Who is Arianna?','Why is she cute?'),
'ultima7':('Ultima7.html',None,'.sage-input','.sage-send','.sage-messages','.sage-spoiler','Who is Spark?','Why does he learn so quickly?'),
'alqadim':('AlQadim.html',None,'#walkthrough-ai-input-tab','#walkthrough-ai-send-tab','#walkthrough-ai-body-tab','#main-ai-wrapper select','What does the Ship Orb do?','How does it actually power the ship?'),
'starcraft':('StarcraftBWAPI.html',None,'#sc-ai-input','#sc-ai-send','#sc-ai-chat','#sc-assistant-spoiler','What is SCHNAIL?','Why is it called that?')}
checks=[]; requests=[]; errors=[]; outputs={}
def check(label,ok):
 checks.append({'check':label,'passed':bool(ok)})
 if not ok:raise AssertionError(label)
def context(browser,sw='block'):
 c=browser.new_context(service_workers=sw,viewport={'width':1280,'height':900})
 def route(r):
  u=r.request.url
  if u.startswith(('blob:','data:')) or urlparse(u).hostname=='127.0.0.1':r.continue_()
  else:r.abort()
 c.route('**/*',route)
 c.on('request',lambda r:requests.append({'url':r.url,'method':r.method,'hasBody':r.post_data is not None}))
 c.on('page',lambda page:page.on('pageerror',lambda e:errors.append(str(e)+' | '+e.stack+' | '+page.url)))
 return c

def ready(page):page.wait_for_function("document.documentElement.dataset.guideChat==='ready'",timeout=120000)
def assets():return sum('/local-assistant/files/' in r['url'] for r in requests)
def storage(page):return page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')
def open_chat(page,game):
 f,op,*_=GAMES[game]
 if op:page.evaluate(op)
 elif game=='ultima7':
  page.locator('[data-target="quests"]').click();page.locator('.get-main-quest-hint').first.click()
 elif game=='alqadim':page.locator('[data-target="genie"]').click()
 else:page.locator('a[href="#ai-assistant"]').click()
 page.locator(GAMES[game][2]).wait_for(state='visible')
 page.wait_for_function('(s)=>!document.querySelector(s).disabled',arg=GAMES[game][2])
 page.locator(GAMES[game][5]).select_option('direct')

def ask(page,game,text):
 _,_,inp,send,body,*_=GAMES[game]
 old=page.locator(body+' .guide-assistant-message.ai').count()
 page.locator(inp).fill(text);page.locator(send).click()
 page.wait_for_function('''({s,n})=>{
 const a=document.querySelector(s)?.querySelectorAll('.guide-assistant-message.ai .ga-msg-text');
 return a&&a.length>n&&a[a.length-1].textContent!=='Looking at the guide…';
 }''',arg={'s':body,'n':old},timeout=30000)
 return page.locator(body+' .guide-assistant-message.ai .ga-msg-text').last.inner_text()

def main():
 server=ThreadingHTTPServer(('127.0.0.1',8768),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
 Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
   c=context(browser);page=c.new_page()
   page.goto(BASE+'/guides/Albion.html',wait_until='networkidle')
   page.locator('#guide-assistant-consent[open]').wait_for()
   check('No model worker or asset request before explicit consent',assets()==0 and not any('/assistant/model-worker.js' in r['url'] for r in requests))
   check('Consent discloses local processing and download size','162 MB' in page.locator('#guide-assistant-consent').inner_text() and "aren't sent to an AI service" in page.locator('#guide-assistant-consent').inner_text())
   page.get_by_role('button',name='Keep chat off',exact=True).click()
   check('Off is persisted',json.loads(page.evaluate('(k)=>localStorage.getItem(k)',KEY))['choice']=='off')
   for game,spec in GAMES.items():
    page.goto(BASE+'/guides/'+spec[0],wait_until='networkidle')
    page.wait_for_function("document.documentElement.dataset.guideChat==='off'")
    check(game+': decline survives navigation/reload',not page.locator('#guide-assistant-consent').is_visible())
    check(game+': chat and generated openers hidden',page.locator('[data-guide-chat-surface]:visible').count()==0)
    check(game+': settings remain available',page.get_by_role('button',name='Assistant settings',exact=True).is_visible())
   check('Declining across six pages downloaded no model assets',assets()==0)
   page.get_by_role('button',name='Assistant settings',exact=True).click()
   page.get_by_role('button',name='Enable chat',exact=True).click();ready(page)
   check('Enabling automatically loads the full configured asset set',assets()==len(PROFILE['assets']))
   count=assets()
   for game,spec in GAMES.items():
    page.goto(BASE+'/guides/'+spec[0],wait_until='networkidle');ready(page)
    check(game+': enabled choice reused without prompt',not page.locator('#guide-assistant-consent').is_visible())
    check(game+': model parts reused without another network download',assets()==count)
    page.evaluate('''async()=>{
      const {modelRuntime}=await import('/guides/js/assistant/model-runtime.js');
      window.frameCalls=0;const old=modelRuntime.generate.bind(modelRuntime);
      modelRuntime.generate=(...args)=>{frameCalls++;return old(...args)};
    }''')
    open_chat(page,game);before=storage(page)
    seed=ask(page,game,spec[6]);check(game+': normal sourced answers bypass the model',page.evaluate('frameCalls')==0)
    started=time.monotonic();reply=ask(page,game,spec[7]);elapsed=time.monotonic()-started
    check(game+': unsupported follow-up uses actual constrained model',page.evaluate('frameCalls')==1)
    check(game+': missing-information reply with exact related quote','sourced' in reply and '“' in reply and '[G1]' in reply)
    check(game+': source attribution rendered', 'Source: existing guide' in page.locator(spec[4]).inner_text())
    check(game+': chat leaves saved storage byte-identical',before==storage(page))
    check(game+': no experimental raw output in live chat',page.locator('#raw').count()==0)
    outputs[game]={'seed':seed,'reply':reply,'replySeconds':elapsed}
    if game=='ultima6':
     page.screenshot(path=str(OUT/'model-consent-ariana.png'))
     page.locator(spec[2]).fill('What colour are her eyes?');page.locator(spec[3]).click()
     page.wait_for_function("document.querySelector('#seer-chat-messages').textContent.includes('Looking at the guide…')")
     page.locator(spec[5]).select_option('gentle')
     page.wait_for_timeout(2500)
     check('Lowered help hides old Ariana history and discards in-flight quotes','Ariana' not in page.locator(spec[4]).inner_text() and 'short hair' not in page.locator(spec[4]).inner_text())
    # Turning chat off from an active surface restores ordinary guide use.
    page.get_by_role('button',name='Assistant settings',exact=True).click();page.get_by_role('button',name='Keep chat off',exact=True).click()
    check(game+': active chat can be disabled',page.locator('[data-guide-chat-surface]:visible').count()==0)
    check(game+': settings remain reachable after disabling',page.get_by_role('button',name='Assistant settings',exact=True).is_visible())
    if game=='ultima5':check('U5 disabling active counsel restores the overview',page.locator('#overview.active').is_visible())
    if game=='ultima6':check('U6 disabling closes the modal scroll lock',not page.locator('body').evaluate("n=>n.classList.contains('u6-seer-modal-open')"))
    page.get_by_role('button',name='Assistant settings',exact=True).click();page.get_by_role('button',name='Enable chat',exact=True).click();ready(page)
    check(game+': enabling again reuses verified cached parts',assets()==count)
   # A second page receives consent changes through the real storage event.
   second=c.new_page();second.goto(BASE+'/guides/Albion.html',wait_until='networkidle');ready(second)
   page.get_by_role('button',name='Assistant settings',exact=True).click();page.get_by_role('button',name='Keep chat off',exact=True).click()
   second.wait_for_function("document.documentElement.dataset.guideChat==='off'")
   check('Disabling propagates to another open guide',second.locator('[data-guide-chat-surface]:visible').count()==0)
   second.get_by_role('button',name='Assistant settings',exact=True).click();second.get_by_role('button',name='Reset choice',exact=True).click()
   check('Reset removes the remembered choice',second.evaluate('(k)=>localStorage.getItem(k)',KEY) is None)
   page.wait_for_function("document.querySelector('#guide-assistant-consent').open")
   check('Reset returns other pages to the opt-in prompt',page.locator('#guide-assistant-consent').is_visible())
   # Updated model identity requires renewed consent, not a silent new download.
   c.add_init_script("if(location.protocol==='http:'||location.protocol==='https:')localStorage.setItem("+json.dumps(KEY)+','+json.dumps(json.dumps({'schema':1,'choice':'enabled','modelId':PROFILE['id']}))+');')
   future={**PROFILE,'id':PROFILE['id']+'-future'}
   c.route('**/local-assistant/profile.json',lambda r:r.fulfill(json=future))
   page.goto(BASE+'/guides/Ultima6.html',wait_until='networkidle');page.locator('#guide-assistant-consent[open]').wait_for()
   check('A changed model profile asks again',page.locator('#guide-assistant-consent').is_visible())
   c.close()
   # Cancel a real first asset fetch before any model can become ready.
   d=context(browser);held=[]
   d.route('**/local-assistant/files/**',lambda r:held.append(r))
   cancel=d.new_page();cancel.goto(BASE+'/guides/Albion.html',wait_until='networkidle');cancel.get_by_role('button',name='Enable chat',exact=True).click()
   cancel.wait_for_timeout(300)
   check('Download actually started before cancellation',bool(held))
   cancel.get_by_role('button',name='Keep chat off',exact=True).click()
   check('Declining during download leaves chat off',cancel.locator('html').get_attribute('data-guide-chat')=='off')
   for r in held:
    try:r.abort()
    except Exception:pass
   d.close()
   # Integrity failure is visible and never enables chat. Retry uses real assets.
   e=context(browser);first=PROFILE['assets'][0]['path'].split('/')[-1]
   e.route('**/'+first,lambda r:r.fulfill(body=b'corrupt model file'))
   broken=e.new_page();broken.goto(BASE+'/guides/Albion.html',wait_until='networkidle');broken.get_by_role('button',name='Enable chat',exact=True).click()
   broken.wait_for_function("document.documentElement.dataset.guideChat==='error'",timeout=30000)
   check('Corrupt assets fail closed with retry available',broken.get_by_role('button',name='Retry model loading',exact=True).is_visible() and broken.locator('[data-guide-chat-surface]:visible').count()==0)
   e.unroute('**/'+first);broken.get_by_role('button',name='Retry model loading',exact=True).click();ready(broken)
   check('Retry recovers from a rejected model file',broken.locator('html').get_attribute('data-guide-chat')=='ready')
   e.close()
   # Real site service worker plus dedicated model cache: loaded guide reloads offline.
   sw=context(browser,'allow');sw.add_init_script("if(location.protocol==='http:'||location.protocol==='https:')localStorage.setItem("+json.dumps(KEY)+','+json.dumps(json.dumps({'schema':1,'choice':'enabled','modelId':PROFILE['id']}))+');')
   offline=sw.new_page();offline.goto(BASE+'/guides/Ultima6.html',wait_until='networkidle');ready(offline)
   offline.evaluate('navigator.serviceWorker.ready.then(()=>true)');offline.reload(wait_until='networkidle');ready(offline)
   open_chat(offline,'ultima6');ask(offline,'ultima6','Who is Arianna?')
   offline.wait_for_function("/Available offline|Partly available offline/.test(document.querySelector('#offline-reading-status')?.textContent||'')",timeout=120000)
   sw.set_offline(True);offline.reload(wait_until='networkidle');ready(offline)
   check('Real cached guide reloads and loads the cached model offline',offline.locator('html').get_attribute('data-guide-chat')=='ready')
   open_chat(offline,'ultima6');ask(offline,'ultima6','Who is Arianna?');r=ask(offline,'ultima6','Why is she cute?')
   check('Actual guarded inference works after offline reload','sourced' in r and 'short hair' in r)
   sw.close();print('Captured page errors:',json.dumps(errors),flush=True);check('No uncaught page errors',not errors)
   check('All assistant traffic is static GET/HEAD without question bodies',all(r['method'] in ['GET','HEAD'] and not r['hasBody'] for r in requests))
   check('No model or inference request went to another host',not any(('huggingface' in r['url'] or 'api.openai' in r['url'] or 'llm.php' in r['url']) for r in requests))
   browser.close()
  (OUT/'model-consent-report.json').write_text(json.dumps({'checks':checks,'outputs':outputs,'pageErrors':errors,'requests':requests,'modelProfile':PROFILE['id'],'realModel':True,'legacyWorkerFixture':False},indent=2)+'\n')
  print(f'{len(checks)}/{len(checks)} model-consent browser checks passed.')
 finally:
  (OUT/'model-consent-report.json').write_text(json.dumps({'checks':checks,'outputs':outputs,'pageErrors':errors,'requests':requests,'modelProfile':PROFILE['id'],'realModel':True,'legacyWorkerFixture':False},indent=2)+'\n')
  server.shutdown();server.server_close()
if __name__=='__main__':main()
