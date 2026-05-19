"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  useRadialTexture,
  useStreakTexture,
} from "@/components/gestures/effects/cinematicTextures";

interface Props { emotion: string; particlesReady?: boolean; }

/* ══════════════════════════════════════════════════════════════════════════════
 * CHIM LẠC ĐÔNG SƠN — Sacred Lạc Bird, National Totem of Việt Nam
 *
 * Faithfully reconstructed from iconographic analysis of Đông Sơn bronze drums
 * (trống đồng Ngọc Lũ, ~2500 years old):
 *
 *  • Species basis: Crane/Heron (Sếu/Cò) — elegant wading birds of the paddy
 *  • Long straight pointed beak (mỏ dài thẳng, nhọn) — aerodynamic silhouette
 *  • Prominent upright head crest (mào đứng) — 5-feather tuft
 *  • Elegant S-curved neck (cổ cong hình chữ S) — crane characteristic
 *  • Three-layer wing structure: inner arm → secondary feathers → 7 primaries
 *  • Total wingspan: ~2.8× body width — dramatic spread
 *  • 10 long flowing tail feathers (lông đuôi dài) — often longer than body
 *  • Two trailing legs (chân dài thon) — extended in flight posture
 *  • Eye: single bright amber-gold dot
 *  • Color palette from bronze drum surface: warm ivory, Đông Sơn gold (#C68B1A),
 *    copper bronze (#8B5524), amber wing-tips, red accent at tail extremities
 *  • Ascending/soaring posture — symbolizes spiritual elevation & aspiration
 * ══════════════════════════════════════════════════════════════════════════════ */

