from browser_consent_fixture import CONSENT_FIXTURE
import asyncio, json, os
from urllib.parse import urlparse
from pathlib import Path
from playwright.async_api import async_playwright

BASE = os.environ.get('ASSISTANT_BASE_URL', 'http://127.0.0.1:8766').rstrip('/')
OUTPUT = Path(__file__).resolve().parent / 'evidence' / 'narrative-expansion-starcraft-browser.json'


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
        context = await browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
        await context.add_init_script(script=CONSENT_FIXTURE)
        requests, errors, blocked = [], [], []

        async def route(req):
            url = req.request.url
            requests.append({'method': req.request.method, 'url': url.split('?')[0], 'body': req.request.post_data is not None})
            parsed = urlparse(url)
            local = parsed.scheme in ('data', 'blob') or parsed.hostname in ('127.0.0.1', 'localhost', '::1')
            if not local:
                blocked.append(url)
                await req.abort()
            else:
                await req.continue_()

        await context.route('**/*', route)
        page = await context.new_page()
        await page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Site-worker bootstrap isolated in legacy assistant tests.'))
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(BASE + '/guides/StarcraftBWAPI.html', wait_until='networkidle')
        await page.wait_for_selector('.guide-assistant-controls', state='attached')
        await page.click('#main-nav [href="#ai-assistant"]')
        storage = await page.evaluate('JSON.stringify(localStorage)')

        built = await page.evaluate('''async () => {
            const {buildStarcraftRecords} = await import('/guides/js/assistant/adapters/starcraft.js');
            const overlay = await (await fetch('/guides/data/assistant/starcraft.json')).json();
            return buildStarcraftRecords(document, overlay).filter(record => record.relation === 'narrative').map(record => ({
                id: record.id, aspect: record.narrative.aspect, level: record.minSpoiler,
                text: record.variants[record.minSpoiler].text, source: record.source
            }));
        }''')
        assert len(built) == 8, built
        assert all(record['level'] == 'direct' and record['source']['review'] == 'extracted' for record in built)
        assert all('\n'.join(claim['text'] for claim in record['source']['claims']) == record['text'] for record in built)

        results = []

        async def ask(question):
            await page.fill('#sc-ai-input', question)
            result = await page.evaluate('scAiSend()')
            results.append({'question': question, 'decision': result['decision'], 'recordIds': result['recordIds'],
                            'level': result['level'], 'text': result['text']})
            return result

        direct_cases = [
            ('Summarize SCHNAIL', 'summary'),
            ('Why does the first launch take some time?', 'cause'),
            ('How was the BWAPI map selected?', 'method'),
            ('What is the method for BWAILauncher?', 'method'),
            ('What is the method for the BWAPI map?', 'method'),
            ('What is the purpose of BWAILauncher?', 'purpose'),
            ('What is the next step for SCHNAIL antivirus?', 'sequence'),
            ('What is the outcome of using a standard Melee game?', 'outcome')
        ]
        for question, aspect in direct_cases:
            await page.select_option('#sc-assistant-spoiler', 'direct')
            result = await ask(question)
            assert result['decision'] == 'answer', (question, result)
            assert any(f':{aspect}' in record_id for record_id in result['recordIds']), (question, result)
            await page.evaluate('scAiClear()')

        await page.select_option('#sc-assistant-spoiler', 'gentle')
        original_identity = await ask('What is SCHNAIL?')
        assert original_identity['decision'] == 'answer' and original_identity['recordIds'] == ['starcraft:schnail:features'], original_identity
        await page.evaluate('scAiClear()')

        howto = await ask('How do I troubleshoot BWAPI not loading?')
        assert howto['decision'] == 'answer' and 'starcraft:bwapi-loading:checks' in howto['recordIds'], howto
        await page.evaluate('scAiClear()')

        # Full DOM excerpts belong to Direct. Lower tiers can answer from their
        # separately authored variants but cannot expose these exact excerpts.
        direct_text = next(record['text'] for record in built if record['id'].endswith('bwai-purpose:purpose'))
        for level in ['balanced', 'gentle']:
            await page.select_option('#sc-assistant-spoiler', level)
            lower = await ask('What is the purpose of BWAILauncher?')
            assert not any(record_id.endswith('bwai-purpose:purpose') for record_id in lower['recordIds']), (level, lower)
            assert direct_text not in lower['text'], (level, lower)
            await page.evaluate('scAiClear()')

        await page.select_option('#sc-assistant-spoiler', 'direct')
        conflict = await ask('How do I use BWAILauncher in Remastered?')
        assert conflict['decision'] == 'decline' and 'sources disagree' in conflict['text'], conflict
        wrong_actor = await ask('What did Artanis do to BWAILauncher?')
        assert wrong_actor['decision'] != 'answer', wrong_actor
        wrong_world = await ask('What is the purpose of BWAILauncher on Mars?')
        assert wrong_world['decision'] != 'answer', wrong_world

        wrong_action = await ask('Why does the first launch delete game files?')
        assert wrong_action['decision'] != 'answer', wrong_action
        wrong_method = await ask('What is the method for BWAILauncher without selecting Starcraft.exe?')
        assert wrong_method['decision'] != 'answer', wrong_method
        assert await page.evaluate('JSON.stringify(localStorage)') == storage
        assert not blocked and not errors, {'blocked': blocked, 'errors': errors}
        assert all(req['method'] == 'GET' and not req['body'] for req in requests), requests

        OUTPUT.parent.mkdir(exist_ok=True)
        OUTPUT.write_text(json.dumps({'browser': browser.version, 'facets': built, 'questions': results,
                                      'storageUnchanged': True, 'blockedInferenceAttempts': len(blocked),
                                      'pageErrors': errors, 'staticRequests': requests}, indent=2))
        print(json.dumps({'browser': browser.version, 'facetCount': len(built), 'questions': len(results),
                          'storageUnchanged': True, 'blockedInferenceAttempts': len(blocked), 'pageErrors': errors}, indent=2))
        await browser.close()


asyncio.run(main())
