"""Real-adapter state separation checks. Uses the already-installed browser tools."""
from browser_consent_fixture import CONSENT_FIXTURE
import asyncio, json, pathlib, re
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
        context = await browser.new_context(service_workers='block')
        await context.add_init_script(script=CONSENT_FIXTURE)
        requests, attempts, errors = [], [], []
        def log_request(req):
            requests.append({'method': req.method, 'url': req.url.split('?')[0], 'hasQuery': '?' in req.url, 'hasBody': req.post_data is not None})
        async def route(r):
            if re.search(r'(?:/php/llm\.php|generativelanguage|generateContent|gemini|openai\.com|anthropic\.com|huggingface|webllm|\.gguf|\.onnx|\.safetensors)', r.request.url, re.I):
                attempts.append(r.request.url.split('?')[0])
                await r.abort()
            else:
                await r.continue_()
        context.on('request', log_request)
        await context.route('**/*', route)
        await context.add_init_script("localStorage.setItem('ultima7-party-plan','[0,2]');localStorage.setItem('alqadim.questState.v1',JSON.stringify({ch4_5:true,ch1_1:false}));")
        page = await context.new_page()
        await page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
        page.on('pageerror', lambda error: errors.append(str(error)))
        results = []
        for game, html in [('ultima7', 'Ultima7'), ('alqadim', 'AlQadim')]:
            await page.goto(f'http://127.0.0.1:8766/guides/{html}.html', wait_until='networkidle')
            results += await page.evaluate('''async game => {
                const adapter = await import('./js/assistant/adapters/' + game + '.js');
                const overlay = await fetch('./data/assistant/' + game + '.json').then(r => r.json());
                const {createAssistant} = await import('./js/assistant/engine.js');
                const records = game === 'ultima7' ? adapter.buildUltima7Records(DB, overlay) : adapter.buildAlQadimRecords(DB, overlay);
                const key = game === 'ultima7' ? 'ultima7-party-plan' : 'alqadim.questState.v1';
                const saved = localStorage.getItem(key);
                const values = JSON.parse(saved);
                const a = createAssistant({gameId: game, records, getProgress: game === 'ultima7' ? () => [] : () => adapter.importAlQadimProgress(DB, values)});
                const out = [], check = (id, value) => out.push({id, passed: !!value});
                const send = text => a.answer(text, {spoiler: 'direct'});
                if (game === 'ultima7') {
                    check('party-plan-is-not-membership', a.evidence.read('ultima7:companion:iolo:in-party').value === 'unknown');
                    check('explicit-party-report', send('Iolo is in my party').decision === 'correction' && a.evidence.read('ultima7:companion:iolo:in-party').value === true);
                    check('party-report-correction', send('Iolo is not currently in my party').decision === 'correction' && a.evidence.read('ultima7:companion:iolo:in-party').value === false);
                    check('equipment-current-report', send('I have Glass Sword').decision === 'correction' && a.evidence.read('ultima7:equipment:glass-sword:possessed').value === true);
                    check('equipment-loss', send('I lost Glass Sword').decision === 'correction' && a.evidence.read('ultima7:equipment:glass-sword:possessed').value === false);
                    check('equipment-historical-separate', send('I obtained Glass Sword').decision === 'correction' && a.evidence.read('ultima7:equipment:glass-sword:acquired').value === true && a.evidence.read('ultima7:equipment:glass-sword:possessed').value === false);
                } else {
                    check('checked-acquisition-historical', a.evidence.read('alqadim:objective:ch4_5:completed').value === true && a.evidence.read('alqadim:item:ship-orb:possessed').value === 'unknown');
                    check('unchecked-unknown', a.evidence.read('alqadim:objective:ch1_1:completed').value === 'unknown');
                    check('malformed-import-unknown', adapter.importAlQadimProgress(DB, null).length === 0);
                    check('item-current-report', send('I have Ship Orb').decision === 'correction' && a.evidence.read('alqadim:item:ship-orb:possessed').value === true);
                    check('item-negative-current', send('I no longer have Ship Orb').decision === 'correction' && a.evidence.read('alqadim:item:ship-orb:possessed').value === false && a.evidence.read('alqadim:objective:ch4_5:completed').value === true);
                    check('historical-correction-overrides-import', send('I have not acquired Ship Orb').decision === 'correction' && a.evidence.read('alqadim:objective:ch4_5:completed').value === false);
                    check('hypothetical-does-not-assert', send('If I have Ship Orb, how do I use it?').stateChanges.length === 0 && a.evidence.read('alqadim:item:ship-orb:possessed').value === false);
                    check('quoted-does-not-assert', send('"I have Ship Orb"').stateChanges.length === 0 && a.evidence.read('alqadim:item:ship-orb:possessed').value === false);
                    check('unmodeled-purchase-declined', send('How do I buy Ship Orb?').decision === 'decline');
                    check('modeled-purchase-supported', send('How do I buy Healing Potion?').decision === 'answer');
                }
                check(game + '-saved-values-unchanged', saved === localStorage.getItem(key));
                return out;
            }''', game)
        output = pathlib.Path('guides/tests/assistant/results/genie-sage-state.json')
        output.parent.mkdir(parents=True, exist_ok=True)
        report = {'passed': sum(result['passed'] for result in results), 'total': len(results), 'checks': results, 'browser': browser.version, 'inferenceAttempts': attempts, 'pageErrors': errors, 'requestLog': requests}
        output.write_text(json.dumps(report, indent=2) + '\n')
        print(json.dumps({key: value for key, value in report.items() if key != 'requestLog'}, indent=2))
        await browser.close()
        assert all(result['passed'] for result in results), 'A real-adapter state separation check failed.'
        assert not attempts and not errors, 'A state-runner network or page-error gate failed.'
        assert all(req['method'] in ('GET', 'HEAD') and not req['hasBody'] for req in requests), 'A state fixture sent a non-static request.'

asyncio.run(main())
