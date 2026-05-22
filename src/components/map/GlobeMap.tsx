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
// 11 chặng chính 1911-1941: từ Bến Nhà Rồng → vòng quanh thế giới → Pác Bó về nước.
// Nguồn: Hồ sơ Hồ Chí Minh — Viện Hồ Chí Minh & lãnh tụ Đảng; Trần Dân Tiên (1948).
const PORTS = [
  { id: "ben-nha-rong", name: "Bến Nhà Rồng", lat: 10.768, lon: 106.703, year: "5/6/1911",   color: "#FFD700" },
  { id: "marseille",    name: "Marseille",     lat: 43.297, lon:   5.370, year: "7/1911",     color: "#C8102E" },
  { id: "dakar",        name: "Dakar",         lat: 14.692, lon: -17.447, year: "1911–1912",  color: "#C8102E" },
  { id: "new-york",     name: "New York",      lat: 40.713, lon: -74.006, year: "1912–1913",  color: "#C8102E" },
  { id: "london",       name: "London",        lat: 51.507, lon:  -0.128, year: "1913–1917",  color: "#C8102E" },
  { id: "paris",        name: "Paris",         lat: 48.857, lon:   2.352, year: "1917–1923",  color: "#C8102E" },
  { id: "lien-xo",      name: "Liên Xô",       lat: 55.756, lon:  37.617, year: "1923–1924",  color: "#FFD700" },
  { id: "quang-chau",   name: "Quảng Châu",    lat: 23.129, lon: 113.264, year: "1924–1927",  color: "#FFD700" },
  { id: "bangkok",      name: "Bangkok",       lat: 13.756, lon: 100.501, year: "1928–1929",  color: "#C8102E" },
  { id: "hong-kong",    name: "Hồng Kông",     lat: 22.319, lon: 114.169, year: "3/2/1930",   color: "#FFD700" },
  { id: "pac-bo",       name: "Pác Bó",        lat: 22.810, lon: 106.040, year: "28/1/1941",  color: "#FFD700" },
];

