"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  useRadialTexture,
  useStreakTexture,
} from "@/components/gestures/effects/cinematicTextures";

interface Props { emotion: string; particlesReady?: boolean; }

/* ══════════════════════════════════════════════════════════════════════════════
 * CHÂN DUNG HỒ CHÍ MINH — Drone-show portrait built from light dots
 *
 * Reconstructed from iconic photographs of President Hồ Chí Minh, emphasising
 * the most universally recognised features:
 *
 *  • High forehead (trán cao, rộng) — sweeping back to a receding hairline
 *  • Thin, short side hair / brushed-back grey hair (tóc bạc chải ngược)
 *  • Kind, slightly almond-shaped eyes (đôi mắt hiền)
 *  • Thin moustache (ria mép mỏng)
 *  • Long, narrow, tapering chin-beard (chòm râu cằm) — the signature feature
 *  • Đại Cán stand-collar suit (áo đại cán cổ đứng) — Vietnamese leader uniform
 *  • Slim neck and gentle shoulder slope
 *
 * Aesthetic: warm-white & soft-gold LED dots, drone-light feel — each point a
 *   distinct light source with gentle hover wobble (≤1cm) and twinkle.
 * Palette: ivory-white #FFF8E0, warm gold #FFD080, amber accent #FFAA40
 * ══════════════════════════════════════════════════════════════════════════════ */

function srnd(s: number): number {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function flapVelocity(t: number): number { return Math.abs(Math.cos(t * 1.35)); }

type PortraitDot = {
  bx: number; by: number; bz: number;
  size: number; twinkleFreq: number; phase: number; delay: number;
  hover: number;                // independent hover-wobble amplitude (drone flutter)
  tint: 0 | 1 | 2 | 3;          // 0=pure white, 1=warm white, 2=warm gold, 3=amber shadow
};

/* ─────────────────────────────────────────────────────────────────────────────
 * buildHoChiMinhDotsFromImage — sample a real photograph of President Hồ Chí Minh
 *   into drone-show LED dot positions.
 *
 *  1. Detect background polarity by sampling image corners.
 *  2. Threshold-mask the foreground (the face / portrait silhouette).
 *  3. Subsample candidate pixels down to ~targetDots.
 *  4. Map pixel (x,y) → scene (sx, sy) with image aspect preserved.
 *  5. Assign tint by brightness band: bright = white LED, mid = warm gold,
 *     dark = amber accent.
 * ────────────────────────────────────────────────────────────────────────── */
function buildHoChiMinhDotsFromImage(
  imageData: ImageData,
  maxDots = 8500,
): PortraitDot[] {
  const W = imageData.width;
  const H = imageData.height;
  const data = imageData.data;
  const dots: PortraitDot[] = [];

  // Probe background brightness from the full edge ring
  let bgSum = 0, bgCount = 0;
  for (let x = 0; x < W; x++) {
    for (const y of [0, H - 1]) {
      const i = (y * W + x) * 4;
      bgSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      bgCount++;
    }
  }
  for (let y = 0; y < H; y++) {
    for (const x of [0, W - 1]) {
      const i = (y * W + x) * 4;
      bgSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      bgCount++;
    }
  }
  const bg = bgSum / bgCount;
  const bgIsDark = bg < 128;
  // Very tight threshold so we capture even subtle tonal detail
  const threshold = bgIsDark ? bg + 12 : bg - 12;

  // Scene coordinates: preserve aspect, fit into ~2.3 wide × matching height
  // (bigger portrait so facial detail reads clearly)
  const aspect = H / W;
  const sceneW = 2.3;
  const sceneH = sceneW * aspect;
  const cellW = sceneW / W;
  const cellH = sceneH / H;

  // Scan every pixel — grid-aligned dot per foreground pixel
  let idx = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const a = data[i + 3];
      if (a < 100) continue;
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const isFg = bgIsDark ? brightness > threshold : brightness < threshold;
      if (!isFg) continue;

      // Brightness normalized within foreground range (0 = at threshold, 1 = extreme)
      const bNorm = bgIsDark
        ? Math.min(1, (brightness - threshold) / Math.max(20, 255 - threshold))
        : Math.min(1, (threshold - brightness) / Math.max(20, threshold));

      // Very small jitter — keep image sharp, just enough to look organic
      const jx = (srnd(idx * 7.1) - 0.5) * cellW * 0.20;
      const jy = (srnd(idx * 9.7) - 0.5) * cellH * 0.20;
      const sx = (x / W - 0.5) * sceneW + jx;
      const sy = -(y / H - 0.5) * sceneH + jy;

      // 4 tonal bands → tighter tonal mapping of facial features
      let tint: 0 | 1 | 2 | 3;
      if (bNorm > 0.72) tint = 0;        // strong highlights → pure white
      else if (bNorm > 0.45) tint = 1;   // upper midtone → warm white
      else if (bNorm > 0.20) tint = 2;   // mid → warm gold
      else tint = 3;                     // shadows → amber

      dots.push({
        bx: sx,
        by: sy,
        bz: (srnd(idx * 5.1) - 0.5) * 0.012,
        // Small, fairly uniform LED size — dense grid stays crisp & non-overlapping
        size: 0.013 + bNorm * 0.008,
        twinkleFreq: 1.6 + srnd(idx * 13.7) * 2.4,
        phase: srnd(idx * 17.3) * Math.PI * 2,
        delay: srnd(idx * 19.7) * 0.5,
        // Much smaller hover — keeps portrait still & legible
        hover: 0.0015 + srnd(idx * 23.7) * 0.0025,
        tint,
      });
      idx++;
    }
  }

  // Cap at maxDots — uniform stride keeps spatial coverage
  if (dots.length > maxDots) {
    const stride = dots.length / maxDots;
    const kept: PortraitDot[] = [];
    for (let i = 0; i < dots.length; i++) {
      if (Math.floor(i / stride) !== Math.floor((i - 1) / stride)) {
        kept.push(dots[i]);
      }
    }
    return kept;
  }

  return dots;
}

