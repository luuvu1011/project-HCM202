"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Anchor, Navigation, BookOpen } from "lucide-react";
import gsap from "gsap";
import { useJourney } from "@/lib/journeyContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import { Button } from "@/components/ui/Button";
import type { LocationId } from "@/types/voyage";
import { cinematicEase } from "@/animations/transitions";

// ─── State machine ───────────────────────────────────────────────────────────
type Phase =
  | "intro"               // Ship appears at harbor, auto-departs
  | "traveling"           // Ship moving between ports
  | "docked"              // Ship just arrived, brief beat
  | "waitingForContinue"  // Lesson shown, user must click to proceed
  | "completed";          // Final port reached and read

// ─── Port sequence ───────────────────────────────────────────────────────────
// Uses all 7 locations. Index 0 is the departure (auto-advance);
// indices 1–6 are arrival ports requiring user action.
const PORTS = VOYAGE_LOCATIONS;
const TOTAL = PORTS.length; // 7

// ─── Ship waypoints within the left panel (% of left panel dimensions) ───────
const WAYPOINTS: Record<LocationId, { x: number; y: number }> = {
  "ben-nha-rong": { x: 80, y: 62 },
  marseille:      { x: 66, y: 51 },
  london:         { x: 52, y: 42 },
  "new-york":     { x: 38, y: 55 },
  paris:          { x: 26, y: 44 },
  "lien-xo":      { x: 14, y: 36 },
  "quang-chau":   { x: 30, y: 48 },
};

// Route path for the SVG (viewBox 0 0 100 100, preserveAspectRatio="none")
const ROUTE_PATH =
  "M 80,62 C 76,57 70,54 66,51 " +
  "C 58,52 46,54 38,55 " +
  "C 42,50 48,46 52,42 " +
  "C 46,44 36,44 26,44 " +
  "C 22,42 18,40 14,36 " +
  "C 16,38 22,44 30,48";

// Status copy per phase
const PHASE_STATUS: Record<Phase, string> = {
  intro:              "Tàu đang rời cảng Sài Gòn…",
  traveling:          "Đang tiến về phía trước…",
  docked:             "Đã cập bến —",
  waitingForContinue: "Đọc nội dung, nhấn Tiếp tục khi sẵn sàng",
  completed:          "Hành trình hoàn tất",
};

