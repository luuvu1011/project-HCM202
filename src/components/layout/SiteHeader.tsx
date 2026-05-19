"use client";

import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Trang Chủ",  href: "#trang-chu"    },
  { label: "Lịch Sử",   href: "#lich-su"       },
  { label: "Hành Trình", href: "#hanh-trinh"   },
  { label: "Cột Mốc", href: "#phim-tu-lieu" },
  { label: "Địa Cầu",   href: "#globe-section" },
  { label: "Ý Nghĩa",   href: "#y-nghia"       },
  { label: "Khoảnh Khắc Tự Hào", href: "#tuong-tac" },
  { label: "Trò Chơi",  href: "#tro-choi"      },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setScrolled(v > 0.015));
    return unsub;
  }, [scrollYProgress]);

  const go = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background:     scrolled ? "rgba(255,255,255,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          boxShadow:      scrolled ? "0 2px 24px rgba(200,16,46,0.08), 0 1px 0 rgba(200,16,46,0.12)" : "none",
        }}>

        {/* Thanh tiến trình đỏ */}
        <motion.div className="absolute inset-x-0 bottom-0 h-[2px] origin-left"
          style={{ background: "#C8102E", scaleX: scrollYProgress }} />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">

          {/* Logo */}
          <button type="button" onClick={() => go("#trang-chu")}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-75">
            <svg viewBox="0 0 32 22" width="32" height="22" aria-hidden>
              <rect width="32" height="22" fill="#C8102E" rx="2" />
              <polygon points="16,3.5 17.8,9.2 23.5,9.2 19,12.4 20.7,18 16,14.8 11.3,18 13,12.4 8.5,9.2 14.2,9.2"
                fill="#FFD700" />
            </svg>
            <span className="font-cinzel text-sm font-bold hidden sm:block"
              style={{ color: scrolled ? "#1a0506" : "rgba(255,255,255,0.92)" }}>
              Hành Trình Lịch Sử
            </span>
          </button>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => (
              <button key={link.href} type="button" onClick={() => go(link.href)}
                className="group rounded-full px-4 py-2 font-cinzel text-[10.5px] font-semibold uppercase tracking-[0.32em] transition-all duration-200 hover:bg-red-50"
                style={{ color: scrolled ? "#4a1820" : "rgba(255,255,255,0.82)" }}>
                <span className="group-hover:text-red-700 transition-colors">{link.label}</span>
              </button>
            ))}
            <button type="button" onClick={() => go("#hanh-trinh")}
              className="ml-2 rounded-full px-6 py-2 font-cinzel text-[10.5px] font-bold uppercase tracking-[0.32em] transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "#C8102E", color: "#FFFFFF", boxShadow: "0 3px 14px rgba(200,16,46,0.38)" }}>
              ⚓ Khởi Hành
            </button>
          </nav>

          {/* Hamburger mobile */}
          <button type="button" onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col items-center justify-center gap-1.5 p-2 md:hidden"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="block h-0.5 w-6 rounded-full transition-all duration-300"
                style={{
                  background: scrolled ? "#1a0506" : "#FFFFFF",
                  transform: menuOpen
                    ? i === 0 ? "rotate(45deg) translate(3px, 4px)"
                    : i === 1 ? "scaleX(0)"
                    : "rotate(-45deg) translate(3px, -4px)"
                    : "none",
                }} />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile menu fullscreen */}
      {menuOpen && (
        <motion.div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-7"
          style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)" }}
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
          {NAV_LINKS.map((link, i) => (
            <motion.button key={link.href} type="button" onClick={() => go(link.href)}
              className="font-cinzel text-2xl font-bold uppercase tracking-[0.2em]"
              style={{ color: "#1a0506" }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ color: "#C8102E", x: 6 }}>
              {link.label}
            </motion.button>
          ))}
          <motion.button type="button" onClick={() => go("#hanh-trinh")}
            className="mt-3 rounded-full px-12 py-4 font-cinzel text-base font-bold uppercase tracking-widest"
            style={{ background: "#C8102E", color: "#FFFFFF", boxShadow: "0 4px 20px rgba(200,16,46,0.4)" }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.33 }}>
            ⚓ Khởi Hành
          </motion.button>
        </motion.div>
      )}
    </>
  );
}
