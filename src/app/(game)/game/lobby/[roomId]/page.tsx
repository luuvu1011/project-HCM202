'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { usePlayerPresence } from '@/hooks/usePlayerPresence';
import {
  advanceToPhaseIntro, setPlayerReady,
  ensureAnonymousAuth, joinRoom, getRoomState,
} from '@/lib/firebase/firestore';
import { OceanCanvas }         from '@/components/ocean-game/OceanCanvas';
import { WorldMapBackground } from '@/components/ocean-game/WorldMapBackground';
import { PlayerShipLayer }    from '@/components/ocean-game/PlayerShipLayer';
import { RoomCodeDisplay } from '@/components/multiplayer/RoomCodeDisplay';
import { cinematicEase } from '@/animations/transitions';

export default function LobbyPage() {
  const params  = useParams();
  const router  = useRouter();
  const roomId  = typeof params.roomId === 'string' ? params.roomId : '';

  const { roomState, players, playerId, isHost, setPlayerId, setIsHost } = useGameStore((s) => s);
  const [loading, setLoading] = useState(!playerId);
  const [error, setError]     = useState('');
  const [starting, setStarting] = useState(false);

  useRealtimeRoom(roomId);
  usePlayerPresence(roomId, playerId);

  useEffect(() => {
    async function init() {
      if (playerId) { setLoading(false); return; }
      try {
        const uid      = await ensureAnonymousAuth();
        const savedNick = sessionStorage.getItem('hj_nickname') || 'Khách';
        setPlayerId(uid);
        const state = await getRoomState(roomId);
        if (!state) { router.replace('/game'); return; }
        if (state.status !== 'waiting') { router.replace(`/game/play/${roomId}`); return; }
        await joinRoom(roomId, uid, savedNick, false);
      } catch {
        setError('Không thể kết nối. Thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [roomId]);

  useEffect(() => {
    if (!roomState) return;
    const GO = ['countdown', 'phase_intro', 'question', 'reviewing', 'result'];
    if (GO.includes(roomState.status)) router.replace(`/game/play/${roomId}`);
  }, [roomState?.status]);

  const handleStart = async () => {
    if (!isHost || starting) return;
    setStarting(true);
    await advanceToPhaseIntro(roomId, 0);
  };

  const onlinePlayers = players.filter((p) => p.isOnline);
  const myPlayer      = players.find((p) => p.playerId === playerId);

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#020408' }}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
    </div>
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* ── Layer 0: Ocean ── */}
      <OceanCanvas />

      {/* ── Layer 1: World map ── */}
      <WorldMapBackground />

      {/* ── Layer 2: Player ships ── */}
      <PlayerShipLayer players={onlinePlayers} myPlayerId={playerId ?? ''} />

      {/* ── Cinematic vignette ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,4,8,0.65) 100%)' }} />

      {/* ── Top title ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: cinematicEase }}
        className="absolute inset-x-0 top-0 z-20 flex flex-col items-center pt-8 text-center"
      >
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.6em] text-gold/50">
          Phòng chờ · {onlinePlayers.length} thủy thủ
        </p>
        <h1 className="font-cinzel text-3xl font-black text-parchment sm:text-4xl"
          style={{
            background: 'linear-gradient(135deg, #c48a28 0%, #f0e4c4 50%, #c48a28 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(196,138,40,0.3))',
          }}>
          HẢI TRÌNH ÁNH SÁNG
        </h1>
        <p className="mt-1 text-xs text-parchment/35">
          Mỗi ánh sáng trên đại dương là một người chơi — chờ hành trình bắt đầu
        </p>
      </motion.div>

      {/* ── Center panel ── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: cinematicEase }}
          className="w-full max-w-sm px-4"
        >
          <div className="overflow-hidden rounded-3xl"
            style={{
              background: 'rgba(6,9,16,0.82)',
              border: '1px solid rgba(196,138,40,0.22)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}>

            {/* Room code */}
            <div className="p-5">
              <RoomCodeDisplay roomId={roomId} />
            </div>

            {/* Ships list */}
            <div className="border-t border-parchment/5 px-5 py-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gold/40">
                Thủy thủ đoàn ({onlinePlayers.length})
              </p>
              <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1"
                style={{ scrollbarWidth: 'none' }}>
                <AnimatePresence initial={false}>
                  {onlinePlayers.map((p, i) => (
                    <motion.div key={p.playerId}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                      style={{
                        background: p.playerId === playerId
                          ? 'rgba(196,138,40,0.10)' : 'rgba(255,255,255,0.02)',
                        border: p.playerId === playerId
                          ? '1px solid rgba(196,138,40,0.2)' : '1px solid transparent',
                      }}>
                      {/* Ship dot */}
                      <div className="h-2.5 w-2.5 animate-pulse rounded-full flex-shrink-0"
                        style={{
                          background: `hsl(${(p.playerId.charCodeAt(0) * 47) % 360}, 70%, 60%)`,
                          boxShadow: `0 0 6px hsl(${(p.playerId.charCodeAt(0) * 47) % 360}, 70%, 60%)`,
                        }} />
                      <span className="flex-1 truncate text-sm text-parchment/80">{p.nickname}</span>
                      {p.isHost && <span className="text-[10px] text-gold/50">⚓ Host</span>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-parchment/5 p-5 space-y-3">
              {isHost ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStart}
                  disabled={starting || onlinePlayers.length < 1}
                  className="group relative w-full overflow-hidden rounded-2xl py-4 text-sm font-black uppercase tracking-widest disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #8c1818 0%, #C8102E 50%, #8c1818 100%)',
                    backgroundSize: '200% 100%',
                    color: '#f0e4c4',
                    boxShadow: '0 0 30px rgba(200,16,46,0.35)',
                    border: '1px solid rgba(200,16,46,0.5)',
                  }}
                >
                  {/* Shimmer */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
                  {starting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border border-parchment/30 border-t-parchment" />
                      Đang khởi hành...
                    </span>
                  ) : (
                    <span>⚓ Nhổ neo · Bắt đầu hành trình</span>
                  )}
                </motion.button>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-2xl py-3 text-xs text-parchment/35"
                  style={{ border: '1px dashed rgba(196,138,40,0.12)' }}>
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold/50" />
                  Chờ thuyền trưởng phát lệnh nhổ neo...
                </div>
              )}

              <a href="/game"
                className="block text-center text-xs text-parchment/25 hover:text-parchment/45 transition-colors">
                ← Rời bỏ hành trình
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center">
          <div className="rounded-2xl px-5 py-3 text-sm text-crimson"
            style={{ background: 'rgba(6,9,16,0.9)', border: '1px solid rgba(140,24,24,0.4)' }}>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
