"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Line, Html, Stars } from "@react-three/drei";
import * as THREE from "three";

// ─── Earth textures (NASA Blue Marble, served from jsDelivr/three GitHub) ───
// Note: three.js npm package does NOT include examples/textures — use GitHub CDN
const EARTH_BASE =
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets";
const TEX_COLOR = `${EARTH_BASE}/earth_atmos_2048.jpg`;
const TEX_NORMAL = `${EARTH_BASE}/earth_normal_2048.jpg`;
const TEX_SPECULAR = `${EARTH_BASE}/earth_specular_2048.jpg`;
const TEX_CLOUDS = `${EARTH_BASE}/earth_clouds_1024.png`;

// ─── Port data (real lat/lon) ────────────────────────────────────────────────
const PORTS = [
  { id: "ben-nha-rong", name: "Bến Nhà Rồng", lat: 10.768, lon: 106.703, year: "1911", color: "#FFD700" },
  { id: "marseille",    name: "Marseille",     lat: 43.297, lon:   5.370, year: "1911", color: "#C8102E" },
  { id: "new-york",     name: "New York",      lat: 40.713, lon: -74.006, year: "1912", color: "#C8102E" },
  { id: "london",       name: "London",        lat: 51.507, lon:  -0.128, year: "1913", color: "#C8102E" },
  { id: "paris",        name: "Paris",         lat: 48.857, lon:   2.352, year: "1917–1923", color: "#C8102E" },
  { id: "lien-xo",      name: "Liên Xô",       lat: 55.756, lon:  37.617, year: "1923–1924", color: "#FFD700" },
  { id: "quang-chau",   name: "Quảng Châu",    lat: 23.129, lon: 113.264, year: "1924–1927", color: "#FFD700" },
];

// ─── Historical route waypoints [lat, lon] — sea via Suez, land via Trans-Siberian ──
// Each leg corresponds to consecutive PORTS. Waypoints follow real geography so arcs
// stay over water on sea legs and over land on rail legs.
const ROUTE_LEGS: [number, number][][] = [
  // Leg 1: Bến Nhà Rồng → Marseille (1911, SEA via Suez Canal on Latouche-Tréville)
  [
    [10.77, 106.70],   // Saigon
    [3.50, 105.00],    // South China Sea
    [1.30, 103.85],    // Singapore
    [5.93,  79.86],    // Colombo (Sri Lanka)
    [12.78, 45.04],    // Aden
    [20.00, 38.50],    // Red Sea
    [31.27, 32.30],    // Port Said (Suez exit)
    [34.00, 25.00],    // East Mediterranean
    [37.50, 11.00],    // South of Sicily
    [41.00,  8.00],    // West of Sardinia
    [43.30,  5.37],    // Marseille
  ],
  // Leg 2: Marseille → New York (1911–1912, SEA via Gibraltar across Atlantic)
  [
    [43.30,   5.37],   // Marseille
    [38.00,   0.00],   // West Mediterranean
    [36.14,  -5.34],   // Gibraltar Strait
    [37.00, -12.00],   // Off Portugal
    [39.00, -25.00],   // Azores area
    [41.00, -45.00],   // Mid Atlantic
    [41.00, -60.00],   // West Atlantic
    [40.71, -74.01],   // New York
  ],
  // Leg 3: New York → London (1913, SEA across North Atlantic)
  [
    [40.71, -74.01],   // New York
    [44.00, -55.00],   // Atlantic
    [50.00, -35.00],   // North Atlantic
    [52.00, -15.00],   // Approaching UK
    [51.51,  -0.13],   // London
  ],
  // Leg 4: London → Paris (1917, SEA across Channel + LAND)
  [
    [51.51, -0.13],    // London
    [51.00,  1.40],    // Dover Strait
    [50.95,  1.85],    // Calais
    [49.55,  2.31],    // Northern France
    [48.86,  2.35],    // Paris
  ],
  // Leg 5: Paris → Liên Xô/Moscow (1923, LAND by train through Europe)
  [
    [48.86,  2.35],    // Paris
    [50.85,  4.35],    // Brussels
    [52.52, 13.40],    // Berlin
    [52.23, 21.01],    // Warsaw
    [53.90, 27.57],    // Minsk
    [55.76, 37.62],    // Moscow
  ],
  // Leg 6: Moscow → Quảng Châu (1924, LAND Trans-Siberian + China rail)
  [
    [55.76,  37.62],   // Moscow
    [56.84,  60.61],   // Yekaterinburg (cross Urals)
    [55.04,  82.93],   // Novosibirsk
    [52.29, 104.30],   // Irkutsk
    [47.92, 106.92],   // Ulaanbaatar
    [39.90, 116.40],   // Beijing
    [30.59, 114.31],   // Wuhan
    [23.13, 113.26],   // Guangzhou
  ],
];

