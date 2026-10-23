"""Report uncompressed delivery and per-file gzip estimates, without a build step."""
from pathlib import Path
import gzip,json
ROOT=Path(__file__).resolve().parents[3]
shared=sorted((ROOT/'guides/js/assistant').glob('*.js'))
rows=[]
for adapter in sorted((ROOT/'guides/js/assistant/adapters').glob('*.js')):
 overlay=ROOT/f'guides/data/assistant/{adapter.stem}.json'
 code=shared+[adapter];active=code+[overlay]
 size=lambda paths,compressed:sum(len(gzip.compress(p.read_bytes(),mtime=0)) if compressed else p.stat().st_size for p in paths)
 rows.append({'game':adapter.stem,'engineAdapterRawBytes':size(code,False),'engineAdapterGzipBytes':size(code,True),'firstUseRawBytes':size(active,False),'firstUseGzipBytes':size(active,True),'files':[str(p.relative_to(ROOT)) for p in active]})
report={'method':'gzip level9, each static file independently. Estimates are not production HTTP transfer measurements; loopback browser logs record actual uncompressed transfer. Existing guide/atlas assets excluded from incremental totals.','budgets':{'engineAdapterGzipBytes':51200,'activeFirstUseGzipBytes':256000},'games':rows}
(ROOT/'guides/tests/assistant/evidence/asset-sizes.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps([{k:v for k,v in r.items() if k!='files'} for r in rows],indent=2))
