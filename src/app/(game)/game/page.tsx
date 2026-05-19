import { JoinForm } from '@/components/multiplayer/JoinForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hành Trình Ánh Sáng — Multiplayer',
  description: 'Cùng nhau trải nghiệm hành trình tìm đường cứu nước của Nguyễn Tất Thành.',
};

export default function GameLandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      {/* ── Background layers ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(140,24,24,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 50% 0%, rgba(196,138,40,0.10) 0%, transparent 60%)',
        }}
      />

      {/* Grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 vv-grain opacity-60" />

      {/* ── Decorative top rule ── */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'var(--gold)', opacity: 0.3 }} />

      {/* ── Header ── */}
      <header className="relative z-10 mb-12 text-center">
        <p className="mb-3 font-cinzel text-xs font-semibold uppercase tracking-[0.5em] text-gold opacity-70">
          Trò Chơi Lịch Sử Tương Tác
        </p>
        <h1
          className="font-cinzel text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          style={{
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--parchment) 50%, var(--gold-soft) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Hành Trình Ánh Sáng
        </h1>
        <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-parchment/60">
          Cùng hàng chục người bạn — sống lại hành trình 30 năm tìm đường cứu nước<br />của Nguyễn Tất Thành qua 7 chặng dừng lịch sử.
        </p>
      </header>

      {/* ── Join Form ── */}
      <div className="relative z-10 w-full max-w-sm">
        <JoinForm />
      </div>

      {/* ── Back to main site ── */}
      <a
        href="/"
        className="relative z-10 mt-10 text-xs text-parchment/40 hover:text-parchment/70 transition-colors"
      >
        ← Quay về trang chính
      </a>

      {/* ── Ambient particles (CSS only, lightweight) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${(i * 8.3) % 100}%`,
              top: `${(i * 7.7 + 10) % 90}%`,
              background: i % 3 === 0 ? 'var(--gold)' : i % 3 === 1 ? 'var(--crimson)' : 'var(--parchment)',
              opacity: 0.12 + (i % 4) * 0.05,
              animation: `float-slow ${4 + (i % 5)}s ease-in-out ${(i * 0.7) % 3}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
