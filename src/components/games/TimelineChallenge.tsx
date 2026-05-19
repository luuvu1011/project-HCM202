"use client";

import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Check, RotateCcw, Sparkles, Timer } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TIMELINE_EVENTS } from "@/data/timelineEvents";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function TimelineChallenge() {
  const reduced = useReducedMotion();
  const sortedByCorrect = useMemo(
    () => [...TIMELINE_EVENTS].sort((a, b) => a.correctOrder - b.correctOrder),
    [],
  );
  // Initialize with original order to avoid SSR/hydration mismatch; shuffle on mount
  const [items, setItems] = useState(TIMELINE_EVENTS);
  useEffect(() => { setItems(shuffle(TIMELINE_EVENTS)); }, []);
  const [submitted, setSubmitted] = useState(false);
  const [hintTokens, setHintTokens] = useState(2);
  const [guideVisible, setGuideVisible] = useState(false);
  const [timeStart, setTimeStart] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const hintTimeoutRef = useRef<number | null>(null);

  const score = items.filter(
    (item, i) => item.id === sortedByCorrect[i]?.id,
  ).length;
  const perfect = submitted && score === items.length;
  const accuracy = items.length ? Math.round((score / items.length) * 100) : 0;

  const reset = () => {
    setItems(shuffle(TIMELINE_EVENTS));
    setSubmitted(false);
    setHintTokens(2);
    setGuideVisible(false);
    setTimeStart(Date.now());
    setTimeSpent(0);
  };

  useEffect(() => {
    setTimeStart(Date.now());
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        window.clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const showGuide = () => {
    if (hintTokens <= 0) return;
    setHintTokens((t) => t - 1);
    setGuideVisible(true);
    if (hintTimeoutRef.current) {
      window.clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = window.setTimeout(() => {
      setGuideVisible(false);
    }, 5000);
  };

  const submit = () => {
    const start = timeStart ?? Date.now();
    setTimeStart(start);
    setTimeSpent(Date.now() - start);
    setSubmitted(true);
  };


  return (
    <GlassPanel className="p-5 sm:p-7" variant="rich">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold text-parchment">
            Thử thách dòng thời gian
          </h3>
          <p className="mt-1 max-w-md text-sm text-parchment/90">
            Kéo thả để sắp xếp đúng trình tự hành trình. Nhấn “Nộp bài” để xem
            điểm.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="subtle"
            onClick={showGuide}
            disabled={hintTokens <= 0}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Gợi ý {hintTokens}/2
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Xáo trộn
          </Button>
          <Button type="button" onClick={submit}>
            Nộp bài
          </Button>
        </div>
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        className="mt-6 space-y-3"
      >
        {items.map((item) => (
          <Reorder.Item key={item.id} value={item}>
            <motion.div
              layout={!reduced}
              className="cursor-grab rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-parchment active:cursor-grabbing sm:text-[15px]"
            >
              {item.label}
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-parchment/80">
        <span>
          Đúng tạm thời: {score}/{items.length}
        </span>
        {submitted ? (
          <span className="inline-flex items-center gap-1">
            <Timer className="h-3.5 w-3.5 text-gold" aria-hidden />
            {Math.max(1, Math.round(timeSpent / 1000))}s
          </span>
        ) : (
          <span className="text-parchment-muted/70">Gợi ý để xem trật tự chuẩn</span>
        )}
      </div>

      {guideVisible ? (
        <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-parchment">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/80">
            Gợi ý trật tự chuẩn
          </p>
          <ol className="mt-2 space-y-1 text-xs text-parchment/90">
            {sortedByCorrect.map((item, i) => (
              <li key={item.id}>
                <span className="mr-2 font-semibold text-gold-soft">{i + 1}.</span>
                {item.label}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <AnimatePresence>
        {submitted ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.3 }}
            className="mt-6 space-y-3 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-parchment"
          >
            <div className="flex flex-wrap items-center gap-4">
              {perfect ? (
                <>
                  <Sparkles className="h-5 w-5 text-gold" aria-hidden />
                  <span>Hoàn hảo — bạn đã đọc được nhịp lịch sử.</span>
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 text-gold-soft" aria-hidden />
                  <span>
                    Điểm khớp: {score}/{items.length} — thử lại để thuần thục dòng
                    chảy sự kiện.
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-parchment/90">
              <span>Độ chính xác: {accuracy}%</span>
              <span>
                Thời gian: {Math.max(1, Math.round(timeSpent / 1000))}s
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-parchment/90">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-parchment-muted/70">
                Trật tự chuẩn
              </p>
              <ol className="mt-2 space-y-1">
                {sortedByCorrect.map((item, i) => (
                  <li key={item.id}>
                    <span className="mr-2 font-semibold text-gold-soft">{i + 1}.</span>
                    {item.label}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GlassPanel>
  );
}