/* Procedural fallback (used only if the photo fails to load) ────────────── */
function buildHoChiMinhDots(): PortraitDot[] {
  const dots: PortraitDot[] = [];
  let idx = 0;

  const push = (
    pts: Array<{ x: number; y: number; z?: number; tint?: 0 | 1 | 2 | 3; sz?: number }>,
    defTint: 0 | 1 | 2 | 3 = 0,
  ) => {
    for (const p of pts) {
      const j = (d: number) => (srnd(idx * 7.3 + d) - 0.5) * 0.008;
      dots.push({
        bx: p.x + j(1),
        by: p.y + j(2),
        bz: (p.z ?? 0) + (srnd(idx * 5.1) - 0.5) * 0.06,
        size: (p.sz ?? 0.032) + srnd(idx * 11.3) * 0.012,
        twinkleFreq: 1.8 + srnd(idx * 13.7) * 2.6,
        phase: srnd(idx * 17.3) * Math.PI * 2,
        delay: srnd(idx * 19.7) * 0.55,
        hover: 0.004 + srnd(idx * 23.7) * 0.010,
        tint: p.tint ?? defTint,
      });
      idx++;
    }
  };

  // ══ FACE OVAL OUTLINE — narrow oval, slightly elongated chin ═════════════
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * Math.PI * 2;
    // Slightly more elongated at chin (lower y)
    const ry = Math.sin(a) < 0 ? 0.36 : 0.38;
    push([{ x: Math.cos(a) * 0.40, y: Math.sin(a) * ry + 0.18, tint: 0 }]);
  }

  // ══ HIGH FOREHEAD — light fill in upper face (đặc trưng: trán cao) ═══════
  for (let i = 0; i < 18; i++) {
    const r = srnd(i * 13 + 1), a = srnd(i * 23 + 5) * Math.PI * 2;
    push([{ x: Math.cos(a) * 0.30 * r, y: 0.32 + Math.sin(a) * 0.10 * r, tint: 0, sz: 0.028 }]);
  }

  // ══ HAIR — back-swept, receding hairline (tóc bạc chải ngược) ════════════
  // Top crown (sparse, receding)
  for (let i = 0; i < 22; i++) {
    const t = i / 21;
    const a = Math.PI + t * Math.PI;       // top semicircle
    const r = 0.36 - Math.abs(Math.cos(a)) * 0.06; // slight flattening
    push([{ x: Math.cos(a) * r, y: Math.sin(a) * 0.16 + 0.58, tint: 1, sz: 0.036 }]);
  }
  // Side hair (left + right, thin)
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      push([{ x: side * (0.36 + t * 0.03), y: 0.45 - t * 0.25, tint: 1, sz: 0.030 }]);
    }
  }
  // Hair strand suggestions across forehead-hairline
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const x = -0.30 + t * 0.60;
    const y = 0.52 + Math.sin(t * Math.PI) * 0.08;
    push([{ x, y, tint: 1, sz: 0.030 }]);
  }

  // ══ EYEBROWS — thin, slightly arched (chân mày mỏng) ═════════════════════
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const x = side * (0.10 + t * 0.20);
      const y = 0.20 + Math.sin(t * Math.PI) * 0.02 + (side === -1 ? 0 : 0);
      push([{ x, y, tint: 1, sz: 0.026 }]);
    }
  }

  // ══ EYES — small, kind, almond shape (đôi mắt hiền) ══════════════════════
  for (const side of [-1, 1] as const) {
    // Eye outline
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      push([{ x: side * 0.19 + Math.cos(a) * 0.045, y: 0.115 + Math.sin(a) * 0.022, tint: 0, sz: 0.022 }]);
    }
    // Pupil (small bright accent)
    push([{ x: side * 0.19, y: 0.115, tint: 2, sz: 0.040 }]);
  }

  // ══ NOSE — straight, medium bridge ═══════════════════════════════════════
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    push([{ x: srnd(i * 9 + 1) * 0.012 - 0.004, y: 0.08 - t * 0.16, tint: 0, sz: 0.024 }]);
  }
  // Nose tip
  push([
    { x: -0.025, y: -0.085, tint: 0, sz: 0.028 },
    { x:  0.025, y: -0.085, tint: 0, sz: 0.028 },
    { x:  0.000, y: -0.095, tint: 0, sz: 0.030 },
  ]);

  // ══ MOUSTACHE — thin band above mouth (ria mép mỏng) ═════════════════════
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const x = -0.13 + t * 0.26;
    const y = -0.155 + Math.sin(t * Math.PI) * 0.010;
    push([{ x, y, tint: 1, sz: 0.024 }]);
  }

  // ══ MOUTH — subtle gentle smile line ═════════════════════════════════════
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = -0.10 + t * 0.20;
    const y = -0.205 + Math.sin(t * Math.PI) * 0.008;
    push([{ x, y, tint: 0, sz: 0.022 }]);
  }

  // ══ CHÒM RÂU — LONG TAPERING CHIN BEARD (signature feature) ══════════════
  // Two parallel strands gently converging downward, with cross-hatch fill
  const beardStart = -0.215;  // just below chin
  const beardEnd   = -0.58;   // far below, prominent
  const N_BEARD = 36;
  for (let i = 0; i < N_BEARD; i++) {
    const t = i / (N_BEARD - 1);
    const taper = 1 - t * t * 0.85;            // strong tapering toward tip
    const halfW = 0.075 * taper;
    const y = beardStart - t * (beardStart - beardEnd) * -1; // beardStart→beardEnd (negatives)
    // Edges
    push([
      { x: -halfW, y, tint: t > 0.6 ? 2 : 1, sz: 0.028 - t * 0.010 },
      { x:  halfW, y, tint: t > 0.6 ? 2 : 1, sz: 0.028 - t * 0.010 },
    ]);
    // Centerline interior — denser at top, sparser at tip
    if (t < 0.85 && i % 2 === 0) {
      push([{ x: (srnd(i * 31) - 0.5) * halfW * 1.4, y, tint: 1, sz: 0.022 }]);
    }
  }
  // Beard tip — a small bright cluster at the very bottom
  push([
    { x: 0,     y: beardEnd - 0.02, tint: 2, sz: 0.032 },
    { x: -0.01, y: beardEnd - 0.01, tint: 2, sz: 0.026 },
    { x:  0.01, y: beardEnd - 0.01, tint: 2, sz: 0.026 },
  ]);

  // ══ NECK — slim, partly hidden by beard ══════════════════════════════════
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const y = -0.22 - t * 0.30;
    push([
      { x: -0.12 - t * 0.02, y, tint: 0, sz: 0.024 },
      { x:  0.12 + t * 0.02, y, tint: 0, sz: 0.024 },
    ]);
  }

  // ══ ĐẠI CÁN COLLAR — stand-collar Vietnamese leader uniform ══════════════
  // V-line collar opening at neck base
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const side = t < 0.5 ? -1 : 1;
    const tt = t < 0.5 ? t * 2 : (1 - t) * 2;
    const x = side * (0.04 + tt * 0.28);
    const y = -0.55 - tt * 0.10;
    push([{ x, y, tint: 1, sz: 0.030 }]);
  }
  // Stand-collar top edge (horizontal line just under chin/beard area)
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const x = -0.34 + t * 0.68;
    const y = -0.54 + Math.abs(x) * 0.04;
    push([{ x, y, tint: 1, sz: 0.030 }]);
  }

  // ══ SHOULDERS — wide gentle slope (vai áo) ═══════════════════════════════
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    // Left shoulder slope
    const xL = -0.34 - t * 0.55;
    const yL = -0.58 - t * 0.18 + Math.sin(t * Math.PI) * 0.04;
    push([{ x: xL, y: yL, tint: 0, sz: 0.034 }]);
    // Right shoulder slope
    const xR =  0.34 + t * 0.55;
    const yR = -0.58 - t * 0.18 + Math.sin(t * Math.PI) * 0.04;
    push([{ x: xR, y: yR, tint: 0, sz: 0.034 }]);
  }
  // Chest interior fill below collar
  for (let i = 0; i < 38; i++) {
    const x = (srnd(i * 11 + 1) - 0.5) * 1.60;
    const y = -0.78 - srnd(i * 17 + 3) * 0.14;
    push([{ x, y, tint: 0, sz: 0.028 }]);
  }

  return dots;
}

