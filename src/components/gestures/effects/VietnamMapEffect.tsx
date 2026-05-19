"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  useRadialTexture,
  useStarSparkleTexture,
  useStreakTexture,
} from "@/components/gestures/effects/cinematicTextures";

interface Props {
  emotion: string;
  particlesReady?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * HOLOGRAPHIC VIETNAM MAP — Dải đất hình chữ S
 *
 * Tọa độ được lấy trực tiếp từ world.geo.json (johan/world.geo.json, VNM.geo.json)
 * — nguồn dữ liệu địa lý thực, định dạng GeoJSON chuẩn WGS-84.
 *
 * Raw GeoJSON [lon, lat] → normalized [x, y] theo công thức:
 *   lon_min=102.170, lon_max=109.335  →  x = (lon − 105.753) / 3.582
 *   lat_min=8.600,   lat_max=23.352  →  y = (lat − 15.976) / 7.376
 *
 * 43 điểm điều khiển = toàn bộ đường biên chính thức của Việt Nam,
 * bao gồm bờ biển Đông, vịnh Thái Lan, biên giới Campuchia/Lào/Trung Quốc.
 * ────────────────────────────────────────────────────────────────────────── */

function srnd(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * VIETNAM_OUTLINE — 43 tọa độ THỰC từ GeoJSON nguồn gốc:
 * Source: https://raw.githubusercontent.com/johan/world.geo.json/master/countries/VNM.geo.json
 *
 * Mỗi điểm [x, y] là kết quả convert từ [longitude, latitude] thực tế.
 * Thứ tự: theo chiều kim đồng hồ từ góc đông bắc (Quảng Ninh).
 * ────────────────────────────────────────────────────────────────────────── */
const VIETNAM_OUTLINE: [number, number][] = [
  // === BỜ BIỂN ĐÔNG — hướng nam từ Quảng Ninh đến Cà Mau ===
  [ 0.641,  0.756], // Quảng Ninh / Móng Cái   [108.050, 21.552]
  [ 0.269,  0.640], // Hải Phòng               [106.715, 20.697]
  [ 0.036,  0.512], // Thanh Hóa               [105.882, 19.752]
  [-0.025,  0.418], // Nghệ An (vịnh Bắc Bộ)   [105.662, 19.058] — bờ lõm vào
  [ 0.188,  0.275], // Hà Tĩnh                 [106.427, 18.004] — quay ra đông
  [ 0.449,  0.098], // Quảng Trị               [107.362, 16.697]
  // === EO BIỂN HẸP NHẤT — Quảng Bình / Quảng Trị (~50 km) ===
  [ 0.703,  0.014], // Đà Nẵng                 [108.269, 16.080]
  [ 0.872, -0.095], // Quảng Ngãi              [108.877, 15.277]
  // === BỤE ĐÔI — bờ Trung Bộ nhô mạnh về phía đông ===
  [ 1.000, -0.346], // Mũi Đại Lãnh / Cape Varella — cực đông [109.335, 13.426]
  [ 0.962, -0.584], // Nha Trang               [109.200, 11.667]
  [ 0.730, -0.673], // Ninh Thuận (Phan Rang)  [108.366, 11.008]
  [ 0.410, -0.761], // TP. Hồ Chí Minh coast   [107.221, 10.364]
  [ 0.182, -0.874], // Đồng bằng sông Cửu Long [106.405, 9.531]
  // === MŨI CÀ MAU — cực nam Việt Nam ===
  [-0.166, -1.000], // Cà Mau                  [105.158, 8.600] — điểm cực nam
  // === VỊNH THÁI LAN — hướng bắc ===
  [-0.267, -0.913], // Kiên Giang (vịnh TL)    [104.795, 9.241]
  [-0.189, -0.821], // Kiên Giang bắc          [105.076, 9.918]
  // === BIÊN GIỚI CAMPUCHIA — hướng đông bắc ===
  [-0.396, -0.744], // Biên giới Campuchia TN  [104.334, 10.487]
  [-0.154, -0.690], // An Giang                [105.200, 10.889]
  [ 0.139, -0.680], // Tây Ninh đông           [106.250, 10.962]
  [ 0.016, -0.598], // Tây Ninh bắc            [105.811, 11.568]
  // === TÂY NGUYÊN VÀ BIÊN GIỚI LÀO ===
  [ 0.485, -0.494], // Lâm Đồng / Bình Phước  [107.491, 12.337]
  [ 0.520, -0.331], // Đắk Lắk                [107.615, 13.536]
  [ 0.455, -0.240], // Gia Lai                [107.383, 14.202]
  [ 0.506, -0.105], // Kon Tum                [107.565, 15.202]
  [ 0.436, -0.009], // Quảng Nam / Laos       [107.313, 15.909]
  [ 0.224,  0.085], // Quảng Bình / Laos      [106.556, 16.604]
  [ 0.048,  0.205], // Nghệ An / Laos         [105.926, 17.485]
  [-0.184,  0.365], // Nghệ An bắc / Laos     [105.095, 18.667]
  // === TÂY BẮC — biên giới Lào và Trung Quốc ===
  [-0.518,  0.446], // Sơn La / Điện Biên     [103.897, 19.265]
  [-0.438,  0.495], // Sơn La                 [104.183, 19.625]
  [-0.260,  0.530], // Lai Châu               [104.823, 19.887]
  [-0.368,  0.648], // Lai Châu bắc           [104.435, 20.759]
  [-0.712,  0.649], // Điện Biên              [103.204, 20.767]
  [-0.837,  0.773], // Điện Biên tây          [102.755, 21.675]
  // === ĐIỂM CỰC TÂY — Lai Châu ===
  [-1.000,  0.880], // Cực tây Việt Nam       [102.170, 22.465]
  // === BIÊN GIỚI TRUNG QUỐC — hướng đông ===
  [-0.850,  0.913], // Lào Cai               [102.707, 22.709]
  [-0.628,  0.912], // Lào Cai / Hà Giang    [103.505, 22.704]
  [-0.356,  0.928], // Hà Giang              [104.477, 22.819]
  // === ĐIỂM CỰC BẮC — Lũng Cú, Hà Giang ===
  [-0.118,  1.000], // Lũng Cú               [105.329, 23.352] — cực bắc
  [ 0.016,  0.949], // Cao Bằng              [105.811, 22.977]
  [ 0.271,  0.924], // Cao Bằng / Lạng Sơn   [106.725, 22.794]
  [ 0.227,  0.846], // Lạng Sơn              [106.567, 22.218]
  [ 0.360,  0.791], // Lạng Sơn / Quảng Ninh [107.043, 21.812]
  // (close back to first point: [0.641, 0.756])
];

/* Tỉ lệ bản đồ — 1.0 = giữ nguyên tỉ lệ địa lý thực */
const MAP_SCALE = 1.0;

/* Vị trí các đảo (lat/lon thực → normalized, x nén lại cho vừa scene) */
const ISLANDS = [
  { label: "Hoàng Sa",  pos: [ 1.26,  0.07] as [number, number] }, // ~16.5°N, 111.9°E
  { label: "Trường Sa", pos: [ 1.52, -0.69] as [number, number] }, // ~10°N, 114°E
  { label: "Phú Quốc",  pos: [-0.49, -0.78] as [number, number] }, // 10.2°N, 104°E (actual: -0.490, -0.779)
];

/* ─── Bounding box + centroid từ outline thực ───────────────────────────── */
function getOutlineBounds() {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of VIETNAM_OUTLINE) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return {
    minX: minX * MAP_SCALE, maxX: maxX * MAP_SCALE,
    minY: minY * MAP_SCALE, maxY: maxY * MAP_SCALE,
    cx: (minX + maxX) / 2 * MAP_SCALE,
    cy: (minY + maxY) / 2 * MAP_SCALE,
  };
}

/* ─── Point-in-polygon (ray casting) ────────────────────────────────────── */
function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi)
      inside = !inside;
  }
  return inside;
}

