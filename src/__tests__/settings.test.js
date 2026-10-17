import { describe, expect, it } from 'vitest';
import { clampFocus, clampMinutes, sanitizePresets } from '../state/SettingsContext';

describe('clampMinutes', () => {
  it('clamps each preset to its own range', () => {
    expect(clampMinutes('shortBreakMinutes', 999)).toBe(60);
    expect(clampMinutes('longBreakMinutes', 999)).toBe(120);
    expect(clampMinutes('focusMinutes', 999)).toBe(180);
    expect(clampMinutes('shortBreakMinutes', 0)).toBe(1); // sticks at the floor, no wrap
    expect(clampMinutes('shortBreakMinutes', 'abc')).toBe(5); // garbage -> default
    expect(clampMinutes('longBreakMinutes', '12')).toBe(12);
  });

  it('clampFocus stays compatible', () => {
    expect(clampFocus(0)).toBe(5);
    expect(clampFocus(-5)).toBe(5);
    expect(clampFocus(NaN)).toBe(25);
    expect(clampFocus(200)).toBe(180);
  });
});

describe('sanitizePresets', () => {
  it('fills defaults', () => {
    expect(sanitizePresets(null)).toEqual({
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
    });
  });

  it('repairs corrupt break values that used to yield NaN durations', () => {
    const p = sanitizePresets({ focusMinutes: 30, shortBreakMinutes: 'x', longBreakMinutes: 9999 });
    expect(p).toEqual({ focusMinutes: 30, shortBreakMinutes: 5, longBreakMinutes: 120 });
  });
});
