'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGameStore } from '@/stores/gameStore';
import { useServerCountdown } from '@/hooks/useCountdown';
import type { GameQuestion, GamePhase, RoomState } from '@/types/game';

interface Props {
  question: GameQuestion;
  phase: GamePhase;
  roomState: RoomState;
  onAnswer: (optionId: string) => void;
  isReviewing: boolean;
  questionIndex: number;
  totalQuestions: number;
}

// Scatter positions for answer fragments — compass rose layout
const POSITIONS = [
  { x: '12%',  y: '18%',  rot: -3  }, // NW
  { x: '68%',  y: '14%',  rot: 2   }, // NE
  { x: '8%',   y: '68%',  rot: 4   }, // SW
  { x: '65%',  y: '70%',  rot: -2  }, // SE
];

export function CinematicQuestion({
  question, phase, roomState, onAnswer, isReviewing, questionIndex, totalQuestions,
}: Props) {
  const { hasAnswered, myAnswer, lastAnswerCorrect, pointsEarned } = useGameStore((s) => s);
  const [selected, setSelected] = useState<string | null>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  const { seconds, progress } = useServerCountdown(
    roomState.countdown,
    roomState.questionStartedAt,
    question.timeLimit,
    !isReviewing && !hasAnswered,
  );

  useEffect(() => { setSelected(null); }, [question.id]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cq-origin',
        { opacity: 0, scale: 0.6, filter: 'blur(8px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out' },
      );
      gsap.fromTo('.cq-fragment',
        { opacity: 0, scale: 0.7, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.12, delay: 0.4, ease: 'back.out(1.4)' },
      );
    }, questionRef);
    return () => ctx.revert();
  }, [question.id]);

  const handleSelect = (optionId: string) => {
    if (hasAnswered || isReviewing || selected) return;
    setSelected(optionId);
    onAnswer(optionId);
  };

  const timerDanger  = progress < 0.25;
  const circumference = 2 * Math.PI * 20;

  return (
    <motion.div
      ref={questionRef}
      className="pointer-events-none fixed inset-0 z-30"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Subtle dark veil over ocean ── */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)' }} />

      {/* ── HUD: phase + timer + progress ── */}
      <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between px-5 py-3"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>

        <div className="flex items-center gap-3">
          <div className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: `rgba(${phase.accentColorRgb},0.2)`, color: phase.accentColor, border: `1px solid rgba(${phase.accentColorRgb},0.3)` }}>
            {phase.name} · {phase.year}
          </div>
          {/* Question dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div key={i} className="rounded-full"
                style={{
                  width: i === questionIndex ? 16 : 5,
                  height: 5,
                  background: i <= questionIndex ? phase.accentColor : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.4s',
                }} />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="relative flex h-12 w-12 items-center justify-center">
          <svg className="-rotate-90" width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle cx="24" cy="24" r="20" fill="none"
              stroke={timerDanger ? '#C8102E' : progress < 0.5 ? '#e8a820' : phase.accentColor}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.4s ease' }}
            />
          </svg>
          <span className="absolute text-sm font-black tabular-nums"
            style={{ color: timerDanger ? '#C8102E' : 'rgba(232,210,168,0.9)' }}>
            {seconds}
          </span>
        </div>
      </div>

      {/* ── CENTER: Question origin point ── */}
      <div className="cq-origin pointer-events-auto absolute"
        style={{ left: '50%', top: '46%', transform: 'translate(-50%, -50%)', width: 'min(560px, 88vw)' }}>

        {/* Historical document aesthetic */}
        <div className="relative overflow-hidden rounded-2xl px-7 py-5 text-center"
          style={{
            background: 'linear-gradient(160deg, rgba(10,8,4,0.88) 0%, rgba(20,14,6,0.85) 100%)',
            border: `1px solid rgba(${phase.accentColorRgb},0.30)`,
            boxShadow: `0 0 60px rgba(${phase.accentColorRgb},0.12), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
            backdropFilter: 'blur(16px)',
          }}>

          {/* Paper grain */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(196,138,40,0.6) 18px, rgba(196,138,40,0.6) 19px)' }} />

          {/* Doc type */}
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.5em]"
            style={{ color: `rgba(${phase.accentColorRgb},0.6)` }}>
            {question.type === 'document_decode'
              ? '— Tài liệu lịch sử —'
              : question.type === 'ideology_choice'
              ? '— Lựa chọn con đường —'
              : `— Câu ${questionIndex + 1} / ${totalQuestions} —`}
          </p>

          {/* Document text (if document_decode) */}
          {question.type === 'document_decode' && question.documentText && (
            <div className="mb-4 rounded-xl px-4 py-3 text-left"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,138,40,0.15)' }}>
              <p className="font-mono text-xs italic leading-relaxed text-parchment/60 sm:text-sm whitespace-pre-line">
                {question.documentText}
              </p>
            </div>
          )}

          {/* Question */}
          <h2 className="font-cinzel text-lg font-bold leading-snug text-parchment sm:text-xl">
            {question.text}
          </h2>

          {question.subtitle && (
            <p className="mt-2 text-sm italic text-parchment/45">{question.subtitle}</p>
          )}

          {/* Status after answering */}
          <AnimatePresence>
            {hasAnswered && !isReviewing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center justify-center gap-2 text-sm"
              >
                <span style={{ color: lastAnswerCorrect ? '#6bdd9a' : '#f08080' }}>
                  {lastAnswerCorrect ? `✦ +${pointsEarned} điểm — Tốt lắm!` : '✦ Chưa đúng — Chờ thuyền trưởng'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compass hint */}
          {!hasAnswered && !isReviewing && (
            <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-parchment/25">
              Chọn hướng đi ✦ Click vào mảnh ký ức
            </p>
          )}
        </div>
      </div>

      {/* ── ANSWER FRAGMENTS: scattered around screen ── */}
      {question.options.map((option, i) => {
        const pos        = POSITIONS[i];
        const isSelected = selected === option.id || myAnswer === option.id;
        const showCorrect = isReviewing && option.isCorrect;
        const showWrong   = isReviewing && isSelected && !option.isCorrect;
        const isDisabled  = hasAnswered || isReviewing;

        return (
          <AnswerFragment
            key={option.id}
            option={option}
            index={i}
            pos={pos}
            isSelected={isSelected}
            showCorrect={showCorrect}
            showWrong={showWrong}
            isDisabled={isDisabled}
            isReviewing={isReviewing}
            accentColor={phase.accentColor}
            accentRgb={phase.accentColorRgb}
            onClick={() => handleSelect(option.id)}
          />
        );
      })}
    </motion.div>
  );
}

// ── Single floating answer fragment ─────────────────────────────────────────

interface FragmentProps {
  option: { id: string; text: string; isCorrect: boolean; explanation: string };
  index: number;
  pos: { x: string; y: string; rot: number };
  isSelected: boolean;
  showCorrect: boolean;
  showWrong: boolean;
  isDisabled: boolean;
  isReviewing: boolean;
  accentColor: string;
  accentRgb: string;
  onClick: () => void;
}

const LABELS = ['A', 'B', 'C', 'D'];
const LABEL_ICONS = ['◈', '◉', '◆', '◇'];

function AnswerFragment({
  option, index, pos, isSelected, showCorrect, showWrong,
  isDisabled, isReviewing, accentColor, accentRgb, onClick,
}: FragmentProps) {
  const borderColor = showCorrect
    ? 'rgba(44,104,68,0.7)' : showWrong
    ? 'rgba(140,24,24,0.6)' : isSelected
    ? accentColor
    : 'rgba(196,138,40,0.18)';

  const bg = showCorrect
    ? 'rgba(20,50,30,0.85)' : showWrong
    ? 'rgba(40,10,10,0.85)' : isSelected
    ? `rgba(${accentRgb},0.18)` : 'rgba(6,9,16,0.78)';

  const glowColor = showCorrect ? '44,104,68'
    : showWrong ? '140,24,24'
    : isSelected ? accentRgb
    : '196,138,40';

  return (
    <motion.button
      className="cq-fragment pointer-events-auto absolute"
      style={{
        left: pos.x, top: pos.y,
        transform: `rotate(${pos.rot}deg)`,
        maxWidth: 'min(220px, 40vw)',
        cursor: isDisabled ? 'default' : 'pointer',
      }}
      whileHover={!isDisabled ? { scale: 1.06, rotate: 0, zIndex: 50 } : {}}
      whileTap={!isDisabled ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={isDisabled}
    >
      {/* Fragment card */}
      <div
        className="relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-300"
        style={{
          background: bg,
          border: `1px solid ${borderColor}`,
          backdropFilter: 'blur(14px)',
          boxShadow: `0 0 ${isSelected || showCorrect ? 20 : 8}px rgba(${glowColor},${isSelected ? 0.3 : 0.12}), 0 8px 32px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Aged paper lines */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(196,138,40,0.5) 14px, rgba(196,138,40,0.5) 15px)' }} />

        {/* Top label */}
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[11px] font-black"
            style={{ color: showCorrect ? '#6bdd9a' : showWrong ? '#f08080' : accentColor }}>
            {LABEL_ICONS[index]} {LABELS[index]}
          </span>
          {showCorrect && <span className="text-[10px] text-jade-glow font-bold">✓ Đúng</span>}
          {showWrong   && <span className="text-[10px] text-crimson font-bold">✗ Sai</span>}
        </div>

        {/* Answer text */}
        <p className="text-xs font-medium leading-snug sm:text-sm"
          style={{ color: showWrong ? 'rgba(232,210,168,0.45)' : 'rgba(232,210,168,0.88)' }}>
          {option.text}
        </p>

        {/* Explanation */}
        <AnimatePresence>
          {isReviewing && (showCorrect || showWrong) && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
              transition={{ duration: 0.5 }}
              className="text-[11px] leading-relaxed"
              style={{ color: showCorrect ? 'rgba(107,221,154,0.7)' : 'rgba(240,128,128,0.65)' }}
            >
              {option.explanation}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Selected glow sweep */}
        {isSelected && !isReviewing && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.2), transparent)`, width: '50%' }}
          />
        )}
      </div>

      {/* Connecting dashed line to center (decorative) */}
      <div aria-hidden
        className="absolute"
        style={{
          display:       'none', // only enable on desktop
          pointerEvents: 'none',
          opacity:       0.15,
        }}
      />
    </motion.button>
  );
}