/* ── Photo loader: image → ImageData → drone-show dots ──────────────────── */
const PORTRAIT_IMG_URL = encodeURI("/ảnh bác hồ.jpg");

function useHoChiMinhDots(): PortraitDot[] {
  const [dots, setDots] = useState<PortraitDot[]>(() => buildHoChiMinhDots());

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      // Resize to a high-resolution grid for photographic fidelity.
      // ~60k cells → ~245×245 square or ~225×270 for 4:5 portrait. After
      // foreground masking + maxDots cap (8500) we keep facial detail crisp.
      const TARGET_CELLS = 60000;
      const ratio = img.height / img.width; // H/W
      const W = Math.round(Math.sqrt(TARGET_CELLS / ratio));
      const H = Math.round(W * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, W, H);
      try {
        const imageData = ctx.getImageData(0, 0, W, H);
        const built = buildHoChiMinhDotsFromImage(imageData, 8500);
        if (!cancelled && built.length > 0) setDots(built);
      } catch (err) {
        console.warn("[HoChiMinhPortrait] image sampling failed", err);
      }
    };
    img.onerror = (e) => {
      console.warn("[HoChiMinhPortrait] failed to load portrait image", e);
    };
    img.src = PORTRAIT_IMG_URL;
    return () => { cancelled = true; };
  }, []);

  return dots;
}

