'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGameStore } from '@/stores/gameStore';
import { useServerCountdown } from '@/hooks/useCountdown';
import type { GameQuestion, GamePhase, RoomState } from '@/types/game';
import { cinematicEase } from '@/animations/transitions';

interface Props {
  question: GameQuestion;
  phase: GamePhase;
  roomState: RoomState;
  onAnswer: (optionId: string) => void;
  isReviewing: boolean;
  questionIndex: number;
  totalQuestions: number;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function QuestionDisplay({
  question, phase, roomState, onAnswer, isReviewing, questionIndex, totalQuestions,
}: Props) {
  const { hasAnswered, myAnswer, lastAnswerCorrect, pointsEarned } = useGameStore((s) => s);
  const [selected, setSelected] = useState<string | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const qRef    = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  const { seconds, progress } = useServerCountdown(
    roomState.countdown,
    roomState.questionStartedAt,
    question.timeLimit,
    !isReviewing && !hasAnswered,
  );

  // Reset selected khi câu mới
  useEffect(() => { setSelected(null); setShowBurst(false); }, [question.id]);

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.q-label', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.4 });
      tl.fromTo('.q-heading', { opacity: 0, y: 30, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, '-=0.2');
      tl.fromTo('.q-option-card',
        { opacity: 0, y: 40, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08 }, '-=0.3');
    }, wrapRef);
    return () => ctx.revert();
  }, [question.id]);

  // Timer pulse khi gần hết
  useEffect(() => {
    if (seconds <= 5 && seconds > 0 && !hasAnswered && !isReviewing && timerRef.current) {
      gsap.to(timerRef.current, { scale: 1.1, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' });
    }
  }, [seconds]);

  const handleSelect = (optionId: string) => {
    if (hasAnswered || isReviewing || selected) return;
    setSelected(optionId);
    onAnswer(optionId);
    // Burst animation
    setTimeout(() => setShowBurst(true), 100);
  };

  const timerDanger  = progress < 0.25;
  const timerWarning = progress < 0.5;
  const timerColor   = timerDanger ? '#C8102E' : timerWarning ? '#e8a820' : phase.accentColor;
  const circumference = 2 * Math.PI * 44;

  const isDocDecode = question.type === 'document_decode';
  const isIdeology  = question.type === 'ideology_choice';

  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45 }}
      className="flex min-h-dvh flex-col"
    >
      {/* ── Top HUD ── */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-8"
        style={{ background: 'rgba(0,0,0,0.45)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Phase + progress */}
        <div className="flex items-center gap-3">
          <div className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
            style={{ background: `rgba(${phase.accentColorRgb},0.18)`, color: phase.accentColor }}>
            {phase.name}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{
                  width: i === questionIndex ? 18 : 6,
                  height: 6,
                  background: i < questionIndex
                    ? phase.accentColor
                    : i === questionIndex
                    ? phase.accentColor
                    : 'rgba(255,255,255,0.12)',
                  opacity: i < questionIndex ? 0.5 : 1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div ref={timerRef} className="relative flex h-14 w-14 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none"
              stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
            <circle cx="50" cy="50" r="44" fill="none"
              stroke={timerColor} strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.4s ease' }}
            />
          </svg>
          <span className="relative z-10 text-base font-black tabular-nums"
            style={{ color: timerColor, textShadow: timerDanger ? `0 0 12px ${timerColor}` : 'none' }}>
            {seconds}
          </span>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col">

        {/* Document card (document_decode) */}
        {isDocDecode && question.documentText && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: cinematicEase }}
            className="relative mx-4 mt-5 overflow-hidden rounded-2xl sm:mx-8"
            style={{
              background: 'linear-gradient(160deg, #1e1508 0%, #120e04 100%)',
              border: '1px solid rgba(196,138,40,0.45)',
              boxShadow: '0 0 40px rgba(196,138,40,0.12)',
            }}
          >
            {/* Paper lines */}
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(196,138,40,0.8) 22px, rgba(196,138,40,0.8) 23px)' }} />
            {/* Red stamp */}
            <div className="absolute right-4 top-4 rotate-[-12deg] rounded border-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest opacity-30"
              style={{ borderColor: '#C8102E', color: '#C8102E' }}>
              Tài Liệu Mật
            </div>
            <div className="relative z-10 p-5 sm:p-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-gold/50">Trích dẫn lịch sử</p>
              <p className="whitespace-pre-line font-mono text-sm italic leading-relaxed text-parchment/80 sm:text-base">
                {question.documentText}
              </p>
            </div>
          </motion.div>
        )}

        {/* Question text */}
        <div className="px-4 py-5 sm:px-8 sm:py-6">
          <p className="q-label mb-3 text-[11px] font-bold uppercase tracking-[0.5em]"
            style={{ color: `rgba(${phase.accentColorRgb},0.7)` }}>
            {isIdeology ? '⚖ Lựa chọn lịch sử' : isDocDecode ? '📜 Giải mã tài liệu' : `Câu ${questionIndex + 1}`}
          </p>
          <h2 ref={qRef} className="q-heading font-cinzel text-xl font-bold leading-snug text-parchment sm:text-2xl lg:text-3xl"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            {question.text}
          </h2>
          {question.subtitle && (
            <p className="mt-2 text-sm italic text-parchment/50">{question.subtitle}</p>
          )}
        </div>

        {/* ── Answer grid ── */}
        <div className="flex-1 px-4 pb-6 sm:px-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option, i) => {
              const isSelected  = selected === option.id || myAnswer === option.id;
              const showCorrect = isReviewing && option.isCorrect;
              const showWrong   = isReviewing && isSelected && !option.isCorrect;
              const isChosen    = isSelected && !isReviewing;
              const isDisabled  = hasAnswered || isReviewing;

              return (
                <AnswerTile
                  key={option.id}
                  label={OPTION_LABELS[i]}
                  text={option.text}
                  explanation={option.explanation}
                  isSelected={isSelected}
                  isChosen={isChosen}
                  showCorrect={showCorrect}
                  showWrong={showWrong}
                  isDisabled={isDisabled}
                  isReviewing={isReviewing}
                  accentColor={phase.accentColor}
                  accentRgb={phase.accentColorRgb}
                  index={i}
                  onClick={() => handleSelect(option.id)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Answer feedback ── */}
        <AnimatePresence>
          {hasAnswered && !isReviewing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="mx-4 mb-6 flex items-center justify-center gap-3 rounded-2xl py-4 sm:mx-8"
              style={{
                background: lastAnswerCorrect
                  ? 'rgba(44,104,68,0.18)'
                  : 'rgba(140,24,24,0.18)',
                border: `1px solid ${lastAnswerCorrect ? 'rgba(44,104,68,0.4)' : 'rgba(140,24,24,0.4)'}`,
              }}
            >
              <span className="text-2xl">{lastAnswerCorrect ? '✓' : '✗'}</span>
              <div>
                <p className="font-semibold text-parchment">
                  {lastAnswerCorrect ? `+${pointsEarned} điểm!` : 'Chưa đúng...'}
                </p>
                <p className="text-xs text-parchment/50">Chờ kết quả từ host</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Correct answer burst particles ── */}
      <AnimatePresence>
        {showBurst && lastAnswerCorrect && (
          <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div key={i}
                className="absolute rounded-full"
                style={{
                  left: '50%', top: '60%',
                  width: 6 + (i % 4) * 4,
                  height: 6 + (i % 4) * 4,
                  background: i % 2 === 0 ? '#FFD700' : '#2c6844',
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: (Math.cos((i / 20) * Math.PI * 2) * 160) + (Math.random() - 0.5) * 80,
                  y: (Math.sin((i / 20) * Math.PI * 2) * 160) + (Math.random() - 0.5) * 80,
                  opacity: 0,
                  scale: 0.2,
                }}
                transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Answer Tile component ────────────────────────────────────────────────────

interface TileProps {
  label: string;
  text: string;
  explanation: string;
  isSelected: boolean;
  isChosen: boolean;
  showCorrect: boolean;
  showWrong: boolean;
  isDisabled: boolean;
  isReviewing: boolean;
  accentColor: string;
  accentRgb: string;
  index: number;
  onClick: () => void;
}

function AnswerTile({
  label, text, explanation, isSelected, isChosen,
  showCorrect, showWrong, isDisabled, isReviewing,
  accentColor, accentRgb, index, onClick,
}: TileProps) {
  let bg     = 'rgba(14,26,40,0.75)';
  let border = 'rgba(255,255,255,0.07)';
  let shadow = 'none';
  let textColor = 'rgba(232,210,168,0.9)';

  if (showCorrect) {
    bg = 'rgba(44,104,68,0.30)';
    border = 'rgba(44,104,68,0.7)';
    shadow = '0 0 30px rgba(44,104,68,0.25), inset 0 1px 0 rgba(44,104,68,0.2)';
    textColor = '#e8d2a8';
  } else if (showWrong) {
    bg = 'rgba(140,24,24,0.30)';
    border = 'rgba(140,24,24,0.6)';
    shadow = '0 0 20px rgba(140,24,24,0.2)';
    textColor = 'rgba(232,210,168,0.6)';
  } else if (isChosen) {
    bg = `rgba(${accentRgb},0.20)`;
    border = accentColor;
    shadow = `0 0 24px rgba(${accentRgb},0.25), inset 0 1px 0 rgba(${accentRgb},0.15)`;
    textColor = '#e8d2a8';
  }

  return (
    <motion.button
      className="q-option-card group relative overflow-hidden rounded-2xl text-left transition-colors"
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        boxShadow: shadow,
        cursor: isDisabled ? 'default' : 'pointer',
        backdropFilter: 'blur(12px)',
        minHeight: 80,
        padding: '1rem 1.25rem',
      }}
      whileHover={!isDisabled ? { scale: 1.02, y: -3 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={isDisabled}
      layout
    >
      {/* Hover shimmer */}
      {!isDisabled && !isChosen && (
        <div aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(135deg, rgba(${accentRgb},0.08) 0%, transparent 60%)` }}
        />
      )}

      {/* Selection glow ring */}
      <AnimatePresence>
        {isChosen && (
          <motion.div aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ boxShadow: `inset 0 0 0 1.5px ${accentColor}` }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        {/* Label badge */}
        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black transition-all duration-300"
          style={{
            background: showCorrect
              ? 'rgba(44,104,68,0.5)'
              : showWrong
              ? 'rgba(140,24,24,0.5)'
              : isChosen
              ? `rgba(${accentRgb},0.3)`
              : 'rgba(255,255,255,0.06)',
            color: showCorrect
              ? '#6bdd9a'
              : showWrong
              ? '#f08080'
              : isChosen
              ? accentColor
              : 'rgba(232,210,168,0.4)',
            border: `1px solid ${showCorrect ? 'rgba(44,104,68,0.5)' : showWrong ? 'rgba(140,24,24,0.4)' : isChosen ? `rgba(${accentRgb},0.4)` : 'rgba(255,255,255,0.06)'}`,
          }}>
          {showCorrect ? '✓' : showWrong ? '✗' : label}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug sm:text-base" style={{ color: textColor }}>
            {text}
          </p>

          {/* Explanation (after review) */}
          <AnimatePresence>
            {isReviewing && (showCorrect || showWrong) && (
              <motion.p
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                transition={{ duration: 0.4 }}
                className="text-xs leading-relaxed"
                style={{ color: showCorrect ? 'rgba(107,221,154,0.75)' : 'rgba(240,128,128,0.7)' }}
              >
                {explanation}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected lock-in pulse */}
      <AnimatePresence>
        {isChosen && (
          <motion.div aria-hidden
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{}}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: `rgba(${accentRgb},0.15)` }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
