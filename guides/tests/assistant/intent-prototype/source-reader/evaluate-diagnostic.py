"""Evaluate passage selection only, never relabel it complete chat accuracy."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import statistics

def partition(case):
    key = case['gameId']+'/'+case['dialogueId']
    return 'development' if int(hashlib.sha256(key.encode()).hexdigest()[:8],16)%4 else 'evaluation'

def accepted_ids(expected):
    return set(expected.get('factIds', [])) | set(expected.get('allFactIds', []))

def acceptable(case, fid):
    # This deliberately tests only the fact identity. Required multi-fact
    # support, exact claims, sources, dialogue behavior and authorization must
    # still be tested by the full conversation suite after any integration.
    return any(fid in accepted_ids(e) for e in [case['expected'], *case['expected'].get('alternativeAnswers',[])])

def select(result, null_margin, winner_margin):
    rows = result.get('diagnostics', [])
    if not rows: return None
    gap = rows[0]['margin']-rows[1]['margin'] if len(rows)>1 else float('inf')
    return rows[0]['id'] if rows[0]['margin']>null_margin and gap>winner_margin else None

def summarize(rows, thresholds):
    counts = Counter()
    for case,result in rows:
        positive = case['expected']['decision']=='answer'
        evaluable = positive and any(accepted_ids(e) for e in [case['expected'], *case['expected'].get('alternativeAnswers',[])])
        winner = select(result,*thresholds)
        counts['turns']+=1; counts['positive' if positive else 'boundary']+=1
        if evaluable:
            counts['positiveWithExpectedFocusedFact']+=1
            if any(acceptable(case,c['id']) for c in case['contexts']): counts['candidateCovered']+=1
            if acceptable(case,case['contexts'][0]['id']): counts['cosineTopFactCorrect']+=1
            if winner and acceptable(case,winner): counts['readerTopFactCorrect']+=1
            elif winner: counts['readerWrongFact']+=1
            else: counts['readerAbstainedOnPositive']+=1
        elif positive: counts['positiveWithoutExpectedFocusedFact']+=1
        if not positive:
            counts['rawReaderBoundaryAcceptance' if winner else 'rawReaderBoundaryAbstention']+=1
    return dict(counts)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--report',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    args=p.parse_args()
    if args.output.exists(): p.error('Output exists')
    report=json.loads(args.report.read_text())
    inputs={c['id']:c for c in report['input']['cases']}
    rows=[(inputs[r['id']],r['result']) for r in report['results'] if 'result' in r]
    splits={s:[r for r in rows if partition(r[0])==s] for s in ['development','evaluation']}
    # Grid and dialogue partition are fixed here, before reading native scores.
    # Penalize wrong facts/boundary acceptance rather than optimize recall alone.
    grid=[]
    for nm in [0,2,4,6,8,10,12,16,20]:
        for wm in [0,1,2,4,6,8]:
            counts=summarize(splits['development'],(nm,wm))
            score=counts.get('readerTopFactCorrect',0)-5*counts.get('readerWrongFact',0)-10*counts.get('rawReaderBoundaryAcceptance',0)
            grid.append({'nullMargin':nm,'winnerMargin':wm,'score':score,'counts':counts})
    chosen=max(grid,key=lambda row:(row['score'],row['counts'].get('readerTopFactCorrect',0),-row['nullMargin'],-row['winnerMargin']))
    thresholds=(chosen['nullMargin'],chosen['winnerMargin'])
    latencies=[d['inferenceMs'] for _,r in rows for d in r['diagnostics']]
    errors=[r for r in report['results'] if 'error' in r]
    output={'kind':'passage-ranking-only','completeChatAcceptance':False,
        'limitations':['Ungated same-game top-k retrieval; source/entity/role/state gates are not represented.',
            'Correct fact identity is weaker than a complete answer with every requested claim and source.',
            'Context-expanded questions come from the earlier baseline runtime, not a reader-controlled conversation.',
            'All diagnostic cases are from the development corpus; no claim of unseen conversational generalization.'],
        'nativeReport':str(args.report),'nativeReportHash':hashlib.sha256(args.report.read_bytes()).hexdigest(),
        'nativeMechanicsPassed':report['mechanicsPassed'],'sourceStable':report['sourceStable'],
        'missingInputQueries':report['input'].get('missingQueries',[]),'errors':errors,
        'splitRule':'SHA256(gameId/dialogueId) first32bits modulo4: zero evaluation, remainder development',
        'calibrationObjective':'correct fact IDs - 5 * wrong fact IDs - 10 * raw boundary acceptances; development dialogues only',
        'grid':grid,'selectedThresholds':{'minNullMargin':thresholds[0],'minWinnerMargin':thresholds[1]},
        'uncalibratedAll':summarize(rows,(0,0)),
        'calibratedDevelopment':summarize(splits['development'],thresholds),
        'calibratedEvaluation':summarize(splits['evaluation'],thresholds),
        'calibratedPerGame':{g:summarize([r for r in rows if r[0]['gameId']==g],thresholds) for g in sorted({c['gameId'] for c,_ in rows})},
        'latencyMs':{'contexts':len(latencies),'median':statistics.median(latencies) if latencies else None,
            'p95':sorted(latencies)[int(len(latencies)*.95)] if latencies else None,
            'total':sum(latencies)},'prepare':report.get('prepare'),'pageMemory':report.get('memory')}
    args.output.write_text(json.dumps(output,indent=2)+'\n')
    print(json.dumps({k:output[k] for k in ['nativeMechanicsPassed','errors','selectedThresholds','uncalibratedAll','calibratedDevelopment','calibratedEvaluation','latencyMs']},indent=2))

if __name__=='__main__':main()
