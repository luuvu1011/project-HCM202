"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MAP_PORTS, MAP_SVG_PATH, OCEAN_LABELS } from "@/data/mapPorts";
import { VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import { PortPhotoCard } from "./PortPhotoCard";

// Slight rotation per port for "polaroid" feel
const ROTATIONS = [-3, 2, -2, 3, -2, 2, -1];

// ─── Kiểu trạng thái ─────────────────────────────────────────────────────────
type Phase = "idle" | "traveling" | "docked" | "completed";

// ─── Ship SVG (màu phù hợp nền sáng) ─────────────────────────────────────────
function MapShipSVG({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 240 170" className="w-full" aria-hidden
      style={{ filter: "drop-shadow(0 12px 32px rgba(200,16,46,0.22)) drop-shadow(0 4px 12px rgba(0,0,0,0.35))" }}>
      <defs>
        <linearGradient id="mw-hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#2a1f3a" />
          <stop offset="65%" stopColor="#16102a" />
          <stop offset="100%" stopColor="#0a0818" />
        </linearGradient>
        <linearGradient id="mw-sail" x1="0.1" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#e8d8c0" />
          <stop offset="100%" stopColor="#c4a870" />
        </linearGradient>
        <linearGradient id="mw-sail-off" x1="0.1" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#f0e4d0" />
          <stop offset="70%" stopColor="#c8a868" />
          <stop offset="100%" stopColor="#9e7840" />
        </linearGradient>
        <linearGradient id="mw-mast" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"  stopColor="#5e3e10" />
          <stop offset="42%" stopColor="#c49030" />
          <stop offset="100%" stopColor="#5e3e10" />
        </linearGradient>
      </defs>
      {/* Wake */}
      <ellipse cx="120" cy="135" rx="110" ry="10" fill="rgba(139,90,43,0.20)" />
      <motion.g animate={reduced ? undefined : { opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}>
        <ellipse cx="200" cy="128" rx="28" ry="3.5" fill="rgba(139,90,43,0.25)" />
        <ellipse cx="212" cy="131" rx="18" ry="2.2" fill="rgba(139,90,43,0.18)" />
      </motion.g>
      {/* Hull */}
      <motion.g animate={reduced ? undefined : { x: [0, 2, -1, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M 22,128 C 18,119 20,108 30,104 L 205,101 C 216,103 222,113 222,128 C 222,141 212,147 198,147 L 40,147 C 28,145 22,138 22,128 Z"
          fill="url(#mw-hull)" stroke="rgba(200,16,46,0.45)" strokeWidth="1.4" />
        <path d="M 24,122 L 212,118 C 218,119 220,122 219,124 L 24,128 Z" fill="rgba(200,16,46,0.55)" />
        <path d="M 26,136 L 208,134 L 210,140 L 26,142 Z" fill="rgba(6,4,12,0.7)" />
        <rect x="193" y="84" width="28" height="20" rx="2" fill="#120e22" stroke="rgba(200,16,46,0.30)" strokeWidth="0.8" />
        {[85, 110, 140, 170].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={116} r={3.8} fill="rgba(200,16,46,0.12)" stroke="rgba(200,16,46,0.45)" strokeWidth="1" />
            <circle cx={cx} cy={116} r={1.5} fill="rgba(200,16,46,0.15)" />
          </g>
        ))}
        <line x1="27" y1="110" x2="-8" y2="96" stroke="url(#mw-mast)" strokeWidth="2.2" strokeLinecap="round" />
      </motion.g>
      {/* Masts & sails */}
      <motion.g animate={reduced ? undefined : { x: [0, 2, -1, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}>
        <line x1="80" y1="102" x2="80" y2="30" stroke="url(#mw-mast)" strokeWidth="3" strokeLinecap="round" />
        <line x1="56" y1="48" x2="104" y2="46" stroke="#a47828" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="80" cy="31" r="2.2" fill="#c49030" />
        <motion.path d="M 56,48 L 104,46 L 102,100 L 59,102 Z" fill="url(#mw-sail-off)" opacity="0.85"
          animate={reduced ? undefined : { d: ["M 56,48 L 104,46 L 102,100 L 59,102 Z","M 57,48 L 104,47 L 103,100 L 60,102 Z","M 56,48 L 104,46 L 102,100 L 59,102 Z"] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }} />
        <line x1="138" y1="101" x2="138" y2="8" stroke="url(#mw-mast)" strokeWidth="3.8" strokeLinecap="round" />
        <line x1="106" y1="26" x2="170" y2="24" stroke="#a47828" strokeWidth="2" strokeLinecap="round" />
        <line x1="112" y1="58" x2="164" y2="56" stroke="#a47828" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="138" cy="9" r="2.6" fill="#c49030" />
        <path d="M 138,9 L 158,4 L 140,18 Z" fill="#C8102E" />
        <motion.path d="M 106,26 L 170,24 L 168,56 L 112,58 Z" fill="url(#mw-sail)" opacity="0.92"
          animate={reduced ? undefined : { d: ["M 106,26 L 170,24 L 168,56 L 112,58 Z","M 107,26 L 170,25 L 169,56 L 113,58 Z","M 106,26 L 170,24 L 168,56 L 112,58 Z"] }}
          transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path d="M 112,58 L 164,56 L 162,101 L 115,102 Z" fill="url(#mw-sail)" opacity="0.88"
          animate={reduced ? undefined : { d: ["M 112,58 L 164,56 L 162,101 L 115,102 Z","M 113,58 L 164,57 L 163,101 L 116,102 Z","M 112,58 L 164,56 L 162,101 L 115,102 Z"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
        <motion.path d="M 104,46 L 140,28 L 140,100 C 120,95 108,82 104,70 Z" fill="url(#mw-sail-off)" opacity="0.65"
          animate={reduced ? undefined : { d: ["M 104,46 L 140,28 L 140,100 C 120,95 108,82 104,70 Z","M 105,46 L 140,29 L 140,100 C 121,94 109,81 105,69 Z","M 104,46 L 140,28 L 140,100 C 120,95 108,82 104,70 Z"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <line x1="194" y1="101" x2="194" y2="52" stroke="url(#mw-mast)" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="178" y1="66" x2="210" y2="64" stroke="#a47828" strokeWidth="1.5" strokeLinecap="round" />
        <motion.path d="M 178,66 L 210,64 L 208,100 L 181,101 Z" fill="url(#mw-sail-off)" opacity="0.80"
          animate={reduced ? undefined : { d: ["M 178,66 L 210,64 L 208,100 L 181,101 Z","M 179,66 L 210,65 L 209,100 L 182,101 Z","M 178,66 L 210,64 L 208,100 L 181,101 Z"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
        <line x1="26" y1="108" x2="138" y2="10" stroke="rgba(139,90,43,0.28)" strokeWidth="0.8" />
        <line x1="138" y1="24" x2="112" y2="100" stroke="rgba(139,90,43,0.24)" strokeWidth="0.7" />
        <line x1="138" y1="24" x2="165" y2="100" stroke="rgba(139,90,43,0.24)" strokeWidth="0.7" />
        <line x1="80" y1="34" x2="138" y2="14" stroke="rgba(139,90,43,0.22)" strokeWidth="0.7" />
      </motion.g>
    </svg>
  );
}

// ─── Bản đồ SVG (nền giấy da, đường đỏ) ──────────────────────────────────────
function MapSVGOverlay({ routeProgress }: { routeProgress: number }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 w-full h-full" aria-hidden>

      {/* Lưới toạ độ */}
      {[20, 35, 50, 65, 80].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y}
          stroke="rgba(139,90,43,0.20)" strokeWidth="0.2" strokeDasharray="1 3" />
      ))}
      {[15, 30, 50, 70, 85].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="100"
          stroke="rgba(139,90,43,0.16)" strokeWidth="0.15" strokeDasharray="1 4" />
      ))}

      {/* Nhãn vùng biển */}
      {OCEAN_LABELS.map((lbl) => (
        <text key={lbl.text} x={lbl.x} y={lbl.y}
          fill="rgba(139,90,43,0.45)" fontSize="2.6"
          fontStyle="italic" textAnchor="middle">
          {lbl.text}
        </text>
      ))}

      {/* Đường hành trình mờ (nền) */}
      <path d={MAP_SVG_PATH} fill="none"
        stroke="rgba(200,16,46,0.22)" strokeWidth="0.5"
        strokeDasharray="0.8 1.8" strokeLinecap="round" />

      {/* Viền đỏ hào quang */}
      <path d={MAP_SVG_PATH} fill="none"
        stroke="rgba(200,16,46,0.45)" strokeWidth="2.2"
        strokeLinecap="round" pathLength="1" strokeDasharray="1"
        strokeDashoffset={1 - routeProgress}
        style={{ filter: "blur(2.5px)", transition: "stroke-dashoffset 0.15s linear" }} />

      {/* Đường đỏ rõ nét */}
      <path d={MAP_SVG_PATH} fill="none"
        stroke="#C8102E" strokeWidth="0.55"
        strokeLinecap="round" pathLength="1" strokeDasharray="1"
        strokeDashoffset={1 - routeProgress}
        style={{ transition: "stroke-dashoffset 0.15s linear" }} />

      {/* Điểm cảng */}
      {MAP_PORTS.map((port, i) => {
        const reached = routeProgress >= port.scrollPct;
        // Ports near the left edge must label to the right to avoid clipping
        const labelRight = port.xPct < 16 || i % 2 === 0;
        const textX = port.xPct + (labelRight ? 2.8 : -2.8);
        const anchor = labelRight ? "start" : "end";
        return (
          <g key={port.id}>
            <motion.circle cx={port.xPct} cy={port.yPct} r={2.2} fill="none"
              stroke={reached ? "#C8102E" : "rgba(200,16,46,0.35)"} strokeWidth="0.35"
              style={{ transition: "stroke 0.6s" }}
              animate={reached ? { r: [2.2, 3.4, 2.2] } : undefined}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
            <circle cx={port.xPct} cy={port.yPct} r={0.9}
              fill={reached ? "#C8102E" : "rgba(200,16,46,0.40)"}
              style={{ transition: "fill 0.6s" }} />
            <text x={textX} y={port.yPct - 2}
              fill={reached ? "#1a0506" : "rgba(26,5,6,0.45)"}
              fontSize="2.0" fontWeight="bold"
              textAnchor={anchor}
              style={{ transition: "fill 0.6s" }}>
              {port.name}
            </text>
            <text x={textX} y={port.yPct + 0.5}
              fill={reached ? "rgba(200,16,46,0.75)" : "rgba(200,16,46,0.30)"}
              fontSize="1.5" fontStyle="italic"
              textAnchor={anchor}
              style={{ transition: "fill 0.6s" }}>
              {port.era}
            </text>
          </g>
        );
      })}

      {/* Hoa la bàn */}
      <g transform="translate(91,88)">
        <circle r="4.5" fill="rgba(200,16,46,0.10)" stroke="rgba(200,16,46,0.50)" strokeWidth="0.4" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="rgba(200,16,46,0.60)" strokeWidth="0.4" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="rgba(200,16,46,0.60)" strokeWidth="0.4" />
        <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="rgba(200,16,46,0.28)" strokeWidth="0.25" />
        <line x1="2.8" y1="-2.8" x2="-2.8" y2="2.8" stroke="rgba(200,16,46,0.28)" strokeWidth="0.25" />
        <polygon points="0,-3.5 0.7,-0.5 -0.7,-0.5" fill="#C8102E" />
        <text x="0" y="-5.5" fill="rgba(200,16,46,0.80)" fontSize="1.8" textAnchor="middle" fontWeight="bold">N</text>
      </g>

      {/* Tiêu đề bản đồ */}
      <text x="50" y="5.5" fill="rgba(139,90,43,0.40)" fontSize="2.4"
        fontStyle="italic" textAnchor="middle" fontWeight="bold">
        Hải Trình Lịch Sử · 1911–1930
      </text>
    </svg>
  );
}

// ─── Bảng nội dung bên phải (đầy đủ lý thuyết) ───────────────────────────────
interface ContentPanelProps {
  portIndex: number;
  phase: Phase;
  onStart: () => void;
  onContinue: () => void;
  onFinish: () => void;
}

function RightPanel({ portIndex, phase, onStart, onContinue, onFinish }: ContentPanelProps) {
  const port = MAP_PORTS[portIndex];
  const location = port
    ? VOYAGE_LOCATIONS.find((loc) => loc.id === port.id)
    : undefined;
  const isLast = portIndex === MAP_PORTS.length - 1;
  const content = location
    ? [
        location.historicalContext,
        location.experienced,
        location.ideologicalEvolution,
        location.significance,
      ]
    : [];
  const highlight = location?.arrivalNarration;
  const lastPortName = MAP_PORTS[MAP_PORTS.length - 1]?.name ?? "điểm cuối";
  const totalLegs = Math.max(1, MAP_PORTS.length - 1);

  return (
    <div className="flex h-full flex-col" style={{ background: "#FFFFFF" }}>

      {/* ── Idle: màn chào đón ── */}
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div key="idle"
            className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 h-1 w-16 rounded-full" style={{ background: "#C8102E" }} />
            <p className="font-cinzel text-xs uppercase tracking-[0.55em] mb-5"
              style={{ color: "rgba(200,16,46,0.7)" }}>
              Hải Trình Lịch Sử · 1911
            </p>
            <h3 className="font-cinzel font-bold mb-4" style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", color: "#1a0506" }}>
              Con Tàu Đang Chờ Lệnh Khởi Hành
            </h3>
            <p className="font-playfair italic text-sm leading-relaxed mb-8 max-w-sm"
              style={{ color: "rgba(26,5,6,0.72)" }}>
              Nhấn nút bên dưới để con tàu rời Bến Nhà Rồng và bắt đầu hành trình tìm đường cứu nước vĩ đại.
            </p>
            <button type="button" onClick={onStart}
              className="btn-red font-cinzel rounded-full px-10 py-4 text-base tracking-widest">
              ⚓ Khởi Hành
            </button>
            <p className="mt-5 text-xs font-cinzel uppercase tracking-widest"
              style={{ color: "rgba(200,16,46,0.4)" }}>
              Bến Nhà Rồng · Sài Gòn · 5 tháng 6 năm 1911
            </p>
          </motion.div>
        )}

        {/* ── Traveling: tàu đang chạy ── */}
        {phase === "traveling" && (
          <motion.div key="traveling"
            className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-8 flex gap-1.5">
              {[0,1,2,3,4].map(i => (
                <motion.div key={i} className="rounded-full" style={{ width: 10, height: 10, background: "#C8102E" }}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
            <p className="font-cinzel font-bold text-xl mb-3" style={{ color: "#1a0506" }}>
              Tàu đang lướt sóng…
            </p>
            <p className="font-playfair italic text-sm" style={{ color: "rgba(26,5,6,0.68)" }}>
              {portIndex < MAP_PORTS.length - 1
                ? `Đang tiến về ${MAP_PORTS[portIndex + 1]?.name ?? "cảng tiếp theo"}`
                : "Đang về cảng cuối cùng"}
            </p>

            {/* Animated waves */}
            <div className="mt-8 overflow-hidden" style={{ width: 120, height: 30 }}>
              <svg viewBox="0 0 120 30" className="w-full h-full">
                {[0, 1].map(i => (
                  <motion.path key={i}
                    fill="none" stroke={i === 0 ? "#C8102E" : "rgba(200,16,46,0.35)"}
                    strokeWidth={i === 0 ? 2 : 1.5} strokeLinecap="round"
                    d="M0,15 C20,5 40,25 60,15 C80,5 100,25 120,15"
                    animate={{ d: [
                      "M0,15 C20,5 40,25 60,15 C80,5 100,25 120,15",
                      "M0,18 C22,8 42,26 62,18 C82,8 102,26 120,18",
                      "M0,15 C20,5 40,25 60,15 C80,5 100,25 120,15",
                    ]}}
                    transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }} />
                ))}
              </svg>
            </div>
          </motion.div>
        )}

        {/* ── Docked: toàn bộ nội dung lý thuyết ── */}
        {(phase === "docked") && port && location && (
          <motion.div key={`docked-${portIndex}`}
            className="flex flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>

            {/* Header cảng */}
            <div className="flex-shrink-0 px-7 py-5" style={{ borderBottom: "2px solid #C8102E" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-cinzel text-[10px] uppercase tracking-[0.45em]"
                      style={{ color: "#C8102E" }}>Chặng {portIndex + 1}</span>
                    <span className="h-px w-6" style={{ background: "#C8102E", display: "inline-block" }} />
                    <span className="font-cinzel text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: "rgba(200,16,46,0.6)" }}>{port.era}</span>
                  </div>
                  <h2 className="font-cinzel font-bold leading-tight"
                    style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", color: "#1a0506" }}>
                    {location.name}
                  </h2>
                  <p className="mt-1 font-playfair italic text-sm"
                    style={{ color: "rgba(200,16,46,0.75)" }}>
                    {location.atmosphere}
                  </p>
                </div>
                {/* Số thứ tự lớn trang trí */}
                <div className="font-cinzel font-black flex-shrink-0 leading-none"
                  style={{ fontSize: "4rem", color: "rgba(200,16,46,0.08)", lineHeight: 1 }}
                  aria-hidden>
                  {String(portIndex + 1).padStart(2,"0")}
                </div>
              </div>
              {/* Vị trí */}
              <p className="mt-2 font-cinzel text-[10px] uppercase tracking-[0.35em]"
                style={{ color: "rgba(26,5,6,0.45)" }}>
                📍 {port.nameVi} · {port.era}
              </p>
            </div>

            {/* Nội dung cuộn */}
            <div className="flex-1 overflow-y-auto px-7 py-5" style={{ scrollbarWidth: "thin", scrollbarColor: "#C8102E #f0e8e8" }}>

              {/* Tất cả đoạn nội dung */}
              <div className="space-y-4 mb-6">
                {content.map((para, i) => (
                  <p key={i} className="text-sm leading-[1.9]"
                    style={{ color: "rgba(26,5,6,0.80)" }}>
                    {i === 0 && (
                      <span className="float-left mr-2 font-cinzel font-bold text-3xl leading-[0.9]"
                        style={{ color: "#C8102E" }}>
                        {para[0]}
                      </span>
                    )}
                    {i === 0 ? para.slice(1) : para}
                  </p>
                ))}
              </div>

              {/* Điểm nổi bật */}
              {highlight && (
                <div className="mb-5 rounded-xl px-5 py-4"
                  style={{ background: "rgba(200,16,46,0.05)", borderLeft: "4px solid #C8102E" }}>
                  <p className="font-cinzel text-[10px] uppercase tracking-[0.4em] mb-2"
                    style={{ color: "#C8102E" }}>✦ Điểm nổi bật</p>
                  <p className="font-playfair font-medium text-sm leading-relaxed"
                    style={{ color: "#1a0506" }}>
                    {highlight}
                  </p>
                </div>
              )}
            </div>

            {/* Footer nút */}
            <div className="flex-shrink-0 px-7 py-4" style={{ borderTop: "1px solid rgba(200,16,46,0.12)" }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-cinzel text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(26,5,6,0.4)" }}>
                    {isLast ? "Đây là điểm cuối của hành trình" : `Tiếp theo: ${MAP_PORTS[portIndex + 1]?.name}`}
                  </p>
                  {/* Progress */}
                  <div className="mt-2 flex gap-1.5">
                    {MAP_PORTS.map((_, i) => (
                      <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: i === portIndex ? 20 : 8, background: i <= portIndex ? "#C8102E" : "rgba(200,16,46,0.18)" }} />
                    ))}
                  </div>
                </div>
                <button type="button"
                  onClick={isLast ? onFinish : onContinue}
                  className="btn-red font-cinzel flex-shrink-0 rounded-full px-7 py-3 text-sm tracking-widest">
                  {isLast ? "Hoàn Thành →" : "Tiếp Tục →"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Completed ── */}
        {phase === "completed" && (
          <motion.div key="completed"
            className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}>
            <div className="mb-6 text-5xl">🇻🇳</div>
            <p className="font-cinzel text-xs uppercase tracking-[0.5em] mb-4"
              style={{ color: "#C8102E" }}>
              Hành trình hoàn thành
            </p>
            <h3 className="font-cinzel font-bold text-2xl mb-4" style={{ color: "#1a0506" }}>
              Từ Bến Nhà Rồng đến {lastPortName}
            </h3>
            <p className="font-playfair italic text-sm leading-relaxed mb-8 max-w-sm"
              style={{ color: "rgba(26,5,6,0.6)" }}>
              Qua {totalLegs} chặng, Nguyễn Tất Thành đã tìm ra con đường giải phóng dân tộc Việt Nam.
            </p>
            <button type="button"
              onClick={() => document.getElementById("y-nghia")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-red font-cinzel rounded-full px-8 py-3 text-sm tracking-widest">
              Khám Phá Ý Nghĩa →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── JourneyMapWorld (click-driven, không cần cuộn) ──────────────────────────
export function JourneyMapWorld() {
  const shipRef       = useRef<HTMLDivElement | null>(null);
  const phaseRef      = useRef<Phase>("idle");
  const portIndexRef  = useRef(0);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced       = useReducedMotion();

  const [phase,         setPhase]        = useState<Phase>("idle");
  const [portIndex,     setPortIndex]   = useState(0);
  const [routeProgress, setRouteProgress] = useState(0);
  const [hoveredPort,   setHoveredPort] = useState<string | null>(null);

  const setPhaseSync = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Đặt tàu về vị trí ban đầu (Ben Nha Rong)
  useEffect(() => {
    if (!shipRef.current) return;
    const port = MAP_PORTS[0]!;
    gsap.set(shipRef.current, { left: `${port.xPct}%`, top: `${port.yPct}%` });
  }, []);

  const travelTo = useCallback((nextIdx: number) => {
    if (!shipRef.current) return;
    const nextPort = MAP_PORTS[nextIdx]!;
    const duration = reduced ? 0.3 : 2.8;

    gsap.to(shipRef.current, {
      left: `${nextPort.xPct}%`,
      top:  `${nextPort.yPct}%`,
      duration,
      ease: "power2.inOut",
      onUpdate() {
        const prog = nextIdx / (MAP_PORTS.length - 1);
        const prevProg = portIndexRef.current / (MAP_PORTS.length - 1);
        // Tiến trình mượt trong animation
        const tween = gsap.getProperty(shipRef.current!, "left") as number;
        const approxT = (tween / window.innerWidth - MAP_PORTS[portIndexRef.current]!.xPct / 100)
          / ((nextPort.xPct - MAP_PORTS[portIndexRef.current]!.xPct) / 100);
        setRouteProgress(prevProg + Math.min(1, Math.max(0, approxT)) * (prog - prevProg));
      },
      onComplete() {
        portIndexRef.current = nextIdx;
        setPortIndex(nextIdx);
        setRouteProgress(nextIdx / (MAP_PORTS.length - 1));

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (phaseRef.current === "traveling") setPhaseSync("docked");
        }, 500);
      },
    });
  }, [reduced]);

  const handleStart = useCallback(() => {
    // Bến Nhà Rồng — hiện ngay nội dung (không cần di chuyển)
    setPhaseSync("docked");
  }, []);

  const handleContinue = useCallback(() => {
    if (phaseRef.current !== "docked") return;
    const next = portIndexRef.current + 1;
    if (next >= MAP_PORTS.length) { setPhaseSync("completed"); return; }
    setPhaseSync("traveling");
    travelTo(next);
  }, [travelTo]);

  const handleFinish = useCallback(() => {
    setPhaseSync("completed");
  }, []);

  return (
    <section id="hanh-trinh" style={{ background: "#FDF5E8" }}>

      {/* Tiêu đề section */}
      <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8">
        <div className="mx-auto mb-4 h-1 w-16 rounded-full" style={{ background: "#C8102E" }} />
        <p className="mb-3 font-cinzel text-xs uppercase tracking-[0.55em]"
          style={{ color: "#C8102E" }}>
          Cuộc Hành Trình Vĩ Đại
        </p>
        <h2 className="font-cinzel font-bold" style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", color: "#1a0506" }}>
          Hành Trình Tìm <span style={{ color: "#C8102E" }}>Đường Cứu Nước</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg font-playfair italic text-sm leading-relaxed"
          style={{ color: "rgba(26,5,6,0.55)" }}>
          Bấm <strong style={{ color: "#C8102E" }}>Khởi Hành</strong> để con tàu tự di chuyển đến từng chặng —
          đọc nội dung rồi bấm <strong style={{ color: "#C8102E" }}>Tiếp Tục</strong> để sang chặng kế tiếp.
        </p>
      </div>

      {/* Khu vực tương tác chính */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl shadow-[0_20px_80px_rgba(200,16,46,0.15),0_4px_20px_rgba(0,0,0,0.08)]"
          style={{ border: "2px solid rgba(200,16,46,0.15)", minHeight: "85vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>

          {/* ── Cột trái: Bản đồ ── */}
          <div className="relative overflow-hidden" style={{ minHeight: "85vh", background: "#FDF5E8", borderRight: "1px solid rgba(200,16,46,0.12)" }}>

            {/* Overlay bản đồ SVG */}
            <MapSVGOverlay routeProgress={routeProgress} />

            {/* Con tàu (absolute, GSAP điều khiển left/top) */}
            <div ref={shipRef} className="pointer-events-none absolute"
              style={{ width: "clamp(150px,20vw,240px)", transform: "translate(-50%,-50%)", zIndex: 20 }}
              aria-hidden>
              <motion.div animate={reduced ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <MapShipSVG reduced={reduced} />
              </motion.div>

              {/* Khói tàu */}
              {!reduced && [0,1,2,3].map((i) => (
                <motion.div key={i} className="absolute rounded-full"
                  style={{
                    width: 6 + i*5, height: 6 + i*5,
                    background: `rgba(139,90,43,0.18)`,
                    top: -10 - i*8, left: "57%",
                  }}
                  animate={{ y: [-4, -36-i*14], opacity: [0.3, 0], scale: [1, 2.2+i*0.4] }}
                  transition={{ duration: 3.2, repeat: Infinity, delay: i*0.9, ease: "easeOut" }} />
              ))}
            </div>

            {/* Nút Khởi Hành trên bản đồ (khi idle) */}
            <AnimatePresence>
              {phase === "idle" && (
                <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="pointer-events-none absolute inset-0"
                    style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.5), transparent)" }} />
                  <motion.button type="button" onClick={handleStart}
                    className="relative btn-red font-cinzel rounded-full px-10 py-4 text-base tracking-widest shadow-lg"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    animate={{ boxShadow: ["0 4px 20px rgba(200,16,46,0.3)","0 8px 36px rgba(200,16,46,0.55)","0 4px 20px rgba(200,16,46,0.3)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}>
                    ⚓ Khởi Hành
                  </motion.button>
                  <p className="relative mt-3 font-cinzel text-[10px] uppercase tracking-widest"
                    style={{ color: "rgba(200,16,46,0.5)" }}>
                    Bến Nhà Rồng · 1911
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Port photo cards + hover hitboxes */}
            {MAP_PORTS.map((port, idx) => {
              const reached   = routeProgress >= port.scrollPct;
              const isHovered = hoveredPort === port.id;
              return (
                <motion.div
                  key={port.id}
                  className="absolute"
                  style={{ left: `${port.xPct}%`, top: `${port.yPct}%`, transform: "translate(-50%,-50%)", zIndex: isHovered ? 30 : 25 }}
                  onMouseEnter={() => setHoveredPort(port.id)}
                  onMouseLeave={() => setHoveredPort(null)}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, delay: 0.15 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Polaroid photo card above (or below) the dot */}
                  <PortPhotoCard
                    name={port.name}
                    era={port.era}
                    imageUrl={port.imageUrl}
                    tint={port.tint}
                    reached={reached}
                    hovered={isHovered}
                    side={port.cardSide ?? "top"}
                    rotate={ROTATIONS[idx % ROTATIONS.length]}
                  />

                  {/* Invisible hit area centered on dot */}
                  <div style={{ width: 28, height: 28 }} />

                  {/* Detail tooltip — chỉ hiện khi hover, ở phía đối diện photo card */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.94 }}
                        transition={{ duration: 0.18 }}
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-center"
                        style={{
                          // Đặt tooltip ở phía đối diện photo card để không che nhau
                          top:    port.cardSide === "top" ? "calc(100% + 6px)" : "auto",
                          bottom: port.cardSide === "top" ? "auto" : "calc(100% + 6px)",
                          background: "#1a0506",
                          boxShadow: "0 6px 18px rgba(0,0,0,0.30), 0 0 0 1px rgba(200,16,46,0.35)",
                        }}>
                        <p className="font-cinzel text-[10px] font-bold" style={{ color: "#FFD700" }}>
                          {port.nameVi}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Vùng biểu tượng góc trên trái */}
            <div className="absolute top-4 left-4 z-10">
              <p className="font-cinzel text-[9px] uppercase tracking-[0.45em]"
                style={{ color: "rgba(200,16,46,0.55)" }}>
                Bản Đồ Hải Trình
              </p>
            </div>
          </div>

          {/* ── Cột phải: Nội dung ── */}
          <div style={{ minHeight: "85vh" }}>
            <RightPanel
              portIndex={portIndex}
              phase={phase}
              onStart={handleStart}
              onContinue={handleContinue}
              onFinish={handleFinish}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
