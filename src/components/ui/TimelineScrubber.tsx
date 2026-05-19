"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type TimelineEvent = {
  year: number;
  label: string;
  place: string;
  color: string;
  displayYear?: string | number;
  positionOffsetPct?: number;
};

const EVENTS: TimelineEvent[] = [
  { year: 1911, label: "Rời Bến Nhà Rồng",        place: "Sài Gòn",       color: "#C8102E" },
  { year: 1911, label: "Đến Marseille",         place: "Pháp",          color: "#b80c28", positionOffsetPct: 2 },
  { year: 1912, label: "Đến New York",              place: "Hoa Kỳ",        color: "#9a0c22" },
  { year: 1913, label: "Sống và làm tại London",   place: "Anh Quốc",      color: "#7a1020" },
  { year: 1917, label: "Trở lại Paris",             place: "Pháp",          color: "#C8102E" },
  { year: 1919, label: "Bản Yêu Sách 8 Điểm",      place: "Versailles",    color: "#b80c28" },
  { year: 1920, label: "Đọc Luận cương Lê-nin",    place: "Paris",         color: "#FFD700" },
  { year: 1921, label: "Sáng lập Đảng CSVN Pháp", place: "Tours · Pháp",  color: "#C8102E" },
  { year: 1923, label: "Đến Liên Xô",              place: "Moskva",        color: "#9a0c22" },
  { year: 1924, label: "Dự Đại hội Quốc tế CS V", place: "Liên Xô",       color: "#7a1020" },
  { year: 1925, label: "Lập Hội VNCMTN",           place: "Quảng Châu",    color: "#C8102E" },
  { year: 1927, label: "Rời Trung Quốc",           place: "Thái Lan",      color: "#9a0c22" },
  { year: 1930, label: "Đảng CSVN ra đời",          place: "Hồng Kông",     color: "#FFD700" },
];

const START = 1911;
const END   = 1930;
const RANGE = END - START;

function yearToPercent(y: number) { return ((y - START) / RANGE) * 100; }

function eventToPercent(ev: TimelineEvent) {
  const pct = yearToPercent(ev.year) + (ev.positionOffsetPct ?? 0);
  return Math.max(0, Math.min(100, pct));
}

function getDisplayYear(ev: TimelineEvent) {
  return ev.displayYear ?? (Number.isInteger(ev.year) ? ev.year : Math.round(ev.year));
}

