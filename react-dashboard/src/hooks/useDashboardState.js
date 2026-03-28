import { useState, useMemo, useEffect } from 'react';
import { calc, calcMonths, buildPrevRates, enrichData } from '../utils/calculator';
import { loadSession, saveSession, lpres, spres, dpres } from '../utils/presets';

const defaultParams = {
    'date-start': '2026-01-01',
    'date-end': '2026-03-25',
    'lt-fast': 0.5,
    'buf-fast': 0.5,
    'max-fast': 2,
    'xyz-mult': 1.5,
    'moq-fast': 1,
    'zt-fast': 0,
    'lt-slow': 1,
    'buf-slow': 1,
    'max-slow': 3,
    'moq-slow': 1,
    'zt-slow': 0,
    'default-cost': 0
};

export function useDashboardState() {
    const [currentData, setCurrentDataRaw] = useState(null);
    const [prevData, setPrevData] = useState(null);
    const [params, setParams] = useState(defaultParams);

    // Data quality warnings — populated when a file is uploaded
    const [dataWarnings, setDataWarnings] = useState([]);

    // Interactive State (Persisted)
    const [sessionState, setSessionState] = useState(() => loadSession());

    // Bug 7 fix: Preset state lives here, not in Header render
    const [presets, setPresets] = useState(() => lpres());

    // Save session state to localStorage on change
    useEffect(() => {
        saveSession(sessionState);
    }, [sessionState]);

    // Wrap setCurrentData to also extract warnings from parsed file metadata
    const setCurrentData = (data) => {
        setCurrentDataRaw(data);
        if (data?.warnings && data.warnings.length > 0) {
            setDataWarnings(data.warnings);
        } else {
            setDataWarnings([]);
        }
    };

    // Auto-detect dates from uploaded file
    useEffect(() => {
        if (currentData?.dateStart && currentData?.dateEnd) {
            setParams(p => ({ ...p, 'date-start': currentData.dateStart, 'date-end': currentData.dateEnd }));
        }
    }, [currentData]);

    const results = useMemo(() => {
        if (!currentData?.rows) return [];

        const months = calcMonths(params['date-start'], params['date-end']);

        const tmp = calc(currentData.rows, months, params);

        const po = { urgent: 0, order: 1, watch: 2, ok: 3 };
        tmp.sort((a, b) => (po[a.priority] ?? 9) - (po[b.priority] ?? 9));

        const prevRates = buildPrevRates(prevData, months);
        const defCost = Number(params['default-cost']) || 0;
        enrichData(tmp, prevRates, defCost, sessionState.overrides);

        return tmp;
    }, [currentData, prevData, params, sessionState.overrides]);

    const updateParam = (key, val) => setParams(p => ({ ...p, [key]: val }));

    const setOverride = (code, val) => {
        setSessionState(s => ({
            ...s, overrides: { ...s.overrides, [code]: val }
        }));
    };
    const clearOverride = (code) => {
        setSessionState(s => {
            const next = { ...s.overrides };
            delete next[code];
            return { ...s, overrides: next };
        });
    };

    // Bug 2 fix: explicit setFlag(code, bool) alongside toggle
    const toggleFlag = (code) => {
        setSessionState(s => {
            const nextFlags = new Set(s.flags);
            if (nextFlags.has(code)) nextFlags.delete(code);
            else nextFlags.add(code);
            return { ...s, flags: nextFlags };
        });
    };
    const setFlag = (code, on) => {
        setSessionState(s => {
            const nextFlags = new Set(s.flags);
            if (on) nextFlags.add(code);
            else nextFlags.delete(code);
            return { ...s, flags: nextFlags };
        });
    };

    const setNote = (code, text) => {
        setSessionState(s => ({
            ...s, notes: { ...s.notes, [code]: text }
        }));
    };

    // Bug 7 fix: preset management in the hook, not inside Header render
    const savePreset = (name, p) => {
        if (!name) return;
        spres(name, p);
        setPresets(lpres());
    };
    const deletePreset = (name) => {
        if (!name) return;
        dpres(name);
        setPresets(lpres());
    };

    const dismissWarning = (index) => {
        setDataWarnings(w => w.filter((_, i) => i !== index));
    };

    return {
        currentData, setCurrentData,
        prevData, setPrevData,
        params, updateParam, setParams,
        sessionState, setSessionState,
        setOverride, clearOverride, toggleFlag, setFlag, setNote,
        results,
        dataWarnings, dismissWarning,
        presets, savePreset, deletePreset,
    };
}