// ─── Minimal ship SVG for the overlay ────────────────────────────────────────
function OverlayShip({ reduced }: { reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 100 80"
      className="h-full w-full"
      aria-hidden
      style={{
        filter:
          "drop-shadow(0 10px 28px rgba(0,0,0,0.55)) drop-shadow(0 0 14px rgba(196,138,40,0.10))",
      }}
    >
      <defs>
        <linearGradient id="jsh-hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1c2f4c" />
          <stop offset="100%" stopColor="#0a1625" />
        </linearGradient>
        <linearGradient id="jsh-sail" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f2e8d8" />
          <stop offset="100%" stopColor="#c4a878" />
        </linearGradient>
        <linearGradient id="jsh-mast" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#6e4e18" />
          <stop offset="50%" stopColor="#d4a840" />
          <stop offset="100%" stopColor="#6e4e18" />
        </linearGradient>
      </defs>

      {/* Water / wake */}
      <ellipse cx="50" cy="66" rx="46" ry="6" fill="rgba(14,36,72,0.40)" />
      <motion.ellipse
        cx="82" cy="65" rx="14" ry="2.5"
        fill="rgba(200,220,240,0.14)"
        animate={reduced ? undefined : { opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hull */}
      <path
        d="M 8,52 C 5,44 7,36 14,33 L 84,30 C 92,32 96,40 96,50 C 96,58 90,62 82,62 L 14,60 C 8,60 5,57 8,52 Z"
        fill="url(#jsh-hull)"
        stroke="rgba(196,138,40,0.28)"
        strokeWidth="1"
      />
      {/* Waterline */}
      <path d="M 10,46 L 88,42 L 91,47 L 10,50 Z" fill="rgba(196,138,40,0.42)" />

      {/* Foremast */}
      <line x1="27" y1="32" x2="27" y2="12" stroke="url(#jsh-mast)" strokeWidth="2" strokeLinecap="round" />
      {/* Fore yard */}
      <line x1="18" y1="18" x2="36" y2="16" stroke="#b48a30" strokeWidth="1.2" strokeLinecap="round" />
      {/* Fore sail */}
      <motion.path
        d="M 18,18 L 36,16 L 34,32 L 20,33 Z"
        fill="url(#jsh-sail)" opacity="0.84"
        animate={reduced ? undefined : { d: [
          "M 18,18 L 36,16 L 34,32 L 20,33 Z",
          "M 19,18 L 36,17 L 35,32 L 21,33 Z",
          "M 18,18 L 36,16 L 34,32 L 20,33 Z",
        ]}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Mainmast */}
      <line x1="48" y1="30" x2="48" y2="4" stroke="url(#jsh-mast)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="48" cy="4" r="1.8" fill="#d4a840" />
      {/* Flag */}
      <path d="M 48,4 L 58,2 L 50,11 Z" fill="rgba(194,59,59,0.80)" />
      {/* Main upper yard */}
      <line x1="36" y1="11" x2="60" y2="9" stroke="#b48a30" strokeWidth="1.5" strokeLinecap="round" />
      {/* Main lower yard */}
      <line x1="38" y1="22" x2="58" y2="20" stroke="#b48a30" strokeWidth="1.4" strokeLinecap="round" />
      {/* Main upper sail */}
      <motion.path
        d="M 36,11 L 60,9 L 58,20 L 38,22 Z"
        fill="url(#jsh-sail)" opacity="0.90"
        animate={reduced ? undefined : { d: [
          "M 36,11 L 60,9 L 58,20 L 38,22 Z",
          "M 37,11 L 60,10 L 59,20 L 39,22 Z",
          "M 36,11 L 60,9 L 58,20 L 38,22 Z",
        ]}}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Main lower sail */}
      <motion.path
        d="M 38,22 L 58,20 L 56,30 L 40,32 Z"
        fill="url(#jsh-sail)" opacity="0.85"
        animate={reduced ? undefined : { d: [
          "M 38,22 L 58,20 L 56,30 L 40,32 Z",
          "M 39,22 L 58,21 L 57,30 L 41,32 Z",
          "M 38,22 L 58,20 L 56,30 L 40,32 Z",
        ]}}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />

      {/* Mizzenmast */}
      <line x1="70" y1="30" x2="70" y2="18" stroke="url(#jsh-mast)" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="22" x2="78" y2="20" stroke="#b48a30" strokeWidth="1.2" strokeLinecap="round" />
      <motion.path
        d="M 62,22 L 78,20 L 77,30 L 63,31 Z"
        fill="url(#jsh-sail)" opacity="0.80"
        animate={reduced ? undefined : { d: [
          "M 62,22 L 78,20 L 77,30 L 63,31 Z",
          "M 63,22 L 78,21 L 77,30 L 64,31 Z",
          "M 62,22 L 78,20 L 77,30 L 63,31 Z",
        ]}}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />

      {/* Bowsprit */}
      <line x1="13" y1="40" x2="-4" y2="30" stroke="url(#jsh-mast)" strokeWidth="1.8" strokeLinecap="round" />

      {/* Rigging */}
      <line x1="10" y1="45" x2="48" y2="6" stroke="rgba(168,136,48,0.24)" strokeWidth="0.7" />
      <line x1="48" y1="10" x2="36" y2="30" stroke="rgba(168,136,48,0.22)" strokeWidth="0.7" />
      <line x1="48" y1="10" x2="60" y2="30" stroke="rgba(168,136,48,0.22)" strokeWidth="0.7" />
    </svg>
  );
}

// ─── Lesson section heading ───────────────────────────────────────────────────
function LessonSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.36em] text-gold/65">
        {label}
      </p>
      <p className="text-sm leading-[1.72] text-parchment-muted sm:text-[15px]">
        {children}
      </p>
    </div>
  );
}

