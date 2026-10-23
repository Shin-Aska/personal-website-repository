"""Measure the reference adapters with the shared renderer."""
from browser_consent_fixture import CONSENT_FIXTURE
import asyncio,json,os,platform,re
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('ASSISTANT_BASE_URL','http://127.0.0.1:8766').rstrip('/')
OUT=Path(__file__).resolve().parent/'evidence'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block', viewport={'width':1280,'height':900});attempts=[];requests=[]
  await context.add_init_script(script=CONSENT_FIXTURE)
  async def guard(route):
   url=route.request.url;requests.append({'url':url.split('?')[0],'method':route.request.method,'hasQuery':'?' in url,'hasBody':bool(route.request.post_data)})
   if re.search('llm.php|generativelanguage|generatecontent|api.openai|api.anthropic|webllm|\\.gguf|\\.onnx',url,re.I):attempts.append(url);await route.abort()
   else:await route.continue_()
  await context.route('**/*',guard);results={}
  for game,file,builder,args,question in [
    ('albion','Albion.html','buildAlbionRecords','{DB,questLog:QUEST_LOG,questHints:QUEST_HINTS,overlay}','Where is Pistol?'),
    ('ultima5','Ultima5.html','buildUltima5Records','{chapters:ultima5GrandQuestChapters,sideQuests:ultima5SideQuests,companions:companionData,spells:spellData,atlas:window.ULTIMA5_ATLAS_CONFIG,overlay}','Where is Jaana?'),
    ('ultima7','Ultima7.html','buildUltima7Records','DB,overlay,QUEST_TO_ATLAS','Where is Iolo?'),
    ('alqadim','AlQadim.html','buildAlQadimRecords','DB,overlay,CHAPTER_ATLAS_ROUTES','How do I use Quick Swing?'),
    ('starcraft','StarcraftBWAPI.html','buildStarcraftRecords','document,overlay','What is SCHNAIL?')]:
   page=await context.new_page()
   await page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
   await page.goto(BASE+'/guides/'+file,wait_until='networkidle')
   await page.evaluate('''async game=>{window.__module=await import('/guides/js/assistant/adapters/'+game+'.js');window.__engine=await import('/guides/js/assistant/engine.js');window.__ui=await import('/guides/js/assistant/ui.js');window.__overlay=await fetch('/guides/data/assistant/'+game+'.json').then(r=>r.json());}''',game)
   cdp=await context.new_cdp_session(page);await cdp.send('HeapProfiler.collectGarbage');before=(await cdp.send('Runtime.getHeapUsage'))['usedSize']
   prep=await page.evaluate('''()=>{const overlay=window.__overlay;const start=performance.now();const records=window.__module.BUILDER(ARGS);const extraction=performance.now()-start;const assistant=window.__engine.createAssistant({gameId:'GAME',records});const total=performance.now()-start;window.__benchAssistant=assistant;return {extractionMs:extraction,initialPreparationMs:total,indexPreparationMs:total-extraction,recordCount:records.length};}'''.replace('BUILDER',builder).replace('ARGS',args).replace('GAME',game))
   metrics=await page.evaluate('''async question=>{const samples=[],paints=[],a=window.__benchAssistant;a.setPolicy('direct');for(let i=0;i<100;i++){let t=performance.now();const r=a.answer(question,{spoiler:'direct'});if(r.decision!=='answer')throw Error(r.text);samples.push(performance.now()-t);}const section=document.createElement('section');section.style.cssText='position:fixed;right:0;top:0;width:400px;max-height:90vh;overflow:auto;background:white;color:black;z-index:99999';document.body.appendChild(section);section.innerHTML='<div></div><input><button>Send</button>';const [messages,input,sendButton]=section.children;const view=window.__ui.createView({assistant:a,messages,input,sendButton});for(let i=0;i<40;i++){input.value=question;let t=performance.now();view.send();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));paints.push(performance.now()-t);}const percentile=values=>values.sort((a,b)=>a-b)[Math.floor(values.length*.95)];return {warmP95Ms:percentile(samples),paintedP95Ms:percentile(paints),decisionCount:100};}''',question)
   await cdp.send('HeapProfiler.collectGarbage');after=(await cdp.send('Runtime.getHeapUsage'))['usedSize']
   results[game]={**prep,**metrics,'retainedRecordsAndViewBytes':after-before,'note':'Incremental records/session/view after modules+source loaded; excludes module parse memory and original guide.'}
   await page.close()
  assert not attempts,attempts
  report={'browser':browser.version,'device':platform.platform(),'cpu':'Intel Core i7-12700','results':results,'inferenceAttempts':attempts,'requests':requests}
  (OUT/'performance-browser.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(results,indent=2));await browser.close()
asyncio.run(main())
