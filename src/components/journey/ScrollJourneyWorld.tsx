"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { WorldOcean } from "@/components/world/WorldOcean";
import { VoyageShip } from "@/components/world/VoyageShip";
import { DepartureSplash } from "@/components/journey/DepartureSplash";
import { PortNarrative } from "@/components/journey/PortNarrative";
import { useJourneyMachine } from "@/hooks/useJourneyMachine";
import {
  JOURNEY_PORTS,
  computeShipState,
  dockedShipState,
} from "@/lib/journeyProgress";
import { ATMOSPHERES, PORT_ATMOSPHERES } from "@/lib/atmospheres";
import type { Atmosphere, PortId } from "@/lib/atmospheres";

export function ScrollJourneyWorld() {
  const journey = useJourneyMachine();

  // ── Ship state (recomputed at 60fps during travel) ─────────────────────────
  const shipState = useMemo(() => {
    const { phase, currentPortIndex, legProgress } = journey;

    if (phase === "idle") {
      return { ...dockedShipState(0), opacity: 0 };
    }
    if (phase === "departing") {
      // VoyageShip has transition: "opacity 1.5s ease" — 0→1 gives cinematic fade-in
      return { ...dockedShipState(0), opacity: 1 };
    }
    if (phase === "traveling") {
      return computeShipState(currentPortIndex, legProgress);
    }
    if (phase === "completed") {
      return dockedShipState(JOURNEY_PORTS.length - 1);
    }
    // docked / waitingForContinue
    return dockedShipState(currentPortIndex);
  }, [journey]);

  // ── Atmosphere (changes at each port) ──────────────────────────────────────
  const atmosphere: Atmosphere = useMemo(() => {
    const { phase, currentPortIndex } = journey;

    if (phase === "idle" || phase === "departing") {
      return ATMOSPHERES["harbor"];
    }
    if (phase === "completed") {
      return ATMOSPHERES["watershed"];
    }

    const portId = JOURNEY_PORTS[currentPortIndex] as PortId | "ben-nha-rong";

    if (phase === "docked" || phase === "waitingForContinue") {
      if (portId !== "ben-nha-rong" && PORT_ATMOSPHERES[portId as PortId]) {
        return PORT_ATMOSPHERES[portId as PortId];
      }
      return ATMOSPHERES["harbor"];
    }

    // traveling: use the atmosphere of the port we're sailing toward
    const nextId = JOURNEY_PORTS[currentPortIndex + 1] as PortId | undefined;
    if (nextId && PORT_ATMOSPHERES[nextId]) {
      return PORT_ATMOSPHERES[nextId];
    }
    return ATMOSPHERES["ocean"];
  }, [journey]);

  const showNarrative =
    journey.phase === "docked" || journey.phase === "waitingForContinue";
  const journeyActive = journey.phase !== "completed";

  return (
    <>
      {/* ── World layers — fade out on journey completion ─────────────── */}
      {/*
       * Using AnimatePresence with opacity exit only.
       * opacity < 1 does NOT create a containing block for fixed descendants,
       * so WorldOcean / VoyageShip (both fixed) keep their correct positioning
       * throughout the fade-out animation.
       */}
      <AnimatePresence>
        {journeyActive && (
          <motion.div
            key="journey-world"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <WorldOcean atmosphere={atmosphere} />
            <VoyageShip state={shipState} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Click blocker — prevents interaction with app content beneath ─ */}
      {/*
       * Fixed, between world (z-[1]) and overlays (z-[30]).
       * Blocks pointer events to GamesSection etc. during the journey.
       */}
      {journeyActive && (
        <div className="pointer-events-auto fixed inset-0 z-[2]" aria-hidden />
      )}

      {/* ── Journey overlays ────────────────────────────────────────────── */}
      <DepartureSplash phase={journey.phase} onStart={journey.startJourney} />

      {showNarrative && (
        <PortNarrative
          portId={journey.currentPortId}
          phase={journey.phase}
          onContinue={journey.continueJourney}
        />
      )}
    </>
  );
}
