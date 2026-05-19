export type ChapterId =
  | "harbor"
  | "ocean"
  | "arrivals"
  | "watershed"
  | "games"
  | "companion";

// Port IDs — the five arrival cities (departure excluded)
export type PortId =
  | "marseille"
  | "london"
  | "new-york"
  | "paris"
  | "lien-xo";

export interface Atmosphere {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  starOpacity: number;
  horizonColor: string;
  horizonOpacity: number;
  ambientLeft: string;
  ambientRight: string;
  oceanTop: string;
  oceanBase: string;
  fogOpacity: number;
}

// ─── Chapter atmospheres ────────────────────────────────────────────────────

export const ATMOSPHERES: Record<ChapterId, Atmosphere> = {
  harbor: {
    skyTop: "#020509",
    skyMid: "#050c1a",
    skyHorizon: "#09162a",
    starOpacity: 0.95,
    horizonColor: "rgba(196,138,40,0.24)",
    horizonOpacity: 1,
    ambientLeft: "rgba(28,60,44,0.22)",
    ambientRight: "rgba(140,24,24,0.14)",
    oceanTop: "#050f1c",
    oceanBase: "#020509",
    fogOpacity: 0.9,
  },
  ocean: {
    skyTop: "#030710",
    skyMid: "#061428",
    skyHorizon: "#0d2240",
    starOpacity: 0.48,
    horizonColor: "rgba(180,130,60,0.30)",
    horizonOpacity: 1,
    ambientLeft: "rgba(18,55,100,0.26)",
    ambientRight: "rgba(100,70,20,0.12)",
    oceanTop: "#040c1c",
    oceanBase: "#020712",
    fogOpacity: 0.65,
  },
  arrivals: {
    skyTop: "#050810",
    skyMid: "#08101e",
    skyHorizon: "#10182c",
    starOpacity: 0.28,
    horizonColor: "rgba(120,160,200,0.22)",
    horizonOpacity: 1,
    ambientLeft: "rgba(36,72,130,0.24)",
    ambientRight: "rgba(80,60,40,0.12)",
    oceanTop: "#050910",
    oceanBase: "#030610",
    fogOpacity: 0.55,
  },
  watershed: {
    skyTop: "#0c0304",
    skyMid: "#180608",
    skyHorizon: "#22090c",
    starOpacity: 0.10,
    horizonColor: "rgba(194,59,59,0.44)",
    horizonOpacity: 1,
    ambientLeft: "rgba(140,24,24,0.32)",
    ambientRight: "rgba(80,14,20,0.22)",
    oceanTop: "#100406",
    oceanBase: "#070204",
    fogOpacity: 0.78,
  },
  games: {
    skyTop: "#040710",
    skyMid: "#070d1c",
    skyHorizon: "#0b1428",
    starOpacity: 0.42,
    horizonColor: "rgba(196,138,40,0.18)",
    horizonOpacity: 0.80,
    ambientLeft: "rgba(20,48,80,0.18)",
    ambientRight: "rgba(90,72,28,0.10)",
    oceanTop: "#040810",
    oceanBase: "#020608",
    fogOpacity: 0.50,
  },
  companion: {
    skyTop: "#030508",
    skyMid: "#05080e",
    skyHorizon: "#070e18",
    starOpacity: 0.70,
    horizonColor: "rgba(196,138,40,0.12)",
    horizonOpacity: 0.60,
    ambientLeft: "rgba(14,36,72,0.16)",
    ambientRight: "rgba(70,55,22,0.08)",
    oceanTop: "#030610",
    oceanBase: "#020408",
    fogOpacity: 0.45,
  },
};

// ─── Port-specific atmospheres ──────────────────────────────────────────────
// Each port has its own distinct palette — city, era, and emotional tone.

export const PORT_ATMOSPHERES: Record<PortId, Atmosphere> = {
  marseille: {
    // Mediterranean — warm blue dusk, salt air
    skyTop: "#040c18",
    skyMid: "#071a30",
    skyHorizon: "#0e2a48",
    starOpacity: 0.40,
    horizonColor: "rgba(140,190,160,0.26)",
    horizonOpacity: 1,
    ambientLeft: "rgba(26,80,120,0.30)",
    ambientRight: "rgba(100,80,40,0.14)",
    oceanTop: "#060e1e",
    oceanBase: "#030810",
    fogOpacity: 0.58,
  },
  london: {
    // Industrial fog — steel, coal, overcast grey
    skyTop: "#070809",
    skyMid: "#0c0e10",
    skyHorizon: "#111518",
    starOpacity: 0.06,
    horizonColor: "rgba(90,100,110,0.18)",
    horizonOpacity: 0.70,
    ambientLeft: "rgba(36,44,52,0.30)",
    ambientRight: "rgba(50,44,36,0.14)",
    oceanTop: "#080a0c",
    oceanBase: "#050608",
    fogOpacity: 0.95,
  },
  "new-york": {
    // Electric modernity — cold dark blue, few stars
    skyTop: "#04080e",
    skyMid: "#060c1a",
    skyHorizon: "#0a1428",
    starOpacity: 0.18,
    horizonColor: "rgba(70,110,180,0.24)",
    horizonOpacity: 1,
    ambientLeft: "rgba(20,55,120,0.26)",
    ambientRight: "rgba(36,26,80,0.16)",
    oceanTop: "#050810",
    oceanBase: "#030508",
    fogOpacity: 0.48,
  },
  paris: {
    // Warm revolution — amber boulevard, rose-violet dusk
    skyTop: "#090408",
    skyMid: "#140c16",
    skyHorizon: "#1e1220",
    starOpacity: 0.52,
    horizonColor: "rgba(180,110,100,0.30)",
    horizonOpacity: 1,
    ambientLeft: "rgba(80,36,80,0.24)",
    ambientRight: "rgba(180,72,52,0.16)",
    oceanTop: "#0c0810",
    oceanBase: "#060408",
    fogOpacity: 0.55,
  },
  "lien-xo": {
    // Revolutionary winter — stark crimson against cold dark
    skyTop: "#0a0304",
    skyMid: "#180608",
    skyHorizon: "#22090c",
    starOpacity: 0.18,
    horizonColor: "rgba(194,59,59,0.46)",
    horizonOpacity: 1,
    ambientLeft: "rgba(140,24,24,0.36)",
    ambientRight: "rgba(60,10,10,0.24)",
    oceanTop: "#0e0606",
    oceanBase: "#060204",
    fogOpacity: 0.80,
  },
};
