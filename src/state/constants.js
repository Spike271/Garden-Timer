export const PHASES = Object.freeze({
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
});

export const WORK_SESSIONS_PER_LONG_BREAK = 4;
export const STAGES = Object.freeze(['seed', 'sprout', 'sapling', 'bloom']);
export const MAX_STAGE = STAGES.length - 1;

// Dev-only guard: JS has no types, so a typo'd phase string fails silently without this.
export function assertPhase(phase) {
  if (import.meta.env.DEV && !Object.values(PHASES).includes(phase)) {
    throw new Error(`Unknown phase: ${phase}`);
  }
}