/* ── Hồ Chí Minh portrait renderer — drone-show LED dots with hover wobble ─ */
function HoChiMinhPortrait({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dots = useHoChiMinhDots();
  // Sharper LED texture — tighter glow falloff so dense grid keeps detail
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.20, "rgba(255,245,210,1)"],
    [0.45, "rgba(255,210,140,0.55)"],
    [0.75, "rgba(220,160,70,0.15)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      // 4-band LED palette — preserves photographic tonal range
      if (d.tint === 0) c.set("#FFFFFF");        // highlights — pure white
      else if (d.tint === 1) c.set("#FFE8B8");   // upper midtone — warm white
      else if (d.tint === 2) c.set("#FFB860");   // mid — warm gold (skin/jacket)
      else c.set("#D08040");                       // shadow — deep amber
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dots]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;

    const g = groupRef.current;
    if (g) {
      // Initial reveal: scale up + rise into place (like drones taking formation)
      const life = Math.min(t / 1.8, 1), e = 1 - Math.pow(1 - life, 3);
      g.scale.setScalar(0.6 + e * 0.46);
      g.position.y = 0.05 + (1 - e) * -0.55;
      if (!reduced) {
        // Gentle drone-formation float — subtle breathing motion
        g.position.y += Math.sin(t * 0.42) * 0.035;
        g.rotation.y = Math.sin(t * 0.15) * 0.04;
      }
    }

    for (let i = 0; i < dots.length; i++) {
      const p = dots[i];
      const localT = Math.max(0, t - p.delay);
      const appear = Math.min(localT / 1.4, 1), ae = 1 - Math.pow(1 - appear, 3);

      // Drone hover wobble — each LED jitters independently within ~1cm
      let px = p.bx, py = p.by, pz = p.bz;
      if (!reduced) {
        px += Math.sin(t * 1.7 + p.phase) * p.hover;
        py += Math.cos(t * 1.4 + p.phase * 1.3) * p.hover;
        pz += Math.sin(t * 1.1 + p.phase * 0.7) * p.hover * 0.6;
      }

      const twinkle = 0.55 + 0.45 * Math.sin(t * p.twinkleFreq + p.phase);
      dummy.position.set(px, py, pz);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * ae * (0.55 + twinkle * 0.65));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        key={dots.length}
        ref={ref}
        args={[undefined, undefined, dots.length]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </group>
  );
}

