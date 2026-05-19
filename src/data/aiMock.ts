import type { SuggestedQuestion } from "@/types/assistant";

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: "s1",
    text: "Vì sao Bác chọn con đường cách mạng vô sản?",
  },
  {
    id: "s2",
    text: "Bác học được gì ở Pháp và châu Âu?",
  },
  {
    id: "s3",
    text: "Tại sao các phong trào yêu nước trước thời kỳ Mác — Lênin thất bại?",
  },
  {
    id: "s4",
    text: "Cách mạng Tháng Mười ảnh hưởng thế nào đến con đường cứu nước?",
  },
  {
    id: "s5",
    text: "Truyền thống dân tộc và Mác — Lênin kết hợp ra sao trong tư tưởng Hồ Chí Minh?",
  },
];

/** Keyword mock — replace with retrieval + model later */
export function getMockAssistantReply(userText: string): string {
  const t = userText.toLowerCase();

  if (
    t.includes("vô sản") ||
    t.includes("cach mang vo san") ||
    t.includes("cách mạng vô sản")
  ) {
    return (
      "Trong học thuyết về tư tưởng Hồ Chí Minh, con đường cách mạng vô sản được hiểu như sự lựa chọn có cơ sở thực tiễn: " +
      "gắn khát vọng độc lập dân tộc với đấu tranh của nhân dân lao động, tổ chức và phương pháp cách mạng — tránh tách rời quần chúng hay sao chép hình thức bên ngoài."
    );
  }

  if (
    t.includes("pháp") ||
    t.includes("phap") ||
    t.includes("châu âu") ||
    t.includes("chau au")
  ) {
    return (
      "Ở Pháp và châu Âu, Nguyễn Ái Quốc quan sát mâu thuẫn giữa khẩu hiệu tiến bộ và thực tế thực dân — bóc lột; " +
      "tiếp cận phong trào công nhân, báo chí, các luận điểm dân chủ — xã hội. Đó là quá trình học từ thực tiễn để chọn lọc, không chấp nhận lý thuyết suông."
    );
  }

  if (
    t.includes("thất bại") ||
    t.includes("that bai") ||
    t.includes("phong trào") ||
    t.includes("phong trao")
  ) {
    return (
      "Nhiều phong trào yêu nước gặp hạn chế vì thiếu đường lối đúng, thiếu gắn bó sâu rộng với nông dân — công nhân, hoặc lệ thuộc lực lượng không vì lợi ích nhân dân. " +
      "Hồ Chí Minh rút kinh nghiệm để đi tới phương pháp khoa học cách mạng, sau này được hệ thống hóa trong học thuyết về tư tưởng Hồ Chí Minh."
    );
  }

  if (
    t.includes("tháng mười") ||
    t.includes("thang muoi") ||
    t.includes("1917") ||
    t.includes("liên xô") ||
    t.includes("lien xo") ||
    t.includes("lenin") ||
    t.includes("mác") ||
    t.includes("mac ")
  ) {
    return (
      "Cách mạng Tháng Mười mở ra khả năng lý luận mới cho các dân tộc bị áp bức: chủ nghĩa Mác — Lênin chỉ ra vai trò của giai cấp công nhân và tổ chức cách mạng. " +
      "Với Hồ Chí Minh, đây là điểm tựa phương pháp để giải quyết khủng hoảng đường lối, được vận dụng sáng tạo theo điều kiện Việt Nam."
    );
  }

  if (
    t.includes("1858") ||
    t.includes("thực dân") ||
    t.includes("thuc dan") ||
    t.includes("phong kiến") ||
    t.includes("phong kien")
  ) {
    return (
      "Sau 1858, xâm lược của thực dân Pháp đẩy Việt Nam vào khủng hoảng toàn diện: độc lập phong kiến suy yếu, kinh tế — xã hội phụ thuộc. " +
      "Bối cảnh đó giải thích vì sao các tìm kiếm cứu nước sau này phải vượt lên khỏi lối mòn cũ để tìm phương pháp và lực lượng mới."
    );
  }

  if (
    t.includes("nho") ||
    t.includes("phật") ||
    t.includes("phat") ||
    t.includes("lão") ||
    t.includes("lao") ||
    t.includes("truyền thống") ||
    t.includes("truyen thong")
  ) {
    return (
      "Truyền thống văn hóa dân tộc (trong đó có các giá trị từ Nho — Phật — Lão được diễn giải trong học thuật) hun đúc tinh thần cộng đồng và yêu nước. " +
      "Tư tưởng Hồ Chí Minh không phủ nhận di sản ấy mà kế thừa có chọn lọc, kết hợp với chân lý tiến bộ thời đại để hình thành hệ giá trị mới."
    );
  }

  return (
    "Đây là phản hồi minh họa (mock). Khi tích hợp AI thật, hệ thống nên trả lời dựa trên chương trình — giáo trình chính thống về lịch sử Việt Nam và học thuyết về tư tưởng Hồ Chí Minh, " +
    "kèm trích dẫn nguồn và mức độ phù hợp lứa tuổi."
  );
}