/* ─── Particle field forming the real Vietnam silhouette ────────────────── */
function VietnamParticles({
  reduced, count, bounds,
}: {
  reduced: boolean; count: number; bounds: ReturnType<typeof getOutlineBounds>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useRadialTexture([
    [0,    "rgba(255,255,255,1)"],
    [0.24, "rgba(255,238,155,0.97)"],
    [0.57, "rgba(220,44,44,0.60)"],
    [1,    "rgba(0,0,0,0)"],
  ]);

  const particles = useMemo(() => {
    type P = {
      tx: number; ty: number; tz: number;
      sx: number; sy: number; sz: number;
      orbitR: number; orbitTheta: number; orbitSpeed: number;
      size: number; delay: number; twinkleFreq: number; phase: number;
      colorMix: number; isOutline: boolean;
    };
    const arr: P[] = [];
    const cx = bounds.cx, cy = bounds.cy;
    const nOutline  = Math.floor(count * 0.52); // outline dày hơn = nhận diện rõ hơn
    const nInterior = Math.floor(count * 0.35);
    const nAura     = count - nOutline - nInterior;

    /* Outline — lấy mẫu đều dọc theo perimeter */
    for (let i = 0; i < nOutline; i++) {
      const t   = (i / nOutline) * VIETNAM_OUTLINE.length;
      const idx = Math.floor(t) % VIETNAM_OUTLINE.length;
      const f   = t - Math.floor(t);
      const nxt = (idx + 1) % VIETNAM_OUTLINE.length;
      const ox  = VIETNAM_OUTLINE[idx][0] * (1 - f) + VIETNAM_OUTLINE[nxt][0] * f;
      const oy  = VIETNAM_OUTLINE[idx][1] * (1 - f) + VIETNAM_OUTLINE[nxt][1] * f;
      const r1 = srnd(i * 2.1 + 1), r2 = srnd(i * 5.3 + 7), r3 = srnd(i * 7.9 + 11);
      arr.push({
        tx: ox * MAP_SCALE - cx, ty: oy * MAP_SCALE - cy, tz: (r1 - 0.5) * 0.15,
        sx: (r1 - 0.5) * 7.0, sy: (r2 - 0.5) * 8.0, sz: (r3 - 0.5) * 5.0,
        orbitR: 0.008 + r1 * 0.025, orbitTheta: r2 * Math.PI * 2,
        orbitSpeed: 0.35 + r3 * 1.4,
        size: 0.042 + r1 * 0.050,   // outline hơi to → đường viền rõ
        delay: srnd(i * 11 + 13) * 0.38,
        twinkleFreq: 1.6 + r2 * 3.4, phase: r3 * Math.PI * 2,
        colorMix: srnd(i * 13 + 17), isOutline: true,
      });
    }

    /* Interior — rejection sampling trong polygon thực */
    let placed = 0, tries = 0;
    while (placed < nInterior && tries < nInterior * 35) {
      const r1 = srnd(tries * 7 + 31), r2 = srnd(tries * 11 + 37);
      const r3 = srnd(tries * 13 + 41), r4 = srnd(tries * 17 + 43);
      tries++;
      const x = bounds.minX / MAP_SCALE + r1 * (bounds.maxX - bounds.minX) / MAP_SCALE;
      const y = bounds.minY / MAP_SCALE + r2 * (bounds.maxY - bounds.minY) / MAP_SCALE;
      if (!pointInPolygon(x, y, VIETNAM_OUTLINE)) continue;
      arr.push({
        tx: x * MAP_SCALE - cx, ty: y * MAP_SCALE - cy, tz: (r3 - 0.5) * 0.26,
        sx: (r1 - 0.5) * 7.0, sy: (r2 - 0.5) * 8.0, sz: (r3 - 0.5) * 5.0,
        orbitR: 0.012 + r4 * 0.030, orbitTheta: r1 * Math.PI * 2,
        orbitSpeed: 0.26 + r2 * 1.15,
        size: 0.020 + r4 * 0.040,
        delay: r1 * 0.50,
        twinkleFreq: 1.0 + r3 * 2.6, phase: r4 * Math.PI * 2,
        colorMix: r4, isOutline: false,
      });
      placed++;
    }

    /* Aura — ánh sáng lan tỏa quanh bản đồ */
    for (let i = 0; i < nAura; i++) {
      const r1 = srnd(i * 53 + 101), r2 = srnd(i * 59 + 103), r3 = srnd(i * 61 + 107);
      const ang = r1 * Math.PI * 2, rad = 1.3 + r2 * 1.25;
      arr.push({
        tx: Math.cos(ang) * rad, ty: Math.sin(ang) * rad * 0.88, tz: (r3 - 0.5) * 1.05,
        sx: (r1 - 0.5) * 8.0, sy: (r2 - 0.5) * 6.0, sz: (r3 - 0.5) * 4.5,
        orbitR: 0.06 + r1 * 0.11, orbitTheta: r2 * Math.PI * 2,
        orbitSpeed: 0.16 + r3 * 0.70,
        size: 0.020 + r1 * 0.028,
        delay: 0.14 + r2 * 0.48,
        twinkleFreq: 0.85 + r3 * 2.2, phase: r1 * Math.PI * 2,
        colorMix: r3, isOutline: false,
      });
    }
    return arr;
  }, [count, bounds]);

  useEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.isOutline) {
        if (p.colorMix < 0.40) c.set("#FFD700");
        else if (p.colorMix < 0.74) c.set("#FF5020");
        else c.set("#FFFFFF");
      } else {
        if (p.colorMix < 0.34) c.set("#FFD050");
        else if (p.colorMix < 0.68) c.set("#FF2222");
        else c.set("#FFE080");
      }
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    const mesh = ref.current; if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = Math.max(0, t - p.delay);
      const k     = Math.min(localT / 1.25, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      const swirlT = Math.max(0, localT - 1.1) * p.orbitSpeed * (reduced ? 0.2 : 1);
      const ox = Math.cos(swirlT + p.orbitTheta) * p.orbitR;
      const oy = Math.sin(swirlT + p.orbitTheta) * p.orbitR;
      const spiralA = (1 - eased) * Math.PI * 1.25;
      const cosA = Math.cos(spiralA), sinA = Math.sin(spiralA);
      const dx = p.sx - p.tx, dy = p.sy - p.ty;
      const sx2 = dx * cosA - dy * sinA, sy2 = dx * sinA + dy * cosA;
      const x = p.tx * eased + (p.tx + sx2) * (1 - eased) + ox;
      const y = p.ty * eased + (p.ty + sy2) * (1 - eased) + oy;
      const z = p.tz * eased + p.sz * (1 - eased);
      const twinkle = p.isOutline
        ? (0.30 + 0.70 * (0.5 + 0.5 * Math.sin(t * p.twinkleFreq + p.phase)))
        : (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * p.twinkleFreq + p.phase)));
      dummy.position.set(x, y, z);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.scale.setScalar(p.size * eased * (p.isOutline ? (0.42 + twinkle * 0.92) : (0.32 + twinkle * 0.82)));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, particles.length]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ─── Đường bờ biển phát sáng — lớp điểm sáng theo đường viền ──────────── */
