import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC7W__Et-4yqjyjDQBzEtmUU-omdTkrr1A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gigcraft-marketplace.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gigcraft-marketplace",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gigcraft-marketplace.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "207597155969",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:207597155969:web:57f1e3b52e1b9a3c6e3f80",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FQ9NBLY1YC",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
