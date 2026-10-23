"""Browser acceptance for English follow-ups and multi-part questions on all six guides.

Uses the existing Python Playwright package and /usr/bin/google-chrome; installs
nothing. Serve the repository first:
    python3 -m http.server 8766 --bind 127.0.0.1
Every request that is not to the loopback server is aborted and recorded.
"""
from browser_consent_fixture import CONSENT_FIXTURE
import json, os, re
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
HERE = Path(__file__).resolve().parent
OUT = HERE / 'evidence'; OUT.mkdir(exist_ok=True)
CASES = {'dialogues': [d for f in ['english-cases.json', 'knowledge-cases.json', 'owner-cases.json'] + sorted(p.name for p in HERE.glob('sim-*-cases.json'))
                       for d in json.loads((HERE / f).read_text())['dialogues']]}
LOCAL_HOSTS = {urlparse(BASE).hostname, '127.0.0.1', 'localhost'}
HIDDEN = 'Earlier message hidden at this help level.'

checks, external, errors, requests = [], [], [], []

def check(label, value, detail=None):
    checks.append({'check': label, 'passed': bool(value), **({'detail': detail} if detail and not value else {})})
    if not value:
        raise AssertionError(f'{label}: {detail}')

def route(r):
    url = r.request.url
    host = urlparse(url).hostname
    if url.startswith(('data:', 'blob:')) or host in LOCAL_HOSTS:
        r.continue_()
    else:
        external.append(url.split('?')[0]); r.abort()

def log_request(request):
    requests.append({'method': request.method, 'url': request.url.split('?')[0], 'hasQuery': '?' in request.url,
                     'hasBody': request.post_data_buffer is not None})

# Each surface: how to open it, ask, read the newest reply, change spoilers,
# and which saved-progress keys must stay byte-identical.
SURFACES = {
    'albion': {
        'page': 'Albion.html', 'storage': r'^albion\.',
        'open': "activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro')",
        'input': '#walkthrough-ai-input', 'send': 'async () => { await walkthroughAiSend(); }',
        'body': '#walkthrough-ai-body', 'spoiler': '.guide-assistant-controls select',
        'ready': '.guide-assistant-controls'
    },
    'ultima6': {
        'page': 'Ultima6.html', 'storage': r'^ultima6-',
        'open': "openSeerForQuest('act-i-liberating-the-shrines', 'sacrifice-minoc')",
        'input': '#seer-query', 'click': '#ask-seer', 'body': '#seer-chat-messages', 'spoiler': '#seer-spoiler-select',
        'ready': '#seer-query'
    },
    'ultima5': {
        'page': 'Ultima5.html', 'storage': r'^ultima5-',
        'open': "showUltima5Section('counsel')",
        'input': '#seer-query', 'click': '#ask-seer', 'body': '#seer-response', 'spoiler': '.guide-assistant-controls select',
        'ready': '#seer-response .guide-assistant-message, #seer-response p'
    },
    'ultima7': {
        'page': 'Ultima7.html', 'storage': r'^ultima7-',
        'open': None, 'input': '.sage-input', 'click': '.sage-send', 'body': '.sage-messages', 'spoiler': '.sage-spoiler',
        'ready': '.sage-input'
    },
    'alqadim': {
        'page': 'AlQadim.html', 'storage': r'^alqadim\.',
        'open': None, 'input': '#walkthrough-ai-input-tab', 'click': '#walkthrough-ai-send-tab',
        'body': '#walkthrough-ai-body-tab', 'spoiler': '#main-ai-wrapper select', 'ready': '#walkthrough-ai-input-tab'
    },
    'starcraft': {
        'page': 'StarcraftBWAPI.html', 'storage': r'.',
        'open': None, 'input': '#sc-ai-input', 'send': 'async () => { await scAiSend(); }',
        'body': '#sc-ai-chat', 'spoiler': '#sc-assistant-spoiler', 'ready': '.guide-assistant-controls'
    }
}

