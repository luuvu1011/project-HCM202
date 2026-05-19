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
 * LotusBlossomEffect — Sen Hồng nở
 *
 * Quốc hoa Việt Nam — biểu tượng sự thanh khiết, giác ngộ.
 * 8 cánh sen hồng bung nở từ trung tâm, nhị vàng rung động theo nhịp tim.
 * ────────────────────────────────────────────────────────────────────────── */

interface Props {
  emotion: string;
}

/* Procedural lotus-petal texture — hand-painted with watercolor falloff */
function createPetalTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext("2d")!;

  // Petal silhouette path (teardrop)
  ctx.beginPath();
  ctx.moveTo(128, 24);
  ctx.bezierCurveTo(220, 80, 224, 280, 128, 360);
  ctx.bezierCurveTo(32, 280, 36, 80, 128, 24);
  ctx.closePath();

  // Save the path as clip
  ctx.save();
  ctx.clip();

  // Inner pink-to-rose gradient
  const grad = ctx.createRadialGradient(128, 280, 12, 128, 200, 220);
  grad.addColorStop(0, "rgba(255,240,235,0.95)");
  grad.addColorStop(0.35, "rgba(255,200,210,0.92)");
  grad.addColorStop(0.7, "rgba(232,120,140,0.78)");
  grad.addColorStop(1, "rgba(180,40,80,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 384);

  // Vein highlight along center
  const vein = ctx.createLinearGradient(128, 24, 128, 360);
  vein.addColorStop(0, "rgba(255,255,255,0.0)");
  vein.addColorStop(0.5, "rgba(255,255,255,0.18)");
  vein.addColorStop(1, "rgba(255,255,255,0.0)");
  ctx.fillStyle = vein;
  ctx.fillRect(120, 0, 16, 384);

  ctx.restore();

  // Soft outer glow stroke
  ctx.beginPath();
  ctx.moveTo(128, 24);
  ctx.bezierCurveTo(220, 80, 224, 280, 128, 360);
  ctx.bezierCurveTo(32, 280, 36, 80, 128, 24);
  ctx.closePath();
  ctx.shadowColor = "rgba(255,180,200,0.5)";
  ctx.shadowBlur = 12;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255,210,220,0.4)";
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* Lotus flower — 2 layers of petals (8 outer + 6 inner) opening with heartbeat */
function Lotus({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useMemo(() => createPetalTexture(), []);
  const outerCount = 8;
  const innerCount = 6;

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // Lotus blooms 0..1 over first 1.4s
    const bloom = Math.min(t / 1.4, 1);
    const eased = 1 - Math.pow(1 - bloom, 3);
    g.scale.setScalar(0.3 + eased * 0.8);
    // Gentle sway on heartbeat
    const beat = reduced ? 0 : heartbeat(t, 72);
    g.rotation.z = Math.sin(t * 0.4) * 0.04 + beat * 0.015;
    g.rotation.x = Math.sin(t * 0.3) * 0.03;
  });

  return (
    <group ref={groupRef}>
      {/* Outer petals */}
      {Array.from({ length: outerCount }).map((_, i) => (
        <LotusPetal
          key={`o${i}`}
          tex={tex}
          angle={(i / outerCount) * Math.PI * 2}
          openAngle={1.05}
          radius={0.62}
          scale={1.0}
          delay={i * 0.04}
          reduced={reduced}
        />
      ))}
      {/* Inner petals — smaller, less open */}
      {Array.from({ length: innerCount }).map((_, i) => (
        <LotusPetal
          key={`i${i}`}
          tex={tex}
          angle={(i / innerCount) * Math.PI * 2 + Math.PI / innerCount}
          openAngle={0.7}
          radius={0.38}
          scale={0.65}
          delay={0.25 + i * 0.05}
          reduced={reduced}
        />
      ))}
      {/* Golden stamen sphere at heart */}
      <StamenCluster reduced={reduced} />
    </group>
  );
}

function LotusPetal({
  tex,
  angle,
  openAngle,
  radius,
  scale,
  delay,
  reduced,
}: {
  tex: THREE.Texture;
  angle: number;
  openAngle: number;
  radius: number;
  scale: number;
  delay: number;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = Math.max(0, state.clock.elapsedTime - delay);
    // Open from upright (closed bud) to tilted outward
    const open = Math.min(t / 1.2, 1);
    const eased = 1 - Math.pow(1 - open, 2.4);
    const tilt = -Math.PI / 2 + openAngle * eased;
    // Petal anchor: position at center, rotate so base is at origin and tip points outward
    m.position.set(Math.cos(angle) * 0.02, Math.sin(angle) * 0.02, 0);
    m.rotation.set(0, 0, angle - Math.PI / 2);
    m.rotation.x = tilt;
    m.scale.set(scale * 0.55, scale * 0.85, 1);
    // Subtle flutter when reduced=false
    if (!reduced) {
      const flutter = Math.sin(state.clock.elapsedTime * 1.8 + angle * 3) * 0.04;
      m.rotation.x += flutter;
    }
    // Move petal tip outward (anchor at base — geometry centered at origin, shift up)
    m.position.x += Math.cos(angle) * radius * 0.5 * eased;
    m.position.y += Math.sin(angle) * radius * 0.5 * eased;
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[0.7, 1.1]} />
      <meshStandardMaterial
        map={tex}
        side={THREE.DoubleSide}
        transparent
        alphaTest={0.02}
        emissive={new THREE.Color("#FF6080")}
        emissiveIntensity={0.25}
        roughness={0.55}
        metalness={0.1}
      />
    </mesh>
  );
}

