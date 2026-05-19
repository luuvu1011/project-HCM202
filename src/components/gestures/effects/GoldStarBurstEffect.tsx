"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CinematicCamera } from "@/components/gestures/effects/cinematicCamera";
import {
  useRadialTexture,
  useRingTexture,
  useStreakTexture,
  useStarSparkleTexture,
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
 * GoldStarBurstEffect — Sao Vàng Năm Cánh
 *
 * Ngôi sao vàng từ lá cờ Tổ quốc bùng nở thành mặt trời chiến thắng.
 * Đại diện cho niềm tự hào dân tộc, niềm tin chiến thắng.
 * ────────────────────────────────────────────────────────────────────────── */

interface Props {
  emotion: string;
}

/* Procedural large 5-point star texture with glow and inner ridges */
function createGoldStarTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const cx = 256;
  const cy = 256;
  const outerR = 210;
  const innerR = outerR * 0.4;

  // Background outer glow halo
  const haloGrad = ctx.createRadialGradient(cx, cy, 100, cx, cy, 256);
  haloGrad.addColorStop(0, "rgba(255,235,140,0.4)");
  haloGrad.addColorStop(0.6, "rgba(255,180,40,0.15)");
  haloGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = haloGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Star path
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

  // Save and clip to star shape
  ctx.save();
  ctx.clip();

  // Gold fill gradient
  const fill = ctx.createRadialGradient(cx, cy, 20, cx, cy, outerR);
  fill.addColorStop(0, "#FFF8C4");
  fill.addColorStop(0.4, "#FFD700");
  fill.addColorStop(0.85, "#D9A020");
  fill.addColorStop(1, "#8C5A10");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 512, 512);

  // Inner ridges — lines from center to each outer point (gives metallic facet feel)
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
    ctx.stroke();
  }
  // Inner pentagon highlight
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2 + Math.PI / 5;
    const r = innerR * 0.95;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();

  // Outer stroke + glow on star
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
  ctx.shadowColor = "rgba(255,215,0,0.8)";
  ctx.shadowBlur = 26;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,210,0.7)";
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* The hero 5-point star — scales up, slow rotation, heartbeat throb */
function HeroStar({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => createGoldStarTexture(), []);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    // Reveal 0..1 over 1.0s with a soft bounce
    const reveal = Math.min(t / 1.0, 1);
    const eased = 1 - Math.pow(1 - reveal, 4);
    const bounce = Math.sin(eased * Math.PI) * 0.08;
    const beat = reduced ? 0.5 : heartbeat(t, 78);
    const scale = (0.2 + eased * 1.4 + bounce) * (1 + beat * 0.05);
    m.scale.setScalar(scale);
    // Slow rotation
    if (!reduced) m.rotation.z = t * 0.12;
    // Emissive throb
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + beat * 0.4;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <planeGeometry args={[2.2, 2.2]} />
      <meshStandardMaterial
        map={tex}
        transparent
        side={THREE.DoubleSide}
        emissive={new THREE.Color("#FFD700")}
        emissiveIntensity={0.6}
        metalness={0.85}
        roughness={0.2}
        alphaTest={0.02}
      />
    </mesh>
  );
}

/* 5 long radiating light rays — one per star point */
function StarRays({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useStreakTexture("rgba(255,235,180,0.95)");

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (!reduced) g.rotation.z = t * 0.12;
    const beat = reduced ? 0.5 : heartbeat(t, 78);
    // Scale grows with main star + pulses on beat
    const reveal = Math.min(t / 1.1, 1);
    const eased = 1 - Math.pow(1 - reveal, 3);
    g.scale.setScalar(eased * (1 + beat * 0.12));
  });

  return (
    <group ref={groupRef} position={[0, 0, -0.05]}>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return (
          <group key={i} rotation={[0, 0, angle - Math.PI / 2]}>
            <mesh position={[0, 1.7, 0]}>
              <planeGeometry args={[0.32, 3.4]} />
              <meshBasicMaterial
                map={tex}
                color="#FFE9B0"
                transparent
                opacity={0.65}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            {/* Inner brighter ray */}
            <mesh position={[0, 1.7, 0.02]}>
              <planeGeometry args={[0.16, 3.4]} />
              <meshBasicMaterial
                map={tex}
                color="#FFFFFF"
                transparent
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* Rotating outer halo ring */
function StarHalo({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useRingTexture("rgba(255,215,100,0.7)");
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.lookAt(state.camera.position);
    const beat = reduced ? 0.5 : heartbeat(t, 78);
    const reveal = Math.min(t / 0.9, 1);
    const eased = 1 - Math.pow(1 - reveal, 3);
    m.scale.setScalar(2.6 * eased * (1 + beat * 0.08));
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.55 + beat * 0.2;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.15]}>
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

/* Tiny golden stars twinkling in the background */
function BgStars({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useStarSparkleTexture("rgba(255,235,160,1)");
  const count = reduced ? 8 : 18;
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 4,
        z: -1.6 - Math.random() * 0.6,
        size: 0.16 + Math.random() * 0.2,
        spinSpeed: (Math.random() - 0.5) * 1.4,
        twinkleFreq: 1 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.8,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const localT = Math.max(0, t - s.delay);
      const fadeIn = Math.min(localT / 0.5, 1);
      const twinkle = 0.4 + 0.6 * Math.sin(t * s.twinkleFreq + s.phase);
      dummy.position.set(s.x, s.y + Math.sin(t * 0.4 + i) * 0.06, s.z);
      dummy.rotation.set(0, 0, t * s.spinSpeed * (reduced ? 0.3 : 1));
      dummy.scale.setScalar(s.size * fadeIn * (0.45 + twinkle * 0.65));
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

function HeartbeatLights({ reduced }: { reduced: boolean }) {
  const goldRef = useRef<THREE.PointLight>(null);
  const amberRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 78);
    if (goldRef.current) goldRef.current.intensity = 22 + beat * 26;
    if (amberRef.current) amberRef.current.intensity = 12 + beat * 16;
  });
  return (
    <>
      <pointLight ref={goldRef} position={[0, 0, 3]} color="#FFD700" distance={9} decay={1.6} />
      <pointLight ref={amberRef} position={[2, 1, 2]} color="#FFA040" distance={6} decay={2} />
    </>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#100805", 4, 9]} />
      <ambientLight intensity={0.55} color="#fff3d6" />
      <HeartbeatLights reduced={reduced} />

      <CinematicCamera script="energy-rise" reduced={reduced} />
      <BgStars reduced={reduced} />
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.pillar}
        fadeOutAt={0.55}
        fadeDuration={0.4}
        bpm={84}
        scale={0.7}
      />
      <FireworkBurst
        reduced={reduced}
        shape="fountain"
        palette={BURST_PALETTES.pillar}
        delay={0.5}
        count={220}
        speed={3.0}
        gravity={1.2}
        drag={1.0}
        life={1.9}
        size={0.08}
      />
      <StarHalo reduced={reduced} />
      <StarRays reduced={reduced} />
      <HeroStar reduced={reduced} />
      <LingeringSparkles reduced={reduced} color="rgba(255,235,160,1)" count={18} fadeInAt={1.5} radius={2.6} />
    </>
  );
}

export function GoldStarBurstEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 55%, rgba(228,184,64,0.4) 0%, rgba(60,30,0,0) 65%)",
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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.10) 0%, transparent 60%)",
        }}
      />

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
            color: "#FFD700",
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
