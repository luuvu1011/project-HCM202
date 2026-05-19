"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Atmosphere } from "@/lib/atmospheres";

// ─── Star field ────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 96 }, (_, i) => ({
  id: i,
  cx: (i * 137.508) % 100,
  cy: (i * 79.34) % 56,
  r: i % 5 === 0 ? 1.08 : i % 3 === 0 ? 0.70 : 0.40,
  baseOpacity: 0.12 + (i % 7) * 0.058,
  delay: (i % 13) * 0.30,
}));

// ─── Wave path pairs for GSAP morphing ────────────────────────────────────
const WAVE_PATHS = {
  deep: [
    "M0,200 C240,155 480,230 720,185 C960,140 1200,215 1440,165 L1440,280 L0,280 Z",
    "M0,215 C260,175 510,220 745,195 C985,170 1200,208 1440,178 L1440,280 L0,280 Z",
  ],
  mid: [
    "M0,95 C320,48 540,118 790,78 C1050,38 1260,92 1440,68 L1440,140 L0,140 Z",
    "M0,108 C305,65 558,108 808,90 C1065,72 1248,80 1440,82 L1440,140 L0,140 Z",
  ],
  surface: [
    "M0,55 C180,30 380,65 600,42 C820,20 1050,58 1260,38 C1340,30 1400,45 1440,38 L1440,80 L0,80 Z",
    "M0,60 C200,42 400,58 620,50 C840,42 1060,55 1270,44 C1350,38 1405,50 1440,44 L1440,80 L0,80 Z",
  ],
} as const;

// ─── Transition duration for atmosphere shifts ─────────────────────────────
const ATM_DURATION = "2600ms";

interface WorldOceanProps {
  atmosphere: Atmosphere;
}

export function WorldOcean({ atmosphere: atm }: WorldOceanProps) {
  const reduced = useReducedMotion();

  const waveDeepRef = useRef<SVGPathElement | null>(null);
  const waveMidRef = useRef<SVGPathElement | null>(null);
  const waveSurfRef = useRef<SVGPathElement | null>(null);

  // ── GSAP wave morphing ────────────────────────────────────────────────────
  useEffect(() => {
    if (reduced) return;

    const ease = "sine.inOut";
    const tls: gsap.core.Timeline[] = [];

    if (waveDeepRef.current) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(waveDeepRef.current, { duration: 14, attr: { d: WAVE_PATHS.deep[1] }, ease });
      tls.push(tl);
    }
    if (waveMidRef.current) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: 2.2 });
      tl.to(waveMidRef.current, { duration: 11, attr: { d: WAVE_PATHS.mid[1] }, ease });
      tls.push(tl);
    }
    if (waveSurfRef.current) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: 0.9 });
      tl.to(waveSurfRef.current, { duration: 8, attr: { d: WAVE_PATHS.surface[1] }, ease });
      tls.push(tl);
    }

    return () => tls.forEach((t) => t.kill());
  }, [reduced]);

  const ease = `cubic-bezier(0.4,0,0.2,1)`;
  const transition = reduced ? "none" : `all ${ATM_DURATION} ${ease}`;
  const opacityTransition = reduced ? "none" : `opacity ${ATM_DURATION} ${ease}`;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* ── Sky gradient ──────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${atm.skyTop} 0%, ${atm.skyMid} 45%, ${atm.skyHorizon} 100%)`,
          transition,
        }}
      />

      {/* ── Stars ─────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{ opacity: atm.starOpacity, transition: opacityTransition }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          {STARS.map((s) => (
            <motion.circle
              key={s.id}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="white"
              initial={{ opacity: s.baseOpacity }}
              animate={
                reduced
                  ? undefined
                  : { opacity: [s.baseOpacity, s.baseOpacity * 2.0, s.baseOpacity] }
              }
              transition={{
                duration: 3.2 + (s.id % 5),
                repeat: Infinity,
                ease: "easeInOut",
                delay: s.delay,
              }}
            />
          ))}
        </svg>
      </div>

      {/* ── Ambient left glow ─────────────────────────────────────────────── */}
      <div
        className="absolute -bottom-1/4 -left-1/4 h-[65%] w-[65%] rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${atm.ambientLeft}, transparent 65%)`,
          transition,
        }}
      />

      {/* ── Ambient right glow ────────────────────────────────────────────── */}
      <div
        className="absolute -right-1/4 -top-1/4 h-[55%] w-[55%] rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${atm.ambientRight}, transparent 65%)`,
          transition,
        }}
      />

      {/* ── Horizon warmth line ───────────────────────────────────────────── */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: "28%",
          height: "14%",
          background: `radial-gradient(ellipse 90% 100% at 50% 60%, ${atm.horizonColor}, transparent)`,
          opacity: atm.horizonOpacity,
          transition,
        }}
      />

      {/* ── Ocean body ────────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "32%",
          background: `linear-gradient(to bottom, ${atm.oceanTop}, ${atm.oceanBase})`,
          transition,
        }}
      />

      {/* ── Wave — deep layer ─────────────────────────────────────────────── */}
      <svg
        className="absolute left-0 w-full"
        style={{ bottom: "24%" }}
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wld-deep" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(14,36,72,0.68)" />
            <stop offset="100%" stopColor="rgba(3,6,14,0.0)" />
          </linearGradient>
        </defs>
        <path
          ref={waveDeepRef}
          fill="url(#wld-deep)"
          d={WAVE_PATHS.deep[0]}
        />
      </svg>

      {/* ── Wave — mid layer (gold shimmer) ───────────────────────────────── */}
      <svg
        className="absolute left-0 w-full"
        style={{ bottom: "18%" }}
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
      >
        <path
          ref={waveMidRef}
          fill="rgba(196,138,40,0.09)"
          d={WAVE_PATHS.mid[0]}
        />
      </svg>

      {/* ── Wave — surface foam ───────────────────────────────────────────── */}
      <svg
        className="absolute left-0 w-full"
        style={{ bottom: "14%" }}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path
          ref={waveSurfRef}
          fill="rgba(255,255,255,0.030)"
          d={WAVE_PATHS.surface[0]}
        />
      </svg>

      {/* ── Atmospheric fog band ──────────────────────────────────────────── */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: "20%",
          height: "22%",
          background:
            "radial-gradient(ellipse 120% 100% at 50% 50%, rgba(228,184,120,0.055), transparent)",
          opacity: atm.fogOpacity,
          transition: opacityTransition,
        }}
      />

      {/* ── Edge vignette (always present) ───────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 88% at 50% 50%, transparent 44%, rgba(2,4,10,0.62) 100%)",
        }}
      />
    </div>
  );
}
