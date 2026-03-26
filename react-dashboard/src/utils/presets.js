const PK = 'ro_presets_v1';
export function lpres() { try { return JSON.parse(localStorage.getItem(PK) || '{}'); } catch { return {}; } }

export function spres(n, p) {
    if (!n) return;
    const ps = lpres(); ps[n] = p; localStorage.setItem(PK, JSON.stringify(ps));
}

export function dpres(n) {
    if (!n) return;
    const ps = lpres(); delete ps[n]; localStorage.setItem(PK, JSON.stringify(ps));
}

const SK = 'ro_session_v2';
export function loadSession() {
    try {
        const d = JSON.parse(localStorage.getItem(SK) || '{}');
        return {
            overrides: d.overrides || {},
            notes: d.notes || {},
            flags: d.flags ? new Set(d.flags) : new Set()
        };
    } catch {
        return { overrides: {}, notes: {}, flags: new Set() };
    }
}
export function saveSession(state) {
    localStorage.setItem(SK, JSON.stringify({
        overrides: state.overrides, notes: state.notes, flags: [...state.flags]
    }));
}
