"use client";

import { useCallback, useEffect, useRef } from "react";
import type { GestureEffectPayload, GestureKind, GestureListener } from "@/types/gestures";

/**
 * Placeholder gesture engine: swap internals for MediaPipe / TensorFlow.js / Webcam later.
 * Demo triggers: keyboard shortcuts (non-intrusive) + optional programmatic fire.
 */
export function useGestureBridge() {
  const listenersRef = useRef(new Set<GestureListener>());

  const subscribe = useCallback((fn: GestureListener) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  const emit = useCallback((payload: GestureEffectPayload) => {
    listenersRef.current.forEach((l) => l(payload));
  }, []);

  useEffect(() => {
    const map: Record<string, GestureKind> = {
      "1": "heart",
      "2": "thumbsUp",
      "3": "wave",
      "4": "special",
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const kind = map[e.key];
      if (!kind) return;
      emit({ kind });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emit]);

  return { subscribe, emitGesture: emit };
}
