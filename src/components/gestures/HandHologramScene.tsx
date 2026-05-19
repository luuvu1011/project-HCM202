"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { HandFrame, HandLandmarks } from "@/types/gestures";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Props {
  frame: HandFrame | null;
  mirror?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Cinematic Hand Hologram
 * Multi-layer R3F scene that follows the user's hand with damped motion.
 * Layers (back → front):
 *   - Volumetric nebula billboard
 *   - Far star field
 *   - Background ambient orbiters
 *   - Vortex spiral (instanced)
 *   - Energy rings (3 axes)
 *   - Palm core glow + lens flare
 *   - Fingertip glows + motion trails
 * ────────────────────────────────────────────────────────────────────────── */

const FINGERTIPS = [4, 8, 12, 16, 20] as const;
const TRAIL_LEN = 14;

// Shared target — mutated outside React tree, read in useFrame for jank-free updates.
interface HandTarget {
  detected: number;          // 0 / 1 (set by effect)
  detectedSmooth: number;    // smoothed
  palm: THREE.Vector3;       // raw target (normalized to plane coords)
  palmSmooth: THREE.Vector3;
  velocity: THREE.Vector3;
  spread: number;            // 0..0.4 rough spread
  spreadSmooth: number;
  tips: THREE.Vector3[];     // 5 fingertip targets
  tipsSmooth: THREE.Vector3[];
  trails: THREE.Vector3[][]; // ring buffers per fingertip
}

function createTarget(): HandTarget {
  return {
    detected: 0,
    detectedSmooth: 0,
    palm: new THREE.Vector3(),
    palmSmooth: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    spread: 0.18,
    spreadSmooth: 0.18,
    tips: Array.from({ length: 5 }, () => new THREE.Vector3()),
    tipsSmooth: Array.from({ length: 5 }, () => new THREE.Vector3()),
    trails: Array.from({ length: 5 }, () =>
      Array.from({ length: TRAIL_LEN }, () => new THREE.Vector3()),
    ),
  };
}

// Convert MediaPipe (0..1, y-down) → world plane coord (centered, y-up, ±1 box-ish)
function toPlane(out: THREE.Vector3, x: number, y: number, z: number, mirror: boolean) {
  out.set(((mirror ? 1 - x : x) - 0.5) * 2, -(y - 0.5) * 2, -z * 1.5);
}

function updateTargetFromHand(target: HandTarget, hand: HandLandmarks, mirror: boolean) {
  const palm = hand[9] ?? hand[0];
  if (!palm) return;
  toPlane(target.palm, palm.x, palm.y, palm.z, mirror);

  for (let i = 0; i < FINGERTIPS.length; i++) {
    const tip = hand[FINGERTIPS[i]];
    if (tip) toPlane(target.tips[i], tip.x, tip.y, tip.z, mirror);
  }

  const wrist = hand[0];
  if (wrist) {
    let total = 0;
    for (let i = 0; i < FINGERTIPS.length; i++) {
      const tip = hand[FINGERTIPS[i]];
      if (!tip) continue;
      const dx = tip.x - wrist.x;
      const dy = tip.y - wrist.y;
      total += Math.hypot(dx, dy);
    }
    target.spread = Math.min(0.45, total / FINGERTIPS.length);
  }
}

/* ─── Sprite texture (radial gradient) ─────────────────────────────────── */
function useSpriteTexture(stops: Array<[number, string]>) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [stop, color] of stops) g.addColorStop(stop, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
    // stops object identity changes each render but that's fine for memo since
    // we never change palette mid-run; keep deps stable via JSON serialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(stops)]);
}

