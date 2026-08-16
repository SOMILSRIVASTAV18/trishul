import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import type { Customer, Lead, Task, Employee, CompanySettings, ActivityLog, UserProfile } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Format Firebase Auth error messages into user-friendly instructions
export function formatFirebaseAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred during authentication.';
  const code = error.code || '';
  const msg = error.message || '';

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    msg.includes('popup-closed-by-user') ||
    msg.includes('cancelled-popup-request') ||
    msg.includes('Pending promise was never set')
  ) {
    return 'Google sign-in popup was closed or cancelled.';
  }

  switch (code) {
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'Email authentication is disabled in your Firebase console. Please enable Email/Password under Authentication > Sign-in method in Firebase Console, or sign in via Google SSO.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in or use "Forget Password?" to reset your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address (e.g. name@company.com).';
    case 'auth/missing-email':
      return 'Please provide your registered email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
    case 'auth/user-not-found':
      return 'No registered account found with this email address. Please verify your email or register a new account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials or register a new account.';
    case 'auth/too-many-requests':
      return 'Access temporarily restricted due to multiple attempts. Please wait 1-2 minutes before retrying.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in window was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connectivity and try again.';
    default:
      return error.message || 'Authentication request failed. Please verify your credentials and try again.';
  }
}

// Default base settings if Firestore settings collection is uninitialized
export const defaultCompanySettings: CompanySettings = {
  companyName: "TRISHUL CRM",
  tagline: "Customer Relationship Management",
  email: "contact@trishulcrm.com",
  phone: "+91 98765 43210",
  address: "India",
  currencySymbol: "₹",
  taxNumber: "",
  website: "https://trishulcrm.com",
  enableAiAssistant: true,
  theme: "dark"
};

// Initialize Firestore general settings if missing
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, 'settings', 'general'), defaultCompanySettings);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Firestore settings check:', err);
    return false;
  }
}

// Live database health checker
export async function checkFirestoreConnection(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const testDoc = doc(db, 'settings', 'general');
    await setDoc(testDoc, { lastPingAt: new Date().toISOString() }, { merge: true });
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, error: err?.message || 'Connection failed' };
  }
}
