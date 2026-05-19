"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  JOURNEY_PORTS,
  N_LEGS,
  LEG_DURATION_SEC,
} from "@/lib/journeyProgress";
import type { LocationId } from "@/types/voyage";

export type JourneyPhase =
  | "idle"               // Splash screen
  | "departing"          // Ship reveal (1.6s cinematic beat)
  | "traveling"          // GSAP drives ship — zero text/UI
  | "docked"             // Arrival flash (0.8s)
  | "waitingForContinue" // Full narrative shown — user gates progression
  | "completed";         // All ports visited

export interface JourneyMachineResult {
  phase: JourneyPhase;
  currentPortIndex: number;
  currentPortId: LocationId;
  legProgress: number;  // 0–1 within the active travel leg (GSAP-driven)
  startJourney: () => void;
  continueJourney: () => void;
}

export function useJourneyMachine(): JourneyMachineResult {
  const [phase,       setPhase]       = useState<JourneyPhase>("idle");
  const [portIndex,   setPortIndex]   = useState(0);
  const [legProgress, setLegProgress] = useState(0);

  // Refs — always current inside callbacks and GSAP handlers
  const phaseRef   = useRef<JourneyPhase>("idle");
  const portRef    = useRef(0);
  const tweenRef   = useRef<gsap.core.Tween | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressObj = useRef({ value: 0 });

  const setPhaseSync = useCallback((p: JourneyPhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const setPortSync = useCallback((i: number) => {
    portRef.current = i;
    setPortIndex(i);
  }, []);

  // ── Scroll lock: overflow hidden during entire journey ────────────────────
  useEffect(() => {
    document.documentElement.style.overflow =
      phase === "completed" ? "" : "hidden";
  }, [phase]);

  // ── Internal: start one travel leg ────────────────────────────────────────
  const startLeg = useCallback(
    (fromPort: number) => {
      // Kill any running tween
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }

      progressObj.current.value = 0;
      setLegProgress(0);

      tweenRef.current = gsap.to(progressObj.current, {
        value: 1,
        duration: LEG_DURATION_SEC,
        ease: "none", // easeInOut applied in computeShipState
        onUpdate() {
          setLegProgress(progressObj.current.value);
        },
        onComplete() {
          // Dock at the arrival port
          const nextPort = fromPort + 1;
          setPortSync(nextPort);
          setPhaseSync("docked");

          if (timerRef.current !== null) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            if (phaseRef.current === "docked") {
              setPhaseSync("waitingForContinue");
            }
          }, 800);
        },
      });
    },
    [setPhaseSync, setPortSync],
  );

  // ── startJourney ──────────────────────────────────────────────────────────
  const startJourney = useCallback(() => {
    setPortSync(0);
    setLegProgress(0);
    setPhaseSync("departing");

    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPhaseSync("traveling");
      startLeg(0);
    }, 1600);
  }, [setPhaseSync, setPortSync, startLeg]);

  // ── continueJourney ───────────────────────────────────────────────────────
  const continueJourney = useCallback(() => {
    if (phaseRef.current !== "waitingForContinue") return;

    const currentPort = portRef.current;

    if (currentPort >= JOURNEY_PORTS.length - 1) {
      // Last port — complete journey
      document.documentElement.style.overflow = "";
      setPhaseSync("completed");
      return;
    }

    // Resume travel from the current (docked) port
    setPhaseSync("traveling");
    startLeg(currentPort);
  }, [setPhaseSync, startLeg]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return {
    phase,
    currentPortIndex: portIndex,
    currentPortId: JOURNEY_PORTS[portIndex] as LocationId,
    legProgress,
    startJourney,
    continueJourney,
  };
}