/* ─── Ring texture (annular gradient) ──────────────────────────────────── */
function useRingTexture(color: string, innerColor = "rgba(0,0,0,0)") {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 78, 128, 128, 128);
    g.addColorStop(0, innerColor);
    g.addColorStop(0.45, innerColor);
    g.addColorStop(0.55, color);
    g.addColorStop(0.75, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    // Inner ring sharpening
    const g2 = ctx.createRadialGradient(128, 128, 92, 128, 128, 106);
    g2.addColorStop(0, "rgba(0,0,0,0)");
    g2.addColorStop(0.5, "rgba(255,255,255,0.65)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [color, innerColor]);
}

/* ─── Vortex spiral (instanced sprites orbiting palm) ──────────────────── */
function VortexSpiral({
  targetRef,
  reduced,
  count = 260,
}: {
  targetRef: React.MutableRefObject<HandTarget>;
  reduced: boolean;
  count?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useSpriteTexture([
    [0, "rgba(255,255,255,1)"],
    [0.25, "rgba(255,220,128,0.95)"],
    [0.55, "rgba(255,90,140,0.45)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  // Pre-compute orbit parameters
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Distribute across 3 sub-layers for depth
      const layer = i % 3; // 0 inner, 1 mid, 2 outer
      const baseR = 0.32 + layer * 0.28 + Math.random() * 0.22;
      const tilt = (Math.random() - 0.5) * 0.65;
      const phase = Math.random() * Math.PI * 2;
      const speed = (0.55 + Math.random() * 0.9) * (layer === 0 ? 1.4 : layer === 1 ? 1.0 : 0.65);
      const wobble = Math.random() * 0.18 + 0.04;
      const wobbleFreq = 0.8 + Math.random() * 1.6;
      const size = 0.07 + Math.random() * 0.11;
      const hue = Math.random();
      // Palette mix: gold / crimson / cyan
      let color: THREE.Color;
      if (hue < 0.45) color = new THREE.Color("#FFD86A");
      else if (hue < 0.78) color = new THREE.Color("#FF4D7A");
      else color = new THREE.Color("#7BE0FF");
      return { baseR, tilt, phase, speed, wobble, wobbleFreq, size, color, layer };
    });
  }, [count]);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < particles.length; i++) {
      mesh.setColorAt(i, particles[i].color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const target = targetRef.current;
    const detect = target.detectedSmooth;
    const spread = target.spreadSmooth;
    const palm = target.palmSmooth;
    const vx = target.velocity.x;
    const vy = target.velocity.y;

    // Audio-reactive-like pulse from spread
    const pulse = 1 + Math.sin(t * 2.4) * 0.06;
    const radiusScale = (0.85 + spread * 1.8) * pulse;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const a = p.phase + t * p.speed * (reduced ? 0.25 : 1);
      const r = (p.baseR + Math.sin(t * p.wobbleFreq + p.phase) * p.wobble) * radiusScale;

      // 3D spiral: rotate around Y with tilt offset on Z
      const cx = Math.cos(a) * r;
      const cz = Math.sin(a) * r * 0.85;
      const cy = Math.sin(a * 1.7 + p.phase) * p.wobble * 1.2 + p.tilt * 0.4;

      // Inertia: particles get dragged a bit by hand velocity
      const drag = (p.layer === 0 ? 1.4 : p.layer === 1 ? 0.9 : 0.5) * detect;
      dummy.position.set(
        palm.x + cx + vx * drag,
        palm.y + cy + vy * drag,
        palm.z + cz,
      );

      // Sprite always faces camera
      dummy.quaternion.copy(state.camera.quaternion);
      const fade = 0.35 + detect * 0.65;
      const sizePulse = p.size * (0.85 + 0.25 * Math.sin(t * 6 + i));
      dummy.scale.setScalar(sizePulse * fade);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={1}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ─── Energy rings (3 rotating glow tori at hand center) ──────────────── */
function EnergyRings({
  targetRef,
  reduced,
}: {
  targetRef: React.MutableRefObject<HandTarget>;
  reduced: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const ringGold = useRingTexture("rgba(255,215,0,0.95)");
  const ringRed = useRingTexture("rgba(255,80,128,0.95)");
  const ringCyan = useRingTexture("rgba(120,220,255,0.95)");
  const textures = [ringGold, ringRed, ringCyan];

  // Pre-set static axis tilts per ring
  const axes = useMemo(
    () =>
      [
        new THREE.Euler(0, 0, 0),                // horizontal
        new THREE.Euler(Math.PI / 2.4, 0.4, 0),  // tilted forward
        new THREE.Euler(0.3, Math.PI / 3, 0.5),  // canted
      ] as const,
    [],
  );

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const target = targetRef.current;
    g.position.copy(target.palmSmooth);

    // Subtle bulk rotation for whole rig
    if (!reduced) g.rotation.y = Math.sin(t * 0.3) * 0.12;

    for (let i = 0; i < ringRefs.length; i++) {
      const m = ringRefs[i].current;
      if (!m) continue;
      const sign = i % 2 === 0 ? 1 : -1;
      const speed = reduced ? 0.04 : 0.18 + i * 0.06;
      // Apply base axis tilt then rotate around local Z over time
      m.rotation.x = axes[i].x;
      m.rotation.y = axes[i].y + t * speed * sign;
      m.rotation.z = axes[i].z + t * speed * 0.6 * sign;

      const pulse = 1 + Math.sin(t * (1.6 + i * 0.4) + i) * 0.08;
      const baseR = 1.05 + i * 0.18;
      const radius = baseR * (0.55 + target.spreadSmooth * 1.8) * pulse * (0.55 + target.detectedSmooth * 0.55);
      m.scale.setScalar(radius);

      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.55 + target.detectedSmooth * 0.45) * (i === 0 ? 1 : i === 1 ? 0.85 : 0.7);
    }
  });

  return (
    <group ref={groupRef}>
      {textures.map((tex, i) => (
        <mesh ref={ringRefs[i]} key={i}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial
            map={tex}
            transparent
            opacity={0.85}
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Palm core glow ──────────────────────────────────────────────────── */
function PalmCore({ targetRef }: { targetRef: React.MutableRefObject<HandTarget> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const coreTex = useSpriteTexture([
    [0, "rgba(255,255,255,1)"],
    [0.18, "rgba(255,232,160,1)"],
    [0.4, "rgba(255,140,80,0.7)"],
    [0.75, "rgba(255,60,140,0.25)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const haloTex = useSpriteTexture([
    [0, "rgba(180,220,255,0.4)"],
    [0.4, "rgba(120,180,255,0.15)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const flareTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 32, 256, 32);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,235,180,0.95)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const target = targetRef.current;
    const palm = target.palmSmooth;
    const detect = target.detectedSmooth;

    if (meshRef.current) {
      meshRef.current.position.copy(palm);
      meshRef.current.quaternion.copy(state.camera.quaternion);
      const pulse = 0.6 + Math.sin(t * 2.8) * 0.05;
      meshRef.current.scale.setScalar((0.8 + detect * 0.5) * pulse);
    }
    if (haloRef.current) {
      haloRef.current.position.copy(palm);
      haloRef.current.quaternion.copy(state.camera.quaternion);
      const pulse = 1 + Math.sin(t * 1.6) * 0.1;
      haloRef.current.scale.setScalar((2.0 + detect * 1.2) * pulse);
    }
    if (flareRef.current) {
      flareRef.current.position.copy(palm);
      flareRef.current.quaternion.copy(state.camera.quaternion);
      flareRef.current.rotation.z = Math.sin(t * 0.4) * 0.06;
      const pulse = 0.85 + Math.sin(t * 3.2) * 0.15;
      flareRef.current.scale.set((1.6 + detect * 1.2) * pulse, 0.18, 1);
      const mat = flareRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + detect * 0.4;
    }
  });

  return (
    <>
      <mesh ref={haloRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={haloTex}
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={meshRef}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshBasicMaterial
          map={coreTex}
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={flareRef}>
        <planeGeometry args={[1.6, 1]} />
        <meshBasicMaterial
          map={flareTex}
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

/* ─── Fingertip glows + motion trails ─────────────────────────────────── */
const FINGER_COLORS = [
  new THREE.Color("#FFD86A"), // thumb
  new THREE.Color("#FF7B9A"), // index
  new THREE.Color("#FFFFFF"), // middle
  new THREE.Color("#7BE0FF"), // ring
  new THREE.Color("#B98AFF"), // pinky
];

function FingerTrails({
  targetRef,
  reduced,
}: {
  targetRef: React.MutableRefObject<HandTarget>;
  reduced: boolean;
}) {
  // 5 fingertips × TRAIL_LEN trail points → instancedMesh
  const count = 5 * TRAIL_LEN;
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useSpriteTexture([
    [0, "rgba(255,255,255,1)"],
    [0.35, "rgba(255,255,210,0.85)"],
    [0.7, "rgba(255,180,80,0.35)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let f = 0; f < 5; f++) {
      for (let i = 0; i < TRAIL_LEN; i++) {
        const idx = f * TRAIL_LEN + i;
        mesh.setColorAt(idx, FINGER_COLORS[f]);
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const target = targetRef.current;
    const detect = target.detectedSmooth;

    for (let f = 0; f < 5; f++) {
      const trail = target.trails[f];
      const tipNow = target.tipsSmooth[f];

      // Shift trail (newest at end)
      for (let i = 0; i < TRAIL_LEN - 1; i++) {
        trail[i].copy(trail[i + 1]);
      }
      trail[TRAIL_LEN - 1].copy(tipNow);

      for (let i = 0; i < TRAIL_LEN; i++) {
        const idx = f * TRAIL_LEN + i;
        const p = trail[i];
        const age = (TRAIL_LEN - 1 - i) / TRAIL_LEN; // 0 newest → ~1 oldest
        const lifeScale = (1 - age) ** 1.4;
        const size = (0.08 + lifeScale * 0.22) * (0.6 + detect * 0.6);
        const flicker = 0.85 + 0.15 * Math.sin(t * 9 + i + f);
        dummy.position.copy(p);
        dummy.quaternion.copy(state.camera.quaternion);
        dummy.scale.setScalar(size * flicker * (reduced ? 0.7 : 1));
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
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

/* ─── Background star field (parallax depth) ──────────────────────────── */
function StarField({ count = 140 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useSpriteTexture([
    [0, "rgba(255,255,255,1)"],
    [0.5, "rgba(220,235,255,0.45)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 5,
        z: -3 - Math.random() * 4,
        size: 0.025 + Math.random() * 0.06,
        twinkleFreq: 0.6 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleFreq + s.phase);
      dummy.position.set(s.x, s.y, s.z);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(s.size * (0.6 + twinkle * 0.6));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        color="#cfe2ff"
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ─── Soft volumetric nebula billboard ────────────────────────────────── */
function NebulaBackdrop({ targetRef }: { targetRef: React.MutableRefObject<HandTarget> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useSpriteTexture([
    [0, "rgba(255,90,140,0.45)"],
    [0.35, "rgba(120,60,220,0.30)"],
    [0.7, "rgba(40,80,180,0.10)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.rotation.z = t * 0.04;
    // Drift toward palm slightly for parallax
    const target = targetRef.current;
    m.position.x = target.palmSmooth.x * 0.35;
    m.position.y = target.palmSmooth.y * 0.35;
    m.position.z = -2.5;
    const pulse = 1 + Math.sin(t * 0.6) * 0.08;
    m.scale.setScalar(6.2 * pulse);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.85}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ─── Per-frame smoothing driver (no React state — refs only) ─────────── */
function TargetDriver({
  targetRef,
  reduced,
}: {
  targetRef: React.MutableRefObject<HandTarget>;
  reduced: boolean;
}) {
  const prev = useRef(new THREE.Vector3());
  useFrame((_, delta) => {
    const target = targetRef.current;
    // Frame-rate-aware lerp factor
    const k = reduced ? 0.12 : 0.22;
    const a = 1 - Math.exp(-k * 60 * delta);

    prev.current.copy(target.palmSmooth);
    target.palmSmooth.lerp(target.palm, a);
    target.velocity.copy(target.palmSmooth).sub(prev.current);

    target.detectedSmooth += (target.detected - target.detectedSmooth) * Math.min(1, delta * 6);
    target.spreadSmooth += (target.spread - target.spreadSmooth) * Math.min(1, delta * 8);

    for (let i = 0; i < 5; i++) {
      target.tipsSmooth[i].lerp(target.tips[i], a * 1.1);
    }
  });
  return null;
}

/* ─── Subtle camera drift for parallax ────────────────────────────────── */
function CameraDrift({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const origin = useRef(new THREE.Vector3(0, 0, 4.4));
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    camera.position.x = origin.current.x + Math.sin(t * 0.18) * 0.18;
    camera.position.y = origin.current.y + Math.cos(t * 0.14) * 0.12;
    camera.position.z = origin.current.z;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─── Scene wrapper ───────────────────────────────────────────────────── */
function Scene({
  targetRef,
  reduced,
}: {
  targetRef: React.MutableRefObject<HandTarget>;
  reduced: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#05070d", 4, 9.5]} />
      <ambientLight intensity={0.4} color="#a4c4ff" />
      <pointLight position={[2, 2, 3]} intensity={14} color="#FFD86A" distance={8} decay={1.8} />
      <pointLight position={[-2.2, -1.4, 2]} intensity={10} color="#FF4D7A" distance={8} decay={1.8} />
      <pointLight position={[0, 0, 4]} intensity={6} color="#9bd6ff" distance={6} decay={2} />

      <TargetDriver targetRef={targetRef} reduced={reduced} />
      <CameraDrift reduced={reduced} />

      <NebulaBackdrop targetRef={targetRef} />
      <StarField count={reduced ? 60 : 140} />
      <VortexSpiral targetRef={targetRef} reduced={reduced} count={reduced ? 110 : 260} />
      <EnergyRings targetRef={targetRef} reduced={reduced} />
      <PalmCore targetRef={targetRef} />
      <FingerTrails targetRef={targetRef} reduced={reduced} />
    </>
  );
}

/* ─── Public component ────────────────────────────────────────────────── */
export function HandHologramScene({ frame, mirror = true }: Props) {
  const reduced = useReducedMotion();
  const targetRef = useRef<HandTarget>(createTarget());

  // Push frame data into the ref target (does NOT trigger renders)
  useEffect(() => {
    const t = targetRef.current;
    if (!frame || frame.landmarks.length === 0) {
      t.detected = 0;
      return;
    }
    t.detected = 1;
    updateTargetFromHand(t, frame.landmarks[0], mirror);
  }, [frame, mirror]);

  return (
    <div className="absolute inset-0">
      {/* Vignette + chromatic edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(120,200,255,0.06) 0%, transparent 60%)",
        }}
      />
      <Canvas
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.4], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Scene targetRef={targetRef} reduced={reduced} />
      </Canvas>
    </div>
  );
}
