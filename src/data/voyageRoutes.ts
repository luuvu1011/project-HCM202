import type { LocationId } from "@/types/voyage";

type RoutePoint = [number, number];

export type RouteLeg = {
  from: LocationId;
  to: LocationId;
  /** Curved path points (lon, lat) used for ship motion and route glow. */
  points: RoutePoint[];
};

export const VOYAGE_ROUTE_LEGS: RouteLeg[] = [
  {
    from: "ben-nha-rong",
    to: "marseille",
    points: [
      [106.7026, 10.7682],
      [92, 18],
      [68, 30],
      [38, 39],
      [5.3698, 43.2965],
    ],
  },
  {
    from: "marseille",
    to: "new-york",
    points: [
      [5.3698, 43.2965],
      [-10, 46],
      [-35, 50],
      [-60, 48],
      [-74.006, 40.7128],
    ],
  },
  {
    from: "new-york",
    to: "london",
    points: [
      [-74.006, 40.7128],
      [-55, 48],
      [-30, 55],
      [-10, 56],
      [-0.1278, 51.5074],
    ],
  },
  {
    from: "london",
    to: "paris",
    points: [
      [-0.1278, 51.5074],
      [1, 50.2],
      [2.3522, 48.8566],
    ],
  },
  {
    from: "paris",
    to: "lien-xo",
    points: [
      [2.3522, 48.8566],
      [16, 52.5],
      [28, 55.5],
      [37.6173, 55.7558],
    ],
  },
  {
    from: "lien-xo",
    to: "quang-chau",
    points: [
      [37.6173, 55.7558],
      [55, 52],
      [75, 45],
      [95, 35],
      [113.2644, 23.1291],
    ],
  },
];
