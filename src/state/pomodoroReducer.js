import {assertPhase, PHASES, WORK_SESSIONS_PER_LONG_BREAK} from './constants';

// State: { phase, endAt, totalMs, workDone }
// endAt is an absolute timestamp, so background-tab throttling cannot cause drift.
export const initialTimer = Object.freeze({
    phase: PHASES.WORK,
    endAt: null,
    totalMs: 0,
    workDone: 0,
});

export function nextPhaseAfterWork(workDone) {
    return workDone % WORK_SESSIONS_PER_LONG_BREAK === 0 ? PHASES.LONG_BREAK : PHASES.SHORT_BREAK;
}

export function timerReducer(state, action) {
    switch (action.type) {
        case 'start':
            assertPhase(state.phase);
            return {...state, endAt: action.now + action.durationMs, totalMs: action.durationMs};

        case 'complete': {
            assertPhase(state.phase);
            if (state.phase === PHASES.WORK) {
                const workDone = state.workDone + 1;
                return {phase: nextPhaseAfterWork(workDone), endAt: null, totalMs: 0, workDone};
            }
            return {...state, phase: PHASES.WORK, endAt: null, totalMs: 0};
        }

        // Abandon the current session. Skipping does not count toward the long-break cycle.
        case 'skip':
            return {...state, phase: PHASES.WORK, endAt: null, totalMs: 0};

        default:
            return state;
    }
}
