"""Replay fixed campaign oracles with the already approved local model.

No Worker fixture, installs or remote model fetches. The transparent Worker
observer calls the browser's original constructor and postMessage, while a
separate modelRuntime observer records resolved/rejected generation promises.
Factual routing and model inference are reported separately: the pinned model
chooses an approved sentence; source quotations remain program-selected.

python3 guides/tests/assistant/conversation-native-browser.py --tag first
Use --games to select games or --probe-only for the explicit native probes.
"""
import argparse
import hashlib
import json
import signal
import subprocess
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright
from browser_conversation_observer import ASSISTANT_OBSERVER

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = HERE / 'evidence'
PROFILE_PATH = ROOT / 'guides/local-assistant/profile.json'
PROFILE = json.loads(PROFILE_PATH.read_text())
SURFACES = {
    'albion': ('Albion.html', "activateAlbionSection('missions','auto');setWalkthroughAiActiveChapter('toronto-intro')", '#walkthrough-ai-input', '#walkthrough-ai-send', '#walkthrough-ai-body', '.guide-assistant-controls select'),
    'ultima5': ('Ultima5.html', "showUltima5Section('counsel')", '#seer-query', '#ask-seer', '#seer-response', '.guide-assistant-controls select'),
    'ultima6': ('Ultima6.html', "openSeerForQuest('act-i-liberating-the-shrines','sacrifice-minoc')", '#seer-query', '#ask-seer', '#seer-chat-messages', '#seer-spoiler-select'),
    'ultima7': ('Ultima7.html', None, '.sage-input', '.sage-send', '.sage-messages', '.sage-spoiler'),
    'alqadim': ('AlQadim.html', None, '#walkthrough-ai-input-tab', '#walkthrough-ai-send-tab', '#walkthrough-ai-body-tab', '#main-ai-wrapper select'),
    'starcraft': ('StarcraftBWAPI.html', None, '#sc-ai-input', '#sc-ai-send', '#sc-ai-chat', '#sc-assistant-spoiler'),
}
# These facts are authored from the named guide sources, not native replies.
PROBES = {
    'albion': {'seed': 'What does the Dreamshield do?', 'claim': 'Sleep Spores (20)', 'why': 'Why does it work that way?', 'basis': 'guides/js/Albion.js: items Dreamshield.effect'},
    'ultima5': {'seed': 'Who is Saduj?', 'claim': 'spy for Blackthorn', 'why': 'Why is he a spy?', 'basis': 'guides/js/Ultima5.js: COMPANIONS Saduj.Notes'},
    'ultima6': {'seed': 'Who is Ariana?', 'claim': 'short hair', 'why': 'Why is she cute?', 'basis': 'guides/js/Ultima6Atlas.js: npcs Ariana.description'},
    'ultima7': {'seed': 'Who is Spark?', 'claim': 'training points at double rate', 'why': 'Why does he learn so quickly?', 'basis': 'guides/js/Ultima7.js: companions Spark.notes'},
    'alqadim': {'seed': 'What does the Ship Orb do?', 'claim': 'corsair ship', 'why': 'How does it actually power the ship?', 'basis': 'guides/js/AlQadim.js: DB.keyItems Ship Orb.description'},
    'starcraft': {'seed': 'What is SCHNAIL?', 'claim': 'Integrated matchmaking system', 'why': 'Why is it called that?', 'basis': 'guides/StarcraftBWAPI.html: #schnail-setup features'},
}
# Record identities follow the adapters' declared entity/relation keys. The
# source files above establish the claims; no identity is inferred from prose.
PROBE_RECORDS = {
    'albion': 'albion:item:dreamshield:use',
    'ultima5': 'ultima5:narrative:saduj-identity:identity',
    'ultima6': 'ultima6:atlas:marker:Ariana:explanation',
    'ultima7': 'ultima7:companion:spark:explanation',
    'alqadim': 'alqadim:item:ship-orb:use',
    'starcraft': 'starcraft:schnail:features',
}
PROBE_ENTITIES = {
    'albion': 'albion:item:dreamshield', 'ultima5': 'ultima5:companion:saduj',
    'ultima6': 'ultima6:atlas:marker:Ariana', 'ultima7': 'ultima7:companion:spark',
    'alqadim': 'alqadim:item:ship-orb', 'starcraft': 'starcraft:schnail',
}
OBSERVER = r"""(() => {
    const OriginalWorker = window.Worker;
    window.nativeWorkerEvidence = [];
    window.Worker = class extends OriginalWorker {
        constructor(url, options) {
            super(url, options);
            const observed = String(url).includes('/assistant/model-worker.js');
            this.nativeEvidenceId = observed ? window.nativeWorkerEvidence.length + 1 : null;
            if (observed) {
                const record = {id:this.nativeEvidenceId, url:String(url), options, events:[]};
                window.nativeWorkerEvidence.push(record);
                this.addEventListener('message', event => {
                    const d=event.data;
                    if (['ready','result','error'].includes(d.type)) record.events.push({direction:'receive', ...d});
                });
                this.nativeEvidenceRecord=record;
            }
        }
        postMessage(data, ...rest) {
            if (this.nativeEvidenceRecord && ['load','generate'].includes(data.type)) {
                this.nativeEvidenceRecord.events.push({direction:'send',type:data.type,id:data.id,
                    kind:data.kind,modelProfile:data.profile?.id});
            }
            return super.postMessage(data, ...rest);
        }
    };
})();"""
RUNTIME_OBSERVER = r"""async () => {
    const {modelRuntime}=await import('/guides/js/assistant/model-runtime.js');
    window.nativeRuntimeEvidence=[];
    const generate=modelRuntime.generate.bind(modelRuntime);
    modelRuntime.generate=async packet => {
        const item={kind:packet.guard.kind,question:packet.question,currentTopic:packet.currentTopic,
            excerpts:packet.excerpts,ceiling:packet.ceiling,status:'pending',started:performance.now()};
        window.nativeRuntimeEvidence.push(item);
        try { item.wording=await generate(packet); item.status='resolved'; return item.wording; }
        catch(error) { item.status='rejected'; item.error=String(error); throw error; }
        finally { item.seconds=(performance.now()-item.started)/1000; delete item.started; }
    };
}"""


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--games', nargs='+', choices=list(SURFACES), default=list(SURFACES))
    parser.add_argument('--tag', default='latest')
    parser.add_argument('--port', type=int, default=8768)
    parser.add_argument('--probe-only', action='store_true')
    args = parser.parse_args()
    if not args.tag.replace('-', '').replace('_', '').isalnum():
        parser.error('tag must be letters, numbers, hyphens or underscores')
    OUT.mkdir(exist_ok=True)
    output = OUT / f'conversation-native-{args.tag}.json'
    if output.exists():
        parser.error(f'report already exists: {output}; use a new tag to preserve evidence')
    base = f'http://127.0.0.1:{args.port}'
    fixtures = {g: json.loads((HERE / 'conversations' / f'{g}.json').read_text())
                for g in args.games if (HERE / 'conversations' / f'{g}.json').exists()}
    campaign_ids = {f'{d["id"]}:{i+1}' for f in fixtures.values() for d in f['dialogues']
                    for i, _ in enumerate(d['turns'])}
    checked_assets = []
    for asset in PROFILE['assets']:
        path = PROFILE_PATH.parent / asset['path']
        assert path.is_file() and path.stat().st_size == asset['bytes'], path
        assert digest(path) == asset['sha256'], path
        checked_assets.append({'path': asset['path'], 'bytes': asset['bytes'], 'sha256': asset['sha256']})
    node = '/home/richard/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
    records_by_game = json.loads(subprocess.check_output([node, '--input-type=module', '-e',
        "import {allRecords} from './guides/tests/assistant/load-records.mjs'; process.stdout.write(JSON.stringify(allRecords));"],
        cwd=ROOT, text=True))
    watched = sorted((ROOT / 'guides/js/assistant').rglob('*.js')) + [PROFILE_PATH, Path(__file__).resolve()]
    watched += sorted((ROOT / 'guides/js').glob('*.js'))
    watched += sorted((ROOT / 'guides/data/assistant').glob('*.json'))
    watched += [ROOT / 'guides' / spec[0] for spec in SURFACES.values()]
    watched += [HERE / 'browser_conversation_observer.py', HERE / 'conversation-checks.mjs', HERE / 'load-records.mjs']
    watched += [HERE / 'conversations' / f'{g}.json' for g in fixtures]
    hashes = lambda: {str(p.relative_to(ROOT)): digest(p) for p in watched}
    report = {'realModel': True, 'workerFixture': False, 'profileId': PROFILE['id'],
        'modelRevision': PROFILE['revision'], 'modelBytes': PROFILE['totalBytes'],
        'runtimeLimits': {'backend': PROFILE['backend'], 'dtype': PROFILE['dtype'],
            'maxInputTokens': PROFILE['maxInputTokens'], 'generateTimeoutSeconds': 20,
            'wasmThreads': 1, 'remoteModelsAllowed': False},
        'verifiedExistingAssets': checked_assets, 'sourceHashesBefore': hashes(),
        'scope': 'Explicit native and guard probes only' if args.probe_only else 'Full authored campaign plus explicit native and guard probes',
        'limitations': ['The model selects a constrained approved sentence; it does not infer game facts.',
            'This run does not establish untouched holdout accuracy or exhaustive game knowledge.',
            'Service workers are blocked to isolate native model and UI checks; offline checks use already loaded pages.'],
        'oracleReviewNotes': ['The preserved transition-probes run incorrectly forbade Spark training text after lowering help. '
            'The adapter authorizes a separate Nudge identity variant containing that fact. Transition assertions now forbid '
            'the stale native frame and exact related quotation; New topic also forbids the old subject claim. '
            'No production behavior or factual campaign expectation changed for this correction.',
            'The preserved interrupted full-first and stable full-final runs expected every rephrase to invoke native framing. '
            'Ultima V, Ultima VII and StarCraft instead offer explicit clarification choices for Can you put that briefly? '
            'after their unsupported why question. The engine deliberately keeps such choices in the deterministic route. '
            'Those dedicated probes now assert that clarification, no old quoted subject fact, and no native call; '
            'Albion, Ultima VI and Al-Qadim still require real rephrase inference. '
            'No factual corpus expectation changed.'],
        'games': {}, 'turns': [], 'checks': [], 'pageErrors': [], 'blockedExternalRequests': [], 'requests': []}

    def check(label, ok, **details):
        report['checks'].append({'check': label, 'passed': bool(ok), **details})

    def save():
        report['sourceHashesAfter'] = hashes()
        report['sourceFilesUnchangedDuringRun'] = report['sourceHashesAfter'] == report['sourceHashesBefore']
        report['passedTurns'] = sum(t['passed'] for t in report['turns'])
        report['turnCount'] = len(report['turns'])
        report['inFlightTransitionSubmissions'] = sum(len(g.get('nativeContextTransitions', [])) for g in report['games'].values())
        report['inFlightTransitionSubmissions'] += sum(bool(g.get('guideContextTransition')) for g in report['games'].values())
        report['visitorSubmissionCount'] = report['turnCount'] + report['inFlightTransitionSubmissions']
        campaign_turns = [t for t in report['turns'] if t['campaign']]
        report['campaignDialogueCount'] = sum(g.get('campaignDialogues', 0) for g in report['games'].values())
        report['campaignTurnCount'] = len(campaign_turns)
        report['campaignPassedTurns'] = sum(t['passed'] for t in campaign_turns)
        report['campaignFactualTurnCount'] = sum(t['expected']['decision'] == 'answer' for t in campaign_turns)
        report['campaignPassingFactualTurns'] = sum(t['expected']['decision'] == 'answer' and t['passed'] for t in campaign_turns)
        report['nativeInferenceSuccessCount'] = sum(g.get('nativeInferenceSuccesses', 0) for g in report['games'].values())
        report['displayedModelWordingCount'] = sum(g.get('nativeDisplayedTurns', 0) for g in report['games'].values())
        report['discardedNativeInferenceCount'] = sum(g.get('nativeDiscardedAfterContextChange', 0) for g in report['games'].values())
        report['deterministicTurnCount'] = sum(not t['nativeCalls'] for t in report['turns'])
        report['failedTurns'] = [t['id'] for t in report['turns'] if not t['passed']]
        output.write_text(json.dumps(report, indent=2) + '\n')

    stop_requested = False

    def stop_at_boundary(_signal, _frame):
        nonlocal stop_requested
        stop_requested = True

    signal.signal(signal.SIGINT, stop_at_boundary)
    signal.signal(signal.SIGTERM, stop_at_boundary)

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
            report['browser'] = browser.version
            context = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 1000})
            context.add_init_script(script=OBSERVER)
            context.add_init_script(script=ASSISTANT_OBSERVER)

            def route(r):
                url = r.request.url
                if url.startswith(('blob:', 'data:')) or urlparse(url).hostname == '127.0.0.1':
                    r.continue_()
                else:
                    report['blockedExternalRequests'].append(url.split('?')[0])
                    r.abort()

            context.route('**/*', route)
            context.on('request', lambda r: report['requests'].append({'url': r.url.split('?')[0],
                'method': r.method, 'hasBody': r.post_data_buffer is not None}))
            for game in args.games:
                spec = SURFACES[game]
                file, open_js, inp, send, body, help_sel = spec
                page = context.new_page()
                page.on('pageerror', lambda error, game=game: report['pageErrors'].append({'game': game, 'error': str(error)}))
                page.goto(f'{base}/guides/{file}', wait_until='networkidle')
                # First game uses the actual consent button. Later games reuse
                # this same approved profile and browser-origin model cache.
                if page.locator('#guide-assistant-consent[open]').is_visible():
                    page.get_by_role('button', name='Enable chat', exact=True).click()
                page.wait_for_function("document.documentElement.dataset.guideChat==='ready'", timeout=120000)
                page.evaluate(RUNTIME_OBSERVER)
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
                page.locator(inp).wait_for(state='visible')
                page.wait_for_function('window.campaignObservedAssistants.length > 0')
                records = records_by_game.get(game)
                if game == 'starcraft':
                    records = page.evaluate('''async () => {
                        const {buildStarcraftRecords}=await import('/guides/js/assistant/adapters/starcraft.js');
                        const overlay=await (await fetch('/guides/data/assistant/starcraft.json')).json();
                        return buildStarcraftRecords(document,overlay);
                    }''')
                page.evaluate('(records)=>{window.campaignSourceRecords=records}', records)
                storage_js = 'JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))'
                before_storage = page.evaluate(storage_js)
                game_report = {'fixturePresent': game in fixtures, 'campaignDialogues': 0, 'campaignTurns': 0,
                    'nativeProbeBasis': PROBES[game]['basis']}
                report['games'][game] = game_report

                def reset(spoiler):
                    page.get_by_role('button', name='New topic', exact=True).filter(visible=True).first.click()
                    page.locator(help_sel).first.select_option(spoiler)

                def ask(case_id, turn, spoiler, offline=False, native=None):
                    spoiler = turn.get('options', {}).get('spoiler', spoiler)
                    page.locator(help_sel).first.select_option(spoiler)
                    before = page.locator(body).inner_text()
                    n = page.evaluate('nativeRuntimeEvidence.length')
                    started = time.monotonic()
                    page.locator(inp).fill(turn['text'])
                    page.locator(send).click()
                    page.wait_for_function('''([sel,before,text])=>{
                        const root=document.querySelector(sel), nodes=[...root.querySelectorAll('.guide-assistant-message')];
                        const last=nodes.at(-1);
                        return root.innerText!==before && last?.classList.contains('ai') && last.dataset.decision
                            && last.dataset.decision!=='pending' && nodes.at(-2)?.textContent.includes(text);
                    }''', arg=[body, before, turn['text']], timeout=35000)
                    block = page.locator(body + ' .guide-assistant-message.ai').last
                    text, rendered = block.locator('.ga-msg-text').inner_text(), block.inner_text()
                    decision = block.get_attribute('data-decision')
                    evidence = page.evaluate('(n)=>nativeRuntimeEvidence.slice(n)', n)
                    expected = turn['expected']
                    observed = page.evaluate('''async ({game,expected,spoiler,historyAbsent}) => {
                        const a=window.campaignObservedAssistants.find(a=>a.inspect().gameId===game);
                        const history=a.getHistory(), reply=history.at(-1);
                        const {checkConversationReply}=await import('/guides/tests/assistant/conversation-checks.mjs');
                        const {authorize}=await import('/guides/js/assistant/policy.js');
                        return {reply,active:a.inspect().active,problems:checkConversationReply(reply,
                            {...expected,historyAbsent},{records:window.campaignSourceRecords,spoiler,authorize,history})};
                    }''', {'game': game, 'expected': expected, 'spoiler': spoiler, 'historyAbsent': turn.get('historyAbsent', [])})
                    problems = observed['problems']
                    if decision != observed['reply']['decision'] or text != observed['reply']['text']:
                        problems.append('rendered reply differs from production assistant history')
                    wanted = expected['decision']
                    if wanted == 'no-answer':
                        if decision not in ['clarify', 'decline', 'conflict']:
                            problems.append(f'expected no answer, got {decision}')
                    elif decision != wanted:
                        problems.append(f'expected {wanted}, got {decision}')
                    for phrase in expected.get('contains', []):
                        if phrase.lower() not in text.lower():
                            problems.append('missing ' + phrase)
                    for phrase in expected.get('absent', []):
                        if phrase.lower() in text.lower():
                            problems.append('forbidden ' + phrase)
                    for phrase in turn.get('historyAbsent', []):
                        if phrase.lower() in page.locator(body).inner_text().lower():
                            problems.append('hidden history leaked ' + phrase)
                    if expected.get('conflict') and not (
                        ('sources disagree' in text.lower() or 'sources conflict' in text.lower()) and 'conflicting' in rendered.lower()):
                        problems.append('known conflict missing warning/provenance')
                    if wanted == 'answer' or native is True:
                        if not block.locator('.ga-msg-source').count():
                            problems.append('missing visible source')
                        source = expected.get('source')
                        if source == 'guide' and ('Source: existing guide' not in rendered or 'outside research:' in text):
                            problems.append('incorrect guide provenance')
                        if source == 'research' and not ('outside research:' in text and 'Outside research (not in this guide):' in rendered and 'https://' in rendered):
                            problems.append('missing research citation')
                    if native is True:
                        if len(evidence) != 1 or evidence[0]['status'] != 'resolved':
                            problems.append('expected one successful native generation')
                        elif not text.startswith(evidence[0]['wording'] + '\n\n'):
                            problems.append('successful native wording was not used')
                        if observed['reply'].get('fallbackOrigin') != 'model-framing':
                            problems.append('reply was not accepted model framing')
                        if evidence and [e['recordId'] for e in evidence[0]['excerpts']] != [PROBE_RECORDS[game]]:
                            problems.append('native quotation came from unexpected record')
                        for excerpt in evidence[0]['excerpts'] if evidence else []:
                            if f'“{excerpt["text"]}” [{excerpt["id"]}]' not in text:
                                problems.append('native reply did not preserve exact authorized quotation')
                    elif native is False and evidence:
                        problems.append('restricted or sourced turn unexpectedly invoked the model')
                    if any(e['status'] != 'resolved' for e in evidence):
                        problems.append('native generation did not resolve; program fallback is not native proof')
                    item = {'id': case_id, 'campaign': case_id in campaign_ids, 'gameId': game, 'question': turn['text'], 'spoiler': spoiler,
                        'expected': expected, 'decision': decision, 'text': rendered,
                        'recordIds': observed['reply']['recordIds'], 'sources': observed['reply']['sources'],
                        'fallbackOrigin': observed['reply'].get('fallbackOrigin'), 'activeContext': observed['active'],
                        'nativeCalls': evidence, 'seconds': time.monotonic()-started,
                        'offline': offline, 'passed': not problems, 'problems': problems}
                    report['turns'].append(item)
                    return spoiler

                if not args.probe_only and game in fixtures:
                    for dialogue in fixtures[game]['dialogues']:
                        spoiler = dialogue['spoiler']
                        reset(spoiler)
                        for index, turn in enumerate(dialogue['turns']):
                            spoiler = ask(f'{dialogue["id"]}:{index+1}', turn, spoiler)
                        game_report['campaignDialogues'] += 1
                        game_report['campaignTurns'] += len(dialogue['turns'])
                    print(f'{game}: full fixed campaign replayed ({game_report["campaignTurns"]} turns)', flush=True)
                probe = PROBES[game]
                seed = {'text': probe['seed'], 'expected': {'decision': 'answer', 'contains': [probe['claim']],
                    'entityIds': [PROBE_ENTITIES[game]], 'recordIds': [PROBE_RECORDS[game]], 'source': 'guide'}}
                why = {'text': probe['why'], 'expected': {'decision': 'no-answer',
                    'contains': ['Related guide text (may not answer your question):', probe['claim'], '[G1]', '“'], 'source': 'guide'}}
                reset('direct')
                ask(f'{game}-native-seed', seed, 'direct', native=False)
                ask(f'{game}-native-reason', why, 'direct', native=True)
                if game in {'ultima5', 'ultima7', 'starcraft'}:
                    ask(f'{game}-native-rephrase', {'text': 'Can you put that briefly?',
                        'expected': {'decision': 'clarify', 'contains': ['What would you like to know'],
                            'absent': [probe['claim'], 'Guide text:']}}, 'direct', native=False)
                else:
                    ask(f'{game}-native-rephrase', {'text': 'Can you put that briefly?',
                        'expected': {'decision': 'no-answer', 'contains': ['Guide text:', probe['claim'], '[G1]', '“'],
                            'source': 'guide'}}, 'direct', native=True)
                if game == 'ultima6':
                    ask(f'{game}-native-detail', {'text': 'What colour are her eyes?',
                        'expected': {'decision': 'no-answer', 'contains': ['Related guide text (may not answer your question):',
                            probe['claim'], '[G1]', '“'], 'source': 'guide'}}, 'direct', native=True)
                # A fixed false premise must not be laundered through inference.
                ask(f'{game}-native-seed-again', seed, 'direct', native=False)
                ask(f'{game}-native-restriction', {'text': 'Why does it work that way on Mars?',
                    'expected': {'decision': 'no-answer', 'absent': [probe['claim']]}}, 'direct', native=False)
                ask(f'{game}-native-carried-restriction', {'text': 'Why does it work that way?',
                    'expected': {'decision': 'no-answer', 'absent': [probe['claim']]}}, 'direct', native=False)
                ask(f'{game}-native-reset', {'text': 'reset topic', 'expected': {'decision': 'reset'}}, 'direct', native=False)
                ask(f'{game}-native-no-referent', {'text': 'Why does it work that way?',
                    'expected': {'decision': 'no-answer', 'absent': [probe['claim']]}}, 'direct', native=False)
                # Change policy/topic after an actual inference request has
                # started. The real model still resolves, but its old quote
                # cannot be attached to the changed conversation.
                transitions = []
                for transition in ['lower-help', 'new-topic']:
                    reset('direct')
                    ask(f'{game}-native-{transition}-seed', seed, 'direct', native=False)
                    count = page.evaluate('nativeRuntimeEvidence.length')
                    page.locator(inp).fill(probe['why'])
                    page.locator(send).click()
                    page.wait_for_function('(n)=>nativeRuntimeEvidence.length===n+1', arg=count)
                    if transition == 'lower-help':
                        page.locator(help_sel).first.select_option('gentle')
                    else:
                        page.get_by_role('button', name='New topic', exact=True).filter(visible=True).first.click()
                    page.wait_for_function('(n)=>nativeRuntimeEvidence[n].status!=="pending"', arg=count, timeout=35000)
                    page.wait_for_function('(s)=>!document.querySelector(s).disabled', arg=send)
                    visible = page.locator(body).inner_text()
                    observed = page.evaluate('(n)=>nativeRuntimeEvidence[n]', count)
                    transitions.append({'transition': transition, 'nativeCall': observed, 'visibleAfter': visible})
                    # Lowering can re-render a sourced seed from its separately
                    # authorized Nudge variant (Spark is one such example).
                    # The stale model sentence/quotation, not every shared seed
                    # word, must disappear. New topic must forget the seed too.
                    old_quote_absent = all(f'“{e["text"]}”' not in visible for e in observed['excerpts'])
                    check(game + ': in-flight inference discarded after ' + transition,
                        observed['status'] == 'resolved' and observed['wording'] not in visible
                        and old_quote_absent and 'Related guide text (may not answer your question):' not in visible
                        and 'Looking at the guide…' not in visible
                        and (transition != 'new-topic' or probe['claim'].lower() not in visible.lower()))
                game_report['nativeContextTransitions'] = transitions
                # No reloading or fixture: actual already loaded native worker
                # answers locally when this context is disconnected.
                reset('direct')
                context.set_offline(True)
                ask(f'{game}-native-offline-seed', seed, 'direct', offline=True, native=False)
                ask(f'{game}-native-offline-reason', why, 'direct', offline=True, native=True)
                context.set_offline(False)
                # Exercise the owning guide's real chapter/quest/topic controls
                # while native inference is running, then test its referent.
                reset('direct')
                ask(f'{game}-native-guide-context-seed', seed, 'direct', native=False)
                inspect_js = '(g)=>campaignObservedAssistants.find(a=>a.inspect().gameId===g).inspect()'
                old_context = page.evaluate(inspect_js, game)
                count = page.evaluate('nativeRuntimeEvidence.length')
                page.locator(inp).fill(probe['why'])
                page.locator(send).click()
                page.wait_for_function('(n)=>nativeRuntimeEvidence.length===n+1', arg=count)
                intermediate = None
                if game == 'albion':
                    page.evaluate("setWalkthroughAiActiveChapter('maini')")
                elif game == 'ultima5':
                    page.evaluate("showUltima5Section('overview')")
                    intermediate = page.evaluate(inspect_js, game)
                    page.evaluate("showUltima5Section('counsel')")
                elif game == 'ultima6':
                    page.evaluate("openSeerForQuest('act-i-liberating-the-shrines','valor-jhelom')")
                elif game == 'ultima7':
                    page.locator('#close-ai-modal').click()
                    page.locator('#main-quest-accordion .quest-item').nth(1).click()
                    page.locator('.get-main-quest-hint').nth(1).click()
                elif game == 'alqadim':
                    page.evaluate("if(!document.getElementById('chapter-content-3').classList.contains('hidden'))toggleChapter(3);toggleChapter(3)")
                else:
                    page.locator('#sc-assistant-topic').select_option('bwai')
                page.locator(inp).wait_for(state='visible')
                page.wait_for_function('(n)=>nativeRuntimeEvidence[n].status!=="pending"', arg=count, timeout=35000)
                page.wait_for_function('(s)=>!document.querySelector(s).disabled', arg=send)
                new_context = page.evaluate(inspect_js, game)
                native_context_call = page.evaluate('(n)=>nativeRuntimeEvidence[n]', count)
                current = next(c for c in new_context['contexts'] if c['id'] == new_context['active'])
                changed = new_context['active'] != old_context['active'] or (
                    intermediate is not None and intermediate['active'] != old_context['active'])
                visible = page.locator(body).inner_text()
                check(game + ': actual guide context clears old subject/frame', changed and not current['entities'] and not current['frame'])
                check(game + ': actual guide context discards in-flight native reply',
                    native_context_call['status'] == 'resolved' and native_context_call['wording'] not in visible
                    and all(f'“{e["text"]}”' not in visible for e in native_context_call['excerpts'])
                    and 'Looking at the guide…' not in visible)
                game_report['guideContextTransition'] = {'before': old_context, 'intermediate': intermediate,
                    'after': new_context, 'nativeCall': native_context_call, 'visibleAfter': visible}
                ask(f'{game}-native-guide-context-pronoun', {'text': 'Why is it called that?',
                    'expected': {'decision': 'no-answer', 'absent': [probe['claim']]}}, 'direct')
                ask(f'{game}-native-guide-context-recovery', seed, 'direct', native=False)
                # Source-bound regressions for the final narrow ownership
                # hypothetical change. Facts come from the indexed equipment
                # effects and regalia outcomes, independently of the replies.
                guard_scenarios = []
                if game == 'albion':
                    pistol = {'text': 'What does the Pistol do?', 'expected': {'decision': 'answer',
                        'contains': ['uses Canisters'], 'entityIds': ['albion:item:pistol'],
                        'recordIds': ['albion:item:pistol:use'], 'source': 'guide'}}
                    pistol_use = {**pistol, 'text': 'How do I use it?'}
                    no_weapon = {'decision': 'no-answer', 'absent': ['uses Canisters', 'Sleep Spores']}
                    guard_scenarios = [
                        ('same-owner', [
                            {'text': 'Where is Pistol?', 'expected': {'decision': 'answer',
                                'contains': ['Toronto COM room'], 'entityIds': ['albion:item:pistol'],
                                'recordIds': ['albion:item:pistol:location'], 'source': 'guide'}},
                            {'text': 'If I have Pistol, what next?', 'expected': {'decision': 'clarify'}},
                            pistol_use]),
                        ('new-owner', [pistol,
                            {'text': 'If I have Dreamshield, what next?', 'expected': no_weapon},
                            {'text': 'How do I use it?', 'expected': no_weapon}, seed]),
                        ('qualified-owner', [pistol,
                            {'text': 'If I have Pistol on Mars, what next?', 'expected': no_weapon},
                            {'text': 'How do I use it?', 'expected': no_weapon}, pistol]),
                    ]
                    game_report['guardProbeBasis'] = 'guides/js/Albion.js DB.equipment Pistol.effect/location; Dreamshield.effect; original hypothetical-not-report dialogue'
                elif game == 'ultima5':
                    sceptre = {'text': 'What does the Sceptre do?', 'expected': {'decision': 'answer',
                        'contains': ['dispel every magical field'], 'entityIds': ['ultima5:item:sceptre'],
                        'recordIds': ['ultima5:item:sceptre:use'], 'source': 'guide'}}
                    crown = {'text': 'What does the Crown do?', 'expected': {'decision': 'answer',
                        'contains': ['Protection from enemy magic'], 'entityIds': ['ultima5:item:crown'],
                        'recordIds': ['ultima5:item:crown:use'], 'source': 'guide'}}
                    no_regalia = {'decision': 'no-answer', 'absent': ['dispel every magical field', 'Protection from enemy magic']}
                    guard_scenarios = [
                        ('new-conditional-target', [sceptre,
                            {'text': 'Where is the Crown only if I have no keys?', 'expected': no_regalia},
                            {'text': 'What does it do?', 'expected': no_regalia}, crown]),
                        ('restricted-target', [sceptre,
                            {'text': 'Where is the Crown without a key?', 'expected': no_regalia},
                            {'text': 'What does it do?', 'expected': no_regalia}, crown]),
                        ('restricted-multipart', [sceptre,
                            {'text': 'Where is the Crown without a key and what does it do?', 'expected': no_regalia},
                            crown]),
                    ]
                    game_report['guardProbeBasis'] = 'guides/js/Ultima5.js ultima5GrandQuestChapters regalia-sceptre.outcome and regalia-crown.outcome'
                game_report['guardScenarioCount'] = len(guard_scenarios)
                for scenario, turns in guard_scenarios:
                    reset('direct')
                    claims_before = page.evaluate(inspect_js, game)['claimCount']
                    for index, turn in enumerate(turns):
                        ask(f'{game}-guard-{scenario}:{index+1}', turn, 'direct', native=False)
                    check(game + ': hypothetical/restriction progress-neutral ' + scenario,
                        page.evaluate(inspect_js, game)['claimCount'] == claims_before)
                check(game + ': local storage byte-identical', before_storage == page.evaluate(storage_js))
                workers = page.evaluate('nativeWorkerEvidence')
                runtime = page.evaluate('nativeRuntimeEvidence')
                game_report['workers'] = workers
                game_report['nativeRuntimeCalls'] = runtime
                sent = [e for w in workers for e in w['events'] if e['direction'] == 'send' and e['type'] == 'generate']
                results = [e for w in workers for e in w['events'] if e['direction'] == 'receive' and e['type'] == 'result']
                worker_errors = [e for w in workers for e in w['events'] if e['direction'] == 'receive' and e['type'] == 'error']
                check(game + ': real configured worker became ready', len(workers) == 1 and any(
                    e['type'] == 'ready' for e in workers[0]['events']))
                check(game + ': runtime calls match native worker inference requests/results', len(runtime) == len(sent) == len(results) and not worker_errors,
                    runtimeCalls=len(runtime), workerRequests=len(sent), workerResults=len(results), workerErrors=worker_errors)
                game_report['nativeInferenceSuccesses'] = len(results)
                game_report['nativeDisplayedTurns'] = sum(t['gameId'] == game and bool(t['nativeCalls'])
                    and t['fallbackOrigin'] == 'model-framing'
                    and t['passed'] for t in report['turns'])
                game_report['nativeDiscardedAfterContextChange'] = sum(
                    t['nativeCall']['status'] == 'resolved' for t in transitions) + (native_context_call['status'] == 'resolved')
                game_report['deterministicTurnCount'] = sum(t['gameId'] == game and not t['nativeCalls'] for t in report['turns'])
                game_report['progressUnchanged'] = before_storage == page.evaluate(storage_js)
                print(f'{game}: {len(results)} native inference results; {game_report["deterministicTurnCount"]} deterministic turns', flush=True)
                page.close()
                save()
                if stop_requested:
                    report['cancelledAtGameBoundary'] = True
                    break
            check('No uncaught page errors', not report['pageErrors'])
            # Existing page decoration may attempt third party requests. Every
            # such attempt is blocked, recorded, and not a question transmission.
            check('All observed requests static GET/HEAD without bodies', all(
                r['method'] in ['GET', 'HEAD'] and not r['hasBody'] for r in report['requests']))
            check('No external assistant/model endpoint attempted', not any(
                any(part in u.lower() for part in ['huggingface', 'api.openai', 'llm.php'])
                for u in report['blockedExternalRequests']))
            check('All requested games have campaign fixtures', args.probe_only or set(fixtures) == set(args.games))
            check('All requested games completed native replay', set(report['games']) == set(args.games))
            check('Reviewed source snapshots unchanged during native replay', hashes() == report['sourceHashesBefore'])
            browser.close()
    except BaseException as error:
        report['fatalError'] = repr(error)
        raise
    finally:
        save()
        server.shutdown()
        server.server_close()
        print(json.dumps({'report': str(output), 'turnCount': report['turnCount'], 'passedTurns': report['passedTurns'],
            'failedTurns': report['failedTurns'], 'failedChecks': [c for c in report['checks'] if not c['passed']],
            'fatalError': report.get('fatalError')}, indent=2), flush=True)
    assert not report['failedTurns'] and all(c['passed'] for c in report['checks']), 'See dedicated native evidence report'


if __name__ == '__main__':
    main()
