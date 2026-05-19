'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createRoom, joinRoom, getRoomState, ensureAnonymousAuth } from '@/lib/firebase/firestore';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { useGameStore } from '@/stores/gameStore';
import { cinematicEase } from '@/animations/transitions';

type Mode = 'select' | 'join' | 'create';

function friendlyError(e: unknown): string {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();

  if (msg.includes('configuration_not_found') || msg.includes('auth/'))
    return '❌ Anonymous Auth chưa bật — vào Firebase Console > Authentication > Anonymous > Enable';

  if (msg.includes('firestore') || msg.includes('cloud firestore') || msg.includes('has not been used'))
    return '❌ Firestore chưa tạo — vào Firebase Console > Firestore > Create database';

  if (msg.includes('permission-denied') || msg.includes('missing or insufficient'))
    return '❌ Firestore rules chưa cho phép — chuyển sang Test mode trong Console';

  if (msg.includes('unavailable') || msg.includes('network'))
    return '❌ Mất kết nối mạng — kiểm tra internet';

  if (msg.includes('quota'))
    return '❌ Firebase quota vượt giới hạn miễn phí';

  // Log lỗi thật để debug
  console.error('[JoinForm error]', e);
  return `❌ Lỗi: ${(e instanceof Error ? e.message : String(e)).substring(0, 120)}`;
}

