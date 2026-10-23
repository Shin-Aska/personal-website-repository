"""Existing Chrome/Playwright acceptance; never installs dependencies or calls inference.
Run from the checkout with a static server on 127.0.0.1:8766 (or ASSISTANT_BASE_URL).
"""
from browser_consent_fixture import CONSENT_FIXTURE
import json
import platform
import os
import re
import time
from urllib.parse import urlparse, parse_qs
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'guides' / 'tests' / 'assistant' / 'ultima-seers-results'
OUT.mkdir(exist_ok=True)
BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766')
CPU = next((line.split(':', 1)[1].strip() for line in Path('/proc/cpuinfo').read_text().splitlines() if line.startswith('model name')), 'not reported')
FORBIDDEN = re.compile(r'(?:/php/llm\.php|generativelanguage|generateContent|openai\.com/(?:v1|api)|webllm|\.onnx|\.gguf|model\.bin)', re.I)
requests, checks, errors = [], [], []

def check(label, result):
    checks.append({'check': label, 'passed': bool(result)})
    if not result:
        raise AssertionError(label)

def snapshot(page):
    return page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k]) => /^ultima[56]-/.test(k))))')

def route_request(route):
    url = route.request.url
    if FORBIDDEN.search(url):
        route.abort()
    else:
        route.continue_()

def ask(page, text):
    page.locator('#seer-query').fill(text)
    page.locator('#ask-seer').click()
    page.wait_for_timeout(60)

