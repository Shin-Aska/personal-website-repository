"""Explicit enabled preference + worker fixture for legacy source/UI suites.

Those suites keep their original guide assertions and static-failure hooks.
model-consent-browser.py exercises actual model loading/inference and real SWs.
"""
import json
from pathlib import Path
_HERE = Path(__file__).resolve().parent
_PROFILE = json.loads((_HERE.parents[1]/'local-assistant/profile.json').read_text())
CONSENT_FIXTURE = (_HERE/'browser-consent-fixture.js').read_text().replace('__MODEL_ID__', json.dumps(_PROFILE['id']))
