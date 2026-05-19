'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import {
  createDemoRoom, createDemoPlayers, generateBotAnswers,
  DEMO_ROOM_ID, DEMO_HOST_ID,
} from '@/lib/demo/demoEngine';
import { getQuestionsForPhase } from '@/data/gameQuestions';
import { TOTAL_PHASES } from '@/data/gamePhases';
import type { RoomState, PlayerState } from '@/types/game';

export function useDemoGame() {
  const {
    setRoomState, setPlayers, roomState, players,
    setPlayerId, setNickname, setIsHost,
  } = useGameStore((s) => s);

  const botTimers = useRef<NodeJS.Timeout[]>([]);
  const hostTimer = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    botTimers.current.forEach(clearTimeout);
    botTimers.current = [];
    if (hostTimer.current) clearTimeout(hostTimer.current);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateRoom = useCallback((patch: Partial<RoomState>) => {
    useGameStore.setState((s) => ({
      roomState: s.roomState ? { ...s.roomState, ...patch } : null,
    }));
  }, []);

  // ── Bot answering simulation ───────────────────────────────────────────────

  const scheduleBotAnswers = useCallback((phaseIndex: number, questionIndex: number) => {
    const questions = getQuestionsForPhase(phaseIndex, DEMO_ROOM_ID);
    const question  = questions[questionIndex];
    if (!question) return;

    const botAnswers = generateBotAnswers(phaseIndex, questionIndex);

    botAnswers.forEach((answer) => {
      const t = setTimeout(() => {
        useGameStore.setState((s) => {
          const bot = s.players.find((p) => p.playerId === answer.botId);
          if (!bot) return s;
          const updatedBot: PlayerState = {
            ...bot,
            score:         bot.score + answer.pointsEarned,
            streak:        answer.isCorrect ? bot.streak + 1 : 0,
            glowLevel:     Math.min(100, Math.max(10, bot.glowLevel + (answer.isCorrect ? 15 : -8))),
            answers:       { ...bot.answers, [question.id]: answer.optionId },
            totalAnswered: bot.totalAnswered + 1,
            totalCorrect:  bot.totalCorrect + (answer.isCorrect ? 1 : 0),
          };
          return {
            players: s.players.map((p) => p.playerId === answer.botId ? updatedBot : p),
            roomState: s.roomState
              ? { ...s.roomState, answeredCount: s.roomState.answeredCount + 1 }
              : null,
          };
        });
      }, answer.delayMs);
      botTimers.current.push(t);
    });
  }, []);

  // ── Host game clock ───────────────────────────────────────────────────────

  const advanceGame = useCallback((currentRoom: RoomState) => {
    clearTimers();

    if (currentRoom.status === 'phase_intro') {
      hostTimer.current = setTimeout(() => {
        const questions = getQuestionsForPhase(currentRoom.phase, DEMO_ROOM_ID);
        if (questions.length > 0) {
          const newRoom: Partial<RoomState> = {
            status: 'question',
            currentQuestion: 0,
            countdown: questions[0].timeLimit,
            questionStartedAt: Date.now(),
            answeredCount: 0,
          };
          updateRoom(newRoom);
          scheduleBotAnswers(currentRoom.phase, 0);
        }
      }, 6_000);
    }

    if (currentRoom.status === 'question') {
      const questions = getQuestionsForPhase(currentRoom.phase, DEMO_ROOM_ID);
      const question  = questions[currentRoom.currentQuestion];
      if (!question) return;

      const elapsed   = (Date.now() - currentRoom.questionStartedAt) / 1_000;
      const remaining = Math.max(500, (question.timeLimit - elapsed) * 1_000);

      hostTimer.current = setTimeout(() => {
        updateRoom({ status: 'reviewing' });
      }, remaining);
    }

    if (currentRoom.status === 'reviewing') {
      hostTimer.current = setTimeout(() => {
        const questions = getQuestionsForPhase(currentRoom.phase, DEMO_ROOM_ID);
        const nextQ     = currentRoom.currentQuestion + 1;

        if (nextQ < questions.length) {
          updateRoom({
            status: 'question',
            currentQuestion: nextQ,
            countdown: questions[nextQ].timeLimit,
            questionStartedAt: Date.now(),
            answeredCount: 0,
          });
          scheduleBotAnswers(currentRoom.phase, nextQ);
        } else {
          const nextPhase = currentRoom.phase + 1;
          if (nextPhase < TOTAL_PHASES) {
            updateRoom({
              status: 'phase_intro',
              phase: nextPhase,
              currentQuestion: 0,
              answeredCount: 0,
            });
          } else {
            updateRoom({ status: 'result', endedAt: Date.now() });
          }
        }
      }, 5_000);
    }
  }, [updateRoom, scheduleBotAnswers]);

  // Watch room state changes and drive the game clock
  useEffect(() => {
    if (!roomState || roomState.roomId !== DEMO_ROOM_ID) return;
    advanceGame(roomState);
    return clearTimers;
  }, [roomState?.status, roomState?.phase, roomState?.currentQuestion]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const initDemo = useCallback((nickname: string) => {
    const room    = createDemoRoom();
    const players = createDemoPlayers(nickname || 'Người Chơi');
    setPlayerId(DEMO_HOST_ID);
    setNickname(nickname || 'Người Chơi');
    setIsHost(true);
    setRoomState(room);
    setPlayers(players);
  }, [setPlayerId, setNickname, setIsHost, setRoomState, setPlayers]);

  const startDemo = useCallback(() => {
    updateRoom({ status: 'phase_intro', phase: 0 });
  }, [updateRoom]);

  const submitDemoAnswer = useCallback((questionId: string, optionId: string, isCorrect: boolean, points: number) => {
    useGameStore.setState((s) => {
      const me = s.players.find((p) => p.playerId === DEMO_HOST_ID);
      if (!me) return s;
      const updated: PlayerState = {
        ...me,
        score:         me.score + points,
        streak:        isCorrect ? me.streak + 1 : 0,
        glowLevel:     Math.min(100, Math.max(10, me.glowLevel + (isCorrect ? 20 : -12))),
        answers:       { ...me.answers, [questionId]: optionId },
        totalAnswered: me.totalAnswered + 1,
        totalCorrect:  me.totalCorrect + (isCorrect ? 1 : 0),
      };
      return {
        players: s.players.map((p) => p.playerId === DEMO_HOST_ID ? updated : p),
        roomState: s.roomState
          ? { ...s.roomState, answeredCount: s.roomState.answeredCount + 1 }
          : null,
      };
    });
  }, []);

  return { initDemo, startDemo, submitDemoAnswer };
}
