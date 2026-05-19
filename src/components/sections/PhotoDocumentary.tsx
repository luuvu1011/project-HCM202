"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Scene {
  id: string;
  year: string;
  location: string;
  title: string;
  caption: string;
  atmosphere: string;
  // CSS art gradient representing the location
  art: string;
  artAccent: string;
  artIcon: string;
}

const SCENES: Scene[] = [
  {
    id: "ben-nha-rong",
    year: "1911",
    location: "Bến Nhà Rồng · Sài Gòn",
    title: "Ngày Ra Đi",
    caption: "Sóng vỗ bến — tiếng còi tàu cắt một khoảnh khắc chia tay giữa nỗi nhớ và khát vọng. Nguyễn Tất Thành bước lên tàu Amiral Latouche-Tréville với đôi bàn tay trắng và trái tim đầy quyết tâm.",
    atmosphere: "Hoàng hôn đỏ trên sông Sài Gòn",
    art: "https://buulong.com.vn/wp-content/uploads/2026/03/lich-su-hinh-thanh-ben-nha-rong.jpg",
    artAccent: "#FFD700",
    artIcon: "⚓",
  },
  {
    id: "marseille",
    year: "1911",
    location: "Marseille · Pháp",
    title: "Bờ Biển Châu Âu",
    caption: "Ánh đèn cảng phản chiếu một châu Âu công nghiệp đầy sức mạnh và mâu thuẫn. Lần đầu tiên, người thanh niên Việt Nam đặt chân lên đất Pháp — quốc gia đang cai trị quê hương mình.",
    atmosphere: "Hoàng hôn Địa Trung Hải",
    art: "https://truyenhinhnghean.vn/file/4028eaa46735a26101673a4df345003c/4028eaa467f477c80167f48e23810ac6/112019/macxay2_201911111721.jpg",
    artAccent: "#e8c870",
    artIcon: "🌊",
  },
  {
    id: "london",
    year: "1913",
    location: "London · Anh Quốc",
    title: "Sương Mù & Máy Móc",
    caption: "Đô thị công nghiệp vĩ đại nhất thế giới phủ trong sương mù và khói than. Đây là trường học thực tiễn về bản chất của chủ nghĩa tư bản — nơi ánh đèn điện không che được bóng tối của bóc lột.",
    atmosphere: "Buổi chiều xám London",
    art: "https://kenh14cdn.com/203336854389633024/2022/12/15/photo-18-16710952099001286470425.jpg",
    artAccent: "#c8d0e0",
    artIcon: "🏭",
  },
  {
    id: "new-york",
    year: "1912",
    location: "New York · Hoa Kỳ",
    title: "Thành Phố Của Ánh Sáng",
    caption: "Chọc trời thép và biển quảng cáo — hình ảnh \"tự do\" hiện đại đặt câu hỏi về công lý thực sự. Người chứng kiến khoảng cách sâu thẳm giữa lời tuyên bố và hiện thực phân biệt chủng tộc.",
    atmosphere: "Đêm Manhattan rực rỡ",
    art: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdaKj2_A1x1-tVxK2RxXk0JVge_Yg3fHEo4A&s",
    artAccent: "#f8d040",
    artIcon: "🗽",
  },
  {
    id: "paris",
    year: "1917–1923",
    location: "Paris · Pháp",
    title: "Trái Tim Cách Mạng",
    caption: "Ánh đèn boulevard và tiếng biểu tình xa gần — trái tim chính trị của một đế chế. Tại đây, Nguyễn Ái Quốc đọc Luận cương của Lê-nin và tìm ra con đường soi sáng cho dân tộc mình.",
    atmosphere: "Hoàng hôn vàng Paris",
    art: "https://cdn.24h.com.vn/upload/2-2023/images/2023-05-23/Paris-xua-va-nay-Nhung-hinh-anh-co-kinh-day-me-hoac-cua-thu-do-nuoc-Phap-11-1684813601-475-width600height437.jpg",
    artAccent: "#e8c870",
    artIcon: "💡",
  },
  {
    id: "lien-xo",
    year: "1923",
    location: "Moskva · Liên Xô",
    title: "Lò Luyện Lý Luận",
    caption: "Tuyết và lò luyện cách mạng — nơi lý luận trở thành ngọn đuốc soi đường. Nghiên cứu chủ nghĩa Mác–Lê-nin, dự Đại hội V Quốc tế Cộng sản, chuẩn bị cho con đường trở về cứu nước.",
    atmosphere: "Mùa đông Moskva",
    art: "https://api.toploigiai.vn/storage/uploads/su-kien-gan-lien-voi-hoat-dong-cua-nguyen-ai-quoc-o-lien-xo-trong-nhung-nam-19231924_1",
    artAccent: "#C8102E",
    artIcon: "⭐",
  },
];

