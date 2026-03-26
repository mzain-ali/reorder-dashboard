import { useState, useMemo, useEffect } from 'react';
import { calc, calcMonths, buildPrevRates, enrichData } from '../utils/calculator';
import { loadSession, saveSession } from '../utils/presets';

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
    const [fastData, setFastData] = useState(null);
    const [slowData, setSlowData] = useState(null);
    const [prevFastData, setPrevFastData] = useState(null);
    const [prevSlowData, setPrevSlowData] = useState(null);

    const [params, setParams] = useState(defaultParams);
    
    // Interactive State (Persisted)
    const [sessionState, setSessionState] = useState(() => loadSession());
    
    // Save session state to localStorage on change
    useEffect(() => {
        saveSession(sessionState);
    }, [sessionState]);

    // Triggers a calculation (in React, just derived state based on a trigger counter or memo)
    // Actually, since React re-renders on state change, we can just useMemo for the results!
    const results = useMemo(() => {
        if (!fastData && !slowData) return [];
        
        const months = calcMonths(params['date-start'], params['date-end']);
        
        const fp = { 
            lt: Number(params['lt-fast']) || 0.5, 
            buf: Number(params['buf-fast']) || 0.5, 
            max: Number(params['max-fast']) || 2, 
            xm: Number(params['xyz-mult']) || 1.5, 
            moq: Number(params['moq-fast']) || 1, 
            zt: Number(params['zt-fast']) || 0 
        };
        const sp = { 
            lt: Number(params['lt-slow']) || 1, 
            buf: Number(params['buf-slow']) || 1, 
            max: Number(params['max-slow']) || 3, 
            xm: 1, 
            moq: Number(params['moq-slow']) || 1, 
            zt: Number(params['zt-slow']) || 0 
        };

        let tmp = [];
        if (fastData) tmp = tmp.concat(calc(fastData.rows, 'fast', months, fp));
        if (slowData) tmp = tmp.concat(calc(slowData.rows, 'slow', months, sp));

        const po = { urgent: 0, order: 1, watch: 2, ok: 3 };
        tmp.sort((a, b) => (po[a.priority] ?? 9) - (po[b.priority] ?? 9));

        // Enrich with trend and cost
        const prevRates = buildPrevRates(prevFastData, prevSlowData, months);
        const defCost = Number(params['default-cost']) || 0;
        enrichData(tmp, prevRates, defCost, sessionState.overrides);

        return tmp;
    }, [fastData, slowData, prevFastData, prevSlowData, params, sessionState.overrides]);

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
    const toggleFlag = (code) => {
        setSessionState(s => {
            const nextFlags = new Set(s.flags);
            if (nextFlags.has(code)) nextFlags.delete(code);
            else nextFlags.add(code);
            return { ...s, flags: nextFlags };
        });
    };
    const setNote = (code, text) => {
        setSessionState(s => ({
            ...s, notes: { ...s.notes, [code]: text }
        }));
    };

    return {
        fastData, setFastData,
        slowData, setSlowData,
        prevFastData, setPrevFastData,
        prevSlowData, setPrevSlowData,
        params, updateParam, setParams,
        sessionState, setSessionState,
        setOverride, clearOverride, toggleFlag, setNote,
        results
    };
}
