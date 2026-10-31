"""Fixed knowledge oracles against native MiniLM and the production guide UI.

Only the explicitly disclosed generative worker uses the existing consent fixture.
Both classify and encode run in the unmodified production MiniLM worker. Expected
answers, source locators and fact IDs come exclusively from the checked-in cases;
fact IDs are oracle metadata, not observable UI state. No expected-state injection,
cached query vectors, package installs, downloads, or user preview server are used.
Run all cases by default, or use --game starcraft --limit-dialogues 2 for a probe.
"""
import argparse
import hashlib
import importlib.util
import json
import math
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse

from browser_consent_fixture import CONSENT_FIXTURE

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
spec = importlib.util.spec_from_file_location('knowledge_browser_helpers', HERE / 'full-answer-browser.py')
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
SURFACES = helpers.SURFACES
GAMES = tuple(dict.fromkeys(s.split('-')[0] for s in SURFACES))
WORKER_OBSERVER = r'''(() => {
    const NativeWorker=window.Worker;
    window.knowledgeIntentWorkers=[];
    window.Worker=class extends NativeWorker {
        constructor(url,options){
            super(url,options);
            if(String(url).includes('/assistant/intent-worker.js')){
                this.knowledgeEvidence={url:String(url),events:[]};
                window.knowledgeIntentWorkers.push(this.knowledgeEvidence);
                this.addEventListener('message',event=>{
                    const d=event.data;
                    if(['ready','result','embedding','error'].includes(d.type)){
                        const row={direction:'receive',type:d.type,id:d.id,metadata:d.metadata,predictions:d.predictions,message:d.message};
                        if(d.type==='embedding'){
                            row.dimensions=d.vector?.length;
                            row.allFinite=Array.from(d.vector||[]).every(Number.isFinite);
                            row.norm=Math.sqrt(Array.from(d.vector||[]).reduce((n,x)=>n+x*x,0));
                        }
                        this.knowledgeEvidence.events.push(row);
                    }
                });
            }
        }
        postMessage(data,...rest){
            if(this.knowledgeEvidence&&['load','classify','encode','cancel'].includes(data.type))
                this.knowledgeEvidence.events.push({direction:'send',type:data.type,id:data.id,text:data.text,modelId:data.profile?.modelId});
            return super.postMessage(data,...rest);
        }
    };
})();'''


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def reference_present(label, url, citations, checked_at=None):
    date = re.escape(f' (checked {checked_at})') if checked_at else r'(?: \(checked \d{4}-\d{2}-\d{2}\))?'
    pattern = re.compile(r'(?:^|: |; )' + re.escape(label + ' — ' + url) + date + r'(?:; |\.?$)')
    return any(pattern.search(citation) for citation in citations)


def source_present(source, citations):
    # The research UI intentionally renders primary label/URL references,
    # rather than its local authored-index path. Resolve that exact index
    # deterministically; expected answers never select the reference.
    match = re.fullmatch(r'guides/data/assistant/knowledge/(albion|ultima5|ultima6|ultima7|alqadim|starcraft)\.json', source['file'])
    index = re.fullmatch(r'facts\[(\d+)\]', source['locator'])
    if source.get('review') == 'external-research' and match and index:
        try:
            manifest = json.loads((ROOT / source['file']).read_text())
            actual = manifest['facts'][int(index.group(1))]['source']
            if actual['file'] != source['file'] or actual['locator'] != source['locator'] or actual['review'] != 'external-research':
                return False
            refs = actual['references']
            return bool(refs) and all(reference_present(ref['label'],ref['url'],citations,ref.get('checkedAt')) for ref in refs)
        except (OSError, ValueError, KeyError, IndexError, TypeError):
            return False
    if source.get('review') == 'external-research' and source['file'].startswith(('https://','http://')):
        return reference_present(source['locator'],source['file'],citations)
    # A guide locator may itself name several fields separated by semicolons.
    # Keep their file identity when reading the UI; never truncate the expected
    # compound locator at its first semicolon or combine fields from other files.
    tuples = set()
    for citation in citations:
        body = citation.split('. ', 1)[-1] if citation.startswith('Source:') else citation
        current_file = None
        for part in body.split('; '):
            if ' — ' in part:
                file, locator = part.split(' — ', 1)
                if re.fullmatch(r'(?:https?://\S+|[\w./-]+\.[\w]+)', file.strip()):
                    current_file = file.strip()
                else:
                    locator = part
            else:
                locator = part
            if current_file:
                tuples.add((current_file, locator.strip()))
                tuples.add((current_file, locator.strip().removesuffix('.')))
    return all((source['file'], locator.strip()) in tuples for locator in source['locator'].split('; '))


