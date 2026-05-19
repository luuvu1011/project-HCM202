"use client";


// ─── Dữ liệu ─────────────────────────────────────────────────────────────────

const JOURNEY_CONTEXT = [
  "Tư tưởng Hồ Chí Minh hình thành trong bối cảnh Việt Nam cuối thế kỷ XIX đầu thế kỷ XX bị thực dân Pháp đô hộ, phong trào yêu nước khủng hoảng đường lối. Trên nền tảng truyền thống dân tộc, Người tiếp thu tinh hoa nhân loại, đặc biệt là chủ nghĩa Mác - Lênin để tìm ra con đường giải phóng đúng đắn.",
  "Giai đoạn 1911 - 1920, Nguyễn Tất Thành ra đi khảo sát thực tiễn cách mạng thế giới. Ở Pháp, Người tham gia hoạt động chính trị, gửi bản yêu sách, tiếp cận Luận cương của Lênin và xác định con đường cách mạng vô sản.",
  "Giai đoạn 1920 - 1930, Người hoạt động tại Pháp, Liên Xô, Trung Quốc; thành lập Hội Việt Nam Cách mạng Thanh niên và sáng lập Đảng Cộng sản Việt Nam (3/2/1930). Những nội dung cốt lõi về đường lối cách mạng Việt Nam được định hình.",
  "Từ 1930 đến 1941, Người kiên trì giữ vững đường lối cách mạng đúng đắn, vượt qua thử thách và đặt nhiệm vụ giải phóng dân tộc lên hàng đầu; Hội nghị Trung ương tháng 5/1941 khẳng định ưu tiên này.",
  "Từ 1941 đến 1969, tư tưởng Hồ Chí Minh tiếp tục phát triển và soi đường cho cách mạng, nhấn mạnh độc lập dân tộc, đoàn kết nhân dân và xây dựng xã hội mới. Giá trị tư tưởng ấy trở thành nền tảng cho Đảng và lan tỏa trong phong trào giải phóng dân tộc.",
];

const JOURNEY_STOPS = [
  {
    id: "bnr",
    icon: "⚓",
    place: "Bến Nhà Rồng",
    year: "1911",
    lesson: "Rời quê hương với quyết tâm tìm con đường cứu nước — hành trình tìm kiếm bắt đầu",
  },
  {
    id: "my",
    icon: "🗽",
    place: "Hoa Kỳ",
    year: "1912",
    lesson: "Quan sát xã hội tư bản: lý tưởng tự do đối mặt với thực tế bất công — thôi thúc tìm con đường mới",
  },
  {
    id: "anh",
    icon: "🏭",
    place: "Anh",
    year: "1913",
    lesson: "Thấy rõ đời sống công nhân và hệ thống thuộc địa — nhận diện bản chất của chủ nghĩa thực dân",
  },
  {
    id: "phap",
    icon: "🗺",
    place: "Pháp",
    year: "1917–1923",
    lesson: "Tham gia hoạt động chính trị; gửi yêu sách (1919); tiếp cận Luận cương Lê-nin (1920) — xác định con đường cách mạng vô sản",
  },
  {
    id: "lienxo",
    icon: "⭐",
    place: "Liên Xô",
    year: "1923–1924",
    lesson: "Nghiên cứu chủ nghĩa Mác–Lê-nin và phong trào cách mạng thế giới — củng cố nền tảng lý luận",
  },
  {
    id: "trunggoc",
    icon: "🏮",
    place: "Trung Quốc",
    year: "1924–1927",
    lesson: "Tổ chức, đào tạo lực lượng cách mạng; đặt nền móng cho sự ra đời của Đảng Cộng sản Việt Nam (3/2/1930)",
  },
];

const REFERENCES = [
  "Ban Tuyên giáo Trung ương — Hồ Chí Minh: Tiểu sử (NXB Chính trị Quốc gia, 2019)",
  "Bộ Giáo dục & Đào tạo — Giáo trình Tư tưởng Hồ Chí Minh (NXB CTQG, 2021)",
  "Nguyễn Đình Lộc — Hồ Chí Minh: Hành trình tìm đường cứu nước (NXB Sự thật, 1992)",
  "Duiker, W.J. — Ho Chi Minh: A Life (Hyperion, 2000)",
  "Hồ Chí Minh — Toàn tập (NXB Chính trị Quốc gia, 2011, 15 tập)",
];

// ─── Tiêu đề section ──────────────────────────────────────────────────────────
function SectionTitle({
  text,
  sub,
  compact = false,
}: {
  text: string;
  sub?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mb-6" : "mb-8"}>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-0.5 w-12 rounded-full" style={{ background: "#C8102E" }} />
        <p className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.45em]"
          style={{ color: "#C8102E" }}>
          {sub ?? text}
        </p>
      </div>
      {sub && (
        <h3 className="font-cinzel text-2xl font-bold sm:text-3xl" style={{ color: "#1a0506" }}>
          {text}
        </h3>
      )}
    </div>
  );
}



// ─── Tóm tắt hành trình ───────────────────────────────────────────────────────
function JourneySummary() {
  return (
    <div className="py-10" style={{ background: "#FDF8F3" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle text="Tóm tắt hành trình hình thành và phát triển tư tưởng Hồ Chí Minh" sub="Tóm Tắt" />
        
        <div className="mb-5 rounded-2xl p-5 sm:p-6" style={{ background: "#FFFFFF", border: "2px solid rgba(200,16,46,0.15)" }}>
          <div className="space-y-2">
            {JOURNEY_CONTEXT.map((paragraph, index) => (
              <p
                key={`journey-context-${index}`}
                className="font-playfair text-base leading-relaxed sm:text-lg"
                style={{ color: "rgba(26,5,6,0.80)" }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEY_STOPS.map((stop) => (
            <div key={stop.id} data-card
              className="group card-white rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(200,16,46,0.12)]">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{stop.icon}</span>
                <div>
                  <p className="font-cinzel text-sm font-bold" style={{ color: "#1a0506" }}>{stop.place}</p>
                  <p className="font-cinzel text-[10px] uppercase tracking-widest" style={{ color: "#C8102E" }}>{stop.year}</p>
                </div>
              </div>
              <div className="mb-2 h-px w-full" style={{ background: "rgba(200,16,46,0.10)" }} />
              <p className="font-playfair text-sm leading-relaxed" style={{ color: "rgba(26,5,6,0.76)" }}>
                {stop.lesson}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



// ─── Tài liệu tham khảo ──────────────────────────────────────────────────────
function References() {
  return (
    <div className="py-6" style={{ background: "#FDF8F3", borderTop: "1px solid rgba(200,16,46,0.10)" }}>
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionTitle text="Tài liệu tham khảo" sub="Tài Liệu" compact />
        <ul className="space-y-2">
          {REFERENCES.map((ref, i) => (
            <li key={i} className="flex items-start gap-4 text-sm leading-relaxed font-playfair"
              style={{ color: "rgba(26,5,6,0.68)" }}>
              <span className="font-cinzel font-bold shrink-0 mt-0.5 text-xs"
                style={{ color: "#C8102E", minWidth: "1.5rem" }}>
                [{i + 1}]
              </span>
              <span>{ref}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function EndingSection() {
  return (
    <section id="ket-thuc">
      <JourneySummary />
      <References />
    </section>
  );
}
