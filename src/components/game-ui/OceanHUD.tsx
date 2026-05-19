'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerState } from '@/types/game';
import { GAME_PHASES } from '@/data/gamePhases';

interface Props {
  currentPhase: number;
  players: PlayerState[];
  myPlayerId: string;
  isReviewing: boolean;
}

export function OceanHUD({ currentPhase, players, myPlayerId, isReviewing }: Props) {
  const phase    = GAME_PHASES[currentPhase];
  const sorted   = [...players].sort((a, b) => b.score - a.score);
  const me       = players.find((p) => p.playerId === myPlayerId);
  const myRank   = sorted.findIndex((p) => p.playerId === myPlayerId) + 1;
  const top3     = sorted.slice(0, 3);

  return (
    <>
      {/* ── Bottom-left: My status ── */}
      <div className="pointer-events-none fixed bottom-6 left-5 z-30 flex flex-col gap-2">
        {me && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(6,9,16,0.75)',
              border: '1px solid rgba(196,138,40,0.22)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* My ship dot */}
            <div className="h-3 w-3 rounded-full"
              style={{
                background: 'radial-gradient(circle, #e8d2a8, #c48a2888)',
                boxShadow: '0 0 8px rgba(196,138,40,0.7)',
              }} />
            <div>
              <p className="text-xs font-bold text-parchment">{me.nickname}</p>
              <p className="text-[10px] text-parchment/40">
                Hạng {myRank} · {me.score.toLocaleString()} điểm
                {me.streak > 1 && <span className="ml-1.5 text-amber">🔥 ×{me.streak}</span>}
              </p>
            </div>
          </motion.div>
        )}

        {/* Phase stepper */}
        <div className="flex items-center gap-1.5 pl-1">
          {GAME_PHASES.map((p, i) => (
            <div key={p.id} className="rounded-full transition-all duration-500"
              style={{
                width:      i === currentPhase ? 18 : 5,
                height:     5,
                background: i < currentPhase
                  ? 'rgba(196,138,40,0.5)'
                  : i === currentPhase
                  ? phase?.accentColor ?? '#c48a28'
                  : 'rgba(255,255,255,0.1)',
              }} />
          ))}
        </div>
      </div>

      {/* ── Bottom-right: Mini leaderboard (reviewing only) ── */}
      <AnimatePresence>
        {isReviewing && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-6 right-5 z-30 w-52"
            style={{
              background: 'rgba(6,9,16,0.80)',
              border: '1px solid rgba(196,138,40,0.18)',
              backdropFilter: 'blur(12px)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <div className="border-b border-parchment/5 px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold/50">Thứ hạng</p>
            </div>
            {top3.map((p, i) => {
              const isMe = p.playerId === myPlayerId;
              return (
                <div key={p.playerId}
                  className="flex items-center gap-2.5 px-4 py-2.5"
                  style={{ background: isMe ? 'rgba(196,138,40,0.08)' : 'transparent' }}>
                  <span className="text-base w-5 text-center">
                    {['🥇', '🥈', '🥉'][i]}
                  </span>
                  <div className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      background: `hsl(${(p.playerId.charCodeAt(0) * 47) % 360}, 70%, 60%)`,
                      boxShadow:  `0 0 5px hsl(${(p.playerId.charCodeAt(0) * 47) % 360}, 70%, 60%)`,
                    }} />
                  <span className="flex-1 truncate text-xs font-medium text-parchment/80">{p.nickname}</span>
                  <span className="text-xs font-bold text-gold">{p.score.toLocaleString()}</span>
                </div>
              );
            })}
            {myRank > 3 && me && (
              <div className="border-t border-parchment/5 px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] text-parchment/35">Bạn: #{myRank}</span>
                <span className="text-[10px] font-bold text-gold/60">{me.score.toLocaleString()}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
