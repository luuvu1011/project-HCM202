"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cinematicEase } from "@/animations/transitions";
import { VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LocationId } from "@/types/voyage";

export function VoyageArrivalOverlay({
  locationId,
  epoch,
  active,
}: {
  locationId: LocationId;
  epoch: number;
  active: boolean;
}) {
  const loc = VOYAGE_LOCATIONS.find((l) => l.id === locationId);
  const reduced = useReducedMotion();
  if (!loc || !active) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${locationId}-${epoch}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: cinematicEase }}
        className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-3 sm:px-5"
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(5,15,31,0.65),transparent_62%)]"
          animate={reduced ? undefined : { opacity: [0.45, 0.7, 0.5] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -left-1/3 top-[12%] h-24 w-[160%] rounded-full bg-parchment/[0.05] blur-2xl"
          animate={
            reduced
              ? undefined
              : { x: ["-12%", "6%", "-12%"], opacity: [0.15, 0.35, 0.2] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,168,83,0.18),transparent_70%)]"
          animate={reduced ? undefined : { opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.985 }}
          transition={{ duration: 0.8, ease: cinematicEase, delay: 0.08 }}
          className="relative max-w-lg rounded-2xl border border-white/15 bg-ocean-deep/80 px-4 py-3 text-center shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-6 sm:py-4"
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/90">
            Cập bến — {loc.name}
          </p>
          <p className="mt-2 font-display text-lg italic leading-snug text-parchment sm:text-xl">
            {loc.atmosphere}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-parchment-muted sm:text-sm">
            {loc.arrivalNarration}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
