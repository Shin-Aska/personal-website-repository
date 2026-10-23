from browser_consent_fixture import CONSENT_FIXTURE
import asyncio,json,re,pathlib
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[3]
pathlib.Path('guides/tests/assistant/results').mkdir(parents=True, exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
  ctx=await browser.new_context(service_workers='block')
  await ctx.add_init_script(script=CONSENT_FIXTURE)
  attempts=[];requests=[];errors=[]
  async def route(r):
   url=r.request.url
   requests.append({'method':r.request.method,'url':url.split('?')[0], 'hasQuery':'?' in url, 'hasBody':r.request.post_data is not None})
   if re.search(r'(?:/php/llm\.php|generativelanguage|generateContent|gemini|openai\.com|anthropic\.com|huggingface|webllm|\.gguf|\.onnx|\.safetensors)',url,re.I):
    attempts.append(url.split('?')[0]);await r.abort()
   else:await r.continue_()
  await ctx.route('**/*',route)
  page=await ctx.new_page()
  await page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
  page.on('pageerror',lambda e: errors.append(str(e)))
  await page.goto('http://127.0.0.1:8766/guides/AlQadim.html',wait_until='networkidle')
  await page.wait_for_selector('#walkthrough-ai-body .guide-assistant-message',state='attached',timeout=2000) if False else None
  await page.wait_for_function("Object.keys(genieViews).length === 2")
  aq=await page.evaluate('''async()=>{
    const {buildAlQadimRecords,importAlQadimProgress}=await import('./js/assistant/adapters/alqadim.js');
    const {createAssistant}=await import('./js/assistant/engine.js');
    const overlay=await fetch('./data/assistant/alqadim.json').then(r=>r.json());
    const records=buildAlQadimRecords(DB,overlay,CHAPTER_ATLAS_ROUTES);
    const a=createAssistant({gameId:'alqadim',records,getProgress:()=>importAlQadimProgress(DB,{ch1_1:true,ch1_2:false,ch1_3:1})});
    const results=[];
    for(const level of ['gentle','balanced','direct'])for(let id=1;id<=19;id++){
      const answer=a.answer('Give me a hint',{contextId:`alqadim:chapter:${id}`,entityIds:[`alqadim:chapter:${id}`],spoiler:level});
      results.push({id,level,decision:answer.decision,text:answer.text,recordIds:answer.recordIds});
    }
    return {results,count:records.length,progress:importAlQadimProgress(DB,{ch1_1:true,ch1_2:false,ch1_3:1})};
  }''')
  await page.locator('button[data-target="walkthrough"]').click()
  await page.locator('#walkthrough-ai-input').fill('Give me a hint')
  await page.locator('#walkthrough-ai-send').click()
  await page.wait_for_function("document.getElementById('walkthrough-ai-body').textContent.includes('Keep moving')")
  sidebar=await page.locator('#walkthrough-ai-body').inner_text()
  await page.locator('button[data-target="genie"]').click()
  await page.locator('#walkthrough-ai-input-tab').fill('How do I use Magic Missile?')
  await page.locator('#walkthrough-ai-input-tab').press('Enter')
  await page.wait_for_function("document.getElementById('walkthrough-ai-body-tab').textContent.includes('Three missiles')")
  tab=await page.locator('#walkthrough-ai-body-tab').inner_text()
  await page.locator('#main-ai-wrapper select').select_option('direct')
  await page.locator('#walkthrough-ai-input-tab').fill('Give me a hint')
  await page.locator('#walkthrough-ai-send-tab').click()
  await page.locator('#main-ai-wrapper select').select_option('gentle')
  lower=await page.locator('#walkthrough-ai-body-tab').inner_text()
  unsafe='<img src=x onerror="window.__unsafe=true">'
  await page.locator('#walkthrough-ai-input-tab').fill(unsafe)
  await page.locator('#walkthrough-ai-send-tab').click()
  safe=await page.evaluate("!window.__unsafe && !document.querySelector('#walkthrough-ai-body-tab img')")
  await ctx.set_offline(True)
  await page.locator('#walkthrough-ai-input-tab').fill('How do I use Sunfire?')
  await page.locator('#walkthrough-ai-send-tab').click()
  offline=await page.locator('#walkthrough-ai-body-tab').inner_text()
  await ctx.set_offline(False)
  await page.goto('http://127.0.0.1:8766/guides/Ultima7.html',wait_until='networkidle')
  u7=await page.evaluate('''async()=>{
    const {buildUltima7Records,ultima7QuestId}=await import('./js/assistant/adapters/ultima7.js');
    const {createAssistant}=await import('./js/assistant/engine.js');
    const overlay=await fetch('./data/assistant/ultima7.json').then(r=>r.json());
    const records=buildUltima7Records(DB,overlay,QUEST_TO_ATLAS);
    const a=createAssistant({gameId:'ultima7',records,getProgress:()=>[]});
    const results=[];
    for(const level of ['gentle','balanced','direct'])for(const key of Object.keys(overlay.quests)){
      const id=ultima7QuestId(key);const answer=a.answer('Give me a hint',{contextId:id,entityIds:[id],spoiler:level});
      results.push({key,level,decision:answer.decision,text:answer.text,recordIds:answer.recordIds});
    }
    return {results,count:records.length};
  }''')
  await page.locator('button[data-target="quests"]').click()
  await page.locator('.quest-item').first.click()
  await page.locator('.get-main-quest-hint').first.click()
  await page.wait_for_selector('.sage-input')
  general=await page.locator('.sage-general-text').inner_text()
  await page.locator('.sage-input').fill('Where is Iolo?');await page.locator('.sage-send').click()
  sage=await page.locator('.sage-messages').inner_text()
  await page.locator('.sage-spoiler').select_option('direct')
  direct=await page.locator('.sage-general-text').inner_text()
  await page.locator('.sage-spoiler').select_option('gentle')
  lowerSage=await page.locator('.sage-messages').inner_text()
  await ctx.set_offline(True)
  await page.locator('.sage-input').fill('Where is Shamino?');await page.locator('.sage-send').click()
  offlineSage=await page.locator('.sage-messages').inner_text()
  result={'alqadim':aq,'ultima7':u7,'sidebar':sidebar,'tab':tab,'lower':lower,'safe':safe,'offline':offline,'general':general,'sage':sage,'direct':direct,'lowerSage':lowerSage,'offlineSage':offlineSage,'attempts':attempts,'errors':errors,'requests':requests}
  pathlib.Path('guides/tests/assistant/results/genie-sage-variants.json').write_text(json.dumps(result,indent=2))
  print(json.dumps({k:v for k,v in result.items() if k not in ['alqadim','ultima7','requests']},indent=2))
  print('AQ',len(aq['results']),{d:sum(r['decision']==d for r in aq['results']) for d in set(r['decision'] for r in aq['results'])},'U7',len(u7['results']),{d:sum(r['decision']==d for r in u7['results']) for d in set(r['decision'] for r in u7['results'])})
  await browser.close()
  assert all(r['decision']=='answer' for r in aq['results']+u7['results']), 'A chapter/quest variant failed.'
  assert safe and not attempts and not errors, 'A safe-rendering or network gate failed.'
  assert 'solar flame' in offline and 'Blue Boar Tavern' in offlineSage, 'An offline reply failed.'
  assert 'Blackbird' not in lowerSage, 'A lowered spoiler setting leaked a solution.'
asyncio.run(main())
