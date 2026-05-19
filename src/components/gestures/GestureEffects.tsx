"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGestureBridge } from "@/hooks/useGestureBridge";
import type { GestureKind } from "@/types/gestures";

const labels: Record<GestureKind, string> = {
  heart: "Trái tim → cờ Việt Nam",
  thumbsUp: "Like → vụn sáng",
  wave: "Vẫy tay → cờ phấp phới",
  special: "Ánh sáng điện ảnh",
};

export function GestureEffects() {
  const { subscribe } = useGestureBridge();
  const [active, setActive] = useState<GestureKind | null>(null);

  useEffect(() => {
    let tid: number;
    const unsub = subscribe((p) => {
      setActive(p.kind);
      window.clearTimeout(tid);
      tid = window.setTimeout(() => setActive(null), 2200);
    });
    return () => {
      window.clearTimeout(tid);
      unsub();
    };
  }, [subscribe]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[35] overflow-hidden"
      aria-hidden
    >
      <div className="absolute bottom-6 left-4 max-w-xs rounded-2xl border border-white/10 bg-ocean-deep/70 px-4 py-3 text-[11px] text-parchment-muted backdrop-blur-md sm:left-8 sm:text-xs">
        <p className="font-semibold text-parchment">Tương tác cảm xúc (demo)</p>
        <p className="mt-1 leading-relaxed">
          Kiến trúc cử chỉ dự phòng: nhấn phím{" "}
          <kbd className="rounded bg-white/10 px-1">1</kbd>–
          <kbd className="rounded bg-white/10 px-1">4</kbd> để kích hoạt hiệu
          ứng — không chặn luồng học chính.
        </p>
        <ul className="mt-2 space-y-0.5 text-[10px] text-parchment-muted/90 sm:text-[11px]">
          {(Object.keys(labels) as GestureKind[]).map((k, i) => (
            <li key={k}>
              {i + 1}. {labels[k]}
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {active === "heart" ? <HeartFlagBurst key="heart" /> : null}
        {active === "thumbsUp" ? <GlowBurst key="thumbs" /> : null}
        {active === "wave" ? <WavingFlag key="wave" /> : null}
        {active === "special" ? <CinematicParticles key="spec" /> : null}
      </AnimatePresence>
    </div>
  );
}

function HeartFlagBurst() {
  return (
    <motion.div
      className="absolute left-1/2 top-1/3 -translate-x-1/2"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-28 w-40 overflow-hidden rounded-md border border-white/20 shadow-[0_0_60px_rgba(194,59,59,0.35)]">
        <div className="absolute inset-0 bg-[#da251d]" />
        <div className="absolute inset-y-0 left-0 w-2/5 bg-[#ffcd00]" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-white/25 to-transparent"
          animate={{ x: ["-30%", "120%"] }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            ❤️
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

function GlowBurst() {
  return (
    <motion.div
      className="absolute right-[18%] top-[22%] h-40 w-40 -translate-y-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(212,168,83,0.75),transparent_65%)] blur-md"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: [0.2, 1.4, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
    </motion.div>
  );
}

function WavingFlag() {
  return (
    <motion.div
      className="absolute left-[12%] top-[26%]"
      initial={{ opacity: 0, rotate: -8 }}
      animate={{ opacity: 1, rotate: 0 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex h-20 w-32 origin-left items-center justify-center rounded-sm border border-white/15 bg-gradient-to-r from-[#da251d] via-[#ff5b4d] to-[#da251d] shadow-lg"
        animate={{ skewX: [0, 3, -3, 0], rotate: [0, 1.5, -1.5, 0] }}
        transition={{ duration: 1.8, repeat: 1, ease: "easeInOut" }}
      >
        <span className="text-xs font-semibold text-parchment">Việt Nam</span>
      </motion.div>
    </motion.div>
  );
}

function CinematicParticles() {
  const dots = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: (i * 37) % 100,
    y: (i * 19) % 100,
    delay: (i % 10) * 0.04,
  }));

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute h-1 w-1 rounded-full bg-gold/80 shadow-[0_0_12px_rgba(212,168,83,0.9)]"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: [0, 1, 0], y: [24, -40] }}
          transition={{ duration: 1.8, delay: d.delay, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}