export function TimelineScrubber() {
  const trackRef   = useRef<HTMLDivElement>(null);
  const reduced    = useReducedMotion();
  const [active, setActive]   = useState(0);
  const [dragging, setDragging] = useState(false);
  const pct        = useMotionValue(0);
  const fillWidth  = useTransform(pct, [0, 100], ["0%", "100%"]);
  const handleLeft = useTransform(pct, (v) => `${v}%`);

  const pctToEvent = useCallback((p: number) => {
    let closest = 0;
    let minDiff = Infinity;
    EVENTS.forEach((ev, i) => {
      const diff = Math.abs(eventToPercent(ev) - p);
      if (diff < minDiff) { minDiff = diff; closest = i; }
    });
    return closest;
  }, []);

  const snapTo = useCallback((idx: number) => {
    const targetPct = eventToPercent(EVENTS[idx]);
    animate(pct, targetPct, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
    setActive(idx);
  }, [pct]);

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const idx = pctToEvent(p);
    snapTo(idx);
  }, [pctToEvent, snapTo]);

  // Drag logic
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }, [reduced]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    pct.set(p);
    setActive(pctToEvent(p));
  }, [dragging, pct, pctToEvent]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !trackRef.current) return;
    setDragging(false);
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    snapTo(pctToEvent(p));
  }, [dragging, pctToEvent, snapTo]);

  // Auto-play on mount
  useEffect(() => {
    if (reduced) { snapTo(EVENTS.length - 1); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i >= EVENTS.length) { clearInterval(id); return; }
      snapTo(i);
    }, 420);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ev = EVENTS[active];
  const displayYear = getDisplayYear(ev);

  return (
    <section id="timeline" className="relative py-20 overflow-hidden" style={{ background: "#1a0506" }}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(200,16,46,0.08), transparent 65%)" }} />

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 h-px w-20"
            style={{ background: "linear-gradient(to right, transparent, #C8102E, transparent)" }} />
          <p className="font-cinzel text-[11px] uppercase tracking-[0.55em] mb-3" style={{ color: "#C8102E" }}>
            Dòng Thời Gian
          </p>
          <h2 className="font-cinzel font-bold text-white" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}>
            Hành Trình <span style={{ color: "#FFD700" }}>1911 – 1930</span>
          </h2>
          <p className="mt-3 font-playfair italic text-sm text-white/55">
            Kéo thanh trượt hoặc nhấn vào mốc để khám phá từng thời điểm lịch sử.
          </p>
        </div>

        {/* Active event display */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 rounded-2xl px-7 py-6 text-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${ev.color}44`,
            boxShadow: `0 0 40px ${ev.color}18`,
          }}
        >
          <p className="font-cinzel text-[11px] uppercase tracking-[0.5em] mb-2"
            style={{ color: ev.color }}>
            {ev.place}
          </p>
          <p className="font-cinzel font-bold text-white" style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)" }}>
            {displayYear}
          </p>
          <p className="mt-2 font-playfair italic text-base" style={{ color: "rgba(255,255,255,0.80)" }}>
            {ev.label}
          </p>
        </motion.div>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative h-2 rounded-full cursor-pointer select-none"
          style={{ background: "rgba(255,255,255,0.10)" }}
          onClick={handleTrackClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="slider"
          aria-valuemin={START}
          aria-valuemax={END}
          aria-valuenow={Math.round(ev.year)}
          aria-label="Dòng thời gian hành trình"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") snapTo(Math.min(EVENTS.length - 1, active + 1));
            if (e.key === "ArrowLeft")  snapTo(Math.max(0, active - 1));
          }}
        >
          {/* Fill */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: fillWidth, background: "linear-gradient(to right, #9a0c22, #C8102E)" }}
          />

          {/* Event dots */}
          {EVENTS.map((ev, i) => {
            const labelYear = getDisplayYear(ev);
            return (
            <button
              key={`${ev.year}-${ev.label}`}
              type="button"
              aria-label={`${labelYear}: ${ev.label}`}
              onClick={(e) => { e.stopPropagation(); snapTo(i); }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform hover:scale-125"
              style={{ left: `${eventToPercent(ev)}%` }}
            >
              <motion.div
                className="rounded-full border-2"
                animate={{
                  width:  i === active ? 14 : 8,
                  height: i === active ? 14 : 8,
                  borderColor: i <= active ? ev.color : "rgba(255,255,255,0.25)",
                  background:  i <= active ? ev.color : "rgba(255,255,255,0.12)",
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          );
          })}

          {/* Scrubber handle */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
            style={{ left: handleLeft as never }}
          >
            <div className="rounded-full border-2 border-white shadow-lg"
              style={{ width: 22, height: 22, background: "#C8102E", boxShadow: "0 0 12px rgba(200,16,46,0.6)" }} />
          </motion.div>
        </div>

        {/* Year labels */}
        <div className="mt-4 flex justify-between">
          <span className="font-cinzel text-[10px] text-white/35">{START}</span>
          <span className="font-cinzel text-[10px] text-white/35">{END}</span>
        </div>

        {/* Event pills below */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {EVENTS.map((ev, i) => (
            <button
              key={`${ev.year}-${ev.label}`}
              type="button"
              onClick={() => snapTo(i)}
              className="rounded-full px-3 py-1.5 font-cinzel text-[10px] font-semibold uppercase tracking-widest transition-all duration-300"
              style={{
                background: i === active ? ev.color : "rgba(255,255,255,0.06)",
                color:      i === active ? (ev.color === "#FFD700" ? "#1a0506" : "#FFFFFF") : "rgba(255,255,255,0.45)",
                border:     `1px solid ${i === active ? ev.color : "rgba(255,255,255,0.10)"}`,
                transform:  i === active ? "scale(1.05)" : "scale(1)",
              }}
            >
              {getDisplayYear(ev)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
