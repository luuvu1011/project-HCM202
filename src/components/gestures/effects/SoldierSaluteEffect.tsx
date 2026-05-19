"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRadialTexture } from "@/components/gestures/effects/cinematicTextures";

interface Props { emotion: string; particlesReady?: boolean; }

/* ══════════════════════════════════════════════════════════════════════════════
 * VIETNAMESE GOLDEN DRAGON — Drone Show Style
 *
 * Aesthetic: ngàn ánh sáng drone tạo silhouette rồng Việt Nam
 *  • Thân dài thanh thoát hình S, đầu nhỏ vừa phải, đuôi mảnh
 *  • Particle-based với glow 3 lớp (core / inner / halo) → fake bloom
 *  • Gradient màu: vàng kim → cam ấm → đỏ nhẹ
 *  • Cloud particles xanh-trắng bay nhẹ làm khí quyển
 *  • Camera orbit chậm rãi, cinematic
 *  • Background đen tuyền
 * ══════════════════════════════════════════════════════════════════════════════ */

function srnd(s: number): number {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ── Đường bay rồng — orbit ellipse XY bao quanh cờ (rx≈flag half-w, ry≈flag half-h) ── */
function dragonPath(t: number): [number, number, number] {
  const a = t * 0.20;
  return [
    Math.cos(a) * 1.30,        // ngang: cờ ±1, rồng ±1.30 — sát ngoài cạnh cờ
    Math.sin(a) * 0.88,        // dọc: cờ ±0.665, rồng ±0.88 — sát trên/dưới cờ
    Math.sin(a * 1.15) * 0.85, // sâu: rồng luồn ra trước / ra sau cờ
  ];
}

function dragonTangent(t: number): [number, number, number] {
  const dt = 0.008;
  const [x1, y1, z1] = dragonPath(t), [x2, y2, z2] = dragonPath(t + dt);
  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
  const l = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
  return [dx/l, dy/l, dz/l];
}

function dragonFrame(t: number) {
  const pos = dragonPath(t);
  const [tx, ty, tz] = dragonTangent(t);
  let wx = 0, wy = 1, wz = 0;
  if (Math.abs(ty) > 0.9) { wx = 1; wy = 0; wz = 0; }
  let rx = ty*wz - tz*wy, ry = tz*wx - tx*wz, rz = tx*wy - ty*wx;
  const rl = Math.sqrt(rx*rx + ry*ry + rz*rz) || 1;
  rx /= rl; ry /= rl; rz /= rl;
  const ux = ry*tz - rz*ty, uy = rz*tx - rx*tz, uz = rx*ty - ry*tx;
  return {
    pos,
    tang: [tx, ty, tz] as [number, number, number],
    right: [rx, ry, rz] as [number, number, number],
    up: [ux, uy, uz] as [number, number, number],
  };
}

const BODY_MAX_LAG = 10.0; // dài hơn → thân rồng ôm ~1/3 quỹ đạo, bao bọc được cờ

/* ── Texture: drone light particle (bright core + soft glow) ──────────────── */
function useDroneTexture() {
  return useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 128; cv.height = 128;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0.00, "rgba(255,255,255,1)");
    g.addColorStop(0.12, "rgba(255,250,220,0.95)");
    g.addColorStop(0.35, "rgba(255,210,120,0.55)");
    g.addColorStop(0.70, "rgba(255,140,60,0.20)");
    g.addColorStop(1.00, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/* ── Texture: soft halo (cloud, aura) ─────────────────────────────────────── */
function useHaloTexture() {
  return useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 128; cv.height = 128;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0.00, "rgba(255,240,180,0.55)");
    g.addColorStop(0.50, "rgba(255,150,60,0.15)");
    g.addColorStop(1.00, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/* ══════════════════════════════════════════════════════════════════════════════
 * DRAGON BODY — Thân rồng thanh thoát, S-curve, particle drone-light
 * ══════════════════════════════════════════════════════════════════════════════ */

/* ── Core particles — đốm sáng cốt lõi (bright tight points) ──────────────── */
function DragonBodyCore({ reduced, count = 900 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useDroneTexture();

  const particles = useMemo(() => {
    type P = { lag: number; angOff: number; radBase: number; angSpd: number; size: number; ph: number; tf: number; cp: number; };
    const arr: P[] = [];
    for (let i = 0; i < count; i++) {
      const r1 = srnd(i*2.1+3), r2 = srnd(i*5.3+7), r3 = srnd(i*7.9+11);
      const r4 = srnd(i*11.2+13), r5 = srnd(i*13.5+19), r6 = srnd(i*17.6+23);
      const lag = r1 * BODY_MAX_LAG;
      // Radius profile: head nhỏ, body thon dài, tail thuôn mảnh
      let rad: number;
      if (lag < 0.4) rad = 0.075 + r2 * 0.040;
      else if (lag < BODY_MAX_LAG - 1.5) rad = 0.090 + r2 * 0.045;
      else rad = (1 - (lag - (BODY_MAX_LAG - 1.5)) / 1.5) * 0.080 + r2 * 0.020;
      arr.push({
        lag,
        angOff: r3 * Math.PI * 2,
        radBase: Math.max(0.010, rad),
        angSpd: (r4 - 0.5) * 1.2,
        size: 0.026 + r5 * 0.038,
        ph: r6 * Math.PI * 2,
        tf: 1.4 + r5 * 4.4,
        cp: r1,
      });
    }
    return arr;
  }, [count]);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < particles.length; i++) {
      const cp = particles[i].cp;
      // Gradient: ivory → bright gold → warm orange → red-orange → dark red tail
      if (cp < 0.05)      c.set("#FFFAE0");  // ivory — head tip
      else if (cp < 0.18) c.set("#FFE08C");  // light gold
      else if (cp < 0.42) c.set("#FFC548");  // bright gold
      else if (cp < 0.65) c.set("#FF8C28");  // warm orange
      else if (cp < 0.85) c.set("#E04018");  // red-orange
      else                c.set("#8C1818");  // deep red — tail tip
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const appear = Math.min(t / 1.0, 1), ae = 1 - Math.pow(1 - appear, 3);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i], st = t - p.lag;
      const [sx, sy, sz] = dragonPath(st);
      const [ttx, tty, ttz] = dragonTangent(st);
      let upx = 0, upy = 1, upz = 0;
      if (Math.abs(tty) > 0.95) { upx = 1; upy = 0; upz = 0; }
      const p1x = tty*upz - ttz*upy, p1y = ttz*upx - ttx*upz, p1z = ttx*upy - tty*upx;
      const p1l = Math.sqrt(p1x*p1x + p1y*p1y + p1z*p1z) || 1;
      const e1x = p1x/p1l, e1y = p1y/p1l, e1z = p1z/p1l;
      const p2x = tty*e1z - ttz*e1y, p2y = ttz*e1x - ttx*e1z, p2z = ttx*e1y - tty*e1x;
      const ang = p.angOff + t * p.angSpd * (reduced ? 0.3 : 1);
      const rad = p.radBase * (1 + Math.sin(t * 1.6 + p.ph) * 0.12);
      const dx = (e1x*Math.cos(ang) + p2x*Math.sin(ang)) * rad;
      const dy = (e1y*Math.cos(ang) + p2y*Math.sin(ang)) * rad;
      const dz = (e1z*Math.cos(ang) + p2z*Math.sin(ang)) * rad;
      // Subtle twinkle
      const tw = 0.60 + 0.40 * Math.sin(t * p.tf + p.ph);
      dummy.position.set(sx + dx, sy + dy, sz + dz);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * ae * (0.55 + tw * 0.65));
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

/* ── Inner glow — vầng sáng quanh body core (fake bloom layer 2) ──────────── */
function DragonBodyGlow({ reduced, count = 350 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useHaloTexture();

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const r1 = srnd(i*3.7+1), r2 = srnd(i*5.9+5), r3 = srnd(i*7.1+9), r4 = srnd(i*11.3+13);
      arr.push({
        lag: r1 * BODY_MAX_LAG,
        angOff: r2 * Math.PI * 2,
        radBase: 0.06 + r3 * 0.06,
        size: 0.20 + r4 * 0.14,
        ph: r3 * Math.PI * 2,
        cp: r1,
      });
    }
    return arr;
  }, [count]);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < particles.length; i++) {
      const cp = particles[i].cp;
      if (cp < 0.15)      c.set("#FFE890");
      else if (cp < 0.50) c.set("#FFB048");
      else if (cp < 0.80) c.set("#FF7028");
      else                c.set("#A02818");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const ae = Math.min(t / 1.2, 1);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i], st = t - p.lag;
      const [sx, sy, sz] = dragonPath(st);
      const ang = p.angOff + t * 0.3 * (reduced ? 0.3 : 1);
      const [ttx, tty, ttz] = dragonTangent(st);
      let upx = 0, upy = 1, upz = 0;
      if (Math.abs(tty) > 0.95) { upx = 1; upy = 0; upz = 0; }
      const p1x = tty*upz - ttz*upy, p1y = ttz*upx - ttx*upz, p1z = ttx*upy - tty*upx;
      const p1l = Math.sqrt(p1x*p1x + p1y*p1y + p1z*p1z) || 1;
      const e1x = p1x/p1l, e1y = p1y/p1l, e1z = p1z/p1l;
      const p2x = tty*e1z - ttz*e1y, p2y = ttz*e1x - ttx*e1z, p2z = ttx*e1y - tty*e1x;
      const rad = p.radBase;
      const dx = (e1x*Math.cos(ang) + p2x*Math.sin(ang)) * rad;
      const dy = (e1y*Math.cos(ang) + p2y*Math.sin(ang)) * rad;
      const dz = (e1z*Math.cos(ang) + p2z*Math.sin(ang)) * rad;
      const pulse = 0.85 + 0.15 * Math.sin(t * 1.2 + p.ph);
      dummy.position.set(sx + dx, sy + dy, sz + dz);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * ae * pulse);
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
        opacity={0.55}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * DRAGON HEAD — Đầu nhỏ thanh thoát với mõm dài
 * ══════════════════════════════════════════════════════════════════════════════ */