function CoastlineGlow({ bounds }: { bounds: ReturnType<typeof getOutlineBounds> }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos: number[] = [];
    const N = 400;
    for (let i = 0; i < N; i++) {
      const t   = (i / N) * VIETNAM_OUTLINE.length;
      const idx = Math.floor(t) % VIETNAM_OUTLINE.length;
      const f   = t - Math.floor(t);
      const nxt = (idx + 1) % VIETNAM_OUTLINE.length;
      const ox  = VIETNAM_OUTLINE[idx][0] * (1 - f) + VIETNAM_OUTLINE[nxt][0] * f;
      const oy  = VIETNAM_OUTLINE[idx][1] * (1 - f) + VIETNAM_OUTLINE[nxt][1] * f;
      pos.push(ox * MAP_SCALE - bounds.cx, oy * MAP_SCALE - bounds.cy, 0.12);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [bounds]);

  useFrame((state) => {
    const pts = ref.current; if (!pts) return;
    (pts.material as THREE.PointsMaterial).opacity = 0.55 + Math.sin(state.clock.elapsedTime * 1.9) * 0.22;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.030} color="#FFD700" transparent opacity={0.65}
        depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

/* ─── Sao Hà Nội — thủ đô: 21.03°N, 105.85°E → x=0.027, y=0.685 ────────── */
function HanoiStar({ bounds }: { bounds: ReturnType<typeof getOutlineBounds> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useStarSparkleTexture("rgba(255,238,155,1)");
  const wx = 0.027 * MAP_SCALE - bounds.cx;
  const wy = 0.685 * MAP_SCALE - bounds.cy;
  useFrame((state) => {
    const m = meshRef.current; if (!m) return;
    const t = state.clock.elapsedTime;
    m.lookAt(state.camera.position);
    const grow = Math.min(Math.max(0, t - 1.1) / 0.50, 1);
    const eased = 1 - Math.pow(1 - grow, 3);
    m.scale.setScalar(0.36 * eased * (1 + Math.sin(t * 2.6) * 0.15));
    m.rotation.z = t * 0.32;
  });
  return (
    <mesh ref={meshRef} position={[wx, wy, 0.50]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─── Marker đảo — vòng pulse kép ──────────────────────────────────────── */
function IslandMarker({ pos, label }: { pos: [number, number, number]; label: string }) {
  const sphRef  = useRef<THREE.Mesh>(null);
  const ring1   = useRef<THREE.Mesh>(null);
  const ring2   = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const grow = Math.min(Math.max(0, t - 1.3) / 0.50, 1);
    const eased = 1 - Math.pow(1 - grow, 3);
    if (sphRef.current) sphRef.current.scale.setScalar(eased * (1 + Math.sin(t * 3.5) * 0.24));
    const applyRing = (r: React.RefObject<THREE.Mesh | null>, offset: number, color: string) => {
      if (!r.current) return;
      const p = ((t - 1.3 + offset) * 1.1) % 2.0;
      r.current.scale.setScalar(eased * (0.5 + p * 4.2));
      r.current.lookAt(state.camera.position);
      (r.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - p / 2.0) * eased * 0.88;
    };
    applyRing(ring1, 0, "#ffd700");
    applyRing(ring2, 1.0, "#ff6020");
  });
  return (
    <group position={pos}>
      <mesh ref={sphRef}>
        <sphereGeometry args={[0.060, 18, 18]} />
        <meshStandardMaterial color="#ffd86a" emissive={new THREE.Color("#FFD700")} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh ref={ring1}>
        <ringGeometry args={[0.055, 0.078, 40]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ring2}>
        <ringGeometry args={[0.055, 0.078, 40]} />
        <meshBasicMaterial color="#ff6020" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
      <Html position={[0.12, 0.10, 0]} center distanceFactor={3}
        style={{ pointerEvents: "none", whiteSpace: "nowrap", color: "#ffe98a",
          fontFamily: "var(--font-body, sans-serif)", fontSize: "11px", fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          textShadow: "0 0 14px rgba(255,215,0,1), 0 0 28px rgba(220,27,27,0.7)" }}>
        {label}
      </Html>
    </group>
  );
}

/* ─── Holographic scan lines ─────────────────────────────────────────────── */
function HoloScanLines({ reduced }: { reduced: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4; canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0)"; ctx.fillRect(0, 0, 4, 256);
    ctx.fillStyle = "rgba(255,215,80,0.18)";
    for (let y = 0; y < 256; y += 4) ctx.fillRect(0, y, 4, 1);
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(38, 24);
    return t;
  }, []);
  useFrame((state) => {
    const m = meshRef.current; if (!m || reduced) return;
    (m.material as THREE.MeshBasicMaterial).map!.offset.y = -state.clock.elapsedTime * 0.078;
  });
  return (
    <mesh ref={meshRef} position={[0, 0, -0.48]}>
      <planeGeometry args={[6, 6]} />
      <meshBasicMaterial map={tex} transparent opacity={0.13} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─── Vòng năng lượng xung quanh bản đồ ─────────────────────────────────── */
function EnergyRings({ reduced }: { reduced: boolean }) {
  const rings = useRef<THREE.Mesh[]>([]);
  const mats  = useRef<THREE.MeshBasicMaterial[]>([]);
  const N = 4, PERIOD = 3.4;
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const m = rings.current[i], mt = mats.current[i];
      if (!m || !mt) continue;
      const cycleT = ((t + (i / N) * PERIOD) % PERIOD) / PERIOD;
      m.scale.setScalar(0.5 + cycleT * 5.6);
      mt.opacity = Math.max(0, (1 - cycleT) * 0.18);
    }
  });
  return (
    <>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i}
          ref={(el) => { if (el) rings.current[i] = el as THREE.Mesh; }}
          position={[0, 0, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.92, 1.02, 90]} />
          <meshBasicMaterial
            ref={(el) => { if (el) mats.current[i] = el as THREE.MeshBasicMaterial; }}
            color={i % 2 === 0 ? "#FFD700" : "#FF2020"}
            transparent opacity={0} side={THREE.DoubleSide}
            toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </>
  );
}

