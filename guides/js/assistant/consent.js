export const CONSENT_KEY = 'guide-assistant.preference.v1';
export function readChoice(storage, modelId) {
    try {
        const value = JSON.parse(storage.getItem(CONSENT_KEY));
        return value?.schema === 1 && ['enabled','off'].includes(value.choice)
            && (value.choice === 'off' || value.modelId === modelId) ? value.choice : null;
    } catch { return null; }
}
export function saveChoice(storage, choice, modelId) {
    try {
        if (choice === null) storage.removeItem(CONSENT_KEY);
        else storage.setItem(CONSENT_KEY, JSON.stringify({schema:1,choice,modelId}));
        return true;
    } catch { return false; }
}
