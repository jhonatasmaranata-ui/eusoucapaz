/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  memoryLocalCache,
  Firestore
} from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

// Detect if running inside the AI Studio sandbox environment or local developer preview
const isSandbox = typeof window !== 'undefined' && (
  window.location.hostname.includes('.run.app') ||
  window.location.hostname.includes('localhost') ||
  window.location.hostname.includes('127.0.0.1')
);

// Detect if custom environmental database settings are supplied manually
const isCustomFirebase = !!metaEnv.VITE_FIREBASE_PROJECT_ID;

// Use production Firebase settings by default so both local editor and production site use the same database
const defaultFirebaseConfig = {
  apiKey: "AIzaSyAse59UA8pmZAT1qxdWm2-Ycip3lIdXaQQ",
  authDomain: "eusoucapazapp.firebaseapp.com",
  projectId: "eusoucapazapp",
  storageBucket: "eusoucapazapp.appspot.com",
  messagingSenderId: "333791338575",
  appId: "1:333791338575:web:531720d20ef0d1964f434a",
};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || (isSandbox ? appletConfig.apiKey : defaultFirebaseConfig.apiKey),
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || (isSandbox ? appletConfig.authDomain : defaultFirebaseConfig.authDomain),
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || (isSandbox ? appletConfig.projectId : defaultFirebaseConfig.projectId),
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || (isSandbox ? appletConfig.storageBucket : defaultFirebaseConfig.storageBucket),
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || (isSandbox ? appletConfig.messagingSenderId : defaultFirebaseConfig.messagingSenderId),
  appId: metaEnv.VITE_FIREBASE_APP_ID || (isSandbox ? appletConfig.appId : defaultFirebaseConfig.appId),
};

const app = initializeApp(firebaseConfig);

// Use production default database
let databaseId = metaEnv.VITE_FIREBASE_DATABASE_ID || (isSandbox ? appletConfig.firestoreDatabaseId : undefined);

// LocalStorage override for database recovery (allows recovery to '(default)' if named instance times out)
if (typeof window !== 'undefined') {
  try {
    const localOverride = localStorage.getItem('es_capaz_database_id_override');
    if (localOverride === 'default') {
      databaseId = undefined;
    } else if (localOverride && localOverride.trim()) {
      databaseId = localOverride.trim();
    }
  } catch (_) {}
}

let initializedDb: Firestore;
console.log("[Firebase Init] Initializing Firestore with databaseId:", databaseId || '(default)');
try {
  initializedDb = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalForceLongPolling: true,
    useFetchStreams: false
  } as any, databaseId);
} catch (cacheError) {
  console.warn("Could not enable memory local cache, falling back to standard Firestore:", cacheError);
  try {
    initializedDb = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false
    } as any, databaseId);
  } catch (_) {
    initializedDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
}

export const db = initializedDb;
export const auth = getAuth();

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
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