function srnd(s: number): number {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function flapAngle(t: number): number { return Math.sin(t * 1.35) * 0.52; }
function flapVelocity(t: number): number { return Math.abs(Math.cos(t * 1.35)); }

type BirdDot = {
  bx: number; by: number; bz: number;
  flapFactor: number; anchorY: number;
  size: number; twinkleFreq: number; phase: number; delay: number;
  tint: 0 | 1 | 2 | 3;   // 0=ivory, 1=bronze-gold, 2=amber, 3=deep-copper
  tailIdx?: number;        // which tail feather (for independent flutter)
};

/* ─────────────────────────────────────────────────────────────────────────────
 * buildLacBirdDots — full Đông Sơn chim Lạc anatomy
 *
 * Bird is oriented facing camera, beak pointing UP, wings spread L/R:
 *   y+  = up (beak)      y-  = down (tail/legs)
 *   x+  = right wing     x-  = left wing
 *   z   = depth
 * ────────────────────────────────────────────────────────────────────────── */
function buildLacBirdDots(): BirdDot[] {
  const dots: BirdDot[] = [];
  let idx = 0;

  const push = (
    pts: Array<{ x:number; y:number; z?:number; flap?:number; anchorY?:number; tint?:0|1|2|3; sz?:number; tailIdx?:number }>,
    defTint: 0|1|2|3 = 0,
  ) => {
    for (const p of pts) {
      const j = (d: number) => (srnd(idx * 7.3 + d) - 0.5) * 0.010;
      dots.push({
        bx: p.x + j(1), by: p.y + j(2),
        bz: (p.z ?? 0) + (srnd(idx * 5.1) - 0.5) * 0.10,
        flapFactor: p.flap ?? 0, anchorY: p.anchorY ?? 0,
        size: (p.sz ?? 0.048) + srnd(idx * 11.3) * 0.022,
        twinkleFreq: 1.4 + srnd(idx * 13.7) * 3.0,
        phase: srnd(idx * 17.3) * Math.PI * 2,
        delay: srnd(idx * 19.7) * 0.45,
        tint: p.tint ?? defTint,
        tailIdx: p.tailIdx,
      });
      idx++;
    }
  };

  // ══ HEAD — compact round head (đầu tròn nhỏ) ══════════════════════════════
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    push([{ x: Math.cos(a) * 0.11, y: Math.sin(a) * 0.11 + 0.50, tint: 0 }]);
  }
  // Head interior fill
  for (let i = 0; i < 10; i++) {
    push([{ x: (srnd(i*13+1)-0.5)*0.16, y: (srnd(i*17+3)-0.5)*0.16+0.50, tint: 0, sz: 0.036 }]);
  }

  // ══ AMBER EYE — single bright dot (mắt) ══════════════════════════════════
  push([{ x: 0.04, y: 0.52, tint: 2, sz: 0.068 }]);

  // ══ MÀO ĐẦU — 5-feather upright crest ════════════════════════════════════
  const crestFeathers = [
    { x: -0.08, y: 0.72, sz: 0.040 },
    { x: -0.04, y: 0.77, sz: 0.044 },
    { x:  0.00, y: 0.80, sz: 0.048 }, // tallest center feather
    { x:  0.04, y: 0.76, sz: 0.044 },
    { x:  0.08, y: 0.71, sz: 0.040 },
  ];
  for (const cf of crestFeathers) {
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      push([{ x: cf.x * (1-t*0.3), y: 0.61 + t * (cf.y-0.61), tint: 1, sz: cf.sz*(1-t*0.4) }]);
    }
  }

  // ══ MỎ DÀI — long straight beak pointing up (mỏ dài thẳng) ══════════════
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    push([{ x: 0.06*t, y: 0.61 + t * 0.26, tint: i > 9 ? 1 : 0, sz: 0.044 - t * 0.022 }]);
  }

  // ══ CỔ S-CURVE — elegant crane S-neck (cổ cong hình chữ S) ══════════════
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    // S-curve: bulges right then left as it descends from head to body
    const nx = Math.sin(t * Math.PI) * 0.09 - Math.sin(t * Math.PI * 2) * 0.03;
    const ny = 0.50 - t * 0.46; // from y=0.50 down to y=0.04
    const nw = 0.032 + t * 0.016; // neck widens toward body
    push([{ x: nx, y: ny, tint: 0, sz: nw }]);
    // Second strand for neck width
    if (t > 0.2 && t < 0.8) push([{ x: nx + 0.022, y: ny, tint: 0, sz: nw*0.7 }]);
  }

  // ══ THÂN — streamlined oval body (thân hình ô-van thon) ══════════════════
  for (let i = 0; i < 52; i++) {
    const a = (i / 52) * Math.PI * 2;
    push([{ x: Math.cos(a) * 0.18, y: Math.sin(a) * 0.27 + 0.00, tint: i%4===0?1:0 }]);
  }
  for (let i = 0; i < 28; i++) {
    const r = srnd(i*17+1), a = srnd(i*23+5) * Math.PI * 2;
    push([{ x: Math.cos(a)*0.14*r, y: Math.sin(a)*0.22*r, tint: 0, sz: 0.036 }]);
  }

  // ══ CÁNH — three-layer wings (cánh 3 lớp) ════════════════════════════════
  for (const side of [-1, 1] as const) {
    const shX = side * 0.18, shY = 0.04;

    // Layer 1: Inner arm bone (cánh tay trong)
    for (let i = 0; i < 18; i++) {
      const t = i / 17, ang = -0.06;
      push([{ x: shX + Math.cos(ang)*0.48*t*side, y: shY + Math.sin(ang)*0.48*t, flap: t*0.45, anchorY: shY, tint: 0, sz: 0.042 }]);
    }

    // Layer 2: Secondary feathers — 7 feathers fanning from mid-wing
    const midX = shX + side * 0.50, midY = shY + 0.02;
    for (let f = 0; f < 7; f++) {
      const tF = f / 6;
      const fAng = -0.32 + tF * 0.48;
      const fLen = 0.52 + Math.sin(tF * Math.PI) * 0.22;
      for (let i = 1; i < 13; i++) {
        const t = i / 12;
        push([{ x: midX + Math.cos(fAng)*fLen*t*side, y: midY + Math.sin(fAng)*fLen*t, flap: 0.45 + t*0.40, anchorY: shY, tint: t > 0.72 ? 2 : 0, sz: 0.040 }]);
      }
    }

    // Layer 3: Primary feathers — 7 dramatic pointed tips (lông cánh sơ cấp)
    const tipBaseX = shX + side * 1.00, tipBaseY = shY + 0.14;
    for (let f = 0; f < 7; f++) {
      const tF = f / 6;
      const fAng = 0.06 + tF * 0.56;
      const fLen = 0.36 + tF * 0.20;
      for (let i = 1; i < 11; i++) {
        const t = i / 10;
        push([{ x: tipBaseX + Math.cos(fAng)*fLen*t*side, y: tipBaseY + Math.sin(fAng)*fLen*t, flap: 1.0, anchorY: shY, tint: 1, sz: 0.038 + tF*0.008 }]);
      }
    }

    // Wing leading edge highlight (viền cánh trước)
    for (let i = 0; i < 22; i++) {
      const t = i / 21, ang = -0.08 + t * 0.68, len = 0.45 + t * 0.80;
      push([{ x: shX + Math.cos(ang)*len*side, y: shY + Math.sin(ang)*len, flap: t, anchorY: shY, tint: 1, sz: 0.044 + t*0.036 }]);
    }

    // Wing trailing edge (viền sau — darker, gives depth)
    for (let i = 0; i < 14; i++) {
      const t = i / 13, ang = 0.00 + t * 0.55, len = 0.42 + t * 0.70;
      push([{ x: shX + Math.cos(ang)*len*side, y: shY + Math.sin(ang)*len - 0.12, flap: t*0.85, anchorY: shY, tint: 3, sz: 0.036 }]);
    }
  }

  // ══ LÔNG ĐUÔI — 10 long flowing tail feathers (đặc trưng nổi bật nhất) ══
  const tailBase = { x: 0, y: -0.28 };
  const N_TAIL = 10;
  for (let f = 0; f < N_TAIL; f++) {
    const tF = f / (N_TAIL - 1); // 0=left, 1=right
    const spread = tF - 0.5; // -0.5 to +0.5
    const ang = -Math.PI / 2 + spread * 0.72; // -36° to +36° from downward
    const centerT = 1 - Math.abs(spread) * 2; // 1 at center
    const length = 0.70 + centerT * 0.45; // 0.70–1.15 units — longer than body!
    const N_S = 22;
    for (let i = 1; i < N_S; i++) {
      const t = i / (N_S - 1);
      // Slight natural curve at feather tip
      const curve = t * t * 0.10 * spread;
      const fx = tailBase.x + Math.cos(ang + curve) * length * t;
      const fy = tailBase.y + Math.sin(ang + curve) * length * t;
      push([{
        x: fx, y: fy,
        tint: f===0 || f===N_TAIL-1 ? 2 : (t > 0.68 ? 1 : 0),
        sz: 0.036 + t * 0.018,
        tailIdx: f,  // store feather index for independent flutter
      }]);
    }
  }

  // ══ CHÂN DÀI — two trailing legs (chân dài thon, trailing in flight) ══════
  for (const side of [-1, 1] as const) {
    const legBase = { x: side * 0.07, y: -0.26 };
    const legAng = -Math.PI / 2 - side * 0.16; // slight outward trail
    const N_L = 16;
    for (let i = 0; i < N_L; i++) {
      const t = i / (N_L - 1);
      push([{
        x: legBase.x + Math.cos(legAng) * 0.42 * t,
        y: legBase.y + Math.sin(legAng) * 0.42 * t,
        tint: i > 13 ? 1 : 0,  // feet slightly gold
        sz: 0.030 + t * 0.010,
      }]);
    }
    // Foot / toenails (ngón chân)
    for (let toe = 0; toe < 3; toe++) {
      const toeAng = legAng + (toe - 1) * 0.4;
      push([{ x: legBase.x + Math.cos(legAng)*0.42 + Math.cos(toeAng)*0.06, y: legBase.y + Math.sin(legAng)*0.42 + Math.sin(toeAng)*0.06, tint: 1, sz: 0.028 }]);
    }
  }

  return dots;
}

