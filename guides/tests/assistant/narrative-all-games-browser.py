"""Exercise sourced question meanings in all six actual chat surfaces. No installs."""
from browser_consent_fixture import CONSENT_FIXTURE
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
CASES = json.loads((ROOT / 'narrative-all-games-cases.json').read_text())
OUT = ROOT / 'evidence'
OUT.mkdir(exist_ok=True)
SURFACES = {
    'albion': ('Albion.html', "activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro')",
               '#walkthrough-ai-input', '#walkthrough-ai-send', '#walkthrough-ai-body', '.guide-assistant-controls select'),
    'ultima5': ('Ultima5.html', "showUltima5Section('counsel')", '#seer-query', '#ask-seer', '#seer-response', '.guide-assistant-controls select'),
    'ultima6': ('Ultima6.html', "openSeerForQuest('act-i-liberating-the-shrines','sacrifice-minoc')",
                '#seer-query', '#ask-seer', '#seer-chat-messages', '#seer-spoiler-select'),
    'ultima7': ('Ultima7.html', None, '.sage-input', '.sage-send', '.sage-messages', '.sage-spoiler'),
    'alqadim': ('AlQadim.html', None, '#walkthrough-ai-input-tab', '#walkthrough-ai-send-tab', '#walkthrough-ai-body-tab', '#main-ai-wrapper select'),
    'starcraft': ('StarcraftBWAPI.html', None, '#sc-ai-input', '#sc-ai-send', '#sc-ai-chat', '#sc-assistant-spoiler'),
}

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
    context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
    context.add_init_script(script=CONSENT_FIXTURE)
    external, errors, replies = [], [], []

    def route(r):
        u = r.request.url
        if u.startswith(('data:', 'blob:')) or urlparse(u).hostname in {'localhost', '127.0.0.1', urlparse(BASE).hostname}:
            assert r.request.method == 'GET' and r.request.post_data is None, u
            r.continue_()
        else:
            external.append(u.split('?')[0])
            r.abort()

    context.route('**/*', route)
    for game, (file, open_js, input_sel, send_sel, body, spoiler) in SURFACES.items():
        page = context.new_page()
        page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'{BASE}/guides/{file}', wait_until='networkidle')
        if game == 'ultima7':
            page.locator('button[data-target="quests"]').click()
            page.locator('.quest-item').first.click()
            page.locator('.get-main-quest-hint').first.click()
        elif game == 'alqadim':
            page.wait_for_function('Object.keys(genieViews).length===2')
            page.locator('button[data-target="genie"]').click()
        elif game == 'starcraft':
            page.click('#main-nav [href="#ai-assistant"]')
        if open_js:
            page.evaluate(open_js)
        page.wait_for_selector(input_sel, state='attached')
        storage = page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')

        def ask(question):
            marker = f'{body} .guide-assistant-message'
            before = page.locator(body).inner_text()
            page.locator(input_sel).fill(question)
            if game == 'albion':
                page.evaluate('walkthroughAiSend()')
            elif game == 'starcraft':
                page.evaluate('scAiSend()')
            else:
                page.locator(send_sel).click()
            page.wait_for_function('''([sel, body, before, q]) => {
                const nodes = [...document.querySelectorAll(sel)];
                return document.querySelector(body).innerText !== before && nodes.at(-1)?.classList.contains('ai')
                    && nodes.at(-2)?.textContent.includes(q);
            }''', arg=[marker, body, before, question])
            text = page.locator(marker + '.ai').last.inner_text()
            replies.append({'game': game, 'question': question, 'text': text})
            return text

        group = [c for c in CASES if c['gameId'] == game]
        for c in group:
            page.locator(spoiler).first.select_option(c['spoiler'])
            text = ask(c['question'])
            if c.get('unsupported'):
                assert 'Source: existing guide' not in text and 'Outside research (not in this guide):' not in text, (c, text)
            else:
                assert all(phrase.lower() in text.lower() for phrase in c['contains']), (c, text)
                assert 'Source:' in text or 'Outside research (not in this guide):' in text, (c, text)
        page.screenshot(path=str(OUT / f'narrative-all-games-{game}.png'))

        # Facts already loaded must work offline, and lowering the ceiling
        # must behave just like removing that facet from the index.
        c = next(c for c in group if not c.get('unsupported') and (game != 'ultima6' or 'Summarize' in c['question']))
        context.set_offline(True)
        page.locator(spoiler).first.select_option(c['spoiler'])
        offline = ask(c['question'])
        assert all(phrase.lower() in offline.lower() for phrase in c['contains']), (game, offline)
        page.locator(spoiler).first.select_option('gentle')
        hidden = ask(c['question'])
        absent = ask('Summarize Zorvax Phantom') if 'Summarize' in c['question'] else ask('Why was Zorvax Phantom killed?')
        assert 'sourced answer' in hidden and 'sourced answer' in absent, (game, hidden, absent)
        assert storage == page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))'), game
        context.set_offline(False)
        page.close()
    assert not external and not errors, {'external': external, 'errors': errors}
    (OUT / 'narrative-all-games-browser.json').write_text(json.dumps({
        'passed': True, 'browser': browser.version, 'games': list(SURFACES), 'replies': replies,
        'offline': True, 'spoilersChecked': True, 'progressUnchanged': True,
        'externalRequests': external, 'pageErrors': errors,
    }, indent=2) + '\n')
    print(f'ok: {len(SURFACES)} guides, {len(replies)} real UI answers, meaning, sources, spoilers, offline and progress')
    browser.close()
