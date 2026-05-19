"use client";

import { useMemo } from "react";
import type { PortId } from "@/lib/atmospheres";
import type { ChapterProgress } from "@/hooks/useChapterProgress";
import type { ChapterId } from "@/lib/atmospheres";

export interface ShipState {
  /** Left edge of viewport, 0–100 vw */
  x: number;
  /** From top of viewport, 0–100 vh */
  y: number;
  /** Degrees. 0 = bow points left. Negative = bow tilts up. */
  rotation: number;
  /** 0–1 overall ship opacity */
  opacity: number;
  /** Multiplier applied to the base SVG size */
  scale: number;
  /** 0–1 how much of the route trail to reveal */
  routeProgress: number;
}

interface Anchor {
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  scale: number;
  routeProgress: number;
}

// ─── Chapter-level anchors (used outside arrivals) ─────────────────────────
const CHAPTER_ANCHORS: Record<ChapterId, { start: Anchor; end: Anchor }> = {
  harbor: {
    start: { x: 68, y: 55, rotation: -4,  opacity: 1,    scale: 1.00, routeProgress: 0.00 },
    end:   { x: 64, y: 53, rotation: -7,  opacity: 1,    scale: 0.95, routeProgress: 0.06 },
  },
  ocean: {
    start: { x: 64, y: 53, rotation: -14, opacity: 1,    scale: 0.88, routeProgress: 0.06 },
    end:   { x: 60, y: 50, rotation: -10, opacity: 1,    scale: 0.82, routeProgress: 0.18 },
  },
  arrivals: {
    // Fallback when portId is not yet resolved
    start: { x: 60, y: 50, rotation: -8,  opacity: 1,    scale: 0.82, routeProgress: 0.18 },
    end:   { x: 22, y: 44, rotation: -3,  opacity: 1,    scale: 0.55, routeProgress: 1.00 },
  },
  watershed: {
    start: { x: 22, y: 44, rotation: -3,  opacity: 1.00, scale: 0.55, routeProgress: 1 },
    end:   { x: 20, y: 43, rotation:  0,  opacity: 0.22, scale: 0.52, routeProgress: 1 },
  },
  games: {
    start: { x: 20, y: 43, rotation: 0, opacity: 0, scale: 0.52, routeProgress: 1 },
    end:   { x: 20, y: 43, rotation: 0, opacity: 0, scale: 0.52, routeProgress: 1 },
  },
  companion: {
    start: { x: 20, y: 43, rotation: 0, opacity: 0, scale: 0.52, routeProgress: 1 },
    end:   { x: 20, y: 43, rotation: 0, opacity: 0, scale: 0.52, routeProgress: 1 },
  },
};

// ─── Per-port ship positions (snap-to during arrivals) ─────────────────────
// Coordinates match the route trail waypoints in VoyageShip.tsx exactly.
const PORT_POSITIONS: Record<PortId, Anchor> = {
  marseille: { x: 60, y: 50, rotation: -6,  opacity: 1, scale: 0.82, routeProgress: 0.20 },
  london:    { x: 52, y: 47, rotation: -4,  opacity: 1, scale: 0.75, routeProgress: 0.36 },
  "new-york":{ x: 37, y: 51, rotation: -7,  opacity: 1, scale: 0.68, routeProgress: 0.58 },
  paris:     { x: 30, y: 47, rotation: -4,  opacity: 1, scale: 0.62, routeProgress: 0.75 },
  "lien-xo": { x: 22, y: 44, rotation:  0,  opacity: 1, scale: 0.55, routeProgress: 1.00 },
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function useScrollShip({
  chapterId,
  progress,
  scrollY,
  portId,
}: ChapterProgress): ShipState {
  return useMemo(() => {
    // ── Port-snapped position during arrivals ────────────────────────────────
    if (chapterId === "arrivals" && portId && PORT_POSITIONS[portId]) {
      const pos = PORT_POSITIONS[portId];
      // Gentle swell even when docked
      const swell = Math.sin(scrollY * 0.011) * 0.8;
      return { ...pos, y: pos.y + swell };
    }

    // ── Chapter-level interpolation ──────────────────────────────────────────
    const { start, end } = CHAPTER_ANCHORS[chapterId];
    const t = easeInOut(progress);

    const x = lerp(start.x, end.x, t);
    const baseY = lerp(start.y, end.y, t);

    // Atlantic arc: sinusoidal dip during the ocean chapter
    const atlanticDip =
      chapterId === "ocean" ? Math.sin(progress * Math.PI) * 5.5 : 0;
    // Continuous swell (cosmetic, no dep on scrollY in memo)
    const swell = Math.sin(scrollY * 0.011) * 1.0;
    const y = baseY + atlanticDip + swell;

    return {
      x,
      y,
      rotation:      lerp(start.rotation,      end.rotation,      t),
      opacity:       lerp(start.opacity,        end.opacity,        progress),
      scale:         lerp(start.scale,          end.scale,          t),
      routeProgress: lerp(start.routeProgress,  end.routeProgress,  t),
    };
  // scrollY excluded: swell is purely cosmetic; re-deriving on chapter/progress
  // change is enough. Including scrollY would cause excessive re-renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, progress, portId]);
}
