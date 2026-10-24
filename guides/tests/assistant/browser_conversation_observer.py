"""Transparent observation of assistants registered by production createView.

Keep the original WeakMap storage behavior. Holding the registered assistant
lets UI tests inspect the reply that was actually rendered, including private
page closures, without replacing routing, model calls or source material.
"""
ASSISTANT_OBSERVER = r'''(() => {
    const OriginalWeakMap = window.WeakMap;
    window.campaignObservedAssistants = [];
    window.WeakMap = class extends OriginalWeakMap {
        set(key, value) {
            if (key && typeof key.getHistory === 'function' && typeof key.inspect === 'function'
                && typeof key.answerAsync === 'function' && !window.campaignObservedAssistants.includes(key))
                window.campaignObservedAssistants.push(key);
            return super.set(key, value);
        }
    };
})();'''