/* ── Lạc Bird renderer with wing flap + tail flutter ─────────────────────── */
function LacBird({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dots = useMemo(() => buildLacBirdDots(), []);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.28, "rgba(255,230,155,0.95)"],
    [0.65, "rgba(200,130,50,0.55)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      // Bronze drum color palette from research:
      if (d.tint === 0) c.set("#FFF2D0");       // warm ivory — body surface
      else if (d.tint === 1) c.set("#C68B1A");   // Đông Sơn gold — Lý dynasty gilt
      else if (d.tint === 2) c.set("#FF9632");   // amber-orange — tail/primary tips
      else c.set("#8B5524");                      // deep copper-bronze — depth
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dots]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const angle = reduced ? 0 : flapAngle(t);
    const sinA = Math.sin(angle), cosA = Math.cos(angle);

    const g = groupRef.current;
    if (g) {
      const life = Math.min(t / 1.5, 1), e = 1 - Math.pow(1 - life, 3);
      g.scale.setScalar(0.52 + e * 0.48);
      g.position.y = -0.22 + (1 - e) * -0.65;
      if (!reduced) {
        // Slow ascending flight (chim Lạc bay lên cao — spiritual ascension)
        g.position.y += Math.sin(t * 0.65) * 0.06 + t * 0.008;
        g.rotation.y = Math.sin(t * 0.22) * 0.07;
        g.rotation.z = Math.sin(t * 0.18) * 0.025; // gentle banking
      }
    }

    for (let i = 0; i < dots.length; i++) {
      const p = dots[i];
      const localT = Math.max(0, t - p.delay);
      const appear = Math.min(localT / 1.1, 1), ae = 1 - Math.pow(1 - appear, 3);

      // Wing flap: rotate around shoulder anchor (anchorY)
      let px = p.bx, py = p.by, pz = p.bz;
      if (p.flapFactor > 0) {
        const dy = p.by - p.anchorY;
        py = p.anchorY + dy * (1 - p.flapFactor) + dy * cosA * p.flapFactor;
        pz = p.bz + dy * sinA * p.flapFactor;
      }

      // Independent tail feather flutter (lông đuôi rung rinh độc lập)
      if (p.tailIdx !== undefined && !reduced) {
        const flutter = Math.sin(t * 2.2 + p.tailIdx * 0.6 + p.phase) * 0.025 * Math.abs(p.by - (-0.28));
        px += flutter;
        pz += flutter * 0.5;
      }

      const twinkle = 0.48 + 0.52 * Math.sin(t * p.twinkleFreq + p.phase);
      dummy.position.set(px, py, pz);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * ae * (0.48 + twinkle * 0.72));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={ref} args={[undefined, undefined, dots.length]}>
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

/* ── Wingtip ember trail ─────────────────────────────────────────────────── */
function WingEmbers({ reduced, count=160 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([[0,"rgba(255,255,255,1)"],[0.38,"rgba(255,205,80,0.95)"],[0.75,"rgba(198,139,26,0.52)"],[1,"rgba(0,0,0,0)"]]);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    side: (i % 2 === 0 ? -1 : 1) as -1 | 1,
    baseDx: 1.08 + srnd(i*7+1)*0.42, baseDy: srnd(i*11+3)*0.32,
    life: 1.5 + srnd(i*13+5)*1.5, period: 2.6 + srnd(i*17+7)*1.4,
    size: 0.042 + srnd(i*19+9)*0.055, phase: srnd(i*23+11)*Math.PI*2,
    wobble: 0.04 + srnd(i*29+13)*0.08, wobbleFreq: 0.7 + srnd(i*31+17)*2.2, cm: srnd(i*37+19),
  })), [count]);
  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      if (s.cm < 0.50) c.set("#FFD86A"); else if (s.cm < 0.88) c.set("#C68B1A"); else c.set("#FFFFFF");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [seeds]);
  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const ang = reduced ? 0 : flapAngle(t), sinA = Math.sin(ang), cosA = Math.cos(ang);
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i], cp = ((t + s.phase) / s.period) % 1;
      const tipX = s.side * s.baseDx, dy = s.baseDy;
      const wingY = 0.04 + dy * cosA, wingZ = dy * sinA;
      const lt = cp * s.life, drift = lt * 1.1, dY = -0.45 * lt * lt;
      dummy.position.set(tipX + s.side * drift + Math.sin(t * s.wobbleFreq + s.phase) * s.wobble, wingY + dY, wingZ - lt * 0.25);
      dummy.quaternion.copy(state.camera.quaternion);
      const fade = cp < 0.08 ? cp / 0.08 : Math.max(0, 1 - (cp - 0.08) / 0.92);
      dummy.scale.setScalar(s.size * fade * (0.6 + 0.4 * Math.sin(t * 5 + i)));
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
      <WingEmbers reduced={reduced} count={reduced?70:160}/>
      <LacBird reduced={reduced}/>
    </>
  );
}

export function VietnamMuonNamEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
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
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}
