"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Anchor,
  BookMarked,
  Lightbulb,
  Navigation,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cinematicEase } from "@/animations/transitions";
import { VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import { JOURNEY_PORTS } from "@/lib/journeyProgress";
import type { LocationId } from "@/types/voyage";
import type { JourneyPhase } from "@/hooks/useJourneyMachine";

// ─── Port era labels ──────────────────────────────────────────────────────────

const ERA_LABELS: Record<LocationId, string> = {
  "ben-nha-rong": "Điểm khởi hành · 1911",
  marseille:      "Địa Trung Hải · 1911",
  london:         "Sương mù công nghiệp · 1913",
  "new-york":     "Tân Thế Giới · 1912",
  paris:          "Thủ đô tư tưởng · 1917–1923",
  "lien-xo":      "Ngọn đuốc lý luận · 1923–1924",
  "quang-chau":   "Quảng Châu · 1924–1927",
};

// ─── Lesson section ───────────────────────────────────────────────────────────

function LessonSection({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof BookMarked;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-gold-soft" aria-hidden />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/80">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm leading-[1.75] text-parchment-muted sm:text-[15px]">
        {children}
      </p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  portId: LocationId;
  phase: JourneyPhase;
  onContinue: () => void;
}

// ─── PortNarrative ────────────────────────────────────────────────────────────

export function PortNarrative({ portId, phase, onContinue }: Props) {
  const loc = VOYAGE_LOCATIONS.find((l) => l.id === portId);
  if (!loc) return null;

  const portNumber = JOURNEY_PORTS.indexOf(portId);
  const isLastPort = portId === "quang-chau";

  return (
    <AnimatePresence mode="wait">

      {/* ── Arrival flash (docked) ─────────────────────────────────────── */}
      {phase === "docked" && (
        <motion.div
          key={`arrival-${portId}`}
          className="pointer-events-none fixed inset-0 z-[30] flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: cinematicEase }}
        >
          {/* Radial dark veil */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% 52%, rgba(2,5,14,0.72), transparent 72%)",
            }}
          />
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: cinematicEase, delay: 0.1 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.44em] text-gold/70">
              Cập bến
            </p>
            <h2 className="mt-3 font-display text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-[0.96] tracking-tight text-parchment">
              {loc.name}
            </h2>
            <p className="mt-4 font-display text-[clamp(0.95rem,2vw,1.2rem)] italic text-gold-soft/85">
              {loc.atmosphere}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* ── Full narrative (waitingForContinue) ───────────────────────── */}
      {phase === "waitingForContinue" && (
        <motion.div
          key={`narrative-${portId}`}
          className="fixed inset-0 z-[30] flex flex-col overflow-hidden"
          style={{ background: "rgba(4,8,20,0.88)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: cinematicEase } }}
          transition={{ duration: 0.5, ease: cinematicEase }}
        >
          {/* ── Port header ──────────────────────────────────────────────── */}
          <div className="flex-shrink-0 border-b border-white/[0.07] px-6 py-5 backdrop-blur-xl">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold/65">
                  {isLastPort
                    ? "Đích đến cuối"
                    : `Cảng ${portNumber} / ${JOURNEY_PORTS.length - 1}`}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-parchment sm:text-3xl">
                  {loc.name}
                </h2>
                <p className="mt-0.5 text-[11px] text-parchment-muted/65">
                  {ERA_LABELS[portId]}
                </p>
              </div>
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {JOURNEY_PORTS.slice(1).map((id, i) => (
                  <div
                    key={id}
                    className="h-1.5 w-1.5 rounded-full transition-all duration-500"
                    style={{
                      background:
                        i + 1 <= portNumber
                          ? "rgba(196,138,40,0.90)"
                          : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Scrollable lesson content ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <motion.div
              className="mx-auto max-w-2xl px-6 py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: cinematicEase, delay: 0.12 }}
            >
              {/* Atmosphere pull quote */}
              <p className="font-display text-[clamp(1rem,2.2vw,1.25rem)] italic leading-[1.72] text-parchment/90">
                {loc.atmosphere}
              </p>
              <div className="vv-divider" />

              {/* Lesson sections */}
              <LessonSection icon={BookMarked} label="Bối cảnh lịch sử">
                {loc.historicalContext}
              </LessonSection>
              <LessonSection icon={Anchor} label="Chứng kiến & trải nghiệm">
                {loc.experienced}
              </LessonSection>
              <LessonSection icon={Lightbulb} label="Chuyển hóa tư tưởng">
                {loc.ideologicalEvolution}
              </LessonSection>
              <LessonSection icon={Sparkles} label="Ý nghĩa lịch sử">
                {loc.significance}
              </LessonSection>

              <div className="mt-8 border-l-2 border-gold/30 pl-4">
                <p className="font-display text-[15px] italic leading-[1.65] text-gold-soft/85">
                  {loc.arrivalNarration}
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Sticky footer — continue button ──────────────────────────── */}
          <div className="flex-shrink-0 border-t border-white/[0.07] px-6 py-4 backdrop-blur-xl">
            <motion.div
              className="mx-auto flex max-w-2xl items-center justify-between gap-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: cinematicEase, delay: 0.3 }}
            >
              <p className="text-[11px] text-parchment-muted/50">
                {isLastPort
                  ? "Hành trình hoàn thành — tất cả 6 bến đã cập"
                  : `Tiếp theo: ${
                      VOYAGE_LOCATIONS.find(
                        (l) => l.id === JOURNEY_PORTS[portNumber + 1],
                      )?.name ?? ""
                    }`}
              </p>
              <Button
                type="button"
                onClick={onContinue}
                className="flex-shrink-0 gap-2"
              >
                {isLastPort ? (
                  "Hoàn thành hành trình"
                ) : (
                  <>
                    <Navigation className="h-4 w-4" aria-hidden />
                    Tiếp tục hành trình
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
