"""Reproduce static knowledge vectors with the existing approved local MiniLM.

No installs, downloads, classifier training, or remote connections. Production
loads only the resulting static fact vectors after chat consent. Optional raw
query vectors are an ignored local replay aid, never a classification artifact.

Examples:
  python3 guides/tests/assistant/build-knowledge-embeddings.py --include-queries
  python3 guides/tests/assistant/build-knowledge-embeddings.py --verify-only
  python3 guides/tests/assistant/build-knowledge-embeddings.py --queries-only
  python3 guides/tests/assistant/build-knowledge-embeddings.py --reuse-unchanged

--refresh-manifest-hashes is an explicit offline operation for manifest edits
that leave every fact id and encoded document unchanged; it refuses text drift.
"""
import argparse
import hashlib
import json
import math
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
LAB = HERE / 'intent-prototype'
DATA = ROOT / 'guides/data/assistant/knowledge'
PROFILE = ROOT / 'guides/local-assistant/intent/profile.json'
GAMES = ('alqadim', 'albion', 'starcraft', 'ultima5', 'ultima6', 'ultima7')
QUERY_OUTPUT = LAB / 'results/knowledge-raw-query-embeddings.json'
QUERY_METADATA_OUTPUT = LAB / 'results/knowledge-raw-query-embeddings-metadata.json'
REPORT_OUTPUT = LAB / 'results/knowledge-embedding-generation.json'
KEYS = ('modelId', 'revision', 'dimensions', 'dtype', 'maxTokens')


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=True, separators=(',', ':'), allow_nan=False) + '\n')
    temporary.replace(path)


def document(fact):
    # Match JS String.slice(0, 2000), including its UTF-16 code-unit boundary.
    value = f"{fact['subject']}. {fact['facet']}. {', '.join(fact.get('aliases', []))}. {fact['text']}"
    return value.encode('utf-16-le', errors='surrogatepass')[:4000].decode('utf-16-le', errors='surrogatepass')


def manifest_documents(game):
    path = DATA / f'{game}.json'
    manifest = read(path)
    assert manifest['schemaVersion'] == 1 and manifest['gameId'] == game, f'Invalid manifest: {path}'
    documents = [{'factId': fact['id'], 'text': document(fact)} for fact in manifest['facts']]
    assert documents and len({entry['factId'] for entry in documents}) == len(documents), f'Duplicate/empty facts: {game}'
    assert all(isinstance(entry['factId'], str) and entry['factId'] and 0 < len(entry['text']) <= 2000 for entry in documents)
    return path, documents


def validate_vector(vector):
    assert isinstance(vector, list) and len(vector) == 384, 'Embedding must have 384 dimensions'
    assert all(type(value) in (int, float) and math.isfinite(value) for value in vector), 'Nonfinite embedding'
    assert abs(math.sqrt(sum(value * value for value in vector)) - 1) <= 1e-3, 'Embedding must have unit norm'


def validate_output(game, profile, *, allow_hash_change=False):
    path, documents = manifest_documents(game)
    output = read(DATA / f'{game}-embeddings.json')
    assert output['schemaVersion'] == 1 and output['gameId'] == game, f'Invalid embedding manifest: {game}'
    for key in ('modelId', 'revision', 'dimensions'):
        assert output[key] == profile[key], f'Embedding provenance mismatch: {game}/{key}'
    assert len(output['documents']) == len(documents), f'Fact count drift: {game}'
    for expected, actual in zip(documents, output['documents']):
        assert actual['factId'] == expected['factId'] and actual['text'] == expected['text'], f'Document drift: {game}/{expected["factId"]}'
        validate_vector(actual['vector'])
    if not allow_hash_change:
        assert output['manifestSha256'] == sha(path), f'Manifest digest drift: {game}'
    return output


