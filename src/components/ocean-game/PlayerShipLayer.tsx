'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerState } from '@/types/game';
import { GAME_PHASES } from '@/data/gamePhases';
import { lngLatToPercent } from './RouteSystem';

// Interpolate position between phases based on score/progress
function getShipPosition(player: PlayerState, phases: typeof GAME_PHASES) {
  const phaseIndex = Math.min(
    Math.floor(player.totalAnswered / 3),
    phases.length - 1,
  );
  const phase = phases[phaseIndex];
  const { x, y } = lngLatToPercent(phase.coordinates[0], phase.coordinates[1]);
  // Small jitter so ships don't stack
  const seed = player.playerId.charCodeAt(0) + player.playerId.charCodeAt(1);
  return {
    x: x + ((seed % 7) - 3) * 0.5,
    y: y + ((seed % 5) - 2) * 0.5,
    phase: phaseIndex,
  };
}

interface Props {
  players: PlayerState[];
  myPlayerId: string;
}

export function PlayerShipLayer({ players, myPlayerId }: Props) {
  const online = players.filter((p) => p.isOnline);
  const sorted = [...online].sort((a, b) => b.score - a.score);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <AnimatePresence>
        {online.map((player, rank) => {
          const pos    = getShipPosition(player, GAME_PHASES);
          const isMe   = player.playerId === myPlayerId;
          const isLead = rank === 0;
          const glow   = Math.min(100, player.glowLevel);

          // Color: gold for leader, player-specific otherwise
          const color = isLead
            ? '#FFD700'
            : isMe
            ? '#e8d2a8'
            : `hsl(${(player.playerId.charCodeAt(2) * 37) % 360}, 70%, 65%)`;

          return (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top:  `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'left 2.5s cubic-bezier(0.22,1,0.36,1), top 2.5s cubic-bezier(0.22,1,0.36,1)',
                zIndex: isMe ? 30 : isLead ? 25 : 20,
              }}
            >
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: `1px solid ${color}`,
                  opacity: 0.4,
                }}
              />

              {/* Ship icon */}
              <div
                style={{
                  width:        isMe || isLead ? 14 : 10,
                  height:       isMe || isLead ? 14 : 10,
                  background:   `radial-gradient(circle at 35% 35%, ${color} 0%, ${color}88 100%)`,
                  borderRadius: '50% 50% 50% 0',
                  transform:    'rotate(45deg)',
                  boxShadow:    `0 0 ${6 + glow / 8}px ${color}, 0 0 ${12 + glow / 5}px ${color}44`,
                  border:       `1px solid ${color}88`,
                }}
              />

              {/* Name tag */}
              <div
                style={{
                  position:   'absolute',
                  top:        -22,
                  left:       '50%',
                  transform:  'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  background: 'rgba(6,9,16,0.75)',
                  border:     `1px solid ${color}44`,
                  borderRadius: 999,
                  padding:    '1px 6px',
                  fontSize:   isMe ? 10 : 8,
                  fontWeight: isMe ? 700 : 400,
                  color:      isMe ? color : 'rgba(232,210,168,0.55)',
                  backdropFilter: 'blur(4px)',
                  letterSpacing: '0.02em',
                  lineHeight:  1.3,
                }}
              >
                {isLead && <span style={{ marginRight: 2 }}>⚡</span>}
                {player.nickname}
                {player.score > 0 && (
                  <span style={{ opacity: 0.6, marginLeft: 4 }}>{player.score}</span>
                )}
              </div>

              {/* Score burst on high glow */}
              {glow > 80 && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    position:     'absolute',
                    inset:        -4,
                    borderRadius: '50%',
                    background:   `radial-gradient(circle, ${color}30, transparent 70%)`,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
