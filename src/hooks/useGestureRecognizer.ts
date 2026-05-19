"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GestureKind, HandFrame, HandLandmarks } from "@/types/gestures";
import {
  isOpenPalm,
  ruleFist,
  ruleHeart,
  ruleThumbsUp,
  wristX,
} from "@/lib/gestureRules";

const CONFIRM_FRAMES = 2;            // streak ngắn → trigger nhanh
const HOLD_RELEASE_FRAMES = 5;       // ~5 khung không thấy → coi như buông
const WAVE_BUFFER_SIZE = 24;
const WAVE_MIN_CYCLES = 2;
const FIST_STEADY_FRAMES = 3;          // ~0.12s @ 24fps để confirm fist
const FIST_STEADY_THRESHOLD = 0.08;   // cho phép di chuyển nhẹ hơn
const MANUAL_HOLD_MS = 4500;         // bấm nút giữ effect 4.5s
const SAME_KIND_COOLDOWN_MS = 350;   // tránh remount khi flicker cùng kind

// Bật để xem log mỗi khi gesture được nhận diện (debug pipeline).
const DEBUG = false;

export type GestureSource = "live" | "manual";

export interface HeldGesture {
  kind: GestureKind;
  startedAt: number;
  source: GestureSource;
}

export interface GestureRecognizerApi {
  /** Real-time candidate from current frame — dùng cho status pill */
  preview: { kind: GestureKind; confidence: number } | null;
  /** Gesture đang được giữ liên tục (null khi không thấy cử chỉ nào) */
  held: HeldGesture | null;
  /** Bấm nút thủ công — giả lập "giữ cử chỉ" trong MANUAL_HOLD_MS */
  trigger: (kind: GestureKind) => void;
}

interface Candidate {
  kind: GestureKind;
  confidence: number;
}

function pickStrongest(candidates: Candidate[]): Candidate | null {
  let best: Candidate | null = null;
  for (const c of candidates) {
    if (!best || c.confidence > best.confidence) best = c;
  }
  return best && best.confidence > 0.3 ? best : null;
}

function countWaveCycles(buffer: number[]): number {
  if (buffer.length < 4) return 0;
  let dirChanges = 0;
  let prevSign = 0;
  for (let i = 1; i < buffer.length; i++) {
    const dx = buffer[i] - buffer[i - 1];
    if (Math.abs(dx) < 0.005) continue;
    const sign = dx > 0 ? 1 : -1;
    if (prevSign !== 0 && sign !== prevSign) dirChanges++;
    prevSign = sign;
  }
  return Math.floor(dirChanges / 2);
}

function evaluate(
  hands: HandLandmarks[],
  buffers: {
    wave: number[];
    steady: { x: number; y: number }[];
  },
): Candidate | null {
  const heart = ruleHeart(hands);
  if (heart.match) return { kind: "heart", confidence: heart.confidence };

  if (hands.length === 0) return null;
  const lm = hands[0];

  const tu = ruleThumbsUp([lm]);
  const fist = ruleFist([lm]);

  let waveCycles = 0;
  if (isOpenPalm(lm)) {
    buffers.wave.push(wristX(lm));
    if (buffers.wave.length > WAVE_BUFFER_SIZE) buffers.wave.shift();
    waveCycles = countWaveCycles(buffers.wave);
  } else {
    buffers.wave.length = 0;
  }
  const waveMatch = waveCycles >= WAVE_MIN_CYCLES;

  // Fist steady — must hold a closed fist still for N frames
  let fistSteady = false;
  if (fist.match) {
    const w = lm[0];
    buffers.steady.push({ x: w.x, y: w.y });
    if (buffers.steady.length > FIST_STEADY_FRAMES) buffers.steady.shift();
    if (buffers.steady.length >= FIST_STEADY_FRAMES) {
      const xs = buffers.steady.map((p) => p.x);
      const ys = buffers.steady.map((p) => p.y);
      const dx = Math.max(...xs) - Math.min(...xs);
      const dy = Math.max(...ys) - Math.min(...ys);
      fistSteady = dx < FIST_STEADY_THRESHOLD && dy < FIST_STEADY_THRESHOLD;
    }
  } else {
    buffers.steady.length = 0;
  }

  const candidates: Candidate[] = [];
  if (tu.match) candidates.push({ kind: "thumbsUp", confidence: tu.confidence });
  if (waveMatch) {
    candidates.push({
      kind: "wave",
      confidence: Math.min(1, 0.5 + waveCycles * 0.2),
    });
  }
  if (fistSteady && !waveMatch && !tu.match) {
    candidates.push({ kind: "special", confidence: fist.confidence });
  }

  return pickStrongest(candidates);
}

