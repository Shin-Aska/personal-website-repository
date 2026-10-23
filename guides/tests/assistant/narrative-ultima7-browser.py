"""Live UI checks for sourced narrative facets; existing Chrome/Playwright only."""
from browser_consent_fixture import CONSENT_FIXTURE
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
OUT = Path(__file__).resolve().parent / 'evidence'
OUT.mkdir(exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/google-chrome',
        headless=True, args=['--no-sandbox'])
    context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
    context.add_init_script(script=CONSENT_FIXTURE)
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
    page.locator('.quest-item').first.click()
    page.locator('.get-main-quest-hint').first.click()
    page.wait_for_selector('.sage-input')
    page.locator('.sage-spoiler').first.select_option('direct')
    storage = page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')

    def last_reply():
        return page.locator('.sage-messages .guide-assistant-message.ai').last.inner_text()

    def ask(question):
        before = page.locator('.sage-messages').inner_text()
        page.locator('.sage-input').fill(question)
        page.locator('.sage-send').click()
        page.wait_for_function('''([before, question]) => {
            const root = document.querySelector('.sage-messages');
            const messages = [...root.querySelectorAll('.guide-assistant-message')];
            return root.innerText !== before && messages.at(-1)?.classList.contains('ai')
                && messages.at(-2)?.textContent.includes(question);
        }''', arg=[before, question])
        reply = last_reply()
        replies.append({'question': question, 'reply': reply})
        return reply

    for question, expected, research in [
        ('Who is the Fellowship?', ['Batlin', 'Elizabeth', 'Abraham'], True),
        ('What happened to Christopher?', ['Hook', 'Forskis'], True),
        ('Why was Inamo killed?', ['different accounts', 'likely', 'apparently'], True),
        ('How was Inamo killed?', ['pitchfork'], True),
        ('What was the outcome of destroying the Black Gate?', ["Rudyom's Wand", 'save Britannia'], False),
        ('What happened after the Trinsic murders?', ['Crown Jewel', 'left port', 'Isle of the Avatar'], True),
        ('What is the next step after the Tetrahedron is down?', ["In the guide's steps", 'Hourglass'], False),
        ('How are Spark and Christopher related?', ['Spark', "Christopher's son"], False),
        ('Who hired Christopher?', ['Klog', 'hired'], True),
        ('What does the Fellowship want?', ['Guardian', 'seize power'], True),
        ('Summarize the Trinsic murders.', ['Investigate', 'suspect', 'Crown Jewel'], False),
    ]:
        reply = ask(question)
        assert all(text in reply for text in expected), (question, reply)
        assert ('Outside research (not in this guide):' in reply) == research, (question, reply)
        assert ('Source: existing guide' in reply) != research, (question, reply)

    reply = ask('What does Batlin want?')
    assert 'Choose' in reply and "it's a trap" not in reply, reply
    page.locator('.sage-messages .guide-assistant-message.ai').last.locator('button').first.click()
    page.wait_for_function('''() => [...document.querySelectorAll('.sage-messages .guide-assistant-message.ai')]
        .at(-1)?.textContent.includes("it's a trap")''')
    assert 'Dungeon Destard' in last_reply()
    assert 'sourced answer' in ask('Why did Klog murder Christopher?')
    assert 'sourced answer' in ask('Why was Inamo killed according to the guide?')
    page.screenshot(path=str(OUT / 'narrative-ultima7-direct.png'))

    context.set_offline(True)
    assert 'different accounts' in ask('Why was Inamo killed?')
    for spoiler in ['balanced', 'gentle']:
        page.locator('.sage-spoiler').first.select_option(spoiler)
        reply = ask('Why was Inamo killed?')
        assert 'sourced answer' in reply, reply
        history = page.locator('.sage-messages').inner_text()
        assert all(text not in history for text in ['pitchfork', 'unexpected bystander', 'seize power', 'oldid=154876']), history
    page.locator('.sage-spoiler').first.select_option('balanced')
    assert "Christopher's son" in ask('How are Spark and Christopher related?')
    assert storage == page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')
    assert not external, external
    assert not errors, errors
    (OUT / 'narrative-ultima7-browser.json').write_text(json.dumps({
        'passed': True, 'replies': replies, 'offlineAnswer': True, 'sourcesSeparated': True,
        'spoilerHistoryFiltered': True, 'storageUnchanged': True,
        'externalAttempts': external, 'pageErrors': errors,
    }, indent=2) + '\n')
    browser.close()
    print('ok: nine narrative facets, citations, choices, scope guards, offline use, spoilers and saved progress')
