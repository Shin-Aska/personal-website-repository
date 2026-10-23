"""Actual checkbox/context/choice UI acceptance with existing Chrome and Playwright."""
from browser_consent_fixture import CONSENT_FIXTURE
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
OUT = Path(__file__).resolve().parent / 'evidence'
OUT.mkdir(exist_ok=True)
checks, errors = [], []

def check(label, value):
    assert value, label
    checks.append(label)

def storage(page):
    return page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
    context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
    context.add_init_script(script=CONSENT_FIXTURE)

    def route(r):
        if urlparse(r.request.url).hostname in {'127.0.0.1', 'localhost'}:
            assert r.request.method == 'GET' and r.request.post_data is None
            r.continue_()
        else:
            r.abort()

    context.route('**/*', route)
    context.add_init_script("""
        localStorage.setItem('albion.questLog.v1', JSON.stringify({'toronto-intro':{'hide-weapon':true,'anne-rations':true}}));
        localStorage.setItem('ultima6-grand-quest-progress-v1', JSON.stringify(['act-i-liberating-the-shrines:compassion-britain','act-i-liberating-the-shrines:honesty-moonglow']));
        localStorage.setItem('alqadim.questState.v1', JSON.stringify({ch1_1:true,ch1_3:true}));
    """)
    page = context.new_page()
    page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE + '/guides/Albion.html', wait_until='networkidle')
    page.wait_for_selector('.guide-assistant-controls', state='attached')
    page.evaluate("activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro')")
    before = storage(page)

    def albion_ask(text):
        page.locator('#walkthrough-ai-input').fill(text)
        return page.evaluate('async () => { await walkthroughAiSend(); return albionAssistant.getHistory(walkthroughAiActiveChapterId).at(-1); }')

    r = albion_ask('i just started, what to do here?')
    check('Albion exact newcomer message selects first unticked with live count', r['recordIds'] == ['albion:access:com:hint'] and '2 of 5 done' in r['text'])
    check('Nudge quotation and chips hide Direct names/code', all(x not in json.dumps(r) for x in ['1042', 'Beegle', 'wall cabinet']))
    chip = r['choices'][0]
    page.locator('#walkthrough-ai-body').get_by_role('button', name=chip['label'], exact=True).click()
    check('Remaining step chip answers that step', page.evaluate("albionAssistant.getHistory(walkthroughAiActiveChapterId).at(-1).recordIds[0]") == 'albion:item:pistol:hint')
    page.locator('.guide-assistant-controls select').select_option('direct')
    check('Full answer quotes authorized COM text', '1042' in albion_ask('what now?')['text'])
    page.locator('.guide-assistant-controls select').select_option('gentle')
    check('Lower help hides earlier full answer', '1042' not in page.locator('#walkthrough-ai-body').inner_text())
    context.set_offline(True)
    check('First unticked reply works offline', '2 of 5 done' in albion_ask("I'm stuck")['text'])
    context.set_offline(False)
    check('Albion chat leaves every saved value unchanged', before == storage(page))
    # Explicit user-style checkbox action is the only progress mutation here.
    page.locator('.accordion-header').first.click()
    page.locator('[data-quest-group="toronto-intro"] input[type="checkbox"]').nth(1).check()
    before = storage(page)
    r = albion_ask('hint')
    check('Explicit checkbox change is reflected on the next hint', '3 of 5 done' in r['text'] and r['recordIds'] == ['albion:item:pistol:hint'])
    check('Subsequent chat does not write the checkbox change', before == storage(page))
    page.set_viewport_size({'width': 390, 'height': 844})
    page.locator('.walkthrough-ai').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT / 'contextual-checklist-albion.png'))

    page.goto(BASE + '/guides/Ultima6.html', wait_until='networkidle')
    page.evaluate("openSeerForQuest('act-i-liberating-the-shrines')")
    page.wait_for_selector('.guide-assistant-controls', state='attached')
    before = storage(page)

    def u6_ask(text):
        page.locator('#seer-query').fill(text)
        page.locator('#ask-seer').click()
        page.wait_for_function("document.querySelector('#seer-chat-messages .guide-assistant-message.ai:last-child')?.textContent.includes('2 of 8 done')")
        return page.locator('#seer-chat-messages .guide-assistant-message.ai').last.inner_text()

    r = u6_ask('what now?')
    check('U6 overview selects the first unfinished section-checkbox', 'First unticked step here (2 of 8 done)' in r and 'someone much smaller than the Avatar' in r and 'Source: existing guide' in r)
    check('U6 chat preserves saved progress', before == storage(page))

    page.goto(BASE + '/guides/AlQadim.html', wait_until='networkidle')
    page.wait_for_function('Object.keys(genieViews).length === 2')
    page.locator('button[data-target="genie"]').click()
    before = storage(page)

    def aq_ask(text):
        page.locator('#walkthrough-ai-input-tab').fill(text)
        page.locator('#walkthrough-ai-send-tab').click()
        page.wait_for_function("""text => {
            const nodes = [...document.querySelectorAll('#walkthrough-ai-body-tab .guide-assistant-message')];
            return nodes.at(-1)?.classList.contains('ai') && nodes.at(-2)?.textContent.includes(text);
        }""", arg=text)
        return page.locator('#walkthrough-ai-body-tab .guide-assistant-message.ai').last.inner_text()

    r = aq_ask('hint')
    check('Al-Qadim Nudge labels its chapter-only fallback', '2 of 7 done' in r and 'Section hint:' in r and 'disintegrator' not in r)
    page.locator('#main-ai-wrapper select').select_option('direct')
    r = aq_ask("I'm stuck")
    check('Al-Qadim Full answer quotes first unticked objective', 'First unticked step here (2 of 7 done)' in r and 'Avoid the moving disintegrator field' in r and 'Source: existing guide' in r)
    page.locator('#main-ai-wrapper select').select_option('gentle')
    check('Al-Qadim lowering help hides direct step text', 'Avoid the moving disintegrator field' not in page.locator('#walkthrough-ai-body-tab').inner_text())
    check('Al-Qadim chat preserves saved progress', before == storage(page))
    check('No page errors', not errors)
    (OUT / 'contextual-checklist-browser.json').write_text(json.dumps({'checks': checks, 'errors': errors}, indent=2) + '\n')
    print(f'ok: {len(checks)} checklist/context/choice UI checks')
    browser.close()