/* ── Đông Sơn drum rings — concentric bronze circles behind the bird ─────── */
function DongSonDrumRings({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Mesh[]>([]);
  const N = 6;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current && !reduced) groupRef.current.rotation.z = t * 0.012;
    for (let i = 0; i < N; i++) {
      const m = rings.current[i]; if (!m) continue;
      const pulse = 1 + Math.sin(t * 0.55 + i * 0.4) * 0.015;
      m.scale.setScalar(pulse);
      (m.material as THREE.MeshBasicMaterial).opacity = (0.08 + 0.04 * Math.sin(t * 0.7 + i * 0.6));
    }
  });
  return (
    <group ref={groupRef} position={[0, 0, -1.2]}>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) rings.current[i] = el as THREE.Mesh; }}>
          <ringGeometry args={[0.5 + i * 0.28, 0.5 + i * 0.28 + 0.015, 120]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#C68B1A" : "#8B5524"}
            transparent opacity={0.10}
            side={THREE.DoubleSide} toneMapped={false}
            depthWrite={false} blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Sacred halo with rotating god-rays ──────────────────────────────────── */
function SacredHalo({ reduced }: { reduced: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null), raysRef = useRef<THREE.Group>(null);
  const haloTex = useRadialTexture([
    [0, "rgba(255,230,140,0.88)"], [0.4, "rgba(198,139,26,0.48)"],
    [0.75, "rgba(150,60,10,0.20)"], [1, "rgba(0,0,0,0)"],
  ]);
  const rayTex = useStreakTexture("rgba(255,220,140,0.85)");
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.lookAt(state.camera.position);
      const e = 1 - Math.pow(1 - Math.min(t / 1.2, 1), 3);
      meshRef.current.scale.setScalar(5.0 * e * (1 + Math.sin(t * 0.65) * 0.04));
    }
    if (raysRef.current && !reduced) raysRef.current.rotation.z = t * 0.048;
  });
  return (
    <>
      <mesh ref={meshRef} position={[0, 0, -1.8]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={haloTex} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={raysRef} position={[0, 0, -2]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 10]}>
            <planeGeometry args={[0.16, 6.5]} />
            <meshBasicMaterial map={rayTex} color={i%2===0?"#C68B1A":"#FF6040"} transparent opacity={0.14}
              blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/* ── Expanding wave rings — each wing flap releases a golden ring ─────────── */
function FlagColorWaves({ reduced, ringsCount=5 }: { reduced: boolean; ringsCount?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.32, "rgba(255,210,80,0.95)"],
    [0.68, "rgba(200,60,20,0.55)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const ptsPerRing = 100, total = ringsCount * ptsPerRing;
  const layout = useMemo(() => Array.from({ length: total }, (_, ii) => {
    const r = Math.floor(ii / ptsPerRing);
    const i = ii % ptsPerRing;
    return { ring: r, angle: (i / ptsPerRing) * Math.PI * 2, szBase: 0.048 + srnd(r*31+i*11)*0.042, vSkew: 0.68 + srnd(r*13+i*5)*0.22, cm: srnd(r*41+i*7) };
  }), [total]);
  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < layout.length; i++) {
      const p = layout[i];
      if (p.cm < 0.45) c.set("#FFD86A"); else if (p.cm < 0.82) c.set("#FF5020"); else c.set("#C68B1A");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [layout]);
  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime, period = 2.6;
    for (let i = 0; i < layout.length; i++) {
      const p = layout[i], rp = ((t / period + p.ring / ringsCount) % 1);
      const maxR = reduced ? 2.0 : 3.8, rad = rp * maxR;
      const fade = rp < 0.08 ? rp / 0.08 : Math.max(0, 1 - (rp - 0.08) / 0.92);
      const tw = 0.6 + 0.4 * Math.sin(t * 3.8 + i);
      dummy.position.set(Math.cos(p.angle) * rad, Math.sin(p.angle) * rad * p.vSkew + 0.05, -0.3 + Math.sin(p.angle * 2 + t) * 0.15);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.szBase * fade * tw);
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, total]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ── Ambient drone-sparkles — extra LED motes drifting around the portrait ─ */
function AmbientSparkles({ reduced, count=160 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([[0,"rgba(255,255,255,1)"],[0.38,"rgba(255,225,140,0.92)"],[0.75,"rgba(220,170,80,0.45)"],[1,"rgba(0,0,0,0)"]]);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    // Random scatter around the portrait — wider than its silhouette
    baseX: (srnd(i*7+1) - 0.5) * 3.4,
    baseY: (srnd(i*11+3) - 0.5) * 2.6,
    baseZ: -0.3 + (srnd(i*17+7) - 0.5) * 0.8,
    period: 3.2 + srnd(i*13+5)*2.2,
    size: 0.026 + srnd(i*19+9)*0.040, phase: srnd(i*23+11)*Math.PI*2,
    wobble: 0.05 + srnd(i*29+13)*0.10, wobbleFreq: 0.5 + srnd(i*31+17)*1.6,
    drift: 0.04 + srnd(i*41+19)*0.06, cm: srnd(i*37+19),
  })), [count]);
  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      if (s.cm < 0.50) c.set("#FFE8B0"); else if (s.cm < 0.88) c.set("#FFD080"); else c.set("#FFFFFF");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [seeds]);
  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const phaseT = ((t + s.phase) / s.period) % 1;
      // Slow upward drift + side wobble — like loose LEDs floating
      const driftY = reduced ? 0 : Math.sin(t * 0.3 + s.phase) * s.drift;
      const wx = reduced ? 0 : Math.sin(t * s.wobbleFreq + s.phase) * s.wobble;
      const wy = reduced ? 0 : Math.cos(t * s.wobbleFreq * 0.7 + s.phase) * s.wobble;
      dummy.position.set(s.baseX + wx, s.baseY + driftY + wy, s.baseZ);
      dummy.quaternion.copy(state.camera.quaternion);
      const fade = 0.4 + 0.6 * Math.abs(Math.sin(phaseT * Math.PI));
      dummy.scale.setScalar(s.size * fade * (0.6 + 0.4 * Math.sin(t * 4 + i)));
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

