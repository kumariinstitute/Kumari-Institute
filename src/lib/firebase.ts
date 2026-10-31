import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore, doc, getDoc, setLogLevel, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

import firebaseAppletConfig from "../../firebase-applet-config.json";

// Silence noisy internal network retry messages from the Firebase SDK
try {
  setLogLevel("silent");
} catch {
  // Ignore if already set
}

// Your web app's Firebase configuration
// Primary and only Cloud Firestore database for the website
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyBKapNAJTeUYMdHGDe5hb6L4RTQ5u4ALQU",
  authDomain: firebaseAppletConfig.authDomain || "kumari-2512d.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "kumari-2512d",
  storageBucket: firebaseAppletConfig.storageBucket || "kumari-2512d.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "899188453613",
  appId: firebaseAppletConfig.appId || "1:899188453613:web:3833e121236cd60f4d5ce4",
  measurementId: firebaseAppletConfig.measurementId || ""
};

// Initialize Firebase app singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// New Cloud Firestore Database ID from configuration
export const FIRESTORE_DATABASE_ID =
  firebaseAppletConfig.firestoreDatabaseId ||
  "ai-studio-kumariinstitute-1c3e9f63-3db3-4c82-b109-cfe8f156bf1a";

// Primary Cloud Firestore Database Instance targeting the new database
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

// One and only primary Firestore database
export const db = firestoreInstance;
export const defaultDb = db;
export const allDbInstances = [db];

// Real-time connection status state for UI feedback
export interface FirestoreConnectionState {
  connected: boolean;
  databaseId: string;
  projectId: string;
  error?: string;
  lastChecked?: string;
}

/**
 * Check real-time Firestore connectivity to the primary database
 */
export async function verifyFirestoreConnection(): Promise<FirestoreConnectionState> {
  try {
    const probeRef = doc(db, "_health_check", "_probe");
    await getDoc(probeRef);

    return {
      connected: true,
      databaseId: FIRESTORE_DATABASE_ID,
      projectId: firebaseConfig.projectId,
      lastChecked: new Date().toISOString()
    };
  } catch (err: any) {
    const errCode = err?.code || '';
    const errMsg = err?.message || '';
    let friendlyError = '';
    if (errCode === 'permission-denied' || errMsg.includes('insufficient permissions')) {
      friendlyError = 'Firebase Rules: Please verify open read/write security rules in your Firebase Console for kumari-2512d.';
    } else {
      friendlyError = errMsg || 'Connecting to primary Cloud Firestore...';
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
