from browser_consent_fixture import CONSENT_FIXTURE
import asyncio,json,pathlib,re
from playwright.async_api import async_playwright
pathlib.Path('guides/tests/assistant/results').mkdir(parents=True, exist_ok=True)
def all_request_methods_are_static(requests):
 return all(req['method'] in ('GET','HEAD') and not req['hasBody'] for req in requests)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
  context=await b.new_context(service_workers='block')
  await context.add_init_script(script=CONSENT_FIXTURE)
  requests=[];attempts=[];errors=[]
  def log_request(req):
   requests.append({'method':req.method,'url':req.url.split('?')[0],'hasQuery':'?' in req.url,'hasBody':req.post_data is not None})
  async def route(r):
   if re.search(r'(?:/php/llm\.php|generativelanguage|generateContent|gemini|openai\.com|anthropic\.com|huggingface|webllm|\.gguf|\.onnx|\.safetensors)',r.request.url,re.I):
    attempts.append(r.request.url.split('?')[0]);await r.abort()
   else:await r.continue_()
  context.on('request',log_request)
  await context.route('**/*',route)
  page=await context.new_page()
  await page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
  page.on('pageerror',lambda e:errors.append(str(e)));all=[]
  for game,html,build in [('ultima7','Ultima7','buildUltima7Records'),('alqadim','AlQadim','buildAlQadimRecords')]:
   await page.goto('http://127.0.0.1:8766/guides/'+html+'.html',wait_until='networkidle')
   all+=await page.evaluate('''async ({game,build})=>{
     const fixtures=await fetch('./tests/assistant/genie-sage-cases.json').then(r=>r.json());
     const overlay=await fetch('./data/assistant/'+game+'.json').then(r=>r.json());
     const adapter=await import('./js/assistant/adapters/'+game+'.js');const {createAssistant}=await import('./js/assistant/engine.js');
     const records=adapter[build](DB,overlay);const make=()=>createAssistant({gameId:game,records,getProgress:()=>[]});
     const out=[];
     function check(id,test,a){const r=a.answer(test.text,test.options);const errors=[];if(r.decision!==test.expected.decision)errors.push('decision');for(const text of test.expected.contains||[])if(!r.text.includes(text))errors.push('missing:'+text);for(const text of test.expected.absent||[])if(r.text.includes(text))errors.push('forbidden:'+text);out.push({id,passed:!errors.length,errors,text:test.text,result:r});}
     fixtures.questions.filter(c=>c.gameId===game).forEach(c=>check(c.id,c,make()));
     fixtures.dialogues.filter(c=>c.gameId===game).forEach(c=>{const a=make();c.turns.forEach((turn,i)=>check(c.id+':'+i,turn,a));});
     return out;
   }''',{'game':game,'build':build})
  pathlib.Path('guides/tests/assistant/results/genie-sage-fixtures.json').write_text(json.dumps(all,indent=2))
  pathlib.Path('guides/tests/assistant/results/genie-sage-fixtures-network.json').write_text(json.dumps({'browser':b.version,'inferenceAttempts':attempts,'pageErrors':errors,'requestLog':requests},indent=2)+'\n')
  print(json.dumps({'inferenceAttempts':len(attempts),'pageErrors':len(errors),'requestCount':len(requests),'pass':sum(x['passed'] for x in all),'total':len(all),'failures':[x for x in all if not x['passed']]},indent=2))
  await b.close()
  assert not any(not x['passed'] for x in all), 'A Genie/Sage fixture failed.'
  assert not attempts and not errors, 'A fixture network or page-error gate failed.'
  assert all_request_methods_are_static(requests), 'A fixture sent a non-static request.'
asyncio.run(main())
