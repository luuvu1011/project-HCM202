"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GESTURE_COPY } from "@/data/gestureCopy";
import type { GestureKind } from "@/types/gestures";

interface Props {
  preview: { kind: GestureKind; confidence: number } | null;
}

/**
 * Chip nổi dưới webcam — hiển thị gesture đang detect realtime với confidence bar.
 */
export function GestureBadge({ preview }: Props) {
  const hasMeaningfulConfidence = preview && preview.confidence > 0.4;

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[3]">
      <AnimatePresence mode="wait">
        {hasMeaningfulConfidence ? (
          <motion.div
            key={preview!.kind}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-xl border px-3 py-2 backdrop-blur-md"
            style={{
              background: "rgba(26, 5, 6, 0.78)",
              borderColor: "rgba(216, 156, 60, 0.45)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-base font-bold"
                style={{ color: "#FFD700" }}
                aria-hidden
              >
                {GESTURE_COPY[preview!.kind].symbol}
              </span>
              <span
                className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: "#FFD700" }}
              >
                {GESTURE_COPY[preview!.kind].label}
              </span>
            </div>
            <div className="mt-1.5 h-[3px] w-32 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full"
                style={{
                  background: "linear-gradient(to right, #C8102E, #FFD700)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, preview!.confidence * 100)}%` }}
                transition={{ duration: 0.18 }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
