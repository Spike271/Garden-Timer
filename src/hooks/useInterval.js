import { useEffect, useRef } from 'react';

// Keeps the latest callback in a ref so the interval is not restarted on every render.
// Pass delay = null to pause.
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
