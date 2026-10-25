"""Freeze a retrieval-only diagnostic; no expected answers select candidates.

Uses the exact question encodings and actual prior conversational expansion from
an earlier immutable replay. This deliberately measures ungated retrieval, not
production authorization or complete dialogue acceptance.
"""
import argparse
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]

def read(path): return json.loads(path.read_text())
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--replay', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--top-k', type=int, default=5, choices=range(1,9))
    args = p.parse_args()
    if args.output.exists(): p.error('Output exists; preserve earlier evidence')
    replay = read(args.replay)
    vector_path = ROOT/replay['vectors']
    vectors = read(vector_path)
    cases=[]; missing=[]; provenance={str(args.replay):sha(args.replay),str(vector_path.relative_to(ROOT)):sha(vector_path)}
    for game, game_report in replay['games'].items():
        fact_path=ROOT/f'guides/data/assistant/knowledge/{game}.json'
        embed_path=fact_path.with_name(game+'-embeddings.json')
        provenance[str(fact_path.relative_to(ROOT))]=sha(fact_path)
        provenance[str(embed_path.relative_to(ROOT))]=sha(embed_path)
        facts={f['id']:f for f in read(fact_path)['facts']}
        documents=read(embed_path)['documents']
        for dialogue in game_report['dialogues']:
            for turn in dialogue['turns']:
                queries=[q['text'] for q in turn['requestedInputs'] if q['purpose']=='encode']
                if len(queries)!=1 or queries[0] not in vectors:
                    missing.append({'game':game,'dialogue':dialogue['id'],'turn':turn['index'],'queries':queries})
                    continue
                query=queries[0]; vector=vectors[query]
                # Expected IDs and previous runtime decisions are deliberately
                # not read until the candidate list has been selected.
                scores=sorted(((sum(a*b for a,b in zip(vector,d['vector'])),d['factId']) for d in documents),reverse=True)
                chosen=scores[:args.top_k]
                contexts=[{'id':fid,'text':facts[fid]['text']} for score,fid in chosen]
                cases.append({'id':f"{game}/{dialogue['id']}/{turn['index']}",'gameId':game,
                    'dialogueId':dialogue['id'],'question':query,'originalQuestion':turn['text'],
                    'contexts':contexts,'cosine':chosen,'expected':turn['expected'],
                    'baselineStatus':turn['status'],'baselineDecision':turn['decision']})
    report={'kind':'ungated-passage-ranking-diagnostic','productionAuthorization':False,
        'topK':args.top_k,'candidatePolicy':'Highest cosine among same-game focused facts. No expected-ID selection. Source/entity/role/state restrictions are deliberately not applied: this is candidate recall and ranking only, never permission to answer.',
        'provenance':provenance,'missingQueries':missing,'cases':cases,
        'calibration':{'minNullMargin':0,'minWinnerMargin':0}}
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'cases':len(cases),'missingQueries':missing,'output':str(args.output)},indent=2))

if __name__=='__main__': main()
