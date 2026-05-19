"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Flame, RefreshCw, Shuffle, Timer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cinematicEase } from "@/animations/transitions";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Pair {
  id: string;
  country: string;
  era: string;
  event: string;
}

const PAIRS: Pair[] = [
  {
    id: "fr",
    country: "Pháp",
    era: "1911–1923",
    event: "Đọc Luận cương của Lênin — tìm ra con đường cách mạng vô sản",
  },
  {
    id: "uk",
    country: "Anh",
    era: "1913",
    event: "Quan sát hệ thống thuộc địa và phong trào công nhân",
  },
  {
    id: "us",
    country: "Mỹ",
    era: "1912",
    event: "Tiếp xúc tinh thần Tuyên ngôn Độc lập, nhận ra mâu thuẫn tư bản",
  },
  {
    id: "su",
    country: "Liên Xô",
    era: "1923–1924",
    event: "Dự Đại hội V Quốc tế Cộng sản, học lý luận Mác–Lênin",
  },
  {
    id: "cn",
    country: "Trung Quốc",
    era: "1924–1927",
    event: "Thành lập Hội Việt Nam Cách mạng Thanh niên, đào tạo cán bộ",
  },
];

const TIME_LIMIT = 60;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MatchingGame() {
  const reduced = useReducedMotion();
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [matched,     setMatched]     = useState<Set<string>>(new Set());
  const [wrongFlash,  setWrongFlash]  = useState<string | null>(null);
  const [wrongCount,  setWrongCount]  = useState(0);
  const [shuffledRight, setShuffledRight] = useState<Pair[]>(PAIRS);
  const [phase, setPhase] = useState<"play" | "result">("play");
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Shuffle only on the client AFTER hydration — Math.random() would mismatch SSR.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShuffledRight(shuffle(PAIRS));
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    setTimeLeft(TIME_LIMIT);
    let remaining = TIME_LIMIT;
    const id = window.setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        setSelectedId(null);
        setPhase("result");
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, round]);

  const completed = matched.size === PAIRS.length;
  const score = Math.max(0, matched.size * 120 + timeLeft * 3 - wrongCount * 10);
  const progress = Math.round((matched.size / PAIRS.length) * 100);

  const reset = useCallback(() => {
    setSelectedId(null);
    setMatched(new Set());
    setWrongFlash(null);
    setWrongCount(0);
    setPhase("play");
    setRound((r) => r + 1);
    setTimeLeft(TIME_LIMIT);
    setStreak(0);
    setBestStreak(0);
    setShuffledRight(shuffle(PAIRS));
  }, []);

  const handleCountry = (id: string) => {
    if (phase !== "play") return;
    if (matched.has(id)) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleEvent = (id: string) => {
    if (phase !== "play") return;
    if (matched.has(id)) return;
    if (!selectedId)     return;

    if (selectedId === id) {
      setMatched((prev) => new Set([...prev, id]));
      setSelectedId(null);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setWrongCount((c) => c + 1);
      setWrongFlash(id);
      setStreak(0);
      setSelectedId(null);
      setTimeout(() => setWrongFlash(null), 600);
    }
  };

  useEffect(() => {
    if (completed && phase === "play") {
      setPhase("result");
    }
  }, [completed, phase]);

  const countryCardClass = (id: string): string => {
    if (matched.has(id))    return "border-gold/60 bg-gold/15 text-parchment";
    if (selectedId === id)  return "border-gold/55 bg-gold/10 text-parchment scale-[1.02]";
    return "border-white/10 bg-white/[0.04] text-parchment-muted hover:border-gold/30 hover:text-parchment cursor-pointer";
  };

  const eventCardClass = (id: string): string => {
    if (matched.has(id))   return "border-gold/60 bg-gold/15 text-parchment";
    if (wrongFlash === id) return "border-red-accent/60 bg-red-accent/10 text-parchment-muted";
    const isTarget = selectedId !== null && !matched.has(selectedId);
    return `${isTarget ? "border-gold/25 hover:border-gold/50 hover:bg-gold/8" : "border-white/10 hover:border-white/20"} bg-white/[0.04] text-parchment-muted hover:text-parchment cursor-pointer`;
  };

  return (
    <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold/80">
            Trò chơi ghép đôi
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-parchment sm:text-2xl">
            Ghép quốc gia với sự kiện lịch sử
          </h3>
          <p className="mt-1 text-xs text-parchment-muted/70">
            Chọn một quốc gia ở bên trái, rồi chọn sự kiện tương ứng ở bên phải.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-parchment-muted/75 transition-colors hover:border-gold/30 hover:text-parchment"
        >
          <RefreshCw className="h-3 w-3" aria-hidden />
          Chơi lại
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-parchment/80">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
          <Timer className="h-3.5 w-3.5 text-gold" aria-hidden />
          {timeLeft}s
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-gold-soft">
          <Flame className="h-3.5 w-3.5" aria-hidden />
          Chuỗi {streak}
        </span>
        <span className="text-parchment-muted/75">
          Đã ghép: {matched.size}/{PAIRS.length}
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-gold/60" style={{ width: `${progress}%` }} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* Left — countries */}
        <div className="space-y-2">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-parchment-muted/50">
            Quốc gia
          </p>
          {PAIRS.map((pair) => (
            <motion.button
              key={pair.id}
              type="button"
              onClick={() => handleCountry(pair.id)}
              disabled={matched.has(pair.id)}
              whileTap={!reduced && !matched.has(pair.id) ? { scale: 0.98 } : undefined}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 ${countryCardClass(pair.id)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold leading-tight">{pair.country}</p>
                  <p className="mt-0.5 text-[11px] text-parchment-muted/60">{pair.era}</p>
                </div>
                {matched.has(pair.id) && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" aria-label="Đã ghép đúng" />
                )}
                {selectedId === pair.id && !matched.has(pair.id) && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gold/80">
                    Đã chọn
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right — events (shuffled) */}
        <div className="space-y-2">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-parchment-muted/50">
            Sự kiện lịch sử
          </p>
          {shuffledRight.map((pair) => (
            <AnimatePresence key={pair.id} mode="wait">
              <motion.button
                key={`${pair.id}-${wrongFlash === pair.id}`}
                type="button"
                onClick={() => handleEvent(pair.id)}
                disabled={matched.has(pair.id)}
                whileTap={!reduced && !matched.has(pair.id) ? { scale: 0.98 } : undefined}
                initial={wrongFlash === pair.id ? { x: -8 } : undefined}
                animate={wrongFlash === pair.id ? { x: [0, -6, 5, -4, 0] } : { x: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.35 }}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 ${eventCardClass(pair.id)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-snug">{pair.event}</p>
                  {matched.has(pair.id) && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-label="Đã ghép đúng" />
                  )}
                </div>
              </motion.button>
            </AnimatePresence>
          ))}
        </div>
      </div>

      {/* Score / completion */}
      <AnimatePresence>
        {phase === "result" && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, ease: cinematicEase }}
            className="mt-6 rounded-2xl border border-gold/30 bg-gold/[0.07] px-5 py-4 text-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-gold/80">
              {completed ? "Hoàn thành" : "Hết giờ"}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-parchment">
              {score} điểm
            </p>
            <p className="mt-2 text-xs text-parchment-muted/70">
              {completed
                ? wrongCount === 0
                  ? "Xuất sắc! Bạn ghép đúng tất cả ngay lần đầu."
                  : `Số lần sai: ${wrongCount}. Hãy thử lại để đạt điểm cao hơn.`
                : `Bạn đã ghép đúng ${matched.size}/${PAIRS.length}.`}
            </p>
            <p className="mt-2 text-xs text-parchment-muted/70">
              Chuỗi cao nhất: {bestStreak}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={reset}
              className="mt-4 gap-2 text-sm"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden />
              Thử lại
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live hint when a country is selected */}
      <AnimatePresence>
        {selectedId && !completed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-xs text-gold/70"
          >
            Đã chọn <strong className="text-parchment">
              {PAIRS.find((p) => p.id === selectedId)?.country}
            </strong> — hãy chọn sự kiện tương ứng ở bên phải.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