function SceneCard({ scene, index }: { scene: Scene; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-40, 40]);

  const isLeft = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-3xl"
      style={{ minHeight: 480 }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Art background with Ken Burns */}
      <motion.div
        className="absolute inset-0"
        style={{
  y: bgY,
  backgroundImage: `
    linear-gradient(
      to top,
      rgba(0,0,0,0.88),
      rgba(0,0,0,0.35)
    ),
    url(${scene.art})
  `,
  backgroundSize: "cover",
  backgroundPosition: "center",
}}
        animate={hovered && !reduced ? { scale: 1.04 } : { scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Cinematic overlay */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.15) 100%)" }} />

      {/* Letterbox bars */}
      <div className="absolute inset-x-0 top-0 h-8"
        style={{ background: "rgba(0,0,0,0.55)" }} />
      <div className="absolute inset-x-0 bottom-0 h-2"
        style={{ background: "rgba(0,0,0,0.55)" }} />

      {/* Grain overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {/* Top info bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="h-px w-8" style={{ background: scene.artAccent }} />
          <span className="font-cinzel text-[9px] font-bold uppercase tracking-[0.55em]"
            style={{ color: scene.artAccent }}>
            {scene.year}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-[9px] uppercase tracking-[0.4em] text-white/55">
            {scene.atmosphere}
          </span>
          {/* Film frame indicator */}
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-sm" style={{ width: 5, height: 12, background: "rgba(255,255,255,0.18)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Main icon */}
      <div className="absolute" style={{ top: "30%", left: isLeft ? "8%" : "auto", right: isLeft ? "auto" : "8%" }}>
        <motion.span
          className="text-6xl sm:text-7xl opacity-20"
          animate={hovered && !reduced ? { opacity: 0.35, scale: 1.1 } : { opacity: 0.20, scale: 1 }}
          transition={{ duration: 0.5 }}
          aria-hidden>
          {scene.artIcon}
        </motion.span>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-8 pt-20"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)" }}>
        <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.5em] mb-2"
          style={{ color: scene.artAccent }}>
          {scene.location}
        </p>
        <h3 className="font-cinzel font-bold text-white mb-3"
          style={{ fontSize: "clamp(1.3rem,2.5vw,1.9rem)" }}>
          {scene.title}
        </h3>
        <motion.p
          className="font-playfair italic text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.78)" }}
          animate={hovered && !reduced ? { opacity: 1 } : { opacity: 0.78 }}
        >
          {scene.caption}
        </motion.p>
      </div>

      {/* Hover shimmer line */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-0.5"
        style={{ background: `linear-gradient(to right, transparent, ${scene.artAccent}, transparent)` }}
        animate={hovered && !reduced ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.4 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export function PhotoDocumentary() {
  return (
    <section id="phim-tu-lieu" className="relative py-20 sm:py-28 overflow-hidden"
      style={{ background: "#0d0204" }}>

      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(200,16,46,0.5) 0px, transparent 1px, transparent 80px, rgba(200,16,46,0.5) 81px)",
        }} />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mx-auto mb-4 h-px w-24"
            style={{ background: "linear-gradient(to right, transparent, #C8102E, transparent)" }} />
          <p className="font-cinzel text-[11px] uppercase tracking-[0.55em] mb-4"
            style={{ color: "#C8102E" }}>
            Phim Tư Liệu
          </p>
          <h2 className="font-cinzel font-bold text-white"
            style={{ fontSize: "clamp(1.9rem,5vw,3.4rem)" }}>
            Những Khoảnh Khắc
            <br /><span style={{ color: "#FFD700" }}>Định Hình Lịch Sử</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-playfair italic text-sm text-white/60 leading-relaxed">
            Sáu chặng — sáu bức tranh cinematic. Mỗi nơi in dấu một tầng nhận thức mới trên hành trình của người tìm đường cứu nước.
          </p>
          <div className="mx-auto mt-6 h-px w-24"
            style={{ background: "linear-gradient(to right, transparent, #C8102E, transparent)" }} />
        </motion.div>

        {/* 2-column masonry-like grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SCENES.map((scene, i) => (
            <SceneCard key={scene.id} scene={scene} index={i} />
          ))}
        </div>

        {/* Bottom label */}
        <motion.p
          className="mt-12 text-center font-cinzel text-[10px] uppercase tracking-[0.5em]"
          style={{ color: "rgba(255,255,255,0.22)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          Minh họa nghệ thuật — dựa trên tư liệu lịch sử chính thống
        </motion.p>
      </div>
    </section>
  );
}
