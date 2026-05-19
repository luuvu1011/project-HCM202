"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const IDEOLOGY_POINTS = [
  { label: "Độc lập dân tộc gắn liền với CNXH", text: "Tư tưởng cốt lõi: giải phóng dân tộc phải đi đôi với giải phóng giai cấp và tiến lên chủ nghĩa xã hội — không thể tách rời." },
  { label: "Đại đoàn kết dân tộc", text: "Sức mạnh của nhân dân là nền tảng của cách mạng. Đoàn kết toàn dân tộc, không phân biệt giai cấp, tôn giáo, địa phương." },
  { label: "Kết hợp sức mạnh dân tộc và thời đại", text: "Vận dụng sức mạnh của thời đại — phong trào cộng sản quốc tế — vào điều kiện cụ thể của cách mạng Việt Nam." },
  { label: "Đảng Cộng sản lãnh đạo", text: "Cách mạng phải có sự lãnh đạo của Đảng Cộng sản — đội tiên phong của giai cấp công nhân và nhân dân lao động." },
];

const LEGACY_ITEMS = [
  { icon: "🇻🇳", title: "Nền tảng cho Đảng CSVN", text: "Hành trình tìm đường dẫn đến sự ra đời của Đảng Cộng sản Việt Nam năm 1930 — tổ chức lãnh đạo toàn bộ phong trào cách mạng." },
  { icon: "⭐", title: "Cách mạng Tháng Tám 1945", text: "Thắng lợi của Cách mạng Tháng Tám — đỉnh cao của hành trình tìm đường — mở ra kỷ nguyên độc lập cho Việt Nam." },
  { icon: "🌏", title: "Truyền cảm hứng cho châu Á", text: "Con đường cách mạng Việt Nam trở thành nguồn cảm hứng cho phong trào giải phóng dân tộc trên toàn châu Á và thế giới." },
  { icon: "📚", title: "Di sản tư tưởng vĩnh cửu", text: "Tư tưởng Hồ Chí Minh được xác định là một trong hai nền tảng tư tưởng của Đảng và Nhà nước Việt Nam." },
];

export function MeaningSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced    = useReducedMotion();

  useEffect(() => {
    if (reduced || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      sectionRef.current!.querySelectorAll("[data-reveal]").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 38, duration: 0.88, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 78%" } });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "#FDF8F3" }}>

      {/* Đường kẻ trên */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: "#C8102E" }} />

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">

        {/* Tiêu đề */}
        <div data-reveal className="mb-16 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-1 w-12 rounded-full" style={{ background: "#C8102E" }} />
            <p className="font-cinzel text-[11px] uppercase tracking-[0.55em]" style={{ color: "#C8102E" }}>
              Ý Nghĩa &amp; Di Sản
            </p>
            <div className="h-1 w-12 rounded-full" style={{ background: "#C8102E" }} />
          </div>
          <h2 className="font-cinzel font-bold leading-[1.08]"
            style={{ fontSize: "clamp(2rem,5vw,3.6rem)", color: "#1a0506" }}>
            Hành trình hun đúc
            <br /><span style={{ color: "#C8102E" }}>tư tưởng Hồ Chí Minh</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-playfair italic text-sm leading-relaxed sm:text-base"
            style={{ color: "rgba(26,5,6,0.70)" }}>
            Những năm tháng bôn ba không chỉ là hành trình địa lý — đó là hành trình trưởng thành tư tưởng, hình thành học thuyết cách mạng soi sáng cả dân tộc.
          </p>
        </div>

        {/* Trụ cột tư tưởng */}
        <div data-reveal className="mb-4">
          <p className="font-cinzel text-xs uppercase tracking-[0.45em] mb-6" style={{ color: "#C8102E" }}>
            Những trụ cột tư tưởng
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-16">
          {IDEOLOGY_POINTS.map((point, i) => (
            <div key={i} data-reveal className="card-white rounded-2xl p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: "#C8102E" }} />
                <p className="font-cinzel text-sm font-bold" style={{ color: "#1a0506" }}>{point.label}</p>
              </div>
              <p className="font-playfair text-sm leading-relaxed" style={{ color: "rgba(26,5,6,0.76)" }}>{point.text}</p>
            </div>
          ))}
        </div>

        {/* Trích dẫn trung tâm */}
        <div data-reveal className="my-16 text-center">
          <div aria-hidden className="mx-auto mb-6 h-px w-24" style={{ background: "linear-gradient(to right, transparent, #C8102E, transparent)" }} />
          <blockquote className="font-cinzel font-bold" style={{ fontSize: "clamp(1.5rem,3.5vw,2.5rem)", color: "#C8102E" }}>
            "Không có gì quý hơn độc lập tự do."
          </blockquote>
          <cite className="mt-3 block font-playfair italic text-base not-italic" style={{ color: "rgba(26,5,6,0.68)" }}>— Hồ Chí Minh</cite>
          <div aria-hidden className="mx-auto mt-6 h-px w-24" style={{ background: "linear-gradient(to right, transparent, #C8102E, transparent)" }} />
        </div>

        {/* Di sản lịch sử */}
        <div data-reveal className="mb-6">
          <p className="font-cinzel text-xs uppercase tracking-[0.45em] mb-6" style={{ color: "#C8102E" }}>Di sản lịch sử</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {LEGACY_ITEMS.map((item, i) => (
            <div key={i} data-reveal className="card-white rounded-2xl p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{item.icon}</span>
                <p className="font-cinzel text-sm font-bold" style={{ color: "#1a0506" }}>{item.title}</p>
              </div>
              <p className="font-playfair text-sm leading-relaxed" style={{ color: "rgba(26,5,6,0.74)" }}>{item.text}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
