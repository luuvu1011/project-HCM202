"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { AmbientScene, COLLAPSE_DURATION_MS } from "@/components/gestures/effects/AmbientScene";
import { HeartFlagInsideEffect } from "@/components/gestures/effects/HeartFlagInsideEffect";
import { SoldierSaluteEffect } from "@/components/gestures/effects/SoldierSaluteEffect";
import { VietnamMapEffect } from "@/components/gestures/effects/VietnamMapEffect";
import { VietnamMuonNamEffect } from "@/components/gestures/effects/VietnamMuonNamEffect";
import { HandHologramScene } from "@/components/gestures/HandHologramScene";
import { GESTURE_COPY, SECTION_COPY } from "@/data/gestureCopy";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { HeldGesture } from "@/hooks/useGestureRecognizer";
import type { GestureKind, HandFrame } from "@/types/gestures";

// Lazy load ParticlesProvider so the engine WASM isn't shipped in SSR bundle
const ParticlesProvider = dynamic(
  () => import("@tsparticles/react").then((m) => m.ParticlesProvider),
  { ssr: false },
);

interface Props {
  held: HeldGesture | null;
  cameraOn: boolean;
  frame?: HandFrame | null;
}

/* ─── Một hiệu ứng duy nhất, đậm bản sắc Việt Nam, cho mỗi cử chỉ ─── */
type EffectComponent = React.ComponentType<{ emotion: string; particlesReady?: boolean }>;

const PRIMARY: Record<GestureKind, EffectComponent> = {
  heart: HeartFlagInsideEffect,
  thumbsUp: SoldierSaluteEffect,
  wave: VietnamMapEffect,
  special: VietnamMuonNamEffect,
};

const PRIMARY_LABEL: Record<GestureKind, string> = {
  heart: "Trái tim Việt Nam",
  thumbsUp: "Rồng thiêng Đại Việt",
  wave: "Dải đất hình chữ S",
  special: "Lãnh Tụ Vĩ Đại",
};

/** Whether the effect uses tsparticles — flips the provider on first use. */
const NEEDS_PARTICLES: Record<GestureKind, boolean> = {
  heart: false,
  thumbsUp: false,
  wave: false,
  special: false,
};

interface MountedEffect {
  kind: GestureKind;
  id: number;
}

export function GestureEffectStage({ held, cameraOn, frame = null }: Props) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState<MountedEffect | null>(null);
  const [ambientPhase, setAmbientPhase] = useState<"idle" | "collapsing" | "hidden">("idle");
  const [enableParticles, setEnableParticles] = useState(false);
  const prevHeldKey = useRef<string | null>(null);

  // Drive the lifecycle entirely off `held`. No EFFECT_DURATION timers —
  // the effect stays mounted as long as the gesture is held. AnimatePresence
  // (mode="wait") handles the cross-fade if the kind changes mid-flight.
  useEffect(() => {
    const heldKey = held ? `${held.kind}-${held.startedAt}` : null;
    if (heldKey === prevHeldKey.current) return;
    prevHeldKey.current = heldKey;

    if (held) {
      // Particles engine init once any particle-using effect appears
      if (!reduced && NEEDS_PARTICLES[held.kind]) {
        setEnableParticles(true);
      }
      // ambient collapses → effect mounts after the collapse animation
      setAmbientPhase("collapsing");
      const t = window.setTimeout(() => {
        setAmbientPhase("hidden");
        setMounted({ kind: held.kind, id: held.startedAt });
      }, COLLAPSE_DURATION_MS);
      return () => window.clearTimeout(t);
    }

    // Released — fade out effect, restore ambient
    setMounted(null);
    setAmbientPhase("idle");
  }, [held, reduced]);

  return (
    <div
      className="vv-shimmer-border relative h-full w-full overflow-hidden rounded-3xl"
      style={{
        background:
          "linear-gradient(160deg, rgba(6,9,16,0.92) 0%, rgba(26,5,6,0.88) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,215,0,0.08), 0 12px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(200,16,46,0.20) 0%, transparent 70%)",
          filter: "blur(18px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,215,0,0.16) 0%, transparent 70%)",
          filter: "blur(22px)",
        }}
      />

      {/* Layer 1: persistent ambient — collapses to center when an effect starts */}
      <AmbientScene phase={ambientPhase} />

      {/* Layer 2: gesture effect — fades in after ambient collapse */}
      {enableParticles ? (
        <ParticlesProvider init={initParticles}>
          <EffectLayer current={mounted} particlesReady />
        </ParticlesProvider>
      ) : (
        <EffectLayer current={mounted} particlesReady={false} />
      )}

      {/* Layer 3: idle overlay (camera hologram + hints) */}
      <IdleOverlay
        cameraOn={cameraOn}
        frame={frame}
        hidden={ambientPhase !== "idle" || mounted !== null}
      />

      {/* Variant badge (subtle) */}
      <VariantBadge effect={mounted} />
    </div>
  );
}