def log_request(request):
    # Only local static URLs are retained verbatim. Never log request bodies.
    url = request.url
    requests.append({'url': url if url.startswith(BASE) else url.split('?')[0], 'method': request.method,
                     'type': request.resource_type, 'forbidden': bool(FORBIDDEN.search(url)),
                     'hasQuery': '?' in url, 'hasBody': request.post_data_buffer is not None})

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True,
                               args=['--no-sandbox', '--enable-precise-memory-info'])
    context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
    context.add_init_script(script=CONSENT_FIXTURE)
    context.route('**/*', route_request)  # Installed BEFORE opening either guide.
    context.on('request', log_request)
    context.on('requestfailed', lambda request: errors.append({'requestFailed': request.url, 'failure': request.failure}))
    page = context.new_page()
    page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
    page.on('pageerror', lambda error: errors.append({'pageError': str(error)}))
    page.goto(BASE + '/guides/Ultima6.html', wait_until='networkidle')
    page.evaluate("document.querySelector('[data-quest-complete]').click()")
    check('U6 original quest progress button saves legacy key', 'compassion-britain' in page.evaluate("localStorage.getItem('ultima6-grand-quest-progress-v1')"))
    page.evaluate("document.querySelector('[data-quest-complete]').click(); openBritanniaAtlasDestination('Sherry')")
    page.wait_for_function("document.getElementById('britannia-map-search').value === 'Sherry'")
    check('U6 original atlas callback selects marker', page.locator('#britannia-map-search').input_value() == 'Sherry')
    before6 = snapshot(page)
    cdp = context.new_cdp_session(page)
    cdp.send('HeapProfiler.collectGarbage')
    baseline6 = page.evaluate('performance.memory.usedJSHeapSize')
    page.evaluate("openSeerForQuest('act-i-liberating-the-shrines', 'sacrifice-minoc')")
    page.locator('#seer-general-hints').filter(has_text='crafted instrument').wait_for()
    check('U6 quest Gentle general hint hides song code', '6789878767653' not in page.locator('#seer-general-hints').inner_text())
    page.locator('#seer-spoiler-select').select_option('direct')
    check('U6 Direct general hints reveal authored steps', '6789878767653' in page.locator('#seer-general-hints').inner_text())
    ask(page, 'hint')
    check('U6 quest chat grounded in selected objective', '6789878767653' in page.locator('#seer-chat-messages').inner_text())
    page.locator('#seer-spoiler-select').select_option('gentle')
    check('U6 lowering ceiling refilters history', '6789878767653' not in page.locator('#seer-chat-messages').inner_text())
    check('U6 lowering ceiling refilters General Hints', '6789878767653' not in page.locator('#seer-general-hints').inner_text())
    ask(page, '<img src=x onerror=alert(1)>')
    check('U6 input rendered as text', page.locator('#seer-chat-messages img').count() == 0)
    page.screenshot(path=str(OUT / 'ultima6-gentle.png'))
    page.evaluate("openSeerForSideQuest('the-merchants-circuit')")
    check('U6 side context authored gentle hint', 'settlement' in page.locator('#seer-general-hints').inner_text())
    ask(page, 'hint')
    check('U6 side context chat', 'settlement' in page.locator('#seer-chat-messages').inner_text())
    page.evaluate("openSeerForMarker('Sherry')")
    check('U6 marker Gentle hides coordinates and name', '121' not in page.locator('#seer-general-hints').inner_text() and 'Sherry' not in page.locator('#seer-modal-title').inner_text())
    page.locator('#seer-spoiler-select').select_option('direct')
    check('U6 marker Direct coordinates', '121' in page.locator('#seer-general-hints').inner_text())
    ask(page, 'Where is Sherry?')
    check('U6 marker location answer', 'Castle Britannia' in page.locator('#seer-chat-messages').inner_text() or '121' in page.locator('#seer-chat-messages').inner_text())
    page.evaluate('openSeerForAtlasLayer(5)')
    page.locator('#seer-spoiler-select').select_option('gentle')
    check('U6 layer context', 'marker' in page.locator('#seer-general-hints').inner_text())
    ask(page, 'hint')
    check('U6 layer chat', 'layer' in page.locator('#seer-chat-messages').inner_text())
    page.evaluate("openSeerForQuest('act-i-liberating-the-shrines', 'sacrifice-minoc')")
    check('U6 reopened history stays Gentle', '6789878767653' not in page.locator('#seer-chat-messages').inner_text())
    context.set_offline(True)
    ask(page, 'hint')
    check('U6 offline dialogue', 'crafted instrument' in page.locator('#seer-chat-messages').inner_text())
    page.evaluate("closeSeerModal(); openSeerForQuest('act-i-liberating-the-shrines', 'sacrifice-minoc')")
    ask(page, 'I already did that')
    check('U6 close/reopen clears stale last action', 'no single pending action' in page.locator('#seer-chat-messages').inner_text())
    page.evaluate('closeSeerModal(); document.querySelector(\'input[name="virtue"][value="Valor"]\').checked = true; generateChronicle()')
    check('Chronicle is offline authored fiction', 'Roleplaying fiction' in page.locator('#chronicle-output').inner_text() and 'frightened traveller' in page.locator('#chronicle-output').inner_text())
    check('U6 no assistant progress writes', snapshot(page) == before6)
    cdp.send('HeapProfiler.collectGarbage')
    retained6 = page.evaluate('performance.memory.usedJSHeapSize') - baseline6
    performance6 = page.evaluate('''async () => {
      const a = seerState.assistant, samples = [];
      for(let n=0;n<100;n++){ const t=performance.now(); a.answer('How do I get Swamp Boots?',{contextId:'benchmark',spoiler:'direct'}); samples.push(performance.now()-t); }
      samples.sort((a,b)=>a-b);
      const paints=[];
      for(let n=0;n<30;n++){document.getElementById('seer-query').value='hint';const t=performance.now();seerState.view.send();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);paints.push(performance.now()-t);}
      paints.sort((a,b)=>a-b);
      return {initialPreparationMs:a.preparationMs,extractionMs:a.extractionMs,indexPreparationMs:a.indexPreparationMs,warmP95Ms:samples[94],warmMaxMs:samples[99],paintedP95Ms:paints[28],totalHeapBytes:performance.memory?.usedJSHeapSize};
    }''')
    performance6['additionalRetainedHeapBytes'] = retained6
    context.set_offline(False)
    page.goto(BASE + '/guides/Ultima5.html', wait_until='networkidle')
    page.evaluate("showUltima5Section('counsel')")
    page.locator('#seer-response').filter(has_text='Local guide ready').wait_for()
    page.evaluate("document.querySelector('[data-u5-grand-complete=opening-party]').click()")
    check('U5 original campaign progress button saves legacy mapping', 'side-jaana' in page.evaluate("localStorage.getItem('ultima5-sidequest-progress-v1')"))
    page.evaluate("document.querySelector('[data-u5-grand-complete=opening-party]').click(); document.querySelector('[data-u5-supply=carpet]').click()")
    check('U5 original field-kit checkbox saves legacy key', 'carpet' in page.evaluate("localStorage.getItem('ultima5-field-kit-v2')"))
    page.evaluate("document.querySelector('[data-u5-supply=carpet]').click(); document.querySelector('[data-u5-grand-map=opening-grapple]').click()")
    page.wait_for_function("ultima5AtlasState.currentInterior?.id === 'location-31'")
    check('U5 original atlas callback opens requested interior', page.evaluate("ultima5AtlasState.currentInterior.id") == 'location-31')
    page.evaluate("showUltima5Section('counsel')")
    before5 = snapshot(page)
    ask(page, 'How do I get the Magic Carpet?')
    check('U5 default Gentle', '6-7-8' not in page.locator('#seer-response').inner_text())
    page.locator('.guide-assistant-controls select').select_option('direct')
    ask(page, 'How do I get the Grapple?')
    check('U5 item acquisition', 'Lord Michael' in page.locator('#seer-response').inner_text())
    ask(page, 'I lost it')
    check('U5 correction acknowledgement', 'current report (no)' in page.locator('#seer-response').inner_text())
    ask(page, 'How do I get the Sandalwood Box?')
    check('U5 Direct solution', '6-7-8-9' in page.locator('#seer-response').inner_text())
    page.locator('.guide-assistant-controls select').select_option('gentle')
    check('U5 lowering ceiling refilters history', '6-7-8-9' not in page.locator('#seer-response').inner_text())
    context.set_offline(True)
    ask(page, 'How do I get the Grapple?')
    check('U5 offline dialogue', 'climbing equipment' in page.locator('#seer-response').inner_text())
    ask(page, 'hint for Prepare the party')
    context.set_offline(False)
    page.evaluate("showUltima5Section('atlas'); showUltima5Section('counsel')")
    ask(page, 'I already did that')
    check('U5 section change clears stale last action', 'no single pending action' in page.locator('#seer-response').inner_text())
    page.wait_for_load_state('networkidle')
    context.set_offline(True)
    ask(page, '<svg onload=alert(1)>')
    check('U5 input rendered as text', page.locator('#seer-response svg').count() == 0)
    check('U5 no assistant progress writes', snapshot(page) == before5)
    page.locator('.u5-seer-chamber').screenshot(path=str(OUT / 'ultima5-gentle.png'))
    performance5 = page.evaluate('''async () => {
      const samples=[];
      for(let n=0;n<30;n++){document.getElementById('seer-query').value='How do I get the Grapple?';const t=performance.now();ultima5SeerView.send();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);samples.push(performance.now()-t);}
      samples.sort((a,b)=>a-b);return {initialPreparationMs:ultima5SeerView.preparationMs,paintedP95Ms:samples[28],totalHeapBytes:performance.memory?.usedJSHeapSize};
    }''')
    # Fresh contexts exercise a missing local overlay: this must produce a visible
    # local-file error, without ever attempting a hidden inference fallback.
    for game in ['Ultima5', 'Ultima6']:
        failed_context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
        failed_context.add_init_script(script=CONSENT_FIXTURE)
        def fail_overlay(route):
            if '/data/assistant/' in route.request.url or FORBIDDEN.search(route.request.url):
                route.abort()
            else:
                route.continue_()
        failed_context.route('**/*', fail_overlay)
        failed_context.on('request', log_request)
        failed_context.on('requestfailed', lambda request: errors.append({'expectedOverlayFailure': request.url, 'failure': request.failure}))
        failed_page = failed_context.new_page()
        failed_page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
        failed_page.on('pageerror', lambda error: errors.append({'pageError': str(error)}))
        failed_page.goto(BASE + '/guides/' + game + '.html', wait_until='networkidle')
        if game == 'Ultima5':
            failed_page.evaluate("showUltima5Section('counsel')")
            failed_page.locator('#seer-response').filter(has_text='could not be loaded').wait_for()
        else:
            failed_page.evaluate("openSeerForQuest('act-i-liberating-the-shrines', 'compassion-britain')")
            failed_page.locator('#seer-general-hints').filter(has_text='could not be loaded').wait_for()
        ask(failed_page, 'How do I get an imaginary secret sword?')
        output_id = '#seer-response' if game == 'Ultima5' else '#seer-chat-messages'
        failed_page.locator(output_id).filter(has_text='No question has been sent').wait_for()
        check(game + ' missing-overlay error is visible with no fallback', 'No question has been sent' in failed_page.locator(output_id).inner_text())
        failed_context.close()
    # Hold the initial static overlay to test the asynchronous module bridge,
    # then change the query or UI before releasing it. No old send may resume.
    delayed_cases = [('Ultima6', 'query'), ('Ultima6', 'topic'), ('Ultima6', 'close'),
                     ('Ultima6', 'reopen'), ('Ultima5', 'query'), ('Ultima5', 'section')]
    for game, mutation in delayed_cases:
        delayed_context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
        delayed_context.add_init_script(script=CONSENT_FIXTURE)
        pending_routes = []
        def hold_overlay(route):
            if FORBIDDEN.search(route.request.url):
                route.abort()
            elif '/data/assistant/' in route.request.url:
                pending_routes.append(route)
            else:
                route.continue_()
        delayed_context.route('**/*', hold_overlay)
        delayed_context.on('request', log_request)
        delayed_context.on('requestfailed', lambda request: errors.append({'requestFailed': request.url, 'failure': request.failure}))
        delayed_page = delayed_context.new_page()
        delayed_page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
        delayed_page.on('pageerror', lambda error: errors.append({'pageError': str(error)}))
        delayed_page.goto(BASE + '/guides/' + game + '.html', wait_until='domcontentloaded')
        if game == 'Ultima6':
            delayed_page.evaluate("openSeerForQuest('act-i-liberating-the-shrines', 'compassion-britain')")
        else:
            delayed_page.evaluate("showUltima5Section('counsel')")
        for _ in range(150):
            if pending_routes: break
            delayed_page.wait_for_timeout(20)
        if not pending_routes: raise AssertionError('Overlay was not intercepted for ' + game)
        delayed_page.locator('#seer-query').fill('hint' if game == 'Ultima6' else 'How do I get the Grapple?')
        delayed_page.locator('#ask-seer').click()
        if mutation == 'query':
            delayed_page.locator('#seer-query').fill('Replacement question not submitted')
        elif mutation == 'topic':
            delayed_page.evaluate("openSeerForSideQuest('the-merchants-circuit')")
            delayed_page.locator('#seer-query').fill('hint')
        elif mutation == 'close':
            delayed_page.evaluate('closeSeerModal()')
        elif mutation == 'reopen':
            delayed_page.evaluate("closeSeerModal(); openSeerForQuest('act-i-liberating-the-shrines', 'compassion-britain')")
            delayed_page.locator('#seer-query').fill('hint')
        else:
            delayed_page.evaluate("showUltima5Section('atlas'); showUltima5Section('counsel')")
        for pending_route in pending_routes:
            pending_route.continue_()
        ready = 'seerState.view !== null' if game == 'Ultima6' else 'ultima5SeerView !== null'
        delayed_page.wait_for_function(ready)
        delayed_page.wait_for_load_state('networkidle')
        if game == 'Ultima6':
            histories = delayed_page.evaluate("seerState.assistant.inspect().contexts.map(context => context.messages)")
        else:
            histories = delayed_page.evaluate("ultima5SeerAssistant.inspect().contexts.map(context => context.messages)")
        check(game + ' delayed overlay rejects stale ' + mutation + ' send', sum(histories) == 0)
        delayed_context.close()
    check('Query parameters contain only static asset versions', all(set(parse_qs(urlparse(request['url']).query)) <= {'v'} for request in requests))
    check('No attempted inference/model request', not any(request['forbidden'] for request in requests))
    check('Only body-free GET requests', all(request['method'] == 'GET' and not request['hasBody'] for request in requests))
    check('No page JavaScript errors', not any('pageError' in error for error in errors))
    report = {'browser': browser.version, 'device': platform.platform(), 'cpu': CPU, 'checks': checks,
              'performance': {'ultima6': performance6, 'ultima5': performance5}, 'errors': errors,
              'limits': 'Only the named existing Chrome on this host was measured; no cross-browser performance claim.'}
    (OUT / 'acceptance.json').write_text(json.dumps(report, indent=2))
    (OUT / 'requests.json').write_text(json.dumps(requests, indent=2))
    print(json.dumps({'checks': len(checks), 'passed': sum(x['passed'] for x in checks), 'requests': len(requests), 'errors': errors, 'performance': performance6}))
    browser.close()
