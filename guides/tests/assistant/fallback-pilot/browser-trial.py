"""Run the isolated trial with existing Chrome/Playwright; no dependency downloads."""
import argparse
import hashlib
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import json
import os
from pathlib import Path
import subprocess
import threading
import time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]
NODE = '/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--split', choices=['calibration', 'evaluation', 'all'], default='all')
    parser.add_argument('--port', type=int, default=8767)
    parser.add_argument('--style', choices=['structured', 'plain', 'chat', 'strict', 'topic', 'guarded'], default='chat')
    args = parser.parse_args()
    evidence = ROOT / 'evidence'
    evidence.mkdir(exist_ok=True)
    tracked_sources = [*Path(REPO / 'guides/js/assistant').rglob('*.js'), *Path(REPO / 'guides/data/assistant').glob('*.json')]
    before = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in tracked_sources}
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(REPO)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{args.port}'
    requests, external, errors, results = [], [], [], []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
            context = browser.new_context(viewport={'width': 1120, 'height': 900}, service_workers='block')
            context.add_init_script("localStorage.setItem('fallback-pilot-storage-sentinel','unchanged');")
            def route(r):
                u = urlparse(r.request.url)
                if u.hostname == '127.0.0.1' and u.port == args.port:
                    assert r.request.method == 'GET' and r.request.post_data is None
                    requests.append({'url': u.path, 'method': r.request.method})
                    r.continue_()
                else:
                    external.append(r.request.url.split('?')[0])
                    r.abort()
            context.route('**/*', route)
            page = context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(base + '/guides/StarcraftBWAPI.html', wait_until='networkidle')
            records = page.evaluate("""async () => {
                const { buildStarcraftRecords } = await import('/guides/js/assistant/adapters/starcraft.js');
                const overlay = await fetch('/guides/data/assistant/starcraft.json').then(r => r.json());
                return buildStarcraftRecords(document, overlay);
            }""")
            (evidence / 'starcraft-records.json').write_text(json.dumps(records, indent=2) + '\n')
            subprocess.run([NODE, str(ROOT / 'prepare-cases.mjs')], cwd=REPO, check=True,
                           env={**os.environ, 'PILOT_PROMPT_STYLE': args.style})
            cases_bytes = (ROOT / 'cases.json').read_bytes()
            cases_hash = hashlib.sha256(cases_bytes).hexdigest()
            all_cases = json.loads(cases_bytes)
            selected = [c for c in all_cases if args.split == 'all' or c['split'] == args.split]
            # Capture existing site storage after page initialization. It is not
            # model context, and model code has no progress-writing API.
            storage = page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))')
            page.goto(base + '/guides/tests/assistant/fallback-pilot/index.html', wait_until='networkidle')
            page.wait_for_function('Boolean(window.fallbackPilot)')
            # Routing alone must work before model loading. It is not a model
            # success and must produce neither tokens nor an effective prompt.
            routed = next((c for c in selected if c['packet'].get('route') == 'unknown'), None)
            if routed:
                control = page.evaluate('id => fallbackPilot.run(id)', routed['id'])
                assert control['responseKind'] == 'unknown' and control['generatedTokens'] == 0
                assert control['effectivePrompt'] is None
                assert page.evaluate('fallbackPilot.trace.loadMs') is None
            loaded = page.evaluate('fallbackPilot.load()')
            print('Model preparation:', loaded, flush=True)
            prefix = f'{args.style}-{args.split}'
            page.screenshot(path=str(evidence / f'{prefix}-loaded.png'))
            with (evidence / f'{prefix}-answers.jsonl').open('w') as output:
                for c in selected:
                    if args.style == 'guarded':
                        page.evaluate('''() => {
                            window.replyObserver?.disconnect(); window.replyChanges = [];
                            window.replyObserver = new MutationObserver(() => replyChanges.push(document.querySelector('#reply').textContent));
                            replyObserver.observe(document.querySelector('#reply'), {childList: true, subtree: true, characterData: true});
                        }''')
                    started = time.monotonic()
                    response = page.evaluate('id => fallbackPilot.run(id)', c['id'])
                    if args.style == 'guarded':
                        assert page.locator('#reply').inner_text() == response['guarded']['text']
                        if response['responseKind'] == 'model':
                            # The displayed reply must be reconstructible from
                            # a closed approved frame plus exact packet quotes.
                            checked = page.evaluate('c => window.fallbackPilot.checkGuard(c)',
                                                    {'raw': response['text'], 'packet': c['packet']})
                            assert checked == response['guarded']
                        changes = page.evaluate('window.replyChanges')
                        assert all(t in ['Preparing a reply…', response['guarded']['text']] for t in changes), changes
                        assert not page.locator('#raw').is_visible(), 'Unverified generation must stay collapsed'
                    record = { 'id': c['id'], 'gameId': c['gameId'], 'question': c['question'],
                        'expectedBehavior': c['expectedBehavior'], 'diagnosticControl': c['diagnosticControl'],
                        'baseline': c['baseline'], 'packet': c['packet'], 'response': response,
                        'wallSeconds': time.monotonic() - started, 'reviewStatus': 'unreviewed' }
                    results.append(record)
                    output.write(json.dumps(record) + '\n'); output.flush()
                    print(json.dumps({'id': c['id'], 'text': response['text'],
                        'responseKind': response.get('responseKind', 'model'),
                        'guardOrigin': response.get('guarded', {}).get('origin'),
                        'firstTextMs': round(response['firstTextMs']) if response['firstTextMs'] is not None else None,
                        'completeMs': round(response['completeMs']) if response['completeMs'] is not None else None,
                        'hitTokenLimit': response['hitTokenLimit']}), flush=True)
            # Reuse loaded assets with all network unavailable. The same input
            # should produce the same deterministic text.
            context.set_offline(True)
            for kind in ['model', 'unknown', 'engine', 'fixed']:
                original = next((r for r in results if r['response'].get('responseKind', 'model') == kind), None)
                if original:
                    offline = page.evaluate('id => fallbackPilot.run(id)', original['id'])
                    assert offline['text'] == original['response']['text'], 'Offline response changed'
                    if args.style == 'guarded':
                        assert offline['guarded'] == original['response']['guarded'], 'Offline guarded reply changed'
            context.set_offline(False)
            assert storage == page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))'), 'Trial wrote saved storage'
            assert not errors, errors
            assert not external, external
            assert cases_hash == hashlib.sha256((ROOT / 'cases.json').read_bytes()).hexdigest(), 'Cases changed during inference'
            changed = [name for name, digest in before.items() if hashlib.sha256(Path(name).read_bytes()).hexdigest() != digest]
            assert not changed, changed
            report = {'browser': browser.version, 'split': args.split, 'style': args.style, 'casesSHA256': cases_hash,
                'load': loaded, 'requests': requests, 'externalRequests': external, 'pageErrors': errors,
                'offlineReplyMatches': True, 'storageUnchanged': True, 'productionSourcesUnchanged': True,
                'rawOutputNeedsHumanReview': True, 'results': results}
            (evidence / f'{prefix}-report.json').write_text(json.dumps(report, indent=2) + '\n')
            page.screenshot(path=str(evidence / f'{prefix}-response.png'))
            browser.close()
    finally:
        server.shutdown(); server.server_close()
        print('Stopped owned trial HTTP server.', flush=True)

if __name__ == '__main__':
    main()
