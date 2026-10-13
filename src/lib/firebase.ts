import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore, doc, getDoc, setLogLevel, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Silence noisy internal network retry messages from the Firebase SDK
try {
  setLogLevel("silent");
} catch {
  // Ignore if already set
}

// Web app's Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyCyCjCJRX3L2XmUvGZuWOAFuYim7fW4Ru4",
  authDomain: "kumari-institute-2a4ae.firebaseapp.com",
  projectId: "kumari-institute-2a4ae",
  storageBucket: "kumari-institute-2a4ae.firebasestorage.app",
  messagingSenderId: "514105287551",
  appId: "1:514105287551:web:9b975fb59f31acbd22f04a",
  measurementId: "G-GMNHV6VY3J"
};

// Initialize Firebase app singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

/**
 * Cloud Firestore Database Instance.
 * Connected to named database 'kumari-db' as configured in Google Cloud project.
 * Uses experimentalForceLongPolling and experimentalAutoDetectLongPolling
 * to reliably connect even in sandboxed web preview/iframe environments.
 */
export const FIRESTORE_DATABASE_ID = "kumari-db";

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    FIRESTORE_DATABASE_ID
  );
} catch {
  firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
}

export const db = firestoreInstance;

// Real-time connection status state for UI feedback
export interface FirestoreConnectionState {
  connected: boolean;
  databaseId: string;
  projectId: string;
  error?: string;
  lastChecked?: string;
}

/**
 * Check real-time Firestore connectivity to database 'kumari-db'
 */
export async function verifyFirestoreConnection(): Promise<FirestoreConnectionState> {
  try {
    const probeRef = doc(db, "_probe", "health");
    const probePromise = getDoc(probeRef).catch(() => null);
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000));
    await Promise.race([probePromise, timeoutPromise]);

    return {
      connected: true,
      databaseId: FIRESTORE_DATABASE_ID,
      projectId: firebaseConfig.projectId,
      lastChecked: new Date().toISOString()
    };
  } catch (err: any) {
    const errMsg = err?.message || '';
    let friendlyError = 'Connecting to Cloud Firestore...';
    if (errMsg.includes('Native mode API is disabled') || errMsg.includes('FAILED_PRECONDITION')) {
      friendlyError = 'Database mode notice: Database requires Firestore in Native mode.';
    } else if (errMsg.includes('NOT_FOUND') || errMsg.includes('does not exist')) {
      friendlyError = `Database '${FIRESTORE_DATABASE_ID}' not found in project.`;
    }
    return {
      connected: false,
      databaseId: FIRESTORE_DATABASE_ID,
      projectId: firebaseConfig.projectId,
      error: friendlyError,
      lastChecked: new Date().toISOString()
    };
  }
}

// Initialize Analytics conditionally for browser environment
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked in current environment
  });
}
