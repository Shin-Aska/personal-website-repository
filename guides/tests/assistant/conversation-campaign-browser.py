"""Replay sustained conversations in actual guide controls; no installs.

Uses the approved consent/worker fixture, so this verifies source routing and UI,
not native model inference. Serve the checkout on loopback port 8766 first.
"""
from browser_consent_fixture import CONSENT_FIXTURE
from browser_conversation_observer import ASSISTANT_OBSERVER
import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
OUT = HERE / 'evidence'
BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
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
parser = argparse.ArgumentParser()
parser.add_argument('--game', choices=list(SURFACES))
parser.add_argument('--require-complete', action='store_true')
args = parser.parse_args()
fixtures = {f['gameId']: f for path in sorted((HERE / 'conversations').glob('*.json'))
            for f in [json.loads(path.read_text())] if not args.game or f['gameId'] == args.game}
node = '/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
records_by_game = json.loads(subprocess.check_output([node, '--input-type=module', '-e',
    "import {allRecords} from './guides/tests/assistant/load-records.mjs'; process.stdout.write(JSON.stringify(allRecords));"],
    cwd=HERE.parents[2], text=True))
replies, failures, errors, external, requests, progress = [], [], [], [], [], {}
watched = sorted((HERE.parents[2] / 'guides/js/assistant').rglob('*.js'))
watched += [HERE.parents[2] / 'guides' / surface[0] for surface in SURFACES.values()]
watched += [HERE.parents[2] / 'guides/data/assistant' / f'{game}.json' for game in fixtures]
watched += [HERE / 'conversations' / f'{game}.json' for game in fixtures]
watched += [Path(__file__), HERE / 'conversation-checks.mjs', HERE / 'browser_conversation_observer.py']
source_hashes = lambda: {str(path.relative_to(HERE.parents[2])): hashlib.sha256(path.read_bytes()).hexdigest() for path in watched}
before_hashes = source_hashes()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
    context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 1000})
    context.add_init_script(script=CONSENT_FIXTURE)
    context.add_init_script(script=ASSISTANT_OBSERVER)

    def route(r):
        url = r.request.url
        if url.startswith(('data:', 'blob:')) or urlparse(url).hostname in {urlparse(BASE).hostname, '127.0.0.1', 'localhost'}:
            r.continue_()
        else:
            external.append(url.split('?')[0])
            r.abort()

    context.route('**/*', route)
    context.on('request', lambda r: requests.append({'method': r.method,
        'hasBody': r.post_data_buffer is not None, 'url': r.url.split('?')[0]}))

    for game, fixture in fixtures.items():
        file, open_js, input_sel, send_sel, body_sel, spoiler_sel = SURFACES[game]
        page = context.new_page()
        page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Isolated legacy UI test.'))
        page.on('pageerror', lambda e: errors.append({'game': game, 'error': str(e)}))
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
        page.locator(input_sel).wait_for(state='visible')
        page.wait_for_function('window.campaignObservedAssistants.length > 0')
        records = records_by_game.get(game)
        if game == 'starcraft':
            records = page.evaluate('''async () => {
                const {buildStarcraftRecords}=await import('/guides/js/assistant/adapters/starcraft.js');
                const overlay=await (await fetch('/guides/data/assistant/starcraft.json')).json();
                return buildStarcraftRecords(document,overlay);
            }''')
        page.evaluate('(records) => { window.campaignSourceRecords=records; }', records)
        storage_script = 'JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))'
        before_storage = page.evaluate(storage_script)

        def reset(spoiler):
            page.get_by_role('button', name='New topic', exact=True).filter(visible=True).first.click()
            page.locator(spoiler_sel).first.select_option(spoiler)

        def ask(dialogue, index, turn, spoiler, offline=False):
            if turn.get('options', {}).get('spoiler'):
                spoiler = turn['options']['spoiler']
                page.locator(spoiler_sel).first.select_option(spoiler)
            before = page.locator(body_sel).inner_text()
            page.locator(input_sel).fill(turn['text'])
            page.locator(send_sel).click()
            page.wait_for_function('''([sel, before, text]) => {
                const root = document.querySelector(sel);
                const nodes = [...root.querySelectorAll('.guide-assistant-message')];
                const last = nodes.at(-1);
                return root.innerText !== before && last?.classList.contains('ai')
                    && last.dataset.decision && last.dataset.decision !== 'pending'
                    && nodes.at(-2)?.textContent.includes(text);
            }''', arg=[body_sel, before, turn['text']])
            block = page.locator(f'{body_sel} .guide-assistant-message.ai').last
            text = block.locator('.ga-msg-text').inner_text()
            rendered = block.inner_text()
            decision = block.get_attribute('data-decision')
            e = turn['expected']
            observed = page.evaluate('''async ({game,expected,spoiler,historyAbsent}) => {
                const a=window.campaignObservedAssistants.find(a=>a.inspect().gameId===game);
                const history=a.getHistory(), reply=history.at(-1);
                const {checkConversationReply}=await import('/guides/tests/assistant/conversation-checks.mjs');
                const {authorize}=await import('/guides/js/assistant/policy.js');
                return {reply,active:a.inspect().active,problems:checkConversationReply(reply,
                    {...expected,historyAbsent},{records:window.campaignSourceRecords,spoiler,authorize,history})};
            }''', {'game': game, 'expected': e, 'spoiler': spoiler, 'historyAbsent': turn.get('historyAbsent', [])})
            problems = observed['problems']
            if decision != observed['reply']['decision'] or text != observed['reply']['text']:
                problems.append('rendered reply differs from actual assistant history')
            if e['decision'] == 'no-answer':
                if decision not in ['clarify', 'decline', 'conflict']:
                    problems.append(f'expected no answer, got {decision}')
            elif decision != e['decision']:
                problems.append(f'expected {e["decision"]}, got {decision}')
            for phrase in e.get('contains', []):
                if phrase.lower() not in text.lower():
                    problems.append(f'missing {phrase}')
            for phrase in e.get('absent', []):
                if phrase.lower() in text.lower():
                    problems.append(f'forbidden {phrase}')
            for phrase in turn.get('historyAbsent', []):
                if phrase.lower() in page.locator(body_sel).inner_text().lower():
                    problems.append(f'hidden history leaked {phrase}')
            if e.get('conflict') and not (('sources disagree' in text.lower() or 'sources conflict' in text.lower())
                                          and 'conflicting' in rendered.lower()):
                problems.append('known source conflict has no warning/provenance')
            if e['decision'] == 'answer':
                if not block.locator('.ga-msg-source').count():
                    problems.append('missing visible source')
                if e['source'] == 'guide' and ('Source: existing guide' not in rendered or 'outside research:' in text):
                    problems.append('incorrect guide provenance')
                if e['source'] == 'research' and not ('outside research:' in text and 'Outside research (not in this guide):' in rendered and 'https://' in rendered):
                    problems.append('missing research attribution/citation')
            item = {'id': f'{dialogue}:{index + 1}', 'gameId': game, 'question': turn['text'],
                'spoiler': spoiler, 'decision': decision, 'text': rendered, 'passed': not problems,
                'recordIds': observed['reply']['recordIds'], 'sources': observed['reply']['sources'],
                'activeContext': observed['active'], 'problems': problems, 'offline': offline}
            replies.append(item)
            if problems:
                failures.append(item)
            return spoiler

        for dialogue in fixture['dialogues']:
            reset(dialogue['spoiler'])
            spoiler = dialogue['spoiler']
            for index, turn in enumerate(dialogue['turns']):
                spoiler = ask(dialogue['id'], index, turn, spoiler)
        # A loaded conversation must retain its facts and referent offline.
        sample = fixture['dialogues'][0]
        reset(sample['spoiler'])
        context.set_offline(True)
        spoiler = sample['spoiler']
        for index, turn in enumerate(sample['turns'][:2]):
            spoiler = ask(f'{game}-offline', index, turn, spoiler, offline=True)
        context.set_offline(False)
        progress[game] = before_storage == page.evaluate(storage_script)
        page.screenshot(path=str(OUT / f'conversation-campaign-{game}.png'))
        print(f'{game}: {len(fixture["dialogues"])} conversations replayed', flush=True)
        page.close()

    report = {'browser': browser.version, 'worker': 'approved consent/worker fixture; no native model inference',
        'games': list(fixtures), 'remainingGames': [g for g in SURFACES if g not in fixtures],
        'dialogues': sum(len(f['dialogues']) for f in fixtures.values()),
        'replyCount': len(replies), 'passed': sum(r['passed'] for r in replies), 'replies': replies,
        'failures': failures, 'progressUnchanged': progress, 'externalRequests': external, 'pageErrors': errors,
        'sourceHashesBefore': before_hashes, 'sourceHashesAfter': source_hashes(),
        'onlyStaticGets': all(r['method'] == 'GET' and not r['hasBody'] for r in requests)}
    report['sourceFilesUnchangedDuringRun'] = report['sourceHashesBefore'] == report['sourceHashesAfter']
    suffix = '-' + args.game if args.game else ''
    (OUT / f'conversation-campaign-browser{suffix}.json').write_text(json.dumps(report, indent=2) + '\n')
    browser.close()
    print(json.dumps({k: report[k] for k in ['games', 'remainingGames', 'dialogues', 'replyCount', 'passed', 'progressUnchanged']}, indent=2))
    assert not failures, json.dumps(failures, indent=2)
    assert all(progress.values()) and not external and not errors and report['onlyStaticGets'] and report['sourceFilesUnchangedDuringRun'], report
    if args.require_complete:
        assert not report['remainingGames'], report['remainingGames']
        assert all(len(f['dialogues']) >= 20 and all(len(d['turns']) >= 8 for d in f['dialogues'])
                   for f in fixtures.values()), 'campaign conversation/depth minimum is incomplete'
