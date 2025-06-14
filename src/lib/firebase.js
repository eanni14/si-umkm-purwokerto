// Import fungsi yang dibutuhkan dari Firebase SDK
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- Tambahkan ini

// Konfigurasi Firebase Anda dari file .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inisialisasi Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Ekspor service Firebase yang akan digunakan
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- Tambahkan dan ekspor ini

export default app;
