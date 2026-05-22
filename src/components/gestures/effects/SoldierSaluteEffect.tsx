"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRadialTexture } from "@/components/gestures/effects/cinematicTextures";

interface Props { emotion: string; particlesReady?: boolean; }

/* ══════════════════════════════════════════════════════════════════════════════
 * Hiển thị ảnh /ảnh rồng việt nam.jpg qua THREE.TextureLoader (Suspense)
 * + LED glow pulse + sparkles + embers + fire = giống ảnh gốc, có animation
 * ══════════════════════════════════════════════════════════════════════════════ */

function srnd(s: number): number {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
const _dummy = new THREE.Object3D();
const IMG_URL = encodeURI("/ảnh rồng việt nam.jpg");

/* ── Ảnh chính ──────────────────────────────────────────────────────────────── */
function DragonImage({ reduced }: { reduced: boolean }) {
  const texture = useLoader(THREE.TextureLoader, IMG_URL);
  texture.colorSpace = THREE.SRGBColorSpace;

  const meshRef = useRef<THREE.Mesh>(null);

  /* Tính kích thước plane giữ đúng aspect ratio */
  const [W, H] = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    const aspect = img ? img.naturalHeight / img.naturalWidth : 9 / 16;
    const w = 4.60;
    return [w, w * aspect];
  }, [texture]);

  useFrame((state) => {
    const m = meshRef.current; if (!m) return;
    const t = state.clock.elapsedTime;
    /* Reveal nhanh (0.6s) + breathe rất nhẹ */
    const reveal  = 1 - Math.pow(1 - Math.min(t / 0.6, 1), 3);
    const breathe = reduced ? 1 : 1 + Math.sin(t * 0.55) * 0.007;
    m.scale.setScalar(reveal * breathe);
    (m.material as THREE.MeshBasicMaterial).opacity = reveal;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[W, H]} />
      <meshBasicMaterial map={texture} transparent opacity={0} />
    </mesh>
  );
}

/* ── Glow pulse theo đường thân rồng trong ảnh ──────────────────────────────── */
// Các điểm dọc thân rồng (scene coords, khớp bố cục ảnh)
// Đầu: trên-trái, thân vòng xuống-phải, đuôi: dưới-phải
const DRAGON_PTS: [number, number][] = [
  [-0.20,  0.85],  // đầu
  [-0.70,  0.58],  // cổ
  [-1.15,  0.22],  // thân trên
  [-1.55, -0.15],  // thân giữa
  [-1.65, -0.52],  // thân dưới
  [-1.35, -0.78],  // vòng dưới
  [-0.75, -0.80],  // đáy vòng
  [-0.12, -0.68],  // đuôi gần
  [ 0.50, -0.50],  // đuôi xa
  [ 0.90, -0.28],  // đuôi tip
];

