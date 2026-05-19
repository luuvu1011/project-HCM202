"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { VOYAGE_LOCATIONS } from "@/data/voyageLocations";
import type { PortId } from "@/lib/atmospheres";
import { signalImmersiveEnter, signalImmersiveLeave } from "@/lib/immersiveMode";

// ─── Data: the 5 arrival ports (departure excluded) ───────────────────────
const ARRIVAL_PORTS = VOYAGE_LOCATIONS.filter(
  (l) => l.id !== "ben-nha-rong",
);

// Port labels (era / geographic subtitle)
const PORT_LABELS: Record<string, string> = {
  marseille:  "Địa Trung Hải · 1911",
  london:     "Sương mù công nghiệp · 1913",
  "new-york": "Tân Thế Giới · 1912",
  paris:      "Thủ đô tư tưởng · 1917–1923",
  "lien-xo":  "Ngọn đuốc lý luận · 1923",
};

// How far through the overall scroll this section spans (for scroll-hint copy)
const PORT_ORDER_LABELS = ["Cảng thứ nhất", "Cảng thứ hai", "Cảng thứ ba", "Cảng thứ tư", "Cảng cuối"];

// ─── Single Port Scene ────────────────────────────────────────────────────

interface PortSceneProps {
  location: (typeof VOYAGE_LOCATIONS)[number];
  index: number;
  reduced: boolean;
}

function PortScene({ location, index, reduced }: PortSceneProps) {
  const outerRef  = useRef<HTMLDivElement | null>(null);
  const innerRef  = useRef<HTMLDivElement | null>(null);
  const tlRef     = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const items = inner.querySelectorAll("[data-port-item]");
    const divider = inner.querySelector("[data-port-divider]");

    // ── Initial hidden state ──────────────────────────────────────────────
    if (!reduced) {
      gsap.set(items, { opacity: 0, y: 30 });
      if (divider) gsap.set(divider, { scaleX: 0, transformOrigin: "center" });
    }

    // ── Pin the inner content for the duration of the outer div ───────────
    const pin = ScrollTrigger.create({
      trigger: outer,
      start: "top top",
      end: "bottom top",
      pin: inner,
      pinSpacing: false,
      anticipatePin: 1,
      onEnter:     () => signalImmersiveEnter(location.id),
      onLeave:     () => signalImmersiveLeave(location.id),
      onLeaveBack: () => signalImmersiveLeave(location.id),
      onEnterBack: () => signalImmersiveEnter(location.id),
    });

    // ── Entrance animation on scroll into view ────────────────────────────
    const enterTrigger = ScrollTrigger.create({
      trigger: outer,
      start: "top 85%",
      onEnter: () => {
        if (reduced) return;
        tlRef.current?.kill();
        const tl = gsap.timeline();
        tlRef.current = tl;

        // Scoped to this inner element — avoids bleeding into other port scenes
        tl.to(items, {
            opacity: 1, y: 0,
            duration: 0.85, stagger: 0.12, ease: "power3.out",
          }, 0)
          .to(divider, {
            scaleX: 1, duration: 0.7, ease: "power2.inOut",
          }, 0.18);
      },
      onLeaveBack: () => {
        if (reduced) return;
        tlRef.current?.kill();
        gsap.set(items, { opacity: 0, y: 30 });
        if (divider) gsap.set(divider, { scaleX: 0 });
      },
    });

    return () => {
      pin.kill();
      enterTrigger.kill();
      tlRef.current?.kill();
    };
  }, [reduced]);

  const isLast = index === ARRIVAL_PORTS.length - 1;

  return (
    /*
     * Outer div — tall, gives pin its scroll distance.
     * 180vh = 100vh (pin height) + 80vh (docked reading time).
     */
    <div
      ref={outerRef}
      data-port={location.id as PortId}
      style={{ minHeight: "175vh" }}
      className="relative"
    >
      {/*
       * Inner div — pinned. Position: fixed during pin (managed by GSAP).
       * z-[9] so it sits above WorldOcean (z-0) and VoyageShip (z-1)
       * but below SiteHeader (z-40).
       */}
      <div
        ref={innerRef}
        className="relative z-[9] flex h-screen w-full flex-col items-center justify-center px-5 sm:px-8"
      >
        {/* Readability veil — soft dark halo around text, no hard box */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 52%, rgba(2,5,14,0.62), transparent 72%)",
          }}
        />

        {/* ── Port content ───────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto w-full max-w-2xl text-center">

          {/* Port order */}
          <p
            data-port-item
            className="text-[10px] font-semibold uppercase tracking-[0.48em] text-gold/60"
          >
            {PORT_ORDER_LABELS[index]}
          </p>

          {/* Era / location label */}
          <p
            data-port-item
            className="mt-3 text-[11px] font-medium uppercase tracking-[0.38em] text-parchment-muted/80"
          >
            {PORT_LABELS[location.id] ?? location.id}
          </p>

          {/* City name — large display */}
          <h2
            data-port-item
            className="mt-5 font-display text-[clamp(3rem,7.5vw,5.5rem)] font-semibold leading-[0.98] tracking-tight text-parchment"
          >
            {location.name}
          </h2>

          {/* Atmosphere — italic mood setter */}
          <p
            data-port-item
            className="mx-auto mt-5 max-w-lg font-display text-[clamp(0.95rem,2vw,1.15rem)] italic leading-relaxed text-gold-soft/90"
          >
            {location.atmosphere}
          </p>

          {/* Divider */}
          <div
            data-port-divider
            className="vv-divider mx-auto mt-8"
          />

          {/* Arrival narration */}
          <p
            data-port-item
            className="mx-auto mt-6 max-w-xl text-[clamp(0.9rem,1.8vw,1.05rem)] leading-[1.75] text-parchment-muted"
          >
            {location.arrivalNarration}
          </p>

          {/* Ideological evolution — gold accent */}
          <p
            data-port-item
            className="mx-auto mt-5 max-w-lg text-[clamp(0.82rem,1.6vw,0.95rem)] leading-relaxed text-gold-soft/80"
          >
            {location.ideologicalEvolution.split("—")[0]?.trim()}
          </p>

          {/* Scroll hint */}
          <div
            data-port-item
            className="mt-10 flex flex-col items-center gap-2 text-parchment-muted/40"
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.44em]">
              {isLast ? "Về lại đại dương" : "Tiếp tục hành trình"}
            </span>
            <ChevronDown className="h-4 w-4 animate-bounce text-gold/35" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VoyagePortSequence ───────────────────────────────────────────────────

export function VoyagePortSequence() {
  const reduced = useReducedMotion();

  return (
    <div className="relative">
      {ARRIVAL_PORTS.map((location, i) => (
        <PortScene
          key={location.id}
          location={location}
          index={i}
          reduced={reduced}
        />
      ))}
    </div>
  );
}
