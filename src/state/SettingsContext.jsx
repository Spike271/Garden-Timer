import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {STORAGE_KEYS} from '../config';

const DEFAULTS = Object.freeze({focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15});
export const FOCUS_MIN = 1;
export const FOCUS_MAX = 180;

export function clampFocus(value) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n) || n <= 0) return DEFAULTS.focusMinutes;
    return Math.min(FOCUS_MAX, Math.max(FOCUS_MIN, n));
}

function loadPresets() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.PRESETS);
        const parsed = raw ? {...DEFAULTS, ...JSON.parse(raw)} : {...DEFAULTS};
        parsed.focusMinutes = clampFocus(parsed.focusMinutes);
        return parsed;
    } catch {
        return {...DEFAULTS};
    }
}

const SettingsContext = createContext(null);

export function SettingsProvider({children}) {
    const [presets, setPresets] = useState(loadPresets);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
        } catch {
            // Storage unavailable: presets still work for this session.
        }
    }, [presets]);

    // Applies to the next session. A running session keeps its original length.
    const setFocusMinutes = useCallback((value) => {
        const clamped = clampFocus(value);
        setPresets((p) => ({...p, focusMinutes: clamped}));
        return clamped;
    }, []);

    const value = useMemo(() => ({presets, setFocusMinutes}), [presets, setFocusMinutes]);
    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
    return ctx;
}
