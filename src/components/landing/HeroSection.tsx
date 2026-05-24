"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i, left: `${(i * 137.5 + 12) % 92}%`,
  delay: `${(i * 0.73) % 5}s`, duration: `${5 + (i % 4) * 1.5}s`, size: i % 4 === 0 ? 3 : 2,
}));


export function HeroSection() {
  const shipRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    if (!shipRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(shipRef.current, { y: -14, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (reduced || !textRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set("[data-h]", { opacity: 0, y: 44 });
      const tl = gsap.timeline({ delay: 0.3 });
      tl.to("[data-h-stamp]", { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" })
        .to("[data-h-l1]",    { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }, "-=0.3")
        .to("[data-h-l2]",    { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }, "-=0.65")
        .to("[data-h-l3]",    { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.65")
        .to("[data-h-sub]",   { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, "-=0.4")
        .to("[data-h-cta]",   { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.3")
        .add(() => setShowSub(true), "-=0.1");
    }, textRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="trang-chu"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(150deg, #9a0c22 0%, #C8102E 40%, #a50e28 100%)" }}>

      {/* Hạt trắng bay (thay vì màu tối) */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {PARTICLES.map((p) => (
            <div key={p.id} className="particle absolute rounded-full"
              style={{
                width: p.size, height: p.size, left: p.left, bottom: "8%",
                background: p.id % 3 === 0 ? "rgba(255,215,0,0.7)" : "rgba(255,255,255,0.45)",
                animationDuration: p.duration, animationDelay: p.delay,
              }} />
          ))}
        </div>
      )}

      {/* Tia sáng trắng */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="light-ray-sweep absolute inset-y-0 left-[28%] w-[28%]"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <div className="light-ray-sweep absolute inset-y-0 left-[60%] w-[18%]"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,215,0,0.06), transparent)", animationDelay: "2.8s" }} />
        </div>
      )}

      {/* Hào quang trung tâm */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 55%, rgba(255,255,255,0.08), transparent 60%)" }} />

      {/* Đường chân trời */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0"
        style={{ bottom: "28%", height: "80px", background: "radial-gradient(ellipse 90% 100% at 50% 50%, rgba(255,255,255,0.15), transparent)" }} />

      {/* Mặt biển */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: "32%", background: "linear-gradient(to bottom, rgba(139,10,25,0.8), #6e0814)" }} />

      {/* Sóng */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 overflow-hidden" style={{ bottom: "30%" }}>
        <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ height: 60 }}>
          <motion.path d="M0,30 C200,8 480,52 720,30 C960,8 1240,52 1440,30 L1440,60 L0,60 Z"
            fill="rgba(139,10,25,0.8)"
            animate={reduced ? undefined : { d: [
              "M0,30 C200,8 480,52 720,30 C960,8 1240,52 1440,30 L1440,60 L0,60 Z",
              "M0,38 C220,18 500,46 740,36 C980,22 1220,48 1440,38 L1440,60 L0,60 Z",
              "M0,30 C200,8 480,52 720,30 C960,8 1240,52 1440,30 L1440,60 L0,60 Z",
            ]}}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        </svg>
      </div>

      {/* Con tàu */}
      <div ref={shipRef} aria-hidden className="pointer-events-none absolute"
        style={{ bottom: "30%", left: "50%", transform: "translateX(-50%)" }}>
        <svg viewBox="0 0 200 120" width="200" height="120"
          style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 16px rgba(255,255,255,0.12))", opacity: 0.85 }}>
          <path d="M18,78 L182,78 L168,92 L32,92 Z" fill="#3a0a14" stroke="rgba(255,215,0,0.5)" strokeWidth="0.8" />
          <path d="M20,72 L180,68 L182,74 L20,78 Z" fill="rgba(255,215,0,0.5)" />
          <line x1="90" y1="78" x2="90" y2="14" stroke="rgba(200,160,80,0.85)" strokeWidth="2.2" />
          <circle cx="90" cy="14" r="2.4" fill="rgba(255,215,0,0.85)" />
          {/* Cờ đỏ sao vàng */}
          <rect x="89" y="14" width="20" height="13" fill="#C8102E" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <polygon points="99,17.5 100.5,22 105,22 101.5,24.5 102.8,29 99,26.5 95.2,29 96.5,24.5 93,22 97.5,22"
            fill="#FFD700" />
          <path d="M62,20 L118,18 L116,48 L64,50 Z" fill="rgba(255,255,255,0.30)" />
          <path d="M64,50 L116,48 L114,76 L66,78 Z" fill="rgba(255,255,255,0.25)" />
          <line x1="55" y1="78" x2="55" y2="35" stroke="rgba(180,130,60,0.75)" strokeWidth="1.8" />
          <path d="M36,42 L74,40 L72,76 L38,78 Z" fill="rgba(255,255,255,0.18)" />
          <line x1="140" y1="78" x2="140" y2="48" stroke="rgba(180,130,60,0.70)" strokeWidth="1.6" />
          <path d="M126,54 L154,52 L152,76 L128,78 Z" fill="rgba(255,255,255,0.15)" />
          <rect x="118" y="48" width="10" height="28" fill="#200508" />
          {[55,78,100].map((cx,i) => <circle key={i} cx={cx} cy={84} r="3" fill="none" stroke="rgba(255,215,0,0.38)" strokeWidth="0.8" />)}
          <line x1="20" y1="73" x2="-8" y2="60" stroke="rgba(180,130,60,0.65)" strokeWidth="1.5" />
          <line x1="18" y1="76" x2="90" y2="16" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        </svg>
        {!reduced && [0,1,2,3].map((i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: 5+i*5, height: 5+i*5, background: "rgba(255,255,255,0.18)", top: -10-i*8, left: "60%" }}
            animate={{ y: [-4, -32-i*14], opacity: [0.28, 0], scale: [1, 2+i*0.4] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: i*0.85, ease: "easeOut" }} />
        ))}
      </div>

      {/* Vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 115% 95% at 50% 50%, transparent 32%, rgba(90,5,15,0.65) 100%)" }} />

      {/* Ảnh chân dung */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[3] hidden translate-x-10 items-center pr-2 md:flex md:translate-x-12 lg:pr-6">
        <img
          src="/%E1%BA%A3nh_b%C3%A1c_h%E1%BB%93-removebg-preview.png"
          alt=""
          className="h-[70vh] w-auto max-w-[32vw] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
          style={{ filter: "brightness(1.08) contrast(1.05) saturate(1.05)" }}
          decoding="async"
        />
      </div>



      {/* Nội dung chính */}
      <div ref={textRef} className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p data-h data-h-stamp className="mb-5 font-cinzel text-[11px] uppercase tracking-[0.6em]"
          style={{ color: "rgba(255,215,0,0.85)" }}>
          Bến Nhà Rồng · 5 tháng 6 · 1911
        </p>
        <h1 className="font-cinzel font-bold leading-[1.06]"
          style={{ fontSize: "clamp(2.4rem,6.2vw,5rem)" }}>
          <span data-h data-h-l1 className="block text-white">Hành Trình Ra Đi</span>
          <span data-h data-h-l2 className="block whitespace-nowrap"
            style={{ color: "#FFD700", fontSize: "clamp(2.0rem,5.6vw,4.6rem)" }}>
            Tìm Đường Cứu Nước
          </span>
          <span data-h data-h-l3
            className="mt-4 flex flex-col items-center gap-1 font-playfair font-semibold leading-none"
            style={{ fontSize: "clamp(2.2rem,6.2vw,4.8rem)" }}>
            <span className="text-white/60 text-[0.5em] leading-none">của</span>
            <span className="text-[#FFD700] whitespace-nowrap leading-none">Nguyễn Tất Thành</span>
          </span>
        </h1>
        <p data-h data-h-sub className="mx-auto mt-7 max-w-xl font-playfair italic text-base leading-relaxed sm:text-lg text-white/70">
          Hành trình qua năm châu bốn biển — tìm ra chân lý soi sáng cả một dân tộc và mở ra thời đại mới cho Việt Nam.
        </p>
        <div data-h data-h-cta className="mt-10 flex flex-col items-center gap-4">
          <button type="button" onClick={() => document.getElementById("lich-su")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-white font-cinzel rounded-full px-12 py-4 text-base tracking-widest">
            Bắt Đầu Hành Trình
          </button>
          <AnimatePresence>
            {showSub && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="font-cinzel text-[10px] uppercase tracking-[0.5em] text-white/30">
                Cuộn xuống để khám phá lịch sử
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div aria-hidden className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40"
        animate={reduced ? undefined : { y: [0, 9, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
        <span className="font-cinzel text-[9px] uppercase tracking-[0.5em]">Cuộn</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
