import type { HandLandmark, HandLandmarks } from "@/types/gestures";

// ─── Landmark index constants (MediaPipe hand model spec) ────────────────────
// 0=wrist, 1-4=thumb (CMC, MCP, IP, TIP), 5-8=index, 9-12=middle, 13-16=ring, 17-20=pinky
const WRIST = 0;
const THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4;
const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_TIP = 8;
const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_TIP = 12;
const RING_MCP = 13, RING_PIP = 14, RING_TIP = 16;
const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_TIP = 20;

// ─── 2D distance (we ignore z for thresholds — normalized coords) ────────────
function dist(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Đo "kích thước" bàn tay = khoảng cách cổ tay → ngón giữa MCP.
 * Dùng để chuẩn hoá threshold theo từng frame (xa/gần camera).
 */
function handSize(lm: HandLandmarks): number {
  return dist(lm[WRIST], lm[MIDDLE_MCP]) || 0.001;
}

/**
 * Một ngón được coi là "duỗi" nếu TIP cách cổ tay XA HƠN PIP cách cổ tay.
 * Robust với mọi orientation (tay giơ lên / ngang / nghiêng).
 */
function isFingerExtended(lm: HandLandmarks, tip: number, pip: number): boolean {
  const w = lm[WRIST];
  const tipD = dist(lm[tip], w);
  const pipD = dist(lm[pip], w);
  // Margin tránh false-positive khi ngón hơi cong nhưng TIP vẫn xa hơn PIP một chút
  return tipD > pipD * 1.05;
}

function isThumbExtended(lm: HandLandmarks): boolean {
  // Thumb extends sideways. TIP must be further from wrist than IP.
  const tipDist = dist(lm[THUMB_TIP], lm[WRIST]);
  const ipDist = dist(lm[THUMB_IP], lm[WRIST]);
  return tipDist > ipDist;
}

function isThumbUp(lm: HandLandmarks): boolean {
  // For thumbs-up specifically, thumb TIP must be noticeably ABOVE thumb MCP (y smaller).
  // Margin relaxed to 0.02 so users don't need a perfectly vertical thumb.
  return lm[THUMB_TIP].y < lm[THUMB_MCP].y - 0.02 && lm[THUMB_TIP].y < lm[THUMB_IP].y;
}

// ─── Gesture: 👍 THUMBS UP ───────────────────────────────────────────────────
// Rule: thumb pointing up, 4 other fingers curled.
export interface RuleResult {
  match: boolean;
  confidence: number; // 0..1
}

export function ruleThumbsUp(hands: HandLandmarks[]): RuleResult {
  if (hands.length === 0) return { match: false, confidence: 0 };
  const lm = hands[0];

  const thumbUp = isThumbUp(lm);
  const indexCurled = !isFingerExtended(lm, INDEX_TIP, INDEX_PIP);
  const middleCurled = !isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP);
  const ringCurled = !isFingerExtended(lm, RING_TIP, RING_PIP);
  const pinkyCurled = !isFingerExtended(lm, PINKY_TIP, PINKY_PIP);

  const curledCount = [indexCurled, middleCurled, ringCurled, pinkyCurled].filter(Boolean).length;
  const match = thumbUp && curledCount >= 3;
  const confidence = (thumbUp ? 0.4 : 0) + (curledCount / 4) * 0.6;
  return { match, confidence };
}

// ─── Gesture: ✋ OPEN HAND (held) ────────────────────────────────────────────
// Rule: all 5 fingers extended, hand steady. Steadiness checked outside via buffer.
export function ruleOpenHand(hands: HandLandmarks[]): RuleResult {
  if (hands.length === 0) return { match: false, confidence: 0 };
  const lm = hands[0];

  const fingers = [
    isFingerExtended(lm, INDEX_TIP, INDEX_PIP),
    isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP),
    isFingerExtended(lm, RING_TIP, RING_PIP),
    isFingerExtended(lm, PINKY_TIP, PINKY_PIP),
  ];
  const thumbOut = isThumbExtended(lm);
  const extendedCount = fingers.filter(Boolean).length + (thumbOut ? 1 : 0);

  // Cho phép 4/5 ngón duỗi vẫn coi là "open hand" (ngón cái thường khó duỗi đủ xa).
  const match = extendedCount >= 4;
  const confidence = extendedCount / 5;
  return { match, confidence };
}

