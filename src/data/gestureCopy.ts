import type { GestureKind } from "@/types/gestures";

export interface GestureCopy {
  kind: GestureKind;
  /** Emoji-free icon (text symbol) for instruction card */
  symbol: string;
  /** Tên cử chỉ */
  label: string;
  /** Hướng dẫn ngắn cách tạo cử chỉ */
  hint: string;
  /** Câu cảm xúc hiển thị khi effect trigger */
  emotion: string;
}

export const GESTURE_COPY: Record<GestureKind, GestureCopy> = {
  heart: {
    kind: "heart",
    symbol: "♥",
    label: "Trái tim",
    hint: "Chạm hai đầu ngón trỏ và ngón cái lại với nhau",
    emotion: "Việt Nam trong tim",
  },
  thumbsUp: {
    kind: "thumbsUp",
    symbol: "↑",
    label: "Ngón cái lên",
    hint: "Nắm tay lại và giơ ngón cái thẳng lên",
    emotion: "Rồng thiêng Đại Việt",
  },
  wave: {
    kind: "wave",
    symbol: "≈",
    label: "Vẫy tay",
    hint: "Mở bàn tay rồi vẫy nhẹ qua lại",
    emotion: "Đất Mẹ Việt Nam",
  },
  special: {
    kind: "special",
    symbol: "✊",
    label: "Nắm bàn tay",
    hint: "Nắm chặt năm ngón tay thành nắm đấm và giữ yên",
    emotion: "Chim Lạc — hồn thiêng dân tộc",
  },
};

export const GESTURE_ORDER: GestureKind[] = ["heart", "thumbsUp", "wave", "special"];

export const SECTION_COPY = {
  eyebrow: "TƯƠNG TÁC · CỬ CHỈ",
  title: "Chạm vào lịch sử",
  description:
    "Một khoảnh khắc nhỏ để bạn gửi cảm xúc tới hành trình. Bật camera, thử bốn cử chỉ — mỗi cử chỉ là một nhịp đập của lòng yêu nước.",
  cameraOff: "Bật camera để bắt đầu",
  cameraRequesting: "Đang xin quyền truy cập camera…",
  cameraDenied: "Camera bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt rồi thử lại.",
  cameraError: "Không thể mở camera. Bạn có thể xem chế độ demo bên dưới.",
  privacy: "Video chỉ xử lý trên trình duyệt của bạn, không gửi đi đâu.",
  idleHint: "Thử một cử chỉ ở phần bên trái",
  retry: "Thử lại",
  stop: "Tắt camera",
  demoMode: "Xem chế độ demo",
};
