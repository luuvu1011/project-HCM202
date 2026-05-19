"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ShipState } from "@/hooks/useScrollShip";

// ─── Route trail ──────────────────────────────────────────────────────────────
// Path in a viewBox="0 0 100 100" SVG with preserveAspectRatio="none",
// so coordinates map directly to viewport percentages (x→vw, y→vh).
// Waypoints: Ben Nha Rong (68,55) → Marseille (60,50) → London (52,47) →
//            Atlantic low (44,54) → New York (37,51) → Paris (30,47) → Soviet (22,44)
const ROUTE_PATH =
  "M 68,55 C 65,52 62,51 60,50 C 57,49 54,48 52,47 " +
  "C 49,46 46,51 44,54 C 42,57 39,52 37,51 " +
  "C 34,49 32,48 30,47 C 27,46 24,45 22,44";

// Port dot markers (viewport %)
const PORT_MARKERS = [
  { id: "ben-nha-rong", cx: 68, cy: 55, threshold: 0.00 },
  { id: "marseille",    cx: 60, cy: 50, threshold: 0.18 },
  { id: "london",       cx: 52, cy: 47, threshold: 0.34 },
  { id: "new-york",     cx: 37, cy: 51, threshold: 0.58 },
  { id: "paris",        cx: 30, cy: 47, threshold: 0.74 },
  { id: "lien-xo",      cx: 22, cy: 44, threshold: 1.00 },
] as const;

