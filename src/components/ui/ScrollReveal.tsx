"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { fadeUp } from "@/animations/variants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-12% 0px", amount: 0.25 });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial={reduced ? false : "hidden"}
      animate={reduced ? undefined : inView ? "visible" : "hidden"}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}
