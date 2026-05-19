"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CinematicCamera } from "@/components/gestures/effects/cinematicCamera";
import {
  useRadialTexture,
  useStreakTexture,
} from "@/components/gestures/effects/cinematicTextures";
import {
  BURST_PALETTES,
  CORE_PALETTES,
  FireworkBurst,
  HeartbeatCore,
  LingeringSparkles,
  heartbeat,
} from "@/components/gestures/effects/sharedEnergyCore";

/* ─────────────────────────────────────────────────────────────────────────────
 * FlagSkyEffect — Cờ Tổ Quốc Ngập Trời
 *
 * Hàng chục lá cờ Tổ quốc nhỏ tung bay lên trời theo đội hình diễu hành,
 * mỗi lá để lại vệt vàng phía sau. Cảm hứng từ ngày Quốc Khánh 2/9.
 * ────────────────────────────────────────────────────────────────────────── */

interface Props {
  emotion: string;
}

/* Small Vietnam flag texture — reused across all instances */
function createMiniFlagTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 170;
  const ctx = canvas.getContext("2d")!;

  // Red field
  ctx.fillStyle = "#C8102E";
  ctx.fillRect(0, 0, 256, 170);

  // Inner vignette
  const grad = ctx.createRadialGradient(128, 85, 30, 128, 85, 160);
  grad.addColorStop(0, "rgba(255,90,70,0.18)");
  grad.addColorStop(1, "rgba(50,2,2,0.4)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 170);

  // Gold star
  const cx = 128;
  const cy = 85;
  const outerR = 50;
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
  ctx.shadowColor = "rgba(255,215,0,0.75)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255,255,210,0.45)";
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* Sky of ascending flags — many instances cascading up-and-right */
function FlagFlock({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useMemo(() => createMiniFlagTexture(), []);

  const count = reduced ? 10 : 22;
  const flags = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x0: -2.5 + Math.random() * 0.6,
        y0: -2.6 - Math.random() * 0.8,
        z: -0.6 + Math.random() * 1.4,
        riseSpeed: 0.6 + Math.random() * 0.6,
        driftX: 0.3 + Math.random() * 0.4,
        wobble: 0.08 + Math.random() * 0.12,
        wobbleFreq: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        size: 0.35 + Math.random() * 0.25,
        rollAmp: 0.18 + Math.random() * 0.18,
        rollFreq: 1.6 + Math.random() * 1.4,
        delay: Math.random() * 1.3,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < flags.length; i++) {
      const f = flags[i];
      const localT = Math.max(0, t - f.delay);
      const y = f.y0 + localT * f.riseSpeed * (reduced ? 0.4 : 1);
      const x =
        f.x0 +
        localT * f.driftX * (reduced ? 0.4 : 1) +
        Math.sin(t * f.wobbleFreq + f.phase) * f.wobble;
      const lifeT = Math.min(localT / 5, 1);
      const fadeIn = Math.min(lifeT / 0.1, 1);
      const fadeOut = Math.max(0, 1 - Math.max(0, (lifeT - 0.5) / 0.5));
      const fade = fadeIn * fadeOut;
      // Roll like a banner caught in wind
      const roll = Math.sin(t * f.rollFreq + f.phase) * f.rollAmp;
      const tilt = Math.cos(t * f.rollFreq * 0.7 + f.phase) * 0.1;
      dummy.position.set(x, y, f.z);
      dummy.rotation.set(tilt, roll, 0);
      dummy.scale.setScalar(f.size * fade);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 0.66]} />
      <meshStandardMaterial
        map={tex}
        side={THREE.DoubleSide}
        transparent
        alphaTest={0.02}
        emissive={new THREE.Color("#C8102E")}
        emissiveIntensity={0.32}
        roughness={0.5}
        metalness={0.18}
      />
    </instancedMesh>
  );
}

