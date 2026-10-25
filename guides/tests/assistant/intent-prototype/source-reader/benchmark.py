"""Native local QA experiment. Input contexts are frozen before loading the model."""
import argparse
from functools import partial
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--tag', required=True)
    args = parser.parse_args()
    if not args.tag.replace('-', '').replace('_', '').isalnum():
        parser.error('Invalid tag')
    target = HERE / 'results' / args.tag
    target.mkdir(parents=True, exist_ok=False)
    cases = json.loads(args.input.read_text())
    if not isinstance(cases.get('cases'), list) or not cases['cases']:
        parser.error('Input must contain a nonempty cases list')
    # This is a ranking experiment, not a production-answer acceptance test.
    watched = set((ROOT / 'guides/js/assistant').rglob('*.js'))
    watched |= set((ROOT / 'guides/data/assistant').rglob('*.json'))
    watched |= set(HERE.glob('*.mjs')) | {HERE/'manifest.json', Path(__file__), args.input.resolve()}
    hashes = lambda: {str(p.relative_to(ROOT)): digest(p) for p in sorted(watched)}
    report = {'nativeQA': True, 'productionIntegration': False, 'tag': args.tag,
              'inputHash': digest(args.input), 'input': cases, 'sourceHashesBefore': hashes(),
              'requests': [], 'blockedRequests': [], 'pageErrors': [], 'results': []}
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *args): pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True,
                                        args=['--no-sandbox'])
            context = browser.new_context(service_workers='block')
            def route(r):
                req = r.request; u = urlparse(req.url)
                row = {'url':req.url, 'method':req.method, 'hasBody': req.post_data_buffer is not None}
                report['requests'].append(row)
                if req.method == 'GET' and req.post_data_buffer is None and (
                    req.url.startswith(('blob:', 'data:')) or
                    u.hostname == '127.0.0.1' and u.port == server.server_port):
                    r.continue_()
                else:
                    report['blockedRequests'].append(row); r.abort()
            context.route('**/*', route)
            page = context.new_page()
            page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/guides/tests/assistant/intent-prototype/source-reader/', wait_until='networkidle')
            page.wait_for_function('Boolean(window.sourceReaderLab)')
            report['prepare'] = page.evaluate("sourceReaderLab.request({type:'prepare'})")
            print(json.dumps({'prepare':report['prepare']}), flush=True)
            for index, case in enumerate(cases['cases']):
                data = {key:case[key] for key in ['question', 'contexts']}
                data.update(type='rank', calibration=cases.get('calibration', {'minNullMargin':0,'minWinnerMargin':0}))
                try:
                    result = page.evaluate('data => sourceReaderLab.request(data)', data)
                    report['results'].append({'id':case['id'], 'result':result})
                except Exception as e:
                    report['results'].append({'id':case['id'], 'error':str(e)})
                if index % 20 == 0 or index == len(cases['cases']) - 1:
                    print(f"Native QA completed {index+1}/{len(cases['cases'])}", flush=True)
            report['memory'] = page.evaluate('performance.memory ? {usedJSHeapSize:performance.memory.usedJSHeapSize,totalJSHeapSize:performance.memory.totalJSHeapSize,jsHeapSizeLimit:performance.memory.jsHeapSizeLimit} : null')
            report['browser'] = browser.version
            context.close(); browser.close()
    except Exception as e:
        report['fatalError'] = str(e)
    finally:
        server.shutdown(); server.server_close(); thread.join(timeout=5)
        report['serverClosed'] = not thread.is_alive()
        report['sourceHashesAfter'] = hashes()
        report['sourceStable'] = report['sourceHashesBefore'] == report['sourceHashesAfter']
        report['mechanicsPassed'] = (not report.get('fatalError') and not report['blockedRequests']
            and not report['pageErrors'] and report['sourceStable'] and report['serverClosed']
            and len(report['results']) == len(cases['cases'])
            and all('error' not in row for row in report['results']))
        (target/'report.json').write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({key:report.get(key) for key in ['mechanicsPassed','fatalError','sourceStable','blockedRequests','pageErrors','serverClosed']}),flush=True)
    return 0 if report['mechanicsPassed'] else 1

if __name__ == '__main__':
    raise SystemExit(main())
