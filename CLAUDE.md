# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc với repo này.

---

## Commands

```bash
npm run dev       # dev server tại localhost:3000
npm run build     # production build
npm run lint      # ESLint (Next.js config)
```

Không có test suite. Không có biến môi trường bắt buộc để chạy dev.

---

## Tổng quan dự án

**Hành Trình Ra Đi Tìm Đường Cứu Nước — Nguyễn Tất Thành**

Ứng dụng Next.js 16 (App Router) một trang, viết bằng tiếng Việt, kể câu chuyện hành trình ra đi của Nguyễn Tất Thành (1911) qua nhiều quốc gia để tìm con đường cứu nước. Định hướng giáo dục — phim tài liệu tương tác, không phải trang web thông thường.

---

## Kiến trúc hiện tại (`src/app/page.tsx`)

Trang là một single-page vertical scroll. Mỗi section được kết nối bằng `<OceanDivider>` — SVG wave transitions chuyển màu nền mượt mà.

### Luồng section (theo thứ tự render):

```
LoadingScreen           — màn chào cinematic 3-4s, ẩn main content cho đến khi done
├── SiteHeader          — header cố định (fixed)
└── <main>              — visibility: hidden cho đến khi LoadingScreen kết thúc
    │
    ├─ HeroSection                    — [RED]   hero crimson đỏ cinematic
    ├─ OceanDivider: red-to-white
    ├─ IntroSection                   — [WHITE] lịch sử VN trước 1911
    ├─ OceanDivider: white-to-cream
    ├─ JourneyMapWorld                — [CREAM] bản đồ hành trình tương tác
    ├─ OceanDivider: cream-to-dark
    ├─ PhotoDocumentary               — [DARK]  6 cảnh phim tư liệu cinematic
    ├─ OceanDivider: dark-to-dark
    ├─ GlobeSection                   — [DARK]  địa cầu 3D lịch sử (R3F)
    ├─ OceanDivider: dark-to-red
    ├─ TimelineScrubber               — [RED]   dòng thời gian 1911–1930
    ├─ OceanDivider: dark-to-white
    ├─ MeaningSection  (id="y-nghia") — [WHITE] ý nghĩa tư tưởng Hồ Chí Minh
    ├─ OceanDivider: white-to-cream (flip)
    ├─ GamesSection                   — [CREAM] mini-game giáo dục
    ├─ OceanDivider: white-to-dark
    ├─ EndingSection                  — [DARK]  tổng kết + trích dẫn + tài liệu
    └─ EndingFinal                    — [RED]   kết thúc cinematic đỏ

Footer
AIAssistant    — floating UI (bottom-right)
ChapterProgress — floating UI (progress dots)
SoundToggle    — floating UI (âm thanh)
```

### Màu nền theo luồng cảm xúc:
```
ĐỎ → TRẮNG → CREAM → TỐI → TỐI → ĐỎ → TRẮNG → CREAM → TỐI → ĐỎ
(anh hùng) → (lịch sử) → (hành trình) → (phim) → (địa cầu) → (bước ngoặt) → (ý nghĩa) → (vui) → (tổng kết) → (kết thúc)
```

> **Quan trọng**: `body { background: #FFFFFF }` — nền mặc định là TRẮNG. Mỗi section tự quản lý màu nền riêng. `OceanDivider` chuyển màu giữa các section.

---

## Cấu trúc thư mục component

```
src/components/
├── assistant/      — AIAssistant (floating chat mock)
├── ending/         — EndingSection
├── games/          — GamesSection, TimelineChallenge, QuizBattle
├── gestures/       — GestureEffects, GestureSection
├── journey/        — ScrollJourneyWorld, DepartureSplash, PortNarrative (chưa mount)
├── landing/        — HeroSection, FloatingShip, OceanBackground, OceanParticles
├── layout/         — SiteHeader, Footer
├── loading/        — LoadingScreen
├── map/            — JourneyMapWorld, GlobeSection
├── sections/       — IntroSection, MeaningSection, PhotoDocumentary, EndingFinal
├── storytelling/   — StoryBridge (chưa mount trong page.tsx hiện tại)
├── ui/             — Button, GlassPanel, ScrollReveal, SectionHeading,
│                     OceanDivider, ChapterProgress, TimelineScrubber, SoundToggle
├── voyage/         — CinematicVoyageSection, VoyageMapSection (chưa mount)
└── world/          — WorldOcean, VoyageShip (Three.js components)
```

> **Lưu ý**: Các thư mục `journey/`, `voyage/`, `storytelling/` và một số component cũ vẫn tồn tại trong repo nhưng **không được mount** trong `page.tsx`. Không xóa chúng — có thể dùng lại sau.

---

## Lớp dữ liệu (`src/data/`)

