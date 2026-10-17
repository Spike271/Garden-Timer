import { PHASES } from './constants';
import { initialTimer } from './pomodoroReducer';
import { STORAGE_KEYS } from '../config/storageKeys';

const PHASE_VALUES = Object.values(PHASES);
const isCount = (n) => Number.isInteger(n) && n >= 0;
const isMs = (n) => Number.isFinite(n) && n >= 0;

// Validates a persisted timer blob. Returns a clean state or null if unusable.
// A session overdue by more than its own length was abandoned: it is dropped
// without growing the plant, so closing the tab for days is not a free bloom.
// A session overdue by less is kept; the first tick completes it normally.
export function hydrateTimer(saved, now) {
  if (!saved || typeof saved !== 'object') return null;
  if (!PHASE_VALUES.includes(saved.phase) || !isCount(saved.workDone)) return null;

  const base = {
    ...initialTimer,
    workDone: saved.workDone,
    focusMs: isMs(saved.focusMs) ? saved.focusMs : 0,
  };
  const hasSession =
    Number.isFinite(saved.endAt) && Number.isFinite(saved.totalMs) && saved.totalMs > 0;
  if (!hasSession) return { ...base, phase: saved.phase };

  const abandoned = now - saved.endAt > saved.totalMs;
  if (abandoned) return { ...base, phase: PHASES.WORK };
  return { ...base, phase: saved.phase, endAt: saved.endAt, totalMs: saved.totalMs };
}

// legacyWorkMs: assumed length of a past session when migrating the old
// workDone-only save, which never recorded real durations.
export function loadTimer({ storage, now, legacyWorkMs }) {
  try {
    const raw = storage.getItem(STORAGE_KEYS.TIMER);
    if (raw) {
      const hydrated = hydrateTimer(JSON.parse(raw), now);
      if (hydrated) return hydrated;
    }
    const legacy = parseInt(storage.getItem(STORAGE_KEYS.LEGACY_WORK_DONE), 10);
    if (isCount(legacy))
      return { ...initialTimer, workDone: legacy, focusMs: legacy * legacyWorkMs };
  } catch {}
  return initialTimer;
}

export function saveTimer(storage, state) {
  try {
    storage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(state));
  } catch {}
}
