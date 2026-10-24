# Conversation test history

These reports preserve the earlier runs referenced by the conversation audit and
source-review notes. They are debugging evidence, not additional executable test
cases or current acceptance results. Their original bytes and failure counts are
preserved so changes to expectations and routing can be traced.

The current passing campaign evidence is `conversation-final-acceptance.json`,
`conversation-campaign-node.json`, `conversation-campaign-browser.json`,
`conversation-native-completed.json`, `conversation-native-current.json`, and
`chat-layout-browser.json`. Production publication is recorded separately in
`deployment-20261024.json`. Native inference and the consent/worker fixture have
different measurement boundaries; see the reports and audit documentation.

Historical reports committed after the release:

- `chat-layout-before-*.json`: geometry before the Ultima VI and Al-Qadim fixes.
- `conversation-campaign-*-first.json`: initial per-game replay results.
- `conversation-campaign-browser-{ultima5,ultima6,ultima7,starcraft}.json`:
  per-game browser snapshots superseded by the integrated campaign report.
- `conversation-coverage-branches.json` and `conversation-lore-gap-probes.json`:
  probes that informed the reviewed family/help coverage and identity fixes.
- `conversation-native-full-first.json`, `conversation-native-full-final.json`,
  `conversation-native-probes-first.json`, and
  `conversation-native-transition-probes.json`: intermediate native runs. Despite
  its name, `full-final` retains two failed expectations and is superseded by
  `conversation-native-completed.json`.
- `conversation-starcraft-*-first.json`,
  `conversation-starcraft-records-round{2,3,4,5}.json`,
  `conversation-starcraft-restriction-repros.json`, and
  `conversation-starcraft-source-records-before.json`: the StarCraft source,
  expectation and restriction debugging sequence. The source-based correction
  ledger is `conversation-starcraft-expectation-corrections.json`.
- `conversation-typo.json` and `conversation-typo-round2.json`: earlier typo
  sweeps, superseded by `conversation-typo-final.json`.

Model weights, credentials, FTP tooling, private rollback copies and deployment
logs are not part of this history snapshot.