def check_answer_branch(branch, base, answer, citations):
    problems = []
    sources = branch['allSources'] if 'allSources' in branch else [branch['source']]
    for source in sources:
        if not source_present(source, citations):
            problems.append('Missing exact fixed source citation: ' + source['file'] + ' — ' + source['locator'])
    for value in branch.get('contains', base.get('contains', [])):
        if value.casefold() not in answer.casefold():
            problems.append('Missing fixed answer substring: ' + value)
    for value in branch.get('notContains', []):
        if value.casefold() in answer.casefold():
            problems.append('Forbidden answer substring: ' + value)
    return problems


def send(page, surface, turn):
    _, inp, button, log = SURFACES[surface]
    page.evaluate('s=>window.knowledgePreviousReply=document.querySelector(s).lastElementChild', log)
    page.locator(inp).fill(turn['text'])
    page.locator(button).click(timeout=10000)
    page.wait_for_function('''([log,button,q])=>{
        const e=document.querySelector(log),n=[...e.querySelectorAll('.guide-assistant-message')],last=n.at(-1);
        return !window.knowledgePreviousReply?.isConnected&&last?.classList.contains('ai')&&last.dataset.decision&&last.dataset.decision!=='pending'
            &&n.at(-2)?.querySelector('.ga-msg-text')?.textContent===q&&!document.querySelector(button).disabled;
    }''', arg=[log, button, turn['text']], timeout=30000)
    block = page.locator(log + ' .guide-assistant-message.ai').last
    answer = block.locator('.ga-msg-text').inner_text()
    decision = block.get_attribute('data-decision')
    citations = block.locator('.ga-msg-source').all_inner_texts()
    links = block.locator('a[href]').evaluate_all('(nodes)=>nodes.map(e=>e.href)')
    expected = turn['expected']
    problems = []
    branch_results = []
    accepted_branch = None
    if expected['decision'] == 'answer':
        if decision != 'answer':
            problems.append('Expected answer; observed ' + str(decision))
        # Every accepted branch must pass its complete, independently authored
        # source/text oracle. Never combine a source from one with another's text.
        branches = [expected] + expected.get('alternativeAnswers', [])
        branch_results = [check_answer_branch(branch, expected, answer, citations) for branch in branches]
        accepted_branch = next((i for i, result in enumerate(branch_results) if not result), None)
        if accepted_branch is None:
            problems.extend(min(branch_results, key=len))
    elif decision == 'answer':
        problems.append('Expected non-answer; observed factual answer')
    if expected['decision'] != 'answer':
        for value in expected.get('contains', []):
            if value.casefold() not in answer.casefold():
                problems.append('Missing fixed answer substring: ' + value)
    for value in expected.get('notContains', []):
        if value.casefold() in answer.casefold():
            problems.append('Forbidden answer substring: ' + value)
    help_controls = page.evaluate(helpers.NO_HELP)
    if help_controls:
        problems.append('Removed help-level controls present: ' + json.dumps(help_controls))
    return {'text': turn['text'], 'expected': expected, 'decision': decision, 'rendered': answer,
            'citations': citations, 'links': links, 'acceptedAnswerBranch': accepted_branch,
            'answerBranchProblems': branch_results, 'factIdObservation': 'factIds/allFactIds are oracle metadata; UI citations do not prove internal retrieved fact IDs.',
            'problems': list(dict.fromkeys(problems)), 'passed': not problems}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tag', required=True)
    parser.add_argument('--browser-executable', default='/usr/bin/google-chrome',
                        help='Existing Chromium/Chrome executable; no browser is installed or downloaded.')
    parser.add_argument('--game', choices=GAMES, action='append', help='Repeat to select games; default all six.')
    parser.add_argument('--dialogue-id', action='append', help='Repeat to select fixed dialogue IDs; unmatched games are omitted.')
    parser.add_argument('--limit-dialogues', type=int, default=0, help='First N fixed dialogues per game; 0 runs all.')
    args = parser.parse_args()
    from playwright.sync_api import sync_playwright
    if not args.tag.replace('-', '').replace('_', '').isalnum() or args.limit_dialogues < 0:
        parser.error('Invalid tag or dialogue limit')
    output = HERE / 'evidence' / ('knowledge-browser-' + args.tag + '.json')
    if output.exists():
        parser.error('Report already exists; choose a new tag to preserve prior evidence')
    shots = HERE / 'intent-prototype/results/knowledge' / args.tag
    shots.mkdir(parents=True, exist_ok=True)
    games = args.game or list(GAMES)
    corpus_paths = {game: HERE / 'knowledge' / (game + '-cases.json') for game in games}
    corpora = {game: json.loads(path.read_text()) for game, path in corpus_paths.items()}
    if args.dialogue_id:
        known = {d['id'] for corpus in corpora.values() for d in corpus['dialogues']}
        unknown = set(args.dialogue_id) - known
        if unknown:
            parser.error('Unknown dialogue IDs in selected games: ' + ', '.join(sorted(unknown)))
    dialogues = {game: [d for d in corpus['dialogues'] if not args.dialogue_id or d['id'] in args.dialogue_id][:args.limit_dialogues or None]
                 for game, corpus in corpora.items()}
    games = [game for game in games if dialogues[game]]
    surfaces = {surface: value for surface, value in SURFACES.items() if surface.split('-')[0] in games}
    watched = set((ROOT / 'guides/js').rglob('*.js')) | set((ROOT / 'guides/data/assistant').rglob('*.json'))
    watched |= set((ROOT / 'guides/local-assistant/intent').glob('*.json'))
    watched |= {ROOT / 'guides' / s[0] for s in surfaces.values()}
    watched |= set(corpus_paths.values()) | {Path(__file__), HERE / 'full-answer-browser.py', HERE / 'browser-consent-fixture.js', ROOT / 'guides/local-assistant/profile.json'}
    hashes = lambda: {str(path.relative_to(ROOT)): digest(path) for path in sorted(watched)}
    report = {'schemaVersion': 1, 'realMiniLM': True, 'nativeIntentClassification': True, 'nativeQueryEncoding': True,
              'generativeWorkerFixture': True, 'nativeGenerativeInference': False, 'productionFactoryAndUI': True,
              'oracleLimitation': 'factIds/allFactIds and sourceRecordIds are fixed oracle metadata. UI assertions check exact guide file/locator or every primary label/URL/date reference resolved from the exact authored research index, plus fixed answer substrings. Research citations are label-first in the UI. Internal fact IDs and allFactIds completeness are not proven by UI citations.',
              'selectedGames': games, 'selectedSurfaces': list(surfaces), 'limitDialogues': args.limit_dialogues,
              'selectedDialogueIds': args.dialogue_id,
              'corpusHashes': {game: digest(path) for game, path in corpus_paths.items()},
              'sourceHashesBefore': hashes(), 'turns': [], 'failures': [], 'requests': [], 'blockedRequests': [],
              'pageErrors': [], 'workers': {}, 'storageUnchanged': {}, 'storageWrites': {}, 'screenshots': []}
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    report['loopbackPort'] = server.server_port
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=args.browser_executable, headless=True, args=['--no-sandbox'])
            context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
            context.add_init_script(script=WORKER_OBSERVER + '\n' + CONSENT_FIXTURE + '\n' + helpers.STORAGE_OBSERVER)
            def route(r):
                req = r.request
                u = urlparse(req.url)
                item = {'url': req.url.split('?')[0], 'method': req.method, 'hasBody': req.post_data_buffer is not None}
                report['requests'].append(item)
                if req.method == 'GET' and req.post_data_buffer is None and (req.url.startswith(('blob:', 'data:')) or (u.hostname == '127.0.0.1' and u.port == server.server_port)):
                    r.continue_()
                else:
                    report['blockedRequests'].append(item)
                    r.abort()
            context.route('**/*', route)
            for surface, selectors in surfaces.items():
                print('Opening ' + surface + ' with native MiniLM classify/encode', flush=True)
                page = context.new_page()
                game = surface.split('-')[0]
                page.route('**/offline.js*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='// Private acceptance isolates site worker bootstrap.'))
                page.on('pageerror', lambda e, surface=surface: report['pageErrors'].append({'surface': surface, 'error': str(e)}))
                try:
                    page.goto(f'http://127.0.0.1:{server.server_port}/guides/{selectors[0]}', wait_until='networkidle')
                    page.wait_for_function("document.documentElement.dataset.guideChat==='ready'", timeout=30000)
                    helpers.open_surface(page, surface)
                    before_storage = page.evaluate(helpers.STORAGE)
                    for dialogue in dialogues[game]:
                        page.get_by_role('button', name='Clear chat', exact=True).filter(visible=True).click()
                        for index, turn in enumerate(dialogue['turns'], 1):
                            try:
                                item = send(page, surface, turn)
                            except Exception as exc:
                                item = {'text': turn['text'], 'expected': turn['expected'], 'passed': False, 'problems': [str(exc)]}
                            item.update(surface=surface, dialogueId=dialogue['id'], turn=index)
                            report['turns'].append(item)
                            if not item['passed']:
                                report['failures'].append({k: item[k] for k in ['surface', 'dialogueId', 'turn', 'text', 'problems']})
                            screenshot_name = None
                            if surface == 'ultima7' and item['passed'] and turn['expected']['decision'] == 'answer' and not any('ultima7-success' in path for path in report['screenshots']):
                                screenshot_name = 'ultima7-success.png'
                            if surface == 'starcraft' and dialogue['id'] == 'starcraft-knowledge-prerequisites':
                                screenshot_name = {1: 'starcraft-definition.png', 3: 'starcraft-java.png', 4: 'starcraft-definition-java-download.png'}.get(index)
                            if screenshot_name:
                                path = shots / screenshot_name
                                if screenshot_name == 'starcraft-definition-java-download.png':
                                    page.set_viewport_size({'width': 1280, 'height': 1800})
                                    page.get_by_role('button', name='Expand chat', exact=True).filter(visible=True).click()
                                page.screenshot(path=str(path))
                                if screenshot_name == 'starcraft-definition-java-download.png':
                                    page.keyboard.press('Escape')
                                    page.set_viewport_size({'width': 1280, 'height': 900})
                                report['screenshots'].append(str(path.relative_to(ROOT)))
                        print(surface + ' ' + dialogue['id'] + ': ' + str(sum(x['passed'] for x in report['turns'] if x['surface'] == surface and x['dialogueId'] == dialogue['id'])) + '/' + str(len(dialogue['turns'])) + ' passed', flush=True)
                    report['storageUnchanged'][surface] = before_storage == page.evaluate(helpers.STORAGE)
                    path = shots / (surface + '.png')
                    page.screenshot(path=str(path))
                    report['screenshots'].append(str(path.relative_to(ROOT)))
                except Exception as exc:
                    report['failures'].append({'surface': surface, 'stage': 'setup', 'error': str(exc)})
                finally:
                    report['workers'][surface] = page.evaluate('window.knowledgeIntentWorkers||[]')
                    report['storageWrites'][surface] = page.evaluate('window.fullAnswerStorageWrites||[]')
                    page.close()
            report['browser'] = browser.version
            context.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
        report['serverClosed'] = not thread.is_alive()
        report['sourceHashesAfter'] = hashes()
        report['sourceFilesUnchangedDuringRun'] = report['sourceHashesBefore'] == report['sourceHashesAfter']
        report['changedSourceFiles'] = [key for key, value in report['sourceHashesBefore'].items() if report['sourceHashesAfter'].get(key) != value]
        report['nativeIntentEvidence'] = {}
        for surface, workers in report['workers'].items():
            events = [event for worker in workers for event in worker['events']]
            embeddings = [event for event in events if event['type'] == 'embedding']
            report['nativeIntentEvidence'][surface] = {
                'workers': len(workers), 'ready': sum(e['type'] == 'ready' for e in events),
                'nativeModelReady': any(e.get('metadata', {}).get('realModelInference') is True for e in events),
                'classifications': sum(e['direction'] == 'send' and e['type'] == 'classify' for e in events),
                'classificationResults': sum(e['type'] == 'result' for e in events),
                'encodings': sum(e['direction'] == 'send' and e['type'] == 'encode' for e in events),
                'embeddingResults': len(embeddings),
                'validEmbeddings': bool(embeddings) and all(e['dimensions'] == 384 and e['allFinite'] and math.isfinite(e['norm']) and e['norm'] > 0 for e in embeddings)}
        writes = [{'surface': surface, **write} for surface, rows in report['storageWrites'].items() for write in rows if write['key'] != 'guide-assistant.preference.v1']
        expected_turns = sum(len(d['turns']) for surface in surfaces for d in dialogues[surface.split('-')[0]])
        report['boundaries'] = {
            'allSelectedTurnsRan': len(report['turns']) == expected_turns,
            'realIntentAndEncodingEverySurface': len(report['nativeIntentEvidence']) == len(surfaces) and all(e['nativeModelReady'] and e['classifications'] >= 1 and e['classificationResults'] >= 1 and e['encodings'] >= 1 and e['validEmbeddings'] for e in report['nativeIntentEvidence'].values()),
            'storageUnchanged': len(report['storageUnchanged']) == len(surfaces) and all(report['storageUnchanged'].values()),
            'noSavedGameWrites': not writes, 'noExternalRequests': not report['blockedRequests'],
            'noPageErrors': not report['pageErrors'],
            'onlyStaticGets': all(x['method'] == 'GET' and not x['hasBody'] for x in report['requests']),
            'sourceFilesUnchanged': report['sourceFilesUnchangedDuringRun'], 'serverClosed': report['serverClosed']}
        if not all(report['boundaries'].values()):
            report['failures'].append({'stage': 'boundaries', 'checks': report['boundaries'], 'savedGameWrites': writes})
        report['passedTurns'] = sum(t['passed'] for t in report['turns'])
        report['totalTurns'] = len(report['turns'])
        report['expectedTurns'] = expected_turns
        output.parent.mkdir(exist_ok=True)
        output.write_text(json.dumps(report, indent=2) + '\n')
        print(json.dumps({'report': str(output.relative_to(ROOT)), 'passedTurns': report['passedTurns'], 'totalTurns': report['totalTurns'], 'boundaries': report['boundaries'], 'failures': report['failures']}, indent=2), flush=True)
    return 1 if report['failures'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
