"use client";

import { motion } from "framer-motion";
import {
  CirclePlay,
  Pause,
  Play,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VoyagePlaybackControls({
  visible,
  paused,
  autoAdvance,
  onTogglePause,
  onReplay,
  onSkipNext,
  onAutoChange,
  disableSkipNext,
}: {
  visible: boolean;
  paused: boolean;
  autoAdvance: boolean;
  onTogglePause: () => void;
  onReplay: () => void;
  onSkipNext: () => void;
  onAutoChange: (next: boolean) => void;
  disableSkipNext?: boolean;
}) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-between"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="ghost"
          className="gap-2 px-4 py-2 text-xs sm:text-sm"
          onClick={onTogglePause}
        >
          {paused ? (
            <Play className="h-4 w-4" aria-hidden />
          ) : (
            <Pause className="h-4 w-4" aria-hidden />
          )}
          {paused ? "Tiếp tục" : "Tạm dừng"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="gap-2 px-4 py-2 text-xs sm:text-sm"
          disabled={disableSkipNext}
          onClick={onSkipNext}
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          Bước tiếp
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="gap-2 px-4 py-2 text-xs sm:text-sm"
          onClick={onReplay}
        >
          <CirclePlay className="h-4 w-4" aria-hidden />
          Phát lại
        </Button>
      </div>
      <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-parchment-muted backdrop-blur-sm sm:text-xs">
        <input
          type="checkbox"
          className="accent-gold"
          checked={autoAdvance}
          onChange={(e) => onAutoChange(e.target.checked)}
        />
        <Sparkles className="h-3.5 w-3.5 text-gold/80" aria-hidden />
        Tự động theo lộ trình
      </label>
    </motion.div>
  );
}