export function useGestureRecognizer(frame: HandFrame | null): GestureRecognizerApi {
  const [preview, setPreview] = useState<Candidate | null>(null);
  const [held, setHeld] = useState<HeldGesture | null>(null);

  const streakRef = useRef<{ kind: GestureKind | null; count: number }>({
    kind: null,
    count: 0,
  });
  const releaseRef = useRef<number>(0);
  const buffersRef = useRef<{ wave: number[]; steady: { x: number; y: number }[] }>({
    wave: [],
    steady: [],
  });
  const previewSnapshotRef = useRef<Candidate | null>(null);
  const heldRef = useRef<HeldGesture | null>(null);
  const lastFireRef = useRef<number>(0);
  const manualTimerRef = useRef<number | null>(null);

  // Keep ref in sync so the live loop can compare without re-running on setState.
  useEffect(() => {
    heldRef.current = held;
  }, [held]);

  // Cleanup manual timer on unmount
  useEffect(() => {
    return () => {
      if (manualTimerRef.current !== null) {
        window.clearTimeout(manualTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // No frame at all → camera off; clear preview but keep manual `held`
    if (!frame) {
      streakRef.current = { kind: null, count: 0 };
      releaseRef.current = 0;
      if (previewSnapshotRef.current !== null) {
        previewSnapshotRef.current = null;
        setPreview(null);
      }
      return;
    }

    const cand = evaluate(frame.landmarks, buffersRef.current);

    // Streak bookkeeping
    const streak = streakRef.current;
    if (!cand) {
      streak.kind = null;
      streak.count = 0;
    } else if (streak.kind === cand.kind) {
      streak.count += 1;
    } else {
      streak.kind = cand.kind;
      streak.count = 1;
    }

    // Preview state (drives status pill)
    const prev = previewSnapshotRef.current;
    const changed =
      (prev?.kind ?? null) !== (cand?.kind ?? null) ||
      Math.abs((prev?.confidence ?? 0) - (cand?.confidence ?? 0)) > 0.05;
    if (changed) {
      previewSnapshotRef.current = cand;
      setPreview(cand);
    }

    const currentHeld = heldRef.current;

    // === Held lifecycle (live source) ===
    if (cand && streak.count >= CONFIRM_FRAMES) {
      // Reset release counter — we have a confirmed gesture this frame
      releaseRef.current = 0;

      const now = performance.now();
      const sameKind = currentHeld?.kind === cand.kind;

      // Only mount a new held when kind changes (or no held)
      // For same-kind we keep the existing startedAt → no remount.
      if (!sameKind && now - lastFireRef.current >= SAME_KIND_COOLDOWN_MS) {
        lastFireRef.current = now;
        if (manualTimerRef.current !== null) {
          window.clearTimeout(manualTimerRef.current);
          manualTimerRef.current = null;
        }
        if (DEBUG) console.log("[Gesture] held:", cand.kind, "conf:", cand.confidence.toFixed(2));
        setHeld({ kind: cand.kind, startedAt: now, source: "live" });
      }
    } else if (currentHeld?.source === "live") {
      // No match this frame → bump release counter, drop held after debounce
      releaseRef.current += 1;
      if (releaseRef.current >= HOLD_RELEASE_FRAMES) {
        if (DEBUG) console.log("[Gesture] released:", currentHeld.kind);
        setHeld(null);
        releaseRef.current = 0;
      }
    }
  }, [frame]);

  const trigger = useCallback((kind: GestureKind) => {
    const now = performance.now();
    // Clear any prior manual timer
    if (manualTimerRef.current !== null) {
      window.clearTimeout(manualTimerRef.current);
      manualTimerRef.current = null;
    }
    lastFireRef.current = now;
    setHeld({ kind, startedAt: now, source: "manual" });
    manualTimerRef.current = window.setTimeout(() => {
      manualTimerRef.current = null;
      // Only clear if we're still showing this manual session
      const cur = heldRef.current;
      if (cur?.source === "manual" && cur.startedAt === now) {
        setHeld(null);
      }
    }, MANUAL_HOLD_MS);
  }, []);

  return { preview, held, trigger };
}
