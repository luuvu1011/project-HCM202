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
} from "@/components/gestures/effects/cinematicTextures";
import {
  CORE_PALETTES,
  FireworkBurst,
  HeartbeatCore,
  LingeringSparkles,
  heartbeat,
} from "@/components/gestures/effects/sharedEnergyCore";

/* ─────────────────────────────────────────────────────────────────────────────
 * DongSonDrumEffect — Trống Đồng Đông Sơn
 *
 * Biểu tượng văn minh Đông Sơn ~2000 năm trước CN. Mặt trống có:
 *  - Tâm: ngôi sao mặt trời 14 tia (đồ án Ngọc Lũ)
 *  - Vành đồng tâm: hoa văn hình học, meander
 *  - Vành ngoài: đàn chim Lạc bay
 *
 * Hiệu ứng: mặt trống đồng xoay từ tâm, vành đồng tâm bung sóng, chim Lạc
 * bay tỏa ra như tinh thần đoàn kết hòa bình.
 * ────────────────────────────────────────────────────────────────────────── */

interface Props {
  emotion: string;
}

/* Procedural Dong Son drum face — central sun + concentric ornament rings */
function createDrumTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  const cx = 512;
  const cy = 512;

  // Background — patina bronze base
  const bg = ctx.createRadialGradient(cx, cy, 50, cx, cy, 500);
  bg.addColorStop(0, "#5a3e1a");
  bg.addColorStop(0.5, "#3a2810");
  bg.addColorStop(1, "#1c1408");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1024);

  // Central 14-ray sun
  const sunR = 90;
  const rayCount = 14;
  ctx.save();
  ctx.translate(cx, cy);
  // Inner sun disc
  ctx.beginPath();
  ctx.arc(0, 0, sunR * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD86A";
  ctx.shadowColor = "rgba(255,215,0,0.7)";
  ctx.shadowBlur = 40;
  ctx.fill();
  // Sun rays
  ctx.shadowBlur = 18;
  for (let i = 0; i < rayCount; i++) {
    const a = (i / rayCount) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, -sunR * 0.5);
    ctx.lineTo(sunR * 0.18, -sunR);
    ctx.lineTo(-sunR * 0.18, -sunR);
    ctx.closePath();
    ctx.fillStyle = "#FFD86A";
    ctx.fill();
    ctx.restore();
  }
  ctx.shadowBlur = 0;

  // Concentric ornament rings
  const drawRing = (
    radius: number,
    width: number,
    color: string,
    pattern: "smooth" | "dots" | "zigzag" | "birds" | "meander",
    count = 0,
  ) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();

    if (pattern === "dots") {
      const n = 36;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * radius, Math.sin(a) * radius, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    } else if (pattern === "zigzag") {
      const n = count || 48;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = radius + (i % 2 === 0 ? 8 : -8);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;
      ctx.stroke();
    } else if (pattern === "meander") {
      const n = count || 32;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        ctx.save();
        ctx.translate(cosA * radius, sinA * radius);
        ctx.rotate(a + Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(-7, -5);
        ctx.lineTo(7, -5);
        ctx.lineTo(7, 5);
        ctx.lineTo(-7, 5);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();
      }
    } else if (pattern === "birds") {
      const n = count || 18;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        ctx.save();
        ctx.translate(cosA * radius, sinA * radius);
        ctx.rotate(a + Math.PI / 2);
        // Stylized Lạc bird (silhouette)
        ctx.beginPath();
        ctx.moveTo(-14, 4);
        ctx.lineTo(-4, -2);
        ctx.lineTo(0, -10);
        ctx.lineTo(4, -2);
        ctx.lineTo(14, 4);
        ctx.lineTo(4, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }
    }
  };

  // Ring stack from inner to outer
  drawRing(140, 2, "#D9A04A", "dots");
  drawRing(180, 1.5, "#C8851C", "zigzag", 56);
  drawRing(225, 2.5, "#FFD86A", "smooth");
  drawRing(265, 1.5, "#A36818", "meander", 40);
  drawRing(330, 3, "#FFD86A", "smooth");
  drawRing(370, 1.8, "#D9A04A", "dots");
  drawRing(420, 2, "#FFD86A", "birds", 22);
  drawRing(465, 1.2, "#A36818", "zigzag", 80);

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* The drum face — slowly rotates, scales up from 0 */
function DrumFace({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => createDrumTexture(), []);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    // Reveal 0..1 over 1.0s
    const reveal = Math.min(t / 1.0, 1);
    const eased = 1 - Math.pow(1 - reveal, 3);
    m.scale.setScalar(0.3 + eased * 1.0);
    // Slow rotation
    if (!reduced) m.rotation.z = t * 0.18;
    // Heartbeat throb on emissive
    const beat = reduced ? 0.5 : heartbeat(t, 76);
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.35 + beat * 0.25;
  });

  return (
    <mesh ref={ref} position={[0, 0, -0.2]}>
      <circleGeometry args={[1.4, 96]} />
      <meshStandardMaterial
        map={tex}
        side={THREE.DoubleSide}
        transparent
        emissive={new THREE.Color("#FFD86A")}
        emissiveIntensity={0.4}
        metalness={0.75}
        roughness={0.35}
      />
    </mesh>
  );
}

