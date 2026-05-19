"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function GamesSection() {
  return (
    <section id="tro-choi" className="relative scroll-mt-24 py-20 sm:py-28"
      style={{ background: "#FFFFFF", borderTop: "4px solid #C8102E" }}>

      <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8">

        {/* Tiêu đề section */}
        <ScrollReveal>
          <div className="mb-14 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="h-0.5 w-12 rounded-full" style={{ background: "#C8102E" }} />
              <p className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.45em]"
                style={{ color: "#C8102E" }}>
                Trò Chơi Giáo Dục
              </p>
              <div className="h-0.5 w-12 rounded-full" style={{ background: "#C8102E" }} />
            </div>
            <h2 className="font-cinzel text-3xl font-bold sm:text-4xl" style={{ color: "#1a0506" }}>
              Cùng Nhau Học Lịch Sử
            </h2>
            <p className="mt-3 mx-auto max-w-xl font-playfair italic text-base leading-relaxed"
              style={{ color: "rgba(26,5,6,0.72)" }}>
              Thi đua trả lời câu hỏi lịch sử cùng cả lớp — theo thời gian thực, điểm số cập nhật tức thì.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Hành Trình Ánh Sáng — main card ── */}
        <ScrollReveal delay={0.1}>
          <div
            className="relative overflow-hidden rounded-3xl p-10 text-center sm:p-16"
            style={{
              background: "linear-gradient(135deg, #060910 0%, #0e1a28 60%, #1a0506 100%)",
              border: "1px solid rgba(196,138,40,0.30)",
              boxShadow: "0 32px 100px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Grain */}
            <div aria-hidden className="pointer-events-none absolute inset-0 vv-grain opacity-50" />
            {/* Glow bottom */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 55% at 50% 110%, rgba(200,16,46,0.22) 0%, transparent 70%)",
              }}
            />
            {/* Glow top */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 50% 40% at 50% -10%, rgba(196,138,40,0.12) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                style={{
                  borderColor: "rgba(196,138,40,0.35)",
                  background: "rgba(196,138,40,0.08)",
                }}>
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs font-semibold uppercase tracking-[0.5em]"
                  style={{ color: "rgba(196,138,40,0.85)" }}>
                  Realtime Multiplayer
                </p>
              </div>

              {/* Title */}
              <h3
                className="font-cinzel text-3xl font-bold sm:text-4xl md:text-5xl"
                style={{
                  background: "linear-gradient(135deg, #c48a28 0%, #e8d2a8 50%, #c48a28 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Hành Trình Ánh Sáng
              </h3>

              {/* Description */}
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed"
                style={{ color: "rgba(232,210,168,0.65)" }}>
                Cùng lớp học thi đua trả lời câu hỏi lịch sử theo thời gian thực.
                7 chặng dừng lịch sử, điểm số cập nhật tức thì.
              </p>

              {/* Stats */}
              <div className="mx-auto mt-10 grid max-w-xs grid-cols-2 gap-8">
                {[
                  { value: "7",  label: "chặng dừng" },
                  { value: "17", label: "câu hỏi" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-cinzel text-2xl font-bold"
                      style={{
                        background: "linear-gradient(135deg, #c48a28, #e8d2a8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}>
                      {value}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-widest"
                      style={{ color: "rgba(232,210,168,0.45)" }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="/game"
                className="btn-patriot mt-10 inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-sm font-bold transition-all"
              >
                <span>🚢</span>
                Bắt đầu hành trình cùng nhau
              </a>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
