"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";

const GlobeMap = dynamic(() => import("./GlobeMap").then(m => ({ default: m.GlobeMap })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ aspectRatio: "1/1", maxWidth: 520, margin: "0 auto" }}>
      <div className="text-center">
        <motion.div
          className="mx-auto mb-4 rounded-full border-2"
          style={{ width: 64, height: 64, borderColor: "#C8102E", borderTopColor: "transparent" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgba(200,16,46,0.6)" }}>
          Đang tải địa cầu…
        </p>
      </div>
    </div>
  ),
});

const PORTS = [
  { name: "Bến Nhà Rồng", location: "Sài Gòn · 1911" },
  { name: "Marseille",     location: "Pháp · 1911" },
  { name: "New York",      location: "Hoa Kỳ · 1912" },
  { name: "London",        location: "Anh · 1913" },
  { name: "Paris",         location: "Pháp · 1917–1923" },
  { name: "Liên Xô",       location: "Moskva · 1923–1924" },
  { name: "Quảng Châu",    location: "Trung Quốc · 1924–1927" },
];

export function GlobeSection() {
  const [activeIdx, setActiveIdx] = useState(PORTS.length - 1);

  return (
    <section id="globe-section" className="relative py-20 sm:py-28 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #060910, #0e1a28)" }}>

      {/* Stars background */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(30,60,100,0.25), transparent 65%)" }} />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mx-auto mb-4 h-px w-20"
            style={{ background: "linear-gradient(to right, transparent, rgba(200,16,46,0.6), transparent)" }} />
          <p className="font-cinzel text-[11px] uppercase tracking-[0.55em] mb-3"
            style={{ color: "rgba(200,16,46,0.8)" }}>
            Địa Cầu Lịch Sử
          </p>
          <h2 className="font-cinzel font-bold text-white"
            style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>
            Hành Trình <span style={{ color: "#FFD700" }}>5 Châu</span>
          </h2>
          <p className="mt-3 font-playfair italic text-sm text-white/55">
            Địa cầu 3D tương tác — xoay và khám phá từng chặng hải trình lịch sử.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlobeMap activePortIdx={activeIdx} />
          </motion.div>

          {/* Port selector */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-cinzel text-xs uppercase tracking-[0.45em] mb-6"
              style={{ color: "rgba(200,16,46,0.65)" }}>
              Chọn chặng để hiển thị trên địa cầu
            </p>
            {PORTS.map((port, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="w-full rounded-xl px-5 py-3.5 text-left transition-all duration-300"
                style={{
                  background:   i === activeIdx ? "rgba(200,16,46,0.12)" : "rgba(255,255,255,0.03)",
                  border:       `1px solid ${i === activeIdx ? "rgba(200,16,46,0.5)" : "rgba(255,255,255,0.07)"}`,
                  boxShadow:    i === activeIdx ? "0 0 24px rgba(200,16,46,0.12)" : "none",
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center rounded-full font-cinzel font-black text-xs"
                    style={{
                      width: 32, height: 32,
                      background: i === activeIdx ? "#C8102E" : "rgba(200,16,46,0.12)",
                      color: i === activeIdx ? "#FFD700" : "rgba(200,16,46,0.5)",
                    }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="font-cinzel text-sm font-bold"
                      style={{ color: i === activeIdx ? "#FFFFFF" : "rgba(255,255,255,0.55)" }}>
                      {port.name}
                    </p>
                    <p className="font-cinzel text-[10px] mt-0.5"
                      style={{ color: i === activeIdx ? "rgba(200,16,46,0.8)" : "rgba(255,255,255,0.28)" }}>
                      {port.location}
                    </p>
                  </div>
                  {i === activeIdx && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ background: "#C8102E" }} />
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
