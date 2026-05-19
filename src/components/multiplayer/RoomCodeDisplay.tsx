'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  roomId: string;
}

export function RoomCodeDisplay({ roomId }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{
        background: 'rgba(6,9,16,0.6)',
        border: '1px solid rgba(196,138,40,0.25)',
      }}
    >
      <p className="mb-1 text-xs text-parchment/50">Mã phòng</p>
      <div
        className="font-cinzel text-3xl font-bold tracking-[0.4em]"
        style={{
          background: 'linear-gradient(135deg, var(--gold) 0%, var(--parchment) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {roomId}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="mt-3 text-xs text-parchment/40 hover:text-parchment/70 transition-colors"
      >
        {copied ? '✓ Đã sao chép!' : 'Nhấn để sao chép'}
      </motion.button>
    </div>
  );
}
