"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  useRadialTexture,
  useRingTexture,
  useStarSparkleTexture,
} from "@/components/gestures/effects/cinematicTextures";

/* ─────────────────────────────────────────────────────────────────────────────
 * Shared "energy core" + firework system used by all 4 gesture effects.
 *
 * Concept: every effect is born from a single heart-beating energy core
 * (lub-DUB) that then bursts outward like fireworks in the shape unique to
 * the gesture. This unifies the four scenes into one patriotic visual
 * language — the heartbeat of Vietnam.
 *
 * Public surface:
 *   heartbeat(t, bpm)       — two-pulse Gaussian curve, peaks at lub & DUB
 *   <HeartbeatCore … />     — pulsing 3D orb at scene center
 *   <FireworkBurst … />     — particle burst with drag + gravity, by shape
 * ────────────────────────────────────────────────────────────────────────── */

/* ─── Heartbeat (lub-DUB) ────────────────────────────────────────────────── */
/** Returns 0..1 — two Gaussian peaks per cardiac cycle. */
export function heartbeat(t: number, bpm = 72): number {
  const period = 60 / bpm;
  const phase = ((t % period) + period) % period / period; // 0..1
  const lub = Math.exp(-Math.pow((phase - 0.1) * 14, 2));
  const dub = Math.exp(-Math.pow((phase - 0.28) * 14, 2)) * 0.65;
  return Math.min(1, lub + dub);
}

export interface CorePalette {
  /** brightest inner color (rgba) */
  nucleus: string;
  /** mid glow color (rgba) */
  mid: string;
  /** outer aura color (rgba) */
  aura: string;
  /** accent ring color (hex) */
  ringHex: string;
}

/* ─── HeartbeatCore (3D pulsing nucleus) ─────────────────────────────────── */
interface CoreProps {
  reduced: boolean;
  palette: CorePalette;
  /** time at which the core starts fading away (seconds since mount) */
  fadeOutAt?: number;
  /** total fade duration (seconds) */
  fadeDuration?: number;
  /** position offset in the scene */
  position?: [number, number, number];
  /** bpm of the heartbeat — patriotic anthem-pace is ~78 */
  bpm?: number;
  /** overall scale multiplier */
  scale?: number;
}

