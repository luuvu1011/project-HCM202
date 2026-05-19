'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  correct: boolean | null; // null = no reaction
  onDone: () => void;
}

export function OceanReactions({ correct, onDone }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (correct === null) return;
    timerRef.current = setTimeout(() => onDone(), 1_800);
    return () => clearTimeout(timerRef.current);
  }, [correct, onDone]);

  return (
    <AnimatePresence>
      {correct === true && (
        <motion.div
          key="correct"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none fixed inset-0 z-40"
        >
          {/* Golden veil */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0] }}
            transition={{ duration: 1.2, times: [0, 0.3, 1] }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 80%, rgba(255,200,40,0.35) 0%, transparent 70%)' }}
          />

          {/* Gold particles radiate from bottom */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI; // semicircle upward
            const dist  = 80 + Math.random() * 140;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  x: Math.cos(angle) * dist * (Math.random() > 0.5 ? 1 : -1),
                  y: -Math.sin(angle) * dist,
                  scale: 0.2,
                }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: Math.random() * 0.2 }}
                style={{
                  position: 'fixed',
                  left: '50%', bottom: '35%',
                  width:  4 + Math.random() * 6,
                  height: 4 + Math.random() * 6,
                  borderRadius: '50%',
                  background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#c48a28' : '#fff',
                  boxShadow: '0 0 8px rgba(255,215,0,0.8)',
                }}
              />
            );
          })}

          {/* "+" score text */}
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -60, scale: 1 }}
            transition={{ duration: 1.4, times: [0, 0.15, 0.7, 1] }}
            style={{
              position: 'fixed',
              left: '50%', bottom: '42%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-body)',
              fontSize: 28,
              fontWeight: 900,
              color: '#FFD700',
              textShadow: '0 0 20px rgba(255,215,0,0.7)',
              letterSpacing: '0.05em',
            }}
          >
            ✦ ĐÚNG RỒI
          </motion.div>
        </motion.div>
      )}

      {correct === false && (
        <motion.div
          key="wrong"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none fixed inset-0 z-40"
        >
          {/* Storm flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0.1, 0] }}
            transition={{ duration: 1.0, times: [0, 0.1, 0.5, 1] }}
            className="absolute inset-0"
            style={{ background: 'rgba(20,25,60,0.5)' }}
          />

          {/* Red vignette */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(80,10,10,0.6) 100%)' }}
          />

          {/* "✗" text */}
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 1.3 }}
            animate={{ opacity: [0, 1, 1, 0], y: -50, scale: 1 }}
            transition={{ duration: 1.4, times: [0, 0.15, 0.7, 1] }}
            style={{
              position: 'fixed',
              left: '50%', bottom: '42%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-body)',
              fontSize: 24,
              fontWeight: 900,
              color: '#e05555',
              textShadow: '0 0 16px rgba(200,50,50,0.6)',
            }}
          >
            ✦ CHƯA ĐÚNG
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