// ─── Historical route waypoints [lat, lon] — sea via Suez, land via Trans-Siberian ──
// Each leg corresponds to consecutive PORTS. Waypoints follow real geography so arcs
// stay over water on sea legs and over land on rail legs.
const ROUTE_LEGS: [number, number][][] = [
  // Leg 1: Bến Nhà Rồng → Marseille (5/6/1911 – 6/7/1911, SEA — tàu Latouche-Tréville)
  // Tuyến qua Singapore, Colombo, Aden, kênh đào Suez (đi qua Hồng Hải, Địa Trung Hải).
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
  // Leg 2: Marseille → Dakar (cuối 1911 – 1912, SEA — tàu chạy dọc bờ Tây Phi)
  // Bác làm phụ bếp trên các tàu Pháp, đi qua nhiều cảng châu Phi: Tangier, Casablanca,
  // Nouakchott… Dakar là điểm dừng được Người ghi lại rõ nhất (chứng kiến đàn áp).
  [
    [43.30,   5.37],   // Marseille
    [37.50,  -0.50],   // West Med
    [35.89,  -5.32],   // Tangier (Morocco)
    [33.57,  -7.59],   // Casablanca
    [27.00, -13.00],   // Western Sahara coast
    [20.92, -17.07],   // Nouakchott (Mauritania)
    [14.69, -17.45],   // Dakar (Sénégal)
  ],
  // Leg 3: Dakar → New York (1912, SEA vượt Đại Tây Dương)
  [
    [14.69, -17.45],   // Dakar
    [16.00, -24.50],   // Cape Verde area
    [22.00, -40.00],   // South-mid Atlantic
    [28.00, -55.00],   // Mid Atlantic
    [33.00, -65.00],   // Off Bermuda
    [38.00, -72.00],   // Off New Jersey
    [40.71, -74.01],   // New York
  ],
  // Leg 4: New York → London (cuối 1913, SEA Bắc Đại Tây Dương)
  [
    [40.71, -74.01],   // New York
    [44.00, -55.00],
    [50.00, -35.00],
    [52.00, -15.00],
    [51.51,  -0.13],   // London
  ],
  // Leg 5: London → Paris (1917, SEA eo Manche + LAND)
  [
    [51.51, -0.13],    // London
    [51.00,  1.40],    // Dover Strait
    [50.95,  1.85],    // Calais
    [49.55,  2.31],
    [48.86,  2.35],    // Paris
  ],
  // Leg 6: Paris → Liên Xô / Moskva (6/1923, LAND — bí mật qua Đức, Ba Lan)
  [
    [48.86,  2.35],    // Paris
    [50.85,  4.35],    // Brussels
    [52.52, 13.40],    // Berlin
    [52.23, 21.01],    // Warsaw
    [53.90, 27.57],    // Minsk
    [55.76, 37.62],    // Moscow
  ],
  // Leg 7: Moskva → Quảng Châu (11/1924, LAND Đường sắt xuyên Siberia + Mãn Châu)
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
  // Leg 8: Quảng Châu → Bangkok (4/1927 – 7/1928, vòng đường lưu vong qua châu Âu)
  // Sau đảo chính Tưởng Giới Thạch, Người trốn khỏi Quảng Châu → Vladivostok → trở lại
  // Moskva → Berlin → Brussels → tàu thuỷ Ý → kênh Suez → Singapore → Bangkok.
  [
    [23.13, 113.26],   // Guangzhou
    [25.00, 121.00],   // Taiwan Strait (đi vòng tránh HK)
    [35.00, 130.00],   // East China Sea
    [43.13, 131.92],   // Vladivostok
    [56.00,  92.00],   // Trans-Siberian (Krasnoyarsk)
    [55.76,  37.62],   // Moscow (ghé qua)
    [52.52,  13.40],   // Berlin
    [50.85,   4.35],   // Brussels
    [44.41,   8.93],   // Genoa, Ý — lên tàu thuỷ
    [35.90,  14.51],   // Malta
    [31.27,  32.30],   // Port Said (Suez)
    [12.78,  45.04],   // Aden
    [5.93,   79.86],   // Colombo
    [1.30,  103.85],   // Singapore
    [13.75, 100.50],   // Bangkok
  ],
  // Leg 9: Bangkok → Hồng Kông (cuối 1929 – 3/2/1930, SEA về Đông Á)
  // Tới Hồng Kông để chủ trì Hội nghị hợp nhất ba tổ chức cộng sản, thành lập Đảng.
  [
    [13.75, 100.50],   // Bangkok
    [10.50, 104.50],   // Cambodia coast
    [15.00, 109.00],   // Off Vietnam coast
    [19.50, 111.00],   // Hainan Strait
    [22.32, 114.17],   // Hong Kong
  ],
  // Leg 10: Hồng Kông → Pác Bó (1930 – 28/1/1941, vòng dài: HK→Thượng Hải→Moskva→TQ→VN)
  // Bị Anh bắt giam ở HK (1931), thả 1933 → Hạ Môn → Thượng Hải → Vladivostok → Moskva
  // (học 1934-1938) → Diên An → Quế Lâm → Côn Minh → vượt biên giới Cao Bằng, Pác Bó.
  [
    [22.32, 114.17],   // Hong Kong (1930)
    [24.45, 118.08],   // Hạ Môn (Amoy)
    [31.23, 121.47],   // Shanghai (1933)
    [43.13, 131.92],   // Vladivostok
    [56.00,  92.00],   // Trans-Siberian
    [55.76,  37.62],   // Moscow (1934–1938)
    [55.04,  82.93],   // Novosibirsk (đi về phía Đông)
    [52.29, 104.30],   // Irkutsk
    [39.90, 116.40],   // Beijing
    [36.60, 109.49],   // Yan'an (Diên An, 1938)
    [25.27, 110.30],   // Quế Lâm (Guilin, 1939)
    [25.04, 102.72],   // Côn Minh (Kunming, 1940)
    [23.50, 105.30],   // Biên giới Trung – Việt
    [22.81, 106.04],   // Pác Bó (28/1/1941)
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

            {/* Label — apply per-port radial offset so HK/Quảng Châu and
                Pác Bó/Bến Nhà Rồng (cluster gần nhau) không chồng nhãn. */}
            {reached && (() => {
              // Tangent vectors on globe surface
              const east = new THREE.Vector3(outward.z, 0, -outward.x).normalize();
              const north = new THREE.Vector3()
                .crossVectors(outward, east)
                .normalize();
              const base: [number, number, number] = [
                outward.x * 0.32,
                outward.y * 0.32,
                outward.z * 0.32,
              ];
              let labelPos: [number, number, number] = base;
              if (port.id === "hong-kong") {
                // Đẩy nhãn HK xuống phía Đông-Nam để tách khỏi Quảng Châu
                labelPos = [
                  base[0] + east.x * 0.30 - north.x * 0.18,
                  base[1] + east.y * 0.30 - north.y * 0.18,
                  base[2] + east.z * 0.30 - north.z * 0.18,
                ];
              } else if (port.id === "pac-bo") {
                // Đẩy nhãn Pác Bó hơi lên trên-Tây để rõ ràng giáp biên giới
                labelPos = [
                  base[0] - east.x * 0.18 + north.x * 0.18,
                  base[1] - east.y * 0.18 + north.y * 0.18,
                  base[2] - east.z * 0.18 + north.z * 0.18,
                ];
              } else if (port.id === "quang-chau") {
                // Đẩy QC lên Bắc để tách khỏi HK
                labelPos = [
                  base[0] + north.x * 0.22,
                  base[1] + north.y * 0.22,
                  base[2] + north.z * 0.22,
                ];
              }
              return (
              <Html
                position={labelPos}
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
              );
            })()}
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
