import { describe, expect, it } from 'vitest';
import { hydrateTimer, loadTimer, saveTimer } from '../state/timerStorage';
import { initialTimer } from '../state/pomodoroReducer';
import { PHASES } from '../state/constants';
import { STORAGE_KEYS } from '../config/storageKeys';

const MIN = 60_000;
const memoryStorage = (seed = {}) => {
  const data = { ...seed };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
};

const running = (over = {}) => ({
  phase: PHASES.WORK,
  endAt: 100 * MIN,
  totalMs: 25 * MIN,
  workDone: 3,
  focusMs: 75 * MIN,
  ...over,
});

describe('hydrateTimer', () => {
  it('restores a running session still in progress', () => {
    expect(hydrateTimer(running(), 90 * MIN)).toEqual(running());
  });

  it('keeps a just-expired session so the first tick completes it', () => {
    expect(hydrateTimer(running(), 100 * MIN + 5000).endAt).toBe(100 * MIN);
  });

  it('drops a session overdue by more than its own length, no phase credit', () => {
    const s = hydrateTimer(running(), 100 * MIN + 26 * MIN);
    expect(s).toMatchObject({ phase: PHASES.WORK, endAt: null, totalMs: 0, workDone: 3 });
    expect(s.focusMs).toBe(75 * MIN);
  });

  it('abandoned break returns to work', () => {
    const s = hydrateTimer(running({ phase: PHASES.SHORT_BREAK, totalMs: 5 * MIN }), 500 * MIN);
    expect(s.phase).toBe(PHASES.WORK);
    expect(s.endAt).toBeNull();
  });

  it('restores an idle timer', () => {
    const idle = {
      phase: PHASES.LONG_BREAK,
      endAt: null,
      totalMs: 0,
      workDone: 4,
      focusMs: 100 * MIN,
    };
    expect(hydrateTimer(idle, 0)).toEqual(idle);
  });

  it.each([
    null,
    'x',
    {},
    { phase: 'nope', workDone: 1 },
    { phase: PHASES.WORK, workDone: -1 },
    { phase: PHASES.WORK, workDone: 1.5 },
  ])('rejects garbage %j', (bad) => {
    expect(hydrateTimer(bad, 0)).toBeNull();
  });

  it('sanitizes bad focusMs and NaN session fields', () => {
    const s = hydrateTimer(
      { phase: PHASES.WORK, workDone: 2, focusMs: 'abc', endAt: NaN, totalMs: 5 },
      0,
    );
    expect(s).toMatchObject({ focusMs: 0, endAt: null, totalMs: 0, workDone: 2 });
  });
});

describe('loadTimer', () => {
  it('returns initial state on empty storage', () => {
    expect(loadTimer({ storage: memoryStorage(), now: 0, legacyWorkMs: 25 * MIN })).toEqual(
      initialTimer,
    );
  });

  it('round-trips through saveTimer', () => {
    const storage = memoryStorage();
    saveTimer(storage, running());
    expect(loadTimer({ storage, now: 90 * MIN, legacyWorkMs: 25 * MIN })).toEqual(running());
  });

  it('migrates the legacy workDone key with an estimated focusMs', () => {
    const storage = memoryStorage({ [STORAGE_KEYS.LEGACY_WORK_DONE]: '4' });
    const s = loadTimer({ storage, now: 0, legacyWorkMs: 25 * MIN });
    expect(s).toMatchObject({ workDone: 4, focusMs: 100 * MIN, endAt: null });
  });

  it('new key wins over legacy key', () => {
    const storage = memoryStorage({ [STORAGE_KEYS.LEGACY_WORK_DONE]: '9' });
    saveTimer(storage, running({ endAt: null, totalMs: 0 }));
    expect(loadTimer({ storage, now: 0, legacyWorkMs: 25 * MIN }).workDone).toBe(3);
  });

  it('survives corrupt JSON', () => {
    const storage = memoryStorage({ [STORAGE_KEYS.TIMER]: '{oops' });
    expect(loadTimer({ storage, now: 0, legacyWorkMs: 25 * MIN })).toEqual(initialTimer);
  });
});