function VolumetricFog() {
  const mRef = useRef<THREE.Mesh>(null);
  const tex = useRadialTexture([[0,"rgba(50,5,5,0.52)"],[0.5,"rgba(110,28,14,0.28)"],[1,"rgba(0,0,0,0)"]]);
  useFrame((s) => { const m=mRef.current; if(!m)return; m.lookAt(s.camera.position); m.scale.setScalar(8.5+Math.sin(s.clock.elapsedTime*0.3)*0.5); });
  return (<mesh ref={mRef} position={[0,0,-3]}><planeGeometry args={[1,1]}/><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false}/></mesh>);
}

function PulseLights({ reduced }: { reduced: boolean }) {
  const gRef = useRef<THREE.PointLight>(null), rRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime, emit = reduced ? 0.5 : flapVelocity(t);
    if (gRef.current) gRef.current.intensity = 20 + emit * 28;
    if (rRef.current) rRef.current.intensity = 14 + emit * 22;
  });
  return (<><pointLight ref={gRef} position={[2.0,1.6,3]} color="#C68B1A" distance={9} decay={1.5}/><pointLight ref={rRef} position={[-2.0,-1,2.5]} color="#FF3838" distance={9} decay={1.5}/><pointLight position={[0,0,4]} intensity={9} color="#FFFFFF" distance={6} decay={2}/></>);
}

