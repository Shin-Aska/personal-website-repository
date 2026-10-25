import { modelRuntime } from './model-runtime.js';

// One stylesheet serves every guide; each page only sets --assistant-* colours.
if (typeof document !== 'undefined' && !document.querySelector('link[data-guide-assistant-style]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../../css/assistant.css', import.meta.url).href;
    link.dataset.guideAssistantStyle = '';
    document.head.appendChild(link);
}

const put = (tag, text, parent, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    if (parent) parent.appendChild(el);
    return el;
};
export function createView({ assistant, messages, input, sendButton, getContext = () => ({}),
    toneSelect, bindEvents = true, actions = {}, controlsBefore = messages }) {
    if (!messages || !input) throw new Error('Assistant view requires explicit message and input elements.');
    const controls = document.createElement('div');
    controls.className = 'guide-assistant-controls';
    controlsBefore.before(controls);
    const contextLine = put('div', undefined, controls, 'ga-context');
    const row = put('div', undefined, controls, 'ga-row');
    const tools = put('div', undefined, row, 'ga-tools');
    const expandButton = put('button', 'Expand chat', tools, 'ga-tool ga-expand');
    const topicButton = put('button', 'New topic', tools, 'ga-tool');
    const sessionButton = put('button', 'Clear chat', tools, 'ga-tool');
    expandButton.type = topicButton.type = sessionButton.type = 'button';
    expandButton.setAttribute('aria-expanded', 'false');
    topicButton.title = 'Forget the current subject and start this topic afresh.';
    sessionButton.title = 'Clear every conversation with this guide.';
    messages.classList.add('guide-assistant-log');
    messages.setAttribute('role', 'log');
    messages.setAttribute('aria-live', 'polite');
    messages.setAttribute('aria-relevant', 'additions text');
    input.setAttribute('aria-label', input.getAttribute('aria-label') || 'Question for the local guide assistant');
    input.maxLength = 2000;
    const sendLabel = sendButton?.textContent;
    const activity = put('div', undefined, controls, 'ga-activity');
    activity.setAttribute('role', 'status');
    activity.hidden = true;
    let destroyed = false, sending = false;
    let expandedDialog = null, movedNodes = [], previousOverflow = '';

    function restoreExpanded() {
        if (!expandedDialog) return;
        for (const [node, marker] of movedNodes) {
            node.classList.remove('ga-expanded-composer');
            marker.replaceWith(node);
        }
        movedNodes = [];
        expandedDialog.remove(); expandedDialog = null;
        document.body.style.overflow = previousOverflow;
        expandButton.hidden = false;
        expandButton.setAttribute('aria-expanded', 'false');
        if (!destroyed && expandButton.isConnected) expandButton.focus();
    }
    function closeExpanded() {
        if (!expandedDialog) return;
        expandedDialog.close();
        restoreExpanded();
    }
    function expand() {
        if (expandedDialog || destroyed) return;
        const composer = input.closest('.u5-seer-composer, .u6-seer-composer, .sage-input-row, .walkthrough-ai-input') || input.parentElement;
        if (!composer || composer.contains(messages)) return;
        const theme = getComputedStyle(messages);
        const dialog = document.createElement('dialog');
        dialog.className = 'ga-expanded-dialog';
        dialog.setAttribute('aria-label', 'Expanded guide chat');
        for (const variable of ['--assistant-accent', '--assistant-on-accent', '--assistant-surface', '--assistant-text', '--assistant-muted']) {
            const value = theme.getPropertyValue(variable);
            if (value) dialog.style.setProperty(variable, value);
        }
        dialog.style.color = theme.color;
        dialog.style.fontFamily = theme.fontFamily;
        // Keep the guide's existing solid surface and typography in the top layer.
        for (let node = messages; node; node = node.parentElement) {
            const background = getComputedStyle(node).backgroundColor;
            if (background && background !== 'transparent' && !/rgba\([^)]*,\s*(?:0(?:\.\d+)?)\s*\)/.test(background)) {
                dialog.style.backgroundColor = background; break;
            }
        }
        const header = put('div', undefined, dialog, 'ga-expanded-header');
        const game = { albion: 'Albion', ultima5: 'Ultima V', ultima6: 'Ultima VI', ultima7: 'Ultima VII', alqadim: 'Al-Qadim', starcraft: 'StarCraft' }[assistant.gameId] || 'Guide';
        put('strong', game + ' chat', header);
        const close = put('button', 'Return to guide', header, 'ga-expanded-close');
        close.type = 'button'; close.addEventListener('click', closeExpanded);
        expandedDialog = dialog;
        previousOverflow = document.body.style.overflow;
        for (const node of [controls, messages, composer]) {
            const marker = document.createComment('guide-chat-position');
            node.before(marker); movedNodes.push([node, marker]); dialog.append(node);
        }
        composer.classList.add('ga-expanded-composer');
        expandButton.hidden = true;
        expandButton.setAttribute('aria-expanded', 'true');
        dialog.addEventListener('close', restoreExpanded, { once: true });
        dialog.addEventListener('keydown', event => { if (event.key === 'Escape') event.stopPropagation(); });
        document.body.append(dialog);
        document.body.style.overflow = 'hidden';
        dialog.showModal(); input.focus();
        messages.scrollTop = messages.scrollHeight;
    }
    // Every chat surface uses the complete available answer, including after
    // a context change or another view sharing this assistant is reopened.
    const readContext = () => {
        const context = getContext();
        return { ...context, spoiler: 'direct', fullAnswersOnly: true, tone: toneSelect?.value || context.tone };
    };
    function render() {
        if (destroyed) return;
        if (assistant.policy !== 'direct') {
            assistant.setPolicy('direct');
            return;
        }
        const ctx = readContext();
        contextLine.replaceChildren();
        if (ctx.label) {
            put('span', 'Asking about ', contextLine);
            put('strong', ctx.label, contextLine);
        }
        contextLine.hidden = !ctx.label;
        messages.replaceChildren();
        const history = assistant.getHistory(ctx.contextId || 'default');
        if (!history.length) put('p', 'Local guide ready. Ask “What now?” for help with the part of the guide you have open, '
            + 'or ask about a person, place or item by name. Answers come only from this guide, inside your browser.', messages, 'ga-empty');
        for (const message of history) {
            const user = message.role === 'user';
            const block = put('div', undefined, messages,
                `walkthrough-ai-msg ${user ? 'user' : 'ai'} guide-assistant-message${message.decision === 'hidden' ? ' ga-hidden' : ''}`);
            if (!user) block.dataset.decision = message.decision;
            const head = put('div', undefined, block, 'ga-msg-head');
            put('strong', user ? 'You' : 'Guide', head);
            put('div', message.text, block, 'ga-msg-text');
            for (const link of message.sourceLinks || []) {
                let url;
                try { url = new URL(link.url); } catch { continue; }
                if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) continue;
                const anchor = put('a', link.text || url.href, block, 'ga-source-link');
                anchor.href = url.href; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
            }
            const guideSources = (message.sources || []).filter(s => s.review !== 'external-research');
            const outsideSources = (message.sources || []).filter(s => s.review === 'external-research');
            if (guideSources.length) {
                const source = put('small', 'Source: existing guide; ' +
                    [...new Set(guideSources.map(s => s.review || 'unreviewed'))].join(', ') + '.', block, 'ga-msg-source');
                // Source locators are shown as text, never executable actions.
                source.textContent += ' ' + guideSources.map(s =>
                    [s.file, s.locator].filter(Boolean).join(' — ')).join('; ');
            }
            if (outsideSources.length) {
                // Research citations are always shown, as plain text, so readers can check them.
                const cited = outsideSources.flatMap(s => s.references || [{ label: s.locator, url: s.file }]);
                put('small', 'Outside research (not in this guide): ' + [...new Map(cited.map(c =>
                    [JSON.stringify([c.label,c.url,c.checkedAt]), `${c.label} — ${c.url}${c.checkedAt ? ` (checked ${c.checkedAt})` : ''}`])).values()].join('; ') + '.',
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
                    if (assistant.revision === message.revision) { closeExpanded(); actions[action.id](); }
                });
            }
        }
        messages.scrollTop = messages.scrollHeight;
    }
    function refresh() {
        const ctx = readContext();
        assistant.setPolicy('direct');
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
        if(wasReady&&!ready){closeExpanded();assistant.resetSession();}
        wasReady=ready;
    }
    const unsubscribeModel=modelRuntime.subscribe(availability);
    availability();
    async function send() {
        if (destroyed || sending || !chatAllowed() || !input.value.trim()) return null;
        sending = true;
        if (sendButton) { sendButton.disabled = true; sendButton.textContent = 'Thinking…'; }
        messages.setAttribute('aria-busy', 'true');
        activity.textContent = 'Looking at the guide…'; activity.hidden = false;
        const text = input.value.trim(); input.value = '';
        let reply;
        try {
            reply = await (assistant.answerAsync ? assistant.answerAsync(text, readContext()) : assistant.answer(text, readContext()));
        } catch {
            put('p', 'The local guide could not read this entry. Start a new topic or reload the page.', messages);
        } finally {
            sending = false;
            messages.setAttribute('aria-busy', 'false'); activity.hidden = true;
            if (sendButton) sendButton.textContent = sendLabel;
            availability();
            if(!destroyed && chatAllowed())input.focus();
        }
        return reply;
    }
    const enter = e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } };
    const resetTopic = () => { assistant.resetTopic(readContext().contextId); input.focus(); };
    const resetSession = () => { assistant.resetSession(); input.focus(); };
    if (bindEvents) {
        if (sendButton && !sendButton.getAttribute('onclick')) sendButton.addEventListener('click', send);
        if (!input.getAttribute('onkeypress') && !input.getAttribute('onkeydown')) input.addEventListener('keydown', enter);
    }
    topicButton.addEventListener('click', resetTopic);
    sessionButton.addEventListener('click', resetSession);
    expandButton.addEventListener('click', expand);
    const unsubscribe = assistant.subscribe(render);
    refresh();
    return { send, refresh, destroy() {
        destroyed = true; closeExpanded(); unsubscribe(); unsubscribeModel(); controls.remove();
        sendButton?.removeEventListener('click', send); input.removeEventListener('keydown', enter);
    } };
}