def reusable_documents(catalog, game, profile, documents):
    """Reuse exact source documents only under the same approved encoder."""
    assert catalog.get('schemaVersion') == 1 and catalog.get('gameId') == game, 'Invalid cached catalog identity'
    for key in ('modelId', 'revision', 'dimensions'):
        assert catalog.get(key) == profile[key], f'Cached encoder provenance mismatch: {game}/{key}'
    entries = catalog.get('documents')
    assert isinstance(entries, list), 'Cached documents must be a list'
    cached = {}
    for entry in entries:
        fact_id = entry.get('factId')
        assert isinstance(fact_id, str) and fact_id and fact_id not in cached, 'Invalid or duplicate cached fact ID'
        assert isinstance(entry.get('text'), str) and entry['text'], 'Invalid cached source text'
        validate_vector(entry.get('vector'))
        cached[fact_id] = entry
    return {entry['factId']: cached[entry['factId']]['vector'] for entry in documents
            if entry['factId'] in cached and cached[entry['factId']]['text'] == entry['text']}


def verified_local_encoder(profile):
    lab_path = LAB / 'assets/profile.json'
    lab = read(lab_path)
    for key in KEYS:
        assert lab[key] == profile[key], f'Lab/production {key} mismatch'
    assert profile['modelId'] == 'Xenova/all-MiniLM-L6-v2' and profile['dimensions'] == 384
    assert profile['dtype'] == 'q8' and profile['maxTokens'] == 128
    production_parts = {entry['sha256']: entry for entry in profile['assets'] + profile['runtimeAssets']}
    for entry in lab['files']:
        path = (lab_path.parent / entry['path']).resolve()
        assert path.is_relative_to(LAB.resolve()), 'Lab model path escaped local lab'
        assert path.stat().st_size == entry['bytes'] and sha(path) == entry['sha256'], f'Local lab integrity mismatch: {entry["name"]}'
        body = bytearray()
        for digest in profile['model'][entry['name']]:
            part = production_parts[digest]
            part_path = PROFILE.parent / part['path']
            assert part_path.stat().st_size == part['bytes'] and sha(part_path) == digest, 'Production model part integrity mismatch'
            body.extend(part_path.read_bytes())
        assert hashlib.sha256(body).hexdigest() == entry['sha256'], f'Lab/production model file mismatch: {entry["name"]}'
    shared_path = (lab_path.parent / lab['runtimeProfile']).resolve()
    shared = read(shared_path)
    assert shared['runtime'] == profile['runtime'], 'Lab/production runtime mapping mismatch'
    runtime_ids = {digest for parts in shared['runtime'].values() for digest in parts}
    for entry in shared['assets']:
        if entry['sha256'] in runtime_ids:
            part_path = shared_path.parent / entry['path']
            assert part_path.stat().st_size == entry['bytes'] and sha(part_path) == entry['sha256'], 'Local runtime integrity mismatch'
    return {str(path.relative_to(ROOT)): sha(path) for path in (PROFILE, lab_path, shared_path, LAB / 'encoder.mjs', LAB / 'embedding-worker.mjs', ROOT / 'guides/js/assistant/knowledge.js')}


def raw_queries(text_path=None):
    # Read only raw question text; no expected labels/answers enter the encoder.
    unique = {}
    if text_path is not None:
        texts = read(text_path)
        assert isinstance(texts, list), '--query-texts must contain a JSON list of input strings'
        for text in texts:
            assert isinstance(text, str) and text.strip() and len(text.encode('utf-16-le', errors='surrogatepass')) <= 4000, 'Invalid query input text'
            unique.setdefault(text, None)
        return list(unique)
    for game in GAMES:
        corpus = read(HERE / 'knowledge' / f'{game}-cases.json')
        assert corpus['gameId'] == game
        for dialogue in corpus['dialogues']:
            for turn in dialogue['turns']:
                text = turn['text']
                assert isinstance(text, str) and text.strip() and len(text) <= 2000
                unique.setdefault(text, None)
    return list(unique)


