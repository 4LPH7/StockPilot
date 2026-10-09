'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    try {
      if (!firebaseConfig.apiKey) {
        console.warn("StockPilot: No Firebase API key configured.");
        return { firebaseApp: null, auth: null, firestore: null };
      }
      if (!getApps().length) {
        initializeApp(firebaseConfig);
      }
      const app = getApp();
      const services = getSdks(app);
      firebaseApp = services.firebaseApp;
      auth = services.auth;
      firestore = services.firestore;
    } catch (error) {
      console.error("StockPilot: Error initializing Firebase:", error);
      return { firebaseApp: null, auth: null, firestore: null };
    }
  }
  
  return { firebaseApp, auth, firestore };
}

let emulatorsConnected = false;

export function getSdks(app: FirebaseApp) {
  let authInstance: Auth | null = null;
  let firestoreInstance: Firestore | null = null;

  try {
    authInstance = getAuth(app);
  } catch (error) {
    console.error("StockPilot: Error initializing Auth SDK:", error);
  }

  try {
    firestoreInstance = getFirestore(app);
  } catch (error) {
    console.error("StockPilot: Error initializing Firestore SDK:", error);
  }

  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' &&
    typeof window !== 'undefined' &&
    !emulatorsConnected &&
    authInstance &&
    firestoreInstance
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
    firebaseApp: app,
    auth: authInstance as Auth,
    firestore: firestoreInstance as Firestore,
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