// ─── Gesture: ✊ FIST (closed hand) ─────────────────────────────────────────
// Rule: 4 ngón cong vào lòng tay + ngón cái khép (kề ngón trỏ HOẶC giữa).
// Thêm kiểm tra "tip gần palm center" để đỡ phụ thuộc orientation.
export function ruleFist(hands: HandLandmarks[]): RuleResult {
  if (hands.length === 0) return { match: false, confidence: 0 };
  const lm = hands[0];
  const indexCurled = !isFingerExtended(lm, INDEX_TIP, INDEX_PIP);
  const middleCurled = !isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP);
  const ringCurled = !isFingerExtended(lm, RING_TIP, RING_PIP);
  const pinkyCurled = !isFingerExtended(lm, PINKY_TIP, PINKY_PIP);
  const curledCount = [indexCurled, middleCurled, ringCurled, pinkyCurled].filter(Boolean).length;

  const hs = handSize(lm);

  // Palm center = average of 4 MCP joints (knuckles)
  const palmX =
    (lm[INDEX_MCP].x + lm[MIDDLE_MCP].x + lm[RING_MCP].x + lm[PINKY_MCP].x) / 4;
  const palmY =
    (lm[INDEX_MCP].y + lm[MIDDLE_MCP].y + lm[RING_MCP].y + lm[PINKY_MCP].y) / 4;
  const palmCenter = { x: palmX, y: palmY, z: 0 };

  // How many fingertips are close to palm center → strong fist signal
  const tipsToPalm = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP].filter(
    (tip) => dist(lm[tip], palmCenter) < hs * 0.70,
  ).length;

  // Thumb: accept if close to either index PIP, middle PIP, or palm center
  const thumbToIndex = dist(lm[THUMB_TIP], lm[INDEX_PIP]) < hs * 0.65;
  const thumbToMiddle = dist(lm[THUMB_TIP], lm[MIDDLE_PIP]) < hs * 0.65;
  const thumbToPalm = dist(lm[THUMB_TIP], palmCenter) < hs * 0.70;
  const thumbTucked = thumbToIndex || thumbToMiddle || thumbToPalm;

  // Cần ≥ 3 ngón cong VÀ ≥ 1 đầu ngón gần palm — threshold được nới lỏng
  // để nhận diện nắm đấm ở nhiều góc độ và khoảng cách khác nhau.
  const match = curledCount >= 3 && tipsToPalm >= 1;
  const confidence =
    (curledCount / 4) * 0.45 + (tipsToPalm / 4) * 0.40 + (thumbTucked ? 0.15 : 0);
  return { match, confidence };
}

// ─── Gesture: 👋 WAVE ───────────────────────────────────────────────────────
// Wave requires temporal data — handled in recognizer via wrist x-position buffer.
// Here we expose helpers for the recognizer's buffer logic.
export function isOpenPalm(lm: HandLandmarks): boolean {
  const fingers = [
    isFingerExtended(lm, INDEX_TIP, INDEX_PIP),
    isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP),
    isFingerExtended(lm, RING_TIP, RING_PIP),
    isFingerExtended(lm, PINKY_TIP, PINKY_PIP),
  ];
  // Cần ít nhất 3/4 ngón (trừ ngón cái) duỗi — wave thường cử động nhanh,
  // có frame ngón rung làm số ngón giảm tạm thời.
  return fingers.filter(Boolean).length >= 3;
}

export function wristX(lm: HandLandmarks): number {
  return lm[WRIST].x;
}

// ─── Gesture: ❤️ HEART (two hands forming heart) ─────────────────────────────
// Rule: 2 hands present, thumb tips + index tips approximate to form a heart.
export function ruleHeart(hands: HandLandmarks[]): RuleResult {
  if (hands.length < 2) return { match: false, confidence: 0 };
  const h1 = hands[0];
  const h2 = hands[1];

  // Approx hand scale = mean of two hand sizes
  const scale = (handSize(h1) + handSize(h2)) / 2;

  // Distance between the two index TIPs (bottom-point of heart)
  const indexGap = dist(h1[INDEX_TIP], h2[INDEX_TIP]);
  // Distance between the two thumb TIPs (top opening of heart — may touch)
  const thumbGap = dist(h1[THUMB_TIP], h2[THUMB_TIP]);

  // Index tips should meet (small gap), thumb tips also close-ish.
  // Thresholds relaxed so users don't need a perfectly drawn heart.
  const indexClose = indexGap < scale * 0.75;
  const thumbClose = thumbGap < scale * 1.10;

  // Hands must be roughly symmetric horizontally
  const wristXDiff = Math.abs(h1[WRIST].x - h2[WRIST].x);
  const handsApart = wristXDiff > scale * 0.35; // not overlapping
  const handsNotTooFar = wristXDiff < scale * 4.0;

  const match = indexClose && thumbClose && handsApart && handsNotTooFar;
  let confidence = 0;
  if (indexClose) confidence += 0.35;
  if (thumbClose) confidence += 0.30;
  if (handsApart && handsNotTooFar) confidence += 0.35;
  return { match, confidence };
}
