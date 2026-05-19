"use client";

import { animate, motion } from "framer-motion";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { cinematicEase } from "@/animations/transitions";
import { VOYAGE_ROUTE_LEGS } from "@/data/voyageRoutes";
import { WORLD_MAP_GEO_URL, VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import { LOCATION_FOCUS, WORLD_FOCUS } from "@/data/mapFocus";
import type { LocationId } from "@/types/voyage";
import type { MapFocus } from "@/data/mapFocus";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const MAP_WIDTH = 880;
const MAP_HEIGHT = 460;

const sorted = [...VOYAGE_LOCATIONS].sort((a, b) => a.order - b.order);

export const VoyageMap = memo(function VoyageMap({
  selectedId,
  cinematic = false,
  paused = false,
  legDurationMs = 1450,
  mapFocusDurationMs,
  onLegAnimationComplete,
  arrivalActive = false,
  lightingStopIndex = 0,
}: {
  selectedId: LocationId;
  cinematic?: boolean;
  paused?: boolean;
  legDurationMs?: number;
  mapFocusDurationMs?: number;
  onLegAnimationComplete?: () => void;
  arrivalActive?: boolean;
  /** 0–5 visual mood layer */
  lightingStopIndex?: number;
}) {
  const reduced = useReducedMotion();
  const focusMs = mapFocusDurationMs ?? (cinematic ? 2600 : 1350);
  const legMs = legDurationMs;
  const onCompleteRef = useRef(onLegAnimationComplete);
  onCompleteRef.current = onLegAnimationComplete;

  const [center, setCenter] = useState<[number, number]>(WORLD_FOCUS.center);
  const [zoom, setZoom] = useState(WORLD_FOCUS.zoom);
  const viewRef = useRef<MapFocus>(WORLD_FOCUS);
  const [shipCoord, setShipCoord] = useState<[number, number]>(
    sorted[0].coordinates,
  );
  const [shipAngle, setShipAngle] = useState(0);
  const shipCoordRef = useRef<[number, number]>(sorted[0].coordinates);
  const prevStopRef = useRef<LocationId>(sorted[0].id);

  const activeLegIndex = useMemo(
    () => Math.max(0, sorted.findIndex((loc) => loc.id === selectedId)),
    [selectedId],
  );

  const legOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 1; i < sorted.length; i++) {
      map.set(`${sorted[i - 1]!.id}-${sorted[i]!.id}`, i);
    }
    return map;
  }, []);

  const activeLegKey = useMemo(() => {
    if (activeLegIndex <= 0) return null;
    return `${sorted[activeLegIndex - 1]!.id}-${sorted[activeLegIndex]!.id}`;
  }, [activeLegIndex]);

  const activeLeg = useMemo(() => {
    const fromId = prevStopRef.current;
    const toId = selectedId;
    return VOYAGE_ROUTE_LEGS.find(
      (leg) => leg.from === fromId && leg.to === toId,
    );
  }, [selectedId]);

  const routeSegments = useMemo(() => {
    return VOYAGE_ROUTE_LEGS.flatMap((leg) =>
      leg.points.slice(0, -1).map((from, index) => ({
        from,
        to: leg.points[index + 1]!,
        legKey: `${leg.from}-${leg.to}`,
      })),
    );
  }, []);

  useEffect(() => {
    const targetFocus = LOCATION_FOCUS[selectedId];
    const from = viewRef.current;
    const controls = animate(
      {
        c0: from.center[0],
        c1: from.center[1],
        z: from.zoom,
      },
      {
        c0: targetFocus.center[0],
        c1: targetFocus.center[1],
        z: targetFocus.zoom,
      },
      {
        duration: focusMs / 1000,
        ease: cinematicEase,
        onUpdate: (l) => {
          setCenter([l.c0 as number, l.c1 as number]);
          setZoom(l.z as number);
        },
        onComplete: () => {
          viewRef.current = targetFocus;
        },
      },
    );

    return () => controls.stop();
  }, [selectedId, focusMs]);

  useEffect(() => {
    const toLoc = VOYAGE_LOCATIONS.find((x) => x.id === selectedId);
    if (!toLoc || paused) return;

    const points = activeLeg?.points ?? [shipCoordRef.current, toLoc.coordinates];
    const segmentLengths = points.slice(0, -1).map((point, idx) => {
      const next = points[idx + 1]!;
      const dx = next[0] - point[0];
      const dy = next[1] - point[1];
      return Math.hypot(dx, dy);
    });
    const totalLength = segmentLengths.reduce((sum, len) => sum + len, 0) || 1;

    const interpolate = (t: number) => {
      let distance = t * totalLength;
      for (let i = 0; i < segmentLengths.length; i++) {
        const segLength = segmentLengths[i]!;
        const start = points[i]!;
        const end = points[i + 1]!;
        if (distance <= segLength) {
          const ratio = segLength === 0 ? 0 : distance / segLength;
          const lon = start[0] + (end[0] - start[0]) * ratio;
          const lat = start[1] + (end[1] - start[1]) * ratio;
          const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
          return { coord: [lon, lat] as [number, number], angle };
        }
        distance -= segLength;
      }
      const last = points[points.length - 1]!;
      return { coord: last, angle: 0 };
    };

    const anim = animate(0, 1, {
      duration: legMs / 1000,
      ease: cinematicEase,
      onUpdate: (t) => {
        const { coord, angle } = interpolate(t);
        shipCoordRef.current = coord;
        setShipCoord(coord);
        setShipAngle((angle * 180) / Math.PI);
      },
      onComplete: () => {
        prevStopRef.current = selectedId;
        onCompleteRef.current?.();
      },
    });

    return () => anim.stop();
  }, [selectedId, legMs, paused, activeLeg]);

  const mood = useMemo(() => {
    const stops = [
      "from-amber-900/10 via-transparent to-ocean-deep/50",
      "from-sky-900/15 via-transparent to-ocean-deep/45",
      "from-slate-900/20 via-transparent to-ocean-deep/50",
      "from-indigo-900/15 via-transparent to-ocean-deep/45",
      "from-violet-900/12 via-transparent to-ocean-deep/50",
      "from-red-950/15 via-transparent to-ocean-deep/40",
    ];
    return stops[Math.min(Math.max(lightingStopIndex, 0), stops.length - 1)];
  }, [lightingStopIndex]);

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-glass-border bg-ocean-mid/40 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-md transition-[box-shadow] duration-[2s] ${
        cinematic ? "ring-1 ring-gold/20" : ""
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${mood}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(212,168,83,0.12),transparent_55%)]" />
      {cinematic ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ocean-deep/80 via-transparent to-fog"
          animate={reduced ? undefined : { opacity: [0.35, 0.55, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {cinematic ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute -left-1/4 top-[8%] h-8 w-[45%] rounded-full bg-parchment/[0.04] blur-xl"
              style={{ top: `${12 + i * 14}%` }}
              animate={
                reduced
                  ? undefined
                  : { x: ["-20%", "120%"], opacity: [0, 0.35, 0] }
              }
              transition={{
                duration: 28 + i * 6,
                repeat: Infinity,
                ease: "linear",
                delay: i * 4,
              }}
            />
          ))}
        </div>
      ) : null}
      {cinematic ? (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 18 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-parchment/30"
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${(i * 23) % 90}%`,
              }}
              animate={
                reduced
                  ? undefined
                  : { y: [0, -12, 0], opacity: [0.1, 0.45, 0.15] }
              }
              transition={{
                duration: 5 + (i % 4),
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      ) : null}
      {cinematic ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(232,201,122,0.08),transparent_55%)]"
          animate={reduced ? undefined : { opacity: [0.2, 0.45, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {cinematic ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[0, 1].map((i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute -left-1/3 top-[6%] h-24 w-[65%] rounded-full bg-parchment/[0.05] blur-2xl"
              style={{ top: `${6 + i * 14}%` }}
              animate={
                reduced
                  ? undefined
                  : { x: ["-15%", "120%"], opacity: [0, 0.45, 0] }
              }
              transition={{
                duration: 36 + i * 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      ) : null}
      {cinematic ? (
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-full text-ocean-glow/35"
          viewBox="0 0 1200 180"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            fill="currentColor"
            d="M0,108 C180,84 380,132 600,102 C820,72 1000,116 1200,90 L1200,180 L0,180 Z"
            animate={
              reduced
                ? undefined
                : {
                    d: [
                      "M0,108 C180,84 380,132 600,102 C820,72 1000,116 1200,90 L1200,180 L0,180 Z",
                      "M0,120 C200,96 390,122 600,114 C840,104 1010,92 1200,102 L1200,180 L0,180 Z",
                      "M0,108 C180,84 380,132 600,102 C820,72 1000,116 1200,90 L1200,180 L0,180 Z",
                    ],
                  }
            }
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      ) : null}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 165 }}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          minZoom={0.85}
          maxZoom={8}
        >
          <Geographies geography={WORLD_MAP_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo, geoIndex) => (
                <Geography
                  key={(geo as { rsmKey?: string }).rsmKey ?? `geo-${geoIndex}`}
                  geography={geo}
                  fill="url(#continentFill)"
                  stroke="rgba(212,168,83,0.08)"
                  strokeWidth={0.28}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#17314f" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          <defs>
            <linearGradient id="continentFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(24,54,89,0.8)" />
              <stop offset="100%" stopColor="rgba(9,24,44,0.9)" />
            </linearGradient>
            <filter id="coastGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="routeGlow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(212,168,83,0.05)" />
              <stop offset="50%" stopColor="rgba(212,168,83,0.85)" />
              <stop offset="100%" stopColor="rgba(212,168,83,0.05)" />
            </linearGradient>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {routeSegments.map((seg, i) => {
            const legIndex = legOrderMap.get(seg.legKey) ?? 0;
            const isActiveLeg = activeLegKey === seg.legKey;
            const isPastLeg = legIndex > 0 && legIndex < activeLegIndex;

            return (
              <g
                key={`${seg.from.join(",")}-${i}`}
                opacity={cinematic ? 0.95 : 0.78}
              >
                <Line
                  from={seg.from}
                  to={seg.to}
                  stroke={
                    isPastLeg
                      ? "rgba(212,168,83,0.28)"
                      : "rgba(212,168,83,0.14)"
                  }
                  strokeWidth={cinematic ? 6.4 : 5.2}
                  strokeLinecap="round"
                />
                <Line
                  from={seg.from}
                  to={seg.to}
                  stroke={
                    isActiveLeg ? "rgba(232,201,122,0.98)" : "url(#routeGlow)"
                  }
                  strokeWidth={
                    isActiveLeg ? (cinematic ? 2.8 : 2.2) : cinematic ? 2.2 : 1.8
                  }
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {VOYAGE_LOCATIONS.map((loc) => {
            const isCurrent = loc.id === selectedId;
            const pulse = arrivalActive && isCurrent;
            return (
              <Marker key={loc.id} coordinates={loc.coordinates}>
                <g
                  className="pointer-events-none"
                  transform="translate(0,-2)"
                >
                  <motion.circle
                    r={pulse ? 12 : 6}
                    fill={pulse ? "rgba(212,168,83,0.5)" : "rgba(212,168,83,0.22)"}
                    animate={
                      pulse && !reduced
                        ? { r: [10, 16, 10], opacity: [0.35, 0.7, 0.35] }
                        : undefined
                    }
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <circle r={3.5} fill="rgba(255,255,255,0.65)" />
                </g>
              </Marker>
            );
          })}

          <Marker coordinates={shipCoord}>
            <g transform="translate(0, -6)">
              {cinematic ? (
                <motion.ellipse
                  rx="18"
                  ry="8"
                  fill="rgba(212,168,83,0.12)"
                  animate={
                    reduced
                      ? undefined
                      : { rx: [16, 22, 16], opacity: [0.15, 0.35, 0.15] }
                  }
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
              {cinematic ? (
                <motion.path
                  d="M-18 10 C-8 14 8 14 18 10"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                  animate={
                    reduced
                      ? undefined
                      : { opacity: [0.2, 0.45, 0.2], pathLength: [0.4, 1, 0.4] }
                  }
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
              <motion.g
                style={{
                  rotate: shipAngle,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
                animate={
                  reduced || !cinematic ? undefined : { rotate: [shipAngle - 3, shipAngle + 3, shipAngle] }
                }
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <circle r="10" fill="rgba(194,59,59,0.35)" />
                <path
                  d="M0,-14 L12,7 L0,3 L-12,7 Z"
                  fill="#d4a853"
                  stroke="#e8dcc4"
                  strokeWidth="1"
                />
              </motion.g>
            </g>
          </Marker>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
});