function DragonGlowPulse({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tex  = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 128; cv.height = 128;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0.00, "rgba(255,180,40,0.80)");
    g.addColorStop(0.35, "rgba(220,30,5,0.35)");
    g.addColorStop(0.70, "rgba(160,10,2,0.12)");
    g.addColorStop(1.00, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const N = DRAGON_PTS.length;

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const e = 1 - Math.pow(1 - Math.min(t / 1.2, 1), 3);

    for (let i = 0; i < N; i++) {
      const [px, py] = DRAGON_PTS[i];
      const u = i / (N - 1);
      // Đầu to hơn, đuôi nhỏ hơn
      const baseR = i === 0 ? 0.52 : 0.28 - u * 0.12;
      const pulse  = reduced ? 1 : 1 + Math.sin(t * 1.4 + i * 0.6) * 0.18;
      _dummy.position.set(px, py, 0.02);
      _dummy.quaternion.identity();
      _dummy.scale.setScalar(baseR * pulse * e);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ── Scan shimmer đi qua ảnh ────────────────────────────────────────────────── */
function Shimmer({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex  = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 4; cv.height = 256;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0,  "rgba(255,200,60,0)");
    g.addColorStop(0.46, "rgba(255,220,100,0.14)");
    g.addColorStop(0.50, "rgba(255,245,180,0.28)");
    g.addColorStop(0.54, "rgba(255,220,100,0.14)");
    g.addColorStop(1.0,  "rgba(255,200,60,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);

  useFrame((state) => {
    const m = ref.current; if (!m || reduced) return;
    const t = state.clock.elapsedTime;
    tex.offset.y = -(t * 0.18) % 1;
    (m.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 0.9) * 0.28;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0.01]}>
      <planeGeometry args={[4.60, 2.59]} />
      <meshBasicMaterial map={tex} transparent opacity={0.7} depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ── Lửa thở từ đầu rồng ─────────────────────────────────────────────────────── */
const HEAD = DRAGON_PTS[0];
// Hướng lửa: đầu rồng ở trên-trái, quay mặt về phải → lửa bay sang phải+lên
const FIRE_DIR = [0.65, 0.30] as [number, number];

function HeadFire({ reduced, count = 140 }: { reduced: boolean; count?: number }) {
  const ref  = useRef<THREE.InstancedMesh>(null);
  const tex  = useRadialTexture([
    [0.00, "rgba(255,255,220,1)"],
    [0.20, "rgba(255,220,55,0.97)"],
    [0.52, "rgba(255,80,8,0.80)"],
    [0.82, "rgba(200,14,0,0.45)"],
    [1.00, "rgba(0,0,0,0)"],
  ]);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    period: 0.65 + srnd(i * 7 + 1)  * 0.60,
    sz:     0.068 + srnd(i * 11 + 3) * 0.110,
    sR:     (srnd(i * 13 + 5) - 0.5) * 0.55,
    sU:     (srnd(i * 19 + 9) - 0.5) * 0.45,
    speed:  0.55 + srnd(i * 31 + 15) * 0.55,
    ph:     srnd(i * 23 + 11) * Math.PI * 2,
    cm:     srnd(i * 29 + 13),
  })), [count]);

  const colorsSet = useRef(false);
  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    if (!colorsSet.current) {
      const c = new THREE.Color();
      for (let i = 0; i < seeds.length; i++) {
        const { cm } = seeds[i];
        if      (cm < 0.20) c.set("#FFFFFF");
        else if (cm < 0.48) c.set("#FFEE55");
        else if (cm < 0.76) c.set("#FF8010");
        else                c.set("#FF2010");
        mesh.setColorAt(i, c);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      colorsSet.current = true;
    }

    const t = state.clock.elapsedTime;
    const fireE = 1 - Math.pow(1 - Math.min(t / 1.0, 1), 3);

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const cp = ((t / s.period + s.ph) % 1);
      const dist = cp * s.speed;
      const fade = cp < 0.08 ? cp / 0.08 : Math.max(0, 1 - (cp - 0.08) / 0.92);
      _dummy.position.set(
        HEAD[0] + FIRE_DIR[0] * dist + s.sR * dist,
        HEAD[1] + FIRE_DIR[1] * dist + s.sU * dist,
        0.03,
      );
      _dummy.quaternion.copy(state.camera.quaternion);
      _dummy.scale.setScalar(s.sz * fade * (1 + cp * 1.3) * fireE * (reduced ? 0.55 : 1));
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} vertexColors transparent depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ── Lửa đuôi rồng ────────────────────────────────────────────────────────────── */
const TAIL = DRAGON_PTS[DRAGON_PTS.length - 1];

function TailFire({ reduced, count = 80 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tex  = useRadialTexture([
    [0.00, "rgba(255,255,200,1)"],
    [0.22, "rgba(255,200,40,0.94)"],
    [0.58, "rgba(255,60,8,0.72)"],
    [1.00, "rgba(0,0,0,0)"],
  ]);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    period: 0.80 + srnd(i * 7 + 2)  * 0.55,
    sz:     0.048 + srnd(i * 11 + 4) * 0.075,
    sx:     (srnd(i * 13 + 6) - 0.5) * 0.45,
    sy:     (srnd(i * 17 + 8) - 0.5) * 0.40,
    ph:     srnd(i * 23 + 12) * Math.PI * 2,
    speed:  0.40 + srnd(i * 29 + 14) * 0.40,
  })), [count]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const e = 1 - Math.pow(1 - Math.min(t / 1.2, 1), 3);
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const cp = ((t / s.period + s.ph) % 1);
      const dist = cp * s.speed;
      const fade = cp < 0.10 ? cp / 0.10 : Math.max(0, 1 - (cp - 0.10) / 0.90);
      _dummy.position.set(TAIL[0] + s.sx * dist, TAIL[1] + s.sy * dist, 0.02);
      _dummy.quaternion.copy(state.camera.quaternion);
      _dummy.scale.setScalar(s.sz * fade * (1 + cp) * e * (reduced ? 0.5 : 1));
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ── Embers bốc lên từ thân ─────────────────────────────────────────────────── */
function Embers({ reduced, count = 200 }: { reduced: boolean; count?: number }) {
  const ref  = useRef<THREE.InstancedMesh>(null);
  const tex  = useRadialTexture([
    [0.00, "rgba(255,255,255,1)"],
    [0.28, "rgba(255,200,50,0.94)"],
    [0.62, "rgba(230,48,10,0.55)"],
    [1.00, "rgba(0,0,0,0)"],
  ]);
  const seeds = useMemo(() => {
    const N = DRAGON_PTS.length;
    return Array.from({ length: count }, (_, i) => {
      const ptIdx = Math.floor(srnd(i * 7 + 1) * N);
      const [ex, ey] = DRAGON_PTS[ptIdx];
      return {
        ex, ey,
        xOff:   (srnd(i * 11 + 3) - 0.5) * 0.55,
        rise:   0.20 + srnd(i * 13 + 5) * 0.50,
        wobble: 0.03 + srnd(i * 17 + 7) * 0.10,
        wF:     0.5  + srnd(i * 19 + 9) * 2.2,
        sz:     0.022 + srnd(i * 23 + 11) * 0.042,
        period: 2.2  + srnd(i * 29 + 13) * 2.5,
        ph:     srnd(i * 31 + 15) * Math.PI * 2,
        cm:     srnd(i * 37 + 17),
      };
    });
  }, [count]);

  const colorsSet = useRef(false);
  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    if (!colorsSet.current) {
      const c = new THREE.Color();
      for (let i = 0; i < seeds.length; i++) {
        if      (seeds[i].cm < 0.30) c.set("#FFFFFF");
        else if (seeds[i].cm < 0.62) c.set("#FFD040");
        else                         c.set("#FF5020");
        mesh.setColorAt(i, c);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      colorsSet.current = true;
    }

    const t = state.clock.elapsedTime;
    const e = 1 - Math.pow(1 - Math.min(t / 1.5, 1), 3);
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const cp = ((t / s.period + s.ph) % 1);
      const rise   = cp * s.rise;
      const wobbleX = Math.sin(t * s.wF + s.ph) * s.wobble;
      const fade   = cp < 0.12 ? cp / 0.12 : Math.max(0, 1 - (cp - 0.12) / 0.88);
      _dummy.position.set(s.ex + s.xOff * cp + wobbleX, s.ey + rise, 0.04);
      _dummy.quaternion.copy(state.camera.quaternion);
      _dummy.scale.setScalar(s.sz * fade * e * (reduced ? 0.6 : 1));
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} vertexColors transparent depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ── Night sparkles (nền đêm + thành phố) ───────────────────────────────────── */
function NightSparkles({ reduced, count = 120 }: { reduced: boolean; count?: number }) {
  const ref  = useRef<THREE.InstancedMesh>(null);
  const tex  = useRadialTexture([
    [0, "rgba(255,255,255,1)"], [0.4, "rgba(200,220,255,0.60)"], [1, "rgba(0,0,0,0)"],
  ]);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x:    (srnd(i * 3.1 + 1) - 0.5) * 5.2,
    y:    (srnd(i * 5.7 + 5) - 0.5) * 3.0,
    z:    -0.6 - srnd(i * 7 + 9) * 1.2,
    sz:   0.010 + srnd(i * 11 + 3) * 0.025,
    ph:   srnd(i * 13 + 7) * Math.PI * 2,
    freq: 0.4 + srnd(i * 17 + 11) * 3.0,
  })), [count]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const tw = 0.20 + 0.80 * Math.abs(Math.sin(t * s.freq + s.ph));
      _dummy.position.set(s.x, s.y, s.z);
      _dummy.quaternion.copy(state.camera.quaternion);
      _dummy.scale.setScalar(s.sz * tw);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ── Lights theo đầu rồng ────────────────────────────────────────────────────── */
