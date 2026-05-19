import type { LocationId } from "@/types/voyage";

export interface MapFocus {
  center: [number, number];
  zoom: number;
}

export const WORLD_FOCUS: MapFocus = {
  center: [12, 28],
  zoom: 1.35,
};

export const LOCATION_FOCUS: Record<LocationId, MapFocus> = {
  "ben-nha-rong": { center: [106.75, 11.2], zoom: 4.6 },
  marseille: { center: [5.37, 43.35], zoom: 4.6 },
  london: { center: [-0.1, 51.52], zoom: 4.6 },
  "new-york": { center: [-74.01, 40.74], zoom: 4.6 },
  paris: { center: [2.35, 48.88], zoom: 4.6 },
  "lien-xo": { center: [37.62, 55.78], zoom: 4.6 },
  "quang-chau": { center: [113.27, 23.13], zoom: 4.6 },
};