function DragonHead({ reduced, count = 160 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useDroneTexture();

  // Particles parameterized as local offsets (r,u,f) in head frame
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => {
    const r1 = srnd(i*3.1+1), r2 = srnd(i*5.7+5), r3 = srnd(i*7.3+9), r4 = srnd(i*11.7+13), r5 = srnd(i*13.5+17);
    // Distribute along snout shape — denser near cranium, thinner toward tip
    const forwardBias = r1 * r1; // squared bias toward 0 (cranium)
    const forward = forwardBias * 0.45; // mõm dài 0.45
    // Cross-section narrows toward snout tip
    const widthAtForward = 0.085 * (1 - forwardBias * 0.55);
    const ang = r2 * Math.PI * 2;
    return {
      r: Math.cos(ang) * widthAtForward + (r3 - 0.5) * 0.02,
      u: Math.sin(ang) * widthAtForward * 0.82 + (r4 - 0.5) * 0.02 - 0.005,
      f: forward + (r5 - 0.5) * 0.015,
      size: 0.030 + r3 * 0.040,
      ph: r4 * Math.PI * 2,
      tf: 1.4 + r5 * 3.6,
    };
  }), [count]);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const f = seeds[i].f / 0.45;
      // Head: ivory at tip, bright gold near cranium
      if (f > 0.75) c.set("#FFFAE0");
      else if (f > 0.45) c.set("#FFE890");
      else c.set("#FFD040");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [seeds, count]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const { pos, right, up, tang } = dragonFrame(t);
    const ae = Math.min(t / 0.8, 1);
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const wx = pos[0] + right[0]*s.r + up[0]*s.u + tang[0]*s.f;
      const wy = pos[1] + right[1]*s.r + up[1]*s.u + tang[1]*s.f;
      const wz = pos[2] + right[2]*s.r + up[2]*s.u + tang[2]*s.f;
      const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(t * s.tf + s.ph);
      dummy.position.set(wx, wy, wz);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(s.size * ae * tw);
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

