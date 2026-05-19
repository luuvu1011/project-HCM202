'use client';

import { useEffect, useRef } from 'react';
import { subscribeRoom, subscribePlayers, updatePresence, markOffline } from '@/lib/firebase/firestore';
import { useGameStore } from '@/stores/gameStore';
import type { Unsubscribe } from 'firebase/firestore';

export function useRealtimeRoom(roomId: string | null) {
  const setRoomState = useGameStore((s) => s.setRoomState);
  const setPlayers   = useGameStore((s) => s.setPlayers);
  const playerId     = useGameStore((s) => s.playerId);

  const unsubRoom    = useRef<Unsubscribe | null>(null);
  const unsubPlayers = useRef<Unsubscribe | null>(null);
  const presenceRef  = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;

    unsubRoom.current    = subscribeRoom(roomId, setRoomState);
    unsubPlayers.current = subscribePlayers(roomId, setPlayers);

    // Presence heartbeat every 8s
    if (playerId) {
      updatePresence(roomId, playerId);
      presenceRef.current = setInterval(() => {
        updatePresence(roomId, playerId);
      }, 8_000);
    }

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        if (playerId) markOffline(roomId, playerId);
      } else {
        if (playerId) updatePresence(roomId, playerId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubRoom.current?.();
      unsubPlayers.current?.();
      if (presenceRef.current) clearInterval(presenceRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [roomId, playerId, setRoomState, setPlayers]);
}