# A short real-UI dialogue per guide: a paraphrase, a multi-part question, an
# elliptical follow-up, then a disconnected follow-up after lowering spoilers.
DIALOGUES = {
    'albion': [
        ('direct', 'Any idea where I can find the pistol?', ['COM room'], []),
        ('direct', 'Where can I buy the Dreamshield and what does it do?', ['Rifrako', 'Sleep Spores'], []),
        ('direct', 'Sorry, I meant the Monster Eye—who do I buy that from?', ['Monster Eye', 'Rifrako'], ['Understood. I will use']),
        ('direct', 'Where is the pistol on Mars?', ['does not support'], ['COM room.']),
    ],
    'ultima6': [
        ('direct', 'What does the Storm Cloak do?', ['Disables Magic'], []),
        ('direct', 'Where can I get it, and who is Jaana?', ['Pirate Cave', 'Druid'], []),
        ('direct', 'What about the Swamp Boots?', ['Utomo'], []),
        ('direct', 'What does the Storm Cloak do underwater?', ['does not support'], []),
    ],
    'ultima5': [
        ('direct', 'Could you tell me how to get my hands on the grapple?', ['Lord Michael'], []),
        ('direct', 'Where is it?', ['Empath Abbey'], []),
        ('direct', 'What does the crown do and where is it?', ['enemy magic', 'rooftop'], []),
        ('direct', 'Where is the Crown on the moon?', ['does not support'], []),
    ],
    'ultima7': [
        ('direct', 'Where might I find Shamino?', ['Blue Boar'], []),
        ('direct', "What's Magebane good for, and where is it?", ['Drains Mana', 'Stonegate'], []),
        ('direct', 'How do I beat dragons?', ['Glass Sword'], []),
        ('direct', 'What about liches?', ['Magebane'], []),
    ],
    'alqadim': [
        ('direct', 'I need to get my hands on the Ship Orb', ['helm cabin'], []),
        ('direct', 'Sorry, I meant the Key of Bone—how do I get it?', ['Baker'], ['Understood. I will use']),
        ('direct', 'Where is it and what does it do?', ['Baker (Market)', 'secret passage'], []),
        ('direct', 'Where is the Gilded Dove and what does it do?', ['conflict'], []),
    ],
    'starcraft': [
        ('balanced', 'Any idea how I’d go about setting up BWAILauncher?', ['BWAILauncher'], []),
        ('balanced', 'Where can I download SCHNAIL and what do I need for it?', ['SCHNAIL', 'Java'], []),
        ('balanced', 'What about the Remastered map?', ['Remastered'], []),
        # Ellipsis keeps the earlier restriction: "on a Mac" applies to the follow-up too.
        ('balanced', 'How do I install BWAILauncher on a Mac?', ['does not support'], []),
        ('balanced', 'What about the Remastered map?', ['does not support'], ['Custom Game']),
    ],
}
OFFLINE = {
    'albion': ('gentle', 'Where is the pistol?', ['service area']),
    'ultima6': ('gentle', 'What do Swamp Boots do?', ['Negates Poison']),
    'ultima5': ('direct', 'Where is the Sceptre and what does it do?', ['Stonegate', 'dispel']),
    'ultima7': ('gentle', 'Where might I find Iolo?', ['Trinsic']),
    'alqadim': ('direct', 'What about the Ship Orb?', ["Deadman's Reef", 'corsair ship']),
    'starcraft': ('gentle', 'How do I set it up?', ['Custom Game']),
}

# Outside research must render with its label and a plain-text citation.
RESEARCH = {
    'ultima5': ('gentle', 'How do I level up?', 'wiki.ultimacodex.com'),
    'ultima6': ('gentle', 'How do I level up?', 'wiki.ultimacodex.com'),
    'ultima7': ('gentle', 'How do I level up?', 'wiki.ultimacodex.com'),
    'albion': ('gentle', 'How do I cure poison?', 'albion.wiki.gg'),
    'alqadim': ('gentle', 'How do I save progress?', 'mocagh.org'),
    'starcraft': ('gentle', 'What is BWAPI?', 'github.com/bwapi/bwapi'),
}

