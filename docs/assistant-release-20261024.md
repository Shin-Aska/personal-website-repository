# Guide assistant release, 24 October 2026

The owner requested FTP publication followed by a local commit of the relevant
conversation and chat-layout changes. The established mapping is `guides/` to
`/guides`, `default/` to `/personal-website`, and `classic/` to `/site6`. This release
publishes only the guides.

Exactly 20 files were uploaded: 18 changed runtime assets (two stylesheets, five
game data files, five adapters and six shared assistant modules), then the guide
cache manifest, then its version marker. Tests, documentation, tools, model
binaries, private backups and other site roots were excluded from the upload.
No remote directory was mirrored or cleared.

All 20 previous destination files matched the expected baseline and were backed
up privately before replacement. Each completed temporary upload was read back
and verified before replacement. The server requires a backed-up rename swap;
the previous destination was renamed only after the temporary file was complete.
All final files passed full binary SHA-256 readback, followed by a second readback
of the entire release. There is no claim of an atomic multi-file deployment.

Production cache metadata preserves all 778 untouched live entries, including
the server's existing line endings. Its version is
`05272a595f7feedaf3e77d7ed6a066d426fc8689334bfaed75e91f3ec05834fe`.
The committed local manifest continues to describe checkout bytes; its different
version is intentional. Future partial uploads must reconcile against the latest
live manifest again.

Verification after upload:

- Public HTTPS returned the expected bytes and SHA-256 hashes for all 20 files,
  using hash-qualified assets and unique-query cache metadata.
- The live site passed 42 layout checks across six games and seven chat surfaces,
  with 98 actual UI sends at six desktop/mobile sizes. Real service workers were
  enabled, and each surface was reloaded under worker control before checking.
  Ultima VI's conversation scrolls both ways and keeps its composer reachable;
  both Al-Qadim views remain usable on short screens.
- Progress storage was unchanged. There were no page errors or requests containing
  tested question text. Existing Cloudflare performance POSTs were recorded.
- The standalone regression suite passed again: 1,245/1,245.

The live layout run uses the approved consent/worker fixture, so it does not
repeat native inference. The separate final conversation/native reports retain
their stated coverage and snapshot boundaries. See
[`deployment-20261024.json`](../guides/tests/assistant/evidence/deployment-20261024.json)
for the public release record and exact file hashes. Credentials, upload scripts,
rollback copies and raw deployment logs are stored outside Git.

Already-open guide documents need a navigation or reload to use the new module
graph. Controlled navigations fetch the current release through hash-qualified
assets. A clean uncontrolled first render, or a browser with service workers
disabled, can still receive older bare browser/CDN cache entries; universal
immediate first-render freshness is not claimed.

The commit includes authored fixtures, reproducible tests, documentation and
canonical final evidence. Earlier first/round/probe/failure captures remain local
as historical debugging material; references to those captures in earlier notes
do not imply that they are versioned. Git pushing remains owner-managed.
