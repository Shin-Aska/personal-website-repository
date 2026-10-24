"""Replay the authored Ultima VII trivia corpus through the real chat controls.

Uses existing Playwright/Chrome. No installs or external requests. Serve the
checkout at 127.0.0.1:8766, or set ASSISTANT_BASE_URL before running.
"""
from browser_consent_fixture import CONSENT_FIXTURE
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
OUT = HERE / 'evidence'
BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
FIXTURE = json.loads((HERE / 'trivia-ultima7-cases.json').read_text())
OUT.mkdir(exist_ok=True)
replies, failures, errors, external, requests = [], [], [], [], []

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/google-chrome',
        headless=True, args=['--no-sandbox'])
    context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 1000})
    context.add_init_script(script=CONSENT_FIXTURE)

    def route(request):
        url = request.request.url
        if url.startswith(('data:', 'blob:')) or urlparse(url).hostname in {
                urlparse(BASE).hostname, '127.0.0.1', 'localhost'}:
            request.continue_()
        else:
            external.append(url.split('?')[0])
            request.abort()

    context.route('**/*', route)
    context.on('request', lambda request: requests.append({
        'method': request.method, 'hasBody': request.post_data_buffer is not None,
        'url': request.url.split('?')[0],
    }))
    page = context.new_page()
    page.route('**/offline.js*', lambda r: r.fulfill(status=200,
        content_type='text/javascript', body='// Legacy UI tests isolate worker bootstrap.'))
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(f'{BASE}/guides/Ultima7.html', wait_until='networkidle')
    page.locator('button[data-target="quests"]').click()
    page.locator('.quest-item').first.click()
    page.locator('.get-main-quest-hint').first.click()
    page.locator('.sage-input').wait_for()

    def saved_progress():
        return page.evaluate('''() => JSON.stringify(Object.fromEntries(
            Object.entries(localStorage).filter(([key]) => key.startsWith('ultima7-')).sort()))''')

    saved = saved_progress()

    def reset(spoiler):
        page.get_by_role('button', name='New topic', exact=True).click()
        page.locator('.sage-spoiler').first.select_option(spoiler)

    def ask(case_id, text, expected, spoiler, offline=False):
        before = page.locator('.sage-messages').inner_text()
        page.locator('.sage-input').fill(text)
        page.locator('.sage-send').click()
        page.wait_for_function('''([before, text]) => {
            const root = document.querySelector('.sage-messages');
            const messages = [...root.querySelectorAll('.guide-assistant-message')];
            const last = messages.at(-1);
            return root.innerText !== before && last?.classList.contains('ai')
                && last.dataset.decision && last.dataset.decision !== 'pending'
                && messages.at(-2)?.textContent.includes(text);
        }''', arg=[before, text])
        block = page.locator('.sage-messages .guide-assistant-message.ai').last
        decision = block.get_attribute('data-decision')
        body = block.locator('.ga-msg-text').inner_text()
        rendered = block.inner_text()
        problems = []
        if expected['decision'] == 'no-answer':
            if decision == 'answer':
                problems.append('unsupported or hidden trivia was answered')
        else:
            if decision != 'answer':
                problems.append(f'expected answer, got {decision}')
            for value in expected.get('contains', []):
                if value.lower() not in body.lower():
                    problems.append(f'missing {value}')
            for value in expected.get('absent', []):
                if value.lower() in body.lower():
                    problems.append(f'forbidden {value}')
            if expected.get('source') == 'research' and not (
                    'Not in this guide — from outside research:' in body
                    and 'Outside research (not in this guide):' in rendered
                    and 'https://' in rendered):
                problems.append('research attribution/citation missing')
            if expected.get('source') == 'guide' and not (
                    'Source: existing guide' in rendered and 'outside research:' not in body):
                problems.append('guide attribution incorrect')
            if not block.locator('.ga-msg-source').count():
                problems.append('factual answer has no visible source')
        item = {'id': case_id, 'question': text, 'spoiler': spoiler, 'decision': decision,
            'reply': rendered, 'passed': not problems, 'offline': offline}
        replies.append(item)
        if problems:
            failures.append({'id': case_id, 'problems': problems, 'reply': rendered})

    for item in FIXTURE['questions']:
        reset(item['spoiler'])
        ask(item['id'], item['text'], item['expected'], item['spoiler'])

    for dialogue in FIXTURE['dialogues']:
        reset(dialogue['spoiler'])
        for index, turn in enumerate(dialogue['turns']):
            ask(f'{dialogue["id"]}:{index + 1}', turn['text'], turn['expected'], dialogue['spoiler'])

    reset('gentle')
    context.set_offline(True)
    expected = {'decision': 'answer', 'contains': ['rules Britannia', 'king'], 'source': 'research'}
    ask('offline:lord-british', 'Who is Lord British?', expected, 'gentle', offline=True)
    ask('offline:pronoun', 'Who is he?', expected, 'gentle', offline=True)
    context.set_offline(False)
    page.screenshot(path=str(OUT / 'trivia-ultima7.png'))

    storage_unchanged = saved_progress() == saved
    report = {'browser': browser.version, 'questionCount': len(FIXTURE['questions']),
        'dialogueCount': len(FIXTURE['dialogues']),
        'dialogueTurns': sum(len(dialogue['turns']) for dialogue in FIXTURE['dialogues']),
        'replyCount': len(replies), 'passed': sum(item['passed'] for item in replies),
        'replies': replies, 'failures': failures, 'storageUnchanged': storage_unchanged,
        'externalRequests': external, 'pageErrors': errors,
        'onlyStaticGets': all(request['method'] == 'GET' and not request['hasBody'] for request in requests)}
    (OUT / 'trivia-ultima7-browser.json').write_text(json.dumps(report, indent=2) + '\n')
    browser.close()
    assert not failures, json.dumps(failures, indent=2)
    assert storage_unchanged and not external and not errors and report['onlyStaticGets'], report
    print(json.dumps({key: report[key] for key in ['questionCount', 'dialogueCount',
        'dialogueTurns', 'replyCount', 'passed', 'storageUnchanged', 'externalRequests', 'pageErrors']}, indent=2))
