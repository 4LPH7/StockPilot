'use client';

import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';

/** Initiate Google popup sign-in */
export async function initiateGoogleSignIn(authInstance: Auth) {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
}

/** Initiate sign-out */
export async function initiateSignOut(authInstance: Auth) {
  return signOut(authInstance);
}

/** Initiate anonymous sign-in */
export async function initiateAnonymousSignIn(authInstance: Auth) {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string) {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
  return signInWithEmailAndPassword(authInstance, email, password);
}
