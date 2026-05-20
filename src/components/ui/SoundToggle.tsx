"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useYouTubeAudio } from "@/hooks/useYouTubeAudio";

// Background music — Vietnamese patriotic song (YouTube)
// Source: https://www.youtube.com/watch?v=ZpCjyf99fq0
const BG_VIDEO_ID = "ZpCjyf99fq0";
const INITIAL_VOLUME = 0.45;

export function SoundToggle() {
  const { play, pause, playing, loading } = useYouTubeAudio(BG_VIDEO_ID, INITIAL_VOLUME);
  const [shown, setShown] = useState(false);

  // Show after first scroll (same as before — non-intrusive entrance)
  useEffect(() => {
    const handler = () => setShown(true);
    window.addEventListener("scroll", handler, { once: true, passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggle = useCallback(() => {
    if (playing) pause();
    else void play();
  }, [playing, play, pause]);

  const isActive = playing || loading;

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          key="sound-btn"
          type="button"
          onClick={toggle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.35 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label={playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
          title={playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
          className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 sm:bottom-8 sm:left-8"
          style={{
            background: isActive ? "rgba(200,16,46,0.90)" : "rgba(10,18,32,0.85)",
            border: `1px solid ${isActive ? "rgba(255,215,0,0.45)" : "rgba(200,16,46,0.30)"}`,
            backdropFilter: "blur(12px)",
            boxShadow: isActive
              ? "0 0 20px rgba(200,16,46,0.40)"
              : "0 4px 20px rgba(0,0,0,0.35)",
          }}
        >
          {loading && !playing ? (
            // Loading spinner while YouTube buffers the first chunk
            <motion.span
              key="loading"
              aria-hidden
              className="h-5 w-5 rounded-full border-2"
              style={{
                borderColor: "rgba(255,215,0,0.25)",
                borderTopColor: "#FFD700",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
          ) : playing ? (
            // Playing — animated equalizer bars
            <motion.span
              key="on"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-[3px]"
              style={{ height: 18 }}
            >
              {[1, 1.6, 0.8, 1.3, 0.6].map((h, i) => (
                <motion.span
                  key={i}
                  className="rounded-full"
                  style={{ width: 3, background: "#FFD700" }}
                  animate={{ height: [6 * h, 16 * h, 6 * h] }}
                  transition={{
                    duration: 0.55 + i * 0.12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.span>
          ) : (
            // Muted — speaker-with-X icon
            <motion.span key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(200,16,46,0.8)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            </motion.span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