/* ── 2 sừng cong nhẹ ra sau ───────────────────────────────────────────────── */
function DragonHorns({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useDroneTexture();
  const PTS = 60, total = PTS * 2;
  // Sừng curve nhẹ ra sau và lên trên
  const CP: [number, number, number][] = [
    [0.04, 0.05, -0.02],   // gốc
    [0.18, 0.20, -0.16],   // giữa cong ra sau
    [0.26, 0.36, -0.32],   // cuối cong tiếp
    [0.18, 0.50, -0.48],   // đầu sừng vuốt nhọn
  ];

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < total; i++) {
      const tp = (i % PTS) / (PTS - 1);
      if (tp < 0.3) c.set("#FFE890");
      else if (tp < 0.7) c.set("#FFC048");
      else c.set("#FFA028");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [total]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const { pos, tang, right, up } = dragonFrame(t);
    const fade = Math.min(Math.max(0, t - 0.9) / 0.7, 1);
    const e = 1 - Math.pow(1 - fade, 3);
    for (let a = 0; a < 2; a++) {
      const side = a === 0 ? -1 : 1;
      for (let i = 0; i < PTS; i++) {
        const idx = a * PTS + i, tp = i / (PTS - 1);
        const om = 1 - tp;
        const B0 = om*om*om, B1 = 3*om*om*tp, B2 = 3*om*tp*tp, B3 = tp*tp*tp;
        const lr = side * (B0*CP[0][0] + B1*CP[1][0] + B2*CP[2][0] + B3*CP[3][0]);
        const lu = B0*CP[0][1] + B1*CP[1][1] + B2*CP[2][1] + B3*CP[3][1];
        const lf = B0*CP[0][2] + B1*CP[1][2] + B2*CP[2][2] + B3*CP[3][2];
        const wx = pos[0] + right[0]*lr + up[0]*lu + tang[0]*lf;
        const wy = pos[1] + right[1]*lr + up[1]*lu + tang[1]*lf;
        const wz = pos[2] + right[2]*lr + up[2]*lu + tang[2]*lf;
        const sz = (0.058 - tp * 0.040) * e * (reduced ? 1 : 0.80 + 0.20 * Math.sin(t * 4 + tp * 6 + a * 2));
        dummy.position.set(wx, wy, wz);
        dummy.quaternion.copy(state.camera.quaternion);
        dummy.scale.setScalar(Math.max(0.005, sz));
        dummy.updateMatrix(); mesh.setMatrixAt(idx, dummy.matrix);
      }
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

/* ── Râu rồng dài bay nhẹ — 2 cặp râu thanh thoát ─────────────────────────── */
function DragonWhiskers({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useDroneTexture();
  const WPTS = 90, N = 4, total = WPTS * N;
  const DEFS = useMemo(() => [
    // 2 râu trên (từ đỉnh mõm)
    { sideR: -0.06, sideU: 0.02,  lag: 1.10, fwd: 0.18 },
    { sideR:  0.06, sideU: 0.02,  lag: 1.10, fwd: 0.18 },
    // 2 râu dưới (từ cằm)
    { sideR: -0.05, sideU: -0.10, lag: 1.00, fwd: 0.16 },
    { sideR:  0.05, sideU: -0.10, lag: 1.00, fwd: 0.16 },
  ], []);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < total; i++) {
      const tp = (i % WPTS) / (WPTS - 1);
      if (tp < 0.3) c.set("#FFE890");
      else if (tp < 0.7) c.set("#FFB848");
      else c.set("#E07828");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [total]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const fade = Math.min(Math.max(0, t - 1.0) / 0.8, 1), e = 1 - Math.pow(1 - fade, 3);
    for (let w = 0; w < N; w++) {
      const def = DEFS[w];
      for (let i = 0; i < WPTS; i++) {
        const idx = w * WPTS + i, tp = i / (WPTS - 1);
        const lagOffset = tp * def.lag;
        const [sx, sy, sz] = dragonPath(t - lagOffset);
        const { right, up, tang } = dragonFrame(t - lagOffset);
        const sway = reduced ? 0 : Math.sin(t * 1.4 + w * 0.8 + tp * 4) * 0.05 * tp;
        const lr = def.sideR * (1 + tp * 0.6) + sway;
        const lu = def.sideU - tp * 0.20;  // râu xuôi xuống dần
        const lf = def.fwd * (1 - tp);     // râu kéo về sau (forward dần giảm)
        const wx = sx + right[0]*lr + up[0]*lu + tang[0]*lf;
        const wy = sy + right[1]*lr + up[1]*lu + tang[1]*lf;
        const wz = sz + right[2]*lr + up[2]*lu + tang[2]*lf;
        const sz2 = (0.040 - tp * 0.030) * e;
        dummy.position.set(wx, wy, wz);
        dummy.quaternion.copy(state.camera.quaternion);
        dummy.scale.setScalar(Math.max(0.005, sz2));
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
      }
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

/* ── Bờm gáy — particles xuôi từ cổ đến vai ───────────────────────────────── */
function DragonMane({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useDroneTexture();
  const N_STRANDS = 7, PTS = 14, total = N_STRANDS * PTS;
  const DEFS = useMemo(() => Array.from({ length: N_STRANDS }, (_, w) => ({
    lag: 0.20 + w * 0.10,
    sideR: (w % 2 === 0 ? -1 : 1) * (0.04 + Math.floor(w / 2) * 0.03),
    sideU: 0.08,
    spread: 0.20 + w * 0.025,
  })), []);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < total; i++) {
      const tp = (i % PTS) / (PTS - 1);
      if (tp < 0.4) c.set("#FFE890"); else c.set("#FFA838");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [total]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const fade = Math.min(Math.max(0, t - 0.9) / 0.7, 1), e = 1 - Math.pow(1 - fade, 3);
    for (let w = 0; w < N_STRANDS; w++) {
      const def = DEFS[w];
      for (let i = 0; i < PTS; i++) {
        const idx = w * PTS + i, tp = i / (PTS - 1);
        const lag = def.lag + tp * 0.40;
        const [sx, sy, sz] = dragonPath(t - lag);
        const { right, up } = dragonFrame(t - lag);
        const sway = reduced ? 0 : Math.sin(t * 1.8 + w * 0.6) * 0.04 * tp;
        const lr = def.sideR + sway;
        const lu = def.sideU + def.spread * tp;
        const wx = sx + right[0]*lr + up[0]*lu;
        const wy = sy + right[1]*lr + up[1]*lu;
        const wz = sz + right[2]*lr + up[2]*lu;
        const sz2 = (0.038 - tp * 0.028) * e;
        dummy.position.set(wx, wy, wz);
        dummy.quaternion.copy(state.camera.quaternion);
        dummy.scale.setScalar(Math.max(0.005, sz2));
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
      }
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

/* ── 4 chi delicate — chỉ dấu ấn nhẹ, không to bè ─────────────────────────── */
const FOOT_LAGS = [1.15, 1.15, 4.10, 4.10]; // 2 cặp: forelegs + hindlegs
const LEG_SIDES = [-1, 1, -1, 1];

function DragonLegs({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useDroneTexture();
  const PTS_PER_LEG = 22;
  const total = FOOT_LAGS.length * PTS_PER_LEG;

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < total; i++) {
      const tp = (i % PTS_PER_LEG) / (PTS_PER_LEG - 1);
      if (tp < 0.25) c.set("#FFB848");
      else if (tp < 0.65) c.set("#FF8028");
      else c.set("#E04018");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [total]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const fade = Math.min(Math.max(0, t - 1.0) / 0.8, 1), e = 1 - Math.pow(1 - fade, 3);
    let inst = 0;
    for (let f = 0; f < FOOT_LAGS.length; f++) {
      const { pos, right, up, tang } = dragonFrame(t - FOOT_LAGS[f]);
      const side = LEG_SIDES[f];
      const swing = reduced ? 0 : Math.sin(t * 1.5 + f * 1.2) * 0.04;
      // Anatomy delicate: shoulder → elbow → wrist
      const SH_R = side * 0.10, SH_U = -0.03, SH_F = 0.02;
      const EL_R = side * 0.18, EL_U = -0.16 + swing, EL_F = -0.02;
      const WR_R = side * 0.20, WR_U = -0.32 + swing * 0.5, WR_F = 0.04;

      for (let i = 0; i < PTS_PER_LEG; i++) {
        const tp = i / (PTS_PER_LEG - 1);
        const om = 1 - tp;
        const lr = om*om*SH_R + 2*om*tp*EL_R + tp*tp*WR_R;
        const lu = om*om*SH_U + 2*om*tp*EL_U + tp*tp*WR_U;
        const lf = om*om*SH_F + 2*om*tp*EL_F + tp*tp*WR_F;
        const wx = pos[0] + right[0]*lr + up[0]*lu + tang[0]*lf;
        const wy = pos[1] + right[1]*lr + up[1]*lu + tang[1]*lf;
        const wz = pos[2] + right[2]*lr + up[2]*lu + tang[2]*lf;
        // Size delicate, slight bulge at joints
        let sz = 0.040;
        if (tp < 0.15 || (tp > 0.40 && tp < 0.55) || tp > 0.85) sz = 0.050;
        dummy.position.set(wx, wy, wz);
        dummy.quaternion.copy(state.camera.quaternion);
        dummy.scale.setScalar(sz * e);
        dummy.updateMatrix();
        mesh.setMatrixAt(inst, dummy.matrix); inst++;
      }
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

/* ── Móng vuốt nhỏ tinh xảo, không to bè ──────────────────────────────────── */
function DragonClaws({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useDroneTexture();
  const N_CLAWS = 3, PTS_PER_CLAW = 4;
  const total = FOOT_LAGS.length * N_CLAWS * PTS_PER_CLAW;

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    const fade = Math.min(Math.max(0, t - 1.2) / 0.8, 1), e = 1 - Math.pow(1 - fade, 3);
    let inst = 0;
    for (let f = 0; f < FOOT_LAGS.length; f++) {
      const { pos, right, up, tang } = dragonFrame(t - FOOT_LAGS[f]);
      const side = LEG_SIDES[f];
      const swing = reduced ? 0 : Math.sin(t * 1.5 + f * 1.2) * 0.04;
      const fR = side * 0.20, fU = -0.32 + swing * 0.5, fF = 0.04;
      for (let c = 0; c < N_CLAWS; c++) {
        const cAng = ((c / (N_CLAWS - 1)) - 0.5) * 0.8;
        const dirF = Math.cos(cAng) * 0.7;
        const dirR = Math.sin(cAng) * side;
        const dirU = -0.5;
        const dlen = Math.sqrt(dirF*dirF + dirR*dirR + dirU*dirU);
        for (let s = 0; s < PTS_PER_CLAW; s++) {
          const tp = s / (PTS_PER_CLAW - 1);
          const dist = tp * 0.10;
          const lr = fR + (dirR/dlen) * dist;
          const lu = fU + (dirU/dlen) * dist - tp*tp*0.025;
          const lf = fF + (dirF/dlen) * dist;
          const wx = pos[0] + right[0]*lr + up[0]*lu + tang[0]*lf;
          const wy = pos[1] + right[1]*lr + up[1]*lu + tang[1]*lf;
          const wz = pos[2] + right[2]*lr + up[2]*lu + tang[2]*lf;
          const sz = (0.038 - tp * 0.022) * e;
          dummy.position.set(wx, wy, wz);
          dummy.quaternion.copy(state.camera.quaternion);
          dummy.scale.setScalar(sz);
          dummy.updateMatrix();
          mesh.setMatrixAt(inst, dummy.matrix); inst++;
        }
      }
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

/* ── Mắt rồng — 2 đốm sáng vàng tinh tế ───────────────────────────────────── */
function DragonEyes() {
  const lRef = useRef<THREE.Mesh>(null), rRef = useRef<THREE.Mesh>(null);
  const tex = useRadialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.20, "rgba(255,250,180,0.95)"],
    [0.50, "rgba(255,120,40,0.65)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { pos, right, up, tang } = dragonFrame(t);
    const eR = 0.048, eU = 0.025, eF = 0.05;
    const fade = Math.min(Math.max(0, t - 0.6) / 0.5, 1), e = 1 - Math.pow(1 - fade, 3);
    const place = (mRef: React.RefObject<THREE.Mesh | null>, side: number) => {
      const wx = pos[0] + right[0]*(side*eR) + up[0]*eU + tang[0]*eF;
      const wy = pos[1] + right[1]*(side*eR) + up[1]*eU + tang[1]*eF;
      const wz = pos[2] + right[2]*(side*eR) + up[2]*eU + tang[2]*eF;
      if (mRef.current) {
        mRef.current.position.set(wx, wy, wz);
        mRef.current.lookAt(state.camera.position);
        mRef.current.scale.setScalar(0.060 * e);
      }
    };
    place(lRef, -1); place(rRef, 1);
  });
  return (
    <>
      <mesh ref={lRef}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh ref={rRef}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * BACKGROUND — Cloud particles xanh-trắng bay nhẹ + ánh sáng phụ
 * ══════════════════════════════════════════════════════════════════════════════ */
function CloudParticles({ reduced, count = 220 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 128; cv.height = 128;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0.00, "rgba(220,235,255,0.85)");
    g.addColorStop(0.40, "rgba(160,200,255,0.40)");
    g.addColorStop(1.00, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => {
    const r1 = srnd(i*3.1+1), r2 = srnd(i*5.7+5), r3 = srnd(i*7.3+9), r4 = srnd(i*11.7+13), r5 = srnd(i*13.5+17);
    return {
      // Spread quanh dragon — không quá xa, không trùng dragon path
      x: (r1 - 0.5) * 9,
      y: (r2 - 0.5) * 5,
      z: -2 - r3 * 3,
      drift: (r4 - 0.5) * 0.08,
      lift: 0.02 + r5 * 0.05,
      size: 0.18 + r5 * 0.30,
      ph: r3 * Math.PI * 2,
      freq: 0.3 + r4 * 0.5,
      tint: r2,
    };
  }), [count]);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const t = seeds[i].tint;
      if (t < 0.40) c.set("#dceaff");      // pale blue
      else if (t < 0.75) c.set("#ffffff");  // pure white
      else c.set("#ffe8c8");                // warm white
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [seeds, count]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const driftX = reduced ? 0 : Math.sin(t * s.freq + s.ph) * 0.6;
      const liftY = ((t * s.lift + s.ph) % 8) - 4; // slow vertical drift loop
      const x = s.x + driftX;
      const y = s.y + liftY * 0.3;
      const z = s.z;
      const pulse = 0.7 + 0.3 * Math.sin(t * 0.8 + s.ph);
      dummy.position.set(x, y, z);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(s.size * pulse);
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
        opacity={0.40}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ── Falling embers — đốm lửa rơi nhẹ phía sau rồng ───────────────────────── */
function DragonEmbers({ reduced, count = 180 }: { reduced: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useDroneTexture();
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    emitLag: srnd(i*7+1) * BODY_MAX_LAG,
    life: 1.1 + srnd(i*11+3) * 1.8,
    period: 3.0 + srnd(i*13+5) * 2.5,
    size: 0.028 + srnd(i*17+7) * 0.060,
    wobble: 0.04 + srnd(i*19+9) * 0.10,
    wobbleFreq: 0.7 + srnd(i*23+11) * 2.8,
    phase: srnd(i*29+13) * Math.PI * 2,
    colorMix: srnd(i*31+17),
  })), [count]);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      if (s.colorMix < 0.42)      c.set("#FFE072");
      else if (s.colorMix < 0.78) c.set("#FF8C2C");
      else                        c.set("#FFFFFF");
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [seeds]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i], cp = ((t / s.period + s.phase) % 1);
      const [emX, emY, emZ] = dragonPath(t - cp * s.life - s.emitLag);
      const drop = cp * 1.4;
      const fade = cp < 0.1 ? cp / 0.1 : Math.max(0, 1 - (cp - 0.1) / 0.9);
      dummy.position.set(
        emX + Math.sin(t * s.wobbleFreq + s.phase) * s.wobble,
        emY - drop,
        emZ
      );
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(s.size * fade * (reduced ? 0.5 : 1));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
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

/* ── Volumetric haze around dragon ────────────────────────────────────────── */
function VolumetricHaze() {
  const mRef = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 256; cv.height = 256;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
    g.addColorStop(0.00, "rgba(60,15,15,0.50)");
    g.addColorStop(0.55, "rgba(120,40,15,0.20)");
    g.addColorStop(1.00, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  useFrame((s) => {
    const m = mRef.current; if (!m) return;
    m.lookAt(s.camera.position);
    m.scale.setScalar(10 + Math.sin(s.clock.elapsedTime * 0.25) * 0.5);
    m.rotation.z = s.clock.elapsedTime * 0.03;
  });
  return (
    <mesh ref={mRef} position={[0, 0, -3.5]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
 * CỜ VIỆT NAM — waving flag canvas texture + pole + glow
 * ══════════════════════════════════════════════════════════════════════════════ */

function useVietnamFlagTexture() {
  return useMemo(() => {
    const W = 600, H = 400;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    // Nền đỏ
    ctx.fillStyle = "#C8102E";
    ctx.fillRect(0, 0, W, H);
    // Ngôi sao vàng 5 cánh
    const cx = W / 2, cy = H / 2, OR = 112, IR = 45;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = (i * Math.PI / 5) - Math.PI / 2;
      const r = i % 2 === 0 ? OR : IR;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
      else          ctx.lineTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
    }
    ctx.closePath();
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

function VietnamFlag({ reduced }: { reduced: boolean }) {
  const tex = useVietnamFlagTexture();
  const geo = useMemo(() => new THREE.PlaneGeometry(2, 1.33, 20, 12), []);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let r = 0; r < 13; r++) {
      for (let c = 0; c < 21; c++) {
        const u = c / 20; // 0 = cạnh cột, 1 = cạnh tự do
        pos.setZ(r * 21 + c, Math.sin(u * Math.PI * 2.2 - t * 2.8) * 0.14 * u * u);
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh geometry={geo} position={[0, 0, 0]}>
      <meshBasicMaterial map={tex} side={THREE.DoubleSide} />
    </mesh>
  );
}

function FlagPole() {
  return (
    <group>
      {/* Thân cột */}
      <mesh position={[-1.1, -1.1, 0]}>
        <cylinderGeometry args={[0.025, 0.030, 3.8, 8]} />
        <meshBasicMaterial color="#B09030" />
      </mesh>
      {/* Chóp vàng */}
      <mesh position={[-1.1, 0.82, 0]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

function FlagGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.14 + 0.06 * Math.sin(s.clock.elapsedTime * 0.9);
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.25]}>
      <planeGeometry args={[3.6, 2.6]} />
      <meshBasicMaterial
        color="#C8102E"
        transparent
        opacity={0.14}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ── Cinematic orbit camera — nhìn vào cờ + rồng bao bọc xung quanh ─────────── */
function CinematicCam({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (reduced) {
      state.camera.position.set(0, 0.1, 6.0);
      state.camera.lookAt(0, 0, 0);
      return;
    }
    const t = state.clock.elapsedTime;
    const orbit = t * 0.06;
    const dist = 6.0 + Math.sin(t * 0.13) * 0.30;
    state.camera.position.x = Math.sin(orbit) * 1.0;
    state.camera.position.y = 0.10 + Math.sin(t * 0.16) * 0.20;
    state.camera.position.z = dist;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ── Pulse lights — point lights theo head & tail ─────────────────────────── */
function PulseLights({ reduced }: { reduced: boolean }) {
  const gRef = useRef<THREE.PointLight>(null);
  const rRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pu = reduced ? 0.5 : 0.5 + Math.sin(t * 1.4) * 0.5;
    const [hx, hy, hz] = dragonPath(t);
    const [tx, ty, tz] = dragonPath(t - 3.5);
    if (gRef.current) { gRef.current.position.set(hx, hy, hz + 1.2); gRef.current.intensity = 30 + pu * 28; }
    if (rRef.current) { rRef.current.position.set(tx, ty, tz + 1.0); rRef.current.intensity = 18 + pu * 20; }
  });
  return (
    <>
      <pointLight ref={gRef} color="#FFD060" distance={10} decay={1.5} />
      <pointLight ref={rRef} color="#FF4020" distance={8} decay={1.6} />
    </>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 10, 22]} />

      <ambientLight intensity={0.2} color="#ffe0c8" />
      <PulseLights reduced={reduced} />
      <CinematicCam reduced={reduced} />

      {/* ── Lá cờ Việt Nam ── */}
      <FlagGlow />
      <FlagPole />
      <VietnamFlag reduced={reduced} />

      {/* ── Background atmosphere ── */}
      <CloudParticles reduced={reduced} count={reduced ? 100 : 220} />
      <VolumetricHaze />

      {/* ── RỒNG — bay quanh lá cờ ── */}
      <DragonBodyGlow reduced={reduced} count={reduced ? 150 : 350} />
      <DragonBodyCore reduced={reduced} count={reduced ? 400 : 900} />
      <DragonMane reduced={reduced} />
      <DragonHorns reduced={reduced} />
      <DragonHead reduced={reduced} count={reduced ? 90 : 160} />
      <DragonWhiskers reduced={reduced} />
      <DragonLegs reduced={reduced} />
      <DragonClaws reduced={reduced} />
      <DragonEyes />
      <DragonEmbers reduced={reduced} count={reduced ? 60 : 180} />
    </>
  );
}

export function SoldierSaluteEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Pure black background với subtle warm glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 75% 65% at 50% 55%, rgba(80,15,10,0.35) 0%, rgba(15,3,3,0.85) 50%, #000 100%)",
        }}
      />
      <Canvas
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.1, 6.0], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Scene reduced={reduced} />
      </Canvas>
      {/* Mix-blend overlay cho tone ấm */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,180,80,0.10) 0%, transparent 65%)" }}
      />
      {/* Letterbox cinematic */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[6%] bg-black/90" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[6%] bg-black/90" />
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
              "0 0 24px rgba(255,215,0,0.95), 0 2px 18px rgba(200,16,46,0.7), 0 0 60px rgba(255,170,0,0.55)",
          }}
        >
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}