function DragonLights({ reduced }: { reduced: boolean }) {
  const l1 = useRef<THREE.PointLight>(null);
  const l2 = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pu = reduced ? 0.5 : 0.5 + Math.sin(t * 1.3) * 0.5;
    if (l1.current) l1.current.intensity = 30 + pu * 36;
    if (l2.current) l2.current.intensity = 18 + pu * 22;
  });
  return (
    <>
      <pointLight ref={l1} position={[HEAD[0], HEAD[1] + 0.3, 1.0]}
        color="#FFD060" distance={8} decay={1.5} />
      <pointLight ref={l2} position={[TAIL[0], TAIL[1] + 0.2, 0.8]}
        color="#FF4020" distance={7} decay={1.6} />
      <pointLight position={[0.3, 0.4, 2.5]} intensity={10}
        color="#FFF0C8" distance={7} decay={2} />
    </>
  );
}

/* ── Camera tĩnh, drift cực nhẹ ─────────────────────────────────────────────── */
function CinematicCam({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (reduced) { state.camera.position.set(0, 0, 4.0); state.camera.lookAt(0, 0, 0); return; }
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.042) * 0.06;
    state.camera.position.y = Math.cos(t * 0.035) * 0.05;
    state.camera.position.z = 4.0 - Math.sin(t * 0.028) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════════
 * EFFECT 1: ENERGY RINGS — vòng sáng lan rộng từ đầu + thân rồng
 * ══════════════════════════════════════════════════════════════════════════════ */
function EnergyRings({ reduced }: { reduced: boolean }) {
  // 3 ring emitters: đầu, giữa thân, đuôi
  const EMITTERS = [DRAGON_PTS[0], DRAGON_PTS[4], DRAGON_PTS[9]];
  const RING_N = 5; // rings per emitter
  const total  = EMITTERS.length * RING_N;
  const ref    = useRef<THREE.InstancedMesh>(null);
  const tex    = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 256; cv.height = 256;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(128,128,88, 128,128,128);
    g.addColorStop(0,    "rgba(0,0,0,0)");
    g.addColorStop(0.50, "rgba(0,0,0,0)");
    g.addColorStop(0.68, "rgba(255,180,30,0.90)");
    g.addColorStop(0.80, "rgba(255,80,10,0.55)");
    g.addColorStop(1.00, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const PERIOD = 3.5;
    let idx = 0;
    for (let e = 0; e < EMITTERS.length; e++) {
      const [ex, ey] = EMITTERS[e];
      const phaseOffset = e * (PERIOD / EMITTERS.length);
      for (let r = 0; r < RING_N; r++) {
        const cp = ((t + phaseOffset + r * (PERIOD / RING_N)) / PERIOD) % 1;
        const maxR = e === 0 ? 1.60 : 1.20;
        const radius = cp * maxR;
        const fade = cp < 0.05 ? cp / 0.05 : Math.max(0, 1 - (cp - 0.05) / 0.95);
        _dummy.position.set(ex, ey, 0.06);
        _dummy.quaternion.identity();
        _dummy.scale.set(radius * 2, radius * 2, 1);
        _dummy.updateMatrix();
        mesh.setMatrixAt(idx++, _dummy.matrix);
        // Update opacity via scale trick — keep fade in userData via color
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, total]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={0.55} depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * EFFECT 2: GOLD DUST — bụi vàng nổi khắp scene
 * ══════════════════════════════════════════════════════════════════════════════ */
function GoldDust({ reduced, count = 280 }: { reduced: boolean; count?: number }) {
  const ref  = useRef<THREE.InstancedMesh>(null);
  const tex  = useRadialTexture([
    [0, "rgba(255,220,80,1)"], [0.4, "rgba(255,180,30,0.70)"], [1, "rgba(0,0,0,0)"],
  ]);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x0:   (srnd(i * 3 + 1) - 0.5) * 5.5,
    y0:   (srnd(i * 7 + 5) - 0.5) * 3.2,
    z:    -0.1 - srnd(i * 11 + 9) * 0.6,
    sz:   0.008 + srnd(i * 13 + 3) * 0.018,
    vx:   (srnd(i * 17 + 7) - 0.5) * 0.08,
    vy:   0.025 + srnd(i * 19 + 9) * 0.055,
    ph:   srnd(i * 23 + 11) * Math.PI * 2,
    freq: 0.3 + srnd(i * 29 + 13) * 1.2,
    life: 3.0 + srnd(i * 31 + 15) * 4.0,
    del:  srnd(i * 37 + 17) * 3.0,
  })), [count]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const lt = ((t - s.del + s.life * 100) % s.life);
      const prog = lt / s.life;
      const x = s.x0 + s.vx * lt + Math.sin(t * s.freq + s.ph) * 0.12;
      const y = s.y0 + s.vy * lt;
      const fade = prog < 0.1 ? prog / 0.1 : prog > 0.85 ? Math.max(0, (1 - prog) / 0.15) : 1;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * s.freq * 2 + s.ph));
      _dummy.position.set(x, y, s.z);
      _dummy.quaternion.copy(state.camera.quaternion);
      _dummy.scale.setScalar(s.sz * fade * tw * (reduced ? 0.7 : 1));
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * EFFECT 3: DRAGON ROAR FLASH — flash chớp sáng từ đầu rồng mỗi ~4s
 * ══════════════════════════════════════════════════════════════════════════════ */