// ─── Vietnamese territories (always shown, not part of the journey) ─────────
const VN_TERRITORIES = [
  { id: "phu-quoc",  name: "Phú Quốc",  lat: 10.227, lon: 103.961 },
  { id: "hoang-sa",  name: "Hoàng Sa",  lat: 16.500, lon: 112.000 },
  { id: "truong-sa", name: "Trường Sa", lat:  9.700, lon: 114.000 },
];

const RADIUS = 2;

function latLonToVec3(lat: number, lon: number, r = RADIUS): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

function arcPoints(
  from: [number, number, number],
  to: [number, number, number],
  steps = 64,
  lift = 0.38,
): THREE.Vector3[] {
  const vFrom = new THREE.Vector3(...from);
  const vTo = new THREE.Vector3(...to);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = new THREE.Vector3().lerpVectors(vFrom, vTo, t);
    p.normalize().multiplyScalar(RADIUS + lift * Math.sin(Math.PI * t));
    pts.push(p);
  }
  return pts;
}

// ─── Realistic Earth (textured) + clouds layer ──────────────────────────────
// Earth itself does NOT self-rotate — OrbitControls.autoRotate moves the camera
// so Earth, port markers, and route arcs all stay locked together visually.
// Only the cloud layer has its own slow drift for atmospheric effect.
function RealEarth() {
  const cloudsRef = useRef<THREE.Mesh>(null);

  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(
    THREE.TextureLoader,
    [TEX_COLOR, TEX_NORMAL, TEX_SPECULAR, TEX_CLOUDS],
  );

  useEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.anisotropy = 8;
    cloudsMap.anisotropy = 4;
  }, [colorMap, cloudsMap]);

  useFrame((_, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.02;
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.45, 0.45)}
          specularMap={specularMap}
          specular={new THREE.Color(0x88aacc)}
          shininess={14}
          emissive={new THREE.Color(0x1a3a5c)}
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[RADIUS * 1.008, 48, 48]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ─── Fallback sphere shown while Earth textures load ────────────────────────
function FallbackEarth() {
  return (
    <mesh>
      <sphereGeometry args={[RADIUS, 32, 32]} />
      <meshBasicMaterial color="#0e2240" />
    </mesh>
  );
}