function CinematicCam({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (reduced) { state.camera.position.set(0,0,4.2); state.camera.lookAt(0,0,0); return; }
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t*0.15)*0.18;
    state.camera.position.y = Math.cos(t*0.18)*0.14 + t*0.004; // subtle upward camera drift
    state.camera.position.z = 4.2 - Math.sin(t*0.22)*0.18;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#020003"]}/>
      <fog attach="fog" args={["#0a0205",4,11]}/>
      <ambientLight intensity={0.42} color="#ffe0c8"/>
      <PulseLights reduced={reduced}/>
      <CinematicCam reduced={reduced}/>
      <VolumetricFog/>
      <DongSonDrumRings reduced={reduced}/>
      <SacredHalo reduced={reduced}/>
      <FlagColorWaves reduced={reduced} ringsCount={5}/>
      <AmbientSparkles reduced={reduced} count={reduced?70:160}/>
      <HoChiMinhPortrait reduced={reduced}/>
    </>
  );
}

export function VietnamMuonNamEffect({ emotion: _emotion }: Props) {
  const reduced = useReducedMotion();
  void _emotion; // overridden by hard-coded caption below
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div aria-hidden className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(140,85,20,0.28) 0%, rgba(12,5,2,0.88) 55%, #000 100%)" }} />

      <Canvas dpr={[1, 1.85]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.2], fov: 50 }} style={{ background: "transparent" }}>
        <Scene reduced={reduced} />
      </Canvas>

      <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,210,120,0.12) 0%, transparent 60%)" }} />

      <div aria-hidden className="absolute inset-x-0 top-0 h-[6%] bg-black/85" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[6%] bg-black/85" />

      <motion.div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }} transition={{ delay: 1.4, duration: 0.9 }}>
        <p className="font-cinzel text-sm font-bold uppercase tracking-[0.36em] sm:text-base"
          style={{ color: "#fff2c2", textShadow: "0 0 24px rgba(255,215,0,0.95), 0 2px 18px rgba(200,16,46,0.7), 0 0 60px rgba(255,170,0,0.55)" }}>
          Lãnh Tụ Vĩ Đại
        </p>
      </motion.div>
    </div>
  );
}
