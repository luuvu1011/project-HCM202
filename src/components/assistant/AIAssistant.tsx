"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SUGGESTED_QUESTIONS } from "@/data/aiMock";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { AssistantMessage } from "@/types/assistant";

function TypingLine({ text }: { text: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="whitespace-pre-wrap"
    >
      {text}
    </motion.span>
  );
}

const WELCOME: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Xin chào — mình là trợ lý lịch sử cho môn HCM202. Bạn hãy chọn một câu hỏi gợi ý hoặc tự đặt câu hỏi nhé.",
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: AssistantMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput("");
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextHistory
              .filter((m) => m.id !== "welcome")
              .map(({ role, content }) => ({ role, content })),
          }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok || !data.reply) {
          throw new Error(data.error ?? "Không nhận được phản hồi.");
        }
        const reply: AssistantMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply,
        };
        setMessages((m) => [...m, reply]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lỗi không xác định.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[45] flex flex-col items-end sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mb-3 w-[min(100vw-2.5rem,400px)]"
          >
            <GlassPanel
              className="p-0"
              style={{ background: "rgba(6,9,16,0.92)" }}
            >
              <div className="flex h-[min(75vh,560px)] flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-parchment">
                      Trợ lý lịch sử HCM202
                    </p>
                    <p className="text-[11px] text-parchment-muted">
                      Hỗ trợ bởi Gemini · môn HCM202
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-parchment-muted transition hover:bg-white/10 hover:text-parchment"
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
              >
                {messages.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "ml-auto bg-gold/20 text-parchment"
                        : "mr-auto border border-white/10 bg-white/[0.04] text-parchment-muted"
                    }`}
                  >
                    {m.role === "assistant" && idx === messages.length - 1 ? (
                      <TypingLine text={m.content} />
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                ))}
                {messages.length === 1 && !loading ? (
                  <div className="mr-auto mt-1 flex max-w-[92%] flex-wrap gap-1.5">
                    {SUGGESTED_QUESTIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        disabled={loading}
                        onClick={() => send(s.text)}
                        className="rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1.5 text-left text-[11px] text-parchment-muted/90 transition hover:border-gold/45 hover:bg-gold/10 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {s.text}
                      </button>
                    ))}
                  </div>
                ) : null}
                {loading ? (
                  <div className="mr-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-parchment-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    <span>Đang suy nghĩ…</span>
                  </div>
                ) : null}
                {error ? (
                  <div className="mr-auto rounded-2xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-parchment">
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="border-t border-white/10 px-5 py-3">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi về môn HCM202…"
                    disabled={loading}
                    className="flex-1 rounded-full border border-white/10 bg-ocean-deep/80 px-4 py-2 text-sm text-parchment outline-none ring-gold/30 placeholder:text-parchment-muted/50 focus:ring-2 disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    className="px-4 py-2"
                    disabled={loading || !input.trim()}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden />
                    )}
                  </Button>
                </form>
              </div>
              </div>
            </GlassPanel>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-glass-border bg-ocean-mid/90 text-parchment shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:border-gold/40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={open}
        aria-label="Mở trợ lý lịch sử"
      >
        <MessageCircle className="h-6 w-6 text-gold-soft" />
      </motion.button>
    </div>
  );
}
