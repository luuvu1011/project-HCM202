"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function MiniShip() {
  return (
    <svg viewBox="0 0 160 100" width="160" height="100" aria-hidden>
      <defs>
        <linearGradient id="ls-hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3a0a14" />
          <stop offset="100%" stopColor="#200508" />
        </linearGradient>
        <linearGradient id="ls-sail" x1="0.1" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(220,190,140,0.85)" />
        </linearGradient>
      </defs>
      {/* Hull */}
      <path d="M18,68 L142,68 L132,80 L28,80 Z" fill="url(#ls-hull)" stroke="rgba(255,215,0,0.5)" strokeWidth="0.8" />
      <path d="M20,63 L140,60 L142,64 L20,68 Z" fill="rgba(255,215,0,0.45)" />
      {/* Main mast */}
      <line x1="72" y1="68" x2="72" y2="10" stroke="rgba(200,160,80,0.9)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="72" cy="10" r="2" fill="rgba(255,215,0,0.9)" />
      {/* Vietnam flag */}
      <rect x="71" y="10" width="18" height="12" fill="#C8102E" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
      <polygon points="80,12 81.4,16 85.5,16 82.4,18.5 83.6,22.5 80,20 76.4,22.5 77.6,18.5 74.5,16 78.6,16"
        fill="#FFD700" />
      {/* Main sails */}
      <path d="M50,16 L94,14 L92,40 L52,42 Z" fill="url(#ls-sail)" opacity="0.9" />
      <path d="M52,42 L92,40 L90,65 L54,67 Z" fill="url(#ls-sail)" opacity="0.8" />
      {/* Fore mast */}
      <line x1="44" y1="68" x2="44" y2="28" stroke="rgba(180,130,60,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28,34 L60,32 L58,66 L30,68 Z" fill="url(#ls-sail)" opacity="0.72" />
      {/* Aft mast */}
      <line x1="112" y1="68" x2="112" y2="40" stroke="rgba(180,130,60,0.75)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M100,46 L124,44 L122,66 L102,68 Z" fill="url(#ls-sail)" opacity="0.65" />
      {/* Rigging */}
      <line x1="18" y1="65" x2="72" y2="12" stroke="rgba(200,160,80,0.22)" strokeWidth="0.7" />
      <line x1="72" y1="14" x2="44" y2="30" stroke="rgba(200,160,80,0.20)" strokeWidth="0.6" />
    </svg>
  );
}

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"loading" | "reveal" | "exit">("loading");
  const reduced   = useReducedMotion();
  const doneRef   = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reduced) { doneRef.current(); return; }

    const t1 = setTimeout(() => setPhase("reveal"), 900);
    const t2 = setTimeout(() => setPhase("exit"),   3200);
    const t3 = setTimeout(() => doneRef.current(),  3900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]); // reduced là deps duy nhất; doneRef không cần vì stable via ref

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(150deg, #9a0c22 0%, #C8102E 45%, #a00e26 100%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 3 + (i % 3) * 2,
                height: 3 + (i % 3) * 2,
                left: `${(i * 137.5 + 8) % 90}%`,
                bottom: "5%",
                background: i % 3 === 0 ? "rgba(255,215,0,0.65)" : "rgba(255,255,255,0.35)",
              }}
              animate={{ y: [-4, -110 - i * 12], opacity: [0.4, 0], scale: [1, 1.8] }}
              transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.35, ease: "easeOut" }}
            />
          ))}

          {/* Light rays */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 55% at 50% 55%, rgba(255,255,255,0.09), transparent 60%)" }} />

          {/* Ship + wake */}
          <motion.div
            className="relative mb-10"
            initial={{ x: -200, opacity: 0 }}
            animate={phase === "loading" ? { x: -200, opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <MiniShip />
            </motion.div>

            {/* Wave beneath ship */}
            <svg viewBox="0 0 200 20" width="200" style={{ marginTop: -4 }} aria-hidden>
              <motion.path
                d="M0,10 C40,4 80,16 120,10 C160,4 190,12 200,10"
                fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="2" strokeLinecap="round"
                animate={{ d: [
                  "M0,10 C40,4 80,16 120,10 C160,4 190,12 200,10",
                  "M0,12 C45,6 85,16 125,12 C162,6 192,14 200,12",
                  "M0,10 C40,4 80,16 120,10 C160,4 190,12 200,10",
                ]}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>

          {/* Text reveal */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={phase === "loading" ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-cinzel text-[10px] uppercase tracking-[0.7em] mb-4"
              style={{ color: "rgba(255,215,0,0.75)" }}>
              Bến Nhà Rồng · 5 tháng 6 · 1911
            </p>
            <h1 className="font-cinzel font-bold text-white leading-[1.06]"
              style={{ fontSize: "clamp(1.8rem,4.5vw,3.2rem)" }}>
              Hành Trình Ra Đi
              <br /><span style={{ color: "#FFD700" }}>Tìm Đường Cứu Nước</span>
            </h1>
            <p className="mt-4 font-playfair italic text-white/65 text-sm">
              của Nguyễn Tất Thành
            </p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 overflow-hidden rounded-full"
            style={{ width: 140, height: 2, background: "rgba(255,255,255,0.15)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#FFD700" }}
              initial={{ width: "0%" }}
              animate={{ width: phase === "reveal" ? "80%" : "30%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </motion.div>

          {/* Scroll hint */}
          <motion.p
            className="absolute bottom-6 left-1/2 -translate-x-1/2 font-cinzel text-[9px] uppercase tracking-[0.5em]"
            style={{ color: "rgba(255,255,255,0.30)" }}
            initial={{ opacity: 0 }}
            animate={phase === "reveal" ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Đang tải hành trình…
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
