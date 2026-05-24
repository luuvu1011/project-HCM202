"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const NAV_LINKS = [
  { label: "Trang Chủ",    href: "#trang-chu"    },
  { label: "Lịch Sử",     href: "#lich-su"       },
  { label: "Hành Trình",  href: "#hanh-trinh"    },
  { label: "Phim Tư Liệu", href: "#phim-tu-lieu" },
  { label: "Địa Cầu 3D",  href: "#globe-section" },
  { label: "Thời Gian",   href: "#timeline"       },
  { label: "Ý Nghĩa",     href: "#y-nghia"       },
  { label: "Trò Chơi",    href: "#tro-choi"      },
  { label: "Kết Thúc",    href: "#ket-thuc-cuoi" },
];

const REFERENCES = [
  "Ban Tuyên giáo TW — Hồ Chí Minh: Tiểu sử (NXB Chính trị Quốc gia, 2019)",
  "Bộ GD&ĐT — Giáo trình Tư tưởng Hồ Chí Minh (NXB CTQG, 2021)",
  "Nguyễn Đình Lộc — Hồ Chí Minh: Hành trình tìm đường cứu nước (NXB Sự thật, 1992)",
  "Duiker, W.J. — Ho Chi Minh: A Life (Hyperion, 2000)",
  "Hồ Chí Minh — Toàn tập (NXB CTQG, 2011, 15 tập)",
];

// ─── Glowing Vietnam flag ─────────────────────────────────────────────────────
function GlowingFlag() {
  const reduced = useReducedMotion();
  return (
    <div className="relative inline-block" aria-label="Cờ Tổ quốc Việt Nam">
      {/* Glow halo */}
      {!reduced && (
        <motion.div className="absolute inset-0 rounded-sm"
          animate={{ boxShadow: [
            "0 0 20px rgba(200,16,46,0.4), 0 0 40px rgba(200,16,46,0.15)",
            "0 0 35px rgba(200,16,46,0.65), 0 0 70px rgba(200,16,46,0.25)",
            "0 0 20px rgba(200,16,46,0.4), 0 0 40px rgba(200,16,46,0.15)",
          ]}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <svg viewBox="0 0 120 80" width="120" height="80" role="img">
        <defs>
          <radialGradient id="flag-footer" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor="#d81428" />
            <stop offset="100%" stopColor="#9a0c20" />
          </radialGradient>
        </defs>
        <rect width="120" height="80" fill="url(#flag-footer)" rx="3" />
        <polygon
          points="60,12 64.9,27 80.8,27 68.1,36 72.6,51 60,42 47.4,51 51.9,36 39.2,27 55.1,27"
          fill="#FFD700"
        />
        {/* Subtle waving sheen */}
        {!reduced && (
          <motion.rect x="0" y="0" width="60" height="80" rx="3" fill="rgba(255,255,255,0.05)"
            animate={{ x: [-60, 120] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
          />
        )}
      </svg>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  const handleNav = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #1a0506, #0d0204)", color: "#FFFFFF" }}
    >
      {/* Top accent line */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: "#C8102E" }} />

      {/* Ambient crimson */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(200,16,46,0.06), transparent 55%)" }} />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">

        {/* ── Top: flag + quote + nav ── */}
        <div className="border-b py-12 sm:py-16"
          style={{ borderColor: "rgba(245,230,200,0.06)" }}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

            {/* Brand */}
            <div className="flex flex-col gap-5">
              <GlowingFlag />
              <h3 className="font-cinzel text-lg font-bold" style={{ color: "#F5E6C8" }}>
                Historical Voyage
              </h3>
              <p className="font-playfair italic text-sm leading-relaxed"
                style={{ color: "rgba(245,230,200,0.80)" }}>
                "Không có gì quý hơn độc lập tự do."
              </p>
              <p className="text-xs" style={{ color: "rgba(255,215,0,0.55)" }}>— Hồ Chí Minh</p>
            </div>

            {/* Navigation */}
            <div>
              <p className="mb-5 font-cinzel text-xs uppercase tracking-[0.45em]"
                style={{ color: "rgba(255,215,0,0.7)" }}>
                Điều Hướng
              </p>
              <nav className="grid grid-cols-2 gap-x-4 gap-y-3">
                {NAV_LINKS.map((link) => (
                  <button key={link.href} type="button"
                    onClick={() => handleNav(link.href)}
                    className="text-left text-sm transition-colors hover:text-yellow-300"
                    style={{ color: "rgba(245,230,200,0.70)" }}>
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Team */}
            <div>
              <p className="mb-5 font-cinzel text-xs uppercase tracking-[0.45em]"
                style={{ color: "rgba(255,215,0,0.7)" }}>
                Nhóm Thực Hiện
              </p>
              <div className="text-sm" style={{ color: "rgba(245,230,200,0.70)" }}>
                <div className="space-y-2">
                  <p>Lưu Trần Quốc Vũ</p>
                  <p>Nguyễn Đình Lực</p>
                  <p>Hoàng Văn Huy</p>
                  <p>Đặng Thị Thanh Ngân</p>
                  <p>Nguyễn Kiên Cường</p>
                  <div className="pt-2">
                    <p>Dự án học phần HCM202</p>
                    <p>Đại học FPT TP. Hồ Chí Minh</p>
                  </div>
                </div>
                <p className="mt-3 text-xs" style={{ color: "rgba(245,230,200,0.32)" }}>
                  Giao diện minh họa — luôn đối chiếu tài liệu sử học chính thống.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── References ── */}
        <div className="border-b py-10" style={{ borderColor: "rgba(245,230,200,0.06)" }}>
          <p className="mb-5 font-cinzel text-xs uppercase tracking-[0.45em]"
            style={{ color: "rgba(255,215,0,0.7)" }}>
            Tài Liệu Tham Khảo
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REFERENCES.map((ref, i) => (
              <div key={i} className="flex items-start gap-3 text-xs leading-relaxed"
                style={{ color: "rgba(245,230,200,0.62)" }}>
                <span className="font-mono shrink-0 mt-0.5" style={{ color: "rgba(255,215,0,0.4)" }}>
                  [{i + 1}]
                </span>
                <span>{ref}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="font-cinzel text-xs uppercase tracking-[0.4em]"
            style={{ color: "rgba(245,230,200,0.28)" }}>
            Historical Voyage · Giáo dục lịch sử tương tác 
          </p>
          <div aria-hidden className="h-px w-32 shimmer-gold-line" />
          <p className="font-playfair italic text-xs" style={{ color: "rgba(245,230,200,0.20)" }}>
            "Dân ta phải biết sử ta" — Hồ Chí Minh
          </p>
        </div>

      </div>
    </footer>
  );
}
