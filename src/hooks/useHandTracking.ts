"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HandFrame, HandLandmarks } from "@/types/gestures";

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// Target ~24 FPS detection (lower than camera 30 to save CPU)
const FRAME_INTERVAL_MS = 1000 / 24;

export interface HandTrackingApi {
  ready: boolean;
  loading: boolean;
  error: string | null;
  frame: HandFrame | null;
  /** Begin processing video element frames. Idempotent. */
  start: (video: HTMLVideoElement) => void;
  /** Stop the RAF loop. */
  stop: () => void;
}

/**
 * Khởi tạo MediaPipe HandLandmarker (Tasks API), stream landmarks ra qua state.
 * Tự lazy-load model từ CDN khi start() lần đầu.
 */
export function useHandTracking(): HandTrackingApi {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState<HandFrame | null>(null);

  // Use any here — Tasks Vision is dynamically imported, types resolved at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastErrorLogRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Hold the loop function in a ref so requestAnimationFrame can re-schedule
  // without creating a self-referential useCallback (lint rule).
  const loopRef = useRef<() => void>(() => {});

  const ensureLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    setLoading(true);
    setError(null);
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { FilesetResolver, HandLandmarker } = vision;
      const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);

      // Try GPU delegate first (faster). If it fails (common on Windows with
      // integrated graphics, or in Firefox without WebGPU), fall back to CPU.
      const buildOptions = (delegate: "GPU" | "CPU") => ({
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate,
        },
        numHands: 2,
        runningMode: "VIDEO" as const,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      let landmarker;
      try {
        landmarker = await HandLandmarker.createFromOptions(fileset, buildOptions("GPU"));
      } catch (gpuErr) {
        console.warn("[HandTracking] GPU delegate failed, falling back to CPU:", gpuErr);
        landmarker = await HandLandmarker.createFromOptions(fileset, buildOptions("CPU"));
      }

      landmarkerRef.current = landmarker;
      setReady(true);
      console.log("[HandTracking] Model ready ✓");
      return landmarker;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không tải được mô hình MediaPipe.";
      console.error("[HandTracking] Failed to initialize:", e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Define the per-frame loop once (in effect) to avoid render-time ref mutation.
  useEffect(() => {
    loopRef.current = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(() => loopRef.current());
        return;
      }
      const now = performance.now();
      if (now - lastTimeRef.current < FRAME_INTERVAL_MS) {
        rafRef.current = requestAnimationFrame(() => loopRef.current());
        return;
      }
      lastTimeRef.current = now;

      try {
        const result = landmarker.detectForVideo(video, now);
        const lmList: HandLandmarks[] = (result?.landmarks ?? []) as HandLandmarks[];
        const handedness: ("Left" | "Right")[] =
          (result?.handedness ?? []).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (h: any) => (h?.[0]?.categoryName as "Left" | "Right") ?? "Right",
          );
        setFrame({ landmarks: lmList, handedness, timestamp: now });
      } catch (err) {
        // Log at most once per second to avoid spam from transient frame errors
        const t = performance.now();
        if (t - (lastErrorLogRef.current ?? 0) > 1000) {
          lastErrorLogRef.current = t;
          console.warn("[HandTracking] detectForVideo error:", err);
        }
      }
      rafRef.current = requestAnimationFrame(() => loopRef.current());
    };
  }, []);

  const start = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;
      ensureLandmarker()
        .then(() => {
          if (rafRef.current == null) {
            rafRef.current = requestAnimationFrame(() => loopRef.current());
          }
        })
        .catch(() => {
          /* error already set */
        });
    },
    [ensureLandmarker],
  );

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    videoRef.current = null;
    setFrame(null);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
    };
  }, []);

  return { ready, loading, error, frame, start, stop };
}
