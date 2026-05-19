"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import type { LocationId } from "@/types/voyage";

const sorted = [...VOYAGE_LOCATIONS].sort((a, b) => a.order - b.order);
export const VOYAGE_ORDERED_IDS = sorted.map((l) => l.id) as LocationId[];

/** Ship sail duration in cinematic mode (ms) */
export const VOYAGE_LEG_MS = 6800;
/** Reading time at each port before auto-advance (ms) */
export const VOYAGE_DOCK_MS = 5200;
/** Harbor beat at Bến Nhà Rồng before first departure (ms) */
export const VOYAGE_HARBOR_MS = 4200;

export function useVoyageSequence() {
  const [voyageStarted, setVoyageStarted] = useState(false);
  const [reportLegComplete, setReportLegComplete] = useState(false);
  const [selectedId, setSelectedId] = useState<LocationId>("ben-nha-rong");
  const [paused, setPaused] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [arrivalEpoch, setArrivalEpoch] = useState(0);
  const timersRef = useRef<number[]>([]);
  const previousPaused = useRef(paused);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const scheduleAdvanceFrom = useCallback(
    (fromId: LocationId, delayMs: number) => {
      clearTimers();
      const idx = VOYAGE_ORDERED_IDS.indexOf(fromId);
      if (idx < 0 || idx >= VOYAGE_ORDERED_IDS.length - 1) return;

      const nextId = VOYAGE_ORDERED_IDS[idx + 1]!;
      const timer = window.setTimeout(() => {
        setSelectedId(nextId);
        setReportLegComplete(false);
      }, delayMs);

      timersRef.current.push(timer);
    },
    [clearTimers],
  );

  const beginVoyage = useCallback(() => {
    clearTimers();
    setVoyageStarted(true);
    setPaused(false);
    setAutoAdvance(true);
    setReportLegComplete(false);
    setSelectedId("ben-nha-rong");
    scheduleAdvanceFrom("ben-nha-rong", VOYAGE_HARBOR_MS);
  }, [clearTimers, scheduleAdvanceFrom]);

  const replay = useCallback(() => {
    beginVoyage();
  }, [beginVoyage]);

  const selectLocation = useCallback(
    (id: LocationId) => {
      clearTimers();
      if (voyageStarted) setAutoAdvance(false);
      setSelectedId(id);
      if (voyageStarted) setReportLegComplete(false);
    },
    [clearTimers, voyageStarted],
  );

  const skipToNext = useCallback(() => {
    const idx = VOYAGE_ORDERED_IDS.indexOf(selectedId);
    if (idx < 0 || idx >= VOYAGE_ORDERED_IDS.length - 1) return;
    clearTimers();
    setSelectedId(VOYAGE_ORDERED_IDS[idx + 1]!);
    setReportLegComplete(false);
  }, [selectedId, clearTimers]);

  const onLegAnimationComplete = useCallback(() => {
    setArrivalEpoch((e) => e + 1);
    setReportLegComplete(true);
    if (!voyageStarted || paused || !autoAdvance) return;
    scheduleAdvanceFrom(selectedId, VOYAGE_DOCK_MS);
  }, [
    voyageStarted,
    paused,
    autoAdvance,
    selectedId,
    scheduleAdvanceFrom,
  ]);

  useEffect(() => {
    const wasPaused = previousPaused.current;
    previousPaused.current = paused;

    if (!wasPaused || paused) return;
    if (!voyageStarted || !autoAdvance || !reportLegComplete) return;

    scheduleAdvanceFrom(selectedId, VOYAGE_DOCK_MS);
  }, [paused, voyageStarted, autoAdvance, reportLegComplete, selectedId, scheduleAdvanceFrom]);

  const togglePause = useCallback(() => {
    setPaused((was) => {
      if (!was) clearTimers();
      return !was;
    });
  }, [clearTimers]);

  return {
    voyageStarted,
    reportLegComplete: voyageStarted && reportLegComplete,
    selectedId,
    paused,
    autoAdvance,
    setAutoAdvance,
    arrivalEpoch,
    beginVoyage,
    replay,
    selectLocation,
    skipToNext,
    onLegAnimationComplete,
    togglePause,
  };
}