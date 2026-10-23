"""Existing Playwright/Chrome acceptance; never installs a browser or package."""
from browser_consent_fixture import CONSENT_FIXTURE
import asyncio, json, os, platform, re
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('ASSISTANT_BASE_URL','http://127.0.0.1:8766').rstrip('/')
OUT=Path(__file__).resolve().parent/'evidence';OUT.mkdir(exist_ok=True)
FORBIDDEN=re.compile(r'llm\.php|generativelanguage|generatecontent|api\.openai|api\.anthropic|webllm|\.gguf|\.onnx|model.weights',re.I)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox','--enable-precise-memory-info'])
  context=await browser.new_context(service_workers='block', viewport={'width':1280,'height':900})
  await context.add_init_script(script=CONSENT_FIXTURE)
  requests=[];blocked=[];errors=[];checks=[]
  async def route(r):
   url=r.request.url
   if FORBIDDEN.search(url):blocked.append(url);await r.abort()
   else:await r.continue_()
  def log_request(request,scenario='normal'):
   requests.append({'method':request.method,'url':request.url.split('?')[0],'type':request.resource_type,'hasQuery':'?' in request.url,'hasBody':request.post_data_buffer is not None,'hasQuestionParameter':bool(re.search(r'(?:[?&](?:q|query|prompt|question)=)',request.url,re.I)),'scenario':scenario})
  await context.route('**/*',route)
  context.on('request',log_request)
  page=await context.new_page()
  await page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
  page.on('pageerror',lambda e:errors.append(str(e)))
  # Import legacy progress as historical evidence, then check the raw value stays identical.
  await page.add_init_script("localStorage.setItem('albion.questLog.v1',JSON.stringify({'toronto-intro':{pistol:true,'com-code':false}}));window.__longTasks=[];new PerformanceObserver(list=>window.__longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});")
  await page.goto(BASE+'/guides/Albion.html',wait_until='networkidle')
  await page.wait_for_selector('.guide-assistant-controls',state='attached')
  await page.evaluate("activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro')")
  storage=await page.evaluate("localStorage.getItem('albion.questLog.v1')")
  def check(label,value):
   checks.append({'check':label,'passed':bool(value)});assert value,label
  async def ask(text):
   await page.fill('#walkthrough-ai-input',text)
   return await page.evaluate('async()=>{await walkthroughAiSend();return albionAssistant.getHistory(walkthroughAiActiveChapterId||"default").at(-1)}')
  # Intentional 23 Oct: quote first unticked step; retain alternative chips.
  r=await ask('What next?');check('Gentle generic next quotes first unticked step',r['decision']=='answer' and 'First unticked step here (1 of 5 done)' in r['text'] and len(r['choices'])>0)
  check('Gentle choices contain no code',not any('1042' in c['label'] for c in r['choices']))
  await page.locator('#walkthrough-ai-body button').first.click()
  check('One useful clarification resolves',await page.locator('#walkthrough-ai-body').inner_text()!='')
  await page.select_option('.guide-assistant-controls select','direct')
  check('Location answer grounded',(await ask('Where is Pistol?'))['recordIds']==['albion:item:pistol:location'])
  check('Historical acquisition is not possession',await page.evaluate("albionAssistant.evidence.read('albion:possesses:pistol').value")=='unknown')
  check('Correction acknowledged',(await ask("I don't have Pistol"))['decision']=='correction')
  check('Correction stored in memory',await page.evaluate("albionAssistant.evidence.read('albion:possesses:pistol').value")==False)
  check('Direct code answer','1042' in (await ask('What is COM code?'))['text'])
  check('Smaller authored hint',(await ask('smaller hint'))['level']=='balanced')
  check('Smallest authored hint',(await ask('smaller hint'))['level']=='gentle')
  await page.select_option('.guide-assistant-controls select','gentle')
  check('Lowered history hides code','1042' not in await page.locator('#walkthrough-ai-body').inner_text())
  await page.select_option('.guide-assistant-controls select','direct')
  await ask('Where is Pistol?');await page.evaluate("setWalkthroughAiActiveChapter('gratogel')")
  check('UI topic clears pronouns',(await ask('Where is it?'))['decision']=='clarify')
  await ask('<img src=x onerror="window.pwned=1">')
  check('Unsafe input remains text',await page.locator('#walkthrough-ai-body img').count()==0 and not await page.evaluate('Boolean(window.pwned)'))
  await context.set_offline(True)
  check('Disconnected question',(await ask('Where is Dreamshield?'))['decision']=='answer')
  check('Disconnected followup',(await ask('How do I use it?'))['decision']=='answer')
  check('Wrong relationship declines',(await ask('How do I recruit Pistol?'))['decision']=='decline')
  check('No saved-progress writes',await page.evaluate("localStorage.getItem('albion.questLog.v1')")==storage)
  await context.set_offline(False)
  await page.select_option('.guide-assistant-controls select','direct')
  r=await ask('Where is Inspector Beegle?')
  check('Allowlisted atlas action',len(r['actions'])==1)
  await page.get_by_role('button',name='Show the cabin on the atlas').click()
  check('Atlas navigation still works',await page.locator('#atlas').evaluate("e=>e.classList.contains('active')"))
  await page.evaluate("activateAlbionSection('missions','auto')")
  # Isolated warm loop measures compute and two animation frames including DOM paint opportunity.
  metrics=await page.evaluate('''async()=>{
    const samples=[],paints=[];
    for(let i=0;i<100;i++){let t=performance.now();albionAssistant.answer('Where is Pistol?',{spoiler:'direct',contextId:'toronto-intro'});samples.push(performance.now()-t);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));paints.push(performance.now()-t);}
    const percentile=a=>a.sort((x,y)=>x-y)[Math.floor(a.length*.95)];
    const {buildAlbionRecords}=await import('/guides/js/assistant/adapters/albion.js');
    const {createAssistant}=await import('/guides/js/assistant/engine.js');
    const overlay=await fetch('/guides/data/assistant/albion.json').then(r=>r.json());let t=performance.now();const records=buildAlbionRecords({DB,questLog:QUEST_LOG,questHints:QUEST_HINTS,overlay});const a=createAssistant({gameId:'benchmark',records});const prep=performance.now()-t;
    return {warmP95Ms:percentile(samples),paintedP95Ms:percentile(paints),indexPreparationMs:prep,recordCount:records.length,longTasks:window.__longTasks,resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('/assistant/')).map(r=>({url:r.name,transferBytes:r.transferSize,decodedBytes:r.decodedBodySize})),caps:a.inspect()};
  }''')
  cdp=await context.new_cdp_session(page);await cdp.send('HeapProfiler.collectGarbage');before=(await cdp.send('Runtime.getHeapUsage'))['usedSize']
  await page.evaluate("()=>{for(let i=0;i<250;i++)albionAssistant.answer('What is COM code?',{spoiler:'direct',contextId:'context'+i});}")
  await cdp.send('HeapProfiler.collectGarbage');after=(await cdp.send('Runtime.getHeapUsage'))['usedSize'];metrics['heapAfterCapsGrowthBytes']=after-before
  check('Memory contexts/history bounded',await page.evaluate('albionAssistant.inspect().contextCount<=8&&albionAssistant.inspect().contexts.every(c=>c.messages<=12)'))
  await page.set_viewport_size({'width':390,'height':844});await page.evaluate("setWalkthroughAiActiveChapter('toronto-intro')")
  await page.select_option('.guide-assistant-controls select','gentle');await ask('What next?')
  await page.locator('.walkthrough-ai').scroll_into_view_if_needed()
  await page.screenshot(path=str(OUT/'albion-mobile.png'))
  check('Mobile assistant stays in viewport',await page.locator('.walkthrough-ai').evaluate('e=>e.getBoundingClientRect().width<=innerWidth'))
  # Delayed static delivery must not deliver a question into a different topic/input.
  for mode in ['topic', 'query']:
   delayed=await browser.new_context(service_workers='block');await delayed.route('**/*',route)
   await delayed.add_init_script(script=CONSENT_FIXTURE)
   delayed.on('request',lambda r:log_request(r,'delayed-overlay'))
   gate=asyncio.Event()
   async def delay(r):
    await gate.wait();await r.continue_()
   await delayed.route('**/data/assistant/albion.json',delay)
   dp=await delayed.new_page()
   await dp.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
   dp.on('pageerror',lambda e:errors.append(str(e)))
   await dp.goto(BASE+'/guides/Albion.html',wait_until='domcontentloaded')
   await dp.evaluate("()=>{activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro');document.getElementById('walkthrough-ai-input').value='What next?';window.__pending=walkthroughAiSend();}")
   if mode=='topic':await dp.evaluate("setWalkthroughAiActiveChapter('gratogel')")
   else:await dp.evaluate("document.getElementById('walkthrough-ai-input').value='Where is Pistol?'")
   gate.set();await dp.evaluate('window.__pending')
   check('Delayed '+mode+' change rejects stale send',await dp.evaluate('albionAssistant.inspect().contexts.every(c=>c.messages===0)'))
   await delayed.close()
  # A failing static overlay must visibly fail without any inference fallback.
  failure=await browser.new_context(service_workers='block');await failure.route('**/*',route)
  await failure.add_init_script(script=CONSENT_FIXTURE)
  await failure.route('**/data/assistant/albion.json',lambda r:r.abort())
  failure.on('request',lambda r:log_request(r,'failed-overlay'))
  fp=await failure.new_page()
  await fp.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
  fp.on('pageerror',lambda e:errors.append(str(e)));await fp.goto(BASE+'/guides/Albion.html',wait_until='networkidle');await fp.evaluate('walkthroughAiSend()')
  check('Static load failure visible','could not be loaded' in await fp.locator('#walkthrough-ai-body').inner_text())
  check('No inference attempts',len(blocked)==0)
  check('No question-bearing requests',all(r['method']=='GET' and not r['hasBody'] and not r['hasQuestionParameter'] for r in requests))
  check('No page errors',not errors)
  report={'browser':browser.version,'device':platform.platform(),'checks':checks,'performance':metrics,'requests':requests,'inferenceAttempts':blocked,'pageErrors':errors,'limitations':'Existing Chrome, this Linux host only. Static server does not compress responses. Heap metric compares bounded steady-state, not a cross-browser guarantee.'}
  (OUT/'albion-browser.json').write_text(json.dumps(report,indent=2))
  print(json.dumps({'checks':len(checks),'requests':len(requests),'performance':{k:v for k,v in metrics.items() if k not in ['resources','longTasks','caps']},'errors':errors},indent=2))
  await browser.close()
asyncio.run(main())
