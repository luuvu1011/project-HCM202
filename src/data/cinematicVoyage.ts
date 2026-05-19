import type { LocationId } from "@/types/voyage";

type Position = {
  x: number;
  y: number;
};

export type CinematicStop = {
  id: LocationId;
  name: string;
  label: string;
  atmosphere: string;
  narration: string;
  ideology: string;
  significance: string;
  position: Position;
  tone: {
    glow: string;
    mist: string;
    sea: string;
  };
};

export type CinematicLeg = {
  from: LocationId;
  to: LocationId;
  curve: Position;
};

export const CINEMATIC_STOPS: CinematicStop[] = [
  {
    id: "ben-nha-rong",
    name: "Bến Nhà Rồng",
    label: "Sài Gòn 1911",
    atmosphere:
      "Sương phủ bến cảng, ánh đèn vàng rung nhẹ trên mặt nước. Một con tàu nhỏ mang theo khát vọng lớn.",
    narration:
      "Nguyễn Tất Thành rời bến với câu hỏi về con đường cứu nước — câu hỏi chỉ có thể trả lời bằng thực tiễn thế giới.",
    ideology:
      "Từ yêu nước đến khát vọng tìm phương pháp mới: ra đi để hiểu vì sao các phong trào cũ thất bại.",
    significance:
      "Khoảnh khắc mở đầu cho hành trình lịch sử kéo dài hơn một thập kỷ học hỏi và lựa chọn tư tưởng.",
    position: { x: 12, y: 72 },
    tone: {
      glow: "rgba(212,168,83,0.28)",
      mist: "rgba(232,201,122,0.18)",
      sea: "rgba(7,18,36,0.9)",
    },
  },
  {
    id: "marseille",
    name: "Marseille",
    label: "Địa Trung Hải",
    atmosphere:
      "Gió muối thốc qua bến cảng, những bóng tàu lớn phủ lên người lao động bé nhỏ.",
    narration:
      "Giữa ánh đèn châu Âu, khoảng cách giữa khẩu hiệu văn minh và đời sống lao động dần hiện ra rõ rệt.",
    ideology:
      "Một phương pháp tư duy mới hình thành: phải quan sát đời sống giai cấp để hiểu bản chất của đế chế.",
    significance:
      "Bài học đầu tiên về việc đối chiếu lý tưởng với thực tại xã hội công nghiệp.",
    position: { x: 28, y: 48 },
    tone: {
      glow: "rgba(82,168,212,0.26)",
      mist: "rgba(122,190,232,0.18)",
      sea: "rgba(8,22,44,0.92)",
    },
  },
  {
    id: "london",
    name: "London",
    label: "Sương mù công nghiệp",
    atmosphere:
      "Nhịp máy dồn dập, sương mù đặc quánh — đô thị khổng lồ nhưng cô đơn.",
    narration:
      "Người thanh niên Việt Nam quan sát lao động thuê mướn, đọc báo, lắng nghe tiếng nói của công nhân.",
    ideology:
      "Nhận thức về vai trò của quần chúng lao động sâu dần: đổi thay phải đi qua tổ chức và kỷ luật.",
    significance:
      "Giai đoạn rèn luyện tinh thần kiên nhẫn và quan sát hệ thống.",
    position: { x: 42, y: 36 },
    tone: {
      glow: "rgba(142,160,186,0.22)",
      mist: "rgba(160,178,196,0.16)",
      sea: "rgba(9,20,40,0.92)",
    },
  },
  {
    id: "new-york",
    name: "New York",
    label: "Ánh sáng hiện đại",
    atmosphere:
      "Những tòa tháp sáng rực soi xuống khoảng tối của bất công và phân hóa xã hội.",
    narration:
      "Tự do được quảng bá như biểu tượng, nhưng đời sống lao động nhập cư kể một câu chuyện khác.",
    ideology:
      "Niềm tin mới: không thể sao chép mô hình nếu không hiểu lịch sử và lợi ích dân tộc.",
    significance:
      "Hoàn thiện tư duy đa chiều giữa tiến bộ kỹ thuật và quyền lực giai cấp.",
    position: { x: 58, y: 42 },
    tone: {
      glow: "rgba(120,190,232,0.26)",
      mist: "rgba(140,210,244,0.16)",
      sea: "rgba(10,20,38,0.9)",
    },
  },
  {
    id: "paris",
    name: "Paris",
    label: "Thủ đô tư tưởng",
    atmosphere:
      "Âm vang biểu tình hòa vào những đại lộ rực sáng — thành phố của tư tưởng và đấu tranh.",
    narration:
      "Những cuộc tranh luận về dân chủ, xã hội và giải phóng thuộc địa hội tụ.",
    ideology:
      "Tìm thấy một định hướng có hệ thống: độc lập dân tộc gắn với tiến bộ xã hội.",
    significance:
      "Bước ngoặt trước khi hệ thống hóa lý luận cách mạng.",
    position: { x: 72, y: 34 },
    tone: {
      glow: "rgba(212,136,168,0.24)",
      mist: "rgba(232,168,194,0.16)",
      sea: "rgba(10,18,34,0.9)",
    },
  },
  {
    id: "lien-xo",
    name: "Liên Xô",
    label: "Ngọn đuốc lý luận",
    atmosphere:
      "Sắc lạnh phương Bắc, ánh sáng từ những lò luyện cách mạng sưởi ấm một con đường mới.",
    narration:
      "Ở đây, lý luận được hệ thống hóa thành phương pháp để giải phóng dân tộc.",
    ideology:
      "Chủ nghĩa Mác — Lênin trở thành điểm tựa, nhưng phải được vận dụng sáng tạo cho Việt Nam.",
    significance:
      "Hoàn thiện nền tảng tư tưởng cho con đường cách mạng hiện đại.",
    position: { x: 88, y: 26 },
    tone: {
      glow: "rgba(194,59,59,0.28)",
      mist: "rgba(212,90,90,0.18)",
      sea: "rgba(10,16,30,0.92)",
    },
  },
];

export const CINEMATIC_LEGS: CinematicLeg[] = [
  { from: "ben-nha-rong", to: "marseille", curve: { x: 18, y: 34 } },
  { from: "marseille", to: "london", curve: { x: 34, y: 30 } },
  { from: "london", to: "new-york", curve: { x: 48, y: 24 } },
  { from: "new-york", to: "paris", curve: { x: 64, y: 30 } },
  { from: "paris", to: "lien-xo", curve: { x: 82, y: 20 } },
];
