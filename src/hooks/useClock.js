import { useEffect, useState } from 'react';

// Wall clock string + daylight flag, refreshed every 30s.
export function useClock() {
  const [timeString, setTimeString] = useState('');
  const [isDaylight, setIsDaylight] = useState(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsDaylight(hours >= 6 && hours < 18);
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      );
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return { timeString, isDaylight };
}
