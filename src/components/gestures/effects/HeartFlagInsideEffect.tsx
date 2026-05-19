"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  useRadialTexture,
  useStreakTexture,
} from "@/components/gestures/effects/cinematicTextures";

interface Props {
  emotion: string;
  particlesReady?: boolean;
}

/* ─── Heart curve sampler (parametric, normalised) ───────────────────────── */
function heartXY(t: number, scale: number): [number, number] {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [(x / 17) * scale, ((y + 6) / 17) * scale];
}

/* Deterministic noise so the particle field stays stable across renders. */
function srnd(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* Lub-dub heartbeat curve — two sharp Gaussian peaks per cycle. */
function heartbeatPulse(t: number, bpm = 64): number {
  const period = 60 / bpm;
  const phase = ((t % period) + period) % period / period;
  const lub = Math.exp(-Math.pow((phase - 0.05) * 22, 2));
  const dub = Math.exp(-Math.pow((phase - 0.22) * 22, 2)) * 0.85;
  return Math.min(1, lub + dub);
}

/* ─── Procedural Vietnam flag with radiant golden star ───────────────────── */
function createFlagTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 680;
  const ctx = canvas.getContext("2d")!;

  // Crimson base
  ctx.fillStyle = "#C8102E";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Radial darkening
  const grad = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 60,
    canvas.width / 2, canvas.height / 2, canvas.width / 1.3,
  );
  grad.addColorStop(0, "rgba(255,120,90,0.25)");
  grad.addColorStop(1, "rgba(40,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Radiant golden star
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const outerR = 220;
  const innerR = outerR * 0.4;

  // Outer halo around the star
  const halo = ctx.createRadialGradient(cx, cy, outerR * 0.4, cx, cy, outerR * 2.4);
  halo.addColorStop(0, "rgba(255,235,150,0.85)");
  halo.addColorStop(0.4, "rgba(255,200,80,0.45)");
  halo.addColorStop(1, "rgba(255,150,30,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR * 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.shadowColor = "rgba(255,215,0,0.95)";
  ctx.shadowBlur = 60;
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,210,0.7)";
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

/* ─── Shared heartbeat ref ──────────────────────────────────────────────── */
interface BeatRef {
  beat: number;
}

/* ─── Massive particle field: chaos → heart formation → swirl ────────────── */
function HeartParticleStorm({
  reduced,
  count,
  beatRef,
}: {
  reduced: boolean;
  count: number;
  beatRef: React.RefObject<BeatRef>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.3, "rgba(255,230,150,0.95)"],
    [0.65, "rgba(220,40,40,0.5)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const particles = useMemo(() => {
    const arr: Array<{
      tx: number; ty: number; tz: number;     // target position (on heart)
      sx: number; sy: number; sz: number;     // chaos start
      orbitR: number; orbitTheta: number; orbitSpeed: number;
      verticalDrift: number;
      size: number; delay: number;
      twinkleFreq: number; phase: number;
      colorMix: number;
      ring: 0 | 1 | 2;  // 0=heart silhouette, 1=interior, 2=outer aura
    }> = [];
    for (let i = 0; i < count; i++) {
      const r1 = srnd(i * 2.1 + 1);
      const r2 = srnd(i * 3.7 + 7);
      const r3 = srnd(i * 5.3 + 11);
      const r4 = srnd(i * 7.9 + 13);
      const r5 = srnd(i * 11.2 + 17);
      const r6 = srnd(i * 13.5 + 19);
      const r7 = srnd(i * 17.6 + 23);
      const r8 = srnd(i * 19.3 + 29);

      let ring: 0 | 1 | 2;
      let tx: number, ty: number, tz: number;

      if (r1 < 0.45) {
        // Interior — heart curve at scaled-down radius
        ring = 1;
        const ht = r2 * Math.PI * 2;
        const sampleScale = 0.15 + r3 * 0.85;
        const [hx, hy] = heartXY(ht, 1.5 * sampleScale);
        tx = hx + (r4 - 0.5) * 0.05;
        ty = hy + (r5 - 0.5) * 0.05;
        tz = (r6 - 0.5) * 0.4;
      } else if (r1 < 0.78) {
        // Heart outline silhouette (sharp definition)
        ring = 0;
        const ht = r2 * Math.PI * 2;
        const [hx, hy] = heartXY(ht, 1.55);
        tx = hx + (r3 - 0.5) * 0.04;
        ty = hy + (r4 - 0.5) * 0.04;
        tz = (r5 - 0.5) * 0.2;
      } else {
        // Outer aura — orbiting at expanded radius
        ring = 2;
        const ht = r2 * Math.PI * 2;
        const [hx, hy] = heartXY(ht, 2.0 + r3 * 0.6);
        tx = hx + (r4 - 0.5) * 0.15;
        ty = hy + (r5 - 0.5) * 0.15;
        tz = (r6 - 0.5) * 0.8;
      }

      arr.push({
        tx, ty, tz,
        sx: (r6 - 0.5) * 9,
        sy: (r7 - 0.5) * 6,
        sz: (r8 - 0.5) * 5,
        orbitR: 0.02 + r4 * 0.06,
        orbitTheta: r5 * Math.PI * 2,
        orbitSpeed: 0.4 + r6 * 1.6,
        verticalDrift: (r7 - 0.5) * 0.08,
        size: 0.025 + r3 * 0.06,
        delay: r1 * 0.35,
        twinkleFreq: 1.5 + r4 * 4,
        phase: r5 * Math.PI * 2,
        colorMix: r8,
        ring,
      });
    }
    return arr;
  }, [count]);

  // Bake per-instance colors
  useMemo(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.colorMix < 0.4) c.set("#FFD700");     // gold
      else if (p.colorMix < 0.65) c.set("#FFE680"); // soft gold
      else if (p.colorMix < 0.85) c.set("#FF3838"); // red
      else c.set("#FFFFFF");                         // white sparkle
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const beat = beatRef.current?.beat ?? 0;
    const beatExpand = 1 + beat * 0.18;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = Math.max(0, t - p.delay);

      // Phase 1 (0 → 1.0s): chaos → convergence
      // Phase 2 (1.0s+): swirl + beat pulse
      const convergeK = Math.min(localT / 1.1, 1);
      const eased = 1 - Math.pow(1 - convergeK, 3);

      // Add slow swirl around the target after formation
      const swirlT = Math.max(0, localT - 1.0) * p.orbitSpeed * (reduced ? 0.3 : 1);
      const ox = Math.cos(swirlT + p.orbitTheta) * p.orbitR;
      const oy = Math.sin(swirlT + p.orbitTheta) * p.orbitR;
      const oyDrift = Math.sin(t * 0.6 + p.phase) * p.verticalDrift;

      // Spiral-in convergence — particles curve in (instead of straight line)
      const spiralAngle = (1 - eased) * Math.PI * 1.5;
      const cosA = Math.cos(spiralAngle);
      const sinA = Math.sin(spiralAngle);
      const dx = p.sx - p.tx;
      const dy = p.sy - p.ty;
      const spiraledX = dx * cosA - dy * sinA;
      const spiraledY = dx * sinA + dy * cosA;

      const x = p.tx * eased + (p.tx + spiraledX) * (1 - eased) + ox;
      const y = p.ty * eased + (p.ty + spiraledY) * (1 - eased) + oy + oyDrift;
      const z = p.tz * eased + p.sz * (1 - eased);

      const fade = eased;
      const twinkle = 0.4 + 0.6 * Math.sin(t * p.twinkleFreq + p.phase);

      // Particles inside/on the heart pulse with each beat
      const pulse = p.ring === 2 ? 1 : beatExpand;

      dummy.position.set(x * pulse, y * pulse, z);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * fade * (0.4 + twinkle * 0.85));
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
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ─── Holographic energy rings circling the heart ────────────────────────── */
function EnergyRings({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const streakTex = useStreakTexture("rgba(255,215,80,0.85)");
  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (!reduced) {
      g.rotation.z = t * 0.18;
      g.rotation.x = Math.sin(t * 0.25) * 0.18;
      g.rotation.y = Math.cos(t * 0.2) * 0.22;
    }
  });
  return (
    <group ref={groupRef} position={[0, 0, -0.2]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          rotation={[Math.PI / 2 + i * 0.6, 0, (i * Math.PI) / 3]}
        >
          <torusGeometry args={[1.95 + i * 0.18, 0.012, 6, 96]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#FFD86A" : "#FF3838"}
            transparent
            opacity={0.4}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {/* Soft streak rays */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh
          key={`s${i}`}
          rotation={[0, 0, (i * Math.PI * 2) / 16]}
          position={[0, 0, -0.5]}
        >
          <planeGeometry args={[0.06, 3.6]} />
          <meshBasicMaterial
            map={streakTex}
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Flag inside the heart with radiant central star ────────────────────── */
function FlagCore({
  reduced,
  beatRef,
}: {
  reduced: boolean;
  beatRef: React.RefObject<BeatRef>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const flagTex = useMemo(() => createFlagTexture(), []);
  const haloTex = useRadialTexture([
    [0, "rgba(255,235,150,0.85)"],
    [0.4, "rgba(255,200,80,0.45)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = beatRef.current?.beat ?? 0;
    const m = meshRef.current;
    if (m) {
      const grow = Math.min(Math.max(0, t - 0.6) / 0.6, 1);
      const eased = 1 - Math.pow(1 - grow, 3);
      const pulse = 1 + beat * 0.13;
      m.scale.set((0.5 + eased * 0.5) * pulse, (0.5 + eased * 0.5) * pulse, 1);
      if (!reduced) {
        m.rotation.y = Math.sin(t * 0.4) * 0.06;
        m.rotation.z = Math.sin(t * 0.3) * 0.015;
      }
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = eased;
      mat.emissiveIntensity = 0.45 + beat * 0.6;
    }
    if (haloRef.current) {
      haloRef.current.lookAt(state.camera.position);
      const grow = Math.min(Math.max(0, t - 0.6) / 0.6, 1);
      const eased = 1 - Math.pow(1 - grow, 3);
      const pulse = 1 + beat * 0.2;
      haloRef.current.scale.setScalar(2.4 * eased * pulse);
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.5 + beat * 0.4) * eased;
    }
  });

  return (
    <group position={[0, -0.05, 0.04]}>
      <mesh ref={haloRef} position={[0, 0, -0.15]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={haloTex}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={meshRef}>
        <planeGeometry args={[1.85, 1.22, 24, 16]} />
        <meshStandardMaterial
          map={flagTex}
          side={THREE.DoubleSide}
          emissive={new THREE.Color("#C8102E")}
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.2}
          transparent
        />
      </mesh>
    </group>
  );
}

/* ─── Volumetric fog backdrop sphere ─────────────────────────────────────── */
function VolumetricFog() {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useRadialTexture([
    [0, "rgba(40,5,5,0.7)"],
    [0.45, "rgba(100,20,15,0.35)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.lookAt(state.camera.position);
    m.scale.setScalar(8 + Math.sin(t * 0.3) * 0.6);
    m.rotation.z = t * 0.04;
  });
  return (
    <mesh ref={meshRef} position={[0, 0, -2.5]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ─── Rising embers ──────────────────────────────────────────────────────── */
function RisingEmbers({ reduced, count = 80 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,200,80,0.95)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (srnd(i * 7 + 1) - 0.5) * 5,
        y0: -2.5 - srnd(i * 11 + 3),
        z: -1 + srnd(i * 13 + 5) * 2,
        speed: 0.4 + srnd(i * 17 + 7) * 0.9,
        wobble: 0.08 + srnd(i * 19 + 9) * 0.18,
        wobbleFreq: 0.5 + srnd(i * 23 + 11) * 2,
        size: 0.04 + srnd(i * 29 + 13) * 0.06,
        delay: srnd(i * 31 + 17) * 1.5,
        phase: srnd(i * 37 + 19) * Math.PI * 2,
        colorMix: srnd(i * 41 + 23),
      })),
    [count],
  );

  useMemo(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      if (s.colorMix < 0.6) c.set("#FFD86A");
      else if (s.colorMix < 0.9) c.set("#FF6B40");
      else c.set("#FFFFFF");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [seeds]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const lt = Math.max(0, t - s.delay);
      const y = s.y0 + lt * s.speed * (reduced ? 0.4 : 1);
      const x = s.x + Math.sin(t * s.wobbleFreq + s.phase) * s.wobble;
      const lifeT = Math.min(lt / 5, 1);
      const fade = lifeT < 0.2 ? lifeT / 0.2 : Math.max(0, 1 - (lifeT - 0.2) / 0.8);
      const twinkle = 0.7 + 0.3 * Math.sin(t * 5 + i);
      dummy.position.set(x, y, s.z);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(s.size * fade * twinkle);
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
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ─── Beat-driven lights ─────────────────────────────────────────────────── */
function BeatLights({
  reduced,
  beatRef,
}: {
  reduced: boolean;
  beatRef: React.RefObject<BeatRef>;
}) {
  const goldRef = useRef<THREE.PointLight>(null);
  const redRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeatPulse(t, 64);
    if (beatRef.current) beatRef.current.beat = beat;
    if (goldRef.current) goldRef.current.intensity = 22 + beat * 40;
    if (redRef.current) redRef.current.intensity = 18 + beat * 32;
  });
  return (
    <>
      <pointLight ref={goldRef} position={[2, 1.5, 3]} color="#FFD86A" distance={9} decay={1.5} />
      <pointLight ref={redRef} position={[-2, -1, 2.5]} color="#FF3838" distance={9} decay={1.5} />
      <pointLight position={[0, 0, 4]} intensity={10} color="#FFFFFF" distance={6} decay={2} />
    </>
  );
}

/* ─── Cinematic camera dolly ─────────────────────────────────────────────── */
function CinematicCam({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (reduced) {
      state.camera.position.set(0, 0, 4.4);
      state.camera.lookAt(0, 0, 0);
      return;
    }
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.18) * 0.18;
    state.camera.position.y = Math.cos(t * 0.14) * 0.12;
    state.camera.position.z = 4.4 - Math.sin(t * 0.25) * 0.18;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  const beatRef = useRef<BeatRef>({ beat: 0 });
  return (
    <>
      <color attach="background" args={["#020003"]} />
      <fog attach="fog" args={["#0a0205", 4, 11]} />
      <ambientLight intensity={0.4} color="#ffe0c8" />
      <BeatLights reduced={reduced} beatRef={beatRef} />
      <CinematicCam reduced={reduced} />

      <VolumetricFog />
      <EnergyRings reduced={reduced} />
      <FlagCore reduced={reduced} beatRef={beatRef} />
      <HeartParticleStorm reduced={reduced} count={reduced ? 600 : 1500} beatRef={beatRef} />
      <RisingEmbers reduced={reduced} count={reduced ? 30 : 80} />
    </>
  );
}

export function HeartFlagInsideEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Deep cinematic backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(180,30,30,0.32) 0%, rgba(20,4,8,0.85) 55%, #000 100%)",
        }}
      />

      <Canvas
        dpr={[1, 1.85]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.4], fov: 46 }}
        style={{ background: "transparent" }}
      >
        <Scene reduced={reduced} />
      </Canvas>

      {/* Bloom-like screen overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,180,80,0.14) 0%, transparent 60%)",
        }}
      />

      {/* Cinematic letterbox bars */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[6%] bg-black/85" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[6%] bg-black/85" />

      {/* Emotion line */}
      <motion.div
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{ delay: 1.1, duration: 0.9 }}
      >
        <p
          className="font-cinzel text-sm font-bold uppercase tracking-[0.36em] sm:text-base"
          style={{
            color: "#fff2c2",
            textShadow:
              "0 0 24px rgba(255,215,0,0.95), 0 2px 18px rgba(200,16,46,0.7), 0 0 60px rgba(255,170,0,0.55)",
          }}
        >
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}
