export interface JourneyStage {
  id: string;
  number: number;
  title: string;
  period: string;
  locations: string;
  tagline: string;
  content: string[];
  highlight: string;
  quote?: string;
  accentColor: string;
  bgTint: string; // rgba for subtle section tint
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "beginning",
    number: 1,
    title: "Khởi đầu cuộc hành trình",
    period: "1911",
    locations: "Bến Nhà Rồng · Sài Gòn",
    tagline: "Rời quê hương để tìm ánh sáng cho dân tộc",
    content: [
      "Ngày 5 tháng 6 năm 1911, chàng thanh niên Nguyễn Tất Thành bước lên tàu Amiral Latouche-Tréville tại Bến Nhà Rồng với tên mới Văn Ba. Chặng hành trình vĩ đại bắt đầu từ đây.",
      "Đất nước đang chìm đắm trong ách nô lệ của thực dân Pháp. Các phong trào yêu nước của cha ông liên tiếp thất bại vì thiếu con đường đúng đắn và sự chuẩn bị về lý luận cách mạng.",
      "Với hai bàn tay trắng và trái tim đầy ắp ý chí, Người quyết định ra đi sang phương Tây — tìm hiểu thực chất của nền văn minh và con đường giải phóng dân tộc.",
    ],
    highlight: "Bước đầu của hành trình vĩ đại — cuộc kiếm tìm chân lý để giải phóng dân tộc Việt Nam.",
    quote: "Tôi muốn đi ra ngoài, xem nước Pháp và các nước khác làm thế nào, rồi sẽ trở về giúp đồng bào chúng ta.",
    accentColor: "#C8102E",
    bgTint: "rgba(200,16,46,0.04)",
  },
  {
    id: "searching",
    number: 2,
    title: "Thời kỳ tìm tòi học hỏi",
    period: "1911 – 1917",
    locations: "Pháp · Anh · Mỹ · Bắc Phi",
    tagline: "Lao động, quan sát và hiểu bản chất của chủ nghĩa thực dân",
    content: [
      "Nguyễn Tất Thành làm nhiều nghề để kiếm sống: phụ bếp trên tàu thủy, lao động phổ thông, chụp ảnh dạo, viết văn. Mỗi nghề là một bài học về cuộc sống thực tế của người dân lao động.",
      "Tại London, Người tham gia Hội người Việt yêu nước tại Anh, quan sát phong trào Công đảng và hiểu thêm về cuộc đấu tranh của giai cấp công nhân chống áp bức.",
      "Tại Mỹ, Người chứng kiến sự phân biệt chủng tộc và bất bình đẳng xã hội — nhận ra rằng chủ nghĩa tư bản dù ở đâu cũng mang bản chất áp bức và bóc lột.",
      "Qua nhiều năm bôn ba, Người hiểu rõ: kẻ thù của nhân dân lao động toàn thế giới là một — chủ nghĩa đế quốc và chủ nghĩa thực dân.",
    ],
    highlight: "Từ thực tiễn cuộc sống, Người nhận ra sự thật về bản chất áp bức của chủ nghĩa thực dân không chỉ ở Việt Nam mà trên toàn thế giới.",
    accentColor: "#5C4033",
    bgTint: "rgba(92,64,51,0.04)",
  },
  {
    id: "revolutionary",
    number: 3,
    title: "Tìm ra con đường cách mạng",
    period: "1917 – 1923",
    locations: "Paris · Pháp",
    tagline: "Luận cương của Lênin soi sáng con đường cứu nước",
    content: [
      "Năm 1919, Nguyễn Tất Thành gia nhập Đảng Xã hội Pháp và thay mặt những người Việt Nam yêu nước gửi Bản Yêu sách 8 điểm đến Hội nghị Versailles — đòi quyền tự do, dân chủ cho nhân dân Việt Nam.",
      "Năm 1920, đọc bản Sơ thảo Luận cương về vấn đề dân tộc và thuộc địa của V.I. Lênin, Người đã tìm ra ánh sáng soi đường cho cách mạng Việt Nam — đây là bước ngoặt lịch sử.",
      "Người hiểu rằng chỉ có con đường cách mạng vô sản mới có thể giải phóng được dân tộc Việt Nam. Giai cấp vô sản quốc tế là đồng minh tin cậy nhất của các dân tộc bị áp bức.",
      "Tại Đại hội Tours của Đảng Xã hội Pháp, Người bỏ phiếu tán thành gia nhập Quốc tế III và trở thành một trong những người sáng lập Đảng Cộng sản Pháp.",
    ],
    highlight: "1920 — Bước ngoặt lịch sử: Luận cương của Lênin chỉ ra con đường duy nhất đúng đắn để giải phóng dân tộc Việt Nam.",
    quote: "Luận cương đã làm cho tôi cảm động, phấn khởi, sáng tỏ, tin tưởng biết bao! Tôi vui mừng đến phát khóc lên.",
    accentColor: "#C8102E",
    bgTint: "rgba(200,16,46,0.05)",
  },
  {
    id: "preparation",
    number: 4,
    title: "Thời kỳ chuẩn bị cách mạng",
    period: "1923 – 1927",
    locations: "Liên Xô · Trung Quốc · Thái Lan",
    tagline: "Xây dựng lực lượng và chuẩn bị cho cách mạng Việt Nam",
    content: [
      "Năm 1923, Người sang Liên Xô, dự Đại hội V Quốc tế Cộng sản, nghiên cứu chủ nghĩa Mác–Lênin một cách có hệ thống và học tập kinh nghiệm cách mạng của nhân dân Liên Xô.",
      "Năm 1924, tại Quảng Châu (Trung Quốc), Người xúc tiến tổ chức cách mạng Việt Nam — thành lập Hội Việt Nam Cách mạng Thanh niên (1925), tổ chức tiền thân của Đảng Cộng sản Việt Nam.",
      "Người mở nhiều lớp huấn luyện chính trị, đào tạo cán bộ cách mạng, trang bị lý luận Mác–Lênin và đường lối đấu tranh cho thế hệ cán bộ đầu tiên.",
      "Hoạt động ở Thái Lan (1928–1929) với bí danh Thầu Chín, Người tiếp tục gây dựng phong trào yêu nước trong Việt kiều và chuẩn bị cho sự ra đời của Đảng.",
    ],
    highlight: "Từ lý luận đến thực tiễn — Người xây dựng nền tảng tổ chức vững chắc cho cách mạng Việt Nam.",
    accentColor: "#0B1F3A",
    bgTint: "rgba(11,31,58,0.08)",
  },
  {
    id: "completion",
    number: 5,
    title: "Tư tưởng cách mạng hoàn chỉnh",
    period: "1930",
    locations: "Hồng Kông · Phong trào cách mạng Việt Nam",
    tagline: "Đảng Cộng sản Việt Nam ra đời — con đường sáng tỏ",
    content: [
      "Ngày 3 tháng 2 năm 1930, Nguyễn Ái Quốc chủ trì Hội nghị hợp nhất tại Cửu Long (Hồng Kông), thống nhất các tổ chức cộng sản trong nước thành Đảng Cộng sản Việt Nam.",
      "Cương lĩnh chính trị đầu tiên do Người soạn thảo xác định rõ: Đảng lãnh đạo cuộc cách mạng dân tộc dân chủ nhân dân, tiến tới chủ nghĩa xã hội và chủ nghĩa cộng sản.",
      "Qua gần 20 năm bôn ba và tìm tòi, Nguyễn Tất Thành — Nguyễn Ái Quốc đã hoàn thành sứ mệnh lịch sử: tìm ra con đường cứu nước đúng đắn cho dân tộc Việt Nam.",
      "Con đường Người chọn — độc lập dân tộc gắn liền với chủ nghĩa xã hội — đã trở thành ngọn đuốc soi sáng cách mạng Việt Nam trong suốt thế kỷ XX và mãi về sau.",
    ],
    highlight: "1930 — Đảng Cộng sản Việt Nam ra đời, đánh dấu sự hoàn chỉnh của hành trình tìm đường cứu nước vĩ đại.",
    quote: "Chỉ có chủ nghĩa xã hội, chủ nghĩa cộng sản mới giải phóng được các dân tộc bị áp bức và những người lao động trên thế giới khỏi ách nô lệ.",
    accentColor: "#FFD700",
    bgTint: "rgba(255,215,0,0.04)",
  },
];
