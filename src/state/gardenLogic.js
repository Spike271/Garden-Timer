import { MAX_STAGE } from './constants';

export const newSeed = () => ({ stage: 0, wilted: false });

// Local calendar day as 'YYYY-MM-DD'. Local time (not UTC), so "today" matches the user's clock.
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

export function wiltPlants(list) {
  const next = list.slice();
  const last = next[next.length - 1];
  next[next.length - 1] = { stage: Math.max(0, last.stage - 1), wilted: true };
  return next;
}

export function countBloomsOn(list, dayKey) {
  return list.filter(
    (p) => p.stage >= MAX_STAGE && !p.wilted && (!p.bloomedOn || p.bloomedOn === dayKey),
  ).length;
}
