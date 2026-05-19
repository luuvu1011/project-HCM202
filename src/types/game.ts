export type GameStatus =
  | 'waiting'
  | 'countdown'
  | 'phase_intro'
  | 'question'
  | 'reviewing'
  | 'transitioning'
  | 'result';

export type PhaseId =
  | 'ben_nha_rong'
  | 'marseille'
  | 'new_york'
  | 'london'
  | 'paris'
  | 'moscow'
  | 'guangzhou'
  | 'pac_bo';

export interface GamePhase {
  id: PhaseId;
  index: number;
  name: string;
  year: string;
  location: string;
  country: string;
  coordinates: [number, number]; // [lat, lng]
  description: string;
  narration: string;
  historicalFact: string;
  accentColor: string;
  accentColorRgb: string; // "r,g,b" for CSS
  backgroundFrom: string;
  backgroundTo: string;
  questionCount: number;
}

export type QuestionType =
  | 'multiple_choice'
  | 'document_decode'
  | 'ideology_choice';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface GameQuestion {
  id: string;
  phaseId: PhaseId;
  type: QuestionType;
  text: string;
  subtitle?: string;
  options: QuestionOption[];
  timeLimit: number;
  points: number;
  hint?: string;
  documentText?: string;
}

export interface PlayerState {
  playerId: string;
  nickname: string;
  score: number;
  streak: number;
  glowLevel: number; // 0–100
  answers: Record<string, string>; // questionId -> optionId
  ready: boolean;
  isOnline: boolean;
  isHost: boolean;
  joinedAt: number;
  lastSeen: number;
  totalCorrect: number;
  totalAnswered: number;
  rank?: number;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  status: GameStatus;
  phase: number;
  currentQuestion: number;
  countdown: number;
  questionStartedAt: number;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  maxPlayers: number;
  answeredCount: number;
}

export interface LeaderboardEntry {
  playerId: string;
  nickname: string;
  score: number;
  rank: number;
  glowLevel: number;
  isCurrentPlayer: boolean;
  streak: number;
}

export interface GameAnswer {
  playerId: string;
  questionId: string;
  optionId: string;
  timeMs: number;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: number;
}
