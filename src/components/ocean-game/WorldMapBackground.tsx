'use client';

import { memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';

// World topology — country borders from CDN (110m resolution = lightweight)
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO numeric IDs of countries on Nguyễn Tất Thành's journey
const JOURNEY_IDS = new Set([
  '704', // Việt Nam
  '250', // Pháp
  '826', // Anh
  '643', // Liên Xô / Nga
  '156', // Trung Quốc
  '840', // Hoa Kỳ (New York)
]);

interface Props {
  currentPhase?: number;
}

// Projection config: equirectangular centred on the journey corridor
// Longitude ~(-10° → 125°), Latitude ~(5° → 60°)
// Mở rộng để show cả Mỹ (New York) đến Việt Nam
// Longitude trải dài từ -82°W đến 142°E → centre ≈ 30°E, lat ≈ 32°N
const PROJ_CONFIG = {
  rotate: [-30, -30, 0] as [number, number, number],
  scale:  160,
};

export const WorldMapBackground = memo(function WorldMapBackground({ currentPhase = 0 }: Props) {
  return (
    <div
      className="absolute inset-0 z-5 select-none"
      style={{ pointerEvents: 'none' }}
    >
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={PROJ_CONFIG}
        width={1000}
        height={560}
        style={{ width: '100%', height: '100%' }}
      >
        {/* ── Countries ── */}
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isJourney = JOURNEY_IDS.has(String(geo.id));
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill:        isJourney
                        ? 'rgba(196,138,40,0.11)'
                        : 'rgba(180,200,220,0.045)',
                      stroke:      isJourney
                        ? 'rgba(196,138,40,0.28)'
                        : 'rgba(180,200,220,0.10)',
                      strokeWidth: isJourney ? 0.6 : 0.35,
                      outline:     'none',
                    },
                    hover:   { fill: 'rgba(196,138,40,0.11)', outline: 'none' },
                    pressed: { fill: 'rgba(196,138,40,0.11)', outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* ── Vignette over the map edges so it blends into ocean ── */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 50%, rgba(6,9,16,0.75) 100%)',
        }}
      />
    </div>
  );
});