# Data the page bridges pass in (atlas NPCs, markers, interiors, stats).
COVERAGE = {
    'albion': ('balanced', 'Where is Rabir?', 'Jirinaar'),
    'ultima5': ('gentle', 'Where can I find a healer?', 'Minoc'),
    'ultima6': ('balanced', "What are Iolo's stats?", 'Dexterity 26'),
    'ultima7': ('balanced', 'Who is Batlin?', 'Leader of the Fellowship'),
    'alqadim': ('direct', 'Where is Zubakon?', "Bandar al-Sa'adat"),
}

def storage(page, pattern):
    return page.evaluate('(p) => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k]) => new RegExp(p).test(k)).sort()))', pattern)

def last_reply(page, s):
    return page.locator(f"{s['body']} .guide-assistant-message.ai").last.inner_text()

def ask(page, s, text):
    # History is capped at 12 messages, so wait for the newest user message to
    # be this question and followed by a reply, not for a growing count.
    marker = f"{s['body']} .guide-assistant-message"
    before = page.evaluate('(sel) => [...document.querySelectorAll(sel)].map(n => n.textContent).join(String.fromCharCode(0))', marker)
    page.locator(s['input']).fill(text)
    if 'send' in s: page.evaluate(s['send'])
    else: page.locator(s['click']).click()
    page.wait_for_function('''([sel, before, text]) => {
        const all = [...document.querySelectorAll(sel)];
        const last = all.at(-1), user = all.at(-2);
        return all.map(n => n.textContent).join(String.fromCharCode(0)) !== before && last?.classList.contains('ai')
            && user?.textContent.includes(text);
    }''', arg=[marker, before, text])
    return last_reply(page, s)

def open_surface(page, game, s):
    page.goto(f"{BASE}/guides/{s['page']}", wait_until='networkidle')
    if game == 'ultima7':
        page.locator('button[data-target="quests"]').click(); page.locator('.quest-item').first.click()
        page.locator('.get-main-quest-hint').first.click()
    elif game == 'alqadim':
        page.wait_for_function('Object.keys(genieViews).length===2')
        page.locator('button[data-target="genie"]').click()
    elif game == 'starcraft':
        page.click('#main-nav [href="#ai-assistant"]')
    if s['open']: page.evaluate(s['open'])
    page.wait_for_selector(s['ready'], state='attached')

