"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cinematicEase } from "@/animations/transitions";

type Variant = "primary" | "ghost" | "subtle";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "rounded-full bg-gradient-to-r from-gold to-gold-soft px-8 py-3 text-ocean-deep font-semibold shadow-[0_0_40px_rgba(212,168,83,0.25)] hover:shadow-[0_0_56px_rgba(212,168,83,0.35)]",
  ghost:
    "rounded-full border border-glass-border bg-glass/40 px-6 py-2.5 text-parchment backdrop-blur-md hover:border-gold/50",
  subtle:
    "rounded-full bg-white/5 px-5 py-2 text-parchment-muted hover:bg-white/10 hover:text-parchment",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className = "", variant = "primary", ...props }, ref) {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.25, ease: cinematicEase }}
        className={`inline-flex items-center justify-center gap-2 text-sm tracking-wide transition-colors ${styles[variant]} ${className}`}
        {...props}
      />
    );
  },
);
