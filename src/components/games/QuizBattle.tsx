"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Pause, Sparkles, Timer } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@/types/games";
import { QUIZ_QUESTIONS } from "@/data/quizQuestions";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const TIME_LIMIT = 12;
const REVEAL_DELAY = 650;
const FREEZE_SECONDS = 5;

function pickQuestions(): QuizQuestion[] {
  return [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
}

// Deterministic order for SSR — first 5 questions in source order.
// Client randomizes on mount to avoid hydration mismatch.
function initialQuestions(): QuizQuestion[] {
  return QUIZ_QUESTIONS.slice(0, 5);
}

type RevealState = {
  selectedIndex: number | null;
  correctIndex: number;
};

export function QuizBattle() {
  const reduced = useReducedMotion();
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [phase, setPhase] = useState<"play" | "reveal" | "result">("play");
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [reveal, setReveal] = useState<RevealState | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [usedFifty, setUsedFifty] = useState(false);
  const [usedFreeze, setUsedFreeze] = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const freezeUntilRef = useRef(0);
  const q = questions[index];

  // Shuffle on client mount only — server uses deterministic order to match SSR
  useEffect(() => {
    setQuestions(pickQuestions());
    // Intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "play" || !q) return;
    setTimeLeft(TIME_LIMIT);
    setHiddenOptions([]);
    let remaining = TIME_LIMIT;
    const id = window.setInterval(() => {
      if (Date.now() < freezeUntilRef.current) return;
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        setCombo(0);
        setWrongCount((c) => c + 1);
        setFlash("bad");
        setReveal({ selectedIndex: null, correctIndex: q.correctIndex });
        setPhase("reveal");
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [index, phase, q]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const id = window.setTimeout(() => {
      setFlash(null);
      setReveal(null);
      setHiddenOptions([]);
      if (index >= questions.length - 1) {
        setPhase("result");
      } else {
        setIndex((i) => i + 1);
        setPhase("play");
      }
    }, REVEAL_DELAY);
    return () => window.clearTimeout(id);
  }, [index, phase, questions.length]);

  const pick = useCallback(
    (optionIndex: number) => {
      if (phase !== "play" || !q) return;
      if (hiddenOptions.includes(optionIndex)) return;
      const ok = optionIndex === q.correctIndex;
      if (ok) {
        const nextCombo = combo + 1;
        const bonus = timeLeft * 4;
        setCombo(nextCombo);
        setBestCombo((b) => Math.max(b, nextCombo));
        setScore((s) => s + 100 + nextCombo * 20 + bonus);
        setCorrectCount((c) => c + 1);
        setFlash("ok");
      } else {
        setCombo(0);
        setWrongCount((c) => c + 1);
        setFlash("bad");
      }
      setReveal({ selectedIndex: optionIndex, correctIndex: q.correctIndex });
      setPhase("reveal");
    },
    [combo, hiddenOptions, phase, q, timeLeft],
  );

  const useFifty = () => {
    if (usedFifty || phase !== "play" || !q) return;
    const wrong = q.options
      .map((_, i) => i)
      .filter((i) => i !== q.correctIndex);
    const shuffled = wrong.sort(() => Math.random() - 0.5);
    setHiddenOptions(shuffled.slice(0, 2));
    setUsedFifty(true);
  };

  const useFreeze = () => {
    if (usedFreeze || phase !== "play") return;
    setUsedFreeze(true);
    setFreezeActive(true);
    freezeUntilRef.current = Date.now() + FREEZE_SECONDS * 1000;
    window.setTimeout(() => setFreezeActive(false), FREEZE_SECONDS * 1000);
  };

  const restart = () => {
    setQuestions(pickQuestions());
    setIndex(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setTimeLeft(TIME_LIMIT);
    setPhase("play");
    setFlash(null);
    setReveal(null);
    setHiddenOptions([]);
    setUsedFifty(false);
    setUsedFreeze(false);
    setFreezeActive(false);
    setCorrectCount(0);
    setWrongCount(0);
    freezeUntilRef.current = 0;
  };

  const accuracy = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

  const rank =
    accuracy >= 90
      ? "Hoa tiêu kiên định"
      : accuracy >= 70
        ? "Thủy thủ vững tay"
        : accuracy >= 50
          ? "Lữ khách đang tiến bộ"
          : "Tập sự hành trình";

  return (
    <GlassPanel className="p-5 sm:p-7" variant="rich">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold text-parchment">
            Quiz Battle
          </h3>
          <p className="mt-1 text-sm text-parchment/90">
            Đếm ngược — combo tăng điểm, power-up hỗ trợ khi cần.
          </p>
        </div>
        {phase === "play" && q ? (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-parchment/90">
              <Timer className="h-4 w-4 text-gold" aria-hidden />
              {timeLeft}s
              {freezeActive ? (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-gold-soft">
                  <Pause className="h-3 w-3" aria-hidden />
                  Tạm dừng
                </span>
              ) : null}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-semibold text-gold-soft">
              <Flame className="h-4 w-4" aria-hidden />
              Combo ×{combo}
            </span>
            <span className="text-parchment/90">
              Điểm: <span className="font-semibold text-parchment">{score}</span>
            </span>
          </div>
        ) : null}
      </div>

      {phase === "play" && q ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-parchment/80">
          <button
            type="button"
            onClick={useFifty}
            disabled={usedFifty}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 transition-colors hover:border-gold/40 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden />
            50/50
          </button>
          <button
            type="button"
            onClick={useFreeze}
            disabled={usedFreeze}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 transition-colors hover:border-gold/40 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Pause className="h-3.5 w-3.5 text-gold" aria-hidden />
            Đóng băng {FREEZE_SECONDS}s
          </button>
          <span className="ml-auto text-parchment-muted/70">
            Đúng: {correctCount}/{questions.length}
          </span>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {phase !== "result" && q ? (
          <motion.div
            key={q.id}
            initial={reduced ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -16 }}
            transition={reduced ? { duration: 0 } : { duration: 0.35 }}
            className="relative mt-6"
          >
            {flash === "ok" ? (
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-500/15 blur-xl" />
            ) : null}
            {flash === "bad" ? (
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-red-accent/20 blur-xl" />
            ) : null}
            <p className="text-lg font-medium leading-relaxed text-parchment sm:text-xl">
              {q.question}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {q.options.map((opt, i) => {
                const isHidden = hiddenOptions.includes(i);
                const isReveal = phase === "reveal" && reveal;
                const isCorrect = isReveal && i === reveal.correctIndex;
                const isWrongPick =
                  isReveal &&
                  reveal?.selectedIndex === i &&
                  reveal?.selectedIndex !== reveal.correctIndex;
                const base =
                  "rounded-2xl border px-4 py-3 text-left text-sm transition-colors sm:text-[15px]";
                const stateClass = isHidden
                  ? "border-white/5 bg-white/[0.02] text-parchment/40 line-through"
                  : isCorrect
                    ? "border-emerald-400/60 bg-emerald-400/15 text-parchment"
                    : isWrongPick
                      ? "border-red-accent/60 bg-red-accent/15 text-parchment"
                      : "border-white/10 bg-white/[0.04] text-parchment/90 hover:border-gold/35 hover:text-parchment";
                return (
                  <motion.button
                    key={opt}
                    type="button"
                    onClick={() => pick(i)}
                    whileHover={
                      !reduced && phase === "play" && !isHidden
                        ? { scale: 1.01 }
                        : undefined
                    }
                    whileTap={
                      !reduced && phase === "play" && !isHidden
                        ? { scale: 0.98 }
                        : undefined
                    }
                    disabled={phase !== "play" || isHidden}
                    className={`${base} ${stateClass}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-parchment/80">
              <span>
                Câu {index + 1}/{questions.length}
              </span>
              {phase === "reveal" && reveal ? (
                <span>
                  Đáp án đúng: <span className="font-semibold text-parchment">{q.options[reveal.correctIndex]}</span>
                </span>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.35 }}
            className="mt-8 space-y-4 text-center"
          >
            <p className="font-display text-3xl font-semibold text-parchment">
              Kết thúc trận đấu tri thức
            </p>
            <p className="text-parchment/90">
              Tổng điểm của bạn: <span className="font-semibold text-gold-soft">{score}</span>
            </p>
            <div className="grid gap-2 text-sm text-parchment/90 sm:grid-cols-3">
              <div>
                Đúng: {correctCount}/{questions.length}
              </div>
              <div>Độ chính xác: {accuracy}%</div>
              <div>Kỷ lục combo: {bestCombo}</div>
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold/80">
              Danh hiệu: {rank}
            </p>
            <Button type="button" onClick={restart}>
              Chơi lại
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
