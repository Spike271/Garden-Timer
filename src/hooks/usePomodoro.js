import { useCallback, useEffect, useReducer, useState } from 'react';
import { useInterval } from './useInterval';
import { timerReducer } from '../state/pomodoroReducer';
import { loadTimer, saveTimer } from '../state/timerStorage';
import { PHASES } from '../state/constants';

const TICK_MS = 250;

// durations: { work, shortBreak, longBreak } in ms. Callbacks keep this hook plant-agnostic.
export function usePomodoro({ durations, onWorkComplete, onWorkSkip }) {
  const [state, dispatch] = useReducer(timerReducer, durations[PHASES.WORK], (legacyWorkMs) =>
    loadTimer({ storage: localStorage, now: Date.now(), legacyWorkMs }),
  );
  const [now, setNow] = useState(() => Date.now());
  const running = state.endAt !== null;

  // Persist on state transitions only (start/skip/complete), never per tick.
  useEffect(() => {
    saveTimer(localStorage, state);
  }, [state]);

  // Background tabs throttle timers; resync the display the moment the tab is visible.
  useEffect(() => {
    const resync = () => {
      if (document.visibilityState === 'visible') setNow(Date.now());
    };
    document.addEventListener('visibilitychange', resync);
    return () => document.removeEventListener('visibilitychange', resync);
  }, []);

  useInterval(
    () => {
      const t = Date.now();
      setNow(t);
      if (t < state.endAt) return;
      if (state.phase === PHASES.WORK) onWorkComplete();
      dispatch({ type: 'complete' });
    },
    running ? TICK_MS : null,
  );

  const start = useCallback(() => {
    const t = Date.now();
    setNow(t);
    dispatch({ type: 'start', now: t, durationMs: durations[state.phase] });
  }, [durations, state.phase]);

  const skip = useCallback(() => {
    if (running && state.phase === PHASES.WORK) onWorkSkip();
    dispatch({ type: 'skip' });
  }, [running, state.phase, onWorkSkip]);

  const remainingMs = running ? Math.max(0, state.endAt - now) : durations[state.phase];
  const progress = running && state.totalMs > 0 ? 1 - remainingMs / state.totalMs : 0;

  return {
    phase: state.phase,
    workDone: state.workDone,
    focusMs: state.focusMs,
    running,
    remainingMs,
    progress,
    start,
    skip,
  };
}
