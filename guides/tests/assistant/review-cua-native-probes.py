"""Adjudicate local CUA exports against untouched frozen dialogue oracles.

Usage: python guides/tests/assistant/review-cua-native-probes.py --tag UNIQUE \\
    --probe ultima7=FILE --probe ultima5=FILE --probe albion=FILE
Use --probe alqadim-walkthrough=FILE to identify the second AlQadim surface.
Use --dataset to disambiguate suites when an exact question sequence occurs in
more than one frozen dataset. Vectors stay in ignored raw exports; tracked
evidence stores inference metadata and complete answer comparisons.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE))
spec = importlib.util.spec_from_file_location('probe_oracles', HERE / 'knowledge-browser.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

GAMES = {'ultima5', 'ultima6', 'ultima7', 'alqadim', 'albion', 'starcraft'}
SURFACE_GAMES = {game: game for game in GAMES}
SURFACE_GAMES['alqadim-walkthrough'] = 'alqadim'
SUITES = {
    'corpus': lambda game: HERE/'knowledge'/f'{game}-cases.json',
    'source-first': lambda game: HERE/'knowledge-source-first-96-20261025.json',
    'observed-native': lambda game: HERE/'knowledge-blind-cases.json',
    'observed-fresh': lambda game: HERE/'knowledge-fresh-cases-20261025.json',
    'observed-independent': lambda game: HERE/'knowledge-independent-all-20261025.json',
    'semantic13': lambda game: HERE/'cua-semantic-smoke-13.json',
}
CONTROLS = {
    'How do I finish Courage test in two turns?',
    'How do I finish Quantum test?',
    'How do I finish Courage test without the Black Sword?',
    'Which seven party members does the recommended party use?',
    'How do I reach Mariah for assassination?',
    'How do I reach Mariah for recruitment in the 2026 remaster edition?',
    'What makes Animal 3 immune?',
    'What makes radioactive Animal 3 dangerous?',
    'What makes Animal 3 dangerous in the 2026 remaster edition?',
}


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def choices_for(game, requested):
    choices = []
    for suite, path_for in SUITES.items():
        if requested != ['auto'] and suite not in requested:
            continue
        data = read(path_for(game))
        choices.extend((suite, d) for d in data['dialogues'] if d.get('gameId', data.get('gameId')) == game)
    return choices


def check(turn, actual, previous_actual=None):
    expected = turn['expected']
    problems = []
    branches = []
    if expected['decision'] == 'answer':
        if actual['decision'] != 'answer':
            problems.append('Expected answer; observed ' + str(actual['decision']))
        branches = [base.check_answer_branch(branch, expected, actual['rendered'], actual['citations'])
                    for branch in [expected] + expected.get('alternativeAnswers', [])]
        if not any(not result for result in branches):
            problems.extend(min(branches, key=len))
    elif actual['decision'] == 'answer':
        problems.append('Expected non-answer; observed factual answer')
    else:
        for value in expected.get('contains', []):
            if value.casefold() not in actual['rendered'].casefold():
                problems.append('Missing fixed answer substring: ' + value)
    for value in expected.get('notContains', []):
        if value.casefold() in actual['rendered'].casefold():
            problems.append('Forbidden answer substring: ' + value)
    if turn.get('assertSameReplyAsPrevious'):
        if previous_actual is None:
            problems.append('Full-answer repeat has no previous reply in this conversation')
        else:
            for field in ('decision', 'rendered', 'citations', 'links'):
                if actual.get(field) != previous_actual.get(field):
                    problems.append('Smaller-hint reply differs from previous full answer: ' + field)
    return {**actual, 'expected': expected, 'passed': not problems, 'problems': list(dict.fromkeys(problems)),
            'answerBranchProblems': branches}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tag', required=True)
    parser.add_argument('--probe', action='append', required=True, metavar='SURFACE=FILE')
    parser.add_argument('--dataset', action='append', choices=['auto', *SUITES], default=None,
                        help='Restrict oracle matching to these suites; default auto matches all and flags ambiguity.')
    args = parser.parse_args()
    if not args.tag.replace('-', '').replace('_', '').isalnum():
        parser.error('Invalid unique tag')
    requested = ['auto'] if not args.dataset or 'auto' in args.dataset else args.dataset
    output = HERE / 'evidence' / f'knowledge-cua-native-{args.tag}.json'
    if output.exists():
        parser.error('Report exists; preserve prior evidence with a new tag')
    baseline_full_path = HERE / 'evidence/knowledge-browser-terra-20261029-frozen-source-01.json'
    baseline_first_path = HERE / 'evidence/knowledge-blind-browser-source-first-terra-frozen-source-20261029-01.json'
    baselines = {'corpus': read(baseline_full_path), 'source-first': read(baseline_first_path)}
    semantic_path = HERE/'cua-semantic-smoke-13.json'
    semantic_data = read(semantic_path)
    semantic_oracles = semantic_data['oracles']
    narrative_path = HERE/'narrative-all-games-cases.json'
    narrative_cases = read(narrative_path)
    if hashlib.sha256(narrative_path.read_bytes()).hexdigest() != semantic_data['oracleFixture']['sha256']:
        parser.error('Frozen narrative oracle fixture hash changed; regenerate semantic test fixture only after review')
    if sum(len(dialogue['turns']) for dialogue in semantic_data['dialogues']) != semantic_data['assertionCount']:
        parser.error('Semantic13 dialogue turn count does not match its frozen assertion count')
    for game, case in semantic_oracles.items():
        original = next((item for item in narrative_cases
                         if item['gameId'] == game and item['question'] == case['question']), None)
        if original is None or any(case.get(field) != original.get(field)
                                   for field in ('gameId', 'question', 'spoiler', 'recordId', 'contains')):
            parser.error('Semantic13 source oracle no longer matches frozen narrative fixture for '+game)
        if case.get('sourceWitness', {}).get('recordId') != case.get('recordId'):
            parser.error('Semantic13 source witness ID does not match the frozen record ID for '+game)
        if case.get('spoiler') != 'direct' or case.get('authorization') != {'gentle': False, 'direct': True}:
            parser.error('Semantic13 source witness is not the exact frozen direct-only source for '+game)
        expected = case.get('expected', {})
        witness_source = case.get('sourceWitness', {}).get('source', {})
        if expected.get('decision') != 'answer' or expected.get('contains') != original.get('contains'):
            parser.error('Semantic13 expected answer criteria differ from the frozen narrative oracle for '+game)
        if witness_source.get('review') == 'external-research':
            references = witness_source.get('references', [])
            expected_sources = [{'file': ref['url'], 'locator': ref['label'], 'review': 'external-research'}
                                for ref in references]
            if not references or expected.get('allSources') != expected_sources:
                parser.error('Semantic13 external citation oracle differs from its frozen source references for '+game)
        elif expected.get('source') != {'file': witness_source.get('file'), 'locator': witness_source.get('locator')}:
            parser.error('Semantic13 local citation oracle differs from its frozen source witness for '+game)
    report = {'schemaVersion': 2, 'kind': 'focused-cua-native-production-ui-adjudication', 'tag': args.tag,
              'requestedDatasets': requested,
              'limitations': ['Focused CUA probe, not a rerun of the full Python acceptance harness.',
                              'Existing approved generative-worker fixture; native MiniLM classify and encode.',
                              'Native generative performance, semantic smoke, and complete suite coverage are not established unless reported.',
                              'CSP limits connections to the isolated local origin; exhaustive request interception was not measured.',
                              'Internal fact IDs are not proven by visible UI citations.'],
              'baselineReports': {'corpus': str(baseline_full_path.relative_to(ROOT)),
                                  'source-first': str(baseline_first_path.relative_to(ROOT))},
              'semantic13': {'path': str(semantic_path.relative_to(ROOT)),
                             'sha256': hashlib.sha256(semantic_path.read_bytes()).hexdigest(),
                             'assertionCount': semantic_data['assertionCount'],
                             'oracleFixture': semantic_data['oracleFixture']},
              'probes': [], 'turns': [], 'controls': [], 'incompleteConversations': [],
              'changedComparedReplyRows': [], 'coverage': {}, 'known_failures': [], 'incomplete': False}
    seen_surfaces = set()
    for item in args.probe:
        if '=' not in item:
            parser.error('Expected SURFACE=FILE')
        surface, file = item.split('=', 1)
        if surface not in SURFACE_GAMES or surface in seen_surfaces:
            parser.error('Expected one probe per supported guide surface: '+', '.join(SURFACE_GAMES))
        seen_surfaces.add(surface)
        game = SURFACE_GAMES[surface]
        path = Path(file).resolve()
        raw = read(path)
        required_inputs = [HERE/'cua-native-probe-server.py', HERE/'review-cua-native-probes.py',
                           HERE/'knowledge-browser.py', HERE/'cua-semantic-smoke-13.json',
                           HERE/'browser-consent-fixture.js', HERE/'evidence/conversation-starcraft-source-records.json',
                           HERE/'narrative-all-games-cases.json', HERE/'knowledge-source-first-96-20261025.json',
                           HERE/'knowledge-blind-cases.json', HERE/'knowledge-fresh-cases-20261025.json',
                           HERE/'knowledge-independent-all-20261025.json', HERE/'knowledge'/f'{game}-cases.json',
                           HERE/'conversations'/f'{game}.json']
        expected_hashes = {p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                           for p in required_inputs}
        before_hashes = raw.get('sourceHashesBefore', {})
        input_hash_mismatches = {name: {'expected': digest, 'observed': before_hashes.get(name)}
                                 for name, digest in expected_hashes.items() if before_hashes.get(name) != digest}
        choices = choices_for(game, requested)
        groups = {}
        for row in raw.get('turns', []):
            groups.setdefault(row.get('conversation', 0), []).append(row)
        events = [e for w in raw.get('workers', []) for e in w.get('events', [])]
        ready = [e for e in events if e.get('type') == 'ready']
        embeddings = [e for e in events if e.get('type') == 'embedding']
        sanitized_workers = [{**w, 'events': [{k: v for k, v in e.items() if k != 'vector'} for e in w.get('events', [])]}
                             for w in raw.get('workers', [])]
        report['probes'].append({'surface': surface, 'gameId': game,
            'rawExportSha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'url': raw.get('url'),
            'checkedAt': raw.get('checkedAt'), 'sourceHashesBefore': raw.get('sourceHashesBefore', {}),
            'sourceHashesAfter': raw.get('sourceHashesAfter', {}),
            'sourceStable': raw.get('sourceHashesBefore') == raw.get('sourceHashesAfter'),
            'frozenInputsMatched': not input_hash_mismatches,
            'frozenInputHashMismatches': input_hash_mismatches,
            'storageWrites': raw.get('storageWrites', []), 'pageErrors': raw.get('pageErrors', []),
            'workers': sanitized_workers,
            'nativeModelReady': any(e.get('metadata', {}).get('realModelInference') is True for e in ready),
            'classifications': sum(e.get('direction') == 'send' and e.get('type') == 'classify' for e in events),
            'encodings': sum(e.get('direction') == 'send' and e.get('type') == 'encode' for e in events),
            'validEmbeddings': bool(embeddings) and all(e.get('dimensions') == 384 and e.get('allFinite')
                                                         and abs(e.get('norm', 0) - 1) < .001 for e in embeddings)})
        matched = set()
        for conversation, rows in groups.items():
            questions = [row.get('text') for row in rows]
            row_surface = next((row.get('surface') for row in rows if row.get('surface')), surface)
            if row_surface not in SURFACE_GAMES or SURFACE_GAMES[row_surface] != game:
                report['incompleteConversations'].append({'surface': surface, 'gameId': game,
                    'conversation': conversation, 'questions': questions, 'reason': 'Captured surface does not match the served guide'})
                continue
            matches = [(suite, d) for suite, d in choices
                       if (suite != 'semantic13' or d.get('surface') == surface)
                       and [t['text'] for t in d['turns']] == questions]
            if len(matches) == 1:
                suite, dialogue = matches[0]
                key = (suite, dialogue['id'])
                if key in matched:
                    report['incompleteConversations'].append({'surface': surface, 'gameId': game,
                        'conversation': conversation, 'questions': questions,
                        'reason': 'The same frozen dialogue was captured more than once on this surface',
                        'candidateDialogues': [{'suite': suite, 'dialogueId': dialogue['id']}]})
                    continue
                matched.add(key)
                previous_actual = None
                for index, (turn, actual) in enumerate(zip(dialogue['turns'], rows), 1):
                    checked_turn = turn
                    if suite == 'semantic13':
                        oracle = semantic_oracles.get(turn.get('oracleId'))
                        if oracle is None:
                            report['incompleteConversations'].append({'surface': surface, 'gameId': game,
                                'conversation': conversation, 'questions': questions,
                                'reason': 'Semantic dialogue references an unknown frozen oracle ID'})
                            break
                        checked_turn = {**turn, 'expected': oracle['expected']}
                    checked = {**check(checked_turn, actual, previous_actual), 'surface': row_surface, 'gameId': game,
                               'suite': suite, 'dialogueId': dialogue['id'], 'turn': index}
                    report['turns'].append(checked)
                    if not checked['passed']:
                        report['known_failures'].append({'surface': row_surface, 'suite': suite,
                            'dialogueId': dialogue['id'], 'turn': index, 'question': actual.get('text'),
                            'problems': checked['problems']})
                    if suite in baselines:
                        old = next((t for t in baselines[suite]['turns'] if t.get('surface') == game
                                    and t.get('dialogueId') == dialogue['id'] and t.get('turn') == index), None)
                        if old is not None:
                            fields = ['decision', 'rendered', 'citations', 'links', 'passed']
                            differences = [field for field in fields if old.get(field) != checked.get(field)]
                            if differences:
                                report['changedComparedReplyRows'].append({'suite': suite, 'surface': row_surface,
                                    'dialogueId': dialogue['id'], 'turn': index, 'fields': differences,
                                    'before': {field: old.get(field) for field in fields},
                                    'after': {field: checked.get(field) for field in fields}})
                    previous_actual = actual
            elif len(rows) == 1 and questions[0] in CONTROLS:
                actual = rows[0]
                control = {**actual, 'surface': row_surface, 'gameId': game, 'passed': actual.get('decision') != 'answer'}
                report['controls'].append(control)
                if not control['passed']:
                    report['known_failures'].append({'surface': row_surface, 'suite': 'control',
                        'dialogueId': None, 'turn': 1, 'question': actual.get('text'),
                        'problems': ['Expected a non-answer control; observed factual answer']})
            else:
                reason = 'No complete ordered oracle match' if not matches else 'Ambiguous oracle match; pass --dataset to select a suite'
                report['incompleteConversations'].append({'surface': row_surface, 'gameId': game,
                    'conversation': conversation, 'questions': questions, 'reason': reason,
                    'candidateDialogues': [{'suite': suite, 'dialogueId': d['id']} for suite, d in matches]})
        for suite, path_for in SUITES.items():
            if requested != ['auto'] and suite not in requested:
                continue
            data = read(path_for(game))
            expected_ids = {d['id'] for d in data['dialogues']
                            if d.get('gameId', data.get('gameId')) == game
                            and (suite != 'semantic13' or d.get('surface') == surface)}
            done_ids = {did for s, did in matched if s == suite}
            coverage_key = f'{surface}:{suite}'
            report['coverage'][coverage_key] = {'matchedDialogues': len(done_ids), 'expectedDialogues': len(expected_ids),
                                                'complete': bool(expected_ids) and expected_ids == done_ids,
                                                'missingDialogueIds': sorted(expected_ids-done_ids)}
    report['summary'] = {suite: {'passed': sum(t['passed'] for t in report['turns'] if t['suite'] == suite),
                                'failed': sum(not t['passed'] for t in report['turns'] if t['suite'] == suite),
                                'total': sum(t['suite'] == suite for t in report['turns'])}
                         for suite in SUITES}
    report['summary']['controls'] = {'passed': sum(t['passed'] for t in report['controls']),
                                     'failed': sum(not t['passed'] for t in report['controls']),
                                     'total': len(report['controls'])}
    report['incomplete'] = bool(report['incompleteConversations']) or any(not c['complete'] for c in report['coverage'].values())
    report['boundaries'] = {'sourceStable': all(p['sourceStable'] for p in report['probes']),
                            'frozenInputsMatched': all(p['frozenInputsMatched'] for p in report['probes']),
                            'noStorageWrites': all(not p['storageWrites'] for p in report['probes']),
                            'noPageErrors': all(not p['pageErrors'] for p in report['probes']),
                            'nativeMiniLMEveryProbe': all(p['nativeModelReady'] and p['validEmbeddings']
                                                         and p['classifications'] and p['encodings'] for p in report['probes']),
                            'allAdditionalControlsHeld': all(t['passed'] for t in report['controls'])}
    report['status'] = 'failed' if report['known_failures'] or not all(report['boundaries'].values()) else ('incomplete' if report['incomplete'] else 'complete')
    with output.open('x', encoding='utf-8', newline='\n') as handle:
        json.dump(report, handle, indent=2, ensure_ascii=False)
        handle.write('\n')
    print(json.dumps({'report': str(output.relative_to(ROOT)), 'status': report['status'],
                      'summary': report['summary'], 'boundaries': report['boundaries'],
                      'incompleteConversations': len(report['incompleteConversations']),
                      'knownFailures': len(report['known_failures']),
                      'changedRows': len(report['changedComparedReplyRows'])}, indent=2))
    return 0 if all(report['boundaries'].values()) and not report['known_failures'] and not report['incomplete'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
