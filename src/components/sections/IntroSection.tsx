"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const CONTEXT_ITEMS = [
  { year: "1858", heading: "Thực dân Pháp xâm lược", text: "Năm 1858, thực dân Pháp nổ súng tấn công Đà Nẵng, mở đầu quá trình xâm lược và đặt nền đô hộ lên đất nước Việt Nam hơn 80 năm.", accent: "#C8102E" },
  { year: "1885–1896", heading: "Các phong trào yêu nước thất bại", text: "Phong trào Cần Vương, khởi nghĩa Yên Thế, Đông Du… tất cả thất bại vì thiếu đường lối đúng đắn và cơ sở lý luận cách mạng vững chắc.", accent: "#9a0c22" },
  { year: "Đầu thế kỷ XX", heading: "Khủng hoảng đường lối cứu nước", text: "Đất nước lâm vào khủng hoảng sâu sắc. Dân tộc Việt Nam đang cần một lối ra mới, một con đường cứu nước đúng đắn và phù hợp hơn với thời đại.", accent: "#C8102E" },
  { year: "1911", heading: "Nguyễn Tất Thành quyết tâm ra đi", text: "Trước thực trạng đau thương của đất nước, chàng thanh niên Nguyễn Tất Thành quyết định ra đi sang phương Tây để tìm con đường cứu nước mới.", accent: "#9a0c22" },
];

export function IntroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced    = useReducedMotion();

  useEffect(() => {
    if (reduced || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      sectionRef.current!.querySelectorAll("[data-reveal]").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 38, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 80%" } });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="lich-su" ref={sectionRef} className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "#FFFFFF" }}>

      {/* Đường kẻ đỏ trên */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: "#C8102E" }} />

      {/* Hoa văn trang trí */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #C8102E, transparent 70%)" }} />

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">

        {/* Tiêu đề */}
        <div data-reveal className="mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-1 w-12 rounded-full" style={{ background: "#C8102E" }} />
            <p className="font-cinzel text-[11px] uppercase tracking-[0.55em]" style={{ color: "#C8102E" }}>
              Bối Cảnh Lịch Sử
            </p>
          </div>
          <h2 className="font-cinzel font-bold leading-[1.08]"
            style={{ fontSize: "clamp(2rem,5vw,3.6rem)", color: "#1a0506" }}>
            Việt Nam trước khi
            <br /><span style={{ color: "#C8102E" }}>cuộc hành trình bắt đầu</span>
          </h2>
          <p className="mt-5 max-w-2xl font-playfair italic text-sm leading-relaxed sm:text-base"
            style={{ color: "rgba(26,5,6,0.72)" }}>
            Để hiểu vì sao Nguyễn Tất Thành phải rời xa Tổ quốc, ta cần hiểu hoàn cảnh đau thương của đất nước Việt Nam cuối thế kỷ XIX — đầu thế kỷ XX.
          </p>
        </div>

        {/* Card lịch sử */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {CONTEXT_ITEMS.map((item, i) => (
            <div key={i} data-reveal className="card-white rounded-2xl p-6 sm:p-7">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-8 rounded-full" style={{ background: item.accent }} />
                <span className="font-cinzel text-xs font-bold tracking-widest" style={{ color: item.accent }}>
                  {item.year}
                </span>
              </div>
              <h3 className="font-cinzel text-base font-bold sm:text-lg mb-3" style={{ color: "#1a0506" }}>
                {item.heading}
              </h3>
              <p className="font-playfair text-sm leading-relaxed" style={{ color: "rgba(26,5,6,0.75)" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Chuyển tiếp */}
        <div data-reveal className="mt-20 text-center">
          <div aria-hidden className="mx-auto mb-6 h-px w-20" style={{ background: "linear-gradient(to right, transparent, #C8102E, transparent)" }} />
          <p className="font-playfair text-xl italic sm:text-2xl" style={{ color: "#1a0506" }}>
            “Từ đây, hành trình của một con người vĩ đại chính thức bắt đầu.”
          </p>
          <div aria-hidden className="mx-auto mt-6 h-px w-20" style={{ background: "linear-gradient(to right, transparent, #C8102E, transparent)" }} />
        </div>

      </div>
    </section>
  );
}
