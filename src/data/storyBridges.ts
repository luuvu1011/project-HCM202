/** Cinematic interludes between major sections — narrator voice, no fabricated verbatim quotes */

export interface StoryBridgeContent {
  id: string;
  /** Short era / theme label */
  era: string;
  /** 1–2 sentences — emotional / intellectual pivot */
  narration: string;
  /** Pull-quote style line — thematic paraphrase for cinema, not a cited manuscript line */
  emphasis: string;
}

export const STORY_AFTER_HERO: StoryBridgeContent = {
  id: "after-hero",
  era: "Việt Nam — bối cảnh đầu thế kỷ XX",
  narration:
    "Từ một nền độc lập phong kiến đến khủng hoảng thuộc địa: yêu nước bùng cháy nhưng đường cứu nước còn mờ — cần một cách nhìn mới từ thế giới.",
  emphasis:
    "Ra đi là chọn thực tiễn làm thước đo — không phải chạy trốn, mà đối diện với lịch sử.",
};

export const STORY_AFTER_MAP: StoryBridgeContent = {
  id: "after-map",
  era: "Thế giới — đế quốc chủ nghĩa & các làn sóng tư tưởng",
  narration:
    "Chiến tranh thế giới, Cách mạng Tháng Mười, và những tranh luận về Tự do — Bình đẳng — Bác ái đặt ra câu hỏi: giải phóng thật sự nằm ở khẩu hiệu hay ở quyền lực của ai?",
  emphasis:
    "Mỗi bến cảng là một lớp học: quan sát — đối chiếu — tỉnh táo trước ảo tưởng.",
};

export const STORY_BEFORE_GAMES: StoryBridgeContent = {
  id: "before-games",
  era: "Từ nhận thức đến luyện tập",
  narration:
    "Tư tưởng Hồ Chí Minh được hình thành trong va chạm giữa truyền thống dân tộc và chân lý tiến bộ thời đại — kết tinh thành con đường độc lập dân tộc gắn với chủ nghĩa xã hội. Giờ hãy khóa lại nhịp lịch sử bằng trò chơi ngắn: sắp xếp dòng thời gian và kiểm tra hiểu biết.",
  emphasis:
    "Hiểu lịch sử là biết đặt sự kiện đúng chỗ trong logic của thời đại — và trong lòng nhân dân.",
};

export const STORY_BEFORE_ASSISTANT: StoryBridgeContent = {
  id: "before-assistant",
  era: "Đối thoại — mở câu hỏi tiếp theo",
  narration:
    "Những câu hỏi về con đường cách mạng vô sản, thất bại của các phong trào cũ, hay vai trò của Mác — Lênin, tiếp tục mở rộng lớp học này.",
  emphasis:
    "Tri thức sống khi được đặt trong câu hỏi đúng — và trong lòng nhân dân.",
};
