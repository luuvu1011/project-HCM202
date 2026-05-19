"use client";

import { useEffect, useRef } from "react";
import { GestureBadge } from "@/components/gestures/GestureBadge";
import type { GestureKind, HandFrame } from "@/types/gestures";

// MediaPipe HandLandmarker connection pairs (palm + fingers)
const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

interface Props {
  /** Callback ref — fires when <video> mounts; the hook uses this moment to
   *  bind MediaStream to srcObject (works even behind AnimatePresence). */
  attachVideo: (el: HTMLVideoElement | null) => void;
  frame: HandFrame | null;
  preview: { kind: GestureKind; confidence: number } | null;
  mirror?: boolean;
}

/**
 * Webcam preview + landmark overlay canvas.
 * Mirror by default (user-facing camera = selfie view).
 */
export function GestureCanvas({ attachVideo, frame, preview, mirror = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Sync canvas size to wrapper size for crisp lines on any resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const update = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // Draw landmarks each frame update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!frame || frame.landmarks.length === 0) return;

    const w = canvas.width;
    const h = canvas.height;

    for (const hand of frame.landmarks) {
      // Bones — gold-soft
      ctx.strokeStyle = "rgba(216, 156, 60, 0.75)";
      ctx.lineWidth = Math.max(1.5, w / 480);
      ctx.lineCap = "round";
      for (const [a, b] of HAND_CONNECTIONS) {
        const pa = hand[a];
        const pb = hand[b];
        if (!pa || !pb) continue;
        const ax = mirror ? (1 - pa.x) * w : pa.x * w;
        const ay = pa.y * h;
        const bx = mirror ? (1 - pb.x) * w : pb.x * w;
        const by = pb.y * h;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      // Dots — vn-gold
      const r = Math.max(2.5, w / 220);
      for (let i = 0; i < hand.length; i++) {
        const p = hand[i];
        const x = mirror ? (1 - p.x) * w : p.x * w;
        const y = p.y * h;
        ctx.beginPath();
        ctx.fillStyle = i === 0 ? "#C8102E" : "#FFD700";
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [frame, mirror]);

  return (
    <div
      ref={wrapperRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border bg-black/85"
      style={{ borderColor: "rgba(216,156,60,0.45)" }}
    >
      <video
        ref={attachVideo}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: mirror ? "scaleX(-1)" : undefined }}
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <GestureBadge preview={preview} />
    </div>
  );
}
