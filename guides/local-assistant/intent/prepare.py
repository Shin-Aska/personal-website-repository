"""Package the already-approved local MiniLM and reproducibly export its head.

No network downloads or installations. Uses the existing Playwright/Chrome
runtime and untouched prototype train/validation files. Run from any directory.
"""
import argparse
import hashlib
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PROTOTYPE = ROOT / 'guides/tests/assistant/intent-prototype'
PART_BYTES = 16 * 1024 * 1024

def digest(body):
    return hashlib.sha256(body).hexdigest()

def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + '\n')

def checked(path, size, sha256):
    body = path.read_bytes()
    if len(body) != size or digest(body) != sha256:
        raise ValueError('Existing approved asset failed verification: ' + str(path))
    return body

def export_head(chrome, shared_directory=None):
    from playwright.sync_api import sync_playwright
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=chrome, headless=True, args=['--no-sandbox'])
            context = browser.new_context(service_workers='block')
            external = []
            def route(request):
                url = request.request.url
                parsed = urlparse(url)
                if shared_directory and parsed.path == '/guides/local-assistant/profile.json':
                    request.fulfill(status=200, content_type='application/json', body=(Path(shared_directory)/'profile.json').read_bytes())
                    return
                if shared_directory and parsed.path.startswith('/guides/local-assistant/files/'):
                    target = Path(shared_directory)/'files'/Path(parsed.path).name
                    if target.is_file():
                        request.fulfill(status=200, content_type='application/octet-stream', body=target.read_bytes())
                        return
                if url.startswith(('blob:', 'data:')) or urlparse(url).hostname == '127.0.0.1':
                    request.continue_()
                else:
                    external.append(url)
                    request.abort()
            context.route('**/*', route)
            page = context.new_page()
            page.goto(f'http://127.0.0.1:{server.server_port}/guides/tests/assistant/intent-prototype/', wait_until='networkidle')
            artifact = page.evaluate('''async () => {
                const {createEncoder}=await import('./encoder.mjs');
                const {trainClassifier,evaluateClassifier,selectThresholds}=await import('./classifier.mjs');
                const sha=async text=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(v=>v.toString(16).padStart(2,'0')).join('');
                const texts=await Promise.all(['./cases/training-v2.json','./cases/validation-v2.json'].map(async path=>{
                    const r=await fetch(path,{redirect:'error'});if(!r.ok)throw new Error('Missing frozen fitting source');return r.text();
                }));
                const [training,validation]=texts.map(text=>JSON.parse(text));
                if(training.samples.length!==180||validation.samples.length!==72)throw new Error('Frozen fitting split size changed');
                const seen=new Set(training.samples.map(s=>s.text.trim().toLowerCase()));
                if(validation.samples.some(s=>seen.has(s.text.trim().toLowerCase())))throw new Error('Fitting split overlap');
                const encoder=createEncoder();
                try {
                    const metadata=await encoder.start();
                    const trainVectors=await encoder.embed(training.samples.map(s=>s.text));
                    const head=trainClassifier(training.samples,trainVectors);
                    const validationVectors=await encoder.embed(validation.samples.map(s=>s.text));
                    const validationRaw=evaluateClassifier(head,validation.samples,validationVectors);
                    const thresholds=selectThresholds(validationRaw.perCase,{targetAccuracy:0.9,minAccepted:6});
                    return {schemaVersion:1,head,thresholds,provenance:{
                        modelId:metadata.modelId,revision:metadata.revision,encoderFineTuned:false,
                        trainingSamples:training.samples.length,validationSamples:validation.samples.length,
                        trainingSha256:await sha(texts[0]),validationSha256:await sha(texts[1]),
                        fitting:'Frozen sentence encoder; deterministic regularized linear softmax head; thresholds selected only on validation.'
                    },validationMetrics:evaluateClassifier(head,validation.samples,validationVectors,thresholds).metrics};
                } finally { encoder.stop(); }
            }''')
            browser.close()
            if external:
                raise RuntimeError('Unexpected external requests: ' + repr(external))
            return artifact
    finally:
        server.shutdown()
        server.server_close()

