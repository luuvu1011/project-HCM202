"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "streaming"
  | "denied"
  | "error";

export interface CameraStreamApi {
  status: CameraStatus;
  errorMessage: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Live video element — flips to non-null AFTER mount.
   *  Use this (not videoRef) as a useEffect dependency so the effect re-runs
   *  when the <video> element appears (e.g. after dynamic import resolves). */
  videoEl: HTMLVideoElement | null;
  /** Callback ref — attach to <video ref={attachVideo}> so stream binds the
   *  instant the element mounts, even with AnimatePresence mode="wait" delay. */
  attachVideo: (el: HTMLVideoElement | null) => void;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Quản lý getUserMedia: xin quyền, gắn vào <video>, cleanup đầy đủ.
 * Tự stop khi tab ẩn, unmount.
 */
export function useCameraStream(): CameraStreamApi {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  // Callback ref fires the moment <video> mounts/unmounts. This is the only
  // reliable place to attach srcObject when the element is rendered behind an
  // AnimatePresence mode="wait" gate (the [status] effect alone fires too early).
  // Also bumps state so consumer effects can re-run with a real element.
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    setVideoEl(el);
    if (!el) return;
    const stream = streamRef.current;
    if (stream && el.srcObject !== stream) {
      el.srcObject = stream;
      el.play().catch(() => {
        // Autoplay rejection is non-fatal — muted playback should still proceed.
      });
    }
  }, []);

  const stop = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMessage("Trình duyệt không hỗ trợ truy cập camera.");
      return;
    }
    setStatus("requesting");
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });
      streamRef.current = stream;
      // Defer srcObject attachment to the [status] effect below — the <video>
      // element is rendered conditionally on `status === "streaming"`, so its
      // ref is still null at this point.
      setStatus("streaming");
    } catch (err) {
      const e = err as DOMException;
      if (e?.name === "NotAllowedError" || e?.name === "PermissionDeniedError") {
        setStatus("denied");
      } else {
        setStatus("error");
        setErrorMessage(e?.message ?? "Không rõ lỗi khi mở camera.");
      }
    }
  }, []);

  // Attach MediaStream → <video> AFTER the element mounts. The <video> is
  // rendered conditionally on `status === "streaming"`, so we can only reach
  // its ref once React has flushed the re-render that follows setStatus().
  useEffect(() => {
    if (status !== "streaming") return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
      // autoPlay+muted+playsInline are already on the element via JSX, but some
      // browsers still need an explicit play() when srcObject is assigned late.
      video.play().catch(() => {
        // Autoplay rejection is non-fatal — muted playback should still proceed.
      });
    }
  }, [status]);

  // Auto-stop on tab hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && streamRef.current) {
        stop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { status, errorMessage, videoRef, videoEl, attachVideo, start, stop };
}
