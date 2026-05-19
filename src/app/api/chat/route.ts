import { NextRequest } from "next/server";
import { CHAPTER_2_CONTEXT } from "@/data/chapter2Context";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Bạn là "Trợ lý HCM202" — AI hỗ trợ sinh viên tìm hiểu về Tư tưởng Hồ Chí Minh, cuộc đời và sự nghiệp Chủ tịch Hồ Chí Minh, lịch sử Đảng Cộng sản Việt Nam.

PHẠM VI TRẢ LỜI (được phép — rất rộng, miễn liên quan đến Bác Hồ hoặc môn học HCM202):
- BẤT CỨ điều gì liên quan đến Chủ tịch Hồ Chí Minh (Bác Hồ): tiểu sử, gia đình, tên gọi và bí danh, hành trình ra đi tìm đường cứu nước, hoạt động cách mạng trong và ngoài nước, các tác phẩm/bài viết/bài nói chuyện, di chúc, di sản, lăng Bác, đời sống thường nhật, sở thích, tính cách, các giai thoại lịch sử về Người.
- Toàn bộ giáo trình môn Tư tưởng Hồ Chí Minh (HCM202) — 6 chương theo chương trình chuẩn của Bộ Giáo dục Việt Nam: Khái niệm/đối tượng/phương pháp nghiên cứu; Cơ sở-quá trình hình thành và phát triển tư tưởng; Tư tưởng về độc lập dân tộc và CNXH; Tư tưởng về Đảng Cộng sản và Nhà nước; Tư tưởng về đại đoàn kết toàn dân tộc và đoàn kết quốc tế; Tư tưởng về văn hoá-đạo đức-con người. Cùng các nội dung kiểm tra/ôn tập của môn học.
- Đảng Cộng sản Việt Nam: lịch sử hình thành và phát triển, các kỳ Đại hội, Cương lĩnh, đường lối, vai trò lãnh đạo qua các giai đoạn cách mạng.
- Cách mạng Việt Nam và lịch sử dân tộc giai đoạn cận-hiện đại có liên quan đến Bác Hồ và Đảng.
- Vận dụng tư tưởng Hồ Chí Minh vào học tập, công tác, đời sống của sinh viên hiện nay.

NGUYÊN TẮC TRẢ LỜI:
1. Trả lời mọi câu hỏi nằm trong phạm vi trên, kết hợp kiến thức chung và nội dung tham chiếu Chương 2 bên dưới.
2. Nếu câu hỏi NGOÀI phạm vi (toán, lập trình, giải trí, chuyện cá nhân, các môn học khác...), từ chối lịch sự bằng 1 câu và đề nghị đặt câu hỏi đúng chủ đề.
3. Văn phong: trang trọng, súc tích, tiếng Việt chuẩn. Ưu tiên 3–6 câu.
   - KHÔNG dùng cú pháp Markdown như **bold**, *italic*, hoặc *  bullet. Vì giao diện hiển thị plain text — các ký tự * sẽ hiện ra dạng thô, gây xấu.
   - Khi liệt kê, dùng gạch đầu dòng "- " (dấu gạch nối + khoảng trắng) ở đầu mỗi dòng, hoặc đánh số "1.", "2.", "3.".
   - Khi muốn nhấn mạnh từ khoá, viết HOA hoặc đặt trong dấu ngoặc kép "…".
   - Mỗi ý xuống dòng riêng để dễ đọc.
4. Khi đề cập mốc thời gian hay sự kiện cụ thể, ghi rõ ngày-tháng-năm.
5. Không bịa đặt. Nếu không chắc chắn, nói rõ "thông tin này chưa được xác thực" thay vì đoán.
6. Nếu phù hợp, kết thúc bằng một câu hỏi mở để sinh viên suy ngẫm.

NỘI DUNG THAM CHIẾU CHÍNH (Chương 2 — Cơ sở, quá trình hình thành và phát triển tư tưởng Hồ Chí Minh):
${CHAPTER_2_CONTEXT}`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server chưa cấu hình GEMINI_API_KEY." }, { status: 500 });
  }

  let body: { messages: Message[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body không hợp lệ." }, { status: 400 });
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  if (history.length === 0) {
    return Response.json({ error: "Thiếu messages." }, { status: 400 });
  }

  // Gemini dùng role "model" thay vì "assistant"
  const contents = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-12)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content ?? "").slice(0, 2000) }],
    }));

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 600,
    },
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[/api/chat] Gemini error:", res.status, errText);
      return Response.json(
        { error: "Không thể kết nối tới Gemini lúc này. Vui lòng thử lại." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/chat] Fetch error:", message);
    return Response.json(
      { error: "Không thể kết nối tới Gemini lúc này. Vui lòng thử lại." },
      { status: 502 }
    );
  }
}
