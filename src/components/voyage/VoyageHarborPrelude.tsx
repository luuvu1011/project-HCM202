"use client";

import { motion } from "framer-motion";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function VoyageHarborPrelude({
  onDepart,
}: {
  onDepart: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      id="ben-nha-rong-voyage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mb-8 overflow-hidden rounded-[28px] border border-glass-border bg-[radial-gradient(ellipse_at_50%_120%,rgba(26,75,124,0.52),#050f1f_58%)] shadow-[0_40px_100px_rgba(0,0,0,0.55)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_24%,transparent_72%,rgba(5,15,31,0.55))]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20%] top-[10%] h-40 rounded-full bg-parchment/[0.04] blur-3xl"
        animate={
          reduced ? undefined : { x: [0, 40, 0], opacity: [0.35, 0.55, 0.35] }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fog/45 via-transparent to-ocean-deep/90"
        animate={reduced ? undefined : { opacity: [0.4, 0.7, 0.46] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(26,75,124,0.28),transparent_62%)]" />
      <svg
        className="pointer-events-none absolute bottom-0 left-0 w-full text-ocean-glow/35"
        viewBox="0 0 1200 180"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          fill="currentColor"
          d="M0,108 C180,84 380,132 600,102 C820,72 1000,116 1200,90 L1200,180 L0,180 Z"
          animate={
            reduced
              ? undefined
              : {
                  d: [
                    "M0,108 C180,84 380,132 600,102 C820,72 1000,116 1200,90 L1200,180 L0,180 Z",
                    "M0,120 C200,96 390,122 600,114 C840,104 1010,92 1200,102 L1200,180 L0,180 Z",
                    "M0,108 C180,84 380,132 600,102 C820,72 1000,116 1200,90 L1200,180 L0,180 Z",
                  ],
                }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      <div className="relative z-10 grid items-center gap-8 px-6 py-12 sm:grid-cols-[1.05fr_0.95fr] sm:px-10 sm:py-14">
        <div className="space-y-5 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-soft/90">
            Bến Nhà Rồng
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-parchment sm:text-4xl md:text-[2.65rem]">
            Khởi điểm của một hành trình đại dương
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-parchment-muted sm:mx-0 sm:text-base">
            Sóng vỗ bến, sương mờ phủ, đèn cảng lay động trong gió — nơi con tàu
            nhỏ bé mang theo khát vọng tìm đường cứu nước giữa biển lớn của lịch
            sử.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <Button
              type="button"
              className="min-h-[56px] px-8 text-base sm:px-10"
              onClick={onDepart}
            >
              Khởi hành tìm đường cứu nước
            </Button>
          </div>
          <p className="flex items-center justify-center gap-2 text-[11px] text-parchment-muted/80 sm:justify-start sm:text-xs">
            <Anchor className="h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden />
            Sau khi khởi hành, bạn vẫn có thể tạm dừng, phát lại, hoặc chọn
            điểm thủ công trên bản đồ.
          </p>
        </div>

        <div className="flex justify-center sm:justify-end">
          <motion.div
            className="relative w-[min(100%,420px)]"
            animate={reduced ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-gold/12 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-10 bottom-8 h-24 rounded-full bg-ocean-glow/25 blur-2xl" />
            <svg
              viewBox="0 0 460 280"
              className="relative w-full drop-shadow-[0_32px_70px_rgba(0,0,0,0.6)]"
              aria-hidden
            >
              <defs>
                <linearGradient id="hullH" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1b2f4d" />
                  <stop offset="100%" stopColor="#081224" />
                </linearGradient>
                <linearGradient id="sailH" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f0e6d4" />
                  <stop offset="100%" stopColor="#c4a574" />
                </linearGradient>
              </defs>
              <rect
                x="0"
                y="210"
                width="460"
                height="70"
                fill="url(#hullH)"
                opacity="0.35"
                rx="4"
              />
              <path
                d="M72 194 C118 144 194 129 278 132 C355 135 404 160 424 194 L388 226 C330 208 252 202 210 202 C138 202 86 216 48 232 Z"
                fill="url(#hullH)"
                stroke="rgba(212,168,83,0.45)"
                strokeWidth="1.5"
              />
              <path
                d="M224 132 L224 34 L356 122 Z"
                fill="url(#sailH)"
                opacity="0.96"
              />
              <path
                d="M220 34 L220 224"
                stroke="rgba(212,168,83,0.55)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M58 240 C118 226 172 226 232 232 C298 238 350 236 418 224"
                fill="none"
                stroke="rgba(232,201,122,0.3)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M42 248 C110 236 178 236 248 242 C314 248 372 246 440 234"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
