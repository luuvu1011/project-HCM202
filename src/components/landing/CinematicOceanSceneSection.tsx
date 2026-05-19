"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Cloud, Line, Sky, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ─── Ocean Surface ─────────────────────────────────────────────────────────

function OceanSurface({ reduced }: { reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial | null>(null);

  const uniforms = useMemo(
    () => ({
      uTime:    { value: 0 },
      uDeep:    { value: new THREE.Color("#03100c") },   // jade-black — Hạ Long Bay deep
      uMid:     { value: new THREE.Color("#0a1e20") },   // teal-jade midtone
      uSurface: { value: new THREE.Color("#185048") },   // jade-green surface shimmer
      uFoam:    { value: new THREE.Color("#c4dcc8") },   // jade-white foam
      uSunGlow: { value: new THREE.Color("#c07020") },   // deep amber — morning Vietnam
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (reduced || !matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.6, 0]}>
      <planeGeometry args={[90, 90, 200, 200]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying float vWave;
          varying vec2  vUv;

          void main() {
            vUv = uv;
            vec3 pos = position;

            // Five-layer wave sum — different directions, amplitudes, speeds
            float w1 = sin(pos.x * 0.32 + uTime * 0.78) * 0.44;
            float w2 = sin(pos.y * 0.46 + uTime * 0.60) * 0.30;
            float w3 = sin((pos.x + pos.y) * 0.21 + uTime * 0.92) * 0.20;
            float w4 = sin((pos.x - pos.y) * 0.40 + uTime * 1.12) * 0.12;
            float w5 = sin(pos.x * 0.78 + pos.y * 0.62 + uTime * 1.38) * 0.07;

            vWave = w1 + w2 + w3 + w4 + w5;
            pos.z += vWave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3  uDeep;
          uniform vec3  uMid;
          uniform vec3  uSurface;
          uniform vec3  uFoam;
          uniform vec3  uSunGlow;
          uniform float uTime;
          varying float vWave;
          varying vec2  vUv;

          void main() {
            float wNorm = smoothstep(-0.75, 0.95, vWave);
            float depth = vUv.y;   // 0 = near camera, 1 = horizon

            // Depth-based base color
            vec3 base = mix(uDeep, uMid, depth * 0.72);
            base = mix(base, uSurface, wNorm * 0.36);

            // Warm sun reflection on horizon
            float horizon = pow(1.0 - depth, 5.0);
            base = mix(base, uSunGlow, horizon * 0.32);

            // Animated pseudo-specular on crests
            float spec = sin(vWave * 9.0 + uTime * 2.2) * 0.5 + 0.5;
            spec *= smoothstep(0.18, 0.85, wNorm) * 0.18;

            // Foam at peaks
            float foam = smoothstep(0.52, 0.82, vWave) * 0.26;

            // Subtle caustic flicker
            float caustic = sin(vUv.x * 28.0 + uTime * 1.6) *
                            sin(vUv.y * 22.0 + uTime * 1.2) * 0.025 + 0.025;
            caustic *= smoothstep(0.1, 0.7, wNorm);

            vec3 color = base
              + spec    * uSunGlow
              + foam    * uFoam
              + caustic * vec3(0.55, 0.75, 1.0);

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

// ─── Wake Trail ────────────────────────────────────────────────────────────

function WakeTrail({ reduced }: { reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (reduced || !matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position={[-2.6, 0.06, 0]}>
      <planeGeometry args={[8, 1.8, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.z += sin((uv.x + uTime * 0.22) * 12.0) * 0.025;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            float trail = smoothstep(0.04, 0.38, vUv.x) * smoothstep(0.96, 0.58, vUv.x);
            float edge  = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
            float alpha = trail * edge * 0.42;
            vec3 color  = mix(vec3(0.65, 0.82, 1.0), vec3(1.0), vUv.x * 0.6);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

// ─── Historical Ship (3-mast) ──────────────────────────────────────────────

function HistoricalShip({ reduced }: { reduced: boolean }) {
  const group  = useRef<THREE.Group | null>(null);
  const sail0  = useRef<THREE.Mesh  | null>(null);
  const sail1  = useRef<THREE.Mesh  | null>(null);
  const sail2  = useRef<THREE.Mesh  | null>(null);
  const prev   = useRef({ x: 0, z: 0 });

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const x = Math.sin(t * 0.052) * 3.8;
    const z = Math.cos(t * 0.040) * 2.6;
    const y = -0.88 + Math.sin(t * 0.78) * 0.1;

    const dx = x - prev.current.x;
    const dz = z - prev.current.z;
    group.current.position.set(x, y, z);
    group.current.rotation.y = Math.atan2(dz, dx);

    if (!reduced) {
      group.current.rotation.z = Math.sin(t * 0.88) * 0.055;
      group.current.rotation.x = Math.cos(t * 0.68) * 0.026;
      // Gentle sail billow
      if (sail0.current) sail0.current.rotation.y = Math.sin(t * 0.38) * 0.09;
      if (sail1.current) sail1.current.rotation.y = Math.sin(t * 0.42 + 0.6) * 0.07;
      if (sail2.current) sail2.current.rotation.y = Math.sin(t * 0.35 + 1.1) * 0.06;
    }
    prev.current = { x, z };
  });

  const gold  = "#b07820";  // aged Đông Sơn bronze
  const hull  = "#14222e";  // lacquered hull
  const deck  = "#0c1824";
  const white = "#eee0c0";  // antique parchment sail
  const off   = "#dccca8";  // older, more aged sail

  return (
    <group ref={group} scale={0.88}>
      <WakeTrail reduced={reduced} />

      {/* ── Hull ── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6.0, 0.72, 1.35]} />
        <meshStandardMaterial color={hull} roughness={0.65} metalness={0.12} />
      </mesh>
      {/* Lower hull / keel bulk */}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[5.5, 0.42, 1.65]} />
        <meshStandardMaterial color="#0c1a2c" roughness={0.7} metalness={0.08} />
      </mesh>
      {/* Bow taper */}
      <mesh position={[3.2, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.66, 1.8, 20]} />
        <meshStandardMaterial color="#0f1f35" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Stern block */}
      <mesh position={[-3.1, 0.32, 0]}>
        <boxGeometry args={[0.55, 0.85, 1.22]} />
        <meshStandardMaterial color="#0e1f35" roughness={0.6} />
      </mesh>
      {/* Gold waterline stripe */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[5.8, 0.07, 1.42]} />
        <meshStandardMaterial color={gold} roughness={0.5} metalness={0.5} />
      </mesh>

      {/* ── Deck ── */}
      <mesh position={[0, 0.39, 0]}>
        <boxGeometry args={[5.6, 0.10, 1.15]} />
        <meshStandardMaterial color={deck} roughness={0.65} />
      </mesh>

      {/* Cabin (stern) */}
      <mesh position={[-1.9, 0.72, 0]}>
        <boxGeometry args={[2.0, 0.65, 0.90]} />
        <meshStandardMaterial color="#0f2038" roughness={0.65} />
      </mesh>
      {/* Cabin roof */}
      <mesh position={[-1.9, 1.08, 0]}>
        <boxGeometry args={[1.9, 0.10, 0.85]} />
        <meshStandardMaterial color={deck} roughness={0.6} />
      </mesh>

      {/* ── Foremast (forward) ── */}
      <mesh position={[1.9, 2.05, 0]}>
        <cylinderGeometry args={[0.052, 0.065, 3.30, 12]} />
        <meshStandardMaterial color={gold} roughness={0.55} metalness={0.45} />
      </mesh>
      {/* Fore yard */}
      <mesh position={[1.9, 2.90, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 2.20, 8]} />
        <meshStandardMaterial color={gold} roughness={0.6} metalness={0.35} />
      </mesh>

      {/* ── Mainmast (tallest, center) ── */}
      <mesh position={[-0.2, 2.65, 0]}>
        <cylinderGeometry args={[0.062, 0.078, 5.0, 12]} />
        <meshStandardMaterial color={gold} roughness={0.55} metalness={0.45} />
      </mesh>
      {/* Main upper yard */}
      <mesh position={[-0.2, 4.10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 2.65, 8]} />
        <meshStandardMaterial color={gold} roughness={0.6} metalness={0.35} />
      </mesh>
      {/* Main lower yard */}
      <mesh position={[-0.2, 2.30, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.036, 2.30, 8]} />
        <meshStandardMaterial color={gold} roughness={0.6} metalness={0.35} />
      </mesh>

      {/* ── Mizzenmast (stern) ── */}
      <mesh position={[-2.4, 1.65, 0]}>
        <cylinderGeometry args={[0.048, 0.060, 2.75, 12]} />
        <meshStandardMaterial color={gold} roughness={0.55} metalness={0.45} />
      </mesh>
      {/* Mizzen yard */}
      <mesh position={[-2.4, 2.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 1.65, 8]} />
        <meshStandardMaterial color={gold} roughness={0.6} metalness={0.35} />
      </mesh>

      {/* ── Sails ── */}
      {/* Main upper sail */}
      <mesh ref={sail0} position={[-0.2, 3.80, 0.14]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.55, 1.12]} />
        <meshStandardMaterial color={white} roughness={0.92} transparent opacity={0.91} side={THREE.DoubleSide} />
      </mesh>
      {/* Main lower sail */}
      <mesh ref={sail1} position={[-0.2, 2.35, 0.10]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.95, 1.55]} />
        <meshStandardMaterial color={white} roughness={0.90} transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      {/* Fore sail */}
      <mesh ref={sail2} position={[1.9, 2.72, 0.10]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.55, 1.30]} />
        <meshStandardMaterial color={off} roughness={0.88} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Mizzen sail */}
      <mesh position={[-2.4, 2.25, 0.08]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.25, 0.95]} />
        <meshStandardMaterial color={off} roughness={0.88} transparent opacity={0.82} side={THREE.DoubleSide} />
      </mesh>
      {/* Staysail (between fore and main) */}
      <mesh position={[0.90, 2.15, 0.06]} rotation={[0, Math.PI / 2, -0.12]}>
        <planeGeometry args={[1.35, 1.05]} />
        <meshStandardMaterial color={off} roughness={0.90} transparent opacity={0.72} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Rigging lines (simplified) ── */}
      {[
        // Forestay: bow → mainmast top
        { p1: [3.2, 0.35, 0], p2: [-0.2, 5.15, 0] },
        // Main shroud left
        { p1: [-0.2, 4.5, 0], p2: [-0.2, 0.4, 0.55] },
        // Main shroud right
        { p1: [-0.2, 4.5, 0], p2: [-0.2, 0.4, -0.55] },
        // Backstay
        { p1: [-0.2, 4.2, 0], p2: [-3.0, 0.4, 0] },
        // Foremast stay
        { p1: [1.9, 3.65, 0], p2: [-0.2, 4.8, 0] },
      ].map(({ p1, p2 }, i) => (
        <RiggingLine key={i} p1={p1 as [number, number, number]} p2={p2 as [number, number, number]} />
      ))}
    </group>
  );
}

function RiggingLine({ p1, p2 }: { p1: [number, number, number]; p2: [number, number, number] }) {
  return (
    <Line
      points={[p1, p2]}
      color="#906020"
      transparent
      opacity={0.28}
      lineWidth={0.5}
    />
  );
}

// ─── Atmospheric Fog Layers ────────────────────────────────────────────────

function AtmosphericFogLayers({ reduced }: { reduced: boolean }) {
  const r0 = useRef<THREE.Mesh | null>(null);
  const r1 = useRef<THREE.Mesh | null>(null);
  const r2 = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    if (r0.current) r0.current.position.x = Math.sin(t * 0.038) * 3.5;
    if (r1.current) r1.current.position.x = Math.sin(t * 0.052 + 1.2) * 4.8;
    if (r2.current) r2.current.position.z = Math.sin(t * 0.028) * 2.8;
  });

  return (
    <>
      {/* Warm parchment mist — morning Vietnam highland */}
      <mesh ref={r0} position={[0, 0.6, -10]} rotation={[-Math.PI / 7, 0, 0]}>
        <planeGeometry args={[45, 9]} />
        <meshBasicMaterial color="#c8c0a0" transparent opacity={0.060} depthWrite={false} />
      </mesh>
      {/* Jade-tinted warm fog — rice paddy morning air */}
      <mesh ref={r1} position={[4, 1.1, -15]} rotation={[-Math.PI / 6, 0, 0.06]}>
        <planeGeometry args={[38, 7]} />
        <meshBasicMaterial color="#b0b898" transparent opacity={0.050} depthWrite={false} />
      </mesh>
      {/* Sapa mountain mist — jade-gray remote highland */}
      <mesh ref={r2} position={[-3, 1.6, -22]} rotation={[-Math.PI / 5.5, 0, -0.05]}>
        <planeGeometry args={[55, 11]} />
        <meshBasicMaterial color="#a8b4a0" transparent opacity={0.070} depthWrite={false} />
      </mesh>
    </>
  );
}

