'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Check if we're on the client side and if Firebase hasn't been initialized yet.
  if (typeof window !== 'undefined' && !getApps().length) {
    // Firebase initialization is safe to run on the client.
    let firebaseApp;
    try {
      // For Firebase App Hosting, this will be initialized automatically.
      firebaseApp = initializeApp();
    } catch (e) {
      // For other environments (like local dev or Netlify), fall back to the config object.
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  } else if (getApps().length) {
    // If already initialized, return the existing instance.
    return getSdks(getApp());
  }
  
  // On the server, return a non-initialized structure to avoid errors.
  // The app will function correctly once it hydrates on the client.
  return { firebaseApp: null, auth: null, firestore: null };
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
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