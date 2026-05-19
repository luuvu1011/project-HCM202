"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  useRadialTexture,
  useStreakTexture,
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
  particlesReady?: boolean;
}

/* ─── Procedural flag texture ─────────────────────────────────────────── */
function createFlagTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#C8102E";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Radial vignette inside flag
  const grad = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    40,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 1.4,
  );
  grad.addColorStop(0, "rgba(255,90,70,0.20)");
  grad.addColorStop(1, "rgba(50,2,2,0.40)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Yellow 5-point star
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const outerR = 110;
  const innerR = outerR * 0.4;
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
  ctx.shadowColor = "rgba(255,215,0,0.7)";
  ctx.shadowBlur = 32;
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,210,0.45)";
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ─── 3D cloth-simulated flag (large hero-shot) ──────────────────────── */
function ClothFlag({ reduced }: { reduced: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createFlagTexture(), []);
  const originalPositions = useRef<Float32Array | null>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const time = state.clock.elapsedTime;
    const geometry = mesh.geometry as THREE.PlaneGeometry;
    const positionAttr = geometry.attributes.position;

    if (!originalPositions.current) {
      originalPositions.current = new Float32Array(positionAttr.array);
    }
    const orig = originalPositions.current;
    const arr = positionAttr.array as Float32Array;

    for (let i = 0; i < positionAttr.count; i++) {
      const ix = i * 3;
      const ox = orig[ix];
      const oy = orig[ix + 1];
      // Wave from pole (left) to free edge (right)
      const xFactor = (ox + 1.5) / 3;
      const amplitude = reduced ? 0.02 : 0.28 * xFactor;
      const w1 = Math.sin(ox * 2.8 + time * 2.4) * amplitude;
      const w2 = Math.cos(oy * 3.6 + time * 1.6) * amplitude * 0.7;
      const w3 = Math.sin((ox + oy) * 2 + time * 3.2) * amplitude * 0.4;
      arr[ix + 2] = w1 + w2 + w3;
    }
    positionAttr.needsUpdate = true;
    geometry.computeVertexNormals();

    // Hero entrance: slide in from left + scale
    const t = Math.min(time * 1.2, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    mesh.position.x = -1.4 + eased * 1.4;
    mesh.scale.setScalar(0.6 + eased * 0.55);
    // Gentle perpetual sway around pole
    if (!reduced) {
      mesh.rotation.y = Math.sin(time * 0.55) * 0.12;
      mesh.rotation.z = Math.sin(time * 0.4) * 0.04;
    }
  });

  // Pole edge attached at left; geometry origin shifted right via positioning
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[3, 1.9, 48, 32]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        emissive={new THREE.Color("#C8102E")}
        emissiveIntensity={0.32}
        roughness={0.5}
        metalness={0.18}
      />
    </mesh>
  );
}

/* ─── Flagpole (metallic cylinder + glossy finial) ────────────────────── */
function Flagpole() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const lifeT = Math.min(t * 1.4, 1);
    const eased = 1 - Math.pow(1 - lifeT, 4);
    g.scale.y = eased;
  });
  return (
    <group ref={groupRef} position={[-1.55, 0, 0]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 12]} />
        <meshStandardMaterial
          color="#d9b367"
          metalness={0.85}
          roughness={0.25}
          emissive={new THREE.Color("#7a5a20")}
          emissiveIntensity={0.18}
        />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#fff0c0"
          metalness={0.95}
          roughness={0.15}
          emissive={new THREE.Color("#FFD86A")}
          emissiveIntensity={0.45}
        />
      </mesh>
    </group>
  );
}

/* ─── Sun halo + rotating godrays behind flag ─────────────────────────── */
function SunHalo({ reduced }: { reduced: boolean }) {
  const haloRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);
  const haloTex = useRadialTexture([
    [0, "rgba(255,238,170,0.85)"],
    [0.3, "rgba(255,184,80,0.55)"],
    [0.65, "rgba(200,80,40,0.20)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const rayTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "rgba(255,235,180,0)");
    g.addColorStop(0.5, "rgba(255,210,140,0.45)");
    g.addColorStop(1, "rgba(255,235,180,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 512);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (haloRef.current) {
      haloRef.current.lookAt(state.camera.position);
      const pulse = 1 + Math.sin(t * 0.8) * 0.05;
      haloRef.current.scale.setScalar(4.6 * pulse);
    }
    if (raysRef.current && !reduced) {
      raysRef.current.rotation.z = t * 0.08;
    }
  });

  return (
    <>
      <mesh ref={haloRef} position={[0.6, 0.1, -1.6]}>
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
      <group ref={raysRef} position={[0.6, 0.1, -1.4]}>
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 9]}>
            <planeGeometry args={[0.2, 5.5]} />
            <meshBasicMaterial
              map={rayTex}
              transparent
              opacity={i % 2 === 0 ? 0.35 : 0.22}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

