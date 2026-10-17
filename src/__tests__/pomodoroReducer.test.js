import { describe, expect, it } from 'vitest';
import { initialTimer, nextPhaseAfterWork, timerReducer } from '../state/pomodoroReducer';
import { PHASES } from '../state/constants';

const MIN = 60_000;

describe('timerReducer', () => {
  it('start sets endAt and totalMs', () => {
    const s = timerReducer(initialTimer, { type: 'start', now: 1000, durationMs: 25 * MIN });
    expect(s.endAt).toBe(1000 + 25 * MIN);
    expect(s.totalMs).toBe(25 * MIN);
  });

  it('start is ignored while already running', () => {
    const running = timerReducer(initialTimer, { type: 'start', now: 1000, durationMs: 25 * MIN });
    expect(timerReducer(running, { type: 'start', now: 9999, durationMs: 5 * MIN })).toBe(running);
  });

  it('completing work banks the real session length into focusMs', () => {
    let s = timerReducer(initialTimer, { type: 'start', now: 0, durationMs: 25 * MIN });
    s = timerReducer(s, { type: 'complete' });
    expect(s.workDone).toBe(1);
    expect(s.focusMs).toBe(25 * MIN);
    expect(s.phase).toBe(PHASES.SHORT_BREAK);
    expect(s.endAt).toBeNull();
  });

  it('changing focus length later does not rewrite past focusMs', () => {
    let s = timerReducer(initialTimer, { type: 'start', now: 0, durationMs: 25 * MIN });
    s = timerReducer(s, { type: 'complete' });
    s = timerReducer(s, { type: 'complete' }); // finish break
    s = timerReducer(s, { type: 'start', now: 0, durationMs: 50 * MIN });
    s = timerReducer(s, { type: 'complete' });
    expect(s.focusMs).toBe(75 * MIN);
  });

  it('completing a break does not add focus time', () => {
    const afterWork = timerReducer(
      timerReducer(initialTimer, { type: 'start', now: 0, durationMs: 25 * MIN }),
      { type: 'complete' },
    );
    const inBreak = timerReducer(afterWork, { type: 'start', now: 0, durationMs: 5 * MIN });
    const done = timerReducer(inBreak, { type: 'complete' });
    expect(done.focusMs).toBe(25 * MIN);
    expect(done.phase).toBe(PHASES.WORK);
    expect(done.workDone).toBe(1);
  });

  it('skip abandons the session without counting it', () => {
    const running = timerReducer(initialTimer, { type: 'start', now: 0, durationMs: 25 * MIN });
    const s = timerReducer(running, { type: 'skip' });
    expect(s).toMatchObject({ phase: PHASES.WORK, endAt: null, workDone: 0, focusMs: 0 });
  });

  it('long break after every 4th completed session', () => {
    expect(nextPhaseAfterWork(3)).toBe(PHASES.SHORT_BREAK);
    expect(nextPhaseAfterWork(4)).toBe(PHASES.LONG_BREAK);
    expect(nextPhaseAfterWork(8)).toBe(PHASES.LONG_BREAK);
  });
});
