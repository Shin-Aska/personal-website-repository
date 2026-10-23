"""Real Chromium acceptance; uses existing Playwright/Chrome and installs nothing.
Run: python3 -m unittest discover -s tools/tests -p test_offline_reading.py -v
"""
import collections
import functools
import hashlib
import http.server
import json
from pathlib import Path
import threading
import time
import unittest
from urllib.parse import parse_qs, urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]


class Site(http.server.SimpleHTTPRequestHandler):
    version = 1
    worker_version = 2
    asset_versions = {}
    failures = {}
    slow = set()
    corrupt = set()
    quota = False
    manifest_enabled = True
    requests = collections.deque(maxlen=10000)
    manifests = {}

    def log_message(self, *_args):
        pass

    @classmethod
    def worker(cls, site="default"):
        source = (ROOT / site / 'service-worker.js').read_text().replace(
            'CACHE_PREFIX + "v2"', f'CACHE_PREFIX + "v{cls.worker_version}"')
        source = source.replace("PREFETCH_AGE = 30000", "PREFETCH_AGE = " + str(getattr(cls, "prefetch_age", 30000)))
        if cls.quota:
            source = '''const openCache = caches.open.bind(caches);
                caches.open = async name => {const cache = await openCache(name);
                if (name.endsWith(':v3')) cache.put = async () => {
                    throw new DOMException('Storage full', 'QuotaExceededError');};
                return cache;};\n''' + source
        return source.encode()

    @classmethod
    def fixture(cls, name, version=None):
        if version is None:
            version = cls.asset_versions.get(name, cls.version)
        if name == 'script/prefetch-only.js':
            return f'window.prefetchOnlyVersion = {version};'.encode(), 'application/javascript'
        if name.endswith('.js'):
            return f'window.assetVersion = {version};'.encode(), 'application/javascript'
        if name.endswith('.css'):
            return f'body {{ --asset-version: {version}; }}'.encode(), 'text/css'
        if name.endswith('.json'):
            return json.dumps({'version': version}).encode(), 'application/json'
        if name.endswith('.php'):
            return b'dynamic', 'text/plain'
        body = f'''<!doctype html><html><head><meta charset="utf-8"><title>Visit {version}</title>
            <link rel="stylesheet" href="css/cache-test.css">
            <script nonce="test" src="offline.js?v=3" defer></script>
            <script nonce="test" src="script/cache-test.js" defer></script></head>
            <body><p id="version">{version}</p></body></html>'''
        if name in {'page-blog.html', 'page-links.html'}:
            links = '<a id="article-a" href="page-prefetch-a.html">Mobile Gaming 2026</a><a id="article-b" href="page-prefetch-b.html">Another article</a><a id="article-c" href="page-prefetch-c.html">Third article</a>'
            if name == 'page-blog.html': links = '<table id="blog-articles"><tr><td>' + links + '</td></tr></table>'
            body = body.replace('</body>', links + '</body>')
        if name.startswith('page-prefetch-'):
            body = body.replace('</head>', '<script nonce="test" src="script/prefetch-only.js"></script></head>')
            body = body.replace('</body>', '<img src="images/never-prefetch.jpg"><video src="files/never-prefetch.mp4"></video></body>')
        if name == 'page-theme.html':
            body = body.replace('</head>', '<link rel="stylesheet" href="css/site.css"></head>')
        return body.encode(), 'text/html'

    @classmethod
    def manifest(cls, site):
        files = dict(cls.manifests[site]['files'])
        for name in ['script/cache-test.js', 'css/cache-test.css', 'data/cache-test.json', 'script/prefetch-only.js']:
            body, _ = cls.fixture(name)
            files[name] = {'hash': hashlib.sha256(body).hexdigest(), 'size': len(body)}
        if getattr(cls, 'prefetch_too_large', False):
            files['script/prefetch-only.js']['size'] = 5 * 1024 * 1024
        for name, body in [('service-worker.js', cls.worker(site)),
                           ('offline.js', (ROOT / site / 'offline.js').read_bytes())]:
            files[name] = {'hash': hashlib.sha256(body).hexdigest(), 'size': len(body)}
        body = json.dumps({'schema': 1, 'files': files}, sort_keys=True, separators=(',', ':')).encode()
        return body, hashlib.sha256(body).hexdigest()

    def send_body(self, body, content_type, private=False, csp=False):
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Cache-Control', 'private, no-store' if private else 'public, max-age=31536000')
        self.send_header('Content-Length', str(len(body)))
        if csp:
            self.send_header('Content-Security-Policy',
                "script-src 'nonce-test' 'strict-dynamic'; child-src 'none'; worker-src 'self'")
        self.end_headers()
        try:
            if urlsplit(self.path).path in self.slow:
                self.wfile.write(body[:1]); self.wfile.flush(); time.sleep(3)
                self.wfile.write(body[1:])
            else:
                self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_POST(self):
        self.send_body(b'posted', 'text/plain')

    def do_GET(self):
        url = urlsplit(self.path)
        self.requests.append((url.path, parse_qs(url.query)))
        if url.path in self.failures:
            self.send_response(self.failures[url.path]); self.end_headers()
            self.wfile.write(b'server failure'); return
        relative = url.path.removeprefix('/default/').removeprefix('/guides/').lstrip('/')
        if relative in {'offline-version.json', 'offline-manifest.json'}:
            if not self.manifest_enabled:
                self.send_response(503); self.end_headers(); return
            body, version = self.manifest('guides' if url.path.startswith('/guides/') else 'default')
            self.send_body(json.dumps({'version': version}).encode() if relative == 'offline-version.json'
                           else body, 'application/json')
            return
        site = 'guides' if url.path.startswith('/guides/') else 'default'
        if relative == 'service-worker.js':
            self.send_body(self.worker(site), 'application/javascript'); return
        if relative == 'css/offline.css':
            self.send_body((ROOT / site / 'css/offline.css').read_bytes(), 'text/css'); return
        if relative == 'images/never-prefetch.jpg':
            import base64
            self.send_body(base64.b64decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), 'image/gif'); return
        if relative == 'offline.js':
            self.send_body((ROOT / site / 'offline.js').read_bytes(), 'application/javascript'); return
        if relative.startswith('page-') and relative.endswith('.html') or relative in {'cache-test.html', 'second.html', 'private.html', 'missing.html',
                        'script/cache-test.js', 'css/cache-test.css', 'data/cache-test.json', 'script/prefetch-only.js', 'php/test.php'}:
            # Original URLs simulate a stale CDN; versioned/check URLs reach the origin.
            fresh = '_swv' in parse_qs(url.query) or '_swcheck' in parse_qs(url.query)
            body, mime = self.fixture(relative, None if fresh and url.path not in self.corrupt else 1)
            self.send_body(body, mime, private=relative == 'private.html', csp=relative.endswith('.html'))
            return
        super().do_GET()


