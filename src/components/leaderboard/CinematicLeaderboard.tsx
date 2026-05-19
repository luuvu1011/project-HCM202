'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerState } from '@/types/game';
import { cinematicEase } from '@/animations/transitions';

interface Props {
  players: PlayerState[];
  myPlayerId: string;
  compact?: boolean;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export function CinematicLeaderboard({ players, myPlayerId, compact = false }: Props) {
  const top    = compact ? players.slice(0, 5) : players;
  const myRank = players.findIndex((p) => p.playerId === myPlayerId) + 1;

  if (compact) {
    return (
      <div
        className="w-56 overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(6,9,16,0.85)',
          border: '1px solid rgba(196,138,40,0.18)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="border-b border-parchment/5 px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold/50">Bảng xếp hạng</p>
        </div>
        <div className="divide-y divide-parchment/5">
          {top.map((player, i) => (
            <CompactRow
              key={player.playerId}
              player={player}
              rank={i + 1}
              isMe={player.playerId === myPlayerId}
            />
          ))}
        </div>
        {myRank > 5 && (
          <div className="border-t border-parchment/5 px-4 py-2 text-xs text-parchment/40">
            Bạn: Hạng {myRank}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        background: 'rgba(14,26,40,0.8)',
        border: '1px solid rgba(196,138,40,0.22)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}
    >
      <div className="border-b border-parchment/5 px-6 py-5">
        <h2 className="font-cinzel text-lg font-bold text-parchment">
          Bảng Xếp Hạng Cuối
        </h2>
        <p className="mt-0.5 text-xs text-parchment/40">{players.length} người tham gia</p>
      </div>

      <div className="divide-y divide-parchment/5">
        <AnimatePresence initial={false}>
          {top.map((player, i) => (
            <FullRow
              key={player.playerId}
              player={player}
              rank={i + 1}
              isMe={player.playerId === myPlayerId}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CompactRow({ player, rank, isMe }: { player: PlayerState; rank: number; isMe: boolean }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5"
      style={{ background: isMe ? 'rgba(196,138,40,0.08)' : 'transparent' }}
    >
      <span className="w-4 text-center text-xs text-parchment/50">
        {rank <= 3 ? MEDAL[rank - 1] : rank}
      </span>
      <div
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{
          background: `hsl(${player.glowLevel * 1.2}, 70%, 55%)`,
          boxShadow: `0 0 ${player.glowLevel / 10}px hsl(${player.glowLevel * 1.2}, 70%, 55%)`,
        }}
      />
      <span className="flex-1 truncate text-xs text-parchment/80">{player.nickname}</span>
      <span className="text-xs font-bold text-gold">{player.score.toLocaleString()}</span>
    </div>
  );
}

function FullRow({ player, rank, isMe, index }: { player: PlayerState; rank: number; isMe: boolean; index: number }) {
  const isTop3 = rank <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: cinematicEase, delay: index * 0.06 }}
      className="flex items-center gap-4 px-6 py-4"
      style={{
        background: isMe
          ? 'rgba(196,138,40,0.10)'
          : isTop3
          ? 'rgba(255,255,255,0.02)'
          : 'transparent',
        borderLeft: isMe ? '2px solid rgba(196,138,40,0.5)' : '2px solid transparent',
      }}
    >
      {/* Rank */}
      <div className="w-8 flex-shrink-0 text-center">
        {isTop3 ? (
          <span className="text-xl">{MEDAL[rank - 1]}</span>
        ) : (
          <span className="text-sm font-bold text-parchment/40">#{rank}</span>
        )}
      </div>

      {/* Glow orb */}
      <div
        className="h-4 w-4 flex-shrink-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 35%, hsl(${player.glowLevel * 1.2}, 80%, 65%) 0%, hsl(${player.glowLevel * 1.2}, 60%, 35%) 100%)`,
          boxShadow: `0 0 ${6 + player.glowLevel / 8}px hsl(${player.glowLevel * 1.2}, 70%, 50%)`,
        }}
      />

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-2 truncate text-sm font-semibold text-parchment">
          {player.nickname}
          {isMe && <span className="text-xs text-gold/60">(bạn)</span>}
          {player.isHost && <span className="text-xs text-parchment/30">⚓</span>}
        </p>
        <p className="mt-0.5 text-xs text-parchment/40">
          {player.totalCorrect}/{player.totalAnswered} câu đúng
          {player.streak > 1 && <span className="ml-2 text-amber">🔥 ×{player.streak}</span>}
        </p>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p
          className="font-cinzel text-lg font-bold"
          style={{
            color: isTop3 ? 'var(--gold)' : 'var(--parchment)',
            textShadow: isTop3 ? '0 0 12px rgba(196,138,40,0.4)' : 'none',
          }}
        >
          {player.score.toLocaleString()}
        </p>
        <p className="text-xs text-parchment/30">điểm</p>
      </div>

      {/* Top 1 glow */}
      {rank === 1 && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(196,138,40,0.04), transparent)',
          }}
        />
      )}
    </motion.div>
  );
}
