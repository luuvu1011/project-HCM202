"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { GestureEffects } from "@/components/gestures/GestureEffects";
import { signalImmersiveEnter, signalImmersiveLeave } from "@/lib/immersiveMode";

// ─── WatershedMoment ──────────────────────────────────────────────────────────
// The ideological pivot: the 1917 moment + Lenin's Theses on Colonial Question.
// GSAP-pinned so it holds as a cinematic freeze-frame during the watershed chapter.

export function WatershedMoment() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const tlRef    = useRef<gsap.core.Timeline | null>(null);
  const reduced  = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const items   = inner.querySelectorAll("[data-ws-item]");
    const divider = inner.querySelector("[data-ws-divider]");

    if (!reduced) {
      gsap.set(items,   { opacity: 0, y: 28 });
      if (divider) gsap.set(divider, { scaleX: 0, transformOrigin: "center" });
    }

    const pin = ScrollTrigger.create({
      trigger: outer,
      start: "top top",
      end: "bottom top",
      pin: inner,
      pinSpacing: false,
      anticipatePin: 1,
      onEnter:     () => signalImmersiveEnter("watershed"),
      onLeave:     () => signalImmersiveLeave("watershed"),
      onLeaveBack: () => signalImmersiveLeave("watershed"),
      onEnterBack: () => signalImmersiveEnter("watershed"),
    });

    const enterTrigger = ScrollTrigger.create({
      trigger: outer,
      start: "top 82%",
      onEnter: () => {
        if (reduced) return;
        tlRef.current?.kill();
        const tl = gsap.timeline();
        tlRef.current = tl;

        tl.to(items, {
            opacity: 1, y: 0,
            duration: 1.0, stagger: 0.16, ease: "power3.out",
          }, 0)
          .to(divider, {
            scaleX: 1, duration: 0.8, ease: "power2.inOut",
          }, 0.22);
      },
      onLeaveBack: () => {
        if (reduced) return;
        tlRef.current?.kill();
        gsap.set(items,   { opacity: 0, y: 28 });
        if (divider) gsap.set(divider, { scaleX: 0 });
      },
    });

    return () => {
      pin.kill();
      enterTrigger.kill();
      tlRef.current?.kill();
    };
  }, [reduced]);

  return (
    <>
      {/* ── Outer trigger div — height controls pin duration ────────────── */}
      <div
        ref={outerRef}
        id="1917"
        className="relative scroll-mt-24"
        style={{ minHeight: "160vh" }}
      >
        {/* ── Pinned inner content ─────────────────────────────────────── */}
        <div
          ref={innerRef}
          className="relative z-[9] flex h-screen w-full flex-col items-center justify-center px-5 sm:px-8"
        >
          {/* Soft dark reading veil (no hard box) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 75% at 50% 50%, rgba(2,2,8,0.70), transparent 72%)",
            }}
          />

          {/* Crimson side pulse — echoes watershed atmosphere */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(140,24,24,0.08), transparent 65%)",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-2xl text-center">

            {/* ── Era label ── */}
            <p
              data-ws-item
              className="text-[10px] font-semibold uppercase tracking-[0.52em] text-red-accent/70"
            >
              Bước ngoặt lý luận
            </p>

            {/* ── Year — the visual anchor ── */}
            <p
              data-ws-item
              className="mt-4 font-display text-[clamp(4rem,10vw,7.5rem)] font-semibold leading-none tracking-tight text-parchment"
              style={{ textShadow: "0 0 80px rgba(194,59,59,0.25)" }}
            >
              1917
            </p>

            {/* ── Event subtitle ── */}
            <p
              data-ws-item
              className="mt-3 text-[11px] font-medium uppercase tracking-[0.40em] text-parchment-muted/80"
            >
              Cách mạng Tháng Mười Nga · Luận cương 1920
            </p>

            {/* ── Divider ── */}
            <div
              data-ws-divider
              className="vv-divider mx-auto mt-8"
            />

            {/* ── Main narration ── */}
            <p
              data-ws-item
              className="mx-auto mt-7 max-w-xl font-display text-[clamp(1rem,2.1vw,1.2rem)] italic leading-[1.70] text-parchment/90"
            >
              Lần đầu đọc "Luận cương về vấn đề dân tộc và thuộc địa" của V.I. Lenin,
              Nguyễn Ái Quốc khóc — không phải xúc động thuần túy, mà vì lần đầu
              thấy rõ: độc lập dân tộc gắn với tiến bộ xã hội không còn là ước
              mơ mà là phương pháp tổ chức cụ thể.
            </p>

            {/* ── Ideological conclusion ── */}
            <p
              data-ws-item
              className="mx-auto mt-5 max-w-lg text-[clamp(0.85rem,1.7vw,0.98rem)] leading-relaxed text-gold-soft/85"
            >
              Chủ nghĩa Mác — Lênin không chỉ là lý thuyết — đó là phương pháp
              biến khát vọng thành tổ chức, và tổ chức thành lịch sử.
            </p>

            {/* ── Gesture invitation — integrated into narrative ── */}
            <div
              data-ws-item
              className="mt-10 flex flex-col items-center gap-1.5"
            >
              <div className="vv-jade-line mx-auto" />
              <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.38em] text-parchment-muted/40">
                Chạm vào khoảnh khắc lịch sử
              </p>
              <p className="text-[10px] text-parchment-muted/30">
                Phím{" "}
                <kbd className="rounded bg-white/8 px-1 text-parchment-muted/50">1</kbd>
                {" "}–{" "}
                <kbd className="rounded bg-white/8 px-1 text-parchment-muted/50">4</kbd>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Gesture effects overlay — fixed, global, z-[35] */}
      <GestureEffects />
    </>
  );
}
