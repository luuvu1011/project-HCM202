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

/* ─── 3D torus shockwave rings (real geometry, depth-fog reactive) ───── */
function TorusShockwave({
  delay,
  color,
  axis,
  reduced,
}: {
  delay: number;
  color: string;
  axis: "x" | "y" | "z";
  reduced: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const localT = Math.max(0, t - delay);
    const life = Math.min(localT / 2.0, 1);
    const eased = 1 - Math.pow(1 - life, 3);
    const scale = 0.2 + eased * 3.8;
    m.scale.setScalar(scale);
    if (!reduced) {
      const spin = t * 0.4;
      if (axis === "x") m.rotation.x = spin;
      else if (axis === "y") m.rotation.y = spin;
      else m.rotation.z = spin;
    }
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, (1 - life) * 0.85);
  });
  const baseRot: [number, number, number] =
    axis === "x" ? [Math.PI / 2, 0, 0] :
    axis === "y" ? [0, Math.PI / 2, 0] :
    [0, 0, 0];
  return (
    <mesh ref={ref} rotation={baseRot}>
      <torusGeometry args={[0.5, 0.025, 12, 96]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Shockwaves({ reduced }: { reduced: boolean }) {
  const rings = useMemo(
    () => [
      { delay: 0, color: "#FFD86A", axis: "z" as const },
      { delay: 0.18, color: "#FF7A6A", axis: "x" as const },
      { delay: 0.34, color: "#FFE9B0", axis: "y" as const },
      { delay: 0.52, color: "#FFD86A", axis: "z" as const },
      { delay: 0.74, color: "#FFFFFF", axis: "x" as const },
    ],
    [],
  );
  return (
    <>
      {rings.map((r, i) => (
        <TorusShockwave key={i} {...r} reduced={reduced} />
      ))}
    </>
  );
}

/* ─── Central nova explosion ──────────────────────────────────────────── */
function NovaCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const coreTex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.15, "rgba(255,250,200,1)"],
    [0.35, "rgba(255,170,80,0.7)"],
    [0.7, "rgba(180,40,40,0.2)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const haloTex = useRadialTexture([
    [0, "rgba(255,215,140,0.45)"],
    [0.5, "rgba(180,100,60,0.18)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const innerTex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,255,240,0.6)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.lookAt(state.camera.position);
      const grow = Math.min(t / 0.55, 1);
      const eased = 1 - Math.pow(1 - grow, 4);
      const pulse = 1 + Math.sin(t * 3.5) * 0.1;
      coreRef.current.scale.setScalar(1.6 * pulse * eased);
    }
    if (haloRef.current) {
      haloRef.current.lookAt(state.camera.position);
      const pulse = 1 + Math.sin(t * 1.6) * 0.1;
      haloRef.current.scale.setScalar(4.2 * pulse);
    }
    if (innerRef.current) {
      innerRef.current.lookAt(state.camera.position);
      const flick = 0.95 + Math.sin(t * 14) * 0.05;
      const grow = Math.min(t / 0.4, 1);
      innerRef.current.scale.setScalar(0.55 * flick * grow);
    }
  });

  return (
    <>
      <mesh ref={haloRef} position={[0, 0, -0.4]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={haloTex}
          transparent
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
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/* ─── Inward particle vortex (collapsing into nova) ──────────────────── */
function VortexInward({
  reduced,
  count = 260,
}: {
  reduced: boolean;
  count?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.3, "rgba(255,220,120,0.95)"],
    [0.7, "rgba(255,90,80,0.4)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return {
          dirX: Math.sin(phi) * Math.cos(theta),
          dirY: Math.sin(phi) * Math.sin(theta),
          dirZ: Math.cos(phi) * 0.6,
          r0: 2.6 + Math.random() * 0.8,
          collapseSpeed: 1.4 + Math.random() * 1.6,
          spinSpeed: (Math.random() - 0.5) * 3,
          delay: Math.random() * 0.4,
          size: 0.05 + Math.random() * 0.1,
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
      if (p.colorMix < 0.45) c.set("#FFD86A");
      else if (p.colorMix < 0.75) c.set("#FFFFFF");
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
      // Collapse phase 0..1.4s, then orbit outward
      const collapse = Math.min(localT / 1.4, 1);
      const eased = collapse * collapse;
      const radius = Math.max(0.15, p.r0 * (1 - eased));
      const spinPhase = localT * p.spinSpeed * (reduced ? 0.3 : 1);
      const cs = Math.cos(spinPhase);
      const sn = Math.sin(spinPhase);
      const dx = p.dirX * cs - p.dirY * sn;
      const dy = p.dirX * sn + p.dirY * cs;
      dummy.position.set(dx * radius, dy * radius, p.dirZ * radius);
      dummy.quaternion.copy(state.camera.quaternion);
      const fade = collapse < 0.85 ? 1 : Math.max(0, 1 - (collapse - 0.85) / 0.15);
      const flicker = 0.85 + 0.15 * Math.sin(t * 10 + i);
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

/* ─── Cosmic mandala (rotating geometric grid in 3D space) ───────────── */
function CosmicMandala({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringTex = useRingTexture("rgba(255,215,0,0.45)");

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    if (!reduced) {
      g.rotation.z = state.clock.elapsedTime * 0.06;
      g.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.6]}>
      {[1.4, 2.0, 2.6, 3.2].map((r, i) => (
        <mesh key={i} scale={[r, r, 1]} rotation={[0, 0, i * 0.5]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={ringTex}
            transparent
            opacity={0.35 - i * 0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            color={i % 2 === 0 ? "#FFD86A" : "#FF7A6A"}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Anamorphic lens flare (horizontal + cross) ──────────────────────── */
function LensFlares() {
  const hRef = useRef<THREE.Mesh>(null);
  const vRef = useRef<THREE.Mesh>(null);
  const hTex = useStreakTexture("rgba(255,235,180,0.95)");
  const vTex = useStreakTexture("rgba(255,255,255,0.85)");

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (hRef.current) {
      hRef.current.lookAt(state.camera.position);
      const grow = Math.min(t / 0.5, 1);
      const eased = 1 - Math.pow(1 - grow, 3);
      const pulse = 0.9 + Math.sin(t * 4) * 0.1;
      hRef.current.scale.set(5 * eased * pulse, 0.16, 1);
      (hRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - t / 2.4);
    }
    if (vRef.current) {
      vRef.current.lookAt(state.camera.position);
      vRef.current.rotation.z = Math.PI / 4;
      const grow = Math.min(t / 0.6, 1);
      vRef.current.scale.set(3.6 * grow, 0.1, 1);
      (vRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.85 - t / 1.8);
    }
  });

  return (
    <>
      <mesh ref={hRef} position={[0, 0, 0.3]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={hTex}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={vRef} position={[0, 0, 0.25]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={vTex}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/* ─── Caustics overlay (animated light pattern) ──────────────────────── */
function CausticsBackdrop({ reduced }: { reduced: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useRadialTexture([
    [0, "rgba(255,200,120,0.35)"],
    [0.5, "rgba(180,80,160,0.15)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    if (!reduced) {
      const t = state.clock.elapsedTime;
      m.rotation.z = t * 0.08;
      const pulse = 1 + Math.sin(t * 0.6) * 0.08;
      m.scale.setScalar(6.5 * pulse);
    } else {
      m.scale.setScalar(6.5);
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0, -2.4]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function HeartbeatLights({ reduced }: { reduced: boolean }) {
  const goldRef = useRef<THREE.PointLight>(null);
  const coralRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = reduced ? 0.5 : heartbeat(t, 76);
    if (goldRef.current) goldRef.current.intensity = 18 + beat * 22;
    if (coralRef.current) coralRef.current.intensity = 8 + beat * 14;
  });
  return (
    <>
      <pointLight ref={goldRef} position={[0, 0, 3]} color="#FFD86A" distance={8} decay={1.6} />
      <pointLight ref={coralRef} position={[2, 2, 2]} color="#FF7A6A" distance={6} decay={2} />
    </>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#0a0608", 4, 9]} />
      <ambientLight intensity={0.4} color="#ffd9aa" />
      <HeartbeatLights reduced={reduced} />
      <pointLight position={[-2, -1, 2]} intensity={8} color="#FFE9B0" distance={6} decay={2} />

      <CinematicCamera script="nova-impact" reduced={reduced} />
      <CausticsBackdrop reduced={reduced} />
      <CosmicMandala reduced={reduced} />
      <HeartbeatCore
        reduced={reduced}
        palette={CORE_PALETTES.nova}
        fadeOutAt={0.55}
        fadeDuration={0.35}
        bpm={88}
        scale={1.0}
      />
      <FireworkBurst
        reduced={reduced}
        shape="spherical"
        palette={BURST_PALETTES.nova}
        delay={0.5}
        count={280}
        speed={3.0}
        gravity={0.5}
        drag={0.95}
        life={1.7}
        size={0.08}
      />
      <Shockwaves reduced={reduced} />
      {!reduced && <VortexInward reduced={reduced} count={260} />}
      <NovaCore />
      <LensFlares />
      <LingeringSparkles reduced={reduced} color="rgba(255,235,180,1)" count={20} fadeInAt={1.4} radius={2.6} />
    </>
  );
}

export function OpenHandRippleEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm magical backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(228,184,64,0.35) 0%, rgba(60,12,28,0) 70%)",
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

      {/* Chromatic edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,180,120,0.10) 0%, transparent 60%)",
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
              "0 0 24px rgba(255,215,0,0.85), 0 2px 16px rgba(200,16,46,0.55), 0 0 60px rgba(255,215,0,0.4)",
          }}
        >
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}