function RoarFlash({ reduced }: { reduced: boolean }) {
  const ref1 = useRef<THREE.Mesh>(null); // inner flash
  const ref2 = useRef<THREE.Mesh>(null); // outer ring
  const tex1  = useRadialTexture([
    [0, "rgba(255,255,240,1)"], [0.3, "rgba(255,220,80,0.80)"],
    [0.65, "rgba(255,100,10,0.35)"], [1, "rgba(0,0,0,0)"],
  ]);
  const tex2  = useRadialTexture([
    [0, "rgba(0,0,0,0)"], [0.55, "rgba(0,0,0,0)"],
    [0.70, "rgba(255,200,50,0.75)"], [0.85, "rgba(255,80,10,0.40)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (reduced) { [ref1, ref2].forEach(r => r.current && r.current.scale.setScalar(0)); return; }
    const ROAR_PERIOD = 4.2;
    const cp = (t % ROAR_PERIOD) / ROAR_PERIOD;
    // Flash: fast rise (0-0.06) then fade (0.06-0.25)
    const flashT = cp < 0.25 ? cp / 0.25 : 0;
    const inner  = flashT < 0.06 / 0.25 ? flashT / (0.06/0.25) : Math.max(0, 1 - (flashT - 0.06/0.25) / (0.19/0.25));
    const ring   = flashT > 0.05 / 0.25 ? Math.max(0, 1 - (flashT - 0.05/0.25) / 0.8) : 0;
    if (ref1.current) {
      ref1.current.position.set(HEAD[0], HEAD[1], 0.10);
      ref1.current.scale.setScalar(inner * 2.2);
      (ref1.current.material as THREE.MeshBasicMaterial).opacity = inner * 0.90;
    }
    if (ref2.current) {
      const ringR = 0.5 + flashT * 3.5;
      ref2.current.position.set(HEAD[0], HEAD[1], 0.08);
      ref2.current.scale.setScalar(ringR * ring);
      (ref2.current.material as THREE.MeshBasicMaterial).opacity = ring * 0.70;
    }
  });

  return (
    <>
      <mesh ref={ref1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex1} transparent opacity={0} depthWrite={false}
          toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ref2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex2} transparent opacity={0} depthWrite={false}
          toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * EFFECT 4: SCALE SHIMMER — vảy rồng chớp sáng ngẫu nhiên
 * ══════════════════════════════════════════════════════════════════════════════ */
function ScaleShimmer({ reduced, count = 80 }: { reduced: boolean; count?: number }) {
  const ref  = useRef<THREE.InstancedMesh>(null);
  const tex  = useRadialTexture([
    [0, "rgba(255,255,255,1)"], [0.25, "rgba(255,230,120,0.90)"],
    [0.55, "rgba(255,150,20,0.45)"], [1, "rgba(0,0,0,0)"],
  ]);
  const seeds = useMemo(() => {
    const N = DRAGON_PTS.length;
    return Array.from({ length: count }, (_, i) => {
      const ptA = Math.floor(srnd(i * 7 + 1) * (N - 1));
      const ptB = ptA + 1;
      const f = srnd(i * 11 + 3);
      const [ax, ay] = DRAGON_PTS[ptA], [bx, by] = DRAGON_PTS[ptB];
      return {
        x: ax + (bx - ax) * f + (srnd(i * 13 + 5) - 0.5) * 0.18,
        y: ay + (by - ay) * f + (srnd(i * 17 + 7) - 0.5) * 0.18,
        sz:    0.055 + srnd(i * 19 + 9) * 0.080,
        period: 1.2  + srnd(i * 23 + 11) * 2.8,
        ph:    srnd(i * 29 + 13) * Math.PI * 2,
        duty:  0.08  + srnd(i * 31 + 15) * 0.12,
      };
    });
  }, [count]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const cp = ((t + s.ph) / s.period) % 1;
      // Only bright for `duty` fraction of cycle
      const bright = cp < s.duty
        ? Math.sin((cp / s.duty) * Math.PI)
        : 0;
      _dummy.position.set(s.x, s.y, 0.05);
      _dummy.quaternion.copy(state.camera.quaternion);
      _dummy.scale.setScalar(s.sz * bright * (reduced ? 0.6 : 1));
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * EFFECT 5: SMOKE WISPS — khói mờ bốc lên từ thân
 * ══════════════════════════════════════════════════════════════════════════════ */
function SmokeWisps({ reduced, count = 60 }: { reduced: boolean; count?: number }) {
  const ref  = useRef<THREE.InstancedMesh>(null);
  const tex  = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 128; cv.height = 128;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,    "rgba(200,160,80,0.30)");
    g.addColorStop(0.45, "rgba(160,100,40,0.14)");
    g.addColorStop(1,    "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0,0,128,128);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const seeds = useMemo(() => {
    const N = DRAGON_PTS.length;
    return Array.from({ length: count }, (_, i) => {
      const ptIdx = Math.floor(srnd(i * 7 + 1) * N);
      const [ex, ey] = DRAGON_PTS[ptIdx];
      return {
        ex, ey,
        xDrift: (srnd(i * 11 + 3) - 0.5) * 0.40,
        rise:   0.35 + srnd(i * 13 + 5) * 0.45,
        sz:     0.18  + srnd(i * 17 + 7) * 0.22,
        period: 3.5   + srnd(i * 19 + 9) * 3.0,
        ph:     srnd(i * 23 + 11) * Math.PI * 2,
      };
    });
  }, [count]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const cp = ((t + s.ph) / s.period) % 1;
      const rise = cp * s.rise;
      const drift = s.xDrift * cp;
      const fade  = cp < 0.15 ? cp / 0.15 : Math.max(0, 1 - (cp - 0.15) / 0.85);
      const grow  = 0.5 + cp * 0.8;
      _dummy.position.set(s.ex + drift, s.ey + rise, -0.02);
      _dummy.quaternion.copy(state.camera.quaternion);
      _dummy.scale.setScalar(s.sz * grow * fade * (reduced ? 0.5 : 1));
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false}
        toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * EFFECT 7: FIREWORKS — pháo hoa nổ liên hoàn quanh khung hình, ngoài vùng rồng
 *
 * 8 đài pháo hoa rải đều quanh rìa khung, mỗi đài có chu kỳ nổ riêng.
 * Mỗi vụ nổ = 28 hạt phát tỏa hình tròn + một flash sáng ở tâm.
 * Màu: đỏ cờ / vàng / trắng — đậm chất lễ hội Việt Nam.
 * ══════════════════════════════════════════════════════════════════════════════ */
const FIREWORK_BURSTS = [
  { x: -1.00, y:  1.70, t0: 0.20, period: 3.6, color: "#FF3030" },
  { x:  1.00, y:  1.55, t0: 0.85, period: 3.8, color: "#FFD040" },
  { x:  1.85, y:  1.15, t0: 1.55, period: 3.4, color: "#FFFFFF" },
  { x:  2.05, y:  0.10, t0: 2.20, period: 3.6, color: "#FF5020" },
  { x:  1.75, y: -0.95, t0: 2.90, period: 3.8, color: "#FFD040" },
  { x:  0.20, y: -1.50, t0: 0.50, period: 3.4, color: "#FFFFFF" },
  { x: -1.55, y: -1.25, t0: 1.20, period: 3.6, color: "#FF3030" },
  { x: -2.00, y:  0.95, t0: 1.95, period: 3.8, color: "#FFD040" },
] as const;
const FIREWORK_PARTICLES_PER_BURST = 28;
const FIREWORK_BURST_LIFE = 1.55;

function Fireworks({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const flashRef = useRef<THREE.InstancedMesh>(null);
  const tex = useRadialTexture([
    [0.00, "rgba(255,255,255,1)"],
    [0.30, "rgba(255,255,255,0.65)"],
    [0.70, "rgba(255,255,255,0.18)"],
    [1.00, "rgba(0,0,0,0)"],
  ]);
  const flashTex = useRadialTexture([
    [0.00, "rgba(255,255,240,1)"],
    [0.35, "rgba(255,220,120,0.75)"],
    [0.75, "rgba(255,120,40,0.20)"],
    [1.00, "rgba(0,0,0,0)"],
  ]);

  const total = FIREWORK_BURSTS.length * FIREWORK_PARTICLES_PER_BURST;
  const particles = useMemo(() => {
    const arr: { burstIdx: number; vx: number; vy: number; sz: number; jitter: number }[] = [];
    for (let b = 0; b < FIREWORK_BURSTS.length; b++) {
      for (let p = 0; p < FIREWORK_PARTICLES_PER_BURST; p++) {
        const angle = (p / FIREWORK_PARTICLES_PER_BURST) * Math.PI * 2 +
          (srnd(b * 31 + p * 7) - 0.5) * 0.18;
        const speed = 0.85 + srnd(b * 17 + p * 11) * 0.55;
        arr.push({
          burstIdx: b,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          sz: 0.055 + srnd(b * 23 + p * 13) * 0.045,
          jitter: srnd(b * 29 + p * 5),
        });
      }
    }
    return arr;
  }, []);

  const colorsSet = useRef(false);
  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const flashMesh = flashRef.current;
    const c = new THREE.Color();

    if (!colorsSet.current) {
      for (let i = 0; i < particles.length; i++) {
        c.set(FIREWORK_BURSTS[particles[i].burstIdx].color);
        mesh.setColorAt(i, c);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      if (flashMesh) {
        for (let b = 0; b < FIREWORK_BURSTS.length; b++) {
          c.set(FIREWORK_BURSTS[b].color);
          flashMesh.setColorAt(b, c);
        }
        if (flashMesh.instanceColor) flashMesh.instanceColor.needsUpdate = true;
      }
      colorsSet.current = true;
    }

    const t = state.clock.elapsedTime;

    // Sparks
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const b = FIREWORK_BURSTS[p.burstIdx];
      const raw = (t - b.t0) % b.period;
      const localT = raw < 0 ? raw + b.period : raw;
      const lt = localT < FIREWORK_BURST_LIFE ? localT : -1;
      if (lt < 0 || reduced) {
        _dummy.position.set(b.x, b.y, -0.05);
        _dummy.quaternion.copy(state.camera.quaternion);
        _dummy.scale.setScalar(0);
        _dummy.updateMatrix();
        mesh.setMatrixAt(i, _dummy.matrix);
        continue;
      }
      const expansion = 1 - Math.exp(-lt * 2.4);
      const gravity = -0.45 * lt * lt;
      const px = b.x + p.vx * expansion * 1.35;
      const py = b.y + p.vy * expansion * 1.35 + gravity;
      const fade = lt < 0.08
        ? lt / 0.08
        : Math.max(0, 1 - (lt - 0.08) / (FIREWORK_BURST_LIFE - 0.08));
      // Twinkle each spark slightly
      const tw = 0.7 + 0.3 * Math.sin(lt * 22 + p.jitter * 6.28);
      _dummy.position.set(px, py, -0.05);
      _dummy.quaternion.copy(state.camera.quaternion);
      _dummy.scale.setScalar(p.sz * fade * tw);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Burst-center flash
    if (flashMesh) {
      for (let b = 0; b < FIREWORK_BURSTS.length; b++) {
        const burst = FIREWORK_BURSTS[b];
        const raw = (t - burst.t0) % burst.period;
        const localT = raw < 0 ? raw + burst.period : raw;
        const FLASH_LIFE = 0.45;
        const lt = localT < FLASH_LIFE ? localT : -1;
        if (lt < 0 || reduced) {
          _dummy.position.set(burst.x, burst.y, -0.04);
          _dummy.scale.setScalar(0);
          _dummy.updateMatrix();
          flashMesh.setMatrixAt(b, _dummy.matrix);
          continue;
        }
        const k = lt / FLASH_LIFE;
        const sz = 0.45 + k * 1.10;
        const alpha = Math.pow(1 - k, 2.2);
        _dummy.position.set(burst.x, burst.y, -0.04);
        _dummy.quaternion.copy(state.camera.quaternion);
        _dummy.scale.setScalar(sz * alpha);
        _dummy.updateMatrix();
        flashMesh.setMatrixAt(b, _dummy.matrix);
      }
      flashMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={flashRef} args={[undefined, undefined, FIREWORK_BURSTS.length]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={flashTex} vertexColors transparent depthWrite={false}
          toneMapped={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      <instancedMesh ref={ref} args={[undefined, undefined, total]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex} vertexColors transparent depthWrite={false}
          toneMapped={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * EFFECT 6: GOD RAYS — tia sáng từ đầu rồng
 * ══════════════════════════════════════════════════════════════════════════════ */
function GodRays({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 8; cv.height = 256;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0,    "rgba(255,220,80,0)");
    g.addColorStop(0.08, "rgba(255,220,80,0.55)");
    g.addColorStop(0.50, "rgba(255,180,30,0.22)");
    g.addColorStop(1.00, "rgba(255,120,10,0)");
    ctx.fillStyle = g; ctx.fillRect(0,0,8,256);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const RAY_N = 10;
  const rays = useMemo(() => Array.from({ length: RAY_N }, (_, i) => ({
    angle: (i / RAY_N) * Math.PI * 2,
    len:   0.9 + srnd(i * 7 + 1) * 0.8,
    w:     0.06 + srnd(i * 11 + 3) * 0.08,
    ph:    srnd(i * 13 + 5) * Math.PI * 2,
    speed: (srnd(i * 17 + 7) - 0.5) * 0.15,
  })), []);

  useFrame((state) => {
    const g = groupRef.current; if (!g || reduced) return;
    const t = state.clock.elapsedTime;
    g.position.set(HEAD[0], HEAD[1], 0.07);
    g.rotation.z = t * 0.08;
    g.children.forEach((child, i) => {
      const r = rays[i];
      const pulse = 0.50 + Math.sin(t * 0.9 + r.ph) * 0.35;
      child.scale.set(r.w, r.len, 1);
      (child as THREE.Mesh).rotation.z = r.angle + t * r.speed;
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = pulse * 0.55;
    });
  });

  return (
    <group ref={groupRef}>
      {rays.map((r, i) => (
        <mesh key={i} rotation={[0, 0, r.angle]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} transparent opacity={0.45} depthWrite={false}
            toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Scene content (bên trong Suspense) ──────────────────────────────────────── */
function SceneContent({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.06} color="#ffe0c8" />
      <DragonLights reduced={reduced} />
      <CinematicCam reduced={reduced} />

      {/* Nền */}
      <NightSparkles reduced={reduced} count={reduced ? 50 : 120} />
      <GoldDust      reduced={reduced} count={reduced ? 110 : 280} />

      {/* Ảnh rồng chính */}
      <DragonImage reduced={reduced} />

      {/* Shimmer scan */}
      <Shimmer reduced={reduced} />

      {/* Glow dọc thân */}
      <DragonGlowPulse reduced={reduced} />

      {/* Hiệu ứng mới */}
      <SmokeWisps   reduced={reduced} count={reduced ? 25 : 60}  />
      <EnergyRings  reduced={reduced} />
      <GodRays      reduced={reduced} />
      <ScaleShimmer reduced={reduced} count={reduced ? 32 : 80}  />
      <RoarFlash    reduced={reduced} />
      <Fireworks    reduced={reduced} />

      {/* Lửa + embers */}
      <HeadFire  reduced={reduced} count={reduced ? 55 : 140} />
      <TailFire  reduced={reduced} count={reduced ? 32 : 80}  />
      <Embers    reduced={reduced} count={reduced ? 80 : 200} />
    </>
  );
}

/* ── Fallback khi đang load ──────────────────────────────────────────────────── */
function LoadingFallback() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      0.3 + Math.sin(s.clock.elapsedTime * 3) * 0.25;
  });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 0.04]} />
      <meshBasicMaterial color="#FF4020" transparent opacity={0.5}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * EXPORT
 * ══════════════════════════════════════════════════════════════════════════════ */
export function SoldierSaluteEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div aria-hidden className="absolute inset-0" style={{ background: "#000" }} />

      <Canvas
        dpr={[1, 1.85]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.0], fov: 66 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SceneContent reduced={reduced} />
        </Suspense>
      </Canvas>

      <div aria-hidden className="absolute inset-x-0 top-0 h-[6%] bg-black/92" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[6%] bg-black/92" />

      <motion.div
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{ delay: 1.2, duration: 0.9 }}
      >
        <p
          className="font-cinzel text-sm font-bold uppercase tracking-[0.36em] sm:text-base"
          style={{
            color: "#fff2c2",
            textShadow:
              "0 0 24px rgba(255,215,0,0.95), 0 2px 18px rgba(200,16,46,0.7), 0 0 60px rgba(255,130,0,0.55)",
          }}
        >
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}
