import type { ReactNode } from 'react';

// Tách hoàn toàn khỏi main site layout — dark cinematic environment
export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--ocean-deep)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-body)',
        overflowX: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
