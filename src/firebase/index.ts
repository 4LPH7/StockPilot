'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    const app = getApp();
    const services = getSdks(app);
    firebaseApp = services.firebaseApp;
    auth = services.auth;
    firestore = services.firestore;
  }
  
  return { firebaseApp, auth, firestore };
}

let emulatorsConnected = false;

export function getSdks(firebaseApp: FirebaseApp) {
  const authInstance = getAuth(firebaseApp);
  const firestoreInstance = getFirestore(firebaseApp);

  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' &&
    typeof window !== 'undefined' &&
    !emulatorsConnected
  ) {
    try {
      connectFirestoreEmulator(firestoreInstance, 'localhost', 8080);
      connectAuthEmulator(authInstance, 'http://localhost:9099');
      emulatorsConnected = true;
    } catch {
      // Ignore if already connected in hot-reload
    }
  }

  return {
    firebaseApp,
    auth: authInstance,
    firestore: firestoreInstance,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
