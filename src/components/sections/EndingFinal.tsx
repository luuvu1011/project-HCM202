"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function CountUp({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView || reduced) { setDisplay(`${to}`); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(String(Math.round(ease * to)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration, reduced]);

  return <span ref={ref}>{display}{suffix}</span>;
}

function FlagSVG({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 240 160" width="240" height="160" role="img" aria-label="Cờ Tổ quốc Việt Nam">
      <defs>
        <radialGradient id="flag-ef" cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="#e01530" />
          <stop offset="100%" stopColor="#C8102E" />
        </radialGradient>
        <filter id="flag-ef-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="240" height="160" fill="url(#flag-ef)" rx="6" filter="url(#flag-ef-glow)" />
      <polygon
        points="120,24 130,56 164,56 136,72 146,104 120,88 94,104 104,72 76,56 110,56"
        fill="#FFD700" filter="url(#flag-ef-glow)" />
      {!reduced && (
        <motion.rect x="0" y="0" width="100" height="160" rx="6" fill="rgba(255,255,255,0.08)"
          animate={{ x: [-100, 240] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }} />
      )}
    </svg>
  );
}

export function EndingFinal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const flagRef    = useRef<HTMLDivElement | null>(null);
  const reduced    = useReducedMotion();

  useEffect(() => {
    if (reduced || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current!.querySelectorAll("[data-reveal]"), {
        opacity: 0, y: 40, stagger: 0.12, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
      if (flagRef.current) {
        gsap.to(flagRef.current, {
          filter: "drop-shadow(0 0 40px rgba(200,16,46,0.65)) drop-shadow(0 0 80px rgba(200,16,46,0.25))",
          duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.5,
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} id="ket-thuc-cuoi"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-24 text-center"
      style={{ background: "linear-gradient(150deg, #9a0c22 0%, #C8102E 50%, #9a0c22 100%)" }}>

      {/* Tia sáng trắng */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[38%] top-0"
        style={{ height: "55%", background: "linear-gradient(to bottom, rgba(255,255,255,0.10), transparent)" }} />

      {/* Hạt trắng */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.07), transparent 65%)" }} />

      <div aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />

      <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8">

        {/* Cờ */}
        <div ref={flagRef} data-reveal className="mb-10 flex justify-center"
          style={{ filter: "drop-shadow(0 0 24px rgba(200,16,46,0.4))" }}>
          <FlagSVG reduced={reduced} />
        </div>

        <p data-reveal className="mb-4 font-cinzel text-[11px] uppercase tracking-[0.55em] text-white/70">
          Hành trình hoàn thành
        </p>

        <blockquote data-reveal className="font-cinzel font-bold leading-[1.06] text-white"
          style={{ fontSize: "clamp(2rem,5.5vw,4rem)" }}>
          "Không có gì quý hơn
          <br /><span style={{ color: "#FFD700" }}>độc lập tự do"</span>
        </blockquote>

        <cite data-reveal className="mt-5 block font-playfair italic text-base not-italic text-white/75">
          — Hồ Chí Minh
        </cite>

        <div data-reveal aria-hidden className="mx-auto my-10 h-px w-20"
          style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)" }} />

        <p data-reveal className="mx-auto max-w-xl font-playfair italic text-sm leading-[1.9] text-white/75">
          Qua gần 30 năm bôn ba khắp năm châu, Nguyễn Tất Thành đã tìm ra con đường cứu nước đúng đắn cho dân tộc Việt Nam — con đường độc lập dân tộc gắn liền với chủ nghĩa xã hội. Hành trình đó đã thay đổi lịch sử.
        </p>

        {/* Số liệu với animated counters */}
        <div data-reveal className="mt-12 grid grid-cols-3 gap-4">
          <div className="card-on-red rounded-xl py-5 px-3">
            <p className="font-cinzel text-2xl font-bold sm:text-3xl" style={{ color: "#FFD700" }}>
              ~<CountUp to={30} duration={2.2} />
            </p>
            <p className="mt-1 font-cinzel text-[10px] uppercase tracking-wide text-white/70">Năm bôn ba</p>
          </div>
          <div className="card-on-red rounded-xl py-5 px-3">
            <p className="font-cinzel text-2xl font-bold sm:text-3xl" style={{ color: "#FFD700" }}>
              <CountUp to={5} duration={1.4} />
            </p>
            <p className="mt-1 font-cinzel text-[10px] uppercase tracking-wide text-white/70">Giai đoạn lớn</p>
          </div>
          <div className="card-on-red rounded-xl py-5 px-3">
            <p className="font-cinzel text-2xl font-bold sm:text-3xl" style={{ color: "#FFD700" }}>
              <CountUp to={1930} duration={2.8} />
            </p>
            <p className="mt-1 font-cinzel text-[10px] uppercase tracking-wide text-white/70">Đảng ra đời</p>
          </div>
        </div>

        <div data-reveal className="mt-14">
          <p className="font-cinzel text-[10px] uppercase tracking-[0.5em] text-white/30">
            Historical Voyage · Giáo dục lịch sử tương tác
          </p>
        </div>
      </div>

      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "rgba(255,255,255,0.3)" }} />
    </section>
  );
}
