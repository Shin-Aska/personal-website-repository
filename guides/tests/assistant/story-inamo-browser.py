"""Exercise the owner's Inamo conversation through the real Ultima VII UI.

Uses the already installed Playwright and Chrome, with all external requests
blocked. Serve the repository on 127.0.0.1:8766 before running this file.
"""
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
    browser = playwright.chromium.launch(
        executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
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
    saved = page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')

    def ask(question):
        previous = page.locator('.sage-messages').inner_text()
        page.locator('.sage-input').fill(question)
        page.locator('.sage-send').click()
        page.wait_for_function('''([previous, question]) => {
            const body = document.querySelector('.sage-messages');
            const messages = [...body.querySelectorAll('.guide-assistant-message')];
            return body.innerText !== previous && messages.at(-1)?.classList.contains('ai')
                && messages.at(-2)?.textContent.includes(question);
        }''', arg=[previous, question])
        reply = page.locator('.sage-messages .guide-assistant-message.ai').last.inner_text()
        replies.append({'question': question, 'reply': reply})
        return reply

    for question in ['who killed inamo?', 'who is inamo?', 'who murdered who?',
                     'who killed who?', 'who killed inamo?', 'who murdered inamo?']:
        reply = ask(question)
        if question == 'who is inamo?':
            assert 'Gargoyle immigrant' in reply and 'Source: existing guide' in reply, reply
        else:
            assert all(name in reply for name in ['Inamo', 'Christopher', 'Hook', 'Forskis']), reply
            assert 'Not in this guide — from outside research:' in reply, reply
            assert 'Outside research (not in this guide):' in reply, reply
            assert 'title=Inamo&oldid=154876' in reply, reply
            assert 'not a confirmed murderer' not in reply, reply

    unsupported = ask('Who killed Shamino?')
    assert 'sourced answer' in unsupported and 'relationship' in unsupported, unsupported
    assert 'higher help level' not in unsupported and 'naming the subject differently' not in unsupported
    guide_only = ask('Who killed Inamo according to the guide?')
    assert 'sourced answer' in guide_only and 'Forskis' not in guide_only, guide_only
    motive = ask('Why was Inamo killed?')
    assert 'different accounts' in motive and 'remedy' not in motive, motive
    assert 'likely' in motive and 'apparently' in motive, motive
    assert 'Not in this guide — from outside research:' in motive, motive
    page.screenshot(path=str(OUT / 'story-inamo-direct.png'))

    context.set_offline(True)
    assert 'Forskis' in ask('Who killed Inamo?')
    for spoiler in ['balanced', 'gentle']:
        page.locator('.sage-spoiler').first.select_option(spoiler)
        reply = ask('Who killed Inamo?')
        assert 'sourced answer' in reply and 'Forskis' not in reply, reply
        assert 'Forskis' not in page.locator('.sage-messages').inner_text()
        assert 'title=Inamo&oldid=154876' not in page.locator('.sage-messages').inner_text()

    assert saved == page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')
    assert not external, external
    assert not errors, errors
    (OUT / 'story-inamo-browser.json').write_text(json.dumps({
        'passed': True, 'replies': replies, 'offlineAnswer': True,
        'loweredSpoilersHideResearch': True, 'savedProgressUnchanged': True,
        'externalAttempts': external, 'pageErrors': errors,
    }, indent=2) + '\n')
    browser.close()
    print('ok: Inamo UI conversation, citations, fallback, offline answers, spoiler filtering and unchanged progress')
