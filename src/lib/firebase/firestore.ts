import {
  doc, collection, setDoc, updateDoc, getDoc,
  onSnapshot, increment,
  type Unsubscribe,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { requireDb, requireAuth } from './config';
import type { RoomState, PlayerState, GameStatus } from '@/types/game';

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function ensureAnonymousAuth(): Promise<string> {
  const auth = requireAuth();
  if (auth.currentUser) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

// ─── Room Code ─────────────────────────────────────────────────────────────

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// ─── Room CRUD ─────────────────────────────────────────────────────────────

export async function createRoom(hostId: string, nickname: string): Promise<string> {
  const db   = requireDb();
  const roomId = generateRoomCode();
  const now    = Date.now();

  await setDoc(doc(db, 'rooms', roomId), {
    roomId,
    hostId,
    status: 'waiting' as GameStatus,
    phase: 0,
    currentQuestion: 0,
    countdown: 0,
    questionStartedAt: 0,
    createdAt: now,
    maxPlayers: 30,
    answeredCount: 0,
  } satisfies RoomState);

  await joinRoom(roomId, hostId, nickname, true);
  return roomId;
}

export async function joinRoom(
  roomId: string,
  playerId: string,
  nickname: string,
  isHost = false,
): Promise<void> {
  const db  = requireDb();
  const now = Date.now();
  await setDoc(doc(db, 'rooms', roomId, 'players', playerId), {
    playerId,
    nickname,
    score: 0,
    streak: 0,
    glowLevel: 20,
    answers: {},
    ready: false,
    isOnline: true,
    isHost,
    joinedAt: now,
    lastSeen: now,
    totalCorrect: 0,
    totalAnswered: 0,
  } satisfies PlayerState);
}

export async function getRoomState(roomId: string): Promise<RoomState | null> {
  const db   = requireDb();
  const snap = await getDoc(doc(db, 'rooms', roomId));
  return snap.exists() ? (snap.data() as RoomState) : null;
}

// ─── Game Control (host only) ───────────────────────────────────────────────

export async function startCountdown(roomId: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'rooms', roomId), {
    status: 'countdown',
    countdown: 5,
    startedAt: Date.now(),
  });
}

export async function advanceToPhaseIntro(roomId: string, phase: number): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'rooms', roomId), {
    status: 'phase_intro',
    phase,
    currentQuestion: 0,
    answeredCount: 0,
  });
}

export async function startQuestion(
  roomId: string,
  questionIndex: number,
  timeLimit: number,
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'rooms', roomId), {
    status: 'question',
    currentQuestion: questionIndex,
    countdown: timeLimit,
    questionStartedAt: Date.now(),
    answeredCount: 0,
  });
}

export async function startReviewing(roomId: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'rooms', roomId), { status: 'reviewing' });
}

export async function endGame(roomId: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'rooms', roomId), {
    status: 'result',
    endedAt: Date.now(),
  });
}

// ─── Player Actions ─────────────────────────────────────────────────────────

export async function submitAnswer(
  roomId: string,
  playerId: string,
  questionId: string,
  optionId: string,
  isCorrect: boolean,
  pointsEarned: number,
  streakBonus: number,
): Promise<void> {
  const db        = requireDb();
  const playerRef = doc(db, 'rooms', roomId, 'players', playerId);

  await updateDoc(playerRef, {
    [`answers.${questionId}`]: optionId,
    score: increment(pointsEarned + streakBonus),
    streak: isCorrect ? increment(1) : 0,
    glowLevel: isCorrect ? increment(15) : increment(-10),
    totalAnswered: increment(1),
    ...(isCorrect && { totalCorrect: increment(1) }),
    lastSeen: Date.now(),
  });

  await updateDoc(doc(db, 'rooms', roomId), {
    answeredCount: increment(1),
  });
}

export async function updatePresence(roomId: string, playerId: string): Promise<void> {
  try {
    const db = requireDb();
    await updateDoc(doc(db, 'rooms', roomId, 'players', playerId), {
      isOnline: true,
      lastSeen: Date.now(),
    });
  } catch {}
}

export async function markOffline(roomId: string, playerId: string): Promise<void> {
  try {
    const db = requireDb();
    await updateDoc(doc(db, 'rooms', roomId, 'players', playerId), {
      isOnline: false,
      lastSeen: Date.now(),
    });
  } catch {}
}

export async function setPlayerReady(roomId: string, playerId: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'rooms', roomId, 'players', playerId), { ready: true });
}

// ─── Realtime Subscriptions ─────────────────────────────────────────────────

export function subscribeRoom(
  roomId: string,
  onUpdate: (state: RoomState) => void,
): Unsubscribe {
  const db = requireDb();
  return onSnapshot(doc(db, 'rooms', roomId), (snap) => {
    if (snap.exists()) onUpdate(snap.data() as RoomState);
  });
}

export function subscribePlayers(
  roomId: string,
  onUpdate: (players: PlayerState[]) => void,
): Unsubscribe {
  const db = requireDb();
  return onSnapshot(collection(db, 'rooms', roomId, 'players'), (snap) => {
    const players = snap.docs.map((d) => d.data() as PlayerState);
    onUpdate(players);
  });
}
