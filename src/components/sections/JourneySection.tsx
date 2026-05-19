"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { JOURNEY_STAGES } from "@/data/journeyStages";

// ─── Ship waypoints (top% within the 100vh left panel) ───────────────────────
const SHIP_TOPS = ["12%", "26%", "40%", "55%", "68%"];

// ─── Inline ship SVG (unique IDs for this instance) ──────────────────────────
function JourneyShipSVG({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 240 170" className="w-full" aria-hidden
      style={{ filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.7)) drop-shadow(0 0 24px rgba(200,16,46,0.10))" }}>
      <defs>
        <linearGradient id="jh-hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#1c2f4c" />
          <stop offset="65%" stopColor="#122030" />
          <stop offset="100%" stopColor="#080f1e" />
        </linearGradient>
        <linearGradient id="jh-sail" x1="0.1" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#f2e8d8" />
          <stop offset="70%" stopColor="#cca870" />
          <stop offset="100%" stopColor="#9e7a40" />
        </linearGradient>
        <linearGradient id="jh-sail-off" x1="0.15" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#e2d4c0" />
          <stop offset="70%" stopColor="#b89060" />
          <stop offset="100%" stopColor="#8c6830" />
        </linearGradient>
        <linearGradient id="jh-mast" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"  stopColor="#6e4e18" />
          <stop offset="42%" stopColor="#d4a840" />
          <stop offset="100%" stopColor="#6e4e18" />
        </linearGradient>
      </defs>
      {/* Wake */}
      <ellipse cx="120" cy="135" rx="108" ry="10" fill="rgba(20,55,100,0.35)" />
      <motion.g animate={reduced ? undefined : { opacity: [0.4, 0.65, 0.4] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}>
        <ellipse cx="202" cy="128" rx="26" ry="3" fill="rgba(200,220,240,0.14)" />
        <ellipse cx="214" cy="131" rx="16" ry="2" fill="rgba(200,220,240,0.09)" />
      </motion.g>
      {/* Hull */}
      <motion.g animate={reduced ? undefined : { x: [0, 2, -1, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M 22,128 C 18,119 20,108 30,104 L 205,101 C 216,103 222,113 222,128 C 222,141 212,147 198,147 L 40,147 C 28,145 22,138 22,128 Z" fill="url(#jh-hull)" stroke="rgba(255,215,0,0.28)" strokeWidth="1.4" />
        <path d="M 24,122 L 212,118 C 218,119 220,122 219,124 L 24,128 Z" fill="rgba(255,215,0,0.38)" />
        <path d="M 26,136 L 208,134 L 210,140 L 26,142 Z" fill="rgba(8,14,28,0.7)" />
        <rect x="193" y="84" width="28" height="20" rx="2" fill="#0e1f38" stroke="rgba(255,215,0,0.20)" strokeWidth="0.8" />
        {[85,110,140,168].map((cx, i) => <circle key={i} cx={cx} cy={116} r={3.5} fill="none" stroke="rgba(255,215,0,0.35)" strokeWidth="0.9" />)}
        <line x1="27" y1="110" x2="-8" y2="96" stroke="url(#jh-mast)" strokeWidth="2.2" strokeLinecap="round" />
      </motion.g>
      {/* Masts + sails */}
      <motion.g animate={reduced ? undefined : { x: [0, 2, -1, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
        {/* Fore */}
        <line x1="80" y1="102" x2="80" y2="30" stroke="url(#jh-mast)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="80" cy="31" r="2.2" fill="#d4a840" />
        <motion.path d="M 56,48 L 104,46 L 102,100 L 59,102 Z" fill="url(#jh-sail-off)" opacity="0.84"
          animate={reduced ? undefined : { d: ["M 56,48 L 104,46 L 102,100 L 59,102 Z","M 57,48 L 104,47 L 103,100 L 60,102 Z","M 56,48 L 104,46 L 102,100 L 59,102 Z"] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }} />
        {/* Main */}
        <line x1="138" y1="101" x2="138" y2="8" stroke="url(#jh-mast)" strokeWidth="3.8" strokeLinecap="round" />
        <circle cx="138" cy="9" r="2.6" fill="#d4a840" />
        <path d="M 138,9 L 156,4 L 140,17 Z" fill="rgba(200,16,46,0.85)" />
        <motion.path d="M 106,26 L 170,24 L 168,56 L 112,58 Z" fill="url(#jh-sail)" opacity="0.90"
          animate={reduced ? undefined : { d: ["M 106,26 L 170,24 L 168,56 L 112,58 Z","M 107,26 L 170,25 L 169,56 L 113,58 Z","M 106,26 L 170,24 L 168,56 L 112,58 Z"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path d="M 112,58 L 164,56 L 162,101 L 115,102 Z" fill="url(#jh-sail)" opacity="0.85"
          animate={reduced ? undefined : { d: ["M 112,58 L 164,56 L 162,101 L 115,102 Z","M 113,58 L 164,57 L 163,101 L 116,102 Z","M 112,58 L 164,56 L 162,101 L 115,102 Z"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
        {/* Mizzen */}
        <line x1="194" y1="101" x2="194" y2="52" stroke="url(#jh-mast)" strokeWidth="2.8" strokeLinecap="round" />
        <motion.path d="M 178,66 L 210,64 L 208,100 L 181,101 Z" fill="url(#jh-sail-off)" opacity="0.78"
          animate={reduced ? undefined : { d: ["M 178,66 L 210,64 L 208,100 L 181,101 Z","M 179,66 L 210,65 L 209,100 L 182,101 Z","M 178,66 L 210,64 L 208,100 L 181,101 Z"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
        {/* Rigging */}
        <line x1="26" y1="108" x2="138" y2="10" stroke="rgba(168,136,48,0.22)" strokeWidth="0.8" />
        <line x1="138" y1="24" x2="112" y2="100" stroke="rgba(168,136,48,0.20)" strokeWidth="0.7" />
        <line x1="138" y1="24" x2="165" y2="100" stroke="rgba(168,136,48,0.20)" strokeWidth="0.7" />
        <line x1="80" y1="34" x2="138" y2="14" stroke="rgba(168,136,48,0.18)" strokeWidth="0.7" />
      </motion.g>
    </svg>
  );
}

// ─── Sailing overlay (shown while ship animates) ──────────────────────────────

function SailingOverlay({ destination }: { destination: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-8">
      {/* Animated waves */}
      <div className="mb-8 overflow-hidden" style={{ width: 120, height: 40 }}>
        <svg viewBox="0 0 120 40" className="w-full h-full">
          <motion.path
            d="M0,20 C20,6 40,34 60,20 C80,6 100,34 120,20"
            fill="none" stroke="rgba(255,215,0,0.5)" strokeWidth="2.5" strokeLinecap="round"
            animate={{ d: [
              "M0,20 C20,6 40,34 60,20 C80,6 100,34 120,20",
              "M0,24 C22,10 42,36 62,24 C82,10 102,36 120,24",
              "M0,20 C20,6 40,34 60,20 C80,6 100,34 120,20",
            ]}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,28 C25,16 45,38 65,28 C85,16 105,38 120,28"
            fill="none" stroke="rgba(200,16,46,0.35)" strokeWidth="1.8" strokeLinecap="round"
            animate={{ d: [
              "M0,28 C25,16 45,38 65,28 C85,16 105,38 120,28",
              "M0,24 C23,12 43,34 63,24 C83,12 103,34 120,24",
              "M0,28 C25,16 45,38 65,28 C85,16 105,38 120,28",
            ]}}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </svg>
      </div>

      <p className="font-cinzel text-xs uppercase tracking-[0.5em] mb-3" style={{ color: "rgba(255,215,0,0.65)" }}>
        Đang lướt sóng
      </p>
      <p className="font-playfair text-2xl italic font-semibold" style={{ color: "#F5E6C8" }}>
        Tiến về {destination}
      </p>
      <p className="mt-3 text-xs" style={{ color: "rgba(245,230,200,0.4)" }}>
        Thuyền đang trên hải trình…
      </p>

      <div className="mt-8 flex gap-2">
        {[0,1,2,3].map(i => (
          <motion.div key={i} className="h-1.5 w-1.5 rounded-full"
            style={{ background: "rgba(255,215,0,0.6)" }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Arrived overlay (brief) ──────────────────────────────────────────────────

function ArrivedOverlay({ stage }: { stage: typeof JOURNEY_STAGES[number] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-8">
      <motion.p className="font-cinzel text-xs uppercase tracking-[0.55em] mb-3"
        style={{ color: stage.accentColor === "#FFD700" ? "rgba(255,215,0,0.8)" : "rgba(200,16,46,0.9)" }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        Đã cập bến
      </motion.p>
      <motion.h3 className="font-cinzel font-bold"
        style={{ fontSize: "clamp(2rem,5vw,3.2rem)", color: "#F5E6C8" }}
        initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.12 }}>
        {stage.title}
      </motion.h3>
      <motion.p className="mt-3 font-playfair italic" style={{ color: `${stage.accentColor}CC`, fontSize: "1rem" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        {stage.locations}
      </motion.p>
    </div>
  );
}

// ─── Stage content card ───────────────────────────────────────────────────────

interface StageContentProps {
  stage: typeof JOURNEY_STAGES[number];
  isLast: boolean;
  onContinue: () => void;
  onFinish: () => void;
}

function StageContent({ stage, isLast, onContinue, onFinish }: StageContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Card body — scrollable if content is long */}
      <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8 sm:py-8">
        {/* Stage badge */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="font-cinzel rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: `${stage.accentColor}25`, color: stage.accentColor, border: `1px solid ${stage.accentColor}44` }}>
            Giai đoạn {stage.number}
          </span>
          <span className="rounded-full px-3 py-1 text-[10px] font-medium"
            style={{ background: "rgba(245,230,200,0.06)", color: "rgba(245,230,200,0.55)", border: "1px solid rgba(245,230,200,0.10)" }}>
            {stage.period}
          </span>
          <span className="rounded-full px-3 py-1 text-[10px]"
            style={{ background: "rgba(245,230,200,0.04)", color: "rgba(245,230,200,0.42)" }}>
            {stage.locations}
          </span>
        </div>

        {/* Large decorative number */}
        <div aria-hidden className="font-cinzel font-bold select-none leading-none"
          style={{ fontSize: "clamp(3.5rem,8vw,6rem)", color: `${stage.accentColor}15`, marginLeft: "-0.04em" }}>
          {String(stage.number).padStart(2, "0")}
        </div>

        {/* Title */}
        <h2 className="font-cinzel font-bold leading-[1.08] -mt-4"
          style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)", color: "#F5E6C8" }}>
          {stage.title}
        </h2>

        {/* Tagline */}
        <p className="mt-2 font-playfair italic text-sm sm:text-base"
          style={{ color: `${stage.accentColor}CC` }}>
          {stage.tagline}
        </p>

        {/* Accent line */}
        <div className="my-5 h-px w-14"
          style={{ background: `linear-gradient(to right, ${stage.accentColor}, transparent)` }} />

        {/* Content */}
        <div className="space-y-3">
          {stage.content.map((para, i) => (
            <p key={i} className="text-sm leading-[1.88] sm:text-[14.5px]"
              style={{ color: "rgba(245,230,200,0.70)" }}>
              {para}
            </p>
          ))}
        </div>

        {/* Highlight box */}
        <div className="mt-6 rounded-xl p-4 sm:p-5 glass-card-red">
          <p className="font-playfair font-medium text-sm leading-relaxed" style={{ color: "#F5E6C8" }}>
            {stage.highlight}
          </p>
        </div>

        {/* Quote */}
        {stage.quote && (
          <blockquote className="mt-5 border-l-2 pl-4 font-playfair italic text-sm leading-relaxed sm:text-[15px]"
            style={{ borderColor: stage.accentColor, color: "rgba(245,230,200,0.62)" }}>
            "{stage.quote}"
          </blockquote>
        )}
      </div>

      {/* Footer CTA — sticky */}
      <div className="flex-shrink-0 border-t px-6 py-4 sm:px-8"
        style={{ borderColor: "rgba(245,230,200,0.07)", background: "rgba(6,9,16,0.6)" }}>
        {isLast ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-playfair italic text-sm" style={{ color: "rgba(245,230,200,0.55)" }}>
              Hành trình tìm đường cứu nước đã hoàn thành.
            </p>
            <button type="button" onClick={onFinish}
              className="btn-patriot font-cinzel rounded-full px-8 py-3 text-sm font-semibold tracking-widest">
              Khám Phá Ý Nghĩa →
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs" style={{ color: "rgba(245,230,200,0.35)" }}>
              Bấm để tiếp tục sang giai đoạn tiếp theo
            </p>
            <button type="button" onClick={onContinue}
              className="btn-patriot font-cinzel rounded-full px-7 py-3 text-sm font-semibold tracking-wider flex-shrink-0">
              Tiếp Tục →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Left ocean panel ─────────────────────────────────────────────────────────

interface OceanPanelProps {
  stageIndex: number;
  phase: "reading" | "sailing" | "arrived";
  shipRef: React.RefObject<HTMLDivElement | null>;
  reduced: boolean;
}

function OceanPanel({ stageIndex, phase, shipRef, reduced }: OceanPanelProps) {
  const stage = JOURNEY_STAGES[stageIndex]!;

  return (
    <div className="relative h-full overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #060910 0%, #0B1F3A 60%, #08141e 100%)" }}>

      {/* Stars */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: "1px", height: "1px", left: `${(i*137)%100}%`, top: `${(i*79)%55}%`, opacity: 0.06 + (i%7)*0.04 }} />
        ))}
      </div>

      {/* Ambient glow matching stage accent */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0"
        animate={{ background: [
          `radial-gradient(ellipse 70% 50% at 50% 60%, ${stage.accentColor}08, transparent 65%)`,
        ]}}
        transition={{ duration: 0.8 }} />

      {/* Ship — GSAP animates `top` on this element */}
      <div ref={shipRef} className="pointer-events-none absolute"
        style={{ top: SHIP_TOPS[0], left: "50%", transform: "translateX(-50%)", width: "clamp(160px,26vw,240px)" }}
        aria-hidden>
        <motion.div
          animate={reduced ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <JourneyShipSVG reduced={reduced} />
        </motion.div>

        {/* Smoke — faster when sailing */}
        {!reduced && [0,1,2,3].map((i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              width: 6+i*5, height: 6+i*5,
              background: `rgba(${155+i*15},${155+i*15},${155+i*15},0.15)`,
              top: -8-i*8, left: "56%",
            }}
            animate={{ y: [-4, -34-i*14], opacity: [0.28,0], scale: [1,2.2+i*0.4], x: [0, i%2===0?9:-6] }}
            transition={{ duration: phase === "sailing" ? 1.8 : 3.2, repeat: Infinity, delay: i*0.82, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Ocean surface */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: "30%", background: "linear-gradient(to bottom, transparent, #040a12)" }} />

      {/* Wave */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 overflow-hidden" style={{ bottom: "28%" }}>
        <svg viewBox="0 0 400 50" className="w-full" preserveAspectRatio="none" style={{ height: 50 }}>
          <motion.path d="M0,25 C100,8 200,42 300,25 C350,17 380,32 400,25 L400,50 L0,50 Z"
            fill="#040a12"
            animate={reduced ? undefined : { d: [
              "M0,25 C100,8 200,42 300,25 C350,17 380,32 400,25 L400,50 L0,50 Z",
              "M0,30 C100,15 200,38 300,30 C350,23 380,36 400,30 L400,50 L0,50 Z",
              "M0,25 C100,8 200,42 300,25 C350,17 380,32 400,25 L400,50 L0,50 Z",
            ]}}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
        </svg>
      </div>

      {/* Stage progress dots + label */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3" aria-hidden>
        <div className="flex gap-2.5">
          {JOURNEY_STAGES.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-500"
              style={{
                width: i === stageIndex ? 20 : 8,
                height: 8,
                background: i <= stageIndex ? stage.accentColor : "rgba(245,230,200,0.18)",
              }} />
          ))}
        </div>
        <p className="font-cinzel text-[9px] uppercase tracking-[0.5em]"
          style={{ color: "rgba(245,230,200,0.28)" }}>
          {stageIndex + 1} / {JOURNEY_STAGES.length}
        </p>
      </div>

      {/* Light shaft */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[30%] w-[40%] overflow-hidden"
        style={{ background: "linear-gradient(to bottom, rgba(255,215,0,0.03), transparent 60%)" }} />
    </div>
  );
}

// ─── JourneySection ───────────────────────────────────────────────────────────

export function JourneySection() {
  const [stageIndex, setStageIndex] = useState(0);
  const [phase, setPhase]           = useState<"reading" | "sailing" | "arrived">("reading");
  const shipRef   = useRef<HTMLDivElement | null>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced   = useReducedMotion();

  const isLast = stageIndex === JOURNEY_STAGES.length - 1;
  const currentStage = JOURNEY_STAGES[stageIndex]!;
  const nextStage    = JOURNEY_STAGES[stageIndex + 1];

  // Cleanup
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleContinue = useCallback(() => {
    if (phase !== "reading" || !nextStage || !shipRef.current) return;

    setPhase("sailing");

    // Animate ship to next waypoint
    const nextTop = SHIP_TOPS[stageIndex + 1] ?? SHIP_TOPS[SHIP_TOPS.length - 1]!;
    gsap.to(shipRef.current, {
      top: nextTop,
      duration: reduced ? 0.4 : 2.4,
      ease: "power2.inOut",
      onComplete: () => {
        setStageIndex((prev) => prev + 1);
        setPhase("arrived");
        timerRef.current = setTimeout(() => setPhase("reading"), 900);
      },
    });
  }, [phase, nextStage, stageIndex, reduced]);

  const handleFinish = useCallback(() => {
    document.getElementById("y-nghia")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section id="hanh-trinh"
      style={{ background: "linear-gradient(to bottom, #0B1F3A, #060910)" }}>

      {/* Section header */}
      <div className="mx-auto max-w-5xl px-5 pb-8 pt-20 text-center sm:px-8 sm:pt-24">
        <p className="mb-4 font-cinzel text-[11px] uppercase tracking-[0.55em]"
           style={{ color: "rgba(255,215,0,0.78)" }}>
          Cuộc Hành Trình Vĩ Đại
        </p>
        <h2 className="font-cinzel font-bold leading-[1.07]"
          style={{ fontSize: "clamp(2rem,5vw,3.6rem)", color: "#F5E6C8" }}>
          Hành Trình Tìm
          <span className="glow-red" style={{ color: "#C8102E" }}> Đường Cứu Nước</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-playfair italic text-sm leading-relaxed sm:text-base"
          style={{ color: "rgba(245,230,200,0.55)" }}>
          Nhấn <strong style={{ color: "rgba(255,215,0,0.75)" }}>Tiếp Tục</strong> để điều khiển con tàu lướt sóng sang chặng tiếp theo của lịch sử.
        </p>
      </div>

      {/* Interactive area */}
      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="overflow-hidden rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
          style={{ border: "1px solid rgba(245,230,200,0.07)", minHeight: "90vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>

          {/* ── Left: ocean + ship (sticky within grid) ── */}
          <div style={{ minHeight: "90vh" }}>
            <OceanPanel stageIndex={stageIndex} phase={phase} shipRef={shipRef} reduced={reduced} />
          </div>

          {/* ── Right: interactive stage content ── */}
          <div className="relative overflow-hidden" style={{ minHeight: "90vh", background: "rgba(6,9,16,0.92)", borderLeft: "1px solid rgba(245,230,200,0.06)" }}>

            {/* Ambient glow top-right */}
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full"
              style={{ background: `radial-gradient(circle, ${currentStage.accentColor}12, transparent 70%)`, transform: "translate(30%, -30%)" }} />

            <AnimatePresence mode="wait">
              {phase === "sailing" && nextStage ? (
                <motion.div key="sailing"
                  className="h-full"
                  style={{ minHeight: "90vh" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}>
                  <SailingOverlay destination={nextStage.locations.split("·")[0]?.trim() ?? nextStage.locations} />
                </motion.div>
              ) : phase === "arrived" ? (
                <motion.div key="arrived"
                  className="h-full"
                  style={{ minHeight: "90vh" }}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}>
                  <ArrivedOverlay stage={currentStage} />
                </motion.div>
              ) : (
                <motion.div key={`stage-${stageIndex}`}
                  className="h-full flex flex-col"
                  style={{ minHeight: "90vh" }}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                  <StageContent
                    stage={currentStage}
                    isLast={isLast}
                    onContinue={handleContinue}
                    onFinish={handleFinish}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Mobile: stacked */}
        <p className="mt-4 text-center text-xs sm:hidden" style={{ color: "rgba(245,230,200,0.30)" }}>
          Trải nghiệm tốt nhất trên màn hình lớn.
        </p>
      </div>
    </section>
  );
}
