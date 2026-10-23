# Genie and Sage acceptance checks

These supplemental checks cover the Ultima VII Sage, its General Hints and authored companion journals, and both Al-Qadim Genie surfaces. They use the host's existing Python Playwright package and `/usr/bin/google-chrome`; they do not install anything. The shared native-JavaScript runner remains the primary engine test harness.

From the repository root, serve the checkout on loopback port 8766 with the existing Python runtime, then run these scripts in order:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
# In another terminal, from the repository root:
python3 guides/tests/assistant/genie-sage-variants-browser.py
python3 guides/tests/assistant/genie-sage-fixtures-browser.py
python3 guides/tests/assistant/genie-sage-browser.py
python3 guides/tests/assistant/genie-sage-state-browser.py
```

The first script checks 29 Sage quests and 19 Genie chapters at all three spoiler levels, both Genie views, unsafe input, lowered spoiler levels, and replies after disconnecting. The second runs the fixed independent cases and dialogues in `genie-sage-cases.json`. The final script checks real map callbacks, chapter context changes, unchanged legacy progress, the existing journal, 390px layout, static delivery failures, malformed JSON, module rejection, and local recovery. Failed module delivery requires a browser reload; reopening can retry a failed JSON fetch.

Provider, proxy, and model route patterns are blocked before navigation in the network acceptance scripts. The retained JSON logs include request methods and query/body-presence flags; query contents are omitted. All fixtures use synthetic questions and progress. The scripts do not call any live inference endpoint. Their outputs are under `results/`; files ending in `-initial.json` preserve the earlier frozen-fixture measurement. The separate state script checks explicit possession and party reports, historical acquisition, malformed stored values, and unchanged legacy storage.

The variant sweep is structural coverage, not 144 independent language questions. The independent fixture has 32 questions (14 held out) and four dialogues (two held out). All facts are extracted from the existing guide, not independently verified game facts. The adapters intentionally decline conflicted subjects and leave prerequisite graphs unmodeled; see `docs/assistant-prompt-migration.md` for the source ledger.
