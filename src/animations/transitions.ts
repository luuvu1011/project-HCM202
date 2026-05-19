import type { Transition } from "framer-motion";

export const cinematicEase: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

export const softSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 22,
  mass: 0.9,
};

export const mapSpring: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 20,
  mass: 1,
};
