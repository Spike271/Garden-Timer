import {useCallback, useEffect, useReducer, useState} from 'react';
import {useInterval} from './useInterval';
import {initialTimer, timerReducer} from '../state/pomodoroReducer';
import {PHASES} from '../state/constants';
import {STORAGE_KEYS} from '../config';

const TICK_MS = 250;

function getInitialTimer() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.WORK_DONE);
        if (raw) {
            const n = parseInt(raw, 10);
            if (!isNaN(n)) return {...initialTimer, workDone: n};
        }
    } catch {
    }
    return initialTimer;
}

// durations: { work, shortBreak, longBreak } in ms. Callbacks keep this hook plant-agnostic.
export function usePomodoro({durations, onWorkComplete, onWorkSkip}) {
    const [state, dispatch] = useReducer(timerReducer, undefined, getInitialTimer);
    const [now, setNow] = useState(() => Date.now());
    const running = state.endAt !== null;

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.WORK_DONE, state.workDone.toString());
        } catch {
        }
    }, [state.workDone]);

    useInterval(() => {
        const t = Date.now();
        setNow(t);
        if (t < state.endAt) return;
        if (state.phase === PHASES.WORK) onWorkComplete();
        dispatch({type: 'complete'});
    }, running ? TICK_MS : null);

    const start = useCallback(() => {
        const t = Date.now();
        setNow(t);
        dispatch({type: 'start', now: t, durationMs: durations[state.phase]});
    }, [durations, state.phase]);

    const skip = useCallback(() => {
        if (running && state.phase === PHASES.WORK) onWorkSkip();
        dispatch({type: 'skip'});
    }, [running, state.phase, onWorkSkip]);

    const remainingMs = running ? Math.max(0, state.endAt - now) : durations[state.phase];
    const progress = running && state.totalMs > 0 ? 1 - remainingMs / state.totalMs : 0;

    return {
        phase: state.phase,
        workDone: state.workDone,
        running,
        remainingMs,
        progress,
        start,
        skip,
    };
}
