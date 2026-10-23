# Fresh updates and offline reading

The modern site (`default/`) and guides (`guides/`) have independent service
workers. Classic is unchanged, has no registration script, and remains usable
without JavaScript. Each production subdomain is a separate origin. Local workers
are scoped to their own directories, so `/default/` does not cover `/classic/`.

## How it works

- Ordinary navigation checks `offline-version.json` through a fresh URL. This is a
  small release marker, not a download of every asset. A changed marker loads the
  matching `offline-manifest.json`, which contains file hashes and sizes.
- HTML is normally fetched fresh, with a short deadline when a saved copy exists. Both
  response headers and the complete response body must arrive before the deadline.
  Connection failures, a stalled body, or a server 5xx use a saved document.
- Assets whose hash has not changed are read from Cache Storage without another
  network download. Changed assets use a stable `_swv=<content hash>` URL, allowing
  Cloudflare to reuse that version across visitors. SHA-256 verification prevents
  a stale or partially deployed asset from being saved under the wrong version.
- The first completed visit saves the document and loaded public assets in the
  background. It first tries the browser's existing HTTP-cache bytes for assets,
  accepting them only if their hashes match. This avoids downloading the first
  visit's unchanged images, scripts, fonts and styles a second time.
- Responses returned to the page have `Cache-Control: no-store`, preventing browser
  memory caching from skipping the worker on later visits. Offline copies live
  separately in Cache Storage. No PHP cache-header changes are required.
- Already-open tabs retain their known asset release. Later navigations discover
  newer releases. There is no forced page reload, progress reset or localStorage
  deletion. An old tab cannot overwrite a newer saved page's dependency list or
  request an older worker after a newer release has been observed.
- If metadata becomes unavailable, a known saved page and its matching assets are
  used together. New pages without a saved copy use ordinary fresh requests. If no
  metadata has ever existed, the site falls back to network-first behavior rather
  than breaking registration or freezing content indefinitely.

## Default-only smart prefetch (23 October 2026, local changes)

After saving the current page, default can prepare a likely destination before
the visitor opens it. Deliberate pointer hover (100 ms) and keyboard focus warm
ordinary same-origin root HTML links, including the rendered Blog cards. After
1.2 seconds of inactivity, up to two visible Blog articles can be prepared. There
are at most three unique destinations per document, one active job and two queued
jobs. Hidden tabs, offline state, Data Saver and 2G connections suppress new work
where the browser exposes those signals. `requestIdleCallback` has a timer
fallback. These heuristics do not guarantee a prepared page on every click.

Preparation fetches only public HTML (up to 256 KiB) and its directly listed,
manifest-versioned CSS/scripts (up to 32). It does not execute the page, follow its
links, fetch images/video, or preload model files. Queries, fragments, downloads,
external links, explicit document bases, unversioned core dependencies, private
responses and failed integrity checks cannot produce a prepared fast copy.

A separate `orilla-prefetch:<scope>:v1` cache holds at most two page groups and
4 MiB, without evicting saved reading copies. A prepared page is eligible for
immediate navigation for 30 seconds, only while its core dependencies are present
and no newer release has been observed. Its document is then revalidated in the
background; the active page keeps its matching asset release. This explicitly
allows a prepared document to be up to 30 seconds old. Expired/missing preparations
use the ordinary fresh-navigation path. Worker restarts invalidate the in-memory
preparation index and the next preparation clears orphaned speculative entries.
Choosing a prepared page promotes it into the normal reading cache. Unsaved
media can still make its offline status partial.

Guides retain their existing reading worker and perform no speculative prefetch.
Classic remains unchanged. The guide model download path is unchanged.

## Offline coverage and storage

An unobtrusive status label reports `Saving for offline use…`, `Available offline`,
`Offline — saved copy`, or a partial/incomplete save. Wait for the completed status
before testing the first offline reload. `Available offline` describes the saved
page and the supported resources loaded so far; it does not promise every lazy
feature or unvisited page. Lazily loaded public modules and JSON are added to the
saved page's dependency list after their successful requests.

The status is a compact outlined pill with a check, partial marker or saving
spinner. Default uses its existing `--text-color` / `--bg-color` variables, so
light/dark mode and live theme changes apply automatically. Guides inherit page
text and assistant/page surface colors. At narrow widths, the guide pill leaves
room for Assistant settings. The label remains a polite live region, respects
reduced motion and is hidden for printing. A 400 ms delay avoids flashing the
saving message on quick cached visits; slower/incomplete saves retain honest
status. The messages and meaning have not changed.

The worker manages root HTML reading pages and public CSS, JavaScript/modules,
JSON, images, and fonts in the supported asset directories. PHP/API requests,
POSTs, Authorization or Range requests, explicit `cache: 'no-store'` requests,
external origins, videos, downloads and embedded games retain their normal
behavior. Private/no-store responses, redirects, partial responses and errors are
not saved. An explicit 401, 403, 404 or 410 removes matching saved copies instead
of substituting old content.

The active reading cache has a 64 MiB / 600-resource budget and an 8 MiB per-file
limit. Oversized files can stream online but are not saved. Up to eight recently
read pages and their dependencies are prioritized; unpinned old assets are evicted
first. If necessary, older saved page groups are retired. Open pages are notified
when their saved group is evicted so the status does not continue claiming full
availability. Unneeded release metadata and closed-tab records are pruned.

Browser storage can still be denied, cleared or evicted. That does not prevent
online reading. During a cache-schema upgrade, old caches are deleted only after
all their entries have been copied and verified in the new cache. Failed writes
leave the old cache available as a fallback; unrelated application caches are
never removed. A retained legacy fallback cache can temporarily exceed the active
cache budget until migration succeeds.

## Publishing and deployment

