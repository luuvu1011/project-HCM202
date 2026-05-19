"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function OceanParticles({ count = 48 }: { count?: number }) {
  const reduced = useReducedMotion();
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 17) % 100}%`,
    top: `${(i * 23) % 85}%`,
    delay: (i % 12) * 0.15,
    duration: 10 + (i % 7),
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute h-1 w-1 rounded-full bg-parchment/25 shadow-[0_0_12px_rgba(232,220,196,0.35)]"
          style={{ left: p.left, top: p.top }}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, -18, 0],
                  opacity: [0.15, 0.55, 0.2],
                }
          }
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