// ─── Horizon Glow ─────────────────────────────────────────────────────────

function HorizonGlow({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    if (reduced || !ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.14 + Math.sin(clock.elapsedTime * 0.28) * 0.04;
  });

  return (
    <mesh ref={ref} position={[0, 0.85, -32]}>
      <planeGeometry args={[250, 6.5]} />
      <meshBasicMaterial
        color="#b85018"
        transparent
        opacity={0.15}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Atmospheric Sky ───────────────────────────────────────────────────────

function AtmosphericSky({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    if (reduced || !group.current) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.018) * 0.04;
  });

  return (
    <group ref={group}>
      <Sky
        distance={450000}
        sunPosition={[1.0, 0.32, -3.5]}
        turbidity={10}
        rayleigh={3.2}
        mieCoefficient={0.006}
        mieDirectionalG={0.88}
      />
    </group>
  );
}

// ─── Camera Rig ────────────────────────────────────────────────────────────

function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;

    // Slow cinematic dolly + gentle orbital drift
    camera.position.x = Math.sin(t * 0.065) * 1.4;
    camera.position.y = 4.2 + Math.sin(t * 0.09) * 0.45;
    camera.position.z = 13.8 + Math.cos(t * 0.052) * 0.9;

    // Subtle look-at drift for parallax depth feeling
    const lx = Math.sin(t * 0.028) * 0.6;
    const ly = 0.6 + Math.sin(t * 0.072) * 0.22;
    camera.lookAt(lx, ly, 0);
  });

  return null;
}

