import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Guard: chỉ khởi tạo khi có đủ credentials
export const isFirebaseConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== '' &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== ''
);

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    const cfg = {
      apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    _app  = getApps().length === 0 ? initializeApp(cfg) : getApp();
    _db   = getFirestore(_app);
    _auth = getAuth(_app);
  } catch (e) {
    console.warn('[Firebase] Init failed:', e);
  }
}

// Throw với message rõ ràng khi dùng mà chưa configure
export function requireDb(): Firestore {
  if (!_db) throw new Error('Firebase chưa được cấu hình. Xem hướng dẫn trong JoinForm.');
  return _db;
}
export function requireAuth(): Auth {
  if (!_auth) throw new Error('Firebase chưa được cấu hình.');
  return _auth;
}

export const db   = _db;
export const auth = _auth;
export default _app;
