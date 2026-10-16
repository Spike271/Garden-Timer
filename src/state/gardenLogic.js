import { MAX_STAGE } from './constants';

// Pure garden rules, kept free of React so they can be tested on their own.
// Plant shape: { stage: number, wilted: boolean, bloomedOn?: 'YYYY-MM-DD' }
// bloomedOn is the local calendar day the plant last reached full bloom.

export const newSeed = () => ({ stage: 0, wilted: false });

// Local calendar day as 'YYYY-MM-DD'. Local time (not UTC), so "today" matches the user's clock.
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Completed focus session: the active (last) plant grows one stage and clears any wilt.
// A healthy bloom stays as is and a new seed is planted as the new active plant.
export function growPlants(list, todayKey) {
  const next = list.slice();
  const last = next[next.length - 1];
  if (last.stage >= MAX_STAGE && !last.wilted) {
    next.push(newSeed());
    return next;
  }
  const stage = Math.min(MAX_STAGE, last.stage + 1);
  next[next.length - 1] =
    stage === MAX_STAGE ? { stage, wilted: false, bloomedOn: todayKey } : { stage, wilted: false };
  return next;
}

// Forfeited focus session: the active plant drops one stage and wilts. A plant that is no
// longer in bloom loses its bloom date.
export function wiltPlants(list) {
  const next = list.slice();
  const last = next[next.length - 1];
  next[next.length - 1] = { stage: Math.max(0, last.stage - 1), wilted: true };
  return next;
}

// Healthy blooms that reached full bloom on the given day. Plants saved before bloom dates
// existed have no bloomedOn, so they are never counted as today's.
export function countBloomsOn(list, dayKey) {
  return list.filter((p) => p.stage === MAX_STAGE && !p.wilted && p.bloomedOn === dayKey).length;
}