// ─── Section ───────────────────────────────────────────────────────────────

export function CinematicOceanSceneSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="canh-dai-duong"
      className="relative py-20 sm:py-28"
    >
      {/* Ambient section glow — crimson + jade */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(140,24,24,0.09),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_80%_90%,rgba(28,60,44,0.22),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-soft/85">
            Đại dương điện ảnh
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-parchment sm:text-4xl">
            Không gian hải trình — nơi lịch sử bắt đầu lênh đênh
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-parchment-muted sm:text-base">
            Một khung cảnh đại dương mang sắc thái điện ảnh: sương mờ, ánh sáng mềm,
            mây trôi và mặt nước chuyển động — tái hiện không khí lịch sử bằng cảm xúc,
            không phải bản đồ.
          </p>
        </div>

        {/* Canvas container with CSS post-processing hints */}
        <div className="mt-10 overflow-hidden rounded-[32px] border border-white/10 shadow-[0_50px_160px_rgba(0,0,0,0.7),0_0_0_1px_rgba(212,168,83,0.08)]">
          <div className="relative aspect-[16/9] min-h-[360px] w-full sm:aspect-[21/9] sm:min-h-[460px]"
               style={{ filter: "contrast(1.02) saturate(1.06)" }}>
            {/* Cinematic bloom overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-10 mix-blend-screen"
              style={{ background: "radial-gradient(ellipse 55% 35% at 62% 38%, rgba(196,138,40,0.060), transparent)" }}
            />
            {/* Edge vignette on canvas */}
            <div className="pointer-events-none absolute inset-0 z-10"
                 style={{ background: "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 55%, rgba(3,8,20,0.55) 100%)" }} />

            <Canvas
              camera={{ position: [0, 4.2, 13.8], fov: 44, near: 0.1, far: 220 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, powerPreference: "high-performance" }}
            >
                      {/* Jade-tinted tropical night fog */}
              <fog attach="fog" args={["#080e0a", 16, 58]} />
              <color attach="background" args={["#060c08"]} />

              {/* ── Lighting: Vietnamese warm-tropical atmosphere ── */}
              {/* Ambient: warm parchment air — tropical warmth, not cold Atlantic */}
              <ambientLight intensity={0.48} color="#c4b498" />
              {/* Key: deep amber sun — pre-dawn Mekong, morning rice field light */}
              <directionalLight position={[8, 3, 6]}  intensity={1.10} color="#e09030" castShadow />
              {/* Fill: muted jade-green sky — Vietnamese canopy, nature light */}
              <directionalLight position={[-10, 5, -10]} intensity={0.38} color="#487860" />
              {/* Rim: terracotta bounce — aged colonial wall, red-earth reflection */}
              <directionalLight position={[0, -1, 8]}  intensity={0.28} color="#c05020" />

              <AtmosphericSky reduced={reduced} />
              <HorizonGlow    reduced={reduced} />
              <OceanSurface   reduced={reduced} />
              <AtmosphericFogLayers reduced={reduced} />
              <HistoricalShip reduced={reduced} />

              {/* Volumetric-feeling clouds at three depths */}
              <Cloud position={[ 7,  6.5,  -7]} speed={0.18} opacity={0.38} />
              <Cloud position={[-7,  5.8, -11]} speed={0.13} opacity={0.30} />
              <Cloud position={[ 0,  7.5, -15]} speed={0.10} opacity={0.25} />
              <Cloud position={[ 4,  5.0,  -4]} speed={0.22} opacity={0.20} />

              {/* Atmospheric particles */}
              <Sparkles
                count={100}
                scale={[32, 12, 32]}
                size={1.1}
                speed={0.5}
                color="#d4b880"
              />

              <CameraRig reduced={reduced} />
            </Canvas>
          </div>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-parchment-muted/80 sm:text-sm">
          Cảnh quan này chỉ tập trung vào bầu không khí điện ảnh — không có hệ thống hành trình.
        </p>
      </div>
    </section>
  );
}
