"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  useRadialTexture,
  useRingTexture,
  useStreakTexture,
  usePillarTexture,
  useStarSparkleTexture,
} from "@/components/gestures/effects/cinematicTextures";
import { CinematicCamera } from "@/components/gestures/effects/cinematicCamera";
import {
  BURST_PALETTES,
  CORE_PALETTES,
  FireworkBurst,
  HeartbeatCore,
  LingeringSparkles,
  heartbeat,
} from "@/components/gestures/effects/sharedEnergyCore";

interface Props {
  emotion: string;
}

/* ─── Vertical energy column (rising light pillar) ───────────────────── */
function EnergyPillar({ reduced }: { reduced: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const tex = usePillarTexture("rgba(255,225,140,0.95)");
  const innerTex = usePillarTexture("rgba(255,255,255,1)");

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = meshRef.current;
    const inner = innerRef.current;
    if (!m || !inner) return;
    m.lookAt(state.camera.position);
    inner.lookAt(state.camera.position);
    const lifeT = Math.min(t / 0.9, 1);
    const eased = 1 - Math.pow(1 - lifeT, 3);
    m.scale.set(2.2, 6.0 * eased, 1);
    inner.scale.set(0.6, 5.6 * eased, 1);
    if (!reduced) {
      const flicker = 0.85 + Math.sin(t * 12) * 0.15;
      (m.material as THREE.MeshBasicMaterial).opacity = 0.75 * flicker;
      (inner.material as THREE.MeshBasicMaterial).opacity = flicker;
    }
  });

  return (
    <group position={[0, 0, -0.4]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={tex}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={innerRef} position={[0, 0, 0.05]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={innerTex}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Expanding torus shockwaves ──────────────────────────────────────── */
function Shockwaves({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  // 5 rings staggered in time
  const rings = useMemo(
    () =>
      [0, 0.18, 0.36, 0.55, 0.78].map((delay, i) => ({
        delay,
        color: i % 2 === 0 ? "#FFD86A" : "#FFFFFF",
      })),
    [],
  );

  return (
    <group ref={groupRef}>
      {rings.map((r, i) => (
        <ShockRing key={i} delay={r.delay} color={r.color} reduced={reduced} />
      ))}
    </group>
  );
}

function ShockRing({
  delay,
  color,
  reduced,
}: {
  delay: number;
  color: string;
  reduced: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useRingTexture(`${color}cc`);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const localT = Math.max(0, t - delay);
    const life = Math.min(localT / 1.8, 1);
    const eased = 1 - Math.pow(1 - life, 3);
    const scale = 0.4 + eased * 5.5;
    m.scale.setScalar(scale);
    m.lookAt(state.camera.position);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, (1 - life) * 0.95) * (reduced ? 0.4 : 1);
    // Slight tilt for variation
    m.rotation.z = (delay * Math.PI) + t * 0.4;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[1.2, 1.2]} />
      <meshBasicMaterial
        map={tex}
        color={color}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ─── Central nova orb ────────────────────────────────────────────────── */
function NovaCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const coreTex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.18, "rgba(255,238,170,1)"],
    [0.4, "rgba(255,160,80,0.7)"],
    [0.75, "rgba(200,80,30,0.18)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const haloTex = useRadialTexture([
    [0, "rgba(255,220,140,0.35)"],
    [0.5, "rgba(200,140,80,0.15)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const streakTex = useStreakTexture("rgba(255,235,180,0.95)");

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.lookAt(state.camera.position);
      const pulse = 1 + Math.sin(t * 3.4) * 0.12;
      const grow = Math.min(t / 0.6, 1);
      const eased = 1 - Math.pow(1 - grow, 4);
      coreRef.current.scale.setScalar(1.4 * pulse * eased);
    }
    if (haloRef.current) {
      haloRef.current.lookAt(state.camera.position);
      const pulse = 1 + Math.sin(t * 1.8) * 0.1;
      haloRef.current.scale.setScalar(3.4 * pulse);
    }
    if (flareRef.current) {
      flareRef.current.lookAt(state.camera.position);
      const pulse = 0.9 + Math.sin(t * 4) * 0.1;
      flareRef.current.scale.set(4.8 * pulse, 0.18, 1);
      const mat = flareRef.current.material as THREE.MeshBasicMaterial;
      const life = Math.max(0, 1 - t / 2.2);
      mat.opacity = 0.7 + life * 0.3;
    }
  });

  return (
    <>
      <mesh ref={haloRef} position={[0, 0, -0.2]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={haloTex}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={coreTex}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={flareRef} position={[0, 0, 0.1]}>
        <planeGeometry args={[1.2, 1]} />
        <meshBasicMaterial
          map={streakTex}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/* ─── Spiral ascending particles (instanced) ──────────────────────────── */
function AscendingSpiral({
  reduced,
  count = 240,
}: {
  reduced: boolean;
  count?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.3, "rgba(255,224,140,0.95)"],
    [0.7, "rgba(255,120,60,0.4)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const layer = Math.random();
        return {
          startAngle: Math.random() * Math.PI * 2,
          radius0: 0.2 + Math.random() * 0.5,
          radiusGrow: 0.15 + Math.random() * 0.55,
          riseSpeed: 0.9 + Math.random() * 1.4,
          spinSpeed: (layer < 0.5 ? 1 : -1) * (0.6 + Math.random() * 1.8),
          startY: -1.8 - Math.random() * 1.2,
          life: 1.6 + Math.random() * 1.2,
          delay: Math.random() * 0.5,
          size: 0.05 + Math.random() * 0.09,
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
      // Gold → amber → white mix
      if (p.colorMix < 0.55) c.set("#FFD86A");
      else if (p.colorMix < 0.85) c.set("#FFE9B0");
      else c.set("#FFFFFF");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = Math.max(0, t - p.delay);
      const lifeT = Math.min(localT / p.life, 1);
      const radius = p.radius0 + p.radiusGrow * lifeT;
      const angle = p.startAngle + localT * p.spinSpeed * (reduced ? 0.3 : 1);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.6;
      const y = p.startY + localT * p.riseSpeed;
      dummy.position.set(x, y, z);
      dummy.quaternion.copy(state.camera.quaternion);
      const fade = lifeT < 0.15 ? lifeT / 0.15 : Math.max(0, 1 - (lifeT - 0.15) / 0.85);
      const flicker = 0.85 + 0.15 * Math.sin(t * 8 + i);
      dummy.scale.setScalar(p.size * fade * flicker);
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

/* ─── 4-point star sparkles drifting near top ─────────────────────────── */
function StarSparkles({ count = 14, reduced }: { count?: number; reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useStarSparkleTexture("rgba(255,250,210,1)");

  const sparkles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 5,
        y: 0.5 + Math.random() * 1.6,
        z: -0.5 + Math.random() * 1,
        size: 0.16 + Math.random() * 0.22,
        spinSpeed: (Math.random() - 0.5) * 2,
        twinkleFreq: 1.5 + Math.random() * 3,
        delay: Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < sparkles.length; i++) {
      const s = sparkles[i];
      const localT = Math.max(0, t - s.delay);
      const life = Math.min(localT / 0.5, 1);
      const fade = life * (1 - Math.max(0, (localT - 1.8) / 1.2));
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleFreq + s.phase);
      dummy.position.set(s.x, s.y + Math.sin(t * 0.6 + i) * 0.1, s.z);
      dummy.rotation.set(0, 0, t * s.spinSpeed * (reduced ? 0.25 : 1));
      dummy.scale.setScalar(s.size * Math.max(0, fade) * (0.5 + twinkle * 0.7));
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

function HeartbeatLights({ reduced }: { reduced: boolean }) {
  const goldRef = useRef<THREE.PointLight>(null);
  const amberRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 80);
    if (goldRef.current) goldRef.current.intensity = 16 + beat * 20;
    if (amberRef.current) amberRef.current.intensity = 10 + beat * 14;
  });
  return (
    <>
      <pointLight ref={goldRef} position={[0, 0, 3]} color="#FFD86A" distance={8} decay={1.6} />
      <pointLight ref={amberRef} position={[2, 1, 2]} color="#FFE9B0" distance={6} decay={2} />
    </>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#0a0805", 4, 9]} />
      <ambientLight intensity={0.5} color="#fff3d6" />
      <HeartbeatLights reduced={reduced} />

      <CinematicCamera script="energy-rise" reduced={reduced} />
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.pillar}
        fadeOutAt={0.75}
        fadeDuration={0.5}
        position={[0, -0.4, 0.25]}
        bpm={84}
        scale={1.0}
      />
      <FireworkBurst
        reduced={reduced}
        shape="fountain"
        palette={BURST_PALETTES.pillar}
        delay={0.7}
        count={240}
        speed={3.2}
        gravity={1.5}
        drag={1.0}
        life={2.1}
        size={0.08}
        origin={[0, -0.3, 0.1]}
      />
      <EnergyPillar reduced={reduced} />
      <NovaCore />
      <Shockwaves reduced={reduced} />
      {!reduced && <AscendingSpiral reduced={reduced} count={240} />}
      <StarSparkles count={reduced ? 8 : 16} reduced={reduced} />
      <LingeringSparkles reduced={reduced} color="rgba(255,235,180,1)" count={18} fadeInAt={1.5} radius={2.5} />
    </>
  );
}

export function ThumbsUpEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Cinematic gold vignette backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 55%, rgba(228,184,64,0.30) 0%, rgba(60,30,0,0) 65%)",
        }}
      />

      <Canvas
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.6], fov: 48 }}
        style={{ background: "transparent" }}
      >
        <Scene reduced={reduced} />
      </Canvas>

      {/* Chromatic edge overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,210,120,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Top-right blossom flare */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="absolute right-[18%] top-[16%] h-28 w-28 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,215,0,0.35) 35%, transparent 70%)",
            filter: "blur(2px)",
          }}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: [0, 1, 0], scale: [0.2, 1.2, 1.6] }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.25 }}
        />
      )}

      {/* Chú bộ đội — heroic silhouette rising with the energy pillar */}
      <VietnameseSoldier reduced={reduced} />

      {/* Emotion line */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <p
          className="font-cinzel text-sm font-bold uppercase tracking-[0.36em] sm:text-base"
          style={{
            color: "#FFD86A",
            textShadow:
              "0 0 24px rgba(255,215,0,0.85), 0 2px 16px rgba(140,80,0,0.7), 0 0 60px rgba(255,215,0,0.4)",
          }}
        >
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Vietnamese soldier (chú bộ đội) — heroic salute illustration ────────── */
function VietnameseSoldier({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 z-[2]"
      style={{
        bottom: "6%",
        transform: "translateX(-50%)",
        filter:
          "drop-shadow(0 0 38px rgba(255,215,0,0.55)) drop-shadow(0 -6px 22px rgba(228,184,64,0.45))",
      }}
      initial={{ opacity: 0, y: 60, scale: 0.86 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.92 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
    >
      {/* gentle breathing — disabled under reduced motion */}
      <motion.div
        animate={
          reduced
            ? { y: 0 }
            : { y: [0, -4, 0], rotate: [0, 0.4, 0] }
        }
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width="200"
          height="380"
          viewBox="0 0 200 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vn-uniform" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#152e1c" />
              <stop offset="0.45" stopColor="#284c30" />
              <stop offset="0.92" stopColor="#0c1c12" />
            </linearGradient>
            <linearGradient id="vn-helmet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3c6643" />
              <stop offset="1" stopColor="#11241a" />
            </linearGradient>
            <radialGradient id="vn-face" cx="0.42" cy="0.32" r="0.7">
              <stop offset="0" stopColor="#eccba6" />
              <stop offset="0.6" stopColor="#b48656" />
              <stop offset="1" stopColor="#5a3a25" />
            </radialGradient>
            <linearGradient id="vn-rim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(255,225,140,0)" />
              <stop offset="0.78" stopColor="rgba(255,235,165,0.55)" />
              <stop offset="1" stopColor="rgba(255,250,210,0.95)" />
            </linearGradient>
            <radialGradient id="vn-star-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="rgba(255,215,0,0.95)" />
              <stop offset="0.5" stopColor="rgba(200,16,46,0.55)" />
              <stop offset="1" stopColor="rgba(200,16,46,0)" />
            </radialGradient>
          </defs>

          {/* Soft aura behind silhouette */}
          <ellipse
            cx="100"
            cy="220"
            rx="92"
            ry="140"
            fill="url(#vn-star-glow)"
            opacity="0.18"
          />

          {/* === Legs === */}
          <path
            d="M 80 232 L 72 378 L 96 380 L 99 232 Z"
            fill="url(#vn-uniform)"
          />
          <path
            d="M 101 232 L 104 380 L 128 378 L 120 232 Z"
            fill="url(#vn-uniform)"
          />
          {/* Boots */}
          <path
            d="M 68 374 Q 68 388 80 390 L 100 390 Q 102 380 100 374 Z"
            fill="#0a0e0a"
          />
          <path
            d="M 100 374 Q 98 380 100 390 L 120 390 Q 132 388 132 374 Z"
            fill="#0a0e0a"
          />
          <ellipse cx="84" cy="388" rx="14" ry="3" fill="rgba(0,0,0,0.6)" />
          <ellipse cx="116" cy="388" rx="14" ry="3" fill="rgba(0,0,0,0.6)" />

          {/* === Torso (tunic) === */}
          <path
            d="M 62 132 Q 100 118 138 132 L 144 232 L 56 232 Z"
            fill="url(#vn-uniform)"
          />
          {/* Belt */}
          <rect x="56" y="224" width="88" height="9" fill="#2c1c0a" />
          <rect x="92" y="222" width="16" height="13" fill="#c89638" rx="1" />
          <rect x="96" y="226" width="8" height="5" fill="#7a5a18" />
          {/* Buttons */}
          <circle cx="100" cy="152" r="2.4" fill="#d4a83a" />
          <circle cx="100" cy="174" r="2.4" fill="#d4a83a" />
          <circle cx="100" cy="196" r="2.4" fill="#d4a83a" />
          {/* Collar (red trim) */}
          <path
            d="M 86 130 L 100 144 L 114 130 L 110 128 L 100 138 L 90 128 Z"
            fill="#9a1c1c"
          />

          {/* === Left arm (hanging at side) === */}
          <path
            d="M 60 132 Q 52 175 56 224 L 66 224 Q 68 175 68 132 Z"
            fill="url(#vn-uniform)"
          />
          <ellipse cx="61" cy="228" rx="6" ry="8" fill="url(#vn-face)" />

          {/* === Right arm (saluting — bent up to brim) === */}
          {/* Upper arm */}
          <path
            d="M 138 132 L 162 170 L 170 162 L 148 128 Z"
            fill="url(#vn-uniform)"
          />
          {/* Forearm angled up to helmet */}
          <path
            d="M 162 170 L 132 96 L 145 90 L 170 162 Z"
            fill="url(#vn-uniform)"
          />
          {/* Cuff highlight */}
          <path
            d="M 132 96 L 145 90 L 142 100 L 130 104 Z"
            fill="rgba(255,235,165,0.25)"
          />
          {/* Saluting hand */}
          <ellipse cx="131" cy="94" rx="10" ry="7" fill="url(#vn-face)" />
          <path
            d="M 124 92 L 138 88"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="1"
            fill="none"
          />

          {/* === Head === */}
          <ellipse cx="100" cy="102" rx="17" ry="22" fill="url(#vn-face)" />
          {/* Jaw shadow */}
          <path
            d="M 86 108 Q 100 124 114 108 Q 110 116 100 118 Q 90 116 86 108 Z"
            fill="rgba(0,0,0,0.22)"
          />
          {/* Eyes */}
          <ellipse cx="94" cy="100" rx="1.6" ry="2.2" fill="#0c0a06" />
          <ellipse cx="106" cy="100" rx="1.6" ry="2.2" fill="#0c0a06" />
          <ellipse cx="93.5" cy="99.5" rx="0.5" ry="0.7" fill="#fff" opacity="0.9" />
          <ellipse cx="105.5" cy="99.5" rx="0.5" ry="0.7" fill="#fff" opacity="0.9" />
          {/* Brows */}
          <path
            d="M 90 94 Q 94 92 98 94"
            stroke="#3a2415"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 102 94 Q 106 92 110 94"
            stroke="#3a2415"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Mouth — determined */}
          <path
            d="M 94 112 Q 100 114 106 112"
            stroke="#5a3220"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />

          {/* === Helmet (nón cối) === */}
          {/* Dome */}
          <path
            d="M 60 84 Q 60 40 100 40 Q 140 40 140 84 Z"
            fill="url(#vn-helmet)"
          />
          {/* Brim */}
          <ellipse cx="100" cy="86" rx="50" ry="8" fill="#142919" />
          <ellipse cx="100" cy="88" rx="50" ry="4" fill="#08120a" opacity="0.8" />
          {/* Helmet highlight */}
          <ellipse
            cx="84"
            cy="58"
            rx="14"
            ry="9"
            fill="rgba(255,255,255,0.18)"
          />
          {/* Helmet rim line */}
          <path
            d="M 60 84 Q 60 40 100 40 Q 140 40 140 84"
            stroke="rgba(255,235,165,0.35)"
            strokeWidth="1"
            fill="none"
          />

          {/* Red star with gold border (cờ Việt Nam) */}
          <g transform="translate(100,62)">
            <circle r="13" fill="url(#vn-star-glow)" opacity="0.7" />
            <polygon
              points="0,-12 3.5,-3.7 12.2,-3.7 5.2,2.3 7.9,10.6 0,5.6 -7.9,10.6 -5.2,2.3 -12.2,-3.7 -3.5,-3.7"
              fill="#dc1b1b"
              stroke="#ffd86a"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <polygon
              points="0,-12 3.5,-3.7 0,-2 -3.5,-3.7"
              fill="rgba(255,255,255,0.45)"
            />
          </g>

          {/* === Rim light from the energy pillar (right side) === */}
          <path
            d="M 140 132 L 144 232 L 130 380 L 142 380 L 156 232 L 152 132 Z"
            fill="url(#vn-rim)"
            opacity="0.55"
          />
          <path
            d="M 138 132 L 162 170 L 168 162 L 148 128 Z"
            fill="url(#vn-rim)"
            opacity="0.45"
          />

          {/* Subtle ground shadow */}
          <ellipse
            cx="100"
            cy="394"
            rx="48"
            ry="5"
            fill="rgba(0,0,0,0.55)"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