def package_intent(prototype=PROTOTYPE, shared_directory=HERE.parent, directory=HERE,
                   head_path=None, rebuild_head=False, chrome='/usr/bin/google-chrome'):
    """Package verified local encoder/head inputs into a caller-owned staging directory."""
    prototype, shared_directory, directory = Path(prototype), Path(shared_directory), Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    prototype_profile = json.loads((prototype / 'assets/profile.json').read_text())
    shared_profile = json.loads((shared_directory / 'profile.json').read_text())
    approved = {}
    for entry in prototype_profile['files']:
        approved[entry['name']] = checked(prototype / 'assets' / entry['path'], entry['bytes'], entry['sha256'])
    head_path = Path(head_path or HERE/'head.json')
    if not rebuild_head:
        artifact = json.loads(head_path.read_text())
        for field, name in [('trainingSha256', 'training-v2.json'), ('validationSha256', 'validation-v2.json')]:
            if artifact['provenance'][field] != digest((prototype / 'cases' / name).read_bytes()):
                raise ValueError('The fitting source changed; export the head again')
        if artifact['provenance'].get('classifierSourceSha256') != digest((prototype / 'classifier.mjs').read_bytes()):
            raise ValueError('The classifier source changed; export the head again')
        if artifact['provenance'].get('modelId') != prototype_profile['modelId'] or artifact['provenance'].get('revision') != prototype_profile['revision']:
            raise ValueError('The encoder identity changed; export the head again')
    else:
        artifact = export_head(chrome, shared_directory)
    artifact['provenance']['classifierSourceSha256'] = digest((prototype / 'classifier.mjs').read_bytes())
    write_json(directory/'head.json', artifact)
    (directory / 'files').mkdir(exist_ok=True)
    assets = []
    def parts(body):
        ids = []
        for offset in range(0, len(body), PART_BYTES):
            part = body[offset:offset + PART_BYTES]
            sha256 = digest(part)
            target = directory / 'files' / (sha256 + '.bin')
            if target.exists():
                checked(target, len(part), sha256)
            else:
                target.write_bytes(part)
            if not any(entry['sha256'] == sha256 for entry in assets):
                assets.append({'path': 'files/' + target.name, 'bytes': len(part), 'sha256': sha256})
            ids.append(sha256)
        return ids
    model = {name: parts(body) for name, body in approved.items()}
    head = parts((directory/'head.json').read_bytes())
    wanted = {sha256 for ids in shared_profile['runtime'].values() for sha256 in ids}
    runtime_assets = []
    for entry in shared_profile['assets']:
        if entry['sha256'] not in wanted:
            continue
        checked(shared_directory / entry['path'], entry['bytes'], entry['sha256'])
        runtime_assets.append({**entry, 'path': '../' + entry['path']})
    if {entry['sha256'] for entry in runtime_assets} != wanted:
        raise ValueError('A shared browser runtime part is missing')
    additional = sum(entry['bytes'] for entry in assets)
    profile = {
        'schema': 1, 'id': 'minilm-l6-v2-q8-751bff3-followup-v2', 'label': 'MiniLM intent classifier',
        'backend': 'minilm-linear-intent', 'modelId': prototype_profile['modelId'], 'revision': prototype_profile['revision'],
        'license': prototype_profile['license'], 'dtype': 'q8', 'dimensions': 384, 'maxTokens': 128,
        'additionalBytes': additional, 'totalBytes': additional + sum(entry['bytes'] for entry in runtime_assets),
        'assets': assets, 'model': model, 'head': head, 'runtimeAssets': runtime_assets, 'runtime': shared_profile['runtime'],
        'thresholds': artifact['thresholds'], 'provenance': {**artifact['provenance'], 'runtime': '@huggingface/transformers@3.8.1',
            'modelFiles': [{key: value for key, value in entry.items() if key != 'path'} for entry in prototype_profile['files']]},
    }
    write_json(directory / 'profile.json', profile)
    return profile


def main(argv=None):
    import types
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chrome', default='/usr/bin/google-chrome')
    parser.add_argument('--reuse-head', action='store_true', help='Compatibility alias; verified head reuse is now the default')
    parser.add_argument('--rebuild-head', action='store_true', help='Explicitly refit the frozen-data head with existing Chrome/Playwright')
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args(argv)
    setup = types.ModuleType('guide_assistant_setup');setup.__file__ = str(HERE.parent/'setup.py')
    exec(compile(Path(setup.__file__).read_bytes(), setup.__file__, 'exec'), setup.__dict__)
    return setup.main((['--verify-only'] if args.verify_only else [])
                      + (['--rebuild-head'] if args.rebuild_head else []) + ['--chrome', args.chrome])

if __name__ == '__main__':
    raise SystemExit(main())