/* ─── Patriotic dust particles (drifting upward) ──────────────────────── */
function PatrioticDust({
  count = 180,
  reduced,
}: {
  count?: number;
  reduced: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,224,140,0.85)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: -2 + Math.random() * 4,
        y0: -2.5 - Math.random() * 1,
        z: -0.5 + Math.random() * 1.2,
        speed: 0.25 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.6,
        wobble: 0.06 + Math.random() * 0.18,
        wobbleFreq: 0.5 + Math.random() * 2,
        size: 0.04 + Math.random() * 0.08,
        delay: Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        colorMix: Math.random(),
      })),
    [count],
  );

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.colorMix < 0.55) c.set("#FFD86A");
      else if (p.colorMix < 0.82) c.set("#FFFFFF");
      else c.set("#FF7A6A");
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
      const y = p.y0 + localT * p.speed * (reduced ? 0.4 : 1);
      const wobbleX = Math.sin(t * p.wobbleFreq + p.phase) * p.wobble;
      const x = p.x + p.drift * localT + wobbleX;
      const lifeT = Math.min(localT / 4, 1);
      const fade =
        lifeT < 0.15 ? lifeT / 0.15 : Math.max(0, 1 - (lifeT - 0.15) / 0.85);
      const flicker = 0.85 + 0.15 * Math.sin(t * 6 + i);
      dummy.position.set(x, y, p.z);
      dummy.quaternion.copy(state.camera.quaternion);
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

/* ─── Lens flare streak across flag ───────────────────────────────────── */
function LensFlare() {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useStreakTexture("rgba(255,235,180,0.9)");
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.lookAt(state.camera.position);
    const grow = Math.min(t / 0.7, 1);
    const eased = 1 - Math.pow(1 - grow, 3);
    const pulse = 0.9 + Math.sin(t * 3) * 0.1;
    m.scale.set(5 * eased * pulse, 0.16, 1);
    const mat = m.material as THREE.MeshBasicMaterial;
    const life = Math.max(0, 1 - t / 2.4);
    mat.opacity = 0.55 + life * 0.35;
  });
  return (
    <mesh ref={ref} position={[0.6, 0.1, 0.5]}>
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

/* ─── Background star sparkles ────────────────────────────────────────── */
function BackgroundStars({ count = 10 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useStarSparkleTexture("rgba(255,235,180,1)");

  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 5,
        y: 0.3 + Math.random() * 1.5,
        z: -1.2 + Math.random() * 0.6,
        size: 0.16 + Math.random() * 0.22,
        twinkleFreq: 0.8 + Math.random() * 2.5,
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
      const twinkle = 0.4 + 0.6 * Math.sin(t * s.twinkleFreq + s.phase);
      dummy.position.set(s.x, s.y, s.z);
      dummy.rotation.set(0, 0, t * 0.2);
      dummy.scale.setScalar(s.size * (0.4 + twinkle * 0.7));
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
  const redRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 72);
    if (goldRef.current) goldRef.current.intensity = 18 + beat * 18;
    if (redRef.current) redRef.current.intensity = 11 + beat * 14;
  });
  return (
    <>
      <pointLight ref={goldRef} position={[2.5, 2.5, 3]} color="#FFD86A" distance={9} decay={1.6} />
      <pointLight ref={redRef} position={[-2.5, -1.5, 2]} color="#FF5b4d" distance={8} decay={1.8} />
    </>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#1a0508", 4, 9.5]} />
      <ambientLight intensity={0.5} color="#ffe8b8" />
      <HeartbeatLights reduced={reduced} />
      <pointLight position={[0, 0, 4]} intensity={9} color="#ffffff" distance={6} decay={2} />

      <CinematicCamera script="anthem-hero" reduced={reduced} />
      <SunHalo reduced={reduced} />
      <BackgroundStars count={reduced ? 5 : 12} />
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.flag}
        fadeOutAt={0.65}
        fadeDuration={0.5}
        position={[0.6, 0.15, 0.3]}
        bpm={72}
        scale={0.85}
      />
      <FireworkBurst
        reduced={reduced}
        shape="cascade"
        palette={BURST_PALETTES.flag}
        delay={0.65}
        count={220}
        speed={2.6}
        gravity={1.0}
        drag={1.1}
        life={2.0}
        size={0.08}
        origin={[0.6, 0.15, 0.2]}
      />
      <Flagpole />
      <ClothFlag reduced={reduced} />
      <LensFlare />
      {!reduced && <PatrioticDust count={180} reduced={reduced} />}
      <LingeringSparkles reduced={reduced} color="rgba(255,225,160,1)" count={16} fadeInAt={1.5} radius={2.6} />
    </>
  );
}

export function WaveFlagEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm cinematic backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 60% 50%, rgba(154,28,28,0.40) 0%, rgba(20,4,4,0) 70%)",
        }}
      />

      <Canvas
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.6], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Scene reduced={reduced} />
      </Canvas>

      {/* Chromatic glow overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 60% 50%, rgba(255,215,0,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Emotion line */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
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
