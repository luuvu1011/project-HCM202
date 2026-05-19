"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const CHAPTERS = [
  { id: "trang-chu",     label: "Trang Chủ",    color: "#C8102E" },
  { id: "lich-su",       label: "Lịch Sử",      color: "#C8102E" },
  { id: "hanh-trinh",   label: "Hành Trình",   color: "#C8102E" },
  { id: "phim-tu-lieu", label: "Phim Tư Liệu", color: "#FFD700" },
  { id: "globe-section", label: "Địa Cầu 3D",  color: "#4080c0" },
  { id: "timeline",      label: "Thời Gian",    color: "#C8102E" },
  { id: "y-nghia",       label: "Ý Nghĩa",      color: "#C8102E" },
  { id: "tro-choi",     label: "Trò Chơi",     color: "#C8102E" },
  { id: "ket-thuc",     label: "Kết Thúc",     color: "#FFD700" },
];

export function ChapterProgress() {
  const [active, setActive]   = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const reduced               = useReducedMotion();

  // Show after first scroll
  useEffect(() => {
    const onScroll = () => setVisible(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    CHAPTERS.forEach((ch, idx) => {
      const el = document.getElementById(ch.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(idx); },
        { threshold: 0.25 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const ch = CHAPTERS[active];

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          key="chapter-nav"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          className="fixed right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2.5"
          aria-label="Điều hướng chương"
          style={{ pointerEvents: "auto" }}
        >
          {CHAPTERS.map((chapter, i) => {
            const isActive  = active === i;
            const isHovered = hovered === i;
            return (
              <div
                key={chapter.id}
                className="relative flex items-center justify-end gap-2"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Label tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.16 }}
                      className="pointer-events-none select-none whitespace-nowrap rounded-full px-3 py-1 font-cinzel text-[9px] font-bold uppercase tracking-[0.35em]"
                      style={{
                        background: isActive ? chapter.color : "rgba(10,6,6,0.88)",
                        color:      isActive && chapter.color === "#FFD700" ? "#1a0506" : "#FFFFFF",
                        boxShadow:  "0 4px 16px rgba(0,0,0,0.30)",
                      }}
                    >
                      {chapter.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Dot */}
                <button
                  type="button"
                  onClick={() => go(chapter.id)}
                  aria-label={`Đến ${chapter.label}`}
                  className="relative flex items-center justify-center"
                  style={{ width: 14, height: 14 }}
                >
                  {/* Spring ring for active */}
                  {isActive && !reduced && (
                    <motion.span
                      layoutId="chapter-ring"
                      className="absolute rounded-full"
                      style={{ inset: -3, border: `1.5px solid ${ch.color}` }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <motion.span
                    className="block rounded-full"
                    animate={{
                      width:      isActive ? 9 : isHovered ? 7 : 5,
                      height:     isActive ? 9 : isHovered ? 7 : 5,
                      background: isActive ? chapter.color : isHovered ? "rgba(200,16,46,0.55)" : "rgba(60,20,24,0.32)",
                    }}
                    transition={{ duration: 0.25 }}
                  />
                </button>
              </div>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
