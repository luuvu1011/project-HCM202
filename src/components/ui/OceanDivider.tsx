"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Variant =
  | "light-to-cream"
  | "cream-to-red"
  | "red-to-white"
  | "white-to-dark"
  | "dark-to-red"
  | "white-to-cream"
  | "cream-to-dark"
  | "dark-to-dark"
  | "dark-to-white";

const PALETTE: Record<Variant, { top: string; bot: string; wave1: string; wave2: string; wave3: string }> = {
  "light-to-cream": {
    top: "#FFFFFF", bot: "#FDF5E8",
    wave1: "rgba(200,16,46,0.06)", wave2: "rgba(200,16,46,0.04)", wave3: "rgba(200,16,46,0.03)",
  },
  "cream-to-red": {
    top: "#FDF5E8", bot: "#C8102E",
    wave1: "rgba(180,14,40,0.55)", wave2: "rgba(200,16,46,0.35)", wave3: "rgba(220,20,50,0.22)",
  },
  "red-to-white": {
    top: "#C8102E", bot: "#FFFFFF",
    wave1: "rgba(200,16,46,0.55)", wave2: "rgba(200,16,46,0.30)", wave3: "rgba(200,16,46,0.14)",
  },
  "white-to-dark": {
    top: "#FFFFFF", bot: "#0d0204",
    wave1: "rgba(13,2,4,0.65)", wave2: "rgba(13,2,4,0.38)", wave3: "rgba(13,2,4,0.20)",
  },
  "dark-to-red": {
    top: "#1a0506", bot: "#C8102E",
    wave1: "rgba(154,12,34,0.75)", wave2: "rgba(180,14,40,0.45)", wave3: "rgba(200,16,46,0.28)",
  },
  "white-to-cream": {
    top: "#FFFFFF", bot: "#FDF8F3",
    wave1: "rgba(200,16,46,0.05)", wave2: "rgba(200,16,46,0.03)", wave3: "rgba(200,16,46,0.02)",
  },
  "cream-to-dark": {
    top: "#FDF5E8", bot: "#0d0204",
    wave1: "rgba(13,2,4,0.60)", wave2: "rgba(13,2,4,0.35)", wave3: "rgba(13,2,4,0.18)",
  },
  "dark-to-dark": {
    top: "#0d0204", bot: "#060910",
    wave1: "rgba(6,9,16,0.65)", wave2: "rgba(6,9,16,0.40)", wave3: "rgba(6,9,16,0.22)",
  },
  "dark-to-white": {
    top: "#1a0506", bot: "#FFFFFF",
    wave1: "rgba(255,255,255,0.22)", wave2: "rgba(255,255,255,0.12)", wave3: "rgba(255,255,255,0.06)",
  },
};

interface Props {
  variant?: Variant;
  flip?: boolean;
  height?: number;
}

export function OceanDivider({ variant = "light-to-cream", flip = false, height = 80 }: Props) {
  const pal = PALETTE[variant];
  const reduced = useReducedMotion();

  const wave1 = "M0,48 C180,18 360,72 540,48 C720,22 900,68 1080,48 C1260,24 1380,60 1440,48 L1440,80 L0,80 Z";
  const wave1b = "M0,40 C200,62 400,24 600,44 C800,62 1000,28 1200,44 C1340,56 1400,38 1440,44 L1440,80 L0,80 Z";

  const wave2 = "M0,58 C240,36 480,70 720,56 C960,38 1200,68 1440,56 L1440,80 L0,80 Z";
  const wave2b = "M0,52 C260,68 520,38 780,58 C1020,72 1260,44 1440,58 L1440,80 L0,80 Z";

  const wave3 = "M0,68 C300,58 600,74 900,66 C1100,60 1280,72 1440,66 L1440,80 L0,80 Z";
  const wave3b = "M0,64 C320,74 640,56 960,68 C1120,74 1300,60 1440,68 L1440,80 L0,80 Z";

  return (
    <div
      aria-hidden
      className="pointer-events-none relative w-full overflow-hidden"
      style={{
        height,
        background: pal.top,
        transform: flip ? "scaleY(-1)" : undefined,
        marginBottom: flip ? -1 : 0,
        marginTop: flip ? 0 : -1,
      }}
    >
      {/* Bottom fill */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: "40%", background: pal.bot }} />

      {/* Wave layer 3 (back) */}
      <svg
        viewBox="0 0 1440 80" className="absolute inset-0 w-full" style={{ height }} preserveAspectRatio="none">
        <motion.path
          initial={{ d: wave3 }}
          animate={{ d: reduced ? wave3 : [wave3, wave3b, wave3] }}
          fill={pal.wave3}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Wave layer 2 (mid) */}
      <svg
        viewBox="0 0 1440 80" className="absolute inset-0 w-full" style={{ height }} preserveAspectRatio="none">
        <motion.path
          initial={{ d: wave2 }}
          animate={{ d: reduced ? wave2 : [wave2, wave2b, wave2] }}
          fill={pal.wave2}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>

      {/* Wave layer 1 (front) */}
      <svg
        viewBox="0 0 1440 80" className="absolute inset-0 w-full" style={{ height }} preserveAspectRatio="none">
        <motion.path
          initial={{ d: wave1 }}
          animate={{ d: reduced ? wave1 : [wave1, wave1b, wave1] }}
          fill={pal.wave1}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>
    </div>
  );
}
