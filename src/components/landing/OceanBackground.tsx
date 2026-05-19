"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STARS = Array.from({ length: 72 }, (_, i) => ({
  id: i,
  cx: (i * 137.508) % 100,          // golden-ratio spread
  cy: (i * 79.34)  % 55,             // upper sky only
  r: i % 5 === 0 ? 1.1 : i % 3 === 0 ? 0.75 : 0.45,
  opacity: 0.12 + (i % 7) * 0.055,
  delay: (i % 11) * 0.4,
}));

export function OceanBackground() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08152a] via-ocean-deep to-ocean-deep" />

      {/* ── Star field ── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {STARS.map((s) => (
          <motion.circle
            key={s.id}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="white"
            initial={{ opacity: s.opacity }}
            animate={reduced ? undefined : { opacity: [s.opacity, s.opacity * 2.2, s.opacity] }}
            transition={{
              duration: 3 + (s.id % 5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: s.delay,
            }}
          />
        ))}
      </svg>

      {/* ── Aurora / atmospheric glow behind horizon ── */}
      <motion.div
        aria-hidden
        className="absolute -left-1/4 top-[8%] h-[50%] w-[150%]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(26,75,124,0.55), rgba(12,40,80,0.25) 55%, transparent 80%)",
        }}
        animate={
          reduced
            ? undefined
            : { x: [0, 28, 0], opacity: [0.7, 1.0, 0.7] }
        }
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle red accent glow (pre-revolutionary tension) */}
      <motion.div
        aria-hidden
        className="absolute right-[-5%] top-[15%] h-[35%] w-[55%]"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(194,59,59,0.08), transparent 65%)",
        }}
        animate={
          reduced
            ? undefined
            : { opacity: [0.5, 0.9, 0.5] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Wave layer 1 — deep ocean glow ── */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] sm:w-full"
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="obg-wave1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(26,75,124,0.48)" />
            <stop offset="100%" stopColor="rgba(5,15,31,0.8)" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#obg-wave1)"
          d="M0,200 C240,155 480,230 720,185 C960,140 1200,215 1440,165 L1440,280 L0,280 Z"
          animate={
            reduced
              ? undefined
              : {
                  d: [
                    "M0,200 C240,155 480,230 720,185 C960,140 1200,215 1440,165 L1440,280 L0,280 Z",
                    "M0,215 C260,175 510,220 745,195 C985,170 1200,208 1440,178 L1440,280 L0,280 Z",
                    "M0,200 C240,155 480,230 720,185 C960,140 1200,215 1440,165 L1440,280 L0,280 Z",
                  ],
                }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* ── Wave layer 2 — gold shimmer ── */}
      <svg
        className="absolute -bottom-4 left-0 w-[200%] sm:w-full"
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="obg-wave2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="rgba(212,168,83,0.14)" />
            <stop offset="100%" stopColor="rgba(5,15,31,0.0)"     />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#obg-wave2)"
          d="M0,95 C320,48 540,118 790,78 C1050,38 1260,92 1440,68 L1440,140 L0,140 Z"
          animate={
            reduced
              ? undefined
              : {
                  d: [
                    "M0,95 C320,48 540,118 790,78 C1050,38 1260,92 1440,68 L1440,140 L0,140 Z",
                    "M0,108 C305,65 558,108 808,90 C1065,72 1248,80 1440,82 L1440,140 L0,140 Z",
                    "M0,95 C320,48 540,118 790,78 C1050,38 1260,92 1440,68 L1440,140 L0,140 Z",
                  ],
                }
          }
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* ── Wave layer 3 — lightest, fast foam ── */}
      <svg
        className="absolute -bottom-2 left-0 w-[200%] sm:w-full"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          fill="rgba(255,255,255,0.04)"
          d="M0,55 C180,30 380,65 600,42 C820,20 1050,58 1260,38 C1340,30 1400,45 1440,38 L1440,80 L0,80 Z"
          animate={
            reduced
              ? undefined
              : {
                  d: [
                    "M0,55 C180,30 380,65 600,42 C820,20 1050,58 1260,38 C1340,30 1400,45 1440,38 L1440,80 L0,80 Z",
                    "M0,60 C200,42 400,58 620,50 C840,42 1060,55 1270,44 C1350,38 1405,50 1440,44 L1440,80 L0,80 Z",
                    "M0,55 C180,30 380,65 600,42 C820,20 1050,58 1260,38 C1340,30 1400,45 1440,38 L1440,80 L0,80 Z",
                  ],
                }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
