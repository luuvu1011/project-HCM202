"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
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

const Particles = dynamic(
  () => import("@tsparticles/react").then((m) => m.Particles),
  { ssr: false },
);

interface Props {
  emotion: string;
  particlesReady?: boolean;
}

/* ─── Heart point sampler (parametric) ────────────────────────────────── */
function heartPoint(t: number, scale: number): [number, number, number] {
  // Classic heart parametric curve
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return [(x / 16) * scale, (y / 16) * scale, 0];
}

/* ─── Procedural Vietnam flag texture ─────────────────────────────────── */
function createFlagTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#C8102E";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    50,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 1.4,
  );
  grad.addColorStop(0, "rgba(255,80,60,0.18)");
  grad.addColorStop(1, "rgba(60,4,4,0.35)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  ctx.shadowColor = "rgba(255,215,0,0.65)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,210,0.4)";
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ─── Cloth-simulated flag ────────────────────────────────────────────── */
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
      const xFactor = (ox + 1.2) / 2.4;
      const amplitude = reduced ? 0.0 : 0.18 * xFactor;
      const w1 = Math.sin(ox * 3.4 + time * 2.6) * amplitude;
      const w2 = Math.cos(oy * 4.2 + time * 1.8) * amplitude * 0.6;
      arr[ix + 2] = w1 + w2;
    }
    positionAttr.needsUpdate = true;
    geometry.computeVertexNormals();

    // Flag arrives AFTER heart vortex (delay ~0.7s)
    const t = Math.max(0, Math.min((time - 0.7) * 1.4, 1));
    const eased = 1 - Math.pow(1 - t, 4);
    mesh.scale.setScalar(0.4 + eased * 0.6);
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.opacity = eased;
    mat.transparent = true;
    mesh.rotation.y = Math.sin(time * 0.6) * 0.18 * eased;
    mesh.rotation.z = Math.sin(time * 0.4) * 0.04 * eased;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2.4, 1.5, 40, 28]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        emissive={new THREE.Color("#C8102E")}
        emissiveIntensity={0.32}
        roughness={0.5}
        metalness={0.18}
        transparent
      />
    </mesh>
  );
}