function StamenCluster({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const stamens = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const r = 0.06 + Math.random() * 0.1;
        return {
          x: Math.cos(a) * r,
          y: Math.sin(a) * r * 0.6,
          z: 0.05 + Math.random() * 0.08,
          size: 0.025 + Math.random() * 0.025,
          delay: 0.6 + Math.random() * 0.4,
        };
      }),
    [],
  );

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 72);
    g.scale.setScalar(0.9 + beat * 0.15);
  });

  return (
    <group ref={groupRef}>
      {stamens.map((s, i) => (
        <Stamen key={i} {...s} />
      ))}
    </group>
  );
}

function Stamen({
  x,
  y,
  z,
  size,
  delay,
}: {
  x: number;
  y: number;
  z: number;
  size: number;
  delay: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = Math.max(0, state.clock.elapsedTime - delay);
    const grow = Math.min(t / 0.5, 1);
    m.scale.setScalar(size * grow);
  });
  return (
    <mesh ref={ref} position={[x, y, z]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive={new THREE.Color("#FFC050")}
        emissiveIntensity={0.7}
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
}

/* Slowly rising rose-pink pollen specks */
function PollenDrift({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,200,210,0.85)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const count = reduced ? 50 : 120;
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 4,
        y0: -2 + Math.random() * 0.4,
        z: -0.6 + Math.random() * 1.2,
        riseSpeed: 0.2 + Math.random() * 0.4,
        wobble: 0.1 + Math.random() * 0.2,
        wobbleFreq: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        size: 0.035 + Math.random() * 0.05,
        delay: Math.random() * 1.2,
        twinkleFreq: 1.2 + Math.random() * 2.5,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = Math.max(0, t - p.delay);
      const y = p.y0 + localT * p.riseSpeed * (reduced ? 0.4 : 1);
      const x = p.x + Math.sin(t * p.wobbleFreq + p.phase) * p.wobble;
      const lifeT = Math.min(localT / 4, 1);
      const fade = lifeT < 0.2 ? lifeT / 0.2 : Math.max(0, 1 - (lifeT - 0.2) / 0.8);
      const twinkle = 0.7 + 0.3 * Math.sin(t * p.twinkleFreq + p.phase);
      dummy.position.set(x, y, p.z);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * fade * twinkle);
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

function LotusGodRays() {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useStreakTexture("rgba(255,220,200,0.6)");
  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.z = state.clock.elapsedTime * 0.05;
  });
  return (
    <group ref={groupRef} position={[0, 0, -1.2]}>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 5]}>
          <planeGeometry args={[3.6, 0.18]} />
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

function HeartbeatLights({ reduced }: { reduced: boolean }) {
  const goldRef = useRef<THREE.PointLight>(null);
  const pinkRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 72);
    if (goldRef.current) goldRef.current.intensity = 18 + beat * 22;
    if (pinkRef.current) pinkRef.current.intensity = 14 + beat * 18;
  });
  return (
    <>
      <pointLight ref={goldRef} position={[0, 0, 3]} color="#FFD86A" distance={8} decay={1.6} />
      <pointLight ref={pinkRef} position={[2, 1, 2]} color="#FF7090" distance={7} decay={1.8} />
    </>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#160810", 4, 9]} />
      <ambientLight intensity={0.6} color="#fff0e0" />
      <HeartbeatLights reduced={reduced} />
      <pointLight position={[-2, -1, 2]} intensity={10} color="#FFB060" distance={6} decay={2} />

      <CinematicCamera script="heart-reveal" reduced={reduced} />
      <LotusGodRays />
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.heart}
        fadeOutAt={0.6}
        fadeDuration={0.4}
        bpm={78}
        scale={0.7}
      />
      <FireworkBurst
        reduced={reduced}
        shape="heart"
        palette={["#FFD700", "#FF6B9A", "#FFFFFF", "#FFB0C0"]}
        delay={0.55}
        count={180}
        speed={1.8}
        gravity={0.4}
        drag={1.2}
        life={1.8}
        size={0.075}
      />
      <Lotus reduced={reduced} />
      {!reduced && <PollenDrift reduced={reduced} />}
      <LingeringSparkles reduced={reduced} color="rgba(255,210,200,1)" count={16} fadeInAt={1.4} radius={2.4} />
    </>
  );
}

export function LotusBlossomEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(220,80,120,0.32) 0%, rgba(20,4,12,0) 70%)",
        }}
      />

      <Canvas
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.4], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <Scene reduced={reduced} />
      </Canvas>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,200,220,0.10) 0%, transparent 60%)",
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
              "0 0 24px rgba(255,180,200,0.85), 0 2px 16px rgba(180,40,80,0.7), 0 0 60px rgba(255,215,0,0.4)",
          }}
        >
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}
