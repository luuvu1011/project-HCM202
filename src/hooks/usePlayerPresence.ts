'use client';

import { useEffect } from 'react';
import { markOffline, updatePresence } from '@/lib/firebase/firestore';

export function usePlayerPresence(roomId: string | null, playerId: string | null) {
  useEffect(() => {
    if (!roomId || !playerId) return;

    const handleBeforeUnload = () => {
      markOffline(roomId, playerId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      markOffline(roomId, playerId);
    };
  }, [roomId, playerId]);
}
