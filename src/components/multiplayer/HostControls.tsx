'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onStart: () => Promise<void>;
  playerCount: number;
}

export function HostControls({ onStart, playerCount }: Props) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    await onStart();
    setLoading(false);
  };

  return (
    <div
      className="overflow-hidden rounded-2xl p-4"
      style={{
        background: 'rgba(140,24,24,0.15)',
        border: '1px solid rgba(140,24,24,0.35)',
      }}
    >
      <p className="mb-3 text-xs text-parchment/50">
        Bạn là host — điều khiển trò chơi
      </p>

      <motion.button
        whileHover={{ scale: playerCount >= 1 ? 1.02 : 1 }}
        whileTap={{ scale: playerCount >= 1 ? 0.98 : 1 }}
        onClick={handleStart}
        disabled={loading || playerCount < 1}
        className="w-full rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-40"
        style={{
          background:
            playerCount >= 1
              ? 'linear-gradient(135deg, #C8102E 0%, #8c1818 100%)'
              : 'rgba(140,24,24,0.3)',
          color: 'var(--parchment)',
          boxShadow: playerCount >= 1 ? '0 0 20px rgba(200,16,46,0.3)' : 'none',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border border-parchment/30 border-t-parchment" />
            Đang khởi động...
          </span>
        ) : (
          '⚓ Bắt đầu hành trình'
        )}
      </motion.button>

      {playerCount < 1 && (
        <p className="mt-2 text-center text-xs text-parchment/30">
          Cần ít nhất 1 người để bắt đầu
        </p>
      )}
    </div>
  );
}
