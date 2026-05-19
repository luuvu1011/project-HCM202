"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  useRadialTexture,
  useRingTexture,
} from "@/components/gestures/effects/cinematicTextures";
import {
  CORE_PALETTES,
  HeartbeatCore,
  heartbeat,
} from "@/components/gestures/effects/sharedEnergyCore";

/* ─────────────────────────────────────────────────────────────────────────────
 * Persistent ambient scene — the "lõi năng lượng" always-on base layer.
 *
 * Phase semantics:
 *   "idle"       → gentle pulsing heart-core + drifting gold dust (default)
 *   "collapsing" → dust converges into the core (morph-to-effect transition)
 *   "hidden"     → fully invisible (effect is occupying the stage)
 *
 * The visual continuity — same pulsing core stays centered while dust flows
 * into it — makes the hand-off to any gesture effect feel like a real
 * transformation. The effect's own HeartbeatCore emerges at the same point
 * the ambient core just collapsed into.
 * ────────────────────────────────────────────────────────────────────────── */

export type AmbientPhase = "idle" | "collapsing" | "hidden";
export const COLLAPSE_DURATION_MS = 450;

interface CollapseRef {
  phase: AmbientPhase;
  changedAt: number;
}

/* ─── Vietnamese ambient particles (gold dust + soft drifting motes) ────── */
function AmbientDust({
  reduced,
  collapseRef,
}: {
  reduced: boolean;
  collapseRef: React.RefObject<CollapseRef>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.35, "rgba(255,220,140,0.85)"],
    [0.8, "rgba(200,80,30,0.25)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const count = reduced ? 90 : 180;
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const radius = 1.2 + Math.random() * 3.6;
        const angle = Math.random() * Math.PI * 2;
        const height = -2.2 + Math.random() * 4.4;
        return {
          baseR: radius,
          baseTheta: angle,
          baseY: height,
          orbitSpeed: 0.04 + Math.random() * 0.12,
          riseSpeed: 0.06 + Math.random() * 0.16,
          wobble: 0.08 + Math.random() * 0.18,
          wobbleFreq: 0.4 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
          size: 0.045 + Math.random() * 0.07,
          twinkleFreq: 0.8 + Math.random() * 2.4,
          colorMix: Math.random(),
        };
      }),
    [count],
  );

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.colorMix < 0.6) c.set("#FFD86A");
      else if (p.colorMix < 0.85) c.set("#FFE9B0");
      else c.set("#FF8060");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const cref = collapseRef.current;
    let raw = 0;
    if (cref) {
      if (cref.phase === "hidden") raw = 1;
      else if (cref.phase === "collapsing") {
        raw = Math.max(0, Math.min(1, (performance.now() - cref.changedAt) / COLLAPSE_DURATION_MS));
      }
    }
    const eased = 1 - Math.pow(1 - raw, 2.2);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const theta = p.baseTheta + t * p.orbitSpeed * (reduced ? 0.3 : 1);
      const homeX = Math.cos(theta) * p.baseR + Math.sin(t * p.wobbleFreq + p.phase) * p.wobble;
      const homeY = p.baseY + ((t * p.riseSpeed * (reduced ? 0.3 : 1)) % 5) - 2.5;
      const homeZ = Math.sin(theta) * p.baseR * 0.6;

      const x = homeX * (1 - eased);
      const y = homeY * (1 - eased);
      const z = homeZ * (1 - eased);

      const twinkle = 0.55 + 0.45 * Math.sin(t * p.twinkleFreq + p.phase);
      const fade = raw < 0.85 ? 1 + raw * 0.6 : Math.max(0, 1 - (raw - 0.85) / 0.15);

      dummy.position.set(x, y, z);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * fade * twinkle);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ─── Slowly rotating ring in deep background (Dong Son-inspired motif) ─── */
function BackgroundRing({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useRingTexture("rgba(255,180,80,0.32)", "rgba(0,0,0,0)");
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    if (!reduced) m.rotation.z = t * 0.04;
    const beat = reduced ? 0.5 : heartbeat(t, 72);
    m.scale.setScalar(3.6 + beat * 0.18);
  });
  return (
    <mesh ref={ref} position={[0, 0, -2.4]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ─── Gentle ambient camera drift ────────────────────────────────────────── */
function AmbientCamera({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (reduced) {
      state.camera.position.set(0, 0, 4.7);
      state.camera.lookAt(0, 0, 0);
      return;
    }
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.18) * 0.12;
    state.camera.position.y = Math.cos(t * 0.14) * 0.08;
    state.camera.position.z = 4.7;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─── Core wrapper that shrinks during collapse ──────────────────────────── */
function CollapsingCore({
  reduced,
  collapseRef,
}: {
  reduced: boolean;
  collapseRef: React.RefObject<CollapseRef>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const cref = collapseRef.current;
    let raw = 0;
    if (cref) {
      if (cref.phase === "hidden") raw = 1;
      else if (cref.phase === "collapsing") {
        raw = Math.max(0, Math.min(1, (performance.now() - cref.changedAt) / COLLAPSE_DURATION_MS));
      }
    }
    const s = 1 - raw * 0.55;
    g.scale.setScalar(Math.max(0.05, s));
  });
  return (
    <group ref={groupRef}>
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.flag}
        fadeOutAt={9999}
        fadeDuration={0.5}
        bpm={72}
        scale={1.1}
      />
    </group>
  );
}

function Scene({
  reduced,
  collapseRef,
}: {
  reduced: boolean;
  collapseRef: React.RefObject<CollapseRef>;
}) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#0a0608", 4, 9]} />
      <ambientLight intensity={0.4} color="#ffe8b8" />
      <pointLight position={[0, 0, 3]} intensity={12} color="#FFD86A" distance={8} decay={1.8} />
      <pointLight position={[-2, 1, 2]} intensity={6} color="#FF7A6A" distance={6} decay={2} />

      <AmbientCamera reduced={reduced} />
      <BackgroundRing reduced={reduced} />
      <AmbientDust reduced={reduced} collapseRef={collapseRef} />
      <CollapsingCore reduced={reduced} collapseRef={collapseRef} />
    </>
  );
}

/* ─── Public wrapper — owns the Canvas + bridges phase props to ref ──────── */
interface AmbientProps {
  phase: AmbientPhase;
}

export function AmbientScene({ phase }: AmbientProps) {
  const reduced = useReducedMotion();
  const collapseRef = useRef<CollapseRef>({ phase: "idle", changedAt: 0 });

  // Update ref whenever phase changes — Canvas's useFrame reads it next tick
  useEffect(() => {
    collapseRef.current = { phase, changedAt: performance.now() };
  }, [phase]);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "hidden" ? 0 : 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Canvas
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.7], fov: 48 }}
        style={{ background: "transparent" }}
      >
        <Scene reduced={reduced} collapseRef={collapseRef} />
      </Canvas>
    </motion.div>
  );
}
