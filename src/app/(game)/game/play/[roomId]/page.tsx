'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { usePlayerPresence } from '@/hooks/usePlayerPresence';
import {
  advanceToPhaseIntro, startQuestion, startReviewing, endGame,
  submitAnswer, ensureAnonymousAuth,
} from '@/lib/firebase/firestore';
import { getQuestionsForPhase } from '@/data/gameQuestions';
import { getPhase, TOTAL_PHASES } from '@/data/gamePhases';
import { OceanCanvas }        from '@/components/ocean-game/OceanCanvas';
import { WorldMapBackground } from '@/components/ocean-game/WorldMapBackground';
import { RouteSystem }        from '@/components/ocean-game/RouteSystem';
import { PlayerShipLayer }    from '@/components/ocean-game/PlayerShipLayer';
import { OceanReactions }     from '@/components/ocean-game/OceanReactions';
import { PhaseIntro }         from '@/components/cinematic/PhaseIntro';
import { CinematicQuestion }  from '@/components/game-ui/CinematicQuestion';
import { OceanHUD }           from '@/components/game-ui/OceanHUD';

type UIStage = 'syncing' | 'phase_intro' | 'question' | 'reviewing' | 'result';

export default function PlayPage() {
  const params  = useParams();
  const router  = useRouter();
  const roomId  = typeof params.roomId === 'string' ? params.roomId : '';

  const {
    roomState, players, playerId, isHost, hasAnswered, resetAnswer, setPlayerId,
  } = useGameStore((s) => s);

  const [uiStage, setUiStage]         = useState<UIStage>('syncing');
  const [reactionResult, setReaction] = useState<boolean | null>(null);
  const hostTimerRef = useRef<NodeJS.Timeout | null>(null);

  useRealtimeRoom(roomId);
  usePlayerPresence(roomId, playerId);

  useEffect(() => {
    if (playerId) return;
    ensureAnonymousAuth().then(setPlayerId);
  }, []);

  // ── Sync UI to Firestore room status ──────────────────────────────────────
  useEffect(() => {
    if (!roomState) return;
    switch (roomState.status) {
      case 'waiting':
        router.replace(`/game/lobby/${roomId}`);
        break;
      case 'countdown':
        setUiStage('syncing');
        break;
      case 'phase_intro':
        setUiStage('phase_intro');
        resetAnswer();
        setReaction(null);
        break;
      case 'question':
        setUiStage('question');
        resetAnswer();
        break;
      case 'reviewing':
        setUiStage('reviewing');
        break;
      case 'result':
        router.replace(`/game/result/${roomId}`);
        break;
    }
  }, [roomState?.status, roomState?.phase, roomState?.currentQuestion]);

  // ── Host-driven game clock ────────────────────────────────────────────────
  useEffect(() => {
    if (!isHost || !roomState) return;
    if (hostTimerRef.current) clearTimeout(hostTimerRef.current);

    if (roomState.status === 'phase_intro') {
      hostTimerRef.current = setTimeout(async () => {
        const qs = getQuestionsForPhase(roomState.phase, roomId);
        if (qs.length > 0) await startQuestion(roomId, 0, qs[0].timeLimit);
      }, 6_500);
    }

    if (roomState.status === 'question') {
      const qs       = getQuestionsForPhase(roomState.phase, roomId);
      const q        = qs[roomState.currentQuestion];
      if (!q) return;
      const elapsed  = (Date.now() - roomState.questionStartedAt) / 1_000;
      const remain   = Math.max(500, (q.timeLimit - elapsed) * 1_000);
      hostTimerRef.current = setTimeout(() => startReviewing(roomId), remain);
    }

    if (roomState.status === 'reviewing') {
      hostTimerRef.current = setTimeout(async () => {
        const qs     = getQuestionsForPhase(roomState.phase, roomId);
        const nextQ  = roomState.currentQuestion + 1;
        if (nextQ < qs.length) {
          await startQuestion(roomId, nextQ, qs[nextQ].timeLimit);
        } else {
          const nextP = roomState.phase + 1;
          if (nextP < TOTAL_PHASES) await advanceToPhaseIntro(roomId, nextP);
          else                       await endGame(roomId);
        }
      }, 5_500);
    }

    return () => { if (hostTimerRef.current) clearTimeout(hostTimerRef.current); };
  }, [isHost, roomState?.status, roomState?.phase, roomState?.currentQuestion]);

  // ── Answer handler ────────────────────────────────────────────────────────
  const handleAnswer = async (optionId: string) => {
    if (!roomState || !playerId || hasAnswered) return;
    const qs      = getQuestionsForPhase(roomState.phase, roomId);
    const q       = qs[roomState.currentQuestion];
    if (!q) return;

    const option   = q.options.find((o) => o.id === optionId);
    const correct  = option?.isCorrect ?? false;
    const elapsed  = (Date.now() - roomState.questionStartedAt) / 1_000;
    const speedPct = Math.max(0, 1 - elapsed / q.timeLimit);
    const myPlayer = players.find((p) => p.playerId === playerId);
    const streak   = myPlayer?.streak ?? 0;

    const base    = correct ? q.points : 0;
    const speed   = correct ? Math.round(speedPct * 50) : 0;
    const sBonus  = correct ? Math.min(streak * 20, 100) : 0;

    useGameStore.getState().setMyAnswer(optionId, correct, base + speed);
    setReaction(correct);

    await submitAnswer(roomId, playerId, q.id, optionId, correct, base + speed, sBonus);
  };

  const clearReaction = useCallback(() => setReaction(null), []);

  if (!roomState) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#020408' }}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
    </div>
  );

  const currentPhase    = getPhase(roomState.phase);
  const phaseQuestions  = getQuestionsForPhase(roomState.phase, roomId);
  const currentQuestion = phaseQuestions[roomState.currentQuestion];
  const sortedPlayers   = [...players].sort((a, b) => b.score - a.score);

  const stormActive  = uiStage === 'reviewing' && (useGameStore.getState().lastAnswerCorrect === false);
  const goldenActive = uiStage === 'reviewing' && (useGameStore.getState().lastAnswerCorrect === true);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* ── Layer 0: Animated ocean ── */}
      <OceanCanvas stormActive={stormActive} goldenActive={goldenActive} />

      {/* ── Layer 1: World map ── */}
      <WorldMapBackground currentPhase={roomState.phase} />

      {/* ── Layer 2: Route system ── */}
      <div className="absolute inset-0 z-10">
        <RouteSystem
          currentPhase={roomState.phase}
          completedPhases={roomState.phase}
        />
      </div>

      {/* ── Layer 2: Player ships ── */}
      <PlayerShipLayer players={sortedPlayers} myPlayerId={playerId ?? ''} />

      {/* ── Layer 3: Cinematic vignette ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-25"
        style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(2,4,10,0.50) 100%)' }} />

      {/* ── Layer 4: Game UI (phase intro, questions) ── */}
      <AnimatePresence mode="wait">
        {uiStage === 'syncing' && (
          <motion.div key="sync"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(2,4,8,0.9)' }}>
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
            <p className="text-sm text-parchment/40">Đang đồng bộ hành trình...</p>
          </motion.div>
        )}

        {uiStage === 'phase_intro' && (
          <PhaseIntro key={`intro-${roomState.phase}`} phase={currentPhase} />
        )}

        {(uiStage === 'question' || uiStage === 'reviewing') && currentQuestion && (
          <CinematicQuestion
            key={`q-${roomState.phase}-${roomState.currentQuestion}`}
            question={currentQuestion}
            phase={currentPhase}
            roomState={roomState}
            onAnswer={handleAnswer}
            isReviewing={uiStage === 'reviewing'}
            questionIndex={roomState.currentQuestion}
            totalQuestions={phaseQuestions.length}
          />
        )}
      </AnimatePresence>

      {/* ── Layer 5: Ocean reaction FX ── */}
      <OceanReactions correct={reactionResult} onDone={clearReaction} />

      {/* ── Layer 6: Persistent HUD ── */}
      {uiStage !== 'syncing' && uiStage !== 'phase_intro' && (
        <OceanHUD
          currentPhase={roomState.phase}
          players={sortedPlayers}
          myPlayerId={playerId ?? ''}
          isReviewing={uiStage === 'reviewing'}
        />
      )}
    </div>
  );
}