/* Expanding bronze rings — sound-wave from the drum strike */
function BronzeShockRing({
  delay,
  color,
  reduced,
}: {
  delay: number;
  color: string;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useRingTexture(color);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const localT = Math.max(0, t - delay);
    const life = Math.min(localT / 2.4, 1);
    const eased = 1 - Math.pow(1 - life, 3);
    const scale = 1.0 + eased * 4.5;
    m.scale.setScalar(scale);
    m.lookAt(state.camera.position);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, (1 - life) * 0.9) * (reduced ? 0.4 : 1);
  });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        color={color}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function BronzeRings({ reduced }: { reduced: boolean }) {
  const rings = useMemo(
    () => [
      { delay: 0.8, color: "#FFD86A" },
      { delay: 1.1, color: "#D9A04A" },
      { delay: 1.5, color: "#FFE9B0" },
      { delay: 1.9, color: "#C8851C" },
    ],
    [],
  );
  return (
    <>
      {rings.map((r, i) => (
        <BronzeShockRing key={i} delay={r.delay} color={r.color} reduced={reduced} />
      ))}
    </>
  );
}

/* Flying Lạc cranes — silhouettes orbiting outward */
function LacCranes({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const craneTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 128, 64);
    // Stylized crane silhouette (similar to drum bird pattern)
    ctx.beginPath();
    ctx.moveTo(8, 36);
    ctx.lineTo(36, 30);
    ctx.lineTo(50, 16);
    ctx.lineTo(64, 30);
    ctx.lineTo(78, 16);
    ctx.lineTo(92, 30);
    ctx.lineTo(120, 36);
    ctx.lineTo(92, 36);
    ctx.lineTo(78, 44);
    ctx.lineTo(64, 38);
    ctx.lineTo(50, 44);
    ctx.lineTo(36, 36);
    ctx.closePath();
    ctx.shadowColor = "rgba(255,200,80,0.6)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "rgba(255,220,140,0.92)";
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const count = reduced ? 5 : 10;
  const cranes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + Math.random() * 0.3,
        radius0: 1.0,
        radiusGrow: 1.6 + Math.random() * 1.0,
        speed: 0.4 + Math.random() * 0.3,
        size: 0.45 + Math.random() * 0.25,
        delay: 1.0 + i * 0.08,
        wingFreq: 4 + Math.random() * 2,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < cranes.length; i++) {
      const c = cranes[i];
      const localT = Math.max(0, t - c.delay);
      const orbitProgress = Math.min(localT / 2.5, 1);
      const r = c.radius0 + c.radiusGrow * orbitProgress;
      const a = c.angle + localT * c.speed * (reduced ? 0.4 : 1);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.7;
      const z = 0.1 + Math.sin(a * 2) * 0.2;
      // Wing flap = scale Y
      const flap = 0.7 + Math.sin(t * c.wingFreq + i) * 0.3;
      const fade = orbitProgress < 0.85 ? 1 : Math.max(0, 1 - (orbitProgress - 0.85) / 0.15);
      dummy.position.set(x, y, z);
      // Face direction of motion
      dummy.rotation.set(0, 0, a + Math.PI / 2);
      dummy.scale.set(c.size * fade, c.size * fade * flap, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 0.5]} />
      <meshBasicMaterial
        map={craneTex}
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
  const bronzeRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 76);
    if (goldRef.current) goldRef.current.intensity = 20 + beat * 22;
    if (bronzeRef.current) bronzeRef.current.intensity = 12 + beat * 16;
  });
  return (
    <>
      <pointLight ref={goldRef} position={[0, 0, 3]} color="#FFD86A" distance={9} decay={1.6} />
      <pointLight ref={bronzeRef} position={[2, 1, 2]} color="#C8851C" distance={7} decay={2} />
    </>
  );
}

function GodRays() {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useStreakTexture("rgba(255,210,130,0.55)");
  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.z = state.clock.elapsedTime * 0.06;
  });
  return (
    <group ref={groupRef} position={[0, 0, -1.6]}>
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 7]}>
          <planeGeometry args={[4, 0.16]} />
          <meshBasicMaterial
            map={tex}
            transparent
            opacity={i % 2 === 0 ? 0.32 : 0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#100805", 4, 9]} />
      <ambientLight intensity={0.5} color="#ffe0a0" />
      <HeartbeatLights reduced={reduced} />
      <pointLight position={[-2, -1, 2]} intensity={10} color="#FFE9B0" distance={7} decay={2} />

      <CinematicCamera script="nova-impact" reduced={reduced} />
      <GodRays />
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.pillar}
        fadeOutAt={0.6}
        fadeDuration={0.35}
        bpm={84}
        scale={0.75}
      />
      <FireworkBurst
        reduced={reduced}
        shape="spherical"
        palette={["#FFD86A", "#FFE9B0", "#C8851C", "#FFFFFF"]}
        delay={0.55}
        count={220}
        speed={2.8}
        gravity={0.5}
        drag={1.0}
        life={1.6}
        size={0.075}
      />
      <DrumFace reduced={reduced} />
      <BronzeRings reduced={reduced} />
      <LacCranes reduced={reduced} />
      <LingeringSparkles reduced={reduced} color="rgba(255,220,140,1)" count={18} fadeInAt={1.5} radius={2.6} />
    </>
  );
}

export function DongSonDrumEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(200,133,28,0.35) 0%, rgba(20,12,4,0) 70%)",
        }}
      />

      <Canvas
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Scene reduced={reduced} />
      </Canvas>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,210,130,0.10) 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
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
