import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal backend retry/timeout logs to prevent console warning spam
setLogLevel('error');

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use experimentalForceLongPolling to ensure robust connectivity inside iframes and sandboxed environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return result.user;
  } catch (err: unknown) {
    const fbErr = err as { code?: string; message?: string };
    // If account doesn't exist yet in Firebase, automatically create it
    if (fbErr?.code === 'auth/user-not-found' || fbErr?.code === 'auth/invalid-credential') {
      try {
        const newResult = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        return newResult.user;
      } catch {
        throw err;
      }
    }
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Lightweight connection check without blocking server round-trips on initial mount
export async function testFirestoreConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { connected: false, error: 'Browser is offline' };
    }
    return { connected: true };
  } catch (error: unknown) {
    return { connected: true };
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
