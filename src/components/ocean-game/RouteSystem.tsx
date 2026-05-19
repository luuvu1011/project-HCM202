'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GAME_PHASES } from '@/data/gamePhases';

// ── Map projection (equirectangular, tuned for viewport) ───────────────────
// Viewbox: maps the world onto the screen
// Lng -180..180 → 0..W, Lat 75..-30 → 0..H (Atlantic-Pacific centered)
// Mở rộng sang Tây để bao gồm New York (-74°W)
const MAP_BOUNDS = { lngMin: -82, lngMax: 142, latMax: 65, latMin: 0 };

export function lngLatToPercent(lat: number, lng: number): { x: number; y: number } {
  const { lngMin, lngMax, latMax, latMin } = MAP_BOUNDS;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const y = ((latMax - lat)  / (latMax - latMin)) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

interface Props {
  currentPhase: number;
  completedPhases: number;
}

export function RouteSystem({ currentPhase, completedPhases }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const stops = GAME_PHASES.map((p) => ({
    ...p,
    pos: lngLatToPercent(p.coordinates[0], p.coordinates[1]),
  }));

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-soft">
          <feGaussianBlur stdDeviation="0.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrow" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5" orient="auto">
          <path d="M0,0 L3,1.5 L0,3 L0.8,1.5 Z" fill="rgba(196,138,40,0.6)" />
        </marker>
      </defs>

      {/* ── Route segments ── */}
      {stops.slice(0, -1).map((stop, i) => {
        const next    = stops[i + 1];
        const done    = i < completedPhases;
        const active  = i === currentPhase;
        const future  = i > currentPhase;

        // Curved path via control point
        const mx = (stop.pos.x + next.pos.x) / 2;
        const my = (stop.pos.y + next.pos.y) / 2 - 6;

        return (
          <g key={i}>
            {/* Glow halo */}
            {(done || active) && (
              <path
                d={`M ${stop.pos.x} ${stop.pos.y} Q ${mx} ${my} ${next.pos.x} ${next.pos.y}`}
                fill="none"
                stroke="rgba(196,138,40,0.15)"
                strokeWidth={active ? '1.5' : '0.8'}
                strokeLinecap="round"
                filter="url(#glow-gold)"
              />
            )}
            {/* Main route line */}
            <path
              d={`M ${stop.pos.x} ${stop.pos.y} Q ${mx} ${my} ${next.pos.x} ${next.pos.y}`}
              fill="none"
              stroke={
                done   ? 'rgba(196,138,40,0.55)' :
                active ? 'rgba(255,200,60,0.35)' :
                         'rgba(255,255,255,0.06)'
              }
              strokeWidth={active ? '0.4' : done ? '0.35' : '0.2'}
              strokeLinecap="round"
              strokeDasharray={future ? '0.8 1.2' : undefined}
            />
            {/* Animated travelling dot on active segment */}
            {active && (
              <AnimatedDot
                d={`M ${stop.pos.x} ${stop.pos.y} Q ${mx} ${my} ${next.pos.x} ${next.pos.y}`}
              />
            )}
          </g>
        );
      })}

      {/* ── Stop dots ── */}
      {stops.map((stop, i) => {
        const done    = i < completedPhases;
        const active  = i === currentPhase;
        const future  = i > currentPhase;

        return (
          <g key={stop.id} filter={active ? 'url(#glow-gold)' : undefined}>
            {/* Outer pulse ring */}
            {active && (
              <circle
                cx={stop.pos.x} cy={stop.pos.y}
                r="2.2"
                fill="none"
                stroke={stop.accentColor}
                strokeWidth="0.3"
                opacity="0.5"
              />
            )}
            {/* Main dot */}
            <circle
              cx={stop.pos.x} cy={stop.pos.y}
              r={active ? 1.2 : done ? 0.8 : 0.5}
              fill={
                active ? stop.accentColor :
                done   ? 'rgba(196,138,40,0.7)' :
                         'rgba(255,255,255,0.15)'
              }
            />
            {/* Inner bright core */}
            {(active || done) && (
              <circle
                cx={stop.pos.x} cy={stop.pos.y}
                r={active ? 0.4 : 0.25}
                fill="rgba(255,240,200,0.9)"
              />
            )}
            {/* Label */}
            <text
              x={stop.pos.x}
              y={stop.pos.y - 1.8}
              textAnchor="middle"
              fontSize={active ? '1.4' : '1.0'}
              fontWeight={active ? 'bold' : 'normal'}
              fill={
                active ? stop.accentColor :
                done   ? 'rgba(196,138,40,0.55)' :
                         'rgba(255,255,255,0.18)'
              }
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {stop.name}
            </text>
            {active && (
              <text
                x={stop.pos.x} y={stop.pos.y - 3.2}
                textAnchor="middle"
                fontSize="1.1"
                fill="rgba(232,210,168,0.45)"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {stop.year}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Tiny SVG dot that travels along a path
function AnimatedDot({ d }: { d: string }) {
  return (
    <g>
      <circle r="0.35" fill="rgba(255,220,80,0.9)">
        <animateMotion dur="3s" repeatCount="indefinite" path={d} />
      </circle>
      <circle r="0.6" fill="rgba(255,200,40,0.25)">
        <animateMotion dur="3s" repeatCount="indefinite" path={d} />
      </circle>
    </g>
  );
}