export function HeartbeatCore({
  reduced,
  palette,
  fadeOutAt = 1.0,
  fadeDuration = 0.6,
  position = [0, 0, 0.2],
  bpm = 78,
  scale = 1,
}: CoreProps) {
  const nucleusRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringBigRef = useRef<THREE.Mesh>(null);

  const nucleusTex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.2, palette.nucleus],
    [0.55, palette.mid],
    [1, "rgba(0,0,0,0)"],
  ]);
  const midTex = useRadialTexture([
    [0, palette.nucleus],
    [0.4, palette.mid],
    [1, "rgba(0,0,0,0)"],
  ]);
  const auraTex = useRadialTexture([
    [0, palette.mid],
    [0.5, palette.aura],
    [1, "rgba(0,0,0,0)"],
  ]);
  const ringTex = useRingTexture(palette.ringHex);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, bpm);
    // Smooth fade out after fadeOutAt
    const fadeT = Math.max(0, t - fadeOutAt) / fadeDuration;
    const fade = Math.max(0, 1 - Math.pow(Math.min(fadeT, 1), 1.8));

    if (nucleusRef.current) {
      nucleusRef.current.lookAt(state.camera.position);
      const s = scale * (0.55 + beat * 0.4);
      nucleusRef.current.scale.setScalar(s * fade);
      const mat = nucleusRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.75 + beat * 0.25) * fade;
    }
    if (midRef.current) {
      midRef.current.lookAt(state.camera.position);
      const s = scale * (1.4 + beat * 0.55);
      midRef.current.scale.setScalar(s * fade);
      const mat = midRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.55 + beat * 0.3) * fade;
    }
    if (auraRef.current) {
      auraRef.current.lookAt(state.camera.position);
      const s = scale * (2.6 + beat * 0.9);
      auraRef.current.scale.setScalar(s * fade);
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.35 + beat * 0.25) * fade;
    }
    if (ringRef.current) {
      ringRef.current.lookAt(state.camera.position);
      // Ring expands subtly with each beat (shockwave-style)
      const s = scale * (1.1 + beat * 0.6);
      ringRef.current.scale.setScalar(s * fade);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.35 + beat * 0.45) * fade;
    }
    if (ringBigRef.current) {
      ringBigRef.current.lookAt(state.camera.position);
      // Larger ring lags one beat behind for chamber-like feel
      const lagBeat = reduced ? 0.4 : heartbeat(t - 0.15, bpm);
      const s = scale * (2.0 + lagBeat * 1.1);
      ringBigRef.current.scale.setScalar(s * fade);
      const mat = ringBigRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.18 + lagBeat * 0.32) * fade;
    }
  });

  return (
    <group position={position}>
      <mesh ref={auraRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={auraTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringBigRef} position={[0, 0, -0.05]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={ringTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={midRef} position={[0, 0, 0.02]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={midTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.04]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={ringTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={nucleusRef} position={[0, 0, 0.08]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={nucleusTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Firework burst shapes ──────────────────────────────────────────────── */
export type BurstShape =
  | "spherical" // uniform 3D sphere (open hand)
  | "heart" // 2D heart silhouette with depth jitter (love)
  | "fountain" // upward cone (thumbs up)
  | "cascade"; // wide horizontal burst with upward arc (flag salute)

function getBurstDirection(
  shape: BurstShape,
  i: number,
  total: number,
): [number, number, number] {
  if (shape === "spherical") {
    // Fibonacci sphere — uniform distribution
    const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
    return [
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi),
    ];
  }
  if (shape === "heart") {
    const t = (i / total) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    const mag = Math.sqrt(x * x + y * y) || 1;
    const jitter = 0.85 + Math.random() * 0.3;
    return [
      (x / mag) * jitter,
      (y / mag) * jitter,
      (Math.random() - 0.5) * 0.35,
    ];
  }
  if (shape === "fountain") {
    // Cone upward — elev 35°–85°
    const angle = Math.random() * Math.PI * 2;
    const elev = Math.PI / 5 + Math.random() * (Math.PI / 2.4);
    return [
      Math.cos(angle) * Math.cos(elev) * 0.85,
      Math.sin(elev),
      Math.sin(angle) * Math.cos(elev) * 0.85,
    ];
  }
  // cascade — wide horizontal arc with strong upward bias on first half
  {
    const angle = (i / total) * Math.PI * 2;
    const upBias = 0.4 + Math.random() * 0.5;
    const horizSpread = 0.7 + Math.random() * 0.5;
    return [
      Math.cos(angle) * horizSpread,
      upBias,
      Math.sin(angle) * horizSpread * 0.55,
    ];
  }
}

/* ─── FireworkBurst (instanced particles with drag + gravity) ────────────── */
interface BurstProps {
  reduced: boolean;
  shape?: BurstShape;
  /** hex colors — particles are colored from this palette */
  palette?: string[];
  /** seconds after mount before the burst ignites */
  delay?: number;
  /** total particles (auto-halved when reduced) */
  count?: number;
  /** initial speed multiplier (units/sec) */
  speed?: number;
  /** downward acceleration */
  gravity?: number;
  /** velocity drag (higher = slows faster) */
  drag?: number;
  /** particle lifetime (seconds) */
  life?: number;
  /** base size of each particle */
  size?: number;
  /** emit origin in scene */
  origin?: [number, number, number];
}

export function FireworkBurst({
  reduced,
  shape = "spherical",
  palette = ["#FFD86A", "#FF5555", "#FFFFFF", "#FFE9B0"],
  delay = 0.55,
  count = 220,
  speed = 2.4,
  gravity = 0.9,
  drag = 1.1,
  life = 1.8,
  size = 0.085,
  origin = [0, 0, 0],
}: BurstProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const realCount = reduced ? Math.floor(count * 0.45) : count;

  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.25, "rgba(255,235,180,0.95)"],
    [0.6, "rgba(255,120,60,0.4)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const particles = useMemo(
    () =>
      Array.from({ length: realCount }, (_, i) => {
        const dir = getBurstDirection(shape, i, realCount);
        return {
          dx: dir[0],
          dy: dir[1],
          dz: dir[2],
          v0: speed * (0.75 + Math.random() * 0.5),
          drag: drag * (0.8 + Math.random() * 0.4),
          gravity: gravity * (0.7 + Math.random() * 0.6),
          size: size * (0.75 + Math.random() * 0.7),
          life: life * (0.8 + Math.random() * 0.5),
          delay: Math.random() * 0.12,
          colorIdx: Math.floor(Math.random() * palette.length),
          twinkleFreq: 6 + Math.random() * 8,
          phase: Math.random() * Math.PI * 2,
        };
      }),
    [realCount, shape, palette.length, speed, drag, gravity, size, life],
  );

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < particles.length; i++) {
      c.set(palette[particles[i].colorIdx % palette.length]);
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles, palette]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = t - delay - p.delay;
      if (localT <= 0) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }
      // Projectile with linear drag: distance = (v0/drag) * (1 - e^(-drag*t))
      const dragFactor = (1 - Math.exp(-p.drag * localT)) / p.drag;
      const x = origin[0] + p.dx * p.v0 * dragFactor;
      const y =
        origin[1] +
        p.dy * p.v0 * dragFactor -
        0.5 * p.gravity * localT * localT;
      const z = origin[2] + p.dz * p.v0 * dragFactor;

      // Fade: quick ease-in, slow ease-out
      const lifeT = Math.min(localT / p.life, 1);
      const fadeIn = Math.min(lifeT / 0.08, 1);
      const fadeOut = 1 - Math.pow(Math.max(0, (lifeT - 0.15) / 0.85), 2.2);
      const twinkle = 0.65 + 0.35 * Math.sin(t * p.twinkleFreq + p.phase);
      const fade = fadeIn * Math.max(0, fadeOut);

      dummy.position.set(x, y, z);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * fade * twinkle);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, realCount]}
      frustumCulled={false}
    >
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

/* ─── Lingering sparkle layer (drifts after the burst settles) ──────────── */
interface SparkleProps {
  reduced: boolean;
  color?: string;
  count?: number;
  /** when these sparkles start appearing (seconds since mount) */
  fadeInAt?: number;
  /** scene radius they drift within */
  radius?: number;
}

export function LingeringSparkles({
  reduced,
  color = "rgba(255,235,180,1)",
  count = 18,
  fadeInAt = 1.0,
  radius = 2.2,
}: SparkleProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useStarSparkleTexture(color);
  const realCount = reduced ? Math.floor(count * 0.55) : count;

  const sparkles = useMemo(
    () =>
      Array.from({ length: realCount }, () => ({
        r: radius * (0.6 + Math.random() * 0.55),
        theta: Math.random() * Math.PI * 2,
        ySpeed: 0.08 + Math.random() * 0.22,
        wobble: 0.12 + Math.random() * 0.22,
        wobbleFreq: 0.6 + Math.random() * 1.6,
        size: 0.16 + Math.random() * 0.22,
        twinkleFreq: 1.4 + Math.random() * 3,
        spinSpeed: (Math.random() - 0.5) * 1.4,
        phase: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.8,
        y0: -0.6 + Math.random() * 1.3,
      })),
    [realCount, radius],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const visible = Math.min(Math.max(0, t - fadeInAt) / 0.5, 1);
    for (let i = 0; i < sparkles.length; i++) {
      const s = sparkles[i];
      const localT = Math.max(0, t - fadeInAt - s.delay);
      const x = Math.cos(s.theta) * s.r + Math.sin(t * s.wobbleFreq + s.phase) * s.wobble;
      const y = s.y0 + localT * s.ySpeed * (reduced ? 0.5 : 1);
      const z = Math.sin(s.theta) * s.r * 0.6;
      const twinkle = 0.4 + 0.6 * Math.sin(t * s.twinkleFreq + s.phase);
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, 0, t * s.spinSpeed * (reduced ? 0.3 : 1));
      dummy.scale.setScalar(s.size * visible * (0.45 + twinkle * 0.7));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, realCount]}
      frustumCulled={false}
    >
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

/* ─── Palettes shared across the 4 gestures ──────────────────────────────── */
export const CORE_PALETTES = {
  heart: {
    nucleus: "rgba(255,235,200,1)",
    mid: "rgba(255,80,90,0.7)",
    aura: "rgba(200,16,46,0.25)",
    ringHex: "#FFD700",
  } satisfies CorePalette,
  nova: {
    nucleus: "rgba(255,250,220,1)",
    mid: "rgba(255,170,80,0.65)",
    aura: "rgba(180,40,40,0.22)",
    ringHex: "#FFE9B0",
  } satisfies CorePalette,
  flag: {
    nucleus: "rgba(255,240,180,1)",
    mid: "rgba(255,90,60,0.65)",
    aura: "rgba(200,16,46,0.3)",
    ringHex: "#FFD86A",
  } satisfies CorePalette,
  pillar: {
    nucleus: "rgba(255,245,200,1)",
    mid: "rgba(255,180,80,0.65)",
    aura: "rgba(140,80,20,0.25)",
    ringHex: "#FFD86A",
  } satisfies CorePalette,
};

export const BURST_PALETTES = {
  heart: ["#FFD700", "#FF4D6A", "#FFFFFF", "#C8102E"],
  nova: ["#FFE9B0", "#FFD86A", "#FFFFFF", "#FF7A6A"],
  flag: ["#FFD700", "#FFE9B0", "#C8102E", "#FFFFFF"],
  pillar: ["#FFD86A", "#FFE9B0", "#FFFFFF", "#FFA040"],
};