async function initParticles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  engine: any,
) {
  const { loadSlim } = await import("@tsparticles/slim");
  await loadSlim(engine);
}

function EffectLayer({
  current,
  particlesReady,
}: {
  current: MountedEffect | null;
  particlesReady: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {current && (
        <motion.div
          key={`${current.kind}-${current.id}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SelectedEffect current={current} particlesReady={particlesReady} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SelectedEffect({
  current,
  particlesReady,
}: {
  current: MountedEffect;
  particlesReady: boolean;
}) {
  const Component = PRIMARY[current.kind];
  const emotion = GESTURE_COPY[current.kind].emotion;
  return <Component emotion={emotion} particlesReady={particlesReady} />;
}

function IdleOverlay({
  cameraOn,
  frame,
  hidden,
}: {
  cameraOn: boolean;
  frame: HandFrame | null;
  hidden: boolean;
}) {
  const handVisible = (frame?.landmarks?.length ?? 0) > 0;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      {cameraOn && <HandHologramScene frame={frame} />}

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-6 z-[5] flex flex-col items-center justify-center gap-2 px-6 text-center"
        animate={{ opacity: cameraOn && handVisible ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {!cameraOn && (
          <motion.div
            className="h-3 w-3 rounded-full"
            style={{
              background: "#FFD700",
              boxShadow: "0 0 18px rgba(255,215,0,0.65)",
            }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <p
          className="font-cinzel text-xs font-semibold uppercase tracking-[0.36em]"
          style={{ color: "rgba(255,215,0,0.9)", textShadow: "0 0 14px rgba(255,215,0,0.4)" }}
        >
          {cameraOn ? SECTION_COPY.idleHint : "Hiệu ứng sẽ xuất hiện ở đây"}
        </p>
        <p
          className="max-w-sm text-[11px] leading-relaxed sm:text-xs"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {cameraOn
            ? "Đưa bàn tay vào khung — giữ cử chỉ để hiệu ứng hiện trọn vẹn."
            : "Bật camera, hoặc dùng các nút bên dưới để xem demo."}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* Top-right subtle badge showing which gesture is playing */
function VariantBadge({ effect }: { effect: MountedEffect | null }) {
  const label = useMemo(() => {
    if (!effect) return null;
    return PRIMARY_LABEL[effect.kind] ?? null;
  }, [effect]);

  return (
    <AnimatePresence>
      {effect && label && (
        <motion.div
          key={`${effect.kind}-${effect.id}`}
          className="pointer-events-none absolute right-4 top-4 z-10 rounded-full px-3 py-1"
          style={{
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,215,0,0.35)",
            backdropFilter: "blur(8px)",
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          <p
            className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: "rgba(255,215,0,0.95)", textShadow: "0 0 10px rgba(255,215,0,0.5)" }}
          >
            {label}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