export function JoinForm() {
  const router = useRouter();
  const { setPlayerId, setNickname, setIsHost } = useGameStore((s) => s);

  // Firebase chưa setup — hiện hướng dẫn
  if (!isFirebaseConfigured) {
    return <FirebaseSetupGuide />;
  }

  const [mode, setMode]         = useState<Mode>('select');
  const [nickname, setNick]     = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const validateNickname = () => {
    if (!nickname.trim()) return 'Nhập nickname của bạn';
    if (nickname.trim().length < 2) return 'Nickname ít nhất 2 ký tự';
    if (nickname.trim().length > 20) return 'Nickname tối đa 20 ký tự';
    return '';
  };

  const handleCreate = async () => {
    const err = validateNickname();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      const uid    = await ensureAnonymousAuth();
      const roomId = await createRoom(uid, nickname.trim());
      setPlayerId(uid);
      setNickname(nickname.trim());
      setIsHost(true);
      sessionStorage.setItem('hj_nickname', nickname.trim());
      router.push(`/game/lobby/${roomId}`);
    } catch (e: unknown) {
      const msg = friendlyError(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const err = validateNickname();
    if (err) { setError(err); return; }
    if (!roomCode.trim()) { setError('Nhập mã phòng'); return; }
    setLoading(true);
    setError('');
    try {
      const uid   = await ensureAnonymousAuth();
      const code  = roomCode.toUpperCase().trim();
      const state = await getRoomState(code);
      if (!state) { setError('Mã phòng không tồn tại'); setLoading(false); return; }
      if (state.status !== 'waiting') { setError('Phòng đã bắt đầu — không thể tham gia'); setLoading(false); return; }
      await joinRoom(code, uid, nickname.trim(), false);
      setPlayerId(uid);
      setNickname(nickname.trim());
      setIsHost(false);
      sessionStorage.setItem('hj_nickname', nickname.trim());
      router.push(`/game/lobby/${code}`);
    } catch (e: unknown) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-parchment/30 focus:border-gold/50 focus:ring-1 focus:ring-gold/20';
  const inputStyle = {
    background: 'rgba(6,9,16,0.6)',
    borderColor: 'rgba(196,138,40,0.25)',
    color: 'var(--parchment)',
    backdropFilter: 'blur(8px)',
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
      style={{
        background: 'rgba(14,26,40,0.85)',
        border: '1px solid rgba(196,138,40,0.22)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Shimmer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background:
            'linear-gradient(138deg, rgba(196,138,40,0.08) 0%, transparent 40%, rgba(140,24,24,0.06) 100%)',
        }}
      />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: cinematicEase }}
              className="space-y-4"
            >
              <p className="mb-6 text-center text-sm text-parchment/60">
                Chọn cách tham gia hành trình
              </p>
              <button
                onClick={() => setMode('create')}
                className="group w-full rounded-2xl py-4 text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(140,24,24,0.8), rgba(154,28,28,0.6))',
                  border: '1px solid rgba(140,24,24,0.5)',
                  color: 'var(--parchment)',
                }}
              >
                <span className="mr-2 text-base">⚓</span>Tạo phòng mới
                <span className="ml-2 text-parchment/40 text-xs">(Host)</span>
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full rounded-2xl py-4 text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(196,138,40,0.12)',
                  border: '1px solid rgba(196,138,40,0.3)',
                  color: 'var(--parchment)',
                }}
              >
                <span className="mr-2">🌊</span>Tham gia phòng
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: cinematicEase }}
              className="space-y-4"
            >
              <h2 className="mb-4 text-center font-cinzel text-lg font-bold text-parchment">
                Tham gia hành trình
              </h2>
              <div>
                <label className="mb-1.5 block text-xs text-parchment/50">Nickname</label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ví dụ: Người Cứu Quốc"
                  value={nickname}
                  onChange={(e) => setNick(e.target.value)}
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-parchment/50">Mã phòng</label>
                <input
                  className={`${inputClass} tracking-[0.3em] uppercase`}
                  style={inputStyle}
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
              </div>
              {error && <p className="text-xs text-crimson">{error}</p>}
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--crimson), var(--red-accent))',
                  color: 'var(--parchment)',
                }}
              >
                {loading ? 'Đang kết nối...' : 'Tham gia →'}
              </button>
              <button onClick={() => { setMode('select'); setError(''); }} className="w-full text-xs text-parchment/40 hover:text-parchment/60">
                ← Quay lại
              </button>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: cinematicEase }}
              className="space-y-4"
            >
              <h2 className="mb-4 text-center font-cinzel text-lg font-bold text-parchment">
                Tạo phòng mới
              </h2>
              <div>
                <label className="mb-1.5 block text-xs text-parchment/50">Nickname của bạn (Host)</label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Tên của bạn"
                  value={nickname}
                  onChange={(e) => setNick(e.target.value)}
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              {error && <p className="text-xs text-crimson">{error}</p>}
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--crimson), var(--red-accent))',
                  color: 'var(--parchment)',
                }}
              >
                {loading ? 'Đang tạo phòng...' : 'Tạo phòng ⚓'}
              </button>
              <button onClick={() => { setMode('select'); setError(''); }} className="w-full text-xs text-parchment/40 hover:text-parchment/60">
                ← Quay lại
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FirebaseSetupGuide() {
  const steps = [
    { num: '1', text: 'Truy cập console.firebase.google.com' },
    { num: '2', text: 'Tạo project mới (miễn phí)' },
    { num: '3', text: 'Bật Firestore Database + Anonymous Auth' },
    { num: '4', text: 'Project Settings → Your Apps → lấy config' },
    { num: '5', text: 'Tạo file .env.local và điền credentials' },
  ];
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
      style={{
        background: 'rgba(14,26,40,0.85)',
        border: '1px solid rgba(196,138,40,0.22)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: 'linear-gradient(138deg, rgba(196,138,40,0.06) 0%, transparent 50%)' }}
      />
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber" />
          <p className="text-xs font-semibold uppercase tracking-widest text-amber">
            Firebase chưa được cấu hình
          </p>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-parchment/60">
          Trò chơi multiplayer cần Firebase để hoạt động. Làm theo các bước sau:
        </p>
        <ol className="mb-5 space-y-3">
          {steps.map((s) => (
            <li key={s.num} className="flex items-start gap-3">
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(196,138,40,0.2)', color: 'var(--gold)' }}
              >
                {s.num}
              </span>
              <span className="text-xs leading-5 text-parchment/70">{s.text}</span>
            </li>
          ))}
        </ol>
        <div
          className="rounded-xl p-4 font-mono text-[11px] leading-relaxed"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(232,210,168,0.6)' }}
        >
          <p className="mb-1 text-parchment/30"># .env.local</p>
          <p>NEXT_PUBLIC_FIREBASE_API_KEY=<span className="text-amber">your_api_key</span></p>
          <p>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<span className="text-amber">your_domain</span></p>
          <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID=<span className="text-amber">your_project_id</span></p>
          <p>NEXT_PUBLIC_FIREBASE_APP_ID=<span className="text-amber">your_app_id</span></p>
        </div>
        <p className="mt-4 text-center text-xs text-parchment/30">
          Sau khi thêm .env.local → restart server → chơi được ngay
        </p>
      </div>
    </div>
  );
}
