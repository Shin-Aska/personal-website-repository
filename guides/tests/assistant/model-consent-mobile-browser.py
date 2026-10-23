"""Real first-visit mobile consent; never opts in or loads a model."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('ASSISTANT_BASE_URL','http://127.0.0.1:8766')
OUT=Path(__file__).resolve().parent/'evidence';checks=[];model_requests=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
 for name in ['Albion','Ultima5','Ultima6','Ultima7','AlQadim','StarcraftBWAPI']:
  c=b.new_context(viewport={'width':390,'height':844},service_workers='block');page=c.new_page()
  def route(r):
   if '/local-assistant/files/' in r.request.url or '/assistant/model-worker.js' in r.request.url:model_requests.append(r.request.url)
   if r.request.url.startswith(BASE):r.continue_()
   else:r.abort()
  c.route('**/*',route);page.goto(BASE+'/guides/'+name+'.html',wait_until='networkidle')
  dialog=page.locator('#guide-assistant-consent[open]');dialog.wait_for();box=dialog.bounding_box()
  ok=box['x']>=0 and box['x']+box['width']<=390 and box['height']<=844*.85+2
  assert ok,(name,box);checks.append({'game':name,'check':'consent fits mobile viewport','passed':True})
  if name=='Albion':page.screenshot(path=str(OUT/'model-consent-mobile.png'))
  page.get_by_role('button',name='Keep chat off',exact=True).click()
  assert page.locator('[data-guide-chat-surface]:visible').count()==0
  checks.append({'game':name,'check':'decline hides chat','passed':True})
  page.get_by_role('button',name='Assistant settings',exact=True).click();page.get_by_role('button',name='Reset choice',exact=True).click()
  assert page.locator('#guide-assistant-consent[open]').is_visible()
  checks.append({'game':name,'check':'settings can reset choice on mobile','passed':True});c.close()
 b.close()
assert not model_requests,model_requests
(OUT/'model-consent-mobile-report.json').write_text(json.dumps({'checks':checks,'modelRequests':model_requests},indent=2)+'\n')
print(f'{len(checks)}/{len(checks)} mobile consent checks passed; no model requests.')