| File | Nội dung |
|------|----------|
| `voyageLocations.ts` | `VoyageLocation[]` — 6 điểm dừng (Bến Nhà Rồng → Liên Xô), mỗi điểm có `historicalContext`, `experienced`, `ideologicalEvolution`, `significance`, `arrivalNarration` |
| `voyageRoutes.ts` | `VOYAGE_ROUTE_LEGS` — đường cong [lon, lat] giữa các điểm |
| `journeyStages.ts` | Giai đoạn hành trình cho JourneyMapWorld |
| `mapPorts.ts` | Dữ liệu cảng cho bản đồ |
| `cinematicVoyage.ts` | Dữ liệu cho CinematicVoyageSection (chưa mount) |
| `storyBridges.ts` | Nội dung StoryBridge (chưa mount) |
| `quizQuestions.ts` | 8 câu hỏi trắc nghiệm |
| `timelineEvents.ts` | 6 sự kiện timeline challenge |
| `aiMock.ts` | Mock Q&A cho AIAssistant (keyword-based, không dùng AI thật) |

---

## Hệ thống màu sắc (`src/app/globals.css`)

### CSS Variables (`:root`)

**Nền đại dương (dark sections):**
```css
--ocean-deep:  #060910   /* đêm sơn mài Việt Nam */
--ocean-mid:   #0e1a28   /* xanh đậm ấm áp */
--ocean-glow:  #1c3c58   /* ánh sáng biển xanh */
```

**Vàng đồng (Đông Sơn drums):**
```css
--gold:        #c48a28   /* đồng cổ Đông Sơn */
--gold-soft:   #d89c3c   /* hổ phách — đèn Hội An */
```

**Giấy cổ (antique paper):**
```css
--parchment:       #e8d2a8   /* giấy bản Việt Nam */
--parchment-muted: #b89668   /* giấy mờ, mực cũ */
```

**Đỏ thẫm (flag crimson):**
```css
--red-accent:  #9a1c1c   /* đỏ cờ, sâu lắng, không chói */
--crimson:     #8c1818   /* đỏ thẫm — cờ, hi sinh */
```

**Xanh ngọc (jade — đất Việt Nam):**
```css
--jade:        #1c3c2c
--jade-glow:   #2c6844
```

**Hổ phách / Nghệ tây:**
```css
--amber:       #e8a820   /* đèn Hội An */
--saffron:     #e4b840   /* áo cà sa, khói hương */
--bronze:      #a06820   /* trống đồng */
```

**Palette truyện kể Việt Nam:**
```css
--vn-red:    #C8102E   /* đỏ cờ Việt Nam chính xác */
--vn-gold:   #FFD700   /* vàng ái quốc */
--vn-navy:   #0B1F3A
--vn-brown:  #5C4033
--vn-paper:  #F5E6C8
```

### Tailwind: tất cả biến trên đều có class tương ứng
`text-crimson`, `bg-jade`, `text-amber`, `bg-vn-red`, `text-vn-gold`, v.v.

### Utility classes (prefix `vv-`)
`vv-grain` — film grain động + cinematic vignette (dùng trên div gốc)
`vv-gold-text` — gradient text vàng đồng
`vv-divider` — đường kẻ đồng mỏng
`vv-light-shaft` — tia sáng hổ phách (cột hương, đèn lồng)
`vv-story-emphasis` — khung trích dẫn (border trái vàng)
`vv-letterbox`, `vv-shimmer-border`, `vv-line-mask`, `vv-section-glow`

### Utility classes flat (section-level)
`section-white`, `section-cream`, `section-red`, `section-dark`, `section-parchment`
`card-white`, `card-on-red`, `divider-red`
`btn-white`, `btn-red`

---

## Font chữ

| Variable | Font | Dùng cho |
|----------|------|----------|
| `--font-body` | Be Vietnam Pro | Toàn bộ — tiêu đề, nội dung, UI |

**Toàn dự án dùng MỘT font duy nhất — Be Vietnam Pro** — để đảm bảo nhất quán và hỗ trợ tiếng Việt đầy đủ (subset `latin` + `vietnamese`, weight 300–700).

Các class cũ `font-display`, `font-cinzel`, `font-playfair`, `font-serif`, `font-decorative` vẫn được giữ trong TSX để không phải sửa 196 chỗ, nhưng tất cả đã được **alias trong `globals.css` về cùng `--font-body`** — chúng render ra cùng một font. Class `.font-cinzel` chỉ còn `letter-spacing: 0.05em` (giữ cảm giác trang trọng cho tiêu đề), không thay đổi font-family.

Khi viết component mới: dùng `font-sans` hoặc bỏ class font — đều render ra Be Vietnam Pro.

---

## Animation

**Framer Motion** — scroll parallax (`useScroll`/`useTransform`), mount/exit, SVG wave.

**GSAP + ScrollTrigger** — cinematic text stagger, parallax depth, section entrance.
- Luôn `gsap.registerPlugin(ScrollTrigger)` trong `useEffect`
- Dọn dẹp bằng `ctx.revert()` trong cleanup
- Guard mọi animation bằng `if (reduced) return` (xem `useReducedMotion`)

**Three.js / R3F** — `GlobeSection` và `WorldOcean`/`VoyageShip` (trong `world/`).
- DPR: `[1, 1.5]`, `powerPreference: "high-performance"`
- Dùng `dynamic(..., { ssr: false })` cho mọi R3F Canvas

