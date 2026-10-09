'use client';

import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<any>(null);

  useEffect(() => {
    // Initialize Firebase on the client side, once per component mount.
    try {
      const init = initializeFirebase();
      setServices(init);
    } catch (err) {
      console.error("StockPilot: Failed to initialize Firebase:", err);
      setServices({ firebaseApp: null, auth: null, firestore: null });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!services) {
    // Render nothing or a loading spinner while Firebase is initializing
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