// ─── Atmosphere — Fresnel glow shader ───────────────────────────────────────
function Atmosphere() {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(0x88c4ff) },
      coeficient: { value: 0.65 },
      power: { value: 2.0 },
    }),
    [],
  );

  return (
    <mesh>
      <sphereGeometry args={[RADIUS * 1.05, 64, 64]} />
      <shaderMaterial
        side={THREE.BackSide}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vVertexWorldPosition;
          varying vec3 vVertexNormal;
          void main() {
            vVertexNormal = normalize(normalMatrix * normal);
            vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 glowColor;
          uniform float coeficient;
          uniform float power;
          varying vec3 vVertexNormal;
          varying vec3 vVertexWorldPosition;
          void main() {
            vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
            vec3 viewCameraToVertex = (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
            viewCameraToVertex = normalize(viewCameraToVertex);
            float intensity = coeficient + dot(vVertexNormal, viewCameraToVertex);
            intensity = pow(max(intensity, 0.0), power);
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
          }
        `}
      />
    </mesh>
  );
}

// ─── Route arcs (red traveled / gold current / dim future) ──────────────────
// Build a smooth path through historical waypoints, hugging just above the globe
// surface (so sea legs stay over water, land legs stay over land).
function legPath(legPoints: [number, number][], stepsPerSegment = 18): THREE.Vector3[] {
  const waypoints = legPoints.map(
    ([lat, lon]) => new THREE.Vector3(...latLonToVec3(lat, lon)),
  );
  const pts: THREE.Vector3[] = [];
  const SURFACE_LIFT = 0.035; // tiny constant lift so the line doesn't z-fight the globe texture
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    for (let j = 0; j <= stepsPerSegment; j++) {
      // Skip first point of subsequent segments to avoid duplicate vertices
      if (i > 0 && j === 0) continue;
      const t = j / stepsPerSegment;
      const p = new THREE.Vector3().lerpVectors(a, b, t);
      p.normalize().multiplyScalar(RADIUS + SURFACE_LIFT);
      pts.push(p);
    }
  }
  return pts;
}

function RouteArcs({ activeIdx }: { activeIdx: number }) {
  const legPaths = useMemo(() => ROUTE_LEGS.map((leg) => legPath(leg)), []);

  return (
    <group>
      {legPaths.map((pts, i) => {
        const done = i < activeIdx;
        const current = i === activeIdx - 1;
        return (
          <Line
            key={i}
            points={pts}
            color={current ? "#FFD700" : done ? "#FF3346" : "#6e8aae"}
            lineWidth={current ? 2.8 : done ? 2.0 : 1.1}
            transparent
            opacity={current ? 1 : done ? 0.85 : 0.35}
          />
        );
      })}
    </group>
  );
}

// ─── Port markers (with halo for visibility on textured globe) ──────────────
function PortMarkers({
  activeIdx,
  onHover,
}: {
  activeIdx: number;
  onHover: (i: number | null) => void;
}) {
  const positions = useMemo(
    () => PORTS.map((p) => latLonToVec3(p.lat, p.lon)),
    [],
  );

  return (
    <>
      {PORTS.map((port, i) => {
        const reached = i <= activeIdx;
        const [x, y, z] = positions[i];
        const outward = new THREE.Vector3(x, y, z).normalize();

        return (
          <group key={port.id} position={[x, y, z]}>
            {/* Outer halo (additive) for visibility against busy texture */}
            {reached && (
              <mesh>
                <sphereGeometry args={[0.085, 16, 16]} />
                <meshBasicMaterial
                  color={port.color}
                  transparent
                  opacity={0.35}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            )}

            {/* Core dot */}
            <mesh
              onPointerEnter={() => onHover(i)}
              onPointerLeave={() => onHover(null)}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={reached ? port.color : "#3a4a68"} />
            </mesh>

            {/* Pulse ring tangent to surface */}
            {reached && (
              <mesh
                rotation={[
                  Math.atan2(
                    Math.sqrt(outward.x * outward.x + outward.z * outward.z),
                    outward.y,
                  ),
                  Math.atan2(outward.x, outward.z),
                  0,
                ]}
              >
                <torusGeometry args={[0.1, 0.01, 8, 32]} />
                <meshBasicMaterial
                  color={port.color}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            )}

            {/* Label */}
            {reached && (
              <Html
                position={[outward.x * 0.32, outward.y * 0.32, outward.z * 0.32]}
                distanceFactor={5}
                style={{ pointerEvents: "none" }}
              >
                <div
                  style={{
                    background: "rgba(10,18,32,0.92)",
                    border: `1px solid ${port.color}66`,
                    borderRadius: 8,
                    padding: "3px 8px",
                    whiteSpace: "nowrap",
                    backdropFilter: "blur(10px)",
                    boxShadow: `0 0 12px ${port.color}33`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      color: port.color,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {port.name}
                  </p>
                  <p
                    style={{
                      fontSize: 8,
                      color: "rgba(255,255,255,0.55)",
                      fontStyle: "italic",
                    }}
                  >
                    {port.year}
                  </p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

// ─── Vietnamese territory markers (Phú Quốc, Hoàng Sa, Trường Sa) ───────────
function VnTerritoryMarkers() {
  const positions = useMemo(
    () => VN_TERRITORIES.map((t) => latLonToVec3(t.lat, t.lon)),
    [],
  );

  return (
    <>
      {VN_TERRITORIES.map((t, i) => {
        const [x, y, z] = positions[i];
        const outward = new THREE.Vector3(x, y, z).normalize();

        // Phú Quốc: move label WEST (geographic) on the globe — west tangent vector.
        // East tangent ∝ (z, 0, -x), so west = (-z, 0, x), normalized.
        const west = new THREE.Vector3(-z, 0, x).normalize();
        const labelPos: [number, number, number] =
          t.id === "phu-quoc"
            ? [outward.x * 0.22 + west.x * 0.32, outward.y * 0.22, outward.z * 0.22 + west.z * 0.32]
            : [outward.x * 0.22, outward.y * 0.22, outward.z * 0.22];

        return (
          <group key={t.id} position={[x, y, z]}>
            {/* Soft halo */}
            <mesh>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial
                color="#FFD700"
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Core dot */}
            <mesh>
              <sphereGeometry args={[0.022, 12, 12]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>

            {/* Label */}
            <Html
              position={labelPos}
              distanceFactor={6}
              style={{ pointerEvents: "none" }}
            >
              <div
                style={{
                  background: "rgba(200,16,46,0.85)",
                  border: "1px solid rgba(255,215,0,0.6)",
                  borderRadius: 6,
                  padding: "2px 7px",
                  whiteSpace: "nowrap",
                  fontSize: 9,
                  color: "#FFD700",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  boxShadow: "0 0 10px rgba(255,215,0,0.25)",
                }}
              >
                {t.name}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

// ─── Scene composition ──────────────────────────────────────────────────────
function GlobeScene({
  activeIdx,
  onHover,
}: {
  activeIdx: number;
  onHover: (i: number | null) => void;
}) {
  return (
    <>
      {/* Display-globe lighting: even illumination, no harsh day/night terminator */}
      <ambientLight intensity={1.1} color="#cfe2ff" />
      {/* Hemisphere — cool blue sky tint above, warm earth tint below */}
      <hemisphereLight args={["#9ec8ff", "#5a4a38", 0.85]} />
      {/* Soft key light — just enough to give subtle modeling/shadow on terrain */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={0.55}
        color="#ffffff"
      />
      {/* Fill light from opposite side keeps the back hemisphere bright */}
      <directionalLight
        position={[-5, -1, -4]}
        intensity={0.4}
        color="#a8c8f0"
      />

      <Stars radius={14} depth={8} count={900} factor={2.8} fade speed={0.4} />

      <Suspense fallback={<FallbackEarth />}>
        <RealEarth />
      </Suspense>

      <Atmosphere />
      <RouteArcs activeIdx={activeIdx} />
      <PortMarkers activeIdx={activeIdx} onHover={onHover} />
      <VnTerritoryMarkers />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.35}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
      />
    </>
  );
}

interface Props {
  activePortIdx?: number;
}

export function GlobeMap({ activePortIdx = 0 }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "1 / 1", maxWidth: 520, margin: "0 auto" }}
    >
      <Canvas
        camera={{ position: [0, 1.0, 5.4], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              console.warn("[Globe] WebGL context lost — will attempt restore");
            },
            false,
          );
          canvas.addEventListener(
            "webglcontextrestored",
            () => console.info("[Globe] WebGL context restored"),
            false,
          );
        }}
      >
        <GlobeScene activeIdx={activePortIdx} onHover={setHovered} />
      </Canvas>

      {hovered !== null && (
        <div
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2 text-center"
          style={{
            background: "rgba(10,18,32,0.92)",
            border: "1px solid rgba(200,16,46,0.45)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          }}
        >
          <p
            className="font-cinzel text-xs font-bold"
            style={{ color: PORTS[hovered].color }}
          >
            {PORTS[hovered].name}
          </p>
          <p className="font-cinzel text-[10px] text-white/55">
            {PORTS[hovered].year}
          </p>
        </div>
      )}

      <p className="absolute bottom-2 right-3 font-cinzel text-[9px] uppercase tracking-widest text-white/25">
        Kéo để xoay · Hover để xem
      </p>
    </div>
  );
}
