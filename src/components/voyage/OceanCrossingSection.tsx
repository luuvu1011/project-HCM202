"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ─── Crossing moments ────────────────────────────────────────────────────────
// These are the emotional / geographical beats of the ocean crossing.
// The WorldOcean ship (Phase 2) moves left across the viewport during this
// chapter — these moments give the crossing narrative weight.

const CROSSING_MOMENTS = [
  {
    geo: "Biển Đông · Tháng 6 / 1911",
    narration:
      "Con tàu rời cảng Sài Gòn trong bình minh. Đất liền thu nhỏ dần phía sau — không phải bỏ lại, mà là mang theo trong câu hỏi chưa ai trả lời được: đâu là con đường cứu nước?",
    accent:
      "Ra đi là chọn thực tiễn làm thước đo — không phải chạy trốn, mà đối diện với lịch sử.",
  },
  {
    geo: "Ấn Độ Dương · Giữa hai thế giới",
    narration:
      "Từ Colombo đến Aden, những bến cảng thuộc địa trải dài. Ở đâu cũng thấy: người da nâu phục vụ người da trắng. Đế quốc không phải lý thuyết trừu tượng — đó là bức tranh sinh động trước mắt, từng ngày.",
    accent:
      "Quan sát chính xác là điểm khởi đầu của tư duy cách mạng.",
  },
  {
    geo: "Kênh đào Suez · Đường phân chia",
    narration:
      "Một mạch máu thương mại toàn cầu do Pháp và Anh kiểm soát — những người đào nên nó không bao giờ được hưởng lợi từ nó. Đây là bài học địa chính trị không có trong sách giáo khoa thuộc địa.",
    accent:
      "Địa lý là lịch sử được viết bằng đất và nước — và quyền lực của ai kiểm soát cả hai.",
  },
  {
    geo: "Địa Trung Hải · Cửa ngõ vào châu Âu",
    narration:
      "Ánh sáng phương Bắc khác hẳn ánh sáng nhiệt đới. Ngôn ngữ khác. Không khí khác. Nhưng câu hỏi vẫn là một: vì sao một số người sinh ra đã có quyền lực và số khác thì không?",
    accent:
      "Sự khác biệt văn hóa không biện minh cho bất công — đó là nhận thức đến dần, bến cảng qua bến cảng.",
  },
] as const;

// ─── Single crossing moment ──────────────────────────────────────────────────

interface MomentProps {
  geo: string;
  narration: string;
  accent: string;
  reduced: boolean;
}

function CrossingMoment({ geo, narration, accent, reduced }: MomentProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll("[data-cross-item]");
    const divider = el.querySelector("[data-cross-divider]");

    if (!reduced) {
      gsap.set(items,   { opacity: 0, y: 22 });
      if (divider) gsap.set(divider, { scaleX: 0, transformOrigin: "center" });
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 74%",
        onEnter: () => {
          if (reduced) return;
          gsap.to(items, {
            opacity: 1, y: 0,
            duration: 0.95, stagger: 0.14, ease: "power3.out",
          });
          if (divider) {
            gsap.to(divider, {
              scaleX: 1, duration: 0.7, ease: "power2.inOut", delay: 0.1,
            });
          }
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className="flex min-h-[88vh] flex-col items-center justify-center px-5 sm:px-8"
    >
      {/* Subtle readability scrim — darkens text area slightly */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(2,5,14,0.50), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-xl text-center">
        <p
          data-cross-item
          className="text-[10px] font-medium uppercase tracking-[0.44em] text-gold/55"
        >
          {geo}
        </p>

        <div
          data-cross-divider
          className="vv-divider mx-auto mt-5"
        />

        <p
          data-cross-item
          className="mx-auto mt-6 font-display text-[clamp(1rem,2.1vw,1.18rem)] italic leading-[1.74] text-parchment/92"
        >
          {narration}
        </p>

        <p
          data-cross-item
          className="mx-auto mt-5 text-[clamp(0.8rem,1.6vw,0.9rem)] leading-relaxed text-gold-soft/72"
        >
          {accent}
        </p>
      </div>
    </div>
  );
}

// ─── OceanCrossingSection ────────────────────────────────────────────────────

export function OceanCrossingSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="hai-trinh-dien-anh"
      className="relative scroll-mt-24"
    >
      {CROSSING_MOMENTS.map((m, i) => (
        <CrossingMoment
          key={i}
          geo={m.geo}
          narration={m.narration}
          accent={m.accent}
          reduced={reduced}
        />
      ))}
    </section>
  );
}
