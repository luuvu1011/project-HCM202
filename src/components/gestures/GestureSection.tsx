"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GestureEffectStage } from "@/components/gestures/GestureEffectStage";
import { GestureInstructions } from "@/components/gestures/GestureInstructions";
import { useCameraStream } from "@/hooks/useCameraStream";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useGestureRecognizer } from "@/hooks/useGestureRecognizer";
import { SECTION_COPY } from "@/data/gestureCopy";
import type { GestureKind } from "@/types/gestures";

const GESTURE_LABEL: Record<GestureKind, string> = {
  heart: "Trái tim",
  thumbsUp: "Ngón cái",
  wave: "Vẫy tay",
  special: "Nắm tay",
};

export function GestureSection() {
  const {
    status,
    errorMessage,
    videoEl,
    attachVideo,
    start: startCamera,
    stop: stopCamera,
  } = useCameraStream();
  const {
    frame,
    start: startTracking,
    stop: stopTracking,
    loading: modelLoading,
    error: modelError,
    ready: modelReady,
  } = useHandTracking();
  const { preview, held, trigger } = useGestureRecognizer(frame);

  // Wire camera streaming → MediaPipe. Uses videoEl state so this re-runs the
  // moment the hidden <video> mounts (camera-on toggle).
  useEffect(() => {
    if (status !== "streaming") {
      stopTracking();
      return;
    }
    if (!videoEl) return;
    const handleReady = () => {
      if (videoEl.videoWidth > 0) startTracking(videoEl);
    };
    if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
      handleReady();
    } else {
      videoEl.addEventListener("loadeddata", handleReady);
      videoEl.addEventListener("loadedmetadata", handleReady);
    }
    return () => {
      videoEl.removeEventListener("loadeddata", handleReady);
      videoEl.removeEventListener("loadedmetadata", handleReady);
      stopTracking();
    };
  }, [status, videoEl, startTracking, stopTracking]);

  const handleManualTrigger = useCallback(
    (kind: GestureKind) => {
      trigger(kind);
    },
    [trigger],
  );

  const cameraOn = status === "streaming";
  const handsVisible = (frame?.landmarks?.length ?? 0) > 0;

  return (
    <section
      id="tuong-tac"
      aria-label="Khu vực tương tác cử chỉ"
      role="region"
      className="section-cream relative scroll-mt-24 py-20 sm:py-28"
    >
      <div className="vv-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        <ScrollReveal>
          <SectionHeading
            align="center"
            eyebrow={SECTION_COPY.eyebrow}
            title={SECTION_COPY.title}
            description={SECTION_COPY.description}
          />
        </ScrollReveal>

        {/* ── Full-width effect stage ─────────────────────────────────────── */}
        <div className="relative mt-10 lg:mt-14">
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
            <GestureEffectStage held={held} cameraOn={cameraOn} frame={frame} />

            {/* Hidden <video> — invisible but still played so MediaPipe can read frames */}
            {cameraOn && (
              <video
                ref={attachVideo}
                autoPlay
                playsInline
                muted
                aria-hidden
                tabIndex={-1}
                className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
              />
            )}

            {/* ── Overlay: idle "Bật camera" prompt ───────────────────────── */}
            <AnimatePresence>
              {!cameraOn && (
                <motion.div
                  key={status}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-3xl px-6 text-center"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(6,9,16,0.92) 0%, rgba(26,5,6,0.88) 100%)",
                  }}
                >
                  {status === "idle" && (
                    <div className="pointer-events-auto flex flex-col items-center gap-4">
                      <CameraIcon />
                      <p className="max-w-sm font-cinzel text-sm font-semibold uppercase tracking-[0.3em] text-white/85 sm:text-base">
                        {SECTION_COPY.cameraOff}
                      </p>
                      <Button
                        variant="primary"
                        onClick={startCamera}
                        aria-label="Bật camera để bắt đầu nhận diện cử chỉ"
                      >
                        Bật camera
                      </Button>
                      <p className="max-w-md text-[11px] leading-relaxed text-white/55 sm:text-xs">
                        Hình ảnh camera <strong>không hiển thị</strong> trên trang —
                        chỉ chạy ngầm để nhận diện cử chỉ. Video không rời thiết bị
                        của bạn.
                      </p>
                    </div>
                  )}

                  {status === "requesting" && (
                    <div className="pointer-events-auto flex flex-col items-center gap-3">
                      <Spinner />
                      <p className="text-sm text-white/75">
                        {modelLoading
                          ? "Đang tải mô hình nhận diện…"
                          : SECTION_COPY.cameraRequesting}
                      </p>
                    </div>
                  )}

                  {status === "denied" && (
                    <div className="pointer-events-auto flex flex-col items-center gap-3">
                      <p className="font-cinzel text-base font-semibold text-[#ff6b78]">
                        Quyền camera bị từ chối
                      </p>
                      <p className="max-w-sm text-sm text-white/70">
                        {SECTION_COPY.cameraDenied}
                      </p>
                      <Button variant="ghost" onClick={startCamera}>
                        {SECTION_COPY.retry}
                      </Button>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="pointer-events-auto flex flex-col items-center gap-3">
                      <p className="font-cinzel text-base font-semibold text-[#ff6b78]">
                        Lỗi khi mở camera
                      </p>
                      <p className="max-w-sm text-sm text-white/70">
                        {errorMessage ?? SECTION_COPY.cameraError}
                      </p>
                      <Button variant="ghost" onClick={startCamera}>
                        {SECTION_COPY.retry}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Top-right: status pills + stop button (camera on) ───────── */}
            {cameraOn && (
              <div className="absolute right-3 top-3 z-30 flex items-center gap-2 sm:right-5 sm:top-5">
                <StatusPill
                  modelLoading={modelLoading}
                  modelError={modelError}
                  modelReady={modelReady}
                  handsVisible={handsVisible}
                  preview={preview}
                />
                <button
                  type="button"
                  onClick={stopCamera}
                  aria-label="Tắt camera"
                  className="rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur transition-colors hover:bg-black/70"
                >
                  {SECTION_COPY.stop}
                </button>
              </div>
            )}
          </div>

          {/* Footer line: privacy notice */}
          <p className="mt-4 text-center text-[11px] leading-relaxed text-patriot-muted sm:text-xs">
            {SECTION_COPY.privacy}
          </p>
        </div>

        {/* ── Instructions row ─────────────────────────────────────────── */}
        <ScrollReveal className="mt-10 lg:mt-14" delay={0.08}>
          <GestureInstructions
            activeKind={preview && preview.confidence > 0.4 ? preview.kind : null}
            onTrigger={handleManualTrigger}
          />
          <p className="mt-4 text-center text-[11px] text-patriot-muted sm:text-xs">
            Mẹo: nhấn các thẻ bên trên để xem hiệu ứng demo mà không cần camera.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── Status pill ─────────────────────────────────────────────────────────────

interface StatusPillProps {
  modelLoading: boolean;
  modelError: string | null;
  modelReady: boolean;
  handsVisible: boolean;
  preview: { kind: GestureKind; confidence: number } | null;
}

function StatusPill({
  modelLoading,
  modelError,
  modelReady,
  handsVisible,
  preview,
}: StatusPillProps) {
  let label: string;
  let dot: string;

  if (modelError) {
    label = "Lỗi nhận diện";
    dot = "#ff5a6a";
  } else if (modelLoading || !modelReady) {
    label = "Đang tải mô hình…";
    dot = "#FFD700";
  } else if (preview && preview.confidence > 0.4) {
    label = `${GESTURE_LABEL[preview.kind]} · ${Math.round(preview.confidence * 100)}%`;
    dot = "#7af0a0";
  } else if (handsVisible) {
    label = "Đã thấy tay";
    dot = "#7af0a0";
  } else {
    label = "Chưa thấy tay";
    dot = "rgba(255,255,255,0.65)";
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur">
      <motion.span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─── Decorative icons ────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <div
      aria-hidden
      className="flex h-14 w-14 items-center justify-center rounded-full"
      style={{
        background: "linear-gradient(140deg, #C8102E, #FFD700)",
        boxShadow: "0 8px 26px rgba(200,16,46,0.30)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    </div>
  );
}

function Spinner() {
  return (
    <motion.div
      aria-hidden
      className="h-10 w-10 rounded-full border-2"
      style={{
        borderColor: "rgba(255,255,255,0.25)",
        borderTopColor: "#FFD700",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}