**`useReducedMotion()`** — kiểm tra `prefers-reduced-motion`. Bắt buộc guard mọi animation.

---

## Hooks chính

| Hook | Nhiệm vụ |
|------|----------|
| `useReducedMotion` | Media query reduced-motion |
| `useScrollProgress` | Scroll position + spring smoothing |
| `useSoundReady` | Unlock AudioContext lần đầu gesture |
| `useJourneyMachine` | State machine hành trình (idle→departing→traveling→docked) |
| `useVoyageSequence` | State machine bản đồ tương tác (cho VoyageMapSection) |
| `useChapterProgress` | Tracking tiến độ chapter floating dots |

---

## UI Primitives (`src/components/ui/`)

| Component | Mô tả |
|-----------|-------|
| `Button` | `variant="primary"/"ghost"/"subtle"` |
| `GlassPanel` | Frosted-glass card; `variant="default"/"rich"` |
| `ScrollReveal` | Framer Motion viewport entrance wrapper |
| `SectionHeading` | Eyebrow + title + description |
| `OceanDivider` | SVG wave chuyển màu giữa sections; `variant` xác định màu từ-sang |
| `ChapterProgress` | Floating progress dots (fixed UI) |
| `TimelineScrubber` | Interactive timeline 1911–1930 |
| `SoundToggle` | Floating âm thanh bật/tắt |

---

## Sound (`src/lib/sound.ts` + `src/lib/ambientSound.ts`)

Stubbed — chưa có file âm thanh thật. Đặt file vào `public/sounds/`:
- `nen-bien.mp3` — âm thanh nền biển
- `click-nhe.mp3`, `dung.mp3`, `sai.mp3` — UI feedback

`sound.unlock()` gọi khi gesture đầu tiên (đã kết nối trong `useSoundReady`).

---

## Path alias

`@/` → `src/` (cấu hình trong `tsconfig.json`).

---

# ĐỊNH HƯỚNG TRẢI NGHIỆM

## Triết lý cốt lõi

Đây **không phải** một trang giáo dục thông thường. Đây là **phim tài liệu tương tác** — mỗi lần cuộn là một bước trong hành trình lịch sử. Người dùng không "học" — họ "trải nghiệm".

## Cảm xúc cần gợi lên

- Tình yêu Việt Nam — tự hào dân tộc sâu lắng, không phô trương
- Chiều sâu lịch sử — cảm giác đứng trước một thời đại lớn
- Tinh thần anh hùng — dũng cảm, hi sinh, kiên trì
- Tương lai hòa bình — hy vọng, nhân văn, ấm áp

## Bản sắc văn hóa Việt Nam

Màu sắc và hình ảnh lấy cảm hứng từ:
- **Trống đồng Đông Sơn** — vàng đồng cổ kính, không sáng chói
- **Đèn lồng Hội An** — hổ phách, saffron ấm áp
- **Vịnh Hạ Long** — xanh ngọc bích, sương mù
- **Núi rừng Tây Bắc** — sương khói sáng sớm, sắc thái trầm
- **Phim tư liệu chiến tranh** — tông ấm vintage, hạt phim
- **Cờ Việt Nam** — đỏ thẫm trang trọng, không lòe loẹt

## Nguyên tắc thiết kế

**ĐƯỢC phép:**
- Màu đỏ thẫm, đồng, hổ phách, ngọc bích — dùng có chủ đích
- Grain phim, vignette, light shaft — atmospheric texture
- Typography lớn, thoáng, sang trọng — Fraunces cho tiêu đề
- Chuyển động chậm, mượt mà, có chủ đích — slow & intentional
- Glass morphism với tông tối — lacquer aesthetic
- Wave SVG chuyển section — OceanDivider

**TRÁNH:**
- Màu đỏ/vàng flat, chói, giống poster chính trị
- Hiệu ứng ngẫu nhiên, animation không có mục đích
- Card grid UI cổ điển — quá giống website bình thường
- Giao diện trẻ con, colorful quá mức
- Thêm section mới khi chưa được yêu cầu rõ ràng
- Xóa hoặc refactor component chưa mount (có thể dùng lại sau)

## Chất lượng tham chiếu

- Apple storytelling pages (apple.com/macbook-pro)
- Bảo tàng tương tác Awwwards
- Phim tài liệu National Geographic interactive
- Những trang lịch sử cao cấp Nhật Bản / Hàn Quốc

---

# KHÔNG ĐƯỢC PHÉ THAY ĐỔI (unless được yêu cầu rõ ràng)

1. **Page structure** trong `page.tsx` — thứ tự và logic LoadingScreen/visibility
2. **CSS variables** trong `:root` — đặc biệt là `--vn-red`, `--ocean-deep`, `--crimson`
3. **OceanDivider variants** — logic chuyển màu giữa sections
4. **Font system** — 4 fonts Google với subset Vietnamese
5. **`useReducedMotion` guard** — mọi animation PHẢI kiểm tra biến `reduced`
6. **Dữ liệu lịch sử** trong `src/data/` — nội dung đã được kiểm duyệt lịch sử
