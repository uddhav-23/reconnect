import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDXSfRWqFWEzOuWEGi6huJrDprYA6WisEk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'reconnect-8dbfa.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'reconnect-8dbfa',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'reconnect-8dbfa.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1000288279740',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1000288279740:web:868891ef9b5868cd0a44b9',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-JFWXSKT3X2',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/** Secondary Firebase app + Auth — creating users here does not change the primary signed-in session. */
const PROVISIONER_NAME = 'CredentialProvisioner';
function getCredentialProvisionerApp() {
  try {
    return getApp(PROVISIONER_NAME);
  } catch {
    return initializeApp(firebaseConfig, PROVISIONER_NAME);
  }
}
export const credentialProvisionerApp = getCredentialProvisionerApp();
export const credentialProvisionerAuth = getAuth(credentialProvisionerApp);

export default app;
