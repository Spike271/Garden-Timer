import { describe, expect, it } from 'vitest';
import { growPlants, newSeed } from '../state/gardenLogic';
import { MAX_STAGE } from '../state/constants';

const replay = (n) => {
  let plants = [newSeed()];
  for (let i = 0; i < n; i++) plants = growPlants(plants, 'demo');
  return plants;
};
const blooms = (plants) => plants.filter((p) => p.stage === MAX_STAGE).length;

describe('real growth rules (what the landing timelapse replays)', () => {
  it('5 sessions can never give 3 full plants', () => {
    expect(blooms(replay(5))).toBe(1);
    expect(replay(5)).toHaveLength(2);
  });

  it('3 full blooms need 11 sessions', () => {
    expect(blooms(replay(10))).toBe(2);
    expect(blooms(replay(11))).toBe(3);
  });
});