class OfflineReading(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Site.manifests = {name: json.loads((ROOT / name / 'offline-manifest.json').read_text())
                          for name in ['default', 'guides']}
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0),
            functools.partial(Site, directory=str(ROOT)))
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.origin = f'http://127.0.0.1:{cls.server.server_port}'
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(executable_path='/usr/bin/google-chrome',
            headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close(); cls.playwright.stop(); cls.server.shutdown(); cls.server.server_close()

    def setUp(self):
        Site.version = 1; Site.worker_version = 2; Site.asset_versions = {}; Site.failures = {}
        Site.slow = set(); Site.corrupt = set(); Site.quota = False; Site.manifest_enabled = True
        Site.requests.clear()
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))

    def tearDown(self):
        self.context.close()

    def wait_for_async(self, predicate):
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            if self.page.evaluate('async () => Boolean(await (' + predicate + ')())'):
                return
            self.page.wait_for_timeout(30)
        self.fail('Timed out waiting for asynchronous browser state: ' + predicate[:120])

    def ready(self):
        self.page.wait_for_function("() => /^(Available offline|Offline — saved copy)$/.test(document.querySelector('#offline-reading-status')?.textContent || '')")

    def visit(self, scope='default', page='cache-test.html'):
        self.page.goto(f'{self.origin}/' + (scope + '/' if scope else '') + page)
        self.ready()

    def text_version(self):
        return self.page.locator('#version').inner_text()

    def test_first_visit_offline_then_fresh_html_css_js_json(self):
        self.visit()
        self.context.set_offline(True); self.page.reload(); self.ready()
        self.assertEqual(self.text_version(), '1')
        self.assertEqual(self.page.evaluate('window.assetVersion'), 1)
        self.context.set_offline(False); Site.version = 2
        self.page.reload(); self.ready()
        self.assertEqual(self.text_version(), '2')
        self.assertEqual(self.page.evaluate('window.assetVersion'), 2)
        self.assertEqual(self.page.evaluate("getComputedStyle(document.body).getPropertyValue('--asset-version').trim()"), '2')
        self.assertEqual(self.page.evaluate("fetch('data/cache-test.json?chapter=1').then(r=>r.json())"), {'version': 2})
        self.wait_for_async('async () => {await navigator.serviceWorker.controller.postMessage({type:"ignored"}); return (await (await caches.open("orilla-offline:/default/:v2")).keys()).some(k=>k.url.includes("chapter=1"));}')
        self.context.set_offline(True); self.page.reload(); self.ready()
        self.assertEqual(self.page.evaluate('window.assetVersion'), 2)
        self.assertEqual(self.page.evaluate("fetch('data/cache-test.json?chapter=1').then(r=>r.json())"), {'version': 2})
        self.assertFalse(self.page.evaluate("location.search.includes('_sw')"))
        self.assertFalse(self.errors)

    def test_unchanged_assets_are_not_downloaded_again(self):
        self.visit(); Site.requests.clear()
        self.page.reload(); self.ready()
        paths = [path for path, _ in Site.requests]
        self.assertIn('/default/offline-version.json', paths)
        self.assertIn('/default/cache-test.html', paths)
        self.assertNotIn('/default/script/cache-test.js', paths)
        self.assertNotIn('/default/css/cache-test.css', paths)
        self.assertNotIn('/default/offline.js', paths)
        self.assertNotIn('/default/offline-manifest.json', paths)

    def test_initial_save_reuses_only_verified_http_cache_bytes(self):
        self.visit()
        # Each native resource was downloaded once, then copied out of HTTP cache.
        self.assertEqual(sum(path == '/default/css/cache-test.css' for path, _ in Site.requests), 1)
        self.assertEqual(sum(path == '/default/script/cache-test.js' for path, _ in Site.requests), 1)

    def test_initial_save_rejects_stale_http_cache_bytes(self):
        # The fixture's ordinary URLs serve stale v1 despite a v2 release marker.
        Site.version = 2
        self.visit()
        self.context.set_offline(True)
        self.page.reload(); self.ready()
        self.assertEqual(self.page.evaluate('window.assetVersion'), 2)
        self.assertEqual(self.text_version(), '2')

    def test_only_changed_file_is_downloaded(self):
        self.visit(); Site.requests.clear()
        Site.asset_versions['script/cache-test.js'] = 2
        self.page.reload(); self.ready()
        self.assertEqual(self.page.evaluate('window.assetVersion'), 2)
        paths = [path for path, _ in Site.requests]
        self.assertIn('/default/script/cache-test.js', paths)
        self.assertNotIn('/default/css/cache-test.css', paths)

    def test_open_tabs_keep_their_asset_versions(self):
        self.visit()
        first = self.page
        self.assertEqual(first.evaluate("fetch('data/cache-test.json').then(r=>r.json())"), {'version': 1})
        Site.version = 2
        second = self.context.new_page(); self.page = second
        self.visit()
        self.assertEqual(second.evaluate("fetch('data/cache-test.json').then(r=>r.json())"), {'version': 2})
        self.assertEqual(first.evaluate("fetch('data/cache-test.json').then(r=>r.json())"), {'version': 1})
        self.assertEqual(first.locator('#version').inner_text(), '1')
        latest_version = second.evaluate('''async () =>
            (await (await (await caches.open('orilla-offline:/default/:meta-v2'))
            .match(new URL('__offline__/release',location.href))).json()).version''')
        first.evaluate("window.dispatchEvent(new Event('online'))")
        first.wait_for_function("() => document.querySelector('#offline-reading-status')?.textContent === 'Partly available offline'")
        self.assertEqual(second.evaluate('''async () =>
            (await (await (await caches.open('orilla-offline:/default/:meta-v2'))
            .match(new URL('__offline__/visits',location.href))).json())[location.href].version'''), latest_version)

    def test_server_failure_and_uncached_offline_page(self):
        self.visit(); Site.failures['/default/cache-test.html'] = 503
        self.page.reload(); self.ready()
        self.assertEqual(self.text_version(), '1')
        self.context.set_offline(True)
        response = self.page.goto(self.origin + '/default/never-visited.html')
        self.assertEqual(response.status, 503)
        self.assertIn('has not been saved', self.page.locator('h1').inner_text())

    def test_deadline_covers_stalled_response_body(self):
        self.visit(); Site.slow.add('/default/cache-test.html')
        started = time.monotonic(); self.page.reload(); self.ready()
        self.assertLess(time.monotonic() - started, 2.8)
        self.assertEqual(self.text_version(), '1')

    def test_manifest_outage_uses_coherent_saved_page(self):
        self.visit(); Site.manifest_enabled = False; Site.version = 2
        self.page.reload(); self.ready()
        self.assertEqual(self.text_version(), '1')
        self.assertEqual(self.page.evaluate('window.assetVersion'), 1)

    def test_no_manifest_does_not_break_reading_or_updates(self):
        Site.manifest_enabled = False
        self.visit(); Site.version = 2
        self.page.reload(); self.ready()
        self.assertEqual(self.text_version(), '2')
        self.assertEqual(self.page.evaluate('window.assetVersion'), 2)

    def test_incomplete_deployment_does_not_poison_cache(self):
        self.visit(); Site.version = 2; Site.corrupt.add('/default/script/cache-test.js')
        self.page.reload()
        self.page.wait_for_function("() => document.querySelector('#offline-reading-status')?.textContent === 'Partly available offline'")
        self.assertIsNone(self.page.evaluate('window.assetVersion'))
        Site.corrupt.clear()
        self.page.reload(); self.ready()
        self.assertEqual(self.page.evaluate('window.assetVersion'), 2)

    def test_removal_and_private_responses_are_not_saved(self):
        self.visit(); Site.failures['/default/cache-test.html'] = 404
        response = self.page.reload()
        self.assertEqual(response.status, 404)
        self.wait_for_async('async () => !(await (await caches.open("orilla-offline:/default/:v2")).match(location.href))')
        self.context.set_offline(True)
        self.assertEqual(self.page.reload().status, 503)

    def test_dynamic_and_explicit_no_store_requests_are_excluded(self):
        self.visit()
        for path in ['php/test.php', 'private.html']:
            self.page.evaluate('(path)=>fetch(path).then(r=>r.text())', path)
        self.assertEqual(self.page.evaluate("fetch('data/cache-test.json',{method:'POST',body:'test'}).then(r=>r.text())"), 'posted')
        self.page.evaluate("fetch('data/cache-test.json?range=1',{headers:{Range:'bytes=0-3'}}).then(r=>r.text())")
        self.page.evaluate("fetch('data/cache-test.json?private=1',{cache:'no-store'}).then(r=>r.text())")
        keys = self.page.evaluate("caches.open('orilla-offline:/default/:v2').then(c=>c.keys()).then(ks=>ks.map(k=>k.url))")
        self.assertFalse(any('test.php' in key or 'private.html' in key or 'private=1' in key or 'range=1' in key for key in keys))

    def test_storage_failure_does_not_break_online_reading(self):
        self.visit()
        self.context.service_workers[0].evaluate("() => { caches.open = async () => {throw new Error('Storage unavailable');}; }")
        Site.version = 2
        self.page.reload()
        self.assertEqual(self.text_version(), '2')
        self.assertEqual(self.page.evaluate('window.assetVersion'), 2)

    def test_failed_migration_preserves_old_copies(self):
        self.visit()
        self.page.evaluate("caches.open('unrelated-application')")
        Site.worker_version = 3; Site.quota = True
        self.page.evaluate("navigator.serviceWorker.register('service-worker.js?quota-test',{scope:'/default/',updateViaCache:'none'})")
        self.wait_for_async('async () => navigator.serviceWorker.controller?.scriptURL.endsWith("?quota-test") && navigator.serviceWorker.controller.state === "activated"')
        self.assertIn('orilla-offline:/default/:v2', self.page.evaluate('caches.keys()'))
        self.assertIn('unrelated-application', self.page.evaluate('caches.keys()'))
        self.context.set_offline(True); self.page.reload()
        self.assertEqual(self.text_version(), '1')
        self.assertEqual(self.page.evaluate('window.assetVersion'), 1)

    def test_successful_migration_retains_reading(self):
        self.visit(); Site.worker_version = 3
        self.page.evaluate("navigator.serviceWorker.register('service-worker.js?upgrade-test',{scope:'/default/',updateViaCache:'none'})")
        self.wait_for_async('async () => navigator.serviceWorker.controller?.scriptURL.endsWith("?upgrade-test") && navigator.serviceWorker.controller.state === "activated"')
        self.assertNotIn('orilla-offline:/default/:v2', self.page.evaluate('caches.keys()'))
        self.context.set_offline(True); self.page.reload()
        self.assertEqual(self.text_version(), '1')
        self.assertEqual(self.page.evaluate('window.assetVersion'), 1)

    def test_scope_and_classic_with_javascript_disabled(self):
        self.visit('')
        self.assertTrue(self.page.evaluate('navigator.serviceWorker.controller.scriptURL').startswith(self.origin + '/service-worker.js?'))
        classic = self.origin.replace('127.0.0.1', 'localhost') + '/classic/index.html'
        self.page.goto(classic)
        self.assertFalse(self.page.evaluate('!!navigator.serviceWorker.controller'))
        old = self.browser.new_context(java_script_enabled=False)
        try:
            page = old.new_page(); page.goto(classic)
            self.assertTrue(page.locator('#content').inner_text().strip())
        finally:
            old.close()

    def test_page_retention_preserves_recent_pages_and_shared_assets(self):
        for index in range(9):
            self.visit(page=f'page-{index}.html')
        keys = self.page.evaluate("caches.open('orilla-offline:/default/:v2').then(c=>c.keys()).then(ks=>ks.map(k=>k.url))")
        self.assertNotIn(self.origin + '/default/page-0.html', keys)
        self.assertIn(self.origin + '/default/page-8.html', keys)
        self.assertTrue(any('cache-test.js?_swv=' in key for key in keys))
        self.context.set_offline(True)
        self.page.reload(); self.ready()
        self.assertEqual(self.page.evaluate('window.assetVersion'), 1)

    def test_cache_budget_evicts_unpinned_assets_first(self):
        self.visit()
        result = self.context.service_workers[0].evaluate('''async () => {
            const cache = await caches.open(CACHE_NAME);
            for (let i=0; i<605; i++) await cache.put(new URL('images/budget-'+i+'.svg', SCOPE),
                new Response('x', {headers:{'X-Orilla-Size':'131072','X-Orilla-Used':String(i)}}));
            await serial(() => trim(cache));
            const keys = await cache.keys(); let size=0;
            for (const key of keys) size += Number((await cache.match(key)).headers.get('X-Orilla-Size'));
            return {count:keys.length, size, page:!!(await cache.match(new URL('cache-test.html',SCOPE)))};
        }''')
        self.assertLessEqual(result['count'], 600)
        self.assertLessEqual(result['size'], 64*1024*1024)
        self.assertTrue(result['page'])
        self.context.set_offline(True); self.page.reload(); self.ready()
        self.assertEqual(self.page.evaluate('window.assetVersion'), 1)

    def test_real_guides_hub_offline(self):
        self.visit('guides', 'index.html')
        self.context.set_offline(True); self.page.reload(); self.ready()
        self.assertEqual(self.page.title(), 'Interactive Game Guides')
        self.assertEqual(self.page.locator('.card[tabindex="0"]').count(), 6)
        self.assertEqual(self.page.locator('img').evaluate_all('(images)=>images.every(i=>i.complete && i.naturalWidth>0)'), True)

    def test_real_ultima7_guide_and_lazy_assistant_offline(self):
        self.visit('guides', 'Ultima7.html')
        # Local chat now requires explicit consent. Exercise the actual model
        # and its dedicated cache here; this test does not install a worker fixture.
        self.page.get_by_role('button', name='Enable chat', exact=True).click()
        self.page.wait_for_function("document.documentElement.dataset.guideChat === 'ready'", timeout=120000)

        def ask_sage():
            self.page.wait_for_function("document.documentElement.dataset.guideChat === 'ready'", timeout=120000)
            self.page.locator('#main-nav [data-target="quests"]').click()
            self.page.locator('#main-quest-accordion .quest-item').first.click()
            self.page.locator('.get-main-quest-hint').first.click()
            self.page.locator('.sage-input').wait_for(state='visible')
            self.page.locator('.sage-spoiler').select_option('direct')
            self.page.locator('.sage-input').fill('Where might I find Shamino?')
            self.page.locator('.sage-send').click()
            self.page.wait_for_function("() => document.querySelector('.sage-messages')?.textContent.includes('Blue Boar')")

        ask_sage()
        # Wait for deferred Cache Storage writes for lazily loaded modules/data.
        self.wait_for_async('''async () => {
            const cache = await caches.open('orilla-offline:/guides/:v2');
            const urls = (await cache.keys()).map(request => request.url);
            return urls.some(url => url.includes('/data/assistant/ultima7.json?_swv=')) &&
                urls.some(url => url.includes('/js/assistant/adapters/ultima7.js?_swv='));
        }''')
        self.wait_for_async('''async () => {
            const metadata = await caches.open('orilla-offline:/guides/:meta-v2');
            const visits = await (await metadata.match(new URL('__offline__/visits', location.href))).json();
            return visits[location.href].keys.some(url => url.includes('/data/assistant/ultima7.json?_swv='));
        }''')
        self.context.set_offline(True)
        self.page.reload()
        ask_sage()
        self.assertFalse(self.errors)

    def test_copies_entry_points_and_generated_manifests(self):
        # Intentional owner-approved split: prefetch is default-only. Keep the
        # unchanged shared reading-cache primitives identical and assert isolation.
        main = (ROOT/'default/service-worker.js').read_text()
        guides = (ROOT/'guides/service-worker.js').read_text()
        self.assertEqual(main.split('// Default-only speculation')[0].split('\n',1)[1],
                         guides.split('async function resource(')[0].split('\n',1)[1])
        self.assertIn('PREFETCH_PAGE', main)
        self.assertNotIn('PREFETCH_PAGE', guides)
        self.assertNotIn('installPrefetch', (ROOT/'guides/offline.js').read_text())
        for site in ['default', 'guides']:
            for page in (ROOT/site).glob('*.html'):
                # Intentional rollout change: bypass the long-cached ?v=2 loader.
                self.assertEqual(page.read_text().count('src="offline.js?v=3"'), 1, str(page))
            manifest = (ROOT/site/'offline-manifest.json').read_bytes()
            version = json.loads((ROOT/site/'offline-version.json').read_text())['version']
            self.assertEqual(hashlib.sha256(manifest).hexdigest(), version)
            for path, item in json.loads(manifest)['files'].items():
                from urllib.parse import unquote
                self.assertEqual(hashlib.sha256((ROOT/site/unquote(path)).read_bytes()).hexdigest(), item['hash'], path)
        for page in (ROOT/'classic').glob('*.html'):
            self.assertNotIn('offline.js', page.read_text())


if __name__ == '__main__':
    unittest.main()
