'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerState } from '@/types/game';
import { cinematicEase } from '@/animations/transitions';

interface Props {
  players: PlayerState[];
  myPlayerId: string;
}

export function PlayerList({ players, myPlayerId }: Props) {
  const online  = players.filter((p) => p.isOnline);
  const offline = players.filter((p) => !p.isOnline);

  return (
    <div
      className="rounded-3xl p-6"
      style={{
        background: 'rgba(14,26,40,0.7)',
        border: '1px solid rgba(196,138,40,0.18)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-cinzel text-sm font-bold text-parchment">Người tham gia</h2>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: 'rgba(196,138,40,0.15)', color: 'var(--gold)' }}
        >
          {online.length} online
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {online.map((player, i) => (
            <PlayerRow key={player.playerId} player={player} isMe={player.playerId === myPlayerId} index={i} />
          ))}
        </AnimatePresence>

        {offline.length > 0 && (
          <div className="mt-3 space-y-1.5 opacity-40">
            {offline.map((player) => (
              <div key={player.playerId} className="flex items-center gap-3 rounded-xl px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-parchment/20" />
                <span className="text-xs text-parchment/50 line-through">{player.nickname}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {online.length === 0 && (
        <p className="py-6 text-center text-sm text-parchment/30">
          Chưa có ai tham gia...
        </p>
      )}
    </div>
  );
}

function PlayerRow({ player, isMe, index }: { player: PlayerState; isMe: boolean; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, ease: cinematicEase, delay: index * 0.05 }}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
      style={{
        background: isMe ? 'rgba(196,138,40,0.12)' : 'rgba(255,255,255,0.03)',
        border: isMe ? '1px solid rgba(196,138,40,0.25)' : '1px solid transparent',
      }}
    >
      {/* Online indicator + glow */}
      <div className="relative flex-shrink-0">
        <div
          className="h-3 w-3 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(${player.glowLevel > 50 ? '196,138,40' : '44,104,68'},1) 0%, rgba(${player.glowLevel > 50 ? '196,138,40' : '44,104,68'},0.4) 100%)`,
            boxShadow: `0 0 ${4 + player.glowLevel / 10}px rgba(${player.glowLevel > 50 ? '196,138,40' : '44,104,68'},0.6)`,
          }}
        />
        {player.isHost && (
          <span className="absolute -right-1 -top-1 text-[8px]">⚓</span>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className="truncate text-sm font-medium text-parchment">
          {player.nickname}
          {isMe && <span className="ml-1.5 text-xs text-gold/60">(bạn)</span>}
        </span>
      </div>

      {/* Ready badge */}
      {player.ready && (
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--jade-glow)' }}
        >
          ✓
        </span>
      )}

      {/* Score (if > 0) */}
      {player.score > 0 && (
        <span className="text-xs font-semibold text-gold">
          {player.score.toLocaleString()}
        </span>
      )}
    </motion.div>
  );
}
