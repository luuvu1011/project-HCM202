'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import type { GamePhase } from '@/types/game';

interface Props {
  phase: GamePhase;
}

export function PhaseIntro({ phase }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(3);

  // GSAP entrance timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo('.pi-bar', { scaleX: 0 }, { scaleX: 1, duration: 0.6, transformOrigin: 'left' });
      tl.fromTo('.pi-country',
        { opacity: 0, y: -16, letterSpacing: '0.8em' },
        { opacity: 1, y: 0, letterSpacing: '0.4em', duration: 0.7 },
        '-=0.3');
      tl.fromTo('.pi-year',
        { opacity: 0, scale: 1.3, filter: 'blur(10px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9 },
        '-=0.4');
      tl.fromTo('.pi-name',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5');
      tl.fromTo('.pi-divider',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, transformOrigin: 'center' },
        '-=0.4');
      tl.fromTo('.pi-narration',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.4');
      tl.fromTo('.pi-fact',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.3');
      tl.fromTo('.pi-countdown',
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.1');
    }, containerRef);

    return () => ctx.revert();
  }, [phase.id]);

  // Visual countdown 3→2→1
  useEffect(() => {
    setTick(3);
    const intervals = [
      setTimeout(() => setTick(2), 2000),
      setTimeout(() => setTick(1), 4000),
    ];
    return () => intervals.forEach(clearTimeout);
  }, [phase.id]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${phase.backgroundFrom} 0%, ${phase.backgroundTo} 55%, #000 100%)`,
      }}
    >
      {/* Film grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 vv-grain opacity-55" />

      {/* Letterbox */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[10vh]"
        style={{ background: 'linear-gradient(180deg, #000 60%, transparent)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[10vh]"
        style={{ background: 'linear-gradient(0deg, #000 60%, transparent)' }} />

      {/* Phase index indicator top-left */}
      <div className="absolute left-6 top-6 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: `rgba(${phase.accentColorRgb},0.5)` }}>
        Chặng {phase.index + 1} / 7
      </div>

      {/* Radial glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 65% 55% at 50% 48%, rgba(${phase.accentColorRgb},0.18) 0%, transparent 68%)` }} />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 text-center">

        {/* Accent bar */}
        <div className="pi-bar mb-8 h-px w-24"
          style={{ background: `linear-gradient(90deg, transparent, ${phase.accentColor}, transparent)`, opacity: 0.8 }} />

        {/* Country */}
        <p className="pi-country mb-3 text-xs font-bold uppercase"
          style={{ color: `rgba(${phase.accentColorRgb},0.75)`, letterSpacing: '0.4em' }}>
          {phase.country}
        </p>

        {/* Year — hero element */}
        <h1 className="pi-year font-cinzel font-black leading-none"
          style={{
            fontSize: 'clamp(4rem, 18vw, 9rem)',
            background: `linear-gradient(135deg, ${phase.accentColor} 0%, #f0e4c4 45%, ${phase.accentColor} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
            textShadow: 'none',
            filter: `drop-shadow(0 0 40px rgba(${phase.accentColorRgb},0.35))`,
          }}>
          {phase.year}
        </h1>

        {/* City name */}
        <h2 className="pi-name mt-3 font-cinzel text-2xl font-bold text-parchment sm:text-3xl lg:text-4xl">
          {phase.name}
        </h2>
        <p className="mt-1 text-sm font-medium" style={{ color: 'rgba(232,210,168,0.45)' }}>
          {phase.location}
        </p>

        {/* Divider */}
        <div className="pi-divider my-6 h-px w-48"
          style={{ background: `linear-gradient(90deg, transparent, rgba(${phase.accentColorRgb},0.5), transparent)` }} />

        {/* Narration */}
        <p className="pi-narration max-w-lg text-sm italic leading-relaxed text-parchment/65 sm:text-base">
          {phase.narration}
        </p>

        {/* Historical fact */}
        <motion.div
          className="pi-fact mt-5 max-w-md rounded-2xl px-5 py-3 text-xs leading-relaxed"
          style={{
            background: `rgba(${phase.accentColorRgb},0.09)`,
            border: `1px solid rgba(${phase.accentColorRgb},0.2)`,
            color: 'rgba(232,210,168,0.55)',
          }}>
          <span className="mr-1.5 text-[9px] font-bold uppercase tracking-widest"
            style={{ color: `rgba(${phase.accentColorRgb},0.5)` }}>
            Sự kiện ·
          </span>
          {phase.historicalFact}
        </motion.div>

        {/* Countdown to question */}
        <div className="pi-countdown mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            {[3, 2, 1].map((n) => (
              <motion.div key={n}
                animate={{
                  scale: tick === n ? 1.35 : 0.7,
                  opacity: tick === n ? 1 : tick < n ? 0.15 : 0.35,
                }}
                transition={{ duration: 0.25 }}
                className="flex h-9 w-9 items-center justify-center rounded-full font-cinzel text-sm font-black"
                style={{
                  background: tick === n
                    ? `rgba(${phase.accentColorRgb},0.2)`
                    : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${tick === n ? phase.accentColor : 'rgba(255,255,255,0.08)'}`,
                  color: tick === n ? phase.accentColor : 'rgba(255,255,255,0.3)',
                  boxShadow: tick === n ? `0 0 16px rgba(${phase.accentColorRgb},0.3)` : 'none',
                }}>
                {n}
              </motion.div>
            ))}
          </div>
          <p className="text-[11px] uppercase tracking-[0.35em]"
            style={{ color: 'rgba(232,210,168,0.28)' }}>
            Câu hỏi sắp xuất hiện
          </p>
        </div>
      </div>

      {/* Corner light shafts */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-1/2 w-1/3 opacity-[0.07]"
          style={{ background: `conic-gradient(from 150deg at 0% 0%, ${phase.accentColor}, transparent 35%)` }} />
        <div className="absolute bottom-0 right-0 h-1/2 w-1/3 opacity-[0.07]"
          style={{ background: `conic-gradient(from -30deg at 100% 100%, ${phase.accentColor}, transparent 35%)` }} />
      </div>
    </motion.div>
  );
}
