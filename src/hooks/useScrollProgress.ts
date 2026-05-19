"use client";

import { useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

export function useScrollProgress(): {
  ref: React.RefObject<HTMLElement | null>;
  scrollYProgress: MotionValue<number>;
  smoothProgress: MotionValue<number>;
  fogOpacity: MotionValue<number>;
} {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
  });
  const fogOpacity = useTransform(smoothProgress, [0, 0.45, 1], [0.35, 0.55, 0.75]);

  return { ref, scrollYProgress, smoothProgress, fogOpacity };
}
