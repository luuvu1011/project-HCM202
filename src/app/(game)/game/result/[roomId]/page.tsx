'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { CinematicLeaderboard } from '@/components/leaderboard/CinematicLeaderboard';
import { cinematicEase } from '@/animations/transitions';
import type { PlayerState } from '@/types/game';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = typeof params.roomId === 'string' ? params.roomId : '';

  const { roomState, players, playerId } = useGameStore((s) => s);
  const [revealed, setRevealed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const particleRef = useRef<NodeJS.Timeout | null>(null);

  useRealtimeRoom(roomId);

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 800);
    const t2 = setTimeout(() => setShowParticles(true), 2_000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const sorted       = [...players].sort((a, b) => b.score - a.score);
  const winner       = sorted[0];
  const myPlayer     = players.find((p) => p.playerId === playerId);
  const myRank       = sorted.findIndex((p) => p.playerId === playerId) + 1;
  const isWinner     = myPlayer?.playerId === winner?.playerId;

  return (
    <div className="relative min-h-dvh overflow-hidden" style={{ background: '#060910' }}>
      {/* Grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 vv-grain opacity-50" />

      {/* Celebration glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showParticles ? 1 : 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 60%, rgba(200,16,46,0.20) 0%, rgba(196,138,40,0.10) 40%, transparent 70%)',
        }}
      />

      {/* Animated particles */}
      {showParticles && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              initial={{ opacity: 0, y: '110%', x: `${(i * 3.3) % 100}%` }}
              animate={{
                opacity: [0, 0.8, 0],
                y: [null, '-20%'],
                x: [`${(i * 3.3) % 100}%`, `${((i * 3.3) + (i % 5 === 0 ? 5 : -5)) % 100}%`],
              }}
              transition={{ duration: 2.5 + (i % 4) * 0.5, delay: (i % 10) * 0.1, ease: 'easeOut' }}
              style={{
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 3) * 3}px`,
                background: i % 3 === 0 ? '#C8102E' : i % 3 === 1 ? '#FFD700' : '#c48a28',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: cinematicEase }}
          className="mb-10 text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.5em] text-gold/60">
            Hành Trình Kết Thúc
          </p>
          <h1
            className="font-cinzel text-4xl font-bold sm:text-5xl"
            style={{
              background: 'linear-gradient(135deg, #C8102E 0%, #FFD700 50%, #C8102E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Ánh Sáng Hội Tụ
          </h1>
          <p className="mt-3 text-sm text-parchment/50">
            Toàn bộ hành trình 30 năm đã hoàn thành — cùng nhau chúng ta thắp sáng con đường lịch sử.
          </p>
        </motion.div>

        {/* Winner card */}
        {winner && revealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: cinematicEase }}
            className="mb-8 overflow-hidden rounded-3xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(196,138,40,0.20), rgba(200,16,46,0.12))',
              border: '1px solid rgba(196,138,40,0.35)',
              boxShadow: '0 0 60px rgba(196,138,40,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="px-8 py-8">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.4em] text-gold/60">
                Nhà Vô Địch Ánh Sáng
              </div>
              <div
                className="mt-3 font-cinzel text-5xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--parchment) 60%, var(--gold-soft) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {winner.nickname}
              </div>
              <div className="mt-2 text-2xl font-bold text-gold">
                {winner.score.toLocaleString()} điểm
              </div>
              <div className="mt-2 text-xs text-parchment/40">
                {winner.totalCorrect}/{winner.totalAnswered} câu đúng · Streak cao nhất: {winner.streak}
              </div>
            </div>
          </motion.div>
        )}

        {/* My result */}
        {myPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: cinematicEase }}
            className="mb-8 rounded-2xl px-6 py-4"
            style={{
              background: 'rgba(196,138,40,0.06)',
              border: '1px solid rgba(196,138,40,0.18)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-parchment/50">Kết quả của bạn</p>
                <p className="text-lg font-semibold text-parchment">{myPlayer.nickname}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gold">{myPlayer.score.toLocaleString()}</div>
                <div className="text-xs text-parchment/40">Hạng {myRank}/{sorted.length}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full leaderboard */}
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: cinematicEase }}
          >
            <CinematicLeaderboard players={sorted} myPlayerId={playerId ?? ''} />
          </motion.div>
        )}

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="mt-12 border-l-2 border-gold/40 pl-5 text-sm leading-relaxed italic text-parchment/50"
        >
          "Không có gì quý hơn độc lập, tự do."
          <cite className="mt-1 block not-italic text-xs text-gold/50">— Hồ Chí Minh</cite>
        </motion.blockquote>

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/game"
            className="rounded-2xl px-8 py-3 text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--crimson), var(--red-accent))',
              color: 'var(--parchment)',
            }}
          >
            Chơi lại
          </a>
          <a
            href="/"
            className="rounded-2xl border px-8 py-3 text-sm font-semibold transition-all hover:scale-105"
            style={{ borderColor: 'rgba(196,138,40,0.3)', color: 'var(--parchment)' }}
          >
            Về trang chính
          </a>
        </div>
      </div>
    </div>
  );
}
