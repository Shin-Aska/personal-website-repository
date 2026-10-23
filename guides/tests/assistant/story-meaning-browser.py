"""Meaning and latest-context checks through the real Ultima VII quest UI."""
from browser_consent_fixture import CONSENT_FIXTURE
import json
import os
from pathlib import Path
import re
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
OUT = Path(__file__).resolve().parent / 'evidence'
OUT.mkdir(exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/google-chrome',
        headless=True, args=['--no-sandbox'])
    context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 1000})
    context.add_init_script(script=CONSENT_FIXTURE)
    context.set_default_timeout(60000)
    external, errors, replies = [], [], []

    def route(request):
        url = request.request.url
        if url.startswith(('data:', 'blob:')) or urlparse(url).hostname in {
                urlparse(BASE).hostname, '127.0.0.1', 'localhost'}:
            request.continue_()
        else:
            external.append(url.split('?')[0])
            request.abort()

    context.route('**/*', route)
    page = context.new_page()
    page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(f'{BASE}/guides/Ultima7.html', wait_until='networkidle')
    page.locator('button[data-target="quests"]').click()
    quest = page.locator('#main-quest-accordion [data-quest-key="infiltrating-the-fellowship"]')
    quest.locator('.quest-item').click()
    quest.locator('.get-main-quest-hint').click()
    page.wait_for_selector('.sage-input')
    page.locator('.sage-spoiler').select_option('direct')
    saved = page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')

    def ask(question):
        before = page.locator('.sage-messages').inner_text()
        page.locator('.sage-input').fill(question)
        page.locator('.sage-send').click()
        page.wait_for_function('''([before, question]) => {
            const body = document.querySelector('.sage-messages');
            const messages = [...body.querySelectorAll('.guide-assistant-message')];
            return body.innerText !== before && messages.at(-1)?.classList.contains('ai')
                && messages.at(-2)?.textContent.includes(question);
        }''', arg=[before, question])
        reply = page.locator('.sage-messages .guide-assistant-message.ai').last.inner_text()
        replies.append({'question': question, 'reply': reply})
        return reply

    def assert_meaning(reply):
        killers = re.findall(r'^Killers: ([^\n]+)$', reply, re.M)
        victims = re.findall(r'^Victims: ([^\n]+)$', reply, re.M)
        assert killers == ['Hook, Forskis'], reply
        assert victims == ['Inamo, Christopher'], reply
        assert 'Not in this guide — from outside research:' in reply, reply
        assert 'Outside research (not in this guide):' in reply, reply
        assert 'title=Inamo&oldid=154876' in reply, reply
        assert 'According to the Ultima Codex, Inamo was killed in the ritual murder of Christopher' in reply, reply

    assert 'Gargoyle immigrant' in ask('Who is Inamo?')
    for question in ['Who killed who?', 'Who murdered who?', 'Who killed whom?']:
        assert_meaning(ask(question))
    page.screenshot(path=str(OUT / 'story-meaning-direct.png'))

    assert 'Finnigan' in ask('Who is Finnigan?')
    reply = ask('Who killed who?')
    assert 'sourced answer' in reply and not re.search(r'Hook|Forskis|^Killers:|^Victims:', reply, re.M), reply
    assert_meaning(ask('Who killed who in the Trinsic murders?'))
    assert 'sourced answer' in ask('Who killed Finnigan?')
    reply = ask('Who killed who?')
    assert ('sourced answer' in reply or 'Which person' in reply) and 'Forskis' not in reply, reply
    assert_meaning(ask('Who killed who in the Trinsic murders?'))
    assert 'sourced answer' in ask('What happened to Finnigan?')
    reply = ask('Who killed who?')
    assert ('sourced answer' in reply or 'Which person' in reply) and 'Forskis' not in reply, reply
    assert_meaning(ask('Who killed who in the Trinsic murders?'))

    # A reset starts from the selected Fellowship quest, not the old murders.
    page.get_by_role('button', name='New topic', exact=True).click()
    reply = ask('Who killed who?')
    assert 'sourced answer' in reply and 'Forskis' not in reply, reply
    assert 'Gargoyle immigrant' in ask('Who is Inamo?')
    assert_meaning(ask('Who killed who?'))

    context.set_offline(True)
    assert_meaning(ask('Who killed who?'))
    reply = ask('Who killed who according to the guide?')
    assert 'not a confirmed murderer' in reply and 'man with a hook' in reply, reply
    assert not re.search(r'^Killers:|^Victims:|Forskis|outside research', reply, re.M), reply
    reply = ask('Who killed who?')
    assert 'not a confirmed murderer' in reply and 'man with a hook' in reply, reply
    assert not re.search(r'^Killers:|^Victims:|Forskis|outside research', reply, re.M), reply

    for spoiler in ['balanced', 'gentle']:
        page.locator('.sage-spoiler').select_option(spoiler)
        reply = ask('Who killed who?')
        assert 'sourced answer' in reply, reply
        history = page.locator('.sage-messages').inner_text()
        assert not re.search(r'Hook|Forskis|^Killers:|^Victims:|oldid=154876', history, re.M), history

    assert saved == page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')
    assert not external, external
    assert not errors, errors
    (OUT / 'story-meaning-browser.json').write_text(json.dumps({
        'passed': True, 'replies': replies, 'meaning': 'killers and victims explicitly distinguished',
        'latestContextWins': True, 'explicitEventWins': True, 'resetRestoresPageDefault': True,
        'sourceLabelsAndCitations': True, 'offlineAnswer': True,
        'spoilerHistoryFiltered': True, 'savedProgressUnchanged': True,
        'externalAttempts': external, 'pageErrors': errors,
    }, indent=2) + '\n')
    browser.close()
    print('ok: killer/victim meaning, latest context, explicit events, reset, citations, offline use and spoilers')