### Full or manual deployments

1. Finish edits to the site's assets, then generate metadata with the existing
   Python runtime; no package installation is needed:

   ```sh
   python3 tools/build_offline_manifest.py
   ```

   This prepares both modern sites. A site path may be passed to prepare only one.
   Content hashes are generated automatically; do not hand-edit cache versions.

2. Upload each site's new/changed assets, `offline.js`, and `service-worker.js` to
   that site's document root over HTTPS. Serve the worker as JavaScript. Deploy
   the updated HTML and the article template. The main site's existing PHP
   security header needs the approved `worker-src 'self'` addition so it permits
   its own worker; its cache header remains unchanged. Classic needs no deployment.

3. Upload `offline-manifest.json` after its assets and **`offline-version.json`
   last**. Announcing a release before its assets are uploaded can leave a visit
   partially available. A failed hash check does not poison a previously saved
   matching asset. Routine non-bootstrap asset edits do not need an HTML loader
   query change; worker registration uses its generated content hash. When
   `offline.js` itself changes, bump its query in every affected page and the
   article template: the CDN/browser may retain the old unversioned bootstrap for
   a year before a worker exists to intercept requests. The current entry URL is
   `offline.js?v=3` on default and guides.

4. Cloudflare must include query strings in its cache key (standard behavior).
   Exclude these sites from an `Ignore Query String` rule if one exists. Managed
   asset bytes must match their source hashes: do not enable byte-changing CDN
   minification, image rewriting, or similar transformations for these paths.
   Ordinary HTTP gzip/Brotli compression is supported because Fetch decodes it
   before hashing. Existing IIS cache lifetimes can remain.

5. For the first rollout, purge the deployed HTML and bootstrap metadata/loader
   URLs from Cloudflare. Browsers with old HTML that never loaded the registration
   script may need one initial refresh. A service worker cannot install itself
   inside a previously cached page that does not contain its registration code.

**Edits made directly in the hosting File Manager also need regenerated metadata.**
The browser cannot know that a listed file's contents changed if its published
hash never changes. Generate and upload the two metadata files with manual asset
changes. Unlisted public assets use the conservative network-first fallback.

### Existing FTP publishing workflow

`FTPPublisher.upload()` now prepares and uploads offline metadata **after** its
ordinary files have uploaded and been verified. The small version marker is sent
last. A failed ordinary upload does not announce a new release. Article images
are hashed from their actual upload source, even when that source is under
`articles/images/`. Only uploaded assets are updated in a partial release, so
unpublished local edits are not accidentally announced. Classic uploads do not
create offline metadata. The full initial deployment must be done first.

**Production byte baseline:** the 23 October limited publication preserved older
server assets, mostly CRLF text while the checkout uses LF. Its production
manifests therefore intentionally differ from a full local rebuild. Before any
further partial upload, reconcile against the latest verified live manifest and
change only entries for the bytes actually being uploaded. The generic publisher
above uses its local baseline; reconcile that baseline before using it against
this production deployment. Do not announce hashes for unpublished local bytes.

The prefetch/status work and subsequent guide download-progress display were
published on 23 October with the owner's instruction. Their 13 runtime paths,
production-specific metadata and 66 loader-URL page corrections are tracked in
[default-prefetch-status-upload.md](default-prefetch-status-upload.md).

## Verification

The checks use the existing Python Playwright package and installed Chrome; they
install nothing and run against a local test server:

```sh
python3 -m unittest discover -s tools/tests -p test_offline_reading.py -v
python3 -m unittest discover -s tools/tests -p test_offline_manifest.py -v
python3 -m unittest discover -s tools/tests -p test_default_prefetch.py -v
python3 -m unittest discover -s tools/tests -p test_ftp_publisher.py -v
python3 -m unittest discover -s tools/tests -p test_pytk_publisher_tool.py -v
```

The browser server simulates stale one-year CDN/HTTP caching, body stalls,
metadata outages, failed deployments and quota errors. Checks cover changed-only
asset downloads, verified first-visit reuse, offline reading, cached JSON, separate
open-tab releases, retention budgets, migration failures, exclusions and classic
with JavaScript disabled. The actual guides hub and Ultima VII guide/assistant are
also exercised through real online and offline reloads. Tests exercise the nonce
and worker security policy without disabling CSP.

The latest combined cache/manifest/publisher acceptance is **49/49**: 26 existing
cache/manifest tests, 15 prefetch/theme regressions and eight FTP publisher tests.
The intentional shared-copy assertion now checks the unchanged reading core and
default-only prefetch extension rather than requiring identical workers/loaders.
The test server serves the real guide worker for guide tests. New negatives cover
private/unsafe URLs, checksum failure, budgets, Data Saver/2G, expired/stale
preparations, media exclusion, guide isolation and honest partial offline status.
Other checks cover deliberate versus cancelled hover, focus, two visible Blog
articles, a stalled-origin fast navigation and cached-status flicker. Real-page
visual checks cover both default themes and all six guides at 320 px; the actual
local Blog → Mobile Gaming 2026 card route uses the prepared document. Local
timing is not a production speed guarantee. Logs and screenshots are only in
`/tmp/default-prefetch-checks`, not deployment assets.

After deployment, verify registration, fresh updates and offline reloads against
the real IIS/Cloudflare setup. Local acceptance does not establish live rollout
behavior or equivalent behavior in every browser; test Safari/Firefox if those
are important visitor targets.

## Rollback

Removing registration tags prevents new registrations but does not remove workers
already installed. For an emergency rollback, serve a replacement worker at the
registered URL, with the appropriate Cloudflare purge/bypass, that unregisters
itself and deletes only its `orilla-offline:<scope>:` caches during activation.
Do not remove the worker file first: a 404 does not reliably remove old workers.