/* ─── Heart-shaped convergence vortex (particles form heart, then burst) ── */
function HeartConvergence({
  reduced,
  count = 220,
}: {
  reduced: boolean;
  count?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.3, "rgba(255,180,180,0.95)"],
    [0.65, "rgba(220,40,80,0.55)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const t = (i / count) * Math.PI * 2;
        const target = heartPoint(t, 1.4);
        const startX = (Math.random() - 0.5) * 6;
        const startY = (Math.random() - 0.5) * 4;
        const startZ = (Math.random() - 0.5) * 1.5;
        return {
          targetX: target[0],
          targetY: target[1],
          targetZ: target[2],
          startX,
          startY,
          startZ,
          delay: Math.random() * 0.25,
          size: 0.05 + Math.random() * 0.06,
          colorMix: Math.random(),
          // After heart forms, burst outward
          burstDirX: (target[0] || (Math.random() - 0.5)) * (1 + Math.random() * 1.5),
          burstDirY: (target[1] || (Math.random() - 0.5)) * (1 + Math.random() * 1.5),
          burstSpeed: 1.2 + Math.random() * 1.8,
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
      if (p.colorMix < 0.4) c.set("#FFD86A");
      else if (p.colorMix < 0.75) c.set("#FF4D6A");
      else c.set("#FFFFFF");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;

    // Phase 1: converge (0 → 0.7s)
    // Phase 2: hold heart shape (0.7 → 0.9s)
    // Phase 3: burst outward (0.9s+)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = Math.max(0, t - p.delay);
      let x: number, y: number, z: number;
      let fade = 1;

      if (localT < 0.7) {
        // Convergence with ease-out
        const k = Math.min(localT / 0.7, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        x = p.startX * (1 - eased) + p.targetX * eased;
        y = p.startY * (1 - eased) + p.targetY * eased;
        z = p.startZ * (1 - eased) + p.targetZ * eased;
        fade = eased;
      } else if (localT < 0.9) {
        // Hold heart with slight pulse
        const pulse = 1 + Math.sin(localT * 12) * 0.06;
        x = p.targetX * pulse;
        y = p.targetY * pulse;
        z = p.targetZ;
        fade = 1;
      } else {
        // Burst outward + gravity-like
        const burstT = localT - 0.9;
        const speed = p.burstSpeed * (reduced ? 0.5 : 1);
        x = p.targetX + p.burstDirX * burstT * speed;
        y = p.targetY + p.burstDirY * burstT * speed - 0.6 * burstT * burstT;
        z = p.targetZ + (Math.random() - 0.5) * burstT * 0.5;
        fade = Math.max(0, 1 - burstT / 1.5);
      }

      dummy.position.set(x, y, z);
      dummy.quaternion.copy(state.camera.quaternion);
      const flicker = 0.85 + 0.15 * Math.sin(t * 7 + i);
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

/* ─── Orbiting heart sparkles ─────────────────────────────────────────── */
function OrbitingHearts({
  reduced,
  count = 12,
}: {
  reduced: boolean;
  count?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useStarSparkleTexture("rgba(255,200,200,1)");

  const hearts = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        radius: 1.6 + Math.random() * 0.8,
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.4,
        size: 0.16 + Math.random() * 0.16,
        twinkleFreq: 1.5 + Math.random() * 2,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < hearts.length; i++) {
      const h = hearts[i];
      const angle = h.phase + t * h.speed * (reduced ? 0.3 : 1);
      const x = Math.cos(angle) * h.radius;
      const y = Math.sin(angle) * h.radius * 0.7 + h.tilt;
      const z = Math.sin(angle * 1.5) * 0.4;
      const twinkle = 0.5 + 0.5 * Math.sin(t * h.twinkleFreq + i);
      // Only appear after heart forms (~0.8s)
      const appear = Math.max(0, Math.min((t - 0.8) / 0.4, 1));
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, 0, t * 0.4 + i);
      dummy.scale.setScalar(h.size * appear * (0.5 + twinkle * 0.7));
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

/* ─── Core glow + flare (shared style) ────────────────────────────────── */
function CoreGlow() {
  const haloRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const verticalRef = useRef<THREE.Mesh>(null);
  const haloTex = useRadialTexture([
    [0, "rgba(255,215,0,0.85)"],
    [0.4, "rgba(228,184,64,0.35)"],
    [0.7, "rgba(200,16,46,0.18)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const flareTex = useStreakTexture("rgba(255,235,180,0.95)");
  const verticalTex = useStreakTexture("rgba(255,255,255,0.85)");

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (haloRef.current) {
      haloRef.current.lookAt(state.camera.position);
      const pulse = 1 + Math.sin(t * 2.5) * 0.12;
      haloRef.current.scale.setScalar(2.8 * pulse);
    }
    if (flareRef.current) {
      flareRef.current.lookAt(state.camera.position);
      const grow = Math.min(t / 0.5, 1);
      flareRef.current.scale.set(5 * grow, 0.16, 1);
      (flareRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - t / 2.5);
    }
    if (verticalRef.current) {
      verticalRef.current.lookAt(state.camera.position);
      verticalRef.current.rotation.z = Math.PI / 2;
      const grow = Math.min(t / 0.6, 1);
      verticalRef.current.scale.set(3 * grow, 0.10, 1);
      (verticalRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - t / 2);
    }
  });

  return (
    <>
      <mesh ref={haloRef} position={[0, 0, -0.6]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={haloTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={flareRef} position={[0, 0, 0.3]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={flareTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={verticalRef} position={[0, 0, 0.25]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={verticalTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/* ─── Volumetric godrays ──────────────────────────────────────────────── */
function GodRays() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.z = state.clock.elapsedTime * 0.08;
  });
  return (
    <group ref={groupRef} position={[0, 0, -1.2]}>
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 7]}>
          <planeGeometry args={[0.16, 5]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#FFD700" : "#FF6B6B"}
            transparent
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Heartbeat-driven point lights (the core throbs the scene) ─────────── */
function HeartbeatLights({ reduced }: { reduced: boolean }) {
  const goldRef = useRef<THREE.PointLight>(null);
  const redRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 78);
    if (goldRef.current) goldRef.current.intensity = 22 + beat * 26;
    if (redRef.current) redRef.current.intensity = 16 + beat * 22;
  });
  return (
    <>
      <pointLight ref={goldRef} position={[2.5, 2.5, 3]} color="#FFD700" distance={8} decay={1.5} />
      <pointLight ref={redRef} position={[-2.5, -1.5, 2]} color="#FF5555" distance={8} decay={1.5} />
    </>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#0c0408", 4, 9]} />
      <ambientLight intensity={0.55} color="#fff3d6" />
      <HeartbeatLights reduced={reduced} />
      <pointLight position={[0, 0, 4]} intensity={12} color="#ffffff" distance={6} decay={2} />

      <CinematicCamera script="heart-reveal" reduced={reduced} />
      <GodRays />
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.heart}
        fadeOutAt={0.8}
        fadeDuration={0.5}
        bpm={82}
        scale={1.1}
      />
      <FireworkBurst
        reduced={reduced}
        shape="heart"
        palette={BURST_PALETTES.heart}
        delay={0.7}
        count={240}
        speed={2.0}
        gravity={0.55}
        drag={1.0}
        life={1.9}
        size={0.09}
      />
      <CoreGlow />
      <ClothFlag reduced={reduced} />
      {!reduced && <HeartConvergence reduced={reduced} count={220} />}
      <OrbitingHearts reduced={reduced} count={14} />
      <LingeringSparkles reduced={reduced} color="rgba(255,210,210,1)" count={16} fadeInAt={1.3} radius={2.4} />
    </>
  );
}

export function HeartFlagEffect({ emotion, particlesReady }: Props) {
  const reduced = useReducedMotion();
  const [canvasMounted, setCanvasMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setCanvasMounted(true), 50);
    return () => window.clearTimeout(id);
  }, []);

  const particle2DOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      detectRetina: true,
      fpsLimit: 60,
      emitters: [
        {
          position: { x: 50, y: 60 },
          rate: { quantity: 4, delay: 0.06 },
          life: { duration: 1.6, count: 1 },
          particles: {
            color: { value: ["#FFD700", "#FFA500", "#FF6B6B"] },
            shape: { type: "circle" },
            opacity: {
              value: { min: 0.5, max: 1.0 },
              animation: { enable: true, speed: 1.2, startValue: "max", destroy: "min" },
            },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              direction: "none" as const,
              outModes: { default: "destroy" as const },
              speed: { min: 1, max: 4 },
              gravity: { enable: true, acceleration: 2 },
            },
            life: { duration: { sync: false, value: 2.0 } },
          },
        },
      ],
      particles: { number: { value: 0 } },
    }),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Cinematic backdrop vignette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(140,24,24,0.45) 0%, rgba(0,0,0,0.0) 70%)",
        }}
      />

      <Canvas
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 4.4], fov: 45 }}
        style={{ background: "transparent" }}
        onCreated={() => setCanvasMounted(true)}
      >
        <Scene reduced={reduced} />
      </Canvas>

      {/* Foreground 2D particle dust (drifts after 3D burst) */}
      {!reduced && canvasMounted && particlesReady && (
        <div className="absolute inset-0">
          <Particles id="heart-particles" options={particle2DOptions} />
        </div>
      )}

      {/* Chromatic edge overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,120,160,0.10) 0%, transparent 60%)",
        }}
      />

      {/* Top-right chromatic flare */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="absolute right-[20%] top-[18%] h-32 w-32 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,215,0,0.3) 30%, transparent 70%)",
            filter: "blur(2px)",
          }}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: [0, 1, 0], scale: [0.2, 1.4, 2] }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
        />
      )}

      {/* Emotion line */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <p
          className="font-cinzel text-sm font-bold uppercase tracking-[0.36em] sm:text-base"
          style={{
            color: "#FFD700",
            textShadow:
              "0 0 24px rgba(255,215,0,0.85), 0 2px 18px rgba(200,16,46,0.6), 0 0 60px rgba(255,215,0,0.4)",
          }}
        >
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}
