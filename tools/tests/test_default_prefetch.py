"""Real browser regressions for default-only prefetch and themed status."""
import json
import time
import unittest
from tools.tests import test_offline_reading as base


class DefaultPrefetch(unittest.TestCase):
    setUpClass = classmethod(base.OfflineReading.setUpClass.__func__)
    tearDownClass = classmethod(base.OfflineReading.tearDownClass.__func__)
    tearDown = base.OfflineReading.tearDown
    wait_for_async = base.OfflineReading.wait_for_async
    ready = base.OfflineReading.ready
    visit = base.OfflineReading.visit

    def setUp(self):
        base.Site.prefetch_age = 30000
        base.Site.prefetch_too_large = False
        base.OfflineReading.setUp(self)

    def test_first_visit_bypasses_old_cdn_loader_version(self):
        # Production gave the old ?v=2 response a one-year cache lifetime. HTML must request
        # ?v=3 before any service worker can replace cached resources.
        self.context.route('**/offline.js?v=2', lambda r: r.fulfill(
            content_type='application/javascript', body='window.oldLoaderExecuted=true;'))
        for site in ['default', 'guides']:
            self.visit(scope=site, page='cache-test.html')
            self.assertIsNone(self.page.evaluate('window.oldLoaderExecuted'))
            self.page.wait_for_function("()=>getComputedStyle(document.getElementById('offline-reading-status')).borderRadius==='999px'")
        loaders=[query for path,query in base.Site.requests if path.endswith('/offline.js')]
        self.assertTrue(any(query.get('v')==['3'] for query in loaders))
        self.assertFalse(any(query.get('v')==['2'] for query in loaders))

    def warm(self, name):
        return self.page.evaluate('''async name => {
            const c = new MessageChannel();
            const reply = new Promise(resolve => c.port1.onmessage = e => resolve(e.data));
            navigator.serviceWorker.controller.postMessage({type:'PREFETCH_PAGE',url:new URL(name,location.href).href,intent:true},[c.port2]);
            return reply;
        }''', name)

    def prefetched(self):
        return self.page.evaluate('''async()=>{
            const c=await caches.open('orilla-prefetch:/default/:v1');
            return (await c.keys()).map(k=>new URL(k.url).pathname);
        }''')

    def test_focus_warms_without_executing_or_fetching_media(self):
        self.visit(page='page-links.html')
        base.Site.requests.clear()
        self.page.locator('#article-a').focus()
        self.wait_for_async("async()=> (await (await caches.open('orilla-prefetch:/default/:v1')).keys()).some(k=>k.url.endsWith('/page-prefetch-a.html'))")
        self.assertIsNone(self.page.evaluate('window.prefetchOnlyVersion'))
        paths=[p for p,_ in base.Site.requests]
        self.assertIn('/default/script/prefetch-only.js',paths)
        self.assertFalse(any('/images/' in p or '/files/' in p for p in paths))
        self.assertFalse(self.errors)

    def test_blog_idle_warms_only_two_visible_articles(self):
        self.visit(page='page-blog.html')
        self.wait_for_async("async()=> (await (await caches.open('orilla-prefetch:/default/:v1')).keys()).filter(k=>k.url.endsWith('.html')).length===2")
        self.page.wait_for_timeout(1500)
        pages=[p for p in self.prefetched() if p.endswith('.html')]
        self.assertEqual(set(pages),{'/default/page-prefetch-a.html','/default/page-prefetch-b.html'})
        self.assertNotIn('/default/page-prefetch-c.html',[p for p,_ in base.Site.requests])

    def test_fresh_prepared_navigation_does_not_wait_for_stalled_origin(self):
        self.visit()
        self.assertTrue(self.warm('page-prefetch-a.html')['prefetched'])
        base.Site.slow.add('/default/page-prefetch-a.html')
        start=time.monotonic()
        self.page.goto(self.origin+'/default/page-prefetch-a.html',wait_until='domcontentloaded')
        self.assertLess(time.monotonic()-start,1.5)
        self.assertEqual(self.page.locator('#version').inner_text(),'1')
        self.assertEqual(self.page.evaluate('window.prefetchOnlyVersion'),1)
        self.assertFalse(self.errors)

    def test_observed_new_release_rejects_old_prefetch(self):
        self.visit()
        self.assertTrue(self.warm('page-prefetch-a.html')['prefetched'])
        base.Site.version=2
        self.page.goto(self.origin+'/default/second.html');self.ready()
        self.page.goto(self.origin+'/default/page-prefetch-a.html');self.ready()
        self.assertEqual(self.page.locator('#version').inner_text(),'2')
        self.assertEqual(self.page.evaluate('window.prefetchOnlyVersion'),2)

    def test_expired_copy_uses_normal_fresh_navigation(self):
        base.Site.prefetch_age=50
        self.visit()
        self.assertTrue(self.warm('page-prefetch-a.html')['prefetched'])
        self.page.wait_for_timeout(100)
        base.Site.version=2
        self.page.goto(self.origin+'/default/page-prefetch-a.html');self.ready()
        self.assertEqual(self.page.locator('#version').inner_text(),'2')

    def test_speculation_keeps_two_pages_and_preserves_reading_cache(self):
        self.visit()
        before=self.page.evaluate("caches.open('orilla-offline:/default/:v2').then(async c=>(await c.keys()).map(k=>k.url).sort())")
        for name in ['page-prefetch-a.html','page-prefetch-b.html','page-prefetch-c.html']:
            self.assertTrue(self.warm(name)['prefetched'])
        keys=self.prefetched()
        self.assertEqual(len([p for p in keys if p.endswith('.html')]),2)
        self.assertNotIn('/default/page-prefetch-a.html',keys)
        after=self.page.evaluate("caches.open('orilla-offline:/default/:v2').then(async c=>(await c.keys()).map(k=>k.url).sort())")
        self.assertEqual(before,after)
        size=self.page.evaluate("caches.open('orilla-prefetch:/default/:v1').then(async c=>{let n=0;for(const k of await c.keys())n+=(await(await c.match(k)).arrayBuffer()).byteLength;return n;})")
        self.assertLessEqual(size,4*1024*1024)
        self.assertFalse(self.warm('page-prefetch-d.html')['prefetched'])

    def test_private_and_unsafe_destinations_do_not_warm(self):
        self.visit();base.Site.requests.clear()
        for name in ['private.html','php/test.php','page-prefetch-a.html?private=1','https://example.com/page.html','../guides/Ultima7.html']:
            self.assertFalse(self.warm(name)['prefetched'])
        self.assertFalse(self.prefetched())
        paths=[p for p,_ in base.Site.requests]
        self.assertFalse(any('php/' in p or 'guides/' in p or 'page-prefetch' in p for p in paths))

    def test_corrupt_or_over_budget_dependency_never_becomes_fast_copy(self):
        base.Site.prefetch_too_large=True
        self.visit();base.Site.requests.clear()
        self.assertFalse(self.warm('page-prefetch-a.html')['prefetched'])
        self.assertNotIn('/default/script/prefetch-only.js',[p for p,_ in base.Site.requests])
        self.assertFalse(self.prefetched())

    def test_checksum_failure_never_publishes_a_prepared_page(self):
        base.Site.version=2
        self.visit();base.Site.corrupt.add('/default/script/prefetch-only.js')
        self.assertFalse(self.warm('page-prefetch-a.html')['prefetched'])
        self.assertFalse(self.prefetched())

    def test_data_saver_and_slow_connection_skip_automatic_prefetch(self):
        self.context.add_init_script("Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'},configurable:true})")
        self.visit(page='page-blog.html');base.Site.requests.clear()
        self.page.locator('#article-a').focus();self.page.wait_for_timeout(1800)
        self.assertFalse(any('page-prefetch' in p for p,_ in base.Site.requests))
        self.page.evaluate("Object.defineProperty(navigator,'connection',{value:{saveData:false,effectiveType:'2g'},configurable:true})")
        self.page.locator('#article-b').focus();self.page.evaluate("dispatchEvent(new Event('scroll'))");self.page.wait_for_timeout(1800)
        self.assertFalse(any('page-prefetch' in p for p,_ in base.Site.requests))

    def test_brief_hover_is_cancelled_but_deliberate_hover_prepares(self):
        self.visit(page='page-links.html');base.Site.requests.clear()
        self.page.locator('#article-a').hover();self.page.mouse.move(1000,500)
        self.page.wait_for_timeout(250)
        self.assertFalse(any('page-prefetch' in p for p,_ in base.Site.requests))
        self.page.locator('#article-a').hover()
        self.wait_for_async("async()=> (await (await caches.open('orilla-prefetch:/default/:v1')).keys()).some(k=>k.url.endsWith('/page-prefetch-a.html'))")

    def test_cached_visit_does_not_flash_saving(self):
        self.visit()
        self.context.add_init_script("""window.statusMessages=[];new MutationObserver(()=>{
            const text=document.getElementById('offline-reading-status')?.textContent;
            if(text&&!statusMessages.includes(text))statusMessages.push(text);
        }).observe(document,{childList:true,subtree:true,characterData:true});""")
        self.page.reload();self.ready();self.page.wait_for_timeout(450)
        messages=self.page.evaluate('window.statusMessages')
        self.assertIn('Available offline',messages)
        self.assertFalse(any('Saving for offline' in m for m in messages))

    def test_prepared_page_reads_offline_without_claiming_unsaved_images(self):
        self.visit();self.assertTrue(self.warm('page-prefetch-a.html')['prefetched'])
        self.context.set_offline(True)
        self.page.goto(self.origin+'/default/page-prefetch-a.html')
        self.wait_for_async("async()=>document.querySelector('#offline-reading-status')?.textContent==='Partly available offline'")
        self.assertEqual(self.page.locator('#version').inner_text(),'1')
        self.assertEqual(self.page.evaluate('window.prefetchOnlyVersion'),1)
        self.assertFalse(self.errors)

    def test_guides_do_not_speculate(self):
        self.visit(scope='guides',page='page-links.html');base.Site.requests.clear()
        self.page.locator('#article-a').focus();self.page.wait_for_timeout(1800)
        self.assertFalse(any('page-prefetch' in p for p,_ in base.Site.requests))

    def test_badge_follows_light_dark_and_live_theme_changes(self):
        self.page.emulate_media(color_scheme='light')
        self.visit(page='page-theme.html')
        light=self.page.locator('#offline-reading-status').evaluate('(n)=>({color:getComputedStyle(n).color,bg:getComputedStyle(n).backgroundColor,radius:getComputedStyle(n).borderRadius})')
        self.page.emulate_media(color_scheme='dark')
        dark=self.page.locator('#offline-reading-status').evaluate('(n)=>({color:getComputedStyle(n).color,bg:getComputedStyle(n).backgroundColor})')
        self.assertNotEqual(light['color'],dark['color']);self.assertNotEqual(light['bg'],dark['bg'])
        self.assertEqual(light['radius'],'999px')
        self.assertEqual(self.page.locator('#offline-reading-status').get_attribute('role'),'status')
        self.assertEqual(self.page.locator('.offline-status-mark').get_attribute('aria-hidden'),'true')
        self.assertEqual(self.page.locator('#offline-reading-status').inner_text(),'Available offline')
        self.page.set_viewport_size({'width':320,'height':640})
        self.assertLessEqual(self.page.locator('#offline-reading-status').bounding_box()['width'],296)


if __name__=='__main__':unittest.main()
