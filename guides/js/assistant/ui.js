import { level } from './policy.js';
import { modelRuntime } from './model-runtime.js';

// The three stored spoiler levels, named for what the player gets back.
export const HELP_LEVELS = [
    { value: 'gentle', label: 'Nudge', note: 'A pointer in the right direction. Names and solutions stay hidden.' },
    { value: 'balanced', label: 'Hint', note: 'Says who, where or what to look for, without the full solution.' },
    { value: 'direct', label: 'Full answer', note: 'The complete solution, including codes, exact places and spoilers.' }
];
const helpLabel = value => HELP_LEVELS.find(help => help.value === level(value))?.label || '';

// One stylesheet serves every guide; each page only sets --assistant-* colours.
if (typeof document !== 'undefined' && !document.querySelector('link[data-guide-assistant-style]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../../css/assistant.css', import.meta.url).href;
    link.dataset.guideAssistantStyle = '';
    document.head.appendChild(link);
}

let viewNumber = 0;
const assistantViews = new WeakMap();
const put = (tag, text, parent, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    if (parent) parent.appendChild(el);
    return el;
};
export function createView({ assistant, messages, input, sendButton, getContext = () => ({}),
    spoilerSelect, toneSelect, bindEvents = true, actions = {}, controlsBefore = messages }) {
    if (!messages || !input) throw new Error('Assistant view requires explicit message and input elements.');
    const id = `guide-assistant-${++viewNumber}`;
    const controls = document.createElement('div');
    controls.className = 'guide-assistant-controls';
    controlsBefore.before(controls);
    const contextLine = put('div', undefined, controls, 'ga-context');
    const row = put('div', undefined, controls, 'ga-row');
    const levelGroup = put('div', undefined, row, 'ga-level');
    levelGroup.setAttribute('role', 'radiogroup');
    levelGroup.setAttribute('aria-label', 'How much help');
    put('span', 'Help', levelGroup, 'ga-level-title').setAttribute('aria-hidden', 'true');
    const tools = put('div', undefined, row, 'ga-tools');
    const topicButton = put('button', 'New topic', tools, 'ga-tool');
    const sessionButton = put('button', 'Clear chat', tools, 'ga-tool');
    topicButton.type = sessionButton.type = 'button';
    topicButton.title = 'Forget the current subject and start this topic afresh.';
    sessionButton.title = 'Clear every conversation with this guide.';
    const note = put('p', undefined, controls, 'ga-level-note');
    note.id = id + '-note';
    levelGroup.setAttribute('aria-describedby', note.id);
    // The select stays the single source of truth (pages and checks read it);
    // the buttons are its visible, plain-language face.
    if (!spoilerSelect) {
        spoilerSelect = put('select', undefined, controls);
        spoilerSelect.id = id + '-spoilers';
        for (const help of HELP_LEVELS) put('option', help.label, spoilerSelect).value = help.value;
    }
    spoilerSelect.classList.add('ga-replaced');
    spoilerSelect.closest('label')?.classList.add('ga-replaced');
    spoilerSelect.setAttribute('aria-hidden', 'true');
    spoilerSelect.tabIndex = -1;
    const levelButtons = HELP_LEVELS.filter(help => [...spoilerSelect.options].some(option => level(option.value) === help.value))
        .map(help => {
            const button = put('button', help.label, levelGroup, 'ga-level-option');
            button.type = 'button';
            button.dataset.level = help.value;
            button.setAttribute('role', 'radio');
            return button;
        });
    messages.classList.add('guide-assistant-log');
    messages.setAttribute('role', 'log');
    messages.setAttribute('aria-live', 'polite');
    messages.setAttribute('aria-relevant', 'additions text');
    input.setAttribute('aria-label', input.getAttribute('aria-label') || 'Question for the local guide assistant');
    input.maxLength = 2000;
    let destroyed = false, sending = false;
    const views = assistantViews.get(assistant) || new Set();
    assistantViews.set(assistant, views);
    const viewToken = {};
    const firstView = views.size === 0;
    views.add(viewToken);
    function showLevel() {
        const current = level(spoilerSelect.value);
        for (const button of levelButtons) {
            const on = button.dataset.level === current;
            button.setAttribute('aria-checked', String(on));
            button.tabIndex = on ? 0 : -1;
        }
        note.textContent = HELP_LEVELS.find(help => help.value === current)?.note || '';
    }
    function synchronizePolicy() {
        const option = [...spoilerSelect.options].find(option => level(option.value) === assistant.policy);
        if (option) spoilerSelect.value = option.value;
        showLevel();
    }
    // Existing surfaces share one ceiling. Opening another view must not
    // silently restore its stale selector and reveal higher-detail history.
    if (!firstView) synchronizePolicy();
    const readContext = () => ({ ...getContext(), spoiler: level(spoilerSelect.value || getContext().spoiler),
        tone: toneSelect?.value || getContext().tone });
    function render() {
        if (destroyed) return;
        const ctx = readContext();
        contextLine.replaceChildren();
        if (ctx.label) {
            put('span', 'Asking about ', contextLine);
            put('strong', ctx.label, contextLine);
        }
        contextLine.hidden = !ctx.label;
        showLevel();
        messages.replaceChildren();
        const history = assistant.getHistory(ctx.contextId || 'default');
        if (!history.length) put('p', 'Local guide ready. Ask “What now?” for help with the part of the guide you have open, '
            + 'or ask about a person, place or item by name. Answers come only from this guide, inside your browser.', messages, 'ga-empty');
        for (const message of history) {
            const user = message.role === 'user';
            const block = put('div', undefined, messages,
                `walkthrough-ai-msg ${user ? 'user' : 'ai'} guide-assistant-message${message.decision === 'hidden' ? ' ga-hidden' : ''}`);
            const head = put('div', undefined, block, 'ga-msg-head');
            put('strong', user ? 'You' : 'Guide', head);
            // Which help level produced an answer, so a short reply is not mistaken for all there is.
            if (!user && (message.decision === 'answer' || message.fallbackOrigin) && message.level) put('span', helpLabel(message.level), head, 'ga-msg-level');
            put('div', message.text, block, 'ga-msg-text');
            const guideSources = (message.sources || []).filter(s => s.review !== 'external-research');
            const outsideSources = (message.sources || []).filter(s => s.review === 'external-research');
            if (guideSources.length) {
                const source = put('small', 'Source: existing guide; ' +
                    [...new Set(guideSources.map(s => s.review || 'unreviewed'))].join(', ') + '.', block, 'ga-msg-source');
                // Source URLs are intentionally not executable actions. At Direct, show the locator as text.
                if (ctx.spoiler === 'direct') source.textContent += ' ' + guideSources.map(s =>
                    [s.file, s.locator].filter(Boolean).join(' — ')).join('; ');
            }
            if (outsideSources.length) {
                // Research citations are always shown, as plain text, so readers can check them.
                const cited = outsideSources.flatMap(s => s.references || [{ label: s.locator, url: s.file }]);
                put('small', 'Outside research (not in this guide): ' + [...new Map(cited.map(c =>
                    [c.url, `${c.label} — ${c.url}${c.checkedAt ? ` (checked ${c.checkedAt})` : ''}`])).values()].join('; ') + '.',
                    block, 'ga-msg-source');
            }
            const buttons = (message.choices || []).length || (message.actions || []).length ? put('div', undefined, block, 'ga-msg-buttons') : null;
            for (const choice of message.choices || []) {
                const button = put('button', choice.label, buttons, 'ga-chip'); button.type = 'button';
                button.addEventListener('click', () => {
                    assistant.answer(choice.label, { ...readContext(), choiceId: choice.id, expectedRevision: choice.revision });
                    render(); input.focus();
                });
            }
            for (const action of message.actions || []) {
                // Callbacks are passed from the owning game scope; JSON cannot choose arbitrary functions.
                if (typeof actions[action.id] !== 'function') continue;
                const button = put('button', action.label || 'Open guide location', buttons, 'ga-chip ga-chip-action'); button.type = 'button';
                button.addEventListener('click', () => {
                    if (assistant.revision === message.revision) actions[action.id]();
                });
            }
        }
        messages.scrollTop = messages.scrollHeight;
    }
    function refresh() {
        const ctx = readContext();
        synchronizePolicy();
        assistant.activate(ctx.contextId);
        render();
    }
    const chatAllowed = () => document.documentElement.dataset.guideChat === 'ready'
        || !document.querySelector('script[src*="assistant/bootstrap.js"]');
    let wasReady=chatAllowed();
    function availability() {
        const ready=chatAllowed();
        input.disabled=!ready;
        if(sendButton)sendButton.disabled=!ready||sending;
        if(wasReady&&!ready)assistant.resetSession();
        wasReady=ready;
    }
    const unsubscribeModel=modelRuntime.subscribe(availability);
    availability();
    async function send() {
        if (destroyed || sending || !chatAllowed() || !input.value.trim()) return null;
        sending = true;
        if (sendButton) sendButton.disabled = true;
        const text = input.value.trim(); input.value = '';
        let reply;
        try {
            reply = await (assistant.answerAsync ? assistant.answerAsync(text, readContext()) : assistant.answer(text, readContext()));
        } catch {
            put('p', 'The local guide could not read this entry. Start a new topic or reload the page.', messages);
        } finally {
            sending = false;
            availability();
            if(chatAllowed())input.focus();
        }
        return reply;
    }
    function choose(value) {
        if (level(spoilerSelect.value) === value) return;
        spoilerSelect.value = value;
        // Pages listen to their own select (General Hints, saved choice), so the change is announced there.
        spoilerSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const pick = e => {
        const button = e.target.closest('.ga-level-option');
        if (button) { choose(button.dataset.level); button.focus(); }
    };
    // Arrow keys move between the help levels, as in any radio group.
    const step = e => {
        const offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        const at = levelButtons.indexOf(e.target);
        if (!offset || at < 0) return;
        e.preventDefault();
        const next = levelButtons[(at + offset + levelButtons.length) % levelButtons.length];
        choose(next.dataset.level); next.focus();
    };
    const enter = e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } };
    const change = () => { assistant.setPolicy(readContext().spoiler); render(); };
    const resetTopic = () => { assistant.resetTopic(readContext().contextId); input.focus(); };
    const resetSession = () => { assistant.resetSession(); input.focus(); };
    if (bindEvents) {
        if (sendButton && !sendButton.getAttribute('onclick')) sendButton.addEventListener('click', send);
        if (!input.getAttribute('onkeypress') && !input.getAttribute('onkeydown')) input.addEventListener('keydown', enter);
    }
    spoilerSelect.addEventListener('change', change);
    levelGroup.addEventListener('click', pick);
    levelGroup.addEventListener('keydown', step);
    topicButton.addEventListener('click', resetTopic);
    sessionButton.addEventListener('click', resetSession);
    const unsubscribe = assistant.subscribe(() => { synchronizePolicy(); render(); });
    if (firstView) assistant.setPolicy(readContext().spoiler);
    refresh();
    return { send, refresh, destroy() {
        destroyed = true; unsubscribe(); unsubscribeModel(); controls.remove(); views.delete(viewToken);
        sendButton?.removeEventListener('click', send); input.removeEventListener('keydown', enter);
        spoilerSelect.removeEventListener('change', change);
        spoilerSelect.classList.remove('ga-replaced'); spoilerSelect.closest('label')?.classList.remove('ga-replaced');
        spoilerSelect.removeAttribute('aria-hidden'); spoilerSelect.removeAttribute('tabindex');
    } };
}
