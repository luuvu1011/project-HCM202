"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cinematicEase } from "@/animations/transitions";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CINEMATIC_LEGS, CINEMATIC_STOPS } from "@/data/cinematicVoyage";
import type { LocationId } from "@/types/voyage";

type VoyageStatus = "idle" | "transition" | "traveling" | "arrived" | "completed";

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function buildPath(from: { x: number; y: number }, curve: { x: number; y: number }, to: { x: number; y: number }) {
  return `M ${from.x} ${from.y} Q ${curve.x} ${curve.y} ${to.x} ${to.y}`;
}

export function CinematicVoyageSection() {
  const reduced = useReducedMotion();
  const { ref: sceneRef, size } = useElementSize<HTMLDivElement>();
  const [stageIndex, setStageIndex] = useState(0);
  const [status, setStatus] = useState<VoyageStatus>("idle");
  const animationRef = useRef<ReturnType<typeof animate>[]>([]);

  const shipX = useMotionValue(0);
  const shipY = useMotionValue(0);

  const stopById = useMemo(() => {
    return CINEMATIC_STOPS.reduce<Record<LocationId, { x: number; y: number }>>(
      (acc, stop) => {
        acc[stop.id] = stop.position;
        return acc;
      },
      {} as Record<LocationId, { x: number; y: number }>,
    );
  }, []);

  const legPaths = useMemo(() => {
    return CINEMATIC_LEGS.map((leg, index) => {
      const from = stopById[leg.from];
      const to = stopById[leg.to];
      return {
        key: `${leg.from}-${leg.to}`,
        index,
        from: leg.from,
        to: leg.to,
        path: buildPath(from, leg.curve, to),
      };
    });
  }, [stopById]);

  const stopPositionsPx = useMemo(() => {
    if (!size.width || !size.height) return [];
    return CINEMATIC_STOPS.map((stop) => ({
      id: stop.id,
      x: (stop.position.x / 100) * size.width,
      y: (stop.position.y / 100) * size.height,
    }));
  }, [size.width, size.height]);

  const activeStop = CINEMATIC_STOPS[stageIndex] ?? CINEMATIC_STOPS[0];
  const lastIndex = CINEMATIC_STOPS.length - 1;
  const traveling = status === "traveling";
  const arrived = status === "arrived" || status === "completed";

  const cameraX = useTransform(shipX, (x) => {
    if (!size.width) return 0;
    const center = size.width * 0.52;
    return -(x - center) * 0.18;
  });
  const cameraY = useTransform(shipY, (y) => {
    if (!size.height) return 0;
    const center = size.height * 0.5;
    return -(y - center) * 0.14;
  });
  const farDriftX = useTransform(cameraX, (x) => x * 0.4);
  const midDriftX = useTransform(cameraX, (x) => x * 0.7);

  useEffect(() => {
    if (!size.width || !size.height) return;
    if (traveling) return;
    const current = CINEMATIC_STOPS[stageIndex];
    if (!current) return;
    shipX.set((current.position.x / 100) * size.width);
    shipY.set((current.position.y / 100) * size.height);
  }, [size.width, size.height, stageIndex, traveling, shipX, shipY]);

  const stopAnimations = useCallback(() => {
    animationRef.current.forEach((controls) => controls.stop());
    animationRef.current = [];
  }, []);

  const startLeg = useCallback(() => {
    if (traveling || stageIndex >= lastIndex) return;
    if (!stopPositionsPx.length) return;

    const nextIndex = Math.min(stageIndex + 1, lastIndex);
    const current = stopPositionsPx[stageIndex];
    const next = stopPositionsPx[nextIndex];
    if (!current || !next) return;

    stopAnimations();
    setStatus("traveling");

    const duration = reduced ? 0.01 : 7.2;
    const controlsX = animate(shipX, next.x, { duration, ease: cinematicEase });
    const controlsY = animate(shipY, next.y, { duration, ease: cinematicEase });
    animationRef.current = [controlsX, controlsY];

    Promise.all([controlsX.finished, controlsY.finished]).then(() => {
      setStageIndex(nextIndex);
      setStatus(nextIndex === lastIndex ? "completed" : "arrived");
    });
  }, [traveling, stageIndex, lastIndex, stopPositionsPx, reduced, shipX, shipY, stopAnimations]);

  const handleStart = useCallback(() => {
    startLeg();
  }, [startLeg]);

  const handleContinue = useCallback(() => {
    startLeg();
  }, [startLeg]);

  const handleReplay = useCallback(() => {
    stopAnimations();
    setStageIndex(0);
    setStatus("idle");
  }, [stopAnimations]);

  useEffect(() => {
    return () => stopAnimations();
  }, [stopAnimations]);

  const activeLegIndex = traveling ? stageIndex : -1;

  return (
    <section
      id="hai-trinh-dien-anh"
      className="relative scroll-mt-24 py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(194,59,59,0.08),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_80%,rgba(26,75,124,0.28),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-soft/85">
            Hải trình điện ảnh
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-parchment sm:text-4xl">
            Chuyến hải hành được kể như một bộ phim lịch sử
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-parchment-muted sm:text-base">
            Không còn là bản đồ hay biểu tượng tĩnh — đây là một khung hình điện ảnh.
            Bạn chứng kiến con tàu rời bến, băng qua đại dương, và cập bến trong nhịp thở
            của lịch sử.
          </p>
        </div>

        <div className="mt-10">
          <div
            ref={sceneRef}
            className="relative isolate w-full overflow-hidden rounded-[32px] border border-white/10 bg-ocean-deep/70 shadow-[0_50px_140px_rgba(0,0,0,0.65)]"
          >
            <div className="aspect-[16/9] min-h-[360px] w-full sm:aspect-[21/9] sm:min-h-[460px]">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse_at_40%_18%, ${activeStop.tone.glow}, transparent 58%)`,
                }}
                animate={reduced ? undefined : { opacity: [0.3, 0.6, 0.35] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse_at_60%_90%, ${activeStop.tone.mist}, transparent 65%)`,
                }}
                animate={reduced ? undefined : { opacity: [0.3, 0.5, 0.35] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute inset-0"
                style={{ x: farDriftX, y: cameraY }}
                animate={{ scale: arrived ? 1.03 : 1 }}
                transition={{ duration: 1.4, ease: cinematicEase }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,31,58,0.55),rgba(5,15,31,0.92))]" />
                <motion.svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 1200 600"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    fill="rgba(26,75,124,0.45)"
                    d="M0,420 C160,380 320,460 520,430 C720,400 920,460 1200,430 L1200,600 L0,600 Z"
                    animate={
                      reduced
                        ? undefined
                        : {
                            d: [
                              "M0,420 C160,380 320,460 520,430 C720,400 920,460 1200,430 L1200,600 L0,600 Z",
                              "M0,440 C180,410 340,450 540,440 C760,430 940,480 1200,450 L1200,600 L0,600 Z",
                              "M0,420 C160,380 320,460 520,430 C720,400 920,460 1200,430 L1200,600 L0,600 Z",
                            ],
                          }
                    }
                    transition={{ duration: traveling ? 9 : 14, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.svg>
              </motion.div>

              <motion.div
                className="absolute inset-0"
                style={{ x: midDriftX, y: cameraY }}
                animate={{ scale: arrived ? 1.04 : 1 }}
                transition={{ duration: 1.6, ease: cinematicEase }}
              >
                <div
                  className="absolute -left-[8%] top-[58%] h-[38%] w-[46%] rounded-[42%] bg-[rgba(12,31,58,0.85)]"
                  style={{ clipPath: "polygon(0% 70%, 18% 60%, 32% 66%, 48% 52%, 66% 58%, 82% 44%, 100% 48%, 100% 100%, 0% 100%)" }}
                />
                <div
                  className="absolute right-[-6%] top-[12%] h-[46%] w-[42%] rounded-[45%] bg-[rgba(10,24,44,0.85)]"
                  style={{ clipPath: "polygon(0% 50%, 18% 36%, 38% 44%, 56% 32%, 74% 38%, 100% 26%, 100% 100%, 0% 100%)" }}
                />
              </motion.div>

              <motion.div
                className="absolute inset-0"
                style={{ x: cameraX, y: cameraY }}
                animate={{ scale: arrived ? 1.05 : 1 }}
                transition={{ duration: 1.8, ease: cinematicEase }}
              >
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="cinematicRoute" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(212,168,83,0.12)" />
                      <stop offset="50%" stopColor="rgba(232,201,122,0.9)" />
                      <stop offset="100%" stopColor="rgba(212,168,83,0.12)" />
                    </linearGradient>
                    <filter id="routeGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="0.8" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {legPaths.map((leg) => {
                    const isActive = activeLegIndex === leg.index;
                    const isPast = stageIndex > leg.index + 0;
                    return (
                      <g key={leg.key}>
                        <path
                          d={leg.path}
                          stroke={isPast ? "rgba(212,168,83,0.25)" : "rgba(212,168,83,0.12)"}
                          strokeWidth={isActive ? 1.8 : 1.2}
                          fill="none"
                          opacity={isActive ? 0.9 : 0.65}
                        />
                        <motion.path
                          d={leg.path}
                          stroke={isActive ? "rgba(232,201,122,0.95)" : "url(#cinematicRoute)"}
                          strokeWidth={isActive ? 1.1 : 0.8}
                          strokeDasharray={isActive ? "6 10" : "2 8"}
                          fill="none"
                          filter="url(#routeGlow)"
                          animate={
                            isActive && !reduced
                              ? { strokeDashoffset: [0, -40] }
                              : undefined
                          }
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {CINEMATIC_STOPS.map((stop, index) => {
                  const pulse = index === stageIndex && !traveling;
                  return (
                    <motion.div
                      key={stop.id}
                      className="absolute"
                      style={{ left: `${stop.position.x}%`, top: `${stop.position.y}%` }}
                    >
                      <motion.span
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/30"
                        style={{ width: 18, height: 18 }}
                        animate={
                          pulse && !reduced
                            ? { scale: [0.9, 1.3, 0.9], opacity: [0.4, 0.8, 0.4] }
                            : undefined
                        }
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span className="absolute -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-parchment/70" />
                    </motion.div>
                  );
                })}

                {/* Ship rendered in WorldOcean (VoyageShip) — removed from here */}
              </motion.div>

              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, rgba(6,14,26,0.15), ${activeStop.tone.sea})`,
                }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_12%,rgba(255,255,255,0.07),transparent_55%)]"
                animate={reduced ? undefined : { opacity: [0.2, 0.45, 0.25] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_90%,rgba(212,168,83,0.12),transparent_60%)]"
                animate={reduced ? undefined : { opacity: [0.2, 0.55, 0.25] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fog/40 via-transparent to-ocean-deep/90"
                animate={reduced ? undefined : { opacity: traveling ? 0.8 : 0.55 }}
                transition={{ duration: 2.8, ease: "easeInOut" }}
              />

              <AnimatePresence mode="wait">
                {arrived || status === "idle" ? (
                  <motion.div
                    key={activeStop.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.6, ease: cinematicEase }}
                    className="absolute bottom-6 left-6 right-6 max-w-3xl"
                  >
                    <div className="rounded-2xl border border-white/10 bg-ocean-deep/65 px-4 py-4 backdrop-blur-xl sm:px-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold/80">
                        {activeStop.label}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-semibold text-parchment sm:text-2xl">
                        {activeStop.name}
                      </h3>
                      <p className="mt-2 text-sm italic leading-relaxed text-parchment/90 sm:text-[15px]">
                        {activeStop.atmosphere}
                      </p>
                      <div className="mt-3 space-y-2 text-sm leading-relaxed text-parchment-muted sm:text-[15px]">
                        <p>{activeStop.narration}</p>
                        <p className="text-gold-soft/90">{activeStop.ideology}</p>
                        <p>{activeStop.significance}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {status === "idle" ? (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, ease: cinematicEase }}
                    className="absolute bottom-6 right-6"
                  >
                    <Button
                      type="button"
                      className="min-h-[52px] px-8 text-base"
                      onClick={handleStart}
                    >
                      Khởi hành
                    </Button>
                  </motion.div>
                ) : null}
                {status === "arrived" && stageIndex < lastIndex ? (
                  <motion.div
                    key="continue"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, ease: cinematicEase }}
                    className="absolute bottom-6 right-6"
                  >
                    <Button
                      type="button"
                      className="min-h-[52px] px-8 text-base"
                      onClick={handleContinue}
                    >
                      Tiếp tục hành trình
                    </Button>
                  </motion.div>
                ) : null}
                {status === "completed" ? (
                  <motion.div
                    key="replay"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, ease: cinematicEase }}
                    className="absolute bottom-6 right-6"
                  >
                    <Button
                      type="button"
                      className="min-h-[52px] px-8 text-base"
                      onClick={handleReplay}
                    >
                      Phát lại hành trình
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-parchment-muted/85 sm:text-sm">
            {traveling
              ? "Con tàu đang lướt qua đại dương — nhịp điệu điện ảnh chậm rãi để bạn cảm nhận từng lớp lịch sử."
              : "Mỗi bến cảng mở ra một lớp ký ức. Nhấn để tiếp tục hành trình khi bạn sẵn sàng."}
          </p>
        </div>
      </div>
    </section>
  );
}
