"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Anchor,
  BookMarked,
  Compass,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { cinematicEase } from "@/animations/transitions";
import { VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LocationId, VoyageLocation } from "@/types/voyage";

const blocks: {
  key: keyof Pick<
    VoyageLocation,
    | "historicalContext"
    | "experienced"
    | "ideologicalEvolution"
    | "significance"
  >;
  label: string;
  icon: typeof BookMarked;
}[] = [
  {
    key: "historicalContext",
    label: "Bối cảnh lịch sử",
    icon: BookMarked,
  },
  {
    key: "experienced",
    label: "Nguyễn Tất Thành đã trải qua",
    icon: Anchor,
  },
  {
    key: "ideologicalEvolution",
    label: "Thức tỉnh & chuyển hóa tư tưởng",
    icon: Lightbulb,
  },
  {
    key: "significance",
    label: "Ý nghĩa lịch sử — học thuật",
    icon: Sparkles,
  },
];

export function LocationInfoPanel({
  locationId,
  arrivalEpoch = 0,
}: {
  locationId: LocationId;
  arrivalEpoch?: number;
}) {
  const loc = VOYAGE_LOCATIONS.find((l) => l.id === locationId);
  const reduced = useReducedMotion();

  const baseDelay = reduced ? 0 : 0.18;
  const stepDelay = reduced ? 0 : 0.1;
  const buildTransition = (delay: number, duration: number) => ({
    duration: reduced ? 0.3 : duration,
    ease: cinematicEase,
    delay: reduced ? 0 : delay,
  });

  return (
    <AnimatePresence mode="wait">
      {loc ? (
        <motion.div
          key={`${loc.id}-${arrivalEpoch}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={buildTransition(0, 0.7)}
          className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4 sm:px-6"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-ocean-deep/70 px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={buildTransition(baseDelay, 0.5)}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/90">
                <Compass className="h-3.5 w-3.5" aria-hidden />
                Ghi chép tại {loc.name}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-parchment-muted/80">
                Bước {loc.order}/6
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={buildTransition(baseDelay + stepDelay, 0.55)}
              className="mt-2 font-display text-base italic leading-relaxed text-parchment sm:text-lg"
            >
              {loc.atmosphere}
            </motion.p>
            <div className="mt-3 grid gap-2 text-[12px] leading-relaxed text-parchment-muted sm:text-[13px]">
              {blocks.map(({ key, label, icon: Icon }, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={buildTransition(baseDelay + stepDelay * (index + 2), 0.5)}
                  className="flex items-start gap-2"
                >
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-soft" aria-hidden />
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/80">
                      {label}
                    </span>
                    <p className="mt-1 text-[12px] leading-relaxed text-parchment-muted sm:text-[13px]">
                      {loc[key]}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