// ─── Ship SVG (bow faces LEFT = direction of westward travel) ─────────────────
// viewBox="0 0 240 170", water-line at y≈128
function ShipSVG({ reduced }: { reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 240 170"
      className="w-full"
      aria-hidden
      style={{
        filter:
          "drop-shadow(0 18px 44px rgba(0,0,0,0.55)) drop-shadow(0 0 22px rgba(196,138,40,0.07))",
      }}
    >
      <defs>
        <linearGradient id="vsh-hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#1c2f4c" />
          <stop offset="65%"  stopColor="#122030" />
          <stop offset="100%" stopColor="#080f1e" />
        </linearGradient>
        <linearGradient id="vsh-sail" x1="0.1" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#f2e8d8" />
          <stop offset="70%"  stopColor="#cca870" />
          <stop offset="100%" stopColor="#9e7a40" />
        </linearGradient>
        <linearGradient id="vsh-sail-off" x1="0.15" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#e2d4c0" />
          <stop offset="70%"  stopColor="#b89060" />
          <stop offset="100%" stopColor="#8c6830" />
        </linearGradient>
        <linearGradient id="vsh-mast" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#6e4e18" />
          <stop offset="42%"  stopColor="#d4a840" />
          <stop offset="100%" stopColor="#6e4e18" />
        </linearGradient>
        <linearGradient id="vsh-water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgba(20,55,100,0.55)" />
          <stop offset="100%" stopColor="rgba(4,10,22,0.0)"    />
        </linearGradient>
        <filter id="vsh-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Water / wake area ─────────────────────────────────────── */}
      <ellipse cx="120" cy="135" rx="110" ry="10"
        fill="url(#vsh-water)" />

      {/* Wake streaks (STERN side = right, since bow is left) */}
      <motion.g
        animate={reduced ? undefined : { opacity: [0.40, 0.65, 0.40] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="202" cy="128" rx="28" ry="3.5"
          fill="rgba(200,220,240,0.16)" />
        <ellipse cx="212" cy="131" rx="18" ry="2.2"
          fill="rgba(200,220,240,0.10)" />
        <ellipse cx="220" cy="134" rx="10" ry="1.5"
          fill="rgba(200,220,240,0.07)" />
      </motion.g>

      {/* ── Hull ─────────────────────────────────────────────────── */}
      {/* Main hull body */}
      <motion.g
        animate={reduced ? undefined : { x: [0, 2, -1, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M 22,128 C 18,119 20,108 30,104 L 205,101 C 216,103 222,113 222,128 C 222,141 212,147 198,147 L 40,147 C 28,145 22,138 22,128 Z"
          fill="url(#vsh-hull)"
          stroke="rgba(196,138,40,0.32)"
          strokeWidth="1.4"
        />

        {/* Gold waterline stripe */}
        <path
          d="M 24,122 L 212,118 C 218,119 220,122 219,124 L 24,128 Z"
          fill="rgba(196,138,40,0.45)"
        />

        {/* Lower hull keel accent */}
        <path
          d="M 26,136 L 208,134 L 210,140 L 26,142 Z"
          fill="rgba(8,14,28,0.7)"
        />

        {/* Stern cabin block (right side) */}
        <rect x="193" y="84" width="28" height="20" rx="2"
          fill="#0e1f38" stroke="rgba(196,138,40,0.22)" strokeWidth="0.8" />
        {/* Cabin roof */}
        <rect x="194" y="83" width="26" height="4" rx="1"
          fill="#0a1628" />
        {/* Stern gallery windows */}
        <rect x="197" y="91" width="6" height="4" rx="1"
          fill="rgba(196,138,40,0.18)" stroke="rgba(196,138,40,0.38)" strokeWidth="0.6" />
        <rect x="208" y="91" width="6" height="4" rx="1"
          fill="rgba(196,138,40,0.18)" stroke="rgba(196,138,40,0.38)" strokeWidth="0.6" />

        {/* Portholes */}
        {[85, 110, 140, 170].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={116} r={3.8}
              fill="rgba(196,138,40,0.12)"
              stroke="rgba(196,138,40,0.42)" strokeWidth="1" />
            <circle cx={cx} cy={116} r={1.6}
              fill="rgba(196,138,40,0.08)" />
          </g>
        ))}

        {/* Bowsprit — extends left/forward from bow */}
        <line x1="27" y1="110" x2="-8" y2="96"
          stroke="url(#vsh-mast)" strokeWidth="2.2" strokeLinecap="round" />
        {/* Bowsprit stay */}
        <line x1="-8" y1="96" x2="27" y2="104"
          stroke="rgba(168,136,48,0.28)" strokeWidth="0.7" />
      </motion.g>

      {/* ── Masts, yards, sails, rigging ─────────────────────────── */}
      <motion.g
        animate={reduced ? undefined : { x: [0, 2, -1, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* ─ Foremast (leftmost) ─ */}
        <line x1="80" y1="102" x2="80" y2="30"
          stroke="url(#vsh-mast)" strokeWidth="3" strokeLinecap="round" />
        {/* Fore yard */}
        <line x1="56" y1="48" x2="104" y2="46"
          stroke="#b48a30" strokeWidth="1.6" strokeLinecap="round" />
        {/* Fore cap */}
        <circle cx="80" cy="31" r="2.2" fill="#d4a840" />
        {/* Fore sail */}
        <motion.path
          d="M 56,48 L 104,46 L 102,100 L 59,102 Z"
          fill="url(#vsh-sail-off)"
          opacity="0.85"
          animate={reduced ? undefined : {
            d: [
              "M 56,48 L 104,46 L 102,100 L 59,102 Z",
              "M 57,48 L 104,47 L 103,100 L 60,102 Z",
              "M 56,48 L 104,46 L 102,100 L 59,102 Z",
            ],
          }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ─ Mainmast (center, tallest) ─ */}
        <line x1="138" y1="101" x2="138" y2="8"
          stroke="url(#vsh-mast)" strokeWidth="3.8" strokeLinecap="round" />
        {/* Main upper yard */}
        <line x1="106" y1="26" x2="170" y2="24"
          stroke="#b48a30" strokeWidth="2" strokeLinecap="round" />
        {/* Main lower yard */}
        <line x1="112" y1="58" x2="164" y2="56"
          stroke="#b48a30" strokeWidth="1.8" strokeLinecap="round" />
        {/* Main cap + Vietnamese flag pennant */}
        <circle cx="138" cy="9" r="2.6" fill="#d4a840" />
        <path d="M 138,9 L 156,4 L 140,17 Z"
          fill="rgba(194,59,59,0.80)" />
        {/* Main upper sail */}
        <motion.path
          d="M 106,26 L 170,24 L 168,56 L 112,58 Z"
          fill="url(#vsh-sail)"
          opacity="0.90"
          animate={reduced ? undefined : {
            d: [
              "M 106,26 L 170,24 L 168,56 L 112,58 Z",
              "M 107,26 L 170,25 L 169,56 L 113,58 Z",
              "M 106,26 L 170,24 L 168,56 L 112,58 Z",
            ],
          }}
          transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Main lower sail */}
        <motion.path
          d="M 112,58 L 164,56 L 162,101 L 115,102 Z"
          fill="url(#vsh-sail)"
          opacity="0.86"
          animate={reduced ? undefined : {
            d: [
              "M 112,58 L 164,56 L 162,101 L 115,102 Z",
              "M 113,58 L 164,57 L 163,101 L 116,102 Z",
              "M 112,58 L 164,56 L 162,101 L 115,102 Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />

        {/* Staysail between foremast and mainmast */}
        <motion.path
          d="M 104,46 L 140,28 L 140,100 C 120,95 108,82 104,70 Z"
          fill="url(#vsh-sail-off)"
          opacity="0.68"
          animate={reduced ? undefined : {
            d: [
              "M 104,46 L 140,28 L 140,100 C 120,95 108,82 104,70 Z",
              "M 105,46 L 140,29 L 140,100 C 121,94 109,81 105,69 Z",
              "M 104,46 L 140,28 L 140,100 C 120,95 108,82 104,70 Z",
            ],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* ─ Mizzenmast (rightmost) ─ */}
        <line x1="194" y1="101" x2="194" y2="52"
          stroke="url(#vsh-mast)" strokeWidth="2.8" strokeLinecap="round" />
        {/* Mizzen yard */}
        <line x1="178" y1="66" x2="210" y2="64"
          stroke="#b48a30" strokeWidth="1.5" strokeLinecap="round" />
        {/* Mizzen cap */}
        <circle cx="194" cy="53" r="2" fill="#d4a840" />
        {/* Mizzen sail */}
        <motion.path
          d="M 178,66 L 210,64 L 208,100 L 181,101 Z"
          fill="url(#vsh-sail-off)"
          opacity="0.80"
          animate={reduced ? undefined : {
            d: [
              "M 178,66 L 210,64 L 208,100 L 181,101 Z",
              "M 179,66 L 210,65 L 209,100 L 182,101 Z",
              "M 178,66 L 210,64 L 208,100 L 181,101 Z",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />

        {/* ─ Rigging network ─ */}
        {/* Forestay: bow tip → mainmast top */}
        <line x1="26" y1="108" x2="138" y2="10"
          stroke="rgba(168,136,48,0.28)" strokeWidth="0.8" />
        {/* Main shroud port */}
        <line x1="138" y1="24" x2="112" y2="100"
          stroke="rgba(168,136,48,0.26)" strokeWidth="0.8" />
        {/* Main shroud stbd */}
        <line x1="138" y1="24" x2="165" y2="100"
          stroke="rgba(168,136,48,0.26)" strokeWidth="0.8" />
        {/* Backstay */}
        <line x1="138" y1="18" x2="205" y2="102"
          stroke="rgba(168,136,48,0.20)" strokeWidth="0.7" />
        {/* Fore-to-main stay */}
        <line x1="80" y1="34" x2="138" y2="14"
          stroke="rgba(168,136,48,0.22)" strokeWidth="0.7" />
        {/* Fore shrouds */}
        <line x1="80" y1="44" x2="60" y2="102"
          stroke="rgba(168,136,48,0.22)" strokeWidth="0.7" />
        <line x1="80" y1="44" x2="102" y2="102"
          stroke="rgba(168,136,48,0.22)" strokeWidth="0.7" />

        {/* Mast glow hint */}
        <line x1="138" y1="101" x2="138" y2="8"
          stroke="rgba(212,168,83,0.05)" strokeWidth="8" />
      </motion.g>
    </svg>
  );
}

// ─── VoyageShip ───────────────────────────────────────────────────────────────

interface Props {
  state: ShipState;
}

// ─── Scroll-velocity lean hook ────────────────────────────────────────────────
// Fast downward scroll → bow tilts down (positive lean). Decays to 0 at rest.
function useLean(reduced: boolean): number {
  const [lean, setLean] = useState(0);
  const leanRef  = useRef(0);
  const lastYRef = useRef(0);
  const rafRef   = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;

    const onScroll = () => {
      const dy = window.scrollY - lastYRef.current;
      lastYRef.current = window.scrollY;
      leanRef.current = Math.max(-7, Math.min(7, leanRef.current + dy * 0.055));
    };

    const tick = () => {
      leanRef.current *= 0.86;
      setLean(Math.round(leanRef.current * 10) / 10); // avoid float churn
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  return lean;
}

export function VoyageShip({ state }: Props) {
  const reduced = useReducedMotion();
  const lean    = useLean(reduced);
  const { x, y, rotation, opacity, scale, routeProgress } = state;

  return (
    <>
      {/* ── Route trail + port markers ──────────────────────────────────── */}
      <svg
        className="pointer-events-none fixed inset-0 z-[1] overflow-visible"
        style={{ width: "100vw", height: "100vh" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Full route hint — always visible, very faint dashed */}
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="rgba(196,138,40,0.06)"
          strokeWidth="0.28"
          strokeLinecap="round"
          strokeDasharray="1.4 2.4"
        />

        {/* Route glow (blurred, wide) — reveals with routeProgress */}
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="rgba(196,138,40,0.18)"
          strokeWidth="1.2"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={reduced ? 0 : 1 - routeProgress}
          style={{
            filter: "blur(3px)",
            transition: "stroke-dashoffset 0.12s linear",
          }}
        />

        {/* Route line (crisp, gold) — reveals with routeProgress */}
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="rgba(212,168,83,0.55)"
          strokeWidth="0.32"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={reduced ? 0 : 1 - routeProgress}
          style={{ transition: "stroke-dashoffset 0.12s linear" }}
        />

        {/* Port markers */}
        {PORT_MARKERS.map((p) => {
          const visible = routeProgress >= p.threshold;
          return (
            <g key={p.id}>
              {/* Pulse ring */}
              <motion.circle
                cx={p.cx}
                cy={p.cy}
                r={0.9}
                fill="none"
                stroke="rgba(196,138,40,0.55)"
                strokeWidth="0.2"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s ease" }}
                animate={
                  visible && !reduced
                    ? { r: [0.9, 1.6, 0.9], opacity: [0.55, 0.20, 0.55] }
                    : undefined
                }
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Solid dot */}
              <circle
                cx={p.cx}
                cy={p.cy}
                r={0.50}
                fill="rgba(232,208,128,0.90)"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s ease" }}
              />
            </g>
          );
        })}

        {/* Leading light dot at current ship position */}
        {routeProgress > 0 && routeProgress < 1 && (
          <motion.circle
            cx={x}
            cy={y}
            r={0.55}
            fill="rgba(248,228,160,0.95)"
            filter="url(#vsh-glow)"
            animate={reduced ? undefined : { opacity: [0.95, 0.50, 0.95] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </svg>

      {/* ── Ship ────────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed z-[1]"
        style={{
          left: `${x}vw`,
          top: `${y}vh`,
          transform: `translate(-50%, -50%) rotate(${rotation + lean}deg) scale(${scale})`,
          opacity,
          transition: "opacity 1.5s ease",
          width: 220,
        }}
        aria-hidden
      >
        {/* Autonomous bob — runs independently of scroll */}
        <motion.div
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShipSVG reduced={reduced} />
        </motion.div>
      </div>
    </>
  );
}