/* Golden dust trails behind ascending flags */
function GoldenTrails({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.35, "rgba(255,220,140,0.9)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const count = reduced ? 80 : 200;
  const trails = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x0: -2.2 + Math.random() * 0.6,
        y0: -2.5 + Math.random() * 0.6,
        z: -0.4 + Math.random() * 1.0,
        riseSpeed: 0.5 + Math.random() * 0.7,
        driftX: 0.2 + Math.random() * 0.5,
        size: 0.04 + Math.random() * 0.08,
        delay: Math.random() * 2.2,
        twinkleFreq: 2 + Math.random() * 3,
        wobble: 0.08 + Math.random() * 0.16,
        wobbleFreq: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < trails.length; i++) {
      const p = trails[i];
      const localT = Math.max(0, t - p.delay);
      const y = p.y0 + localT * p.riseSpeed * (reduced ? 0.4 : 1);
      const x =
        p.x0 +
        localT * p.driftX * (reduced ? 0.4 : 1) +
        Math.sin(t * p.wobbleFreq + p.phase) * p.wobble;
      const lifeT = Math.min(localT / 4.5, 1);
      const fade = lifeT < 0.1 ? lifeT / 0.1 : Math.max(0, 1 - (lifeT - 0.1) / 0.9);
      const twinkle = 0.6 + 0.4 * Math.sin(t * p.twinkleFreq + p.phase);
      dummy.position.set(x, y, p.z);
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

/* Central hero flag — slightly bigger, anchors the composition */
function HeroFlag({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => createMiniFlagTexture(), []);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const reveal = Math.min(t / 1.2, 1);
    const eased = 1 - Math.pow(1 - reveal, 3);
    m.scale.setScalar(0.4 + eased * 0.95);
    if (!reduced) {
      m.rotation.y = Math.sin(t * 0.8) * 0.18;
      m.rotation.z = Math.sin(t * 0.6) * 0.06;
    }
    const beat = reduced ? 0.5 : heartbeat(t, 72);
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.3 + beat * 0.25;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <planeGeometry args={[1.6, 1.05]} />
      <meshStandardMaterial
        map={tex}
        side={THREE.DoubleSide}
        emissive={new THREE.Color("#C8102E")}
        emissiveIntensity={0.4}
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>
  );
}

function GodRays() {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useStreakTexture("rgba(255,210,140,0.55)");
  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.z = state.clock.elapsedTime * 0.05;
  });
  return (
    <group ref={groupRef} position={[0, 0.4, -1.6]}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 6]}>
          <planeGeometry args={[4.5, 0.18]} />
          <meshBasicMaterial
            map={tex}
            transparent
            opacity={i % 2 === 0 ? 0.3 : 0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function HeartbeatLights({ reduced }: { reduced: boolean }) {
  const goldRef = useRef<THREE.PointLight>(null);
  const redRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 72);
    if (goldRef.current) goldRef.current.intensity = 16 + beat * 18;
    if (redRef.current) redRef.current.intensity = 12 + beat * 16;
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
      <fog attach="fog" args={["#1a0508", 4, 10]} />
      <ambientLight intensity={0.55} color="#ffe8b8" />
      <HeartbeatLights reduced={reduced} />
      <pointLight position={[0, 0, 4]} intensity={10} color="#ffffff" distance={6} decay={2} />

      <CinematicCamera script="anthem-hero" reduced={reduced} />
      <GodRays />
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.flag}
        fadeOutAt={0.55}
        fadeDuration={0.4}
        bpm={74}
        scale={0.7}
      />
      <FireworkBurst
        reduced={reduced}
        shape="cascade"
        palette={BURST_PALETTES.flag}
        delay={0.5}
        count={200}
        speed={2.4}
        gravity={0.9}
        drag={1.1}
        life={1.9}
        size={0.08}
      />
      <GoldenTrails reduced={reduced} />
      <FlagFlock reduced={reduced} />
      <HeroFlag reduced={reduced} />
      <LingeringSparkles reduced={reduced} color="rgba(255,225,160,1)" count={18} fadeInAt={1.5} radius={2.8} />
    </>
  );
}

export function FlagSkyEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 55% 50%, rgba(154,28,28,0.4) 0%, rgba(20,4,4,0) 70%)",
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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 60% 50%, rgba(255,215,0,0.10) 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.65, duration: 0.7 }}
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
