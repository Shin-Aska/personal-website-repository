from browser_consent_fixture import CONSENT_FIXTURE
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright

BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
OUTPUT = Path(__file__).resolve().parent / 'evidence'
OUTPUT.mkdir(exist_ok=True)

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block', viewport={'width':1280,'height':900})
  await context.add_init_script(script=CONSENT_FIXTURE)
  requests=[]; errors=[]; blocked=[]
  async def route(r):
   url=r.request.url
   requests.append({'method':r.request.method,'url':url.split('?')[0],'resourceType':r.request.resource_type,
     'hasQuery':'?' in url,'hasBody':r.request.post_data is not None})
   if any(word in url.lower() for word in ['llm.php','generativelanguage','generatecontent','api.openai.com','api.anthropic.com','webllm','model.onnx','.gguf']):
    blocked.append(url); await r.abort()
   else: await r.continue_()
  await context.route('**/*',route)
  page=await context.new_page()
  await page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE + '/guides/StarcraftBWAPI.html',wait_until='networkidle')
  await page.wait_for_selector('.guide-assistant-controls',state='attached')
  await page.click('#main-nav [href="#ai-assistant"]')
  storage=await page.evaluate('JSON.stringify(localStorage)')
  results=[]
  async def ask(q):
   await page.fill('#sc-ai-input',q)
   result=await page.evaluate('scAiSend()')
   results.append({'question':q,'decision':result['decision'],'records':result['recordIds'],'level':result['level'],'text':result['text']})
   return result
  assert (await ask('What is SCHNAIL?'))['decision']=='answer'
  assert (await ask('How do I install BWAILauncher?'))['decision']=='answer'
  assert (await ask('How do I use the Remastered SCM map?'))['decision']=='answer'
  await page.select_option('#sc-assistant-spoiler','direct')
  assert (await ask('How do I use the Remastered SCM map?'))['level']=='direct'
  assert (await ask('smaller hint'))['level']=='balanced'
  assert (await ask('smaller hint'))['level']=='gentle'
  await page.select_option('#sc-assistant-spoiler','gentle')
  text=await page.locator('#sc-ai-chat').inner_text()
  assert 'Earlier message hidden at this help level.' in text
  assert (await ask('How do I use BWAILauncher in Remastered?'))['decision']=='decline'
  assert (await ask('What are the prerequisites for BWAILauncher?'))['decision']=='decline'
  await ask('<img src=x onerror="alert(1)">')
  assert await page.locator('#sc-ai-chat img').count()==0
  await context.set_offline(True)
  assert (await ask('How do I download SCHNAIL?'))['decision']=='answer'
  assert (await ask('Where do I find the Protoss mothership?'))['decision']!='answer'
  assert await page.evaluate('JSON.stringify(localStorage)')==storage
  await page.evaluate('scAiClear()')
  assert 'Local guide ready' in await page.locator('#sc-ai-chat').inner_text()
  await page.screenshot(path=str(OUTPUT / 'starcraft-local-assistant.png'),full_page=False)
  await context.set_offline(False)
  # The same assistant in two explicit views must share its policy visibly.
  sync=await page.evaluate('''async () => {
   const {createAssistant}=await import('/guides/js/assistant/engine.js');
   const {createView}=await import('/guides/js/assistant/ui.js');
   const r={id:'item:hint',entityId:'item',title:'Item',aliases:[],relation:'hint',requires:null,source:{file:'fixture',review:'extracted'},variants:{gentle:{text:'safe clue'},direct:{text:'HIDDEN ANSWER'}}};
   const assistant=createAssistant({gameId:'fixture',records:[r]});
   const create=()=>{const section=document.createElement('section');document.body.appendChild(section);section.innerHTML='<select><option value="gentle">Gentle</option><option value="direct">Direct</option></select><div></div><input><button>send</button>';const [select,messages,input,sendButton]=section.children;const view=createView({assistant,messages,input,sendButton,spoilerSelect:select,getContext:()=>({contextId:'fixture',entityIds:['item']})});return {section,select,messages,input,view};};
   const one=create(),two=create();one.select.value='direct';one.select.dispatchEvent(new Event('change'));one.input.value='hint for Item';one.view.send();const sharedDirect=two.select.value==='direct'&&two.messages.textContent.includes('HIDDEN ANSWER');two.select.value='gentle';two.select.dispatchEvent(new Event('change'));const sharedGentle=one.select.value==='gentle'&&!one.messages.textContent.includes('HIDDEN ANSWER');one.view.refresh();const staysGentle=assistant.policy==='gentle';one.view.destroy();two.view.destroy();one.section.remove();two.section.remove();return {sharedDirect,sharedGentle,staysGentle};
  }''')
  assert all(sync.values()),sync
  async_cases=[]
  # Hold first-use JSON until the user has changed the pending request.
  # Each trial starts in a fresh document, with route interception already set.
  for change in ['input','topic','reset','navigation','spoiler']:
   trial=await context.new_page()
   await trial.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
   trial.on('pageerror',lambda e:errors.append(str(e)))
   started=asyncio.Event(); release=asyncio.Event()
   async def delayed_overlay(r):
    started.set()
    await release.wait()
    await r.fallback()
   await trial.route('**/data/assistant/starcraft.json',delayed_overlay)
   await trial.goto(BASE + '/guides/StarcraftBWAPI.html',wait_until='domcontentloaded')
   await asyncio.wait_for(started.wait(),10)
   await trial.click('#main-nav [href="#ai-assistant"]')
   await trial.fill('#sc-ai-input','What is SCHNAIL?')
   await trial.evaluate('() => { window.__scPending = scAiSend(); }')
   if change=='input': await trial.fill('#sc-ai-input','How do I use the Remastered SCM map?')
   elif change=='topic': await trial.select_option('#sc-assistant-topic','bwai')
   elif change=='reset': await trial.evaluate('scAiClear()')
   elif change=='navigation': await trial.click('#main-nav [href="#overview"]')
   else: await trial.select_option('#sc-assistant-spoiler','balanced')
   release.set()
   await trial.wait_for_selector('.guide-assistant-controls',state='attached')
   pending=await trial.evaluate('window.__scPending')
   history=await trial.evaluate('scLocalController.assistant.getHistory()')
   assert pending is None and not history,(change,pending,history)
   async_cases.append({'case':'delayed-'+change,'staleAnswerRejected':True})
   await trial.close()
  for failure in ['aborted-overlay','malformed-overlay']:
   trial=await context.new_page()
   await trial.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
   trial.on('pageerror',lambda e:errors.append(str(e)))
   async def broken_overlay(r):
    requests.append({'method':r.request.method,'url':r.request.url.split('?')[0],
      'resourceType':r.request.resource_type,'hasQuery':'?' in r.request.url,
      'hasBody':r.request.post_data is not None,'fixture':failure})
    if failure=='aborted-overlay': await r.abort()
    else: await r.fulfill(status=200,content_type='application/json',body='{"entities":')
   await trial.route('**/data/assistant/starcraft.json',broken_overlay)
   await trial.goto(BASE + '/guides/StarcraftBWAPI.html',wait_until='networkidle')
   await trial.click('#main-nav [href="#ai-assistant"]')
   await trial.wait_for_function("document.getElementById('sc-ai-chat').textContent.includes('local guide could not be loaded')")
   await trial.fill('#sc-ai-input','What is SCHNAIL?')
   assert await trial.evaluate('scAiSend()') is None
   assert await trial.locator('.guide-assistant-message').count()==0
   assert 'No question was sent to a service' in await trial.locator('#sc-ai-chat').inner_text()
   async_cases.append({'case':failure,'safeLocalError':True})
   await trial.close()
  assert not blocked,blocked
  assert not errors,errors
  assert all(request['method']=='GET' and not request['hasBody'] and not request['hasQuery'] for request in requests), 'Unexpected question-bearing or non-static request.'
  out={'browser':browser.version,'questions':results,'policySync':sync,'asyncAndErrorCases':async_cases,'requests':requests,'blockedInferenceAttempts':len(blocked),'pageErrors':errors,'storageUnchanged':True,'disconnectedQuestions':2}
  (OUTPUT / 'starcraft-browser.json').write_text(json.dumps(out,indent=2))
  print(json.dumps({'browser':out['browser'],'questionCount':len(results),'asyncAndErrorCases':async_cases,'requests':len(requests),'policySync':sync,'blockedInferenceAttempts':len(blocked),'pageErrors':errors,'storageUnchanged':True},indent=2))
  await browser.close()

asyncio.run(main())
