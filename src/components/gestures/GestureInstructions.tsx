"use client";

import { motion } from "framer-motion";
import { GESTURE_COPY, GESTURE_ORDER } from "@/data/gestureCopy";
import type { GestureKind } from "@/types/gestures";

interface Props {
  activeKind: GestureKind | null;
  /** Click handler — for keyboard fallback */
  onTrigger?: (kind: GestureKind) => void;
}

export function GestureInstructions({ activeKind, onTrigger }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {GESTURE_ORDER.map((kind, idx) => {
        const copy = GESTURE_COPY[kind];
        const isActive = activeKind === kind;
        return (
          <motion.button
            key={kind}
            type="button"
            onClick={() => onTrigger?.(kind)}
            aria-label={`Kích hoạt thủ công: ${copy.label}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            animate={
              isActive
                ? { scale: [1, 1.04, 1], boxShadow: "0 0 0 2px rgba(200,16,46,0.55)" }
                : {}
            }
            className="card-white relative flex flex-col items-start gap-2 rounded-2xl px-4 py-4 text-left transition-all hover:shadow-lg"
            style={{
              borderColor: isActive ? "rgba(200,16,46,0.55)" : undefined,
            }}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className="text-2xl font-bold leading-none"
                style={{ color: "#C8102E" }}
                aria-hidden
              >
                {copy.symbol}
              </span>
              <span
                className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.20em] text-patriot-muted"
              >
                #{idx + 1}
              </span>
            </div>
            <p className="font-cinzel text-sm font-semibold tracking-wide text-patriot-title">
              {copy.label}
            </p>
            <p className="text-[11px] leading-relaxed text-patriot-muted sm:text-xs">
              {copy.hint}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
