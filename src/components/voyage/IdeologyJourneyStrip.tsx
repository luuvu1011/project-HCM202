"use client";

import { motion } from "framer-motion";
import { VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import type { LocationId } from "@/types/voyage";

const sorted = [...VOYAGE_LOCATIONS].sort((a, b) => a.order - b.order);

/** Short map labels for the strip */
const shortLabel: Record<LocationId, string> = {
  "ben-nha-rong": "Bến Nhà Rồng",
  marseille: "Marseille",
  london: "London",
  "new-york": "New York",
  paris: "Paris",
  "lien-xo": "Liên Xô",
  "quang-chau": "Quảng Châu",
};

export function IdeologyJourneyStrip({
  selectedId,
  onSelect,
}: {
  selectedId: LocationId;
  onSelect: (id: LocationId) => void;
}) {
  return (
    <div className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/90">
          Dòng tiến của nhận thức
        </p>
        <span className="text-[10px] text-parchment-muted/90 sm:text-xs">
          Chọn điểm — đồng bộ với bản đồ
        </span>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {sorted.map((loc, i) => {
          const active = loc.id === selectedId;
          return (
            <motion.button
              key={loc.id}
              type="button"
              onClick={() => onSelect(loc.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex min-w-[7.5rem] shrink-0 flex-col rounded-xl border px-3 py-2 text-left transition-colors sm:min-w-0 ${
                active
                  ? "border-gold/50 bg-gold/10 text-parchment"
                  : "border-white/10 bg-ocean-deep/40 text-parchment-muted hover:border-gold/25 hover:text-parchment"
              }`}
            >
              <span className="text-[10px] font-medium text-gold/70">
                Bước {i + 1}
              </span>
              <span className="mt-0.5 text-xs font-semibold leading-tight sm:text-sm">
                {shortLabel[loc.id]}
              </span>
              {active ? (
                <motion.span
                  layoutId="strip-active"
                  className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
