import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../config';

const DEFAULTS = Object.freeze({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 });

// [min, max] minutes per preset.
export const LIMITS = Object.freeze({
  focusMinutes: Object.freeze([1, 180]),
  shortBreakMinutes: Object.freeze([1, 60]),
  longBreakMinutes: Object.freeze([1, 120]),
});
export const FOCUS_MIN = LIMITS.focusMinutes[0];
export const FOCUS_MAX = LIMITS.focusMinutes[1];

export function clampMinutes(key, value) {
  const [min, max] = LIMITS[key];
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n <= 0) return DEFAULTS[key];
  return Math.min(max, Math.max(min, n));
}

export const clampFocus = (value) => clampMinutes('focusMinutes', value);

export function sanitizePresets(raw) {
  const merged = { ...DEFAULTS, ...(raw && typeof raw === 'object' ? raw : {}) };
  const out = {};
  for (const key of Object.keys(LIMITS)) out[key] = clampMinutes(key, merged[key]);
  return out;
}

function loadPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESETS);
    return sanitizePresets(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULTS };
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [presets, setPresets] = useState(loadPresets);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
    } catch {}
  }, [presets]);

  // Applies to the next session. A running session keeps its original length.
  const setMinutes = useCallback((key, value) => {
    const clamped = clampMinutes(key, value);
    setPresets((p) => ({ ...p, [key]: clamped }));
    return clamped;
  }, []);

  const setFocusMinutes = useCallback((value) => setMinutes('focusMinutes', value), [setMinutes]);

  const value = useMemo(
    () => ({ presets, setFocusMinutes, setMinutes }),
    [presets, setFocusMinutes, setMinutes],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
