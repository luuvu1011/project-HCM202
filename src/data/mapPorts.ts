/**
 * Port waypoints for the full-page cinematic map.
 * Coordinates in viewBox="0 0 100 100" units:
 *   x: left-to-right percentage of viewport width
 *   y: top-to-bottom percentage of viewport height
 * scrollPct: 0–1 through the 360vh scroll canvas where this port activates.
 */

export interface MapPort {
  id: string;
  name: string;
  nameVi: string;
  era: string;
  xPct: number;
  yPct: number;
  scrollPct: number;
  // Which side the content panel appears (opposite the ship)
  contentSide: "left" | "right";
  /** URL ảnh thumbnail của cảng (Wikimedia Commons / public-domain). Sẽ có gradient fallback nếu lỗi load. */
  imageUrl: string;
  /** Màu gradient fallback đặc trưng cho cảng — hiển thị nếu ảnh không tải được. */
  tint: string;
  /** Vị trí của photo card so với port dot ("top" = trên, "bottom" = dưới). */
  cardSide?: "top" | "bottom";
}

export const MAP_PORTS: MapPort[] = [
  {
    id: "ben-nha-rong",
    name: "Bến Nhà Rồng",
    nameVi: "Sài Gòn · Việt Nam",
    era: "1911",
    xPct: 74,
    yPct: 52,
    scrollPct: 0,
    contentSide: "left",
    imageUrl: "https://buulong.com.vn/wp-content/uploads/2026/03/lich-su-hinh-thanh-ben-nha-rong.jpg",
    tint: "linear-gradient(135deg, #8B0000 0%, #C8102E 50%, #e85e1a 100%)",
    cardSide: "bottom",
  },
  {
    id: "marseille",
    name: "Marseille",
    nameVi: "Pháp",
    era: "1911",
    xPct: 27,
    yPct: 56,
    scrollPct: 0.17,
    contentSide: "right",
    imageUrl: "https://truyenhinhnghean.vn/file/4028eaa46735a26101673a4df345003c/4028eaa467f477c80167f48e23810ac6/112019/macxay2_201911111721.jpg",
    tint: "linear-gradient(135deg, #1a2a5e 0%, #4e7ab0 50%, #e85e1a 100%)",
    cardSide: "bottom",
  },
  {
    id: "new-york",
    name: "New York",
    nameVi: "Hoa Kỳ",
    era: "1912",
    xPct: 7,
    yPct: 65,
    scrollPct: 0.33,
    contentSide: "right",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdaKj2_A1x1-tVxK2RxXk0JVge_Yg3fHEo4A&s",
    tint: "linear-gradient(135deg, #060918 0%, #2840a0 50%, #f8d040 100%)",
    cardSide: "top",
  },
  {
    id: "london",
    name: "London",
    nameVi: "Anh",
    era: "1913",
    xPct: 21,
    yPct: 38,
    scrollPct: 0.50,
    contentSide: "right",
    imageUrl: "https://kenh14cdn.com/203336854389633024/2022/12/15/photo-18-16710952099001286470425.jpg",
    tint: "linear-gradient(135deg, #1a1a2e 0%, #404e60 50%, #8e9ea0 100%)",
    cardSide: "top",
  },
  {
    id: "paris",
    name: "Paris",
    nameVi: "Pháp",
    era: "1917–1923",
    xPct: 28,
    yPct: 48,
    scrollPct: 0.67,
    contentSide: "right",
    imageUrl: "https://cdn.24h.com.vn/upload/2-2023/images/2023-05-23/Paris-xua-va-nay-Nhung-hinh-anh-co-kinh-day-me-hoac-cua-thu-do-nuoc-Phap-11-1684813601-475-width600height437.jpg",
    tint: "linear-gradient(135deg, #1e1008 0%, #7e5030 50%, #e8b870 100%)",
    cardSide: "top",
  },
  {
    id: "lien-xo",
    name: "Liên Xô",
    nameVi: "Moskva",
    era: "1923–1924",
    xPct: 52,
    yPct: 36,
    scrollPct: 0.83,
    contentSide: "left",
    imageUrl: "https://api.toploigiai.vn/storage/uploads/su-kien-gan-lien-voi-hoat-dong-cua-nguyen-ai-quoc-o-lien-xo-trong-nhung-nam-19231924_1",
    tint: "linear-gradient(135deg, #080c18 0%, #1a2838 40%, #c8102e 100%)",
    cardSide: "top",
  },
  {
    id: "quang-chau",
    name: "Quảng Châu",
    nameVi: "Trung Quốc",
    era: "1924–1927",
    xPct: 70,
    yPct: 44,
    scrollPct: 1,
    contentSide: "left",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFgDDKM1SxfDJ4Lms6JJ7Q0bOQUjQT8inoLQ&s",
    tint: "linear-gradient(135deg, #0b3d2e 0%, #2c6844 50%, #d8b45c 100%)",
    cardSide: "top",
  },
];

/** SVG path through all waypoints (viewBox 0 0 100 100) */
export const MAP_SVG_PATH =
  "M 74,52 " +
  "C 62,53 50,55 27,56 " +  // BNR → Marseille (northwest)
  "C 20,60 12,66 7,65 " +   // Marseille → New York (far west)
  "C 10,56 16,44 21,38 " +  // New York → London (east)
  "C 23,42 25,46 28,48 " +  // London → Paris (south)
  "C 38,42 46,38 52,36 " +  // Paris → Lien Xo (northeast)
  "C 58,38 66,40 70,44";    // Lien Xo → Quang Chau (east)

/** Ocean region labels */
export const OCEAN_LABELS = [
  { x: 82, y: 55, text: "Thái Bình Dương" },
  { x: 8,  y: 46, text: "Đại Tây Dương" },
  { x: 50, y: 72, text: "Ấn Độ Dương" },
];
