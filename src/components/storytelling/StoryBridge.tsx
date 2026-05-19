"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { StoryBridgeContent } from "@/data/storyBridges";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StoryBridgeProps {
  content: StoryBridgeContent;
}

export function StoryBridge({ content }: StoryBridgeProps) {
  const outerRef   = useRef<HTMLDivElement | null>(null);
  const bgRef      = useRef<HTMLDivElement | null>(null);
  const textRef    = useRef<HTMLDivElement | null>(null);
  const reduced    = useReducedMotion();

  // Framer Motion parallax for the CSS radial-gradient blob
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start end", "end start"],
  });
  const fog   = useTransform(scrollYProgress, [0, 0.45, 1], [0.45, 0.90, 0.45]);
  const blobX = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -24]);

  // GSAP ScrollTrigger — subtle parallax on background plane + reveal text
  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Background depth parallax
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: -55,
          ease: "none",
          scrollTrigger: {
            trigger: outerRef.current,
            start: "top bottom",
            end:   "bottom top",
            scrub: 1.2,
          },
        });
      }

      // Cinematic text stagger on scroll-into-view
      if (textRef.current) {
        const items = textRef.current.querySelectorAll("[data-bridge-item]");
        gsap.set(items, { opacity: 0, y: 36 });
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      }
    });

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={outerRef}
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* ── Background layers ── */}
      <div ref={bgRef} className="absolute inset-[-6%] will-change-transform">
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ opacity: reduced ? 0.8 : fog }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-deep via-ocean-mid/85 to-ocean-deep" />
        </motion.div>

        {/* Moving radial glow blob */}
        <motion.div
          aria-hidden
          className="absolute -left-1/3 top-1/2 h-[160%] w-[200%] -translate-y-1/2"
          style={{
            x: blobX,
            background:
              "radial-gradient(ellipse at center, rgba(26,75,124,0.38), transparent 62%)",
          }}
        />

        {/* Red accent — narrative tension */}
        <div
          className="pointer-events-none absolute -right-1/4 top-1/4 h-[70%] w-[60%]"
          style={{
            background: "radial-gradient(ellipse at 70% 40%, rgba(194,59,59,0.06), transparent 60%)",
          }}
        />
      </div>

      {/* Animated wave path at bottom */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 w-[200%] text-gold/[0.06] sm:w-full"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          fill="currentColor"
          d="M0,60 C220,40 420,80 720,55 C1020,30 1220,70 1440,50 L1440,100 L0,100 Z"
          animate={
            reduced
              ? undefined
              : {
                  d: [
                    "M0,60 C220,40 420,80 720,55 C1020,30 1220,70 1440,50 L1440,100 L0,100 Z",
                    "M0,66 C245,50 445,74 742,60 C1040,46 1202,66 1440,56 L1440,100 L0,100 Z",
                    "M0,60 C220,40 420,80 720,55 C1020,30 1220,70 1440,50 L1440,100 L0,100 Z",
                  ],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Top wave — mirrors bottom */}
      <svg
        className="pointer-events-none absolute top-0 left-0 w-[200%] rotate-180 text-gold/[0.04] sm:w-full"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          fill="currentColor"
          d="M0,35 C280,20 520,50 760,32 C1000,14 1220,44 1440,28 L1440,60 L0,60 Z"
          animate={
            reduced
              ? undefined
              : {
                  d: [
                    "M0,35 C280,20 520,50 760,32 C1000,14 1220,44 1440,28 L1440,60 L0,60 Z",
                    "M0,40 C290,28 530,46 768,36 C1010,26 1215,42 1440,33 L1440,60 L0,60 Z",
                    "M0,35 C280,20 520,50 760,32 C1000,14 1220,44 1440,28 L1440,60 L0,60 Z",
                  ],
                }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* ── Cinematic content ── */}
      <div ref={textRef} className="relative z-10 mx-auto max-w-2xl px-6 text-center sm:px-10">

        {/* Era label */}
        <p
          data-bridge-item
          className="text-[10px] font-semibold uppercase tracking-[0.42em] text-gold/80 sm:text-[11px]"
        >
          {content.era}
        </p>

        {/* Divider */}
        <div data-bridge-item className="vv-divider mx-auto mt-5" />

        {/* Narration */}
        <p
          data-bridge-item
          className="mt-6 text-[17px] leading-[1.75] text-parchment-muted sm:text-[19px] sm:leading-[1.8]"
        >
          {content.narration}
        </p>

        {/* Emphasis quote — cinematic pull quote */}
        <div
          data-bridge-item
          className="relative mx-auto mt-10 max-w-xl"
        >
          {/* Decorative quote marks */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-4 -top-6 font-display text-[5rem] leading-none text-gold/12 sm:-left-6 sm:text-[6rem]"
          >
            "
          </span>
          <blockquote className="vv-story-emphasis">
            <p className="font-display text-[1.35rem] italic leading-[1.45] text-gold-soft sm:text-[1.55rem] sm:leading-[1.42]">
              {content.emphasis}
            </p>
          </blockquote>
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-8 -right-4 font-display text-[5rem] leading-none text-gold/12 sm:-right-6 sm:text-[6rem]"
          >
            "
          </span>
        </div>

      </div>
    </div>
  );
}
