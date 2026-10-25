/**
 * Browser-only control regression checks for an already prepared real-model lab.
 * Run after evaluation, when both guide source sets are cached. These exercise
 * the actual controls and encoder/classifier; they do not fit or mock a model.
 */
export async function checkLabControls(api = window.intentPrototype, root = document) {
  if (!api?.head || typeof api.ask !== 'function' || typeof api.inspect !== 'function'
    || typeof api.setGame !== 'function') {
    throw new Error('Prepare the real-model intent lab before checking its controls.');
  }
  const control = selector => {
    const element = root.querySelector(selector);
    if (!element) throw new Error(`Missing actual lab control: ${selector}`);
    return element;
  };
  const reset = control('#reset');
  const game = control('#game');
  const question = control('#question');
  const send = control('#send');
  control('#chat');
  const view = root.defaultView || root.ownerDocument?.defaultView || window;
  const checks = [];
  const check = (name, passed, details) => checks.push({ name, passed: Boolean(passed), details });
  const change = (element, value) => {
    element.value = value;
    element.dispatchEvent(new view.Event('change', { bubbles: true }));
  };
  const sleep = milliseconds => new Promise(resolve => view.setTimeout(resolve, milliseconds));
  const historiesEmpty = state => Boolean(state && state.originalMessages === 0 && state.proposedMessages === 0);
  const historyDetails = state => ({ original: state?.originalMessages ?? null, proposed: state?.proposedMessages ?? null });
  const chatCount = () => root.querySelectorAll('#chat .turn').length;

  // Install rejection handling before dispatching a control event. AbortError is
  // the expected result and must never surface as an unhandled rejection.
  const observe = promise => Promise.resolve(promise).then(
    () => ({ settled: true, rejected: false }),
    error => ({ settled: true, rejected: true, name: error?.name, message: String(error?.message || error) }),
  );
  async function outcomeOf(observed) {
    let timer;
    try {
      return await Promise.race([
        observed,
        new Promise(resolve => { timer = view.setTimeout(() => resolve({ settled: false }), 5_000); }),
      ]);
    } finally {
      view.clearTimeout(timer);
    }
  }
  async function setup() {
    await api.setGame('ultima7');
  }
  async function assertStale(name, observed) {
    const outcome = await outcomeOf(observed);
    // Let queued browser work finish before asserting that no card reappeared.
    await sleep(0);
    check(`${name}: stale ask rejects with AbortError`, outcome.settled && outcome.rejected && outcome.name === 'AbortError', outcome);
  }

  await setup();
  const resetAsk = observe(api.ask('Who is Spark?'));
  reset.click();
  await assertStale('reset', resetAsk);
  let state = api.inspect();
  check('reset: both histories remain empty', historiesEmpty(state), historyDetails(state));
  check('reset: no reply card resurrects', chatCount() === 0, { turns: chatCount() });

  await setup();
  const answerLevelControls = () => [...root.querySelectorAll('select,input[type="radio"]')]
    .filter(element => element !== game);
  check('single answer mode: no answer-level selector or radio appears', answerLevelControls().length === 0, {
    unexpectedControls: answerLevelControls().map(element => ({ tag: element.tagName, id: element.id, name: element.name })),
  });
  check('single answer mode: no public help-level mutation API remains', !('setHelp' in api), { exposed: 'setHelp' in api });
  // Simulate stale DOM and URL preferences from an older chat without changing
  // storage. This hidden test artifact is removed before returning to the UI.
  const oldURL = view.location.href;
  const legacy = root.createElement ? root.createElement('select') : root.ownerDocument.createElement('select');
  legacy.id = 'spoiler';legacy.hidden = true;
  const lower = legacy.ownerDocument.createElement('option');lower.value = 'gentle';lower.textContent = 'Legacy test preference';
  legacy.append(lower);legacy.value = 'gentle';
  (root.body || root).append(legacy);
  try {
    const lowerURL = new URL(oldURL);lowerURL.searchParams.set('spoiler', 'gentle');lowerURL.searchParams.set('help', 'gentle');
    view.history.replaceState(view.history.state, '', lowerURL.href);
    const beforeCards = chatCount();
    question.value = 'Who is Iolo?';send.click();
    const deadline = view.performance.now() + 5_000;
    while ((chatCount() === beforeCards || question.disabled) && view.performance.now() < deadline) await sleep(10);
    state = api.inspect();
    const rendered = root.querySelector('#chat .turn:last-child .prototype-answer')?.textContent || '';
    check('single answer mode: an actual UI request answers despite legacy lower preferences', chatCount() > beforeCards && /bard/i.test(rendered), {
      cardsAdded: chatCount() - beforeCards, rendered,
    });
    check('single answer mode: UI requests keep both engines and interpreter at direct', state?.originalPolicy === 'direct'
      && state?.proposedPolicy === 'direct' && state?.interpreter?.spoiler === 'direct', {
      original: state?.originalPolicy ?? null, proposed: state?.proposedPolicy ?? null,
      interpreter: state?.interpreter?.spoiler ?? null, legacyValue: legacy.value,
    });
  } finally {
    legacy.remove();view.history.replaceState(view.history.state, '', oldURL);
  }
  check('single answer mode: legacy test preferences leave no controls behind', answerLevelControls().length === 0, {
    unexpectedControls: answerLevelControls().length,
  });

  await setup();
  const selectionAsk = observe(api.ask('Who is Spark?'));
  change(game, 'starcraft');
  // The guide was cached during evaluation. Still bound polling below two
  // seconds so a broken selection cannot hang the browser regression check.
  const started = view.performance.now();
  const deadline = started + 1_500;
  while (api.inspect()?.gameId !== 'starcraft' && view.performance.now() < deadline) await sleep(10);
  const selectionWaitMs = view.performance.now() - started;
  await assertStale('game selection', selectionAsk);
  state = api.inspect();
  check('game selection: selector matches the active StarCraft session', game.value === 'starcraft' && state?.gameId === 'starcraft', {
    selected: game.value, active: state?.gameId ?? null, selectionWaitMs,
  });
  check('game selection: both new histories remain empty', historiesEmpty(state), historyDetails(state));
  check('game selection: no old reply card resurrects', chatCount() === 0, { turns: chatCount() });

  // Real-model cross-layer regression: an old engine subject must not outlive
  // the interpreter's pending/unknown subject. No Worker or classifier is mocked.
  await setup();
  const describe = turn => ({
    status: turn.packet.status, modelIntent: turn.packet.modelIntent, routeOrigin: turn.packet.routeOrigin,
    entity: turn.packet.entityTitle, decision: turn.proposed.decision, recordIds: turn.proposed.recordIds,
    submittedToEngine: turn.submittedToEngine, text: turn.proposed.text,
  });
  const iolo = await api.ask('Who is Iolo?');
  check('subject isolation: initial Iolo request establishes a sourced answer', iolo.proposed.decision === 'answer'
    && iolo.proposed.recordIds.some(id => id.toLowerCase().includes('iolo'))
    && iolo.proposed.sources.length > 0, describe(iolo));
  const typo = await api.ask('Who is Duprae?');
  check('subject isolation: misspelled Duprae remains nonfactual pending clarification', typo.proposed.decision !== 'answer', describe(typo));
  const unresolvedPronoun = await api.ask('Where is he?');
  check('subject isolation: unresolved pronoun cannot produce a factual answer', unresolvedPronoun.proposed.decision !== 'answer', describe(unresolvedPronoun));
  check('subject isolation: unresolved pronoun cannot reuse any Iolo record', !unresolvedPronoun.proposed.recordIds.some(id => id.toLowerCase().includes('iolo')), describe(unresolvedPronoun));
  const explicit = await api.ask('Who is Dupre?');
  const explicitAccepted = explicit.packet.status === 'ready';
  check('subject isolation: an accepted explicit Dupre request restores its sourced answer', !explicitAccepted
    || (explicit.proposed.decision === 'answer' && explicit.proposed.sources.length > 0
      && explicit.proposed.recordIds.some(id => id.toLowerCase().includes('dupre'))
      && !explicit.proposed.recordIds.some(id => id.toLowerCase().includes('iolo'))), {
    ...describe(explicit), acceptedByRealModelRoute: explicitAccepted,
    condition: 'Recovery answer is required when the real-model interpreter accepts the explicit request; this check does not manufacture a label.',
  });

  return { passed: checks.every(item => item.passed), checks };
}