def run_starcraft_cases(page):
    """StarCraft's adapter reads facts from this page's DOM; run its English dialogues against it."""
    outcomes = []
    for dialogue in [d for d in CASES['dialogues'] if d['gameId'] == 'starcraft']:
        replies = page.evaluate('''(turns) => turns.map((t, i) => {
            const r = scLocalController.assistant.answer(t.text, { ...t.options, contextId: 'english-test' });
            return { decision: r.decision, recordIds: r.recordIds, parts: (r.parts || []).map(p => p.decision),
                     stateChanges: r.stateChanges.length, text: r.text };
        })''', dialogue['turns'])
        for t, r in zip(dialogue['turns'], replies):
            e = t['expected']
            ok = r['decision'] in ([e['decision']] if isinstance(e['decision'], str) else e['decision'])
            ok = ok and all(i in r['recordIds'] for i in e.get('recordIds', []))
            ok = ok and ('parts' not in e or r['parts'] == e['parts'])
            ok = ok and ('stateChangeCount' not in e or r['stateChanges'] == e['stateChangeCount'])
            ok = ok and all(c.lower() in r['text'].lower() for c in e.get('contains', []))
            ok = ok and not any(c.lower() in r['text'].lower() for c in e.get('absent', []))
            outcomes.append({'dialogue': dialogue['id'], 'text': t['text'], 'passed': ok, 'decision': r['decision']})
            check(f"starcraft DOM adapter: {t['text']}", ok, r)
    page.evaluate("scLocalController.assistant.resetTopic('english-test')")
    return outcomes

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
    context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
    context.add_init_script(script=CONSENT_FIXTURE)
    context.route('**/*', route)  # installed before any guide opens
    context.on('request', log_request)
    transcripts, starcraft_cases = {}, []
    for game, s in SURFACES.items():
        page = context.new_page()
        page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
        page.on('pageerror', lambda e, g=game: errors.append({'game': g, 'error': str(e)}))
        open_surface(page, game, s)
        saved = storage(page, s['storage'])
        transcript = []
        for spoiler, text, present, absent in DIALOGUES[game]:
            page.locator(s['spoiler']).first.select_option(spoiler)
            reply = ask(page, s, text)
            transcript.append({'spoiler': spoiler, 'question': text, 'reply': reply})
            for value in present: check(f'{game}: "{text}" shows {value}', value.lower() in reply.lower(), reply)
            for value in absent: check(f'{game}: "{text}" omits {value}', value.lower() not in reply.lower(), reply)
        multi = transcript[1]['reply']
        check(f'{game}: user text rendered as text', page.locator(f"{s['body']} img").count() == 0)
        # Lowering the ceiling hides earlier higher-detail composite answers.
        lowered = 'gentle' if DIALOGUES[game][1][0] != 'gentle' else None
        if lowered:
            page.locator(s['spoiler']).first.select_option(lowered)
            body = page.locator(s['body']).inner_text()
            snippet = multi.split('\n')[-1].strip()
            check(f'{game}: lowering spoilers hides composite answer', snippet not in body and HIDDEN in body, snippet)
        # Already-loaded assistants keep answering with networking disconnected.
        spoiler, text, present = OFFLINE[game]
        page.locator(s['spoiler']).first.select_option(spoiler)
        context.set_offline(True)
        reply = ask(page, s, text)
        context.set_offline(False)
        transcript.append({'spoiler': spoiler, 'question': text, 'reply': reply, 'offline': True})
        for value in present: check(f'{game}: offline "{text}" shows {value}', value.lower() in reply.lower(), reply)
        ask(page, s, '<img src=x onerror="window.__pwned=1"> where is it?')
        check(f'{game}: injected markup inert', page.locator(f"{s['body']} img").count() == 0 and not page.evaluate('Boolean(window.__pwned)'))
        if game in COVERAGE:
            spoiler, text, expected = COVERAGE[game]
            page.locator(s['spoiler']).first.select_option(spoiler)
            reply = ask(page, s, text)
            check(f'{game}: page passes guide data for "{text}"', expected in reply, reply)
        if game in RESEARCH:
            spoiler, text, cite = RESEARCH[game]
            page.locator(s['spoiler']).first.select_option(spoiler)
            reply = ask(page, s, text)
            check(f'{game}: research labeled', 'Not in this guide' in reply and 'Outside research (not in this guide)' in reply and cite in reply, reply)
            check(f'{game}: research has no guide tone wrapper', not re.search(r'guide (?:records|entry|offers|leaves)|From the guide', reply, re.I), reply)
            check(f'{game}: citation is text, not a link', page.locator(f"{s['body']} .guide-assistant-message.ai a").count() == 0)
        check(f'{game}: saved progress unchanged', storage(page, s['storage']) == saved)
        if game == 'starcraft':
            # A separate API context; switching contexts clears the UI topic,
            # so this runs after the UI dialogue.
            starcraft_cases = run_starcraft_cases(page)
        if game in ('albion', 'alqadim'):
            page.screenshot(path=str(OUT / f'english-{game}.png'), full_page=False)
        transcripts[game] = transcript
        page.close()
    check('no external requests', not external, external)
    check('no page errors', not errors, errors)
    check('only static GETs without questions in URLs or bodies',
          all(r['method'] == 'GET' and not r['hasBody'] and not re.search(r'[?&](?:q|query|prompt|question)=', r['url']) for r in requests))
    out = {'browser': browser.version, 'checks': checks, 'passed': sum(c['passed'] for c in checks), 'total': len(checks),
           'starcraftDomCases': starcraft_cases, 'transcripts': transcripts, 'externalRequests': external,
           'pageErrors': errors, 'requests': len(requests)}
    (OUT / 'english-browser.json').write_text(json.dumps(out, indent=2) + '\n')
    print(json.dumps({k: out[k] for k in ('browser', 'passed', 'total', 'externalRequests', 'pageErrors', 'requests')}, indent=2))
    browser.close()
