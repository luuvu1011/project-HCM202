"use client";

import { useEffect, useRef, useState } from "react";
import type { ChapterId, PortId } from "@/lib/atmospheres";

export interface ChapterProgress {
  chapterId: ChapterId;
  chapterIndex: number;
  /** 0–1 progress within the current chapter */
  progress: number;
  scrollY: number;
  /** Active port during arrivals chapter; null otherwise */
  portId: PortId | null;
}

const CHAPTER_ORDER: ChapterId[] = [
  "harbor",
  "ocean",
  "arrivals",
  "watershed",
  "games",
  "companion",
];

export function useChapterProgress(): ChapterProgress {
  const [state, setState] = useState<ChapterProgress>({
    chapterId: "harbor",
    chapterIndex: 0,
    progress: 0,
    scrollY: 0,
    portId: null,
  });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const scrollY = window.scrollY;
      const viewH = window.innerHeight;

      // ── Chapter detection ─────────────────────────────────────────────────
      // Use for…of so TypeScript tracks the mutation of activeId correctly.
      const chapterEls = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter]"),
      );

      let activeId: ChapterId = "harbor";
      let activeIndex = 0;
      let activeProgress = 0;

      for (const el of chapterEls) {
        const id = el.dataset.chapter as ChapterId;
        const triggerAt = el.offsetTop - viewH * 0.4;

        if (scrollY >= triggerAt) {
          activeId = id;
          activeIndex = CHAPTER_ORDER.indexOf(id);
          const elapsed = scrollY - triggerAt;
          const span = el.offsetHeight + viewH * 0.4;
          activeProgress = Math.min(1, Math.max(0, elapsed / span));
        }
      }

      // ── Port detection (only meaningful during arrivals) ──────────────────
      let activePortId: PortId | null = null;

      if (activeId === "arrivals") {
        const portEls = Array.from(
          document.querySelectorAll<HTMLElement>("[data-port]"),
        );

        for (const el of portEls) {
          const id = el.dataset.port as PortId;
          // Fire ~30% before the port section top reaches the viewport
          const triggerAt = el.offsetTop - viewH * 0.3;
          if (scrollY >= triggerAt) {
            activePortId = id;
          }
        }
      }

      setState({
        chapterId: activeId,
        chapterIndex: activeIndex,
        progress: activeProgress,
        scrollY,
        portId: activePortId,
      });
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return state;
}