// ─── JourneyModal inner (mounted when isActive) ───────────────────────────────
function JourneyModalInner({ onExit }: { onExit: () => void }) {
  const reduced = useReducedMotion();

  const [phase,            setPhase]            = useState<Phase>("intro");
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  const shipRef     = useRef<HTMLDivElement | null>(null);
  const clipRectRef = useRef<SVGRectElement | null>(null);
  const timersRef   = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  // ── Move ship to a port index and fire onComplete ────────────────────────
  const moveShipToIndex = useCallback(
    (targetIndex: number, onComplete: () => void) => {
      const port = PORTS[targetIndex];
      if (!port || !shipRef.current) return;

      const wp = WAYPOINTS[port.id];
      const routeProgress = targetIndex / (TOTAL - 1);
      const duration = reduced ? 0.1 : 4.8;

      gsap.to(shipRef.current, {
        left: `${wp.x}%`,
        top:  `${wp.y}%`,
        duration,
        ease: "power2.inOut",
        onComplete,
      });

      // Reveal route trail via clipRect
      if (clipRectRef.current) {
        gsap.to(clipRectRef.current, {
          attr: {
            x:     80 * (1 - routeProgress),
            width: 80 * routeProgress,
          },
          duration,
          ease: "power2.inOut",
        });
      }
    },
    [reduced],
  );

  // ── Initial intro: ship appears, then auto-departs ───────────────────────
  useEffect(() => {
    if (!shipRef.current) return;

    const harbor = PORTS[0]!;
    const wp     = WAYPOINTS[harbor.id];

    // Position ship at harbor immediately
    gsap.set(shipRef.current, { left: `${wp.x}%`, top: `${wp.y}%`, opacity: 0, scale: 0.5 });

    // Intro reveal
    const ctx = gsap.context(() => {
      gsap.to(shipRef.current, {
        opacity: 1,
        scale: 1,
        duration: reduced ? 0.1 : 1.2,
        ease: "power3.out",
        onComplete: () => {
          // Brief harbor beat, then auto-sail to first arrival port
          const tid = window.setTimeout(() => {
            setPhase("traveling");
            moveShipToIndex(1, () => {
              setCurrentStopIndex(1);
              setPhase("docked");
              const t2 = window.setTimeout(() => setPhase("waitingForContinue"), 900);
              timersRef.current.push(t2);
            });
          }, reduced ? 100 : 1800);
          timersRef.current.push(tid);
        },
      });
    });

    return () => {
      ctx.revert();
      clearTimers();
    };
  }, [moveShipToIndex, reduced, clearTimers]);

  // ── Continue to next port ────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (phase !== "waitingForContinue") return;

    const nextIndex = currentStopIndex + 1;

    if (nextIndex >= TOTAL) {
      setPhase("completed");
      return;
    }

    clearTimers();
    setPhase("traveling");

    moveShipToIndex(nextIndex, () => {
      setCurrentStopIndex(nextIndex);
      setPhase("docked");
      const t = window.setTimeout(() => {
        setPhase(nextIndex === TOTAL - 1 ? "waitingForContinue" : "waitingForContinue");
      }, 900);
      timersRef.current.push(t);
    });
  }, [phase, currentStopIndex, moveShipToIndex, clearTimers]);

  // ── Exit: cleanup ────────────────────────────────────────────────────────
  const handleExit = useCallback(() => {
    clearTimers();
    gsap.killTweensOf(shipRef.current);
    onExit();
  }, [clearTimers, onExit]);

  // Cleanup on unmount
  useEffect(() => () => { clearTimers(); }, [clearTimers]);

  const currentPort = PORTS[currentStopIndex]!;
  const isLast      = currentStopIndex === TOTAL - 1;
  const isDeparture = currentStopIndex === 0;

  // Status text
  const statusText =
    phase === "traveling"
      ? `Đang tiến đến ${PORTS[Math.min(currentStopIndex + 1, TOTAL - 1)]!.name}…`
      : phase === "docked"
      ? `Đang cập bến ${currentPort.name}`
      : phase === "completed"
      ? "Hành trình hoàn tất"
      : PHASE_STATUS[phase];

  return (
    <motion.div
      className="fixed inset-0 z-[46] flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: cinematicEase }}
    >
      {/* ── Left panel: WorldOcean shows through, ship animates here ──────── */}
      <div className="relative flex-shrink-0 overflow-hidden md:w-[55%] h-[38vh] md:h-auto">
        {/* Very subtle dark veil for ship legibility — don't block WorldOcean */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 60%, rgba(2,5,14,0.38), transparent 72%)",
          }}
        />

        {/* Route trail SVG */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <clipPath id="journey-trail-clip">
              {/* x and width are animated by GSAP */}
              <rect ref={clipRectRef} x={80} y={0} width={0} height={100} />
            </clipPath>
          </defs>

          {/* Background route hint */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="rgba(196,138,40,0.07)"
            strokeWidth="0.5"
            strokeDasharray="2 3"
            strokeLinecap="round"
          />

          {/* Revealed glow */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="rgba(196,138,40,0.22)"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{ filter: "blur(2.5px)", clipPath: "url(#journey-trail-clip)" }}
          />
          {/* Revealed line */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="rgba(212,168,83,0.70)"
            strokeWidth="0.45"
            strokeLinecap="round"
            style={{ clipPath: "url(#journey-trail-clip)" }}
          />

          {/* Port dots */}
          {PORTS.map((port, i) => {
            const wp      = WAYPOINTS[port.id];
            const visited = i <= currentStopIndex;
            return (
              <g key={port.id}>
                {visited && (
                  <motion.circle
                    cx={wp.x} cy={wp.y} r={1.4}
                    fill="none" stroke="rgba(196,138,40,0.55)" strokeWidth="0.3"
                    animate={{ r: [1.4, 2.2, 1.4], opacity: [0.55, 0.20, 0.55] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <circle
                  cx={wp.x} cy={wp.y} r={0.65}
                  fill={visited ? "rgba(232,208,128,0.92)" : "rgba(196,138,40,0.18)"}
                  style={{ transition: "fill 0.6s ease" }}
                />
              </g>
            );
          })}
        </svg>

        {/* Ship — positioned and animated by GSAP */}
        <div
          ref={shipRef}
          className="pointer-events-none absolute"
          style={{
            width: "clamp(80px, 12vw, 160px)",
            opacity: 0,
            transform: "translate(-50%, -50%) rotate(-8deg)",
          }}
          aria-hidden
        >
          <motion.div
            animate={reduced ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <OverlayShip reduced={reduced} />
          </motion.div>
        </div>

        {/* State badge — top-left of left panel */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-ocean-deep/70 px-3 py-1.5 backdrop-blur-md">
          <motion.span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                phase === "traveling" || phase === "intro"
                  ? "#c48a28"
                  : phase === "docked"
                  ? "#4a90e2"
                  : phase === "completed"
                  ? "#4caf50"
                  : "#d4a840",
            }}
            animate={
              (phase === "traveling" || phase === "waitingForContinue") && !reduced
                ? { opacity: [1, 0.3, 1] }
                : undefined
            }
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-parchment-muted/80">
            {statusText}
          </span>
        </div>
      </div>

      {/* ── Right panel: lesson content ──────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col overflow-hidden border-l border-white/[0.06] bg-[rgba(4,9,20,0.92)] backdrop-blur-2xl md:w-[45%]">

        {/* Port header */}
        <div className="flex-shrink-0 border-b border-white/[0.06] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.40em] text-gold/65">
                {isDeparture
                  ? "Điểm khởi hành"
                  : isLast
                  ? "Đích đến cuối"
                  : `Cảng ${currentStopIndex} / ${TOTAL - 1}`}
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-semibold text-parchment sm:text-3xl">
                {currentPort.name}
              </h2>
              <p className="mt-1 text-[11px] text-parchment-muted/70">
                {currentPort.atmosphere.split("—")[0]?.trim()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExit}
              className="flex-shrink-0 rounded-full p-2 text-parchment-muted/60 transition-colors hover:bg-white/8 hover:text-parchment"
              aria-label="Đóng hành trình"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* State indicator bar */}
          <div className="mt-4 flex items-center gap-3">
            {(["intro", "traveling", "docked", "waitingForContinue", "completed"] as Phase[]).map(
              (p, i) => {
                const phaseOrder: Phase[] = ["intro", "traveling", "docked", "waitingForContinue", "completed"];
                const currentOrder = phaseOrder.indexOf(phase);
                const isActive = phaseOrder.indexOf(p) <= currentOrder;
                return (
                  <div key={p} className="flex items-center gap-1.5">
                    <div
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                        isActive ? "bg-gold" : "bg-white/15"
                      }`}
                    />
                    {i < 4 && (
                      <div className={`h-px w-4 transition-all duration-500 ${isActive ? "bg-gold/40" : "bg-white/10"}`} />
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* Scrollable lesson content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {/* INTRO / TRAVELING — show departure or destination teaser */}
            {(phase === "intro" || (phase === "traveling" && currentStopIndex === 0)) ? (
              <motion.div
                key="departure"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-display text-[17px] italic leading-[1.75] text-parchment/90">
                  {currentPort.atmosphere}
                </p>
                <div className="mt-4 text-sm leading-relaxed text-parchment-muted">
                  {currentPort.arrivalNarration}
                </div>
                <p className="mt-6 text-[11px] text-parchment-muted/50">
                  Con tàu đang khởi hành — hành trình bắt đầu…
                </p>
              </motion.div>
            ) : phase === "traveling" ? (
              <motion.div
                key="traveling"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Navigation className="h-8 w-8 animate-pulse text-gold/60" />
                <p className="mt-4 font-display text-lg text-parchment/80">
                  {PORTS[Math.min(currentStopIndex + 1, TOTAL - 1)]!.name}
                </p>
                <p className="mt-2 text-sm text-parchment-muted/60">
                  Tàu đang trên đường — chờ cập bến…
                </p>
              </motion.div>
            ) : phase === "docked" ? (
              <motion.div
                key="docking"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Anchor className="h-8 w-8 text-gold/70" />
                <p className="mt-4 font-display text-xl text-parchment">
                  Đã cập bến
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-gold-soft">
                  {currentPort.name}
                </p>
              </motion.div>
            ) : phase === "completed" ? (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="py-8 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.44em] text-gold/70">
                  Hành trình hoàn thành
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold text-parchment">
                  Từ Bến Nhà Rồng đến Quảng Châu
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-parchment-muted">
                  Qua bảy bến cảng, từ khủng hoảng thuộc địa đến Luận cương
                  Lênin — hành trình tìm đường cứu nước đã hoàn thành một
                  chặng lớn trong tư tưởng Hồ Chí Minh.
                </p>
              </motion.div>
            ) : (
              /* WAITING FOR CONTINUE — full lesson content */
              <motion.div
                key={`lesson-${currentPort.id}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55 }}
              >
                {/* Atmospheric pull quote */}
                <p className="font-display text-[17px] italic leading-[1.75] text-parchment/92">
                  {currentPort.atmosphere}
                </p>

                <div className="vv-divider mt-6" />

                {/* Lesson sections */}
                <LessonSection label="Bối cảnh lịch sử">
                  {currentPort.historicalContext}
                </LessonSection>

                <LessonSection label="Chứng kiến & trải nghiệm">
                  {currentPort.experienced}
                </LessonSection>

                <LessonSection label="Chuyển hóa tư tưởng">
                  {currentPort.ideologicalEvolution}
                </LessonSection>

                <LessonSection label="Ý nghĩa">
                  {currentPort.significance}
                </LessonSection>

                <div className="mt-8 border-l-2 border-gold/30 pl-4">
                  <p className="font-display text-[15px] italic leading-[1.65] text-gold-soft/85">
                    {currentPort.arrivalNarration}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action footer — sticky */}
        <div className="flex-shrink-0 border-t border-white/[0.06] px-6 py-4">
          <AnimatePresence mode="wait">
            {phase === "waitingForContinue" && (
              <motion.div
                key="action"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35 }}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2 text-[11px] text-parchment-muted/55">
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    {isLast
                      ? "Đây là điểm cuối của hành trình"
                      : `Tiếp theo: ${PORTS[currentStopIndex + 1]?.name ?? ""}`}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={isLast ? handleExit : handleContinue}
                  className="flex-shrink-0"
                >
                  {isLast ? "Kết thúc" : "Tiếp tục hành trình →"}
                </Button>
              </motion.div>
            )}
            {phase === "completed" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Button type="button" onClick={handleExit} className="w-full">
                  Đóng hành trình
                </Button>
              </motion.div>
            )}
            {(phase === "traveling" || phase === "docked" || phase === "intro") && (
              <motion.p
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-[11px] text-parchment-muted/35"
              >
                {phase === "docked" ? "Đang cập bến…" : "Đang trên đường…"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function JourneyModal() {
  const { isActive, exitJourney } = useJourney();

  return (
    <AnimatePresence>
      {isActive && <JourneyModalInner key="journey" onExit={exitJourney} />}
    </AnimatePresence>
  );
}
