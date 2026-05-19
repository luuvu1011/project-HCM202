import type { LocationId } from "@/types/voyage";
import type { ShipState } from "@/hooks/useScrollShip";

// ─── Port sequence ────────────────────────────────────────────────────────────

export const JOURNEY_PORTS: LocationId[] = [
  "ben-nha-rong",
  "marseille",
  "new-york",
  "london",
  "paris",
  "lien-xo",
  "quang-chau",
];

export const N_LEGS = JOURNEY_PORTS.length - 1; // 6

// ─── Cinematic timing ─────────────────────────────────────────────────────────

/** Seconds the ship travels between ports */
export const LEG_DURATION_SEC = 9;

// ─── Ship waypoints (coordinates in % of viewport: x = vw, y = vh) ───────────
// Values sourced from existing VoyageShip PORT_MARKERS + useScrollShip PORT_POSITIONS

const WAYPOINTS: Record<LocationId, Omit<ShipState, "opacity">> = {
  "ben-nha-rong": { x: 68, y: 55, rotation: -4, scale: 1.00, routeProgress: 0.00 },
  marseille:      { x: 60, y: 50, rotation: -6, scale: 0.82, routeProgress: 0.17 },
  "new-york":     { x: 37, y: 51, rotation: -7, scale: 0.68, routeProgress: 0.33 },
  london:         { x: 52, y: 47, rotation: -4, scale: 0.75, routeProgress: 0.50 },
  paris:          { x: 30, y: 47, rotation: -4, scale: 0.62, routeProgress: 0.67 },
  "lien-xo":      { x: 22, y: 44, rotation:  0, scale: 0.55, routeProgress: 0.83 },
  "quang-chau":   { x: 30, y: 48, rotation: -2, scale: 0.58, routeProgress: 1.00 },
};

// ─── Interpolation helpers ────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ─── Ship state computers ─────────────────────────────────────────────────────

/**
 * Ship state while traveling from JOURNEY_PORTS[fromIndex] toward [fromIndex+1].
 * legProgress: 0 = just departed, 1 = about to dock.
 */
export function computeShipState(fromIndex: number, legProgress: number): ShipState {
  const fromId = JOURNEY_PORTS[fromIndex];
  const toId   = JOURNEY_PORTS[fromIndex + 1];

  if (!fromId || !toId) return dockedShipState(JOURNEY_PORTS.length - 1);

  const from = WAYPOINTS[fromId];
  const to   = WAYPOINTS[toId];
  const t    = easeInOut(legProgress);

  return {
    x:             lerp(from.x,             to.x,             t),
    y:             lerp(from.y,             to.y,             t),
    rotation:      lerp(from.rotation,      to.rotation,      t),
    scale:         lerp(from.scale,         to.scale,         t),
    routeProgress: lerp(from.routeProgress, to.routeProgress, t),
    opacity: 1,
  };
}

/** Ship state when docked at a port */
export function dockedShipState(portIndex: number): ShipState {
  const id = JOURNEY_PORTS[Math.min(portIndex, JOURNEY_PORTS.length - 1)];
  if (!id) return { ...WAYPOINTS["quang-chau"], opacity: 1 };
  return { ...WAYPOINTS[id], opacity: 1 };
}
