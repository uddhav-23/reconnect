import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
// Get these values from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyDXSfRWqFWEzOuWEGi6huJrDprYA6WisEk",
    authDomain: "reconnect-8dbfa.firebaseapp.com",
    projectId: "reconnect-8dbfa",
    storageBucket: "reconnect-8dbfa.firebasestorage.app",
    messagingSenderId: "1000288279740",
    appId: "1:1000288279740:web:868891ef9b5868cd0a44b9",
    measurementId: "G-JFWXSKT3X2"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

