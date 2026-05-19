'use client';

import type { RoomState, PlayerState, GameStatus } from '@/types/game';
import { getQuestionsForPhase } from '@/data/gameQuestions';
import { TOTAL_PHASES } from '@/data/gamePhases';

// ── Fake player pool ──────────────────────────────────────────────────────

const BOT_NAMES = [
  'Nguyễn Hùng', 'Lê Thị Mai', 'Trần Quốc Anh', 'Phạm Minh Đức',
  'Hoàng Thị Lan', 'Vũ Thanh Nam', 'Đặng Thị Hoa', 'Bùi Văn Khoa',
];

export const DEMO_ROOM_ID = 'DEMO00';
export const DEMO_HOST_ID = 'demo-host';

export function createDemoPlayers(nickname: string): PlayerState[] {
  const me: PlayerState = {
    playerId: DEMO_HOST_ID,
    nickname,
    score: 0,
    streak: 0,
    glowLevel: 30,
    answers: {},
    ready: true,
    isOnline: true,
    isHost: true,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
    totalCorrect: 0,
    totalAnswered: 0,
    rank: 1,
  };

  const bots: PlayerState[] = BOT_NAMES.slice(0, 5).map((name, i) => ({
    playerId: `bot-${i}`,
    nickname: name,
    score: 0,
    streak: 0,
    glowLevel: 20 + i * 8,
    answers: {},
    ready: true,
    isOnline: true,
    isHost: false,
    joinedAt: Date.now() - i * 3_000,
    lastSeen: Date.now(),
    totalCorrect: 0,
    totalAnswered: 0,
    rank: i + 2,
  }));

  return [me, ...bots];
}

// ── Bot intelligence ────────────────────────────────────────────────────────
// Each bot has accuracy 55-90% and delay 3-18s

const BOT_PROFILES = [
  { accuracy: 0.85, avgDelayMs: 5_000 },
  { accuracy: 0.70, avgDelayMs: 8_000 },
  { accuracy: 0.55, avgDelayMs: 12_000 },
  { accuracy: 0.90, avgDelayMs: 3_500 },
  { accuracy: 0.65, avgDelayMs: 10_000 },
];

interface BotAnswer {
  botId: string;
  optionId: string;
  isCorrect: boolean;
  delayMs: number;
  pointsEarned: number;
}

export function generateBotAnswers(
  phaseIndex: number,
  questionIndex: number,
): BotAnswer[] {
  const questions = getQuestionsForPhase(phaseIndex, DEMO_ROOM_ID);
  const question  = questions[questionIndex];
  if (!question) return [];

  const correctOption = question.options.find((o) => o.isCorrect);
  const wrongOptions  = question.options.filter((o) => !o.isCorrect);

  return BOT_PROFILES.map((profile, i) => {
    const correct    = Math.random() < profile.accuracy;
    const jitter     = (Math.random() - 0.5) * 4_000;
    const delayMs    = Math.max(2_000, profile.avgDelayMs + jitter);
    const speedPct   = Math.max(0, 1 - delayMs / (question.timeLimit * 1_000));
    const points     = correct ? question.points + Math.round(speedPct * 50) : 0;
    const option     = correct
      ? correctOption ?? question.options[0]
      : wrongOptions[Math.floor(Math.random() * wrongOptions.length)] ?? question.options[1];

    return {
      botId: `bot-${i}`,
      optionId: option.id,
      isCorrect: correct,
      delayMs,
      pointsEarned: points,
    };
  });
}

// ── Demo room state factory ─────────────────────────────────────────────────

export function createDemoRoom(): RoomState {
  return {
    roomId: DEMO_ROOM_ID,
    hostId: DEMO_HOST_ID,
    status: 'waiting',
    phase: 0,
    currentQuestion: 0,
    countdown: 0,
    questionStartedAt: 0,
    createdAt: Date.now(),
    maxPlayers: 30,
    answeredCount: 0,
  };
}
