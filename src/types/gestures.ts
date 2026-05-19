// Gesture kinds — old set kept for back-compat with WatershedMoment + useGestureBridge.
// New names map: "special" === "openHand" cho ripple light effect.
export type GestureKind =
  | "heart"
  | "thumbsUp"
  | "wave"
  | "special";

export interface GestureEffectPayload {
  kind: GestureKind;
  /** 0–1 confidence from rule-based classifier (optional) */
  confidence?: number;
  /** Normalized screen position 0–1 (optional, for positional effects) */
  at?: { x: number; y: number };
}

export type GestureListener = (payload: GestureEffectPayload) => void;

// ─── MediaPipe landmark types ────────────────────────────────────────────────
// 21 landmarks per hand, indexed by MediaPipe spec.
// 0=wrist, 1-4=thumb, 5-8=index, 9-12=middle, 13-16=ring, 17-20=pinky
export interface HandLandmark {
  x: number; // normalized 0-1, left-right of image
  y: number; // normalized 0-1, top-bottom
  z: number; // depth, smaller = closer to camera
}

export type HandLandmarks = HandLandmark[]; // length 21

export interface HandFrame {
  landmarks: HandLandmarks[];           // up to 2 hands
  handedness: ("Left" | "Right")[];     // matched 1:1 with landmarks
  timestamp: number;
}
