'use client';

import { useEffect, useRef, useState } from 'react';

export function useCountdown(initialSeconds: number, running: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running || seconds <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, initialSeconds]);

  const progress = initialSeconds > 0 ? seconds / initialSeconds : 0;
  return { seconds, progress };
}

export function useServerCountdown(
  serverCountdown: number,
  questionStartedAt: number,
  timeLimit: number,
  running: boolean,
) {
  const [seconds, setSeconds] = useState(timeLimit);

  useEffect(() => {
    if (!running || timeLimit <= 0) return;

    function tick() {
      const elapsed = (Date.now() - questionStartedAt) / 1_000;
      const remaining = Math.max(0, timeLimit - elapsed);
      setSeconds(Math.ceil(remaining));
    }

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [running, questionStartedAt, timeLimit]);

  const progress = timeLimit > 0 ? seconds / timeLimit : 0;
  return { seconds, progress };
}
