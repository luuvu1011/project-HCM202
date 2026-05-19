'use client';

import { create } from 'zustand';
import type { RoomState, PlayerState, GameStatus } from '@/types/game';

interface GameStore {
  // Current player
  playerId: string | null;
  nickname: string;
  isHost: boolean;

  // Room
  roomState: RoomState | null;
  players: PlayerState[];

  // Local UI state
  myAnswer: string | null;
  hasAnswered: boolean;
  lastAnswerCorrect: boolean | null;
  pointsEarned: number;

  // Actions
  setPlayerId: (id: string) => void;
  setNickname: (name: string) => void;
  setIsHost: (v: boolean) => void;
  setRoomState: (state: RoomState) => void;
  setPlayers: (players: PlayerState[]) => void;
  setMyAnswer: (optionId: string, correct: boolean, points: number) => void;
  resetAnswer: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  playerId: null,
  nickname: '',
  isHost: false,
  roomState: null,
  players: [],
  myAnswer: null,
  hasAnswered: false,
  lastAnswerCorrect: null,
  pointsEarned: 0,

  setPlayerId:  (id)      => set({ playerId: id }),
  setNickname:  (name)    => set({ nickname: name }),
  setIsHost:    (v)       => set({ isHost: v }),
  setRoomState: (state)   => set({ roomState: state }),
  setPlayers:   (players) => set({ players }),

  setMyAnswer: (optionId, correct, points) =>
    set({ myAnswer: optionId, hasAnswered: true, lastAnswerCorrect: correct, pointsEarned: points }),

  resetAnswer: () =>
    set({ myAnswer: null, hasAnswered: false, lastAnswerCorrect: null, pointsEarned: 0 }),

  reset: () =>
    set({
      roomState: null,
      players: [],
      myAnswer: null,
      hasAnswered: false,
      lastAnswerCorrect: null,
      pointsEarned: 0,
      isHost: false,
    }),
}));

// ── Computed selectors ──────────────────────────────────────────────────────

export function useLeaderboard(players: PlayerState[]): PlayerState[] {
  return [...players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export function useMyPlayer(players: PlayerState[], playerId: string | null): PlayerState | undefined {
  return players.find((p) => p.playerId === playerId);
}

export function useOnlinePlayers(players: PlayerState[]): PlayerState[] {
  return players.filter((p) => p.isOnline);
}
