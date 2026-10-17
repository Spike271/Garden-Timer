import { useCallback, useEffect, useRef } from 'react';

const INITIAL_DELAY_MS = 400;
const SLOW_MS = 120;
const FAST_MS = 50;
const FAST_AFTER_TICKS = 8;

// Press = one step immediately. Keep holding = repeats, speeding up.
// Returns props to spread on a button. Keyboard activation (Enter/Space) steps once via click.
export function useHoldRepeat(onStep) {
  const stepRef = useRef(onStep);
  const timerRef = useRef(null);

  useEffect(() => {
    stepRef.current = onStep;
  }, [onStep]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(
    (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      stop();
      stepRef.current();
      let ticks = 0;
      const tick = () => {
        stepRef.current();
        ticks += 1;
        timerRef.current = setTimeout(tick, ticks >= FAST_AFTER_TICKS ? FAST_MS : SLOW_MS);
      };
      timerRef.current = setTimeout(tick, INITIAL_DELAY_MS);
    },
    [stop],
  );

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onBlur: stop,
    onContextMenu: (e) => e.preventDefault(),
    // Mouse/touch clicks have detail >= 1 and were handled on pointerdown; keyboard has 0.
    onClick: (e) => {
      if (e.detail === 0) stepRef.current();
    },
  };
}
