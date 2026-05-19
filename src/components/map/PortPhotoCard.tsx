"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  name: string;
  era: string;
  imageUrl: string;
  tint: string;
  reached: boolean;
  hovered: boolean;
  side: "top" | "bottom";
  rotate?: number;
}

/**
 * Small "polaroid"-style photo card hiển thị bên trên (hoặc dưới) port dot.
 * Tự động chuyển sang gradient tint nếu ảnh fail load.
 */
export function PortPhotoCard({ name, era, imageUrl, tint, reached, hovered, side, rotate = 0 }: Props) {
  const [imgError, setImgError] = useState(false);

  const isAbove = side === "top";

  return (
    <div
      className="pointer-events-none absolute left-1/2"
      style={{
        // Nằm trên hoặc dưới dot, cách 14px
        top:    isAbove ? "auto"  : "calc(100% + 14px)",
        bottom: isAbove ? "calc(100% + 14px)" : "auto",
        transform: `translateX(-50%) rotate(${rotate}deg)`,
        transformOrigin: isAbove ? "bottom center" : "top center",
        zIndex: hovered ? 35 : 26,
      }}
    >
      <motion.div
        className="flex flex-col items-center"
        animate={{
          scale:   hovered ? 1.18 : 1,
          y:       hovered ? (isAbove ? -3 : 3) : 0,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
      >
        {/* Frame polaroid */}
        <div
          className="overflow-hidden"
          style={{
            width:  62,
            height: 46,
            background: "#FFFFFF",
            padding: 2.5,
            paddingBottom: 9,
            borderRadius: 2,
            boxShadow: reached
              ? "0 6px 18px rgba(200,16,46,0.30), 0 0 0 1px rgba(200,16,46,0.20)"
              : "0 4px 12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            opacity: reached ? 1 : 0.78,
            filter:  reached ? "saturate(1.05)" : "saturate(0.7)",
            transition: "opacity 0.6s, filter 0.6s",
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{ width: "100%", height: "100%", background: tint, borderRadius: 1 }}
          >
            {!imgError && (
              <img
                src={imageUrl}
                alt={name}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
            {/* Subtle vignette */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.30) 100%)" }}
            />
            {/* Red dot when reached (top-right corner — film marker) */}
            {reached && (
              <span
                className="absolute"
                style={{
                  top: 2, right: 2,
                  width: 4, height: 4, borderRadius: 999,
                  background: "#FFD700",
                  boxShadow: "0 0 4px rgba(255,215,0,0.8)",
                }}
              />
            )}
          </div>
        </div>

        {/* Name caption (handwritten-feel) */}
        <p
          className="mt-1 text-center font-cinzel font-bold whitespace-nowrap select-none"
          style={{
            fontSize: 8,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: reached ? "#1a0506" : "rgba(26,5,6,0.45)",
            textShadow: "0 1px 0 rgba(255,255,255,0.6)",
            lineHeight: 1.2,
          }}
        >
          {name}
        </p>

        {/* Tiny era under name (only on hover) */}
        <motion.p
          className="text-center font-cinzel whitespace-nowrap select-none"
          style={{
            fontSize: 7,
            color: "#C8102E",
            letterSpacing: "0.18em",
            lineHeight: 1.1,
          }}
          animate={{ opacity: hovered ? 1 : 0, height: hovered ? 9 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {era}
        </motion.p>

        {/* Connecting line từ card xuống/lên dot — chỉ hiện khi reached */}
        {reached && (
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top:    isAbove ? "100%" : "auto",
              bottom: isAbove ? "auto" : "100%",
              width: 1.5,
              height: 12,
              background: "linear-gradient(to bottom, #C8102E, rgba(200,16,46,0.2))",
              transform: `translateX(-50%) ${isAbove ? "" : "scaleY(-1)"}`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