def cached_queries(profile):
    if not QUERY_OUTPUT.exists():
        return {}
    # Older generator runs put this provenance in their generation report.
    if QUERY_METADATA_OUTPUT.exists():
        metadata = read(QUERY_METADATA_OUTPUT)
    else:
        report = read(REPORT_OUTPUT)
        metadata = {**report['model'], 'dtype': report['dtype'], 'maxTokens': report['maxTokens']}
    assert all(metadata[key] == profile[key] for key in KEYS), 'Existing query vectors belong to a different model profile; refusing to merge'
    vectors = read(QUERY_OUTPUT)
    assert isinstance(vectors, dict), 'Invalid existing raw query vector map'
    for text, vector in vectors.items():
        assert isinstance(text, str) and text.strip(), 'Invalid cached query text'
        validate_vector(vector)
    return vectors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument('--verify-only', action='store_true')
    modes.add_argument('--refresh-manifest-hashes', action='store_true')
    modes.add_argument('--queries-only', action='store_true')
    modes.add_argument('--reuse-unchanged', action='store_true', help='Refresh source catalogs while encoding only changed documents with the existing local encoder')
    parser.add_argument('--include-queries', action='store_true')
    parser.add_argument('--query-texts', type=Path, help='JSON list of raw input strings, replacing corpus queries; merged by exact text into the ignored query vector map')
    args = parser.parse_args()
    started = time.monotonic()
    profile = read(PROFILE)
    if args.verify_only or args.refresh_manifest_hashes:
        for game in GAMES:
            output = validate_output(game, profile, allow_hash_change=args.refresh_manifest_hashes)
            if args.refresh_manifest_hashes:
                output['manifestSha256'] = sha(DATA / f'{game}.json')
                write(DATA / f'{game}-embeddings.json', output)
            print(f'{game}: verified {len(output["documents"])} documents', flush=True)
        print(f'Offline verification complete in {time.monotonic() - started:.2f}s', flush=True)
        return
    source_hashes = verified_local_encoder(profile)
    if args.queries_only:
        for game in GAMES:
            validate_output(game, profile)
    manifest_hashes = {game: sha(DATA / f'{game}.json') for game in GAMES}
    documents = {game: manifest_documents(game)[1] for game in GAMES}
    reused, cached_catalog_hashes = {}, {}
    if args.reuse_unchanged:
        for game in GAMES:
            path = DATA / f'{game}-embeddings.json'
            cached_catalog_hashes[game] = sha(path)
            reused[game] = reusable_documents(read(path), game, profile, documents[game])
    queries = raw_queries(args.query_texts) if args.include_queries or args.queries_only or args.query_texts else []
    existing_queries = cached_queries(profile) if queries else {}
    missing_queries = [text for text in queries if text not in existing_queries]
    query_input_sha = sha(args.query_texts) if args.query_texts else None
    print(f'Verified local pinned model: {profile["modelId"]}@{profile["revision"]}; maxTokens={profile["maxTokens"]}; {sum(map(len, documents.values()))} fact documents; {len(queries)} requested unique queries; {len(missing_queries)} uncached', flush=True)
    from playwright.sync_api import sync_playwright
    blocked, errors, requests = [], [], []

    class Handler(SimpleHTTPRequestHandler):
        def log_message(self, *unused):
            pass

        def do_GET(self):
            if self.path == '/__knowledge_embeddings__':
                body = b'<!doctype html><title>Private local knowledge embedding generator</title>'
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                super().do_GET()

    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    generated = {}
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
            context = browser.new_context(service_workers='block')

            def route(request):
                url = request.request.url
                parsed = urlparse(url)
                if url.startswith(('blob:', 'data:')) or (parsed.scheme == 'http' and parsed.netloc == f'127.0.0.1:{server.server_port}'):
                    request.continue_()
                else:
                    blocked.append(url)
                    request.abort()

            context.route('**/*', route)
            context.on('request', lambda request: requests.append({'url': request.url, 'method': request.method, 'hasBody': request.post_data_buffer is not None}))
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(origin + '/__knowledge_embeddings__')
            metadata = page.evaluate('''async () => {
                const {createEncoder} = await import('/guides/tests/assistant/intent-prototype/encoder.mjs');
                window.knowledgeEncoder = createEncoder();
                return await window.knowledgeEncoder.start();
            }''')
            for key in ('modelId', 'revision', 'dimensions'):
                assert metadata[key] == profile[key], f'Live encoder metadata mismatch: {key}'
            assert metadata['realModelInference'] and not metadata['encoderFineTuned'] and not metadata['remoteModelsAllowed']
            # Keep progress observable and each browser evaluation bounded.
            def encode(texts, label):
                output = []
                for offset in range(0, len(texts), 8):
                    vectors = page.evaluate('async texts => (await window.knowledgeEncoder.embed(texts, {cacheResults: false})).map(vector => vector.map(value => Number(value.toFixed(7))))', texts[offset:offset + 8])
                    assert len(vectors) == len(texts[offset:offset + 8])
                    for vector in vectors:
                        validate_vector(vector)
                    output.extend(vectors)
                    print(f'{label}: {len(output)}/{len(texts)}; elapsed {time.monotonic() - started:.1f}s', flush=True)
                return output

            # Assert Python document construction matches the exported production
            # function before any fact inference, including UTF-16 slicing.
            production_documents = page.evaluate('''async facts => {
                const {knowledgeDocument} = await import('/guides/js/assistant/knowledge.js');
                return facts.map(knowledgeDocument);
            }''', [fact for game in GAMES for fact in read(DATA / f'{game}.json')['facts']])
            assert production_documents == [entry['text'] for game in GAMES for entry in documents[game]], 'Production knowledgeDocument mismatch'
            if not args.queries_only:
                for game in GAMES:
                    retained = reused.get(game, {})
                    changed = [entry for entry in documents[game] if entry['factId'] not in retained]
                    vectors = encode([entry['text'] for entry in changed], game)
                    encoded = {entry['factId']: vector for entry, vector in zip(changed, vectors)}
                    generated[game] = {'schemaVersion': 1, 'gameId': game, 'modelId': profile['modelId'], 'revision': profile['revision'], 'dimensions': 384,
                        'manifestSha256': manifest_hashes[game], 'documents': [{**entry, 'vector': retained.get(entry['factId'], encoded.get(entry['factId']))} for entry in documents[game]]}
            query_vectors = encode(missing_queries, 'query texts') if missing_queries else []
            page.evaluate('window.knowledgeEncoder.stop()')
            browser.close()
        assert not blocked and not errors, {'blockedExternalRequests': blocked, 'pageErrors': errors}
        assert all(request['method'] == 'GET' and not request['hasBody'] for request in requests), 'Only static asset GETs are allowed'
        assert all(sha(ROOT / path) == digest for path, digest in source_hashes.items()), 'Encoder sources changed during generation'
        assert all(sha(DATA / f'{game}.json') == digest for game, digest in manifest_hashes.items()), 'Manifests changed during generation; refusing stale output'
        if args.query_texts:
            assert sha(args.query_texts) == query_input_sha, 'Query input changed during generation; refusing incomplete output'
        for game, digest in cached_catalog_hashes.items():
            assert sha(DATA / f'{game}-embeddings.json') == digest, 'Cached source catalog changed during refresh'
        for game, output in generated.items():
            write(DATA / f'{game}-embeddings.json', output)
            validate_output(game, profile)
        if queries:
            existing_queries.update(zip(missing_queries, query_vectors))
            write(QUERY_OUTPUT, existing_queries)
            write(QUERY_METADATA_OUTPUT, {'schemaVersion': 1, **{key: profile[key] for key in KEYS}, 'count': len(existing_queries)})
        report = {'schemaVersion': 1, 'model': metadata, 'maxTokens': profile['maxTokens'], 'dtype': profile['dtype'], 'elapsedSeconds': round(time.monotonic() - started, 3),
            'sourceSha256': source_hashes, 'manifestSha256': manifest_hashes, 'documentCounts': {game: len(entries) for game, entries in documents.items()},
            'reusedDocumentCounts': {game: len(reused.get(game, {})) for game in GAMES},
            'encodedDocumentCounts': {game: len(documents[game]) - len(reused.get(game, {})) for game in GAMES} if not args.queries_only else {},
            'cachedInputCatalogSha256': cached_catalog_hashes,
            'rawQueryCount': len(queries), 'encodedQueryCount': len(missing_queries), 'totalRawQueryCount': len(existing_queries), 'queryInputSha256': query_input_sha,
            'onlyStaticGets': True, 'blockedExternalRequests': blocked, 'pageErrors': errors, 'requests': requests,
            'outputsSha256': {game: sha(DATA / f'{game}-embeddings.json') for game in GAMES}}
        write(REPORT_OUTPUT, report)
        print(f'Completed {len(generated)} fact files and {len(missing_queries)} new query vectors; {len(existing_queries)} total cached queries in {report["elapsedSeconds"]:.1f}s; source/hash report: {REPORT_OUTPUT.relative_to(ROOT)}', flush=True)
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
