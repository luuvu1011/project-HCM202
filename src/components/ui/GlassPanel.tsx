"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cinematicEase } from "@/animations/transitions";

type GlassPanelProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  variant?: "default" | "rich";
};

export function GlassPanel({
  className = "",
  children,
  variant = "default",
  ...rest
}: GlassPanelProps) {
  const richClass =
    variant === "rich"
      ? "bg-[rgba(8,18,36,0.76)] shadow-[0_32px_110px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.18)]"
      : "bg-glass/75 shadow-[0_24px_80px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.05)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.58, ease: cinematicEase }}
      className={`relative overflow-hidden rounded-3xl border border-glass-border backdrop-blur-2xl ${richClass} ${className}`}
      {...rest}
    >
      {/* ── Primary shimmer gradient (top-left to bottom-right) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(138deg, rgba(212,168,83,0.16) 0%, rgba(255,255,255,0.03) 35%, transparent 55%, rgba(194,59,59,0.09) 80%, rgba(212,168,83,0.12) 100%)",
          opacity: 0.65,
        }}
      />

      {/* ── Inner top highlight — simulates glass refraction ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 8%, rgba(212,168,83,0.45) 35%, rgba(255,255,255,0.18) 50%, rgba(212,168,83,0.35) 65%, transparent 92%)",
        }}
      />

      {/* ── Bottom edge depth shadow ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-60"
        style={{
          background:
            "linear-gradient(90deg, transparent 12%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 60%, transparent 88%)",
        }}
      />

      {/* ── Rich variant: corner radial glow ── */}
      {variant === "rich" && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-1/4 -top-1/4 h-3/4 w-3/4 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, rgba(212,168,83,0.10), transparent 65%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, rgba(26,75,124,0.18), transparent 65%)",
            }}
          />
        </>
      )}

      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}
