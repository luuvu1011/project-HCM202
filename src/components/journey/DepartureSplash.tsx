"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cinematicEase } from "@/animations/transitions";
import type { JourneyPhase } from "@/hooks/useJourneyMachine";

interface Props {
  phase: JourneyPhase;
  onStart: () => void;
}

const CHIPS = [
  "Khủng hoảng thuộc địa",
  "Thế kỷ của đế quốc",
  "1917 — bước ngoặt lý luận",
  "Từ yêu nước đến phương pháp",
] as const;

export function DepartureSplash({ phase, onStart }: Props) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  // ── GSAP cinematic entrance ─────────────────────────────────────────────
  useEffect(() => {
    if (reduced || !textRef.current || phase !== "idle") return;

    const el  = textRef.current;
    const ctx = gsap.context(() => {
      gsap.set("[data-splash-item]", { opacity: 0, y: 44 });
      gsap.set("[data-splash-chip]", { opacity: 0, y: 20, scale: 0.94 });

      const tl = gsap.timeline({ delay: 0.4 });
      tl.to("[data-splash-eyebrow]",  { opacity: 1, y: 0, duration: 0.80, ease: "power2.out" })
        .to("[data-splash-line1]",    { opacity: 1, y: 0, duration: 1.05, ease: "power3.out" }, "-=0.35")
        .to("[data-splash-line2]",    { opacity: 1, y: 0, duration: 1.05, ease: "power3.out" }, "-=0.65")
        .to("[data-splash-subtitle]", { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" }, "-=0.55")
        .to("[data-splash-desc]",     { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, "-=0.40")
        .to("[data-splash-chip]",     { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07, ease: "power2.out" }, "-=0.35")
        .to("[data-splash-cta]",      { opacity: 1, y: 0, duration: 0.60, ease: "power2.out" }, "-=0.25");
    }, el);

    return () => ctx.revert();
  }, [reduced, phase]);

  return (
    <AnimatePresence>
      {(phase === "idle" || phase === "departing") && (
        <motion.div
          key="splash"
          className="pointer-events-auto fixed inset-0 z-[30] flex flex-col items-center justify-center px-5 sm:px-8"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: cinematicEase } }}
        >
          {/* Light shafts */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="vv-light-shaft absolute -top-[8%] left-[38%] h-[88%] w-[24%] origin-top -skew-x-12 opacity-90" />
            <div className="vv-light-shaft absolute -top-[5%] left-[15%] h-[72%] w-[14%] origin-top -skew-x-6 opacity-55" />
          </div>

          {/* Top veil */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[rgba(4,8,20,0.72)] via-[rgba(4,8,20,0.12)] to-transparent" />
          {/* Bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-[rgba(2,5,14,0.68)] to-transparent" />

          {/* ── Departing overlay ─────────────────────────────────────────── */}
          <AnimatePresence>
            {phase === "departing" && (
              <motion.div
                key="departing"
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-display text-[clamp(1.4rem,3vw,2.2rem)] italic text-parchment/80">
                  Con tàu rời cảng Sài Gòn…
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.44em] text-gold/60">
                  Bắt đầu hành trình trên biển
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main splash content (idle only) ───────────────────────────── */}
          <AnimatePresence>
            {phase === "idle" && (
              <motion.div
                key="idle-content"
                ref={textRef}
                className="relative z-10 mx-auto max-w-2xl text-center"
                exit={{ opacity: 0, y: -16, transition: { duration: 0.5 } }}
              >
                <p className="text-[9px] font-medium uppercase tracking-[0.50em] text-parchment-muted/38">
                  Historical Voyage
                </p>

                <p
                  data-splash-item
                  data-splash-eyebrow
                  className="mt-2 text-[11px] font-semibold uppercase tracking-[0.40em] text-gold-soft/90"
                >
                  Bến Nhà Rồng · 5 tháng 6 · 1911
                </p>

                <div className="mt-8">
                  <h1 className="font-display text-[clamp(2.8rem,6.8vw,5rem)] font-semibold leading-[1.02] tracking-tight text-parchment">
                    <span data-splash-item data-splash-line1 className="vv-line-mask block">
                      Hành trình ra đi
                    </span>
                    <span data-splash-item data-splash-line2 className="vv-line-mask mt-1 block text-gold-soft">
                      tìm đường cứu nước
                    </span>
                    <span
                      data-splash-item
                      data-splash-subtitle
                      className="mt-4 block font-sans text-[clamp(1.1rem,2.4vw,1.6rem)] font-medium text-parchment-muted"
                    >
                      của Nguyễn Tất Thành
                    </span>
                  </h1>
                </div>

                <p
                  data-splash-item
                  data-splash-desc
                  className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-parchment-muted sm:text-base"
                >
                  Sau biến cố 1858, đất nước lún sâu vào khủng hoảng thực dân. Ra đi là
                  quyết định tìm chân lý trong thực tiễn thế giới — nơi chủ nghĩa đế
                  quốc, các lý tưởng Khai sáng, và sau này là Mác — Lênin cùng va chạm
                  với truyền thống dân tộc để hình thành một con đường cứu nước mới.
                </p>

                <ul className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] text-parchment-muted">
                  {CHIPS.map((chip) => (
                    <li
                      key={chip}
                      data-splash-chip
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 backdrop-blur-sm"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>

                <div data-splash-item data-splash-cta className="mt-9 flex justify-center">
                  <Button type="button" onClick={onStart} className="px-8 py-3">
                    Bắt đầu hành trình
                  </Button>
                </div>

                <p className="mt-5 text-[10px] text-parchment-muted/40">
                  Cuộn để lái thuyền · Dừng tại mỗi bến để đọc lịch sử
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Coordinates watermark */}
          <div className="pointer-events-none absolute bottom-8 right-6 sm:right-10" aria-hidden>
            <p className="font-mono text-[9px] tracking-widest text-parchment-muted/25">
              10°46′N · 106°42′E
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