/* ─── Volumetric fog backdrop ────────────────────────────────────────────── */
function VolumetricFog() {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useRadialTexture([
    [0, "rgba(48,5,5,0.58)"], [0.5, "rgba(115,28,14,0.28)"], [1, "rgba(0,0,0,0)"],
  ]);
  useFrame((state) => {
    const m = meshRef.current; if (!m) return;
    const t = state.clock.elapsedTime;
    m.lookAt(state.camera.position);
    m.scale.setScalar(10 + Math.sin(t * 0.28) * 0.55);
    m.rotation.z = t * 0.036;
  });
  return (
    <mesh ref={meshRef} position={[0, 0, -3.2]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ─── God-rays ánh sáng thiêng liêng ─────────────────────────────────────── */
function GodRays({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useStreakTexture("rgba(255,220,140,0.85)");
  useFrame((state) => {
    if (!groupRef.current || reduced) return;
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.042;
  });
  return (
    <group ref={groupRef} position={[0, 0, -1.8]}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 10]}>
          <planeGeometry args={[0.12, 7.0]} />
          <meshBasicMaterial map={tex} color={i % 2 === 0 ? "#FFD700" : "#FF4020"}
            transparent opacity={0.08} blending={THREE.AdditiveBlending}
            depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Camera cinematic zoom-in chậm ─────────────────────────────────────── */
function CinematicCam({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (reduced) { state.camera.position.set(0, 0, 4.6); state.camera.lookAt(0, 0, 0); return; }
    const t = state.clock.elapsedTime;
    const zoomIn = Math.max(0, 5.4 - Math.min(t * 0.20, 0.8)); // zoom từ 5.4 → 4.6
    state.camera.position.x = Math.sin(t * 0.13) * 0.30;
    state.camera.position.y = Math.cos(t * 0.10) * 0.14;
    state.camera.position.z = zoomIn + Math.sin(t * 0.16) * 0.16;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  const bounds = useMemo(() => getOutlineBounds(), []);
  return (
    <>
      <color attach="background" args={["#010002"]} />
      <fog attach="fog" args={["#080204", 5, 14]} />
      <ambientLight intensity={0.38} color="#ffe0c8" />
      <pointLight position={[1.8, 2.0, 3.5]} intensity={22} color="#FFD86A" distance={10} decay={1.5} />
      <pointLight position={[-2.0, -1, 2.5]} intensity={15} color="#FF3020" distance={9} decay={1.8} />
      <pointLight position={[0, 0, 4.5]} intensity={8} color="#ffffff" distance={7} decay={2.2} />

      <CinematicCam reduced={reduced} />
      <VolumetricFog />
      <GodRays reduced={reduced} />
      <HoloScanLines reduced={reduced} />
      <EnergyRings reduced={reduced} />
      <VietnamParticles reduced={reduced} count={reduced ? 750 : 3200} bounds={bounds} />
      <CoastlineGlow bounds={bounds} />
      <HanoiStar bounds={bounds} />
      {ISLANDS.map((isle) => (
        <IslandMarker key={isle.label}
          pos={[isle.pos[0] * MAP_SCALE - bounds.cx, isle.pos[1] * MAP_SCALE - bounds.cy, 0.28]}
          label={isle.label} />
      ))}
    </>
  );
}

export function VietnamMapEffect({ emotion }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div aria-hidden className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 66% at 50% 50%, rgba(145,22,22,0.26) 0%, rgba(10,3,5,0.94) 58%, #000 100%)" }} />

      <Canvas dpr={[1, 1.85]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 5.4], fov: 46 }}
        style={{ background: "transparent" }}>
        <Scene reduced={reduced} />
      </Canvas>

      <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,195,110,0.11) 0%, transparent 58%)" }} />

      <div aria-hidden className="absolute inset-x-0 top-0 h-[6%] bg-black/88" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[6%] bg-black/88" />

      <motion.div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{ delay: 1.5, duration: 0.9 }}>
        <p className="font-cinzel text-sm font-bold uppercase tracking-[0.36em] sm:text-base"
          style={{ color: "#fff2c2", textShadow: "0 0 24px rgba(255,215,0,0.95), 0 2px 18px rgba(200,16,46,0.7), 0 0 60px rgba(255,170,0,0.55)" }}>
          {emotion}
        </p>
      </motion.div>
    </div>
  );
}
