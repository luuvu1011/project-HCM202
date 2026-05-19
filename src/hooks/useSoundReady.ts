"use client";

import { useCallback, useEffect } from "react";
import { sound } from "@/lib/sound";

/**
 * Call once on first intentional interaction to satisfy browser autoplay policies later.
 */
export function useSoundReady() {
  const unlock = useCallback(() => {
    sound.unlock();
  }, []);

  useEffect(() => {
    const onKey = () => unlock();
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [unlock]);

  return { unlockSound: unlock };
}
